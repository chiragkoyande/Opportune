// ============================================================
// Opportune V4 — Global Header Component
// Features explicit Career vs Competitions hierarchy,
// global command search, bookmark & application quick links,
// theme toggle, and authenticated user profile menu.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Command,
  Bookmark,
  Kanban,
  User,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  Sun,
  Moon,
  Briefcase,
  GraduationCap,
  Rocket,
  Trophy,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const openSearch = useCallback(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/');
  };

  const isCareerActive = location.pathname.startsWith('/jobs') || location.pathname.startsWith('/internships');
  const isCompetitionsActive = location.pathname.startsWith('/hackathons') || location.pathname.startsWith('/contests');

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-sm'
          : 'bg-background/60 backdrop-blur-md border-b border-border/30'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group select-none flex-shrink-0"
          aria-label="Opportune Home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-amber-500 to-accent text-primary-foreground shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80">
              OPPORTUNE
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground -mt-1">
              Discovery Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Hierarchy */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* CAREER GROUP */}
          <div className="flex items-center p-1 bg-secondary/30 rounded-xl border border-border/40">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
              Career
            </span>
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-background text-job shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )
              }
            >
              <Briefcase className="h-3.5 w-3.5 text-job" />
              Jobs
            </NavLink>
            <NavLink
              to="/internships"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-background text-internship shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )
              }
            >
              <GraduationCap className="h-3.5 w-3.5 text-internship" />
              Internships
            </NavLink>
          </div>

          {/* COMPETITIONS GROUP */}
          <div className="flex items-center p-1 bg-secondary/30 rounded-xl border border-border/40">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
              Competitions
            </span>
            <NavLink
              to="/hackathons"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-background text-hackathon shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )
              }
            >
              <Rocket className="h-3.5 w-3.5 text-hackathon" />
              Hackathons
            </NavLink>
            <NavLink
              to="/contests"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-background text-contest shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )
              }
            >
              <Trophy className="h-3.5 w-3.5 text-contest" />
              Contests
            </NavLink>
          </div>

          {/* Companies Link */}
          <NavLink
            to="/companies"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'bg-secondary text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )
            }
          >
            <Building2 className="h-3.5 w-3.5" />
            Companies
          </NavLink>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Global Search Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={openSearch}
            className="h-9 gap-2 border-border/60 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors px-3"
            aria-label="Search opportunities"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline text-xs font-medium">Search...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-background/80 px-1.5 font-mono text-[10px] text-muted-foreground">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </Button>

          {/* Quick Links: Saved & Applications */}
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              cn(
                'hidden md:flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors',
                isActive
                  ? 'bg-secondary text-primary font-bold border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )
            }
            title="Saved Opportunities"
            aria-label="Saved Opportunities"
          >
            <Bookmark className="h-4 w-4" />
          </NavLink>

          <NavLink
            to="/applications"
            className={({ isActive }) =>
              cn(
                'hidden md:flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors',
                isActive
                  ? 'bg-secondary text-primary font-bold border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )
            }
            title="Application Tracker"
            aria-label="Application Tracker"
          >
            <Kanban className="h-4 w-4" />
          </NavLink>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Auth State / Profile Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 pl-2 pr-2.5 border border-border/40 hover:bg-secondary/50"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-foreground font-semibold text-xs ring-1 ring-border/50">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate text-xs font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-semibold leading-none">{user.email?.split('@')[0]}</p>
                    <p className="text-[11px] leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer gap-2 text-xs">
                  <User className="h-3.5 w-3.5 text-primary" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/saved')} className="cursor-pointer gap-2 text-xs">
                  <Bookmark className="h-3.5 w-3.5 text-primary" />
                  Saved Opportunities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/applications')} className="cursor-pointer gap-2 text-xs">
                  <Kanban className="h-3.5 w-3.5 text-primary" />
                  Application Tracker
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer gap-2 text-xs">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Preferences & Settings
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer gap-2 text-xs text-accent">
                      <Shield className="h-3.5 w-3.5" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth?tab=register')}
                className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Drawer Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Toggle mobile menu"
          >
            {mobileDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-4">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Career</p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <NavLink
                to="/jobs"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium',
                    isActive ? 'bg-job/10 border-job/30 text-job' : 'border-border/50 bg-secondary/20 text-muted-foreground'
                  )
                }
              >
                <Briefcase className="h-4 w-4 text-job" />
                Jobs Explorer
              </NavLink>
              <NavLink
                to="/internships"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium',
                    isActive ? 'bg-internship/10 border-internship/30 text-internship' : 'border-border/50 bg-secondary/20 text-muted-foreground'
                  )
                }
              >
                <GraduationCap className="h-4 w-4 text-internship" />
                Internships
              </NavLink>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Competitions</p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <NavLink
                to="/hackathons"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium',
                    isActive ? 'bg-hackathon/10 border-hackathon/30 text-hackathon' : 'border-border/50 bg-secondary/20 text-muted-foreground'
                  )
                }
              >
                <Rocket className="h-4 w-4 text-hackathon" />
                Hackathons
              </NavLink>
              <NavLink
                to="/contests"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium',
                    isActive ? 'bg-contest/10 border-contest/30 text-contest' : 'border-border/50 bg-secondary/20 text-muted-foreground'
                  )
                }
              >
                <Trophy className="h-4 w-4 text-contest" />
                Contests
              </NavLink>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40 grid grid-cols-3 gap-2 text-center">
            <Link to="/companies" className="p-2 text-xs font-medium rounded-lg hover:bg-secondary/40">
              Companies
            </Link>
            <Link to="/saved" className="p-2 text-xs font-medium rounded-lg hover:bg-secondary/40">
              Saved
            </Link>
            <Link to="/applications" className="p-2 text-xs font-medium rounded-lg hover:bg-secondary/40">
              Applications
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
