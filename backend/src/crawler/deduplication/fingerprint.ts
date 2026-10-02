// ============================================================
// OPPORTUNE V4 — Deduplication Fingerprint Generator
// Deterministic SHA-256 fingerprinting to prevent cross-run duplication
// ============================================================

import crypto from 'crypto';

export function generateJobFingerprint(companySlug: string, title: string, location: string): string {
  const normCompany = companySlug.trim().toLowerCase();
  const normTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normLoc = location.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const raw = `job:${normCompany}:${normTitle}:${normLoc}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function generateInternshipFingerprint(companySlug: string, title: string, location: string): string {
  const normCompany = companySlug.trim().toLowerCase();
  const normTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normLoc = location.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const raw = `internship:${normCompany}:${normTitle}:${normLoc}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function generateHackathonFingerprint(organizer: string, title: string, startDate: string): string {
  const normOrg = organizer.trim().toLowerCase();
  const normTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const dateKey = startDate.split('T')[0];
  const raw = `hackathon:${normOrg}:${normTitle}:${dateKey}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function generateContestFingerprint(platform: string, name: string, startTime: string): string {
  const normPlat = platform.trim().toLowerCase();
  const normName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const dateKey = startTime.split('T')[0];
  const raw = `contest:${normPlat}:${normName}:${dateKey}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}
