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
}

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      /* ===============================
         1️⃣ FETCH FROM SUPABASE DATABASE
         =============================== */
      const { data: dbData, error: dbError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
        .order('deadline', { ascending: true });

      if (dbError) throw dbError;

      const dbOpportunities: Opportunity[] = (dbData || []).map((opp: DbOpportunity) => ({
        id: opp.id,
        title: opp.title,
        type: opp.type as 'hackathon' | 'internship' | 'contest',
        organization: opp.organization,
        description: opp.description,
        deadline: new Date(opp.deadline),
        applyUrl: opp.apply_url,
        location: opp.location || undefined,
        prize: opp.prize || undefined,
        tags: opp.tags || [],
        source: opp.source || 'Admin',
      }));

      setOpportunities(dbOpportunities);
      setLoading(false);

      /* ===============================
         2️⃣ FETCH SAFE LIVE OPPORTUNITIES
         =============================== */
      console.log('Fetching live opportunities...');
      const liveOpportunities: Opportunity[] = [];

      /* ---------- API 1: Codeforces (SAFE) ---------- */
      try {
        console.log('API: Codeforces Contests');
        const response = await fetch('https://codeforces.com/api/contest.list?gym=false');

        if (response.ok) {
          const data = await response.json();
          if (data?.result) {
            data.result
              .filter(
                (c: any) =>
                  c.phase === 'BEFORE' &&
                  new Date(c.startTimeSeconds * 1000) > new Date()
              )
              .slice(0, 8)
              .forEach((contest: any, idx: number) => {
                liveOpportunities.push({
                  id: `codeforces-${idx}`,
                  title: contest.name || 'Codeforces Contest',
                  type: 'contest',
                  organization: 'Codeforces',
                  description: 'Competitive programming contest',
                  deadline: new Date(contest.startTimeSeconds * 1000),
                  applyUrl: `https://codeforces.com/contest/${contest.id}`,
                  location: 'Virtual',
                  tags: ['Codeforces', 'Competitive'],
                  source: 'Codeforces (Live)',
                });
              });
          }
        }
      } catch {
        console.warn('Codeforces fetch failed');
      }

      /* ---------- API 2: Unstop (CURATED) ---------- */
      const unstopHackathons: Opportunity[] = [
        {
          id: 'unstop-buildit-2025',
          title: 'BuildIt by Unstop 2025',
          type: 'hackathon',
          organization: 'Unstop',
          description: 'Innovation hackathon with verified rewards',
          deadline: new Date(Date.now() + 45 * 86400000),
          applyUrl: 'https://unstop.com/hackathons',
          location: 'India / Virtual',
          prize: '50000+',
          tags: ['Unstop', 'India', 'Verified'],
          source: 'Unstop (Curated)',
        },
        {
          id: 'unstop-codefest-2025',
          title: 'CodeFest 2025',
          type: 'hackathon',
          organization: 'Unstop',
          description: 'National level coding hackathon',
          deadline: new Date(Date.now() + 60 * 86400000),
          applyUrl: 'https://unstop.com/hackathons',
          location: 'India / Virtual',
          prize: '30000+',
          tags: ['Coding', 'India'],
          source: 'Unstop (Curated)',
        },
      ];

      liveOpportunities.push(...unstopHackathons);

      /* ---------- API 3: Verified Major Hackathons ---------- */
      const verifiedHackathons: Opportunity[] = [
        {
          id: 'sih-2025',
          title: 'Smart India Hackathon 2025',
          type: 'hackathon',
          organization: 'Government of India',
          description: 'National level innovation hackathon',
          deadline: new Date(Date.now() + 60 * 86400000),
          applyUrl: 'https://sih.gov.in/',
          location: 'India',
          prize: '100000+',
          tags: ['Government', 'India'],
          source: 'SIH Official',
        },
        {
          id: 'mlh-2025',
          title: 'MLH Global Hack Week 2025',
          type: 'hackathon',
          organization: 'Major League Hacking',
          description: 'Global hackathon series',
          deadline: new Date(Date.now() + 45 * 86400000),
          applyUrl: 'https://ghw.mlh.io/',
          location: 'Global',
          prize: '10000+',
          tags: ['Global', 'Verified'],
          source: 'MLH Official',
        },
      ];

      liveOpportunities.push(...verifiedHackathons);

      /* ===============================
         3️⃣ MERGE + SORT
         =============================== */
      const seen = new Set<string>();
      const uniqueLive = liveOpportunities.filter((opp) => {
        const key = opp.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const combined = [...dbOpportunities, ...uniqueLive];
      combined.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

      setOpportunities(combined);

      console.log(
        `SUCCESS: ${dbOpportunities.length} DB + ${uniqueLive.length} LIVE = ${combined.length} TOTAL`
      );
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { opportunities, loading, error, refetch: fetchOpportunities };
};
