// ============================================================
// Opportune V4 — Admin Portal
// Section 36: Full Administration Experience (Frontend Only)
// Sub-views: Dashboard, Jobs, Internships, Hackathons, Contests,
// Companies, Crawlers, Logs, Statistics.
// Supports: Search, Filters, Pagination, Status, Health Indicators
// ============================================================

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Briefcase,
  GraduationCap,
  Rocket,
  Trophy,
  Building2,
  Activity,
  FileText,
  BarChart3,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SEO } from '@/lib/seo';
import { MOCK_JOBS, MOCK_INTERNSHIPS, MOCK_HACKATHONS, MOCK_CONTESTS, MOCK_COMPANIES } from '@/services/mockData';

interface CrawlerStatus {
  id: string;
  name: string;
  category: 'jobs' | 'internships' | 'hackathons' | 'contests';
  target: string;
  status: 'healthy' | 'warning' | 'idle';
  lastRun: string;
  itemsFound: number;
  frequency: string;
}

const MOCK_CRAWLERS: CrawlerStatus[] = [
  { id: 'cr-1', name: 'Google Careers Scraper', category: 'jobs', target: 'careers.google.com', status: 'healthy', lastRun: '12 mins ago', itemsFound: 42, frequency: 'Every 2 hours' },
  { id: 'cr-2', name: 'Stripe Jobs Sync', category: 'jobs', target: 'stripe.com/jobs', status: 'healthy', lastRun: '45 mins ago', itemsFound: 18, frequency: 'Every 4 hours' },
  { id: 'cr-3', name: 'Devpost Hackathons RSS', category: 'hackathons', target: 'devpost.com/hackathons', status: 'healthy', lastRun: '2 hours ago', itemsFound: 29, frequency: 'Every 6 hours' },
  { id: 'cr-4', name: 'Devfolio Web3 Hackathons', category: 'hackathons', target: 'devfolio.co', status: 'healthy', lastRun: '3 hours ago', itemsFound: 14, frequency: 'Every 6 hours' },
  { id: 'cr-5', name: 'CodeChef Contest Poller', category: 'contests', target: 'codechef.com/api', status: 'healthy', lastRun: '10 mins ago', itemsFound: 8, frequency: 'Every 30 mins' },
  { id: 'cr-6', name: 'Codeforces Round API', category: 'contests', target: 'codeforces.com/api', status: 'healthy', lastRun: '15 mins ago', itemsFound: 12, frequency: 'Every 30 mins' },
  { id: 'cr-7', name: 'LeetCode Weekly Scraper', category: 'contests', target: 'leetcode.com/contest', status: 'warning', lastRun: '5 hours ago', itemsFound: 4, frequency: 'Every 12 hours' },
];

const MOCK_LOGS = [
  { id: 'log-1', timestamp: '2026-10-02 13:45:12', level: 'info', service: 'crawler.codechef', message: 'Sync completed: 8 upcoming rounds recorded.' },
  { id: 'log-2', timestamp: '2026-10-02 13:40:02', level: 'info', service: 'crawler.google', message: 'Ingested 4 new SWE roles in Bengaluru.' },
  { id: 'log-3', timestamp: '2026-10-02 13:25:31', level: 'warn', service: 'crawler.leetcode', message: 'Rate limit threshold 80% reached on contest poller.' },
  { id: 'log-4', timestamp: '2026-10-02 12:15:19', level: 'info', service: 'scheduler', message: 'Daily opportunity hygiene check: 3 expired hackathons archived.' },
  { id: 'log-5', timestamp: '2026-10-02 11:00:44', level: 'info', service: 'crawler.devpost', message: 'Discovered new AI Innovation Global Hackathon.' },
];

export const AdminPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active section from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeSubSection = pathParts[1] || 'dashboard';

  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (val: string) => {
    navigate(val === 'dashboard' ? '/admin' : `/admin/${val}`);
  };

  const getHealthBadge = (status: CrawlerStatus['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> Healthy
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="h-3 w-3" /> Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SEO title="Admin Operations Portal | Opportune" description="Internal administrative operations, crawler health monitors, and ingestion statistics." />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-accent/10 text-accent">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Operations Portal</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            System Administration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor pipeline crawlers, verify opportunity metadata, and review platform logs.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-9 gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Stats
        </Button>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeSubSection} onValueChange={handleTabChange} className="space-y-6">
        <div className="border-b border-border/50 pb-px overflow-x-auto">
          <TabsList className="bg-transparent p-0 gap-2 h-auto">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <Activity className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-job/10 data-[state=active]:text-job rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Jobs ({MOCK_JOBS.length})
            </TabsTrigger>
            <TabsTrigger
              value="internships"
              className="data-[state=active]:bg-internship/10 data-[state=active]:text-internship rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Internships ({MOCK_INTERNSHIPS.length})
            </TabsTrigger>
            <TabsTrigger
              value="hackathons"
              className="data-[state=active]:bg-hackathon/10 data-[state=active]:text-hackathon rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <Rocket className="h-3.5 w-3.5" />
              Hackathons ({MOCK_HACKATHONS.length})
            </TabsTrigger>
            <TabsTrigger
              value="contests"
              className="data-[state=active]:bg-contest/10 data-[state=active]:text-contest rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <Trophy className="h-3.5 w-3.5" />
              Contests ({MOCK_CONTESTS.length})
            </TabsTrigger>
            <TabsTrigger
              value="companies"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" />
              Companies ({MOCK_COMPANIES.length})
            </TabsTrigger>
            <TabsTrigger
              value="crawlers"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Crawlers
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Logs
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-xl px-3.5 py-1.5 text-xs font-semibold gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Statistics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Dashboard Overview */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Active Jobs</span>
              <p className="font-display text-2xl font-bold text-job">{MOCK_JOBS.length}</p>
              <span className="text-[10px] text-emerald-500 font-semibold">100% verified</span>
            </div>

            <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Active Internships</span>
              <p className="font-display text-2xl font-bold text-internship">{MOCK_INTERNSHIPS.length}</p>
              <span className="text-[10px] text-emerald-500 font-semibold">Stipends confirmed</span>
            </div>

            <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Open Hackathons</span>
              <p className="font-display text-2xl font-bold text-hackathon">{MOCK_HACKATHONS.length}</p>
              <span className="text-[10px] text-primary font-semibold">₹1.5Cr+ prize pool</span>
            </div>

            <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-1">
              <span className="text-muted-foreground text-xs font-medium">Coding Contests</span>
              <p className="font-display text-2xl font-bold text-contest">{MOCK_CONTESTS.length}</p>
              <span className="text-[10px] text-emerald-500 font-semibold">Active pollers</span>
            </div>
          </div>

          {/* Quick crawler status preview */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Crawler Ingestion Health</h3>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/admin/crawlers">View all crawlers →</Link>
              </Button>
            </div>

            <div className="divide-y divide-border/40 text-xs">
              {MOCK_CRAWLERS.slice(0, 4).map((cr) => (
                <div key={cr.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{cr.name}</p>
                    <span className="text-muted-foreground text-[11px]">{cr.target} • {cr.frequency}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-[11px]">Found: {cr.itemsFound} items</span>
                    {getHealthBadge(cr.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 2. Jobs Table */}
        <TabsContent value="jobs">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 border-b border-border/50 text-[11px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_JOBS.map((j) => (
                  <tr key={j.id} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{j.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{j.company.name}</td>
                    <td className="py-3 px-4 capitalize">{j.employmentType}</td>
                    <td className="py-3 px-4">{j.salary?.formatted || 'Competitive'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{j.sourcePlatform || 'Careers'}</td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                        <Link to={`/jobs/${j.slug}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 3. Internships Table */}
        <TabsContent value="internships">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 border-b border-border/50 text-[11px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Stipend</th>
                  <th className="py-3 px-4">PPO</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_INTERNSHIPS.map((i) => (
                  <tr key={i.id} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{i.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{i.company.name}</td>
                    <td className="py-3 px-4">{i.duration.formatted}</td>
                    <td className="py-3 px-4">{i.stipend?.formatted || 'Unpaid'}</td>
                    <td className="py-3 px-4">{i.ppoOffered ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                        <Link to={`/internships/${i.slug}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 4. Hackathons Table */}
        <TabsContent value="hackathons">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 border-b border-border/50 text-[11px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Hackathon</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Prize Pool</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_HACKATHONS.map((h) => (
                  <tr key={h.id} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{h.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{h.organizer.name}</td>
                    <td className="py-3 px-4 capitalize">{h.mode}</td>
                    <td className="py-3 px-4 font-semibold text-hackathon">{h.prizePool.formatted}</td>
                    <td className="py-3 px-4">{new Date(h.registrationDeadline).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                        <Link to={`/hackathons/${h.slug}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 5. Contests Table */}
        <TabsContent value="contests">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 border-b border-border/50 text-[11px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Contest</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_CONTESTS.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{c.name}</td>
                    <td className="py-3 px-4">{c.platform}</td>
                    <td className="py-3 px-4">{new Date(c.startTime).toLocaleString()}</td>
                    <td className="py-3 px-4">{c.durationFormatted}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] uppercase text-contest">{c.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                        <Link to={`/contests/${c.slug}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 6. Companies Table */}
        <TabsContent value="companies">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 border-b border-border/50 text-[11px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Headquarters</th>
                  <th className="py-3 px-4">Open Opportunities</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_COMPANIES.map((comp) => (
                  <tr key={comp.id} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{comp.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{comp.industry}</td>
                    <td className="py-3 px-4">{comp.headquarters}</td>
                    <td className="py-3 px-4 font-medium">{comp.stats.totalOpportunities}</td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                        <Link to={`/companies/${comp.slug}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 7. Crawlers Health */}
        <TabsContent value="crawlers">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 border-b border-border/50 text-[11px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Crawler</th>
                  <th className="py-3 px-4">Target Domain</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4">Last Ingest</th>
                  <th className="py-3 px-4">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_CRAWLERS.map((cr) => (
                  <tr key={cr.id} className="hover:bg-secondary/20">
                    <td className="py-3 px-4 font-semibold text-foreground">{cr.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{cr.target}</td>
                    <td className="py-3 px-4 capitalize">{cr.category}</td>
                    <td className="py-3 px-4">{getHealthBadge(cr.status)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{cr.lastRun}</td>
                    <td className="py-3 px-4 font-bold">{cr.itemsFound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 8. Logs */}
        <TabsContent value="logs">
          <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2 font-mono text-xs">
            {MOCK_LOGS.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-secondary/30 flex items-start gap-3">
                <span className="text-muted-foreground text-[11px] whitespace-nowrap">{log.timestamp}</span>
                <span
                  className={`uppercase font-bold text-[10px] px-1.5 py-0.2 rounded ${
                    log.level === 'warn' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-primary font-semibold">{log.service}:</span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 9. Statistics */}
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-2">
              <h3 className="font-bold text-sm text-foreground">Discovery Ratio</h3>
              <p className="text-xs text-muted-foreground">Distribution across opportunity sectors</p>
              <div className="space-y-1.5 pt-2 text-xs">
                <div className="flex justify-between"><span>Jobs</span><span className="font-bold">42%</span></div>
                <div className="flex justify-between"><span>Internships</span><span className="font-bold">28%</span></div>
                <div className="flex justify-between"><span>Hackathons</span><span className="font-bold">18%</span></div>
                <div className="flex justify-between"><span>Contests</span><span className="font-bold">12%</span></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-2">
              <h3 className="font-bold text-sm text-foreground">Crawler Health Score</h3>
              <p className="text-xs text-muted-foreground">Uptime and success rate across background pollers</p>
              <p className="font-display text-3xl font-extrabold text-emerald-500 pt-2">99.4%</p>
              <span className="text-[11px] text-muted-foreground">0 critical failures in last 30 days</span>
            </div>

            <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-2">
              <h3 className="font-bold text-sm text-foreground">API Latency</h3>
              <p className="text-xs text-muted-foreground">Average response time for discovery queries</p>
              <p className="font-display text-3xl font-extrabold text-primary pt-2">48ms</p>
              <span className="text-[11px] text-muted-foreground">Optimized with TanStack Query caching</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
