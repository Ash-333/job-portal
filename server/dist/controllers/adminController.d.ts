import { Request, Response, NextFunction } from 'express';
export declare const adminController: {
    getDashboardStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getJobs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getJobById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    approveJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    rejectJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getApplications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateApplicationStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBlogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createBlog: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBlogById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateBlog: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteBlog: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cleanupAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    suspendUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    unsuspendUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=adminController.d.ts.map