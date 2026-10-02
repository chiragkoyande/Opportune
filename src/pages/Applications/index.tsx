// ============================================================
// Opportune V4 — Application Tracker Page
// Section 19: Dedicated Career Pipeline (Jobs & Internships)
// Views: Kanban Board & Structured List
// Statuses: Saved, Applied, Screening, Interview, Offer, Rejected
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Kanban,
  ListFilter,
  Plus,
  Building2,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/lib/seo';
import { applicationsService } from '@/services/applications';
import {
  Application,
  ApplicationStatus,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '@/types/application';
import { EmptyState, ErrorState } from '@/components/ui/StatusStates';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLUMNS: ApplicationStatus[] = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
];

export const ApplicationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // New application form state
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formType, setFormType] = useState<'job' | 'internship'>('job');
  const [formStatus, setFormStatus] = useState<ApplicationStatus>('applied');
  const [formNotes, setFormNotes] = useState('');

  // Fetch applications
  const { data: applications = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsService.getApplications(),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationsService.updateApplication(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({ title: 'Application status updated' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => applicationsService.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({ title: 'Application removed' });
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: applicationsService.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setAddDialogOpen(false);
      setFormTitle('');
      setFormCompany('');
      setFormLocation('');
      setFormNotes('');
      toast({ title: 'Application added to tracker' });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCompany) {
      toast({ title: 'Title and company are required', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      opportunityId: `custom-${Date.now()}`,
      opportunityType: formType,
      opportunityTitle: formTitle,
      opportunitySlug: formTitle.toLowerCase().replace(/\s+/g, '-'),
      companyName: formCompany,
      location: formLocation || 'Remote',
      status: formStatus,
      notes: formNotes,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title="Application Tracker (Kanban) | Opportune"
        description="Track your engineering job and internship applications from initial submission to final offers."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <Kanban className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workflow</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pipeline management for your active tech jobs and internships.
          </p>
        </div>

        {/* View Toggle & Add Application Modal */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-secondary/50 rounded-xl border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'kanban' ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'list' ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              List
            </button>
          </div>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold">
                <Plus className="h-3.5 w-3.5" />
                Track Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Track New Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="app-title" className="text-xs font-semibold">
                    Position Title *
                  </Label>
                  <Input
                    id="app-title"
                    placeholder="e.g. Backend Engineer or Summer Intern"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="app-company" className="text-xs font-semibold">
                      Company *
                    </Label>
                    <Input
                      id="app-company"
                      placeholder="e.g. Stripe, Razorpay"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="app-loc" className="text-xs font-semibold">
                      Location
                    </Label>
                    <Input
                      id="app-loc"
                      placeholder="e.g. Bengaluru, Remote"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Opportunity Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formType === 'job' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormType('job')}
                        className="flex-1 h-8 text-xs"
                      >
                        Job
                      </Button>
                      <Button
                        type="button"
                        variant={formType === 'internship' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormType('internship')}
                        className="flex-1 h-8 text-xs"
                      >
                        Internship
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Initial Stage</Label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as ApplicationStatus)}
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {STATUS_COLUMNS.map((st) => (
                        <option key={st} value={st}>
                          {APPLICATION_STATUS_LABELS[st]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="app-notes" className="text-xs font-semibold">
                    Notes / Referral details
                  </Label>
                  <Input
                    id="app-notes"
                    placeholder="e.g. Applied with referral from Alex"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <Button type="submit" size="sm" className="w-full h-9 text-xs font-semibold bg-primary">
                  Save to Tracker
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground text-xs">
          Loading your application pipeline...
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load applications"
          message={error instanceof Error ? error.message : 'Please try again.'}
          onRetry={refetch}
        />
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((status) => {
            const columnApps = applications.filter((a) => a.status === status);
            const style = APPLICATION_STATUS_COLORS[status];

            return (
              <div
                key={status}
                className="bg-card rounded-2xl border border-border/60 p-3 flex flex-col min-w-[210px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${style.text.replace('text-', 'bg-')}`} />
                    <h3 className="font-bold text-xs text-foreground">
                      {APPLICATION_STATUS_LABELS[status]}
                    </h3>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground font-semibold">
                    {columnApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 min-h-[140px]">
                  {columnApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl border border-border/60 bg-secondary/20 hover:border-primary/40 hover:bg-card shadow-xs transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                            {app.opportunityType === 'job' ? (
                              <Briefcase className="h-2.5 w-2.5 text-job" />
                            ) : (
                              <GraduationCap className="h-2.5 w-2.5 text-internship" />
                            )}
                            {app.opportunityType}
                          </span>
                          <h4 className="font-bold text-xs text-foreground line-clamp-1 mt-0.5" title={app.opportunityTitle}>
                            {app.opportunityTitle}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">{app.companyName}</p>
                        </div>

                        {/* Move Status Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuLabel className="text-[11px]">Move stage to:</DropdownMenuLabel>
                            {STATUS_COLUMNS.map((colStatus) => (
                              <DropdownMenuItem
                                key={colStatus}
                                onClick={() => updateStatusMutation.mutate({ id: app.id, status: colStatus })}
                                disabled={app.status === colStatus}
                                className="text-xs"
                              >
                                {APPLICATION_STATUS_LABELS[colStatus]}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(app.id)}
                              className="text-xs text-destructive focus:text-destructive"
                            >
                              Delete Tracker
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Location & Compensation */}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                        <span className="truncate">{app.location}</span>
                        {app.compensation && (
                          <span className="font-semibold text-foreground truncate">{app.compensation}</span>
                        )}
                      </div>

                      {/* Notes snippet */}
                      {app.notes && app.notes.length > 0 && (
                        <p className="text-[10px] text-muted-foreground bg-secondary/50 p-1.5 rounded line-clamp-2">
                          {app.notes[app.notes.length - 1].content}
                        </p>
                      )}
                    </div>
                  ))}

                  {columnApps.length === 0 && (
                    <div className="flex items-center justify-center h-24 border border-dashed border-border/40 rounded-xl text-[11px] text-muted-foreground/60 select-none">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Table View */}
      {viewMode === 'list' && !isLoading && (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 border-b border-border/50 text-[11px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Role & Opportunity</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {applications.map((app) => {
                  const style = APPLICATION_STATUS_COLORS[app.status];
                  return (
                    <tr key={app.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {app.opportunityTitle}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{app.companyName}</td>
                      <td className="py-3 px-4 capitalize">{app.opportunityType}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${style.bg} ${style.text} ${style.border}`}>
                          {APPLICATION_STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(app.appliedDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(app.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
