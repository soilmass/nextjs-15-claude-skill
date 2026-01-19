---
id: o-checkout-summary
name: Checkout Summary
version: 2.0.0
layer: L3
category: commerce
description: Order summary component for checkout with items, pricing, and payment
tags: [checkout, summary, order, payment, commerce, receipt]
formula: "CheckoutSummary = Card(m-card) + Collapsible(m-collapsible) + Badge(a-badge) + Button(a-button) + Separator(a-separator)"
composes:
  - ../molecules/card.md
dependencies: [lucide-react]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Checkout Summary

## Overview

The Checkout Summary organism provides a comprehensive order summary for checkout flows. Displays cart items, pricing breakdown, shipping options, payment methods, and order confirmation. Supports sticky positioning and collapsible mobile views.

## When to Use

Use this skill when:
- Building checkout pages
- Creating order confirmation views
- Displaying purchase receipts
- Showing order details

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CheckoutSummary (L3)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Card (m-card)                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  CardHeader: Order Summary Title                        │  │  │
│  │  │  Badge(a-badge): Item count                             │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Collapsible (m-collapsible) - Mobile View              │  │  │
│  │  │  ┌───────────────────────────────────────────────────┐  │  │  │
│  │  │  │  OrderItemsList                                   │  │  │  │
│  │  │  │  [Image] [Name] [Badge: qty] [Price]              │  │  │  │
│  │  │  └───────────────────────────────────────────────────┘  │  │  │
│  │  │  Separator(a-separator) ─────────────────────────────   │  │  │
│  │  │  ┌───────────────────────────────────────────────────┐  │  │  │
│  │  │  │  PricingSummary: Subtotal, Shipping, Tax, Total   │  │  │  │
│  │  │  └───────────────────────────────────────────────────┘  │  │  │
│  │  │  ┌───────────────────────────────────────────────────┐  │  │  │
│  │  │  │  Button(a-button): Place Order / Pay              │  │  │  │
│  │  │  └───────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [card](../molecules/card.md) - Summary container
- [separator](../atoms/separator.md) - Section dividers
- [badge](../atoms/badge.md) - Status indicators

## Implementation

```typescript
// components/organisms/checkout-summary.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  CreditCard,
  Shield,
  Tag,
  Check,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  selected?: boolean;
}

interface PaymentMethod {
  type: "card" | "paypal" | "apple" | "google";
  last4?: string;
  brand?: string;
  email?: string;
}

interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface OrderSummary {
  subtotal: number;
  discount?: {
    code: string;
    amount: number;
  };
  shipping: number;
  tax: number;
  total: number;
}

interface CheckoutSummaryProps {
  /** Order items */
  items: OrderItem[];
  /** Order summary totals */
  summary: OrderSummary;
  /** Currency code */
  currency?: string;
  /** Shipping address */
  shippingAddress?: Address;
  /** Billing address */
  billingAddress?: Address;
  /** Selected shipping option */
  shippingOption?: ShippingOption;
  /** Payment method */
  paymentMethod?: PaymentMethod;
  /** Order number (for confirmation) */
  orderNumber?: string;
  /** Order status */
  orderStatus?: "processing" | "shipped" | "delivered";
  /** Expected delivery date */
  expectedDelivery?: string;
  /** Checkout step (affects display) */
  step?: "cart" | "shipping" | "payment" | "review" | "confirmation";
  /** Sticky positioning */
  sticky?: boolean;
  /** Collapsible on mobile */
  collapsibleMobile?: boolean;
  /** Show edit buttons */
  showEdit?: boolean;
  /** Edit handler */
  onEdit?: (section: "cart" | "shipping" | "payment") => void;
  /** Place order handler */
  onPlaceOrder?: () => void;
  /** Is placing order */
  isPlacingOrder?: boolean;
  /** Additional class names */
  className?: string;
}

function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function OrderItemsList({
  items,
  currency,
  showEdit,
  onEdit,
}: {
  items: OrderItem[];
  currency: string;
  showEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Items ({items.reduce((acc, item) => acc + item.quantity, 0)})
        </h3>
        {showEdit && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                variant="secondary"
              >
                {item.quantity}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              {item.variant && (
                <p className="text-xs text-muted-foreground">{item.variant}</p>
              )}
              <p className="text-sm font-medium mt-1">
                {formatPrice(item.price * item.quantity, currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressDisplay({
  address,
  type,
}: {
  address: Address;
  type: "shipping" | "billing";
}) {
  return (
    <div>
      <p className="font-medium text-sm">{address.name}</p>
      <p className="text-sm text-muted-foreground">
        {address.line1}
        {address.line2 && `, ${address.line2}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {address.city}, {address.state} {address.zip}
      </p>
      <p className="text-sm text-muted-foreground">{address.country}</p>
    </div>
  );
}

function ShippingDisplay({
  option,
  showEdit,
  onEdit,
}: {
  option: ShippingOption;
  showEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Shipping
        </h3>
        {showEdit && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
      <div className="text-sm">
        <p className="font-medium">{option.name}</p>
        <p className="text-muted-foreground">{option.description}</p>
        <p className="text-muted-foreground">
          Estimated delivery: {option.estimatedDays}
        </p>
      </div>
    </div>
  );
}

function PaymentDisplay({
  method,
  showEdit,
  onEdit,
}: {
  method: PaymentMethod;
  showEdit?: boolean;
  onEdit?: () => void;
}) {
  const getMethodDisplay = () => {
    switch (method.type) {
      case "card":
        return (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="capitalize">{method.brand}</span>
            <span className="text-muted-foreground">****{method.last4}</span>
          </div>
        );
      case "paypal":
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">PayPal</span>
            <span className="text-muted-foreground">{method.email}</span>
          </div>
        );
      case "apple":
        return <span className="font-medium">Apple Pay</span>;
      case "google":
        return <span className="font-medium">Google Pay</span>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment
        </h3>
        {showEdit && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
      <div className="text-sm">{getMethodDisplay()}</div>
    </div>
  );
}

function PricingSummary({
  summary,
  currency,
}: {
  summary: OrderSummary;
  currency: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(summary.subtotal, currency)}</span>
      </div>

      {summary.discount && (
        <div className="flex justify-between text-sm text-green-600">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {summary.discount.code}
          </span>
          <span>-{formatPrice(summary.discount.amount, currency)}</span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Shipping</span>
        <span>
          {summary.shipping === 0
            ? "Free"
            : formatPrice(summary.shipping, currency)}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Tax</span>
        <span>{formatPrice(summary.tax, currency)}</span>
      </div>

      <Separator />

      <div className="flex justify-between font-medium text-lg">
        <span>Total</span>
        <span>{formatPrice(summary.total, currency)}</span>
      </div>
    </div>
  );
}

function OrderConfirmation({
  orderNumber,
  orderStatus,
  expectedDelivery,
}: {
  orderNumber: string;
  orderStatus?: "processing" | "shipped" | "delivered";
  expectedDelivery?: string;
}) {
  const statusConfig = {
    processing: {
      label: "Processing",
      color: "bg-yellow-500",
      icon: Clock,
    },
    shipped: {
      label: "Shipped",
      color: "bg-blue-500",
      icon: Truck,
    },
    delivered: {
      label: "Delivered",
      color: "bg-green-500",
      icon: Check,
    },
  };

  const status = orderStatus ? statusConfig[orderStatus] : null;

  return (
    <div className="text-center space-y-4 py-4">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Order Confirmed!</h2>
        <p className="text-muted-foreground mt-1">
          Order #{orderNumber}
        </p>
      </div>
      {status && (
        <Badge variant="secondary" className="gap-1">
          <status.icon className="h-3 w-3" />
          {status.label}
        </Badge>
      )}
      {expectedDelivery && (
        <p className="text-sm text-muted-foreground">
          Expected delivery: {expectedDelivery}
        </p>
      )}
    </div>
  );
}

export function CheckoutSummary({
  items,
  summary,
  currency = "USD",
  shippingAddress,
  billingAddress,
  shippingOption,
  paymentMethod,
  orderNumber,
  orderStatus,
  expectedDelivery,
  step = "cart",
  sticky = true,
  collapsibleMobile = true,
  showEdit = false,
  onEdit,
  onPlaceOrder,
  isPlacingOrder = false,
  className,
}: CheckoutSummaryProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isConfirmation = step === "confirmation" && orderNumber;

  const content = (
    <div className="space-y-6">
      {/* Order Confirmation Header */}
      {isConfirmation && (
        <OrderConfirmation
          orderNumber={orderNumber}
          orderStatus={orderStatus}
          expectedDelivery={expectedDelivery}
        />
      )}

      {/* Items */}
      <OrderItemsList
        items={items}
        currency={currency}
        showEdit={showEdit && step !== "confirmation"}
        onEdit={() => onEdit?.("cart")}
      />

      <Separator />

      {/* Shipping Address */}
      {shippingAddress && (step === "review" || step === "confirmation") && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Shipping Address</h3>
              {showEdit && step !== "confirmation" && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onEdit?.("shipping")}
                >
                  Edit
                </Button>
              )}
            </div>
            <AddressDisplay address={shippingAddress} type="shipping" />
          </div>
          <Separator />
        </>
      )}

      {/* Shipping Option */}
      {shippingOption && (step === "payment" || step === "review" || step === "confirmation") && (
        <>
          <ShippingDisplay
            option={shippingOption}
            showEdit={showEdit && step !== "confirmation"}
            onEdit={() => onEdit?.("shipping")}
          />
          <Separator />
        </>
      )}

      {/* Payment Method */}
      {paymentMethod && (step === "review" || step === "confirmation") && (
        <>
          <PaymentDisplay
            method={paymentMethod}
            showEdit={showEdit && step !== "confirmation"}
            onEdit={() => onEdit?.("payment")}
          />
          <Separator />
        </>
      )}

      {/* Pricing Summary */}
      <PricingSummary summary={summary} currency={currency} />

      {/* Place Order Button */}
      {step === "review" && onPlaceOrder && (
        <Button
          className="w-full"
          size="lg"
          onClick={onPlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            `Pay ${formatPrice(summary.total, currency)}`
          )}
        </Button>
      )}

      {/* Security Badge */}
      {(step === "payment" || step === "review") && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Secure checkout powered by Stripe</span>
        </div>
      )}
    </div>
  );

  // Mobile collapsible
  if (collapsibleMobile) {
    return (
      <>
        {/* Mobile: Collapsible */}
        <div className={cn("lg:hidden", className)}>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      Order Summary
                      <Badge variant="secondary">
                        {items.reduce((acc, item) => acc + item.quantity, 0)} items
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {formatPrice(summary.total, currency)}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>{content}</CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Desktop: Static */}
        <div className={cn("hidden lg:block", className)}>
          <Card className={cn(sticky && "sticky top-24")}>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <Card className={cn(sticky && "sticky top-24", className)}>
      <CardHeader>
        <CardTitle>
          {isConfirmation ? "Order Details" : "Order Summary"}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
```

### Key Implementation Notes

1. **Step-Aware Display**: Shows relevant info per checkout step
2. **Collapsible Mobile**: Expandable on mobile, static on desktop
3. **Sticky Positioning**: Stays visible while scrolling
4. **Confirmation View**: Order details after purchase

## Variants

### Cart Step

```tsx
<CheckoutSummary
  items={cartItems}
  summary={{
    subtotal: 299,
    shipping: 0,
    tax: 24,
    total: 323,
  }}
  step="cart"
/>
```

### Review Step

```tsx
<CheckoutSummary
  items={cartItems}
  summary={orderSummary}
  shippingAddress={address}
  shippingOption={shipping}
  paymentMethod={{ type: "card", brand: "visa", last4: "4242" }}
  step="review"
  showEdit
  onEdit={(section) => goToStep(section)}
  onPlaceOrder={placeOrder}
  isPlacingOrder={isProcessing}
/>
```

### Order Confirmation

```tsx
<CheckoutSummary
  items={orderItems}
  summary={orderSummary}
  shippingAddress={order.shippingAddress}
  shippingOption={order.shipping}
  paymentMethod={order.payment}
  orderNumber="ORD-2025-1234"
  orderStatus="processing"
  expectedDelivery="January 20-22, 2025"
  step="confirmation"
/>
```

### With Discount

```tsx
<CheckoutSummary
  items={cartItems}
  summary={{
    subtotal: 299,
    discount: { code: "SAVE20", amount: 59.8 },
    shipping: 0,
    tax: 19.14,
    total: 258.34,
  }}
  step="review"
/>
```

## Performance

### Image Loading

- Use small thumbnail sizes
- Lazy load off-screen items
- Consider placeholders

### Updates

- Memoize price calculations
- Avoid unnecessary re-renders
- Cache formatted prices

## Accessibility

### Required Attributes

- Prices have proper formatting
- Status badges have text
- Edit buttons describe action

### Screen Reader

- Order totals announced clearly
- Status changes announced
- Collapsible state communicated

### Keyboard Navigation

- Collapsible trigger focusable
- Edit buttons accessible
- Place order button prominent

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Cart Step | Summary shows items and totals only | Items list with pricing, no shipping/payment details |
| Shipping Step | Shipping selection shown | Previous: items; Added: shipping options |
| Payment Step | Payment info collected | Previous: items + shipping; Added: payment method |
| Review Step | All details editable | Full summary with edit buttons, place order button prominent |
| Confirmation | Order placed successfully | Green checkmark, order number, status badge, all details read-only |
| Collapsible Mobile | Summary collapsed on small screens | Shows total only, expands on tap |
| Expanded Mobile | Summary open on mobile | Full details visible in collapsible |
| Placing Order | Order being submitted | Place order button shows spinner, all interactions disabled |
| Order Processing | Order being fulfilled | Yellow "Processing" status badge with clock icon |
| Order Shipped | Order dispatched | Blue "Shipped" status badge with truck icon |
| Order Delivered | Order received | Green "Delivered" status badge with check icon |
| Discount Applied | Promo code active | Green discount line with code badge and negative amount |
| Sticky | Summary fixed during scroll | Summary card stays visible as user scrolls (desktop) |

## Anti-patterns

### Bad: Not showing step-appropriate information

```tsx
// Bad - showing payment info before it's collected
<CheckoutSummary
  step="shipping"
  paymentMethod={{ type: 'card', last4: '4242' }} // Not collected yet!
/>

// Good - only show collected information
<CheckoutSummary
  step="shipping"
  items={items}
  summary={summary}
  shippingAddress={address} // Only if collected
  // No paymentMethod until payment step
/>
```

### Bad: Not recalculating totals when shipping changes

```tsx
// Bad - static totals regardless of shipping
const summary = {
  subtotal: 100,
  shipping: 10, // Never updates!
  tax: 9,
  total: 119,
};

<CheckoutSummary summary={summary} />

// Good - recalculate when shipping option changes
const summary = useMemo(() => ({
  subtotal: calculateSubtotal(items),
  shipping: selectedShipping?.price ?? 0,
  tax: calculateTax(subtotal, selectedShipping?.price ?? 0),
  total: subtotal + (selectedShipping?.price ?? 0) + tax,
}), [items, selectedShipping]);

<CheckoutSummary summary={summary} shippingOption={selectedShipping} />
```

### Bad: Allowing order placement without validation

```tsx
// Bad - place order without checking required fields
<CheckoutSummary
  step="review"
  onPlaceOrder={() => submitOrder()} // No validation!
/>

// Good - validate before enabling place order
const canPlaceOrder = useMemo(() => (
  items.length > 0 &&
  shippingAddress &&
  paymentMethod &&
  !isPlacingOrder
), [items, shippingAddress, paymentMethod, isPlacingOrder]);

<CheckoutSummary
  step="review"
  onPlaceOrder={canPlaceOrder ? handlePlaceOrder : undefined}
  isPlacingOrder={isPlacingOrder}
/>
```

### Bad: Not formatting currency consistently

```tsx
// Bad - inconsistent currency formatting
<div>
  <span>Subtotal: ${summary.subtotal}</span> {/* No decimals */}
  <span>Tax: ${summary.tax.toFixed(2)}</span> {/* With decimals */}
  <span>Total: {summary.total} USD</span> {/* Different format */}
</div>

// Good - use consistent formatter
const formatPrice = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);

<div>
  <span>Subtotal: {formatPrice(summary.subtotal)}</span>
  <span>Tax: {formatPrice(summary.tax)}</span>
  <span>Total: {formatPrice(summary.total)}</span>
</div>
```

## Related Skills

### Composes Into
- [templates/checkout-layout](../templates/checkout-layout.md)
- [templates/order-confirmation](../templates/order-confirmation.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Step-aware display
- Mobile collapsible view
- Order confirmation mode
