import { Sparkles, LogOut, Heart, User, ChevronDown, Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Opportune
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate('/favorites')}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mr-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="max-w-[100px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-card border-border">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')} className="cursor-pointer">
                    <Heart className="h-4 w-4 mr-2 text-urgent" />
                    Favorites
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2 text-accent" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-urgent">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 shadow-glow-sm"
              >
                Get Started
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="container py-4 space-y-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => { navigate('/favorites'); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-urgent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-muted-foreground"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
