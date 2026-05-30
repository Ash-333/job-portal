"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../lib/logger"));
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = undefined;
    if (error instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
    }
    else if (error.statusCode) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error.message?.includes('Unique constraint')) {
        statusCode = 409;
        message = 'Resource already exists';
    }
    else if (error.message?.includes('Record to update not found')) {
        statusCode = 404;
        message = 'Resource not found';
    }
    else if (error.message?.includes('jwt')) {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (statusCode >= 500) {
        logger_1.default.error(`${req.method} ${req.path} ${statusCode}`, {
            error: error.message,
            stack: error.stack,
            method: req.method,
            path: req.path,
            ip: req.ip,
        });
    }
    else if (statusCode >= 400) {
        logger_1.default.warn(`${req.method} ${req.path} ${statusCode}`, {
            error: error.message,
            method: req.method,
            path: req.path,
            ip: req.ip,
        });
    }
    res.status(statusCode).json({
        error: message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map