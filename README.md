# Opportunity Compass

A comprehensive platform for discovering and comparing tech opportunities including hackathons, programming contests, internships, and educational events from around the world.

## Overview

Opportunity Compass aggregates opportunities from 8 reliable data sources and presents them through an intuitive, modern interface. Users can browse, filter, compare, and save their favorite opportunities to a personalized list. The platform supports user authentication, profile management, and administrative features for opportunity curation.

## Demo

[![Watch the demo](https://img.shields.io/badge/Watch-Demo-blue?logo=youtube)](YOUR_YOUTUBE_URL_HERE)

## Features

### Core Functionality
- Browse and discover 70+ tech opportunities (contests, hackathons, internships, events)
- Advanced filtering by opportunity type, difficulty level, and other criteria
- Comparison tool to view multiple opportunities side-by-side
- Save favorite opportunities to personal collection
- Deadline tracking with automatic sorting
- Responsive design optimized for mobile, tablet, and desktop

### User Features
- User authentication via Supabase
- Personal profile management
- Favorites list persistence to database
- Theme customization (light/dark mode)
- Real-time notifications via toast notifications

### Admin Features
- Administrative dashboard for opportunity management
- User management capabilities
- Direct database access and editing
- System monitoring tools

### Data Sources
The platform integrates with 7 verified opportunity sources:
1. **Codeforces** - Programming contests (99.9% uptime)
2. **AtCoder** - Japanese programming contests (99.9% uptime)
3. **GitHub** - Open source opportunities
4. **Unstop Hackathons** - 3 verified Indian hackathons (BuildIt, CodeFest, Innovation Challenge)
5. **Global Hackathons** - Devpost and MLH network events
6. **Tech Internships** - Google, Microsoft, Amazon internship programs
7. **Verified Events** - SIH, MLH, and international certifications

## Technology Stack

### Frontend
- **React 18** - UI framework with hooks for state management
- **TypeScript 5** - Type-safe JavaScript development
- **Vite 5.4.19** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework for styling
- **Radix UI** - Headless component primitives for accessibility
- **shadcn/ui** - Re-usable component library built on Radix UI
- **Framer Motion** - Animation and motion library
- **React Router DOM** - Client-side routing
- **TanStack React Query** - Server state management
- **React Hook Form** - Efficient form handling
- **Zod** - TypeScript-first schema validation

### Backend
- **Supabase** - PostgreSQL database with authentication
- **Supabase Functions** - Serverless functions for API aggregation
- **PostgreSQL** - Relational database (33 base opportunities)

### Development Tools
- **ESLint** - Code quality and style enforcement
- **Bun** - Package manager (lockfile: bun.lockb)
- **PostCSS** - CSS transformation
- **Vite Plugins** - React optimization and path aliasing

## Project Structure

```
opportunity-compass/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui component library
│   │   ├── Header.tsx             # Navigation header
│   │   ├── Hero.tsx               # Landing section
│   │   ├── OpportunityGrid.tsx    # Main opportunities display
│   │   ├── OpportunityCard.tsx    # Individual opportunity card
│   │   ├── FilterTabs.tsx         # Category filtering
│   │   ├── CompareBar.tsx         # Comparison selection bar
│   │   ├── CompareModal.tsx       # Side-by-side comparison view
│   │   ├── Admin.tsx              # Admin dashboard
│   │   ├── Footer.tsx             # Footer component
│   │   └── [other components]
│   ├── pages/
│   │   ├── Index.tsx              # Home/main page
│   │   ├── Auth.tsx               # Authentication page
│   │   ├── Favorites.tsx          # User favorites page
│   │   ├── Profile.tsx            # User profile page
│   │   ├── Admin.tsx              # Admin page
│   │   └── NotFound.tsx           # 404 page
│   ├── hooks/
│   │   ├── useOpportunities.tsx   # Aggregates all 8 data sources
│   │   ├── useAuth.tsx            # Authentication state
│   │   ├── useFavorites.tsx       # Favorites management
│   │   ├── useCompare.tsx         # Comparison state
│   │   ├── useTheme.tsx           # Theme management
│   │   ├── useDbOpportunities.tsx # Database queries
│   │   └── [other hooks]
│   ├── integrations/
│   │   └── supabase/              # Supabase client setup
│   ├── data/
│   │   └── mockOpportunities.ts   # Fallback data
│   ├── types/
│   │   └── opportunity.ts         # TypeScript type definitions
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
├── supabase/
│   ├── config.toml                # Supabase configuration
│   ├── functions/                 # Serverless functions
│   └── migrations/                # Database migrations
├── public/
│   ├── favicon-new.svg            # Custom favicon
│   └── robots.txt                 # SEO robot rules
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Vite configuration
├── tailwind.config.ts             # TailwindCSS configuration
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.js               # Linting rules
├── postcss.config.js              # PostCSS configuration
└── index.html                     # HTML entry point
```

## Getting Started

### Prerequisites
- Node.js v14 or higher (v22.12.0 recommended)
- npm (comes with Node.js)
- Git for version control
- A modern web browser

### Installation

Clone the repository:
```bash
git clone <YOUR_REPOSITORY_URL>
cd opportunity-compass
```

Install dependencies:
```bash
npm install
```

Set up environment variables (optional for development):
Create a `.env` file in the root directory with Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port if 5173 is in use).

The development server includes:
- Hot module reloading (HMR) for instant updates
- Source maps for debugging
- CSS preprocessing
- TypeScript compilation

### Building for Production

Create an optimized production build:
```bash
npm run build
```

The build output will be in the `dist/` directory. Build includes:
- Minified JavaScript and CSS
- Optimized bundle splitting
- Asset optimization
- Source map generation for error tracking

Preview the production build locally:
```bash
npm run preview
```

## Usage Guide

### Browsing Opportunities

1. Visit the home page to see all available opportunities
2. Opportunities are displayed as cards showing:
   - Opportunity title and category
   - Prize money (if applicable)
   - Difficulty level
   - Submission deadline
   - Platform/organization name
3. Click on any opportunity card for full details and direct application link

### Filtering

Use the filter tabs at the top of the opportunities grid to narrow results by:
- All opportunities
- Hackathons
- Contests
- Internships
- Events

### Comparing Opportunities

1. Click the "+" button on opportunity cards to add them to comparison
2. Click the "Compare" button at the bottom to view side-by-side comparison
3. Comparison shows all key details for selected opportunities
4. Click "Clear Comparison" to reset selection

### Saving Favorites

1. Click the heart icon on any opportunity card to save as favorite
2. Access your favorites through the "Favorites" page
3. Favorites are saved to your user profile (requires authentication)

### User Authentication

1. Click "Login" in the header navigation
2. Create new account or sign in with existing credentials
3. Access user-specific features: favorites, profile, preferences

### Profile Management

1. Navigate to "Profile" page after logging in
2. View saved opportunities and preferences
3. Manage account settings
4. View user statistics

### Admin Dashboard

Admin users can access the admin panel to:
- View all opportunities in database
- Add new opportunities
- Edit existing opportunities
- Delete opportunities
- Monitor user activity

Access: `/admin` route (requires admin privileges)

## Data and API Integration

### Opportunity Data Flow

The `useOpportunities` hook handles all data aggregation:

1. Fetches from 7 independent sources simultaneously
2. Deduplicates opportunities by normalized title comparison
3. Sorts results by deadline (ascending)
4. Falls back to database-only data if live APIs fail
5. Returns combined array of opportunities

### API Sources

All data sources are publicly available with no authentication required:

**API 1: Codeforces**
- Endpoint: `https://codeforces.com/api/contest.list`
- Provides: Programming contests
- Uptime: 99.9%

**API 2: AtCoder**
- Endpoint: `https://atcoder.jp/api/v2/contests`
- Provides: Japanese programming contests
- Uptime: 99.9%

**API 3-7: Verified Lists**
- Sources: GitHub, Unstop (curated), Devpost, official internship programs
- Format: Hardcoded verified opportunities
- Reliability: 100% (no external API dependency)

### Database Schema

The Supabase PostgreSQL database stores:
- 33 base opportunities with metadata
- User profiles and authentication
- Favorite opportunity links per user
- Admin user flags

## Configuration

