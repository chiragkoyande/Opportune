// ============================================================
// OPPORTUNE V4 — Internships Routes
// GET /api/v1/internships
// GET /api/v1/internships/featured
// GET /api/v1/internships/:slug
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { internshipsService } from '../../services/internships.service.js';

const router = Router();

const getInternshipsQuerySchema = z.object({
  query: z.string().optional(),
  workplaceType: z.string().optional(),
  location: z.string().optional(),
  remoteOnly: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  minStipend: z.coerce.number().optional(),
  durationMonths: z.coerce.number().optional(),
  ppoOnly: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  companySlug: z.string().optional(),
  startDate: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

// GET /api/v1/internships/featured
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit as string, 10) || 4);
    const internships = await internshipsService.getFeaturedInternships(limit);
    res.json(internships);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/internships/:slug
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const internship = await internshipsService.getInternshipBySlug(String(req.params.slug), req.user?.id);
    res.json(internship);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/internships
router.get(
  '/',
  optionalAuth,
  validateRequest({ query: getInternshipsQuerySchema }),
  async (req, res, next) => {
    try {
      const q = req.query as any;
      const effectiveLimit = q.pageSize || q.limit || 20;

      const paginated = await internshipsService.getInternships(
        {
          query: q.query,
          workplaceType: q.workplaceType,
          location: q.location,
          remoteOnly: q.remoteOnly,
          minStipend: q.minStipend,
          durationMonths: q.durationMonths,
          ppoOnly: q.ppoOnly,
          companySlug: q.companySlug,
          startDate: q.startDate,
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
