import { PrismaClient } from '@prisma/client';

declare global {
  var __db__: PrismaClient | undefined;
}

let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  db = global.__db__;
}

// Log an application status change to the audit trail
export const logApplicationStatusChange = async (
  applicationId: string,
  oldStatus: string,
  newStatus: string,
  changedBy?: string
): Promise<void> => {
  await db.applicationStatusHistory.create({
    data: {
      applicationId,
      oldStatus: oldStatus as any,
      newStatus: newStatus as any,
      changedBy,
    },
  });
};

// Generic audit log helper
export const logAuditAction = async (params: {
  actorId?: string
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}): Promise<void> => {
  await db.auditLog.create({ data: params as any });
};

export { db };
