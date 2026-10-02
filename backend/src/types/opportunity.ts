// ============================================================
// OPPORTUNE V4 — Shared Opportunity Domain Types
// Strictly isolated metadata across Jobs, Internships, Hackathons & Contests
// ============================================================

export type OpportunityCategory = 'jobs' | 'internships' | 'hackathons' | 'contests';

// --- Companies ---
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
  size?: string;
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

// --- Jobs ---
export type JobEmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance';
export type JobWorkplaceType = 'remote' | 'hybrid' | 'onsite';
export type JobSeniority = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

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

// --- Internships ---
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
  unit: 'weeks' | 'months';
  formatted: string;
}

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
  startDate: string;
  isImmediate?: boolean;
  applicationDeadline?: string;
  skills: string[];
  description: string;
  perks?: string[];
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

// --- Hackathons ---
export type HackathonMode = 'online' | 'offline' | 'hybrid';
export type HackathonStatus = 'upcoming' | 'open' | 'closing-soon' | 'closed' | 'in-progress' | 'ended';

export interface HackathonPrizeItem {
  title: string;
  amount: number;
  currency: string;
  description?: string;
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
  formatted: string;
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
    formatted: string;
    prizes?: HackathonPrizeItem[];
  };
  teamSize: HackathonTeamSize;
  eligibility: string;
  themes: string[];
  technologies: string[];
  tags: string[];
  description: string;
  rules?: string[];
  timeline?: Array<{ title: string; date: string; description?: string; completed?: boolean }>;
  sponsors?: Array<{ name: string; logoUrl?: string; tier: string; websiteUrl?: string }>;
  faqs?: Array<{ question: string; answer: string }>;
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

// --- Coding Contests ---
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

export interface Contest {
  id: string;
  slug: string;
  name: string;
  platform: ContestPlatform;
  organizer?: string;
  platformLogoUrl?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  durationFormatted: string;
  ratingType: 'Rated' | 'Unrated' | 'Div 1' | 'Div 2' | 'Div 3' | 'Div 4' | 'Educational';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
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

// --- Bookmarks & Applications ---
export interface Bookmark {
  id: string;
  userId: string;
  category: OpportunityCategory;
  targetId: string;
  targetSlug: string;
  title: string;
  organization: string;
  logoUrl: string | null;
  location?: string;
  meta: Record<string, unknown>;
  collectionId?: string;
  savedAt: string;
}

export interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  category?: OpportunityCategory | 'all';
  bookmarksCount: number;
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  opportunityId: string;
  opportunityType: 'job' | 'internship';
  opportunityTitle: string;
  opportunitySlug: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  workplaceType?: string;
  status: 'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  updatedAt: string;
  interviewDate?: string | null;
  compensation?: string | null;
  notes?: Array<{ id: string; createdAt: string; content: string }>;
  timeline?: Array<{ status: string; timestamp: string; note?: string }>;
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
  experiences: Array<{ id: string; role: string; company: string; startDate: string; endDate?: string; isCurrent?: boolean; description?: string }>;
  education: Array<{ id: string; degree: string; fieldOfStudy: string; institution: string; startYear: number; endYear: number }>;
  preferences: {
    opportunityCategories: OpportunityCategory[];
    preferredLocations: string[];
    preferredJobTypes: string[];
    preferredTechnologies: string[];
    workplacePreference: ('remote' | 'hybrid' | 'onsite')[];
    emailAlerts: boolean;
    weeklyDigest: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: string;
  updatedAt: string;
}
