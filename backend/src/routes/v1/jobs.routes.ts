// ============================================================
// OPPORTUNE V4 — Jobs Routes
// GET /api/v1/jobs
// GET /api/v1/jobs/featured
// GET /api/v1/jobs/:slug
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { jobsService } from '../../services/jobs.service.js';

const router = Router();

const getJobsQuerySchema = z.object({
  query: z.string().optional(),
  employmentType: z.string().optional(),
  workplaceType: z.string().optional(),
  seniority: z.string().optional(),
  location: z.string().optional(),
  remoteOnly: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  companySlug: z.string().optional(),
  minSalary: z.coerce.number().optional(),
  postedWithin: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

// GET /api/v1/jobs/featured
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit as string, 10) || 4);
    const jobs = await jobsService.getFeaturedJobs(limit);
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/jobs/:slug
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const job = await jobsService.getJobBySlug(String(req.params.slug), req.user?.id);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/jobs
router.get(
  '/',
  optionalAuth,
  validateRequest({ query: getJobsQuerySchema }),
  async (req, res, next) => {
    try {
      const q = req.query as any;
      const effectiveLimit = q.pageSize || q.limit || 20;

      const paginated = await jobsService.getJobs(
        {
          query: q.query,
          employmentType: q.employmentType,
          workplaceType: q.workplaceType,
          seniority: q.seniority,
          location: q.location,
          remoteOnly: q.remoteOnly,
          companySlug: q.companySlug,
          minSalary: q.minSalary,
          postedWithin: q.postedWithin,
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
