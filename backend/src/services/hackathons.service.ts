// ============================================================
// OPPORTUNE V4 — Hackathons Service
// Dedicated hackathons logic: Prize Pool, Mode, Team Size, Timeline
// ============================================================

import { cache } from '../config/redis.js';
import { db } from '../database/db.js';
import { opportunityStore } from '../database/opportunityStore.js';
import { SEED_HACKATHONS } from '../database/seedData.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { createPaginatedResponse, PaginatedResponse } from '../types/api.js';
import { Hackathon } from '../types/opportunity.js';

export interface HackathonFilterOptions {
  query?: string;
  mode?: string;
  status?: string;
  location?: string;
  theme?: string;
  organizer?: string;
  minPrize?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export class HackathonsService {
  async getHackathons(options: HackathonFilterOptions = {}, userId?: string): Promise<PaginatedResponse<Hackathon>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const offset = (page - 1) * limit;

    const cacheKey = `hackathons:list:${options.query || ''}:${options.mode || ''}:${options.status || ''}:${options.location || ''}:${options.theme || ''}:${options.organizer || ''}:${options.minPrize || ''}:${options.sort || ''}:${page}:${limit}`;

    if (!userId) {
      const cached = await cache.get<PaginatedResponse<Hackathon>>(cacheKey);
      if (cached) return cached;
    }

    const isDbAlive = await db.isHealthy();
    if (isDbAlive) {
      try {
        let whereClauses: string[] = ["status = 'published'", 'is_active = true'];
        let params: unknown[] = [];
        let paramIdx = 1;

        if (options.query) {
          whereClauses.push(`(LOWER(title) LIKE $${paramIdx} OR LOWER(description) LIKE $${paramIdx} OR LOWER(organizer_name) LIKE $${paramIdx})`);
          params.push(`%${options.query.toLowerCase()}%`);
          paramIdx++;
        }

        if (options.mode && options.mode !== 'all') {
          whereClauses.push(`mode = $${paramIdx}`);
          params.push(options.mode.toLowerCase());
          paramIdx++;
        }

        if (options.status && options.status !== 'all') {
          whereClauses.push(`hackathon_status = $${paramIdx}`);
          params.push(options.status.toLowerCase());
          paramIdx++;
        }

        if (options.minPrize && options.minPrize > 0) {
          whereClauses.push(`prize_pool_total >= $${paramIdx}`);
          params.push(options.minPrize);
          paramIdx++;
        }

        const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
        const countSql = `SELECT COUNT(*) as total FROM public.hackathons ${whereSql}`;
        const countRes = await db.query(countSql, params);
        const total = parseInt(countRes.rows[0]?.total || '0', 10);

        let orderSql = 'ORDER BY registration_deadline ASC';
        if (options.sort === 'prize') orderSql = 'ORDER BY prize_pool_total DESC';
        if (options.sort === 'recently-added') orderSql = 'ORDER BY created_at DESC';
        if (options.sort === 'popularity') orderSql = 'ORDER BY participants_count DESC';

        const listSql = `SELECT * FROM public.hackathons ${whereSql} ${orderSql} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
        const listRes = await db.query(listSql, [...params, limit, offset]);

        if (listRes.rows.length > 0) {
          const hackathons: Hackathon[] = listRes.rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            organizer: {
              name: row.organizer_name,
              logoUrl: row.organizer_logo_url,
              websiteUrl: row.organizer_website_url,
              verified: row.organizer_verified,
            },
            mode: row.mode,
            location: row.location,
            city: row.city,
            country: row.country,
            registrationDeadline: row.registration_deadline,
            startDate: row.start_date,
            endDate: row.end_date,
            prizePool: {
              total: parseFloat(row.prize_pool_total),
              currency: row.prize_pool_currency,
              formatted: row.prize_pool_formatted,
              prizes: row.prizes || [],
            },
            teamSize: {
              min: row.team_size_min,
              max: row.team_size_max,
              formatted: row.team_size_formatted,
            },
            eligibility: row.eligibility,
            themes: row.themes || [],
            technologies: row.technologies || [],
            tags: row.tags || [],
            description: row.description,
            rules: row.rules || [],
            timeline: row.timeline || [],
            sponsors: row.sponsors || [],
            faqs: row.faqs || [],
            status: row.hackathon_status,
            applyUrl: row.apply_url,
            officialUrl: row.official_url,
            bannerUrl: row.banner_url,
            sourcePlatform: row.source_platform,
            isFeatured: row.is_featured,
            participantsCount: row.participants_count,
            viewsCount: row.views_count,
          }));

          const response = createPaginatedResponse(hackathons, total, page, limit);
          if (!userId) await cache.set(cacheKey, response);
          return response;
        }
      } catch {
        // Fall back
      }
    }

    // Dynamic verified opportunity store dataset
    let filtered = [...opportunityStore.getHackathons()];
    if (options.query) {
      const q = options.query.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.organizer.name.toLowerCase().includes(q) ||
          h.themes.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (options.mode && options.mode !== 'all') {
      filtered = filtered.filter((h) => h.mode === options.mode);
    }
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter((h) => h.status === options.status);
    }
    if (options.minPrize && options.minPrize > 0) {
      filtered = filtered.filter((h) => h.prizePool.total >= options.minPrize!);
    }
    // India-first ranking: prioritize Indian hackathons (Devfolio & Indian locations)
    filtered.sort((a, b) => {
      if (options.sort === 'prize') {
        const diff = b.prizePool.total - a.prizePool.total;
        if (diff !== 0) return diff;
      } else if (options.sort === 'popularity') {
        const diff = (b.participantsCount || 0) - (a.participantsCount || 0);
        if (diff !== 0) return diff;
      }
      const isIndiaA = a.location?.toLowerCase().includes('india') || a.sourcePlatform === 'devfolio' ? 1 : 0;
      const isIndiaB = b.location?.toLowerCase().includes('india') || b.sourcePlatform === 'devfolio' ? 1 : 0;
      if (isIndiaA !== isIndiaB) {
        return isIndiaB - isIndiaA; // Indian hackathons first!
      }
      return (b.participantsCount || 0) - (a.participantsCount || 0);
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    const response = createPaginatedResponse(paginated, total, page, limit);
    if (!userId) await cache.set(cacheKey, response);
    return response;
  }

  async getHackathonBySlug(slug: string, _userId?: string): Promise<Hackathon> {
    const cacheKey = `hackathon:${slug}`;
    const cached = await cache.get<Hackathon>(cacheKey);
    if (cached) return cached;

    const found = opportunityStore.getHackathonBySlug(slug);
    if (!found) {
      throw new NotFoundError(`Hackathon opportunity with slug '${slug}' not found`);
    }

    await cache.set(cacheKey, found);
    return found;
  }

  async getTrendingHackathons(limit = 4): Promise<Hackathon[]> {
    const cacheKey = `hackathons:trending:${limit}`;
    const cached = await cache.get<Hackathon[]>(cacheKey);
    if (cached) return cached;

    const trending = [...opportunityStore.getHackathons()]
      .sort((a, b) => (b.participantsCount || 0) - (a.participantsCount || 0))
      .slice(0, limit);
    await cache.set(cacheKey, trending);
    return trending;
  }
}

export const hackathonsService = new HackathonsService();
