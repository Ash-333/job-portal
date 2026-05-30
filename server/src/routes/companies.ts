import express from 'express';
import * as userService from '../services/userService';
import * as jobService from '../services/jobService';

const router = express.Router();

/**
 * @swagger
 * /api/companies/{companySlug}:
 *   get:
 *     summary: Get public company profile and active jobs
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: companySlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company profile retrieved successfully
 *       404:
 *         description: Company not found
 */
router.get('/:companySlug', async (req, res, next) => {
  try {
    const company = await userService.getCompanyProfile(req.params.companySlug);
    const jobs = await jobService.getCompanyJobs(company.id);
    res.json({ company, jobs, totalJobs: jobs.length });
  } catch (error) {
    next(error);
  }
});

export default router;
