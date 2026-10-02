// ============================================================
// Opportune V4 — Settings Page
// Section 21: Account, Appearance, Security & Opportunity Preferences
// ============================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Shield,
  Palette,
  Bell,
  Sliders,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/lib/seo';
import { profileService } from '@/services/profile';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { OpportunityCategoryKey } from '@/types/user';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => profileService.getProfile(),
  });

  const [categories, setCategories] = useState<OpportunityCategoryKey[]>(
    profile?.preferences?.opportunityCategories || ['jobs', 'internships', 'hackathons', 'contests']
  );
  const [emailAlerts, setEmailAlerts] = useState(profile?.preferences?.emailAlerts ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(profile?.preferences?.weeklyDigest ?? true);

  const saveMutation = useMutation({
    mutationFn: () =>
      profileService.updateProfile({
        preferences: {
          ...(profile?.preferences || {
            preferredLocations: [],
            preferredJobTypes: [],
            preferredTechnologies: [],
            workplacePreference: [],
            theme: 'system',
          }),
          opportunityCategories: categories,
          emailAlerts,
          weeklyDigest,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({ title: 'Settings updated successfully' });
    },
  });

  const toggleCategory = (cat: OpportunityCategoryKey) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO title="Settings & Preferences | Opportune" description="Manage notification settings, opportunity preferences, and appearance." />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure opportunity alerts, appearance, and discovery preferences.
          </p>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          size="sm"
          className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
        >
          <Save className="h-3.5 w-3.5" />
          {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="bg-secondary/40 p-1 border border-border/50">
          <TabsTrigger value="preferences" className="text-xs font-semibold gap-1.5">
            <Sliders className="h-3.5 w-3.5" />
            Opportunity Preferences
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs font-semibold gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs font-semibold gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs font-semibold gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Opportunity Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-sm text-foreground">Discovery Feed Categories</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle which opportunity sectors appear on your personalized discovery homepage.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Software Engineering Jobs</h4>
                  <p className="text-[11px] text-muted-foreground">Full-time and contract developer roles</p>
                </div>
                <Switch
                  checked={categories.includes('jobs')}
                  onCheckedChange={() => toggleCategory('jobs')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Tech Internships & PPOs</h4>
                  <p className="text-[11px] text-muted-foreground">Summer and off-campus internships</p>
                </div>
                <Switch
                  checked={categories.includes('internships')}
                  onCheckedChange={() => toggleCategory('internships')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Global Hackathons</h4>
                  <p className="text-[11px] text-muted-foreground">Competitions and team building challenges</p>
                </div>
                <Switch
                  checked={categories.includes('hackathons')}
                  onCheckedChange={() => toggleCategory('hackathons')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Coding Contests</h4>
                  <p className="text-[11px] text-muted-foreground">Live algorithmic contest calendars</p>
                </div>
                <Switch
                  checked={categories.includes('contests')}
                  onCheckedChange={() => toggleCategory('contests')}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-sm text-foreground">Interface Theme</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Customize your viewing preference.</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-amber-500" />}
                <div>
                  <h4 className="font-semibold text-xs text-foreground">
                    Current Mode: {theme === 'dark' ? 'Dark' : 'Light'}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Toggle between high-contrast dark and light</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="text-xs">
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-sm text-foreground">Email Notifications</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Manage which alerts are dispatched to your inbox.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Instant Opportunity Alerts</h4>
                  <p className="text-[11px] text-muted-foreground">When top companies post matching jobs or hackathons</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Weekly Digest</h4>
                  <p className="text-[11px] text-muted-foreground">Curated roundup of top opportunities every Monday</p>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-sm text-foreground">Security & Sessions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your authenticated credentials and sessions.</p>
            </div>

            <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-xs text-foreground">Password & Authentication</h4>
                <p className="text-[11px] text-muted-foreground">Managed securely via Supabase Auth</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <a href="/auth?mode=forgot">Change Password</a>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
