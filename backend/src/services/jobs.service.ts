// ============================================================
// OPPORTUNE V4 — Jobs Service
// Dedicated career jobs logic with strict metadata isolation
// ============================================================

import { cache } from '../config/redis.js';
import { db } from '../database/db.js';
import { opportunityStore } from '../database/opportunityStore.js';
import { SEED_JOBS } from '../database/seedData.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { createPaginatedResponse, PaginatedResponse } from '../types/api.js';
import { Job } from '../types/opportunity.js';

export interface JobFilterOptions {
  query?: string;
  employmentType?: string;
  workplaceType?: string;
  seniority?: string;
  location?: string;
  remoteOnly?: boolean;
  companySlug?: string;
  minSalary?: number;
  postedWithin?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class JobsService {
  async getJobs(options: JobFilterOptions = {}, userId?: string): Promise<PaginatedResponse<Job>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const offset = (page - 1) * limit;

    const cacheKey = `jobs:list:${options.query || ''}:${options.employmentType || ''}:${options.workplaceType || ''}:${options.seniority || ''}:${options.location || ''}:${options.remoteOnly || ''}:${options.companySlug || ''}:${options.minSalary || ''}:${options.postedWithin || ''}:${options.sort || ''}:${page}:${limit}`;
    
    if (!userId) {
      const cached = await cache.get<PaginatedResponse<Job>>(cacheKey);
      if (cached) return cached;
    }

    // Try PostgreSQL if alive
    const isDbAlive = await db.isHealthy();
    if (isDbAlive) {
      try {
        let whereClauses: string[] = ["j.status = 'published'", 'j.is_active = true'];
        let params: unknown[] = [];
        let paramIdx = 1;

        if (options.query) {
          whereClauses.push(`(LOWER(j.title) LIKE $${paramIdx} OR LOWER(j.description) LIKE $${paramIdx} OR LOWER(c.name) LIKE $${paramIdx})`);
          params.push(`%${options.query.toLowerCase()}%`);
          paramIdx++;
        }

        if (options.employmentType && options.employmentType !== 'all') {
          whereClauses.push(`j.employment_type = $${paramIdx}`);
          params.push(options.employmentType.toLowerCase());
          paramIdx++;
        }

        if (options.workplaceType && options.workplaceType !== 'all') {
          whereClauses.push(`j.workplace_type = $${paramIdx}`);
          params.push(options.workplaceType.toLowerCase());
          paramIdx++;
        }

        if (options.remoteOnly) {
          whereClauses.push(`j.workplace_type = 'remote'`);
        }

        if (options.seniority && options.seniority !== 'all') {
          whereClauses.push(`j.seniority = $${paramIdx}`);
          params.push(options.seniority.toLowerCase());
          paramIdx++;
        }

        if (options.companySlug) {
          whereClauses.push(`c.slug = $${paramIdx}`);
          params.push(options.companySlug);
          paramIdx++;
        }

        if (options.minSalary && options.minSalary > 0) {
          whereClauses.push(`j.salary_min >= $${paramIdx}`);
          params.push(options.minSalary);
          paramIdx++;
        }

        const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
        const countSql = `SELECT COUNT(*) as total FROM public.jobs j JOIN public.companies c ON j.company_id = c.id ${whereSql}`;
        const countRes = await db.query(countSql, params);
        const total = parseInt(countRes.rows[0]?.total || '0', 10);

        let orderSql = 'ORDER BY j.posted_at DESC';
        if (options.sort === 'salary') orderSql = 'ORDER BY j.salary_min DESC NULLS LAST';

        const listSql = `
          SELECT j.*, 
                 c.name as comp_name, c.slug as comp_slug, c.logo_url as comp_logo, c.website_url as comp_web, 
                 c.is_verified as comp_ver, c.industry as comp_ind, c.headquarters as comp_hq
          FROM public.jobs j
          JOIN public.companies c ON j.company_id = c.id
          ${whereSql}
          ${orderSql}
          LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `;
        const listRes = await db.query(listSql, [...params, limit, offset]);

        if (listRes.rows.length > 0) {
          const jobs: Job[] = listRes.rows.map((row) => ({
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
            employmentType: row.employment_type,
            seniority: row.seniority,
            experienceYears: { min: row.exp_min, max: row.exp_max },
            salary: row.salary_min || row.salary_max ? {
              min: row.salary_min ? parseFloat(row.salary_min) : null,
              max: row.salary_max ? parseFloat(row.salary_max) : null,
              currency: row.salary_currency,
              period: row.salary_period,
              isNegotiable: row.salary_is_negotiable,
            } : null,
            skills: row.skills || [],
            description: row.description,
            responsibilities: row.responsibilities || [],
            requirements: row.requirements || [],
            benefits: row.benefits || [],
            postedAt: row.posted_at,
            updatedAt: row.updated_at,
            expiresAt: row.expires_at,
            applyUrl: row.apply_url,
            sourceUrl: row.source_url,
            sourcePlatform: row.source_platform,
            isFeatured: row.is_featured,
            viewsCount: row.views_count,
            applicantsCount: row.applicants_count,
          }));

          const response = createPaginatedResponse(jobs, total, page, limit);
          if (!userId) await cache.set(cacheKey, response);
          return response;
        }
      } catch {
        // Fall back
      }
    }

    // Dynamic verified opportunity store dataset
    let filtered = [...opportunityStore.getJobs()];
    if (options.query) {
      const q = options.query.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (options.employmentType && options.employmentType !== 'all') {
      filtered = filtered.filter((j) => j.employmentType === options.employmentType);
    }
    if (options.workplaceType && options.workplaceType !== 'all') {
      filtered = filtered.filter((j) => j.workplaceType === options.workplaceType);
    }
    if (options.remoteOnly) {
      filtered = filtered.filter((j) => j.workplaceType === 'remote');
    }
    if (options.seniority && options.seniority !== 'all') {
      filtered = filtered.filter((j) => j.seniority === options.seniority);
    }
    if (options.companySlug) {
      filtered = filtered.filter((j) => j.company.slug === options.companySlug);
    }
    if (options.minSalary && options.minSalary > 0) {
      filtered = filtered.filter((j) => j.salary && (j.salary.min || 0) >= options.minSalary!);
    }
    // India-first ranking: prioritize India-located opportunities at the top
    filtered.sort((a, b) => {
      if (options.sort === 'salary') {
        const diff = (b.salary?.min || 0) - (a.salary?.min || 0);
        if (diff !== 0) return diff;
      }
      const isIndiaA = a.country === 'India' || a.location.toLowerCase().includes('india') ? 1 : 0;
      const isIndiaB = b.country === 'India' || b.location.toLowerCase().includes('india') ? 1 : 0;
      if (isIndiaA !== isIndiaB) {
        return isIndiaB - isIndiaA; // India roles at the top!
      }
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    const response = createPaginatedResponse(paginated, total, page, limit);
    if (!userId) await cache.set(cacheKey, response);
    return response;
  }

  async getJobBySlug(slug: string, _userId?: string): Promise<Job> {
    const cacheKey = `job:${slug}`;
    const cached = await cache.get<Job>(cacheKey);
    if (cached) return cached;

    const isDbAlive = await db.isHealthy();
    if (isDbAlive) {
      try {
        const querySql = `
          SELECT j.*, 
                 c.name as comp_name, c.slug as comp_slug, c.logo_url as comp_logo, c.website_url as comp_web, 
                 c.is_verified as comp_ver, c.industry as comp_ind, c.headquarters as comp_hq
          FROM public.jobs j
          JOIN public.companies c ON j.company_id = c.id
          WHERE (j.slug = $1 OR j.id::text = $1) AND j.status = 'published' AND j.is_active = true
          LIMIT 1
        `;
        const res = await db.query(querySql, [slug]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const job: Job = {
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
            employmentType: row.employment_type,
            seniority: row.seniority,
            experienceYears: { min: row.exp_min, max: row.exp_max },
            salary: row.salary_min || row.salary_max ? {
              min: row.salary_min ? parseFloat(row.salary_min) : null,
              max: row.salary_max ? parseFloat(row.salary_max) : null,
              currency: row.salary_currency,
              period: row.salary_period,
              isNegotiable: row.salary_is_negotiable,
            } : null,
            skills: row.skills || [],
            description: row.description,
            responsibilities: row.responsibilities || [],
            requirements: row.requirements || [],
            benefits: row.benefits || [],
            postedAt: row.posted_at,
            updatedAt: row.updated_at,
            expiresAt: row.expires_at,
            applyUrl: row.apply_url,
            sourceUrl: row.source_url,
            sourcePlatform: row.source_platform,
            isFeatured: row.is_featured,
            viewsCount: row.views_count,
            applicantsCount: row.applicants_count,
          };
          await cache.set(cacheKey, job);
          return job;
        }
      } catch {
        // Fall back
      }
    }

    const found = opportunityStore.getJobBySlug(slug);
    if (!found) {
      throw new NotFoundError(`Job opportunity with slug '${slug}' not found`);
    }

    await cache.set(cacheKey, found);
    return found;
  }

  async getFeaturedJobs(limit = 4): Promise<Job[]> {
    const cacheKey = `jobs:featured:${limit}`;
    const cached = await cache.get<Job[]>(cacheKey);
    if (cached) return cached;

    const all = opportunityStore.getJobs();
    const indiaJobs = all.filter((j) => j.country === 'India' || j.location.toLowerCase().includes('india'));
    const featured = (indiaJobs.length >= limit ? indiaJobs : all).slice(0, limit);
    await cache.set(cacheKey, featured);
    return featured;
  }
}

export const jobsService = new JobsService();
