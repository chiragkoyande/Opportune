import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Opportunity } from '@/types/opportunity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Trophy,
  ExternalLink,
  Sparkles,
  Rocket,
  Briefcase,
  Zap,
  Heart,
  Clock,
  Lightbulb,
  CheckCircle2,
  Loader2,
  GitCompare,
  DollarSign,
  Coins,
  Hourglass,
  Users
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCompare } from '@/hooks/useCompare';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TiltCard from './TiltCard';
import ShareMenu from './ShareMenu';
import CalendarMenu from './CalendarMenu';

interface OpportunityCardProps {
  opportunity: Opportunity;
  variant?: 'grid' | 'list';
}

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  
  const favorited = isFavorite(opportunity.id);
  const inCompare = isInCompare(opportunity.id);
  
  const [showIdeas, setShowIdeas] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  // Normalize deadline
  const deadlineDate = opportunity.deadline
    ? typeof opportunity.deadline === 'string'
      ? new Date(opportunity.deadline)
      : opportunity.deadline
    : new Date();

  const daysUntilDeadline = Math.ceil(
    (deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysUntilDeadline <= 5 && daysUntilDeadline > 0;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      ...opportunity,
      deadline: deadlineDate,
    });
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(opportunity.id);
      toast.info(`Removed "${opportunity.title}" from compare`);
    } else if (canAddMore) {
      addToCompare({
        id: opportunity.id,
        title: opportunity.title,
        type: opportunity.type || opportunity.category || 'opportunity',
        organization: opportunity.organization,
        description: opportunity.description,
        deadline: deadlineDate,
        applyUrl: opportunity.applyUrl || opportunity.apply_url,
        location: opportunity.location || undefined,
        prize: opportunity.prize || undefined,
        tags: opportunity.tags,
        source: opportunity.source || undefined,
      });
      toast.success(`Added "${opportunity.title}" to compare`);
    } else {
      toast.error('You can compare up to 3 opportunities');
    }
  };

  const handleCardClick = () => {
    if (opportunity.slug) {
      // Determine track route
      const oppType = (opportunity.type || opportunity.category || 'jobs').toLowerCase();
      if (oppType.includes('intern')) {
        navigate(`/internships/${opportunity.slug}`);
      } else if (oppType.includes('hack')) {
        navigate(`/hackathons/${opportunity.slug}`);
      } else if (oppType.includes('contest')) {
        navigate(`/contests/${opportunity.slug}`);
      } else {
        navigate(`/jobs/${opportunity.slug}`);
      }
    }
  };

  // Fetch or generate ideas when dialog opens
  useEffect(() => {
    if (showIdeas && ideas.length === 0 && !loadingIdeas) {
      fetchIdeas();
    }
  }, [showIdeas]);

  const fetchIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ideas', {
        body: {
          opportunity: {
            title: opportunity.title,
            organization: opportunity.organization,
            description: opportunity.description,
            type: opportunity.type,
            tags: opportunity.tags,
            prize: opportunity.prize,
            location: opportunity.location,
          },
        },
      });

      if (error) {
        setIdeas(getFallbackIdeas());
        return;
      }

      if (data?.ideas && Array.isArray(data.ideas) && data.ideas.length > 0) {
        setIdeas(data.ideas);
      } else {
        setIdeas(getFallbackIdeas());
      }
    } catch {
      setIdeas(getFallbackIdeas());
    } finally {
      setLoadingIdeas(false);
    }
  };

  const getFallbackIdeas = () => {
    const oppType = (opportunity.type || opportunity.category || '').toLowerCase();
    if (oppType.includes('job')) {
      return [
        `Review ${opportunity.organization}'s engineering blog and core architecture`,
        `Practice LeetCode medium questions with focus on ${opportunity.tags?.[0] || 'System Design'}`,
        'Prepare 2 deep-dive stories highlighting technical trade-offs and business impact',
        'Prepare questions about team roadmap, deployment cadence, and mentorship',
      ];
    } else if (oppType.includes('intern')) {
      return [
        `Research ${opportunity.organization}'s recent open-source repositories and tech stack`,
        'Practice foundational DSA problems (Arrays, Trees, Graphs, Hash Maps)',
        'Have 2 portfolio projects ready with clean GitHub READMEs and live demos',
        'Prepare structured responses for behavioural situational interviews',
      ];
    } else if (oppType.includes('hack')) {
      return [
        `AI-driven prototype tackling pain points in ${opportunity.tags?.[0] || 'developer tools'}`,
        'Real-time collaborative workspace with automated state synchronisation',
        'Decentralized or privacy-preserving verification mechanism for civic workflows',
        'Build a snappy interactive UI with clear metrics and demonstrable MVP flow',
      ];
    } else {
      return [
        'Review standard library templates and fast I/O idioms beforehand',
        `Solve recent similar problems hosted on ${opportunity.organization || 'the platform'}`,
        'Start with easy problems first to lock in leaderboard rank and baseline score',
        'Always read constraints and calculate time complexity bounds before coding',
      ];
    }
  };

  const oppType = (opportunity.type || opportunity.category || 'job').toLowerCase();

  const typeConfig: Record<
    string,
    {
      icon: typeof Briefcase;
      label: string;
      gradient: string;
      textColor: string;
      bgColor: string;
      borderColor: string;
      glowColor: string;
      actionText: string;
      prepText: string;
    }
  > = {
    job: {
      icon: Briefcase,
      label: 'Job',
      gradient: 'from-blue-600 to-indigo-600',
      textColor: 'text-job',
      bgColor: 'bg-job/10',
      borderColor: 'border-job/30',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--job)/0.5)]',
      actionText: 'Apply Now',
      prepText: 'Interview Prep',
    },
    internship: {
      icon: Briefcase,
      label: 'Internship',
      gradient: 'from-emerald-500 to-teal-500',
      textColor: 'text-internship',
      bgColor: 'bg-internship/10',
      borderColor: 'border-internship/30',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--internship)/0.5)]',
      actionText: 'Apply Now',
      prepText: 'Prep Guide',
    },
    hackathon: {
      icon: Rocket,
      label: 'Hackathon',
      gradient: 'from-purple-600 to-pink-500',
      textColor: 'text-hackathon',
      bgColor: 'bg-hackathon/10',
      borderColor: 'border-hackathon/30',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--hackathon)/0.5)]',
      actionText: 'Register',
      prepText: 'Get Ideas',
    },
    contest: {
      icon: Zap,
      label: 'Contest',
      gradient: 'from-amber-500 to-orange-500',
      textColor: 'text-contest',
      bgColor: 'bg-contest/10',
      borderColor: 'border-contest/30',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--contest)/0.5)]',
      actionText: 'Join Contest',
      prepText: 'Contest Tips',
    },
  };

  const key = Object.keys(typeConfig).find((k) => oppType.includes(k)) || 'job';
  const config = typeConfig[key];
  const Icon = config.icon;
  const applyUrl = opportunity.applyUrl || opportunity.apply_url || '#';

  return (
    <TiltCard tiltMaxAngle={8} glareEnable={true} className="h-full">
      <div
        onClick={handleCardClick}
        className={`
          group relative h-full flex flex-col justify-between overflow-hidden rounded-2xl
          border border-border/50 bg-card/85 backdrop-blur-sm cursor-pointer
          transition-all duration-300 hover:border-border hover:shadow-xl
          ${config.glowColor}
          ${isUrgent ? 'ring-1 ring-urgent/30' : ''}
        `}
      >
        {/* Top gradient accent line */}
        <div className={`h-1 w-full bg-gradient-to-r ${config.gradient}`} />

        {/* Card shine effect overlay on hover */}
        <div className="absolute inset-0 bg-card-shine opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

        <div className="relative p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Top row: Badges + Toolbar actions */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`${config.bgColor} ${config.textColor} ${config.borderColor} font-medium text-xs flex items-center gap-1 px-2.5 py-0.5`}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
                {isUrgent && (
                  <Badge className="bg-urgent/10 text-urgent border border-urgent/30 font-medium text-xs animate-pulse">
                    <Clock className="mr-1 h-3 w-3" />
                    {daysUntilDeadline}d left
                  </Badge>
                )}
              </div>

              {/* Action Buttons: Share, Calendar, Compare, Favorite */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <ShareMenu
                  opportunity={{
                    id: opportunity.id,
                    title: opportunity.title,
                    type: config.label,
                    organization: opportunity.organization,
                    applyUrl,
                  }}
                />
                <CalendarMenu
                  opportunity={{
                    id: opportunity.id,
                    title: opportunity.title,
                    type: config.label,
                    organization: opportunity.organization,
                    applyUrl,
                    location: opportunity.location || undefined,
                    deadline: deadlineDate,
                  }}
                />
                <button
                  type="button"
                  onClick={handleCompareClick}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    inCompare
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                  aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
                  title={inCompare ? 'In comparison' : 'Compare'}
                >
                  <GitCompare className={`h-4 w-4 transition-transform ${inCompare ? 'scale-110' : 'hover:scale-110'}`} />
                </button>
                <button
                  type="button"
                  onClick={handleFavoriteClick}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    favorited
                      ? 'text-rose-500 bg-rose-500/10'
                      : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'
                  }`}
                  aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  title={favorited ? 'Saved' : 'Save'}
                >
                  <Heart className={`h-4 w-4 transition-transform ${favorited ? 'fill-current scale-110' : 'hover:scale-110'}`} />
                </button>
              </div>
            </div>

            {/* Title & Organization */}
            <h3 className="mb-1 font-display text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {opportunity.title}
            </h3>
            <p className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="truncate max-w-[180px]">{opportunity.organization}</span>
              {opportunity.source && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground flex-shrink-0">
                  {opportunity.source}
                </span>
              )}
            </p>

            {/* Description */}
            <p className="mb-4 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {opportunity.description}
            </p>

            {/* Category-Tailored Meta info */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              {/* Category-specific prominent badges */}
              {key === 'job' && opportunity.salary && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-semibold">
                  <DollarSign className="h-3 w-3" />
                  {opportunity.salary}
                </span>
              )}
              {key === 'internship' && (opportunity.stipend || opportunity.prize) && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                  <Coins className="h-3 w-3" />
                  {opportunity.stipend || opportunity.prize}
                </span>
              )}
              {key === 'hackathon' && opportunity.prize && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 font-semibold">
                  <Trophy className="h-3 w-3" />
                  {opportunity.prize}
                </span>
              )}
              {key === 'contest' && opportunity.duration && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-semibold">
                  <Hourglass className="h-3 w-3" />
                  {opportunity.duration}
                </span>
              )}

              {/* Deadline pill */}
              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                  isUrgent ? 'bg-urgent/10 text-urgent' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <Calendar className="h-3 w-3" />
                {daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : 'Open'}
              </span>

              {/* Location */}
              {opportunity.location && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground truncate max-w-[140px]">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{opportunity.location}</span>
                </span>
              )}
            </div>

            {/* Tags */}
            {opportunity.tags && opportunity.tags.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-1.5">
                {opportunity.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
                {opportunity.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground/70 px-1 self-center">
                    +{opportunity.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Dual Action Footer Buttons */}
          <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-border/60 bg-secondary/50 hover:bg-secondary font-medium text-xs sm:text-sm h-10"
              onClick={() => setShowIdeas(true)}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accent" />
              {config.prepText}
            </Button>
            <Button
              size="sm"
              className={`flex-1 bg-gradient-to-r ${config.gradient} text-white hover:opacity-90 font-medium text-xs sm:text-sm h-10 shadow-sm`}
              asChild
            >
              <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                {config.actionText}
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Ideas / Prep Guide Dialog */}
        <Dialog open={showIdeas} onOpenChange={setShowIdeas}>
          <DialogContent className="max-w-md bg-card border-border" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Lightbulb className="h-5 w-5 text-accent" />
                {config.prepText}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <h4 className="font-semibold text-foreground mb-0.5">{opportunity.title}</h4>
                <p className="text-xs text-muted-foreground">{opportunity.organization}</p>
              </div>

              {loadingIdeas ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Generating personalized prep strategies...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${config.textColor}`} />
                    Recommended Action Points
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    {ideas.map((idea, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className={`${config.textColor} font-bold`}>•</span>
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                className={`w-full bg-gradient-to-r ${config.gradient} text-white font-medium`}
                asChild
              >
                <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                  {config.actionText}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TiltCard>
  );
};

export default memo(OpportunityCard);