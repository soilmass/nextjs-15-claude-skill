---
id: pt-recurring-transactions
name: Recurring Transactions
version: 1.0.0
layer: L5
category: commerce
description: Handle recurring billing, subscriptions, and scheduled transactions
tags: [commerce, subscriptions, billing, stripe, next15, react19]
composes:
  - ../atoms/input-button.md
dependencies:
  prisma: "^6.0.0"
formula: "RecurringTransactions = StripeSubscriptions + Webhooks + BillingPortal + UsageTracking"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Recurring Transactions

## Overview

Recurring transactions handle subscription billing, usage-based pricing, and scheduled payments. This pattern covers Stripe subscriptions with webhooks for reliable billing.

## When to Use

- SaaS subscription billing
- Membership platforms
- Usage-based pricing
- Scheduled recurring payments
- Trial and upgrade flows

## Subscription Schema

```prisma
// prisma/schema.prisma
model Subscription {
  id                   String   @id @default(cuid())
  userId               String
  user                 User     @relation(fields: [userId], references: [id])
  stripeSubscriptionId String   @unique
  stripeCustomerId     String
  stripePriceId        String
  status               SubscriptionStatus
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean  @default(false)
  canceledAt           DateTime?
  trialStart           DateTime?
  trialEnd             DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([userId])
  @@index([stripeCustomerId])
  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  TRIALING
  INCOMPLETE
  INCOMPLETE_EXPIRED
}

model UsageRecord {
  id             String   @id @default(cuid())
  subscriptionId String
  quantity       Int
  timestamp      DateTime @default(now())
  idempotencyKey String   @unique

  @@index([subscriptionId])
  @@map("usage_records")
}
```

## Subscription Service

```typescript
// lib/subscriptions/service.ts
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import type { Stripe } from 'stripe';

export async function createSubscription(
  userId: string,
  priceId: string,
  paymentMethodId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) throw new Error('User not found');

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { userId },
    });
    customerId = customer.id;

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  // Attach payment method
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) throw new Error('Subscription not found');

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: true },
  });
}

export async function resumeSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) throw new Error('Subscription not found');

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: false },
  });
}

export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) throw new Error('Subscription not found');

  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripeSubscriptionId
  );

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [
      {
        id: stripeSubscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}
```

## Subscription Webhook Handler

```typescript
// app/api/webhooks/stripe/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import type Stripe from 'stripe';

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
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED',
            canceledAt: new Date(),
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: 'ACTIVE' },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: 'PAST_DUE' },
          });
          // Send email notification
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    trialing: 'TRIALING',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
  };

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: subscription.items.data[0].price.id,
      status: statusMap[subscription.status] as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
    update: {
      stripePriceId: subscription.items.data[0].price.id,
      status: statusMap[subscription.status] as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}
```

## Billing Portal

```typescript
// app/api/billing/portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No billing account found' },
      { status: 400 }
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${request.nextUrl.origin}/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

## Subscription Status Component

```typescript
// components/subscription-status.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface SubscriptionStatusProps {
  subscription: {
    status: string;
    stripePriceId: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null;
  plans: Array<{ id: string; name: string; price: number }>;
}

export function SubscriptionStatus({ subscription, plans }: SubscriptionStatusProps) {
  const currentPlan = plans.find((p) => p.id === subscription?.stripePriceId);

  const openPortal = async () => {
    const response = await fetch('/api/billing/portal', { method: 'POST' });
    const { url } = await response.json();
    window.location.href = url;
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Choose a plan to get started.
          </p>
          <Button asChild>
            <a href="/pricing">View Plans</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{currentPlan?.name || 'Subscription'}</CardTitle>
          <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {subscription.cancelAtPeriodEnd
              ? 'Cancels on'
              : 'Renews on'}
          </p>
          <p className="font-medium">
            {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={openPortal}>
            Manage Billing
          </Button>
          {subscription.cancelAtPeriodEnd && (
            <Button>Resume Subscription</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Anti-patterns

### Don't Trust Client for Subscription Status

```typescript
// BAD - Trusting client state
if (user.isPremium) {
  showPremiumFeature();
}

// GOOD - Check database/Stripe
const subscription = await prisma.subscription.findUnique({
  where: { userId: user.id, status: 'ACTIVE' },
});
if (subscription) showPremiumFeature();
```

## Related Skills

- [payments](./payments.md)
- [webhooks](./webhooks.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Stripe subscriptions
- Webhook handling
- Billing portal
