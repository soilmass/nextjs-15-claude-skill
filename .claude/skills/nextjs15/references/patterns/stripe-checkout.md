---
id: pt-stripe-checkout
name: Stripe Checkout Patterns
version: 2.0.0
layer: L5
category: payments
description: Stripe Checkout integration for one-time payments with Next.js 15
tags: [stripe, payments, checkout, e-commerce, billing]
composes:
  - ../atoms/input-button.md
dependencies:
  stripe: "^17.0.0"
formula: Checkout Session + Success/Cancel URLs + Webhooks = Payment Flow
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- One-time product purchases
- Subscription signups
- Donation collection
- E-commerce checkout
- Digital product sales

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Stripe Checkout Flow                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User clicks "Buy Now"                                      │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Server Action: Create Checkout Session              │   │
│  │                                                     │   │
│  │ stripe.checkout.sessions.create({                   │   │
│  │   mode: 'payment' | 'subscription',                │   │
│  │   line_items: [...],                               │   │
│  │   success_url: '/success?session_id={CHECKOUT_..}',│   │
│  │   cancel_url: '/cart',                             │   │
│  │   metadata: { userId, orderId }                    │   │
│  │ })                                                  │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Redirect to Stripe-Hosted Checkout Page             │   │
│  │ - Credit card, Apple Pay, Google Pay                │   │
│  │ - 3D Secure handling                                │   │
│  │ - Address collection                                │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│         ┌──────────────┴──────────────┐                    │
│         ▼                             ▼                    │
│  /success?session_id=...       /cancel                     │
│  + Webhook confirmation        (return to cart)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Stripe Checkout Patterns

## Overview

Stripe Checkout provides a pre-built, hosted payment page that handles card validation, 3D Secure, and localization. This pattern covers server-side session creation and client-side integration.

## Implementation

### Stripe Configuration

```typescript
// lib/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

// lib/stripe-client.ts
import { loadStripe, Stripe as StripeClient } from "@stripe/stripe-js";

let stripePromise: Promise<StripeClient | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}
```

### Create Checkout Session

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { items, successUrl, cancelUrl } = checkoutSchema.parse(body);

    // Fetch products from database
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 400 }
      );
    }

    // Build line items
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.images.length > 0 ? [product.images[0]] : undefined,
            metadata: {
              productId: product.id,
            },
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      customer_email: session?.user?.email || undefined,
      client_reference_id: session?.user?.id || undefined,
      metadata: {
        userId: session?.user?.id || "guest",
        items: JSON.stringify(items),
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "DE", "FR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1500, currency: "usd" },
            display_name: "Express shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
      ],
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

### Checkout Button Component

```typescript
// components/checkout-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getStripe } from "@/lib/stripe-client";
import { toast } from "sonner";

interface CheckoutButtonProps {
  items: { productId: string; quantity: number }[];
  className?: string;
}

export function CheckoutButton({ items, className }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        toast.error(error);
        return;
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        // Or use Stripe.js redirect
        const stripe = await getStripe();
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            toast.error(error.message);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || items.length === 0}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Checkout"
      )}
    </Button>
  );
}
```

### Success Page

```typescript
// app/checkout/success/page.tsx
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  // Retrieve the session from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "customer", "payment_intent"],
  });

  if (session.payment_status !== "paid") {
    redirect("/checkout/cancel");
  }

  // Get order details
  const order = await prisma.order.findFirst({
    where: { stripeSessionId: session_id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="container max-w-2xl py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      
      <h1 className="mt-6 text-3xl font-bold">Thank you for your order!</h1>
      
      <p className="mt-4 text-muted-foreground">
        Your order has been confirmed. We've sent a confirmation email to{" "}
        <span className="font-medium text-foreground">
          {session.customer_details?.email}
        </span>
      </p>

      {order && (
        <div className="mt-8 rounded-lg border p-6 text-left">
          <h2 className="font-semibold">Order Summary</h2>
          <p className="text-sm text-muted-foreground">
            Order ID: {order.id}
          </p>
          
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 border-t pt-4 font-semibold">
            <div className="flex justify-between">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href="/orders">View Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment ${paymentIntent.id} succeeded`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment ${paymentIntent.id} failed`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const items = JSON.parse(session.metadata?.items || "[]");
  const userId = session.metadata?.userId;

  // Create order in database
  const order = await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      userId: userId !== "guest" ? userId : null,
      email: session.customer_details?.email || "",
      status: "PAID",
      total: session.amount_total! / 100,
      currency: session.currency!,
      shippingAddress: session.shipping_details
        ? {
            name: session.shipping_details.name,
            ...session.shipping_details.address,
          }
        : undefined,
      items: {
        create: await Promise.all(
          items.map(async (item: { productId: string; quantity: number }) => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
            });
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product!.price,
            };
          })
        ),
      },
    },
  });

  // Update inventory
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
      },
    });
  }

  // Send confirmation email
  // await sendOrderConfirmationEmail(order);

  console.log(`Order ${order.id} created for session ${session.id}`);
}
```

### Embedded Checkout (Alternative)

```typescript
// components/embedded-checkout.tsx
"use client";

import { useEffect, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";

interface EmbeddedCheckoutFormProps {
  items: { productId: string; quantity: number }[];
}

export function EmbeddedCheckoutForm({ items }: EmbeddedCheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout/embedded", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [items]);

  if (!clientSecret) {
    return <div>Loading checkout...</div>;
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={getStripe()}
      options={{ clientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
```

## Variants

### Price-Based Checkout (Pre-created Prices)

```typescript
// Using Stripe Dashboard prices instead of dynamic pricing
const lineItems = items.map((item) => ({
  price: item.stripePriceId, // pre-created in Stripe
  quantity: item.quantity,
}));
```

### Guest Checkout with Account Creation

```typescript
// After checkout, offer account creation
if (session.customer_email && !session.client_reference_id) {
  // Send email with account creation link
  await sendAccountCreationEmail(session.customer_email, order.id);
}
```

## Anti-patterns

1. **Trusting client prices**: Always fetch prices server-side
2. **No webhook handling**: Missing order creation on async payment
3. **No idempotency**: Processing same webhook multiple times
4. **Missing error handling**: Silent failures on checkout
5. **No stock validation**: Overselling products

## Related Skills

- `L5/patterns/stripe-webhooks` - Webhook handling
- `L5/patterns/stripe-subscriptions` - Recurring payments
- `L5/patterns/cart` - Shopping cart management
- `L5/patterns/order-management` - Order processing

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Stripe Checkout
