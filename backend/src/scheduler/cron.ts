// ============================================================
// OPPORTUNE V4 — Nightly Crawler Scheduler
// Scheduled at 00:00 IST (Asia/Kolkata) using node-cron
// ============================================================

import cron from 'node-cron';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { crawlerOrchestrator } from '../crawler/engine/orchestrator.js';
import { crawlAllSources } from '../crawler/connectors/index.js';

export function startScheduler(): void {
  logger.info({ cron: env.CRAWLER_CRON, timezone: env.CRAWLER_TIMEZONE }, 'Starting automated crawler scheduler');

  // Schedule nightly crawl at 00:00 IST
  cron.schedule(
    env.CRAWLER_CRON,
    async () => {
      logger.info('⏰ Nightly scheduled crawl triggered at 00:00 IST');
      try {
        const { items } = await crawlAllSources();
        const result = await crawlerOrchestrator.runPipeline('nightly-all', items);
        logger.info(result, '✅ Nightly crawl completed successfully');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error({ error: msg }, '❌ Nightly crawl encountered an error; continuing to serve previous verified dataset');
      }
    },
    {
      timezone: env.CRAWLER_TIMEZONE,
    }
  );
}
