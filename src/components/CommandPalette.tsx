// ============================================================
// CMD+K Command Palette — Instant Search
// Uses cmdk (already installed) for keyboard-driven search
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Search, Rocket, Briefcase, Zap, GraduationCap, GitBranch,
  Award, Trophy, Building2, Microscope, ArrowRight, Clock,
  TrendingUp, Sparkles, BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_META, type OpportunityCategory } from '@/types/opportunity';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  deadline: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  hackathon: Rocket,
  internship: Briefcase,
  job: Building2,
  contest: Zap,
  scholarship: GraduationCap,
  fellowship: Award,
  open_source: GitBranch,
  research: Microscope,
  competition: Trophy,
  bootcamp: BookOpen,
};

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 250);

  // CMD+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('opportune_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('id, slug, title, organization, type, deadline')
          .eq('is_active', true)
          .gte('deadline', new Date().toISOString())
          .or(`title.ilike.%${debouncedQuery}%,organization.ilike.%${debouncedQuery}%`)
          .order('deadline', { ascending: true })
          .limit(8);

        if (!error && data) {
          setResults(data.map((r) => ({
            id: r.id,
            slug: (r as Record<string, unknown>).slug as string || r.id,
            title: r.title,
            organization: r.organization,
            category: (r.type as OpportunityCategory) || 'hackathon',
            deadline: r.deadline,
          })));
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('opportune_recent_searches', JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const handleSelect = (slug: string) => {
    if (query) saveRecentSearch(query);
    setOpen(false);
    setQuery('');
    navigate(`/opportunity/${slug}`);
  };

  const handleCategorySelect = (category: string) => {
    setOpen(false);
    setQuery('');
    navigate(`/explore?category=${category}`);
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setOpen(false);
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search opportunities, companies, categories..."
        value={query}
        onValueChange={setQuery}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length === 0) {
            handleSearchSubmit();
          }
        }}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Searching...
            </div>
          ) : query.length >= 2 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No results found for "{query}"</p>
              <button
                onClick={handleSearchSubmit}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Search all opportunities
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">Type to search...</p>
          )}
        </CommandEmpty>

        {/* Search Results */}
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result) => {
              const Icon = CATEGORY_ICONS[result.category] || Rocket;
              return (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result.slug)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${CATEGORY_META[result.category]?.gradient || 'from-primary to-primary/70'}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.organization}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Recent Searches */}
        {!query && recentSearches.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent">
              {recentSearches.map((term) => (
                <CommandItem
                  key={term}
                  onSelect={() => {
                    setQuery(term);
                    navigate(`/explore?q=${encodeURIComponent(term)}`);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-sm">{term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Quick Categories */}
        {!query && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Categories">
              {['hackathon', 'internship', 'contest', 'scholarship', 'fellowship', 'open_source'].map((catId) => {
                const cat = CATEGORY_META[catId as OpportunityCategory];
                const Icon = CATEGORY_ICONS[catId] || Rocket;
                return (
                  <CommandItem
                    key={catId}
                    onSelect={() => handleCategorySelect(catId)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{cat?.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
