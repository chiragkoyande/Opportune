const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified fetch-opportunities edge function
// This fetches opportunities from external APIs and returns them

interface KontestContest {
  name: string;
  url: string;
  start_time: string;
  end_time: string;
  duration: string;
  site: string;
  in_24_hours: string;
  status: string;
}

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

interface ScrapedHackathon {
  title: string;
  organization: string;
  description: string;
  deadline: string;
  url: string;
  location?: string;
  prize?: string;
  tags?: string[];
}

// Scrape hackathons from a platform using Firecrawl
async function scrapeHackathonsFromPlatform(
  apiKey: string,
  searchQuery: string,
  source: string
): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];
  
  try {
    console.log(`Searching for hackathons: ${searchQuery}`);
    
    // Use Firecrawl search to find hackathons
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl search failed for ${source}:`, response.status);
      return opportunities;
    }

    const data = await response.json();
    console.log(`Found ${data.data?.length || 0} results for ${source}`);

    // Parse the search results
    if (data.success && data.data) {
      data.data.forEach((result: any, index: number) => {
        // Extract info from search result
        const title = result.title || `Hackathon from ${source}`;
        const description = result.description || result.markdown?.substring(0, 200) || 'Join this exciting hackathon opportunity!';
        const url = result.url || '';
        
        // Extract date from markdown content if available
        let deadline = new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString();
        
        // Try to extract date patterns from content
        const datePatterns = [
          /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
          /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
          /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/
        ];
        
        const content = result.markdown || result.description || '';
        for (const pattern of datePatterns) {
          const match = content.match(pattern);
          if (match) {
            try {
              const parsedDate = new Date(match[0]);
              if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
                deadline = parsedDate.toISOString();
                break;
              }
            } catch (e) {
              // Continue with default date
            }
          }
        }

        // Extract location
        let location = 'Virtual';
        const locationPatterns = [
          /(?:Location|Venue|Where):\s*([^,\n]+)/i,
          /(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*(?:[A-Z]{2})?)/
        ];
        for (const pattern of locationPatterns) {
          const match = content.match(pattern);
          if (match) {
            location = match[1].trim();
            break;
          }
        }

        // Extract prize
        let prize: string | undefined;
        const prizePatterns = [
          /\$[\d,]+(?:\s*(?:in\s+)?prizes?)?/i,
          /₹[\d,]+(?:\s*(?:in\s+)?prizes?)?/i,
          /(?:prizes?\s+(?:worth|of)\s+)(\$[\d,]+|₹[\d,]+)/i
        ];
        for (const pattern of prizePatterns) {
          const match = content.match(pattern);
          if (match) {
            prize = match[0];
            break;
          }
        }

        // Generate tags from content
        const tags: string[] = [];
        const tagKeywords = {
          'AI': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning'],
          'Web3': ['web3', 'blockchain', 'crypto', 'defi', 'nft', 'ethereum'],
          'Mobile': ['mobile', 'ios', 'android', 'flutter', 'react native'],
          'Healthcare': ['health', 'medical', 'healthcare', 'biotech'],
          'FinTech': ['fintech', 'finance', 'banking', 'payment'],
          'EdTech': ['education', 'edtech', 'learning', 'students'],
          'Open Source': ['open source', 'oss', 'github'],
          'Climate': ['climate', 'sustainability', 'green', 'environment'],
        };

        const lowerContent = content.toLowerCase();
        for (const [tag, keywords] of Object.entries(tagKeywords)) {
          if (keywords.some(keyword => lowerContent.includes(keyword))) {
            tags.push(tag);
          }
        }
        if (tags.length === 0) tags.push('Innovation');

        opportunities.push({
          id: `scraped-${source.toLowerCase().replace(/\s+/g, '-')}-${index}`,
          title: title.length > 100 ? title.substring(0, 97) + '...' : title,
          type: 'hackathon',
          organization: source,
          description: description.length > 300 ? description.substring(0, 297) + '...' : description,
          deadline,
          applyUrl: url,
          location,
          prize,
          tags: tags.slice(0, 4),
          source: `${source} (Live)`,
        });
      });
    }
  } catch (error) {
    console.error(`Error scraping ${source}:`, error);
  }

  return opportunities;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching opportunities from external APIs and web scraping...');

    const opportunities: Opportunity[] = [];
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    // Parallel fetch from multiple sources
    const fetchPromises: Promise<void>[] = [];

    // 1. Fetch from Kontests API (Coding Contests) - Fast, reliable
    fetchPromises.push(
      (async () => {
        try {
          const kontestsResponse = await fetch('https://kontests.net/api/v1/all');
          if (kontestsResponse.ok) {
            const contests: KontestContest[] = await kontestsResponse.json();
            
            const upcomingContests = contests
              .filter(c => c.status === 'BEFORE' || new Date(c.start_time) > new Date())
              .slice(0, 15);

            upcomingContests.forEach((contest, index) => {
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
              if (contest.site.toLowerCase().includes('codechef')) tags.push('Rated');

              opportunities.push({
                id: `contest-${index}`,
                title: contest.name,
                type: 'contest',
                organization: siteMap[contest.site] || contest.site,
                description: `Competitive programming contest on ${contest.site}. Duration: ${Math.round(parseInt(contest.duration) / 3600)} hours.`,
                deadline: contest.start_time,
                applyUrl: contest.url,
                location: 'Virtual',
                tags,
                source: `${contest.site} (Live)`,
              });
            });
            console.log(`Fetched ${upcomingContests.length} contests from Kontests API`);
          }
        } catch (error) {
          console.error('Error fetching from Kontests API:', error);
        }
      })()
    );

    // 2. Scrape hackathons using Firecrawl if API key is available
    if (firecrawlApiKey) {
      // Scrape multiple hackathon platforms in parallel
      const scrapeQueries = [
        { query: 'upcoming hackathons 2025 registration open', source: 'Web Search' },
        { query: 'MLH hackathons 2025 students apply', source: 'MLH' },
        { query: 'Devpost hackathons online submissions open', source: 'Devpost' },
        { query: 'Devfolio hackathons India 2025 apply', source: 'Devfolio' },
        { query: 'Unstop hackathons competitions 2025', source: 'Unstop' },
      ];

      for (const { query, source } of scrapeQueries) {
        fetchPromises.push(
          (async () => {
            const scraped = await scrapeHackathonsFromPlatform(firecrawlApiKey, query, source);
            opportunities.push(...scraped);
          })()
        );
      }
    } else {
      console.log('FIRECRAWL_API_KEY not set, using curated data only');
      
      // Fallback curated hackathons
      const curatedHackathons: Opportunity[] = [
        {
          id: 'hackathon-1',
          title: 'MLH Global Hack Week',
          type: 'hackathon',
          organization: 'Major League Hacking',
          description: 'A week-long celebration of building, learning, and sharing. Perfect for beginners and experienced hackers alike.',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          applyUrl: 'https://ghw.mlh.io/',
          location: 'Virtual',
          prize: '$10,000',
          tags: ['AI/ML', 'Web3', 'Open Innovation'],
          source: 'MLH',
        },
        {
          id: 'hackathon-2',
          title: 'ETHIndia 2025',
          type: 'hackathon',
          organization: 'Devfolio',
          description: "Asia's largest Ethereum hackathon. Build the future of Web3 with 2000+ developers.",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          applyUrl: 'https://ethindia.co/',
          location: 'Bangalore, India',
          prize: '$50,000',
          tags: ['Web3', 'Blockchain', 'DeFi'],
          source: 'Devfolio',
        },
        {
          id: 'hackathon-3',
          title: 'HackMIT 2025',
          type: 'hackathon',
          organization: 'MIT',
          description: 'One of the largest and most prestigious collegiate hackathons in the world.',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          applyUrl: 'https://hackmit.org/',
          location: 'Cambridge, MA',
          prize: '$25,000',
          tags: ['Innovation', 'Tech', 'Open Theme'],
          source: 'HackMIT',
        },
        {
          id: 'hackathon-4',
          title: 'Smart India Hackathon 2025',
          type: 'hackathon',
          organization: 'Government of India',
          description: 'India\'s largest open innovation model to solve problems faced by government ministries.',
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          applyUrl: 'https://sih.gov.in/',
          location: 'India (Multiple Cities)',
          prize: '₹1,00,000',
          tags: ['Government', 'Innovation', 'National'],
          source: 'SIH',
        },
      ];
      opportunities.push(...curatedHackathons);
    }

    // Wait for all fetch operations to complete
    await Promise.all(fetchPromises);

    // Remove duplicates based on title similarity
    const uniqueOpportunities: Opportunity[] = [];
    const seenTitles = new Set<string>();
    
    for (const opp of opportunities) {
      const normalizedTitle = opp.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueOpportunities.push(opp);
      }
    }

    // Sort by deadline (upcoming first)
    uniqueOpportunities.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    console.log(`Total unique opportunities: ${uniqueOpportunities.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: uniqueOpportunities,
        scrapedAt: new Date().toISOString(),
        sources: firecrawlApiKey ? ['Kontests API', 'Firecrawl Web Scraping'] : ['Kontests API', 'Curated Data']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
