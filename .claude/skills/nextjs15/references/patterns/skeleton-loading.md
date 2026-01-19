---
id: pt-skeleton-loading
name: Skeleton Loading
version: 2.0.0
layer: L5
category: data
description: Skeleton UI loading patterns for better perceived performance
tags: [skeleton, loading, placeholder, animation, ux]
composes: []
formula: "SkeletonLoading = BaseSkeleton + VariantComponents + AnimationStyles + SuspenseIntegration"
dependencies:
  - react
  - next
  - tailwindcss
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Skeleton Loading

## Overview

Skeleton loading UI patterns that improve perceived performance by showing content placeholders while data loads, reducing layout shift and providing visual feedback.

## When to Use

- Data fetching with uncertain load times
- Initial page loads with async content
- Infinite scroll pagination boundaries
- Image-heavy layouts before images load
- React Suspense fallback components

## Composition Diagram

```
[Data Request] --> [Loading State]
                        |
                [Skeleton Display]
                        |
      +-----------------+-----------------+
      |        |        |        |        |
  [Text]  [Avatar]  [Card]   [List]  [Table]
      |        |        |        |        |
  [Lines] [Circle] [Image]  [Items] [Rows]
      |        |        |        |        |
      +-----------------+-----------------+
                        |
                [Animation (Pulse/Shimmer)]
                        |
                [Data Loaded]
                        |
                [Content Transition]
                        |
                [Real Content]
```

## Implementation

### Base Skeleton Component

```tsx
// components/skeleton/skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rounded';
  animation?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
}: SkeletonProps) {
  const variantStyles = {
    default: 'rounded',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    shimmer: 'skeleton-shimmer',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-800',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      aria-hidden="true"
    />
  );
}

// Add shimmer animation to globals.css
/*
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
*/
```

### Skeleton Text

```tsx
// components/skeleton/skeleton-text.tsx
import { Skeleton } from './skeleton';

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
  lineHeight?: string;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  className,
  lineHeight = 'h-4',
}: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`} aria-label="Loading text...">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={lineHeight}
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
}
```

### Skeleton Avatar

```tsx
// components/skeleton/skeleton-avatar.tsx
import { Skeleton } from './skeleton';

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRing?: boolean;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function SkeletonAvatar({ size = 'md', showRing = false }: SkeletonAvatarProps) {
  return (
    <Skeleton
      variant="circular"
      className={`${sizes[size]} ${showRing ? 'ring-2 ring-white dark:ring-gray-900' : ''}`}
    />
  );
}
```

### Skeleton Card

```tsx
// components/skeleton/skeleton-card.tsx
import { Skeleton } from './skeleton';
import { SkeletonText } from './skeleton-text';
import { SkeletonAvatar } from './skeleton-avatar';

interface SkeletonCardProps {
  showImage?: boolean;
  showAvatar?: boolean;
  imageHeight?: string;
  lines?: number;
}

export function SkeletonCard({
  showImage = true,
  showAvatar = false,
  imageHeight = 'h-48',
  lines = 2,
}: SkeletonCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {showImage && (
        <Skeleton className={`w-full ${imageHeight}`} variant="default" />
      )}
      <div className="p-4">
        {showAvatar && (
          <div className="mb-3 flex items-center gap-3">
            <SkeletonAvatar size="sm" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
        <Skeleton className="mb-2 h-6 w-3/4" />
        <SkeletonText lines={lines} />
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
```

### Skeleton List Item

```tsx
// components/skeleton/skeleton-list-item.tsx
import { Skeleton } from './skeleton';
import { SkeletonAvatar } from './skeleton-avatar';

interface SkeletonListItemProps {
  showAvatar?: boolean;
  showAction?: boolean;
  lines?: 1 | 2;
}

export function SkeletonListItem({
  showAvatar = true,
  showAction = true,
  lines = 2,
}: SkeletonListItemProps) {
  return (
    <div className="flex items-center gap-4 p-4">
      {showAvatar && <SkeletonAvatar size="md" />}
      <div className="flex-1">
        <Skeleton className="mb-2 h-4 w-1/3" />
        {lines === 2 && <Skeleton className="h-3 w-2/3" />}
      </div>
      {showAction && <Skeleton className="h-8 w-8 rounded-lg" />}
    </div>
  );
}

export function SkeletonList({
  count = 5,
  ...props
}: { count?: number } & SkeletonListItemProps) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} {...props} />
      ))}
    </div>
  );
}
```

### Skeleton Table

```tsx
// components/skeleton/skeleton-table.tsx
import { Skeleton } from './skeleton';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
}: SkeletonTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton
                    className="h-4"
                    style={{ width: `${60 + Math.random() * 40}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Skeleton Form

```tsx
// components/skeleton/skeleton-form.tsx
import { Skeleton } from './skeleton';

interface SkeletonFormProps {
  fields?: number;
  showSubmit?: boolean;
}

export function SkeletonForm({ fields = 3, showSubmit = true }: SkeletonFormProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      {showSubmit && (
        <Skeleton className="h-10 w-32 rounded-lg" />
      )}
    </div>
  );
}
```

### Skeleton with Content Transition

```tsx
// components/skeleton/skeleton-wrapper.tsx
'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkeletonWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

export function SkeletonWrapper({
  isLoading,
  skeleton,
  children,
}: SkeletonWrapperProps) {
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

### Page-Level Skeleton Patterns

```tsx
// components/skeleton/page-skeletons.tsx
import { Skeleton } from './skeleton';
import { SkeletonCard } from './skeleton-card';
import { SkeletonList } from './skeleton-list-item';
import { SkeletonText } from './skeleton-text';

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="mb-2 h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>

      {/* Activity List */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <Skeleton className="h-6 w-40" />
        </div>
        <SkeletonList count={5} />
      </div>
    </div>
  );
}

// Profile page skeleton
export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Bio */}
      <div className="mb-8">
        <Skeleton className="mb-3 h-5 w-16" />
        <SkeletonText lines={3} />
      </div>

      {/* Details */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Product grid skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showImage lines={1} />
      ))}
    </div>
  );
}

// Article skeleton
export function ArticleSkeleton() {
  return (
    <article className="mx-auto max-w-3xl">
      <Skeleton className="mb-4 h-10 w-3/4" />
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="mb-8 h-64 w-full rounded-xl" />
      <SkeletonText lines={4} className="mb-6" />
      <SkeletonText lines={4} className="mb-6" />
      <SkeletonText lines={3} />
    </article>
  );
}
```

### React Suspense Integration

```tsx
// components/skeleton/suspense-skeleton.tsx
import { Suspense, ReactNode } from 'react';

interface SuspenseSkeletonProps {
  children: ReactNode;
  fallback: ReactNode;
}

export function SuspenseSkeleton({ children, fallback }: SuspenseSkeletonProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// Usage with RSC loading.tsx
// app/dashboard/loading.tsx
import { DashboardSkeleton } from '@/components/skeleton/page-skeletons';

export default function Loading() {
  return <DashboardSkeleton />;
}
```

## Usage

```tsx
// Basic skeleton
import { Skeleton } from '@/components/skeleton/skeleton';

<Skeleton className="h-4 w-full" />
<Skeleton className="h-12 w-12" variant="circular" />

// Skeleton text
import { SkeletonText } from '@/components/skeleton/skeleton-text';

<SkeletonText lines={3} lastLineWidth="80%" />

// Skeleton card
import { SkeletonCard } from '@/components/skeleton/skeleton-card';

<SkeletonCard showImage showAvatar />

// With loading state
import { SkeletonWrapper } from '@/components/skeleton/skeleton-wrapper';

function UserProfile({ userId }) {
  const { data, isLoading } = useUser(userId);

  return (
    <SkeletonWrapper
      isLoading={isLoading}
      skeleton={<ProfileSkeleton />}
    >
      <Profile data={data} />
    </SkeletonWrapper>
  );
}

// With Suspense in App Router
// page.tsx
import { Suspense } from 'react';
import { ProductGridSkeleton } from '@/components/skeleton/page-skeletons';

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <Products />
    </Suspense>
  );
}
```

## Related Skills

- [L5/progressive-enhancement](./progressive-enhancement.md) - No-JS fallbacks
- [L1/spinner](../atoms/spinner.md) - Loading spinner
- [L5/lazy-loading](./lazy-loading.md) - Lazy loading

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with various skeleton components
