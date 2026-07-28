import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'opportune:bookmarked-jobs';

function readBookmarks(): string[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function useJobBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(readBookmarks());
  }, []);

  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

  const toggleBookmark = (jobId: string, title: string) => {
    setBookmarkedIds((current) => {
      const exists = current.includes(jobId);
      const next = exists ? current.filter((id) => id !== jobId) : [jobId, ...current];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      toast.success(exists ? 'Removed from saved jobs' : 'Saved job', {
        description: title,
      });
      return next;
    });
  };

  return {
    bookmarkedIds,
    isBookmarked: (jobId: string) => bookmarkedSet.has(jobId),
    toggleBookmark,
  };
}
