import React, { useEffect } from 'react';

export interface SeoMetaProps {
  title: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  schema?: Record<string, any> | Record<string, any>[];
}

export const SeoHead: React.FC<SeoMetaProps> = ({
  title,
  description,
  canonicalPath = '',
  noindex = false,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  schema
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Canonical URL Resolution
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://urlshort.nasirdigitalhub.com';
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${origin}${cleanPath === '/' ? '' : cleanPath}`;

    // Helper to get or create a meta tag
    const setMetaTag = (attribute: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper for link tags
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Update Meta Description
    setMetaTag('name', 'description', description);

    // Update Canonical
    setLinkTag('canonical', canonicalUrl);

    // Update Robots
    setMetaTag(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );

    // Update OpenGraph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Boss URL Shortener');

    if (publishedTime) {
      setMetaTag('property', 'article:published_time', publishedTime);
    }
    if (modifiedTime) {
      setMetaTag('property', 'article:modified_time', modifiedTime);
    }

    // Update Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);

    // 3. Inject Structured Data (JSON-LD)
    let scriptTag = document.getElementById('seo-dynamic-schema') as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-dynamic-schema';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, canonicalPath, noindex, ogType, publishedTime, modifiedTime, schema]);

  return null;
};
