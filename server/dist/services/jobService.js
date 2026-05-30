"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboardStats = exports.getEmployerDashboardStats = exports.getCompanyJobs = exports.rejectJob = exports.approveJob = exports.adminDeleteJob = exports.adminUpdateJob = exports.adminGetJobById = exports.adminCreateJob = exports.adminListJobs = exports.toggleEmployerJobFeatured = exports.deleteEmployerJob = exports.updateEmployerJob = exports.createEmployerJob = exports.getEmployerJobById = exports.getEmployerJobs = exports.getJobBySlug = exports.getFeaturedJobs = exports.listJobs = void 0;
const db_1 = require("../lib/db");
const errorHandler_1 = require("../middleware/errorHandler");
const utils_1 = require("../lib/utils");
const email_1 = require("../lib/email");
const sanitize_1 = require("../lib/sanitize");
const subscriptionService_1 = require("./subscriptionService");
const listJobs = async (filters, { page, limit, skip }) => {
    const now = new Date();
    const where = {
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
        const andClause = [];
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
        db_1.db.job.findMany({
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
        db_1.db.job.count({ where }),
    ]);
    return (0, utils_1.createPaginationResult)(jobs, total, page, limit);
};
exports.listJobs = listJobs;
const getFeaturedJobs = async (limit) => {
    const now = new Date();
    const jobs = await db_1.db.job.findMany({
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
exports.getFeaturedJobs = getFeaturedJobs;
const getJobBySlug = async (slug, userId) => {
    const job = await db_1.db.job.findUnique({
        where: { slug, status: 'APPROVED' },
        include: { _count: { select: { applications: true } } },
    });
    if (!job) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    let hasApplied = false;
    if (userId) {
        const application = await db_1.db.application.findUnique({
            where: { userId_jobId: { userId, jobId: job.id } },
            select: { id: true },
        });
        hasApplied = !!application;
    }
    return { job, hasApplied };
};
exports.getJobBySlug = getJobBySlug;
const getEmployerJobs = async (employerId, { page, limit, skip }) => {
    const where = { postedById: employerId };
    const [jobs, total] = await Promise.all([
        db_1.db.job.findMany({
            where,
            include: { _count: { select: { applications: true } } },
            orderBy: { createdAt: 'desc' },
            skip, take: limit,
        }),
        db_1.db.job.count({ where }),
    ]);
    return (0, utils_1.createPaginationResult)(jobs, total, page, limit);
};
exports.getEmployerJobs = getEmployerJobs;
const getEmployerJobById = async (jobId, employerId) => {
    const job = await db_1.db.job.findFirst({
        where: { id: jobId, postedById: employerId },
        include: { _count: { select: { applications: true } } },
    });
    if (!job) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    return job;
};
exports.getEmployerJobById = getEmployerJobById;
const createEmployerJob = async (employerId, data, ip, ua) => {
    const employer = await db_1.db.user.findUnique({
        where: { id: employerId },
        select: { companyName: true, companySlug: true, companyLogo: true, companyWebsite: true },
    });
    const job = await db_1.db.job.create({
        data: {
            title: (0, sanitize_1.sanitizeTextOnly)(data.title),
            slug: (0, utils_1.generateUniqueSlug)(data.title),
            description: (0, sanitize_1.sanitizeRichText)(data.description),
            requirements: (data.requirements || []).map((r) => (0, sanitize_1.sanitizeRichText)(r)),
            responsibilities: (data.responsibilities || []).map((r) => (0, sanitize_1.sanitizeRichText)(r)),
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
    (0, db_1.logAuditAction)({
        actorId: employerId, action: 'EMPLOYER_JOB_CREATED', entity: 'Job',
        entityId: job.id, metadata: { title: job.title }, ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return job;
};
exports.createEmployerJob = createEmployerJob;
const updateEmployerJob = async (jobId, employerId, data, ip, ua) => {
    const existing = await db_1.db.job.findFirst({
        where: { id: jobId, postedById: employerId },
    });
    if (!existing) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    const updateData = { ...data };
    if (data.title !== undefined) {
        updateData.title = (0, sanitize_1.sanitizeTextOnly)(data.title);
        if (data.title !== existing.title) {
            updateData.slug = (0, utils_1.generateUniqueSlug)(data.title);
        }
    }
    if (data.description !== undefined) {
        updateData.description = (0, sanitize_1.sanitizeRichText)(data.description);
    }
    if (data.requirements !== undefined) {
        updateData.requirements = data.requirements.map((r) => (0, sanitize_1.sanitizeRichText)(r));
    }
    if (data.responsibilities !== undefined) {
        updateData.responsibilities = data.responsibilities.map((r) => (0, sanitize_1.sanitizeRichText)(r));
    }
    if (data.companyName !== undefined) {
        updateData.companyName = (0, sanitize_1.sanitizeTextOnly)(data.companyName);
    }
    if (data.companyWebsite !== undefined) {
        updateData.companyWebsite = (0, sanitize_1.sanitizeTextOnly)(data.companyWebsite);
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
    const job = await db_1.db.job.update({ where: { id: jobId }, data: updateData });
    (0, db_1.logAuditAction)({
        actorId: employerId, action: 'EMPLOYER_JOB_UPDATED', entity: 'Job',
        entityId: job.id, metadata: { title: job.title, newStatus: updateData.status },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return job;
};
exports.updateEmployerJob = updateEmployerJob;
const deleteEmployerJob = async (jobId, employerId, ip, ua) => {
    const existing = await db_1.db.job.findFirst({
        where: { id: jobId, postedById: employerId },
        select: { id: true, title: true },
    });
    if (!existing) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    await db_1.db.job.delete({ where: { id: jobId } });
    (0, db_1.logAuditAction)({
        actorId: employerId, action: 'EMPLOYER_JOB_DELETED', entity: 'Job',
        entityId: jobId, metadata: { title: existing.title },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
};
exports.deleteEmployerJob = deleteEmployerJob;
const toggleEmployerJobFeatured = async (jobId, employerId) => {
    const job = await db_1.db.job.findFirst({
        where: { id: jobId, postedById: employerId },
        select: { id: true, title: true, isFeatured: true },
    });
    if (!job)
        throw (0, errorHandler_1.createError)('Job not found', 404);
    const newFeatured = !job.isFeatured;
    if (newFeatured) {
        await (0, subscriptionService_1.enforceFeaturedJobLimit)(employerId);
    }
    const updated = await db_1.db.job.update({
        where: { id: jobId },
        data: {
            isFeatured: newFeatured,
            featuredAt: newFeatured ? new Date() : null,
        },
    });
    return updated;
};
exports.toggleEmployerJobFeatured = toggleEmployerJobFeatured;
const adminListJobs = async (filters, { page, limit, skip }) => {
    const where = {};
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
        db_1.db.job.findMany({
            where,
            include: {
                _count: { select: { applications: true } },
                postedBy: { select: { id: true, firstName: true, lastName: true, email: true, companyName: true, companySlug: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip, take: limit,
        }),
        db_1.db.job.count({ where }),
    ]);
    return (0, utils_1.createPaginationResult)(jobs, total, page, limit);
};
exports.adminListJobs = adminListJobs;
const adminCreateJob = async (data) => {
    const job = await db_1.db.job.create({
        data: {
            title: (0, sanitize_1.sanitizeTextOnly)(data.title),
            slug: (0, utils_1.generateUniqueSlug)(data.title),
            description: (0, sanitize_1.sanitizeRichText)(data.description),
            requirements: (data.requirements || []).map((r) => (0, sanitize_1.sanitizeRichText)(r)),
            responsibilities: (data.responsibilities || []).map((r) => (0, sanitize_1.sanitizeRichText)(r)),
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
exports.adminCreateJob = adminCreateJob;
const adminGetJobById = async (jobId) => {
    const job = await db_1.db.job.findUnique({
        where: { id: jobId },
        include: { _count: { select: { applications: true } } },
    });
    if (!job) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    return job;
};
exports.adminGetJobById = adminGetJobById;
const adminUpdateJob = async (jobId, data) => {
    const existing = await db_1.db.job.findUnique({ where: { id: jobId } });
    if (!existing) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    const updateData = { ...data };
    if (data.title !== undefined) {
        updateData.title = (0, sanitize_1.sanitizeTextOnly)(data.title);
        if (data.title !== existing.title) {
            updateData.slug = (0, utils_1.generateUniqueSlug)(data.title);
        }
    }
    if (data.description !== undefined) {
        updateData.description = (0, sanitize_1.sanitizeRichText)(data.description);
    }
    if (data.requirements !== undefined) {
        updateData.requirements = data.requirements.map((r) => (0, sanitize_1.sanitizeRichText)(r));
    }
    if (data.responsibilities !== undefined) {
        updateData.responsibilities = data.responsibilities.map((r) => (0, sanitize_1.sanitizeRichText)(r));
    }
    if (updateData.applicationDeadline) {
        updateData.applicationDeadline = new Date(updateData.applicationDeadline);
    }
    const job = await db_1.db.job.update({ where: { id: jobId }, data: updateData });
    return job;
};
exports.adminUpdateJob = adminUpdateJob;
const adminDeleteJob = async (jobId, actorId, ip, ua) => {
    const job = await db_1.db.job.findUnique({ where: { id: jobId }, select: { id: true, title: true, source: true } });
    if (!job) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    await db_1.db.job.delete({ where: { id: jobId } });
    (0, db_1.logAuditAction)({
        actorId, action: 'JOB_DELETED', entity: 'Job',
        entityId: jobId, metadata: { title: job.title, source: job.source },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
};
exports.adminDeleteJob = adminDeleteJob;
const approveJob = async (jobId, actorId, ip, ua) => {
    const job = await db_1.db.job.findUnique({
        where: { id: jobId },
        include: { postedBy: { select: { email: true, firstName: true } } },
    });
    if (!job) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    const updated = await db_1.db.job.update({
        where: { id: jobId },
        data: { status: 'APPROVED', isApproved: true, isActive: true },
    });
    (0, db_1.logAuditAction)({
        actorId, action: 'JOB_APPROVED', entity: 'Job',
        entityId: jobId, metadata: { title: job.title },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    if (job.source === 'EMPLOYER' && job.postedBy?.email) {
        (0, email_1.sendJobApprovedEmail)(job.postedBy.email, job.postedBy.firstName || '', job.title).catch(() => { });
    }
    return updated;
};
exports.approveJob = approveJob;
const rejectJob = async (jobId, rejectionReason, actorId, ip, ua) => {
    const job = await db_1.db.job.findUnique({
        where: { id: jobId },
        include: { postedBy: { select: { email: true, firstName: true } } },
    });
    if (!job) {
        throw (0, errorHandler_1.createError)('Job not found', 404);
    }
    if (job.source !== 'EMPLOYER') {
        throw (0, errorHandler_1.createError)('Only employer-posted jobs can be rejected', 400);
    }
    const updated = await db_1.db.job.update({
        where: { id: jobId },
        data: { status: 'REJECTED', isApproved: false, isActive: false, rejectionReason },
    });
    (0, db_1.logAuditAction)({
        actorId, action: 'JOB_REJECTED', entity: 'Job',
        entityId: jobId, metadata: { title: job.title, rejectionReason },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    if (job.postedBy?.email) {
        (0, email_1.sendJobRejectedEmail)(job.postedBy.email, job.postedBy.firstName || '', job.title, rejectionReason).catch(() => { });
    }
    return updated;
};
exports.rejectJob = rejectJob;
const getCompanyJobs = async (companyId) => {
    const now = new Date();
    const jobs = await db_1.db.job.findMany({
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
exports.getCompanyJobs = getCompanyJobs;
const getEmployerDashboardStats = async (employerId) => {
    const [totalJobs, activeJobs, pendingJobs, rejectedJobs, totalApplicants] = await Promise.all([
        db_1.db.job.count({ where: { postedById: employerId } }),
        db_1.db.job.count({ where: { postedById: employerId, status: 'APPROVED' } }),
        db_1.db.job.count({ where: { postedById: employerId, status: { in: ['PENDING', 'RESUBMITTED'] } } }),
        db_1.db.job.count({ where: { postedById: employerId, status: 'REJECTED' } }),
        db_1.db.application.count({
            where: { job: { postedById: employerId } },
        }),
    ]);
    return { totalJobs, activeJobs, pendingJobs, rejectedJobs, totalApplicants };
};
exports.getEmployerDashboardStats = getEmployerDashboardStats;
const getAdminDashboardStats = async () => {
    const [totalJobs, approvedJobs, totalUsers, totalApplications, pendingApplications, totalBlogs, publishedBlogs, pendingApprovalJobs,] = await Promise.all([
        db_1.db.job.count(),
        db_1.db.job.count({ where: { status: 'APPROVED' } }),
        db_1.db.user.count({ where: { role: 'USER' } }),
        db_1.db.application.count(),
        db_1.db.application.count({ where: { status: 'PENDING' } }),
        db_1.db.blog.count(),
        db_1.db.blog.count({ where: { isPublished: true } }),
        db_1.db.job.count({ where: { status: { in: ['PENDING', 'RESUBMITTED'] }, source: 'EMPLOYER' } }),
    ]);
    const recentApplications = await db_1.db.application.findMany({
        take: 5,
        orderBy: { appliedAt: 'desc' },
        include: {
            user: { select: { firstName: true, lastName: true, profilePicture: true } },
            job: { select: { title: true, slug: true } },
        },
    });
    const activeJobsPercentage = totalJobs > 0 ? Math.round((approvedJobs / totalJobs) * 100) : 0;
    const applicationRate = totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) : 0;
    return { totalJobs, approvedJobs, activeJobsPercentage, totalUsers, totalApplications, pendingApplications, applicationRate, totalBlogs, publishedBlogs, pendingApprovalJobs, recentApplications };
};
exports.getAdminDashboardStats = getAdminDashboardStats;
//# sourceMappingURL=jobService.js.map