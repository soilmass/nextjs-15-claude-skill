---
id: pt-transactional-email
name: Transactional Email
version: 2.0.0
layer: L5
category: email
description: Reliable transactional email delivery with Resend, queue processing, and delivery tracking
tags: [email, transactional, resend, delivery, notifications, queue]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-text.md
dependencies:
  resend: "^4.0.0"
formula: Resend + BullMQ Queue + Webhooks + Delivery Tracking = Reliable Email Delivery
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

- Sending password reset, email verification, and account security emails
- Delivering order confirmations, shipping notifications, and receipts
- Processing high-volume email sends with retry logic and rate limiting
- Tracking email delivery status, opens, clicks, and bounces
- Managing user email preferences and unsubscribe compliance

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                 TRANSACTIONAL EMAIL PATTERN                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Trigger Layer                       │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │   Server    │  │    Cron     │  │   Webhook   │  │      │
│  │  │  Actions    │  │    Jobs     │  │  Triggers   │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Queue Layer                         │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │   BullMQ    │  │   Retry     │  │    Rate     │  │      │
│  │  │   Queue     │  │   Logic     │  │  Limiting   │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                  Delivery Layer                       │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │   Resend    │  │   Webhook   │  │  Analytics  │  │      │
│  │  │    API      │  │  (tracking) │  │  (metrics)  │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Transactional Email

Send reliable transactional emails with delivery tracking and error handling.

## Overview

This pattern covers:
- Email provider setup (Resend)
- Queue-based email processing
- Delivery tracking and webhooks
- Retry logic and error handling
- Template selection
- Email analytics
- Unsubscribe handling

## Implementation

### Email Provider Configuration

```typescript
// lib/email/provider.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_CONFIG = {
  from: {
    transactional: 'App <noreply@yourdomain.com>',
    marketing: 'App Team <team@yourdomain.com>',
    support: 'Support <support@yourdomain.com>',
  },
  replyTo: 'support@yourdomain.com',
  unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`,
};

// Domain verification (run once during setup)
export async function verifyDomain() {
  const domains = await resend.domains.list();
  console.log('Verified domains:', domains);
}
```

### Email Queue System

```typescript
// lib/email/queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { resend, EMAIL_CONFIG } from './provider';
import { prisma } from '@/lib/prisma';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Email job data
interface EmailJobData {
  id: string;
  to: string | string[];
  subject: string;
  templateName: string;
  templateProps: Record<string, unknown>;
  from?: keyof typeof EMAIL_CONFIG.from;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  scheduledFor?: string; // ISO date string
  tags?: { name: string; value: string }[];
  metadata?: Record<string, unknown>;
}

// Create queue
export const emailQueue = new Queue<EmailJobData>('emails', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s, 2s, 4s
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

// Queue an email
export async function queueEmail(data: Omit<EmailJobData, 'id'>): Promise<string> {
  const id = `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Store in database
  await prisma.emailLog.create({
    data: {
      id,
      to: Array.isArray(data.to) ? data.to.join(',') : data.to,
      subject: data.subject,
      templateName: data.templateName,
      status: 'QUEUED',
      metadata: data.metadata,
    },
  });

  // Add to queue
  const jobOptions: Record<string, unknown> = {};
  
  if (data.scheduledFor) {
    const delay = new Date(data.scheduledFor).getTime() - Date.now();
    if (delay > 0) {
      jobOptions.delay = delay;
    }
  }

  await emailQueue.add('send', { ...data, id }, jobOptions);

  return id;
}

// Template loader
async function loadTemplate(
  templateName: string,
  props: Record<string, unknown>
): Promise<ReactElement> {
  const templates: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
    welcome: () => import('@/emails/templates/welcome'),
    'password-reset': () => import('@/emails/templates/password-reset'),
    'email-verification': () => import('@/emails/templates/email-verification'),
    invoice: () => import('@/emails/templates/invoice'),
    'order-confirmation': () => import('@/emails/templates/order-confirmation'),
    'shipping-notification': () => import('@/emails/templates/shipping-notification'),
  };

  const loader = templates[templateName];
  if (!loader) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  const { default: Template } = await loader();
  return Template(props);
}

// Process emails
export const emailWorker = new Worker<EmailJobData>(
  'emails',
  async (job: Job<EmailJobData>) => {
    const { id, to, subject, templateName, templateProps, from, replyTo, cc, bcc, tags } = job.data;

    try {
      // Update status
      await prisma.emailLog.update({
        where: { id },
        data: { status: 'SENDING', attempts: job.attemptsMade + 1 },
      });

      // Load and render template
      const template = await loadTemplate(templateName, templateProps);
      const html = await render(template);
      const text = await render(template, { plainText: true });

      // Send email
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from[from || 'transactional'],
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        replyTo: replyTo || EMAIL_CONFIG.replyTo,
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        tags,
        headers: {
          'X-Email-Id': id,
        },
      });

      // Update success status
      await prisma.emailLog.update({
        where: { id },
        data: {
          status: 'SENT',
          providerMessageId: result.data?.id,
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      // Update failure status
      await prisma.emailLog.update({
        where: { id },
        data: {
          status: job.attemptsMade + 1 >= 3 ? 'FAILED' : 'QUEUED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  },
  { connection, concurrency: 5 }
);

// Event handlers
emailWorker.on('completed', (job) => {
  console.log(`Email ${job.data.id} sent successfully`);
});

emailWorker.on('failed', (job, error) => {
  console.error(`Email ${job?.data.id} failed:`, error.message);
});
```

### Database Schema

```prisma
// prisma/schema.prisma
model EmailLog {
  id                String       @id
  to                String
  subject           String
  templateName      String
  status            EmailStatus  @default(QUEUED)
  attempts          Int          @default(0)
  providerMessageId String?
  error             String?
  metadata          Json?
  
  sentAt            DateTime?
  deliveredAt       DateTime?
  openedAt          DateTime?
  clickedAt         DateTime?
  bouncedAt         DateTime?
  complainedAt      DateTime?
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([status])
  @@index([to])
  @@index([createdAt])
}

enum EmailStatus {
  QUEUED
  SENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  COMPLAINED
  FAILED
}

model EmailPreference {
  id        String   @id @default(cuid())
  email     String   @unique
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  
  marketing Boolean  @default(true)
  product   Boolean  @default(true)
  security  Boolean  @default(true) // Cannot be disabled
  
  unsubscribedAt DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([email])
  @@index([userId])
}
```

### Webhook Handler

```typescript
// app/api/webhooks/resend/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET!;

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    headers?: Record<string, string>;
    // Event-specific data
    bounce?: { type: string; message: string };
    complaint?: { type: string };
    click?: { link: string; timestamp: string };
  };
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('svix-signature');
  const timestamp = request.headers.get('svix-timestamp');
  const id = request.headers.get('svix-id');

  // Verify webhook signature
  if (!verifySignature(body, signature, timestamp, id)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event: ResendWebhookEvent = JSON.parse(body);
  const emailId = event.data.headers?.['X-Email-Id'];

  if (!emailId) {
    // External email, skip
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'email.delivered':
        await prisma.emailLog.update({
          where: { id: emailId },
          data: { status: 'DELIVERED', deliveredAt: new Date(event.created_at) },
        });
        break;

      case 'email.opened':
        await prisma.emailLog.update({
          where: { id: emailId },
          data: { status: 'OPENED', openedAt: new Date(event.created_at) },
        });
        break;

      case 'email.clicked':
        await prisma.emailLog.update({
          where: { id: emailId },
          data: { status: 'CLICKED', clickedAt: new Date(event.created_at) },
        });
        break;

      case 'email.bounced':
        await prisma.emailLog.update({
          where: { id: emailId },
          data: { 
            status: 'BOUNCED', 
            bouncedAt: new Date(event.created_at),
            error: event.data.bounce?.message,
          },
        });
        // Handle hard bounces by marking email as invalid
        if (event.data.bounce?.type === 'hard') {
          await handleHardBounce(event.data.to[0]);
        }
        break;

      case 'email.complained':
        await prisma.emailLog.update({
          where: { id: emailId },
          data: { status: 'COMPLAINED', complainedAt: new Date(event.created_at) },
        });
        // Auto-unsubscribe on complaint
        await handleComplaint(event.data.to[0]);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

function verifySignature(
  payload: string,
  signature: string | null,
  timestamp: string | null,
  id: string | null
): boolean {
  if (!signature || !timestamp || !id) return false;

  const signedPayload = `${id}.${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('base64');

  return signature.includes(expectedSignature);
}

async function handleHardBounce(email: string) {
  await prisma.emailPreference.upsert({
    where: { email },
    create: { email, marketing: false, product: false },
    update: { marketing: false, product: false },
  });
}

async function handleComplaint(email: string) {
  await prisma.emailPreference.upsert({
    where: { email },
    create: { email, marketing: false, product: false, unsubscribedAt: new Date() },
    update: { marketing: false, product: false, unsubscribedAt: new Date() },
  });
}
```

### Email Service Functions

```typescript
// lib/email/service.ts
import { queueEmail } from './queue';
import { prisma } from '@/lib/prisma';

type EmailCategory = 'marketing' | 'product' | 'security';

interface SendOptions {
  to: string;
  subject: string;
  templateName: string;
  templateProps: Record<string, unknown>;
  category?: EmailCategory;
  scheduledFor?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Send email with preference checking
 */
export async function sendEmail(options: SendOptions): Promise<string | null> {
  const { to, category = 'product', ...emailData } = options;

  // Security emails always go through
  if (category !== 'security') {
    // Check user preferences
    const preference = await prisma.emailPreference.findUnique({
      where: { email: to },
    });

    if (preference) {
      if (category === 'marketing' && !preference.marketing) {
        return null; // User opted out
      }
      if (category === 'product' && !preference.product) {
        return null;
      }
    }
  }

  return queueEmail({
    to,
    ...emailData,
    tags: [{ name: 'category', value: category }],
  });
}

/**
 * Send bulk emails
 */
export async function sendBulkEmail(
  recipients: string[],
  options: Omit<SendOptions, 'to'>
): Promise<{ sent: number; skipped: number }> {
  let sent = 0;
  let skipped = 0;

  for (const to of recipients) {
    const result = await sendEmail({ ...options, to });
    if (result) {
      sent++;
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}

/**
 * Get email status
 */
export async function getEmailStatus(id: string) {
  return prisma.emailLog.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      sentAt: true,
      deliveredAt: true,
      openedAt: true,
      error: true,
    },
  });
}

/**
 * Get email analytics
 */
export async function getEmailAnalytics(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [total, byStatus] = await Promise.all([
    prisma.emailLog.count({
      where: { createdAt: { gte: since } },
    }),
    prisma.emailLog.groupBy({
      by: ['status'],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  const statusCounts = byStatus.reduce(
    (acc, item) => ({ ...acc, [item.status]: item._count }),
    {} as Record<string, number>
  );

  return {
    total,
    sent: statusCounts.SENT || 0,
    delivered: statusCounts.DELIVERED || 0,
    opened: statusCounts.OPENED || 0,
    clicked: statusCounts.CLICKED || 0,
    bounced: statusCounts.BOUNCED || 0,
    failed: statusCounts.FAILED || 0,
    deliveryRate: total > 0 ? ((statusCounts.DELIVERED || 0) / total) * 100 : 0,
    openRate: (statusCounts.DELIVERED || 0) > 0 
      ? ((statusCounts.OPENED || 0) / (statusCounts.DELIVERED || 1)) * 100 
      : 0,
  };
}
```

### Unsubscribe Handling

```typescript
// app/api/unsubscribe/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET!;

// Generate unsubscribe token
export function generateUnsubscribeToken(email: string): string {
  const data = `${email}:${Date.now()}`;
  const signature = crypto
    .createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(data)
    .digest('hex');
  return Buffer.from(`${data}:${signature}`).toString('base64url');
}

// Verify unsubscribe token
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [email, timestamp, signature] = decoded.split(':');
    
    const expectedSignature = crypto
      .createHmac('sha256', UNSUBSCRIBE_SECRET)
      .update(`${email}:${timestamp}`)
      .digest('hex');
    
    if (signature !== expectedSignature) return null;
    
    // Token expires after 30 days
    if (Date.now() - parseInt(timestamp) > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return email;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { token, categories } = await request.json();

  const email = verifyUnsubscribeToken(token);
  if (!email) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  await prisma.emailPreference.upsert({
    where: { email },
    create: {
      email,
      marketing: !categories.includes('marketing'),
      product: !categories.includes('product'),
      unsubscribedAt: new Date(),
    },
    update: {
      marketing: !categories.includes('marketing'),
      product: !categories.includes('product'),
      unsubscribedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}

// app/unsubscribe/page.tsx
// Client component for unsubscribe form
```

## Anti-patterns

1. **No queue** - Always queue emails for reliability
2. **No tracking** - Track delivery, opens, clicks for insights
3. **Ignoring bounces** - Handle bounces to maintain sender reputation
4. **No unsubscribe** - Always provide unsubscribe option (legally required)
5. **Sync sending** - Never send emails synchronously in request handlers
6. **No retries** - Implement exponential backoff for failures

## Related Skills

- [[email-templates]] - Email template design
- [[queues]] - Queue processing
- [[webhooks]] - Webhook handling
- [[password-reset]] - Password reset emails

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial transactional email pattern with Resend and queue processing
