import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  experienceLevel: z.enum(['STUDENT', 'FRESHER', 'INTERNSHIP_ONLY', 'ZERO_TO_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_PLUS_YEARS', 'THREE_PLUS_YEARS']).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().max(1000, 'Experience must be less than 1000 characters').optional(),
  education: z.string().max(1000, 'Education must be less than 1000 characters').optional(),
  location: z.string().optional(),
  website: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid website URL'),
  linkedin: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid LinkedIn URL'),
  github: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid GitHub URL'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
