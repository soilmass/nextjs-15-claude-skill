---
id: pt-cache-stampede
name: Cache Stampede Prevention
version: 2.0.0
layer: L5
category: cache
description: Preventing thundering herd/cache stampede problems in Next.js 15 applications
tags: [cache, stampede, lock, xfetch, coalescing, semaphore]
composes: []
dependencies: []
formula: "Distributed Lock + XFetch Algorithm + Staggered TTL + Request Coalescing = Stampede-proof caching"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Cache Stampede Prevention Pattern

## When to Use

- **High-traffic endpoints**: Popular product pages, homepage
- **Expensive queries**: Complex aggregations, joins, computations
- **Synchronized expiry**: Many cache keys expiring at once
- **Cold start scenarios**: After deployment or cache flush
- **Flash sales**: Sudden traffic spikes to specific pages
- **Viral content**: Unexpectedly popular content

**Avoid when:**
- Low-traffic applications where stampede is unlikely
- Data that can tolerate occasional slow responses
- Already using sufficient cache warming
- Simple, fast database queries

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|  Concurrent      |     |  Stampede        |     |   Data Source    |
|  Requests (N)    |     |  Prevention      |     |   (Database)     |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  Request 1 (Leader)    |                        |
         +----------------------->|  Acquire Lock          |
         |                        +----------------------->|
         |  Request 2-N (Wait)    |                        |
         +----------------------->|  Lock Exists           |
         |                        |  Wait for cache...     |
         |                        |                        |
         |                        |  Fetch Data            |
         |                        +----------------------->|
         |                        |<-----------------------+
         |                        |  cacheSet() + Release  |
         |                        |                        |
         |<-----------------------+  All requests served   |
         |  Cached response       |  from single fetch     |
         +------------------------+------------------------+
```

## Overview

Preventing thundering herd/cache stampede problems in Next.js 15 applications. When cache expires, multiple concurrent requests can overwhelm the database. This pattern uses locks, staggering, and probabilistic techniques to prevent this.

## Implementation

### Lock-Based Prevention

```typescript
// lib/cache/stampede-lock.ts
import { getRedis } from '@/lib/redis';
import { cacheGet, cacheSet } from './redis-cache';

type StampedeOptions = {
  ttl: number;
  lockTTL?: number;     // Lock timeout in seconds
  waitTimeout?: number; // Max time to wait for lock in ms
  retryDelay?: number;  // Delay between lock checks in ms
};

export async function cacheWithLock<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: StampedeOptions
): Promise<T> {
  const {
    ttl,
    lockTTL = 10,
    waitTimeout = 5000,
    retryDelay = 50,
  } = options;

  const redis = getRedis();
  const lockKey = `lock:${key}`;

  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Try to acquire lock
  const lockValue = `${Date.now()}-${Math.random()}`;
  const acquired = await redis.set(lockKey, lockValue, {
    nx: true,
    ex: lockTTL,
  });

  if (acquired) {
    // We got the lock - fetch and cache
    try {
      const data = await fetchFn();
      await cacheSet(key, data, { ttl });
      return data;
    } finally {
      // Release lock only if we still own it
      const currentLock = await redis.get(lockKey);
      if (currentLock === lockValue) {
        await redis.del(lockKey);
      }
    }
  }

  // Another process is fetching - wait for cache
  const startTime = Date.now();
  while (Date.now() - startTime < waitTimeout) {
    await sleep(retryDelay);
    
    const cached = await cacheGet<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Check if lock is still held
    const lockExists = await redis.exists(lockKey);
    if (!lockExists) {
      // Lock released but cache empty - try again
      return cacheWithLock(key, fetchFn, options);
    }
  }

  // Timeout - fetch ourselves as fallback
  console.warn(`Lock wait timeout for ${key}, fetching directly`);
  return fetchFn();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### Probabilistic Early Expiration (XFetch)

```typescript
// lib/cache/xfetch.ts
import { cacheGet, cacheSet } from './redis-cache';

type XFetchData<T> = {
  data: T;
  delta: number;    // Time to compute in ms
  expiry: number;   // Absolute expiry timestamp
};

type XFetchOptions = {
  ttl: number;
  beta?: number;    // Controls early recomputation probability (default: 1)
};

export async function xfetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: XFetchOptions
): Promise<T> {
  const { ttl, beta = 1 } = options;

  const cached = await cacheGet<XFetchData<T>>(key);

  if (cached) {
    const now = Date.now();
    
    // XFetch algorithm: probabilistic early recomputation
    // Probability increases as we approach expiry
    const remaining = cached.expiry - now;
    const probability = Math.exp((-cached.delta * beta) / Math.max(remaining, 1));
    
    if (Math.random() >= probability) {
      // Return cached value
      return cached.data;
    }
    
    // Probabilistically chosen to recompute early
    console.log(`XFetch: Early recomputation triggered for ${key}`);
  }

  // Fetch with timing
  const startTime = Date.now();
  const data = await fetchFn();
  const delta = Date.now() - startTime;

  const xfetchData: XFetchData<T> = {
    data,
    delta,
    expiry: Date.now() + ttl * 1000,
  };

  await cacheSet(key, xfetchData, { ttl: ttl + 60 }); // Extra buffer

  return data;
}
```

### Staggered TTL

```typescript
// lib/cache/staggered-ttl.ts
import { cacheSet } from './redis-cache';

type StaggerOptions = {
  baseTTL: number;      // Base TTL in seconds
  jitterPercent?: number; // Percentage to vary TTL (default: 10)
};

export function getStaggeredTTL(options: StaggerOptions): number {
  const { baseTTL, jitterPercent = 10 } = options;
  
  // Add random jitter to prevent synchronized expiration
  const jitterRange = baseTTL * (jitterPercent / 100);
  const jitter = (Math.random() - 0.5) * 2 * jitterRange;
  
  return Math.round(baseTTL + jitter);
}

export async function cacheWithStaggeredTTL<T>(
  key: string,
  value: T,
  options: StaggerOptions & { tags?: string[] }
): Promise<void> {
  const ttl = getStaggeredTTL(options);
  await cacheSet(key, value, { ttl, tags: options.tags });
}

// Usage
export async function cacheProducts(products: Product[]): Promise<void> {
  await Promise.all(
    products.map((product) =>
      cacheWithStaggeredTTL(
        `product:${product.id}`,
        product,
        { baseTTL: 3600, jitterPercent: 15 } // 3060-3540 seconds
      )
    )
  );
}
```

### Request Coalescing

```typescript
// lib/cache/coalesce.ts
type PendingRequest<T> = {
  promise: Promise<T>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest<unknown>>();
const COALESCE_WINDOW = 100; // ms

export async function coalesceRequests<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const pending = pendingRequests.get(key);

  // If there's a recent pending request, wait for it
  if (pending && now - pending.timestamp < COALESCE_WINDOW) {
    return pending.promise as Promise<T>;
  }

  // Start new request
  const promise = (async () => {
    try {
      return await fetchFn();
    } finally {
      // Clean up after a delay to allow late-arriving requests to coalesce
      setTimeout(() => {
        const current = pendingRequests.get(key);
        if (current?.promise === promise) {
          pendingRequests.delete(key);
        }
      }, COALESCE_WINDOW);
    }
  })();

  pendingRequests.set(key, { promise, timestamp: now });

  return promise;
}

// Combined with cache
export async function cachedWithCoalescing<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Coalesce concurrent requests
  return coalesceRequests(key, async () => {
    // Double-check cache after acquiring "slot"
    const rechecked = await cacheGet<T>(key);
    if (rechecked !== null) {
      return rechecked;
    }

    const data = await fetchFn();
    await cacheSet(key, data, { ttl });
    return data;
  });
}
```

### Semaphore-Based Rate Limiting

```typescript
// lib/cache/semaphore-cache.ts
import { getRedis } from '@/lib/redis';

class DistributedSemaphore {
  private redis = getRedis();
  private readonly maxConcurrent: number;
  private readonly key: string;
  private readonly ttl: number;

  constructor(key: string, maxConcurrent: number, ttl: number = 30) {
    this.key = `semaphore:${key}`;
    this.maxConcurrent = maxConcurrent;
    this.ttl = ttl;
  }

  async acquire(): Promise<string | null> {
    const id = `${Date.now()}-${Math.random()}`;
    const now = Date.now();

    // Clean expired entries
    await this.redis.zremrangebyscore(this.key, 0, now - this.ttl * 1000);

    // Check current count
    const count = await this.redis.zcard(this.key);
    
    if (count >= this.maxConcurrent) {
      return null; // Semaphore full
    }

    // Try to add
    await this.redis.zadd(this.key, { score: now, member: id });
    await this.redis.expire(this.key, this.ttl);

    // Verify we didn't exceed (race condition check)
    const rank = await this.redis.zrank(this.key, id);
    if (rank !== null && rank >= this.maxConcurrent) {
      await this.redis.zrem(this.key, id);
      return null;
    }

    return id;
  }

  async release(id: string): Promise<void> {
    await this.redis.zrem(this.key, id);
  }
}

export async function cacheWithSemaphore<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { ttl: number; maxConcurrent?: number; waitTimeout?: number }
): Promise<T> {
  const { ttl, maxConcurrent = 3, waitTimeout = 5000 } = options;

  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const semaphore = new DistributedSemaphore(`fetch:${key}`, maxConcurrent);
  const startTime = Date.now();

  while (Date.now() - startTime < waitTimeout) {
    // Check cache again
    const rechecked = await cacheGet<T>(key);
    if (rechecked !== null) {
      return rechecked;
    }

    // Try to acquire semaphore
    const permitId = await semaphore.acquire();
    
    if (permitId) {
      try {
        // Double-check cache
        const finalCheck = await cacheGet<T>(key);
        if (finalCheck !== null) {
          return finalCheck;
        }

        // Fetch and cache
        const data = await fetchFn();
        await cacheSet(key, data, { ttl });
        return data;
      } finally {
        await semaphore.release(permitId);
      }
    }

    // Wait before retry
    await sleep(50);
  }

  // Timeout - fetch without semaphore
  console.warn(`Semaphore timeout for ${key}`);
  return fetchFn();
}
```

### Circuit Breaker Integration

```typescript
// lib/cache/circuit-breaker-cache.ts
import { CircuitBreaker, CircuitState } from '@/lib/circuit-breaker';

const originCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
});

export async function cacheWithCircuitBreaker<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { ttl: number; staleGracePeriod?: number }
): Promise<T | null> {
  const { ttl, staleGracePeriod = 300 } = options;

  // Try cache first
  const cached = await cacheGet<{ data: T; cachedAt: number }>(key);
  
  if (cached) {
    const age = (Date.now() - cached.cachedAt) / 1000;
    
    // Fresh cache - return immediately
    if (age < ttl) {
      return cached.data;
    }

    // Stale cache - check circuit breaker
    if (originCircuitBreaker.getState() === CircuitState.Open) {
      // Origin is down - serve stale if within grace period
      if (age < ttl + staleGracePeriod) {
        console.log(`Serving stale cache for ${key} due to circuit breaker`);
        return cached.data;
      }
    }
  }

  // Try to fetch from origin
  try {
    const data = await originCircuitBreaker.execute(fetchFn);
    await cacheSet(key, { data, cachedAt: Date.now() }, { 
      ttl: ttl + staleGracePeriod 
    });
    return data;
  } catch (error) {
    // If we have stale data, serve it
    if (cached) {
      console.log(`Serving stale cache for ${key} after fetch error`);
      return cached.data;
    }
    throw error;
  }
}
```

### Complete Stampede-Proof Cache

```typescript
// lib/cache/stampede-proof.ts
import { cacheGet, cacheSet } from './redis-cache';
import { acquireLock, releaseLock } from './distributed-lock';

type StampedeProofOptions = {
  ttl: number;
  lockTTL?: number;
  beta?: number;           // XFetch beta parameter
  jitterPercent?: number;  // TTL jitter
  maxConcurrent?: number;  // Semaphore limit
};

type CachedValue<T> = {
  data: T;
  delta: number;
  expiry: number;
};

export async function stampedeProofCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: StampedeProofOptions
): Promise<T> {
  const {
    ttl,
    lockTTL = 10,
    beta = 1,
    jitterPercent = 10,
  } = options;

  // Check cache with XFetch probabilistic expiry
  const cached = await cacheGet<CachedValue<T>>(key);
  
  if (cached) {
    const now = Date.now();
    const remaining = cached.expiry - now;
    
    if (remaining > 0) {
      // XFetch: probabilistic early recomputation
      const probability = Math.exp((-cached.delta * beta) / remaining);
      
      if (Math.random() >= probability) {
        return cached.data;
      }
      
      // Chosen for early recomputation - try to get lock
      const lockValue = await acquireLock(key, { ttl: lockTTL, retries: 0 });
      
      if (!lockValue) {
        // Another process is recomputing - return stale
        return cached.data;
      }

      try {
        return await refreshCache(key, fetchFn, ttl, jitterPercent);
      } finally {
        await releaseLock(key, lockValue);
      }
    }
  }

  // Cache miss or expired - need to fetch
  const lockValue = await acquireLock(key, { ttl: lockTTL, retries: 10 });
  
  if (!lockValue) {
    // Couldn't get lock - wait and check cache
    await sleep(100);
    const rechecked = await cacheGet<CachedValue<T>>(key);
    if (rechecked) return rechecked.data;
    
    // Still nothing - fetch directly
    return fetchFn();
  }

  try {
    // Double-check cache
    const rechecked = await cacheGet<CachedValue<T>>(key);
    if (rechecked && rechecked.expiry > Date.now()) {
      return rechecked.data;
    }

    return await refreshCache(key, fetchFn, ttl, jitterPercent);
  } finally {
    await releaseLock(key, lockValue);
  }
}

async function refreshCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  baseTTL: number,
  jitterPercent: number
): Promise<T> {
  const startTime = Date.now();
  const data = await fetchFn();
  const delta = Date.now() - startTime;

  // Calculate staggered TTL
  const jitterRange = baseTTL * (jitterPercent / 100);
  const jitter = (Math.random() - 0.5) * 2 * jitterRange;
  const actualTTL = Math.round(baseTTL + jitter);

  const cached: CachedValue<T> = {
    data,
    delta,
    expiry: Date.now() + actualTTL * 1000,
  };

  await cacheSet(key, cached, { ttl: actualTTL + 60 });

  return data;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

## Anti-patterns

```typescript
// BAD: No stampede protection
const data = await cacheGet(key) ?? await expensiveFetch();

// GOOD: Use lock or coalescing
const data = await cacheWithLock(key, expensiveFetch, { ttl: 3600 });

// BAD: Infinite lock wait
while (true) {
  const lock = await tryAcquireLock(key);
  if (lock) break;
  await sleep(100);
}

// GOOD: Timeout and fallback
const lock = await acquireLock(key, { retries: 10, timeout: 5000 });
if (!lock) return fetchFn(); // Fallback

// BAD: Same TTL for all keys
keys.forEach(k => cacheSet(k, data, { ttl: 3600 })); // All expire together!

// GOOD: Staggered TTL
keys.forEach(k => cacheSet(k, data, { ttl: getStaggeredTTL({ baseTTL: 3600 }) }));
```

## Related Patterns

- `distributed-cache.md` - Multi-region caching
- `cache-aside.md` - Cache-aside pattern
- `rate-limiting.md` - Rate limiting
- `circuit-breaker.md` - Circuit breaker pattern

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial cache stampede prevention pattern
