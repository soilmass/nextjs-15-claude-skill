---
id: pt-fallback-ui
name: Fallback UI Pattern
version: 2.0.0
layer: L5
category: errors
description: Loading states, skeleton screens, and fallback UI components for Next.js 15 applications
tags: [loading, skeleton, fallback, suspense, ui]
composes:
  - ../atoms/display-skeleton.md
  - ../atoms/input-button.md
dependencies: []
formula: Skeleton + Suspense + ErrorBoundary = Smooth Loading Experience
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

- Creating loading states for async components
- Building skeleton screens that match content layout
- Implementing error fallback components
- Providing visual feedback during data fetching
- Adding shimmer effects for better perceived performance

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Fallback UI Architecture                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AsyncBoundary                                        │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ ErrorBoundary                                   │ │   │
│  │ │ ┌─────────────────────────────────────────────┐ │ │   │
│  │ │ │ Suspense                                    │ │ │   │
│  │ │ │                                             │ │ │   │
│  │ │ │  Loading: ┌──────────────────────────────┐ │ │ │   │
│  │ │ │           │ Skeleton                     │ │ │ │   │
│  │ │ │           │ ████████████████             │ │ │ │   │
│  │ │ │           │ ██████████                   │ │ │ │   │
│  │ │ │           │ ████████████████████         │ │ │ │   │
│  │ │ │           └──────────────────────────────┘ │ │ │   │
│  │ │ │                                             │ │ │   │
│  │ │ │  Success: ┌──────────────────────────────┐ │ │ │   │
│  │ │ │           │ Actual Content               │ │ │ │   │
│  │ │ │           └──────────────────────────────┘ │ │ │   │
│  │ │ └─────────────────────────────────────────────┘ │ │   │
│  │ │                                                   │ │   │
│  │ │  Error:    ┌──────────────────────────────┐     │ │   │
│  │ │            │ ErrorFallback                │     │ │   │
│  │ │            │ ⚠ Something went wrong       │     │ │   │
│  │ │            │ [Try again]                  │     │ │   │
│  │ │            └──────────────────────────────┘     │ │   │
│  │ └───────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

# Fallback UI Pattern

## Overview

Loading states, skeleton screens, and fallback UI components for Next.js 15 applications. Provides visual feedback during data fetching and graceful degradation when components fail.

## Implementation

### Suspense Fallback Components

```typescript
// components/skeletons/product-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
```

```typescript
// components/skeletons/table-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="flex border-b bg-gray-50 p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="mr-4 h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex border-b p-4 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="mr-4 h-4 flex-1"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Skeleton Base Component

```typescript
// components/ui/skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function Skeleton({ 
  className, 
  animate = true,
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}

// Text skeleton that matches font sizes
export function TextSkeleton({ 
  lines = 1,
  className,
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ 
            width: i === lines - 1 ? '60%' : '100%' 
          }}
        />
      ))}
    </div>
  );
}
```

### Loading Component with Progress

```typescript
// components/loading/progress-loader.tsx
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressLoaderProps {
  isLoading: boolean;
  estimatedTime?: number; // milliseconds
}

export function ProgressLoader({ 
  isLoading, 
  estimatedTime = 3000 
}: ProgressLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timeout);
    }

    setProgress(0);
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Asymptotic progress - never quite reaches 100%
      const newProgress = Math.min(
        90,
        (1 - Math.exp(-elapsed / estimatedTime)) * 100
      );
      setProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, estimatedTime]);

  if (progress === 0) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full">
      <div
        className={cn(
          'h-full bg-blue-600 transition-all duration-200',
          progress === 100 && 'opacity-0'
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

### Content Placeholder

```typescript
// components/fallback/content-placeholder.tsx
import { cn } from '@/lib/utils';

interface ContentPlaceholderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ContentPlaceholder({
  icon,
  title,
  description,
  action,
  className,
}: ContentPlaceholderProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Usage
function EmptyProductList() {
  return (
    <ContentPlaceholder
      icon={<Package className="h-12 w-12" />}
      title="No products found"
      description="Try adjusting your search or filter criteria"
      action={
        <Button onClick={clearFilters}>
          Clear filters
        </Button>
      }
    />
  );
}
```

### Error Fallback Component

```typescript
// components/fallback/error-fallback.tsx
'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error?: Error;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showError?: boolean;
}

export function ErrorFallback({
  error,
  title = 'Something went wrong',
  description = 'We encountered an error loading this content.',
  onRetry,
  showError = false,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500" />
      
      <h3 className="mt-4 text-lg font-medium text-red-800">
        {title}
      </h3>
      
      <p className="mt-1 text-sm text-red-600">
        {description}
      </p>

      {showError && error && (
        <pre className="mt-4 max-w-full overflow-auto rounded bg-red-100 p-2 text-xs text-red-800">
          {error.message}
        </pre>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
```

### Shimmer Effect

```typescript
// components/ui/shimmer.tsx
import { cn } from '@/lib/utils';

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Shimmer({ className, ...props }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-200 dark:bg-gray-700',
        'before:absolute before:inset-0',
        'before:-translate-x-full before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent',
        'before:via-white/60 before:to-transparent',
        className
      )}
      {...props}
    />
  );
}

// Add to tailwind.config.js:
// animation: {
//   shimmer: 'shimmer 2s infinite',
// },
// keyframes: {
//   shimmer: {
//     '100%': { transform: 'translateX(100%)' },
//   },
// },
```

### Async Boundary with Fallback

```typescript
// components/boundaries/async-boundary.tsx
'use client';

import { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

interface AsyncBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error) => void;
}

export function AsyncBoundary({
  children,
  fallback,
  errorFallback,
  onError,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={errorFallback ?? fallback}
      onError={onError}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Usage
function ProductPage() {
  return (
    <AsyncBoundary
      fallback={<ProductSkeleton />}
      errorFallback={<ErrorFallback title="Failed to load product" />}
    >
      <ProductDetails />
    </AsyncBoundary>
  );
}
```

### Staggered Loading Animation

```typescript
// components/loading/staggered-skeleton.tsx
'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface StaggeredSkeletonProps {
  count: number;
  renderItem: (index: number) => ReactNode;
}

export function StaggeredSkeleton({ 
  count, 
  renderItem 
}: StaggeredSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {renderItem(index)}
        </motion.div>
      ))}
    </div>
  );
}

// Usage
function ListSkeleton() {
  return (
    <StaggeredSkeleton
      count={5}
      renderItem={() => (
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      )}
    />
  );
}
```

### Page-Level Loading UI

```typescript
// app/products/loading.tsx
import { ProductGridSkeleton } from '@/components/skeletons';

export default function ProductsLoading() {
  return (
    <div className="container py-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Filters skeleton */}
      <div className="mb-6 flex gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-32 animate-pulse rounded bg-gray-200"
          />
        ))}
      </div>

      {/* Products grid skeleton */}
      <ProductGridSkeleton count={12} />
    </div>
  );
}
```

### Inline Loading State

```typescript
// components/ui/inline-loading.tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export function InlineLoading({ 
  text = 'Loading...', 
  size = 'md',
  className,
}: InlineLoadingProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-gray-500', className)}>
      <Loader2 className={cn('animate-spin', sizes[size])} />
      {text && <span>{text}</span>}
    </span>
  );
}
```

### Optimistic Loading State

```typescript
// components/fallback/optimistic-wrapper.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { cn } from '@/lib/utils';

interface OptimisticWrapperProps<T> {
  data: T;
  children: (data: T, isPending: boolean) => React.ReactNode;
  update: (data: T) => Promise<T>;
}

export function OptimisticWrapper<T>({
  data,
  children,
  update,
}: OptimisticWrapperProps<T>) {
  const [isPending, startTransition] = useTransition();
  const [optimisticData, setOptimisticData] = useOptimistic(data);

  const handleUpdate = async (newData: T) => {
    startTransition(async () => {
      setOptimisticData(newData);
      await update(newData);
    });
  };

  return (
    <div className={cn(isPending && 'opacity-60 pointer-events-none')}>
      {children(optimisticData, isPending)}
    </div>
  );
}
```

## Variants

### With Blur Transition

```typescript
// components/fallback/blur-placeholder.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BlurPlaceholderProps {
  src: string;
  alt: string;
  blurDataURL: string;
  className?: string;
}

export function BlurPlaceholder({
  src,
  alt,
  blurDataURL,
  className,
}: BlurPlaceholderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-all duration-500',
          isLoaded ? 'blur-0 scale-100' : 'blur-sm scale-105'
        )}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
```

### With Content Transition

```typescript
// components/fallback/fade-in-content.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface FadeInContentProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

export function FadeInContent({
  isLoading,
  skeleton,
  children,
}: FadeInContentProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Anti-patterns

```typescript
// BAD: Generic skeleton that doesn't match content
<Skeleton className="h-96 w-full" /> // Doesn't match actual layout

// GOOD: Skeleton matches content structure
<div className="space-y-4">
  <Skeleton className="h-8 w-1/3" /> {/* Title */}
  <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
  <Skeleton className="h-4 w-2/3" /> {/* Description line 2 */}
</div>

// BAD: No loading state at all
{data && <Content data={data} />} // Blank screen while loading

// GOOD: Always show something
<Suspense fallback={<ContentSkeleton />}>
  <Content />
</Suspense>

// BAD: Layout shift when content loads
{isLoading ? <Skeleton /> : <LargeContent />} // Jump!

// GOOD: Matching dimensions
{isLoading ? (
  <Skeleton className="h-[400px] w-full" />
) : (
  <div className="h-[400px]"><Content /></div>
)}
```

## Related Patterns

- `error-boundaries.md` - Error handling
- `streaming.md` - Streaming with Suspense
- `loading.md` - Loading states
- `optimistic-updates.md` - Optimistic UI

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial fallback UI pattern
