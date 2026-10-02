import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/types/opportunity';

interface DbOpportunity {
  id: string;
  title: string;
  type: string;
  organization: string;
  description: string;
  deadline: string;
  apply_url: string;
  location: string | null;
  prize: string | null;
  tags: string[] | null;
  source: string | null;
  is_active: boolean;
  created_at: string;
}

export const useDbOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
        .order('deadline', { ascending: true });

      if (fetchError) throw fetchError;

      const mapped: Opportunity[] = (data || []).map((item: DbOpportunity) => ({
        id: item.id,
        title: item.title,
        type: item.type as 'hackathon' | 'internship' | 'contest',
        organization: item.organization,
        description: item.description,
        deadline: new Date(item.deadline),
        applyUrl: item.apply_url,
        location: item.location || undefined,
        prize: item.prize || undefined,
        tags: item.tags || [],
        source: item.source || 'Admin',
      }));

      setOpportunities(mapped);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { opportunities, loading, error, refetch: fetchOpportunities };
};
