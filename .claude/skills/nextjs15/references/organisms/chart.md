---
id: o-chart
name: Chart
version: 2.0.0
layer: L3
category: data
description: Data visualization charts with multiple types and interactive features
tags: [chart, graph, visualization, data, analytics, metrics]
formula: "Chart = Card(m-card) + ChartHeader + Legend(Badge[]) + RechartsVisualization + Tooltip + Skeleton(a-skeleton)"
composes:
  - ../molecules/card.md
dependencies: [recharts, lucide-react]
performance:
  impact: high
  lcp: low
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Chart

## Overview

The Chart organism provides a comprehensive set of data visualization components built on Recharts. Supports line, bar, area, pie, and donut charts with responsive sizing, tooltips, legends, and accessibility features.

## When to Use

Use this skill when:
- Building analytics dashboards
- Displaying metrics and KPIs
- Visualizing trends over time
- Comparing data categories

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Chart (L3)                              │
├─────────────────────────────────────────────────────────────────┤
│  Card (m-card)                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Chart Header                                              │  │
│  │  Revenue Overview                      [This Month ▼]      │  │
│  │  $45,231.89 (+20.1%)                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Recharts Visualization                                    │  │
│  │                                                           │  │
│  │    ^                                          ████        │  │
│  │  $ │            ████                    ████  ████        │  │
│  │    │      ████  ████      ████  ████    ████  ████        │  │
│  │    │████  ████  ████ ████ ████  ████    ████  ████  ████  │  │
│  │    └────────────────────────────────────────────────────► │  │
│  │      Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct     │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │ Tooltip (on hover)                                │   │  │
│  │  │ March 2025: $12,450                               │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Legend: Badge(a-badge)[]                                  │  │
│  │  [●Revenue] [●Expenses] [●Profit]                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Loading State: Skeleton(a-skeleton)                            │
└─────────────────────────────────────────────────────────────────┘

Chart Types: Line | Bar | Area | Pie | Donut | Composed
```

## Molecules Used

- [card](../molecules/card.md) - Chart containers
- [badge](../atoms/badge.md) - Legend items
- [skeleton](../atoms/skeleton.md) - Loading states

## Implementation

```typescript
// components/organisms/chart.tsx
"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Chart color palette
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const FALLBACK_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
];

interface ChartDataPoint {
  [key: string]: string | number;
}

interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
  };
}

interface BaseChartProps {
  /** Chart title */
  title?: string;
  /** Chart description */
  description?: string;
  /** Data points */
  data: ChartDataPoint[];
  /** Chart configuration for series */
  config: ChartConfig;
  /** Height of the chart */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Trend indicator */
  trend?: {
    value: number;
    label: string;
  };
  /** Additional class names */
  className?: string;
}

interface LineChartProps extends BaseChartProps {
  type: "line";
  /** X-axis data key */
  xAxisKey: string;
  /** Curve type */
  curveType?: "linear" | "monotone" | "step";
  /** Show dots on line */
  showDots?: boolean;
}

interface AreaChartProps extends BaseChartProps {
  type: "area";
  /** X-axis data key */
  xAxisKey: string;
  /** Stack areas */
  stacked?: boolean;
  /** Gradient fill */
  gradient?: boolean;
}

interface BarChartProps extends BaseChartProps {
  type: "bar";
  /** X-axis data key */
  xAxisKey: string;
  /** Horizontal bars */
  horizontal?: boolean;
  /** Stack bars */
  stacked?: boolean;
  /** Bar radius */
  radius?: number;
}

interface PieChartProps extends BaseChartProps {
  type: "pie" | "donut";
  /** Data key for values */
  dataKey: string;
  /** Name key for labels */
  nameKey: string;
  /** Inner radius for donut */
  innerRadius?: number;
  /** Show labels on segments */
  showLabels?: boolean;
}

type ChartProps = LineChartProps | AreaChartProps | BarChartProps | PieChartProps;

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  label,
  config,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  config: ChartConfig;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      {label && (
        <p className="mb-2 text-sm font-medium">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const configEntry = config[entry.name];
          return (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {configEntry?.label ?? entry.name}
                </span>
              </div>
              <span className="text-sm font-medium tabular-nums">
                {typeof entry.value === "number"
                  ? entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Custom legend component
function CustomLegend({
  payload,
  config,
}: {
  payload?: Array<{ value: string; color: string }>;
  config: ChartConfig;
}) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 pt-4">
      {payload.map((entry, index) => {
        const configEntry = config[entry.value];
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {configEntry?.label ?? entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Trend indicator component
function TrendIndicator({ value, label }: { value: number; label: string }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-1 text-sm">
      <Icon
        className={cn(
          "h-4 w-4",
          isPositive && "text-green-500",
          !isPositive && !isNeutral && "text-red-500",
          isNeutral && "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "font-medium",
          isPositive && "text-green-500",
          !isPositive && !isNeutral && "text-red-500",
          isNeutral && "text-muted-foreground"
        )}
      >
        {isPositive && "+"}
        {value}%
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

// Loading skeleton
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton style={{ height }} className="w-full" />
    </div>
  );
}

// Get colors from config or fallback
function getSeriesColors(config: ChartConfig): string[] {
  const keys = Object.keys(config);
  return keys.map((key, index) => {
    const configColor = config[key]?.color;
    if (configColor) return configColor;
    return COLORS[index % COLORS.length] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  });
}

// Line Chart Component
function LineChartComponent({
  data,
  config,
  xAxisKey,
  curveType = "monotone",
  showDots = false,
  showGrid = true,
  showLegend = true,
  height = 300,
}: LineChartProps) {
  const colors = getSeriesColors(config);
  const dataKeys = Object.keys(config);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          axisLine={false}
          className="text-xs fill-muted-foreground"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          className="text-xs fill-muted-foreground"
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip config={config} />} />
        {showLegend && <Legend content={<CustomLegend config={config} />} />}
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type={curveType}
            dataKey={key}
            stroke={colors[index]}
            strokeWidth={2}
            dot={showDots}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Area Chart Component
function AreaChartComponent({
  data,
  config,
  xAxisKey,
  stacked = false,
  gradient = true,
  showGrid = true,
  showLegend = true,
  height = 300,
}: AreaChartProps) {
  const colors = getSeriesColors(config);
  const dataKeys = Object.keys(config);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          {colors.map((color, index) => (
            <linearGradient
              key={index}
              id={`gradient-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          axisLine={false}
          className="text-xs fill-muted-foreground"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          className="text-xs fill-muted-foreground"
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip config={config} />} />
        {showLegend && <Legend content={<CustomLegend config={config} />} />}
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId={stacked ? "stack" : undefined}
            stroke={colors[index]}
            fill={gradient ? `url(#gradient-${index})` : colors[index]}
            fillOpacity={gradient ? 1 : 0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Bar Chart Component
function BarChartComponent({
  data,
  config,
  xAxisKey,
  horizontal = false,
  stacked = false,
  radius = 4,
  showGrid = true,
  showLegend = true,
  height = 300,
}: BarChartProps) {
  const colors = getSeriesColors(config);
  const dataKeys = Object.keys(config);

  const ChartComponent = BarChart;
  const xAxisProps = horizontal
    ? { type: "number" as const, tickFormatter: (value: number) => value.toLocaleString() }
    : { dataKey: xAxisKey };
  const yAxisProps = horizontal
    ? { type: "category" as const, dataKey: xAxisKey }
    : { tickFormatter: (value: number) => value.toLocaleString() };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 20, bottom: 5, left: horizontal ? 60 : 0 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          {...xAxisProps}
          tickLine={false}
          axisLine={false}
          className="text-xs fill-muted-foreground"
        />
        <YAxis
          {...yAxisProps}
          tickLine={false}
          axisLine={false}
          className="text-xs fill-muted-foreground"
        />
        <Tooltip content={<CustomTooltip config={config} />} />
        {showLegend && <Legend content={<CustomLegend config={config} />} />}
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId={stacked ? "stack" : undefined}
            fill={colors[index]}
            radius={[radius, radius, 0, 0]}
          />
        ))}
      </ChartComponent>
    </ResponsiveContainer>
  );
}

// Pie/Donut Chart Component
function PieChartComponent({
  data,
  config,
  dataKey,
  nameKey,
  innerRadius = 0,
  showLabels = false,
  showLegend = true,
  height = 300,
  type,
}: PieChartProps) {
  const colors = getSeriesColors(config);
  const donutInnerRadius = type === "donut" ? innerRadius || 60 : 0;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={donutInnerRadius}
          outerRadius={100}
          dataKey={dataKey}
          nameKey={nameKey}
          label={
            showLabels
              ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
              : false
          }
          labelLine={showLabels}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip config={config} />} />
        {showLegend && <Legend content={<CustomLegend config={config} />} />}
      </PieChart>
    </ResponsiveContainer>
  );
}

export function Chart(props: ChartProps) {
  const {
    title,
    description,
    trend,
    isLoading,
    className,
    height = 300,
    ...chartProps
  } = props;

  if (isLoading) {
    return (
      <Card className={className}>
        <ChartSkeleton height={height} />
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartProps.type) {
      case "line":
        return <LineChartComponent {...chartProps} height={height} />;
      case "area":
        return <AreaChartComponent {...chartProps} height={height} />;
      case "bar":
        return <BarChartComponent {...chartProps} height={height} />;
      case "pie":
      case "donut":
        return <PieChartComponent {...chartProps} height={height} />;
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      {(title || description || trend) && (
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
            {trend && <TrendIndicator value={trend.value} label={trend.label} />}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(!title && !description && "pt-6")}>
        {renderChart()}
      </CardContent>
    </Card>
  );
}

// Export individual chart types for direct use
export { LineChartComponent as LineChart };
export { AreaChartComponent as AreaChart };
export { BarChartComponent as BarChart };
export { PieChartComponent as PieChart };
```

### Key Implementation Notes

1. **Recharts Integration**: Full integration with common chart types
2. **Theme Colors**: Uses CSS variables for consistent theming
3. **Custom Tooltips**: Styled tooltips with config labels
4. **Responsive**: Charts adapt to container width

## Variants

### Line Chart

```tsx
<Chart
  type="line"
  title="Monthly Revenue"
  description="Revenue trends over time"
  data={[
    { month: "Jan", revenue: 4000, expenses: 2400 },
    { month: "Feb", revenue: 3000, expenses: 1398 },
    // More data...
  ]}
  config={{
    revenue: { label: "Revenue", color: "#3b82f6" },
    expenses: { label: "Expenses", color: "#ef4444" },
  }}
  xAxisKey="month"
  trend={{ value: 12.5, label: "vs last month" }}
/>
```

### Area Chart (Stacked)

```tsx
<Chart
  type="area"
  title="User Growth"
  data={userGrowthData}
  config={{
    free: { label: "Free Users" },
    pro: { label: "Pro Users" },
    enterprise: { label: "Enterprise" },
  }}
  xAxisKey="month"
  stacked
  gradient
/>
```

### Bar Chart

```tsx
<Chart
  type="bar"
  title="Sales by Category"
  data={salesData}
  config={{
    electronics: { label: "Electronics" },
    clothing: { label: "Clothing" },
    food: { label: "Food" },
  }}
  xAxisKey="quarter"
  stacked={false}
/>
```

### Horizontal Bar Chart

```tsx
<Chart
  type="bar"
  title="Top Products"
  data={topProducts}
  config={{
    sales: { label: "Sales" },
  }}
  xAxisKey="product"
  horizontal
  height={400}
/>
```

### Donut Chart

```tsx
<Chart
  type="donut"
  title="Traffic Sources"
  data={[
    { source: "Direct", value: 400 },
    { source: "Organic", value: 300 },
    { source: "Social", value: 200 },
    { source: "Referral", value: 100 },
  ]}
  config={{
    Direct: { label: "Direct" },
    Organic: { label: "Organic Search" },
    Social: { label: "Social Media" },
    Referral: { label: "Referral" },
  }}
  dataKey="value"
  nameKey="source"
/>
```

## Performance

### Large Datasets

- Aggregate data before rendering
- Limit data points to ~100 for smooth performance
- Consider server-side aggregation

### Rendering

- Use `ResponsiveContainer` for adaptive sizing
- Memoize data transformations
- Debounce resize handlers

## Accessibility

### Required Attributes

- Charts have descriptive titles
- Data is available in accessible format
- Colors meet contrast requirements

### Screen Reader

- Consider data tables as alternative
- Trend changes are described
- Legend items are labeled

### Alternative Views

- Provide data tables for screen readers
- Allow export of raw data
- Include text summaries

## Dependencies

```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "lucide-react": "^0.460.0"
  }
}
```

## CSS Variables

Add to your globals.css:

```css
:root {
  --chart-1: 221.2 83.2% 53.3%;
  --chart-2: 142.1 76.2% 36.3%;
  --chart-3: 47.9 95.8% 53.1%;
  --chart-4: 0 84.2% 60.2%;
  --chart-5: 262.1 83.3% 57.8%;
}

.dark {
  --chart-1: 217.2 91.2% 59.8%;
  --chart-2: 142.1 70.6% 45.3%;
  --chart-3: 47.9 95.8% 53.1%;
  --chart-4: 0 84.2% 60.2%;
  --chart-5: 262.1 83.3% 57.8%;
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Chart renders with data | Visualization displays with axes, legend, and data points |
| Loading | Data being fetched | Skeleton placeholder matching chart dimensions |
| Empty | No data points available | Empty chart area with message or placeholder |
| Hover | User hovers over data point | Tooltip appears with formatted values, point/bar highlighted |
| Legend Hover | User hovers legend item | Corresponding series highlighted, others dimmed |
| Trend Positive | Positive trend indicator | Green upward arrow with percentage |
| Trend Negative | Negative trend indicator | Red downward arrow with percentage |
| Trend Neutral | No change indicator | Gray horizontal line with 0% |
| Responsive | Container resized | Chart redraws to fit new dimensions |
| Error | Data fetch failed | Error message with retry option (implement via wrapper) |
| Animating | Initial render animation | Data points/bars animate into view |

## Anti-patterns

### Bad: Passing unsorted or inconsistent data

```tsx
// Bad - data points in random order
<Chart
  type="line"
  data={[
    { month: 'Mar', value: 300 },
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 200 }, // Out of order!
  ]}
  xAxisKey="month"
/>

// Good - ensure chronological order
const sortedData = data.sort((a, b) =>
  new Date(a.date).getTime() - new Date(b.date).getTime()
);
<Chart type="line" data={sortedData} xAxisKey="month" />
```

### Bad: Not memoizing expensive data transformations

```tsx
// Bad - recalculating on every render
function Dashboard({ rawData }) {
  const chartData = rawData.map(item => ({
    ...item,
    value: calculateComplexMetric(item), // Expensive!
  }));

  return <Chart data={chartData} />;
}

// Good - memoize transformations
function Dashboard({ rawData }) {
  const chartData = useMemo(
    () => rawData.map(item => ({
      ...item,
      value: calculateComplexMetric(item),
    })),
    [rawData]
  );

  return <Chart data={chartData} />;
}
```

### Bad: Using colors that fail contrast requirements

```tsx
// Bad - light colors on light background
<Chart
  config={{
    revenue: { label: 'Revenue', color: '#ffff99' }, // Yellow on white!
    expenses: { label: 'Expenses', color: '#ccffcc' }, // Light green
  }}
/>

// Good - use accessible color palette
<Chart
  config={{
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
    expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
  }}
/>
// Or use the built-in COLORS constant which meets WCAG standards
```

### Bad: Rendering too many data points

```tsx
// Bad - rendering thousands of points
<Chart
  type="line"
  data={yearOfHourlyData} // 8,760 points!
/>

// Good - aggregate data for display
const aggregatedData = useMemo(() => {
  // Aggregate hourly to daily for large datasets
  if (rawData.length > 100) {
    return aggregateByDay(rawData);
  }
  return rawData;
}, [rawData]);

<Chart type="line" data={aggregatedData} />
```

## Related Skills

### Composes Into
- [templates/dashboard-layout](../templates/dashboard-layout.md)
- [templates/analytics-layout](../templates/analytics-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Line, area, bar, and pie chart types
- Custom tooltips and legends
- Trend indicators
