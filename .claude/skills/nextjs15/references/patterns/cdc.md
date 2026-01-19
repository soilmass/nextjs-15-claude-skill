---
id: pt-cdc
name: Change Data Capture
version: 1.0.0
layer: L5
category: data
description: Implement Change Data Capture for detecting data changes, syncing external systems, and handling conflicts in distributed architectures
tags: [cdc, data-sync, replication, events, debezium, next15, infrastructure]
composes: []
dependencies:
  "@prisma/client": "^5.0.0"
  "ioredis": "^5.3.0"
  "zod": "^3.22.0"
formula: "CDC = Change Detection + Event Emission + Consumer Processing + Conflict Resolution"
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Change Data Capture (CDC)

## Overview

Change Data Capture (CDC) is a data integration pattern that identifies and captures changes made to data in a database, enabling real-time data synchronization across systems. Instead of periodically polling for changes or running batch jobs, CDC captures inserts, updates, and deletes as they occur, making them available as a stream of change events for downstream consumers.

In Next.js 15 applications, CDC enables powerful use cases: keeping search indices in sync, replicating data to analytics warehouses, triggering business workflows on data changes, maintaining cache consistency, and synchronizing data between microservices. This pattern implements CDC using database triggers, Prisma middleware, and outbox patterns, with Redis for event distribution and conflict resolution strategies for distributed systems.

Modern applications often need to maintain data consistency across multiple systems - a primary database, a search engine, a cache layer, and external services. CDC provides a reliable, near-real-time mechanism to propagate changes without tight coupling between systems, enabling event-driven architectures that scale independently.

## When to Use

Use this pattern when:
- You need real-time data synchronization between databases and external systems
- Search indices (Elasticsearch, Algolia) need to stay in sync with primary data
- Cache invalidation needs to be precise and immediate
- Analytics systems require near-real-time data updates
- Multiple microservices need to react to data changes
- You want to decouple systems while maintaining data consistency
- Audit requirements need comprehensive change tracking

## When NOT to Use

Avoid this pattern when:
- Simple polling or batch synchronization is sufficient
- Changes are infrequent and latency is not critical
- The overhead of CDC infrastructure outweighs the benefits
- Your database doesn't support change tracking mechanisms
- You only have a single system with no external synchronization needs
- Eventual consistency is not acceptable for your use case

## Composition Diagram

```
CHANGE DATA CAPTURE ARCHITECTURE
=================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SOURCE DATABASE                                     │
└─────────────────────────────────────────────────────────────────────────────┘
        │                           │                           │
        │  INSERT                   │  UPDATE                   │  DELETE
        ▼                           ▼                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         CHANGE DETECTION LAYER                             │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  Database   │    │   Prisma    │    │   Outbox    │    │   Polling   │ │
│  │  Triggers   │    │ Middleware  │    │   Pattern   │    │   (Fallback)│ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                  │                  │        │
│         └──────────────────┼──────────────────┼──────────────────┘        │
│                            ▼                                              │
│                    ┌───────────────┐                                      │
│                    │  Change Event │                                      │
│                    │  Standardizer │                                      │
│                    └───────────────┘                                      │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          EVENT DISTRIBUTION                                │
├───────────────────────────────────────────────────────────────────────────┤
│                    ┌───────────────────────┐                              │
│                    │     Redis Streams     │                              │
│                    │     / Pub-Sub         │                              │
│                    └───────────┬───────────┘                              │
│                                │                                          │
│         ┌──────────────────────┼──────────────────────┐                   │
│         │                      │                      │                   │
│         ▼                      ▼                      ▼                   │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐             │
│  │   Consumer  │       │   Consumer  │       │   Consumer  │             │
│  │   Group 1   │       │   Group 2   │       │   Group 3   │             │
│  └─────────────┘       └─────────────┘       └─────────────┘             │
└───────────────────────────────────────────────────────────────────────────┘
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
            │   Search    │       │    Cache    │       │  Analytics  │
            │   Index     │       │  Invalidate │       │  Warehouse  │
            └─────────────┘       └─────────────┘       └─────────────┘

Change Event Structure:
┌─────────────────────────────────────────────────────────────────────────────┐
│  ChangeEvent = {                                                             │
│    id: string             // Unique event ID                                │
│    source: string         // Table/collection name                          │
│    operation: 'INSERT' | 'UPDATE' | 'DELETE'                                │
│    timestamp: Date        // When change occurred                           │
│    before: object | null  // Previous state (for UPDATE/DELETE)             │
│    after: object | null   // New state (for INSERT/UPDATE)                  │
│    metadata: {                                                              │
│      transactionId, sequence, user, correlationId                          │
│    }                                                                        │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

Conflict Resolution Strategies:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  LAST WRITER    │  │  FIRST WRITER   │  │  MERGE          │
│  WINS           │  │  WINS           │  │  RESOLUTION     │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Latest timestamp│  │ Original value  │  │ Field-level     │
│ overwrites      │  │ preserved       │  │ merge logic     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Implementation

### Core Types and Change Event Definition

```typescript
// lib/cdc/types.ts
import { z } from 'zod';

export type OperationType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface ChangeEventMetadata {
  transactionId?: string;
  sequence: number;
  userId?: string;
  correlationId?: string;
  schemaVersion: number;
}

export interface ChangeEvent<T = unknown> {
  id: string;
  source: string;
  operation: OperationType;
  timestamp: Date;
  before: T | null;
  after: T | null;
  key: string | string[];
  metadata: ChangeEventMetadata;
}

export interface ChangeSubscription {
  id: string;
  source: string;
  operations?: OperationType[];
  filter?: (event: ChangeEvent) => boolean;
  handler: (event: ChangeEvent) => Promise<void>;
}

export interface ConflictContext<T> {
  source: ChangeEvent<T>;
  target: T;
  field: string;
  sourceValue: unknown;
  targetValue: unknown;
}

export type ConflictResolutionStrategy =
  | 'LAST_WRITER_WINS'
  | 'FIRST_WRITER_WINS'
  | 'MERGE'
  | 'MANUAL'
  | 'CUSTOM';

export interface ConflictResolution<T> {
  resolved: boolean;
  value: T;
  strategy: ConflictResolutionStrategy;
  conflicts?: ConflictContext<T>[];
}

export const ChangeEventSchema = z.object({
  id: z.string(),
  source: z.string(),
  operation: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  timestamp: z.date(),
  before: z.unknown().nullable(),
  after: z.unknown().nullable(),
  key: z.union([z.string(), z.array(z.string())]),
  metadata: z.object({
    transactionId: z.string().optional(),
    sequence: z.number(),
    userId: z.string().optional(),
    correlationId: z.string().optional(),
    schemaVersion: z.number(),
  }),
});
```

### Prisma Middleware for Change Detection

```typescript
// lib/cdc/prisma-middleware.ts
import { Prisma } from '@prisma/client';
import { ChangeEvent, OperationType } from './types';
import { getChangeEventEmitter } from './event-emitter';

interface MiddlewareConfig {
  excludeTables?: string[];
  includeTables?: string[];
  captureBeforeState?: boolean;
}

const operationMap: Record<string, OperationType | undefined> = {
  create: 'INSERT',
  createMany: 'INSERT',
  update: 'UPDATE',
  updateMany: 'UPDATE',
  upsert: 'UPDATE',
  delete: 'DELETE',
  deleteMany: 'DELETE',
};

export function createCDCMiddleware(config: MiddlewareConfig = {}): Prisma.Middleware {
  const emitter = getChangeEventEmitter();
  let sequence = 0;

  return async (params, next) => {
    const model = params.model;
    const action = params.action;

    // Skip if not a CDC-tracked operation
    const operation = operationMap[action];
    if (!operation || !model) {
      return next(params);
    }

    // Check table filters
    if (config.excludeTables?.includes(model)) {
      return next(params);
    }
    if (config.includeTables && !config.includeTables.includes(model)) {
      return next(params);
    }

    // Capture before state for updates/deletes
    let beforeState: unknown = null;
    if (config.captureBeforeState && (operation === 'UPDATE' || operation === 'DELETE')) {
      try {
        if (params.args.where) {
          const prisma = (params as any).__internalParams?.extensions?.client;
          if (prisma && prisma[model]) {
            beforeState = await prisma[model].findUnique({
              where: params.args.where,
            });
          }
        }
      } catch (error) {
        console.warn('CDC: Failed to capture before state', error);
      }
    }

    // Execute the operation
    const result = await next(params);

    // Build and emit change event
    try {
      const changeEvent: ChangeEvent = {
        id: crypto.randomUUID(),
        source: model,
        operation,
        timestamp: new Date(),
        before: beforeState,
        after: operation !== 'DELETE' ? result : null,
        key: extractKey(params.args.where, result),
        metadata: {
          sequence: ++sequence,
          schemaVersion: 1,
          correlationId: getCorrelationId(),
        },
      };

      // Emit asynchronously to not block the main operation
      setImmediate(() => {
        emitter.emit(changeEvent).catch((err) => {
          console.error('CDC: Failed to emit change event', err);
        });
      });
    } catch (error) {
      console.error('CDC: Failed to create change event', error);
    }

    return result;
  };
}

function extractKey(where: unknown, result: unknown): string | string[] {
  if (typeof where === 'object' && where !== null) {
    if ('id' in where) return String((where as any).id);
    // Handle composite keys
    const keys = Object.keys(where).filter((k) => !k.startsWith('_'));
    if (keys.length > 0) {
      return keys.map((k) => String((where as any)[k]));
    }
  }
  if (typeof result === 'object' && result !== null && 'id' in result) {
    return String((result as any).id);
  }
  return crypto.randomUUID();
}

function getCorrelationId(): string | undefined {
  // In a real app, get from AsyncLocalStorage or request context
  return undefined;
}
```

### Outbox Pattern Implementation

```typescript
// lib/cdc/outbox.ts
import { prisma } from '@/lib/db';
import { ChangeEvent, OperationType } from './types';
import { getChangeEventEmitter } from './event-emitter';

interface OutboxEntry {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
  createdAt: Date;
  processedAt: Date | null;
  error: string | null;
  retryCount: number;
}

export class OutboxProcessor {
  private isRunning = false;
  private pollInterval = 1000; // 1 second
  private batchSize = 100;
  private maxRetries = 5;
  private emitter = getChangeEventEmitter();

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.poll();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.processOutbox();
      } catch (error) {
        console.error('Outbox processing error:', error);
      }
      await this.sleep(this.pollInterval);
    }
  }

  private async processOutbox(): Promise<void> {
    // Get unprocessed entries
    const entries = await prisma.outboxEvent.findMany({
      where: {
        processedAt: null,
        retryCount: { lt: this.maxRetries },
      },
      orderBy: { createdAt: 'asc' },
      take: this.batchSize,
    });

    for (const entry of entries) {
      try {
        const changeEvent = this.toChangeEvent(entry);
        await this.emitter.emit(changeEvent);

        // Mark as processed
        await prisma.outboxEvent.update({
          where: { id: entry.id },
          data: { processedAt: new Date() },
        });
      } catch (error) {
        // Increment retry count
        await prisma.outboxEvent.update({
          where: { id: entry.id },
          data: {
            retryCount: { increment: 1 },
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  }

  private toChangeEvent(entry: any): ChangeEvent {
    const payload = entry.payload as any;
    return {
      id: entry.id,
      source: entry.aggregateType,
      operation: entry.eventType as OperationType,
      timestamp: entry.createdAt,
      before: payload.before || null,
      after: payload.after || null,
      key: entry.aggregateId,
      metadata: {
        sequence: 0, // Will be assigned by emitter
        schemaVersion: 1,
        correlationId: payload.correlationId,
      },
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Helper to add events to outbox within a transaction
export async function addToOutbox(
  tx: Prisma.TransactionClient,
  aggregateType: string,
  aggregateId: string,
  eventType: OperationType,
  payload: { before?: unknown; after?: unknown; correlationId?: string }
): Promise<void> {
  await tx.outboxEvent.create({
    data: {
      id: crypto.randomUUID(),
      aggregateType,
      aggregateId,
      eventType,
      payload: payload as any,
    },
  });
}

// Usage in transactions
export async function updateUserWithOutbox(
  userId: string,
  data: { name?: string; email?: string }
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const before = await tx.user.findUnique({ where: { id: userId } });
    const after = await tx.user.update({
      where: { id: userId },
      data,
    });

    await addToOutbox(tx, 'User', userId, 'UPDATE', {
      before,
      after,
    });
  });
}
```

### Change Event Emitter

```typescript
// lib/cdc/event-emitter.ts
import Redis from 'ioredis';
import { ChangeEvent, ChangeSubscription } from './types';

interface EmitterConfig {
  redisUrl?: string;
  streamPrefix?: string;
  maxStreamLength?: number;
}

export class ChangeEventEmitter {
  private redis: Redis | null = null;
  private localSubscriptions: Map<string, ChangeSubscription[]> = new Map();
  private streamPrefix: string;
  private maxStreamLength: number;
  private sequence = 0;

  constructor(config: EmitterConfig = {}) {
    this.streamPrefix = config.streamPrefix || 'cdc';
    this.maxStreamLength = config.maxStreamLength || 10000;

    if (config.redisUrl) {
      this.redis = new Redis(config.redisUrl);
    }
  }

  async emit(event: ChangeEvent): Promise<void> {
    // Assign global sequence number
    event.metadata.sequence = ++this.sequence;

    // Emit to Redis stream for distributed consumers
    if (this.redis) {
      const streamKey = `${this.streamPrefix}:${event.source}`;
      await this.redis.xadd(
        streamKey,
        'MAXLEN',
        '~',
        this.maxStreamLength.toString(),
        '*',
        'event',
        JSON.stringify(event)
      );

      // Also publish for immediate subscribers
      await this.redis.publish(
        `${this.streamPrefix}:events`,
        JSON.stringify(event)
      );
    }

    // Notify local subscribers
    await this.notifyLocalSubscribers(event);
  }

  subscribe(subscription: ChangeSubscription): () => void {
    const source = subscription.source;
    const existing = this.localSubscriptions.get(source) || [];
    this.localSubscriptions.set(source, [...existing, subscription]);

    // Return unsubscribe function
    return () => {
      const subs = this.localSubscriptions.get(source) || [];
      this.localSubscriptions.set(
        source,
        subs.filter((s) => s.id !== subscription.id)
      );
    };
  }

  async startConsumer(
    consumerGroup: string,
    consumerId: string,
    sources: string[],
    handler: (event: ChangeEvent) => Promise<void>
  ): Promise<() => Promise<void>> {
    if (!this.redis) {
      throw new Error('Redis not configured for consumer groups');
    }

    // Create consumer groups if they don't exist
    for (const source of sources) {
      const streamKey = `${this.streamPrefix}:${source}`;
      try {
        await this.redis.xgroup('CREATE', streamKey, consumerGroup, '0', 'MKSTREAM');
      } catch (error: any) {
        // Group already exists - ignore
        if (!error.message?.includes('BUSYGROUP')) {
          throw error;
        }
      }
    }

    let running = true;

    // Start consuming
    const consume = async () => {
      while (running) {
        try {
          const streams = sources.map((s) => `${this.streamPrefix}:${s}`);
          const ids = sources.map(() => '>');

          const results = await this.redis!.xreadgroup(
            'GROUP',
            consumerGroup,
            consumerId,
            'COUNT',
            10,
            'BLOCK',
            5000,
            'STREAMS',
            ...streams,
            ...ids
          );

          if (results) {
            for (const [stream, messages] of results as any[]) {
              for (const [messageId, fields] of messages) {
                const eventJson = fields.find((_: any, i: number) =>
                  fields[i - 1] === 'event'
                );
                if (eventJson) {
                  const event = this.deserializeEvent(JSON.parse(eventJson));

                  try {
                    await handler(event);
                    // Acknowledge message
                    await this.redis!.xack(stream, consumerGroup, messageId);
                  } catch (error) {
                    console.error('CDC consumer error:', error);
                    // Message will be re-delivered
                  }
                }
              }
            }
          }
        } catch (error) {
          if (running) {
            console.error('CDC consumer loop error:', error);
            await this.sleep(1000);
          }
        }
      }
    };

    // Start consuming in background
    consume();

    // Return stop function
    return async () => {
      running = false;
    };
  }

  private async notifyLocalSubscribers(event: ChangeEvent): Promise<void> {
    const subscriptions = this.localSubscriptions.get(event.source) || [];
    const wildcardSubs = this.localSubscriptions.get('*') || [];

    const allSubs = [...subscriptions, ...wildcardSubs];

    for (const sub of allSubs) {
      // Check operation filter
      if (sub.operations && !sub.operations.includes(event.operation)) {
        continue;
      }

      // Check custom filter
      if (sub.filter && !sub.filter(event)) {
        continue;
      }

      try {
        await sub.handler(event);
      } catch (error) {
        console.error(`CDC subscription ${sub.id} error:`, error);
      }
    }
  }

  private deserializeEvent(data: any): ChangeEvent {
    return {
      ...data,
      timestamp: new Date(data.timestamp),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Singleton instance
let emitter: ChangeEventEmitter | null = null;

export function getChangeEventEmitter(): ChangeEventEmitter {
  if (!emitter) {
    emitter = new ChangeEventEmitter({
      redisUrl: process.env.REDIS_URL,
      streamPrefix: 'cdc',
      maxStreamLength: 10000,
    });
  }
  return emitter;
}
```

### Conflict Resolution

```typescript
// lib/cdc/conflict-resolution.ts
import {
  ChangeEvent,
  ConflictContext,
  ConflictResolution,
  ConflictResolutionStrategy,
} from './types';

interface ConflictResolverConfig {
  defaultStrategy: ConflictResolutionStrategy;
  fieldStrategies?: Record<string, ConflictResolutionStrategy>;
  customResolver?: <T>(context: ConflictContext<T>) => T;
}

export class ConflictResolver {
  private config: ConflictResolverConfig;

  constructor(config: ConflictResolverConfig) {
    this.config = config;
  }

  resolve<T extends object>(
    event: ChangeEvent<T>,
    target: T
  ): ConflictResolution<T> {
    if (event.operation === 'INSERT') {
      // No conflict for inserts (unless key already exists)
      return {
        resolved: true,
        value: event.after as T,
        strategy: this.config.defaultStrategy,
      };
    }

    if (event.operation === 'DELETE') {
      // Delete always wins (or handle tombstone)
      return {
        resolved: true,
        value: target,
        strategy: 'LAST_WRITER_WINS',
      };
    }

    // For updates, check for conflicts
    const conflicts: ConflictContext<T>[] = [];
    const merged: T = { ...target };
    const eventAfter = event.after as T;

    if (!eventAfter) {
      return {
        resolved: true,
        value: target,
        strategy: this.config.defaultStrategy,
      };
    }

    for (const field of Object.keys(eventAfter)) {
      const sourceValue = (eventAfter as any)[field];
      const targetValue = (target as any)[field];
      const beforeValue = event.before ? (event.before as any)[field] : undefined;

      // Check if there's a conflict
      if (targetValue !== beforeValue && sourceValue !== targetValue) {
        const context: ConflictContext<T> = {
          source: event,
          target,
          field,
          sourceValue,
          targetValue,
        };

        const strategy = this.config.fieldStrategies?.[field] || this.config.defaultStrategy;
        const resolvedValue = this.resolveField(context, strategy);

        (merged as any)[field] = resolvedValue;
        conflicts.push(context);
      } else {
        // No conflict, use source value
        (merged as any)[field] = sourceValue;
      }
    }

    return {
      resolved: conflicts.length === 0 || this.config.defaultStrategy !== 'MANUAL',
      value: merged,
      strategy: this.config.defaultStrategy,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    };
  }

  private resolveField<T>(
    context: ConflictContext<T>,
    strategy: ConflictResolutionStrategy
  ): unknown {
    switch (strategy) {
      case 'LAST_WRITER_WINS':
        return context.sourceValue;

      case 'FIRST_WRITER_WINS':
        return context.targetValue;

      case 'MERGE':
        return this.mergeValues(context.sourceValue, context.targetValue);

      case 'CUSTOM':
        if (this.config.customResolver) {
          return this.config.customResolver(context);
        }
        return context.sourceValue;

      case 'MANUAL':
      default:
        return context.targetValue; // Keep current, flag for manual review
    }
  }

  private mergeValues(source: unknown, target: unknown): unknown {
    // Array merge
    if (Array.isArray(source) && Array.isArray(target)) {
      return [...new Set([...target, ...source])];
    }

    // Object merge
    if (
      typeof source === 'object' &&
      typeof target === 'object' &&
      source !== null &&
      target !== null
    ) {
      return { ...target, ...source };
    }

    // Numeric merge (take max)
    if (typeof source === 'number' && typeof target === 'number') {
      return Math.max(source, target);
    }

    // String merge (concatenate with separator)
    if (typeof source === 'string' && typeof target === 'string') {
      if (source === target) return source;
      return `${target} | ${source}`;
    }

    // Default to source
    return source;
  }
}

// Pre-configured resolvers
export const lastWriterWinsResolver = new ConflictResolver({
  defaultStrategy: 'LAST_WRITER_WINS',
});

export const firstWriterWinsResolver = new ConflictResolver({
  defaultStrategy: 'FIRST_WRITER_WINS',
});

export const mergeResolver = new ConflictResolver({
  defaultStrategy: 'MERGE',
});

// Custom resolver example for specific use case
export const orderConflictResolver = new ConflictResolver({
  defaultStrategy: 'LAST_WRITER_WINS',
  fieldStrategies: {
    quantity: 'MERGE', // Sum quantities
    status: 'CUSTOM',  // Custom status resolution
  },
  customResolver: (context) => {
    if (context.field === 'status') {
      // Status priority: cancelled > shipped > confirmed > pending
      const priority = ['pending', 'confirmed', 'shipped', 'cancelled'];
      const sourcePriority = priority.indexOf(context.sourceValue as string);
      const targetPriority = priority.indexOf(context.targetValue as string);
      return sourcePriority > targetPriority ? context.sourceValue : context.targetValue;
    }
    return context.sourceValue;
  },
});
```

### Sync Manager for External Systems

```typescript
// lib/cdc/sync-manager.ts
import { ChangeEvent } from './types';
import { getChangeEventEmitter } from './event-emitter';
import { ConflictResolver, lastWriterWinsResolver } from './conflict-resolution';
import { prisma } from '@/lib/db';

interface SyncTarget {
  name: string;
  sources: string[];
  handler: (event: ChangeEvent) => Promise<void>;
  conflictResolver?: ConflictResolver;
  batchSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface SyncStatus {
  target: string;
  lastSyncedPosition: number;
  lastSyncedAt: Date;
  status: 'running' | 'paused' | 'error';
  errorMessage?: string;
}

export class SyncManager {
  private targets: Map<string, SyncTarget> = new Map();
  private stopFunctions: Map<string, () => Promise<void>> = new Map();
  private statuses: Map<string, SyncStatus> = new Map();

  registerTarget(target: SyncTarget): void {
    this.targets.set(target.name, target);
    this.statuses.set(target.name, {
      target: target.name,
      lastSyncedPosition: 0,
      lastSyncedAt: new Date(0),
      status: 'paused',
    });
  }

  async startTarget(targetName: string): Promise<void> {
    const target = this.targets.get(targetName);
    if (!target) {
      throw new Error(`Unknown sync target: ${targetName}`);
    }

    const emitter = getChangeEventEmitter();

    // Start consumer for this target
    const stopFn = await emitter.startConsumer(
      `sync-${targetName}`,
      `consumer-${process.pid}`,
      target.sources,
      async (event) => {
        await this.processEvent(target, event);
      }
    );

    this.stopFunctions.set(targetName, stopFn);
    this.updateStatus(targetName, { status: 'running' });
  }

  async stopTarget(targetName: string): Promise<void> {
    const stopFn = this.stopFunctions.get(targetName);
    if (stopFn) {
      await stopFn();
      this.stopFunctions.delete(targetName);
      this.updateStatus(targetName, { status: 'paused' });
    }
  }

  async startAll(): Promise<void> {
    for (const targetName of this.targets.keys()) {
      await this.startTarget(targetName);
    }
  }

  async stopAll(): Promise<void> {
    for (const targetName of this.stopFunctions.keys()) {
      await this.stopTarget(targetName);
    }
  }

  private async processEvent(
    target: SyncTarget,
    event: ChangeEvent
  ): Promise<void> {
    const maxAttempts = target.retryAttempts || 3;
    const retryDelay = target.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await target.handler(event);

        this.updateStatus(target.name, {
          lastSyncedPosition: event.metadata.sequence,
          lastSyncedAt: new Date(),
          status: 'running',
          errorMessage: undefined,
        });

        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          this.updateStatus(target.name, {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });

          // Log to dead letter queue
          await this.logFailedEvent(target.name, event, error);
          throw error;
        }

        await this.sleep(retryDelay * attempt);
      }
    }
  }

  private async logFailedEvent(
    targetName: string,
    event: ChangeEvent,
    error: unknown
  ): Promise<void> {
    await prisma.cdcDeadLetter.create({
      data: {
        targetName,
        eventId: event.id,
        source: event.source,
        operation: event.operation,
        payload: event as any,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }

  private updateStatus(
    targetName: string,
    updates: Partial<SyncStatus>
  ): void {
    const current = this.statuses.get(targetName);
    if (current) {
      this.statuses.set(targetName, { ...current, ...updates });
    }
  }

  getStatus(targetName: string): SyncStatus | undefined {
    return this.statuses.get(targetName);
  }

  getAllStatuses(): SyncStatus[] {
    return Array.from(this.statuses.values());
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let syncManager: SyncManager | null = null;

export function getSyncManager(): SyncManager {
  if (!syncManager) {
    syncManager = new SyncManager();
  }
  return syncManager;
}
```

### Search Index Sync Example

```typescript
// lib/cdc/consumers/search-sync.ts
import { ChangeEvent } from '../types';
import { getSyncManager } from '../sync-manager';

interface SearchDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  updatedAt: Date;
}

// Mock search client - replace with actual Elasticsearch/Algolia client
class SearchClient {
  async index(doc: SearchDocument): Promise<void> {
    console.log('Indexing document:', doc.id);
    // await elasticsearchClient.index({ index: 'main', body: doc });
  }

  async delete(id: string): Promise<void> {
    console.log('Deleting document:', id);
    // await elasticsearchClient.delete({ index: 'main', id });
  }
}

const searchClient = new SearchClient();

async function handleProductChange(event: ChangeEvent): Promise<void> {
  switch (event.operation) {
    case 'INSERT':
    case 'UPDATE':
      const product = event.after as any;
      await searchClient.index({
        id: `product_${product.id}`,
        type: 'product',
        title: product.name,
        content: product.description,
        metadata: {
          price: product.price,
          category: product.categoryId,
          inStock: product.stockQuantity > 0,
        },
        updatedAt: event.timestamp,
      });
      break;

    case 'DELETE':
      const deletedProduct = event.before as any;
      await searchClient.delete(`product_${deletedProduct.id}`);
      break;
  }
}

async function handlePostChange(event: ChangeEvent): Promise<void> {
  switch (event.operation) {
    case 'INSERT':
    case 'UPDATE':
      const post = event.after as any;
      // Only index published posts
      if (post.status !== 'published') {
        await searchClient.delete(`post_${post.id}`);
        return;
      }
      await searchClient.index({
        id: `post_${post.id}`,
        type: 'post',
        title: post.title,
        content: post.content,
        metadata: {
          authorId: post.authorId,
          tags: post.tags,
          publishedAt: post.publishedAt,
        },
        updatedAt: event.timestamp,
      });
      break;

    case 'DELETE':
      const deletedPost = event.before as any;
      await searchClient.delete(`post_${deletedPost.id}`);
      break;
  }
}

// Register sync targets
export function registerSearchSyncTargets(): void {
  const syncManager = getSyncManager();

  syncManager.registerTarget({
    name: 'search-products',
    sources: ['Product'],
    handler: handleProductChange,
    retryAttempts: 3,
    retryDelay: 1000,
  });

  syncManager.registerTarget({
    name: 'search-posts',
    sources: ['Post'],
    handler: handlePostChange,
    retryAttempts: 3,
    retryDelay: 1000,
  });
}
```

### Cache Invalidation Consumer

```typescript
// lib/cdc/consumers/cache-invalidation.ts
import Redis from 'ioredis';
import { ChangeEvent } from '../types';
import { getSyncManager } from '../sync-manager';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface CacheInvalidationRule {
  source: string;
  patterns: (event: ChangeEvent) => string[];
}

const invalidationRules: CacheInvalidationRule[] = [
  {
    source: 'User',
    patterns: (event) => {
      const userId = (event.after || event.before) as any;
      return [
        `user:${userId?.id}`,
        `user:${userId?.id}:profile`,
        `user:${userId?.id}:settings`,
        `users:list:*`,
      ];
    },
  },
  {
    source: 'Product',
    patterns: (event) => {
      const product = (event.after || event.before) as any;
      return [
        `product:${product?.id}`,
        `products:category:${product?.categoryId}`,
        `products:list:*`,
        `products:featured`,
      ];
    },
  },
  {
    source: 'Order',
    patterns: (event) => {
      const order = (event.after || event.before) as any;
      return [
        `order:${order?.id}`,
        `orders:customer:${order?.customerId}`,
        `orders:recent`,
        `analytics:sales:*`,
      ];
    },
  },
];

async function handleCacheInvalidation(event: ChangeEvent): Promise<void> {
  const rule = invalidationRules.find((r) => r.source === event.source);
  if (!rule) return;

  const patterns = rule.patterns(event);

  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      // Pattern match - use SCAN
      const keys = await scanKeys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`CDC: Invalidated ${keys.length} cache keys for pattern ${pattern}`);
      }
    } else {
      // Direct key
      await redis.del(pattern);
      console.log(`CDC: Invalidated cache key ${pattern}`);
    }
  }
}

async function scanKeys(pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = '0';

  do {
    const [newCursor, foundKeys] = await redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100
    );
    cursor = newCursor;
    keys.push(...foundKeys);
  } while (cursor !== '0');

  return keys;
}

export function registerCacheInvalidationTarget(): void {
  const syncManager = getSyncManager();

  syncManager.registerTarget({
    name: 'cache-invalidation',
    sources: ['User', 'Product', 'Order', 'Post'],
    handler: handleCacheInvalidation,
    retryAttempts: 1, // Cache invalidation is not critical
    retryDelay: 100,
  });
}
```

### Database Schema

```prisma
// prisma/schema.prisma

model OutboxEvent {
  id            String    @id @default(cuid())
  aggregateType String
  aggregateId   String
  eventType     String
  payload       Json
  createdAt     DateTime  @default(now())
  processedAt   DateTime?
  error         String?
  retryCount    Int       @default(0)

  @@index([processedAt, retryCount])
  @@index([aggregateType])
  @@index([createdAt])
}

model CdcCheckpoint {
  id           String   @id @default(cuid())
  consumerName String   @unique
  source       String
  position     BigInt
  updatedAt    DateTime @updatedAt

  @@index([consumerName])
}

model CdcDeadLetter {
  id           String   @id @default(cuid())
  targetName   String
  eventId      String
  source       String
  operation    String
  payload      Json
  errorMessage String
  createdAt    DateTime @default(now())
  resolvedAt   DateTime?

  @@index([targetName])
  @@index([createdAt])
  @@index([resolvedAt])
}

model CdcSyncStatus {
  id                 String   @id @default(cuid())
  targetName         String   @unique
  lastSyncedPosition BigInt
  lastSyncedAt       DateTime
  status             String   // 'running' | 'paused' | 'error'
  errorMessage       String?
  updatedAt          DateTime @updatedAt

  @@index([status])
}
```

### Server Actions for CDC Management

```typescript
// app/actions/cdc.ts
'use server';

import { auth } from '@/lib/auth';
import { getSyncManager } from '@/lib/cdc/sync-manager';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getSyncStatuses() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const syncManager = getSyncManager();
  return syncManager.getAllStatuses();
}

export async function startSyncTarget(targetName: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const syncManager = getSyncManager();
  await syncManager.startTarget(targetName);

  revalidatePath('/admin/cdc');
  return { success: true };
}

export async function stopSyncTarget(targetName: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const syncManager = getSyncManager();
  await syncManager.stopTarget(targetName);

  revalidatePath('/admin/cdc');
  return { success: true };
}

export async function getDeadLetterQueue(
  page: number = 1,
  limit: number = 20
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const [items, total] = await Promise.all([
    prisma.cdcDeadLetter.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cdcDeadLetter.count({
      where: { resolvedAt: null },
    }),
  ]);

  return { items, total, page, limit };
}

export async function retryDeadLetterEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const deadLetter = await prisma.cdcDeadLetter.findUnique({
    where: { id: eventId },
  });

  if (!deadLetter) throw new Error('Event not found');

  // Re-add to outbox for retry
  await prisma.outboxEvent.create({
    data: {
      aggregateType: deadLetter.source,
      aggregateId: (deadLetter.payload as any).key || 'unknown',
      eventType: deadLetter.operation,
      payload: deadLetter.payload,
    },
  });

  // Mark as resolved
  await prisma.cdcDeadLetter.update({
    where: { id: eventId },
    data: { resolvedAt: new Date() },
  });

  revalidatePath('/admin/cdc');
  return { success: true };
}

export async function discardDeadLetterEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.cdcDeadLetter.update({
    where: { id: eventId },
    data: { resolvedAt: new Date() },
  });

  revalidatePath('/admin/cdc');
  return { success: true };
}
```

## Examples

### Example 1: E-commerce Inventory Sync

```typescript
// lib/cdc/consumers/inventory-sync.ts
import { ChangeEvent } from '../types';
import { getSyncManager } from '../sync-manager';
import { mergeResolver } from '../conflict-resolution';

interface InventoryRecord {
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  lastUpdated: Date;
}

// External warehouse management system client
const warehouseClient = {
  async updateInventory(record: InventoryRecord): Promise<void> {
    // API call to external WMS
    console.log('Syncing inventory to WMS:', record);
  },
  async getInventory(productId: string, warehouseId: string): Promise<InventoryRecord | null> {
    // API call to get current WMS inventory
    return null;
  },
};

async function handleInventoryChange(event: ChangeEvent): Promise<void> {
  const inventory = (event.after || event.before) as any;
  if (!inventory) return;

  switch (event.operation) {
    case 'INSERT':
    case 'UPDATE':
      // Check for conflicts with external system
      const externalInventory = await warehouseClient.getInventory(
        inventory.productId,
        inventory.warehouseId
      );

      if (externalInventory) {
        // Resolve conflicts using merge strategy
        const resolution = mergeResolver.resolve(event, externalInventory);

        if (!resolution.resolved) {
          // Log for manual review
          console.warn('Inventory conflict detected:', resolution.conflicts);
        }

        await warehouseClient.updateInventory(resolution.value);
      } else {
        await warehouseClient.updateInventory({
          productId: inventory.productId,
          warehouseId: inventory.warehouseId,
          quantity: inventory.quantity,
          reservedQuantity: inventory.reservedQuantity,
          lastUpdated: event.timestamp,
        });
      }
      break;

    case 'DELETE':
      // Handle inventory deletion (set to 0)
      await warehouseClient.updateInventory({
        productId: inventory.productId,
        warehouseId: inventory.warehouseId,
        quantity: 0,
        reservedQuantity: 0,
        lastUpdated: event.timestamp,
      });
      break;
  }
}

export function registerInventorySyncTarget(): void {
  getSyncManager().registerTarget({
    name: 'inventory-wms-sync',
    sources: ['Inventory'],
    handler: handleInventoryChange,
    retryAttempts: 5,
    retryDelay: 2000,
  });
}
```

### Example 2: Analytics Data Pipeline

```typescript
// lib/cdc/consumers/analytics-pipeline.ts
import { ChangeEvent } from '../types';
import { getSyncManager } from '../sync-manager';

interface AnalyticsEvent {
  eventType: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  userId?: string;
}

// Analytics data warehouse client
const analyticsWarehouse = {
  async ingest(events: AnalyticsEvent[]): Promise<void> {
    // Batch insert to data warehouse (e.g., BigQuery, Snowflake)
    console.log(`Ingesting ${events.length} analytics events`);
  },
};

const eventBuffer: AnalyticsEvent[] = [];
const BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 5000;

let flushTimeout: NodeJS.Timeout | null = null;

async function flushBuffer(): Promise<void> {
  if (eventBuffer.length === 0) return;

  const events = eventBuffer.splice(0, eventBuffer.length);
  await analyticsWarehouse.ingest(events);
}

function scheduleFlush(): void {
  if (flushTimeout) return;
  flushTimeout = setTimeout(async () => {
    flushTimeout = null;
    await flushBuffer();
  }, FLUSH_INTERVAL);
}

async function handleAnalyticsEvent(event: ChangeEvent): Promise<void> {
  const entity = (event.after || event.before) as any;
  if (!entity) return;

  const analyticsEvent: AnalyticsEvent = {
    eventType: `${event.source}_${event.operation}`,
    entityType: event.source,
    entityId: String(entity.id),
    timestamp: event.timestamp,
    data: {
      before: event.before,
      after: event.after,
      operation: event.operation,
    },
    userId: event.metadata.userId,
  };

  eventBuffer.push(analyticsEvent);

  if (eventBuffer.length >= BUFFER_SIZE) {
    await flushBuffer();
  } else {
    scheduleFlush();
  }
}

export function registerAnalyticsPipelineTarget(): void {
  getSyncManager().registerTarget({
    name: 'analytics-pipeline',
    sources: ['User', 'Order', 'Product', 'PageView', 'Click'],
    handler: handleAnalyticsEvent,
    retryAttempts: 3,
    retryDelay: 1000,
  });
}
```

### Example 3: Multi-Region Data Replication

```typescript
// lib/cdc/consumers/multi-region-sync.ts
import { ChangeEvent } from '../types';
import { getSyncManager } from '../sync-manager';
import { ConflictResolver } from '../conflict-resolution';

interface RegionConfig {
  name: string;
  endpoint: string;
  apiKey: string;
}

const regions: RegionConfig[] = [
  { name: 'us-east', endpoint: 'https://us-east.api.example.com', apiKey: process.env.US_EAST_API_KEY! },
  { name: 'eu-west', endpoint: 'https://eu-west.api.example.com', apiKey: process.env.EU_WEST_API_KEY! },
  { name: 'ap-south', endpoint: 'https://ap-south.api.example.com', apiKey: process.env.AP_SOUTH_API_KEY! },
];

const currentRegion = process.env.REGION || 'us-east';

// Custom conflict resolver for multi-region sync
const multiRegionResolver = new ConflictResolver({
  defaultStrategy: 'LAST_WRITER_WINS',
  fieldStrategies: {
    // Some fields should use first-writer-wins (like creation data)
    createdAt: 'FIRST_WRITER_WINS',
    createdBy: 'FIRST_WRITER_WINS',
    // Counters should be merged
    viewCount: 'MERGE',
    likeCount: 'MERGE',
  },
});

async function replicateToRegion(
  region: RegionConfig,
  event: ChangeEvent
): Promise<void> {
  // Skip replicating to source region
  if (region.name === currentRegion) return;

  const response = await fetch(`${region.endpoint}/api/replication/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${region.apiKey}`,
      'X-Source-Region': currentRegion,
      'X-Event-Id': event.id,
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Replication to ${region.name} failed: ${response.statusText}`);
  }
}

async function handleReplicationEvent(event: ChangeEvent): Promise<void> {
  // Skip events that came from replication (to avoid loops)
  if (event.metadata.correlationId?.startsWith('replication:')) {
    return;
  }

  // Replicate to all other regions
  const results = await Promise.allSettled(
    regions.map((region) => replicateToRegion(region, event))
  );

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to replicate to ${regions[index].name}:`, result.reason);
    }
  });

  // Throw if all replications failed
  const allFailed = results.every((r) => r.status === 'rejected');
  if (allFailed) {
    throw new Error('All region replications failed');
  }
}

// API route to receive replicated events
// app/api/replication/ingest/route.ts
export async function POST(request: Request) {
  const sourceRegion = request.headers.get('X-Source-Region');
  const eventId = request.headers.get('X-Event-Id');

  if (!sourceRegion || sourceRegion === currentRegion) {
    return Response.json({ error: 'Invalid source region' }, { status: 400 });
  }

  const event = await request.json() as ChangeEvent;

  // Apply the change locally with conflict resolution
  const existing = await getExistingRecord(event.source, event.key);

  if (existing) {
    const resolution = multiRegionResolver.resolve(event, existing);
    await applyResolvedChange(event.source, resolution.value);
  } else {
    await applyChange(event);
  }

  return Response.json({ success: true, eventId });
}

export function registerMultiRegionSyncTarget(): void {
  getSyncManager().registerTarget({
    name: 'multi-region-sync',
    sources: ['User', 'Product', 'Order'],
    handler: handleReplicationEvent,
    retryAttempts: 5,
    retryDelay: 2000,
  });
}
```

## Anti-patterns

### Anti-pattern 1: Blocking the Main Transaction

```typescript
// BAD - Synchronous external calls in middleware
const badMiddleware: Prisma.Middleware = async (params, next) => {
  const result = await next(params);

  // BAD: This blocks the main transaction
  await sendToExternalService(result);
  await updateSearchIndex(result);
  await notifyAllSubscribers(result);

  return result;
};

// GOOD - Async event emission, external calls happen independently
const goodMiddleware: Prisma.Middleware = async (params, next) => {
  const result = await next(params);

  // GOOD: Emit event asynchronously, don't block
  setImmediate(() => {
    emitter.emit(createChangeEvent(params, result)).catch(console.error);
  });

  return result;
};
```

### Anti-pattern 2: Missing Idempotency

```typescript
// BAD - No idempotency check, duplicate processing possible
async function handleChange(event: ChangeEvent): Promise<void> {
  // BAD: If this fails after partial processing and retries,
  // it will create duplicates
  await searchClient.index(event.after);
  await cacheClient.set(event.key, event.after);
  await analyticsClient.track(event);
}

// GOOD - Idempotent handling with deduplication
async function handleChange(event: ChangeEvent): Promise<void> {
  // Check if already processed
  const processed = await redis.get(`processed:${event.id}`);
  if (processed) {
    console.log(`Event ${event.id} already processed, skipping`);
    return;
  }

  // Process with idempotent operations
  await searchClient.index({
    id: event.key,
    ...event.after,
  }); // Upsert is idempotent

  await cacheClient.set(event.key, event.after); // Set is idempotent

  // Mark as processed
  await redis.setex(`processed:${event.id}`, 86400, '1');
}
```

### Anti-pattern 3: Tight Coupling to Consumers

```typescript
// BAD - Direct calls to consumers, tight coupling
async function updateUser(userId: string, data: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // BAD: Direct coupling to all consumers
  await searchService.updateUser(user);
  await cacheService.invalidateUser(userId);
  await analyticsService.trackUserUpdate(user);
  await emailService.sendProfileUpdateEmail(user);
  // Adding a new consumer requires code changes here
}

// GOOD - Event-based decoupling
async function updateUser(userId: string, data: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // GOOD: Consumers subscribe to events independently
  // Adding new consumers doesn't require changes here
  await emitter.emit({
    id: crypto.randomUUID(),
    source: 'User',
    operation: 'UPDATE',
    timestamp: new Date(),
    before: null,
    after: user,
    key: userId,
    metadata: { sequence: 0, schemaVersion: 1 },
  });
}
```

### Anti-pattern 4: Ignoring Ordering

```typescript
// BAD - Processing events without order guarantees
async function processEvents(events: ChangeEvent[]): Promise<void> {
  // BAD: Parallel processing can cause out-of-order updates
  await Promise.all(events.map(async (event) => {
    await applyChange(event);
  }));
}

// GOOD - Maintain ordering per entity
async function processEvents(events: ChangeEvent[]): Promise<void> {
  // Group by entity key
  const byKey = new Map<string, ChangeEvent[]>();
  for (const event of events) {
    const key = String(event.key);
    const existing = byKey.get(key) || [];
    byKey.set(key, [...existing, event]);
  }

  // Process each entity's events sequentially, entities in parallel
  await Promise.all(
    Array.from(byKey.entries()).map(async ([key, entityEvents]) => {
      // Sort by sequence number
      entityEvents.sort((a, b) => a.metadata.sequence - b.metadata.sequence);

      // Process in order
      for (const event of entityEvents) {
        await applyChange(event);
      }
    })
  );
}
```

## Testing

```typescript
// __tests__/cdc/prisma-middleware.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCDCMiddleware } from '@/lib/cdc/prisma-middleware';
import { getChangeEventEmitter } from '@/lib/cdc/event-emitter';

vi.mock('@/lib/cdc/event-emitter', () => ({
  getChangeEventEmitter: vi.fn(() => ({
    emit: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('CDC Prisma Middleware', () => {
  let middleware: any;
  let mockNext: any;

  beforeEach(() => {
    middleware = createCDCMiddleware({
      excludeTables: ['_prisma_migrations'],
    });
    mockNext = vi.fn().mockResolvedValue({ id: 'test-id', name: 'Test' });
  });

  it('should emit INSERT event on create', async () => {
    const params = {
      model: 'User',
      action: 'create',
      args: { data: { name: 'Test' } },
    };

    await middleware(params, mockNext);

    const emitter = getChangeEventEmitter();
    expect(emitter.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'User',
        operation: 'INSERT',
        after: expect.objectContaining({ id: 'test-id' }),
      })
    );
  });

  it('should skip excluded tables', async () => {
    const params = {
      model: '_prisma_migrations',
      action: 'create',
      args: {},
    };

    await middleware(params, mockNext);

    const emitter = getChangeEventEmitter();
    expect(emitter.emit).not.toHaveBeenCalled();
  });

  it('should emit UPDATE event on update', async () => {
    const params = {
      model: 'User',
      action: 'update',
      args: { where: { id: 'test-id' }, data: { name: 'Updated' } },
    };

    await middleware(params, mockNext);

    const emitter = getChangeEventEmitter();
    expect(emitter.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'User',
        operation: 'UPDATE',
      })
    );
  });
});

// __tests__/cdc/conflict-resolution.test.ts
import { describe, it, expect } from 'vitest';
import { ConflictResolver } from '@/lib/cdc/conflict-resolution';
import { ChangeEvent } from '@/lib/cdc/types';

describe('ConflictResolver', () => {
  describe('LAST_WRITER_WINS', () => {
    const resolver = new ConflictResolver({
      defaultStrategy: 'LAST_WRITER_WINS',
    });

    it('should prefer source value on conflict', () => {
      const event: ChangeEvent = {
        id: 'e1',
        source: 'User',
        operation: 'UPDATE',
        timestamp: new Date(),
        before: { id: '1', name: 'Old', email: 'old@test.com' },
        after: { id: '1', name: 'New', email: 'new@test.com' },
        key: '1',
        metadata: { sequence: 1, schemaVersion: 1 },
      };

      const target = { id: '1', name: 'Conflict', email: 'conflict@test.com' };

      const result = resolver.resolve(event, target);

      expect(result.value.name).toBe('New');
      expect(result.value.email).toBe('new@test.com');
    });
  });

  describe('MERGE', () => {
    const resolver = new ConflictResolver({
      defaultStrategy: 'MERGE',
    });

    it('should merge arrays', () => {
      const event: ChangeEvent = {
        id: 'e1',
        source: 'Post',
        operation: 'UPDATE',
        timestamp: new Date(),
        before: { id: '1', tags: ['a', 'b'] },
        after: { id: '1', tags: ['b', 'c'] },
        key: '1',
        metadata: { sequence: 1, schemaVersion: 1 },
      };

      const target = { id: '1', tags: ['a', 'd'] };

      const result = resolver.resolve(event, target);

      expect(result.value.tags).toContain('a');
      expect(result.value.tags).toContain('b');
      expect(result.value.tags).toContain('c');
      expect(result.value.tags).toContain('d');
    });
  });
});

// __tests__/cdc/sync-manager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncManager } from '@/lib/cdc/sync-manager';

describe('SyncManager', () => {
  let syncManager: SyncManager;

  beforeEach(() => {
    syncManager = new SyncManager();
  });

  it('should register and track sync targets', () => {
    const handler = vi.fn();

    syncManager.registerTarget({
      name: 'test-target',
      sources: ['User'],
      handler,
    });

    const status = syncManager.getStatus('test-target');
    expect(status).toBeDefined();
    expect(status?.status).toBe('paused');
  });

  it('should return all statuses', () => {
    syncManager.registerTarget({
      name: 'target-1',
      sources: ['User'],
      handler: vi.fn(),
    });

    syncManager.registerTarget({
      name: 'target-2',
      sources: ['Post'],
      handler: vi.fn(),
    });

    const statuses = syncManager.getAllStatuses();
    expect(statuses).toHaveLength(2);
  });
});
```

## Related Skills

### Composes From
- [prisma-patterns](./prisma-patterns.md) - Database operations that trigger CDC
- [redis-cache](./redis-cache.md) - Event distribution and caching
- [websocket](./websocket.md) - Real-time change notifications

### Composes Into
- [event-sourcing](./event-sourcing.md) - Event streams from CDC
- [multi-tenancy](./multi-tenancy.md) - Tenant data synchronization
- [search-filters](./search-filters.md) - Keep search indices in sync

### Alternatives
- Database replication - Built-in database replication features
- Debezium - Enterprise CDC solution with Kafka
- AWS DMS - Managed database migration with CDC

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Prisma middleware for change detection
- Outbox pattern for transactional events
- Redis-based event distribution
- Conflict resolution strategies
- Sync manager for external systems
- Search index sync consumer
- Cache invalidation consumer
- Dead letter queue handling
- Comprehensive testing examples
