---
id: r-cms-headless
name: Headless CMS
version: 3.0.0
layer: L6
category: recipes
description: Enterprise headless CMS with content modeling, rich text editors, preview, publishing workflows, multi-language support, and API delivery
tags: [cms, headless, content-modeling, rich-text, publishing, multi-language, api, preview]
formula: "HeadlessCMS = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + ContentEditor(t-content-editor) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + ContentEditor(o-content-editor) + MediaLibrary(o-media-library) + SchemaBuilder(o-schema-builder) + PreviewPane(o-preview-pane) + DataTable(o-data-table) + Header(o-header) + Sidebar(o-sidebar) + TreeView(o-tree-view) + Modal(o-modal) + FilterBar(o-filter-bar) + FileUploader(o-file-uploader) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + DatePicker(m-date-picker) + SearchInput(m-search-input) + StatCard(m-stat-card) + Toast(m-toast) + Tabs(m-tabs) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + ImageOptimization(pt-image-optimization) + FileStorage(pt-file-storage) + CdnIntegration(pt-cdn-integration) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + Search(pt-search) + FullTextSearch(pt-full-text-search) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + RichTextEditor(pt-rich-text-editor) + Caching(pt-caching) + Webhooks(pt-webhooks) + ApiVersioning(pt-api-versioning) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/data-table.md
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/modal.md
  - ../organisms/filter-bar.md
  - ../organisms/file-uploader.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/date-picker.md
  - ../molecules/search-input.md
  - ../molecules/stat-card.md
  - ../molecules/toast.md
  - ../molecules/tabs.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/multi-tenancy.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Media
  - ../patterns/image-optimization.md
  - ../patterns/file-storage.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  - ../patterns/search.md
  - ../patterns/full-text-search.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Content
  - ../patterns/rich-text-editor.md
  - ../patterns/webhooks.md
  - ../patterns/api-versioning.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - react-hook-form
  - zod
  - "@radix-ui/react-dialog"
  - "@radix-ui/react-tabs"
  - "@radix-ui/react-popover"
  - "@tiptap/react"
  - lucide-react
  - date-fns
  - sharp
  - aws-sdk
  - meilisearch
skills:
  - content-modeling
  - rich-text-editing
  - media-management
  - publishing-workflows
  - multi-language
  - api-delivery
  - preview-mode
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Headless CMS

## Overview

A comprehensive headless CMS platform featuring:
- Flexible content modeling with custom field types
- Rich text editor with embedded media
- Media library with image optimization
- Publishing workflows with scheduling
- Multi-language content support
- Live preview with draft mode
- RESTful and GraphQL APIs
- Webhook notifications
- Full-text search with Meilisearch
- CDN integration for assets

## Architecture

```
+------------------------------------------------------------------+
|                        Next.js App                                |
+------------------------------------------------------------------+
|  Admin UI   |  Content API  |  Preview API  |  Media Service     |
|  (Dashboard)|  (REST/GQL)   |  (Draft Mode) |  (Optimization)    |
+------------------------------------------------------------------+
|                    Prisma ORM + PostgreSQL                        |
+------------------------------------------------------------------+
|  Content Types  |  Entries  |  Assets  |  Locales  |  Workflows  |
+------------------------------------------------------------------+
|       S3 Storage        |        CDN        |     Meilisearch    |
+------------------------------------------------------------------+
```

## Project Structure

```
headless-cms/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Dashboard overview
│   │   ├── content/
│   │   │   ├── page.tsx                  # Content types list
│   │   │   ├── [typeId]/
│   │   │   │   ├── page.tsx              # Entries list
│   │   │   │   └── [entryId]/
│   │   │   │       ├── page.tsx          # Entry editor
│   │   │   │       └── preview/page.tsx  # Preview mode
│   │   ├── models/
│   │   │   ├── page.tsx                  # Content models
│   │   │   ├── new/page.tsx              # Create model
│   │   │   └── [modelId]/
│   │   │       ├── page.tsx              # Model detail
│   │   │       └── edit/page.tsx         # Edit model
│   │   ├── media/
│   │   │   ├── page.tsx                  # Media library
│   │   │   └── [assetId]/page.tsx        # Asset detail
│   │   ├── locales/
│   │   │   ├── page.tsx                  # Locales list
│   │   │   └── [localeId]/page.tsx       # Locale settings
│   │   ├── workflows/
│   │   │   ├── page.tsx                  # Workflows list
│   │   │   └── [workflowId]/page.tsx     # Workflow detail
│   │   ├── webhooks/
│   │   │   ├── page.tsx                  # Webhooks list
│   │   │   └── [webhookId]/page.tsx      # Webhook detail
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── api-keys/page.tsx
│   │       ├── team/page.tsx
│   │       └── environments/page.tsx
│   ├── api/
│   │   ├── v1/
│   │   │   ├── content/
│   │   │   │   ├── route.ts              # List content types
│   │   │   │   └── [type]/
│   │   │   │       ├── route.ts          # List/create entries
│   │   │   │       └── [id]/route.ts     # CRUD entry
│   │   │   ├── assets/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── search/route.ts
│   │   ├── graphql/route.ts              # GraphQL endpoint
│   │   ├── preview/
│   │   │   ├── enter/route.ts
│   │   │   └── exit/route.ts
│   │   ├── media/
│   │   │   ├── upload/route.ts
│   │   │   └── [id]/route.ts
│   │   ├── models/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── publish/route.ts
│   │   └── webhooks/
│   │       └── trigger/route.ts
│   ├── preview/
│   │   └── [...slug]/page.tsx            # Preview pages
│   └── layout.tsx
├── components/
│   ├── content/
│   │   ├── content-editor.tsx
│   │   ├── entry-list.tsx
│   │   ├── field-renderer.tsx
│   │   └── entry-sidebar.tsx
│   ├── models/
│   │   ├── schema-builder.tsx
│   │   ├── field-config.tsx
│   │   ├── field-types.tsx
│   │   └── validation-rules.tsx
│   ├── media/
│   │   ├── media-library.tsx
│   │   ├── media-picker.tsx
│   │   ├── image-editor.tsx
│   │   └── upload-zone.tsx
│   ├── preview/
│   │   ├── preview-pane.tsx
│   │   ├── preview-toolbar.tsx
│   │   └── device-frame.tsx
│   ├── localization/
│   │   ├── locale-switcher.tsx
│   │   ├── translation-status.tsx
│   │   └── locale-manager.tsx
│   ├── workflows/
│   │   ├── workflow-builder.tsx
│   │   ├── status-badge.tsx
│   │   └── publish-button.tsx
│   └── ui/
├── lib/
│   ├── cms.ts
│   ├── content.ts
│   ├── media.ts
│   ├── search.ts
│   ├── webhooks.ts
│   ├── preview.ts
│   └── graphql/
│       ├── schema.ts
│       └── resolvers.ts
├── hooks/
│   ├── use-content.ts
│   ├── use-media.ts
│   └── use-preview.ts
└── prisma/
    └── schema.prisma
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| content-editor | L3 | Rich content editing |
| media-library | L3 | Asset management |
| schema-builder | L3 | Content model design |
| preview-pane | L3 | Live content preview |
| rich-text-editor | L5 | WYSIWYG editing |
| file-storage | L5 | Media storage |
| full-text-search | L5 | Content search |
| webhooks | L5 | External integrations |

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

model Space {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?

  // Settings
  defaultLocale   String   @default("en")

  // API
  apiId           String   @unique @default(cuid())

  members         SpaceMember[]
  contentTypes    ContentType[]
  entries         Entry[]
  assets          Asset[]
  locales         Locale[]
  environments    Environment[]
  apiKeys         ApiKey[]
  webhooks        Webhook[]
  workflows       Workflow[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  avatar        String?
  passwordHash  String

  memberships   SpaceMember[]
  entries       Entry[]      @relation("author")
  publishedBy   Entry[]      @relation("publisher")
  auditLogs     AuditLog[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SpaceMember {
  id        String      @id @default(cuid())
  spaceId   String
  userId    String
  role      MemberRole  @default(EDITOR)

  space     Space       @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime    @default(now())

  @@unique([spaceId, userId])
}

enum MemberRole {
  OWNER
  ADMIN
  EDITOR
  AUTHOR
  VIEWER
}

model Environment {
  id          String   @id @default(cuid())
  spaceId     String
  name        String
  alias       String?  // e.g., "master", "staging"
  description String?

  // Branching
  parentId    String?

  space       Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  parent      Environment? @relation("branches", fields: [parentId], references: [id])
  branches    Environment[] @relation("branches")

  entries     Entry[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([spaceId, alias])
}

model Locale {
  id          String   @id @default(cuid())
  spaceId     String
  code        String   // e.g., "en-US", "fr-FR"
  name        String   // e.g., "English (US)"
  isDefault   Boolean  @default(false)
  fallbackLocaleId String?

  space       Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  fallback    Locale?  @relation("fallback", fields: [fallbackLocaleId], references: [id])
  fallbacks   Locale[] @relation("fallback")

  createdAt   DateTime @default(now())

  @@unique([spaceId, code])
}

model ContentType {
  id           String   @id @default(cuid())
  spaceId      String
  name         String
  apiId        String   // URL-safe identifier
  description  String?
  displayField String?  // Field to use as title

  // Settings
  isPublishable Boolean @default(true)
  isVersioned  Boolean  @default(true)

  space        Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  fields       Field[]
  entries      Entry[]
  workflows    Workflow[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([spaceId, apiId])
}

model Field {
  id             String      @id @default(cuid())
  contentTypeId  String
  name           String
  apiId          String      // URL-safe identifier
  description    String?
  type           FieldType

  // Validation
  required       Boolean     @default(false)
  localized      Boolean     @default(false)
  unique         Boolean     @default(false)

  // Configuration (JSON based on field type)
  config         Json?

  // Appearance
  helpText       String?
  placeholder    String?

  // Ordering
  position       Int         @default(0)

  // Grouping
  fieldGroup     String?

  contentType    ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@unique([contentTypeId, apiId])
  @@index([contentTypeId, position])
}

enum FieldType {
  TEXT
  RICH_TEXT
  NUMBER
  BOOLEAN
  DATE
  DATETIME
  JSON
  MEDIA
  REFERENCE
  ARRAY
  LOCATION
  COLOR
  SLUG
  URL
  EMAIL
}

model Entry {
  id             String        @id @default(cuid())
  spaceId        String
  contentTypeId  String
  environmentId  String

  // Content (localized JSON)
  fields         Json

  // Publishing
  status         EntryStatus   @default(DRAFT)
  publishedAt    DateTime?
  scheduledAt    DateTime?

  // Versioning
  version        Int           @default(1)

  // Authors
  authorId       String
  publishedById  String?

  // Workflow
  workflowStageId String?

  space          Space         @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  contentType    ContentType   @relation(fields: [contentTypeId], references: [id])
  environment    Environment   @relation(fields: [environmentId], references: [id])
  author         User          @relation("author", fields: [authorId], references: [id])
  publishedBy    User?         @relation("publisher", fields: [publishedById], references: [id])
  workflowStage  WorkflowStage? @relation(fields: [workflowStageId], references: [id])

  versions       EntryVersion[]
  references     EntryReference[] @relation("source")
  referencedBy   EntryReference[] @relation("target")

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([spaceId, contentTypeId])
  @@index([status])
  @@index([publishedAt])
}

enum EntryStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  PUBLISHED
  ARCHIVED
  SCHEDULED
}

model EntryVersion {
  id          String   @id @default(cuid())
  entryId     String
  version     Int
  fields      Json
  status      EntryStatus
  publishedAt DateTime?
  createdById String

  entry       Entry    @relation(fields: [entryId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())

  @@unique([entryId, version])
  @@index([entryId])
}

model EntryReference {
  id          String @id @default(cuid())
  sourceId    String
  targetId    String
  fieldApiId  String

  source      Entry  @relation("source", fields: [sourceId], references: [id], onDelete: Cascade)
  target      Entry  @relation("target", fields: [targetId], references: [id], onDelete: Cascade)

  @@unique([sourceId, targetId, fieldApiId])
}

model Asset {
  id           String      @id @default(cuid())
  spaceId      String

  // File info
  filename     String
  mimeType     String
  size         Int         // bytes

  // URLs
  url          String
  thumbnailUrl String?

  // Image metadata
  width        Int?
  height       Int?

  // Localized fields
  title        Json?       // { "en": "Title", "fr": "Titre" }
  description  Json?
  altText      Json?

  // Organization
  folder       String?
  tags         String[]

  // Storage
  storageKey   String      @unique

  space        Space       @relation(fields: [spaceId], references: [id], onDelete: Cascade)

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([spaceId])
  @@index([folder])
  @@index([mimeType])
}

model Workflow {
  id            String         @id @default(cuid())
  spaceId       String
  contentTypeId String?        // null = applies to all
  name          String
  description   String?
  isDefault     Boolean        @default(false)

  space         Space          @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  contentType   ContentType?   @relation(fields: [contentTypeId], references: [id])
  stages        WorkflowStage[]

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([spaceId])
}

model WorkflowStage {
  id           String      @id @default(cuid())
  workflowId   String
  name         String
  color        String?
  position     Int

  // Permissions
  allowedRoles MemberRole[]

  // Actions
  canPublish   Boolean     @default(false)

  workflow     Workflow    @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  entries      Entry[]

  @@unique([workflowId, position])
}

model ApiKey {
  id          String    @id @default(cuid())
  spaceId     String
  name        String
  keyPrefix   String    // First 8 chars
  hashedKey   String    @unique

  // Permissions
  permissions String[]  // ["content:read", "content:write", "assets:read"]

  // Environment access
  environments String[] // Environment IDs, empty = all

  // Rate limiting
  rateLimit   Int       @default(1000)

  // Usage tracking
  lastUsedAt  DateTime?

  space       Space     @relation(fields: [spaceId], references: [id], onDelete: Cascade)

  createdAt   DateTime  @default(now())
  expiresAt   DateTime?

  @@index([spaceId])
}

model Webhook {
  id          String        @id @default(cuid())
  spaceId     String
  name        String
  url         String
  secret      String

  // Events to trigger
  events      String[]      // ["entry.publish", "entry.unpublish", "asset.create"]

  // Filters
  contentTypes String[]     // Content type IDs to filter

  // Status
  isActive    Boolean       @default(true)

  space       Space         @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  deliveries  WebhookDelivery[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([spaceId])
}

model WebhookDelivery {
  id           String        @id @default(cuid())
  webhookId    String
  event        String
  payload      Json
  status       DeliveryStatus
  statusCode   Int?
  responseBody String?
  duration     Int?          // ms
  attempts     Int           @default(1)

  webhook      Webhook       @relation(fields: [webhookId], references: [id], onDelete: Cascade)

  createdAt    DateTime      @default(now())

  @@index([webhookId])
  @@index([status])
}

enum DeliveryStatus {
  PENDING
  SUCCESS
  FAILED
}

model AuditLog {
  id        String   @id @default(cuid())
  spaceId   String
  userId    String?
  action    String
  entityType String
  entityId  String?
  changes   Json?
  metadata  Json?
  ipAddress String?

  user      User?    @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([spaceId])
  @@index([action])
  @@index([createdAt])
}
```

## Implementation

### Content Editor

```tsx
// components/content/content-editor.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Eye, Globe, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FieldRenderer } from './field-renderer';
import { LocaleSwitcher } from '@/components/localization/locale-switcher';
import { EntrySidebar } from './entry-sidebar';
import { PreviewPane } from '@/components/preview/preview-pane';
import { toast } from 'sonner';

interface Field {
  id: string;
  name: string;
  apiId: string;
  type: string;
  required: boolean;
  localized: boolean;
  config: any;
  helpText: string | null;
  position: number;
  fieldGroup: string | null;
}

interface ContentType {
  id: string;
  name: string;
  apiId: string;
  displayField: string | null;
  fields: Field[];
}

interface Entry {
  id: string;
  fields: Record<string, any>;
  status: string;
  version: number;
  publishedAt: string | null;
}

interface ContentEditorProps {
  spaceId: string;
  contentType: ContentType;
  entry?: Entry;
  locales: { code: string; name: string; isDefault: boolean }[];
}

export function ContentEditor({
  spaceId,
  contentType,
  entry,
  locales,
}: ContentEditorProps) {
  const [activeLocale, setActiveLocale] = useState(
    locales.find((l) => l.isDefault)?.code || 'en'
  );
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  // Generate Zod schema from content type fields
  const validationSchema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};

    contentType.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'TEXT':
          fieldSchema = z.string();
          if (field.config?.maxLength) {
            fieldSchema = (fieldSchema as z.ZodString).max(field.config.maxLength);
          }
          break;
        case 'RICH_TEXT':
          fieldSchema = z.any();
          break;
        case 'NUMBER':
          fieldSchema = z.number();
          if (field.config?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(field.config.min);
          }
          if (field.config?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(field.config.max);
          }
          break;
        case 'BOOLEAN':
          fieldSchema = z.boolean();
          break;
        case 'DATE':
        case 'DATETIME':
          fieldSchema = z.string().or(z.date());
          break;
        case 'MEDIA':
          fieldSchema = z.string().or(z.array(z.string()));
          break;
        case 'REFERENCE':
          fieldSchema = z.string().or(z.array(z.string()));
          break;
        default:
          fieldSchema = z.any();
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional().nullable();
      }

      // Handle localized fields
      if (field.localized) {
        shape[field.apiId] = z.record(z.string(), fieldSchema);
      } else {
        shape[field.apiId] = fieldSchema;
      }
    });

    return z.object(shape);
  }, [contentType.fields]);

  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: entry?.fields || {},
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = entry
        ? `/api/v1/content/${contentType.apiId}/${entry.id}`
        : `/api/v1/content/${contentType.apiId}`;

      const res = await fetch(url, {
        method: entry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: data }),
      });

      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entry', data.id] });
      toast.success('Entry saved');
    },
    onError: () => {
      toast.error('Failed to save entry');
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!entry) throw new Error('No entry to publish');

      const res = await fetch(`/api/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: entry.id,
          contentTypeId: contentType.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to publish');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry', entry?.id] });
      toast.success('Entry published');
    },
  });

  // Group fields by fieldGroup
  const fieldGroups = useMemo(() => {
    const groups: Record<string, Field[]> = { default: [] };

    contentType.fields
      .sort((a, b) => a.position - b.position)
      .forEach((field) => {
        const group = field.fieldGroup || 'default';
        if (!groups[group]) groups[group] = [];
        groups[group].push(field);
      });

    return groups;
  }, [contentType.fields]);

  const groupNames = Object.keys(fieldGroups).filter((g) => g !== 'default');

  const handleSave = form.handleSubmit((data) => {
    saveMutation.mutate(data);
  });

  return (
    <div className="flex h-full">
      {/* Main Editor */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {entry
                  ? form.watch(contentType.displayField || '') || 'Untitled'
                  : `New ${contentType.name}`}
              </h1>
              <p className="text-sm text-gray-500">{contentType.name}</p>
            </div>

            <div className="flex items-center gap-2">
              {locales.length > 1 && (
                <LocaleSwitcher
                  locales={locales}
                  activeLocale={activeLocale}
                  onChange={setActiveLocale}
                />
              )}

              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>

              {entry && entry.status !== 'PUBLISHED' && (
                <Button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              )}
            </div>
          </div>

          {/* Field Groups */}
          {groupNames.length > 0 ? (
            <Tabs defaultValue="default" className="space-y-6">
              <TabsList>
                <TabsTrigger value="default">Content</TabsTrigger>
                {groupNames.map((group) => (
                  <TabsTrigger key={group} value={group}>
                    {group}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="default" className="space-y-6">
                {fieldGroups.default.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    control={form.control}
                    locale={activeLocale}
                    errors={form.formState.errors}
                  />
                ))}
              </TabsContent>

              {groupNames.map((group) => (
                <TabsContent key={group} value={group} className="space-y-6">
                  {fieldGroups[group].map((field) => (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      control={form.control}
                      locale={activeLocale}
                      errors={form.formState.errors}
                    />
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-6">
              {contentType.fields
                .sort((a, b) => a.position - b.position)
                .map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    control={form.control}
                    locale={activeLocale}
                    errors={form.formState.errors}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {entry && (
        <EntrySidebar
          entry={entry}
          contentType={contentType}
          onPublish={() => publishMutation.mutate()}
          onSchedule={(date) => {}}
        />
      )}

      {/* Preview Pane */}
      {showPreview && (
        <PreviewPane
          spaceId={spaceId}
          contentType={contentType}
          fields={form.watch()}
          locale={activeLocale}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
```

### Field Renderer

```tsx
// components/content/field-renderer.tsx
'use client';

import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { RichTextEditor } from '@/components/content/rich-text-editor';
import { MediaPicker } from '@/components/media/media-picker';
import { ReferencePicker } from '@/components/content/reference-picker';
import { Badge } from '@/components/ui/badge';

interface Field {
  id: string;
  name: string;
  apiId: string;
  type: string;
  required: boolean;
  localized: boolean;
  config: any;
  helpText: string | null;
}

interface FieldRendererProps {
  field: Field;
  control: Control<any>;
  locale: string;
  errors: FieldErrors;
}

export function FieldRenderer({
  field,
  control,
  locale,
  errors,
}: FieldRendererProps) {
  const fieldName = field.localized ? `${field.apiId}.${locale}` : field.apiId;
  const error = getNestedError(errors, fieldName);

  const renderField = () => {
    switch (field.type) {
      case 'TEXT':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              field.config?.multiline ? (
                <Textarea
                  {...f}
                  placeholder={field.config?.placeholder}
                  maxLength={field.config?.maxLength}
                />
              ) : (
                <Input
                  {...f}
                  type="text"
                  placeholder={field.config?.placeholder}
                  maxLength={field.config?.maxLength}
                />
              )
            )}
          />
        );

      case 'RICH_TEXT':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <RichTextEditor
                content={f.value}
                onChange={f.onChange}
                config={field.config}
              />
            )}
          />
        );

      case 'NUMBER':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <Input
                type="number"
                value={f.value ?? ''}
                onChange={(e) => f.onChange(e.target.valueAsNumber || null)}
                min={field.config?.min}
                max={field.config?.max}
                step={field.config?.step || 1}
              />
            )}
          />
        );

      case 'BOOLEAN':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={f.value ?? false}
                  onCheckedChange={f.onChange}
                />
                <span className="text-sm">
                  {f.value ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          />
        );

      case 'DATE':
      case 'DATETIME':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <DatePicker
                date={f.value ? new Date(f.value) : undefined}
                onSelect={(date) => f.onChange(date?.toISOString())}
                showTime={field.type === 'DATETIME'}
              />
            )}
          />
        );

      case 'MEDIA':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <MediaPicker
                value={f.value}
                onChange={f.onChange}
                multiple={field.config?.multiple}
                accept={field.config?.accept}
              />
            )}
          />
        );

      case 'REFERENCE':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <ReferencePicker
                value={f.value}
                onChange={f.onChange}
                contentTypes={field.config?.allowedContentTypes}
                multiple={field.config?.multiple}
              />
            )}
          />
        );

      case 'SLUG':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <div className="flex gap-2">
                <Input
                  {...f}
                  placeholder="url-friendly-slug"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Generate slug from title field
                    const titleField = field.config?.sourceField;
                    if (titleField) {
                      const title = control._formValues[titleField];
                      const slug = generateSlug(title);
                      f.onChange(slug);
                    }
                  }}
                >
                  Generate
                </Button>
              </div>
            )}
          />
        );

      case 'JSON':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <Textarea
                value={typeof f.value === 'string' ? f.value : JSON.stringify(f.value, null, 2)}
                onChange={(e) => {
                  try {
                    f.onChange(JSON.parse(e.target.value));
                  } catch {
                    f.onChange(e.target.value);
                  }
                }}
                className="font-mono min-h-[200px]"
              />
            )}
          />
        );

      default:
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: f }) => (
              <Input {...f} />
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={fieldName} className="font-medium">
          {field.name}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {field.localized && (
          <Badge variant="outline" className="text-xs">
            Localized
          </Badge>
        )}
      </div>

      {renderField()}

      {field.helpText && (
        <p className="text-sm text-gray-500">{field.helpText}</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}

function getNestedError(errors: any, path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], errors);
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
```

### Media Library

```tsx
// components/media/media-library.tsx
'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Grid,
  List,
  Upload,
  Search,
  Folder,
  Image as ImageIcon,
  File,
  Trash2,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatBytes, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Asset {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  folder: string | null;
  createdAt: string;
}

interface MediaLibraryProps {
  spaceId: string;
  onSelect?: (assets: Asset[]) => void;
  multiple?: boolean;
  accept?: string[];
}

export function MediaLibrary({
  spaceId,
  onSelect,
  multiple = false,
  accept,
}: MediaLibraryProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch assets
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ['assets', spaceId, folder, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (folder) params.set('folder', folder);
      if (search) params.set('search', search);

      const res = await fetch(`/api/v1/assets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch assets');
      return res.json();
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      if (folder) formData.append('folder', folder);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', spaceId] });
      toast.success('Files uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload files');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetIds: string[]) => {
      await Promise.all(
        assetIds.map((id) =>
          fetch(`/api/media/${id}`, { method: 'DELETE' })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', spaceId] });
      setSelected([]);
      toast.success('Assets deleted');
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      uploadMutation.mutate(acceptedFiles);
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept
      ? accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
      : undefined,
    noClick: true,
  });

  const toggleSelect = (assetId: string) => {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(assetId)
          ? prev.filter((id) => id !== assetId)
          : [...prev, assetId]
      );
    } else {
      setSelected([assetId]);
    }
  };

  const handleSelect = () => {
    if (onSelect && assets) {
      const selectedAssets = assets.filter((a) => selected.includes(a.id));
      onSelect(selectedAssets);
    }
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <div {...getRootProps()} className="h-full flex flex-col">
      <input {...getInputProps()} />

      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="pl-9"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          >
            {view === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteMutation.mutate(selected)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selected.length})
              </Button>

              {onSelect && (
                <Button size="sm" onClick={handleSelect}>
                  Select ({selected.length})
                </Button>
              )}
            </>
          )}

          <Button
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Drop zone overlay */}
      {isDragActive && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-50">
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-blue-500 mb-2" />
            <p className="text-blue-700 font-medium">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets?.map((asset) => (
              <div
                key={asset.id}
                onClick={() => toggleSelect(asset.id)}
                className={`group relative aspect-square border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selected.includes(asset.id)
                    ? 'ring-2 ring-blue-500'
                    : 'hover:ring-2 hover:ring-gray-300'
                }`}
              >
                {isImage(asset.mimeType) ? (
                  <img
                    src={asset.thumbnailUrl || asset.url}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <File className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="text-white text-xs truncate">
                    {asset.filename}
                  </div>
                </div>

                {/* Selection indicator */}
                {selected.includes(asset.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">Uploaded</th>
                <th className="pb-2 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {assets?.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => toggleSelect(asset.id)}
                  className={`border-b cursor-pointer ${
                    selected.includes(asset.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {isImage(asset.mimeType) ? (
                        <img
                          src={asset.thumbnailUrl || asset.url}
                          alt={asset.filename}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <File className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <span className="truncate max-w-[200px]">
                        {asset.filename}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{asset.mimeType}</td>
                  <td className="py-3 text-gray-500">{formatBytes(asset.size)}</td>
                  <td className="py-3 text-gray-500">
                    {formatDate(asset.createdAt)}
                  </td>
                  <td className="py-3">
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {assets?.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-900">No assets</h3>
            <p className="text-gray-500 mt-1">
              Upload files or drag and drop to get started
            </p>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {uploadMutation.isPending && (
        <div className="border-t p-4 bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-blue-700">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Content API

```tsx
// app/api/v1/content/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey } from '@/lib/api-keys';
import { indexEntry, removeEntry } from '@/lib/search';
import { triggerWebhooks } from '@/lib/webhooks';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const apiKey = await verifyApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale');
  const status = searchParams.get('status') || 'PUBLISHED';
  const limit = parseInt(searchParams.get('limit') || '100');
  const skip = parseInt(searchParams.get('skip') || '0');
  const orderBy = searchParams.get('orderBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  // Find content type
  const contentType = await prisma.contentType.findFirst({
    where: {
      spaceId: apiKey.spaceId,
      apiId: params.type,
    },
    include: { fields: true },
  });

  if (!contentType) {
    return NextResponse.json({ error: 'Content type not found' }, { status: 404 });
  }

  // Build query
  const where: any = {
    contentTypeId: contentType.id,
    spaceId: apiKey.spaceId,
  };

  if (status !== 'all') {
    where.status = status.toUpperCase();
  }

  // Execute query
  const [entries, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      orderBy: { [orderBy]: order },
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.entry.count({ where }),
  ]);

  // Transform entries for API response
  const items = entries.map((entry) => transformEntry(entry, contentType.fields, locale));

  return NextResponse.json({
    items,
    total,
    limit,
    skip,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const apiKey = await verifyApiKey(request);
  if (!apiKey || !apiKey.permissions.includes('content:write')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { fields, status = 'DRAFT' } = body;

  // Find content type
  const contentType = await prisma.contentType.findFirst({
    where: {
      spaceId: apiKey.spaceId,
      apiId: params.type,
    },
    include: { fields: true },
  });

  if (!contentType) {
    return NextResponse.json({ error: 'Content type not found' }, { status: 404 });
  }

  // Validate fields
  const validationResult = validateFields(fields, contentType.fields);
  if (!validationResult.valid) {
    return NextResponse.json(
      { error: 'Validation failed', details: validationResult.errors },
      { status: 400 }
    );
  }

  // Get default environment
  const environment = await prisma.environment.findFirst({
    where: { spaceId: apiKey.spaceId, alias: 'master' },
  });

  if (!environment) {
    return NextResponse.json({ error: 'No environment found' }, { status: 400 });
  }

  // Create entry
  const entry = await prisma.entry.create({
    data: {
      spaceId: apiKey.spaceId,
      contentTypeId: contentType.id,
      environmentId: environment.id,
      fields,
      status: status.toUpperCase(),
      authorId: apiKey.userId || 'system',
    },
  });

  // Index in search
  await indexEntry(entry, contentType);

  // Trigger webhooks
  await triggerWebhooks(apiKey.spaceId, 'entry.create', {
    entry: transformEntry(entry, contentType.fields),
    contentType: contentType.apiId,
  });

  return NextResponse.json(transformEntry(entry, contentType.fields), { status: 201 });
}

function transformEntry(entry: any, fields: any[], locale?: string | null) {
  const transformed: any = {
    id: entry.id,
    status: entry.status.toLowerCase(),
    version: entry.version,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    publishedAt: entry.publishedAt,
  };

  // Transform fields based on locale
  transformed.fields = {};
  for (const field of fields) {
    const value = entry.fields[field.apiId];

    if (field.localized && locale && typeof value === 'object') {
      // Return specific locale value with fallback
      transformed.fields[field.apiId] = value[locale] ?? value['en'] ?? null;
    } else {
      transformed.fields[field.apiId] = value;
    }
  }

  return transformed;
}

function validateFields(fields: any, fieldDefinitions: any[]) {
  const errors: string[] = [];

  for (const def of fieldDefinitions) {
    const value = fields[def.apiId];

    if (def.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field "${def.name}" is required`);
    }

    // Additional validation based on field type...
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Preview Mode

```tsx
// app/api/preview/enter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { draftMode, cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const entryId = searchParams.get('entry');
  const redirect = searchParams.get('redirect') || '/';

  // Validate secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Validate entry exists
  if (entryId) {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Set preview cookie with entry info
  const cookieStore = await cookies();
  cookieStore.set('preview-entry', entryId || '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return NextResponse.redirect(new URL(redirect, request.url));
}
```

```tsx
// app/api/preview/exit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { draftMode, cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get('redirect') || '/';

  const draft = await draftMode();
  draft.disable();

  const cookieStore = await cookies();
  cookieStore.delete('preview-entry');

  return NextResponse.redirect(new URL(redirect, request.url));
}
```

## Testing

### Unit Tests

```tsx
// __tests__/lib/content.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateFields,
  transformEntry,
  generateSlug,
  mergeLocales,
} from '@/lib/content';

describe('validateFields', () => {
  const fieldDefinitions = [
    { apiId: 'title', name: 'Title', type: 'TEXT', required: true },
    { apiId: 'body', name: 'Body', type: 'RICH_TEXT', required: false },
    { apiId: 'count', name: 'Count', type: 'NUMBER', required: true, config: { min: 0 } },
  ];

  it('validates required fields', () => {
    const result = validateFields({ body: 'content' }, fieldDefinitions);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Field "Title" is required');
    expect(result.errors).toContain('Field "Count" is required');
  });

  it('passes validation for valid fields', () => {
    const result = validateFields(
      { title: 'Test', count: 5 },
      fieldDefinitions
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('transformEntry', () => {
  it('extracts locale-specific values', () => {
    const entry = {
      id: '1',
      fields: {
        title: { en: 'English', fr: 'French' },
        slug: 'test-slug',
      },
      status: 'PUBLISHED',
    };

    const fields = [
      { apiId: 'title', localized: true },
      { apiId: 'slug', localized: false },
    ];

    const result = transformEntry(entry, fields, 'fr');

    expect(result.fields.title).toBe('French');
    expect(result.fields.slug).toBe('test-slug');
  });

  it('falls back to default locale', () => {
    const entry = {
      id: '1',
      fields: { title: { en: 'English' } },
      status: 'DRAFT',
    };

    const fields = [{ apiId: 'title', localized: true }];

    const result = transformEntry(entry, fields, 'de');

    expect(result.fields.title).toBe('English');
  });
});

describe('generateSlug', () => {
  it('converts text to URL-safe slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
    expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    expect(generateSlug('Special @#$ Characters!')).toBe('special-characters');
  });
});
```

### E2E Tests

```tsx
// e2e/cms.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Headless CMS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
  });

  test('creates new content type', async ({ page }) => {
    await page.goto('/models/new');

    await page.fill('[data-testid="model-name"]', 'Blog Post');
    await page.fill('[data-testid="model-api-id"]', 'blogPost');

    // Add title field
    await page.click('[data-testid="add-field"]');
    await page.click('[data-testid="field-type-text"]');
    await page.fill('[data-testid="field-name"]', 'Title');
    await page.fill('[data-testid="field-api-id"]', 'title');
    await page.check('[data-testid="field-required"]');
    await page.click('[data-testid="save-field"]');

    // Save model
    await page.click('[data-testid="save-model"]');

    await expect(page).toHaveURL(/\/models\/[\w-]+/);
  });

  test('creates and publishes entry', async ({ page }) => {
    await page.goto('/content/blogPost/new');

    await page.fill('[data-testid="field-title"]', 'Test Blog Post');
    await page.fill('[data-testid="field-body"]', 'This is test content.');

    // Save
    await page.click('[data-testid="save-entry"]');
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();

    // Publish
    await page.click('[data-testid="publish-button"]');
    await expect(page.locator('[data-testid="status-badge"]')).toContainText('Published');
  });

  test('uploads media asset', async ({ page }) => {
    await page.goto('/media');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-fixtures/test-image.jpg');

    // Wait for upload
    await expect(page.locator('[data-testid="asset-card"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="asset-card"]')).toContainText('test-image.jpg');
  });

  test('API returns published entries', async ({ request }) => {
    const response = await request.get('/api/v1/content/blogPost', {
      headers: {
        Authorization: 'Bearer test_api_key',
      },
    });

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
  });
});
```

## Error Handling

### Error Boundary

```tsx
// app/content/[typeId]/[entryId]/error.tsx
'use client';

import { useEffect } from 'react';
import { FileQuestion, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export default function EntryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { component: 'entry-editor' },
    });
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <FileQuestion className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to Load Entry</h2>
        <p className="text-gray-600 mb-4">
          {error.message || 'An error occurred while loading the content.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <a href="/content">Back to Content</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Accessibility

### WCAG Compliance

```tsx
// components/content/accessible-editor.tsx
export function AccessibleEditor({ field, value, onChange, error }: EditorProps) {
  const fieldId = `field-${field.apiId}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  return (
    <div role="group" aria-labelledby={`${fieldId}-label`}>
      <label id={`${fieldId}-label`} htmlFor={fieldId} className="block font-medium">
        {field.name}
        {field.required && (
          <>
            <span aria-hidden="true" className="text-red-500 ml-1">*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>

      <input
        id={fieldId}
        value={value}
        onChange={onChange}
        aria-required={field.required}
        aria-invalid={!!error}
        aria-describedby={[
          field.helpText ? helpId : null,
          error ? errorId : null,
        ].filter(Boolean).join(' ') || undefined}
        className="w-full border rounded-md p-2"
      />

      {field.helpText && (
        <p id={helpId} className="text-sm text-gray-500 mt-1">
          {field.helpText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
```

## Security

### API Key Authentication

```tsx
// lib/api-keys.ts
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function verifyApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const key = authHeader.slice(7);
  const hashedKey = createHash('sha256').update(key).digest('hex');

  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey },
    include: { space: true },
  });

  if (!apiKey) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey;
}
```

## Performance

### Caching

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getCachedEntry = unstable_cache(
  async (entryId: string, locale?: string) => {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId, status: 'PUBLISHED' },
      include: { contentType: { include: { fields: true } } },
    });

    if (!entry) return null;

    return transformEntry(entry, entry.contentType.fields, locale);
  },
  ['entry'],
  { revalidate: 60, tags: ['entries'] }
);

export const getCachedContentType = unstable_cache(
  async (spaceId: string, apiId: string) => {
    return prisma.contentType.findFirst({
      where: { spaceId, apiId },
      include: { fields: { orderBy: { position: 'asc' } } },
    });
  },
  ['content-type'],
  { revalidate: 300, tags: ['content-types'] }
);
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cms_test
        ports:
          - 5432:5432
      meilisearch:
        image: getmeili/meilisearch:latest
        ports:
          - 7700:7700

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: pnpm prisma db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cms_test
      - run: pnpm test:unit
      - run: pnpm test:integration
        env:
          MEILISEARCH_HOST: http://localhost:7700

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Health Check

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MeiliSearch } from 'meilisearch';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = { status: 'healthy' };
  } catch {
    checks.checks.database = { status: 'unhealthy' };
    checks.status = 'unhealthy';
  }

  // Search
  try {
    const client = new MeiliSearch({ host: process.env.MEILISEARCH_HOST! });
    await client.health();
    checks.checks.search = { status: 'healthy' };
  } catch {
    checks.checks.search = { status: 'unhealthy' };
    checks.status = 'degraded';
  }

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cms"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Storage (S3)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="cms-assets"

# CDN
CDN_URL="https://cdn.yourdomain.com"

# Search
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_MASTER_KEY="your-master-key"

# Preview
PREVIEW_SECRET="your-preview-secret"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"

# App
NEXT_PUBLIC_APP_URL="https://cms.yourdomain.com"
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] S3 bucket configured with proper CORS
- [ ] CDN configured for assets
- [ ] Meilisearch configured and indexed
- [ ] API keys generated
- [ ] Webhooks configured
- [ ] Preview mode secret set

## Related Recipes

- [r-blog-platform](./blog-platform.md) - Full blog implementation
- [r-documentation](./documentation.md) - Documentation sites
- [r-marketing-site](./marketing-site.md) - Marketing pages

## Changelog

### v3.0.0 (2025-01-18)
- Initial headless CMS recipe with content modeling, media library, and multi-language support
