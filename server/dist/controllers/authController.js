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
exports.authController = void 0;
const auth_1 = require("../schemas/auth");
const authService = __importStar(require("../services/authService"));
exports.authController = {
    register: async (req, res, next) => {
        try {
            const validatedData = auth_1.registerSchema.parse(req.body);
            await authService.register(validatedData);
            res.status(201).json({
                message: 'User registered successfully. Please check your email to verify your account.',
                requiresVerification: true,
            });
        }
        catch (error) {
            next(error);
        }
    },
    registerEmployer: async (req, res, next) => {
        try {
            const validatedData = auth_1.registerEmployerSchema.parse(req.body);
            await authService.registerEmployer(validatedData);
            res.status(201).json({
                message: 'Employer registered successfully. Please check your email to verify your account.',
                requiresVerification: true,
            });
        }
        catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const validatedData = auth_1.loginSchema.parse(req.body);
            const result = await authService.login(validatedData.email, validatedData.password);
            res.json({ message: 'Login successful', user: result.user, token: result.token });
        }
        catch (error) {
            next(error);
        }
    },
    getMe: async (req, res, next) => {
        try {
            const user = await authService.getMe(req.user.id);
            res.json({ user });
        }
        catch (error) {
            next(error);
        }
    },
    logout: (_req, res) => {
        res.json({ message: 'Logout successful' });
    },
    adminRegister: async (req, res, next) => {
        try {
            const result = await authService.adminRegister(req.body, req.ip || '');
            res.status(201).json({ message: 'Admin registered successfully', admin: result.user, token: result.token });
        }
        catch (error) {
            next(error);
        }
    },
    adminLogin: async (req, res, next) => {
        try {
            const validatedData = auth_1.loginSchema.parse(req.body);
            const result = await authService.adminLogin(validatedData.email, validatedData.password);
            res.json({ message: 'Admin login successful', admin: result.user, token: result.token });
        }
        catch (error) {
            next(error);
        }
    },
    getAdminProfile: async (req, res, next) => {
        try {
            if (req.user.role !== 'ADMIN') {
                throw Object.assign(new Error('Admin access required'), { statusCode: 403 });
            }
            const admin = await authService.getAdminProfile(req.user.id);
            res.json({ admin });
        }
        catch (error) {
            next(error);
        }
    },
    sendVerification: async (req, res, next) => {
        try {
            const validatedData = auth_1.sendVerificationSchema.parse(req.body);
            await authService.sendVerification(validatedData.email);
            res.json({ message: 'Verification email sent successfully' });
        }
        catch (error) {
            next(error);
        }
    },
    verifyEmail: async (req, res, next) => {
        try {
            const validatedData = auth_1.verifyEmailSchema.parse(req.body);
            const result = await authService.verifyEmail(validatedData.token);
            res.json({ message: 'Email verified successfully', token: result.token });
        }
        catch (error) {
            next(error);
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const validatedData = auth_1.forgotPasswordSchema.parse(req.body);
            await authService.forgotPassword(validatedData.email);
            res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
        }
        catch (error) {
            next(error);
        }
    },
    resetPassword: async (req, res, next) => {
        try {
            const validatedData = auth_1.resetPasswordSchema.parse(req.body);
            const result = await authService.resetPassword(validatedData.token, validatedData.password);
            res.json({ message: 'Password reset successfully', token: result.token });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=authController.js.map