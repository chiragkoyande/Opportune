// ============================================================
// Opportune V4 — Saved Opportunities Page
// Section 18: User Bookmarks & Collections
// Tabs: All, Jobs, Internships, Hackathons, Contests
// Search saved items, category filtering, collections, remove bookmark
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bookmark,
  Briefcase,
  GraduationCap,
  Rocket,
  Trophy,
  Search,
  Trash2,
  ExternalLink,
  Plus,
  Folder,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/lib/seo';
import { bookmarksService } from '@/services/bookmarks';
import { OpportunityCategoryKey } from '@/types/user';
import { EmptyState, ErrorState } from '@/components/ui/StatusStates';
import { useToast } from '@/hooks/use-toast';

export const SavedPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch bookmarks and collections
  const { data: bookmarks = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => bookmarksService.getBookmarks('all'),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['bookmark-collections'],
    queryFn: () => bookmarksService.getCollections(),
  });

  // Remove bookmark mutation
  const removeMutation = useMutation({
    mutationFn: (id: string) => bookmarksService.removeBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast({ title: 'Bookmark removed' });
    },
  });

  const filteredBookmarks = bookmarks.filter((bm) => {
    const matchesTab = activeTab === 'all' || bm.category === activeTab;
    const matchesSearch =
      !searchFilter ||
      bm.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      bm.organization.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTargetUrl = (category: OpportunityCategoryKey, slug: string) => {
    switch (category) {
      case 'jobs':
        return `/jobs/${slug}`;
      case 'internships':
        return `/internships/${slug}`;
      case 'hackathons':
        return `/hackathons/${slug}`;
      case 'contests':
        return `/contests/${slug}`;
      default:
        return '#';
    }
  };

  const getCategoryBadge = (category: OpportunityCategoryKey) => {
    switch (category) {
      case 'jobs':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-job uppercase">
            <Briefcase className="h-3 w-3" /> Job
          </span>
        );
      case 'internships':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-internship uppercase">
            <GraduationCap className="h-3 w-3" /> Internship
          </span>
        );
      case 'hackathons':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-hackathon uppercase">
            <Rocket className="h-3 w-3" /> Hackathon
          </span>
        );
      case 'contests':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-contest uppercase">
            <Trophy className="h-3 w-3" /> Contest
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title="Saved Opportunities & Collections | Opportune"
        description="Review and manage your saved tech jobs, internships, hackathons, and contests."
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <Bookmark className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">My Library</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Saved Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Organize your target jobs, application deadlines, hackathons, and contest calendar.
          </p>
        </div>
      </div>

      {/* Collections Carousel / Row */}
      {collections.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5 text-primary" />
            Curated Collections
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {collections.map((col) => (
              <div
                key={col.id}
                className="p-3.5 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition-colors cursor-pointer group"
                onClick={() => col.category && col.category !== 'all' && setActiveTab(col.category)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                    {col.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                    {col.bookmarksCount}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{col.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search within bookmarks */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter saved opportunities by keyword..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="pl-10 h-10 text-xs sm:text-sm bg-card border-border/80 rounded-xl max-w-md"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-border/50 pb-px overflow-x-auto">
          <TabsList className="bg-transparent p-0 gap-2 h-auto">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              All ({bookmarks.length})
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-job/10 data-[state=active]:text-job rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <Briefcase className="h-3 w-3" />
              Jobs ({bookmarks.filter((b) => b.category === 'jobs').length})
            </TabsTrigger>
            <TabsTrigger
              value="internships"
              className="data-[state=active]:bg-internship/10 data-[state=active]:text-internship rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <GraduationCap className="h-3 w-3" />
              Internships ({bookmarks.filter((b) => b.category === 'internships').length})
            </TabsTrigger>
            <TabsTrigger
              value="hackathons"
              className="data-[state=active]:bg-hackathon/10 data-[state=active]:text-hackathon rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <Rocket className="h-3 w-3" />
              Hackathons ({bookmarks.filter((b) => b.category === 'hackathons').length})
            </TabsTrigger>
            <TabsTrigger
              value="contests"
              className="data-[state=active]:bg-contest/10 data-[state=active]:text-contest rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <Trophy className="h-3 w-3" />
              Contests ({bookmarks.filter((b) => b.category === 'contests').length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Empty state */}
        {!isLoading && !isError && filteredBookmarks.length === 0 && (
          <EmptyState
            title="No saved opportunities yet"
            message="When you browse jobs, internships, hackathons or contests, tap the bookmark icon to save them here."
            actionLabel="Explore Jobs"
            actionLink="/jobs"
            secondaryActionLabel="Explore Hackathons"
            onSecondaryAction={() => (window.location.href = '/hackathons')}
          />
        )}

        {/* Saved List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    {getCategoryBadge(bookmark.category)}
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mt-1">
                      {bookmark.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{bookmark.organization}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMutation.mutate(bookmark.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Metadata badges */}
                <div className="my-3 py-2 border-y border-border/40 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {Object.entries(bookmark.meta || {}).map(([key, val]) => (
                    <span key={key} className="inline-flex items-center px-2 py-0.5 rounded bg-secondary/50 text-[11px]">
                      {String(val)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">
                  Saved {new Date(bookmark.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>

                <Button asChild variant="outline" size="sm" className="h-7 text-xs border-border/60 gap-1">
                  <Link to={getTargetUrl(bookmark.category, bookmark.targetSlug)}>
                    View Opportunity <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default SavedPage;
