// ============================================================
// Opportunity Detail Page — Premium view at /opportunity/:slug
// ============================================================

import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useOpportunityBySlug } from '@/hooks/useOpportunities';
import { useFavorites } from '@/hooks/useFavorites';
import { CATEGORY_META, formatDeadline, getDaysUntilDeadline, isUrgentDeadline } from '@/types/opportunity';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, ExternalLink, Heart, Share2, Calendar, MapPin,
  Trophy, Clock, Users, Globe, CheckCircle2, Building2,
  Rocket, Briefcase, Zap, GraduationCap, GitBranch, Award,
  Microscope, School, BookOpen, Banknote, Copy, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  hackathon: Rocket, internship: Briefcase, job: Building2, contest: Zap,
  scholarship: GraduationCap, fellowship: Award, open_source: GitBranch,
  research: Microscope, campus_hiring: School, competition: Trophy,
  grant: Banknote, bootcamp: BookOpen,
};

const OpportunityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: opportunity, isLoading, error } = useOpportunityBySlug(slug);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="max-w-4xl mx-auto animate-pulse space-y-6">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-48 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Opportunity Not Found</h1>
          <p className="text-muted-foreground mb-6">The opportunity you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/explore')} className="rounded-full">
            Browse Opportunities
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const meta = CATEGORY_META[opportunity.category] || CATEGORY_META.hackathon;
  const CategoryIcon = CATEGORY_ICONS[opportunity.category] || Rocket;
  const daysLeft = getDaysUntilDeadline(opportunity.deadline);
  const urgent = isUrgentDeadline(opportunity.deadline);
  const expired = daysLeft < 0;
  const favorited = isFavorite(opportunity.id);

  const handleFavorite = () => {
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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: opportunity.title,
          text: `Check out ${opportunity.title} on Opportune`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Section */}
              <div className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-sm overflow-hidden mb-6">
                {/* Top accent */}
                <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />

                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    {/* Logo */}
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} shadow-md flex-shrink-0`}>
                      {opportunity.logo_url ? (
                        <img src={opportunity.logo_url} alt={opportunity.organization} className="h-8 w-8 rounded object-contain" />
                      ) : (
                        <CategoryIcon className="h-7 w-7 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs font-medium capitalize border-border/40">
                          {meta.label}
                        </Badge>
                        {opportunity.organization_verified && (
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] gap-0.5 px-1.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                          </Badge>
                        )}
                        {urgent && (
                          <Badge className="bg-urgent/10 text-urgent border-urgent/30 text-xs animate-pulse">
                            <Clock className="mr-1 h-3 w-3" />
                            {daysLeft}d left
                          </Badge>
                        )}
                        {opportunity.featured && (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-1">
                        {opportunity.title}
                      </h1>

                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {opportunity.organization}
                        {opportunity.source && (
                          <>
                            <span className="text-border">•</span>
                            <span className="text-xs">via {opportunity.source}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <MetaItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="Deadline"
                      value={formatDeadline(opportunity.deadline)}
                      highlight={urgent}
                    />
                    {opportunity.location && (
                      <MetaItem
                        icon={<MapPin className="h-4 w-4" />}
                        label="Location"
                        value={opportunity.location}
                      />
                    )}
                    {opportunity.prize && (
                      <MetaItem
                        icon={<Trophy className="h-4 w-4" />}
                        label="Prize"
                        value={opportunity.prize}
                        highlight
                      />
                    )}
                    {opportunity.mode && (
                      <MetaItem
                        icon={<Globe className="h-4 w-4" />}
                        label="Mode"
                        value={opportunity.mode.charAt(0).toUpperCase() + opportunity.mode.slice(1)}
                      />
                    )}
                    {opportunity.team_size && (
                      <MetaItem
                        icon={<Users className="h-4 w-4" />}
                        label="Team Size"
                        value={opportunity.team_size}
                      />
                    )}
                    {opportunity.stipend && (
                      <MetaItem
                        icon={<Banknote className="h-4 w-4" />}
                        label="Stipend"
                        value={opportunity.stipend}
                        highlight
                      />
                    )}
                  </div>

                  {/* Tags */}
                  {opportunity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {opportunity.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      className={`bg-gradient-to-r ${meta.gradient} text-white hover:opacity-90 font-semibold shadow-md rounded-xl px-8`}
                      asChild
                      disabled={expired}
                    >
                      <a href={opportunity.apply_url} target="_blank" rel="noopener noreferrer">
                        {expired ? 'Deadline Passed' : 'Apply Now'}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleFavorite}
                      className={`rounded-xl border-border/50 ${favorited ? 'text-rose-500 bg-rose-500/5' : ''}`}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
                      {favorited ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleShare}
                      className="rounded-xl border-border/50"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-sm p-6 md:p-8 mb-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">About this Opportunity</h2>
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>

                {opportunity.eligibility && (
                  <div className="mt-6 pt-6 border-t border-border/30">
                    <h3 className="font-display text-base font-semibold text-foreground mb-2">Eligibility</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {opportunity.eligibility}
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              {(opportunity.start_date || opportunity.end_date) && (
                <div className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-sm p-6 md:p-8 mb-6">
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">Timeline</h2>
                  <div className="space-y-3">
                    {opportunity.start_date && (
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm text-muted-foreground">
                          Starts: {new Date(opportunity.start_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${urgent ? 'bg-urgent animate-pulse' : 'bg-amber-500'}`} />
                      <span className="text-sm text-muted-foreground">
                        Deadline: {new Date(opportunity.deadline).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    {opportunity.end_date && (
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-muted-foreground">
                          Ends: {new Date(opportunity.end_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Official Links */}
              {opportunity.official_url && (
                <div className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-sm p-6 md:p-8 mb-6">
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">Official Links</h2>
                  <a
                    href={opportunity.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Official Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface MetaItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

const MetaItem = ({ icon, label, value, highlight }: MetaItemProps) => (
  <div className={`rounded-xl p-3 ${highlight ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-secondary/30 border border-border/30'}`}>
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
    </div>
    <p className={`text-sm font-semibold ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
      {value}
    </p>
  </div>
);

export default OpportunityDetail;
