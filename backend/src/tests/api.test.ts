// ============================================================
// OPPORTUNE V4 — Comprehensive Backend Test Suite
// Vitest + Supertest testing all API routes, schemas, and pipeline
// ============================================================

import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { crawlerOrchestrator } from '../crawler/engine/orchestrator.js';
import { generateJobFingerprint } from '../crawler/deduplication/fingerprint.js';
import { normalizeSalary, normalizeStipend } from '../crawler/normalizers/salaryNormalizer.js';
import { normalizeLocation } from '../crawler/normalizers/locationNormalizer.js';
import { validateOpportunityPayload } from '../crawler/validators/opportunityValidator.js';
import { crawlIndeedIndia } from '../crawler/connectors/indeed.connector.js';

const app = createApp();

describe('OPPORTUNE V4 API Test Suite', () => {
  // 1. Health Checks
  describe('Health Endpoints', () => {
    it('GET /health returns 200 ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('GET /api/v1/health returns 200 with service metadata', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.version).toBe('4.0.0');
    });

    it('GET /api/v1/health/crawler returns scheduler status', async () => {
      const res = await request(app).get('/api/v1/health/crawler');
      expect(res.status).toBe(200);
      expect(res.body.timezone).toBe('Asia/Kolkata');
    });

    it('GET /api/v1/health/sources returns active connectors', async () => {
      const res = await request(app).get('/api/v1/health/sources');
      expect(res.status).toBe(200);
      expect(res.body.activeConnectors).toContain('greenhouse');
      expect(res.body.activeConnectors).toContain('devfolio');
      expect(res.body.activeConnectors).toContain('linkedin');
      expect(res.body.activeConnectors).toContain('naukri');
      expect(res.body.activeConnectors).toContain('indeed');
    });
  });

  // 2. Jobs API
  describe('Jobs API', () => {
    it('GET /api/v1/jobs returns paginated envelope matching contract', async () => {
      const res = await request(app).get('/api/v1/jobs?limit=10&page=1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 10);
      expect(res.body).toHaveProperty('pageSize', 10);
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('hasNextPage');
      expect(res.body).toHaveProperty('hasMore');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/jobs/featured returns featured jobs list', async () => {
      const res = await request(app).get('/api/v1/jobs/featured?limit=2');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(2);
    });

    it('GET /api/v1/jobs/:slug returns valid job details', async () => {
      const res = await request(app).get('/api/v1/jobs/swiggy-senior-backend-engineer-distributed-systems');
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe('swiggy-senior-backend-engineer-distributed-systems');
      expect(res.body.company.name).toBe('Swiggy');
      expect(res.body.salary).not.toBeNull();
    });

    it('GET /api/v1/jobs/:slug returns 404 for non-existent job', async () => {
      const res = await request(app).get('/api/v1/jobs/non-existent-job-slug-12345');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });
  });

  // 3. Internships API
  describe('Internships API', () => {
    it('GET /api/v1/internships returns paginated internships', async () => {
      const res = await request(app).get('/api/v1/internships');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data[0]).toHaveProperty('duration');
      expect(res.body.data[0]).toHaveProperty('stipend');
    });

    it('GET /api/v1/internships/:slug returns internship details', async () => {
      const res = await request(app).get('/api/v1/internships/razorpay-software-engineering-intern-summer-2026');
      expect(res.status).toBe(200);
      expect(res.body.company.name).toBe('Razorpay');
      expect(res.body.ppoOffered).toBe(true);
    });
  });

  // 4. Hackathons API
  describe('Hackathons API', () => {
    it('GET /api/v1/hackathons returns hackathons with prize pools', async () => {
      const res = await request(app).get('/api/v1/hackathons');
      expect(res.status).toBe(200);
      expect(res.body.data[0]).toHaveProperty('prizePool');
      expect(res.body.data[0]).toHaveProperty('teamSize');
    });

    it('GET /api/v1/hackathons/trending returns trending hackathons', async () => {
      const res = await request(app).get('/api/v1/hackathons/trending?limit=2');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // 5. Coding Contests API
  describe('Coding Contests API', () => {
    it('GET /api/v1/contests returns coding contests with platforms', async () => {
      const res = await request(app).get('/api/v1/contests');
      expect(res.status).toBe(200);
      expect(res.body.data[0]).toHaveProperty('platform');
      expect(res.body.data[0]).toHaveProperty('startTime');
    });

    it('GET /api/v1/contests/upcoming returns upcoming contests', async () => {
      const res = await request(app).get('/api/v1/contests/upcoming');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // 6. Companies API
  describe('Companies API', () => {
    it('GET /api/v1/companies returns verified companies with stats', async () => {
      const res = await request(app).get('/api/v1/companies');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('stats');
    });

    it('GET /api/v1/companies/:slug returns company detail', async () => {
      const res = await request(app).get('/api/v1/companies/swiggy');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Swiggy');
    });
  });

  // 7. Search API
  describe('Search API', () => {
    it('GET /api/v1/search executes cross-category unified search', async () => {
      const res = await request(app).get('/api/v1/search?q=engineer');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('jobs');
      expect(res.body).toHaveProperty('internships');
      expect(res.body).toHaveProperty('hackathons');
      expect(res.body).toHaveProperty('contests');
      expect(res.body).toHaveProperty('totalResults');
    });

    it('GET /api/v1/search/suggest returns autocomplete suggestions', async () => {
      const res = await request(app).get('/api/v1/search/suggest?q=swiggy');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('suggestions');
      expect(Array.isArray(res.body.suggestions)).toBe(true);
    });
  });

  // 8. Bookmarks API
  describe('Bookmarks API', () => {
    it('GET /api/v1/bookmarks returns user bookmarks', async () => {
      const res = await request(app).get('/api/v1/bookmarks');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/v1/bookmarks creates a new bookmark', async () => {
      const res = await request(app)
        .post('/api/v1/bookmarks')
        .send({
          category: 'jobs',
          targetId: 'job-999',
          targetSlug: 'test-job',
          title: 'Test Engineer',
          organization: 'Test Org',
        });
      expect(res.status).toBe(201);
      expect(res.body.targetId).toBe('job-999');
    });
  });

  // 9. Applications Tracker API
  describe('Applications Tracker API', () => {
    it('GET /api/v1/applications returns user application tracker list', async () => {
      const res = await request(app).get('/api/v1/applications');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/v1/applications adds new application', async () => {
      const res = await request(app)
        .post('/api/v1/applications')
        .send({
          opportunityId: 'job-test-101',
          opportunityType: 'job',
          opportunityTitle: 'Frontend Engineer',
          opportunitySlug: 'frontend-engineer-test',
          companyName: 'Test Company',
        });
      expect(res.status).toBe(201);
      expect(res.body.companyName).toBe('Test Company');
    });
  });

  // 10. Profile API
  describe('Profile API', () => {
    it('GET /api/v1/profile returns user profile with preferences', async () => {
      const res = await request(app).get('/api/v1/profile');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('skills');
      expect(res.body).toHaveProperty('preferences');
    });
  });

  // 11. Crawler Pipeline & Normalizers
  describe('Crawler Engine & Ingestion Pipeline', () => {
    it('Normalizes LPA salary correctly', () => {
      const sal = normalizeSalary('₹25L - ₹40L');
      expect(sal).not.toBeNull();
      expect(sal?.min).toBe(2500000);
      expect(sal?.max).toBe(4000000);
      expect(sal?.currency).toBe('INR');
    });

    it('Returns null for confidential salary (never fabricates data)', () => {
      const sal = normalizeSalary('Competitive salary undisclosed');
      expect(sal).toBeNull();
    });

    it('Normalizes unpaid stipend', () => {
      const stip = normalizeStipend('Unpaid internship');
      expect(stip?.period).toBe('unpaid');
    });

    it('Normalizes location and detects remote workplace', () => {
      const loc = normalizeLocation('Remote, India');
      expect(loc.workplaceType).toBe('remote');
      expect(loc.country).toBe('India');
    });

    it('Generates deterministic deduplication fingerprints', () => {
      const fp1 = generateJobFingerprint('swiggy', 'Software Engineer', 'Bengaluru, India');
      const fp2 = generateJobFingerprint('swiggy', 'Software Engineer', 'Bengaluru, India');
      const fp3 = generateJobFingerprint('razorpay', 'Software Engineer', 'Bengaluru, India');
      expect(fp1).toBe(fp2);
      expect(fp1).not.toBe(fp3);
    });

    it('Validates opportunity payload correctly', () => {
      const validRes = validateOpportunityPayload('job', {
        title: 'Backend Engineer',
        applyUrl: 'https://example.com/apply',
        company: { name: 'Acme Corp' },
      });
      expect(validRes.isValid).toBe(true);

      const invalidRes = validateOpportunityPayload('job', {
        title: 'AB', // too short
        applyUrl: 'invalid-url',
      });
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.errors.length).toBeGreaterThan(0);
    });

    it('Runs controlled pipeline with deduplication and staging', async () => {
      const result = await crawlerOrchestrator.runPipeline('test-source', [
        {
          category: 'job',
          externalId: 'ext-1',
          title: 'Staff Engineer',
          companyName: 'Acme',
          companySlug: 'acme',
          rawLocation: 'Bengaluru',
          applyUrl: 'https://acme.com/apply/1',
          sourcePlatform: 'greenhouse',
        },
        {
          category: 'job',
          externalId: 'ext-2',
          title: 'Staff Engineer',
          companyName: 'Acme',
          companySlug: 'acme',
          rawLocation: 'Bengaluru',
          applyUrl: 'https://acme.com/apply/1',
          sourcePlatform: 'greenhouse',
        }, // duplicate!
      ]);

      expect(result.totalDiscovered).toBe(2);
      expect(result.totalPublished).toBe(1);
      expect(result.totalDuplicates).toBe(1);
    });

    it('crawlIndeedIndia returns valid India jobs and internships', async () => {
      const indeedItems = await crawlIndeedIndia();
      expect(indeedItems.length).toBeGreaterThan(0);
      for (const item of indeedItems) {
        expect(['job', 'internship']).toContain(item.category);
        expect(item.sourcePlatform).toBe('indeed');
        expect(item.applyUrl).toMatch(/^https?:\/\//);
        expect(item.rawLocation).toBeDefined();
      }
    });

    it('GET /api/v1/admin/crawler/sources lists linkedin, naukri, and indeed', async () => {
      const res = await request(app).get('/api/v1/admin/crawler/sources');
      expect(res.status).toBe(200);
      const slugs = res.body.map((s: { slug: string }) => s.slug);
      expect(slugs).toContain('linkedin-india');
      expect(slugs).toContain('naukri-india');
      expect(slugs).toContain('indeed-india');
    });

    it('Ingests multi-source India items (LinkedIn, Naukri, Indeed) cleanly', async () => {
      const res = await crawlerOrchestrator.runPipeline('india-scrapers-test', [
        {
          category: 'job',
          externalId: 'li-test-999',
          title: 'Senior Systems Engineer',
          companyName: 'Test Tech Corp',
          companySlug: 'test-tech-corp',
          rawLocation: 'Hyderabad, Telangana, India',
          applyUrl: 'https://in.linkedin.com/jobs/view/999',
          sourcePlatform: 'linkedin',
        },
        {
          category: 'internship',
          externalId: 'nk-test-888',
          title: 'Full Stack Engineering Intern',
          companyName: 'Test Startup India',
          companySlug: 'test-startup-india',
          rawLocation: 'Pune, Maharashtra, India',
          applyUrl: 'https://www.naukri.com/job-listings-test-888',
          sourcePlatform: 'naukri',
        },
        {
          category: 'job',
          externalId: 'ind-test-777',
          title: 'Cloud DevOps Architect',
          companyName: 'Fintech Hub',
          companySlug: 'fintech-hub',
          rawLocation: 'Bengaluru, Karnataka, India',
          applyUrl: 'https://in.indeed.com/viewjob?jk=777',
          sourcePlatform: 'indeed',
        },
      ]);

      expect(res.totalDiscovered).toBe(3);
      expect(res.totalPublished).toBe(3);
      expect(res.totalErrors).toBe(0);
    });
  });
});
