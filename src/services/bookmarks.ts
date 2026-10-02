// ============================================================
// Opportune V4 — Bookmarks Service
// GET /api/v1/bookmarks
// POST /api/v1/bookmarks
// DELETE /api/v1/bookmarks/:id
// ============================================================

import { apiClient } from './api';
import { Bookmark, BookmarkCollection, OpportunityCategoryKey } from '@/types/user';
import { MOCK_BOOKMARKS, MOCK_COLLECTIONS } from './mockData';

// Local memory store for client mutations during session
let memoryBookmarks = [...MOCK_BOOKMARKS];
let memoryCollections = [...MOCK_COLLECTIONS];

export const bookmarksService = {
  /**
   * Fetch all bookmarks for the authenticated user
   */
  async getBookmarks(category?: OpportunityCategoryKey | 'all'): Promise<Bookmark[]> {
    const fallback =
      !category || category === 'all'
        ? memoryBookmarks
        : memoryBookmarks.filter((b) => b.category === category);

    return apiClient.get<Bookmark[]>(
      '/bookmarks',
      { params: { category: category !== 'all' ? category : undefined } },
      fallback
    );
  },

  /**
   * Save an opportunity bookmark
   */
  async addBookmark(bookmarkInput: Omit<Bookmark, 'id' | 'savedAt' | 'userId'>): Promise<Bookmark> {
    const newBookmark: Bookmark = {
      ...bookmarkInput,
      id: `bm-${Date.now()}`,
      userId: 'user-demo-1',
      savedAt: new Date().toISOString(),
    };

    memoryBookmarks = [newBookmark, ...memoryBookmarks];

    return apiClient.post<Bookmark>('/bookmarks', bookmarkInput, {}, newBookmark);
  },

  /**
   * Remove a bookmark by ID or target ID
   */
  async removeBookmark(idOrTargetId: string): Promise<{ success: boolean }> {
    memoryBookmarks = memoryBookmarks.filter(
      (b) => b.id !== idOrTargetId && b.targetId !== idOrTargetId
    );

    return apiClient.delete<{ success: boolean }>(`/bookmarks/${idOrTargetId}`, {}, { success: true });
  },

  /**
   * Check if a specific opportunity target is bookmarked
   */
  isBookmarked(targetIdOrSlug: string): boolean {
    return memoryBookmarks.some(
      (b) => b.targetId === targetIdOrSlug || b.targetSlug === targetIdOrSlug
    );
  },

  /**
   * Fetch bookmark collections
   */
  async getCollections(): Promise<BookmarkCollection[]> {
    return apiClient.get<BookmarkCollection[]>('/bookmarks/collections', {}, memoryCollections);
  },

  /**
   * Create a new bookmark collection
   */
  async createCollection(name: string, description?: string): Promise<BookmarkCollection> {
    const newCol: BookmarkCollection = {
      id: `col-${Date.now()}`,
      name,
      description,
      bookmarksCount: 0,
      createdAt: new Date().toISOString(),
    };
    memoryCollections = [newCol, ...memoryCollections];
    return apiClient.post<BookmarkCollection>('/bookmarks/collections', { name, description }, {}, newCol);
  },
};
