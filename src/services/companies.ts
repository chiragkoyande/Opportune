// ============================================================
// Opportune V4 — Companies Service
// GET /api/v1/companies
// GET /api/v1/companies/:slug
// ============================================================

import { apiClient } from './api';
import { Company, CompanyDetail, CompanyFilters } from '@/types/company';
import { PaginatedResponse, PaginationParams } from '@/types/api';
import { MOCK_COMPANIES, MOCK_JOBS, MOCK_INTERNSHIPS, MOCK_HACKATHONS } from './mockData';

export const companiesService = {
  /**
   * Fetch paginated list of companies
   */
  async getCompanies(
    filters: CompanyFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 12 }
  ): Promise<PaginatedResponse<Company>> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      query: filters.query || undefined,
      industry: filters.industry !== 'all' ? filters.industry : undefined,
      location: filters.location !== 'all' ? filters.location : undefined,
      hasJobs: filters.hasJobs || undefined,
      hasInternships: filters.hasInternships || undefined,
      hasHackathons: filters.hasHackathons || undefined,
      sort: filters.sort || 'opportunities',
    };

    let filtered = [...MOCK_COMPANIES];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.about.toLowerCase().includes(q)
      );
    }
    if (filters.industry && filters.industry !== 'all') {
      filtered = filtered.filter((c) => c.industry.toLowerCase().includes(filters.industry!.toLowerCase()));
    }

    const fallback: PaginatedResponse<Company> = {
      data: filtered,
      total: filtered.length,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 12,
      totalPages: Math.ceil(filtered.length / (pagination.pageSize || 12)) || 1,
      hasMore: false,
    };

    return apiClient.get<PaginatedResponse<Company>>('/companies', { params }, fallback);
  },

  /**
   * Fetch single company detail by slug with open jobs, internships, hackathons
   */
  async getCompanyBySlug(slug: string): Promise<CompanyDetail> {
    const base = MOCK_COMPANIES.find((c) => c.slug === slug || c.id === slug) || MOCK_COMPANIES[0];
    const relatedJobs = MOCK_JOBS.filter((j) => j.company.slug === base.slug);
    const relatedInternships = MOCK_INTERNSHIPS.filter((i) => i.company.slug === base.slug);
    const relatedHackathons = MOCK_HACKATHONS.filter((h) => h.organizer.name.toLowerCase().includes(base.name.toLowerCase()));

    const fallback: CompanyDetail = {
      ...base,
      jobs: relatedJobs,
      internships: relatedInternships,
      hackathons: relatedHackathons,
      stats: {
        openJobsCount: relatedJobs.length,
        openInternshipsCount: relatedInternships.length,
        hackathonsCount: relatedHackathons.length,
        totalOpportunities: relatedJobs.length + relatedInternships.length + relatedHackathons.length,
      },
    };

    return apiClient.get<CompanyDetail>(`/companies/${slug}`, {}, fallback);
  },

  /**
   * Fetch featured companies for homepage
   */
  async getFeaturedCompanies(limit = 4): Promise<Company[]> {
    const fallback = MOCK_COMPANIES.slice(0, limit);
    return apiClient.get<Company[]>('/companies/featured', { params: { limit } }, fallback);
  },
};
