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
exports.subscriptionController = void 0;
const utils_1 = require("../lib/utils");
const subscriptionService = __importStar(require("../services/subscriptionService"));
exports.subscriptionController = {
    getPlans: async (_req, res, next) => {
        try {
            const plans = await subscriptionService.getPlans();
            res.json(plans);
        }
        catch (error) {
            next(error);
        }
    },
    getPlanById: async (req, res, next) => {
        try {
            const plan = await subscriptionService.getPlanById(req.params.planId);
            res.json(plan);
        }
        catch (error) {
            next(error);
        }
    },
    createPlan: async (req, res, next) => {
        try {
            const plan = await subscriptionService.createPlan(req.body, req.user.id, req.ip, req.headers['user-agent']);
            res.status(201).json(plan);
        }
        catch (error) {
            next(error);
        }
    },
    updatePlan: async (req, res, next) => {
        try {
            const plan = await subscriptionService.updatePlan(req.params.planId, req.body, req.user.id, req.ip, req.headers['user-agent']);
            res.json(plan);
        }
        catch (error) {
            next(error);
        }
    },
    deletePlan: async (req, res, next) => {
        try {
            await subscriptionService.deletePlan(req.params.planId, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Plan deleted' });
        }
        catch (error) {
            next(error);
        }
    },
    getSubscriptions: async (req, res, next) => {
        try {
            const { page, limit, skip } = (0, utils_1.getPaginationParams)(req.query);
            const result = await subscriptionService.adminListSubscriptions({ page, limit, skip });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    activateSubscription: async (req, res, next) => {
        try {
            const sub = await subscriptionService.activateSubscription(req.params.subscriptionId, req.user.id, req.ip, req.headers['user-agent']);
            res.json(sub);
        }
        catch (error) {
            next(error);
        }
    },
    cancelSubscription: async (req, res, next) => {
        try {
            const sub = await subscriptionService.cancelSubscription(req.params.subscriptionId, req.user.id, req.ip, req.headers['user-agent']);
            res.json(sub);
        }
        catch (error) {
            next(error);
        }
    },
    getSponsoredCompanies: async (_req, res, next) => {
        try {
            const list = await subscriptionService.adminListSponsoredCompanies({ page: 1, limit: 100, skip: 0 });
            res.json(list);
        }
        catch (error) {
            next(error);
        }
    },
    createSponsoredCompany: async (req, res, next) => {
        try {
            const sc = await subscriptionService.createSponsoredCompany(req.body, req.user.id, req.ip, req.headers['user-agent']);
            res.status(201).json(sc);
        }
        catch (error) {
            next(error);
        }
    },
    updateSponsoredCompany: async (req, res, next) => {
        try {
            const sc = await subscriptionService.updateSponsoredCompany(req.params.id, req.body, req.user.id, req.ip, req.headers['user-agent']);
            res.json(sc);
        }
        catch (error) {
            next(error);
        }
    },
    deleteSponsoredCompany: async (req, res, next) => {
        try {
            await subscriptionService.deleteSponsoredCompany(req.params.id, req.user.id, req.ip, req.headers['user-agent']);
            res.json({ message: 'Sponsored company removed' });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=subscriptionController.js.map