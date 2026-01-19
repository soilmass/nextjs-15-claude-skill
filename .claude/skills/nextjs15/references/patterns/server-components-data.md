---
id: pt-server-components-data
name: Server Components Data Fetching
version: 2.1.0
layer: L5
category: data
description: Fetch data directly in React Server Components with async/await syntax
tags: [data, server-components, fetching, async, next15]
composes:
  - ../atoms/display-skeleton.md
  - ../molecules/card.md
  - ../molecules/stat-card.md
  - ../organisms/stats-dashboard.md
dependencies: []
formula: "ServerComponentData = async/await + Suspense + Skeleton(a-display-skeleton) + StatCard(m-stat-card)"
breaking_changes: true
performance:
  impact: medium
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Server Components Data Fetching

## Overview

React Server Components allow you to fetch data directly in your components using async/await. In Next.js 15, fetch requests are no longer cached by default - you must explicitly opt-in to caching.

## When to Use

- Direct database access in components
- External API fetching with caching control
- Parallel data fetching for dashboards
- SEO-critical pages with server rendering
- Pages where client-side fetching is unnecessary

## Composition Diagram

```
+------------------------------------------+
|           Server Component Page          |
|  +------------------------------------+  |
|  |        Static Content             |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |   await getStats() -> StatsCards  |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |   await getPosts() -> PostList    |  |
|  +------------------------------------+  |
|           |                             |
|           v (rendered on server)        |
|  +------------------------------------+  |
|  |        HTML sent to client        |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Next.js 15 Breaking Changes

```typescript
// BEFORE (Next.js 14) - Cached by default
const data = await fetch(url);

// AFTER (Next.js 15) - NOT cached by default
const data = await fetch(url);  // No caching

// Opt-in to caching
const data = await fetch(url, { cache: 'force-cache' });

// Or use the new 'use cache' directive
async function getData() {
  'use cache';
  return fetch(url);
}
```

## Basic Data Fetching

```typescript
// app/products/page.tsx
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/product-grid";

export default async function ProductsPage() {
  // Direct database query in Server Component
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return <ProductGrid products={products} />;
}
```

## Fetching from External APIs

```typescript
// app/weather/page.tsx
interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

async function getWeather(city: string): Promise<WeatherData> {
  const res = await fetch(
    `https://api.weather.com/v1/current?city=${city}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.WEATHER_API_KEY}`,
      },
      // Revalidate every 5 minutes
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch weather');
  }

  return res.json();
}

export default async function WeatherPage() {
  const weather = await getWeather('New York');

  return (
    <div>
      <h1>{weather.location}</h1>
      <p>{weather.temperature}°F - {weather.condition}</p>
    </div>
  );
}
```

## Parallel Data Fetching

```typescript
// app/dashboard/page.tsx
import { prisma } from "@/lib/db";

async function getStats() {
  return prisma.stats.findFirst();
}

async function getRecentOrders() {
  return prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
}

async function getTopProducts() {
  return prisma.product.findMany({
    take: 5,
    orderBy: { sales: 'desc' },
  });
}

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [stats, orders, products] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getTopProducts(),
  ]);

  return (
    <div className="grid gap-6">
      <StatsCards stats={stats} />
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentOrders orders={orders} />
        <TopProducts products={products} />
      </div>
    </div>
  );
}
```

## Sequential Data Fetching

```typescript
// app/users/[id]/page.tsx
// When one fetch depends on another

async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

async function getUserPosts(userId: string) {
  const res = await fetch(`/api/users/${userId}/posts`);
  return res.json();
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Sequential: posts depend on user
  const user = await getUser(id);
  const posts = await getUserPosts(user.id);

  return (
    <div>
      <UserHeader user={user} />
      <UserPosts posts={posts} />
    </div>
  );
}
```

## The 'use cache' Directive (Next.js 15)

```typescript
// lib/data.ts
import { cacheLife, cacheTag } from 'next/cache';

export async function getProducts() {
  'use cache';
  cacheLife('hours');  // Cache for 1 hour
  cacheTag('products');  // Tag for targeted revalidation
  
  return prisma.product.findMany({
    where: { published: true },
  });
}

export async function getProduct(id: string) {
  'use cache';
  cacheLife('days');
  cacheTag('products', `product-${id}`);
  
  return prisma.product.findUnique({
    where: { id },
  });
}

// Revalidate by tag
import { revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: ProductData) {
  await prisma.product.update({ where: { id }, data });
  
  // Revalidate specific product and product list
  revalidateTag(`product-${id}`);
  revalidateTag('products');
}
```

## Fetch with Request Memoization

```typescript
// lib/api.ts
// Requests to the same URL are automatically deduplicated
// during a single render pass

async function getUser(id: string) {
  // This will only make ONE request even if called multiple times
  const res = await fetch(`https://api.example.com/users/${id}`, {
    cache: 'force-cache',
  });
  return res.json();
}

// app/layout.tsx
export default async function Layout({ children }) {
  const user = await getUser('123');  // Request 1
  return <div>{children}</div>;
}

// app/page.tsx
export default async function Page() {
  const user = await getUser('123');  // Deduplicated! Uses same request
  return <div>{user.name}</div>;
}
```

## Preloading Data

```typescript
// lib/data.ts
import { cache } from 'react';

// Create a cached version of the fetch
export const getUser = cache(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// Preload function (doesn't return anything)
export const preloadUser = (id: string) => {
  void getUser(id);
};

// app/users/[id]/page.tsx
import { getUser, preloadUser } from '@/lib/data';

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Start fetching early
  preloadUser(id);
  
  // Do other work...
  
  // Data is likely already fetched
  const user = await getUser(id);
  
  return <UserProfile user={user} />;
}
```

## Streaming with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function SlowComponent() {
  const data = await fetchSlowData();
  return <div>{data}</div>;
}

export default function DashboardPage() {
  return (
    <div>
      {/* Renders immediately */}
      <Header />
      
      {/* Streams in when ready */}
      <Suspense fallback={<Skeleton className="h-64" />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

## Error Handling

```typescript
// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';

async function getProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, {
    next: { revalidate: 3600 },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }

  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
```

## With TypeScript

```typescript
// types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// lib/products.ts
import { Product } from '@/types/product';

export async function getProducts(): Promise<Product[]> {
  'use cache';
  
  const res = await fetch(`${process.env.API_URL}/products`);
  
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return res.json();
}

export async function getProduct(id: string): Promise<Product | null> {
  'use cache';
  
  const res = await fetch(`${process.env.API_URL}/products/${id}`);
  
  if (res.status === 404) {
    return null;
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return res.json();
}
```

## Data Fetching in Layouts

```typescript
// app/(dashboard)/layout.tsx
import { getSession } from '@/lib/auth';
import { getNotifications } from '@/lib/notifications';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout-level data fetching
  const [session, notifications] = await Promise.all([
    getSession(),
    getNotifications(),
  ]);

  return (
    <div>
      <DashboardHeader 
        user={session?.user}
        notifications={notifications}
      />
      {children}
    </div>
  );
}
```

## Anti-patterns

### Don't Fetch in Client Components When Server is Better

```typescript
// BAD - Unnecessary client-side fetch
'use client';

export function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);
  
  return <div>{products.map(/* ... */)}</div>;
}

// GOOD - Server Component fetch
export async function ProductList() {
  const products = await getProducts();
  return <div>{products.map(/* ... */)}</div>;
}
```

### Don't Forget Error Boundaries

```typescript
// BAD - No error handling
export default async function Page() {
  const data = await riskyFetch();  // Crashes entire page on error
  return <div>{data}</div>;
}

// GOOD - Error boundary
// error.tsx handles errors for this route
export default async function Page() {
  const data = await riskyFetch();
  return <div>{data}</div>;
}
```

## Related Skills

- [client-fetch](./client-fetch.md)
- [react-query](./react-query.md)
- [mutations](./mutations.md)
- [data-cache](./data-cache.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Next.js 15 cache changes
- 'use cache' directive
- Streaming patterns
