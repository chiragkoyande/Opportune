// ============================================================
// OPPORTUNE V4 — Codeforces Contests Connector
// Connects to Codeforces Official Public API
// ============================================================

import axios from 'axios';
import { logger } from '../../config/logger.js';
import { CrawledItemRaw } from '../engine/orchestrator.js';

interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: 'BEFORE' | 'CODING' | 'PENDING_SYSTEM_TEST' | 'SYSTEM_TEST' | 'FINISHED';
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
}

interface CodeforcesApiResponse {
  status: 'OK' | 'FAILED';
  result: CodeforcesContest[];
}

export async function crawlCodeforcesContests(): Promise<CrawledItemRaw[]> {
  const url = 'https://codeforces.com/api/contest.list?gym=false';
  logger.info({ url }, 'Fetching Codeforces contests');

  try {
    const res = await axios.get<CodeforcesApiResponse>(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'OpportuneBot/4.0' },
    });

    if (res.data?.status !== 'OK' || !Array.isArray(res.data.result)) {
      return [];
    }

    // Keep upcoming and active contests + recent 10 finished contests
    const relevant = res.data.result.filter((c) => c.phase === 'BEFORE' || c.phase === 'CODING').slice(0, 15);
    const recent = res.data.result.filter((c) => c.phase === 'FINISHED').slice(0, 5);
    const combined = [...relevant, ...recent];

    const items: CrawledItemRaw[] = combined.map((c) => {
      const applyUrl = `https://codeforces.com/contest/${c.id}`;
      return {
        category: 'contest',
        externalId: `codeforces-${c.id}`,
        title: c.name,
        companyName: 'Codeforces',
        companySlug: 'codeforces',
        rawLocation: 'Online',
        rawSalary: undefined,
        rawDescription: `Codeforces Competitive Programming Round (${c.type})`,
        applyUrl,
        sourceUrl: applyUrl,
        sourcePlatform: 'codeforces',
        extra: {
          platform: 'Codeforces',
          startTimeSeconds: c.startTimeSeconds,
          durationSeconds: c.durationSeconds,
          phase: c.phase,
        },
      };
    });

    logger.info({ count: items.length }, 'Codeforces contests fetched successfully');
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ error: msg }, 'Failed to fetch Codeforces contests');
    return [];
  }
}
