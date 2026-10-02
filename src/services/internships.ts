// ============================================================
// Opportune V4 — Internships Service
// GET /api/v1/internships
// GET /api/v1/internships/:slug
// ============================================================

import { apiClient } from './api';
import { Internship, InternshipFilters } from '@/types/internship';
import { PaginatedResponse, PaginationParams } from '@/types/api';
import { MOCK_INTERNSHIPS } from './mockData';

export const internshipsService = {
  /**
   * Fetch paginated and filtered list of internships
   */
  async getInternships(
    filters: InternshipFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 12 }
  ): Promise<PaginatedResponse<Internship>> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      query: filters.query || undefined,
      workplaceType: filters.workplaceType !== 'all' ? filters.workplaceType : undefined,
      location: filters.location || undefined,
      remoteOnly: filters.remoteOnly || undefined,
      minStipend: filters.minStipend || undefined,
      durationMonths: filters.durationMonths !== 'all' ? filters.durationMonths : undefined,
      ppoOnly: filters.ppoOnly || undefined,
      companySlug: filters.companySlug || undefined,
      startDate: filters.startDate !== 'all' ? filters.startDate : undefined,
      sort: filters.sort || 'latest',
    };

    let filtered = [...MOCK_INTERNSHIPS];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.company.name.toLowerCase().includes(q) ||
          i.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filters.workplaceType && filters.workplaceType !== 'all') {
      filtered = filtered.filter((i) => i.workplaceType === filters.workplaceType);
    }
    if (filters.remoteOnly) {
      filtered = filtered.filter((i) => i.workplaceType === 'remote');
    }
    if (filters.ppoOnly) {
      filtered = filtered.filter((i) => i.ppoOffered);
    }

    const fallback: PaginatedResponse<Internship> = {
      data: filtered,
      total: filtered.length,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      totalPages: Math.ceil(filtered.length / (pagination.pageSize || 12)) || 1,
      hasMore: false,
    };

    return apiClient.get<PaginatedResponse<Internship>>('/internships', { params }, fallback);
  },

  /**
   * Fetch single internship by slug
   */
  async getInternshipBySlug(slug: string): Promise<Internship> {
    const fallback = MOCK_INTERNSHIPS.find((i) => i.slug === slug || i.id === slug) || MOCK_INTERNSHIPS[0];
    return apiClient.get<Internship>(`/internships/${slug}`, {}, fallback);
  },

  /**
   * Fetch latest featured internships
   */
  async getFeaturedInternships(limit = 4): Promise<Internship[]> {
    const fallback = MOCK_INTERNSHIPS.filter((i) => i.isFeatured).slice(0, limit);
    return apiClient.get<Internship[]>('/internships/featured', { params: { limit } }, fallback);
  },
};
