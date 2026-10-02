// ============================================================
// Opportune V4 — User Profile & Preferences Service
// GET /api/v1/profile
// PATCH /api/v1/profile
// ============================================================

import { apiClient } from './api';
import { UserProfile, UserPreferences } from '@/types/user';
import { MOCK_USER_PROFILE } from './mockData';

let memoryProfile: UserProfile = { ...MOCK_USER_PROFILE };

export const profileService = {
  /**
   * Fetch current user profile
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/profile', {}, memoryProfile);
  },

  /**
   * Update user profile or preferences
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    memoryProfile = {
      ...memoryProfile,
      ...updates,
      preferences: {
        ...memoryProfile.preferences,
        ...(updates.preferences || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    return apiClient.patch<UserProfile>('/profile', updates, {}, memoryProfile);
  },

  /**
   * Update category discovery preferences (which categories appear in recommendations/homepage)
   */
  async updateCategoryPreferences(categories: UserPreferences['opportunityCategories']): Promise<UserProfile> {
    return this.updateProfile({
      preferences: {
        ...memoryProfile.preferences,
        opportunityCategories: categories,
      },
    });
  },
};
