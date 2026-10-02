// ============================================================
// Opportune V4 — Coding Contests Explorer Page
// Section 12: Competitive Programming & Contests Interface
// Platform badges, live countdowns, rating type filters.
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, SlidersHorizontal, ArrowUpDown, Search, X, Terminal, Zap } from 'lucide-react';
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
import { contestsService } from '@/services/contests';
import { ContestFilters, ContestSortOption } from '@/types/contest';
import { ContestCard } from '@/components/contests/ContestCard';
import { ContestFiltersSidebar } from '@/components/contests/ContestFilters';
import { ContestCardSkeleton } from '@/components/ui/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/ui/StatusStates';
import { useDebounce } from '@/hooks/useDebounce';

export const ContestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filters: ContestFilters = useMemo(() => ({
    query: searchParams.get('q') || searchParams.get('query') || '',
    platform: (searchParams.get('platform') || 'all') as ContestFilters['platform'],
    status: (searchParams.get('status') || 'UPCOMING') as ContestFilters['status'],
    difficulty: (searchParams.get('difficulty') || 'all') as ContestFilters['difficulty'],
    sort: (searchParams.get('sort') || 'start-time') as ContestSortOption,
  }), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.query || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== (filters.query || '')) {
      updateFilters({ query: debouncedSearch });
    }
  }, [debouncedSearch]);

  const updateFilters = (newFilters: Partial<ContestFilters>) => {
    const next = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (next.query) params.set('q', next.query);
    if (next.platform && next.platform !== 'all') params.set('platform', next.platform);
    if (next.status && next.status !== 'all') params.set('status', next.status);
    if (next.difficulty && next.difficulty !== 'all') params.set('difficulty', next.difficulty);
    if (next.sort && next.sort !== 'start-time') params.set('sort', next.sort);

    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({ status: 'UPCOMING' }, { replace: true });
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['contests', filters],
    queryFn: () => contestsService.getContests(filters),
  });

  const contests = data?.data || [];
  const totalCount = data?.total ?? contests.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title="Coding Contests & Competitive Programming | Opportune"
        description="Live and upcoming algorithmic coding contests across CodeChef, Codeforces, LeetCode, and AtCoder."
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-contest/10 text-contest">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-contest">Competitive Programming</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Coding Contest Schedule
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track rated rounds, divisions, and algorithmic challenges across major coding platforms.
          </p>
        </div>

        {/* Status Quick Switch Tabs */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden h-9 gap-2 text-xs border-border/60">
                <SlidersHorizontal className="h-3.5 w-3.5 text-contest" />
                Filters
                {totalCount > 0 && <span className="font-semibold text-contest">({totalCount})</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[380px] overflow-y-auto">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-base font-bold">Filter Contests</SheetTitle>
              </SheetHeader>
              <ContestFiltersSidebar
                filters={filters}
                onFilterChange={updateFilters}
                onReset={resetFilters}
                totalCount={totalCount}
              />
            </SheetContent>
          </Sheet>

          {/* Status Buttons */}
          <div className="flex items-center p-1 bg-secondary/50 rounded-xl border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => updateFilters({ status: 'UPCOMING' })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filters.status === 'UPCOMING'
                  ? 'bg-background text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ status: 'LIVE' })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                filters.status === 'LIVE'
                  ? 'bg-emerald-500/20 text-emerald-500 shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Now
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ status: 'COMPLETED' })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filters.status === 'COMPLETED'
                  ? 'bg-background text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter by contest name or platform (e.g. Starters, CodeChef, LeetCode)..."
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
          <ContestFiltersSidebar
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
            totalCount={totalCount}
          />
        </aside>

        <main className="lg:col-span-3 space-y-4">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ContestCardSkeleton />
              <ContestCardSkeleton />
              <ContestCardSkeleton />
              <ContestCardSkeleton />
            </div>
          )}

          {isError && (
            <ErrorState
              title="Failed to Load Contests"
              message={error instanceof Error ? error.message : 'Please check your connection and retry.'}
              onRetry={refetch}
            />
          )}

          {!isLoading && !isError && contests.length === 0 && (
            <EmptyState
              title="No upcoming coding contests found"
              message="Check other platforms or switch status tabs to see recently concluded rounds."
              actionLabel="Reset Contest Filters"
              onAction={resetFilters}
            />
          )}

          {!isLoading && !isError && contests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ContestsPage;
