// ============================================================
// OPPORTUNE V4 — Internships Service
// Dedicated internship logic: Stipend, Duration, PPO (India-only)
// ============================================================

import { cache } from '../config/redis.js';
import { db } from '../database/db.js';
import { opportunityStore } from '../database/opportunityStore.js';
import { SEED_INTERNSHIPS } from '../database/seedData.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { createPaginatedResponse, PaginatedResponse } from '../types/api.js';
import { Internship } from '../types/opportunity.js';

export interface InternshipFilterOptions {
  query?: string;
  workplaceType?: string;
  location?: string;
  remoteOnly?: boolean;
  minStipend?: number;
  durationMonths?: number;
  ppoOnly?: boolean;
  companySlug?: string;
  startDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class InternshipsService {
  async getInternships(options: InternshipFilterOptions = {}, userId?: string): Promise<PaginatedResponse<Internship>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const offset = (page - 1) * limit;

    const cacheKey = `internships:list:${options.query || ''}:${options.workplaceType || ''}:${options.location || ''}:${options.remoteOnly || ''}:${options.minStipend || ''}:${options.durationMonths || ''}:${options.ppoOnly || ''}:${options.companySlug || ''}:${options.sort || ''}:${page}:${limit}`;

    if (!userId) {
      const cached = await cache.get<PaginatedResponse<Internship>>(cacheKey);
      if (cached) return cached;
    }

    const isDbAlive = await db.isHealthy();
    if (isDbAlive) {
      try {
        let whereClauses: string[] = ["i.status = 'published'", 'i.is_active = true'];
        let params: unknown[] = [];
        let paramIdx = 1;

        if (options.query) {
          whereClauses.push(`(LOWER(i.title) LIKE $${paramIdx} OR LOWER(i.description) LIKE $${paramIdx} OR LOWER(c.name) LIKE $${paramIdx})`);
          params.push(`%${options.query.toLowerCase()}%`);
          paramIdx++;
        }

        if (options.workplaceType && options.workplaceType !== 'all') {
          whereClauses.push(`i.workplace_type = $${paramIdx}`);
          params.push(options.workplaceType.toLowerCase());
          paramIdx++;
        }

        if (options.remoteOnly) {
          whereClauses.push(`i.workplace_type = 'remote'`);
        }

        if (options.minStipend && options.minStipend > 0) {
          whereClauses.push(`i.stipend_min >= $${paramIdx}`);
          params.push(options.minStipend);
          paramIdx++;
        }

        if (options.ppoOnly) {
          whereClauses.push(`i.ppo_offered = true`);
        }

        if (options.companySlug) {
          whereClauses.push(`c.slug = $${paramIdx}`);
          params.push(options.companySlug);
          paramIdx++;
        }

        const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
        const countSql = `SELECT COUNT(*) as total FROM public.internships i JOIN public.companies c ON i.company_id = c.id ${whereSql}`;
        const countRes = await db.query(countSql, params);
        const total = parseInt(countRes.rows[0]?.total || '0', 10);

        let orderSql = 'ORDER BY i.posted_at DESC';
        if (options.sort === 'stipend') orderSql = 'ORDER BY i.stipend_min DESC NULLS LAST';
        if (options.sort === 'deadline') orderSql = 'ORDER BY i.application_deadline ASC NULLS LAST';

        const listSql = `
          SELECT i.*, 
                 c.name as comp_name, c.slug as comp_slug, c.logo_url as comp_logo, c.website_url as comp_web, 
                 c.is_verified as comp_ver, c.industry as comp_ind, c.headquarters as comp_hq
          FROM public.internships i
          JOIN public.companies c ON i.company_id = c.id
          ${whereSql}
          ${orderSql}
          LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `;
        const listRes = await db.query(listSql, [...params, limit, offset]);

        if (listRes.rows.length > 0) {
          const internships: Internship[] = listRes.rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            company: {
              id: row.company_id,
              name: row.comp_name,
              slug: row.comp_slug,
              logoUrl: row.comp_logo,
              websiteUrl: row.comp_web,
              verified: row.comp_ver,
              industry: row.comp_ind,
              location: row.comp_hq,
            },
            location: row.location,
            country: row.country,
            city: row.city,
            workplaceType: row.workplace_type,
            stipend: row.stipend_min || row.stipend_max ? {
              min: row.stipend_min ? parseFloat(row.stipend_min) : null,
              max: row.stipend_max ? parseFloat(row.stipend_max) : null,
              currency: row.stipend_currency,
              period: row.stipend_period,
              isPerformanceBased: row.stipend_is_performance_based,
            } : null,
            duration: {
              value: row.duration_value,
              unit: row.duration_unit,
              formatted: `${row.duration_value} ${row.duration_unit}`,
            },
            startDate: row.start_date,
            isImmediate: row.is_immediate,
            applicationDeadline: row.application_deadline,
            skills: row.skills || [],
            description: row.description,
            perks: row.perks || [],
            ppoOffered: row.ppo_offered,
            eligibility: row.eligibility || [],
            responsibilities: row.responsibilities || [],
            postedAt: row.posted_at,
            applyUrl: row.apply_url,
            sourceUrl: row.source_url,
            sourcePlatform: row.source_platform,
            isFeatured: row.is_featured,
            viewsCount: row.views_count,
            applicantsCount: row.applicants_count,
          }));

          const response = createPaginatedResponse(internships, total, page, limit);
          if (!userId) await cache.set(cacheKey, response);
          return response;
        }
      } catch {
        // Fall back
      }
    }

    // Dynamic verified opportunity store dataset
    let filtered = [...opportunityStore.getInternships()];
    if (options.query) {
      const q = options.query.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.company.name.toLowerCase().includes(q) ||
          i.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (options.workplaceType && options.workplaceType !== 'all') {
      filtered = filtered.filter((i) => i.workplaceType === options.workplaceType);
    }
    if (options.remoteOnly) {
      filtered = filtered.filter((i) => i.workplaceType === 'remote');
    }
    if (options.ppoOnly) {
      filtered = filtered.filter((i) => i.ppoOffered);
    }
    if (options.minStipend && options.minStipend > 0) {
      filtered = filtered.filter((i) => i.stipend && (i.stipend.min || 0) >= options.minStipend!);
    }
    if (options.companySlug) {
      filtered = filtered.filter((i) => i.company.slug === options.companySlug);
    }
    // India-first ranking: prioritize Indian internships
    filtered.sort((a, b) => {
      if (options.sort === 'stipend') {
        const diff = (b.stipend?.min || 0) - (a.stipend?.min || 0);
        if (diff !== 0) return diff;
      }
      const isIndiaA = a.country === 'India' || a.location.toLowerCase().includes('india') ? 1 : 0;
      const isIndiaB = b.country === 'India' || b.location.toLowerCase().includes('india') ? 1 : 0;
      if (isIndiaA !== isIndiaB) {
        return isIndiaB - isIndiaA; // India internships first!
      }
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    const response = createPaginatedResponse(paginated, total, page, limit);
    if (!userId) await cache.set(cacheKey, response);
    return response;
  }

  async getInternshipBySlug(slug: string, _userId?: string): Promise<Internship> {
    const cacheKey = `internship:${slug}`;
    const cached = await cache.get<Internship>(cacheKey);
    if (cached) return cached;

    const isDbAlive = await db.isHealthy();
    if (isDbAlive) {
      try {
        const querySql = `
          SELECT i.*, 
                 c.name as comp_name, c.slug as comp_slug, c.logo_url as comp_logo, c.website_url as comp_web, 
                 c.is_verified as comp_ver, c.industry as comp_ind, c.headquarters as comp_hq
          FROM public.internships i
          JOIN public.companies c ON i.company_id = c.id
          WHERE (i.slug = $1 OR i.id::text = $1) AND i.status = 'published' AND i.is_active = true
          LIMIT 1
        `;
        const res = await db.query(querySql, [slug]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const internship: Internship = {
            id: row.id,
            slug: row.slug,
            title: row.title,
            company: {
              id: row.company_id,
              name: row.comp_name,
              slug: row.comp_slug,
              logoUrl: row.comp_logo,
              websiteUrl: row.comp_web,
              verified: row.comp_ver,
              industry: row.comp_ind,
              location: row.comp_hq,
            },
            location: row.location,
            country: row.country,
            city: row.city,
            workplaceType: row.workplace_type,
            stipend: row.stipend_min || row.stipend_max ? {
              min: row.stipend_min ? parseFloat(row.stipend_min) : null,
              max: row.stipend_max ? parseFloat(row.stipend_max) : null,
              currency: row.stipend_currency,
              period: row.stipend_period,
              isPerformanceBased: row.stipend_is_performance_based,
            } : null,
            duration: {
              value: row.duration_value,
              unit: row.duration_unit,
              formatted: `${row.duration_value} ${row.duration_unit}`,
            },
            startDate: row.start_date,
            isImmediate: row.is_immediate,
            applicationDeadline: row.application_deadline,
            skills: row.skills || [],
            description: row.description,
            perks: row.perks || [],
            ppoOffered: row.ppo_offered,
            eligibility: row.eligibility || [],
            responsibilities: row.responsibilities || [],
            postedAt: row.posted_at,
            applyUrl: row.apply_url,
            sourceUrl: row.source_url,
            sourcePlatform: row.source_platform,
            isFeatured: row.is_featured,
            viewsCount: row.views_count,
            applicantsCount: row.applicants_count,
          };
          await cache.set(cacheKey, internship);
          return internship;
        }
      } catch {
        // Fall back
      }
    }

    const found = opportunityStore.getInternshipBySlug(slug);
    if (!found) {
      throw new NotFoundError(`Internship opportunity with slug '${slug}' not found`);
    }

    await cache.set(cacheKey, found);
    return found;
  }

  async getFeaturedInternships(limit = 4): Promise<Internship[]> {
    const cacheKey = `internships:featured:${limit}`;
    const cached = await cache.get<Internship[]>(cacheKey);
    if (cached) return cached;

    const all = opportunityStore.getInternships();
    const indiaInternships = all.filter((i) => i.country === 'India' || i.location.toLowerCase().includes('india'));
    const featured = (indiaInternships.length >= limit ? indiaInternships : all).slice(0, limit);
    await cache.set(cacheKey, featured);
    return featured;
  }
}

export const internshipsService = new InternshipsService();
