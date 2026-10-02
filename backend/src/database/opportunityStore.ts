// ============================================================
// OPPORTUNE V4 — Live Dynamic Opportunity Store
// In-memory persistent store with seed baseline + dynamic crawl ingestion
// ============================================================

import { Company, Job, Internship, Hackathon, Contest } from '../types/opportunity.js';
import {
  SEED_COMPANIES,
  SEED_JOBS,
  SEED_INTERNSHIPS,
  SEED_HACKATHONS,
  SEED_CONTESTS,
} from './seedData.js';

export class OpportunityStore {
  private jobsMap: Map<string, Job> = new Map();
  private internshipsMap: Map<string, Internship> = new Map();
  private hackathonsMap: Map<string, Hackathon> = new Map();
  private contestsMap: Map<string, Contest> = new Map();
  private companiesMap: Map<string, Company> = new Map();

  constructor() {
    this.resetToSeed();
  }

  public resetToSeed(): void {
    this.jobsMap.clear();
    this.internshipsMap.clear();
    this.hackathonsMap.clear();
    this.contestsMap.clear();
    this.companiesMap.clear();

    for (const c of SEED_COMPANIES) this.companiesMap.set(c.slug, { ...c });
    for (const j of SEED_JOBS) this.jobsMap.set(j.slug, { ...j });
    for (const i of SEED_INTERNSHIPS) this.internshipsMap.set(i.slug, { ...i });
    for (const h of SEED_HACKATHONS) this.hackathonsMap.set(h.slug, { ...h });
    for (const ct of SEED_CONTESTS) this.contestsMap.set(ct.slug, { ...ct });
  }

  // --- Jobs ---
  public getJobs(): Job[] {
    return Array.from(this.jobsMap.values());
  }

  public getJobBySlug(slug: string): Job | undefined {
    return this.jobsMap.get(slug) || Array.from(this.jobsMap.values()).find((j) => j.id === slug);
  }

  public upsertJob(job: Job): void {
    this.jobsMap.set(job.slug, job);
    this.updateCompanyStats(job.company.slug, 'job');
  }

  // --- Internships ---
  public getInternships(): Internship[] {
    return Array.from(this.internshipsMap.values());
  }

  public getInternshipBySlug(slug: string): Internship | undefined {
    return this.internshipsMap.get(slug) || Array.from(this.internshipsMap.values()).find((i) => i.id === slug);
  }

  public upsertInternship(internship: Internship): void {
    this.internshipsMap.set(internship.slug, internship);
    this.updateCompanyStats(internship.company.slug, 'internship');
  }

  // --- Hackathons ---
  public getHackathons(): Hackathon[] {
    return Array.from(this.hackathonsMap.values());
  }

  public getHackathonBySlug(slug: string): Hackathon | undefined {
    return this.hackathonsMap.get(slug) || Array.from(this.hackathonsMap.values()).find((h) => h.id === slug);
  }

  public upsertHackathon(hackathon: Hackathon): void {
    this.hackathonsMap.set(hackathon.slug, hackathon);
  }

  // --- Contests ---
  public getContests(): Contest[] {
    return Array.from(this.contestsMap.values());
  }

  public getContestBySlug(slug: string): Contest | undefined {
    return this.contestsMap.get(slug) || Array.from(this.contestsMap.values()).find((c) => c.id === slug);
  }

  public upsertContest(contest: Contest): void {
    this.contestsMap.set(contest.slug, contest);
  }

  // --- Companies ---
  public getCompanies(): Company[] {
    return Array.from(this.companiesMap.values());
  }

  public getCompanyBySlug(slug: string): Company | undefined {
    return this.companiesMap.get(slug) || Array.from(this.companiesMap.values()).find((c) => c.id === slug);
  }

  public upsertCompany(company: Company): void {
    const existing = this.companiesMap.get(company.slug);
    if (existing) {
      this.companiesMap.set(company.slug, { ...existing, ...company });
    } else {
      this.companiesMap.set(company.slug, company);
    }
  }

  private updateCompanyStats(companySlug: string, type: 'job' | 'internship'): void {
    const company = this.companiesMap.get(companySlug);
    if (company) {
      if (type === 'job') company.stats.openJobsCount++;
      if (type === 'internship') company.stats.openInternshipsCount++;
      company.stats.totalOpportunities =
        company.stats.openJobsCount + company.stats.openInternshipsCount + company.stats.hackathonsCount;
    }
  }

  public getCounts() {
    return {
      jobs: this.jobsMap.size,
      internships: this.internshipsMap.size,
      hackathons: this.hackathonsMap.size,
      contests: this.contestsMap.size,
      companies: this.companiesMap.size,
      total: this.jobsMap.size + this.internshipsMap.size + this.hackathonsMap.size + this.contestsMap.size,
    };
  }
}

export const opportunityStore = new OpportunityStore();
