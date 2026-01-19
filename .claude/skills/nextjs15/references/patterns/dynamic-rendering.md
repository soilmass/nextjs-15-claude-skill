---
id: pt-dynamic-rendering
name: Dynamic Rendering
version: 2.0.0
layer: L5
category: performance
description: Render pages at request time for personalized and real-time content
tags: [render, dynamic, ssr, personalization, next15]
composes: []
dependencies: []
formula: "dynamic_rendering = cookies + headers + searchParams + noStore + real_time_data"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Dynamic Rendering

## Overview

Dynamic rendering generates pages at request time, enabling personalized content, real-time data, and access to request-specific information like cookies and headers. Next.js automatically switches to dynamic rendering when using dynamic functions or uncached data fetching.

## When to Use

- **User dashboards**: Personalized content based on session
- **Search results**: Dynamic queries with filters and pagination
- **Real-time data**: Stock prices, live scores, inventory status
- **Geolocation content**: Location-based recommendations
- **A/B testing**: Variant rendering based on cookies
- **Authentication state**: Protected routes with session checks

## Composition Diagram

```
+------------------+
|   HTTP Request   |
+------------------+
          |
          v
+------------------+     +------------------+
| Dynamic Function | --> | Request Context  |
| (cookies/headers)|     |                  |
+------------------+     +------------------+
          |                       |
    +-----+-----+                 |
    |     |     |                 |
    v     v     v                 v
+------+ +-----+ +------+ +-------------+
|cookies| |head | |search| | Personalized|
|()     | |ers()| |Params| | Content     |
+------+ +-----+ +------+ +-------------+
          |
          v
+------------------+
| Streaming SSR    |
| (with Suspense)  |
+------------------+
```

## Forcing Dynamic Rendering

```typescript
// app/dashboard/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // User-specific data - always fresh
  const [stats, notifications, activity] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId: session.user.id } }),
    prisma.notification.findMany({
      where: { userId: session.user.id, read: false },
      take: 5,
    }),
    prisma.activity.findMany({
      where: { userId: session.user.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />
      <NotificationsList notifications={notifications} />
      <ActivityFeed activity={activity} />
    </div>
  );
}
```

## Dynamic Functions

```typescript
// app/api/personalized/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

// Using cookies() or headers() makes this dynamic
export async function GET(request: NextRequest) {
  // Access cookies (makes page dynamic)
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || 'light';
  const locale = cookieStore.get('locale')?.value || 'en';

  // Access headers (makes page dynamic)
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  const acceptLanguage = headersList.get('accept-language');

  // Access search params from request
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');

  return NextResponse.json({
    theme,
    locale,
    userAgent,
    acceptLanguage,
    category,
  });
}

// app/settings/page.tsx
import { cookies } from 'next/headers';

// Automatically dynamic due to cookies()
export default async function SettingsPage() {
  const cookieStore = await cookies();
  const preferences = JSON.parse(
    cookieStore.get('preferences')?.value || '{}'
  );

  return <SettingsForm defaultValues={preferences} />;
}
```

## Uncached Data Fetching

```typescript
// app/stocks/page.tsx
// Uncached fetch makes this dynamic
async function getStockPrices() {
  // No cache means always fetch fresh data
  const response = await fetch('https://api.stocks.com/prices', {
    cache: 'no-store',
  });
  return response.json();
}

export default async function StocksPage() {
  const stocks = await getStockPrices();

  return (
    <div>
      <h1>Live Stock Prices</h1>
      <p className="text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
      <StockTable stocks={stocks} />
    </div>
  );
}

// Alternative: Use noStore()
import { unstable_noStore as noStore } from 'next/cache';

export default async function LiveDataPage() {
  noStore(); // Opt out of caching

  const data = await fetchLiveData();

  return <LiveDataDisplay data={data} />;
}
```

## Search Params

```typescript
// app/search/page.tsx
import { prisma } from '@/lib/db';
import { SearchResults } from '@/components/search-results';
import { SearchFilters } from '@/components/search-filters';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

// searchParams makes this page dynamic
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1');
  const limit = 20;

  const where = {
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
      ],
    }),
    ...(params.category && { categoryId: params.category }),
    ...(params.minPrice || params.maxPrice
      ? {
          price: {
            ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
            ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
          },
        }
      : {}),
  };

  const [results, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: getOrderBy(params.sort),
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <div className="flex gap-8">
      <aside className="w-64">
        <SearchFilters currentParams={params} />
      </aside>
      <main className="flex-1">
        <SearchResults
          results={results}
          query={query}
          total={total}
          page={page}
          limit={limit}
        />
      </main>
    </div>
  );
}

function getOrderBy(sort?: string) {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' as const };
    case 'price-desc':
      return { price: 'desc' as const };
    case 'newest':
      return { createdAt: 'desc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
}
```

## Personalized Content

```typescript
// app/feed/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Personalized feed based on user's interests and following
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        // Posts from followed users
        {
          author: {
            followers: {
              some: { followerId: session.user.id },
            },
          },
        },
        // Posts in user's interested topics
        {
          tags: {
            some: {
              id: {
                in: await getUserInterests(session.user.id),
              },
            },
          },
        },
      ],
      published: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: true,
      _count: { select: { likes: true, comments: true } },
    },
  });

  return <PersonalizedFeed posts={posts} />;
}

async function getUserInterests(userId: string) {
  const interests = await prisma.userInterest.findMany({
    where: { userId },
    select: { tagId: true },
  });
  return interests.map((i) => i.tagId);
}
```

## Geolocation-Based Content

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get geolocation from Vercel headers
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown';
  const region = request.headers.get('x-vercel-ip-country-region') || 'Unknown';

  // Add to request headers for use in page
  const response = NextResponse.next();
  response.headers.set('x-geo-country', country);
  response.headers.set('x-geo-city', city);
  response.headers.set('x-geo-region', region);

  return response;
}

// app/page.tsx
import { headers } from 'next/headers';

export default async function HomePage() {
  const headersList = await headers();
  const country = headersList.get('x-geo-country') || 'US';
  const city = headersList.get('x-geo-city') || 'Unknown';

  // Fetch location-specific content
  const localContent = await getLocalContent(country);
  const nearbyStores = await getNearbyStores(city);

  return (
    <>
      <Hero country={country} />
      <LocalDeals content={localContent} />
      <NearbyStores stores={nearbyStores} />
    </>
  );
}
```

## A/B Testing

```typescript
// lib/ab-testing.ts
import { cookies } from 'next/headers';

export async function getExperimentVariant(
  experimentId: string,
  variants: string[]
): Promise<string> {
  const cookieStore = await cookies();
  const existingVariant = cookieStore.get(`exp_${experimentId}`)?.value;

  if (existingVariant && variants.includes(existingVariant)) {
    return existingVariant;
  }

  // Assign random variant
  const variant = variants[Math.floor(Math.random() * variants.length)];

  // Note: Set cookie in response, not here (use middleware or API)
  return variant;
}

// app/page.tsx
import { getExperimentVariant } from '@/lib/ab-testing';

export default async function HomePage() {
  const heroVariant = await getExperimentVariant('hero-redesign', [
    'control',
    'variant-a',
    'variant-b',
  ]);

  return (
    <>
      {heroVariant === 'control' && <HeroOriginal />}
      {heroVariant === 'variant-a' && <HeroVariantA />}
      {heroVariant === 'variant-b' && <HeroVariantB />}
    </>
  );
}
```

## Streaming Dynamic Content

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="space-y-8">
      {/* Static header renders immediately */}
      <DashboardHeader user={session.user} />

      {/* Dynamic sections stream in as they resolve */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection userId={session.user.id} />
      </Suspense>

      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection userId={session.user.id} />
      </Suspense>

      <Suspense fallback={<ActivitySkeleton />}>
        <ActivitySection userId={session.user.id} />
      </Suspense>
    </div>
  );
}

// Each section fetches its own data
async function StatsSection({ userId }: { userId: string }) {
  const stats = await fetchUserStats(userId);
  return <StatsCards stats={stats} />;
}
```

## Anti-patterns

### Don't Make Pages Dynamic Unnecessarily

```typescript
// BAD - Using dynamic functions when not needed
export default async function Page() {
  const headersList = await headers(); // Makes page dynamic!
  const posts = await getPosts(); // Static data
  return <PostsList posts={posts} />;
}

// GOOD - Only use dynamic functions when needed
export default async function Page() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}
```

### Don't Ignore Caching Opportunities

```typescript
// BAD - No caching for rarely-changing data
export const dynamic = 'force-dynamic';

export default async function Page() {
  const categories = await getCategories(); // Rarely changes
  return <Categories categories={categories} />;
}

// GOOD - Cache what you can
export default async function Page() {
  // Categories cached, user data dynamic
  const [categories, userData] = await Promise.all([
    getCategories(), // Cached with 'use cache'
    getUserData(),   // Dynamic
  ]);
  return <Page categories={categories} userData={userData} />;
}
```

## Related Skills

- [static-rendering](./static-rendering.md)
- [streaming](./streaming.md)
- [ppr](./ppr.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Dynamic functions
- Search params
- Personalization
- Geolocation
- A/B testing
- Streaming patterns
