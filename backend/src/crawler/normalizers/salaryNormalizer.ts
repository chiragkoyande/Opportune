// ============================================================
// OPPORTUNE V4 — Salary & Stipend Normalizer
// Extracts structured salary data; strictly returns null if absent
// ============================================================

import { JobSalary, InternshipStipend } from '../../types/opportunity.js';

export function normalizeSalary(rawText?: string | null): JobSalary | null {
  if (!rawText || typeof rawText !== 'string') return null;

  const text = rawText.trim();
  if (!text || /confidential|undisclosed|not disclosed|competitive|as per market/i.test(text)) {
    return null;
  }

  // Detect currency
  let currency = 'INR';
  if (/\$|usd/i.test(text)) currency = 'USD';
  else if (/€|eur/i.test(text)) currency = 'EUR';
  else if (/£|gbp/i.test(text)) currency = 'GBP';

  // Detect period
  let period: JobSalary['period'] = 'year';
  if (/month|pm|\/mo/i.test(text)) period = 'month';
  else if (/hour|hr|\/hr/i.test(text)) period = 'hour';

  // Pattern: ₹25L - ₹40L or 25 - 40 LPA or ₹25L – ₹40L/yr
  const lpaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lac|l)?\s*(?:-|to|–)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lac|l)/i);
  if (lpaMatch) {
    const minVal = parseFloat(lpaMatch[1]) * 100000;
    const maxVal = parseFloat(lpaMatch[2]) * 100000;
    return {
      min: minVal,
      max: maxVal,
      currency: 'INR',
      period: 'year',
      formatted: `₹${lpaMatch[1]}L – ₹${lpaMatch[2]}L/yr`,
      isNegotiable: false,
    };
  }

  // Single LPA: 30 LPA or ₹30L
  const singleLpa = text.match(/₹?\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lac|l)/i);
  if (singleLpa) {
    const val = parseFloat(singleLpa[1]) * 100000;
    return {
      min: val,
      max: null,
      currency: 'INR',
      period: 'year',
      formatted: `₹${singleLpa[1]}L/yr`,
      isNegotiable: false,
    };
  }

  // Standard digits: ₹1,500,000 - ₹2,500,000
  const numbers = text.match(/\d[\d,.]*/g);
  if (numbers && numbers.length >= 2) {
    const n1 = parseFloat(numbers[0].replace(/,/g, ''));
    const n2 = parseFloat(numbers[1].replace(/,/g, ''));
    if (!isNaN(n1) && !isNaN(n2) && n1 > 1000) {
      return {
        min: Math.min(n1, n2),
        max: Math.max(n1, n2),
        currency,
        period,
        formatted: text,
        isNegotiable: false,
      };
    }
  }

  return null;
}

export function normalizeStipend(rawText?: string | null): InternshipStipend | null {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim();

  if (/unpaid/i.test(text)) {
    return {
      min: null,
      max: null,
      currency: 'INR',
      period: 'unpaid',
      formatted: 'Unpaid',
      isPerformanceBased: false,
    };
  }

  if (!text || /undisclosed|competitive/i.test(text)) {
    return null;
  }

  const nums = text.match(/\d[\d,.]*/g);
  if (nums && nums.length >= 2) {
    const n1 = parseFloat(nums[0].replace(/,/g, ''));
    const n2 = parseFloat(nums[1].replace(/,/g, ''));
    if (!isNaN(n1) && !isNaN(n2) && n1 > 100) {
      return {
        min: Math.min(n1, n2),
        max: Math.max(n1, n2),
        currency: 'INR',
        period: 'month',
        formatted: `₹${Math.min(n1, n2).toLocaleString('en-IN')} – ₹${Math.max(n1, n2).toLocaleString('en-IN')}/mo`,
        isPerformanceBased: /performance/i.test(text),
      };
    }
  } else if (nums && nums.length === 1) {
    const n = parseFloat(nums[0].replace(/,/g, ''));
    if (!isNaN(n) && n > 100) {
      return {
        min: n,
        max: null,
        currency: 'INR',
        period: 'month',
        formatted: `₹${n.toLocaleString('en-IN')}/mo`,
        isPerformanceBased: /performance/i.test(text),
      };
    }
  }

  return null;
}
