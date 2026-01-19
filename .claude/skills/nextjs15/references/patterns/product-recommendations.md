---
id: pt-product-recommendations
name: Product Recommendations
version: 1.0.0
layer: L5
category: data
description: Product recommendation engine with related products, upsells, cross-sells, frequently bought together, and personalized suggestions
tags: [recommendations, upsell, cross-sell, personalization, ecommerce, next15]
composes: []
formula: "ProductRecommendations = RelatedProducts + FrequentlyBoughtTogether + PersonalizedSuggestions + TrendingItems"
dependencies:
  prisma: "^6.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Product Recommendations

## Overview

Comprehensive product recommendation system supporting related products, upsells/cross-sells, frequently bought together, personalized recommendations based on browsing history, and trending items.

## When to Use

- Showing related products on product pages
- Cart page cross-sells and upsells
- Personalized homepage recommendations
- "Customers also bought" sections
- Increasing average order value

## Implementation

### Database Schema

```prisma
model ProductRelation {
  id            String       @id @default(cuid())
  product       Product      @relation("ProductFrom", fields: [productId], references: [id])
  productId     String
  relatedProduct Product     @relation("ProductTo", fields: [relatedId], references: [id])
  relatedId     String
  type          RelationType
  score         Float        @default(1.0) // relevance score
  manual        Boolean      @default(false) // manually curated vs auto-generated

  @@unique([productId, relatedId, type])
  @@index([productId, type])
}

model ProductView {
  id          String   @id @default(cuid())
  productId   String
  userId      String?
  sessionId   String
  viewedAt    DateTime @default(now())

  @@index([productId])
  @@index([userId])
  @@index([sessionId])
  @@index([viewedAt])
}

model FrequentlyBoughtTogether {
  id          String  @id @default(cuid())
  productId   String
  pairedId    String
  frequency   Int     @default(1)
  lastUpdated DateTime @default(now())

  @@unique([productId, pairedId])
  @@index([productId])
}

enum RelationType {
  RELATED       // similar products
  UPSELL        // higher-priced alternatives
  CROSS_SELL    // complementary products
  ACCESSORY     // accessories for the product
  ALTERNATIVE   // different options
}
```

### Recommendations Service

```typescript
// lib/recommendations/service.ts
import { prisma } from '@/lib/prisma';

interface RecommendationOptions {
  limit?: number;
  excludeIds?: string[];
}

export async function getRelatedProducts(
  productId: string,
  options: RecommendationOptions = {}
): Promise<any[]> {
  const { limit = 8, excludeIds = [] } = options;

  // Get product category and tags for fallback
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true, tags: true },
  });

  // First try explicit relations
  const relations = await prisma.productRelation.findMany({
    where: {
      productId,
      type: 'RELATED',
      relatedId: { notIn: [productId, ...excludeIds] },
    },
    orderBy: { score: 'desc' },
    take: limit,
    include: {
      relatedProduct: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          inventory: true,
        },
      },
    },
  });

  if (relations.length >= limit) {
    return relations.map(r => r.relatedProduct);
  }

  // Fallback: same category products
  const remaining = limit - relations.length;
  const relatedIds = relations.map(r => r.relatedId);

  const categoryProducts = await prisma.product.findMany({
    where: {
      categoryId: product?.categoryId,
      id: { notIn: [productId, ...excludeIds, ...relatedIds] },
      status: 'ACTIVE',
    },
    take: remaining,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      inventory: true,
    },
  });

  return [...relations.map(r => r.relatedProduct), ...categoryProducts];
}

export async function getFrequentlyBoughtTogether(
  productId: string,
  limit: number = 4
): Promise<any[]> {
  const pairs = await prisma.frequentlyBoughtTogether.findMany({
    where: { productId },
    orderBy: { frequency: 'desc' },
    take: limit,
  });

  if (pairs.length === 0) return [];

  return prisma.product.findMany({
    where: {
      id: { in: pairs.map(p => p.pairedId) },
      status: 'ACTIVE',
      inventory: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
    },
  });
}

export async function getUpsells(
  productId: string,
  limit: number = 4
): Promise<any[]> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, categoryId: true },
  });

  if (!product) return [];

  // Get explicit upsells first
  const upsells = await prisma.productRelation.findMany({
    where: { productId, type: 'UPSELL' },
    orderBy: { score: 'desc' },
    take: limit,
    include: { relatedProduct: true },
  });

  if (upsells.length >= limit) {
    return upsells.map(u => u.relatedProduct);
  }

  // Fallback: higher-priced items in same category
  const remaining = limit - upsells.length;
  const upsellIds = upsells.map(u => u.relatedId);

  const autoUpsells = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      price: { gt: product.price },
      id: { notIn: [productId, ...upsellIds] },
      status: 'ACTIVE',
    },
    orderBy: { price: 'asc' },
    take: remaining,
  });

  return [...upsells.map(u => u.relatedProduct), ...autoUpsells];
}

export async function getCrossSells(
  cartProductIds: string[],
  limit: number = 4
): Promise<any[]> {
  // Get cross-sells for all cart items
  const crossSells = await prisma.productRelation.findMany({
    where: {
      productId: { in: cartProductIds },
      type: 'CROSS_SELL',
      relatedId: { notIn: cartProductIds },
    },
    orderBy: { score: 'desc' },
    take: limit * 2,
    include: { relatedProduct: true },
  });

  // Deduplicate and limit
  const seen = new Set<string>();
  const unique = crossSells.filter(cs => {
    if (seen.has(cs.relatedId)) return false;
    seen.add(cs.relatedId);
    return true;
  }).slice(0, limit);

  return unique.map(cs => cs.relatedProduct);
}

export async function getPersonalizedRecommendations(
  userId: string | null,
  sessionId: string,
  limit: number = 12
): Promise<any[]> {
  // Get recently viewed products
  const recentViews = await prisma.productView.findMany({
    where: userId ? { userId } : { sessionId },
    orderBy: { viewedAt: 'desc' },
    take: 10,
    distinct: ['productId'],
  });

  if (recentViews.length === 0) {
    // Return trending products for new users
    return getTrendingProducts(limit);
  }

  const viewedIds = recentViews.map(v => v.productId);

  // Get related products for viewed items
  const recommendations = await prisma.productRelation.findMany({
    where: {
      productId: { in: viewedIds },
      relatedId: { notIn: viewedIds },
    },
    orderBy: { score: 'desc' },
    take: limit * 2,
    include: { relatedProduct: true },
  });

  // Deduplicate
  const seen = new Set<string>();
  return recommendations
    .filter(r => {
      if (seen.has(r.relatedId)) return false;
      seen.add(r.relatedId);
      return true;
    })
    .slice(0, limit)
    .map(r => r.relatedProduct);
}

export async function getTrendingProducts(limit: number = 12): Promise<any[]> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Products with most views in the last week
  const trending = await prisma.productView.groupBy({
    by: ['productId'],
    where: { viewedAt: { gte: oneWeekAgo } },
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: limit,
  });

  return prisma.product.findMany({
    where: {
      id: { in: trending.map(t => t.productId) },
      status: 'ACTIVE',
    },
  });
}

// Background job to update frequently bought together
export async function updateFrequentlyBoughtTogether(): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get all orders from last 30 days with multiple items
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      items: { some: {} },
    },
    include: { items: { select: { productId: true } } },
  });

  const pairs = new Map<string, number>();

  for (const order of orders) {
    const productIds = order.items.map(i => i.productId);
    // Generate all pairs
    for (let i = 0; i < productIds.length; i++) {
      for (let j = i + 1; j < productIds.length; j++) {
        const key1 = `${productIds[i]}:${productIds[j]}`;
        const key2 = `${productIds[j]}:${productIds[i]}`;
        pairs.set(key1, (pairs.get(key1) || 0) + 1);
        pairs.set(key2, (pairs.get(key2) || 0) + 1);
      }
    }
  }

  // Upsert pairs with frequency > 1
  for (const [key, frequency] of pairs) {
    if (frequency < 2) continue;
    const [productId, pairedId] = key.split(':');
    await prisma.frequentlyBoughtTogether.upsert({
      where: { productId_pairedId: { productId, pairedId } },
      create: { productId, pairedId, frequency },
      update: { frequency, lastUpdated: new Date() },
    });
  }
}
```

## Examples

### Product Recommendations Grid

```tsx
// components/product-recommendations.tsx
import { ProductCard } from '@/components/product-card';

interface RecommendationsProps {
  title: string;
  products: any[];
  columns?: 2 | 3 | 4;
}

export function ProductRecommendations({
  title,
  products,
  columns = 4,
}: RecommendationsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-4`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

## Anti-patterns

- **No fallback**: Always have fallback recommendations
- **Showing out-of-stock**: Filter out unavailable products
- **Static recommendations**: Update based on real purchase data

## Related Skills

- [Cron Jobs](../patterns/cron-jobs.md)
- [Analytics Events](../patterns/analytics-events.md)
