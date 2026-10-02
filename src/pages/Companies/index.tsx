// ============================================================
// Opportune V4 — Companies Directory Page
// Section 14: Comprehensive Organization Directory
// Filter by industry, open jobs, internships, or hosted hackathons.
// ============================================================

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Search, SlidersHorizontal, ArrowUpDown, X, Briefcase, GraduationCap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SEO } from '@/lib/seo';
import { companiesService } from '@/services/companies';
import { CompanyFilters } from '@/types/company';
import { CompanyCard } from '@/components/companies/CompanyCard';
import { CompanyCardSkeleton } from '@/components/ui/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/ui/StatusStates';
import { useDebounce } from '@/hooks/useDebounce';

export const CompaniesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: CompanyFilters = useMemo(() => ({
    query: searchParams.get('q') || searchParams.get('query') || '',
    industry: searchParams.get('industry') || 'all',
    hasJobs: searchParams.get('jobs') === 'true',
    hasInternships: searchParams.get('internships') === 'true',
    hasHackathons: searchParams.get('hackathons') === 'true',
    sort: (searchParams.get('sort') || 'opportunities') as CompanyFilters['sort'],
  }), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.query || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  React.useEffect(() => {
    if (debouncedSearch !== (filters.query || '')) {
      updateFilters({ query: debouncedSearch });
    }
  }, [debouncedSearch]);

  const updateFilters = (newFilters: Partial<CompanyFilters>) => {
    const next = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (next.query) params.set('q', next.query);
    if (next.industry && next.industry !== 'all') params.set('industry', next.industry);
    if (next.hasJobs) params.set('jobs', 'true');
    if (next.hasInternships) params.set('internships', 'true');
    if (next.hasHackathons) params.set('hackathons', 'true');
    if (next.sort && next.sort !== 'opportunities') params.set('sort', next.sort);

    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['companies', filters],
    queryFn: () => companiesService.getCompanies(filters),
  });

  const companies = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title="Tech Company Directory | Opportune"
        description="Explore top technology companies, startups, and enterprises hiring engineers and organizing hackathons."
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ecosystem</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Tech Companies & Organizers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Discover organizations hiring for engineering roles, offering internships, and running student hackathons.
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
          <Select
            value={filters.sort || 'opportunities'}
            onValueChange={(val) => updateFilters({ sort: val as CompanyFilters['sort'] })}
          >
            <SelectTrigger className="h-9 w-[170px] text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opportunities">Most Opportunities</SelectItem>
              <SelectItem value="name">Company Name</SelectItem>
              <SelectItem value="recently-active">Recently Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search & Quick Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search companies by name or industry (e.g. Stripe, FinTech, AI)..."
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

        {/* Checkbox pills */}
        <div className="flex items-center justify-start sm:justify-end gap-3 flex-wrap text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer bg-card px-3 py-2 rounded-xl border border-border/60">
            <Checkbox
              checked={filters.hasJobs}
              onCheckedChange={(checked) => updateFilters({ hasJobs: Boolean(checked) })}
            />
            <span className="flex items-center gap-1 text-job font-semibold">
              <Briefcase className="h-3 w-3" />
              With Jobs
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer bg-card px-3 py-2 rounded-xl border border-border/60">
            <Checkbox
              checked={filters.hasInternships}
              onCheckedChange={(checked) => updateFilters({ hasInternships: Boolean(checked) })}
            />
            <span className="flex items-center gap-1 text-internship font-semibold">
              <GraduationCap className="h-3 w-3" />
              With Internships
            </span>
          </label>
        </div>
      </div>

      {/* Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CompanyCardSkeleton />
          <CompanyCardSkeleton />
          <CompanyCardSkeleton />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to Load Companies"
          message={error instanceof Error ? error.message : 'Please check your connection and retry.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && companies.length === 0 && (
        <EmptyState
          title="No companies match your filters"
          message="Try resetting your keyword search or opportunity category filters."
          actionLabel="Reset Filters"
          onAction={resetFilters}
        />
      )}

      {!isLoading && !isError && companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
