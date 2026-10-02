// ============================================================
// Opportune V4 — Jobs Explorer Page
// Section 8: Premium Job Explorer
// Sticky desktop sidebar, mobile filter drawer, URL state synchronization,
// TanStack Query integration, rich JobCards.
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, SlidersHorizontal, ArrowUpDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SEO } from '@/lib/seo';
import { jobsService } from '@/services/jobs';
import { JobFilters, JobSortOption, DEFAULT_JOB_FILTERS } from '@/types/job';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFiltersSidebar } from '@/components/jobs/JobFilters';
import { JobCardSkeleton } from '@/components/ui/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/ui/StatusStates';
import { useDebounce } from '@/hooks/useDebounce';

export const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract filter parameters from URL
  const filters: JobFilters = useMemo(() => ({
    query: searchParams.get('q') || searchParams.get('query') || '',
    location: searchParams.get('location') || '',
    remoteOnly: searchParams.get('remote') === 'true' || searchParams.get('remoteOnly') === 'true',
    employmentType: (searchParams.get('type') || searchParams.get('employmentType') || 'all') as JobFilters['employmentType'],
    workplaceType: (searchParams.get('mode') || searchParams.get('workplaceType') || 'all') as JobFilters['workplaceType'],
    seniority: (searchParams.get('seniority') || searchParams.get('experience') || 'all') as JobFilters['seniority'],
    skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',') : [],
    postedWithin: (searchParams.get('posted') || 'all') as JobFilters['postedWithin'],
    sort: (searchParams.get('sort') || 'latest') as JobSortOption,
  }), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.query || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Synchronize debounced search input with URL
  useEffect(() => {
    if (debouncedSearch !== (filters.query || '')) {
      updateFilters({ query: debouncedSearch });
    }
  }, [debouncedSearch]);

  const updateFilters = (newFilters: Partial<JobFilters>) => {
    const next = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (next.query) params.set('q', next.query);
    if (next.location) params.set('location', next.location);
    if (next.remoteOnly) params.set('remote', 'true');
    if (next.employmentType && next.employmentType !== 'all') params.set('type', next.employmentType);
    if (next.workplaceType && next.workplaceType !== 'all') params.set('mode', next.workplaceType);
    if (next.seniority && next.seniority !== 'all') params.set('seniority', next.seniority);
    if (next.skills && next.skills.length > 0) params.set('skills', next.skills.join(','));
    if (next.postedWithin && next.postedWithin !== 'all') params.set('posted', next.postedWithin);
    if (next.sort && next.sort !== 'latest') params.set('sort', next.sort);

    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  // TanStack Query for jobs
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsService.getJobs(filters),
  });

  const jobs = data?.data || [];
  const totalCount = data?.total ?? jobs.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title="Software Engineering Jobs | Opportune"
        description="Discover full-time and remote software engineering jobs at top tech firms and high-growth startups."
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-job/10 text-job">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-job">Career Opportunities</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Explore Tech Jobs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Verified full-time engineering and product positions from top technology companies.
          </p>
        </div>

        {/* Sort and Mobile Filter Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Filter Sheet Trigger */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden h-9 gap-2 text-xs border-border/60">
                <SlidersHorizontal className="h-3.5 w-3.5 text-job" />
                Filters
                {totalCount > 0 && <span className="font-semibold text-job">({totalCount})</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[380px] overflow-y-auto">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-base font-bold">Filter Jobs</SheetTitle>
              </SheetHeader>
              <JobFiltersSidebar
                filters={filters}
                onFilterChange={(f) => {
                  updateFilters(f);
                }}
                onReset={resetFilters}
                totalCount={totalCount}
              />
            </SheetContent>
          </Sheet>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <Select
              value={filters.sort || 'latest'}
              onValueChange={(val) => updateFilters({ sort: val as JobSortOption })}
            >
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="salary">Salary (High to Low)</SelectItem>
                <SelectItem value="recently-updated">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter by title, company, or tech stack (e.g. React, Python, Stripe)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-9 h-11 text-xs sm:text-sm bg-card border-border/80 rounded-xl"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              updateFilters({ query: '' });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Layout: Sticky Sidebar + Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sticky Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-20 rounded-2xl border border-border/60 bg-card p-5 shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
          <JobFiltersSidebar
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
            totalCount={totalCount}
          />
        </aside>

        {/* Job Listings Column */}
        <main className="lg:col-span-3 space-y-4">
          {/* Active Filter Tags */}
          {(filters.location || filters.remoteOnly || (filters.employmentType && filters.employmentType !== 'all') || (filters.skills && filters.skills.length > 0)) && (
            <div className="flex flex-wrap items-center gap-1.5 pb-2">
              <span className="text-[11px] text-muted-foreground mr-1">Active:</span>
              {filters.remoteOnly && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-job/10 text-job border border-job/20">
                  Remote Only
                  <button onClick={() => updateFilters({ remoteOnly: false })} className="hover:text-foreground">
                    ×
                  </button>
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-secondary text-secondary-foreground border border-border/50">
                  Location: {filters.location}
                  <button onClick={() => updateFilters({ location: '' })} className="hover:text-foreground">
                    ×
                  </button>
                </span>
              )}
              {filters.skills?.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-secondary text-secondary-foreground border border-border/50">
                  {skill}
                  <button
                    onClick={() =>
                      updateFilters({ skills: filters.skills?.filter((s) => s !== skill) })
                    }
                    className="hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 text-[10px] text-muted-foreground px-2">
                Clear all
              </Button>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          )}

          {/* Error State */}
          {isError && (
            <ErrorState
              title="Failed to Load Jobs"
              message={error instanceof Error ? error.message : 'Please check your connection and retry.'}
              onRetry={refetch}
            />
          )}

          {/* Empty State */}
          {!isLoading && !isError && jobs.length === 0 && (
            <EmptyState
              title="No jobs match your filters"
              message="Try broadening your search, removing location constraints, or clearing selected skills."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          )}

          {/* Jobs Grid */}
          {!isLoading && !isError && jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobsPage;
