// ============================================================
// OPPORTUNE V4 — Application Tracker Service
// ============================================================

import { Application } from '../types/opportunity.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const applicationsStore: Map<string, Application> = new Map();

// Seed initial application
const DEMO_APPLICATION: Application = {
  id: 'app-1',
  userId: 'user-demo-1',
  opportunityId: 'job-2',
  opportunityType: 'job',
  opportunityTitle: 'Software Development Engineer II — Frontend',
  opportunitySlug: 'razorpay-software-development-engineer-2-frontend',
  companyName: 'Razorpay',
  companyLogoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop',
  location: 'Bengaluru, India',
  workplaceType: 'hybrid',
  status: 'interview',
  appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  compensation: '₹28,00,000 CTC',
  notes: [
    { id: 'note-1', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), content: 'Cleared recruiter call. Technical round scheduled with Engineering Lead.' },
  ],
  timeline: [
    { status: 'applied', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), note: 'Applied via official careers portal' },
    { status: 'screening', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), note: 'Recruiter reachout' },
    { status: 'interview', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Frontend system design scheduled' },
  ],
};
applicationsStore.set(DEMO_APPLICATION.id, DEMO_APPLICATION);

export class ApplicationsService {
  async getApplications(userId: string, status?: string): Promise<Application[]> {
    const list = Array.from(applicationsStore.values()).filter((a) => a.userId === userId || userId === 'guest');
    if (!status || status === 'all') {
      return list;
    }
    return list.filter((a) => a.status === status);
  }

  async getApplicationById(userId: string, id: string): Promise<Application> {
    const app = applicationsStore.get(id);
    if (!app || (app.userId !== userId && userId !== 'guest')) {
      throw new NotFoundError(`Application with id '${id}' not found`);
    }
    return app;
  }

  async createApplication(
    userId: string,
    input: {
      opportunityId: string;
      opportunityType: 'job' | 'internship';
      opportunityTitle: string;
      opportunitySlug: string;
      companyName: string;
      companyLogoUrl?: string | null;
      location?: string;
      status?: Application['status'];
      notes?: string;
    }
  ): Promise<Application> {
    const existing = Array.from(applicationsStore.values()).find(
      (a) => (a.userId === userId || userId === 'guest') && a.opportunityId === input.opportunityId
    );
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const app: Application = {
      id: `app-${Date.now()}`,
      userId,
      opportunityId: input.opportunityId,
      opportunityType: input.opportunityType,
      opportunityTitle: input.opportunityTitle,
      opportunitySlug: input.opportunitySlug,
      companyName: input.companyName,
      companyLogoUrl: input.companyLogoUrl || null,
      location: input.location || '',
      status: input.status || 'applied',
      appliedDate: now,
      updatedAt: now,
      notes: input.notes ? [{ id: `note-${Date.now()}`, createdAt: now, content: input.notes }] : [],
      timeline: [{ status: input.status || 'applied', timestamp: now, note: 'Created application tracker item' }],
    };

    applicationsStore.set(app.id, app);
    return app;
  }

  async updateApplication(
    userId: string,
    id: string,
    input: {
      status?: Application['status'];
      interviewDate?: string | null;
      compensation?: string | null;
      notes?: string;
    }
  ): Promise<Application> {
    const app = await this.getApplicationById(userId, id);
    const now = new Date().toISOString();

    if (input.status && input.status !== app.status) {
      app.status = input.status;
      app.timeline = app.timeline || [];
      app.timeline.push({
        status: input.status,
        timestamp: now,
        note: `Status updated to ${input.status}`,
      });
    }

    if (input.interviewDate !== undefined) {
      app.interviewDate = input.interviewDate;
    }

    if (input.compensation !== undefined) {
      app.compensation = input.compensation;
    }

    if (input.notes) {
      app.notes = app.notes || [];
      app.notes.push({
        id: `note-${Date.now()}`,
        createdAt: now,
        content: input.notes,
      });
    }

    app.updatedAt = now;
    applicationsStore.set(app.id, app);
    return app;
  }

  async deleteApplication(userId: string, id: string): Promise<boolean> {
    const app = await this.getApplicationById(userId, id);
    applicationsStore.delete(app.id);
    return true;
  }
}

export const applicationsService = new ApplicationsService();
