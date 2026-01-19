---
id: pt-multi-region
name: Multi-Region Database Architecture
version: 1.0.0
layer: L5
category: infrastructure
description: Comprehensive patterns for globally distributed Next.js 15 applications with multi-region databases
tags: [multi-region, geo-replication, distributed-database, consistency, failover, next15]
composes: []
dependencies:
  "@prisma/client": "^6.0.0"
  "@neondatabase/serverless": "^0.10.0"
  ioredis: "^5.0.0"
  "@planetscale/database": "^1.0.0"
formula: Multi-Region = Edge Routing + Regional Databases + Conflict Resolution + Failover Automation
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Multi-Region Database Architecture

## Overview

Multi-region database architecture enables Next.js 15 applications to serve users globally with low latency while maintaining data consistency across geographic boundaries. This pattern addresses the fundamental challenges of distributed systems: network partitions, consistency vs availability tradeoffs, and conflict resolution when concurrent writes occur in different regions.

The pattern leverages Next.js 15's edge runtime capabilities, Server Components, and Server Actions to intelligently route requests to the nearest database replica while ensuring users always see their own writes. It implements various consistency models from eventual consistency for non-critical data to strong consistency for financial transactions, with automatic conflict resolution strategies including last-write-wins, vector clocks, and application-specific merge logic.

This architecture supports multiple deployment topologies: single-leader with read replicas for simpler consistency guarantees, multi-leader for write availability during partitions, and leaderless designs using CRDTs for specific use cases. The implementation includes comprehensive monitoring, automatic failover, and graceful degradation strategies that keep applications functional even during regional outages.

---

## When to Use

- **Global user base** requiring low-latency access from multiple continents
- **Regulatory requirements** mandating data residency in specific regions
- **High availability requirements** with zero tolerance for single-region failures
- **Write-heavy workloads** distributed across multiple geographic locations
- **Disaster recovery** requiring hot standby in different regions
- **Edge computing** scenarios where data must be close to compute
- **Real-time applications** requiring sub-100ms response times globally

## When NOT to Use

- **Single-region user base** where latency isn't a concern
- **Simple CRUD applications** without high availability requirements
- **Strong consistency requirements** that cannot tolerate any replication lag
- **Budget constraints** that don't support multi-region infrastructure costs
- **Small datasets** where a single optimized database suffices
- **Development/staging environments** where complexity isn't justified
- **Applications with minimal traffic** that don't justify operational overhead

---

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Multi-Region Architecture                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │   US-East Edge   │    │   EU-West Edge   │    │  APAC Edge       │       │
│  │   ┌──────────┐   │    │   ┌──────────┐   │    │   ┌──────────┐   │       │
│  │   │ Next.js  │   │    │   │ Next.js  │   │    │   │ Next.js  │   │       │
│  │   │  Edge    │   │    │   │  Edge    │   │    │   │  Edge    │   │       │
│  │   └────┬─────┘   │    │   └────┬─────┘   │    │   └────┬─────┘   │       │
│  └────────┼─────────┘    └────────┼─────────┘    └────────┼─────────┘       │
│           │                       │                       │                  │
│           ▼                       ▼                       ▼                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Global Load Balancer                             │   │
│  │                  (Latency-based Routing)                             │   │
│  └────────┬─────────────────────┬─────────────────────┬─────────────────┘   │
│           │                     │                     │                      │
│           ▼                     ▼                     ▼                      │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐            │
│  │  US-East Region │   │  EU-West Region │   │   APAC Region   │            │
│  │  ┌───────────┐  │   │  ┌───────────┐  │   │  ┌───────────┐  │            │
│  │  │  Primary  │◄─┼───┼──┤  Replica  │◄─┼───┼──┤  Replica  │  │            │
│  │  │  (Leader) │──┼───┼─►│           │──┼───┼─►│           │  │            │
│  │  └───────────┘  │   │  └───────────┘  │   │  └───────────┘  │            │
│  │       │         │   │       │         │   │       │         │            │
│  │       ▼         │   │       ▼         │   │       ▼         │            │
│  │  ┌───────────┐  │   │  ┌───────────┐  │   │  ┌───────────┐  │            │
│  │  │Redis Cache│  │   │  │Redis Cache│  │   │  │Redis Cache│  │            │
│  │  └───────────┘  │   │  └───────────┘  │   │  └───────────┘  │            │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘            │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Replication & Sync Layer                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │  Sync WAL   │  │  Conflict   │  │  Failover   │                   │   │
│  │  │  Streaming  │  │  Resolution │  │  Manager    │                   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                       Session & Read-Your-Writes                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │  Session    │  │  Write      │  │  Consistency│                   │   │
│  │  │  Affinity   │  │  Tokens     │  │  Coordinator│                   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### 1. Multi-Region Database Configuration

```typescript
// lib/db/multi-region-config.ts
import { PrismaClient } from "@prisma/client";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Region configuration
interface RegionConfig {
  id: string;
  name: string;
  isPrimary: boolean;
  readEndpoint: string;
  writeEndpoint: string;
  latitude: number;
  longitude: number;
}

const REGIONS: RegionConfig[] = [
  {
    id: "us-east-1",
    name: "US East (N. Virginia)",
    isPrimary: true,
    readEndpoint: process.env.DB_US_EAST_READ!,
    writeEndpoint: process.env.DB_US_EAST_WRITE!,
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: "eu-west-1",
    name: "EU West (Ireland)",
    isPrimary: false,
    readEndpoint: process.env.DB_EU_WEST_READ!,
    writeEndpoint: process.env.DB_EU_WEST_WRITE!,
    latitude: 53.3498,
    longitude: -6.2603,
  },
  {
    id: "ap-southeast-1",
    name: "Asia Pacific (Singapore)",
    isPrimary: false,
    readEndpoint: process.env.DB_AP_SOUTHEAST_READ!,
    writeEndpoint: process.env.DB_AP_SOUTHEAST_WRITE!,
    latitude: 1.3521,
    longitude: 103.8198,
  },
];

// Calculate distance between two points (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest region based on coordinates
export function findNearestRegion(
  latitude: number,
  longitude: number
): RegionConfig {
  let nearestRegion = REGIONS[0];
  let minDistance = Infinity;

  for (const region of REGIONS) {
    const distance = calculateDistance(
      latitude,
      longitude,
      region.latitude,
      region.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestRegion = region;
    }
  }

  return nearestRegion;
}

// Multi-region Prisma client manager
class MultiRegionPrismaManager {
  private clients: Map<string, PrismaClient> = new Map();
  private healthStatus: Map<string, boolean> = new Map();

  constructor() {
    // Initialize clients for all regions
    for (const region of REGIONS) {
      this.initializeRegion(region);
    }

    // Start health checks
    this.startHealthChecks();
  }

  private initializeRegion(region: RegionConfig): void {
    // Configure for serverless/edge
    neonConfig.webSocketConstructor = ws;
    neonConfig.useSecureWebSocket = true;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;

    // Create read client
    const readPool = new Pool({ connectionString: region.readEndpoint });
    const readAdapter = new PrismaNeon(readPool);
    const readClient = new PrismaClient({
      adapter: readAdapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    // Create write client (points to primary or local for multi-leader)
    const writePool = new Pool({ connectionString: region.writeEndpoint });
    const writeAdapter = new PrismaNeon(writePool);
    const writeClient = new PrismaClient({
      adapter: writeAdapter,
      log: ["error"],
    });

    this.clients.set(`${region.id}-read`, readClient);
    this.clients.set(`${region.id}-write`, writeClient);
    this.healthStatus.set(region.id, true);
  }

  private async startHealthChecks(): Promise<void> {
    setInterval(async () => {
      for (const region of REGIONS) {
        try {
          const client = this.clients.get(`${region.id}-read`);
          if (client) {
            await client.$queryRaw`SELECT 1`;
            this.healthStatus.set(region.id, true);
          }
        } catch (error) {
          console.error(`Health check failed for ${region.id}:`, error);
          this.healthStatus.set(region.id, false);
        }
      }
    }, 10000); // Check every 10 seconds
  }

  getReadClient(regionId: string): PrismaClient {
    // Try requested region first
    if (this.healthStatus.get(regionId)) {
      const client = this.clients.get(`${regionId}-read`);
      if (client) return client;
    }

    // Fallback to healthy region
    for (const region of REGIONS) {
      if (this.healthStatus.get(region.id)) {
        const client = this.clients.get(`${region.id}-read`);
        if (client) return client;
      }
    }

    throw new Error("No healthy database regions available");
  }

  getWriteClient(regionId?: string): PrismaClient {
    // For single-leader: always write to primary
    const primaryRegion = REGIONS.find((r) => r.isPrimary)!;

    if (this.healthStatus.get(primaryRegion.id)) {
      const client = this.clients.get(`${primaryRegion.id}-write`);
      if (client) return client;
    }

    // Failover to secondary (requires promotion)
    throw new Error("Primary region unavailable - failover required");
  }

  getRegionHealth(): Map<string, boolean> {
    return new Map(this.healthStatus);
  }
}

// Singleton instance
const globalForDb = globalThis as unknown as {
  multiRegionDb: MultiRegionPrismaManager | undefined;
};

export const multiRegionDb =
  globalForDb.multiRegionDb ?? new MultiRegionPrismaManager();

if (process.env.NODE_ENV !== "production") {
  globalForDb.multiRegionDb = multiRegionDb;
}

export { REGIONS, type RegionConfig };
```

### 2. Read-Your-Writes Consistency Implementation

```typescript
// lib/db/read-your-writes.ts
import { cookies } from "next/headers";
import { Redis } from "ioredis";
import { multiRegionDb, REGIONS } from "./multi-region-config";

const redis = new Redis(process.env.REDIS_URL!);

// Write token format: { regionId, timestamp, version }
interface WriteToken {
  regionId: string;
  timestamp: number;
  version: string;
  userId: string;
}

// Session state for tracking writes
interface SessionState {
  lastWriteTokens: WriteToken[];
  preferredRegion: string;
}

const WRITE_TOKEN_TTL = 60; // 60 seconds - max replication lag we tolerate
const SESSION_STATE_PREFIX = "session:state:";

export class ReadYourWritesManager {
  // Generate unique version identifier
  private generateVersion(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Record a write operation
  async recordWrite(userId: string, regionId: string): Promise<WriteToken> {
    const token: WriteToken = {
      regionId,
      timestamp: Date.now(),
      version: this.generateVersion(),
      userId,
    };

    // Store in Redis with TTL
    const key = `write:${userId}:${token.version}`;
    await redis.setex(key, WRITE_TOKEN_TTL, JSON.stringify(token));

    // Add to user's write token list
    const listKey = `writes:${userId}`;
    await redis.lpush(listKey, JSON.stringify(token));
    await redis.ltrim(listKey, 0, 99); // Keep last 100 writes
    await redis.expire(listKey, WRITE_TOKEN_TTL);

    // Set cookie for client tracking
    const cookieStore = await cookies();
    cookieStore.set("last_write_token", token.version, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: WRITE_TOKEN_TTL,
    });

    return token;
  }

  // Check if a region has caught up with user's writes
  async hasReplicatedWrite(
    userId: string,
    regionId: string,
    writeToken: WriteToken
  ): Promise<boolean> {
    // If write was to this region, it's always consistent
    if (writeToken.regionId === regionId) {
      return true;
    }

    // Check replication status in Redis
    const replicationKey = `replication:${writeToken.version}:${regionId}`;
    const replicated = await redis.get(replicationKey);

    if (replicated) {
      return true;
    }

    // Check actual database for the write
    // This is a fallback - in production, use CDC or WAL position tracking
    const db = multiRegionDb.getReadClient(regionId);

    try {
      // Query replication status table
      const status = await db.$queryRaw<{ replicated: boolean }[]>`
        SELECT EXISTS(
          SELECT 1 FROM _replication_log
          WHERE version = ${writeToken.version}
        ) as replicated
      `;

      if (status[0]?.replicated) {
        // Cache the result
        await redis.setex(replicationKey, WRITE_TOKEN_TTL, "1");
        return true;
      }
    } catch (error) {
      console.error("Replication check failed:", error);
    }

    return false;
  }

  // Get the best region for reads ensuring consistency
  async getConsistentReadRegion(
    userId: string,
    preferredRegionId: string
  ): Promise<string> {
    // Get user's recent write tokens
    const listKey = `writes:${userId}`;
    const recentWrites = await redis.lrange(listKey, 0, 9);

    if (recentWrites.length === 0) {
      // No recent writes - use nearest region
      return preferredRegionId;
    }

    // Parse tokens and find most recent
    const tokens: WriteToken[] = recentWrites.map((w) => JSON.parse(w));
    const mostRecentWrite = tokens[0];

    // Check if write has aged out (past max replication lag)
    const writeAge = Date.now() - mostRecentWrite.timestamp;
    if (writeAge > WRITE_TOKEN_TTL * 1000) {
      return preferredRegionId;
    }

    // Check if preferred region has replicated
    const hasReplicated = await this.hasReplicatedWrite(
      userId,
      preferredRegionId,
      mostRecentWrite
    );

    if (hasReplicated) {
      return preferredRegionId;
    }

    // Route to write region for consistency
    return mostRecentWrite.regionId;
  }

  // Middleware to ensure read-your-writes
  async ensureConsistency<T>(
    userId: string,
    preferredRegionId: string,
    readOperation: (regionId: string) => Promise<T>
  ): Promise<{ data: T; regionId: string; wasRedirected: boolean }> {
    const consistentRegion = await this.getConsistentReadRegion(
      userId,
      preferredRegionId
    );
    const wasRedirected = consistentRegion !== preferredRegionId;

    const data = await readOperation(consistentRegion);

    return { data, regionId: consistentRegion, wasRedirected };
  }
}

// Singleton instance
export const readYourWrites = new ReadYourWritesManager();

// React Server Component helper
export async function withReadYourWrites<T>(
  userId: string,
  operation: (db: typeof import("@prisma/client").PrismaClient) => Promise<T>
): Promise<T> {
  const cookieStore = await cookies();
  const geoHeader = cookieStore.get("x-vercel-ip-country")?.value || "US";

  // Map country to region (simplified)
  const regionMap: Record<string, string> = {
    US: "us-east-1",
    CA: "us-east-1",
    GB: "eu-west-1",
    DE: "eu-west-1",
    FR: "eu-west-1",
    SG: "ap-southeast-1",
    JP: "ap-southeast-1",
    AU: "ap-southeast-1",
  };

  const preferredRegion = regionMap[geoHeader] || "us-east-1";
  const consistentRegion = await readYourWrites.getConsistentReadRegion(
    userId,
    preferredRegion
  );

  const db = multiRegionDb.getReadClient(consistentRegion);
  return operation(db);
}
```

### 3. Write-Write Conflict Resolution

```typescript
// lib/db/write-conflicts.ts
import { Redis } from "ioredis";
import { multiRegionDb } from "./multi-region-config";
import { readYourWrites } from "./read-your-writes";

const redis = new Redis(process.env.REDIS_URL!);

// Vector clock for causality tracking
interface VectorClock {
  [regionId: string]: number;
}

// Conflict resolution strategies
type ConflictStrategy =
  | "last-write-wins"
  | "first-write-wins"
  | "merge"
  | "manual"
  | "custom";

interface ConflictRecord<T> {
  id: string;
  entityType: string;
  entityId: string;
  conflictingWrites: Array<{
    regionId: string;
    timestamp: number;
    vectorClock: VectorClock;
    data: T;
    userId: string;
  }>;
  resolvedAt?: number;
  resolution?: T;
  strategy: ConflictStrategy;
}

// Write operation with conflict detection
interface WriteOperation<T> {
  entityType: string;
  entityId: string;
  data: T;
  userId: string;
  regionId: string;
  vectorClock: VectorClock;
  timestamp: number;
}

export class WriteConflictManager {
  // Increment vector clock for a region
  incrementClock(clock: VectorClock, regionId: string): VectorClock {
    return {
      ...clock,
      [regionId]: (clock[regionId] || 0) + 1,
    };
  }

  // Compare two vector clocks
  // Returns: 'before' | 'after' | 'concurrent' | 'equal'
  compareClocks(
    a: VectorClock,
    b: VectorClock
  ): "before" | "after" | "concurrent" | "equal" {
    let aBeforeB = true;
    let bBeforeA = true;

    const allRegions = new Set([...Object.keys(a), ...Object.keys(b)]);

    for (const region of allRegions) {
      const aVal = a[region] || 0;
      const bVal = b[region] || 0;

      if (aVal > bVal) bBeforeA = false;
      if (bVal > aVal) aBeforeB = false;
    }

    if (aBeforeB && bBeforeA) return "equal";
    if (aBeforeB) return "before";
    if (bBeforeA) return "after";
    return "concurrent";
  }

  // Merge vector clocks (take max of each component)
  mergeClocks(a: VectorClock, b: VectorClock): VectorClock {
    const merged: VectorClock = { ...a };
    for (const [region, value] of Object.entries(b)) {
      merged[region] = Math.max(merged[region] || 0, value);
    }
    return merged;
  }

  // Get current vector clock for an entity
  async getVectorClock(
    entityType: string,
    entityId: string
  ): Promise<VectorClock> {
    const key = `vclock:${entityType}:${entityId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : {};
  }

  // Update vector clock after successful write
  async updateVectorClock(
    entityType: string,
    entityId: string,
    clock: VectorClock
  ): Promise<void> {
    const key = `vclock:${entityType}:${entityId}`;
    await redis.set(key, JSON.stringify(clock));
  }

  // Attempt write with conflict detection
  async attemptWrite<T>(
    operation: WriteOperation<T>,
    strategy: ConflictStrategy = "last-write-wins",
    customMerge?: (writes: WriteOperation<T>[]) => T
  ): Promise<{ success: boolean; conflict?: ConflictRecord<T>; result?: T }> {
    const { entityType, entityId, data, userId, regionId, timestamp } =
      operation;

    // Lock the entity during write
    const lockKey = `lock:${entityType}:${entityId}`;
    const lockAcquired = await redis.set(lockKey, regionId, "NX", "EX", 5);

    if (!lockAcquired) {
      // Another write in progress - wait and retry
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.attemptWrite(operation, strategy, customMerge);
    }

    try {
      // Get current state and vector clock
      const currentClock = await this.getVectorClock(entityType, entityId);
      const clockComparison = this.compareClocks(
        operation.vectorClock,
        currentClock
      );

      // Check for concurrent writes (conflict)
      if (clockComparison === "concurrent") {
        // Conflict detected
        const conflict = await this.handleConflict(
          operation,
          currentClock,
          strategy,
          customMerge
        );

        if (conflict) {
          return { success: false, conflict };
        }
      }

      if (clockComparison === "before") {
        // Our write is stale - reject
        return {
          success: false,
          conflict: {
            id: `conflict-${Date.now()}`,
            entityType,
            entityId,
            conflictingWrites: [
              {
                ...operation,
                data,
              },
            ],
            strategy,
          },
        };
      }

      // Proceed with write
      const newClock = this.incrementClock(
        this.mergeClocks(operation.vectorClock, currentClock),
        regionId
      );

      const db = multiRegionDb.getWriteClient();

      // Perform the actual database write
      const result = await this.performWrite(db, entityType, entityId, data);

      // Update vector clock
      await this.updateVectorClock(entityType, entityId, newClock);

      // Record write for read-your-writes consistency
      await readYourWrites.recordWrite(userId, regionId);

      // Publish write event for cross-region replication
      await this.publishWriteEvent({
        entityType,
        entityId,
        data: result,
        vectorClock: newClock,
        regionId,
        timestamp,
      });

      return { success: true, result };
    } finally {
      // Release lock
      await redis.del(lockKey);
    }
  }

  // Handle detected conflict based on strategy
  private async handleConflict<T>(
    operation: WriteOperation<T>,
    currentClock: VectorClock,
    strategy: ConflictStrategy,
    customMerge?: (writes: WriteOperation<T>[]) => T
  ): Promise<ConflictRecord<T> | null> {
    const { entityType, entityId, data, userId, regionId, timestamp } =
      operation;

    // Get the conflicting write from the other region
    const conflictingData = await this.getConflictingWrites<T>(
      entityType,
      entityId
    );

    const conflictingWrites = [
      ...conflictingData,
      {
        regionId,
        timestamp,
        vectorClock: operation.vectorClock,
        data,
        userId,
      },
    ];

    switch (strategy) {
      case "last-write-wins":
        // Resolve automatically - latest timestamp wins
        const latestWrite = conflictingWrites.reduce((latest, write) =>
          write.timestamp > latest.timestamp ? write : latest
        );
        await this.applyResolution(entityType, entityId, latestWrite.data);
        return null;

      case "first-write-wins":
        // Keep the first write
        const firstWrite = conflictingWrites.reduce((first, write) =>
          write.timestamp < first.timestamp ? write : first
        );
        await this.applyResolution(entityType, entityId, firstWrite.data);
        return null;

      case "merge":
        if (customMerge) {
          const merged = customMerge(conflictingWrites as WriteOperation<T>[]);
          await this.applyResolution(entityType, entityId, merged);
          return null;
        }
        // Fall through to manual if no merge function
        break;

      case "manual":
        // Store conflict for manual resolution
        const conflict: ConflictRecord<T> = {
          id: `conflict-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          entityType,
          entityId,
          conflictingWrites,
          strategy,
        };
        await this.storeConflict(conflict);
        return conflict;

      case "custom":
        if (customMerge) {
          const customResolved = customMerge(
            conflictingWrites as WriteOperation<T>[]
          );
          await this.applyResolution(entityType, entityId, customResolved);
          return null;
        }
        break;
    }

    // Default: store for manual resolution
    const conflict: ConflictRecord<T> = {
      id: `conflict-${Date.now()}`,
      entityType,
      entityId,
      conflictingWrites,
      strategy: "manual",
    };
    await this.storeConflict(conflict);
    return conflict;
  }

  // Get conflicting writes from other regions
  private async getConflictingWrites<T>(
    entityType: string,
    entityId: string
  ): Promise<
    Array<{
      regionId: string;
      timestamp: number;
      vectorClock: VectorClock;
      data: T;
      userId: string;
    }>
  > {
    const key = `pending_writes:${entityType}:${entityId}`;
    const writes = await redis.lrange(key, 0, -1);
    return writes.map((w) => JSON.parse(w));
  }

  // Store conflict for later resolution
  private async storeConflict<T>(conflict: ConflictRecord<T>): Promise<void> {
    const key = `conflicts:${conflict.entityType}:${conflict.entityId}`;
    await redis.set(key, JSON.stringify(conflict));

    // Add to conflicts list for admin resolution
    await redis.lpush("conflicts:pending", conflict.id);
    await redis.set(`conflict:${conflict.id}`, JSON.stringify(conflict));
  }

  // Apply resolved data to database
  private async applyResolution<T>(
    entityType: string,
    entityId: string,
    data: T
  ): Promise<void> {
    const db = multiRegionDb.getWriteClient();
    await this.performWrite(db, entityType, entityId, data);
  }

  // Perform actual database write (generic)
  private async performWrite<T>(
    db: any,
    entityType: string,
    entityId: string,
    data: T
  ): Promise<T> {
    // Dynamic model access based on entity type
    const model = (db as any)[entityType];
    if (!model) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    return model.upsert({
      where: { id: entityId },
      update: data,
      create: { id: entityId, ...data },
    });
  }

  // Publish write event for cross-region sync
  private async publishWriteEvent(event: {
    entityType: string;
    entityId: string;
    data: any;
    vectorClock: VectorClock;
    regionId: string;
    timestamp: number;
  }): Promise<void> {
    const channel = `writes:${event.entityType}`;
    await redis.publish(channel, JSON.stringify(event));

    // Also store in stream for reliable delivery
    await redis.xadd(
      `write_stream:${event.entityType}`,
      "*",
      "event",
      JSON.stringify(event)
    );
  }

  // Resolve conflict manually
  async resolveConflict<T>(
    conflictId: string,
    resolution: T,
    resolvedBy: string
  ): Promise<void> {
    const conflictData = await redis.get(`conflict:${conflictId}`);
    if (!conflictData) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    const conflict: ConflictRecord<T> = JSON.parse(conflictData);

    // Apply resolution
    await this.applyResolution(conflict.entityType, conflict.entityId, resolution);

    // Update conflict record
    conflict.resolvedAt = Date.now();
    conflict.resolution = resolution;
    await redis.set(`conflict:${conflictId}`, JSON.stringify(conflict));

    // Remove from pending list
    await redis.lrem("conflicts:pending", 0, conflictId);
    await redis.del(`conflicts:${conflict.entityType}:${conflict.entityId}`);
  }
}

// Singleton instance
export const writeConflicts = new WriteConflictManager();
```

### 4. Geo-Replication Coordinator

```typescript
// lib/db/geo-replication.ts
import { Redis } from "ioredis";
import { REGIONS, RegionConfig, multiRegionDb } from "./multi-region-config";

const redis = new Redis(process.env.REDIS_URL!);

interface ReplicationEvent {
  id: string;
  sourceRegion: string;
  targetRegions: string[];
  entityType: string;
  entityId: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  data: any;
  vectorClock: Record<string, number>;
  timestamp: number;
  status: "pending" | "replicating" | "completed" | "failed";
  retries: number;
}

interface ReplicationLag {
  sourceRegion: string;
  targetRegion: string;
  lagMs: number;
  lastSyncedTimestamp: number;
  pendingEvents: number;
}

export class GeoReplicationCoordinator {
  private subscribedChannels: Set<string> = new Set();
  private subscriber: Redis;

  constructor() {
    this.subscriber = new Redis(process.env.REDIS_URL!);
    this.initializeSubscriptions();
  }

  private async initializeSubscriptions(): Promise<void> {
    // Subscribe to write events from all regions
    for (const region of REGIONS) {
      const channel = `region:${region.id}:writes`;
      await this.subscriber.subscribe(channel);
      this.subscribedChannels.add(channel);
    }

    // Handle incoming replication events
    this.subscriber.on("message", async (channel, message) => {
      const event: ReplicationEvent = JSON.parse(message);
      await this.handleReplicationEvent(event);
    });
  }

  // Handle incoming replication event
  private async handleReplicationEvent(event: ReplicationEvent): Promise<void> {
    const currentRegion = process.env.CURRENT_REGION!;

    // Skip if this event originated from current region
    if (event.sourceRegion === currentRegion) {
      return;
    }

    // Skip if current region is not in target list
    if (!event.targetRegions.includes(currentRegion)) {
      return;
    }

    console.log(`Replicating ${event.operation} for ${event.entityType}:${event.entityId}`);

    try {
      const db = multiRegionDb.getWriteClient(currentRegion);

      switch (event.operation) {
        case "INSERT":
          await this.replicateInsert(db, event);
          break;
        case "UPDATE":
          await this.replicateUpdate(db, event);
          break;
        case "DELETE":
          await this.replicateDelete(db, event);
          break;
      }

      // Mark replication complete
      await this.markReplicationComplete(event, currentRegion);
    } catch (error) {
      console.error(`Replication failed for event ${event.id}:`, error);
      await this.handleReplicationFailure(event, currentRegion, error);
    }
  }

  // Replicate INSERT operation
  private async replicateInsert(db: any, event: ReplicationEvent): Promise<void> {
    const model = (db as any)[event.entityType];
    if (!model) {
      throw new Error(`Unknown entity type: ${event.entityType}`);
    }

    await model.upsert({
      where: { id: event.entityId },
      update: event.data,
      create: { id: event.entityId, ...event.data },
    });
  }

  // Replicate UPDATE operation
  private async replicateUpdate(db: any, event: ReplicationEvent): Promise<void> {
    const model = (db as any)[event.entityType];
    if (!model) {
      throw new Error(`Unknown entity type: ${event.entityType}`);
    }

    await model.update({
      where: { id: event.entityId },
      data: event.data,
    });
  }

  // Replicate DELETE operation
  private async replicateDelete(db: any, event: ReplicationEvent): Promise<void> {
    const model = (db as any)[event.entityType];
    if (!model) {
      throw new Error(`Unknown entity type: ${event.entityType}`);
    }

    await model.delete({
      where: { id: event.entityId },
    });
  }

  // Mark replication as complete for a region
  private async markReplicationComplete(
    event: ReplicationEvent,
    regionId: string
  ): Promise<void> {
    const key = `replication:${event.id}:${regionId}`;
    await redis.set(key, JSON.stringify({
      completedAt: Date.now(),
      status: "completed",
    }));

    // Update replication lag metrics
    const lagKey = `replication_lag:${event.sourceRegion}:${regionId}`;
    const lag = Date.now() - event.timestamp;
    await redis.set(lagKey, JSON.stringify({
      lagMs: lag,
      lastSyncedTimestamp: event.timestamp,
      measuredAt: Date.now(),
    }));
  }

  // Handle replication failure
  private async handleReplicationFailure(
    event: ReplicationEvent,
    regionId: string,
    error: any
  ): Promise<void> {
    event.retries = (event.retries || 0) + 1;

    if (event.retries < 3) {
      // Retry with exponential backoff
      const delay = Math.pow(2, event.retries) * 1000;
      setTimeout(() => this.handleReplicationEvent(event), delay);
    } else {
      // Move to dead letter queue
      await redis.lpush("replication:dlq", JSON.stringify({
        event,
        regionId,
        error: error.message,
        failedAt: Date.now(),
      }));
    }
  }

  // Publish write for replication to other regions
  async publishWrite(
    sourceRegion: string,
    entityType: string,
    entityId: string,
    operation: "INSERT" | "UPDATE" | "DELETE",
    data: any,
    vectorClock: Record<string, number>
  ): Promise<ReplicationEvent> {
    const event: ReplicationEvent = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sourceRegion,
      targetRegions: REGIONS.filter((r) => r.id !== sourceRegion).map((r) => r.id),
      entityType,
      entityId,
      operation,
      data,
      vectorClock,
      timestamp: Date.now(),
      status: "pending",
      retries: 0,
    };

    // Store event for tracking
    await redis.set(`replication:event:${event.id}`, JSON.stringify(event));

    // Publish to all target regions
    const channel = `region:${sourceRegion}:writes`;
    await redis.publish(channel, JSON.stringify(event));

    // Also store in stream for reliable delivery
    await redis.xadd("replication_stream", "*", "event", JSON.stringify(event));

    return event;
  }

  // Get replication lag for all region pairs
  async getReplicationLags(): Promise<ReplicationLag[]> {
    const lags: ReplicationLag[] = [];

    for (const source of REGIONS) {
      for (const target of REGIONS) {
        if (source.id === target.id) continue;

        const lagKey = `replication_lag:${source.id}:${target.id}`;
        const lagData = await redis.get(lagKey);

        if (lagData) {
          const parsed = JSON.parse(lagData);
          lags.push({
            sourceRegion: source.id,
            targetRegion: target.id,
            lagMs: parsed.lagMs,
            lastSyncedTimestamp: parsed.lastSyncedTimestamp,
            pendingEvents: await this.getPendingEventCount(source.id, target.id),
          });
        } else {
          lags.push({
            sourceRegion: source.id,
            targetRegion: target.id,
            lagMs: -1, // Unknown
            lastSyncedTimestamp: 0,
            pendingEvents: 0,
          });
        }
      }
    }

    return lags;
  }

  // Get count of pending replication events
  private async getPendingEventCount(
    sourceRegion: string,
    targetRegion: string
  ): Promise<number> {
    const key = `pending_replication:${sourceRegion}:${targetRegion}`;
    return redis.llen(key);
  }

  // Force sync a specific entity across all regions
  async forceSync(
    entityType: string,
    entityId: string,
    sourceRegion: string
  ): Promise<void> {
    const db = multiRegionDb.getReadClient(sourceRegion);
    const model = (db as any)[entityType];

    if (!model) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const data = await model.findUnique({ where: { id: entityId } });

    if (!data) {
      // Entity doesn't exist - replicate delete
      await this.publishWrite(sourceRegion, entityType, entityId, "DELETE", null, {});
    } else {
      // Replicate current state
      await this.publishWrite(
        sourceRegion,
        entityType,
        entityId,
        "UPDATE",
        data,
        { [sourceRegion]: Date.now() }
      );
    }
  }
}

// Singleton instance
export const geoReplication = new GeoReplicationCoordinator();
```

### 5. Failover Manager

```typescript
// lib/db/failover-manager.ts
import { Redis } from "ioredis";
import { REGIONS, RegionConfig, multiRegionDb } from "./multi-region-config";

const redis = new Redis(process.env.REDIS_URL!);

interface RegionStatus {
  regionId: string;
  healthy: boolean;
  lastHealthCheck: number;
  consecutiveFailures: number;
  latencyMs: number;
  isPrimary: boolean;
  isPromoting: boolean;
}

interface FailoverEvent {
  id: string;
  timestamp: number;
  fromRegion: string;
  toRegion: string;
  reason: string;
  status: "initiated" | "in_progress" | "completed" | "failed" | "rolled_back";
  completedAt?: number;
  error?: string;
}

const HEALTH_CHECK_INTERVAL = 5000; // 5 seconds
const FAILURE_THRESHOLD = 3; // Consecutive failures before failover
const FAILOVER_COOLDOWN = 300000; // 5 minutes between failovers

export class FailoverManager {
  private regionStatus: Map<string, RegionStatus> = new Map();
  private lastFailoverTime: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeRegionStatus();
    this.startHealthChecks();
  }

  private initializeRegionStatus(): void {
    for (const region of REGIONS) {
      this.regionStatus.set(region.id, {
        regionId: region.id,
        healthy: true,
        lastHealthCheck: Date.now(),
        consecutiveFailures: 0,
        latencyMs: 0,
        isPrimary: region.isPrimary,
        isPromoting: false,
      });
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, HEALTH_CHECK_INTERVAL);
  }

  // Perform health checks on all regions
  private async performHealthChecks(): Promise<void> {
    const checks = REGIONS.map((region) => this.checkRegionHealth(region));
    await Promise.all(checks);
  }

  // Check health of a single region
  private async checkRegionHealth(region: RegionConfig): Promise<void> {
    const status = this.regionStatus.get(region.id)!;
    const startTime = Date.now();

    try {
      const db = multiRegionDb.getReadClient(region.id);

      // Perform health query with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Health check timeout")), 3000)
      );

      await Promise.race([db.$queryRaw`SELECT 1`, timeoutPromise]);

      // Health check passed
      status.healthy = true;
      status.consecutiveFailures = 0;
      status.latencyMs = Date.now() - startTime;
      status.lastHealthCheck = Date.now();

      // Publish healthy status
      await this.publishRegionStatus(status);
    } catch (error) {
      // Health check failed
      status.consecutiveFailures++;
      status.lastHealthCheck = Date.now();
      status.latencyMs = -1;

      console.error(`Health check failed for ${region.id}:`, error);

      if (status.consecutiveFailures >= FAILURE_THRESHOLD) {
        status.healthy = false;
        await this.handleRegionFailure(region);
      }

      await this.publishRegionStatus(status);
    }
  }

  // Publish region status to Redis for global visibility
  private async publishRegionStatus(status: RegionStatus): Promise<void> {
    const key = `region_status:${status.regionId}`;
    await redis.set(key, JSON.stringify(status));
    await redis.publish("region_status_updates", JSON.stringify(status));
  }

  // Handle region failure - initiate failover if primary
  private async handleRegionFailure(region: RegionConfig): Promise<void> {
    console.warn(`Region ${region.id} marked as unhealthy`);

    // Only failover if primary region failed
    if (!region.isPrimary) {
      console.log(`Non-primary region ${region.id} failed - no failover needed`);
      return;
    }

    // Check cooldown
    if (Date.now() - this.lastFailoverTime < FAILOVER_COOLDOWN) {
      console.warn("Failover cooldown in effect - skipping automatic failover");
      return;
    }

    // Find best candidate for promotion
    const candidate = await this.findPromotionCandidate();
    if (!candidate) {
      console.error("No healthy region available for failover!");
      return;
    }

    // Initiate failover
    await this.initiateFailover(region.id, candidate.id, "Primary region health check failed");
  }

  // Find best region to promote as new primary
  private async findPromotionCandidate(): Promise<RegionConfig | null> {
    let bestCandidate: RegionConfig | null = null;
    let lowestLag = Infinity;

    for (const region of REGIONS) {
      const status = this.regionStatus.get(region.id);
      if (!status?.healthy || status.isPrimary) continue;

      // Get replication lag for this region
      const lag = await this.getReplicationLag(region.id);
      if (lag < lowestLag) {
        lowestLag = lag;
        bestCandidate = region;
      }
    }

    return bestCandidate;
  }

  // Get replication lag for a region
  private async getReplicationLag(regionId: string): Promise<number> {
    const lagKey = `replication_lag:*:${regionId}`;
    const keys = await redis.keys(lagKey);

    if (keys.length === 0) return Infinity;

    let maxLag = 0;
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        maxLag = Math.max(maxLag, parsed.lagMs);
      }
    }

    return maxLag;
  }

  // Initiate failover process
  async initiateFailover(
    fromRegion: string,
    toRegion: string,
    reason: string
  ): Promise<FailoverEvent> {
    const event: FailoverEvent = {
      id: `failover-${Date.now()}`,
      timestamp: Date.now(),
      fromRegion,
      toRegion,
      reason,
      status: "initiated",
    };

    console.log(`Initiating failover from ${fromRegion} to ${toRegion}: ${reason}`);

    // Store failover event
    await redis.set(`failover:${event.id}`, JSON.stringify(event));
    await redis.lpush("failover:history", event.id);

    try {
      // Step 1: Mark target region as promoting
      const targetStatus = this.regionStatus.get(toRegion)!;
      targetStatus.isPromoting = true;
      await this.publishRegionStatus(targetStatus);

      event.status = "in_progress";
      await redis.set(`failover:${event.id}`, JSON.stringify(event));

      // Step 2: Wait for replication to catch up (max 30 seconds)
      await this.waitForReplicationCatchup(toRegion, 30000);

      // Step 3: Promote the new primary
      await this.promoteRegion(toRegion);

      // Step 4: Update old primary status
      const oldStatus = this.regionStatus.get(fromRegion)!;
      oldStatus.isPrimary = false;
      await this.publishRegionStatus(oldStatus);

      // Step 5: Mark new region as primary
      targetStatus.isPrimary = true;
      targetStatus.isPromoting = false;
      await this.publishRegionStatus(targetStatus);

      // Complete failover
      event.status = "completed";
      event.completedAt = Date.now();
      await redis.set(`failover:${event.id}`, JSON.stringify(event));

      this.lastFailoverTime = Date.now();
      console.log(`Failover completed: ${toRegion} is now primary`);

      // Notify all clients
      await redis.publish("failover_events", JSON.stringify(event));

      return event;
    } catch (error: any) {
      console.error("Failover failed:", error);

      event.status = "failed";
      event.error = error.message;
      await redis.set(`failover:${event.id}`, JSON.stringify(event));

      // Reset promoting status
      const targetStatus = this.regionStatus.get(toRegion)!;
      targetStatus.isPromoting = false;
      await this.publishRegionStatus(targetStatus);

      throw error;
    }
  }

  // Wait for replication to catch up before promotion
  private async waitForReplicationCatchup(
    regionId: string,
    timeoutMs: number
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const lag = await this.getReplicationLag(regionId);

      // Consider caught up if lag is less than 1 second
      if (lag < 1000) {
        console.log(`Region ${regionId} replication caught up (lag: ${lag}ms)`);
        return;
      }

      console.log(`Waiting for replication catchup: ${lag}ms lag`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.warn(`Replication catchup timeout - proceeding with failover`);
  }

  // Promote a region to primary
  private async promoteRegion(regionId: string): Promise<void> {
    // This would trigger the actual database promotion
    // Implementation depends on the database being used

    // For managed databases like PlanetScale, Neon, CockroachDB:
    // This is typically done via their API

    // For self-managed PostgreSQL with streaming replication:
    // You would execute pg_promote() on the replica

    // For demonstration, we update our tracking state
    await redis.set(`primary_region`, regionId);

    // Update REGIONS configuration
    const region = REGIONS.find((r) => r.id === regionId);
    if (region) {
      // Swap endpoints (in a real implementation, DNS would be updated)
      console.log(`Promoted ${regionId} to primary`);
    }
  }

  // Get current primary region
  async getCurrentPrimary(): Promise<string> {
    const primary = await redis.get("primary_region");
    if (primary) return primary;

    // Fallback to configured primary
    const primaryRegion = REGIONS.find((r) => r.isPrimary);
    return primaryRegion?.id || REGIONS[0].id;
  }

  // Get all region statuses
  getAllRegionStatus(): Map<string, RegionStatus> {
    return new Map(this.regionStatus);
  }

  // Get failover history
  async getFailoverHistory(limit: number = 10): Promise<FailoverEvent[]> {
    const ids = await redis.lrange("failover:history", 0, limit - 1);
    const events: FailoverEvent[] = [];

    for (const id of ids) {
      const data = await redis.get(`failover:${id}`);
      if (data) {
        events.push(JSON.parse(data));
      }
    }

    return events;
  }

  // Manual failover trigger
  async triggerManualFailover(toRegion: string, reason: string): Promise<FailoverEvent> {
    const currentPrimary = await this.getCurrentPrimary();

    if (currentPrimary === toRegion) {
      throw new Error(`Region ${toRegion} is already the primary`);
    }

    const status = this.regionStatus.get(toRegion);
    if (!status?.healthy) {
      throw new Error(`Cannot failover to unhealthy region ${toRegion}`);
    }

    return this.initiateFailover(currentPrimary, toRegion, `Manual failover: ${reason}`);
  }

  // Cleanup
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Singleton instance
const globalForFailover = globalThis as unknown as {
  failoverManager: FailoverManager | undefined;
};

export const failoverManager =
  globalForFailover.failoverManager ?? new FailoverManager();

if (process.env.NODE_ENV !== "production") {
  globalForFailover.failoverManager = failoverManager;
}
```

### 6. Server Actions Integration

```typescript
// app/actions/multi-region-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { multiRegionDb, findNearestRegion } from "@/lib/db/multi-region-config";
import { readYourWrites } from "@/lib/db/read-your-writes";
import { writeConflicts } from "@/lib/db/write-conflicts";
import { geoReplication } from "@/lib/db/geo-replication";

// Get user's region from headers
async function getUserRegion(): Promise<string> {
  const headersList = await headers();

  // Vercel provides geo headers
  const latitude = parseFloat(headersList.get("x-vercel-ip-latitude") || "0");
  const longitude = parseFloat(headersList.get("x-vercel-ip-longitude") || "0");

  if (latitude && longitude) {
    const region = findNearestRegion(latitude, longitude);
    return region.id;
  }

  // Fallback to country-based routing
  const country = headersList.get("x-vercel-ip-country") || "US";
  const regionMap: Record<string, string> = {
    US: "us-east-1",
    CA: "us-east-1",
    GB: "eu-west-1",
    DE: "eu-west-1",
    FR: "eu-west-1",
    SG: "ap-southeast-1",
    JP: "ap-southeast-1",
    AU: "ap-southeast-1",
  };

  return regionMap[country] || "us-east-1";
}

// Read operation with consistency guarantee
export async function getDocument(documentId: string, userId: string) {
  const preferredRegion = await getUserRegion();

  const result = await readYourWrites.ensureConsistency(
    userId,
    preferredRegion,
    async (regionId) => {
      const db = multiRegionDb.getReadClient(regionId);

      return db.document.findUnique({
        where: { id: documentId },
        include: {
          author: true,
          collaborators: true,
        },
      });
    }
  );

  return {
    document: result.data,
    servedFromRegion: result.regionId,
    wasRedirected: result.wasRedirected,
  };
}

// Write operation with conflict resolution
export async function updateDocument(
  documentId: string,
  userId: string,
  updates: {
    title?: string;
    content?: string;
  }
) {
  const regionId = await getUserRegion();

  // Get current vector clock
  const vectorClock = await writeConflicts.getVectorClock("document", documentId);

  // Attempt write with last-write-wins for simple fields
  const result = await writeConflicts.attemptWrite(
    {
      entityType: "document",
      entityId: documentId,
      data: {
        ...updates,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      },
      userId,
      regionId,
      vectorClock,
      timestamp: Date.now(),
    },
    "last-write-wins"
  );

  if (!result.success) {
    // Conflict detected
    return {
      success: false,
      conflict: result.conflict,
      message: "Conflict detected - document was modified by another user",
    };
  }

  // Trigger replication to other regions
  await geoReplication.publishWrite(
    regionId,
    "document",
    documentId,
    "UPDATE",
    result.result,
    await writeConflicts.getVectorClock("document", documentId)
  );

  revalidatePath(`/documents/${documentId}`);

  return {
    success: true,
    document: result.result,
    region: regionId,
  };
}

// Create operation with global replication
export async function createDocument(
  userId: string,
  data: {
    title: string;
    content: string;
  }
) {
  const regionId = await getUserRegion();
  const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Initial vector clock
  const vectorClock = { [regionId]: 1 };

  const result = await writeConflicts.attemptWrite(
    {
      entityType: "document",
      entityId: documentId,
      data: {
        title: data.title,
        content: data.content,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      userId,
      regionId,
      vectorClock,
      timestamp: Date.now(),
    },
    "first-write-wins" // Prevent duplicate creation
  );

  if (!result.success) {
    return {
      success: false,
      error: "Failed to create document",
    };
  }

  // Replicate to all regions
  await geoReplication.publishWrite(
    regionId,
    "document",
    documentId,
    "INSERT",
    result.result,
    vectorClock
  );

  revalidatePath("/documents");

  return {
    success: true,
    document: result.result,
    region: regionId,
  };
}

// Delete with global propagation
export async function deleteDocument(documentId: string, userId: string) {
  const regionId = await getUserRegion();
  const vectorClock = await writeConflicts.getVectorClock("document", documentId);

  const db = multiRegionDb.getWriteClient();

  // Soft delete
  const deleted = await db.document.update({
    where: { id: documentId },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });

  // Record write for consistency
  await readYourWrites.recordWrite(userId, regionId);

  // Replicate deletion
  await geoReplication.publishWrite(
    regionId,
    "document",
    documentId,
    "DELETE",
    deleted,
    writeConflicts.incrementClock(vectorClock, regionId)
  );

  revalidatePath("/documents");

  return { success: true };
}

// Collaborative editing with merge conflict resolution
export async function updateDocumentContent(
  documentId: string,
  userId: string,
  content: string,
  baseVersion: string
) {
  const regionId = await getUserRegion();
  const vectorClock = await writeConflicts.getVectorClock("document", documentId);

  // Custom merge function for content
  const contentMerge = (writes: Array<{ data: { content: string } }>) => {
    // For text content, use operational transformation or CRDT
    // This is a simplified example - use a proper OT/CRDT library
    const contents = writes.map((w) => w.data.content);

    // Simple merge: concatenate with markers (in production, use proper diff/merge)
    if (contents.length === 2) {
      return {
        content: `<<<<<<< Local\n${contents[0]}\n=======\n${contents[1]}\n>>>>>>> Remote`,
        hasConflict: true,
      };
    }

    return { content: contents[0], hasConflict: false };
  };

  const result = await writeConflicts.attemptWrite(
    {
      entityType: "document",
      entityId: documentId,
      data: {
        content,
        baseVersion,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      },
      userId,
      regionId,
      vectorClock,
      timestamp: Date.now(),
    },
    "merge",
    contentMerge as any
  );

  if (!result.success && result.conflict) {
    return {
      success: false,
      conflict: true,
      conflictId: result.conflict.id,
      message: "Content conflict detected - manual resolution required",
    };
  }

  // Replicate
  await geoReplication.publishWrite(
    regionId,
    "document",
    documentId,
    "UPDATE",
    result.result,
    await writeConflicts.getVectorClock("document", documentId)
  );

  revalidatePath(`/documents/${documentId}`);

  return {
    success: true,
    document: result.result,
  };
}
```

### 7. Monitoring Dashboard Component

```typescript
// components/multi-region/region-status-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RegionStatus {
  regionId: string;
  name: string;
  healthy: boolean;
  isPrimary: boolean;
  latencyMs: number;
  replicationLag: number;
  pendingWrites: number;
}

interface FailoverEvent {
  id: string;
  timestamp: number;
  fromRegion: string;
  toRegion: string;
  reason: string;
  status: string;
}

export function RegionStatusDashboard() {
  const [regions, setRegions] = useState<RegionStatus[]>([]);
  const [failovers, setFailovers] = useState<FailoverEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [regionsRes, failoversRes] = await Promise.all([
          fetch("/api/regions/status"),
          fetch("/api/regions/failovers"),
        ]);

        setRegions(await regionsRes.json());
        setFailovers(await failoversRes.json());
      } catch (error) {
        console.error("Failed to fetch region status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Poll for updates
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualFailover = async (toRegion: string) => {
    if (!confirm(`Are you sure you want to failover to ${toRegion}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/regions/failover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toRegion, reason: "Manual failover" }),
      });

      if (!response.ok) {
        throw new Error("Failover failed");
      }

      router.refresh();
    } catch (error) {
      alert("Failover failed: " + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Multi-Region Status</h2>

      {/* Region Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {regions.map((region) => (
          <div
            key={region.regionId}
            className={`p-4 rounded-lg border-2 ${
              region.healthy
                ? region.isPrimary
                  ? "border-green-500 bg-green-50"
                  : "border-blue-500 bg-blue-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{region.name}</h3>
                <p className="text-sm text-gray-600">{region.regionId}</p>
              </div>
              <div className="flex gap-2">
                {region.isPrimary && (
                  <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded">
                    Primary
                  </span>
                )}
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    region.healthy
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {region.healthy ? "Healthy" : "Unhealthy"}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Latency:</span>
                <span
                  className={
                    region.latencyMs < 50
                      ? "text-green-600"
                      : region.latencyMs < 100
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {region.latencyMs}ms
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Replication Lag:</span>
                <span
                  className={
                    region.replicationLag < 1000
                      ? "text-green-600"
                      : region.replicationLag < 5000
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {region.replicationLag}ms
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending Writes:</span>
                <span>{region.pendingWrites}</span>
              </div>
            </div>

            {!region.isPrimary && region.healthy && (
              <button
                onClick={() => handleManualFailover(region.regionId)}
                className="mt-4 w-full px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Promote to Primary
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Replication Flow Diagram */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-4">Replication Flow</h3>
        <div className="flex justify-center items-center gap-8">
          {regions.map((region, index) => (
            <div key={region.regionId} className="flex items-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  region.isPrimary ? "bg-green-500" : "bg-blue-500"
                } text-white text-xs`}
              >
                {region.regionId.split("-")[0].toUpperCase()}
              </div>
              {index < regions.length - 1 && (
                <div className="flex items-center mx-2">
                  <div className="w-8 h-0.5 bg-gray-400"></div>
                  <div className="text-gray-400">&#8594;</div>
                  <div className="w-8 h-0.5 bg-gray-400"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Failover History */}
      <div>
        <h3 className="font-semibold mb-4">Failover History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">From</th>
                <th className="px-4 py-2 text-left">To</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {failovers.map((event) => (
                <tr key={event.id} className="border-b">
                  <td className="px-4 py-2">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{event.fromRegion}</td>
                  <td className="px-4 py-2">{event.toRegion}</td>
                  <td className="px-4 py-2">{event.reason}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        event.status === "completed"
                          ? "bg-green-200 text-green-800"
                          : event.status === "failed"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
              {failovers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No failover events recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## Examples

### Example 1: E-Commerce with Global Inventory

```typescript
// lib/ecommerce/inventory.ts
import { multiRegionDb } from "@/lib/db/multi-region-config";
import { writeConflicts } from "@/lib/db/write-conflicts";
import { geoReplication } from "@/lib/db/geo-replication";

interface InventoryUpdate {
  productId: string;
  warehouseId: string;
  quantity: number;
  regionId: string;
}

export class GlobalInventoryManager {
  // Reserve inventory with conflict detection
  async reserveInventory(
    productId: string,
    quantity: number,
    userId: string,
    regionId: string
  ): Promise<{ success: boolean; reservationId?: string; error?: string }> {
    const vectorClock = await writeConflicts.getVectorClock("inventory", productId);

    // Use pessimistic locking for inventory
    const result = await writeConflicts.attemptWrite(
      {
        entityType: "inventory",
        entityId: productId,
        data: {
          reservedQuantity: { increment: quantity },
          lastReservedBy: userId,
          lastReservedAt: new Date(),
        },
        userId,
        regionId,
        vectorClock,
        timestamp: Date.now(),
      },
      "custom",
      (writes) => {
        // Custom merge: Sum all quantity changes
        const totalReservation = writes.reduce(
          (sum, w) => sum + (w.data.reservedQuantity?.increment || 0),
          0
        );
        return {
          reservedQuantity: { increment: totalReservation },
          lastReservedAt: new Date(),
        };
      }
    );

    if (!result.success) {
      return { success: false, error: "Inventory conflict - please retry" };
    }

    const reservationId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Replicate reservation globally
    await geoReplication.publishWrite(
      regionId,
      "inventory",
      productId,
      "UPDATE",
      result.result,
      await writeConflicts.getVectorClock("inventory", productId)
    );

    return { success: true, reservationId };
  }

  // Get real-time inventory across all regions
  async getGlobalInventory(productId: string): Promise<{
    total: number;
    byRegion: Record<string, number>;
    reserved: number;
  }> {
    const regions = ["us-east-1", "eu-west-1", "ap-southeast-1"];
    const byRegion: Record<string, number> = {};
    let total = 0;
    let reserved = 0;

    await Promise.all(
      regions.map(async (regionId) => {
        try {
          const db = multiRegionDb.getReadClient(regionId);
          const inventory = await db.inventory.findUnique({
            where: { productId },
          });

          if (inventory) {
            byRegion[regionId] = inventory.quantity;
            total += inventory.quantity;
            reserved += inventory.reservedQuantity;
          }
        } catch (error) {
          console.error(`Failed to get inventory from ${regionId}:`, error);
        }
      })
    );

    return { total, byRegion, reserved };
  }
}
```

### Example 2: Real-Time Gaming Leaderboard

```typescript
// lib/gaming/leaderboard.ts
import { multiRegionDb, findNearestRegion } from "@/lib/db/multi-region-config";
import { readYourWrites } from "@/lib/db/read-your-writes";

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  region: string;
  updatedAt: Date;
}

export class GlobalLeaderboard {
  // Update player score with eventual consistency
  async updateScore(
    playerId: string,
    score: number,
    regionId: string
  ): Promise<void> {
    const db = multiRegionDb.getWriteClient();

    await db.leaderboardEntry.upsert({
      where: { playerId },
      update: {
        score,
        updatedAt: new Date(),
        region: regionId,
      },
      create: {
        playerId,
        score,
        region: regionId,
        updatedAt: new Date(),
      },
    });

    // Record for read-your-writes
    await readYourWrites.recordWrite(playerId, regionId);
  }

  // Get regional leaderboard (fast, eventually consistent)
  async getRegionalLeaderboard(
    regionId: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    const db = multiRegionDb.getReadClient(regionId);

    return db.leaderboardEntry.findMany({
      where: { region: regionId },
      orderBy: { score: "desc" },
      take: limit,
    });
  }

  // Get global leaderboard (aggregated from all regions)
  async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const regions = ["us-east-1", "eu-west-1", "ap-southeast-1"];
    const allEntries: LeaderboardEntry[] = [];

    // Fetch from all regions in parallel
    await Promise.all(
      regions.map(async (regionId) => {
        try {
          const db = multiRegionDb.getReadClient(regionId);
          const entries = await db.leaderboardEntry.findMany({
            orderBy: { score: "desc" },
            take: limit,
          });
          allEntries.push(...entries);
        } catch (error) {
          console.error(`Failed to fetch leaderboard from ${regionId}:`, error);
        }
      })
    );

    // Merge and sort
    const merged = allEntries
      .reduce((acc, entry) => {
        const existing = acc.find((e) => e.playerId === entry.playerId);
        if (existing) {
          // Take the higher score (last-write-wins for ties)
          if (
            entry.score > existing.score ||
            (entry.score === existing.score &&
              entry.updatedAt > existing.updatedAt)
          ) {
            return acc.map((e) => (e.playerId === entry.playerId ? entry : e));
          }
          return acc;
        }
        return [...acc, entry];
      }, [] as LeaderboardEntry[])
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return merged;
  }

  // Get player's rank with read-your-writes guarantee
  async getPlayerRank(
    playerId: string,
    latitude: number,
    longitude: number
  ): Promise<{ rank: number; score: number; total: number }> {
    const region = findNearestRegion(latitude, longitude);

    // Ensure we read from a region that has the player's latest score
    const consistentRegion = await readYourWrites.getConsistentReadRegion(
      playerId,
      region.id
    );

    const db = multiRegionDb.getReadClient(consistentRegion);

    const [player, higherScores, totalPlayers] = await Promise.all([
      db.leaderboardEntry.findUnique({ where: { playerId } }),
      db.leaderboardEntry.count({
        where: { score: { gt: (await db.leaderboardEntry.findUnique({ where: { playerId } }))?.score || 0 } },
      }),
      db.leaderboardEntry.count(),
    ]);

    return {
      rank: higherScores + 1,
      score: player?.score || 0,
      total: totalPlayers,
    };
  }
}
```

### Example 3: Multi-Region Content Management

```typescript
// lib/cms/content-sync.ts
import { multiRegionDb, REGIONS } from "@/lib/db/multi-region-config";
import { writeConflicts } from "@/lib/db/write-conflicts";
import { geoReplication } from "@/lib/db/geo-replication";

interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  data: any;
  createdAt: Date;
  createdBy: string;
  region: string;
}

export class MultiRegionCMS {
  // Create content with global replication
  async createContent(
    userId: string,
    regionId: string,
    data: { title: string; body: string; type: string }
  ): Promise<{ contentId: string; version: number }> {
    const contentId = `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const db = multiRegionDb.getWriteClient();

    // Create initial version
    const content = await db.content.create({
      data: {
        id: contentId,
        ...data,
        version: 1,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        originRegion: regionId,
      },
    });

    // Create version history
    await db.contentVersion.create({
      data: {
        contentId,
        version: 1,
        data,
        createdBy: userId,
        createdAt: new Date(),
        region: regionId,
      },
    });

    // Set initial vector clock
    await writeConflicts.updateVectorClock("content", contentId, { [regionId]: 1 });

    // Replicate to all regions
    await geoReplication.publishWrite(
      regionId,
      "content",
      contentId,
      "INSERT",
      content,
      { [regionId]: 1 }
    );

    return { contentId, version: 1 };
  }

  // Update content with version control
  async updateContent(
    contentId: string,
    userId: string,
    regionId: string,
    updates: { title?: string; body?: string },
    baseVersion: number
  ): Promise<{
    success: boolean;
    newVersion?: number;
    conflict?: boolean;
    conflictingVersions?: ContentVersion[];
  }> {
    const db = multiRegionDb.getWriteClient();

    // Check current version
    const current = await db.content.findUnique({
      where: { id: contentId },
    });

    if (!current) {
      throw new Error("Content not found");
    }

    // Optimistic concurrency check
    if (current.version !== baseVersion) {
      // Fetch conflicting versions
      const conflictingVersions = await db.contentVersion.findMany({
        where: {
          contentId,
          version: { gt: baseVersion },
        },
        orderBy: { version: "asc" },
      });

      return {
        success: false,
        conflict: true,
        conflictingVersions,
      };
    }

    const vectorClock = await writeConflicts.getVectorClock("content", contentId);
    const newVersion = current.version + 1;

    const result = await writeConflicts.attemptWrite(
      {
        entityType: "content",
        entityId: contentId,
        data: {
          ...updates,
          version: newVersion,
          updatedAt: new Date(),
          updatedBy: userId,
        },
        userId,
        regionId,
        vectorClock,
        timestamp: Date.now(),
      },
      "manual" // Require manual resolution for content conflicts
    );

    if (!result.success) {
      return {
        success: false,
        conflict: true,
      };
    }

    // Create version entry
    await db.contentVersion.create({
      data: {
        contentId,
        version: newVersion,
        data: { ...current, ...updates },
        createdBy: userId,
        createdAt: new Date(),
        region: regionId,
      },
    });

    // Replicate
    await geoReplication.publishWrite(
      regionId,
      "content",
      contentId,
      "UPDATE",
      result.result,
      await writeConflicts.getVectorClock("content", contentId)
    );

    return { success: true, newVersion };
  }

  // Get content with region preference
  async getContent(
    contentId: string,
    userId: string,
    preferredRegion: string
  ): Promise<any> {
    const consistentRegion = await (
      await import("@/lib/db/read-your-writes")
    ).readYourWrites.getConsistentReadRegion(userId, preferredRegion);

    const db = multiRegionDb.getReadClient(consistentRegion);

    return db.content.findUnique({
      where: { id: contentId },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 5,
        },
      },
    });
  }

  // Sync content across regions (admin operation)
  async forceSyncContent(contentId: string): Promise<void> {
    // Get content from primary region
    const primaryRegion = REGIONS.find((r) => r.isPrimary)!;
    const db = multiRegionDb.getReadClient(primaryRegion.id);

    const content = await db.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error("Content not found in primary region");
    }

    // Force sync to all regions
    await geoReplication.forceSync("content", contentId, primaryRegion.id);
  }
}
```

---

## Anti-Patterns

### Anti-Pattern 1: Ignoring Replication Lag

```typescript
// BAD: Assuming immediate consistency after write
async function badUpdateAndRead(userId: string, data: any) {
  // Write to primary
  await db.user.update({
    where: { id: userId },
    data,
  });

  // Immediately read from nearest replica
  // This might return stale data!
  const user = await localReplicaDb.user.findUnique({
    where: { id: userId },
  });

  return user; // Could be stale!
}

// GOOD: Use read-your-writes consistency
async function goodUpdateAndRead(userId: string, data: any, regionId: string) {
  // Write to primary
  await db.user.update({
    where: { id: userId },
    data,
  });

  // Record the write
  await readYourWrites.recordWrite(userId, regionId);

  // Read with consistency guarantee
  const consistentRegion = await readYourWrites.getConsistentReadRegion(
    userId,
    regionId
  );

  const user = await multiRegionDb
    .getReadClient(consistentRegion)
    .user.findUnique({
      where: { id: userId },
    });

  return user; // Guaranteed to reflect our write
}
```

### Anti-Pattern 2: No Conflict Handling

```typescript
// BAD: Overwriting without conflict detection
async function badConcurrentUpdate(docId: string, content: string) {
  // Just overwrite - loses concurrent changes
  await db.document.update({
    where: { id: docId },
    data: { content },
  });
}

// GOOD: Detect and handle conflicts
async function goodConcurrentUpdate(
  docId: string,
  content: string,
  userId: string,
  regionId: string
) {
  const vectorClock = await writeConflicts.getVectorClock("document", docId);

  const result = await writeConflicts.attemptWrite(
    {
      entityType: "document",
      entityId: docId,
      data: { content, updatedAt: new Date() },
      userId,
      regionId,
      vectorClock,
      timestamp: Date.now(),
    },
    "merge",
    (writes) => {
      // Merge concurrent changes
      const merged = mergeDocumentContents(writes.map((w) => w.data.content));
      return { content: merged, updatedAt: new Date() };
    }
  );

  if (!result.success) {
    // Handle unresolvable conflict
    return { conflict: true, conflictId: result.conflict?.id };
  }

  return { success: true, document: result.result };
}
```

### Anti-Pattern 3: Hardcoded Region Routing

```typescript
// BAD: Hardcoded region selection
async function badGetData() {
  // Always uses US region - terrible latency for other regions
  const db = prisma;
  return db.data.findMany();
}

// GOOD: Dynamic region routing based on user location
async function goodGetData(latitude: number, longitude: number) {
  // Find nearest healthy region
  const region = findNearestRegion(latitude, longitude);
  const db = multiRegionDb.getReadClient(region.id);

  return db.data.findMany();
}

// BETTER: With failover support
async function betterGetData(latitude: number, longitude: number) {
  const region = findNearestRegion(latitude, longitude);

  try {
    const db = multiRegionDb.getReadClient(region.id);
    return await db.data.findMany();
  } catch (error) {
    // Automatic fallback to next closest healthy region
    console.warn(`Region ${region.id} failed, using fallback`);
    const fallbackDb = multiRegionDb.getReadClient("us-east-1"); // Primary as fallback
    return fallbackDb.data.findMany();
  }
}
```

---

## Testing

### Unit Tests for Vector Clock

```typescript
// __tests__/write-conflicts.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { WriteConflictManager } from "@/lib/db/write-conflicts";

describe("WriteConflictManager", () => {
  let manager: WriteConflictManager;

  beforeEach(() => {
    manager = new WriteConflictManager();
  });

  describe("Vector Clock Operations", () => {
    it("should increment clock for a region", () => {
      const clock = { "us-east-1": 1, "eu-west-1": 2 };
      const updated = manager.incrementClock(clock, "us-east-1");

      expect(updated["us-east-1"]).toBe(2);
      expect(updated["eu-west-1"]).toBe(2);
    });

    it("should initialize new region in clock", () => {
      const clock = { "us-east-1": 1 };
      const updated = manager.incrementClock(clock, "ap-southeast-1");

      expect(updated["ap-southeast-1"]).toBe(1);
    });

    it("should compare clocks correctly - before", () => {
      const a = { "us-east-1": 1 };
      const b = { "us-east-1": 2 };

      expect(manager.compareClocks(a, b)).toBe("before");
    });

    it("should compare clocks correctly - after", () => {
      const a = { "us-east-1": 3 };
      const b = { "us-east-1": 2 };

      expect(manager.compareClocks(a, b)).toBe("after");
    });

    it("should detect concurrent writes", () => {
      const a = { "us-east-1": 2, "eu-west-1": 1 };
      const b = { "us-east-1": 1, "eu-west-1": 2 };

      expect(manager.compareClocks(a, b)).toBe("concurrent");
    });

    it("should merge clocks taking max values", () => {
      const a = { "us-east-1": 2, "eu-west-1": 1 };
      const b = { "us-east-1": 1, "eu-west-1": 3, "ap-southeast-1": 1 };

      const merged = manager.mergeClocks(a, b);

      expect(merged["us-east-1"]).toBe(2);
      expect(merged["eu-west-1"]).toBe(3);
      expect(merged["ap-southeast-1"]).toBe(1);
    });
  });
});
```

### Integration Tests for Read-Your-Writes

```typescript
// __tests__/read-your-writes.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReadYourWritesManager } from "@/lib/db/read-your-writes";

// Mock Redis
vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    setex: vi.fn(),
    lpush: vi.fn(),
    ltrim: vi.fn(),
    expire: vi.fn(),
    lrange: vi.fn().mockResolvedValue([]),
    get: vi.fn(),
  })),
}));

describe("ReadYourWritesManager", () => {
  let manager: ReadYourWritesManager;

  beforeEach(() => {
    manager = new ReadYourWritesManager();
  });

  describe("recordWrite", () => {
    it("should create write token with correct fields", async () => {
      const token = await manager.recordWrite("user-123", "us-east-1");

      expect(token.userId).toBe("user-123");
      expect(token.regionId).toBe("us-east-1");
      expect(token.timestamp).toBeDefined();
      expect(token.version).toBeDefined();
    });
  });

  describe("getConsistentReadRegion", () => {
    it("should return preferred region when no recent writes", async () => {
      const region = await manager.getConsistentReadRegion(
        "user-123",
        "eu-west-1"
      );

      expect(region).toBe("eu-west-1");
    });
  });
});
```

### E2E Tests for Multi-Region Operations

```typescript
// __tests__/e2e/multi-region.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { multiRegionDb, REGIONS } from "@/lib/db/multi-region-config";
import { geoReplication } from "@/lib/db/geo-replication";

describe("Multi-Region E2E Tests", () => {
  const testDocumentId = `test-doc-${Date.now()}`;

  beforeAll(async () => {
    // Ensure all regions are healthy
    const health = multiRegionDb.getRegionHealth();
    for (const region of REGIONS) {
      expect(health.get(region.id)).toBe(true);
    }
  });

  afterAll(async () => {
    // Cleanup test data
    for (const region of REGIONS) {
      try {
        const db = multiRegionDb.getWriteClient(region.id);
        await db.document.delete({ where: { id: testDocumentId } });
      } catch {
        // Ignore if doesn't exist
      }
    }
  });

  it("should write to primary and replicate to all regions", async () => {
    const primaryRegion = REGIONS.find((r) => r.isPrimary)!;
    const db = multiRegionDb.getWriteClient();

    // Write to primary
    const doc = await db.document.create({
      data: {
        id: testDocumentId,
        title: "Test Document",
        content: "Test content",
        authorId: "test-user",
      },
    });

    expect(doc.id).toBe(testDocumentId);

    // Trigger replication
    await geoReplication.publishWrite(
      primaryRegion.id,
      "document",
      testDocumentId,
      "INSERT",
      doc,
      { [primaryRegion.id]: 1 }
    );

    // Wait for replication (in real tests, use proper sync mechanism)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify in all regions
    for (const region of REGIONS) {
      const readDb = multiRegionDb.getReadClient(region.id);
      const readDoc = await readDb.document.findUnique({
        where: { id: testDocumentId },
      });

      expect(readDoc).toBeDefined();
      expect(readDoc?.title).toBe("Test Document");
    }
  });

  it("should measure replication lag", async () => {
    const lags = await geoReplication.getReplicationLags();

    for (const lag of lags) {
      // Replication lag should be reasonable (< 5 seconds for async)
      if (lag.lagMs !== -1) {
        expect(lag.lagMs).toBeLessThan(5000);
      }
    }
  });
});
```

---

## Related Skills

- **pt-conflict-resolution**: Detailed conflict resolution strategies with CRDTs and OT
- **pt-connection-pooling**: Database connection management for multi-region setups
- **pt-distributed-cache**: Caching strategies for globally distributed applications
- **pt-message-queues**: Reliable message delivery across regions
- **pt-edge-functions**: Edge computing patterns that work with multi-region databases

---

## Changelog

### v1.0.0 (2025-01-18)
- Initial release with multi-region database patterns
- Read-your-writes consistency implementation
- Write-write conflict resolution with vector clocks
- Geo-replication coordinator
- Automatic failover management
- Server Actions integration
- Monitoring dashboard component
- E-commerce, gaming, and CMS examples
