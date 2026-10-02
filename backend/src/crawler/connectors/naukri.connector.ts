// ============================================================
// OPPORTUNE V4 — Naukri India Connector
// Ingests verified Indian engineering jobs & internships via Naukri official feeds
// ============================================================

import axios from 'axios';
import zlib from 'zlib';
import { logger } from '../../config/logger.js';
import { CrawledItemRaw } from '../engine/orchestrator.js';

const TECH_KEYWORDS = [
  'developer',
  'engineer',
  'software',
  'frontend',
  'backend',
  'fullstack',
  'react',
  'node',
  'python',
  'java',
  'golang',
  'devops',
  'cloud',
  'data-engineer',
  'data-scientist',
  'machine-learning',
  'ai-engineer',
  'android',
  'ios',
  'qa-engineer',
  'sdet',
  'intern',
  'internship',
];

const KNOWN_INDIAN_CITIES = [
  'bangalore-rural-bengaluru',
  'navi-mumbai',
  'new-delhi',
  'greater-noida',
  'bengaluru',
  'bangalore',
  'hyderabad',
  'pune',
  'mumbai',
  'delhi',
  'gurugram',
  'gurgaon',
  'noida',
  'chennai',
  'kolkata',
  'ahmedabad',
  'kochi',
  'coimbatore',
  'indore',
  'chandigarh',
  'jaipur',
  'visakhapatnam',
];

const ROLE_KEYWORDS = [
  'engineer',
  'developer',
  'architect',
  'consultant',
  'analyst',
  'intern',
  'internship',
  'specialist',
  'scientist',
  'administrator',
  'designer',
  'programmer',
  'trainee',
];

const TECH_MODIFIERS = [
  'python',
  'vue',
  'js',
  'java',
  'react',
  'angular',
  'aws',
  'gcp',
  'azure',
  'node',
  'ai',
  'ml',
  'direct',
  'golang',
  'devops',
  'cloud',
];

function titleCase(str: string): string {
  return str
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'company'
  );
}

function parseNaukriSlug(
  rawSlug: string,
  expYears: string
): { title: string; company: string; location: string; category: 'job' | 'internship' } {
  let s = rawSlug;
  let detectedCity = 'Bengaluru';

  // 1. Detect and strip trailing cities
  for (const c of KNOWN_INDIAN_CITIES) {
    if (s.endsWith('-' + c)) {
      detectedCity = c.replace(/-/g, ' ');
      s = s.substring(0, s.length - (c.length + 1));
      // Check if second city was chained (e.g. hyderabad-bengaluru)
      for (const c2 of KNOWN_INDIAN_CITIES) {
        if (s.endsWith('-' + c2)) {
          s = s.substring(0, s.length - (c2.length + 1));
        }
      }
      break;
    }
  }

  // 2. Identify Category
  const isIntern =
    /(^|-)(intern|internship|trainee|apprentice)(-|$)/i.test(rawSlug) ||
    expYears.startsWith('0-to-1') ||
    expYears.startsWith('0-to-0');

  // 3. Separate Title & Company
  const parts = s.split('-').filter(Boolean);
  let lastRoleIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (ROLE_KEYWORDS.includes(parts[i].toLowerCase())) {
      lastRoleIndex = i;
    }
  }

  let titleParts: string[] = [];
  let compParts: string[] = [];

  if (lastRoleIndex !== -1 && lastRoleIndex < parts.length - 1) {
    let splitPoint = lastRoleIndex + 1;
    while (
      splitPoint < parts.length - 1 &&
      TECH_MODIFIERS.includes(parts[splitPoint].toLowerCase())
    ) {
      splitPoint++;
    }
    titleParts = parts.slice(0, splitPoint);
    compParts = parts.slice(splitPoint);
  } else if (parts.length > 2) {
    titleParts = parts.slice(0, -2);
    compParts = parts.slice(-2);
  } else {
    titleParts = [parts[0] || 'Software Engineer'];
    compParts = parts.slice(1);
  }

  const title = titleCase(titleParts.join(' ')) || 'Software Engineer';
  const company = titleCase(compParts.join(' ')) || 'Naukri Verified Hiring Partner';
  const location = `${titleCase(detectedCity)}, India`;

  return {
    title,
    company,
    location,
    category: isIntern ? 'internship' : 'job',
  };
}

export async function crawlNaukriIndia(): Promise<CrawledItemRaw[]> {
  logger.info('🔍 Starting Naukri India discovery (jobs & internships)...');
  const items: CrawledItemRaw[] = [];

  const sitemapUrls = [
    'https://www.naukri.com/sitemap/sitemap-latest-jd-pages-1.xml.gz',
    'https://www.naukri.com/sitemap/jobDescPagesBangalore.xml',
    'https://www.naukri.com/sitemap/jobDescPagesHyderabad.xml',
    'https://www.naukri.com/sitemap/jobDescPagesPune.xml',
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      logger.info({ sitemapUrl }, 'Fetching Naukri sitemap feed');
      const isGzip = sitemapUrl.endsWith('.gz');

      const res = await axios.get<ArrayBuffer>(sitemapUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
      });

      let xmlContent = '';
      if (isGzip) {
        xmlContent = zlib.gunzipSync(Buffer.from(res.data)).toString('utf-8');
      } else {
        xmlContent = Buffer.from(res.data).toString('utf-8');
      }

      const allUrls = xmlContent.match(/https:\/\/www\.naukri\.com\/job-listings-[^<]+/g) || [];
      logger.info({ sitemapUrl, totalUrlsFound: allUrls.length }, 'Parsing Naukri sitemap URLs');

      let addedFromThisFeed = 0;
      for (const jobUrl of allUrls) {
        if (items.length >= 200) break; // Keep manageable payload per crawl run

        const lower = jobUrl.toLowerCase();
        const isTech = TECH_KEYWORDS.some((kw) => lower.includes(kw));
        if (!isTech) continue;

        const match = jobUrl.match(/job-listings-(.+?)-((?:\d+-to-)?\d+-years)-(\d+)$/);
        if (!match) continue;

        const [, rawSlug, expYears, jobId] = match;
        const parsed = parseNaukriSlug(rawSlug, expYears);

        items.push({
          category: parsed.category,
          externalId: `nk-${jobId}`,
          title: parsed.title,
          companyName: parsed.company,
          companySlug: slugify(parsed.company),
          rawLocation: parsed.location,
          rawSalary: undefined,
          rawDescription: `${parsed.title} opportunity at ${parsed.company} in ${parsed.location}. Experience required: ${expYears.replace(/-/g, ' ')}. Applied via Naukri India.`,
          applyUrl: jobUrl,
          sourceUrl: jobUrl,
          sourcePlatform: 'naukri',
          extra: {
            experienceYears: expYears.replace(/-/g, ' '),
            platform: 'Naukri India',
            scrapedAt: new Date().toISOString(),
          },
        });

        addedFromThisFeed++;
      }

      logger.info({ sitemapUrl, added: addedFromThisFeed }, 'Parsed items from Naukri feed');
      if (items.length >= 150) break;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn({ sitemapUrl, error: msg }, 'Failed to fetch/parse Naukri sitemap (fail-open)');
    }
  }

  logger.info({ totalItems: items.length }, 'Naukri India crawl completed');
  return items;
}
