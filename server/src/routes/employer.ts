import express from 'express';
import { authenticate, requireEmployer } from '../middleware/auth';
import { employerController } from '../controllers/employerController';

const router = express.Router();

// Apply employer auth to all routes
router.use(authenticate, requireEmployer);

// Dashboard
router.get('/dashboard/stats', employerController.getDashboardStats);

// Job management
router.get('/jobs', employerController.getJobs);
router.post('/jobs', employerController.createJob);
router.get('/jobs/:jobId', employerController.getJobById);
router.put('/jobs/:jobId', employerController.updateJob);
router.delete('/jobs/:jobId', employerController.deleteJob);

// Application management
router.get('/jobs/:jobId/applications', employerController.getApplications);
router.put('/applications/:applicationId/status', employerController.updateApplicationStatus);

// Job features
router.put('/jobs/:jobId/toggle-featured', employerController.toggleFeatured);

// Profile management
router.put('/profile', employerController.updateProfile);

export default router;
