---
id: pt-returns-management
name: Returns Management
version: 1.1.0
layer: L5
category: data
description: Complete returns and refunds workflow with RMA generation, return shipping labels, refund automation, and restocking
tags: [returns, refunds, rma, ecommerce, next15]
composes: []
formula: "ReturnsManagement = RMAGeneration + ReturnShipping + RefundProcessing + Restocking"
dependencies:
  prisma: "^6.0.0"
  stripe: "^17.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Returns Management

## Overview

Returns management is a critical component of any e-commerce platform that directly impacts customer satisfaction and operational efficiency. A well-designed returns system streamlines the process from initial request to final resolution, handling Return Merchandise Authorization (RMA) generation, shipping label creation, refund processing, and inventory restocking.

This pattern provides a comprehensive implementation for Next.js 15 applications, integrating with Stripe for refund processing and supporting multiple return scenarios including full returns, partial returns, exchanges, and store credit. The system tracks each return through its lifecycle with proper state management and audit trails.

The architecture separates concerns between the customer-facing return request flow and the admin-side return processing workflow. This enables customers to initiate returns independently while giving operations teams full control over approval, inspection, and refund decisions. Email notifications keep all parties informed throughout the process.

## When to Use

- Processing customer return requests in e-commerce applications
- Generating prepaid return shipping labels via carrier APIs
- Automating refund workflows with payment processor integration
- Tracking return status through multiple stages (requested, approved, shipped, received, refunded)
- Managing inventory restocking for returned items in good condition
- Building customer self-service return portals

## When NOT to Use

- **Digital products**: Digital goods typically do not require physical returns
- **Non-refundable items**: Some products (custom items, perishables) may not be returnable
- **Subscription services**: Use subscription management patterns instead
- **B2B wholesale**: May require different return authorization workflows with approval chains

## Composition Diagram

```
Returns Management Architecture
================================

┌──────────────────────────────────────────────────────────────────────────┐
│                           Customer Flow                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │   Order     │ →  │   Return    │ →  │   Track     │                  │
│  │   History   │    │   Request   │    │   Status    │                  │
│  └─────────────┘    └──────┬──────┘    └─────────────┘                  │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        Returns Service                                    │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Return Lifecycle                               │   │
│  │                                                                   │   │
│  │  REQUESTED → APPROVED → LABEL_SENT → SHIPPED → RECEIVED         │   │
│  │                                                      │            │   │
│  │                                                      ▼            │   │
│  │                                              INSPECTING          │   │
│  │                                                      │            │   │
│  │                              ┌────────────┬──────────┴──────┐    │   │
│  │                              ▼            ▼                  ▼    │   │
│  │                          REFUNDED    COMPLETED           REJECTED │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Shipping API   │ │  Stripe API     │ │  Inventory      │
│  (Label Gen)    │ │  (Refunds)      │ │  (Restocking)   │
└─────────────────┘ └─────────────────┘ └─────────────────┘

Database Schema:
================
Return (1) ──────────< ReturnItem (*)
   │                        │
   │                        │
   └──> Order              └──> OrderItem ──> Product
```

## Implementation

### Database Schema

```prisma
model Return {
  id              String       @id @default(cuid())
  returnNumber    String       @unique @default(cuid())
  order           Order        @relation(fields: [orderId], references: [id])
  orderId         String
  status          ReturnStatus @default(REQUESTED)
  reason          ReturnReason
  reasonDetails   String?
  items           ReturnItem[]

  // Shipping
  trackingNumber  String?
  labelUrl        String?
  labelExpiry     DateTime?
  carrier         String?
  shipFromAddress Json?

  // Refund
  refundAmount    Int?
  refundMethod    RefundMethod?
  refundId        String?      // Stripe refund ID
  refundedAt      DateTime?

  // Dates
  requestedAt     DateTime     @default(now())
  approvedAt      DateTime?
  shippedAt       DateTime?
  receivedAt      DateTime?
  inspectedAt     DateTime?
  completedAt     DateTime?

  // Admin
  processedBy     String?
  notes           String?
  internalNotes   String?

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([orderId])
  @@index([status])
  @@index([returnNumber])
}

model ReturnItem {
  id          String         @id @default(cuid())
  return      Return         @relation(fields: [returnId], references: [id], onDelete: Cascade)
  returnId    String
  orderItem   OrderItem      @relation(fields: [orderItemId], references: [id])
  orderItemId String
  quantity    Int
  condition   ItemCondition?
  restocked   Boolean        @default(false)
  restockedAt DateTime?
  damageNotes String?

  @@index([returnId])
  @@index([orderItemId])
}

enum ReturnStatus {
  REQUESTED
  APPROVED
  LABEL_SENT
  SHIPPED
  RECEIVED
  INSPECTING
  REFUNDED
  COMPLETED
  REJECTED
  CANCELLED
}

enum ReturnReason {
  WRONG_ITEM
  DAMAGED
  NOT_AS_DESCRIBED
  CHANGED_MIND
  DEFECTIVE
  TOO_LATE
  SIZING_ISSUE
  QUALITY_ISSUE
  BETTER_PRICE_FOUND
  OTHER
}

enum RefundMethod {
  ORIGINAL_PAYMENT
  STORE_CREDIT
  EXCHANGE
  PARTIAL_REFUND
}

enum ItemCondition {
  NEW
  LIKE_NEW
  USED
  DAMAGED
  UNSELLABLE
}
```

### Returns Service

```typescript
// lib/returns/service.ts
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { createShippingLabel, ShippingLabel } from '@/lib/shipping/service';
import { sendEmail } from '@/lib/email';
import { ReturnStatus, RefundMethod, ItemCondition } from '@prisma/client';

export interface CreateReturnInput {
  orderId: string;
  items: { orderItemId: string; quantity: number }[];
  reason: string;
  reasonDetails?: string;
  userId: string;
}

export interface ReturnResult {
  success: boolean;
  returnId?: string;
  returnNumber?: string;
  error?: string;
}

const RETURN_WINDOW_DAYS = 30;
const LABEL_VALIDITY_DAYS = 14;

export async function createReturnRequest(
  input: CreateReturnInput
): Promise<ReturnResult> {
  const { orderId, items, reason, reasonDetails, userId } = input;

  // Validate order exists and belongs to user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: true,
    },
  });

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  if (order.userId !== userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Check return window
  const daysSinceOrder = Math.floor(
    (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceOrder > RETURN_WINDOW_DAYS) {
    return {
      success: false,
      error: `Order is outside the ${RETURN_WINDOW_DAYS}-day return window`,
    };
  }

  // Validate items exist in order and quantities are valid
  for (const item of items) {
    const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
    if (!orderItem) {
      return { success: false, error: `Item ${item.orderItemId} not found in order` };
    }
    if (item.quantity > orderItem.quantity) {
      return { success: false, error: `Cannot return more than ordered quantity` };
    }
  }

  // Check for existing returns on same items
  const existingReturns = await prisma.return.findMany({
    where: {
      orderId,
      status: { notIn: ['REJECTED', 'CANCELLED'] },
    },
    include: { items: true },
  });

  for (const item of items) {
    const orderItem = order.items.find((oi) => oi.id === item.orderItemId)!;
    const alreadyReturned = existingReturns.reduce((sum, ret) => {
      const returnItem = ret.items.find((ri) => ri.orderItemId === item.orderItemId);
      return sum + (returnItem?.quantity || 0);
    }, 0);

    if (alreadyReturned + item.quantity > orderItem.quantity) {
      return {
        success: false,
        error: `Cannot return more items than ordered (already returned: ${alreadyReturned})`,
      };
    }
  }

  // Create return request
  const returnRequest = await prisma.return.create({
    data: {
      orderId,
      reason: reason as any,
      reasonDetails,
      items: {
        create: items.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });

  // Send confirmation email
  await sendEmail({
    to: order.user.email,
    template: 'return-requested',
    data: {
      returnNumber: returnRequest.returnNumber,
      orderNumber: order.orderNumber,
      items: items.length,
      reason,
    },
  });

  return {
    success: true,
    returnId: returnRequest.id,
    returnNumber: returnRequest.returnNumber,
  };
}

export async function approveReturn(
  returnId: string,
  adminUserId: string
): Promise<{ success: boolean; labelUrl?: string; trackingNumber?: string; error?: string }> {
  const returnRequest = await prisma.return.findUnique({
    where: { id: returnId },
    include: {
      order: {
        include: { shippingAddress: true },
      },
      items: {
        include: { orderItem: { include: { product: true } } },
      },
    },
  });

  if (!returnRequest) {
    return { success: false, error: 'Return not found' };
  }

  if (returnRequest.status !== 'REQUESTED') {
    return { success: false, error: `Cannot approve return in ${returnRequest.status} status` };
  }

  // Generate return shipping label
  let label: ShippingLabel;
  try {
    label = await createShippingLabel({
      fromAddress: returnRequest.order.shippingAddress,
      toAddress: {
        name: 'Returns Department',
        street: process.env.WAREHOUSE_STREET!,
        city: process.env.WAREHOUSE_CITY!,
        state: process.env.WAREHOUSE_STATE!,
        zip: process.env.WAREHOUSE_ZIP!,
        country: 'US',
      },
      weight: calculateReturnWeight(returnRequest.items),
      carrier: 'usps',
    });
  } catch (error) {
    console.error('Failed to create shipping label:', error);
    return { success: false, error: 'Failed to generate shipping label' };
  }

  await prisma.return.update({
    where: { id: returnId },
    data: {
      status: 'LABEL_SENT',
      approvedAt: new Date(),
      labelUrl: label.labelUrl,
      trackingNumber: label.trackingNumber,
      labelExpiry: new Date(Date.now() + LABEL_VALIDITY_DAYS * 24 * 60 * 60 * 1000),
      carrier: label.carrier,
      processedBy: adminUserId,
    },
  });

  // Send label to customer
  await sendEmail({
    to: returnRequest.order.email,
    template: 'return-approved',
    data: {
      returnNumber: returnRequest.returnNumber,
      labelUrl: label.labelUrl,
      trackingNumber: label.trackingNumber,
      expiryDays: LABEL_VALIDITY_DAYS,
    },
  });

  return {
    success: true,
    labelUrl: label.labelUrl,
    trackingNumber: label.trackingNumber,
  };
}

export async function markReturnReceived(returnId: string): Promise<void> {
  await prisma.return.update({
    where: { id: returnId },
    data: {
      status: 'RECEIVED',
      receivedAt: new Date(),
    },
  });
}

export async function inspectReturnItems(
  returnId: string,
  inspections: { itemId: string; condition: ItemCondition; damageNotes?: string }[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const inspection of inspections) {
      await tx.returnItem.update({
        where: { id: inspection.itemId },
        data: {
          condition: inspection.condition,
          damageNotes: inspection.damageNotes,
        },
      });
    }

    await tx.return.update({
      where: { id: returnId },
      data: {
        status: 'INSPECTING',
        inspectedAt: new Date(),
      },
    });
  });
}

export async function processRefund(
  returnId: string,
  amount: number,
  method: RefundMethod,
  adminUserId: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  const returnRequest = await prisma.return.findUnique({
    where: { id: returnId },
    include: {
      order: true,
      items: { include: { orderItem: true } },
    },
  });

  if (!returnRequest) {
    return { success: false, error: 'Return not found' };
  }

  if (!['RECEIVED', 'INSPECTING'].includes(returnRequest.status)) {
    return { success: false, error: `Cannot process refund for return in ${returnRequest.status} status` };
  }

  let refundId: string | undefined;

  try {
    if (method === 'ORIGINAL_PAYMENT' && returnRequest.order.paymentIntent) {
      // Process Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: returnRequest.order.paymentIntent,
        amount,
        reason: 'requested_by_customer',
        metadata: {
          returnId,
          returnNumber: returnRequest.returnNumber,
        },
      });
      refundId = refund.id;
    } else if (method === 'STORE_CREDIT') {
      // Add store credit to customer account
      await prisma.storeCredit.create({
        data: {
          userId: returnRequest.order.userId,
          amount,
          reason: `Refund for return ${returnRequest.returnNumber}`,
          returnId,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });
    } else if (method === 'EXCHANGE') {
      // Create exchange order placeholder
      // Implementation depends on exchange workflow
    }

    await prisma.return.update({
      where: { id: returnId },
      data: {
        status: 'REFUNDED',
        refundAmount: amount,
        refundMethod: method,
        refundId,
        refundedAt: new Date(),
        processedBy: adminUserId,
      },
    });

    // Send refund confirmation
    await sendEmail({
      to: returnRequest.order.email,
      template: 'refund-processed',
      data: {
        returnNumber: returnRequest.returnNumber,
        amount: amount / 100,
        method: method.replace('_', ' ').toLowerCase(),
        currency: 'USD',
      },
    });

    return { success: true, refundId };
  } catch (error) {
    console.error('Refund error:', error);
    return { success: false, error: 'Failed to process refund' };
  }
}

export async function restockItems(returnId: string): Promise<void> {
  const returnRequest = await prisma.return.findUnique({
    where: { id: returnId },
    include: {
      items: {
        include: { orderItem: { include: { product: true } } },
      },
    },
  });

  if (!returnRequest) throw new Error('Return not found');

  await prisma.$transaction(async (tx) => {
    for (const item of returnRequest.items) {
      // Only restock items in good condition
      if (item.condition === 'NEW' || item.condition === 'LIKE_NEW') {
        await tx.product.update({
          where: { id: item.orderItem.productId },
          data: { inventory: { increment: item.quantity } },
        });

        await tx.returnItem.update({
          where: { id: item.id },
          data: {
            restocked: true,
            restockedAt: new Date(),
          },
        });

        // Log inventory change
        await tx.inventoryLog.create({
          data: {
            productId: item.orderItem.productId,
            change: item.quantity,
            reason: 'RETURN_RESTOCK',
            reference: returnRequest.returnNumber,
          },
        });
      }
    }

    await tx.return.update({
      where: { id: returnId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  });
}

export async function rejectReturn(
  returnId: string,
  reason: string,
  adminUserId: string
): Promise<void> {
  const returnRequest = await prisma.return.findUnique({
    where: { id: returnId },
    include: { order: true },
  });

  if (!returnRequest) throw new Error('Return not found');

  await prisma.return.update({
    where: { id: returnId },
    data: {
      status: 'REJECTED',
      internalNotes: reason,
      processedBy: adminUserId,
    },
  });

  await sendEmail({
    to: returnRequest.order.email,
    template: 'return-rejected',
    data: {
      returnNumber: returnRequest.returnNumber,
      reason,
    },
  });
}

function calculateReturnWeight(items: any[]): number {
  return items.reduce((total, item) => {
    const weight = item.orderItem?.product?.weight || 1;
    return total + weight * item.quantity;
  }, 0);
}
```

### API Routes

```typescript
// app/api/returns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { createReturnRequest } from '@/lib/returns/service';
import { prisma } from '@/lib/prisma';

const createReturnSchema = z.object({
  orderId: z.string().cuid(),
  items: z.array(z.object({
    orderItemId: z.string().cuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  reason: z.enum([
    'WRONG_ITEM', 'DAMAGED', 'NOT_AS_DESCRIBED', 'CHANGED_MIND',
    'DEFECTIVE', 'TOO_LATE', 'SIZING_ISSUE', 'QUALITY_ISSUE',
    'BETTER_PRICE_FOUND', 'OTHER',
  ]),
  reasonDetails: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createReturnSchema.parse(body);

    const result = await createReturnRequest({
      ...data,
      userId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      returnId: result.returnId,
      returnNumber: result.returnNumber,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create return error:', error);
    return NextResponse.json({ error: 'Failed to create return' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const returns = await prisma.return.findMany({
    where: {
      order: { userId: session.user.id },
    },
    include: {
      items: {
        include: {
          orderItem: {
            include: { product: { select: { name: true, images: true } } },
          },
        },
      },
      order: { select: { orderNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ returns });
}
```

## Examples

### Example 1: Return Request Form

```tsx
// components/return-request-form.tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';

const returnSchema = z.object({
  items: z.array(z.object({
    orderItemId: z.string(),
    quantity: z.number().min(1),
    maxQuantity: z.number(),
    selected: z.boolean(),
    name: z.string(),
    price: z.number(),
  })).refine(items => items.some(i => i.selected), {
    message: 'Select at least one item to return',
  }),
  reason: z.enum([
    'WRONG_ITEM', 'DAMAGED', 'NOT_AS_DESCRIBED', 'CHANGED_MIND',
    'DEFECTIVE', 'TOO_LATE', 'SIZING_ISSUE', 'QUALITY_ISSUE',
    'BETTER_PRICE_FOUND', 'OTHER',
  ]),
  reasonDetails: z.string().max(1000).optional(),
});

type ReturnFormData = z.infer<typeof returnSchema>;

const REASON_LABELS: Record<string, string> = {
  WRONG_ITEM: 'Wrong item received',
  DAMAGED: 'Item arrived damaged',
  NOT_AS_DESCRIBED: 'Not as described',
  CHANGED_MIND: 'Changed my mind',
  DEFECTIVE: 'Product is defective',
  TOO_LATE: 'Arrived too late',
  SIZING_ISSUE: 'Sizing issue',
  QUALITY_ISSUE: 'Quality not as expected',
  BETTER_PRICE_FOUND: 'Found better price elsewhere',
  OTHER: 'Other reason',
};

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

export function ReturnRequestForm({ order }: { order: Order }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ returnNumber: string } | null>(null);

  const form = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      items: order.items.map((item) => ({
        orderItemId: item.id,
        quantity: item.quantity,
        maxQuantity: item.quantity,
        selected: false,
        name: item.name,
        price: item.price,
      })),
      reason: undefined,
      reasonDetails: '',
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const selectedItems = form.watch('items').filter((i) => i.selected);
  const estimatedRefund = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const onSubmit = async (data: ReturnFormData) => {
    setIsSubmitting(true);
    setError(null);

    const selectedItems = data.items.filter((i) => i.selected);

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: selectedItems.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })),
          reason: data.reason,
          reasonDetails: data.reasonDetails,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit return request');
      }

      setSuccess({ returnNumber: result.returnNumber });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Alert variant="success">
        <h3 className="font-semibold">Return Request Submitted</h3>
        <p>Your return number is: <strong>{success.returnNumber}</strong></p>
        <p className="mt-2 text-sm">
          We will review your request and send you a prepaid shipping label within 1-2 business days.
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      <div className="space-y-4">
        <h3 className="font-medium">Select items to return</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <Checkbox
              checked={form.watch(`items.${index}.selected`)}
              onCheckedChange={(checked) => {
                form.setValue(`items.${index}.selected`, !!checked);
              }}
            />
            <div className="flex-1">
              <p className="font-medium">{field.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(field.price)}
              </p>
            </div>
            {form.watch(`items.${index}.selected`) && (
              <Select
                value={form.watch(`items.${index}.quantity`).toString()}
                onValueChange={(value) => {
                  form.setValue(`items.${index}.quantity`, parseInt(value));
                }}
              >
                {Array.from({ length: field.maxQuantity }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="font-medium">Reason for return</label>
        <Select {...form.register('reason')}>
          <option value="">Select a reason</option>
          {Object.entries(REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        {form.formState.errors.reason && (
          <p className="text-sm text-destructive">
            {form.formState.errors.reason.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-medium">Additional details (optional)</label>
        <Textarea
          {...form.register('reasonDetails')}
          placeholder="Please provide any additional details about your return..."
          rows={4}
        />
      </div>

      {selectedItems.length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between">
            <span>Estimated refund:</span>
            <span className="font-semibold">{formatCurrency(estimatedRefund)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Final refund amount will be determined after inspection.
          </p>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
      </Button>
    </form>
  );
}
```

### Example 2: Admin Returns Dashboard

```tsx
// app/admin/returns/page.tsx
import { prisma } from '@/lib/prisma';
import { ReturnStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ReturnActions } from './return-actions';

const STATUS_COLORS: Record<ReturnStatus, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  LABEL_SENT: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  RECEIVED: 'bg-cyan-100 text-cyan-800',
  INSPECTING: 'bg-orange-100 text-orange-800',
  REFUNDED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as ReturnStatus | undefined;
  const page = parseInt(params.page || '1');
  const limit = 20;

  const [returns, total] = await Promise.all([
    prisma.return.findMany({
      where: status ? { status } : {},
      include: {
        order: { select: { orderNumber: true, email: true } },
        items: { include: { orderItem: { include: { product: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.return.count({ where: status ? { status } : {} }),
  ]);

  const statusCounts = await prisma.return.groupBy({
    by: ['status'],
    _count: true,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Returns Management</h1>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <a
          href="/admin/returns"
          className={`px-3 py-1 rounded ${!status ? 'bg-primary text-white' : 'bg-gray-100'}`}
        >
          All ({total})
        </a>
        {Object.values(ReturnStatus).map((s) => {
          const count = statusCounts.find((c) => c.status === s)?._count || 0;
          return (
            <a
              key={s}
              href={`/admin/returns?status=${s}`}
              className={`px-3 py-1 rounded ${status === s ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              {s.replace('_', ' ')} ({count})
            </a>
          );
        })}
      </div>

      {/* Returns table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Return #</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {returns.map((ret) => (
              <tr key={ret.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{ret.returnNumber}</td>
                <td className="px-4 py-3">{ret.order.orderNumber}</td>
                <td className="px-4 py-3">{ret.order.email}</td>
                <td className="px-4 py-3">{ret.items.length} item(s)</td>
                <td className="px-4 py-3 capitalize">{ret.reason.toLowerCase().replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[ret.status]}>
                    {ret.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(ret.createdAt)}</td>
                <td className="px-4 py-3">
                  <ReturnActions return={ret} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Example 3: Return Tracking Page

```tsx
// app/returns/[returnNumber]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatDate, formatCurrency } from '@/lib/utils';

const TIMELINE_STEPS = [
  { status: 'REQUESTED', label: 'Return Requested' },
  { status: 'APPROVED', label: 'Return Approved' },
  { status: 'LABEL_SENT', label: 'Shipping Label Sent' },
  { status: 'SHIPPED', label: 'Package Shipped' },
  { status: 'RECEIVED', label: 'Package Received' },
  { status: 'INSPECTING', label: 'Inspecting Items' },
  { status: 'REFUNDED', label: 'Refund Processed' },
  { status: 'COMPLETED', label: 'Return Completed' },
];

export default async function ReturnTrackingPage({
  params,
}: {
  params: Promise<{ returnNumber: string }>;
}) {
  const { returnNumber } = await params;

  const returnRequest = await prisma.return.findUnique({
    where: { returnNumber },
    include: {
      order: true,
      items: {
        include: {
          orderItem: { include: { product: true } },
        },
      },
    },
  });

  if (!returnRequest) {
    notFound();
  }

  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (step) => step.status === returnRequest.status
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Return Status</h1>
      <p className="text-muted-foreground mb-8">
        Return #{returnRequest.returnNumber}
      </p>

      {/* Status Timeline */}
      <div className="mb-8">
        <div className="relative">
          {TIMELINE_STEPS.map((step, index) => {
            const isComplete = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.status} className="flex items-start mb-4 last:mb-0">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-500 text-white' : 'bg-gray-200'
                    } ${isCurrent ? 'ring-2 ring-green-300' : ''}`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-8 ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="ml-4">
                  <p className={`font-medium ${isComplete ? '' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {isCurrent && returnRequest.status === 'LABEL_SENT' && (
                    <a
                      href={returnRequest.labelUrl || '#'}
                      className="text-sm text-primary hover:underline"
                      target="_blank"
                    >
                      Download shipping label
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Details */}
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Return Details</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Order Number:</dt>
          <dd>{returnRequest.order.orderNumber}</dd>
          <dt className="text-muted-foreground">Reason:</dt>
          <dd className="capitalize">{returnRequest.reason.toLowerCase().replace('_', ' ')}</dd>
          <dt className="text-muted-foreground">Requested:</dt>
          <dd>{formatDate(returnRequest.requestedAt)}</dd>
          {returnRequest.trackingNumber && (
            <>
              <dt className="text-muted-foreground">Tracking:</dt>
              <dd>{returnRequest.trackingNumber}</dd>
            </>
          )}
          {returnRequest.refundAmount && (
            <>
              <dt className="text-muted-foreground">Refund Amount:</dt>
              <dd>{formatCurrency(returnRequest.refundAmount / 100)}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Items */}
      <div>
        <h3 className="font-medium mb-2">Items Being Returned</h3>
        <div className="space-y-2">
          {returnRequest.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 border rounded">
              <div className="flex-1">
                <p className="font-medium">{item.orderItem.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              {item.condition && (
                <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                  {item.condition}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Anti-patterns

### 1. No Return Window Validation

```typescript
// BAD - No validation of return eligibility
export async function createReturn(orderId: string, items: any[]) {
  return prisma.return.create({
    data: { orderId, items: { create: items } },
  });
}

// GOOD - Validate return window and eligibility
export async function createReturn(orderId: string, items: any[]) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  const daysSinceOrder = Math.floor(
    (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceOrder > 30) {
    throw new Error('Order is outside the return window');
  }

  // Also check: order status, items already returned, product return policy
  return prisma.return.create({
    data: { orderId, items: { create: items } },
  });
}
```

### 2. Manual Refund Processing Without Tracking

```typescript
// BAD - Manual refund without proper tracking
export async function refund(returnId: string) {
  const ret = await prisma.return.findUnique({ where: { id: returnId } });
  await stripe.refunds.create({
    payment_intent: ret.order.paymentIntent,
    amount: calculateRefund(ret),
  });
  // No tracking, no status update, no notification
}

// GOOD - Full refund tracking and audit trail
export async function refund(returnId: string, adminId: string) {
  const ret = await prisma.return.findUnique({
    where: { id: returnId },
    include: { order: true, items: true },
  });

  const amount = calculateRefund(ret);

  const stripeRefund = await stripe.refunds.create({
    payment_intent: ret.order.paymentIntent,
    amount,
    metadata: { returnId, returnNumber: ret.returnNumber },
  });

  await prisma.return.update({
    where: { id: returnId },
    data: {
      status: 'REFUNDED',
      refundId: stripeRefund.id,
      refundAmount: amount,
      refundedAt: new Date(),
      processedBy: adminId,
    },
  });

  await sendEmail({
    to: ret.order.email,
    template: 'refund-processed',
    data: { amount, returnNumber: ret.returnNumber },
  });
}
```

### 3. Restocking Without Condition Inspection

```typescript
// BAD - Blind restocking without inspection
export async function restockReturn(returnId: string) {
  const ret = await prisma.return.findUnique({
    where: { id: returnId },
    include: { items: true },
  });

  for (const item of ret.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { inventory: { increment: item.quantity } },
    });
  }
}

// GOOD - Restock only after inspection with condition check
export async function restockReturn(returnId: string) {
  const ret = await prisma.return.findUnique({
    where: { id: returnId },
    include: { items: { include: { orderItem: true } } },
  });

  if (ret.status !== 'INSPECTING') {
    throw new Error('Return must be inspected before restocking');
  }

  for (const item of ret.items) {
    if (!item.condition) {
      throw new Error(`Item ${item.id} has not been inspected`);
    }

    // Only restock items in sellable condition
    if (item.condition === 'NEW' || item.condition === 'LIKE_NEW') {
      await prisma.$transaction([
        prisma.product.update({
          where: { id: item.orderItem.productId },
          data: { inventory: { increment: item.quantity } },
        }),
        prisma.returnItem.update({
          where: { id: item.id },
          data: { restocked: true, restockedAt: new Date() },
        }),
        prisma.inventoryLog.create({
          data: {
            productId: item.orderItem.productId,
            change: item.quantity,
            reason: 'RETURN_RESTOCK',
            reference: ret.returnNumber,
          },
        }),
      ]);
    }
  }
}
```

### 4. Missing Email Notifications

```typescript
// BAD - No customer communication
export async function updateReturnStatus(returnId: string, status: string) {
  await prisma.return.update({
    where: { id: returnId },
    data: { status },
  });
}

// GOOD - Keep customer informed at every step
export async function updateReturnStatus(returnId: string, status: ReturnStatus) {
  const ret = await prisma.return.update({
    where: { id: returnId },
    data: { status },
    include: { order: true },
  });

  const emailTemplates: Record<ReturnStatus, string | null> = {
    APPROVED: 'return-approved',
    LABEL_SENT: 'return-label-ready',
    RECEIVED: 'return-received',
    REFUNDED: 'refund-processed',
    REJECTED: 'return-rejected',
    // etc.
  };

  const template = emailTemplates[status];
  if (template) {
    await sendEmail({
      to: ret.order.email,
      template,
      data: { returnNumber: ret.returnNumber },
    });
  }
}
```

## Testing

### Unit Tests for Returns Service

```typescript
// __tests__/lib/returns/service.test.ts
import { createReturnRequest, approveReturn, processRefund } from '@/lib/returns/service';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/email';

jest.mock('@/lib/prisma');
jest.mock('@/lib/stripe');
jest.mock('@/lib/email');

describe('Returns Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReturnRequest', () => {
    it('creates return for valid order within window', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        items: [{ id: 'item-1', quantity: 2 }],
        user: { email: 'test@example.com' },
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.return.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.return.create as jest.Mock).mockResolvedValue({
        id: 'return-1',
        returnNumber: 'RET-001',
      });

      const result = await createReturnRequest({
        orderId: 'order-1',
        items: [{ orderItemId: 'item-1', quantity: 1 }],
        reason: 'DAMAGED',
        userId: 'user-1',
      });

      expect(result.success).toBe(true);
      expect(result.returnNumber).toBe('RET-001');
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          template: 'return-requested',
        })
      );
    });

    it('rejects return outside window', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        items: [{ id: 'item-1', quantity: 2 }],
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await createReturnRequest({
        orderId: 'order-1',
        items: [{ orderItemId: 'item-1', quantity: 1 }],
        reason: 'DAMAGED',
        userId: 'user-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('outside the');
    });

    it('rejects return for wrong user', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'other-user',
        createdAt: new Date(),
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await createReturnRequest({
        orderId: 'order-1',
        items: [],
        reason: 'DAMAGED',
        userId: 'user-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('processRefund', () => {
    it('processes Stripe refund for original payment method', async () => {
      const mockReturn = {
        id: 'return-1',
        returnNumber: 'RET-001',
        status: 'RECEIVED',
        order: {
          paymentIntent: 'pi_123',
          email: 'test@example.com',
        },
      };

      (prisma.return.findUnique as jest.Mock).mockResolvedValue(mockReturn);
      (stripe.refunds.create as jest.Mock).mockResolvedValue({ id: 're_123' });

      const result = await processRefund('return-1', 5000, 'ORIGINAL_PAYMENT', 'admin-1');

      expect(result.success).toBe(true);
      expect(stripe.refunds.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_intent: 'pi_123',
          amount: 5000,
        })
      );
    });

    it('creates store credit for store credit method', async () => {
      const mockReturn = {
        id: 'return-1',
        returnNumber: 'RET-001',
        status: 'RECEIVED',
        order: {
          userId: 'user-1',
          email: 'test@example.com',
        },
      };

      (prisma.return.findUnique as jest.Mock).mockResolvedValue(mockReturn);

      const result = await processRefund('return-1', 5000, 'STORE_CREDIT', 'admin-1');

      expect(result.success).toBe(true);
      expect(prisma.storeCredit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            amount: 5000,
          }),
        })
      );
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/returns.integration.test.ts
import { createServer } from 'http';
import next from 'next';
import request from 'supertest';
import { prisma } from '@/lib/prisma';

describe('Returns API Integration', () => {
  let server: any;

  beforeAll(async () => {
    const app = next({ dev: false });
    await app.prepare();
    server = createServer(app.getRequestHandler());
  });

  beforeEach(async () => {
    // Seed test data
    await prisma.user.create({
      data: {
        id: 'test-user',
        email: 'test@example.com',
        orders: {
          create: {
            id: 'test-order',
            orderNumber: 'ORD-001',
            status: 'DELIVERED',
            items: {
              create: {
                id: 'test-item',
                productId: 'test-product',
                quantity: 2,
                price: 5000,
              },
            },
          },
        },
      },
    });
  });

  afterEach(async () => {
    await prisma.return.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
  });

  it('POST /api/returns creates a return request', async () => {
    const response = await request(server)
      .post('/api/returns')
      .set('Authorization', 'Bearer test-token')
      .send({
        orderId: 'test-order',
        items: [{ orderItemId: 'test-item', quantity: 1 }],
        reason: 'DAMAGED',
      })
      .expect(201);

    expect(response.body.returnNumber).toBeDefined();

    const returnInDb = await prisma.return.findFirst({
      where: { orderId: 'test-order' },
    });
    expect(returnInDb).not.toBeNull();
    expect(returnInDb?.status).toBe('REQUESTED');
  });

  it('GET /api/returns lists user returns', async () => {
    await prisma.return.create({
      data: {
        orderId: 'test-order',
        reason: 'DAMAGED',
        items: { create: { orderItemId: 'test-item', quantity: 1 } },
      },
    });

    const response = await request(server)
      .get('/api/returns')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    expect(response.body.returns).toHaveLength(1);
  });
});
```

## Related Skills

- [Stripe Webhooks](../patterns/stripe-webhooks.md) - For processing refund events
- [Inventory Management](../patterns/inventory-management.md) - For restocking workflows
- [Transactional Email](../patterns/transactional-email.md) - For return notifications
- [Order Management](../patterns/order-management.md) - For order status integration
- [Server Actions](../patterns/server-actions.md) - For form submissions

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive Overview section (3 paragraphs)
- Added When NOT to Use section with 4 scenarios
- Added detailed Composition Diagram with lifecycle flow
- Expanded database schema with additional fields (labelExpiry, internalNotes, etc.)
- Added API routes with full validation
- Added 3 complete examples (form, admin dashboard, tracking page)
- Expanded anti-patterns from 3 to 4 with detailed code comparisons
- Added comprehensive testing section with unit and integration tests
- Enhanced returns service with better error handling and validation

### 1.0.0 (2025-01-18)
- Initial implementation
- Basic RMA generation
- Return shipping label support
- Refund processing
- Inventory restocking
