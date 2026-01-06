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
              .slice(0, 10)
              .forEach((contest: any, idx: number) => {
                liveOpportunities.push({
                  id: `codeforces-${idx}`,
                  title: contest.name || 'Codeforces Contest',
                  type: 'contest',
                  organization: 'Codeforces',
                  description: `Competitive programming contest • Duration: ${Math.round(contest.durationSeconds / 3600)}h`,
                  deadline: new Date(contest.startTimeSeconds * 1000),
                  applyUrl: `https://codeforces.com/contest/${contest.id}`,
                  location: 'Virtual',
                  tags: ['Codeforces', 'Competitive', contest.type],
                  source: 'Codeforces (Live)',
                });
              });
          }
        }
      } catch {
        console.warn('Codeforces fetch failed');
      }

      /* ---------- API 2: CodeChef (LIVE) ---------- */
      try {
        console.log('API: CodeChef Contests');
        const response = await fetch('https://www.codechef.com/api/list/contests/all');

        if (response.ok) {
          const data = await response.json();
          if (data?.status === 'success' && data.future_contests) {
            data.future_contests.slice(0, 8).forEach((contest: any) => {
              liveOpportunities.push({
                id: `codechef-${contest.contest_code}`,
                title: contest.contest_name,
                type: 'contest',
                organization: 'CodeChef',
                description: `CodeChef rated contest • Duration: ${Math.round(parseInt(contest.contest_duration) / 60)}h`,
                deadline: new Date(contest.contest_start_date_iso),
                applyUrl: `https://www.codechef.com/${contest.contest_code}`,
                location: 'Virtual',
                tags: ['CodeChef', 'Competitive', 'Rated'],
                source: 'CodeChef (Live)',
              });
            });
          }
        }
      } catch {
        console.warn('CodeChef fetch failed');
      }

      /* ---------- Curated Hackathons ---------- */
      const curatedHackathons: Opportunity[] = [
        {
          id: 'sih-2025',
          title: 'Smart India Hackathon 2025',
          type: 'hackathon',
          organization: 'Government of India',
          description: 'India\'s largest open innovation platform - solve problems for government ministries',
          deadline: new Date('2025-09-15'),
          applyUrl: 'https://sih.gov.in/',
          location: 'India (Multiple Cities)',
          prize: '₹1,00,000+',
          tags: ['Government', 'India', 'National'],
          source: 'SIH Official',
        },
        {
          id: 'mlh-ghw-2025',
          title: 'MLH Global Hack Week',
          type: 'hackathon',
          organization: 'Major League Hacking',
          description: 'Week-long hackathon celebration with 50K+ participants worldwide',
          deadline: new Date('2025-02-28'),
          applyUrl: 'https://ghw.mlh.io/',
          location: 'Global / Virtual',
          prize: '$10,000+',
          tags: ['MLH', 'Global', 'Beginner Friendly'],
          source: 'MLH Official',
        },
        {
          id: 'google-solution-2025',
          title: 'Google Solution Challenge 2025',
          type: 'hackathon',
          organization: 'Google GDSC',
          description: 'Build solutions addressing UN Sustainable Development Goals using Google tech',
          deadline: new Date('2025-03-31'),
          applyUrl: 'https://developers.google.com/community/gdsc-solution-challenge',
          location: 'Global',
          prize: '$10,000+',
          tags: ['Google', 'GDSC', 'UN SDGs'],
          source: 'Google Official',
        },
        {
          id: 'microsoft-imagine-2025',
          title: 'Microsoft Imagine Cup 2025',
          type: 'hackathon',
          organization: 'Microsoft',
          description: 'Premier global student technology competition - innovate with AI & Azure',
          deadline: new Date('2025-04-30'),
          applyUrl: 'https://imaginecup.microsoft.com/',
          location: 'Global',
          prize: '$100,000+',
          tags: ['Microsoft', 'AI', 'Azure', 'Students'],
          source: 'Microsoft Official',
        },
        {
          id: 'unstop-buildit-2025',
          title: 'BuildIt by Unstop 2025',
          type: 'hackathon',
          organization: 'Unstop',
          description: 'Innovation hackathon with verified rewards and mentorship',
          deadline: new Date(Date.now() + 45 * 86400000),
          applyUrl: 'https://unstop.com/hackathons',
          location: 'India / Virtual',
          prize: '₹50,000+',
          tags: ['Unstop', 'India', 'Verified'],
          source: 'Unstop',
        },
        {
          id: 'ethglobal-2025',
          title: 'ETHGlobal Hackathon Series',
          type: 'hackathon',
          organization: 'ETHGlobal',
          description: 'Build the future of Web3 and decentralized applications',
          deadline: new Date('2025-06-15'),
          applyUrl: 'https://ethglobal.com/',
          location: 'Multiple Cities + Virtual',
          prize: '$500,000+',
          tags: ['Web3', 'Ethereum', 'Blockchain'],
          source: 'ETHGlobal',
        },
        {
          id: 'nasa-space-apps',
          title: 'NASA Space Apps Challenge 2025',
          type: 'hackathon',
          organization: 'NASA',
          description: 'Solve challenges using NASA open data - held in 200+ cities worldwide',
          deadline: new Date('2025-10-05'),
          applyUrl: 'https://www.spaceappschallenge.org/',
          location: 'Global (200+ cities)',
          prize: 'NASA Mentorship',
          tags: ['NASA', 'Space', 'Open Data'],
          source: 'NASA Official',
        },
      ];

      liveOpportunities.push(...curatedHackathons);

      /* ---------- Curated Internships ---------- */
      const curatedInternships: Opportunity[] = [
        {
          id: 'gsoc-2025',
          title: 'Google Summer of Code 2025',
          type: 'internship',
          organization: 'Google',
          description: 'Contribute to open source projects with $1,500-$6,000 stipend',
          deadline: new Date('2025-04-02'),
          applyUrl: 'https://summerofcode.withgoogle.com/',
          location: 'Remote',
          prize: '$1,500 - $6,000',
          tags: ['Google', 'Open Source', 'Stipend'],
          source: 'Google GSoC',
        },
        {
          id: 'mlh-fellowship-2025',
          title: 'MLH Fellowship 2025',
          type: 'internship',
          organization: 'Major League Hacking',
          description: 'Remote internship alternative - work on real open source projects',
          deadline: new Date('2025-05-01'),
          applyUrl: 'https://fellowship.mlh.io/',
          location: 'Remote',
          prize: '$5,000 stipend',
          tags: ['MLH', 'Open Source', 'Remote'],
          source: 'MLH Fellowship',
        },
        {
          id: 'outreachy-2025',
          title: 'Outreachy Internship 2025',
          type: 'internship',
          organization: 'Outreachy',
          description: 'Paid internships in open source for underrepresented groups',
          deadline: new Date('2025-02-25'),
          applyUrl: 'https://www.outreachy.org/',
          location: 'Remote',
          prize: '$7,000 stipend',
          tags: ['Open Source', 'Diversity', 'Paid'],
          source: 'Outreachy',
        },
        {
          id: 'lfx-mentorship-2025',
          title: 'LFX Mentorship Program',
          type: 'internship',
          organization: 'Linux Foundation',
          description: 'Get mentored while contributing to CNCF & Linux projects',
          deadline: new Date('2025-03-15'),
          applyUrl: 'https://mentorship.lfx.linuxfoundation.org/',
          location: 'Remote',
          prize: '$3,000 - $6,000',
          tags: ['Linux', 'CNCF', 'Kubernetes'],
          source: 'Linux Foundation',
        },
      ];

      liveOpportunities.push(...curatedInternships);

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
