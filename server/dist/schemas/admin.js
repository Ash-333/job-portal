"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectJobSchema = exports.updateApplicationStatusSchema = exports.adminBlogFiltersSchema = exports.adminApplicationFiltersSchema = exports.adminUserFiltersSchema = exports.adminJobFiltersSchema = void 0;
const zod_1 = require("zod");
const basePaginationSchema = {
    page: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            return isNaN(num) ? 1 : Math.max(1, num);
        }
        return Math.max(1, val);
    }).default(1),
    limit: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            return isNaN(num) ? 10 : Math.min(Math.max(1, num), 100);
        }
        return Math.min(Math.max(1, val), 100);
    }).default(10),
};
exports.adminJobFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    status: zod_1.z.union([
        zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'RESUBMITTED']),
        zod_1.z.array(zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'RESUBMITTED'])),
    ]).optional(),
    isActive: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean()]).transform((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }).optional(),
    isApproved: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean()]).transform((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }).optional(),
    ...basePaginationSchema,
});
exports.adminUserFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    role: zod_1.z.enum(['USER', 'EMPLOYER']).optional(),
    experienceLevel: zod_1.z.enum(['FRESHER', 'ONE_TO_THREE_YEARS', 'THREE_PLUS_YEARS']).optional(),
    ...basePaginationSchema,
});
exports.adminApplicationFiltersSchema = zod_1.z.object({
    jobId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED']).optional(),
    ...basePaginationSchema,
});
exports.adminBlogFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    isPublished: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean()]).transform((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }).optional(),
    ...basePaginationSchema,
});
exports.updateApplicationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED']),
});
exports.rejectJobSchema = zod_1.z.object({
    rejectionReason: zod_1.z.string().min(1, 'Rejection reason is required').max(500, 'Reason too long'),
});
//# sourceMappingURL=admin.js.map