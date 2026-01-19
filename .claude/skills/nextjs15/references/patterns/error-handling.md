---
id: pt-error-handling
name: Error Handling
version: 2.0.0
layer: L5
category: errors
description: Comprehensive error handling with error boundaries, recovery, and logging
tags: [errors, error-boundary, recovery, logging, next15]
composes:
  - ../atoms/input-button.md
  - ../atoms/feedback-alert.md
dependencies: []
formula: error.tsx + global-error.tsx + Custom Error Classes + Error Logging = Comprehensive Error Strategy
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

- Setting up route-level error handling with error.tsx
- Implementing global error catching with global-error.tsx
- Creating type-safe server action error responses
- Building API route error handling with proper status codes
- Integrating error logging and monitoring services

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Next.js Error Handling Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ global-error.tsx │    │ Sentry/Analytics │              │
│  │ (Root fallback)  │───▶│ Error Reporting  │              │
│  └────────┬─────────┘    └──────────────────┘              │
│           │                                                 │
│  ┌────────▼─────────┐                                      │
│  │ app/error.tsx    │                                      │
│  │ (App fallback)   │                                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│  ┌────────▼──────────────────────────────────────────┐     │
│  │ Route Segment error.tsx files                     │     │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────────┐ │     │
│  │ │ dashboard/ │ │ settings/  │ │ checkout/      │ │     │
│  │ │ error.tsx  │ │ error.tsx  │ │ error.tsx      │ │     │
│  │ └────────────┘ └────────────┘ └────────────────┘ │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Error Handling

## Overview

Next.js 15 provides built-in error handling through the `error.tsx` file convention for route segments, plus global error handling with `global-error.tsx`. This pattern covers error boundaries, recovery strategies, and error logging.

## Route Error Boundary

```typescript
// app/dashboard/error.tsx
"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Dashboard error:", error);
    
    // Send to error tracking (e.g., Sentry)
    // captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Something went wrong!</h2>
      </div>
      
      <p className="text-muted-foreground max-w-md text-center">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      
      <div className="flex gap-2">
        <Button onClick={reset} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button onClick={() => window.location.href = "/"} variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}
```

## Global Error Boundary

```typescript
// app/global-error.tsx
"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to external service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md text-center space-y-4 p-8">
            <h1 className="text-4xl font-bold">Oops!</h1>
            <p className="text-muted-foreground">
              Something went wrong. We've been notified and are working on it.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

## Nested Error Boundaries

```typescript
// Fine-grained error handling
// app/dashboard/
// ├── error.tsx           (catches errors from all dashboard routes)
// ├── page.tsx
// ├── analytics/
// │   ├── error.tsx       (catches only analytics errors)
// │   └── page.tsx
// └── settings/
//     ├── error.tsx       (catches only settings errors)
//     └── page.tsx

// app/dashboard/analytics/error.tsx
"use client";

export default function AnalyticsError({ error, reset }) {
  return (
    <div className="p-4 border border-destructive rounded-lg">
      <h3 className="font-semibold text-destructive">
        Analytics failed to load
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        {error.message}
      </p>
      <button onClick={reset} className="mt-4 text-sm underline">
        Retry
      </button>
    </div>
  );
}
```

## Error Recovery with React Error Boundary

```typescript
// components/error-boundary.tsx
"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border rounded-lg">
          <p className="text-destructive font-medium">
            Component Error
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {this.state.error?.message}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary
  fallback={<div>Widget failed to load</div>}
  onError={(error) => logError(error)}
>
  <UnstableWidget />
</ErrorBoundary>
```

## Server Action Error Handling

```typescript
// app/actions/posts.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; field?: string };

export async function createPost(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const rawData = {
      title: formData.get("title"),
      content: formData.get("content"),
    };

    const parsed = createPostSchema.safeParse(rawData);
    
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path[0] as string,
      };
    }

    const post = await prisma.post.create({
      data: parsed.data,
    });

    revalidatePath("/posts");
    
    return { success: true, data: { id: post.id } };
  } catch (error) {
    console.error("Failed to create post:", error);
    
    // Check for specific database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "A post with this title already exists" };
      }
    }
    
    return { success: false, error: "Failed to create post. Please try again." };
  }
}

// Client usage
"use client";

import { createPost, type ActionResult } from "@/app/actions/posts";
import { toast } from "sonner";

function CreatePostForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await createPost(formData);
    
    if (result.success) {
      toast.success("Post created!");
    } else {
      toast.error(result.error);
    }
  };

  return <form action={handleSubmit}>{/* ... */}</form>;
}
```

## API Route Error Handling

```typescript
// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: parsed.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        ...parsed.data,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    
    // Database constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Duplicate entry" },
          { status: 409 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Not Found Handling

```typescript
// app/posts/[id]/page.tsx
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound(); // Triggers closest not-found.tsx
  }

  return <PostContent post={post} />;
}

// app/posts/[id]/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PostNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-2xl font-bold">Post Not Found</h2>
      <p className="text-muted-foreground">
        The post you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/posts">View all posts</Link>
      </Button>
    </div>
  );
}
```

## Error Logging Service

```typescript
// lib/error-logging.ts
import * as Sentry from "@sentry/nextjs";

interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export function logError(error: Error, context?: ErrorContext) {
  console.error(error);

  if (process.env.NODE_ENV === "production") {
    Sentry.withScope((scope) => {
      if (context?.userId) {
        scope.setUser({ id: context.userId });
      }
      if (context?.action) {
        scope.setTag("action", context.action);
      }
      if (context?.metadata) {
        scope.setContext("metadata", context.metadata);
      }
      Sentry.captureException(error);
    });
  }
}

export function logMessage(message: string, level: "info" | "warning" = "info") {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureMessage(message, level);
  }
}

// Usage in error boundary
useEffect(() => {
  logError(error, {
    action: "dashboard-load",
    metadata: { route: pathname },
  });
}, [error]);
```

## Custom Error Classes

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Permission denied") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

// Usage
if (!post) {
  throw new NotFoundError("Post");
}

if (!session) {
  throw new AuthenticationError();
}

if (post.authorId !== session.user.id) {
  throw new AuthorizationError("You can only edit your own posts");
}
```

## Anti-patterns

### Don't Expose Internal Errors

```typescript
// BAD - Exposing internal details
return NextResponse.json(
  { error: error.message, stack: error.stack },
  { status: 500 }
);

// GOOD - Generic message, log internally
console.error(error);
return NextResponse.json(
  { error: "An unexpected error occurred" },
  { status: 500 }
);
```

### Don't Forget Error Boundaries

```typescript
// BAD - No error handling
<SuspenseComponent />

// GOOD - Wrapped with error boundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<Loading />}>
    <SuspenseComponent />
  </Suspense>
</ErrorBoundary>
```

## Related Skills

- [streaming](./streaming.md)
- [server-actions](./server-actions.md)
- [observability](./observability.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Route error boundaries
- Custom error classes
- Error logging
