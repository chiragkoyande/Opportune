// ============================================================
// Opportune V4 — Coding Contest Types
// Dedicated types for Coding Contests
// ============================================================

export type ContestPlatform =
  | 'CodeChef'
  | 'Codeforces'
  | 'LeetCode'
  | 'AtCoder'
  | 'HackerRank'
  | 'GeeksforGeeks'
  | 'Kaggle'
  | 'TopCoder'
  | 'Other';

export type ContestStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export type ContestDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'all-levels';

export type ContestSortOption = 'start-time' | 'duration' | 'participants' | 'platform';

export interface Contest {
  id: string;
  slug: string;
  name: string;
  platform: ContestPlatform;
  organizer?: string;
  platformLogoUrl?: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  durationMinutes: number;
  durationFormatted: string; // e.g. "2 hours" or "2h 30m"
  ratingType: 'Rated' | 'Unrated' | 'Div 1' | 'Div 2' | 'Div 3' | 'Div 4' | 'Educational';
  difficulty?: ContestDifficulty;
  participantsCount?: number;
  status: ContestStatus;
  eligibility?: string;
  officialUrl: string;
  description?: string;
  problemCount?: number;
  languagesAllowed?: string[];
  prizes?: string;
  isBookmarked?: boolean;
}

export interface ContestFilters {
  query?: string;
  platform?: ContestPlatform | 'all';
  status?: ContestStatus | 'all';
  difficulty?: ContestDifficulty | 'all';
  ratingType?: string | 'all';
  timeframe?: 'today' | 'this-week' | 'this-month' | 'past' | 'all';
  sort?: ContestSortOption;
}

export const DEFAULT_CONTEST_FILTERS: ContestFilters = {
  query: '',
  platform: 'all',
  status: 'UPCOMING',
  difficulty: 'all',
  ratingType: 'all',
  timeframe: 'all',
  sort: 'start-time',
};
