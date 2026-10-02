// ============================================================
// OPPORTUNE V4 — Unified Search Service
// Cross-category search across Jobs, Internships, Hackathons, Contests
// ============================================================

import { cache } from '../config/redis.js';
import { opportunityStore } from '../database/opportunityStore.js';
import { Contest, Hackathon, Internship, Job } from '../types/opportunity.js';

export interface UnifiedSearchResults {
  jobs: Job[];
  internships: Internship[];
  hackathons: Hackathon[];
  contests: Contest[];
  totalResults: number;
}

export interface SearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  category: 'jobs' | 'internships' | 'hackathons' | 'contests';
  slug: string;
  iconType?: string;
}

export class SearchService {
  async search(query: string, category: string = 'all', limit: number = 10): Promise<UnifiedSearchResults> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        jobs: [],
        internships: [],
        hackathons: [],
        contests: [],
        totalResults: 0,
      };
    }

    const cacheKey = `search:unified:${q}:${category}:${limit}`;
    const cached = await cache.get<UnifiedSearchResults>(cacheKey);
    if (cached) return cached;

    const shouldSearchJobs = category === 'all' || category === 'jobs';
    const shouldSearchInternships = category === 'all' || category === 'internships';
    const shouldSearchHackathons = category === 'all' || category === 'hackathons';
    const shouldSearchContests = category === 'all' || category === 'contests';

    const isIndiaMatch = (item: { country?: string; location?: string }) =>
      item.country === 'India' || (item.location && item.location.toLowerCase().includes('india')) ? 1 : 0;

    const jobs = shouldSearchJobs
      ? opportunityStore
          .getJobs()
          .filter(
            (j) =>
              j.title.toLowerCase().includes(q) ||
              j.company.name.toLowerCase().includes(q) ||
              j.skills.some((s) => s.toLowerCase().includes(q))
          )
          .sort((a, b) => isIndiaMatch(b) - isIndiaMatch(a))
          .slice(0, limit)
      : [];

    const internships = shouldSearchInternships
      ? opportunityStore
          .getInternships()
          .filter(
            (i) =>
              i.title.toLowerCase().includes(q) ||
              i.company.name.toLowerCase().includes(q) ||
              i.skills.some((s) => s.toLowerCase().includes(q))
          )
          .sort((a, b) => isIndiaMatch(b) - isIndiaMatch(a))
          .slice(0, limit)
      : [];

    const hackathons = shouldSearchHackathons
      ? opportunityStore
          .getHackathons()
          .filter(
            (h) =>
              h.title.toLowerCase().includes(q) ||
              h.organizer.name.toLowerCase().includes(q) ||
              h.themes.some((t) => t.toLowerCase().includes(q))
          )
          .sort((a, b) => isIndiaMatch(b) - isIndiaMatch(a))
          .slice(0, limit)
      : [];

    const contests = shouldSearchContests
      ? opportunityStore
          .getContests()
          .filter((c) => c.name.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q))
          .slice(0, limit)
      : [];

    const totalResults = jobs.length + internships.length + hackathons.length + contests.length;

    const result: UnifiedSearchResults = {
      jobs,
      internships,
      hackathons,
      contests,
      totalResults,
    };

    await cache.set(cacheKey, result, 300); // 5 min TTL
    return result;
  }

  async getSuggestions(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const suggestions: SearchSuggestion[] = [];

    for (const job of opportunityStore.getJobs()) {
      if (suggestions.length >= limit) break;
      if (job.title.toLowerCase().includes(q) || job.company.name.toLowerCase().includes(q)) {
        suggestions.push({
          id: job.id,
          title: job.title,
          subtitle: `${job.company.name} • ${job.location}`,
          category: 'jobs',
          slug: job.slug,
          iconType: 'job',
        });
      }
    }

    for (const intern of opportunityStore.getInternships()) {
      if (suggestions.length >= limit) break;
      if (intern.title.toLowerCase().includes(q) || intern.company.name.toLowerCase().includes(q)) {
        suggestions.push({
          id: intern.id,
          title: intern.title,
          subtitle: `${intern.company.name} • ${intern.stipend?.formatted || 'Internship'}`,
          category: 'internships',
          slug: intern.slug,
          iconType: 'internship',
        });
      }
    }

    for (const hack of opportunityStore.getHackathons()) {
      if (suggestions.length >= limit) break;
      if (hack.title.toLowerCase().includes(q) || hack.organizer.name.toLowerCase().includes(q)) {
        suggestions.push({
          id: hack.id,
          title: hack.title,
          subtitle: `${hack.organizer.name} • Prize: ${hack.prizePool.formatted}`,
          category: 'hackathons',
          slug: hack.slug,
          iconType: 'hackathon',
        });
      }
    }

    for (const contest of opportunityStore.getContests()) {
      if (suggestions.length >= limit) break;
      if (contest.name.toLowerCase().includes(q) || contest.platform.toLowerCase().includes(q)) {
        suggestions.push({
          id: contest.id,
          title: contest.name,
          subtitle: `${contest.platform} • ${contest.durationFormatted}`,
          category: 'contests',
          slug: contest.slug,
          iconType: 'contest',
        });
      }
    }

    return suggestions.slice(0, limit);
  }
}

export const searchService = new SearchService();
