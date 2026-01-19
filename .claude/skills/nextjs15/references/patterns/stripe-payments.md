---
id: pt-stripe-payments
name: Stripe Payment Integration
version: 1.0.0
layer: L5
category: payments
description: Stripe payment integration for Next.js applications
tags: [stripe, payments, checkout, subscriptions, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../molecules/card.md
  - ../molecules/toast.md
dependencies:
  stripe: "^17.0.0"
formula: Stripe SDK + Webhooks + Checkout = Secure Payment Processing
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Stripe Payment Integration

## When to Use

- **One-time payments**: Product purchases, donations, services
- **Subscriptions**: SaaS billing, memberships, recurring payments
- **Marketplaces**: Split payments, Connect accounts
- **Checkout experiences**: Embedded or hosted checkout flows

**Avoid when**: Using alternative payment processors, or payments are not required.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Stripe Payment Architecture                                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Stripe Service                                        │  │
│  │  ├─ Checkout Sessions: One-time + subscriptions      │  │
│  │  ├─ Payment Intents: Custom payment flows            │  │
│  │  └─ Webhooks: Event handling + fulfillment           │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Pricing    │     │ Checkout     │     │ Customer    │   │
│  │ Display    │     │ Button       │     │ Portal      │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Stripe Client Setup

```typescript
// lib/stripe/client.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// lib/stripe/config.ts
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: ['5 projects', '1GB storage', 'Community support'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: ['Everything in Pro', 'Unlimited storage', 'Dedicated support', 'Custom integrations'],
  },
} as const;

export type PlanId = keyof typeof PLANS;
```

## Stripe Service

```typescript
// lib/stripe/service.ts
import { stripe } from './client';
import { db } from '@/lib/db';
import { PLANS, PlanId } from './config';

export class StripeService {
  async createCheckoutSession(
    userId: string,
    planId: PlanId,
    returnUrl: string
  ): Promise<string> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const plan = PLANS[planId];
    if (!plan.priceId) throw new Error('Free plan does not require checkout');

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: { userId, planId },
    });

    return session.url!;
  }

  async createCustomerPortalSession(userId: string, returnUrl: string): Promise<string> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) throw new Error('No Stripe customer');

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  async getSubscription(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    return user?.subscription;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

export const stripeService = new StripeService();
```

## Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { db } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, planId } = session.metadata!;
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      plan: planId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      plan: planId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'canceled' },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
    include: { user: true },
  });

  if (subscription?.user.email) {
    // Send payment failed email
    console.log(`Payment failed for ${subscription.user.email}`);
  }
}
```

## Pricing Component

```typescript
// components/pricing/pricing-table.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { PLANS, PlanId } from '@/lib/stripe/config';
import { useState } from 'react';
import { toast } from 'sonner';

interface PricingTableProps {
  currentPlan?: PlanId;
  userId?: string;
}

export function PricingTable({ currentPlan, userId }: PricingTableProps) {
  const [loading, setLoading] = useState<PlanId | null>(null);

  const handleSubscribe = async (planId: PlanId) => {
    if (!userId) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    setLoading(planId);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const { url, error } = await res.json();

      if (error) {
        toast.error(error);
        return;
      }

      window.location.href = url;
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([id, plan]) => (
        <Card key={id} className={id === 'pro' ? 'border-primary shadow-lg' : ''}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <div className="text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={id === 'pro' ? 'default' : 'outline'}
              disabled={currentPlan === id || loading !== null}
              onClick={() => handleSubscribe(id)}
            >
              {loading === id
                ? 'Loading...'
                : currentPlan === id
                ? 'Current Plan'
                : id === 'free'
                ? 'Get Started'
                : 'Subscribe'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

## API Routes

```typescript
// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripeService } from '@/lib/stripe/service';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { planId } = await request.json();
  const returnUrl = `${request.nextUrl.origin}/settings/billing`;

  try {
    const url = await stripeService.createCheckoutSession(
      session.user.id,
      planId,
      returnUrl
    );
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}

// app/api/stripe/portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripeService } from '@/lib/stripe/service';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const returnUrl = `${request.nextUrl.origin}/settings/billing`;

  try {
    const url = await stripeService.createCustomerPortalSession(
      session.user.id,
      returnUrl
    );
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Portal creation failed' },
      { status: 500 }
    );
  }
}
```

## Related Patterns

- [usage-metering](./usage-metering.md)
- [webhook-delivery](./webhook-delivery.md)
- [rbac](./rbac.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Checkout sessions
- Webhook handling
- Customer portal
- Pricing table component
