import { PrismaClient } from '@prisma/client';
declare global {
    var __db__: PrismaClient | undefined;
}
declare let db: PrismaClient;
export declare const logApplicationStatusChange: (applicationId: string, oldStatus: string, newStatus: string, changedBy?: string) => Promise<void>;
export declare const logAuditAction: (params: {
    actorId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}) => Promise<void>;
export { db };
//# sourceMappingURL=db.d.ts.map