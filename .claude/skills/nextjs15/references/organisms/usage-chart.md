---
id: o-usage-chart
name: Usage Chart
version: 1.0.0
layer: L3
category: data
description: Usage/metrics chart display with multiple chart types and time range selection
tags: [chart, usage, metrics, analytics, visualization, graphs]
formula: "UsageChart = Chart(o-chart) + Select(a-select) + Button(a-button) + Card(m-card) + Skeleton(a-skeleton)"
composes:
  - ../molecules/card.md
  - ../atoms/input-select.md
  - ../atoms/input-button.md
  - ../atoms/display-skeleton.md
dependencies: ["recharts", "date-fns", "lucide-react"]
performance:
  impact: medium
  lcp: low
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Usage Chart

## Overview

The Usage Chart organism displays usage metrics and analytics data with support for multiple chart types (line, bar, area), time range selection, comparison views, and export functionality. Ideal for dashboards and analytics pages.

## When to Use

Use this skill when:
- Displaying API usage or consumption metrics
- Building analytics dashboards
- Showing billing and usage data
- Visualizing time-series data

## Composition Diagram

```
+---------------------------------------------------------------------+
|                       UsageChart (L3)                                |
+---------------------------------------------------------------------+
|  +---------------------------------------------------------------+  |
|  |  Header                                                       |  |
|  |  Title: API Usage                  [7D] [30D] [90D] [Custom]  |  |
|  |  Subtitle: Requests over time              [Export] [Refresh] |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Summary Stats                                                |  |
|  |  +-------------+ +-------------+ +-------------+              |  |
|  |  | Total       | | Average     | | Peak        |              |  |
|  |  | 1.2M        | | 40K/day     | | 120K        |              |  |
|  |  +-------------+ +-------------+ +-------------+              |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Chart Area (recharts)                                        |  |
|  |  |                                     *                      |  |
|  |  |                    *               / \                     |  |
|  |  |        *          / \    *        /   \                    |  |
|  |  |       / \        /   \  / \      /     \                   |  |
|  |  |  *   /   \  *   /     \/   \    /       \                  |  |
|  |  | / \ /     \/ \ /            \  /         \                 |  |
|  |  |/   *       *  *              \/           \                |  |
|  |  +----------------------------------------------------        |  |
|  |    Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep                |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |  Legend: [---] Current Period  [- -] Previous Period          |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/usage-chart.tsx
'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import {
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPoint {
  date: string;
  value: number;
  previousValue?: number;
  [key: string]: string | number | undefined;
}

interface UsageChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  chartType?: 'line' | 'bar' | 'area';
  timeRanges?: { label: string; days: number }[];
  selectedRange?: number;
  onRangeChange?: (days: number) => void;
  showComparison?: boolean;
  showSummary?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  valueFormatter?: (value: number) => string;
  className?: string;
}

const defaultTimeRanges = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
];

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

function SummaryStats({
  data,
  valueFormatter = formatNumber,
}: {
  data: DataPoint[];
  valueFormatter?: (value: number) => string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const average = data.length > 0 ? total / data.length : 0;
  const peak = Math.max(...data.map((d) => d.value), 0);
  const previousTotal = data.reduce((sum, d) => sum + (d.previousValue || 0), 0);
  const changePercent = previousTotal > 0
    ? ((total - previousTotal) / previousTotal) * 100
    : 0;

  const stats = [
    { label: 'Total', value: valueFormatter(total) },
    { label: 'Average', value: valueFormatter(average) },
    { label: 'Peak', value: valueFormatter(peak) },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
      {changePercent !== 0 && (
        <div className="col-span-3 flex items-center justify-center gap-2 text-sm">
          {changePercent > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={changePercent > 0 ? 'text-green-500' : 'text-red-500'}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs previous period</span>
        </div>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
    </div>
  );
}

export function UsageChart({
  data,
  title = 'Usage',
  subtitle,
  chartType = 'area',
  timeRanges = defaultTimeRanges,
  selectedRange = 30,
  onRangeChange,
  showComparison = false,
  showSummary = true,
  loading = false,
  onRefresh,
  onExport,
  valueFormatter = formatNumber,
  className,
}: UsageChartProps) {
  const [activeRange, setActiveRange] = React.useState(selectedRange);

  const handleRangeChange = (days: number) => {
    setActiveRange(days);
    onRangeChange?.(days);
  };

  const ChartComponent = {
    line: LineChart,
    bar: BarChart,
    area: AreaChart,
  }[chartType];

  const DataComponent = {
    line: Line,
    bar: Bar,
    area: Area,
  }[chartType];

  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex rounded-lg border p-1">
            {timeRanges.map((range) => (
              <button
                key={range.days}
                onClick={() => handleRangeChange(range.days)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  activeRange === range.days
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : (
        <>
          {/* Summary Stats */}
          {showSummary && (
            <SummaryStats data={data} valueFormatter={valueFormatter} />
          )}

          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={valueFormatter}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [valueFormatter(value), 'Value']}
                />
                {showComparison && <Legend />}

                {chartType === 'area' && (
                  <>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorValue)"
                      strokeWidth={2}
                      name="Current"
                    />
                    {showComparison && (
                      <Area
                        type="monotone"
                        dataKey="previousValue"
                        stroke="hsl(var(--muted-foreground))"
                        fill="none"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        name="Previous"
                      />
                    )}
                  </>
                )}

                {chartType === 'line' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="Current"
                    />
                    {showComparison && (
                      <Line
                        type="monotone"
                        dataKey="previousValue"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Previous"
                      />
                    )}
                  </>
                )}

                {chartType === 'bar' && (
                  <>
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Current"
                    />
                    {showComparison && (
                      <Bar
                        dataKey="previousValue"
                        fill="hsl(var(--muted))"
                        radius={[4, 4, 0, 0]}
                        name="Previous"
                      />
                    )}
                  </>
                )}
              </ChartComponent>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { UsageChart } from '@/components/organisms/usage-chart';

const data = [
  { date: 'Jan 1', value: 4000, previousValue: 3500 },
  { date: 'Jan 2', value: 3000, previousValue: 2800 },
  { date: 'Jan 3', value: 5000, previousValue: 4200 },
  // ...more data points
];

export function AnalyticsDashboard() {
  return (
    <UsageChart
      data={data}
      title="API Requests"
      subtitle="Total requests over time"
      chartType="area"
      showComparison
    />
  );
}
```

### Bar Chart Variant

```tsx
<UsageChart
  data={data}
  title="Monthly Revenue"
  chartType="bar"
  valueFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
/>
```

### With Custom Time Ranges

```tsx
<UsageChart
  data={data}
  title="Storage Usage"
  timeRanges={[
    { label: '24H', days: 1 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
  ]}
  onRangeChange={(days) => fetchData(days)}
/>
```

## Accessibility

- Chart data can be exported for screen reader users
- Color contrast meets WCAG requirements
- Interactive elements are keyboard accessible

## Dependencies

```json
{
  "dependencies": {
    "recharts": "^2.12.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Loading | Data being fetched | Skeleton chart visible |
| Empty | No data points | Empty state message |
| Loaded | Chart data displayed | Full chart rendered |
| Refreshing | Updating in background | Spinner on refresh button |
| Hover | Hovering over data point | Tooltip visible |
| Comparing | Showing comparison data | Two data series visible |
| Exporting | Generating export file | Export button loading |

## Anti-patterns

### 1. Not handling empty data gracefully

```tsx
// Bad: Renders broken chart with no data
<ResponsiveContainer>
  <LineChart data={data}>
    <Line dataKey="value" />
  </LineChart>
</ResponsiveContainer>

// Good: Show empty state when no data
{data.length === 0 ? (
  <div className="h-[300px] flex items-center justify-center">
    <p className="text-muted-foreground">No data available</p>
  </div>
) : (
  <ResponsiveContainer>
    <LineChart data={data}>
      <Line dataKey="value" />
    </LineChart>
  </ResponsiveContainer>
)}
```

### 2. Using fixed dimensions instead of ResponsiveContainer

```tsx
// Bad: Fixed width doesn't adapt
<LineChart width={600} height={300} data={data}>
  {/* ... */}
</LineChart>

// Good: Use ResponsiveContainer for responsive charts
<div className="h-[300px]">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* ... */}
    </LineChart>
  </ResponsiveContainer>
</div>
```

### 3. Not formatting large numbers

```tsx
// Bad: Shows raw numbers like 1000000
<YAxis />

// Good: Format with abbreviations
<YAxis
  tickFormatter={(value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }}
/>
```

### 4. Tooltip styling not matching theme

```tsx
// Bad: Default tooltip ignores dark mode
<Tooltip />

// Good: Style tooltip to match theme
<Tooltip
  contentStyle={{
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
  }}
  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
/>
```

## Related Skills

- [organisms/chart](./chart.md)
- [organisms/stats](./stats.md)
- [molecules/stat-card](../molecules/stat-card.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multiple chart types (line, bar, area)
- Time range selection
- Period comparison
- Summary statistics
