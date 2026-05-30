import { db, logAuditAction } from '../lib/db';
import { createError } from '../middleware/errorHandler';
import { createPaginationResult } from '../lib/utils';

type PaginationParams = { page: number; limit: number; skip: number };

// ── Users ─────────────────────────────────────────────────────────

export const getUsers = async (filters: any, { page, limit, skip }: PaginationParams) => {
  const where: any = {};

  if (filters.role) {
    where.role = filters.role;
  } else {
    where.role = { in: ['USER', 'EMPLOYER'] };
  }

  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { companyName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.experienceLevel) {
    where.experienceLevel = filters.experienceLevel;
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, experienceLevel: true,
        location: true, profileCompleted: true,
        isActive: true,
        companyName: true, companySlug: true,
        companySize: true, industry: true,
        companyDescription: true, companyLogo: true, companyWebsite: true,
        createdAt: true,
        _count: { select: { applications: true, postedJobs: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    db.user.count({ where }),
  ]);

  return createPaginationResult(users, total, page, limit);
};

export const getUserById = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phone: true, experienceLevel: true,
      profilePicture: true, resume: true, bio: true, skills: true,
      experience: true, education: true, location: true,
      website: true, linkedin: true, github: true,
      profileCompleted: true, emailVerified: true,
      createdAt: true, updatedAt: true,
      isActive: true,
      companyName: true, companySlug: true, companyDescription: true, companyLogo: true,
      companyWebsite: true, companySize: true, industry: true,
      _count: { select: { applications: true } },
    },
  });
  if (!user) {
    throw createError('User not found', 404);
  }

  const recentApplications = await db.application.findMany({
    where: { userId },
    take: 5,
    orderBy: { appliedAt: 'desc' },
    include: {
      job: { select: { id: true, title: true, slug: true, companyName: true, status: true } },
    },
  });

  return { user, recentApplications };
};

export const deleteUser = async (userId: string, actorId: string, ip?: string, ua?: string) => {
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true, email: true } });
  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.role === 'ADMIN') {
    throw createError('Cannot delete admin users', 403);
  }

  await db.user.delete({ where: { id: userId } });

  logAuditAction({
    actorId, action: 'USER_DELETED', entity: 'User',
    entityId: userId, metadata: { email: user.email },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});
};

// ── Suspend / Unsuspend ───────────────────────────────────────────

export const suspendUser = async (userId: string, actorId: string, ip?: string, ua?: string) => {
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true, email: true, isActive: true } });
  if (!user) {
    throw createError('User not found', 404);
  }
  if (user.role === 'ADMIN') {
    throw createError('Cannot suspend admin users', 403);
  }
  if (!user.isActive) {
    throw createError('User is already suspended', 400);
  }

  await db.user.update({ where: { id: userId }, data: { isActive: false } });

  logAuditAction({
    actorId, action: 'USER_SUSPENDED', entity: 'User',
    entityId: userId, metadata: { email: user.email, role: user.role },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});
};

export const unsuspendUser = async (userId: string, actorId: string, ip?: string, ua?: string) => {
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true, email: true, isActive: true } });
  if (!user) {
    throw createError('User not found', 404);
  }
  if (user.role === 'ADMIN') {
    throw createError('Cannot unsuspend admin users', 403);
  }
  if (user.isActive) {
    throw createError('User is not suspended', 400);
  }

  await db.user.update({ where: { id: userId }, data: { isActive: true } });

  logAuditAction({
    actorId, action: 'USER_UNSUSPENDED', entity: 'User',
    entityId: userId, metadata: { email: user.email, role: user.role },
    ipAddress: ip, userAgent: ua,
  }).catch(() => {});
};

// ── Audit Logs ────────────────────────────────────────────────────

export const getAuditLogs = async ({ page, limit, skip }: PaginationParams) => {
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    db.auditLog.count(),
  ]);

  return createPaginationResult(logs, total, page, limit);
};

export const cleanupAuditLogs = async (retentionDays: number = 15) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const result = await db.auditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return { deletedCount: result.count, retentionDays, cutoff };
};
