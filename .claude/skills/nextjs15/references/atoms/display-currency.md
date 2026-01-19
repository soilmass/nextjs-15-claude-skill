---
id: a-display-currency
name: Currency Display
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Formatted currency display with locale and symbol support
tags: [display, currency, money, price, format, locale, intl]
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

# Currency Display

## Overview

A currency display component that formats monetary values according to locale and currency specifications. Supports multiple currencies, compact notation, and various display styles.

## Implementation

```tsx
// components/ui/currency-display.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CurrencyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Amount to display (can be cents or dollars based on `inCents`) */
  amount: number;
  /** Currency code (ISO 4217) */
  currency?: string;
  /** Locale for formatting */
  locale?: string;
  /** Whether amount is in cents (will divide by 100) */
  inCents?: boolean;
  /** Display style */
  display?: 'symbol' | 'code' | 'name' | 'narrowSymbol';
  /** Notation style */
  notation?: 'standard' | 'compact' | 'scientific' | 'engineering';
  /** Minimum fraction digits */
  minimumFractionDigits?: number;
  /** Maximum fraction digits */
  maximumFractionDigits?: number;
  /** Show positive/negative sign */
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
  /** Custom styling for different parts */
  parts?: {
    symbol?: string;
    integer?: string;
    decimal?: string;
    fraction?: string;
  };
}

const CurrencyDisplay = React.forwardRef<HTMLSpanElement, CurrencyDisplayProps>(
  (
    {
      amount,
      currency = 'USD',
      locale = 'en-US',
      inCents = false,
      display = 'symbol',
      notation = 'standard',
      minimumFractionDigits,
      maximumFractionDigits,
      signDisplay = 'auto',
      parts,
      className,
      ...props
    },
    ref
  ) => {
    const value = inCents ? amount / 100 : amount;

    const formatted = React.useMemo(() => {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: display,
        notation,
        minimumFractionDigits,
        maximumFractionDigits,
        signDisplay,
      });

      if (parts) {
        // Return formatted parts for custom styling
        return formatter.formatToParts(value);
      }

      return formatter.format(value);
    }, [value, currency, locale, display, notation, minimumFractionDigits, maximumFractionDigits, signDisplay, parts]);

    // Render with custom part styling
    if (parts && Array.isArray(formatted)) {
      return (
        <span ref={ref} className={cn(className)} {...props}>
          {formatted.map((part, i) => {
            const partClass = parts[part.type as keyof typeof parts];
            return partClass ? (
              <span key={i} className={partClass}>
                {part.value}
              </span>
            ) : (
              part.value
            );
          })}
        </span>
      );
    }

    return (
      <span ref={ref} className={cn(className)} {...props}>
        {formatted}
      </span>
    );
  }
);
CurrencyDisplay.displayName = 'CurrencyDisplay';

export { CurrencyDisplay };
```

## Variants

### Basic Price

```tsx
function Price({ amount }: { amount: number }) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency="USD"
    />
  );
}

// $99.99
```

### Price from Cents

```tsx
function PriceFromCents({ cents }: { cents: number }) {
  return (
    <CurrencyDisplay
      amount={cents}
      currency="USD"
      inCents
    />
  );
}

// Input: 9999 → Output: $99.99
```

### Compact Notation

```tsx
function CompactPrice({ amount }: { amount: number }) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency="USD"
      notation="compact"
    />
  );
}

// $1.2M, $500K, $1.5B
```

### Multi-Currency Support

```tsx
function MultiCurrencyPrice({ 
  amount, 
  currency,
  locale 
}: { 
  amount: number; 
  currency: string;
  locale: string;
}) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency={currency}
      locale={locale}
    />
  );
}

// USD: $99.99
// EUR: €99.99 (or 99,99 € for de-DE)
// GBP: £99.99
// JPY: ¥100
// INR: ₹99.99
```

### Styled Price (Large/Small Parts)

```tsx
function StyledPrice({ amount }: { amount: number }) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency="USD"
      className="text-2xl font-bold"
      parts={{
        currency: 'text-lg align-top',
        integer: 'text-2xl',
        decimal: 'text-base',
        fraction: 'text-base align-top',
      }}
    />
  );
}
```

### Price with Original (Sale)

```tsx
function SalePrice({
  originalPrice,
  salePrice,
}: {
  originalPrice: number;
  salePrice: number;
}) {
  const discount = Math.round((1 - salePrice / originalPrice) * 100);

  return (
    <div className="flex items-center gap-2">
      <CurrencyDisplay
        amount={salePrice}
        currency="USD"
        className="text-lg font-bold text-green-600"
      />
      <CurrencyDisplay
        amount={originalPrice}
        currency="USD"
        className="text-sm text-muted-foreground line-through"
      />
      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
        -{discount}%
      </span>
    </div>
  );
}
```

### Price Range

```tsx
function PriceRange({
  minPrice,
  maxPrice,
  currency = 'USD',
}: {
  minPrice: number;
  maxPrice: number;
  currency?: string;
}) {
  if (minPrice === maxPrice) {
    return <CurrencyDisplay amount={minPrice} currency={currency} />;
  }

  return (
    <span>
      <CurrencyDisplay amount={minPrice} currency={currency} />
      {' – '}
      <CurrencyDisplay amount={maxPrice} currency={currency} />
    </span>
  );
}
```

### Free Price Badge

```tsx
function PriceWithFree({ amount }: { amount: number }) {
  if (amount === 0) {
    return (
      <span className="font-semibold text-green-600">Free</span>
    );
  }

  return (
    <CurrencyDisplay
      amount={amount}
      currency="USD"
      className="font-semibold"
    />
  );
}
```

### Accounting Format

```tsx
function AccountingCurrency({ amount }: { amount: number }) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency="USD"
      signDisplay={amount < 0 ? 'never' : 'auto'}
      className={cn(
        'font-mono',
        amount < 0 && 'text-red-600'
      )}
    />
  );
}

// Negative shown as ($99.99) or -$99.99
```

### Currency Selector Preview

```tsx
'use client';

import * as React from 'react';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const currencies = [
  { code: 'USD', locale: 'en-US', name: 'US Dollar' },
  { code: 'EUR', locale: 'de-DE', name: 'Euro' },
  { code: 'GBP', locale: 'en-GB', name: 'British Pound' },
  { code: 'JPY', locale: 'ja-JP', name: 'Japanese Yen' },
  { code: 'CAD', locale: 'en-CA', name: 'Canadian Dollar' },
  { code: 'AUD', locale: 'en-AU', name: 'Australian Dollar' },
];

function CurrencyPreview({ amount }: { amount: number }) {
  const [selected, setSelected] = React.useState('USD');
  const currency = currencies.find((c) => c.code === selected)!;

  return (
    <div className="space-y-4">
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.code} - {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="text-3xl font-bold">
        <CurrencyDisplay
          amount={amount}
          currency={currency.code}
          locale={currency.locale}
        />
      </div>
    </div>
  );
}
```

### Subscription Pricing

```tsx
function SubscriptionPrice({
  amount,
  interval,
}: {
  amount: number;
  interval: 'month' | 'year';
}) {
  return (
    <div className="flex items-baseline gap-1">
      <CurrencyDisplay
        amount={amount}
        currency="USD"
        className="text-3xl font-bold"
      />
      <span className="text-muted-foreground">
        /{interval === 'month' ? 'mo' : 'yr'}
      </span>
    </div>
  );
}
```

## Server Component Version

```tsx
// For server components
interface ServerCurrencyProps {
  amount: number;
  currency?: string;
  locale?: string;
  inCents?: boolean;
  className?: string;
}

export function ServerCurrency({
  amount,
  currency = 'USD',
  locale = 'en-US',
  inCents = false,
  className,
}: ServerCurrencyProps) {
  const value = inCents ? amount / 100 : amount;
  
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);

  return <span className={className}>{formatted}</span>;
}
```

## Accessibility

- Uses semantic `<span>` with properly formatted text
- Screen readers can parse the formatted currency
- Negative values are clearly indicated

## Related Skills

- [number-formatting](../patterns/number-formatting.md) - Number formatting utilities
- [pricing](../organisms/pricing.md) - Pricing component
- [checkout-summary](../organisms/checkout-summary.md) - Cart totals

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Multi-currency support
- Compact notation
- Custom part styling
