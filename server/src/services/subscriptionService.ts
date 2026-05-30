import { db, logAuditAction } from '../lib/db';
import { createError } from '../middleware/errorHandler';
import { createPaginationResult } from '../lib/utils';

type PaginationParams = { page: number; limit: number; skip: number };

// ── Plan CRUD ─────────────────────────────────────────────────────

export const getPlans = async (onlyActive = false) => {
  const where = onlyActive ? { isActive: true } : {};
  return db.subscriptionPlan.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
};

export const getPlanBySlug = async (slug: string) => {
  const plan = await db.subscriptionPlan.findUnique({ where: { slug } });
  if (!plan) throw createError('Plan not found', 404);
  return plan;
};

export const getPlanById = async (id: string) => {
  const plan = await db.subscriptionPlan.findUnique({ where: { id } });
  if (!plan) throw createError('Plan not found', 404);
  return plan;
};

export const createPlan = async (data: any, actorId: string, ip?: string, ua?: string) => {
  const plan = await db.subscriptionPlan.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price || 0,
      duration: data.duration || 'MONTHLY',
      features: data.features || [],
      jobLimit: data.jobLimit ?? null,
      featuredJobLimit: data.featuredJobLimit ?? null,
      sortOrder: data.sortOrder || 0,
      isActive: data.isActive ?? true,
    },
  });

  logAuditAction({
    actorId, action: 'PLAN_CREATED', entity: 'SubscriptionPlan',
    entityId: plan.id, metadata: { name: plan.name, slug: plan.slug },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return plan;
};

export const updatePlan = async (id: string, data: any, actorId: string, ip?: string, ua?: string) => {
  const existing = await db.subscriptionPlan.findUnique({ where: { id } });
  if (!existing) throw createError('Plan not found', 404);

  const plan = await db.subscriptionPlan.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      duration: data.duration,
      features: data.features,
      jobLimit: data.jobLimit,
      featuredJobLimit: data.featuredJobLimit,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });

  logAuditAction({
    actorId, action: 'PLAN_UPDATED', entity: 'SubscriptionPlan',
    entityId: id, metadata: { before: existing.name, after: plan.name },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return plan;
};

export const deletePlan = async (id: string, actorId: string, ip?: string, ua?: string) => {
  const existing = await db.subscriptionPlan.findUnique({ where: { id } });
  if (!existing) throw createError('Plan not found', 404);

  const subs = await db.employerSubscription.count({ where: { planId: id, status: 'ACTIVE' } });
  if (subs > 0) throw createError('Cannot delete plan with active subscriptions', 400);

  await db.subscriptionPlan.delete({ where: { id } });

  logAuditAction({
    actorId, action: 'PLAN_DELETED', entity: 'SubscriptionPlan',
    entityId: id, metadata: { name: existing.name },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});
};

// ── Subscription lifecycle ────────────────────────────────────────

export const subscribe = async (employerId: string, planId: string) => {
  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId, isActive: true } });
  if (!plan) throw createError('Plan not found or inactive', 404);

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + (plan.duration === 'YEARLY' ? 12 : 1));

  const sub = await db.employerSubscription.upsert({
    where: { employerId },
    create: {
      employerId,
      planId: plan.id,
      status: 'PENDING',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    update: {
      planId: plan.id,
      status: 'PENDING',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialEndsAt: null,
      cancelledAt: null,
      autoRenew: true,
    },
  });

  return sub;
};

export const activateSubscription = async (id: string, actorId: string, ip?: string, ua?: string) => {
  const sub = await db.employerSubscription.findUnique({
    where: { id },
    include: { plan: true },
  });
  if (!sub) throw createError('Subscription not found', 404);
  if (sub.status === 'ACTIVE') throw createError('Subscription already active', 400);

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + (sub.plan.duration === 'YEARLY' ? 12 : 1));

  const updated = await db.employerSubscription.update({
    where: { id },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  logAuditAction({
    actorId, action: 'SUBSCRIPTION_ACTIVATED', entity: 'EmployerSubscription',
    entityId: id, metadata: { employerId: sub.employerId, plan: sub.plan.name },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return updated;
};

export const cancelSubscription = async (id: string, actorId: string, ip?: string, ua?: string) => {
  const sub = await db.employerSubscription.findUnique({ where: { id }, include: { plan: true } });
  if (!sub) throw createError('Subscription not found', 404);
  if (sub.status === 'CANCELLED' || sub.status === 'EXPIRED') throw createError('Subscription already ended', 400);

  const updated = await db.employerSubscription.update({
    where: { id },
    data: { status: 'CANCELLED', autoRenew: false, cancelledAt: new Date() },
  });

  logAuditAction({
    actorId, action: 'SUBSCRIPTION_CANCELLED', entity: 'EmployerSubscription',
    entityId: id, metadata: { employerId: sub.employerId, plan: sub.plan.name },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return updated;
};

export const getEmployerSubscription = async (employerId: string) => {
  const sub = await db.employerSubscription.findUnique({
    where: { employerId },
    include: { plan: true },
  });
  if (!sub) return null;

  const activeJobsCount = await db.job.count({
    where: { postedById: employerId, isActive: true, status: { not: 'REJECTED' } },
  });
  const featuredJobsCount = await db.job.count({
    where: { postedById: employerId, isFeatured: true },
  });

  return {
    ...sub,
    usage: {
      jobLimit: sub.plan.jobLimit,
      jobsUsed: activeJobsCount,
      jobsRemaining: sub.plan.jobLimit != null ? Math.max(0, sub.plan.jobLimit - activeJobsCount) : null,
      featuredJobLimit: sub.plan.featuredJobLimit,
      featuredUsed: featuredJobsCount,
      featuredRemaining: sub.plan.featuredJobLimit != null ? Math.max(0, sub.plan.featuredJobLimit - featuredJobsCount) : null,
      features: sub.plan.features as string[],
    },
  };
};

// ── Feature gating helpers ────────────────────────────────────────

export const checkEmployerFeature = async (employerId: string, featureKey: string): Promise<boolean> => {
  const sub = await db.employerSubscription.findUnique({
    where: { employerId },
    include: { plan: true },
  });
  if (!sub || sub.status !== 'ACTIVE') return false;
  const features = sub.plan.features as string[];
  return features.includes(featureKey);
};

export const enforceJobLimit = async (employerId: string) => {
  const sub = await db.employerSubscription.findUnique({
    where: { employerId },
    include: { plan: true },
  });
  if (!sub || sub.status !== 'ACTIVE') return; // no active sub = no gating (free tier)
  if (sub.plan.jobLimit == null) return;

  const activeCount = await db.job.count({
    where: { postedById: employerId, isActive: true, status: { not: 'REJECTED' } },
  });
  if (activeCount >= sub.plan.jobLimit) {
    throw createError(`Job limit reached (${sub.plan.jobLimit}). Upgrade your plan to post more jobs.`, 403);
  }
};

export const enforceFeaturedJobLimit = async (employerId: string) => {
  const sub = await db.employerSubscription.findUnique({
    where: { employerId },
    include: { plan: true },
  });
  if (!sub || sub.status !== 'ACTIVE') {
    throw createError('An active subscription is required to feature jobs.', 403);
  }
  if (sub.plan.featuredJobLimit == null) return;

  const featuredCount = await db.job.count({
    where: { postedById: employerId, isFeatured: true },
  });
  if (featuredCount >= sub.plan.featuredJobLimit) {
    throw createError(`Featured job limit reached (${sub.plan.featuredJobLimit}). Upgrade your plan to feature more jobs.`, 403);
  }
};

// ── Admin list subscriptions ──────────────────────────────────────

export const adminListSubscriptions = async ({ page, limit, skip }: PaginationParams) => {
  const [subs, total] = await Promise.all([
    db.employerSubscription.findMany({
      include: {
        plan: { select: { id: true, name: true, slug: true } },
        employer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    db.employerSubscription.count(),
  ]);
  return createPaginationResult(subs, total, page, limit);
};

// ── Sponsored Companies ───────────────────────────────────────────

export const getSponsoredCompanies = async () => {
  return db.sponsoredCompany.findMany({
    where: { isActive: true, endDate: { gt: new Date() } },
    include: {
      employer: {
        select: { companyName: true, companySlug: true, companyLogo: true, companyDescription: true, industry: true, location: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });
};

export const createSponsoredCompany = async (data: any, actorId: string, ip?: string, ua?: string) => {
  const existing = await db.sponsoredCompany.findUnique({ where: { employerId: data.employerId } });
  if (existing) throw createError('Employer already sponsored', 400);

  const start = data.startDate ? new Date(data.startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + (data.durationDays || 30));

  const sc = await db.sponsoredCompany.create({
    data: {
      employerId: data.employerId,
      startDate: start,
      endDate: end,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder || 0,
    },
  });

  logAuditAction({
    actorId, action: 'SPONSORED_COMPANY_CREATED', entity: 'SponsoredCompany',
    entityId: sc.id, metadata: { employerId: data.employerId },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return sc;
};

export const updateSponsoredCompany = async (id: string, data: any, actorId: string, ip?: string, ua?: string) => {
  const sc = await db.sponsoredCompany.findUnique({ where: { id } });
  if (!sc) throw createError('Sponsored company not found', 404);

  const updated = await db.sponsoredCompany.update({
    where: { id },
    data: {
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });

  logAuditAction({
    actorId, action: 'SPONSORED_COMPANY_UPDATED', entity: 'SponsoredCompany',
    entityId: id, metadata: { employerId: sc.employerId },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return updated;
};

export const deleteSponsoredCompany = async (id: string, actorId: string, ip?: string, ua?: string) => {
  const sc = await db.sponsoredCompany.findUnique({ where: { id } });
  if (!sc) throw createError('Sponsored company not found', 404);

  await db.sponsoredCompany.delete({ where: { id } });

  logAuditAction({
    actorId, action: 'SPONSORED_COMPANY_DELETED', entity: 'SponsoredCompany',
    entityId: id, metadata: { employerId: sc.employerId },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});
};

export const adminListSponsoredCompanies = async ({ page, limit, skip }: PaginationParams) => {
  const [list, total] = await Promise.all([
    db.sponsoredCompany.findMany({
      include: {
        employer: {
          select: { id: true, email: true, companyName: true, companySlug: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
      skip, take: limit,
    }),
    db.sponsoredCompany.count(),
  ]);
  return createPaginationResult(list, total, page, limit);
};
