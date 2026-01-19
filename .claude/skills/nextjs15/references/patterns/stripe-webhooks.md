---
id: pt-stripe-webhooks
name: Stripe Webhooks
version: 2.0.0
layer: L5
category: payments
description: Handle Stripe webhook events for subscription lifecycle, payment status, and billing updates
tags: [stripe, webhooks, payments, subscriptions, billing, events]
composes: []
dependencies:
  stripe: "^17.0.0"
formula: Signature Verification + Event Handlers + Idempotency = Reliable Payment Processing
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

- Syncing subscription status to database
- Sending payment confirmation emails
- Handling failed payment retries
- Processing invoice events
- Fulfilling orders on payment success

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Stripe Webhook Flow                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Stripe Event                                               │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ /api/webhooks/stripe                                │   │
│  │                                                     │   │
│  │ 1. Verify signature (STRIPE_WEBHOOK_SECRET)         │   │
│  │ 2. Parse event type                                 │   │
│  │ 3. Check idempotency (event.id)                     │   │
│  │ 4. Route to handler                                 │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│         ┌──────────────┼──────────────┐                    │
│         ▼              ▼              ▼                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ checkout   │ │ invoice    │ │ customer   │             │
│  │ .session   │ │ .paid      │ │ .subscription            │
│  │ .completed │ │ .failed    │ │ .updated   │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│         │              │              │                    │
│         ▼              ▼              ▼                    │
│  Update DB      Send Email      Sync Status               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Stripe Webhooks

Handle Stripe webhook events reliably with signature verification and idempotency.

## Overview

This pattern covers:
- Webhook signature verification
- Subscription lifecycle events
- Payment success/failure handling
- Invoice events
- Idempotent event processing
- Error handling and retries

## Implementation

### Webhook Route Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/plans';
import { handleWebhookEvent } from '@/lib/stripe/webhook-handlers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    await handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Return 200 to prevent Stripe retries for handled errors
    // Return 500 only for transient errors that should be retried
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing - Stripe needs raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
```

### Webhook Event Handlers

```typescript
// lib/stripe/webhook-handlers.ts
import Stripe from 'stripe';
import { stripe, getPlanByPriceId } from './plans';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

type WebhookHandler = (event: Stripe.Event) => Promise<void>;

const handlers: Record<string, WebhookHandler> = {
  // Checkout completed - new subscription created
  'checkout.session.completed': async (event) => {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.mode !== 'subscription') return;

    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await prisma.subscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: subscriptionId,
        stripePriceId: subscription.items.data[0].price.id,
        planId: session.metadata?.planId || 'starter',
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEnd: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000) 
          : null,
      },
    });

    // Send welcome email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await sendEmail({
        to: user.email,
        template: 'subscription-welcome',
        data: { 
          planName: session.metadata?.planId || 'Starter',
          trialEnd: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000)
            : null,
        },
      });
    }
  },

  // Subscription updated (plan change, renewal, etc.)
  'customer.subscription.updated': async (event) => {
    const subscription = event.data.object as Stripe.Subscription;
    const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription>;

    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) {
      console.error('Subscription not found:', subscription.id);
      return;
    }

    const priceId = subscription.items.data[0].price.id;
    const plan = getPlanByPriceId(priceId);

    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        stripePriceId: priceId,
        planId: plan?.id || dbSubscription.planId,
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000) 
          : null,
      },
    });

    // Notify on plan changes
    if (previousAttributes?.items) {
      const user = await prisma.user.findUnique({ 
        where: { id: dbSubscription.userId } 
      });
      
      if (user?.email && plan) {
        await sendEmail({
          to: user.email,
          template: 'plan-changed',
          data: { planName: plan.name },
        });
      }
    }
  },

  // Subscription deleted/canceled
  'customer.subscription.deleted': async (event) => {
    const subscription = event.data.object as Stripe.Subscription;

    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true },
    });

    if (!dbSubscription) return;

    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELED',
        planId: 'free',
        stripeSubscriptionId: null,
        stripePriceId: null,
        canceledAt: new Date(),
      },
    });

    // Send cancellation email
    if (dbSubscription.user.email) {
      await sendEmail({
        to: dbSubscription.user.email,
        template: 'subscription-canceled',
        data: {},
      });
    }
  },

  // Trial will end soon
  'customer.subscription.trial_will_end': async (event) => {
    const subscription = event.data.object as Stripe.Subscription;

    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true },
    });

    if (!dbSubscription?.user.email) return;

    const trialEnd = subscription.trial_end 
      ? new Date(subscription.trial_end * 1000) 
      : null;

    await sendEmail({
      to: dbSubscription.user.email,
      template: 'trial-ending',
      data: { 
        trialEndDate: trialEnd,
        daysRemaining: trialEnd 
          ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0,
      },
    });
  },

  // Invoice paid successfully
  'invoice.paid': async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    
    if (!invoice.subscription) return;

    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
      include: { user: true },
    });

    if (!dbSubscription) return;

    // Update subscription status to active
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { status: 'ACTIVE' },
    });

    // Log payment
    await prisma.payment.create({
      data: {
        userId: dbSubscription.userId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: 'SUCCEEDED',
        paidAt: new Date(),
      },
    });

    // Send receipt
    if (dbSubscription.user.email && invoice.hosted_invoice_url) {
      await sendEmail({
        to: dbSubscription.user.email,
        template: 'payment-receipt',
        data: {
          amount: (invoice.amount_paid / 100).toFixed(2),
          currency: invoice.currency.toUpperCase(),
          invoiceUrl: invoice.hosted_invoice_url,
          receiptUrl: invoice.invoice_pdf,
        },
      });
    }
  },

  // Invoice payment failed
  'invoice.payment_failed': async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    
    if (!invoice.subscription) return;

    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
      include: { user: true },
    });

    if (!dbSubscription) return;

    // Update subscription status
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { status: 'PAST_DUE' },
    });

    // Log failed payment
    await prisma.payment.create({
      data: {
        userId: dbSubscription.userId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        status: 'FAILED',
        failureReason: invoice.last_finalization_error?.message,
      },
    });

    // Send payment failed email
    if (dbSubscription.user.email) {
      await sendEmail({
        to: dbSubscription.user.email,
        template: 'payment-failed',
        data: {
          amount: (invoice.amount_due / 100).toFixed(2),
          updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/update-payment`,
          nextRetryDate: invoice.next_payment_attempt 
            ? new Date(invoice.next_payment_attempt * 1000)
            : null,
        },
      });
    }
  },

  // Invoice requires action (3D Secure, etc.)
  'invoice.payment_action_required': async (event) => {
    const invoice = event.data.object as Stripe.Invoice;

    if (!invoice.subscription) return;

    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
      include: { user: true },
    });

    if (!dbSubscription?.user.email) return;

    await sendEmail({
      to: dbSubscription.user.email,
      template: 'payment-action-required',
      data: {
        actionUrl: invoice.hosted_invoice_url,
      },
    });
  },

  // Customer payment method updated
  'payment_method.attached': async (event) => {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;
    
    if (!paymentMethod.customer) return;

    const customerId = typeof paymentMethod.customer === 'string' 
      ? paymentMethod.customer 
      : paymentMethod.customer.id;

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });
  },
};

export async function handleWebhookEvent(event: Stripe.Event) {
  // Check for duplicate events (idempotency)
  const processed = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });

  if (processed) {
    console.log(`Event ${event.id} already processed`);
    return;
  }

  // Record event as processing
  await prisma.webhookEvent.create({
    data: {
      stripeEventId: event.id,
      type: event.type,
      status: 'PROCESSING',
    },
  });

  try {
    const handler = handlers[event.type];
    
    if (handler) {
      await handler(event);
    } else {
      console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Mark as completed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { status: 'COMPLETED' },
    });
  } catch (error) {
    // Mark as failed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status) {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    past_due: 'PAST_DUE',
    paused: 'PAUSED',
    trialing: 'TRIALING',
    unpaid: 'UNPAID',
  };
  return statusMap[status] || 'ACTIVE';
}
```

### Database Schema for Webhooks

```typescript
// prisma/schema.prisma additions
/*
model WebhookEvent {
  id            String   @id @default(cuid())
  stripeEventId String   @unique
  type          String
  status        WebhookStatus @default(PROCESSING)
  error         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([stripeEventId])
  @@index([status])
}

model Payment {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  stripeInvoiceId String   @unique
  amount          Float
  currency        String
  status          PaymentStatus
  paidAt          DateTime?
  failureReason   String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

enum WebhookStatus {
  PROCESSING
  COMPLETED
  FAILED
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}
*/
```

### Webhook Testing and Debugging

```typescript
// lib/stripe/webhook-testing.ts
import Stripe from 'stripe';
import { stripe } from './plans';

/**
 * Manually trigger a webhook event for testing
 */
export async function triggerTestEvent(
  eventType: string,
  data: Record<string, unknown>
) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot trigger test events in production');
  }

  const event: Stripe.Event = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2024-11-20.acacia',
    created: Math.floor(Date.now() / 1000),
    type: eventType as Stripe.Event.Type,
    livemode: false,
    pending_webhooks: 0,
    request: null,
    data: {
      object: data as unknown as Stripe.Event.Data.Object,
    },
  };

  // Import handler
  const { handleWebhookEvent } = await import('./webhook-handlers');
  await handleWebhookEvent(event);

  return event;
}

/**
 * Replay a failed webhook event
 */
export async function replayWebhookEvent(eventId: string) {
  const event = await stripe.events.retrieve(eventId);
  
  const { handleWebhookEvent } = await import('./webhook-handlers');
  
  // Delete existing record to allow reprocessing
  await prisma.webhookEvent.delete({
    where: { stripeEventId: eventId },
  }).catch(() => {});

  await handleWebhookEvent(event);
  
  return event;
}

import { prisma } from '@/lib/prisma';
```

### CLI Webhook Testing

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger specific events for testing
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted

# View recent webhook events
stripe events list --limit 10
```

### Webhook Retry Handler

```typescript
// lib/stripe/webhook-retry.ts
import { prisma } from '@/lib/prisma';
import { stripe } from './plans';
import { handleWebhookEvent } from './webhook-handlers';

/**
 * Retry failed webhook events
 */
export async function retryFailedWebhooks(maxRetries: number = 3) {
  const failedEvents = await prisma.webhookEvent.findMany({
    where: {
      status: 'FAILED',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  const results = [];

  for (const failedEvent of failedEvents) {
    try {
      // Fetch original event from Stripe
      const event = await stripe.events.retrieve(failedEvent.stripeEventId);

      // Delete failed record
      await prisma.webhookEvent.delete({
        where: { id: failedEvent.id },
      });

      // Reprocess
      await handleWebhookEvent(event);

      results.push({ 
        eventId: failedEvent.stripeEventId, 
        status: 'retried' 
      });
    } catch (error) {
      results.push({
        eventId: failedEvent.stripeEventId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Scheduled job to retry failed webhooks
 */
export async function scheduledWebhookRetry() {
  console.log('Starting scheduled webhook retry...');
  const results = await retryFailedWebhooks();
  console.log('Webhook retry completed:', results);
  return results;
}
```

## Variants

### Webhook Queue Processing

```typescript
// lib/stripe/webhook-queue.ts
import { Queue, Worker } from 'bullmq';
import { handleWebhookEvent } from './webhook-handlers';
import Stripe from 'stripe';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const webhookQueue = new Queue('stripe-webhooks', { connection });

// Add event to queue instead of processing immediately
export async function queueWebhookEvent(event: Stripe.Event) {
  await webhookQueue.add(event.type, event, {
    jobId: event.id, // Ensures idempotency
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}

// Worker processes events from queue
export const webhookWorker = new Worker(
  'stripe-webhooks',
  async (job) => {
    await handleWebhookEvent(job.data as Stripe.Event);
  },
  { connection }
);

webhookWorker.on('failed', (job, err) => {
  console.error(`Webhook job ${job?.id} failed:`, err);
});
```

### Multi-Environment Webhook Handling

```typescript
// lib/stripe/multi-env-webhooks.ts
const webhookSecrets = {
  production: process.env.STRIPE_WEBHOOK_SECRET_PROD,
  staging: process.env.STRIPE_WEBHOOK_SECRET_STAGING,
  development: process.env.STRIPE_WEBHOOK_SECRET_DEV,
};

export function getWebhookSecret(environment?: string) {
  const env = environment || process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return webhookSecrets.production;
  }
  
  // In non-production, try environment-specific or fallback
  return webhookSecrets[env as keyof typeof webhookSecrets] 
    || webhookSecrets.development;
}
```

## Anti-patterns

1. **Not verifying signatures** - Always verify webhook signatures
2. **Synchronous processing** - Use queues for long-running handlers
3. **No idempotency** - Always track processed events to prevent duplicates
4. **Missing event types** - Handle all relevant subscription lifecycle events
5. **Not handling retries** - Stripe retries failed webhooks; handle gracefully
6. **Blocking responses** - Return 200 quickly, process async

## Related Skills

- [[stripe-subscriptions]] - Subscription management
- [[stripe-checkout]] - Checkout session creation
- [[queues]] - Background job processing
- [[error-handling]] - Error handling patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial webhook handling pattern with idempotency and retry logic
