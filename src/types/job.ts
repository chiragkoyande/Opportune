// ============================================================
// Opportune V4 — Job Types
// Dedicated types for Job opportunities with no metadata pollution
// ============================================================

export type JobEmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance';
export type JobWorkplaceType = 'remote' | 'hybrid' | 'onsite';
export type JobSeniority = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export type JobSortOption = 'latest' | 'relevance' | 'salary' | 'recently-updated';

export interface JobCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl?: string;
  verified?: boolean;
  industry?: string;
  location?: string;
}

export interface JobSalary {
  min: number | null;
  max: number | null;
  currency: string;
  period: 'year' | 'month' | 'hour';
  formatted?: string;
  isNegotiable?: boolean;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  company: JobCompany;
  location: string;
  country?: string;
  city?: string;
  workplaceType: JobWorkplaceType;
  employmentType: JobEmploymentType;
  seniority: JobSeniority;
  experienceYears?: {
    min: number;
    max?: number;
  };
  salary: JobSalary | null;
  skills: string[];
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  postedAt: string;
  updatedAt?: string;
  expiresAt?: string;
  applyUrl: string;
  sourceUrl?: string;
  sourcePlatform?: string;
  isFeatured?: boolean;
  isBookmarked?: boolean;
  hasApplied?: boolean;
  viewsCount?: number;
  applicantsCount?: number;
}

export interface JobFilters {
  query?: string;
  employmentType?: JobEmploymentType | 'all';
  workplaceType?: JobWorkplaceType | 'all';
  seniority?: JobSeniority | 'all';
  location?: string;
  remoteOnly?: boolean;
  companySlug?: string;
  minSalary?: number;
  skills?: string[];
  postedWithin?: '24h' | '7d' | '30d' | 'all';
  sort?: JobSortOption;
}

export const DEFAULT_JOB_FILTERS: JobFilters = {
  query: '',
  employmentType: 'all',
  workplaceType: 'all',
  seniority: 'all',
  location: '',
  remoteOnly: false,
  companySlug: '',
  skills: [],
  postedWithin: 'all',
  sort: 'latest',
};
