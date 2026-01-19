---
id: pt-web-vitals
name: Web Vitals
version: 2.0.0
layer: L5
category: observability
description: Core Web Vitals monitoring with web-vitals library, analytics integration, and performance dashboards
tags: [web-vitals, performance, lcp, fid, cls, analytics, monitoring]
composes: []
dependencies:
  web-vitals: "^4.2.0"
formula: LCP + FID/INP + CLS + reporting = SEO-friendly user experience measurement
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Web Vitals

Monitor and optimize Core Web Vitals for better user experience and SEO.

## When to Use

- SEO-critical applications where Core Web Vitals affect rankings
- Performance optimization projects needing baseline measurements
- User experience monitoring in production environments
- Setting up performance budgets and regression alerts
- Comparing performance across pages, releases, or user segments

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|   Browser APIs    |---->|  pt-web-vitals    |---->|  Analytics API    |
| (Performance API) |     |   (web-vitals)    |     |   (/api/vitals)   |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|  LCP/FID/CLS/INP  |     |  Rating System    |     |   pt-metrics      |
|   TTFB/FCP        |     | (good/needs-impr) |     | (Store & Query)   |
+-------------------+     +-------------------+     +-------------------+
                                  |                        |
                                  v                        v
                          +-------------------+     +-------------------+
                          | pt-user-analytics |     |   pt-alerting     |
                          | (Session Context) |     | (Budget Alerts)   |
                          +-------------------+     +-------------------+
                                                           |
                                                           v
                                                   +-------------------+
                                                   |     pt-rum        |
                                                   | (Full RUM Data)   |
                                                   +-------------------+
```

## Overview

This pattern covers:
- Core Web Vitals measurement (LCP, FID, CLS, FCP, TTFB, INP)
- Analytics integration (Vercel, Google Analytics, custom)
- Real User Monitoring (RUM)
- Performance budgets
- Alerting on regressions
- Debug mode for development

## Implementation

### Installation

```bash
npm install web-vitals
```

### Web Vitals Reporter

```typescript
// lib/vitals/reporter.ts
import type { Metric } from 'web-vitals';

export type VitalsMetric = Metric;

export interface VitalsReporter {
  (metric: VitalsMetric): void;
}

// Format metric for logging
export function formatMetric(metric: VitalsMetric): string {
  const value = metric.name === 'CLS' 
    ? metric.value.toFixed(3) 
    : `${Math.round(metric.value)}ms`;
  
  return `${metric.name}: ${value} (${metric.rating})`;
}

// Thresholds based on Google's recommendations
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 },
};

// Get rating color for visualization
export function getRatingColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'green';
    case 'needs-improvement':
      return 'yellow';
    case 'poor':
      return 'red';
    default:
      return 'gray';
  }
}

// Send to analytics endpoint
export async function sendToAnalytics(metric: VitalsMetric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    // Add page context
    page: window.location.pathname,
    timestamp: Date.now(),
    // Add user agent info
    connection: (navigator as any).connection?.effectiveType,
    deviceMemory: (navigator as any).deviceMemory,
  };

  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    navigator.sendBeacon('/api/vitals', blob);
  } else {
    // Fallback to fetch
    fetch('/api/vitals', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    });
  }
}
```

### Web Vitals Hook

```typescript
// hooks/use-web-vitals.ts
'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';
import type { VitalsMetric, VitalsReporter } from '@/lib/vitals/reporter';
import { sendToAnalytics, formatMetric } from '@/lib/vitals/reporter';

interface UseWebVitalsOptions {
  reportAll?: boolean;
  debug?: boolean;
  onReport?: VitalsReporter;
}

export function useWebVitals(options: UseWebVitalsOptions = {}) {
  const { reportAll = false, debug = false, onReport } = options;

  useEffect(() => {
    const report: VitalsReporter = (metric) => {
      // Debug logging
      if (debug || process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${formatMetric(metric)}`);
      }

      // Custom reporter
      if (onReport) {
        onReport(metric);
      }

      // Send to analytics
      sendToAnalytics(metric);
    };

    // Report options
    const opts = { reportAllChanges: reportAll };

    // Register all metrics
    onCLS(report, opts);
    onFCP(report, opts);
    onFID(report, opts);
    onINP(report, opts);
    onLCP(report, opts);
    onTTFB(report, opts);
  }, [reportAll, debug, onReport]);
}
```

### Web Vitals Component

```typescript
// components/analytics/web-vitals.tsx
'use client';

import { useWebVitals } from '@/hooks/use-web-vitals';

interface WebVitalsProps {
  debug?: boolean;
}

export function WebVitals({ debug }: WebVitalsProps) {
  useWebVitals({
    debug,
    reportAll: false,
  });

  return null;
}

// Usage in layout
// app/layout.tsx
// <WebVitals debug={process.env.NODE_ENV === 'development'} />
```

### Analytics API Endpoint

```typescript
// app/api/vitals/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface VitalsPayload {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
  navigationType: string;
  page: string;
  timestamp: number;
  connection?: string;
  deviceMemory?: number;
}

export async function POST(request: Request) {
  try {
    const data: VitalsPayload = await request.json();

    // Store in database
    await prisma.webVital.create({
      data: {
        name: data.name,
        value: data.value,
        rating: data.rating,
        delta: data.delta,
        metricId: data.id,
        navigationType: data.navigationType,
        page: data.page,
        connection: data.connection,
        deviceMemory: data.deviceMemory,
        timestamp: new Date(data.timestamp),
      },
    });

    // Check for performance budget violations
    await checkPerformanceBudget(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to record web vital:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Check against performance budgets
async function checkPerformanceBudget(data: VitalsPayload) {
  const budgets: Record<string, number> = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 800,
    INP: 200,
  };

  const budget = budgets[data.name];
  if (budget && data.value > budget) {
    // Log violation
    console.warn(
      `[Performance Budget] ${data.name} exceeded budget: ${data.value} > ${budget} on ${data.page}`
    );

    // Could trigger alerts here
    // await sendAlert({ metric: data.name, value: data.value, budget, page: data.page });
  }
}
```

### Vercel Analytics Integration

```typescript
// components/analytics/vercel-analytics.tsx
'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function VercelAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

// Usage in layout
// <VercelAnalytics />
```

### Google Analytics Integration

```typescript
// lib/vitals/google-analytics.ts
import type { VitalsMetric } from './reporter';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function sendToGoogleAnalytics(metric: VitalsMetric) {
  if (typeof window.gtag !== 'function') return;

  // Send as custom event
  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
    // Additional dimensions
    metric_rating: metric.rating,
    metric_delta: metric.delta,
  });
}

// components/analytics/google-analytics.tsx
'use client';

import Script from 'next/script';
import { useWebVitals } from '@/hooks/use-web-vitals';
import { sendToGoogleAnalytics } from '@/lib/vitals/google-analytics';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  useWebVitals({
    onReport: sendToGoogleAnalytics,
  });

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
```

### Performance Dashboard Data

```typescript
// lib/vitals/dashboard.ts
import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export interface VitalsSummary {
  name: string;
  p75: number;
  p90: number;
  p99: number;
  average: number;
  count: number;
  goodPercent: number;
  needsImprovementPercent: number;
  poorPercent: number;
}

export const getVitalsSummary = cache(async (
  timeRange: '24h' | '7d' | '30d' = '24h'
): Promise<VitalsSummary[]> => {
  const timeMap = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };

  const since = new Date(Date.now() - timeMap[timeRange]);

  const metrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'];
  const summaries: VitalsSummary[] = [];

  for (const name of metrics) {
    const data = await prisma.webVital.findMany({
      where: {
        name,
        timestamp: { gte: since },
      },
      select: {
        value: true,
        rating: true,
      },
      orderBy: { value: 'asc' },
    });

    if (data.length === 0) continue;

    const values = data.map((d) => d.value);
    const count = values.length;

    // Calculate percentiles
    const p75Index = Math.floor(count * 0.75);
    const p90Index = Math.floor(count * 0.9);
    const p99Index = Math.floor(count * 0.99);

    // Calculate rating distribution
    const good = data.filter((d) => d.rating === 'good').length;
    const needsImprovement = data.filter((d) => d.rating === 'needs-improvement').length;
    const poor = data.filter((d) => d.rating === 'poor').length;

    summaries.push({
      name,
      p75: values[p75Index],
      p90: values[p90Index],
      p99: values[p99Index],
      average: values.reduce((a, b) => a + b, 0) / count,
      count,
      goodPercent: (good / count) * 100,
      needsImprovementPercent: (needsImprovement / count) * 100,
      poorPercent: (poor / count) * 100,
    });
  }

  return summaries;
});

// Get vitals by page
export const getVitalsByPage = cache(async (
  page: string,
  timeRange: '24h' | '7d' | '30d' = '24h'
) => {
  const timeMap = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };

  const since = new Date(Date.now() - timeMap[timeRange]);

  return prisma.webVital.groupBy({
    by: ['name'],
    where: {
      page,
      timestamp: { gte: since },
    },
    _avg: { value: true },
    _count: true,
  });
});

// Get trending data
export const getVitalsTrend = cache(async (
  name: string,
  days: number = 7
) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await prisma.$queryRaw`
    SELECT 
      DATE(timestamp) as date,
      AVG(value) as average,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75
    FROM web_vitals
    WHERE name = ${name}
      AND timestamp >= ${since}
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `;

  return data;
});
```

### Performance Dashboard Component

```typescript
// components/dashboard/vitals-dashboard.tsx
'use client';

import { useState } from 'react';
import type { VitalsSummary } from '@/lib/vitals/dashboard';
import { VITALS_THRESHOLDS, getRatingColor } from '@/lib/vitals/reporter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface VitalsDashboardProps {
  data: VitalsSummary[];
  timeRange: '24h' | '7d' | '30d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d') => void;
}

export function VitalsDashboard({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}: VitalsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Core Web Vitals</h2>
        <Tabs value={timeRange} onValueChange={(v) => onTimeRangeChange(v as any)}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((vital) => (
          <VitalCard key={vital.name} vital={vital} />
        ))}
      </div>
    </div>
  );
}

function VitalCard({ vital }: { vital: VitalsSummary }) {
  const threshold = VITALS_THRESHOLDS[vital.name as keyof typeof VITALS_THRESHOLDS];
  const isGood = vital.p75 <= threshold?.good;
  const isPoor = vital.p75 > threshold?.needsImprovement;

  const formatValue = (value: number) => {
    if (vital.name === 'CLS') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{vital.name}</span>
          <span className={`text-sm font-normal px-2 py-1 rounded ${
            isGood ? 'bg-green-100 text-green-800' :
            isPoor ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {isGood ? 'Good' : isPoor ? 'Poor' : 'Needs Improvement'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">
          {formatValue(vital.p75)}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            p75
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">p90</span>
            <span>{formatValue(vital.p90)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">p99</span>
            <span>{formatValue(vital.p99)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Samples</span>
            <span>{vital.count.toLocaleString()}</span>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="mt-4 space-y-1">
          <div className="flex gap-1 h-2 rounded overflow-hidden">
            <div 
              className="bg-green-500" 
              style={{ width: `${vital.goodPercent}%` }} 
            />
            <div 
              className="bg-yellow-500" 
              style={{ width: `${vital.needsImprovementPercent}%` }} 
            />
            <div 
              className="bg-red-500" 
              style={{ width: `${vital.poorPercent}%` }} 
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{vital.goodPercent.toFixed(0)}% good</span>
            <span>{vital.poorPercent.toFixed(0)}% poor</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Database Schema

```prisma
// prisma/schema.prisma additions
model WebVital {
  id             String   @id @default(cuid())
  name           String   // LCP, FID, CLS, etc.
  value          Float
  rating         String   // good, needs-improvement, poor
  delta          Float
  metricId       String
  navigationType String?
  page           String
  connection     String?
  deviceMemory   Float?
  timestamp      DateTime

  @@index([name, timestamp])
  @@index([page, timestamp])
  @@index([rating])
}
```

## Variants

### Real-time Alerting

```typescript
// lib/vitals/alerts.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPerformanceAlert(params: {
  metric: string;
  value: number;
  threshold: number;
  page: string;
}) {
  await resend.emails.send({
    from: 'alerts@example.com',
    to: process.env.ALERT_EMAIL!,
    subject: `[Performance Alert] ${params.metric} exceeded threshold`,
    html: `
      <h2>Performance Budget Exceeded</h2>
      <p><strong>Metric:</strong> ${params.metric}</p>
      <p><strong>Value:</strong> ${params.value}</p>
      <p><strong>Threshold:</strong> ${params.threshold}</p>
      <p><strong>Page:</strong> ${params.page}</p>
    `,
  });
}
```

## Anti-patterns

1. **Reporting all changes** - Only report final values to reduce noise
2. **Blocking analytics** - Use sendBeacon or keepalive for reliability
3. **No context** - Always include page path and user context
4. **Ignoring navigation type** - Separate initial load from soft navigation metrics
5. **No alerting** - Set up alerts for performance budget violations

## Related Skills

- [[observability]] - General observability patterns
- [[metrics]] - Custom metrics collection
- [[user-analytics]] - User behavior analytics

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial Web Vitals monitoring with analytics and dashboard
