// ============================================================
// OPPORTUNE V4 — Opportunity Validator
// Strictly enforces mandatory fields and metadata validity
// ============================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateOpportunityPayload(category: string, payload: Record<string, any>): ValidationResult {
  const errors: string[] = [];

  // Common requirements
  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters long');
  }

  if (!payload.applyUrl || typeof payload.applyUrl !== 'string' || !payload.applyUrl.startsWith('http')) {
    errors.push('Valid HTTP/HTTPS application URL is required');
  }

  // Category specific requirements
  if (category === 'job' || category === 'internship') {
    if (!payload.company || (!payload.company.name && !payload.company_name)) {
      errors.push('Company identity is required');
    }
  }

  if (category === 'hackathon') {
    if (!payload.organizer || (!payload.organizer.name && !payload.organizer_name)) {
      errors.push('Organizer is required for hackathons');
    }
    if (!payload.registrationDeadline && !payload.registration_deadline) {
      errors.push('Registration deadline is required for hackathons');
    }
  }

  if (category === 'contest') {
    if (!payload.platform) {
      errors.push('Platform (e.g. Codeforces, LeetCode) is required for contests');
    }
    if (!payload.startTime && !payload.start_time) {
      errors.push('Start time is required for contests');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
