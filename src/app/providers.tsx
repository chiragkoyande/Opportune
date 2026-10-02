// ============================================================
// Opportune V4 — App Providers
// Centralized wrapper for TanStack Query, Theme, Tooltip,
// and Global Toast/Feedback notifications
// ============================================================

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ThemeProvider } from '@/hooks/useTheme';
import { CompareProvider } from '@/hooks/useCompare';

// Production configured QueryClient with optimal caching & retry policies
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh data
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={200}>
          <CompareProvider>
            {children}
            <Toaster />
            <Sonner position="top-right" closeButton richColors />
          </CompareProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
