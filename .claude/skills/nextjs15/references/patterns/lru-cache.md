---
id: pt-lru-cache
name: Lru Cache
version: 2.0.0
layer: L5
category: cache
description: In-memory Least Recently Used cache for hot data in Next.js 15
tags: [cache, lru, cache]
composes: []
dependencies: []
formula: "Map + TTL Expiry + Size Limit + Eviction Policy = Fast in-process caching"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# LRU Cache Pattern

## When to Use

- **Hot data caching**: Frequently accessed, rarely changing data
- **Request deduplication**: Prevent duplicate fetches within process
- **Computed values**: Cache expensive calculations
- **Configuration data**: App settings, feature flags
- **Multi-layer L1 cache**: Fast layer before Redis/external cache
- **Development/testing**: Local caching without external dependencies

**Avoid when:**
- Data must persist across serverless invocations
- Multi-instance deployments needing shared cache
- Large datasets exceeding process memory
- Data requiring distributed invalidation

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   Application    |     |   LRU Cache      |     |   External Cache |
|   (Request)      |     |   (In-Memory)    |     |   (Redis)        |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  cacheGet(key)         |                        |
         +----------------------->|                        |
         |                        |                        |
         |  L1 HIT: immediate     |                        |
         |<-----------------------+                        |
         |                        |                        |
         |  L1 MISS: check L2     |                        |
         |                        +----------------------->|
         |                        |                        |
         |                        |  L2 HIT: promote to L1 |
         |                        |<-----------------------+
         |                        |                        |
         |  Return + cache L1     |                        |
         |<-----------------------+                        |
         |                        |                        |
         |  Eviction on capacity  |                        |
         |  (LRU algorithm)       |                        |
         +------------------------+------------------------+
```

## Overview

In-memory Least Recently Used (LRU) cache for hot data in Next.js 15 applications. Provides fast access to frequently used data with automatic eviction of least accessed entries.

## Implementation

### Basic LRU Cache Class

```typescript
// lib/cache/lru-cache.ts
type CacheEntry<T> = {
  value: T;
  expiry?: number;
};

export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check expiry
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    // Remove if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<V> = {
      value,
      expiry: ttlMs ? Date.now() + ttlMs : undefined,
    };

    this.cache.set(key, entry);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  get size(): number {
    return this.cache.size;
  }

  // Get stats for monitoring
  getStats() {
    let expired = 0;
    const now = Date.now();
    
    for (const [, entry] of this.cache) {
      if (entry.expiry && now > entry.expiry) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      utilization: (this.cache.size / this.maxSize) * 100,
    };
  }
}
```

### Singleton Cache Instance

```typescript
// lib/cache/memory-cache.ts
import { LRUCache } from './lru-cache';

// Global singleton for server-side caching
const globalForCache = globalThis as unknown as {
  memoryCache: LRUCache<string, unknown> | undefined;
};

export const memoryCache =
  globalForCache.memoryCache ?? new LRUCache<string, unknown>(10000);

if (process.env.NODE_ENV !== 'production') {
  globalForCache.memoryCache = memoryCache;
}

// Type-safe cache helpers
export function cacheGet<T>(key: string): T | undefined {
  return memoryCache.get(key) as T | undefined;
}

export function cacheSet<T>(key: string, value: T, ttlMs?: number): void {
  memoryCache.set(key, value, ttlMs);
}

export function cacheDelete(key: string): boolean {
  return memoryCache.delete(key);
}

export function cacheClear(): void {
  memoryCache.clear();
}
```

### Data Layer with LRU Cache

```typescript
// lib/data/products.ts
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/cache/memory-cache';

const PRODUCT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getProduct(id: string) {
  const cacheKey = `product:${id}`;
  
  // Check memory cache first
  const cached = cacheGet<Product>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: true },
  });

  if (product) {
    // Store in memory cache
    cacheSet(cacheKey, product, PRODUCT_CACHE_TTL);
  }

  return product;
}

export async function getPopularProducts(limit: number = 10) {
  const cacheKey = `products:popular:${limit}`;
  
  const cached = cacheGet<Product[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { views: 'desc' },
    take: limit,
  });

  cacheSet(cacheKey, products, 60 * 1000); // 1 minute cache

  return products;
}
```

### Request Memoization with LRU

```typescript
// lib/cache/request-memo.ts
import { LRUCache } from './lru-cache';
import { headers } from 'next/headers';

// Per-request cache using request ID
function getRequestCache(): LRUCache<string, unknown> {
  const headersList = headers();
  const requestId = headersList.get('x-request-id') ?? 'default';
  
  // Use global cache with request-scoped keys
  const cacheKey = `request:${requestId}`;
  
  let requestCache = globalRequestCaches.get(cacheKey);
  if (!requestCache) {
    requestCache = new LRUCache<string, unknown>(100);
    globalRequestCaches.set(cacheKey, requestCache);
    
    // Clean up after request (approximate)
    setTimeout(() => {
      globalRequestCaches.delete(cacheKey);
    }, 30000);
  }
  
  return requestCache;
}

const globalRequestCaches = new Map<string, LRUCache<string, unknown>>();

export function memoize<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const cache = getRequestCache();
  
  const cached = cache.get(key);
  if (cached !== undefined) {
    return Promise.resolve(cached as T);
  }

  return fn().then((result) => {
    cache.set(key, result);
    return result;
  });
}

// Usage
export async function getCurrentUser() {
  return memoize('currentUser', async () => {
    const session = await getSession();
    if (!session) return null;
    
    return prisma.user.findUnique({
      where: { id: session.userId },
    });
  });
}
```

### Multi-Layer Cache with LRU

```typescript
// lib/cache/multi-layer.ts
import { LRUCache } from './lru-cache';
import { cacheGet as redisGet, cacheSet as redisSet } from './redis-cache';

const memoryCache = new LRUCache<string, unknown>(5000);

type CacheOptions = {
  memoryTTL?: number;  // milliseconds
  redisTTL?: number;   // seconds
};

export async function multiLayerGet<T>(key: string): Promise<T | null> {
  // L1: Memory cache
  const memoryCached = memoryCache.get(key);
  if (memoryCached !== undefined) {
    return memoryCached as T;
  }

  // L2: Redis cache
  const redisCached = await redisGet<T>(key);
  if (redisCached !== null) {
    // Promote to memory cache
    memoryCache.set(key, redisCached, 60000); // 1 min in memory
    return redisCached;
  }

  return null;
}

export async function multiLayerSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const { memoryTTL = 60000, redisTTL = 3600 } = options;

  // Set in both layers
  memoryCache.set(key, value, memoryTTL);
  await redisSet(key, value, { ttl: redisTTL });
}

export async function multiLayerDelete(key: string): Promise<void> {
  memoryCache.delete(key);
  await redisDelete(key);
}

// Cache-aside pattern with multi-layer
export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try cache first
  const cached = await multiLayerGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const fresh = await fetchFn();
  await multiLayerSet(key, fresh, options);
  
  return fresh;
}
```

### LRU Cache with Size Limits

```typescript
// lib/cache/sized-lru-cache.ts
type SizedEntry<T> = {
  value: T;
  size: number;
  expiry?: number;
};

export class SizedLRUCache<K, V> {
  private cache: Map<K, SizedEntry<V>>;
  private currentSize: number = 0;
  private readonly maxSize: number; // bytes

  constructor(maxSizeBytes: number = 50 * 1024 * 1024) { // 50MB default
    this.cache = new Map();
    this.maxSize = maxSizeBytes;
  }

  private estimateSize(value: V): number {
    // Rough estimate for JSON-serializable objects
    return JSON.stringify(value).length * 2; // UTF-16
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;

    if (entry.expiry && Date.now() > entry.expiry) {
      this.delete(key);
      return undefined;
    }

    // Move to end
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    const size = this.estimateSize(value);
    
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Evict until we have space
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.delete(oldestKey);
      }
    }

    // Don't cache if single item exceeds max size
    if (size > this.maxSize) {
      return;
    }

    this.cache.set(key, {
      value,
      size,
      expiry: ttlMs ? Date.now() + ttlMs : undefined,
    });
    this.currentSize += size;
  }

  delete(key: K): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  getStats() {
    return {
      entries: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.maxSize,
      utilizationPercent: (this.currentSize / this.maxSize) * 100,
    };
  }
}
```

### Computed/Derived Cache

```typescript
// lib/cache/computed-cache.ts
import { LRUCache } from './lru-cache';

type ComputeFn<T> = () => T | Promise<T>;

class ComputedCache<K, V> {
  private cache: LRUCache<K, V>;
  private computing: Map<K, Promise<V>> = new Map();

  constructor(maxSize: number = 1000) {
    this.cache = new LRUCache(maxSize);
  }

  async getOrCompute(
    key: K,
    computeFn: ComputeFn<V>,
    ttlMs?: number
  ): Promise<V> {
    // Check cache
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Check if already computing (deduplication)
    const existing = this.computing.get(key);
    if (existing) {
      return existing;
    }

    // Start computation
    const computation = Promise.resolve(computeFn()).then((result) => {
      this.cache.set(key, result, ttlMs);
      this.computing.delete(key);
      return result;
    }).catch((error) => {
      this.computing.delete(key);
      throw error;
    });

    this.computing.set(key, computation);
    return computation;
  }

  invalidate(key: K): void {
    this.cache.delete(key);
  }
}

// Usage
const productScoreCache = new ComputedCache<string, number>();

export async function getProductScore(productId: string): Promise<number> {
  return productScoreCache.getOrCompute(
    productId,
    async () => {
      // Expensive computation
      const reviews = await prisma.review.findMany({
        where: { productId },
      });
      return calculateScore(reviews);
    },
    5 * 60 * 1000 // 5 minutes
  );
}
```

## Variants

### With Stale-While-Revalidate

```typescript
// lib/cache/swr-lru-cache.ts
import { LRUCache } from './lru-cache';

type SWREntry<T> = {
  value: T;
  staleAt: number;
  expireAt: number;
};

class SWRLRUCache<K, V> {
  private cache: LRUCache<K, SWREntry<V>>;

  constructor(maxSize: number = 1000) {
    this.cache = new LRUCache(maxSize);
  }

  get(key: K): { value: V; isStale: boolean } | undefined {
    const entry = this.cache.get(key) as SWREntry<V> | undefined;
    if (!entry) return undefined;

    const now = Date.now();
    
    // Expired - remove
    if (now > entry.expireAt) {
      this.cache.delete(key);
      return undefined;
    }

    return {
      value: entry.value,
      isStale: now > entry.staleAt,
    };
  }

  set(key: K, value: V, freshMs: number, staleMs: number): void {
    const now = Date.now();
    this.cache.set(key, {
      value,
      staleAt: now + freshMs,
      expireAt: now + freshMs + staleMs,
    });
  }
}
```

### With LRU-K Algorithm

```typescript
// lib/cache/lru-k-cache.ts
// LRU-K tracks K most recent accesses for better eviction decisions

type LRUKEntry<V> = {
  value: V;
  accesses: number[];
  expiry?: number;
};

class LRUKCache<K, V> {
  private cache: Map<K, LRUKEntry<V>>;
  private readonly maxSize: number;
  private readonly k: number;

  constructor(maxSize: number = 1000, k: number = 2) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.k = k;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Record access time
    entry.accesses.push(Date.now());
    if (entry.accesses.length > this.k) {
      entry.accesses.shift();
    }

    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOne();
    }

    this.cache.set(key, {
      value,
      accesses: [Date.now()],
    });
  }

  private evictOne(): void {
    let oldestKey: K | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      // Use K-th access time (or first if fewer than K accesses)
      const kthAccess = entry.accesses[0] ?? 0;
      if (kthAccess < oldestTime) {
        oldestTime = kthAccess;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      this.cache.delete(oldestKey);
    }
  }
}
```

## Anti-patterns

```typescript
// BAD: Using LRU cache for user-specific data in serverless
const userCache = new LRUCache(); // Lost between invocations!

// GOOD: Use Redis for persistent cross-invocation cache
const userCache = await redisGet(`user:${userId}`);

// BAD: No TTL on cache entries
memoryCache.set('data', largeObject); // May hold stale data forever

// GOOD: Always set TTL
memoryCache.set('data', largeObject, 5 * 60 * 1000); // 5 minutes

// BAD: Caching large objects without size limits
cache.set('huge', veryLargeArray); // May cause OOM

// GOOD: Use sized cache or limit what's cached
const sizedCache = new SizedLRUCache(50 * 1024 * 1024); // 50MB limit

// BAD: Not handling cache stampede
const data = cache.get(key) ?? await expensiveFetch(); // Parallel requests!

// GOOD: Use computing deduplication
const data = await computedCache.getOrCompute(key, expensiveFetch);
```

## Related Patterns

- `redis-cache.md` - Distributed caching with Redis
- `request-memoization.md` - Per-request memoization
- `cache-aside.md` - Cache-aside pattern
- `distributed-cache.md` - Multi-region caching

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial LRU cache pattern
