---
id: pt-critical-css
name: Critical CSS
version: 2.0.0
layer: L5
category: performance
description: Above-the-fold CSS extraction and optimization for Next.js 15 applications
tags: [css, critical, performance, fcp, render-blocking]
composes: []
dependencies: []
formula: "critical_css = inline_above_fold + defer_non_critical + route_specific + skeleton_styles"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Critical CSS Pattern

## Overview

Above-the-fold CSS extraction and optimization for Next.js 15 applications. Inlines critical CSS to eliminate render-blocking stylesheets and improve First Contentful Paint (FCP).

## When to Use

- **FCP optimization**: Reduce render-blocking CSS
- **Above-the-fold styling**: Inline header, hero, navigation styles
- **Skeleton loading**: Inline skeleton animation styles
- **Route-specific CSS**: Different critical styles per route
- **Large stylesheets**: Split critical from non-critical
- **Third-party CSS**: Defer non-essential external styles

## Composition Diagram

```
+------------------+
|   HTML Document  |
+------------------+
          |
          v
+------------------+
| <style> Inline   |
| (Critical CSS)   |
+------------------+
          |
    +-----+-----+
    |           |
    v           v
+--------+  +----------+
|Header  |  |Hero      |
|Styles  |  |Styles    |
+--------+  +----------+
          |
          v
+------------------+
| <link> Preload   |
| (Non-critical)   |
+------------------+
          |
          v
+------------------+
| requestIdleCallback|
| (Deferred Load)   |
+------------------+
```

## Implementation

### Inline Critical Styles in Layout

```typescript
// app/layout.tsx
import { Metadata } from 'next';

// Critical CSS for above-the-fold content
const criticalCSS = `
  /* Reset and base */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { line-height: 1.5; -webkit-text-size-adjust: 100%; }
  body { font-family: var(--font-sans), system-ui, sans-serif; }
  
  /* Layout primitives */
  .container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  
  /* Header (always above fold) */
  .header { 
    position: sticky; 
    top: 0; 
    z-index: 50;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    height: 64px;
  }
  
  /* Hero section */
  .hero {
    min-height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  /* Typography */
  .text-5xl { font-size: 3rem; line-height: 1; }
  .font-bold { font-weight: 700; }
  .text-white { color: white; }
  
  /* Button */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: white;
    color: #667eea;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
  }
  
  /* Loading skeleton */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
  
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inline critical CSS */}
        <style
          id="critical-css"
          dangerouslySetInnerHTML={{ __html: criticalCSS }}
        />
        
        {/* Preload main stylesheet */}
        <link
          rel="preload"
          href="/_next/static/css/app.css"
          as="style"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Component-Level Critical CSS

```typescript
// components/critical-hero.tsx
const heroStyles = `
  .hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .hero-background {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .hero-content {
    position: relative;
    z-index: 10;
    text-align: center;
    color: white;
    padding: 2rem;
  }
  
  .hero-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: clamp(1rem, 3vw, 1.5rem);
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto 2rem;
  }
`;

export function CriticalHero() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroStyles }} />
      <section className="hero-section">
        <div className="hero-background" />
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Our Platform</h1>
          <p className="hero-subtitle">
            Build amazing products with our cutting-edge tools
          </p>
          <a href="/get-started" className="btn-primary">
            Get Started
          </a>
        </div>
      </section>
    </>
  );
}
```

### Tailwind Critical CSS Extraction

```typescript
// scripts/extract-critical-css.ts
import { PurgeCSS } from 'purgecss';
import * as fs from 'fs';
import * as path from 'path';

async function extractCriticalCSS() {
  // Read the built CSS
  const cssPath = path.join(process.cwd(), '.next/static/css');
  const cssFiles = fs.readdirSync(cssPath).filter(f => f.endsWith('.css'));
  
  let allCSS = '';
  for (const file of cssFiles) {
    allCSS += fs.readFileSync(path.join(cssPath, file), 'utf-8');
  }

  // Define critical selectors (above-the-fold components)
  const criticalSelectors = [
    // Layout
    'html', 'body', 'main',
    // Header
    'header', 'nav', '.logo', '.nav-link',
    // Hero
    '.hero', '.hero-title', '.hero-subtitle',
    // Buttons
    '.btn', '.btn-primary', '.btn-secondary',
    // Typography
    'h1', 'h2', 'p',
    // Utilities
    '.container', '.flex', '.grid',
    '.items-center', '.justify-between',
    '.text-center', '.font-bold',
    // Loading states
    '.skeleton', '.animate-pulse',
  ];

  // Extract only critical CSS
  const purgeCSSResult = await new PurgeCSS().purge({
    content: [
      {
        raw: criticalSelectors.map(s => `<div class="${s.replace('.', '')}"></div>`).join(''),
        extension: 'html',
      },
    ],
    css: [{ raw: allCSS }],
    safelist: criticalSelectors,
  });

  const criticalCSS = purgeCSSResult[0]?.css || '';
  
  // Minify
  const minified = criticalCSS
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .trim();

  // Save
  fs.writeFileSync(
    path.join(process.cwd(), 'public/critical.css'),
    minified
  );

  console.log(`Critical CSS extracted: ${minified.length} bytes`);
}

extractCriticalCSS();
```

### Deferred Non-Critical CSS

```typescript
// components/deferred-styles.tsx
'use client';

import { useEffect, useState } from 'react';

export function DeferredStyles() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load non-critical CSS after page is interactive
    const loadStyles = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/styles/non-critical.css';
      link.onload = () => setLoaded(true);
      document.head.appendChild(link);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadStyles);
    } else {
      setTimeout(loadStyles, 0);
    }
  }, []);

  return null;
}

// Alternative: CSS-in-JS deferred loading
export function DeferredCSSInJS({ styles }: { styles: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
```

### Route-Specific Critical CSS

```typescript
// lib/critical-css.ts
const criticalCSSByRoute: Record<string, string> = {
  '/': `
    .hero { min-height: 100vh; }
    .feature-grid { display: grid; gap: 2rem; }
  `,
  '/products': `
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
    .product-card { background: white; border-radius: 0.5rem; overflow: hidden; }
  `,
  '/checkout': `
    .checkout-form { max-width: 600px; margin: 0 auto; }
    .form-group { margin-bottom: 1rem; }
    .input { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; }
  `,
};

export function getCriticalCSS(pathname: string): string {
  // Base critical CSS
  const baseCSS = `
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
  `;

  // Route-specific CSS
  const routeCSS = criticalCSSByRoute[pathname] || '';

  return baseCSS + routeCSS;
}

// Usage in layout
// app/[...slug]/layout.tsx
import { headers } from 'next/headers';
import { getCriticalCSS } from '@/lib/critical-css';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  const criticalCSS = getCriticalCSS(pathname);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      {children}
    </>
  );
}
```

### CSS Loading Priority

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 1. Inline critical CSS (highest priority) */}
        <style id="critical" dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* 2. Preload important stylesheets */}
        <link
          rel="preload"
          href="/styles/main.css"
          as="style"
        />
        
        {/* 3. Load main stylesheet with low priority */}
        <link
          rel="stylesheet"
          href="/styles/main.css"
          media="print"
          // @ts-ignore - onLoad to switch media
          onLoad="this.media='all'"
        />
        
        {/* 4. Fallback for no-JS */}
        <noscript>
          <link rel="stylesheet" href="/styles/main.css" />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Skeleton Styles

```typescript
// components/skeleton-styles.tsx
// Always inline skeleton styles for instant loading states

const skeletonCSS = `
  .skeleton {
    position: relative;
    overflow: hidden;
    background-color: #e5e7eb;
    border-radius: 0.25rem;
  }
  
  .skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
  
  .skeleton-text {
    height: 1em;
    margin-bottom: 0.5em;
  }
  
  .skeleton-text:last-child {
    width: 70%;
  }
  
  .skeleton-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
  
  .skeleton-card {
    height: 200px;
  }
  
  .skeleton-button {
    height: 40px;
    width: 120px;
    border-radius: 0.375rem;
  }
`;

export function SkeletonStyles() {
  return <style dangerouslySetInnerHTML={{ __html: skeletonCSS }} />;
}
```

### Build-Time Critical CSS

```javascript
// next.config.js
const CriticalCssPlugin = require('html-critical-webpack-plugin');

module.exports = {
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.plugins.push(
        new CriticalCssPlugin({
          base: '.next/',
          src: 'server/pages/index.html',
          target: 'server/pages/index.html',
          inline: true,
          minify: true,
          width: 1300,
          height: 900,
        })
      );
    }
    return config;
  },
};
```

## Variants

### With Critters (Automated)

```javascript
// next.config.js
const withCritters = require('critters-webpack-plugin');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new withCritters({
          preload: 'swap',
          preloadFonts: true,
          inlineFonts: false,
        })
      );
    }
    return config;
  },
};
```

### With CSS Modules Critical Extraction

```typescript
// Extract critical styles from CSS modules
import styles from './hero.module.css';

const criticalClasses = [
  styles.container,
  styles.title,
  styles.subtitle,
].join(' ');

// Generate critical CSS from used classes
```

## Anti-patterns

```typescript
// BAD: Loading all CSS upfront
<link rel="stylesheet" href="/all-styles.css" /> // Render blocking

// GOOD: Inline critical, defer rest
<style>{criticalCSS}</style>
<link rel="preload" href="/all-styles.css" as="style" />

// BAD: Critical CSS too large
const criticalCSS = fullAppStyles; // Defeats the purpose!

// GOOD: Only above-the-fold styles
const criticalCSS = headerStyles + heroStyles;

// BAD: Not matching production output
// Development CSS differs from production

// GOOD: Test with production build
npm run build && npm run start
```

## Related Patterns

- `lighthouse-optimization.md` - Performance scores
- `fonts.md` - Font optimization
- `preloading.md` - Resource preloading
- `bundle-optimization.md` - Bundle size

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial critical CSS pattern
