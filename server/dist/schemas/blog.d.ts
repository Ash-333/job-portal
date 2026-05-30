import { z } from 'zod';
export declare const createBlogSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    featuredImage: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDescription: z.ZodOptional<z.ZodString>;
    metaKeywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    isPublished: boolean;
    content: string;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    excerpt?: string | undefined;
    featuredImage?: string | undefined;
    metaKeywords?: string[] | undefined;
}, {
    title: string;
    content: string;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    isPublished?: boolean | undefined;
    excerpt?: string | undefined;
    featuredImage?: string | undefined;
    metaKeywords?: string[] | undefined;
}>;
export declare const updateBlogSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    excerpt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    featuredImage: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
    metaTitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    metaDescription: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    metaKeywords: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    isPublished: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    isPublished?: boolean | undefined;
    content?: string | undefined;
    excerpt?: string | undefined;
    featuredImage?: string | undefined;
    metaKeywords?: string[] | undefined;
}, {
    title?: string | undefined;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    isPublished?: boolean | undefined;
    content?: string | undefined;
    excerpt?: string | undefined;
    featuredImage?: string | undefined;
    metaKeywords?: string[] | undefined;
}>;
export declare const blogFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    isPublished?: boolean | undefined;
}, {
    search?: string | undefined;
    page?: string | number | undefined;
    limit?: string | number | undefined;
    isPublished?: boolean | undefined;
}>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogFiltersInput = z.infer<typeof blogFiltersSchema>;
//# sourceMappingURL=blog.d.ts.map