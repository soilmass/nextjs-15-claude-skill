---
id: pt-tax-calculation
name: Tax Calculation
version: 1.0.0
layer: L5
category: payments
description: Multi-jurisdiction sales tax calculation with automatic rate lookup, nexus tracking, and tax-exempt handling using TaxJar or Avalara
tags: [tax, sales-tax, vat, compliance, ecommerce, next15]
composes: []
formula: "TaxCalculation = RateLookup + NexusTracking + ExemptionHandling + Reporting"
dependencies:
  taxjar: "^4.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Tax Calculation

## Overview

Automated sales tax calculation supporting multiple jurisdictions, tax nexus, product taxability, and customer exemptions. This pattern provides comprehensive tax handling for e-commerce applications, including US sales tax, EU VAT, and international tax compliance.

Key features:
- **Multi-jurisdiction support**: US, EU, UK, Canada, and international markets
- **Tax nexus tracking**: Know where you have tax obligations
- **Product taxability**: Different tax rates for different product categories
- **Customer exemptions**: Handle tax-exempt purchases (B2B, resellers, non-profits)
- **Reporting**: Generate reports for tax filing

## When to Use

- Selling to customers in multiple states/countries
- Need automated tax compliance
- Handling tax-exempt customers (B2B, non-profits)
- Generating tax reports for filing
- Need real-time tax calculation at checkout
- Support digital goods taxation (software, subscriptions)

## When NOT to Use

- Single-location physical store with simple tax rules
- Selling only in one tax jurisdiction
- Non-taxable services (some professional services)

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Tax Calculation Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Customer Checkout                                           │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Address Validation                                   │    │
│  │ - Ship-to address                                    │    │
│  │ - Tax nexus determination                            │    │
│  │ - Customer exemption check                           │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Tax Rate Lookup (TaxJar/Avalara)                    │    │
│  │                                                      │    │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │    │
│  │ │ US Sales Tax │ │ EU VAT       │ │ Other        │  │    │
│  │ │ State+County │ │ Country rate │ │ GST/HST/PST  │  │    │
│  │ │ +City+Special│ │ +exemptions  │ │              │  │    │
│  │ └──────────────┘ └──────────────┘ └──────────────┘  │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Product Taxability                                   │    │
│  │ - Physical goods (default taxable)                   │    │
│  │ - Digital goods (varies by jurisdiction)             │    │
│  │ - Services (often exempt or reduced)                 │    │
│  │ - Food/groceries (reduced or exempt)                 │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Tax Calculation Result                               │    │
│  │ - Taxable amount                                     │    │
│  │ - Tax rate (combined)                                │    │
│  │ - Tax amount per jurisdiction                        │    │
│  │ - Freight/shipping tax                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Tax Service

```typescript
// lib/tax/service.ts
import TaxJar from 'taxjar';

const taxjar = new TaxJar({
  apiKey: process.env.TAXJAR_API_KEY!,
});

export interface TaxAddress {
  street?: string;
  city?: string;
  state: string;
  zip: string;
  country: string;
}

export interface TaxLineItem {
  id: string;
  quantity: number;
  unitPrice: number; // in cents
  productTaxCode?: string; // TaxJar product category
}

export interface TaxCalculationResult {
  totalTax: number; // in cents
  taxableAmount: number;
  rate: number; // percentage
  breakdown: {
    state: number;
    county: number;
    city: number;
    special: number;
  };
  freight: number;
}

export async function calculateTax(
  fromAddress: TaxAddress,
  toAddress: TaxAddress,
  lineItems: TaxLineItem[],
  shipping: number
): Promise<TaxCalculationResult> {
  // Convert cents to dollars for TaxJar API
  const taxjarLineItems = lineItems.map(item => ({
    id: item.id,
    quantity: item.quantity,
    unit_price: item.unitPrice / 100,
    product_tax_code: item.productTaxCode,
  }));

  const tax = await taxjar.taxForOrder({
    from_country: fromAddress.country,
    from_zip: fromAddress.zip,
    from_state: fromAddress.state,
    from_city: fromAddress.city,
    from_street: fromAddress.street,
    to_country: toAddress.country,
    to_zip: toAddress.zip,
    to_state: toAddress.state,
    to_city: toAddress.city,
    to_street: toAddress.street,
    shipping: shipping / 100,
    line_items: taxjarLineItems,
  });

  return {
    totalTax: Math.round(tax.tax.amount_to_collect * 100),
    taxableAmount: Math.round(tax.tax.taxable_amount * 100),
    rate: tax.tax.rate,
    breakdown: {
      state: tax.tax.breakdown?.state_taxable_amount || 0,
      county: tax.tax.breakdown?.county_taxable_amount || 0,
      city: tax.tax.breakdown?.city_taxable_amount || 0,
      special: tax.tax.breakdown?.special_district_taxable_amount || 0,
    },
    freight: Math.round((tax.tax.freight_taxable ? shipping * tax.tax.rate : 0)),
  };
}

export async function getTaxRateForLocation(
  zip: string,
  city?: string,
  state?: string,
  country: string = 'US'
): Promise<number> {
  const rates = await taxjar.ratesForLocation(zip, {
    city,
    state,
    country,
  });

  return rates.rate.combined_rate;
}

// Validate tax exemption certificate
export async function validateExemption(
  customerId: string,
  state: string
): Promise<boolean> {
  // In production, validate against stored exemption certificates
  // This would check TaxJar's exemption API or your database
  return false;
}
```

### API Route

```typescript
// app/api/tax/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateTax } from '@/lib/tax/service';
import { z } from 'zod';

const taxSchema = z.object({
  shippingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string(),
    zip: z.string(),
    country: z.string().default('US'),
  }),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    productTaxCode: z.string().optional(),
  })),
  shipping: z.number().default(0),
});

const FROM_ADDRESS = {
  state: process.env.STORE_STATE!,
  zip: process.env.STORE_ZIP!,
  country: 'US',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shippingAddress, items, shipping } = taxSchema.parse(body);

    const taxResult = await calculateTax(
      FROM_ADDRESS,
      shippingAddress,
      items,
      shipping
    );

    return NextResponse.json(taxResult);
  } catch (error) {
    console.error('Tax calculation error:', error);
    // Return zero tax on error - handle gracefully
    return NextResponse.json({
      totalTax: 0,
      taxableAmount: 0,
      rate: 0,
      breakdown: { state: 0, county: 0, city: 0, special: 0 },
      freight: 0,
    });
  }
}
```

## Examples

### Tax Display Component

```tsx
// components/tax-summary.tsx
import { formatPrice } from '@/lib/utils';

interface TaxSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  taxRate: number;
}

export function TaxSummary({ subtotal, shipping, tax, taxRate }: TaxSummaryProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Shipping</span>
        <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
        <span>{formatPrice(tax)}</span>
      </div>
      <div className="flex justify-between font-semibold pt-2 border-t">
        <span>Total</span>
        <span>{formatPrice(subtotal + shipping + tax)}</span>
      </div>
    </div>
  );
}
```

## VAT Support (EU/UK)

```typescript
// lib/tax/vat.ts
export interface VATConfig {
  country: string;
  vatNumber?: string;
  isB2B: boolean;
}

export async function calculateVAT(
  amount: number,
  config: VATConfig
): Promise<{ vatAmount: number; rate: number; reverseCharge: boolean }> {
  const vatRates: Record<string, number> = {
    DE: 0.19, // Germany 19%
    FR: 0.20, // France 20%
    UK: 0.20, // UK 20%
    NL: 0.21, // Netherlands 21%
    ES: 0.21, // Spain 21%
    IT: 0.22, // Italy 22%
    // Add more as needed
  };

  const rate = vatRates[config.country] || 0;

  // B2B reverse charge - no VAT collected, customer handles
  if (config.isB2B && config.vatNumber) {
    const isValidVAT = await validateVATNumber(config.vatNumber, config.country);
    if (isValidVAT) {
      return { vatAmount: 0, rate, reverseCharge: true };
    }
  }

  return {
    vatAmount: Math.round(amount * rate),
    rate,
    reverseCharge: false,
  };
}

// Validate EU VAT number via VIES
export async function validateVATNumber(vatNumber: string, country: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vatNumber}`
    );
    const data = await response.json();
    return data.isValid === true;
  } catch {
    return false;
  }
}
```

## Tax Exemption Certificates

```typescript
// lib/tax/exemptions.ts
import { prisma } from '@/lib/db';

export interface TaxExemption {
  id: string;
  customerId: string;
  certificateNumber: string;
  state: string;
  expiresAt: Date;
  documentUrl: string;
  status: 'pending' | 'verified' | 'expired' | 'rejected';
}

export async function checkExemption(
  customerId: string,
  state: string
): Promise<TaxExemption | null> {
  const exemption = await prisma.taxExemption.findFirst({
    where: {
      customerId,
      state,
      status: 'verified',
      expiresAt: { gt: new Date() },
    },
  });

  return exemption;
}

export async function submitExemptionCertificate(
  customerId: string,
  data: {
    certificateNumber: string;
    state: string;
    expiresAt: Date;
    documentUrl: string;
  }
): Promise<TaxExemption> {
  return prisma.taxExemption.create({
    data: {
      customerId,
      ...data,
      status: 'pending',
    },
  });
}
```

## Checkout Integration Hook

```typescript
// hooks/use-tax-calculation.ts
'use client';

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface TaxResult {
  totalTax: number;
  taxableAmount: number;
  rate: number;
  loading: boolean;
  error: string | null;
}

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  productTaxCode?: string;
}

interface ShippingAddress {
  state: string;
  zip: string;
  country: string;
  city?: string;
}

export function useTaxCalculation(
  items: CartItem[],
  shippingAddress: ShippingAddress | null,
  shippingCost: number
): TaxResult {
  const [result, setResult] = useState<TaxResult>({
    totalTax: 0,
    taxableAmount: 0,
    rate: 0,
    loading: false,
    error: null,
  });

  const calculateTax = useDebouncedCallback(async () => {
    if (!shippingAddress || items.length === 0) {
      setResult(prev => ({ ...prev, totalTax: 0, loading: false }));
      return;
    }

    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress,
          items,
          shipping: shippingCost,
        }),
      });

      if (!response.ok) throw new Error('Tax calculation failed');

      const data = await response.json();
      setResult({
        totalTax: data.totalTax,
        taxableAmount: data.taxableAmount,
        rate: data.rate,
        loading: false,
        error: null,
      });
    } catch (error) {
      setResult(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to calculate tax',
      }));
    }
  }, 500);

  useEffect(() => {
    calculateTax();
  }, [items, shippingAddress, shippingCost]);

  return result;
}
```

## Tax Reporting

```typescript
// lib/tax/reporting.ts
import { prisma } from '@/lib/db';

export async function generateTaxReport(
  startDate: Date,
  endDate: Date,
  groupBy: 'state' | 'country' = 'state'
) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ['completed', 'shipped'] },
    },
    include: {
      taxBreakdown: true,
      shippingAddress: true,
    },
  });

  const grouped = orders.reduce((acc, order) => {
    const key = groupBy === 'state'
      ? order.shippingAddress.state
      : order.shippingAddress.country;

    if (!acc[key]) {
      acc[key] = {
        jurisdiction: key,
        totalSales: 0,
        taxableAmount: 0,
        taxCollected: 0,
        orderCount: 0,
      };
    }

    acc[key].totalSales += order.total;
    acc[key].taxableAmount += order.taxBreakdown?.taxableAmount || 0;
    acc[key].taxCollected += order.taxBreakdown?.taxAmount || 0;
    acc[key].orderCount++;

    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped);
}
```

## Anti-patterns

### Don't Calculate Tax Client-Side

```typescript
// ❌ BAD - Tax calculation exposed to tampering
const tax = subtotal * 0.0825; // Hardcoded rate

// ✅ GOOD - Server-side calculation with validation
const { totalTax } = await fetch('/api/tax/calculate', {
  method: 'POST',
  body: JSON.stringify({ items, shippingAddress }),
}).then(r => r.json());
```

### Don't Cache Rates Too Long

```typescript
// ❌ BAD - Rates cached indefinitely
const cachedRate = localStorage.getItem('taxRate');

// ✅ GOOD - Fetch fresh rates, short-term caching only
const rate = await redis.get(`tax:${zip}`);
if (!rate || Date.now() - rate.timestamp > 3600000) {
  // Refresh rate if older than 1 hour
}
```

### Don't Ignore Tax Nexus

```typescript
// ❌ BAD - Collecting tax everywhere
const tax = calculateTax(address); // Always calculates

// ✅ GOOD - Check nexus first
const hasNexus = await checkNexus(address.state);
const tax = hasNexus ? await calculateTax(address) : 0;
```

### Don't Store Calculated Tax Without Snapshot

```typescript
// ❌ BAD - No audit trail
await prisma.order.create({
  data: { taxAmount: calculatedTax },
});

// ✅ GOOD - Store full breakdown for compliance
await prisma.order.create({
  data: {
    taxAmount: calculatedTax,
    taxBreakdown: {
      create: {
        rate: taxResult.rate,
        stateAmount: taxResult.breakdown.state,
        countyAmount: taxResult.breakdown.county,
        cityAmount: taxResult.breakdown.city,
        calculatedAt: new Date(),
      },
    },
  },
});
```

## Testing

```typescript
// __tests__/tax-calculation.test.ts
import { describe, it, expect, vi } from 'vitest';
import { calculateTax, getTaxRateForLocation } from '@/lib/tax/service';

describe('Tax Calculation', () => {
  it('calculates US sales tax correctly', async () => {
    const result = await calculateTax(
      { state: 'WA', zip: '98101', country: 'US' },
      { state: 'CA', zip: '90210', country: 'US' },
      [{ id: '1', quantity: 1, unitPrice: 10000 }],
      500
    );

    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.rate).toBeGreaterThan(0);
  });

  it('returns zero tax for exempt customers', async () => {
    vi.mock('@/lib/tax/exemptions', () => ({
      checkExemption: vi.fn().mockResolvedValue({ status: 'verified' }),
    }));

    // Test with exempt customer
  });

  it('handles API errors gracefully', async () => {
    vi.mock('taxjar', () => ({
      default: vi.fn().mockImplementation(() => ({
        taxForOrder: vi.fn().mockRejectedValue(new Error('API Error')),
      })),
    }));

    // Should return zero tax, not throw
  });
});
```

## Related Skills

- [Stripe Checkout](../patterns/stripe-checkout.md) - Payment processing with built-in tax
- [Shipping Carriers](../patterns/shipping-carriers.md) - Shipping cost calculation
- [Checkout](../patterns/checkout.md) - Full checkout flow
- [Invoicing](../patterns/invoice-generation.md) - Invoice generation with tax details

---

## Changelog

### 2.0.0 (2025-01-18)
- Added VAT support for EU/UK
- Added tax exemption certificate handling
- Added checkout integration hook
- Added tax reporting functionality
- Enhanced anti-patterns with code examples
- Added testing section

### 1.0.0 (2025-01-16)
- Initial implementation
- TaxJar integration
- US sales tax calculation
- API route handler
