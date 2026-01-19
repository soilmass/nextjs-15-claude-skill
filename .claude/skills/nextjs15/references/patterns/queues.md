---
id: pt-queues
name: Message Queues
version: 2.0.0
layer: L5
category: background
description: Implement reliable message queues for async processing and event-driven architectures
tags: [jobs, queue, messaging, async, events]
composes: []
dependencies: []
formula: Queue Service + Handlers + DLQ + Retries = Reliable Async Processing
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Processing webhooks asynchronously
- Email sending queues
- Video/image processing pipelines
- Event-driven microservices
- Rate-limited API calls

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Message Queue Architecture                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Producer                                                   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Queue (Upstash/BullMQ/SQS)                          │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ [Message1] [Message2] [Message3] [Message4]     │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Consumer (Worker)                                   │   │
│  │ - Process message                                   │   │
│  │ - Acknowledge on success                            │   │
│  │ - Retry on failure (exponential backoff)            │   │
│  │ - Move to DLQ after max retries                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Dead Letter Queue (DLQ):                                   │
│  - Failed messages for investigation                       │
│  - Manual replay capability                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Message Queues

Build reliable message queues for async processing, event-driven architectures, and decoupled services.

## Overview

Message queues provide:
- Reliable message delivery
- Load leveling
- Service decoupling
- Retry handling
- Dead letter queues

## Implementation

### Upstash Redis Queue

```typescript
// lib/queue/redis-queue.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

interface QueueMessage<T = unknown> {
  id: string;
  payload: T;
  attempts: number;
  createdAt: number;
  processAt?: number;
}

export class RedisQueue<T = unknown> {
  private queueKey: string;
  private processingKey: string;
  private deadLetterKey: string;
  
  constructor(name: string) {
    this.queueKey = `queue:${name}`;
    this.processingKey = `queue:${name}:processing`;
    this.deadLetterKey = `queue:${name}:dead`;
  }
  
  async enqueue(payload: T, options?: { delay?: number }): Promise<string> {
    const message: QueueMessage<T> = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      payload,
      attempts: 0,
      createdAt: Date.now(),
      processAt: options?.delay ? Date.now() + options.delay * 1000 : undefined,
    };
    
    if (options?.delay) {
      // Delayed message goes to sorted set
      await redis.zadd(this.queueKey + ":delayed", {
        score: message.processAt!,
        member: JSON.stringify(message),
      });
    } else {
      await redis.rpush(this.queueKey, JSON.stringify(message));
    }
    
    return message.id;
  }
  
  async dequeue(timeout: number = 0): Promise<QueueMessage<T> | null> {
    // First, move any ready delayed messages to the main queue
    await this.moveDelayedMessages();
    
    const result = await redis.blpop<string[]>(
      [this.queueKey],
      timeout
    );
    
    if (!result) return null;
    
    const message = JSON.parse(result[1]) as QueueMessage<T>;
    
    // Add to processing set
    await redis.hset(this.processingKey, {
      [message.id]: JSON.stringify({
        ...message,
        startedAt: Date.now(),
      }),
    });
    
    return message;
  }
  
  async ack(messageId: string): Promise<void> {
    await redis.hdel(this.processingKey, messageId);
  }
  
  async nack(
    message: QueueMessage<T>,
    options?: { maxAttempts?: number; backoff?: number }
  ): Promise<void> {
    const { maxAttempts = 3, backoff = 1000 } = options || {};
    
    await redis.hdel(this.processingKey, message.id);
    
    if (message.attempts >= maxAttempts) {
      // Move to dead letter queue
      await redis.rpush(this.deadLetterKey, JSON.stringify(message));
    } else {
      // Re-queue with backoff
      const delay = backoff * Math.pow(2, message.attempts);
      await this.enqueue(message.payload, { delay: delay / 1000 });
    }
  }
  
  private async moveDelayedMessages(): Promise<void> {
    const now = Date.now();
    
    // Get delayed messages that are ready
    const ready = await redis.zrangebyscore<string[]>(
      this.queueKey + ":delayed",
      0,
      now
    );
    
    if (ready.length === 0) return;
    
    // Move to main queue
    const pipeline = redis.pipeline();
    for (const msg of ready) {
      pipeline.rpush(this.queueKey, msg);
    }
    pipeline.zremrangebyscore(this.queueKey + ":delayed", 0, now);
    
    await pipeline.exec();
  }
  
  async getStats(): Promise<{
    pending: number;
    processing: number;
    delayed: number;
    dead: number;
  }> {
    const [pending, processing, delayed, dead] = await Promise.all([
      redis.llen(this.queueKey),
      redis.hlen(this.processingKey),
      redis.zcard(this.queueKey + ":delayed"),
      redis.llen(this.deadLetterKey),
    ]);
    
    return { pending, processing, delayed, dead };
  }
  
  async getDeadLetterMessages(limit: number = 100): Promise<QueueMessage<T>[]> {
    const messages = await redis.lrange(this.deadLetterKey, 0, limit - 1);
    return messages.map((msg) => JSON.parse(msg as string));
  }
  
  async retryDeadLetterMessage(messageId: string): Promise<boolean> {
    const messages = await this.getDeadLetterMessages(1000);
    const message = messages.find((m) => m.id === messageId);
    
    if (!message) return false;
    
    await redis.lrem(this.deadLetterKey, 1, JSON.stringify(message));
    
    await this.enqueue(message.payload);
    return true;
  }
}

// Create typed queues
export const emailQueue = new RedisQueue<{
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}>("emails");

export const imageQueue = new RedisQueue<{
  imageId: string;
  operations: string[];
}>("images");

export const webhookQueue = new RedisQueue<{
  url: string;
  payload: unknown;
  headers?: Record<string, string>;
}>("webhooks");
```

### Queue Consumer/Worker

```typescript
// lib/queue/worker.ts
import { RedisQueue, QueueMessage } from "./redis-queue";

interface WorkerOptions<T> {
  concurrency?: number;
  pollInterval?: number;
  maxAttempts?: number;
  onError?: (error: Error, message: QueueMessage<T>) => Promise<void>;
}

export class QueueWorker<T> {
  private queue: RedisQueue<T>;
  private handler: (payload: T) => Promise<void>;
  private options: Required<WorkerOptions<T>>;
  private running: boolean = false;
  private activeJobs: number = 0;
  
  constructor(
    queue: RedisQueue<T>,
    handler: (payload: T) => Promise<void>,
    options: WorkerOptions<T> = {}
  ) {
    this.queue = queue;
    this.handler = handler;
    this.options = {
      concurrency: options.concurrency ?? 5,
      pollInterval: options.pollInterval ?? 1000,
      maxAttempts: options.maxAttempts ?? 3,
      onError: options.onError ?? (async () => {}),
    };
  }
  
  start(): void {
    if (this.running) return;
    this.running = true;
    this.poll();
  }
  
  stop(): void {
    this.running = false;
  }
  
  private async poll(): Promise<void> {
    while (this.running) {
      if (this.activeJobs >= this.options.concurrency) {
        await sleep(100);
        continue;
      }
      
      const message = await this.queue.dequeue(1);
      
      if (message) {
        this.activeJobs++;
        this.processMessage(message).finally(() => {
          this.activeJobs--;
        });
      }
    }
  }
  
  private async processMessage(message: QueueMessage<T>): Promise<void> {
    try {
      await this.handler(message.payload);
      await this.queue.ack(message.id);
    } catch (error) {
      await this.options.onError(error as Error, message);
      
      await this.queue.nack(
        { ...message, attempts: message.attempts + 1 },
        { maxAttempts: this.options.maxAttempts }
      );
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Usage example
// scripts/email-worker.ts
import { emailQueue } from "@/lib/queue/redis-queue";
import { QueueWorker } from "@/lib/queue/worker";
import { sendEmail } from "@/lib/email";

const worker = new QueueWorker(
  emailQueue,
  async (payload) => {
    await sendEmail({
      to: payload.to,
      subject: payload.subject,
      template: payload.template,
      data: payload.data,
    });
  },
  {
    concurrency: 10,
    maxAttempts: 3,
    onError: async (error, message) => {
      console.error(`Failed to send email to ${message.payload.to}:`, error);
    },
  }
);

worker.start();
```

### API-Based Queue Processing

```typescript
// For serverless environments, use API routes as workers
// app/api/queue/process/[queue]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { emailQueue, imageQueue, webhookQueue } from "@/lib/queue/redis-queue";
import { sendEmail } from "@/lib/email";
import { processImage } from "@/lib/images";
import { deliverWebhook } from "@/lib/webhooks";

const BATCH_SIZE = 10;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ queue: string }> }
) {
  // Verify internal request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { queue: queueName } = await params;
  const processed: string[] = [];
  const failed: string[] = [];
  
  for (let i = 0; i < BATCH_SIZE; i++) {
    let message;
    
    switch (queueName) {
      case "emails":
        message = await emailQueue.dequeue(0);
        if (message) {
          try {
            await sendEmail(message.payload);
            await emailQueue.ack(message.id);
            processed.push(message.id);
          } catch (error) {
            await emailQueue.nack({ ...message, attempts: message.attempts + 1 });
            failed.push(message.id);
          }
        }
        break;
      
      case "images":
        message = await imageQueue.dequeue(0);
        if (message) {
          try {
            await processImage(message.payload);
            await imageQueue.ack(message.id);
            processed.push(message.id);
          } catch (error) {
            await imageQueue.nack({ ...message, attempts: message.attempts + 1 });
            failed.push(message.id);
          }
        }
        break;
      
      case "webhooks":
        message = await webhookQueue.dequeue(0);
        if (message) {
          try {
            await deliverWebhook(message.payload);
            await webhookQueue.ack(message.id);
            processed.push(message.id);
          } catch (error) {
            await webhookQueue.nack({ ...message, attempts: message.attempts + 1 });
            failed.push(message.id);
          }
        }
        break;
      
      default:
        return NextResponse.json({ error: "Unknown queue" }, { status: 400 });
    }
    
    if (!message) break; // Queue is empty
  }
  
  return NextResponse.json({ processed, failed });
}

// Trigger via cron or QStash
// vercel.json
{
  "crons": [
    { "path": "/api/queue/process/emails", "schedule": "* * * * *" },
    { "path": "/api/queue/process/images", "schedule": "* * * * *" },
    { "path": "/api/queue/process/webhooks", "schedule": "* * * * *" }
  ]
}
```

### Event-Driven Architecture

```typescript
// lib/events/bus.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export type EventType =
  | "user.created"
  | "user.updated"
  | "order.placed"
  | "order.shipped"
  | "payment.received"
  | "product.inventory.low";

interface Event<T = unknown> {
  id: string;
  type: EventType;
  data: T;
  timestamp: number;
  source: string;
}

export class EventBus {
  async publish<T>(type: EventType, data: T, source: string): Promise<string> {
    const event: Event<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      data,
      timestamp: Date.now(),
      source,
    };
    
    // Store event for replay
    await redis.lpush(`events:${type}`, JSON.stringify(event));
    await redis.ltrim(`events:${type}`, 0, 999); // Keep last 1000
    
    // Publish to subscribers
    await redis.publish(`events:${type}`, JSON.stringify(event));
    
    return event.id;
  }
  
  async subscribe<T>(
    type: EventType,
    handler: (event: Event<T>) => Promise<void>
  ): Promise<() => void> {
    const subscriber = redis.duplicate();
    
    await subscriber.subscribe(
      `events:${type}`,
      async (message) => {
        const event = JSON.parse(message) as Event<T>;
        await handler(event);
      }
    );
    
    return () => {
      subscriber.unsubscribe(`events:${type}`);
    };
  }
  
  async getRecentEvents<T>(
    type: EventType,
    limit: number = 100
  ): Promise<Event<T>[]> {
    const events = await redis.lrange(`events:${type}`, 0, limit - 1);
    return events.map((e) => JSON.parse(e as string));
  }
}

export const eventBus = new EventBus();

// Event handlers
// lib/events/handlers.ts
import { eventBus } from "./bus";
import { emailQueue } from "@/lib/queue/redis-queue";
import { createNotification } from "@/lib/notifications";

// Set up event handlers
export async function setupEventHandlers() {
  // User created -> send welcome email
  await eventBus.subscribe("user.created", async (event) => {
    await emailQueue.enqueue({
      to: event.data.email,
      subject: "Welcome!",
      template: "welcome",
      data: { name: event.data.name },
    });
  });
  
  // Order placed -> multiple handlers
  await eventBus.subscribe("order.placed", async (event) => {
    // Confirmation email
    await emailQueue.enqueue({
      to: event.data.customerEmail,
      subject: "Order Confirmation",
      template: "order-confirmation",
      data: event.data,
    });
    
    // Internal notification
    await createNotification({
      userId: "admin",
      type: "info",
      title: "New Order",
      message: `Order #${event.data.orderId} placed`,
      link: `/admin/orders/${event.data.orderId}`,
    });
  });
  
  // Low inventory alert
  await eventBus.subscribe("product.inventory.low", async (event) => {
    await createNotification({
      userId: "inventory-manager",
      type: "warning",
      title: "Low Inventory",
      message: `${event.data.productName} is running low (${event.data.quantity} left)`,
      link: `/admin/inventory/${event.data.productId}`,
    });
  });
}
```

### Publishing Events from Actions

```typescript
// app/actions/orders.ts
"use server";

import { prisma } from "@/lib/db";
import { eventBus } from "@/lib/events/bus";

export async function createOrder(formData: FormData) {
  const order = await prisma.order.create({
    data: {
      customerId: formData.get("customerId") as string,
      items: JSON.parse(formData.get("items") as string),
      total: parseFloat(formData.get("total") as string),
    },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });
  
  // Publish event
  await eventBus.publish(
    "order.placed",
    {
      orderId: order.id,
      customerId: order.customerId,
      customerEmail: order.customer.email,
      total: order.total,
      items: order.items,
    },
    "orders-service"
  );
  
  // Check inventory
  for (const item of order.items) {
    if (item.product.quantity - item.quantity < 10) {
      await eventBus.publish(
        "product.inventory.low",
        {
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.product.quantity - item.quantity,
        },
        "inventory-service"
      );
    }
  }
  
  return { success: true, orderId: order.id };
}
```

## Variants

### Priority Queue

```typescript
// lib/queue/priority-queue.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export class PriorityQueue<T> {
  private key: string;
  
  constructor(name: string) {
    this.key = `pqueue:${name}`;
  }
  
  async enqueue(payload: T, priority: number): Promise<string> {
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const message = { id, payload };
    
    await redis.zadd(this.key, {
      score: priority,
      member: JSON.stringify(message),
    });
    
    return id;
  }
  
  async dequeue(): Promise<{ id: string; payload: T } | null> {
    // Get highest priority (lowest score)
    const [result] = await redis.zpopmin<string[]>(this.key, 1);
    
    if (!result) return null;
    
    return JSON.parse(result);
  }
}

// Usage
const urgentQueue = new PriorityQueue<EmailPayload>("urgent-emails");

// Higher priority = processed first (lower score)
await urgentQueue.enqueue(email1, 1); // Critical
await urgentQueue.enqueue(email2, 5); // Normal
await urgentQueue.enqueue(email3, 10); // Low priority
```

## Anti-patterns

### No Message Acknowledgment

```typescript
// BAD: Message lost if processing fails
const message = await queue.dequeue();
await processMessage(message); // Throws error - message gone!

// GOOD: Explicit acknowledgment
const message = await queue.dequeue();
try {
  await processMessage(message);
  await queue.ack(message.id);
} catch (error) {
  await queue.nack(message);
}
```

## Related Skills

- `background-jobs` - Background processing
- `cron-jobs` - Scheduled jobs
- `webhooks` - Webhook delivery
- `redis` - Redis patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Redis queues
