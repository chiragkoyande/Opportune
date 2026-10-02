// ============================================================
// Opportune V4 — Company Profile Page
// Section 14: Dedicated Organization Profile & Open Opportunities
// Displays: Company overview, culture, website, careers page,
// social links, and associated Jobs, Internships, Hackathons.
// ============================================================

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Rocket,
  Users,
  Calendar,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/lib/seo';
import { companiesService } from '@/services/companies';
import { JobCard } from '@/components/jobs/JobCard';
import { InternshipCard } from '@/components/internships/InternshipCard';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorState, EmptyState } from '@/components/ui/StatusStates';
import { useToast } from '@/hooks/use-toast';

export const CompanyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: company, isLoading, isError, error } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => companiesService.getCompanyBySlug(slug!),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (isError || !company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Company Not Found"
          message={error instanceof Error ? error.message : "The requested company profile could not be found."}
          onRetry={() => navigate('/companies')}
        />
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${company.name} on Opportune`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Company profile link copied!' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO
        title={`${company.name} Careers & Opportunities | Opportune`}
        description={`Explore open engineering jobs, internships, and hackathons hosted by ${company.name}.`}
      />

      <Link
        to="/companies"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </Link>

      {/* Hero Banner with Banner Image */}
      <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm mb-8">
        {company.bannerUrl && (
          <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-secondary">
            <img src={company.bannerUrl} alt={company.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-2xl bg-card border-2 border-border/80 p-2 overflow-hidden shadow-md flex items-center justify-center flex-shrink-0">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <span className="text-primary text-xs font-bold" title="Verified company">
                      ✓ Verified Partner
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{company.industry}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button asChild size="sm" variant="outline" className="h-9 text-xs gap-1.5 border-border/60">
                <a href={company.websiteUrl} target="_blank" rel="noreferrer">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              </Button>
              {company.careersUrl && (
                <Button asChild size="sm" className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
                  <a href={company.careersUrl} target="_blank" rel="noreferrer">
                    Careers Portal
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleShare} className="h-9 w-9 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Meta */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border/40 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {company.headquarters}
            </span>
            {company.size && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {company.size}
              </span>
            )}
            {company.foundedYear && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Founded {company.foundedYear}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Opportunities and Overview */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-secondary/40 p-1 border border-border/50">
          <TabsTrigger value="all" className="text-xs font-semibold">
            All Opportunities ({company.stats.totalOpportunities})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs font-semibold gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-job" />
            Jobs ({company.jobs.length})
          </TabsTrigger>
          <TabsTrigger value="internships" className="text-xs font-semibold gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-internship" />
            Internships ({company.internships.length})
          </TabsTrigger>
          <TabsTrigger value="hackathons" className="text-xs font-semibold gap-1.5">
            <Rocket className="h-3.5 w-3.5 text-hackathon" />
            Hackathons ({company.hackathons.length})
          </TabsTrigger>
          <TabsTrigger value="about" className="text-xs font-semibold">
            About Company
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Opportunities */}
        <TabsContent value="all" className="space-y-6">
          {company.stats.totalOpportunities === 0 ? (
            <EmptyState
              title="No open opportunities currently"
              message="Check back soon or visit their official careers portal for new listings."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {company.internships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
              {company.hackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Jobs */}
        <TabsContent value="jobs">
          {company.jobs.length === 0 ? (
            <EmptyState title="No open jobs listed" message="No active job vacancies at this time." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Internships */}
        <TabsContent value="internships">
          {company.internships.length === 0 ? (
            <EmptyState title="No open internships" message="No active student internships at this time." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.internships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Hackathons */}
        <TabsContent value="hackathons">
          {company.hackathons.length === 0 ? (
            <EmptyState title="No active hackathons" message="No sponsored or hosted hackathons right now." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.hackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 5: About & Culture */}
        <TabsContent value="about">
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">About {company.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {company.about}
              </p>
            </div>

            {company.culture && (
              <div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">Work Culture</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {company.culture}
                </p>
              </div>
            )}

            {company.perks && company.perks.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-lg text-foreground mb-3">Company Benefits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {company.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDetailPage;
