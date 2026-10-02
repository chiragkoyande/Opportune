import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, LogOut, Heart, User, ChevronDown, Shield, Menu, X,
  Search, Command, LayoutGrid, Rocket, Briefcase, Zap, GraduationCap,
  GitBranch, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/companies', label: 'Companies' },
  { href: '/dashboard', label: 'Dashboard' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  const openCommandPalette = useCallback(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-50 w-full transition-all duration-300
        ${scrolled
          ? 'bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-sm'
          : 'bg-background/50 backdrop-blur-xl border-b border-transparent'
        }
      `}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group select-none"
          onClick={() => navigate('/')}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-glow-sm group-hover:shadow-glow transition-all duration-500 group-hover:scale-105">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
            Opportune
          </span>
        </div>

        {/* Desktop Nav — Center */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(`${link.href}/`));
            return (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }
                `}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Nav — Right */}
        <div className="hidden md:flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={openCommandPalette}
            className="h-9 gap-2 border-border/50 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">Search...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-background/80 px-1.5 font-mono text-[10px] text-muted-foreground">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </Button>

          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/favorites')}
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 ring-1 ring-border/50">
                      <User className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <span className="max-w-[80px] truncate text-xs font-medium">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-card/95 backdrop-blur-xl border-border/50">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')} className="cursor-pointer gap-2">
                    <Heart className="h-4 w-4 text-urgent" />
                    Favorites
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer gap-2">
                        <Shield className="h-4 w-4 text-accent" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-urgent focus:text-urgent">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="h-9 text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth')}
                className="h-9 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 shadow-glow-sm transition-all"
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            onClick={openCommandPalette}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  onClick={() => navigate(link.href)}
                  className={`w-full justify-start text-sm ${
                    location.pathname === link.href ? 'text-foreground bg-secondary/50' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Button>
              ))}
              <div className="border-t border-border/30 my-2" />
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate('/favorites')} className="w-full justify-start text-sm text-muted-foreground gap-2">
                    <Heart className="h-4 w-4" /> Favorites
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/profile')} className="w-full justify-start text-sm text-muted-foreground gap-2">
                    <User className="h-4 w-4" /> Profile
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/dashboard')} className="w-full justify-start text-sm text-muted-foreground gap-2">
                    <LayoutGrid className="h-4 w-4" /> Dashboard
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" onClick={() => navigate('/admin')} className="w-full justify-start text-sm text-muted-foreground gap-2">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Button>
                  )}
                  <div className="border-t border-border/30 my-2" />
                  <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-sm text-urgent gap-2">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full justify-start text-sm text-muted-foreground">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground mt-2">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
