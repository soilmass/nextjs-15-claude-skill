---
id: pt-cache-aside
name: Cache-Aside Pattern
version: 2.0.0
layer: L5
category: cache
description: The cache-aside (lazy-loading) pattern for Next.js 15 applications
tags: [cache, lazy-loading, redis, data, performance]
composes: []
dependencies: []
formula: "cacheGet() || (fetchFn() + cacheSet()) = Lazy-loaded cache with fallback"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Cache-Aside Pattern

## When to Use

- **Read-heavy workloads**: Applications where reads vastly outnumber writes
- **Product listings**: Frequently accessed catalog data
- **User profiles**: Public profile data accessed by many viewers
- **Reference data**: Categories, regions, configurations
- **API responses**: External API data that changes infrequently
- **Search results**: Cached search queries and results

**Avoid when:**
- Write-heavy workloads (use write-through instead)
- Data requires immediate consistency after writes
- Cache miss latency is unacceptable (use cache warming)
- Simple key-value lookups (use direct Redis operations)

## Composition Diagram

```
+------------------+                          +------------------+
|    Application   |                          |   Redis Cache    |
|                  |                          |                  |
+--------+---------+                          +--------+---------+
         |                                             |
         |  1. cacheGet(key)                           |
         +-------------------------------------------->|
         |                                             |
         |  2a. Cache HIT: return data                 |
         |<--------------------------------------------+
         |                                             |
         |  2b. Cache MISS: null                       |
         |<--------------------------------------------+
         |                                             |
+--------+---------+                                   |
|    Database      |                                   |
+--------+---------+                                   |
         |                                             |
         |  3. fetchFn() - Query DB                    |
         |<--------------------------------------------+
         |                                             |
         |  4. cacheSet(key, data, ttl)                |
         +-------------------------------------------->|
         |                                             |
         |  5. Return data to caller                   |
         +---------------------------------------------+
```

## Overview

The cache-aside (lazy-loading) pattern for Next.js 15 applications. Data is loaded into cache on demand - read from cache first, fallback to database on miss, then populate cache.

## Implementation

### Basic Cache-Aside

```typescript
// lib/cache/cache-aside.ts
import { cacheGet, cacheSet, CacheOptions } from './redis-cache';

export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Step 1: Try cache
  const cached = await cacheGet<T>(key);
  
  if (cached !== null) {
    return cached;
  }

  // Step 2: Cache miss - fetch from origin
  const fresh = await fetchFn();

  // Step 3: Populate cache
  if (fresh !== null && fresh !== undefined) {
    await cacheSet(key, fresh, options);
  }

  return fresh;
}
```

### Type-Safe Cache-Aside with Zod

```typescript
// lib/cache/typed-cache-aside.ts
import { z } from 'zod';
import { cacheGet, cacheSet } from './redis-cache';

type CacheAsideOptions = {
  ttl?: number;
  tags?: string[];
  validate?: boolean;
};

export function createCacheAside<T>(schema: z.ZodSchema<T>) {
  return async function (
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheAsideOptions = {}
  ): Promise<T> {
    const { ttl = 3600, tags = [], validate = true } = options;

    // Try cache
    const cached = await cacheGet<T>(key);
    
    if (cached !== null) {
      // Optionally validate cached data
      if (validate) {
        const result = schema.safeParse(cached);
        if (result.success) {
          return result.data;
        }
        // Invalid cached data - fetch fresh
        console.warn(`Invalid cached data for ${key}, fetching fresh`);
      } else {
        return cached;
      }
    }

    // Fetch and validate
    const fresh = await fetchFn();
    const validated = schema.parse(fresh);

    // Cache validated data
    await cacheSet(key, validated, { ttl, tags });

    return validated;
  };
}

// Usage
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

type Product = z.infer<typeof ProductSchema>;

const getProductCached = createCacheAside(ProductSchema);

export async function getProduct(id: string): Promise<Product> {
  return getProductCached(
    `product:${id}`,
    async () => {
      return prisma.product.findUniqueOrThrow({
        where: { id },
        include: { category: true },
      });
    },
    { ttl: 3600, tags: ['products', `product:${id}`] }
  );
}
```

### Cache-Aside with Stale-While-Revalidate

```typescript
// lib/cache/swr-cache-aside.ts
import { cacheGet, cacheSet } from './redis-cache';

type SWROptions = {
  freshTTL: number;    // Time data is considered fresh
  staleTTL: number;    // Additional time stale data can be served
  tags?: string[];
};

type CachedData<T> = {
  data: T;
  cachedAt: number;
  freshUntil: number;
  staleUntil: number;
};

export async function cacheAsideSWR<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: SWROptions
): Promise<T> {
  const { freshTTL, staleTTL, tags = [] } = options;
  const now = Date.now();

  // Try cache
  const cached = await cacheGet<CachedData<T>>(key);

  if (cached) {
    // Fresh - return immediately
    if (now < cached.freshUntil) {
      return cached.data;
    }

    // Stale but usable - return and revalidate in background
    if (now < cached.staleUntil) {
      // Fire and forget revalidation
      revalidateInBackground(key, fetchFn, options).catch(console.error);
      return cached.data;
    }
  }

  // Expired or miss - fetch fresh
  const fresh = await fetchFn();
  
  const cacheData: CachedData<T> = {
    data: fresh,
    cachedAt: now,
    freshUntil: now + freshTTL * 1000,
    staleUntil: now + (freshTTL + staleTTL) * 1000,
  };

  await cacheSet(key, cacheData, {
    ttl: freshTTL + staleTTL,
    tags,
  });

  return fresh;
}

async function revalidateInBackground<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: SWROptions
): Promise<void> {
  const { freshTTL, staleTTL, tags = [] } = options;
  const now = Date.now();

  try {
    const fresh = await fetchFn();
    
    const cacheData: CachedData<T> = {
      data: fresh,
      cachedAt: now,
      freshUntil: now + freshTTL * 1000,
      staleUntil: now + (freshTTL + staleTTL) * 1000,
    };

    await cacheSet(key, cacheData, {
      ttl: freshTTL + staleTTL,
      tags,
    });
  } catch (error) {
    console.error(`Background revalidation failed for ${key}:`, error);
  }
}
```

### Data Layer with Cache-Aside

```typescript
// lib/data/products.ts
import { prisma } from '@/lib/prisma';
import { cacheAside, cacheAsideSWR } from '@/lib/cache';

export async function getProduct(id: string) {
  return cacheAside(
    `product:${id}`,
    async () => {
      return prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: true,
        },
      });
    },
    { ttl: 3600, tags: ['products', `product:${id}`] }
  );
}

export async function getFeaturedProducts() {
  return cacheAsideSWR(
    'products:featured',
    async () => {
      return prisma.product.findMany({
        where: { featured: true, published: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
    },
    {
      freshTTL: 300,    // 5 minutes fresh
      staleTTL: 3600,   // 1 hour stale acceptable
      tags: ['products', 'featured'],
    }
  );
}

export async function getProductsByCategory(categoryId: string, page: number = 1) {
  const limit = 20;
  const offset = (page - 1) * limit;

  return cacheAside(
    `products:category:${categoryId}:page:${page}`,
    async () => {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { categoryId, published: true },
          include: { images: { take: 1 } },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.product.count({
          where: { categoryId, published: true },
        }),
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    { ttl: 1800, tags: ['products', `category:${categoryId}`] }
  );
}
```

### Cache-Aside with Fallback

```typescript
// lib/cache/cache-aside-fallback.ts
import { cacheGet, cacheSet } from './redis-cache';

type FallbackOptions = {
  ttl?: number;
  fallbackTTL?: number;  // Shorter TTL for fallback data
  tags?: string[];
};

export async function cacheAsideWithFallback<T>(
  key: string,
  fetchFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  options: FallbackOptions = {}
): Promise<T> {
  const { ttl = 3600, fallbackTTL = 60, tags = [] } = options;

  // Try cache
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Try primary fetch
  try {
    const fresh = await fetchFn();
    await cacheSet(key, fresh, { ttl, tags });
    return fresh;
  } catch (error) {
    console.error(`Primary fetch failed for ${key}:`, error);
  }

  // Try fallback
  try {
    const fallback = await fallbackFn();
    // Cache with shorter TTL
    await cacheSet(key, fallback, { ttl: fallbackTTL, tags });
    return fallback;
  } catch (fallbackError) {
    console.error(`Fallback also failed for ${key}:`, fallbackError);
    throw new Error(`Failed to fetch data for ${key}`);
  }
}

// Usage: External API with database fallback
export async function getExchangeRates() {
  return cacheAsideWithFallback(
    'exchange-rates',
    async () => {
      const response = await fetch('https://api.exchangerate.host/latest');
      return response.json();
    },
    async () => {
      // Fallback to last known rates in database
      return prisma.exchangeRate.findFirst({
        orderBy: { fetchedAt: 'desc' },
      });
    },
    { ttl: 3600, fallbackTTL: 300 }
  );
}
```

### Batch Cache-Aside

```typescript
// lib/cache/batch-cache-aside.ts
import { getRedis } from '@/lib/redis';

export async function batchCacheAside<T>(
  keys: string[],
  fetchFn: (missingKeys: string[]) => Promise<Map<string, T>>,
  options: { ttl?: number } = {}
): Promise<Map<string, T>> {
  const { ttl = 3600 } = options;
  const redis = getRedis();
  const results = new Map<string, T>();
  const missingKeys: string[] = [];

  // Batch get from cache
  if (keys.length > 0) {
    const cached = await redis.mget<(T | null)[]>(...keys);
    
    keys.forEach((key, index) => {
      const value = cached[index];
      if (value !== null) {
        results.set(key, value);
      } else {
        missingKeys.push(key);
      }
    });
  }

  // Batch fetch missing
  if (missingKeys.length > 0) {
    const fetched = await fetchFn(missingKeys);
    
    // Batch set to cache
    const pipeline = redis.pipeline();
    for (const [key, value] of fetched) {
      pipeline.set(key, JSON.stringify(value), { ex: ttl });
      results.set(key, value);
    }
    await pipeline.exec();
  }

  return results;
}

// Usage
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const keys = ids.map((id) => `product:${id}`);
  
  const cached = await batchCacheAside<Product>(
    keys,
    async (missingKeys) => {
      const missingIds = missingKeys.map((k) => k.replace('product:', ''));
      
      const products = await prisma.product.findMany({
        where: { id: { in: missingIds } },
      });

      return new Map(products.map((p) => [`product:${p.id}`, p]));
    },
    { ttl: 3600 }
  );

  // Return in original order
  return ids
    .map((id) => cached.get(`product:${id}`))
    .filter((p): p is Product => p !== undefined);
}
```

### Next.js 15 unstable_cache Integration

```typescript
// lib/data/cached-queries.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Using Next.js built-in cache-aside
export const getCachedProduct = unstable_cache(
  async (id: string) => {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  },
  ['product'],
  {
    tags: ['products'],
    revalidate: 3600,
  }
);

// With dynamic tags
export async function getCachedProductWithTags(id: string) {
  const cachedFn = unstable_cache(
    async () => {
      return prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
    },
    [`product-${id}`],
    {
      tags: ['products', `product-${id}`],
      revalidate: 3600,
    }
  );

  return cachedFn();
}

// Combining with Redis for multi-layer caching
export async function getProductMultiLayer(id: string) {
  // L1: Redis (faster, distributed)
  const redisKey = `product:${id}`;
  const redisCached = await redisGet<Product>(redisKey);
  if (redisCached) return redisCached;

  // L2: Next.js cache (integrated with ISR)
  const product = await getCachedProduct(id);
  
  if (product) {
    // Populate Redis
    await redisSet(redisKey, product, { ttl: 3600 });
  }

  return product;
}
```

## Variants

### With Circuit Breaker

```typescript
// lib/cache/circuit-breaker-cache.ts
import { CircuitBreaker } from '@/lib/circuit-breaker';

const dbCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
});

export async function cacheAsideWithCircuitBreaker<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { ttl?: number } = {}
): Promise<T | null> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached) return cached;

  // Check circuit breaker before database call
  if (dbCircuitBreaker.isOpen()) {
    console.warn('Circuit breaker open, returning null');
    return null;
  }

  try {
    const fresh = await dbCircuitBreaker.execute(fetchFn);
    await cacheSet(key, fresh, options);
    return fresh;
  } catch (error) {
    console.error('Fetch failed:', error);
    return null;
  }
}
```

### With Request Deduplication

```typescript
// lib/cache/dedupe-cache-aside.ts
const inFlightRequests = new Map<string, Promise<unknown>>();

export async function cacheAsideDedupe<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { ttl?: number } = {}
): Promise<T> {
  // Check cache
  const cached = await cacheGet<T>(key);
  if (cached) return cached;

  // Check for in-flight request
  const inFlight = inFlightRequests.get(key);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  // Start new request
  const request = (async () => {
    try {
      const fresh = await fetchFn();
      await cacheSet(key, fresh, options);
      return fresh;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, request);
  return request;
}
```

## Anti-patterns

```typescript
// BAD: Cache-aside without null handling
const data = await cacheAside(key, fetchFn);
return data.name; // May throw if fetchFn returns null!

// GOOD: Handle null results
const data = await cacheAside(key, fetchFn);
if (!data) {
  notFound();
}
return data.name;

// BAD: Not invalidating on writes
await prisma.product.update({ where: { id }, data });
// Cache still has old data!

// GOOD: Invalidate after writes
await prisma.product.update({ where: { id }, data });
await cacheDelete(`product:${id}`);

// BAD: Using cache-aside for write-heavy data
await cacheAside(`counter:${id}`, getCounter); // Constantly stale!

// GOOD: Use write-through or no cache for write-heavy data
const counter = await prisma.counter.findUnique({ where: { id } });
```

## Related Patterns

- `redis-cache.md` - Redis caching infrastructure
- `write-through.md` - Write-through cache pattern
- `cache-invalidation.md` - Invalidation strategies
- `request-memoization.md` - Per-request memoization

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial cache-aside pattern
