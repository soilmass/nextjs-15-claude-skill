---
id: o-stats-dashboard
name: Stats Dashboard
version: 2.0.0
layer: L3
category: data
composes:
  - ../molecules/stat-card.md
description: Grid of stat cards with trends, sparklines, and responsive layout
tags: [stats, dashboard, metrics, kpi, analytics]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "StatsDashboard = StatCard(m-stat-card) + Chart(m-chart) + Icon(a-icon)"
dependencies:
  - react
  - lucide-react
  - recharts
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Stats Dashboard

## Overview

A stats dashboard organism displaying key metrics in a responsive grid layout. Includes stat cards with trends, sparkline charts, percentage changes, and loading states.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ StatsDashboard                                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ StatCard        │  │ StatCard        │  │ StatCard    │  │
│  │ (m-stat-card)   │  │ (m-stat-card)   │  │ (m-stat-card│  │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────┐ │  │
│  │ │Icon (a-icon)│ │  │ │Icon (a-icon)│ │  │ │Icon     │ │  │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ │(a-icon) │ │  │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ └─────────┘ │  │
│  │ │Chart        │ │  │ │Chart        │ │  │ ┌─────────┐ │  │
│  │ │(m-chart)    │ │  │ │(m-chart)    │ │  │ │Chart    │ │  │
│  │ │ [sparkline] │ │  │ │ [sparkline] │ │  │ │(m-chart)│ │  │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────┘ │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                             │
│  ┌─────────────────┐                                        │
│  │ StatCard        │  (responsive grid: 2-5 columns)        │
│  │ (m-stat-card)   │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/stats-dashboard.tsx
'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

// Types
interface StatData {
  value: number;
  timestamp: Date;
}

interface Stat {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage' | 'compact';
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  color?: string;
  sparklineData?: StatData[];
  href?: string;
}

interface StatsDashboardProps {
  stats: Stat[];
  columns?: 2 | 3 | 4 | 5;
  loading?: boolean;
  showSparklines?: boolean;
  onStatClick?: (stat: Stat) => void;
}

// Format value based on format type
function formatValue(
  value: number | string,
  format?: Stat['format'],
  prefix?: string,
  suffix?: string
): string {
  if (typeof value === 'string') return `${prefix || ''}${value}${suffix || ''}`;

  let formatted: string;

  switch (format) {
    case 'currency':
      formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
      break;
    case 'percentage':
      formatted = `${value.toFixed(1)}%`;
      break;
    case 'compact':
      formatted = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
      break;
    default:
      formatted = new Intl.NumberFormat('en-US').format(value);
  }

  return `${prefix || ''}${formatted}${suffix || ''}`;
}

// Calculate change percentage
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Sparkline Component
function Sparkline({
  data,
  color = 'hsl(var(--primary))',
  trend,
}: {
  data: StatData[];
  color?: string;
  trend?: 'increase' | 'decrease' | 'neutral';
}) {
  const chartColor = trend === 'decrease' ? 'hsl(var(--destructive))' : color;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={chartColor}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Trend Indicator
function TrendIndicator({
  change,
  changeType,
}: {
  change: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}) {
  const type = changeType || (change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral');

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm font-medium',
        type === 'increase' && 'text-green-600',
        type === 'decrease' && 'text-red-600',
        type === 'neutral' && 'text-muted-foreground'
      )}
    >
      {type === 'increase' && <ArrowUpRight className="h-4 w-4" />}
      {type === 'decrease' && <ArrowDownRight className="h-4 w-4" />}
      {type === 'neutral' && <Minus className="h-4 w-4" />}
      <span>{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
}

// Single Stat Card
function StatCard({
  stat,
  showSparkline,
  onClick,
}: {
  stat: Stat;
  showSparkline: boolean;
  onClick?: () => void;
}) {
  const change = stat.change ?? 
    (stat.previousValue !== undefined && typeof stat.value === 'number'
      ? calculateChange(stat.value, stat.previousValue)
      : undefined);

  const changeType = stat.changeType ?? 
    (change !== undefined
      ? change > 0
        ? 'increase'
        : change < 0
        ? 'decrease'
        : 'neutral'
      : undefined);

  const content = (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-6 transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/50'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {stat.icon && (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                stat.color || 'bg-primary/10 text-primary'
              )}
            >
              {stat.icon}
            </div>
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </span>
        </div>
        
        {onClick && (
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight">
          {formatValue(stat.value, stat.format, stat.prefix, stat.suffix)}
        </p>
      </div>

      {/* Change Indicator */}
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <TrendIndicator change={change} changeType={changeType} />
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}

      {/* Sparkline */}
      {showSparkline && stat.sparklineData && stat.sparklineData.length > 0 && (
        <div className="mt-4 -mx-2">
          <Sparkline
            data={stat.sparklineData}
            color={stat.color}
            trend={changeType}
          />
        </div>
      )}
    </div>
  );

  if (stat.href) {
    return <a href={stat.href}>{content}</a>;
  }

  return content;
}

// Loading Skeleton
function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="mt-4">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

// Grid configuration
const gridCols = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};

// Main Stats Dashboard
export function StatsDashboard({
  stats,
  columns = 4,
  loading = false,
  showSparklines = true,
  onStatClick,
}: StatsDashboardProps) {
  if (loading) {
    return (
      <div className={cn('grid gap-4', gridCols[columns])}>
        {Array.from({ length: columns }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('grid gap-4', gridCols[columns])}
      role="region"
      aria-label="Statistics dashboard"
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          stat={stat}
          showSparkline={showSparklines}
          onClick={onStatClick ? () => onStatClick(stat) : undefined}
        />
      ))}
    </div>
  );
}

// Pre-built stat configurations
export function createStat(
  id: string,
  label: string,
  value: number,
  options?: Partial<Omit<Stat, 'id' | 'label' | 'value'>>
): Stat {
  return {
    id,
    label,
    value,
    ...options,
  };
}

// Example stats for demo
export const exampleStats: Stat[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: 45231.89,
    previousValue: 42500,
    format: 'currency',
    icon: <span className="text-lg">$</span>,
    color: 'bg-green-100 text-green-600',
    sparklineData: [
      { value: 40000, timestamp: new Date() },
      { value: 41000, timestamp: new Date() },
      { value: 39000, timestamp: new Date() },
      { value: 43000, timestamp: new Date() },
      { value: 45231, timestamp: new Date() },
    ],
  },
  {
    id: 'users',
    label: 'Active Users',
    value: 2350,
    previousValue: 2100,
    format: 'compact',
    icon: <span className="text-lg">👥</span>,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'orders',
    label: 'Orders',
    value: 12543,
    change: -4.5,
    changeType: 'decrease',
    format: 'number',
    icon: <span className="text-lg">📦</span>,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: 3.24,
    previousValue: 2.89,
    format: 'percentage',
    icon: <span className="text-lg">📈</span>,
    color: 'bg-purple-100 text-purple-600',
  },
];
```

## Usage

### Basic Usage

```tsx
import { StatsDashboard, exampleStats } from '@/components/organisms/stats-dashboard';

export function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <StatsDashboard stats={exampleStats} />
    </div>
  );
}
```

### Custom Stats

```tsx
import { StatsDashboard, createStat } from '@/components/organisms/stats-dashboard';
import { DollarSign, Users, ShoppingCart } from 'lucide-react';

const myStats = [
  createStat('revenue', 'Revenue', 125000, {
    format: 'currency',
    previousValue: 110000,
    icon: <DollarSign className="h-5 w-5" />,
  }),
  createStat('customers', 'Customers', 1234, {
    format: 'compact',
    change: 12.5,
    icon: <Users className="h-5 w-5" />,
  }),
];

<StatsDashboard stats={myStats} columns={2} />
```

### With Loading State

```tsx
<StatsDashboard
  stats={stats}
  loading={isLoading}
  columns={4}
/>
```

### Without Sparklines

```tsx
<StatsDashboard
  stats={stats}
  showSparklines={false}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Loading | Dashboard is fetching data | Skeleton cards with pulse animation |
| Empty | No stats data available | Empty state message or placeholder |
| Loaded | Stats data successfully loaded | Full stat cards with values |
| Error | Failed to load stats | Error message with retry option |
| Refreshing | Updating data in background | Subtle loading indicator overlay |
| Hover | Card is being hovered | Elevated shadow, border highlight |
| Interactive | Cards are clickable | Cursor pointer, hover effects enabled |

## Anti-patterns

### 1. Not providing loading state

```tsx
// Bad: No loading state causes layout shift
function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  if (!stats) return null; // Content jumps when loaded

  return <StatsDashboard stats={stats} />;
}

// Good: Use loading prop for smooth experience
function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return <StatsDashboard stats={stats} loading={loading} />;
}
```

### 2. Hardcoding currency format

```tsx
// Bad: Hardcoded USD format
const stat = {
  value: 45231,
  format: 'currency', // Always formats as USD
};

// Good: Allow configurable currency
const stat = {
  value: 45231,
  format: 'currency',
  currency: 'EUR', // User's currency preference
  locale: 'de-DE',
};

// Or use prefix for flexibility
const stat = {
  value: 45231,
  format: 'number',
  prefix: '€',
};
```

### 3. Not handling sparkline data edge cases

```tsx
// Bad: Crashes with empty sparkline data
<Sparkline data={stat.sparklineData} />

// Good: Guard against empty or invalid data
{stat.sparklineData && stat.sparklineData.length > 1 && (
  <Sparkline
    data={stat.sparklineData}
    trend={changeType}
  />
)}
```

### 4. Missing accessibility on interactive cards

```tsx
// Bad: Clickable card without proper semantics
<div onClick={() => onStatClick(stat)}>
  <StatCard stat={stat} />
</div>

// Good: Use button role and keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={() => onStatClick(stat)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStatClick(stat);
    }
  }}
  aria-label={`${stat.label}: ${stat.value}. Click for details.`}
>
  <StatCard stat={stat} />
</div>
```

## Related Skills

- `molecules/stat-card` - Single stat card
- `patterns/data-fetching` - Data fetching
- `templates/dashboard-page` - Full dashboard

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Responsive grid layout
- Sparkline charts with Recharts
- Trend indicators
- Multiple format options
- Loading skeletons
