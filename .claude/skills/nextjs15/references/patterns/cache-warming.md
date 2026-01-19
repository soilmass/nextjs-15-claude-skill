---
id: pt-cache-warming
name: Cache Warming
version: 2.0.0
layer: L5
category: cache
description: Pre-populating caches on deployment, schedule, or traffic patterns
tags: [cache, warming, deployment, cron, pre-render]
composes: []
dependencies: []
formula: "Deployment Hook + Cron Job + Analytics Data + Priority Queue = Zero cold-start latency"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Cache Warming Pattern

## When to Use

- **Post-deployment**: Warm critical paths after releasing new code
- **Scheduled refresh**: Pre-populate before peak traffic hours
- **Popular content**: Keep frequently accessed data always cached
- **Critical paths**: Homepage, checkout flow, search results
- **Analytics-driven**: Warm based on actual traffic patterns
- **Event preparation**: Pre-warm before sales, launches, campaigns

**Avoid when:**
- Data changes faster than warming cycles
- Storage costs exceed performance benefits
- Warming takes longer than cache TTL
- Random/unpredictable access patterns

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|  Warming         |     |   Redis Cache    |     |   Database       |
|  Triggers        |     |                  |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
  Deployment Hook                 |                        |
         +----------------------->|                        |
         |  Priority 1 Tasks      |  Batch fetch           |
         |  (Featured, Config)    +----------------------->|
         |                        |<-----------------------+
         |                        |  cacheSet() x N        |
         |                        |                        |
  Cron Job (6 hours)              |                        |
         +----------------------->|                        |
         |  Popular Products      |  Refresh hot data      |
         |  Categories, Pages     +----------------------->|
         |                        |<-----------------------+
         |                        |                        |
  Analytics Webhook               |                        |
         +----------------------->|                        |
         |  Trending Items        |  Warm trending         |
         |                        +----------------------->|
```

## Overview

Pre-populating caches on deployment, schedule, or traffic patterns to ensure cache hits for frequently accessed data in Next.js 15 applications.

## Implementation

### Deployment Cache Warming Script

```typescript
// scripts/warm-cache.ts
import { prisma } from '@/lib/prisma';
import { cacheSet } from '@/lib/cache/redis-cache';

interface WarmingConfig {
  name: string;
  warmFn: () => Promise<void>;
  priority: number;
}

const warmingTasks: WarmingConfig[] = [
  {
    name: 'featured-products',
    priority: 1,
    warmFn: async () => {
      const products = await prisma.product.findMany({
        where: { featured: true, published: true },
        include: { category: true, images: true },
        take: 50,
      });

      await cacheSet('products:featured', products, {
        ttl: 3600,
        tags: ['products', 'featured'],
      });

      // Also warm individual product caches
      await Promise.all(
        products.map((product) =>
          cacheSet(`product:${product.id}`, product, {
            ttl: 3600,
            tags: ['products', `product:${product.id}`],
          })
        )
      );

      console.log(`Warmed ${products.length} featured products`);
    },
  },
  {
    name: 'categories',
    priority: 1,
    warmFn: async () => {
      const categories = await prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
      });

      await cacheSet('categories:all', categories, {
        ttl: 7200,
        tags: ['categories'],
      });

      console.log(`Warmed ${categories.length} categories`);
    },
  },
  {
    name: 'popular-products',
    priority: 2,
    warmFn: async () => {
      const products = await prisma.product.findMany({
        where: { published: true },
        orderBy: { views: 'desc' },
        take: 100,
      });

      for (const product of products) {
        await cacheSet(`product:${product.id}`, product, {
          ttl: 1800,
          tags: ['products', `product:${product.id}`],
        });
      }

      console.log(`Warmed ${products.length} popular products`);
    },
  },
  {
    name: 'site-config',
    priority: 1,
    warmFn: async () => {
      const config = await prisma.siteConfig.findFirst();
      const navigation = await prisma.navigation.findMany({
        orderBy: { order: 'asc' },
      });

      await cacheSet('site:config', config, { ttl: 86400, tags: ['config'] });
      await cacheSet('site:navigation', navigation, { ttl: 86400, tags: ['config'] });

      console.log('Warmed site configuration');
    },
  },
];

async function warmCache() {
  console.log('Starting cache warming...');
  const startTime = Date.now();

  // Sort by priority and run
  const sortedTasks = warmingTasks.sort((a, b) => a.priority - b.priority);

  // Run priority 1 tasks in parallel
  const priority1Tasks = sortedTasks.filter((t) => t.priority === 1);
  await Promise.all(priority1Tasks.map((task) => task.warmFn()));

  // Run lower priority tasks sequentially to avoid overwhelming the database
  const lowerPriorityTasks = sortedTasks.filter((t) => t.priority > 1);
  for (const task of lowerPriorityTasks) {
    await task.warmFn();
  }

  const duration = Date.now() - startTime;
  console.log(`Cache warming complete in ${duration}ms`);
}

// Run as script
warmCache()
  .catch(console.error)
  .finally(() => process.exit());
```

### API Route for Manual Cache Warming

```typescript
// app/api/admin/cache/warm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { warmCache, warmCacheByTag } from '@/lib/cache/warming';

export async function POST(request: NextRequest) {
  // Verify admin authorization
  const authHeader = request.headers.get('authorization');
  if (!verifyAdminToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { tags, full } = body;

  try {
    if (full) {
      await warmCache();
      return NextResponse.json({ message: 'Full cache warming completed' });
    }

    if (tags && Array.isArray(tags)) {
      await Promise.all(tags.map((tag: string) => warmCacheByTag(tag)));
      return NextResponse.json({ 
        message: `Warmed caches for tags: ${tags.join(', ')}` 
      });
    }

    return NextResponse.json({ error: 'No warming action specified' }, { status: 400 });
  } catch (error) {
    console.error('Cache warming failed:', error);
    return NextResponse.json({ error: 'Cache warming failed' }, { status: 500 });
  }
}
```

### Scheduled Cache Warming with Cron

```typescript
// app/api/cron/warm-cache/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { warmCache, warmPopularRoutes } from '@/lib/cache/warming';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // Full cache warming every 6 hours
    await warmCache();
    
    // Warm popular routes by pre-rendering
    await warmPopularRoutes();

    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scheduled cache warming failed:', error);
    return NextResponse.json({ error: 'Warming failed' }, { status: 500 });
  }
}

// vercel.json
// {
//   "crons": [
//     {
//       "path": "/api/cron/warm-cache",
//       "schedule": "0 */6 * * *"
//     }
//   ]
// }
```

### Pre-render Warming for SSG/ISR Pages

```typescript
// lib/cache/warming.ts
import { unstable_noStore as noStore } from 'next/cache';

export async function warmPopularRoutes(): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  
  // Get popular routes from analytics or database
  const popularRoutes = await getPopularRoutes();

  // Pre-render each route
  const results = await Promise.allSettled(
    popularRoutes.map(async (route) => {
      const response = await fetch(`${baseUrl}${route}`, {
        headers: {
          'X-Warmup-Request': 'true',
          'User-Agent': 'CacheWarmer/1.0',
        },
      });
      
      return {
        route,
        status: response.status,
        cached: response.headers.get('x-cache') === 'HIT',
      };
    })
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  console.log(`Warmed ${successful}/${popularRoutes.length} routes`);
}

async function getPopularRoutes(): Promise<string[]> {
  // From analytics or hardcoded
  return [
    '/',
    '/products',
    '/products/featured',
    '/categories',
    '/about',
    '/contact',
  ];
}
```

### Event-Driven Cache Warming

```typescript
// lib/cache/event-warming.ts
import { prisma } from '@/lib/prisma';
import { cacheSet, cacheInvalidateTag } from './redis-cache';

export async function onProductCreated(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true, images: true },
  });

  if (!product) return;

  // Warm the new product cache
  await cacheSet(`product:${productId}`, product, {
    ttl: 3600,
    tags: ['products', `product:${productId}`, `category:${product.categoryId}`],
  });

  // Invalidate and re-warm category products
  await cacheInvalidateTag(`category:${product.categoryId}`);
  await warmCategoryProducts(product.categoryId);
}

export async function onProductUpdated(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true, images: true },
  });

  if (!product) return;

  // Update the product cache
  await cacheSet(`product:${productId}`, product, {
    ttl: 3600,
    tags: ['products', `product:${productId}`],
  });

  // Re-warm related caches
  if (product.featured) {
    await warmFeaturedProducts();
  }
}

async function warmCategoryProducts(categoryId: string): Promise<void> {
  const products = await prisma.product.findMany({
    where: { categoryId, published: true },
    take: 50,
  });

  await cacheSet(`products:category:${categoryId}`, products, {
    ttl: 1800,
    tags: ['products', `category:${categoryId}`],
  });
}

async function warmFeaturedProducts(): Promise<void> {
  const products = await prisma.product.findMany({
    where: { featured: true, published: true },
    take: 20,
  });

  await cacheSet('products:featured', products, {
    ttl: 3600,
    tags: ['products', 'featured'],
  });
}
```

### Progressive Cache Warming

```typescript
// lib/cache/progressive-warming.ts
import { getRedis } from '@/lib/redis';

const WARMING_QUEUE_KEY = 'cache:warming:queue';
const WARMING_IN_PROGRESS_KEY = 'cache:warming:in-progress';

export async function queueForWarming(items: string[]): Promise<void> {
  const redis = getRedis();
  if (items.length > 0) {
    await redis.rpush(WARMING_QUEUE_KEY, ...items);
  }
}

export async function processWarmingQueue(batchSize: number = 10): Promise<void> {
  const redis = getRedis();

  // Check if warming is already in progress
  const inProgress = await redis.get(WARMING_IN_PROGRESS_KEY);
  if (inProgress) return;

  // Set lock
  await redis.set(WARMING_IN_PROGRESS_KEY, '1', { ex: 300 }); // 5 min timeout

  try {
    while (true) {
      // Get batch of items to warm
      const items = await redis.lpop<string>(WARMING_QUEUE_KEY, batchSize);
      if (!items || items.length === 0) break;

      // Process batch
      await Promise.all(
        items.map(async (item) => {
          const [type, id] = item.split(':');
          await warmByType(type, id);
        })
      );

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    // Release lock
    await redis.del(WARMING_IN_PROGRESS_KEY);
  }
}

async function warmByType(type: string, id: string): Promise<void> {
  switch (type) {
    case 'product':
      await warmProduct(id);
      break;
    case 'category':
      await warmCategory(id);
      break;
    case 'user':
      await warmUserProfile(id);
      break;
  }
}
```

### Deployment Hook Integration

```typescript
// scripts/vercel-deploy-hook.ts
// Called via Vercel deployment webhook

import { warmCache } from '@/lib/cache/warming';

async function handleDeployment() {
  console.log('Deployment detected, starting cache warming...');
  
  // Wait for deployment to be fully ready
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Warm critical caches
  await warmCache();

  // Notify monitoring
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `Cache warming completed for deployment`,
    }),
  });
}

handleDeployment().catch(console.error);
```

## Variants

### With Background Job Queue

```typescript
// lib/jobs/cache-warming-job.ts
import { Queue, Worker } from 'bullmq';
import { warmProductCache, warmCategoryCache } from '@/lib/cache/warming';

const cacheWarmingQueue = new Queue('cache-warming', {
  connection: { host: process.env.REDIS_HOST, port: 6379 },
});

// Add warming job
export async function scheduleCacheWarming(
  type: 'product' | 'category' | 'full',
  id?: string
) {
  await cacheWarmingQueue.add('warm', { type, id }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}

// Worker to process warming jobs
new Worker('cache-warming', async (job) => {
  const { type, id } = job.data;

  switch (type) {
    case 'product':
      await warmProductCache(id);
      break;
    case 'category':
      await warmCategoryCache(id);
      break;
    case 'full':
      await warmFullCache();
      break;
  }
}, {
  connection: { host: process.env.REDIS_HOST, port: 6379 },
  concurrency: 5,
});
```

### With Analytics-Driven Warming

```typescript
// lib/cache/analytics-warming.ts
export async function warmBasedOnAnalytics(): Promise<void> {
  // Get top pages from analytics
  const topPages = await fetchTopPages();

  for (const page of topPages) {
    // Extract resource IDs from URLs
    const productMatch = page.url.match(/\/products\/([^/]+)/);
    if (productMatch) {
      await warmProductCache(productMatch[1]);
    }

    const categoryMatch = page.url.match(/\/categories\/([^/]+)/);
    if (categoryMatch) {
      await warmCategoryCache(categoryMatch[1]);
    }
  }
}

async function fetchTopPages(): Promise<{ url: string; views: number }[]> {
  // Fetch from Vercel Analytics, Google Analytics, etc.
  const response = await fetch('https://api.vercel.com/v1/analytics/pages', {
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    },
  });
  return response.json();
}
```

## Anti-patterns

```typescript
// BAD: Warming everything at once
await Promise.all(allProducts.map(warmProduct)); // May overwhelm resources

// GOOD: Batch with delays
for (const batch of chunks(allProducts, 10)) {
  await Promise.all(batch.map(warmProduct));
  await sleep(100);
}

// BAD: No error handling in warming
products.forEach((p) => warmProductCache(p.id)); // Fire and forget

// GOOD: Track failures
const results = await Promise.allSettled(
  products.map((p) => warmProductCache(p.id))
);
const failures = results.filter((r) => r.status === 'rejected');
if (failures.length > 0) {
  console.error(`${failures.length} warming failures`);
}

// BAD: Warming rarely-accessed data
await warmAllHistoricalData(); // Wasting resources

// GOOD: Warm based on access patterns
await warmTopAccessedData();
```

## Related Patterns

- `redis-cache.md` - Redis caching implementation
- `cache-invalidation.md` - Cache invalidation strategies
- `cron-jobs.md` - Scheduled job execution
- `background-jobs.md` - Background job processing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial cache warming pattern
