// ============================================================
// OPPORTUNE V4 — Greenhouse ATS Connector
// Connects to Greenhouse Public Boards API with India Tech Focus
// ============================================================

import axios from 'axios';
import { logger } from '../../config/logger.js';
import { CrawledItemRaw } from '../engine/orchestrator.js';

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name: string };
  updated_at?: string;
  metadata?: Array<{ name: string; value: unknown }>;
}

interface GreenhouseBoardResponse {
  jobs: GreenhouseJob[];
}

export const GREENHOUSE_COMPANIES = [
  { slug: 'inmobi', name: 'InMobi', token: 'inmobi', website: 'https://inmobi.com', headquarters: 'Bengaluru, Karnataka, India' },
  { slug: 'rubrik', name: 'Rubrik', token: 'rubrik', website: 'https://rubrik.com', headquarters: 'Bengaluru, India' },
  { slug: 'thoughtworks', name: 'Thoughtworks', token: 'thoughtworks', website: 'https://thoughtworks.com', headquarters: 'Bengaluru / Pune, India' },
  { slug: 'mongodb', name: 'MongoDB', token: 'mongodb', website: 'https://mongodb.com', headquarters: 'Gurugram / Bengaluru, India' },
  { slug: 'cloudflare', name: 'Cloudflare', token: 'cloudflare', website: 'https://cloudflare.com', headquarters: 'Bengaluru, India' },
  { slug: 'canonical', name: 'Canonical', token: 'canonical', website: 'https://canonical.com', headquarters: 'Remote (India / Global)' },
  { slug: 'figma', name: 'Figma', token: 'figma', website: 'https://figma.com', headquarters: 'San Francisco, CA' },
  { slug: 'gitlab', name: 'GitLab', token: 'gitlab', website: 'https://gitlab.com', headquarters: 'Remote' },
  { slug: 'datadog', name: 'Datadog', token: 'datadog', website: 'https://datadoghq.com', headquarters: 'New York / Paris' },
];

export async function crawlGreenhouseCompany(company: typeof GREENHOUSE_COMPANIES[0]): Promise<CrawledItemRaw[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs`;
  logger.info({ company: company.name, url }, 'Fetching Greenhouse jobs');

  try {
    const res = await axios.get<GreenhouseBoardResponse>(url, {
      timeout: 12000,
      headers: { 'User-Agent': 'OpportuneBot/4.0' },
    });

    if (!res.data || !Array.isArray(res.data.jobs)) {
      return [];
    }

    const items: CrawledItemRaw[] = res.data.jobs.map((job) => {
      const isInternship = /intern|co-op|fellow/i.test(job.title);

      // Check metadata for detailed location if available
      let rawLocation = job.location?.name || 'Remote';
      if (job.metadata && Array.isArray(job.metadata)) {
        const locMeta = job.metadata.find((m) => m.name === 'Job Posting Location');
        if (locMeta && Array.isArray(locMeta.value) && locMeta.value.length > 0) {
          rawLocation = locMeta.value.join(', ');
        }
      }

      return {
        category: isInternship ? 'internship' : 'job',
        externalId: `gh-${company.slug}-${job.id}`,
        title: job.title,
        companyName: company.name,
        companySlug: company.slug,
        rawLocation,
        rawSalary: undefined, // Greenhouse does not mandate salary; never fabricate
        rawDescription: `Role at ${company.name}`,
        applyUrl: job.absolute_url,
        sourceUrl: job.absolute_url,
        sourcePlatform: 'greenhouse',
      };
    });

    logger.info({ company: company.name, count: items.length }, 'Greenhouse jobs fetched successfully');
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ company: company.name, error: msg }, 'Failed to fetch Greenhouse board');
    return [];
  }
}

export async function crawlAllGreenhouse(): Promise<CrawledItemRaw[]> {
  const results: CrawledItemRaw[] = [];
  for (const comp of GREENHOUSE_COMPANIES) {
    const items = await crawlGreenhouseCompany(comp);
    results.push(...items);
  }
  return results;
}
