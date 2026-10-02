import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Globe2, RadioTower } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Company, getCompanyLogoUrl } from '@/types/career';

interface CompanyCardProps {
  company: Company;
  openJobs?: number;
}

export function CompanyCard({ company, openJobs }: CompanyCardProps) {
  const logoUrl = getCompanyLogoUrl(company);

  return (
    <Link
      to={`/companies/${company.slug}`}
      className="group block rounded-lg border border-border/60 bg-card/95 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border/60 bg-background">
          {logoUrl ? (
            <img src={logoUrl} alt={company.name} className="h-9 w-9 rounded object-contain" loading="lazy" />
          ) : (
            <Globe2 className="h-6 w-6 text-primary" />
          )}
        </div>
        <Badge variant="outline" className="gap-1 rounded-full border-blue-500/30 bg-blue-500/10 text-blue-500">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </Badge>
      </div>

      <h2 className="line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary">
        {company.name}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{company.domain}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(company.tags.length > 0 ? company.tags : ['Company careers']).slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <RadioTower className="h-4 w-4 text-primary" />
          {openJobs === undefined ? 'Live careers' : `${openJobs} open roles`}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </Link>
  );
}
