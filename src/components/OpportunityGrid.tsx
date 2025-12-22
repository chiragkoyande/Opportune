import { useState, useMemo } from 'react';
import { Opportunity, OpportunityType } from '@/types/opportunity';
import OpportunityCard from './OpportunityCard';
import FilterTabs from './FilterTabs';
import ScrollReveal from './ScrollReveal';
import { Search, Loader2, RefreshCw, AlertCircle, Sparkles, SlidersHorizontal, X, Calendar, MapPin, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OpportunityGridProps {
  opportunities: Opportunity[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

type SortOption = 'deadline' | 'recent' | 'title';
type DeadlineFilter = 'all' | 'week' | 'month' | '3months';

const OpportunityGrid = ({ opportunities, loading, error, onRefresh }: OpportunityGridProps) => {
  const [activeFilter, setActiveFilter] = useState<OpportunityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique locations from opportunities
  const uniqueLocations = useMemo(() => {
    const locations = opportunities
      .map(opp => opp.location)
      .filter((loc): loc is string => !!loc);
    return ['all', ...Array.from(new Set(locations))];
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    const now = new Date();
    
    return opportunities.filter((opp) => {
      // Type filter
      const matchesFilter = activeFilter === 'all' || opp.type === activeFilter;
      
      // Search filter
      const matchesSearch = searchQuery === '' || 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Deadline filter
      let matchesDeadline = true;
      if (deadlineFilter !== 'all') {
        const daysUntil = Math.ceil((opp.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        switch (deadlineFilter) {
          case 'week':
            matchesDeadline = daysUntil <= 7 && daysUntil > 0;
            break;
          case 'month':
            matchesDeadline = daysUntil <= 30 && daysUntil > 0;
            break;
          case '3months':
            matchesDeadline = daysUntil <= 90 && daysUntil > 0;
            break;
        }
      }
      
      // Location filter
      const matchesLocation = locationFilter === 'all' || 
        opp.location?.toLowerCase() === locationFilter.toLowerCase() ||
        (locationFilter === 'remote' && opp.location?.toLowerCase().includes('remote'));
      
      return matchesFilter && matchesSearch && matchesDeadline && matchesLocation;
    });
  }, [opportunities, activeFilter, searchQuery, deadlineFilter, locationFilter]);

  // Sort opportunities
  const sortedOpportunities = useMemo(() => {
    return [...filteredOpportunities].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return a.deadline.getTime() - b.deadline.getTime();
        case 'recent':
          return b.deadline.getTime() - a.deadline.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [filteredOpportunities, sortBy]);

  const activeFiltersCount = [
    deadlineFilter !== 'all',
    locationFilter !== 'all',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setDeadlineFilter('all');
    setLocationFilter('all');
    setSearchQuery('');
    setActiveFilter('all');
    setSortBy('deadline');
  };

  return (
    <section id="opportunities" className="py-16 md:py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container relative">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm font-medium text-muted-foreground mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Live from 50+ platforms</span>
          </div>
          <h2 className="mb-4 font-display text-3xl md:text-4xl font-bold text-foreground animate-fade-in-up">
            Discover Your Next
            <span className="text-gradient ml-2">Opportunity</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {loading ? 'Fetching latest opportunities...' : `${opportunities.length} opportunities waiting for you`}
          </p>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="mt-4 border-border/50 bg-secondary/50 hover:bg-secondary animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-auto mb-10 max-w-md rounded-2xl border border-urgent/30 bg-urgent/10 backdrop-blur-sm p-6 text-center animate-fade-in">
            <AlertCircle className="mx-auto h-10 w-10 text-urgent mb-3" />
            <p className="text-sm text-urgent mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-urgent/30 text-urgent hover:bg-urgent/10"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Search and Advanced Filters */}
        <div className="mx-auto mb-8 max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Search by title, company, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Filter Toggle Button */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="relative border-border/50 bg-card/80 backdrop-blur-sm hover:bg-secondary h-[50px] px-4"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card border-border" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-muted-foreground hover:text-foreground h-8 px-2"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Deadline Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Deadline
                    </label>
                    <Select value={deadlineFilter} onValueChange={(v) => setDeadlineFilter(v as DeadlineFilter)}>
                      <SelectTrigger className="w-full bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Any deadline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any deadline</SelectItem>
                        <SelectItem value="week">Within 7 days</SelectItem>
                        <SelectItem value="month">Within 30 days</SelectItem>
                        <SelectItem value="3months">Within 3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Location
                    </label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-full bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueLocations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc === 'all' ? 'Any location' : loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      Sort by
                    </label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                      <SelectTrigger className="w-full bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deadline">Deadline (soonest first)</SelectItem>
                        <SelectItem value="recent">Deadline (latest first)</SelectItem>
                        <SelectItem value="title">Title (A-Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {(activeFiltersCount > 0 || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-secondary/50 text-muted-foreground">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {deadlineFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-secondary/50 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {deadlineFilter === 'week' ? 'Within 7 days' : deadlineFilter === 'month' ? 'Within 30 days' : 'Within 3 months'}
                  <button onClick={() => setDeadlineFilter('all')} className="ml-1 hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {locationFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-secondary/50 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {locationFilter}
                  <button onClick={() => setLocationFilter('all')} className="ml-1 hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20 rounded-full bg-primary" />
            </div>
            <p className="mt-6 text-muted-foreground">Fetching live opportunities...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-8 text-center">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{sortedOpportunities.length}</span> 
                {activeFilter !== 'all' && <span className="text-primary"> {activeFilter}</span>} opportunities
              </p>
            </div>

            {/* Grid */}
            {sortedOpportunities.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedOpportunities.map((opportunity, index) => {
                  // Calculate row and column for wave effect (left to right, row by row)
                  const cols = 3; // lg:grid-cols-3
                  const row = Math.floor(index / cols);
                  const col = index % cols;
                  // Wave delay: items in same row animate left to right, each row starts after previous
                  const waveDelay = (row * 150) + (col * 100);
                  
                  return (
                    <ScrollReveal
                      key={opportunity.id}
                      delay={waveDelay}
                      direction={col === 0 ? 'left' : col === 2 ? 'right' : 'up'}
                      duration={600}
                    >
                      <OpportunityCard opportunity={opportunity} />
                    </ScrollReveal>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">No opportunities found</p>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default OpportunityGrid;