---
id: t-minimal-layout
name: Minimal Layout
version: 2.0.0
layer: L4
category: layouts
description: Minimal header-only layout for focused content pages
tags: [layout, minimal, focused, landing, content]
performance:
  impact: medium
  lcp: medium
  cls: low
composes:
  - ../organisms/header.md
  - ../atoms/interactive-link.md
dependencies:
  - react
  - next
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
formula: "MinimalLayout = Header(o-header) + InteractiveLink(a-interactive-link)"
---

# Minimal Layout

## Overview

A minimal layout featuring only a simple header for pages requiring maximum focus on content, such as checkout flows, reading experiences, or focused tasks.

## Composition Diagram

```
+------------------------------------------------------------------+
|                       MINIMAL LAYOUT                              |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |              Minimal Header (o-header)                     |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [<- Back]  [Logo] Company  /  Page Title     [?] [X] |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    MAIN CONTENT                            |  |
|  |                                                            |  |
|  |                                                            |  |
|  |                     {children}                             |  |
|  |                                                            |  |
|  |            (Checkout, Reading, Quiz, etc.)                 |  |
|  |                                                            |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                  Minimal Footer                            |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [Lock] Secure checkout   Privacy | Terms | Help      |  |  |
|  |  |                     (c) 2025 Company                 |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+

VARIANT: Focus Mode Layout
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | Page Title                      [Fullscreen] [X Exit]      |  |
|  +------------------------------------------------------------+  |
|  |                                                            |  |
|  |                     {children}                             |  |
|  |                                                            |  |
+------------------------------------------------------------------+

VARIANT: Stepper Layout
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | Checkout    (1)-----(2)-----(3)-----(4)                    |  |
|  |              *       o       o       o                     |  |
|  +------------------------------------------------------------+  |
|  |                     {children}                             |  |
+------------------------------------------------------------------+

VARIANT: Reading Layout with Progress
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | [Logo]                                               [X]   |  |
|  +------------------------------------------------------------+  |
|  | ==========================================-----------      |  |
|  |           Reading Progress Bar (75%)                       |  |
+------------------------------------------------------------------+
|  |                                                            |  |
|  |                  Article Content                           |  |
|  |                                                            |  |
+------------------------------------------------------------------+

VARIANT: Centered Layout (Auth/Modal)
+------------------------------------------------------------------+
|                                                                   |
|                         [Logo]                                    |
|                                                                   |
|              +----------------------------+                       |
|              |                            |                       |
|              |        {children}          |                       |
|              |                            |                       |
|              +----------------------------+                       |
|                                                                   |
|               (c) 2025 Company. All rights reserved.              |
|                                                                   |
+------------------------------------------------------------------+
```

## When to Use

Use this skill when:
- Building checkout flows
- Creating focused reading experiences
- Implementing quiz or survey pages
- Building authentication flows
- Creating distraction-free content pages

## Implementation

### Minimal Layout

```tsx
// app/(minimal)/layout.tsx
import { MinimalHeader } from '@/components/layouts/minimal-header';
import { MinimalFooter } from '@/components/layouts/minimal-footer';

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <MinimalHeader />
      <main className="flex-1">{children}</main>
      <MinimalFooter />
    </div>
  );
}
```

### Minimal Header

```tsx
// components/layouts/minimal-header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, HelpCircle } from 'lucide-react';

interface MinimalHeaderProps {
  showBack?: boolean;
  showClose?: boolean;
  closeHref?: string;
  title?: string;
  showHelp?: boolean;
}

export function MinimalHeader({
  showBack = false,
  showClose = true,
  closeHref = '/',
  title,
  showHelp = false,
}: MinimalHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            {!title && (
              <span className="hidden text-lg font-bold text-gray-900 sm:block dark:text-white">
                Company
              </span>
            )}
          </Link>

          {title && (
            <>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {title}
              </span>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {showHelp && (
            <Link
              href="/help"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </Link>
          )}

          {showClose && (
            <Link
              href={closeHref}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Minimal Footer

```tsx
// components/layouts/minimal-footer.tsx
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface MinimalFooterProps {
  showSecurity?: boolean;
}

export function MinimalFooter({ showSecurity = false }: MinimalFooterProps) {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Security Badge */}
          {showSecurity && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="h-4 w-4" />
              <span>Secure checkout powered by Stripe</span>
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">
              Terms
            </Link>
            <Link href="/help" className="hover:text-gray-700 dark:hover:text-gray-300">
              Help
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Company
          </p>
        </div>
      </div>
    </footer>
  );
}
```

### Checkout Page Example

```tsx
// app/(minimal)/checkout/page.tsx
import { MinimalHeader } from '@/components/layouts/minimal-header';
import { MinimalFooter } from '@/components/layouts/minimal-footer';

export default function CheckoutPage() {
  return (
    <>
      {/* Override header for checkout */}
      <MinimalHeader title="Checkout" showBack showHelp />
      
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Checkout Form */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Complete your purchase
            </h1>
            {/* Form content */}
          </div>

          {/* Order Summary */}
          <div>
            {/* Summary content */}
          </div>
        </div>
      </div>

      <MinimalFooter showSecurity />
    </>
  );
}
```

### Reading Page Example

```tsx
// app/(minimal)/read/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { MinimalHeader } from '@/components/layouts/minimal-header';
import { ReadingProgress } from '@/components/reading/reading-progress';

export default function ReadingPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winHeight;
      const scrolled = window.scrollY;
      setProgress((scrolled / docHeight) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <MinimalHeader showClose closeHref="/blog" />
      <ReadingProgress progress={progress} />
      
      <article className="prose prose-lg mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
        <h1>Article Title</h1>
        {/* Article content */}
      </article>
    </>
  );
}

// components/reading/reading-progress.tsx
export function ReadingProgress({ progress }: { progress: number }) {
  return (
    <div className="fixed left-0 top-16 z-40 h-1 w-full bg-gray-100 dark:bg-gray-800">
      <div
        className="h-full bg-blue-600 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

### Focus Mode Layout

```tsx
// components/layouts/focus-layout.tsx
'use client';

import { useState, ReactNode } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';

interface FocusLayoutProps {
  children: ReactNode;
  title?: string;
  exitHref?: string;
}

export function FocusLayout({
  children,
  title,
  exitHref = '/',
}: FocusLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      {/* Minimal Header */}
      <header className="flex h-14 items-center justify-between border-b border-gray-100 px-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {title && (
            <h1 className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <Link
            href={exitHref}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Exit focus mode"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

### Centered Content Layout

```tsx
// components/layouts/centered-layout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CenteredLayoutProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function CenteredLayout({
  children,
  maxWidth = 'md',
}: CenteredLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={48}
          height={48}
          className="h-12 w-12"
        />
      </Link>

      {/* Content */}
      <div className={`w-full ${maxWidthClasses[maxWidth]}`}>
        {children}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Company. All rights reserved.</p>
      </footer>
    </div>
  );
}
```

### Modal-like Page Layout

```tsx
// components/layouts/modal-page-layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ModalPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function ModalPageLayout({
  children,
  title,
  description,
}: ModalPageLayoutProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-6 dark:border-gray-800">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}
```

## Variants

### With Progress Steps

```tsx
// components/layouts/minimal-stepper-header.tsx
interface Step {
  id: string;
  name: string;
}

interface MinimalStepperHeaderProps {
  steps: Step[];
  currentStep: number;
  title?: string;
}

export function MinimalStepperHeader({
  steps,
  currentStep,
  title,
}: MinimalStepperHeaderProps) {
  return (
    <header className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">
            {title}
          </span>
          
          {/* Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index + 1 === currentStep
                      ? 'bg-blue-600 text-white'
                      : index + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 ${
                      index + 1 < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
```

### With Timer

```tsx
// components/layouts/timed-layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimedLayoutProps {
  children: React.ReactNode;
  duration: number; // in seconds
  onTimeout?: () => void;
}

export function TimedLayout({ children, duration, onTimeout }: TimedLayoutProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">
            Timed Session
          </span>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span
              className={`font-mono ${
                timeLeft < 60 ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
```

## Usage

```tsx
// Create pages using minimal layout
// app/(minimal)/checkout/page.tsx
// app/(minimal)/read/[slug]/page.tsx
// app/(minimal)/quiz/page.tsx

// Use in route groups for automatic layout application
// All pages in (minimal) folder use MinimalLayout

// Override header props per page
import { MinimalHeader } from '@/components/layouts/minimal-header';

export default function CustomPage() {
  return (
    <>
      <MinimalHeader 
        title="Custom Title" 
        showBack 
        showHelp 
        showClose={false}
      />
      {/* Page content */}
    </>
  );
}
```

## Error States

### Layout Error Boundary

```tsx
// app/(minimal)/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function MinimalLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Minimal layout error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-gray-950">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          We encountered an error while loading this page. Please try again.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Checkout Error State

```tsx
// components/checkout/checkout-error.tsx
'use client';

import { AlertCircle, CreditCard, RefreshCw } from 'lucide-react';

interface CheckoutErrorProps {
  type: 'payment' | 'validation' | 'network' | 'general';
  message?: string;
  onRetry?: () => void;
}

export function CheckoutError({ type, message, onRetry }: CheckoutErrorProps) {
  const errorConfig = {
    payment: {
      icon: CreditCard,
      title: 'Payment failed',
      description: message || 'Your payment could not be processed. Please check your card details and try again.',
    },
    validation: {
      icon: AlertCircle,
      title: 'Invalid information',
      description: message || 'Please check the information you entered and try again.',
    },
    network: {
      icon: RefreshCw,
      title: 'Connection error',
      description: message || 'Unable to connect. Please check your internet connection.',
    },
    general: {
      icon: AlertCircle,
      title: 'Something went wrong',
      description: message || 'An unexpected error occurred. Please try again.',
    },
  };

  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
      <div className="flex gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800 dark:text-red-300">
            {config.title}
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-400">
            {config.description}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-800 underline hover:no-underline dark:text-red-300"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Loading States

### Minimal Layout Loading

```tsx
// app/(minimal)/loading.tsx
export default function MinimalLayoutLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      {/* Header Skeleton */}
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="space-y-6">
            <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Checkout Loading Skeleton

```tsx
// components/checkout/checkout-skeleton.tsx
export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Form Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

          {/* Form Fields */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}

          {/* Button Skeleton */}
          <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Summary Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
          <div className="border-t pt-4 dark:border-gray-800">
            <div className="flex justify-between">
              <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Reading Progress Loading

```tsx
// components/reading/reading-skeleton.tsx
export function ReadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Title */}
      <div className="mb-8 space-y-4">
        <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>

      {/* Content Lines */}
      <div className="space-y-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Minimal Header

```tsx
// components/layouts/minimal-header-responsive.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, HelpCircle, Menu } from 'lucide-react';
import { useState } from 'react';

interface MinimalHeaderResponsiveProps {
  showBack?: boolean;
  showClose?: boolean;
  closeHref?: string;
  title?: string;
  showHelp?: boolean;
}

export function MinimalHeaderResponsive({
  showBack = false,
  showClose = true,
  closeHref = '/',
  title,
  showHelp = false,
}: MinimalHeaderResponsiveProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:h-16 sm:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 sm:gap-2 sm:px-3 sm:py-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="hidden text-sm font-medium sm:inline">Back</span>
            </button>
          )}

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8"
            />
            {!title && (
              <span className="hidden text-lg font-bold text-gray-900 sm:block dark:text-white">
                Company
              </span>
            )}
          </Link>

          {title && (
            <>
              <span className="hidden text-gray-300 sm:block dark:text-gray-700">/</span>
              <span className="max-w-[120px] truncate text-sm font-medium text-gray-900 sm:max-w-none sm:text-base dark:text-white">
                {title}
              </span>
            </>
          )}
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          {showHelp && (
            <Link
              href="/help"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
          )}

          {showClose && (
            <Link
              href={closeHref}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Right Side - Mobile */}
        <div className="flex items-center gap-1 sm:hidden">
          {showHelp && (
            <Link
              href="/help"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </Link>
          )}
          {showClose && (
            <Link
              href={closeHref}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Mobile-First Checkout Layout

```tsx
// components/checkout/checkout-layout-responsive.tsx
'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ShoppingBag } from 'lucide-react';

interface CheckoutLayoutResponsiveProps {
  children: React.ReactNode;
  summary: React.ReactNode;
  total: string;
  itemCount: number;
}

export function CheckoutLayoutResponsive({
  children,
  summary,
  total,
  itemCount,
}: CheckoutLayoutResponsiveProps) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Mobile Order Summary Toggle */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-gray-50 lg:hidden dark:border-gray-800 dark:bg-gray-900">
        <button
          onClick={() => setSummaryExpanded(!summaryExpanded)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {summaryExpanded ? 'Hide' : 'Show'} order summary
            </span>
            {summaryExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {total}
          </span>
        </button>

        {/* Expandable Summary */}
        {summaryExpanded && (
          <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
            {summary}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* Checkout Form */}
          <div className="order-2 lg:order-1">
            {children}
          </div>

          {/* Desktop Order Summary */}
          <div className="order-1 hidden lg:order-2 lg:block">
            <div className="sticky top-24 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Order Summary ({itemCount} items)
              </h2>
              {summary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Mobile Breakpoints Reference

```tsx
// Tailwind responsive breakpoints for minimal layout
// sm: 640px - Small tablets and large phones
// md: 768px - Tablets
// lg: 1024px - Laptops and desktops
// xl: 1280px - Large desktops

// Common responsive patterns:
// - Header height: h-14 (mobile) -> h-16 (sm+)
// - Padding: px-4 (mobile) -> px-6 (sm+)
// - Text size: text-sm (mobile) -> text-base (sm+)
// - Button spacing: gap-1 (mobile) -> gap-2 (sm+)
// - Hide/show elements: hidden sm:block, block sm:hidden
// - Grid columns: grid-cols-1 -> lg:grid-cols-2
// - Max width: max-w-full -> sm:max-w-md -> lg:max-w-lg
```

## Related Skills

- [L4/auth-layout](./auth-layout.md) - Authentication layout
- [L4/onboarding-layout](./onboarding-layout.md) - Onboarding flow
- [L4/checkout-page](./checkout-page.md) - Checkout template

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with minimal header and variants
