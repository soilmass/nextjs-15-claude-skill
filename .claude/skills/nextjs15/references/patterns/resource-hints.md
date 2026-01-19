---
id: pt-resource-hints
name: Resource Hints
version: 2.0.0
layer: L5
category: performance
description: Browser resource hints for optimizing resource loading in Next.js 15
tags: [performance, resource, hints]
composes: []
dependencies: []
formula: "resource_hints = preconnect(critical_origins) + dns_prefetch(secondary_origins) + preload(critical_assets) + prefetch(likely_navigations)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Resource Hints Pattern

## Overview

Browser resource hints (preconnect, prefetch, preload, dns-prefetch) for optimizing resource loading in Next.js 15 applications. Improves perceived performance by hinting browsers about upcoming resource needs.

## When to Use

- **Third-party connections**: Use preconnect for critical CDNs, APIs, font services
- **DNS resolution**: Use dns-prefetch for secondary origins (analytics, ads)
- **Critical resources**: Use preload for above-the-fold fonts, images, scripts
- **Navigation prediction**: Use prefetch for likely next pages
- **Early Hints (103)**: Use Link headers for edge-based hint delivery

## Composition Diagram

```
+------------------+
|   HTML Document  |
+------------------+
          |
          v
+------------------+     +------------------+
|   <head> Hints   | --> |  Browser Loader  |
+------------------+     +------------------+
          |                        |
    +-----+-----+           +------+------+
    |     |     |           |      |      |
    v     v     v           v      v      v
+------+ +------+ +------+ +----+ +----+ +----+
|precon| |dns-  | |preload| |TCP | |DNS | |HTTP|
|nect  | |prefet| |       | |conn| |look| |req |
+------+ +------+ +------+ +----+ +----+ +----+
    |         |         |
    +---------+---------+
              |
              v
    +------------------+
    | Faster Resource  |
    |    Delivery      |
    +------------------+
```

## Implementation

### Preconnect for Critical Origins

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  // ... other metadata
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.example.com" />
        <link rel="preconnect" href="https://cdn.example.com" />
        
        {/* Preconnect with credentials for authenticated APIs */}
        <link 
          rel="preconnect" 
          href="https://auth.example.com" 
          crossOrigin="use-credentials" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### DNS Prefetch for Secondary Origins

```typescript
// components/resource-hints.tsx
export function ResourceHints() {
  return (
    <>
      {/* DNS prefetch for origins that will be used later */}
      <link rel="dns-prefetch" href="https://analytics.google.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://cdn.segment.com" />
      <link rel="dns-prefetch" href="https://js.stripe.com" />
      <link rel="dns-prefetch" href="https://maps.googleapis.com" />
      
      {/* Third-party widgets */}
      <link rel="dns-prefetch" href="https://platform.twitter.com" />
      <link rel="dns-prefetch" href="https://connect.facebook.net" />
    </>
  );
}
```

### Preload Critical Resources

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
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Preload hero image */}
        <link
          rel="preload"
          href="/images/hero.webp"
          as="image"
          type="image/webp"
          imageSrcSet="/images/hero-640.webp 640w, /images/hero-1280.webp 1280w"
          imageSizes="100vw"
        />
        
        {/* Preload critical CSS */}
        <link
          rel="preload"
          href="/_next/static/css/app.css"
          as="style"
        />
        
        {/* Preload critical JS module */}
        <link
          rel="modulepreload"
          href="/_next/static/chunks/main.js"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Prefetch for Navigation

```typescript
// components/navigation-hints.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Prefetch likely next pages based on current route
const prefetchMap: Record<string, string[]> = {
  '/': ['/products', '/about', '/contact'],
  '/products': ['/products/featured', '/cart'],
  '/cart': ['/checkout'],
  '/checkout': ['/checkout/success'],
};

export function NavigationHints() {
  const pathname = usePathname();

  useEffect(() => {
    const pagesToPrefetch = prefetchMap[pathname] || [];

    pagesToPrefetch.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'document';
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup on route change
      document.querySelectorAll('link[rel="prefetch"]').forEach((el) => {
        el.remove();
      });
    };
  }, [pathname]);

  return null;
}
```

### Dynamic Resource Hints

```typescript
// lib/resource-hints.ts
'use client';

type HintType = 'preconnect' | 'dns-prefetch' | 'preload' | 'prefetch';

export function addResourceHint(
  type: HintType,
  href: string,
  options?: {
    as?: string;
    type?: string;
    crossOrigin?: string;
  }
): void {
  // Check if hint already exists
  const existing = document.querySelector(
    `link[rel="${type}"][href="${href}"]`
  );
  if (existing) return;

  const link = document.createElement('link');
  link.rel = type;
  link.href = href;

  if (options?.as) link.as = options.as;
  if (options?.type) link.type = options.type;
  if (options?.crossOrigin) link.crossOrigin = options.crossOrigin;

  document.head.appendChild(link);
}

export function removeResourceHint(type: HintType, href: string): void {
  const link = document.querySelector(`link[rel="${type}"][href="${href}"]`);
  link?.remove();
}

// Usage
function ProductImage({ src }: { src: string }) {
  useEffect(() => {
    // Preconnect to image CDN
    addResourceHint('preconnect', 'https://images.example.com');
  }, []);

  return <img src={src} alt="Product" />;
}
```

### Preload API Data

```typescript
// lib/preload-data.ts
'use client';

export function preloadApiData(endpoint: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = endpoint;
  link.as = 'fetch';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

// Hook for data preloading
export function usePreloadData(endpoints: string[]) {
  useEffect(() => {
    endpoints.forEach(preloadApiData);
    
    return () => {
      endpoints.forEach((endpoint) => {
        const link = document.querySelector(
          `link[rel="preload"][href="${endpoint}"]`
        );
        link?.remove();
      });
    };
  }, [endpoints]);
}

// Usage in component
function ProductPage({ productId }: { productId: string }) {
  // Preload related data
  usePreloadData([
    `/api/products/${productId}/reviews`,
    `/api/products/${productId}/related`,
  ]);

  return <ProductDetails id={productId} />;
}
```

### Responsive Image Preload

```typescript
// components/responsive-preload.tsx
interface ResponsivePreloadProps {
  srcSet: {
    src: string;
    media?: string;
    type?: string;
  }[];
}

export function ResponsiveImagePreload({ srcSet }: ResponsivePreloadProps) {
  return (
    <>
      {srcSet.map((item, index) => (
        <link
          key={index}
          rel="preload"
          as="image"
          href={item.src}
          media={item.media}
          type={item.type}
        />
      ))}
    </>
  );
}

// Usage
<ResponsiveImagePreload
  srcSet={[
    { 
      src: '/hero-mobile.webp', 
      media: '(max-width: 767px)',
      type: 'image/webp'
    },
    { 
      src: '/hero-desktop.webp', 
      media: '(min-width: 768px)',
      type: 'image/webp'
    },
  ]}
/>
```

### Priority Hints

```typescript
// components/priority-image.tsx
import Image from 'next/image';

interface PriorityImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function PriorityImage({
  src,
  alt,
  width,
  height,
  fetchPriority = 'auto',
}: PriorityImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={fetchPriority === 'high'}
      fetchPriority={fetchPriority}
      loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
    />
  );
}

// Usage
<PriorityImage
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  fetchPriority="high"
/>
```

### Speculative Loading

```typescript
// lib/speculative-loading.ts
'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useSpeculativeLoading() {
  const router = useRouter();

  const handleHover = useCallback(
    (href: string) => {
      // Prefetch route on hover
      router.prefetch(href);

      // Add resource hints for the page's assets
      addResourceHint('preconnect', 'https://api.example.com');
    },
    [router]
  );

  const handleTouchStart = useCallback(
    (href: string) => {
      // Mobile: prefetch on touch start for faster navigation
      router.prefetch(href);
    },
    [router]
  );

  return { handleHover, handleTouchStart };
}

// Usage
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { handleHover, handleTouchStart } = useSpeculativeLoading();

  return (
    <a
      href={href}
      onMouseEnter={() => handleHover(href)}
      onTouchStart={() => handleTouchStart(href)}
    >
      {children}
    </a>
  );
}
```

### Early Hints (103)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add Link headers for Early Hints
  const linkHeaders = [
    '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
    '<https://api.example.com>; rel=preconnect',
    '</styles/critical.css>; rel=preload; as=style',
  ];

  response.headers.set('Link', linkHeaders.join(', '));

  return response;
}

export const config = {
  matcher: '/:path*',
};
```

### Script Preload

```typescript
// components/script-hints.tsx
import Script from 'next/script';

export function ScriptHints() {
  return (
    <>
      {/* Preload script that will be used after interaction */}
      <link
        rel="preload"
        href="https://js.stripe.com/v3/"
        as="script"
      />
      
      {/* Prefetch analytics (lower priority) */}
      <link
        rel="prefetch"
        href="https://www.googletagmanager.com/gtag/js?id=GA_ID"
        as="script"
      />
      
      {/* Load script when needed */}
      <Script
        src="https://js.stripe.com/v3/"
        strategy="lazyOnload"
      />
    </>
  );
}
```

### Resource Hints Manager

```typescript
// lib/hints-manager.ts
'use client';

type ResourceHint = {
  type: 'preconnect' | 'dns-prefetch' | 'preload' | 'prefetch';
  href: string;
  options?: Record<string, string>;
};

class ResourceHintsManager {
  private hints: Map<string, HTMLLinkElement> = new Map();

  add(hint: ResourceHint): void {
    const key = `${hint.type}:${hint.href}`;
    if (this.hints.has(key)) return;

    const link = document.createElement('link');
    link.rel = hint.type;
    link.href = hint.href;

    if (hint.options) {
      Object.entries(hint.options).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
    }

    document.head.appendChild(link);
    this.hints.set(key, link);
  }

  remove(type: string, href: string): void {
    const key = `${type}:${href}`;
    const link = this.hints.get(key);
    if (link) {
      link.remove();
      this.hints.delete(key);
    }
  }

  clear(): void {
    this.hints.forEach((link) => link.remove());
    this.hints.clear();
  }
}

export const hintsManager = new ResourceHintsManager();
```

## Variants

### With Connection-Aware Hints

```typescript
// lib/smart-hints.ts
'use client';

export function getSmartHints(): ResourceHint[] {
  if (typeof navigator === 'undefined') return [];

  const connection = (navigator as any).connection;
  const hints: ResourceHint[] = [];

  // Always add critical preconnects
  hints.push({ type: 'preconnect', href: 'https://api.example.com' });

  // Only add prefetch on fast connections
  if (connection?.effectiveType === '4g' && !connection?.saveData) {
    hints.push({ type: 'prefetch', href: '/heavy-page' });
  }

  return hints;
}
```

## Anti-patterns

```typescript
// BAD: Too many preconnects
// Each preconnect has overhead
{[1,2,3,4,5,6,7,8].map(i => 
  <link rel="preconnect" href={`https://origin${i}.com`} />
)}

// GOOD: Only critical origins (max 2-4)
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://api.example.com" />

// BAD: Preloading non-critical resources
<link rel="preload" href="/about-page-image.jpg" as="image" />

// GOOD: Only preload above-the-fold resources
<link rel="preload" href="/hero-image.jpg" as="image" />

// BAD: Preload without using the resource
<link rel="preload" href="/font.woff2" as="font" />
// But font is never used!

// GOOD: Only preload what you'll actually use
// Verify with: chrome://net-internals/#preload
```

## Related Patterns

- `preloading.md` - Resource preloading
- `lazy-loading.md` - Lazy loading
- `fonts.md` - Font optimization
- `lighthouse-optimization.md` - Performance scores

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial resource hints pattern
