// ============================================================
// OPPORTUNE V4 — Coding Contests Routes
// GET /api/v1/contests
// GET /api/v1/contests/upcoming
// GET /api/v1/contests/:slug
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { contestsService } from '../../services/contests.service.js';

const router = Router();

const getContestsQuerySchema = z.object({
  query: z.string().optional(),
  platform: z.string().optional(),
  status: z.string().optional(),
  difficulty: z.string().optional(),
  ratingType: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

// GET /api/v1/contests/upcoming
router.get('/upcoming', async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit as string, 10) || 5);
    const contests = await contestsService.getUpcomingContests(limit);
    res.json(contests);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/contests/:slug
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const contest = await contestsService.getContestBySlug(String(req.params.slug), req.user?.id);
    res.json(contest);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/contests
router.get(
  '/',
  optionalAuth,
  validateRequest({ query: getContestsQuerySchema }),
  async (req, res, next) => {
    try {
      const q = req.query as any;
      const effectiveLimit = q.pageSize || q.limit || 20;

      const paginated = await contestsService.getContests(
        {
          query: q.query,
          platform: q.platform,
          status: q.status,
          difficulty: q.difficulty,
          ratingType: q.ratingType,
          sort: q.sort,
          page: q.page,
          limit: effectiveLimit,
        },
        req.user?.id
      );

      res.json(paginated);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
