// ============================================================
// Opportune V4 — User, Profile, Settings & Bookmark Types
// ============================================================

export type OpportunityCategoryKey = 'jobs' | 'internships' | 'hackathons' | 'contests';

export interface UserExperience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface UserEducation {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startYear: number;
  endYear: number;
  grade?: string;
}

export interface UserPreferences {
  opportunityCategories: OpportunityCategoryKey[];
  preferredLocations: string[];
  preferredJobTypes: string[];
  preferredTechnologies: string[];
  workplacePreference: ('remote' | 'hybrid' | 'onsite')[];
  emailAlerts: boolean;
  weeklyDigest: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  skills: string[];
  experiences: UserExperience[];
  education: UserEducation[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  category: OpportunityCategoryKey;
  targetId: string;
  targetSlug: string;
  title: string;
  organization: string;
  logoUrl: string | null;
  location?: string;
  meta: Record<string, unknown>; // e.g. salary, stipend, prize, or start time
  collectionId?: string;
  savedAt: string;
}

export interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: OpportunityCategoryKey | 'all';
  bookmarksCount: number;
  createdAt: string;
}
