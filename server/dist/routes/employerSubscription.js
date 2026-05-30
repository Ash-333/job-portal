"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const employerSubscriptionController_1 = require("../controllers/employerSubscriptionController");
const router = express_1.default.Router();
router.use(auth_1.authenticate, auth_1.requireEmployer);
router.get('/plans', employerSubscriptionController_1.employerSubscriptionController.getPlans);
router.post('/subscribe', employerSubscriptionController_1.employerSubscriptionController.subscribe);
router.get('/subscription', employerSubscriptionController_1.employerSubscriptionController.getSubscription);
exports.default = router;
//# sourceMappingURL=employerSubscription.js.map