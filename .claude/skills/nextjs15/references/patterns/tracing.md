---
id: pt-tracing
name: Distributed Tracing
version: 2.0.0
layer: L5
category: observability
description: Implement distributed tracing for request flow visualization
tags: [observability, tracing, opentelemetry, spans, performance]
composes: []
dependencies:
  @opentelemetry/api: "^1.9.0"
formula: spans + context propagation + trace exporters = end-to-end request visibility
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Distributed Tracing

Track requests across services and components to understand system behavior and debug performance issues.

## When to Use

- Microservices or distributed systems requiring request flow visibility
- Performance debugging to identify bottlenecks
- Understanding service dependencies and latency contributions
- Correlating errors across multiple services
- Monitoring async job execution and background processes

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|  Incoming Request |---->|    pt-tracing     |---->|   Trace Backend   |
|  (HTTP Headers)   |     | (OpenTelemetry)   |     | (Jaeger/Zipkin)   |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
| Context Extract   |     |   Span Creation   |     |   Visualization   |
|  (Propagation)    |     |    & Attributes   |     |    & Analysis     |
+-------------------+     +-------------------+     +-------------------+
        |                         |
        v                         v
+-------------------+     +-------------------+
|   pt-logging      |     |   pt-metrics      |
| (Trace Context)   |     |  (Span Metrics)   |
+-------------------+     +-------------------+
        |
        v
+-------------------+
| pt-error-tracking |
| (Error Spans)     |
+-------------------+
```

## Overview

Distributed tracing provides:
- End-to-end request visibility
- Performance bottleneck identification
- Error correlation
- Service dependency mapping

## Implementation

### OpenTelemetry Setup

```typescript
// instrumentation.ts (Next.js instrumentation file)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { NodeSDK } = await import("@opentelemetry/sdk-node");
    const { getNodeAutoInstrumentations } = await import(
      "@opentelemetry/auto-instrumentations-node"
    );
    const { OTLPTraceExporter } = await import(
      "@opentelemetry/exporter-trace-otlp-http"
    );
    const { Resource } = await import("@opentelemetry/resources");
    const { SemanticResourceAttributes } = await import(
      "@opentelemetry/semantic-conventions"
    );
    
    const exporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
    });
    
    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: "nextjs-app",
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
      }),
      traceExporter: exporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          "@opentelemetry/instrumentation-fs": { enabled: false },
        }),
      ],
    });
    
    sdk.start();
    
    process.on("SIGTERM", () => {
      sdk.shutdown().then(
        () => console.log("Tracing terminated"),
        (error) => console.log("Error terminating tracing", error)
      );
    });
  }
}
```

### Manual Span Creation

```typescript
// lib/tracing/index.ts
import { trace, SpanStatusCode, context, SpanKind } from "@opentelemetry/api";

const tracer = trace.getTracer("nextjs-app");

// Create a span wrapper
export function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }
      
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

// Create spans for database operations
export async function traceDbQuery<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(
    `db.${operation}`,
    {
      kind: SpanKind.CLIENT,
      attributes: {
        "db.system": "postgresql",
        "db.operation": operation,
        "db.sql.table": table,
      },
    },
    async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Create spans for external API calls
export async function traceApiCall<T>(
  method: string,
  url: string,
  fn: () => Promise<T>
): Promise<T> {
  const urlObj = new URL(url);
  
  return tracer.startActiveSpan(
    `HTTP ${method} ${urlObj.pathname}`,
    {
      kind: SpanKind.CLIENT,
      attributes: {
        "http.method": method,
        "http.url": url,
        "http.host": urlObj.host,
        "http.scheme": urlObj.protocol.replace(":", ""),
      },
    },
    async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}
```

### Tracing in API Routes

```typescript
// lib/api/with-tracing.ts
import { NextRequest, NextResponse } from "next/server";
import { trace, SpanStatusCode, SpanKind, propagation, context } from "@opentelemetry/api";

const tracer = trace.getTracer("api-routes");

export function withTracing(
  handler: (req: NextRequest, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, routeContext?: any) => {
    // Extract trace context from incoming headers
    const incomingContext = propagation.extract(
      context.active(),
      Object.fromEntries(req.headers)
    );
    
    return context.with(incomingContext, async () => {
      return tracer.startActiveSpan(
        `${req.method} ${req.nextUrl.pathname}`,
        {
          kind: SpanKind.SERVER,
          attributes: {
            "http.method": req.method,
            "http.url": req.url,
            "http.route": req.nextUrl.pathname,
            "http.user_agent": req.headers.get("user-agent") || "",
          },
        },
        async (span) => {
          try {
            const response = await handler(req, routeContext);
            
            span.setAttributes({
              "http.status_code": response.status,
            });
            
            if (response.status >= 400) {
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: `HTTP ${response.status}`,
              });
            } else {
              span.setStatus({ code: SpanStatusCode.OK });
            }
            
            return response;
          } catch (error) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error instanceof Error ? error.message : "Unknown error",
            });
            span.recordException(error as Error);
            throw error;
          } finally {
            span.end();
          }
        }
      );
    });
  };
}

// Usage
// app/api/orders/[id]/route.ts
import { withTracing } from "@/lib/api/with-tracing";
import { withSpan, traceDbQuery } from "@/lib/tracing";

export const GET = withTracing(async (request, { params }) => {
  const { id } = await params;
  
  // Database query is automatically traced
  const order = await traceDbQuery("findUnique", "orders", () =>
    prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
  );
  
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  // Custom span for business logic
  const enrichedOrder = await withSpan(
    "enrich-order",
    async () => {
      return {
        ...order,
        formattedTotal: formatCurrency(order.total),
        itemCount: order.items.length,
      };
    },
    { orderId: id }
  );
  
  return NextResponse.json(enrichedOrder);
});
```

### Tracing Server Components

```typescript
// lib/tracing/server-components.ts
import { trace, SpanStatusCode, context } from "@opentelemetry/api";
import { headers } from "next/headers";

const tracer = trace.getTracer("server-components");

export async function traceServerComponent<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const headersList = await headers();
  const traceId = headersList.get("x-trace-id");
  
  return tracer.startActiveSpan(
    `ServerComponent: ${name}`,
    {
      attributes: {
        "component.type": "server",
        "component.name": name,
        ...(traceId && { "trace.id": traceId }),
      },
    },
    async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Usage in Server Component
// app/dashboard/page.tsx
import { traceServerComponent } from "@/lib/tracing/server-components";

export default async function DashboardPage() {
  const data = await traceServerComponent("DashboardPage", async () => {
    const [metrics, activity, notifications] = await Promise.all([
      getMetrics(),
      getRecentActivity(),
      getNotifications(),
    ]);
    
    return { metrics, activity, notifications };
  });
  
  return (
    <div>
      <MetricsSection data={data.metrics} />
      <ActivityFeed data={data.activity} />
      <NotificationsList data={data.notifications} />
    </div>
  );
}
```

### Context Propagation

```typescript
// lib/tracing/propagation.ts
import { propagation, context, trace } from "@opentelemetry/api";

// Add trace context to outgoing requests
export function injectTraceHeaders(headers: Headers): Headers {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  
  Object.entries(carrier).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return headers;
}

// Traced fetch wrapper
export async function tracedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const urlObj = new URL(url);
  const tracer = trace.getTracer("http-client");
  
  return tracer.startActiveSpan(
    `fetch ${urlObj.pathname}`,
    {
      attributes: {
        "http.method": options.method || "GET",
        "http.url": url,
      },
    },
    async (span) => {
      // Inject trace context into headers
      const headers = new Headers(options.headers);
      injectTraceHeaders(headers);
      
      try {
        const response = await fetch(url, { ...options, headers });
        
        span.setAttributes({
          "http.status_code": response.status,
        });
        
        if (!response.ok) {
          span.setStatus({
            code: trace.SpanStatusCode.ERROR,
            message: `HTTP ${response.status}`,
          });
        }
        
        return response;
      } catch (error) {
        span.setStatus({ code: trace.SpanStatusCode.ERROR });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Usage
const response = await tracedFetch("https://api.example.com/data", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### Vercel Edge Tracing

```typescript
// For Edge runtime (middleware, edge functions)
// lib/tracing/edge.ts
import { trace } from "@vercel/otel";

export const edgeTracer = trace.getTracer("edge-functions");

// Use in middleware
// middleware.ts
import { edgeTracer } from "@/lib/tracing/edge";

export async function middleware(request: NextRequest) {
  return edgeTracer.startActiveSpan(
    `middleware ${request.nextUrl.pathname}`,
    async (span) => {
      span.setAttribute("http.method", request.method);
      span.setAttribute("http.url", request.url);
      
      // Your middleware logic
      const response = NextResponse.next();
      
      span.end();
      return response;
    }
  );
}
```

## Variants

### Sampling Strategies

```typescript
// lib/tracing/sampling.ts
import { ParentBasedSampler, TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";

// Sample 10% of traces in production
const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(
    process.env.NODE_ENV === "production" ? 0.1 : 1.0
  ),
});

// In SDK configuration
const sdk = new NodeSDK({
  sampler,
  // ... other config
});
```

### Custom Span Processors

```typescript
// lib/tracing/processors.ts
import { SpanProcessor, Span } from "@opentelemetry/sdk-trace-base";

// Add custom attributes to all spans
class CustomSpanProcessor implements SpanProcessor {
  onStart(span: Span): void {
    span.setAttribute("deployment.id", process.env.VERCEL_DEPLOYMENT_ID || "local");
    span.setAttribute("git.commit", process.env.VERCEL_GIT_COMMIT_SHA || "unknown");
  }
  
  onEnd(span: Span): void {
    // Add duration bucket for analysis
    const duration = span.duration[0] * 1000 + span.duration[1] / 1e6;
    if (duration < 100) {
      span.setAttribute("duration.bucket", "fast");
    } else if (duration < 1000) {
      span.setAttribute("duration.bucket", "normal");
    } else {
      span.setAttribute("duration.bucket", "slow");
    }
  }
  
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
  
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
```

## Anti-patterns

### Creating Too Many Spans

```typescript
// BAD: Span for every loop iteration
for (const item of items) {
  await withSpan(`process-item-${item.id}`, async () => {
    // Processing
  });
}

// GOOD: Single span with attributes
await withSpan("process-items", async () => {
  for (const item of items) {
    // Processing
  }
}, { itemCount: items.length });
```

### Not Ending Spans

```typescript
// BAD: Span never ends on error
const span = tracer.startSpan("operation");
await riskyOperation(); // Throws - span never ends!
span.end();

// GOOD: Use try/finally
const span = tracer.startSpan("operation");
try {
  await riskyOperation();
} finally {
  span.end();
}
```

## Related Skills

- `logging` - Structured logging
- `metrics` - Application metrics
- `error-tracking` - Error monitoring

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with OpenTelemetry
