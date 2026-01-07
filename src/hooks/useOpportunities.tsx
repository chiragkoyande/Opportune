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
         1️⃣ FETCH FROM SUPABASE DATABASE (Non-blocking)
         =============================== */
      let dbOpportunities: Opportunity[] = [];

      try {
        const { data: dbData, error: dbError } = await supabase
          .from('opportunities')
          .select('*')
          .eq('is_active', true)
          .order('deadline', { ascending: true });

        if (!dbError && dbData) {
          dbOpportunities = dbData.map((opp: DbOpportunity) => ({
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
        }
      } catch {
        // Silently fail - curated data will be used
      }

      /* ===============================
         2️⃣ FETCH LIVE OPPORTUNITIES (Fast Sources Only)
         =============================== */
      const liveOpportunities: Opportunity[] = [];

      /* ---------- API 1: Codeforces (Works reliably) ---------- */
      try {
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
        // Silently fail - curated data will be used
      }

      /* NOTE: CodeChef and HackerEarth APIs removed due to CORS blocking */

      /* ---------- Firecrawl Edge Function (Scraped Data) ---------- */
      try {
        const { data: scrapedData, error: fnError } = await supabase.functions.invoke('fetch-opportunities', {
          body: {}
        });

        if (!fnError && scrapedData?.success && scrapedData?.data) {
          scrapedData.data.forEach((opp: any) => {
            liveOpportunities.push({
              id: opp.id || `firecrawl-${Date.now()}-${Math.random()}`,
              title: opp.title,
              type: opp.type || 'hackathon',
              organization: opp.organization || 'Unknown',
              description: opp.description || 'Discover this exciting opportunity!',
              deadline: new Date(opp.deadline),
              applyUrl: opp.applyUrl || opp.url || '#',
              location: opp.location || 'Virtual',
              prize: opp.prize,
              tags: opp.tags || ['Scraped'],
              source: opp.source || 'Firecrawl',
            });
          });
        }
      } catch {
        // Silently fail - curated data will be used
      }

      /* ---------- Curated Hackathons ---------- */
      const curatedHackathons: Opportunity[] = [
        {
          id: 'sih-2026',
          title: 'Smart India Hackathon 2026',
          type: 'hackathon',
          organization: 'Government of India',
          description: 'India\'s largest open innovation platform - solve problems for government ministries',
          deadline: new Date('2026-09-15'),
          applyUrl: 'https://sih.gov.in/',
          location: 'India (Multiple Cities)',
          prize: '₹1,00,000+',
          tags: ['Government', 'India', 'National'],
          source: 'SIH Official',
        },
        {
          id: 'mlh-ghw-2026',
          title: 'MLH Global Hack Week 2026',
          type: 'hackathon',
          organization: 'Major League Hacking',
          description: 'Week-long hackathon celebration with 50K+ participants worldwide',
          deadline: new Date('2026-02-28'),
          applyUrl: 'https://ghw.mlh.io/',
          location: 'Global / Virtual',
          prize: '$10,000+',
          tags: ['MLH', 'Global', 'Beginner Friendly'],
          source: 'MLH Official',
        },
        {
          id: 'google-solution-2026',
          title: 'Google Solution Challenge 2026',
          type: 'hackathon',
          organization: 'Google GDSC',
          description: 'Build solutions addressing UN Sustainable Development Goals using Google tech',
          deadline: new Date('2026-03-31'),
          applyUrl: 'https://developers.google.com/community/gdsc-solution-challenge',
          location: 'Global',
          prize: '$10,000+',
          tags: ['Google', 'GDSC', 'UN SDGs'],
          source: 'Google Official',
        },
        {
          id: 'microsoft-imagine-2026',
          title: 'Microsoft Imagine Cup 2026',
          type: 'hackathon',
          organization: 'Microsoft',
          description: 'Premier global student technology competition - innovate with AI & Azure',
          deadline: new Date('2026-04-30'),
          applyUrl: 'https://imaginecup.microsoft.com/',
          location: 'Global',
          prize: '$100,000+',
          tags: ['Microsoft', 'AI', 'Azure', 'Students'],
          source: 'Microsoft Official',
        },
        {
          id: 'unstop-buildit-2026',
          title: 'BuildIt by Unstop 2026',
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
          id: 'ethglobal-2026',
          title: 'ETHGlobal Hackathon Series 2026',
          type: 'hackathon',
          organization: 'ETHGlobal',
          description: 'Build the future of Web3 and decentralized applications',
          deadline: new Date('2026-06-15'),
          applyUrl: 'https://ethglobal.com/',
          location: 'Multiple Cities + Virtual',
          prize: '$500,000+',
          tags: ['Web3', 'Ethereum', 'Blockchain'],
          source: 'ETHGlobal',
        },
        {
          id: 'nasa-space-apps-2026',
          title: 'NASA Space Apps Challenge 2026',
          type: 'hackathon',
          organization: 'NASA',
          description: 'Solve challenges using NASA open data - held in 200+ cities worldwide',
          deadline: new Date('2026-10-05'),
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
          id: 'gsoc-2026',
          title: 'Google Summer of Code 2026',
          type: 'internship',
          organization: 'Google',
          description: 'Contribute to open source projects with $1,500-$6,000 stipend',
          deadline: new Date('2026-04-02'),
          applyUrl: 'https://summerofcode.withgoogle.com/',
          location: 'Remote',
          prize: '$1,500 - $6,000',
          tags: ['Google', 'Open Source', 'Stipend'],
          source: 'Google GSoC',
        },
        {
          id: 'mlh-fellowship-2026',
          title: 'MLH Fellowship 2026',
          type: 'internship',
          organization: 'Major League Hacking',
          description: 'Remote internship alternative - work on real open source projects',
          deadline: new Date('2026-05-01'),
          applyUrl: 'https://fellowship.mlh.io/',
          location: 'Remote',
          prize: '$5,000 stipend',
          tags: ['MLH', 'Open Source', 'Remote'],
          source: 'MLH Fellowship',
        },
        {
          id: 'outreachy-2026',
          title: 'Outreachy Internship 2026',
          type: 'internship',
          organization: 'Outreachy',
          description: 'Paid internships in open source for underrepresented groups',
          deadline: new Date('2026-02-25'),
          applyUrl: 'https://www.outreachy.org/',
          location: 'Remote',
          prize: '$7,000 stipend',
          tags: ['Open Source', 'Diversity', 'Paid'],
          source: 'Outreachy',
        },
        {
          id: 'lfx-mentorship-2026',
          title: 'LFX Mentorship Program 2026',
          type: 'internship',
          organization: 'Linux Foundation',
          description: 'Get mentored while contributing to CNCF & Linux projects',
          deadline: new Date('2026-03-15'),
          applyUrl: 'https://mentorship.lfx.linuxfoundation.org/',
          location: 'Remote',
          prize: '$3,000 - $6,000',
          tags: ['Linux', 'CNCF', 'Kubernetes'],
          source: 'Linux Foundation',
        },
      ];

      liveOpportunities.push(...curatedInternships);

      // 🚀 IMMEDIATE DISPLAY: Show curated opportunities right away while live APIs load
      const currentDate = new Date();
      const earlyCurated = [...curatedHackathons, ...curatedInternships]
        .filter(opp => opp.deadline >= currentDate)
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

      if (earlyCurated.length > 0) {
        setOpportunities(earlyCurated);
        setLoading(false);
      }

      /* ---------- More Indian Hackathons & Opportunities (2026) ---------- */
      const moreIndianOpportunities: Opportunity[] = [
        // Unstop Hackathons
        {
          id: 'unstop-codefest-2026',
          title: 'CodeFest 2026 - Unstop',
          type: 'hackathon',
          organization: 'Unstop',
          description: 'National level coding hackathon with prizes worth ₹3 Lakhs',
          deadline: new Date(Date.now() + 30 * 86400000),
          applyUrl: 'https://unstop.com/hackathons',
          location: 'India / Virtual',
          prize: '₹3,00,000',
          tags: ['Unstop', 'Coding', 'India'],
          source: 'Unstop',
        },
        {
          id: 'unstop-innovate-2026',
          title: 'Innovation Challenge 2026',
          type: 'hackathon',
          organization: 'Unstop',
          description: 'Showcase your innovative ideas and win exciting prizes',
          deadline: new Date(Date.now() + 45 * 86400000),
          applyUrl: 'https://unstop.com/hackathons',
          location: 'India',
          prize: '₹2,00,000',
          tags: ['Innovation', 'India', 'Startup'],
          source: 'Unstop',
        },
        {
          id: 'unstop-techathon-2026',
          title: 'Techathon 2026',
          type: 'hackathon',
          organization: 'Unstop',
          description: 'Build solutions for real-world problems',
          deadline: new Date(Date.now() + 60 * 86400000),
          applyUrl: 'https://unstop.com/hackathons',
          location: 'India / Virtual',
          prize: '₹1,50,000',
          tags: ['Tech', 'India', 'Problem Solving'],
          source: 'Unstop',
        },
        // College Hackathons 2026
        {
          id: 'iit-bombay-techfest-2026',
          title: 'IIT Bombay Techfest 2026',
          type: 'hackathon',
          organization: 'IIT Bombay',
          description: 'Asia\'s largest science and technology festival',
          deadline: new Date('2026-12-20'),
          applyUrl: 'https://techfest.org/',
          location: 'Mumbai, India',
          prize: '₹10,00,000+',
          tags: ['IIT', 'Techfest', 'Mumbai'],
          source: 'IIT Bombay',
        },
        {
          id: 'iit-delhi-tryst-2026',
          title: 'Tryst IIT Delhi 2026',
          type: 'hackathon',
          organization: 'IIT Delhi',
          description: 'Annual technical festival with multiple competitions',
          deadline: new Date('2026-02-15'),
          applyUrl: 'https://tryst-iitd.org/',
          location: 'New Delhi, India',
          prize: '₹5,00,000+',
          tags: ['IIT', 'Delhi', 'Tech Fest'],
          source: 'IIT Delhi',
        },
        {
          id: 'bits-apogee-2026',
          title: 'BITS Pilani Apogee 2026',
          type: 'hackathon',
          organization: 'BITS Pilani',
          description: 'Technical festival featuring hackathons and coding contests',
          deadline: new Date('2026-03-10'),
          applyUrl: 'https://bits-apogee.org/',
          location: 'Pilani, India',
          prize: '₹3,00,000+',
          tags: ['BITS', 'Apogee', 'Rajasthan'],
          source: 'BITS Pilani',
        },
        {
          id: 'nit-trichy-pragyan-2026',
          title: 'Pragyan NIT Trichy 2026',
          type: 'hackathon',
          organization: 'NIT Trichy',
          description: 'ISO certified technical festival of South India',
          deadline: new Date('2026-02-28'),
          applyUrl: 'https://pragyan.org/',
          location: 'Trichy, India',
          prize: '₹2,00,000+',
          tags: ['NIT', 'Pragyan', 'Tamil Nadu'],
          source: 'NIT Trichy',
        },
        // Corporate Hackathons India 2026
        {
          id: 'tcs-codevita-2026',
          title: 'TCS CodeVita 2026',
          type: 'contest',
          organization: 'TCS',
          description: 'World\'s largest programming competition with job offers',
          deadline: new Date('2026-03-31'),
          applyUrl: 'https://www.tcscodevita.com/',
          location: 'Virtual / India',
          prize: '$20,000+',
          tags: ['TCS', 'Jobs', 'Coding'],
          source: 'TCS',
        },
        {
          id: 'infosys-hackwithinfy-2026',
          title: 'HackWithInfy 2026',
          type: 'hackathon',
          organization: 'Infosys',
          description: 'Coding contest for engineering students with PPO opportunities',
          deadline: new Date('2026-04-30'),
          applyUrl: 'https://www.infosys.com/careers/hackwithinfy.html',
          location: 'Virtual / India',
          prize: '₹2,00,000 + PPO',
          tags: ['Infosys', 'Jobs', 'Coding'],
          source: 'Infosys',
        },
        {
          id: 'flipkart-grid-2026',
          title: 'Flipkart GRiD 7.0',
          type: 'hackathon',
          organization: 'Flipkart',
          description: 'E-commerce challenge with pre-placement interviews',
          deadline: new Date('2026-05-15'),
          applyUrl: 'https://unstop.com/hackathons/flipkart-grid',
          location: 'Virtual / Bangalore',
          prize: '₹3,00,000 + Internship',
          tags: ['Flipkart', 'E-commerce', 'PPO'],
          source: 'Flipkart',
        },
        {
          id: 'amazon-ml-challenge-2026',
          title: 'Amazon ML Challenge 2026',
          type: 'contest',
          organization: 'Amazon',
          description: 'Machine learning competition for students',
          deadline: new Date('2026-06-01'),
          applyUrl: 'https://www.hackerearth.com/challenges/competitive/amazon-ml-challenge/',
          location: 'Virtual',
          prize: '₹5,00,000 + Internship',
          tags: ['Amazon', 'ML', 'AI'],
          source: 'Amazon',
        },
        {
          id: 'microsoft-engage-2026',
          title: 'Microsoft Engage 2026',
          type: 'internship',
          organization: 'Microsoft India',
          description: 'Mentorship program for engineering students',
          deadline: new Date('2026-05-20'),
          applyUrl: 'https://microsoft.acehacker.com/engage/',
          location: 'Virtual / India',
          prize: 'Internship + Mentorship',
          tags: ['Microsoft', 'Internship', 'Mentorship'],
          source: 'Microsoft India',
        },
        {
          id: 'google-coding-2026',
          title: 'Google Coding Competitions 2026',
          type: 'contest',
          organization: 'Google',
          description: 'Algorithmic competitions to test your coding skills',
          deadline: new Date('2026-04-15'),
          applyUrl: 'https://codingcompetitions.withgoogle.com/',
          location: 'Virtual',
          prize: 'Prizes + Job Opportunities',
          tags: ['Google', 'Algorithms', 'Global'],
          source: 'Google',
        },
        // Indian Internships 2026
        {
          id: 'swoc-2026',
          title: 'Social Winter of Code 2026',
          type: 'internship',
          organization: 'Script Foundation',
          description: 'Open source program for students to contribute to projects',
          deadline: new Date('2026-02-28'),
          applyUrl: 'https://swoc.tech/',
          location: 'Remote / India',
          prize: 'Certificates + Swags',
          tags: ['Open Source', 'Winter', 'India'],
          source: 'SWOC',
        },
        {
          id: 'gssoc-2026',
          title: 'GirlScript Summer of Code 2026',
          type: 'internship',
          organization: 'GirlScript Foundation',
          description: '3-month open source program focused on beginners',
          deadline: new Date('2026-03-15'),
          applyUrl: 'https://gssoc.girlscript.tech/',
          location: 'Remote / India',
          prize: 'Certificates + Goodies',
          tags: ['Open Source', 'Beginner', 'India'],
          source: 'GirlScript',
        },
        {
          id: 'kwoc-2026',
          title: 'Kharagpur Winter of Code 2026',
          type: 'internship',
          organization: 'IIT Kharagpur',
          description: 'Open source contribution program by KOSS IIT KGP',
          deadline: new Date('2026-12-31'),
          applyUrl: 'https://kwoc.kossiitkgp.org/',
          location: 'Remote / India',
          prize: 'Certificates + Swags',
          tags: ['IIT', 'Open Source', 'Kharagpur'],
          source: 'IIT Kharagpur',
        },
        // More Contests
        {
          id: 'leetcode-weekly',
          title: 'LeetCode Weekly Contests',
          type: 'contest',
          organization: 'LeetCode',
          description: 'Weekly algorithmic contests - Every Sunday',
          deadline: new Date(Date.now() + 7 * 86400000),
          applyUrl: 'https://leetcode.com/contest/',
          location: 'Virtual',
          tags: ['LeetCode', 'Weekly', 'Algorithms'],
          source: 'LeetCode',
        },
        {
          id: 'atcoder-beginner',
          title: 'AtCoder Beginner Contest',
          type: 'contest',
          organization: 'AtCoder',
          description: 'Weekly beginner-friendly programming contest',
          deadline: new Date(Date.now() + 5 * 86400000),
          applyUrl: 'https://atcoder.jp/contests/',
          location: 'Virtual',
          tags: ['AtCoder', 'Beginner', 'Japan'],
          source: 'AtCoder',
        },
        {
          id: 'hackerrank-week',
          title: 'HackerRank Week of Code',
          type: 'contest',
          organization: 'HackerRank',
          description: 'Multi-day algorithmic competition',
          deadline: new Date(Date.now() + 14 * 86400000),
          applyUrl: 'https://www.hackerrank.com/contests',
          location: 'Virtual',
          tags: ['HackerRank', 'Algorithms', 'Multi-day'],
          source: 'HackerRank',
        },
        // Tech Community Events
        {
          id: 'devfolio-hackathon',
          title: 'Devfolio Weekend Hackathons',
          type: 'hackathon',
          organization: 'Devfolio',
          description: 'Community hackathons happening every weekend across India',
          deadline: new Date(Date.now() + 10 * 86400000),
          applyUrl: 'https://devfolio.co/hackathons',
          location: 'India / Virtual',
          prize: 'Varies',
          tags: ['Devfolio', 'Weekend', 'Community'],
          source: 'Devfolio',
        },
        {
          id: 'mlh-local-hack',
          title: 'MLH Local Hack Day 2026',
          type: 'hackathon',
          organization: 'MLH',
          description: 'Build projects in your local community',
          deadline: new Date(Date.now() + 20 * 86400000),
          applyUrl: 'https://localhackday.mlh.io/',
          location: 'Multiple Cities',
          prize: 'Swags + Prizes',
          tags: ['MLH', 'Local', 'Community'],
          source: 'MLH',
        },
      ];

      liveOpportunities.push(...moreIndianOpportunities);

      /* ===============================
         3️⃣ MERGE + SORT + FILTER FUTURE ONLY
         =============================== */
      const now = new Date();

      // Filter live opportunities to only include future events
      const futureLiveOpportunities = liveOpportunities.filter(opp => {
        return opp.deadline >= now;
      });

      const seen = new Set<string>();
      const uniqueLive = futureLiveOpportunities.filter((opp) => {
        const key = opp.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Also filter DB opportunities to only show future events
      const futureDbOpportunities = dbOpportunities.filter(opp => opp.deadline >= now);

      const combined = [...futureDbOpportunities, ...uniqueLive];
      combined.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

      setOpportunities(combined);
      setLoading(false);
    } catch {
      setError('Failed to fetch opportunities');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { opportunities, loading, error, refetch: fetchOpportunities };
};
