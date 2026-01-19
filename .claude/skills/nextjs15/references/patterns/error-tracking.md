---
id: pt-error-tracking
name: Error Tracking
version: 2.0.0
layer: L5
category: observability
description: Capture, aggregate, and alert on application errors
tags: [observability, errors, sentry, monitoring, debugging]
composes: []
dependencies:
  @sentry/nextjs: "^8.42.0"
formula: error capture + grouping + context enrichment + alerts = proactive error resolution
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Error Tracking

Capture, aggregate, and receive alerts for application errors to improve reliability and debugging.

## When to Use

- Production applications requiring visibility into runtime errors
- Teams needing error grouping and deduplication
- Applications where error context and stack traces are critical
- Release tracking to correlate errors with deployments
- User feedback collection for error context

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|  Error Sources    |---->| pt-error-tracking |---->|   Error Backend   |
| (Client/Server)   |     |     (Sentry)      |     |  (Sentry Cloud)   |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|  Error Boundary   |     |  Enrichment       |     |   pt-alerting     |
|  (React)          |     | (User/Context)    |     | (Slack/PagerDuty) |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|   pt-logging      |     |  Fingerprinting   |     |  User Feedback    |
| (Error Context)   |     |   & Grouping      |     |   Collection      |
+-------------------+     +-------------------+     +-------------------+
        |
        v
+-------------------+
|   pt-tracing      |
| (Error Spans)     |
+-------------------+
```

## Overview

Error tracking provides:
- Automatic error capture
- Stack trace analysis
- Error grouping and deduplication
- Alerting and notifications
- Release tracking

## Implementation

### Sentry Setup

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Filtering
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    // Network errors
    /Failed to fetch/,
    /NetworkError/,
    // User-caused errors
    /AbortError/,
  ],
  
  // Enrichment
  beforeSend(event, hint) {
    // Filter out non-app errors
    if (event.exception?.values?.[0]?.stacktrace?.frames) {
      const isAppError = event.exception.values[0].stacktrace.frames.some(
        (frame) => frame.filename?.includes("/_next/")
      );
      if (!isAppError) return null;
    }
    
    return event;
  },
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});

// sentry.edge.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  environment: process.env.NODE_ENV,
});
```

### Next.js Configuration

```typescript
// next.config.ts
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your Next.js config
};

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Upload source maps
  silent: true,
  widenClientFileUpload: true,
  
  // Performance
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
});
```

### Manual Error Capture

```typescript
// lib/errors/capture.ts
import * as Sentry from "@sentry/nextjs";

interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export function captureError(error: Error, context?: ErrorContext) {
  Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context?.action) {
      scope.setTag("action", context.action);
    }
    
    if (context?.metadata) {
      scope.setExtras(context.metadata);
    }
    
    Sentry.captureException(error);
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureMessage(message, level);
  });
}

// Usage in server actions
// app/actions/orders.ts
"use server";

import { captureError } from "@/lib/errors/capture";

export async function createOrder(formData: FormData) {
  try {
    const order = await prisma.order.create({
      data: { /* ... */ },
    });
    return { success: true, order };
  } catch (error) {
    captureError(error as Error, {
      userId: session?.userId,
      action: "createOrder",
      metadata: {
        formData: Object.fromEntries(formData),
      },
    });
    
    return { success: false, error: "Failed to create order" };
  }
}
```

### Error Boundary with Reporting

```typescript
// components/error-boundary.tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: true,
        digest: error.digest,
      },
    });
  }, [error]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">
        We've been notified and are working on a fix.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh page
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto max-w-full">
          {error.message}
          {error.stack}
        </pre>
      )}
    </div>
  );
}

// app/error.tsx
export { default } from "@/components/error-boundary";

// app/global-error.tsx (for root layout errors)
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

### API Route Error Handling

```typescript
// lib/api/with-error-handling.ts
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function withErrorHandling(
  handler: (req: NextRequest, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
      
      // Handle known errors
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            requestId,
          },
          { status: error.statusCode }
        );
      }
      
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors,
            requestId,
          },
          { status: 400 }
        );
      }
      
      // Log and report unknown errors
      console.error("Unhandled error:", error);
      
      Sentry.withScope((scope) => {
        scope.setTag("requestId", requestId);
        scope.setExtras({
          method: req.method,
          url: req.url,
        });
        Sentry.captureException(error);
      });
      
      return NextResponse.json(
        {
          error: "Internal server error",
          requestId,
        },
        { status: 500 }
      );
    }
  };
}

// Usage
// app/api/orders/route.ts
import { withErrorHandling, AppError } from "@/lib/api/with-error-handling";

export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  
  if (!body.items?.length) {
    throw new AppError("Order must have items", 400, "EMPTY_ORDER");
  }
  
  const order = await createOrder(body);
  return NextResponse.json(order);
});
```

### User Feedback Collection

```typescript
// components/error-feedback.tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ErrorFeedbackProps {
  eventId: string;
}

export function ErrorFeedback({ eventId }: ErrorFeedbackProps) {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async () => {
    Sentry.captureFeedback({
      event_id: eventId,
      message: feedback,
    });
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        Thank you for your feedback!
      </p>
    );
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="What were you trying to do when this happened?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={!feedback.trim()}>
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Usage in error boundary
export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const [eventId, setEventId] = useState<string>();
  
  useEffect(() => {
    const id = Sentry.captureException(error);
    setEventId(id);
  }, [error]);
  
  return (
    <div>
      <h2>Something went wrong</h2>
      {eventId && <ErrorFeedback eventId={eventId} />}
    </div>
  );
}
```

### Custom Error Grouping

```typescript
// sentry.client.config.ts
Sentry.init({
  // ...
  beforeSend(event, hint) {
    // Custom fingerprinting for better grouping
    if (event.exception?.values?.[0]) {
      const error = event.exception.values[0];
      
      // Group by error message pattern
      if (error.value?.includes("timeout")) {
        event.fingerprint = ["timeout-error"];
      }
      
      // Group by API endpoint
      if (error.value?.includes("/api/")) {
        const match = error.value.match(/\/api\/[a-z-]+/);
        if (match) {
          event.fingerprint = ["api-error", match[0]];
        }
      }
    }
    
    return event;
  },
});
```

### Release Health Tracking

```typescript
// lib/errors/release.ts
import * as Sentry from "@sentry/nextjs";

// Track session for release health
export function initializeSession() {
  if (typeof window !== "undefined") {
    // Start session
    Sentry.startSession();
    
    // End session on page unload
    window.addEventListener("beforeunload", () => {
      Sentry.endSession();
    });
  }
}

// Mark successful interactions
export function markHealthy() {
  Sentry.setTag("session.status", "healthy");
}

// Mark errors that affect user experience
export function markUnhealthy(error: Error) {
  Sentry.setTag("session.status", "errored");
  Sentry.captureException(error);
}

// Usage in app
// app/layout.tsx
"use client";

import { useEffect } from "react";
import { initializeSession } from "@/lib/errors/release";

export function SessionTracker() {
  useEffect(() => {
    initializeSession();
  }, []);
  
  return null;
}
```

## Variants

### Lightweight Error Tracking (No SDK)

```typescript
// lib/errors/lightweight.ts
interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

export async function reportError(
  error: Error,
  metadata?: Record<string, unknown>
) {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    metadata,
  };
  
  try {
    await fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      keepalive: true,
    });
  } catch {
    // Silently fail
  }
}

// app/api/errors/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const report = await request.json();
  
  // Store in database
  await prisma.errorReport.create({
    data: report,
  });
  
  // Or send to logging service
  console.error("Error report:", report);
  
  return NextResponse.json({ received: true });
}
```

## Anti-patterns

### Catching and Swallowing Errors

```typescript
// BAD: Error is lost
try {
  await riskyOperation();
} catch (error) {
  console.log("Something went wrong"); // No tracking!
}

// GOOD: Capture and handle
try {
  await riskyOperation();
} catch (error) {
  captureError(error as Error, { action: "riskyOperation" });
  throw error; // Re-throw or handle appropriately
}
```

### Over-Reporting

```typescript
// BAD: Reporting expected errors
try {
  const data = await fetchOptionalData();
} catch (error) {
  Sentry.captureException(error); // Don't report 404s for optional data
}

// GOOD: Only report unexpected errors
try {
  const data = await fetchOptionalData();
} catch (error) {
  if (error.status !== 404) {
    Sentry.captureException(error);
  }
}
```

## Related Skills

- `error-handling` - Error handling patterns
- `logging` - Structured logging
- `tracing` - Distributed tracing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Sentry
