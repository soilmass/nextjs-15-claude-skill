---
id: pt-charts
name: Charts Integration
version: 1.0.0
layer: L5
category: visualization
description: Chart library integration with Recharts for data visualization in React
tags: [charts, visualization, recharts, data, dashboard, next15]
composes: []
dependencies: []
formula: "Charts = Recharts + ResponsiveContainer + DataTransformation + InteractiveTooltips"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Charts Integration

## When to Use

- Dashboard analytics visualization
- Financial data representation
- Progress tracking displays
- Statistical reporting
- Real-time data monitoring

## Composition Diagram

```
Chart Architecture
==================

+------------------------------------------+
|  Data Source                             |
|  - API response                          |
|  - Aggregated metrics                    |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Data Transformation                     |
|  - Format for chart library              |
|  - Calculate aggregates                  |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Chart Component                         |
|  - ResponsiveContainer                   |
|  - Chart type (Line, Bar, Pie, etc.)     |
|  - Tooltip, Legend, Axis                 |
+------------------------------------------+
```

## Installation

```bash
npm install recharts
```

## Line Chart Component

```typescript
// components/charts/line-chart.tsx
'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: DataPoint[];
  lines: {
    dataKey: string;
    color: string;
    name?: string;
  }[];
  xAxisKey?: string;
  height?: number;
}

export function LineChart({
  data,
  lines,
  xAxisKey = 'name',
  height = 300,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}
```

## Bar Chart Component

```typescript
// components/charts/bar-chart.tsx
'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: any[];
  bars: {
    dataKey: string;
    color: string;
    name?: string;
    stackId?: string;
  }[];
  xAxisKey?: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
}

export function BarChart({
  data,
  bars,
  xAxisKey = 'name',
  height = 300,
  layout = 'horizontal',
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        {layout === 'horizontal' ? (
          <>
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis dataKey={xAxisKey} type="category" tick={{ fontSize: 12 }} tickLine={false} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color}
            stackId={bar.stackId}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

## Pie Chart Component

```typescript
// components/charts/pie-chart.tsx
'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  innerRadius?: number;
  showLabels?: boolean;
}

export function PieChart({
  data,
  height = 300,
  innerRadius = 0,
  showLabels = true,
}: PieChartProps) {
  const renderLabel = ({ name, percent }: any) => {
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius="80%"
          paddingAngle={2}
          dataKey="value"
          label={showLabels ? renderLabel : false}
          labelLine={showLabels}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
```

## Area Chart Component

```typescript
// components/charts/area-chart.tsx
'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartProps {
  data: any[];
  areas: {
    dataKey: string;
    color: string;
    name?: string;
    stackId?: string;
  }[];
  xAxisKey?: string;
  height?: number;
}

export function AreaChart({
  data,
  areas,
  xAxisKey = 'name',
  height = 300,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name || area.dataKey}
            stroke={area.color}
            fill={area.color}
            fillOpacity={0.3}
            stackId={area.stackId}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
```

## Custom Tooltip

```typescript
// components/charts/custom-tooltip.tsx
'use client';

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## Chart Card Wrapper

```typescript
// components/charts/chart-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

## Usage Examples

```typescript
// app/dashboard/page.tsx
import { LineChart } from '@/components/charts/line-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { ChartCard } from '@/components/charts/chart-card';

const revenueData = [
  { month: 'Jan', revenue: 4000, profit: 2400 },
  { month: 'Feb', revenue: 3000, profit: 1398 },
  { month: 'Mar', revenue: 2000, profit: 9800 },
  { month: 'Apr', revenue: 2780, profit: 3908 },
  { month: 'May', revenue: 1890, profit: 4800 },
  { month: 'Jun', revenue: 2390, profit: 3800 },
];

const categoryData = [
  { name: 'Electronics', value: 400, color: '#8884d8' },
  { name: 'Clothing', value: 300, color: '#82ca9d' },
  { name: 'Food', value: 200, color: '#ffc658' },
  { name: 'Books', value: 100, color: '#ff8042' },
];

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ChartCard title="Revenue & Profit" description="Monthly financial overview">
        <LineChart
          data={revenueData}
          xAxisKey="month"
          lines={[
            { dataKey: 'revenue', color: '#8884d8', name: 'Revenue' },
            { dataKey: 'profit', color: '#82ca9d', name: 'Profit' },
          ]}
        />
      </ChartCard>

      <ChartCard title="Sales by Category">
        <PieChart data={categoryData} innerRadius={60} />
      </ChartCard>

      <ChartCard title="Monthly Comparison">
        <BarChart
          data={revenueData}
          xAxisKey="month"
          bars={[
            { dataKey: 'revenue', color: '#8884d8', name: 'Revenue' },
            { dataKey: 'profit', color: '#82ca9d', name: 'Profit' },
          ]}
        />
      </ChartCard>
    </div>
  );
}
```

## Anti-patterns

### Don't Render Charts on Server

```typescript
// BAD - Will break SSR
export default function Page() {
  return <LineChart data={data} />; // Recharts needs browser APIs
}

// GOOD - Use dynamic import or client component
'use client';
export default function Page() {
  return <LineChart data={data} />;
}
```

## Related Skills

- [streaming](./streaming.md)
- [data-aggregation](./data-aggregation.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Line, Bar, Pie, Area charts
- Custom tooltip
- Responsive containers
