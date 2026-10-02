// ============================================================
// Opportune V4 — Mobile Navigation Bar
// Fixed bottom navigation bar with clear category indicators
// ============================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, GraduationCap, Rocket, Trophy, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  categoryColor?: string;
}

const MOBILE_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/jobs', label: 'Jobs', icon: Briefcase, categoryColor: 'text-job' },
  { to: '/internships', label: 'Interns', icon: GraduationCap, categoryColor: 'text-internship' },
  { to: '/hackathons', label: 'Hacks', icon: Rocket, categoryColor: 'text-hackathon' },
  { to: '/contests', label: 'Contests', icon: Trophy, categoryColor: 'text-contest' },
  { to: '/saved', label: 'Saved', icon: Bookmark },
];

export const MobileNav: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 pb-safe shadow-lg"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[11px] font-medium transition-all duration-200 min-w-0',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-1 rounded-lg transition-transform duration-200',
                      isActive ? 'bg-primary/10 scale-110' : ''
                    )}
                  >
                    <Icon className={cn('h-4.5 w-4.5', isActive && item.categoryColor ? item.categoryColor : 'currentColor')} />
                  </div>
                  <span className="truncate mt-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* User / Profile or Auth */}
        <NavLink
          to={user ? '/profile' : '/auth'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[11px] font-medium transition-all duration-200 min-w-0',
              isActive
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground active:scale-95'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'p-1 rounded-lg transition-transform duration-200',
                  isActive ? 'bg-primary/10 scale-110' : ''
                )}
              >
                <User className="h-4.5 w-4.5" />
              </div>
              <span className="truncate mt-0.5">{user ? 'Profile' : 'Sign In'}</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
