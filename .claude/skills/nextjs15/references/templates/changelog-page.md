---
id: t-changelog-page
name: Changelog Page
version: 2.0.0
layer: L4
category: pages
description: Product changelog and release notes page with version history
tags: [changelog, releases, updates, versioning, announcements]
performance:
  impact: medium
  lcp: medium
  cls: low
formula: "ChangelogPage = Timeline(o-timeline) + Callout(m-callout) + DisplayBadge(a-display-badge)"
composes:
  - ../organisms/timeline.md
  - ../molecules/callout.md
  - ../atoms/display-badge.md
dependencies:
  - react
  - next
  - lucide-react
  - date-fns
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Changelog Page

## Overview

A product changelog page displaying release notes, version history, and feature updates. Supports categorized changes, version filtering, and RSS feed subscription.

## Composition Diagram

```
+------------------------------------------------------------------+
|                        ChangelogPage                              |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |                    ChangelogHeader                          |  |
|  |  [ Logo ]                    [ RSS Feed ] [ Subscribe ]     |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +----------------+  +---------------------------------------+    |
|  |    Sidebar     |  |           ChangelogList               |    |
|  |  +-----------+ |  |  +----------------------------------+ |    |
|  |  | Type      | |  |  |  o Timeline                      | |    |
|  |  | Filter    | |  |  |  |                                | |    |
|  |  +-----------+ |  |  |  +--- Entry ----------------+     | |    |
|  |  +-----------+ |  |  |  | a DisplayBadge [v2.1.0]  |     | |    |
|  |  | Year      | |  |  |  | Title + Date             |     | |    |
|  |  | Filter    | |  |  |  | +--- Change Card ------+ |     | |    |
|  |  +-----------+ |  |  |  | | m Callout [Feature]  | |     | |    |
|  |                |  |  |  | | Description          | |     | |    |
|  |                |  |  |  | +----------------------+ |     | |    |
|  |                |  |  |  +---------------------------+     | |    |
|  |                |  |  |                                    | |    |
|  |                |  |  +----------------------------------+ |    |
|  +----------------+  +---------------------------------------+    |
+------------------------------------------------------------------+
```

## Implementation

### Changelog Page

```tsx
// app/changelog/page.tsx
import { Suspense } from 'react';
import { ChangelogHeader } from '@/components/changelog/changelog-header';
import { ChangelogList } from '@/components/changelog/changelog-list';
import { ChangelogSidebar } from '@/components/changelog/changelog-sidebar';
import { ChangelogSkeleton } from '@/components/changelog/changelog-skeleton';

interface ChangelogPageProps {
  searchParams: Promise<{
    type?: string;
    year?: string;
  }>;
}

export const metadata = {
  title: 'Changelog | Product Updates',
  description: 'Stay up to date with the latest features, improvements, and bug fixes',
};

export default async function ChangelogPage({ searchParams }: ChangelogPageProps) {
  const params = await searchParams;
  const type = params.type || 'all';
  const year = params.year ? parseInt(params.year, 10) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ChangelogHeader />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <ChangelogSidebar activeType={type} activeYear={year} />
          </aside>

          {/* Changelog List */}
          <div className="lg:col-span-3">
            <Suspense fallback={<ChangelogSkeleton />}>
              <ChangelogList type={type} year={year} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Changelog Header

```tsx
// components/changelog/changelog-header.tsx
import { Rss, Bell } from 'lucide-react';
import Link from 'next/link';

export function ChangelogHeader() {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Changelog
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              New features, improvements, and bug fixes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/changelog/rss"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Rss className="h-4 w-4 text-orange-500" />
              RSS Feed
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Bell className="h-4 w-4" />
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Changelog Sidebar

```tsx
// components/changelog/changelog-sidebar.tsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Wrench, Bug, AlertTriangle, Archive } from 'lucide-react';

const changeTypes = [
  { id: 'all', name: 'All Updates', icon: Archive, color: 'text-gray-600' },
  { id: 'feature', name: 'New Features', icon: Sparkles, color: 'text-green-600' },
  { id: 'improvement', name: 'Improvements', icon: Wrench, color: 'text-blue-600' },
  { id: 'fix', name: 'Bug Fixes', icon: Bug, color: 'text-orange-600' },
  { id: 'breaking', name: 'Breaking Changes', icon: AlertTriangle, color: 'text-red-600' },
];

const years = [2025, 2024, 2023, 2022];

interface ChangelogSidebarProps {
  activeType: string;
  activeYear?: number;
}

export function ChangelogSidebar({ activeType, activeYear }: ChangelogSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/changelog?${params.toString()}`);
  };

  return (
    <nav className="sticky top-8 space-y-8">
      {/* Type Filter */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Type
        </h3>
        <ul className="space-y-1">
          {changeTypes.map((type) => (
            <li key={type.id}>
              <button
                onClick={() => updateFilter('type', type.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeType === type.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <type.icon className={`h-4 w-4 ${type.color}`} />
                {type.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Year Filter */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Year
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateFilter('year', undefined)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                !activeYear
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              All Years
            </button>
          </li>
          {years.map((year) => (
            <li key={year}>
              <button
                onClick={() => updateFilter('year', year.toString())}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeYear === year
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {year}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

### Changelog List

```tsx
// components/changelog/changelog-list.tsx
import { format, parseISO } from 'date-fns';
import { Sparkles, Wrench, Bug, AlertTriangle, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'breaking';
    title: string;
    description?: string;
  }[];
}

interface ChangelogListProps {
  type: string;
  year?: number;
}

const typeConfig = {
  feature: {
    icon: Sparkles,
    label: 'New Feature',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-500',
  },
  improvement: {
    icon: Wrench,
    label: 'Improvement',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  fix: {
    icon: Bug,
    label: 'Bug Fix',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  breaking: {
    icon: AlertTriangle,
    label: 'Breaking Change',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

async function getChangelog(type: string, year?: number): Promise<ChangelogEntry[]> {
  const params = new URLSearchParams();
  if (type !== 'all') params.set('type', type);
  if (year) params.set('year', year.toString());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/changelog?${params.toString()}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) throw new Error('Failed to fetch changelog');
  return res.json();
}

export async function ChangelogList({ type, year }: ChangelogListProps) {
  const entries = await getChangelog(type, year);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          No changelog entries found for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 hidden h-full w-px bg-gray-200 dark:bg-gray-800 sm:block" />

      <div className="space-y-12">
        {entries.map((entry, index) => (
          <article key={entry.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute left-6 top-0 hidden h-4 w-4 rounded-full border-4 border-white bg-blue-600 dark:border-gray-900 sm:block" />

            <div className="sm:ml-16">
              {/* Header */}
              <header className="mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    v{entry.version}
                  </span>
                  <time
                    dateTime={entry.date}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {format(parseISO(entry.date), 'MMMM d, yyyy')}
                  </time>
                </div>
                <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                  {entry.title}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {entry.description}
                </p>
              </header>

              {/* Image */}
              {entry.image && (
                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                  <Image
                    src={entry.image}
                    alt={entry.title}
                    width={800}
                    height={400}
                    className="w-full object-cover"
                  />
                </div>
              )}

              {/* Changes */}
              <div className="space-y-4">
                {entry.changes.map((change, changeIndex) => {
                  const config = typeConfig[change.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={changeIndex}
                      className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${config.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                            >
                              {config.label}
                            </span>
                            <h3 className="mt-1.5 font-medium text-gray-900 dark:text-white">
                              {change.title}
                            </h3>
                            {change.description && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {change.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Read more link */}
              <Link
                href={`/changelog/${entry.version}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Read full release notes
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
```

### Changelog Skeleton

```tsx
// components/changelog/changelog-skeleton.tsx
export function ChangelogSkeleton() {
  return (
    <div className="space-y-12">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="sm:ml-16">
          {/* Header skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="mt-3 h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Changes skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### RSS Feed Route

```tsx
// app/changelog/rss/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const entries = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/changelog`).then(r => r.json());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Product Changelog</title>
    <link>${process.env.NEXT_PUBLIC_APP_URL}/changelog</link>
    <description>Latest product updates and release notes</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${process.env.NEXT_PUBLIC_APP_URL}/changelog/rss" rel="self" type="application/rss+xml"/>
    ${entries.map((entry: any) => `
    <item>
      <title>v${entry.version} - ${entry.title}</title>
      <link>${process.env.NEXT_PUBLIC_APP_URL}/changelog/${entry.version}</link>
      <description><![CDATA[${entry.description}]]></description>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${process.env.NEXT_PUBLIC_APP_URL}/changelog/${entry.version}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
```

## Variants

### Compact Timeline

```tsx
// components/changelog/compact-timeline.tsx
import { format, parseISO } from 'date-fns';

export function CompactTimeline({ entries }: { entries: any[] }) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800"
        >
          <time className="flex-shrink-0 text-sm text-gray-500">
            {format(parseISO(entry.date), 'MMM d')}
          </time>
          <div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              v{entry.version}
            </span>
            <h3 className="mt-1 font-medium text-gray-900 dark:text-white">
              {entry.title}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Widget Changelog

```tsx
// components/changelog/changelog-widget.tsx
'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChangelogWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700"
      >
        <Bell className="h-6 w-6" />
        {hasUnread && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            3
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                What's New
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {/* Changelog entries would go here */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Usage

```tsx
// Basic changelog page
// Navigate to /changelog

// Filter by type
// Navigate to /changelog?type=feature

// Filter by year
// Navigate to /changelog?year=2024

// Add changelog widget to layout
import { ChangelogWidget } from '@/components/changelog/changelog-widget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChangelogWidget />
    </>
  );
}
```

## Error States

### Changelog Fetch Error

```tsx
// components/changelog/changelog-error.tsx
'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ChangelogError({ error }: { error?: Error }) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
      <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
      <h3 className="mt-4 text-lg font-semibold text-red-800 dark:text-red-200">
        Failed to load changelog
      </h3>
      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
        {error?.message || 'Unable to fetch changelog entries. Please try again.'}
      </p>
      <button
        onClick={() => router.refresh()}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
```

### Empty State

```tsx
// components/changelog/changelog-empty.tsx
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export function ChangelogEmpty({ filter }: { filter?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
      <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold">No entries found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {filter
          ? `No changelog entries match the "${filter}" filter.`
          : 'No changelog entries have been published yet.'}
      </p>
      {filter && (
        <Link
          href="/changelog"
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          View all entries
        </Link>
      )}
    </div>
  );
}
```

### Error Boundary

```tsx
// app/changelog/error.tsx
'use client';

import { useEffect } from 'react';
import { ChangelogError } from '@/components/changelog/changelog-error';

export default function ChangelogErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Changelog error:', error);
  }, [error]);

  return <ChangelogError error={error} />;
}
```

## Loading States

The page already includes `ChangelogSkeleton`. Here are additional loading patterns:

### Enhanced Skeleton with Animation

```tsx
// components/changelog/changelog-skeleton.tsx
export function ChangelogSkeleton() {
  return (
    <div className="space-y-12">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="relative sm:ml-16">
          {/* Timeline dot skeleton */}
          <div className="absolute left-6 top-0 hidden h-4 w-4 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700 sm:block" />

          {/* Header skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="mt-3 h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Changes skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Sidebar skeleton
export function ChangelogSidebarSkeleton() {
  return (
    <nav className="sticky top-8 space-y-8">
      <div>
        <div className="mb-4 h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
```

### Streaming Loading

```tsx
// app/changelog/page.tsx with streaming
import { Suspense } from 'react';
import { ChangelogSkeleton, ChangelogSidebarSkeleton } from '@/components/changelog/changelog-skeleton';

export default async function ChangelogPage({ searchParams }: ChangelogPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ChangelogHeader />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          <aside className="hidden lg:block">
            <Suspense fallback={<ChangelogSidebarSkeleton />}>
              <ChangelogSidebar activeType={params.type || 'all'} activeYear={params.year ? parseInt(params.year) : undefined} />
            </Suspense>
          </aside>

          <div className="lg:col-span-3">
            <Suspense fallback={<ChangelogSkeleton />}>
              <ChangelogList type={params.type || 'all'} year={params.year ? parseInt(params.year) : undefined} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Layout

```tsx
// components/changelog/responsive-changelog.tsx
'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { ChangelogSidebar } from './changelog-sidebar';

export function ResponsiveChangelogLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="lg:grid lg:grid-cols-4 lg:gap-12">
      {/* Mobile filter toggle */}
      <div className="mb-6 lg:hidden">
        <button
          onClick={() => setShowFilters(true)}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">{sidebar}</aside>

      {/* Content */}
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}
```

### Mobile Timeline

```tsx
// components/changelog/mobile-timeline.tsx
export function MobileChangelog({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-xl border bg-white p-4 dark:bg-gray-900"
        >
          {/* Compact header for mobile */}
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              v{entry.version}
            </span>
            <time className="text-xs text-gray-500">{entry.date}</time>
          </div>

          <h2 className="text-lg font-bold">{entry.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {entry.description}
          </p>

          {/* Compact change list */}
          <div className="mt-3 space-y-2">
            {entry.changes.slice(0, 3).map((change, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-1 h-2 w-2 rounded-full ${getChangeColor(change.type)}`} />
                <span className="line-clamp-1">{change.title}</span>
              </div>
            ))}
            {entry.changes.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{entry.changes.length - 3} more changes
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Layout | Single column | Single column | Sidebar + content |
| Sidebar | Bottom drawer | Bottom drawer | Sticky sidebar |
| Timeline | Compact cards | Standard timeline | Full timeline |
| Entry | Truncated | Expanded | Full details |

## SEO Considerations

### Metadata Configuration

```tsx
// app/changelog/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog | Product Updates',
  description: 'Stay up to date with the latest features, improvements, and bug fixes.',
  openGraph: {
    title: 'Product Changelog',
    description: 'See what\'s new in our latest releases',
    type: 'website',
  },
  alternates: {
    types: {
      'application/rss+xml': '/changelog/rss',
    },
  },
};
```

### Structured Data

```tsx
// components/changelog/changelog-structured-data.tsx
export function ChangelogStructuredData({ entries }: { entries: ChangelogEntry[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Product Changelog',
    description: 'Release notes and product updates',
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: `Version ${entry.version}`,
        softwareVersion: entry.version,
        datePublished: entry.date,
        description: entry.description,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### Dynamic Metadata for Version Pages

```tsx
// app/changelog/[version]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  const entry = await getChangelogEntry(version);

  return {
    title: `Version ${version} Release Notes`,
    description: entry?.description || `What's new in version ${version}`,
    openGraph: {
      title: `${entry?.title} - v${version}`,
      description: entry?.description,
      images: entry?.image ? [entry.image] : undefined,
    },
  };
}
```

## Testing Strategies

### Component Testing

```tsx
// __tests__/changelog-page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ChangelogPage from '@/app/changelog/page';
import { ChangelogList } from '@/components/changelog/changelog-list';

// Mock data
const mockEntries = [
  {
    id: '1',
    version: '2.0.0',
    title: 'Major Release',
    date: '2025-01-15',
    description: 'New features',
    changes: [{ type: 'feature', title: 'New dashboard' }],
  },
];

describe('ChangelogPage', () => {
  it('renders changelog header', () => {
    render(<ChangelogPage searchParams={Promise.resolve({})} />);
    expect(screen.getByText('Changelog')).toBeInTheDocument();
  });

  it('displays version badges', async () => {
    render(<ChangelogList type="all" entries={mockEntries} />);
    expect(screen.getByText('v2.0.0')).toBeInTheDocument();
  });

  it('filters by type', async () => {
    render(<ChangelogPage searchParams={Promise.resolve({ type: 'feature' })} />);
    // Verify filter is applied
    expect(screen.getByRole('button', { name: /new features/i })).toHaveClass('bg-blue-50');
  });

  it('expands change details', () => {
    render(<ChangelogList type="all" entries={mockEntries} />);
    expect(screen.getByText('New dashboard')).toBeInTheDocument();
  });
});
```

### E2E Testing

```tsx
// e2e/changelog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Changelog Page', () => {
  test('displays changelog entries', async ({ page }) => {
    await page.goto('/changelog');
    await expect(page.getByRole('heading', { name: 'Changelog' })).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('filters by type', async ({ page }) => {
    await page.goto('/changelog');
    await page.click('text=New Features');
    await expect(page).toHaveURL(/type=feature/);
  });

  test('filters by year', async ({ page }) => {
    await page.goto('/changelog');
    await page.click('text=2024');
    await expect(page).toHaveURL(/year=2024/);
  });

  test('RSS feed link works', async ({ page }) => {
    await page.goto('/changelog');
    const rssLink = page.getByRole('link', { name: /rss/i });
    await expect(rssLink).toHaveAttribute('href', '/changelog/rss');
  });

  test('mobile filter drawer opens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/changelog');

    await page.click('text=Filters');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
```

### Accessibility Testing

```tsx
// __tests__/changelog-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChangelogList } from '@/components/changelog/changelog-list';

expect.extend(toHaveNoViolations);

describe('Changelog Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ChangelogList type="all" entries={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('timeline has proper structure', () => {
    const { container } = render(<ChangelogList type="all" entries={mockEntries} />);
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBeGreaterThan(0);
  });
});
```

## Related Skills

- [L3/announcement-banner](../organisms/announcement-banner.md) - Announcement banners
- [L4/blog-page](./blog-page.md) - Blog post pages
- [L5/release-management](../patterns/release-management.md) - Release workflows

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with timeline, filtering, and RSS feed
