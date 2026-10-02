// ============================================================
// OPPORTUNE V4 — Backend Server Entry Point
// Node.js + Express + TypeScript + PostgreSQL / Supabase + Redis
// ============================================================

import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { db } from './database/db.js';
import { startScheduler } from './scheduler/cron.js';

const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, env.HOST, () => {
  logger.info(`🚀 Opportune V4 Backend running at http://${env.HOST}:${env.PORT}`);
  logger.info(`📡 API v1 base: http://${env.HOST}:${env.PORT}${env.API_V1_PREFIX}`);
  logger.info(`🏥 Health check: http://${env.HOST}:${env.PORT}/health`);

  // Start background scheduler
  startScheduler();

  // Run initial crawl in background after 2 seconds
  setTimeout(async () => {
    try {
      logger.info('🚀 Triggering initial startup discovery crawl...');
      const { crawlAllSources } = await import('./crawler/connectors/index.js');
      const { crawlerOrchestrator } = await import('./crawler/engine/orchestrator.js');
      const { items } = await crawlAllSources();
      await crawlerOrchestrator.runPipeline('startup-crawl', items);
      logger.info('✅ Initial startup crawl completed successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn({ error: msg }, 'Initial startup crawl encountered error; continuing with seed dataset');
    }
  }, 2000);
});

// Graceful shutdown handling
const handleShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await db.close();
      logger.info('Database pool closed');
    } catch {
      // Ignore
    }
    process.exit(0);
  });

  // Force exit after 10 seconds if hanging
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
