"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerApplicationStatusSchema = exports.updateEmployerProfileSchema = exports.updateEmployerJobSchema = exports.createEmployerJobSchema = void 0;
const zod_1 = require("zod");
const job_1 = require("./job");
exports.createEmployerJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    requirements: zod_1.z.array(zod_1.z.string()).default([]),
    responsibilities: zod_1.z.array(zod_1.z.string()).default([]),
    category: zod_1.z.enum(job_1.JOB_CATEGORIES, {
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
    companyName: zod_1.z.string().optional(),
    companyLogo: zod_1.z.string().optional(),
    companyWebsite: zod_1.z.string().optional(),
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    applicationDeadline: zod_1.z.string().optional().transform((val) => {
        if (!val)
            return undefined;
        if (val.includes('T'))
            return val;
        return new Date(val).toISOString();
    }),
});
exports.updateEmployerJobSchema = exports.createEmployerJobSchema.partial();
exports.updateEmployerProfileSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1, 'Company name is required').optional(),
    companyDescription: zod_1.z.string().optional(),
    companyWebsite: zod_1.z.string().optional(),
    companySize: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    companyLogo: zod_1.z.string().optional(),
});
exports.employerApplicationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED']),
});
//# sourceMappingURL=employer.js.map