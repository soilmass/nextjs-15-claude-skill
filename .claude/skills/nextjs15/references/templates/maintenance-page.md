---
id: t-maintenance-page
name: Maintenance Page
version: 2.0.0
layer: L4
category: pages
description: Maintenance mode page with countdown, status updates, and notifications
tags: [maintenance, downtime, scheduled, status, countdown]
performance:
  impact: medium
  lcp: medium
  cls: low
composes:
  - ../molecules/callout.md
  - ../atoms/display-time.md
  - ../atoms/input-button.md
dependencies:
  - react
  - lucide-react
  - date-fns
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
formula: "MaintenancePage = Callout(m-callout) + DisplayTime(a-display-time) + InputButton(a-input-button)"
---

# Maintenance Page

## Overview

A maintenance mode page template with estimated completion countdown, real-time status updates, email notification signup, and social links for updates.

## Composition Diagram

```
+------------------------------------------------------------------+
|                      MAINTENANCE PAGE                             |
+------------------------------------------------------------------+
|                                                                   |
|                     +--------------------+                        |
|                     |    [Wrench Icon]   |                        |
|                     +--------------------+                        |
|                                                                   |
|                    We'll be back soon!                            |
|                                                                   |
|          We're performing scheduled maintenance                   |
|           to improve your experience.                             |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |             Countdown Timer (a-display-time)               |  |
|  |                                                            |  |
|  |    [Clock Icon] Estimated time remaining                   |  |
|  |                                                            |  |
|  |    +--------+    +--------+    +--------+                  |  |
|  |    |   02   | :  |   45   | :  |   30   |                  |  |
|  |    | Hours  |    |Minutes |    |Seconds |                  |  |
|  |    +--------+    +--------+    +--------+                  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              Progress Steps (m-callout)                    |  |
|  |  What we're working on:                                    |  |
|  |                                                            |  |
|  |  [x] Database optimization                                 |  |
|  |  [x] Security updates                                      |  |
|  |  [ ] Performance improvements                              |  |
|  |  [ ] New feature deployment                                |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |           Notification Signup (a-input-button)             |  |
|  |                                                            |  |
|  |    Get notified when we're back online                     |  |
|  |                                                            |  |
|  |    +--------------------------------+  +--------------+    |  |
|  |    | Enter your email               |  | [Bell] Notify|    |  |
|  |    +--------------------------------+  +--------------+    |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    Status Links                            |  |
|  |                                                            |  |
|  |    [ExternalLink] System status                            |  |
|  |    [Twitter] @company                                      |  |
|  |    [Mail] Contact support                                  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
```

## When to Use

Use this skill when:
- Displaying scheduled maintenance notices
- Building downtime status pages
- Creating countdown pages for service restoration
- Implementing email notification signups for status updates

## Implementation

```tsx
// app/maintenance/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Clock,
  Bell,
  Twitter,
  Mail,
  CheckCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaintenancePageProps {
  title?: string;
  message?: string;
  estimatedEndTime?: Date;
  statusUrl?: string;
  twitterHandle?: string;
  showNotifyForm?: boolean;
  features?: string[];
}

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = React.useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isComplete) {
    return (
      <div className="text-center">
        <p className="text-lg font-medium text-green-600">
          Maintenance should be complete!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh page
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {[
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
      ].map((item, index) => (
        <React.Fragment key={item.label}>
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <span className="text-2xl font-bold font-mono">
                {String(item.value).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </div>
          {index < 2 && (
            <span className="text-2xl font-bold text-muted-foreground">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Notification Signup Form
function NotifyForm() {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Replace with your notification signup endpoint
      await fetch('/api/maintenance-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span>We'll notify you when we're back!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className={cn(
          'flex-1 rounded-lg border bg-background px-4 py-2 text-sm',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
          'hover:bg-primary/90 disabled:opacity-50'
        )}
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        Notify me
      </button>
    </form>
  );
}

// Progress Steps
function MaintenanceProgress({ features }: { features: string[] }) {
  const [completedSteps, setCompletedSteps] = React.useState(0);

  // Simulate progress
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCompletedSteps((prev) => {
        if (prev < features.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 30000); // Progress every 30 seconds

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        What we're working on:
      </h3>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li
            key={index}
            className={cn(
              'flex items-center gap-2 text-sm',
              index <= completedSteps
                ? 'text-green-600'
                : 'text-muted-foreground'
            )}
          >
            {index <= completedSteps ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-current" />
            )}
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Main Maintenance Page
export default function MaintenancePage({
  title = 'We'll be back soon!',
  message = "We're performing scheduled maintenance to improve your experience. Thank you for your patience.",
  estimatedEndTime,
  statusUrl,
  twitterHandle,
  showNotifyForm = true,
  features = [
    'Database optimization',
    'Security updates',
    'Performance improvements',
    'New feature deployment',
  ],
}: MaintenancePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <Wrench className="h-10 w-10 text-amber-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>

        {/* Message */}
        <p className="mt-4 text-muted-foreground">{message}</p>

        {/* Countdown */}
        {estimatedEndTime && (
          <div className="mt-8">
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated time remaining</span>
            </div>
            <CountdownTimer targetDate={estimatedEndTime} />
          </div>
        )}

        {/* Progress */}
        {features.length > 0 && (
          <div className="mt-8 rounded-lg border bg-card p-4">
            <MaintenanceProgress features={features} />
          </div>
        )}

        {/* Notification Signup */}
        {showNotifyForm && (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-3">
              Get notified when we're back online
            </p>
            <NotifyForm />
          </div>
        )}

        {/* Status and Social Links */}
        <div className="mt-10 pt-8 border-t flex flex-wrap items-center justify-center gap-4">
          {statusUrl && (
            <a
              href={statusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              System status
            </a>
          )}
          {twitterHandle && (
            <a
              href={`https://twitter.com/${twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Twitter className="h-4 w-4" />
              @{twitterHandle}
            </a>
          )}
          <a
            href="mailto:support@example.com"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
// app/maintenance/page.tsx
import MaintenancePage from '@/components/templates/maintenance-page';

export default function Page() {
  return (
    <MaintenancePage
      estimatedEndTime={new Date('2024-12-31T18:00:00')}
      statusUrl="https://status.example.com"
      twitterHandle="exampleapp"
    />
  );
}
```

### With Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';

export function middleware(request: NextRequest) {
  if (MAINTENANCE_MODE && !request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
}
```

### Custom Features List

```tsx
<MaintenancePage
  features={[
    'Upgrading database infrastructure',
    'Implementing new security protocols',
    'Deploying performance optimizations',
    'Running system health checks',
  ]}
/>
```

## Error States

### Notification Signup Error

```tsx
// components/maintenance/notify-form-error.tsx
"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotifyErrorProps {
  onRetry: () => void;
}

export function NotifyFormError({ onRetry }: NotifyErrorProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 text-destructive">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">Unable to subscribe</p>
        <p className="text-xs opacity-80">Please try again later.</p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRetry}
        className="text-destructive hover:text-destructive"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Status API Error

```tsx
// components/maintenance/status-error.tsx
"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusErrorProps {
  onRetry: () => void;
}

export function StatusError({ onRetry }: StatusErrorProps) {
  return (
    <div className="rounded-lg border bg-amber-50 p-4 text-center">
      <WifiOff className="h-8 w-8 text-amber-600 mx-auto mb-2" />
      <p className="text-sm font-medium text-amber-800 mb-1">
        Unable to fetch status
      </p>
      <p className="text-xs text-amber-600 mb-3">
        Check your connection or try again
      </p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="h-3 w-3 mr-2" />
        Refresh
      </Button>
    </div>
  );
}
```

### Countdown Error Fallback

```tsx
// components/maintenance/countdown-error.tsx
"use client";

import { Clock, RefreshCw } from "lucide-react";

interface CountdownErrorProps {
  message?: string;
}

export function CountdownError({ message }: CountdownErrorProps) {
  return (
    <div className="text-center py-4">
      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">
        {message || "Estimated time unavailable"}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 inline-flex items-center gap-2 text-xs text-primary hover:underline"
      >
        <RefreshCw className="h-3 w-3" />
        Refresh for updates
      </button>
    </div>
  );
}
```

### Middleware Error Handling

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const MAINTENANCE_END = process.env.MAINTENANCE_END_TIME;

export function middleware(request: NextRequest) {
  // Skip maintenance check for certain paths
  const excludedPaths = ['/maintenance', '/api/health', '/api/maintenance-notify'];
  if (excludedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow access with admin cookie
  const adminBypass = request.cookies.get('maintenance-bypass');
  if (adminBypass?.value === process.env.MAINTENANCE_BYPASS_TOKEN) {
    return NextResponse.next();
  }

  if (MAINTENANCE_MODE) {
    const maintenanceUrl = new URL('/maintenance', request.url);

    // Pass end time to maintenance page
    if (MAINTENANCE_END) {
      maintenanceUrl.searchParams.set('endTime', MAINTENANCE_END);
    }

    return NextResponse.redirect(maintenanceUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## Loading States

### Full Page Loading

```tsx
// app/maintenance/loading.tsx
export default function MaintenanceLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-lg w-full text-center">
        {/* Icon Skeleton */}
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-muted animate-pulse" />

        {/* Title Skeleton */}
        <div className="h-8 w-48 mx-auto bg-muted rounded animate-pulse mb-4" />

        {/* Message Skeleton */}
        <div className="space-y-2 mb-8">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 mx-auto bg-muted rounded animate-pulse" />
        </div>

        {/* Countdown Skeleton */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-16 w-16 rounded-lg bg-muted animate-pulse" />
              {i < 3 && <span className="text-2xl text-muted-foreground">:</span>}
            </div>
          ))}
        </div>

        {/* Form Skeleton */}
        <div className="flex gap-2 max-w-md mx-auto">
          <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
```

### Progress Steps Loading

```tsx
// components/maintenance/progress-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ProgressLoading() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Skeleton className="h-4 w-36 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Countdown Timer Loading

```tsx
// components/maintenance/countdown-loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function CountdownLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="text-center">
              <Skeleton className="h-16 w-16 rounded-lg mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
            {i < 3 && <span className="text-2xl font-bold text-muted">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Notification Form Loading

```tsx
// components/maintenance/notify-loading.tsx
"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotifyButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Subscribing...
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Notify me
        </>
      )}
    </Button>
  );
}
```

## Mobile Responsiveness

### Responsive Breakpoints

| Breakpoint | Layout | Countdown | Form | Links |
|------------|--------|-----------|------|-------|
| < 480px | Compact | Smaller boxes | Stacked | Vertical |
| 480-768px | Standard | Medium boxes | Inline | Wrapped |
| >= 768px | Full | Large boxes | Inline | Horizontal |

### Mobile-First Maintenance Page

```tsx
// app/maintenance/page.tsx - Mobile Responsive
"use client";

import * as React from "react";
import {
  Wrench,
  Clock,
  Bell,
  Twitter,
  Mail,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MaintenancePageMobile({
  title = "We'll be back soon!",
  message = "We're performing scheduled maintenance.",
  estimatedEndTime,
  features = [],
}: MaintenancePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-16 bg-background">
      <div className="max-w-lg w-full text-center">
        {/* Icon - Smaller on mobile */}
        <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-amber-100">
          <Wrench className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />
        </div>

        {/* Title - Responsive text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {title}
        </h1>

        {/* Message */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground px-2">
          {message}
        </p>

        {/* Countdown - Responsive sizing */}
        {estimatedEndTime && (
          <div className="mt-6 sm:mt-8">
            <CountdownTimerMobile targetDate={estimatedEndTime} />
          </div>
        )}

        {/* Progress - Full width on mobile */}
        {features.length > 0 && (
          <div className="mt-6 sm:mt-8 rounded-lg border bg-card p-3 sm:p-4 text-left">
            <MaintenanceProgressMobile features={features} />
          </div>
        )}

        {/* Notification Form - Stacked on mobile */}
        <div className="mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            Get notified when we're back
          </p>
          <NotifyFormMobile />
        </div>

        {/* Links - Vertical on mobile */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t">
          <StatusLinksMobile />
        </div>
      </div>
    </div>
  );
}
```

### Mobile Countdown Timer

```tsx
// components/maintenance/countdown-mobile.tsx
"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function CountdownTimerMobile({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = React.useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (isComplete) {
    return (
      <div className="text-center py-4">
        <p className="text-base sm:text-lg font-medium text-green-600">
          Maintenance complete!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh page
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {[
        { value: timeLeft.hours, label: "Hrs" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Sec" },
      ].map((item, index) => (
        <React.Fragment key={item.label}>
          <div className="text-center">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-muted">
              <span className="text-lg sm:text-2xl font-bold font-mono">
                {String(item.value).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
              {item.label}
            </p>
          </div>
          {index < 2 && (
            <span className="text-lg sm:text-2xl font-bold text-muted-foreground">
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
```

### Mobile Notification Form

```tsx
// components/maintenance/notify-form-mobile.tsx
"use client";

import * as React from "react";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotifyFormMobile() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await fetch("/api/maintenance-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 text-green-600 py-2">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm sm:text-base">We'll notify you!</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className={cn(
          "flex-1 rounded-lg border bg-background px-4 py-3 text-sm",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          // Larger touch target on mobile
          "min-h-[48px]"
        )}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg",
          "bg-primary px-6 py-3 text-sm font-medium text-primary-foreground",
          "hover:bg-primary/90 disabled:opacity-50",
          "min-h-[48px] min-w-[120px]"
        )}
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Bell className="h-4 w-4" />
            <span>Notify me</span>
          </>
        )}
      </button>
    </form>
  );
}
```

### Mobile Status Links

```tsx
// components/maintenance/status-links-mobile.tsx
import { ExternalLink, Twitter, Mail } from "lucide-react";

interface StatusLinksMobileProps {
  statusUrl?: string;
  twitterHandle?: string;
  supportEmail?: string;
}

export function StatusLinksMobile({
  statusUrl,
  twitterHandle,
  supportEmail = "support@example.com",
}: StatusLinksMobileProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
      {statusUrl && (
        <a
          href={statusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline py-2"
        >
          <ExternalLink className="h-4 w-4" />
          System status
        </a>
      )}
      {twitterHandle && (
        <a
          href={`https://twitter.com/${twitterHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline py-2"
        >
          <Twitter className="h-4 w-4" />
          @{twitterHandle}
        </a>
      )}
      <a
        href={`mailto:${supportEmail}`}
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline py-2"
      >
        <Mail className="h-4 w-4" />
        Contact support
      </a>
    </div>
  );
}
```

### Progress Steps Mobile

```tsx
// components/maintenance/progress-mobile.tsx
"use client";

import * as React from "react";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaintenanceProgressMobileProps {
  features: string[];
}

export function MaintenanceProgressMobile({ features }: MaintenanceProgressMobileProps) {
  const [completedSteps, setCompletedSteps] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCompletedSteps((prev) => Math.min(prev + 1, features.length - 1));
    }, 30000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
        What we're working on:
      </h3>
      <ul className="space-y-2">
        {features.map((feature, index) => {
          const isComplete = index < completedSteps;
          const isActive = index === completedSteps;

          return (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs sm:text-sm",
                isComplete ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {isComplete ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-primary" />
              ) : (
                <Circle className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="line-clamp-1">{feature}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

## Related Skills

- `templates/500-page` - Server error page
- `templates/coming-soon-page` - Coming soon page
- `patterns/feature-flags` - Feature flag patterns

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation
- Countdown timer
- Progress steps
- Email notification signup
- Status links
