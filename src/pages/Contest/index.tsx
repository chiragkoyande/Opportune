// ============================================================
// Opportune V4 — Contest Details Page
// Section 13: Dedicated Coding Contest Details Layout
// Platform metadata, duration, rating, problem breakdown, official contest join link.
// ============================================================

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  Terminal,
  Zap,
  Users,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/lib/seo';
import { contestsService } from '@/services/contests';
import { bookmarksService } from '@/services/bookmarks';
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorState } from '@/components/ui/StatusStates';
import { useToast } from '@/hooks/use-toast';

export const ContestDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: contest, isLoading, isError, error } = useQuery({
    queryKey: ['contest', slug],
    queryFn: () => contestsService.getContestBySlug(slug!),
    enabled: Boolean(slug),
  });

  const [isBookmarked, setIsBookmarked] = useState(false);

  React.useEffect(() => {
    if (contest) {
      setIsBookmarked(bookmarksService.isBookmarked(contest.id));
    }
  }, [contest]);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError || !contest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Contest Not Found"
          message={error instanceof Error ? error.message : "The requested coding contest could not be located."}
          onRetry={() => navigate('/contests')}
        />
      </div>
    );
  }

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(contest.id);
        setIsBookmarked(false);
        toast({ title: 'Removed from saved contests' });
      } else {
        await bookmarksService.addBookmark({
          category: 'contests',
          targetId: contest.id,
          targetSlug: contest.slug,
          title: contest.name,
          organization: contest.platform,
          logoUrl: contest.platformLogoUrl || null,
          meta: { startTime: contest.startTime, duration: contest.durationFormatted, platform: contest.platform },
        });
        setIsBookmarked(true);
        toast({ title: 'Contest saved to bookmarks' });
      }
    } catch {
      toast({ title: 'Error updating bookmark', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${contest.name} on ${contest.platform}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const formattedStart = new Date(contest.startTime).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const formattedEnd = new Date(contest.endTime).toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title={`${contest.name} | ${contest.platform} | Opportune`}
        description={`${contest.name} competitive programming contest on ${contest.platform}. Duration: ${contest.durationFormatted}. Starts: ${formattedStart}.`}
      />

      <Link
        to="/contests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contest Schedule
      </Link>

      {/* Hero Banner */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-secondary/40 border border-border/60 p-2 overflow-hidden flex items-center justify-center flex-shrink-0">
              <Terminal className="h-8 w-8 text-contest" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {contest.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-contest/10 text-contest border border-contest/30 uppercase">
                  {contest.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-foreground">{contest.platform}</span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs font-semibold text-primary">{contest.ratingType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmarkToggle}
              className={`h-9 gap-1.5 text-xs ${isBookmarked ? 'text-primary border-primary/40 bg-primary/10' : ''}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="h-9 w-9 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/40 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-contest" />
              Starts At
            </span>
            <p className="font-bold text-foreground text-sm">
              {formattedStart}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5 text-contest" />
              Duration
            </span>
            <p className="font-semibold text-foreground">{contest.durationFormatted}</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-contest" />
              Rating Status
            </span>
            <p className="font-semibold text-foreground">{contest.ratingType}</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Users className="h-3.5 w-3.5 text-contest" />
              Estimated Coders
            </span>
            <p className="font-semibold text-foreground">
              {contest.participantsCount ? `${contest.participantsCount.toLocaleString()}+` : 'Open Entry'}
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-6 border-t border-border/40">
          <Button asChild size="lg" className="h-11 bg-contest text-white hover:bg-contest/90 font-bold gap-2 text-sm flex-1">
            <a href={contest.officialUrl} target="_blank" rel="noreferrer">
              Join Contest on {contest.platform}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">Contest Information</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {contest.description || 'Participate in this official rated contest to benchmark your algorithms and problem solving skills against international coders.'}
            </p>
          </div>

          {contest.languagesAllowed && contest.languagesAllowed.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-contest" />
                <h2 className="font-display font-bold text-lg text-foreground">Allowed Programming Languages</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {contest.languagesAllowed.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border/50"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-foreground">Eligibility & Divisions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {contest.eligibility || 'Open to all registered programmers worldwide.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-foreground">Platform Source</h3>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs">
              <span className="font-semibold text-foreground">{contest.platform}</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Official round hosted directly on {contest.platform}. Leaderboards and submissions are recorded on their platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetailPage;
