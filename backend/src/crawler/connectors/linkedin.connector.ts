// ============================================================
// OPPORTUNE V4 — LinkedIn India Connector
// Scrapes public Indian engineering jobs and internships via guest endpoint
// ============================================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../../config/logger.js';
import { CrawledItemRaw } from '../engine/orchestrator.js';

const LINKEDIN_JOB_QUERIES = [
  'Software Engineer',
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'DevOps Engineer',
  'Data Engineer',
  'Mobile Engineer Android iOS',
  'Machine Learning Engineer',
];

const LINKEDIN_INTERN_QUERIES = [
  'Software Engineer Intern',
  'Web Development Intern',
  'Frontend Intern',
  'Backend Intern',
  'Data Science Intern',
  'AI ML Intern',
];

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9,en-US;q=0.8',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'company';
}

async function scrapeLinkedInQuery(
  query: string,
  isInternship: boolean
): Promise<CrawledItemRaw[]> {
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(
    query
  )}&location=India&start=0`;

  try {
    const res = await axios.get<string>(url, {
      headers: HEADERS,
      timeout: 10000,
    });

    if (!res.data || typeof res.data !== 'string') {
      return [];
    }

    const $ = cheerio.load(res.data);
    const items: CrawledItemRaw[] = [];

    $('li').each((_, el) => {
      const title = $(el).find('.base-search-card__title').text().trim();
      const company =
        $(el).find('.base-search-card__subtitle').text().trim() ||
        $(el).find('.hidden-nested-link').text().trim();
      const location = $(el).find('.job-search-card__location').text().trim();
      const link = $(el).find('a.base-card__full-link').attr('href');
      const urn = $(el).find('.base-card').attr('data-entity-urn') || '';

      if (!title || !company) return;

      const rawJobId = urn.split(':').pop() || Math.random().toString(36).substring(2, 9);
      const cleanLink = link
        ? link.split('?')[0]
        : `https://in.linkedin.com/jobs/view/${rawJobId}`;

      const companySlug = slugify(company);
      const externalId = `li-${rawJobId}`;

      items.push({
        category: isInternship ? 'internship' : 'job',
        externalId,
        title,
        companyName: company,
        companySlug,
        rawLocation: location || 'India',
        rawSalary: undefined, // LinkedIn public guest cards do not guarantee salary
        rawDescription: `${title} role at ${company} in ${location || 'India'} (via LinkedIn India)`,
        applyUrl: cleanLink,
        sourceUrl: cleanLink,
        sourcePlatform: 'linkedin',
        extra: {
          platform: 'LinkedIn India',
          query,
          scrapedAt: new Date().toISOString(),
        },
      });
    });

    logger.info(
      { query, isInternship, count: items.length },
      'LinkedIn India query completed successfully'
    );
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ query, error: msg }, 'LinkedIn query encountered issue (fail-open)');
    return [];
  }
}

export async function crawlLinkedInIndia(): Promise<CrawledItemRaw[]> {
  logger.info('🔍 Starting LinkedIn India discovery (jobs & internships)...');
  const allItems: CrawledItemRaw[] = [];

  // 1. Crawl Jobs
  for (const q of LINKEDIN_JOB_QUERIES) {
    const items = await scrapeLinkedInQuery(q, false);
    allItems.push(...items);
    // Respectful delay between queries
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  // 2. Crawl Internships
  for (const q of LINKEDIN_INTERN_QUERIES) {
    const items = await scrapeLinkedInQuery(q, true);
    allItems.push(...items);
    // Respectful delay between queries
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  logger.info({ totalItems: allItems.length }, 'LinkedIn India crawl completed');
  return allItems;
}
