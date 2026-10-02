// ============================================================
// OPPORTUNE V4 — Profile Routes
// GET /api/v1/profile
// PATCH /api/v1/profile
// ============================================================

import { Router } from 'express';
import { optionalAuth } from '../../middleware/auth.js';
import { profileService } from '../../services/profile.service.js';

const router = Router();

// GET /api/v1/profile
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest';
    const email = req.user?.email || 'guest@opportune.dev';
    const profile = await profileService.getProfile(userId, email);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/profile
router.patch('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest';
    const updated = await profileService.updateProfile(userId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
