import { Request, Response, NextFunction } from 'express';
import { createJobSchema, updateJobSchema } from '../schemas/job';
import { createBlogSchema, updateBlogSchema } from '../schemas/blog';
import { adminJobFiltersSchema, adminUserFiltersSchema, adminApplicationFiltersSchema, adminBlogFiltersSchema, updateApplicationStatusSchema, rejectJobSchema } from '../schemas/admin';
import { getPaginationParams } from '../lib/utils';
import * as jobService from '../services/jobService';
import * as applicationService from '../services/applicationService';
import * as blogService from '../services/blogService';
import * as adminService from '../services/adminService';

export const adminController = {
  getDashboardStats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await jobService.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  getJobs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = adminJobFiltersSchema.parse(req.query);
      const { page, limit, skip } = getPaginationParams(filters);
      const result = await jobService.adminListJobs(filters, { page, limit, skip });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  createJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createJobSchema.parse(req.body);
      const job = await jobService.adminCreateJob(validatedData);
      res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
      next(error);
    }
  },

  getJobById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.adminGetJobById(req.params.jobId);
      res.json({ job });
    } catch (error) {
      next(error);
    }
  },

  updateJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = updateJobSchema.parse(req.body);
      const job = await jobService.adminUpdateJob(req.params.jobId, validatedData);
      res.json({ message: 'Job updated successfully', job });
    } catch (error) {
      next(error);
    }
  },

  deleteJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await jobService.adminDeleteJob(req.params.jobId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  approveJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.approveJob(req.params.jobId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Job approved successfully', job });
    } catch (error) {
      next(error);
    }
  },

  rejectJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rejectionReason } = rejectJobSchema.parse(req.body);
      const job = await jobService.rejectJob(req.params.jobId, rejectionReason, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Job rejected successfully', job });
    } catch (error) {
      next(error);
    }
  },

  getUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = adminUserFiltersSchema.parse(req.query);
      const { page, limit, skip } = getPaginationParams(filters);
      const result = await adminService.getUsers(filters, { page, limit, skip });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.getUserById(req.params.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminService.deleteUser(req.params.userId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  getApplications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = adminApplicationFiltersSchema.parse(req.query);
      const { page, limit, skip } = getPaginationParams(filters);
      const result = await applicationService.adminGetApplications(filters, { page, limit, skip });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  updateApplicationStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = updateApplicationStatusSchema.parse(req.body);
      const application = await applicationService.adminUpdateApplicationStatus(req.params.id, status, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Application status updated successfully', application });
    } catch (error) {
      next(error);
    }
  },

  getBlogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = adminBlogFiltersSchema.parse(req.query);
      const { page, limit, skip } = getPaginationParams(filters);
      const result = await blogService.adminListBlogs(filters, { page, limit, skip });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  createBlog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createBlogSchema.parse(req.body);
      const blog = await blogService.adminCreateBlog(validatedData, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.status(201).json({ message: 'Blog created successfully', blog });
    } catch (error) {
      next(error);
    }
  },

  getBlogById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blog = await blogService.adminGetBlogById(req.params.blogId);
      res.json({ blog });
    } catch (error) {
      next(error);
    }
  },

  updateBlog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = updateBlogSchema.parse(req.body);
      const blog = await blogService.adminUpdateBlog(req.params.blogId, validatedData, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Blog updated successfully', blog });
    } catch (error) {
      next(error);
    }
  },

  deleteBlog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await blogService.adminDeleteBlog(req.params.blogId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  getAuditLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const p = Math.max(1, parseInt(page as string) || 1);
      const l = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
      const skip = (p - 1) * l;
      const result = await adminService.getAuditLogs({ page: p, limit: l, skip });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  cleanupAuditLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const retentionDays = parseInt(req.body.retentionDays as string) || 15;
      const result = await adminService.cleanupAuditLogs(retentionDays);
      res.json({ message: `Deleted ${result.deletedCount} audit logs older than ${result.retentionDays} days`, result });
    } catch (error) {
      next(error);
    }
  },

  suspendUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminService.suspendUser(req.params.userId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'User suspended successfully' });
    } catch (error) {
      next(error);
    }
  },

  unsuspendUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminService.unsuspendUser(req.params.userId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'User unsuspended successfully' });
    } catch (error) {
      next(error);
    }
  },
};
