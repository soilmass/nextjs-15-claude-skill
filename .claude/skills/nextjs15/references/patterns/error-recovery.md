---
id: pt-error-recovery
name: Error Recovery Pattern
version: 2.0.0
layer: L5
category: errors
description: Graceful degradation and recovery strategies for Next.js 15 applications
tags: [errors, recovery, retry, circuit-breaker, fallback]
composes:
  - ../atoms/input-button.md
  - ../atoms/feedback-alert.md
dependencies: []
formula: Retry + CircuitBreaker + Fallback + UserAction = Resilient Application
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

- Implementing automatic retry with exponential backoff
- Building circuit breaker patterns for external services
- Creating fallback data strategies for critical features
- Providing user-initiated recovery options
- Saving form data locally to prevent data loss

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Error Recovery Flow                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────┐     ┌───────────────┐     ┌──────────────┐  │
│  │ Request   │────▶│ Circuit       │────▶│ Primary      │  │
│  │           │     │ Breaker       │     │ Service      │  │
│  └───────────┘     └───────┬───────┘     └──────┬───────┘  │
│                            │                     │          │
│                    ┌───────▼───────┐     ┌──────▼───────┐  │
│                    │ Open?         │     │ Success?     │  │
│                    └───────┬───────┘     └──────┬───────┘  │
│                            │                     │          │
│            ┌───────────────┴───────────────┐    │          │
│            ▼                               ▼    ▼          │
│  ┌─────────────────┐            ┌─────────────────────┐    │
│  │ Fallback        │            │ Retry with          │    │
│  │ ┌─────────────┐ │            │ Exponential Backoff │    │
│  │ │ Stale Cache │ │            └──────────┬──────────┘    │
│  │ │ Static Data │ │                       │               │
│  │ │ Degraded UI │ │            ┌──────────▼──────────┐    │
│  │ └─────────────┘ │            │ Max Retries?        │    │
│  └─────────────────┘            └──────────┬──────────┘    │
│                                            │               │
│                                 ┌──────────▼──────────┐    │
│                                 │ User Recovery       │    │
│                                 │ - Retry button      │    │
│                                 │ - Form auto-save    │    │
│                                 └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

# Error Recovery Pattern

## Overview

Graceful degradation and recovery strategies for Next.js 15 applications. Implements automatic retries, fallbacks, circuit breakers, and user-initiated recovery for resilient applications.

## Implementation

### Automatic Retry with Exponential Backoff

```typescript
// lib/retry.ts
type RetryOptions = {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryOn?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryOn = () => true,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !retryOn(lastError)) {
        throw lastError;
      }

      onRetry?.(lastError, attempt);

      // Wait before retry
      await sleep(delay);
      
      // Calculate next delay with jitter
      delay = Math.min(
        delay * backoffFactor * (0.5 + Math.random()),
        maxDelay
      );
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Usage
const data = await withRetry(
  () => fetch('/api/data').then((r) => r.json()),
  {
    maxAttempts: 3,
    retryOn: (error) => !error.message.includes('404'),
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    },
  }
);
```

### Circuit Breaker Pattern

```typescript
// lib/circuit-breaker.ts
export enum CircuitState {
  Closed = 'CLOSED',
  Open = 'OPEN',
  HalfOpen = 'HALF_OPEN',
}

type CircuitBreakerOptions = {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests?: number;
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.Closed;
  private failures: number = 0;
  private lastFailure: number = 0;
  private halfOpenSuccesses: number = 0;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      halfOpenRequests: 3,
      ...options,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.Open) {
      if (Date.now() - this.lastFailure > this.options.resetTimeout) {
        this.state = CircuitState.HalfOpen;
        this.halfOpenSuccesses = 0;
      } else {
        throw new CircuitOpenError('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HalfOpen) {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.options.halfOpenRequests) {
        this.state = CircuitState.Closed;
        this.failures = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.state = CircuitState.Open;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.Closed;
    this.failures = 0;
  }
}

class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}
```

### Fallback Data Pattern

```typescript
// lib/data/with-fallback.ts
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/cache';

type FallbackOptions<T> = {
  staleCache?: boolean;
  defaultValue?: T;
  fallbackFn?: () => Promise<T>;
};

export async function withFallback<T>(
  primaryFn: () => Promise<T>,
  options: FallbackOptions<T> = {}
): Promise<T> {
  const { staleCache = true, defaultValue, fallbackFn } = options;

  try {
    return await primaryFn();
  } catch (error) {
    console.error('Primary fetch failed:', error);

    // Try stale cache
    if (staleCache) {
      const cached = await getCachedVersion<T>();
      if (cached) {
        console.log('Serving stale cache');
        return cached;
      }
    }

    // Try fallback function
    if (fallbackFn) {
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    // Return default value
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw error;
  }
}

// Usage
export async function getProducts() {
  return withFallback(
    () => prisma.product.findMany({ where: { published: true } }),
    {
      staleCache: true,
      fallbackFn: async () => {
        // Try backup database or static data
        const response = await fetch('/api/products/backup');
        return response.json();
      },
      defaultValue: [],
    }
  );
}
```

### Graceful Degradation Component

```typescript
// components/graceful-feature.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';

interface GracefulFeatureProps {
  children: ReactNode;
  fallback: ReactNode;
  degradedFallback?: ReactNode;
  onError?: (error: Error) => void;
  retryCount?: number;
}

export function GracefulFeature({
  children,
  fallback,
  degradedFallback,
  onError,
  retryCount = 3,
}: GracefulFeatureProps) {
  const [errorCount, setErrorCount] = useState(0);
  const [isDegraded, setIsDegraded] = useState(false);

  const handleError = (error: Error) => {
    setErrorCount((prev) => prev + 1);
    onError?.(error);

    if (errorCount + 1 >= retryCount) {
      setIsDegraded(true);
    }
  };

  const handleReset = () => {
    if (errorCount < retryCount) {
      setErrorCount((prev) => prev + 1);
    }
  };

  if (isDegraded && degradedFallback) {
    return <>{degradedFallback}</>;
  }

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
}

// Usage
function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <GracefulFeature
        fallback={<WidgetSkeleton />}
        degradedFallback={<StaticWidget />}
        retryCount={2}
      >
        <LiveAnalyticsWidget />
      </GracefulFeature>

      <GracefulFeature
        fallback={<ChartSkeleton />}
        degradedFallback={<StaticChart />}
      >
        <RealTimeChart />
      </GracefulFeature>
    </div>
  );
}
```

### Self-Healing Data Fetcher

```typescript
// hooks/use-resilient-query.ts
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

type ResilientQueryOptions<T> = {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  retryDelay?: number;
  maxRetries?: number;
  fallbackData?: T;
  onRecovery?: () => void;
};

export function useResilientQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000,
  cacheTime = 30 * 60 * 1000,
  retryDelay = 5000,
  maxRetries = 3,
  fallbackData,
  onRecovery,
}: ResilientQueryOptions<T>) {
  const queryClient = useQueryClient();
  const retryCountRef = useRef(0);
  const wasErrorRef = useRef(false);

  const query = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime: cacheTime,
    retry: maxRetries,
    retryDelay: (attemptIndex) => 
      Math.min(retryDelay * Math.pow(2, attemptIndex), 30000),
    placeholderData: fallbackData,
  });

  // Self-healing: retry after errors
  useEffect(() => {
    if (query.isError) {
      wasErrorRef.current = true;
      retryCountRef.current++;

      if (retryCountRef.current <= maxRetries) {
        const timeout = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey });
        }, retryDelay * retryCountRef.current);

        return () => clearTimeout(timeout);
      }
    }

    if (query.isSuccess && wasErrorRef.current) {
      wasErrorRef.current = false;
      retryCountRef.current = 0;
      onRecovery?.();
    }
  }, [query.isError, query.isSuccess, queryKey, queryClient, maxRetries, retryDelay, onRecovery]);

  return {
    ...query,
    isRecovering: query.isError && retryCountRef.current > 0,
    retryCount: retryCountRef.current,
  };
}
```

### Error Recovery with User Action

```typescript
// components/recoverable-action.tsx
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Check } from 'lucide-react';

type RecoverableActionProps = {
  action: () => Promise<void>;
  onSuccess?: () => void;
  children: React.ReactNode;
};

export function RecoverableAction({
  action,
  onSuccess,
  children,
}: RecoverableActionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAction = async () => {
    setError(null);
    
    startTransition(async () => {
      try {
        await action();
        setIsSuccess(true);
        setRetryCount(0);
        onSuccess?.();
        
        // Reset success state after 2 seconds
        setTimeout(() => setIsSuccess(false), 2000);
      } catch (e) {
        setError(e as Error);
        setRetryCount((prev) => prev + 1);
      }
    });
  };

  if (isSuccess) {
    return (
      <Button disabled className="bg-green-600">
        <Check className="mr-2 h-4 w-4" />
        Success!
      </Button>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error.message}</span>
        </div>
        <Button 
          onClick={handleAction} 
          disabled={isPending}
          variant="destructive"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          Retry {retryCount > 1 ? `(${retryCount})` : ''}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleAction} disabled={isPending}>
      {isPending ? (
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {children}
    </Button>
  );
}
```

### Partial Recovery for Forms

```typescript
// hooks/use-recoverable-form.ts
'use client';

import { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

type RecoverableFormOptions<T> = {
  storageKey: string;
  defaultValues: T;
};

export function useRecoverableForm<T extends Record<string, any>>({
  storageKey,
  defaultValues,
}: RecoverableFormOptions<T>): UseFormReturn<T> & {
  clearSaved: () => void;
  hasSavedData: boolean;
} {
  const [hasSavedData, setHasSavedData] = useState(false);

  // Load saved data
  const getSavedData = (): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiry > Date.now()) {
          return parsed.data;
        }
        localStorage.removeItem(storageKey);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    return null;
  };

  const savedData = getSavedData();
  
  const form = useForm<T>({
    defaultValues: savedData ?? defaultValues,
  });

  useEffect(() => {
    setHasSavedData(!!savedData);
  }, [savedData]);

  // Auto-save on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }));
    });
    return () => subscription.unsubscribe();
  }, [form, storageKey]);

  const clearSaved = () => {
    localStorage.removeItem(storageKey);
    setHasSavedData(false);
    form.reset(defaultValues);
  };

  return {
    ...form,
    clearSaved,
    hasSavedData,
  };
}

// Usage
function CheckoutForm() {
  const form = useRecoverableForm({
    storageKey: 'checkout-form',
    defaultValues: {
      email: '',
      address: '',
      city: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {form.hasSavedData && (
        <div className="mb-4 rounded bg-blue-50 p-3">
          <p className="text-sm">We recovered your previous form data.</p>
          <button
            type="button"
            onClick={form.clearSaved}
            className="text-sm text-blue-600 underline"
          >
            Start fresh
          </button>
        </div>
      )}
      {/* Form fields */}
    </form>
  );
}
```

## Variants

### With Health Check Recovery

```typescript
// lib/health-recovery.ts
class ServiceHealthMonitor {
  private services: Map<string, { healthy: boolean; lastCheck: number }> = new Map();
  private checkInterval = 30000;

  async checkHealth(serviceName: string, healthFn: () => Promise<boolean>): Promise<boolean> {
    const cached = this.services.get(serviceName);
    
    if (cached && Date.now() - cached.lastCheck < this.checkInterval) {
      return cached.healthy;
    }

    try {
      const healthy = await healthFn();
      this.services.set(serviceName, { healthy, lastCheck: Date.now() });
      return healthy;
    } catch {
      this.services.set(serviceName, { healthy: false, lastCheck: Date.now() });
      return false;
    }
  }

  async waitForRecovery(
    serviceName: string,
    healthFn: () => Promise<boolean>,
    maxWait = 60000
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      const healthy = await this.checkHealth(serviceName, healthFn);
      if (healthy) return true;
      await sleep(5000);
    }
    
    return false;
  }
}
```

## Anti-patterns

```typescript
// BAD: Infinite retry loop
async function fetchData() {
  while (true) {
    try {
      return await fetch('/api/data');
    } catch {
      await sleep(1000);
    }
  }
}

// GOOD: Limited retries with backoff
async function fetchData() {
  return withRetry(() => fetch('/api/data'), { maxAttempts: 3 });
}

// BAD: Silent failure
try {
  await submitForm(data);
} catch {
  // User has no idea it failed
}

// GOOD: Inform user and offer recovery
try {
  await submitForm(data);
} catch (error) {
  toast.error('Failed to submit. Click to retry.');
  saveFormToLocalStorage(data);
}

// BAD: No fallback for critical data
const products = await fetch('/api/products'); // If this fails, app breaks

// GOOD: Graceful degradation
const products = await withFallback(
  () => fetch('/api/products'),
  { fallbackFn: () => getCachedProducts(), defaultValue: [] }
);
```

## Related Patterns

- `retry-logic.md` - Retry strategies
- `error-boundaries.md` - React error boundaries
- `fallback-ui.md` - Fallback UI components
- `circuit-breaker.md` - Circuit breaker pattern

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial error recovery pattern
