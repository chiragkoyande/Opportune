// ============================================================
// Opportune V4 — Jobs Service
// GET /api/v1/jobs
// GET /api/v1/jobs/:slug
// ============================================================

import { apiClient } from './api';
import { Job, JobFilters } from '@/types/job';
import { PaginatedResponse, PaginationParams } from '@/types/api';
import { MOCK_JOBS } from './mockData';

export const jobsService = {
  /**
   * Fetch paginated and filtered list of jobs
   */
  async getJobs(
    filters: JobFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 12 }
  ): Promise<PaginatedResponse<Job>> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      query: filters.query || undefined,
      employmentType: filters.employmentType !== 'all' ? filters.employmentType : undefined,
      workplaceType: filters.workplaceType !== 'all' ? filters.workplaceType : undefined,
      seniority: filters.seniority !== 'all' ? filters.seniority : undefined,
      location: filters.location || undefined,
      remoteOnly: filters.remoteOnly || undefined,
      companySlug: filters.companySlug || undefined,
      minSalary: filters.minSalary || undefined,
      postedWithin: filters.postedWithin !== 'all' ? filters.postedWithin : undefined,
      sort: filters.sort || 'latest',
    };

    // Filter mock data locally for robust fallback
    let filtered = [...MOCK_JOBS];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filters.employmentType && filters.employmentType !== 'all') {
      filtered = filtered.filter((j) => j.employmentType === filters.employmentType);
    }
    if (filters.workplaceType && filters.workplaceType !== 'all') {
      filtered = filtered.filter((j) => j.workplaceType === filters.workplaceType);
    }
    if (filters.seniority && filters.seniority !== 'all') {
      filtered = filtered.filter((j) => j.seniority === filters.seniority);
    }
    if (filters.remoteOnly) {
      filtered = filtered.filter((j) => j.workplaceType === 'remote');
    }

    const fallback: PaginatedResponse<Job> = {
      data: filtered,
      total: filtered.length,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      totalPages: Math.ceil(filtered.length / (pagination.pageSize || 12)) || 1,
      hasMore: false,
    };

    return apiClient.get<PaginatedResponse<Job>>('/jobs', { params }, fallback);
  },

  /**
   * Fetch single job by slug
   */
  async getJobBySlug(slug: string): Promise<Job> {
    const fallback = MOCK_JOBS.find((j) => j.slug === slug || j.id === slug) || MOCK_JOBS[0];
    return apiClient.get<Job>(`/jobs/${slug}`, {}, fallback);
  },

  /**
   * Fetch latest featured jobs
   */
  async getFeaturedJobs(limit = 4): Promise<Job[]> {
    const fallback = MOCK_JOBS.filter((j) => j.isFeatured).slice(0, limit);
    return apiClient.get<Job[]>('/jobs/featured', { params: { limit } }, fallback);
  },
};
