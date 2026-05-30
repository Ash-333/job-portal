"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyJobSchema = exports.jobFiltersSchema = exports.updateJobSchema = exports.createJobSchema = exports.JOB_CATEGORIES = void 0;
const zod_1 = require("zod");
exports.JOB_CATEGORIES = [
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
];
exports.createJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    requirements: zod_1.z.array(zod_1.z.string()).default([]),
    responsibilities: zod_1.z.array(zod_1.z.string()).default([]),
    category: zod_1.z.enum(exports.JOB_CATEGORIES, {
        errorMap: () => ({ message: 'Please select a valid category' })
    }),
    location: zod_1.z.string().min(1, 'Location is required'),
    jobType: zod_1.z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
    workLocationType: zod_1.z.enum(['ONSITE', 'REMOTE', 'HYBRID']).default('ONSITE'),
    experienceLevel: zod_1.z.enum(['STUDENT', 'FRESHER', 'INTERNSHIP_ONLY', 'ZERO_TO_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_PLUS_YEARS']),
    salaryMin: zod_1.z.number().positive().optional(),
    salaryMax: zod_1.z.number().positive().optional(),
    salaryNegotiable: zod_1.z.boolean().optional().default(false),
    currency: zod_1.z.string().default('NPR'),
    companyName: zod_1.z.string().min(1, 'Company name is required'),
    companyWebsite: zod_1.z.string().url('Invalid company website URL').optional(),
    companyLogo: zod_1.z.string().optional().refine((val) => {
        if (!val || val.trim() === '')
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, 'Invalid company logo URL'),
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
    isFeatured: zod_1.z.boolean().default(false),
    applicationDeadline: zod_1.z.string().optional().transform((val) => {
        if (!val)
            return undefined;
        if (val.includes('T'))
            return val;
        return new Date(val).toISOString();
    }),
});
exports.updateJobSchema = exports.createJobSchema.partial();
exports.jobFiltersSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    jobType: zod_1.z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
    workLocationType: zod_1.z.enum(['ONSITE', 'REMOTE', 'HYBRID']).optional(),
    experienceLevel: zod_1.z.enum(['STUDENT', 'FRESHER', 'INTERNSHIP_ONLY', 'ZERO_TO_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_PLUS_YEARS']).optional(),
    salaryMin: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            return isNaN(num) ? undefined : num;
        }
        return val;
    }).optional(),
    salaryMax: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            return isNaN(num) ? undefined : num;
        }
        return val;
    }).optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            return isNaN(num) ? 1 : num;
        }
        return val;
    }).default(1),
    limit: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            return isNaN(num) ? 10 : Math.min(num, 100);
        }
        return Math.min(val, 100);
    }).default(10),
});
exports.applyJobSchema = zod_1.z.object({
    message: zod_1.z.string().max(1000, 'Message must be less than 1000 characters').optional(),
});
//# sourceMappingURL=job.js.map