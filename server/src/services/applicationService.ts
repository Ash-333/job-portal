import { db, logApplicationStatusChange, logAuditAction } from '../lib/db';
import { createError } from '../middleware/errorHandler';
import { sendApplicationStatusEmail } from '../lib/email';

type PaginationParams = { page: number; limit: number; skip: number };

// ── User ────────────────────────────────────────────────────────

export const applyForJob = async (userId: string, jobId: string, message?: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { profileCompleted: true },
  });
  if (!user?.profileCompleted) {
    throw createError('Please complete your profile before applying', 400);
  }

  const job = await db.job.findUnique({
    where: { id: jobId, status: 'APPROVED' },
    select: { id: true, title: true, applicationDeadline: true, companyName: true },
  });
  if (!job) {
    throw createError('Job not found', 404);
  }

  if (job.applicationDeadline && job.applicationDeadline < new Date()) {
    throw createError('Application deadline has passed', 400);
  }

  const existing = await db.application.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  if (existing) {
    throw createError('You have already applied for this job', 409);
  }

  const application = await db.application.create({
    data: {
      userId,
      jobId,
      message: message || null,
      status: 'PENDING',
    },
  });

  await logApplicationStatusChange(application.id, 'PENDING', 'PENDING', userId);

  return application;
};

export const getUserApplications = async (userId: string, { page, limit, skip }: PaginationParams) => {
  const [applications, total] = await Promise.all([
    db.application.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            id: true, title: true, slug: true, companyName: true,
            location: true, jobType: true, salaryMin: true, salaryMax: true,
            currency: true, isActive: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      skip, take: limit,
    }),
    db.application.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return {
    applications,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
};

export const getUserApplicationById = async (applicationId: string, userId: string) => {
  const application = await db.application.findFirst({
    where: { id: applicationId, userId },
    include: {
      job: {
        select: {
          id: true, title: true, slug: true, description: true,
          category: true, location: true, jobType: true, workLocationType: true,
          experienceLevel: true, salaryMin: true, salaryMax: true, currency: true,
          companyName: true, companyLogo: true, companyWebsite: true,
          applicationDeadline: true, createdAt: true,
        },
      },
    },
  });
  if (!application) {
    throw createError('Application not found', 404);
  }
  return application;
};

export const getApplicationHistory = async (applicationId: string, userId: string) => {
  const application = await db.application.findFirst({
    where: { id: applicationId, userId },
    select: { id: true },
  });
  if (!application) {
    throw createError('Application not found', 404);
  }

  const history = await db.applicationStatusHistory.findMany({
    where: { applicationId },
    orderBy: { changedAt: 'asc' },
  });
  return history;
};

// ── Employer ────────────────────────────────────────────────────

export const getJobApplications = async (jobId: string, employerId: string, { page, limit, skip }: PaginationParams, status?: string) => {
  const job = await db.job.findFirst({
    where: { id: jobId, postedById: employerId },
    select: { id: true },
  });
  if (!job) {
    throw createError('Job not found', 404);
  }

  const where: any = { jobId };
  if (status) {
    where.status = status;
  }

  const [applications, total] = await Promise.all([
    db.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true, email: true,
            profilePicture: true, resume: true, skills: true,
            experience: true, education: true, location: true,
            linkedin: true, github: true, website: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      skip, take: limit,
    }),
    db.application.count({ where }),
  ]);

  return createPaginationResult(applications, total, page, limit);
};

export const updateApplicationStatus = async (applicationId: string, newStatus: string, employerId: string, ip?: string, ua?: string) => {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { select: { postedById: true, title: true, companyName: true } },
      user: { select: { email: true, firstName: true } },
    },
  });
  if (!application) {
    throw createError('Application not found', 404);
  }

  if (application.job.postedById !== employerId) {
    throw createError('Application not found', 404);
  }

  const oldStatus = application.status;
  if (oldStatus === newStatus) {
    return application;
  }

  const updated = await db.application.update({
    where: { id: applicationId },
    data: { status: newStatus as any },
  });

  await logApplicationStatusChange(applicationId, oldStatus, newStatus, employerId);

  logAuditAction({
    actorId: employerId, action: 'APPLICATION_STATUS_CHANGED', entity: 'Application',
    entityId: applicationId,
    metadata: { jobTitle: application.job.title, oldStatus, newStatus },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  if (application.user.email) {
    sendApplicationStatusEmail(
      application.user.email,
      application.user.firstName || '',
      application.job.title,
      application.job.companyName,
      newStatus,
    ).catch(() => {});
  }

  return updated;
};

// ── Admin ──────────────────────────────────────────────────────

export const adminGetApplications = async (filters: any, { page, limit, skip }: PaginationParams) => {
  const where: any = {};
  if (filters.jobId) {
    where.jobId = filters.jobId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const [applications, total] = await Promise.all([
    db.application.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
        job: { select: { id: true, title: true, slug: true, companyName: true } },
      },
      orderBy: { appliedAt: 'desc' },
      skip, take: limit,
    }),
    db.application.count({ where }),
  ]);

  return createPaginationResult(applications, total, page, limit);
};

export const adminUpdateApplicationStatus = async (applicationId: string, newStatus: string, adminId: string, ip?: string, ua?: string) => {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { select: { title: true, companyName: true } },
      user: { select: { email: true, firstName: true } },
    },
  });
  if (!application) {
    throw createError('Application not found', 404);
  }

  const oldStatus = application.status;
  if (oldStatus === newStatus) {
    return application;
  }

  const updated = await db.application.update({
    where: { id: applicationId },
    data: { status: newStatus as any },
  });

  await logApplicationStatusChange(applicationId, oldStatus, newStatus, adminId);

  logAuditAction({
    actorId: adminId, action: 'APPLICATION_STATUS_CHANGED', entity: 'Application',
    entityId: applicationId,
    metadata: { jobTitle: application.job.title, oldStatus, newStatus },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});

  if (application.user.email) {
    sendApplicationStatusEmail(
      application.user.email,
      application.user.firstName || '',
      application.job.title,
      application.job.companyName,
      newStatus,
    ).catch(() => {});
  }

  return updated;
};

// Helper for createPaginationResult
const createPaginationResult = (data: any[], total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
};
