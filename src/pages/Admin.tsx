import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { useCareerSyncAdmin } from '@/hooks/useCareerJobs';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminUserManagement from '@/components/AdminUserManagement';
import { 
  Activity,
  AlertTriangle,
  ArrowLeft, 
  Building2,
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Shield,
  Rocket,
  Briefcase,
  Users,
  Zap,
  Calendar,
  Database
} from 'lucide-react';

interface OpportunityForm {
  title: string;
  type: 'hackathon' | 'internship' | 'contest';
  organization: string;
  description: string;
  deadline: string;
  apply_url: string;
  location: string;
  prize: string;
  tags: string[];
  source: string;
}

interface DbOpportunity {
  id: string;
  title: string;
  type: string;
  organization: string;
  description: string;
  deadline: string;
  apply_url: string;
  location: string | null;
  prize: string | null;
  tags: string[] | null;
  source: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm: OpportunityForm = {
  title: '',
  type: 'hackathon',
  organization: '',
  description: '',
  deadline: '',
  apply_url: '',
  location: '',
  prize: '',
  tags: [],
  source: 'Admin',
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const [opportunities, setOpportunities] = useState<DbOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OpportunityForm>(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const syncAdminQuery = useCareerSyncAdmin(Boolean(isAdmin));

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Only redirect if we've finished loading AND confirmed user is not admin
    if (!adminLoading && !authLoading && user && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAdmin, adminLoading, authLoading, user, navigate, toast]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOpportunities();
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        type: form.type,
        organization: form.organization,
        description: form.description,
        deadline: new Date(form.deadline).toISOString(),
        apply_url: form.apply_url,
        location: form.location || null,
        prize: form.prize || null,
        tags: form.tags.length > 0 ? form.tags : null,
        source: form.source || 'Admin',
        created_by: user?.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('opportunities')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Opportunity updated successfully' });
      } else {
        const { error } = await supabase
          .from('opportunities')
          .insert([payload]);

        if (error) throw error;
        toast({ title: 'Opportunity added successfully' });
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchOpportunities();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast({
        title: 'Error',
        description: 'Failed to save opportunity',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (opp: DbOpportunity) => {
    setForm({
      title: opp.title,
      type: opp.type as 'hackathon' | 'internship' | 'contest',
      organization: opp.organization,
      description: opp.description,
      deadline: new Date(opp.deadline).toISOString().slice(0, 16),
      apply_url: opp.apply_url,
      location: opp.location || '',
      prize: opp.prize || '',
      tags: opp.tags || [],
      source: opp.source || 'Admin',
    });
    setEditingId(opp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Opportunity deleted' });
      fetchOpportunities();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete opportunity',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast({ title: currentStatus ? 'Opportunity hidden' : 'Opportunity activated' });
      fetchOpportunities();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hackathon': return <Rocket className="h-4 w-4" />;
      case 'internship': return <Briefcase className="h-4 w-4" />;
      case 'contest': return <Zap className="h-4 w-4" />;
      default: return null;
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">
                Manage opportunities and users
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="opportunities" className="gap-2">
              <Rocket className="h-4 w-4" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="sync" className="gap-2">
              <Activity className="h-4 w-4" />
              Sync Health
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              User Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            {!showForm && (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setForm(emptyForm);
                    setEditingId(null);
                    setShowForm(true);
                  }}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Opportunity
                </Button>
              </div>
            )}

        {showForm && (
          <div className="mb-8 rounded-xl border-2 border-foreground/20 bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">
                {editingId ? 'Edit Opportunity' : 'Add New Opportunity'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="border-2 border-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value: 'hackathon' | 'internship' | 'contest') => 
                      setForm({ ...form, type: value })
                    }
                  >
                    <SelectTrigger className="border-2 border-foreground/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contest">Contest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization *</Label>
                  <Input
                    id="organization"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    required
                    className="border-2 border-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    required
                    className="border-2 border-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apply_url">Apply URL *</Label>
                  <Input
                    id="apply_url"
                    type="url"
                    value={form.apply_url}
                    onChange={(e) => setForm({ ...form, apply_url: e.target.value })}
                    required
                    className="border-2 border-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    placeholder="e.g., Unstop, Devfolio"
                    className="border-2 border-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g., Virtual, Mumbai"
                    className="border-2 border-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize">Prize</Label>
                  <Input
                    id="prize"
                    value={form.prize}
                    onChange={(e) => setForm({ ...form, prize: e.target.value })}
                    placeholder="e.g., ₹1,00,000"
                    className="border-2 border-foreground/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="border-2 border-foreground/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    className="border-2 border-foreground/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving} className="rounded-full">
                  {saving ? 'Saving...' : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? 'Update' : 'Add'} Opportunity
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-16">
            <Plus className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No opportunities yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by adding your first opportunity
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className={`rounded-xl border-2 p-4 transition-colors ${
                  opp.is_active 
                    ? 'border-foreground/20 bg-card' 
                    : 'border-foreground/10 bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize gap-1">
                        {getTypeIcon(opp.type)}
                        {opp.type}
                      </Badge>
                      <Badge variant={opp.is_active ? 'default' : 'secondary'}>
                        {opp.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                      {opp.source && (
                        <span className="text-xs text-muted-foreground">
                          {opp.source}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-foreground">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground">{opp.organization}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(opp.deadline).toLocaleDateString()}
                      </span>
                      {opp.prize && <span>Prize: {opp.prize}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(opp.id, opp.is_active)}
                      className="rounded-full"
                    >
                      {opp.is_active ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(opp)}
                      className="rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(opp.id)}
                      className="rounded-full text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="sync">
            <CareerSyncPanel query={syncAdminQuery} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

function CareerSyncPanel({ query }: { query: ReturnType<typeof useCareerSyncAdmin> }) {
  if (query.isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" /></div>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
        Unable to load sync health. Confirm the career discovery migration is applied and admin RLS policies are active.
      </div>
    );
  }

  const stats = query.data.stats;
  const platforms = typeof stats.platforms === 'object' && stats.platforms !== null
    ? stats.platforms as Record<string, number>
    : {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetric icon={<Database className="h-4 w-4" />} label="Open jobs" value={Number(stats.open_jobs ?? 0)} />
        <AdminMetric icon={<Building2 className="h-4 w-4" />} label="Companies" value={Number(stats.companies ?? 0)} />
        <AdminMetric icon={<Briefcase className="h-4 w-4" />} label="Internships" value={Number(stats.internships ?? 0)} />
        <AdminMetric icon={<AlertTriangle className="h-4 w-4" />} label="Stale companies" value={query.data.health?.stale_company_count ?? 0} />
      </div>

      <section className="rounded-xl border-2 border-foreground/10 bg-card p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">API health</h2>
            <p className="text-sm text-muted-foreground">
              Last run {formatAdminDate(query.data.health?.last_run_at)} · status {query.data.health?.last_status ?? 'unknown'}
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => query.refetch()}>
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(platforms).map(([platform, count]) => (
            <Badge key={platform} variant="outline" className="rounded-full capitalize">
              {platform.replace('_', ' ')} · {count}
            </Badge>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border-2 border-foreground/10 bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent sync runs</h2>
          <div className="space-y-3">
            {query.data.runs.map((run) => (
              <div key={run.id} className="rounded-lg border border-border/60 bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={run.status === 'success' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
                    {run.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatAdminDate(run.started_at)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {run.companies_checked} companies · {run.jobs_seen} seen · {run.jobs_upserted} upserted · {run.jobs_closed} closed
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border-2 border-foreground/10 bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent errors</h2>
          <div className="space-y-3">
            {query.data.errors.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">No recent sync errors.</p>
            ) : query.data.errors.map((error) => (
              <div key={error.id} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline">{error.stage}</Badge>
                  <span className="text-xs text-muted-foreground">{formatAdminDate(error.created_at)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-destructive">{error.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border-2 border-foreground/10 bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Company source management</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {query.data.companies.map((company) => (
            <div key={company.id} className="rounded-lg border border-border/60 bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{company.name}</h3>
                  <p className="text-xs text-muted-foreground">{company.domain}</p>
                </div>
                <Badge variant="outline" className="rounded-full capitalize">{company.sync_status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{company.ats_platform ?? 'unknown ATS'}</span>
                <span>·</span>
                <span>{company.hiring_status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminMetric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border-2 border-foreground/10 bg-card p-4">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function formatAdminDate(value: string | null | undefined): string {
  if (!value) return 'never';
  return new Date(value).toLocaleString();
}

export default Admin;
