// ============================================================
// Opportune V4 — Job Details Page
// Premium opportunity overview with verified metadata,
// requirements, company info, and application tracking action.
// ============================================================

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle2,
  Building2,
  Calendar,
  Sparkles,
  Kanban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/lib/seo';
import { jobsService } from '@/services/jobs';
import { bookmarksService } from '@/services/bookmarks';
import { applicationsService } from '@/services/applications';
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorState, EmptyState } from '@/components/ui/StatusStates';
import { useToast } from '@/hooks/use-toast';

export const JobDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['job', slug],
    queryFn: () => jobsService.getJobBySlug(slug!),
    enabled: Boolean(slug),
  });

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  React.useEffect(() => {
    if (job) {
      setIsBookmarked(bookmarksService.isBookmarked(job.id));
    }
  }, [job]);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Job Not Found"
          message={error instanceof Error ? error.message : "The requested job position could not be located."}
          onRetry={() => navigate('/jobs')}
        />
      </div>
    );
  }

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(job.id);
        setIsBookmarked(false);
        toast({ title: 'Removed from bookmarks' });
      } else {
        await bookmarksService.addBookmark({
          category: 'jobs',
          targetId: job.id,
          targetSlug: job.slug,
          title: job.title,
          organization: job.company.name,
          logoUrl: job.company.logoUrl,
          location: job.location,
          meta: { salary: job.salary?.formatted, employmentType: job.employmentType },
        });
        setIsBookmarked(true);
        toast({ title: 'Saved to bookmarks' });
      }
    } catch {
      toast({ title: 'Error updating bookmark', variant: 'destructive' });
    }
  };

  const handleTrackApplication = async () => {
    try {
      await applicationsService.createApplication({
        opportunityId: job.id,
        opportunityType: 'job',
        opportunityTitle: job.title,
        opportunitySlug: job.slug,
        companyName: job.company.name,
        companyLogoUrl: job.company.logoUrl,
        location: job.location,
        status: 'applied',
        notes: `Applied for ${job.title} at ${job.company.name}`,
      });
      setIsTracking(true);
      toast({
        title: 'Application Tracked!',
        description: 'Position added to your Kanban application tracker.',
      });
    } catch {
      toast({ title: 'Tracking error', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title={`${job.title} at ${job.company.name}`}
        description={`${job.title} job position at ${job.company.name}. Location: ${job.location}. Salary: ${job.salary?.formatted || 'Competitive'}.`}
      />

      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs Explorer
      </Link>

      {/* Top Banner / Hero Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-secondary/40 border border-border/60 p-2 overflow-hidden flex items-center justify-center flex-shrink-0">
              {job.company.logoUrl ? (
                <img src={job.company.logoUrl} alt={job.company.name} className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {job.title}
                </h1>
                {job.company.verified && (
                  <span className="text-primary text-xs font-bold" title="Verified company">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  to={`/companies/${job.company.slug}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {job.company.name}
                </Link>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground">{job.company.industry || 'Technology'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Save & Share) */}
          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmarkToggle}
              className={`h-9 gap-1.5 text-xs ${isBookmarked ? 'text-primary border-primary/40 bg-primary/10' : ''}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Saved' : 'Save Job'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="h-9 w-9 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Structured Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/40 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <DollarSign className="h-3.5 w-3.5 text-job" />
              Compensation
            </span>
            <p className="font-semibold text-foreground text-sm">
              {job.salary?.formatted || 'Competitive'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-job" />
              Location
            </span>
            <p className="font-semibold text-foreground">{job.location}</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Briefcase className="h-3.5 w-3.5 text-job" />
              Employment
            </span>
            <p className="font-semibold text-foreground capitalize">
              {job.employmentType} ({job.workplaceType})
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-job" />
              Posted Date
            </span>
            <p className="font-semibold text-foreground">
              {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-6 border-t border-border/40">
          <Button asChild size="lg" className="h-11 bg-job text-white hover:bg-job/90 font-bold gap-2 text-sm flex-1">
            <a href={job.applyUrl} target="_blank" rel="noreferrer">
              Apply on Official Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleTrackApplication}
            disabled={isTracking}
            className="h-11 border-border/80 text-xs sm:text-sm font-semibold gap-2"
          >
            <Kanban className="h-4 w-4 text-primary" />
            {isTracking ? 'Added to Application Tracker' : 'Track in Applications'}
          </Button>
        </div>
      </div>

      {/* Main Content: Description, Responsibilities, Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">About the Role</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">Key Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-job flex-shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">Role Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-job flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">Perks & Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map((b, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Skills & Company Snapshot */}
        <div className="space-y-6">
          {/* Required Skills */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-foreground">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-job/10 text-job border border-job/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Company Card */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground">About the Company</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/50 p-1 border border-border/60 overflow-hidden flex items-center justify-center">
                {job.company.logoUrl ? (
                  <img src={job.company.logoUrl} alt={job.company.name} className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{job.company.name}</h4>
                <p className="text-xs text-muted-foreground">{job.company.location || 'Technology'}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full text-xs border-border/60">
              <Link to={`/companies/${job.company.slug}`}>
                View Company Profile & Openings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
