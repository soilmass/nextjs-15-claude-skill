---
id: pt-logging
name: Logging
version: 2.0.0
layer: L5
category: observability
description: Implement structured logging for debugging and monitoring
tags: [observability, logging, debugging, monitoring, structured-logs]
composes: []
dependencies:
  pino: "^9.5.0"
formula: structured format + context propagation + log aggregation = actionable insights
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Logging

Implement structured logging for effective debugging, monitoring, and incident response.

## When to Use

- Any production application requiring audit trails and debugging capability
- Systems where request tracing across services is necessary
- Applications requiring compliance logging (security, audit)
- Debugging complex async operations or distributed systems
- Performance monitoring via log-based metrics

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|  Request Entry    |---->|    pt-logging     |---->|  Log Aggregator   |
|    (Middleware)   |     |  (Pino/Winston)   |     | (Axiom/Logtail)   |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|   pt-tracing      |     |  Context Store    |     |   pt-alerting     |
|(Correlation IDs)  |     | (AsyncLocalStore) |     | (Log-based Rules) |
+-------------------+     +-------------------+     +-------------------+
        |                                                  |
        v                                                  v
+-------------------+                              +-------------------+
| pt-error-tracking |                              |   pt-metrics      |
| (Error Context)   |                              | (Log Aggregation) |
+-------------------+                              +-------------------+
```

## Overview

Logging provides:
- Debugging capabilities
- Performance monitoring
- Security auditing
- Error tracking
- Business analytics

## Implementation

### Structured Logger Setup

```typescript
// lib/logger/index.ts
import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

// Base logger configuration
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  
  // Pretty print in development
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "SYS:standard",
      },
    },
  }),
  
  // Production configuration
  ...(!isDev && {
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
  
  // Base context
  base: {
    env: process.env.NODE_ENV,
    service: "nextjs-app",
    version: process.env.npm_package_version,
  },
});

// Create child loggers for different modules
export const createLogger = (module: string) => {
  return logger.child({ module });
};

// Pre-configured loggers
export const apiLogger = createLogger("api");
export const dbLogger = createLogger("database");
export const authLogger = createLogger("auth");
export const jobLogger = createLogger("jobs");
```

### Request Logging Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiLogger } from "@/lib/logger";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  
  // Add request ID to response
  response.headers.set("x-request-id", requestId);
  
  // Log request (will be completed in route handler)
  const { pathname, search } = request.nextUrl;
  
  // Don't log static assets
  if (!pathname.startsWith("/_next") && !pathname.includes(".")) {
    apiLogger.info({
      type: "request",
      requestId,
      method: request.method,
      path: pathname,
      query: search,
      userAgent: request.headers.get("user-agent"),
      ip: request.ip || request.headers.get("x-forwarded-for"),
    });
  }
  
  return response;
}

// Log response in API routes
// lib/api/with-logging.ts
import { NextRequest, NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

export function withLogging(
  handler: (req: NextRequest, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    const start = Date.now();
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
    
    try {
      const response = await handler(req, context);
      
      apiLogger.info({
        type: "response",
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        status: response.status,
        duration: Date.now() - start,
      });
      
      return response;
    } catch (error) {
      apiLogger.error({
        type: "error",
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - start,
      });
      
      throw error;
    }
  };
}

// Usage
// app/api/users/route.ts
import { withLogging } from "@/lib/api/with-logging";

export const GET = withLogging(async (request) => {
  const users = await getUsers();
  return NextResponse.json(users);
});
```

### Context-Aware Logging

```typescript
// lib/logger/context.ts
import { AsyncLocalStorage } from "async_hooks";
import { logger } from "./index";

interface LogContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

export function runWithContext<T>(context: LogContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}

export function getContext(): LogContext | undefined {
  return asyncLocalStorage.getStore();
}

// Context-aware logger
export function log(level: string, message: string, data?: object) {
  const context = getContext();
  const logData = {
    ...context,
    ...data,
  };
  
  (logger as any)[level](logData, message);
}

export const contextLogger = {
  debug: (message: string, data?: object) => log("debug", message, data),
  info: (message: string, data?: object) => log("info", message, data),
  warn: (message: string, data?: object) => log("warn", message, data),
  error: (message: string, data?: object) => log("error", message, data),
};

// Usage in API route
// app/api/orders/route.ts
import { runWithContext, contextLogger } from "@/lib/logger/context";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id")!;
  const session = await getSession();
  
  return runWithContext(
    {
      requestId,
      userId: session?.userId,
      sessionId: session?.id,
    },
    async () => {
      contextLogger.info("Creating order");
      
      const order = await createOrder();
      
      contextLogger.info("Order created", { orderId: order.id });
      
      return NextResponse.json(order);
    }
  );
}
```

### Database Query Logging

```typescript
// lib/db/index.ts
import { PrismaClient } from "@prisma/client";
import { dbLogger } from "@/lib/logger";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    dbLogger.debug({
      type: "query",
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  });
}

// Always log errors and warnings
prisma.$on("error", (e) => {
  dbLogger.error({
    type: "error",
    message: e.message,
  });
});

prisma.$on("warn", (e) => {
  dbLogger.warn({
    type: "warning",
    message: e.message,
  });
});

// Slow query logging in production
if (process.env.NODE_ENV === "production") {
  prisma.$on("query", (e) => {
    if (e.duration > 1000) {
      // Log queries taking more than 1 second
      dbLogger.warn({
        type: "slow-query",
        query: e.query,
        duration: e.duration,
      });
    }
  });
}

export { prisma };
```

### Audit Logging

```typescript
// lib/logger/audit.ts
import { prisma } from "@/lib/db";
import { getContext } from "./context";

type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "order.created"
  | "order.updated"
  | "settings.changed"
  | "data.exported";

interface AuditLog {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  changes?: object;
  metadata?: object;
}

export async function audit(log: AuditLog): Promise<void> {
  const context = getContext();
  
  await prisma.auditLog.create({
    data: {
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      changes: log.changes as any,
      metadata: log.metadata as any,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      createdAt: new Date(),
    },
  });
}

// Usage
export async function updateUser(userId: string, data: UpdateUserData) {
  const before = await prisma.user.findUnique({ where: { id: userId } });
  
  const after = await prisma.user.update({
    where: { id: userId },
    data,
  });
  
  await audit({
    action: "user.updated",
    resourceType: "user",
    resourceId: userId,
    changes: {
      before: { name: before?.name, email: before?.email },
      after: { name: after.name, email: after.email },
    },
  });
  
  return after;
}
```

### Log Shipping to External Services

```typescript
// lib/logger/transports.ts
import pino from "pino";

// Axiom transport
export const axiomTransport = pino.transport({
  target: "@axiomhq/pino",
  options: {
    dataset: process.env.AXIOM_DATASET,
    token: process.env.AXIOM_TOKEN,
  },
});

// Logtail transport
export const logtailTransport = pino.transport({
  target: "@logtail/pino",
  options: {
    sourceToken: process.env.LOGTAIL_SOURCE_TOKEN,
  },
});

// Multiple transports
export const multiTransport = pino.transport({
  targets: [
    // Console in development
    ...(process.env.NODE_ENV === "development"
      ? [
          {
            target: "pino-pretty",
            options: { colorize: true },
            level: "debug",
          },
        ]
      : []),
    // Axiom in production
    {
      target: "@axiomhq/pino",
      options: {
        dataset: process.env.AXIOM_DATASET,
        token: process.env.AXIOM_TOKEN,
      },
      level: "info",
    },
  ],
});

// Usage
// lib/logger/index.ts
import pino from "pino";
import { multiTransport } from "./transports";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  multiTransport
);
```

### Client-Side Logging

```typescript
// lib/logger/client.ts
"use client";

type LogLevel = "debug" | "info" | "warn" | "error";

interface ClientLog {
  level: LogLevel;
  message: string;
  data?: object;
  timestamp: string;
  url: string;
  userAgent: string;
}

class ClientLogger {
  private queue: ClientLog[] = [];
  private flushInterval: number = 5000;
  private maxQueueSize: number = 100;
  
  constructor() {
    if (typeof window !== "undefined") {
      setInterval(() => this.flush(), this.flushInterval);
      window.addEventListener("beforeunload", () => this.flush());
    }
  }
  
  private log(level: LogLevel, message: string, data?: object) {
    const log: ClientLog = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console[level](message, data);
    }
    
    this.queue.push(log);
    
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }
  
  private async flush() {
    if (this.queue.length === 0) return;
    
    const logs = [...this.queue];
    this.queue = [];
    
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
        keepalive: true,
      });
    } catch (error) {
      // Re-queue logs on failure
      this.queue = [...logs, ...this.queue].slice(-this.maxQueueSize);
    }
  }
  
  debug(message: string, data?: object) {
    this.log("debug", message, data);
  }
  
  info(message: string, data?: object) {
    this.log("info", message, data);
  }
  
  warn(message: string, data?: object) {
    this.log("warn", message, data);
  }
  
  error(message: string, data?: object) {
    this.log("error", message, data);
  }
}

export const clientLogger = new ClientLogger();

// API endpoint for client logs
// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const { logs } = await request.json();
  
  for (const log of logs) {
    logger[log.level as keyof typeof logger]({
      source: "client",
      ...log,
    });
  }
  
  return NextResponse.json({ received: logs.length });
}
```

## Variants

### JSON Logging for Cloud

```typescript
// lib/logger/cloud.ts
import pino from "pino";

export const cloudLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ severity: label.toUpperCase() }), // GCP format
  },
  messageKey: "message",
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});
```

### Log Sampling

```typescript
// lib/logger/sampling.ts
import { logger } from "./index";

// Sample high-volume logs
export function sampledLog(
  sampleRate: number,
  level: string,
  message: string,
  data?: object
) {
  if (Math.random() < sampleRate) {
    (logger as any)[level]({ ...data, sampled: true, sampleRate }, message);
  }
}

// Usage: log 10% of requests
sampledLog(0.1, "info", "Request processed", { endpoint: "/api/data" });
```

## Anti-patterns

### Logging Sensitive Data

```typescript
// BAD: Logging passwords and tokens
logger.info({ password: user.password, token: session.token });

// GOOD: Redact sensitive fields
logger.info({
  email: user.email,
  password: "[REDACTED]",
  token: token.slice(0, 8) + "...",
});
```

### Unstructured Logs

```typescript
// BAD: String concatenation
console.log("User " + userId + " created order " + orderId);

// GOOD: Structured logging
logger.info({ userId, orderId }, "User created order");
```

## Related Skills

- `error-tracking` - Error monitoring
- `tracing` - Distributed tracing
- `metrics` - Application metrics

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Pino
