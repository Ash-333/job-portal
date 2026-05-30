"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const employerController_1 = require("../controllers/employerController");
const router = express_1.default.Router();
router.use(auth_1.authenticate, auth_1.requireEmployer);
router.get('/dashboard/stats', employerController_1.employerController.getDashboardStats);
router.get('/jobs', employerController_1.employerController.getJobs);
router.post('/jobs', employerController_1.employerController.createJob);
router.get('/jobs/:jobId', employerController_1.employerController.getJobById);
router.put('/jobs/:jobId', employerController_1.employerController.updateJob);
router.delete('/jobs/:jobId', employerController_1.employerController.deleteJob);
router.get('/jobs/:jobId/applications', employerController_1.employerController.getApplications);
router.put('/applications/:applicationId/status', employerController_1.employerController.updateApplicationStatus);
router.put('/jobs/:jobId/toggle-featured', employerController_1.employerController.toggleFeatured);
router.put('/profile', employerController_1.employerController.updateProfile);
exports.default = router;
//# sourceMappingURL=employer.js.map