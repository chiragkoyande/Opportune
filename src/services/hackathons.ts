// ============================================================
// Opportune V4 — Hackathons Service
// GET /api/v1/hackathons
// GET /api/v1/hackathons/:slug
// ============================================================

import { apiClient } from './api';
import { Hackathon, HackathonFilters } from '@/types/hackathon';
import { PaginatedResponse, PaginationParams } from '@/types/api';
import { MOCK_HACKATHONS } from './mockData';

export const hackathonsService = {
  /**
   * Fetch paginated and filtered list of hackathons
   */
  async getHackathons(
    filters: HackathonFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 12 }
  ): Promise<PaginatedResponse<Hackathon>> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      query: filters.query || undefined,
      mode: filters.mode !== 'all' ? filters.mode : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      location: filters.location || undefined,
      theme: filters.theme !== 'all' ? filters.theme : undefined,
      organizer: filters.organizer || undefined,
      minPrize: filters.minPrize || undefined,
      teamSize: filters.teamSize !== 'all' ? filters.teamSize : undefined,
      sort: filters.sort || 'deadline',
    };

    let filtered = [...MOCK_HACKATHONS];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.organizer.name.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q)) ||
          h.themes.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.mode && filters.mode !== 'all') {
      filtered = filtered.filter((h) => h.mode === filters.mode);
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((h) => h.status === filters.status);
    }

    const fallback: PaginatedResponse<Hackathon> = {
      data: filtered,
      total: filtered.length,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      totalPages: Math.ceil(filtered.length / (pagination.pageSize || 12)) || 1,
      hasMore: false,
    };

    return apiClient.get<PaginatedResponse<Hackathon>>('/hackathons', { params }, fallback);
  },

  /**
   * Fetch single hackathon by slug
   */
  async getHackathonBySlug(slug: string): Promise<Hackathon> {
    const fallback = MOCK_HACKATHONS.find((h) => h.slug === slug || h.id === slug) || MOCK_HACKATHONS[0];
    return apiClient.get<Hackathon>(`/hackathons/${slug}`, {}, fallback);
  },

  /**
   * Fetch trending hackathons
   */
  async getTrendingHackathons(limit = 4): Promise<Hackathon[]> {
    const fallback = MOCK_HACKATHONS.filter((h) => h.isFeatured).slice(0, limit);
    return apiClient.get<Hackathon[]>('/hackathons/trending', { params: { limit } }, fallback);
  },
};
