import { Json } from '@/integrations/supabase/types';

export type CareerViewMode = 'grid' | 'list';
export type CareerSort = 'relevance' | 'newest' | 'company' | 'salary';
export type ExperienceFilter = 'all' | 'internship' | 'entry' | 'mid' | 'senior';
export type WorkModeFilter = 'all' | 'remote' | 'hybrid' | 'onsite';
export type JobTypeFilter = 'all' | 'internship' | 'full-time';

export interface Company {
  id: string;
  name: string;
  slug: string;
  domain: string;
  website_url: string;
  careers_url: string | null;
  ats_platform: string | null;
  sync_status: string;
  tags: string[];
  last_successful_sync_at: string | null;
}

export interface CareerJob {
  id: string;
  company_id: string;
  external_id: string;
  title: string;
  description: string | null;
  department: string | null;
  team: string | null;
  location: string | null;
  country: string | null;
  city: string | null;
  employment_type: string | null;
  workplace_type: string | null;
  seniority: string | null;
  category: string;
  status: string;
  apply_url: string;
  source_url: string | null;
  source_platform: string;
  posted_at: string | null;
  last_seen_at: string;
  raw_data: Json;
  company: Company | null;
}

export interface CareerFilters {
  query: string;
  companyId: string;
  industry: string;
  experience: ExperienceFilter;
  workMode: WorkModeFilter;
  jobType: JobTypeFilter;
  salaryMin: number | null;
  skills: string[];
  location: string;
  sort: CareerSort;
}

export const DEFAULT_CAREER_FILTERS: CareerFilters = {
  query: '',
  companyId: 'all',
  industry: 'all',
  experience: 'all',
  workMode: 'all',
  jobType: 'all',
  salaryMin: null,
  skills: [],
  location: 'all',
  sort: 'newest',
};

export const CAREER_SEARCH_SUGGESTIONS = [
  'Google Internship',
  'Remote React',
  'AI Engineer',
  'Cybersecurity',
  'Data Science',
];

export const POPULAR_SKILLS = [
  'React',
  'TypeScript',
  'Python',
  'AI',
  'Data Science',
  'Cybersecurity',
  'SQL',
  'Cloud',
];

export function getCompanyLogoUrl(company: Company | null): string | null {
  if (!company?.domain) return null;
  return `https://logo.clearbit.com/${company.domain}`;
}

export function getPostedTime(value: string | null): string {
  if (!value) return 'Recently posted';
  const diffMs = Date.now() - new Date(value).getTime();
  const days = Math.max(0, Math.floor(diffMs / 86_400_000));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export function getExperienceLabel(job: CareerJob): string {
  const text = `${job.seniority ?? ''} ${job.title} ${job.raw_data ? JSON.stringify(job.raw_data) : ''}`.toLowerCase();
  if (job.category === 'internship' || text.includes('intern')) return 'Internship';
  if (text.includes('senior') || text.includes('staff') || text.includes('principal')) return '5+ yrs';
  if (text.includes('lead') || text.includes('manager')) return '4+ yrs';
  if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) return '0-2 yrs';
  return '2+ yrs';
}

export function getSalaryLabel(job: CareerJob): string {
  const raw = job.raw_data;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const record = raw as Record<string, Json | undefined>;
    const salary = record.salary ?? record.compensation ?? record.pay;
    if (typeof salary === 'string' && salary.trim()) return salary;
  }
  return job.category === 'internship' ? 'Stipend disclosed later' : 'Salary undisclosed';
}

export function getSalaryNumber(job: CareerJob): number | null {
  const label = getSalaryLabel(job).replace(/,/g, '');
  const lpaMatch = label.match(/(\d+(?:\.\d+)?)\s*lpa/i);
  if (lpaMatch) return Number(lpaMatch[1]) * 100_000;

  const yearlyMatch = label.match(/(?:₹|rs\.?|\$)?\s*(\d{5,8})/i);
  return yearlyMatch ? Number(yearlyMatch[1]) : null;
}

export function getSkillTags(job: CareerJob): string[] {
  const text = `${job.title} ${job.description ?? ''} ${job.department ?? ''}`.toLowerCase();
  return POPULAR_SKILLS.filter((skill) => text.includes(skill.toLowerCase())).slice(0, 5);
}

export function isRemoteJob(job: CareerJob): boolean {
  const text = `${job.workplace_type ?? ''} ${job.location ?? ''} ${job.title}`.toLowerCase();
  return text.includes('remote');
}

export function isHybridJob(job: CareerJob): boolean {
  const text = `${job.workplace_type ?? ''} ${job.location ?? ''}`.toLowerCase();
  return text.includes('hybrid');
}
