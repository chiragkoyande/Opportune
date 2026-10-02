// ============================================================
// OPPORTUNE V4 — Express Application Configuration
// ============================================================

import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { allowedOriginsList, env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler, NotFoundError } from './middleware/errorHandler.js';
import v1Router from './routes/v1/index.js';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or local tools)
        if (!origin) return callback(null, true);
        if (allowedOriginsList.includes(origin) || env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        return callback(null, true); // Dev-friendly permissive fallback
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic request logger in development
  if (env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
      logger.debug({ method: req.method, path: req.path }, 'Incoming HTTP Request');
      next();
    });
  }

  // Root redirect & status
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Opportune V4 API',
      version: '4.0.0',
      status: 'operational',
      documentation: '/api/v1/health',
      categories: ['jobs', 'internships', 'hackathons', 'contests'],
    });
  });

  // Health check direct alias
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'opportune-backend', timestamp: new Date().toISOString() });
  });

  // Mount API v1 router
  app.use(env.API_V1_PREFIX, v1Router);

  // 404 handler for undefined routes
  app.use((req: Request, _res: Response, next) => {
    next(new NotFoundError(`Endpoint '${req.method} ${req.originalUrl}' not found`));
  });

  // Central error handler
  app.use(errorHandler);

  return app;
}
