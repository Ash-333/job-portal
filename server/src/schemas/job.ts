import { z } from 'zod';

// Predefined job categories
export const JOB_CATEGORIES = [
  "Information Technology (IT)",
  "Software Development",
  "Sales & Marketing",
  "Accounting & Finance",
  "Design & Multimedia",
  "Content Writing & Editing",
  "Customer Service & Support",
  "Human Resources (HR)",
  "Education & Teaching",
  "Engineering",
  "Internships",
  "Administration & Operations",
  "Digital Marketing",
  "Project Management",
  "NGO & INGO",
  "Healthcare & Medical",
  "Data Entry & Back Office",
  "Banking & Insurance",
  "Hospitality & Tourism",
  "Legal & Compliance",
  "Logistics & Procurement",
  "Media & Communication",
  "Business Development",
  "Remote Jobs",
  "Other / Miscellaneous"
] as const;

export const createJobSchema = z.object({
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
  companyName: z.string().min(1, 'Company name is required'),
  companyWebsite: z.string().url('Invalid company website URL').optional(),
  companyLogo: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid company logo URL'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  applicationDeadline: z.string().optional().transform((val) => {
    if (!val) return undefined;
    // If it's already a datetime string, return as is
    if (val.includes('T')) return val;
    // If it's a date string (YYYY-MM-DD), convert to datetime
    return new Date(val).toISOString();
  }),
});

export const updateJobSchema = createJobSchema.partial();

export const jobFiltersSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  workLocationType: z.enum(['ONSITE', 'REMOTE', 'HYBRID']).optional(),
  experienceLevel: z.enum(['STUDENT', 'FRESHER', 'INTERNSHIP_ONLY', 'ZERO_TO_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_PLUS_YEARS']).optional(),
  salaryMin: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? undefined : num;
    }
    return val;
  }).optional(),
  salaryMax: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? undefined : num;
    }
    return val;
  }).optional(),
  search: z.string().optional(),
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

export const applyJobSchema = z.object({
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobFiltersInput = z.infer<typeof jobFiltersSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
