---
id: pt-rum
name: Real User Monitoring
version: 2.0.0
layer: L5
category: observability
description: Implement Real User Monitoring to track frontend performance
tags: [observability, rum, performance, user-experience]
composes: []
dependencies:
  @vercel/analytics: "^1.4.0"
formula: performance APIs + error capture + session context + sampling = real user experience data
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Real User Monitoring (RUM) Pattern

## When to Use

- Production applications needing real-world performance data
- Understanding actual user experience vs synthetic tests
- Capturing errors and issues from real user sessions
- Segmenting performance by device, connection, or geography
- Validating performance improvements with real traffic

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|   Browser Events  |---->|      pt-rum       |---->|  RUM Collection   |
| (Performance API) |     |   (RUM Client)    |     |  (/api/rum)       |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
| pt-web-vitals     |     |  Navigation       |     |  Backend Storage  |
| (Core Vitals)     |     |  Resource Timing  |     |   & Processing    |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
| pt-error-tracking |     |   Long Tasks      |     |   pt-alerting     |
| (JS Errors)       |     |   Observer        |     | (Budget Alerts)   |
+-------------------+     +-------------------+     +-------------------+
        |
        v
+-------------------+
| pt-user-analytics |
| (Session Context) |
+-------------------+
```

## Overview

Real User Monitoring (RUM) captures actual user experience data including page load times, interactions, and errors. This pattern covers implementing comprehensive RUM in Next.js 15 with Web Vitals and custom metrics.

## Implementation

### RUM Client Setup

```typescript
// lib/monitoring/rum.ts
'use client';

import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, Metric } from 'web-vitals';

interface RUMConfig {
  endpoint: string;
  sampleRate?: number; // 0-1
  debug?: boolean;
  tags?: Record<string, string>;
}

interface RUMEvent {
  type: 'metric' | 'error' | 'navigation' | 'interaction' | 'resource';
  name: string;
  value: number;
  timestamp: number;
  url: string;
  sessionId: string;
  userId?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

class RUMClient {
  private config: RUMConfig;
  private sessionId: string;
  private userId?: string;
  private queue: RUMEvent[] = [];
  private flushTimeout?: NodeJS.Timeout;

  constructor(config: RUMConfig) {
    this.config = {
      sampleRate: 1,
      debug: false,
      ...config,
    };
    this.sessionId = this.getOrCreateSessionId();
    this.init();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('rum_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('rum_session_id', sessionId);
    }
    return sessionId;
  }

  private init() {
    if (typeof window === 'undefined') return;
    
    // Sample rate check
    if (Math.random() > (this.config.sampleRate || 1)) {
      return;
    }

    // Web Vitals
    onCLS((metric) => this.recordMetric(metric));
    onFID((metric) => this.recordMetric(metric));
    onLCP((metric) => this.recordMetric(metric));
    onFCP((metric) => this.recordMetric(metric));
    onTTFB((metric) => this.recordMetric(metric));
    onINP((metric) => this.recordMetric(metric));

    // Error tracking
    window.addEventListener('error', (event) => {
      this.recordError(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason, { type: 'unhandledrejection' });
    });

    // Navigation timing
    this.recordNavigationTiming();

    // Resource timing
    this.observeResources();

    // Long tasks
    this.observeLongTasks();

    // Flush on page unload
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true);
      }
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private recordMetric(metric: Metric) {
    this.enqueue({
      type: 'metric',
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      userId: this.userId,
      tags: this.config.tags,
      metadata: {
        id: metric.id,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType,
        entries: metric.entries.map((e) => ({
          name: e.name,
          startTime: e.startTime,
          duration: 'duration' in e ? e.duration : undefined,
        })),
      },
    });
  }

  recordError(error: unknown, metadata?: Record<string, unknown>) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.enqueue({
      type: 'error',
      name: 'error',
      value: 1,
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      userId: this.userId,
      tags: this.config.tags,
      metadata: {
        message: errorMessage,
        stack: errorStack,
        ...metadata,
      },
    });
  }

  recordCustomMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    this.enqueue({
      type: 'metric',
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      userId: this.userId,
      tags: this.config.tags,
      metadata,
    });
  }

  recordInteraction(name: string, duration: number, metadata?: Record<string, unknown>) {
    this.enqueue({
      type: 'interaction',
      name,
      value: duration,
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      userId: this.userId,
      tags: this.config.tags,
      metadata,
    });
  }

  private recordNavigationTiming() {
    if (!performance.getEntriesByType) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.secureConnectionStart > 0
        ? navigation.connectEnd - navigation.secureConnectionStart
        : 0,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domParse: navigation.domInteractive - navigation.responseEnd,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.startTime,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.enqueue({
          type: 'navigation',
          name: `nav_${name}`,
          value,
          timestamp: Date.now(),
          url: window.location.href,
          sessionId: this.sessionId,
          userId: this.userId,
          tags: this.config.tags,
        });
      }
    });
  }

  private observeResources() {
    if (!PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // Only track slow resources (>100ms)
        if (resource.duration < 100) return;

        // Extract resource type from initiatorType
        const resourceType = resource.initiatorType;

        this.enqueue({
          type: 'resource',
          name: resource.name.split('?')[0], // Remove query params
          value: resource.duration,
          timestamp: Date.now(),
          url: window.location.href,
          sessionId: this.sessionId,
          userId: this.userId,
          tags: this.config.tags,
          metadata: {
            resourceType,
            transferSize: resource.transferSize,
            encodedBodySize: resource.encodedBodySize,
            decodedBodySize: resource.decodedBodySize,
          },
        });
      });
    });

    observer.observe({ type: 'resource', buffered: true });
  }

  private observeLongTasks() {
    if (!PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.enqueue({
            type: 'metric',
            name: 'long_task',
            value: entry.duration,
            timestamp: Date.now(),
            url: window.location.href,
            sessionId: this.sessionId,
            userId: this.userId,
            tags: this.config.tags,
            metadata: {
              attribution: (entry as any).attribution,
            },
          });
        });
      });

      observer.observe({ type: 'longtask', buffered: true });
    } catch {
      // Long task observer not supported
    }
  }

  private enqueue(event: RUMEvent) {
    this.queue.push(event);

    if (this.config.debug) {
      console.log('[RUM]', event);
    }

    // Batch flush after 5 seconds or 10 events
    if (this.queue.length >= 10) {
      this.flush();
    } else if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => this.flush(), 5000);
    }
  }

  private async flush(useBeacon = false) {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = undefined;
    }

    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    const payload = JSON.stringify(events);

    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(this.config.endpoint, payload);
    } else {
      try {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      } catch (error) {
        // Re-queue on failure
        this.queue.unshift(...events);
        console.error('[RUM] Failed to send events:', error);
      }
    }
  }
}

// Singleton instance
let rumClient: RUMClient | null = null;

export function initRUM(config: RUMConfig): RUMClient {
  if (!rumClient) {
    rumClient = new RUMClient(config);
  }
  return rumClient;
}

export function getRUM(): RUMClient | null {
  return rumClient;
}
```

### RUM Provider Component

```tsx
// components/providers/rum-provider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initRUM, getRUM } from '@/lib/monitoring/rum';

interface RUMProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function RUMProvider({ children, userId }: RUMProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize RUM
  useEffect(() => {
    initRUM({
      endpoint: '/api/rum/collect',
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1, // 10% in prod
      debug: process.env.NODE_ENV === 'development',
      tags: {
        app: 'my-app',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
      },
    });
  }, []);

  // Set user ID
  useEffect(() => {
    const rum = getRUM();
    if (rum && userId) {
      rum.setUserId(userId);
    }
  }, [userId]);

  // Track page views
  useEffect(() => {
    const rum = getRUM();
    if (rum) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      rum.recordCustomMetric('page_view', 1, { path: pathname });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

### RUM Collection API

```typescript
// app/api/rum/collect/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RUMEvent {
  type: string;
  name: string;
  value: number;
  timestamp: number;
  url: string;
  sessionId: string;
  userId?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const events: RUMEvent[] = await request.json();

    // Validate events
    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Process events
    for (const event of events) {
      // Send to your analytics backend
      await sendToAnalytics(event);

      // Log metrics for observability
      if (event.type === 'metric') {
        console.log(`[RUM] ${event.name}:`, {
          value: event.value,
          url: event.url,
          sessionId: event.sessionId,
          metadata: event.metadata,
        });
      }

      // Alert on errors
      if (event.type === 'error') {
        console.error(`[RUM Error]`, event.metadata);
        // Could trigger alerting here
      }
    }

    return NextResponse.json({ received: events.length });
  } catch (error) {
    console.error('RUM collection error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function sendToAnalytics(event: RUMEvent) {
  // Send to your analytics service (e.g., InfluxDB, Datadog, etc.)
  // Example with a generic HTTP endpoint:
  if (process.env.ANALYTICS_ENDPOINT) {
    await fetch(process.env.ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  }
}
```

### Custom Interaction Tracking

```tsx
// hooks/use-track-interaction.ts
'use client';

import { useCallback, useRef } from 'react';
import { getRUM } from '@/lib/monitoring/rum';

export function useTrackInteraction(name: string) {
  const startTimeRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endTracking = useCallback((metadata?: Record<string, unknown>) => {
    if (startTimeRef.current === null) return;

    const duration = performance.now() - startTimeRef.current;
    startTimeRef.current = null;

    getRUM()?.recordInteraction(name, duration, metadata);
  }, [name]);

  const trackClick = useCallback((metadata?: Record<string, unknown>) => {
    getRUM()?.recordInteraction(`click_${name}`, 0, metadata);
  }, [name]);

  return { startTracking, endTracking, trackClick };
}

// Usage
function SearchComponent() {
  const { startTracking, endTracking } = useTrackInteraction('search');

  const handleSearch = async (query: string) => {
    startTracking();
    const results = await search(query);
    endTracking({ query, resultCount: results.length });
    return results;
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

### Performance Budget Alerts

```typescript
// lib/monitoring/performance-budget.ts
'use client';

import { getRUM } from './rum';

interface PerformanceBudget {
  lcp: number; // ms
  fid: number; // ms
  cls: number; // score
  ttfb: number; // ms
}

const defaultBudget: PerformanceBudget = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  ttfb: 800,
};

export function checkPerformanceBudget(
  metric: string,
  value: number,
  budget: PerformanceBudget = defaultBudget
) {
  const budgetValue = budget[metric.toLowerCase() as keyof PerformanceBudget];
  
  if (budgetValue && value > budgetValue) {
    getRUM()?.recordCustomMetric('budget_exceeded', 1, {
      metric,
      value,
      budget: budgetValue,
      exceeded_by: value - budgetValue,
    });

    console.warn(
      `[Performance Budget] ${metric} exceeded: ${value}ms (budget: ${budgetValue}ms)`
    );
  }
}
```

## Variants

### Third-Party RUM Integration

```typescript
// Datadog RUM
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'YOUR_APP_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  site: 'datadoghq.com',
  service: 'my-nextjs-app',
  env: process.env.NODE_ENV,
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
});
```

## Anti-Patterns

```typescript
// Bad: Collecting too much data
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    sendToBackend(entry); // Every single resource!
  });
});

// Good: Sample and filter
if (Math.random() < 0.1 && entry.duration > 100) {
  sendToBackend(entry);
}

// Bad: Blocking the main thread
await fetch('/api/rum', { body: JSON.stringify(events) }); // Blocks!

// Good: Use beacon or keepalive
navigator.sendBeacon('/api/rum', JSON.stringify(events));
```

## Related Skills

- `web-vitals` - Core Web Vitals
- `observability` - Backend monitoring
- `user-analytics` - User behavior analytics
- `error-reporting` - Error tracking

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial RUM pattern with Web Vitals
