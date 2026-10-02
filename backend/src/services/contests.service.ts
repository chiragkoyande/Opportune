// ============================================================
// OPPORTUNE V4 — Coding Contests Service
// Dedicated contest logic: Platform, Rating, Duration, Start/End
// ============================================================

import { cache } from '../config/redis.js';
import { db } from '../database/db.js';
import { opportunityStore } from '../database/opportunityStore.js';
import { SEED_CONTESTS } from '../database/seedData.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { createPaginatedResponse, PaginatedResponse } from '../types/api.js';
import { Contest } from '../types/opportunity.js';

export interface ContestFilterOptions {
  query?: string;
  platform?: string;
  status?: string;
  difficulty?: string;
  ratingType?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class ContestsService {
  async getContests(options: ContestFilterOptions = {}, userId?: string): Promise<PaginatedResponse<Contest>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const offset = (page - 1) * limit;

    const cacheKey = `contests:list:${options.query || ''}:${options.platform || ''}:${options.status || ''}:${options.difficulty || ''}:${options.ratingType || ''}:${options.sort || ''}:${page}:${limit}`;

    if (!userId) {
      const cached = await cache.get<PaginatedResponse<Contest>>(cacheKey);
      if (cached) return cached;
    }

    const isDbAlive = await db.isHealthy();
    if (isDbAlive) {
      try {
        let whereClauses: string[] = ["status = 'published'", 'is_active = true'];
        let params: unknown[] = [];
        let paramIdx = 1;

        if (options.query) {
          whereClauses.push(`(LOWER(name) LIKE $${paramIdx} OR LOWER(platform) LIKE $${paramIdx})`);
          params.push(`%${options.query.toLowerCase()}%`);
          paramIdx++;
        }

        if (options.platform && options.platform !== 'all') {
          whereClauses.push(`LOWER(platform) = $${paramIdx}`);
          params.push(options.platform.toLowerCase());
          paramIdx++;
        }

        if (options.status && options.status !== 'all') {
          whereClauses.push(`contest_status = $${paramIdx}`);
          params.push(options.status.toUpperCase());
          paramIdx++;
        }

        const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
        const countSql = `SELECT COUNT(*) as total FROM public.contests ${whereSql}`;
        const countRes = await db.query(countSql, params);
        const total = parseInt(countRes.rows[0]?.total || '0', 10);

        let orderSql = 'ORDER BY start_time ASC';
        if (options.sort === 'duration') orderSql = 'ORDER BY duration_minutes ASC';
        if (options.sort === 'participants') orderSql = 'ORDER BY participants_count DESC';

        const listSql = `SELECT * FROM public.contests ${whereSql} ${orderSql} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
        const listRes = await db.query(listSql, [...params, limit, offset]);

        if (listRes.rows.length > 0) {
          const contests: Contest[] = listRes.rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            name: row.name,
            platform: row.platform,
            organizer: row.organizer,
            platformLogoUrl: row.platform_logo_url,
            startTime: row.start_time,
            endTime: row.end_time,
            durationMinutes: row.duration_minutes,
            durationFormatted: row.duration_formatted,
            ratingType: row.rating_type,
            difficulty: row.difficulty,
            participantsCount: row.participants_count,
            status: row.contest_status,
            eligibility: row.eligibility,
            officialUrl: row.official_url,
            description: row.description,
            problemCount: row.problem_count,
            languagesAllowed: row.languages_allowed || [],
            prizes: row.prizes,
          }));

          const response = createPaginatedResponse(contests, total, page, limit);
          if (!userId) await cache.set(cacheKey, response);
          return response;
        }
      } catch {
        // Fall back
      }
    }

    // Dynamic verified opportunity store dataset
    let filtered = [...opportunityStore.getContests()];
    if (options.query) {
      const q = options.query.toLowerCase();
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q)
      );
    }
    if (options.platform && options.platform !== 'all') {
      filtered = filtered.filter((c) => c.platform.toLowerCase() === options.platform!.toLowerCase());
    }
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter((c) => c.status === options.status!.toUpperCase());
    }
    if (options.sort === 'duration') {
      filtered.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (options.sort === 'participants') {
      filtered.sort((a, b) => (b.participantsCount || 0) - (a.participantsCount || 0));
    } else {
      filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    const response = createPaginatedResponse(paginated, total, page, limit);
    if (!userId) await cache.set(cacheKey, response);
    return response;
  }

  async getContestBySlug(slug: string, _userId?: string): Promise<Contest> {
    const cacheKey = `contest:${slug}`;
    const cached = await cache.get<Contest>(cacheKey);
    if (cached) return cached;

    const found = opportunityStore.getContestBySlug(slug);
    if (!found) {
      throw new NotFoundError(`Contest opportunity with slug '${slug}' not found`);
    }

    await cache.set(cacheKey, found);
    return found;
  }

  async getUpcomingContests(limit = 5): Promise<Contest[]> {
    const cacheKey = `contests:upcoming:${limit}`;
    const cached = await cache.get<Contest[]>(cacheKey);
    if (cached) return cached;

    const upcoming = [...opportunityStore.getContests()]
      .filter((c) => c.status === 'UPCOMING')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit);

    await cache.set(cacheKey, upcoming);
    return upcoming;
  }
}

export const contestsService = new ContestsService();
