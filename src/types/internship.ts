// ============================================================
// Opportune V4 — Internship Types
// Dedicated types for Internship opportunities
// ============================================================

import { JobCompany, JobWorkplaceType } from './job';

export type InternshipDurationUnit = 'weeks' | 'months';

export interface InternshipStipend {
  min: number | null;
  max: number | null;
  currency: string;
  period: 'month' | 'lump-sum' | 'unpaid';
  formatted?: string;
  isPerformanceBased?: boolean;
}

export interface InternshipDuration {
  value: number;
  unit: InternshipDurationUnit;
  formatted: string;
}

export type InternshipSortOption = 'latest' | 'stipend' | 'deadline' | 'relevance';

export interface Internship {
  id: string;
  slug: string;
  title: string;
  company: JobCompany;
  location: string;
  country?: string;
  city?: string;
  workplaceType: JobWorkplaceType;
  stipend: InternshipStipend | null;
  duration: InternshipDuration;
  startDate: string; // ISO date or "immediate"
  isImmediate?: boolean;
  applicationDeadline?: string;
  skills: string[];
  description: string;
  perks?: string[]; // e.g. Certificate, Letter of recommendation, Pre-placement offer (PPO)
  ppoOffered?: boolean;
  eligibility?: string[];
  responsibilities?: string[];
  postedAt: string;
  applyUrl: string;
  sourceUrl?: string;
  sourcePlatform?: string;
  isFeatured?: boolean;
  isBookmarked?: boolean;
  hasApplied?: boolean;
  viewsCount?: number;
  applicantsCount?: number;
}

export interface InternshipFilters {
  query?: string;
  workplaceType?: JobWorkplaceType | 'all';
  location?: string;
  remoteOnly?: boolean;
  minStipend?: number;
  durationMonths?: number | 'all';
  ppoOnly?: boolean;
  skills?: string[];
  companySlug?: string;
  startDate?: 'immediate' | 'next-month' | 'flexible' | 'all';
  sort?: InternshipSortOption;
}

export const DEFAULT_INTERNSHIP_FILTERS: InternshipFilters = {
  query: '',
  workplaceType: 'all',
  location: '',
  remoteOnly: false,
  durationMonths: 'all',
  ppoOnly: false,
  skills: [],
  companySlug: '',
  startDate: 'all',
  sort: 'latest',
};
