import { Link } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CareerJob,
  CareerViewMode,
  getCompanyLogoUrl,
  getExperienceLabel,
  getPostedTime,
  getSalaryLabel,
  getSkillTags,
  isRemoteJob,
} from '@/types/career';

interface JobCardProps {
  job: CareerJob;
  viewMode: CareerViewMode;
  saved: boolean;
  onToggleSave: (job: CareerJob) => void;
}

export function JobCard({ job, viewMode, saved, onToggleSave }: JobCardProps) {
  const logoUrl = getCompanyLogoUrl(job.company);
  const skills = getSkillTags(job);
  const remote = isRemoteJob(job);

  return (
    <article
      className={`group rounded-lg border border-border/60 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card ${
        viewMode === 'list' ? 'p-4' : 'p-5'
      }`}
    >
      <div className={viewMode === 'list' ? 'flex flex-col gap-4 lg:flex-row lg:items-center' : 'space-y-4'}>
        <div className="flex min-w-0 flex-1 gap-4">
          <Link
            to={job.company ? `/companies/${job.company.slug}` : '/companies'}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={job.company?.name ?? 'Company'}
                className="h-8 w-8 rounded object-contain"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Briefcase className="h-5 w-5 text-primary" />
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link to={job.company ? `/companies/${job.company.slug}` : '/companies'} className="truncate font-medium text-foreground hover:text-primary">
                {job.company?.name ?? 'Verified company'}
              </Link>
              <Badge variant="outline" className="h-5 gap-1 rounded-full border-blue-500/30 bg-blue-500/10 px-2 text-[10px] text-blue-500">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
              <span className="text-xs">{getPostedTime(job.posted_at ?? job.last_seen_at)}</span>
            </div>

            <Link to={`/jobs/${job.id}`} className="block">
              <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground group-hover:text-primary md:text-lg">
                {job.title}
              </h2>
            </Link>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="gap-1 rounded-full bg-secondary/70 font-medium">
                <Sparkles className="h-3 w-3" />
                {getExperienceLabel(job)}
              </Badge>
              {job.location && (
                <Badge variant="secondary" className="gap-1 rounded-full bg-secondary/70 font-medium">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </Badge>
              )}
              {remote && (
                <Badge className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-none">
                  <Radio className="h-3 w-3" />
                  Remote
                </Badge>
              )}
              <Badge variant="outline" className="rounded-full border-border/70 font-medium">
                {getSalaryLabel(job)}
              </Badge>
            </div>

            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`flex shrink-0 gap-2 ${viewMode === 'list' ? 'lg:w-56 lg:justify-end' : ''}`}>
          <Button asChild className="h-10 flex-1 rounded-lg bg-foreground text-background hover:bg-foreground/90 lg:flex-none">
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
              Quick Apply
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg"
            onClick={() => onToggleSave(job)}
            aria-label={saved ? 'Remove saved job' : 'Save job'}
          >
            {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 bg-card/90 p-5">
      <div className="flex gap-4">
        <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
