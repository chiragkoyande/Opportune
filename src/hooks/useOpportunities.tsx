// ============================================================
// Opportune V3 — useOpportunities Hook
// Clean, production-grade hook that reads ONLY from the database.
// Uses TanStack Query for caching, deduplication, and pagination.
// No runtime scraping. No hardcoded data.
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Opportunity,
  OpportunityFilters,
  DEFAULT_FILTERS,
} from '@/types/opportunity';

interface UseOpportunitiesOptions {
  filters?: Partial<OpportunityFilters>;
  pageSize?: number;
  page?: number;
  enabled?: boolean;
}

interface UseOpportunitiesResult {
  opportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  refetch: () => void;
}

/** Map deadline filter to max days */
function getMaxDaysFromDeadlineFilter(filter: string): number | null {
  switch (filter) {
    case 'week': return 7;
    case 'month': return 30;
    case '3months': return 90;
    default: return null;
  }
}

export const useOpportunities = (
  options: UseOpportunitiesOptions = {}
): UseOpportunitiesResult => {
  const {
    filters: filterOverrides = {},
    pageSize = 24,
    page = 0,
    enabled = true,
  } = options;

  const filters: OpportunityFilters = { ...DEFAULT_FILTERS, ...filterOverrides };

  const queryKey = ['opportunities', filters, page, pageSize] as const;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const maxDays = getMaxDaysFromDeadlineFilter(filters.deadline);

      // Use the search RPC function for full-text search with server-side filtering
      const { data: results, error: rpcError } = await supabase.rpc(
        'search_opportunities',
        {
          search_query: filters.search || null,
          category_filter: filters.category !== 'all' ? filters.category : null,
          mode_filter: filters.mode !== 'all' ? filters.mode : null,
          difficulty_filter: filters.difficulty !== 'all' ? filters.difficulty : null,
          country_filter: filters.country !== 'all' ? filters.country : null,
          min_prize: filters.minPrize,
          max_days_until_deadline: maxDays,
          sort_by: filters.search ? 'relevance' : filters.sortBy,
          page_size: pageSize,
          page_offset: page * pageSize,
        }
      );

      if (rpcError) {
        // Fallback: direct table query if RPC doesn't exist yet (pre-migration)
        console.warn('RPC search_opportunities not available, falling back to direct query:', rpcError.message);
        return await fallbackQuery(filters, pageSize, page);
      }

      // The RPC returns rows with total_count embedded in each row
      const opportunities: Opportunity[] = (results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        slug: (row.slug as string) || '',
        title: row.title as string,
        description: row.description as string,
        organization: row.organization as string,
        organization_verified: (row.organization_verified as boolean) || false,
        logo_url: (row.logo_url as string) || null,
        banner_url: (row.banner_url as string) || null,
        category: (row.category as Opportunity['category']) || 'hackathon',
        mode: (row.mode as Opportunity['mode']) || 'online',
        deadline: row.deadline as string,
        start_date: (row.start_date as string) || null,
        end_date: (row.end_date as string) || null,
        status: (row.status as Opportunity['status']) || 'active',
        apply_url: row.apply_url as string,
        official_url: (row.official_url as string) || null,
        source: (row.source as string) || null,
        source_platform: (row.source_platform as string) || null,
        tags: (row.tags as string[]) || [],
        eligibility: (row.eligibility as string) || null,
        team_size: (row.team_size as string) || null,
        location: (row.location as string) || null,
        country: (row.country as string) || null,
        state: null,
        city: (row.city as string) || null,
        stipend: (row.stipend as string) || null,
        prize: (row.prize as string) || null,
        prizes_total: (row.prizes_total as number) || null,
        currency: (row.currency as string) || 'INR',
        difficulty: (row.difficulty as Opportunity['difficulty']) || 'beginner',
        views: (row.views as number) || 0,
        bookmarks: (row.bookmarks as number) || 0,
        applications: 0,
        featured: (row.featured as boolean) || false,
        is_active: true,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        relevance_score: (row.relevance_score as number) || 0,
        total_count: (row.total_count as number) || 0,
      }));

      const totalCount = opportunities.length > 0
        ? (opportunities[0].total_count || 0)
        : 0;

      return { opportunities, totalCount };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes cache
  });

  return {
    opportunities: data?.opportunities || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    totalCount: data?.totalCount || 0,
    totalPages: Math.ceil((data?.totalCount || 0) / pageSize),
    refetch,
  };
};

/**
 * Fallback query for when the search RPC function isn't deployed yet.
 * Uses direct Supabase table query with client-side filtering.
 */
async function fallbackQuery(
  filters: OpportunityFilters,
  pageSize: number,
  page: number
) {
  let query = supabase
    .from('opportunities')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .gte('deadline', new Date().toISOString())
    .order('deadline', { ascending: true })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  // Apply category filter using the legacy 'type' column
  if (filters.category !== 'all') {
    query = query.eq('type', filters.category);
  }

  // Apply text search (basic ILIKE)
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,organization.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw error;

  const opportunities: Opportunity[] = (data || []).map((row) => ({
    id: row.id,
    slug: (row as Record<string, unknown>).slug as string || '',
    title: row.title,
    description: row.description,
    organization: row.organization,
    organization_verified: false,
    logo_url: null,
    banner_url: null,
    category: (row.type as Opportunity['category']) || 'hackathon',
    mode: 'online' as const,
    deadline: row.deadline,
    start_date: null,
    end_date: null,
    status: 'active' as const,
    apply_url: row.apply_url,
    official_url: null,
    source: row.source,
    source_platform: null,
    tags: row.tags || [],
    eligibility: null,
    team_size: null,
    location: row.location,
    country: null,
    state: null,
    city: null,
    stipend: null,
    prize: row.prize,
    prizes_total: null,
    currency: 'INR',
    difficulty: 'beginner' as const,
    views: 0,
    bookmarks: 0,
    applications: 0,
    featured: false,
    is_active: true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return { opportunities, totalCount: count || 0 };
}

/**
 * Hook for fetching a single opportunity by slug.
 * Used on the opportunity details page.
 */
export const useOpportunityBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['opportunity', slug],
    queryFn: async () => {
      if (!slug) return null;

      // Try by slug first
      let { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      // If not found by slug, try by id (backward compat)
      if (!data && !error) {
        const result = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', slug)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      if (!data) return null;

      const row = data as Record<string, unknown>;
      return {
        id: row.id as string,
        slug: (row.slug as string) || '',
        title: row.title as string,
        description: row.description as string,
        organization: row.organization as string,
        organization_verified: (row.organization_verified as boolean) || false,
        logo_url: (row.logo_url as string) || null,
        banner_url: (row.banner_url as string) || null,
        category: ((row.category || row.type) as Opportunity['category']) || 'hackathon',
        mode: (row.mode as Opportunity['mode']) || 'online',
        deadline: row.deadline as string,
        start_date: (row.start_date as string) || null,
        end_date: (row.end_date as string) || null,
        status: (row.status as Opportunity['status']) || 'active',
        apply_url: row.apply_url as string,
        official_url: (row.official_url as string) || null,
        source: (row.source as string) || null,
        source_platform: (row.source_platform as string) || null,
        tags: (row.tags as string[]) || [],
        eligibility: (row.eligibility as string) || null,
        team_size: (row.team_size as string) || null,
        location: (row.location as string) || null,
        country: (row.country as string) || null,
        state: null,
        city: (row.city as string) || null,
        stipend: (row.stipend as string) || null,
        prize: (row.prize as string) || null,
        prizes_total: (row.prizes_total as number) || null,
        currency: (row.currency as string) || 'INR',
        difficulty: (row.difficulty as Opportunity['difficulty']) || 'beginner',
        views: (row.views as number) || 0,
        bookmarks: (row.bookmarks as number) || 0,
        applications: 0,
        featured: (row.featured as boolean) || false,
        is_active: (row.is_active as boolean) ?? true,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      } as Opportunity;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook for fetching featured opportunities (for landing page).
 */
export const useFeaturedOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true })
        .limit(12);

      if (error) throw error;

      return (data || []).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: r.id as string,
          slug: (r.slug as string) || '',
          title: r.title as string,
          description: r.description as string,
          organization: r.organization as string,
          organization_verified: (r.organization_verified as boolean) || false,
          logo_url: (r.logo_url as string) || null,
          banner_url: (r.banner_url as string) || null,
          category: ((r.category || r.type) as Opportunity['category']) || 'hackathon',
          mode: (r.mode as Opportunity['mode']) || 'online',
          deadline: r.deadline as string,
          start_date: (r.start_date as string) || null,
          end_date: (r.end_date as string) || null,
          status: (r.status as Opportunity['status']) || 'active',
          apply_url: r.apply_url as string,
          official_url: (r.official_url as string) || null,
          source: (r.source as string) || null,
          source_platform: (r.source_platform as string) || null,
          tags: (r.tags as string[]) || [],
          eligibility: (r.eligibility as string) || null,
          team_size: (r.team_size as string) || null,
          location: (r.location as string) || null,
          country: (r.country as string) || null,
          state: null,
          city: (r.city as string) || null,
          stipend: (r.stipend as string) || null,
          prize: (r.prize as string) || null,
          prizes_total: (r.prizes_total as number) || null,
          currency: (r.currency as string) || 'INR',
          difficulty: (r.difficulty as Opportunity['difficulty']) || 'beginner',
          views: (r.views as number) || 0,
          bookmarks: (r.bookmarks as number) || 0,
          applications: 0,
          featured: (r.featured as boolean) || false,
          is_active: true,
          created_at: r.created_at as string,
          updated_at: r.updated_at as string,
        } as Opportunity;
      });
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook for fetching platform statistics (for landing page).
 */
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_platform_stats');

      if (error) {
        // Fallback: manual count
        const { count } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('deadline', new Date().toISOString());

        return {
          total_opportunities: count || 0,
          total_hackathons: 0,
          total_internships: 0,
          total_contests: 0,
          total_scholarships: 0,
          total_users: 0,
          categories_count: 12,
          sources_count: 0,
        };
      }

      return data as unknown as {
        total_opportunities: number;
        total_hackathons: number;
        total_internships: number;
        total_contests: number;
        total_scholarships: number;
        total_users: number;
        categories_count: number;
        sources_count: number;
      };
    },
    staleTime: 1000 * 60 * 15, // 15 min cache for stats
  });
};
