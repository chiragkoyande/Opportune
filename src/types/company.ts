// ============================================================
// Opportune V4 — Company Types
// Dedicated types for Companies hosting opportunities
// ============================================================

import { Job } from './job';
import { Internship } from './internship';
import { Hackathon } from './hackathon';

export interface CompanySocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  careers?: string;
}

export interface CompanyStats {
  openJobsCount: number;
  openInternshipsCount: number;
  hackathonsCount: number;
  totalOpportunities: number;
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  domain: string;
  logoUrl: string | null;
  bannerUrl?: string | null;
  industry: string;
  headquarters: string;
  size?: string; // e.g. "1,000-5,000 employees"
  foundedYear?: number;
  about: string;
  culture?: string;
  perks?: string[];
  websiteUrl: string;
  careersUrl?: string;
  socialLinks: CompanySocialLinks;
  stats: CompanyStats;
  isVerified?: boolean;
  isHiring?: boolean;
}

export interface CompanyDetail extends Company {
  jobs: Job[];
  internships: Internship[];
  hackathons: Hackathon[];
}

export interface CompanyFilters {
  query?: string;
  industry?: string | 'all';
  location?: string | 'all';
  hasJobs?: boolean;
  hasInternships?: boolean;
  hasHackathons?: boolean;
  sort?: 'name' | 'opportunities' | 'recently-active';
}

export const DEFAULT_COMPANY_FILTERS: CompanyFilters = {
  query: '',
  industry: 'all',
  location: 'all',
  hasJobs: false,
  hasInternships: false,
  hasHackathons: false,
  sort: 'opportunities',
};
