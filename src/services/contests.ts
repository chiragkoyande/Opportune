// ============================================================
// Opportune V4 — Coding Contests Service
// GET /api/v1/contests
// GET /api/v1/contests/:slug
// ============================================================

import { apiClient } from './api';
import { Contest, ContestFilters } from '@/types/contest';
import { PaginatedResponse, PaginationParams } from '@/types/api';
import { MOCK_CONTESTS } from './mockData';

export const contestsService = {
  /**
   * Fetch paginated and filtered list of coding contests
   */
  async getContests(
    filters: ContestFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 12 }
  ): Promise<PaginatedResponse<Contest>> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      query: filters.query || undefined,
      platform: filters.platform !== 'all' ? filters.platform : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      difficulty: filters.difficulty !== 'all' ? filters.difficulty : undefined,
      ratingType: filters.ratingType !== 'all' ? filters.ratingType : undefined,
      sort: filters.sort || 'start-time',
    };

    let filtered = [...MOCK_CONTESTS];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.platform.toLowerCase().includes(q)
      );
    }
    if (filters.platform && filters.platform !== 'all') {
      filtered = filtered.filter((c) => c.platform === filters.platform);
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      filtered = filtered.filter((c) => c.difficulty === filters.difficulty);
    }

    const fallback: PaginatedResponse<Contest> = {
      data: filtered,
      total: filtered.length,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      totalPages: Math.ceil(filtered.length / (pagination.pageSize || 12)) || 1,
      hasMore: false,
    };

    return apiClient.get<PaginatedResponse<Contest>>('/contests', { params }, fallback);
  },

  /**
   * Fetch single contest by slug
   */
  async getContestBySlug(slug: string): Promise<Contest> {
    const fallback = MOCK_CONTESTS.find((c) => c.slug === slug || c.id === slug) || MOCK_CONTESTS[0];
    return apiClient.get<Contest>(`/contests/${slug}`, {}, fallback);
  },

  /**
   * Fetch upcoming contests
   */
  async getUpcomingContests(limit = 4): Promise<Contest[]> {
    const fallback = MOCK_CONTESTS.filter((c) => c.status === 'UPCOMING' || c.status === 'LIVE').slice(0, limit);
    return apiClient.get<Contest[]>('/contests/upcoming', { params: { limit } }, fallback);
  },
};
