---
id: pt-error-reporting
name: Error Reporting Pattern
version: 2.0.0
layer: L5
category: observability
description: Client-side and server-side error reporting for Next.js 15 applications with Sentry integration
tags: [errors, reporting, sentry, monitoring, observability]
composes: []
dependencies:
  @sentry/nextjs: "^8.42.0"
formula: error capture + breadcrumbs + session replay + notifications = comprehensive error visibility
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Error Reporting Pattern

## When to Use

- Applications requiring custom error reporting beyond SDK defaults
- React Query or SWR error handling with analytics
- Server Actions needing wrapped error reporting
- Performance monitoring with error correlation
- User feedback collection for error context

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|  Error Sources    |---->| pt-error-reporting|---->|   /api/errors     |
|(Global/Component) |     |  (Custom Client)  |     |   (Storage)       |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|  React Query      |     |   Breadcrumbs     |     |   pt-alerting     |
|  Error Handler    |     |    Collection     |     | (Fatal Alerts)    |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
| pt-error-tracking |     |  Performance      |     |  User Feedback    |
|  (Sentry SDK)     |     |  Observers        |     |    Dialog         |
+-------------------+     +-------------------+     +-------------------+
        |
        v
+-------------------+
|   pt-logging      |
| (Server Logs)     |
+-------------------+
```

## Overview

Client-side and server-side error reporting for Next.js 15 applications. Integrates with Sentry, LogRocket, and custom error tracking services for comprehensive error monitoring.

## Implementation

### Sentry Integration Setup

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Filter events
  beforeSend(event, hint) {
    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry event:', event);
      return null;
    }

    // Filter out known non-issues
    const error = hint.originalException;
    if (error instanceof Error) {
      if (error.message.includes('ResizeObserver')) {
        return null;
      }
      if (error.message.includes('Loading chunk')) {
        return null; // Chunk loading errors during deployment
      }
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    'Load failed',
  ],
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Custom Error Reporter

```typescript
// lib/error-reporter.ts
type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

type ErrorContext = {
  userId?: string;
  email?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, unknown>;
};

interface ErrorReporter {
  captureError(error: Error, context?: ErrorContext): string;
  captureMessage(message: string, severity?: ErrorSeverity): void;
  setUser(user: { id: string; email?: string }): void;
  addBreadcrumb(message: string, category?: string): void;
}

class ErrorReporterImpl implements ErrorReporter {
  private breadcrumbs: Array<{ message: string; category: string; timestamp: number }> = [];
  private user: { id: string; email?: string } | null = null;

  captureError(error: Error, context?: ErrorContext): string {
    const errorId = this.generateErrorId();

    // Log locally
    console.error(`[${errorId}]`, error, context);

    // Send to backend
    this.sendToBackend({
      type: 'error',
      errorId,
      name: error.name,
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        user: this.user,
        breadcrumbs: this.breadcrumbs.slice(-10),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      timestamp: new Date().toISOString(),
    });

    return errorId;
  }

  captureMessage(message: string, severity: ErrorSeverity = 'info'): void {
    this.sendToBackend({
      type: 'message',
      message,
      severity,
      context: {
        user: this.user,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }

  setUser(user: { id: string; email?: string }): void {
    this.user = user;
  }

  addBreadcrumb(message: string, category: string = 'custom'): void {
    this.breadcrumbs.push({
      message,
      category,
      timestamp: Date.now(),
    });

    // Keep only last 50 breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private async sendToBackend(payload: unknown): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Silently fail - don't cause more errors
      console.warn('Failed to send error to backend');
    }
  }
}

export const errorReporter = new ErrorReporterImpl();
```

### Global Error Handler

```typescript
// lib/global-error-handler.ts
'use client';

import { errorReporter } from './error-reporter';

export function initGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return;

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    errorReporter.captureError(error, {
      action: 'unhandledrejection',
    });
  });

  // Global errors
  window.addEventListener('error', (event) => {
    // Ignore script errors from external sources
    if (event.message === 'Script error.' && !event.filename) {
      return;
    }

    const error = event.error instanceof Error
      ? event.error
      : new Error(event.message);

    errorReporter.captureError(error, {
      action: 'window.onerror',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Console error tracking
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    
    const message = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');
    
    errorReporter.addBreadcrumb(message, 'console.error');
  };
}
```

### Error Reporting API Route

```typescript
// app/api/errors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ErrorPayload = {
  type: 'error' | 'message';
  errorId?: string;
  name?: string;
  message: string;
  stack?: string;
  severity?: string;
  context?: Record<string, unknown>;
  timestamp: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload: ErrorPayload = await request.json();

    // Store in database
    await prisma.errorLog.create({
      data: {
        errorId: payload.errorId,
        type: payload.type,
        name: payload.name,
        message: payload.message,
        stack: payload.stack,
        severity: payload.severity ?? 'error',
        context: payload.context as any,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for'),
        timestamp: new Date(payload.timestamp),
      },
    });

    // Forward to external service if configured
    if (process.env.SENTRY_DSN) {
      await forwardToSentry(payload);
    }

    // Alert on critical errors
    if (payload.severity === 'fatal') {
      await sendSlackAlert(payload);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}

async function forwardToSentry(payload: ErrorPayload): Promise<void> {
  // Forward to Sentry via their API
  // This is useful for client-side errors that bypass the SDK
}

async function sendSlackAlert(payload: ErrorPayload): Promise<void> {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Fatal Error: ${payload.message}`,
      attachments: [
        {
          color: 'danger',
          fields: [
            { title: 'Error ID', value: payload.errorId, short: true },
            { title: 'Type', value: payload.name, short: true },
            { title: 'Stack', value: payload.stack?.slice(0, 500) },
          ],
        },
      ],
    }),
  });
}
```

### Error Boundary with Reporting

```typescript
// components/reporting-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { errorReporter } from '@/lib/error-reporter';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

export class ReportingErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorId: null };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('component', this.props.componentName ?? 'unknown');
      scope.setExtra('componentStack', errorInfo.componentStack);
      Sentry.captureException(error);
    });

    // Report to custom service
    const errorId = errorReporter.captureError(error, {
      action: 'react-error-boundary',
      metadata: {
        componentName: this.props.componentName,
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({ errorId });
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          {this.props.fallback}
          {this.state.errorId && (
            <p className="mt-2 text-xs text-gray-500">
              Error ID: {this.state.errorId}
            </p>
          )}
        </>
      );
    }

    return this.props.children;
  }
}
```

### Server Action Error Reporting

```typescript
// lib/action-error-reporter.ts
import * as Sentry from '@sentry/nextjs';
import { headers } from 'next/headers';

type ActionContext = {
  actionName: string;
  input?: unknown;
  userId?: string;
};

export async function reportActionError(
  error: Error,
  context: ActionContext
): Promise<string> {
  const headersList = await headers();
  const errorId = `action_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Capture with Sentry
  Sentry.withScope((scope) => {
    scope.setTag('type', 'server-action');
    scope.setTag('action', context.actionName);
    scope.setUser({ id: context.userId });
    scope.setExtra('input', context.input);
    scope.setExtra('headers', Object.fromEntries(headersList.entries()));
    Sentry.captureException(error);
  });

  // Log to database
  await logToDatabase({
    errorId,
    type: 'server-action',
    actionName: context.actionName,
    error: error.message,
    stack: error.stack,
    input: context.input,
    userId: context.userId,
    timestamp: new Date(),
  });

  return errorId;
}

// Wrapper for server actions
export function withErrorReporting<T extends (...args: any[]) => Promise<any>>(
  actionName: string,
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await action(...args);
    } catch (error) {
      const errorId = await reportActionError(error as Error, {
        actionName,
        input: args,
      });
      
      throw new Error(`Action failed (${errorId}): ${(error as Error).message}`);
    }
  }) as T;
}

// Usage
export const createPost = withErrorReporting('createPost', async (data: FormData) => {
  // Action implementation
});
```

### React Query Error Reporting

```typescript
// lib/query-error-handler.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { errorReporter } from './error-reporter';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only report errors that aren't handled by the component
      if (query.state.data !== undefined) {
        // Background refetch error - don't report
        return;
      }

      errorReporter.captureError(error as Error, {
        action: 'react-query',
        metadata: {
          queryKey: query.queryKey,
          queryHash: query.queryHash,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      errorReporter.captureError(error as Error, {
        action: 'react-query-mutation',
        metadata: {
          mutationKey: mutation.options.mutationKey,
          variables,
        },
      });
    },
  }),
});
```

### Performance Error Reporting

```typescript
// lib/performance-reporter.ts
export function initPerformanceReporting(): void {
  if (typeof window === 'undefined') return;

  // Long tasks
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          errorReporter.captureMessage(
            `Long task detected: ${entry.duration.toFixed(0)}ms`,
            'warning'
          );
        }
      }
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch {
      // Not supported
    }

    // Layout shifts
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { value: number };
        if (layoutShift.value > 0.1) {
          errorReporter.captureMessage(
            `Significant layout shift: ${layoutShift.value.toFixed(3)}`,
            'warning'
          );
        }
      }
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // Not supported
    }
  }

  // Memory warnings
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedPercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usedPercent > 0.9) {
        errorReporter.captureMessage(
          `High memory usage: ${(usedPercent * 100).toFixed(1)}%`,
          'warning'
        );
      }
    }, 30000);
  }
}
```

### User Feedback Collection

```typescript
// components/error-feedback-dialog.tsx
'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ErrorFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorId: string;
  eventId?: string;
}

export function ErrorFeedbackDialog({
  isOpen,
  onClose,
  errorId,
  eventId,
}: ErrorFeedbackDialogProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Submit to Sentry user feedback
      if (eventId) {
        Sentry.captureFeedback({
          message: feedback,
          associatedEventId: eventId,
        });
      }

      // Submit to our own API
      await fetch('/api/errors/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId,
          feedback,
          timestamp: new Date().toISOString(),
        }),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSubmitted ? 'Thank you!' : 'Help us fix this issue'}
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-4 text-center">
            <p className="text-gray-600">
              Your feedback has been submitted. We'll look into this issue.
            </p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              What were you trying to do when this error occurred?
            </p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="I was trying to..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!feedback.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Variants

### With Source Maps Upload

```typescript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

### With LogRocket Integration

```typescript
// lib/logrocket.ts
import LogRocket from 'logrocket';
import * as Sentry from '@sentry/nextjs';

export function initLogRocket() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;

  LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID!);

  // Link LogRocket sessions to Sentry
  LogRocket.getSessionURL((sessionURL) => {
    Sentry.configureScope((scope) => {
      scope.setExtra('logRocketSession', sessionURL);
    });
  });
}
```

## Anti-patterns

```typescript
// BAD: Catching and swallowing errors
try {
  await riskyOperation();
} catch {
  // Error is lost forever
}

// GOOD: Report before handling
try {
  await riskyOperation();
} catch (error) {
  errorReporter.captureError(error);
  showUserFriendlyMessage();
}

// BAD: Logging sensitive data
errorReporter.captureError(error, {
  metadata: { password: user.password }, // Security risk!
});

// GOOD: Sanitize sensitive data
errorReporter.captureError(error, {
  metadata: { userId: user.id }, // Only non-sensitive data
});

// BAD: No error context
Sentry.captureException(error); // No context about what happened

// GOOD: Rich context
Sentry.withScope((scope) => {
  scope.setTag('feature', 'checkout');
  scope.setExtra('cartItems', cart.items.length);
  Sentry.captureException(error);
});
```

## Related Patterns

- `error-boundaries.md` - React error boundaries
- `global-error.md` - Global error handling
- `logging.md` - Application logging
- `alerting.md` - Alert configuration

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial error reporting pattern
