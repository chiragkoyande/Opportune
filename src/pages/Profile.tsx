import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Save, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const INTEREST_OPTIONS = [
  'AI/ML', 'Web Development', 'Mobile Apps', 'Data Science', 
  'Blockchain', 'Cloud Computing', 'Cybersecurity', 'DevOps',
  'UI/UX Design', 'Game Development', 'IoT', 'Robotics'
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSelectedInterests(profile.interests || []);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile({
      display_name: displayName || null,
      interests: selectedInterests.length > 0 ? selectedInterests : null,
    });
    setSaving(false);
    
    if (success) {
      toast({
        title: 'Profile saved',
        description: 'Your profile has been updated.',
      });
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 max-w-2xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        
        <div className="rounded-xl border-2 border-foreground/20 bg-card p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 border-2 border-foreground/20">
              <User className="h-8 w-8 text-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                My Profile
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border-2 border-foreground/20"
              />
            </div>

            <div className="space-y-3">
              <Label>Interests</Label>
              <p className="text-sm text-muted-foreground">
                Select your interests to get personalized recommendations
              </p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${isSelected 
                          ? 'bg-primary text-foreground' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }
                      `}
                    >
                      {isSelected ? (
                        <X className="h-3 w-3 inline mr-1" />
                      ) : (
                        <Plus className="h-3 w-3 inline mr-1" />
                      )}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedInterests.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground mb-2">
                  Selected interests:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-full border-2 border-foreground/30 bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
