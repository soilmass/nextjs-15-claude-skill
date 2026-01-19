---
id: m-error-boundary
name: Error Boundary
version: 2.0.0
layer: L2
category: state
description: React error boundary with fallback UI and retry functionality
tags: [error, boundary, fallback, recovery, crash]
formula: "ErrorBoundary = ErrorIcon(a-display-icon) + ErrorMessage(a-display-text) + RetryButton(a-input-button)"
composes:
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
  - ../atoms/input-button.md
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Error Boundary

## Overview

The Error Boundary molecule catches JavaScript errors in child components and displays a fallback UI with retry functionality. Essential for graceful error handling and recovery in production applications.

## When to Use

Use this skill when:
- Wrapping sections that might throw errors
- Providing graceful degradation for widgets
- Catching async/data fetching errors
- Isolating failures to prevent full page crashes

## Composition Diagram

```
Normal State (no error):
┌─────────────────────────────────────────────────────────────────┐
│                       ErrorBoundary                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Children (passed through)              │  │
│  │                                                           │  │
│  │               [ Your component content ]                  │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Error State (fallback UI):
┌─────────────────────────────────────────────────────────────────┐
│                       ErrorBoundary                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Error Icon (a-display-icon)              │  │
│  │                          ⚠️                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                Error Message (a-display-text)             │  │
│  │                                                           │  │
│  │              "Something went wrong"                       │  │
│  │              "An error occurred loading this section"     │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                Retry Button (a-input-button)              │  │
│  │                                                           │  │
│  │                     [ Try Again ]                         │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [display-icon](../atoms/display-icon.md) - Error icons
- [display-text](../atoms/display-text.md) - Error messages
- [input-button](../atoms/input-button.md) - Retry button
- [feedback-alert](../atoms/feedback-alert.md) - Error styling

## Implementation

```typescript
// components/ui/error-boundary.tsx
"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback component */
  fallback?: React.ReactNode | ((props: { error: Error; reset: () => void }) => React.ReactNode);
  /** Error handler callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Key to reset the boundary */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error } = this.state;

      if (typeof fallback === "function") {
        return fallback({ error: error!, reset: this.reset });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback error={error!} reset={this.reset} />
      );
    }

    return this.props.children;
  }
}

// Default fallback component
interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "An error occurred while rendering this component.",
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-destructive/50 bg-destructive/5"
    >
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-destructive mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="text-xs text-left bg-muted p-3 rounded mb-4 max-w-md overflow-auto">
          {error.message}
        </pre>
      )}
      <Button onClick={reset} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
```

```typescript
// components/ui/query-error-boundary.tsx
"use client";

import * as React from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, ErrorFallback } from "./error-boundary";

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((props: { error: Error; reset: () => void }) => React.ReactNode);
}

export function QueryErrorBoundary({
  children,
  fallback,
}: QueryErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={fallback || ((props) => (
        <ErrorFallback
          error={props.error}
          reset={() => {
            reset();
            props.reset();
          }}
        />
      ))}
    >
      {children}
    </ErrorBoundary>
  );
}
```

```typescript
// components/ui/async-boundary.tsx
"use client";

import * as React from "react";
import { ErrorBoundary, ErrorFallback } from "./error-boundary";
import { Skeleton } from "./skeleton";

interface AsyncBoundaryProps {
  children: React.ReactNode;
  /** Loading fallback */
  loading?: React.ReactNode;
  /** Error fallback */
  error?: React.ReactNode | ((props: { error: Error; reset: () => void }) => React.ReactNode);
}

export function AsyncBoundary({
  children,
  loading,
  error,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={error}>
      <React.Suspense fallback={loading || <DefaultLoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}

function DefaultLoadingFallback() {
  return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-4 w-[60%]" />
      <Skeleton className="h-4 w-[70%]" />
    </div>
  );
}
```

### Key Implementation Notes

1. **Class Component**: Error boundaries must be class components (React limitation)
2. **Reset Key**: Use `resetKey` prop to reset boundary when route/state changes

## Variants

### Default Error Boundary

```tsx
<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

### Custom Fallback

```tsx
<ErrorBoundary
  fallback={
    <div className="p-4 text-center">
      <p>Widget failed to load</p>
    </div>
  }
>
  <Widget />
</ErrorBoundary>
```

### Render Prop Fallback

```tsx
<ErrorBoundary
  fallback={({ error, reset }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
>
  <Component />
</ErrorBoundary>
```

### With Error Reporting

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error tracking service
    Sentry.captureException(error, { extra: errorInfo });
  }}
>
  <App />
</ErrorBoundary>
```

### Reset on Route Change

```tsx
const pathname = usePathname();

<ErrorBoundary resetKey={pathname}>
  <PageContent />
</ErrorBoundary>
```

### Async Boundary (Error + Suspense)

```tsx
<AsyncBoundary
  loading={<Skeleton className="h-[200px]" />}
  error={<ErrorFallback />}
>
  <AsyncComponent />
</AsyncBoundary>
```

## States

| State | Display | Actions |
|-------|---------|---------|
| Normal | children | - |
| Error (dev) | fallback + stack trace | retry |
| Error (prod) | fallback only | retry |
| After retry | children (if success) | - |
| After retry (fail) | fallback | retry |

## Accessibility

### Required ARIA Attributes

- `role="alert"` on error fallback
- Error message announced to screen readers

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus retry button |
| `Enter/Space` | Activate retry |

### Screen Reader Announcements

- Error title and description announced
- "Try again" button announced

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  },
  "optionalDependencies": {
    "@tanstack/react-query": "^5.0.0"
  }
}
```

### Installation

```bash
npm install lucide-react
```

## Examples

### Page-Level Boundary

```tsx
// app/dashboard/layout.tsx
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary
      fallback={({ reset }) => (
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
          <p className="text-muted-foreground mb-4">
            Failed to load the dashboard. Please try again.
          </p>
          <Button onClick={reset}>Reload Dashboard</Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Widget Isolation

```tsx
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <ErrorBoundary fallback={<WidgetError title="Revenue" />}>
        <RevenueWidget />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<WidgetError title="Users" />}>
        <UsersWidget />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<WidgetError title="Orders" />}>
        <OrdersWidget />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<WidgetError title="Traffic" />}>
        <TrafficWidget />
      </ErrorBoundary>
    </div>
  );
}

function WidgetError({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        Failed to load
      </CardContent>
    </Card>
  );
}
```

### With TanStack Query

```tsx
import { QueryErrorBoundary } from "@/components/ui/query-error-boundary";
import { Suspense } from "react";

export function DataSection() {
  return (
    <QueryErrorBoundary>
      <Suspense fallback={<DataSkeleton />}>
        <DataContent />
      </Suspense>
    </QueryErrorBoundary>
  );
}
```

### Full Page Error

```tsx
// app/error.tsx (Next.js error boundary)
"use client";

import { ErrorFallback } from "@/components/ui/error-boundary";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container py-16">
      <ErrorFallback
        error={error}
        reset={reset}
        title="Page Error"
        description="An error occurred while loading this page."
      />
    </div>
  );
}
```

## Anti-patterns

### Catching Errors Too High

```tsx
// Bad - one error breaks everything
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Good - isolate independent sections
<App>
  <ErrorBoundary>
    <Header />
  </ErrorBoundary>
  <ErrorBoundary>
    <MainContent />
  </ErrorBoundary>
  <ErrorBoundary>
    <Sidebar />
  </ErrorBoundary>
</App>
```

### No Reset Functionality

```tsx
// Bad - user is stuck
<ErrorBoundary fallback={<p>Error occurred</p>}>
  <Component />
</ErrorBoundary>

// Good - user can retry
<ErrorBoundary
  fallback={({ reset }) => (
    <div>
      <p>Error occurred</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  )}
>
  <Component />
</ErrorBoundary>
```

### Exposing Stack Traces in Production

```tsx
// Bad - security risk
<pre>{error.stack}</pre>

// Good - only in development
{process.env.NODE_ENV === "development" && (
  <pre>{error.stack}</pre>
)}
```

## Related Skills

### Composes From
- [atoms/feedback-alert](../atoms/feedback-alert.md) - Error styling
- [atoms/input-button](../atoms/input-button.md) - Retry button

### Composes Into
- [templates/error](../templates/error.md) - Error pages
- [patterns/error-handling](../patterns/error-handling.md) - Error patterns

### Alternatives
- Try/catch - For sync error handling
- `.catch()` - For promise error handling
- Next.js error.tsx - For route-level errors

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- ErrorFallback component
- QueryErrorBoundary for TanStack Query
- AsyncBoundary for Error + Suspense
