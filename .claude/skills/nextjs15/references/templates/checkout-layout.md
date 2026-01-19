---
id: t-checkout-layout
name: Checkout Layout
version: 2.0.0
layer: L4
category: layouts
description: E-commerce checkout layout with steps, summary, and secure indicators
tags: [layout, checkout, ecommerce, payment, cart, secure]
formula: "CheckoutLayout = CheckoutSummary(o-checkout-summary) + Stepper(m-stepper) + Card(m-card)"
composes:
  - ../organisms/checkout-summary.md
  - ../molecules/stepper.md
  - ../molecules/card.md
dependencies: []
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Checkout Layout

## Overview

The Checkout Layout template provides the structure for e-commerce checkout flows. Features a multi-step process with progress indicator, order summary sidebar, security badges, and responsive design that works on all devices.

## When to Use

Use this skill when:
- Building checkout flows
- Creating payment pages
- Building order review pages
- Creating cart/checkout experiences

## Composition Diagram

```
+------------------------------------------------------------------+
|                       CheckoutLayout                              |
+------------------------------------------------------------------+
|  Header                                                           |
|  [ <- Back ]           [ Logo ]              [ Lock Secure ]      |
+------------------------------------------------------------------+
|  Progress                                                         |
|  +--------------------------------------------------------------+ |
|  |  m Stepper                                                    | |
|  |  ( 1 Information )---( 2 Shipping )---( 3 Payment )           | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
|  Main Content                                                     |
|  +----------------------------------------+  +-----------------+  |
|  |              {children}                 |  | o CheckoutSummary|  |
|  |                                         |  |  +------------+ |  |
|  |   +----------------------------------+  |  |  | m Card     | |  |
|  |   |  Step Form Content               |  |  |  | - Items    | |  |
|  |   |  (Information/Shipping/Payment)  |  |  |  | - Subtotal | |  |
|  |   +----------------------------------+  |  |  | - Total    | |  |
|  |                                         |  |  +------------+ |  |
|  +----------------------------------------+  +-----------------+  |
+------------------------------------------------------------------+
|  Footer                                                           |
|  [ SSL Encrypted ]  [ PCI Compliant ]    Privacy | Terms | Help   |
+------------------------------------------------------------------+
```

## Organisms Used

- [checkout-summary](../organisms/checkout-summary.md) - Order summary
- [checkout-form](../organisms/checkout-form.md) - Checkout forms

## Implementation

```typescript
// app/(checkout)/layout.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCart } from "@/lib/cart";
import { getSession } from "@/lib/auth";
import { Shield, Lock, ArrowLeft } from "lucide-react";
import { CheckoutProvider } from "@/components/checkout/checkout-provider";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { Button } from "@/components/ui/button";

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

export default async function CheckoutLayout({ children }: CheckoutLayoutProps) {
  // Get cart and session
  const [cart, session] = await Promise.all([getCart(), getSession()]);

  // Redirect if cart is empty
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <CheckoutProvider cart={cart} session={session}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-background">
          <div className="container flex h-16 items-center justify-between">
            {/* Back to Cart */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to cart</span>
              </Link>
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">A</span>
              </div>
              <span className="font-bold hidden sm:inline">Acme Store</span>
            </Link>

            {/* Security Badge */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div className="border-b">
          <div className="container py-4">
            <CheckoutProgress />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-muted/30">
          <div className="container py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 bg-background">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Security Badges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>PCI Compliant</span>
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:underline">Privacy</Link>
                <Link href="/terms" className="hover:underline">Terms</Link>
                <Link href="/help" className="hover:underline">Help</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </CheckoutProvider>
  );
}
```

### Checkout Progress Component

```typescript
// components/checkout/checkout-progress.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "information", label: "Information", href: "/checkout" },
  { id: "shipping", label: "Shipping", href: "/checkout/shipping" },
  { id: "payment", label: "Payment", href: "/checkout/payment" },
];

export function CheckoutProgress() {
  const pathname = usePathname();
  
  const currentStepIndex = steps.findIndex((step) => step.href === pathname);

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                {/* Step Indicator */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    "text-sm font-medium hidden sm:inline",
                    isCurrent && "text-foreground",
                    !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 sm:mx-4 h-0.5 w-8 sm:w-16",
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Checkout Provider

```typescript
// components/checkout/checkout-provider.tsx
"use client";

import * as React from "react";
import { Cart, Session } from "@/types";

interface CheckoutContextValue {
  cart: Cart;
  session: Session | null;
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress) => void;
  shippingMethod: ShippingMethod | null;
  setShippingMethod: (method: ShippingMethod) => void;
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CheckoutContext = React.createContext<CheckoutContextValue | null>(null);

export function useCheckout() {
  const context = React.useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return context;
}

interface CheckoutProviderProps {
  cart: Cart;
  session: Session | null;
  children: React.ReactNode;
}

export function CheckoutProvider({
  cart,
  session,
  children,
}: CheckoutProviderProps) {
  const [shippingAddress, setShippingAddress] = React.useState<ShippingAddress | null>(null);
  const [shippingMethod, setShippingMethod] = React.useState<ShippingMethod | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  return (
    <CheckoutContext.Provider
      value={{
        cart,
        session,
        shippingAddress,
        setShippingAddress,
        shippingMethod,
        setShippingMethod,
        paymentMethod,
        setPaymentMethod,
        isProcessing,
        setIsProcessing,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}
```

### Information Step Page

```typescript
// app/(checkout)/checkout/page.tsx
import { Metadata } from "next";
import { CheckoutInformationForm } from "@/components/checkout/checkout-information-form";
import { CheckoutSummary } from "@/components/organisms/checkout-summary";

export const metadata: Metadata = {
  title: "Checkout - Information",
  robots: { index: false },
};

export default function CheckoutInformationPage() {
  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      {/* Form */}
      <div className="order-2 lg:order-1">
        <div className="bg-background rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-6">Contact Information</h1>
          <CheckoutInformationForm />
        </div>
      </div>

      {/* Summary */}
      <div className="order-1 lg:order-2">
        <CheckoutSummary
          step="shipping"
          collapsibleMobile
          sticky
        />
      </div>
    </div>
  );
}
```

### Payment Step Page

```typescript
// app/(checkout)/checkout/payment/page.tsx
import { Metadata } from "next";
import { CheckoutPaymentForm } from "@/components/checkout/checkout-payment-form";
import { CheckoutSummary } from "@/components/organisms/checkout-summary";

export const metadata: Metadata = {
  title: "Checkout - Payment",
  robots: { index: false },
};

export default function CheckoutPaymentPage() {
  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      {/* Form */}
      <div className="order-2 lg:order-1">
        <div className="bg-background rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-6">Payment Method</h1>
          <CheckoutPaymentForm />
        </div>
      </div>

      {/* Summary */}
      <div className="order-1 lg:order-2">
        <CheckoutSummary
          step="review"
          showEdit
          collapsibleMobile
          sticky
        />
      </div>
    </div>
  );
}
```

## Key Implementation Notes

1. **Cart Validation**: Redirects if cart is empty
2. **Progress Indicator**: Shows current step
3. **Security Badges**: Builds trust
4. **Responsive Layout**: Summary collapses on mobile
5. **Context Provider**: Shares checkout state

## Variants

### Single Page Checkout

```tsx
export default function SinglePageCheckout() {
  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div className="space-y-8">
        <section className="bg-background rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Contact & Shipping</h2>
          <CheckoutInformationForm />
        </section>
        <section className="bg-background rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Payment</h2>
          <CheckoutPaymentForm />
        </section>
      </div>
      <CheckoutSummary step="review" sticky />
    </div>
  );
}
```

### Express Checkout

```tsx
<div className="mb-6">
  <div className="flex items-center gap-4 mb-4">
    <hr className="flex-1" />
    <span className="text-sm text-muted-foreground">Express checkout</span>
    <hr className="flex-1" />
  </div>
  <div className="flex gap-2">
    <Button variant="outline" className="flex-1">
      <ApplePay />
    </Button>
    <Button variant="outline" className="flex-1">
      <GooglePay />
    </Button>
    <Button variant="outline" className="flex-1">
      <PayPal />
    </Button>
  </div>
</div>
```

## Performance

### Cart Loading

- Pre-fetch cart data
- Show skeleton during load
- Cache cart in session

### Form Optimization

- Debounce address validation
- Lazy load payment form
- Prefetch next step

## Accessibility

### Required Features

- Form labels on all inputs
- Error messages linked
- Progress step announced
- Focus management between steps

### Screen Reader

- Step changes announced
- Form errors announced
- Order summary readable

## Route Group Structure

```
app/
├── (checkout)/
│   ├── layout.tsx           # Checkout layout
│   └── checkout/
│       ├── page.tsx         # Information step
│       ├── shipping/
│       │   └── page.tsx     # Shipping step
│       ├── payment/
│       │   └── page.tsx     # Payment step
│       └── confirmation/
│           └── page.tsx     # Order confirmation
```

## Security Considerations

- No index/follow for checkout pages
- HTTPS required
- PCI compliant payment handling
- CSRF protection on forms
- Rate limiting on submissions

## Error States

### Cart Loading Error

```tsx
// app/(checkout)/layout.tsx
import { ErrorBoundary } from "react-error-boundary";

function CheckoutError({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Unable to Load Checkout</h1>
        <p className="text-muted-foreground mb-6">
          {error.message || "We couldn't load your checkout session. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/cart">Return to Cart</Link>
          </Button>
          <Button onClick={resetErrorBoundary}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <ErrorBoundary FallbackComponent={CheckoutError}>
      <CheckoutProvider cart={cart} session={session}>
        {/* ... layout content */}
      </CheckoutProvider>
    </ErrorBoundary>
  );
}
```

### Session Expired Error

```tsx
// components/checkout/session-expired.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SessionExpiredHandler({ expiresAt }: { expiresAt: Date }) {
  const router = useRouter();

  useEffect(() => {
    const checkExpiry = () => {
      if (new Date() > expiresAt) {
        toast.error("Your checkout session has expired", {
          description: "Please start again from your cart.",
          action: {
            label: "Go to Cart",
            onClick: () => router.push("/cart"),
          },
        });
      }
    };

    const interval = setInterval(checkExpiry, 30000);
    return () => clearInterval(interval);
  }, [expiresAt, router]);

  return null;
}
```

### Payment Provider Error

```tsx
// components/checkout/payment-error-boundary.tsx
"use client";

import { AlertTriangle, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PaymentErrorProps {
  error: Error;
  onRetry: () => void;
}

export function PaymentProviderError({ error, onRetry }: PaymentErrorProps) {
  const isStripeError = error.message.includes("Stripe");

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Payment System Unavailable</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          {isStripeError
            ? "We're having trouble connecting to our payment provider."
            : error.message}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            <CreditCard className="h-4 w-4 mr-2" />
            Retry Payment
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <a href="/help/payment-issues">Get Help</a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

## Loading States

### Checkout Layout Skeleton

```tsx
// components/skeletons/checkout-layout-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutLayoutSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Skeleton */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </header>

      {/* Progress Skeleton */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
                {i < 3 && <Skeleton className="h-0.5 w-16 mx-4" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="order-2 lg:order-1">
              <Skeleton className="h-[500px] rounded-lg" />
            </div>
            <div className="order-1 lg:order-2">
              <Skeleton className="h-[350px] rounded-lg" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="border-t py-6 bg-background">
        <div className="container">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </footer>
    </div>
  );
}
```

### Progress Step Loading

```tsx
// components/checkout/checkout-progress-loading.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CheckoutProgressLoading() {
  return (
    <nav aria-label="Checkout progress loading">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {[1, 2, 3].map((step, index) => (
          <li key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
            </div>
            {index < 2 && (
              <Skeleton className="mx-2 sm:mx-4 h-0.5 w-8 sm:w-16" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### Step Transition Loading

```tsx
// components/checkout/step-transition.tsx
"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function StepTransition({ children, isLoading }: StepTransitionProps) {
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading next step...</span>
          </div>
        </div>
      )}
      <div className={cn(isLoading && "opacity-50 pointer-events-none")}>
        {children}
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Breakpoints

| Breakpoint | Layout | Summary | Progress |
|------------|--------|---------|----------|
| < 640px | Single column | Collapsible accordion | Numbers only |
| 640-1023px | Single column | Fixed top card | Numbers + labels |
| >= 1024px | Two columns (form + summary) | Sticky sidebar | Full stepper |

### Mobile-First Layout

```tsx
// app/(checkout)/layout.tsx - Mobile Responsive Version
export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <CheckoutProvider cart={cart} session={session}>
      <div className="min-h-screen flex flex-col">
        {/* Mobile-Optimized Header */}
        <header className="border-b bg-background sticky top-0 z-50">
          <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
            {/* Back Button - Icon only on mobile */}
            <Button variant="ghost" size="sm" className="px-2 sm:px-3" asChild>
              <Link href="/cart" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to cart</span>
              </Link>
            </Button>

            {/* Logo - Smaller on mobile */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm sm:text-base">A</span>
              </div>
              <span className="font-bold text-sm sm:text-base hidden xs:inline">Acme Store</span>
            </Link>

            {/* Security Badge */}
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </header>

        {/* Mobile Progress - Compact version */}
        <div className="border-b bg-background">
          <div className="container py-3 sm:py-4 px-4">
            <CheckoutProgressMobile />
          </div>
        </div>

        {/* Main Content - Full width on mobile */}
        <main className="flex-1 bg-muted/30">
          <div className="container py-4 sm:py-8 px-4">
            {children}
          </div>
        </main>

        {/* Footer - Simplified on mobile */}
        <footer className="border-t py-4 sm:py-6 bg-background">
          <div className="container px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>SSL</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>PCI</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Link href="/privacy" className="hover:underline">Privacy</Link>
                <Link href="/terms" className="hover:underline">Terms</Link>
                <Link href="/help" className="hover:underline">Help</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </CheckoutProvider>
  );
}
```

### Mobile Progress Component

```tsx
// components/checkout/checkout-progress-mobile.tsx
"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "information", label: "Info", href: "/checkout" },
  { id: "shipping", label: "Ship", href: "/checkout/shipping" },
  { id: "payment", label: "Pay", href: "/checkout/payment" },
];

export function CheckoutProgressMobile() {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((step) => step.href === pathname);

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center justify-between w-full max-w-xs mx-auto sm:max-w-md">
        {steps.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 w-full">
                <div
                  className={cn(
                    "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/20 ring-offset-2",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Mobile Order Summary (Collapsible)

```tsx
// components/checkout/checkout-summary-mobile.tsx
"use client";

import * as React from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCheckout } from "./checkout-provider";
import { formatCurrency } from "@/lib/utils";

export function CheckoutSummaryMobile() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { cart } = useCheckout();

  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="lg:hidden border rounded-lg bg-background">
      {/* Summary Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">
            {isOpen ? "Hide order summary" : "Show order summary"}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
        <span className="font-bold">{formatCurrency(total)}</span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="border-t p-4 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded border overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="object-cover" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">{item.variant}</p>
                )}
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Related Skills

### Composes Into
- [organisms/checkout-form](../organisms/checkout-form.md)
- [organisms/checkout-summary](../organisms/checkout-summary.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Multi-step progress
- Order summary sidebar
- Security indicators
