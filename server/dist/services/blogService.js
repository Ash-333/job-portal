"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteBlog = exports.adminUpdateBlog = exports.adminGetBlogById = exports.adminCreateBlog = exports.adminListBlogs = exports.getBlogBySlug = exports.getLatestBlogs = exports.listBlogs = void 0;
const db_1 = require("../lib/db");
const errorHandler_1 = require("../middleware/errorHandler");
const utils_1 = require("../lib/utils");
const sanitize_1 = require("../lib/sanitize");
const listBlogs = async (filters, { page, limit, skip }) => {
    const where = { isPublished: true };
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { excerpt: { contains: filters.search, mode: 'insensitive' } },
            { content: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    const [blogs, total] = await Promise.all([
        db_1.db.blog.findMany({
            where,
            select: {
                id: true, title: true, slug: true, excerpt: true,
                featuredImage: true, publishedAt: true, createdAt: true,
            },
            orderBy: { publishedAt: 'desc' },
            skip, take: limit,
        }),
        db_1.db.blog.count({ where }),
    ]);
    return (0, utils_1.createPaginationResult)(blogs, total, page, limit);
};
exports.listBlogs = listBlogs;
const getLatestBlogs = async (limit) => {
    const blogs = await db_1.db.blog.findMany({
        where: { isPublished: true },
        select: {
            id: true, title: true, slug: true, excerpt: true,
            featuredImage: true, publishedAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
    });
    return blogs;
};
exports.getLatestBlogs = getLatestBlogs;
const getBlogBySlug = async (slug) => {
    const blog = await db_1.db.blog.findUnique({
        where: { slug, isPublished: true },
    });
    if (!blog) {
        throw (0, errorHandler_1.createError)('Blog not found', 404);
    }
    const relatedBlogs = await db_1.db.blog.findMany({
        where: {
            isPublished: true,
            id: { not: blog.id },
        },
        select: {
            id: true, title: true, slug: true, excerpt: true,
            featuredImage: true, publishedAt: true,
        },
        take: 3,
        orderBy: { publishedAt: 'desc' },
    });
    return { blog, relatedBlogs };
};
exports.getBlogBySlug = getBlogBySlug;
const adminListBlogs = async (filters, { page, limit, skip }) => {
    const where = {};
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { excerpt: { contains: filters.search, mode: 'insensitive' } },
            { content: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    if (filters.isPublished !== undefined) {
        where.isPublished = filters.isPublished;
    }
    const [blogs, total] = await Promise.all([
        db_1.db.blog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip, take: limit,
        }),
        db_1.db.blog.count({ where }),
    ]);
    return (0, utils_1.createPaginationResult)(blogs, total, page, limit);
};
exports.adminListBlogs = adminListBlogs;
const adminCreateBlog = async (data, actorId, ip, ua) => {
    const blog = await db_1.db.blog.create({
        data: {
            title: (0, sanitize_1.sanitizeTextOnly)(data.title),
            slug: (0, utils_1.generateUniqueSlug)(data.title),
            content: (0, sanitize_1.sanitizeRichText)(data.content),
            excerpt: data.excerpt ? (0, sanitize_1.sanitizeTextOnly)(data.excerpt) : null,
            featuredImage: data.featuredImage || null,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            metaKeywords: data.metaKeywords || [],
            structuredData: data.structuredData || buildBlogStructuredData(data.title, data.excerpt, data.metaDescription),
            isPublished: data.isPublished || false,
            publishedAt: data.isPublished ? new Date() : null,
        },
    });
    (0, db_1.logAuditAction)({
        actorId, action: 'BLOG_CREATED', entity: 'Blog',
        entityId: blog.id, metadata: { title: blog.title },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return blog;
};
exports.adminCreateBlog = adminCreateBlog;
const adminGetBlogById = async (blogId) => {
    const blog = await db_1.db.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
        throw (0, errorHandler_1.createError)('Blog not found', 404);
    }
    return blog;
};
exports.adminGetBlogById = adminGetBlogById;
const adminUpdateBlog = async (blogId, data, actorId, ip, ua) => {
    const existing = await db_1.db.blog.findUnique({ where: { id: blogId } });
    if (!existing) {
        throw (0, errorHandler_1.createError)('Blog not found', 404);
    }
    const updateData = {};
    if (data.title !== undefined) {
        updateData.title = (0, sanitize_1.sanitizeTextOnly)(data.title);
        if (data.title !== existing.title) {
            updateData.slug = (0, utils_1.generateUniqueSlug)(data.title);
        }
    }
    if (data.content !== undefined) {
        updateData.content = (0, sanitize_1.sanitizeRichText)(data.content);
    }
    if (data.excerpt !== undefined) {
        updateData.excerpt = data.excerpt ? (0, sanitize_1.sanitizeTextOnly)(data.excerpt) : null;
    }
    if (data.featuredImage !== undefined)
        updateData.featuredImage = data.featuredImage;
    if (data.metaTitle !== undefined)
        updateData.metaTitle = (0, sanitize_1.sanitizeTextOnly)(data.metaTitle || '') || null;
    if (data.metaDescription !== undefined)
        updateData.metaDescription = (0, sanitize_1.sanitizeTextOnly)(data.metaDescription || '') || null;
    if (data.metaKeywords !== undefined)
        updateData.metaKeywords = data.metaKeywords;
    if (data.isPublished !== undefined)
        updateData.isPublished = data.isPublished;
    if (data.isPublished && !existing.publishedAt) {
        updateData.publishedAt = new Date();
    }
    if (data.isPublished === false) {
        updateData.publishedAt = null;
    }
    updateData.structuredData = buildBlogStructuredData(data.title || existing.title, data.excerpt || existing.excerpt || undefined, data.metaDescription || existing.metaDescription || undefined);
    const blog = await db_1.db.blog.update({
        where: { id: blogId },
        data: updateData,
    });
    (0, db_1.logAuditAction)({
        actorId, action: 'BLOG_UPDATED', entity: 'Blog',
        entityId: blogId, metadata: { title: blog.title },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
    return blog;
};
exports.adminUpdateBlog = adminUpdateBlog;
const adminDeleteBlog = async (blogId, actorId, ip, ua) => {
    const blog = await db_1.db.blog.findUnique({ where: { id: blogId }, select: { id: true, title: true } });
    if (!blog) {
        throw (0, errorHandler_1.createError)('Blog not found', 404);
    }
    await db_1.db.blog.delete({ where: { id: blogId } });
    (0, db_1.logAuditAction)({
        actorId, action: 'BLOG_DELETED', entity: 'Blog',
        entityId: blogId, metadata: { title: blog.title },
        ipAddress: ip, userAgent: ua,
    }).catch(() => { });
};
exports.adminDeleteBlog = adminDeleteBlog;
const buildBlogStructuredData = (title, excerpt, description) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt || description || title,
    datePublished: new Date().toISOString(),
    author: { '@type': 'Organization', name: process.env.FROM_NAME || 'Job Portal' },
});
//# sourceMappingURL=blogService.js.map