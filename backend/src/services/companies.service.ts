// ============================================================
// OPPORTUNE V4 — Companies Service
// ============================================================

import { cache } from '../config/redis.js';
import { db } from '../database/db.js';
import { opportunityStore } from '../database/opportunityStore.js';
import { SEED_COMPANIES } from '../database/seedData.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { createPaginatedResponse, PaginatedResponse } from '../types/api.js';
import { Company } from '../types/opportunity.js';

export interface CompanyFilterOptions {
  query?: string;
  industry?: string;
  location?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class CompaniesService {
  async getCompanies(options: CompanyFilterOptions = {}): Promise<PaginatedResponse<Company>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const offset = (page - 1) * limit;

    const cacheKey = `companies:list:${options.query || ''}:${options.industry || ''}:${options.location || ''}:${options.sort || ''}:${page}:${limit}`;
    const cached = await cache.get<PaginatedResponse<Company>>(cacheKey);
    if (cached) return cached;

    // Check if live DB is accessible
    const isDbAlive = await db.isHealthy();
    if (isDbAlive) {
      try {
        let whereClauses: string[] = [];
        let params: unknown[] = [];
        let paramIdx = 1;

        if (options.query) {
          whereClauses.push(`(LOWER(name) LIKE $${paramIdx} OR LOWER(domain) LIKE $${paramIdx} OR LOWER(about) LIKE $${paramIdx})`);
          params.push(`%${options.query.toLowerCase()}%`);
          paramIdx++;
        }

        if (options.industry && options.industry.toLowerCase() !== 'all') {
          whereClauses.push(`LOWER(industry) = $${paramIdx}`);
          params.push(options.industry.toLowerCase());
          paramIdx++;
        }

        if (options.location && options.location.toLowerCase() !== 'all') {
          whereClauses.push(`LOWER(headquarters) LIKE $${paramIdx}`);
          params.push(`%${options.location.toLowerCase()}%`);
          paramIdx++;
        }

        const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const countSql = `SELECT COUNT(*) as total FROM public.companies ${whereSql}`;
        const countRes = await db.query(countSql, params);
        const total = parseInt(countRes.rows[0]?.total || '0', 10);

        let orderSql = 'ORDER BY created_at DESC';
        if (options.sort === 'name') orderSql = 'ORDER BY name ASC';

        const listSql = `SELECT * FROM public.companies ${whereSql} ${orderSql} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
        const listRes = await db.query(listSql, [...params, limit, offset]);

        if (listRes.rows.length > 0) {
          const companies: Company[] = listRes.rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            name: row.name,
            domain: row.domain,
            logoUrl: row.logo_url,
            bannerUrl: row.banner_url,
            industry: row.industry,
            headquarters: row.headquarters,
            size: row.size,
            foundedYear: row.founded_year,
            about: row.about,
            culture: row.culture,
            perks: row.perks || [],
            websiteUrl: row.website_url,
            careersUrl: row.careers_url,
            socialLinks: row.social_links || {},
            stats: {
              openJobsCount: 0,
              openInternshipsCount: 0,
              hackathonsCount: 0,
              totalOpportunities: 0,
            },
            isVerified: row.is_verified,
            isHiring: row.is_hiring,
          }));

          const response = createPaginatedResponse(companies, total, page, limit);
          await cache.set(cacheKey, response);
          return response;
        }
      } catch {
        // Fall back to seed dataset
      }
    }

    // Dynamic verified opportunity store dataset
    let filtered = [...opportunityStore.getCompanies()];
    if (options.query) {
      const q = options.query.toLowerCase();
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.about.toLowerCase().includes(q)
      );
    }
    if (options.industry && options.industry.toLowerCase() !== 'all') {
      filtered = filtered.filter((c) => c.industry.toLowerCase() === options.industry!.toLowerCase());
    }
    if (options.location && options.location.toLowerCase() !== 'all') {
      filtered = filtered.filter((c) => c.headquarters.toLowerCase().includes(options.location!.toLowerCase()));
    }
    // India-first ranking: prioritize Indian companies and companies with major Indian presence
    filtered.sort((a, b) => {
      if (options.sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      const isIndiaA = a.headquarters.toLowerCase().includes('india') ? 1 : 0;
      const isIndiaB = b.headquarters.toLowerCase().includes('india') ? 1 : 0;
      if (isIndiaA !== isIndiaB) {
        return isIndiaB - isIndiaA; // India companies first!
      }
      return (b.stats?.totalOpportunities || 0) - (a.stats?.totalOpportunities || 0);
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    const response = createPaginatedResponse(paginated, total, page, limit);
    await cache.set(cacheKey, response);
    return response;
  }

  async getCompanyBySlug(slug: string): Promise<Company> {
    const cacheKey = `company:${slug}`;
    const cached = await cache.get<Company>(cacheKey);
    if (cached) return cached;

    const isDbAlive = await db.isHealthy();
    if (isDbAlive) {
      try {
        const res = await db.query('SELECT * FROM public.companies WHERE slug = $1 LIMIT 1', [slug]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const company: Company = {
            id: row.id,
            slug: row.slug,
            name: row.name,
            domain: row.domain,
            logoUrl: row.logo_url,
            bannerUrl: row.banner_url,
            industry: row.industry,
            headquarters: row.headquarters,
            size: row.size,
            foundedYear: row.founded_year,
            about: row.about,
            culture: row.culture,
            perks: row.perks || [],
            websiteUrl: row.website_url,
            careersUrl: row.careers_url,
            socialLinks: row.social_links || {},
            stats: {
              openJobsCount: 0,
              openInternshipsCount: 0,
              hackathonsCount: 0,
              totalOpportunities: 0,
            },
            isVerified: row.is_verified,
            isHiring: row.is_hiring,
          };
          await cache.set(cacheKey, company);
          return company;
        }
      } catch {
        // Fall back
      }
    }

    const found = opportunityStore.getCompanyBySlug(slug);
    if (!found) {
      throw new NotFoundError(`Company with slug '${slug}' not found`);
    }

    await cache.set(cacheKey, found);
    return found;
  }

  async getFeaturedCompanies(limit = 6): Promise<Company[]> {
    const cacheKey = `companies:featured:${limit}`;
    const cached = await cache.get<Company[]>(cacheKey);
    if (cached) return cached;

    const all = opportunityStore.getCompanies();
    const indiaCompanies = all.filter((c) => c.headquarters.toLowerCase().includes('india') && c.isVerified);
    const featured = (indiaCompanies.length >= limit ? indiaCompanies : all).slice(0, limit);
    await cache.set(cacheKey, featured);
    return featured;
  }
}

export const companiesService = new CompaniesService();
