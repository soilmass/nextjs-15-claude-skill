---
id: pt-metrics
name: Application Metrics
version: 2.0.0
layer: L5
category: observability
description: Collect and expose application metrics for monitoring and alerting
tags: [observability, metrics, prometheus, monitoring, performance]
composes: []
dependencies:
  prom-client: "^15.1.0"
formula: counters + histograms + gauges + labels = quantitative system health
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Application Metrics

Collect, aggregate, and expose application metrics for monitoring dashboards and alerting.

## When to Use

- Production applications requiring quantitative performance data
- Systems with SLA requirements needing percentile tracking
- Dashboard creation for operational visibility
- Enabling alerting based on threshold violations
- Business KPI tracking (orders, revenue, conversions)

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|  Application      |---->|    pt-metrics     |---->|   Prometheus      |
|    Events         |     |   (prom-client)   |     |    /Grafana       |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|   HTTP Requests   |     |  Metric Types     |     |   pt-alerting     |
|   DB Queries      |     | Counter/Histogram |     | (Threshold Rules) |
+-------------------+     |      /Gauge       |     +-------------------+
        |                 +-------------------+
        v                         |
+-------------------+             v
|  pt-web-vitals    |     +-------------------+
| (Client Metrics)  |     |   /api/metrics    |
+-------------------+     |    (Endpoint)     |
        |                 +-------------------+
        v
+-------------------+
|   pt-tracing      |
| (Span Metrics)    |
+-------------------+
```

## Overview

Application metrics track:
- Request rates and latencies
- Error rates
- Resource utilization
- Business metrics
- Custom counters and gauges

## Implementation

### Metrics Collection with Prometheus

```typescript
// lib/metrics/prometheus.ts
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";

// Create a registry
export const register = new Registry();

// Collect default Node.js metrics
collectDefaultMetrics({ register });

// HTTP request metrics
export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Database metrics
export const dbQueryDuration = new Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const dbConnectionsActive = new Gauge({
  name: "db_connections_active",
  help: "Number of active database connections",
  registers: [register],
});

// Business metrics
export const ordersTotal = new Counter({
  name: "orders_total",
  help: "Total number of orders",
  labelNames: ["status"],
  registers: [register],
});

export const orderValue = new Histogram({
  name: "order_value_dollars",
  help: "Order value in dollars",
  buckets: [10, 50, 100, 250, 500, 1000, 5000],
  registers: [register],
});

export const activeUsers = new Gauge({
  name: "active_users",
  help: "Number of currently active users",
  registers: [register],
});

// Cache metrics
export const cacheHits = new Counter({
  name: "cache_hits_total",
  help: "Total cache hits",
  labelNames: ["cache"],
  registers: [register],
});

export const cacheMisses = new Counter({
  name: "cache_misses_total",
  help: "Total cache misses",
  labelNames: ["cache"],
  registers: [register],
});
```

### Metrics API Endpoint

```typescript
// app/api/metrics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/metrics/prometheus";

export async function GET(request: NextRequest) {
  // Optionally protect the metrics endpoint
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.METRICS_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const metrics = await register.metrics();
    
    return new Response(metrics, {
      headers: {
        "Content-Type": register.contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to collect metrics" },
      { status: 500 }
    );
  }
}
```

### Request Metrics Middleware

```typescript
// lib/api/with-metrics.ts
import { NextRequest, NextResponse } from "next/server";
import { httpRequestsTotal, httpRequestDuration } from "@/lib/metrics/prometheus";

export function withMetrics(
  handler: (req: NextRequest, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    const start = Date.now();
    const route = req.nextUrl.pathname;
    const method = req.method;
    
    try {
      const response = await handler(req, context);
      const status = response.status.toString();
      const duration = (Date.now() - start) / 1000;
      
      httpRequestsTotal.labels(method, route, status).inc();
      httpRequestDuration.labels(method, route, status).observe(duration);
      
      return response;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      
      httpRequestsTotal.labels(method, route, "500").inc();
      httpRequestDuration.labels(method, route, "500").observe(duration);
      
      throw error;
    }
  };
}

// Usage
// app/api/orders/route.ts
import { withMetrics } from "@/lib/api/with-metrics";

export const GET = withMetrics(async (request) => {
  const orders = await getOrders();
  return NextResponse.json(orders);
});
```

### Database Metrics

```typescript
// lib/db/with-metrics.ts
import { dbQueryDuration, dbConnectionsActive } from "@/lib/metrics/prometheus";

// Prisma middleware for query metrics
export function setupPrismaMetrics(prisma: PrismaClient) {
  prisma.$use(async (params, next) => {
    const start = Date.now();
    
    try {
      const result = await next(params);
      
      dbQueryDuration
        .labels(params.action, params.model || "unknown")
        .observe((Date.now() - start) / 1000);
      
      return result;
    } catch (error) {
      dbQueryDuration
        .labels(params.action, params.model || "unknown")
        .observe((Date.now() - start) / 1000);
      
      throw error;
    }
  });
  
  // Track connection pool
  prisma.$on("query", () => {
    // Update connection gauge (implementation depends on pool monitoring)
  });
}

// Usage
// lib/db/index.ts
import { PrismaClient } from "@prisma/client";
import { setupPrismaMetrics } from "./with-metrics";

const prisma = new PrismaClient();
setupPrismaMetrics(prisma);

export { prisma };
```

### Business Metrics

```typescript
// lib/metrics/business.ts
import { ordersTotal, orderValue, activeUsers } from "./prometheus";

export function recordOrder(order: { status: string; total: number }) {
  ordersTotal.labels(order.status).inc();
  orderValue.observe(order.total);
}

export function updateActiveUsers(count: number) {
  activeUsers.set(count);
}

// Usage in actions
// app/actions/orders.ts
"use server";

import { recordOrder } from "@/lib/metrics/business";

export async function createOrder(formData: FormData) {
  const order = await prisma.order.create({
    data: { /* ... */ },
  });
  
  recordOrder({
    status: order.status,
    total: order.total,
  });
  
  return order;
}
```

### Web Vitals Metrics

```typescript
// app/components/web-vitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics endpoint
    fetch("/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      }),
      keepalive: true,
    });
  });
  
  return null;
}

// app/api/vitals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Histogram } from "prom-client";
import { register } from "@/lib/metrics/prometheus";

const webVitals = new Histogram({
  name: "web_vitals",
  help: "Web Vitals metrics",
  labelNames: ["name", "rating"],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export async function POST(request: NextRequest) {
  const metric = await request.json();
  
  // Convert to seconds for consistency
  const value = ["CLS"].includes(metric.name)
    ? metric.value
    : metric.value / 1000;
  
  webVitals.labels(metric.name, metric.rating || "unknown").observe(value);
  
  return NextResponse.json({ received: true });
}
```

### Vercel Analytics Integration

```typescript
// For Vercel deployments
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

// Custom event tracking
// lib/analytics.ts
import { track } from "@vercel/analytics";

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  track(name, properties);
}

// Usage
trackEvent("order_completed", {
  orderId: order.id,
  value: order.total,
  items: order.items.length,
});
```

### Custom Metrics Dashboard API

```typescript
// app/api/dashboard/metrics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { register } from "@/lib/metrics/prometheus";

export async function GET() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const [
    ordersToday,
    ordersTodayValue,
    activeUsersNow,
    errorRate,
    avgResponseTime,
  ] = await Promise.all([
    // Orders in last 24 hours
    prisma.order.count({
      where: { createdAt: { gte: oneDayAgo } },
    }),
    
    // Order value in last 24 hours
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: oneDayAgo } },
    }),
    
    // Active users in last hour
    prisma.session.count({
      where: { lastActive: { gte: oneHourAgo } },
    }),
    
    // Error rate (from logs or metrics)
    getErrorRate(),
    
    // Average response time
    getAverageResponseTime(),
  ]);
  
  return NextResponse.json({
    ordersToday,
    ordersTodayValue: ordersTodayValue._sum.total || 0,
    activeUsersNow,
    errorRate,
    avgResponseTime,
    timestamp: now.toISOString(),
  });
}

async function getErrorRate(): Promise<number> {
  // Get from Prometheus metrics
  const metrics = await register.getSingleMetricAsString("http_requests_total");
  // Parse and calculate error rate
  return 0.02; // Example: 2%
}

async function getAverageResponseTime(): Promise<number> {
  // Get from Prometheus histogram
  return 0.15; // Example: 150ms
}
```

## Variants

### Redis-Based Metrics (for Serverless)

```typescript
// lib/metrics/redis.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function incrementCounter(
  name: string,
  labels: Record<string, string> = {},
  value: number = 1
) {
  const key = `metric:${name}:${JSON.stringify(labels)}`;
  await redis.incrbyfloat(key, value);
}

export async function observeHistogram(
  name: string,
  value: number,
  labels: Record<string, string> = {}
) {
  const key = `metric:${name}:${JSON.stringify(labels)}`;
  const bucket = getBucket(value);
  await redis.hincrby(key, bucket, 1);
}

export async function setGauge(
  name: string,
  value: number,
  labels: Record<string, string> = {}
) {
  const key = `metric:${name}:${JSON.stringify(labels)}`;
  await redis.set(key, value);
}

function getBucket(value: number): string {
  const buckets = [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, Infinity];
  for (const bucket of buckets) {
    if (value <= bucket) return bucket.toString();
  }
  return "inf";
}
```

### Aggregated Metrics

```typescript
// lib/metrics/aggregator.ts
class MetricsAggregator {
  private buffer: Map<string, number[]> = new Map();
  private flushInterval: number;
  
  constructor(flushIntervalMs: number = 60000) {
    this.flushInterval = flushIntervalMs;
    
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }
  
  record(name: string, value: number) {
    const values = this.buffer.get(name) || [];
    values.push(value);
    this.buffer.set(name, values);
  }
  
  async flush() {
    const aggregated: Record<string, any> = {};
    
    for (const [name, values] of this.buffer) {
      aggregated[name] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p50: percentile(values, 50),
        p95: percentile(values, 95),
        p99: percentile(values, 99),
      };
    }
    
    // Send to metrics backend
    await sendToBackend(aggregated);
    
    this.buffer.clear();
  }
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index];
}
```

## Anti-patterns

### High Cardinality Labels

```typescript
// BAD: User ID as label creates unbounded cardinality
httpRequestsTotal.labels(method, route, status, userId).inc();

// GOOD: Use low-cardinality labels
httpRequestsTotal.labels(method, route, status).inc();
// Track user-specific metrics separately or aggregated
```

### Not Using Histograms for Latencies

```typescript
// BAD: Only tracking average
let totalLatency = 0;
let requestCount = 0;
const avgLatency = totalLatency / requestCount; // Hides outliers!

// GOOD: Use histogram for percentiles
httpRequestDuration.labels(method, route, status).observe(duration);
```

## Related Skills

- `logging` - Structured logging
- `tracing` - Distributed tracing
- `web-vitals` - Core Web Vitals

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Prometheus
