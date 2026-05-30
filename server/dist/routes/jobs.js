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
const auth_1 = require("../middleware/auth");
const job_1 = require("../schemas/job");
const utils_1 = require("../lib/utils");
const jobService = __importStar(require("../services/jobService"));
const applicationService = __importStar(require("../services/applicationService"));
const router = express_1.default.Router();
router.get('/', async (req, res, next) => {
    try {
        const filters = job_1.jobFiltersSchema.parse(req.query);
        const { page, limit, skip } = (0, utils_1.getPaginationParams)(filters);
        const result = await jobService.listJobs(filters, { page, limit, skip });
        res.json({ jobs: result.data, pagination: result.pagination });
    }
    catch (error) {
        next(error);
    }
});
router.get('/featured', async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 6, 20);
        const jobs = await jobService.getFeaturedJobs(limit);
        res.json({ jobs });
    }
    catch (error) {
        next(error);
    }
});
router.get('/categories', (_req, res) => {
    const { JOB_CATEGORIES } = require('../schemas/job');
    res.json({ categories: JOB_CATEGORIES });
});
router.get('/:slug', auth_1.optionalAuth, async (req, res, next) => {
    try {
        const result = await jobService.getJobBySlug(req.params.slug, req.user?.id);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/:jobId/apply', auth_1.authenticate, async (req, res, next) => {
    try {
        const { message } = job_1.applyJobSchema.parse(req.body);
        const application = await applicationService.applyForJob(req.user.id, req.params.jobId, message);
        res.status(201).json({ message: 'Application submitted successfully', application });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=jobs.js.map