// ============================================================
// OPPORTUNE V4 — Applications Routes
// GET /api/v1/applications
// POST /api/v1/applications
// PATCH /api/v1/applications/:id
// DELETE /api/v1/applications/:id
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { applicationsService } from '../../services/applications.service.js';

const router = Router();

const createApplicationSchema = z.object({
  opportunityId: z.string().min(1),
  opportunityType: z.enum(['job', 'internship']),
  opportunityTitle: z.string().min(1),
  opportunitySlug: z.string().min(1),
  companyName: z.string().min(1),
  companyLogoUrl: z.string().nullable().optional(),
  location: z.string().default(''),
  status: z.enum(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected']).optional(),
  notes: z.string().optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected']).optional(),
  interviewDate: z.string().nullable().optional(),
  compensation: z.string().nullable().optional(),
  notes: z.string().optional(),
});

// GET /api/v1/applications
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest';
    const status = req.query.status as string | undefined;
    const apps = await applicationsService.getApplications(userId, status);
    res.json(apps);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/applications/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest';
    const app = await applicationsService.getApplicationById(userId, String(req.params.id));
    res.json(app);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/applications
router.post(
  '/',
  optionalAuth,
  validateRequest({ body: createApplicationSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user?.id || 'guest';
      const created = await applicationsService.createApplication(userId, req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/v1/applications/:id
router.patch(
  '/:id',
  optionalAuth,
  validateRequest({ body: updateApplicationSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user?.id || 'guest';
      const updated = await applicationsService.updateApplication(userId, String(req.params.id), req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/v1/applications/:id
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest';
    await applicationsService.deleteApplication(userId, String(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
