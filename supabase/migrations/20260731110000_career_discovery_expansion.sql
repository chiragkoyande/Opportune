-- ============================================================
-- Career Discovery Expansion
-- Adds broader ATS coverage, company metadata, admin helpers,
-- and fast job search/recommendation RPCs.
-- ============================================================

ALTER TYPE public.ats_platform ADD VALUE IF NOT EXISTS 'successfactors';
ALTER TYPE public.ats_platform ADD VALUE IF NOT EXISTS 'taleo';
ALTER TYPE public.ats_platform ADD VALUE IF NOT EXISTS 'icims';
ALTER TYPE public.ats_platform ADD VALUE IF NOT EXISTS 'personio';
ALTER TYPE public.ats_platform ADD VALUE IF NOT EXISTS 'comeet';
ALTER TYPE public.ats_platform ADD VALUE IF NOT EXISTS 'wellfound';
ALTER TYPE public.ats_platform ADD VALUE IF NOT EXISTS 'yc_jobs';

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS headquarters TEXT,
  ADD COLUMN IF NOT EXISTS hiring_status TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS discovered_from TEXT,
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 100;

CREATE INDEX IF NOT EXISTS idx_companies_hiring_status
  ON public.companies (hiring_status);

CREATE INDEX IF NOT EXISTS idx_companies_priority_sync
  ON public.companies (priority, next_sync_at)
  WHERE sync_enabled = true;

CREATE INDEX IF NOT EXISTS idx_jobs_posted_at
  ON public.jobs (posted_at DESC NULLS LAST);

CREATE OR REPLACE FUNCTION public.search_jobs(
  search_query TEXT DEFAULT NULL,
  company_filter UUID DEFAULT NULL,
  location_filter TEXT DEFAULT NULL,
  category_filter opportunity_category DEFAULT NULL,
  page_size INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  title TEXT,
  description TEXT,
  department TEXT,
  location TEXT,
  country TEXT,
  city TEXT,
  employment_type TEXT,
  workplace_type TEXT,
  seniority TEXT,
  category opportunity_category,
  apply_url TEXT,
  source_url TEXT,
  source_platform public.ats_platform,
  posted_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  company_name TEXT,
  company_slug TEXT,
  company_domain TEXT,
  company_logo_url TEXT,
  relevance_score REAL,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  web_query TSQUERY;
  total BIGINT;
BEGIN
  IF search_query IS NOT NULL AND search_query <> '' THEN
    web_query := websearch_to_tsquery('english', search_query);
  END IF;

  SELECT count(*) INTO total
  FROM public.jobs j
  JOIN public.companies c ON c.id = j.company_id
  WHERE j.status = 'open'
    AND (search_query IS NULL OR search_query = '' OR j.search_vector @@ web_query)
    AND (company_filter IS NULL OR j.company_id = company_filter)
    AND (location_filter IS NULL OR location_filter = '' OR j.location ILIKE '%' || location_filter || '%' OR j.city ILIKE '%' || location_filter || '%')
    AND (category_filter IS NULL OR j.category = category_filter);

  RETURN QUERY
  SELECT
    j.id, j.company_id, j.title, j.description, j.department, j.location,
    j.country, j.city, j.employment_type, j.workplace_type, j.seniority,
    j.category, j.apply_url, j.source_url, j.source_platform, j.posted_at,
    j.last_seen_at, c.name, c.slug, c.domain, c.logo_url,
    CASE WHEN search_query IS NOT NULL AND search_query <> '' THEN ts_rank_cd(j.search_vector, web_query) ELSE 0 END::REAL,
    total
  FROM public.jobs j
  JOIN public.companies c ON c.id = j.company_id
  WHERE j.status = 'open'
    AND (search_query IS NULL OR search_query = '' OR j.search_vector @@ web_query)
    AND (company_filter IS NULL OR j.company_id = company_filter)
    AND (location_filter IS NULL OR location_filter = '' OR j.location ILIKE '%' || location_filter || '%' OR j.city ILIKE '%' || location_filter || '%')
    AND (category_filter IS NULL OR j.category = category_filter)
  ORDER BY
    CASE WHEN search_query IS NOT NULL AND search_query <> '' THEN ts_rank_cd(j.search_vector, web_query) END DESC NULLS LAST,
    j.posted_at DESC NULLS LAST,
    j.last_seen_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_job_platform_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'companies', (SELECT count(*) FROM public.companies),
    'active_companies', (SELECT count(*) FROM public.companies WHERE sync_status = 'active'),
    'open_jobs', (SELECT count(*) FROM public.jobs WHERE status = 'open'),
    'internships', (SELECT count(*) FROM public.jobs WHERE status = 'open' AND category = 'internship'),
    'platforms', COALESCE((
      SELECT jsonb_object_agg(platform, count)
      FROM (
        SELECT coalesce(ats_platform::text, 'unknown') AS platform, count(*) AS count
        FROM public.companies
        GROUP BY coalesce(ats_platform::text, 'unknown')
      ) stats
    ), '{}'::jsonb)
  );
$$;
