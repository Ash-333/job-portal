import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { uploadFile, deleteFile } from '../lib/supabase';
import { db } from '../lib/db';
import { createError } from '../middleware/errorHandler';
import { validateFileType, validateFileSize, validateFileMagicBytes, generateRandomString } from '../lib/utils';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * @swagger
 * /api/upload/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post('/profile-picture', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file provided', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validateFileType(req.file.mimetype, allowedTypes)) {
      throw createError('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
    }

    // Validate file content by magic bytes (prevents MIME spoofing)
    if (!validateFileMagicBytes(req.file.buffer, req.file.mimetype)) {
      throw createError('File content does not match the declared type', 400);
    }

    // Validate file size (5MB for profile pictures)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validateFileSize(req.file.size, maxSize)) {
      throw createError('File size too large. Maximum 5MB allowed', 400);
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `profile-pictures/${req.user!.id}-${generateRandomString(8)}.${fileExtension}`;

    // Upload to Supabase
    const publicUrl = await uploadFile(
      req.file.buffer,
      fileName,
      'uploads',
      req.file.mimetype
    );

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: req.user!.id },
      data: { profilePicture: publicUrl },
      select: {
        id: true,
        profilePicture: true,
      }
    });

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/upload/resume:
 *   post:
 *     summary: Upload resume
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post('/resume', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file provided', 400);
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validateFileType(req.file.mimetype, allowedTypes)) {
      throw createError('Invalid file type. Only PDF, DOC, and DOCX are allowed', 400);
    }

    // Validate file content by magic bytes (prevents MIME spoofing)
    if (!validateFileMagicBytes(req.file.buffer, req.file.mimetype)) {
      throw createError('File content does not match the declared type', 400);
    }

    // Validate file size (10MB for resumes)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (!validateFileSize(req.file.size, maxSize)) {
      throw createError('File size too large. Maximum 10MB allowed', 400);
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `resumes/${req.user!.id}-${generateRandomString(8)}.${fileExtension}`;

    // Upload to Supabase
    const publicUrl = await uploadFile(
      req.file.buffer,
      fileName,
      'uploads',
      req.file.mimetype
    );

    // Get current user data to check profile completion
    const currentUser = await db.user.findUnique({
      where: { id: req.user!.id },
      select: {
        firstName: true,
        lastName: true,
        bio: true,
        skills: true,
        location: true,
      }
    });

    // Check if profile is complete with the new resume
    const isProfileComplete = !!(
      currentUser?.firstName &&
      currentUser?.lastName &&
      currentUser?.bio &&
      currentUser?.skills && currentUser.skills.length > 0 &&
      currentUser?.location &&
      publicUrl // Resume is now uploaded
    );

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: req.user!.id },
      data: {
        resume: publicUrl,
        profileCompleted: isProfileComplete,
      },
      select: {
        id: true,
        resume: true,
        profileCompleted: true,
      }
    });

    res.json({
      message: 'Resume uploaded successfully',
      resume: updatedUser.resume,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/upload/blog-image:
 *   post:
 *     summary: Upload blog featured image (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog image uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/blog-image', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      throw createError('Admin access required', 403);
    }

    if (!req.file) {
      throw createError('No file provided', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validateFileType(req.file.mimetype, allowedTypes)) {
      throw createError('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
    }

    // Validate file content by magic bytes (prevents MIME spoofing)
    if (!validateFileMagicBytes(req.file.buffer, req.file.mimetype)) {
      throw createError('File content does not match the declared type', 400);
    }

    // Validate file size (5MB for blog images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validateFileSize(req.file.size, maxSize)) {
      throw createError('File size too large. Maximum 5MB allowed', 400);
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `blog-images/${Date.now()}-${generateRandomString(8)}.${fileExtension}`;

    // Upload to Supabase
    const publicUrl = await uploadFile(
      req.file.buffer,
      fileName,
      'uploads',
      req.file.mimetype
    );

    res.json({
      message: 'Blog image uploaded successfully',
      imageUrl: publicUrl,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/upload/company-logo:
 *   post:
 *     summary: Upload company logo (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Company logo uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/company-logo', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    // Allow ADMIN or EMPLOYER role
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'EMPLOYER') {
      throw createError('Admin or employer access required', 403);
    }

    if (!req.file) {
      throw createError('No file provided', 400);
    }

    // Validate file type (SVG excluded — XSS risk from embedded <script> tags)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validateFileType(req.file.mimetype, allowedTypes)) {
      throw createError('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
    }

    // Validate file content by magic bytes (prevents MIME spoofing)
    if (!validateFileMagicBytes(req.file.buffer, req.file.mimetype)) {
      throw createError('File content does not match the declared type', 400);
    }

    // Validate file size (2MB for company logos)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!validateFileSize(req.file.size, maxSize)) {
      throw createError('File size too large. Maximum 2MB allowed', 400);
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `company-logos/${Date.now()}-${generateRandomString(8)}.${fileExtension}`;

    // Upload to Supabase
    const publicUrl = await uploadFile(
      req.file.buffer,
      fileName,
      'uploads',
      req.file.mimetype
    );

    res.json({
      message: 'Company logo uploaded successfully',
      logoUrl: publicUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
