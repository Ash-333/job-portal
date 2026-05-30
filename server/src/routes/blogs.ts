import express from 'express';
import { blogFiltersSchema } from '../schemas/blog';
import { getPaginationParams } from '../lib/utils';
import * as blogService from '../services/blogService';

const router = express.Router();

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all published blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = blogFiltersSchema.parse(req.query);
    const { page, limit, skip } = getPaginationParams(filters);
    const result = await blogService.listBlogs(filters, { page, limit, skip });
    res.json({ blogs: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/blogs/latest:
 *   get:
 *     summary: Get latest published blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Latest blogs retrieved successfully
 */
router.get('/latest', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
    const blogs = await blogService.getLatestBlogs(limit);
    res.json({ blogs });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/blogs/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const result = await blogService.getBlogBySlug(req.params.slug);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
