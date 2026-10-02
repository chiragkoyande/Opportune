import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  BriefcaseBusiness,
  CalendarClock,
  FolderKanban,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { JobCard, JobCardSkeleton } from '@/components/careers/JobCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCareerJobs, useSavedCareerJobs } from '@/hooks/useCareerJobs';
import { useJobBookmarks } from '@/hooks/useJobBookmarks';
import { useProfile } from '@/hooks/useProfile';
import { CAREER_SEARCH_SUGGESTIONS, CareerJob } from '@/types/career';

const RECENT_SEARCHES_KEY = 'opportune:recent-searches';

function readRecentSearches(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const bookmarks = useJobBookmarks();
  const savedJobsQuery = useSavedCareerJobs(bookmarks.bookmarkedIds);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const recommendationQuery = useMemo(() => {
    const interests = profile?.interests ?? [];
    return interests.slice(0, 3).join(' ');
  }, [profile?.interests]);

  const recommendedJobsQuery = useCareerJobs({
    query: recommendationQuery,
    sort: 'relevance',
  });

  const deadlineJobsQuery = useCareerJobs({
    sort: 'newest',
  });

  const recommendedJobs = useMemo(
    () => recommendedJobsQuery.data?.pages.flatMap((page) => page.jobs).slice(0, 6) ?? [],
    [recommendedJobsQuery.data],
  );

  const deadlineJobs = useMemo(
    () => deadlineJobsQuery.data?.pages.flatMap((page) => page.jobs).slice(0, 4) ?? [],
    [deadlineJobsQuery.data],
  );

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, navigate, user]);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-8">
        <section className="mb-6 rounded-lg border border-border/60 bg-card/85 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Personalized workspace
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {profile?.display_name ? `${profile.display_name}'s dashboard` : 'Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Recommendations, saved roles, tracked searches, and upcoming career deadlines in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/jobs">
                  <Search className="mr-2 h-4 w-4" />
                  Search roles
                </Link>
              </Button>
              <Button asChild className="rounded-lg">
                <Link to="/profile">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Update preferences
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard icon={<BriefcaseBusiness className="h-4 w-4" />} label="Recommended" value={recommendedJobs.length} />
          <MetricCard icon={<BookmarkCheck className="h-4 w-4" />} label="Saved" value={bookmarks.bookmarkedIds.length} />
          <MetricCard icon={<Search className="h-4 w-4" />} label="Recent searches" value={recentSearches.length} />
          <MetricCard icon={<CalendarClock className="h-4 w-4" />} label="Upcoming" value={deadlineJobs.length} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <DashboardSection
              title="Recommended opportunities"
              description={recommendationQuery ? `Based on ${recommendationQuery}` : 'Add interests in your profile to personalize this feed.'}
            >
              <JobList
                jobs={recommendedJobs}
                loading={recommendedJobsQuery.isLoading}
                bookmarks={bookmarks}
                emptyText="No recommendations yet. Add interests in your profile or broaden your search."
              />
            </DashboardSection>

            <DashboardSection title="Saved opportunities" description="Roles bookmarked from the career explorer.">
              <JobList
                jobs={savedJobsQuery.data ?? []}
                loading={bookmarks.bookmarkedIds.length > 0 && savedJobsQuery.isLoading}
                bookmarks={bookmarks}
                emptyText="No saved roles yet."
              />
            </DashboardSection>
          </section>

          <aside className="space-y-6">
            <DashboardSection title="Recent searches" description="Jump back into common discovery paths.">
              <SearchPills searches={recentSearches.length ? recentSearches : CAREER_SEARCH_SUGGESTIONS} />
            </DashboardSection>

            <DashboardSection title="Trending searches" description="High-signal queries for India-focused early career discovery.">
              <SearchPills searches={['Remote React Internship', 'Cybersecurity Internship Pune', 'Google SDE', 'Machine Learning Internship', 'AI Hackathon']} />
            </DashboardSection>

            <DashboardSection title="Upcoming deadlines" description="Fresh roles from official career feeds.">
              <div className="space-y-3">
                {deadlineJobs.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="block rounded-lg border border-border/60 bg-background p-3 hover:border-primary/30">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">{job.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{job.company?.name ?? 'Verified company'} · {job.location ?? 'Location flexible'}</p>
                  </Link>
                ))}
              </div>
            </DashboardSection>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/90 p-4 shadow-sm">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function DashboardSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border/60 bg-card/90 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </section>
  );
}

function JobList({
  jobs,
  loading,
  bookmarks,
  emptyText,
}: {
  jobs: CareerJob[];
  loading: boolean;
  bookmarks: ReturnType<typeof useJobBookmarks>;
  emptyText: string;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => <JobCardSkeleton key={index} />)}
      </div>
    );
  }

  if (jobs.length === 0) {
    return <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">{emptyText}</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          viewMode="grid"
          saved={bookmarks.isBookmarked(job.id)}
          onToggleSave={(item) => bookmarks.toggleBookmark(item.id, item.title)}
        />
      ))}
    </div>
  );
}

function SearchPills({ searches }: { searches: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {searches.map((search) => (
        <Link key={search} to={`/jobs?q=${encodeURIComponent(search)}`}>
          <Badge variant="outline" className="rounded-full border-border/70 px-3 py-1.5 text-xs font-medium hover:border-primary/30 hover:text-primary">
            {search}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
