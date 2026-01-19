---
id: t-root-layout
name: Root Layout
version: 2.0.0
layer: L4
category: layouts
description: Application root layout with providers, fonts, metadata, and global configuration
tags: [layout, root, app, providers, fonts, metadata]
formula: "RootLayout = Typography(p-typography) + Colors(p-colors) + DarkMode(p-dark-mode)"
composes:
  - ../primitives/typography.md
  - ../primitives/colors.md
  - ../primitives/dark-mode.md
dependencies: [next-themes, sonner]
performance:
  impact: critical
  lcp: critical
  cls: high
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Root Layout

## Overview

The Root Layout template provides the foundational HTML structure for the entire application. Configures fonts, theme providers, toast notifications, analytics, and global metadata. This is the parent layout that wraps all pages.

## When to Use

Use this skill when:
- Setting up a new Next.js 15 application
- Configuring application-wide providers
- Setting global metadata and SEO defaults
- Initializing fonts and themes

## Composition Diagram

```
+------------------------------------------------------------------------+
|                           <html>                                        |
|  lang="en" suppressHydrationWarning                                     |
+------------------------------------------------------------------------+
|  <head>                                                                 |
|  +--------------------------------------------------------------------+ |
|  |  [Metadata: title, description, og, twitter, icons]                | |
|  |  [Preconnect: fonts.googleapis.com, fonts.gstatic.com]             | |
|  |  [Viewport: themeColor, width, scale]                              | |
|  +--------------------------------------------------------------------+ |
|                                                                         |
|  <body> className={fontSans, fontMono}                                  |
|  +--------------------------------------------------------------------+ |
|  |                  ThemeProvider (p-dark-mode)                        | |
|  |  +----------------------------------------------------------------+ | |
|  |  |  [Skip to main content] (a11y link)                            | | |
|  |  +----------------------------------------------------------------+ | |
|  |                                                                     | |
|  |  +----------------------------------------------------------------+ | |
|  |  |  <div> relative flex min-h-screen flex-col                     | | |
|  |  |  +------------------------------------------------------------+| | |
|  |  |  |                  {children}                                 || | |
|  |  |  |       (All nested layouts and pages)                        || | |
|  |  |  +------------------------------------------------------------+| | |
|  |  +----------------------------------------------------------------+ | |
|  |                                                                     | |
|  |  +----------------------------------------------------------------+ | |
|  |  |  Global Components                                             | | |
|  |  |  [Toaster] (sonner)                                            | | |
|  |  |  [Analytics] (production)                                      | | |
|  |  |  [TailwindIndicator] (development)                             | | |
|  |  +----------------------------------------------------------------+ | |
|  +--------------------------------------------------------------------+ |
+------------------------------------------------------------------------+

Primitives Applied:
  - Typography (p-typography): --font-sans, --font-mono CSS variables
  - Colors (p-colors): CSS custom properties for theming
  - DarkMode (p-dark-mode): ThemeProvider with system preference
```

## Organisms Used

- None directly (provides infrastructure for all)

## Implementation

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { cn } from "@/lib/utils";
import "./globals.css";

// Font configuration
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Site configuration
const siteConfig = {
  name: "Site Name",
  description: "A modern Next.js 15 application built with atomic design.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  ogImage: "/og.jpg",
  creator: "@yourhandle",
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
};

// Metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:ring-2 focus:ring-ring"
          >
            Skip to main content
          </a>
          
          {/* Main content */}
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
          
          {/* Global UI components */}
          <Toaster richColors position="bottom-right" />
          
          {/* Analytics (production only) */}
          <Analytics />
          
          {/* Dev tools indicator (development only) */}
          {process.env.NODE_ENV === "development" && <TailwindIndicator />}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Theme Provider

```typescript
// components/providers/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### Analytics Component

```typescript
// components/analytics.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    
    // Replace with your analytics provider
    // Example: Vercel Analytics, Google Analytics, etc.
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID!, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
```

### Tailwind Indicator (Dev Only)

```typescript
// components/tailwind-indicator.tsx
export function TailwindIndicator() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-1 left-1 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  );
}
```

### Global CSS

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.625rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }

  /* Smooth scroll behavior */
  html {
    scroll-behavior: smooth;
  }

  /* Focus visible for keyboard navigation */
  :focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }

  /* Selection colors */
  ::selection {
    @apply bg-primary text-primary-foreground;
  }
}
```

## Key Implementation Notes

1. **Font Optimization**: Uses `next/font` for zero CLS
2. **Theme Support**: Dark/light mode with system preference
3. **Metadata**: Complete SEO and social sharing setup
4. **Accessibility**: Skip links and proper focus management
5. **Analytics**: Path-aware analytics tracking

## Variants

### With Auth Provider

```tsx
import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={...}>
        <SessionProvider session={session}>
          <ThemeProvider {...props}>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### With Query Provider

```tsx
import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={...}>
        <ThemeProvider {...props}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Performance

### Font Loading

- Use `display: swap` for fast text rendering
- Preconnect to font origins
- Subset fonts for smaller payloads

### Providers

- Minimize provider nesting
- Lazy load non-critical providers
- Use Suspense for async providers

## Accessibility

### Required Features

- Skip to content link
- Proper lang attribute
- Theme respects system preference
- Focus indicators for keyboard users

### Screen Reader

- Landmark regions defined
- Proper heading hierarchy
- Live regions for toasts

## Dependencies

```json
{
  "dependencies": {
    "next-themes": "^0.3.0",
    "sonner": "^1.4.0"
  }
}
```

## Error States

### Global Error Boundary

```tsx
// app/global-error.tsx
'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-950`}>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-10 w-10 text-red-600 dark:text-red-400"
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              An unexpected error occurred. Our team has been notified.
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-500">
                Error ID: {error.digest}
              </p>
            )}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={reset}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Try again
              </button>
              <a
                href="/"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### Not Found Page

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Error Provider for Client Errors

```tsx
// components/providers/error-provider.tsx
'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface ErrorContextType {
  handleError: (error: Error, options?: { silent?: boolean }) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const handleError = useCallback((error: Error, options?: { silent?: boolean }) => {
    // Log error
    console.error('Client error:', error);

    // Show toast unless silent
    if (!options?.silent) {
      toast.error('Something went wrong', {
        description: error.message || 'Please try again later.',
      });
    }

    // Report to error tracking service
    // reportError(error);
  }, []);

  return (
    <ErrorContext.Provider value={{ handleError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}
```

## Loading States

### Root Loading Component

```tsx
// app/loading.tsx
export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {/* Animated Logo or Spinner */}
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```

### Skeleton Screen Component

```tsx
// components/ui/page-skeleton.tsx
export function PageSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'dashboard' | 'article';
}) {
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 animate-pulse rounded-lg bg-muted" />
          <div className="h-80 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (variant === 'article') {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
        <div className="aspect-video animate-pulse rounded-lg bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
```

### Progress Bar for Navigation

```tsx
// components/providers/navigation-progress.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
});

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Custom styles for the progress bar
    const style = document.createElement('style');
    style.textContent = `
      #nprogress {
        pointer-events: none;
      }
      #nprogress .bar {
        background: hsl(var(--primary));
        position: fixed;
        z-index: 1031;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary));
        opacity: 1.0;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    NProgress.done();
    setIsLoading(false);
  }, [pathname, searchParams]);

  return null;
}
```

### Suspense Boundary Wrapper

```tsx
// components/ui/async-boundary.tsx
import { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface AsyncBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

export function AsyncBoundary({
  children,
  fallback = <DefaultLoading />,
  errorFallback = <DefaultError />,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function DefaultLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function DefaultError() {
  return (
    <div className="flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-destructive">Something went wrong</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Viewport Meta Configuration

```tsx
// app/layout.tsx - viewport export
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,      // Allow zoom for accessibility
  userScalable: true,   // Never disable user scaling
  viewportFit: "cover", // For notched devices
};
```

### Safe Area Handling for Notched Devices

```css
/* app/globals.css - Safe area utilities */
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }

  .px-safe {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  .min-h-screen-safe {
    min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  }

  /* Full height accounting for mobile browser chrome */
  .h-screen-dvh {
    height: 100dvh;
  }

  .min-h-screen-dvh {
    min-height: 100dvh;
  }
}
```

### Responsive Container

```tsx
// components/ui/container.tsx
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({
  children,
  className,
  size = 'lg'
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        {
          'max-w-screen-sm': size === 'sm',
          'max-w-screen-md': size === 'md',
          'max-w-screen-lg': size === 'lg',
          'max-w-screen-xl': size === 'xl',
          'max-w-none': size === 'full',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Mobile-First Body Styles

```css
/* app/globals.css - Mobile-first base styles */
@layer base {
  html {
    /* Prevent text size adjustment on orientation change */
    -webkit-text-size-adjust: 100%;
    /* Smooth scrolling */
    scroll-behavior: smooth;
    /* Better font rendering */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    /* Prevent pull-to-refresh on mobile */
    overscroll-behavior-y: contain;
    /* Minimum tap target size */
    --min-tap-target: 44px;
  }

  /* Hide scrollbar but allow scrolling on mobile */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Touch-friendly tap targets */
  button,
  a,
  [role="button"] {
    min-height: var(--min-tap-target);
    min-width: var(--min-tap-target);
  }

  /* Prevent iOS button styling */
  input[type="submit"],
  input[type="button"],
  button {
    -webkit-appearance: none;
  }
}
```

### Responsive Root Layout

```tsx
// app/layout.tsx - with responsive considerations
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent flash on theme change */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          // Base styles
          "min-h-screen-dvh bg-background font-sans antialiased",
          // Font variables
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
          >
            Skip to main content
          </a>

          {/* Main content wrapper */}
          <div className="relative flex min-h-screen-dvh flex-col">
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>

          {/* Toast notifications - positioned for mobile */}
          <Toaster
            richColors
            position="top-center"
            toastOptions={{
              className: 'sm:!bottom-4 sm:!right-4 sm:!top-auto',
            }}
          />

          {/* Dev tools */}
          {process.env.NODE_ENV === "development" && <TailwindIndicator />}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Related Skills

### Composes Into
- All page templates
- All layout templates

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Font configuration
- Theme provider
- Metadata configuration
- Analytics integration
