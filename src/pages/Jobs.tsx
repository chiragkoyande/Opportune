import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Building2,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobCard, JobCardSkeleton } from '@/components/careers/JobCard';
import { useCareerCompanies, useCareerJobs } from '@/hooks/useCareerJobs';
import { useJobBookmarks } from '@/hooks/useJobBookmarks';
import {
  CAREER_SEARCH_SUGGESTIONS,
  CareerFilters,
  CareerViewMode,
  DEFAULT_CAREER_FILTERS,
  POPULAR_SKILLS,
} from '@/types/career';

const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'Any experience' },
  { value: 'internship', label: 'Internship' },
  { value: 'entry', label: 'Entry level' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
];

const WORK_MODE_OPTIONS = [
  { value: 'all', label: 'Any mode' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const JOB_TYPE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'internship', label: 'Internships' },
  { value: 'full-time', label: 'Full-time' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'relevance', label: 'Relevant' },
  { value: 'company', label: 'Company' },
  { value: 'salary', label: 'Salary' },
];

const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'Any industry' },
  { value: 'AI', label: 'AI' },
  { value: 'FinTech', label: 'FinTech' },
  { value: 'SaaS', label: 'SaaS' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
];

const SALARY_OPTIONS = [
  { value: 'all', label: 'Any salary' },
  { value: '300000', label: '3 LPA+' },
  { value: '600000', label: '6 LPA+' },
  { value: '1200000', label: '12 LPA+' },
  { value: '2000000', label: '20 LPA+' },
];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<CareerViewMode>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CareerFilters>(() => ({
    ...DEFAULT_CAREER_FILTERS,
    query: searchParams.get('q') ?? '',
    companyId: searchParams.get('company') ?? 'all',
    location: searchParams.get('location') ?? 'all',
  }));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const jobsQuery = useCareerJobs(filters);
  const companiesQuery = useCareerCompanies('');
  const bookmarks = useJobBookmarks();
  const jobs = useMemo(() => jobsQuery.data?.pages.flatMap((page) => page.jobs) ?? [], [jobsQuery.data]);
  const totalCount = jobsQuery.data?.pages[0]?.totalCount ?? 0;

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.companyId !== 'all') params.set('company', filters.companyId);
    if (filters.location !== 'all') params.set('location', filters.location);
    setSearchParams(params, { replace: true });
  }, [filters.companyId, filters.location, filters.query, setSearchParams]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && jobsQuery.hasNextPage && !jobsQuery.isFetchingNextPage) {
        void jobsQuery.fetchNextPage();
      }
    }, { rootMargin: '700px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [jobsQuery]);

  const updateFilter = <K extends keyof CareerFilters>(key: K, value: CareerFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFilters((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
      query: current.skills.includes(skill) ? current.query : `${current.query} ${skill}`.trim(),
    }));
  };

  const activeFilters = [
    filters.companyId !== 'all',
    filters.location !== 'all',
    filters.experience !== 'all',
    filters.workMode !== 'all',
    filters.jobType !== 'all',
    filters.industry !== 'all',
    filters.salaryMin !== null,
    filters.skills.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-8">
        <section className="mb-6 rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <BriefcaseBusiness className="h-4 w-4" />
                Career Explorer
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Discover verified jobs and internships
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {jobsQuery.isLoading ? 'Loading roles from Supabase...' : `${totalCount} roles from official company career pages`}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-lg">
              <Link to="/companies">
                <Building2 className="mr-2 h-4 w-4" />
                Browse Companies
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.query}
                onChange={(event) => updateFilter('query', event.target.value)}
                placeholder="Search Google Internship, Remote React, AI Engineer..."
                className="h-12 w-full rounded-lg border border-border/60 bg-background pl-11 pr-10 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
              {filters.query && (
                <button
                  onClick={() => updateFilter('query', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value as CareerFilters['sort'])}>
              <SelectTrigger className="h-12 rounded-lg border-border/60 bg-background lg:w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" className="h-12 rounded-lg lg:hidden" onClick={() => setFiltersOpen((open) => !open)}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilters > 0 && <Badge className="ml-2 h-5 min-w-5 rounded-full px-1">{activeFilters}</Badge>}
              </Button>
              <div className="flex h-12 rounded-lg border border-border/60 bg-background p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md px-3 ${viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md px-3 ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {CAREER_SEARCH_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => updateFilter('query', suggestion)}
                className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-20 rounded-lg border border-border/60 bg-card/95 p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Filter className="h-4 w-4" />
                  Filters
                </h2>
                <button
                  onClick={() => setFilters(DEFAULT_CAREER_FILTERS)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-5">
                <FilterBlock label="Company">
                  <Select value={filters.companyId} onValueChange={(value) => updateFilter('companyId', value)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Any company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any company</SelectItem>
                      {(companiesQuery.data ?? []).map((company) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterBlock>

                <FilterBlock label="Industry">
                  <Select value={filters.industry} onValueChange={(value) => updateFilter('industry', value)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Any industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterBlock>

                <FilterBlock label="Location">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={filters.location === 'all' ? '' : filters.location}
                      onChange={(event) => updateFilter('location', event.target.value || 'all')}
                      placeholder="Bengaluru, Remote..."
                      className="h-10 w-full rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary/40"
                    />
                  </div>
                </FilterBlock>

                <FilterBlock label="Experience">
                  <Segmented
                    value={filters.experience}
                    options={EXPERIENCE_OPTIONS}
                    onChange={(value) => updateFilter('experience', value as CareerFilters['experience'])}
                  />
                </FilterBlock>

                <FilterBlock label="Work mode">
                  <Segmented
                    value={filters.workMode}
                    options={WORK_MODE_OPTIONS}
                    onChange={(value) => updateFilter('workMode', value as CareerFilters['workMode'])}
                  />
                </FilterBlock>

                <FilterBlock label="Role type">
                  <Segmented
                    value={filters.jobType}
                    options={JOB_TYPE_OPTIONS}
                    onChange={(value) => updateFilter('jobType', value as CareerFilters['jobType'])}
                  />
                </FilterBlock>

                <FilterBlock label="Salary">
                  <Select
                    value={filters.salaryMin === null ? 'all' : String(filters.salaryMin)}
                    onValueChange={(value) => updateFilter('salaryMin', value === 'all' ? null : Number(value))}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Any salary" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALARY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterBlock>

                <FilterBlock label="Skills">
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                          filters.skills.includes(skill)
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : 'border-border/60 bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </FilterBlock>
              </div>
            </div>
          </aside>

          <section>
            {jobsQuery.isError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
                Unable to load jobs. Make sure the Phase 1 migration is applied and Supabase RLS permits public open-job reads.
              </div>
            )}

            <div className={viewMode === 'grid' ? 'grid gap-4 xl:grid-cols-2' : 'space-y-4'}>
              {jobsQuery.isLoading
                ? Array.from({ length: 6 }).map((_, index) => <JobCardSkeleton key={index} />)
                : jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    viewMode={viewMode}
                    saved={bookmarks.isBookmarked(job.id)}
                    onToggleSave={(item) => bookmarks.toggleBookmark(item.id, item.title)}
                  />
                ))}
            </div>

            {!jobsQuery.isLoading && jobs.length === 0 && !jobsQuery.isError && (
              <div className="rounded-lg border border-border/60 bg-card/95 p-10 text-center">
                <h2 className="text-lg font-semibold text-foreground">No roles found</h2>
                <p className="mt-1 text-sm text-muted-foreground">Try a broader search or remove a few filters.</p>
              </div>
            )}

            <div ref={sentinelRef} className="flex h-24 items-center justify-center">
              {jobsQuery.isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FilterBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-2 text-left text-sm transition ${
            value === option.value ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
