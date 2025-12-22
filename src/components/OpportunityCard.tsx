import { useState, useEffect } from 'react';
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
  GitCompare
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
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
}

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const favorited = isFavorite(opportunity.id);
  const inCompare = isInCompare(opportunity.id);
  const [showIdeas, setShowIdeas] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  
  const daysUntilDeadline = Math.ceil(
    (opportunity.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysUntilDeadline <= 5 && daysUntilDeadline > 0;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(opportunity);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(opportunity.id);
    } else if (canAddMore) {
      addToCompare(opportunity);
      toast.success(`Added "${opportunity.title}" to compare`);
    } else {
      toast.error('You can compare up to 3 opportunities');
    }
  };

  // Fetch AI-generated ideas when dialog opens
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
            location: opportunity.location
          }
        }
      });

      if (error) throw error;
      
      if (data?.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
      toast.error('Failed to generate ideas. Please try again.');
      // Set fallback ideas
      setIdeas(getFallbackIdeas());
    } finally {
      setLoadingIdeas(false);
    }
  };

  const getFallbackIdeas = () => {
    if (opportunity.type === 'internship') {
      return [
        `Research ${opportunity.organization}'s recent projects and tech stack`,
        'Practice DSA problems on LeetCode (focus on medium difficulty)',
        'Prepare 2-3 projects to discuss in behavioral rounds',
        'Review system design basics if applying for senior roles'
      ];
    } else if (opportunity.type === 'hackathon') {
      return [
        `AI-powered tool that solves a real problem in ${opportunity.tags[0] || 'your domain'}`,
        'Sustainability tracker using IoT sensors and data visualization',
        'Decentralized app for community engagement or voting',
        'Mental health support chatbot with sentiment analysis'
      ];
    } else {
      return [
        'Start with easier problems to build confidence and score',
        `Practice similar past problems from ${opportunity.organization}`,
        'Keep a template ready for common algorithms',
        'Read all problems first before diving into solutions'
      ];
    }
  };

  const typeConfig = {
    hackathon: {
      icon: Rocket,
      label: 'Hackathon',
      gradient: 'from-hackathon to-hackathon/70',
      textColor: 'text-hackathon',
      bgColor: 'bg-hackathon/10',
      borderColor: 'border-hackathon/30',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--hackathon)/0.5)]',
    },
    internship: {
      icon: Briefcase,
      label: 'Internship',
      gradient: 'from-internship to-internship/70',
      textColor: 'text-internship',
      bgColor: 'bg-internship/10',
      borderColor: 'border-internship/30',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--internship)/0.5)]',
    },
    contest: {
      icon: Zap,
      label: 'Contest',
      gradient: 'from-contest to-contest/70',
      textColor: 'text-contest',
      bgColor: 'bg-contest/10',
      borderColor: 'border-contest/30',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_hsl(var(--contest)/0.5)]',
    },
  };

  const config = typeConfig[opportunity.type];
  const Icon = config.icon;

  return (
    <TiltCard tiltMaxAngle={8} glareEnable={true}>
      <div 
        className={`
          group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm
          transition-all duration-500 h-full
          ${config.glowColor}
          ${isUrgent ? 'glow-urgent' : ''}
        `}
      >
        {/* Top gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

        {/* Card shine effect */}
        <div className="absolute inset-0 bg-card-shine opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border font-medium`}>
              <Icon className="mr-1.5 h-3 w-3" />
              {config.label}
            </Badge>
            {isUrgent && (
              <Badge className="bg-urgent/10 text-urgent border border-urgent/30 font-medium animate-pulse">
                <Clock className="mr-1 h-3 w-3" />
                {daysUntilDeadline}d left
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ShareMenu opportunity={opportunity} />
            <CalendarMenu opportunity={opportunity} />
            <button
              onClick={handleCompareClick}
              className={`p-2 rounded-full transition-all duration-300 ${
                inCompare 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
              aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
            >
              <GitCompare className={`h-4 w-4 transition-transform ${inCompare ? 'scale-110' : 'hover:scale-110'}`} />
            </button>
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all duration-300 ${
                favorited 
                  ? 'text-urgent bg-urgent/10' 
                  : 'text-muted-foreground hover:text-urgent hover:bg-urgent/10'
              }`}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`h-4 w-4 transition-transform ${favorited ? 'fill-current scale-110' : 'hover:scale-110'}`} />
            </button>
          </div>
        </div>

        {/* Title & Org */}
        <h3 className="mb-1 font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {opportunity.title}
        </h3>
        <p className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
          {opportunity.organization}
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {opportunity.source}
          </span>
        </p>

        {/* Description */}
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Meta info */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${isUrgent ? 'bg-urgent/10 text-urgent' : 'bg-secondary text-secondary-foreground'}`}>
            <Calendar className="h-3 w-3" />
            {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Deadline passed'}
          </span>
          {opportunity.location && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              <MapPin className="h-3 w-3" />
              {opportunity.location}
            </span>
          )}
          {opportunity.prize && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-internship/10 text-internship font-medium">
              <Trophy className="h-3 w-3" />
              {opportunity.prize}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {opportunity.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
          {opportunity.tags.length > 3 && (
            <span className="text-xs text-muted-foreground px-1">
              +{opportunity.tags.length - 3}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-border/50 bg-secondary/50 hover:bg-secondary font-medium text-sm h-10"
            onClick={() => setShowIdeas(true)}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accent" />
            {opportunity.type === 'internship' ? 'Prep Guide' : 'Get Ideas'}
          </Button>
          <Button
            size="sm"
            className={`flex-1 bg-gradient-to-r ${config.gradient} text-foreground hover:opacity-90 font-medium text-sm h-10`}
            asChild
          >
            <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply Now
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Ideas/Prep Guide Dialog */}
      <Dialog open={showIdeas} onOpenChange={setShowIdeas}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-accent" />
              {opportunity.type === 'internship' ? 'Prep Guide' : 'Project Ideas'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <h4 className="font-semibold text-foreground mb-1">{opportunity.title}</h4>
              <p className="text-sm text-muted-foreground">{opportunity.organization}</p>
            </div>
            
            {loadingIdeas ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating personalized ideas...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  {opportunity.type === 'internship' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-internship" />
                      Interview Prep Tips
                    </>
                  ) : opportunity.type === 'hackathon' ? (
                    <>
                      <Rocket className="h-4 w-4 text-hackathon" />
                      Project Ideas
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 text-contest" />
                      Contest Tips
                    </>
                  )}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {ideas.map((idea, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={
                        opportunity.type === 'internship' ? 'text-internship' :
                        opportunity.type === 'hackathon' ? 'text-hackathon' : 'text-contest'
                      }>•</span>
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              asChild
            >
              <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer">
                Apply Now
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

export default OpportunityCard;