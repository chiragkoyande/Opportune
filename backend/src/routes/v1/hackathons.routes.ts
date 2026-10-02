// ============================================================
// OPPORTUNE V4 — Hackathons Routes
// GET /api/v1/hackathons
// GET /api/v1/hackathons/trending
// GET /api/v1/hackathons/:slug
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { hackathonsService } from '../../services/hackathons.service.js';

const router = Router();

const getHackathonsQuerySchema = z.object({
  query: z.string().optional(),
  mode: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  theme: z.string().optional(),
  organizer: z.string().optional(),
  minPrize: z.coerce.number().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

// GET /api/v1/hackathons/trending
router.get('/trending', async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit as string, 10) || 4);
    const hackathons = await hackathonsService.getTrendingHackathons(limit);
    res.json(hackathons);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/hackathons/:slug
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const hackathon = await hackathonsService.getHackathonBySlug(String(req.params.slug), req.user?.id);
    res.json(hackathon);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/hackathons
router.get(
  '/',
  optionalAuth,
  validateRequest({ query: getHackathonsQuerySchema }),
  async (req, res, next) => {
    try {
      const q = req.query as any;
      const effectiveLimit = q.pageSize || q.limit || 20;

      const paginated = await hackathonsService.getHackathons(
        {
          query: q.query,
          mode: q.mode,
          status: q.status,
          location: q.location,
          theme: q.theme,
          organizer: q.organizer,
          minPrize: q.minPrize,
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
