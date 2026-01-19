---
id: pt-webhooks
name: Webhook Handlers
version: 2.0.0
layer: L5
category: data
description: Securely receive and process webhooks from third-party services
tags: [api, webhooks, stripe, clerk, next15]
composes: []
dependencies:
  stripe: "^17.0.0"
formula: "Webhook = SignatureVerification + EventRouting + IdempotencyCheck + AsyncProcessing"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Webhook Handlers

## Overview

Webhooks allow external services to notify your application of events. This pattern covers secure webhook handling with signature verification, idempotency, and error handling for services like Stripe, Clerk, GitHub, and more.

## When to Use

- Receiving payment events from Stripe (checkout completed, subscription changes)
- Syncing user data from authentication providers (Clerk, Auth0)
- Responding to GitHub events (push, pull request, issues)
- Processing third-party service notifications in real-time
- Building event-driven integrations with external APIs

## Composition Diagram

```
[External Service] --HTTP POST--> [Webhook Route]
                                       |
                        +-----------------------------+
                        |                             |
                  [Signature        [Missing Signature]
                   Verification]          |
                        |            [400 Error]
                        v
                  [Event Parsing]
                        |
                  [Idempotency Check]
                        |
            +-----------+-----------+
            |                       |
      [Already Processed]    [New Event]
            |                       |
      [Return 200]           [Queue Processing]
                                    |
                             [Event Handler]
                                    |
                             [Database Update]
```

## Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) throw new Error('No user ID in session metadata');

  await prisma.order.create({
    data: {
      userId,
      stripeSessionId: session.id,
      amount: session.amount_total! / 100,
      status: 'completed',
    },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) throw new Error('User not found for customer');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPriceId: subscription.items.data[0]?.price.id,
      subscriptionCurrentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ),
    },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: 'canceled',
      subscriptionId: null,
    },
  });
}
```

## Clerk Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  const body = await request.text();

  const wh = new Webhook(webhookSecret);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } =
          event.data;

        await prisma.user.create({
          data: {
            clerkId: id,
            email: email_addresses[0]?.email_address || '',
            name: [first_name, last_name].filter(Boolean).join(' ') || null,
            image: image_url || null,
          },
        });
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } =
          event.data;

        await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: email_addresses[0]?.email_address,
            name: [first_name, last_name].filter(Boolean).join(' ') || null,
            image: image_url || null,
          },
        });
        break;
      }

      case 'user.deleted': {
        const { id } = event.data;
        if (id) {
          await prisma.user.delete({
            where: { clerkId: id },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

## GitHub Webhook Handler

```typescript
// app/api/webhooks/github/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('x-hub-signature-256');
  const event = headersList.get('x-github-event');
  const deliveryId = headersList.get('x-github-delivery');

  if (!signature || !event) {
    return NextResponse.json(
      { error: 'Missing headers' },
      { status: 400 }
    );
  }

  if (!verifySignature(body, signature)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // Idempotency check
  const existing = await prisma.webhookEvent.findUnique({
    where: { externalId: deliveryId! },
  });

  if (existing) {
    return NextResponse.json({ message: 'Already processed' });
  }

  const payload = JSON.parse(body);

  try {
    // Store event for idempotency
    await prisma.webhookEvent.create({
      data: {
        externalId: deliveryId!,
        type: event,
        payload,
        status: 'processing',
      },
    });

    switch (event) {
      case 'push': {
        await handlePush(payload);
        break;
      }

      case 'pull_request': {
        await handlePullRequest(payload);
        break;
      }

      case 'issues': {
        await handleIssue(payload);
        break;
      }

      default:
        console.log(`Unhandled GitHub event: ${event}`);
    }

    // Mark as processed
    await prisma.webhookEvent.update({
      where: { externalId: deliveryId! },
      data: { status: 'completed' },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing GitHub webhook:', error);

    // Mark as failed
    await prisma.webhookEvent.update({
      where: { externalId: deliveryId! },
      data: { status: 'failed', error: String(error) },
    });

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePush(payload: any) {
  const { repository, commits, ref } = payload;

  // Trigger deployment for main branch pushes
  if (ref === 'refs/heads/main') {
    await triggerDeployment(repository.full_name, commits);
  }
}

async function handlePullRequest(payload: any) {
  const { action, pull_request, repository } = payload;

  if (action === 'opened' || action === 'synchronize') {
    // Run CI checks
    await runCIChecks(repository.full_name, pull_request.number);
  }
}
```

## Generic Webhook Handler with Queue

```typescript
// app/api/webhooks/[provider]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { webhookQueue } from '@/lib/queue';

interface WebhookConfig {
  verifySignature: (body: string, headers: Headers) => Promise<boolean>;
  parseEvent: (body: string) => { type: string; data: any };
}

const providers: Record<string, WebhookConfig> = {
  stripe: {
    verifySignature: async (body, headers) => {
      // Stripe verification logic
      return true;
    },
    parseEvent: (body) => JSON.parse(body),
  },
  // Add more providers...
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const config = providers[provider];

  if (!config) {
    return NextResponse.json(
      { error: 'Unknown provider' },
      { status: 404 }
    );
  }

  const body = await request.text();
  const headersList = await headers();

  // Verify signature
  const isValid = await config.verifySignature(body, headersList);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // Parse event
  const event = config.parseEvent(body);

  // Store and queue for processing
  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      provider,
      type: event.type,
      payload: event.data,
      status: 'pending',
    },
  });

  // Add to queue for async processing
  await webhookQueue.add('process-webhook', {
    eventId: webhookEvent.id,
    provider,
    type: event.type,
  });

  // Return immediately (async processing)
  return NextResponse.json({ received: true });
}
```

## Webhook Retry Handler

```typescript
// lib/webhook-processor.ts
import { prisma } from '@/lib/db';

interface ProcessorConfig {
  maxRetries: number;
  retryDelay: (attempt: number) => number;
}

const defaultConfig: ProcessorConfig = {
  maxRetries: 3,
  retryDelay: (attempt) => Math.pow(2, attempt) * 1000, // Exponential backoff
};

export async function processWebhook(
  eventId: string,
  handler: (payload: any) => Promise<void>,
  config: ProcessorConfig = defaultConfig
) {
  const event = await prisma.webhookEvent.findUnique({
    where: { id: eventId },
  });

  if (!event || event.status === 'completed') {
    return;
  }

  const attempt = (event.attempts || 0) + 1;

  try {
    await handler(event.payload);

    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: 'completed',
        attempts: attempt,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    const shouldRetry = attempt < config.maxRetries;

    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: shouldRetry ? 'pending' : 'failed',
        attempts: attempt,
        error: String(error),
        nextRetryAt: shouldRetry
          ? new Date(Date.now() + config.retryDelay(attempt))
          : null,
      },
    });

    if (!shouldRetry) {
      // Alert or log permanently failed webhook
      console.error(`Webhook ${eventId} permanently failed after ${attempt} attempts`);
    }
  }
}
```

## Anti-patterns

### Don't Process Webhooks Synchronously

```typescript
// BAD - Long processing blocks response
export async function POST(request: Request) {
  const event = await verifyWebhook(request);
  await processHeavyTask(event); // May timeout!
  return NextResponse.json({ received: true });
}

// GOOD - Queue for async processing
export async function POST(request: Request) {
  const event = await verifyWebhook(request);
  await queue.add('process-webhook', { event });
  return NextResponse.json({ received: true }); // Return immediately
}
```

### Don't Forget Idempotency

```typescript
// BAD - Processing duplicate events
export async function POST(request: Request) {
  const event = parseEvent(request);
  await createOrder(event); // Creates duplicate orders!
}

// GOOD - Check for duplicates
export async function POST(request: Request) {
  const event = parseEvent(request);
  
  const existing = await prisma.webhookEvent.findUnique({
    where: { externalId: event.id },
  });
  
  if (existing) {
    return NextResponse.json({ message: 'Already processed' });
  }
  
  await createOrder(event);
}
```

## Related Skills

- [route-handlers](./route-handlers.md)
- [background-jobs](./background-jobs.md)
- [error-handling](./error-handling.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Stripe webhook handler
- Clerk webhook handler
- GitHub webhook handler
- Queue-based processing
- Retry mechanism
