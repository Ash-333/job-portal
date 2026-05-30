import { Request, Response, NextFunction } from 'express';
import { registerSchema, registerEmployerSchema, loginSchema, sendVerificationSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth';
import * as authService from '../services/authService';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      await authService.register(validatedData);
      res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        requiresVerification: true,
      });
    } catch (error) {
      next(error);
    }
  },

  registerEmployer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerEmployerSchema.parse(req.body);
      await authService.registerEmployer(validatedData);
      res.status(201).json({
        message: 'Employer registered successfully. Please check your email to verify your account.',
        requiresVerification: true,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData.email, validatedData.password);
      res.json({ message: 'Login successful', user: result.user, token: result.token });
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  logout: (_req: Request, res: Response) => {
    res.json({ message: 'Logout successful' });
  },

  adminRegister: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.adminRegister(req.body, req.ip || '');
      res.status(201).json({ message: 'Admin registered successfully', admin: result.user, token: result.token });
    } catch (error) {
      next(error);
    }
  },

  adminLogin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.adminLogin(validatedData.email, validatedData.password);
      res.json({ message: 'Admin login successful', admin: result.user, token: result.token });
    } catch (error) {
      next(error);
    }
  },

  getAdminProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user!.role !== 'ADMIN') {
        throw Object.assign(new Error('Admin access required'), { statusCode: 403 });
      }
      const admin = await authService.getAdminProfile(req.user!.id);
      res.json({ admin });
    } catch (error) {
      next(error);
    }
  },

  sendVerification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = sendVerificationSchema.parse(req.body);
      await authService.sendVerification(validatedData.email);
      res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      next(error);
    }
  },

  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(validatedData.token);
      res.json({ message: 'Email verified successfully', token: result.token });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(validatedData.email);
      res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validatedData.token, validatedData.password);
      res.json({ message: 'Password reset successfully', token: result.token });
    } catch (error) {
      next(error);
    }
  },
};
