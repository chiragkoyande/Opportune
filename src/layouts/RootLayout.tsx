// ============================================================
// Opportune V4 — Root Layout
// Unified Origin Theme with Ambient Grid, Mesh, Glowing Radial Blobs,
// Floating Developer Icons, Header, Content, Mobile Nav, Footer,
// and Command Search modal.
// ============================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import CommandPalette from '@/components/CommandPalette';
import CompareBar from '@/components/CompareBar';
import BackgroundElements from '@/components/BackgroundElements';
import FloatingParticles from '@/components/FloatingParticles';
import CursorSparkles from '@/components/CursorSparkles';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh noise-bg text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary pb-16 md:pb-0 relative overflow-x-hidden">
      {/* 1. Global fixed background grid pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

      {/* 2. Global fixed animated ambient radial glowing blobs */}
      <div className="fixed -top-28 left-6 w-[500px] h-[500px] bg-gradient-radial from-primary/10 via-primary/2 to-transparent rounded-full blur-3xl animate-blob pointer-events-none z-0" />
      <div
        className="fixed top-1/3 right-0 w-[550px] h-[550px] bg-gradient-radial from-accent/15 via-accent/5 to-transparent rounded-full blur-3xl animate-blob pointer-events-none z-0"
        style={{ animationDelay: '-3s' }}
      />
      <div
        className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-gradient-radial from-hackathon/15 via-hackathon/5 to-transparent rounded-full blur-3xl animate-blob pointer-events-none z-0"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-gradient-radial from-internship/12 via-internship/4 to-transparent rounded-full blur-3xl animate-blob pointer-events-none z-0"
        style={{ animationDelay: '-9s' }}
      />

      {/* 3. Global floating developer icons, symbols & atmospheric orbs */}
      <BackgroundElements />

      {/* 4. Global ambient drifting particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingParticles />
      </div>

      {/* 5. Global cursor sparkles */}
      <CursorSparkles />

      {/* 5. Global Command Palette (⌘K) */}
      <CommandPalette />

      {/* 6. Desktop / Tablet Header */}
      <Header />

      {/* 7. Main Content View */}
      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* 8. Global Floating Compare Bar */}
      <CompareBar />

      {/* 9. Global Footer */}
      <Footer />

      {/* 10. Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default RootLayout;
