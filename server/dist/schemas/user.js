"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
    phone: zod_1.z.string().optional(),
    experienceLevel: zod_1.z.enum(['STUDENT', 'FRESHER', 'INTERNSHIP_ONLY', 'ZERO_TO_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_PLUS_YEARS', 'THREE_PLUS_YEARS']).optional(),
    bio: zod_1.z.string().max(500, 'Bio must be less than 500 characters').optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    experience: zod_1.z.string().max(1000, 'Experience must be less than 1000 characters').optional(),
    education: zod_1.z.string().max(1000, 'Education must be less than 1000 characters').optional(),
    location: zod_1.z.string().optional(),
    website: zod_1.z.string().optional().refine((val) => {
        if (!val || val.trim() === '')
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, 'Invalid website URL'),
    linkedin: zod_1.z.string().optional().refine((val) => {
        if (!val || val.trim() === '')
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, 'Invalid LinkedIn URL'),
    github: zod_1.z.string().optional().refine((val) => {
        if (!val || val.trim() === '')
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, 'Invalid GitHub URL'),
});
//# sourceMappingURL=user.js.map