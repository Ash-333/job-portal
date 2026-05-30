"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireEmployer = exports.requireAdmin = exports.authenticate = void 0;
const jwt_1 = require("../lib/jwt");
const db_1 = require("../lib/db");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const payload = (0, jwt_1.verifyToken)(token);
            const user = await db_1.db.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, email: true, role: true, isActive: true }
            });
            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            if (user.isActive === false) {
                res.status(403).json({ error: 'Account suspended. Contact administrator.' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Authentication error' });
        return;
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireEmployer = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.role !== 'EMPLOYER') {
        res.status(403).json({ error: 'Employer access required' });
        return;
    }
    next();
};
exports.requireEmployer = requireEmployer;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = (0, jwt_1.verifyToken)(token);
                const user = await db_1.db.user.findUnique({
                    where: { id: payload.userId },
                    select: { id: true, email: true, role: true, isActive: true }
                });
                if (user && user.isActive !== false) {
                    req.user = user;
                }
            }
            catch (error) {
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map