---
id: pt-message-queues
name: Message Queues Advanced
version: 1.0.0
layer: L5
category: infrastructure
description: Enterprise-grade message queue patterns with Redis Streams, SQS, deduplication, ordering guarantees, dead-letter handling, and sophisticated retry strategies
tags: [message-queue, redis-streams, sqs, deduplication, dead-letter, retry, ordering, next15]
composes: []
dependencies:
  "@upstash/redis": "^1.34.0"
  "@aws-sdk/client-sqs": "^3.500.0"
  ioredis: "^5.3.2"
  bullmq: "^5.1.0"
formula: "MessageQueue = Broker(Redis|SQS) + Deduplication + OrderingGuarantees + DLQ + RetryStrategies + Monitoring"
performance:
  impact: high
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Message Queues Advanced

## Overview

Message queues are the backbone of distributed systems, enabling asynchronous processing, service decoupling, and reliable message delivery. This pattern covers enterprise-grade implementations using Redis Streams and AWS SQS, with comprehensive handling for deduplication, message ordering, dead-letter queues, and sophisticated retry strategies.

In Next.js 15 applications, message queues solve critical problems: processing webhooks without blocking HTTP responses, handling file uploads asynchronously, managing email delivery at scale, and coordinating microservices. The choice between Redis Streams and SQS depends on your infrastructure, with Redis offering lower latency for self-managed deployments and SQS providing managed reliability at scale.

This pattern emphasizes exactly-once semantics where possible, graceful degradation under failure, and observability throughout the message lifecycle. We implement idempotency keys, consumer groups, visibility timeouts, and automatic message expiration to build robust, production-ready queue systems.

## When to Use

- Processing webhooks from payment providers, shipping carriers, or third-party APIs
- Email sending pipelines with rate limiting and bounce handling
- Video/image processing workflows requiring job orchestration
- Event-driven architectures with multiple consumers per event type
- Rate-limited external API integrations requiring backpressure
- Order processing workflows with multiple async steps
- Notification fanout to multiple channels (email, SMS, push)
- Data pipeline ingestion with guaranteed delivery

## When NOT to Use

- Simple synchronous request-response patterns
- Real-time user interactions requiring immediate feedback (use SSE/WebSocket instead)
- Small-scale applications with < 100 messages/hour (overkill)
- When strong consistency is required across all operations
- Stateless transformations better suited for serverless functions
- When message ordering is unnecessary and latency is critical (consider simple pub/sub)

## Composition Diagram

```
+============================================================================+
|                    MESSAGE QUEUE ARCHITECTURE                               |
+=============================================================================+
|                                                                             |
|   PRODUCERS                                                                 |
|   +------------------+  +------------------+  +------------------+          |
|   | API Route        |  | Server Action    |  | Cron Job         |          |
|   | (webhook recv)   |  | (user action)    |  | (scheduled)      |          |
|   +--------+---------+  +--------+---------+  +--------+---------+          |
|            |                     |                     |                    |
|            +----------+----------+----------+----------+                    |
|                       |                                                     |
|                       v                                                     |
|   +------------------------------------------------------------------+     |
|   |  DEDUPLICATION LAYER                                              |     |
|   |  +------------------------------------------------------------+  |     |
|   |  | Idempotency Key Check (Redis SET NX)                       |  |     |
|   |  | - Hash: SHA256(event_type + payload_hash + timestamp_bucket)|  |     |
|   |  | - TTL: 24 hours (configurable)                             |  |     |
|   |  +------------------------------------------------------------+  |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|                       v                                                     |
|   +------------------------------------------------------------------+     |
|   |  MESSAGE BROKER (Redis Streams / SQS)                             |     |
|   |  +------------------------------------------------------------+  |     |
|   |  | Stream/Queue: orders                                       |  |     |
|   |  | +--------------------------------------------------------+ |  |     |
|   |  | | msg-1 | msg-2 | msg-3 | msg-4 | msg-5 | msg-6 | ...    | |  |     |
|   |  | +--------------------------------------------------------+ |  |     |
|   |  |                                                            |  |     |
|   |  | Consumer Groups: [order-processor, inventory-updater,     |  |     |
|   |  |                   notification-sender]                     |  |     |
|   |  +------------------------------------------------------------+  |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|        +--------------+--------------+--------------+                       |
|        |              |              |              |                       |
|        v              v              v              v                       |
|   +---------+   +---------+   +---------+   +---------+                    |
|   | Worker 1|   | Worker 2|   | Worker 3|   | Worker N|                    |
|   | (pod-a) |   | (pod-b) |   | (pod-c) |   | (scale) |                    |
|   +----+----+   +----+----+   +----+----+   +----+----+                    |
|        |              |              |              |                       |
|        +-------+------+------+-------+------+------+                       |
|                |             |              |                               |
|                v             v              v                               |
|   +------------------------------------------------------------------+     |
|   |  RETRY STRATEGY                                                   |     |
|   |  +------------------------------------------------------------+  |     |
|   |  | Attempt 1: Immediate                                       |  |     |
|   |  | Attempt 2: 1 second delay                                  |  |     |
|   |  | Attempt 3: 10 second delay                                 |  |     |
|   |  | Attempt 4: 1 minute delay                                  |  |     |
|   |  | Attempt 5: 5 minute delay (final)                          |  |     |
|   |  +------------------------------------------------------------+  |     |
|   +------------------------------------------------------------------+     |
|                |                                                            |
|                v (after max retries)                                        |
|   +------------------------------------------------------------------+     |
|   |  DEAD LETTER QUEUE (DLQ)                                          |     |
|   |  +------------------------------------------------------------+  |     |
|   |  | Failed messages for manual investigation                   |  |     |
|   |  | - Original payload preserved                               |  |     |
|   |  | - Error stack trace attached                               |  |     |
|   |  | - Retry history included                                   |  |     |
|   |  | - Manual replay capability                                 |  |     |
|   |  +------------------------------------------------------------+  |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
|   MONITORING & ALERTING                                                     |
|   +------------------------------------------------------------------+     |
|   | - Queue depth metrics (pending, processing, failed)              |     |
|   | - Processing latency percentiles (p50, p95, p99)                 |     |
|   | - Consumer lag per consumer group                                |     |
|   | - DLQ alerts when threshold exceeded                             |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
+=============================================================================+
```

## Implementation

### Core Message Queue Types and Interfaces

```typescript
// lib/queue/types.ts
export interface QueueMessage<T = unknown> {
  id: string;
  payload: T;
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  idempotencyKey: string;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  processAt?: number;
  lastAttemptAt?: number;
  lastError?: string;
  traceId?: string;
  source: string;
}

export interface QueueConfig {
  name: string;
  maxAttempts?: number;
  retryDelays?: number[];
  visibilityTimeout?: number;
  deduplicationTTL?: number;
  enableOrdering?: boolean;
  orderingKey?: string;
}

export interface DequeueResult<T> {
  message: QueueMessage<T>;
  ack: () => Promise<void>;
  nack: (error?: Error) => Promise<void>;
  extendVisibility: (seconds: number) => Promise<void>;
}

export interface QueueStats {
  pending: number;
  processing: number;
  delayed: number;
  dead: number;
  consumerLag: number;
}

export interface RetryStrategy {
  shouldRetry: (attempts: number, error: Error) => boolean;
  getDelay: (attempts: number) => number;
}

export type MessageHandler<T> = (
  message: QueueMessage<T>,
  context: HandlerContext
) => Promise<void>;

export interface HandlerContext {
  traceId: string;
  attemptNumber: number;
  extendVisibility: (seconds: number) => Promise<void>;
  logger: QueueLogger;
}

export interface QueueLogger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, error: Error, meta?: Record<string, unknown>) => void;
}
```

### Redis Streams Implementation

```typescript
// lib/queue/redis-streams-queue.ts
import { Redis } from "@upstash/redis";
import type {
  QueueMessage,
  QueueConfig,
  DequeueResult,
  QueueStats,
  MessageMetadata,
} from "./types";
import { createHash } from "crypto";

const redis = Redis.fromEnv();

export class RedisStreamsQueue<T = unknown> {
  private streamKey: string;
  private consumerGroup: string;
  private consumerName: string;
  private dlqKey: string;
  private dedupKey: string;
  private processingKey: string;
  private config: Required<QueueConfig>;

  constructor(config: QueueConfig) {
    this.config = {
      maxAttempts: 5,
      retryDelays: [1000, 10000, 60000, 300000, 900000], // 1s, 10s, 1m, 5m, 15m
      visibilityTimeout: 30,
      deduplicationTTL: 86400, // 24 hours
      enableOrdering: false,
      orderingKey: "",
      ...config,
    };

    this.streamKey = `stream:${config.name}`;
    this.consumerGroup = `group:${config.name}`;
    this.consumerName = `consumer:${process.env.HOSTNAME || "default"}-${Date.now()}`;
    this.dlqKey = `dlq:${config.name}`;
    this.dedupKey = `dedup:${config.name}`;
    this.processingKey = `processing:${config.name}`;
  }

  async initialize(): Promise<void> {
    try {
      // Create consumer group if it doesn't exist
      await redis.xgroup(
        "CREATE",
        this.streamKey,
        this.consumerGroup,
        "0",
        "MKSTREAM"
      );
    } catch (error: any) {
      // Group already exists - ignore
      if (!error.message?.includes("BUSYGROUP")) {
        throw error;
      }
    }
  }

  /**
   * Enqueue a message with deduplication
   */
  async enqueue(
    payload: T,
    options: {
      idempotencyKey?: string;
      delay?: number;
      orderingKey?: string;
      traceId?: string;
      source?: string;
    } = {}
  ): Promise<string | null> {
    const idempotencyKey =
      options.idempotencyKey || this.generateIdempotencyKey(payload);

    // Check for duplicate
    const isDuplicate = await redis.set(
      `${this.dedupKey}:${idempotencyKey}`,
      "1",
      {
        nx: true,
        ex: this.config.deduplicationTTL,
      }
    );

    if (!isDuplicate) {
      // Message already processed or in queue
      return null;
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const metadata: MessageMetadata = {
      idempotencyKey,
      attempts: 0,
      maxAttempts: this.config.maxAttempts,
      createdAt: Date.now(),
      processAt: options.delay ? Date.now() + options.delay : undefined,
      traceId: options.traceId || this.generateTraceId(),
      source: options.source || "unknown",
    };

    const message: QueueMessage<T> = {
      id: messageId,
      payload,
      metadata,
    };

    if (options.delay) {
      // Delayed message - use sorted set
      await redis.zadd(`${this.streamKey}:delayed`, {
        score: Date.now() + options.delay,
        member: JSON.stringify(message),
      });
    } else {
      // Immediate message - add to stream
      const fields: Record<string, string> = {
        data: JSON.stringify(message),
      };

      // Add ordering key if specified
      if (this.config.enableOrdering && options.orderingKey) {
        fields.orderingKey = options.orderingKey;
      }

      await redis.xadd(this.streamKey, "*", fields);
    }

    return messageId;
  }

  /**
   * Enqueue multiple messages atomically
   */
  async enqueueBatch(
    messages: Array<{
      payload: T;
      idempotencyKey?: string;
      orderingKey?: string;
    }>
  ): Promise<Array<string | null>> {
    const pipeline = redis.pipeline();
    const results: Array<string | null> = [];

    for (const msg of messages) {
      const idempotencyKey =
        msg.idempotencyKey || this.generateIdempotencyKey(msg.payload);

      // Check deduplication
      pipeline.set(`${this.dedupKey}:${idempotencyKey}`, "1", {
        nx: true,
        ex: this.config.deduplicationTTL,
      });
    }

    const dedupResults = await pipeline.exec();

    // Only enqueue non-duplicates
    const enqueuePipeline = redis.pipeline();
    const messageIds: string[] = [];

    for (let i = 0; i < messages.length; i++) {
      if (dedupResults[i]) {
        const msg = messages[i];
        const messageId = `msg-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
        messageIds.push(messageId);

        const message: QueueMessage<T> = {
          id: messageId,
          payload: msg.payload,
          metadata: {
            idempotencyKey:
              msg.idempotencyKey || this.generateIdempotencyKey(msg.payload),
            attempts: 0,
            maxAttempts: this.config.maxAttempts,
            createdAt: Date.now(),
            traceId: this.generateTraceId(),
            source: "batch",
          },
        };

        const fields: Record<string, string> = {
          data: JSON.stringify(message),
        };

        if (this.config.enableOrdering && msg.orderingKey) {
          fields.orderingKey = msg.orderingKey;
        }

        enqueuePipeline.xadd(this.streamKey, "*", fields);
        results.push(messageId);
      } else {
        results.push(null);
      }
    }

    if (messageIds.length > 0) {
      await enqueuePipeline.exec();
    }

    return results;
  }

  /**
   * Dequeue messages from the stream
   */
  async dequeue(
    count: number = 1,
    blockMs: number = 5000
  ): Promise<DequeueResult<T>[]> {
    // First, move ready delayed messages to the main stream
    await this.processDelayedMessages();

    // Claim any pending messages that have timed out
    await this.claimTimedOutMessages();

    // Read new messages from the stream
    const response = await redis.xreadgroup(
      this.consumerGroup,
      this.consumerName,
      [{ key: this.streamKey, id: ">" }],
      {
        count,
        block: blockMs,
      }
    );

    if (!response || response.length === 0) {
      return [];
    }

    const results: DequeueResult<T>[] = [];

    for (const stream of response) {
      for (const [streamId, fields] of stream.messages) {
        const message = JSON.parse(fields.data as string) as QueueMessage<T>;

        // Track processing
        await redis.hset(this.processingKey, {
          [message.id]: JSON.stringify({
            streamId,
            startedAt: Date.now(),
            consumer: this.consumerName,
          }),
        });

        results.push({
          message,
          ack: async () => {
            await this.acknowledgeMessage(streamId, message.id);
          },
          nack: async (error?: Error) => {
            await this.negativeAcknowledge(streamId, message, error);
          },
          extendVisibility: async (seconds: number) => {
            // Redis Streams doesn't have visibility timeout like SQS,
            // but we can update our processing tracker
            await redis.hset(this.processingKey, {
              [message.id]: JSON.stringify({
                streamId,
                startedAt: Date.now(),
                extendedAt: Date.now(),
                extendedBy: seconds,
                consumer: this.consumerName,
              }),
            });
          },
        });
      }
    }

    return results;
  }

  private async acknowledgeMessage(
    streamId: string,
    messageId: string
  ): Promise<void> {
    await Promise.all([
      redis.xack(this.streamKey, this.consumerGroup, streamId),
      redis.xdel(this.streamKey, streamId),
      redis.hdel(this.processingKey, messageId),
    ]);
  }

  private async negativeAcknowledge(
    streamId: string,
    message: QueueMessage<T>,
    error?: Error
  ): Promise<void> {
    const updatedMessage: QueueMessage<T> = {
      ...message,
      metadata: {
        ...message.metadata,
        attempts: message.metadata.attempts + 1,
        lastAttemptAt: Date.now(),
        lastError: error?.message,
      },
    };

    if (updatedMessage.metadata.attempts >= this.config.maxAttempts) {
      // Move to DLQ
      await this.moveToDLQ(updatedMessage, error);
    } else {
      // Schedule retry with delay
      const delay =
        this.config.retryDelays[
          Math.min(
            updatedMessage.metadata.attempts - 1,
            this.config.retryDelays.length - 1
          )
        ];

      await redis.zadd(`${this.streamKey}:delayed`, {
        score: Date.now() + delay,
        member: JSON.stringify(updatedMessage),
      });
    }

    // Acknowledge and remove from stream
    await Promise.all([
      redis.xack(this.streamKey, this.consumerGroup, streamId),
      redis.xdel(this.streamKey, streamId),
      redis.hdel(this.processingKey, message.id),
    ]);
  }

  private async moveToDLQ(
    message: QueueMessage<T>,
    error?: Error
  ): Promise<void> {
    const dlqEntry = {
      message,
      failedAt: Date.now(),
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : null,
    };

    await redis.rpush(this.dlqKey, JSON.stringify(dlqEntry));
  }

  private async processDelayedMessages(): Promise<void> {
    const now = Date.now();
    const delayedKey = `${this.streamKey}:delayed`;

    // Get messages that are ready
    const ready = await redis.zrangebyscore<string[]>(delayedKey, 0, now);

    if (!ready || ready.length === 0) return;

    const pipeline = redis.pipeline();

    for (const msgStr of ready) {
      const message = JSON.parse(msgStr) as QueueMessage<T>;
      pipeline.xadd(this.streamKey, "*", {
        data: JSON.stringify(message),
      });
    }

    // Remove from delayed set
    pipeline.zremrangebyscore(delayedKey, 0, now);

    await pipeline.exec();
  }

  private async claimTimedOutMessages(): Promise<void> {
    // Claim messages that have been pending longer than visibility timeout
    const minIdleTime = this.config.visibilityTimeout * 1000;

    try {
      const claimed = await redis.xautoclaim(
        this.streamKey,
        this.consumerGroup,
        this.consumerName,
        minIdleTime,
        "0-0",
        { count: 10 }
      );

      if (claimed && claimed.messages && claimed.messages.length > 0) {
        console.log(`Claimed ${claimed.messages.length} timed out messages`);
      }
    } catch (error) {
      // XAUTOCLAIM might not be available in older Redis versions
      console.warn("XAUTOCLAIM not available, skipping claim");
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    const [streamInfo, delayedCount, dlqCount, processingCount] =
      await Promise.all([
        redis.xinfo("STREAM", this.streamKey).catch(() => null),
        redis.zcard(`${this.streamKey}:delayed`),
        redis.llen(this.dlqKey),
        redis.hlen(this.processingKey),
      ]);

    const pending =
      (streamInfo as any)?.length ?? 0 - (processingCount as number);

    // Get consumer lag
    let consumerLag = 0;
    try {
      const groups = await redis.xinfo("GROUPS", this.streamKey);
      if (Array.isArray(groups) && groups.length > 0) {
        consumerLag = (groups[0] as any)?.lag ?? 0;
      }
    } catch {
      // Ignore
    }

    return {
      pending: Math.max(0, pending),
      processing: processingCount as number,
      delayed: delayedCount as number,
      dead: dlqCount as number,
      consumerLag,
    };
  }

  /**
   * Get messages from dead letter queue
   */
  async getDLQMessages(
    limit: number = 100
  ): Promise<
    Array<{ message: QueueMessage<T>; failedAt: number; error: any }>
  > {
    const entries = await redis.lrange(this.dlqKey, 0, limit - 1);
    return entries.map((e) => JSON.parse(e as string));
  }

  /**
   * Retry a message from the dead letter queue
   */
  async retryDLQMessage(messageId: string): Promise<boolean> {
    const entries = await this.getDLQMessages(1000);
    const entry = entries.find((e) => e.message.id === messageId);

    if (!entry) return false;

    // Reset attempts and re-enqueue
    const resetMessage: QueueMessage<T> = {
      ...entry.message,
      metadata: {
        ...entry.message.metadata,
        attempts: 0,
        lastError: undefined,
        lastAttemptAt: undefined,
      },
    };

    await Promise.all([
      redis.xadd(this.streamKey, "*", {
        data: JSON.stringify(resetMessage),
      }),
      redis.lrem(this.dlqKey, 1, JSON.stringify(entry)),
    ]);

    return true;
  }

  /**
   * Retry all messages in the dead letter queue
   */
  async retryAllDLQ(): Promise<number> {
    const entries = await this.getDLQMessages(10000);

    if (entries.length === 0) return 0;

    const pipeline = redis.pipeline();

    for (const entry of entries) {
      const resetMessage: QueueMessage<T> = {
        ...entry.message,
        metadata: {
          ...entry.message.metadata,
          attempts: 0,
          lastError: undefined,
          lastAttemptAt: undefined,
        },
      };

      pipeline.xadd(this.streamKey, "*", {
        data: JSON.stringify(resetMessage),
      });
    }

    // Clear DLQ
    pipeline.del(this.dlqKey);

    await pipeline.exec();

    return entries.length;
  }

  /**
   * Purge all messages from the queue
   */
  async purge(): Promise<void> {
    await Promise.all([
      redis.del(this.streamKey),
      redis.del(`${this.streamKey}:delayed`),
      redis.del(this.processingKey),
    ]);

    // Recreate consumer group
    await this.initialize();
  }

  private generateIdempotencyKey(payload: T): string {
    const hash = createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex")
      .slice(0, 16);

    // Include hour bucket for time-based deduplication window
    const hourBucket = Math.floor(Date.now() / 3600000);

    return `${hash}-${hourBucket}`;
  }

  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}
```

### AWS SQS Implementation

```typescript
// lib/queue/sqs-queue.ts
import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
  GetQueueAttributesCommand,
  PurgeQueueCommand,
} from "@aws-sdk/client-sqs";
import { Redis } from "@upstash/redis";
import type {
  QueueMessage,
  QueueConfig,
  DequeueResult,
  QueueStats,
  MessageMetadata,
} from "./types";
import { createHash } from "crypto";

const sqs = new SQSClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const redis = Redis.fromEnv();

export class SQSQueue<T = unknown> {
  private queueUrl: string;
  private dlqUrl: string;
  private dedupKey: string;
  private config: Required<QueueConfig>;

  constructor(config: QueueConfig & { queueUrl: string; dlqUrl?: string }) {
    this.config = {
      maxAttempts: 5,
      retryDelays: [0, 10, 60, 300, 900], // SQS handles delay differently
      visibilityTimeout: 30,
      deduplicationTTL: 86400,
      enableOrdering: false,
      orderingKey: "",
      ...config,
    };

    this.queueUrl = config.queueUrl;
    this.dlqUrl = config.dlqUrl || `${config.queueUrl}-dlq`;
    this.dedupKey = `sqs:dedup:${config.name}`;
  }

  /**
   * Send a message to SQS with deduplication
   */
  async enqueue(
    payload: T,
    options: {
      idempotencyKey?: string;
      delay?: number;
      messageGroupId?: string;
      traceId?: string;
      source?: string;
    } = {}
  ): Promise<string | null> {
    const idempotencyKey =
      options.idempotencyKey || this.generateIdempotencyKey(payload);

    // Check for duplicate using Redis
    const isDuplicate = await redis.set(
      `${this.dedupKey}:${idempotencyKey}`,
      "1",
      {
        nx: true,
        ex: this.config.deduplicationTTL,
      }
    );

    if (!isDuplicate) {
      return null;
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const metadata: MessageMetadata = {
      idempotencyKey,
      attempts: 0,
      maxAttempts: this.config.maxAttempts,
      createdAt: Date.now(),
      traceId: options.traceId || this.generateTraceId(),
      source: options.source || "unknown",
    };

    const message: QueueMessage<T> = {
      id: messageId,
      payload,
      metadata,
    };

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
      DelaySeconds: options.delay ? Math.min(options.delay, 900) : undefined, // Max 15 minutes
      MessageDeduplicationId: this.isFifoQueue()
        ? idempotencyKey
        : undefined,
      MessageGroupId:
        this.isFifoQueue() && options.messageGroupId
          ? options.messageGroupId
          : this.isFifoQueue()
            ? "default"
            : undefined,
      MessageAttributes: {
        TraceId: {
          DataType: "String",
          StringValue: metadata.traceId,
        },
        Source: {
          DataType: "String",
          StringValue: metadata.source,
        },
      },
    });

    const result = await sqs.send(command);
    return result.MessageId || messageId;
  }

  /**
   * Send messages in batch (up to 10)
   */
  async enqueueBatch(
    messages: Array<{
      payload: T;
      idempotencyKey?: string;
      messageGroupId?: string;
    }>
  ): Promise<Array<string | null>> {
    // Check deduplication
    const pipeline = redis.pipeline();

    for (const msg of messages) {
      const key =
        msg.idempotencyKey || this.generateIdempotencyKey(msg.payload);
      pipeline.set(`${this.dedupKey}:${key}`, "1", {
        nx: true,
        ex: this.config.deduplicationTTL,
      });
    }

    const dedupResults = await pipeline.exec();
    const results: Array<string | null> = [];

    // Build batch entries for non-duplicates
    const entries = [];
    for (let i = 0; i < messages.length; i++) {
      if (dedupResults[i]) {
        const msg = messages[i];
        const idempotencyKey =
          msg.idempotencyKey || this.generateIdempotencyKey(msg.payload);
        const messageId = `msg-${Date.now()}-${i}`;

        const message: QueueMessage<T> = {
          id: messageId,
          payload: msg.payload,
          metadata: {
            idempotencyKey,
            attempts: 0,
            maxAttempts: this.config.maxAttempts,
            createdAt: Date.now(),
            traceId: this.generateTraceId(),
            source: "batch",
          },
        };

        entries.push({
          Id: String(i),
          MessageBody: JSON.stringify(message),
          MessageDeduplicationId: this.isFifoQueue()
            ? idempotencyKey
            : undefined,
          MessageGroupId:
            this.isFifoQueue() && msg.messageGroupId
              ? msg.messageGroupId
              : this.isFifoQueue()
                ? "default"
                : undefined,
        });
      }
    }

    if (entries.length > 0) {
      // SQS batch limit is 10
      for (let i = 0; i < entries.length; i += 10) {
        const batch = entries.slice(i, i + 10);
        const command = new SendMessageBatchCommand({
          QueueUrl: this.queueUrl,
          Entries: batch,
        });

        const response = await sqs.send(command);

        // Map results back
        for (const successful of response.Successful || []) {
          results.push(successful.MessageId || null);
        }

        for (const failed of response.Failed || []) {
          console.error(`Failed to enqueue message ${failed.Id}:`, failed);
          results.push(null);
        }
      }
    }

    return results;
  }

  /**
   * Receive messages from SQS
   */
  async dequeue(
    count: number = 1,
    waitTimeSeconds: number = 20
  ): Promise<DequeueResult<T>[]> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: Math.min(count, 10), // SQS max is 10
      WaitTimeSeconds: waitTimeSeconds,
      VisibilityTimeout: this.config.visibilityTimeout,
      MessageAttributeNames: ["All"],
      AttributeNames: ["ApproximateReceiveCount"],
    });

    const response = await sqs.send(command);

    if (!response.Messages || response.Messages.length === 0) {
      return [];
    }

    return response.Messages.map((sqsMessage) => {
      const message = JSON.parse(sqsMessage.Body!) as QueueMessage<T>;
      const receiveCount = parseInt(
        sqsMessage.Attributes?.ApproximateReceiveCount || "1"
      );

      // Update attempts based on receive count
      message.metadata.attempts = receiveCount;

      return {
        message,
        ack: async () => {
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: sqsMessage.ReceiptHandle!,
            })
          );
        },
        nack: async (error?: Error) => {
          // Update message metadata for tracking
          message.metadata.lastAttemptAt = Date.now();
          message.metadata.lastError = error?.message;

          if (receiveCount >= this.config.maxAttempts) {
            // SQS will automatically move to DLQ based on redrive policy
            // We can also manually handle if needed
            console.log(
              `Message ${message.id} moved to DLQ after ${receiveCount} attempts`
            );
          }

          // Make message visible again immediately for retry
          // Or set a delay based on retry strategy
          const delay = this.config.retryDelays[
            Math.min(receiveCount - 1, this.config.retryDelays.length - 1)
          ];

          await sqs.send(
            new ChangeMessageVisibilityCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: sqsMessage.ReceiptHandle!,
              VisibilityTimeout: Math.ceil(delay / 1000),
            })
          );
        },
        extendVisibility: async (seconds: number) => {
          await sqs.send(
            new ChangeMessageVisibilityCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: sqsMessage.ReceiptHandle!,
              VisibilityTimeout: seconds,
            })
          );
        },
      };
    });
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    const command = new GetQueueAttributesCommand({
      QueueUrl: this.queueUrl,
      AttributeNames: [
        "ApproximateNumberOfMessages",
        "ApproximateNumberOfMessagesNotVisible",
        "ApproximateNumberOfMessagesDelayed",
      ],
    });

    const response = await sqs.send(command);
    const attrs = response.Attributes || {};

    // Get DLQ count
    let deadCount = 0;
    if (this.dlqUrl) {
      const dlqCommand = new GetQueueAttributesCommand({
        QueueUrl: this.dlqUrl,
        AttributeNames: ["ApproximateNumberOfMessages"],
      });

      try {
        const dlqResponse = await sqs.send(dlqCommand);
        deadCount = parseInt(
          dlqResponse.Attributes?.ApproximateNumberOfMessages || "0"
        );
      } catch {
        // DLQ might not exist
      }
    }

    return {
      pending: parseInt(attrs.ApproximateNumberOfMessages || "0"),
      processing: parseInt(attrs.ApproximateNumberOfMessagesNotVisible || "0"),
      delayed: parseInt(attrs.ApproximateNumberOfMessagesDelayed || "0"),
      dead: deadCount,
      consumerLag: 0, // Not directly available in SQS
    };
  }

  /**
   * Purge all messages from the queue
   */
  async purge(): Promise<void> {
    await sqs.send(
      new PurgeQueueCommand({
        QueueUrl: this.queueUrl,
      })
    );
  }

  private isFifoQueue(): boolean {
    return this.queueUrl.endsWith(".fifo");
  }

  private generateIdempotencyKey(payload: T): string {
    return createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex")
      .slice(0, 128); // SQS max deduplication ID length
  }

  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}
```

### Queue Worker Implementation

```typescript
// lib/queue/worker.ts
import type {
  QueueMessage,
  DequeueResult,
  MessageHandler,
  HandlerContext,
  QueueLogger,
} from "./types";
import { RedisStreamsQueue } from "./redis-streams-queue";
import { SQSQueue } from "./sqs-queue";

interface WorkerOptions<T> {
  concurrency?: number;
  pollInterval?: number;
  shutdownGracePeriod?: number;
  onError?: (error: Error, message: QueueMessage<T>) => Promise<void>;
  onProcessed?: (message: QueueMessage<T>, durationMs: number) => Promise<void>;
  logger?: QueueLogger;
}

type QueueType<T> = RedisStreamsQueue<T> | SQSQueue<T>;

export class QueueWorker<T> {
  private queue: QueueType<T>;
  private handler: MessageHandler<T>;
  private options: Required<WorkerOptions<T>>;
  private running: boolean = false;
  private shuttingDown: boolean = false;
  private activeJobs: Map<string, Promise<void>> = new Map();
  private logger: QueueLogger;

  constructor(
    queue: QueueType<T>,
    handler: MessageHandler<T>,
    options: WorkerOptions<T> = {}
  ) {
    this.queue = queue;
    this.handler = handler;
    this.logger = options.logger || this.createDefaultLogger();
    this.options = {
      concurrency: options.concurrency ?? 5,
      pollInterval: options.pollInterval ?? 1000,
      shutdownGracePeriod: options.shutdownGracePeriod ?? 30000,
      onError:
        options.onError ??
        (async () => {
          /* no-op */
        }),
      onProcessed:
        options.onProcessed ??
        (async () => {
          /* no-op */
        }),
      logger: this.logger,
    };
  }

  /**
   * Start processing messages
   */
  start(): void {
    if (this.running) {
      this.logger.warn("Worker already running");
      return;
    }

    this.running = true;
    this.shuttingDown = false;
    this.logger.info("Worker started", { concurrency: this.options.concurrency });

    this.poll();
  }

  /**
   * Gracefully stop processing
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    this.logger.info("Worker stopping...");
    this.shuttingDown = true;
    this.running = false;

    // Wait for active jobs to complete
    const timeout = new Promise<void>((resolve) => {
      setTimeout(() => {
        this.logger.warn("Shutdown grace period exceeded, forcing stop");
        resolve();
      }, this.options.shutdownGracePeriod);
    });

    const activeJobsComplete = Promise.all(this.activeJobs.values()).then(
      () => {}
    );

    await Promise.race([activeJobsComplete, timeout]);

    this.logger.info("Worker stopped");
  }

  /**
   * Check if worker is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get number of active jobs
   */
  getActiveJobCount(): number {
    return this.activeJobs.size;
  }

  private async poll(): Promise<void> {
    while (this.running && !this.shuttingDown) {
      // Check if we have capacity
      if (this.activeJobs.size >= this.options.concurrency) {
        await this.sleep(100);
        continue;
      }

      const batchSize = this.options.concurrency - this.activeJobs.size;

      try {
        const results = await this.queue.dequeue(batchSize, 5000);

        for (const result of results) {
          const jobPromise = this.processMessage(result);
          this.activeJobs.set(result.message.id, jobPromise);

          jobPromise.finally(() => {
            this.activeJobs.delete(result.message.id);
          });
        }

        if (results.length === 0) {
          await this.sleep(this.options.pollInterval);
        }
      } catch (error) {
        this.logger.error("Polling error", error as Error);
        await this.sleep(this.options.pollInterval);
      }
    }
  }

  private async processMessage(result: DequeueResult<T>): Promise<void> {
    const { message, ack, nack, extendVisibility } = result;
    const startTime = Date.now();

    const context: HandlerContext = {
      traceId: message.metadata.traceId || "unknown",
      attemptNumber: message.metadata.attempts + 1,
      extendVisibility,
      logger: this.logger,
    };

    try {
      this.logger.info(`Processing message ${message.id}`, {
        traceId: context.traceId,
        attempt: context.attemptNumber,
      });

      await this.handler(message, context);
      await ack();

      const duration = Date.now() - startTime;
      this.logger.info(`Message ${message.id} processed successfully`, {
        traceId: context.traceId,
        durationMs: duration,
      });

      await this.options.onProcessed(message, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Message ${message.id} processing failed`, error as Error, {
        traceId: context.traceId,
        attempt: context.attemptNumber,
        durationMs: duration,
      });

      await this.options.onError(error as Error, message);
      await nack(error as Error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createDefaultLogger(): QueueLogger {
    return {
      info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ""),
      warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ""),
      error: (msg, err, meta) =>
        console.error(`[ERROR] ${msg}`, err, meta || ""),
    };
  }
}
```

### Queue Factory and Typed Queues

```typescript
// lib/queue/queues.ts
import { RedisStreamsQueue } from "./redis-streams-queue";
import { SQSQueue } from "./sqs-queue";

// Email Queue
export interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType: string;
  }>;
}

export const emailQueue = new RedisStreamsQueue<EmailPayload>({
  name: "emails",
  maxAttempts: 5,
  retryDelays: [1000, 5000, 30000, 120000, 600000], // 1s, 5s, 30s, 2m, 10m
  visibilityTimeout: 60,
});

// Webhook Delivery Queue
export interface WebhookPayload {
  url: string;
  method: "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  body: unknown;
  timeout?: number;
  signatureHeader?: string;
  secret?: string;
}

export const webhookQueue = new RedisStreamsQueue<WebhookPayload>({
  name: "webhooks",
  maxAttempts: 8,
  retryDelays: [1000, 5000, 30000, 120000, 600000, 1800000, 3600000, 7200000],
  visibilityTimeout: 30,
});

// Image Processing Queue
export interface ImageProcessingPayload {
  imageId: string;
  sourceUrl: string;
  operations: Array<{
    type: "resize" | "crop" | "watermark" | "compress" | "convert";
    params: Record<string, unknown>;
  }>;
  outputFormat?: "webp" | "png" | "jpg" | "avif";
  outputPath?: string;
}

export const imageProcessingQueue = new RedisStreamsQueue<ImageProcessingPayload>({
  name: "image-processing",
  maxAttempts: 3,
  retryDelays: [5000, 30000, 120000],
  visibilityTimeout: 300, // 5 minutes for long-running operations
});

// Order Processing Queue (FIFO with SQS)
export interface OrderPayload {
  orderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentIntentId: string;
}

export const orderQueue = process.env.AWS_SQS_ORDER_QUEUE_URL
  ? new SQSQueue<OrderPayload>({
      name: "orders",
      queueUrl: process.env.AWS_SQS_ORDER_QUEUE_URL,
      dlqUrl: process.env.AWS_SQS_ORDER_DLQ_URL,
      maxAttempts: 5,
      visibilityTimeout: 60,
      enableOrdering: true,
    })
  : new RedisStreamsQueue<OrderPayload>({
      name: "orders",
      maxAttempts: 5,
      visibilityTimeout: 60,
      enableOrdering: true,
    });

// Analytics Events Queue (high throughput)
export interface AnalyticsPayload {
  event: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, unknown>;
  timestamp: number;
}

export const analyticsQueue = new RedisStreamsQueue<AnalyticsPayload>({
  name: "analytics",
  maxAttempts: 2, // Analytics can be lossy
  retryDelays: [1000, 5000],
  visibilityTimeout: 10,
  deduplicationTTL: 300, // 5 minute deduplication window
});
```

### API Route for Queue Processing

```typescript
// app/api/queue/[queueName]/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  emailQueue,
  webhookQueue,
  imageProcessingQueue,
  orderQueue,
  analyticsQueue,
} from "@/lib/queue/queues";
import { QueueWorker } from "@/lib/queue/worker";
import { sendEmail } from "@/lib/email";
import { deliverWebhook } from "@/lib/webhooks";
import { processImage } from "@/lib/images";
import { processOrder } from "@/lib/orders";
import { trackAnalytics } from "@/lib/analytics";

// Message handlers
const handlers = {
  emails: async (message: any) => {
    await sendEmail(message.payload);
  },
  webhooks: async (message: any) => {
    await deliverWebhook(message.payload);
  },
  "image-processing": async (message: any, context: any) => {
    // Extend visibility for long-running operations
    const extendInterval = setInterval(() => {
      context.extendVisibility(300);
    }, 60000);

    try {
      await processImage(message.payload);
    } finally {
      clearInterval(extendInterval);
    }
  },
  orders: async (message: any) => {
    await processOrder(message.payload);
  },
  analytics: async (message: any) => {
    await trackAnalytics(message.payload);
  },
};

const queues: Record<string, any> = {
  emails: emailQueue,
  webhooks: webhookQueue,
  "image-processing": imageProcessingQueue,
  orders: orderQueue,
  analytics: analyticsQueue,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ queueName: string }> }
) {
  const { queueName } = await params;

  // Verify internal request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const queue = queues[queueName];
  const handler = handlers[queueName as keyof typeof handlers];

  if (!queue || !handler) {
    return NextResponse.json({ error: "Unknown queue" }, { status: 400 });
  }

  const body = await request.json();
  const batchSize = body.batchSize || 10;
  const processed: string[] = [];
  const failed: string[] = [];

  // Process a batch
  const results = await queue.dequeue(batchSize, 0);

  for (const result of results) {
    try {
      await handler(result.message, {
        traceId: result.message.metadata.traceId,
        attemptNumber: result.message.metadata.attempts + 1,
        extendVisibility: result.extendVisibility,
      });
      await result.ack();
      processed.push(result.message.id);
    } catch (error) {
      await result.nack(error as Error);
      failed.push(result.message.id);
    }
  }

  return NextResponse.json({
    processed: processed.length,
    failed: failed.length,
    processedIds: processed,
    failedIds: failed,
  });
}
```

### Queue Statistics and Admin API

```typescript
// app/api/admin/queues/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  emailQueue,
  webhookQueue,
  imageProcessingQueue,
  orderQueue,
  analyticsQueue,
} from "@/lib/queue/queues";

const queues = {
  emails: emailQueue,
  webhooks: webhookQueue,
  "image-processing": imageProcessingQueue,
  orders: orderQueue,
  analytics: analyticsQueue,
};

export async function GET(request: NextRequest) {
  const stats: Record<string, any> = {};

  for (const [name, queue] of Object.entries(queues)) {
    try {
      stats[name] = await queue.getStats();
    } catch (error) {
      stats[name] = { error: (error as Error).message };
    }
  }

  return NextResponse.json({ queues: stats });
}

// app/api/admin/queues/[queueName]/dlq/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueName: string }> }
) {
  const { queueName } = await params;
  const queue = queues[queueName as keyof typeof queues];

  if (!queue) {
    return NextResponse.json({ error: "Unknown queue" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "100");

  const messages = await queue.getDLQMessages(limit);

  return NextResponse.json({ messages, count: messages.length });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ queueName: string }> }
) {
  const { queueName } = await params;
  const queue = queues[queueName as keyof typeof queues];

  if (!queue) {
    return NextResponse.json({ error: "Unknown queue" }, { status: 404 });
  }

  const body = await request.json();

  if (body.action === "retry") {
    if (body.messageId) {
      const success = await queue.retryDLQMessage(body.messageId);
      return NextResponse.json({ success });
    } else if (body.retryAll) {
      const count = await queue.retryAllDLQ();
      return NextResponse.json({ retriedCount: count });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
```

### Cron Job Configuration for Queue Processing

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/queue/emails/process",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/queue/webhooks/process",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/queue/image-processing/process",
      "schedule": "*/2 * * * *"
    },
    {
      "path": "/api/queue/orders/process",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/queue/analytics/process",
      "schedule": "* * * * *"
    }
  ]
}
```

## Examples

### Example 1: E-commerce Order Processing Pipeline

```typescript
// app/actions/checkout.ts
"use server";

import { orderQueue, emailQueue, analyticsQueue } from "@/lib/queue/queues";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function processCheckout(formData: FormData) {
  const cartId = formData.get("cartId") as string;
  const paymentIntentId = formData.get("paymentIntentId") as string;

  // Create order in database
  const order = await prisma.order.create({
    data: {
      cartId,
      paymentIntentId,
      status: "pending",
    },
    include: {
      items: true,
      customer: true,
    },
  });

  // Queue order processing (inventory, fulfillment)
  await orderQueue.enqueue(
    {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      paymentIntentId,
    },
    {
      idempotencyKey: `order-${order.id}`,
      orderingKey: order.customerId, // Process customer orders in order
      source: "checkout",
    }
  );

  // Queue confirmation email
  await emailQueue.enqueue(
    {
      to: order.customer.email,
      subject: `Order Confirmation #${order.id}`,
      template: "order-confirmation",
      data: {
        orderNumber: order.id,
        items: order.items,
        total: order.total,
        estimatedDelivery: "3-5 business days",
      },
    },
    {
      idempotencyKey: `order-email-${order.id}`,
      source: "checkout",
    }
  );

  // Queue analytics event
  await analyticsQueue.enqueue(
    {
      event: "purchase",
      userId: order.customerId,
      sessionId: formData.get("sessionId") as string,
      properties: {
        orderId: order.id,
        revenue: order.total,
        items: order.items.length,
      },
      timestamp: Date.now(),
    },
    {
      idempotencyKey: `purchase-analytics-${order.id}`,
    }
  );

  revalidatePath("/orders");

  return { orderId: order.id };
}
```

### Example 2: Webhook Processing with Signature Verification

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { webhookQueue } from "@/lib/queue/queues";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Queue the webhook for processing
  const messageId = await webhookQueue.enqueue(
    {
      url: `${process.env.INTERNAL_WEBHOOK_HANDLER_URL}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Source": "stripe",
      },
      body: {
        eventId: event.id,
        type: event.type,
        data: event.data,
        created: event.created,
      },
      timeout: 30000,
    },
    {
      idempotencyKey: `stripe-${event.id}`, // Stripe event IDs are unique
      source: "stripe-webhook",
    }
  );

  if (!messageId) {
    // Duplicate event, already processed or in queue
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Return 200 quickly to acknowledge receipt
  return NextResponse.json({ received: true, messageId });
}
```

### Example 3: Fan-out Notification System

```typescript
// lib/notifications/fanout.ts
import { emailQueue, webhookQueue } from "@/lib/queue/queues";
import { prisma } from "@/lib/db";

export interface NotificationPayload {
  type: string;
  userId: string;
  data: Record<string, unknown>;
}

export async function fanoutNotification(notification: NotificationPayload) {
  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: notification.userId },
    include: {
      notificationPreferences: true,
      webhookSubscriptions: true,
    },
  });

  if (!user) return;

  const queuedChannels: string[] = [];
  const baseIdempotencyKey = `notify-${notification.type}-${notification.userId}-${Date.now()}`;

  // Email notification
  if (user.notificationPreferences?.email) {
    await emailQueue.enqueue(
      {
        to: user.email,
        subject: getNotificationSubject(notification.type),
        template: `notification-${notification.type}`,
        data: notification.data,
      },
      {
        idempotencyKey: `${baseIdempotencyKey}-email`,
        source: "notification-fanout",
      }
    );
    queuedChannels.push("email");
  }

  // Webhook notifications (for integrations)
  for (const subscription of user.webhookSubscriptions || []) {
    if (subscription.events.includes(notification.type)) {
      await webhookQueue.enqueue(
        {
          url: subscription.url,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Event": notification.type,
          },
          body: {
            event: notification.type,
            userId: notification.userId,
            data: notification.data,
            timestamp: new Date().toISOString(),
          },
          secret: subscription.secret,
          signatureHeader: "X-Webhook-Signature",
        },
        {
          idempotencyKey: `${baseIdempotencyKey}-webhook-${subscription.id}`,
          source: "notification-fanout",
        }
      );
      queuedChannels.push(`webhook:${subscription.id}`);
    }
  }

  return { channels: queuedChannels };
}

function getNotificationSubject(type: string): string {
  const subjects: Record<string, string> = {
    "order.shipped": "Your order has shipped!",
    "payment.received": "Payment received",
    "comment.reply": "New reply to your comment",
    default: "New notification",
  };
  return subjects[type] || subjects.default;
}
```

## Anti-patterns

### Anti-pattern 1: No Deduplication

```typescript
// BAD: No deduplication - same message processed multiple times
async function handleWebhook(event: any) {
  await queue.enqueue({ eventId: event.id, data: event });
  // If webhook is retried, we process the same event twice!
}

// GOOD: Use idempotency keys
async function handleWebhook(event: any) {
  const messageId = await queue.enqueue(
    { eventId: event.id, data: event },
    {
      idempotencyKey: event.id, // Use event's unique ID
    }
  );

  if (!messageId) {
    console.log("Duplicate event, skipping");
    return;
  }
}
```

### Anti-pattern 2: No Error Handling in Handlers

```typescript
// BAD: Unhandled errors leave message in limbo
const worker = new QueueWorker(queue, async (message) => {
  const result = await externalApi.call(message.payload);
  // What if externalApi.call() throws? Message never ack'd or nack'd
});

// GOOD: Proper error handling with explicit ack/nack
const worker = new QueueWorker(
  queue,
  async (message, context) => {
    try {
      const result = await externalApi.call(message.payload);
      context.logger.info("Processed successfully", { result });
    } catch (error) {
      context.logger.error("Processing failed", error);
      // Error will be caught by worker and message nack'd
      throw error;
    }
  },
  {
    onError: async (error, message) => {
      // Log to error tracking service
      await captureException(error, {
        extra: { messageId: message.id, payload: message.payload },
      });
    },
  }
);
```

### Anti-pattern 3: Ignoring Visibility Timeout

```typescript
// BAD: Long-running job exceeds visibility timeout
const worker = new QueueWorker(queue, async (message) => {
  await processLargeVideo(message.payload); // Takes 10 minutes
  // By now, visibility timeout expired and another worker picked up the message!
});

// GOOD: Extend visibility for long-running operations
const worker = new QueueWorker(queue, async (message, context) => {
  // Set up periodic visibility extension
  const extendInterval = setInterval(() => {
    context.extendVisibility(300); // Extend by 5 minutes
    context.logger.info("Extended visibility timeout");
  }, 60000); // Every minute

  try {
    await processLargeVideo(message.payload);
  } finally {
    clearInterval(extendInterval);
  }
});
```

### Anti-pattern 4: No Dead Letter Queue Monitoring

```typescript
// BAD: DLQ fills up silently
const queue = new RedisStreamsQueue({
  name: "important-events",
  maxAttempts: 3,
});
// No one monitors the DLQ, messages are lost!

// GOOD: Monitor DLQ and alert
async function monitorDLQ() {
  const stats = await queue.getStats();

  if (stats.dead > 0) {
    await alerting.send({
      severity: stats.dead > 100 ? "critical" : "warning",
      message: `${stats.dead} messages in DLQ for important-events queue`,
      metadata: {
        queueName: "important-events",
        deadCount: stats.dead,
        pendingCount: stats.pending,
      },
    });
  }
}

// Run periodically
setInterval(monitorDLQ, 60000);
```

## Testing

### Unit Tests for Queue Operations

```typescript
// __tests__/queue/redis-streams-queue.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RedisStreamsQueue } from "@/lib/queue/redis-streams-queue";

// Mock Redis
vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      set: vi.fn(),
      get: vi.fn(),
      xadd: vi.fn(),
      xreadgroup: vi.fn(),
      xack: vi.fn(),
      xdel: vi.fn(),
      xgroup: vi.fn(),
      zadd: vi.fn(),
      zrangebyscore: vi.fn(),
      zremrangebyscore: vi.fn(),
      rpush: vi.fn(),
      lrange: vi.fn(),
      llen: vi.fn(),
      lrem: vi.fn(),
      del: vi.fn(),
      hset: vi.fn(),
      hdel: vi.fn(),
      hlen: vi.fn(),
      pipeline: vi.fn(() => ({
        exec: vi.fn(),
      })),
    }),
  },
}));

describe("RedisStreamsQueue", () => {
  let queue: RedisStreamsQueue<{ data: string }>;

  beforeEach(async () => {
    queue = new RedisStreamsQueue({ name: "test-queue" });
    await queue.initialize();
  });

  describe("enqueue", () => {
    it("should enqueue a message with generated idempotency key", async () => {
      const messageId = await queue.enqueue({ data: "test" });
      expect(messageId).toMatch(/^msg-/);
    });

    it("should reject duplicate messages", async () => {
      const first = await queue.enqueue(
        { data: "test" },
        { idempotencyKey: "unique-key" }
      );

      const second = await queue.enqueue(
        { data: "test" },
        { idempotencyKey: "unique-key" }
      );

      expect(first).toBeTruthy();
      expect(second).toBeNull();
    });

    it("should handle delayed messages", async () => {
      const messageId = await queue.enqueue(
        { data: "delayed" },
        { delay: 5000 }
      );

      expect(messageId).toBeTruthy();
      // Message should be in delayed set, not main stream
    });
  });

  describe("dequeue", () => {
    it("should return empty array when queue is empty", async () => {
      const results = await queue.dequeue(1, 0);
      expect(results).toEqual([]);
    });
  });

  describe("stats", () => {
    it("should return queue statistics", async () => {
      const stats = await queue.getStats();

      expect(stats).toHaveProperty("pending");
      expect(stats).toHaveProperty("processing");
      expect(stats).toHaveProperty("delayed");
      expect(stats).toHaveProperty("dead");
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/queue/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { RedisStreamsQueue } from "@/lib/queue/redis-streams-queue";
import { QueueWorker } from "@/lib/queue/worker";

describe("Queue Integration", () => {
  let queue: RedisStreamsQueue<{ value: number }>;
  let processedMessages: number[] = [];

  beforeAll(async () => {
    queue = new RedisStreamsQueue({
      name: "integration-test",
      maxAttempts: 3,
      retryDelays: [100, 200, 300],
    });
    await queue.initialize();
  });

  afterAll(async () => {
    await queue.purge();
  });

  it("should process messages end-to-end", async () => {
    // Enqueue messages
    for (let i = 0; i < 5; i++) {
      await queue.enqueue({ value: i });
    }

    // Create worker
    const worker = new QueueWorker(
      queue,
      async (message) => {
        processedMessages.push(message.payload.value);
      },
      { concurrency: 2 }
    );

    // Process messages
    worker.start();

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    worker.stop();

    // Verify all messages processed
    expect(processedMessages.sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it("should move failed messages to DLQ after max retries", async () => {
    let attempts = 0;

    await queue.enqueue(
      { value: 999 },
      { idempotencyKey: "fail-test" }
    );

    const worker = new QueueWorker(
      queue,
      async () => {
        attempts++;
        throw new Error("Always fails");
      },
      { concurrency: 1 }
    );

    worker.start();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    worker.stop();

    const stats = await queue.getStats();
    expect(stats.dead).toBeGreaterThan(0);

    const dlqMessages = await queue.getDLQMessages();
    expect(dlqMessages.some((m) => m.message.payload.value === 999)).toBe(true);
  });
});
```

### Load Testing

```typescript
// __tests__/queue/load.test.ts
import { describe, it, expect } from "vitest";
import { RedisStreamsQueue } from "@/lib/queue/redis-streams-queue";
import { QueueWorker } from "@/lib/queue/worker";

describe("Queue Load Test", () => {
  it("should handle high throughput", async () => {
    const queue = new RedisStreamsQueue<{ index: number }>({
      name: "load-test",
    });
    await queue.initialize();

    const messageCount = 1000;
    const processed = new Set<number>();

    // Enqueue messages in batches
    const batchSize = 100;
    for (let i = 0; i < messageCount; i += batchSize) {
      const batch = Array.from({ length: batchSize }, (_, j) => ({
        payload: { index: i + j },
      }));
      await queue.enqueueBatch(batch);
    }

    // Process with multiple workers
    const workers = Array.from({ length: 5 }, () =>
      new QueueWorker(
        queue,
        async (message) => {
          processed.add(message.payload.index);
        },
        { concurrency: 10 }
      )
    );

    workers.forEach((w) => w.start());

    // Wait for processing
    const startTime = Date.now();
    while (processed.size < messageCount && Date.now() - startTime < 30000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    workers.forEach((w) => w.stop());

    expect(processed.size).toBe(messageCount);

    // Clean up
    await queue.purge();
  }, 60000);
});
```

## Related Skills

- [background-jobs.md](./background-jobs.md) - General background job patterns
- [retry-logic.md](./retry-logic.md) - Retry strategies and exponential backoff
- [error-handling.md](./error-handling.md) - Error handling patterns
- [cron-jobs.md](./cron-jobs.md) - Scheduled job execution
- [webhooks.md](./webhooks.md) - Webhook delivery patterns
- [redis-cache.md](./redis-cache.md) - Redis caching patterns

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial comprehensive implementation
- Redis Streams queue implementation
- AWS SQS queue implementation
- Deduplication with idempotency keys
- Dead letter queue handling
- Exponential backoff retry strategies
- Queue worker with graceful shutdown
- Batch operations support
- Queue statistics and monitoring
- Admin API for queue management
- Comprehensive testing patterns
