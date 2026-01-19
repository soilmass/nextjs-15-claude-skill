---
id: pt-event-sourcing
name: Event Sourcing
version: 1.0.0
layer: L5
category: architecture
description: Implement event sourcing with event streams, immutable logs, event replay, temporal queries, and event versioning for audit-ready systems
tags: [event-sourcing, cqrs, events, audit, temporal, streams, next15, architecture]
composes: []
dependencies:
  "@prisma/client": "^5.0.0"
  "ioredis": "^5.3.0"
  "zod": "^3.22.0"
formula: "Event Sourcing = Events (immutable facts) + Aggregate (state) + Projections (views) + Replay (recovery)"
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Event Sourcing

## Overview

Event Sourcing is an architectural pattern where application state is derived from a sequence of immutable events rather than storing just the current state. Each change to the application is captured as an event, creating a complete audit trail that can be replayed to reconstruct any past state. This pattern is particularly valuable for applications requiring audit compliance, temporal queries, and complex business logic that benefits from understanding the history of changes.

In Next.js 15 applications, event sourcing provides a robust foundation for building systems that need complete traceability, support undo/redo functionality, enable time-travel debugging, and can reconstruct historical states for reporting or compliance purposes. Combined with CQRS (Command Query Responsibility Segregation), event sourcing separates the write model (commands producing events) from the read model (projections optimized for queries).

The pattern addresses several common challenges: maintaining a complete audit trail without complex logging, recovering from data corruption by replaying events, building multiple read-optimized views from the same event stream, and supporting complex temporal queries like "what was the account balance on January 15th?" This implementation uses Prisma for event storage, Redis for pub/sub and caching, and TypeScript for type-safe event handling.

## When to Use

Use this pattern when:
- You need a complete audit trail of all changes for compliance (SOC2, HIPAA, financial regulations)
- Business requirements include temporal queries (state at any point in time)
- Complex domain logic benefits from understanding the full history of changes
- You need undo/redo functionality or time-travel debugging
- Multiple systems need to react to the same events (event-driven architecture)
- Data reconciliation and dispute resolution require historical accuracy
- You want to build multiple read-optimized views from the same source of truth

## When NOT to Use

Avoid this pattern when:
- Your application has simple CRUD operations without audit requirements
- Storage costs are a primary concern (event stores grow indefinitely)
- Your team lacks experience with event-driven architectures
- Real-time consistency is more important than eventual consistency
- The domain doesn't have meaningful events or state changes
- Query patterns are simple and don't benefit from multiple projections

## Composition Diagram

```
EVENT SOURCING ARCHITECTURE
============================

┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMMAND SIDE (WRITE)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   COMMAND     │           │   AGGREGATE   │           │    EVENT      │
│   Handler     │──────────▶│   (Domain)    │──────────▶│    STORE      │
├───────────────┤           ├───────────────┤           ├───────────────┤
│• Validation   │           │• Load Events  │           │• Append Only  │
│• Authorization│           │• Apply Events │           │• Immutable    │
│• Dispatch     │           │• Create Event │           │• Ordered      │
└───────────────┘           └───────────────┘           └───────────────┘
                                                                │
                                                                │ Publish
                                                                ▼
                                                        ┌───────────────┐
                                                        │  EVENT BUS    │
                                                        │  (Redis PubSub)│
                                                        └───────┬───────┘
                                                                │
            ┌───────────────────────────────────────────────────┼───────────┐
            │                           │                       │           │
            ▼                           ▼                       ▼           ▼
    ┌───────────────┐           ┌───────────────┐       ┌──────────┐ ┌──────────┐
    │  PROJECTION   │           │  PROJECTION   │       │ EXTERNAL │ │ NOTIFIER │
    │  (Read Model) │           │  (Analytics)  │       │ SYSTEMS  │ │          │
    └───────────────┘           └───────────────┘       └──────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           QUERY SIDE (READ)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
    ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
    │  Current State│         │  Analytics    │         │  Search       │
    │  (Postgres)   │         │  (TimeSeries) │         │  (Elastic)    │
    └───────────────┘         └───────────────┘         └───────────────┘

Event Structure:
┌─────────────────────────────────────────────────────────────────────────────┐
│  Event = {                                                                   │
│    id: UUID                    // Unique event identifier                   │
│    aggregateId: UUID           // Entity this event belongs to              │
│    aggregateType: string       // Type of aggregate (e.g., "Order")         │
│    type: string               // Event type (e.g., "OrderPlaced")           │
│    version: number            // Sequence number for this aggregate         │
│    data: object               // Event payload                              │
│    metadata: {                // Contextual information                     │
│      correlationId, causationId, userId, timestamp                          │
│    }                                                                        │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

Aggregate Lifecycle:
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Load → Fetch events from store                                          │
│  2. Hydrate → Apply events to rebuild state                                 │
│  3. Execute → Handle command, validate business rules                       │
│  4. Emit → Create new event(s)                                              │
│  5. Persist → Append events to store                                        │
│  6. Publish → Notify projections via event bus                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Core Types and Event Definitions

```typescript
// lib/event-sourcing/types.ts
import { z } from 'zod';

export interface EventMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  timestamp: Date;
  schemaVersion: number;
}

export interface BaseEvent<TType extends string = string, TData = unknown> {
  id: string;
  aggregateId: string;
  aggregateType: string;
  type: TType;
  version: number;
  data: TData;
  metadata: EventMetadata;
}

export interface StoredEvent extends BaseEvent {
  globalPosition: number;
  createdAt: Date;
}

export interface EventEnvelope<E extends BaseEvent = BaseEvent> {
  event: E;
  position: number;
  timestamp: Date;
}

export interface AggregateRoot<TState, TEvent extends BaseEvent> {
  id: string;
  type: string;
  version: number;
  state: TState;
  uncommittedEvents: TEvent[];
  apply(event: TEvent): void;
  loadFromHistory(events: TEvent[]): void;
  getUncommittedEvents(): TEvent[];
  markEventsAsCommitted(): void;
}

export interface EventStore {
  append(events: BaseEvent[]): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<StoredEvent[]>;
  getAllEvents(fromPosition?: number, limit?: number): Promise<StoredEvent[]>;
  getEventsByType(eventType: string, fromPosition?: number): Promise<StoredEvent[]>;
  getEventsByAggregateType(aggregateType: string, fromPosition?: number): Promise<StoredEvent[]>;
  getSnapshot(aggregateId: string): Promise<{ state: unknown; version: number } | null>;
  saveSnapshot(aggregateId: string, state: unknown, version: number): Promise<void>;
}

export interface Projection<TState = unknown> {
  name: string;
  initialState: TState;
  handlers: Record<string, (state: TState, event: StoredEvent) => TState>;
  getState(): Promise<TState>;
  processEvent(event: StoredEvent): Promise<void>;
  rebuild(): Promise<void>;
}

// Event type helpers
export type EventType<T extends BaseEvent> = T['type'];
export type EventData<T extends BaseEvent> = T['data'];
```

### Event Registry and Validation

```typescript
// lib/event-sourcing/event-registry.ts
import { z, ZodSchema } from 'zod';
import { BaseEvent, EventMetadata } from './types';

interface EventDefinition<TType extends string, TData> {
  type: TType;
  schema: ZodSchema<TData>;
  version: number;
  upgraders?: Record<number, (data: unknown) => TData>;
}

class EventRegistry {
  private definitions = new Map<string, EventDefinition<string, unknown>>();

  register<TType extends string, TData>(
    definition: EventDefinition<TType, TData>
  ): void {
    this.definitions.set(definition.type, definition);
  }

  validate<TData>(eventType: string, data: unknown): TData {
    const definition = this.definitions.get(eventType);
    if (!definition) {
      throw new Error(`Unknown event type: ${eventType}`);
    }
    return definition.schema.parse(data) as TData;
  }

  upgrade<TData>(eventType: string, data: unknown, fromVersion: number): TData {
    const definition = this.definitions.get(eventType);
    if (!definition) {
      throw new Error(`Unknown event type: ${eventType}`);
    }

    let upgradedData = data;
    const currentVersion = definition.version;

    // Apply upgraders sequentially
    for (let v = fromVersion + 1; v <= currentVersion; v++) {
      const upgrader = definition.upgraders?.[v];
      if (upgrader) {
        upgradedData = upgrader(upgradedData);
      }
    }

    return definition.schema.parse(upgradedData) as TData;
  }

  getVersion(eventType: string): number {
    const definition = this.definitions.get(eventType);
    return definition?.version ?? 1;
  }
}

export const eventRegistry = new EventRegistry();

// Example event definitions
// Order domain events
export const OrderPlacedSchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  total: z.number(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
});

export const OrderShippedSchema = z.object({
  orderId: z.string(),
  trackingNumber: z.string(),
  carrier: z.string(),
  estimatedDelivery: z.string().datetime(),
});

export const OrderCancelledSchema = z.object({
  orderId: z.string(),
  reason: z.string(),
  cancelledBy: z.string(),
  refundAmount: z.number().optional(),
});

// Register events
eventRegistry.register({
  type: 'OrderPlaced',
  schema: OrderPlacedSchema,
  version: 2,
  upgraders: {
    2: (data: any) => ({
      ...data,
      // V2 added shippingAddress
      shippingAddress: data.shippingAddress ?? {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
    }),
  },
});

eventRegistry.register({
  type: 'OrderShipped',
  schema: OrderShippedSchema,
  version: 1,
});

eventRegistry.register({
  type: 'OrderCancelled',
  schema: OrderCancelledSchema,
  version: 1,
});

// Type definitions for events
export type OrderPlacedEvent = BaseEvent<'OrderPlaced', z.infer<typeof OrderPlacedSchema>>;
export type OrderShippedEvent = BaseEvent<'OrderShipped', z.infer<typeof OrderShippedSchema>>;
export type OrderCancelledEvent = BaseEvent<'OrderCancelled', z.infer<typeof OrderCancelledSchema>>;
export type OrderEvent = OrderPlacedEvent | OrderShippedEvent | OrderCancelledEvent;
```

### Event Store Implementation

```typescript
// lib/event-sourcing/event-store.ts
import { prisma } from '@/lib/db';
import { BaseEvent, StoredEvent, EventStore, EventMetadata } from './types';
import { eventRegistry } from './event-registry';
import Redis from 'ioredis';

interface EventStoreConfig {
  redisUrl?: string;
  snapshotThreshold?: number;
}

export class PrismaEventStore implements EventStore {
  private redis: Redis | null = null;
  private snapshotThreshold: number;

  constructor(config: EventStoreConfig = {}) {
    this.snapshotThreshold = config.snapshotThreshold ?? 100;

    if (config.redisUrl) {
      this.redis = new Redis(config.redisUrl);
    }
  }

  async append(events: BaseEvent[]): Promise<void> {
    if (events.length === 0) return;

    const aggregateId = events[0].aggregateId;

    // Get current version for optimistic concurrency
    const lastEvent = await prisma.event.findFirst({
      where: { aggregateId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const expectedVersion = lastEvent?.version ?? 0;
    const firstEventVersion = events[0].version;

    // Check for concurrent modification
    if (firstEventVersion !== expectedVersion + 1) {
      throw new Error(
        `Concurrency conflict: expected version ${expectedVersion + 1}, got ${firstEventVersion}`
      );
    }

    // Store events in a transaction
    await prisma.$transaction(async (tx) => {
      for (const event of events) {
        await tx.event.create({
          data: {
            id: event.id,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            type: event.type,
            version: event.version,
            data: event.data as any,
            metadata: event.metadata as any,
          },
        });
      }
    });

    // Publish events to subscribers
    if (this.redis) {
      for (const event of events) {
        await this.redis.publish(
          `events:${event.aggregateType}`,
          JSON.stringify(event)
        );
        await this.redis.publish('events:all', JSON.stringify(event));
      }
    }

    // Check if snapshot is needed
    const newVersion = events[events.length - 1].version;
    if (newVersion % this.snapshotThreshold === 0) {
      // Snapshot will be saved by the aggregate after it commits
    }
  }

  async getEvents(aggregateId: string, fromVersion = 0): Promise<StoredEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        aggregateId,
        version: { gt: fromVersion },
      },
      orderBy: { version: 'asc' },
    });

    return events.map((e) => this.mapToStoredEvent(e));
  }

  async getAllEvents(fromPosition = 0, limit = 1000): Promise<StoredEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        globalPosition: { gt: fromPosition },
      },
      orderBy: { globalPosition: 'asc' },
      take: limit,
    });

    return events.map((e) => this.mapToStoredEvent(e));
  }

  async getEventsByType(
    eventType: string,
    fromPosition = 0
  ): Promise<StoredEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        type: eventType,
        globalPosition: { gt: fromPosition },
      },
      orderBy: { globalPosition: 'asc' },
    });

    return events.map((e) => this.mapToStoredEvent(e));
  }

  async getEventsByAggregateType(
    aggregateType: string,
    fromPosition = 0
  ): Promise<StoredEvent[]> {
    const events = await prisma.event.findMany({
      where: {
        aggregateType,
        globalPosition: { gt: fromPosition },
      },
      orderBy: { globalPosition: 'asc' },
    });

    return events.map((e) => this.mapToStoredEvent(e));
  }

  async getSnapshot(
    aggregateId: string
  ): Promise<{ state: unknown; version: number } | null> {
    const snapshot = await prisma.eventSnapshot.findUnique({
      where: { aggregateId },
    });

    if (!snapshot) return null;

    return {
      state: snapshot.state,
      version: snapshot.version,
    };
  }

  async saveSnapshot(
    aggregateId: string,
    state: unknown,
    version: number
  ): Promise<void> {
    await prisma.eventSnapshot.upsert({
      where: { aggregateId },
      create: {
        aggregateId,
        state: state as any,
        version,
      },
      update: {
        state: state as any,
        version,
      },
    });
  }

  private mapToStoredEvent(dbEvent: any): StoredEvent {
    const schemaVersion = (dbEvent.metadata as any)?.schemaVersion ?? 1;
    const currentVersion = eventRegistry.getVersion(dbEvent.type);

    // Upgrade event data if needed
    let data = dbEvent.data;
    if (schemaVersion < currentVersion) {
      data = eventRegistry.upgrade(dbEvent.type, data, schemaVersion);
    }

    return {
      id: dbEvent.id,
      aggregateId: dbEvent.aggregateId,
      aggregateType: dbEvent.aggregateType,
      type: dbEvent.type,
      version: dbEvent.version,
      data,
      metadata: {
        ...(dbEvent.metadata as EventMetadata),
        schemaVersion: currentVersion,
      },
      globalPosition: dbEvent.globalPosition,
      createdAt: dbEvent.createdAt,
    };
  }

  async subscribe(
    channel: string,
    handler: (event: StoredEvent) => Promise<void>
  ): Promise<() => void> {
    if (!this.redis) {
      throw new Error('Redis not configured for subscriptions');
    }

    const subscriber = this.redis.duplicate();
    await subscriber.subscribe(channel);

    subscriber.on('message', async (ch, message) => {
      if (ch === channel) {
        const event = JSON.parse(message);
        await handler(event);
      }
    });

    return () => {
      subscriber.unsubscribe(channel);
      subscriber.quit();
    };
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Singleton instance
let eventStore: PrismaEventStore | null = null;

export function getEventStore(): PrismaEventStore {
  if (!eventStore) {
    eventStore = new PrismaEventStore({
      redisUrl: process.env.REDIS_URL,
      snapshotThreshold: 100,
    });
  }
  return eventStore;
}
```

### Aggregate Base Class

```typescript
// lib/event-sourcing/aggregate.ts
import { BaseEvent, AggregateRoot, EventMetadata } from './types';
import { getEventStore } from './event-store';

export abstract class Aggregate<TState, TEvent extends BaseEvent>
  implements AggregateRoot<TState, TEvent>
{
  public id: string;
  public abstract type: string;
  public version: number = 0;
  public state: TState;
  public uncommittedEvents: TEvent[] = [];

  protected abstract initialState: TState;
  protected abstract applyEvent(state: TState, event: TEvent): TState;

  constructor(id: string) {
    this.id = id;
    this.state = this.getInitialState();
  }

  private getInitialState(): TState {
    return this.initialState;
  }

  apply(event: TEvent): void {
    this.state = this.applyEvent(this.state, event);
    this.version = event.version;
  }

  loadFromHistory(events: TEvent[]): void {
    for (const event of events) {
      this.apply(event);
    }
  }

  protected createEvent<T extends TEvent['type']>(
    type: T,
    data: Extract<TEvent, { type: T }>['data'],
    metadata: Partial<EventMetadata>
  ): Extract<TEvent, { type: T }> {
    const event = {
      id: crypto.randomUUID(),
      aggregateId: this.id,
      aggregateType: this.type,
      type,
      version: this.version + this.uncommittedEvents.length + 1,
      data,
      metadata: {
        correlationId: metadata.correlationId || crypto.randomUUID(),
        causationId: metadata.causationId,
        userId: metadata.userId,
        timestamp: new Date(),
        schemaVersion: 1,
      },
    } as Extract<TEvent, { type: T }>;

    this.uncommittedEvents.push(event as TEvent);
    this.apply(event as TEvent);

    return event;
  }

  getUncommittedEvents(): TEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }
}

// Repository for loading and saving aggregates
export class AggregateRepository<
  TState,
  TEvent extends BaseEvent,
  TAggregate extends Aggregate<TState, TEvent>
> {
  constructor(
    private readonly factory: (id: string) => TAggregate,
    private readonly eventStore = getEventStore()
  ) {}

  async load(id: string): Promise<TAggregate> {
    const aggregate = this.factory(id);

    // Try to load from snapshot first
    const snapshot = await this.eventStore.getSnapshot(id);
    let fromVersion = 0;

    if (snapshot) {
      aggregate.state = snapshot.state as TState;
      aggregate.version = snapshot.version;
      fromVersion = snapshot.version;
    }

    // Load events after snapshot
    const events = await this.eventStore.getEvents(id, fromVersion);
    aggregate.loadFromHistory(events as TEvent[]);

    return aggregate;
  }

  async save(aggregate: TAggregate): Promise<void> {
    const events = aggregate.getUncommittedEvents();

    if (events.length === 0) return;

    await this.eventStore.append(events);
    aggregate.markEventsAsCommitted();

    // Save snapshot if threshold reached
    if (aggregate.version % 100 === 0) {
      await this.eventStore.saveSnapshot(
        aggregate.id,
        aggregate.state,
        aggregate.version
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    const events = await this.eventStore.getEvents(id, 0);
    return events.length > 0;
  }
}
```

### Order Aggregate Example

```typescript
// lib/domain/order/order-aggregate.ts
import { Aggregate, AggregateRepository } from '@/lib/event-sourcing/aggregate';
import { OrderEvent, OrderPlacedEvent, OrderShippedEvent, OrderCancelledEvent } from '@/lib/event-sourcing/event-registry';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderState {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress | null;
  trackingNumber: string | null;
  carrier: string | null;
  cancelReason: string | null;
  createdAt: Date | null;
  shippedAt: Date | null;
  cancelledAt: Date | null;
}

export class OrderAggregate extends Aggregate<OrderState, OrderEvent> {
  public type = 'Order';

  protected initialState: OrderState = {
    id: '',
    customerId: '',
    items: [],
    total: 0,
    status: 'pending',
    shippingAddress: null,
    trackingNumber: null,
    carrier: null,
    cancelReason: null,
    createdAt: null,
    shippedAt: null,
    cancelledAt: null,
  };

  protected applyEvent(state: OrderState, event: OrderEvent): OrderState {
    switch (event.type) {
      case 'OrderPlaced':
        return {
          ...state,
          id: event.data.orderId,
          customerId: event.data.customerId,
          items: event.data.items,
          total: event.data.total,
          shippingAddress: event.data.shippingAddress,
          status: 'confirmed',
          createdAt: event.metadata.timestamp,
        };

      case 'OrderShipped':
        return {
          ...state,
          status: 'shipped',
          trackingNumber: event.data.trackingNumber,
          carrier: event.data.carrier,
          shippedAt: event.metadata.timestamp,
        };

      case 'OrderCancelled':
        return {
          ...state,
          status: 'cancelled',
          cancelReason: event.data.reason,
          cancelledAt: event.metadata.timestamp,
        };

      default:
        return state;
    }
  }

  // Command methods
  place(
    customerId: string,
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    metadata: { correlationId?: string; userId?: string }
  ): OrderPlacedEvent {
    if (this.version > 0) {
      throw new Error('Order already exists');
    }

    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return this.createEvent('OrderPlaced', {
      orderId: this.id,
      customerId,
      items,
      total,
      shippingAddress,
    }, metadata);
  }

  ship(
    trackingNumber: string,
    carrier: string,
    estimatedDelivery: Date,
    metadata: { correlationId?: string; userId?: string }
  ): OrderShippedEvent {
    if (this.state.status !== 'confirmed') {
      throw new Error(`Cannot ship order in ${this.state.status} status`);
    }

    return this.createEvent('OrderShipped', {
      orderId: this.id,
      trackingNumber,
      carrier,
      estimatedDelivery: estimatedDelivery.toISOString(),
    }, metadata);
  }

  cancel(
    reason: string,
    cancelledBy: string,
    metadata: { correlationId?: string; userId?: string }
  ): OrderCancelledEvent {
    if (this.state.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    if (this.state.status === 'delivered') {
      throw new Error('Cannot cancel delivered order');
    }

    const refundAmount = this.state.status === 'confirmed' ? this.state.total : undefined;

    return this.createEvent('OrderCancelled', {
      orderId: this.id,
      reason,
      cancelledBy,
      refundAmount,
    }, metadata);
  }
}

// Repository
export const orderRepository = new AggregateRepository<
  OrderState,
  OrderEvent,
  OrderAggregate
>((id) => new OrderAggregate(id));
```

### Projections

```typescript
// lib/event-sourcing/projection.ts
import { prisma } from '@/lib/db';
import { StoredEvent, Projection } from './types';
import { getEventStore } from './event-store';
import Redis from 'ioredis';

interface ProjectionConfig {
  name: string;
  redisUrl?: string;
}

export abstract class BaseProjection<TState> implements Projection<TState> {
  abstract name: string;
  abstract initialState: TState;
  abstract handlers: Record<string, (state: TState, event: StoredEvent) => TState>;

  private redis: Redis | null = null;
  private lastProcessedPosition: number = 0;

  constructor(config?: ProjectionConfig) {
    if (config?.redisUrl) {
      this.redis = new Redis(config.redisUrl);
    }
  }

  async getState(): Promise<TState> {
    // Override in subclasses to read from specific storage
    throw new Error('getState must be implemented');
  }

  async processEvent(event: StoredEvent): Promise<void> {
    const handler = this.handlers[event.type];
    if (!handler) return;

    const currentState = await this.getState();
    const newState = handler(currentState, event);
    await this.saveState(newState, event.globalPosition);
    this.lastProcessedPosition = event.globalPosition;
  }

  protected abstract saveState(state: TState, position: number): Promise<void>;

  async rebuild(): Promise<void> {
    const eventStore = getEventStore();

    // Reset state
    await this.resetState();
    this.lastProcessedPosition = 0;

    // Process all events
    let position = 0;
    const batchSize = 1000;

    while (true) {
      const events = await eventStore.getAllEvents(position, batchSize);
      if (events.length === 0) break;

      for (const event of events) {
        await this.processEvent(event);
      }

      position = events[events.length - 1].globalPosition;
    }
  }

  protected abstract resetState(): Promise<void>;

  async startListening(): Promise<void> {
    const eventStore = getEventStore();

    // Catch up from last processed position
    const events = await eventStore.getAllEvents(this.lastProcessedPosition);
    for (const event of events) {
      await this.processEvent(event);
    }

    // Subscribe to new events
    await eventStore.subscribe('events:all', async (event) => {
      await this.processEvent(event);
    });
  }
}

// Order Summary Projection
interface OrderSummary {
  id: string;
  customerId: string;
  total: number;
  status: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderSummaryProjection extends BaseProjection<Map<string, OrderSummary>> {
  name = 'order-summary';
  initialState = new Map<string, OrderSummary>();

  handlers = {
    OrderPlaced: (state: Map<string, OrderSummary>, event: StoredEvent) => {
      const data = event.data as any;
      state.set(data.orderId, {
        id: data.orderId,
        customerId: data.customerId,
        total: data.total,
        status: 'confirmed',
        itemCount: data.items.length,
        createdAt: event.metadata.timestamp,
        updatedAt: event.metadata.timestamp,
      });
      return state;
    },

    OrderShipped: (state: Map<string, OrderSummary>, event: StoredEvent) => {
      const data = event.data as any;
      const order = state.get(data.orderId);
      if (order) {
        order.status = 'shipped';
        order.updatedAt = event.metadata.timestamp;
      }
      return state;
    },

    OrderCancelled: (state: Map<string, OrderSummary>, event: StoredEvent) => {
      const data = event.data as any;
      const order = state.get(data.orderId);
      if (order) {
        order.status = 'cancelled';
        order.updatedAt = event.metadata.timestamp;
      }
      return state;
    },
  };

  async getState(): Promise<Map<string, OrderSummary>> {
    const orders = await prisma.orderSummary.findMany();
    const state = new Map<string, OrderSummary>();
    for (const order of orders) {
      state.set(order.id, order as OrderSummary);
    }
    return state;
  }

  protected async saveState(state: Map<string, OrderSummary>, position: number): Promise<void> {
    // In practice, update only changed records
    for (const [id, order] of state) {
      await prisma.orderSummary.upsert({
        where: { id },
        create: order,
        update: order,
      });
    }

    await prisma.projectionCheckpoint.upsert({
      where: { name: this.name },
      create: { name: this.name, position },
      update: { position },
    });
  }

  protected async resetState(): Promise<void> {
    await prisma.orderSummary.deleteMany();
    await prisma.projectionCheckpoint.delete({
      where: { name: this.name },
    }).catch(() => {});
  }
}

// Customer Analytics Projection
interface CustomerAnalytics {
  customerId: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  cancelledOrders: number;
  lastOrderDate: Date | null;
}

export class CustomerAnalyticsProjection extends BaseProjection<Map<string, CustomerAnalytics>> {
  name = 'customer-analytics';
  initialState = new Map<string, CustomerAnalytics>();

  handlers = {
    OrderPlaced: (state: Map<string, CustomerAnalytics>, event: StoredEvent) => {
      const data = event.data as any;
      const analytics = state.get(data.customerId) || {
        customerId: data.customerId,
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        cancelledOrders: 0,
        lastOrderDate: null,
      };

      analytics.totalOrders += 1;
      analytics.totalSpent += data.total;
      analytics.averageOrderValue = analytics.totalSpent / analytics.totalOrders;
      analytics.lastOrderDate = event.metadata.timestamp;

      state.set(data.customerId, analytics);
      return state;
    },

    OrderCancelled: (state: Map<string, CustomerAnalytics>, event: StoredEvent) => {
      const data = event.data as any;
      // Need to look up customer from order - in real impl, this would be denormalized
      // For now, we'll skip incrementing cancelled count without customer info
      return state;
    },
  };

  async getState(): Promise<Map<string, CustomerAnalytics>> {
    const analytics = await prisma.customerAnalytics.findMany();
    const state = new Map<string, CustomerAnalytics>();
    for (const a of analytics) {
      state.set(a.customerId, a as CustomerAnalytics);
    }
    return state;
  }

  protected async saveState(state: Map<string, CustomerAnalytics>, position: number): Promise<void> {
    for (const [customerId, analytics] of state) {
      await prisma.customerAnalytics.upsert({
        where: { customerId },
        create: analytics,
        update: analytics,
      });
    }

    await prisma.projectionCheckpoint.upsert({
      where: { name: this.name },
      create: { name: this.name, position },
      update: { position },
    });
  }

  protected async resetState(): Promise<void> {
    await prisma.customerAnalytics.deleteMany();
    await prisma.projectionCheckpoint.delete({
      where: { name: this.name },
    }).catch(() => {});
  }
}
```

### Temporal Queries

```typescript
// lib/event-sourcing/temporal-query.ts
import { getEventStore } from './event-store';
import { Aggregate } from './aggregate';
import { BaseEvent } from './types';

export class TemporalQueryService {
  private eventStore = getEventStore();

  async getStateAtTime<TState, TEvent extends BaseEvent>(
    aggregateId: string,
    timestamp: Date,
    factory: (id: string) => Aggregate<TState, TEvent>
  ): Promise<TState | null> {
    const events = await this.eventStore.getEvents(aggregateId);

    if (events.length === 0) return null;

    const eventsBeforeTimestamp = events.filter(
      (e) => new Date(e.metadata.timestamp) <= timestamp
    );

    if (eventsBeforeTimestamp.length === 0) return null;

    const aggregate = factory(aggregateId);
    aggregate.loadFromHistory(eventsBeforeTimestamp as TEvent[]);

    return aggregate.state;
  }

  async getStateHistory<TState, TEvent extends BaseEvent>(
    aggregateId: string,
    factory: (id: string) => Aggregate<TState, TEvent>
  ): Promise<{ state: TState; timestamp: Date; eventType: string }[]> {
    const events = await this.eventStore.getEvents(aggregateId);
    const history: { state: TState; timestamp: Date; eventType: string }[] = [];

    const aggregate = factory(aggregateId);

    for (const event of events) {
      aggregate.apply(event as TEvent);
      history.push({
        state: { ...aggregate.state },
        timestamp: new Date(event.metadata.timestamp),
        eventType: event.type,
      });
    }

    return history;
  }

  async getEventsBetween(
    aggregateId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BaseEvent[]> {
    const allEvents = await this.eventStore.getEvents(aggregateId);

    return allEvents.filter((e) => {
      const timestamp = new Date(e.metadata.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }

  async getAggregateVersionAtTime(
    aggregateId: string,
    timestamp: Date
  ): Promise<number> {
    const events = await this.eventStore.getEvents(aggregateId);

    const eventsBeforeTimestamp = events.filter(
      (e) => new Date(e.metadata.timestamp) <= timestamp
    );

    if (eventsBeforeTimestamp.length === 0) return 0;

    return eventsBeforeTimestamp[eventsBeforeTimestamp.length - 1].version;
  }
}

export const temporalQueryService = new TemporalQueryService();
```

### Event Replay Service

```typescript
// lib/event-sourcing/replay.ts
import { getEventStore } from './event-store';
import { StoredEvent } from './types';

interface ReplayOptions {
  fromPosition?: number;
  toPosition?: number;
  eventTypes?: string[];
  aggregateTypes?: string[];
  aggregateIds?: string[];
  batchSize?: number;
  onProgress?: (processed: number, total: number) => void;
}

export class EventReplayService {
  private eventStore = getEventStore();

  async replay(
    handler: (event: StoredEvent) => Promise<void>,
    options: ReplayOptions = {}
  ): Promise<{ processed: number; errors: Error[] }> {
    const {
      fromPosition = 0,
      toPosition,
      eventTypes,
      aggregateTypes,
      aggregateIds,
      batchSize = 1000,
      onProgress,
    } = options;

    let position = fromPosition;
    let processed = 0;
    const errors: Error[] = [];

    // Count total events for progress
    const totalEvents = await this.countEvents(options);

    while (true) {
      let events = await this.eventStore.getAllEvents(position, batchSize);

      if (events.length === 0) break;

      // Apply filters
      events = this.filterEvents(events, {
        toPosition,
        eventTypes,
        aggregateTypes,
        aggregateIds,
      });

      // Check if we've passed the end position
      if (toPosition && events.length > 0 && events[0].globalPosition > toPosition) {
        break;
      }

      for (const event of events) {
        if (toPosition && event.globalPosition > toPosition) {
          break;
        }

        try {
          await handler(event);
          processed++;

          if (onProgress) {
            onProgress(processed, totalEvents);
          }
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error(String(error)));
        }
      }

      position = events[events.length - 1].globalPosition;
    }

    return { processed, errors };
  }

  async replayToProjection(
    projectionName: string,
    rebuildFromScratch = false
  ): Promise<void> {
    const { BaseProjection } = await import('./projection');
    const projections = await this.loadProjections();
    const projection = projections.get(projectionName);

    if (!projection) {
      throw new Error(`Projection ${projectionName} not found`);
    }

    if (rebuildFromScratch) {
      await projection.rebuild();
    } else {
      await projection.startListening();
    }
  }

  private async countEvents(options: ReplayOptions): Promise<number> {
    // Simplified count - in production, use a more efficient query
    const events = await this.eventStore.getAllEvents(
      options.fromPosition,
      1000000
    );
    return this.filterEvents(events, options).length;
  }

  private filterEvents(
    events: StoredEvent[],
    options: {
      toPosition?: number;
      eventTypes?: string[];
      aggregateTypes?: string[];
      aggregateIds?: string[];
    }
  ): StoredEvent[] {
    return events.filter((event) => {
      if (options.toPosition && event.globalPosition > options.toPosition) {
        return false;
      }
      if (options.eventTypes && !options.eventTypes.includes(event.type)) {
        return false;
      }
      if (
        options.aggregateTypes &&
        !options.aggregateTypes.includes(event.aggregateType)
      ) {
        return false;
      }
      if (
        options.aggregateIds &&
        !options.aggregateIds.includes(event.aggregateId)
      ) {
        return false;
      }
      return true;
    });
  }

  private async loadProjections(): Promise<Map<string, any>> {
    // In production, use a projection registry
    const { OrderSummaryProjection, CustomerAnalyticsProjection } = await import('./projection');

    const projections = new Map();
    projections.set('order-summary', new OrderSummaryProjection());
    projections.set('customer-analytics', new CustomerAnalyticsProjection());

    return projections;
  }
}

export const eventReplayService = new EventReplayService();
```

### Server Actions for Event Sourcing

```typescript
// app/actions/orders.ts
'use server';

import { auth } from '@/lib/auth';
import { orderRepository, OrderAggregate } from '@/lib/domain/order/order-aggregate';
import { temporalQueryService } from '@/lib/event-sourcing/temporal-query';
import { revalidatePath } from 'next/cache';

interface PlaceOrderInput {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export async function placeOrder(input: PlaceOrderInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const orderId = crypto.randomUUID();
  const order = new OrderAggregate(orderId);

  order.place(
    session.user.id,
    input.items,
    input.shippingAddress,
    { userId: session.user.id }
  );

  await orderRepository.save(order);

  revalidatePath('/orders');
  return { orderId: order.id };
}

export async function shipOrder(
  orderId: string,
  trackingNumber: string,
  carrier: string,
  estimatedDelivery: Date
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const order = await orderRepository.load(orderId);

  order.ship(trackingNumber, carrier, estimatedDelivery, {
    userId: session.user.id,
  });

  await orderRepository.save(order);

  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function cancelOrder(orderId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const order = await orderRepository.load(orderId);

  order.cancel(reason, session.user.id, {
    userId: session.user.id,
  });

  await orderRepository.save(order);

  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function getOrderHistory(orderId: string) {
  const history = await temporalQueryService.getStateHistory(
    orderId,
    (id) => new OrderAggregate(id)
  );

  return history;
}

export async function getOrderAtTime(orderId: string, timestamp: Date) {
  const state = await temporalQueryService.getStateAtTime(
    orderId,
    timestamp,
    (id) => new OrderAggregate(id)
  );

  return state;
}
```

### Database Schema

```prisma
// prisma/schema.prisma

model Event {
  id             String   @id @default(cuid())
  aggregateId    String
  aggregateType  String
  type           String
  version        Int
  data           Json
  metadata       Json
  globalPosition Int      @default(autoincrement())
  createdAt      DateTime @default(now())

  @@unique([aggregateId, version])
  @@index([aggregateId, version])
  @@index([type])
  @@index([aggregateType])
  @@index([globalPosition])
  @@index([createdAt])
}

model EventSnapshot {
  id          String   @id @default(cuid())
  aggregateId String   @unique
  state       Json
  version     Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([aggregateId])
}

model ProjectionCheckpoint {
  id        String   @id @default(cuid())
  name      String   @unique
  position  Int
  updatedAt DateTime @updatedAt

  @@index([name])
}

// Read models (projections)
model OrderSummary {
  id         String   @id
  customerId String
  total      Float
  status     String
  itemCount  Int
  createdAt  DateTime
  updatedAt  DateTime

  @@index([customerId])
  @@index([status])
  @@index([createdAt])
}

model CustomerAnalytics {
  id                String    @id @default(cuid())
  customerId        String    @unique
  totalOrders       Int
  totalSpent        Float
  averageOrderValue Float
  cancelledOrders   Int
  lastOrderDate     DateTime?

  @@index([customerId])
  @@index([totalSpent])
}
```

## Examples

### Example 1: Financial Transaction Audit Trail

```typescript
// lib/domain/account/account-aggregate.ts
import { Aggregate, AggregateRepository } from '@/lib/event-sourcing/aggregate';
import { BaseEvent } from '@/lib/event-sourcing/types';

type AccountEvent =
  | BaseEvent<'AccountOpened', { accountId: string; ownerId: string; initialBalance: number }>
  | BaseEvent<'MoneyDeposited', { accountId: string; amount: number; reference: string }>
  | BaseEvent<'MoneyWithdrawn', { accountId: string; amount: number; reference: string }>
  | BaseEvent<'TransferSent', { accountId: string; toAccountId: string; amount: number; reference: string }>
  | BaseEvent<'TransferReceived', { accountId: string; fromAccountId: string; amount: number; reference: string }>;

interface AccountState {
  id: string;
  ownerId: string;
  balance: number;
  transactions: { type: string; amount: number; reference: string; timestamp: Date }[];
  isActive: boolean;
}

class AccountAggregate extends Aggregate<AccountState, AccountEvent> {
  type = 'Account';

  protected initialState: AccountState = {
    id: '',
    ownerId: '',
    balance: 0,
    transactions: [],
    isActive: false,
  };

  protected applyEvent(state: AccountState, event: AccountEvent): AccountState {
    switch (event.type) {
      case 'AccountOpened':
        return {
          ...state,
          id: event.data.accountId,
          ownerId: event.data.ownerId,
          balance: event.data.initialBalance,
          isActive: true,
        };

      case 'MoneyDeposited':
        return {
          ...state,
          balance: state.balance + event.data.amount,
          transactions: [
            ...state.transactions,
            { type: 'deposit', amount: event.data.amount, reference: event.data.reference, timestamp: event.metadata.timestamp },
          ],
        };

      case 'MoneyWithdrawn':
        return {
          ...state,
          balance: state.balance - event.data.amount,
          transactions: [
            ...state.transactions,
            { type: 'withdrawal', amount: -event.data.amount, reference: event.data.reference, timestamp: event.metadata.timestamp },
          ],
        };

      case 'TransferSent':
        return {
          ...state,
          balance: state.balance - event.data.amount,
          transactions: [
            ...state.transactions,
            { type: 'transfer_out', amount: -event.data.amount, reference: event.data.reference, timestamp: event.metadata.timestamp },
          ],
        };

      case 'TransferReceived':
        return {
          ...state,
          balance: state.balance + event.data.amount,
          transactions: [
            ...state.transactions,
            { type: 'transfer_in', amount: event.data.amount, reference: event.data.reference, timestamp: event.metadata.timestamp },
          ],
        };

      default:
        return state;
    }
  }

  withdraw(amount: number, reference: string, metadata: { userId?: string }) {
    if (!this.state.isActive) {
      throw new Error('Account is not active');
    }
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (this.state.balance < amount) {
      throw new Error('Insufficient balance');
    }

    return this.createEvent('MoneyWithdrawn', {
      accountId: this.id,
      amount,
      reference,
    }, metadata);
  }

  // Get balance at a specific time for auditing
  getBalanceAtTransaction(transactionIndex: number): number {
    return this.state.transactions
      .slice(0, transactionIndex + 1)
      .reduce((sum, t) => sum + t.amount, 0);
  }
}

// Query historical balance for audit
async function auditAccountBalance(accountId: string, date: Date) {
  const state = await temporalQueryService.getStateAtTime(
    accountId,
    date,
    (id) => new AccountAggregate(id)
  );

  return {
    balanceAtDate: state?.balance ?? 0,
    transactionCount: state?.transactions.length ?? 0,
  };
}
```

### Example 2: Document Versioning with Complete History

```typescript
// lib/domain/document/document-aggregate.ts
type DocumentEvent =
  | BaseEvent<'DocumentCreated', { documentId: string; title: string; content: string; authorId: string }>
  | BaseEvent<'DocumentEdited', { documentId: string; title?: string; content?: string; editorId: string }>
  | BaseEvent<'DocumentPublished', { documentId: string; publishedBy: string }>
  | BaseEvent<'DocumentArchived', { documentId: string; archivedBy: string; reason: string }>;

interface DocumentState {
  id: string;
  title: string;
  content: string;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  editHistory: { editorId: string; timestamp: Date; changes: string[] }[];
}

class DocumentAggregate extends Aggregate<DocumentState, DocumentEvent> {
  type = 'Document';

  protected initialState: DocumentState = {
    id: '',
    title: '',
    content: '',
    authorId: '',
    status: 'draft',
    version: 0,
    editHistory: [],
  };

  protected applyEvent(state: DocumentState, event: DocumentEvent): DocumentState {
    switch (event.type) {
      case 'DocumentCreated':
        return {
          ...state,
          id: event.data.documentId,
          title: event.data.title,
          content: event.data.content,
          authorId: event.data.authorId,
          status: 'draft',
          version: 1,
        };

      case 'DocumentEdited':
        const changes: string[] = [];
        if (event.data.title) changes.push('title');
        if (event.data.content) changes.push('content');

        return {
          ...state,
          title: event.data.title ?? state.title,
          content: event.data.content ?? state.content,
          version: state.version + 1,
          editHistory: [
            ...state.editHistory,
            { editorId: event.data.editorId, timestamp: event.metadata.timestamp, changes },
          ],
        };

      case 'DocumentPublished':
        return { ...state, status: 'published' };

      case 'DocumentArchived':
        return { ...state, status: 'archived' };

      default:
        return state;
    }
  }

  edit(
    changes: { title?: string; content?: string },
    editorId: string,
    metadata: { userId?: string }
  ) {
    if (this.state.status === 'archived') {
      throw new Error('Cannot edit archived document');
    }

    return this.createEvent('DocumentEdited', {
      documentId: this.id,
      ...changes,
      editorId,
    }, metadata);
  }
}

// Compare document versions
async function compareDocumentVersions(
  documentId: string,
  version1: number,
  version2: number
): Promise<{ v1: DocumentState; v2: DocumentState }> {
  const allEvents = await getEventStore().getEvents(documentId);

  const aggregate1 = new DocumentAggregate(documentId);
  const aggregate2 = new DocumentAggregate(documentId);

  for (const event of allEvents) {
    if (event.version <= version1) {
      aggregate1.apply(event as DocumentEvent);
    }
    if (event.version <= version2) {
      aggregate2.apply(event as DocumentEvent);
    }
  }

  return {
    v1: aggregate1.state,
    v2: aggregate2.state,
  };
}
```

### Example 3: Inventory Management with Event Replay

```typescript
// lib/domain/inventory/inventory-aggregate.ts
type InventoryEvent =
  | BaseEvent<'ProductAdded', { productId: string; sku: string; name: string; initialQuantity: number }>
  | BaseEvent<'StockReceived', { productId: string; quantity: number; supplier: string; batchId: string }>
  | BaseEvent<'StockReserved', { productId: string; quantity: number; orderId: string }>
  | BaseEvent<'StockShipped', { productId: string; quantity: number; orderId: string }>
  | BaseEvent<'StockAdjusted', { productId: string; quantity: number; reason: string; adjustedBy: string }>;

interface InventoryState {
  productId: string;
  sku: string;
  name: string;
  availableQuantity: number;
  reservedQuantity: number;
  movements: { type: string; quantity: number; reference: string; timestamp: Date }[];
}

class InventoryAggregate extends Aggregate<InventoryState, InventoryEvent> {
  type = 'Inventory';

  protected initialState: InventoryState = {
    productId: '',
    sku: '',
    name: '',
    availableQuantity: 0,
    reservedQuantity: 0,
    movements: [],
  };

  protected applyEvent(state: InventoryState, event: InventoryEvent): InventoryState {
    switch (event.type) {
      case 'ProductAdded':
        return {
          ...state,
          productId: event.data.productId,
          sku: event.data.sku,
          name: event.data.name,
          availableQuantity: event.data.initialQuantity,
          movements: [{
            type: 'initial',
            quantity: event.data.initialQuantity,
            reference: 'Initial stock',
            timestamp: event.metadata.timestamp,
          }],
        };

      case 'StockReceived':
        return {
          ...state,
          availableQuantity: state.availableQuantity + event.data.quantity,
          movements: [
            ...state.movements,
            {
              type: 'received',
              quantity: event.data.quantity,
              reference: `Batch: ${event.data.batchId}`,
              timestamp: event.metadata.timestamp,
            },
          ],
        };

      case 'StockReserved':
        return {
          ...state,
          availableQuantity: state.availableQuantity - event.data.quantity,
          reservedQuantity: state.reservedQuantity + event.data.quantity,
          movements: [
            ...state.movements,
            {
              type: 'reserved',
              quantity: -event.data.quantity,
              reference: `Order: ${event.data.orderId}`,
              timestamp: event.metadata.timestamp,
            },
          ],
        };

      case 'StockShipped':
        return {
          ...state,
          reservedQuantity: state.reservedQuantity - event.data.quantity,
          movements: [
            ...state.movements,
            {
              type: 'shipped',
              quantity: -event.data.quantity,
              reference: `Order: ${event.data.orderId}`,
              timestamp: event.metadata.timestamp,
            },
          ],
        };

      case 'StockAdjusted':
        return {
          ...state,
          availableQuantity: state.availableQuantity + event.data.quantity,
          movements: [
            ...state.movements,
            {
              type: 'adjustment',
              quantity: event.data.quantity,
              reference: event.data.reason,
              timestamp: event.metadata.timestamp,
            },
          ],
        };

      default:
        return state;
    }
  }

  reserve(quantity: number, orderId: string, metadata: { userId?: string }) {
    if (this.state.availableQuantity < quantity) {
      throw new Error(`Insufficient stock. Available: ${this.state.availableQuantity}`);
    }

    return this.createEvent('StockReserved', {
      productId: this.id,
      quantity,
      orderId,
    }, metadata);
  }
}

// Rebuild inventory from events for reconciliation
async function reconcileInventory(productId: string): Promise<{
  currentState: InventoryState;
  discrepancies: { expected: number; actual: number }[];
}> {
  const aggregate = await new AggregateRepository(
    (id) => new InventoryAggregate(id)
  ).load(productId);

  // Compare with actual physical count (from external source)
  const physicalCount = await getPhysicalInventoryCount(productId);

  const discrepancies = [];
  if (aggregate.state.availableQuantity !== physicalCount) {
    discrepancies.push({
      expected: aggregate.state.availableQuantity,
      actual: physicalCount,
    });
  }

  return {
    currentState: aggregate.state,
    discrepancies,
  };
}
```

## Anti-patterns

### Anti-pattern 1: Mutable Events

```typescript
// BAD - Modifying events after they are stored
async function fixEvent(eventId: string, newData: any) {
  await prisma.event.update({
    where: { id: eventId },
    data: { data: newData }, // NEVER modify event data!
  });
}

// GOOD - Create compensating events instead
async function correctInventory(productId: string, reason: string, adjustment: number) {
  const inventory = await inventoryRepository.load(productId);

  // Create a new adjustment event to correct the issue
  inventory.adjust(adjustment, reason, { userId: 'system' });

  await inventoryRepository.save(inventory);
}
```

### Anti-pattern 2: Business Logic in Event Handlers

```typescript
// BAD - Complex business logic in event application
protected applyEvent(state: OrderState, event: OrderEvent): OrderState {
  if (event.type === 'OrderPlaced') {
    // BAD: Making API calls, database queries, or complex calculations
    const discount = await calculateDiscount(event.data.customerId);
    const tax = await getTaxRate(event.data.shippingAddress);
    sendOrderConfirmationEmail(event.data.customerId); // Side effects!

    return {
      ...state,
      total: event.data.total - discount + tax,
    };
  }
}

// GOOD - Keep event handlers pure, move logic to command handlers
protected applyEvent(state: OrderState, event: OrderEvent): OrderState {
  if (event.type === 'OrderPlaced') {
    // Event already contains calculated values
    return {
      ...state,
      total: event.data.total, // Pre-calculated in command handler
    };
  }
}

// Command handler does the complex work
async function handlePlaceOrder(command: PlaceOrderCommand) {
  const discount = await calculateDiscount(command.customerId);
  const tax = await getTaxRate(command.shippingAddress);
  const total = command.subtotal - discount + tax;

  const order = new OrderAggregate(command.orderId);
  order.place({
    ...command,
    total, // Include calculated values in event
  });

  await orderRepository.save(order);

  // Handle side effects after persistence
  await sendOrderConfirmationEmail(command.customerId);
}
```

### Anti-pattern 3: Large Event Payloads

```typescript
// BAD - Storing entire document content in every edit event
const event: DocumentEditedEvent = {
  type: 'DocumentEdited',
  data: {
    documentId: 'doc-1',
    fullContent: '... 100KB of content ...', // Full content on every edit!
    editorId: 'user-1',
  },
};

// GOOD - Store only the changes
const event: DocumentEditedEvent = {
  type: 'DocumentEdited',
  data: {
    documentId: 'doc-1',
    changes: [
      { position: 150, delete: 5, insert: 'new text' }, // Delta only
    ],
    editorId: 'user-1',
  },
};

// Or use snapshotting for large aggregates
if (aggregate.version % 50 === 0) {
  await eventStore.saveSnapshot(aggregate.id, aggregate.state, aggregate.version);
}
```

### Anti-pattern 4: Querying Event Store Directly

```typescript
// BAD - Using event store for read queries
async function getOrdersByCustomer(customerId: string) {
  // Expensive: loads ALL events, builds ALL aggregates
  const events = await eventStore.getAllEvents();
  const orders = events
    .filter(e => e.type === 'OrderPlaced' && e.data.customerId === customerId)
    .map(e => buildOrderFromEvents(e.aggregateId));

  return orders;
}

// GOOD - Use projections for read queries
async function getOrdersByCustomer(customerId: string) {
  // Fast: queries optimized read model
  return prisma.orderSummary.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });
}
```

## Testing

```typescript
// __tests__/event-sourcing/aggregate.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { OrderAggregate } from '@/lib/domain/order/order-aggregate';

describe('OrderAggregate', () => {
  let order: OrderAggregate;

  beforeEach(() => {
    order = new OrderAggregate('order-1');
  });

  describe('place', () => {
    it('should create OrderPlaced event', () => {
      const event = order.place(
        'customer-1',
        [{ productId: 'prod-1', quantity: 2, price: 100 }],
        { street: '123 Main', city: 'NYC', postalCode: '10001', country: 'USA' },
        { userId: 'user-1' }
      );

      expect(event.type).toBe('OrderPlaced');
      expect(event.data.total).toBe(200);
      expect(order.state.status).toBe('confirmed');
      expect(order.getUncommittedEvents()).toHaveLength(1);
    });

    it('should reject empty items', () => {
      expect(() =>
        order.place('customer-1', [], { street: '', city: '', postalCode: '', country: '' }, {})
      ).toThrow('Order must have at least one item');
    });
  });

  describe('ship', () => {
    it('should create OrderShipped event for confirmed orders', () => {
      order.place(
        'customer-1',
        [{ productId: 'prod-1', quantity: 1, price: 50 }],
        { street: '123 Main', city: 'NYC', postalCode: '10001', country: 'USA' },
        {}
      );

      const event = order.ship('TRACK123', 'FedEx', new Date('2025-02-01'), {});

      expect(event.type).toBe('OrderShipped');
      expect(order.state.status).toBe('shipped');
      expect(order.state.trackingNumber).toBe('TRACK123');
    });

    it('should reject shipping non-confirmed orders', () => {
      expect(() =>
        order.ship('TRACK123', 'FedEx', new Date(), {})
      ).toThrow('Cannot ship order in pending status');
    });
  });

  describe('loadFromHistory', () => {
    it('should rebuild state from events', () => {
      const events = [
        {
          id: 'e1',
          aggregateId: 'order-1',
          aggregateType: 'Order',
          type: 'OrderPlaced' as const,
          version: 1,
          data: {
            orderId: 'order-1',
            customerId: 'customer-1',
            items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
            total: 100,
            shippingAddress: { street: '123', city: 'NYC', postalCode: '10001', country: 'USA' },
          },
          metadata: { correlationId: 'c1', timestamp: new Date(), schemaVersion: 1 },
        },
        {
          id: 'e2',
          aggregateId: 'order-1',
          aggregateType: 'Order',
          type: 'OrderShipped' as const,
          version: 2,
          data: {
            orderId: 'order-1',
            trackingNumber: 'TRACK123',
            carrier: 'FedEx',
            estimatedDelivery: '2025-02-01T00:00:00Z',
          },
          metadata: { correlationId: 'c2', timestamp: new Date(), schemaVersion: 1 },
        },
      ];

      order.loadFromHistory(events);

      expect(order.version).toBe(2);
      expect(order.state.status).toBe('shipped');
      expect(order.state.trackingNumber).toBe('TRACK123');
    });
  });
});

// __tests__/event-sourcing/projection.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderSummaryProjection } from '@/lib/event-sourcing/projection';
import { StoredEvent } from '@/lib/event-sourcing/types';

describe('OrderSummaryProjection', () => {
  let projection: OrderSummaryProjection;

  beforeEach(() => {
    projection = new OrderSummaryProjection();
  });

  it('should handle OrderPlaced event', async () => {
    const event: StoredEvent = {
      id: 'e1',
      aggregateId: 'order-1',
      aggregateType: 'Order',
      type: 'OrderPlaced',
      version: 1,
      data: {
        orderId: 'order-1',
        customerId: 'customer-1',
        items: [{ productId: 'p1', quantity: 2, price: 50 }],
        total: 100,
        shippingAddress: {},
      },
      metadata: { correlationId: 'c1', timestamp: new Date(), schemaVersion: 1 },
      globalPosition: 1,
      createdAt: new Date(),
    };

    const state = new Map();
    const newState = projection.handlers.OrderPlaced(state, event);

    expect(newState.get('order-1')).toMatchObject({
      id: 'order-1',
      customerId: 'customer-1',
      total: 100,
      status: 'confirmed',
      itemCount: 1,
    });
  });
});

// __tests__/event-sourcing/temporal-query.test.ts
import { describe, it, expect, vi } from 'vitest';
import { TemporalQueryService } from '@/lib/event-sourcing/temporal-query';
import { OrderAggregate } from '@/lib/domain/order/order-aggregate';

describe('TemporalQueryService', () => {
  it('should return state at specific timestamp', async () => {
    const service = new TemporalQueryService();

    vi.mock('@/lib/event-sourcing/event-store', () => ({
      getEventStore: () => ({
        getEvents: vi.fn().mockResolvedValue([
          {
            id: 'e1',
            type: 'OrderPlaced',
            version: 1,
            metadata: { timestamp: new Date('2025-01-01') },
            data: { orderId: 'o1', customerId: 'c1', items: [], total: 100, shippingAddress: {} },
          },
          {
            id: 'e2',
            type: 'OrderShipped',
            version: 2,
            metadata: { timestamp: new Date('2025-01-15') },
            data: { orderId: 'o1', trackingNumber: 'T1', carrier: 'FedEx', estimatedDelivery: '' },
          },
        ]),
      }),
    }));

    // Query state before shipping
    const stateBeforeShip = await service.getStateAtTime(
      'o1',
      new Date('2025-01-10'),
      (id) => new OrderAggregate(id)
    );

    expect(stateBeforeShip?.status).toBe('confirmed');

    // Query state after shipping
    const stateAfterShip = await service.getStateAtTime(
      'o1',
      new Date('2025-01-20'),
      (id) => new OrderAggregate(id)
    );

    expect(stateAfterShip?.status).toBe('shipped');
  });
});
```

## Related Skills

### Composes From
- [prisma-patterns](./prisma-patterns.md) - Database storage for events
- [redis-cache](./redis-cache.md) - Event pub/sub and caching
- [websocket](./websocket.md) - Real-time event notifications

### Composes Into
- [cdc](./cdc.md) - Change data capture from event streams
- [audit-logging](./audit-logging.md) - Compliance audit trails
- [cqrs](./cqrs.md) - Command query responsibility segregation

### Alternatives
- Traditional CRUD - When full event history is not needed
- Audit tables - Simple audit logging without full event sourcing
- Database triggers - Simpler change tracking for single database

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Event store with Prisma and Redis pub/sub
- Aggregate base class with snapshot support
- Projection system for read models
- Temporal query service for historical state
- Event replay and rebuild capabilities
- Event versioning and schema migration
- Order domain example with full CQRS
- Comprehensive testing examples
