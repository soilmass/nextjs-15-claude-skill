---
id: pt-retry-logic
name: Retry Logic
version: 2.0.0
layer: L5
category: errors
description: Exponential backoff and retry patterns for Next.js 15
tags: [errors, retry, logic]
composes: []
dependencies: []
formula: ExponentialBackoff + Jitter + StatusCodeHandling = Robust Retry Strategy
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

- Implementing network request retries with backoff
- Handling transient database connection errors
- Retrying external API calls with rate limit awareness
- Building idempotent operation retries
- Creating bulk operation retry queues

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Retry Logic with Exponential Backoff                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Attempt 1  ────▶ [Request] ────▶ ❌ Error                 │
│                                      │                      │
│                                      ▼                      │
│                              Wait: 1s + jitter              │
│                                      │                      │
│  Attempt 2  ────▶ [Request] ────▶ ❌ Error                 │
│                                      │                      │
│                                      ▼                      │
│                              Wait: 2s + jitter              │
│                                      │                      │
│  Attempt 3  ────▶ [Request] ────▶ ❌ Error                 │
│                                      │                      │
│                                      ▼                      │
│                              Wait: 4s + jitter              │
│                                      │                      │
│  Attempt 4  ────▶ [Request] ────▶ ✅ Success               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Retry Decision Matrix                               │   │
│  │                                                     │   │
│  │ Status 4xx → Don't retry (client error)            │   │
│  │ Status 429 → Retry with rate limit delay           │   │
│  │ Status 5xx → Retry with backoff                    │   │
│  │ Network    → Retry with backoff                    │   │
│  │ Timeout    → Retry with backoff                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

# Retry Logic Pattern

## Overview

Exponential backoff and retry patterns for Next.js 15 applications. Implements intelligent retry strategies for network requests, database operations, and external API calls.

## Implementation

### Core Retry Utility

```typescript
// lib/retry.ts
export type RetryOptions = {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitter?: boolean;
  timeout?: number;
  retryOn?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
};

const defaultOptions: Required<Omit<RetryOptions, 'onRetry' | 'retryOn'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true,
  timeout: 30000,
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      // Wrap with timeout
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), opts.timeout)
        ),
      ]);
      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      const shouldRetry = options.retryOn?.(lastError, attempt) ?? true;
      
      if (attempt === opts.maxAttempts || !shouldRetry) {
        throw lastError;
      }

      // Calculate delay with optional jitter
      let nextDelay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
      if (opts.jitter) {
        nextDelay = nextDelay * (0.5 + Math.random());
      }

      options.onRetry?.(lastError, attempt, nextDelay);

      await sleep(nextDelay);
      delay = nextDelay;
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### HTTP Retry with Status Code Handling

```typescript
// lib/http-retry.ts
import { retry, RetryOptions } from './retry';

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
const NON_RETRYABLE_STATUS_CODES = [400, 401, 403, 404, 422];

type FetchRetryOptions = RetryOptions & {
  retryableStatuses?: number[];
};

export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options: FetchRetryOptions = {}
): Promise<Response> {
  const retryableStatuses = options.retryableStatuses ?? RETRYABLE_STATUS_CODES;

  return retry(
    async () => {
      const response = await fetch(url, init);

      if (!response.ok) {
        const error = new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );

        // Don't retry non-retryable status codes
        if (NON_RETRYABLE_STATUS_CODES.includes(response.status)) {
          error.retryable = false;
        }

        throw error;
      }

      return response;
    },
    {
      ...options,
      retryOn: (error) => {
        if (error instanceof FetchError) {
          return error.retryable && retryableStatuses.includes(error.status);
        }
        // Retry network errors
        return error.message.includes('network') || 
               error.message.includes('fetch');
      },
    }
  );
}

class FetchError extends Error {
  retryable = true;
  
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'FetchError';
  }
}

// Usage
const response = await fetchWithRetry('/api/data', {
  method: 'POST',
  body: JSON.stringify(data),
}, {
  maxAttempts: 3,
  onRetry: (error, attempt) => {
    console.log(`Retry ${attempt}: ${error.message}`);
  },
});
```

### Database Retry for Transient Errors

```typescript
// lib/db-retry.ts
import { Prisma } from '@prisma/client';
import { retry } from './retry';

const RETRYABLE_PRISMA_CODES = [
  'P1001', // Can't reach database server
  'P1002', // Database server timed out
  'P1008', // Operations timed out
  'P1017', // Server has closed the connection
  'P2024', // Connection pool timeout
];

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  return retry(operation, {
    maxAttempts,
    initialDelay: 100,
    maxDelay: 5000,
    retryOn: (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return RETRYABLE_PRISMA_CODES.includes(error.code);
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        return true; // Retry connection errors
      }
      return false;
    },
    onRetry: (error, attempt, delay) => {
      console.warn(`DB retry ${attempt}, waiting ${delay}ms:`, error.message);
    },
  });
}

// Usage
const user = await withDbRetry(() =>
  prisma.user.findUnique({ where: { id } })
);

// With transaction
const result = await withDbRetry(() =>
  prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data: orderData });
    await tx.inventory.update({ where: { id: productId }, data: { stock: { decrement: 1 } } });
    return order;
  })
);
```

### React Query Retry Configuration

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => 
        Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry network errors for mutations
        if (error instanceof TypeError && error.message.includes('network')) {
          return failureCount < 2;
        }
        return false;
      },
    },
  },
});
```

### Hook for Retry State

```typescript
// hooks/use-retry.ts
'use client';

import { useState, useCallback } from 'react';

type UseRetryOptions = {
  maxAttempts?: number;
  initialDelay?: number;
  backoffFactor?: number;
};

type UseRetryReturn<T> = {
  execute: () => Promise<T | null>;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  attempt: number;
  reset: () => void;
};

export function useRetry<T>(
  fn: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const { maxAttempts = 3, initialDelay = 1000, backoffFactor = 2 } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let currentAttempt = 0;
    let delay = initialDelay;

    while (currentAttempt < maxAttempts) {
      currentAttempt++;
      setAttempt(currentAttempt);

      try {
        const result = await fn();
        setData(result);
        setIsLoading(false);
        return result;
      } catch (err) {
        const error = err as Error;

        if (currentAttempt === maxAttempts) {
          setError(error);
          setIsLoading(false);
          return null;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffFactor;
      }
    }

    setIsLoading(false);
    return null;
  }, [fn, maxAttempts, initialDelay, backoffFactor]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setAttempt(0);
    setIsLoading(false);
  }, []);

  return { execute, data, error, isLoading, attempt, reset };
}

// Usage
function DataFetcher() {
  const { execute, data, error, isLoading, attempt } = useRetry(
    () => fetch('/api/data').then((r) => r.json()),
    { maxAttempts: 3 }
  );

  return (
    <div>
      {isLoading && <p>Loading... (Attempt {attempt})</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <pre>{JSON.stringify(data)}</pre>}
      <button onClick={execute}>Fetch</button>
    </div>
  );
}
```

### Server Action with Retry

```typescript
// app/actions/with-retry.ts
'use server';

import { retry } from '@/lib/retry';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; retryable: boolean };

export async function retryableAction<T>(
  action: () => Promise<T>,
  maxAttempts = 3
): Promise<ActionResult<T>> {
  try {
    const data = await retry(action, {
      maxAttempts,
      initialDelay: 500,
      retryOn: (error) => {
        // Don't retry validation errors
        if (error.message.includes('validation')) return false;
        return true;
      },
    });
    
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const retryable = !message.includes('validation');
    
    return { success: false, error: message, retryable };
  }
}

// Specific action
export async function submitOrder(formData: FormData) {
  return retryableAction(async () => {
    const data = Object.fromEntries(formData);
    
    // Process order
    const order = await prisma.order.create({
      data: {
        items: JSON.parse(data.items as string),
        total: parseFloat(data.total as string),
      },
    });

    // Charge payment (external API)
    await chargePayment(order.id, order.total);

    return order;
  });
}
```

### Conditional Retry Strategies

```typescript
// lib/conditional-retry.ts
import { retry, RetryOptions } from './retry';

// Retry only idempotent operations
export async function retryIdempotent<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return retry(fn, {
    ...options,
    retryOn: (error) => {
      // Safe to retry - operation is idempotent
      return true;
    },
  });
}

// Retry with idempotency key
export async function retryWithIdempotencyKey<T>(
  key: string,
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const cache = new Map<string, T>();

  return retry(
    async () => {
      // Check if already completed
      const cached = cache.get(key);
      if (cached) return cached;

      const result = await fn();
      cache.set(key, result);
      return result;
    },
    options
  );
}

// Retry with rate limit awareness
export async function retryWithRateLimit<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return retry(fn, {
    ...options,
    retryOn: (error) => {
      if (error.message.includes('rate limit') || 
          error.message.includes('429')) {
        return true;
      }
      return false;
    },
    onRetry: async (error, attempt, delay) => {
      // Parse rate limit headers if available
      const retryAfter = parseRetryAfter(error);
      if (retryAfter) {
        await sleep(retryAfter * 1000);
      }
    },
  });
}

function parseRetryAfter(error: Error): number | null {
  // Extract retry-after from error if available
  const match = error.message.match(/retry after (\d+)/i);
  return match ? parseInt(match[1]) : null;
}
```

### Retry Queue for Bulk Operations

```typescript
// lib/retry-queue.ts
type QueueItem<T> = {
  id: string;
  fn: () => Promise<T>;
  attempts: number;
  lastError?: Error;
};

export class RetryQueue<T> {
  private queue: QueueItem<T>[] = [];
  private processing = false;
  private maxAttempts: number;
  private concurrency: number;
  private results: Map<string, { success: boolean; data?: T; error?: Error }> = new Map();

  constructor(maxAttempts = 3, concurrency = 5) {
    this.maxAttempts = maxAttempts;
    this.concurrency = concurrency;
  }

  add(id: string, fn: () => Promise<T>): void {
    this.queue.push({ id, fn, attempts: 0 });
  }

  async process(): Promise<Map<string, { success: boolean; data?: T; error?: Error }>> {
    this.processing = true;

    while (this.queue.length > 0) {
      // Process batch
      const batch = this.queue.splice(0, this.concurrency);
      
      await Promise.all(
        batch.map(async (item) => {
          try {
            const data = await item.fn();
            this.results.set(item.id, { success: true, data });
          } catch (error) {
            item.attempts++;
            item.lastError = error as Error;

            if (item.attempts < this.maxAttempts) {
              // Re-queue with backoff
              await sleep(1000 * Math.pow(2, item.attempts));
              this.queue.push(item);
            } else {
              this.results.set(item.id, { 
                success: false, 
                error: item.lastError 
              });
            }
          }
        })
      );
    }

    this.processing = false;
    return this.results;
  }
}

// Usage
const queue = new RetryQueue<Response>();

for (const item of items) {
  queue.add(item.id, () => 
    fetch(`/api/process/${item.id}`, { method: 'POST' })
  );
}

const results = await queue.process();
const failed = [...results.entries()].filter(([, r]) => !r.success);
console.log(`Failed: ${failed.length}/${results.size}`);
```

## Variants

### With Circuit Breaker Integration

```typescript
// lib/retry-with-circuit.ts
import { retry, RetryOptions } from './retry';
import { CircuitBreaker, CircuitState } from './circuit-breaker';

const circuitBreakers = new Map<string, CircuitBreaker>();

export async function retryWithCircuit<T>(
  key: string,
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  let breaker = circuitBreakers.get(key);
  if (!breaker) {
    breaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000,
    });
    circuitBreakers.set(key, breaker);
  }

  if (breaker.getState() === CircuitState.Open) {
    throw new Error('Circuit breaker is open');
  }

  return retry(
    () => breaker!.execute(fn),
    options
  );
}
```

## Anti-patterns

```typescript
// BAD: Retrying non-idempotent operations blindly
await retry(() => createOrder(data)); // May create duplicate orders!

// GOOD: Use idempotency keys
await retryWithIdempotencyKey(orderId, () => createOrder(data));

// BAD: No maximum attempts
while (true) {
  try {
    return await fetchData();
  } catch {
    await sleep(1000);
  }
}

// GOOD: Limited attempts
await retry(fetchData, { maxAttempts: 3 });

// BAD: Fixed delay
await sleep(5000); // Always 5 seconds

// GOOD: Exponential backoff with jitter
const delay = Math.min(1000 * 2 ** attempt * (0.5 + Math.random()), 30000);
```

## Related Patterns

- `error-recovery.md` - Recovery strategies
- `circuit-breaker.md` - Circuit breaker pattern
- `cache-stampede.md` - Stampede prevention
- `rate-limiting.md` - Rate limiting

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial retry logic pattern
