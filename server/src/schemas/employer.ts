import { z } from 'zod';
import { JOB_CATEGORIES } from './job';

export const createEmployerJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  category: z.enum(JOB_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  location: z.string().min(1, 'Location is required'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  workLocationType: z.enum(['ONSITE', 'REMOTE', 'HYBRID']).default('ONSITE'),
  experienceLevel: z.enum(['STUDENT', 'FRESHER', 'INTERNSHIP_ONLY', 'ZERO_TO_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_PLUS_YEARS']),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  salaryNegotiable: z.boolean().optional().default(false),
  currency: z.string().default('NPR'),
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
  companyWebsite: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  applicationDeadline: z.string().optional().transform((val) => {
    if (!val) return undefined;
    if (val.includes('T')) return val;
    return new Date(val).toISOString();
  }),
});

export const updateEmployerJobSchema = createEmployerJobSchema.partial();

export const updateEmployerProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').optional(),
  companyDescription: z.string().optional(),
  companyWebsite: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  companyLogo: z.string().optional(),
});

export const employerApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED']),
});

export type CreateEmployerJobInput = z.infer<typeof createEmployerJobSchema>;
export type UpdateEmployerJobInput = z.infer<typeof updateEmployerJobSchema>;
export type UpdateEmployerProfileInput = z.infer<typeof updateEmployerProfileSchema>;
