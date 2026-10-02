// ============================================================
// Opportune V4 — Authentication (Login / Register / Forgot Password)
// Supabase Auth integration with Email, Google & GitHub OAuth
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Mail, Lock, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlMode = (searchParams.get('mode') || searchParams.get('tab') || initialMode || 'login') as
    | 'login'
    | 'register'
    | 'forgot';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(urlMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    } else {
      const current = (searchParams.get('mode') || searchParams.get('tab') || 'login') as
        | 'login'
        | 'register'
        | 'forgot';
      setMode(current);
    }
  }, [searchParams, initialMode]);

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setSearchParams({ mode: newMode });
    setResetSent(false);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        toast({
          title: 'OAuth Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to initiate social login',
        variant: 'destructive',
      });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your registered email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) {
        toast({
          title: 'Reset Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setResetSent(true);
        toast({
          title: 'Reset Link Dispatched',
          description: 'Check your inbox for instructions to reset your password.',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in both email and password',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({
            title: 'Authentication Failed',
            description: error.message.includes('Invalid login')
              ? 'Invalid credentials. Please verify your email and password.'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome Back!',
            description: 'You have signed in successfully.',
          });
          navigate('/');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          toast({
            title: 'Sign Up Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'Welcome to Opportune! Check your email to verify your account.',
          });
          navigate('/');
        }
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected network error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top Header */}
      <div className="border-b border-border/40 py-4 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to discovery
        </Link>
        <Link to="/" className="flex items-center gap-2 select-none">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-amber-500 to-accent text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display font-bold tracking-tight text-sm">OPPORTUNE</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {mode === 'login' && 'Access your saved jobs, hackathons, and tracked applications.'}
              {mode === 'register' && 'Join thousands of developers finding top opportunities.'}
              {mode === 'forgot' && 'Enter your registered email and we will send a recovery link.'}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/60 p-6 sm:p-8 shadow-sm">
            {/* Social Logins (for login & register) */}
            {mode !== 'forgot' && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={Boolean(oauthLoading)}
                    className="h-10 text-xs font-semibold gap-2 border-border/60 hover:bg-secondary/60"
                  >
                    {oauthLoading === 'google' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={Boolean(oauthLoading)}
                    className="h-10 text-xs font-semibold gap-2 border-border/60 hover:bg-secondary/60"
                  >
                    {oauthLoading === 'github' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    )}
                    GitHub
                  </Button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="bg-card px-2 text-muted-foreground font-semibold">Or continue with</span>
                  </div>
                </div>
              </>
            )}

            {/* Forgot Password Flow */}
            {mode === 'forgot' ? (
              resetSent ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-sm">Check your inbox</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We sent password reset instructions to <strong>{email}</strong>.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => switchMode('login')} className="mt-4 text-xs">
                    Return to sign in
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email" className="text-xs font-semibold">
                      Registered Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 text-xs"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                    Send Password Reset Link
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Remember your password? <span className="font-semibold text-primary">Sign in</span>
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* Login / Register Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fullname" className="text-xs font-semibold">
                      Full Name
                    </Label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 text-xs"
                      disabled={loading}
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 text-xs"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold">
                      Password
                    </Label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-10 text-xs"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-sm"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
            )}

            {mode !== 'forgot' && (
              <div className="mt-6 text-center text-xs text-muted-foreground">
                {mode === 'login' ? (
                  <p>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign up for free
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-muted-foreground border-t border-border/30">
        By continuing, you agree to Opportune's Terms of Service and Privacy Policy.
      </div>
    </div>
  );
};

export default AuthPage;
