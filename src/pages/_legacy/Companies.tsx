import { useMemo, useState } from 'react';
import { Building2, Search, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CompanyCard } from '@/components/careers/CompanyCard';
import { useCareerCompanies, useCareerJobs } from '@/hooks/useCareerJobs';

export default function Companies() {
  const [query, setQuery] = useState('');
  const companiesQuery = useCareerCompanies(query);
  const jobsQuery = useCareerJobs();
  const jobsByCompany = useMemo(() => {
    const map = new Map<string, number>();
    jobsQuery.data?.pages.forEach((page) => {
      page.jobs.forEach((job) => {
        map.set(job.company_id, (map.get(job.company_id) ?? 0) + 1);
      });
    });
    return map;
  }, [jobsQuery.data]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-8">
        <section className="mb-6 rounded-lg border border-border/60 bg-card/80 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                Verified career sources
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Companies
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore official company career pages tracked by Opportune.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search companies..."
                className="h-11 w-full rounded-lg border border-border/60 bg-background pl-11 pr-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {companiesQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-lg border border-border/60 bg-card" />
            ))}
          </div>
        ) : companiesQuery.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            Unable to load companies. Apply the Phase 1 migration and confirm public RLS reads are enabled.
          </div>
        ) : companiesQuery.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {companiesQuery.data.map((company) => (
              <CompanyCard key={company.id} company={company} openJobs={jobsByCompany.get(company.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 bg-card/95 p-10 text-center">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">No companies found</h2>
            <p className="mt-1 text-sm text-muted-foreground">Try a different company name or domain.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
