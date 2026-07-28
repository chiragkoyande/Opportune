// ============================================================
// Opportune V3 — Core Type System
// Single source of truth for all opportunity-related types.
// ============================================================

/** All supported opportunity categories */
export const OPPORTUNITY_CATEGORIES = [
  'hackathon', 'internship', 'job', 'contest', 'scholarship',
  'fellowship', 'open_source', 'research', 'campus_hiring',
  'competition', 'grant', 'bootcamp',
] as const;

export type OpportunityCategory = typeof OPPORTUNITY_CATEGORIES[number];

/** Legacy type alias — maps to the first 3 categories for backward compat */
export type OpportunityType = 'hackathon' | 'internship' | 'contest';

export const OPPORTUNITY_MODES = ['online', 'offline', 'hybrid'] as const;
export type OpportunityMode = typeof OPPORTUNITY_MODES[number];

export const OPPORTUNITY_STATUSES = ['active', 'expired', 'upcoming', 'draft'] as const;
export type OpportunityStatus = typeof OPPORTUNITY_STATUSES[number];

export const OPPORTUNITY_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export type OpportunityDifficulty = typeof OPPORTUNITY_DIFFICULTIES[number];

/**
 * Core Opportunity model — mirrors the database schema.
 * All date fields are ISO strings from the DB; components convert as needed.
 */
export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  description: string;
  organization: string;
  organization_verified: boolean;
  logo_url: string | null;
  banner_url: string | null;
  category: OpportunityCategory;
  mode: OpportunityMode;
  deadline: string;
  start_date: string | null;
  end_date: string | null;
  status: OpportunityStatus;
  apply_url: string;
  official_url: string | null;
  source: string | null;
  source_platform: string | null;
  tags: string[];
  eligibility: string | null;
  team_size: string | null;
  location: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  stipend: string | null;
  prize: string | null;
  prizes_total: number | null;
  currency: string;
  difficulty: OpportunityDifficulty;
  views: number;
  bookmarks: number;
  applications: number;
  featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  /** Only present in search results */
  relevance_score?: number;
  /** Only present in paginated results */
  total_count?: number;
}

/** Filters used in the explore/browse view */
export interface OpportunityFilters {
  search: string;
  category: OpportunityCategory | 'all';
  mode: OpportunityMode | 'all';
  difficulty: OpportunityDifficulty | 'all';
  country: string | 'all';
  deadline: 'all' | 'week' | 'month' | '3months';
  minPrize: number | null;
  sortBy: 'relevance' | 'deadline' | 'newest' | 'trending' | 'prize';
}

export const DEFAULT_FILTERS: OpportunityFilters = {
  search: '',
  category: 'all',
  mode: 'all',
  difficulty: 'all',
  country: 'all',
  deadline: 'all',
  minPrize: null,
  sortBy: 'deadline',
};

/** User preferences for onboarding & recommendations */
export interface UserPreferences {
  id: string;
  user_id: string;
  college: string | null;
  branch: string | null;
  degree: string | null;
  graduation_year: number | null;
  cgpa: number | null;
  skills: string[];
  interests: string[];
  preferred_roles: string[];
  preferred_companies: string[];
  preferred_cities: string[];
  preferred_categories: OpportunityCategory[];
  career_goals: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/** Platform statistics for the landing page */
export interface PlatformStats {
  total_opportunities: number;
  total_hackathons: number;
  total_internships: number;
  total_contests: number;
  total_scholarships: number;
  total_users: number;
  categories_count: number;
  sources_count: number;
}

/** Category display metadata (icon, label, color) */
export interface CategoryMeta {
  id: OpportunityCategory;
  label: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  gradient: string;
  description: string;
}

export const CATEGORY_META: Record<OpportunityCategory, CategoryMeta> = {
  hackathon: {
    id: 'hackathon',
    label: 'Hackathons',
    icon: 'Rocket',
    color: 'hackathon',
    gradient: 'from-hackathon to-hackathon/70',
    description: 'Build, innovate, and win prizes',
  },
  internship: {
    id: 'internship',
    label: 'Internships',
    icon: 'Briefcase',
    color: 'internship',
    gradient: 'from-internship to-internship/70',
    description: 'Gain real-world experience',
  },
  job: {
    id: 'job',
    label: 'Jobs',
    icon: 'Building2',
    color: 'job',
    gradient: 'from-blue-500 to-blue-400',
    description: 'Full-time career opportunities',
  },
  contest: {
    id: 'contest',
    label: 'Coding Contests',
    icon: 'Zap',
    color: 'contest',
    gradient: 'from-contest to-contest/70',
    description: 'Sharpen your coding skills',
  },
  scholarship: {
    id: 'scholarship',
    label: 'Scholarships',
    icon: 'GraduationCap',
    color: 'scholarship',
    gradient: 'from-amber-500 to-yellow-400',
    description: 'Fund your education',
  },
  fellowship: {
    id: 'fellowship',
    label: 'Fellowships',
    icon: 'Award',
    color: 'fellowship',
    gradient: 'from-purple-500 to-violet-400',
    description: 'Prestigious programs & mentorship',
  },
  open_source: {
    id: 'open_source',
    label: 'Open Source',
    icon: 'GitBranch',
    color: 'opensource',
    gradient: 'from-emerald-500 to-green-400',
    description: 'Contribute to open source projects',
  },
  research: {
    id: 'research',
    label: 'Research',
    icon: 'Microscope',
    color: 'research',
    gradient: 'from-cyan-500 to-teal-400',
    description: 'Academic research opportunities',
  },
  campus_hiring: {
    id: 'campus_hiring',
    label: 'Campus Hiring',
    icon: 'School',
    color: 'campus',
    gradient: 'from-orange-500 to-amber-400',
    description: 'On-campus placement drives',
  },
  competition: {
    id: 'competition',
    label: 'Competitions',
    icon: 'Trophy',
    color: 'competition',
    gradient: 'from-rose-500 to-pink-400',
    description: 'Non-coding competitions',
  },
  grant: {
    id: 'grant',
    label: 'Grants',
    icon: 'Banknote',
    color: 'grant',
    gradient: 'from-lime-500 to-green-400',
    description: 'Funding for projects & startups',
  },
  bootcamp: {
    id: 'bootcamp',
    label: 'Bootcamps',
    icon: 'BookOpen',
    color: 'bootcamp',
    gradient: 'from-indigo-500 to-blue-400',
    description: 'Intensive learning programs',
  },
};

/** Deadline helper — returns days until deadline */
export function getDaysUntilDeadline(deadline: string): number {
  return Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

/** Format deadline for display */
export function formatDeadline(deadline: string): string {
  const days = getDaysUntilDeadline(deadline);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} days left`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
  return new Date(deadline).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Check if deadline is urgent (≤5 days) */
export function isUrgentDeadline(deadline: string): boolean {
  const days = getDaysUntilDeadline(deadline);
  return days >= 0 && days <= 5;
}
