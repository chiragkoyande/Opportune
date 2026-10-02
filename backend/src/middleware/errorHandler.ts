// ============================================================
// OPPORTUNE V4 — Error Handler Middleware
// Consistent error response format matching frontend expectations:
// { "message": str, "code": str, "statusCode": int, "details": dict }
// ============================================================

import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: Record<string, unknown>) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Permission denied', details?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists or conflicts', details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: Record<string, unknown>) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn({ path: req.path, method: req.method, code: err.code, message: err.message }, 'Application error');
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details || {},
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ path: req.path, method: req.method, issues: err.issues }, 'Request validation failed');
    res.status(422).json({
      message: 'Validation failed for request parameters',
      code: 'VALIDATION_ERROR',
      statusCode: 422,
      details: { errors: err.issues },
    });
    return;
  }

  logger.error({ path: req.path, method: req.method, error: err.message, stack: err.stack }, 'Unhandled internal error');
  res.status(500).json({
    message: 'An unexpected internal server error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
    details: {},
  });
}
