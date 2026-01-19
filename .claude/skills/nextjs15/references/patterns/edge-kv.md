---
id: pt-edge-kv
name: Edge Key-Value Storage
version: 2.0.0
layer: L5
category: edge
description: Use globally distributed key-value storage for edge functions
tags: [edge, kv, storage, vercel, upstash, cache]
composes: []
dependencies: []
formula: Vercel KV / Upstash + Edge Functions = Global State at the Edge
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Session management with global distribution
- Feature flag storage with instant reads
- Distributed rate limiting counters
- Edge caching with tag-based invalidation
- Real-time counters and analytics

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Edge KV Architecture                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Edge Function / Middleware                          │   │
│  │                                                     │   │
│  │  // Session lookup                                  │   │
│  │  const session = await kv.get(`session:${id}`);    │   │
│  │                                                     │   │
│  │  // Feature flag check                              │   │
│  │  const flags = await kv.hgetall('flags');          │   │
│  │                                                     │   │
│  │  // Rate limit counter                              │   │
│  │  const count = await kv.incr(`rate:${ip}`);        │   │
│  │                                                     │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Distributed KV Store                                │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Keys          │ Values                          │ │   │
│  │ ├───────────────┼────────────────────────────────┤ │   │
│  │ │ session:abc   │ { userId, role, lastActive }   │ │   │
│  │ │ flags         │ { newUI: true, beta: false }   │ │   │
│  │ │ rate:1.2.3.4  │ 42 (with TTL)                  │ │   │
│  │ │ cache:product │ { data, timestamp, tags }      │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Data Structures:                                           │
│  - Strings: get, set, incr, decr                           │
│  - Hashes: hget, hset, hgetall                             │
│  - Lists: lpush, rpush, lrange                             │
│  - Sets: sadd, smembers, sismember                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Edge Key-Value Storage

Store and retrieve data at the edge with globally distributed key-value storage for ultra-low latency access.

## Overview

Edge KV provides:
- Global distribution
- Sub-millisecond reads
- Persistent storage
- Session management
- Feature flags
- Rate limiting counters

## Implementation

### Vercel KV Setup

```typescript
// lib/kv/client.ts
import { kv } from "@vercel/kv";

// Basic operations
export async function getValue<T>(key: string): Promise<T | null> {
  return kv.get<T>(key);
}

export async function setValue<T>(
  key: string,
  value: T,
  options?: { ex?: number; px?: number; nx?: boolean }
): Promise<void> {
  if (options?.ex) {
    await kv.set(key, value, { ex: options.ex });
  } else if (options?.px) {
    await kv.set(key, value, { px: options.px });
  } else if (options?.nx) {
    await kv.setnx(key, value);
  } else {
    await kv.set(key, value);
  }
}

export async function deleteValue(key: string): Promise<void> {
  await kv.del(key);
}

export async function exists(key: string): Promise<boolean> {
  return (await kv.exists(key)) === 1;
}

// Hash operations
export async function getHash<T extends Record<string, unknown>>(
  key: string
): Promise<T | null> {
  return kv.hgetall<T>(key);
}

export async function setHashField(
  key: string,
  field: string,
  value: unknown
): Promise<void> {
  await kv.hset(key, { [field]: value });
}

// List operations
export async function pushToList(key: string, ...values: unknown[]): Promise<void> {
  await kv.rpush(key, ...values);
}

export async function getList<T>(
  key: string,
  start: number = 0,
  end: number = -1
): Promise<T[]> {
  return kv.lrange<T>(key, start, end);
}

// Set operations
export async function addToSet(key: string, ...members: string[]): Promise<void> {
  await kv.sadd(key, ...members);
}

export async function getSetMembers(key: string): Promise<string[]> {
  return kv.smembers(key);
}

export async function isSetMember(key: string, member: string): Promise<boolean> {
  return (await kv.sismember(key, member)) === 1;
}
```

### Upstash Redis for Edge

```typescript
// lib/kv/upstash.ts
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

// Type-safe wrapper
export class EdgeKV {
  private redis: Redis;
  private prefix: string;
  
  constructor(prefix: string = "") {
    this.redis = Redis.fromEnv();
    this.prefix = prefix;
  }
  
  private key(k: string): string {
    return this.prefix ? `${this.prefix}:${k}` : k;
  }
  
  async get<T>(key: string): Promise<T | null> {
    return this.redis.get<T>(this.key(key));
  }
  
  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): Promise<void> {
    if (ttlSeconds) {
      await this.redis.setex(this.key(key), ttlSeconds, value);
    } else {
      await this.redis.set(this.key(key), value);
    }
  }
  
  async delete(key: string): Promise<void> {
    await this.redis.del(this.key(key));
  }
  
  async increment(key: string, by: number = 1): Promise<number> {
    return this.redis.incrby(this.key(key), by);
  }
  
  async decrement(key: string, by: number = 1): Promise<number> {
    return this.redis.decrby(this.key(key), by);
  }
  
  // Atomic operations
  async getAndSet<T>(key: string, value: T): Promise<T | null> {
    return this.redis.getset<T>(this.key(key), value);
  }
  
  async setIfNotExists<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    if (ttlSeconds) {
      const result = await this.redis.set(this.key(key), value, {
        nx: true,
        ex: ttlSeconds,
      });
      return result === "OK";
    }
    return (await this.redis.setnx(this.key(key), value)) === 1;
  }
}

// Pre-configured instances
export const sessionKV = new EdgeKV("session");
export const cacheKV = new EdgeKV("cache");
export const flagsKV = new EdgeKV("flags");
```

### Session Management at Edge

```typescript
// lib/session/edge-session.ts
import { kv } from "@vercel/kv";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session_id";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

interface Session {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  lastActive: number;
  metadata?: Record<string, unknown>;
}

export async function createSession(user: {
  id: string;
  email: string;
  role: string;
}): Promise<string> {
  const sessionId = crypto.randomUUID();
  
  const session: Session = {
    userId: user.id,
    email: user.email,
    role: user.role,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };
  
  await kv.set(`session:${sessionId}`, session, { ex: SESSION_TTL });
  
  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
  });
  
  return sessionId;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!sessionId) return null;
  
  const session = await kv.get<Session>(`session:${sessionId}`);
  
  if (!session) return null;
  
  // Update last active time
  await kv.set(
    `session:${sessionId}`,
    { ...session, lastActive: Date.now() },
    { ex: SESSION_TTL }
  );
  
  return session;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (sessionId) {
    await kv.del(`session:${sessionId}`);
    cookieStore.delete(SESSION_COOKIE);
  }
}

// Edge API route
// app/api/auth/session/route.ts
export const runtime = "edge";

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      role: session.role,
    },
  });
}
```

### Feature Flags at Edge

```typescript
// lib/flags/edge-flags.ts
import { kv } from "@vercel/kv";

interface FeatureFlag {
  enabled: boolean;
  rolloutPercentage?: number;
  allowedUsers?: string[];
  deniedUsers?: string[];
  metadata?: Record<string, unknown>;
}

const FLAGS_KEY = "feature_flags";

export async function getFeatureFlags(): Promise<Record<string, FeatureFlag>> {
  return (await kv.hgetall<Record<string, FeatureFlag>>(FLAGS_KEY)) || {};
}

export async function getFeatureFlag(name: string): Promise<FeatureFlag | null> {
  return kv.hget<FeatureFlag>(FLAGS_KEY, name);
}

export async function setFeatureFlag(
  name: string,
  flag: FeatureFlag
): Promise<void> {
  await kv.hset(FLAGS_KEY, { [name]: flag });
}

export async function isFeatureEnabled(
  name: string,
  userId?: string
): Promise<boolean> {
  const flag = await getFeatureFlag(name);
  
  if (!flag) return false;
  if (!flag.enabled) return false;
  
  // Check user-specific rules
  if (userId) {
    if (flag.deniedUsers?.includes(userId)) return false;
    if (flag.allowedUsers?.includes(userId)) return true;
  }
  
  // Check rollout percentage
  if (flag.rolloutPercentage !== undefined && userId) {
    const hash = hashUserId(userId, name);
    return hash < flag.rolloutPercentage;
  }
  
  return flag.enabled;
}

function hashUserId(userId: string, flagName: string): number {
  const str = `${userId}:${flagName}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % 100;
}

// API route for flags
// app/api/flags/route.ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const flagName = request.nextUrl.searchParams.get("flag");
  
  if (flagName) {
    const enabled = await isFeatureEnabled(flagName, userId || undefined);
    return NextResponse.json({ flag: flagName, enabled });
  }
  
  const flags = await getFeatureFlags();
  const resolved: Record<string, boolean> = {};
  
  for (const [name, flag] of Object.entries(flags)) {
    resolved[name] = await isFeatureEnabled(name, userId || undefined);
  }
  
  return NextResponse.json({ flags: resolved });
}
```

### Caching at Edge

```typescript
// lib/cache/edge-cache.ts
import { kv } from "@vercel/kv";

interface CacheOptions {
  ttl?: number; // seconds
  staleWhileRevalidate?: number;
  tags?: string[];
}

interface CacheEntry<T> {
  data: T;
  createdAt: number;
  ttl: number;
  tags: string[];
}

export class EdgeCache {
  private prefix: string;
  
  constructor(prefix: string = "cache") {
    this.prefix = prefix;
  }
  
  private key(k: string): string {
    return `${this.prefix}:${k}`;
  }
  
  async get<T>(key: string): Promise<T | null> {
    const entry = await kv.get<CacheEntry<T>>(this.key(key));
    
    if (!entry) return null;
    
    const age = (Date.now() - entry.createdAt) / 1000;
    
    if (age > entry.ttl) {
      // Expired
      await this.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 3600; // Default 1 hour
    
    const entry: CacheEntry<T> = {
      data,
      createdAt: Date.now(),
      ttl,
      tags: options.tags || [],
    };
    
    await kv.set(this.key(key), entry, { ex: ttl });
    
    // Track tags for invalidation
    if (options.tags) {
      for (const tag of options.tags) {
        await kv.sadd(`${this.prefix}:tag:${tag}`, key);
      }
    }
  }
  
  async delete(key: string): Promise<void> {
    await kv.del(this.key(key));
  }
  
  async invalidateTag(tag: string): Promise<number> {
    const keys = await kv.smembers(`${this.prefix}:tag:${tag}`);
    
    if (keys.length === 0) return 0;
    
    // Delete all cached entries with this tag
    await Promise.all(keys.map((key) => this.delete(key as string)));
    
    // Clean up tag set
    await kv.del(`${this.prefix}:tag:${tag}`);
    
    return keys.length;
  }
  
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const data = await fetcher();
    await this.set(key, data, options);
    
    return data;
  }
}

export const edgeCache = new EdgeCache();

// Usage in API route
// app/api/products/[id]/route.ts
export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const product = await edgeCache.getOrSet(
    `product:${id}`,
    async () => {
      const res = await fetch(`${process.env.API_URL}/products/${id}`);
      return res.json();
    },
    {
      ttl: 300, // 5 minutes
      tags: ["products", `product:${id}`],
    }
  );
  
  return NextResponse.json(product);
}
```

### Distributed Counters

```typescript
// lib/kv/counters.ts
import { kv } from "@vercel/kv";

export class DistributedCounter {
  private key: string;
  
  constructor(name: string) {
    this.key = `counter:${name}`;
  }
  
  async increment(by: number = 1): Promise<number> {
    return kv.incrby(this.key, by);
  }
  
  async decrement(by: number = 1): Promise<number> {
    return kv.decrby(this.key, by);
  }
  
  async get(): Promise<number> {
    return (await kv.get<number>(this.key)) || 0;
  }
  
  async reset(): Promise<void> {
    await kv.set(this.key, 0);
  }
}

// Time-windowed counter for rate limiting
export class WindowedCounter {
  private prefix: string;
  private windowSeconds: number;
  
  constructor(name: string, windowSeconds: number) {
    this.prefix = `wcounter:${name}`;
    this.windowSeconds = windowSeconds;
  }
  
  private currentWindow(): number {
    return Math.floor(Date.now() / 1000 / this.windowSeconds);
  }
  
  async increment(): Promise<number> {
    const window = this.currentWindow();
    const key = `${this.prefix}:${window}`;
    
    const count = await kv.incr(key);
    
    // Set expiry on first increment
    if (count === 1) {
      await kv.expire(key, this.windowSeconds * 2);
    }
    
    return count;
  }
  
  async get(): Promise<number> {
    const window = this.currentWindow();
    return (await kv.get<number>(`${this.prefix}:${window}`)) || 0;
  }
}

// Usage
const pageViews = new DistributedCounter("page_views");
const requestsPerMinute = new WindowedCounter("requests", 60);
```

## Variants

### Multi-Region Replication

```typescript
// For Upstash Global, data is automatically replicated
// Access the nearest region automatically
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
```

## Anti-patterns

### Large Values

```typescript
// BAD: Storing large objects
await kv.set("large-data", hugeArray); // May hit size limits

// GOOD: Store references or paginate
await kv.set("data-count", hugeArray.length);
for (let i = 0; i < hugeArray.length; i += 100) {
  await kv.set(`data:page:${i / 100}`, hugeArray.slice(i, i + 100));
}
```

### Not Setting TTL

```typescript
// BAD: Data persists forever
await kv.set("temp-data", value);

// GOOD: Always set appropriate TTL
await kv.set("temp-data", value, { ex: 3600 }); // 1 hour
```

## Related Skills

- `edge-functions` - Edge function patterns
- `rate-limiting` - Rate limiting patterns
- `caching` - Caching strategies
- `session-management` - Session handling

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Vercel KV and Upstash
