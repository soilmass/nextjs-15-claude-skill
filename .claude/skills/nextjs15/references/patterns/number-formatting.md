---
id: pt-number-formatting
name: Number Formatting Patterns
version: 2.0.0
layer: L5
category: i18n
description: Locale-aware number, currency, and percentage formatting for international applications
tags: [i18n, numbers, currency, formatting, localization, intl]
composes: []
dependencies:
  intl: "^1.2.5"
formula: Intl.NumberFormat + Locale + Currency/Percent/Unit Options = Locale-Aware Numbers
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## When to Use

- Displaying prices and currency values with proper locale formatting
- Showing statistics with compact notation (1K, 1M, 1B) for different locales
- Formatting percentages, file sizes, or unit measurements
- Building number input components that accept locale-specific formats
- Creating dashboards with locale-aware metrics and statistics

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    NUMBER FORMATTING                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                    Input Value                        │      │
│  │         1234567.89 (raw number)                       │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               Format Options                          │      │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────────────┐ │      │
│  │  │  decimal   │  │ currency │  │     percent      │ │      │
│  │  │  compact   │  │   unit   │  │   scientific     │ │      │
│  │  └────────────┘  └──────────┘  └──────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Locale-Specific Output                   │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │  en-US: 1,234,567.89  |  de-DE: 1.234.567,89  │   │      │
│  │  │  fr-FR: 1 234 567,89  |  ja-JP: 1,234,567.89  │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │  Currency: $1,234.56 | 1.234,56 € | ¥1,234    │   │      │
│  │  │  Compact:  1.2M | 1,2 Mio. | 123.4万          │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                  Components                           │      │
│  │  ┌─────────┐  ┌─────────────┐  ┌──────────────────┐ │      │
│  │  │  Price  │  │ CompactNum  │  │   NumberInput    │ │      │
│  │  │  Stats  │  │  FileSize   │  │   UnitValue      │ │      │
│  │  └─────────┘  └─────────────┘  └──────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Number Formatting Patterns

## Overview

Number formatting varies significantly across locales (decimal separators, digit grouping, currency symbols). This pattern ensures numbers are displayed correctly for each user's locale.

## Implementation

### Basic Number Formatting

```typescript
// components/formatted-number.tsx
"use client";

import { useFormatter } from "next-intl";

interface FormattedNumberProps {
  value: number;
  style?: "decimal" | "percent" | "currency";
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: "standard" | "scientific" | "engineering" | "compact";
}

export function FormattedNumber({
  value,
  style = "decimal",
  currency = "USD",
  minimumFractionDigits,
  maximumFractionDigits,
  notation = "standard",
}: FormattedNumberProps) {
  const format = useFormatter();

  const options: Intl.NumberFormatOptions = {
    style,
    notation,
    minimumFractionDigits,
    maximumFractionDigits,
  };

  if (style === "currency") {
    options.currency = currency;
  }

  return <span>{format.number(value, options)}</span>;
}

// Usage examples:
// <FormattedNumber value={1234567.89} />
// English (US): 1,234,567.89
// German: 1.234.567,89
// French: 1 234 567,89

// <FormattedNumber value={0.156} style="percent" />
// English: 16%
// German: 16 %

// <FormattedNumber value={1234.56} style="currency" currency="EUR" />
// English: €1,234.56
// German: 1.234,56 €
```

### Currency Formatting

```typescript
// components/price.tsx
"use client";

import { useFormatter, useLocale } from "next-intl";

interface PriceProps {
  amount: number;
  currency?: string;
  showCents?: boolean;
  strikethrough?: boolean;
}

export function Price({
  amount,
  currency = "USD",
  showCents = true,
  strikethrough = false,
}: PriceProps) {
  const format = useFormatter();

  const formatted = format.number(amount, {
    style: "currency",
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  if (strikethrough) {
    return (
      <span className="line-through text-muted-foreground">{formatted}</span>
    );
  }

  return <span>{formatted}</span>;
}

// Price with discount
interface PriceWithDiscountProps {
  price: number;
  originalPrice?: number;
  currency?: string;
}

export function PriceWithDiscount({
  price,
  originalPrice,
  currency = "USD",
}: PriceWithDiscountProps) {
  const format = useFormatter();

  const discount = originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold">
        <Price amount={price} currency={currency} />
      </span>

      {originalPrice && originalPrice > price && (
        <>
          <Price
            amount={originalPrice}
            currency={currency}
            strikethrough
          />
          <span className="text-sm font-medium text-green-600">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
```

### Compact Number Formatting

```typescript
// components/compact-number.tsx
"use client";

import { useFormatter } from "next-intl";

interface CompactNumberProps {
  value: number;
  maximumFractionDigits?: number;
}

export function CompactNumber({
  value,
  maximumFractionDigits = 1,
}: CompactNumberProps) {
  const format = useFormatter();

  return (
    <span>
      {format.number(value, {
        notation: "compact",
        maximumFractionDigits,
      })}
    </span>
  );
}

// Usage:
// <CompactNumber value={1234} />      → "1.2K"
// <CompactNumber value={1234567} />   → "1.2M"
// <CompactNumber value={1234567890} /> → "1.2B"

// Locale differences:
// English: 1.2K, 1.2M, 1.2B
// German: 1,2 Tsd., 1,2 Mio., 1,2 Mrd.
// Japanese: 1234, 123.4万, 12.3億
```

### Statistics Display

```typescript
// components/stats-card.tsx
"use client";

import { useFormatter } from "next-intl";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  previousValue?: number;
  format?: "number" | "currency" | "percent";
  currency?: string;
}

export function StatsCard({
  label,
  value,
  previousValue,
  format = "number",
  currency = "USD",
}: StatsCardProps) {
  const formatter = useFormatter();

  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatter.number(val, {
          style: "currency",
          currency,
          notation: "compact",
          maximumFractionDigits: 1,
        });
      case "percent":
        return formatter.number(val, {
          style: "percent",
          maximumFractionDigits: 1,
        });
      default:
        return formatter.number(val, {
          notation: "compact",
          maximumFractionDigits: 1,
        });
    }
  };

  const change = previousValue
    ? ((value - previousValue) / previousValue)
    : 0;

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <div className="p-6 border rounded-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{formatValue(value)}</p>

      {previousValue !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 mt-2 text-sm",
            change > 0 && "text-green-600",
            change < 0 && "text-red-600",
            change === 0 && "text-muted-foreground"
          )}
        >
          <TrendIcon className="h-4 w-4" />
          <span>
            {formatter.number(Math.abs(change), {
              style: "percent",
              maximumFractionDigits: 1,
            })}
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}
```

### Number Input with Locale Formatting

```typescript
// components/number-input.tsx
"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  currency,
  className,
}: NumberInputProps) {
  const locale = useLocale();
  const [displayValue, setDisplayValue] = useState(
    formatForDisplay(value, locale, currency)
  );

  const parseNumber = useCallback(
    (str: string): number => {
      // Get locale-specific separators
      const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
      const groupSeparator = parts.find((p) => p.type === "group")?.value || ",";
      const decimalSeparator = parts.find((p) => p.type === "decimal")?.value || ".";

      // Remove currency symbols and group separators
      let cleaned = str
        .replace(/[^\d.,\-]/g, "")
        .replace(new RegExp(`\\${groupSeparator}`, "g"), "");

      // Convert decimal separator to standard period
      if (decimalSeparator !== ".") {
        cleaned = cleaned.replace(decimalSeparator, ".");
      }

      return parseFloat(cleaned) || 0;
    },
    [locale]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);

    const numericValue = parseNumber(rawValue);
    if (!isNaN(numericValue)) {
      const clampedValue = Math.max(
        min ?? -Infinity,
        Math.min(max ?? Infinity, numericValue)
      );
      onChange(clampedValue);
    }
  };

  const handleBlur = () => {
    setDisplayValue(formatForDisplay(value, locale, currency));
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}

function formatForDisplay(
  value: number,
  locale: string,
  currency?: string
): string {
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  }
  return new Intl.NumberFormat(locale).format(value);
}
```

### Unit Formatting

```typescript
// components/unit-value.tsx
"use client";

import { useFormatter, useLocale } from "next-intl";

type Unit =
  | "byte"
  | "kilobyte"
  | "megabyte"
  | "gigabyte"
  | "terabyte"
  | "meter"
  | "kilometer"
  | "mile"
  | "kilogram"
  | "pound"
  | "celsius"
  | "fahrenheit";

interface UnitValueProps {
  value: number;
  unit: Unit;
  style?: "long" | "short" | "narrow";
}

export function UnitValue({
  value,
  unit,
  style = "short",
}: UnitValueProps) {
  const locale = useLocale();

  const formatted = new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: style,
  }).format(value);

  return <span>{formatted}</span>;
}

// File size formatter
export function FileSize({ bytes }: { bytes: number }) {
  const locale = useLocale();

  const units: [number, Unit][] = [
    [1024 ** 4, "terabyte"],
    [1024 ** 3, "gigabyte"],
    [1024 ** 2, "megabyte"],
    [1024, "kilobyte"],
    [0, "byte"],
  ];

  for (const [threshold, unit] of units) {
    if (bytes >= threshold) {
      const value = threshold > 0 ? bytes / threshold : bytes;
      return (
        <span>
          {new Intl.NumberFormat(locale, {
            style: "unit",
            unit,
            unitDisplay: "short",
            maximumFractionDigits: 1,
          }).format(value)}
        </span>
      );
    }
  }

  return <span>0 B</span>;
}

// Usage:
// <FileSize bytes={1536} /> → "1.5 kB"
// <FileSize bytes={1073741824} /> → "1 GB"
```

### Number Formatting Hook

```typescript
// hooks/use-number-format.ts
"use client";

import { useFormatter, useLocale } from "next-intl";

export function useNumberFormat() {
  const format = useFormatter();
  const locale = useLocale();

  return {
    // Basic number
    number: (value: number, options?: Intl.NumberFormatOptions) =>
      format.number(value, options),

    // Integer (no decimals)
    integer: (value: number) =>
      format.number(value, {
        maximumFractionDigits: 0,
      }),

    // Decimal with fixed places
    decimal: (value: number, places = 2) =>
      format.number(value, {
        minimumFractionDigits: places,
        maximumFractionDigits: places,
      }),

    // Currency
    currency: (value: number, currency = "USD") =>
      format.number(value, {
        style: "currency",
        currency,
      }),

    // Currency compact
    currencyCompact: (value: number, currency = "USD") =>
      format.number(value, {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
      }),

    // Percentage
    percent: (value: number, decimals = 0) =>
      format.number(value, {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),

    // Compact (K, M, B)
    compact: (value: number) =>
      format.number(value, {
        notation: "compact",
        maximumFractionDigits: 1,
      }),

    // Ordinal (1st, 2nd, 3rd)
    ordinal: (value: number) => {
      const pr = new Intl.PluralRules(locale, { type: "ordinal" });
      const suffixes: Record<string, string> = {
        one: "st",
        two: "nd",
        few: "rd",
        other: "th",
      };
      const rule = pr.select(value);
      return `${value}${suffixes[rule] || suffixes.other}`;
    },

    // Range
    range: (start: number, end: number) =>
      new Intl.NumberFormat(locale).formatRange(start, end),
  };
}

// Usage
function ProductStats() {
  const fmt = useNumberFormat();

  return (
    <div>
      <p>Price: {fmt.currency(99.99)}</p>
      <p>Discount: {fmt.percent(0.25)}</p>
      <p>Sold: {fmt.compact(1234567)}</p>
      <p>Rating: {fmt.decimal(4.7, 1)}/5</p>
      <p>Rank: {fmt.ordinal(3)}</p>
    </div>
  );
}
```

## Variants

### Server-Side Formatting

```typescript
// app/[locale]/stats/page.tsx
import { getFormatter } from "next-intl/server";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const format = await getFormatter({ locale });

  const stats = await getStats();

  return (
    <div>
      <p>Revenue: {format.number(stats.revenue, { style: "currency", currency: "USD" })}</p>
      <p>Users: {format.number(stats.users, { notation: "compact" })}</p>
    </div>
  );
}
```

## Anti-patterns

1. **Hardcoded separators**: Using `.` or `,` directly
2. **String concatenation**: `"$" + price` instead of proper formatting
3. **Ignoring locale**: Same format for all users
4. **Rounding errors**: Not handling floating point properly
5. **Missing currency codes**: Using symbols without codes

## Related Skills

- `L5/patterns/i18n-routing` - Locale-based routing
- `L5/patterns/translations` - Translation management
- `L5/patterns/date-formatting` - Date formatting
- `L5/patterns/locale-detection` - Detecting user locale

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with next-intl
