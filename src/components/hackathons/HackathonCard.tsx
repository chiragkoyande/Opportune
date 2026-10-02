// ============================================================
// Opportune V4 — HackathonCard Component
// Category-specific composition for Hackathons
// Displays: Organizer, Hackathon title, Mode, Location,
// Registration deadline, Prize pool, Team size, Tags, Status,
// Toolbar (Share, Compare, Heart), Project Ideas dialog, and Gradient CTA
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Globe, MapPin, Clock } from 'lucide-react';
import { Hackathon } from '@/types/hackathon';
import {
  OpportunityCard,
  OpportunityHeader,
  OpportunityToolbar,
  OpportunityMeta,
  OpportunityMetaItem,
  OpportunityTags,
  OpportunityDualCTA,
  OpportunityStatus,
} from '@/components/opportunity/OpportunityPrimitives';
import { bookmarksService } from '@/services/bookmarks';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface HackathonCardProps {
  hackathon: Hackathon;
  onBookmarkChange?: () => void;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon, onBookmarkChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = React.useState(
    hackathon.isBookmarked ?? bookmarksService.isBookmarked(hackathon.id)
  );

  const deadlineDate = hackathon.registrationDeadline
    ? new Date(hackathon.registrationDeadline)
    : null;
  const daysUntilDeadline = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 5 && daysUntilDeadline > 0;

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(hackathon.id);
        setIsBookmarked(false);
        toast({ title: 'Bookmark removed', description: `${hackathon.title} removed from saved.` });
      } else {
        await bookmarksService.addBookmark({
          category: 'hackathons',
          targetId: hackathon.id,
          targetSlug: hackathon.slug,
          title: hackathon.title,
          organization: hackathon.organizer.name,
          logoUrl: hackathon.organizer.logoUrl,
          location: hackathon.location,
          meta: {
            prize: hackathon.prizePool.formatted,
            deadline: hackathon.registrationDeadline,
            mode: hackathon.mode,
          },
        });
        setIsBookmarked(true);
        toast({ title: 'Hackathon saved', description: `${hackathon.title} added to your saved list.` });
      }
      onBookmarkChange?.();
    } catch {
      toast({ title: 'Error', description: 'Could not update bookmark', variant: 'destructive' });
    }
  };

  const statusVariant = {
    open: 'open',
    'closing-soon': 'closing-soon',
    upcoming: 'upcoming',
    closed: 'closed',
    'in-progress': 'live',
    ended: 'completed',
  }[hackathon.status] as 'open' | 'closing-soon' | 'upcoming' | 'closed' | 'live' | 'completed';

  const teamSizeLabel =
    hackathon.teamSize.min === hackathon.teamSize.max
      ? `${hackathon.teamSize.max} members`
      : `${hackathon.teamSize.min}–${hackathon.teamSize.max} members`;

  const formattedDeadline = deadlineDate
    ? deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Open';

  return (
    <OpportunityCard
      category="hackathon"
      featured={hackathon.isFeatured}
      isUrgent={isUrgent}
      onClick={() => navigate(`/hackathons/${hackathon.slug}`)}
    >
      <div>
        {/* Header with Title, Organizer & Top-Right Toolbar (Share, Compare, Heart) */}
        <OpportunityHeader
          title={hackathon.title}
          subtitle={hackathon.organizer.name}
          logoUrl={hackathon.organizer.logoUrl}
          verified={hackathon.organizer.verified}
          categoryBadge={
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-hackathon/10 text-hackathon border border-hackathon/20 uppercase tracking-wider">
                {hackathon.mode}
              </span>
              <OpportunityStatus status={hackathon.status.replace('-', ' ')} variant={statusVariant} />
            </div>
          }
          urgentBadge={
            isUrgent && (
              <Badge className="bg-urgent/10 text-urgent border border-urgent/30 font-medium text-[10px] px-1.5 py-0 animate-pulse">
                <Clock className="mr-1 h-2.5 w-2.5" />
                {daysUntilDeadline}d left
              </Badge>
            )
          }
          rightAction={
            <OpportunityToolbar
              id={hackathon.id}
              title={hackathon.title}
              category="hackathon"
              organization={hackathon.organizer.name}
              applyUrl={hackathon.websiteUrl}
              location={hackathon.location}
              deadline={deadlineDate}
              isBookmarked={isBookmarked}
              onBookmarkToggle={handleBookmarkToggle}
            />
          }
          onTitleClick={() => navigate(`/hackathons/${hackathon.slug}`)}
        />

        {/* Specific Hackathon Metadata Grid (Prize Pool, Deadline, Team Size, Location/Mode) */}
        <OpportunityMeta>
          <OpportunityMetaItem
            icon={<Trophy className="h-3.5 w-3.5 text-hackathon" />}
            label="Prize Pool"
            value={hackathon.prizePool.formatted}
            highlight
          />
          <OpportunityMetaItem
            icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Deadline"
            value={formattedDeadline}
          />
          <OpportunityMetaItem
            icon={<Users className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Team Size"
            value={teamSizeLabel}
          />
          <OpportunityMetaItem
            icon={
              hackathon.mode === 'ONLINE' ? (
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              )
            }
            label="Location"
            value={hackathon.location || 'Global Online'}
          />
        </OpportunityMeta>

        {/* Themes / Tracks Tags */}
        <OpportunityTags tags={hackathon.themes} maxVisible={3} />
      </div>

      {/* Dual Button Footer: Sparkles "Get Ideas" Dialog + Gradient "Register Now" */}
      <OpportunityDualCTA
        category="hackathon"
        title={hackathon.title}
        organization={hackathon.organizer.name}
        primaryLabel="Register Now"
        externalUrl={hackathon.websiteUrl}
        customPrepPoints={[
          `AI/ML Agent workflow specialized for ${hackathon.themes[0] || 'rapid automation'}`,
          `Decentralized or privacy-preserving tool aligned with ${hackathon.organizer.name}'s mission`,
          'Interactive, zero-latency dashboard with real-time WebSockets or serverless pipeline',
          'Focus on an end-to-end demonstrable prototype with clear pitch deck & live demo URL',
        ]}
      />
    </OpportunityCard>
  );
};
