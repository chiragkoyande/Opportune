// ============================================================
// OPPORTUNE V4 — Zod Request Validation Middleware
// Validates query, params, and body against Zod schemas
// ============================================================

import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

interface ValidationSchema {
  query?: ZodTypeAny;
  params?: ZodTypeAny;
  body?: ZodTypeAny;
}

export function validateRequest(schemas: ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.query) {
        const parsed = await schemas.query.parseAsync(req.query);
        Object.defineProperty(req, 'query', {
          value: parsed,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (schemas.params) {
        const parsed = await schemas.params.parseAsync(req.params);
        Object.defineProperty(req, 'params', {
          value: parsed,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(err);
      } else {
        next(err);
      }
    }
  };
}
