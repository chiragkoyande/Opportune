// ============================================================
// OPPORTUNE V4 — Bookmarks Routes
// GET /api/v1/bookmarks
// POST /api/v1/bookmarks
// DELETE /api/v1/bookmarks/:id
// GET /api/v1/bookmarks/collections
// POST /api/v1/bookmarks/collections
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { bookmarksService } from '../../services/bookmarks.service.js';

const router = Router();

const createBookmarkSchema = z.object({
  category: z.enum(['jobs', 'internships', 'hackathons', 'contests']),
  targetId: z.string().min(1),
  targetSlug: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().min(1),
  logoUrl: z.string().nullable().optional(),
  location: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  collectionId: z.string().optional(),
});

const createCollectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['jobs', 'internships', 'hackathons', 'contests', 'all']).optional(),
});

// GET /api/v1/bookmarks/collections
router.get('/collections', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest';
    const collections = await bookmarksService.getCollections(userId);
    res.json(collections);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/bookmarks/collections
router.post(
  '/collections',
  optionalAuth,
  validateRequest({ body: createCollectionSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user?.id || 'guest';
      const col = await bookmarksService.createCollection(
        userId,
        req.body.name,
        req.body.description,
        req.body.category
      );
      res.status(201).json(col);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/bookmarks
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest';
    const category = req.query.category as any;
    const bookmarks = await bookmarksService.getBookmarks(userId, category);
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/bookmarks
router.post(
  '/',
  optionalAuth,
  validateRequest({ body: createBookmarkSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user?.id || 'guest';
      const bookmark = await bookmarksService.addBookmark(userId, req.body);
      res.status(201).json(bookmark);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/v1/bookmarks/:id
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest';
    const success = await bookmarksService.removeBookmark(userId, String(req.params.id));
    res.json({ success });
  } catch (err) {
    next(err);
  }
});

export default router;
