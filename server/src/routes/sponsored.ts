import express from 'express';
import * as subscriptionService from '../services/subscriptionService';

const router = express.Router();

router.get('/sponsored-companies', async (_req, res, next) => {
  try {
    const companies = await subscriptionService.getSponsoredCompanies();
    res.json(companies);
  } catch (error) { next(error); }
});

export default router;
