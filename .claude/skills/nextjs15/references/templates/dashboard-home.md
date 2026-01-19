---
id: t-dashboard-home
name: Dashboard Home
version: 2.0.0
layer: L4
category: pages
description: Dashboard overview page with stats, charts, and recent activity
tags: [page, dashboard, analytics, stats, overview, metrics]
formula: "DashboardHome = StatsDashboard(o-stats-dashboard) + Chart(o-chart) + ActivityFeed(o-activity-feed) + StatCard(m-stat-card)"
composes:
  - ../organisms/stats-dashboard.md
  - ../organisms/chart.md
  - ../organisms/activity-feed.md
  - ../molecules/stat-card.md
dependencies: [recharts]
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Dashboard Home

## Overview

The Dashboard Home template provides an overview page for authenticated users. Features key metrics, charts, recent activity, and quick actions. Designed as the default landing page for dashboard applications.

## When to Use

Use this skill when:
- Building dashboard home pages
- Creating admin overviews
- Building analytics dashboards
- Creating user portals

## Composition Diagram

```
+------------------------------------------------------------------+
|                       DashboardHome                               |
+------------------------------------------------------------------+
|  Welcome Header                                                   |
|  "Welcome back, {name}" - Here's what's happening today          |
+------------------------------------------------------------------+
|  o StatsDashboard                                                 |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|  | m StatCard  | | m StatCard  | | m StatCard  | | m StatCard  |  |
|  | $ Revenue   | | Users       | | Orders      | | Conversion  |  |
|  | $45,231     | | 2,350       | | 12,234      | | 3.2%        |  |
|  | +20.1%      | | +180        | | +19%        | | +0.5%       |  |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
+------------------------------------------------------------------+
|  +---------------------------------------+  +------------------+  |
|  |  o Chart (Area)                       |  |  Recent Sales    |  |
|  |  +--------------------------------+   |  |  +------------+  |  |
|  |  |          Overview               |  |  |  | User 1     |  |  |
|  |  |     /\      Revenue             |  |  |  | $1,999     |  |  |
|  |  |    /  \    /\                   |  |  |  +------------+  |  |
|  |  |   /    \  /  \   Expenses       |  |  |  | User 2     |  |  |
|  |  |  /      \/    \_______          |  |  |  | $39.00     |  |  |
|  |  | Jan Feb Mar Apr May Jun         |  |  |  +------------+  |  |
|  |  +--------------------------------+   |  +------------------+  |
|  +---------------------------------------+                        |
+------------------------------------------------------------------+
|  +--------------------------+  +-------------------------------+  |
|  | o ActivityFeed           |  |  Quick Actions                |  |
|  | +----------------------+ |  |  +----------+ +----------+    |  |
|  | | Timeline Event 1     | |  |  | New Proj | | Upload   |    |  |
|  | | Timeline Event 2     | |  |  +----------+ +----------+    |  |
|  | | Timeline Event 3     | |  |  +----------+ +----------+    |  |
|  | +----------------------+ |  |  | Export   | | Invite   |    |  |
|  | [View all]               |  |  +----------+ +----------+    |  |
|  +--------------------------+  +-------------------------------+  |
+------------------------------------------------------------------+
```

## Organisms Used

- [chart](../organisms/chart.md) - Data visualization
- [data-table](../organisms/data-table.md) - Recent items
- [timeline](../organisms/timeline.md) - Activity feed
- [card](../molecules/card.md) - Stat cards

## Implementation

```typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getDashboardStats, getRecentActivity, getChartData } from "@/lib/dashboard";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session?.user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Suspense fallback={<ChartLoading className="lg:col-span-4" />}>
          <DashboardCharts />
        </Suspense>

        <Suspense fallback={<ChartLoading className="lg:col-span-3" />}>
          <RecentSales />
        </Suspense>
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<ActivityLoading />}>
          <RecentActivity />
        </Suspense>

        <QuickActions />
      </div>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartLoading({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

function ActivityLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Dashboard Stats Component

```typescript
// components/dashboard/dashboard-stats.tsx
import { getDashboardStats } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export async function DashboardStats() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: DollarSign,
    },
    {
      title: "Active Users",
      value: stats.users.toLocaleString(),
      change: stats.usersChange,
      icon: Users,
    },
    {
      title: "Orders",
      value: stats.orders.toLocaleString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      change: stats.conversionChange,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center text-xs mt-1">
              {card.change >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={cn(
                  card.change >= 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {Math.abs(card.change)}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Dashboard Charts Component

```typescript
// components/dashboard/dashboard-charts.tsx
import { getChartData } from "@/lib/dashboard";
import { Chart } from "@/components/organisms/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function DashboardCharts() {
  const data = await getChartData();

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Your performance over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart
          type="area"
          data={data}
          config={{
            revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
            expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
          }}
          xAxisKey="month"
          height={350}
          stacked={false}
          gradient
        />
      </CardContent>
    </Card>
  );
}
```

### Recent Activity Component

```typescript
// components/dashboard/recent-activity.tsx
import { getRecentActivity } from "@/lib/dashboard";
import { Timeline } from "@/components/organisms/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function RecentActivity() {
  const activity = await getRecentActivity();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/activity">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Timeline
          events={activity}
          compact
          relativeTime
          showConnector
          animate={false}
        />
      </CardContent>
    </Card>
  );
}
```

### Quick Actions Component

```typescript
// components/dashboard/quick-actions.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Settings, Users, FileText } from "lucide-react";
import Link from "next/link";

const actions = [
  { label: "New Project", href: "/dashboard/projects/new", icon: Plus },
  { label: "Upload File", href: "/dashboard/files/upload", icon: Upload },
  { label: "Export Data", href: "/dashboard/export", icon: Download },
  { label: "Invite Team", href: "/dashboard/team/invite", icon: Users },
  { label: "Create Report", href: "/dashboard/reports/new", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Key Implementation Notes

1. **Streaming**: Each section loads independently
2. **Suspense**: Loading states per section
3. **Data Fetching**: Parallel data loading
4. **Real-time Ready**: Structure supports live updates
5. **Responsive Grid**: Adapts to screen size

## Variants

### Minimal Dashboard

```tsx
<div className="space-y-6">
  <DashboardStats />
  <Card>
    <CardHeader>
      <CardTitle>Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <Chart type="line" data={data} />
    </CardContent>
  </Card>
</div>
```

### Analytics Heavy

```tsx
<div className="space-y-6">
  <DashboardStats />
  
  <div className="grid gap-6 md:grid-cols-2">
    <Chart type="area" title="Revenue" />
    <Chart type="bar" title="Orders by Category" />
    <Chart type="line" title="User Growth" />
    <Chart type="donut" title="Traffic Sources" />
  </div>
  
  <DataTable
    title="Recent Transactions"
    data={transactions}
    columns={transactionColumns}
  />
</div>
```

## Performance

### Data Loading

- Parallel data fetching
- Streaming with Suspense
- Cache stats with ISR

### Charts

- Lazy load chart library
- Static data at build time
- Client-side updates

## Accessibility

### Required Features

- Chart data in accessible format
- Stat changes announced
- Timeline navigable
- Quick actions keyboard accessible

### Screen Reader

- Stats read with context
- Chart data available as table
- Trend changes announced

## Error States

### Dashboard Error Boundary

```tsx
// app/(dashboard)/dashboard/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Something went wrong loading your dashboard
        </p>
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'We encountered an error loading your dashboard data.'}
          </p>
          <div className="flex gap-3">
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Stats Error State

```tsx
// components/dashboard/stats-error.tsx
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function StatsError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-destructive/30">
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive/60 mb-2" />
            <p className="text-xs text-muted-foreground">Failed to load</p>
          </CardContent>
        </Card>
      ))}
      {onRetry && (
        <div className="col-span-full flex justify-center mt-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Chart Error State

```tsx
// components/dashboard/chart-error.tsx
import { BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ChartError({
  title,
  onRetry,
  className,
}: {
  title?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title || 'Chart'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          Unable to load chart data
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

## Mobile Responsiveness

### Responsive Dashboard Layout

```tsx
// components/dashboard/responsive-dashboard.tsx
export function ResponsiveDashboard() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Header - responsive text */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here's what's happening today.
        </p>
      </div>

      {/* Stats - responsive grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts - stack on mobile */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <Chart height={250} className="sm:h-[350px]" />
        </Card>
        <Card className="lg:col-span-3">
          <RecentSales limit={5} />
        </Card>
      </div>

      {/* Activity and Actions - stack on mobile */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
```

### Mobile-Optimized Stat Card

```tsx
// components/dashboard/mobile-stat-card.tsx
export function MobileStatCard({
  title,
  value,
  change,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          {title}
        </CardTitle>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-lg sm:text-2xl font-bold truncate">{value}</div>
        <div className="flex items-center text-[10px] sm:text-xs mt-1">
          {change >= 0 ? (
            <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 mr-0.5" />
          ) : (
            <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500 mr-0.5" />
          )}
          <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground ml-1 hidden sm:inline">
            from last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Responsive Quick Actions

```tsx
// components/dashboard/responsive-quick-actions.tsx
export function ResponsiveQuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 2 columns on mobile, 3 on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col gap-1 sm:gap-2"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Stats grid | 2 columns | 2 columns | 4 columns |
| Chart height | 250px | 300px | 350px |
| Charts layout | Stacked | Stacked | Side by side |
| Activity/Actions | Stacked | Side by side | Side by side |
| Quick Actions | 2 columns | 3 columns | 3 columns |

## SEO Considerations

### Metadata Configuration

```tsx
// app/(dashboard)/dashboard/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | MyApp',
  description: 'View your dashboard overview with key metrics and recent activity',
  robots: {
    index: false,
    follow: false,
  },
};
```

### Dynamic Page Title

```tsx
// app/(dashboard)/dashboard/page.tsx
import { Metadata } from 'next';
import { getSession } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession();
  const name = session?.user.name || 'User';

  return {
    title: `${name}'s Dashboard | MyApp`,
    robots: { index: false, follow: false },
  };
}
```

### Prevent Dashboard Indexing

```tsx
// app/(dashboard)/layout.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};
```

## Testing Strategies

### Component Testing

```tsx
// __tests__/dashboard-home.test.tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardPage from '@/app/(dashboard)/dashboard/page';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';

// Mock auth
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({ user: { name: 'John Doe' } }),
}));

// Mock data fetching
vi.mock('@/lib/dashboard', () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    revenue: 45231,
    revenueChange: 20.1,
    users: 2350,
    usersChange: 10.5,
    orders: 12234,
    ordersChange: 19,
    conversionRate: 3.2,
    conversionChange: 0.5,
  }),
}));

describe('DashboardPage', () => {
  it('renders welcome message with user name', async () => {
    render(await DashboardPage());
    expect(screen.getByText(/Welcome back, John/)).toBeInTheDocument();
  });
});

describe('DashboardStats', () => {
  it('renders all stat cards', async () => {
    render(await DashboardStats());
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('displays formatted values', async () => {
    render(await DashboardStats());
    expect(screen.getByText('$45,231')).toBeInTheDocument();
    expect(screen.getByText('2,350')).toBeInTheDocument();
  });

  it('shows positive trend indicators', async () => {
    render(await DashboardStats());
    const trends = screen.getAllByText(/20\.1%/);
    expect(trends.length).toBeGreaterThan(0);
  });
});
```

### E2E Testing

```tsx
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Home', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('displays welcome message', async ({ page }) => {
    await expect(page.getByText(/Welcome back/)).toBeVisible();
  });

  test('shows stat cards with data', async ({ page }) => {
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Orders')).toBeVisible();
  });

  test('charts load successfully', async ({ page }) => {
    await expect(page.locator('[data-testid="overview-chart"]')).toBeVisible();
  });

  test('quick actions are clickable', async ({ page }) => {
    await page.click('text=New Project');
    await expect(page).toHaveURL('/dashboard/projects/new');
  });

  test('activity feed shows recent items', async ({ page }) => {
    await expect(page.getByText('Recent Activity')).toBeVisible();
    await expect(page.locator('[data-testid="activity-item"]').first()).toBeVisible();
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Stats should be 2 columns
    const statsGrid = page.locator('[data-testid="stats-grid"]');
    await expect(statsGrid).toHaveCSS('grid-template-columns', /repeat\(2/);
  });
});
```

### Accessibility Testing

```tsx
// __tests__/dashboard-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

expect.extend(toHaveNoViolations);

describe('Dashboard Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(await DashboardPage());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading hierarchy', async () => {
    const { container } = render(await DashboardPage());
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toContain('Welcome');
  });

  it('stat cards are accessible', async () => {
    const { getAllByRole } = render(await DashboardPage());
    const cards = getAllByRole('article') || getAllByRole('region');
    expect(cards.length).toBeGreaterThan(0);
  });
});
```

## Related Skills

### Uses Layout
- [dashboard-layout](./dashboard-layout.md)

### Related Pages
- [settings-page](./settings-page.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Stats cards with trends
- Revenue charts
- Activity timeline
- Quick actions grid
