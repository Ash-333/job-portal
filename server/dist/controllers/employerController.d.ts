import { Request, Response, NextFunction } from 'express';
export declare const employerController: {
    getDashboardStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getJobs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getJobById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getApplications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateApplicationStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    toggleFeatured: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=employerController.d.ts.map