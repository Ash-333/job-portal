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
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerController = void 0;
const employer_1 = require("../schemas/employer");
const utils_1 = require("../lib/utils");
const jobService = __importStar(require("../services/jobService"));
const applicationService = __importStar(require("../services/applicationService"));
const userService = __importStar(require("../services/userService"));
exports.employerController = {
    getDashboardStats: async (req, res, next) => {
        try {
            const stats = await jobService.getEmployerDashboardStats(req.user.id);
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    },
    getJobs: async (req, res, next) => {
        try {
            const { page, limit, skip } = (0, utils_1.getPaginationParams)(req.query);
            const result = await jobService.getEmployerJobs(req.user.id, { page, limit, skip });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    getJobById: async (req, res, next) => {
        try {
            const job = await jobService.getEmployerJobById(req.params.jobId, req.user.id);
            res.json({ job });
        }
        catch (error) {
            next(error);
        }
    },
    createJob: async (req, res, next) => {
        try {
            const validatedData = employer_1.createEmployerJobSchema.parse(req.body);
            const job = await jobService.createEmployerJob(req.user.id, validatedData, req.ip, req.headers['user-agent']);
            res.status(201).json({ message: 'Job created successfully. It will be reviewed by an admin.', job });
        }
        catch (error) {
            next(error);
        }
    },
    updateJob: async (req, res, next) => {
        try {
            const validatedData = employer_1.updateEmployerJobSchema.parse(req.body);
            const job = await jobService.updateEmployerJob(req.params.jobId, req.user.id, validatedData, req.ip, req.headers['user-agent']);
            res.json({ message: 'Job updated successfully', job });
        }
        catch (error) {
            next(error);
        }
    },
    deleteJob: async (req, res, next) => {
        try {
            await jobService.deleteEmployerJob(req.params.jobId, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Job deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    },
    getApplications: async (req, res, next) => {
        try {
            const { page, limit, skip } = (0, utils_1.getPaginationParams)(req.query);
            const status = req.query.status;
            const result = await applicationService.getJobApplications(req.params.jobId, req.user.id, status, { page, limit, skip });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    updateApplicationStatus: async (req, res, next) => {
        try {
            const { status } = employer_1.employerApplicationStatusSchema.parse(req.body);
            const application = await applicationService.updateApplicationStatus(req.params.id, status, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Application status updated successfully', application });
        }
        catch (error) {
            next(error);
        }
    },
    updateProfile: async (req, res, next) => {
        try {
            const validatedData = employer_1.updateEmployerProfileSchema.parse(req.body);
            const user = await userService.updateEmployerProfile(req.user.id, validatedData);
            res.json({ message: 'Profile updated successfully', user });
        }
        catch (error) {
            next(error);
        }
    },
    toggleFeatured: async (req, res, next) => {
        try {
            const job = await jobService.toggleEmployerJobFeatured(req.params.jobId, req.user.id);
            res.json({ message: job.isFeatured ? 'Job featured' : 'Job unfeatured', job });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=employerController.js.map