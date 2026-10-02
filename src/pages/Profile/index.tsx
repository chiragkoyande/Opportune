// ============================================================
// Opportune V4 — User Profile Page
// Section 20: Comprehensive Developer Profile
// Name, photo, skills, experience, education, preferred locations,
// category interests (Jobs, Internships, Hackathons, Contests),
// preferred technologies.
// ============================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Rocket,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SEO } from '@/lib/seo';
import { profileService } from '@/services/profile';
import { UserProfile, OpportunityCategoryKey } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

const ALL_CATEGORIES: { id: OpportunityCategoryKey; label: string; icon: React.ElementType }[] = [
  { id: 'jobs', label: 'Engineering Jobs', icon: Briefcase },
  { id: 'internships', label: 'Tech Internships', icon: GraduationCap },
  { id: 'hackathons', label: 'Global Hackathons', icon: Rocket },
  { id: 'contests', label: 'Coding Contests', icon: Trophy },
];

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => profileService.getProfile(),
  });

  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [newSkill, setNewSkill] = useState('');

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<UserProfile>) => profileService.updateProfile(updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['user-profile'], updated);
      toast({ title: 'Profile saved successfully!' });
    },
  });

  if (isLoading || !formData.email) {
    return <div className="text-center py-20 text-xs text-muted-foreground">Loading profile...</div>;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCategoryToggle = (catId: OpportunityCategoryKey) => {
    const current = formData.preferences?.opportunityCategories || [];
    const updated = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId];

    setFormData({
      ...formData,
      preferences: {
        ...(formData.preferences || {
          preferredLocations: [],
          preferredJobTypes: [],
          preferredTechnologies: [],
          workplacePreference: [],
          emailAlerts: true,
          weeklyDigest: true,
          theme: 'system',
        }),
        opportunityCategories: updated,
      },
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const current = formData.skills || [];
      if (!current.includes(newSkill.trim())) {
        setFormData({ ...formData, skills: [...current, newSkill.trim()] });
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter((s) => s !== skill),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO title="My Developer Profile | Opportune" description="Manage your Opportune developer profile, skills, education, and opportunity interests." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Developer Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Personalize your credentials, skills, and target opportunity categories.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          size="sm"
          className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
        >
          <Save className="h-3.5 w-3.5" />
          {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
          <h2 className="font-bold text-sm text-foreground">Basic Information</h2>

          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-secondary/50 border border-border/60 p-1 overflow-hidden flex items-center justify-center flex-shrink-0">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt={formData.fullName} className="h-full w-full object-cover rounded-xl" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground">Profile Picture</span>
              <p className="text-[11px] text-muted-foreground">Connected via authenticated provider.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name</Label>
              <Input
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input value={formData.email || ''} disabled className="h-9 text-xs bg-secondary/30" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Headline / Tagline</Label>
            <Input
              value={formData.headline || ''}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. Fullstack & Systems Engineer"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Bio</Label>
            <Textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="text-xs min-h-[80px]"
            />
          </div>
        </div>

        {/* Opportunity Interests / Categories */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-sm text-foreground">Opportunity Interests</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select which categories appear prominently in your discovery feed and alert recommendations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {ALL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = (formData.preferences?.opportunityCategories || []).includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 text-primary font-semibold shadow-xs'
                      : 'border-border/60 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-foreground">Technical Skills</h2>

          <div className="flex gap-2">
            <Input
              placeholder="Add skill (e.g. TypeScript, Rust, Docker)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="h-9 text-xs"
            />
            <Button type="button" size="sm" onClick={handleAddSkill} className="h-9 text-xs">
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.skills?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-secondary border border-border/60"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-foreground">Web & Social Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">GitHub Profile</Label>
              <Input
                value={formData.githubUrl || ''}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">LinkedIn Profile</Label>
              <Input
                value={formData.linkedinUrl || ''}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
