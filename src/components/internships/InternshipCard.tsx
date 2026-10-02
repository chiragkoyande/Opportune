// ============================================================
// Opportune V4 — InternshipCard Component
// Category-specific composition for Internships
// Displays: Company, Internship title, Location, Stipend,
// Duration, Start date, Skills, PPO status, Toolbar (Share, Compare, Heart),
// Prep Guide dialog, and Gradient CTA
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Coins, Calendar, Hourglass, Award, Clock } from 'lucide-react';
import { Internship } from '@/types/internship';
import {
  OpportunityCard,
  OpportunityHeader,
  OpportunityToolbar,
  OpportunityMeta,
  OpportunityMetaItem,
  OpportunityTags,
  OpportunityDualCTA,
} from '@/components/opportunity/OpportunityPrimitives';
import { bookmarksService } from '@/services/bookmarks';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface InternshipCardProps {
  internship: Internship;
  onBookmarkChange?: () => void;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({ internship, onBookmarkChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = React.useState(
    internship.isBookmarked ?? bookmarksService.isBookmarked(internship.id)
  );

  const deadlineDate = internship.deadline ? new Date(internship.deadline) : null;
  const daysUntilDeadline = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 5 && daysUntilDeadline > 0;

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(internship.id);
        setIsBookmarked(false);
        toast({ title: 'Bookmark removed', description: `${internship.title} removed from saved.` });
      } else {
        await bookmarksService.addBookmark({
          category: 'internships',
          targetId: internship.id,
          targetSlug: internship.slug,
          title: internship.title,
          organization: internship.company.name,
          logoUrl: internship.company.logoUrl,
          location: internship.location,
          meta: {
            stipend: internship.stipend?.formatted || 'Unpaid',
            duration: internship.duration.formatted,
          },
        });
        setIsBookmarked(true);
        toast({ title: 'Internship saved', description: `${internship.title} added to your saved list.` });
      }
      onBookmarkChange?.();
    } catch {
      toast({ title: 'Error', description: 'Could not update bookmark', variant: 'destructive' });
    }
  };

  return (
    <OpportunityCard
      category="internship"
      featured={internship.isFeatured}
      isUrgent={isUrgent}
      onClick={() => navigate(`/internships/${internship.slug}`)}
    >
      <div>
        {/* Header with Title, Company & Top-Right Toolbar (Share, Compare, Heart) */}
        <OpportunityHeader
          title={internship.title}
          subtitle={internship.company.name}
          logoUrl={internship.company.logoUrl}
          verified={internship.company.verified}
          categoryBadge={
            <div className="flex items-center gap-1.5 flex-wrap">
              {internship.ppoOffered ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-internship/10 text-internship border border-internship/20 uppercase tracking-wider">
                  <Award className="h-2.5 w-2.5" />
                  PPO Available
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-internship/10 text-internship border border-internship/20 uppercase tracking-wider">
                  Early Career
                </span>
              )}
              {internship.sourcePlatform && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary/80 text-foreground/80 border border-border/60 capitalize">
                  via {internship.sourcePlatform}
                </span>
              )}
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
              id={internship.id}
              title={internship.title}
              category="internship"
              organization={internship.company.name}
              applyUrl={internship.applyUrl}
              location={internship.location}
              deadline={deadlineDate}
              isBookmarked={isBookmarked}
              onBookmarkToggle={handleBookmarkToggle}
            />
          }
          onTitleClick={() => navigate(`/internships/${internship.slug}`)}
        />

        {/* Specific Internship Metadata Grid (Stipend, Duration, Location, Start Date) */}
        <OpportunityMeta>
          <OpportunityMetaItem
            icon={<Coins className="h-3.5 w-3.5 text-internship" />}
            label="Stipend"
            value={internship.stipend?.formatted || 'Unpaid'}
            highlight
          />
          <OpportunityMetaItem
            icon={<Hourglass className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Duration"
            value={internship.duration.formatted}
          />
          <OpportunityMetaItem
            icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Location"
            value={internship.location}
          />
          <OpportunityMetaItem
            icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Start Date"
            value={internship.startDate || 'Immediate'}
          />
        </OpportunityMeta>

        {/* Required Skills Tags */}
        <OpportunityTags tags={internship.skills} maxVisible={3} />
      </div>

      {/* Dual Button Footer: Sparkles "Prep Guide" Dialog + Gradient "Apply Now" */}
      <OpportunityDualCTA
        category="internship"
        title={internship.title}
        organization={internship.company.name}
        primaryLabel="Apply Now"
        externalUrl={internship.applyUrl}
        customPrepPoints={[
          `Research ${internship.company.name}'s mission, recent public projects, and stack (${internship.skills.slice(0, 3).join(', ')})`,
          'Practice foundational DSA topics on LeetCode (Arrays, Binary Search, Trees, Graphs)',
          'Prepare concise talking points on 2 flagship projects with clean GitHub code',
          'Practice explaining why you want to intern at this specific organization',
        ]}
      />
    </OpportunityCard>
  );
};
