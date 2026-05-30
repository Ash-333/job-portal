"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogFiltersSchema = exports.updateBlogSchema = exports.createBlogSchema = void 0;
const zod_1 = require("zod");
exports.createBlogSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    content: zod_1.z.string().min(1, 'Content is required'),
    excerpt: zod_1.z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
    featuredImage: zod_1.z.string().optional().refine((val) => {
        if (!val || val.trim() === '')
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, 'Invalid featured image URL'),
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    metaKeywords: zod_1.z.array(zod_1.z.string()).optional(),
    isPublished: zod_1.z.boolean().default(false),
});
exports.updateBlogSchema = exports.createBlogSchema.partial();
exports.blogFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    isPublished: zod_1.z.boolean().optional(),
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
//# sourceMappingURL=blog.js.map