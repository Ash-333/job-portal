type PaginationParams = {
    page: number;
    limit: number;
    skip: number;
};
export declare const listBlogs: (filters: any, { page, limit, skip }: PaginationParams) => Promise<import("../lib/utils").PaginationResult<{
    id: string;
    createdAt: Date;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: Date | null;
}>>;
export declare const getLatestBlogs: (limit: number) => Promise<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: Date | null;
}[]>;
export declare const getBlogBySlug: (slug: string) => Promise<{
    blog: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        metaTitle: string | null;
        metaDescription: string | null;
        slug: string;
        isPublished: boolean;
        content: string;
        excerpt: string | null;
        featuredImage: string | null;
        metaKeywords: string[];
        structuredData: import("@prisma/client/runtime/library").JsonValue | null;
        publishedAt: Date | null;
    };
    relatedBlogs: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        featuredImage: string | null;
        publishedAt: Date | null;
    }[];
}>;
export declare const adminListBlogs: (filters: any, { page, limit, skip }: PaginationParams) => Promise<import("../lib/utils").PaginationResult<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    metaTitle: string | null;
    metaDescription: string | null;
    slug: string;
    isPublished: boolean;
    content: string;
    excerpt: string | null;
    featuredImage: string | null;
    metaKeywords: string[];
    structuredData: import("@prisma/client/runtime/library").JsonValue | null;
    publishedAt: Date | null;
}>>;
export declare const adminCreateBlog: (data: any, actorId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    metaTitle: string | null;
    metaDescription: string | null;
    slug: string;
    isPublished: boolean;
    content: string;
    excerpt: string | null;
    featuredImage: string | null;
    metaKeywords: string[];
    structuredData: import("@prisma/client/runtime/library").JsonValue | null;
    publishedAt: Date | null;
}>;
export declare const adminGetBlogById: (blogId: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    metaTitle: string | null;
    metaDescription: string | null;
    slug: string;
    isPublished: boolean;
    content: string;
    excerpt: string | null;
    featuredImage: string | null;
    metaKeywords: string[];
    structuredData: import("@prisma/client/runtime/library").JsonValue | null;
    publishedAt: Date | null;
}>;
export declare const adminUpdateBlog: (blogId: string, data: any, actorId: string, ip?: string, ua?: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    metaTitle: string | null;
    metaDescription: string | null;
    slug: string;
    isPublished: boolean;
    content: string;
    excerpt: string | null;
    featuredImage: string | null;
    metaKeywords: string[];
    structuredData: import("@prisma/client/runtime/library").JsonValue | null;
    publishedAt: Date | null;
}>;
export declare const adminDeleteBlog: (blogId: string, actorId: string, ip?: string, ua?: string) => Promise<void>;
export {};
//# sourceMappingURL=blogService.d.ts.map