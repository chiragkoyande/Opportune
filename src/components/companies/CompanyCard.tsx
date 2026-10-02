// ============================================================
// Opportune V4 — CompanyCard Component
// Displays: Logo, Company name, Industry, Location,
// Open jobs count, Open internships count, Hackathons count
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Briefcase, GraduationCap, Rocket, ArrowRight } from 'lucide-react';
import { Company } from '@/types/company';

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <Link
      to={`/companies/${company.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div>
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="h-12 w-12 rounded-xl bg-secondary/50 border border-border/60 p-1.5 overflow-hidden flex items-center justify-center flex-shrink-0">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                {company.name}
              </h3>
              {company.isVerified && (
                <span className="text-[10px] text-primary" title="Verified company">
                  ✓
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{company.industry}</p>
          </div>
        </div>

        {/* Location & Size */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{company.headquarters}</span>
        </div>

        {/* About snippet */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {company.about}
        </p>
      </div>

      {/* Footer stats */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {company.stats.openJobsCount > 0 && (
            <span className="flex items-center gap-1 text-job font-semibold">
              <Briefcase className="h-3 w-3" />
              {company.stats.openJobsCount} Jobs
            </span>
          )}
          {company.stats.openInternshipsCount > 0 && (
            <span className="flex items-center gap-1 text-internship font-semibold">
              <GraduationCap className="h-3 w-3" />
              {company.stats.openInternshipsCount} Interns
            </span>
          )}
          {company.stats.hackathonsCount > 0 && (
            <span className="flex items-center gap-1 text-hackathon font-semibold">
              <Rocket className="h-3 w-3" />
              {company.stats.hackathonsCount} Hacks
            </span>
          )}
        </div>

        <span className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
};
