// ============================================================
// OPPORTUNE V4 — Unified Search Routes
// GET /api/v1/search
// GET /api/v1/search/suggest
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validate.js';
import { searchService } from '../../services/search.service.js';

const router = Router();

const searchQuerySchema = z.object({
  q: z.string().default(''),
  category: z.string().default('all'),
  limit: z.coerce.number().default(10),
});

const suggestQuerySchema = z.object({
  q: z.string().default(''),
  limit: z.coerce.number().default(8),
});

// GET /api/v1/search/suggest
router.get('/suggest', validateRequest({ query: suggestQuerySchema }), async (req, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string, 10) || 8;
    const suggestions = await searchService.getSuggestions(q, limit);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/search
router.get('/', validateRequest({ query: searchQuerySchema }), async (req, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    const category = (req.query.category as string) || 'all';
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const results = await searchService.search(q, category, limit);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
