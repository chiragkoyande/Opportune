// ============================================================
// Opportune V4 — Application Router
// Route-level lazy loading, feature-oriented structure,
// clear URL state mappings and error boundaries.
// ============================================================

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import { Loader2 } from 'lucide-react';

// Route-level lazy imports for optimal code splitting & Vercel edge delivery
const HomePage = lazy(() => import('@/pages/Home/index'));
const JobsPage = lazy(() => import('@/pages/Jobs/index'));
const JobDetailPage = lazy(() => import('@/pages/Job/index'));
const InternshipsPage = lazy(() => import('@/pages/Internships/index'));
const InternshipDetailPage = lazy(() => import('@/pages/Internship/index'));
const HackathonsPage = lazy(() => import('@/pages/Hackathons/index'));
const HackathonDetailPage = lazy(() => import('@/pages/Hackathon/index'));
const ContestsPage = lazy(() => import('@/pages/Contests/index'));
const ContestDetailPage = lazy(() => import('@/pages/Contest/index'));
const CompaniesPage = lazy(() => import('@/pages/Companies/index'));
const CompanyDetailPage = lazy(() => import('@/pages/Company/index'));
const SearchPage = lazy(() => import('@/pages/Search/index'));
const SavedPage = lazy(() => import('@/pages/Saved/index'));
const ApplicationsPage = lazy(() => import('@/pages/Applications/index'));
const ProfilePage = lazy(() => import('@/pages/Profile/index'));
const SettingsPage = lazy(() => import('@/pages/Settings/index'));
const AuthPage = lazy(() => import('@/pages/Auth/index'));
const AdminPage = lazy(() => import('@/pages/Admin/index'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

// Suspense loading fallback
export const PageLoadingFallback: React.FC = () => (
  <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="text-xs text-muted-foreground font-medium animate-pulse">Loading experience...</span>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Main Application with Global Header, Navigation, Footer */}
        <Route element={<RootLayout />}>
          {/* 1. Home Discovery */}
          <Route path="/" element={<HomePage />} />

          {/* 2. Career Hierarchy */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/internships/:slug" element={<InternshipDetailPage />} />

          {/* 3. Competitions Hierarchy */}
          <Route path="/hackathons" element={<HackathonsPage />} />
          <Route path="/hackathons/:slug" element={<HackathonDetailPage />} />
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/contests/:slug" element={<ContestDetailPage />} />

          {/* 4. Companies Directory & Details */}
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:slug" element={<CompanyDetailPage />} />

          {/* 5. Unified Search */}
          <Route path="/search" element={<SearchPage />} />

          {/* 6. User Experience */}
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Backward compatibility aliases */}
          <Route path="/explore" element={<Navigate to="/jobs" replace />} />
          <Route path="/favorites" element={<Navigate to="/saved" replace />} />
          <Route path="/dashboard" element={<Navigate to="/applications" replace />} />
        </Route>

        {/* 7. Dedicated Authentication Screens */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route path="/forgot-password" element={<AuthPage initialMode="forgot" />} />

        {/* 8. Dedicated Admin Portal */}
        <Route path="/admin/*" element={<AdminPage />} />

        {/* 9. Catch-All 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
