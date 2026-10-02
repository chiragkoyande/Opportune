// ============================================================
// OPPORTUNE V4 — Location Normalizer
// Standardizes city, country, and workplace mode with India-First prioritization
// ============================================================

import { JobWorkplaceType } from '../../types/opportunity.js';

const INDIAN_CITIES_MAP: Record<string, string> = {
  bengaluru: 'Bengaluru',
  bangalore: 'Bengaluru',
  hyderabad: 'Hyderabad',
  pune: 'Pune',
  mumbai: 'Mumbai',
  bombay: 'Mumbai',
  delhi: 'Delhi',
  'new delhi': 'Delhi',
  gurugram: 'Gurugram',
  gurgaon: 'Gurugram',
  noida: 'Noida',
  'greater noida': 'Noida',
  chennai: 'Chennai',
  madras: 'Chennai',
  kolkata: 'Kolkata',
  calcutta: 'Kolkata',
  ahmedabad: 'Ahmedabad',
  kochi: 'Kochi',
  cochin: 'Kochi',
  coimbatore: 'Coimbatore',
  indore: 'Indore',
  chandigarh: 'Chandigarh',
  jaipur: 'Jaipur',
  bhubaneswar: 'Bhubaneswar',
  trivandrum: 'Thiruvananthapuram',
  thiruvananthapuram: 'Thiruvananthapuram',
  nagpur: 'Nagpur',
  surat: 'Surat',
  visakhapatnam: 'Visakhapatnam',
  vizag: 'Visakhapatnam',
  vadodara: 'Vadodara',
  baroda: 'Vadodara',
  mysore: 'Mysuru',
  mysuru: 'Mysuru',
};

const INDIAN_STATES = [
  'karnataka',
  'maharashtra',
  'telangana',
  'tamil nadu',
  'kerala',
  'gujarat',
  'haryana',
  'uttar pradesh',
  'west bengal',
  'rajasthan',
  'punjab',
  'delhi ncr',
  'ncr',
];

const FOREIGN_COUNTRIES = [
  { name: 'United States', matches: ['united states', 'usa', 'u.s.', 'u.s.a.', 'san francisco', 'new york', 'seattle', 'austin', 'california', 'texas', 'washington', 'chicago', 'boston', 'los angeles', 'dc'] },
  { name: 'United Kingdom', matches: ['united kingdom', 'uk', 'u.k.', 'london', 'manchester', 'edinburgh', 'england', 'scotland'] },
  { name: 'Canada', matches: ['canada', 'toronto', 'vancouver', 'montreal', 'ontario', 'british columbia'] },
  { name: 'Germany', matches: ['germany', 'berlin', 'munich', 'frankfurt', 'deutschland'] },
  { name: 'France', matches: ['france', 'paris'] },
  { name: 'Ireland', matches: ['ireland', 'dublin'] },
  { name: 'Australia', matches: ['australia', 'sydney', 'melbourne', 'brisbane'] },
  { name: 'Singapore', matches: ['singapore'] },
  { name: 'Japan', matches: ['japan', 'tokyo'] },
  { name: 'Netherlands', matches: ['netherlands', 'amsterdam', 'holland'] },
  { name: 'Spain', matches: ['spain', 'madrid', 'barcelona'] },
  { name: 'Poland', matches: ['poland', 'warsaw', 'krakow'] },
  { name: 'China', matches: ['china', 'beijing', 'shanghai', 'shenzhen'] },
];

export interface NormalizedLocation {
  location: string;
  city: string;
  country: string;
  workplaceType: JobWorkplaceType;
  isIndia: boolean;
}

export function normalizeLocation(rawLocation?: string | null): NormalizedLocation {
  if (!rawLocation || typeof rawLocation !== 'string') {
    return {
      location: 'Bengaluru, India',
      city: 'Bengaluru',
      country: 'India',
      workplaceType: 'onsite',
      isIndia: true,
    };
  }

  const text = rawLocation.trim();
  const lower = text.toLowerCase();

  // Detect workplace type
  let workplaceType: JobWorkplaceType = 'onsite';
  if (/remote|anywhere|work from home|wfh|worldwide/i.test(lower)) {
    workplaceType = 'remote';
  } else if (/hybrid|flexible/i.test(lower)) {
    workplaceType = 'hybrid';
  }

  // Check for Indian city
  let detectedCity: string | null = null;
  for (const [key, canonical] of Object.entries(INDIAN_CITIES_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lower)) {
      detectedCity = canonical;
      break;
    }
  }

  // Check for Indian state
  let hasIndianState = false;
  if (!detectedCity) {
    for (const state of INDIAN_STATES) {
      if (new RegExp(`\\b${state}\\b`, 'i').test(lower)) {
        hasIndianState = true;
        detectedCity = 'India';
        break;
      }
    }
  }

  // Check for India keyword
  const hasIndiaExplicit =
    /\bindia\b|\bind\b|\bapac\b/i.test(lower) ||
    lower.includes('india - remote') ||
    lower.includes('remote (india)') ||
    lower.includes('remote, india') ||
    lower.includes('remote - india');

  const isIndia = Boolean(detectedCity || hasIndianState || hasIndiaExplicit);

  if (isIndia) {
    const finalCity = detectedCity || (workplaceType === 'remote' ? 'Remote' : 'Bengaluru');
    const location =
      workplaceType === 'remote'
        ? (detectedCity ? `${finalCity}, Remote (India)` : 'Remote (India)')
        : `${finalCity}, India`;

    return {
      location,
      city: finalCity,
      country: 'India',
      workplaceType,
      isIndia: true,
    };
  }

  // Detect foreign country
  let foreignCountry = 'International';
  for (const fc of FOREIGN_COUNTRIES) {
    if (fc.matches.some((m) => new RegExp(`\\b${m}\\b`, 'i').test(lower))) {
      foreignCountry = fc.name;
      break;
    }
  }

  // Clean raw city from text before comma or parentheses
  const firstPart = text.split(/[,;(]/)[0].trim();
  const cleanCity = firstPart.length > 2 && firstPart.length < 30 ? firstPart : foreignCountry;

  const location =
    workplaceType === 'remote'
      ? (foreignCountry !== 'International' ? `Remote (${foreignCountry})` : 'Remote (Global)')
      : (cleanCity !== foreignCountry ? `${cleanCity}, ${foreignCountry}` : foreignCountry);

  return {
    location,
    city: cleanCity,
    country: foreignCountry,
    workplaceType,
    isIndia: false,
  };
}
