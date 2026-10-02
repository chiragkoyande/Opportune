// ============================================================
// Opportune V4 — Internship Details Page
// Comprehensive internship overview with stipend breakdown,
// duration, PPO clarity, and direct application tracking.
// ============================================================

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  Coins,
  Hourglass,
  Calendar,
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle2,
  Building2,
  Award,
  Sparkles,
  Kanban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/lib/seo';
import { internshipsService } from '@/services/internships';
import { bookmarksService } from '@/services/bookmarks';
import { applicationsService } from '@/services/applications';
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorState } from '@/components/ui/StatusStates';
import { useToast } from '@/hooks/use-toast';

export const InternshipDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: internship, isLoading, isError, error } = useQuery({
    queryKey: ['internship', slug],
    queryFn: () => internshipsService.getInternshipBySlug(slug!),
    enabled: Boolean(slug),
  });

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  React.useEffect(() => {
    if (internship) {
      setIsBookmarked(bookmarksService.isBookmarked(internship.id));
    }
  }, [internship]);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError || !internship) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Internship Not Found"
          message={error instanceof Error ? error.message : "The requested internship could not be located."}
          onRetry={() => navigate('/internships')}
        />
      </div>
    );
  }

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(internship.id);
        setIsBookmarked(false);
        toast({ title: 'Removed from bookmarks' });
      } else {
        await bookmarksService.addBookmark({
          category: 'internships',
          targetId: internship.id,
          targetSlug: internship.slug,
          title: internship.title,
          organization: internship.company.name,
          logoUrl: internship.company.logoUrl,
          location: internship.location,
          meta: { stipend: internship.stipend?.formatted, duration: internship.duration.formatted },
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
        opportunityId: internship.id,
        opportunityType: 'internship',
        opportunityTitle: internship.title,
        opportunitySlug: internship.slug,
        companyName: internship.company.name,
        companyLogoUrl: internship.company.logoUrl,
        location: internship.location,
        status: 'applied',
        notes: `Applied for ${internship.title} at ${internship.company.name}`,
      });
      setIsTracking(true);
      toast({
        title: 'Application Tracked!',
        description: 'Internship added to your application tracker.',
      });
    } catch {
      toast({ title: 'Tracking error', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${internship.title} at ${internship.company.name}`,
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
        title={`${internship.title} at ${internship.company.name}`}
        description={`${internship.title} internship position at ${internship.company.name}. Stipend: ${internship.stipend?.formatted || 'Unpaid'}. Duration: ${internship.duration.formatted}.`}
      />

      <Link
        to="/internships"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Internships Explorer
      </Link>

      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-secondary/40 border border-border/60 p-2 overflow-hidden flex items-center justify-center flex-shrink-0">
              {internship.company.logoUrl ? (
                <img src={internship.company.logoUrl} alt={internship.company.name} className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {internship.title}
                </h1>
                {internship.ppoOffered && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-internship/10 text-internship border border-internship/30">
                    <Award className="h-3 w-3" />
                    PPO Included
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  to={`/companies/${internship.company.slug}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {internship.company.name}
                </Link>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground">{internship.location}</span>
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
              <Coins className="h-3.5 w-3.5 text-internship" />
              Monthly Stipend
            </span>
            <p className="font-semibold text-foreground text-sm">
              {internship.stipend?.formatted || 'Unpaid'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Hourglass className="h-3.5 w-3.5 text-internship" />
              Duration
            </span>
            <p className="font-semibold text-foreground">{internship.duration.formatted}</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-internship" />
              Start Date
            </span>
            <p className="font-semibold text-foreground">
              {internship.isImmediate ? 'Immediate' : internship.startDate}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-internship" />
              Work Mode
            </span>
            <p className="font-semibold text-foreground capitalize">
              {internship.workplaceType}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-6 border-t border-border/40">
          <Button asChild size="lg" className="h-11 bg-internship text-white hover:bg-internship/90 font-bold gap-2 text-sm flex-1">
            <a href={internship.applyUrl} target="_blank" rel="noreferrer">
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
            {isTracking ? 'Added to Tracker' : 'Track in Applications'}
          </Button>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">Internship Overview</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>
          </div>

          {internship.eligibility && internship.eligibility.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">Eligibility</h2>
              <ul className="space-y-2.5">
                {internship.eligibility.map((el, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-internship flex-shrink-0 mt-0.5" />
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {internship.perks && internship.perks.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">Perks & Learning Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {internship.perks.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-foreground">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-internship/10 text-internship border border-internship/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground">Company Information</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/50 p-1 border border-border/60 overflow-hidden flex items-center justify-center">
                {internship.company.logoUrl ? (
                  <img src={internship.company.logoUrl} alt={internship.company.name} className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{internship.company.name}</h4>
                <p className="text-xs text-muted-foreground">{internship.company.industry || 'Tech'}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full text-xs border-border/60">
              <Link to={`/companies/${internship.company.slug}`}>
                View Company Openings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailPage;
