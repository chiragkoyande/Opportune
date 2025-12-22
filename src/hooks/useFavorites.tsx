import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Opportunity } from '@/types/opportunity';
import { Json } from '@/integrations/supabase/types';

interface Favorite {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  opportunity_type: string;
  opportunity_data: Json | null;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites((data || []) as Favorite[]);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const isFavorite = (opportunityId: string) => {
    return favorites.some(fav => fav.opportunity_id === opportunityId);
  };

  const addFavorite = async (opportunity: Opportunity) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const opportunityData = {
        ...opportunity,
        deadline: opportunity.deadline.toISOString(),
      };
      
      const { error } = await supabase.from('favorites').insert([{
        user_id: user.id,
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title,
        opportunity_type: opportunity.type,
        opportunity_data: opportunityData as unknown as Json,
      }]);

      if (error) throw error;

      await fetchFavorites();
      toast({
        title: 'Added to favorites',
        description: `${opportunity.title} has been saved.`,
      });
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to add to favorites.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeFavorite = async (opportunityId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId);

      if (error) throw error;

      await fetchFavorites();
      toast({
        title: 'Removed from favorites',
        description: 'Opportunity has been removed from your favorites.',
      });
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleFavorite = async (opportunity: Opportunity) => {
    if (isFavorite(opportunity.id)) {
      return removeFavorite(opportunity.id);
    } else {
      return addFavorite(opportunity);
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
};
