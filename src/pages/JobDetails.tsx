import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Radio,
  Share2,
  Sparkles,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCareerJob } from '@/hooks/useCareerJobs';
import { useJobBookmarks } from '@/hooks/useJobBookmarks';
import {
  getCompanyLogoUrl,
  getExperienceLabel,
  getPostedTime,
  getSalaryLabel,
  getSkillTags,
  isRemoteJob,
} from '@/types/career';
import { toast } from 'sonner';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobQuery = useCareerJob(id);
  const bookmarks = useJobBookmarks();

  if (jobQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="h-60 animate-pulse rounded-lg bg-muted" />
            <div className="h-80 animate-pulse rounded-lg bg-muted" />
          </div>
        </main>
      </div>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Job not found</h1>
          <p className="mt-2 text-muted-foreground">This role is closed or unavailable.</p>
          <Button onClick={() => navigate('/jobs')} className="mt-6 rounded-lg">Browse jobs</Button>
        </main>
      </div>
    );
  }

  const job = jobQuery.data;
  const saved = bookmarks.isBookmarked(job.id);
  const logoUrl = getCompanyLogoUrl(job.company);
  const skills = getSkillTags(job);
  const remote = isRemoteJob(job);

  const shareJob = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-6">
            <div className="rounded-lg border border-border/60 bg-card/95 p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background">
                  {logoUrl ? (
                    <img src={logoUrl} alt={job.company?.name ?? 'Company'} className="h-11 w-11 rounded object-contain" />
                  ) : (
                    <Building2 className="h-7 w-7 text-primary" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="gap-1 rounded-full border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-none">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                    {remote && (
                      <Badge className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-none">
                        <Radio className="h-3 w-3" />
                        Remote
                      </Badge>
                    )}
                    <Badge variant="outline" className="rounded-full capitalize">
                      {job.category}
                    </Badge>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {job.title}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {job.company?.name ?? 'Company'} · {getPostedTime(job.posted_at ?? job.last_seen_at)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1 rounded-full">
                      <Sparkles className="h-3 w-3" />
                      {getExperienceLabel(job)}
                    </Badge>
                    {job.location && (
                      <Badge variant="secondary" className="gap-1 rounded-full">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </Badge>
                    )}
                    <Badge variant="outline" className="rounded-full">
                      {getSalaryLabel(job)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-lg bg-foreground text-background hover:bg-foreground/90">
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                    Quick Apply
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg"
                  onClick={() => bookmarks.toggleBookmark(job.id, job.title)}
                >
                  {saved ? <BookmarkCheck className="mr-2 h-4 w-4 text-primary" /> : <Bookmark className="mr-2 h-4 w-4" />}
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="lg" className="rounded-lg" onClick={shareJob}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-card/95 p-5 shadow-sm md:p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Role overview</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                {job.description ? (
                  <p className="whitespace-pre-line leading-7">{job.description}</p>
                ) : (
                  <p>This company has not published a detailed description in its public feed yet. Use Quick Apply to view the official posting.</p>
                )}
              </div>
              {skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-card/95 p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Job details</h2>
              <Detail label="Company" value={job.company?.name ?? 'Verified company'} />
              <Detail label="Department" value={job.department ?? job.team ?? 'Not specified'} />
              <Detail label="Experience" value={getExperienceLabel(job)} />
              <Detail label="Location" value={job.location ?? 'Not specified'} />
              <Detail label="Work mode" value={job.workplace_type ?? (remote ? 'Remote' : 'Not specified')} />
              <Detail label="Employment" value={job.employment_type ?? (job.category === 'internship' ? 'Internship' : 'Full-time')} />
              <Detail label="Source" value={job.source_platform} />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/50 py-3 last:border-0">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}
