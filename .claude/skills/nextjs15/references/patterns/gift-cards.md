---
id: pt-gift-cards
name: Gift Cards
version: 1.1.0
layer: L5
category: payments
description: Digital gift card system with secure code generation, balance tracking, partial redemption, and expiration handling
tags: [gift-cards, vouchers, store-credit, ecommerce, next15]
composes: []
formula: "GiftCards = CodeGeneration + BalanceTracking + Redemption + EmailDelivery"
dependencies:
  prisma: "^6.0.0"
  nanoid: "^5.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Gift Cards

## Overview

Gift cards are a powerful revenue driver for e-commerce businesses, offering customers a convenient gifting option while providing merchants with immediate cash flow and the potential for incremental sales when recipients spend beyond the card value. This pattern implements a complete digital gift card system with secure code generation, balance tracking, partial redemption support, and automated email delivery.

The implementation uses cryptographically secure random code generation to prevent guessing attacks, with a human-readable format that is easy to type. Each gift card maintains a complete transaction history for auditing and customer service purposes. The system supports both instant delivery for last-minute gifts and scheduled delivery for specific occasions.

Gift cards can be used at checkout alongside other payment methods, with the system automatically calculating the remaining balance and allowing customers to pay the difference with a credit card. Expiration dates are optional but recommended for accounting purposes, and the system handles expired cards gracefully with clear messaging to customers.

## When to Use

- Selling digital gift cards as a product offering
- Offering store credit for returns or customer service resolutions
- Running promotional gift card campaigns with bonus value
- Customer loyalty rewards and referral incentives
- Corporate bulk gift card purchases for employee rewards
- Physical gift card programs with online redemption

## When NOT to Use

- When you need complex loyalty point systems with earning/burning rules
- For subscription-based businesses where credits work differently
- When gift cards must integrate with external POS systems (use their native system)
- For single-use promo codes (use the discount/coupon pattern instead)

## Composition Diagram

```
Gift Card System Architecture
=============================

+------------------------------------------------------------------+
|                      Gift Card Lifecycle                          |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                    1. Purchase Flow                               |
|  +------------------------------------------------------------+  |
|  |  Customer selects amount -> Customizes message             |  |
|  |  -> Checkout -> Payment processed -> Gift card created     |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                    2. Delivery Flow                               |
|  +------------------------------------------------------------+  |
|  |  Immediate: Email sent on purchase                         |  |
|  |  Scheduled: Email sent on specified date                   |  |
|  |  Self: Added directly to purchaser's account               |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                    3. Redemption Flow                             |
|  +------------------------------------------------------------+  |
|  |  Check Balance          Apply at Checkout    View History  |  |
|  |  +----------------+    +------------------+  +------------+|  |
|  |  | Enter code     |    | Calculate amount |  | List txns  ||  |
|  |  | Validate       |    | Partial allowed  |  | Show dates ||  |
|  |  | Show balance   |    | Update balance   |  | Show notes ||  |
|  |  +----------------+    +------------------+  +------------+|  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                    4. Transaction Log                             |
|  +------------------------------------------------------------+  |
|  |  PURCHASE -> REDEMPTION(s) -> REFUND? -> EXPIRATION?       |  |
|  |  All changes recorded with timestamps and references       |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Implementation

### Database Schema

```prisma
model GiftCard {
  id              String          @id @default(cuid())
  code            String          @unique
  initialBalance  Int             // in cents
  currentBalance  Int             // in cents
  currency        String          @default("USD")

  // Sender/Recipient
  purchaserId     String?
  purchaser       User?           @relation("GiftCardPurchaser", fields: [purchaserId], references: [id])
  recipientEmail  String?
  recipientName   String?
  senderName      String?
  message         String?
  design          String?         // template ID for email design

  // Delivery
  deliveryType    DeliveryType    @default(IMMEDIATE)
  scheduledFor    DateTime?
  deliveredAt     DateTime?

  // Status
  status          GiftCardStatus  @default(ACTIVE)
  activatedAt     DateTime?
  expiresAt       DateTime?

  // Tracking
  transactions    GiftCardTransaction[]
  orderId         String?         // Order that purchased this
  order           Order?          @relation(fields: [orderId], references: [id])

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([code])
  @@index([recipientEmail])
  @@index([status])
  @@index([scheduledFor])
}

model GiftCardTransaction {
  id          String              @id @default(cuid())
  giftCard    GiftCard            @relation(fields: [giftCardId], references: [id])
  giftCardId  String
  type        GiftCardTxType
  amount      Int                 // positive for loads, negative for redemptions
  balance     Int                 // balance after transaction
  orderId     String?             // Order that used this
  notes       String?
  createdBy   String?             // User who initiated
  createdAt   DateTime            @default(now())

  @@index([giftCardId])
  @@index([orderId])
}

enum GiftCardStatus {
  PENDING     // purchased but not sent/activated
  ACTIVE
  REDEEMED    // fully used
  EXPIRED
  CANCELLED
}

enum GiftCardTxType {
  PURCHASE    // initial purchase
  REDEMPTION  // used at checkout
  REFUND      // refund back to card
  ADJUSTMENT  // manual adjustment
  EXPIRATION  // balance expired
  BONUS       // promotional bonus added
}

enum DeliveryType {
  IMMEDIATE   // send right away
  SCHEDULED   // send on specified date
  SELF        // purchaser keeps it
}
```

### Gift Card Service

```typescript
// lib/gift-cards/service.ts
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { sendEmail } from '@/lib/email';

// Generate a secure, readable gift card code
function generateGiftCardCode(): string {
  // Format: XXXX-XXXX-XXXX-XXXX (alphanumeric, no ambiguous chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  );
  return segments.join('-');
}

export interface CreateGiftCardInput {
  amount: number;
  purchaserId?: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  design?: string;
  deliveryType?: 'IMMEDIATE' | 'SCHEDULED' | 'SELF';
  scheduledFor?: Date;
  orderId?: string;
  expiresInDays?: number;
}

export async function createGiftCard(
  data: CreateGiftCardInput
): Promise<{ id: string; code: string }> {
  const code = generateGiftCardCode();
  const expiresAt = data.expiresInDays
    ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const shouldActivate = data.deliveryType === 'SELF' || !data.recipientEmail;

  const giftCard = await prisma.giftCard.create({
    data: {
      code,
      initialBalance: data.amount,
      currentBalance: data.amount,
      purchaserId: data.purchaserId,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      senderName: data.senderName,
      message: data.message,
      design: data.design,
      deliveryType: data.deliveryType || 'IMMEDIATE',
      scheduledFor: data.scheduledFor,
      orderId: data.orderId,
      expiresAt,
      status: shouldActivate ? 'ACTIVE' : 'PENDING',
      activatedAt: shouldActivate ? new Date() : null,
      transactions: {
        create: {
          type: 'PURCHASE',
          amount: data.amount,
          balance: data.amount,
        },
      },
    },
  });

  return { id: giftCard.id, code };
}

export async function sendGiftCard(giftCardId: string): Promise<void> {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  });

  if (!giftCard || !giftCard.recipientEmail) {
    throw new Error('Gift card not found or no recipient');
  }

  if (giftCard.status !== 'PENDING') {
    throw new Error('Gift card already sent or invalid status');
  }

  await sendEmail({
    to: giftCard.recipientEmail,
    template: 'gift-card-received',
    data: {
      recipientName: giftCard.recipientName,
      senderName: giftCard.senderName,
      amount: giftCard.initialBalance / 100,
      code: giftCard.code,
      message: giftCard.message,
      expiresAt: giftCard.expiresAt,
      design: giftCard.design,
    },
  });

  await prisma.giftCard.update({
    where: { id: giftCardId },
    data: {
      status: 'ACTIVE',
      activatedAt: new Date(),
      deliveredAt: new Date(),
    },
  });
}

export async function checkBalance(code: string): Promise<{
  valid: boolean;
  balance?: number;
  currency?: string;
  expiresAt?: Date | null;
  error?: string;
}> {
  // Normalize code: uppercase and remove non-alphanumeric
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Try to find with or without dashes
  const giftCard = await prisma.giftCard.findFirst({
    where: {
      OR: [
        { code: normalizedCode },
        { code: code.toUpperCase() },
      ],
    },
  });

  if (!giftCard) {
    return { valid: false, error: 'Invalid gift card code' };
  }

  if (giftCard.status === 'PENDING') {
    return { valid: false, error: 'This gift card has not been activated yet' };
  }

  if (giftCard.status === 'EXPIRED') {
    return { valid: false, error: 'This gift card has expired' };
  }

  if (giftCard.status === 'CANCELLED') {
    return { valid: false, error: 'This gift card has been cancelled' };
  }

  // Check expiration
  if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: { status: 'EXPIRED' },
    });
    return { valid: false, error: 'This gift card has expired' };
  }

  if (giftCard.currentBalance === 0) {
    return { valid: false, error: 'This gift card has no remaining balance' };
  }

  return {
    valid: true,
    balance: giftCard.currentBalance,
    currency: giftCard.currency,
    expiresAt: giftCard.expiresAt,
  };
}

export async function redeemGiftCard(
  code: string,
  amount: number,
  orderId: string,
  userId?: string
): Promise<{
  success: boolean;
  amountApplied: number;
  remainingBalance: number;
  error?: string;
}> {
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const result = await prisma.$transaction(async (tx) => {
    const giftCard = await tx.giftCard.findFirst({
      where: {
        OR: [
          { code: normalizedCode },
          { code: code.toUpperCase() },
        ],
      },
    });

    if (!giftCard || giftCard.status !== 'ACTIVE') {
      throw new Error('Invalid or inactive gift card');
    }

    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      await tx.giftCard.update({
        where: { id: giftCard.id },
        data: { status: 'EXPIRED' },
      });
      throw new Error('This gift card has expired');
    }

    const amountToRedeem = Math.min(amount, giftCard.currentBalance);
    const newBalance = giftCard.currentBalance - amountToRedeem;

    await tx.giftCard.update({
      where: { id: giftCard.id },
      data: {
        currentBalance: newBalance,
        status: newBalance === 0 ? 'REDEEMED' : 'ACTIVE',
      },
    });

    await tx.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        type: 'REDEMPTION',
        amount: -amountToRedeem,
        balance: newBalance,
        orderId,
        createdBy: userId,
      },
    });

    return { amountApplied: amountToRedeem, remainingBalance: newBalance };
  });

  return { success: true, ...result };
}

export async function refundToGiftCard(
  code: string,
  amount: number,
  orderId: string,
  notes?: string
): Promise<{ success: boolean; newBalance: number }> {
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const result = await prisma.$transaction(async (tx) => {
    const giftCard = await tx.giftCard.findFirst({
      where: {
        OR: [
          { code: normalizedCode },
          { code: code.toUpperCase() },
        ],
      },
    });

    if (!giftCard) {
      throw new Error('Gift card not found');
    }

    const newBalance = giftCard.currentBalance + amount;

    await tx.giftCard.update({
      where: { id: giftCard.id },
      data: {
        currentBalance: newBalance,
        status: 'ACTIVE', // Reactivate if was REDEEMED
      },
    });

    await tx.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        type: 'REFUND',
        amount: amount,
        balance: newBalance,
        orderId,
        notes,
      },
    });

    return { newBalance };
  });

  return { success: true, ...result };
}

export async function getGiftCardHistory(code: string): Promise<{
  giftCard: any;
  transactions: any[];
}> {
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const giftCard = await prisma.giftCard.findFirst({
    where: {
      OR: [
        { code: normalizedCode },
        { code: code.toUpperCase() },
      ],
    },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!giftCard) {
    throw new Error('Gift card not found');
  }

  return {
    giftCard,
    transactions: giftCard.transactions,
  };
}
```

### Scheduled Delivery Job

```typescript
// lib/gift-cards/scheduled-delivery.ts
import { prisma } from '@/lib/prisma';
import { sendGiftCard } from './service';

export async function processScheduledGiftCards(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const now = new Date();
  let processed = 0;
  let sent = 0;
  let errors = 0;

  // Find gift cards scheduled for delivery
  const scheduledCards = await prisma.giftCard.findMany({
    where: {
      status: 'PENDING',
      deliveryType: 'SCHEDULED',
      scheduledFor: { lte: now },
    },
  });

  for (const card of scheduledCards) {
    processed++;
    try {
      await sendGiftCard(card.id);
      sent++;
    } catch (error) {
      errors++;
      console.error(`Failed to send gift card ${card.id}:`, error);
    }
  }

  return { processed, sent, errors };
}
```

## Examples

### Example 1: Gift Card Input Component

```tsx
// components/gift-card-input.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Gift, Check, X, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface GiftCardInputProps {
  onApply: (code: string, balance: number) => void;
  appliedCards: Array<{ code: string; applied: number }>;
  onRemove: (code: string) => void;
}

export function GiftCardInput({ onApply, appliedCards, onRemove }: GiftCardInputProps) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    balance?: number;
    error?: string;
  } | null>(null);

  const checkCode = async () => {
    setChecking(true);
    setResult(null);

    try {
      const res = await fetch(`/api/gift-cards/check?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      setResult(data);

      if (data.valid && data.balance) {
        onApply(code, data.balance);
        setCode('');
        setResult(null);
      }
    } catch {
      setResult({ valid: false, error: 'Failed to check gift card' });
    } finally {
      setChecking(false);
    }
  };

  // Format input as XXXX-XXXX-XXXX-XXXX
  const handleChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
    setCode(formatted.slice(0, 19));
    setResult(null);
  };

  return (
    <div className="space-y-3">
      {/* Applied cards */}
      {appliedCards.length > 0 && (
        <div className="space-y-2">
          {appliedCards.map((card) => (
            <div
              key={card.code}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-600" />
                <span className="font-mono text-sm">{card.code}</span>
                <span className="text-green-600 font-medium">
                  -{formatPrice(card.applied)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(card.code)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="pl-10 font-mono"
          />
        </div>
        <Button
          onClick={checkCode}
          disabled={code.length < 19 || checking}
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>

      {/* Result message */}
      {result && (
        <div
          className={`flex items-center gap-2 text-sm ${
            result.valid ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {result.valid ? (
            <>
              <Check className="h-4 w-4" />
              <span>Balance: {formatPrice(result.balance!)}</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span>{result.error}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

### Example 2: Gift Card Purchase Form

```tsx
// components/gift-card-purchase-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatPrice } from '@/lib/utils';

const PRESET_AMOUNTS = [2500, 5000, 7500, 10000]; // in cents

export function GiftCardPurchaseForm() {
  const router = useRouter();
  const [amount, setAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryType, setDeliveryType] = useState<'IMMEDIATE' | 'SELF'>('IMMEDIATE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: customAmount ? parseInt(customAmount) * 100 : amount,
          recipientEmail: deliveryType === 'IMMEDIATE' ? recipientEmail : undefined,
          recipientName,
          senderName,
          message,
          deliveryType,
        }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
      }
    } catch (error) {
      console.error('Failed to create gift card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount selection */}
      <div className="space-y-3">
        <Label>Select Amount</Label>
        <div className="grid grid-cols-4 gap-3">
          {PRESET_AMOUNTS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={amount === preset && !customAmount ? 'default' : 'outline'}
              onClick={() => {
                setAmount(preset);
                setCustomAmount('');
              }}
            >
              {formatPrice(preset)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">$</span>
          <Input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min={5}
            max={500}
          />
        </div>
      </div>

      {/* Delivery type */}
      <div className="space-y-3">
        <Label>Delivery</Label>
        <RadioGroup
          value={deliveryType}
          onValueChange={(v) => setDeliveryType(v as 'IMMEDIATE' | 'SELF')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="IMMEDIATE" id="immediate" />
            <Label htmlFor="immediate">Send to recipient via email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SELF" id="self" />
            <Label htmlFor="self">Keep for myself</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Recipient details */}
      {deliveryType === 'IMMEDIATE' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderName">Your Name</Label>
            <Input
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Processing...' : `Purchase Gift Card - ${formatPrice(customAmount ? parseInt(customAmount) * 100 : amount)}`}
      </Button>
    </form>
  );
}
```

### Example 3: Gift Card Balance Check API

```typescript
// app/api/gift-cards/check/route.ts
import { NextResponse } from 'next/server';
import { checkBalance } from '@/lib/gift-cards/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { valid: false, error: 'Gift card code is required' },
      { status: 400 }
    );
  }

  try {
    const result = await checkBalance(code);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: 'Failed to check gift card' },
      { status: 500 }
    );
  }
}
```

### Example 4: Admin Gift Card Management

```tsx
// app/admin/gift-cards/page.tsx
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  REDEEMED: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default async function AdminGiftCardsPage() {
  const giftCards = await prisma.giftCard.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      _count: { select: { transactions: true } },
    },
  });

  const stats = await prisma.giftCard.aggregate({
    _sum: { initialBalance: true, currentBalance: true },
    _count: true,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gift Cards</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-lg border">
          <div className="text-sm text-muted-foreground">Total Sold</div>
          <div className="text-2xl font-bold">
            {formatPrice(stats._sum.initialBalance || 0)}
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="text-sm text-muted-foreground">Outstanding Balance</div>
          <div className="text-2xl font-bold">
            {formatPrice(stats._sum.currentBalance || 0)}
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="text-sm text-muted-foreground">Total Cards</div>
          <div className="text-2xl font-bold">{stats._count}</div>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="text-sm text-muted-foreground">Redemption Rate</div>
          <div className="text-2xl font-bold">
            {stats._sum.initialBalance
              ? Math.round(
                  ((stats._sum.initialBalance - (stats._sum.currentBalance || 0)) /
                    stats._sum.initialBalance) *
                    100
                )
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Initial</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {giftCards.map((card) => (
            <TableRow key={card.id}>
              <TableCell className="font-mono">{card.code}</TableCell>
              <TableCell>
                <Badge className={statusColors[card.status]}>
                  {card.status}
                </Badge>
              </TableCell>
              <TableCell>{formatPrice(card.initialBalance)}</TableCell>
              <TableCell>{formatPrice(card.currentBalance)}</TableCell>
              <TableCell>{card.recipientEmail || '-'}</TableCell>
              <TableCell>{formatDate(card.createdAt)}</TableCell>
              <TableCell>
                {card.expiresAt ? formatDate(card.expiresAt) : 'Never'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

## Anti-patterns

### Anti-pattern 1: Predictable Code Generation

```typescript
// BAD - Sequential or predictable codes
let counter = 0;
function generateCode() {
  return `GC${String(counter++).padStart(8, '0')}`; // GC00000001, GC00000002...
}

// GOOD - Cryptographically random, unguessable codes
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  );
  return segments.join('-');
}
```

### Anti-pattern 2: No Transaction Logging

```typescript
// BAD - Direct balance update without history
await prisma.giftCard.update({
  where: { id: giftCardId },
  data: { currentBalance: { decrement: amount } },
});

// GOOD - Record every transaction
await prisma.$transaction([
  prisma.giftCard.update({
    where: { id: giftCardId },
    data: { currentBalance: { decrement: amount } },
  }),
  prisma.giftCardTransaction.create({
    data: {
      giftCardId,
      type: 'REDEMPTION',
      amount: -amount,
      balance: newBalance,
      orderId,
    },
  }),
]);
```

### Anti-pattern 3: No Expiration Handling

```typescript
// BAD - Ignoring expiration dates
export async function checkBalance(code: string) {
  const card = await prisma.giftCard.findUnique({ where: { code } });
  return { balance: card?.currentBalance }; // Never checks expiration!
}

// GOOD - Always check and update expiration status
export async function checkBalance(code: string) {
  const card = await prisma.giftCard.findUnique({ where: { code } });

  if (card?.expiresAt && card.expiresAt < new Date()) {
    await prisma.giftCard.update({
      where: { id: card.id },
      data: { status: 'EXPIRED' },
    });
    return { valid: false, error: 'Gift card has expired' };
  }

  return { valid: true, balance: card?.currentBalance };
}
```

### Anti-pattern 4: Allowing Negative Balances

```typescript
// BAD - No balance validation
await prisma.giftCard.update({
  where: { id: giftCardId },
  data: { currentBalance: { decrement: amount } }, // Could go negative!
});

// GOOD - Validate and cap redemption amount
const amountToRedeem = Math.min(amount, giftCard.currentBalance);
const newBalance = giftCard.currentBalance - amountToRedeem;

await prisma.giftCard.update({
  where: { id: giftCardId },
  data: { currentBalance: newBalance },
});
```

## Testing

### Unit Test: Gift Card Service

```typescript
// __tests__/lib/gift-cards/service.test.ts
import { createGiftCard, checkBalance, redeemGiftCard } from '@/lib/gift-cards/service';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');

describe('Gift Card Service', () => {
  describe('createGiftCard', () => {
    it('should create a gift card with correct initial values', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        id: 'card-1',
        code: 'ABCD-EFGH-IJKL-MNOP',
      });
      (prisma.giftCard.create as jest.Mock) = mockCreate;

      const result = await createGiftCard({
        amount: 5000,
        recipientEmail: 'test@example.com',
      });

      expect(result.id).toBeDefined();
      expect(result.code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            initialBalance: 5000,
            currentBalance: 5000,
          }),
        })
      );
    });
  });

  describe('checkBalance', () => {
    it('should return balance for valid card', async () => {
      (prisma.giftCard.findFirst as jest.Mock).mockResolvedValue({
        id: 'card-1',
        code: 'ABCD-EFGH-IJKL-MNOP',
        currentBalance: 5000,
        status: 'ACTIVE',
        expiresAt: null,
      });

      const result = await checkBalance('ABCD-EFGH-IJKL-MNOP');

      expect(result.valid).toBe(true);
      expect(result.balance).toBe(5000);
    });

    it('should return error for expired card', async () => {
      (prisma.giftCard.findFirst as jest.Mock).mockResolvedValue({
        id: 'card-1',
        currentBalance: 5000,
        status: 'ACTIVE',
        expiresAt: new Date('2020-01-01'),
      });

      const result = await checkBalance('ABCD-EFGH-IJKL-MNOP');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });
  });
});
```

### Integration Test: Redemption Flow

```typescript
// __tests__/integration/gift-card-redemption.test.ts
import { createGiftCard, redeemGiftCard, checkBalance } from '@/lib/gift-cards/service';
import { prisma } from '@/lib/prisma';

describe('Gift Card Redemption Flow', () => {
  let giftCardCode: string;

  beforeEach(async () => {
    const result = await createGiftCard({
      amount: 10000,
      deliveryType: 'SELF',
    });
    giftCardCode = result.code;
  });

  afterEach(async () => {
    await prisma.giftCardTransaction.deleteMany({});
    await prisma.giftCard.deleteMany({});
  });

  it('should allow partial redemption', async () => {
    const result = await redeemGiftCard(giftCardCode, 3000, 'order-1');

    expect(result.success).toBe(true);
    expect(result.amountApplied).toBe(3000);
    expect(result.remainingBalance).toBe(7000);

    const balance = await checkBalance(giftCardCode);
    expect(balance.balance).toBe(7000);
  });

  it('should cap redemption at available balance', async () => {
    const result = await redeemGiftCard(giftCardCode, 15000, 'order-1');

    expect(result.success).toBe(true);
    expect(result.amountApplied).toBe(10000);
    expect(result.remainingBalance).toBe(0);
  });
});
```

## Related Skills

- [Stripe Checkout](../patterns/stripe-checkout.md) - Payment processing
- [Transactional Email](../patterns/transactional-email.md) - Email delivery
- [Discount Engine](../patterns/discount-engine.md) - Coupon and promo codes
- [Order Management](../patterns/order-management.md) - Order processing

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive overview section
- Added When NOT to Use section
- Enhanced composition diagram with full lifecycle
- Added delivery type support (immediate, scheduled, self)
- Added refund to gift card functionality
- Added 4 real-world usage examples
- Added 4 anti-patterns with code examples
- Added unit and integration test examples
- Added admin dashboard example
- Added gift card purchase form
- Improved documentation structure

### 1.0.0 (2025-01-15)
- Initial implementation
- Code generation and validation
- Balance tracking and redemption
- Email delivery integration
