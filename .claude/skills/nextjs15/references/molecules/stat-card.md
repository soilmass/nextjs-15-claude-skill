---
id: m-stat-card
name: Stat Card
version: 2.0.0
layer: L2
category: data
description: Metric display card with value, trend, and comparison
tags: [stats, metrics, kpi, dashboard, analytics]
formula: "StatCard = DisplayText(a-display-text) + DisplayIcon(a-display-icon) + DisplayBadge(a-display-badge)"
composes:
  - ../atoms/display-text.md
  - ../atoms/display-icon.md
  - ../atoms/display-badge.md
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Stat Card

## Overview

The Stat Card molecule displays key metrics with formatted values, trend indicators, and comparison data. Designed for dashboards and analytics views where quick metric scanning is important.

## When to Use

Use this skill when:
- Building analytics dashboards
- Displaying KPIs and metrics
- Showing financial summaries
- Creating admin panels with statistics

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          StatCard                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        Header                             │  │
│  │  ┌─────────────────────────────────┐  ┌───────────────┐   │  │
│  │  │          Title                  │  │     Icon      │   │  │
│  │  │      (a-display-text)           │  │  (a-display   │   │  │
│  │  │                                 │  │    -icon)     │   │  │
│  │  │      "Total Revenue"            │  │      💰       │   │  │
│  │  └─────────────────────────────────┘  └───────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        Value                              │  │
│  │                   (a-display-text)                        │  │
│  │                                                           │  │
│  │                      $45,231.89                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        Trend                              │  │
│  │  ┌───────────────┐  ┌─────────────────────────────────┐   │  │
│  │  │  Trend Badge  │  │       Comparison Text           │   │  │
│  │  │ (a-display-   │  │      (a-display-text)           │   │  │
│  │  │    badge)     │  │                                 │   │  │
│  │  │   ↑ +20.1%    │  │     from last month            │   │  │
│  │  └───────────────┘  └─────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Trend Variants:
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│  ↑ +20.1% (green) │  │  ↓ -5.2% (red)    │  │  → 0% (gray)      │
│     positive      │  │     negative      │  │     neutral       │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

## Atoms Used

- [display-text](../atoms/display-text.md) - Labels and values
- [display-icon](../atoms/display-icon.md) - Trend arrows
- [display-badge](../atoms/display-badge.md) - Change indicators

## Implementation

```typescript
// components/ui/stat-card.tsx
import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps {
  /** Metric title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Value prefix (e.g., "$") */
  prefix?: string;
  /** Value suffix (e.g., "%") */
  suffix?: string;
  /** Description or comparison text */
  description?: string;
  /** Change percentage */
  change?: number;
  /** Override trend direction */
  trend?: TrendDirection;
  /** Whether up is positive (default: true) */
  upIsGood?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  prefix,
  suffix,
  description,
  change,
  trend,
  upIsGood = true,
  icon,
  loading = false,
  onClick,
  className,
}: StatCardProps) {
  // Determine trend direction from change if not explicitly set
  const trendDirection: TrendDirection = trend ?? (
    change === undefined || change === 0 ? "neutral" :
    change > 0 ? "up" : "down"
  );

  // Determine if the trend is positive based on direction and upIsGood
  const isPositive = trendDirection === "neutral" ? null :
    (trendDirection === "up") === upIsGood;

  const TrendIcon = trendDirection === "up" ? TrendingUp :
    trendDirection === "down" ? TrendingDown : Minus;

  const trendColor = isPositive === null ? "text-muted-foreground" :
    isPositive ? "text-green-600 dark:text-green-400" :
    "text-red-600 dark:text-red-400";

  const formatChange = (val: number) => {
    const abs = Math.abs(val);
    const sign = val >= 0 ? "+" : "-";
    return `${sign}${abs.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix}
        </div>
        
        {(change !== undefined || description) && (
          <div className="flex items-center gap-2 mt-1">
            {change !== undefined && (
              <span className={cn("flex items-center text-xs font-medium", trendColor)}>
                <TrendIcon className="h-3 w-3 mr-0.5" />
                {formatChange(change)}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

```typescript
// components/ui/stat-card-compact.tsx
import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardCompactProps {
  title: string;
  value: string | number;
  change?: number;
  upIsGood?: boolean;
  className?: string;
}

export function StatCardCompact({
  title,
  value,
  change,
  upIsGood = true,
  className,
}: StatCardCompactProps) {
  const isPositive = change !== undefined && change !== 0
    ? (change > 0) === upIsGood
    : null;

  return (
    <div className={cn("flex items-center justify-between p-3 rounded-lg bg-muted/50", className)}>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      {change !== undefined && (
        <div className={cn(
          "flex items-center text-xs font-medium",
          isPositive === null ? "text-muted-foreground" :
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {change > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> :
           change < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null}
          {change >= 0 ? "+" : ""}{change}%
        </div>
      )}
    </div>
  );
}
```

```typescript
// components/ui/stat-grid.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { StatCard } from "./stat-card";

interface Stat {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change?: number;
  description?: string;
  icon?: React.ReactNode;
}

interface StatGridProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
}

export function StatGrid({
  stats,
  columns = 4,
  loading = false,
  className,
}: StatGridProps) {
  const columnStyles = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnStyles[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} loading={loading} />
      ))}
    </div>
  );
}
```

### Key Implementation Notes

1. **Trend Logic**: `upIsGood` controls whether positive change shows green (revenue) or red (churn)
2. **Number Formatting**: Uses `toLocaleString()` for thousand separators

## Variants

### Basic

```tsx
<StatCard
  title="Total Revenue"
  value={45231}
  prefix="$"
/>
```

### With Trend

```tsx
<StatCard
  title="Revenue"
  value={45231}
  prefix="$"
  change={12.5}
  description="vs last month"
/>
```

### Negative is Good

```tsx
<StatCard
  title="Churn Rate"
  value={2.4}
  suffix="%"
  change={-0.8}
  upIsGood={false}
  description="vs last month"
/>
```

### With Icon

```tsx
<StatCard
  title="Active Users"
  value={2350}
  change={5.2}
  icon={<Users className="h-4 w-4" />}
/>
```

### Compact Variant

```tsx
<StatCardCompact
  title="Orders"
  value="1,234"
  change={8.2}
/>
```

### Grid Layout

```tsx
<StatGrid
  columns={4}
  stats={[
    { title: "Revenue", value: 45231, prefix: "$", change: 12.5 },
    { title: "Users", value: 2350, change: 5.2 },
    { title: "Orders", value: 1234, change: -2.3 },
    { title: "Conversion", value: 3.2, suffix: "%", change: 0.5 },
  ]}
/>
```

### Loading State

```tsx
<StatCard
  title="Revenue"
  value={0}
  loading
/>
```

## States

| State | Value | Trend | Icon | Skeleton |
|-------|-------|-------|------|----------|
| Default | shown | shown | shown | hidden |
| Loading | hidden | hidden | hidden | shown |
| Positive Trend | shown | green up | - | - |
| Negative Trend | shown | red down | - | - |
| Neutral | shown | gray dash | - | - |
| Clickable | shown | shown | shown | - |

## Accessibility

### Required ARIA Attributes

- Card acts as a region with title
- Trend icons have appropriate labels
- Values are announced with context

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus clickable card |
| `Enter/Space` | Activate clickable card |

### Screen Reader Announcements

- "Revenue: $45,231, up 12.5% versus last month"
- Trend direction is announced
- Change percentage is included

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install lucide-react
```

## Examples

### Dashboard Overview

```tsx
import { StatGrid } from "@/components/ui/stat-grid";
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";

export function DashboardStats({ data }) {
  return (
    <StatGrid
      columns={4}
      stats={[
        {
          title: "Total Revenue",
          value: data.revenue,
          prefix: "$",
          change: data.revenueChange,
          description: "vs last month",
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          title: "Active Users",
          value: data.users,
          change: data.usersChange,
          description: "vs last month",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Orders",
          value: data.orders,
          change: data.ordersChange,
          description: "vs last month",
          icon: <ShoppingCart className="h-4 w-4" />,
        },
        {
          title: "Conversion Rate",
          value: data.conversion,
          suffix: "%",
          change: data.conversionChange,
          description: "vs last month",
          icon: <TrendingUp className="h-4 w-4" />,
        },
      ]}
    />
  );
}
```

### Financial Summary

```tsx
import { StatCard } from "@/components/ui/stat-card";

export function FinancialSummary({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Gross Revenue"
        value={data.gross}
        prefix="$"
        change={data.grossChange}
      />
      <StatCard
        title="Net Profit"
        value={data.net}
        prefix="$"
        change={data.netChange}
      />
      <StatCard
        title="Expenses"
        value={data.expenses}
        prefix="$"
        change={data.expensesChange}
        upIsGood={false}
      />
    </div>
  );
}
```

### With Navigation

```tsx
import { StatCard } from "@/components/ui/stat-card";
import { useRouter } from "next/navigation";

export function NavigableStats() {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatCard
        title="Pending Orders"
        value={12}
        description="Needs attention"
        onClick={() => router.push("/orders?status=pending")}
      />
      <StatCard
        title="Support Tickets"
        value={5}
        description="Open tickets"
        onClick={() => router.push("/support")}
      />
    </div>
  );
}
```

### Real-time Updates

```tsx
import { StatCard } from "@/components/ui/stat-card";
import { useLiveData } from "@/hooks/use-live-data";

export function LiveStats() {
  const { data, loading } = useLiveData("/api/stats");

  return (
    <StatCard
      title="Active Sessions"
      value={data?.sessions ?? 0}
      loading={loading}
      description="Real-time"
    />
  );
}
```

## Anti-patterns

### No Context for Numbers

```tsx
// Bad - number without context
<StatCard title="Revenue" value={45231} />

// Good - with currency and comparison
<StatCard
  title="Revenue"
  value={45231}
  prefix="$"
  change={12.5}
  description="vs last month"
/>
```

### Confusing Trend Colors

```tsx
// Bad - expenses going up shown as green
<StatCard
  title="Expenses"
  value={12000}
  change={15}
  upIsGood={true} // Wrong!
/>

// Good - expenses going up shown as red
<StatCard
  title="Expenses"
  value={12000}
  change={15}
  upIsGood={false}
/>
```

### Too Many Decimals

```tsx
// Bad - too precise
<StatCard title="Conversion" value={3.14159265} suffix="%" />

// Good - reasonable precision
<StatCard title="Conversion" value={3.14} suffix="%" />
```

## Related Skills

### Composes From
- [molecules/card](./card.md) - Base card component
- [atoms/display-text](../atoms/display-text.md) - Values and labels
- [atoms/display-icon](../atoms/display-icon.md) - Trend icons

### Composes Into
- [templates/dashboard](../templates/dashboard.md) - Dashboard pages
- [organisms/analytics](../organisms/analytics.md) - Analytics sections

### Alternatives
- [molecules/card](./card.md) - For non-metric content
- Charts - For trend visualization over time

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with trend indicators
- StatCardCompact variant
- StatGrid for layout
- Loading state support
