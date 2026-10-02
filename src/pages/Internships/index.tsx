// ============================================================
// Opportune V4 — Internships Explorer Page
// Section 9: Dedicated Internship Discovery Explorer
// Stipend & Duration highlights, PPO filtering, URL synchronization.
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, SlidersHorizontal, ArrowUpDown, Search, X } from 'lucide-react';
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
import { internshipsService } from '@/services/internships';
import { InternshipFilters, InternshipSortOption } from '@/types/internship';
import { InternshipCard } from '@/components/internships/InternshipCard';
import { InternshipFiltersSidebar } from '@/components/internships/InternshipFilters';
import { InternshipCardSkeleton } from '@/components/ui/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/ui/StatusStates';
import { useDebounce } from '@/hooks/useDebounce';

export const InternshipsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filters: InternshipFilters = useMemo(() => ({
    query: searchParams.get('q') || searchParams.get('query') || '',
    location: searchParams.get('location') || '',
    remoteOnly: searchParams.get('remote') === 'true' || searchParams.get('remoteOnly') === 'true',
    ppoOnly: searchParams.get('ppo') === 'true' || searchParams.get('ppoOnly') === 'true',
    durationMonths: searchParams.get('duration') ? (searchParams.get('duration') === 'all' ? 'all' : Number(searchParams.get('duration'))) : 'all',
    startDate: (searchParams.get('start') || 'all') as InternshipFilters['startDate'],
    skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',') : [],
    sort: (searchParams.get('sort') || 'latest') as InternshipSortOption,
  }), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.query || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== (filters.query || '')) {
      updateFilters({ query: debouncedSearch });
    }
  }, [debouncedSearch]);

  const updateFilters = (newFilters: Partial<InternshipFilters>) => {
    const next = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (next.query) params.set('q', next.query);
    if (next.location) params.set('location', next.location);
    if (next.remoteOnly) params.set('remote', 'true');
    if (next.ppoOnly) params.set('ppo', 'true');
    if (next.durationMonths && next.durationMonths !== 'all') params.set('duration', String(next.durationMonths));
    if (next.startDate && next.startDate !== 'all') params.set('start', next.startDate);
    if (next.skills && next.skills.length > 0) params.set('skills', next.skills.join(','));
    if (next.sort && next.sort !== 'latest') params.set('sort', next.sort);

    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['internships', filters],
    queryFn: () => internshipsService.getInternships(filters),
  });

  const internships = data?.data || [];
  const totalCount = data?.total ?? internships.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title="Engineering Internships & PPOs | Opportune"
        description="Find verified software engineering internships with transparent monthly stipends and PPO potential."
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-internship/10 text-internship">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-internship">Early Career & Students</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Discover Tech Internships
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Summer internships, 6-month co-ops, and pre-placement offer opportunities.
          </p>
        </div>

        {/* Sort and Mobile Filters */}
        <div className="flex items-center gap-2.5">
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden h-9 gap-2 text-xs border-border/60">
                <SlidersHorizontal className="h-3.5 w-3.5 text-internship" />
                Filters
                {totalCount > 0 && <span className="font-semibold text-internship">({totalCount})</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[380px] overflow-y-auto">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-base font-bold">Filter Internships</SheetTitle>
              </SheetHeader>
              <InternshipFiltersSidebar
                filters={filters}
                onFilterChange={updateFilters}
                onReset={resetFilters}
                totalCount={totalCount}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <Select
              value={filters.sort || 'latest'}
              onValueChange={(val) => updateFilters({ sort: val as InternshipSortOption })}
            >
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="stipend">Highest Stipend</SelectItem>
                <SelectItem value="deadline">Application Deadline</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter by role, company or skills (e.g. Summer 2027, Python, Google)..."
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

      {/* Main Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="hidden lg:block lg:col-span-1 sticky top-20 rounded-2xl border border-border/60 bg-card p-5 shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
          <InternshipFiltersSidebar
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
            totalCount={totalCount}
          />
        </aside>

        <main className="lg:col-span-3 space-y-4">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InternshipCardSkeleton />
              <InternshipCardSkeleton />
              <InternshipCardSkeleton />
              <InternshipCardSkeleton />
            </div>
          )}

          {isError && (
            <ErrorState
              title="Failed to Load Internships"
              message={error instanceof Error ? error.message : 'Please check your connection and retry.'}
              onRetry={refetch}
            />
          )}

          {!isLoading && !isError && internships.length === 0 && (
            <EmptyState
              title="No internships match your filters"
              message="Try clearing your selected duration or location criteria."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          )}

          {!isLoading && !isError && internships.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {internships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InternshipsPage;
