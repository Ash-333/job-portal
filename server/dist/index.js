"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const auth_1 = __importDefault(require("./routes/auth"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const user_1 = __importDefault(require("./routes/user"));
const blogs_1 = __importDefault(require("./routes/blogs"));
const admin_1 = __importDefault(require("./routes/admin"));
const upload_1 = __importDefault(require("./routes/upload"));
const employer_1 = __importDefault(require("./routes/employer"));
const companies_1 = __importDefault(require("./routes/companies"));
const adminSubscription_1 = __importDefault(require("./routes/adminSubscription"));
const employerSubscription_1 = __importDefault(require("./routes/employerSubscription"));
const sponsored_1 = __importDefault(require("./routes/sponsored"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const logger_1 = __importDefault(require("./lib/logger"));
const db_1 = require("./lib/db");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const windowMs = 15 * 60 * 1000;
const limiter = (0, express_rate_limit_1.default)({
    windowMs,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
const authStrictLimiter = (0, express_rate_limit_1.default)({
    windowMs,
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
});
const authRegisterLimiter = (0, express_rate_limit_1.default)({
    windowMs,
    max: 3,
    message: 'Too many registration attempts, please try again later.',
});
const applyLimiter = (0, express_rate_limit_1.default)({
    windowMs,
    max: 10,
    message: 'Too many applications, please try again later.',
});
const uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs,
    max: 10,
    message: 'Too many upload requests, please try again later.',
});
app.use((0, helmet_1.default)());
app.use('/api/auth/login', authStrictLimiter);
app.use('/api/auth/admin/login', authStrictLimiter);
app.use('/api/auth/register', authRegisterLimiter);
app.use('/api/auth/employer/register', authRegisterLimiter);
app.use('/api/auth/admin/register', authRegisterLimiter);
app.use('/api/auth/forgot-password', authRegisterLimiter);
app.use('/api/auth/send-verification', authRegisterLimiter);
app.use('/api/auth/reset-password', authStrictLimiter);
app.use('/api/jobs/:jobId/apply', applyLimiter);
app.use('/api/upload', uploadLimiter);
app.use(limiter);
app.use((0, cors_1.default)({
    origin: '*',
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, _res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        query: req.query,
    });
    next();
});
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Job Portal API',
            version: '1.0.0',
            description: 'A comprehensive job portal API with user and admin functionality',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
app.get('/health', async (req, res) => {
    const checks = {};
    let healthy = true;
    try {
        await db_1.db.$queryRaw `SELECT 1`;
        checks.database = 'ok';
    }
    catch (error) {
        checks.database = `error: ${error.message}`;
        healthy = false;
        logger_1.default.error('Health check failed — database unreachable', { error: error.message });
    }
    const statusCode = healthy ? 200 : 503;
    res.status(statusCode).json({
        status: healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        checks,
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/jobs', jobs_1.default);
app.use('/api/user', user_1.default);
app.use('/api/blogs', blogs_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/employer', employer_1.default);
app.use('/api/employer', employerSubscription_1.default);
app.use('/api/admin', adminSubscription_1.default);
app.use('/api', sponsored_1.default);
app.use('/api/companies', companies_1.default);
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
});
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, shutting down');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received, shutting down');
    process.exit(0);
});
app.listen(PORT, () => {
    logger_1.default.info(`Server started`, { port: PORT, pid: process.pid, cwd: process.cwd() });
    if (process.env.NODE_ENV !== 'production') {
        logger_1.default.info(`Health check at http://localhost:${PORT}/health`);
        logger_1.default.info(`API Docs at http://localhost:${PORT}/api-docs`);
    }
});
//# sourceMappingURL=index.js.map