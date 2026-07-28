-- ============================================================
-- Enterprise Career Discovery Foundation
-- Official company career-page aggregation for jobs/internships.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.ats_platform AS ENUM (
    'greenhouse',
    'lever',
    'workday',
    'ashby',
    'smartrecruiters',
    'bamboohr',
    'jobvite',
    'teamtailor',
    'recruitee',
    'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.company_sync_status AS ENUM (
    'pending',
    'active',
    'disabled',
    'error'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.job_record_status AS ENUM (
    'open',
    'closed',
    'draft',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.job_sync_run_status AS ENUM (
    'running',
    'success',
    'partial_success',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL UNIQUE,
  website_url TEXT NOT NULL,
  careers_url TEXT,
  ats_platform public.ats_platform,
  ats_identifier TEXT,
  ats_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sync_status public.company_sync_status NOT NULL DEFAULT 'pending',
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  sync_interval_minutes INTEGER NOT NULL DEFAULT 360 CHECK (sync_interval_minutes >= 60),
  last_discovered_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  last_successful_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT companies_domain_format CHECK (domain !~* '^https?://')
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  team TEXT,
  location TEXT,
  country TEXT,
  city TEXT,
  employment_type TEXT,
  workplace_type TEXT,
  seniority TEXT,
  category opportunity_category NOT NULL DEFAULT 'job',
  status public.job_record_status NOT NULL DEFAULT 'open',
  apply_url TEXT NOT NULL,
  source_url TEXT,
  source_platform public.ats_platform NOT NULL,
  posted_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT NOT NULL,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, source_platform, external_id)
);

CREATE TABLE IF NOT EXISTS public.job_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status public.job_sync_run_status NOT NULL DEFAULT 'running',
  trigger_source TEXT NOT NULL DEFAULT 'scheduled',
  companies_checked INTEGER NOT NULL DEFAULT 0,
  companies_succeeded INTEGER NOT NULL DEFAULT 0,
  companies_failed INTEGER NOT NULL DEFAULT 0,
  jobs_seen INTEGER NOT NULL DEFAULT 0,
  jobs_upserted INTEGER NOT NULL DEFAULT 0,
  jobs_closed INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.company_sync_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  sync_run_id UUID REFERENCES public.job_sync_runs(id) ON DELETE CASCADE,
  platform public.ats_platform,
  stage TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_sync_health (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_status public.job_sync_run_status,
  consecutive_failed_runs INTEGER NOT NULL DEFAULT 0,
  stale_company_count INTEGER NOT NULL DEFAULT 0,
  open_job_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.job_sync_health (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_companies_sync_due
  ON public.companies (sync_enabled, next_sync_at)
  WHERE sync_enabled = true;

CREATE INDEX IF NOT EXISTS idx_companies_ats_platform
  ON public.companies (ats_platform);

CREATE INDEX IF NOT EXISTS idx_jobs_company_status
  ON public.jobs (company_id, status);

CREATE INDEX IF NOT EXISTS idx_jobs_platform_external
  ON public.jobs (source_platform, external_id);

CREATE INDEX IF NOT EXISTS idx_jobs_location
  ON public.jobs (country, city);

CREATE INDEX IF NOT EXISTS idx_jobs_category
  ON public.jobs (category);

CREATE INDEX IF NOT EXISTS idx_jobs_last_seen
  ON public.jobs (last_seen_at);

CREATE INDEX IF NOT EXISTS idx_jobs_search_vector
  ON public.jobs USING GIN (search_vector);

CREATE OR REPLACE FUNCTION public.update_jobs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.department, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_jobs_search_vector ON public.jobs;
CREATE TRIGGER update_jobs_search_vector
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_jobs_search_vector();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_sync_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sync_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active companies"
ON public.companies FOR SELECT
USING (sync_status IN ('active', 'pending'));

CREATE POLICY "Anyone can view open jobs"
ON public.jobs FOR SELECT
USING (status = 'open');

CREATE POLICY "Admins can manage companies"
ON public.companies FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage jobs"
ON public.jobs FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view sync runs"
ON public.job_sync_runs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view sync errors"
ON public.company_sync_errors FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view sync health"
ON public.job_sync_health FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.refresh_job_sync_health()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_run public.job_sync_runs%ROWTYPE;
  failed_runs INTEGER;
BEGIN
  SELECT * INTO latest_run
  FROM public.job_sync_runs
  ORDER BY started_at DESC
  LIMIT 1;

  WITH recent AS (
    SELECT status, started_at
    FROM public.job_sync_runs
    ORDER BY started_at DESC
    LIMIT 20
  ),
  numbered AS (
    SELECT status, row_number() OVER (ORDER BY started_at DESC) AS rn
    FROM recent
  )
  SELECT count(*) INTO failed_runs
  FROM numbered n
  WHERE n.status = 'failed'
    AND NOT EXISTS (
      SELECT 1
      FROM numbered earlier
      WHERE earlier.rn < n.rn
        AND earlier.status <> 'failed'
    );

  UPDATE public.job_sync_health
  SET
    last_run_at = latest_run.started_at,
    last_success_at = COALESCE(
      (SELECT max(finished_at) FROM public.job_sync_runs WHERE status IN ('success', 'partial_success')),
      last_success_at
    ),
    last_status = latest_run.status,
    consecutive_failed_runs = failed_runs,
    stale_company_count = (
      SELECT count(*)
      FROM public.companies
      WHERE sync_enabled = true
        AND next_sync_at < now() - interval '2 hours'
    ),
    open_job_count = (SELECT count(*) FROM public.jobs WHERE status = 'open'),
    updated_at = now()
  WHERE id = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.close_stale_company_jobs(
  p_company_id UUID,
  p_platform public.ats_platform,
  p_seen_external_ids TEXT[]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  closed_count INTEGER;
BEGIN
  UPDATE public.jobs
  SET status = 'closed'
  WHERE company_id = p_company_id
    AND source_platform = p_platform
    AND status = 'open'
    AND NOT (external_id = ANY(p_seen_external_ids));

  GET DIAGNOSTICS closed_count = ROW_COUNT;
  RETURN closed_count;
END;
$$;

-- Optional Supabase Scheduled Function. Requires pg_cron and pg_net in hosted Supabase.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
EXCEPTION
  WHEN insufficient_privilege OR undefined_file THEN
    RAISE NOTICE 'pg_net extension is unavailable; skipping database-level HTTP scheduler support';
END $$;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
EXCEPTION
  WHEN insufficient_privilege OR undefined_file THEN
    RAISE NOTICE 'pg_cron extension is unavailable; skipping database-level cron scheduler support';
END $$;

DO $$
DECLARE
  project_url TEXT := current_setting('app.settings.supabase_url', true);
  anon_key TEXT := current_setting('app.settings.supabase_anon_key', true);
BEGIN
  IF to_regclass('cron.job') IS NOT NULL
     AND to_regnamespace('net') IS NOT NULL
     AND project_url IS NOT NULL AND project_url <> ''
     AND anon_key IS NOT NULL AND anon_key <> '' THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-company-jobs-every-6-hours') THEN
      EXECUTE 'SELECT cron.unschedule($1)' USING 'sync-company-jobs-every-6-hours';
    END IF;

    EXECUTE 'SELECT cron.schedule($1, $2, $3)'
    USING
      'sync-company-jobs-every-6-hours',
      '0 */6 * * *',
      format(
        'SELECT net.http_post(url := %L, headers := jsonb_build_object(''Content-Type'', ''application/json'', ''Authorization'', ''Bearer '' || %L, ''apikey'', %L), body := ''{"trigger":"supabase-cron"}''::jsonb, timeout_milliseconds := 300000);',
        project_url || '/functions/v1/sync-company-jobs',
        anon_key,
        anon_key
      );
  END IF;
END $$;
