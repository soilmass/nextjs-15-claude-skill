---
id: pt-data-cache
name: Data Cache
version: 2.0.0
layer: L5
category: cache
description: Next.js 15 data caching with 'use cache' directive, revalidation, and cache tags
tags: [data, cache, revalidation, use-cache, next15]
composes: []
dependencies: []
formula: "'use cache' directive + cacheLife() + cacheTag() + revalidateTag() = Optimal data freshness"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Data Cache

## When to Use

- **Product catalogs**: Cache product data with category tags for efficient invalidation
- **Blog/CMS content**: Static content with on-demand revalidation when editors publish
- **User profiles**: Cache non-sensitive user data with user-specific tags
- **Configuration data**: Site settings, feature flags with long TTLs
- **API responses**: External API data with time-based revalidation
- **Search results**: Frequently queried data with stale-while-revalidate strategy

**Avoid when:**
- Real-time data (stock prices, live scores)
- User-specific sensitive data (shopping cart, session)
- Rapidly changing data requiring immediate consistency

## Composition Diagram

```
+------------------+     +----------------------+     +------------------+
|   Data Source    |     |     Data Cache       |     |   Server Comp    |
|   (Database/API) |     |                      |     |                  |
+--------+---------+     +----------+-----------+     +--------+---------+
         |                          |                          |
         |   'use cache'            |                          |
         +<-------------------------+                          |
         |                          |                          |
         +------------------------->|   cacheTag('products')   |
         |   Cached Response        |                          |
         |                          +------------------------->|
         |                          |                          |
+--------+---------+                |                          |
|  Server Action   |                |                          |
|  (Mutation)      +--------------->|  revalidateTag()         |
+------------------+   Invalidate   +<-------------------------+
                                    |   Fresh Data Request     |
```

## Overview

Next.js 15 introduces major changes to caching. Fetch requests are NO LONGER cached by default. You must explicitly opt-in using the new `'use cache'` directive, `cache: 'force-cache'`, or time-based revalidation.

## Next.js 15 Breaking Changes

```typescript
// BEFORE (Next.js 14) - Cached by default
const data = await fetch(url);  // Cached!

// AFTER (Next.js 15) - NOT cached by default
const data = await fetch(url);  // No caching!

// Must opt-in to caching
const data = await fetch(url, { cache: 'force-cache' });
// OR
const data = await fetch(url, { next: { revalidate: 3600 } });
```

## The 'use cache' Directive

```typescript
// lib/data.ts
import { cacheLife, cacheTag } from 'next/cache';

// Basic cached function
export async function getProducts() {
  'use cache';
  
  return prisma.product.findMany({
    where: { published: true },
  });
}

// With cache lifetime
export async function getCategories() {
  'use cache';
  cacheLife('days');  // Cache for 1 day
  
  return prisma.category.findMany();
}

// With cache tags for targeted revalidation
export async function getProduct(id: string) {
  'use cache';
  cacheLife('hours');
  cacheTag('products', `product-${id}`);
  
  return prisma.product.findUnique({
    where: { id },
  });
}
```

## Cache Life Options

```typescript
import { cacheLife } from 'next/cache';

// Built-in profiles
cacheLife('seconds');   // ~1 second
cacheLife('minutes');   // ~1 minute  
cacheLife('hours');     // ~1 hour
cacheLife('days');      // ~1 day
cacheLife('weeks');     // ~1 week
cacheLife('max');       // Maximum cache time

// Custom profile (in next.config.ts)
// next.config.ts
export default {
  experimental: {
    cacheLife: {
      frequent: {
        stale: 60,      // Stale after 1 minute
        revalidate: 300, // Revalidate every 5 minutes
        expire: 3600,    // Expire after 1 hour
      },
    },
  },
};

// Usage
cacheLife('frequent');
```

## Cache Tags and Revalidation

```typescript
// lib/products.ts
import { cacheTag } from 'next/cache';

export async function getProducts(category?: string) {
  'use cache';
  cacheTag('products');
  if (category) {
    cacheTag(`category-${category}`);
  }
  
  return prisma.product.findMany({
    where: category ? { categoryId: category } : undefined,
  });
}

export async function getProduct(id: string) {
  'use cache';
  cacheTag('products', `product-${id}`);
  
  return prisma.product.findUnique({
    where: { id },
  });
}

// app/actions/products.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: ProductInput) {
  await prisma.product.update({
    where: { id },
    data,
  });
  
  // Revalidate specific product
  revalidateTag(`product-${id}`);
  
  // Revalidate product lists
  revalidateTag('products');
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({
    where: { id },
  });
  
  // Revalidate product, products, and its category
  revalidateTag(`product-${id}`);
  revalidateTag('products');
  revalidateTag(`category-${product.categoryId}`);
}
```

## Fetch with Cache Options

```typescript
// Time-based revalidation
async function getWeather(city: string) {
  const res = await fetch(`https://api.weather.com/v1/${city}`, {
    next: { revalidate: 300 },  // Revalidate every 5 minutes
  });
  return res.json();
}

// Force cache
async function getCountries() {
  const res = await fetch('https://api.countries.com/all', {
    cache: 'force-cache',  // Cache indefinitely
  });
  return res.json();
}

// No cache
async function getStock(symbol: string) {
  const res = await fetch(`https://api.stocks.com/${symbol}`, {
    cache: 'no-store',  // Never cache
  });
  return res.json();
}

// With tags
async function getProductsApi() {
  const res = await fetch('https://api.example.com/products', {
    next: {
      revalidate: 3600,
      tags: ['products'],
    },
  });
  return res.json();
}
```

## Request Memoization

```typescript
// React automatically deduplicates fetch requests
// during a single render pass

// lib/api.ts
async function getUser(id: string) {
  // This request will be memoized
  const res = await fetch(`/api/users/${id}`, {
    cache: 'force-cache',
  });
  return res.json();
}

// app/layout.tsx
export default async function Layout({ children }) {
  const user = await getUser('123');  // Request 1
  return (
    <div>
      <Header user={user} />
      {children}
    </div>
  );
}

// app/page.tsx  
export default async function Page() {
  const user = await getUser('123');  // Deduplicated! Same request
  return <Profile user={user} />;
}

// Note: Only works with native fetch
// For other data sources, use React's cache()
```

## React cache() for Non-Fetch

```typescript
// lib/db.ts
import { cache } from 'react';

// Memoize database queries
export const getUser = cache(async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
});

export const getProducts = cache(async () => {
  return prisma.product.findMany();
});

// Usage - will be deduplicated across components
// in the same render pass
```

## Preloading with Cache

```typescript
// lib/data.ts
import { cache } from 'react';

export const getProduct = cache(async (id: string) => {
  'use cache';
  return prisma.product.findUnique({ where: { id } });
});

// Preload function (fire and forget)
export const preloadProduct = (id: string) => {
  void getProduct(id);
};

// app/products/[id]/page.tsx
import { getProduct, preloadProduct } from '@/lib/data';

export default async function ProductPage({ params }) {
  const { id } = await params;
  
  // Start fetching immediately
  preloadProduct(id);
  
  // Do other async work
  const reviews = await getReviews(id);
  
  // Product is likely already cached
  const product = await getProduct(id);
  
  return <ProductDetail product={product} reviews={reviews} />;
}
```

## Revalidation Strategies

```typescript
// 1. Path-based revalidation
import { revalidatePath } from 'next/cache';

export async function createPost(data: PostInput) {
  await prisma.post.create({ data });
  
  // Revalidate specific paths
  revalidatePath('/posts');
  revalidatePath('/');
  
  // Revalidate with type
  revalidatePath('/posts', 'page');    // Just the page
  revalidatePath('/posts', 'layout');  // Layout and all pages
}

// 2. Tag-based revalidation
import { revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: ProductInput) {
  await prisma.product.update({ where: { id }, data });
  
  // Revalidate by tag
  revalidateTag('products');
  revalidateTag(`product-${id}`);
}

// 3. On-demand revalidation via API
// app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { tag, path, secret } = await request.json();
  
  // Verify secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  if (tag) {
    revalidateTag(tag);
  }
  
  if (path) {
    revalidatePath(path);
  }
  
  return Response.json({ revalidated: true, now: Date.now() });
}
```

## Route Segment Config

```typescript
// app/products/page.tsx

// Force dynamic (no caching)
export const dynamic = 'force-dynamic';

// Force static (maximum caching)
export const dynamic = 'force-static';

// Revalidate every 60 seconds
export const revalidate = 60;

// Errors during static generation
export const dynamicParams = true;  // Generate on demand
export const dynamicParams = false; // Return 404

// Runtime
export const runtime = 'nodejs';  // or 'edge'
```

## Cache Debugging

```typescript
// Check if data is cached (development)
async function fetchWithDebug(url: string) {
  const start = Date.now();
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  
  console.log(`Fetch ${url}:`, {
    duration: Date.now() - start,
    cached: res.headers.get('x-vercel-cache'),
    stale: res.headers.get('x-vercel-cache') === 'STALE',
  });
  
  return data;
}
```

## ISR Pattern

```typescript
// app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation';

// Generate static pages at build time
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true },
    take: 100,  // Pre-generate top 100
  });
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Revalidate every hour
export const revalidate = 3600;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const post = await prisma.post.findUnique({
    where: { slug },
  });
  
  if (!post) notFound();
  
  return <Article post={post} />;
}
```

## Anti-patterns

### Don't Cache User-Specific Data

```typescript
// BAD - Caching user-specific data
export async function getUserPreferences() {
  'use cache';  // This will cache for ALL users!
  const session = await getSession();
  return prisma.preferences.findUnique({
    where: { userId: session.user.id },
  });
}

// GOOD - No caching for user-specific data
export async function getUserPreferences() {
  const session = await getSession();
  return prisma.preferences.findUnique({
    where: { userId: session.user.id },
  });
}
```

### Don't Forget to Revalidate

```typescript
// BAD - Update without revalidation
export async function updateProduct(id: string, data: ProductInput) {
  await prisma.product.update({ where: { id }, data });
  // Stale data will be served!
}

// GOOD - Revalidate after mutation
export async function updateProduct(id: string, data: ProductInput) {
  await prisma.product.update({ where: { id }, data });
  revalidateTag(`product-${id}`);
  revalidateTag('products');
}
```

## Related Skills

- [server-components-data](./server-components-data.md)
- [server-actions](./server-actions.md)
- [revalidation](./revalidation.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- 'use cache' directive
- Cache tags
- Revalidation strategies
