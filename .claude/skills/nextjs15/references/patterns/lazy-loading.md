---
id: pt-lazy-loading
name: Lazy Loading
version: 2.0.0
layer: L5
category: performance
description: Dynamic imports and React.lazy for code splitting in Next.js 15
tags: [performance, lazy, loading]
composes: []
dependencies: []
formula: "lazy_loading = dynamic_import + suspense_boundary + intersection_observer + loading_state"
performance:
  impact: medium
  lcp: positive
  cls: low
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Lazy Loading Pattern

## Overview

Dynamic imports and React.lazy for code splitting in Next.js 15 applications. Reduces initial bundle size by loading components and modules on demand.

## When to Use

- **Modal dialogs**: Load modal content only when opened
- **Below-the-fold sections**: Load content as user scrolls
- **Feature tabs**: Load tab content on selection
- **Heavy visualizations**: Charts, maps, 3D renderers
- **Third-party widgets**: Social embeds, video players
- **Image galleries**: Load images as they enter viewport

## Composition Diagram

```
+------------------+
|   Initial Page   |
|  (above fold)    |
+------------------+
          |
          v
+------------------+     +------------------+
| Intersection     | --> | Dynamic Import   |
| Observer         |     | Trigger          |
+------------------+     +------------------+
          |                       |
          v                       v
+------------------+     +------------------+
| Suspense Boundary| --> | Loading Fallback |
+------------------+     +------------------+
          |
          v
+------------------+
| Loaded Component |
| (cached)         |
+------------------+
```

## Implementation

### Dynamic Import with next/dynamic

```typescript
// components/lazy-components.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Basic dynamic import
export const HeavyChart = dynamic(
  () => import('@/components/charts/heavy-chart'),
  {
    loading: () => <Skeleton className="h-[400px] w-full" />,
  }
);

// Dynamic import with named export
export const DataTable = dynamic(
  () => import('@/components/data-table').then((mod) => mod.DataTable),
  {
    loading: () => <Skeleton className="h-[600px] w-full" />,
  }
);

// Disable SSR for client-only components
export const MapComponent = dynamic(
  () => import('@/components/map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center bg-gray-100">
        <span>Loading map...</span>
      </div>
    ),
  }
);

// With custom loading component
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
    <div className="h-[300px] bg-gray-200 rounded" />
  </div>
);

export const AnalyticsChart = dynamic(
  () => import('@/components/charts/analytics'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
```

### Conditional Lazy Loading

```typescript
// components/conditional-lazy.tsx
'use client';

import { useState, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load based on user action
export function ModalTrigger() {
  const [showModal, setShowModal] = useState(false);

  // Only load modal when needed
  const Modal = dynamic(() => import('./heavy-modal'), {
    loading: () => <div>Loading...</div>,
  });

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Open Modal
      </button>
      
      {showModal && (
        <Suspense fallback={<div>Loading modal...</div>}>
          <Modal onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </>
  );
}

// Lazy load based on viewport
export function LazySection() {
  const [isVisible, setIsVisible] = useState(false);

  const HeavyContent = dynamic(
    () => import('./heavy-content'),
    { loading: () => <Skeleton className="h-96" /> }
  );

  return (
    <div
      ref={(el) => {
        if (el) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
              }
            },
            { rootMargin: '100px' }
          );
          observer.observe(el);
        }
      }}
    >
      {isVisible ? <HeavyContent /> : <Skeleton className="h-96" />}
    </div>
  );
}
```

### Route-Based Code Splitting

```typescript
// app/dashboard/analytics/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { AnalyticsSkeleton } from '@/components/skeletons';

// Heavy analytics components loaded only on this route
const AnalyticsDashboard = dynamic(
  () => import('@/components/analytics/dashboard'),
  { loading: () => <AnalyticsSkeleton /> }
);

const ChartGrid = dynamic(
  () => import('@/components/analytics/chart-grid'),
  { ssr: false }
);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1>Analytics</h1>
      
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
      
      <Suspense fallback={<div>Loading charts...</div>}>
        <ChartGrid />
      </Suspense>
    </div>
  );
}
```

### Lazy Loading with Preload

```typescript
// lib/lazy-with-preload.tsx
'use client';

import { ComponentType, lazy, useState, useEffect } from 'react';

type LazyComponentWithPreload<P> = ComponentType<P> & {
  preload: () => Promise<{ default: ComponentType<P> }>;
};

export function lazyWithPreload<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): LazyComponentWithPreload<P> {
  const LazyComponent = lazy(importFn) as LazyComponentWithPreload<P>;
  LazyComponent.preload = importFn;
  return LazyComponent;
}

// Usage
const HeavyEditor = lazyWithPreload(
  () => import('@/components/editor/rich-text-editor')
);

export function EditorButton() {
  const [showEditor, setShowEditor] = useState(false);

  // Preload on hover
  const handleMouseEnter = () => {
    HeavyEditor.preload();
  };

  return (
    <>
      <button
        onMouseEnter={handleMouseEnter}
        onClick={() => setShowEditor(true)}
      >
        Open Editor
      </button>
      
      {showEditor && (
        <Suspense fallback={<div>Loading editor...</div>}>
          <HeavyEditor />
        </Suspense>
      )}
    </>
  );
}
```

### Image Lazy Loading

```typescript
// components/lazy-image.tsx
'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        className
      )}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
        />
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
    </div>
  );
}
```

### Lazy Loading Third-Party Libraries

```typescript
// lib/lazy-libs.ts
'use client';

// Lazy load heavy libraries
export async function loadChart() {
  const { Chart, registerables } = await import('chart.js');
  Chart.register(...registerables);
  return Chart;
}

export async function loadMarkdown() {
  const { marked } = await import('marked');
  const hljs = await import('highlight.js');
  
  marked.setOptions({
    highlight: (code, lang) => {
      if (hljs.default.getLanguage(lang)) {
        return hljs.default.highlight(code, { language: lang }).value;
      }
      return code;
    },
  });
  
  return marked;
}

export async function loadPdfLib() {
  const { PDFDocument } = await import('pdf-lib');
  return PDFDocument;
}

// Usage in component
export function ChartComponent({ data }: { data: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let chart: Chart | null = null;

    loadChart().then((Chart) => {
      if (canvasRef.current) {
        chart = new Chart(canvasRef.current, {
          type: 'line',
          data,
        });
      }
    });

    return () => {
      chart?.destroy();
    };
  }, [data]);

  return <canvas ref={canvasRef} />;
}
```

### Component-Level Code Splitting

```typescript
// components/feature-modules/index.tsx
import dynamic from 'next/dynamic';

// Export lazy-loaded feature modules
export const UserProfile = dynamic(
  () => import('./user-profile'),
  { loading: () => <ProfileSkeleton /> }
);

export const Settings = dynamic(
  () => import('./settings'),
  { loading: () => <SettingsSkeleton /> }
);

export const Notifications = dynamic(
  () => import('./notifications'),
  { loading: () => <NotificationsSkeleton /> }
);

export const Analytics = dynamic(
  () => import('./analytics'),
  { 
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

// Tab-based lazy loading
export function FeatureTabs({ activeTab }: { activeTab: string }) {
  return (
    <div>
      {activeTab === 'profile' && <UserProfile />}
      {activeTab === 'settings' && <Settings />}
      {activeTab === 'notifications' && <Notifications />}
      {activeTab === 'analytics' && <Analytics />}
    </div>
  );
}
```

### Lazy Loading with Error Boundary

```typescript
// components/lazy-with-error.tsx
'use client';

import { Suspense, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function LazyWithErrorBoundary({
  importFn,
  loading,
  error,
}: {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  loading: ReactNode;
  error: ReactNode;
}) {
  const LazyComponent = dynamic(importFn, {
    loading: () => <>{loading}</>,
  });

  return (
    <LazyErrorBoundary fallback={error}>
      <Suspense fallback={loading}>
        <LazyComponent />
      </Suspense>
    </LazyErrorBoundary>
  );
}

// Usage
<LazyWithErrorBoundary
  importFn={() => import('./complex-widget')}
  loading={<WidgetSkeleton />}
  error={<WidgetError />}
/>
```

### Parallel Route Lazy Loading

```typescript
// app/@modal/(.)products/[id]/page.tsx
import dynamic from 'next/dynamic';

const ProductModal = dynamic(
  () => import('@/components/modals/product-modal'),
  {
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="h-96 w-96 animate-pulse bg-white rounded-lg" />
      </div>
    ),
  }
);

export default async function InterceptedProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <ProductModal productId={id} />;
}
```

## Variants

### With Retry on Failure

```typescript
// lib/lazy-with-retry.tsx
import dynamic from 'next/dynamic';

function retry<T>(
  fn: () => Promise<T>,
  retriesLeft = 3,
  interval = 1000
): Promise<T> {
  return fn().catch((error) => {
    if (retriesLeft === 0) throw error;
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(retry(fn, retriesLeft - 1, interval)),
        interval
      )
    );
  });
}

export const ReliableHeavyComponent = dynamic(
  () => retry(() => import('./heavy-component')),
  { loading: () => <div>Loading...</div> }
);
```

### With Loading Progress

```typescript
// components/lazy-with-progress.tsx
'use client';

import { useState, useEffect } from 'react';

export function LazyWithProgress({
  loader,
  children,
}: {
  loader: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 100);

    loader().then(() => {
      setProgress(100);
      setIsLoaded(true);
      clearInterval(interval);
    });

    return () => clearInterval(interval);
  }, [loader]);

  if (!isLoaded) {
    return (
      <div className="w-full">
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-blue-500 rounded transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">Loading... {progress}%</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Anti-patterns

```typescript
// BAD: Lazy loading tiny components
const Button = dynamic(() => import('./button')); // Too small!

// GOOD: Lazy load substantial components
const RichTextEditor = dynamic(() => import('./rich-text-editor'));

// BAD: No loading state
const HeavyComponent = dynamic(() => import('./heavy'));
// User sees nothing while loading!

// GOOD: Always provide loading state
const HeavyComponent = dynamic(
  () => import('./heavy'),
  { loading: () => <Skeleton /> }
);

// BAD: Lazy loading above the fold content
const Hero = dynamic(() => import('./hero')); // Causes layout shift!

// GOOD: Load critical content eagerly
import { Hero } from './hero';

// BAD: Not preloading predictable navigation
<Link href="/dashboard">Dashboard</Link>

// GOOD: Preload on hover/focus
<Link href="/dashboard" onMouseEnter={() => preloadDashboard()}>
  Dashboard
</Link>
```

## Related Patterns

- `code-splitting.md` - Code splitting strategies
- `preloading.md` - Resource preloading
- `bundle-optimization.md` - Bundle optimization
- `streaming.md` - Streaming SSR

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial lazy loading pattern
