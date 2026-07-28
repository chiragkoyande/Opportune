import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { usePlatformStats } from '@/hooks/useOpportunities';
import { CATEGORY_META, OPPORTUNITY_CATEGORIES } from '@/types/opportunity';
import FloatingParticles from './FloatingParticles';

const QUICK_CATEGORIES = [
  'hackathon', 'internship', 'contest', 'scholarship', 'fellowship', 'open_source',
] as const;

const Hero = () => {
  const navigate = useNavigate();
  const { data: stats } = usePlatformStats();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query?.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <section className="relative overflow-hidden bg-mesh noise-bg">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl animate-blob" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-gradient-radial from-accent/10 via-accent/3 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '-2s' }} />
      <FloatingParticles />

      <div className="container relative z-10 py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover opportunities from 50+ platforms</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-foreground">Your Career, </span>
            <span className="text-gradient-animated">Accelerated</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 text-base text-muted-foreground md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            The modern platform to discover Hackathons, Internships, Coding Contests,
            Fellowships, Scholarships, Open Source Programs and early career opportunities.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6 mx-auto max-w-2xl"
          >
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                name="search"
                type="text"
                placeholder="Search hackathons, internships, contests..."
                className="
                  w-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm
                  py-4 pl-14 pr-32 text-sm text-foreground
                  placeholder:text-muted-foreground/60
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                  transition-all shadow-lg shadow-black/5
                "
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 rounded-xl shadow-glow-sm font-medium"
              >
                Search
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.form>

          {/* Quick Categories */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mb-14"
          >
            <span className="text-xs text-muted-foreground/60 self-center mr-1">Explore:</span>
            {QUICK_CATEGORIES.map((catId) => {
              const cat = CATEGORY_META[catId];
              return (
                <button
                  key={catId}
                  onClick={() => navigate(`/explore?category=${catId}`)}
                  className="
                    inline-flex items-center gap-1.5 rounded-full px-3 py-1.5
                    text-xs font-medium text-muted-foreground
                    bg-secondary/40 border border-border/30
                    hover:bg-secondary/70 hover:text-foreground hover:border-border/50
                    transition-all duration-200
                  "
                >
                  {cat.label}
                </button>
              );
            })}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto"
          >
            <StatItem value={stats?.total_opportunities || 500} suffix="+" label="Opportunities" />
            <StatItem value={12} label="Categories" />
            <StatItem value={stats?.sources_count || 50} suffix="+" label="Sources" />
            <StatItem value="24/7" label="Updates" isText />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

interface StatItemProps {
  value: number | string;
  suffix?: string;
  label: string;
  isText?: boolean;
}

const StatItem = ({ value, suffix = '', label, isText }: StatItemProps) => (
  <div className="text-center">
    <p className="font-display text-2xl md:text-3xl font-bold text-gradient">
      {isText ? value : <>{value}{suffix}</>}
    </p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </div>
);

export default Hero;