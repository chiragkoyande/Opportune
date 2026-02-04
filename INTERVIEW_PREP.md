# Opportune - Technical Interview Preparation Guide

> **Comprehensive Interview Prep Document**  
> Generated for deep technical interview preparation. Covers every aspect of the codebase.

---

## SECTION 1: PROJECT UNDERSTANDING

### What Problem Does This Project Solve?

**Opportune** is a one-stop aggregation platform that solves the **fragmentation problem** in the opportunity discovery space. Students and developers typically need to check 10-15 different websites (MLH, Devfolio, Unstop, Codeforces, LeetCode, LinkedIn, etc.) to find hackathons, internships, and coding contests.

**The Core Problem:**
- Opportunities are scattered across 50+ platforms
- Students miss deadlines because they can't track everything
- No unified interface to compare, filter, and save opportunities

**The Solution:**
- Aggregates opportunities from multiple sources (APIs, web scraping, curated lists)
- Real-time updates from live APIs like Codeforces
- Smart filtering by type, deadline, location
- Side-by-side comparison of up to 3 opportunities
- AI-powered project ideas and interview prep tips

### Who Are the Users?

1. **Primary Users**: College students and early-career developers looking for hackathons, internships, and coding contests
2. **Secondary Users**: Admins who curate and manage opportunities in the database

### Core Features

| Feature | Description |
|---------|-------------|
| **Opportunity Aggregation** | Pulls from Codeforces API, Firecrawl web scraping, Supabase DB, and curated lists |
| **Smart Filtering** | Filter by type (hackathon/internship/contest), deadline, location, search |
| **Compare Tool** | Compare up to 3 opportunities side-by-side |
| **Favorites** | Save opportunities to your profile (requires auth) |
| **AI Ideas** | Get project ideas for hackathons, prep tips for internships, contest strategies |
| **Admin Panel** | Full CRUD for opportunities + user role management |
| **Dark Mode** | Theme support via next-themes |

### High-Level Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + Vite)                      │
│  ┌─────────┐ ┌─────────────┐ ┌────────────┐ ┌────────────────────────┐│
│  │ Index   │ │OpportunityGrid│ │OpportunityCard│ │ Auth/Admin/Favorites ││
│  └────┬────┘ └──────┬──────┘ └──────┬─────┘ └───────────┬────────────┘│
│       │             │               │                   │              │
│       └─────────────┴───────────────┴───────────────────┘              │
│                              │                                        │
│                    ┌─────────┴─────────┐                              │
│                    │  useOpportunities  │                              │
│                    │  useAuth/useFavorites                            │
│                    └─────────┬─────────┘                              │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
┌──────────────────────────────┼────────────────────────────────────────┐
│                         SUPABASE                                       │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────────┐   │
│  │ PostgreSQL DB │  │ Auth Service  │  │ Edge Functions           │   │
│  │ - opportunities│  │ - users       │  │ - fetch-opportunities    │   │
│  │ - favorites    │  │ - sessions    │  │ - generate-ideas        │   │
│  │ - user_roles   │  │               │  │ - get-user-by-email     │   │
│  └───────────────┘  └───────────────┘  └──────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼───────┐  ┌───────▼───────┐  ┌──────▼──────┐
    │ Codeforces API│  │ Firecrawl API │  │ Curated Data│
    │ (Live Contests)│  │ (Web Scraping)│  │ (Hardcoded) │
    └───────────────┘  └───────────────┘  └─────────────┘
```

---

## SECTION 2: TECH STACK & SETUP QUESTIONS

### Q1: What is the tech stack of this project?

**Frontend:**
- **React 18.3** - UI framework with functional components and hooks
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Lightning-fast dev server and build tool
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Radix UI + shadcn/ui** - Accessible, composable component primitives
- **TanStack Query 5** - Server state management and caching
- **React Router 6** - Client-side routing
- **Framer Motion** - Animations

**Backend:**
- **Supabase** - PostgreSQL database + Auth + Edge Functions
- **Supabase Edge Functions** (Deno runtime) - Serverless functions for AI and web scraping
- **Firecrawl API** - Web scraping for hackathon discovery

**Key Libraries:**
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `date-fns` - Date manipulation
- `zod` - Schema validation
- `react-hook-form` - Form handling

---

### Q2: Why did you choose Vite over Create React App?

**Answer:**
1. **Speed**: Vite uses native ES modules during development, making cold starts nearly instantaneous (vs CRA's bundling approach)
2. **Hot Module Replacement (HMR)**: Updates are reflected instantly without full page reload
3. **Smaller bundle size**: Better tree-shaking and code-splitting
4. **Modern tooling**: Uses esbuild for transpilation which is 10-100x faster than Babel
5. **Future-proof**: CRA is in maintenance mode; Vite is actively developed

---

### Q3: Why Supabase over Firebase or a custom backend?

**Answer:**
1. **PostgreSQL**: Full SQL support with proper relationships vs Firebase's NoSQL
2. **Row-Level Security**: Built-in auth + RLS for data protection
3. **Edge Functions**: Deno-based serverless functions (similar to Vercel/Netlify)
4. **Open Source**: Can self-host if needed
5. **Generous Free Tier**: Good for MVPs and prototypes
6. **Real-time Subscriptions**: Built-in Postgres NOTIFY/LISTEN

---

### Q4: Explain the project structure

**Answer:**
```
src/
├── App.tsx              # Root component with providers and routes
├── main.tsx             # Entry point (disables console in production)
├── components/          # 18 custom components + 49 shadcn/ui components
│   ├── OpportunityGrid.tsx  # Main grid with filtering/sorting
│   ├── OpportunityCard.tsx  # Individual card with favorites/compare
│   └── ui/                  # shadcn/ui primitives
├── hooks/               # 10 custom hooks for state management
│   ├── useOpportunities.tsx  # Data fetching from all sources
│   ├── useAuth.tsx          # Supabase authentication
│   ├── useAdmin.tsx         # Admin role verification
│   ├── useFavorites.tsx     # Favorites CRUD
│   └── useCompare.tsx       # Compare context (max 3 items)
├── pages/               # 6 route pages
├── integrations/supabase/  # Supabase client and types
└── types/               # TypeScript interfaces
```

---

### Q5: How do you run this project locally?

```bash
# Clone and install
git clone https://github.com/chiragkoyande/Opportune.git
cd Opportune
npm install

# Set up environment variables
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# Start development server
npm run dev  # Runs on http://localhost:8080
```

---

### Q6: What do the environment variables control?

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key for client-side auth |
| `FIRECRAWL_API_KEY` (Edge Function) | API key for web scraping |
| `LOVABLE_API_KEY` (Edge Function) | API key for AI idea generation |

---

### Q7: What is the entry point of the application?

**Answer:** `src/main.tsx`

```tsx
if (import.meta.env.PROD) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
}

createRoot(document.getElementById("root")!).render(<App />);
```

**Key insight:** Console logging is completely disabled in production for performance and security.

---

## SECTION 3: FILE-BY-FILE INTERVIEW QUESTIONS

---

### `src/App.tsx` - Application Root

**What it does:** Sets up the entire application with providers, routing, and global components.

#### Q8: Explain the provider hierarchy in App.tsx. Why does order matter?

**Answer:**
```tsx
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <TooltipProvider>
      <Toaster /> <Sonner />
      <BrowserRouter>
        <Routes>...</Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
```

The order matters because:
1. **QueryClientProvider** must be outermost so all components can use TanStack Query
2. **ThemeProvider** wraps everything so theme context is available everywhere
3. **TooltipProvider** from Radix must wrap components using tooltips
4. **BrowserRouter** contains Routes which define page components

---

### `src/hooks/useOpportunities.tsx` - Core Data Fetching

**What it does:** The MOST IMPORTANT file - aggregates opportunities from 4 sources (Supabase DB, Codeforces API, Firecrawl Edge Function, curated data).

#### Q9: Walk me through the data fetching strategy in useOpportunities.tsx

**Answer:**
1. **Database First**: Fetches from Supabase `opportunities` table with `is_active = true`
2. **Live APIs**: Calls Codeforces API for upcoming contests
3. **Web Scraping**: Invokes Supabase Edge Function `fetch-opportunities` which uses Firecrawl
4. **Curated Fallback**: Has 40+ hardcoded opportunities for reliability
5. **Immediate Display**: Shows curated data immediately while APIs load (progressive loading)
6. **Deduplication**: Uses a `Set` to remove duplicate titles
7. **Sorting**: Sorts by deadline (soonest first)

---

#### Q10: Why is there so much hardcoded data in useOpportunities?

**Answer:** This is a **defensive design pattern**:
1. **API Reliability**: Codeforces/Firecrawl might be down or rate-limited
2. **CORS Issues**: Browser can't call some APIs directly (CodeChef, HackerEarth removed for this reason)
3. **Immediate UX**: Users see content immediately while live data loads
4. **Quality Control**: Curated data is verified and properly formatted

---

#### Q11: How does the deduplication logic work?

**Answer:**
```typescript
const seen = new Set<string>();
const uniqueLive = futureLiveOpportunities.filter((opp) => {
  const key = opp.title.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
```

It normalizes titles to lowercase and uses a Set for O(1) lookup. **Limitation**: Could miss duplicates with slightly different titles.

---

#### Q12: What happens if all APIs fail?

**Answer:** The hook has multiple fallback layers:
1. Empty `try/catch` blocks with silent failures
2. Curated opportunities are always pushed
3. Error state only set if the entire function throws
4. Users always see content due to hardcoded data

---

#### Q13: Why use `useCallback` for fetchOpportunities?

**Answer:** To prevent infinite re-renders in `useEffect`. Without `useCallback`, the function would be recreated on every render, causing the dependency array `[fetchOpportunities]` to always detect a change.

---

### `src/hooks/useAuth.tsx` - Authentication

**What it does:** Manages Supabase authentication state with reactive updates.

#### Q14: Explain the authentication flow

**Answer:**
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }
);

supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  setUser(session?.user ?? null);
  setLoading(false);
});
```

Two-pronged approach:
1. **Subscription**: Listens for real-time auth changes (login, logout, token refresh)
2. **Initial fetch**: Gets the current session on component mount
3. **Cleanup**: Unsubscribes on unmount to prevent memory leaks

---

#### Q15: Why is there both a subscription AND an initial getSession call?

**Answer:** Because `onAuthStateChange` only fires on **state changes**, not on initial load. The `getSession()` call handles:
- Page refresh (session exists but no change event)
- Bookmark navigation directly to a protected route

---

### `src/hooks/useAdmin.tsx` - Admin Role Verification

**What it does:** Two-tier admin check - hardcoded emails + database roles.

#### Q16: Why are admin emails hardcoded? Isn't that a security risk?

**Answer:**
```typescript
const ADMIN_EMAILS = ['chiragkoyande4@gmail.com'];

if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
  setIsAdmin(true);
  return;
}
```

**Defense:**
1. This is a **client-side check** for UI purposes only
2. Real authorization happens via **Supabase Row-Level Security (RLS)**
3. Even if someone bypasses this, database operations would fail
4. It's a **convenience pattern** for the primary admin to always have access

**Improvement Suggestion:** Move admin emails to environment variables instead of hardcoding.

---

#### Q17: What is the purpose of `checkedUserId` ref?

**Answer:**
```typescript
const checkedUserId = useRef<string | null>(null);

if (checkedUserId.current === user.id) {
  return;
}
```

Prevents duplicate database queries when:
1. useEffect runs multiple times due to dependency changes
2. User refreshes the page
3. Component remounts during navigation

---

### `src/hooks/useFavorites.tsx` - Favorites Management

#### Q18: How are favorites persisted?

**Answer:** Stored in Supabase `favorites` table with this schema:
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `opportunity_id`: String identifier
- `opportunity_title`: Denormalized for quick display
- `opportunity_type`: For filtering
- `opportunity_data`: Full opportunity JSON for offline-like access

---

#### Q19: Why store `opportunity_data` as JSON? Isn't that redundant?

**Answer:** **Trade-off analysis:**
- **Pro**: Full data available even if the opportunity is deleted from main table
- **Pro**: Faster rendering without joining tables
- **Con**: Data can become stale if opportunity is updated
- **Con**: Storage overhead

This is a **snapshot pattern** - preserving the state at time of favoriting.

---

### `src/hooks/useCompare.tsx` - Compare Feature

#### Q20: Why use Context API for compare instead of a hook like favorites?

**Answer:**
```typescript
const CompareContext = createContext<CompareContextType | undefined>(undefined);
const MAX_COMPARE_ITEMS = 3;

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareList, setCompareList] = useState<Opportunity[]>([]);
  // ...
};
```

**Reasons:**
1. Compare list needs to be **shared across distant components** (card, bar, modal)
2. No database persistence needed - it's a **session-only feature**
3. Wrapped around Index page only (not globally)
4. Maximum of 3 items limits memory usage

---

#### Q21: What happens if you try to add more than 3 items?

**Answer:**
```typescript
const addToCompare = useCallback((opportunity: Opportunity) => {
  setCompareList(prev => {
    if (prev.length >= MAX_COMPARE_ITEMS) return prev; // Silent reject
    if (prev.some(o => o.id === opportunity.id)) return prev; // No duplicates
    return [...prev, opportunity];
  });
}, []);
```

The card component shows a toast error ("You can compare up to 3 opportunities") before calling `addToCompare`.

---

### `src/components/OpportunityGrid.tsx` - Filtering & Sorting

#### Q22: How does the filtering system work?

**Answer:** Multiple `useMemo` chains:
```typescript
const filteredOpportunities = useMemo(() => {
  return opportunities.filter((opp) => {
    const matchesFilter = activeFilter === 'all' || opp.type === activeFilter;
    const matchesSearch = searchQuery === '' || opp.title.toLowerCase().includes(...);
    const matchesDeadline = deadlineFilter === 'all' || daysUntil <= threshold;
    const matchesLocation = locationFilter === 'all' || opp.location?.toLowerCase() === ...;
    return matchesFilter && matchesSearch && matchesDeadline && matchesLocation;
  });
}, [opportunities, activeFilter, searchQuery, deadlineFilter, locationFilter]);

const sortedOpportunities = useMemo(() => {
  return [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case 'deadline': return a.deadline.getTime() - b.deadline.getTime();
      case 'recent': return b.deadline.getTime() - a.deadline.getTime();
      case 'title': return a.title.localeCompare(b.title);
    }
  });
}, [filteredOpportunities, sortBy]);
```

---

#### Q23: Why are there TWO useMemo calls instead of one?

**Answer:** **Separation of concerns** and **performance optimization**:
1. Filtering logic is expensive - only recalculated when filter values change
2. Sorting is separate - changing sort doesn't re-run filtering
3. Each depends on different state slices

---

### `src/components/OpportunityCard.tsx` - Card Component

#### Q24: Explain the AI ideas feature implementation

**Answer:**
```typescript
const fetchIdeas = async () => {
  setLoadingIdeas(true);
  try {
    const { data, error } = await supabase.functions.invoke('generate-ideas', {
      body: { opportunity: { title, organization, description, type, tags, prize, location } }
    });
    
    if (error || !data?.ideas?.length) {
      setIdeas(getFallbackIdeas()); // Fallback to pre-defined ideas
    } else {
      setIdeas(data.ideas);
    }
  } catch {
    setIdeas(getFallbackIdeas());
  }
};
```

**Key patterns:**
1. **Lazy loading**: Only fetches when dialog opens
2. **Graceful degradation**: Falls back to hardcoded ideas if AI fails
3. **Type-specific prompts**: Different prompts for hackathons, internships, contests

---

#### Q25: What is the TiltCard component doing?

**Answer:** Creates a 3D tilt effect on hover using CSS transforms. Parameters:
- `tiltMaxAngle={8}`: Maximum tilt in degrees
- `glareEnable={true}`: Adds a light glare effect

This is a **premade component** for enhancing visual appeal.

---

### `src/pages/Admin.tsx` - Admin Panel

#### Q26: Explain the CRUD operations for opportunities

**Answer:**
```typescript
// CREATE
await supabase.from('opportunities').insert([payload]);

// READ
const { data } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });

// UPDATE
await supabase.from('opportunities').update(payload).eq('id', editingId);

// DELETE
await supabase.from('opportunities').delete().eq('id', id);
```

**Note:** All operations use the same Supabase client. Authorization is enforced by RLS policies.

---

#### Q27: How is admin access protected?

**Answer:** Three layers:
1. **Client-side check**: `useAdmin()` hook prevents rendering
2. **Navigation guard**: Redirects to home if not admin
3. **Server-side RLS**: Supabase policies reject unauthorized writes

```typescript
useEffect(() => {
  if (!adminLoading && !authLoading && user && !isAdmin) {
    toast({ title: 'Access Denied', variant: 'destructive' });
    navigate('/');
  }
}, [isAdmin, adminLoading, authLoading, user, navigate, toast]);
```

---

### `supabase/functions/fetch-opportunities/index.ts` - Web Scraping

#### Q28: How does the Firecrawl web scraping work?

**Answer:**
```typescript
const response = await fetch('https://api.firecrawl.dev/v1/search', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({
    query: 'upcoming hackathons 2026 registration open',
    limit: 10,
    scrapeOptions: { formats: ['markdown'] },
  }),
});
```

**Process:**
1. Sends semantic search queries to Firecrawl
2. Gets markdown-formatted content from scraped pages
3. Parses dates, locations, prizes using regex patterns
4. Extracts tags based on keyword matching
5. Returns normalized opportunity objects

---

#### Q29: What happens if FIRECRAWL_API_KEY is not set?

**Answer:**
```typescript
if (firecrawlApiKey) {
  // Parallel scraping from multiple sources
} else {
  console.log('FIRECRAWL_API_KEY not set, using curated data only');
  opportunities.push(...curatedHackathons);
}
```

Gracefully falls back to hardcoded curated data.

---

### `supabase/functions/generate-ideas/index.ts` - AI Integration

#### Q30: How does the AI prompt engineering work?

**Answer:** Different prompts for each opportunity type:
```typescript
if (type === 'internship') {
  systemPrompt = 'You are a career coach helping students prepare for internship interviews.';
  userPrompt = `Generate 4 specific interview prep tips for:\nTitle: ${title}\nCompany: ${organization}...`;
} else if (type === 'hackathon') {
  systemPrompt = 'You are a hackathon mentor helping participants come up with innovative project ideas.';
  // ...
}
```

Uses **Gemini 2.5 Flash** via Lovable's gateway. Response is parsed as JSON array.

---

## SECTION 4: CORE LOGIC & BUSINESS FLOW

---

### Q31: What is the complete data flow when the homepage loads?

**Answer:**
1. `Index.tsx` renders with `useOpportunities()` hook
2. Hook sets `loading=true` and calls `fetchOpportunities()`
3. **Parallel operations:**
   - Fetch from Supabase DB
   - Fetch from Codeforces API
   - Invoke Firecrawl Edge Function
   - Load curated data
4. **Early display:** Curated data shows immediately
5. **Merge & dedupe:** All sources combined, duplicates removed
6. **Sort by deadline:** Soonest first
7. `OpportunityGrid` receives sorted data and applies client-side filters
8. `OpportunityCard` renders each item with favorites/compare state

---

### Q32: What happens when a user clicks "Add to Favorites"?

**Answer:**
1. `OpportunityCard` calls `toggleFavorite(opportunity)`
2. `useFavorites` checks if already favorited → calls `addFavorite()` or `removeFavorite()`
3. If not logged in → shows toast "Sign in required"
4. If logged in → insert into Supabase `favorites` table
5. Re-fetches favorites list to update UI
6. Shows success toast

---

### Q33: How does the Compare feature work end-to-end?

**Answer:**
1. Click compare icon on card → `addToCompare(opportunity)`
2. `useCompare` context adds to `compareList[]` (max 3)
3. `CompareBar` appears at bottom with count
4. Click "Compare" button → opens `CompareModal`
5. Modal renders table with side-by-side comparison
6. Can click "Apply" button directly from modal

---

### Q34: What happens if Codeforces API fails?

**Answer:**
```typescript
try {
  const response = await fetch('https://codeforces.com/api/contest.list');
  // ...
} catch {
  // Silently fail - curated data will be used
}
```

**Nothing visible happens.** The user still sees curated contests. This is the **"fail gracefully"** pattern.

---

## SECTION 5: ADVANCED & SENIOR-LEVEL QUESTIONS

---

### Q35: What are the performance bottlenecks in this application?

**Answer:**
1. **Initial load**: Multiple parallel API calls (Supabase, Codeforces, Edge Function)
2. **Filtering**: Re-running filter logic on 70+ items on every keystroke
3. **No virtualization**: Rendering all cards at once (not windowed)
4. **AI generation**: Cold start on Edge Functions can take 2-3 seconds

**Optimizations Already Applied:**
- `useMemo` for filtering/sorting
- `useCallback` for event handlers
- Progressive loading (curated data first)

---

### Q36: How would you scale this to 10,000+ opportunities?

**Answer:**
1. **Server-side filtering**: Move filtering to Supabase queries instead of client-side
2. **Pagination/Infinite scroll**: Use cursor-based pagination
3. **Virtualization**: Use `react-window` or `@tanstack/react-virtual` for windowed rendering
4. **Caching**: Implement TanStack Query caching with stale-while-revalidate
5. **Search index**: Use Supabase Full-Text Search or Algolia for instant search

---

### Q37: What security vulnerabilities exist in this codebase?

**Answer:**
1. **Hardcoded admin emails**: Should be in environment variables or database
2. **Client-side auth checks**: Can be bypassed (but RLS protects actual data)
3. **No rate limiting**: Edge functions could be spammed
4. **Console disabled in production**: Makes debugging harder, but also hides error details from attackers

**Mitigations in place:**
- Row-Level Security (RLS) on Supabase tables
- API keys are not exposed to client (only via Edge Functions)
- Auth tokens are stored securely via Supabase client

---

### Q38: Are there any race conditions in this code?

**Answer:**
Yes, potential race conditions in `useOpportunities`:
```typescript
// Multiple setOpportunities calls can happen in any order
setOpportunities(earlyCurated); // Immediate
// ... later ...
setOpportunities(combined); // After APIs resolve
```

**Impact:** Users might see opportunities disappear briefly if curated data differs from final merged data.

**Fix:** Use a single state update at the end, or use `useState` updater function to merge states.

---

### Q39: What's the memory footprint of the Compare feature?

**Answer:**
```typescript
const [compareList, setCompareList] = useState<Opportunity[]>([]);
const MAX_COMPARE_ITEMS = 3;
```

- Maximum 3 opportunities stored
- Each opportunity is ~500 bytes (estimated)
- Total: ~1.5 KB maximum

**Why is this important?** Compare is in Context, which re-renders all children when updated. Limiting to 3 items prevents performance issues.

---

### Q40: Why is console logging disabled in production?

**Answer:**
```typescript
if (import.meta.env.PROD) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
}
```

**Reasons:**
1. **Performance**: Console operations are synchronous and slow
2. **Security**: Prevents leaking sensitive data in browser console
3. **Professionalism**: End users shouldn't see debug logs

**Trade-off:** Makes production debugging harder. Consider using a service like Sentry for error tracking.

---

### Q41: What's the trade-off of using curated hardcoded data?

**Answer:**
| Pros | Cons |
|------|------|
| Always available | Can become stale |
| Fast loading | Increases bundle size |
| Quality controlled | Manual updates needed |
| Works offline | Duplicates with live data |

---

## SECTION 6: AI-CODE & WEAK-AREA DEFENSE

---

### Q42: Which parts of the code look auto-generated?

**Answer:**
1. **shadcn/ui components** (`src/components/ui/`) - Official CLI-generated
2. **Supabase types** (`src/integrations/supabase/types.ts`) - Auto-generated from schema
3. **Curated opportunity lists** - Likely AI-assisted due to consistent formatting
4. **Tailwind config** - Standard shadcn setup

**How to justify:**
> "These are standard boilerplate components from shadcn/ui. I customized them for our color scheme and added custom CSS variables for hackathon/internship/contest theming."

---

### Q43: What improvements would you make to sound senior?

**Answer:**
1. **Add React Query caching:**
   ```typescript
   const { data: opportunities } = useQuery({
     queryKey: ['opportunities'],
     queryFn: fetchOpportunities,
     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
   });
   ```

2. **Implement optimistic updates for favorites:**
   > "Instead of refetching after each favorite toggle, I'd update the UI immediately and rollback on error."

3. **Add error boundary:**
   > "I'd wrap OpportunityGrid in an ErrorBoundary to gracefully handle render failures."

4. **Debounce search:**
   > "The search input should debounce by 300ms to avoid filtering on every keystroke."

---

## SECTION 7: RAPID-FIRE INTERVIEW ROUND

---

### 20 Quick-Fire Questions (1-2 line answers)

| # | Question | Answer |
|---|----------|--------|
| Q44 | What React version is used? | React 18.3 with concurrent features |
| Q45 | What state management is used? | TanStack Query for server state, Context for compare, useState for local |
| Q46 | How is routing implemented? | react-router-dom v6 with BrowserRouter |
| Q47 | What database is used? | Supabase (PostgreSQL) |
| Q48 | Where is user authentication stored? | Supabase Auth with localStorage persistence |
| Q49 | What is the build tool? | Vite 5.4 |
| Q50 | How are styles scoped? | TailwindCSS with utility classes + custom CSS variables |
| Q51 | What icon library is used? | lucide-react |
| Q52 | How many opportunity types exist? | 3: hackathon, internship, contest |
| Q53 | What's the max items in compare? | 3 |
| Q54 | How is dark mode implemented? | next-themes ThemeProvider |
| Q55 | What API returns live contests? | Codeforces API |
| Q56 | What is Firecrawl used for? | Web scraping hackathon data |
| Q57 | What AI model generates ideas? | Gemini 2.5 Flash |
| Q58 | Where are Edge Functions deployed? | Supabase (Deno runtime) |
| Q59 | What validates form data? | zod + react-hook-form |
| Q60 | How are toasts displayed? | sonner library |
| Q61 | What animation library is used? | Framer Motion + Tailwind keyframes |
| Q62 | What is RLS? | Row-Level Security - database permissions |
| Q63 | How is the bundle optimized? | Vite's tree-shaking + code-splitting |

---

### 10 Deep-Dive Questions

---

#### Q64: Explain the complete authentication flow from signup to protected route access

**Answer:**
1. User visits `/auth` and switches to signup mode
2. Enters email/password, form validates (min 6 chars)
3. Supabase `auth.signUp()` creates user in `auth.users`
4. `onAuthStateChange` fires with new session
5. `useAuth` updates user state, triggers re-render
6. `Auth.tsx` useEffect detects session, navigates to `/`
7. Protected routes (favorites, admin) check `user` from `useAuth()`
8. If no user, redirect to `/auth`
9. Sessions persist via localStorage, auto-refresh before expiry

---

#### Q65: How would you implement infinite scroll for opportunities?

**Answer:**
1. Add `limit` and `offset` to `fetchOpportunities`
2. Use IntersectionObserver to detect when user scrolls near bottom
3. Increment offset and append new opportunities to state
4. Add "loading more" indicator
5. Stop when API returns empty array (no more data)

```typescript
const [offset, setOffset] = useState(0);
const observerRef = useRef<IntersectionObserver>();

useEffect(() => {
  observerRef.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setOffset(prev => prev + 20);
    }
  });
  observerRef.current.observe(document.querySelector('#load-trigger'));
}, []);
```

---

#### Q66: How does the Admin role system work at the database level?

**Answer:**
1. `user_roles` table with (`user_id`, `role`) columns
2. RLS policy: Users can only read their own roles
3. Admin can insert/update roles for any user
4. `useAdmin` hook checks:
   - First: Hardcoded email list (bypass for owner)
   - Second: Query `user_roles` table for role='admin'
5. UI shows/hides admin features based on `isAdmin` state

---

#### Q67: What's the difference between useMemo and useCallback in this codebase?

**Answer:**
- **useMemo**: Memoizes computed values (filtering, sorting)
  ```typescript
  const filteredOpportunities = useMemo(() => opportunities.filter(...), [deps]);
  ```
- **useCallback**: Memoizes function references (event handlers)
  ```typescript
  const addToCompare = useCallback((opp) => { ... }, []);
  ```

Both prevent unnecessary re-computations/re-renders when dependencies haven't changed.

---

#### Q68: How does the Edge Function handle CORS?

**Answer:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

1. Preflight OPTIONS request returns allowed headers
2. All responses include CORS headers
3. `*` allows any origin (could be restricted in production)

---

#### Q69: How would you add unit tests to this codebase?

**Answer:**
1. Add Vitest (Vite-native testing): `npm install -D vitest @testing-library/react`
2. Test hooks with `renderHook` from testing-library
3. Mock Supabase client for isolation
4. Test components with `render` + assertions

```typescript
// Example test for useCompare
test('adds opportunity to compare list', () => {
  const { result } = renderHook(() => useCompare(), { wrapper: CompareProvider });
  act(() => result.current.addToCompare(mockOpportunity));
  expect(result.current.compareList).toHaveLength(1);
});
```

---

#### Q70: How does the TypeScript type system protect this codebase?

**Answer:**
1. **Opportunity interface**: Enforces required fields
2. **OpportunityType union**: Only 'hackathon' | 'internship' | 'contest' allowed
3. **Supabase types**: Auto-generated from DB schema
4. **Component props**: Interfaces for all props
5. **Strict null checks**: `opp.location?.toLowerCase()` prevents runtime errors

---

#### Q71: What's the deployment strategy for this app?

**Answer:**
1. Push to GitHub triggers Vercel deployment
2. Vite builds static files to `dist/`
3. Vercel serves static assets from CDN
4. Supabase functions are deployed separately via `supabase deploy`
5. Environment variables configured in Vercel dashboard

---

#### Q72: How would you add offline support?

**Answer:**
1. Service Worker for static asset caching
2. IndexedDB for storing opportunity data
3. TanStack Query's `persistQueryClient` for automatic persistence
4. Show cached data when offline
5. Queue writes for sync when online

---

#### Q73: What monitoring would you add for production?

**Answer:**
1. **Sentry** for error tracking
2. **Vercel Analytics** for performance metrics
3. **Supabase Dashboard** for database queries
4. **Custom logging** to external service (replace disabled console)
5. **Uptime monitoring** for Edge Functions

---

### 5 System Design Questions

---

#### Q74: How would you design a notification system for deadline reminders?

**Answer:**
1. **Database**: Add `deadline_notifications` table tracking user preferences
2. **Scheduler**: Supabase pg_cron job runs daily
3. **Email Service**: Edge Function triggers SendGrid/Resend
4. **Push Notifications**: Use web push API with service worker
5. **User Settings**: Allow choosing reminder timing (1 day, 1 week before)

---

#### Q75: How would you scale the web scraping to handle 100 sources?

**Answer:**
1. **Queue System**: Use Redis/BullMQ for job queuing
2. **Rate Limiting**: Configurable delays per source
3. **Caching**: Store scraped data in Redis with TTL
4. **Parallel Workers**: Multiple Edge Functions or dedicated workers
5. **Error Handling**: Retry logic with exponential backoff
6. **Monitoring**: Track success/failure rates per source

---

#### Q76: Design a collaborative filtering recommendation system

**Answer:**
1. Track user favorites and clicks
2. Build user-user similarity matrix
3. Recommend opportunities liked by similar users
4. Cold start: Use content-based filtering (tags, type)
5. Store embeddings in Supabase pgvector
6. Run similarity queries for real-time recommendations

---

#### Q77: How would you implement real-time opportunity updates?

**Answer:**
1. Supabase Realtime subscription on `opportunities` table
2. When admin adds/updates opportunity, triggers NOTIFY
3. Client receives update via WebSocket
4. Merge new data into existing state
5. Show "New opportunities available" toast

```typescript
supabase
  .channel('opportunities')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' },
    (payload) => refetch())
  .subscribe();
```

---

#### Q78: Design a multi-tenant version for universities

**Answer:**
1. **Database**: Add `organization_id` to all tables
2. **Subdomain routing**: `mit.opportune.app`
3. **Custom branding**: Per-org colors, logos
4. **Admin hierarchy**: Super admin → Org admin → User
5. **Data isolation**: RLS policies filter by org
6. **SSO Integration**: SAML/OAuth with university IdP

---

## Final Preparation Tips

1. **Run the project locally** and click through every feature
2. **Read the Supabase dashboard** to understand the database schema
3. **Practice explaining the data flow** with a whiteboard
4. **Prepare 3 improvements** you'd make if given more time
5. **Know the WHY** behind every technology choice

---

**Good luck with your interview! 🚀**
