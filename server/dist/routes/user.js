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
const user_1 = require("../schemas/user");
const utils_1 = require("../lib/utils");
const userService = __importStar(require("../services/userService"));
const applicationService = __importStar(require("../services/applicationService"));
const router = express_1.default.Router();
router.put('/profile', auth_1.authenticate, async (req, res, next) => {
    try {
        const validatedData = user_1.updateProfileSchema.parse(req.body);
        const user = await userService.updateProfile(req.user.id, validatedData);
        res.json({ message: 'Profile updated successfully', user });
    }
    catch (error) {
        next(error);
    }
});
router.get('/applications', auth_1.authenticate, async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, utils_1.getPaginationParams)(req.query);
        const result = await applicationService.getUserApplications(req.user.id, { page, limit, skip });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.get('/applications/:applicationId', auth_1.authenticate, async (req, res, next) => {
    try {
        const application = await applicationService.getUserApplicationById(req.params.applicationId, req.user.id);
        res.json({ application });
    }
    catch (error) {
        next(error);
    }
});
router.get('/applications/:applicationId/history', auth_1.authenticate, async (req, res, next) => {
    try {
        const history = await applicationService.getApplicationHistory(req.params.applicationId, req.user.id);
        res.json({ history });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map