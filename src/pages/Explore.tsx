// ============================================================
// Explore Page — Two-column layout with filters + opportunity feed
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OpportunityCard from '@/components/OpportunityCard';
import { useOpportunities } from '@/hooks/useOpportunities';
import {
  OpportunityFilters,
  DEFAULT_FILTERS,
  CATEGORY_META,
  OPPORTUNITY_CATEGORIES,
  OpportunityCategory,
  OpportunityMode,
  OpportunityDifficulty,
} from '@/types/opportunity';
import { CompareProvider } from '@/hooks/useCompare';
import CompareBar from '@/components/CompareBar';
import {
  Search, SlidersHorizontal, X, LayoutGrid, List, Loader2,
  RefreshCw, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';

const DEADLINE_OPTIONS = [
  { value: 'all', label: 'Any deadline' },
  { value: 'week', label: 'Within 7 days' },
  { value: 'month', label: 'Within 30 days' },
  { value: '3months', label: 'Within 3 months' },
];

const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: 'newest', label: 'Newest first' },
  { value: 'trending', label: 'Trending' },
  { value: 'prize', label: 'Highest prize' },
];

const MODE_OPTIONS = [
  { value: 'all', label: 'Any mode' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Any difficulty' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize filters from URL params
  const [filters, setFilters] = useState<OpportunityFilters>(() => ({
    search: searchParams.get('q') || '',
    category: (searchParams.get('category') as OpportunityCategory | 'all') || 'all',
    mode: 'all',
    difficulty: 'all',
    country: 'all',
    deadline: 'all',
    minPrize: null,
    sortBy: 'deadline',
  }));

  const { opportunities, loading, error, totalCount, refetch } = useOpportunities({
    filters,
    pageSize: 48,
  });

  const updateFilter = useCallback(<K extends keyof OpportunityFilters>(
    key: K,
    value: OpportunityFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Update URL params for shareable links
    if (key === 'search' && value) {
      searchParams.set('q', value as string);
    } else if (key === 'search') {
      searchParams.delete('q');
    }
    if (key === 'category' && value !== 'all') {
      searchParams.set('category', value as string);
    } else if (key === 'category') {
      searchParams.delete('category');
    }
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.mode !== 'all') count++;
    if (filters.difficulty !== 'all') count++;
    if (filters.deadline !== 'all') count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  return (
    <CompareProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="container py-6 md:py-8">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                Explore Opportunities
              </h1>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Searching...' : `${totalCount} opportunities found`}
              </p>
            </div>

            {/* Search + Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search by title, company, or tag..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="
                    w-full rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm
                    py-2.5 pl-11 pr-4 text-sm text-foreground
                    placeholder:text-muted-foreground/60
                    focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                    transition-all
                  "
                />
                {filters.search && (
                  <button
                    onClick={() => updateFilter('search', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <Select
                value={filters.sortBy}
                onValueChange={(v) => updateFilter('sortBy', v as OpportunityFilters['sortBy'])}
              >
                <SelectTrigger className="w-[180px] border-border/50 bg-card/80 backdrop-blur-sm h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter Toggle (mobile) */}
              <Button
                variant="outline"
                className="sm:hidden h-10 border-border/50 bg-card/80 gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center border border-border/50 rounded-lg bg-card/80 backdrop-blur-sm p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1 bg-secondary/60 text-muted-foreground">
                    Search: "{filters.search}"
                    <button onClick={() => updateFilter('search', '')} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {filters.category !== 'all' && (
                  <Badge variant="secondary" className="gap-1 bg-secondary/60 text-muted-foreground capitalize">
                    {CATEGORY_META[filters.category]?.label}
                    <button onClick={() => updateFilter('category', 'all')} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {filters.deadline !== 'all' && (
                  <Badge variant="secondary" className="gap-1 bg-secondary/60 text-muted-foreground">
                    {DEADLINE_OPTIONS.find((d) => d.value === filters.deadline)?.label}
                    <button onClick={() => updateFilter('deadline', 'all')} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Clear all
                </button>
              </div>
            )}

            {/* Main Content: Sidebar + Feed */}
            <div className="flex gap-6">
              {/* Filter Sidebar (desktop) */}
              <aside className={`
                hidden sm:block w-64 flex-shrink-0
                ${showFilters ? '' : 'sm:hidden'}
              `}>
                <div className="sticky top-20 space-y-5">
                  {/* Category Filter */}
                  <FilterSection title="Category">
                    <div className="space-y-1.5">
                      <FilterCheckbox
                        label="All Categories"
                        checked={filters.category === 'all'}
                        onCheckedChange={() => updateFilter('category', 'all')}
                      />
                      {OPPORTUNITY_CATEGORIES.map((cat) => (
                        <FilterCheckbox
                          key={cat}
                          label={CATEGORY_META[cat].label}
                          checked={filters.category === cat}
                          onCheckedChange={() => updateFilter('category', filters.category === cat ? 'all' : cat)}
                        />
                      ))}
                    </div>
                  </FilterSection>

                  {/* Deadline Filter */}
                  <FilterSection title="Deadline">
                    <Select
                      value={filters.deadline}
                      onValueChange={(v) => updateFilter('deadline', v as OpportunityFilters['deadline'])}
                    >
                      <SelectTrigger className="w-full bg-secondary/30 border-border/40 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEADLINE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterSection>

                  {/* Mode Filter */}
                  <FilterSection title="Mode">
                    <Select
                      value={filters.mode}
                      onValueChange={(v) => updateFilter('mode', v as OpportunityMode | 'all')}
                    >
                      <SelectTrigger className="w-full bg-secondary/30 border-border/40 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterSection>

                  {/* Difficulty Filter */}
                  <FilterSection title="Difficulty">
                    <Select
                      value={filters.difficulty}
                      onValueChange={(v) => updateFilter('difficulty', v as OpportunityDifficulty | 'all')}
                    >
                      <SelectTrigger className="w-full bg-secondary/30 border-border/40 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterSection>

                  {/* Clear All */}
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Clear all filters
                    </Button>
                  )}
                </div>
              </aside>

              {/* Opportunity Feed */}
              <div className="flex-1 min-w-0">
                {/* Error State */}
                {error && (
                  <div className="mb-6 rounded-xl border border-urgent/30 bg-urgent/5 p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-urgent flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-urgent font-medium">{error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="border-urgent/30 text-urgent hover:bg-urgent/10">
                      Retry
                    </Button>
                  </div>
                )}

                {/* Loading */}
                {loading && opportunities.length === 0 ? (
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border border-border/30 bg-card/50 p-5 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-muted" />
                          <div className="flex-1">
                            <div className="h-3 w-20 bg-muted rounded" />
                            <div className="h-3 w-12 bg-muted rounded mt-1" />
                          </div>
                        </div>
                        <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                        <div className="h-3 w-full bg-muted rounded mb-1" />
                        <div className="h-3 w-2/3 bg-muted rounded mb-4" />
                        <div className="flex gap-1.5 mb-4">
                          <div className="h-5 w-16 bg-muted rounded-full" />
                          <div className="h-5 w-20 bg-muted rounded-full" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-9 flex-1 bg-muted rounded-lg" />
                          <div className="h-9 flex-1 bg-muted rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : opportunities.length > 0 ? (
                  <>
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {opportunities.map((opp) => (
                        <OpportunityCard
                          key={opp.id}
                          opportunity={opp}
                          variant={viewMode}
                        />
                      ))}
                    </div>

                    {/* Loading more indicator */}
                    {loading && opportunities.length > 0 && (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty State */
                  <div className="py-20 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
                      <Search className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">No opportunities found</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button variant="outline" onClick={clearFilters} className="rounded-full">
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <CompareBar />
      </div>
    </CompareProvider>
  );
};

// --- Subcomponents ---

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/30 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2 hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}

const FilterCheckbox = ({ label, checked, onCheckedChange }: FilterCheckboxProps) => (
  <label className="flex items-center gap-2 py-0.5 cursor-pointer group">
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="h-3.5 w-3.5 border-border/60"
    />
    <span className={`text-xs transition-colors ${checked ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
      {label}
    </span>
  </label>
);

export default Explore;
