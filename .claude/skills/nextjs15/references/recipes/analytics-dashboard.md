---
id: r-analytics-dashboard
name: Analytics Dashboard
version: 3.0.0
layer: L6
category: recipes
description: Data analytics dashboard with charts, metrics, reports, and real-time data visualization
tags: [analytics, dashboard, charts, metrics, reports, visualization, data]
formula: "AnalyticsDashboard = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + ProfilePage(t-profile-page) + Chart(o-chart) + DataTable(o-data-table) + Header(o-header) + Footer(o-footer) + Sidebar(o-sidebar) + StatsDashboard(o-stats-dashboard) + Modal(o-modal) + Tabs(o-tabs) + FilterBar(o-filter-bar) + DateRangePicker(o-date-range-picker) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + StatCard(m-stat-card) + SearchInput(m-search-input) + Badge(m-badge) + DatePicker(m-date-picker) + Select(m-select) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + TransactionalEmail(pt-transactional-email) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + PrismaPatterns(pt-prisma-patterns) + DataAggregation(pt-data-aggregation) + ExportData(pt-export-data) + CronJobs(pt-cron-jobs) + BackgroundJobs(pt-background-jobs) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + OptimisticUpdates(pt-optimistic-updates) + VirtualScrolling(pt-virtual-scrolling) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + PushNotifications(pt-push-notifications) + Search(pt-search)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/chart.md
  - ../organisms/data-table.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/sidebar.md
  - ../organisms/stats-dashboard.md
  - ../organisms/modal.md
  - ../organisms/tabs.md
  - ../organisms/filter-bar.md
  - ../organisms/date-range-picker.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/stat-card.md
  - ../molecules/search-input.md
  - ../molecules/badge.md
  - ../molecules/date-picker.md
  - ../molecules/select.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Database & Processing
  - ../patterns/prisma-patterns.md
  - ../patterns/data-aggregation.md
  - ../patterns/export-data.md
  - ../patterns/cron-jobs.md
  - ../patterns/background-jobs.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - UI/UX
  - ../patterns/optimistic-updates.md
  - ../patterns/virtual-scrolling.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Security (Additional)
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Communication
  - ../patterns/push-notifications.md
  # L5 Patterns - Search
  - ../patterns/search.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - recharts
  - "@radix-ui/react-select"
  - "@radix-ui/react-popover"
  - "@radix-ui/react-tabs"
  - date-fns
  - lucide-react
skills:
  - charts
  - data-tables
  - date-range-picker
  - export-data
  - real-time-updates
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Analytics Dashboard

## Overview

A comprehensive analytics dashboard featuring:
- Real-time metrics and KPIs
- Interactive charts (line, bar, area, pie)
- Data tables with sorting, filtering, pagination
- Date range selection
- Report generation and export
- Customizable dashboard widgets
- Comparison periods
- Drill-down capabilities

## Architecture

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx                    # Dashboard shell with sidebar
│   ├── page.tsx                      # Overview dashboard
│   ├── traffic/page.tsx              # Traffic analytics
│   ├── revenue/page.tsx              # Revenue analytics
│   ├── users/page.tsx                # User analytics
│   ├── events/page.tsx               # Event tracking
│   └── reports/
│       ├── page.tsx                  # Report list
│       └── [reportId]/page.tsx       # Report detail
├── api/
│   ├── analytics/
│   │   ├── overview/route.ts         # Overview metrics
│   │   ├── traffic/route.ts          # Traffic data
│   │   ├── revenue/route.ts          # Revenue data
│   │   └── users/route.ts            # User data
│   ├── events/route.ts               # Event tracking
│   └── reports/
│       ├── route.ts                  # CRUD reports
│       └── [reportId]/
│           ├── route.ts              # Single report
│           └── export/route.ts       # Export report
├── components/
│   ├── analytics/
│   │   ├── metric-card.tsx           # KPI display
│   │   ├── chart-card.tsx            # Chart wrapper
│   │   ├── data-table.tsx            # Data grid
│   │   └── comparison-badge.tsx      # Period comparison
│   ├── charts/
│   │   ├── area-chart.tsx
│   │   ├── bar-chart.tsx
│   │   ├── line-chart.tsx
│   │   ├── pie-chart.tsx
│   │   └── sparkline.tsx
│   └── filters/
│       ├── date-range-picker.tsx
│       ├── period-selector.tsx
│       └── filter-bar.tsx
├── lib/
│   ├── analytics.ts                  # Analytics utilities
│   └── utils.ts
└── prisma/
    └── schema.prisma                 # Database schema
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| [Chart](../organisms/chart.md) | L3 Organism | Recharts-based data visualization components |
| [Data Table](../organisms/data-table.md) | L3 Organism | TanStack Table with sorting, filtering, pagination |
| [Dashboard Layout](../templates/dashboard-layout.md) | L4 Template | Sidebar navigation and dashboard shell |
| [Dashboard Home](../templates/dashboard-home.md) | L4 Template | Overview page with metric cards and charts |
| [React Query](../patterns/react-query.md) | L5 Pattern | Server state management and caching |
| [Prisma Patterns](../patterns/prisma-patterns.md) | L5 Pattern | Database queries and aggregations |

## Project Structure

```
analytics-dashboard/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Overview dashboard
│   │   ├── traffic/page.tsx            # Traffic analytics
│   │   ├── revenue/page.tsx            # Revenue analytics
│   │   ├── users/page.tsx              # User analytics
│   │   ├── events/page.tsx             # Event tracking
│   │   └── reports/
│   │       ├── page.tsx                # Report list
│   │       └── [reportId]/page.tsx     # Report detail
│   ├── api/
│   │   ├── analytics/
│   │   │   ├── overview/route.ts
│   │   │   ├── traffic/route.ts
│   │   │   ├── revenue/route.ts
│   │   │   └── users/route.ts
│   │   ├── events/route.ts
│   │   └── reports/
│   │       ├── route.ts
│   │       └── [reportId]/
│   │           ├── route.ts
│   │           └── export/route.ts
│   └── layout.tsx
├── components/
│   ├── analytics/
│   │   ├── metric-card.tsx
│   │   ├── chart-card.tsx
│   │   ├── data-table.tsx
│   │   └── comparison-badge.tsx
│   ├── charts/
│   │   ├── area-chart.tsx
│   │   ├── bar-chart.tsx
│   │   ├── line-chart.tsx
│   │   ├── pie-chart.tsx
│   │   └── sparkline.tsx
│   ├── filters/
│   │   ├── date-range-picker.tsx
│   │   ├── period-selector.tsx
│   │   └── filter-bar.tsx
│   └── ui/
├── lib/
│   ├── analytics.ts
│   └── utils.ts
└── prisma/
    └── schema.prisma
```

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("viewer")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  reports       Report[]
  dashboards    Dashboard[]
  savedFilters  SavedFilter[]
}

// Analytics Events (for event tracking)
model AnalyticsEvent {
  id          String   @id @default(cuid())
  name        String
  properties  Json?
  sessionId   String
  userId      String?
  userAgent   String?
  ipAddress   String?
  country     String?
  city        String?
  device      String?
  browser     String?
  os          String?
  referrer    String?
  pathname    String?
  timestamp   DateTime @default(now())

  @@index([name])
  @@index([sessionId])
  @@index([userId])
  @@index([timestamp])
}

// Page Views
model PageView {
  id          String   @id @default(cuid())
  pathname    String
  title       String?
  sessionId   String
  userId      String?
  duration    Int?     // seconds spent on page
  referrer    String?
  timestamp   DateTime @default(now())

  @@index([pathname])
  @@index([sessionId])
  @@index([timestamp])
}

// Sessions
model Session {
  id          String   @id @default(cuid())
  userId      String?
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  duration    Int?     // total session duration in seconds
  pageViews   Int      @default(0)
  events      Int      @default(0)
  country     String?
  city        String?
  device      String?
  browser     String?
  os          String?
  referrer    String?
  utmSource   String?
  utmMedium   String?
  utmCampaign String?

  @@index([userId])
  @@index([startedAt])
}

// Revenue/Transactions
model Transaction {
  id          String   @id @default(cuid())
  orderId     String
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("USD")
  status      String
  productId   String?
  productName String?
  category    String?
  quantity    Int      @default(1)
  userId      String?
  sessionId   String?
  timestamp   DateTime @default(now())

  @@index([status])
  @@index([timestamp])
  @@index([productId])
}

// Aggregated Daily Metrics (for faster queries)
model DailyMetrics {
  id            String   @id @default(cuid())
  date          DateTime @db.Date
  
  // Traffic
  pageViews     Int      @default(0)
  uniqueVisitors Int     @default(0)
  sessions      Int      @default(0)
  avgSessionDuration Float @default(0)
  bounceRate    Float    @default(0)
  
  // Revenue
  revenue       Decimal  @default(0) @db.Decimal(10, 2)
  transactions  Int      @default(0)
  avgOrderValue Decimal  @default(0) @db.Decimal(10, 2)
  
  // Users
  newUsers      Int      @default(0)
  activeUsers   Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([date])
  @@index([date])
}

// Custom Reports
model Report {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        String   // 'traffic', 'revenue', 'users', 'custom'
  config      Json     // Chart config, metrics, filters
  schedule    String?  // Cron expression for scheduled reports
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// Custom Dashboards
model Dashboard {
  id          String   @id @default(cuid())
  name        String
  description String?
  isDefault   Boolean  @default(false)
  layout      Json     // Widget positions and sizes
  widgets     Json     // Widget configurations
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// Saved Filters
model SavedFilter {
  id          String   @id @default(cuid())
  name        String
  config      Json
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())

  @@index([userId])
}
```

## Implementation

### Metric Card

```tsx
// components/analytics/metric-card.tsx
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkline } from '@/components/charts/sparkline';
import { cn, formatNumber, formatPercent } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent';
  currency?: string;
  sparklineData?: number[];
  icon?: React.ReactNode;
  description?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  currency = 'USD',
  sparklineData,
  icon,
  description,
}: MetricCardProps) {
  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          notation: val >= 1000000 ? 'compact' : 'standard',
        }).format(val);
      case 'percent':
        return formatPercent(val);
      default:
        return formatNumber(val);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">{formatValue(value)}</p>
            
            {previousValue !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    'flex items-center text-sm font-medium',
                    isPositive && 'text-green-600',
                    isNegative && 'text-red-600',
                    isNeutral && 'text-gray-500'
                  )}
                >
                  {isPositive && <ArrowUp className="h-4 w-4" />}
                  {isNegative && <ArrowDown className="h-4 w-4" />}
                  {isNeutral && <Minus className="h-4 w-4" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">vs previous period</span>
              </div>
            )}
            
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>

          {sparklineData && sparklineData.length > 0 && (
            <div className="w-24 h-12">
              <Sparkline
                data={sparklineData}
                color={isPositive ? '#22c55e' : isNegative ? '#ef4444' : '#6b7280'}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Area Chart Component

```tsx
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
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: DataPoint[];
  areas: {
    dataKey: string;
    name: string;
    color: string;
    fillOpacity?: number;
  }[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  valueFormat?: 'number' | 'currency' | 'percent';
  stacked?: boolean;
}

export function AreaChart({
  data,
  areas,
  xAxisKey = 'date',
  height = 350,
  showGrid = true,
  showLegend = true,
  valueFormat = 'number',
  stacked = false,
}: AreaChartProps) {
  const formatValue = (value: number) => {
    switch (valueFormat) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return formatNumber(value);
    }
  };

  const formatXAxis = (value: string) => {
    try {
      return format(new Date(value), 'MMM d');
    } catch {
      return value;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />
        )}
        
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        
        <YAxis
          tickFormatter={formatValue}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          labelFormatter={(label) => {
            try {
              return format(new Date(label), 'MMMM d, yyyy');
            } catch {
              return label;
            }
          }}
          formatter={(value: number, name: string) => [formatValue(value), name]}
        />
        
        {showLegend && (
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
          />
        )}

        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color}
            fill={area.color}
            fillOpacity={area.fillOpacity ?? 0.2}
            strokeWidth={2}
            stackId={stacked ? '1' : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
```

### Date Range Picker

```tsx
// components/filters/date-range-picker.tsx
'use client';

import { useState } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

const presets = [
  {
    label: 'Today',
    getValue: () => ({ from: new Date(), to: new Date() }),
  },
  {
    label: 'Yesterday',
    getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }),
  },
  {
    label: 'Last 7 days',
    getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: 'Last 90 days',
    getValue: () => ({ from: subDays(new Date(), 89), to: new Date() }),
  },
  {
    label: 'This month',
    getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }),
  },
  {
    label: 'Last month',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: 'This year',
    getValue: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
];

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const displayValue = value?.from
    ? value.to
      ? `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`
      : format(value.from, 'MMM d, yyyy')
    : 'Select date range';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal min-w-[280px]',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-2 space-y-1">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => {
                  onChange(preset.getValue());
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-3">
            <DayPicker
              mode="range"
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              defaultMonth={value?.from || subMonths(new Date(), 1)}
              disabled={{ after: new Date() }}
              classNames={{
                months: 'flex gap-4',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'text-center text-sm p-0 relative',
                day: 'h-9 w-9 p-0 font-normal hover:bg-accent rounded-md',
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'text-muted-foreground opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
                day_range_middle: 'bg-accent',
                day_hidden: 'invisible',
              }}
            />
            
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                Clear
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Data Table with Sorting & Filtering

```tsx
// components/analytics/data-table.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchKey?: string;
  searchPlaceholder?: string;
  onExport?: () => void;
}

export function DataTable<TData>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search...',
  onExport,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-gray-900">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'flex items-center gap-1 cursor-pointer select-none hover:text-gray-900'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="px-3 text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Analytics Overview API

```tsx
// app/api/analytics/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subDays, startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : subDays(new Date(), 29);
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : new Date();

  // Previous period for comparison
  const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStartDate = subDays(startDate, periodLength);
  const previousEndDate = subDays(endDate, periodLength);

  // Fetch current period metrics
  const [currentMetrics, previousMetrics] = await Promise.all([
    prisma.dailyMetrics.aggregate({
      where: {
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
      _sum: {
        pageViews: true,
        uniqueVisitors: true,
        sessions: true,
        revenue: true,
        transactions: true,
        newUsers: true,
      },
      _avg: {
        avgSessionDuration: true,
        bounceRate: true,
        avgOrderValue: true,
      },
    }),
    prisma.dailyMetrics.aggregate({
      where: {
        date: {
          gte: startOfDay(previousStartDate),
          lte: endOfDay(previousEndDate),
        },
      },
      _sum: {
        pageViews: true,
        uniqueVisitors: true,
        sessions: true,
        revenue: true,
        transactions: true,
        newUsers: true,
      },
      _avg: {
        avgSessionDuration: true,
        bounceRate: true,
        avgOrderValue: true,
      },
    }),
  ]);

  // Fetch daily data for charts
  const dailyData = await prisma.dailyMetrics.findMany({
    where: {
      date: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    },
    orderBy: { date: 'asc' },
  });

  // Fill in missing days
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const chartData = dateRange.map((date) => {
    const dayData = dailyData.find(
      (d) => format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date: format(date, 'yyyy-MM-dd'),
      pageViews: dayData?.pageViews || 0,
      visitors: dayData?.uniqueVisitors || 0,
      sessions: dayData?.sessions || 0,
      revenue: dayData?.revenue ? Number(dayData.revenue) : 0,
    };
  });

  // Top pages
  const topPages = await prisma.pageView.groupBy({
    by: ['pathname'],
    where: {
      timestamp: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    },
    _count: true,
    orderBy: {
      _count: {
        pathname: 'desc',
      },
    },
    take: 10,
  });

  // Traffic sources
  const trafficSources = await prisma.session.groupBy({
    by: ['utmSource'],
    where: {
      startedAt: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
      utmSource: { not: null },
    },
    _count: true,
    orderBy: {
      _count: {
        utmSource: 'desc',
      },
    },
    take: 5,
  });

  return NextResponse.json({
    metrics: {
      pageViews: {
        value: currentMetrics._sum.pageViews || 0,
        previousValue: previousMetrics._sum.pageViews || 0,
      },
      visitors: {
        value: currentMetrics._sum.uniqueVisitors || 0,
        previousValue: previousMetrics._sum.uniqueVisitors || 0,
      },
      sessions: {
        value: currentMetrics._sum.sessions || 0,
        previousValue: previousMetrics._sum.sessions || 0,
      },
      avgSessionDuration: {
        value: currentMetrics._avg.avgSessionDuration || 0,
        previousValue: previousMetrics._avg.avgSessionDuration || 0,
      },
      bounceRate: {
        value: currentMetrics._avg.bounceRate || 0,
        previousValue: previousMetrics._avg.bounceRate || 0,
      },
      revenue: {
        value: Number(currentMetrics._sum.revenue) || 0,
        previousValue: Number(previousMetrics._sum.revenue) || 0,
      },
      transactions: {
        value: currentMetrics._sum.transactions || 0,
        previousValue: previousMetrics._sum.transactions || 0,
      },
      avgOrderValue: {
        value: Number(currentMetrics._avg.avgOrderValue) || 0,
        previousValue: Number(previousMetrics._avg.avgOrderValue) || 0,
      },
      newUsers: {
        value: currentMetrics._sum.newUsers || 0,
        previousValue: previousMetrics._sum.newUsers || 0,
      },
    },
    chartData,
    topPages: topPages.map((p) => ({
      pathname: p.pathname,
      views: p._count,
    })),
    trafficSources: trafficSources.map((s) => ({
      source: s.utmSource || 'Direct',
      sessions: s._count,
    })),
  });
}
```

### Dashboard Page

```tsx
// app/(dashboard)/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { 
  Users, Eye, Clock, TrendingUp, 
  DollarSign, ShoppingCart, MousePointerClick, ArrowDownUp 
} from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { AreaChart } from '@/components/charts/area-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { DateRangePicker } from '@/components/filters/date-range-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange?.from) params.set('startDate', dateRange.from.toISOString());
      if (dateRange?.to) params.set('endDate', dateRange.to.toISOString());
      
      const response = await fetch(`/api/analytics/overview?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const { metrics, chartData, topPages, trafficSources } = data || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Page Views"
          value={metrics?.pageViews.value || 0}
          previousValue={metrics?.pageViews.previousValue}
          icon={<Eye className="h-4 w-4" />}
          sparklineData={chartData?.map((d: any) => d.pageViews)}
        />
        <MetricCard
          title="Unique Visitors"
          value={metrics?.visitors.value || 0}
          previousValue={metrics?.visitors.previousValue}
          icon={<Users className="h-4 w-4" />}
          sparklineData={chartData?.map((d: any) => d.visitors)}
        />
        <MetricCard
          title="Revenue"
          value={metrics?.revenue.value || 0}
          previousValue={metrics?.revenue.previousValue}
          format="currency"
          icon={<DollarSign className="h-4 w-4" />}
          sparklineData={chartData?.map((d: any) => d.revenue)}
        />
        <MetricCard
          title="Bounce Rate"
          value={metrics?.bounceRate.value || 0}
          previousValue={metrics?.bounceRate.previousValue}
          format="percent"
          icon={<ArrowDownUp className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visitors">
              <TabsList>
                <TabsTrigger value="visitors">Visitors</TabsTrigger>
                <TabsTrigger value="pageviews">Page Views</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>
              <TabsContent value="visitors" className="pt-4">
                <AreaChart
                  data={chartData || []}
                  areas={[
                    { dataKey: 'visitors', name: 'Visitors', color: '#3b82f6' },
                  ]}
                />
              </TabsContent>
              <TabsContent value="pageviews" className="pt-4">
                <AreaChart
                  data={chartData || []}
                  areas={[
                    { dataKey: 'pageViews', name: 'Page Views', color: '#8b5cf6' },
                  ]}
                />
              </TabsContent>
              <TabsContent value="sessions" className="pt-4">
                <AreaChart
                  data={chartData || []}
                  areas={[
                    { dataKey: 'sessions', name: 'Sessions', color: '#10b981' },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={chartData || []}
              areas={[
                { dataKey: 'revenue', name: 'Revenue', color: '#22c55e' },
              ]}
              valueFormat="currency"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages?.map((page: any, index: number) => (
                <div key={page.pathname} className="flex items-center">
                  <span className="w-6 text-sm text-gray-500">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.pathname}</p>
                  </div>
                  <span className="font-semibold">{page.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={trafficSources?.map((s: any) => ({
                name: s.source,
                value: s.sessions,
              })) || []}
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## Related Skills

- [Charts](../patterns/charts.md) - Data visualization
- [Data Tables](../patterns/data-tables.md) - Tabular data
- [Date Range Picker](../patterns/date-range-picker.md) - Date selection
- [Export Data](../patterns/export-data.md) - Report export
- [Real-time Updates](../patterns/real-time-updates.md) - Live data

## Testing

### Unit Tests

```tsx
// __tests__/components/metric-card.test.tsx
import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/analytics/metric-card';

describe('MetricCard', () => {
  it('renders metric value correctly', () => {
    render(
      <MetricCard
        title="Page Views"
        value={12500}
        previousValue={10000}
      />
    );

    expect(screen.getByText('Page Views')).toBeInTheDocument();
    expect(screen.getByText('12.5K')).toBeInTheDocument();
  });

  it('calculates percentage change correctly', () => {
    render(
      <MetricCard
        title="Revenue"
        value={15000}
        previousValue={10000}
        format="currency"
      />
    );

    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('formats currency values', () => {
    render(
      <MetricCard
        title="Revenue"
        value={1250.50}
        format="currency"
      />
    );

    expect(screen.getByText('$1,250.50')).toBeInTheDocument();
  });

  it('shows negative trend indicator', () => {
    render(
      <MetricCard
        title="Bounce Rate"
        value={45}
        previousValue={50}
        format="percent"
      />
    );

    // Lower bounce rate is displayed (negative change)
    expect(screen.getByText('-10.0%')).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
// __tests__/pages/dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '@/app/(dashboard)/page';
import { mockAnalyticsData } from '@/test/fixtures';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAnalyticsData),
    });
  });

  it('loads and displays analytics data', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
    });

    expect(screen.getByText('Page Views')).toBeInTheDocument();
    expect(screen.getByText('Unique Visitors')).toBeInTheDocument();
  });

  it('updates data when date range changes', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    // Wait for initial load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Change date range would trigger new fetch
  });
});
```

### E2E Tests

```ts
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('displays key metrics', async ({ page }) => {
    await expect(page.locator('[data-testid="metric-pageviews"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-visitors"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-revenue"]')).toBeVisible();
  });

  test('date range picker updates charts', async ({ page }) => {
    await page.click('[data-testid="date-range-picker"]');
    await page.click('text=Last 7 days');

    // Verify API was called with correct date range
    await expect(page.locator('[data-testid="traffic-chart"]')).toBeVisible();
  });

  test('exports report as CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv"]');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.csv');
  });
});
```

## Error Handling

```tsx
// lib/analytics-errors.ts
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export const AnalyticsErrorCodes = {
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  DATA_FETCH_FAILED: 'DATA_FETCH_FAILED',
  AGGREGATION_FAILED: 'AGGREGATION_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

// Error boundary for charts
// components/analytics/chart-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart error:', error, errorInfo);
    // Report to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="h-[300px] flex items-center justify-center">
            <CardContent className="text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Failed to load chart data
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => this.setState({ hasError: false })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

// API error handling
// app/api/analytics/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsError, AnalyticsErrorCodes } from '@/lib/analytics-errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AnalyticsError(
          'Invalid date format',
          AnalyticsErrorCodes.INVALID_DATE_RANGE,
          400
        );
      }

      if (start > end) {
        throw new AnalyticsError(
          'Start date must be before end date',
          AnalyticsErrorCodes.INVALID_DATE_RANGE,
          400
        );
      }

      // Max 1 year range
      const maxRange = 365 * 24 * 60 * 60 * 1000;
      if (end.getTime() - start.getTime() > maxRange) {
        throw new AnalyticsError(
          'Date range cannot exceed 1 year',
          AnalyticsErrorCodes.INVALID_DATE_RANGE,
          400
        );
      }
    }

    // Fetch and return data...
  } catch (error) {
    if (error instanceof AnalyticsError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

## Accessibility

```tsx
// Accessible chart wrapper with descriptions
// components/charts/accessible-chart.tsx
'use client';

import { useId } from 'react';

interface AccessibleChartProps {
  title: string;
  description: string;
  data: Array<{ label: string; value: number }>;
  children: React.ReactNode;
}

export function AccessibleChart({
  title,
  description,
  data,
  children,
}: AccessibleChartProps) {
  const descId = useId();
  const tableId = useId();

  return (
    <div role="figure" aria-labelledby={descId}>
      <div id={descId} className="sr-only">
        {description}. Data summary: {data.map(d =>
          `${d.label}: ${d.value}`
        ).join(', ')}.
      </div>

      {/* Visual chart */}
      <div aria-hidden="true">
        {children}
      </div>

      {/* Screen reader accessible table */}
      <table id={tableId} className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Accessible date range picker
// components/filters/accessible-date-picker.tsx
export function AccessibleDateRangePicker({ value, onChange }) {
  return (
    <div role="group" aria-label="Date range selection">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-label={`Select date range. Currently: ${
              value?.from ? format(value.from, 'PP') : 'Start date'
            } to ${value?.to ? format(value.to, 'PP') : 'End date'}`}
            aria-expanded="false"
            aria-haspopup="dialog"
          >
            <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent role="dialog" aria-label="Choose date range">
          {/* Calendar content with keyboard navigation */}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Keyboard navigation for data tables
// Ensure all interactive elements are focusable
// Provide skip links for large data sets
```

### ARIA Guidelines for Dashboards

- Use `role="region"` with `aria-label` for dashboard sections
- Announce data updates with `aria-live="polite"` regions
- Provide text alternatives for all charts and visualizations
- Ensure color is not the only indicator (use patterns, labels)
- Support keyboard navigation for all interactive elements
- Maintain focus management when content updates

## Security

```tsx
// Input validation for analytics queries
// lib/validators/analytics.ts
import { z } from 'zod';

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date must be before end date',
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metrics: z.array(z.enum(['pageViews', 'visitors', 'sessions', 'revenue'])).optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  filters: z.record(z.string()).optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
});

// Rate limiting for analytics API
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
});

export async function analyticsRateLimit(userId: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `analytics:${userId}`
  );

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}

// Data access control
// lib/auth/permissions.ts
export async function canAccessAnalytics(userId: string, resourceId?: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, organizationId: true },
  });

  if (!user) return false;

  // Admin can access all
  if (user.role === 'admin') return true;

  // Check organization membership for specific resources
  if (resourceId) {
    const hasAccess = await db.analyticsAccess.findFirst({
      where: {
        userId,
        resourceId,
        OR: [
          { role: 'viewer' },
          { role: 'editor' },
          { role: 'admin' },
        ],
      },
    });
    return !!hasAccess;
  }

  return true;
}
```

### Security Checklist

- [ ] Validate all date range inputs server-side
- [ ] Implement rate limiting on analytics endpoints
- [ ] Sanitize filter parameters to prevent injection
- [ ] Use parameterized queries for database operations
- [ ] Implement row-level security for multi-tenant data
- [ ] Audit log access to sensitive analytics data
- [ ] Encrypt PII in analytics records
- [ ] Set appropriate CORS headers

## Performance

```tsx
// Optimized analytics queries with caching
// lib/analytics.ts
import { unstable_cache } from 'next/cache';

export const getAnalyticsOverview = unstable_cache(
  async (startDate: Date, endDate: Date) => {
    return prisma.dailyMetrics.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        pageViews: true,
        uniqueVisitors: true,
        sessions: true,
        revenue: true,
      },
    });
  },
  ['analytics-overview'],
  { revalidate: 300, tags: ['analytics'] } // 5 minute cache
);

// Streaming for large data sets
// app/(dashboard)/reports/[reportId]/page.tsx
import { Suspense } from 'react';

export default async function ReportPage({ params }) {
  return (
    <div>
      <Suspense fallback={<MetricsSkeleton />}>
        <ReportMetrics reportId={params.reportId} />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <ReportChart reportId={params.reportId} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <ReportDataTable reportId={params.reportId} />
      </Suspense>
    </div>
  );
}

// Virtual scrolling for large data tables
// components/analytics/virtualized-table.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedDataTable({ data, columns }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <TableRow
            key={virtualRow.key}
            data={data[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              height: `${virtualRow.size}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Chart data aggregation on server
// Reduce data points for large date ranges
function aggregateChartData(data: DailyMetric[], maxPoints = 100) {
  if (data.length <= maxPoints) return data;

  const factor = Math.ceil(data.length / maxPoints);
  const aggregated = [];

  for (let i = 0; i < data.length; i += factor) {
    const slice = data.slice(i, i + factor);
    aggregated.push({
      date: slice[0].date,
      pageViews: slice.reduce((sum, d) => sum + d.pageViews, 0),
      visitors: slice.reduce((sum, d) => sum + d.visitors, 0),
      revenue: slice.reduce((sum, d) => sum + Number(d.revenue), 0),
    });
  }

  return aggregated;
}
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard Load | < 2s | Time to interactive |
| Chart Render | < 500ms | First paint |
| Data Table | < 100ms | Sort/filter response |
| API Response | < 200ms | P95 latency |
| Cache Hit Rate | > 80% | Analytics queries |

## CI/CD

```yaml
# .github/workflows/analytics-dashboard.yml
name: Analytics Dashboard CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'app/(dashboard)/**'
      - 'components/analytics/**'
      - 'components/charts/**'
      - 'lib/analytics.ts'
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: analytics_test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/analytics_test

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/analytics_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    runs-on: ubuntu-latest
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

```tsx
// lib/monitoring/analytics.ts
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('analytics-dashboard');

export async function trackAnalyticsQuery(
  queryName: string,
  params: Record<string, unknown>,
  fn: () => Promise<unknown>
) {
  return tracer.startActiveSpan(`analytics.${queryName}`, async (span) => {
    span.setAttributes({
      'analytics.query': queryName,
      'analytics.params': JSON.stringify(params),
    });

    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

// Custom metrics for analytics performance
// lib/monitoring/metrics.ts
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('analytics-dashboard');

export const analyticsMetrics = {
  queryDuration: meter.createHistogram('analytics.query.duration', {
    description: 'Duration of analytics queries',
    unit: 'ms',
  }),

  cacheHitRate: meter.createCounter('analytics.cache.hits', {
    description: 'Number of cache hits for analytics queries',
  }),

  chartRenderTime: meter.createHistogram('analytics.chart.render', {
    description: 'Time to render charts',
    unit: 'ms',
  }),

  activeUsers: meter.createObservableGauge('analytics.users.active', {
    description: 'Number of active dashboard users',
  }),
};

// Dashboard health check endpoint
// app/api/health/dashboard/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkRedisConnection(),
    checkAnalyticsDataFreshness(),
  ]);

  const status = checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded';

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'ok' : 'error',
      redis: checks[1].status === 'fulfilled' ? 'ok' : 'error',
      dataFreshness: checks[2].status === 'fulfilled' ? 'ok' : 'stale',
    },
  });
}
```

### Key Metrics to Monitor

| Metric | Alert Threshold | Description |
|--------|-----------------|-------------|
| Query P95 Latency | > 500ms | Analytics query performance |
| Error Rate | > 1% | Failed analytics requests |
| Cache Hit Rate | < 70% | Query cache effectiveness |
| Data Freshness | > 1 hour | Time since last data update |
| Dashboard Load Time | > 3s | User experience metric |

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/analytics"

# Redis (for caching and rate limiting)
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Analytics Service (optional external analytics)
ANALYTICS_API_KEY=""
ANALYTICS_ENDPOINT=""

# Monitoring
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
OTEL_SERVICE_NAME="analytics-dashboard"
SENTRY_DSN=""

# Feature Flags
ENABLE_REALTIME_UPDATES="true"
ENABLE_EXPORT_FEATURE="true"
MAX_DATE_RANGE_DAYS="365"

# Rate Limiting
RATE_LIMIT_REQUESTS="100"
RATE_LIMIT_WINDOW="60"
```

### Environment-Specific Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `DATABASE_URL` | Local PostgreSQL | Staging RDS | Production RDS |
| `REDIS_URL` | Local Redis | Upstash | Upstash |
| `CACHE_TTL` | 60s | 300s | 300s |
| `LOG_LEVEL` | debug | info | warn |
| `RATE_LIMIT` | 1000/min | 200/min | 100/min |

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, e2e)
- [ ] Database migrations reviewed and tested
- [ ] Environment variables configured in deployment platform
- [ ] Cache warming strategy defined
- [ ] Rate limiting configured appropriately
- [ ] Error tracking configured (Sentry)
- [ ] Performance baseline established

### Database

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify indexes on frequently queried columns
- [ ] Set up read replicas for analytics queries
- [ ] Configure connection pooling (PgBouncer)
- [ ] Backfill DailyMetrics table if needed

### Caching

- [ ] Redis/Upstash configured and accessible
- [ ] Cache invalidation strategy implemented
- [ ] Cache warm-up script ready for initial deployment
- [ ] CDN configured for static assets

### Monitoring

- [ ] Health check endpoints responding
- [ ] Alerts configured for critical metrics
- [ ] Dashboard metrics visible in monitoring tool
- [ ] Log aggregation configured
- [ ] Tracing enabled for query analysis

### Security

- [ ] Authentication required for all dashboard routes
- [ ] API rate limiting active
- [ ] Input validation on all endpoints
- [ ] CORS configured correctly
- [ ] CSP headers set appropriately

### Post-Deployment

- [ ] Smoke test critical dashboard features
- [ ] Verify data accuracy in metrics
- [ ] Check chart rendering performance
- [ ] Monitor error rates for 24 hours
- [ ] Validate export functionality
- [ ] Test date range picker edge cases

### Rollback Plan

1. Revert to previous deployment version
2. Rollback database migrations if needed: `npx prisma migrate rollback`
3. Clear application cache
4. Notify stakeholders of rollback
5. Investigate root cause before re-attempting deployment

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with dashboard overview
- Multiple chart types (area, bar, line, pie)
- Data tables with sorting and filtering
- Date range picker with presets
- Comparison metrics with previous period
- API routes for analytics data
