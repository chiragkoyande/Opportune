// ============================================================
// Opportune V4 — Hackathon Types
// Dedicated types for Hackathon opportunities
// ============================================================

export type HackathonMode = 'online' | 'offline' | 'hybrid';
export type HackathonStatus = 'upcoming' | 'open' | 'closing-soon' | 'closed' | 'in-progress' | 'ended';

export type HackathonSortOption = 'deadline' | 'recently-added' | 'prize' | 'popularity';

export interface HackathonPrizeItem {
  title: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface HackathonTimelineStep {
  title: string;
  date: string;
  description?: string;
  completed?: boolean;
}

export interface HackathonSponsor {
  name: string;
  logoUrl?: string;
  tier: 'title' | 'platinum' | 'gold' | 'silver' | 'partner';
  websiteUrl?: string;
}

export interface HackathonFaq {
  question: string;
  answer: string;
}

export interface HackathonOrganizer {
  name: string;
  logoUrl: string | null;
  websiteUrl?: string;
  verified?: boolean;
}

export interface HackathonTeamSize {
  min: number;
  max: number;
  formatted: string; // e.g. "2–4 members"
}

export interface Hackathon {
  id: string;
  slug: string;
  title: string;
  organizer: HackathonOrganizer;
  mode: HackathonMode;
  location?: string;
  city?: string;
  country?: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  prizePool: {
    total: number;
    currency: string;
    formatted: string; // e.g. "₹5,00,000"
    prizes?: HackathonPrizeItem[];
  };
  teamSize: HackathonTeamSize;
  eligibility: string;
  themes: string[];
  technologies: string[];
  tags: string[];
  description: string;
  rules?: string[];
  timeline?: HackathonTimelineStep[];
  sponsors?: HackathonSponsor[];
  faqs?: HackathonFaq[];
  status: HackathonStatus;
  applyUrl: string;
  officialUrl?: string;
  bannerUrl?: string | null;
  sourcePlatform?: string;
  isFeatured?: boolean;
  isBookmarked?: boolean;
  participantsCount?: number;
  viewsCount?: number;
}

export interface HackathonFilters {
  query?: string;
  mode?: HackathonMode | 'all';
  status?: HackathonStatus | 'all';
  location?: string;
  theme?: string | 'all';
  organizer?: string;
  technology?: string;
  minPrize?: number;
  teamSize?: number | 'all';
  deadlineWithin?: '24h' | '3d' | '7d' | '30d' | 'all';
  sort?: HackathonSortOption;
}

export const DEFAULT_HACKATHON_FILTERS: HackathonFilters = {
  query: '',
  mode: 'all',
  status: 'all',
  location: '',
  theme: 'all',
  organizer: '',
  technology: '',
  teamSize: 'all',
  deadlineWithin: 'all',
  sort: 'deadline',
};
