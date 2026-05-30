import { Request, Response, NextFunction } from 'express';
import { getPaginationParams } from '../lib/utils';
import * as subscriptionService from '../services/subscriptionService';

export const subscriptionController = {
  // ── Plans ──
  getPlans: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await subscriptionService.getPlans();
      res.json(plans);
    } catch (error) { next(error); }
  },

  getPlanById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await subscriptionService.getPlanById(req.params.planId);
      res.json(plan);
    } catch (error) { next(error); }
  },

  createPlan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await subscriptionService.createPlan(req.body, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.status(201).json(plan);
    } catch (error) { next(error); }
  },

  updatePlan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await subscriptionService.updatePlan(req.params.planId, req.body, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json(plan);
    } catch (error) { next(error); }
  },

  deletePlan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await subscriptionService.deletePlan(req.params.planId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Plan deleted' });
    } catch (error) { next(error); }
  },

  // ── Subscriptions ──
  getSubscriptions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const result = await subscriptionService.adminListSubscriptions({ page, limit, skip });
      res.json(result);
    } catch (error) { next(error); }
  },

  activateSubscription: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sub = await subscriptionService.activateSubscription(req.params.subscriptionId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json(sub);
    } catch (error) { next(error); }
  },

  cancelSubscription: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sub = await subscriptionService.cancelSubscription(req.params.subscriptionId, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json(sub);
    } catch (error) { next(error); }
  },

  // ── Sponsored Companies ──
  getSponsoredCompanies: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await subscriptionService.adminListSponsoredCompanies({ page: 1, limit: 100, skip: 0 });
      res.json(list);
    } catch (error) { next(error); }
  },

  createSponsoredCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sc = await subscriptionService.createSponsoredCompany(req.body, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.status(201).json(sc);
    } catch (error) { next(error); }
  },

  updateSponsoredCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sc = await subscriptionService.updateSponsoredCompany(req.params.id, req.body, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json(sc);
    } catch (error) { next(error); }
  },

  deleteSponsoredCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await subscriptionService.deleteSponsoredCompany(req.params.id, req.user!.id, req.ip, req.headers['user-agent'] as string);
      res.json({ message: 'Sponsored company removed' });
    } catch (error) { next(error); }
  },
};
