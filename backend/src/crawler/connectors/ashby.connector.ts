// ============================================================
// OPPORTUNE V4 — Ashby ATS Connector
// Connects to Ashby Public Job Board API
// ============================================================

import axios from 'axios';
import { logger } from '../../config/logger.js';
import { CrawledItemRaw } from '../engine/orchestrator.js';

interface AshbyJob {
  id: string;
  title: string;
  department?: string;
  employmentType?: string;
  location?: string;
  publishedAt?: string;
  applyUrl?: string;
}

interface AshbyBoardResponse {
  jobs: AshbyJob[];
}

export const ASHBY_COMPANIES = [
  { slug: 'notion', name: 'Notion', token: 'notion', website: 'https://notion.so' },
  { slug: 'linear', name: 'Linear', token: 'linear', website: 'https://linear.app' },
  { slug: 'supabase', name: 'Supabase', token: 'supabase', website: 'https://supabase.com' },
  { slug: 'retool', name: 'Retool', token: 'retool', website: 'https://retool.com' },
];

export async function crawlAshbyCompany(company: typeof ASHBY_COMPANIES[0]): Promise<CrawledItemRaw[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${company.token}`;
  logger.info({ company: company.name, url }, 'Fetching Ashby jobs');

  try {
    const res = await axios.get<AshbyBoardResponse>(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'OpportuneBot/4.0' },
    });

    if (!res.data || !Array.isArray(res.data.jobs)) {
      return [];
    }

    const items: CrawledItemRaw[] = res.data.jobs.map((job) => {
      const isInternship = /intern|co-op|fellow/i.test(job.title) || job.employmentType?.toLowerCase() === 'intern';
      const applyUrl = job.applyUrl || `https://jobs.ashbyhq.com/${company.token}/${job.id}`;
      return {
        category: isInternship ? 'internship' : 'job',
        externalId: `ashby-${company.slug}-${job.id}`,
        title: job.title,
        companyName: company.name,
        companySlug: company.slug,
        rawLocation: job.location || 'Remote',
        rawSalary: undefined,
        rawDescription: `Role at ${company.name} (${job.department || 'Engineering'})`,
        applyUrl,
        sourceUrl: applyUrl,
        sourcePlatform: 'ashby',
      };
    });

    logger.info({ company: company.name, count: items.length }, 'Ashby jobs fetched successfully');
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ company: company.name, error: msg }, 'Failed to fetch Ashby board');
    return [];
  }
}

export async function crawlAllAshby(): Promise<CrawledItemRaw[]> {
  const results: CrawledItemRaw[] = [];
  for (const comp of ASHBY_COMPANIES) {
    const items = await crawlAshbyCompany(comp);
    results.push(...items);
  }
  return results;
}
