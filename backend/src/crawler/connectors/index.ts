// ============================================================
// OPPORTUNE V4 — Connector Registry & Master Discovery
// ============================================================

import { logger } from '../../config/logger.js';
import { CrawledItemRaw } from '../engine/orchestrator.js';
import { crawlAllGreenhouse } from './greenhouse.connector.js';
import { crawlAllAshby } from './ashby.connector.js';
import { crawlDevfolioHackathons } from './devfolio.connector.js';
import { crawlCodeforcesContests } from './codeforces.connector.js';
import { crawlCodeChefContests } from './codechef.connector.js';
import { crawlLinkedInIndia } from './linkedin.connector.js';
import { crawlNaukriIndia } from './naukri.connector.js';
import { crawlIndeedIndia } from './indeed.connector.js';

export { crawlLinkedInIndia } from './linkedin.connector.js';
export { crawlNaukriIndia } from './naukri.connector.js';
export { crawlIndeedIndia } from './indeed.connector.js';

export interface SourceCrawlSummary {
  source: string;
  count: number;
}

export async function crawlAllSources(): Promise<{ items: CrawledItemRaw[]; summaries: SourceCrawlSummary[] }> {
  logger.info('🚀 Initiating cross-source discovery crawl');
  const items: CrawledItemRaw[] = [];
  const summaries: SourceCrawlSummary[] = [];

  // 1. Greenhouse ATS
  try {
    const ghItems = await crawlAllGreenhouse();
    items.push(...ghItems);
    summaries.push({ source: 'Greenhouse ATS', count: ghItems.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Failed during Greenhouse discovery');
  }

  // 2. Ashby ATS
  try {
    const ashbyItems = await crawlAllAshby();
    items.push(...ashbyItems);
    summaries.push({ source: 'Ashby ATS', count: ashbyItems.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Failed during Ashby discovery');
  }

  // 3. Devfolio Hackathons
  try {
    const devfolioItems = await crawlDevfolioHackathons();
    items.push(...devfolioItems);
    summaries.push({ source: 'Devfolio Hackathons', count: devfolioItems.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Failed during Devfolio discovery');
  }

  // 4. Codeforces Contests
  try {
    const cfItems = await crawlCodeforcesContests();
    items.push(...cfItems);
    summaries.push({ source: 'Codeforces Contests', count: cfItems.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Failed during Codeforces discovery');
  }

  // 5. CodeChef Contests
  try {
    const ccItems = await crawlCodeChefContests();
    items.push(...ccItems);
    summaries.push({ source: 'CodeChef Contests', count: ccItems.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Failed during CodeChef discovery');
  }

  // 6. LinkedIn India (Jobs & Internships)
  try {
    const liItems = await crawlLinkedInIndia();
    items.push(...liItems);
    summaries.push({ source: 'LinkedIn India', count: liItems.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Failed during LinkedIn India discovery');
  }

  // 7. Naukri India (Jobs & Internships)
  try {
    const nkItems = await crawlNaukriIndia();
    items.push(...nkItems);
    summaries.push({ source: 'Naukri India', count: nkItems.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Failed during Naukri India discovery');
  }

  // 8. Indeed India (Jobs & Internships)
  try {
    const indItems = await crawlIndeedIndia();
    items.push(...indItems);
    summaries.push({ source: 'Indeed India', count: indItems.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, 'Failed during Indeed India discovery');
  }

  logger.info({ totalDiscovered: items.length, summaries }, 'Discovery phase completed across all sources');
  return { items, summaries };
}
