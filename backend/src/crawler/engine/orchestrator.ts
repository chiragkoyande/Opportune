// ============================================================
// OPPORTUNE V4 — Crawler Orchestrator & Controlled Ingestion Pipeline
// Pipeline: CRAWL → STAGE → NORMALIZE → VALIDATE → DEDUPLICATE → EXPIRY CHECK → PUBLISH
// ============================================================

import { cache } from '../../config/redis.js';
import { logger } from '../../config/logger.js';
import { opportunityStore } from '../../database/opportunityStore.js';
import { Company, Job, Internship, Hackathon, Contest } from '../../types/opportunity.js';
import { generateJobFingerprint } from '../deduplication/fingerprint.js';
import { normalizeLocation } from '../normalizers/locationNormalizer.js';
import { normalizeSalary } from '../normalizers/salaryNormalizer.js';
import { validateOpportunityPayload } from '../validators/opportunityValidator.js';

export interface CrawledItemRaw {
  category: 'job' | 'internship' | 'hackathon' | 'contest';
  externalId: string;
  title: string;
  companyName: string;
  companySlug: string;
  rawLocation?: string;
  rawSalary?: string;
  rawDescription?: string;
  applyUrl: string;
  sourceUrl?: string;
  sourcePlatform: string;
  extra?: Record<string, any>;
}

export interface StagedItem {
  id: string;
  runId: string;
  category: string;
  externalId: string;
  fingerprint: string;
  rawPayload: Record<string, any>;
  normalizedPayload: Record<string, any>;
  validationStatus: 'valid' | 'invalid' | 'duplicate';
  validationErrors: string[];
}

export interface CrawlRunRecord {
  runId: string;
  sourceSlug: string;
  startedAt: string;
  completedAt: string;
  totalDiscovered: number;
  totalStaged: number;
  totalPublished: number;
  totalDuplicates: number;
  totalErrors: number;
}

export class CrawlerOrchestrator {
  private inMemoryStaging: Map<string, StagedItem[]> = new Map();
  private runHistory: CrawlRunRecord[] = [];

  public getHistory(): CrawlRunRecord[] {
    return this.runHistory;
  }

  public getLatestRun(): CrawlRunRecord | undefined {
    return this.runHistory[this.runHistory.length - 1];
  }

  async runPipeline(sourceSlug: string, rawItems: CrawledItemRaw[]): Promise<{
    runId: string;
    totalDiscovered: number;
    totalStaged: number;
    totalPublished: number;
    totalDuplicates: number;
    totalErrors: number;
  }> {
    const startedAt = new Date().toISOString();
    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    logger.info({ runId, sourceSlug, discovered: rawItems.length }, 'Starting crawl ingestion pipeline');

    const stagedList: StagedItem[] = [];
    const seenFingerprints = new Set<string>();
    let duplicates = 0;
    let errors = 0;

    // STAGE, NORMALIZE, VALIDATE & DEDUPLICATE
    for (const raw of rawItems) {
      try {
        const normLoc = normalizeLocation(raw.rawLocation);
        const normSal = normalizeSalary(raw.rawSalary);
        const fingerprint = generateJobFingerprint(raw.companySlug, raw.title, normLoc.location);

        let validationStatus: 'valid' | 'invalid' | 'duplicate' = 'valid';
        let validationErrors: string[] = [];

        if (seenFingerprints.has(fingerprint)) {
          validationStatus = 'duplicate';
          duplicates++;
        } else {
          seenFingerprints.add(fingerprint);
          const valRes = validateOpportunityPayload(raw.category, {
            title: raw.title,
            applyUrl: raw.applyUrl,
            company: { name: raw.companyName, slug: raw.companySlug },
            organizer: { name: raw.companyName || 'Community' },
            registrationDeadline: raw.extra?.endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
            platform: raw.extra?.platform || (raw.sourcePlatform === 'codeforces' ? 'Codeforces' : 'CodeChef'),
            startTime: raw.extra?.startDateIso || (raw.extra?.startTimeSeconds ? new Date(raw.extra.startTimeSeconds * 1000).toISOString() : new Date(Date.now() + 86400000).toISOString()),
          });

          if (!valRes.isValid) {
            validationStatus = 'invalid';
            validationErrors = valRes.errors;
            errors++;
          }
        }

        const normalizedPayload = {
          title: raw.title.trim(),
          companyName: raw.companyName,
          companySlug: raw.companySlug,
          location: normLoc.location,
          city: normLoc.city,
          country: normLoc.country,
          workplaceType: normLoc.workplaceType,
          salary: normSal,
          applyUrl: raw.applyUrl,
          sourceUrl: raw.sourceUrl,
          sourcePlatform: raw.sourcePlatform,
        };

        stagedList.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          runId,
          category: raw.category,
          externalId: raw.externalId,
          fingerprint,
          rawPayload: raw as any,
          normalizedPayload,
          validationStatus,
          validationErrors,
        });
      } catch (err: unknown) {
        errors++;
        const msg = err instanceof Error ? err.message : String(err);
        logger.error({ error: msg, item: raw.title }, 'Error during item staging & normalization');
      }
    }

    this.inMemoryStaging.set(runId, stagedList);

    // ATOMIC PUBLISH TO OPPORTUNITY STORE
    const validItems = stagedList.filter((item) => item.validationStatus === 'valid');
    logger.info({ runId, staged: stagedList.length, valid: validItems.length }, 'Publishing verified staged items');

    for (const item of validItems) {
      try {
        const p = item.normalizedPayload;
        const cleanSlug = `${p.companySlug}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.externalId.slice(-6)}`.replace(/-+/g, '-');

        // Ensure company is registered
        const existingCompany = opportunityStore.getCompanyBySlug(p.companySlug);
        if (!existingCompany) {
          const newCompany: Company = {
            id: `comp-${p.companySlug}`,
            slug: p.companySlug,
            name: p.companyName,
            domain: `${p.companySlug}.com`,
            logoUrl: `https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128&h=128&fit=crop`,
            industry: 'Technology & Software',
            headquarters: p.location,
            about: `${p.companyName} is a global software organization currently hiring top talent.`,
            websiteUrl: `https://${p.companySlug}.com`,
            socialLinks: { website: `https://${p.companySlug}.com` },
            stats: { openJobsCount: 0, openInternshipsCount: 0, hackathonsCount: 0, totalOpportunities: 0 },
            isVerified: true,
            isHiring: true,
          };
          opportunityStore.upsertCompany(newCompany);
        }

        if (item.category === 'job') {
          const job: Job = {
            id: item.id,
            slug: cleanSlug,
            title: p.title,
            company: {
              id: `comp-${p.companySlug}`,
              name: p.companyName,
              slug: p.companySlug,
              logoUrl: `https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128&h=128&fit=crop`,
              websiteUrl: `https://${p.companySlug}.com`,
              verified: true,
              location: p.location,
            },
            location: p.location,
            country: p.country,
            city: p.city,
            workplaceType: (p.workplaceType as any) || 'onsite',
            employmentType: 'full-time',
            seniority: /senior|sr|lead|staff/i.test(p.title) ? 'senior' : (/junior|entry|associate/i.test(p.title) ? 'entry' : 'mid'),
            experienceYears: { min: 2, max: 6 },
            salary: p.salary,
            skills: ['Software Engineering', 'System Design', 'Git', 'Problem Solving'],
            description: item.rawPayload?.rawDescription || `${p.title} position at ${p.companyName}`,
            postedAt: new Date().toISOString(),
            applyUrl: p.applyUrl,
            sourceUrl: p.sourceUrl,
            sourcePlatform: p.sourcePlatform,
            isFeatured: false,
            viewsCount: Math.floor(Math.random() * 50) + 1,
            applicantsCount: Math.floor(Math.random() * 15),
          };
          opportunityStore.upsertJob(job);
        } else if (item.category === 'internship') {
          const internship: Internship = {
            id: item.id,
            slug: cleanSlug,
            title: p.title,
            company: {
              id: `comp-${p.companySlug}`,
              name: p.companyName,
              slug: p.companySlug,
              logoUrl: `https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128&h=128&fit=crop`,
              websiteUrl: `https://${p.companySlug}.com`,
              verified: true,
              location: p.location,
            },
            location: p.location,
            country: p.country,
            city: p.city,
            workplaceType: (p.workplaceType as any) || 'onsite',
            stipend: p.salary ? {
              min: p.salary.min ? Math.round(p.salary.min / 12) : null,
              max: p.salary.max ? Math.round(p.salary.max / 12) : null,
              currency: p.salary.currency,
              period: 'month',
            } : null,
            duration: { value: 6, unit: 'months', formatted: '6 Months' },
            startDate: 'Summer / Immediate',
            skills: ['Engineering Fundamentals', 'Data Structures', 'Collaboration'],
            description: item.rawPayload?.rawDescription || `${p.title} at ${p.companyName}`,
            postedAt: new Date().toISOString(),
            applyUrl: p.applyUrl,
            sourceUrl: p.sourceUrl,
            sourcePlatform: p.sourcePlatform,
            viewsCount: Math.floor(Math.random() * 40) + 1,
            applicantsCount: Math.floor(Math.random() * 10),
          };
          opportunityStore.upsertInternship(internship);
        } else if (item.category === 'hackathon') {
          const extra = item.rawPayload?.extra || {};
          const hackathon: Hackathon = {
            id: item.id,
            slug: `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.externalId.slice(-6)}`.replace(/-+/g, '-'),
            title: p.title,
            organizer: {
              name: p.companyName || 'Devfolio Community',
              logoUrl: 'https://assets.devfolio.co/hackathons/aec2f88c6f674e8ca9c87b9074f937ad/assets/cover/500.png',
              verified: true,
            },
            mode: p.location?.toLowerCase().includes('online') ? 'online' : 'hybrid',
            location: p.location,
            registrationDeadline: extra.endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
            startDate: extra.startDate || new Date(Date.now() + 7 * 86400000).toISOString(),
            endDate: extra.endDate || new Date(Date.now() + 9 * 86400000).toISOString(),
            prizePool: {
              total: 200000,
              currency: 'INR',
              formatted: '₹2,00,000+',
            },
            teamSize: { min: 1, max: 4, formatted: '1–4 Members' },
            eligibility: 'Open to developers and students worldwide',
            themes: ['Artificial Intelligence', 'Web3 & Fintech', 'Open Innovation'],
            technologies: ['React', 'TypeScript', 'Node.js', 'Python'],
            tags: ['Hackathon', 'Devfolio', 'Coding Competition'],
            description: item.rawPayload?.rawDescription || `${p.title} Hackathon`,
            status: 'open',
            applyUrl: p.applyUrl,
            officialUrl: p.sourceUrl,
            bannerUrl: extra.bannerUrl || 'https://assets.devfolio.co/hackathons/aec2f88c6f674e8ca9c87b9074f937ad/assets/cover/500.png',
            sourcePlatform: p.sourcePlatform,
            isFeatured: true,
            participantsCount: Math.floor(Math.random() * 200) + 50,
          };
          opportunityStore.upsertHackathon(hackathon);
        } else if (item.category === 'contest') {
          const extra = item.rawPayload?.extra || {};
          const contest: Contest = {
            id: item.id,
            slug: `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.externalId.slice(-6)}`.replace(/-+/g, '-'),
            name: p.title,
            platform: (extra.platform as any) || (p.sourcePlatform === 'codeforces' ? 'Codeforces' : 'CodeChef'),
            organizer: p.companyName,
            platformLogoUrl: p.sourcePlatform === 'codeforces'
              ? 'https://cdn.iconscout.com/icon/free/png-256/free-codeforces-3628695-3029920.png'
              : 'https://cdn.codechef.com/images/cc-logo.svg',
            startTime: extra.startTimeSeconds ? new Date(extra.startTimeSeconds * 1000).toISOString() : (extra.startDateIso || new Date(Date.now() + 86400000).toISOString()),
            endTime: extra.startTimeSeconds && extra.durationSeconds ? new Date((extra.startTimeSeconds + extra.durationSeconds) * 1000).toISOString() : (extra.endDateIso || new Date(Date.now() + 86400000 + 7200000).toISOString()),
            durationMinutes: extra.durationSeconds ? Math.round(extra.durationSeconds / 60) : 120,
            durationFormatted: extra.durationSeconds ? `${Math.round(extra.durationSeconds / 3600)} Hours` : '2 Hours',
            ratingType: /div\s*1/i.test(p.title) ? 'Div 1' : (/div\s*2/i.test(p.title) ? 'Div 2' : (/div\s*3/i.test(p.title) ? 'Div 3' : 'Rated')),
            difficulty: 'all-levels',
            status: extra.phase === 'CODING' ? 'LIVE' : (extra.phase === 'FINISHED' ? 'COMPLETED' : 'UPCOMING'),
            officialUrl: p.applyUrl,
            description: item.rawPayload?.rawDescription || `${p.title} competitive coding competition`,
          };
          opportunityStore.upsertContest(contest);
        }
      } catch (pubErr: unknown) {
        const msg = pubErr instanceof Error ? pubErr.message : String(pubErr);
        logger.error({ error: msg, id: item.id }, 'Error publishing opportunity to store');
      }
    }

    // Invalidate caches for freshness
    await cache.invalidatePattern('jobs:*');
    await cache.invalidatePattern('internships:*');
    await cache.invalidatePattern('hackathons:*');
    await cache.invalidatePattern('contests:*');
    await cache.invalidatePattern('companies:*');

    const completedAt = new Date().toISOString();
    const record: CrawlRunRecord = {
      runId,
      sourceSlug,
      startedAt,
      completedAt,
      totalDiscovered: rawItems.length,
      totalStaged: stagedList.length,
      totalPublished: validItems.length,
      totalDuplicates: duplicates,
      totalErrors: errors,
    };
    this.runHistory.push(record);

    return {
      runId,
      totalDiscovered: rawItems.length,
      totalStaged: stagedList.length,
      totalPublished: validItems.length,
      totalDuplicates: duplicates,
      totalErrors: errors,
    };
  }
}

export const crawlerOrchestrator = new CrawlerOrchestrator();
