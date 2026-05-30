"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const email_1 = require("../lib/email");
const router = express_1.default.Router();
router.post('/register', authController_1.authController.register);
router.post('/employer/register', authController_1.authController.registerEmployer);
router.post('/login', authController_1.authController.login);
router.get('/me', auth_1.authenticate, authController_1.authController.getMe);
router.post('/logout', auth_1.authenticate, authController_1.authController.logout);
router.post('/send-verification', authController_1.authController.sendVerification);
router.post('/verify-email', authController_1.authController.verifyEmail);
router.post('/forgot-password', authController_1.authController.forgotPassword);
router.post('/reset-password', authController_1.authController.resetPassword);
router.post('/admin/register', authController_1.authController.adminRegister);
router.post('/admin/login', authController_1.authController.adminLogin);
router.get('/admin/profile', auth_1.authenticate, authController_1.authController.getAdminProfile);
router.get('/test-email', async (req, res) => {
    try {
        const isValid = await (0, email_1.testEmailConfig)();
        res.json({
            success: isValid,
            message: isValid ? 'Email configuration is valid!' : 'Email configuration test failed',
            config: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER,
                fromEmail: process.env.FROM_EMAIL,
                fromName: process.env.FROM_NAME,
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Email configuration test failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map