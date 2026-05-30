import express from 'express';
import { authenticate, requireEmployer } from '../middleware/auth';
import { employerSubscriptionController } from '../controllers/employerSubscriptionController';

const router = express.Router();
router.use(authenticate, requireEmployer);

router.get('/plans', employerSubscriptionController.getPlans);
router.post('/subscribe', employerSubscriptionController.subscribe);
router.get('/subscription', employerSubscriptionController.getSubscription);

export default router;
