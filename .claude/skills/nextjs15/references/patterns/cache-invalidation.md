---
id: pt-cache-invalidation
name: Cache Invalidation
version: 2.0.0
layer: L5
category: cache
description: Comprehensive cache invalidation strategies for Next.js 15 applications
tags: [cache, invalidation, revalidation, tags, patterns]
composes: []
dependencies: []
formula: "CacheTags + revalidateTag() + Event Handlers + Pattern Matching = Precise cache control"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Cache Invalidation Pattern

## When to Use

- **Data mutations**: Invalidate after CRUD operations
- **Cascading updates**: Category changes affecting products
- **Webhook responses**: External system notifications
- **Scheduled jobs**: Batch invalidation for stale data cleanup
- **Admin actions**: Bulk operations affecting multiple entities
- **Content publishing**: CMS publish/unpublish events

**Avoid when:**
- Over-invalidating (use targeted tags instead of broad patterns)
- High-frequency writes (consider write-through or debouncing)
- During peak traffic (queue invalidation for off-peak)

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|  Server Action   |     | Cache Tag System |     |   Data Caches    |
|  updateProduct() |     |                  |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  revalidateTag()       |                        |
         +----------------------->|                        |
         |                        |  Find tagged entries   |
         |                        +----------------------->|
         |                        |                        |
         |                        |  Invalidate matching   |
         |                        +----------------------->|
         |                        |                        |
+------------------+              |                        |
|  Redis Cache     |<-------------+  Pattern delete        |
+------------------+              |  product:*, category:* |
                                  |                        |
+------------------+              |                        |
|  Next.js Cache   |<-------------+  revalidatePath()      |
+------------------+              |  /products, /[id]      |
```

## Overview

Comprehensive cache invalidation strategies for Next.js 15 applications, including tag-based invalidation, time-based expiry, event-driven invalidation, and pattern-based clearing.

## Implementation

### Tag-Based Invalidation with Next.js

```typescript
// lib/cache/tags.ts
import { revalidateTag, revalidatePath } from 'next/cache';

// Centralized tag definitions
export const CacheTags = {
  // Entity tags
  products: 'products',
  product: (id: string) => `product-${id}`,
  categories: 'categories',
  category: (id: string) => `category-${id}`,
  users: 'users',
  user: (id: string) => `user-${id}`,
  
  // Composite tags
  productsByCategory: (categoryId: string) => `products-category-${categoryId}`,
  featuredProducts: 'products-featured',
  
  // Global tags
  siteConfig: 'site-config',
  navigation: 'navigation',
} as const;

// Invalidation functions
export async function invalidateProduct(productId: string): Promise<void> {
  revalidateTag(CacheTags.product(productId));
  revalidateTag(CacheTags.products);
}

export async function invalidateCategory(categoryId: string): Promise<void> {
  revalidateTag(CacheTags.category(categoryId));
  revalidateTag(CacheTags.categories);
  revalidateTag(CacheTags.productsByCategory(categoryId));
}

export async function invalidateAllProducts(): Promise<void> {
  revalidateTag(CacheTags.products);
  revalidateTag(CacheTags.featuredProducts);
}
```

### Using Tags in Data Fetching

```typescript
// lib/data/products.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { CacheTags } from '@/lib/cache/tags';

export const getProduct = unstable_cache(
  async (id: string) => {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });
  },
  ['product'],
  {
    tags: ['products'], // Will be combined with dynamic tag
    revalidate: 3600,
  }
);

// Dynamic tag generation
export async function getProductWithTags(id: string) {
  'use cache';
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  // This is experimental in Next.js 15
  // cacheTag(CacheTags.product(id));
  // cacheTag(CacheTags.products);

  return product;
}

export const getProductsByCategory = unstable_cache(
  async (categoryId: string) => {
    return prisma.product.findMany({
      where: { categoryId, published: true },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['products-by-category'],
  {
    tags: ['products'],
    revalidate: 1800,
  }
);
```

### Event-Driven Invalidation

```typescript
// lib/events/invalidation.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import { cacheInvalidateTag } from '@/lib/cache/redis-cache';
import { CacheTags } from '@/lib/cache/tags';

type InvalidationEvent = {
  type: 'product' | 'category' | 'user' | 'order';
  action: 'create' | 'update' | 'delete';
  id: string;
  metadata?: Record<string, string>;
};

export async function handleInvalidationEvent(
  event: InvalidationEvent
): Promise<void> {
  const { type, action, id, metadata } = event;

  switch (type) {
    case 'product':
      await invalidateProductCache(id, action, metadata);
      break;
    case 'category':
      await invalidateCategoryCache(id, action);
      break;
    case 'user':
      await invalidateUserCache(id, action);
      break;
    case 'order':
      await invalidateOrderCache(id, action, metadata);
      break;
  }
}

async function invalidateProductCache(
  productId: string,
  action: string,
  metadata?: Record<string, string>
): Promise<void> {
  // Invalidate Next.js cache
  revalidateTag(CacheTags.product(productId));
  revalidateTag(CacheTags.products);

  // Invalidate Redis cache
  await cacheInvalidateTag(`product:${productId}`);
  await cacheInvalidateTag('products');

  // Invalidate category cache if category changed
  if (metadata?.categoryId) {
    revalidateTag(CacheTags.productsByCategory(metadata.categoryId));
    await cacheInvalidateTag(`category:${metadata.categoryId}`);
  }

  // Invalidate paths
  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);

  if (action === 'delete') {
    // Additional cleanup for deleted products
    revalidatePath('/products/featured');
    revalidateTag(CacheTags.featuredProducts);
  }
}

async function invalidateCategoryCache(
  categoryId: string,
  action: string
): Promise<void> {
  revalidateTag(CacheTags.category(categoryId));
  revalidateTag(CacheTags.categories);
  revalidateTag(CacheTags.productsByCategory(categoryId));
  
  await cacheInvalidateTag(`category:${categoryId}`);
  await cacheInvalidateTag('categories');

  revalidatePath('/categories');
  revalidatePath(`/categories/${categoryId}`);
}
```

### Server Action with Invalidation

```typescript
// app/actions/products.ts
'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { cacheInvalidateTag } from '@/lib/cache/redis-cache';
import { CacheTags } from '@/lib/cache/tags';

export async function updateProduct(
  productId: string,
  data: { name?: string; price?: number; categoryId?: string }
) {
  // Get current product to check for category change
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  });

  // Update product
  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });

  // Invalidate caches
  revalidateTag(CacheTags.product(productId));
  revalidateTag(CacheTags.products);
  await cacheInvalidateTag(`product:${productId}`);

  // Handle category change
  if (data.categoryId && currentProduct?.categoryId !== data.categoryId) {
    // Invalidate old category
    if (currentProduct?.categoryId) {
      revalidateTag(CacheTags.productsByCategory(currentProduct.categoryId));
      await cacheInvalidateTag(`category:${currentProduct.categoryId}`);
    }
    // Invalidate new category
    revalidateTag(CacheTags.productsByCategory(data.categoryId));
    await cacheInvalidateTag(`category:${data.categoryId}`);
  }

  return product;
}

export async function deleteProduct(productId: string) {
  const product = await prisma.product.delete({
    where: { id: productId },
  });

  // Comprehensive invalidation
  revalidateTag(CacheTags.product(productId));
  revalidateTag(CacheTags.products);
  revalidateTag(CacheTags.featuredProducts);
  revalidateTag(CacheTags.productsByCategory(product.categoryId));

  await cacheInvalidateTag(`product:${productId}`);
  await cacheInvalidateTag('products');
  await cacheInvalidateTag(`category:${product.categoryId}`);

  // Revalidate paths
  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/categories/${product.categoryId}`);

  return { success: true };
}
```

### Pattern-Based Redis Invalidation

```typescript
// lib/cache/pattern-invalidation.ts
import { getRedis } from '@/lib/redis';

export async function invalidatePattern(pattern: string): Promise<number> {
  const redis = getRedis();
  let cursor = 0;
  let deletedCount = 0;

  do {
    // Use SCAN for production-safe key enumeration
    const [newCursor, keys] = await redis.scan(cursor, {
      match: pattern,
      count: 100,
    });
    
    cursor = parseInt(newCursor);

    if (keys.length > 0) {
      const pipeline = redis.pipeline();
      for (const key of keys) {
        pipeline.del(key);
      }
      await pipeline.exec();
      deletedCount += keys.length;
    }
  } while (cursor !== 0);

  return deletedCount;
}

// Usage examples
export async function invalidateAllProductCaches(): Promise<void> {
  await invalidatePattern('product:*');
}

export async function invalidateUserSessionCaches(userId: string): Promise<void> {
  await invalidatePattern(`session:${userId}:*`);
}

export async function invalidateCachesByPrefix(prefix: string): Promise<void> {
  await invalidatePattern(`${prefix}:*`);
}
```

### Webhook-Based Invalidation

```typescript
// app/api/webhooks/cms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { verifyWebhookSignature } from '@/lib/webhooks';

type CMSWebhookPayload = {
  event: 'entry.create' | 'entry.update' | 'entry.delete' | 'entry.publish';
  model: string;
  entry: {
    id: string;
    slug?: string;
    [key: string]: unknown;
  };
};

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-webhook-signature');
  const body = await request.text();

  // Verify webhook authenticity
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload: CMSWebhookPayload = JSON.parse(body);
  const { event, model, entry } = payload;

  // Handle different content types
  switch (model) {
    case 'product':
      revalidateTag('products');
      revalidateTag(`product-${entry.id}`);
      if (entry.slug) {
        revalidatePath(`/products/${entry.slug}`);
      }
      break;

    case 'category':
      revalidateTag('categories');
      revalidateTag(`category-${entry.id}`);
      revalidateTag(`products-category-${entry.id}`);
      break;

    case 'page':
      revalidateTag('pages');
      if (entry.slug) {
        revalidatePath(`/${entry.slug}`);
      }
      break;

    case 'navigation':
    case 'settings':
      revalidateTag('site-config');
      revalidatePath('/', 'layout');
      break;
  }

  return NextResponse.json({
    success: true,
    revalidated: [model, entry.id],
  });
}
```

### Cascading Invalidation

```typescript
// lib/cache/cascade-invalidation.ts
import { revalidateTag } from 'next/cache';
import { cacheInvalidateTag } from './redis-cache';
import { prisma } from '@/lib/prisma';

type InvalidationNode = {
  tag: string;
  redisTags: string[];
  paths: string[];
  children?: () => Promise<InvalidationNode[]>;
};

async function cascadeInvalidate(node: InvalidationNode): Promise<void> {
  // Invalidate current node
  revalidateTag(node.tag);
  
  for (const redisTag of node.redisTags) {
    await cacheInvalidateTag(redisTag);
  }

  // Invalidate children recursively
  if (node.children) {
    const childNodes = await node.children();
    await Promise.all(childNodes.map(cascadeInvalidate));
  }
}

// Example: Invalidating a category cascades to all its products
export async function invalidateCategoryWithCascade(categoryId: string): Promise<void> {
  const node: InvalidationNode = {
    tag: `category-${categoryId}`,
    redisTags: [`category:${categoryId}`, 'categories'],
    paths: [`/categories/${categoryId}`],
    children: async () => {
      const products = await prisma.product.findMany({
        where: { categoryId },
        select: { id: true, slug: true },
      });

      return products.map((product) => ({
        tag: `product-${product.id}`,
        redisTags: [`product:${product.id}`],
        paths: [`/products/${product.slug}`],
      }));
    },
  };

  await cascadeInvalidate(node);
}
```

### Time-Based Invalidation Strategy

```typescript
// lib/cache/ttl-strategy.ts
export const CacheTTL = {
  // Static content - long TTL
  siteConfig: 86400,      // 24 hours
  navigation: 86400,      // 24 hours
  staticPages: 3600,      // 1 hour

  // Semi-dynamic content - medium TTL
  products: 1800,         // 30 minutes
  categories: 3600,       // 1 hour
  blogPosts: 900,         // 15 minutes

  // Dynamic content - short TTL
  userProfile: 300,       // 5 minutes
  cart: 60,               // 1 minute
  inventory: 30,          // 30 seconds

  // Real-time - no cache
  notifications: 0,
  liveData: 0,
} as const;

// Apply TTL based on content type
export function getCacheTTL(contentType: keyof typeof CacheTTL): number {
  return CacheTTL[contentType];
}
```

## Variants

### With Distributed Lock for Safe Invalidation

```typescript
// lib/cache/safe-invalidation.ts
import { getRedis } from '@/lib/redis';

export async function safeInvalidate(
  tag: string,
  invalidateFn: () => Promise<void>
): Promise<void> {
  const redis = getRedis();
  const lockKey = `lock:invalidation:${tag}`;
  
  // Acquire lock
  const acquired = await redis.set(lockKey, '1', { nx: true, ex: 30 });
  
  if (!acquired) {
    // Another process is invalidating, skip
    return;
  }

  try {
    await invalidateFn();
  } finally {
    // Release lock
    await redis.del(lockKey);
  }
}
```

### With Invalidation Queue

```typescript
// lib/cache/invalidation-queue.ts
import { Queue } from 'bullmq';

const invalidationQueue = new Queue('cache-invalidation');

export async function queueInvalidation(
  tags: string[],
  paths: string[],
  delay: number = 0
): Promise<void> {
  await invalidationQueue.add(
    'invalidate',
    { tags, paths },
    { delay, attempts: 3 }
  );
}

// Debounced invalidation for rapid updates
export async function debouncedInvalidation(
  key: string,
  tags: string[],
  paths: string[]
): Promise<void> {
  // Remove pending jobs with same key
  const jobs = await invalidationQueue.getJobs(['delayed']);
  for (const job of jobs) {
    if (job.data.key === key) {
      await job.remove();
    }
  }

  // Add new debounced job
  await invalidationQueue.add(
    'invalidate',
    { key, tags, paths },
    { delay: 1000 } // 1 second debounce
  );
}
```

## Anti-patterns

```typescript
// BAD: Invalidating everything on every change
revalidateTag('all-content'); // Too broad

// GOOD: Targeted invalidation
revalidateTag(`product-${productId}`);

// BAD: Not invalidating related caches
await updateProduct(productId, { categoryId: newCategoryId });
revalidateTag(`product-${productId}`); // Missing category invalidation!

// GOOD: Invalidate all related caches
await updateProduct(productId, { categoryId: newCategoryId });
revalidateTag(`product-${productId}`);
revalidateTag(`category-${oldCategoryId}`);
revalidateTag(`category-${newCategoryId}`);

// BAD: Synchronous invalidation in user-facing requests
await invalidateAllCaches(); // Slow!

// GOOD: Queue invalidation for background processing
await queueInvalidation(['products'], ['/products']);
```

## Related Patterns

- `tag-based-revalidation.md` - Next.js tag revalidation
- `redis-cache.md` - Redis caching
- `cache-warming.md` - Pre-populating caches
- `webhooks.md` - Webhook handling

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial cache invalidation pattern
