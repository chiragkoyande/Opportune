import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Trash2, ExternalLink, Calendar, MapPin, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Opportunity } from '@/types/opportunity';
import { CompareProvider } from '@/hooks/useCompare';
import CompareBar from '@/components/CompareBar';

const Favorites = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const parseOpportunity = (data: unknown): Opportunity | null => {
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    return {
      id: String(obj.id || ''),
      title: String(obj.title || ''),
      type: obj.type as 'hackathon' | 'internship' | 'contest',
      organization: String(obj.organization || ''),
      description: String(obj.description || ''),
      deadline: new Date(String(obj.deadline || '')),
      applyUrl: String(obj.applyUrl || ''),
      location: obj.location ? String(obj.location) : undefined,
      prize: obj.prize ? String(obj.prize) : undefined,
      tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
      source: String(obj.source || ''),
    };
  };

  return (
    <CompareProvider>
      <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                My Favorites
              </h1>
              <p className="text-muted-foreground">
                {favorites.length} saved {favorites.length === 1 ? 'opportunity' : 'opportunities'}
              </p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring opportunities and save your favorites!
            </p>
            <Button onClick={() => navigate('/')} className="rounded-full">
              Browse Opportunities
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {favorites.map((fav) => {
              const opportunity = parseOpportunity(fav.opportunity_data);
              const daysUntilDeadline = opportunity 
                ? Math.ceil((opportunity.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : 0;
              
              return (
                <div
                  key={fav.id}
                  className="rounded-xl border-2 border-foreground/20 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {fav.opportunity_type}
                        </Badge>
                        {daysUntilDeadline > 0 && daysUntilDeadline <= 5 && (
                          <Badge className="bg-urgent text-urgent-foreground">
                            ⚡ {daysUntilDeadline} days left
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-display text-lg font-bold text-card-foreground mb-1">
                        {fav.opportunity_title}
                      </h3>
                      
                      {opportunity && (
                        <>
                          <p className="text-sm text-muted-foreground mb-3">
                            {opportunity.organization}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Deadline passed'}
                            </span>
                            {opportunity.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {opportunity.location}
                              </span>
                            )}
                            {opportunity.prize && (
                              <span className="flex items-center gap-1 font-semibold text-internship">
                                <Trophy className="h-3.5 w-3.5" />
                                {opportunity.prize}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {opportunity && (
                        <Button
                          size="sm"
                          className="rounded-full"
                          onClick={() => window.open(opportunity.applyUrl, '_blank')}
                        >
                          Apply
                          <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => removeFavorite(fav.opportunity_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
      <CompareBar />
      </div>
    </CompareProvider>
  );
};

export default Favorites;
