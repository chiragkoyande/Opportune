// ============================================================
// OPPORTUNE V4 — Admin & Crawler Management Routes
// ============================================================

import { Router } from 'express';
import { optionalAuth } from '../../middleware/auth.js';
import { opportunityStore } from '../../database/opportunityStore.js';
import { crawlerOrchestrator } from '../../crawler/engine/orchestrator.js';
import { crawlAllSources } from '../../crawler/connectors/index.js';
import { logger } from '../../config/logger.js';

const router = Router();

// GET /api/v1/admin/crawler/dashboard
router.get('/crawler/dashboard', optionalAuth, (_req, res) => {
  const counts = opportunityStore.getCounts();
  const latestRun = crawlerOrchestrator.getLatestRun();

  res.json({
    totalSources: 10,
    activeSources: 10,
    lastRunStatus: latestRun ? 'completed' : 'idle',
    lastRunTime: latestRun?.completedAt || new Date().toISOString(),
    totalOpportunitiesTracked: counts.total,
    recentErrorsCount: latestRun?.totalErrors || 0,
    metricsByCategory: {
      jobs: counts.jobs,
      internships: counts.internships,
      hackathons: counts.hackathons,
      contests: counts.contests,
      companies: counts.companies,
    },
    latestRun: latestRun || null,
  });
});

// GET /api/v1/admin/crawler/sources
router.get('/crawler/sources', optionalAuth, (_req, res) => {
  res.json([
    { id: 'src-1', slug: 'canonical-greenhouse', name: 'Canonical Greenhouse', sourceType: 'greenhouse', isEnabled: true, status: 'healthy' },
    { id: 'src-2', slug: 'cloudflare-greenhouse', name: 'Cloudflare Greenhouse', sourceType: 'greenhouse', isEnabled: true, status: 'healthy' },
    { id: 'src-3', slug: 'figma-greenhouse', name: 'Figma Greenhouse', sourceType: 'greenhouse', isEnabled: true, status: 'healthy' },
    { id: 'src-4', slug: 'gitlab-greenhouse', name: 'GitLab Greenhouse', sourceType: 'greenhouse', isEnabled: true, status: 'healthy' },
    { id: 'src-5', slug: 'notion-ashby', name: 'Notion Ashby Careers', sourceType: 'ashby', isEnabled: true, status: 'healthy' },
    { id: 'src-6', slug: 'devfolio-hackathons', name: 'Devfolio Hackathons API', sourceType: 'devfolio', isEnabled: true, status: 'healthy' },
    { id: 'src-7', slug: 'codeforces-api', name: 'Codeforces Contest API', sourceType: 'codeforces', isEnabled: true, status: 'healthy' },
    { id: 'src-8', slug: 'codechef-api', name: 'CodeChef Contest API', sourceType: 'codechef', isEnabled: true, status: 'healthy' },
    { id: 'src-9', slug: 'linkedin-india', name: 'LinkedIn India (Jobs & Internships)', sourceType: 'linkedin', isEnabled: true, status: 'healthy' },
    { id: 'src-10', slug: 'naukri-india', name: 'Naukri India (Jobs & Internships)', sourceType: 'naukri', isEnabled: true, status: 'healthy' },
    { id: 'src-11', slug: 'indeed-india', name: 'Indeed India (Jobs & Internships)', sourceType: 'indeed', isEnabled: true, status: 'healthy' },
  ]);
});

// POST /api/v1/admin/crawler/trigger
router.post('/crawler/trigger', optionalAuth, async (_req, res) => {
  logger.info('Manual crawl triggered via /api/v1/admin/crawler/trigger');

  try {
    const { items, summaries } = await crawlAllSources();
    const result = await crawlerOrchestrator.runPipeline('admin-manual', items);

    res.json({
      message: 'Crawl completed successfully',
      result,
      summaries,
      opportunityCounts: opportunityStore.getCounts(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Manual crawl failed');
    res.status(500).json({ error: msg });
  }
});

export default router;
