-- ============================================================
-- Opportune V3 Schema Redesign
-- Expands the opportunities table, adds new tables for
-- ingestion pipeline, user preferences, and analytics.
-- ============================================================

-- 1. Create opportunity_category enum (replaces the text CHECK constraint)
DO $$ BEGIN
  CREATE TYPE public.opportunity_category AS ENUM (
    'hackathon', 'internship', 'job', 'contest', 'scholarship',
    'fellowship', 'open_source', 'research', 'campus_hiring',
    'competition', 'grant', 'bootcamp'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.opportunity_mode AS ENUM ('online', 'offline', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.opportunity_status AS ENUM ('active', 'expired', 'upcoming', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.opportunity_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Expand the opportunities table
-- Drop the old CHECK constraint on type
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_type_check;

-- Add new columns
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS category opportunity_category DEFAULT 'hackathon',
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS mode opportunity_mode DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status opportunity_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS official_url TEXT,
  ADD COLUMN IF NOT EXISTS source_platform TEXT,
  ADD COLUMN IF NOT EXISTS eligibility TEXT,
  ADD COLUMN IF NOT EXISTS team_size TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS stipend TEXT,
  ADD COLUMN IF NOT EXISTS prizes_total NUMERIC,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS difficulty opportunity_difficulty DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bookmarks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applications INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS organization_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 3. Create slug generation function
CREATE OR REPLACE FUNCTION public.generate_opportunity_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 80);

  final_slug := base_slug;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.opportunities WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for auto slug generation
DROP TRIGGER IF EXISTS generate_slug_on_insert ON public.opportunities;
CREATE TRIGGER generate_slug_on_insert
  BEFORE INSERT ON public.opportunities
  FOR EACH ROW
  WHEN (NEW.slug IS NULL)
  EXECUTE FUNCTION public.generate_opportunity_slug();

-- 4. Full-text search vector update function
CREATE OR REPLACE FUNCTION public.update_opportunity_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.organization, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_search_vector ON public.opportunities;
CREATE TRIGGER update_search_vector
  BEFORE INSERT OR UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_opportunity_search_vector();

-- 5. Search RPC function
CREATE OR REPLACE FUNCTION public.search_opportunities(
  search_query TEXT,
  category_filter opportunity_category DEFAULT NULL,
  mode_filter opportunity_mode DEFAULT NULL,
  difficulty_filter opportunity_difficulty DEFAULT NULL,
  country_filter TEXT DEFAULT NULL,
  min_prize NUMERIC DEFAULT NULL,
  max_days_until_deadline INTEGER DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  page_size INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  description TEXT,
  organization TEXT,
  organization_verified BOOLEAN,
  logo_url TEXT,
  banner_url TEXT,
  category opportunity_category,
  mode opportunity_mode,
  deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status opportunity_status,
  apply_url TEXT,
  official_url TEXT,
  source TEXT,
  source_platform TEXT,
  tags TEXT[],
  eligibility TEXT,
  team_size TEXT,
  location TEXT,
  country TEXT,
  city TEXT,
  stipend TEXT,
  prize TEXT,
  prizes_total NUMERIC,
  currency TEXT,
  difficulty opportunity_difficulty,
  views INTEGER,
  bookmarks INTEGER,
  featured BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  relevance_score REAL,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ts_query tsquery;
  total BIGINT;
BEGIN
  -- Build tsquery from search input
  IF search_query IS NOT NULL AND search_query != '' THEN
    ts_query := plainto_tsquery('english', search_query);
  END IF;

  -- Get total count first
  SELECT count(*) INTO total
  FROM public.opportunities o
  WHERE o.is_active = true
    AND o.deadline >= now()
    AND (search_query IS NULL OR search_query = '' OR o.search_vector @@ ts_query)
    AND (category_filter IS NULL OR o.category = category_filter)
    AND (mode_filter IS NULL OR o.mode = mode_filter)
    AND (difficulty_filter IS NULL OR o.difficulty = difficulty_filter)
    AND (country_filter IS NULL OR o.country = country_filter)
    AND (min_prize IS NULL OR o.prizes_total >= min_prize)
    AND (max_days_until_deadline IS NULL OR o.deadline <= now() + (max_days_until_deadline || ' days')::interval);

  RETURN QUERY
  SELECT
    o.id, o.slug, o.title, o.description, o.organization,
    o.organization_verified, o.logo_url, o.banner_url, o.category, o.mode,
    o.deadline, o.start_date, o.end_date, o.status, o.apply_url,
    o.official_url, o.source, o.source_platform, o.tags, o.eligibility,
    o.team_size, o.location, o.country, o.city, o.stipend, o.prize,
    o.prizes_total, o.currency, o.difficulty, o.views, o.bookmarks,
    o.featured, o.created_at, o.updated_at,
    CASE
      WHEN ts_query IS NOT NULL THEN ts_rank_cd(o.search_vector, ts_query)
      ELSE 0.0
    END::REAL as relevance_score,
    total as total_count
  FROM public.opportunities o
  WHERE o.is_active = true
    AND o.deadline >= now()
    AND (search_query IS NULL OR search_query = '' OR o.search_vector @@ ts_query)
    AND (category_filter IS NULL OR o.category = category_filter)
    AND (mode_filter IS NULL OR o.mode = mode_filter)
    AND (difficulty_filter IS NULL OR o.difficulty = difficulty_filter)
    AND (country_filter IS NULL OR o.country = country_filter)
    AND (min_prize IS NULL OR o.prizes_total >= min_prize)
    AND (max_days_until_deadline IS NULL OR o.deadline <= now() + (max_days_until_deadline || ' days')::interval)
  ORDER BY
    CASE WHEN sort_by = 'relevance' AND ts_query IS NOT NULL THEN ts_rank_cd(o.search_vector, ts_query) END DESC NULLS LAST,
    CASE WHEN sort_by = 'deadline' THEN o.deadline END ASC,
    CASE WHEN sort_by = 'newest' THEN o.created_at END DESC,
    CASE WHEN sort_by = 'trending' THEN o.views END DESC,
    CASE WHEN sort_by = 'prize' THEN o.prizes_total END DESC NULLS LAST,
    o.featured DESC,
    o.deadline ASC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_search_vector
  ON public.opportunities USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_opportunities_category
  ON public.opportunities (category);

CREATE INDEX IF NOT EXISTS idx_opportunities_deadline
  ON public.opportunities (deadline);

CREATE INDEX IF NOT EXISTS idx_opportunities_status_deadline
  ON public.opportunities (is_active, deadline);

CREATE INDEX IF NOT EXISTS idx_opportunities_slug
  ON public.opportunities (slug);

CREATE INDEX IF NOT EXISTS idx_opportunities_tags
  ON public.opportunities USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_opportunities_featured
  ON public.opportunities (featured) WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_opportunities_country
  ON public.opportunities (country);

-- 7. Backfill: Migrate existing 'type' column to 'category'
UPDATE public.opportunities
SET category = type::opportunity_category
WHERE category IS NULL AND type IN ('hackathon', 'internship', 'contest');

-- Backfill search vectors for existing rows
UPDATE public.opportunities
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(organization, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'D')
WHERE search_vector IS NULL;

-- 8. User preferences table (for onboarding & recommendations)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  college TEXT,
  branch TEXT,
  degree TEXT,
  graduation_year INTEGER,
  cgpa NUMERIC(4,2),
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  preferred_roles TEXT[] DEFAULT '{}',
  preferred_companies TEXT[] DEFAULT '{}',
  preferred_cities TEXT[] DEFAULT '{}',
  preferred_categories opportunity_category[] DEFAULT '{}',
  career_goals TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Ingestion logs table (for data pipeline monitoring)
CREATE TABLE IF NOT EXISTS public.ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  opportunities_found INTEGER DEFAULT 0,
  opportunities_added INTEGER DEFAULT 0,
  opportunities_updated INTEGER DEFAULT 0,
  opportunities_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ingestion logs"
ON public.ingestion_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Opportunity views table (analytics)
CREATE TABLE IF NOT EXISTS public.opportunity_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_views_opp_id
  ON public.opportunity_views (opportunity_id);

ALTER TABLE public.opportunity_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert views"
ON public.opportunity_views FOR INSERT
WITH CHECK (true);

-- 11. Stats view for landing page
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_opportunities', (SELECT count(*) FROM public.opportunities WHERE is_active = true AND deadline >= now()),
    'total_hackathons', (SELECT count(*) FROM public.opportunities WHERE is_active = true AND deadline >= now() AND category = 'hackathon'),
    'total_internships', (SELECT count(*) FROM public.opportunities WHERE is_active = true AND deadline >= now() AND category = 'internship'),
    'total_contests', (SELECT count(*) FROM public.opportunities WHERE is_active = true AND deadline >= now() AND category = 'contest'),
    'total_scholarships', (SELECT count(*) FROM public.opportunities WHERE is_active = true AND deadline >= now() AND category = 'scholarship'),
    'total_users', (SELECT count(*) FROM public.profiles),
    'categories_count', 12,
    'sources_count', (SELECT count(DISTINCT source_platform) FROM public.opportunities WHERE source_platform IS NOT NULL)
  );
$$;
