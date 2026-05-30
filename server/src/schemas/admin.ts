import { z } from 'zod';

// Base pagination schema that handles string-to-number conversion
const basePaginationSchema = {
  page: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? 1 : Math.max(1, num);
    }
    return Math.max(1, val);
  }).default(1),
  limit: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? 10 : Math.min(Math.max(1, num), 100);
    }
    return Math.min(Math.max(1, val), 100);
  }).default(10),
};

// Admin Jobs Filters Schema
export const adminJobFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.union([
    z.enum(['PENDING', 'APPROVED', 'REJECTED', 'RESUBMITTED']),
    z.array(z.enum(['PENDING', 'APPROVED', 'REJECTED', 'RESUBMITTED'])),
  ]).optional(),
  isActive: z.union([z.string(), z.boolean()]).transform((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }).optional(),
  isApproved: z.union([z.string(), z.boolean()]).transform((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }).optional(),
  ...basePaginationSchema,
});

// Admin Users Filters Schema
export const adminUserFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['USER', 'EMPLOYER']).optional(),
  experienceLevel: z.enum(['FRESHER', 'ONE_TO_THREE_YEARS', 'THREE_PLUS_YEARS']).optional(),
  ...basePaginationSchema,
});

// Admin Applications Filters Schema
export const adminApplicationFiltersSchema = z.object({
  jobId: z.string().optional(),
  status: z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED']).optional(),
  ...basePaginationSchema,
});

// Admin Blogs Filters Schema (reuse the existing blog filters schema)
export const adminBlogFiltersSchema = z.object({
  search: z.string().optional(),
  isPublished: z.union([z.string(), z.boolean()]).transform((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }).optional(),
  ...basePaginationSchema,
});

// Application Status Update Schema
export const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED']),
});

// Reject Job Schema
export const rejectJobSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required').max(500, 'Reason too long'),
});

// Type exports
export type AdminJobFilters = z.infer<typeof adminJobFiltersSchema>;
export type AdminUserFilters = z.infer<typeof adminUserFiltersSchema>;
export type AdminApplicationFilters = z.infer<typeof adminApplicationFiltersSchema>;
export type AdminBlogFilters = z.infer<typeof adminBlogFiltersSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
