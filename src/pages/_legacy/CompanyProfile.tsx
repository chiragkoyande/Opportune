import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe2, RadioTower, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobCard, JobCardSkeleton } from '@/components/careers/JobCard';
import { useCompanyProfile } from '@/hooks/useCareerJobs';
import { useJobBookmarks } from '@/hooks/useJobBookmarks';
import { getCompanyLogoUrl } from '@/types/career';

export default function CompanyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const profileQuery = useCompanyProfile(slug);
  const bookmarks = useJobBookmarks();

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="mb-6 h-44 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => <JobCardSkeleton key={index} />)}
          </div>
        </main>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Company not found</h1>
          <p className="mt-2 text-muted-foreground">This company is not available yet.</p>
          <Button onClick={() => navigate('/companies')} className="mt-6 rounded-lg">Browse companies</Button>
        </main>
      </div>
    );
  }

  const { company, jobs } = profileQuery.data;
  const logoUrl = getCompanyLogoUrl(company);

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

        <section className="mb-6 rounded-lg border border-border/60 bg-card/90 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background">
                {logoUrl ? (
                  <img src={logoUrl} alt={company.name} className="h-11 w-11 rounded object-contain" />
                ) : (
                  <Globe2 className="h-7 w-7 text-primary" />
                )}
              </div>
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge className="gap-1 rounded-full border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-none">
                    <ShieldCheck className="h-3 w-3" />
                    Verified careers
                  </Badge>
                  {company.ats_platform && (
                    <Badge variant="outline" className="rounded-full capitalize">
                      {company.ats_platform}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {company.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{company.domain}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(company.tags.length > 0 ? company.tags : ['Official careers']).map((tag) => (
                    <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-lg">
                <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                  Website
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              {company.careers_url && (
                <Button asChild className="rounded-lg bg-foreground text-background hover:bg-foreground/90">
                  <a href={company.careers_url} target="_blank" rel="noopener noreferrer">
                    Careers
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-t border-border/60 pt-5 sm:grid-cols-3">
            <Metric label="Open roles" value={String(jobs.length)} />
            <Metric label="Source" value={company.ats_platform ?? 'custom'} />
            <Metric label="Last sync" value={company.last_successful_sync_at ? new Date(company.last_successful_sync_at).toLocaleDateString() : 'Pending'} />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <RadioTower className="h-5 w-5 text-primary" />
              Open roles
            </h2>
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link to={`/jobs?company=${company.id}`}>View all</Link>
            </Button>
          </div>

          {jobs.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  viewMode="grid"
                  saved={bookmarks.isBookmarked(job.id)}
                  onToggleSave={(item) => bookmarks.toggleBookmark(item.id, item.title)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-card/95 p-10 text-center">
              <h3 className="font-semibold text-foreground">No open roles right now</h3>
              <p className="mt-1 text-sm text-muted-foreground">The next sync will refresh this company automatically.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold capitalize text-foreground">{value}</div>
    </div>
  );
}
