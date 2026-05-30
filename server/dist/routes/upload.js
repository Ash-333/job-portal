"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../lib/supabase");
const db_1 = require("../lib/db");
const errorHandler_1 = require("../middleware/errorHandler");
const utils_1 = require("../lib/utils");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
router.post('/profile-picture', auth_1.authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw (0, errorHandler_1.createError)('No file provided', 400);
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!(0, utils_1.validateFileType)(req.file.mimetype, allowedTypes)) {
            throw (0, errorHandler_1.createError)('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
        }
        if (!(0, utils_1.validateFileMagicBytes)(req.file.buffer, req.file.mimetype)) {
            throw (0, errorHandler_1.createError)('File content does not match the declared type', 400);
        }
        const maxSize = 5 * 1024 * 1024;
        if (!(0, utils_1.validateFileSize)(req.file.size, maxSize)) {
            throw (0, errorHandler_1.createError)('File size too large. Maximum 5MB allowed', 400);
        }
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `profile-pictures/${req.user.id}-${(0, utils_1.generateRandomString)(8)}.${fileExtension}`;
        const publicUrl = await (0, supabase_1.uploadFile)(req.file.buffer, fileName, 'uploads', req.file.mimetype);
        const updatedUser = await db_1.db.user.update({
            where: { id: req.user.id },
            data: { profilePicture: publicUrl },
            select: {
                id: true,
                profilePicture: true,
            }
        });
        res.json({
            message: 'Profile picture uploaded successfully',
            profilePicture: updatedUser.profilePicture,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/resume', auth_1.authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw (0, errorHandler_1.createError)('No file provided', 400);
        }
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!(0, utils_1.validateFileType)(req.file.mimetype, allowedTypes)) {
            throw (0, errorHandler_1.createError)('Invalid file type. Only PDF, DOC, and DOCX are allowed', 400);
        }
        if (!(0, utils_1.validateFileMagicBytes)(req.file.buffer, req.file.mimetype)) {
            throw (0, errorHandler_1.createError)('File content does not match the declared type', 400);
        }
        const maxSize = 10 * 1024 * 1024;
        if (!(0, utils_1.validateFileSize)(req.file.size, maxSize)) {
            throw (0, errorHandler_1.createError)('File size too large. Maximum 10MB allowed', 400);
        }
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `resumes/${req.user.id}-${(0, utils_1.generateRandomString)(8)}.${fileExtension}`;
        const publicUrl = await (0, supabase_1.uploadFile)(req.file.buffer, fileName, 'uploads', req.file.mimetype);
        const currentUser = await db_1.db.user.findUnique({
            where: { id: req.user.id },
            select: {
                firstName: true,
                lastName: true,
                bio: true,
                skills: true,
                location: true,
            }
        });
        const isProfileComplete = !!(currentUser?.firstName &&
            currentUser?.lastName &&
            currentUser?.bio &&
            currentUser?.skills && currentUser.skills.length > 0 &&
            currentUser?.location &&
            publicUrl);
        const updatedUser = await db_1.db.user.update({
            where: { id: req.user.id },
            data: {
                resume: publicUrl,
                profileCompleted: isProfileComplete,
            },
            select: {
                id: true,
                resume: true,
                profileCompleted: true,
            }
        });
        res.json({
            message: 'Resume uploaded successfully',
            resume: updatedUser.resume,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/blog-image', auth_1.authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            throw (0, errorHandler_1.createError)('Admin access required', 403);
        }
        if (!req.file) {
            throw (0, errorHandler_1.createError)('No file provided', 400);
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!(0, utils_1.validateFileType)(req.file.mimetype, allowedTypes)) {
            throw (0, errorHandler_1.createError)('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
        }
        if (!(0, utils_1.validateFileMagicBytes)(req.file.buffer, req.file.mimetype)) {
            throw (0, errorHandler_1.createError)('File content does not match the declared type', 400);
        }
        const maxSize = 5 * 1024 * 1024;
        if (!(0, utils_1.validateFileSize)(req.file.size, maxSize)) {
            throw (0, errorHandler_1.createError)('File size too large. Maximum 5MB allowed', 400);
        }
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `blog-images/${Date.now()}-${(0, utils_1.generateRandomString)(8)}.${fileExtension}`;
        const publicUrl = await (0, supabase_1.uploadFile)(req.file.buffer, fileName, 'uploads', req.file.mimetype);
        res.json({
            message: 'Blog image uploaded successfully',
            imageUrl: publicUrl,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/company-logo', auth_1.authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            throw (0, errorHandler_1.createError)('Admin access required', 403);
        }
        if (!req.file) {
            throw (0, errorHandler_1.createError)('No file provided', 400);
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!(0, utils_1.validateFileType)(req.file.mimetype, allowedTypes)) {
            throw (0, errorHandler_1.createError)('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
        }
        if (!(0, utils_1.validateFileMagicBytes)(req.file.buffer, req.file.mimetype)) {
            throw (0, errorHandler_1.createError)('File content does not match the declared type', 400);
        }
        const maxSize = 2 * 1024 * 1024;
        if (!(0, utils_1.validateFileSize)(req.file.size, maxSize)) {
            throw (0, errorHandler_1.createError)('File size too large. Maximum 2MB allowed', 400);
        }
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `company-logos/${Date.now()}-${(0, utils_1.generateRandomString)(8)}.${fileExtension}`;
        const publicUrl = await (0, supabase_1.uploadFile)(req.file.buffer, fileName, 'uploads', req.file.mimetype);
        res.json({
            message: 'Company logo uploaded successfully',
            logoUrl: publicUrl,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map