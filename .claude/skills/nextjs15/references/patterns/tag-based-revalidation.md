---
id: pt-tag-based-revalidation
name: Tag-Based Revalidation
version: 2.0.0
layer: L5
category: cache
description: Organize cache invalidation using semantic tags for precise, efficient updates
tags: [cache, tags, revalidation, invalidation, cache-strategy]
composes: []
dependencies: []
formula: "CacheTags hierarchy + unstable_cache tags + cacheTag() + revalidateTag() = Semantic invalidation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Tag-Based Revalidation

Use semantic cache tags to create a flexible, maintainable cache invalidation strategy that targets exactly what needs refreshing.

## When to Use

- **Entity relationships**: Products belonging to categories
- **Hierarchical data**: Parent/child invalidation cascades
- **Multi-tenant apps**: Per-organization cache isolation
- **Feature grouping**: All homepage-related caches
- **Bulk operations**: Invalidate all products at once
- **Cross-cutting concerns**: Settings affecting multiple pages

**Avoid when:**
- Simple key-based invalidation suffices
- Tag proliferation creates maintenance burden
- Performance impact of tag tracking outweighs benefits

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   CacheTags      |     |   Data Functions |     |  Server Actions  |
|   Definition     |     |   (Fetchers)     |     |  (Mutations)     |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  products.all          |                        |
         |  products.single(id)   |                        |
         |  products.byCategory   |                        |
         +----------------------->|                        |
         |                        |                        |
         |                        |  unstable_cache()      |
         |                        |  tags: [all, single]   |
         |                        |                        |
         |                        |                        |
         |                        |<-----------------------+
         |                        |  updateProduct()       |
         |                        |  revalidateTag(single) |
         |                        |  revalidateTag(all)    |
         |                        |                        |
+------------------+              |                        |
| Tag Hierarchy    |              |                        |
| products         |              |                        |
|  └─ product-123  |              |                        |
|  └─ category-456 |              |                        |
+------------------+              +------------------------+
```

## Overview

Tag-based revalidation allows you to:
- Group related data under semantic tags
- Invalidate multiple cache entries with a single call
- Create hierarchical cache relationships
- Build maintainable cache strategies

## Implementation

### Defining Cache Tags

```typescript
// lib/cache/tags.ts

// Type-safe cache tag definitions
export const CacheTags = {
  // Entity-based tags
  products: {
    all: "products",
    single: (id: string) => `product:${id}`,
    byCategory: (categoryId: string) => `products:category:${categoryId}`,
    featured: "products:featured",
    bestsellers: "products:bestsellers",
  },
  
  posts: {
    all: "posts",
    single: (id: string) => `post:${id}`,
    byAuthor: (authorId: string) => `posts:author:${authorId}`,
    byTag: (tag: string) => `posts:tag:${tag}`,
    published: "posts:published",
    drafts: "posts:drafts",
  },
  
  users: {
    all: "users",
    single: (id: string) => `user:${id}`,
    profile: (id: string) => `user:${id}:profile`,
    settings: (id: string) => `user:${id}:settings`,
  },
  
  // Feature-based tags
  navigation: "navigation",
  footer: "footer",
  settings: "site-settings",
  
  // Page-level tags
  pages: {
    home: "page:home",
    about: "page:about",
    contact: "page:contact",
  },
} as const;

// Helper type for getting tag values
type DeepValues<T> = T extends (...args: any[]) => infer R
  ? R
  : T extends object
  ? DeepValues<T[keyof T]>
  : T;

export type CacheTag = DeepValues<typeof CacheTags>;
```

### Using Tags with unstable_cache

```typescript
// lib/data/products.ts
import { unstable_cache } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import { prisma } from "@/lib/db";

export const getProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  },
  ["products-list"],
  {
    tags: [CacheTags.products.all],
    revalidate: 3600,
  }
);

export const getProduct = (productId: string) =>
  unstable_cache(
    async () => {
      return prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          variants: true,
          reviews: true,
        },
      });
    },
    [`product-${productId}`],
    {
      tags: [
        CacheTags.products.all,
        CacheTags.products.single(productId),
      ],
      revalidate: 3600,
    }
  )();

export const getProductsByCategory = (categoryId: string) =>
  unstable_cache(
    async () => {
      return prisma.product.findMany({
        where: { categoryId, published: true },
        orderBy: { name: "asc" },
      });
    },
    [`products-category-${categoryId}`],
    {
      tags: [
        CacheTags.products.all,
        CacheTags.products.byCategory(categoryId),
      ],
      revalidate: 3600,
    }
  )();

export const getFeaturedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { featured: true, published: true },
      take: 6,
    });
  },
  ["featured-products"],
  {
    tags: [
      CacheTags.products.all,
      CacheTags.products.featured,
    ],
    revalidate: 3600,
  }
);
```

### Using Tags with 'use cache' Directive

```typescript
// lib/data/posts.ts
import { cacheTag, cacheLife } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import { prisma } from "@/lib/db";

export async function getPosts() {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTags.posts.all, CacheTags.posts.published);
  
  return prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPost(postId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTags.posts.all, CacheTags.posts.single(postId));
  
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getPostsByAuthor(authorId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTags.posts.all, CacheTags.posts.byAuthor(authorId));
  
  return prisma.post.findMany({
    where: {
      authorId,
      status: "published",
    },
    orderBy: { publishedAt: "desc" },
  });
}
```

### Tag Invalidation Strategies

```typescript
// lib/cache/invalidate.ts
import { revalidateTag } from "next/cache";
import { CacheTags } from "./tags";

// Invalidate a single product
export function invalidateProduct(productId: string) {
  revalidateTag(CacheTags.products.single(productId));
}

// Invalidate a product and its related caches
export function invalidateProductCascade(
  productId: string, 
  categoryId?: string
) {
  // Specific product
  revalidateTag(CacheTags.products.single(productId));
  
  // Product listings
  revalidateTag(CacheTags.products.all);
  
  // Category if provided
  if (categoryId) {
    revalidateTag(CacheTags.products.byCategory(categoryId));
  }
  
  // Could affect featured/bestsellers
  revalidateTag(CacheTags.products.featured);
  revalidateTag(CacheTags.products.bestsellers);
}

// Invalidate all products (nuclear option)
export function invalidateAllProducts() {
  revalidateTag(CacheTags.products.all);
}

// Invalidate user-specific caches
export function invalidateUserData(userId: string) {
  revalidateTag(CacheTags.users.single(userId));
  revalidateTag(CacheTags.users.profile(userId));
  revalidateTag(CacheTags.users.settings(userId));
  revalidateTag(CacheTags.posts.byAuthor(userId));
}

// Invalidate site-wide caches (for settings changes)
export function invalidateSiteData() {
  revalidateTag(CacheTags.navigation);
  revalidateTag(CacheTags.footer);
  revalidateTag(CacheTags.settings);
  revalidateTag(CacheTags.pages.home);
}
```

### Server Actions with Tag Invalidation

```typescript
// app/actions/products.ts
"use server";

import { revalidateTag } from "next/cache";
import { CacheTags, invalidateProductCascade } from "@/lib/cache";
import { prisma } from "@/lib/db";

export async function createProduct(formData: FormData) {
  const data = Object.fromEntries(formData);
  
  const product = await prisma.product.create({
    data: {
      name: data.name as string,
      price: parseFloat(data.price as string),
      categoryId: data.categoryId as string,
      published: data.published === "true",
    },
  });
  
  // Invalidate all product listings since there's a new product
  revalidateTag(CacheTags.products.all);
  
  // Invalidate the category this product belongs to
  revalidateTag(CacheTags.products.byCategory(product.categoryId));
  
  // If it's featured, invalidate featured cache
  if (product.featured) {
    revalidateTag(CacheTags.products.featured);
  }
  
  return { success: true, product };
}

export async function updateProduct(productId: string, formData: FormData) {
  const data = Object.fromEntries(formData);
  
  // Get current product to know what changed
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
  });
  
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name as string,
      price: parseFloat(data.price as string),
      categoryId: data.categoryId as string,
      featured: data.featured === "true",
    },
  });
  
  // Always invalidate the specific product
  revalidateTag(CacheTags.products.single(productId));
  
  // If category changed, invalidate both old and new categories
  if (currentProduct?.categoryId !== product.categoryId) {
    if (currentProduct?.categoryId) {
      revalidateTag(CacheTags.products.byCategory(currentProduct.categoryId));
    }
    revalidateTag(CacheTags.products.byCategory(product.categoryId));
    revalidateTag(CacheTags.products.all);
  }
  
  // If featured status changed, invalidate featured cache
  if (currentProduct?.featured !== product.featured) {
    revalidateTag(CacheTags.products.featured);
  }
  
  return { success: true, product };
}

export async function deleteProduct(productId: string) {
  const product = await prisma.product.delete({
    where: { id: productId },
  });
  
  // Full cascade invalidation on delete
  invalidateProductCascade(productId, product.categoryId);
  
  return { success: true };
}
```

### Hierarchical Tag Architecture

```typescript
// lib/cache/hierarchical-tags.ts

// Multi-level tag system for complex applications
export const TagHierarchy = {
  // Level 1: Global
  global: "global",
  
  // Level 2: Tenant/Organization
  org: (orgId: string) => `org:${orgId}`,
  
  // Level 3: Feature areas
  feature: {
    products: (orgId: string) => `org:${orgId}:products`,
    orders: (orgId: string) => `org:${orgId}:orders`,
    customers: (orgId: string) => `org:${orgId}:customers`,
  },
  
  // Level 4: Specific entities
  entity: {
    product: (orgId: string, productId: string) => 
      `org:${orgId}:product:${productId}`,
    order: (orgId: string, orderId: string) => 
      `org:${orgId}:order:${orderId}`,
    customer: (orgId: string, customerId: string) => 
      `org:${orgId}:customer:${customerId}`,
  },
};

// Usage with multi-tenant data
export const getOrgProducts = (orgId: string) =>
  unstable_cache(
    async () => {
      return prisma.product.findMany({
        where: { organizationId: orgId },
      });
    },
    [`org-${orgId}-products`],
    {
      tags: [
        TagHierarchy.global,
        TagHierarchy.org(orgId),
        TagHierarchy.feature.products(orgId),
      ],
      revalidate: 3600,
    }
  )();

// Invalidation at different levels
export function invalidateOrgProducts(orgId: string) {
  // Only invalidates products for this org
  revalidateTag(TagHierarchy.feature.products(orgId));
}

export function invalidateAllOrgData(orgId: string) {
  // Invalidates all data for this org
  revalidateTag(TagHierarchy.org(orgId));
}

export function invalidateGlobalData() {
  // Nuclear option - invalidates everything
  revalidateTag(TagHierarchy.global);
}
```

## Variants

### Composite Tags

```typescript
// lib/cache/composite-tags.ts

// Create composite tags for complex queries
export function createCompositeTag(...parts: string[]): string {
  return parts.filter(Boolean).join(":");
}

// Usage
const tag = createCompositeTag("products", "category", categoryId, "featured");
// Result: "products:category:abc123:featured"

// For cached functions
export const getCategoryFeatured = (categoryId: string) =>
  unstable_cache(
    async () => {
      return prisma.product.findMany({
        where: {
          categoryId,
          featured: true,
        },
      });
    },
    [`category-featured-${categoryId}`],
    {
      tags: [
        CacheTags.products.all,
        CacheTags.products.byCategory(categoryId),
        CacheTags.products.featured,
        createCompositeTag("products", "category", categoryId, "featured"),
      ],
    }
  )();
```

### Time-Aware Tags

```typescript
// lib/cache/time-tags.ts

// Tags that include time components for scheduled invalidation
export function createDailyTag(base: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `${base}:daily:${date}`;
}

export function createHourlyTag(base: string): string {
  const date = new Date();
  const hour = `${date.toISOString().split("T")[0]}-${date.getUTCHours()}`;
  return `${base}:hourly:${hour}`;
}

// Daily digest that auto-invalidates
export const getDailyDigest = unstable_cache(
  async () => {
    return prisma.post.findMany({
      where: {
        publishedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
  },
  ["daily-digest"],
  {
    tags: [createDailyTag("digest")],
    revalidate: 3600, // Also time-based fallback
  }
);
```

## Anti-patterns

### Too Many Tags

```typescript
// BAD: Over-tagging creates maintenance burden
export const getProduct = (id: string) =>
  unstable_cache(
    async () => prisma.product.findUnique({ where: { id } }),
    [`product-${id}`],
    {
      tags: [
        "products",
        `product-${id}`,
        "all-data",
        "e-commerce",
        "inventory",
        "catalog",
        // Too many tags!
      ],
    }
  )();

// GOOD: Minimal, meaningful tags
export const getProduct = (id: string) =>
  unstable_cache(
    async () => prisma.product.findUnique({ where: { id } }),
    [`product-${id}`],
    {
      tags: [
        CacheTags.products.all,
        CacheTags.products.single(id),
      ],
    }
  )();
```

### Inconsistent Tag Naming

```typescript
// BAD: Inconsistent naming
revalidateTag("product-123");
revalidateTag("products_list");
revalidateTag("Product.featured");

// GOOD: Use a centralized tag system
revalidateTag(CacheTags.products.single("123"));
revalidateTag(CacheTags.products.all);
revalidateTag(CacheTags.products.featured);
```

### Missing Parent Tags

```typescript
// BAD: Only specific tag, can't invalidate in bulk
export const getProduct = (id: string) =>
  unstable_cache(
    async () => prisma.product.findUnique({ where: { id } }),
    [`product-${id}`],
    {
      tags: [`product-${id}`], // Only specific tag
    }
  )();

// GOOD: Include parent tag for bulk invalidation
export const getProduct = (id: string) =>
  unstable_cache(
    async () => prisma.product.findUnique({ where: { id } }),
    [`product-${id}`],
    {
      tags: [
        "products", // Parent tag for bulk operations
        `product-${id}`, // Specific tag for targeted updates
      ],
    }
  )();
```

## Related Skills

- `data-cache` - Core caching with unstable_cache
- `on-demand-revalidation` - Triggering revalidation
- `stale-while-revalidate` - SWR patterns
- `revalidation` - General revalidation strategies

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with hierarchical tag patterns
