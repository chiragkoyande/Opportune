// ============================================================
// Opportune V4 — JobCard Component
// Category-specific composition for Jobs
// Displays: Company logo, Company, Job title, Location,
// Employment type, Experience, Salary, Skills, Posted date,
// Toolbar (Share, Compare, Heart), Prep Guide dialog, and Gradient CTA
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, DollarSign, Calendar } from 'lucide-react';
import { Job } from '@/types/job';
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

interface JobCardProps {
  job: Job;
  onBookmarkChange?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onBookmarkChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = React.useState(
    job.isBookmarked ?? bookmarksService.isBookmarked(job.id)
  );

  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const daysUntilDeadline = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 5 && daysUntilDeadline > 0;

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(job.id);
        setIsBookmarked(false);
        toast({ title: 'Bookmark removed', description: `${job.title} removed from saved.` });
      } else {
        await bookmarksService.addBookmark({
          category: 'jobs',
          targetId: job.id,
          targetSlug: job.slug,
          title: job.title,
          organization: job.company.name,
          logoUrl: job.company.logoUrl,
          location: job.location,
          meta: {
            salary: job.salary?.formatted || 'Not disclosed',
            experience: `${job.experienceYears?.min || 0}+ yrs`,
            employmentType: job.employmentType,
          },
        });
        setIsBookmarked(true);
        toast({ title: 'Job saved', description: `${job.title} added to your saved list.` });
      }
      onBookmarkChange?.();
    } catch {
      toast({ title: 'Error', description: 'Could not update bookmark', variant: 'destructive' });
    }
  };

  const experienceLabel = job.experienceYears
    ? `${job.experienceYears.min}${job.experienceYears.max ? `–${job.experienceYears.max}` : '+'} yrs`
    : job.seniority;

  return (
    <OpportunityCard
      category="job"
      featured={job.isFeatured}
      isUrgent={isUrgent}
      onClick={() => navigate(`/jobs/${job.slug}`)}
    >
      <div>
        {/* Header with Title, Company & Top-Right Toolbar (Share, Compare, Heart) */}
        <OpportunityHeader
          title={job.title}
          subtitle={job.company.name}
          logoUrl={job.company.logoUrl}
          verified={job.company.verified}
          categoryBadge={
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-job/10 text-job border border-job/20 uppercase tracking-wider">
                {job.employmentType}
              </span>
              {job.sourcePlatform && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary/80 text-foreground/80 border border-border/60 capitalize">
                  via {job.sourcePlatform}
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
              id={job.id}
              title={job.title}
              category="job"
              organization={job.company.name}
              applyUrl={job.applyUrl}
              location={job.location}
              deadline={deadlineDate}
              isBookmarked={isBookmarked}
              onBookmarkToggle={handleBookmarkToggle}
            />
          }
          onTitleClick={() => navigate(`/jobs/${job.slug}`)}
        />

        {/* Specific Job Metadata Grid (Salary, Experience, Workplace, Location) */}
        <OpportunityMeta>
          <OpportunityMetaItem
            icon={<DollarSign className="h-3.5 w-3.5 text-job" />}
            label="Salary"
            value={job.salary?.formatted || 'Competitive'}
            highlight
          />
          <OpportunityMetaItem
            icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Location"
            value={job.location}
          />
          <OpportunityMetaItem
            icon={<Briefcase className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Experience"
            value={experienceLabel}
          />
          <OpportunityMetaItem
            icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Workplace"
            value={job.workplaceType.toUpperCase()}
          />
        </OpportunityMeta>

        {/* Skills Tags */}
        <OpportunityTags tags={job.skills} maxVisible={3} />
      </div>

      {/* Dual Button Footer: Sparkles "Interview Prep" Dialog + Gradient "Apply Now" */}
      <OpportunityDualCTA
        category="job"
        title={job.title}
        organization={job.company.name}
        primaryLabel="Apply Now"
        externalUrl={job.applyUrl}
        customPrepPoints={[
          `Review ${job.company.name}'s engineering blog and tech stack (${job.skills.slice(0, 3).join(', ')})`,
          `Practice LeetCode medium questions with focus on ${job.skills[0] || 'System Design'}`,
          `Prepare 2 deep-dive stories highlighting experience with ${job.skills.slice(0, 2).join(' & ')}`,
          'Prepare questions about engineering culture, deployment cadence, and team impact',
        ]}
      />
    </OpportunityCard>
  );
};
