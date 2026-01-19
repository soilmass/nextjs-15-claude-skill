---
id: pt-abandoned-cart-recovery
name: Abandoned Cart Recovery
version: 1.1.0
layer: L5
category: email
description: Automated abandoned cart recovery with email sequences, personalized reminders, and discount incentives
tags: [abandoned-cart, email, recovery, conversion, ecommerce, next15]
composes: []
formula: "AbandonedCartRecovery = CartTracking + EmailSequence + Personalization + Incentives"
dependencies:
  prisma: "^6.0.0"
  resend: "^4.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Abandoned Cart Recovery

## Overview

Abandoned cart recovery is one of the most effective revenue recovery strategies in e-commerce, with industry data showing that targeted recovery emails can recapture 5-15% of otherwise lost sales. This pattern implements an automated system that detects abandoned shopping carts, triggers a sequence of personalized reminder emails, and optionally offers time-limited discounts to incentivize purchase completion.

The system tracks cart abandonment by monitoring user sessions and capturing cart state when users leave without completing checkout. A configurable email sequence then engages these users with personalized product reminders, urgency messaging, and progressive incentives. The first email focuses on simple reminders, while subsequent emails may include discount offers for users who need additional motivation.

Analytics integration allows you to measure the effectiveness of your recovery campaigns, tracking metrics like open rates, click-through rates, and actual conversions. This data informs optimization of email timing, content, and incentive strategies to maximize recovery rates.

## When to Use

- Recovering lost sales from customers who abandoned their carts
- Sending automated, timed reminder emails to potential customers
- Offering time-limited discounts to incentivize purchase completion
- Tracking recovery campaign effectiveness with detailed analytics
- Re-engaging customers with personalized product reminders
- Implementing progressive incentive strategies based on cart value

## When NOT to Use

- For carts with very low value (below your profit threshold for recovery emails)
- When users explicitly opt out of marketing communications
- For guest users without email addresses
- When your email sending limits would be exceeded

## Composition Diagram

```
Abandoned Cart Recovery Architecture
====================================

+------------------------------------------------------------------+
|                   Cart Activity Detection                         |
|  +------------------------------------------------------------+  |
|  |  User adds items to cart                                    |  |
|  |  -> Track session ID + cart data                            |  |
|  |  -> Update abandonedAt timestamp on activity                |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                   Abandonment Detection                           |
|  +------------------------------------------------------------+  |
|  |  Cron Job (every 15 minutes)                                |  |
|  |  -> Find carts inactive > 1 hour                            |  |
|  |  -> Filter: has email, min value, not recovered             |  |
|  |  -> Queue for processing                                    |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                    Email Sequence Engine                          |
|  +------------------------------------------------------------+  |
|  |  Sequence 1 (1 hour)     Sequence 2 (24 hours)   Seq 3 (72h)|  |
|  |  +----------------+      +------------------+    +----------+|  |
|  |  | Simple reminder|      | Urgency message  |    | Discount ||  |
|  |  | Product images |      | Stock warnings   |    | 10% off  ||  |
|  |  | Direct CTA     |      | Social proof     |    | Deadline ||  |
|  |  +----------------+      +------------------+    +----------+|  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                    Recovery Tracking                              |
|  +------------------------------------------------------------+  |
|  |  Track: Email opens, Clicks, Conversions                    |  |
|  |  -> Pixel tracking for opens                                |  |
|  |  -> UTM parameters for clicks                               |  |
|  |  -> Order matching for conversions                          |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                    Cart Recovery Page                             |
|  +------------------------------------------------------------+  |
|  |  /cart/recover?id={cartId}                                  |  |
|  |  -> Restore cart items to session                           |  |
|  |  -> Auto-apply discount if available                        |  |
|  |  -> Redirect to checkout                                    |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Implementation

### Database Schema

```prisma
model AbandonedCart {
  id            String              @id @default(cuid())
  sessionId     String
  userId        String?
  user          User?               @relation(fields: [userId], references: [id])
  email         String?
  cartData      Json                // serialized cart items
  cartValue     Int                 // total in cents
  itemCount     Int                 // number of items
  status        AbandonedCartStatus @default(ABANDONED)
  recoveryEmails AbandonedCartEmail[]

  // Tracking
  abandonedAt   DateTime            @default(now())
  lastActivityAt DateTime           @default(now())
  recoveredAt   DateTime?
  orderId       String?             // if recovered
  order         Order?              @relation(fields: [orderId], references: [id])

  // Attribution
  source        String?             // utm_source
  medium        String?             // utm_medium
  campaign      String?             // utm_campaign

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@unique([sessionId])
  @@index([email])
  @@index([status])
  @@index([abandonedAt])
  @@index([userId])
}

model AbandonedCartEmail {
  id              String        @id @default(cuid())
  abandonedCart   AbandonedCart @relation(fields: [cartId], references: [id])
  cartId          String
  sequence        Int           // 1, 2, 3 for email sequence
  templateId      String        // email template used
  sentAt          DateTime      @default(now())
  openedAt        DateTime?
  clickedAt       DateTime?
  discountCode    String?       // if discount was offered
  discountAmount  Int?          // discount value in cents

  @@index([cartId])
  @@index([sentAt])
}

enum AbandonedCartStatus {
  ABANDONED
  EMAIL_SENT
  RECOVERED
  EXPIRED
  UNSUBSCRIBED
}
```

### Recovery Service

```typescript
// lib/abandoned-cart/service.ts
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateDiscountCode } from '@/lib/discounts';

interface RecoverySequenceStep {
  delayHours: number;
  subject: string;
  templateId: string;
  hasDiscount: boolean;
  discountPercent?: number;
}

const RECOVERY_SEQUENCE: RecoverySequenceStep[] = [
  {
    delayHours: 1,
    subject: "You left something behind!",
    templateId: "abandoned-cart-1",
    hasDiscount: false,
  },
  {
    delayHours: 24,
    subject: "Your cart is waiting for you",
    templateId: "abandoned-cart-2",
    hasDiscount: false,
  },
  {
    delayHours: 72,
    subject: "Last chance: 10% off your cart",
    templateId: "abandoned-cart-3",
    hasDiscount: true,
    discountPercent: 10,
  },
];

const MIN_CART_VALUE = 1000; // $10 minimum to track

export async function trackAbandonedCart(
  sessionId: string,
  cartData: any,
  email?: string,
  userId?: string
): Promise<void> {
  const cartValue = cartData.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const itemCount = cartData.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  // Don't track empty carts or very small values
  if (cartValue < MIN_CART_VALUE || itemCount === 0) return;

  await prisma.abandonedCart.upsert({
    where: { sessionId },
    create: {
      sessionId,
      userId,
      email,
      cartData,
      cartValue,
      itemCount,
      abandonedAt: new Date(),
      lastActivityAt: new Date(),
    },
    update: {
      cartData,
      cartValue,
      itemCount,
      email: email || undefined,
      userId: userId || undefined,
      lastActivityAt: new Date(),
      // Reset status if cart was previously abandoned
      status: 'ABANDONED',
    },
  });
}

export async function markCartRecovered(
  sessionId: string,
  orderId: string
): Promise<void> {
  await prisma.abandonedCart.updateMany({
    where: { sessionId, status: { not: 'RECOVERED' } },
    data: {
      status: 'RECOVERED',
      recoveredAt: new Date(),
      orderId,
    },
  });
}

export async function processAbandonedCarts(): Promise<{
  processed: number;
  emailsSent: number;
  errors: number;
}> {
  let processed = 0;
  let emailsSent = 0;
  let errors = 0;

  // Get abandoned carts that need processing
  const carts = await prisma.abandonedCart.findMany({
    where: {
      status: { in: ['ABANDONED', 'EMAIL_SENT'] },
      email: { not: null },
      // Only process carts abandoned at least 1 hour ago
      abandonedAt: { lte: new Date(Date.now() - 60 * 60 * 1000) },
    },
    include: {
      recoveryEmails: { orderBy: { sequence: 'desc' }, take: 1 },
    },
  });

  for (const cart of carts) {
    processed++;

    try {
      const lastEmail = cart.recoveryEmails[0];
      const nextSequence = lastEmail ? lastEmail.sequence + 1 : 1;

      // Check if we've sent all emails
      if (nextSequence > RECOVERY_SEQUENCE.length) {
        await prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { status: 'EXPIRED' },
        });
        continue;
      }

      const sequenceConfig = RECOVERY_SEQUENCE[nextSequence - 1];
      const timeSinceAbandonment = Date.now() - cart.abandonedAt.getTime();
      const requiredDelay = sequenceConfig.delayHours * 60 * 60 * 1000;

      // Check if enough time has passed for this sequence step
      if (timeSinceAbandonment < requiredDelay) continue;

      // For subsequent emails, also check time since last email
      if (lastEmail) {
        const timeSinceLastEmail = Date.now() - lastEmail.sentAt.getTime();
        const minTimeBetweenEmails = 12 * 60 * 60 * 1000; // 12 hours minimum
        if (timeSinceLastEmail < minTimeBetweenEmails) continue;
      }

      // Generate discount code if needed
      let discountCode: string | undefined;
      let discountAmount: number | undefined;
      if (sequenceConfig.hasDiscount && sequenceConfig.discountPercent) {
        const result = await createRecoveryDiscount(
          cart.id,
          sequenceConfig.discountPercent,
          cart.cartValue
        );
        discountCode = result.code;
        discountAmount = result.discountAmount;
      }

      // Send recovery email
      const cartItems = cart.cartData as any;
      await sendEmail({
        to: cart.email!,
        template: sequenceConfig.templateId,
        subject: sequenceConfig.subject,
        data: {
          items: cartItems.items,
          itemCount: cart.itemCount,
          cartValue: cart.cartValue / 100,
          recoveryUrl: buildRecoveryUrl(cart.id, nextSequence),
          discountCode,
          discountPercent: sequenceConfig.discountPercent,
          discountAmount: discountAmount ? discountAmount / 100 : undefined,
          expiresIn: sequenceConfig.hasDiscount ? '7 days' : undefined,
        },
      });

      // Record email sent
      await prisma.abandonedCartEmail.create({
        data: {
          cartId: cart.id,
          sequence: nextSequence,
          templateId: sequenceConfig.templateId,
          discountCode,
          discountAmount,
        },
      });

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { status: 'EMAIL_SENT' },
      });

      emailsSent++;
    } catch (error) {
      errors++;
      console.error(`Failed to process cart ${cart.id}:`, error);
    }
  }

  return { processed, emailsSent, errors };
}

function buildRecoveryUrl(cartId: string, sequence: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const params = new URLSearchParams({
    id: cartId,
    utm_source: 'email',
    utm_medium: 'abandoned_cart',
    utm_campaign: `recovery_seq_${sequence}`,
  });
  return `${baseUrl}/cart/recover?${params.toString()}`;
}

async function createRecoveryDiscount(
  cartId: string,
  percentage: number,
  cartValue: number
): Promise<{ code: string; discountAmount: number }> {
  const code = `RECOVER${cartId.slice(-6).toUpperCase()}`;
  const discountAmount = Math.round(cartValue * (percentage / 100));

  await prisma.discount.create({
    data: {
      code,
      name: 'Cart Recovery Discount',
      type: 'PERCENTAGE',
      value: percentage,
      maxUses: 1,
      maxUsesPerUser: 1,
      minimumOrderValue: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      metadata: { abandonedCartId: cartId },
    },
  });

  return { code, discountAmount };
}

// Track email opens via pixel
export async function trackEmailOpen(emailId: string): Promise<void> {
  await prisma.abandonedCartEmail.update({
    where: { id: emailId },
    data: { openedAt: new Date() },
  });
}

// Track email clicks
export async function trackEmailClick(emailId: string): Promise<void> {
  await prisma.abandonedCartEmail.update({
    where: { id: emailId },
    data: { clickedAt: new Date() },
  });
}

// Unsubscribe from recovery emails
export async function unsubscribeFromRecovery(email: string): Promise<void> {
  await prisma.abandonedCart.updateMany({
    where: { email },
    data: { status: 'UNSUBSCRIBED' },
  });
}
```

### Cart Recovery Page

```typescript
// app/cart/recover/page.tsx
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { CartRecoveryClient } from './client';

interface PageProps {
  searchParams: Promise<{
    id?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }>;
}

export default async function RecoverCartPage({ searchParams }: PageProps) {
  const params = await searchParams;

  if (!params.id) {
    redirect('/cart');
  }

  const abandonedCart = await prisma.abandonedCart.findUnique({
    where: { id: params.id },
    include: {
      recoveryEmails: {
        orderBy: { sequence: 'desc' },
        take: 1,
      },
    },
  });

  if (!abandonedCart || abandonedCart.status === 'RECOVERED') {
    redirect('/cart');
  }

  // Track the click
  const lastEmail = abandonedCart.recoveryEmails[0];
  if (lastEmail && !lastEmail.clickedAt) {
    await prisma.abandonedCartEmail.update({
      where: { id: lastEmail.id },
      data: { clickedAt: new Date() },
    });
  }

  // Get discount code if available
  const discountCode = lastEmail?.discountCode;

  // Store cart ID in cookie for recovery
  const cookieStore = await cookies();
  cookieStore.set('recovering_cart_id', abandonedCart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
  });

  return (
    <CartRecoveryClient
      cartData={abandonedCart.cartData as any}
      discountCode={discountCode}
      cartId={abandonedCart.id}
    />
  );
}
```

### Cart Recovery Client Component

```typescript
// app/cart/recover/client.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Loader2 } from 'lucide-react';

interface CartRecoveryClientProps {
  cartData: {
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      price: number;
      name: string;
      image?: string;
    }>;
  };
  discountCode?: string | null;
  cartId: string;
}

export function CartRecoveryClient({
  cartData,
  discountCode,
  cartId,
}: CartRecoveryClientProps) {
  const router = useRouter();
  const { setItems, applyDiscount } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const recoverCart = async () => {
      try {
        // Restore cart items
        setItems(cartData.items);

        // Apply discount if available
        if (discountCode) {
          await applyDiscount(discountCode);
        }

        // Mark as recovering (actual "recovered" happens on checkout)
        await fetch('/api/cart/recovering', {
          method: 'POST',
          body: JSON.stringify({ cartId }),
        });

        setStatus('success');

        // Redirect to cart after brief delay
        setTimeout(() => {
          router.push('/cart');
        }, 1500);
      } catch (error) {
        console.error('Failed to recover cart:', error);
        setStatus('error');
      }
    };

    recoverCart();
  }, [cartData, discountCode, cartId, setItems, applyDiscount, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg">Restoring your cart...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">Cart restored successfully!</p>
            {discountCode && (
              <p className="text-sm text-muted-foreground">
                Discount code {discountCode} has been applied.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Redirecting to your cart...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-lg text-red-600">Failed to restore cart</p>
            <button
              onClick={() => router.push('/cart')}
              className="text-primary underline"
            >
              Go to cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

### Cron Job Handler

```typescript
// app/api/cron/abandoned-carts/route.ts
import { NextResponse } from 'next/server';
import { processAbandonedCarts } from '@/lib/abandoned-cart/service';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processAbandonedCarts();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Abandoned cart processing failed:', error);
    return NextResponse.json(
      { success: false, error: 'Processing failed' },
      { status: 500 }
    );
  }
}
```

## Examples

### Example 1: Email Template with React Email

```tsx
// emails/abandoned-cart-1.tsx
import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Img,
  Section,
  Row,
  Column,
} from '@react-email/components';

interface AbandonedCartEmail1Props {
  items: Array<{
    name: string;
    image?: string;
    price: number;
    quantity: number;
  }>;
  cartValue: number;
  recoveryUrl: string;
}

export function AbandonedCartEmail1({
  items,
  cartValue,
  recoveryUrl,
}: AbandonedCartEmail1Props) {
  return (
    <Html>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f5' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px' }}>
          <Heading style={{ textAlign: 'center' }}>
            You left something behind!
          </Heading>

          <Text style={{ textAlign: 'center', color: '#71717a' }}>
            We noticed you didn't complete your purchase. Your items are still
            waiting for you:
          </Text>

          <Section style={{ margin: '30px 0' }}>
            {items.slice(0, 3).map((item, index) => (
              <Row key={index} style={{ marginBottom: '20px' }}>
                <Column style={{ width: '80px' }}>
                  {item.image && (
                    <Img
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      style={{ borderRadius: '8px' }}
                    />
                  )}
                </Column>
                <Column style={{ paddingLeft: '20px' }}>
                  <Text style={{ margin: 0, fontWeight: 'bold' }}>
                    {item.name}
                  </Text>
                  <Text style={{ margin: '5px 0', color: '#71717a' }}>
                    Qty: {item.quantity} x ${(item.price / 100).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
            {items.length > 3 && (
              <Text style={{ color: '#71717a', fontStyle: 'italic' }}>
                +{items.length - 3} more items
              </Text>
            )}
          </Section>

          <Text style={{ textAlign: 'center', fontSize: '18px' }}>
            Cart Total: <strong>${cartValue.toFixed(2)}</strong>
          </Text>

          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button
              href={recoveryUrl}
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '12px 30px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Complete Your Order
            </Button>
          </Section>

          <Text
            style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '12px', marginTop: '40px' }}
          >
            If you didn't add these items to your cart, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### Example 2: Recovery Analytics Dashboard

```tsx
// app/admin/abandoned-carts/page.tsx
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function AbandonedCartsPage() {
  const [stats, recentCarts] = await Promise.all([
    getRecoveryStats(),
    prisma.abandonedCart.findMany({
      orderBy: { abandonedAt: 'desc' },
      take: 50,
      include: {
        _count: { select: { recoveryEmails: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Abandoned Cart Recovery</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Abandoned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAbandoned}</div>
            <p className="text-sm text-muted-foreground">
              {formatPrice(stats.totalValue)} value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recovered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.recovered}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatPrice(stats.recoveredValue)} recovered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recovery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAbandoned > 0
                ? ((stats.recovered / stats.totalAbandoned) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">of abandoned carts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Email Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.emailOpenRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.emailsSent} emails sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Abandoned Carts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Abandoned Carts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Emails Sent</TableHead>
                <TableHead>Abandoned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCarts.map((cart) => (
                <TableRow key={cart.id}>
                  <TableCell>{cart.email || 'No email'}</TableCell>
                  <TableCell>{formatPrice(cart.cartValue)}</TableCell>
                  <TableCell>{cart.itemCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        cart.status === 'RECOVERED' ? 'default' : 'secondary'
                      }
                    >
                      {cart.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{cart._count.recoveryEmails}</TableCell>
                  <TableCell>{formatDate(cart.abandonedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

async function getRecoveryStats() {
  const [abandoned, recovered, emails] = await Promise.all([
    prisma.abandonedCart.aggregate({
      _count: true,
      _sum: { cartValue: true },
    }),
    prisma.abandonedCart.aggregate({
      where: { status: 'RECOVERED' },
      _count: true,
      _sum: { cartValue: true },
    }),
    prisma.abandonedCartEmail.aggregate({
      _count: true,
      where: { openedAt: { not: null } },
    }),
  ]);

  const totalEmails = await prisma.abandonedCartEmail.count();

  return {
    totalAbandoned: abandoned._count,
    totalValue: abandoned._sum.cartValue || 0,
    recovered: recovered._count,
    recoveredValue: recovered._sum.cartValue || 0,
    emailsSent: totalEmails,
    emailOpenRate: totalEmails > 0 ? (emails._count / totalEmails) * 100 : 0,
  };
}
```

### Example 3: Cart Activity Middleware

```typescript
// middleware.ts (partial - cart tracking)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Track cart activity timestamp
  if (request.nextUrl.pathname.startsWith('/cart') ||
      request.nextUrl.pathname.startsWith('/checkout')) {
    response.cookies.set('cart_activity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return response;
}
```

### Example 4: Unsubscribe Handler

```typescript
// app/api/email/unsubscribe/route.ts
import { NextResponse } from 'next/server';
import { unsubscribeFromRecovery } from '@/lib/abandoned-cart/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    return NextResponse.redirect(new URL('/unsubscribe/invalid', request.url));
  }

  // Verify token (should be HMAC of email)
  const expectedToken = createUnsubscribeToken(email);
  if (token !== expectedToken) {
    return NextResponse.redirect(new URL('/unsubscribe/invalid', request.url));
  }

  await unsubscribeFromRecovery(email);

  return NextResponse.redirect(new URL('/unsubscribe/success', request.url));
}

function createUnsubscribeToken(email: string): string {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET!)
    .update(email)
    .digest('hex')
    .slice(0, 16);
}
```

## Anti-patterns

### Anti-pattern 1: Too Many Emails

```typescript
// BAD - Sending emails too frequently
const RECOVERY_SEQUENCE = [
  { delayHours: 0.5 },  // 30 minutes - too soon!
  { delayHours: 2 },    // 2 hours
  { delayHours: 4 },    // 4 hours
  { delayHours: 8 },    // Too many emails!
  { delayHours: 12 },
];

// GOOD - Respectful timing with maximum 3 emails
const RECOVERY_SEQUENCE = [
  { delayHours: 1, subject: "You left something behind!" },
  { delayHours: 24, subject: "Your cart is waiting" },
  { delayHours: 72, subject: "Last chance: 10% off" },
];
```

### Anti-pattern 2: No Unsubscribe Option

```typescript
// BAD - No way to opt out
await sendEmail({
  to: cart.email,
  template: 'abandoned-cart',
  data: { items }
  // Missing unsubscribe link!
});

// GOOD - Always include unsubscribe
await sendEmail({
  to: cart.email,
  template: 'abandoned-cart',
  data: {
    items,
    unsubscribeUrl: buildUnsubscribeUrl(cart.email),
  },
  headers: {
    'List-Unsubscribe': `<${buildUnsubscribeUrl(cart.email)}>`,
  },
});
```

### Anti-pattern 3: Same Message Every Time

```typescript
// BAD - Identical emails in sequence
const templates = ['reminder', 'reminder', 'reminder'];

// GOOD - Progressive messaging with value escalation
const templates = [
  { template: 'reminder', hasDiscount: false },
  { template: 'urgency', hasDiscount: false, message: 'Items selling fast' },
  { template: 'discount', hasDiscount: true, discountPercent: 10 },
];
```

### Anti-pattern 4: Immediate Discount Offers

```typescript
// BAD - Training customers to abandon for discounts
const RECOVERY_SEQUENCE = [
  { delayHours: 1, discountPercent: 20 }, // Immediate big discount!
];

// GOOD - Earn discounts through the sequence
const RECOVERY_SEQUENCE = [
  { delayHours: 1, hasDiscount: false },    // Simple reminder
  { delayHours: 24, hasDiscount: false },   // Urgency
  { delayHours: 72, discountPercent: 10 },  // Small incentive as last resort
];
```

## Testing

### Unit Test: Recovery Service

```typescript
// __tests__/lib/abandoned-cart/service.test.ts
import {
  trackAbandonedCart,
  processAbandonedCarts,
  markCartRecovered,
} from '@/lib/abandoned-cart/service';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

jest.mock('@/lib/prisma');
jest.mock('@/lib/email');

describe('Abandoned Cart Service', () => {
  describe('trackAbandonedCart', () => {
    it('should track cart with sufficient value', async () => {
      const cartData = {
        items: [{ productId: 'p1', price: 2000, quantity: 1 }],
      };

      await trackAbandonedCart('session-1', cartData, 'test@example.com');

      expect(prisma.abandonedCart.upsert).toHaveBeenCalled();
    });

    it('should not track cart below minimum value', async () => {
      const cartData = {
        items: [{ productId: 'p1', price: 500, quantity: 1 }], // $5, below $10 min
      };

      await trackAbandonedCart('session-1', cartData, 'test@example.com');

      expect(prisma.abandonedCart.upsert).not.toHaveBeenCalled();
    });
  });

  describe('processAbandonedCarts', () => {
    it('should send first email after 1 hour', async () => {
      const abandonedAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

      (prisma.abandonedCart.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cart-1',
          email: 'test@example.com',
          cartData: { items: [] },
          cartValue: 5000,
          abandonedAt,
          recoveryEmails: [],
        },
      ]);

      await processAbandonedCarts();

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          template: 'abandoned-cart-1',
        })
      );
    });
  });
});
```

### Integration Test: Recovery Flow

```typescript
// __tests__/integration/abandoned-cart-recovery.test.ts
import { prisma } from '@/lib/prisma';
import {
  trackAbandonedCart,
  markCartRecovered,
} from '@/lib/abandoned-cart/service';

describe('Abandoned Cart Recovery Integration', () => {
  const sessionId = 'test-session';

  afterEach(async () => {
    await prisma.abandonedCartEmail.deleteMany({});
    await prisma.abandonedCart.deleteMany({});
  });

  it('should track and recover cart', async () => {
    // Track abandonment
    await trackAbandonedCart(
      sessionId,
      { items: [{ productId: 'p1', price: 5000, quantity: 1 }] },
      'test@example.com'
    );

    // Verify cart was tracked
    const cart = await prisma.abandonedCart.findUnique({
      where: { sessionId },
    });
    expect(cart).toBeDefined();
    expect(cart?.status).toBe('ABANDONED');

    // Mark as recovered
    await markCartRecovered(sessionId, 'order-123');

    // Verify recovery
    const recoveredCart = await prisma.abandonedCart.findUnique({
      where: { sessionId },
    });
    expect(recoveredCart?.status).toBe('RECOVERED');
    expect(recoveredCart?.orderId).toBe('order-123');
  });
});
```

## Related Skills

- [Transactional Email](../patterns/transactional-email.md) - Email sending
- [Cron Jobs](../patterns/cron-jobs.md) - Scheduled processing
- [Discount Engine](../patterns/discount-engine.md) - Coupon generation
- [Analytics](../patterns/analytics.md) - Tracking and metrics

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive overview section
- Added When NOT to Use section
- Enhanced composition diagram with full architecture
- Added email tracking (opens, clicks)
- Added unsubscribe functionality
- Added 4 real-world usage examples
- Added 4 anti-patterns with code examples
- Added unit and integration test examples
- Added recovery analytics dashboard
- Added React Email template example
- Improved documentation structure

### 1.0.0 (2025-01-15)
- Initial implementation
- Email sequence configuration
- Cart tracking and recovery
- Discount code generation
