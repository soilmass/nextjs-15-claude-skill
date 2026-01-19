---
id: pt-streaming
name: Streaming SSR
version: 2.1.0
layer: L5
category: data
description: Progressive rendering with React Suspense and streaming for improved TTFB and LCP
tags: [data, streaming, suspense, ssr, performance, next15]
composes:
  - ../atoms/display-skeleton.md
  - ../molecules/stat-card.md
  - ../molecules/card.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
dependencies: []
formula: "Streaming = Suspense + loading.tsx + Skeleton(a-display-skeleton) + StatCard(m-stat-card)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Streaming SSR

## Overview

Streaming allows you to progressively render and send UI chunks to the client. Combined with Suspense, you can show loading states for slow components while streaming in content as it becomes available. This dramatically improves Time to First Byte (TTFB) and perceived performance.

## When to Use

- Dashboard pages with multiple data sources
- Pages with slow database queries
- Content that can be displayed independently
- Improving perceived performance on data-heavy pages
- SEO-critical content that should render first

## Composition Diagram

```
+------------------------------------------+
|              Streaming Page              |
|  +------------------------------------+  |
|  |  Static Header (immediate)        |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |  <Suspense>                       |  |
|  |    Stats Cards (streams at 100ms) |  |
|  |  </Suspense>                      |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |  <Suspense>        <Suspense>     |  |
|  |    Charts          Activity      |  |
|  |    (200ms)         (150ms)        |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Basic Streaming with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards } from './stats-cards';
import { RecentActivity } from './recent-activity';
import { Charts } from './charts';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Static header renders immediately */}
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats stream first */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Charts and activity stream independently */}
        <Suspense fallback={<ChartsSkeleton />}>
          <Charts />
        </Suspense>
        
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}

// Async Server Components
async function StatsCards() {
  const stats = await getStats(); // Slow query
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

async function Charts() {
  const data = await getChartData(); // Even slower
  return <DashboardChart data={data} />;
}
```

## Skeleton Components

```typescript
// components/skeletons.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function StatsCardsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="p-6 border rounded-lg">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="p-6 border rounded-lg">
      <Skeleton className="h-6 w-32 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Nested Suspense Boundaries

```typescript
// app/products/[id]/page.tsx
import { Suspense } from 'react';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main product info - highest priority */}
      <div className="lg:col-span-2">
        <Suspense fallback={<ProductSkeleton />}>
          <ProductDetails id={id} />
        </Suspense>

        {/* Reviews nested inside product */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviews productId={id} />
        </Suspense>
      </div>

      {/* Sidebar - can load independently */}
      <aside>
        <Suspense fallback={<RecommendationsSkeleton />}>
          <Recommendations productId={id} />
        </Suspense>
      </aside>
    </div>
  );
}
```

## Loading.tsx for Automatic Suspense

```typescript
// app/posts/loading.tsx
// Automatically wraps page.tsx in Suspense

export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

// Equivalent to:
<Suspense fallback={<Loading />}>
  <PostsPage />
</Suspense>
```

## Streaming Long Lists

```typescript
// app/feed/page.tsx
import { Suspense } from 'react';

async function FeedItems() {
  const items = await getFeed(); // Returns async iterator

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export default function FeedPage() {
  return (
    <div>
      <h1>Your Feed</h1>
      <Suspense fallback={<FeedSkeleton count={10} />}>
        <FeedItems />
      </Suspense>
    </div>
  );
}
```

## Parallel Streaming

```typescript
// Stream multiple independent sections in parallel
// app/analytics/page.tsx

async function PageViews() {
  await delay(1000); // Simulates slow API
  const data = await getPageViews();
  return <PageViewsChart data={data} />;
}

async function Conversions() {
  await delay(2000); // Even slower
  const data = await getConversions();
  return <ConversionsChart data={data} />;
}

async function Revenue() {
  await delay(1500);
  const data = await getRevenue();
  return <RevenueChart data={data} />;
}

export default function AnalyticsPage() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* All three stream independently */}
      <Suspense fallback={<ChartSkeleton />}>
        <PageViews />
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <Conversions />
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <Revenue />
      </Suspense>
    </div>
  );
}
```

## Streaming with Client Components

```typescript
// components/interactive-chart.tsx
'use client';

import { useState } from 'react';

interface ChartData {
  labels: string[];
  values: number[];
}

export function InteractiveChart({ data }: { data: ChartData }) {
  const [range, setRange] = useState('week');
  
  return (
    <div>
      <select value={range} onChange={(e) => setRange(e.target.value)}>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
      <Chart data={data} range={range} />
    </div>
  );
}

// Server Component wrapper for streaming
// app/dashboard/chart.tsx
async function DashboardChart() {
  const data = await getChartData();
  return <InteractiveChart data={data} />;
}

// Usage with Suspense
<Suspense fallback={<ChartSkeleton />}>
  <DashboardChart />
</Suspense>
```

## Sequential vs Parallel Loading

```typescript
// SEQUENTIAL - Waterfall (slower)
async function SequentialPage() {
  const user = await getUser();      // 100ms
  const posts = await getPosts();     // 200ms
  const comments = await getComments(); // 150ms
  // Total: 450ms
  
  return <PageContent user={user} posts={posts} comments={comments} />;
}

// PARALLEL - Promise.all (faster)
async function ParallelPage() {
  const [user, posts, comments] = await Promise.all([
    getUser(),      // 100ms
    getPosts(),     // 200ms  
    getComments(),  // 150ms
  ]);
  // Total: 200ms (slowest wins)
  
  return <PageContent user={user} posts={posts} comments={comments} />;
}

// STREAMING - Progressive (best UX)
function StreamingPage() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />  {/* Streams at 100ms */}
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsSection /> {/* Streams at 200ms */}
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection /> {/* Streams at 150ms */}
      </Suspense>
    </div>
  );
}
```

## Error Handling with Streaming

```typescript
// Each Suspense boundary can have its own error boundary
// app/dashboard/page.tsx

import { ErrorBoundary } from 'react-error-boundary';

function ChartErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 border border-destructive rounded">
      <p className="text-destructive">Failed to load chart</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <ErrorBoundary FallbackComponent={ChartErrorFallback}>
        <Suspense fallback={<ChartSkeleton />}>
          <Chart />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Or use error.tsx for route-level errors
// app/dashboard/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Streaming SEO Content First

```typescript
// Prioritize above-fold and SEO content
export default function ProductPage({ params }) {
  return (
    <>
      {/* Critical content first - affects LCP and SEO */}
      <Suspense fallback={<HeroSkeleton />}>
        <ProductHero id={params.id} />
      </Suspense>

      {/* Below fold can stream later */}
      <Suspense fallback={<DescriptionSkeleton />}>
        <ProductDescription id={params.id} />
      </Suspense>

      {/* Non-critical content last */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews id={params.id} />
      </Suspense>
    </>
  );
}
```

## Anti-patterns

### Don't Wrap Everything in One Suspense

```typescript
// BAD - All or nothing
<Suspense fallback={<Loading />}>
  <SlowComponent1 />  {/* Blocks */}
  <SlowComponent2 />  {/* Everything */}
  <SlowComponent3 />  {/* Together */}
</Suspense>

// GOOD - Granular streaming
<Suspense fallback={<Skeleton1 />}>
  <SlowComponent1 />
</Suspense>
<Suspense fallback={<Skeleton2 />}>
  <SlowComponent2 />
</Suspense>
<Suspense fallback={<Skeleton3 />}>
  <SlowComponent3 />
</Suspense>
```

### Don't Stream Critical Path Last

```typescript
// BAD - Critical content blocked by slow data
export default async function Page() {
  const slowData = await getSlowData();  // 3 seconds
  return <Content data={slowData} />;
}

// GOOD - Stream non-critical, prioritize critical
export default function Page() {
  return (
    <>
      <CriticalContent />  {/* Immediate */}
      <Suspense fallback={<Loading />}>
        <SlowContent />  {/* Streams in */}
      </Suspense>
    </>
  );
}
```

## Related Skills

- [server-components-data](./server-components-data.md)
- [data-cache](./data-cache.md)
- [ppr](./ppr.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Nested Suspense patterns
- Parallel streaming
- Error handling
