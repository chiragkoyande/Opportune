// ============================================================
// Opportune V4 — Application Tracker Service
// GET /api/v1/applications
// POST /api/v1/applications
// PATCH /api/v1/applications/:id
// ============================================================

import { apiClient } from './api';
import {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/types/application';
import { MOCK_APPLICATIONS } from './mockData';

let memoryApplications = [...MOCK_APPLICATIONS];

export const applicationsService = {
  /**
   * Fetch all user job & internship applications
   */
  async getApplications(): Promise<Application[]> {
    return apiClient.get<Application[]>('/applications', {}, memoryApplications);
  },

  /**
   * Create new tracked application
   */
  async createApplication(input: CreateApplicationInput): Promise<Application> {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      userId: 'user-demo-1',
      opportunityId: input.opportunityId,
      opportunityType: input.opportunityType,
      opportunityTitle: input.opportunityTitle,
      opportunitySlug: input.opportunitySlug,
      companyName: input.companyName,
      companyLogoUrl: input.companyLogoUrl || null,
      location: input.location,
      status: input.status || 'applied',
      appliedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: input.notes
        ? [{ id: `note-${Date.now()}`, createdAt: new Date().toISOString(), content: input.notes }]
        : [],
      timeline: [
        {
          status: input.status || 'applied',
          timestamp: new Date().toISOString(),
          note: 'Application tracked on Opportune',
        },
      ],
    };

    memoryApplications = [newApp, ...memoryApplications];

    return apiClient.post<Application>('/applications', input, {}, newApp);
  },

  /**
   * Update application status, notes, interview date, or compensation
   */
  async updateApplication(id: string, update: UpdateApplicationInput): Promise<Application> {
    const existing = memoryApplications.find((a) => a.id === id);
    if (!existing) {
      throw new Error(`Application with ID ${id} not found`);
    }

    const updatedTimeline = [...(existing.timeline || [])];
    if (update.status && update.status !== existing.status) {
      updatedTimeline.push({
        status: update.status,
        timestamp: new Date().toISOString(),
        note: `Status changed to ${update.status}`,
      });
    }

    const updatedNotes = [...(existing.notes || [])];
    if (update.notes) {
      updatedNotes.push({
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
        content: update.notes,
      });
    }

    const updated: Application = {
      ...existing,
      status: update.status || existing.status,
      interviewDate: update.interviewDate !== undefined ? update.interviewDate : existing.interviewDate,
      compensation: update.compensation !== undefined ? update.compensation : existing.compensation,
      notes: updatedNotes,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    };

    memoryApplications = memoryApplications.map((a) => (a.id === id ? updated : a));

    return apiClient.patch<Application>(`/applications/${id}`, update, {}, updated);
  },

  /**
   * Delete tracked application
   */
  async deleteApplication(id: string): Promise<{ success: boolean }> {
    memoryApplications = memoryApplications.filter((a) => a.id !== id);
    return apiClient.delete<{ success: boolean }>(`/applications/${id}`, {}, { success: true });
  },
};
