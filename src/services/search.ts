// ============================================================
// Opportune V4 — Unified Search Service
// GET /api/v1/search?q=...&category=...
// ============================================================

import { apiClient } from './api';
import { Job } from '@/types/job';
import { Internship } from '@/types/internship';
import { Hackathon } from '@/types/hackathon';
import { Contest } from '@/types/contest';
import { Company } from '@/types/company';
import { MOCK_JOBS, MOCK_INTERNSHIPS, MOCK_HACKATHONS, MOCK_CONTESTS, MOCK_COMPANIES } from './mockData';

export type SearchCategoryType = 'all' | 'jobs' | 'internships' | 'hackathons' | 'contests' | 'companies';

export interface UnifiedSearchResults {
  query: string;
  category: SearchCategoryType;
  jobs: Job[];
  internships: Internship[];
  hackathons: Hackathon[];
  contests: Contest[];
  companies: Company[];
  counts: {
    jobs: number;
    internships: number;
    hackathons: number;
    contests: number;
    companies: number;
    total: number;
  };
}

export const searchService = {
  /**
   * Search across all opportunity types and companies
   */
  async search(query: string, category: SearchCategoryType = 'all'): Promise<UnifiedSearchResults> {
    const q = query.trim().toLowerCase();

    // Local filter fallback
    const matchingJobs = q
      ? MOCK_JOBS.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.company.name.toLowerCase().includes(q) ||
            j.skills.some((s) => s.toLowerCase().includes(q)) ||
            j.location.toLowerCase().includes(q)
        )
      : MOCK_JOBS;

    const matchingInternships = q
      ? MOCK_INTERNSHIPS.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.company.name.toLowerCase().includes(q) ||
            i.skills.some((s) => s.toLowerCase().includes(q)) ||
            i.location.toLowerCase().includes(q)
        )
      : MOCK_INTERNSHIPS;

    const matchingHackathons = q
      ? MOCK_HACKATHONS.filter(
          (h) =>
            h.title.toLowerCase().includes(q) ||
            h.organizer.name.toLowerCase().includes(q) ||
            h.themes.some((t) => t.toLowerCase().includes(q)) ||
            h.technologies.some((t) => t.toLowerCase().includes(q)) ||
            h.tags.some((t) => t.toLowerCase().includes(q))
        )
      : MOCK_HACKATHONS;

    const matchingContests = q
      ? MOCK_CONTESTS.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.platform.toLowerCase().includes(q) ||
            (c.languagesAllowed && c.languagesAllowed.some((l) => l.toLowerCase().includes(q)))
        )
      : MOCK_CONTESTS;

    const matchingCompanies = q
      ? MOCK_COMPANIES.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            c.about.toLowerCase().includes(q)
        )
      : MOCK_COMPANIES;

    const fallback: UnifiedSearchResults = {
      query,
      category,
      jobs: category === 'all' || category === 'jobs' ? matchingJobs : [],
      internships: category === 'all' || category === 'internships' ? matchingInternships : [],
      hackathons: category === 'all' || category === 'hackathons' ? matchingHackathons : [],
      contests: category === 'all' || category === 'contests' ? matchingContests : [],
      companies: category === 'all' || category === 'companies' ? matchingCompanies : [],
      counts: {
        jobs: matchingJobs.length,
        internships: matchingInternships.length,
        hackathons: matchingHackathons.length,
        contests: matchingContests.length,
        companies: matchingCompanies.length,
        total:
          matchingJobs.length +
          matchingInternships.length +
          matchingHackathons.length +
          matchingContests.length +
          matchingCompanies.length,
      },
    };

    return apiClient.get<UnifiedSearchResults>(
      '/search',
      { params: { q: query, category: category !== 'all' ? category : undefined } },
      fallback
    );
  },
};
