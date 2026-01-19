---
id: pt-inventory-management
name: Inventory Management
version: 1.1.0
layer: L5
category: data
description: Real-time inventory tracking with stock levels, variant inventory, low-stock alerts, reservations, and backorder management
tags: [inventory, stock, warehouse, ecommerce, next15]
composes: []
formula: "InventoryManagement = StockTracking + Reservations + LowStockAlerts + BackorderHandling"
dependencies:
  prisma: "^6.0.0"
  ioredis: "^5.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Inventory Management

## Overview

Inventory management is critical for e-commerce applications to prevent overselling, maintain accurate stock levels, and provide real-time availability information to customers. This pattern implements a robust inventory system that handles variant-level tracking, concurrent checkout scenarios through stock reservations, and automated low-stock notifications.

The system uses a dual-storage approach: a primary PostgreSQL database for durable storage and audit trails, complemented by Redis caching for high-performance stock lookups. This architecture ensures that product pages load quickly while maintaining data consistency during high-traffic scenarios like flash sales.

Stock reservations are a key feature that holds inventory during the checkout process, preventing the common problem of customers completing checkout only to be told their items are out of stock. Reservations automatically expire after a configurable timeout, releasing stock back to the available pool if the purchase is not completed.

## When to Use

- Tracking product stock levels across single or multiple warehouses
- Managing variant-specific inventory (size, color combinations)
- Preventing overselling during concurrent checkout sessions
- Implementing stock reservations during the checkout flow
- Automating restock notifications to administrators
- Supporting pre-orders and backorder functionality

## When NOT to Use

- Digital-only products that have unlimited inventory
- Service-based businesses without physical inventory
- Simple applications where stock tracking is handled externally
- When using a third-party inventory management system like Shopify

## Composition Diagram

```
Inventory Management Architecture
=================================

+------------------------------------------------------------------+
|                     Product/Variant Layer                         |
|  +------------------------------------------------------------+  |
|  |  Product (inventory: Int)                                   |  |
|  |  ProductVariant (inventory: Int) - per size/color           |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                   Inventory Service Layer                         |
|  +-------------------+  +---------------------+  +--------------+ |
|  | getStockInfo()    |  | reserveStock()      |  | Backorder    | |
|  | - Available       |  | - Session-based     |  | Handler      | |
|  | - Reserved        |  | - TTL expiration    |  | - Pre-order  | |
|  | - Total           |  | - Atomic operations |  | - Wait list  | |
|  +-------------------+  +---------------------+  +--------------+ |
+------------------------------------------------------------------+
                              |
              +---------------+---------------+
              |                               |
              v                               v
+---------------------------+   +---------------------------+
|      Redis Cache          |   |    PostgreSQL Database    |
|  +---------------------+  |   |  +---------------------+  |
|  | stock:{id}:{variant}|  |   |  | InventoryMovement   |  |
|  | - 30s TTL           |  |   |  | StockReservation    |  |
|  | - Fast lookups      |  |   |  | LowStockAlert       |  |
|  +---------------------+  |   |  +---------------------+  |
+---------------------------+   +---------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    Notification Layer                             |
|  +------------------------------------------------------------+  |
|  |  Low Stock Alerts -> Email/Slack/Webhook                    |  |
|  |  - Threshold-based                                          |  |
|  |  - Debounced (once per day)                                 |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Implementation

### Database Schema Extension

```prisma
// Add to prisma/schema.prisma
model InventoryMovement {
  id          String        @id @default(cuid())
  product     Product       @relation(fields: [productId], references: [id])
  productId   String
  variantId   String?
  type        MovementType
  quantity    Int           // positive for additions, negative for removals
  reference   String?       // order ID, PO number, etc.
  notes       String?
  createdBy   String?
  createdAt   DateTime      @default(now())

  @@index([productId])
  @@index([type])
  @@index([createdAt])
}

model StockReservation {
  id          String   @id @default(cuid())
  productId   String
  variantId   String?
  quantity    Int
  sessionId   String   // cart session
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@unique([productId, variantId, sessionId])
  @@index([productId, variantId])
  @@index([sessionId])
  @@index([expiresAt])
}

model LowStockAlert {
  id          String   @id @default(cuid())
  productId   String   @unique
  threshold   Int      @default(10)
  lastAlerted DateTime?
  isActive    Boolean  @default(true)
}

enum MovementType {
  PURCHASE_ORDER    // stock received
  SALE              // sold to customer
  RETURN            // customer return
  ADJUSTMENT        // manual adjustment
  RESERVATION       // reserved for checkout
  RELEASE           // reservation released
  DAMAGE            // damaged/lost
  TRANSFER          // warehouse transfer
}
```

### Inventory Service

```typescript
// lib/inventory/service.ts
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

const RESERVATION_TTL = 15 * 60; // 15 minutes

export interface StockInfo {
  available: number;
  reserved: number;
  total: number;
  lowStock: boolean;
  backorderAllowed: boolean;
}

export async function getStockInfo(
  productId: string,
  variantId?: string
): Promise<StockInfo> {
  // Try cache first
  const cacheKey = `stock:${productId}:${variantId || 'main'}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Get current inventory
  const product = variantId
    ? await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { inventory: true, product: { select: { id: true } } },
      })
    : await prisma.product.findUnique({
        where: { id: productId },
        select: { inventory: true },
      });

  const totalInventory = product?.inventory || 0;

  // Get active reservations
  const reservations = await prisma.stockReservation.aggregate({
    where: {
      productId,
      variantId: variantId || null,
      expiresAt: { gt: new Date() },
    },
    _sum: { quantity: true },
  });

  const reserved = reservations._sum.quantity || 0;
  const available = Math.max(0, totalInventory - reserved);

  // Check low stock threshold
  const alert = await prisma.lowStockAlert.findUnique({
    where: { productId },
  });

  const stockInfo: StockInfo = {
    available,
    reserved,
    total: totalInventory,
    lowStock: available <= (alert?.threshold || 10),
    backorderAllowed: false, // Configure per product
  };

  // Cache for 30 seconds
  await redis.setex(cacheKey, 30, JSON.stringify(stockInfo));

  return stockInfo;
}

export async function reserveStock(
  productId: string,
  quantity: number,
  sessionId: string,
  variantId?: string
): Promise<{ success: boolean; error?: string }> {
  const stock = await getStockInfo(productId, variantId);

  if (stock.available < quantity && !stock.backorderAllowed) {
    return {
      success: false,
      error: `Only ${stock.available} items available`,
    };
  }

  // Create or update reservation
  await prisma.stockReservation.upsert({
    where: {
      productId_variantId_sessionId: {
        productId,
        variantId: variantId || '',
        sessionId,
      },
    },
    create: {
      productId,
      variantId,
      quantity,
      sessionId,
      expiresAt: new Date(Date.now() + RESERVATION_TTL * 1000),
    },
    update: {
      quantity,
      expiresAt: new Date(Date.now() + RESERVATION_TTL * 1000),
    },
  });

  // Invalidate cache
  await redis.del(`stock:${productId}:${variantId || 'main'}`);

  return { success: true };
}

export async function releaseReservation(sessionId: string): Promise<void> {
  const reservations = await prisma.stockReservation.findMany({
    where: { sessionId },
  });

  await prisma.stockReservation.deleteMany({
    where: { sessionId },
  });

  // Invalidate caches
  for (const res of reservations) {
    await redis.del(`stock:${res.productId}:${res.variantId || 'main'}`);
  }
}

export async function commitReservation(
  sessionId: string,
  orderId: string
): Promise<void> {
  const reservations = await prisma.stockReservation.findMany({
    where: { sessionId },
  });

  await prisma.$transaction(async (tx) => {
    for (const res of reservations) {
      // Decrement inventory
      if (res.variantId) {
        await tx.productVariant.update({
          where: { id: res.variantId },
          data: { inventory: { decrement: res.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: res.productId },
          data: { inventory: { decrement: res.quantity } },
        });
      }

      // Record movement
      await tx.inventoryMovement.create({
        data: {
          productId: res.productId,
          variantId: res.variantId,
          type: 'SALE',
          quantity: -res.quantity,
          reference: orderId,
        },
      });
    }

    // Delete reservations
    await tx.stockReservation.deleteMany({
      where: { sessionId },
    });
  });

  // Check for low stock alerts
  for (const res of reservations) {
    await checkLowStockAlert(res.productId);
  }
}

async function checkLowStockAlert(productId: string): Promise<void> {
  const stock = await getStockInfo(productId);
  const alert = await prisma.lowStockAlert.findUnique({
    where: { productId },
  });

  if (alert?.isActive && stock.available <= alert.threshold) {
    // Only alert once per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!alert.lastAlerted || alert.lastAlerted < oneDayAgo) {
      await sendLowStockNotification(productId, stock.available);

      await prisma.lowStockAlert.update({
        where: { productId },
        data: { lastAlerted: new Date() },
      });
    }
  }
}

async function sendLowStockNotification(
  productId: string,
  currentStock: number
): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, sku: true },
  });

  // Send to configured notification channels
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `Low stock alert: ${product?.name} (SKU: ${product?.sku}) has only ${currentStock} units remaining.`,
    }),
  });
}
```

### Bulk Inventory Operations

```typescript
// lib/inventory/bulk-operations.ts
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

interface BulkStockUpdate {
  productId: string;
  variantId?: string;
  quantity: number;
  type: 'set' | 'increment' | 'decrement';
}

export async function bulkUpdateStock(
  updates: BulkStockUpdate[],
  reference: string,
  createdBy?: string
): Promise<{ success: boolean; updated: number }> {
  let updated = 0;

  await prisma.$transaction(async (tx) => {
    for (const update of updates) {
      const currentInventory = update.variantId
        ? (await tx.productVariant.findUnique({
            where: { id: update.variantId },
            select: { inventory: true },
          }))?.inventory || 0
        : (await tx.product.findUnique({
            where: { id: update.productId },
            select: { inventory: true },
          }))?.inventory || 0;

      let newInventory: number;
      let movementQuantity: number;

      switch (update.type) {
        case 'set':
          newInventory = update.quantity;
          movementQuantity = update.quantity - currentInventory;
          break;
        case 'increment':
          newInventory = currentInventory + update.quantity;
          movementQuantity = update.quantity;
          break;
        case 'decrement':
          newInventory = Math.max(0, currentInventory - update.quantity);
          movementQuantity = -update.quantity;
          break;
      }

      // Update inventory
      if (update.variantId) {
        await tx.productVariant.update({
          where: { id: update.variantId },
          data: { inventory: newInventory },
        });
      } else {
        await tx.product.update({
          where: { id: update.productId },
          data: { inventory: newInventory },
        });
      }

      // Record movement
      await tx.inventoryMovement.create({
        data: {
          productId: update.productId,
          variantId: update.variantId,
          type: 'ADJUSTMENT',
          quantity: movementQuantity,
          reference,
          createdBy,
        },
      });

      // Invalidate cache
      await redis.del(`stock:${update.productId}:${update.variantId || 'main'}`);
      updated++;
    }
  });

  return { success: true, updated };
}

export async function processStockReceipt(
  items: Array<{ productId: string; variantId?: string; quantity: number }>,
  purchaseOrderId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { inventory: { increment: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { inventory: { increment: item.quantity } },
        });
      }

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          type: 'PURCHASE_ORDER',
          quantity: item.quantity,
          reference: purchaseOrderId,
        },
      });

      await redis.del(`stock:${item.productId}:${item.variantId || 'main'}`);
    }
  });
}
```

## Examples

### Example 1: Stock Badge Component

```tsx
// components/stock-badge.tsx
import { Badge } from '@/components/ui/badge';

interface StockBadgeProps {
  available: number;
  lowStock: boolean;
  backorderAllowed?: boolean;
}

export function StockBadge({ available, lowStock, backorderAllowed }: StockBadgeProps) {
  if (available === 0 && !backorderAllowed) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }

  if (available === 0 && backorderAllowed) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        Available for Backorder
      </Badge>
    );
  }

  if (lowStock) {
    return (
      <Badge variant="warning" className="bg-amber-100 text-amber-800">
        Only {available} left
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800">
      In Stock
    </Badge>
  );
}
```

### Example 2: Add to Cart with Stock Reservation

```tsx
// components/add-to-cart-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { reserveStock } from '@/app/actions/inventory';
import { Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  available: number;
  backorderAllowed: boolean;
}

export function AddToCartButton({
  productId,
  variantId,
  available,
  backorderAllowed,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { addItem, sessionId } = useCart();

  const handleAddToCart = async () => {
    setLoading(true);

    try {
      // Reserve stock first
      const result = await reserveStock(productId, 1, sessionId, variantId);

      if (!result.success) {
        toast.error(result.error || 'Failed to add to cart');
        return;
      }

      // Add to local cart
      addItem({ productId, variantId, quantity: 1 });
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = available === 0 && !backorderAllowed;

  return (
    <Button onClick={handleAddToCart} disabled={isDisabled || loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      {isDisabled ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  );
}
```

### Example 3: Inventory Admin Dashboard

```tsx
// app/admin/inventory/page.tsx
import { prisma } from '@/lib/prisma';
import { getStockInfo } from '@/lib/inventory/service';
import { InventoryTable } from '@/components/admin/inventory-table';
import { LowStockAlerts } from '@/components/admin/low-stock-alerts';

export default async function InventoryDashboard() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      _count: { select: { orders: true } },
    },
    orderBy: { inventory: 'asc' },
  });

  const inventoryData = await Promise.all(
    products.map(async (product) => ({
      ...product,
      stockInfo: await getStockInfo(product.id),
    }))
  );

  const lowStockItems = inventoryData.filter((item) => item.stockInfo.lowStock);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Inventory Management</h1>

      {lowStockItems.length > 0 && (
        <LowStockAlerts items={lowStockItems} />
      )}

      <InventoryTable products={inventoryData} />
    </div>
  );
}
```

### Example 4: Real-time Stock Updates with Server-Sent Events

```typescript
// app/api/inventory/stream/route.ts
import { prisma } from '@/lib/prisma';
import { getStockInfo } from '@/lib/inventory/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const variantId = searchParams.get('variantId');

  if (!productId) {
    return new Response('Missing productId', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        const stockInfo = await getStockInfo(productId, variantId || undefined);
        const data = `data: ${JSON.stringify(stockInfo)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Send initial data
      await sendUpdate();

      // Poll for updates every 5 seconds
      const interval = setInterval(sendUpdate, 5000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

## Anti-patterns

### Anti-pattern 1: No Stock Reservations

```typescript
// BAD - Check stock and decrement separately (race condition)
const stock = await getStockInfo(productId);
if (stock.available >= quantity) {
  // Another user might buy in between!
  await decrementStock(productId, quantity);
}

// GOOD - Use reservations
const result = await reserveStock(productId, quantity, sessionId);
if (result.success) {
  // Stock is reserved for this session
  await commitReservation(sessionId, orderId);
}
```

### Anti-pattern 2: Stale Cache Without Invalidation

```typescript
// BAD - Update inventory without invalidating cache
await prisma.product.update({
  where: { id: productId },
  data: { inventory: { decrement: quantity } },
});
// Cache still shows old value!

// GOOD - Always invalidate cache after inventory changes
await prisma.product.update({
  where: { id: productId },
  data: { inventory: { decrement: quantity } },
});
await redis.del(`stock:${productId}:main`);
```

### Anti-pattern 3: No Audit Trail

```typescript
// BAD - Direct inventory updates without tracking
await prisma.product.update({
  where: { id: productId },
  data: { inventory: 50 },
});

// GOOD - Record all inventory movements
await prisma.$transaction([
  prisma.product.update({
    where: { id: productId },
    data: { inventory: 50 },
  }),
  prisma.inventoryMovement.create({
    data: {
      productId,
      type: 'ADJUSTMENT',
      quantity: 50 - currentInventory,
      reference: 'Manual adjustment',
      createdBy: userId,
    },
  }),
]);
```

### Anti-pattern 4: Blocking Stock Checks

```typescript
// BAD - Always query database
export async function ProductPage({ productId }: { productId: string }) {
  const stock = await prisma.product.findUnique({ where: { id: productId } });
  // Slow on every page load
}

// GOOD - Use caching with appropriate TTL
export async function ProductPage({ productId }: { productId: string }) {
  const stock = await getStockInfo(productId); // Uses Redis cache
}
```

## Testing

### Unit Test: Stock Reservation

```typescript
// __tests__/lib/inventory/service.test.ts
import { reserveStock, getStockInfo, releaseReservation } from '@/lib/inventory/service';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

jest.mock('@/lib/prisma');
jest.mock('@/lib/redis');

describe('Inventory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (redis.get as jest.Mock).mockResolvedValue(null);
    (redis.setex as jest.Mock).mockResolvedValue('OK');
    (redis.del as jest.Mock).mockResolvedValue(1);
  });

  describe('reserveStock', () => {
    it('should reserve stock when available', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        inventory: 10,
      });
      (prisma.stockReservation.aggregate as jest.Mock).mockResolvedValue({
        _sum: { quantity: 0 },
      });
      (prisma.stockReservation.upsert as jest.Mock).mockResolvedValue({});

      const result = await reserveStock('prod-1', 2, 'session-1');

      expect(result.success).toBe(true);
      expect(prisma.stockReservation.upsert).toHaveBeenCalled();
    });

    it('should fail when insufficient stock', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        inventory: 5,
      });
      (prisma.stockReservation.aggregate as jest.Mock).mockResolvedValue({
        _sum: { quantity: 4 },
      });

      const result = await reserveStock('prod-1', 5, 'session-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Only 1 items available');
    });
  });

  describe('releaseReservation', () => {
    it('should release all reservations for a session', async () => {
      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue([
        { productId: 'prod-1', variantId: null },
        { productId: 'prod-2', variantId: 'var-1' },
      ]);
      (prisma.stockReservation.deleteMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      await releaseReservation('session-1');

      expect(redis.del).toHaveBeenCalledTimes(2);
    });
  });
});
```

### Integration Test: Full Checkout Flow

```typescript
// __tests__/integration/inventory-checkout.test.ts
import { reserveStock, commitReservation, getStockInfo } from '@/lib/inventory/service';
import { prisma } from '@/lib/prisma';

describe('Inventory Checkout Integration', () => {
  const productId = 'test-product';
  const sessionId = 'test-session';

  beforeEach(async () => {
    await prisma.product.create({
      data: { id: productId, name: 'Test Product', inventory: 10, price: 1000 },
    });
  });

  afterEach(async () => {
    await prisma.inventoryMovement.deleteMany({ where: { productId } });
    await prisma.stockReservation.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
  });

  it('should complete full checkout flow', async () => {
    // Reserve stock
    const reserveResult = await reserveStock(productId, 3, sessionId);
    expect(reserveResult.success).toBe(true);

    // Check available stock decreased
    const stockAfterReserve = await getStockInfo(productId);
    expect(stockAfterReserve.available).toBe(7);
    expect(stockAfterReserve.reserved).toBe(3);

    // Commit reservation
    await commitReservation(sessionId, 'order-123');

    // Check inventory was decremented
    const stockAfterCommit = await getStockInfo(productId);
    expect(stockAfterCommit.total).toBe(7);
    expect(stockAfterCommit.reserved).toBe(0);

    // Check movement was recorded
    const movements = await prisma.inventoryMovement.findMany({
      where: { productId },
    });
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe('SALE');
  });
});
```

## Related Skills

- [Prisma Patterns](../patterns/prisma-patterns.md) - Database operations
- [Background Jobs](../patterns/background-jobs.md) - Async processing
- [Redis Caching](../patterns/redis-caching.md) - Cache strategies
- [Webhooks](../patterns/webhooks.md) - External notifications

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive overview section
- Added When NOT to Use section
- Enhanced composition diagram with full architecture
- Added bulk inventory operations
- Added real-time stock updates via SSE
- Added 4 real-world usage examples
- Added 4 anti-patterns with code examples
- Added unit and integration test examples
- Added low-stock notification implementation
- Improved documentation structure

### 1.0.0 (2025-01-15)
- Initial implementation
- Stock tracking and reservations
- Low-stock alerts
- Basic inventory service
