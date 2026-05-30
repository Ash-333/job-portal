import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { subscriptionController } from '../controllers/subscriptionController';

const router = express.Router();
router.use(authenticate, requireAdmin);

// Plans
router.get('/subscription-plans', subscriptionController.getPlans);
router.get('/subscription-plans/:planId', subscriptionController.getPlanById);
router.post('/subscription-plans', subscriptionController.createPlan);
router.put('/subscription-plans/:planId', subscriptionController.updatePlan);
router.delete('/subscription-plans/:planId', subscriptionController.deletePlan);

// Subscriptions
router.get('/subscriptions', subscriptionController.getSubscriptions);
router.put('/subscriptions/:subscriptionId/activate', subscriptionController.activateSubscription);
router.put('/subscriptions/:subscriptionId/cancel', subscriptionController.cancelSubscription);

// Sponsored Companies
router.get('/sponsored-companies', subscriptionController.getSponsoredCompanies);
router.post('/sponsored-companies', subscriptionController.createSponsoredCompany);
router.put('/sponsored-companies/:id', subscriptionController.updateSponsoredCompany);
router.delete('/sponsored-companies/:id', subscriptionController.deleteSponsoredCompany);

export default router;
