// ============================================================
// Opportune V4 — Frontend SEO Utility
// Dynamic page titles, meta descriptions, OpenGraph tags, canonicals
// ============================================================

import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
}

export const DEFAULT_SEO = {
  title: 'Opportune | Discover Jobs, Internships, Hackathons & Coding Contests',
  description:
    'The premier unified discovery engine for developers and tech students. Search and filter latest jobs, paid internships, global hackathons, and live coding contests in one place.',
  url: 'https://opportune.dev',
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_SEO.description,
  canonical,
  image = 'https://opportune.dev/og-image.png',
  type = 'website',
}) => {
  useEffect(() => {
    // Set document title
    const fullTitle = title
      ? `${title} — Opportune`
      : DEFAULT_SEO.title;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', image);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // Canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, canonical, image, type]);

  return null;
};
