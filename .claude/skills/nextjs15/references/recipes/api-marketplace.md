---
id: r-api-marketplace
name: API Marketplace
version: 3.0.0
layer: L6
category: recipes
description: Enterprise API marketplace with directory, documentation, API keys, usage tracking, and monetization
tags: [api, marketplace, developer-tools, saas, enterprise, monetization]
formula: "ApiMarketplace = DocumentationLayout(t-documentation-layout) + DashboardLayout(t-dashboard-layout) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + MarketingLayout(t-marketing-layout) + ApiCard(o-api-card) + ApiDocumentation(o-api-documentation) + ApiKeyList(o-api-key-list) + UsageChart(o-usage-chart) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + FilterBar(o-filter-bar) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + SearchInput(m-search-input) + StatCard(m-stat-card) + CodeBlock(m-code-block) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + StripeSubscriptions(pt-stripe-subscriptions) + StripeBillingPortal(pt-stripe-billing-portal) + StripeWebhooks(pt-stripe-webhooks) + UsageMetering(pt-usage-metering) + ApiKeyManagement(pt-api-key-management) + TransactionalEmail(pt-transactional-email) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + Search(pt-search) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + WebhookDelivery(pt-webhook-delivery) + OpenapiSpecification(pt-openapi-specification) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/documentation-layout.md
  - ../templates/dashboard-layout.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/marketing-layout.md
  # L3 Organisms
  - ../organisms/api-card.md
  - ../organisms/api-documentation.md
  - ../organisms/api-key-list.md
  - ../organisms/usage-chart.md
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/filter-bar.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/search-input.md
  - ../molecules/stat-card.md
  - ../molecules/code-block.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Billing & Payments
  - ../patterns/stripe-subscriptions.md
  - ../patterns/stripe-billing-portal.md
  - ../patterns/stripe-webhooks.md
  - ../patterns/usage-metering.md
  - ../patterns/api-key-management.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  - ../patterns/search.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - API Specific
  - ../patterns/webhook-delivery.md
  - ../patterns/openapi-specification.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - @tanstack/react-query@5.0.0
  - react-hook-form@7.50.0
  - zod@3.23.0
  - stripe@14.0.0
  - @uiw/react-codemirror@4.21.0
  - swagger-ui-react@5.0.0
skills:
  - api-routes
  - server-components
  - prisma-setup
  - authentication
  - stripe-integration
  - rate-limiting
  - analytics-tracking
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## Overview

A comprehensive API marketplace platform enabling developers to discover, subscribe to, and consume APIs. Features include API directory with search/filtering, interactive documentation (OpenAPI/Swagger), API key management, usage metering, rate limiting, subscription plans with Stripe billing, and comprehensive analytics dashboards.

## Architecture

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   └── pricing/page.tsx              # Pricing plans
├── (dashboard)/
│   ├── layout.tsx                    # Consumer dashboard
│   ├── dashboard/page.tsx            # Overview
│   ├── apis/
│   │   ├── page.tsx                  # API directory
│   │   └── [slug]/
│   │       ├── page.tsx              # API detail
│   │       ├── docs/page.tsx         # Interactive docs
│   │       └── playground/page.tsx   # API playground
│   ├── subscriptions/page.tsx        # My subscriptions
│   ├── keys/page.tsx                 # API key management
│   └── usage/page.tsx                # Usage analytics
├── (provider)/
│   ├── layout.tsx                    # Provider dashboard
│   └── provider/
│       ├── page.tsx                  # Provider overview
│       ├── apis/
│       │   ├── page.tsx              # My APIs
│       │   ├── new/page.tsx          # Create API
│       │   └── [id]/page.tsx         # Edit API
│       ├── subscribers/page.tsx      # Subscribers
│       └── revenue/page.tsx          # Revenue analytics
├── (admin)/
│   ├── layout.tsx
│   └── admin/
│       ├── page.tsx                  # Admin dashboard
│       ├── apis/page.tsx             # API moderation
│       └── users/page.tsx            # User management
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── apis/
│   │   ├── route.ts                  # List/create APIs
│   │   └── [id]/route.ts             # Get/update/delete
│   ├── subscriptions/route.ts        # Subscribe to API
│   ├── keys/route.ts                 # API key CRUD
│   ├── proxy/[...path]/route.ts      # API proxy with metering
│   ├── usage/route.ts                # Usage analytics
│   └── webhooks/stripe/route.ts      # Stripe webhooks
├── components/
│   ├── api/
│   │   ├── api-card.tsx
│   │   ├── api-documentation.tsx
│   │   └── api-playground.tsx
│   ├── subscription/
│   │   └── plan-card.tsx
│   ├── keys/
│   │   └── api-key-list.tsx
│   └── analytics/
│       └── usage-chart.tsx
├── lib/
│   ├── db.ts                         # Prisma client
│   ├── auth.ts                       # NextAuth config
│   ├── stripe.ts                     # Stripe client
│   ├── rate-limiter.ts               # Rate limiting
│   └── usage-tracker.ts              # Usage metering
└── prisma/
    └── schema.prisma
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| [API Card](../organisms/api-card.md) | L3 Organism | API listing cards with metadata |
| [API Documentation](../organisms/api-documentation.md) | L3 Organism | Interactive OpenAPI/Swagger docs |
| [API Key List](../organisms/api-key-list.md) | L3 Organism | API key management interface |
| [Usage Chart](../organisms/usage-chart.md) | L3 Organism | Usage analytics visualization |
| [Documentation Layout](../templates/documentation-layout.md) | L4 Template | API docs page structure |
| [Dashboard Layout](../templates/dashboard-layout.md) | L4 Template | Consumer/provider dashboard shell |
| [Settings Page](../templates/settings-page.md) | L4 Template | Account and API settings |
| [Stripe](../patterns/stripe.md) | L5 Pattern | Payment processing and subscriptions |
| [Rate Limiting](../patterns/rate-limiting.md) | L5 Pattern | API request throttling |

## Project Structure

```
api-marketplace/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    # Landing page
│   │   ├── pricing/page.tsx            # Pricing plans
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Dashboard layout
│   │   ├── dashboard/page.tsx          # Overview
│   │   ├── apis/
│   │   │   ├── page.tsx                # API directory
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # API detail
│   │   │       ├── docs/page.tsx       # Interactive docs
│   │   │       ├── pricing/page.tsx    # API pricing
│   │   │       └── playground/page.tsx # API playground
│   │   ├── subscriptions/page.tsx      # My subscriptions
│   │   ├── keys/page.tsx               # API key management
│   │   ├── usage/page.tsx              # Usage analytics
│   │   └── settings/page.tsx           # Account settings
│   ├── (provider)/
│   │   ├── layout.tsx                  # Provider layout
│   │   ├── provider/
│   │   │   ├── page.tsx                # Provider dashboard
│   │   │   ├── apis/
│   │   │   │   ├── page.tsx            # My APIs
│   │   │   │   ├── new/page.tsx        # Create API
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Edit API
│   │   │   │       ├── versions/page.tsx
│   │   │   │       ├── plans/page.tsx  # Pricing plans
│   │   │   │       └── analytics/page.tsx
│   │   │   ├── subscribers/page.tsx    # Subscribers
│   │   │   ├── revenue/page.tsx        # Revenue analytics
│   │   │   └── payouts/page.tsx        # Payout settings
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── page.tsx                # Admin dashboard
│   │       ├── apis/page.tsx           # API moderation
│   │       ├── providers/page.tsx      # Provider management
│   │       ├── users/page.tsx          # User management
│   │       └── settings/page.tsx       # Platform settings
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── apis/
│   │   │   ├── route.ts                # List/create APIs
│   │   │   ├── [id]/route.ts           # Get/update/delete API
│   │   │   └── [id]/versions/route.ts  # API versions
│   │   ├── subscriptions/
│   │   │   ├── route.ts                # Subscribe to API
│   │   │   └── [id]/route.ts           # Manage subscription
│   │   ├── keys/
│   │   │   ├── route.ts                # Create/list keys
│   │   │   └── [id]/route.ts           # Revoke key
│   │   ├── proxy/
│   │   │   └── [...path]/route.ts      # API proxy with metering
│   │   ├── usage/route.ts              # Usage analytics
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts         # Stripe webhooks
│   │   └── admin/
│   │       └── [...path]/route.ts      # Admin endpoints
│   └── layout.tsx
├── components/
│   ├── ui/                             # Shared UI components
│   ├── api/
│   │   ├── api-card.tsx
│   │   ├── api-list.tsx
│   │   ├── api-search.tsx
│   │   ├── api-filters.tsx
│   │   ├── api-documentation.tsx
│   │   ├── api-playground.tsx
│   │   ├── endpoint-list.tsx
│   │   └── code-snippet.tsx
│   ├── subscription/
│   │   ├── plan-card.tsx
│   │   ├── subscription-list.tsx
│   │   └── upgrade-modal.tsx
│   ├── keys/
│   │   ├── api-key-list.tsx
│   │   ├── create-key-modal.tsx
│   │   └── key-usage-chart.tsx
│   ├── analytics/
│   │   ├── usage-chart.tsx
│   │   ├── request-log.tsx
│   │   ├── error-breakdown.tsx
│   │   └── latency-chart.tsx
│   ├── provider/
│   │   ├── api-form.tsx
│   │   ├── plan-editor.tsx
│   │   ├── revenue-chart.tsx
│   │   └── subscriber-table.tsx
│   └── layout/
│       ├── navbar.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── lib/
│   ├── db.ts                           # Prisma client
│   ├── auth.ts                         # NextAuth config
│   ├── stripe.ts                       # Stripe client
│   ├── rate-limiter.ts                 # Rate limiting
│   ├── api-proxy.ts                    # API proxy logic
│   ├── usage-tracker.ts                # Usage metering
│   ├── openapi-parser.ts               # OpenAPI spec parser
│   └── utils.ts
├── hooks/
│   ├── use-apis.ts
│   ├── use-subscriptions.ts
│   ├── use-api-keys.ts
│   ├── use-usage.ts
│   └── use-analytics.ts
├── types/
│   └── index.ts
└── prisma/
    └── schema.prisma
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
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  role          UserRole  @default(DEVELOPER)
  
  // Provider info
  isProvider    Boolean   @default(false)
  stripeAccountId String?
  
  // Relations
  apis          Api[]
  subscriptions Subscription[]
  apiKeys       ApiKey[]
  usageRecords  UsageRecord[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
}

enum UserRole {
  DEVELOPER
  PROVIDER
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Api {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        String
  description String    @db.Text
  longDescription String? @db.Text
  logo        String?
  website     String?
  
  // Categorization
  category    String
  tags        String[]
  
  // Status
  status      ApiStatus @default(DRAFT)
  visibility  Visibility @default(PUBLIC)
  featured    Boolean   @default(false)
  
  // Technical
  baseUrl     String
  openApiSpec Json?
  
  // Provider
  providerId  String
  provider    User      @relation(fields: [providerId], references: [id])
  
  // Relations
  versions    ApiVersion[]
  plans       Plan[]
  subscriptions Subscription[]
  endpoints   Endpoint[]
  
  // Metrics
  totalCalls  Int       @default(0)
  avgLatency  Float     @default(0)
  uptime      Float     @default(100)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([category])
  @@index([status])
  @@index([providerId])
}

enum ApiStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  DEPRECATED
  SUSPENDED
}

enum Visibility {
  PUBLIC
  PRIVATE
  UNLISTED
}

model ApiVersion {
  id          String   @id @default(cuid())
  version     String
  changelog   String?  @db.Text
  openApiSpec Json?
  isLatest    Boolean  @default(false)
  status      VersionStatus @default(ACTIVE)
  
  apiId       String
  api         Api      @relation(fields: [apiId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@unique([apiId, version])
}

enum VersionStatus {
  ACTIVE
  DEPRECATED
  SUNSET
}

model Endpoint {
  id          String   @id @default(cuid())
  path        String
  method      HttpMethod
  summary     String?
  description String?  @db.Text
  
  // Request/Response schemas
  parameters  Json?
  requestBody Json?
  responses   Json?
  
  // Auth requirements
  authRequired Boolean @default(true)
  scopes      String[]
  
  apiId       String
  api         Api      @relation(fields: [apiId], references: [id], onDelete: Cascade)
  
  @@unique([apiId, path, method])
}

enum HttpMethod {
  GET
  POST
  PUT
  PATCH
  DELETE
  HEAD
  OPTIONS
}

model Plan {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // Pricing
  price       Int      // cents per month
  billingPeriod BillingPeriod @default(MONTHLY)
  
  // Limits
  requestsPerMonth Int?
  requestsPerSecond Int?
  
  // Features
  features    String[]
  
  // Stripe
  stripePriceId String?
  
  apiId       String
  api         Api      @relation(fields: [apiId], references: [id], onDelete: Cascade)
  
  subscriptions Subscription[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([apiId, name])
}

enum BillingPeriod {
  MONTHLY
  YEARLY
}

model Subscription {
  id          String   @id @default(cuid())
  status      SubscriptionStatus @default(ACTIVE)
  
  // Stripe
  stripeSubscriptionId String? @unique
  currentPeriodStart DateTime?
  currentPeriodEnd DateTime?
  
  // Usage tracking
  requestsUsed Int     @default(0)
  lastResetAt  DateTime @default(now())
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  apiId       String
  api         Api      @relation(fields: [apiId], references: [id])
  
  planId      String
  plan        Plan     @relation(fields: [planId], references: [id])
  
  apiKeys     ApiKey[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, apiId])
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  PAUSED
}

model ApiKey {
  id          String   @id @default(cuid())
  name        String
  keyPrefix   String   // First 8 chars for identification
  hashedKey   String   @unique
  
  // Permissions
  scopes      String[]
  
  // Limits (overrides subscription)
  rateLimit   Int?
  
  // Status
  isActive    Boolean  @default(true)
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  subscriptionId String
  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  usageRecords UsageRecord[]
  
  createdAt   DateTime @default(now())
  
  @@index([hashedKey])
  @@index([userId])
}

model UsageRecord {
  id          String   @id @default(cuid())
  
  // Request details
  endpoint    String
  method      HttpMethod
  statusCode  Int
  latency     Int      // milliseconds
  
  // Metadata
  ipAddress   String?
  userAgent   String?
  
  // Error tracking
  errorCode   String?
  errorMessage String?
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  apiKeyId    String
  apiKey      ApiKey   @relation(fields: [apiKeyId], references: [id], onDelete: Cascade)
  
  timestamp   DateTime @default(now())
  
  @@index([apiKeyId, timestamp])
  @@index([userId, timestamp])
}

model AuditLog {
  id          String   @id @default(cuid())
  action      String
  entityType  String
  entityId    String
  userId      String?
  changes     Json?
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  @@index([entityType, entityId])
  @@index([userId])
}
```

## Implementation

### API Directory with Search

```tsx
// app/(dashboard)/apis/page.tsx
import { Suspense } from 'react';
import { ApiSearch } from '@/components/api/api-search';
import { ApiFilters } from '@/components/api/api-filters';
import { ApiList } from '@/components/api/api-list';
import { ApiListSkeleton } from '@/components/api/api-list-skeleton';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ApisPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Directory</h1>
        <p className="text-muted-foreground">
          Discover and integrate powerful APIs into your applications
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ApiFilters 
            selectedCategory={params.category}
            selectedSort={params.sort}
          />
        </aside>
        
        <main className="flex-1">
          <ApiSearch defaultValue={params.q} />
          
          <Suspense fallback={<ApiListSkeleton />}>
            <ApiList
              query={params.q}
              category={params.category}
              sort={params.sort}
              page={parseInt(params.page || '1')}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

```tsx
// components/api/api-list.tsx
import { db } from '@/lib/db';
import { ApiCard } from './api-card';
import { Pagination } from '@/components/ui/pagination';

interface ApiListProps {
  query?: string;
  category?: string;
  sort?: string;
  page: number;
}

const PAGE_SIZE = 12;

export async function ApiList({ query, category, sort, page }: ApiListProps) {
  const where = {
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { tags: { has: query.toLowerCase() } },
      ],
    }),
    ...(category && { category }),
  };
  
  const orderBy = getOrderBy(sort);
  
  const [apis, total] = await Promise.all([
    db.api.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        provider: { select: { name: true, image: true } },
        plans: { orderBy: { price: 'asc' }, take: 1 },
        _count: { select: { subscriptions: true } },
      },
    }),
    db.api.count({ where }),
  ]);
  
  if (apis.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No APIs found</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {apis.map((api) => (
          <ApiCard key={api.id} api={api} />
        ))}
      </div>
      
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        className="mt-8"
      />
    </div>
  );
}

function getOrderBy(sort?: string) {
  switch (sort) {
    case 'popular':
      return { totalCalls: 'desc' as const };
    case 'newest':
      return { createdAt: 'desc' as const };
    case 'name':
      return { name: 'asc' as const };
    default:
      return [
        { featured: 'desc' as const },
        { totalCalls: 'desc' as const },
      ];
  }
}
```

### Interactive API Documentation

```tsx
// app/(dashboard)/apis/[slug]/docs/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ApiDocumentation } from '@/components/api/api-documentation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApiDocsPage({ params }: PageProps) {
  const { slug } = await params;
  
  const api = await db.api.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      endpoints: true,
      versions: { where: { isLatest: true }, take: 1 },
    },
  });
  
  if (!api) notFound();
  
  return (
    <div className="container py-8">
      <ApiDocumentation 
        api={api}
        openApiSpec={api.openApiSpec}
        endpoints={api.endpoints}
      />
    </div>
  );
}
```

```tsx
// components/api/api-documentation.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EndpointList } from './endpoint-list';
import { CodeSnippet } from './code-snippet';
import { SwaggerUI } from './swagger-ui';
import type { Api, Endpoint } from '@prisma/client';

interface ApiDocumentationProps {
  api: Api;
  openApiSpec: unknown;
  endpoints: Endpoint[];
}

export function ApiDocumentation({ 
  api, 
  openApiSpec, 
  endpoints 
}: ApiDocumentationProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(
    endpoints[0] || null
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Endpoint List */}
      <aside className="lg:col-span-1">
        <div className="sticky top-4">
          <h3 className="font-semibold mb-4">Endpoints</h3>
          <EndpointList
            endpoints={endpoints}
            selectedId={selectedEndpoint?.id}
            onSelect={setSelectedEndpoint}
          />
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="lg:col-span-3">
        {selectedEndpoint ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`
                  px-2 py-1 text-xs font-mono font-bold rounded
                  ${getMethodColor(selectedEndpoint.method)}
                `}>
                  {selectedEndpoint.method}
                </span>
                <code className="text-lg">{selectedEndpoint.path}</code>
              </div>
              <p className="text-muted-foreground">
                {selectedEndpoint.description || selectedEndpoint.summary}
              </p>
            </div>
            
            <Tabs defaultValue="docs">
              <TabsList>
                <TabsTrigger value="docs">Documentation</TabsTrigger>
                <TabsTrigger value="code">Code Examples</TabsTrigger>
                <TabsTrigger value="try">Try It</TabsTrigger>
              </TabsList>
              
              <TabsContent value="docs" className="space-y-6 mt-4">
                {selectedEndpoint.parameters && (
                  <ParametersTable 
                    parameters={selectedEndpoint.parameters as any[]} 
                  />
                )}
                
                {selectedEndpoint.requestBody && (
                  <RequestBodySection 
                    requestBody={selectedEndpoint.requestBody as any} 
                  />
                )}
                
                {selectedEndpoint.responses && (
                  <ResponsesSection 
                    responses={selectedEndpoint.responses as any} 
                  />
                )}
              </TabsContent>
              
              <TabsContent value="code" className="mt-4">
                <CodeSnippet
                  baseUrl={api.baseUrl}
                  endpoint={selectedEndpoint}
                />
              </TabsContent>
              
              <TabsContent value="try" className="mt-4">
                <ApiPlayground
                  baseUrl={api.baseUrl}
                  endpoint={selectedEndpoint}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          openApiSpec && <SwaggerUI spec={openApiSpec} />
        )}
      </main>
    </div>
  );
}

function getMethodColor(method: string) {
  const colors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-700',
    POST: 'bg-blue-500/20 text-blue-700',
    PUT: 'bg-yellow-500/20 text-yellow-700',
    PATCH: 'bg-orange-500/20 text-orange-700',
    DELETE: 'bg-red-500/20 text-red-700',
  };
  return colors[method] || 'bg-gray-500/20 text-gray-700';
}
```

### API Key Management

```tsx
// app/(dashboard)/keys/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ApiKeyList } from '@/components/keys/api-key-list';
import { CreateKeyButton } from '@/components/keys/create-key-button';

export default async function KeysPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  
  const keys = await db.apiKey.findMany({
    where: { userId: session.user.id },
    include: {
      subscription: {
        include: { api: { select: { name: true, slug: true } } },
      },
      _count: { select: { usageRecords: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  const subscriptions = await db.subscription.findMany({
    where: { userId: session.user.id, status: 'ACTIVE' },
    include: { api: { select: { id: true, name: true } } },
  });
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for accessing subscribed APIs
          </p>
        </div>
        
        <CreateKeyButton subscriptions={subscriptions} />
      </div>
      
      <ApiKeyList keys={keys} />
    </div>
  );
}
```

```tsx
// components/keys/api-key-list.tsx
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Key, Copy, Eye, EyeOff, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyListProps {
  keys: Array<{
    id: string;
    name: string;
    keyPrefix: string;
    isActive: boolean;
    lastUsedAt: Date | null;
    createdAt: Date;
    subscription: {
      api: { name: string; slug: string };
    };
    _count: { usageRecords: number };
  }>;
}

export function ApiKeyList({ keys }: ApiKeyListProps) {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };
  
  if (keys.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
        <p className="text-muted-foreground">
          Create an API key to start making requests
        </p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg divide-y">
      {keys.map((key) => (
        <div key={key.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg">
              <Key className="h-5 w-5" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{key.name}</span>
                <Badge variant={key.isActive ? 'default' : 'secondary'}>
                  {key.isActive ? 'Active' : 'Revoked'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{key.subscription.api.name}</span>
                <span>•</span>
                <code className="bg-muted px-1 rounded">
                  {key.keyPrefix}...
                </code>
                <span>•</span>
                <span>{key._count.usageRecords.toLocaleString()} requests</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {key.lastUsedAt 
                ? `Used ${formatDistanceToNow(key.lastUsedAt)} ago`
                : 'Never used'
              }
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(key.keyPrefix)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Key Prefix
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => revokeKey(key.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revoke Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### API Proxy with Usage Metering

```ts
// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyApiKey, hashApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { trackUsage } from '@/lib/usage-tracker';

export async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = Date.now();
  const { path } = await params;
  
  // Extract API key from header
  const apiKeyHeader = request.headers.get('x-api-key');
  if (!apiKeyHeader) {
    return NextResponse.json(
      { error: 'Missing API key' },
      { status: 401 }
    );
  }
  
  // Verify API key
  const hashedKey = hashApiKey(apiKeyHeader);
  const apiKey = await db.apiKey.findUnique({
    where: { hashedKey },
    include: {
      subscription: {
        include: {
          api: true,
          plan: true,
        },
      },
    },
  });
  
  if (!apiKey || !apiKey.isActive) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
  
  // Check subscription status
  if (apiKey.subscription.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Subscription inactive' },
      { status: 403 }
    );
  }
  
  // Check rate limit
  const rateLimit = apiKey.rateLimit || apiKey.subscription.plan.requestsPerSecond;
  if (rateLimit) {
    const { allowed, remaining, resetAt } = await checkRateLimit(
      apiKey.id,
      rateLimit
    );
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toString(),
          },
        }
      );
    }
  }
  
  // Check monthly quota
  const { plan, requestsUsed } = apiKey.subscription;
  if (plan.requestsPerMonth && requestsUsed >= plan.requestsPerMonth) {
    return NextResponse.json(
      { error: 'Monthly quota exceeded' },
      { status: 429 }
    );
  }
  
  // Proxy the request
  const targetUrl = `${apiKey.subscription.api.baseUrl}/${path.join('/')}`;
  
  try {
    const proxyResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        // Forward other relevant headers
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });
    
    const latency = Date.now() - startTime;
    const responseBody = await proxyResponse.text();
    
    // Track usage asynchronously
    trackUsage({
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      endpoint: `/${path.join('/')}`,
      method: request.method as any,
      statusCode: proxyResponse.status,
      latency,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });
    
    // Update key last used
    db.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });
    
    // Increment subscription usage
    db.subscription.update({
      where: { id: apiKey.subscriptionId },
      data: { requestsUsed: { increment: 1 } },
    });
    
    return new NextResponse(responseBody, {
      status: proxyResponse.status,
      headers: {
        'Content-Type': proxyResponse.headers.get('content-type') || 'application/json',
        'X-Request-Id': crypto.randomUUID(),
        'X-Response-Time': `${latency}ms`,
      },
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    
    trackUsage({
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      endpoint: `/${path.join('/')}`,
      method: request.method as any,
      statusCode: 502,
      latency,
      errorCode: 'PROXY_ERROR',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 502 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
```

### Usage Analytics Dashboard

```tsx
// app/(dashboard)/usage/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UsageOverview } from '@/components/analytics/usage-overview';
import { UsageChart } from '@/components/analytics/usage-chart';
import { RequestLog } from '@/components/analytics/request-log';
import { ErrorBreakdown } from '@/components/analytics/error-breakdown';
import { getUsageStats } from '@/lib/usage-tracker';

interface PageProps {
  searchParams: Promise<{
    period?: string;
    apiId?: string;
  }>;
}

export default async function UsagePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  
  const params = await searchParams;
  const period = params.period || '7d';
  
  const stats = await getUsageStats(session.user.id, period, params.apiId);
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Usage Analytics</h1>
        <p className="text-muted-foreground">
          Monitor your API usage and performance metrics
        </p>
      </div>
      
      <UsageOverview stats={stats.overview} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <UsageChart data={stats.timeline} period={period} />
        <ErrorBreakdown data={stats.errors} />
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Requests</h2>
        <RequestLog records={stats.recentRequests} />
      </div>
    </div>
  );
}
```

```tsx
// components/analytics/usage-chart.tsx
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface UsageChartProps {
  data: Array<{
    date: string;
    requests: number;
    errors: number;
    latency: number;
  }>;
  period: string;
}

export function UsageChart({ data, period }: UsageChartProps) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: format(new Date(item.date), period === '24h' ? 'HH:mm' : 'MMM d'),
    }));
  }, [data, period]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Requests"
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Errors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Provider API Management

```tsx
// app/(provider)/provider/apis/new/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ApiForm } from '@/components/provider/api-form';

export default async function NewApiPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isProvider) {
    redirect('/provider/onboarding');
  }
  
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">List Your API</h1>
        <p className="text-muted-foreground">
          Add your API to the marketplace and start earning
        </p>
      </div>
      
      <ApiForm />
    </div>
  );
}
```

```tsx
// components/provider/api-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const apiSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(500),
  longDescription: z.string().optional(),
  category: z.string(),
  tags: z.string(),
  baseUrl: z.string().url(),
  website: z.string().url().optional().or(z.literal('')),
});

type ApiFormData = z.infer<typeof apiSchema>;

const CATEGORIES = [
  'AI & Machine Learning',
  'Communication',
  'Data',
  'E-commerce',
  'Finance',
  'Location',
  'Media',
  'Security',
  'Social',
  'Utilities',
];

export function ApiForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [openApiFile, setOpenApiFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ApiFormData>({
    resolver: zodResolver(apiSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      longDescription: '',
      category: '',
      tags: '',
      baseUrl: '',
      website: '',
    },
  });
  
  const onSubmit = async (data: ApiFormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      
      if (openApiFile) {
        formData.append('openApiSpec', openApiFile);
      }
      
      const response = await fetch('/api/apis', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create API');
      }
      
      const api = await response.json();
      
      toast({ title: 'API created successfully' });
      router.push(`/provider/apis/${api.id}`);
    } catch (error) {
      toast({
        title: 'Error creating API',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome API" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input placeholder="my-awesome-api" {...field} />
              </FormControl>
              <FormDescription>
                This will be used in the API URL: /apis/{field.value || 'slug'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of what your API does..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="baseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base URL</FormLabel>
              <FormControl>
                <Input placeholder="https://api.example.com/v1" {...field} />
              </FormControl>
              <FormDescription>
                The base URL where your API is hosted
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* OpenAPI Spec Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">OpenAPI Specification</label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".json,.yaml,.yml"
              onChange={(e) => setOpenApiFile(e.target.files?.[0] || null)}
              className="hidden"
              id="openapi-upload"
            />
            <label
              htmlFor="openapi-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
              {openApiFile ? (
                <span className="text-sm">{openApiFile.name}</span>
              ) : (
                <>
                  <span className="text-sm font-medium">
                    Upload OpenAPI spec (optional)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JSON or YAML format
                  </span>
                </>
              )}
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create API'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Rate Limiter

```ts
// lib/rate-limiter.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 1000
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Use sliding window algorithm
  const pipeline = redis.pipeline();
  
  // Remove old entries
  pipeline.zremrangebyscore(key, 0, windowStart);
  
  // Count current entries
  pipeline.zcard(key);
  
  // Add current request
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  
  // Set expiry
  pipeline.expire(key, Math.ceil(windowMs / 1000) + 1);
  
  const results = await pipeline.exec();
  const count = (results[1] as number) || 0;
  
  const allowed = count < limit;
  const remaining = Math.max(0, limit - count - 1);
  const resetAt = now + windowMs;
  
  return { allowed, remaining, resetAt };
}

// Token bucket algorithm for more complex rate limiting
export async function checkTokenBucket(
  identifier: string,
  maxTokens: number,
  refillRate: number, // tokens per second
  tokensRequired: number = 1
): Promise<RateLimitResult> {
  const key = `tokenbucket:${identifier}`;
  const now = Date.now();
  
  // Get current state
  const state = await redis.hgetall<{
    tokens: string;
    lastRefill: string;
  }>(key);
  
  let tokens = maxTokens;
  let lastRefill = now;
  
  if (state?.tokens && state?.lastRefill) {
    tokens = parseFloat(state.tokens);
    lastRefill = parseInt(state.lastRefill);
    
    // Calculate refill
    const timePassed = (now - lastRefill) / 1000;
    tokens = Math.min(maxTokens, tokens + timePassed * refillRate);
  }
  
  const allowed = tokens >= tokensRequired;
  
  if (allowed) {
    tokens -= tokensRequired;
  }
  
  // Update state
  await redis.hset(key, {
    tokens: tokens.toString(),
    lastRefill: now.toString(),
  });
  await redis.expire(key, Math.ceil(maxTokens / refillRate) + 60);
  
  return {
    allowed,
    remaining: Math.floor(tokens),
    resetAt: now + Math.ceil((tokensRequired - tokens) / refillRate) * 1000,
  };
}
```

## Related Skills

- **api-routes** - Next.js API route patterns
- **authentication** - NextAuth.js setup
- **prisma-setup** - Database configuration
- **stripe-integration** - Payment processing
- **rate-limiting** - API rate limiting patterns
- **caching** - Redis caching strategies

## Testing

### Unit Tests

```tsx
// __tests__/lib/rate-limiter.test.ts
import { checkRateLimit, checkTokenBucket } from '@/lib/rate-limiter';

// Mock Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    pipeline: () => ({
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      zadd: jest.fn(),
      expire: jest.fn(),
      exec: jest.fn().mockResolvedValue([null, 5, null, null]),
    }),
    hgetall: jest.fn().mockResolvedValue(null),
    hset: jest.fn(),
    expire: jest.fn(),
  })),
}));

describe('Rate Limiter', () => {
  it('allows requests under the limit', async () => {
    const result = await checkRateLimit('test-key', 10);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks requests over the limit', async () => {
    // Mock exceeding limit
    jest.mock('@upstash/redis', () => ({
      Redis: jest.fn().mockImplementation(() => ({
        pipeline: () => ({
          exec: jest.fn().mockResolvedValue([null, 15, null, null]),
        }),
      })),
    }));

    const result = await checkRateLimit('test-key', 10);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

// __tests__/components/api-key-list.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiKeyList } from '@/components/keys/api-key-list';

const mockKeys = [
  {
    id: '1',
    name: 'Production Key',
    keyPrefix: 'mk_prod_',
    isActive: true,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    subscription: { api: { name: 'Weather API', slug: 'weather-api' } },
    _count: { usageRecords: 1500 },
  },
];

describe('ApiKeyList', () => {
  it('renders API keys correctly', () => {
    render(<ApiKeyList keys={mockKeys} />);

    expect(screen.getByText('Production Key')).toBeInTheDocument();
    expect(screen.getByText('Weather API')).toBeInTheDocument();
    expect(screen.getByText('mk_prod_...')).toBeInTheDocument();
  });

  it('shows empty state when no keys', () => {
    render(<ApiKeyList keys={[]} />);

    expect(screen.getByText('No API keys yet')).toBeInTheDocument();
  });

  it('copies key prefix to clipboard', async () => {
    const mockClipboard = { writeText: jest.fn() };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<ApiKeyList keys={mockKeys} />);

    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    fireEvent.click(screen.getByText('Copy Key Prefix'));

    expect(mockClipboard.writeText).toHaveBeenCalledWith('mk_prod_');
  });
});
```

### Integration Tests

```tsx
// __tests__/api/proxy.test.ts
import { handler } from '@/app/api/proxy/[...path]/route';
import { createMocks } from 'node-mocks-http';
import { db } from '@/lib/db';

jest.mock('@/lib/db');
jest.mock('@/lib/rate-limiter');

describe('API Proxy', () => {
  const validApiKey = 'mk_test_valid123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects requests without API key', async () => {
    const request = new Request('http://localhost/api/proxy/users', {
      headers: {},
    });

    const response = await handler(request, { params: { path: ['users'] } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Missing API key');
  });

  it('rejects invalid API keys', async () => {
    (db.apiKey.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/proxy/users', {
      headers: { 'x-api-key': 'invalid_key' },
    });

    const response = await handler(request, { params: { path: ['users'] } });

    expect(response.status).toBe(401);
  });

  it('proxies valid requests and tracks usage', async () => {
    (db.apiKey.findUnique as jest.Mock).mockResolvedValue({
      id: 'key-1',
      isActive: true,
      userId: 'user-1',
      subscription: {
        status: 'ACTIVE',
        api: { baseUrl: 'https://api.example.com' },
        plan: { requestsPerSecond: 10, requestsPerMonth: 10000 },
        requestsUsed: 500,
      },
    });

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve('{"success": true}'),
    });

    const request = new Request('http://localhost/api/proxy/users', {
      headers: { 'x-api-key': validApiKey },
    });

    const response = await handler(request, { params: { path: ['users'] } });

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.any(Object)
    );
  });
});
```

### E2E Tests

```ts
// e2e/api-marketplace.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Marketplace', () => {
  test.describe('API Directory', () => {
    test('can search for APIs', async ({ page }) => {
      await page.goto('/apis');

      await page.fill('[data-testid="api-search"]', 'weather');
      await page.waitForResponse('**/api/apis?*');

      await expect(page.locator('[data-testid="api-card"]')).toHaveCount.greaterThan(0);
    });

    test('can filter by category', async ({ page }) => {
      await page.goto('/apis');

      await page.click('[data-testid="category-filter"]');
      await page.click('text=Data');

      await expect(page).toHaveURL(/category=Data/);
    });
  });

  test.describe('API Subscription', () => {
    test.beforeEach(async ({ page }) => {
      // Login as developer
      await page.goto('/login');
      await page.fill('[name="email"]', 'developer@example.com');
      await page.fill('[name="password"]', 'password123');
      await page.click('button[type="submit"]');
    });

    test('can subscribe to free tier API', async ({ page }) => {
      await page.goto('/apis/weather-api');
      await page.click('[data-testid="subscribe-free"]');

      await expect(page.locator('text=Subscription active')).toBeVisible();
    });

    test('can generate API key after subscription', async ({ page }) => {
      await page.goto('/keys');
      await page.click('[data-testid="create-key"]');

      await page.fill('[name="name"]', 'Test Key');
      await page.click('[data-testid="select-api"]');
      await page.click('text=Weather API');
      await page.click('button[type="submit"]');

      // Key is shown once
      await expect(page.locator('[data-testid="new-key-value"]')).toBeVisible();
    });
  });

  test.describe('Provider Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Login as provider
      await page.goto('/login');
      await page.fill('[name="email"]', 'provider@example.com');
      await page.fill('[name="password"]', 'password123');
      await page.click('button[type="submit"]');
    });

    test('can create new API listing', async ({ page }) => {
      await page.goto('/provider/apis/new');

      await page.fill('[name="name"]', 'My Test API');
      await page.fill('[name="slug"]', 'my-test-api');
      await page.fill('[name="description"]', 'A test API for testing purposes');
      await page.fill('[name="baseUrl"]', 'https://api.mytest.com');
      await page.click('[data-testid="category-select"]');
      await page.click('text=Utilities');

      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/\/provider\/apis\/\w+/);
    });

    test('can view subscriber analytics', async ({ page }) => {
      await page.goto('/provider/apis/weather-api/analytics');

      await expect(page.locator('[data-testid="total-requests"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-subscribers"]')).toBeVisible();
    });
  });
});
```

## Error Handling

```tsx
// lib/errors/marketplace.ts
export class MarketplaceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MarketplaceError';
  }
}

export const ErrorCodes = {
  // Authentication
  INVALID_API_KEY: 'INVALID_API_KEY',
  EXPIRED_API_KEY: 'EXPIRED_API_KEY',
  REVOKED_API_KEY: 'REVOKED_API_KEY',

  // Subscription
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // API
  API_NOT_FOUND: 'API_NOT_FOUND',
  API_UNAVAILABLE: 'API_UNAVAILABLE',
  PROXY_ERROR: 'PROXY_ERROR',

  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CARD_DECLINED: 'CARD_DECLINED',
} as const;

// Standardized error response
export function createErrorResponse(error: MarketplaceError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
  };
}

// API Proxy error handling
// app/api/proxy/[...path]/route.ts
export async function handler(request: NextRequest, { params }) {
  try {
    // ... proxy logic
  } catch (error) {
    if (error instanceof MarketplaceError) {
      return NextResponse.json(
        createErrorResponse(error),
        {
          status: error.statusCode,
          headers: {
            'X-Error-Code': error.code,
          },
        }
      );
    }

    // Upstream API errors
    if (error instanceof Response) {
      const body = await error.text();
      return NextResponse.json(
        {
          error: {
            code: ErrorCodes.PROXY_ERROR,
            message: 'Upstream API error',
            upstream: {
              status: error.status,
              body: safeParseJSON(body),
            },
          },
        },
        { status: error.status >= 500 ? 502 : error.status }
      );
    }

    // Unknown errors
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// Client-side error handling for API calls
// hooks/use-api-request.ts
export function useApiRequest() {
  const { toast } = useToast();

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Response) {
      switch (error.status) {
        case 401:
          toast({
            title: 'API Key Invalid',
            description: 'Please check your API key or generate a new one.',
            variant: 'destructive',
          });
          break;
        case 429:
          toast({
            title: 'Rate Limit Exceeded',
            description: 'Please wait before making more requests.',
            variant: 'destructive',
          });
          break;
        case 402:
          toast({
            title: 'Quota Exceeded',
            description: 'Upgrade your plan for more requests.',
            action: <Button onClick={() => router.push('/pricing')}>Upgrade</Button>,
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'Request Failed',
            description: 'Something went wrong. Please try again.',
            variant: 'destructive',
          });
      }
    }
  }, [toast]);

  return { handleError };
}
```

## Accessibility

```tsx
// Accessible API card component
// components/api/accessible-api-card.tsx
interface ApiCardProps {
  api: Api;
}

export function ApiCard({ api }: ApiCardProps) {
  return (
    <article
      aria-labelledby={`api-${api.id}-title`}
      className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <header className="flex items-start gap-4">
        {api.logo && (
          <img
            src={api.logo}
            alt="" // Decorative, title provides context
            className="w-12 h-12 rounded"
            aria-hidden="true"
          />
        )}
        <div>
          <h3 id={`api-${api.id}-title`} className="font-semibold text-lg">
            <Link
              href={`/apis/${api.slug}`}
              className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              {api.name}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            by {api.provider.name}
          </p>
        </div>
      </header>

      <p className="mt-4 text-sm line-clamp-2">
        {api.description}
      </p>

      <footer className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2" aria-label="API statistics">
          <span className="text-sm">
            <span className="sr-only">Total API calls: </span>
            {formatNumber(api.totalCalls)} calls
          </span>
          <span aria-hidden="true">•</span>
          <span className="text-sm">
            <span className="sr-only">Uptime: </span>
            {api.uptime}% uptime
          </span>
        </div>

        <Badge variant="secondary">
          {api.plans[0]?.price === 0 ? 'Free' : `From $${api.plans[0]?.price / 100}/mo`}
        </Badge>
      </footer>
    </article>
  );
}

// Accessible API key display with copy functionality
// components/keys/api-key-display.tsx
export function ApiKeyDisplay({ apiKey, isNew }: { apiKey: string; isNew: boolean }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(isNew);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="group"
      aria-label="API Key"
      className="flex items-center gap-2 p-3 bg-muted rounded-lg"
    >
      <code
        className="flex-1 font-mono text-sm"
        aria-label={visible ? 'API key visible' : 'API key hidden'}
      >
        {visible ? apiKey : apiKey.replace(/./g, '•')}
      </code>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Hide API key' : 'Show API key'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={copyToClipboard}
        aria-label={copied ? 'Copied to clipboard' : 'Copy API key to clipboard'}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>

      {/* Live region for copy confirmation */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied && 'API key copied to clipboard'}
      </span>
    </div>
  );
}

// Keyboard-accessible dropdown for API actions
// Ensure all interactive elements have visible focus states
// Provide skip links in API documentation pages
```

### Accessibility Guidelines for API Marketplace

- Ensure API documentation is navigable with keyboard only
- Provide clear labels for all form inputs (API name, description, etc.)
- Use ARIA live regions for real-time usage updates
- Ensure code examples are accessible to screen readers
- Provide text alternatives for status indicators (active/inactive)
- Support reduced motion for loading animations

## Security

```tsx
// API Key security
// lib/auth/api-key.ts
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const API_KEY_PREFIX = 'mk_';
const API_KEY_LENGTH = 32;

export function generateApiKey(): { key: string; hash: string } {
  const rawKey = randomBytes(API_KEY_LENGTH).toString('base64url');
  const key = `${API_KEY_PREFIX}${rawKey}`;
  const hash = hashApiKey(key);

  return { key, hash };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function verifyApiKey(providedKey: string, storedHash: string): boolean {
  const providedHash = hashApiKey(providedKey);
  const providedBuffer = Buffer.from(providedHash, 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');

  // Timing-safe comparison to prevent timing attacks
  return timingSafeEqual(providedBuffer, storedBuffer);
}

// Input validation for API creation
// lib/validators/api.ts
import { z } from 'zod';

export const createApiSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[\w\s-]+$/, 'Name contains invalid characters'),

  slug: z.string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),

  baseUrl: z.string()
    .url('Must be a valid URL')
    .refine(url => url.startsWith('https://'), 'Must use HTTPS'),

  category: z.enum([
    'AI & Machine Learning',
    'Communication',
    'Data',
    'E-commerce',
    'Finance',
    'Location',
    'Media',
    'Security',
    'Social',
    'Utilities',
  ]),
});

// Webhook signature verification
// lib/stripe/webhook.ts
import Stripe from 'stripe';

export function verifyStripeWebhook(
  payload: string,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// API proxy security headers
// middleware.ts
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
  };
}
```

### Security Checklist

- [ ] API keys are hashed before storage (never store plaintext)
- [ ] Use timing-safe comparison for API key verification
- [ ] Validate all API input with strict schemas
- [ ] Rate limit all public endpoints
- [ ] Implement IP-based blocking for abuse
- [ ] Verify Stripe webhook signatures
- [ ] Sanitize OpenAPI specs uploaded by providers
- [ ] Audit log all administrative actions
- [ ] Implement CORS with strict origin checking
- [ ] Use HTTPS only for API base URLs

## Performance

```tsx
// Caching strategies for API marketplace
// lib/cache/apis.ts
import { unstable_cache } from 'next/cache';

export const getFeaturedApis = unstable_cache(
  async () => {
    return db.api.findMany({
      where: { featured: true, status: 'PUBLISHED' },
      include: {
        provider: { select: { name: true, image: true } },
        plans: { orderBy: { price: 'asc' }, take: 1 },
      },
      orderBy: { totalCalls: 'desc' },
      take: 6,
    });
  },
  ['featured-apis'],
  { revalidate: 3600, tags: ['apis'] } // 1 hour cache
);

export const getApiBySlug = unstable_cache(
  async (slug: string) => {
    return db.api.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: {
        provider: true,
        plans: true,
        endpoints: true,
      },
    });
  },
  ['api-by-slug'],
  { revalidate: 300, tags: ['api'] } // 5 minute cache
);

// Efficient usage tracking with batching
// lib/usage-tracker.ts
const usageBuffer: UsageRecord[] = [];
const BATCH_SIZE = 100;
const FLUSH_INTERVAL = 5000; // 5 seconds

export async function trackUsage(record: UsageRecord) {
  usageBuffer.push(record);

  if (usageBuffer.length >= BATCH_SIZE) {
    await flushUsageBuffer();
  }
}

async function flushUsageBuffer() {
  if (usageBuffer.length === 0) return;

  const records = usageBuffer.splice(0, usageBuffer.length);

  await db.usageRecord.createMany({
    data: records,
    skipDuplicates: true,
  });

  // Update aggregated metrics
  await updateDailyMetrics(records);
}

// Start periodic flush
setInterval(flushUsageBuffer, FLUSH_INTERVAL);

// Connection pooling for high-throughput proxy
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Optimized API directory query with pagination
async function getApis(params: ApiQueryParams) {
  const { page = 1, limit = 12, query, category, sort } = params;

  // Use count for total, but limit main query
  const [apis, total] = await db.$transaction([
    db.api.findMany({
      where: buildWhere(query, category),
      orderBy: buildOrderBy(sort),
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        logo: true,
        category: true,
        totalCalls: true,
        uptime: true,
        provider: { select: { name: true } },
        plans: {
          orderBy: { price: 'asc' },
          take: 1,
          select: { price: true },
        },
      },
    }),
    db.api.count({ where: buildWhere(query, category) }),
  ]);

  return { apis, total, pages: Math.ceil(total / limit) };
}
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Directory Load | < 1s | Time to first contentful paint |
| API Proxy Latency | < 50ms | Added overhead |
| Key Generation | < 100ms | Response time |
| Search Results | < 500ms | Time to results |
| Documentation Load | < 2s | Full page load |

## CI/CD

```yaml
# .github/workflows/api-marketplace.yml
name: API Marketplace CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'prisma/**'
  pull_request:
    branches: [main]

env:
  DATABASE_URL: postgresql://test:test@localhost:5432/marketplace_test

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: marketplace_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration
        env:
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npx playwright install --with-deps

      - name: Start services
        run: docker-compose up -d

      - name: Run E2E tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run npm audit
        run: npm audit --audit-level=high

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test, e2e, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Notify deployment
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            -d '{"text":"API Marketplace deployed to production"}'
```

## Monitoring

```tsx
// lib/monitoring/marketplace.ts
import { trace, metrics, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('api-marketplace');
const meter = metrics.getMeter('api-marketplace');

// Custom metrics
export const marketplaceMetrics = {
  apiCalls: meter.createCounter('marketplace.api.calls', {
    description: 'Total API calls through proxy',
  }),

  proxyLatency: meter.createHistogram('marketplace.proxy.latency', {
    description: 'API proxy latency',
    unit: 'ms',
  }),

  subscriptions: meter.createUpDownCounter('marketplace.subscriptions', {
    description: 'Active subscriptions',
  }),

  revenue: meter.createCounter('marketplace.revenue', {
    description: 'Revenue generated',
    unit: 'cents',
  }),

  rateLimitHits: meter.createCounter('marketplace.ratelimit.hits', {
    description: 'Rate limit hits',
  }),
};

// Trace API proxy requests
export async function traceProxyRequest<T>(
  apiId: string,
  endpoint: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(`proxy.${method}.${endpoint}`, async (span) => {
    span.setAttributes({
      'api.id': apiId,
      'api.endpoint': endpoint,
      'http.method': method,
    });

    const startTime = Date.now();

    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });

      marketplaceMetrics.apiCalls.add(1, { api_id: apiId, status: 'success' });
      marketplaceMetrics.proxyLatency.record(Date.now() - startTime, { api_id: apiId });

      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);

      marketplaceMetrics.apiCalls.add(1, { api_id: apiId, status: 'error' });

      throw error;
    } finally {
      span.end();
    }
  });
}

// Health check endpoint
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkStripe(),
  ]);

  const results = {
    database: checks[0].status === 'fulfilled',
    redis: checks[1].status === 'fulfilled',
    stripe: checks[2].status === 'fulfilled',
  };

  const healthy = Object.values(results).every(Boolean);

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: results,
    },
    { status: healthy ? 200 : 503 }
  );
}

// Usage alerting
// lib/monitoring/alerts.ts
export async function checkUsageAlerts(subscriptionId: string) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true, user: true },
  });

  if (!subscription?.plan.requestsPerMonth) return;

  const usagePercent = (subscription.requestsUsed / subscription.plan.requestsPerMonth) * 100;

  if (usagePercent >= 90 && !subscription.alert90Sent) {
    await sendUsageAlert(subscription.user, 90, subscription);
    await db.subscription.update({
      where: { id: subscriptionId },
      data: { alert90Sent: true },
    });
  }

  if (usagePercent >= 100) {
    await sendQuotaExceededAlert(subscription.user, subscription);
  }
}
```

### Key Metrics to Monitor

| Metric | Alert Threshold | Description |
|--------|-----------------|-------------|
| Proxy P99 Latency | > 200ms | API proxy performance |
| Error Rate | > 2% | Failed API requests |
| Rate Limit Hits | > 1000/min | Potential abuse |
| Subscription Churn | > 5%/month | Business metric |
| Revenue MRR | - | Business metric |
| API Uptime | < 99.9% | Provider SLA |

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/marketplace"

# Redis
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_URL=""
UPSTASH_REDIS_TOKEN=""

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID=""

# API Proxy
API_PROXY_TIMEOUT="30000"
MAX_REQUEST_SIZE="10mb"

# Rate Limiting
DEFAULT_RATE_LIMIT="100"
RATE_LIMIT_WINDOW="60000"

# Monitoring
OTEL_EXPORTER_OTLP_ENDPOINT=""
OTEL_SERVICE_NAME="api-marketplace"
SENTRY_DSN=""

# Email
RESEND_API_KEY=""
EMAIL_FROM="noreply@marketplace.com"

# Feature Flags
ENABLE_PROVIDER_SIGNUP="true"
ENABLE_FREE_TIER="true"
MAINTENANCE_MODE="false"
```

### Environment-Specific Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `DATABASE_URL` | Local PostgreSQL | Staging RDS | Production RDS |
| `STRIPE_SECRET_KEY` | Test key | Test key | Live key |
| `RATE_LIMIT` | 1000/min | 200/min | 100/min |
| `LOG_LEVEL` | debug | info | warn |
| `CACHE_TTL` | 60s | 300s | 3600s |

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, e2e)
- [ ] Security scan completed with no high/critical issues
- [ ] Database migrations reviewed and tested
- [ ] Stripe webhooks configured for new environment
- [ ] Rate limiting rules reviewed
- [ ] API documentation up to date

### Database

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify indexes on `ApiKey.hashedKey`, `Api.slug`
- [ ] Set up connection pooling for proxy routes
- [ ] Configure read replicas for analytics queries
- [ ] Verify foreign key constraints

### Stripe Setup

- [ ] Webhook endpoint registered: `/api/webhooks/stripe`
- [ ] Products and prices created/synced
- [ ] Connect accounts configured for providers
- [ ] Test subscription flow end-to-end
- [ ] Verify webhook signature validation

### Redis/Caching

- [ ] Redis cluster accessible
- [ ] Rate limiting working correctly
- [ ] Cache invalidation tested
- [ ] Session storage configured

### Monitoring

- [ ] Health check endpoints responding
- [ ] Alerts configured for critical metrics
- [ ] Error tracking enabled (Sentry)
- [ ] Request tracing enabled
- [ ] Usage dashboards configured

### Security

- [ ] API key hashing verified
- [ ] Rate limiting active on all public endpoints
- [ ] CORS configured correctly
- [ ] Webhook signatures verified
- [ ] Admin routes protected

### Post-Deployment

- [ ] Smoke test API directory search
- [ ] Verify subscription flow
- [ ] Test API key generation
- [ ] Verify proxy routing
- [ ] Check rate limiting behavior
- [ ] Monitor error rates for 24 hours
- [ ] Validate Stripe webhook delivery

### Rollback Plan

1. Revert Vercel deployment to previous version
2. Rollback database migrations if needed
3. Update Stripe webhook endpoint if changed
4. Clear Redis cache
5. Notify providers of any service disruption
6. Investigate root cause before re-deployment

## Changelog

- 1.0.0: Initial API marketplace recipe with full feature set
