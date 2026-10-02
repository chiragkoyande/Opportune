// ============================================================
// OPPORTUNE V4 — Companies Routes
// GET /api/v1/companies
// GET /api/v1/companies/featured
// GET /api/v1/companies/:slug
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validate.js';
import { companiesService } from '../../services/companies.service.js';

const router = Router();

const getCompaniesQuerySchema = z.object({
  query: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

// GET /api/v1/companies/featured
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit as string, 10) || 6);
    const companies = await companiesService.getFeaturedCompanies(limit);
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/companies/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const company = await companiesService.getCompanyBySlug(String(req.params.slug));
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/companies
router.get(
  '/',
  validateRequest({ query: getCompaniesQuerySchema }),
  async (req, res, next) => {
    try {
      const q = req.query as any;
      const effectiveLimit = q.pageSize || q.limit || 20;

      const paginated = await companiesService.getCompanies({
        query: q.query,
        industry: q.industry,
        location: q.location,
        sort: q.sort,
        page: q.page,
        limit: effectiveLimit,
      });

      res.json(paginated);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
