import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Opportunity, OpportunityCategory, CATEGORY_META, OPPORTUNITY_CATEGORIES } from '@/types/opportunity';
import OpportunityCard from './OpportunityCard';
import LoadingSkeletons from './LoadingSkeletons';
import {
  Search, Loader2, RefreshCw, AlertCircle, Sparkles, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface OpportunityGridProps {
  opportunities: Opportunity[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const QUICK_FILTERS: (OpportunityCategory | 'all')[] = [
  'all', 'hackathon', 'internship', 'contest', 'scholarship', 'fellowship'
];

const OpportunityGrid = ({ opportunities, loading, error, onRefresh }: OpportunityGridProps) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<OpportunityCategory | 'all'>('all');

  const filteredOpportunities = useMemo(() => {
    if (activeFilter === 'all') return opportunities;
    return opportunities.filter((opp) => opp.category === activeFilter);
  }, [opportunities, activeFilter]);

  return (
    <section id="opportunities" className="py-16 md:py-20 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="container relative">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary/40 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Latest Opportunities</span>
            </div>
            <h2 className="mb-3 font-display text-2xl md:text-3xl font-bold text-foreground">
              Discover What's <span className="text-gradient">Trending</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {loading
                ? 'Fetching latest opportunities...'
                : `${opportunities.length} opportunities available`
              }
            </p>
          </motion.div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-auto mb-8 max-w-md rounded-xl border border-urgent/30 bg-urgent/5 p-4 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-urgent mb-2" />
            <p className="text-sm text-urgent mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-urgent/30 text-urgent hover:bg-urgent/10">
              Try Again
            </Button>
          </div>
        )}

        {/* Quick Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {QUICK_FILTERS.map((filterId) => {
            const isActive = activeFilter === filterId;
            const label = filterId === 'all' ? 'All' : CATEGORY_META[filterId]?.label || filterId;
            return (
              <button
                key={filterId}
                onClick={() => setActiveFilter(filterId)}
                className={`
                  relative px-4 py-2 rounded-full text-xs font-medium transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-glow-sm'
                    : 'bg-secondary/40 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* Loading State */}
        {loading && opportunities.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
                <div className="flex gap-2">
                  <div className="h-9 flex-1 bg-muted rounded-lg" />
                  <div className="h-9 flex-1 bg-muted rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOpportunities.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>

            {/* Loading more */}
            {loading && opportunities.length > 0 && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {/* View All CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/explore')}
                className="rounded-full border-border/50 hover:bg-secondary/60 gap-2"
              >
                View All Opportunities
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">No opportunities found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default OpportunityGrid;