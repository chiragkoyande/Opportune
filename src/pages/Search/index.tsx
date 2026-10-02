// ============================================================
// Opportune V4 — Unified Search Page
// Section 7 & 17: Multi-category Discovery Interface
// Groups results by Jobs, Internships, Hackathons, Contests, Companies
// ============================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Briefcase,
  GraduationCap,
  Rocket,
  Trophy,
  Building2,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/lib/seo';
import { searchService, SearchCategoryType } from '@/services/search';
import { JobCard } from '@/components/jobs/JobCard';
import { InternshipCard } from '@/components/internships/InternshipCard';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { ContestCard } from '@/components/contests/ContestCard';
import { CompanyCard } from '@/components/companies/CompanyCard';
import {
  JobCardSkeleton,
  InternshipCardSkeleton,
  HackathonCardSkeleton,
  ContestCardSkeleton,
  CompanyCardSkeleton,
} from '@/components/ui/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/ui/StatusStates';
import { useDebounce } from '@/hooks/useDebounce';

const SEARCH_SUGGESTIONS = [
  'React internships in Mumbai',
  'Python jobs for freshers',
  'AI hackathons',
  'Cybersecurity hackathons',
  'CodeChef contests',
  'Stripe engineering',
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || searchParams.get('query') || '';
  const typeParam = (searchParams.get('type') || 'all') as SearchCategoryType;

  const [inputVal, setInputVal] = useState(queryParam);
  const debouncedQuery = useDebounce(inputVal, 300);

  // Sync debounced input with URL query string
  useEffect(() => {
    if (debouncedQuery !== queryParam) {
      const params = new URLSearchParams(searchParams);
      if (debouncedQuery) {
        params.set('q', debouncedQuery);
      } else {
        params.delete('q');
      }
      setSearchParams(params, { replace: true });
    }
  }, [debouncedQuery]);

  const switchTab = (tab: SearchCategoryType) => {
    const params = new URLSearchParams(searchParams);
    if (tab === 'all') {
      params.delete('type');
    } else {
      params.set('type', tab);
    }
    setSearchParams(params, { replace: true });
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['search', queryParam, typeParam],
    queryFn: () => searchService.search(queryParam, typeParam),
    enabled: true,
  });

  const results = data || {
    query: queryParam,
    category: typeParam,
    jobs: [],
    internships: [],
    hackathons: [],
    contests: [],
    companies: [],
    counts: { jobs: 0, internships: 0, hackathons: 0, contests: 0, companies: 0, total: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title={queryParam ? `Search: "${queryParam}" | Opportune` : 'Search Opportunities | Opportune'}
        description="Unified search across software engineering jobs, internships, hackathons, coding contests, and tech companies."
      />

      {/* Main Search Input */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          <Input
            type="text"
            placeholder="Search by job title, skill, organizer, contest, company, or tech stack..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="pl-12 pr-10 h-13 text-sm sm:text-base rounded-2xl bg-card border-border/80 shadow-sm focus-visible:ring-primary/40"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                const params = new URLSearchParams(searchParams);
                params.delete('q');
                setSearchParams(params, { replace: true });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Suggestion Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider flex-shrink-0 mr-1">
            Try:
          </span>
          {SEARCH_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setInputVal(suggestion);
                const params = new URLSearchParams(searchParams);
                params.set('q', suggestion);
                setSearchParams(params);
              }}
              className="px-2.5 py-1 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50 flex-shrink-0 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={typeParam} onValueChange={(val) => switchTab(val as SearchCategoryType)} className="space-y-6">
        <div className="border-b border-border/50 pb-px overflow-x-auto">
          <TabsList className="bg-transparent p-0 gap-2 h-auto">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-xl px-4 py-2 text-xs font-semibold gap-1.5"
            >
              <Layers className="h-3.5 w-3.5" />
              All Results
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                {results.counts.total}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-job/10 data-[state=active]:text-job border border-transparent data-[state=active]:border-job/20 rounded-xl px-4 py-2 text-xs font-semibold gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Jobs
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                {results.counts.jobs}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="internships"
              className="data-[state=active]:bg-internship/10 data-[state=active]:text-internship border border-transparent data-[state=active]:border-internship/20 rounded-xl px-4 py-2 text-xs font-semibold gap-1.5"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Internships
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                {results.counts.internships}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="hackathons"
              className="data-[state=active]:bg-hackathon/10 data-[state=active]:text-hackathon border border-transparent data-[state=active]:border-hackathon/20 rounded-xl px-4 py-2 text-xs font-semibold gap-1.5"
            >
              <Rocket className="h-3.5 w-3.5" />
              Hackathons
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                {results.counts.hackathons}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="contests"
              className="data-[state=active]:bg-contest/10 data-[state=active]:text-contest border border-transparent data-[state=active]:border-contest/20 rounded-xl px-4 py-2 text-xs font-semibold gap-1.5"
            >
              <Trophy className="h-3.5 w-3.5" />
              Contests
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                {results.counts.contests}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="companies"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground border border-transparent rounded-xl px-4 py-2 text-xs font-semibold gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" />
              Companies
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                {results.counts.companies}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <JobCardSkeleton />
            <InternshipCardSkeleton />
            <HackathonCardSkeleton />
            <ContestCardSkeleton />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <ErrorState
            title="Search Request Failed"
            message={error instanceof Error ? error.message : 'Please check your connection and retry.'}
            onRetry={refetch}
          />
        )}

        {/* Empty state */}
        {!isLoading && !isError && results.counts.total === 0 && (
          <EmptyState
            title={`No results found for "${queryParam}"`}
            message="Try searching for a different skill, technology, platform, or company name."
            actionLabel="Clear Search Query"
            onAction={() => setInputVal('')}
          />
        )}

        {/* Tab Content: All Grouped */}
        {!isLoading && !isError && (
          <>
            <TabsContent value="all" className="space-y-10">
              {/* Jobs section */}
              {results.jobs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-job" />
                      Jobs ({results.jobs.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchTab('jobs')}
                      className="text-xs text-job hover:text-job hover:bg-job/10 gap-1"
                    >
                      View all {results.counts.jobs} jobs <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.jobs.slice(0, 4).map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              )}

              {/* Internships section */}
              {results.internships.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-internship" />
                      Internships ({results.internships.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchTab('internships')}
                      className="text-xs text-internship hover:text-internship hover:bg-internship/10 gap-1"
                    >
                      View all {results.counts.internships} internships <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.internships.slice(0, 4).map((internship) => (
                      <InternshipCard key={internship.id} internship={internship} />
                    ))}
                  </div>
                </div>
              )}

              {/* Hackathons section */}
              {results.hackathons.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-hackathon" />
                      Hackathons ({results.hackathons.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchTab('hackathons')}
                      className="text-xs text-hackathon hover:text-hackathon hover:bg-hackathon/10 gap-1"
                    >
                      View all {results.counts.hackathons} hackathons <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.hackathons.slice(0, 4).map((hackathon) => (
                      <HackathonCard key={hackathon.id} hackathon={hackathon} />
                    ))}
                  </div>
                </div>
              )}

              {/* Contests section */}
              {results.contests.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-contest" />
                      Coding Contests ({results.contests.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchTab('contests')}
                      className="text-xs text-contest hover:text-contest hover:bg-contest/10 gap-1"
                    >
                      View all {results.counts.contests} contests <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.contests.slice(0, 4).map((contest) => (
                      <ContestCard key={contest.id} contest={contest} />
                    ))}
                  </div>
                </div>
              )}

              {/* Companies section */}
              {results.companies.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Companies ({results.companies.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchTab('companies')}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      View all {results.counts.companies} companies <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.companies.slice(0, 3).map((company) => (
                      <CompanyCard key={company.id} company={company} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Jobs */}
            <TabsContent value="jobs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </TabsContent>

            {/* Tab: Internships */}
            <TabsContent value="internships">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.internships.map((internship) => (
                  <InternshipCard key={internship.id} internship={internship} />
                ))}
              </div>
            </TabsContent>

            {/* Tab: Hackathons */}
            <TabsContent value="hackathons">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.hackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </TabsContent>

            {/* Tab: Contests */}
            <TabsContent value="contests">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.contests.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} />
                ))}
              </div>
            </TabsContent>

            {/* Tab: Companies */}
            <TabsContent value="companies">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default SearchPage;
