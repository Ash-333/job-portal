"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = exports.validateFileSize = exports.validateFileMagicBytes = exports.validateFileType = exports.createPaginationResult = exports.getPaginationParams = exports.generateCompanySlug = exports.generateUniqueSlug = exports.generateSlug = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nanoid_1 = require("nanoid");
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};
exports.generateSlug = generateSlug;
const generateUniqueSlug = (text) => {
    const baseSlug = (0, exports.generateSlug)(text);
    return `${baseSlug}-${(0, nanoid_1.nanoid)(8)}`;
};
exports.generateUniqueSlug = generateUniqueSlug;
const generateCompanySlug = (companyName) => {
    const base = (0, exports.generateSlug)(companyName) || 'company';
    return `${base}-${(0, nanoid_1.nanoid)(8)}`;
};
exports.generateCompanySlug = generateCompanySlug;
const getPaginationParams = (options) => {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.getPaginationParams = getPaginationParams;
const createPaginationResult = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
exports.createPaginationResult = createPaginationResult;
const FILE_SIGNATURES = {
    'image/jpeg': ['ffd8ff'],
    'image/png': ['89504e470d0a1a0a'],
    'image/webp': ['52494646'],
    'image/gif': ['474946383761', '474946383961'],
    'application/pdf': ['25504446'],
    'application/msword': [],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504b0304'],
};
const validateFileType = (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
};
exports.validateFileType = validateFileType;
const validateFileMagicBytes = (buffer, mimetype) => {
    const signatures = FILE_SIGNATURES[mimetype];
    if (!signatures || signatures.length === 0)
        return true;
    const hex = buffer.subarray(0, 16).toString('hex').toLowerCase();
    if (mimetype === 'image/webp') {
        if (!hex.startsWith('52494646'))
            return false;
        const webpHeader = buffer.subarray(8, 12).toString('ascii');
        return webpHeader === 'WEBP';
    }
    return signatures.some(sig => hex.startsWith(sig));
};
exports.validateFileMagicBytes = validateFileMagicBytes;
const validateFileSize = (size, maxSize) => {
    return size <= maxSize;
};
exports.validateFileSize = validateFileSize;
const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
//# sourceMappingURL=utils.js.map