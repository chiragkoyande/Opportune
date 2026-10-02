// ============================================================
// Opportune V4 — Hackathons Explorer Page
// Section 10: Dedicated Hackathon Explorer
// Displays: Organizer, title, mode, location, deadline,
// event date, prize pool, team size, tags, status, bookmark.
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Rocket, SlidersHorizontal, ArrowUpDown, Search, X } from 'lucide-react';
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
import { hackathonsService } from '@/services/hackathons';
import { HackathonFilters, HackathonSortOption } from '@/types/hackathon';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { HackathonFiltersSidebar } from '@/components/hackathons/HackathonFilters';
import { HackathonCardSkeleton } from '@/components/ui/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/ui/StatusStates';
import { useDebounce } from '@/hooks/useDebounce';

export const HackathonsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filters: HackathonFilters = useMemo(() => ({
    query: searchParams.get('q') || searchParams.get('query') || '',
    mode: (searchParams.get('mode') || 'all') as HackathonFilters['mode'],
    status: (searchParams.get('status') || 'all') as HackathonFilters['status'],
    location: searchParams.get('location') || '',
    theme: searchParams.get('theme') || 'all',
    teamSize: searchParams.get('teamSize') ? (searchParams.get('teamSize') === 'all' ? 'all' : Number(searchParams.get('teamSize'))) : 'all',
    sort: (searchParams.get('sort') || 'deadline') as HackathonSortOption,
  }), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.query || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== (filters.query || '')) {
      updateFilters({ query: debouncedSearch });
    }
  }, [debouncedSearch]);

  const updateFilters = (newFilters: Partial<HackathonFilters>) => {
    const next = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (next.query) params.set('q', next.query);
    if (next.mode && next.mode !== 'all') params.set('mode', next.mode);
    if (next.status && next.status !== 'all') params.set('status', next.status);
    if (next.location) params.set('location', next.location);
    if (next.theme && next.theme !== 'all') params.set('theme', next.theme);
    if (next.teamSize && next.teamSize !== 'all') params.set('teamSize', String(next.teamSize));
    if (next.sort && next.sort !== 'deadline') params.set('sort', next.sort);

    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['hackathons', filters],
    queryFn: () => hackathonsService.getHackathons(filters),
  });

  const hackathons = data?.data || [];
  const totalCount = data?.total ?? hackathons.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title="Global Hackathons & Competitions | Opportune"
        description="Discover online and in-person hackathons with verified prize pools, top organizers, and team challenges."
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-hackathon/10 text-hackathon">
              <Rocket className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-hackathon">Developer Challenges</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Explore Hackathons
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compete, invent transformative applications, and win cash prizes from premier industry leaders.
          </p>
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center gap-2.5">
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden h-9 gap-2 text-xs border-border/60">
                <SlidersHorizontal className="h-3.5 w-3.5 text-hackathon" />
                Filters
                {totalCount > 0 && <span className="font-semibold text-hackathon">({totalCount})</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[380px] overflow-y-auto">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-base font-bold">Filter Hackathons</SheetTitle>
              </SheetHeader>
              <HackathonFiltersSidebar
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
              value={filters.sort || 'deadline'}
              onValueChange={(val) => updateFilters({ sort: val as HackathonSortOption })}
            >
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Registration Deadline</SelectItem>
                <SelectItem value="recently-added">Recently Added</SelectItem>
                <SelectItem value="prize">Highest Prize Pool</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
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
          placeholder="Filter by name, organizer or technology (e.g. AI, Web3, Devpost)..."
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="hidden lg:block lg:col-span-1 sticky top-20 rounded-2xl border border-border/60 bg-card p-5 shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
          <HackathonFiltersSidebar
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
            totalCount={totalCount}
          />
        </aside>

        <main className="lg:col-span-3 space-y-4">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HackathonCardSkeleton />
              <HackathonCardSkeleton />
              <HackathonCardSkeleton />
              <HackathonCardSkeleton />
            </div>
          )}

          {isError && (
            <ErrorState
              title="Failed to Load Hackathons"
              message={error instanceof Error ? error.message : 'Please check your connection and retry.'}
              onRetry={refetch}
            />
          )}

          {!isLoading && !isError && hackathons.length === 0 && (
            <EmptyState
              title="No upcoming hackathons found"
              message="Try changing the mode filter or exploring all themes."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          )}

          {!isLoading && !isError && hackathons.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HackathonsPage;
