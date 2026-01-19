---
id: pt-lighthouse-optimization
name: Lighthouse Optimization
version: 2.0.0
layer: L5
category: performance
description: Strategies for achieving high Lighthouse scores in Next.js 15
tags: [performance, lighthouse, optimization]
composes: []
dependencies: []
formula: "lighthouse_score = LCP_optimization + CLS_prevention + TBT_reduction + accessibility + SEO + best_practices"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Lighthouse Optimization Pattern

## Overview

Strategies for achieving high Lighthouse scores in Next.js 15 applications. Covers Performance, Accessibility, Best Practices, and SEO optimization.

## When to Use

- **Production deployment**: Pre-launch performance audits
- **CI/CD pipelines**: Automated performance regression testing
- **SEO optimization**: Improving search engine rankings
- **User experience**: Reducing bounce rates, improving engagement
- **Core Web Vitals**: Meeting Google's ranking signals
- **Accessibility compliance**: WCAG conformance

## Composition Diagram

```
+------------------+
| Lighthouse Audit |
+------------------+
          |
    +-----+-----+-----+-----+
    |     |     |     |     |
    v     v     v     v     v
+------+ +-----+ +-----+ +-----+ +------+
|Perfor| |Acces| |Best | |SEO  | |PWA   |
|mance | |sibil| |Pract| |     | |      |
+------+ +-----+ +-----+ +-----+ +------+
    |
    +------------------+
    |        |         |
    v        v         v
+------+ +------+ +--------+
|  LCP | | CLS  | | TBT/   |
|      | |      | | INP    |
+------+ +------+ +--------+
    |        |         |
    v        v         v
+------+ +------+ +--------+
|Images| |Fonts | |Scripts |
|Preload| |Swap  | |Defer   |
+------+ +------+ +--------+
```

## Implementation

### Performance Optimizations

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Compression
  compress: true,
  poweredByHeader: false,

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Critical CSS & Above-the-Fold Content

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents FOIT
  preload: true,
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Critical CSS inline */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical above-the-fold styles */
              body { margin: 0; font-family: var(--font-inter), system-ui, sans-serif; }
              .hero { min-height: 100vh; display: flex; align-items: center; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### LCP Optimization

```typescript
// components/hero.tsx
import Image from 'next/image';

export function Hero() {
  return (
    <section className="hero">
      {/* LCP image with priority */}
      <Image
        src="/hero-image.webp"
        alt="Hero"
        width={1920}
        height={1080}
        priority // Preloads image
        fetchPriority="high"
        sizes="100vw"
        className="w-full h-auto"
      />
      
      {/* LCP text content */}
      <h1 className="text-5xl font-bold">
        Welcome to Our Platform
      </h1>
    </section>
  );
}
```

### CLS Prevention

```typescript
// components/optimized-image.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio: number; // width/height
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  aspectRatio,
  className,
}: OptimizedImageProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        paddingBottom: `${(1 / aspectRatio) * 100}%`,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}

// Skeleton with matching dimensions
export function ImageSkeleton({ aspectRatio }: { aspectRatio: number }) {
  return (
    <div
      className="bg-gray-200 animate-pulse"
      style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
    />
  );
}
```

### Font Optimization

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';
import localFont from 'next/font/local';

// Google Fonts with optimization
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// Local font
const customFont = localFont({
  src: [
    {
      path: '../public/fonts/custom-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/custom-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-custom',
  preload: true,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${customFont.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### Third-Party Script Optimization

```typescript
// components/optimized-scripts.tsx
import Script from 'next/script';

export function OptimizedScripts() {
  return (
    <>
      {/* Analytics - load after page is interactive */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
        strategy="afterInteractive"
      />
      
      {/* Non-critical scripts - load when browser is idle */}
      <Script
        src="https://third-party.com/widget.js"
        strategy="lazyOnload"
      />
      
      {/* Critical third-party with inline */}
      <Script id="critical-inline" strategy="beforeInteractive">
        {`
          // Critical inline JavaScript
          window.dataLayer = window.dataLayer || [];
        `}
      </Script>
    </>
  );
}
```

### Accessibility Improvements

```typescript
// components/accessible-navigation.tsx
export function AccessibleNavigation() {
  return (
    <>
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:p-4 focus:text-black"
      >
        Skip to main content
      </a>

      <nav aria-label="Main navigation">
        <ul role="menubar">
          <li role="none">
            <a href="/" role="menuitem">Home</a>
          </li>
          <li role="none">
            <a href="/products" role="menuitem">Products</a>
          </li>
          <li role="none">
            <a href="/about" role="menuitem">About</a>
          </li>
        </ul>
      </nav>

      <main id="main-content" tabIndex={-1}>
        {/* Main content */}
      </main>
    </>
  );
}
```

### SEO Optimization

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App - Best Product Ever',
  },
  description: 'The best product for your needs. High quality, great price.',
  keywords: ['product', 'quality', 'best'],
  authors: [{ name: 'Company Name' }],
  creator: 'Company Name',
  publisher: 'Company Name',
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'es-ES': '/es-ES',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://example.com',
    siteName: 'My App',
    title: 'My App - Best Product Ever',
    description: 'The best product for your needs.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'My App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My App',
    description: 'The best product for your needs.',
    images: ['/twitter-image.jpg'],
    creator: '@company',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code',
    yandex: 'yandex-verification-code',
  },
};
```

### TBT/INP Optimization

```typescript
// lib/defer-non-critical.ts
'use client';

// Defer non-critical work
export function deferWork(fn: () => void): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn);
  } else {
    setTimeout(fn, 0);
  }
}

// Break up long tasks
export async function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

// Usage in component
export function HeavyList({ items }: { items: Item[] }) {
  const [renderedItems, setRenderedItems] = useState<Item[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    async function renderInChunks() {
      const chunkSize = 10;
      
      for (let i = 0; i < items.length; i += chunkSize) {
        if (!isMounted) return;
        
        const chunk = items.slice(0, i + chunkSize);
        setRenderedItems(chunk);
        
        // Yield to allow browser to handle interactions
        await yieldToMain();
      }
    }
    
    renderInChunks();
    
    return () => {
      isMounted = false;
    };
  }, [items]);

  return (
    <ul>
      {renderedItems.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### Lighthouse CI Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/products',
        'http://localhost:3000/about',
      ],
      startServerCommand: 'npm run start',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        
        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'errors-in-console': 'warn',
        'image-aspect-ratio': 'error',
        
        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],
        'meta-description': 'error',
        'link-text': 'error',
        'crawlable-anchors': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Pre-render Critical Pages

```typescript
// app/products/page.tsx
import { Suspense } from 'react';

// Force static generation for critical pages
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Generate static params for top products
export async function generateStaticParams() {
  const topProducts = await getTopProducts(100);
  return topProducts.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div>
      <h1>Products</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  );
}
```

## Variants

### With Performance Budget

```json
// budget.json
[
  {
    "resourceSizes": [
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "image", "budget": 200 },
      { "resourceType": "stylesheet", "budget": 50 },
      { "resourceType": "document", "budget": 50 },
      { "resourceType": "total", "budget": 600 }
    ],
    "resourceCounts": [
      { "resourceType": "script", "budget": 10 },
      { "resourceType": "total", "budget": 50 }
    ]
  }
]
```

### With Web Vitals Reporting

```typescript
// lib/web-vitals.ts
'use client';

import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } from 'web-vitals';

export function reportWebVitals() {
  onCLS(console.log);
  onFID(console.log);
  onLCP(console.log);
  onFCP(console.log);
  onTTFB(console.log);
  onINP(console.log);
}
```

## Anti-patterns

```typescript
// BAD: Blocking render with sync scripts
<script src="/heavy-script.js" />

// GOOD: Defer non-critical scripts
<Script src="/heavy-script.js" strategy="lazyOnload" />

// BAD: Layout shift from unsized images
<img src="/image.jpg" /> 

// GOOD: Always size images
<Image src="/image.jpg" width={800} height={600} alt="..." />

// BAD: Render-blocking CSS
<link rel="stylesheet" href="/non-critical.css" />

// GOOD: Defer non-critical CSS
<link rel="preload" href="/non-critical.css" as="style" onLoad="this.rel='stylesheet'" />

// BAD: Long main thread tasks
items.forEach(item => heavyProcessing(item));

// GOOD: Break up long tasks
for (const item of items) {
  heavyProcessing(item);
  await yieldToMain();
}
```

## Related Patterns

- `web-vitals.md` - Core Web Vitals
- `image-optimization.md` - Image optimization
- `performance-testing.md` - Performance testing
- `bundle-optimization.md` - Bundle size

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial Lighthouse optimization pattern
