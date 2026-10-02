// ============================================================
// Opportune V4 — Application Tracker Types
// Dedicated types for Job & Internship Application tracking
// ============================================================

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer Received',
  rejected: 'Rejected',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  saved: { bg: 'bg-secondary/60', text: 'text-muted-foreground', border: 'border-border' },
  applied: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  screening: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  interview: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  offer: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  rejected: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/30' },
};

export interface ApplicationNote {
  id: string;
  createdAt: string;
  content: string;
}

export interface ApplicationTimelineEvent {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
}

export interface Application {
  id: string;
  userId: string;
  opportunityId: string;
  opportunityType: 'job' | 'internship';
  opportunityTitle: string;
  opportunitySlug: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  workplaceType?: string;
  status: ApplicationStatus;
  appliedDate: string;
  updatedAt: string;
  interviewDate?: string | null;
  compensation?: string | null;
  notes?: ApplicationNote[];
  timeline?: ApplicationTimelineEvent[];
}

export interface CreateApplicationInput {
  opportunityId: string;
  opportunityType: 'job' | 'internship';
  opportunityTitle: string;
  opportunitySlug: string;
  companyName: string;
  companyLogoUrl?: string | null;
  location: string;
  status?: ApplicationStatus;
  notes?: string;
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus;
  interviewDate?: string | null;
  compensation?: string | null;
  notes?: string;
}
