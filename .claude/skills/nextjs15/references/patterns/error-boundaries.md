---
id: pt-error-boundaries
name: Error Boundaries Pattern
version: 2.0.0
layer: L5
category: errors
description: React Error Boundaries for graceful error handling in Next.js 15 applications
tags: [errors, error-boundary, react, fallback-ui]
composes:
  - ../atoms/input-button.md
  - ../atoms/feedback-alert.md
dependencies: []
formula: ErrorBoundary + FallbackUI + ErrorReporting = Resilient Component Tree
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

- Wrapping components that may throw errors during rendering
- Isolating failures in non-critical UI sections
- Providing recovery options without full page reload
- Tracking and reporting client-side errors
- Creating graceful degradation for feature sections

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ ErrorBoundary                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ componentDidCatch → Error Reporting Service             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                           │                                 │
│              ┌────────────┴────────────┐                   │
│              ▼                         ▼                   │
│    ┌─────────────────┐      ┌─────────────────────┐       │
│    │ Children (OK)   │      │ FallbackUI (Error)  │       │
│    │ Normal render   │      │ ┌─────────────────┐ │       │
│    └─────────────────┘      │ │ Error message   │ │       │
│                             │ │ Retry button    │ │       │
│                             │ └─────────────────┘ │       │
│                             └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

# Error Boundaries Pattern

## Overview

React Error Boundaries for graceful error handling in Next.js 15 applications. Catch JavaScript errors in component trees, log them, and display fallback UI instead of crashing the entire application.

## Implementation

### Basic Error Boundary Component

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={this.handleReset}
              variant="outline"
              className="mt-4"
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Boundary with React 19 Features

```typescript
// components/error-boundary-modern.tsx
'use client';

import { Component, ReactNode, startTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback: ReactNode | ((props: FallbackProps) => ReactNode);
}

interface FallbackProps {
  error: Error;
  reset: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<
  Props & { onReset?: () => void },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      
      if (typeof fallback === 'function') {
        return fallback({ error: this.state.error, reset: this.reset });
      }
      
      return fallback;
    }

    return this.props.children;
  }
}

// Wrapper hook for router reset
export function ErrorBoundary({ children, fallback }: Props) {
  const router = useRouter();

  const handleReset = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <ErrorBoundaryClass fallback={fallback} onReset={handleReset}>
      {children}
    </ErrorBoundaryClass>
  );
}
```

### Specialized Error Boundaries

```typescript
// components/boundaries/async-error-boundary.tsx
'use client';

import { Component, ReactNode, Suspense } from 'react';
import { ErrorBoundary } from './error-boundary';

interface AsyncBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  errorFallback: ReactNode;
  onError?: (error: Error) => void;
}

export function AsyncBoundary({
  children,
  fallback,
  errorFallback,
  onError,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// Usage
export function ProductSection() {
  return (
    <AsyncBoundary
      fallback={<ProductSkeleton />}
      errorFallback={<ProductError />}
      onError={(error) => reportError(error)}
    >
      <ProductList />
    </AsyncBoundary>
  );
}
```

```typescript
// components/boundaries/query-error-boundary.tsx
'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './error-boundary';
import { Button } from '@/components/ui/button';

interface QueryBoundaryProps {
  children: React.ReactNode;
}

export function QueryErrorBoundary({ children }: QueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={
            <div className="p-4 text-center">
              <p className="text-red-600">Failed to load data</p>
              <Button onClick={reset} className="mt-2">
                Retry
              </Button>
            </div>
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

### Granular Error Boundaries

```typescript
// components/boundaries/feature-boundary.tsx
'use client';

import { ErrorBoundary } from './error-boundary';
import { AlertTriangle } from 'lucide-react';

interface FeatureBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  critical?: boolean;
}

export function FeatureBoundary({
  children,
  featureName,
  critical = false,
}: FeatureBoundaryProps) {
  const handleError = (error: Error) => {
    // Track feature-specific errors
    console.error(`Error in ${featureName}:`, error);
    
    // Report to analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'feature_error', {
        feature_name: featureName,
        error_message: error.message,
        critical,
      });
    }
  };

  if (critical) {
    // Critical features throw to parent boundary
    return <>{children}</>;
  }

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {featureName} is temporarily unavailable
            </span>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Usage in layout
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3">
        <FeatureBoundary featureName="Navigation">
          <Navigation />
        </FeatureBoundary>
      </aside>
      
      <main className="col-span-6">
        <FeatureBoundary featureName="Main Content" critical>
          {children}
        </FeatureBoundary>
      </main>
      
      <aside className="col-span-3">
        <FeatureBoundary featureName="Widgets">
          <Widgets />
        </FeatureBoundary>
      </aside>
    </div>
  );
}
```

### Error Boundary with Retry Logic

```typescript
// components/boundaries/retry-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface RetryBoundaryProps {
  children: ReactNode;
  maxRetries?: number;
  onExhausted?: (error: Error) => void;
}

interface RetryBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class RetryBoundary extends Component<
  RetryBoundaryProps,
  RetryBoundaryState
> {
  static defaultProps = {
    maxRetries: 3,
  };

  state: RetryBoundaryState = {
    hasError: false,
    error: null,
    retryCount: 0,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    const { maxRetries = 3, onExhausted } = this.props;
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount >= maxRetries) {
      onExhausted?.(this.state.error!);
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      retryCount: newRetryCount,
    });
  };

  render() {
    const { maxRetries = 3 } = this.props;
    const { hasError, error, retryCount } = this.state;

    if (hasError) {
      const retriesLeft = maxRetries - retryCount;

      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-600">{error?.message}</p>
          
          {retriesLeft > 0 ? (
            <div className="mt-4">
              <Button onClick={this.handleRetry} variant="destructive">
                Retry ({retriesLeft} attempts remaining)
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-red-700">
              Maximum retries exceeded. Please refresh the page.
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Boundary with Error Reporting

```typescript
// components/boundaries/reporting-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface ReportingBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  tags?: Record<string, string>;
}

interface State {
  hasError: boolean;
  eventId: string | null;
}

export class ReportingBoundary extends Component<ReportingBoundaryProps, State> {
  state: State = { hasError: false, eventId: null };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { tags = {} } = this.props;

    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras({
        componentStack: errorInfo.componentStack,
      });

      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });

      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          {this.props.fallback}
          {this.state.eventId && (
            <button
              onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId! })}
              className="mt-4 text-sm text-blue-600 underline"
            >
              Report feedback
            </button>
          )}
        </>
      );
    }

    return this.props.children;
  }
}
```

### Composable Error Boundaries

```typescript
// lib/error-boundary-utils.tsx
'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

type ErrorFallbackComponent = (props: {
  error: Error;
  reset: () => void;
}) => ReactNode;

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback: ReactNode | ErrorFallbackComponent
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

// Usage
const SafeProductCard = withErrorBoundary(ProductCard, (
  <div className="p-4 text-gray-500">Product unavailable</div>
));

// Or with reset function
const SafeCheckout = withErrorBoundary(Checkout, ({ error, reset }) => (
  <div className="p-4">
    <p className="text-red-600">{error.message}</p>
    <button onClick={reset}>Try again</button>
  </div>
));
```

## Variants

### With Local Storage Recovery

```typescript
// components/boundaries/recovery-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface RecoveryBoundaryProps {
  children: ReactNode;
  storageKey: string;
}

interface State {
  hasError: boolean;
}

export class RecoveryBoundary extends Component<RecoveryBoundaryProps, State> {
  state = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Save current state for recovery
    const { storageKey } = this.props;
    const savedState = localStorage.getItem(storageKey);
    
    if (savedState) {
      localStorage.setItem(`${storageKey}_backup`, savedState);
    }

    console.error('Error caught, state backed up:', error);
  }

  handleRecover = () => {
    const { storageKey } = this.props;
    const backup = localStorage.getItem(`${storageKey}_backup`);
    
    if (backup) {
      localStorage.setItem(storageKey, backup);
    }
    
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <p>Something went wrong</p>
          <button onClick={this.handleRecover}>
            Recover from backup
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Anti-patterns

```typescript
// BAD: Catching errors too broadly
<ErrorBoundary>
  <EntireApp /> {/* One error breaks everything */}
</ErrorBoundary>

// GOOD: Granular error boundaries
<ErrorBoundary>
  <Header />
</ErrorBoundary>
<ErrorBoundary>
  <MainContent />
</ErrorBoundary>
<ErrorBoundary>
  <Sidebar />
</ErrorBoundary>

// BAD: No error reporting
componentDidCatch(error) {
  this.setState({ hasError: true });
  // Error is lost!
}

// GOOD: Report errors
componentDidCatch(error, errorInfo) {
  Sentry.captureException(error, { extra: errorInfo });
  this.setState({ hasError: true });
}

// BAD: Error boundary for event handlers (doesn't work)
<ErrorBoundary>
  <button onClick={() => { throw new Error('Click error'); }}>
    Click me
  </button>
</ErrorBoundary>

// GOOD: Handle event errors explicitly
<button onClick={() => {
  try {
    riskyOperation();
  } catch (error) {
    handleError(error);
  }
}}>
  Click me
</button>
```

## Related Patterns

- `global-error.md` - App-level error handling
- `error-recovery.md` - Error recovery strategies
- `fallback-ui.md` - Fallback UI patterns
- `error-reporting.md` - Error reporting services

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial error boundaries pattern
