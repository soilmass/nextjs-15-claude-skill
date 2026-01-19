---
id: r-api-management
name: API Management Platform
version: 1.0.0
layer: L6
category: recipes
description: API gateway with key management, rate limiting, analytics, and documentation
tags: [developer-tools, api, gateway, rate-limiting, analytics, next15]
formula: "APIManagement = Dashboard(t-dashboard-layout) + DataTable(o-data-table) + Charts(o-chart) + RateLimiting(pt-rate-limiting) + Gateway(pt-api-gateway) + Audit(pt-audit-logging)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/settings-page.md
  - ../templates/documentation-layout.md
  # L3 Organisms
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/sidebar.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  # L5 Patterns
  - ../patterns/rate-limiting.md
  - ../patterns/api-gateway.md
  - ../patterns/audit-logging.md
  - ../patterns/api-key-management.md
  - ../patterns/webhook-delivery.md
  - ../patterns/usage-metering.md
dependencies:
  next: "^15.1.0"
  prisma: "^6.0.0"
  "@upstash/ratelimit": "^2.0.0"
  "@upstash/redis": "^1.34.0"
  zod: "^3.23.0"
  recharts: "^2.12.0"
complexity: advanced
estimated_time: 16-24 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# API Management Platform

## Overview

Build a production-ready API management platform with key generation, rate limiting, request analytics, and developer documentation. Features include tiered access plans, webhook subscriptions, and usage-based billing integration.

## Architecture

```
app/
├── (dashboard)/
│   ├── layout.tsx                    # Dashboard shell
│   ├── page.tsx                      # Overview/stats
│   ├── api-keys/
│   │   ├── page.tsx                  # Key management
│   │   └── [keyId]/
│   │       └── page.tsx              # Key details
│   ├── analytics/
│   │   └── page.tsx                  # Usage analytics
│   ├── logs/
│   │   └── page.tsx                  # Request logs
│   ├── webhooks/
│   │   └── page.tsx                  # Webhook config
│   └── settings/
│       └── page.tsx                  # Plan & billing
├── (docs)/
│   ├── layout.tsx                    # Docs layout
│   └── [...slug]/
│       └── page.tsx                  # API documentation
├── api/
│   ├── v1/
│   │   └── [...path]/
│   │       └── route.ts              # API Gateway
│   ├── keys/
│   │   └── route.ts                  # Key management
│   ├── analytics/
│   │   └── route.ts                  # Analytics data
│   ├── webhooks/
│   │   └── route.ts                  # Webhook CRUD
│   └── billing/
│       └── usage/
│           └── route.ts              # Usage reporting
└── playground/
    └── page.tsx                      # API playground
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| dashboard-layout | L4 | Admin interface shell |
| data-table | L3 | Keys, logs, webhooks display |
| chart | L3 | Analytics visualization |
| rate-limiting | L5 | Per-key rate limits |
| api-gateway | L5 | Request proxying |
| audit-logging | L5 | Request/response logging |

## Implementation

### Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  plan        Plan      @default(FREE)
  apiKeys     ApiKey[]
  webhooks    Webhook[]
  usageRecords UsageRecord[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([slug])
}

model ApiKey {
  id             String    @id @default(cuid())
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  name           String
  keyHash        String    @unique
  keyPrefix      String    // First 8 chars for display
  scopes         String[]  @default([])
  rateLimit      Int       @default(1000)  // Requests per minute
  ipWhitelist    String[]  @default([])
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  isActive       Boolean   @default(true)
  requests       RequestLog[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([keyHash])
  @@index([organizationId])
}

model RequestLog {
  id           String   @id @default(cuid())
  apiKey       ApiKey   @relation(fields: [apiKeyId], references: [id], onDelete: Cascade)
  apiKeyId     String
  method       String
  path         String
  statusCode   Int
  latencyMs    Int
  requestSize  Int
  responseSize Int
  ipAddress    String
  userAgent    String?
  errorMessage String?
  metadata     Json?
  createdAt    DateTime @default(now())

  @@index([apiKeyId, createdAt])
  @@index([createdAt])
}

model Webhook {
  id             String    @id @default(cuid())
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  url            String
  events         String[]
  secret         String
  isActive       Boolean   @default(true)
  deliveries     WebhookDelivery[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([organizationId])
}

model WebhookDelivery {
  id          String   @id @default(cuid())
  webhook     Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  webhookId   String
  event       String
  payload     Json
  statusCode  Int?
  response    String?
  attempts    Int      @default(0)
  deliveredAt DateTime?
  createdAt   DateTime @default(now())

  @@index([webhookId, createdAt])
}

model UsageRecord {
  id             String       @id @default(cuid())
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  period         DateTime     // Start of billing period
  requests       Int          @default(0)
  bandwidth      BigInt       @default(0)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([organizationId, period])
  @@index([organizationId, period])
}

enum Plan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}
```

### API Key Management

```typescript
// lib/api-keys.ts
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

const KEY_PREFIX = 'ak_';

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const rawKey = randomBytes(32).toString('base64url');
  const key = `${KEY_PREFIX}${rawKey}`;
  const hash = hashApiKey(key);
  const prefix = key.slice(0, 11); // ak_ + 8 chars

  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  apiKey?: Awaited<ReturnType<typeof prisma.apiKey.findUnique>>;
  error?: string;
}> {
  if (!key.startsWith(KEY_PREFIX)) {
    return { valid: false, error: 'Invalid key format' };
  }

  const hash = hashApiKey(key);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { organization: true },
  });

  if (!apiKey) {
    return { valid: false, error: 'Key not found' };
  }

  if (!apiKey.isActive) {
    return { valid: false, error: 'Key is disabled' };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: 'Key has expired' };
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { valid: true, apiKey };
}

export function checkScope(apiKey: { scopes: string[] }, requiredScope: string): boolean {
  if (apiKey.scopes.includes('*')) return true;
  return apiKey.scopes.includes(requiredScope);
}

export function checkIpWhitelist(apiKey: { ipWhitelist: string[] }, ip: string): boolean {
  if (apiKey.ipWhitelist.length === 0) return true;
  return apiKey.ipWhitelist.includes(ip);
}
```

### Rate Limiting Service

```typescript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Plan-based rate limits (requests per minute)
const PLAN_LIMITS: Record<string, number> = {
  FREE: 60,
  STARTER: 600,
  PRO: 6000,
  ENTERPRISE: 60000,
};

export function createRateLimiter(plan: string, customLimit?: number) {
  const limit = customLimit ?? PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, '1 m'),
    analytics: true,
    prefix: 'api-ratelimit',
  });
}

export async function checkRateLimit(
  apiKeyId: string,
  plan: string,
  customLimit?: number
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = createRateLimiter(plan, customLimit);
  const { success, limit, remaining, reset } = await limiter.limit(apiKeyId);

  return { success, limit, remaining, reset };
}

// Secondary rate limiter for burst protection
export const burstLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(100, '10 s', 200),
  prefix: 'api-burst',
});
```

### API Gateway Handler

```typescript
// app/api/v1/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkScope, checkIpWhitelist } from '@/lib/api-keys';
import { checkRateLimit, burstLimiter } from '@/lib/rate-limiter';
import { logRequest } from '@/lib/request-logger';
import { z } from 'zod';

const UPSTREAM_URL = process.env.UPSTREAM_API_URL!;

export async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = Date.now();
  const { path } = await params;
  const pathString = `/${path.join('/')}`;

  // Extract API key
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!apiKey) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'API key required' } },
      { status: 401 }
    );
  }

  // Validate API key
  const validation = await validateApiKey(apiKey);
  if (!validation.valid || !validation.apiKey) {
    return NextResponse.json(
      { error: { code: 'INVALID_KEY', message: validation.error } },
      { status: 401 }
    );
  }

  const { apiKey: key, organization } = { apiKey: validation.apiKey, organization: validation.apiKey.organization };

  // Check IP whitelist
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  if (!checkIpWhitelist(key, clientIp)) {
    return NextResponse.json(
      { error: { code: 'IP_BLOCKED', message: 'IP not whitelisted' } },
      { status: 403 }
    );
  }

  // Check scope
  const requiredScope = `${request.method.toLowerCase()}:${pathString.split('/')[1]}`;
  if (!checkScope(key, requiredScope)) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(key.id, organization.plan, key.rateLimit);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded' } },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.reset.toString(),
          'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Burst protection
  const burst = await burstLimiter.limit(key.id);
  if (!burst.success) {
    return NextResponse.json(
      { error: { code: 'BURST_LIMITED', message: 'Too many requests' } },
      { status: 429 }
    );
  }

  // Forward request to upstream
  const upstreamUrl = new URL(pathString, UPSTREAM_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.delete('authorization');
  upstreamHeaders.set('X-API-Key-ID', key.id);
  upstreamHeaders.set('X-Organization-ID', organization.id);

  let response: Response;
  let errorMessage: string | undefined;

  try {
    response = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers: upstreamHeaders,
      body: request.body,
    });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Upstream error';
    response = new Response(
      JSON.stringify({ error: { code: 'UPSTREAM_ERROR', message: 'Service unavailable' } }),
      { status: 502 }
    );
  }

  const latencyMs = Date.now() - startTime;

  // Log request
  await logRequest({
    apiKeyId: key.id,
    method: request.method,
    path: pathString,
    statusCode: response.status,
    latencyMs,
    requestSize: parseInt(request.headers.get('content-length') ?? '0'),
    responseSize: parseInt(response.headers.get('content-length') ?? '0'),
    ipAddress: clientIp,
    userAgent: request.headers.get('user-agent'),
    errorMessage,
  });

  // Return response with rate limit headers
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('X-RateLimit-Limit', rateLimit.limit.toString());
  responseHeaders.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  responseHeaders.set('X-RateLimit-Reset', rateLimit.reset.toString());
  responseHeaders.set('X-Request-ID', crypto.randomUUID());

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
```

### Request Logger

```typescript
// lib/request-logger.ts
import { prisma } from '@/lib/prisma';

interface LogEntry {
  apiKeyId: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  requestSize: number;
  responseSize: number;
  ipAddress: string;
  userAgent?: string | null;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export async function logRequest(entry: LogEntry): Promise<void> {
  await prisma.requestLog.create({
    data: {
      apiKeyId: entry.apiKeyId,
      method: entry.method,
      path: entry.path,
      statusCode: entry.statusCode,
      latencyMs: entry.latencyMs,
      requestSize: entry.requestSize,
      responseSize: entry.responseSize,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      errorMessage: entry.errorMessage,
      metadata: entry.metadata,
    },
  });

  // Update usage record for billing
  const periodStart = getMonthStart(new Date());
  await prisma.usageRecord.upsert({
    where: {
      organizationId_period: {
        organizationId: (await prisma.apiKey.findUnique({
          where: { id: entry.apiKeyId },
          select: { organizationId: true },
        }))!.organizationId,
        period: periodStart,
      },
    },
    create: {
      organizationId: (await prisma.apiKey.findUnique({
        where: { id: entry.apiKeyId },
        select: { organizationId: true },
      }))!.organizationId,
      period: periodStart,
      requests: 1,
      bandwidth: BigInt(entry.requestSize + entry.responseSize),
    },
    update: {
      requests: { increment: 1 },
      bandwidth: { increment: BigInt(entry.requestSize + entry.responseSize) },
    },
  });
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
```

### Analytics Dashboard

```typescript
// app/(dashboard)/analytics/page.tsx
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AnalyticsCharts } from '@/components/analytics/charts';
import { StatsCards } from '@/components/analytics/stats-cards';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface SearchParams {
  from?: string;
  to?: string;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;

  const from = params.from ? new Date(params.from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const to = params.to ? new Date(params.to) : new Date();

  const [stats, timeSeries, topEndpoints, errorBreakdown] = await Promise.all([
    getStats(session!.user.organizationId, from, to),
    getTimeSeries(session!.user.organizationId, from, to),
    getTopEndpoints(session!.user.organizationId, from, to),
    getErrorBreakdown(session!.user.organizationId, from, to),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <DateRangePicker from={from} to={to} />
      </div>

      <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
        <StatsCards stats={stats} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<div className="h-80 animate-pulse bg-muted rounded-lg" />}>
          <AnalyticsCharts
            timeSeries={timeSeries}
            topEndpoints={topEndpoints}
            errorBreakdown={errorBreakdown}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function getStats(orgId: string, from: Date, to: Date) {
  const logs = await prisma.requestLog.findMany({
    where: {
      apiKey: { organizationId: orgId },
      createdAt: { gte: from, lte: to },
    },
    select: { statusCode: true, latencyMs: true, requestSize: true, responseSize: true },
  });

  const total = logs.length;
  const successful = logs.filter((l) => l.statusCode < 400).length;
  const avgLatency = total > 0 ? logs.reduce((sum, l) => sum + l.latencyMs, 0) / total : 0;
  const bandwidth = logs.reduce((sum, l) => sum + l.requestSize + l.responseSize, 0);

  return {
    totalRequests: total,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    avgLatency: Math.round(avgLatency),
    bandwidth,
  };
}

async function getTimeSeries(orgId: string, from: Date, to: Date) {
  const logs = await prisma.requestLog.groupBy({
    by: ['createdAt'],
    where: {
      apiKey: { organizationId: orgId },
      createdAt: { gte: from, lte: to },
    },
    _count: true,
  });

  // Group by hour
  const hourlyData = new Map<string, number>();
  logs.forEach((log) => {
    const hour = new Date(log.createdAt).toISOString().slice(0, 13);
    hourlyData.set(hour, (hourlyData.get(hour) ?? 0) + log._count);
  });

  return Array.from(hourlyData.entries()).map(([hour, count]) => ({
    time: hour,
    requests: count,
  }));
}

async function getTopEndpoints(orgId: string, from: Date, to: Date) {
  return prisma.requestLog.groupBy({
    by: ['path', 'method'],
    where: {
      apiKey: { organizationId: orgId },
      createdAt: { gte: from, lte: to },
    },
    _count: true,
    _avg: { latencyMs: true },
    orderBy: { _count: { path: 'desc' } },
    take: 10,
  });
}

async function getErrorBreakdown(orgId: string, from: Date, to: Date) {
  return prisma.requestLog.groupBy({
    by: ['statusCode'],
    where: {
      apiKey: { organizationId: orgId },
      createdAt: { gte: from, lte: to },
      statusCode: { gte: 400 },
    },
    _count: true,
    orderBy: { _count: { statusCode: 'desc' } },
  });
}
```

### Analytics Charts Component

```typescript
// components/analytics/charts.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsChartsProps {
  timeSeries: Array<{ time: string; requests: number }>;
  topEndpoints: Array<{ path: string; method: string; _count: number; _avg: { latencyMs: number | null } }>;
  errorBreakdown: Array<{ statusCode: number; _count: number }>;
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

export function AnalyticsCharts({
  timeSeries,
  topEndpoints,
  errorBreakdown,
}: AnalyticsChartsProps) {
  return (
    <>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Requests Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(v) => new Date(v).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topEndpoints.map((e) => ({
                endpoint: `${e.method} ${e.path}`,
                requests: e._count,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="endpoint" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={errorBreakdown.map((e) => ({
                  name: `${e.statusCode}`,
                  value: e._count,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                dataKey="value"
              >
                {errorBreakdown.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
```

### Webhook Service

```typescript
// lib/webhooks.ts
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function triggerWebhook(
  organizationId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: {
      organizationId,
      isActive: true,
      events: { has: event },
    },
  });

  await Promise.all(
    webhooks.map((webhook) => deliverWebhook(webhook, event, payload))
  );
}

async function deliverWebhook(
  webhook: { id: string; url: string; secret: string },
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const body = JSON.stringify({ event, data: payload, timestamp: Date.now() });
  const signature = createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex');

  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      event,
      payload,
      attempts: 1,
    },
  });

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': event,
      },
      body,
      signal: AbortSignal.timeout(30000),
    });

    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        statusCode: response.status,
        response: await response.text().catch(() => null),
        deliveredAt: response.ok ? new Date() : null,
      },
    });

    if (!response.ok) {
      scheduleRetry(delivery.id);
    }
  } catch (error) {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        response: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    scheduleRetry(delivery.id);
  }
}

async function scheduleRetry(deliveryId: string): Promise<void> {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { webhook: true },
  });

  if (!delivery || delivery.attempts >= 5) return;

  // Exponential backoff: 1m, 5m, 15m, 1h, 4h
  const delays = [60, 300, 900, 3600, 14400];
  const delay = delays[delivery.attempts - 1] ?? 14400;

  setTimeout(async () => {
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: { attempts: { increment: 1 } },
    });
    await deliverWebhook(
      delivery.webhook,
      delivery.event,
      delivery.payload as Record<string, unknown>
    );
  }, delay * 1000);
}
```

### API Key Management UI

```typescript
// app/(dashboard)/api-keys/page.tsx
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiKeyTable } from '@/components/api-keys/table';
import { CreateKeyDialog } from '@/components/api-keys/create-dialog';

export default async function ApiKeysPage() {
  const session = await auth();

  const apiKeys = await prisma.apiKey.findMany({
    where: { organizationId: session!.user.organizationId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      scopes: true,
      rateLimit: true,
      lastUsedAt: true,
      expiresAt: true,
      isActive: true,
      createdAt: true,
      _count: { select: { requests: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys and access permissions
          </p>
        </div>
        <CreateKeyDialog />
      </div>

      <ApiKeyTable keys={apiKeys} />
    </div>
  );
}
```

### Create Key Server Action

```typescript
// app/actions/api-keys.ts
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/api-keys';
import { revalidatePath } from 'next/cache';

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).default([]),
  rateLimit: z.number().min(1).max(100000).optional(),
  ipWhitelist: z.array(z.string().ip()).default([]),
  expiresAt: z.date().optional(),
});

export async function createApiKey(data: z.infer<typeof createKeySchema>) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const validated = createKeySchema.parse(data);
  const { key, hash, prefix } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      organizationId: session.user.organizationId,
      name: validated.name,
      keyHash: hash,
      keyPrefix: prefix,
      scopes: validated.scopes,
      rateLimit: validated.rateLimit,
      ipWhitelist: validated.ipWhitelist,
      expiresAt: validated.expiresAt,
    },
  });

  revalidatePath('/api-keys');

  // Return the key only once - it cannot be retrieved later
  return { key };
}

export async function rotateApiKey(keyId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const existingKey = await prisma.apiKey.findFirst({
    where: { id: keyId, organizationId: session.user.organizationId },
  });

  if (!existingKey) throw new Error('Key not found');

  const { key, hash, prefix } = generateApiKey();

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { keyHash: hash, keyPrefix: prefix },
  });

  revalidatePath('/api-keys');
  return { key };
}

export async function deleteApiKey(keyId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await prisma.apiKey.deleteMany({
    where: { id: keyId, organizationId: session.user.organizationId },
  });

  revalidatePath('/api-keys');
}

export async function toggleApiKey(keyId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await prisma.apiKey.updateMany({
    where: { id: keyId, organizationId: session.user.organizationId },
    data: { isActive },
  });

  revalidatePath('/api-keys');
}
```

### Billing Integration

```typescript
// lib/billing.ts
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_PRICES: Record<string, string> = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID!,
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
};

export async function reportUsageToStripe(organizationId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org?.stripeSubscriptionId) return;

  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);

  const usage = await prisma.usageRecord.findUnique({
    where: {
      organizationId_period: {
        organizationId,
        period: periodStart,
      },
    },
  });

  if (!usage) return;

  const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
  const meteredItem = subscription.items.data.find(
    (item) => item.price.recurring?.usage_type === 'metered'
  );

  if (meteredItem) {
    await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
      quantity: usage.requests,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'set',
    });
  }
}

export async function getUsageForBilling(organizationId: string) {
  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);

  const usage = await prisma.usageRecord.findUnique({
    where: {
      organizationId_period: {
        organizationId,
        period: periodStart,
      },
    },
  });

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  const planLimits: Record<string, number> = {
    FREE: 10000,
    STARTER: 100000,
    PRO: 1000000,
    ENTERPRISE: Infinity,
  };

  return {
    currentRequests: usage?.requests ?? 0,
    currentBandwidth: Number(usage?.bandwidth ?? 0),
    limit: planLimits[org?.plan ?? 'FREE'],
    periodStart,
    periodEnd: new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0),
  };
}
```

### Developer Documentation

```typescript
// app/(docs)/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getDocContent, getDocNavigation } from '@/lib/docs';
import { DocsSidebar } from '@/components/docs/sidebar';
import { CodeBlock } from '@/components/docs/code-block';
import { ApiPlayground } from '@/components/docs/api-playground';

const components = {
  code: CodeBlock,
  ApiPlayground,
};

interface DocsPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const path = slug?.join('/') ?? 'introduction';

  const doc = await getDocContent(path);
  if (!doc) notFound();

  const navigation = await getDocNavigation();

  return (
    <div className="flex min-h-screen">
      <DocsSidebar navigation={navigation} currentPath={path} />

      <main className="flex-1 px-8 py-12 max-w-4xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1>{doc.title}</h1>
          <MDXRemote source={doc.content} components={components} />
        </article>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const docs = await getDocNavigation();
  const paths: { slug: string[] }[] = [];

  function collectPaths(items: typeof docs) {
    items.forEach((item) => {
      if (item.href) {
        paths.push({ slug: item.href.split('/').filter(Boolean) });
      }
      if (item.children) {
        collectPaths(item.children);
      }
    });
  }

  collectPaths(docs);
  return paths;
}
```

### API Playground Component

```typescript
// components/docs/api-playground.tsx
'use client';

import { useState } from 'react';
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

interface ApiPlaygroundProps {
  endpoint: string;
  method?: string;
  defaultBody?: string;
}

export function ApiPlayground({
  endpoint,
  method = 'GET',
  defaultBody = '',
}: ApiPlaygroundProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(method);
  const [body, setBody] = useState(defaultBody);
  const [response, setResponse] = useState<{
    status: number;
    data: unknown;
    headers: Record<string, string>;
    latency: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const executeRequest = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch(`/api/v1${endpoint}`, {
        method: selectedMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: ['POST', 'PUT', 'PATCH'].includes(selectedMethod) ? body : undefined,
      });

      const data = await res.json();
      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });

      setResponse({
        status: res.status,
        data,
        headers,
        latency: Date.now() - startTime,
      });
    } catch (error) {
      setResponse({
        status: 0,
        data: { error: error instanceof Error ? error.message : 'Request failed' },
        headers: {},
        latency: Date.now() - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 not-prose">
      <div className="flex gap-2">
        <Select value={selectedMethod} onValueChange={setSelectedMethod}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={`/api/v1${endpoint}`}
          readOnly
          className="font-mono text-sm"
        />
      </div>

      <Input
        placeholder="API Key (ak_...)"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        type="password"
      />

      {['POST', 'PUT', 'PATCH'].includes(selectedMethod) && (
        <Textarea
          placeholder="Request body (JSON)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="font-mono text-sm min-h-32"
        />
      )}

      <Button onClick={executeRequest} disabled={loading || !apiKey}>
        {loading ? 'Sending...' : 'Send Request'}
      </Button>

      {response && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
                response.status < 300
                  ? 'bg-green-100 text-green-800'
                  : response.status < 500
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {response.status}
            </span>
            <span className="text-sm text-muted-foreground">
              {response.latency}ms
            </span>
          </div>
          <pre className="bg-muted p-4 rounded overflow-auto text-sm">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

## Testing

### API Key Tests

```typescript
// tests/api-keys.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateApiKey, validateApiKey, hashApiKey } from '@/lib/api-keys';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('API Key Management', () => {
  describe('generateApiKey', () => {
    it('generates key with correct prefix', () => {
      const { key, hash, prefix } = generateApiKey();

      expect(key).toMatch(/^ak_/);
      expect(prefix).toMatch(/^ak_/);
      expect(prefix.length).toBe(11);
      expect(hash).toHaveLength(64); // SHA-256 hex
    });

    it('generates unique keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();

      expect(key1.key).not.toBe(key2.key);
      expect(key1.hash).not.toBe(key2.hash);
    });
  });

  describe('hashApiKey', () => {
    it('produces consistent hashes', () => {
      const key = 'ak_test123';
      const hash1 = hashApiKey(key);
      const hash2 = hashApiKey(key);

      expect(hash1).toBe(hash2);
    });
  });

  describe('validateApiKey', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('rejects invalid prefix', async () => {
      const result = await validateApiKey('invalid_key');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid key format');
    });

    it('rejects expired keys', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.apiKey.findUnique as any).mockResolvedValue({
        id: '1',
        isActive: true,
        expiresAt: new Date(Date.now() - 1000),
        organization: { id: 'org1' },
      });

      const result = await validateApiKey('ak_validkey123');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Key has expired');
    });
  });
});
```

### Rate Limiter Tests

```typescript
// tests/rate-limiter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    eval: vi.fn(),
  })),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    }),
  })),
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows requests within limit', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limiter');
    const result = await checkRateLimit('key1', 'PRO');

    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('uses plan-based limits', async () => {
    const { createRateLimiter } = await import('@/lib/rate-limiter');

    createRateLimiter('FREE');
    createRateLimiter('ENTERPRISE');

    // Verify different configs were used
    const { Ratelimit } = await import('@upstash/ratelimit');
    expect(Ratelimit).toHaveBeenCalledTimes(2);
  });
});
```

### Gateway E2E Tests

```typescript
// tests/e2e/gateway.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Gateway', () => {
  let apiKey: string;

  test.beforeAll(async ({ request }) => {
    // Create test API key
    const response = await request.post('/api/test/create-key');
    const data = await response.json();
    apiKey = data.key;
  });

  test('accepts valid API key', async ({ request }) => {
    const response = await request.get('/api/v1/test', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
  });

  test('rejects missing API key', async ({ request }) => {
    const response = await request.get('/api/v1/test');

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  test('enforces rate limits', async ({ request }) => {
    // Exhaust rate limit
    const promises = Array(100).fill(null).map(() =>
      request.get('/api/v1/test', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
    );

    const responses = await Promise.all(promises);
    const rateLimited = responses.some((r) => r.status() === 429);

    expect(rateLimited).toBe(true);
  });

  test('returns rate limit headers', async ({ request }) => {
    const response = await request.get('/api/v1/test', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.headers()['x-ratelimit-limit']).toBeDefined();
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers()['x-ratelimit-reset']).toBeDefined();
  });
});
```

## Security

### Key Hashing

API keys are never stored in plaintext. Only SHA-256 hashes are persisted, with a prefix retained for display.

```typescript
// Security: Keys are hashed before storage
const hash = createHash('sha256').update(key).digest('hex');
```

### IP Whitelisting

```typescript
// Restrict key usage to specific IPs
export function checkIpWhitelist(
  apiKey: { ipWhitelist: string[] },
  clientIp: string
): boolean {
  if (apiKey.ipWhitelist.length === 0) return true;

  return apiKey.ipWhitelist.some((allowedIp) => {
    // Support CIDR notation
    if (allowedIp.includes('/')) {
      return isIpInCidr(clientIp, allowedIp);
    }
    return clientIp === allowedIp;
  });
}
```

### Webhook Signature Verification

```typescript
// Consumers verify webhooks with HMAC signatures
const signature = createHmac('sha256', webhook.secret)
  .update(body)
  .digest('hex');

// Sent as X-Webhook-Signature: sha256={signature}
```

## Environment Variables

```bash
# .env.example
DATABASE_URL="postgresql://..."
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."
UPSTREAM_API_URL="https://your-backend.com"
STRIPE_SECRET_KEY="sk_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."
```

## Changelog

### v1.0.0 (2025-01-18)
- Initial release
- API key generation with SHA-256 hashing
- Per-key and plan-based rate limiting
- Request/response logging with analytics
- Webhook subscriptions with retry logic
- Usage-based billing integration
- Developer documentation portal
- Interactive API playground
