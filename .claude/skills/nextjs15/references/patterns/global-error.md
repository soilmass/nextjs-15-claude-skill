---
id: pt-global-error
name: Global Error
version: 2.0.0
layer: L5
category: errors
description: App-level error handling in Next.js 15 using error.tsx and global-error.tsx files
tags: [errors, global, error]
composes:
  - ../atoms/input-button.md
  - ../atoms/feedback-alert.md
dependencies: []
formula: global-error.tsx + error.tsx + Error Tracking = Complete Error Coverage
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

- Catching root layout errors with global-error.tsx
- Creating route-specific error pages
- Implementing offline detection and handling
- Building recovery options for different error types
- Tracking and classifying errors for monitoring

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Global Error Boundary Hierarchy                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ global-error.tsx (catches root layout errors)      │    │
│  │ - Renders own <html> and <body>                    │    │
│  │ - Last resort error handler                        │    │
│  └─────────────────────────┬──────────────────────────┘    │
│                            │                                │
│  ┌─────────────────────────▼──────────────────────────┐    │
│  │ app/error.tsx (catches app-level errors)           │    │
│  │ - Nested inside root layout                        │    │
│  │ - Common error UI with navigation                  │    │
│  └─────────────────────────┬──────────────────────────┘    │
│                            │                                │
│  ┌─────────────────────────▼──────────────────────────┐    │
│  │ Route Segment error.tsx                            │    │
│  │ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │    │
│  │ │ /dashboard   │ │ /checkout    │ │ /settings   │ │    │
│  │ │ error.tsx    │ │ error.tsx    │ │ error.tsx   │ │    │
│  │ │              │ │              │ │             │ │    │
│  │ │ Context:     │ │ Context:     │ │ Context:    │ │    │
│  │ │ - Analytics  │ │ - Payment    │ │ - Form      │ │    │
│  │ │ - Widgets    │ │ - Inventory  │ │ - Prefs     │ │    │
│  │ └──────────────┘ └──────────────┘ └─────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Global Error Handling Pattern

## Overview

App-level error handling in Next.js 15 using `error.tsx` and `global-error.tsx` files. Provides consistent error handling across the application with proper error boundaries and recovery options.

## Implementation

### Root Global Error Handler

```typescript
// app/global-error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900">
                Something went wrong!
              </h1>
              
              <p className="mt-2 text-gray-600">
                We apologize for the inconvenience. Our team has been notified.
              </p>

              {error.digest && (
                <p className="mt-2 text-xs text-gray-400">
                  Error ID: {error.digest}
                </p>
              )}

              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={reset}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Try again
                </button>
                <a
                  href="/"
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  Go home
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### Route Segment Error Handler

```typescript
// app/dashboard/error.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to monitoring service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        
        <h2 className="mt-4 text-lg font-semibold">
          Dashboard Error
        </h2>
        
        <p className="mt-2 text-gray-600">
          {error.message || 'Failed to load dashboard'}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          
          <Button 
            onClick={() => router.push('/')} 
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Nested Error Boundaries

```typescript
// app/dashboard/settings/error.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Track settings-specific errors
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({
        page: 'settings',
        error: error.message,
        digest: error.digest,
      }),
    }).catch(console.error);
  }, [error]);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h3 className="text-lg font-medium text-red-800">
        Settings Error
      </h3>
      
      <p className="mt-2 text-red-600">
        Unable to load settings. Your changes may not have been saved.
      </p>

      <div className="mt-4 flex gap-3">
        <Button onClick={reset} size="sm">
          Retry
        </Button>
        
        <Button 
          onClick={() => setShowDetails(!showDetails)}
          variant="ghost"
          size="sm"
        >
          {showDetails ? 'Hide' : 'Show'} details
        </Button>
      </div>

      {showDetails && (
        <pre className="mt-4 overflow-auto rounded bg-red-100 p-3 text-xs text-red-800">
          {error.stack}
        </pre>
      )}
    </div>
  );
}
```

### Error Handler with Recovery Options

```typescript
// app/checkout/error.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type CheckoutErrorType = 
  | 'payment_failed'
  | 'inventory_error'
  | 'session_expired'
  | 'unknown';

function getErrorType(error: Error): CheckoutErrorType {
  if (error.message.includes('payment')) return 'payment_failed';
  if (error.message.includes('inventory')) return 'inventory_error';
  if (error.message.includes('session')) return 'session_expired';
  return 'unknown';
}

const errorMessages: Record<CheckoutErrorType, {
  title: string;
  description: string;
  action: string;
  actionLabel: string;
}> = {
  payment_failed: {
    title: 'Payment Failed',
    description: 'Your payment could not be processed. Please check your payment details.',
    action: '/checkout/payment',
    actionLabel: 'Update Payment',
  },
  inventory_error: {
    title: 'Item Unavailable',
    description: 'One or more items in your cart are no longer available.',
    action: '/cart',
    actionLabel: 'Review Cart',
  },
  session_expired: {
    title: 'Session Expired',
    description: 'Your checkout session has expired. Please try again.',
    action: '/checkout',
    actionLabel: 'Start Over',
  },
  unknown: {
    title: 'Checkout Error',
    description: 'Something went wrong during checkout. Please try again.',
    action: '/checkout',
    actionLabel: 'Try Again',
  },
};

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const errorType = getErrorType(error);
  const errorInfo = errorMessages[errorType];

  useEffect(() => {
    // Track checkout errors for analytics
    fetch('/api/analytics/checkout-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: errorType,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }, [error, errorType]);

  return (
    <div className="mx-auto max-w-md py-12">
      <Alert variant="destructive">
        <AlertTitle>{errorInfo.title}</AlertTitle>
        <AlertDescription>{errorInfo.description}</AlertDescription>
      </Alert>

      <div className="mt-6 flex flex-col gap-3">
        <Button
          onClick={() => router.push(errorInfo.action)}
          className="w-full"
        >
          {errorInfo.actionLabel}
        </Button>
        
        <Button
          onClick={reset}
          variant="outline"
          className="w-full"
        >
          Retry
        </Button>
        
        <Button
          onClick={() => router.push('/support')}
          variant="ghost"
          className="w-full"
        >
          Contact Support
        </Button>
      </div>

      {error.digest && (
        <p className="mt-4 text-center text-xs text-gray-500">
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
```

### Error Handler with Offline Detection

```typescript
// app/error.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <WifiOff className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold">You're offline</h2>
          <p className="mt-2 text-gray-600">
            Please check your internet connection and try again.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-6"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-gray-600">{error.message}</p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
```

### API Route Error Handling

```typescript
// app/api/[...]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A record with this value already exists' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
  }

  // Generic error
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}

// Usage in route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... handle request
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Server Action Error Handling

```typescript
// app/actions/with-error-handling.ts
'use server';

import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export async function safeAction<T>(
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    Sentry.captureException(error);

    if (error instanceof Error) {
      return { 
        success: false, 
        error: error.message,
        code: (error as any).code,
      };
    }

    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Usage
export async function createPost(formData: FormData) {
  return safeAction(async () => {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    const post = await prisma.post.create({
      data: { title, content },
    });

    return post;
  });
}
```

## Variants

### With Error Classification

```typescript
// lib/errors.ts
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL = 'INTERNAL',
}

export class ClassifiedError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number,
    public retryable: boolean = false
  ) {
    super(message);
  }
}

// app/error.tsx
export default function Error({ error, reset }) {
  const isRetryable = (error as any).retryable ?? true;
  
  return (
    <div>
      <p>{error.message}</p>
      {isRetryable && <Button onClick={reset}>Retry</Button>}
    </div>
  );
}
```

## Anti-patterns

```typescript
// BAD: No error.tsx in important routes
// Users see generic error or white screen

// GOOD: Add error.tsx to all major route segments
app/
├── error.tsx           # Root fallback
├── dashboard/
│   └── error.tsx       # Dashboard-specific
├── checkout/
│   └── error.tsx       # Checkout-specific

// BAD: Exposing internal errors
<p>{error.stack}</p> // Security risk!

// GOOD: Show user-friendly messages
<p>{getUserFriendlyMessage(error)}</p>

// BAD: No error tracking
export default function Error({ error }) {
  return <div>Error</div>; // Error is lost!
}

// GOOD: Track all errors
useEffect(() => {
  Sentry.captureException(error);
}, [error]);
```

## Related Patterns

- `error-boundaries.md` - React error boundaries
- `not-found.md` - 404 handling
- `error-recovery.md` - Recovery strategies
- `error-reporting.md` - Error tracking services

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial global error handling pattern
