import { Request, Response, NextFunction } from 'express';
export declare const employerSubscriptionController: {
    getPlans: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    subscribe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSubscription: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=employerSubscriptionController.d.ts.map