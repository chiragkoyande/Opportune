// ============================================================
// Opportune V4 — Reusable Opportunity Card Primitives
// High-grade architectural primitives composed into category cards:
// JobCard, InternshipCard, HackathonCard, ContestCard
// Signature Opportune visual language: TiltCard 3D, Gradient top accent,
// Card shine hover, category glow shadow, toolbar, and Prep Guide dialog!
// ============================================================

import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Lightbulb,
  CheckCircle2,
  GitCompare,
  Heart,
  Bookmark,
  Calendar,
  Clock,
  Briefcase,
  Rocket,
  Zap,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TiltCard from '@/components/TiltCard';
import ShareMenu from '@/components/ShareMenu';
import CalendarMenu from '@/components/CalendarMenu';
import { useCompare } from '@/hooks/useCompare';
import { toast } from 'sonner';

// ============================================================
// Category Configurations
// ============================================================
export const CATEGORY_CARD_CONFIG = {
  job: {
    gradient: 'from-blue-600 to-indigo-600',
    textColor: 'text-job',
    bgColor: 'bg-job/10',
    borderColor: 'border-job/30',
    glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--job)/0.45)]',
    prepTitle: 'Interview Prep Tips',
    prepButtonText: 'Interview Prep',
    applyText: 'Apply Now',
    icon: Briefcase,
  },
  internship: {
    gradient: 'from-emerald-500 to-teal-500',
    textColor: 'text-internship',
    bgColor: 'bg-internship/10',
    borderColor: 'border-internship/30',
    glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--internship)/0.45)]',
    prepTitle: 'Internship Prep Guide',
    prepButtonText: 'Prep Guide',
    applyText: 'Apply Now',
    icon: GraduationCap,
  },
  hackathon: {
    gradient: 'from-purple-600 to-pink-500',
    textColor: 'text-hackathon',
    bgColor: 'bg-hackathon/10',
    borderColor: 'border-hackathon/30',
    glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--hackathon)/0.45)]',
    prepTitle: 'Hackathon Project Ideas',
    prepButtonText: 'Get Ideas',
    applyText: 'Register Now',
    icon: Rocket,
  },
  contest: {
    gradient: 'from-amber-500 to-orange-500',
    textColor: 'text-contest',
    bgColor: 'bg-contest/10',
    borderColor: 'border-contest/30',
    glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--contest)/0.45)]',
    prepTitle: 'Contest Strategy Tips',
    prepButtonText: 'Contest Tips',
    applyText: 'Join Contest',
    icon: Zap,
  },
};

// ============================================================
// 1. OpportunityCard Container (TiltCard 3D + Accent + Shine + Glow)
// ============================================================
export interface OpportunityCardProps extends React.HTMLAttributes<HTMLDivElement> {
  category?: 'job' | 'internship' | 'hackathon' | 'contest';
  featured?: boolean;
  isUrgent?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  category = 'job',
  featured = false,
  isUrgent = false,
  className,
  onClick,
  children,
  ...props
}) => {
  const config = CATEGORY_CARD_CONFIG[category] || CATEGORY_CARD_CONFIG.job;

  return (
    <TiltCard tiltMaxAngle={8} glareEnable={true} className="h-full">
      <div
        onClick={onClick}
        className={cn(
          'group relative h-full flex flex-col justify-between overflow-hidden rounded-2xl',
          'border border-border/50 bg-card/85 backdrop-blur-sm cursor-pointer',
          'transition-all duration-300 hover:border-border hover:shadow-xl',
          config.glowColor,
          featured && 'ring-1 ring-primary/40 bg-gradient-to-b from-card to-secondary/15',
          isUrgent && 'ring-1 ring-urgent/30',
          className
        )}
        {...props}
      >
        {/* Top gradient accent line */}
        <div className={cn('h-1 w-full bg-gradient-to-r', config.gradient)} />

        {/* Card shine effect overlay on hover */}
        <div className="absolute inset-0 bg-card-shine opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

        {/* Card Body */}
        <div className="relative p-5 flex flex-col flex-1 justify-between">
          {children}
        </div>
      </div>
    </TiltCard>
  );
};

// ============================================================
// 2. OpportunityHeader
// ============================================================
export interface OpportunityHeaderProps {
  title: string;
  subtitle: string;
  logoUrl?: string | null;
  fallbackIcon?: React.ReactNode;
  verified?: boolean;
  categoryBadge?: React.ReactNode;
  urgentBadge?: React.ReactNode;
  rightAction?: React.ReactNode;
  titleLink?: string;
  onTitleClick?: () => void;
}

export const OpportunityHeader: React.FC<OpportunityHeaderProps> = ({
  title,
  subtitle,
  logoUrl,
  fallbackIcon,
  verified,
  categoryBadge,
  urgentBadge,
  rightAction,
  onTitleClick,
}) => {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Logo / Icon container */}
        <div className="relative flex-shrink-0 h-11 w-11 rounded-xl border border-border/60 bg-secondary/40 overflow-hidden flex items-center justify-center p-1 shadow-sm">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={subtitle}
              className="h-full w-full object-contain rounded-lg"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : fallbackIcon ? (
            <div className="text-muted-foreground">{fallbackIcon}</div>
          ) : (
            <span className="font-bold text-sm text-foreground">
              {subtitle.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Title and Subtitle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3
              onClick={onTitleClick}
              className={cn(
                'font-display font-bold text-sm sm:text-base leading-snug tracking-tight text-foreground line-clamp-1',
                onTitleClick && 'cursor-pointer hover:text-primary transition-colors'
              )}
              title={title}
            >
              {title}
            </h3>
            {verified && (
              <span className="inline-flex text-[11px] text-blue-500 font-bold" title="Verified Organization">
                ✓
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[130px]">{subtitle}</span>
            {categoryBadge}
            {urgentBadge}
          </div>
        </div>
      </div>

      {/* Right top action toolbar */}
      {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
    </div>
  );
};

// ============================================================
// 3. OpportunityToolbar (Share, Calendar, Compare, Favorite)
// ============================================================
export interface OpportunityToolbarProps {
  id: string;
  title: string;
  category: 'job' | 'internship' | 'hackathon' | 'contest';
  organization: string;
  applyUrl?: string;
  location?: string;
  deadline?: Date | string | null;
  isBookmarked: boolean;
  onBookmarkToggle: (e: React.MouseEvent) => void;
}

export const OpportunityToolbar: React.FC<OpportunityToolbarProps> = ({
  id,
  title,
  category,
  organization,
  applyUrl,
  location,
  deadline,
  isBookmarked,
  onBookmarkToggle,
}) => {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const inCompare = isInCompare(id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(id);
      toast.info(`Removed "${title}" from compare`);
    } else if (canAddMore) {
      addToCompare({
        id,
        title,
        type: category,
        organization,
        applyUrl,
        location,
        deadline: deadline || undefined,
      });
      toast.success(`Added "${title}" to compare`);
    } else {
      toast.error('You can compare up to 3 opportunities');
    }
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <ShareMenu
        opportunity={{
          id,
          title,
          category,
          organization,
          applyUrl,
        }}
      />
      {deadline && (
        <CalendarMenu
          opportunity={{
            id,
            title,
            category,
            organization,
            applyUrl,
            location,
            deadline,
          }}
        />
      )}
      <button
        type="button"
        onClick={handleCompareClick}
        className={cn(
          'p-1.5 rounded-full transition-all duration-200',
          inCompare
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
        )}
        aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
        title={inCompare ? 'In comparison' : 'Compare'}
      >
        <GitCompare className={cn('h-3.5 w-3.5 transition-transform', inCompare && 'scale-110')} />
      </button>
      <button
        type="button"
        onClick={onBookmarkToggle}
        className={cn(
          'p-1.5 rounded-full transition-all duration-200',
          isBookmarked
            ? 'text-rose-500 bg-rose-500/10'
            : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'
        )}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        title={isBookmarked ? 'Saved' : 'Save'}
      >
        <Heart className={cn('h-3.5 w-3.5 transition-transform', isBookmarked && 'fill-current scale-110')} />
      </button>
    </div>
  );
};

// ============================================================
// 4. OpportunityMeta Container & Items
// ============================================================
export interface OpportunityMetaProps {
  children: React.ReactNode;
  className?: string;
}

export const OpportunityMeta: React.FC<OpportunityMetaProps> = ({ children, className }) => {
  return (
    <div className={cn('grid grid-cols-2 gap-2 py-3 border-y border-border/40 text-xs my-2', className)}>
      {children}
    </div>
  );
};

export interface OpportunityMetaItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export const OpportunityMetaItem: React.FC<OpportunityMetaItemProps> = ({
  icon,
  label,
  value,
  highlight = false,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <span className="text-muted-foreground flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
          {label}
        </span>
        <span
          className={cn(
            'text-xs font-medium truncate mt-0.5',
            highlight ? 'font-semibold text-foreground' : 'text-foreground/90'
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

// ============================================================
// 5. OpportunityTags
// ============================================================
export interface OpportunityTagsProps {
  tags: string[];
  maxVisible?: number;
  className?: string;
  tagClassName?: string;
}

export const OpportunityTags: React.FC<OpportunityTagsProps> = ({
  tags,
  maxVisible = 3,
  className,
  tagClassName,
}) => {
  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5 my-2.5', className)}>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/30',
            tagClassName
          )}
        >
          #{tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground/70 bg-muted/30">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

// ============================================================
// 6. OpportunityBookmark (Standalone icon button)
// ============================================================
export interface OpportunityBookmarkProps {
  isBookmarked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  title?: string;
}

export const OpportunityBookmark: React.FC<OpportunityBookmarkProps> = ({
  isBookmarked,
  onToggle,
  title = 'Bookmark opportunity',
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'p-1.5 rounded-lg border transition-all duration-200',
        isBookmarked
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-sm'
          : 'border-transparent text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
      )}
      title={title}
      aria-label={title}
    >
      <Heart className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
    </button>
  );
};

// ============================================================
// 7. OpportunityDualCTA (Prep Tips Button + Gradient CTA + Dialog)
// ============================================================
export interface OpportunityDualCTAProps {
  category?: 'job' | 'internship' | 'hackathon' | 'contest';
  title: string;
  organization: string;
  primaryLabel?: string;
  onPrimaryClick?: () => void;
  externalUrl?: string;
  customPrepPoints?: string[];
  secondaryAction?: React.ReactNode;
}

export const OpportunityDualCTA: React.FC<OpportunityDualCTAProps> = ({
  category = 'job',
  title,
  organization,
  primaryLabel,
  onPrimaryClick,
  externalUrl,
  customPrepPoints,
  secondaryAction,
}) => {
  const [showPrepDialog, setShowPrepDialog] = useState(false);
  const config = CATEGORY_CARD_CONFIG[category] || CATEGORY_CARD_CONFIG.job;

  const defaultPoints = {
    job: [
      `Review ${organization}'s engineering blog and core architecture`,
      'Practice LeetCode medium questions with focus on System Design and Algorithms',
      'Prepare 2 deep-dive stories highlighting technical trade-offs and business impact',
      'Prepare questions about team roadmap, deployment cadence, and mentorship',
    ],
    internship: [
      `Research ${organization}'s recent repositories and tech stack`,
      'Practice foundational DSA problems (Arrays, Trees, Graphs, Hash Maps)',
      'Have 2 portfolio projects ready with clean GitHub READMEs and live demos',
      'Prepare structured STAR-format responses for behavioral interview questions',
    ],
    hackathon: [
      'AI-driven prototype tackling real pain points in the designated track',
      'Real-time collaborative workspace with automated state synchronisation',
      'Decentralized or privacy-preserving verification mechanism for civic workflows',
      'Build a snappy interactive UI with clear metrics and demonstrable MVP flow',
    ],
    contest: [
      'Review standard library templates and fast I/O idioms beforehand',
      `Solve recent similar problems hosted on ${organization || 'the contest platform'}`,
      'Start with easy problems first to lock in leaderboard rank and baseline score',
      'Always read constraints and calculate time complexity bounds before coding',
    ],
  }[category];

  const prepPoints = customPrepPoints || defaultPoints;
  const ctaText = primaryLabel || config.applyText;

  return (
    <>
      <div
        className="flex items-center gap-2 pt-2 border-t border-border/30 mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-border/60 bg-secondary/50 hover:bg-secondary font-medium text-xs sm:text-sm h-9"
          onClick={() => setShowPrepDialog(true)}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accent" />
          {config.prepButtonText}
        </Button>

        {externalUrl ? (
          <Button
            size="sm"
            className={cn(
              'flex-1 text-white hover:opacity-90 font-medium text-xs sm:text-sm h-9 shadow-sm bg-gradient-to-r',
              config.gradient
            )}
            asChild
          >
            <a href={externalUrl} target="_blank" rel="noopener noreferrer">
              {ctaText}
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onPrimaryClick}
            className={cn(
              'flex-1 text-white hover:opacity-90 font-medium text-xs sm:text-sm h-9 shadow-sm bg-gradient-to-r',
              config.gradient
            )}
          >
            {ctaText}
          </Button>
        )}

        {secondaryAction}
      </div>

      {/* Prep Tips Dialog Modal */}
      <Dialog open={showPrepDialog} onOpenChange={setShowPrepDialog}>
        <DialogContent className="max-w-md bg-card border-border" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-lg">
              <Lightbulb className="h-5 w-5 text-accent" />
              {config.prepTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <h4 className="font-semibold text-foreground text-sm mb-0.5">{title}</h4>
              <p className="text-xs text-muted-foreground">{organization}</p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-medium text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className={cn('h-4 w-4', config.textColor)} />
                Strategic Preparation Checklist
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {prepPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className={cn('font-bold leading-tight', config.textColor)}>•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {externalUrl && (
              <Button
                className={cn('w-full text-white font-medium bg-gradient-to-r', config.gradient)}
                asChild
              >
                <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                  {ctaText}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Backwards compatible OpportunityCTA alias
export const OpportunityCTA = OpportunityDualCTA;

// ============================================================
// 8. OpportunityStatus Badge
// ============================================================
export interface OpportunityStatusProps {
  status: string;
  variant?: 'upcoming' | 'live' | 'completed' | 'open' | 'closing-soon' | 'closed';
}

export const OpportunityStatus: React.FC<OpportunityStatusProps> = ({ status, variant }) => {
  const badgeStyle = {
    upcoming: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    live: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 animate-pulse',
    completed: 'bg-muted text-muted-foreground border-border/50',
    open: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    'closing-soon': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    closed: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  }[variant || 'open'];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
        badgeStyle
      )}
    >
      {status}
    </span>
  );
};
