import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { jobFiltersSchema, applyJobSchema } from '../schemas/job';
import { getPaginationParams } from '../lib/utils';
import { db } from '../lib/db';
import * as jobService from '../services/jobService';
import * as applicationService from '../services/applicationService';

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP]
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *       - in: query
 *         name: salaryMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: salaryMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = jobFiltersSchema.parse(req.query);
    const { page, limit, skip } = getPaginationParams(filters);
    const result = await jobService.listJobs(filters, { page, limit, skip });
    res.json({ jobs: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/jobs/featured:
 *   get:
 *     summary: Get featured jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Featured jobs retrieved successfully
 */
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 6, 20);
    const jobs = await jobService.getFeaturedJobs(limit);
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/jobs/categories:
 *   get:
 *     summary: Get job categories
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Categories list
 */
router.get('/categories', (_req, res) => {
  const { JOB_CATEGORIES } = require('../schemas/job');
  res.json({ categories: JOB_CATEGORIES });
});

/**
 * @swagger
 * /api/jobs/{slug}:
 *   get:
 *     summary: Get job by slug
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *       404:
 *         description: Job not found
 */
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    await db.job.update({
      where: { slug: req.params.slug },
      data: { viewCount: { increment: 1 } },
    });
    const result = await jobService.getJobBySlug(req.params.slug, req.user?.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Profile incomplete or deadline passed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 *       409:
 *         description: Already applied
 */
router.post('/:jobId/apply', authenticate, async (req, res, next) => {
  try {
    const { message } = applyJobSchema.parse(req.body);
    const application = await applicationService.applyForJob(req.user!.id, req.params.jobId, message);
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    next(error);
  }
});

export default router;
