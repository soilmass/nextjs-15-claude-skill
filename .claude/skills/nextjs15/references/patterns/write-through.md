---
id: pt-write-through
name: Write Through
version: 2.0.0
layer: L5
category: cache
description: Synchronous write-through caching for Next.js 15 applications
tags: [cache, write, through]
composes: []
dependencies: []
formula: "DB Write + Cache Write + Tag Invalidation + Transaction Wrapper = Consistent cache state"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Write-Through Cache Pattern

## When to Use

- **Strong consistency needs**: Cache must reflect DB state immediately
- **Write-heavy with reads**: Frequent writes followed by immediate reads
- **E-commerce inventory**: Stock levels must be accurate
- **User profiles**: Profile updates visible immediately
- **Configuration changes**: Settings effective immediately
- **Content management**: Published content visible right away

**Avoid when:**
- Write latency is critical (adds cache write overhead)
- High write volume with rare reads (use cache-aside)
- Eventually consistent data is acceptable
- Batch operations (use bulk write-through)

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   Server Action  |     |   Write-Through  |     |   Data Stores    |
|   updateProduct()|     |   Handler        |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  writeThrough()        |                        |
         +----------------------->|                        |
         |                        |                        |
         |                        |  1. Write to DB        |
         |                        +----------------------->|
         |                        |     (Prisma)           |
         |                        |<-----------------------+
         |                        |                        |
         |                        |  2. Write to Cache     |
         |                        +----------------------->|
         |                        |     (Redis)            |
         |                        |<-----------------------+
         |                        |                        |
         |                        |  3. Invalidate Tags    |
         |                        +----------------------->|
         |                        |     revalidateTag()    |
         |                        |<-----------------------+
         |                        |                        |
         |  Return updated data   |                        |
         |<-----------------------+                        |
         |                        |                        |
  Subsequent Read:                |                        |
         +----------------------->|  Cache HIT             |
         |                        |  (fresh data)          |
         |<-----------------------+                        |
```

## Overview

Synchronous write-through caching for Next.js 15 applications. Data is written to both cache and database simultaneously, ensuring cache consistency at the cost of write latency.

## Implementation

### Basic Write-Through

```typescript
// lib/cache/write-through.ts
import { cacheSet, cacheDelete } from './redis-cache';
import { prisma } from '@/lib/prisma';

type WriteThroughOptions = {
  ttl?: number;
  tags?: string[];
};

export async function writeThrough<T>(
  key: string,
  data: T,
  writeFn: () => Promise<T>,
  options: WriteThroughOptions = {}
): Promise<T> {
  const { ttl = 3600, tags = [] } = options;

  // Write to database first (source of truth)
  const result = await writeFn();

  // Then update cache
  await cacheSet(key, result, { ttl, tags });

  return result;
}

export async function writeThroughDelete(
  key: string,
  deleteFn: () => Promise<void>
): Promise<void> {
  // Delete from database first
  await deleteFn();

  // Then delete from cache
  await cacheDelete(key);
}
```

### Product Repository with Write-Through

```typescript
// lib/repositories/product-repository.ts
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet, cacheDelete, cacheInvalidateTag } from '@/lib/cache';
import { revalidateTag } from 'next/cache';

type CreateProductInput = {
  name: string;
  price: number;
  categoryId: string;
  description?: string;
};

type UpdateProductInput = Partial<CreateProductInput>;

export class ProductRepository {
  private getCacheKey(id: string): string {
    return `product:${id}`;
  }

  async findById(id: string): Promise<Product | null> {
    const cacheKey = this.getCacheKey(id);

    // Try cache first
    const cached = await cacheGet<Product>(cacheKey);
    if (cached) return cached;

    // Fallback to database
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });

    if (product) {
      await cacheSet(cacheKey, product, {
        ttl: 3600,
        tags: ['products', `product:${id}`],
      });
    }

    return product;
  }

  async create(data: CreateProductInput): Promise<Product> {
    // Write to database
    const product = await prisma.product.create({
      data,
      include: { category: true },
    });

    // Write to cache
    await cacheSet(this.getCacheKey(product.id), product, {
      ttl: 3600,
      tags: ['products', `product:${product.id}`, `category:${data.categoryId}`],
    });

    // Invalidate list caches
    await cacheInvalidateTag('products:list');
    await cacheInvalidateTag(`category:${data.categoryId}:products`);
    revalidateTag('products');

    return product;
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    // Get current product for cache invalidation
    const current = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    // Write to database
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    // Write to cache (update)
    await cacheSet(this.getCacheKey(id), product, {
      ttl: 3600,
      tags: ['products', `product:${id}`],
    });

    // Handle category change
    if (data.categoryId && current?.categoryId !== data.categoryId) {
      await cacheInvalidateTag(`category:${current?.categoryId}:products`);
      await cacheInvalidateTag(`category:${data.categoryId}:products`);
    }

    revalidateTag(`product-${id}`);

    return product;
  }

  async delete(id: string): Promise<void> {
    // Get product for cache invalidation
    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    // Delete from database
    await prisma.product.delete({ where: { id } });

    // Delete from cache
    await cacheDelete(this.getCacheKey(id));
    await cacheInvalidateTag(`product:${id}`);
    await cacheInvalidateTag('products:list');
    
    if (product?.categoryId) {
      await cacheInvalidateTag(`category:${product.categoryId}:products`);
    }

    revalidateTag('products');
  }
}

export const productRepository = new ProductRepository();
```

### Server Actions with Write-Through

```typescript
// app/actions/products.ts
'use server';

import { revalidateTag } from 'next/cache';
import { productRepository } from '@/lib/repositories/product-repository';
import { productSchema } from '@/lib/validations';

export async function createProduct(formData: FormData) {
  const validated = productSchema.parse({
    name: formData.get('name'),
    price: parseFloat(formData.get('price') as string),
    categoryId: formData.get('categoryId'),
    description: formData.get('description'),
  });

  const product = await productRepository.create(validated);

  return { success: true, product };
}

export async function updateProduct(id: string, formData: FormData) {
  const validated = productSchema.partial().parse({
    name: formData.get('name') || undefined,
    price: formData.get('price') 
      ? parseFloat(formData.get('price') as string) 
      : undefined,
    categoryId: formData.get('categoryId') || undefined,
  });

  const product = await productRepository.update(id, validated);

  return { success: true, product };
}

export async function deleteProduct(id: string) {
  await productRepository.delete(id);

  return { success: true };
}
```

### Write-Through with Transaction

```typescript
// lib/cache/transactional-write-through.ts
import { prisma } from '@/lib/prisma';
import { cacheSet, cacheDelete, cacheInvalidateTag } from './redis-cache';

type CacheOperation = 
  | { type: 'set'; key: string; value: unknown; ttl: number; tags: string[] }
  | { type: 'delete'; key: string }
  | { type: 'invalidateTag'; tag: string };

export async function writeThroughTransaction<T>(
  dbOperation: () => Promise<T>,
  cacheOperations: CacheOperation[]
): Promise<T> {
  // Execute database operation in transaction
  const result = await prisma.$transaction(async (tx) => {
    return dbOperation();
  });

  // Execute cache operations after successful DB transaction
  // If cache fails, data is still in DB (eventual consistency)
  try {
    await Promise.all(
      cacheOperations.map(async (op) => {
        switch (op.type) {
          case 'set':
            await cacheSet(op.key, op.value, { ttl: op.ttl, tags: op.tags });
            break;
          case 'delete':
            await cacheDelete(op.key);
            break;
          case 'invalidateTag':
            await cacheInvalidateTag(op.tag);
            break;
        }
      })
    );
  } catch (error) {
    // Log but don't fail - DB is source of truth
    console.error('Cache operation failed:', error);
  }

  return result;
}

// Usage
export async function createOrder(data: CreateOrderInput) {
  return writeThroughTransaction(
    async () => {
      // Complex transaction with multiple tables
      const order = await prisma.order.create({
        data: {
          userId: data.userId,
          total: data.total,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // Update inventory
      for (const item of data.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    },
    [
      // Cache the new order
      {
        type: 'set',
        key: `order:${data.userId}:latest`,
        value: 'pending',
        ttl: 3600,
        tags: ['orders', `user:${data.userId}`],
      },
      // Invalidate user's order list
      { type: 'invalidateTag', tag: `user:${data.userId}:orders` },
      // Invalidate product caches
      ...data.items.map((item) => ({
        type: 'invalidateTag' as const,
        tag: `product:${item.productId}`,
      })),
    ]
  );
}
```

### Write-Through with Async Cache Update

```typescript
// lib/cache/async-write-through.ts
import { cacheSet, cacheDelete } from './redis-cache';

// For cases where cache latency is acceptable
export async function writeThroughAsync<T>(
  key: string,
  writeFn: () => Promise<T>,
  options: { ttl?: number; tags?: string[] } = {}
): Promise<T> {
  const { ttl = 3600, tags = [] } = options;

  // Write to database (blocking)
  const result = await writeFn();

  // Update cache asynchronously (non-blocking)
  cacheSet(key, result, { ttl, tags }).catch((error) => {
    console.error(`Async cache update failed for ${key}:`, error);
  });

  return result;
}

// Batch async updates
const pendingCacheUpdates: Map<string, Promise<void>> = new Map();

export async function writeThroughBatchAsync<T>(
  key: string,
  writeFn: () => Promise<T>,
  options: { ttl?: number } = {}
): Promise<T> {
  const result = await writeFn();

  // Queue cache update
  const updatePromise = cacheSet(key, result, options).catch(console.error);
  pendingCacheUpdates.set(key, updatePromise);

  // Clean up completed updates periodically
  updatePromise.finally(() => {
    pendingCacheUpdates.delete(key);
  });

  return result;
}

// Flush pending updates (e.g., on shutdown)
export async function flushPendingCacheUpdates(): Promise<void> {
  await Promise.all(pendingCacheUpdates.values());
}
```

### Write-Through with Optimistic Updates

```typescript
// lib/cache/optimistic-write-through.ts
import { cacheGet, cacheSet, cacheDelete } from './redis-cache';

export async function optimisticWriteThrough<T>(
  key: string,
  optimisticValue: T,
  writeFn: () => Promise<T>,
  options: { ttl?: number; tags?: string[] } = {}
): Promise<T> {
  const { ttl = 3600, tags = [] } = options;

  // Store original value for rollback
  const originalValue = await cacheGet<T>(key);

  // Optimistically update cache
  await cacheSet(key, optimisticValue, { ttl, tags });

  try {
    // Write to database
    const result = await writeFn();

    // Update cache with actual result (may differ from optimistic)
    await cacheSet(key, result, { ttl, tags });

    return result;
  } catch (error) {
    // Rollback cache on failure
    if (originalValue !== null) {
      await cacheSet(key, originalValue, { ttl, tags });
    } else {
      await cacheDelete(key);
    }

    throw error;
  }
}

// Usage in UI-driven updates
export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<Product> {
  const cacheKey = `product:${productId}`;
  
  // Get current product for optimistic update
  const current = await cacheGet<Product>(cacheKey);
  const optimistic = current ? { ...current, stock: newStock } : null;

  if (!optimistic) {
    // No cached value, do normal write-through
    const product = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });
    await cacheSet(cacheKey, product, { ttl: 3600 });
    return product;
  }

  return optimisticWriteThrough(
    cacheKey,
    optimistic,
    async () => {
      return prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });
    },
    { ttl: 3600, tags: ['products', `product:${productId}`] }
  );
}
```

### Multi-Key Write-Through

```typescript
// lib/cache/multi-write-through.ts
import { getRedis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

type CacheEntry = {
  key: string;
  value: unknown;
  ttl: number;
  tags: string[];
};

export async function multiWriteThrough<T>(
  dbOperation: () => Promise<T>,
  getCacheEntries: (result: T) => CacheEntry[]
): Promise<T> {
  // Write to database
  const result = await dbOperation();

  // Get cache entries to update
  const entries = getCacheEntries(result);

  // Batch write to cache
  const redis = getRedis();
  const pipeline = redis.pipeline();

  for (const entry of entries) {
    pipeline.set(entry.key, JSON.stringify(entry.value), { ex: entry.ttl });
    
    // Track tags
    for (const tag of entry.tags) {
      pipeline.sadd(`tag:${tag}`, entry.key);
      pipeline.expire(`tag:${tag}`, entry.ttl + 60);
    }
  }

  await pipeline.exec();

  return result;
}

// Usage: Bulk product update
export async function bulkUpdatePrices(
  updates: Array<{ id: string; price: number }>
): Promise<Product[]> {
  return multiWriteThrough(
    async () => {
      // Batch update in database
      const results = await Promise.all(
        updates.map((update) =>
          prisma.product.update({
            where: { id: update.id },
            data: { price: update.price },
            include: { category: true },
          })
        )
      );
      return results;
    },
    (products) =>
      products.map((product) => ({
        key: `product:${product.id}`,
        value: product,
        ttl: 3600,
        tags: ['products', `product:${product.id}`],
      }))
  );
}
```

## Variants

### With Write-Behind Queue

```typescript
// lib/cache/write-behind.ts
// Hybrid: Immediate cache write, async DB write for non-critical data

import { Queue } from 'bullmq';

const writeQueue = new Queue('db-writes');

export async function writeBehind<T>(
  key: string,
  value: T,
  writeJob: { type: string; data: unknown },
  options: { ttl?: number } = {}
): Promise<void> {
  // Write to cache immediately
  await cacheSet(key, value, options);

  // Queue database write
  await writeQueue.add(writeJob.type, writeJob.data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}
```

### With Version Control

```typescript
// lib/cache/versioned-write-through.ts
type VersionedData<T> = {
  data: T;
  version: number;
  updatedAt: number;
};

export async function versionedWriteThrough<T>(
  key: string,
  expectedVersion: number,
  updateFn: (current: T) => Promise<T>,
  options: { ttl?: number } = {}
): Promise<{ data: T; version: number }> {
  const cached = await cacheGet<VersionedData<T>>(key);

  if (cached && cached.version !== expectedVersion) {
    throw new Error('Version conflict - data has been modified');
  }

  const newData = await updateFn(cached?.data as T);
  const newVersion = (cached?.version ?? 0) + 1;

  const versioned: VersionedData<T> = {
    data: newData,
    version: newVersion,
    updatedAt: Date.now(),
  };

  await cacheSet(key, versioned, options);

  return { data: newData, version: newVersion };
}
```

## Anti-patterns

```typescript
// BAD: Cache before database (data loss risk)
await cacheSet(key, data);
await prisma.product.create({ data }); // If this fails, cache is inconsistent!

// GOOD: Database first, then cache
const result = await prisma.product.create({ data });
await cacheSet(key, result);

// BAD: Not handling cache failures
await prisma.product.update({ data });
await cacheSet(key, data); // If this throws, request fails even though DB succeeded

// GOOD: Handle cache failures gracefully
await prisma.product.update({ data });
try {
  await cacheSet(key, data);
} catch (error) {
  console.error('Cache update failed:', error);
  // Continue - DB is source of truth
}

// BAD: Missing related cache invalidation
await prisma.product.update({ data: { categoryId: newCategoryId } });
await cacheSet(`product:${id}`, product);
// Old category's product list is now stale!

// GOOD: Invalidate all related caches
await cacheInvalidateTag(`category:${oldCategoryId}:products`);
await cacheInvalidateTag(`category:${newCategoryId}:products`);
```

## Related Patterns

- `cache-aside.md` - Lazy loading cache pattern
- `cache-invalidation.md` - Cache invalidation strategies
- `transactions.md` - Database transactions
- `optimistic-updates.md` - Optimistic UI updates

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial write-through cache pattern
