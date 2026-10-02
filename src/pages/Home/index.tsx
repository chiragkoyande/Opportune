// ============================================================
// Opportune V4 — Home Page
// Section 6: Unified Opportunity Discovery Experience
// Hero, Global Search, Quick Categories, Latest Jobs,
// Latest Internships, Trending Hackathons, Upcoming Contests,
// Featured Companies, Real API-driven Statistics.
// ============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Rocket,
  Trophy,
  Building2,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEO } from '@/lib/seo';
import { jobsService } from '@/services/jobs';
import { internshipsService } from '@/services/internships';
import { hackathonsService } from '@/services/hackathons';
import { contestsService } from '@/services/contests';
import { companiesService } from '@/services/companies';
import { JobCard } from '@/components/jobs/JobCard';
import { InternshipCard } from '@/components/internships/InternshipCard';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { ContestCard } from '@/components/contests/ContestCard';
import {
  JobCardSkeleton,
  InternshipCardSkeleton,
  HackathonCardSkeleton,
  ContestCardSkeleton,
} from '@/components/ui/LoadingSkeletons';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch real API-driven data using TanStack Query
  const { data: featuredJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: () => jobsService.getFeaturedJobs(4),
  });

  const { data: featuredInternships = [], isLoading: internshipsLoading } = useQuery({
    queryKey: ['featured-internships'],
    queryFn: () => internshipsService.getFeaturedInternships(4),
  });

  const { data: trendingHackathons = [], isLoading: hackathonsLoading } = useQuery({
    queryKey: ['trending-hackathons'],
    queryFn: () => hackathonsService.getTrendingHackathons(3),
  });

  const { data: upcomingContests = [], isLoading: contestsLoading } = useQuery({
    queryKey: ['upcoming-contests'],
    queryFn: () => contestsService.getUpcomingContests(3),
  });

  const { data: featuredCompanies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['featured-companies'],
    queryFn: () => companiesService.getFeaturedCompanies(4),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col space-y-16 pb-20">
      <SEO
        title="Find Jobs, Internships, Hackathons & Coding Contests"
        description="Unified discovery platform for software developers. Explore verified tech jobs, internships, hackathons, and coding contests."
      />

      {/* ============================================================
          HERO SECTION — Unified with Global Background
          ============================================================ */}
      <section className="relative pt-12 md:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6 float-badge">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Single Destination for Tech Opportunities</span>
          </div>

          {/* Heading & Subtitle */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            Find your next <span className="text-primary font-bold">opportunity.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Jobs, internships, hackathons and coding contests — all in one place.
          </p>

          {/* Global Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto relative flex items-center shadow-lg rounded-2xl bg-card border border-border/80 p-1.5 focus-within:ring-2 focus-within:ring-primary/40 transition-all"
          >
            <div className="pl-3 text-muted-foreground flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <Input
              type="text"
              placeholder="Search jobs, internships, hackathons, contests, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 text-xs sm:text-sm pl-3 h-11 bg-transparent"
            />
            <Button
              type="submit"
              size="sm"
              className="h-10 px-5 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              Search
            </Button>
          </form>

          {/* Category Quick Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/jobs"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-job/30 bg-card hover:bg-job/5 hover:border-job text-foreground text-xs sm:text-sm font-semibold transition-all group shadow-sm"
            >
              <div className="p-1 rounded-md bg-job/10 text-job group-hover:scale-110 transition-transform">
                <Briefcase className="h-4 w-4" />
              </div>
              Jobs
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/internships"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-internship/30 bg-card hover:bg-internship/5 hover:border-internship text-foreground text-xs sm:text-sm font-semibold transition-all group shadow-sm"
            >
              <div className="p-1 rounded-md bg-internship/10 text-internship group-hover:scale-110 transition-transform">
                <GraduationCap className="h-4 w-4" />
              </div>
              Internships
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/hackathons"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-hackathon/30 bg-card hover:bg-hackathon/5 hover:border-hackathon text-foreground text-xs sm:text-sm font-semibold transition-all group shadow-sm"
            >
              <div className="p-1 rounded-md bg-hackathon/10 text-hackathon group-hover:scale-110 transition-transform">
                <Rocket className="h-4 w-4" />
              </div>
              Hackathons
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/contests"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-contest/30 bg-card hover:bg-contest/5 hover:border-contest text-foreground text-xs sm:text-sm font-semibold transition-all group shadow-sm"
            >
              <div className="p-1 rounded-md bg-contest/10 text-contest group-hover:scale-110 transition-transform">
                <Trophy className="h-4 w-4" />
              </div>
              Contests
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 1: LATEST JOBS (Career)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-job" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-job">Career Track</p>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Latest Engineering Jobs
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Full-time software engineering and platform roles with transparent compensation.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 hover:text-job">
            <Link to="/jobs">
              View all jobs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
          SECTION 2: LATEST INTERNSHIPS (Career)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-internship" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-internship">Early Career</p>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Verified Internships & PPOs
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Top tier engineering internships with confirmed stipends and pre-placement conversion.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 hover:text-internship">
            <Link to="/internships">
              View all internships <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {internshipsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InternshipCardSkeleton />
            <InternshipCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredInternships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
          SECTION 3: TRENDING HACKATHONS (Competitions)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-hackathon" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-hackathon">Competitions</p>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Trending Global Hackathons
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Compete, build cutting-edge projects, and win from major prize pools.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 hover:text-hackathon">
            <Link to="/hackathons">
              Explore hackathons <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {hackathonsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HackathonCardSkeleton />
            <HackathonCardSkeleton />
            <HackathonCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
          SECTION 4: UPCOMING CODING CONTESTS (Competitions)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-contest" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-contest">Competitive Programming</p>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Upcoming & Live Coding Contests
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Boost your rating across CodeChef, Codeforces, LeetCode, and AtCoder.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 hover:text-contest">
            <Link to="/contests">
              Contest schedule <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {contestsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContestCardSkeleton />
            <ContestCardSkeleton />
            <ContestCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingContests.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
          SECTION 5: FEATURED COMPANIES
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ecosystem</p>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Featured Tech Companies
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Organizations actively hiring engineers and sponsoring developer challenges.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5">
            <Link to="/companies">
              All companies <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCompanies.map((company) => (
            <Link
              key={company.id}
              to={`/companies/${company.slug}`}
              className="p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-secondary/50 p-1 border border-border/60 overflow-hidden flex items-center justify-center">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {company.name}
                    </h4>
                    <span className="text-[11px] text-muted-foreground">{company.industry}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {company.about}
                </p>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>{company.stats.openJobsCount} Jobs</span>
                <span>{company.stats.openInternshipsCount} Interns</span>
                <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
