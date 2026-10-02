// ============================================================
// OPPORTUNE V4 — Health Check Routes
// ============================================================

import { Router } from 'express';
import { cache } from '../../config/redis.js';
import { db } from '../../database/db.js';

const router = Router();

// GET /api/v1/health
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
    service: 'opportune-backend',
  });
});

// GET /api/v1/health/database
router.get('/database', async (_req, res) => {
  const healthy = await db.isHealthy();
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    driver: 'postgresql',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/v1/health/redis
router.get('/redis', async (_req, res) => {
  const healthy = await cache.isHealthy();
  res.json({
    status: healthy ? 'healthy' : 'offline_or_disabled',
    cacheEngine: 'redis',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/v1/health/crawler
router.get('/crawler', (_req, res) => {
  res.json({
    status: 'healthy',
    scheduler: 'active',
    cronSchedule: '00:00 IST',
    timezone: 'Asia/Kolkata',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/v1/health/sources
router.get('/sources', (_req, res) => {
  res.json({
    status: 'healthy',
    activeConnectors: [
      'greenhouse',
      'lever',
      'ashby',
      'smartrecruiters',
      'workday',
      'devfolio',
      'unstop',
      'codeforces',
      'leetcode',
      'codechef',
      'linkedin',
      'naukri',
      'indeed',
    ],
    timestamp: new Date().toISOString(),
  });
});

export default router;
