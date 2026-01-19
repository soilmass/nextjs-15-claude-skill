---
id: r-changelog-manager
name: Changelog Manager
version: 1.0.0
layer: L6
category: recipes
description: Changelog and release notes management with versioning and notifications
tags: [developer-tools, changelog, releases, versioning, notifications, next15]
formula: "ChangelogManager = DashboardLayout(t-dashboard-layout) + Form(o-form) + DataTable(o-data-table) + RichText(pt-rich-text) + Webhooks(pt-webhooks)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/changelog-page.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  # L3 Organisms
  - ../organisms/data-table.md
  - ../organisms/sidebar.md
  - ../organisms/header.md
  - ../organisms/modal.md
  - ../organisms/activity-timeline.md
  # L2 Molecules
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/card.md
  - ../molecules/tabs.md
  # L5 Patterns
  - ../patterns/rich-text-editor.md
  - ../patterns/webhooks.md
  - ../patterns/rss.md
  - ../patterns/server-actions.md
  - ../patterns/form-validation.md
  - ../patterns/next-auth.md
  - ../patterns/prisma-setup.md
  - ../patterns/react-query.md
dependencies:
  next: "^15.1.0"
  prisma: "^6.0.0"
  semver: "^7.0.0"
  "@tanstack/react-query": "^5.0.0"
  resend: "^4.0.0"
  marked: "^15.0.0"
  feed: "^4.2.0"
performance:
  impact: medium
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Changelog Manager

## Overview

A complete changelog management system for SaaS products and developer tools. Features semantic versioning, categorized entries (added, changed, fixed, removed, security), rich text editing with markdown support, public changelog page with filtering, Git integration for auto-generation, email/RSS/webhook notifications, embeddable widget, and view analytics.

## Project Structure

```
changelog-manager/
app/
    (dashboard)/
        layout.tsx
        page.tsx                        # Dashboard overview
        releases/
            page.tsx                    # All releases
            new/page.tsx                # Create release
            [releaseId]/
                page.tsx                # Release detail
                edit/page.tsx           # Edit release
        entries/
            page.tsx                    # Manage entries
            new/page.tsx                # Create entry
        subscribers/page.tsx            # Email subscribers
        settings/page.tsx               # Webhook & notification settings
    (public)/
        changelog/
            page.tsx                    # Public changelog
            [version]/page.tsx          # Version detail
            rss/route.ts                # RSS feed
        widget/page.tsx                 # Embeddable widget
    api/
        releases/
            route.ts                    # CRUD releases
            [releaseId]/route.ts
            generate/route.ts           # Git integration
        entries/route.ts
        subscribers/
            route.ts
            confirm/route.ts
            unsubscribe/route.ts
        webhooks/
            deliver/route.ts
            test/route.ts
        analytics/route.ts
    layout.tsx
components/
    releases/
        release-form.tsx
        release-card.tsx
        release-timeline.tsx
        version-badge.tsx
    entries/
        entry-form.tsx
        entry-list.tsx
        category-badge.tsx
    changelog/
        changelog-list.tsx
        changelog-filter.tsx
        changelog-search.tsx
    widget/
        changelog-widget.tsx
        widget-embed-code.tsx
    editor/
        markdown-editor.tsx
        preview-panel.tsx
    ui/
lib/
    db.ts
    semver.ts
    git-parser.ts
    notifications.ts
    rss-generator.ts
    analytics.ts
prisma/
    schema.prisma
```

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(EDITOR)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  releases Release[]
  entries  Entry[]
}

enum UserRole {
  ADMIN
  EDITOR
  VIEWER
}

model Release {
  id          String        @id @default(cuid())
  version     String        @unique
  title       String?
  summary     String?       @db.Text

  // Semver components
  major       Int
  minor       Int
  patch       Int
  prerelease  String?       // alpha, beta, rc
  prereleaseNum Int?

  // Status
  status      ReleaseStatus @default(DRAFT)
  publishedAt DateTime?

  // Entries
  entries     Entry[]

  // Metadata
  gitTag      String?
  commitSha   String?
  compareUrl  String?

  // Author
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])

  // Analytics
  viewCount   Int           @default(0)

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([status])
  @@index([publishedAt])
  @@index([major, minor, patch])
}

enum ReleaseStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  ARCHIVED
}

model Entry {
  id          String        @id @default(cuid())
  category    EntryCategory
  title       String
  description String        @db.Text

  // Linking
  releaseId   String?
  release     Release?      @relation(fields: [releaseId], references: [id])

  // References
  prNumber    Int?
  issueNumbers Int[]
  commitShas  String[]

  // Breaking change flag
  isBreaking  Boolean       @default(false)

  // Author
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])

  // Order within release
  order       Int           @default(0)

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([releaseId])
  @@index([category])
}

enum EntryCategory {
  ADDED
  CHANGED
  DEPRECATED
  REMOVED
  FIXED
  SECURITY
}

model Subscriber {
  id              String   @id @default(cuid())
  email           String   @unique
  isVerified      Boolean  @default(false)
  verifyToken     String?  @unique
  unsubscribeToken String  @unique @default(cuid())

  // Preferences
  notifyMajor     Boolean  @default(true)
  notifyMinor     Boolean  @default(true)
  notifyPatch     Boolean  @default(false)
  notifySecurity  Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Webhook {
  id          String       @id @default(cuid())
  name        String
  url         String
  secret      String?
  isActive    Boolean      @default(true)

  // Events to trigger
  events      String[]     // ['release.published', 'security.alert']

  // Delivery tracking
  deliveries  WebhookDelivery[]

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model WebhookDelivery {
  id          String   @id @default(cuid())
  webhookId   String
  webhook     Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)

  event       String
  payload     Json

  // Response
  statusCode  Int?
  response    String?  @db.Text
  success     Boolean  @default(false)

  deliveredAt DateTime @default(now())

  @@index([webhookId])
}

model PageView {
  id        String   @id @default(cuid())
  releaseId String?
  path      String
  userAgent String?
  referer   String?
  country   String?
  viewedAt  DateTime @default(now())

  @@index([releaseId])
  @@index([viewedAt])
}
```

## Implementation

### Semver Utilities

```typescript
// lib/semver.ts
import semver from 'semver';

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
  prereleaseNum: number | null;
}

export function parseVersion(version: string): ParsedVersion | null {
  const parsed = semver.parse(version);
  if (!parsed) return null;

  let prerelease: string | null = null;
  let prereleaseNum: number | null = null;

  if (parsed.prerelease.length > 0) {
    const [tag, num] = parsed.prerelease;
    prerelease = String(tag);
    prereleaseNum = typeof num === 'number' ? num : null;
  }

  return {
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    prerelease,
    prereleaseNum,
  };
}

export function formatVersion(v: ParsedVersion): string {
  let version = `${v.major}.${v.minor}.${v.patch}`;
  if (v.prerelease) {
    version += `-${v.prerelease}`;
    if (v.prereleaseNum !== null) {
      version += `.${v.prereleaseNum}`;
    }
  }
  return version;
}

export function suggestNextVersion(
  current: string,
  type: 'major' | 'minor' | 'patch' | 'prerelease'
): string {
  const next = semver.inc(current, type);
  return next || current;
}

export function compareVersions(a: string, b: string): number {
  return semver.compare(a, b);
}

export function isPrerelease(version: string): boolean {
  const parsed = semver.parse(version);
  return parsed ? parsed.prerelease.length > 0 : false;
}
```

### Release Form Component

```tsx
// components/releases/release-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CalendarIcon, Tag, GitBranch } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { suggestNextVersion, parseVersion } from '@/lib/semver';

const releaseSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+(-\w+(\.\d+)?)?$/, 'Invalid semver'),
  title: z.string().max(200).optional(),
  summary: z.string().max(5000).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']),
  publishedAt: z.string().optional(),
  gitTag: z.string().optional(),
});

type ReleaseFormData = z.infer<typeof releaseSchema>;

interface ReleaseFormProps {
  release?: {
    id: string;
    version: string;
    title?: string;
    summary?: string;
    status: string;
    publishedAt?: string;
    gitTag?: string;
  };
  latestVersion?: string;
}

export function ReleaseForm({ release, latestVersion = '0.0.0' }: ReleaseFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [versionType, setVersionType] = useState<'major' | 'minor' | 'patch'>('patch');

  const form = useForm<ReleaseFormData>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      version: release?.version || suggestNextVersion(latestVersion, 'patch'),
      title: release?.title || '',
      summary: release?.summary || '',
      status: (release?.status as any) || 'DRAFT',
      publishedAt: release?.publishedAt,
      gitTag: release?.gitTag || '',
    },
  });

  const saveRelease = useMutation({
    mutationFn: async (data: ReleaseFormData) => {
      const url = release ? `/api/releases/${release.id}` : '/api/releases';
      const response = await fetch(url, {
        method: release ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save release');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      router.push(`/releases/${data.id}`);
    },
  });

  const handleVersionSuggestion = (type: 'major' | 'minor' | 'patch') => {
    setVersionType(type);
    const suggested = suggestNextVersion(latestVersion, type);
    form.setValue('version', suggested);
  };

  return (
    <form onSubmit={form.handleSubmit((d) => saveRelease.mutate(d))} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Version</label>
          <div className="flex gap-2 mb-2">
            {(['major', 'minor', 'patch'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={versionType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVersionSuggestion(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register('version')}
              placeholder="1.0.0"
              className="font-mono"
            />
          </div>
          {form.formState.errors.version && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.version.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title (optional)</label>
          <Input
            {...form.register('title')}
            placeholder="e.g., Performance Improvements"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Summary</label>
          <MarkdownEditor
            value={form.watch('summary') || ''}
            onChange={(value) => form.setValue('summary', value)}
            placeholder="Describe the highlights of this release..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={form.watch('status')}
              onValueChange={(v) => form.setValue('status', v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.watch('status') === 'SCHEDULED' && (
            <div>
              <label className="block text-sm font-medium mb-2">Publish Date</label>
              <Input
                type="datetime-local"
                {...form.register('publishedAt')}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Git Tag (optional)</label>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register('gitTag')}
              placeholder="v1.0.0"
              className="font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saveRelease.isPending}>
          {saveRelease.isPending ? 'Saving...' : release ? 'Update' : 'Create'} Release
        </Button>
      </div>
    </form>
  );
}
```

### Entry Form with Categories

```tsx
// components/entries/entry-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Sparkles, RefreshCw, Trash2, Bug, Shield, AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { CategoryBadge } from './category-badge';

const entrySchema = z.object({
  category: z.enum(['ADDED', 'CHANGED', 'DEPRECATED', 'REMOVED', 'FIXED', 'SECURITY']),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  prNumber: z.number().optional(),
  issueNumbers: z.array(z.number()).optional(),
  isBreaking: z.boolean().default(false),
  releaseId: z.string().optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

const categoryConfig = {
  ADDED: { icon: Plus, color: 'bg-green-100 text-green-800', label: 'Added' },
  CHANGED: { icon: RefreshCw, color: 'bg-blue-100 text-blue-800', label: 'Changed' },
  DEPRECATED: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800', label: 'Deprecated' },
  REMOVED: { icon: Trash2, color: 'bg-red-100 text-red-800', label: 'Removed' },
  FIXED: { icon: Bug, color: 'bg-purple-100 text-purple-800', label: 'Fixed' },
  SECURITY: { icon: Shield, color: 'bg-orange-100 text-orange-800', label: 'Security' },
};

interface EntryFormProps {
  entry?: any;
  releaseId?: string;
  onSuccess?: () => void;
}

export function EntryForm({ entry, releaseId, onSuccess }: EntryFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      category: entry?.category || 'ADDED',
      title: entry?.title || '',
      description: entry?.description || '',
      prNumber: entry?.prNumber,
      issueNumbers: entry?.issueNumbers || [],
      isBreaking: entry?.isBreaking || false,
      releaseId: releaseId || entry?.releaseId,
    },
  });

  const saveEntry = useMutation({
    mutationFn: async (data: EntryFormData) => {
      const url = entry ? `/api/entries/${entry.id}` : '/api/entries';
      const response = await fetch(url, {
        method: entry ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      form.reset();
      onSuccess?.();
    },
  });

  const selectedCategory = form.watch('category');

  return (
    <form onSubmit={form.handleSubmit((d) => saveEntry.mutate(d))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((cat) => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => form.setValue('category', cat)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  selectedCategory === cat
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input
          {...form.register('title')}
          placeholder="Brief description of the change"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <MarkdownEditor
          value={form.watch('description')}
          onChange={(v) => form.setValue('description', v)}
          placeholder="Detailed description with code examples..."
          minHeight={150}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">PR Number</label>
          <Input
            type="number"
            {...form.register('prNumber', { valueAsNumber: true })}
            placeholder="#123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Issue Numbers</label>
          <Input
            placeholder="#456, #789"
            onChange={(e) => {
              const nums = e.target.value
                .split(',')
                .map((s) => parseInt(s.replace(/\D/g, '')))
                .filter((n) => !isNaN(n));
              form.setValue('issueNumbers', nums);
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isBreaking"
          checked={form.watch('isBreaking')}
          onCheckedChange={(checked) => form.setValue('isBreaking', !!checked)}
        />
        <label htmlFor="isBreaking" className="text-sm font-medium cursor-pointer">
          Breaking Change
        </label>
        {form.watch('isBreaking') && (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
            BREAKING
          </span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={saveEntry.isPending}>
          {saveEntry.isPending ? 'Saving...' : entry ? 'Update' : 'Add'} Entry
        </Button>
      </div>
    </form>
  );
}
```

### Public Changelog Page

```tsx
// app/(public)/changelog/page.tsx
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { ChangelogList } from '@/components/changelog/changelog-list';
import { ChangelogFilter } from '@/components/changelog/changelog-filter';
import { ChangelogSearch } from '@/components/changelog/changelog-search';
import { Rss, Bell } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ChangelogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const pageSize = 10;

  const where: any = { status: 'PUBLISHED' };

  if (params.category) {
    where.entries = { some: { category: params.category } };
  }

  if (params.search) {
    where.OR = [
      { version: { contains: params.search, mode: 'insensitive' } },
      { title: { contains: params.search, mode: 'insensitive' } },
      { entries: { some: { title: { contains: params.search, mode: 'insensitive' } } } },
    ];
  }

  const [releases, total] = await Promise.all([
    db.release.findMany({
      where,
      include: {
        entries: { orderBy: { order: 'asc' } },
        author: { select: { name: true } },
      },
      orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.release.count({ where }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Changelog</h1>
              <p className="text-muted-foreground mt-1">
                Stay up to date with all product updates
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/changelog/rss"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </Link>
              <Link
                href="/subscribe"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Bell className="h-4 w-4" />
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex gap-8">
          <aside className="w-64 shrink-0">
            <Suspense fallback={<div>Loading filters...</div>}>
              <ChangelogFilter />
            </Suspense>
          </aside>

          <div className="flex-1">
            <div className="mb-6">
              <ChangelogSearch />
            </div>

            <ChangelogList
              releases={releases}
              total={total}
              page={page}
              pageSize={pageSize}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Changelog List Component

```tsx
// components/changelog/changelog-list.tsx
import { format } from 'date-fns';
import Link from 'next/link';
import { marked } from 'marked';
import { CategoryBadge } from '@/components/entries/category-badge';
import { ChevronRight, ExternalLink, GitCommit } from 'lucide-react';

interface Release {
  id: string;
  version: string;
  title?: string;
  summary?: string;
  publishedAt: Date;
  compareUrl?: string;
  entries: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    isBreaking: boolean;
    prNumber?: number;
  }>;
}

interface ChangelogListProps {
  releases: Release[];
  total: number;
  page: number;
  pageSize: number;
}

export function ChangelogList({ releases, total, page, pageSize }: ChangelogListProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (releases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No releases found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {releases.map((release) => (
        <article
          key={release.id}
          className="bg-white dark:bg-gray-800 rounded-xl border p-6"
        >
          <header className="flex items-start justify-between mb-4">
            <div>
              <Link
                href={`/changelog/${release.version}`}
                className="group flex items-center gap-2"
              >
                <h2 className="text-2xl font-bold font-mono">
                  v{release.version}
                </h2>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
              {release.title && (
                <p className="text-lg text-muted-foreground mt-1">
                  {release.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={release.publishedAt.toISOString()}>
                {format(release.publishedAt, 'MMMM d, yyyy')}
              </time>
              {release.compareUrl && (
                <a
                  href={release.compareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <GitCommit className="h-4 w-4" />
                  Compare
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </header>

          {release.summary && (
            <div
              className="prose dark:prose-invert max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: marked(release.summary) }}
            />
          )}

          <div className="space-y-4">
            {['ADDED', 'CHANGED', 'DEPRECATED', 'REMOVED', 'FIXED', 'SECURITY'].map(
              (category) => {
                const categoryEntries = release.entries.filter(
                  (e) => e.category === category
                );
                if (categoryEntries.length === 0) return null;

                return (
                  <div key={category}>
                    <CategoryBadge category={category} className="mb-2" />
                    <ul className="space-y-2 ml-4">
                      {categoryEntries.map((entry) => (
                        <li key={entry.id} className="flex items-start gap-2">
                          <span className="text-muted-foreground mt-1.5">-</span>
                          <div>
                            <span className="font-medium">{entry.title}</span>
                            {entry.isBreaking && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                BREAKING
                              </span>
                            )}
                            {entry.prNumber && (
                              <a
                                href={`https://github.com/org/repo/pull/${entry.prNumber}`}
                                className="ml-2 text-sm text-blue-600 hover:underline"
                              >
                                #{entry.prNumber}
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
            )}
          </div>
        </article>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/changelog?page=${p}`}
              className={`px-4 py-2 rounded-lg ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
```

## Git Integration

### Auto-generate from Commits

```typescript
// lib/git-parser.ts
interface ParsedCommit {
  sha: string;
  message: string;
  category: string;
  title: string;
  prNumber?: number;
  isBreaking: boolean;
}

const COMMIT_PATTERNS = {
  feat: 'ADDED',
  fix: 'FIXED',
  docs: 'CHANGED',
  style: 'CHANGED',
  refactor: 'CHANGED',
  perf: 'CHANGED',
  test: 'CHANGED',
  chore: 'CHANGED',
  revert: 'REMOVED',
  security: 'SECURITY',
  deprecate: 'DEPRECATED',
};

export function parseConventionalCommit(message: string, sha: string): ParsedCommit | null {
  // Pattern: type(scope)!: description (#PR)
  const pattern = /^(\w+)(?:\([\w-]+\))?(!)?:\s*(.+?)(?:\s*\(#(\d+)\))?$/;
  const match = message.match(pattern);

  if (!match) return null;

  const [, type, breaking, title, prNumber] = match;
  const category = COMMIT_PATTERNS[type.toLowerCase() as keyof typeof COMMIT_PATTERNS];

  if (!category) return null;

  return {
    sha,
    message,
    category,
    title: title.trim(),
    prNumber: prNumber ? parseInt(prNumber) : undefined,
    isBreaking: !!breaking || message.includes('BREAKING CHANGE'),
  };
}

export async function fetchGitHubCommits(
  owner: string,
  repo: string,
  since: string,
  until: string
): Promise<ParsedCommit[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&until=${until}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch commits from GitHub');
  }

  const commits = await response.json();
  return commits
    .map((c: any) => parseConventionalCommit(c.commit.message.split('\n')[0], c.sha))
    .filter(Boolean) as ParsedCommit[];
}
```

### Generate Release API

```typescript
// app/api/releases/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { fetchGitHubCommits, parseConventionalCommit } from '@/lib/git-parser';
import { suggestNextVersion } from '@/lib/semver';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { since, until, owner, repo } = await request.json();

  // Fetch latest version
  const latestRelease = await db.release.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
  });

  const latestVersion = latestRelease?.version || '0.0.0';

  // Fetch and parse commits
  const commits = await fetchGitHubCommits(owner, repo, since, until);

  if (commits.length === 0) {
    return NextResponse.json({ error: 'No conventional commits found' }, { status: 400 });
  }

  // Determine version bump type
  const hasBreaking = commits.some((c) => c.isBreaking);
  const hasFeatures = commits.some((c) => c.category === 'ADDED');
  const bumpType = hasBreaking ? 'major' : hasFeatures ? 'minor' : 'patch';

  const newVersion = suggestNextVersion(latestVersion, bumpType);

  // Create draft release with entries
  const release = await db.release.create({
    data: {
      version: newVersion,
      major: parseInt(newVersion.split('.')[0]),
      minor: parseInt(newVersion.split('.')[1]),
      patch: parseInt(newVersion.split('.')[2]),
      status: 'DRAFT',
      authorId: session.user.id,
      entries: {
        create: commits.map((commit, index) => ({
          category: commit.category as any,
          title: commit.title,
          description: `Auto-generated from commit ${commit.sha.slice(0, 7)}`,
          prNumber: commit.prNumber,
          isBreaking: commit.isBreaking,
          commitShas: [commit.sha],
          order: index,
          authorId: session.user.id,
        })),
      },
    },
    include: { entries: true },
  });

  return NextResponse.json(release);
}
```

## Notification System

### Email Subscribers

```typescript
// lib/notifications.ts
import { Resend } from 'resend';
import { db } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotifyOptions {
  releaseId: string;
  version: string;
  title?: string;
  summary?: string;
  isSecurityUpdate: boolean;
}

export async function notifySubscribers(options: NotifyOptions) {
  const { version, isSecurityUpdate } = options;

  // Determine version type
  const [major, minor, patch] = version.split('.').map(Number);
  const isMajor = minor === 0 && patch === 0;
  const isMinor = patch === 0 && !isMajor;
  const isPatch = !isMajor && !isMinor;

  // Find eligible subscribers
  const subscribers = await db.subscriber.findMany({
    where: {
      isVerified: true,
      OR: [
        { notifyMajor: isMajor },
        { notifyMinor: isMinor },
        { notifyPatch: isPatch },
        { notifySecurity: isSecurityUpdate },
      ],
    },
  });

  if (subscribers.length === 0) return { sent: 0 };

  // Send emails in batches
  const batchSize = 50;
  let sent = 0;

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (subscriber) => {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: subscriber.email,
            subject: `New Release: v${options.version}${options.title ? ` - ${options.title}` : ''}`,
            html: generateEmailHtml(options, subscriber.unsubscribeToken),
          });
          sent++;
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
        }
      })
    );
  }

  return { sent, total: subscribers.length };
}

function generateEmailHtml(options: NotifyOptions, unsubscribeToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1a1a1a;">Version ${options.version} Released</h1>
      ${options.title ? `<h2 style="color: #666; font-weight: normal;">${options.title}</h2>` : ''}
      ${options.summary ? `<div style="margin: 20px 0;">${options.summary}</div>` : ''}
      <a href="${baseUrl}/changelog/${options.version}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        View Full Changelog
      </a>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">
        <a href="${baseUrl}/unsubscribe/${unsubscribeToken}" style="color: #999;">Unsubscribe</a>
        from changelog updates
      </p>
    </body>
    </html>
  `;
}
```

### RSS Feed

```typescript
// app/(public)/changelog/rss/route.ts
import { Feed } from 'feed';
import { db } from '@/lib/db';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const releases = await db.release.findMany({
    where: { status: 'PUBLISHED' },
    include: { entries: true },
    orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
    take: 20,
  });

  const feed = new Feed({
    title: 'Product Changelog',
    description: 'Stay up to date with product updates',
    id: baseUrl,
    link: `${baseUrl}/changelog`,
    language: 'en',
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${baseUrl}/changelog/rss`,
      atom: `${baseUrl}/changelog/atom`,
    },
  });

  releases.forEach((release) => {
    const content = generateReleaseContent(release);

    feed.addItem({
      title: `v${release.version}${release.title ? ` - ${release.title}` : ''}`,
      id: `${baseUrl}/changelog/${release.version}`,
      link: `${baseUrl}/changelog/${release.version}`,
      description: release.summary || content.slice(0, 200),
      content,
      date: release.publishedAt || release.createdAt,
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function generateReleaseContent(release: any): string {
  const sections = ['ADDED', 'CHANGED', 'DEPRECATED', 'REMOVED', 'FIXED', 'SECURITY'];
  let content = '';

  sections.forEach((category) => {
    const entries = release.entries.filter((e: any) => e.category === category);
    if (entries.length > 0) {
      content += `<h3>${category}</h3><ul>`;
      entries.forEach((entry: any) => {
        content += `<li>${entry.title}${entry.isBreaking ? ' <strong>[BREAKING]</strong>' : ''}</li>`;
      });
      content += '</ul>';
    }
  });

  return content;
}
```

### Webhook Delivery

```typescript
// app/api/webhooks/deliver/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const { releaseId, event } = await request.json();

  const release = await db.release.findUnique({
    where: { id: releaseId },
    include: { entries: true },
  });

  if (!release) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 });
  }

  const webhooks = await db.webhook.findMany({
    where: {
      isActive: true,
      events: { has: event },
    },
  });

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    release: {
      version: release.version,
      title: release.title,
      summary: release.summary,
      publishedAt: release.publishedAt,
      entries: release.entries.map((e) => ({
        category: e.category,
        title: e.title,
        isBreaking: e.isBreaking,
      })),
    },
  };

  const results = await Promise.all(
    webhooks.map(async (webhook) => {
      const signature = webhook.secret
        ? crypto
            .createHmac('sha256', webhook.secret)
            .update(JSON.stringify(payload))
            .digest('hex')
        : undefined;

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(signature && { 'X-Webhook-Signature': `sha256=${signature}` }),
          },
          body: JSON.stringify(payload),
        });

        await db.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload,
            statusCode: response.status,
            success: response.ok,
          },
        });

        return { webhookId: webhook.id, success: response.ok };
      } catch (error) {
        await db.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload,
            success: false,
            response: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        return { webhookId: webhook.id, success: false };
      }
    })
  );

  return NextResponse.json({ delivered: results.filter((r) => r.success).length });
}
```

## Widget Embed

### Embeddable Widget Component

```tsx
// app/(public)/widget/page.tsx
import { db } from '@/lib/db';

export default async function WidgetPage() {
  const releases = await db.release.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      entries: {
        orderBy: { order: 'asc' },
        take: 5,
      },
    },
    orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
    take: 5,
  });

  return (
    <html>
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, sans-serif; font-size: 14px; }
          .widget { max-width: 400px; max-height: 500px; overflow-y: auto; }
          .release { padding: 16px; border-bottom: 1px solid #eee; }
          .version { font-weight: 600; font-family: monospace; }
          .date { font-size: 12px; color: #666; margin-left: 8px; }
          .entry { margin-top: 8px; padding-left: 12px; border-left: 2px solid; }
          .entry.ADDED { border-color: #22c55e; }
          .entry.FIXED { border-color: #a855f7; }
          .entry.CHANGED { border-color: #3b82f6; }
          .entry.SECURITY { border-color: #f97316; }
          .more { text-align: center; padding: 12px; }
          .more a { color: #2563eb; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div className="widget">
          {releases.map((release) => (
            <div key={release.id} className="release">
              <div>
                <span className="version">v{release.version}</span>
                <span className="date">
                  {release.publishedAt?.toLocaleDateString()}
                </span>
              </div>
              {release.entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className={`entry ${entry.category}`}>
                  {entry.title}
                </div>
              ))}
            </div>
          ))}
          <div className="more">
            <a href="/changelog" target="_blank">View all updates</a>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### Embed Code Generator

```tsx
// components/widget/widget-embed-code.tsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WidgetEmbedCode() {
  const [copied, setCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const embedCode = `<iframe
  src="${baseUrl}/widget"
  width="400"
  height="500"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Embed Widget</h3>
      <p className="text-sm text-muted-foreground">
        Add the changelog widget to your app or website.
      </p>
      <div className="relative">
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
          {embedCode}
        </pre>
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
```

## Analytics

### View Tracking

```typescript
// lib/analytics.ts
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function trackPageView(releaseId?: string, path: string = '/changelog') {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  const referer = headersList.get('referer');

  await db.pageView.create({
    data: {
      releaseId,
      path,
      userAgent,
      referer,
    },
  });

  if (releaseId) {
    await db.release.update({
      where: { id: releaseId },
      data: { viewCount: { increment: 1 } },
    });
  }
}

export async function getAnalytics(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalViews, viewsByDay, topReleases] = await Promise.all([
    db.pageView.count({
      where: { viewedAt: { gte: since } },
    }),
    db.$queryRaw`
      SELECT DATE(viewed_at) as date, COUNT(*) as views
      FROM "PageView"
      WHERE viewed_at >= ${since}
      GROUP BY DATE(viewed_at)
      ORDER BY date ASC
    `,
    db.release.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, version: true, viewCount: true },
      orderBy: { viewCount: 'desc' },
      take: 10,
    }),
  ]);

  return { totalViews, viewsByDay, topReleases };
}
```

## Testing

### Unit Tests

```typescript
// __tests__/lib/semver.test.ts
import { describe, it, expect } from 'vitest';
import { parseVersion, formatVersion, suggestNextVersion, compareVersions } from '@/lib/semver';

describe('semver utilities', () => {
  describe('parseVersion', () => {
    it('parses standard version', () => {
      const result = parseVersion('1.2.3');
      expect(result).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: null,
        prereleaseNum: null,
      });
    });

    it('parses prerelease version', () => {
      const result = parseVersion('2.0.0-beta.1');
      expect(result).toEqual({
        major: 2,
        minor: 0,
        patch: 0,
        prerelease: 'beta',
        prereleaseNum: 1,
      });
    });

    it('returns null for invalid version', () => {
      expect(parseVersion('invalid')).toBeNull();
    });
  });

  describe('suggestNextVersion', () => {
    it('suggests patch version', () => {
      expect(suggestNextVersion('1.2.3', 'patch')).toBe('1.2.4');
    });

    it('suggests minor version', () => {
      expect(suggestNextVersion('1.2.3', 'minor')).toBe('1.3.0');
    });

    it('suggests major version', () => {
      expect(suggestNextVersion('1.2.3', 'major')).toBe('2.0.0');
    });
  });

  describe('compareVersions', () => {
    it('compares versions correctly', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
      expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/releases.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, GET } from '@/app/api/releases/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  db: {
    release: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Releases API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/releases', () => {
    it('creates a new release', async () => {
      const { db } = await import('@/lib/db');
      (db.release.create as any).mockResolvedValue({
        id: 'test-id',
        version: '1.0.0',
        status: 'DRAFT',
      });

      const request = new NextRequest('http://localhost/api/releases', {
        method: 'POST',
        body: JSON.stringify({
          version: '1.0.0',
          title: 'Initial Release',
          status: 'DRAFT',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.version).toBe('1.0.0');
    });

    it('validates version format', async () => {
      const request = new NextRequest('http://localhost/api/releases', {
        method: 'POST',
        body: JSON.stringify({
          version: 'invalid',
          status: 'DRAFT',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/releases', () => {
    it('returns paginated releases', async () => {
      const { db } = await import('@/lib/db');
      (db.release.findMany as any).mockResolvedValue([
        { id: '1', version: '1.0.0' },
        { id: '2', version: '0.9.0' },
      ]);
      (db.release.count as any).mockResolvedValue(2);

      const request = new NextRequest('http://localhost/api/releases');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.releases).toHaveLength(2);
    });
  });
});
```

### E2E Tests

```typescript
// e2e/changelog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Changelog', () => {
  test('displays published releases', async ({ page }) => {
    await page.goto('/changelog');

    await expect(page.locator('h1')).toContainText('Changelog');
    await expect(page.locator('[data-testid="release-card"]').first()).toBeVisible();
  });

  test('filters by category', async ({ page }) => {
    await page.goto('/changelog');

    await page.click('[data-testid="filter-ADDED"]');
    await expect(page).toHaveURL(/category=ADDED/);
  });

  test('searches releases', async ({ page }) => {
    await page.goto('/changelog');

    await page.fill('[data-testid="search-input"]', 'security');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page).toHaveURL(/search=security/);
  });

  test('views release detail', async ({ page }) => {
    await page.goto('/changelog');

    await page.click('[data-testid="release-card"] a');
    await expect(page).toHaveURL(/\/changelog\/\d+\.\d+\.\d+/);
  });
});
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/changelog"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="changelog@yourdomain.com"

# GitHub (for Git integration)
GITHUB_TOKEN="ghp_xxxxx"
GITHUB_OWNER="your-org"
GITHUB_REPO="your-repo"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Product Changelog"
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Initial admin user created
- [ ] Email sender domain verified
- [ ] GitHub token with repo read access
- [ ] SSL certificate configured
- [ ] RSS feed accessible
- [ ] Widget iframe tested cross-origin
- [ ] Webhook signatures verified
- [ ] Analytics tracking confirmed

## Related Skills

- [rich-text-editor](../patterns/rich-text-editor.md) - Markdown editing
- [webhooks](../patterns/webhooks.md) - Webhook delivery
- [rss](../patterns/rss.md) - Feed generation
- [data-table](../organisms/data-table.md) - Release management UI

## Changelog

### v1.0.0 (2025-01-18)

- Initial changelog manager recipe
- Semantic versioning with prerelease support
- Entry categories: added, changed, fixed, removed, security, deprecated
- Rich text markdown editor
- Public changelog with search and filters
- Git integration for auto-generation
- Email subscriber notifications
- RSS feed generation
- Webhook delivery with signatures
- Embeddable widget
- View analytics tracking
