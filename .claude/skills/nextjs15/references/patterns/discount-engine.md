---
id: pt-discount-engine
name: Discount Engine
version: 1.0.0
layer: L5
category: payments
description: Comprehensive discount and promotion system with coupon codes, percentage/fixed discounts, BOGO offers, tiered pricing, and automatic promotions
tags: [discount, coupon, promotion, pricing, ecommerce, next15]
composes: []
formula: "DiscountEngine = CouponValidation + DiscountRules + PromotionEngine + PriceCalculation"
dependencies:
  zod: "^3.23.0"
  prisma: "^6.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Discount Engine

## Overview

A flexible discount and promotion system for e-commerce platforms. Supports coupon codes, percentage and fixed-amount discounts, buy-one-get-one (BOGO) offers, tiered pricing, minimum purchase requirements, and time-limited promotions.

## When to Use

- Implementing coupon/promo code functionality
- Running sales and promotional campaigns
- Offering volume-based discounts
- Creating loyalty rewards
- Implementing referral discounts

## Implementation

### Database Schema

```prisma
// prisma/schema.prisma
model Discount {
  id              String         @id @default(cuid())
  code            String?        @unique // null for automatic discounts
  name            String
  description     String?
  type            DiscountType
  value           Int            // percentage (0-100) or cents for fixed
  minPurchase     Int?           // minimum cart value in cents
  maxUses         Int?           // total uses allowed
  maxUsesPerUser  Int?           // uses per customer
  usageCount      Int            @default(0)

  // Targeting
  applicableTo    ApplicableTo   @default(ALL)
  productIds      String[]       // specific products
  categoryIds     String[]       // specific categories
  customerIds     String[]       // specific customers (VIP, etc.)

  // Scheduling
  startsAt        DateTime       @default(now())
  expiresAt       DateTime?

  // Rules
  stackable       Boolean        @default(false)
  firstOrderOnly  Boolean        @default(false)

  isActive        Boolean        @default(true)
  orders          OrderDiscount[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([code])
  @@index([isActive, startsAt, expiresAt])
}

model OrderDiscount {
  id          String   @id @default(cuid())
  order       Order    @relation(fields: [orderId], references: [id])
  orderId     String
  discount    Discount @relation(fields: [discountId], references: [id])
  discountId  String
  amount      Int      // actual discount amount applied in cents

  @@unique([orderId, discountId])
}

enum DiscountType {
  PERCENTAGE      // e.g., 20% off
  FIXED_AMOUNT    // e.g., $10 off
  FREE_SHIPPING   // removes shipping cost
  BOGO            // buy one get one
  TIERED          // spend $100 get 10%, $200 get 20%
}

enum ApplicableTo {
  ALL
  SPECIFIC_PRODUCTS
  SPECIFIC_CATEGORIES
  SPECIFIC_CUSTOMERS
}
```

### Discount Validation Service

```typescript
// lib/discounts/validation.ts
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const applyDiscountSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  cartItems: z.array(z.object({
    productId: z.string(),
    categoryId: z.string(),
    price: z.number(),
    quantity: z.number(),
  })),
  customerId: z.string().optional(),
  subtotal: z.number(),
});

export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;

export interface DiscountResult {
  valid: boolean;
  discount?: {
    id: string;
    code: string;
    name: string;
    type: string;
    amount: number; // calculated discount in cents
    message: string;
  };
  error?: string;
}

export async function validateAndApplyDiscount(
  input: ApplyDiscountInput
): Promise<DiscountResult> {
  const { code, cartItems, customerId, subtotal } = input;

  // Find the discount
  const discount = await prisma.discount.findUnique({
    where: { code },
  });

  if (!discount) {
    return { valid: false, error: 'Invalid discount code' };
  }

  // Check if active
  if (!discount.isActive) {
    return { valid: false, error: 'This discount is no longer active' };
  }

  // Check date range
  const now = new Date();
  if (discount.startsAt > now) {
    return { valid: false, error: 'This discount is not yet active' };
  }
  if (discount.expiresAt && discount.expiresAt < now) {
    return { valid: false, error: 'This discount has expired' };
  }

  // Check usage limits
  if (discount.maxUses && discount.usageCount >= discount.maxUses) {
    return { valid: false, error: 'This discount has reached its usage limit' };
  }

  // Check per-user limit
  if (customerId && discount.maxUsesPerUser) {
    const userUsage = await prisma.orderDiscount.count({
      where: {
        discountId: discount.id,
        order: { userId: customerId },
      },
    });
    if (userUsage >= discount.maxUsesPerUser) {
      return { valid: false, error: 'You have already used this discount' };
    }
  }

  // Check first order only
  if (discount.firstOrderOnly && customerId) {
    const orderCount = await prisma.order.count({
      where: { userId: customerId },
    });
    if (orderCount > 0) {
      return { valid: false, error: 'This discount is for first orders only' };
    }
  }

  // Check minimum purchase
  if (discount.minPurchase && subtotal < discount.minPurchase) {
    const minFormatted = (discount.minPurchase / 100).toFixed(2);
    return {
      valid: false,
      error: `Minimum purchase of $${minFormatted} required`,
    };
  }

  // Calculate discount amount based on type
  const discountAmount = calculateDiscountAmount(discount, cartItems, subtotal);

  return {
    valid: true,
    discount: {
      id: discount.id,
      code: discount.code!,
      name: discount.name,
      type: discount.type,
      amount: discountAmount,
      message: getDiscountMessage(discount, discountAmount),
    },
  };
}

function calculateDiscountAmount(
  discount: any,
  cartItems: ApplyDiscountInput['cartItems'],
  subtotal: number
): number {
  // Filter eligible items based on applicableTo
  let eligibleTotal = subtotal;

  if (discount.applicableTo === 'SPECIFIC_PRODUCTS') {
    eligibleTotal = cartItems
      .filter(item => discount.productIds.includes(item.productId))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  } else if (discount.applicableTo === 'SPECIFIC_CATEGORIES') {
    eligibleTotal = cartItems
      .filter(item => discount.categoryIds.includes(item.categoryId))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  switch (discount.type) {
    case 'PERCENTAGE':
      return Math.round(eligibleTotal * (discount.value / 100));

    case 'FIXED_AMOUNT':
      return Math.min(discount.value, eligibleTotal);

    case 'FREE_SHIPPING':
      return 0; // Handled separately in checkout

    case 'BOGO':
      // Find cheapest eligible item
      const eligibleItems = cartItems.filter(item => {
        if (discount.applicableTo === 'SPECIFIC_PRODUCTS') {
          return discount.productIds.includes(item.productId);
        }
        return true;
      });
      if (eligibleItems.length >= 2) {
        const sortedPrices = eligibleItems
          .flatMap(item => Array(item.quantity).fill(item.price))
          .sort((a, b) => a - b);
        return sortedPrices[0]; // Free cheapest item
      }
      return 0;

    case 'TIERED':
      // Value encodes tiers as JSON
      const tiers = JSON.parse(discount.description || '[]');
      const applicableTier = tiers
        .sort((a: any, b: any) => b.threshold - a.threshold)
        .find((tier: any) => subtotal >= tier.threshold);
      if (applicableTier) {
        return Math.round(eligibleTotal * (applicableTier.percentage / 100));
      }
      return 0;

    default:
      return 0;
  }
}

function getDiscountMessage(discount: any, amount: number): string {
  const amountFormatted = (amount / 100).toFixed(2);

  switch (discount.type) {
    case 'PERCENTAGE':
      return `${discount.value}% off (-$${amountFormatted})`;
    case 'FIXED_AMOUNT':
      return `$${amountFormatted} off`;
    case 'FREE_SHIPPING':
      return 'Free shipping applied';
    case 'BOGO':
      return `Buy one get one free (-$${amountFormatted})`;
    case 'TIERED':
      return `Tiered discount (-$${amountFormatted})`;
    default:
      return `Discount applied (-$${amountFormatted})`;
  }
}
```

### Server Action

```typescript
// app/actions/discount.ts
'use server';

import { validateAndApplyDiscount, applyDiscountSchema } from '@/lib/discounts/validation';

export async function applyDiscountCode(formData: FormData) {
  const code = formData.get('code') as string;
  const cartData = JSON.parse(formData.get('cart') as string);

  const result = await validateAndApplyDiscount({
    code: code.toUpperCase(),
    cartItems: cartData.items,
    customerId: cartData.customerId,
    subtotal: cartData.subtotal,
  });

  return result;
}
```

### React Hook

```typescript
// hooks/use-discount.ts
'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';

export function useDiscount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, subtotal, setDiscount, clearDiscount } = useCartStore();

  const applyCode = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          cartItems: items.map(item => ({
            productId: item.productId,
            categoryId: item.categoryId,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: subtotal(),
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setDiscount(result.discount);
        return result.discount;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('Failed to apply discount code');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeDiscount = () => {
    clearDiscount();
    setError(null);
  };

  return {
    applyCode,
    removeDiscount,
    isLoading,
    error,
  };
}
```

## Examples

### Discount Code Input Component

```tsx
// components/discount-input.tsx
'use client';

import { useState } from 'react';
import { useDiscount } from '@/hooks/use-discount';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, X, Loader2 } from 'lucide-react';

export function DiscountInput() {
  const [code, setCode] = useState('');
  const { applyCode, removeDiscount, isLoading, error } = useDiscount();
  const discount = useCartStore(state => state.discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      await applyCode(code.trim());
      setCode('');
    }
  };

  if (discount) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-800">{discount.code}</span>
          <span className="text-green-600">{discount.message}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeDiscount}
          className="text-green-600 hover:text-green-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter discount code"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !code.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
```

## Anti-patterns

- **No validation on server**: Always validate discounts server-side, never trust client
- **Race conditions**: Use database transactions when applying discounts
- **No usage tracking**: Always increment usage count atomically
- **Stackable without limits**: Be careful with stackable discounts to prevent abuse

## Related Skills

- [Stripe Checkout](../patterns/stripe-checkout.md)
- [Form Validation](../patterns/form-validation.md)
- [Zustand State](../patterns/zustand.md)
