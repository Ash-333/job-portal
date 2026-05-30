import { Request, Response, NextFunction } from 'express';
import { createEmployerJobSchema, updateEmployerJobSchema, updateEmployerProfileSchema, employerApplicationStatusSchema } from '../schemas/employer';
import { getPaginationParams } from '../lib/utils';
import * as jobService from '../services/jobService';
import * as applicationService from '../services/applicationService';
import * as userService from '../services/userService';
import * as subscriptionService from '../services/subscriptionService';

export const employerController = {
  getDashboardStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await jobService.getEmployerDashboardStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  getJobs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const result = await jobService.getEmployerJobs(req.user!.id, { page, limit, skip });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getJobById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.getEmployerJobById(req.params.jobId, req.user!.id);
      res.json({ job });
    } catch (error) {
      next(error);
    }
  },

  createJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createEmployerJobSchema.parse(req.body);
      const job = await jobService.createEmployerJob(req.user!.id, validatedData, req.ip, req.headers['user-agent'] as string);
      res.status(201).json({ message: 'Job created successfully. It will be reviewed by an admin.', job });
    } catch (error) {
      next(error);
    }
  },

  updateJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = updateEmployerJobSchema.parse(req.body);
      const job = await jobService.updateEmployerJob(req.params.jobId, req.user!.id, validatedData, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Job updated successfully', job });
    } catch (error) {
      next(error);
    }
  },

  deleteJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await jobService.deleteEmployerJob(req.params.jobId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  getApplications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const status = req.query.status as string | undefined;
      const result = await applicationService.getJobApplications(req.params.jobId, req.user!.id, { page, limit, skip }, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  updateApplicationStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = employerApplicationStatusSchema.parse(req.body);
      const application = await applicationService.updateApplicationStatus(req.params.id, status, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Application status updated successfully', application });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = updateEmployerProfileSchema.parse(req.body);
      const user = await userService.updateEmployerProfile(req.user!.id, validatedData);
      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      next(error);
    }
  },

  toggleFeatured: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.toggleEmployerJobFeatured(req.params.jobId, req.user!.id);
      res.json({ message: job.isFeatured ? 'Job featured' : 'Job unfeatured', job });
    } catch (error) {
      next(error);
    }
  },
};
