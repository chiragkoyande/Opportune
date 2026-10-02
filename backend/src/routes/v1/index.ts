// ============================================================
// OPPORTUNE V4 — API v1 Root Router
// Combines Jobs, Internships, Hackathons, Contests, Companies,
// Search, Bookmarks, Applications, Profile, Admin & Health
// ============================================================

import { Router } from 'express';
import jobsRouter from './jobs.routes.js';
import internshipsRouter from './internships.routes.js';
import hackathonsRouter from './hackathons.routes.js';
import contestsRouter from './contests.routes.js';
import companiesRouter from './companies.routes.js';
import searchRouter from './search.routes.js';
import bookmarksRouter from './bookmarks.routes.js';
import applicationsRouter from './applications.routes.js';
import profileRouter from './profile.routes.js';
import adminRouter from './admin.routes.js';
import healthRouter from './health.routes.js';

const router = Router();

router.use('/jobs', jobsRouter);
router.use('/internships', internshipsRouter);
router.use('/hackathons', hackathonsRouter);
router.use('/contests', contestsRouter);
router.use('/companies', companiesRouter);
router.use('/search', searchRouter);
router.use('/bookmarks', bookmarksRouter);
router.use('/applications', applicationsRouter);
router.use('/profile', profileRouter);
router.use('/admin', adminRouter);
router.use('/health', healthRouter);

export default router;
