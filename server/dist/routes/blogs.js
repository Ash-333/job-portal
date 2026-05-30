"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blog_1 = require("../schemas/blog");
const utils_1 = require("../lib/utils");
const blogService = __importStar(require("../services/blogService"));
const router = express_1.default.Router();
router.get('/', async (req, res, next) => {
    try {
        const filters = blog_1.blogFiltersSchema.parse(req.query);
        const { page, limit, skip } = (0, utils_1.getPaginationParams)(filters);
        const result = await blogService.listBlogs(filters, { page, limit, skip });
        res.json({ blogs: result.data, pagination: result.pagination });
    }
    catch (error) {
        next(error);
    }
});
router.get('/latest', async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 5, 20);
        const blogs = await blogService.getLatestBlogs(limit);
        res.json({ blogs });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:slug', async (req, res, next) => {
    try {
        const result = await blogService.getBlogBySlug(req.params.slug);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=blogs.js.map