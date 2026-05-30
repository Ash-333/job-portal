"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateApplicationStatus = exports.adminGetApplications = exports.updateApplicationStatus = exports.getJobApplications = exports.getApplicationHistory = exports.getUserApplicationById = exports.getUserApplications = exports.applyForJob = void 0;
const db_1 = require("../lib/db");
const errorHandler_1 = require("../middleware/errorHandler");
const email_1 = require("../lib/email");
const applyForJob = async (userId, jobId, message) => {
    const user = await db_1.db.user.findUnique({
        where: { id: userId },
        select: { profileCompleted: true },
    });
    if (!user?.profileCompleted) {
        throw (0, errorHandler_1.createError)('Please complete your profile before applying', 400);
    }
    const job = await db_1.db.job.findUnique({
        where: { id: jobId, status: 'APPROVED' },
        select: { id: true, title: true, applicationDeadline: true, companyName: true },
    });
    if (!job) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
        throw (0, errorHandler_1.createError)('Application deadline has passed', 400);
    }
    const existing = await db_1.db.application.findUnique({
        where: { userId_jobId: { userId, jobId } },
    });
    if (existing) {
        throw (0, errorHandler_1.createError)('You have already applied for this job', 409);
    }
    const application = await db_1.db.application.create({
        data: {
            userId,
            jobId,
            message: message || null,
            status: 'PENDING',
        },
    });
    await (0, db_1.logApplicationStatusChange)(application.id, 'PENDING', 'PENDING', userId);
    return application;
};
exports.applyForJob = applyForJob;
const getUserApplications = async (userId, { page, limit, skip }) => {
    const [applications, total] = await Promise.all([
        db_1.db.application.findMany({
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
        db_1.db.application.count({ where: { userId } }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        applications,
        pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
};
exports.getUserApplications = getUserApplications;
const getUserApplicationById = async (applicationId, userId) => {
    const application = await db_1.db.application.findFirst({
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
        throw (0, errorHandler_1.createError)('Application not found', 404);
    }
    return application;
};
exports.getUserApplicationById = getUserApplicationById;
const getApplicationHistory = async (applicationId, userId) => {
    const application = await db_1.db.application.findFirst({
        where: { id: applicationId, userId },
        select: { id: true },
    });
    if (!application) {
        throw (0, errorHandler_1.createError)('Application not found', 404);
    }
    const history = await db_1.db.applicationStatusHistory.findMany({
        where: { applicationId },
        orderBy: { changedAt: 'asc' },
    });
    return history;
};
exports.getApplicationHistory = getApplicationHistory;
const getJobApplications = async (jobId, employerId, status, { page, limit, skip }) => {
    const job = await db_1.db.job.findFirst({
        where: { id: jobId, postedById: employerId },
        select: { id: true },
    });
    if (!job) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    const where = { jobId };
    if (status) {
        where.status = status;
    }
    const [applications, total] = await Promise.all([
        db_1.db.application.findMany({
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
        db_1.db.application.count({ where }),
    ]);
    return createPaginationResult(applications, total, page, limit);
};
exports.getJobApplications = getJobApplications;
const updateApplicationStatus = async (applicationId, newStatus, employerId, ip, ua) => {
    const application = await db_1.db.application.findUnique({
        where: { id: applicationId },
        include: {
            job: { select: { postedById: true, title: true, companyName: true } },
            user: { select: { email: true, firstName: true } },
        },
    });
    if (!application) {
        throw (0, errorHandler_1.createError)('Application not found', 404);
    }
    if (application.job.postedById !== employerId) {
        throw (0, errorHandler_1.createError)('Application not found', 404);
    }
    const oldStatus = application.status;
    if (oldStatus === newStatus) {
        return application;
    }
    const updated = await db_1.db.application.update({
        where: { id: applicationId },
        data: { status: newStatus },
    });
    await (0, db_1.logApplicationStatusChange)(applicationId, oldStatus, newStatus, employerId);
    (0, db_1.logAuditAction)({
        actorId: employerId, action: 'APPLICATION_STATUS_CHANGED', entity: 'Application',
        entityId: applicationId,
        metadata: { jobTitle: application.job.title, oldStatus, newStatus },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    if (application.user.email) {
        (0, email_1.sendApplicationStatusEmail)(application.user.email, application.user.firstName || '', application.job.title, application.job.companyName, newStatus).catch(() => { });
    }
    return updated;
};
exports.updateApplicationStatus = updateApplicationStatus;
const adminGetApplications = async (filters, { page, limit, skip }) => {
    const where = {};
    if (filters.jobId) {
        where.jobId = filters.jobId;
    }
    if (filters.status) {
        where.status = filters.status;
    }
    const [applications, total] = await Promise.all([
        db_1.db.application.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
                job: { select: { id: true, title: true, slug: true, companyName: true } },
            },
            orderBy: { appliedAt: 'desc' },
            skip, take: limit,
        }),
        db_1.db.application.count({ where }),
    ]);
    return createPaginationResult(applications, total, page, limit);
};
exports.adminGetApplications = adminGetApplications;
const adminUpdateApplicationStatus = async (applicationId, newStatus, adminId, ip, ua) => {
    const application = await db_1.db.application.findUnique({
        where: { id: applicationId },
        include: {
            job: { select: { title: true, companyName: true } },
            user: { select: { email: true, firstName: true } },
        },
    });
    if (!application) {
        throw (0, errorHandler_1.createError)('Application not found', 404);
    }
    const oldStatus = application.status;
    if (oldStatus === newStatus) {
        return application;
    }
    const updated = await db_1.db.application.update({
        where: { id: applicationId },
        data: { status: newStatus },
    });
    await (0, db_1.logApplicationStatusChange)(applicationId, oldStatus, newStatus, adminId);
    (0, db_1.logAuditAction)({
        actorId: adminId, action: 'APPLICATION_STATUS_CHANGED', entity: 'Application',
        entityId: applicationId,
        metadata: { jobTitle: application.job.title, oldStatus, newStatus },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    if (application.user.email) {
        (0, email_1.sendApplicationStatusEmail)(application.user.email, application.user.firstName || '', application.job.title, application.job.companyName, newStatus).catch(() => { });
    }
    return updated;
};
exports.adminUpdateApplicationStatus = adminUpdateApplicationStatus;
const createPaginationResult = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
};
//# sourceMappingURL=applicationService.js.map