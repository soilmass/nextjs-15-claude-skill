---
id: pt-transactions
name: Database Transaction Patterns
version: 2.1.0
layer: L5
category: data
description: Transaction patterns for data consistency, error handling, and complex operations
tags: [database, transactions, prisma, acid, consistency]
composes:
  - ../atoms/feedback-toast.md
  - ../atoms/feedback-alert.md
dependencies:
  prisma: "^6.0.0"
formula: "Transaction = $transaction + retry + Toast(a-feedback-toast) + Alert(a-feedback-alert)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Database Transaction Patterns

## Overview

Database transactions ensure data consistency by grouping operations into atomic units. This pattern covers interactive transactions, batch operations, retry logic, and error handling.

## When to Use

- Financial operations (transfers, payments)
- Order creation with inventory updates
- Multi-step data mutations
- Operations requiring rollback on failure
- Distributed operations with compensation

## Composition Diagram

```
+------------------------------------------+
|            Transaction Flow              |
|  +------------------------------------+  |
|  |     prisma.$transaction(async)    |  |
|  +------------------------------------+  |
|           |                             |
|     +-----+-----+-----+                 |
|     |     |     |     |                 |
|     v     v     v     v                 |
|  [Op1] [Op2] [Op3] [Op4]               |
|     |     |     |     |                 |
|     +-----+-----+-----+                 |
|           |                             |
|     +-----+-----+                       |
|     |           |                       |
|  Success     Error                      |
|  [Commit]   [Rollback]                  |
+------------------------------------------+
```

## Implementation

### Interactive Transactions

```typescript
// lib/transactions.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Basic interactive transaction
export async function createOrderWithItems(
  userId: string,
  items: { productId: string; quantity: number }[]
) {
  return prisma.$transaction(async (tx) => {
    // 1. Calculate total and validate stock
    let total = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      total += product.price * item.quantity;
    }

    // 2. Create order
    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 3. Decrement stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 4. Create payment intent
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        status: "PENDING",
      },
    });

    return { order, payment };
  });
}
```

### Transaction with Timeout and Isolation

```typescript
// services/financial.service.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

interface TransferResult {
  success: boolean;
  fromBalance: number;
  toBalance: number;
  transactionId: string;
}

export async function transferFunds(
  fromAccountId: string,
  toAccountId: string,
  amount: number
): Promise<TransferResult> {
  return prisma.$transaction(
    async (tx) => {
      // Lock sender account (SELECT FOR UPDATE)
      const fromAccount = await tx.$queryRaw<{ id: string; balance: number }[]>`
        SELECT id, balance FROM accounts 
        WHERE id = ${fromAccountId} 
        FOR UPDATE
      `;

      if (!fromAccount[0]) {
        throw new Error("Source account not found");
      }

      if (fromAccount[0].balance < amount) {
        throw new Error("Insufficient funds");
      }

      // Lock receiver account
      const toAccount = await tx.$queryRaw<{ id: string; balance: number }[]>`
        SELECT id, balance FROM accounts 
        WHERE id = ${toAccountId} 
        FOR UPDATE
      `;

      if (!toAccount[0]) {
        throw new Error("Destination account not found");
      }

      // Perform transfer
      const [sender, receiver] = await Promise.all([
        tx.account.update({
          where: { id: fromAccountId },
          data: { balance: { decrement: amount } },
        }),
        tx.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount } },
        }),
      ]);

      // Record transaction
      const record = await tx.transaction.create({
        data: {
          fromAccountId,
          toAccountId,
          amount,
          type: "TRANSFER",
          status: "COMPLETED",
        },
      });

      return {
        success: true,
        fromBalance: sender.balance,
        toBalance: receiver.balance,
        transactionId: record.id,
      };
    },
    {
      maxWait: 5000, // Max time to acquire lock
      timeout: 10000, // Max transaction duration
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
```

### Batch Transactions

```typescript
// services/batch.service.ts
import { prisma } from "@/lib/db";

// Process items in batches with transactions
export async function bulkUpdatePrices(
  updates: { productId: string; newPrice: number }[],
  batchSize = 100
) {
  const results: { success: number; failed: string[] } = {
    success: 0,
    failed: [],
  };

  // Split into batches
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);

    try {
      await prisma.$transaction(
        batch.map((update) =>
          prisma.product.update({
            where: { id: update.productId },
            data: {
              price: update.newPrice,
              priceUpdatedAt: new Date(),
            },
          })
        )
      );

      results.success += batch.length;
    } catch (error) {
      // Log failed batch
      results.failed.push(...batch.map((u) => u.productId));
    }
  }

  return results;
}

// Upsert with conflict handling
export async function syncInventory(
  items: { sku: string; stock: number; price: number }[]
) {
  return prisma.$transaction(
    items.map((item) =>
      prisma.product.upsert({
        where: { sku: item.sku },
        create: {
          sku: item.sku,
          stock: item.stock,
          price: item.price,
        },
        update: {
          stock: item.stock,
          price: item.price,
          updatedAt: new Date(),
        },
      })
    )
  );
}
```

### Retry Logic for Transactions

```typescript
// lib/transaction-utils.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoffMultiplier?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, delay = 100, backoffMultiplier = 2 } = options;

  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2002", "P2034"].includes(error.code); // Unique constraint, transaction conflict

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;

      console.log(
        `Transaction retry attempt ${attempt}/${maxRetries} after error: ${error}`
      );
    }
  }

  throw lastError;
}

// Usage
export async function processPaymentWithRetry(orderId: string, amount: number) {
  return withRetry(
    async () => {
      return prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });

        if (!order) throw new Error("Order not found");
        if (order.status !== "PENDING") throw new Error("Order already processed");

        // Update order and create payment
        const [updatedOrder, payment] = await Promise.all([
          tx.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          }),
          tx.payment.create({
            data: {
              orderId,
              amount,
              status: "COMPLETED",
            },
          }),
        ]);

        return { order: updatedOrder, payment };
      });
    },
    { maxRetries: 3, delay: 100 }
  );
}
```

### Saga Pattern for Distributed Transactions

```typescript
// services/saga.service.ts
import { prisma } from "@/lib/db";

interface SagaStep<T> {
  name: string;
  execute: () => Promise<T>;
  compensate: (result: T) => Promise<void>;
}

class Saga {
  private steps: SagaStep<unknown>[] = [];
  private results: unknown[] = [];

  addStep<T>(step: SagaStep<T>): this {
    this.steps.push(step as SagaStep<unknown>);
    return this;
  }

  async execute(): Promise<void> {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      try {
        const result = await step!.execute();
        this.results.push(result);
      } catch (error) {
        // Compensate all completed steps in reverse order
        console.error(`Saga step "${step!.name}" failed:`, error);
        await this.compensate(i - 1);
        throw error;
      }
    }
  }

  private async compensate(fromIndex: number): Promise<void> {
    for (let i = fromIndex; i >= 0; i--) {
      const step = this.steps[i];
      const result = this.results[i];
      try {
        await step!.compensate(result);
        console.log(`Compensated step "${step!.name}"`);
      } catch (error) {
        console.error(`Failed to compensate step "${step!.name}":`, error);
        // Log for manual intervention
      }
    }
  }
}

// Usage: E-commerce order with external services
export async function processOrderSaga(
  userId: string,
  items: { productId: string; quantity: number }[]
) {
  const saga = new Saga();

  let orderId: string;
  let paymentIntentId: string;
  let inventoryReservations: string[];

  // Step 1: Create order
  saga.addStep({
    name: "createOrder",
    execute: async () => {
      const order = await prisma.order.create({
        data: { userId, status: "PENDING" },
      });
      orderId = order.id;
      return order;
    },
    compensate: async () => {
      await prisma.order.delete({ where: { id: orderId } });
    },
  });

  // Step 2: Reserve inventory
  saga.addStep({
    name: "reserveInventory",
    execute: async () => {
      // Call inventory service
      const reservations = await reserveInventory(items);
      inventoryReservations = reservations;
      return reservations;
    },
    compensate: async () => {
      await releaseInventory(inventoryReservations);
    },
  });

  // Step 3: Create payment intent
  saga.addStep({
    name: "createPayment",
    execute: async () => {
      // Call payment service
      const payment = await createPaymentIntent(orderId, calculateTotal(items));
      paymentIntentId = payment.id;
      return payment;
    },
    compensate: async () => {
      await cancelPaymentIntent(paymentIntentId);
    },
  });

  // Step 4: Finalize order
  saga.addStep({
    name: "finalizeOrder",
    execute: async () => {
      return prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      });
    },
    compensate: async () => {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    },
  });

  await saga.execute();
  return { orderId, paymentIntentId };
}
```

### Optimistic Locking

```typescript
// services/document.service.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function updateDocumentOptimistic(
  id: string,
  content: string,
  expectedVersion: number
) {
  try {
    const updated = await prisma.document.update({
      where: {
        id,
        version: expectedVersion, // Only update if version matches
      },
      data: {
        content,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    return { success: true, document: updated };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Record not found or version mismatch
        const current = await prisma.document.findUnique({
          where: { id },
        });

        return {
          success: false,
          error: "CONFLICT",
          currentVersion: current?.version,
          currentContent: current?.content,
        };
      }
    }
    throw error;
  }
}
```

## Variants

### Nested Transactions

```typescript
// Prisma supports savepoints for nested transactions
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: { ... } });
  
  // Nested operations share the same transaction
  await tx.$transaction(async (tx2) => {
    // Uses savepoint internally
    await tx2.post.create({ data: { ... } });
  });
});
```

### Read-Only Transactions

```typescript
// For consistent reads across multiple queries
const [users, stats] = await prisma.$transaction(
  [
    prisma.user.findMany({ where: { active: true } }),
    prisma.analytics.aggregate({ _count: true }),
  ],
  {
    isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
  }
);
```

## Anti-patterns

1. **Long-running transactions**: Holding locks too long
2. **No timeout**: Transactions running indefinitely
3. **Ignoring isolation levels**: Race conditions
4. **No retry logic**: Failing on transient errors
5. **Missing compensation**: No rollback for distributed operations

## Related Skills

- `L5/patterns/prisma-patterns` - Prisma ORM patterns
- `L5/patterns/error-handling` - Error handling
- `L5/patterns/soft-delete` - Soft delete patterns
- `L5/patterns/audit-logging` - Audit logging

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Prisma transactions
