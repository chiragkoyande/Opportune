// ============================================================
// Opportune V4 — Hackathon Details Page
// Section 11: Dedicated Hackathon Details Layout
// Organizer, official website, deadline, event date, mode,
// location, prize pool, team size, eligibility, themes, technologies,
// description, rules, timeline, prizes, sponsors, FAQ.
// ============================================================

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Rocket,
  MapPin,
  Trophy,
  Users,
  Calendar,
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle2,
  Globe,
  Award,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/lib/seo';
import { hackathonsService } from '@/services/hackathons';
import { bookmarksService } from '@/services/bookmarks';
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorState } from '@/components/ui/StatusStates';
import { useToast } from '@/hooks/use-toast';

export const HackathonDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: hackathon, isLoading, isError, error } = useQuery({
    queryKey: ['hackathon', slug],
    queryFn: () => hackathonsService.getHackathonBySlug(slug!),
    enabled: Boolean(slug),
  });

  const [isBookmarked, setIsBookmarked] = useState(false);

  React.useEffect(() => {
    if (hackathon) {
      setIsBookmarked(bookmarksService.isBookmarked(hackathon.id));
    }
  }, [hackathon]);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError || !hackathon) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Hackathon Not Found"
          message={error instanceof Error ? error.message : "The requested hackathon challenge could not be located."}
          onRetry={() => navigate('/hackathons')}
        />
      </div>
    );
  }

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(hackathon.id);
        setIsBookmarked(false);
        toast({ title: 'Removed from saved hackathons' });
      } else {
        await bookmarksService.addBookmark({
          category: 'hackathons',
          targetId: hackathon.id,
          targetSlug: hackathon.slug,
          title: hackathon.title,
          organization: hackathon.organizer.name,
          logoUrl: hackathon.organizer.logoUrl,
          location: hackathon.location,
          meta: { prize: hackathon.prizePool.formatted, deadline: hackathon.registrationDeadline },
        });
        setIsBookmarked(true);
        toast({ title: 'Saved to bookmarks' });
      }
    } catch {
      toast({ title: 'Error updating bookmark', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${hackathon.title} by ${hackathon.organizer.name}`,
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
        title={`${hackathon.title} | Opportune`}
        description={`${hackathon.title} organized by ${hackathon.organizer.name}. Prize pool: ${hackathon.prizePool.formatted}. Mode: ${hackathon.mode}.`}
      />

      <Link
        to="/hackathons"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hackathons Explorer
      </Link>

      {/* Top Banner */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-secondary/40 border border-border/60 p-2 overflow-hidden flex items-center justify-center flex-shrink-0">
              {hackathon.organizer.logoUrl ? (
                <img src={hackathon.organizer.logoUrl} alt={hackathon.organizer.name} className="h-full w-full object-contain" />
              ) : (
                <Rocket className="h-8 w-8 text-hackathon" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {hackathon.title}
                </h1>
                {hackathon.organizer.verified && (
                  <span className="text-primary text-xs font-bold" title="Verified organizer">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-foreground">{hackathon.organizer.name}</span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs font-semibold uppercase text-hackathon">{hackathon.mode}</span>
                {hackathon.sourcePlatform && (
                  <>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs text-muted-foreground">via {hackathon.sourcePlatform}</span>
                  </>
                )}
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

        {/* Structured Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/40 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5 text-hackathon" />
              Total Prize Pool
            </span>
            <p className="font-bold text-foreground text-sm text-hackathon">
              {hackathon.prizePool.formatted}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-hackathon" />
              Registration Closes
            </span>
            <p className="font-semibold text-foreground">
              {new Date(hackathon.registrationDeadline).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Users className="h-3.5 w-3.5 text-hackathon" />
              Team Formation
            </span>
            <p className="font-semibold text-foreground">{hackathon.teamSize.formatted}</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Globe className="h-3.5 w-3.5 text-hackathon" />
              Event Mode & Location
            </span>
            <p className="font-semibold text-foreground capitalize">
              {hackathon.location || hackathon.mode}
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-6 border-t border-border/40">
          <Button asChild size="lg" className="h-11 bg-hackathon text-white hover:bg-hackathon/90 font-bold gap-2 text-sm flex-1">
            <a href={hackathon.officialUrl || hackathon.applyUrl} target="_blank" rel="noreferrer">
              Register on Official Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          {hackathon.officialUrl && hackathon.officialUrl !== hackathon.applyUrl && (
            <Button asChild variant="outline" size="lg" className="h-11 border-border/80 text-xs sm:text-sm font-semibold gap-2">
              <a href={hackathon.officialUrl} target="_blank" rel="noreferrer">
                Official Hackathon Page
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Main Details Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">Hackathon Overview</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {hackathon.description}
            </p>
          </div>

          {/* Prize Breakdown */}
          {hackathon.prizePool.prizes && hackathon.prizePool.prizes.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-hackathon" />
                <h2 className="font-display font-bold text-lg text-foreground">Prize Breakdown</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hackathon.prizePool.prizes.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/50 bg-secondary/30 space-y-1">
                    <span className="text-xs font-bold text-foreground">{p.title}</span>
                    <p className="font-display font-extrabold text-base text-hackathon">
                      {hackathon.prizePool.currency} {p.amount.toLocaleString()}
                    </p>
                    {p.description && <p className="text-[11px] text-muted-foreground">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {hackathon.timeline && hackathon.timeline.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-hackathon" />
                <h2 className="font-display font-bold text-lg text-foreground">Timeline & Milestones</h2>
              </div>
              <div className="space-y-4 border-l-2 border-border/60 ml-3 pl-4">
                {hackathon.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 bg-background ${
                        step.completed ? 'border-primary bg-primary' : 'border-border'
                      }`}
                    />
                    <p className="text-xs font-bold text-foreground">{step.title}</p>
                    <span className="text-[11px] text-muted-foreground">{step.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {hackathon.rules && hackathon.rules.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display font-bold text-lg text-foreground">Rules & Guidelines</h2>
              </div>
              <ul className="space-y-2.5">
                {hackathon.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-hackathon flex-shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQs */}
          {hackathon.faqs && hackathon.faqs.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold text-lg text-foreground">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-3">
                {hackathon.faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/40 bg-secondary/20 space-y-1">
                    <h4 className="text-xs font-bold text-foreground">{faq.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Eligibility */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-foreground">Eligibility</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{hackathon.eligibility}</p>
          </div>

          {/* Themes */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-foreground">Themes</h3>
            <div className="flex flex-wrap gap-2">
              {hackathon.themes.map((theme) => (
                <span
                  key={theme}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-hackathon/10 text-hackathon border border-hackathon/20"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-foreground">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {hackathon.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Sponsors */}
          {hackathon.sponsors && hackathon.sponsors.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-foreground">Partners & Sponsors</h3>
              <div className="flex flex-wrap gap-2">
                {hackathon.sponsors.map((sponsor, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl border border-border/50 bg-secondary/30 text-xs font-semibold"
                  >
                    {sponsor.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HackathonDetailPage;
