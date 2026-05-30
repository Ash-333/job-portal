import { Request, Response, NextFunction } from 'express';
export declare const authController: {
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    registerEmployer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (_req: Request, res: Response) => void;
    adminRegister: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    adminLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAdminProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    sendVerification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=authController.d.ts.map