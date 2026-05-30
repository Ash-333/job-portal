import express from 'express';
import { authenticate } from '../middleware/auth';
import { updateProfileSchema } from '../schemas/user';
import { getPaginationParams } from '../lib/utils';
import * as userService from '../services/userService';
import * as applicationService from '../services/applicationService';

const router = express.Router();

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await userService.updateProfile(req.user!.id, validatedData);
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user/applications:
 *   get:
 *     summary: Get user's applications
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/applications', authenticate, async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const result = await applicationService.getUserApplications(req.user!.id, { page, limit, skip });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user/applications/{id}:
 *   get:
 *     summary: Get specific application
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 */
router.get('/applications/:applicationId', authenticate, async (req, res, next) => {
  try {
    const application = await applicationService.getUserApplicationById(req.params.applicationId, req.user!.id);
    res.json({ application });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user/applications/{id}/history:
 *   get:
 *     summary: Get application status history
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 */
router.get('/applications/:applicationId/history', authenticate, async (req, res, next) => {
  try {
    const history = await applicationService.getApplicationHistory(req.params.applicationId, req.user!.id);
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

export default router;
