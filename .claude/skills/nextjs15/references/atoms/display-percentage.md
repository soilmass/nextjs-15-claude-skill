---
id: a-display-percentage
name: Percentage Display
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Formatted percentage display with optional visualization
tags: [display, percentage, percent, format, visualization, progress]
performance:
  impact: low
  lcp: neutral
  cls: neutral
dependencies:
  - react
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Percentage Display

## Overview

A percentage display component that formats decimal values as percentages with optional visual indicators like progress bars or rings.

## Implementation

```tsx
// components/ui/percentage-display.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PercentageDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Value (0-1 as decimal or 0-100 as percentage) */
  value: number;
  /** Whether value is already a percentage (0-100) */
  isPercentage?: boolean;
  /** Locale for formatting */
  locale?: string;
  /** Decimal places */
  decimals?: number;
  /** Show sign for positive values */
  showPositiveSign?: boolean;
  /** Color based on value (positive=green, negative=red) */
  colorize?: boolean;
  /** Custom positive color class */
  positiveClass?: string;
  /** Custom negative color class */
  negativeClass?: string;
  /** Show visual indicator */
  showIndicator?: 'bar' | 'ring' | 'none';
  /** Indicator size */
  indicatorSize?: 'sm' | 'md' | 'lg';
}

const PercentageDisplay = React.forwardRef<HTMLSpanElement, PercentageDisplayProps>(
  (
    {
      value,
      isPercentage = false,
      locale = 'en-US',
      decimals = 1,
      showPositiveSign = false,
      colorize = false,
      positiveClass = 'text-green-600',
      negativeClass = 'text-red-600',
      showIndicator = 'none',
      indicatorSize = 'md',
      className,
      ...props
    },
    ref
  ) => {
    // Convert to percentage if needed
    const percentValue = isPercentage ? value : value * 100;
    
    const formatted = React.useMemo(() => {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        signDisplay: showPositiveSign ? 'exceptZero' : 'auto',
      });

      // Intl.NumberFormat expects decimal (0-1)
      return formatter.format(isPercentage ? value / 100 : value);
    }, [value, isPercentage, locale, decimals, showPositiveSign]);

    const colorClass = colorize
      ? percentValue > 0
        ? positiveClass
        : percentValue < 0
        ? negativeClass
        : ''
      : '';

    const indicatorSizes = {
      sm: { bar: 'h-1', ring: 'h-4 w-4' },
      md: { bar: 'h-2', ring: 'h-6 w-6' },
      lg: { bar: 'h-3', ring: 'h-8 w-8' },
    };

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center gap-2', colorClass, className)}
        {...props}
      >
        {showIndicator === 'bar' && (
          <span
            className={cn(
              'w-16 overflow-hidden rounded-full bg-muted',
              indicatorSizes[indicatorSize].bar
            )}
          >
            <span
              className={cn(
                'block h-full rounded-full transition-all',
                percentValue >= 0 ? 'bg-primary' : 'bg-destructive'
              )}
              style={{ width: `${Math.min(Math.abs(percentValue), 100)}%` }}
            />
          </span>
        )}

        {showIndicator === 'ring' && (
          <PercentageRing
            value={Math.min(Math.abs(percentValue), 100)}
            size={indicatorSize}
            className={percentValue >= 0 ? 'text-primary' : 'text-destructive'}
          />
        )}

        <span>{formatted}</span>
      </span>
    );
  }
);
PercentageDisplay.displayName = 'PercentageDisplay';

// Ring indicator component
function PercentageRing({
  value,
  size,
  className,
}: {
  value: number;
  size: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: { size: 16, stroke: 2 },
    md: { size: 24, stroke: 2.5 },
    lg: { size: 32, stroke: 3 },
  };

  const { size: svgSize, stroke } = sizes[size];
  const radius = (svgSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      width={svgSize}
      height={svgSize}
      className={cn('rotate-[-90deg]', className)}
    >
      <circle
        cx={svgSize / 2}
        cy={svgSize / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="opacity-20"
      />
      <circle
        cx={svgSize / 2}
        cy={svgSize / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}

export { PercentageDisplay, PercentageRing };
```

## Variants

### Basic Percentage

```tsx
// From decimal (0.75 → 75%)
<PercentageDisplay value={0.75} />

// From percentage (75 → 75%)
<PercentageDisplay value={75} isPercentage />
```

### Change Indicator

```tsx
function ChangeIndicator({ change }: { change: number }) {
  return (
    <PercentageDisplay
      value={change}
      isPercentage
      showPositiveSign
      colorize
      decimals={2}
    />
  );
}

// +12.50% (green)
// -8.25% (red)
// 0.00%
```

### With Progress Bar

```tsx
function ProgressPercentage({ value }: { value: number }) {
  return (
    <PercentageDisplay
      value={value}
      isPercentage
      showIndicator="bar"
      indicatorSize="md"
    />
  );
}
```

### With Ring Indicator

```tsx
function CompletionPercentage({ value }: { value: number }) {
  return (
    <PercentageDisplay
      value={value}
      isPercentage
      showIndicator="ring"
      indicatorSize="lg"
      decimals={0}
    />
  );
}
```

### Stat Card

```tsx
function PercentageStat({
  label,
  value,
  previousValue,
}: {
  label: string;
  value: number;
  previousValue: number;
}) {
  const change = ((value - previousValue) / previousValue) * 100;

  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold">
          <PercentageDisplay value={value} isPercentage decimals={0} />
        </span>
        <PercentageDisplay
          value={change}
          isPercentage
          showPositiveSign
          colorize
          decimals={1}
          className="text-sm"
        />
      </div>
    </div>
  );
}
```

## Usage

```tsx
import { PercentageDisplay } from '@/components/ui/percentage-display';

// Basic
<PercentageDisplay value={0.85} />

// With options
<PercentageDisplay
  value={-12.5}
  isPercentage
  showPositiveSign
  colorize
  decimals={2}
/>

// With visual indicator
<PercentageDisplay
  value={75}
  isPercentage
  showIndicator="bar"
/>
```

## Related Skills

- [feedback-progress](./feedback-progress.md) - Progress bars
- [stat-card](../molecules/stat-card.md) - Statistics display
- [chart](../organisms/chart.md) - Data visualization

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Bar and ring indicators
- Colorization support
