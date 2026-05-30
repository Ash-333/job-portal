"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const subscriptionController_1 = require("../controllers/subscriptionController");
const router = express_1.default.Router();
router.use(auth_1.authenticate, auth_1.requireAdmin);
router.get('/subscription-plans', subscriptionController_1.subscriptionController.getPlans);
router.get('/subscription-plans/:planId', subscriptionController_1.subscriptionController.getPlanById);
router.post('/subscription-plans', subscriptionController_1.subscriptionController.createPlan);
router.put('/subscription-plans/:planId', subscriptionController_1.subscriptionController.updatePlan);
router.delete('/subscription-plans/:planId', subscriptionController_1.subscriptionController.deletePlan);
router.get('/subscriptions', subscriptionController_1.subscriptionController.getSubscriptions);
router.put('/subscriptions/:subscriptionId/activate', subscriptionController_1.subscriptionController.activateSubscription);
router.put('/subscriptions/:subscriptionId/cancel', subscriptionController_1.subscriptionController.cancelSubscription);
router.get('/sponsored-companies', subscriptionController_1.subscriptionController.getSponsoredCompanies);
router.post('/sponsored-companies', subscriptionController_1.subscriptionController.createSponsoredCompany);
router.put('/sponsored-companies/:id', subscriptionController_1.subscriptionController.updateSponsoredCompany);
router.delete('/sponsored-companies/:id', subscriptionController_1.subscriptionController.deleteSponsoredCompany);
exports.default = router;
//# sourceMappingURL=adminSubscription.js.map