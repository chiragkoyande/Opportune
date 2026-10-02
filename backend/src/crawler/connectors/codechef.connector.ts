// ============================================================
// OPPORTUNE V4 — CodeChef Contests Connector
// Connects to CodeChef Public Contests List API
// ============================================================

import axios from 'axios';
import { logger } from '../../config/logger.js';
import { CrawledItemRaw } from '../engine/orchestrator.js';

interface CodeChefContest {
  contest_code: string;
  contest_name: string;
  contest_start_date: string;
  contest_end_date: string;
  contest_start_date_iso?: string;
  contest_end_date_iso?: string;
}

interface CodeChefApiResponse {
  status: string;
  future_contests?: CodeChefContest[];
  present_contests?: CodeChefContest[];
}

export async function crawlCodeChefContests(): Promise<CrawledItemRaw[]> {
  const url = 'https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all';
  logger.info({ url }, 'Fetching CodeChef contests');

  try {
    const res = await axios.get<CodeChefApiResponse>(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'OpportuneBot/4.0' },
    });

    if (res.data?.status !== 'success') {
      return [];
    }

    const future = res.data.future_contests || [];
    const present = res.data.present_contests || [];
    const combined = [...present, ...future].slice(0, 15);

    const items: CrawledItemRaw[] = combined.map((c) => {
      const applyUrl = `https://www.codechef.com/${c.contest_code}`;
      return {
        category: 'contest',
        externalId: `codechef-${c.contest_code}`,
        title: c.contest_name,
        companyName: 'CodeChef',
        companySlug: 'codechef',
        rawLocation: 'Online',
        rawSalary: undefined,
        rawDescription: `CodeChef Contest: ${c.contest_name}`,
        applyUrl,
        sourceUrl: applyUrl,
        sourcePlatform: 'codechef',
        extra: {
          platform: 'CodeChef',
          startDateIso: c.contest_start_date_iso,
          endDateIso: c.contest_end_date_iso,
        },
      };
    });

    logger.info({ count: items.length }, 'CodeChef contests fetched successfully');
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ error: msg }, 'Failed to fetch CodeChef contests');
    return [];
  }
}
