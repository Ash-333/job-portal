import { db, logAuditAction } from '../lib/db';
import { createError } from '../middleware/errorHandler';
import { generateUniqueSlug, createPaginationResult } from '../lib/utils';
import { sendJobApprovedEmail, sendJobRejectedEmail } from '../lib/email';
import { sanitizeRichText, sanitizeTextOnly } from '../lib/sanitize';
import { enforceFeaturedJobLimit } from './subscriptionService';

type PaginationParams = { page: number; limit: number; skip: number };

// ── Public ──────────────────────────────────────────────────────

export const listJobs = async (filters: any, { page, limit, skip }: PaginationParams) => {
  const now = new Date();
  const where: any = {
    status: 'APPROVED',
    AND: [
      {
        OR: [
          { applicationDeadline: null },
          { applicationDeadline: { gt: now } },
        ],
      },
    ],
  };

  if (filters.category) {
    where.category = { contains: filters.category, mode: 'insensitive' };
  }
  if (filters.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }
  if (filters.jobType) {
    where.jobType = filters.jobType;
  }
  if (filters.experienceLevel) {
    where.experienceLevel = filters.experienceLevel;
  }
  if (filters.salaryMin || filters.salaryMax) {
    const andClause: any[] = [];
    if (filters.salaryMin) {
      andClause.push({ salaryMin: { gte: filters.salaryMin } });
    }
    if (filters.salaryMax) {
      andClause.push({ salaryMax: { lte: filters.salaryMax } });
    }
    where.AND.push(...andClause);
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { companyName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      select: {
        id: true, title: true, slug: true, description: true,
        category: true, location: true, jobType: true, workLocationType: true,
        experienceLevel: true, salaryMin: true, salaryMax: true, currency: true,
        companyName: true, companySlug: true, companyLogo: true, isFeatured: true,
        applicationDeadline: true, createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip, take: limit,
    }),
    db.job.count({ where }),
  ]);

  return createPaginationResult(jobs, total, page, limit);
};

export const getFeaturedJobs = async (limit: number) => {
  const now = new Date();
  const jobs = await db.job.findMany({
    where: {
      status: 'APPROVED',
      isFeatured: true,
      OR: [
        { applicationDeadline: null },
        { applicationDeadline: { gt: now } },
      ],
    },
    select: {
      id: true, title: true, slug: true, description: true,
      category: true, location: true, jobType: true, workLocationType: true,
      experienceLevel: true, salaryMin: true, salaryMax: true, currency: true,
      companyName: true, companySlug: true, companyLogo: true, isFeatured: true,
      applicationDeadline: true, createdAt: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return jobs;
};

export const getJobBySlug = async (slug: string, userId?: string) => {
  const job = await db.job.findUnique({
    where: { slug, status: 'APPROVED' },
    include: { _count: { select: { applications: true } } },
  });

  if (!job) {
    throw createError('Job not found', 404);
  }

  let hasApplied = false;
  if (userId) {
    const application = await db.application.findUnique({
      where: { userId_jobId: { userId, jobId: job.id } },
      select: { id: true },
    });
    hasApplied = !!application;
  }

  return { job, hasApplied };
};

// ── Employer ────────────────────────────────────────────────────

export const getEmployerJobs = async (employerId: string, { page, limit, skip }: PaginationParams) => {
  const where = { postedById: employerId };

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    db.job.count({ where }),
  ]);

  return createPaginationResult(jobs, total, page, limit);
};

export const getEmployerJobById = async (jobId: string, employerId: string) => {
  const job = await db.job.findFirst({
    where: { id: jobId, postedById: employerId },
    include: { _count: { select: { applications: true } } },
  });
  if (!job) {
    throw createError('Job not found', 404);
  }
  return job;
};

export const createEmployerJob = async (employerId: string, data: any, ip?: string, ua?: string) => {
  const employer = await db.user.findUnique({
    where: { id: employerId },
    select: { companyName: true, companySlug: true, companyLogo: true, companyWebsite: true },
  });

  const job = await db.job.create({
    data: {
      title: sanitizeTextOnly(data.title),
      slug: generateUniqueSlug(data.title),
      description: sanitizeRichText(data.description),
      requirements: (data.requirements || []).map((r: string) => sanitizeRichText(r)),
      responsibilities: (data.responsibilities || []).map((r: string) => sanitizeRichText(r)),
      category: data.category,
      location: data.location,
      jobType: data.jobType,
      workLocationType: data.workLocationType || 'ONSITE',
      experienceLevel: data.experienceLevel,
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      salaryNegotiable: data.salaryNegotiable || false,
      currency: data.currency || 'NPR',
      companyName: data.companyName || employer?.companyName || '',
      companySlug: employer?.companySlug || null,
      companyLogo: data.companyLogo || employer?.companyLogo || null,
      companyWebsite: data.companyWebsite || employer?.companyWebsite || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      source: 'EMPLOYER',
      status: 'PENDING',
      isActive: false,
      isFeatured: false,
      isApproved: false,
      postedById: employerId,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
    },
  });

  logAuditAction({
    actorId: employerId, action: 'EMPLOYER_JOB_CREATED', entity: 'Job',
    entityId: job.id, metadata: { title: job.title }, ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return job;
};

export const updateEmployerJob = async (jobId: string, employerId: string, data: any, ip?: string, ua?: string) => {
  const existing = await db.job.findFirst({
    where: { id: jobId, postedById: employerId },
  });
  if (!existing) {
    throw createError('Job not found', 404);
  }

  const updateData: any = { ...data };
  if (data.title !== undefined) {
    updateData.title = sanitizeTextOnly(data.title);
    if (data.title !== existing.title) {
      updateData.slug = generateUniqueSlug(data.title);
    }
  }
  if (data.description !== undefined) {
    updateData.description = sanitizeRichText(data.description);
  }
  if (data.requirements !== undefined) {
    updateData.requirements = data.requirements.map((r: string) => sanitizeRichText(r));
  }
  if (data.responsibilities !== undefined) {
    updateData.responsibilities = data.responsibilities.map((r: string) => sanitizeRichText(r));
  }
  if (data.companyName !== undefined) {
    updateData.companyName = sanitizeTextOnly(data.companyName);
  }
  if (data.companyWebsite !== undefined) {
    updateData.companyWebsite = sanitizeTextOnly(data.companyWebsite);
  }

  if (existing.status === 'REJECTED') {
    updateData.status = 'RESUBMITTED';
    updateData.rejectionReason = null;
  }

  delete updateData.source;
  delete updateData.postedById;
  delete updateData.isActive;
  delete updateData.isFeatured;
  delete updateData.isApproved;

  if (updateData.applicationDeadline) {
    updateData.applicationDeadline = new Date(updateData.applicationDeadline);
  }

  const job = await db.job.update({ where: { id: jobId }, data: updateData });

  logAuditAction({
    actorId: employerId, action: 'EMPLOYER_JOB_UPDATED', entity: 'Job',
    entityId: job.id, metadata: { title: job.title, newStatus: updateData.status },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  return job;
};

export const deleteEmployerJob = async (jobId: string, employerId: string, ip?: string, ua?: string) => {
  const existing = await db.job.findFirst({
    where: { id: jobId, postedById: employerId },
    select: { id: true, title: true },
  });
  if (!existing) {
    throw createError('Job not found', 404);
  }

  await db.job.delete({ where: { id: jobId } });

  logAuditAction({
    actorId: employerId, action: 'EMPLOYER_JOB_DELETED', entity: 'Job',
    entityId: jobId, metadata: { title: existing.title },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});
};

export const toggleEmployerJobFeatured = async (jobId: string, employerId: string) => {
  const job = await db.job.findFirst({
    where: { id: jobId, postedById: employerId },
    select: { id: true, title: true, isFeatured: true },
  });
  if (!job) throw createError('Job not found', 404);

  const newFeatured = !job.isFeatured;

  if (newFeatured) {
    await enforceFeaturedJobLimit(employerId);
  }

  const updated = await db.job.update({
    where: { id: jobId },
    data: {
      isFeatured: newFeatured,
      featuredAt: newFeatured ? new Date() : null,
    },
  });

  return updated;
};

// ── Admin ────────────────────────────────────────────────────────

export const adminListJobs = async (filters: any, { page, limit, skip }: PaginationParams) => {
  const where: any = {};

  if (filters.category) {
    where.category = { contains: filters.category, mode: 'insensitive' };
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { companyName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  if (filters.isApproved !== undefined) {
    where.isApproved = filters.isApproved;
  }
  if (filters.status) {
    where.status = Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status;
  }

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      include: {
        _count: { select: { applications: true } },
        postedBy: { select: { id: true, firstName: true, lastName: true, email: true, companyName: true, companySlug: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    db.job.count({ where }),
  ]);

  return createPaginationResult(jobs, total, page, limit);
};

export const adminCreateJob = async (data: any) => {
  const job = await db.job.create({
    data: {
      title: sanitizeTextOnly(data.title),
      slug: generateUniqueSlug(data.title),
      description: sanitizeRichText(data.description),
      requirements: (data.requirements || []).map((r: string) => sanitizeRichText(r)),
      responsibilities: (data.responsibilities || []).map((r: string) => sanitizeRichText(r)),
      category: data.category,
      location: data.location,
      jobType: data.jobType,
      workLocationType: data.workLocationType || 'ONSITE',
      experienceLevel: data.experienceLevel,
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      salaryNegotiable: data.salaryNegotiable || false,
      currency: data.currency || 'NPR',
      companyName: data.companyName,
      companyLogo: data.companyLogo || null,
      companyWebsite: data.companyWebsite || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      source: 'ADMIN',
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
    },
  });
  return job;
};

export const adminGetJobById = async (jobId: string) => {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { _count: { select: { applications: true } } },
  });
  if (!job) {
    throw createError('Job not found', 404);
  }
  return job;
};

export const adminUpdateJob = async (jobId: string, data: any) => {
  const existing = await db.job.findUnique({ where: { id: jobId } });
  if (!existing) {
    throw createError('Job not found', 404);
  }

  const updateData: any = { ...data };
  if (data.title !== undefined) {
    updateData.title = sanitizeTextOnly(data.title);
    if (data.title !== existing.title) {
      updateData.slug = generateUniqueSlug(data.title);
    }
  }
  if (data.description !== undefined) {
    updateData.description = sanitizeRichText(data.description);
  }
  if (data.requirements !== undefined) {
    updateData.requirements = data.requirements.map((r: string) => sanitizeRichText(r));
  }
  if (data.responsibilities !== undefined) {
    updateData.responsibilities = data.responsibilities.map((r: string) => sanitizeRichText(r));
  }
  if (updateData.applicationDeadline) {
    updateData.applicationDeadline = new Date(updateData.applicationDeadline);
  }

  const job = await db.job.update({ where: { id: jobId }, data: updateData });
  return job;
};

export const adminDeleteJob = async (jobId: string, actorId: string, ip?: string, ua?: string) => {
  const job = await db.job.findUnique({ where: { id: jobId }, select: { id: true, title: true, source: true } });
  if (!job) {
    throw createError('Job not found', 404);
  }

  await db.job.delete({ where: { id: jobId } });

  logAuditAction({
    actorId, action: 'JOB_DELETED', entity: 'Job',
    entityId: jobId, metadata: { title: job.title, source: job.source },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});
};

export const approveJob = async (jobId: string, actorId: string, ip?: string, ua?: string) => {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { postedBy: { select: { email: true, firstName: true } } },
  });
  if (!job) {
    throw createError('Job not found', 404);
  }

  const updated = await db.job.update({
    where: { id: jobId },
    data: { status: 'APPROVED', isApproved: true, isActive: true },
  });

  logAuditAction({
    actorId, action: 'JOB_APPROVED', entity: 'Job',
    entityId: jobId, metadata: { title: job.title },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  if (job.source === 'EMPLOYER' && job.postedBy?.email) {
    sendJobApprovedEmail(job.postedBy.email, job.postedBy.firstName || '', job.title).catch(() => {});
  }

  return updated;
};

export const rejectJob = async (jobId: string, rejectionReason: string, actorId: string, ip?: string, ua?: string) => {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { postedBy: { select: { email: true, firstName: true } } },
  });
  if (!job) {
    throw createError('Job not found', 404);
  }

  if (job.source !== 'EMPLOYER') {
    throw createError('Only employer-posted jobs can be rejected', 400);
  }

  const updated = await db.job.update({
    where: { id: jobId },
    data: { status: 'REJECTED', isApproved: false, isActive: false, rejectionReason },
  });

  logAuditAction({
    actorId, action: 'JOB_REJECTED', entity: 'Job',
    entityId: jobId, metadata: { title: job.title, rejectionReason },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  if (job.postedBy?.email) {
    sendJobRejectedEmail(job.postedBy.email, job.postedBy.firstName || '', job.title, rejectionReason).catch(() => {});
  }

  return updated;
};

// ── Company page ────────────────────────────────────────────────

export const getCompanyJobs = async (companyId: string) => {
  const now = new Date();
  const jobs = await db.job.findMany({
    where: {
      postedById: companyId,
      status: 'APPROVED',
      OR: [
        { applicationDeadline: null },
        { applicationDeadline: { gt: now } },
      ],
    },
    select: {
      id: true, title: true, slug: true, description: true,
      category: true, location: true, jobType: true, workLocationType: true,
      experienceLevel: true, salaryMin: true, salaryMax: true, currency: true,
      createdAt: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return jobs;
};

// ── Employer dashboard stats ────────────────────────────────────

export const getEmployerDashboardStats = async (employerId: string) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [
    totalJobs, activeJobs, pendingJobs, rejectedJobs,
    totalApplications,
    jobsExpiringSoon,
    totalViewsResult,
    applicationBreakdown,
    recentApplications,
  ] = await Promise.all([
    db.job.count({ where: { postedById: employerId } }),
    db.job.count({ where: { postedById: employerId, status: 'APPROVED' } }),
    db.job.count({ where: { postedById: employerId, status: { in: ['PENDING', 'RESUBMITTED'] } } }),
    db.job.count({ where: { postedById: employerId, status: 'REJECTED' } }),
    db.application.count({ where: { job: { postedById: employerId } } }),
    db.job.count({
      where: {
        postedById: employerId,
        status: 'APPROVED',
        applicationDeadline: { not: null, lte: thirtyDaysFromNow, gte: new Date() },
      },
    }),
    db.job.aggregate({
      where: { postedById: employerId },
      _sum: { viewCount: true },
    }),
    db.application.groupBy({
      by: ['status'],
      where: { job: { postedById: employerId } },
      _count: { id: true },
    }),
    db.application.findMany({
      where: { job: { postedById: employerId } },
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true, profilePicture: true } },
        job: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const totalViews = totalViewsResult._sum.viewCount ?? 0;

  const recentApplicants = recentApplications.map((app) => ({
    id: app.id,
    applicantName: `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim(),
    applicantAvatar: app.user.profilePicture,
    jobTitle: app.job.title,
    jobSlug: app.job.slug,
    status: app.status,
    appliedAt: app.appliedAt,
  }));

  const applicationRate = activeJobs > 0 ? Math.round((totalApplications / activeJobs) * 100) : 0;

  return {
    totalJobs,
    activeJobs,
    pendingJobs,
    rejectedJobs,
    totalApplications,
    jobsExpiringSoon,
    totalViews,
    applicationRate,
    applicationBreakdown,
    recentApplicants,
  };
};

// ── Admin dashboard stats ──────────────────────────────────────

export const getAdminDashboardStats = async () => {
  const [
    totalJobs, approvedJobs,
    totalUsers,
    totalApplications, pendingApplications,
    totalBlogs, publishedBlogs,
    pendingApprovalJobs,
    totalViewsResult,
  ] = await Promise.all([
    db.job.count(),
    db.job.count({ where: { status: 'APPROVED' } }),
    db.user.count({ where: { role: 'USER' } }),
    db.application.count(),
    db.application.count({ where: { status: 'PENDING' } }),
    db.blog.count(),
    db.blog.count({ where: { isPublished: true } }),
    db.job.count({ where: { status: { in: ['PENDING', 'RESUBMITTED'] }, source: 'EMPLOYER' } }),
    db.job.aggregate({ _sum: { viewCount: true } }),
  ]);

  const totalViews = totalViewsResult._sum.viewCount ?? 0;

  const recentApplications = await db.application.findMany({
    take: 5,
    orderBy: { appliedAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true, profilePicture: true } },
      job: { select: { title: true, slug: true } },
    },
  });

  const activeJobsPercentage = totalJobs > 0 ? Math.round((approvedJobs / totalJobs) * 100) : 0;
  const applicationRate = totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) : 0;

  return { totalJobs, approvedJobs, activeJobsPercentage, totalUsers, totalApplications, pendingApplications, applicationRate, totalBlogs, publishedBlogs, pendingApprovalJobs, totalViews, recentApplications };
};
