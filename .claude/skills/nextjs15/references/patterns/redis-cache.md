---
id: pt-redis-cache
name: Redis Cache
version: 2.0.0
layer: L5
category: cache
description: Redis caching with Upstash for serverless-compatible caching in Next.js 15
tags: [cache, redis, cache]
composes: []
dependencies:
  @upstash/redis: "^1.34.0"
formula: "Upstash Redis + Connection Singleton + Type-safe Operations + Tag Tracking = Serverless-ready caching"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Redis Cache Pattern

## When to Use

- **Serverless deployments**: Vercel, AWS Lambda, Cloudflare Workers
- **Session storage**: User sessions with TTL-based expiry
- **Rate limiting**: API rate limiting with sliding windows
- **Leaderboards**: Sorted sets for rankings
- **Pub/Sub**: Real-time notifications and events
- **Distributed locks**: Coordination between serverless instances

**Avoid when:**
- Simple in-memory caching suffices (use LRU cache)
- Latency-critical paths where Redis round-trip adds overhead
- Cost-sensitive with low traffic (Redis has baseline costs)
- Data that fits entirely in Next.js data cache

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   Next.js App    |     |   Upstash Redis  |     |   Database       |
|   (Serverless)   |     |   (REST API)     |     |   (Prisma)       |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  getRedis() singleton  |                        |
         +----------------------->|                        |
         |                        |                        |
         |  cacheGet<T>(key)      |                        |
         +----------------------->|                        |
         |                        |                        |
         |  HIT: return data      |                        |
         |<-----------------------+                        |
         |                        |                        |
         |  MISS: query DB        |                        |
         +----------------------------------------------->|
         |                        |                        |
         |  cacheSet(key, data)   |<-----------------------+
         +----------------------->|                        |
         |                        |                        |
         |  Tag tracking          |                        |
         |  sadd('tag:X', key)    |                        |
         +----------------------->|                        |
```

## Overview

Redis caching with Upstash for serverless-compatible caching in Next.js 15. Implements connection pooling, TTL strategies, and type-safe cache operations.

## Implementation

### Redis Client Setup with Upstash

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

// Singleton pattern for connection reuse
let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// Alternative: Direct REST API for edge compatibility
export const redisRest = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Type-Safe Cache Operations

```typescript
// lib/cache/redis-cache.ts
import { getRedis } from '@/lib/redis';

type CacheOptions = {
  ttl?: number; // seconds
  tags?: string[];
};

const DEFAULT_TTL = 3600; // 1 hour

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const data = await redis.get<T>(key);
  return data;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const redis = getRedis();
  const { ttl = DEFAULT_TTL, tags = [] } = options;

  // Set the main value
  await redis.set(key, value, { ex: ttl });

  // Track tags for invalidation
  if (tags.length > 0) {
    const pipeline = redis.pipeline();
    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, key);
      pipeline.expire(`tag:${tag}`, ttl + 60); // Tags expire slightly after values
    }
    await pipeline.exec();
  }
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

export async function cacheInvalidateTag(tag: string): Promise<void> {
  const redis = getRedis();
  const keys = await redis.smembers(`tag:${tag}`);
  
  if (keys.length > 0) {
    const pipeline = redis.pipeline();
    for (const key of keys) {
      pipeline.del(key);
    }
    pipeline.del(`tag:${tag}`);
    await pipeline.exec();
  }
}
```

### Cache-Aside Pattern Implementation

```typescript
// lib/cache/cache-aside.ts
import { cacheGet, cacheSet } from './redis-cache';

type FetchFn<T> = () => Promise<T>;

export async function cacheAside<T>(
  key: string,
  fetchFn: FetchFn<T>,
  options: {
    ttl?: number;
    tags?: string[];
    staleWhileRevalidate?: boolean;
  } = {}
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  
  if (cached !== null) {
    // Optionally refresh in background
    if (options.staleWhileRevalidate) {
      refreshInBackground(key, fetchFn, options);
    }
    return cached;
  }

  // Cache miss - fetch fresh data
  const fresh = await fetchFn();
  await cacheSet(key, fresh, {
    ttl: options.ttl,
    tags: options.tags,
  });

  return fresh;
}

async function refreshInBackground<T>(
  key: string,
  fetchFn: FetchFn<T>,
  options: { ttl?: number; tags?: string[] }
): Promise<void> {
  // Fire and forget - don't await
  fetchFn()
    .then((fresh) => cacheSet(key, fresh, options))
    .catch(console.error);
}
```

### Data Layer with Redis Caching

```typescript
// lib/data/products.ts
import { prisma } from '@/lib/prisma';
import { cacheAside, cacheInvalidateTag } from '@/lib/cache';

export async function getProduct(id: string) {
  return cacheAside(
    `product:${id}`,
    async () => {
      return prisma.product.findUnique({
        where: { id },
        include: { category: true, images: true },
      });
    },
    {
      ttl: 3600,
      tags: ['products', `product:${id}`],
    }
  );
}

export async function getProductsByCategory(categoryId: string) {
  return cacheAside(
    `products:category:${categoryId}`,
    async () => {
      return prisma.product.findMany({
        where: { categoryId },
        orderBy: { createdAt: 'desc' },
      });
    },
    {
      ttl: 1800,
      tags: ['products', `category:${categoryId}`],
    }
  );
}

export async function updateProduct(id: string, data: ProductUpdateInput) {
  const product = await prisma.product.update({
    where: { id },
    data,
  });

  // Invalidate related caches
  await Promise.all([
    cacheInvalidateTag(`product:${id}`),
    cacheInvalidateTag(`category:${product.categoryId}`),
  ]);

  return product;
}
```

### Server Action with Cache Invalidation

```typescript
// app/actions/products.ts
'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { cacheInvalidateTag } from '@/lib/cache/redis-cache';

export async function createProduct(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    price: parseFloat(formData.get('price') as string),
    categoryId: formData.get('categoryId') as string,
  };

  const product = await prisma.product.create({ data });

  // Invalidate both Redis and Next.js caches
  await cacheInvalidateTag('products');
  await cacheInvalidateTag(`category:${data.categoryId}`);
  revalidateTag('products');

  return product;
}
```

### Rate Limiting with Redis

```typescript
// lib/rate-limit.ts
import { getRedis } from '@/lib/redis';

type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60 // seconds
): Promise<RateLimitResult> {
  const redis = getRedis();
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - window * 1000;

  // Use sorted set for sliding window
  const pipeline = redis.pipeline();
  
  // Remove old entries
  pipeline.zremrangebyscore(key, 0, windowStart);
  // Add current request
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  // Count requests in window
  pipeline.zcard(key);
  // Set expiry
  pipeline.expire(key, window);

  const results = await pipeline.exec();
  const count = results[2] as number;

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: Math.ceil(window - (now % (window * 1000)) / 1000),
  };
}
```

### Session Storage with Redis

```typescript
// lib/session-store.ts
import { getRedis } from '@/lib/redis';
import { nanoid } from 'nanoid';

type SessionData = {
  userId: string;
  email: string;
  role: string;
  metadata?: Record<string, unknown>;
};

const SESSION_TTL = 86400 * 7; // 7 days

export async function createSession(data: SessionData): Promise<string> {
  const redis = getRedis();
  const sessionId = nanoid(32);
  
  await redis.set(`session:${sessionId}`, data, { ex: SESSION_TTL });
  
  // Track user's sessions
  await redis.sadd(`user-sessions:${data.userId}`, sessionId);
  await redis.expire(`user-sessions:${data.userId}`, SESSION_TTL);

  return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const redis = getRedis();
  return redis.get<SessionData>(`session:${sessionId}`);
}

export async function refreshSession(sessionId: string): Promise<void> {
  const redis = getRedis();
  await redis.expire(`session:${sessionId}`, SESSION_TTL);
}

export async function destroySession(sessionId: string): Promise<void> {
  const redis = getRedis();
  const session = await getSession(sessionId);
  
  if (session) {
    await redis.srem(`user-sessions:${session.userId}`, sessionId);
  }
  await redis.del(`session:${sessionId}`);
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  const redis = getRedis();
  const sessionIds = await redis.smembers(`user-sessions:${userId}`);
  
  if (sessionIds.length > 0) {
    const pipeline = redis.pipeline();
    for (const sessionId of sessionIds) {
      pipeline.del(`session:${sessionId}`);
    }
    pipeline.del(`user-sessions:${userId}`);
    await pipeline.exec();
  }
}
```

### Middleware for Cached Data

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { redisRest } from '@/lib/redis';

export async function middleware(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const key = `ratelimit:${ip}:${request.nextUrl.pathname}`;
  
  const count = await redisRest.incr(key);
  if (count === 1) {
    await redisRest.expire(key, 60);
  }
  
  if (count > 100) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Cache Warming on Deployment

```typescript
// scripts/warm-cache.ts
import { prisma } from '@/lib/prisma';
import { cacheSet } from '@/lib/cache/redis-cache';

async function warmCache() {
  console.log('Starting cache warming...');

  // Warm product cache
  const products = await prisma.product.findMany({
    include: { category: true },
    take: 100,
    orderBy: { views: 'desc' },
  });

  for (const product of products) {
    await cacheSet(`product:${product.id}`, product, {
      ttl: 3600,
      tags: ['products', `product:${product.id}`],
    });
  }
  console.log(`Warmed ${products.length} product caches`);

  // Warm category cache
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });

  for (const category of categories) {
    await cacheSet(`category:${category.id}`, category, {
      ttl: 7200,
      tags: ['categories'],
    });
  }
  console.log(`Warmed ${categories.length} category caches`);

  console.log('Cache warming complete!');
}

warmCache().catch(console.error);
```

## Variants

### With Connection Pooling (ioredis)

```typescript
// lib/redis-pool.ts
import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
```

### With JSON Serialization

```typescript
// lib/cache/json-cache.ts
import { getRedis } from '@/lib/redis';
import superjson from 'superjson';

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const data = await redis.get<string>(key);
  if (!data) return null;
  return superjson.parse<T>(data);
}

export async function cacheSetJson<T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<void> {
  const redis = getRedis();
  const serialized = superjson.stringify(value);
  await redis.set(key, serialized, { ex: ttl });
}
```

## Anti-patterns

```typescript
// BAD: Creating new connection per request
async function getData() {
  const redis = new Redis({ url: '...' }); // New connection each time!
  return redis.get('key');
}

// GOOD: Reuse connection
async function getData() {
  const redis = getRedis(); // Singleton
  return redis.get('key');
}

// BAD: No error handling
const data = await redis.get('key');

// GOOD: Handle connection errors
try {
  const data = await redis.get('key');
} catch (error) {
  console.error('Redis error:', error);
  // Fallback to database
  return fetchFromDatabase();
}

// BAD: Storing large objects
await redis.set('user', hugeUserObjectWithRelations);

// GOOD: Store only necessary data
await redis.set('user:123', { id: user.id, email: user.email });
```

## Related Patterns

- `cache-aside.md` - Lazy loading cache pattern
- `cache-invalidation.md` - Cache invalidation strategies
- `distributed-cache.md` - Multi-region caching
- `rate-limiting.md` - Rate limiting with Redis

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial Redis cache pattern with Upstash
