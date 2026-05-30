"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupAuditLogs = exports.getAuditLogs = exports.unsuspendUser = exports.suspendUser = exports.deleteUser = exports.getUserById = exports.getUsers = void 0;
const db_1 = require("../lib/db");
const errorHandler_1 = require("../middleware/errorHandler");
const utils_1 = require("../lib/utils");
const getUsers = async (filters, { page, limit, skip }) => {
    const where = {};
    if (filters.role) {
        where.role = filters.role;
    }
    else {
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
        db_1.db.user.findMany({
            where,
            select: {
                id: true, email: true, firstName: true, lastName: true,
                role: true, phone: true, experienceLevel: true,
                location: true, profileCompleted: true,
                isActive: true,
                companyName: true, companySlug: true,
                createdAt: true,
                _count: { select: { applications: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip, take: limit,
        }),
        db_1.db.user.count({ where }),
    ]);
    return (0, utils_1.createPaginationResult)(users, total, page, limit);
};
exports.getUsers = getUsers;
const getUserById = async (userId) => {
    const user = await db_1.db.user.findUnique({
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
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const recentApplications = await db_1.db.application.findMany({
        where: { userId },
        take: 5,
        orderBy: { appliedAt: 'desc' },
        include: {
            job: { select: { id: true, title: true, slug: true, companyName: true, status: true } },
        },
    });
    return { user, recentApplications };
};
exports.getUserById = getUserById;
const deleteUser = async (userId, actorId, ip, ua) => {
    const user = await db_1.db.user.findUnique({ where: { id: userId }, select: { id: true, role: true, email: true } });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    if (user.role === 'ADMIN') {
        throw (0, errorHandler_1.createError)('Cannot delete admin users', 403);
    }
    await db_1.db.user.delete({ where: { id: userId } });
    (0, db_1.logAuditAction)({
        actorId, action: 'USER_DELETED', entity: 'User',
        entityId: userId, metadata: { email: user.email },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
};
exports.deleteUser = deleteUser;
const suspendUser = async (userId, actorId, ip, ua) => {
    const user = await db_1.db.user.findUnique({ where: { id: userId }, select: { id: true, role: true, email: true, isActive: true } });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    if (user.role === 'ADMIN') {
        throw (0, errorHandler_1.createError)('Cannot suspend admin users', 403);
    }
    if (!user.isActive) {
        throw (0, errorHandler_1.createError)('User is already suspended', 400);
    }
    await db_1.db.user.update({ where: { id: userId }, data: { isActive: false } });
    (0, db_1.logAuditAction)({
        actorId, action: 'USER_SUSPENDED', entity: 'User',
        entityId: userId, metadata: { email: user.email, role: user.role },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
};
exports.suspendUser = suspendUser;
const unsuspendUser = async (userId, actorId, ip, ua) => {
    const user = await db_1.db.user.findUnique({ where: { id: userId }, select: { id: true, role: true, email: true, isActive: true } });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    if (user.role === 'ADMIN') {
        throw (0, errorHandler_1.createError)('Cannot unsuspend admin users', 403);
    }
    if (user.isActive) {
        throw (0, errorHandler_1.createError)('User is not suspended', 400);
    }
    await db_1.db.user.update({ where: { id: userId }, data: { isActive: true } });
    (0, db_1.logAuditAction)({
        actorId, action: 'USER_UNSUSPENDED', entity: 'User',
        entityId: userId, metadata: { email: user.email, role: user.role },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
};
exports.unsuspendUser = unsuspendUser;
const getAuditLogs = async ({ page, limit, skip }) => {
    const [logs, total] = await Promise.all([
        db_1.db.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            skip, take: limit,
        }),
        db_1.db.auditLog.count(),
    ]);
    return (0, utils_1.createPaginationResult)(logs, total, page, limit);
};
exports.getAuditLogs = getAuditLogs;
const cleanupAuditLogs = async (retentionDays = 15) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const result = await db_1.db.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
    });
    return { deletedCount: result.count, retentionDays, cutoff };
};
exports.cleanupAuditLogs = cleanupAuditLogs;
//# sourceMappingURL=adminService.js.map