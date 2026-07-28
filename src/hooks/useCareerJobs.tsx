import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  CareerFilters,
  CareerJob,
  Company,
  DEFAULT_CAREER_FILTERS,
  getExperienceLabel,
  getSalaryNumber,
  isHybridJob,
  isRemoteJob,
} from '@/types/career';
import { Tables } from '@/integrations/supabase/types';

const PAGE_SIZE = 18;

type JobRow = Tables<'jobs'>;
type CompanyRow = Tables<'companies'>;

function mapCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    domain: row.domain,
    website_url: row.website_url,
    careers_url: row.careers_url,
    ats_platform: row.ats_platform,
    sync_status: row.sync_status,
    tags: row.tags ?? [],
    last_successful_sync_at: row.last_successful_sync_at,
  };
}

function mapJob(row: JobRow, company: Company | null): CareerJob {
  return {
    id: row.id,
    company_id: row.company_id,
    external_id: row.external_id,
    title: row.title,
    description: row.description,
    department: row.department,
    team: row.team,
    location: row.location,
    country: row.country,
    city: row.city,
    employment_type: row.employment_type,
    workplace_type: row.workplace_type,
    seniority: row.seniority,
    category: row.category,
    status: row.status,
    apply_url: row.apply_url,
    source_url: row.source_url,
    source_platform: row.source_platform,
    posted_at: row.posted_at,
    last_seen_at: row.last_seen_at,
    raw_data: row.raw_data,
    company,
  };
}

async function loadCompaniesById(companyIds: string[]): Promise<Map<string, Company>> {
  const uniqueIds = Array.from(new Set(companyIds));
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .in('id', uniqueIds);

  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.id, mapCompany(row)]));
}

function applyClientFilters(jobs: CareerJob[], filters: CareerFilters): CareerJob[] {
  return jobs.filter((job) => {
    if (filters.workMode === 'remote' && !isRemoteJob(job)) return false;
    if (filters.workMode === 'hybrid' && !isHybridJob(job)) return false;
    if (filters.workMode === 'onsite' && (isRemoteJob(job) || isHybridJob(job))) return false;
    if (filters.industry !== 'all' && !job.company?.tags.some((tag) => tag.toLowerCase() === filters.industry.toLowerCase())) return false;
    if (filters.jobType === 'internship' && job.category !== 'internship') return false;
    if (filters.jobType === 'full-time' && job.category === 'internship') return false;
    if (filters.salaryMin !== null) {
      const salary = getSalaryNumber(job);
      if (salary === null || salary < filters.salaryMin) return false;
    }
    if (filters.experience !== 'all' && filters.experience !== 'internship') {
      const label = getExperienceLabel(job);
      if (filters.experience === 'entry' && label !== '0-2 yrs') return false;
      if (filters.experience === 'mid' && label !== '2+ yrs' && label !== '4+ yrs') return false;
      if (filters.experience === 'senior' && label !== '5+ yrs') return false;
    }
    return true;
  });
}

export function useCareerJobs(filterOverrides: Partial<CareerFilters> = {}) {
  const filters = { ...DEFAULT_CAREER_FILTERS, ...filterOverrides };

  return useInfiniteQuery({
    queryKey: ['career-jobs', filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('status', 'open')
        .range(from, to);

      if (filters.companyId !== 'all') query = query.eq('company_id', filters.companyId);
      if (filters.location !== 'all') query = query.ilike('location', `%${filters.location}%`);
      if (filters.experience === 'internship') query = query.eq('category', 'internship');
      if (filters.query) {
        const term = filters.query.replaceAll(',', ' ');
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,department.ilike.%${term}%,location.ilike.%${term}%`);
      }

      if (filters.sort === 'newest' || filters.sort === 'relevance') {
        query = query.order('posted_at', { ascending: false, nullsFirst: false });
      } else if (filters.sort === 'company') {
        query = query.order('company_id', { ascending: true });
      } else {
        query = query.order('updated_at', { ascending: false });
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const companyMap = await loadCompaniesById((data ?? []).map((job) => job.company_id));
      const jobs = applyClientFilters(
        (data ?? []).map((job) => mapJob(job, companyMap.get(job.company_id) ?? null)),
        filters,
      );

      return {
        jobs,
        totalCount: count ?? jobs.length,
        nextPage: jobs.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

export function useCareerCompanies(query = '') {
  return useQuery({
    queryKey: ['career-companies', query],
    queryFn: async () => {
      let request = supabase
        .from('companies')
        .select('*')
        .in('sync_status', ['active', 'pending'])
        .order('name', { ascending: true })
        .limit(80);

      if (query) {
        request = request.or(`name.ilike.%${query}%,domain.ilike.%${query}%`);
      }

      const { data, error } = await request;
      if (error) throw error;
      return (data ?? []).map(mapCompany);
    },
  });
}

export function useCareerJob(id: string | undefined) {
  return useQuery({
    queryKey: ['career-job', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id ?? '')
        .single();

      if (error) throw error;

      const companyMap = await loadCompaniesById([job.company_id]);
      return mapJob(job, companyMap.get(job.company_id) ?? null);
    },
  });
}

export function useCompanyProfile(slug: string | undefined) {
  return useQuery({
    queryKey: ['career-company-profile', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug ?? '')
        .single();

      if (error) throw error;

      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id)
        .eq('status', 'open')
        .order('posted_at', { ascending: false, nullsFirst: false })
        .limit(24);

      if (jobsError) throw jobsError;

      const mappedCompany = mapCompany(company);
      return {
        company: mappedCompany,
        jobs: (jobs ?? []).map((job) => mapJob(job, mappedCompany)),
      };
    },
  });
}
