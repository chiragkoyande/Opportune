// ============================================================
// OPPORTUNE V4 — Bookmarks Service
// ============================================================

import { Bookmark, BookmarkCollection, OpportunityCategory } from '../types/opportunity.js';

// In-memory persistent cache for user bookmarks
const bookmarksStore: Map<string, Bookmark> = new Map();
const collectionsStore: Map<string, BookmarkCollection> = new Map();

// Seed initial demo bookmarks
const DEMO_BOOKMARK: Bookmark = {
  id: 'bm-1',
  userId: 'user-demo-1',
  category: 'jobs',
  targetId: 'job-1',
  targetSlug: 'swiggy-senior-backend-engineer-distributed-systems',
  title: 'Senior Backend Engineer — Distributed Systems',
  organization: 'Swiggy',
  logoUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=128&h=128&fit=crop',
  location: 'Bengaluru, India',
  meta: { salary: '₹32L – ₹55L/yr', workplaceType: 'hybrid' },
  savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
};
bookmarksStore.set(DEMO_BOOKMARK.id, DEMO_BOOKMARK);

const DEMO_COLLECTION: BookmarkCollection = {
  id: 'col-1',
  name: 'Dream Companies 2026',
  description: 'Top Indian tech companies to apply to this quarter',
  category: 'all',
  bookmarksCount: 1,
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};
collectionsStore.set(DEMO_COLLECTION.id, DEMO_COLLECTION);

export class BookmarksService {
  async getBookmarks(userId: string, category?: OpportunityCategory | 'all'): Promise<Bookmark[]> {
    const list = Array.from(bookmarksStore.values()).filter((b) => b.userId === userId || userId === 'guest');
    if (!category || category === 'all') {
      return list;
    }
    return list.filter((b) => b.category === category);
  }

  async addBookmark(
    userId: string,
    input: {
      category: OpportunityCategory;
      targetId: string;
      targetSlug: string;
      title: string;
      organization: string;
      logoUrl?: string | null;
      location?: string;
      meta?: Record<string, unknown>;
      collectionId?: string;
    }
  ): Promise<Bookmark> {
    const existing = Array.from(bookmarksStore.values()).find(
      (b) => (b.userId === userId || userId === 'guest') && (b.targetId === input.targetId || b.targetSlug === input.targetSlug)
    );
    if (existing) {
      return existing;
    }

    const bookmark: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      category: input.category,
      targetId: input.targetId,
      targetSlug: input.targetSlug,
      title: input.title,
      organization: input.organization,
      logoUrl: input.logoUrl || null,
      location: input.location,
      meta: input.meta || {},
      collectionId: input.collectionId,
      savedAt: new Date().toISOString(),
    };

    bookmarksStore.set(bookmark.id, bookmark);
    return bookmark;
  }

  async removeBookmark(userId: string, idOrTargetId: string): Promise<boolean> {
    for (const [id, bm] of bookmarksStore.entries()) {
      if ((bm.userId === userId || userId === 'guest') && (id === idOrTargetId || bm.targetId === idOrTargetId || bm.targetSlug === idOrTargetId)) {
        bookmarksStore.delete(id);
        return true;
      }
    }
    return true;
  }

  async getCollections(_userId: string): Promise<BookmarkCollection[]> {
    return Array.from(collectionsStore.values());
  }

  async createCollection(
    _userId: string,
    name: string,
    description?: string,
    category: OpportunityCategory | 'all' = 'all'
  ): Promise<BookmarkCollection> {
    const col: BookmarkCollection = {
      id: `col-${Date.now()}`,
      name,
      description,
      category,
      bookmarksCount: 0,
      createdAt: new Date().toISOString(),
    };
    collectionsStore.set(col.id, col);
    return col;
  }
}

export const bookmarksService = new BookmarksService();
