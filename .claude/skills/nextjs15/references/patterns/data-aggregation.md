---
id: pt-data-aggregation
name: Data Aggregation
version: 1.0.0
layer: L5
category: data
description: Data aggregation queries with Prisma, time-series, and reporting
tags: [data, aggregation, analytics, reporting, prisma, next15]
composes:
  - ../molecules/stat-card.md
dependencies: []
formula: "DataAggregation = PrismaAggregate + GroupBy + TimeSeries + Caching"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Data Aggregation

## When to Use

- Dashboard analytics and metrics
- Reporting and business intelligence
- Time-series data analysis
- Statistical summaries
- Trend calculations

## Composition Diagram

```
Data Aggregation Flow
=====================

+------------------------------------------+
|  Raw Data                                |
|  - Individual records                    |
|  - Event logs                            |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Aggregation Queries                     |
|  - GROUP BY                              |
|  - SUM, COUNT, AVG                       |
|  - Time bucketing                        |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Caching Layer                           |
|  - Materialized views                    |
|  - Redis caching                         |
|  - Revalidation                          |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  API Response                            |
|  - Formatted metrics                     |
|  - Chart-ready data                      |
+------------------------------------------+
```

## Basic Prisma Aggregations

```typescript
// lib/analytics/aggregations.ts
import { prisma } from '@/lib/db';

// Count and sum
export async function getOrderStats(userId: string) {
  const stats = await prisma.order.aggregate({
    where: { userId },
    _count: { _all: true },
    _sum: { total: true },
    _avg: { total: true },
    _min: { total: true },
    _max: { total: true },
  });

  return {
    totalOrders: stats._count._all,
    totalRevenue: stats._sum.total || 0,
    averageOrderValue: stats._avg.total || 0,
    minOrder: stats._min.total || 0,
    maxOrder: stats._max.total || 0,
  };
}

// Group by category
export async function getSalesByCategory() {
  const sales = await prisma.orderItem.groupBy({
    by: ['categoryId'],
    _sum: { quantity: true, price: true },
    _count: { _all: true },
    orderBy: { _sum: { price: 'desc' } },
  });

  // Get category names
  const categoryIds = sales.map((s) => s.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return sales.map((s) => ({
    category: categoryMap.get(s.categoryId) || 'Unknown',
    totalQuantity: s._sum.quantity,
    totalRevenue: s._sum.price,
    orderCount: s._count._all,
  }));
}

// Having clause for filtering aggregates
export async function getTopCustomers(minOrders: number = 5) {
  const customers = await prisma.order.groupBy({
    by: ['userId'],
    _count: { _all: true },
    _sum: { total: true },
    having: {
      _count: { _all: { gte: minOrders } },
    },
    orderBy: { _sum: { total: 'desc' } },
    take: 10,
  });

  return customers;
}
```

## Time-Series Aggregation

```typescript
// lib/analytics/time-series.ts
import { prisma } from '@/lib/db';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

type TimeGranularity = 'hour' | 'day' | 'week' | 'month';

export async function getRevenueTimeSeries(
  startDate: Date,
  endDate: Date,
  granularity: TimeGranularity = 'day'
) {
  // Use raw query for time bucketing
  const dateFormat = {
    hour: '%Y-%m-%d %H:00:00',
    day: '%Y-%m-%d',
    week: '%Y-%W',
    month: '%Y-%m',
  }[granularity];

  const results = await prisma.$queryRaw<{ period: string; revenue: number; orders: number }[]>`
    SELECT
      DATE_FORMAT(created_at, ${dateFormat}) as period,
      SUM(total) as revenue,
      COUNT(*) as orders
    FROM orders
    WHERE created_at >= ${startDate}
      AND created_at <= ${endDate}
      AND status = 'completed'
    GROUP BY period
    ORDER BY period ASC
  `;

  // Fill in missing periods
  return fillMissingPeriods(results, startDate, endDate, granularity);
}

function fillMissingPeriods(
  data: { period: string; revenue: number; orders: number }[],
  startDate: Date,
  endDate: Date,
  granularity: TimeGranularity
) {
  const dataMap = new Map(data.map((d) => [d.period, d]));
  const result: { period: string; revenue: number; orders: number }[] = [];

  let current = startDate;
  while (current <= endDate) {
    const key = formatPeriod(current, granularity);
    result.push(
      dataMap.get(key) || { period: key, revenue: 0, orders: 0 }
    );
    current = incrementPeriod(current, granularity);
  }

  return result;
}

function formatPeriod(date: Date, granularity: TimeGranularity): string {
  switch (granularity) {
    case 'hour':
      return format(date, 'yyyy-MM-dd HH:00:00');
    case 'day':
      return format(date, 'yyyy-MM-dd');
    case 'week':
      return format(date, 'yyyy-ww');
    case 'month':
      return format(date, 'yyyy-MM');
  }
}

function incrementPeriod(date: Date, granularity: TimeGranularity): Date {
  const next = new Date(date);
  switch (granularity) {
    case 'hour':
      next.setHours(next.getHours() + 1);
      break;
    case 'day':
      next.setDate(next.getDate() + 1);
      break;
    case 'week':
      next.setDate(next.getDate() + 7);
      break;
    case 'month':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}
```

## Comparative Analytics

```typescript
// lib/analytics/comparisons.ts
import { prisma } from '@/lib/db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function getMetricsWithComparison(days: number = 30) {
  const now = new Date();
  const currentStart = subDays(now, days);
  const previousStart = subDays(currentStart, days);

  const [currentPeriod, previousPeriod] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: currentStart, lte: now },
        status: 'completed',
      },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: previousStart, lt: currentStart },
        status: 'completed',
      },
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    orders: {
      current: currentPeriod._count._all,
      previous: previousPeriod._count._all,
      change: calculateChange(currentPeriod._count._all, previousPeriod._count._all),
    },
    revenue: {
      current: currentPeriod._sum.total || 0,
      previous: previousPeriod._sum.total || 0,
      change: calculateChange(currentPeriod._sum.total || 0, previousPeriod._sum.total || 0),
    },
    averageOrderValue: {
      current: currentPeriod._count._all > 0
        ? (currentPeriod._sum.total || 0) / currentPeriod._count._all
        : 0,
      previous: previousPeriod._count._all > 0
        ? (previousPeriod._sum.total || 0) / previousPeriod._count._all
        : 0,
    },
  };
}
```

## Cached Aggregation Service

```typescript
// lib/analytics/cached-stats.ts
import { prisma } from '@/lib/db';
import { Redis } from '@upstash/redis';
import { unstable_cache } from 'next/cache';

const redis = Redis.fromEnv();

// Cache with Next.js data cache
export const getCachedDashboardStats = unstable_cache(
  async (userId: string) => {
    const [orders, revenue, customers] = await Promise.all([
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.aggregate({
        where: { status: 'completed' },
        _sum: { total: true },
      }),
      prisma.user.count({ where: { role: 'customer' } }),
    ]);

    return {
      totalOrders: orders,
      totalRevenue: revenue._sum.total || 0,
      totalCustomers: customers,
    };
  },
  ['dashboard-stats'],
  { revalidate: 300, tags: ['dashboard'] } // 5 minutes
);

// Redis caching for real-time stats
export async function getRealtimeStats() {
  const cacheKey = 'realtime:stats';

  // Try cache first
  const cached = await redis.get<any>(cacheKey);
  if (cached) return cached;

  // Compute stats
  const stats = await computeRealtimeStats();

  // Cache for 1 minute
  await redis.set(cacheKey, stats, { ex: 60 });

  return stats;
}

async function computeRealtimeStats() {
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);

  const [orders, revenue, activeUsers] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: lastHour } },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: lastHour } },
      _sum: { total: true },
    }),
    prisma.session.count({
      where: { expires: { gte: new Date() } },
    }),
  ]);

  return {
    ordersLastHour: orders,
    revenueLastHour: revenue._sum.total || 0,
    activeUsers,
    timestamp: new Date().toISOString(),
  };
}
```

## Analytics API Route

```typescript
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCachedDashboardStats } from '@/lib/analytics/cached-stats';
import { getRevenueTimeSeries } from '@/lib/analytics/time-series';
import { getMetricsWithComparison } from '@/lib/analytics/comparisons';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get('range') || '30';
  const granularity = searchParams.get('granularity') || 'day';

  const days = parseInt(range);
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  const [stats, timeSeries, comparisons] = await Promise.all([
    getCachedDashboardStats(session.user.id),
    getRevenueTimeSeries(startDate, endDate, granularity as any),
    getMetricsWithComparison(days),
  ]);

  return NextResponse.json({
    stats,
    timeSeries,
    comparisons,
  });
}
```

## Dashboard Component

```typescript
// components/analytics/analytics-dashboard.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart } from '@/components/charts/line-chart';
import { StatCard } from '@/components/ui/stat-card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users } from 'lucide-react';

export function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', { range: 30 }],
    queryFn: () => fetch('/api/analytics?range=30').then((r) => r.json()),
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) return <div>Loading...</div>;

  const { stats, timeSeries, comparisons } = data;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={comparisons.revenue.change}
          icon={DollarSign}
        />
        <StatCard
          title="Orders"
          value={stats.totalOrders.toLocaleString()}
          change={comparisons.orders.change}
          icon={ShoppingCart}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
        />
      </div>

      {/* Revenue chart */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-4">Revenue Over Time</h3>
        <LineChart
          data={timeSeries}
          xAxisKey="period"
          lines={[{ dataKey: 'revenue', color: '#8884d8', name: 'Revenue' }]}
          height={300}
        />
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Query All Records

```typescript
// BAD - Loads all records into memory
const orders = await prisma.order.findMany();
const total = orders.reduce((sum, o) => sum + o.total, 0);

// GOOD - Use aggregate
const { _sum } = await prisma.order.aggregate({
  _sum: { total: true },
});
```

## Related Skills

- [charts](./charts.md)
- [data-cache](./data-cache.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Prisma aggregations
- Time-series queries
- Cached analytics
