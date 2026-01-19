---
id: t-500-page
name: 500 Error Page
version: 2.0.0
layer: L4
category: pages
description: Server error page with helpful messaging and recovery options
tags: [error, 500, server, crash, recovery]
performance:
  impact: medium
  lcp: medium
  cls: low
composes:
  - ../molecules/callout.md
  - ../atoms/input-button.md
formula: "500Page = ErrorIcon + ErrorMessage + Callout(m-callout) + ActionButtons(a-input-button) + TechnicalDetails + HelpLinks"
dependencies:
  - react
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# 500 Error Page

## Overview

A server error (500) page template with user-friendly messaging, error reporting option, and recovery actions. Designed to reduce user frustration and provide clear next steps.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       500 Page                              │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Error Icon                         │  │
│  │                  [Server Icon]                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Error Message                       │  │
│  │            "Something went wrong"                     │  │
│  │      "We're experiencing technical difficulties"     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Callout (m-callout)                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Error ID: ERR-XXXXX              [Copy Button]  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ [Try Again]         │  │ [Go Home]                   │  │
│  │ Button (a-input-btn)│  │ Button (a-input-button)     │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Technical Details (Collapsible)             │  │
│  │  ▼ Technical details                                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Error message and stack trace                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Help Links                         │  │
│  │    System status  •  Help center  •  Contact support  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// app/error.tsx (or app/500/page.tsx for static)
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

export default function Error500Page({ error, reset }: ErrorPageProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const errorId = error?.digest || `ERR-${Date.now().toString(36).toUpperCase()}`;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (reset) {
        reset();
      } else {
        window.location.reload();
      }
    } finally {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  const handleCopyError = async () => {
    const errorInfo = `
Error ID: ${errorId}
Message: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Time: ${new Date().toISOString()}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      console.log(errorInfo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <Server className="h-10 w-10 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="mt-4 text-muted-foreground">
          We're experiencing some technical difficulties. Our team has been
          notified and is working to fix the issue.
        </p>

        {/* Error ID */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
          <span className="text-muted-foreground">Error ID:</span>
          <code className="font-mono font-medium">{errorId}</code>
          <button
            onClick={handleCopyError}
            className="ml-1 p-1 hover:bg-accent rounded"
            aria-label="Copy error details"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 disabled:opacity-50 transition-colors'
            )}
          >
            <RefreshCw
              className={cn('h-4 w-4', isRetrying && 'animate-spin')}
            />
            {isRetrying ? 'Retrying...' : 'Try again'}
          </button>

          <Link
            href="/"
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-medium',
              'hover:bg-accent transition-colors'
            )}
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>

        {/* Technical Details (collapsible) */}
        {error && (
          <div className="mt-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Technical details
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showDetails && 'rotate-180'
                )}
              />
            </button>

            {showDetails && (
              <div className="mt-4 rounded-lg border bg-muted/50 p-4 text-left">
                <p className="text-sm font-medium text-destructive">
                  {error.message || 'An unexpected error occurred'}
                </p>
                {error.stack && (
                  <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Help Links */}
        <div className="mt-10 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Need help? Try these options:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/status"
              className="text-sm text-primary hover:underline"
            >
              System status
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/help"
              className="text-sm text-primary hover:underline"
            >
              Help center
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/contact"
              className="text-sm text-primary hover:underline"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// For Next.js 15 error boundary
export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Report error to monitoring service
  React.useEffect(() => {
    // Example: Sentry, LogRocket, etc.
    console.error('Application error:', error);
  }, [error]);

  return <Error500Page error={error} reset={reset} />;
}
```

## Variants

### Minimal Version

```tsx
export function MinimalError500() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h1 className="text-xl font-semibold">Server Error</h1>
      <p className="mt-2 text-muted-foreground text-center">
        Something went wrong. Please try again later.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Refresh page
      </button>
    </div>
  );
}
```

### With Illustration

```tsx
export function IllustratedError500() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg text-center">
        {/* Custom SVG illustration */}
        <svg className="mx-auto h-48 w-48" viewBox="0 0 200 200">
          {/* Server crash illustration */}
        </svg>
        <h1 className="mt-6 text-2xl font-bold">Oops! Server hiccup</h1>
        <p className="mt-2 text-muted-foreground">
          Our servers are taking a quick break. We'll be back shortly!
        </p>
      </div>
    </div>
  );
}
```

## Usage

### As Error Boundary (Next.js 15)

```tsx
// app/error.tsx
'use client';

export { ErrorBoundary as default } from '@/components/templates/500-page';
```

### As Static Page

```tsx
// app/500/page.tsx
import Error500Page from '@/components/templates/500-page';

export default function Page() {
  return <Error500Page />;
}

export const metadata = {
  title: 'Server Error | MyApp',
};
```

### With Error Reporting

```tsx
import * as Sentry from '@sentry/nextjs';

export function ErrorBoundary({ error, reset }) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <Error500Page error={error} reset={reset} />;
}
```

## Error States

The 500 page itself is an error state handler. Here's how to manage different error scenarios:

### Error Boundary Integration

```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';
import Error500Page from '@/components/templates/500-page';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return <Error500Page error={error} reset={reset} />;
}
```

### Global Error Handling

```tsx
// app/global-error.tsx
'use client';

import Error500Page from '@/components/templates/500-page';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <Error500Page error={error} reset={reset} />
      </body>
    </html>
  );
}
```

### Error Categories

```tsx
// components/templates/500-page-variants.tsx
interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const errorConfigs: Record<string, ErrorConfig> = {
  database: {
    icon: <Database className="h-10 w-10" />,
    title: 'Database Error',
    description: 'We encountered a database issue. Please try again.',
  },
  network: {
    icon: <Wifi className="h-10 w-10" />,
    title: 'Network Error',
    description: 'Unable to connect. Check your connection.',
  },
  timeout: {
    icon: <Clock className="h-10 w-10" />,
    title: 'Request Timeout',
    description: 'The request took too long. Please try again.',
  },
  default: {
    icon: <Server className="h-10 w-10" />,
    title: 'Server Error',
    description: 'Something went wrong on our end.',
  },
};

function getErrorConfig(error?: Error): ErrorConfig {
  if (error?.message.includes('database')) return errorConfigs.database;
  if (error?.message.includes('network')) return errorConfigs.network;
  if (error?.message.includes('timeout')) return errorConfigs.timeout;
  return errorConfigs.default;
}
```

## Loading States

While the 500 page doesn't typically have loading states, here's how to handle the retry action:

### Retry with Loading Feedback

```tsx
// components/500-retry-button.tsx
'use client';

import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';

export function RetryButton({ reset }: { reset?: () => void }) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      window.location.href = '/';
      return;
    }

    setIsRetrying(true);
    setRetryCount((c) => c + 1);

    // Simulate delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      if (reset) {
        reset();
      } else {
        window.location.reload();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={isRetrying}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      {isRetrying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Retrying... ({retryCount}/{maxRetries})
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          {retryCount >= maxRetries ? 'Go Home' : 'Try Again'}
        </>
      )}
    </button>
  );
}
```

### Skeleton for Error Details

```tsx
// components/500-skeleton.tsx
export function Error500Skeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 h-20 w-20 animate-pulse rounded-full bg-gray-200" />
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto mt-4 h-4 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-8 flex justify-center gap-3">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Layout

```tsx
// Mobile-first responsive 500 page
export function Responsive500Page({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="max-w-md w-full text-center">
        {/* Icon - smaller on mobile */}
        <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-red-100">
          <Server className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
        </div>

        {/* Title - responsive text size */}
        <h1 className="text-2xl sm:text-3xl font-bold">Something went wrong</h1>

        {/* Description - readable on mobile */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground px-2">
          We're experiencing technical difficulties. Our team has been notified.
        </p>

        {/* Error ID - compact on mobile */}
        <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-lg bg-muted px-3 sm:px-4 py-2 text-xs sm:text-sm">
          <span className="text-muted-foreground">Error:</span>
          <code className="font-mono font-medium truncate max-w-[150px] sm:max-w-none">
            {error?.digest || 'ERR-UNKNOWN'}
          </code>
        </div>

        {/* Actions - stack on mobile */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>

        {/* Help links - wrap on mobile */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <Link href="/status" className="text-primary hover:underline">
              System status
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link href="/help" className="text-primary hover:underline">
              Help center
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link href="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Icon | 64x64px | 80x80px | 80x80px |
| Title | 24px | 30px | 30px |
| Buttons | Full width, stacked | Auto width, inline | Auto width, inline |
| Padding | 16px | 24px | 24px |

## SEO Considerations

### Metadata Configuration

```tsx
// app/500/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Server Error | MyApp',
  description: 'We encountered a server error. Please try again later.',
  robots: {
    index: false,
    follow: false,
  },
};
```

### HTTP Status Codes

```tsx
// app/error.tsx - Ensure proper 500 status
// Next.js automatically returns 500 for error boundaries

// For API routes that catch errors:
// app/api/[...]/route.ts
export async function GET() {
  try {
    // ... logic
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

### Structured Data for Error Pages

```tsx
// components/500-structured-data.tsx
export function Error500StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Server Error',
    description: 'A server error occurred',
    mainEntity: {
      '@type': 'Thing',
      name: 'Server Error',
      description: 'HTTP 500 Internal Server Error',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## Testing Strategies

### Component Testing

```tsx
// __tests__/500-page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Error500Page from '@/components/templates/500-page';

describe('Error500Page', () => {
  it('renders error message', () => {
    render(<Error500Page />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays error ID when provided', () => {
    const error = new Error('Test error');
    (error as any).digest = 'ERR-12345';
    render(<Error500Page error={error} />);
    expect(screen.getByText('ERR-12345')).toBeInTheDocument();
  });

  it('calls reset function on retry', () => {
    const mockReset = vi.fn();
    render(<Error500Page reset={mockReset} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('shows technical details when expanded', () => {
    const error = new Error('Database connection failed');
    render(<Error500Page error={error} />);
    fireEvent.click(screen.getByText('Technical details'));
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();
  });

  it('copies error info to clipboard', async () => {
    const mockClipboard = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: mockClipboard },
    });

    const error = new Error('Test error');
    render(<Error500Page error={error} />);
    fireEvent.click(screen.getByLabelText('Copy error details'));
    expect(mockClipboard).toHaveBeenCalled();
  });
});
```

### E2E Testing

```tsx
// e2e/500-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('500 Error Page', () => {
  test('displays error page on server error', async ({ page }) => {
    // Trigger a 500 error
    await page.goto('/api/test-error');
    await expect(page.getByText('Something went wrong')).toBeVisible();
  });

  test('retry button reloads the page', async ({ page }) => {
    await page.goto('/500');
    const reloadPromise = page.waitForEvent('load');
    await page.click('text=Try again');
    await reloadPromise;
  });

  test('home button navigates correctly', async ({ page }) => {
    await page.goto('/500');
    await page.click('text=Go home');
    await expect(page).toHaveURL('/');
  });

  test('is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/500');

    // Buttons should be stacked
    const buttons = await page.locator('button, a[href="/"]').all();
    const positions = await Promise.all(
      buttons.map(async (btn) => {
        const box = await btn.boundingBox();
        return box?.y;
      })
    );
    // Verify vertical stacking
    expect(positions[0]).toBeLessThan(positions[1]!);
  });

  test('error details expand/collapse', async ({ page }) => {
    await page.goto('/500?simulate=error');
    await page.click('text=Technical details');
    await expect(page.locator('pre')).toBeVisible();
    await page.click('text=Technical details');
    await expect(page.locator('pre')).not.toBeVisible();
  });
});
```

### Accessibility Testing

```tsx
// __tests__/500-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Error500Page from '@/components/templates/500-page';

expect.extend(toHaveNoViolations);

describe('Error500Page Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Error500Page />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading hierarchy', () => {
    const { container } = render(<Error500Page />);
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
  });

  it('has accessible button labels', () => {
    const { getByLabelText } = render(<Error500Page />);
    expect(getByLabelText('Copy error details')).toBeInTheDocument();
  });
});
```

## Related Skills

- `templates/404-page` - Not found page
- `templates/maintenance-page` - Maintenance mode
- `patterns/error-handling` - Error handling patterns

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation
- Retry functionality
- Error ID with copy
- Collapsible technical details
- Help links section
