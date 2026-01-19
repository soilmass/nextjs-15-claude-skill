---
id: o-stats
name: Stats
version: 1.0.0
layer: L3
category: data
description: Statistics display with cards showing key metrics and trends
tags: [stats, metrics, kpi, dashboard, analytics, numbers]
formula: "Stats = StatCard(m-stat-card)[] + Icon(a-icon) + Badge(a-badge) + Skeleton(a-skeleton)"
composes:
  - ../molecules/stat-card.md
  - ../atoms/display-icon.md
  - ../atoms/display-badge.md
  - ../atoms/display-skeleton.md
dependencies: ["lucide-react", "framer-motion"]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Stats

## Overview

The Stats organism displays a collection of key metrics and KPIs in card format with support for trends, comparisons, icons, and loading states. Ideal for dashboard headers and analytics summaries.

## When to Use

Use this skill when:
- Building dashboard overview sections
- Displaying key performance indicators
- Showing metrics with comparisons
- Creating analytics summaries

## Composition Diagram

```
+---------------------------------------------------------------------+
|                          Stats (L3)                                  |
+---------------------------------------------------------------------+
|  +---------------+ +---------------+ +---------------+ +----------+ |
|  | StatCard(m)   | | StatCard(m)   | | StatCard(m)   | | StatCard | |
|  |               | |               | |               | |          | |
|  | [Icon]        | | [Icon]        | | [Icon]        | | [Icon]   | |
|  | Total Users   | | Revenue       | | Orders        | | Growth   | |
|  | 12,345        | | $45,678       | | 892           | | 23.5%    | |
|  | +12% Badge(a) | | -5% Badge(a)  | | +8% Badge(a)  | | +2.3%    | |
|  +---------------+ +---------------+ +---------------+ +----------+ |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/stats.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  format?: 'number' | 'currency' | 'percentage';
  href?: string;
}

interface StatsProps {
  stats: Stat[];
  columns?: 2 | 3 | 4 | 5;
  loading?: boolean;
  animated?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

function formatValue(value: string | number, format?: string): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}

function TrendIndicator({ change }: { change: number }) {
  if (change === 0) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span className="text-xs">0%</span>
      </span>
    );
  }

  const isPositive = change > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'flex items-center gap-1',
        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">
        {isPositive ? '+' : ''}{change}%
      </span>
    </span>
  );
}

function StatCard({
  stat,
  variant,
  animated,
  index,
}: {
  stat: Stat;
  variant: StatsProps['variant'];
  animated?: boolean;
  index: number;
}) {
  const Icon = stat.icon;
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  const content = (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-colors',
        'hover:border-primary/50 hover:shadow-sm',
        isCompact && 'p-3',
        isDetailed && 'p-6'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {Icon && (
            <div
              className={cn(
                'mb-2 inline-flex items-center justify-center rounded-lg p-2',
                stat.iconColor || 'bg-primary/10 text-primary'
              )}
            >
              <Icon className={cn('h-4 w-4', isDetailed && 'h-5 w-5')} />
            </div>
          )}
          <p
            className={cn(
              'text-sm text-muted-foreground',
              isCompact && 'text-xs'
            )}
          >
            {stat.label}
          </p>
          <p
            className={cn(
              'mt-1 text-2xl font-bold tracking-tight',
              isCompact && 'text-xl',
              isDetailed && 'text-3xl'
            )}
          >
            {formatValue(stat.value, stat.format)}
          </p>

          {stat.change !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <TrendIndicator change={stat.change} />
              {stat.changeLabel && (
                <span className="text-xs text-muted-foreground">
                  {stat.changeLabel}
                </span>
              )}
            </div>
          )}

          {isDetailed && stat.previousValue !== undefined && (
            <p className="mt-1 text-xs text-muted-foreground">
              Previous: {formatValue(stat.previousValue, stat.format)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {stat.href ? (
          <a href={stat.href} className="block">
            {content}
          </a>
        ) : (
          content
        )}
      </motion.div>
    );
  }

  return stat.href ? (
    <a href={stat.href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}

function StatSkeleton({ variant }: { variant: StatsProps['variant'] }) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4',
        isCompact && 'p-3',
        isDetailed && 'p-6'
      )}
    >
      <div className="space-y-3">
        <div
          className={cn(
            'h-8 w-8 rounded-lg bg-muted animate-pulse',
            isDetailed && 'h-10 w-10'
          )}
        />
        <div
          className={cn(
            'h-4 w-24 rounded bg-muted animate-pulse',
            isCompact && 'h-3 w-20'
          )}
        />
        <div
          className={cn(
            'h-8 w-32 rounded bg-muted animate-pulse',
            isCompact && 'h-6 w-28',
            isDetailed && 'h-10 w-36'
          )}
        />
        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function Stats({
  stats,
  columns = 4,
  loading = false,
  animated = true,
  variant = 'default',
  className,
}: StatsProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {loading
        ? Array.from({ length: columns }).map((_, i) => (
            <StatSkeleton key={i} variant={variant} />
          ))
        : stats.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              variant={variant}
              animated={animated}
              index={index}
            />
          ))}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { Stats } from '@/components/organisms/stats';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const stats = [
  {
    id: 'users',
    label: 'Total Users',
    value: 12345,
    change: 12.5,
    changeLabel: 'vs last month',
    icon: Users,
    format: 'number',
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: 45678,
    change: -5.2,
    changeLabel: 'vs last month',
    icon: DollarSign,
    iconColor: 'bg-green-100 text-green-600',
    format: 'currency',
  },
  {
    id: 'orders',
    label: 'Orders',
    value: 892,
    change: 8.1,
    icon: ShoppingCart,
    format: 'number',
  },
  {
    id: 'growth',
    label: 'Growth Rate',
    value: 23.5,
    change: 2.3,
    icon: TrendingUp,
    format: 'percentage',
  },
];

export function Dashboard() {
  return <Stats stats={stats} columns={4} />;
}
```

### Compact Variant

```tsx
<Stats stats={stats} variant="compact" columns={5} />
```

### With Loading State

```tsx
<Stats stats={stats} loading={isLoading} columns={4} />
```

## Accessibility

- Stats are readable by screen readers
- Trend indicators have text alternatives
- Links are keyboard accessible

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Loading | Stats are being fetched | Skeleton placeholders with pulse |
| Default | Stats displayed normally | Full stat cards with values |
| Animated | Stats animating into view | Fade/slide animation on mount |
| Hover | Card is being hovered | Border highlight, subtle shadow |
| Trend Up | Positive change percentage | Green text with up arrow icon |
| Trend Down | Negative change percentage | Red text with down arrow icon |
| Trend Neutral | No change in value | Gray text with minus icon |

## Anti-patterns

### 1. Not using animation delay for staggered effect

```tsx
// Bad: All cards animate at once
{stats.map((stat) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <StatCard stat={stat} />
  </motion.div>
))}

// Good: Stagger animations by index
{stats.map((stat, index) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <StatCard stat={stat} />
  </motion.div>
))}
```

### 2. Inconsistent number formatting

```tsx
// Bad: Mixing formatted and unformatted numbers
const stats = [
  { value: '12,345', format: undefined },  // Pre-formatted string
  { value: 45678, format: 'number' },      // Number to format
];

// Good: Use consistent data types and let the component format
const stats = [
  { value: 12345, format: 'number' },
  { value: 45678, format: 'number' },
];
```

### 3. Missing change context

```tsx
// Bad: Shows change percentage without context
<TrendIndicator change={12.5} />
// User doesn't know: 12.5% of what? Compared to when?

// Good: Include change label for context
<TrendIndicator change={12.5} />
<span className="text-muted-foreground">vs last month</span>

// Or use the changeLabel prop
const stat = {
  change: 12.5,
  changeLabel: 'vs previous quarter',
};
```

### 4. Not respecting reduced motion preference

```tsx
// Bad: Always animate regardless of user preference
<motion.div
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <StatCard />
</motion.div>

// Good: Respect reduced motion preference
const prefersReducedMotion = usePrefersReducedMotion();

<motion.div
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.3
  }}
>
  <StatCard />
</motion.div>

// Or use the animated prop
<Stats stats={stats} animated={!prefersReducedMotion} />
```

## Related Skills

- [organisms/stats-dashboard](./stats-dashboard.md)
- [molecules/stat-card](../molecules/stat-card.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multiple variants (default, compact, detailed)
- Trend indicators
- Loading skeleton state
