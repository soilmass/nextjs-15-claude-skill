---
id: pt-preloading
name: Preloading Pattern
version: 2.0.0
layer: L5
category: performance
description: Resource preloading strategies for Next.js 15 applications
tags: [performance, preload, prefetch, preconnect, resource-hints]
composes: []
dependencies: []
formula: "preload = early_fetch + cache_population + priority_hints + network_aware_loading"
performance:
  impact: medium
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Preloading Pattern

## Overview

Resource preloading strategies for Next.js 15 applications. Improves perceived performance by loading resources before they're needed using prefetch, preload, and preconnect.

## When to Use

- **Hero images and LCP elements**: Preload above-the-fold critical images
- **Navigation prefetching**: Preload likely next routes on hover/focus
- **Data prefetching**: Warm up cache before user navigates
- **Component preloading**: Load heavy components before they're needed
- **Third-party connections**: Preconnect to CDNs, APIs, and font services

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
|   User Action    | --> |   Preload Layer   | --> |  Resource Cache  |
|  (hover/focus)   |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
                               |
          +--------------------+--------------------+
          |                    |                    |
          v                    v                    v
+------------------+  +------------------+  +------------------+
|  Route Prefetch  |  | Component Preload|  |  Data Prefetch   |
|  (router.prefetch)|  | (dynamic import) |  | (React Query/SWR)|
+------------------+  +------------------+  +------------------+
          |                    |                    |
          +--------------------+--------------------+
                               |
                               v
                    +------------------+
                    | Instant Navigation|
                    +------------------+
```

## Implementation

### Link Prefetching

```typescript
// components/navigation/prefetch-link.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface PrefetchLinkProps {
  href: string;
  children: React.ReactNode;
  prefetchOnHover?: boolean;
  prefetchOnVisible?: boolean;
  className?: string;
}

export function PrefetchLink({
  href,
  children,
  prefetchOnHover = true,
  prefetchOnVisible = false,
  className,
}: PrefetchLinkProps) {
  const router = useRouter();
  const [prefetched, setPrefetched] = useState(false);

  const handlePrefetch = useCallback(() => {
    if (!prefetched) {
      router.prefetch(href);
      setPrefetched(true);
    }
  }, [href, prefetched, router]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={prefetchOnHover ? handlePrefetch : undefined}
      onFocus={prefetchOnHover ? handlePrefetch : undefined}
      prefetch={prefetchOnVisible}
    >
      {children}
    </Link>
  );
}

// Prefetch multiple routes on page load
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  useEffect(() => {
    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, [routes, router]);
}
```

### Component Preloading

```typescript
// lib/preload-components.tsx
'use client';

import { ComponentType, lazy } from 'react';

// Registry of preloadable components
const componentRegistry = new Map<string, () => Promise<{ default: ComponentType<any> }>>();

export function registerPreloadable(
  name: string,
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  componentRegistry.set(name, importFn);
  
  return lazy(importFn);
}

export function preloadComponent(name: string): void {
  const importFn = componentRegistry.get(name);
  if (importFn) {
    importFn();
  }
}

export function preloadComponents(names: string[]): void {
  names.forEach(preloadComponent);
}

// Usage
export const ProductModal = registerPreloadable(
  'ProductModal',
  () => import('@/components/modals/product-modal')
);

export const CheckoutForm = registerPreloadable(
  'CheckoutForm',
  () => import('@/components/checkout/form')
);

// Preload on interaction
function ProductCard({ product }: { product: Product }) {
  return (
    <div
      onMouseEnter={() => preloadComponent('ProductModal')}
    >
      {/* Product content */}
    </div>
  );
}
```

### Data Preloading

```typescript
// lib/preload-data.ts
import { cache } from 'react';

// Cached data fetcher
export const getProduct = cache(async (id: string) => {
  const response = await fetch(`/api/products/${id}`);
  return response.json();
});

export const getUser = cache(async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

// Preload function - starts fetch without awaiting
export function preloadProduct(id: string): void {
  void getProduct(id);
}

export function preloadUser(id: string): void {
  void getUser(id);
}

// Usage in server component
// app/products/[id]/page.tsx
import { preloadProduct, getProduct } from '@/lib/preload-data';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Start fetching immediately
  preloadProduct(id);
  
  // Also preload related data
  preloadRecommendations(id);
  preloadReviews(id);
  
  // Await when needed
  const product = await getProduct(id);
  
  return <ProductDetails product={product} />;
}
```

### Image Preloading

```typescript
// lib/preload-images.ts
'use client';

// Preload a single image
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload multiple images
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(preloadImage));
}

// Preload with priority queue
class ImagePreloader {
  private queue: Array<{ src: string; priority: number }> = [];
  private loading = 0;
  private maxConcurrent = 4;

  add(src: string, priority: number = 0): void {
    this.queue.push({ src, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  private processQueue(): void {
    while (this.loading < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        this.loading++;
        preloadImage(item.src).finally(() => {
          this.loading--;
          this.processQueue();
        });
      }
    }
  }
}

export const imagePreloader = new ImagePreloader();

// Usage
function ProductGallery({ images }: { images: string[] }) {
  useEffect(() => {
    // Preload first image with high priority
    imagePreloader.add(images[0], 10);
    
    // Preload rest with lower priority
    images.slice(1).forEach((src, index) => {
      imagePreloader.add(src, 5 - index);
    });
  }, [images]);
  
  // ...
}
```

### Font Preloading

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

// Fonts are automatically preloaded by Next.js
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <head>
        {/* Manual font preload for custom fonts */}
        <link
          rel="preload"
          href="/fonts/custom-font.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Script Preloading

```typescript
// components/script-preloader.tsx
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// Preload scripts that will be needed later
export function ScriptPreloader() {
  return (
    <>
      {/* Preload analytics (will be used after consent) */}
      <link
        rel="preload"
        href="https://www.googletagmanager.com/gtag/js"
        as="script"
      />
      
      {/* Preload payment SDK */}
      <link
        rel="preload"
        href="https://js.stripe.com/v3/"
        as="script"
      />
    </>
  );
}

// Load script on demand
export function useConditionalScript(
  src: string,
  shouldLoad: boolean
): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!shouldLoad) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [src, shouldLoad]);

  return loaded;
}

// Usage
function CheckoutPage() {
  const [showPayment, setShowPayment] = useState(false);
  const stripeLoaded = useConditionalScript(
    'https://js.stripe.com/v3/',
    showPayment
  );

  return (
    <div>
      <button onClick={() => setShowPayment(true)}>
        Proceed to Payment
      </button>
      
      {showPayment && stripeLoaded && (
        <PaymentForm />
      )}
    </div>
  );
}
```

### API Preloading with React Query

```typescript
// lib/preload-queries.ts
import { QueryClient } from '@tanstack/react-query';

export function preloadQuery<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  staleTime = 5 * 60 * 1000
): void {
  queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime,
  });
}

// hooks/use-preload.ts
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function usePreloadProduct() {
  const queryClient = useQueryClient();

  return useCallback(
    (productId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['product', productId],
        queryFn: () => fetch(`/api/products/${productId}`).then((r) => r.json()),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

// Usage
function ProductList({ products }: { products: Product[] }) {
  const preloadProduct = usePreloadProduct();

  return (
    <ul>
      {products.map((product) => (
        <li
          key={product.id}
          onMouseEnter={() => preloadProduct(product.id)}
        >
          <Link href={`/products/${product.id}`}>
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### Connection Preloading

```typescript
// components/connection-hints.tsx
export function ConnectionHints() {
  return (
    <>
      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://api.example.com" />
      <link rel="preconnect" href="https://cdn.example.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* DNS prefetch for less critical origins */}
      <link rel="dns-prefetch" href="https://analytics.example.com" />
      <link rel="dns-prefetch" href="https://ads.example.com" />
    </>
  );
}
```

### Route Preloading on Viewport

```typescript
// components/preload-on-visible.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PreloadOnVisibleProps {
  href: string;
  children: React.ReactNode;
  rootMargin?: string;
}

export function PreloadOnVisible({
  href,
  children,
  rootMargin = '100px',
}: PreloadOnVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const preloaded = useRef(false);

  useEffect(() => {
    if (!ref.current || preloaded.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !preloaded.current) {
          router.prefetch(href);
          preloaded.current = true;
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [href, router, rootMargin]);

  return <div ref={ref}>{children}</div>;
}

// Usage
function Footer() {
  return (
    <PreloadOnVisible href="/about">
      <Link href="/about">About Us</Link>
    </PreloadOnVisible>
  );
}
```

### Batch Preloading

```typescript
// lib/batch-preload.ts
'use client';

type PreloadTask = {
  type: 'route' | 'image' | 'data' | 'component';
  target: string;
  priority: number;
};

class PreloadScheduler {
  private queue: PreloadTask[] = [];
  private isProcessing = false;
  private router: ReturnType<typeof useRouter> | null = null;

  setRouter(router: ReturnType<typeof useRouter>) {
    this.router = router;
  }

  add(task: PreloadTask): void {
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.scheduleProcess();
  }

  private scheduleProcess(): void {
    if (this.isProcessing) return;
    
    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.process());
    } else {
      setTimeout(() => this.process(), 0);
    }
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      
      try {
        switch (task.type) {
          case 'route':
            this.router?.prefetch(task.target);
            break;
          case 'image':
            await preloadImage(task.target);
            break;
          case 'component':
            preloadComponent(task.target);
            break;
          case 'data':
            await fetch(task.target);
            break;
        }
      } catch (error) {
        console.warn(`Failed to preload ${task.type}: ${task.target}`);
      }
      
      // Small delay between preloads
      await new Promise((r) => setTimeout(r, 10));
    }
    
    this.isProcessing = false;
  }
}

export const preloadScheduler = new PreloadScheduler();
```

## Variants

### With Network-Aware Preloading

```typescript
// lib/network-aware-preload.ts
'use client';

export function shouldPreload(): boolean {
  if (typeof navigator === 'undefined') return true;

  const connection = (navigator as any).connection;
  if (!connection) return true;

  // Don't preload on slow connections
  if (connection.saveData) return false;
  if (connection.effectiveType === 'slow-2g') return false;
  if (connection.effectiveType === '2g') return false;

  return true;
}

export function preloadIfFast(fn: () => void): void {
  if (shouldPreload()) {
    fn();
  }
}
```

## Anti-patterns

```typescript
// BAD: Preloading everything
routes.forEach(route => router.prefetch(route)); // Too aggressive!

// GOOD: Preload likely navigation paths
const likelyRoutes = getTopNavigationPaths();
likelyRoutes.forEach(route => router.prefetch(route));

// BAD: Preloading on page load
useEffect(() => {
  preloadAllImages();
}, []); // Competes with critical resources!

// GOOD: Preload after critical content
useEffect(() => {
  // Wait for initial render
  requestIdleCallback(() => {
    preloadSecondaryImages();
  });
}, []);

// BAD: Not considering data costs
preloadVideo(url); // Expensive on mobile data!

// GOOD: Check connection
if (shouldPreload()) {
  preloadVideo(url);
}
```

## Related Patterns

- `lazy-loading.md` - Dynamic imports
- `resource-hints.md` - Browser resource hints
- `prefetching.md` - Data prefetching
- `code-splitting.md` - Code splitting

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial preloading pattern
