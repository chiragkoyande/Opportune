// ============================================================
// OPPORTUNE V4 — Devfolio Hackathons Connector
// Connects to Devfolio Public Hackathons API
// ============================================================

import axios from 'axios';
import { logger } from '../../config/logger.js';
import { CrawledItemRaw } from '../engine/orchestrator.js';

interface DevfolioHackathon {
  uuid: string;
  name: string;
  slug: string;
  cover_img?: string;
  starts_at?: string;
  ends_at?: string;
  city?: string;
  country?: string;
  is_online?: boolean;
}

interface DevfolioApiResponse {
  result: DevfolioHackathon[];
}

export async function crawlDevfolioHackathons(): Promise<CrawledItemRaw[]> {
  const url = 'https://api.devfolio.co/api/hackathons?filter=all&page=1&limit=25';
  logger.info({ url }, 'Fetching Devfolio hackathons');

  try {
    const res = await axios.get<DevfolioApiResponse>(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'OpportuneBot/4.0' },
    });

    if (!res.data || !Array.isArray(res.data.result)) {
      return [];
    }

    const items: CrawledItemRaw[] = res.data.result.map((h) => {
      const applyUrl = `https://${h.slug}.devfolio.co`;
      return {
        category: 'hackathon',
        externalId: `devfolio-${h.uuid || h.slug}`,
        title: h.name,
        companyName: 'Devfolio Community',
        companySlug: 'devfolio',
        rawLocation: h.is_online ? 'Online' : (h.city ? `${h.city}, India` : 'Hybrid'),
        rawSalary: undefined,
        rawDescription: `Devfolio Hackathon: ${h.name}`,
        applyUrl,
        sourceUrl: applyUrl,
        sourcePlatform: 'devfolio',
        extra: {
          bannerUrl: h.cover_img,
          startDate: h.starts_at,
          endDate: h.ends_at,
        },
      };
    });

    logger.info({ count: items.length }, 'Devfolio hackathons fetched successfully');
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ error: msg }, 'Failed to fetch Devfolio hackathons');
    return [];
  }
}
