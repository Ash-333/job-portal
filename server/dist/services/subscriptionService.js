"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListSponsoredCompanies = exports.deleteSponsoredCompany = exports.updateSponsoredCompany = exports.createSponsoredCompany = exports.getSponsoredCompanies = exports.adminListSubscriptions = exports.enforceFeaturedJobLimit = exports.enforceJobLimit = exports.checkEmployerFeature = exports.getEmployerSubscription = exports.cancelSubscription = exports.activateSubscription = exports.subscribe = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlanById = exports.getPlanBySlug = exports.getPlans = void 0;
const db_1 = require("../lib/db");
const errorHandler_1 = require("../middleware/errorHandler");
const utils_1 = require("../lib/utils");
const getPlans = async (onlyActive = false) => {
    const where = onlyActive ? { isActive: true } : {};
    return db_1.db.subscriptionPlan.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
    });
};
exports.getPlans = getPlans;
const getPlanBySlug = async (slug) => {
    const plan = await db_1.db.subscriptionPlan.findUnique({ where: { slug } });
    if (!plan)
        throw (0, errorHandler_1.createError)('Plan not found', 404);
    return plan;
};
exports.getPlanBySlug = getPlanBySlug;
const getPlanById = async (id) => {
    const plan = await db_1.db.subscriptionPlan.findUnique({ where: { id } });
    if (!plan)
        throw (0, errorHandler_1.createError)('Plan not found', 404);
    return plan;
};
exports.getPlanById = getPlanById;
const createPlan = async (data, actorId, ip, ua) => {
    const plan = await db_1.db.subscriptionPlan.create({
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
    (0, db_1.logAuditAction)({
        actorId, action: 'PLAN_CREATED', entity: 'SubscriptionPlan',
        entityId: plan.id, metadata: { name: plan.name, slug: plan.slug },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return plan;
};
exports.createPlan = createPlan;
const updatePlan = async (id, data, actorId, ip, ua) => {
    const existing = await db_1.db.subscriptionPlan.findUnique({ where: { id } });
    if (!existing)
        throw (0, errorHandler_1.createError)('Plan not found', 404);
    const plan = await db_1.db.subscriptionPlan.update({
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
    (0, db_1.logAuditAction)({
        actorId, action: 'PLAN_UPDATED', entity: 'SubscriptionPlan',
        entityId: id, metadata: { before: existing.name, after: plan.name },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return plan;
};
exports.updatePlan = updatePlan;
const deletePlan = async (id, actorId, ip, ua) => {
    const existing = await db_1.db.subscriptionPlan.findUnique({ where: { id } });
    if (!existing)
        throw (0, errorHandler_1.createError)('Plan not found', 404);
    const subs = await db_1.db.employerSubscription.count({ where: { planId: id, status: 'ACTIVE' } });
    if (subs > 0)
        throw (0, errorHandler_1.createError)('Cannot delete plan with active subscriptions', 400);
    await db_1.db.subscriptionPlan.delete({ where: { id } });
    (0, db_1.logAuditAction)({
        actorId, action: 'PLAN_DELETED', entity: 'SubscriptionPlan',
        entityId: id, metadata: { name: existing.name },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
};
exports.deletePlan = deletePlan;
const subscribe = async (employerId, planId) => {
    const plan = await db_1.db.subscriptionPlan.findUnique({ where: { id: planId, isActive: true } });
    if (!plan)
        throw (0, errorHandler_1.createError)('Plan not found or inactive', 404);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (plan.duration === 'YEARLY' ? 12 : 1));
    const sub = await db_1.db.employerSubscription.upsert({
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
exports.subscribe = subscribe;
const activateSubscription = async (id, actorId, ip, ua) => {
    const sub = await db_1.db.employerSubscription.findUnique({
        where: { id },
        include: { plan: true },
    });
    if (!sub)
        throw (0, errorHandler_1.createError)('Subscription not found', 404);
    if (sub.status === 'ACTIVE')
        throw (0, errorHandler_1.createError)('Subscription already active', 400);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (sub.plan.duration === 'YEARLY' ? 12 : 1));
    const updated = await db_1.db.employerSubscription.update({
        where: { id },
        data: {
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        },
    });
    (0, db_1.logAuditAction)({
        actorId, action: 'SUBSCRIPTION_ACTIVATED', entity: 'EmployerSubscription',
        entityId: id, metadata: { employerId: sub.employerId, plan: sub.plan.name },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return updated;
};
exports.activateSubscription = activateSubscription;
const cancelSubscription = async (id, actorId, ip, ua) => {
    const sub = await db_1.db.employerSubscription.findUnique({ where: { id }, include: { plan: true } });
    if (!sub)
        throw (0, errorHandler_1.createError)('Subscription not found', 404);
    if (sub.status === 'CANCELLED' || sub.status === 'EXPIRED')
        throw (0, errorHandler_1.createError)('Subscription already ended', 400);
    const updated = await db_1.db.employerSubscription.update({
        where: { id },
        data: { status: 'CANCELLED', autoRenew: false, cancelledAt: new Date() },
    });
    (0, db_1.logAuditAction)({
        actorId, action: 'SUBSCRIPTION_CANCELLED', entity: 'EmployerSubscription',
        entityId: id, metadata: { employerId: sub.employerId, plan: sub.plan.name },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return updated;
};
exports.cancelSubscription = cancelSubscription;
const getEmployerSubscription = async (employerId) => {
    const sub = await db_1.db.employerSubscription.findUnique({
        where: { employerId },
        include: { plan: true },
    });
    if (!sub)
        return null;
    const activeJobsCount = await db_1.db.job.count({
        where: { postedById: employerId, isActive: true, status: { not: 'REJECTED' } },
    });
    const featuredJobsCount = await db_1.db.job.count({
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
            features: sub.plan.features,
        },
    };
};
exports.getEmployerSubscription = getEmployerSubscription;
const checkEmployerFeature = async (employerId, featureKey) => {
    const sub = await db_1.db.employerSubscription.findUnique({
        where: { employerId },
        include: { plan: true },
    });
    if (!sub || sub.status !== 'ACTIVE')
        return false;
    const features = sub.plan.features;
    return features.includes(featureKey);
};
exports.checkEmployerFeature = checkEmployerFeature;
const enforceJobLimit = async (employerId) => {
    const sub = await db_1.db.employerSubscription.findUnique({
        where: { employerId },
        include: { plan: true },
    });
    if (!sub || sub.status !== 'ACTIVE')
        return;
    if (sub.plan.jobLimit == null)
        return;
    const activeCount = await db_1.db.job.count({
        where: { postedById: employerId, isActive: true, status: { not: 'REJECTED' } },
    });
    if (activeCount >= sub.plan.jobLimit) {
        throw (0, errorHandler_1.createError)(`Job limit reached (${sub.plan.jobLimit}). Upgrade your plan to post more jobs.`, 403);
    }
};
exports.enforceJobLimit = enforceJobLimit;
const enforceFeaturedJobLimit = async (employerId) => {
    const sub = await db_1.db.employerSubscription.findUnique({
        where: { employerId },
        include: { plan: true },
    });
    if (!sub || sub.status !== 'ACTIVE') {
        throw (0, errorHandler_1.createError)('An active subscription is required to feature jobs.', 403);
    }
    if (sub.plan.featuredJobLimit == null)
        return;
    const featuredCount = await db_1.db.job.count({
        where: { postedById: employerId, isFeatured: true },
    });
    if (featuredCount >= sub.plan.featuredJobLimit) {
        throw (0, errorHandler_1.createError)(`Featured job limit reached (${sub.plan.featuredJobLimit}). Upgrade your plan to feature more jobs.`, 403);
    }
};
exports.enforceFeaturedJobLimit = enforceFeaturedJobLimit;
const adminListSubscriptions = async ({ page, limit, skip }) => {
    const [subs, total] = await Promise.all([
        db_1.db.employerSubscription.findMany({
            include: {
                plan: { select: { id: true, name: true, slug: true } },
                employer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip, take: limit,
        }),
        db_1.db.employerSubscription.count(),
    ]);
    return (0, utils_1.createPaginationResult)(subs, total, page, limit);
};
exports.adminListSubscriptions = adminListSubscriptions;
const getSponsoredCompanies = async () => {
    return db_1.db.sponsoredCompany.findMany({
        where: { isActive: true, endDate: { gt: new Date() } },
        include: {
            employer: {
                select: { companyName: true, companySlug: true, companyLogo: true, companyDescription: true, industry: true, location: true },
            },
        },
        orderBy: { sortOrder: 'asc' },
    });
};
exports.getSponsoredCompanies = getSponsoredCompanies;
const createSponsoredCompany = async (data, actorId, ip, ua) => {
    const existing = await db_1.db.sponsoredCompany.findUnique({ where: { employerId: data.employerId } });
    if (existing)
        throw (0, errorHandler_1.createError)('Employer already sponsored', 400);
    const start = data.startDate ? new Date(data.startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (data.durationDays || 30));
    const sc = await db_1.db.sponsoredCompany.create({
        data: {
            employerId: data.employerId,
            startDate: start,
            endDate: end,
            isActive: data.isActive ?? true,
            sortOrder: data.sortOrder || 0,
        },
    });
    (0, db_1.logAuditAction)({
        actorId, action: 'SPONSORED_COMPANY_CREATED', entity: 'SponsoredCompany',
        entityId: sc.id, metadata: { employerId: data.employerId },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return sc;
};
exports.createSponsoredCompany = createSponsoredCompany;
const updateSponsoredCompany = async (id, data, actorId, ip, ua) => {
    const sc = await db_1.db.sponsoredCompany.findUnique({ where: { id } });
    if (!sc)
        throw (0, errorHandler_1.createError)('Sponsored company not found', 404);
    const updated = await db_1.db.sponsoredCompany.update({
        where: { id },
        data: {
            isActive: data.isActive,
            sortOrder: data.sortOrder,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
    });
    (0, db_1.logAuditAction)({
        actorId, action: 'SPONSORED_COMPANY_UPDATED', entity: 'SponsoredCompany',
        entityId: id, metadata: { employerId: sc.employerId },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return updated;
};
exports.updateSponsoredCompany = updateSponsoredCompany;
const deleteSponsoredCompany = async (id, actorId, ip, ua) => {
    const sc = await db_1.db.sponsoredCompany.findUnique({ where: { id } });
    if (!sc)
        throw (0, errorHandler_1.createError)('Sponsored company not found', 404);
    await db_1.db.sponsoredCompany.delete({ where: { id } });
    (0, db_1.logAuditAction)({
        actorId, action: 'SPONSORED_COMPANY_DELETED', entity: 'SponsoredCompany',
        entityId: id, metadata: { employerId: sc.employerId },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
};
exports.deleteSponsoredCompany = deleteSponsoredCompany;
const adminListSponsoredCompanies = async ({ page, limit, skip }) => {
    const [list, total] = await Promise.all([
        db_1.db.sponsoredCompany.findMany({
            include: {
                employer: {
                    select: { id: true, email: true, companyName: true, companySlug: true },
                },
            },
            orderBy: { sortOrder: 'asc' },
            skip, take: limit,
        }),
        db_1.db.sponsoredCompany.count(),
    ]);
    return (0, utils_1.createPaginationResult)(list, total, page, limit);
};
exports.adminListSponsoredCompanies = adminListSponsoredCompanies;
//# sourceMappingURL=subscriptionService.js.map