"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.logAuditAction = exports.logApplicationStatusChange = void 0;
const client_1 = require("@prisma/client");
let db;
if (process.env.NODE_ENV === 'production') {
    exports.db = db = new client_1.PrismaClient();
}
else {
    if (!global.__db__) {
        global.__db__ = new client_1.PrismaClient();
    }
    exports.db = db = global.__db__;
}
const logApplicationStatusChange = async (applicationId, oldStatus, newStatus, changedBy) => {
    await db.applicationStatusHistory.create({
        data: {
            applicationId,
            oldStatus: oldStatus,
            newStatus: newStatus,
            changedBy,
        },
    });
};
exports.logApplicationStatusChange = logApplicationStatusChange;
const logAuditAction = async (params) => {
    await db.auditLog.create({ data: params });
};
exports.logAuditAction = logAuditAction;
//# sourceMappingURL=db.js.map