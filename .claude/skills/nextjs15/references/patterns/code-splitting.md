---
id: pt-code-splitting
name: Code Splitting
version: 2.0.0
layer: L5
category: performance
description: Dynamic imports and lazy loading strategies for optimal bundle sizes
tags: [performance, code-splitting, dynamic-import, lazy-loading, next15]
composes: []
dependencies: []
formula: "code_splitting = route_based_splitting + component_dynamic_imports + library_lazy_loading + prefetch_on_interaction"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Code Splitting

## Overview

Code splitting allows you to split your code into smaller bundles that can be loaded on demand. Next.js automatically code-splits by route, but you can further optimize by using dynamic imports for large components, libraries, and conditional features.

## When to Use

- **Heavy components**: Charts, editors, maps, modals with complex UI
- **Conditional features**: Feature flags, A/B testing variants
- **Admin panels**: Load admin-only code when needed
- **Third-party libraries**: Heavy SDKs (Stripe, PDF generators, syntax highlighters)
- **Below-the-fold content**: Components not visible on initial load

## Composition Diagram

```
+------------------+
|   Main Bundle    |
|   (critical)     |
+------------------+
          |
   +------+------+------+------+
   |      |      |      |      |
   v      v      v      v      v
+----+ +----+ +----+ +----+ +----+
|Route| |Route| |Comp | |Lib  | |Lazy |
|  A  | |  B  | |Chunk| |Chunk| |Chunk|
+----+ +----+ +----+ +----+ +----+
                  |
     +------------+------------+
     |            |            |
     v            v            v
+--------+  +----------+  +---------+
| Modal  |  | Chart.js |  | Editor  |
| Bundle |  | Bundle   |  | Bundle  |
+--------+  +----------+  +---------+
```

## Dynamic Import for Components

```typescript
// components/heavy-chart.tsx (large component)
"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy chart library
const Chart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false, // Charts often need browser APIs
  }
);

export function AnalyticsChart({ data }) {
  return (
    <Chart width={600} height={300} data={data}>
      {/* Chart configuration */}
    </Chart>
  );
}
```

## Named Exports

```typescript
// When importing named exports
const Modal = dynamic(
  () => import("@/components/modal").then((mod) => mod.Modal)
);

// Or with multiple exports
const { Dialog, DialogContent, DialogTrigger } = dynamic(
  () => import("@/components/ui/dialog"),
  { ssr: true }
);

// Better: Create a barrel file for named exports
// components/ui/dialog/index.ts
export { Dialog, DialogContent, DialogTrigger } from "./dialog";

// Then import
const Dialog = dynamic(() => import("@/components/ui/dialog"));
```

## Conditional Loading

```typescript
// components/feature-flags.tsx
"use client";

import dynamic from "next/dynamic";
import { useFeatureFlag } from "@/hooks/use-feature-flags";

// Only load if feature is enabled
const NewDashboard = dynamic(() => import("./new-dashboard"));
const LegacyDashboard = dynamic(() => import("./legacy-dashboard"));

export function Dashboard() {
  const { isEnabled } = useFeatureFlag("new-dashboard");

  return isEnabled ? <NewDashboard /> : <LegacyDashboard />;
}
```

## Route-Based Code Splitting

```typescript
// Next.js automatically code-splits by route
// Each page gets its own bundle

// app/
// ├── page.tsx           → main bundle
// ├── dashboard/
// │   └── page.tsx       → dashboard bundle (loaded on navigation)
// ├── settings/
// │   └── page.tsx       → settings bundle (loaded on navigation)
// └── admin/
//     └── page.tsx       → admin bundle (loaded on navigation)

// Heavy components in pages are also split
// app/dashboard/page.tsx
import dynamic from "next/dynamic";

const HeavyTable = dynamic(() => import("@/components/heavy-table"));
const ComplexChart = dynamic(() => import("@/components/complex-chart"));

export default function DashboardPage() {
  return (
    <div>
      <HeavyTable />
      <ComplexChart />
    </div>
  );
}
```

## Library Lazy Loading

```typescript
// Lazy load heavy libraries
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Lazy load date-fns
async function formatDate(date: Date, format: string) {
  const { format: formatFn } = await import("date-fns");
  return formatFn(date, format);
}

// Lazy load markdown parser
async function parseMarkdown(content: string) {
  const { marked } = await import("marked");
  return marked(content);
}

// Lazy load syntax highlighter
const CodeBlock = dynamic(
  async () => {
    const { Prism } = await import("react-syntax-highlighter");
    const { oneDark } = await import("react-syntax-highlighter/dist/esm/styles/prism");
    
    return function CodeBlock({ code, language }) {
      return <Prism style={oneDark} language={language}>{code}</Prism>;
    };
  },
  { 
    loading: () => <pre className="bg-muted p-4 rounded">{/* loading */}</pre>,
    ssr: false,
  }
);
```

## Modal/Dialog Lazy Loading

```typescript
// components/command-palette.tsx
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Lazy load command palette (heavy cmdk library)
const CommandPalette = dynamic(
  () => import("@/components/cmdk-palette"),
  { ssr: false }
);

export function CommandPaletteWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Preload on keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShouldLoad(true);
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Only render when first opened
  if (!shouldLoad) return null;

  return <CommandPalette open={isOpen} onOpenChange={setIsOpen} />;
}
```

## Prefetching Dynamic Imports

```typescript
// Prefetch on hover/focus for faster loading
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const HeavyModal = dynamic(() => import("./heavy-modal"));

// Prefetch function
const prefetchModal = () => {
  import("./heavy-modal");
};

export function ProductCard({ product }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onMouseEnter={prefetchModal} // Prefetch on hover
        onFocus={prefetchModal}       // Prefetch on focus
        onClick={() => setShowModal(true)}
      >
        Quick View
      </button>
      
      {showModal && (
        <HeavyModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
```

## Component Loading States

```typescript
// components/with-loading.tsx
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// Skeleton loading
const DataTable = dynamic(
  () => import("@/components/data-table"),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    ),
  }
);

// Spinner loading
const Editor = dynamic(
  () => import("@/components/rich-editor"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

// Custom loading component
const Map = dynamic(
  () => import("@/components/map"),
  {
    loading: () => (
      <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
    ssr: false,
  }
);
```

## Server Components + Client Split

```typescript
// app/dashboard/page.tsx (Server Component)
import { Suspense } from "react";
import { getStats } from "@/lib/analytics";

// Static content
function DashboardHeader() {
  return <h1>Dashboard</h1>;
}

// Server-fetched data
async function Stats() {
  const stats = await getStats();
  return <StatsDisplay stats={stats} />;
}

// Client-only interactive component
import dynamic from "next/dynamic";

const InteractiveChart = dynamic(
  () => import("@/components/interactive-chart"),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <div>
      <DashboardHeader />
      
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      
      {/* Only loads when visible in viewport */}
      <InteractiveChart />
    </div>
  );
}
```

## Intersection Observer Lazy Loading

```typescript
// hooks/use-lazy-load.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useLazyLoad() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Usage
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

const HeavyComponent = dynamic(() => import("./heavy-component"));

function LazySection() {
  const { ref, isVisible } = useLazyLoad();

  return (
    <div ref={ref}>
      {isVisible ? <HeavyComponent /> : <Skeleton className="h-96" />}
    </div>
  );
}
```

## Bundle Analyzer

```typescript
// next.config.ts
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config: NextConfig = {
  // ... other config
};

export default withBundleAnalyzer(config);

// Run analysis
// ANALYZE=true npm run build
```

## Anti-patterns

### Don't Lazy Load Critical Components

```typescript
// BAD - Hero/above-fold content lazy loaded
const Hero = dynamic(() => import("./hero")); // Delays LCP!

// GOOD - Only lazy load below-fold/on-demand
import { Hero } from "./hero"; // Regular import for critical content
const Modal = dynamic(() => import("./modal")); // Lazy for on-demand
```

### Don't Over-Split

```typescript
// BAD - Too granular splitting
const Button = dynamic(() => import("./button"));
const Input = dynamic(() => import("./input"));
const Label = dynamic(() => import("./label"));

// GOOD - Split by feature/route, not individual components
import { Button, Input, Label } from "@/components/ui";
const AdminPanel = dynamic(() => import("./admin-panel"));
```

## Related Skills

- [image-optimization](./image-optimization.md)
- [fonts](./fonts.md)
- [streaming](./streaming.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Dynamic import patterns
- Prefetching strategies
- Bundle analysis
