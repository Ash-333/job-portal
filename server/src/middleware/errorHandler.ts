import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../lib/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
  }
  // Custom app errors (operational)
  else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Prisma errors
  else if (error.message?.includes('Unique constraint')) {
    statusCode = 409;
    message = 'Resource already exists';
  }
  else if (error.message?.includes('Record to update not found')) {
    statusCode = 404;
    message = 'Resource not found';
  }
  // JWT errors
  else if (error.message?.includes('jwt')) {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Log all errors
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.path} ${statusCode}`, {
      error: error.message,
      stack: error.stack,
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
  } else if (statusCode >= 400) {
    logger.warn(`${req.method} ${req.path} ${statusCode}`, {
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

export const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
