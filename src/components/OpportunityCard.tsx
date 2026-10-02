import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Opportunity, CATEGORY_META, getDaysUntilDeadline, formatDeadline, isUrgentDeadline } from '@/types/opportunity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, MapPin, Trophy, ExternalLink, Heart, Clock,
  Rocket, Briefcase, Zap, GraduationCap, GitBranch, Award,
  Building2, Microscope, School, BookOpen, Banknote,
  CheckCircle2, Users, Globe, ArrowRight
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { motion } from 'framer-motion';

interface OpportunityCardProps {
  opportunity: Opportunity;
  variant?: 'grid' | 'list';
}

/** Map category to Lucide icon component */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  hackathon: Rocket,
  internship: Briefcase,
  job: Building2,
  contest: Zap,
  scholarship: GraduationCap,
  fellowship: Award,
  open_source: GitBranch,
  research: Microscope,
  campus_hiring: School,
  competition: Trophy,
  grant: Banknote,
  bootcamp: BookOpen,
};

const OpportunityCard = ({ opportunity, variant = 'grid' }: OpportunityCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(opportunity.id);

  const daysLeft = getDaysUntilDeadline(opportunity.deadline);
  const urgent = isUrgentDeadline(opportunity.deadline);
  const expired = daysLeft < 0;

  const meta = CATEGORY_META[opportunity.category] || CATEGORY_META.hackathon;
  const CategoryIcon = CATEGORY_ICONS[opportunity.category] || Rocket;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Convert to legacy format for favorites system
    toggleFavorite({
      id: opportunity.id,
      title: opportunity.title,
      type: opportunity.category as 'hackathon' | 'internship' | 'contest',
      organization: opportunity.organization,
      description: opportunity.description,
      deadline: new Date(opportunity.deadline),
      applyUrl: opportunity.apply_url,
      location: opportunity.location || undefined,
      prize: opportunity.prize || undefined,
      tags: opportunity.tags,
      source: opportunity.source || '',
    });
  };

  const handleCardClick = () => {
    if (opportunity.slug) {
      navigate(`/opportunity/${opportunity.slug}`);
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={handleCardClick}
      className={`
        group relative overflow-hidden rounded-2xl border border-border/40
        bg-card/90 backdrop-blur-sm cursor-pointer
        transition-all duration-500 h-full
        hover:border-border/70 hover:shadow-lg hover:shadow-primary/5
        hover:-translate-y-1
        ${urgent ? 'ring-1 ring-urgent/20' : ''}
      `}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${meta.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      <div className="relative p-5">
        {/* Header row: Logo + Category + Actions */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            {/* Organization Logo */}
            <div className={`
              flex h-10 w-10 items-center justify-center rounded-xl
              bg-gradient-to-br ${meta.gradient} shadow-sm
              transition-transform duration-300 group-hover:scale-105
            `}>
              {opportunity.logo_url ? (
                <img
                  src={opportunity.logo_url}
                  alt={opportunity.organization}
                  className="h-6 w-6 rounded object-contain"
                  loading="lazy"
                />
              ) : (
                <CategoryIcon className="h-5 w-5 text-white" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">
                  {opportunity.organization}
                </span>
                {opportunity.organization_verified && (
                  <CheckCircle2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-4 mt-0.5 border-border/40 font-medium`}
              >
                {meta.label}
              </Badge>
            </div>
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={`
              p-1.5 rounded-full transition-all duration-300 flex-shrink-0
              ${favorited
                ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                : 'text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/10'
              }
            `}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 transition-all ${favorited ? 'fill-current scale-110' : 'group-hover:scale-105'}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold text-foreground leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors duration-300">
          {opportunity.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3.5">
          {opportunity.description}
        </p>

        {/* Metadata pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {/* Deadline */}
          <span className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
            ${urgent
              ? 'bg-urgent/10 text-urgent'
              : expired
                ? 'bg-muted text-muted-foreground line-through'
                : 'bg-secondary/70 text-secondary-foreground'
            }
          `}>
            {urgent ? <Clock className="h-2.5 w-2.5" /> : <Calendar className="h-2.5 w-2.5" />}
            {formatDeadline(opportunity.deadline)}
          </span>

          {/* Location */}
          {opportunity.location && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-secondary/70 text-secondary-foreground font-medium">
              <MapPin className="h-2.5 w-2.5" />
              {opportunity.location.length > 20 ? opportunity.location.slice(0, 20) + '…' : opportunity.location}
            </span>
          )}

          {/* Mode */}
          {opportunity.mode && opportunity.mode !== 'online' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-secondary/70 text-secondary-foreground font-medium capitalize">
              <Globe className="h-2.5 w-2.5" />
              {opportunity.mode}
            </span>
          )}

          {/* Prize */}
          {opportunity.prize && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
              <Trophy className="h-2.5 w-2.5" />
              {opportunity.prize}
            </span>
          )}

          {/* Team size */}
          {opportunity.team_size && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-secondary/70 text-secondary-foreground font-medium">
              <Users className="h-2.5 w-2.5" />
              {opportunity.team_size}
            </span>
          )}
        </div>

        {/* Tags */}
        {opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {opportunity.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {opportunity.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground/60 px-1 self-center">
                +{opportunity.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs border-border/40 bg-secondary/30 hover:bg-secondary/60 font-medium gap-1.5 group/btn"
            onClick={handleCardClick}
          >
            View Details
            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
          <Button
            size="sm"
            className={`flex-1 h-9 text-xs bg-gradient-to-r ${meta.gradient} text-white hover:opacity-90 font-medium shadow-sm`}
            asChild
            onClick={handleApply}
          >
            <a href={opportunity.apply_url} target="_blank" rel="noopener noreferrer">
              Apply
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>

      {/* Featured badge */}
      {opportunity.featured && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-amber-500/90 text-white text-[10px] px-1.5 py-0 h-4 font-medium shadow-sm">
            Featured
          </Badge>
        </div>
      )}
    </motion.article>
  );
};

export default memo(OpportunityCard);