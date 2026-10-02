// ============================================================
// Opportune V4 — Global Footer Component
// Structured sitemap with direct category links and platform info
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md pt-12 pb-24 md:pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-amber-500 to-accent text-primary-foreground shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-extrabold tracking-tight">OPPORTUNE</span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              The premier unified opportunity discovery platform for software engineers, student builders, and
              competitive programmers. Discover jobs, internships, hackathons, and contests in one single place.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Career Sitemap */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Career</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/jobs" className="hover:text-foreground transition-colors">
                  Explore Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?remoteOnly=true" className="hover:text-foreground transition-colors">
                  Remote Jobs
                </Link>
              </li>
              <li>
                <Link to="/internships" className="hover:text-foreground transition-colors">
                  Summer Internships
                </Link>
              </li>
              <li>
                <Link to="/internships?ppoOnly=true" className="hover:text-foreground transition-colors">
                  PPO Internships
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-foreground transition-colors">
                  Company Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Competitions Sitemap */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Competitions</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/hackathons" className="hover:text-foreground transition-colors">
                  All Hackathons
                </Link>
              </li>
              <li>
                <Link to="/hackathons?mode=online" className="hover:text-foreground transition-colors">
                  Online Hackathons
                </Link>
              </li>
              <li>
                <Link to="/contests" className="hover:text-foreground transition-colors">
                  Coding Contests
                </Link>
              </li>
              <li>
                <Link to="/contests?status=UPCOMING" className="hover:text-foreground transition-colors">
                  Upcoming Contests
                </Link>
              </li>
              <li>
                <Link to="/contests?status=LIVE" className="hover:text-foreground transition-colors">
                  Live Contests
                </Link>
              </li>
            </ul>
          </div>

          {/* User & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/saved" className="hover:text-foreground transition-colors">
                  Saved Opportunities
                </Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-foreground transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-foreground transition-colors">
                  Profile & Skills
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-foreground transition-colors">
                  Preferences
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-foreground transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Opportune Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision & passion</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 inline mx-0.5" />
            <span>for ambitious engineers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
