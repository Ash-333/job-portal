"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const job_1 = require("../schemas/job");
const blog_1 = require("../schemas/blog");
const admin_1 = require("../schemas/admin");
const utils_1 = require("../lib/utils");
const jobService = __importStar(require("../services/jobService"));
const applicationService = __importStar(require("../services/applicationService"));
const blogService = __importStar(require("../services/blogService"));
const adminService = __importStar(require("../services/adminService"));
exports.adminController = {
    getDashboardStats: async (_req, res, next) => {
        try {
            const stats = await jobService.getAdminDashboardStats();
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    },
    getJobs: async (req, res, next) => {
        try {
            const filters = admin_1.adminJobFiltersSchema.parse(req.query);
            const { page, limit, skip } = (0, utils_1.getPaginationParams)(filters);
            const result = await jobService.adminListJobs(filters, { page, limit, skip });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    createJob: async (req, res, next) => {
        try {
            const validatedData = job_1.createJobSchema.parse(req.body);
            const job = await jobService.adminCreateJob(validatedData);
            res.status(201).json({ message: 'Job created successfully', job });
        }
        catch (error) {
            next(error);
        }
    },
    getJobById: async (req, res, next) => {
        try {
            const job = await jobService.adminGetJobById(req.params.jobId);
            res.json({ job });
        }
        catch (error) {
            next(error);
        }
    },
    updateJob: async (req, res, next) => {
        try {
            const validatedData = job_1.updateJobSchema.parse(req.body);
            const job = await jobService.adminUpdateJob(req.params.jobId, validatedData);
            res.json({ message: 'Job updated successfully', job });
        }
        catch (error) {
            next(error);
        }
    },
    deleteJob: async (req, res, next) => {
        try {
            await jobService.adminDeleteJob(req.params.jobId, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Job deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    },
    approveJob: async (req, res, next) => {
        try {
            const job = await jobService.approveJob(req.params.jobId, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Job approved successfully', job });
        }
        catch (error) {
            next(error);
        }
    },
    rejectJob: async (req, res, next) => {
        try {
            const { rejectionReason } = admin_1.rejectJobSchema.parse(req.body);
            const job = await jobService.rejectJob(req.params.jobId, rejectionReason, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Job rejected successfully', job });
        }
        catch (error) {
            next(error);
        }
    },
    getUsers: async (req, res, next) => {
        try {
            const filters = admin_1.adminUserFiltersSchema.parse(req.query);
            const { page, limit, skip } = (0, utils_1.getPaginationParams)(filters);
            const result = await adminService.getUsers(filters, { page, limit, skip });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    getUserById: async (req, res, next) => {
        try {
            const result = await adminService.getUserById(req.params.userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    deleteUser: async (req, res, next) => {
        try {
            await adminService.deleteUser(req.params.userId, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    },
    getApplications: async (req, res, next) => {
        try {
            const filters = admin_1.adminApplicationFiltersSchema.parse(req.query);
            const { page, limit, skip } = (0, utils_1.getPaginationParams)(filters);
            const result = await applicationService.adminGetApplications(filters, { page, limit, skip });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    updateApplicationStatus: async (req, res, next) => {
        try {
            const { status } = admin_1.updateApplicationStatusSchema.parse(req.body);
            const application = await applicationService.adminUpdateApplicationStatus(req.params.id, status, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Application status updated successfully', application });
        }
        catch (error) {
            next(error);
        }
    },
    getBlogs: async (req, res, next) => {
        try {
            const filters = admin_1.adminBlogFiltersSchema.parse(req.query);
            const { page, limit, skip } = (0, utils_1.getPaginationParams)(filters);
            const result = await blogService.adminListBlogs(filters, { page, limit, skip });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    createBlog: async (req, res, next) => {
        try {
            const validatedData = blog_1.createBlogSchema.parse(req.body);
            const blog = await blogService.adminCreateBlog(validatedData, req.user.id, req.ip, req.headers['user-agent']);
            res.status(201).json({ message: 'Blog created successfully', blog });
        }
        catch (error) {
            next(error);
        }
    },
    getBlogById: async (req, res, next) => {
        try {
            const blog = await blogService.adminGetBlogById(req.params.blogId);
            res.json({ blog });
        }
        catch (error) {
            next(error);
        }
    },
    updateBlog: async (req, res, next) => {
        try {
            const validatedData = blog_1.updateBlogSchema.parse(req.body);
            const blog = await blogService.adminUpdateBlog(req.params.blogId, validatedData, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Blog updated successfully', blog });
        }
        catch (error) {
            next(error);
        }
    },
    deleteBlog: async (req, res, next) => {
        try {
            await blogService.adminDeleteBlog(req.params.blogId, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Blog deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    },
    getAuditLogs: async (req, res, next) => {
        try {
            const { page = 1, limit = 50 } = req.query;
            const p = Math.max(1, parseInt(page) || 1);
            const l = Math.min(100, Math.max(1, parseInt(limit) || 50));
            const skip = (p - 1) * l;
            const result = await adminService.getAuditLogs({ page: p, limit: l, skip });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    cleanupAuditLogs: async (req, res, next) => {
        try {
            const retentionDays = parseInt(req.body.retentionDays) || 15;
            const result = await adminService.cleanupAuditLogs(retentionDays);
            res.json({ message: `Deleted ${result.deletedCount} audit logs older than ${result.retentionDays} days`, result });
        }
        catch (error) {
            next(error);
        }
    },
    suspendUser: async (req, res, next) => {
        try {
            await adminService.suspendUser(req.params.userId, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'User suspended successfully' });
        }
        catch (error) {
            next(error);
        }
    },
    unsuspendUser: async (req, res, next) => {
        try {
            await adminService.unsuspendUser(req.params.userId, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'User unsuspended successfully' });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=adminController.js.map