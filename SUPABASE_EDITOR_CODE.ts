// Copy this entire code into Supabase Edge Functions Editor
// Name the function: fetch-opportunities

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Opportunity {
  id: string;
  title: string;
  type: 'hackathon' | 'internship' | 'contest';
  organization: string;
  description: string;
  deadline: string;
  applyUrl: string;
  location: string;
  prize?: string;
  tags: string[];
  source: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching opportunities from external sources...');
    const opportunities: Opportunity[] = [];

    // 1. FETCH FROM KONTESTS API (Coding Contests - Always Works!)
    try {
      console.log('Fetching from Kontests API...');
      const kontestsResponse = await fetch('https://kontests.net/api/v1/all');
      
      if (kontestsResponse.ok) {
        const contests = await kontestsResponse.json();
        const upcomingContests = contests
          .filter((c: any) => c.status === 'BEFORE' || new Date(c.start_time) > new Date())
          .slice(0, 15);

        upcomingContests.forEach((contest: any, index: number) => {
          const siteMap: Record<string, string> = {
            'CodeForces': 'Codeforces',
            'CodeForces::Gym': 'Codeforces Gym',
            'TopCoder': 'TopCoder',
            'AtCoder': 'AtCoder',
            'CS Academy': 'CS Academy',
            'CodeChef': 'CodeChef',
            'HackerRank': 'HackerRank',
            'HackerEarth': 'HackerEarth',
            'LeetCode': 'LeetCode',
            'Toph': 'Toph',
          };

          const tags = ['Competitive Programming'];
          if (contest.site.toLowerCase().includes('codeforces')) tags.push('Algorithms');
          if (contest.site.toLowerCase().includes('leetcode')) tags.push('DSA');
          if (contest.site.toLowerCase().includes('atcoder')) tags.push('High Quality');

          opportunities.push({
            id: `contest-${index}`,
            title: contest.name,
            type: 'contest',
            organization: siteMap[contest.site] || contest.site,
            description: `Competitive programming contest. Duration: ${Math.round(parseInt(contest.duration) / 3600)} hours.`,
            deadline: contest.start_time,
            applyUrl: contest.url,
            location: 'Virtual',
            tags,
            source: `${contest.site} (Live)`,
          });
        });
        console.log(`✅ Fetched ${upcomingContests.length} contests from Kontests`);
      }
    } catch (error) {
      console.error('❌ Kontests API error:', error);
    }

    // 2. FETCH FROM FIRECRAWL (Web Scraping - Optional)
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (firecrawlApiKey) {
      console.log('Firecrawl API found, fetching live opportunities...');
      
      const searchQueries = [
        { query: 'upcoming hackathons 2025 registration open', source: 'Hackathons' },
        { query: 'Unstop competitions 2025 apply', source: 'Unstop' },
        { query: 'Devfolio hackathons India 2025', source: 'Devfolio' },
      ];

      for (const { query, source } of searchQueries) {
        try {
          const response = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              limit: 5,
              scrapeOptions: { formats: ['markdown'] },
            }),
          });

          if (!response.ok) {
            console.log(`Firecrawl search for ${source} returned ${response.status}`);
            continue;
          }

          const data = await response.json();

          if (data.success && data.data && Array.isArray(data.data)) {
            data.data.forEach((result: any, index: number) => {
              const title = result.title || `${source} Opportunity`;
              const description = result.description || 'Exciting opportunity to participate';
              
              opportunities.push({
                id: `${source.toLowerCase()}-${index}`,
                title: title.substring(0, 100),
                type: 'hackathon',
                organization: source,
                description: description.substring(0, 200),
                deadline: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
                applyUrl: result.url || '#',
                location: 'Virtual',
                tags: ['Featured'],
                source: `${source} (Live)`,
              });
            });
            console.log(`✅ Fetched ${data.data.length} opportunities from ${source}`);
          }
        } catch (error) {
          console.log(`⚠️ Firecrawl ${source} error:`, error instanceof Error ? error.message : error);
        }
      }
    } else {
      console.log('⚠️ FIRECRAWL_API_KEY not set, using Firecrawl would require API key');
      console.log('Add FIRECRAWL_API_KEY to your Supabase Secrets to enable web scraping');
    }

    // 3. FALLBACK CURATED DATA (Always Available)
    const curatedHackathons: Opportunity[] = [
      {
        id: 'hackathon-1',
        title: 'Smart India Hackathon 2025',
        type: 'hackathon',
        organization: 'Government of India',
        description: "India's largest open innovation model. Solve real government problems!",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://sih.gov.in/',
        location: 'India (Multiple Cities)',
        prize: '₹1,00,000',
        tags: ['Government', 'Innovation', 'National'],
        source: 'SIH (Curated)',
      },
      {
        id: 'hackathon-2',
        title: 'ETHIndia 2025',
        type: 'hackathon',
        organization: 'Devfolio',
        description: "Asia's largest Ethereum hackathon. 2000+ developers building Web3 future!",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://ethindia.co/',
        location: 'Bangalore, India',
        prize: '$50,000',
        tags: ['Web3', 'Blockchain', 'DeFi'],
        source: 'Devfolio (Curated)',
      },
      {
        id: 'hackathon-3',
        title: 'HackMIT 2025',
        type: 'hackathon',
        organization: 'MIT',
        description: 'One of the world\'s largest collegiate hackathons. Innovation at scale!',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://hackmit.org/',
        location: 'Cambridge, MA',
        prize: '$25,000',
        tags: ['Innovation', 'Tech', 'Global'],
        source: 'HackMIT (Curated)',
      },
      {
        id: 'hackathon-4',
        title: 'MLH Global Hack Week',
        type: 'hackathon',
        organization: 'Major League Hacking',
        description: 'A week-long celebration of building and learning. Perfect for hackers!',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://ghw.mlh.io/',
        location: 'Virtual',
        prize: '$10,000',
        tags: ['Learning', 'Community', 'Beginner Friendly'],
        source: 'MLH (Curated)',
      },
    ];

    // Add curated data to opportunities
    opportunities.push(...curatedHackathons);

    // Remove duplicates based on title similarity
    const uniqueOpportunities: Opportunity[] = [];
    const seenTitles = new Set<string>();
    
    for (const opp of opportunities) {
      const normalized = opp.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalized)) {
        seenTitles.add(normalized);
        uniqueOpportunities.push(opp);
      }
    }

    // Sort by deadline (upcoming first)
    uniqueOpportunities.sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    console.log(`📊 Total opportunities: ${uniqueOpportunities.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: uniqueOpportunities,
        scrapedAt: new Date().toISOString(),
        sources: firecrawlApiKey 
          ? ['Kontests API', 'Firecrawl Web Scraping'] 
          : ['Kontests API', 'Curated Data']
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        message: 'Failed to fetch opportunities'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
