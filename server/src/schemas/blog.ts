import { z } from 'zod';

export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  featuredImage: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid featured image URL'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
});

export const updateBlogSchema = createBlogSchema.partial();

export const blogFiltersSchema = z.object({
  search: z.string().optional(),
  isPublished: z.boolean().optional(),
  page: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? 1 : num;
    }
    return val;
  }).default(1),
  limit: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? 10 : Math.min(num, 100);
    }
    return Math.min(val, 100);
  }).default(10),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogFiltersInput = z.infer<typeof blogFiltersSchema>;
