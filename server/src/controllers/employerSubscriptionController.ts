import { Request, Response, NextFunction } from 'express';
import * as subscriptionService from '../services/subscriptionService';

export const employerSubscriptionController = {
  getPlans: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await subscriptionService.getPlans(true);
      res.json(plans);
    } catch (error) { next(error); }
  },

  subscribe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sub = await subscriptionService.subscribe(req.user!.id, req.body.planId);
      res.status(201).json({ message: 'Subscription created. Awaiting admin activation.', sub });
    } catch (error) { next(error); }
  },

  getSubscription: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sub = await subscriptionService.getEmployerSubscription(req.user!.id);
      if (!sub) { res.json({ subscribed: false }); return; }
      res.json({ subscribed: true, subscription: sub });
    } catch (error) { next(error); }
  },
};
