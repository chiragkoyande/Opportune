// ============================================================
// OPPORTUNE V4 — Supabase Auth Middleware
// Decodes and verifies Supabase JWTs with fallback for local dev
// ============================================================

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { supabaseClient } from '../config/supabase.js';
import { ForbiddenError, UnauthorizedError } from './errorHandler.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
  metadata?: Record<string, unknown>;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser | null;
    }
  }
}

export async function parseAuthUser(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) return null;

  try {
    // 1. Try Supabase official client verification if available
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (data?.user && !error) {
        const u = data.user;
        const role = u.role || 'authenticated';
        const isAdmin = role === 'service_role' || Boolean(u.app_metadata?.claims_admin) || Boolean(u.user_metadata?.is_admin);
        return {
          id: u.id,
          email: u.email || '',
          role,
          isAdmin,
          metadata: { ...u.app_metadata, ...u.user_metadata },
        };
      }
    }

    // 2. Try JWT secret verification if configured
    if (env.SUPABASE_JWT_SECRET) {
      const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as any;
      const role = decoded.role || 'authenticated';
      const isAdmin = role === 'service_role' || Boolean(decoded.app_metadata?.claims_admin);
      return {
        id: decoded.sub || decoded.id,
        email: decoded.email || '',
        role,
        isAdmin,
        metadata: { ...decoded.app_metadata, ...decoded.user_metadata },
      };
    }

    // 3. Fallback unverified decode for development
    const decoded = jwt.decode(token) as any;
    if (decoded && (decoded.sub || decoded.id)) {
      const role = decoded.role || 'authenticated';
      return {
        id: decoded.sub || decoded.id,
        email: decoded.email || '',
        role,
        isAdmin: role === 'service_role' || Boolean(decoded.is_admin),
        metadata: decoded,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    req.user = await parseAuthUser(req);
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await parseAuthUser(req);
    if (!user) {
      throw new UnauthorizedError('Authentication credentials required');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await parseAuthUser(req);
    if (!user) {
      throw new UnauthorizedError('Authentication credentials required');
    }
    if (!user.isAdmin) {
      throw new ForbiddenError('Administrator access required for this action');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
