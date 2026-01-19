---
id: pt-distributed-cache
name: Distributed Cache Pattern
version: 2.0.0
layer: L5
category: cache
description: Multi-region cache synchronization for globally distributed Next.js 15 applications
tags: [cache, distributed, redis, multi-region, replication]
composes: []
dependencies:
  @upstash/redis: "^1.34.0"
formula: "Multi-Region Redis + Write Replication + Read-Your-Writes + Geo Routing = Global low-latency caching"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Distributed Cache Pattern

## When to Use

- **Global user base**: Users distributed across continents
- **Edge deployments**: Vercel Edge Functions, Cloudflare Workers
- **Low-latency requirements**: Sub-100ms response times globally
- **High availability**: Resilience to regional outages
- **Multi-tenant SaaS**: Per-tenant data isolation across regions
- **CDN origin**: Backend for edge-cached content

**Avoid when:**
- Single-region deployments
- Strong consistency requirements (use single primary)
- Cost-sensitive applications (multi-region adds expense)
- Simple applications without global reach

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   US-EAST-1      |     |   EU-WEST-1      |     |   AP-NE-1        |
|   Redis Primary  |     |   Redis Replica  |     |   Redis Replica  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  Write Replication     |                        |
         +----------------------->|                        |
         +----------------------------------------------->|
         |                        |                        |
+--------+---------+     +--------+---------+     +--------+---------+
|   Edge Function  |     |   Edge Function  |     |   Edge Function  |
|   (US Users)     |     |   (EU Users)     |     |   (APAC Users)   |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  Read from local       |  Read from local       |
         |  replica               |  replica               |
         +------------------------+------------------------+
         |                        |                        |
         |  getLocalRedis()       |  getLocalRedis()       |
         +------------------------+------------------------+
```

## Overview

Multi-region cache synchronization for globally distributed Next.js 15 applications. Implements cache replication, consistency strategies, and region-aware caching.

## Implementation

### Multi-Region Redis Setup

```typescript
// lib/cache/distributed-redis.ts
import { Redis } from '@upstash/redis';

type Region = 'us-east-1' | 'eu-west-1' | 'ap-northeast-1';

const redisInstances: Record<Region, Redis> = {
  'us-east-1': new Redis({
    url: process.env.UPSTASH_REDIS_US_EAST_URL!,
    token: process.env.UPSTASH_REDIS_US_EAST_TOKEN!,
  }),
  'eu-west-1': new Redis({
    url: process.env.UPSTASH_REDIS_EU_WEST_URL!,
    token: process.env.UPSTASH_REDIS_EU_WEST_TOKEN!,
  }),
  'ap-northeast-1': new Redis({
    url: process.env.UPSTASH_REDIS_AP_NE_URL!,
    token: process.env.UPSTASH_REDIS_AP_NE_TOKEN!,
  }),
};

// Get current region from environment or request
function getCurrentRegion(): Region {
  const region = process.env.VERCEL_REGION ?? 'us-east-1';
  
  // Map Vercel regions to our cache regions
  if (region.startsWith('iad') || region.startsWith('cle')) return 'us-east-1';
  if (region.startsWith('dub') || region.startsWith('lhr')) return 'eu-west-1';
  if (region.startsWith('hnd') || region.startsWith('kix')) return 'ap-northeast-1';
  
  return 'us-east-1'; // Default
}

export function getLocalRedis(): Redis {
  return redisInstances[getCurrentRegion()];
}

export function getAllRedisInstances(): Redis[] {
  return Object.values(redisInstances);
}

export function getRedisForRegion(region: Region): Redis {
  return redisInstances[region];
}
```

### Write-Through Replication

```typescript
// lib/cache/distributed-write.ts
import { getLocalRedis, getAllRedisInstances } from './distributed-redis';

type CacheOptions = {
  ttl?: number;
  replicateGlobally?: boolean;
};

export async function distributedSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = 3600, replicateGlobally = true } = options;
  const serialized = JSON.stringify(value);

  if (replicateGlobally) {
    // Write to all regions in parallel
    const instances = getAllRedisInstances();
    await Promise.all(
      instances.map((redis) => redis.set(key, serialized, { ex: ttl }))
    );
  } else {
    // Write only to local region
    const local = getLocalRedis();
    await local.set(key, serialized, { ex: ttl });
  }
}

export async function distributedGet<T>(key: string): Promise<T | null> {
  const local = getLocalRedis();
  const data = await local.get<string>(key);
  
  if (!data) return null;
  
  return JSON.parse(data) as T;
}

export async function distributedDelete(key: string): Promise<void> {
  // Delete from all regions
  const instances = getAllRedisInstances();
  await Promise.all(instances.map((redis) => redis.del(key)));
}
```

### Eventually Consistent Cache

```typescript
// lib/cache/eventual-consistency.ts
import { getLocalRedis, getRedisForRegion } from './distributed-redis';

type CachedValue<T> = {
  data: T;
  timestamp: number;
  region: string;
};

const REPLICATION_DELAY = 100; // ms

export async function eventualSet<T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<void> {
  const currentRegion = process.env.VERCEL_REGION ?? 'us-east-1';
  const local = getLocalRedis();

  const cached: CachedValue<T> = {
    data: value,
    timestamp: Date.now(),
    region: currentRegion,
  };

  // Write to local immediately
  await local.set(key, JSON.stringify(cached), { ex: ttl });

  // Async replication to other regions (fire and forget)
  replicateToOtherRegions(key, cached, ttl).catch(console.error);
}

async function replicateToOtherRegions<T>(
  key: string,
  value: CachedValue<T>,
  ttl: number
): Promise<void> {
  const regions: Array<'us-east-1' | 'eu-west-1' | 'ap-northeast-1'> = [
    'us-east-1',
    'eu-west-1',
    'ap-northeast-1',
  ];

  const otherRegions = regions.filter((r) => r !== value.region);

  // Small delay to reduce contention
  await new Promise((resolve) => setTimeout(resolve, REPLICATION_DELAY));

  await Promise.allSettled(
    otherRegions.map(async (region) => {
      const redis = getRedisForRegion(region);
      
      // Only update if our data is newer
      const existing = await redis.get<string>(key);
      if (existing) {
        const parsed = JSON.parse(existing) as CachedValue<T>;
        if (parsed.timestamp >= value.timestamp) {
          return; // Existing data is newer or equal
        }
      }
      
      await redis.set(key, JSON.stringify(value), { ex: ttl });
    })
  );
}

export async function eventualGet<T>(key: string): Promise<T | null> {
  const local = getLocalRedis();
  const data = await local.get<string>(key);
  
  if (!data) return null;
  
  const cached = JSON.parse(data) as CachedValue<T>;
  return cached.data;
}
```

### Read-Your-Writes Consistency

```typescript
// lib/cache/read-your-writes.ts
import { cookies } from 'next/headers';
import { distributedGet, distributedSet } from './distributed-write';

type WriteMarker = {
  key: string;
  timestamp: number;
  region: string;
};

const WRITE_MARKER_COOKIE = 'cache_writes';
const CONSISTENCY_WINDOW = 5000; // 5 seconds

export async function consistentSet<T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<void> {
  const region = process.env.VERCEL_REGION ?? 'us-east-1';
  
  await distributedSet(key, value, { ttl, replicateGlobally: true });

  // Track write for read-your-writes consistency
  const cookieStore = await cookies();
  const existingMarkers = cookieStore.get(WRITE_MARKER_COOKIE);
  const markers: WriteMarker[] = existingMarkers
    ? JSON.parse(existingMarkers.value)
    : [];

  // Add new marker
  markers.push({ key, timestamp: Date.now(), region });

  // Clean old markers
  const now = Date.now();
  const validMarkers = markers.filter(
    (m) => now - m.timestamp < CONSISTENCY_WINDOW
  );

  cookieStore.set(WRITE_MARKER_COOKIE, JSON.stringify(validMarkers), {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60,
  });
}

export async function consistentGet<T>(key: string): Promise<T | null> {
  const cookieStore = await cookies();
  const markersRaw = cookieStore.get(WRITE_MARKER_COOKIE);
  
  if (markersRaw) {
    const markers: WriteMarker[] = JSON.parse(markersRaw.value);
    const recentWrite = markers.find(
      (m) => m.key === key && Date.now() - m.timestamp < CONSISTENCY_WINDOW
    );

    if (recentWrite) {
      // Read from the region where write occurred
      const sourceRedis = getRedisForRegion(recentWrite.region as any);
      const data = await sourceRedis.get<string>(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    }
  }

  // Normal read from local region
  return distributedGet<T>(key);
}
```

### Cache Synchronization via Pub/Sub

```typescript
// lib/cache/cache-sync.ts
import { Redis } from '@upstash/redis';

type SyncMessage = {
  action: 'set' | 'delete' | 'invalidate';
  key: string;
  value?: string;
  ttl?: number;
  sourceRegion: string;
  timestamp: number;
};

const SYNC_CHANNEL = 'cache:sync';

// Publisher
export async function publishCacheUpdate(
  action: 'set' | 'delete' | 'invalidate',
  key: string,
  value?: unknown,
  ttl?: number
): Promise<void> {
  const redis = getLocalRedis();
  
  const message: SyncMessage = {
    action,
    key,
    value: value ? JSON.stringify(value) : undefined,
    ttl,
    sourceRegion: process.env.VERCEL_REGION ?? 'unknown',
    timestamp: Date.now(),
  };

  await redis.publish(SYNC_CHANNEL, JSON.stringify(message));
}

// Subscriber (run as background process)
export async function startCacheSyncSubscriber(): Promise<void> {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL!,
    token: process.env.UPSTASH_REDIS_TOKEN!,
  });

  const currentRegion = process.env.VERCEL_REGION ?? 'unknown';

  // Note: Upstash uses HTTP-based pub/sub, implementation varies
  // This is a conceptual example
  while (true) {
    try {
      const messages = await redis.lpop<string>(`${SYNC_CHANNEL}:${currentRegion}`, 10);
      
      if (messages) {
        for (const msgStr of Array.isArray(messages) ? messages : [messages]) {
          const message: SyncMessage = JSON.parse(msgStr);
          
          // Skip our own messages
          if (message.sourceRegion === currentRegion) continue;
          
          await handleSyncMessage(message);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Cache sync error:', error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function handleSyncMessage(message: SyncMessage): Promise<void> {
  const local = getLocalRedis();

  switch (message.action) {
    case 'set':
      if (message.value) {
        await local.set(message.key, message.value, { ex: message.ttl });
      }
      break;
    case 'delete':
    case 'invalidate':
      await local.del(message.key);
      break;
  }
}
```

### Region-Aware Caching

```typescript
// lib/cache/region-aware.ts
import { headers } from 'next/headers';

type RegionConfig = {
  cacheRegion: string;
  ttl: number;
  replicateGlobally: boolean;
};

const regionConfigs: Record<string, RegionConfig> = {
  'us-east-1': {
    cacheRegion: 'us-east-1',
    ttl: 3600,
    replicateGlobally: true,
  },
  'eu-west-1': {
    cacheRegion: 'eu-west-1',
    ttl: 3600,
    replicateGlobally: true,
  },
  'ap-northeast-1': {
    cacheRegion: 'ap-northeast-1',
    ttl: 1800, // Shorter TTL for APAC
    replicateGlobally: false, // Local only for performance
  },
};

export function getRegionConfig(): RegionConfig {
  const region = process.env.VERCEL_REGION ?? 'us-east-1';
  return regionConfigs[region] ?? regionConfigs['us-east-1'];
}

export async function regionAwareCache<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const config = getRegionConfig();
  const cacheKey = `${config.cacheRegion}:${key}`;

  // Try local cache first
  const cached = await distributedGet<T>(cacheKey);
  if (cached) return cached;

  // Fetch and cache
  const data = await fetchFn();
  await distributedSet(cacheKey, data, {
    ttl: config.ttl,
    replicateGlobally: config.replicateGlobally,
  });

  return data;
}

// Geo-based cache key
export async function geoCacheKey(baseKey: string): Promise<string> {
  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country') ?? 'US';
  const region = headersList.get('x-vercel-ip-country-region') ?? 'default';
  
  return `${baseKey}:${country}:${region}`;
}
```

### Distributed Lock for Cache Updates

```typescript
// lib/cache/distributed-lock.ts
import { getLocalRedis } from './distributed-redis';

type LockOptions = {
  ttl?: number; // Lock TTL in seconds
  retries?: number;
  retryDelay?: number; // ms
};

export async function acquireLock(
  key: string,
  options: LockOptions = {}
): Promise<string | null> {
  const { ttl = 30, retries = 3, retryDelay = 100 } = options;
  const redis = getLocalRedis();
  const lockKey = `lock:${key}`;
  const lockValue = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  for (let i = 0; i < retries; i++) {
    const acquired = await redis.set(lockKey, lockValue, { nx: true, ex: ttl });
    
    if (acquired) {
      return lockValue;
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  return null;
}

export async function releaseLock(key: string, lockValue: string): Promise<boolean> {
  const redis = getLocalRedis();
  const lockKey = `lock:${key}`;

  // Only release if we own the lock
  const currentValue = await redis.get(lockKey);
  if (currentValue === lockValue) {
    await redis.del(lockKey);
    return true;
  }

  return false;
}

export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  options: LockOptions = {}
): Promise<T | null> {
  const lockValue = await acquireLock(key, options);
  
  if (!lockValue) {
    return null; // Couldn't acquire lock
  }

  try {
    return await fn();
  } finally {
    await releaseLock(key, lockValue);
  }
}

// Usage: Prevent cache stampede
export async function safeDistributedCacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await distributedGet<T>(key);
  if (cached) return cached;

  // Acquire lock for cache update
  const result = await withLock(
    `update:${key}`,
    async () => {
      // Double-check cache after acquiring lock
      const rechecked = await distributedGet<T>(key);
      if (rechecked) return rechecked;

      // Fetch and cache
      const fresh = await fetchFn();
      await distributedSet(key, fresh, { ttl, replicateGlobally: true });
      return fresh;
    },
    { ttl: 10, retries: 5 }
  );

  // If lock failed, fetch directly (fallback)
  if (result === null) {
    return fetchFn();
  }

  return result;
}
```

## Variants

### With Conflict Resolution

```typescript
// lib/cache/conflict-resolution.ts
type VersionedValue<T> = {
  data: T;
  version: number;
  lastModified: number;
};

export async function versionedSet<T>(
  key: string,
  value: T,
  expectedVersion: number | null
): Promise<{ success: boolean; currentVersion: number }> {
  const redis = getLocalRedis();
  
  const existing = await redis.get<string>(key);
  const current: VersionedValue<T> | null = existing
    ? JSON.parse(existing)
    : null;

  // Optimistic locking check
  if (expectedVersion !== null && current?.version !== expectedVersion) {
    return {
      success: false,
      currentVersion: current?.version ?? 0,
    };
  }

  const newVersion = (current?.version ?? 0) + 1;
  const newValue: VersionedValue<T> = {
    data: value,
    version: newVersion,
    lastModified: Date.now(),
  };

  await distributedSet(key, newValue, { ttl: 3600, replicateGlobally: true });

  return { success: true, currentVersion: newVersion };
}
```

## Anti-patterns

```typescript
// BAD: Synchronous replication blocking requests
await Promise.all(allRegions.map(r => writeToRegion(r, data))); // Slow!

// GOOD: Write local, async replication
await writeToLocal(data);
replicateAsync(data); // Fire and forget

// BAD: Not handling network partitions
const data = await remoteRedis.get(key); // May fail!

// GOOD: Fallback to local or origin
const data = await remoteRedis.get(key).catch(() => localRedis.get(key));

// BAD: No versioning for conflict resolution
await redis.set(key, newValue); // May overwrite newer data

// GOOD: Use versioning or timestamps
await versionedSet(key, newValue, expectedVersion);
```

## Related Patterns

- `redis-cache.md` - Single-region Redis caching
- `edge-cache.md` - CDN edge caching
- `cache-invalidation.md` - Invalidation strategies
- `geolocation.md` - Geographic-based routing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial distributed cache pattern
