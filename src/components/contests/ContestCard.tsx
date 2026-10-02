// ============================================================
// Opportune V4 — ContestCard Component
// Category-specific composition for Coding Contests
// Displays: Platform, Contest name, Start date/time, Duration,
// Rating, Participants, Status (UPCOMING / LIVE / COMPLETED),
// Toolbar (Share, Calendar, Compare, Heart), Contest Tips dialog, and Gradient CTA
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, Users, Terminal, Zap } from 'lucide-react';
import { Contest } from '@/types/contest';
import {
  OpportunityCard,
  OpportunityHeader,
  OpportunityToolbar,
  OpportunityMeta,
  OpportunityMetaItem,
  OpportunityDualCTA,
  OpportunityStatus,
} from '@/components/opportunity/OpportunityPrimitives';
import { bookmarksService } from '@/services/bookmarks';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ContestCardProps {
  contest: Contest;
  onBookmarkChange?: () => void;
}

export const ContestCard: React.FC<ContestCardProps> = ({ contest, onBookmarkChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = React.useState(
    contest.isBookmarked ?? bookmarksService.isBookmarked(contest.id)
  );

  const startDate = new Date(contest.startTime);
  const hoursUntilStart = Math.ceil(
    (startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
  );
  const isLive = contest.status === 'LIVE';
  const isUrgent = isLive || (hoursUntilStart > 0 && hoursUntilStart <= 24);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(contest.id);
        setIsBookmarked(false);
        toast({ title: 'Bookmark removed', description: `${contest.name} removed from saved.` });
      } else {
        await bookmarksService.addBookmark({
          category: 'contests',
          targetId: contest.id,
          targetSlug: contest.slug,
          title: contest.name,
          organization: contest.platform,
          logoUrl: contest.platformLogoUrl || null,
          meta: {
            startTime: contest.startTime,
            duration: contest.durationFormatted,
            platform: contest.platform,
          },
        });
        setIsBookmarked(true);
        toast({ title: 'Contest saved', description: `${contest.name} added to your saved list.` });
      }
      onBookmarkChange?.();
    } catch {
      toast({ title: 'Error', description: 'Could not update bookmark', variant: 'destructive' });
    }
  };

  const statusVariant = {
    UPCOMING: 'upcoming',
    LIVE: 'live',
    COMPLETED: 'completed',
  }[contest.status] as 'upcoming' | 'live' | 'completed';

  const formattedStart = startDate.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <OpportunityCard
      category="contest"
      isUrgent={isUrgent}
      onClick={() => navigate(`/contests/${contest.slug}`)}
    >
      <div>
        {/* Header with Title, Platform & Top-Right Toolbar (Share, Calendar, Compare, Heart) */}
        <OpportunityHeader
          title={contest.name}
          subtitle={contest.platform}
          fallbackIcon={<Terminal className="h-5 w-5 text-contest" />}
          logoUrl={contest.platformLogoUrl}
          categoryBadge={
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-contest/10 text-contest border border-contest/20 uppercase tracking-wider">
                {contest.ratingType}
              </span>
              <OpportunityStatus status={contest.status} variant={statusVariant} />
            </div>
          }
          urgentBadge={
            isLive ? (
              <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-medium text-[10px] px-1.5 py-0 animate-pulse">
                <Zap className="mr-1 h-2.5 w-2.5" />
                LIVE NOW
              </Badge>
            ) : isUrgent ? (
              <Badge className="bg-urgent/10 text-urgent border border-urgent/30 font-medium text-[10px] px-1.5 py-0 animate-pulse">
                <Clock className="mr-1 h-2.5 w-2.5" />
                {hoursUntilStart}h left
              </Badge>
            ) : null
          }
          rightAction={
            <OpportunityToolbar
              id={contest.id}
              title={contest.name}
              category="contest"
              organization={contest.platform}
              applyUrl={contest.externalUrl}
              deadline={startDate}
              isBookmarked={isBookmarked}
              onBookmarkToggle={handleBookmarkToggle}
            />
          }
          onTitleClick={() => navigate(`/contests/${contest.slug}`)}
        />

        {/* Specific Contest Metadata Grid (Start Time, Duration, Platform, Rating) */}
        <OpportunityMeta>
          <OpportunityMetaItem
            icon={<Calendar className="h-3.5 w-3.5 text-contest" />}
            label="Starts At"
            value={formattedStart}
            highlight
          />
          <OpportunityMetaItem
            icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Duration"
            value={contest.durationFormatted}
          />
          <OpportunityMetaItem
            icon={<Terminal className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Platform"
            value={contest.platform}
          />
          <OpportunityMetaItem
            icon={<Users className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Participants"
            value={contest.participantsCount ? `${contest.participantsCount.toLocaleString()}+` : 'Open'}
          />
        </OpportunityMeta>
      </div>

      {/* Dual Button Footer: Sparkles "Contest Tips" Dialog + Gradient "Join Contest" */}
      <OpportunityDualCTA
        category="contest"
        title={contest.name}
        organization={contest.platform}
        primaryLabel={isLive ? 'Join Live Round' : 'Register Contest'}
        externalUrl={contest.externalUrl}
        customPrepPoints={[
          'Open your preferred IDE with standard templates (Fast I/O, Modular Arithmetic, Disjoint Set)',
          `Review recent ${contest.platform} contest editorial problems from division 2/3`,
          'Scan all problems in the first 5 minutes to identify easiest score multipliers',
          'Double check 64-bit integer overflow limits and edge cases (empty input, max constraints)',
        ]}
      />
    </OpportunityCard>
  );
};
