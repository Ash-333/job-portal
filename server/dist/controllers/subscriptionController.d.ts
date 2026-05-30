import { Request, Response, NextFunction } from 'express';
export declare const subscriptionController: {
    getPlans: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPlanById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createPlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSubscriptions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    activateSubscription: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelSubscription: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSponsoredCompanies: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    createSponsoredCompany: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateSponsoredCompany: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteSponsoredCompany: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=subscriptionController.d.ts.map