import { createClient } from "npm:@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-secret",
};

type AtsPlatform =
  | "greenhouse"
  | "lever"
  | "workday"
  | "ashby"
  | "smartrecruiters"
  | "bamboohr"
  | "jobvite"
  | "teamtailor"
  | "recruitee"
  | "successfactors"
  | "taleo"
  | "icims"
  | "personio"
  | "comeet"
  | "wellfound"
  | "yc_jobs"
  | "custom";

type Company = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  website_url: string;
  careers_url: string | null;
  ats_platform: AtsPlatform | null;
  ats_identifier: string | null;
  ats_metadata: Record<string, unknown>;
  sync_interval_minutes: number;
  consecutive_failures: number;
};

type NormalizedJob = {
  external_id: string;
  title: string;
  description: string | null;
  department: string | null;
  team: string | null;
  location: string | null;
  country: string | null;
  city: string | null;
  employment_type: string | null;
  workplace_type: string | null;
  seniority: string | null;
  category: "job" | "internship";
  status: "open" | "closed" | "draft" | "archived";
  apply_url: string;
  source_url: string | null;
  source_platform: AtsPlatform;
  posted_at: string | null;
  closes_at: string | null;
  raw_data: Record<string, unknown>;
  content_hash: string;
};

type DetectionResult = {
  platform: AtsPlatform;
  identifier: string | null;
  careersUrl: string | null;
  metadata?: Record<string, unknown>;
};

class SyncError extends Error {
  constructor(
    message: string,
    readonly stage: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const syncSecret = Deno.env.get("JOB_SYNC_SECRET");
const maxCompaniesPerRun = Number(Deno.env.get("JOB_SYNC_MAX_COMPANIES") ?? "50");
const requestTimeoutMs = Number(Deno.env.get("JOB_SYNC_TIMEOUT_MS") ?? "20000");
const maxRetries = Number(Deno.env.get("JOB_SYNC_MAX_RETRIES") ?? "2");
const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY") ?? "";
const firecrawlMaxJobs = Number(Deno.env.get("FIRECRAWL_MAX_JOBS") ?? "25");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requireEnvironment(): void {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new SyncError("Missing Supabase service environment", "boot");
  }
}

function isAuthorized(req: Request): boolean {
  if (!syncSecret) return true;
  return req.headers.get("x-sync-secret") === syncSecret;
}

async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = requestTimeoutMs,
): Promise<T> {
  return await withRetries(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "OpportuneCareerSync/1.0",
          ...(init.headers ?? {}),
        },
      });

      if (!response.ok) {
        throw new SyncError(`HTTP ${response.status} from ${url}`, "fetch", {
          url,
          status: response.status,
        });
      }

      return await response.json() as T;
    } finally {
      clearTimeout(timeout);
    }
  });
}

async function fetchText(url: string, timeoutMs = 10000): Promise<string> {
  return await withRetries(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "text/html,application/xhtml+xml",
          "User-Agent": "OpportuneCareerDiscovery/1.0",
        },
      });

      if (!response.ok) {
        throw new SyncError(`HTTP ${response.status} from ${url}`, "discover", {
          url,
          status: response.status,
        });
      }

      return await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }, 1);
}

async function withRetries<T>(operation: () => Promise<T>, retries = maxRetries): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      }
    }
  }

  throw lastError;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

function domainFromUrl(url: string): string {
  const parsed = new URL(normalizeUrl(url));
  return parsed.hostname.replace(/^www\./, "").toLowerCase();
}

function compactText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

function parseDate(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function inferCategory(title: string, raw: Record<string, unknown>): "job" | "internship" {
  const haystack = `${title} ${JSON.stringify(raw)}`.toLowerCase();
  return /\bintern(ship)?\b|summer analyst|co-?op/.test(haystack) ? "internship" : "job";
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function buildJob(
  platform: AtsPlatform,
  raw: Record<string, unknown>,
  fields: Omit<NormalizedJob, "source_platform" | "content_hash" | "raw_data" | "category" | "status"> & {
    category?: "job" | "internship";
    status?: "open" | "closed" | "draft" | "archived";
  },
): Promise<NormalizedJob> {
  const contentHash = await sha256(JSON.stringify({
    title: fields.title,
    description: fields.description,
    location: fields.location,
    apply_url: fields.apply_url,
  }));

  return {
    ...fields,
    category: fields.category ?? inferCategory(fields.title, raw),
    status: fields.status ?? "open",
    raw_data: raw,
    source_platform: platform,
    content_hash: contentHash,
  };
}

function detectFromText(text: string, fallbackUrl: string | null): DetectionResult | null {
  const patterns: Array<{
    platform: AtsPlatform;
    regex: RegExp;
    build: (match: RegExpMatchArray) => DetectionResult;
  }> = [
    {
      platform: "greenhouse",
      regex: /(?:boards\.greenhouse\.io|greenhouse\.io)\/(?:embed\/job_board\?for=|jobs\/|)([a-z0-9_-]+)/i,
      build: (match) => ({ platform: "greenhouse", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "lever",
      regex: /jobs\.lever\.co\/([a-z0-9_-]+)/i,
      build: (match) => ({ platform: "lever", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "ashby",
      regex: /jobs\.ashbyhq\.com\/([a-z0-9_-]+)/i,
      build: (match) => ({ platform: "ashby", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "smartrecruiters",
      regex: /jobs\.smartrecruiters\.com\/([a-z0-9_-]+)/i,
      build: (match) => ({ platform: "smartrecruiters", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "bamboohr",
      regex: /([a-z0-9_-]+)\.bamboohr\.com\/careers/i,
      build: (match) => ({ platform: "bamboohr", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "teamtailor",
      regex: /([a-z0-9_-]+)\.teamtailor\.com/i,
      build: (match) => ({ platform: "teamtailor", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "recruitee",
      regex: /([a-z0-9_-]+)\.recruitee\.com/i,
      build: (match) => ({ platform: "recruitee", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "jobvite",
      regex: /jobs\.jobvite\.com\/([a-z0-9_-]+)/i,
      build: (match) => ({ platform: "jobvite", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "personio",
      regex: /([a-z0-9_-]+)\.jobs\.personio\.(?:de|com)/i,
      build: (match) => ({ platform: "personio", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "comeet",
      regex: /(?:www\.)?comeet\.com\/jobs\/([a-z0-9_-]+)/i,
      build: (match) => ({ platform: "comeet", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "icims",
      regex: /([a-z0-9_-]+)\.icims\.com\/jobs/i,
      build: (match) => ({ platform: "icims", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "successfactors",
      regex: /career(?:\d+)?\.successfactors\.(?:com|eu)\/(?:career\?|sfcareer\/jobreqcareer\?)/i,
      build: (match) => ({ platform: "successfactors", identifier: null, careersUrl: fallbackUrl ?? match[0] }),
    },
    {
      platform: "taleo",
      regex: /(?:taleo\.net|tbe\.taleo\.net)\/careersection/i,
      build: (match) => ({ platform: "taleo", identifier: null, careersUrl: fallbackUrl ?? match[0] }),
    },
    {
      platform: "wellfound",
      regex: /wellfound\.com\/company\/([a-z0-9_-]+)\/jobs/i,
      build: (match) => ({ platform: "wellfound", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "yc_jobs",
      regex: /(?:www\.)?ycombinator\.com\/companies\/([a-z0-9_-]+)\/jobs/i,
      build: (match) => ({ platform: "yc_jobs", identifier: match[1], careersUrl: fallbackUrl }),
    },
    {
      platform: "workday",
      regex: /https?:\/\/([a-z0-9_-]+)\.(?:wd\d\.)?myworkdayjobs\.com\/(?:[^"'\s/]+\/)?([a-z0-9_-]+)/i,
      build: (match) => ({
        platform: "workday",
        identifier: match[1],
        careersUrl: fallbackUrl ?? match[0],
        metadata: { tenant: match[1], site: match[2] },
      }),
    },
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match) return pattern.build(match);
  }

  return null;
}

async function detectCompany(company: Company): Promise<DetectionResult> {
  if (company.ats_platform && company.ats_identifier) {
    return {
      platform: company.ats_platform,
      identifier: company.ats_identifier,
      careersUrl: company.careers_url,
      metadata: company.ats_metadata,
    };
  }

  const baseWebsite = normalizeUrl(company.website_url);
  const domain = company.domain || domainFromUrl(baseWebsite);
  const base = baseWebsite.replace(/\/$/, "");
  const candidates = Array.from(new Set([
    company.careers_url,
    `${base}/careers`,
    `${base}/jobs`,
    `${base}/join-us`,
    `${base}/work-with-us`,
    `${base}/careers/jobs`,
    `${base}/careers/openings`,
    `${base}/company/careers`,
    `https://careers.${domain}`,
    `https://jobs.${domain}`,
  ].filter((value): value is string => Boolean(value))));

  for (const url of candidates) {
    try {
      const html = await fetchText(url);
      const detected = detectFromText(`${url}\n${html}`, url);
      if (detected) return detected;
    } catch (error) {
      console.log(`Career detection candidate failed for ${company.name}:`, url, String(error));
    }
  }

  return {
    platform: "custom",
    identifier: null,
    careersUrl: company.careers_url ?? candidates[0] ?? baseWebsite,
  };
}

async function fetchGreenhouse(identifier: string): Promise<NormalizedJob[]> {
  type ResponseBody = { jobs?: Array<Record<string, unknown>> };
  const data = await fetchJson<ResponseBody>(
    `https://boards-api.greenhouse.io/v1/boards/${identifier}/jobs?content=true`,
  );

  return await Promise.all((data.jobs ?? []).map((job) => buildJob("greenhouse", job, {
    external_id: String(job.id),
    title: String(job.title ?? "Untitled role"),
    description: compactText(job.content) ?? null,
    department: compactText((job.departments as Array<Record<string, unknown>> | undefined)?.[0]?.name),
    team: null,
    location: compactText((job.location as Record<string, unknown> | undefined)?.name),
    country: null,
    city: null,
    employment_type: null,
    workplace_type: null,
    seniority: null,
    apply_url: String(job.absolute_url ?? job.internal_job_id ?? ""),
    source_url: String(job.absolute_url ?? ""),
    posted_at: parseDate(job.updated_at),
    closes_at: null,
  })));
}

async function fetchLever(identifier: string): Promise<NormalizedJob[]> {
  const data = await fetchJson<Array<Record<string, unknown>>>(
    `https://api.lever.co/v0/postings/${identifier}?mode=json`,
  );

  return await Promise.all(data.map((job) => {
    const categories = job.categories as Record<string, unknown> | undefined;
    return buildJob("lever", job, {
      external_id: String(job.id),
      title: String(job.text ?? "Untitled role"),
      description: compactText(job.descriptionPlain ?? job.description),
      department: compactText(categories?.department),
      team: compactText(categories?.team),
      location: compactText(categories?.location),
      country: null,
      city: null,
      employment_type: compactText(categories?.commitment),
      workplace_type: compactText(categories?.workplaceType),
      seniority: null,
      apply_url: String(job.hostedUrl ?? job.applyUrl ?? ""),
      source_url: String(job.hostedUrl ?? ""),
      posted_at: parseDate(job.createdAt),
      closes_at: null,
    });
  }));
}

async function fetchAshby(identifier: string): Promise<NormalizedJob[]> {
  type ResponseBody = { jobs?: Array<Record<string, unknown>> };
  const data = await fetchJson<ResponseBody>(
    `https://api.ashbyhq.com/posting-api/job-board/${identifier}?includeCompensation=true`,
  );

  return await Promise.all((data.jobs ?? []).map((job) => {
    const location = job.location as Record<string, unknown> | undefined;
    return buildJob("ashby", job, {
      external_id: String(job.id),
      title: String(job.title ?? "Untitled role"),
      description: compactText(job.descriptionHtml ?? job.descriptionPlain),
      department: compactText(job.department),
      team: compactText(job.team),
      location: compactText(location?.name),
      country: compactText(location?.country),
      city: compactText(location?.city),
      employment_type: compactText(job.employmentType),
      workplace_type: compactText(job.locationType),
      seniority: null,
      apply_url: String(job.jobUrl ?? job.applyUrl ?? ""),
      source_url: String(job.jobUrl ?? ""),
      posted_at: parseDate(job.publishedAt),
      closes_at: null,
    });
  }));
}

async function fetchSmartRecruiters(identifier: string): Promise<NormalizedJob[]> {
  type ResponseBody = { content?: Array<Record<string, unknown>> };
  const data = await fetchJson<ResponseBody>(
    `https://api.smartrecruiters.com/v1/companies/${identifier}/postings?limit=100`,
  );

  return await Promise.all((data.content ?? []).map((job) => {
    const location = job.location as Record<string, unknown> | undefined;
    return buildJob("smartrecruiters", job, {
      external_id: String(job.id),
      title: String(job.name ?? "Untitled role"),
      description: compactText(job.jobAd as string | undefined),
      department: compactText((job.department as Record<string, unknown> | undefined)?.label),
      team: null,
      location: compactText(location?.city) ?? compactText(location?.country),
      country: compactText(location?.country),
      city: compactText(location?.city),
      employment_type: compactText((job.typeOfEmployment as Record<string, unknown> | undefined)?.label),
      workplace_type: null,
      seniority: null,
      apply_url: String(job.ref ?? ""),
      source_url: String(job.ref ?? ""),
      posted_at: parseDate(job.releasedDate),
      closes_at: null,
    });
  }));
}

async function fetchBambooHr(identifier: string): Promise<NormalizedJob[]> {
  type ResponseBody = { result?: Array<Record<string, unknown>> };
  const data = await fetchJson<ResponseBody>(`https://${identifier}.bamboohr.com/careers/list`);

  return await Promise.all((data.result ?? []).map((job) => buildJob("bamboohr", job, {
    external_id: String(job.id),
    title: String(job.jobOpeningName ?? "Untitled role"),
    description: compactText(job.description),
    department: compactText(job.departmentLabel),
    team: null,
    location: compactText(job.locationLabel),
    country: null,
    city: null,
    employment_type: compactText(job.employmentStatusLabel),
    workplace_type: null,
    seniority: null,
    apply_url: `https://${identifier}.bamboohr.com/careers/${String(job.id)}`,
    source_url: `https://${identifier}.bamboohr.com/careers/${String(job.id)}`,
    posted_at: parseDate(job.datePosted),
    closes_at: null,
  })));
}

async function fetchTeamtailor(identifier: string): Promise<NormalizedJob[]> {
  type ResponseBody = { jobs?: Array<Record<string, unknown>> };
  const data = await fetchJson<ResponseBody>(`https://${identifier}.teamtailor.com/jobs.json`);

  return await Promise.all((data.jobs ?? []).map((job) => buildJob("teamtailor", job, {
    external_id: String(job.id),
    title: String(job.title ?? "Untitled role"),
    description: compactText(job.body),
    department: compactText(job.department),
    team: null,
    location: compactText(job.location),
    country: null,
    city: null,
    employment_type: compactText(job.employment_type),
    workplace_type: null,
    seniority: null,
    apply_url: String(job.url ?? ""),
    source_url: String(job.url ?? ""),
    posted_at: parseDate(job.published_at),
    closes_at: null,
  })));
}

async function fetchRecruitee(identifier: string): Promise<NormalizedJob[]> {
  type ResponseBody = { offers?: Array<Record<string, unknown>> };
  const data = await fetchJson<ResponseBody>(`https://${identifier}.recruitee.com/api/offers/`);

  return await Promise.all((data.offers ?? []).map((job) => buildJob("recruitee", job, {
    external_id: String(job.id),
    title: String(job.title ?? "Untitled role"),
    description: compactText(job.description),
    department: compactText(job.department),
    team: null,
    location: compactText(job.location),
    country: null,
    city: null,
    employment_type: compactText(job.kind),
    workplace_type: null,
    seniority: null,
    apply_url: String(job.careers_url ?? ""),
    source_url: String(job.careers_url ?? ""),
    posted_at: parseDate(job.created_at),
    closes_at: null,
  })));
}

async function fetchPersonio(identifier: string): Promise<NormalizedJob[]> {
  type ResponseBody = { jobs?: Array<Record<string, unknown>> };
  const data = await fetchJson<ResponseBody>(`https://${identifier}.jobs.personio.com/search.json`);

  return await Promise.all((data.jobs ?? []).map((job) => buildJob("personio", job, {
    external_id: String(job.id ?? job.job_id ?? job.slug),
    title: String(job.name ?? job.title ?? "Untitled role"),
    description: compactText(job.description),
    department: compactText(job.department),
    team: null,
    location: compactText(job.office),
    country: compactText(job.country),
    city: compactText(job.city),
    employment_type: compactText(job.employment_type),
    workplace_type: compactText(job.schedule),
    seniority: compactText(job.seniority),
    apply_url: String(job.url ?? `https://${identifier}.jobs.personio.com/job/${String(job.id ?? "")}`),
    source_url: String(job.url ?? ""),
    posted_at: parseDate(job.published_at ?? job.created_at),
    closes_at: null,
  })));
}

async function fetchComeet(identifier: string): Promise<NormalizedJob[]> {
  type ResponseBody = { positions?: Array<Record<string, unknown>> };
  const data = await fetchJson<ResponseBody>(
    `https://www.comeet.com/careers-api/2.0/company/${identifier}/positions?details=true`,
  );

  return await Promise.all((data.positions ?? []).map((job) => {
    const location = job.location as Record<string, unknown> | undefined;
    return buildJob("comeet", job, {
      external_id: String(job.uid ?? job.id),
      title: String(job.name ?? job.title ?? "Untitled role"),
      description: compactText(job.description),
      department: compactText(job.department),
      team: null,
      location: compactText(job.location) ?? compactText(location?.name),
      country: compactText(location?.country),
      city: compactText(location?.city),
      employment_type: compactText(job.employment_type),
      workplace_type: null,
      seniority: null,
      apply_url: String(job.url_comeet_hosted_page ?? job.url_active_page ?? ""),
      source_url: String(job.url_comeet_hosted_page ?? job.url_active_page ?? ""),
      posted_at: parseDate(job.time_updated ?? job.created_at),
      closes_at: null,
    });
  }));
}

async function fetchCustom(
  company: Company,
  detection: DetectionResult,
  platform: AtsPlatform = "custom",
): Promise<NormalizedJob[]> {
  const feedUrl = String(detection.metadata?.feedUrl ?? company.ats_metadata?.feedUrl ?? "");
  if (!feedUrl) {
    throw new SyncError("Custom career page detected; add ats_metadata.feedUrl for a first-party JSON feed", "fetch", {
      company: company.name,
      careersUrl: detection.careersUrl,
    });
  }

  const data = await fetchJson<unknown>(feedUrl);
  const records = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>).jobs)
    ? (data as Record<string, unknown>).jobs
    : Array.isArray((data as Record<string, unknown>).positions)
    ? (data as Record<string, unknown>).positions
    : [];

  return await Promise.all(records
    .filter((record): record is Record<string, unknown> => Boolean(record) && typeof record === "object")
    .map((job) => buildJob(platform, job, {
      external_id: String(job.id ?? job.external_id ?? job.url ?? job.apply_url),
      title: String(job.title ?? job.name ?? "Untitled role"),
      description: compactText(job.description),
      department: compactText(job.department),
      team: compactText(job.team),
      location: compactText(job.location),
      country: compactText(job.country),
      city: compactText(job.city),
      employment_type: compactText(job.employment_type ?? job.type),
      workplace_type: compactText(job.workplace_type),
      seniority: compactText(job.seniority),
      apply_url: String(job.apply_url ?? job.url ?? ""),
      source_url: String(job.url ?? job.apply_url ?? feedUrl),
      posted_at: parseDate(job.posted_at ?? job.created_at),
      closes_at: parseDate(job.closes_at),
    })));
}

type FirecrawlPage = {
  success?: boolean;
  data?: {
    html?: string;
    markdown?: string;
    metadata?: Record<string, unknown>;
  };
};

async function fetchFirecrawlPage(url: string): Promise<FirecrawlPage> {
  if (!firecrawlApiKey) {
    throw new SyncError("FIRECRAWL_API_KEY is not configured", "firecrawl", { url });
  }

  return await withRetries(async () => {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["html", "markdown"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      throw new SyncError(`Firecrawl returned HTTP ${response.status}`, "firecrawl", {
        url,
        status: response.status,
      });
    }

    return await response.json() as FirecrawlPage;
  });
}

function jsonLdJobPostings(html: string): Array<Record<string, unknown>> {
  const jobs: Array<Record<string, unknown>> = [];
  const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? [];

  for (const script of scripts) {
    const content = script.replace(/<script[^>]*>/i, "").replace(/<\/script>\s*$/i, "").trim();
    try {
      const parsed = JSON.parse(content) as unknown;
      const candidates = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, unknown>)["@graph"])
        ? (parsed as Record<string, unknown>)["@graph"]
        : [parsed];

      for (const candidate of candidates) {
        if (!candidate || typeof candidate !== "object") continue;
        const record = candidate as Record<string, unknown>;
        const type = record["@type"];
        const types = Array.isArray(type) ? type : [type];
        if (types.some((value) => value === "JobPosting")) jobs.push(record);
      }
    } catch {
      // Ignore malformed JSON-LD blocks and continue with other page data.
    }
  }

  return jobs;
}

function firecrawlJobLinks(html: string, pageUrl: string): string[] {
  const links = new Set<string>();
  const pattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null && links.size < firecrawlMaxJobs) {
    const label = compactText(match[2])?.toLowerCase() ?? "";
    if (!/(job|career|intern|engineer|developer|analyst|manager|designer|data|software)/i.test(`${label} ${match[1]}`)) continue;

    try {
      const link = new URL(match[1], pageUrl);
      if (link.protocol === "http:" || link.protocol === "https:") links.add(link.toString());
    } catch {
      // Ignore invalid links.
    }
  }

  return Array.from(links);
}

function firecrawlLocation(value: unknown): { location: string | null; country: string | null; city: string | null } {
  const locations = Array.isArray(value) ? value : [value];
  const first = locations.find((item) => item && typeof item === "object") as Record<string, unknown> | undefined;
  const address = first?.address as Record<string, unknown> | undefined;
  const city = compactText(address?.addressLocality);
  const country = compactText(address?.addressCountry);
  return {
    location: compactText(first?.name) ?? ([city, country].filter(Boolean).join(", ") || null),
    country,
    city,
  };
}

async function firecrawlJobsFromPage(
  pageUrl: string,
  page: FirecrawlPage,
): Promise<NormalizedJob[]> {
  const html = page.data?.html ?? "";
  const jobs = jsonLdJobPostings(html);
  return await Promise.all(jobs.map((job) => {
    const location = firecrawlLocation(job.jobLocation);
    const applyUrl = String(job.url ?? pageUrl);
    return buildJob("custom", job, {
      external_id: String((job.identifier as Record<string, unknown> | undefined)?.value ?? applyUrl),
      title: String(job.title ?? "Untitled role"),
      description: compactText(job.description),
      department: compactText(job.department),
      team: null,
      location: location.location,
      country: location.country,
      city: location.city,
      employment_type: compactText(job.employmentType),
      workplace_type: null,
      seniority: null,
      apply_url: applyUrl,
      source_url: pageUrl,
      posted_at: parseDate(job.datePosted),
      closes_at: parseDate(job.validThrough),
    });
  }));
}

async function fetchFirecrawlFallback(company: Company, detection: DetectionResult): Promise<NormalizedJob[]> {
  if (!firecrawlApiKey) {
    throw new SyncError("No structured job source found and FIRECRAWL_API_KEY is not configured", "firecrawl", {
      company: company.name,
      careersUrl: detection.careersUrl,
    });
  }

  const pageUrl = detection.careersUrl ?? company.website_url;
  const landingPage = await fetchFirecrawlPage(pageUrl);
  const detailPages = await Promise.all(firecrawlJobLinks(landingPage.data?.html ?? "", pageUrl)
    .slice(0, firecrawlMaxJobs)
    .map(async (url) => {
      try {
        return { url, page: await fetchFirecrawlPage(url) };
      } catch (error) {
        console.log(`Firecrawl skipped job page for ${company.name}:`, url, String(error));
        return null;
      }
    }));
  const pages = [
    { url: pageUrl, page: landingPage },
    ...detailPages.filter((page): page is { url: string; page: FirecrawlPage } => page !== null),
  ];

  const jobs = (await Promise.all(pages.map(({ url, page }) => firecrawlJobsFromPage(url, page))))
    .flat()
    .filter((job) => job.title !== "Untitled role" && job.apply_url);

  return jobs;
}

async function fetchWorkday(identifier: string, metadata: Record<string, unknown>): Promise<NormalizedJob[]> {
  const tenant = String(metadata.tenant ?? identifier);
  const site = String(metadata.site ?? "External");
  const host = `${tenant}.myworkdayjobs.com`;
  const url = `https://${host}/wday/cxs/${tenant}/${site}/jobs`;
  const allJobs: Array<Record<string, unknown>> = [];

  for (let offset = 0; offset < 1000; offset += 100) {
    const data = await fetchJson<{ jobPostings?: Array<Record<string, unknown>> }>(url, {
      method: "POST",
      body: JSON.stringify({ appliedFacets: {}, limit: 100, offset, searchText: "" }),
      headers: { "Content-Type": "application/json" },
    });
    const page = data.jobPostings ?? [];
    allJobs.push(...page);
    if (page.length < 100) break;
  }

  return await Promise.all(allJobs.map((job) => {
    const externalPath = String(job.externalPath ?? "");
    const sourceUrl = externalPath.startsWith("http")
      ? externalPath
      : `https://${host}/${site}${externalPath}`;

    const bulletFields = Array.isArray(job.bulletFields) ? job.bulletFields : [];

    return buildJob("workday", job, {
      external_id: String(bulletFields[0] ?? job.title ?? externalPath),
      title: String(job.title ?? "Untitled role"),
      description: compactText(job.jobDescription),
      department: null,
      team: null,
      location: compactText(job.locationsText),
      country: null,
      city: null,
      employment_type: null,
      workplace_type: null,
      seniority: null,
      apply_url: sourceUrl,
      source_url: sourceUrl,
      posted_at: parseDate(job.postedOn),
      closes_at: null,
    });
  }));
}

async function fetchJobsForCompany(company: Company, detection: DetectionResult): Promise<NormalizedJob[]> {
  try {
    if (!detection.identifier && detection.platform !== "custom") {
      throw new SyncError("Detected ATS platform without an account identifier", "detect", { detection });
    }

    switch (detection.platform) {
      case "greenhouse":
        return await fetchGreenhouse(detection.identifier ?? "");
      case "lever":
        return await fetchLever(detection.identifier ?? "");
      case "workday":
        return await fetchWorkday(detection.identifier ?? "", detection.metadata ?? company.ats_metadata);
      case "ashby":
        return await fetchAshby(detection.identifier ?? "");
      case "smartrecruiters":
        return await fetchSmartRecruiters(detection.identifier ?? "");
      case "bamboohr":
        return await fetchBambooHr(detection.identifier ?? "");
      case "teamtailor":
        return await fetchTeamtailor(detection.identifier ?? "");
      case "recruitee":
        return await fetchRecruitee(detection.identifier ?? "");
      case "personio":
        return await fetchPersonio(detection.identifier ?? "");
      case "comeet":
        return await fetchComeet(detection.identifier ?? "");
      case "jobvite":
        return await fetchCustom(company, detection, "jobvite");
      case "successfactors":
      case "taleo":
      case "icims":
      case "wellfound":
      case "yc_jobs":
        return await fetchCustom(company, detection, detection.platform);
      case "custom":
        return await fetchCustom(company, detection);
    }
  } catch (error) {
    console.log(`Structured source failed for ${company.name}; trying Firecrawl fallback`, String(error));
  }

  return await fetchFirecrawlFallback(company, detection);
}

async function logCompanyError(
  company: Company,
  runId: string,
  error: unknown,
  platform: AtsPlatform | null,
): Promise<void> {
  const syncError = error instanceof SyncError ? error : new SyncError(String(error), "unknown");
  await supabase.from("company_sync_errors").insert({
    company_id: company.id,
    sync_run_id: runId,
    platform,
    stage: syncError.stage,
    message: syncError.message,
    details: syncError.details,
  });
}

async function syncCompany(company: Company, runId: string): Promise<{ seen: number; upserted: number; closed: number }> {
  const detection = await detectCompany(company);
  const jobs = (await fetchJobsForCompany(company, detection))
    .filter((job) => job.external_id && job.title && job.apply_url);

  const now = new Date().toISOString();
  const seenExternalIds = Array.from(new Set(jobs.map((job) => job.external_id)));

  if (jobs.length > 0) {
    const { error } = await supabase.from("jobs").upsert(
      jobs.map((job) => ({
        ...job,
        company_id: company.id,
        last_seen_at: now,
      })),
      { onConflict: "company_id,source_platform,external_id" },
    );

    if (error) throw new SyncError(error.message, "upsert", { code: error.code });
  }

  let closed = 0;
  if (seenExternalIds.length > 0 && detection.platform !== "custom") {
    const { data, error } = await supabase.rpc("close_stale_company_jobs", {
      p_company_id: company.id,
      p_platform: detection.platform,
      p_seen_external_ids: seenExternalIds,
    });

    if (error) throw new SyncError(error.message, "close_stale", { code: error.code });
    closed = typeof data === "number" ? data : 0;
  }

  const nextSyncAt = new Date(Date.now() + company.sync_interval_minutes * 60_000).toISOString();
  const { error: companyError } = await supabase
    .from("companies")
    .update({
      ats_platform: detection.platform,
      ats_identifier: detection.identifier,
      ats_metadata: detection.metadata ?? {},
      careers_url: detection.careersUrl,
      sync_status: "active",
      last_discovered_at: now,
      last_synced_at: now,
      last_successful_sync_at: now,
      next_sync_at: nextSyncAt,
      consecutive_failures: 0,
      last_error: null,
    })
    .eq("id", company.id);

  if (companyError) throw new SyncError(companyError.message, "company_update", { code: companyError.code });

  return { seen: jobs.length, upserted: jobs.length, closed };
}

async function markCompanyFailure(company: Company, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const backoffHours = Math.min(24, 2 ** Math.min(5, company.consecutive_failures));
  await supabase
    .from("companies")
    .update({
      sync_status: "error",
      last_synced_at: new Date().toISOString(),
      next_sync_at: new Date(Date.now() + backoffHours * 60 * 60_000).toISOString(),
      consecutive_failures: company.consecutive_failures + 1,
      last_error: message.slice(0, 2000),
    })
    .eq("id", company.id);
}

async function getCompanies(req: Request): Promise<Company[]> {
  const body = req.method === "POST" ? await req.json().catch(() => ({})) as Record<string, unknown> : {};
  const requestedIds = Array.isArray(body.companyIds) ? body.companyIds.filter((id): id is string => typeof id === "string") : [];

  let query = supabase
    .from("companies")
    .select("*")
    .eq("sync_enabled", true)
    .order("next_sync_at", { ascending: true })
    .limit(maxCompaniesPerRun);

  if (requestedIds.length > 0) {
    query = query.in("id", requestedIds);
  } else {
    query = query.lte("next_sync_at", new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) throw new SyncError(error.message, "load_companies", { code: error.code });
  return (data ?? []) as Company[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    requireEnvironment();
    if (!isAuthorized(req)) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const triggerSource = req.headers.get("x-github-event") ? "github-actions" : "scheduled";
    const { data: run, error: runError } = await supabase
      .from("job_sync_runs")
      .insert({ trigger_source: triggerSource })
      .select("id")
      .single();

    if (runError || !run) {
      throw new SyncError(runError?.message ?? "Unable to create sync run", "run_create");
    }

    const companies = await getCompanies(req);
    let succeeded = 0;
    let failed = 0;
    let jobsSeen = 0;
    let jobsUpserted = 0;
    let jobsClosed = 0;

    for (const company of companies) {
      try {
        const result = await syncCompany(company, run.id);
        succeeded += 1;
        jobsSeen += result.seen;
        jobsUpserted += result.upserted;
        jobsClosed += result.closed;
      } catch (error) {
        failed += 1;
        await logCompanyError(company, run.id, error, company.ats_platform);
        await markCompanyFailure(company, error);
      }
    }

    const status = failed === 0 ? "success" : succeeded > 0 ? "partial_success" : "failed";
    await supabase
      .from("job_sync_runs")
      .update({
        finished_at: new Date().toISOString(),
        status,
        companies_checked: companies.length,
        companies_succeeded: succeeded,
        companies_failed: failed,
        jobs_seen: jobsSeen,
        jobs_upserted: jobsUpserted,
        jobs_closed: jobsClosed,
      })
      .eq("id", run.id);

    await supabase.rpc("refresh_job_sync_health");

    return jsonResponse({
      runId: run.id,
      status,
      companiesChecked: companies.length,
      companiesSucceeded: succeeded,
      companiesFailed: failed,
      jobsSeen,
      jobsUpserted,
      jobsClosed,
    });
  } catch (error) {
    console.error("Company job sync failed", error);
    return jsonResponse({
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
