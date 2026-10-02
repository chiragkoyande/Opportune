-- ============================================================
-- OPPORTUNE V4 — Enterprise PostgreSQL / Supabase Schema
-- Jobs, Internships, Hackathons, Contests, Staging & Tracking
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  logo_url VARCHAR(1024),
  banner_url VARCHAR(1024),
  industry VARCHAR(100) NOT NULL DEFAULT 'Technology',
  headquarters VARCHAR(255) NOT NULL DEFAULT 'Bengaluru, India',
  size VARCHAR(100),
  founded_year INTEGER,
  about TEXT NOT NULL DEFAULT '',
  culture TEXT,
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  website_url VARCHAR(1024) NOT NULL,
  careers_url VARCHAR(1024),
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_hiring BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON public.companies(is_verified);

-- 2. JOBS (Strictly Full-time/Contract Career Opportunities)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  department VARCHAR(100),
  team VARCHAR(100),
  location VARCHAR(255) NOT NULL DEFAULT 'Bengaluru, India',
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
  workplace_type VARCHAR(50) NOT NULL DEFAULT 'onsite', -- remote, hybrid, onsite
  employment_type VARCHAR(50) NOT NULL DEFAULT 'full-time', -- full-time, part-time, contract, freelance
  seniority VARCHAR(50) NOT NULL DEFAULT 'mid', -- entry, mid, senior, lead, executive
  exp_min INTEGER NOT NULL DEFAULT 0,
  exp_max INTEGER,
  salary_min NUMERIC(12, 2),
  salary_max NUMERIC(12, 2),
  salary_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  salary_period VARCHAR(20) NOT NULL DEFAULT 'year',
  salary_is_negotiable BOOLEAN NOT NULL DEFAULT false,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  apply_url VARCHAR(1024) NOT NULL,
  source_url VARCHAR(1024),
  source_platform VARCHAR(100) NOT NULL DEFAULT 'career-page',
  fingerprint VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'published', -- draft, staged, published, expired, archived, invalid
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  applicants_count INTEGER NOT NULL DEFAULT 0,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_published ON public.jobs(status, is_active, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_fingerprint ON public.jobs(fingerprint);
CREATE INDEX IF NOT EXISTS idx_jobs_country_city ON public.jobs(country, city);
CREATE INDEX IF NOT EXISTS idx_jobs_workplace ON public.jobs(workplace_type);

-- 3. INTERNSHIPS (Strictly Stipend, Duration, PPO)
CREATE TABLE IF NOT EXISTS public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location VARCHAR(255) NOT NULL DEFAULT 'Bengaluru, India',
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
  workplace_type VARCHAR(50) NOT NULL DEFAULT 'remote',
  stipend_min NUMERIC(12, 2),
  stipend_max NUMERIC(12, 2),
  stipend_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  stipend_period VARCHAR(20) NOT NULL DEFAULT 'month', -- month, lump-sum, unpaid
  stipend_is_performance_based BOOLEAN NOT NULL DEFAULT false,
  duration_value INTEGER NOT NULL DEFAULT 3,
  duration_unit VARCHAR(20) NOT NULL DEFAULT 'months',
  start_date VARCHAR(100) NOT NULL DEFAULT 'immediate',
  is_immediate BOOLEAN NOT NULL DEFAULT true,
  application_deadline TIMESTAMPTZ,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ppo_offered BOOLEAN NOT NULL DEFAULT false,
  eligibility JSONB NOT NULL DEFAULT '[]'::jsonb,
  responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  apply_url VARCHAR(1024) NOT NULL,
  source_url VARCHAR(1024),
  source_platform VARCHAR(100) NOT NULL DEFAULT 'career-page',
  fingerprint VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  applicants_count INTEGER NOT NULL DEFAULT 0,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internships_published ON public.internships(status, is_active, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON public.internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_slug ON public.internships(slug);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON public.internships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_internships_ppo ON public.internships(ppo_offered);

-- 4. HACKATHONS (Strictly Prize Pool, Team Size, Timeline)
CREATE TABLE IF NOT EXISTS public.hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  organizer_name VARCHAR(255) NOT NULL,
  organizer_logo_url VARCHAR(1024),
  organizer_website_url VARCHAR(1024),
  organizer_verified BOOLEAN NOT NULL DEFAULT true,
  mode VARCHAR(50) NOT NULL DEFAULT 'online', -- online, offline, hybrid
  location VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  registration_deadline TIMESTAMPTZ NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  prize_pool_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  prize_pool_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  prize_pool_formatted VARCHAR(100) NOT NULL DEFAULT '₹0',
  prizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  team_size_min INTEGER NOT NULL DEFAULT 1,
  team_size_max INTEGER NOT NULL DEFAULT 4,
  team_size_formatted VARCHAR(50) NOT NULL DEFAULT '1-4 members',
  eligibility TEXT NOT NULL DEFAULT 'Open to all developers and students',
  themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  sponsors JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  hackathon_status VARCHAR(50) NOT NULL DEFAULT 'open', -- upcoming, open, closing-soon, closed, in-progress, ended
  apply_url VARCHAR(1024) NOT NULL,
  official_url VARCHAR(1024),
  banner_url VARCHAR(1024),
  source_platform VARCHAR(100) NOT NULL DEFAULT 'devfolio',
  fingerprint VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  participants_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hackathons_published ON public.hackathons(status, is_active, registration_deadline);
CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON public.hackathons(slug);
CREATE INDEX IF NOT EXISTS idx_hackathons_mode ON public.hackathons(mode);
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON public.hackathons(hackathon_status);

-- 5. CODING CONTESTS (Strictly Platform, Rating, Duration)
CREATE TABLE IF NOT EXISTS public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(100) NOT NULL, -- CodeChef, Codeforces, LeetCode, etc.
  organizer VARCHAR(255),
  platform_logo_url VARCHAR(1024),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  duration_formatted VARCHAR(50) NOT NULL DEFAULT '2 hours',
  rating_type VARCHAR(50) NOT NULL DEFAULT 'Rated',
  difficulty VARCHAR(50) NOT NULL DEFAULT 'all-levels',
  participants_count INTEGER NOT NULL DEFAULT 0,
  contest_status VARCHAR(50) NOT NULL DEFAULT 'UPCOMING', -- UPCOMING, LIVE, COMPLETED
  eligibility VARCHAR(255) NOT NULL DEFAULT 'Open to all',
  official_url VARCHAR(1024) NOT NULL,
  description TEXT,
  problem_count INTEGER,
  languages_allowed JSONB NOT NULL DEFAULT '[]'::jsonb,
  prizes TEXT,
  fingerprint VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contests_published ON public.contests(status, is_active, contest_status, start_time);
CREATE INDEX IF NOT EXISTS idx_contests_slug ON public.contests(slug);
CREATE INDEX IF NOT EXISTS idx_contests_platform ON public.contests(platform);

-- 6. CRAWLER SOURCES & STAGING
CREATE TABLE IF NOT EXISTS public.crawl_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(100) NOT NULL,
  base_url VARCHAR(1024) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  crawl_interval_minutes INTEGER NOT NULL DEFAULT 1440,
  last_run_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'idle',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crawl_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.crawl_sources(id) ON DELETE SET NULL,
  run_type VARCHAR(50) NOT NULL DEFAULT 'nightly',
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, partial
  total_discovered INTEGER NOT NULL DEFAULT 0,
  total_staged INTEGER NOT NULL DEFAULT 0,
  total_published INTEGER NOT NULL DEFAULT 0,
  total_expired INTEGER NOT NULL DEFAULT 0,
  total_errors INTEGER NOT NULL DEFAULT 0,
  log_summary TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.crawl_run_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.crawl_runs(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- job, internship, hackathon, contest
  external_id VARCHAR(255) NOT NULL,
  fingerprint VARCHAR(64) NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  normalized_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_status VARCHAR(50) NOT NULL DEFAULT 'valid', -- valid, invalid, duplicate
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  published_record_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crawl_run_items_run ON public.crawl_run_items(run_id, fingerprint);

CREATE TABLE IF NOT EXISTS public.crawl_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.crawl_runs(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.crawl_sources(id) ON DELETE SET NULL,
  error_type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  traceback TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. BOOKMARKS & COLLECTIONS
CREATE TABLE IF NOT EXISTS public.bookmark_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(1024),
  category VARCHAR(50) DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  target_id VARCHAR(255) NOT NULL,
  target_slug VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  logo_url VARCHAR(1024),
  location VARCHAR(255),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  collection_id UUID REFERENCES public.bookmark_collections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_target_category UNIQUE(user_id, target_id, category)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id, category);

-- 8. APPLICATIONS TRACKER
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  opportunity_id VARCHAR(255) NOT NULL,
  opportunity_type VARCHAR(50) NOT NULL, -- job, internship
  opportunity_title VARCHAR(255) NOT NULL,
  opportunity_slug VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_logo_url VARCHAR(1024),
  location VARCHAR(255) NOT NULL DEFAULT '',
  workplace_type VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'applied', -- saved, applied, screening, interview, offer, rejected
  applied_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  interview_date TIMESTAMPTZ,
  compensation VARCHAR(255),
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_opportunity UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id, status);

-- 9. USER PROFILES (Supabase Auth link)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id VARCHAR(255) PRIMARY KEY, -- matches auth.users.id
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL DEFAULT '',
  avatar_url VARCHAR(1024),
  headline VARCHAR(255),
  bio TEXT,
  location VARCHAR(255),
  phone VARCHAR(50),
  github_url VARCHAR(1024),
  linkedin_url VARCHAR(1024),
  portfolio_url VARCHAR(1024),
  resume_url VARCHAR(1024),
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  experiences JSONB NOT NULL DEFAULT '[]'::jsonb,
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{
    "opportunityCategories": ["jobs", "internships", "hackathons", "contests"],
    "preferredLocations": ["Bengaluru", "Remote", "Pune", "Hyderabad"],
    "preferredJobTypes": ["Full-time", "Internship"],
    "preferredTechnologies": ["React", "TypeScript", "Node.js", "Python"],
    "workplacePreference": ["remote", "hybrid"],
    "emailAlerts": true,
    "weeklyDigest": true,
    "theme": "dark"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
