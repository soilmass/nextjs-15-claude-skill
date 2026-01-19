---
id: pt-payments
name: Payment Processing
version: 1.1.0
layer: L5
category: commerce
description: Generic payment processing patterns with Stripe integration
tags: [commerce, payments, stripe, checkout, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../atoms/feedback-spinner.md
dependencies:
  stripe: "^17.0.0"
formula: "Payments = Stripe SDK + Server Actions + Webhooks + PaymentElement"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Payment Processing

## Overview

Payment processing is a critical component of any e-commerce application, requiring careful attention to security, reliability, and user experience. This pattern provides a comprehensive implementation for integrating Stripe with Next.js 15, covering everything from simple checkout flows to complex payment scenarios like subscriptions, split payments, and saved payment methods.

The architecture follows best practices for PCI compliance by keeping sensitive payment data on Stripe's servers rather than handling it directly. All payment amounts are validated server-side to prevent price manipulation, and webhook handlers ensure reliable processing of asynchronous payment events. The pattern supports both hosted checkout (Stripe Checkout) and embedded payment forms (Stripe Elements) to accommodate different UX requirements.

Modern payment flows must handle various edge cases: failed payments, 3D Secure authentication, currency conversion, tax calculation, and payment method management. This pattern addresses these scenarios with proper error handling, idempotency keys for retry safety, and comprehensive webhook event processing to maintain data consistency between your application and Stripe.

## When to Use

- E-commerce checkout flows for one-time purchases
- Subscription billing with recurring payments
- Donation and crowdfunding platforms
- Pay-per-use features or metered billing
- Marketplace payments with connected accounts
- Invoice-based B2B payments

## When NOT to Use

- **Crypto payments**: Use specialized crypto payment processors
- **Bank transfers only**: May not need full Stripe integration
- **Free products**: No payment processing needed
- **Highly regulated industries**: May require specialized payment solutions (gambling, adult content)

## Composition Diagram

```
Payment Processing Architecture
================================

┌─────────────────────────────────────────────────────────────────────────┐
│                         Client Browser                                   │
│                                                                          │
│  ┌────────────────────┐     ┌─────────────────────────────────────┐    │
│  │   Checkout Page    │     │         Payment Form                 │    │
│  │                    │     │  ┌─────────────────────────────┐    │    │
│  │  [Product Summary] │     │  │  Stripe PaymentElement      │    │    │
│  │  [Shipping Info]   │     │  │  (Credit Card, Apple Pay,   │    │    │
│  │  [Payment Button]  │     │  │   Google Pay, etc.)         │    │    │
│  └─────────┬──────────┘     │  └─────────────────────────────┘    │    │
│            │                 └──────────────┬──────────────────────┘    │
│            │                                │                           │
└────────────┼────────────────────────────────┼───────────────────────────┘
             │                                │
             ▼                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Next.js Server                                     │
│                                                                          │
│  ┌─────────────────────┐    ┌─────────────────────┐                    │
│  │ POST /api/checkout  │    │ POST /api/payment   │                    │
│  │                     │    │                     │                    │
│  │ - Validate items    │    │ - Create/Confirm    │                    │
│  │ - Calculate total   │    │   PaymentIntent     │                    │
│  │ - Create session    │    │ - Handle 3D Secure  │                    │
│  └─────────┬───────────┘    └──────────┬──────────┘                    │
│            │                           │                                │
│            └───────────┬───────────────┘                                │
│                        │                                                │
│                        ▼                                                │
│           ┌────────────────────────────┐                               │
│           │    Database (Prisma)       │                               │
│           │    - Orders                │                               │
│           │    - PaymentIntents        │                               │
│           │    - Customers             │                               │
│           └────────────────────────────┘                               │
└────────────────────────────────────────────────────────────────────────┘
             │                           ▲
             ▼                           │ Webhook Events
┌─────────────────────────────────────────────────────────────────────────┐
│                         Stripe API                                       │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Checkout        │  │ PaymentIntents  │  │ Webhooks        │         │
│  │ Sessions        │  │                 │  │                 │         │
│  │                 │  │ - Create        │  │ - payment_      │         │
│  │ - Hosted page   │  │ - Confirm       │  │   intent.*      │         │
│  │ - Line items    │  │ - Capture       │  │ - checkout.*    │         │
│  │ - Success URL   │  │ - Refund        │  │ - invoice.*     │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘

Payment Flow:
=============
1. Client initiates checkout
2. Server validates cart and creates Stripe session/PaymentIntent
3. Client collects payment details via Stripe Elements
4. Stripe processes payment (handles 3DS if needed)
5. Webhook confirms successful payment
6. Server fulfills order
```

## Implementation

### Stripe Setup

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// lib/stripe-client.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}
```

### Checkout Session Creation

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive().max(99),
    variantId: z.string().optional(),
  })).min(1).max(50),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, successUrl, cancelUrl, couponCode } = checkoutSchema.parse(body);

    // Fetch products from database (NEVER trust client prices)
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, published: true },
      include: { variants: true },
    });

    // Validate all items exist
    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Check inventory
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}`);
      }

      // Get variant price if applicable
      let price = product.price;
      let name = product.name;
      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          price = variant.price || product.price;
          name = `${product.name} - ${variant.name}`;
        }
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name,
            description: product.description || undefined,
            images: product.images.slice(0, 8), // Stripe limits to 8 images
            metadata: {
              productId: product.id,
              variantId: item.variantId || '',
            },
          },
          unit_amount: price, // Price in cents
        },
        quantity: item.quantity,
      };
    });

    // Apply coupon if provided
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (couponCode) {
      try {
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (coupon.valid) {
          discounts = [{ coupon: coupon.id }];
        }
      } catch {
        // Invalid coupon, ignore
      }
    }

    // Get or create Stripe customer
    let customerId: string | undefined;
    const existingCustomer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (existingCustomer?.stripeCustomerId) {
      customerId = existingCustomer.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: lineItems,
      discounts,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' },
            display_name: 'Express shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ],
      success_url: successUrl || `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/checkout/cancel`,
      metadata: {
        userId: session.user.id,
        items: JSON.stringify(items),
      },
      payment_intent_data: {
        metadata: {
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Checkout Button Component

```typescript
// components/checkout-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface CheckoutButtonProps {
  items?: Array<{ productId: string; quantity: number; variantId?: string }>;
  couponCode?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({
  items: propItems,
  couponCode,
  className,
  children,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items: cartItems, clearCart } = useCart();

  const items = propItems || cartItems;

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, couponCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCheckout}
        disabled={isLoading || items.length === 0}
        className={className}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {children || 'Checkout'}
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDispute(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Check if order already exists (idempotency)
  const existingOrder = await prisma.order.findFirst({
    where: { stripeSessionId: session.id },
  });

  if (existingOrder) {
    console.log('Order already exists for session:', session.id);
    return;
  }

  // Parse items from metadata
  const items = JSON.parse(session.metadata?.items || '[]');

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      stripeSessionId: session.id,
      paymentIntent: session.payment_intent as string,
      status: 'PAID',
      subtotal: session.amount_subtotal! / 100,
      tax: (session.total_details?.amount_tax || 0) / 100,
      shipping: (session.total_details?.amount_shipping || 0) / 100,
      discount: (session.total_details?.amount_discount || 0) / 100,
      total: session.amount_total! / 100,
      currency: session.currency!,
      shippingAddress: session.shipping_details?.address as any,
      billingAddress: session.customer_details?.address as any,
      customerEmail: session.customer_details?.email || '',
      customerName: session.customer_details?.name || '',
      items: {
        create: await Promise.all(
          items.map(async (item: any) => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
            });
            return {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: product?.price || 0,
              name: product?.name || '',
            };
          })
        ),
      },
    },
    include: { items: true },
  });

  // Decrement inventory
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { inventory: { decrement: item.quantity } },
    });
  }

  // Send order confirmation email
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.email) {
    await sendEmail({
      to: user.email,
      template: 'order-confirmation',
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        items: order.items,
      },
    });
  }

  console.log('Order created:', order.id);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  console.log('Checkout session expired:', session.id);
  // Could notify user or log for analytics
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // Update order status if using PaymentIntents directly
  await prisma.order.updateMany({
    where: { paymentIntent: paymentIntent.id },
    data: { status: 'PAID' },
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', paymentIntent.id);

  await prisma.order.updateMany({
    where: { paymentIntent: paymentIntent.id },
    data: { status: 'PAYMENT_FAILED' },
  });

  // Notify user
  const userId = paymentIntent.metadata?.userId;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await sendEmail({
        to: user.email,
        template: 'payment-failed',
        data: {
          amount: paymentIntent.amount / 100,
          error: paymentIntent.last_payment_error?.message,
        },
      });
    }
  }
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('Refund processed:', charge.id);

  await prisma.order.updateMany({
    where: { paymentIntent: charge.payment_intent as string },
    data: {
      status: charge.refunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundedAmount: charge.amount_refunded / 100,
    },
  });
}

async function handleDispute(dispute: Stripe.Dispute) {
  console.error('Dispute created:', dispute.id);

  // Mark order as disputed
  const charge = await stripe.charges.retrieve(dispute.charge as string);

  await prisma.order.updateMany({
    where: { paymentIntent: charge.payment_intent as string },
    data: {
      status: 'DISPUTED',
      disputeId: dispute.id,
    },
  });

  // Alert admin
  await sendEmail({
    to: process.env.ADMIN_EMAIL!,
    template: 'dispute-alert',
    data: {
      disputeId: dispute.id,
      amount: dispute.amount / 100,
      reason: dispute.reason,
    },
  });
}
```

### Embedded Payment Form

```typescript
// components/payment-form.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentFormProps {
  clientSecret: string;
  returnUrl: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function PaymentFormInner({
  returnUrl,
  amount,
  onSuccess,
  onError,
}: Omit<PaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      const message = submitError.message || 'Payment failed';
      setError(message);
      onError?.(message);
      setIsProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Payment Method</label>
          <PaymentElement
            onReady={() => setIsReady(true)}
            options={{
              layout: 'accordion',
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Billing Address</label>
          <AddressElement options={{ mode: 'billing' }} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex justify-between mb-4">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">{formatCurrency(amount / 100)}</span>
        </div>

        <Button
          type="submit"
          disabled={!stripe || !isReady || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay {formatCurrency(amount / 100)}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Your payment is secured by Stripe
        </p>
      </div>
    </form>
  );
}

export function PaymentForm({ clientSecret, ...props }: PaymentFormProps) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0070f3',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
          rules: {
            '.Input': {
              border: '1px solid #e5e7eb',
            },
            '.Input:focus': {
              border: '1px solid #0070f3',
              boxShadow: '0 0 0 1px #0070f3',
            },
          },
        },
      }}
    >
      <PaymentFormInner {...props} />
    </Elements>
  );
}
```

### Create Payment Intent API

```typescript
// app/api/payment/create-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const createIntentSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })),
  savePaymentMethod: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, savePaymentMethod } = createIntentSchema.parse(body);

    // Calculate total from database (NEVER from client)
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let amount = 0;
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }
      amount += product.price * item.quantity;
    }

    // Get or create customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      setup_future_usage: savePaymentMethod ? 'on_session' : undefined,
      metadata: {
        userId: session.user.id,
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
```

## Examples

### Example 1: Complete Checkout Page

```tsx
// app/checkout/page.tsx
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { CheckoutForm } from '@/components/checkout-form';
import { OrderSummary } from '@/components/order-summary';

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=/checkout');
  }

  // Get cart from database or session
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <Suspense fallback={<div>Loading payment form...</div>}>
            <CheckoutForm
              items={cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              }))}
            />
          </Suspense>
        </div>

        <div>
          <OrderSummary
            items={cart.items}
            subtotal={subtotal}
          />
        </div>
      </div>
    </div>
  );
}

// components/checkout-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { PaymentForm } from '@/components/payment-form';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  items: Array<{ productId: string; quantity: number }>;
}

export function CheckoutForm({ items }: CheckoutFormProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setClientSecret(data.clientSecret);
        setAmount(data.amount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      }
    }

    createPaymentIntent();
  }, [items]);

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <PaymentForm
      clientSecret={clientSecret}
      returnUrl={`${window.location.origin}/checkout/success`}
      amount={amount}
      onSuccess={() => {
        router.push('/checkout/success');
      }}
      onError={(error) => {
        setError(error);
      }}
    />
  );
}
```

### Example 2: Subscription Checkout

```typescript
// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await request.json();

  // Get or create customer
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  let customerId = user?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${request.nextUrl.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.nextUrl.origin}/pricing`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId: session.user.id },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

// Subscription management page
// app/account/subscription/page.tsx
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { SubscriptionCard } from '@/components/subscription-card';

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  if (!user?.stripeCustomerId) {
    return <div>No subscription found. <a href="/pricing">View pricing</a></div>;
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: 'all',
    expand: ['data.default_payment_method'],
  });

  const activeSubscription = subscriptions.data.find(
    s => s.status === 'active' || s.status === 'trialing'
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription</h1>

      {activeSubscription ? (
        <SubscriptionCard subscription={activeSubscription} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No active subscription</p>
          <a href="/pricing" className="text-primary hover:underline">
            View pricing plans
          </a>
        </div>
      )}
    </div>
  );
}
```

### Example 3: Saved Payment Methods

```typescript
// components/saved-payment-methods.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Trash2, Plus } from 'lucide-react';
import { AddPaymentMethodModal } from './add-payment-method-modal';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export function SavedPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const response = await fetch('/api/payment-methods');
    const data = await response.json();
    setMethods(data.paymentMethods || []);
    setIsLoading(false);
  };

  const deleteMethod = async (id: string) => {
    if (!confirm('Remove this payment method?')) return;

    await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
    setMethods(methods.filter(m => m.id !== id));
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/payment-methods/${id}/default`, { method: 'POST' });
    setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
  };

  if (isLoading) {
    return <div>Loading payment methods...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Payment Methods</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {methods.length === 0 ? (
        <p className="text-muted-foreground text-sm">No saved payment methods</p>
      ) : (
        <div className="space-y-2">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium capitalize">
                    {method.brand} **** {method.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
                {method.isDefault && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefault(method.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMethod(method.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPaymentMethodModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchPaymentMethods();
        }}
      />
    </div>
  );
}
```

## Anti-patterns

### 1. Trusting Client-Side Prices

```typescript
// BAD - Using price from client request
export async function POST(request: NextRequest) {
  const { productId, price, quantity } = await request.json();

  // DANGER: Attacker can send price: 1
  await stripe.paymentIntents.create({
    amount: price * quantity,
    currency: 'usd',
  });
}

// GOOD - Always fetch price from database
export async function POST(request: NextRequest) {
  const { productId, quantity } = await request.json();

  // Fetch actual price from database
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  await stripe.paymentIntents.create({
    amount: product.price * quantity,
    currency: 'usd',
  });
}
```

### 2. Not Verifying Webhook Signatures

```typescript
// BAD - Processing webhooks without verification
export async function POST(request: NextRequest) {
  const body = await request.json();

  // DANGER: Anyone can send fake events
  if (body.type === 'checkout.session.completed') {
    await fulfillOrder(body.data.object);
  }
}

// GOOD - Always verify webhook signatures
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Now safe to process
  if (event.type === 'checkout.session.completed') {
    await fulfillOrder(event.data.object);
  }
}
```

### 3. No Idempotency Handling

```typescript
// BAD - Creating duplicate orders on retry
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // DANGER: Webhook might be delivered multiple times
  await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      // ...
    },
  });
}

// GOOD - Check for existing order first
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Check if already processed
  const existingOrder = await prisma.order.findFirst({
    where: { stripeSessionId: session.id },
  });

  if (existingOrder) {
    console.log('Order already exists, skipping');
    return;
  }

  await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      // ...
    },
  });
}
```

### 4. Exposing Secret Keys

```typescript
// BAD - Using secret key on client
// components/payment.tsx
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // LEAKED!

// GOOD - Use publishable key on client, secret on server
// Client: lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Server: lib/stripe.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

## Testing

### Unit Tests

```typescript
// __tests__/api/checkout.test.ts
import { POST } from '@/app/api/checkout/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';

jest.mock('@/lib/db');
jest.mock('@/lib/stripe');
jest.mock('@/lib/auth');

describe('POST /api/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates checkout session for valid request', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    });

    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 'prod-1', name: 'Test Product', price: 2000, inventory: 10, images: [], variants: [] },
    ]);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      stripeCustomerId: 'cus_123',
    });

    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      url: 'https://checkout.stripe.com/session',
      id: 'cs_123',
    });

    const request = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe('https://checkout.stripe.com/session');
  });

  it('returns 401 for unauthenticated request', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ items: [] }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid product', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    });

    (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 'invalid', quantity: 1 }],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

### Webhook Testing

```typescript
// __tests__/api/webhooks/stripe.test.ts
import { POST } from '@/app/api/webhooks/stripe/route';
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

jest.mock('@/lib/stripe');
jest.mock('@/lib/db');

describe('Stripe Webhooks', () => {
  const mockEvent = (type: string, data: any) => ({
    type,
    data: { object: data },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates order on checkout.session.completed', async () => {
    const session = {
      id: 'cs_test',
      payment_intent: 'pi_test',
      amount_total: 5000,
      amount_subtotal: 4500,
      currency: 'usd',
      customer_details: { email: 'test@example.com' },
      metadata: {
        userId: 'user-1',
        items: JSON.stringify([{ productId: 'prod-1', quantity: 1 }]),
      },
      total_details: { amount_tax: 500 },
    };

    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
      mockEvent('checkout.session.completed', session)
    );

    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.order.create as jest.Mock).mockResolvedValue({ id: 'order-1' });
    (prisma.product.findUnique as jest.Mock).mockResolvedValue({ price: 4500 });
    (prisma.product.update as jest.Mock).mockResolvedValue({});
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(session),
      headers: {
        'stripe-signature': 'valid_signature',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.order.create).toHaveBeenCalled();
  });

  it('handles idempotency for duplicate events', async () => {
    const session = { id: 'cs_test', metadata: { userId: 'user-1' } };

    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
      mockEvent('checkout.session.completed', session)
    );

    (prisma.order.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-order' });

    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(session),
      headers: { 'stripe-signature': 'valid_signature' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });
});
```

### Integration Testing with Stripe CLI

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## Related Skills

- [recurring-transactions](./recurring-transactions.md) - Subscription management
- [server-actions](./server-actions.md) - Form handling for checkout
- [cart-management](./cart-management.md) - Shopping cart patterns
- [order-management](./order-management.md) - Order processing workflows
- [returns-management](./returns-management.md) - Refund processing

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive Overview section (3 paragraphs)
- Added When NOT to Use section with 4 scenarios
- Added detailed Composition Diagram with payment flow
- Expanded checkout session with shipping, coupons, and customer management
- Added 3 complete examples (checkout page, subscriptions, saved payment methods)
- Expanded anti-patterns from 1 to 4 with detailed code comparisons
- Added comprehensive testing section with unit tests and webhook testing
- Added embedded payment form with address collection
- Enhanced webhook handler with more event types

### 1.0.0 (2025-01-18)
- Initial implementation
- Stripe checkout integration
- Webhook handling
- Embedded payment form
