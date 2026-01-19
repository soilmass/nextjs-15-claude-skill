---
id: pt-connection-pooling
name: Connection Pooling Advanced
version: 1.0.0
layer: L5
category: infrastructure
description: Database connection pool sizing, query optimization, N+1 prevention, connection monitoring, and serverless-optimized pooling strategies for Next.js 15 applications
tags: [connection-pooling, database, prisma, postgres, n+1, query-optimization, serverless, next15]
composes: []
dependencies:
  "@prisma/client": "^5.10.0"
  "@neondatabase/serverless": "^0.9.0"
  pg: "^8.11.0"
formula: "ConnectionPooling = PoolSizing + ConnectionReuse + N+1Prevention + QueryOptimization + Monitoring + ServerlessAdaptation"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Connection Pooling Advanced

## Overview

Database connection pooling is critical for production Next.js applications, especially in serverless environments where cold starts and connection limits can significantly impact performance. This pattern covers comprehensive strategies for pool sizing, connection reuse, N+1 query prevention, and query optimization specifically tailored for Next.js 15's server components, server actions, and API routes.

Serverless platforms like Vercel present unique challenges: each function invocation may create new connections, leading to connection exhaustion. Traditional connection pooling strategies designed for long-running servers don't translate directly. This pattern addresses these challenges with techniques like external connection poolers (PgBouncer, Prisma Accelerate), serverless-optimized clients, and intelligent connection management.

Beyond pooling, we cover query optimization fundamentals including proper indexing strategies, batch loading to prevent N+1 queries, query analysis tools, and real-time monitoring. The goal is to achieve consistent sub-100ms database response times while efficiently managing connection resources across thousands of concurrent serverless function invocations.

## When to Use

- Production Next.js applications with database backends
- Serverless deployments (Vercel, AWS Lambda, Cloudflare Workers)
- High-traffic applications with concurrent database access
- Applications experiencing connection timeout or exhaustion errors
- Multi-tenant SaaS with per-tenant database isolation
- Applications with complex queries requiring optimization
- When database costs are driven by connection count
- Edge deployments requiring regional database access

## When NOT to Use

- Simple prototype or development environments
- Applications with minimal database usage (< 100 queries/day)
- When using managed services that handle pooling (some Firebase, Supabase configs)
- Static sites with build-time data fetching only
- Applications using only client-side data storage

## Composition Diagram

```
+============================================================================+
|                    CONNECTION POOLING ARCHITECTURE                          |
+=============================================================================+
|                                                                             |
|   NEXT.JS APPLICATION LAYER                                                 |
|   +------------------------------------------------------------------+     |
|   |                                                                   |     |
|   |  +-------------+  +-------------+  +-------------+               |     |
|   |  | Server      |  | Server      |  | API Route   |               |     |
|   |  | Component   |  | Action      |  | Handler     |               |     |
|   |  +------+------+  +------+------+  +------+------+               |     |
|   |         |                |                |                       |     |
|   |         +--------+-------+--------+-------+                       |     |
|   |                  |                                                |     |
|   |                  v                                                |     |
|   |  +----------------------------------------------------------+    |     |
|   |  |  PRISMA CLIENT (Singleton)                                |    |     |
|   |  |  - Connection pool per process                            |    |     |
|   |  |  - Query batching and deduplication                       |    |     |
|   |  |  - Automatic retry logic                                  |    |     |
|   |  +----------------------------------------------------------+    |     |
|   |                                                                   |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|                       v                                                     |
|   +------------------------------------------------------------------+     |
|   |  CONNECTION POOLER LAYER (EXTERNAL)                               |     |
|   |                                                                   |     |
|   |  Option A: Prisma Accelerate                                      |     |
|   |  +----------------------------------------------------------+    |     |
|   |  | - Global edge caching                                     |    |     |
|   |  | - Automatic connection pooling                            |    |     |
|   |  | - Query result caching                                    |    |     |
|   |  +----------------------------------------------------------+    |     |
|   |                                                                   |     |
|   |  Option B: PgBouncer / Supavisor                                  |     |
|   |  +----------------------------------------------------------+    |     |
|   |  | - Transaction pooling mode                                |    |     |
|   |  | - Connection multiplexing                                 |    |     |
|   |  | - Prepared statement support                              |    |     |
|   |  +----------------------------------------------------------+    |     |
|   |                                                                   |     |
|   |  Option C: Neon Serverless Driver                                 |     |
|   |  +----------------------------------------------------------+    |     |
|   |  | - HTTP-based connections (no TCP)                         |    |     |
|   |  | - Per-query connections                                   |    |     |
|   |  | - Ideal for edge functions                                |    |     |
|   |  +----------------------------------------------------------+    |     |
|   |                                                                   |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|                       v                                                     |
|   +------------------------------------------------------------------+     |
|   |  DATABASE LAYER                                                   |     |
|   |  +----------------------------------------------------------+    |     |
|   |  |  PostgreSQL / MySQL / PlanetScale                         |    |     |
|   |  |  - Connection limit: ~100 (varies by tier)                |    |     |
|   |  |  - Prepared statements                                    |    |     |
|   |  |  - Query execution plans                                  |    |     |
|   |  +----------------------------------------------------------+    |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
|   MONITORING & OBSERVABILITY                                                |
|   +------------------------------------------------------------------+     |
|   | - Active connections count                                        |     |
|   | - Connection wait time (pool exhaustion indicator)                |     |
|   | - Query execution time (p50, p95, p99)                            |     |
|   | - Slow query logging                                              |     |
|   | - N+1 detection alerts                                            |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
+=============================================================================+
```

## Implementation

### Singleton Prisma Client with Pooling Configuration

```typescript
// lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development due to hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection pool configuration
const connectionPoolConfig = {
  // Maximum number of connections in the pool
  connection_limit: parseInt(process.env.DATABASE_POOL_SIZE || "10"),
  // Maximum time to wait for a connection from pool (ms)
  pool_timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || "10"),
};

// Build connection URL with pool parameters
function getConnectionUrl(): string {
  const baseUrl = process.env.DATABASE_URL!;
  const url = new URL(baseUrl);

  // Add connection pool parameters
  url.searchParams.set(
    "connection_limit",
    connectionPoolConfig.connection_limit.toString()
  );
  url.searchParams.set(
    "pool_timeout",
    connectionPoolConfig.pool_timeout.toString()
  );

  // Enable prepared statements caching
  url.searchParams.set("statement_cache_size", "500");

  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getConnectionUrl(),
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? [
            { level: "query", emit: "event" },
            { level: "error", emit: "stdout" },
            { level: "warn", emit: "stdout" },
          ]
        : [{ level: "error", emit: "stdout" }],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Query logging in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: any) => {
    if (e.duration > 100) {
      console.warn(`Slow query (${e.duration}ms):`, e.query);
    }
  });
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
```

### Serverless-Optimized Prisma Configuration

```typescript
// lib/db/prisma-serverless.ts
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Configure WebSocket for Neon (required in Node.js environment)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create connection pool
function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Single connection per serverless instance
    idleTimeoutMillis: 0, // Don't keep idle connections
    connectionTimeoutMillis: 10000,
  });
}

// Create Prisma client with Neon adapter
function createPrismaClient(): PrismaClient {
  const pool = globalForPrisma.pool ?? createPool();
  globalForPrisma.pool = pool;

  const adapter = new PrismaNeon(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// For edge runtime (no WebSocket needed)
export async function getEdgePrisma(): Promise<PrismaClient> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);

  // Use Prisma with HTTP-based Neon driver
  // This creates a new "connection" per query
  // but doesn't actually use TCP connections
  return prisma;
}
```

### External Connection Pooler Configuration

```typescript
// lib/db/prisma-with-pooler.ts
import { PrismaClient } from "@prisma/client";

/**
 * Configuration for external connection poolers like:
 * - Prisma Accelerate
 * - PgBouncer
 * - Supavisor (Supabase)
 * - Neon's built-in pooler
 */

interface PoolerConfig {
  // Direct connection URL (for migrations)
  directUrl: string;
  // Pooled connection URL (for queries)
  pooledUrl: string;
  // Pool mode: 'transaction' or 'session'
  poolMode: "transaction" | "session";
}

function getPoolerConfig(): PoolerConfig {
  // Prisma Accelerate
  if (process.env.PRISMA_ACCELERATE_URL) {
    return {
      directUrl: process.env.DATABASE_URL!,
      pooledUrl: process.env.PRISMA_ACCELERATE_URL,
      poolMode: "transaction",
    };
  }

  // Supabase with Supavisor
  if (process.env.SUPABASE_DB_URL) {
    return {
      directUrl: process.env.SUPABASE_DB_URL.replace(":5432", ":5432"),
      pooledUrl: process.env.SUPABASE_DB_URL.replace(":5432", ":6543"),
      poolMode: "transaction",
    };
  }

  // Neon with pooler
  if (process.env.DATABASE_URL?.includes("neon.tech")) {
    const directUrl = process.env.DATABASE_URL;
    const pooledUrl = directUrl.replace(
      "neon.tech",
      "neon.tech"
    ).replace("?", "?pgbouncer=true&");

    return {
      directUrl,
      pooledUrl,
      poolMode: "transaction",
    };
  }

  // Default: no external pooler
  return {
    directUrl: process.env.DATABASE_URL!,
    pooledUrl: process.env.DATABASE_URL!,
    poolMode: "session",
  };
}

const config = getPoolerConfig();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: config.pooledUrl,
      },
    },
    // Transaction pooling mode requires pgbouncer-compatible queries
    // This disables some features that don't work with pgbouncer
    ...(config.poolMode === "transaction" && {
      // Disable features incompatible with transaction pooling
      __internal: {
        engine: {
          connection: {
            statement_cache: 0, // Disable statement cache
          },
        },
      },
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Export direct URL for migrations
export const directDatabaseUrl = config.directUrl;
```

### N+1 Query Prevention with DataLoader

```typescript
// lib/db/data-loader.ts
import DataLoader from "dataloader";
import { prisma } from "./prisma";

// Generic batch loader factory
type BatchFn<K, V> = (keys: readonly K[]) => Promise<(V | Error)[]>;

function createLoader<K, V>(batchFn: BatchFn<K, V>): DataLoader<K, V> {
  return new DataLoader(batchFn, {
    // Cache results for the duration of a single request
    cache: true,
    // Maximum batch size
    maxBatchSize: 100,
    // Batch within the same event loop tick
    batchScheduleFn: (callback) => setTimeout(callback, 0),
  });
}

// User loader
export function createUserLoader() {
  return createLoader<string, any>(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...userIds] } },
    });

    // Map results to maintain order
    const userMap = new Map(users.map((u) => [u.id, u]));
    return userIds.map((id) => userMap.get(id) || new Error(`User ${id} not found`));
  });
}

// Post loader with relations
export function createPostLoader() {
  return createLoader<string, any>(async (postIds) => {
    const posts = await prisma.post.findMany({
      where: { id: { in: [...postIds] } },
      include: {
        author: true,
        _count: { select: { comments: true, likes: true } },
      },
    });

    const postMap = new Map(posts.map((p) => [p.id, p]));
    return postIds.map((id) => postMap.get(id) || new Error(`Post ${id} not found`));
  });
}

// Posts by author loader (one-to-many)
export function createPostsByAuthorLoader() {
  return createLoader<string, any[]>(async (authorIds) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: [...authorIds] } },
      orderBy: { createdAt: "desc" },
    });

    // Group posts by author
    const postsByAuthor = new Map<string, any[]>();
    for (const authorId of authorIds) {
      postsByAuthor.set(authorId, []);
    }
    for (const post of posts) {
      postsByAuthor.get(post.authorId)?.push(post);
    }

    return authorIds.map((id) => postsByAuthor.get(id) || []);
  });
}

// Comments with nested author loader
export function createCommentsLoader() {
  return createLoader<string, any[]>(async (postIds) => {
    const comments = await prisma.comment.findMany({
      where: { postId: { in: [...postIds] } },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    });

    const commentsByPost = new Map<string, any[]>();
    for (const postId of postIds) {
      commentsByPost.set(postId, []);
    }
    for (const comment of comments) {
      commentsByPost.get(comment.postId)?.push(comment);
    }

    return postIds.map((id) => commentsByPost.get(id) || []);
  });
}

// Request-scoped loader context
export interface LoaderContext {
  userLoader: ReturnType<typeof createUserLoader>;
  postLoader: ReturnType<typeof createPostLoader>;
  postsByAuthorLoader: ReturnType<typeof createPostsByAuthorLoader>;
  commentsLoader: ReturnType<typeof createCommentsLoader>;
}

export function createLoaderContext(): LoaderContext {
  return {
    userLoader: createUserLoader(),
    postLoader: createPostLoader(),
    postsByAuthorLoader: createPostsByAuthorLoader(),
    commentsLoader: createCommentsLoader(),
  };
}
```

### Using DataLoader in Server Components

```typescript
// lib/db/context.ts
import { cache } from "react";
import { createLoaderContext, LoaderContext } from "./data-loader";

// Create a request-scoped loader context using React's cache
export const getLoaderContext = cache((): LoaderContext => {
  return createLoaderContext();
});

// app/users/[id]/page.tsx
import { getLoaderContext } from "@/lib/db/context";

async function UserProfile({ userId }: { userId: string }) {
  const loaders = getLoaderContext();

  // These will be batched automatically
  const [user, posts] = await Promise.all([
    loaders.userLoader.load(userId),
    loaders.postsByAuthorLoader.load(userId),
  ]);

  return (
    <div>
      <h1>{user.name}</h1>
      {posts.map((post) => (
        <PostCard key={post.id} postId={post.id} />
      ))}
    </div>
  );
}

async function PostCard({ postId }: { postId: string }) {
  const loaders = getLoaderContext();

  // This will be batched with other PostCard instances
  const [post, comments] = await Promise.all([
    loaders.postLoader.load(postId),
    loaders.commentsLoader.load(postId),
  ]);

  return (
    <article>
      <h2>{post.title}</h2>
      <p>By {post.author.name}</p>
      <p>{post._count.comments} comments</p>
      <CommentsList comments={comments} />
    </article>
  );
}
```

### Query Optimization Utilities

```typescript
// lib/db/query-utils.ts
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

/**
 * Paginated query with cursor-based pagination
 */
export async function paginatedQuery<T, W extends Prisma.Args<any, "findMany">>(
  model: Prisma.ModelName,
  args: {
    where?: W["where"];
    orderBy?: W["orderBy"];
    cursor?: string;
    limit?: number;
    include?: W["include"];
    select?: W["select"];
  }
): Promise<{
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const { cursor, limit = 20, ...queryArgs } = args;

  const items = await (prisma as any)[model.toLowerCase()].findMany({
    ...queryArgs,
    take: limit + 1, // Fetch one extra to check if there's more
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;

  return { data, nextCursor, hasMore };
}

/**
 * Batch insert with conflict handling
 */
export async function batchInsert<T>(
  model: Prisma.ModelName,
  data: T[],
  options: {
    batchSize?: number;
    skipDuplicates?: boolean;
    onConflict?: { fields: string[]; update: Partial<T> };
  } = {}
): Promise<{ created: number; updated: number }> {
  const { batchSize = 100, skipDuplicates = false, onConflict } = options;

  let created = 0;
  let updated = 0;

  // Process in batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    if (onConflict) {
      // Upsert with conflict handling
      for (const item of batch) {
        const result = await (prisma as any)[model.toLowerCase()].upsert({
          where: {
            [onConflict.fields.join("_")]: Object.fromEntries(
              onConflict.fields.map((f) => [f, (item as any)[f]])
            ),
          },
          create: item,
          update: onConflict.update,
        });
        // Check if it was created or updated
        if (result.createdAt === result.updatedAt) {
          created++;
        } else {
          updated++;
        }
      }
    } else {
      // Simple batch create
      const result = await (prisma as any)[model.toLowerCase()].createMany({
        data: batch,
        skipDuplicates,
      });
      created += result.count;
    }
  }

  return { created, updated };
}

/**
 * Optimized count with optional estimation for large tables
 */
export async function optimizedCount(
  model: Prisma.ModelName,
  where?: any,
  options: {
    useEstimate?: boolean;
    estimateThreshold?: number;
  } = {}
): Promise<number> {
  const { useEstimate = true, estimateThreshold = 10000 } = options;

  // For filtered queries, always use exact count
  if (where && Object.keys(where).length > 0) {
    return (prisma as any)[model.toLowerCase()].count({ where });
  }

  if (useEstimate) {
    // Use PostgreSQL's reltuples for fast estimate
    const result = await prisma.$queryRaw<[{ estimate: bigint }]>`
      SELECT reltuples::bigint AS estimate
      FROM pg_class
      WHERE relname = ${model.toLowerCase()}
    `;

    const estimate = Number(result[0]?.estimate || 0);

    // If estimate is below threshold, get exact count
    if (estimate < estimateThreshold) {
      return (prisma as any)[model.toLowerCase()].count();
    }

    return estimate;
  }

  return (prisma as any)[model.toLowerCase()].count();
}

/**
 * Query with automatic index hints (PostgreSQL)
 */
export async function queryWithIndexHint<T>(
  query: string,
  indexName: string,
  params: any[] = []
): Promise<T[]> {
  // PostgreSQL syntax for index hints
  const hintedQuery = query.replace(
    /FROM\s+(\w+)/i,
    `FROM $1 /*+ IndexScan($1 ${indexName}) */`
  );

  return prisma.$queryRawUnsafe(hintedQuery, ...params);
}

/**
 * Explain analyze a query for debugging
 */
export async function explainQuery(
  query: string,
  params: any[] = []
): Promise<string> {
  const result = await prisma.$queryRawUnsafe<[{ "QUERY PLAN": string }]>(
    `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${query}`,
    ...params
  );

  return result.map((r) => r["QUERY PLAN"]).join("\n");
}
```

### Connection Pool Monitoring

```typescript
// lib/db/monitoring.ts
import { prisma } from "./prisma";
import { metrics } from "@/lib/metrics";

interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  waitingQueries: number;
  totalConnections: number;
  maxConnections: number;
}

/**
 * Get current connection pool statistics
 */
export async function getPoolStats(): Promise<PoolStats> {
  // PostgreSQL pool stats query
  const result = await prisma.$queryRaw<
    [
      {
        active: bigint;
        idle: bigint;
        waiting: bigint;
        total: bigint;
        max_connections: bigint;
      }
    ]
  >`
    SELECT
      (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active,
      (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle,
      (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type = 'Client') as waiting,
      (SELECT count(*) FROM pg_stat_activity) as total,
      (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
  `;

  const stats = result[0];

  return {
    activeConnections: Number(stats.active),
    idleConnections: Number(stats.idle),
    waitingQueries: Number(stats.waiting),
    totalConnections: Number(stats.total),
    maxConnections: Number(stats.max_connections),
  };
}

/**
 * Monitor pool health and emit metrics
 */
export async function monitorPoolHealth(): Promise<{
  healthy: boolean;
  warnings: string[];
}> {
  const stats = await getPoolStats();
  const warnings: string[] = [];

  // Calculate utilization
  const utilization = stats.activeConnections / stats.maxConnections;

  // Emit metrics
  metrics.gauge("db.pool.active_connections", stats.activeConnections);
  metrics.gauge("db.pool.idle_connections", stats.idleConnections);
  metrics.gauge("db.pool.waiting_queries", stats.waitingQueries);
  metrics.gauge("db.pool.utilization", utilization);

  // Check for warnings
  if (utilization > 0.8) {
    warnings.push(
      `High connection utilization: ${(utilization * 100).toFixed(1)}%`
    );
  }

  if (stats.waitingQueries > 0) {
    warnings.push(`${stats.waitingQueries} queries waiting for connections`);
  }

  if (stats.idleConnections === 0 && stats.activeConnections > 0) {
    warnings.push("No idle connections available");
  }

  return {
    healthy: warnings.length === 0,
    warnings,
  };
}

/**
 * Query performance tracker
 */
export class QueryTracker {
  private queryTimes: Map<string, number[]> = new Map();
  private slowQueryThreshold: number;

  constructor(slowQueryThreshold: number = 100) {
    this.slowQueryThreshold = slowQueryThreshold;
  }

  trackQuery(queryHash: string, durationMs: number): void {
    const times = this.queryTimes.get(queryHash) || [];
    times.push(durationMs);

    // Keep only last 100 samples
    if (times.length > 100) {
      times.shift();
    }

    this.queryTimes.set(queryHash, times);

    // Emit metrics
    metrics.histogram("db.query.duration", durationMs, { query: queryHash });

    // Log slow queries
    if (durationMs > this.slowQueryThreshold) {
      console.warn(`Slow query (${durationMs}ms): ${queryHash}`);
    }
  }

  getQueryStats(queryHash: string): {
    p50: number;
    p95: number;
    p99: number;
    avg: number;
    count: number;
  } | null {
    const times = this.queryTimes.get(queryHash);
    if (!times || times.length === 0) return null;

    const sorted = [...times].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      avg: sum / sorted.length,
      count: sorted.length,
    };
  }

  getSlowestQueries(limit: number = 10): Array<{
    queryHash: string;
    p95: number;
    count: number;
  }> {
    const stats = [];

    for (const [queryHash, times] of this.queryTimes) {
      const sorted = [...times].sort((a, b) => a - b);
      stats.push({
        queryHash,
        p95: sorted[Math.floor(sorted.length * 0.95)],
        count: times.length,
      });
    }

    return stats.sort((a, b) => b.p95 - a.p95).slice(0, limit);
  }
}

export const queryTracker = new QueryTracker();
```

### Prisma Extension for Query Timing

```typescript
// lib/db/prisma-extension.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { queryTracker } from "./monitoring";

// Create Prisma client with query timing extension
export const prismaWithTiming = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();

        try {
          const result = await query(args);
          const duration = performance.now() - start;

          // Track query performance
          const queryHash = `${model}.${operation}`;
          queryTracker.trackQuery(queryHash, duration);

          return result;
        } catch (error) {
          const duration = performance.now() - start;
          console.error(
            `Query failed after ${duration.toFixed(2)}ms:`,
            { model, operation, args },
            error
          );
          throw error;
        }
      },
    },
  },
});

// Extension for soft delete
export const prismaWithSoftDelete = new PrismaClient().$extends({
  query: {
    $allModels: {
      async findMany({ args, query, model }) {
        // Auto-filter soft-deleted records
        const modelFields = Prisma.dmmf.datamodel.models.find(
          (m) => m.name === model
        )?.fields;

        if (modelFields?.some((f) => f.name === "deletedAt")) {
          args.where = {
            ...args.where,
            deletedAt: null,
          };
        }

        return query(args);
      },

      async delete({ args, query, model }) {
        const modelFields = Prisma.dmmf.datamodel.models.find(
          (m) => m.name === model
        )?.fields;

        // Convert delete to soft delete
        if (modelFields?.some((f) => f.name === "deletedAt")) {
          return (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)].update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }

        return query(args);
      },
    },
  },
});
```

### N+1 Detection Middleware

```typescript
// lib/db/n-plus-one-detector.ts
import { Prisma } from "@prisma/client";

interface QueryLog {
  model: string;
  operation: string;
  where?: any;
  timestamp: number;
}

class N1Detector {
  private queries: QueryLog[] = [];
  private threshold: number;
  private windowMs: number;

  constructor(threshold: number = 5, windowMs: number = 100) {
    this.threshold = threshold;
    this.windowMs = windowMs;
  }

  logQuery(model: string, operation: string, where?: any): void {
    const now = Date.now();

    // Clean old queries outside window
    this.queries = this.queries.filter((q) => now - q.timestamp < this.windowMs);

    // Add new query
    this.queries.push({
      model,
      operation,
      where,
      timestamp: now,
    });

    // Check for N+1 pattern
    this.detectN1Pattern();
  }

  private detectN1Pattern(): void {
    // Group queries by model and operation
    const groups = new Map<string, QueryLog[]>();

    for (const query of this.queries) {
      const key = `${query.model}.${query.operation}`;
      const group = groups.get(key) || [];
      group.push(query);
      groups.set(key, group);
    }

    // Check each group
    for (const [key, queries] of groups) {
      if (queries.length >= this.threshold) {
        // Potential N+1 detected
        console.warn(
          `[N+1 DETECTED] ${queries.length} similar queries for ${key} within ${this.windowMs}ms`,
          {
            sampleWhere: queries.slice(0, 3).map((q) => q.where),
            suggestion: `Consider using DataLoader or include/select to batch these queries`,
          }
        );
      }
    }
  }

  clear(): void {
    this.queries = [];
  }
}

export const n1Detector = new N1Detector();

// Prisma middleware for N+1 detection
export const n1DetectionMiddleware: Prisma.Middleware = async (
  params,
  next
) => {
  if (process.env.NODE_ENV === "development") {
    n1Detector.logQuery(
      params.model || "unknown",
      params.action,
      params.args?.where
    );
  }

  return next(params);
};
```

### Connection Health Check API

```typescript
// app/api/health/db/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getPoolStats, monitorPoolHealth } from "@/lib/db/monitoring";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startTime = Date.now();

  try {
    // Basic connectivity check
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    // Get pool stats
    const poolStats = await getPoolStats();

    // Check pool health
    const { healthy, warnings } = await monitorPoolHealth();

    return NextResponse.json({
      status: healthy ? "healthy" : "degraded",
      latency,
      pool: poolStats,
      warnings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "unhealthy",
        latency,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

### Transaction with Retry Logic

```typescript
// lib/db/transaction.ts
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

interface TransactionOptions {
  maxRetries?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

type TransactionFn<T> = (
  tx: Prisma.TransactionClient
) => Promise<T>;

/**
 * Execute a transaction with automatic retry on serialization failures
 */
export async function transactionWithRetry<T>(
  fn: TransactionFn<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    timeout = 5000,
    isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        maxWait: timeout,
        timeout: timeout,
        isolationLevel,
      });
    } catch (error) {
      lastError = error as Error;

      // Check if it's a retryable error
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2034" || // Transaction failed due to conflict
          error.code === "P2028" || // Transaction API error
          error.message.includes("deadlock") ||
          error.message.includes("serialization"))
      ) {
        console.warn(
          `Transaction attempt ${attempt}/${maxRetries} failed, retrying...`,
          { code: error.code, message: error.message }
        );

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 100)
        );
        continue;
      }

      // Non-retryable error
      throw error;
    }
  }

  throw lastError || new Error("Transaction failed after max retries");
}

/**
 * Example: Transfer funds with optimistic locking
 */
export async function transferFunds(
  fromAccountId: string,
  toAccountId: string,
  amount: number
): Promise<void> {
  await transactionWithRetry(
    async (tx) => {
      // Lock and fetch source account
      const fromAccount = await tx.account.findUnique({
        where: { id: fromAccountId },
      });

      if (!fromAccount || fromAccount.balance < amount) {
        throw new Error("Insufficient funds");
      }

      // Lock and fetch destination account
      const toAccount = await tx.account.findUnique({
        where: { id: toAccountId },
      });

      if (!toAccount) {
        throw new Error("Destination account not found");
      }

      // Update balances
      await tx.account.update({
        where: { id: fromAccountId, version: fromAccount.version },
        data: {
          balance: { decrement: amount },
          version: { increment: 1 },
        },
      });

      await tx.account.update({
        where: { id: toAccountId, version: toAccount.version },
        data: {
          balance: { increment: amount },
          version: { increment: 1 },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          fromAccountId,
          toAccountId,
          amount,
          type: "TRANSFER",
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxRetries: 5,
    }
  );
}
```

## Examples

### Example 1: E-commerce Product Listing with Optimized Queries

```typescript
// app/products/page.tsx
import { prisma } from "@/lib/db/prisma";
import { paginatedQuery, optimizedCount } from "@/lib/db/query-utils";

interface ProductListProps {
  searchParams: {
    cursor?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductListProps) {
  const { cursor, category, minPrice, maxPrice } = searchParams;

  // Build where clause
  const where = {
    ...(category && { categoryId: category }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        }
      : {}),
    deletedAt: null,
  };

  // Use parallel queries for data and count
  const [{ data: products, nextCursor, hasMore }, totalCount] =
    await Promise.all([
      paginatedQuery<any, any>("Product", {
        where,
        orderBy: { createdAt: "desc" },
        cursor,
        limit: 20,
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
      optimizedCount("Product", where, { useEstimate: true }),
    ]);

  return (
    <div>
      <p>Showing {products.length} of {totalCount} products</p>

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <a href={`?cursor=${nextCursor}`}>Load More</a>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <div className="border rounded p-4">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <p>{product.category.name}</p>
      <p>{product._count.reviews} reviews</p>
    </div>
  );
}
```

### Example 2: User Dashboard with DataLoader

```typescript
// app/dashboard/page.tsx
import { getLoaderContext } from "@/lib/db/context";
import { prisma } from "@/lib/db/prisma";

async function getUser() {
  // Get current user from session
  return { id: "user-123" }; // Simplified
}

export default async function DashboardPage() {
  const user = await getUser();
  const loaders = getLoaderContext();

  // Initial query for user data
  const userData = await loaders.userLoader.load(user.id);

  return (
    <div className="space-y-8">
      <h1>Welcome, {userData.name}</h1>

      {/* These components will batch their queries */}
      <section>
        <h2>Your Recent Posts</h2>
        <UserPosts userId={user.id} />
      </section>

      <section>
        <h2>Activity Feed</h2>
        <ActivityFeed userId={user.id} />
      </section>

      <section>
        <h2>Notifications</h2>
        <NotificationsList userId={user.id} />
      </section>
    </div>
  );
}

async function UserPosts({ userId }: { userId: string }) {
  const loaders = getLoaderContext();
  const posts = await loaders.postsByAuthorLoader.load(userId);

  return (
    <div className="space-y-4">
      {posts.slice(0, 5).map((post) => (
        <PostSummary key={post.id} postId={post.id} />
      ))}
    </div>
  );
}

async function PostSummary({ postId }: { postId: string }) {
  const loaders = getLoaderContext();

  // These will be batched across all PostSummary instances
  const [post, comments] = await Promise.all([
    loaders.postLoader.load(postId),
    loaders.commentsLoader.load(postId),
  ]);

  return (
    <article className="border-b pb-4">
      <h3>{post.title}</h3>
      <p>{post._count.likes} likes, {comments.length} comments</p>
    </article>
  );
}

async function ActivityFeed({ userId }: { userId: string }) {
  // Direct query for activity - not using loaders as it's unique per user
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      actor: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const loaders = getLoaderContext();

  // Batch load related resources
  const relatedResourceIds = activities
    .filter((a) => a.resourceType === "post")
    .map((a) => a.resourceId);

  // Prime the cache with batch load
  await loaders.postLoader.loadMany(relatedResourceIds);

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

async function ActivityItem({ activity }: { activity: any }) {
  const loaders = getLoaderContext();

  // This will hit cache if primed above
  let resource = null;
  if (activity.resourceType === "post") {
    resource = await loaders.postLoader.load(activity.resourceId);
  }

  return (
    <div className="flex items-center gap-2">
      <span>{activity.actor.name}</span>
      <span>{activity.type}</span>
      {resource && <span>{resource.title}</span>}
    </div>
  );
}

async function NotificationsList({ userId }: { userId: string }) {
  const notifications = await prisma.notification.findMany({
    where: { userId, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div key={n.id} className="p-2 bg-blue-50 rounded">
          {n.message}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Batch Import with Progress Tracking

```typescript
// app/actions/import.ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { batchInsert } from "@/lib/db/query-utils";
import { transactionWithRetry } from "@/lib/db/transaction";

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
}

export async function importProducts(
  products: Array<{
    sku: string;
    name: string;
    price: number;
    categoryId: string;
  }>
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  let updated = 0;
  let failed = 0;

  // Validate all products first
  const validProducts = [];
  for (const product of products) {
    if (!product.sku || !product.name || product.price < 0) {
      failed++;
      errors.push(`Invalid product: ${JSON.stringify(product)}`);
      continue;
    }
    validProducts.push(product);
  }

  // Batch insert with upsert
  try {
    const result = await batchInsert("Product", validProducts, {
      batchSize: 50,
      onConflict: {
        fields: ["sku"],
        update: {
          name: undefined, // Will be set from incoming data
          price: undefined,
          updatedAt: new Date(),
        },
      },
    });

    imported = result.created;
    updated = result.updated;
  } catch (error) {
    failed += validProducts.length;
    errors.push(`Batch insert failed: ${(error as Error).message}`);
  }

  return {
    success: failed === 0,
    imported,
    updated,
    failed,
    errors,
  };
}

// With progress streaming
export async function* importProductsWithProgress(
  products: Array<{
    sku: string;
    name: string;
    price: number;
    categoryId: string;
  }>
): AsyncGenerator<{ progress: number; status: string }> {
  const batchSize = 50;
  const totalBatches = Math.ceil(products.length / batchSize);

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    yield {
      progress: (batchNumber / totalBatches) * 100,
      status: `Processing batch ${batchNumber}/${totalBatches}...`,
    };

    await transactionWithRetry(
      async (tx) => {
        for (const product of batch) {
          await tx.product.upsert({
            where: { sku: product.sku },
            create: product,
            update: {
              name: product.name,
              price: product.price,
              updatedAt: new Date(),
            },
          });
        }
      },
      { maxRetries: 3 }
    );
  }

  yield {
    progress: 100,
    status: `Import complete! Processed ${products.length} products.`,
  };
}
```

## Anti-patterns

### Anti-pattern 1: Creating New Prisma Client Per Request

```typescript
// BAD: Creates new client and connection pool per request
export async function GET(request: Request) {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany();
  await prisma.$disconnect(); // Still leaks connections under load
  return Response.json(users);
}

// GOOD: Use singleton pattern
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const users = await prisma.user.findMany();
  return Response.json(users);
}
```

### Anti-pattern 2: N+1 Queries in Loops

```typescript
// BAD: N+1 query - 1 query for posts, N queries for authors
async function getPosts() {
  const posts = await prisma.post.findMany({ take: 10 });

  for (const post of posts) {
    post.author = await prisma.user.findUnique({
      where: { id: post.authorId },
    });
  }

  return posts;
}

// GOOD: Use include or DataLoader
async function getPosts() {
  return prisma.post.findMany({
    take: 10,
    include: { author: true },
  });
}

// OR with DataLoader for more complex cases
async function getPosts() {
  const loaders = getLoaderContext();
  const posts = await prisma.post.findMany({ take: 10 });

  return Promise.all(
    posts.map(async (post) => ({
      ...post,
      author: await loaders.userLoader.load(post.authorId),
    }))
  );
}
```

### Anti-pattern 3: No Connection Timeout Handling

```typescript
// BAD: No timeout - can hang indefinitely
const result = await prisma.user.findMany({
  where: { /* complex query */ },
});

// GOOD: Use query timeout
const result = await Promise.race([
  prisma.user.findMany({
    where: { /* complex query */ },
  }),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Query timeout")), 5000)
  ),
]);

// BETTER: Configure at Prisma level
// In schema.prisma or connection string:
// ?connection_timeout=10&pool_timeout=5
```

### Anti-pattern 4: Ignoring Pool Exhaustion

```typescript
// BAD: No handling for pool exhaustion
async function processItems(items: Item[]) {
  // Processing 1000 items with parallel queries exhausts pool
  await Promise.all(
    items.map((item) =>
      prisma.item.update({
        where: { id: item.id },
        data: item,
      })
    )
  );
}

// GOOD: Batch with concurrency control
import pLimit from "p-limit";

async function processItems(items: Item[]) {
  const limit = pLimit(10); // Max 10 concurrent queries

  await Promise.all(
    items.map((item) =>
      limit(() =>
        prisma.item.update({
          where: { id: item.id },
          data: item,
        })
      )
    )
  );
}

// BETTER: Use batch update
async function processItems(items: Item[]) {
  // Group by similar updates
  await prisma.$transaction(
    items.map((item) =>
      prisma.item.update({
        where: { id: item.id },
        data: item,
      })
    )
  );
}
```

## Testing

### Unit Tests for Query Utilities

```typescript
// __tests__/db/query-utils.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { paginatedQuery, optimizedCount } from "@/lib/db/query-utils";
import { prisma } from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

describe("paginatedQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated results with cursor", async () => {
    const mockUsers = [
      { id: "1", name: "User 1" },
      { id: "2", name: "User 2" },
      { id: "3", name: "User 3" }, // Extra for hasMore detection
    ];

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

    const result = await paginatedQuery("User", {
      limit: 2,
    });

    expect(result.data).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe("2");
  });

  it("should handle last page correctly", async () => {
    const mockUsers = [
      { id: "1", name: "User 1" },
      { id: "2", name: "User 2" },
    ];

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

    const result = await paginatedQuery("User", {
      limit: 10,
    });

    expect(result.data).toHaveLength(2);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
});

describe("optimizedCount", () => {
  it("should use estimate for large tables", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ estimate: 1000000n }]);

    const count = await optimizedCount("User", undefined, {
      useEstimate: true,
      estimateThreshold: 10000,
    });

    expect(count).toBe(1000000);
    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(prisma.user.count).not.toHaveBeenCalled();
  });

  it("should use exact count for filtered queries", async () => {
    vi.mocked(prisma.user.count).mockResolvedValue(42);

    const count = await optimizedCount(
      "User",
      { status: "active" },
      { useEstimate: true }
    );

    expect(count).toBe(42);
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { status: "active" },
    });
  });
});
```

### Integration Tests for Connection Pool

```typescript
// __tests__/db/connection-pool.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { getPoolStats, monitorPoolHealth } from "@/lib/db/monitoring";

describe("Connection Pool", () => {
  beforeAll(async () => {
    // Ensure database is accessible
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should get pool statistics", async () => {
    const stats = await getPoolStats();

    expect(stats).toHaveProperty("activeConnections");
    expect(stats).toHaveProperty("idleConnections");
    expect(stats).toHaveProperty("maxConnections");
    expect(stats.maxConnections).toBeGreaterThan(0);
  });

  it("should report healthy status under normal load", async () => {
    const { healthy, warnings } = await monitorPoolHealth();

    expect(healthy).toBe(true);
    expect(warnings).toHaveLength(0);
  });

  it("should handle concurrent queries", async () => {
    const queries = Array.from({ length: 20 }, () =>
      prisma.$queryRaw`SELECT 1`
    );

    const results = await Promise.all(queries);

    expect(results).toHaveLength(20);
  });

  it("should recover from connection errors", async () => {
    // Simulate a failed query
    try {
      await prisma.$queryRawUnsafe("INVALID SQL");
    } catch {
      // Expected to fail
    }

    // Should still work after error
    const result = await prisma.$queryRaw`SELECT 1 as value`;
    expect(result).toBeDefined();
  });
});
```

### Load Tests for Pool Behavior

```typescript
// __tests__/db/load.test.ts
import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { getPoolStats } from "@/lib/db/monitoring";

describe("Connection Pool Load Tests", () => {
  it("should handle burst traffic", async () => {
    const startStats = await getPoolStats();
    const startActive = startStats.activeConnections;

    // Simulate burst of 50 concurrent queries
    const queries = Array.from({ length: 50 }, () =>
      prisma.user.findFirst().catch(() => null)
    );

    const start = Date.now();
    await Promise.all(queries);
    const duration = Date.now() - start;

    const endStats = await getPoolStats();

    console.log("Burst test results:", {
      duration: `${duration}ms`,
      startActive,
      endActive: endStats.activeConnections,
    });

    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000);
  });

  it("should not leak connections", async () => {
    const initialStats = await getPoolStats();

    // Run many sequential queries
    for (let i = 0; i < 100; i++) {
      await prisma.$queryRaw`SELECT 1`;
    }

    // Allow time for connection cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const finalStats = await getPoolStats();

    // Connection count should be similar
    const connectionDiff = Math.abs(
      finalStats.totalConnections - initialStats.totalConnections
    );

    expect(connectionDiff).toBeLessThan(5);
  });
});
```

## Related Skills

- [prisma-patterns.md](./prisma-patterns.md) - Prisma ORM patterns
- [prisma-setup.md](./prisma-setup.md) - Prisma initial setup
- [transactions.md](./transactions.md) - Database transactions
- [soft-delete.md](./soft-delete.md) - Soft delete patterns
- [seeding.md](./seeding.md) - Database seeding
- [metrics.md](./metrics.md) - Application metrics

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial comprehensive implementation
- Singleton Prisma client patterns
- Serverless-optimized configurations
- External pooler integration (Prisma Accelerate, PgBouncer, Neon)
- N+1 detection and prevention with DataLoader
- Query optimization utilities
- Connection pool monitoring
- Transaction retry logic
- Real-world examples
- Comprehensive testing patterns
