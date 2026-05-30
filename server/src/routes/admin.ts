import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { adminController } from '../controllers/adminController';

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticate, requireAdmin);

// ============ DASHBOARD STATS ============

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin)
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

// ============ JOB MANAGEMENT ============

/**
 * @swagger
 * /api/admin/jobs:
 *   get:
 *     summary: Get all jobs (Admin)
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/jobs', adminController.getJobs);

/**
 * @swagger
 * /api/admin/jobs:
 *   post:
 *     summary: Create a new job (Admin)
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJob'
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/jobs', adminController.createJob);

/**
 * @swagger
 * /api/admin/jobs/{jobId}:
 *   get:
 *     summary: Get job by ID (Admin)
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *       404:
 *         description: Job not found
 */
router.get('/jobs/:jobId', adminController.getJobById);

/**
 * @swagger
 * /api/admin/jobs/{jobId}:
 *   put:
 *     summary: Update job (Admin)
 *     tags: [Admin - Jobs]
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
 *             $ref: '#/components/schemas/UpdateJob'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job not found
 */
router.put('/jobs/:jobId', adminController.updateJob);

/**
 * @swagger
 * /api/admin/jobs/{jobId}:
 *   delete:
 *     summary: Delete job (Admin)
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 */
router.delete('/jobs/:jobId', adminController.deleteJob);

/**
 * @swagger
 * /api/admin/jobs/{jobId}/approve:
 *   put:
 *     summary: Approve a job posting (Admin)
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job approved successfully
 *       404:
 *         description: Job not found
 */
router.put('/jobs/:jobId/approve', adminController.approveJob);

/**
 * @swagger
 * /api/admin/jobs/{jobId}/reject:
 *   put:
 *     summary: Reject a job posting (Admin)
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job rejected
 *       404:
 *         description: Job not found
 */
router.put('/jobs/:jobId/reject', adminController.rejectJob);

// ============ APPLICATION MANAGEMENT ============

/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     summary: Get all applications (Admin)
 *     tags: [Admin - Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, REVIEWED, ACCEPTED, REJECTED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get('/applications', adminController.getApplications);

/**
 * @swagger
 * /api/admin/applications/{applicationId}/status:
 *   put:
 *     summary: Update application status (Admin)
 *     tags: [Admin - Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, REVIEWED, ACCEPTED, REJECTED]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       404:
 *         description: Application not found
 */
router.put('/applications/:applicationId/status', adminController.updateApplicationStatus);

// ============ USER MANAGEMENT ============

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [FRESHER, ONE_TO_THREE_YEARS, THREE_PLUS_YEARS]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', adminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user details (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/users/:userId', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{userId}/profile:
 *   get:
 *     summary: Get detailed user profile (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/users/:userId/profile', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete user (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Cannot delete admin user
 */
router.delete('/users/:userId', adminController.deleteUser);

// ============ BLOG MANAGEMENT ============

/**
 * @swagger
 * /api/admin/blogs:
 *   get:
 *     summary: Get all blogs (Admin)
 *     tags: [Admin - Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
router.get('/blogs', adminController.getBlogs);

/**
 * @swagger
 * /api/admin/blogs:
 *   post:
 *     summary: Create a new blog (Admin)
 *     tags: [Admin - Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBlog'
 *     responses:
 *       201:
 *         description: Blog created successfully
 */
router.post('/blogs', adminController.createBlog);

/**
 * @swagger
 * /api/admin/blogs/{blogId}:
 *   get:
 *     summary: Get blog by ID (Admin)
 *     tags: [Admin - Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
router.get('/blogs/:blogId', adminController.getBlogById);

/**
 * @swagger
 * /api/admin/blogs/{blogId}:
 *   put:
 *     summary: Update blog (Admin)
 *     tags: [Admin - Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBlog'
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       404:
 *         description: Blog not found
 */
router.put('/blogs/:blogId', adminController.updateBlog);

/**
 * @swagger
 * /api/admin/blogs/{blogId}:
 *   delete:
 *     summary: Delete blog (Admin)
 *     tags: [Admin - Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 */
router.delete('/blogs/:blogId', adminController.deleteBlog);

// ============ AUDIT LOGS ============

router.get('/audit-logs', adminController.getAuditLogs);

/**
 * @swagger
 * /api/admin/audit-logs/cleanup:
 *   delete:
 *     summary: Delete audit logs older than retention days
 *     tags: [Admin - Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               retentionDays:
 *                 type: integer
 *                 default: 15
 *     responses:
 *       200:
 *         description: Audit logs cleaned up
 */
router.delete('/audit-logs/cleanup', adminController.cleanupAuditLogs);

// ============ USER SUSPENSION ============

/**
 * @swagger
 * /api/admin/users/{userId}/suspend:
 *   put:
 *     summary: Suspend a user account
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User suspended
 *       403:
 *         description: Cannot suspend admin
 */
router.put('/users/:userId/suspend', adminController.suspendUser);

/**
 * @swagger
 * /api/admin/users/{userId}/unsuspend:
 *   put:
 *     summary: Unsuspend a user account
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unsuspended
 */
router.put('/users/:userId/unsuspend', adminController.unsuspendUser);

export default router;
