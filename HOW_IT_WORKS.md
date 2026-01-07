# 🧠 How Opportune Works - A Beginner's Guide

This document explains how the Opportune project works, broken down into simple terms that anyone can understand.

---

## 📋 Table of Contents

1. [What is Opportune?](#what-is-opportune)
2. [How the Frontend Works](#how-the-frontend-works)
3. [How Supabase Works](#how-supabase-works)
4. [How Edge Functions Work](#how-edge-functions-work)
5. [How Firecrawl Works](#how-firecrawl-works)
6. [Data Flow Diagram](#data-flow-diagram)
7. [File Structure Explained](#file-structure-explained)

---

## 🎯 What is Opportune?

**Opportune** is a website that helps students find:
- 🚀 **Hackathons** - Coding competitions where you build projects
- 💼 **Internships** - Work opportunities at tech companies
- ⚡ **Coding Contests** - Competitive programming challenges

Instead of visiting 50 different websites, users can find everything in one place!

### Simple Analogy
Think of Opportune like **Google for tech opportunities**. Google searches the entire internet and shows you results. Opportune searches hackathon/internship websites and shows you the best opportunities.

---

## 🖥️ How the Frontend Works

The frontend is what users see and interact with in their browser.

### Technology: React + TypeScript

**React** is a JavaScript library for building user interfaces. Instead of writing plain HTML, we write "components" - reusable pieces of UI.

**TypeScript** is JavaScript with types. It helps catch errors before running the code.

### Example Component Flow:

```
User visits website
        ↓
App.tsx loads (main component)
        ↓
Index.tsx renders (home page)
        ↓
OpportunityGrid.tsx shows opportunities
        ↓
OpportunityCard.tsx displays each opportunity
```

### Key Files:

| File | What it does |
|------|--------------|
| `src/pages/Index.tsx` | Home page with all opportunities |
| `src/pages/Auth.tsx` | Login/signup page |
| `src/pages/Admin.tsx` | Admin panel for managing data |
| `src/components/OpportunityCard.tsx` | Single opportunity card |
| `src/components/Header.tsx` | Navigation bar at top |

### How Data is Fetched:

```jsx
// In useOpportunities.tsx hook
const { opportunities, loading } = useOpportunities();

// This hook:
// 1. Calls Supabase database
// 2. Calls external APIs (Codeforces)
// 3. Calls Edge Functions (Firecrawl)
// 4. Combines all data
// 5. Returns to the component
```

---

## 🗄️ How Supabase Works

**Supabase** is our "backend" - it handles:
- 📦 **Database** - Stores opportunities, users, favorites
- 🔐 **Authentication** - User login/signup
- ⚡ **Edge Functions** - Serverless code that runs on demand

### Simple Analogy
Supabase is like **Google Sheets + User Login + Mini Server** combined:
- Database = Google Sheets (stores data in tables)
- Auth = Login system (manages user accounts)
- Edge Functions = Mini programs that run when called

### Database Tables:

```sql
-- opportunities table
id | title | type | organization | deadline | apply_url
---------------------------------------------------------
1  | SIH 2026 | hackathon | Government | 2026-09-15 | sih.gov.in

-- user_roles table
user_id | role
-----------------
abc123  | admin

-- favorites table
user_id | opportunity_id
-------------------------
abc123  | 1
```

### How We Connect to Supabase:

```typescript
// In src/integrations/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

// These come from .env file
const SUPABASE_URL = 'https://yourproject.supabase.co';
const SUPABASE_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

### Fetching Data from Database:

```typescript
// Get all active opportunities
const { data, error } = await supabase
  .from('opportunities')        // Table name
  .select('*')                  // Get all columns
  .eq('is_active', true)        // Where is_active = true
  .order('deadline');           // Sort by deadline
```

---

## ⚡ How Edge Functions Work

**Edge Functions** are small programs that run on Supabase's servers (not in the user's browser).

### Why Use Edge Functions?

1. **Security** - API keys stay on server, not exposed to users
2. **Performance** - Run closer to data sources
3. **No CORS** - Can call any API without browser restrictions

### Simple Analogy
Edge Functions are like **robot helpers**:
- You send them a message: "Hey, go get hackathon data!"
- They run on Supabase servers
- They fetch data from external websites
- They send the data back to you

### Our Edge Functions:

**1. fetch-opportunities** (in `supabase/functions/fetch-opportunities/`)
- Purpose: Scrapes hackathon websites using Firecrawl
- Returns: List of hackathons with deadlines

**2. generate-ideas** (in `supabase/functions/generate-ideas/`)
- Purpose: Generates project ideas using AI
- Returns: 4 creative ideas for the hackathon

### How to Call an Edge Function:

```typescript
// From frontend
const { data, error } = await supabase.functions.invoke(
  'fetch-opportunities',  // Function name
  { body: {} }            // Data to send
);

// data = { success: true, data: [...opportunities] }
```

### Edge Function Code Structure:

```typescript
// supabase/functions/fetch-opportunities/index.ts

import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  // 1. Get API keys from environment
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  // 2. Call external API (Firecrawl)
  const response = await fetch('https://api.firecrawl.dev/search', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ query: 'hackathons 2026' })
  });
  
  // 3. Process and return data
  const data = await response.json();
  
  return new Response(JSON.stringify({ success: true, data }));
});
```

---

## 🔥 How Firecrawl Works

**Firecrawl** is a web scraping service. It visits websites and extracts data.

### Simple Analogy
Firecrawl is like a **research assistant**:
- You tell it: "Find hackathons from Devfolio"
- It visits Devfolio.co
- It reads the page content
- It extracts hackathon names, dates, and links
- It gives you organized data

### Why Use Firecrawl?

1. **No Manual Scraping** - You don't need to write complex code
2. **Handles JavaScript** - Works on modern websites
3. **Multiple Sources** - Searches across the web

### How We Use Firecrawl:

```typescript
// In the Edge Function

const firecrawl = new FirecrawlApp({ apiKey: 'your-key' });

// Search for hackathons
const results = await firecrawl.search({
  query: 'upcoming hackathons 2026 registration open',
  limit: 50
});

// Results look like:
// [
//   { title: 'SIH 2026', url: 'sih.gov.in', description: '...' },
//   { title: 'MLH Hackathon', url: 'mlh.io', description: '...' }
// ]
```

### Firecrawl Search Queries We Use:

```typescript
const queries = [
  'upcoming hackathons 2026 registration open',
  'MLH hackathons 2026 students',
  'Devpost hackathons online submissions',
  'Devfolio hackathons India 2026',
  'Unstop hackathons competitions India',
];
```

---

## 📊 Data Flow Diagram

Here's how data flows through the entire system:

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Index.tsx  │→ │ useOpport.. │→ │ Display     │        │
│  │  (Page)     │  │ (Hook)      │  │ Cards       │        │
│  └─────────────┘  └──────┬──────┘  └─────────────┘        │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │  Codeforces  │  │    Edge      │
│   Database   │  │     API      │  │  Function    │
│              │  │              │  │              │
│ opportunities│  │ /contest.   │  │  fetch-      │
│ users        │  │   list      │  │  opportunities│
│ favorites    │  │              │  │              │
└──────────────┘  └──────────────┘  └──────┬───────┘
                                           │
                                           ↓
                                   ┌──────────────┐
                                   │  Firecrawl   │
                                   │    API       │
                                   │              │
                                   │ Scrapes:     │
                                   │ - Devfolio   │
                                   │ - MLH        │
                                   │ - Unstop     │
                                   └──────────────┘
```

### Step-by-Step Flow:

1. **User visits website** → React app loads
2. **useOpportunities hook runs** → Starts fetching data
3. **Parallel requests made:**
   - Request 1: Supabase database (curated opportunities)
   - Request 2: Codeforces API (live contests)
   - Request 3: Edge Function (Firecrawl scraping)
4. **Data combined** → Duplicates removed, sorted by deadline
5. **Cards displayed** → User sees opportunities

---

## 📁 File Structure Explained

```
Opportune/
│
├── src/                    # 👈 All frontend code
│   │
│   ├── components/         # UI building blocks
│   │   ├── ui/            # shadcn/ui components (buttons, inputs)
│   │   ├── Header.tsx     # Navigation bar
│   │   ├── OpportunityCard.tsx  # Single opportunity card
│   │   └── OpportunityGrid.tsx  # Grid of all cards
│   │
│   ├── hooks/             # Custom React hooks (reusable logic)
│   │   ├── useOpportunities.tsx  # 👈 MAIN: Fetches all data
│   │   ├── useAuth.tsx    # Handles login/logout
│   │   ├── useFavorites.tsx  # Manages favorites
│   │   └── useAdmin.tsx   # Checks admin status
│   │
│   ├── pages/             # Full page components
│   │   ├── Index.tsx      # Home page
│   │   ├── Auth.tsx       # Login/signup page
│   │   ├── Admin.tsx      # Admin dashboard
│   │   └── Favorites.tsx  # User's saved opportunities
│   │
│   ├── integrations/      # External service connections
│   │   └── supabase/      # Supabase client setup
│   │
│   └── types/             # TypeScript type definitions
│       └── opportunity.ts # Opportunity data structure
│
├── supabase/              # 👈 Backend code
│   │
│   └── functions/         # Edge Functions
│       ├── fetch-opportunities/  # Scrapes websites
│       └── generate-ideas/       # AI idea generation
│
├── public/                # Static files (favicon, robots.txt)
│
├── .env                   # 🔐 SECRET: API keys (NEVER commit!)
│
├── package.json          # Dependencies list
│
└── README.md             # Project documentation
```

---

## 🔑 Environment Variables

These are secret keys stored in `.env` file (never commit this!):

```env
# Supabase connection
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# In Supabase Dashboard (for Edge Functions)
FIRECRAWL_API_KEY=your-firecrawl-key
LOVABLE_API_KEY=your-ai-key
```

### Where to Get Keys:

| Key | Where to Get |
|-----|--------------|
| Supabase URL | Supabase Dashboard → Settings → API |
| Supabase Key | Supabase Dashboard → Settings → API |
| Firecrawl Key | firecrawl.dev → Dashboard |

---

## 🎓 Summary for Beginners

1. **Frontend (React)** → What users see and interact with
2. **Supabase Database** → Stores opportunities, users, favorites
3. **Supabase Auth** → Handles login/signup
4. **Edge Functions** → Serverless code that scrapes websites
5. **Firecrawl** → Service that extracts data from web pages
6. **Codeforces API** → Provides live contest data

### The Magic Happens Here:
```
User clicks "Refresh" 
    → useOpportunities hook runs
    → Fetches from 3 sources in parallel
    → Combines and sorts data
    → Shows 70+ opportunities!
```

---

## ❓ Common Questions

**Q: Why use Edge Functions instead of calling APIs directly?**
A: Browser security (CORS) blocks direct API calls. Edge Functions run on the server, bypassing this restriction.

**Q: Why use Firecrawl instead of direct scraping?**
A: Writing scrapers for 50 websites is hard. Firecrawl handles JavaScript rendering, rate limiting, and data extraction automatically.

**Q: How do I add a new opportunity source?**
A: Add it to `useOpportunities.tsx` in the curated lists, or add a new API call in the Edge Function.

**Q: How do I become an admin?**
A: Add your email to `ADMIN_EMAILS` array in `src/hooks/useAdmin.tsx`.

---

<p align="center">
  <strong>Questions? Created by Chirag Koyande</strong>
</p>
