---
id: pt-on-demand-revalidation
name: On-Demand Revalidation
version: 2.0.0
layer: L5
category: cache
description: Programmatic cache invalidation triggered by events rather than time
tags: [cache, revalidation, invalidation, webhooks, server-actions]
composes: []
dependencies: []
formula: "Server Action + revalidateTag()/revalidatePath() + Webhook Handler = Event-driven freshness"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# On-Demand Revalidation

Invalidate cached content programmatically when data changes, rather than waiting for time-based expiration.

## When to Use

- **CMS webhooks**: Revalidate when editors publish content in headless CMS
- **E-commerce updates**: Invalidate product pages when inventory or prices change
- **User actions**: Refresh data after form submissions or profile updates
- **Admin operations**: Clear caches after bulk updates or imports
- **External triggers**: Third-party services notifying data changes via webhooks
- **Real-time collaboration**: Update shared content when collaborators make changes

**Avoid when:**
- High-frequency updates that would cause constant invalidation
- Data where slight staleness is acceptable (use time-based instead)
- No clear trigger events exist for changes

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   External CMS   |     |  Webhook Route   |     |   Data Cache     |
|   (Contentful)   |     |  /api/revalidate |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  POST /webhook         |                        |
         +----------------------->|                        |
         |                        |  verifySignature()     |
         |                        |                        |
         |                        |  revalidateTag()       |
         |                        +----------------------->|
         |                        |                        |
         |                        |  revalidatePath()      |
         |                        +----------------------->|
         |                        |                        |
+--------+---------+              |                        |
|  Server Action   |              |                        |
|  updateProduct() +------------->|                        |
+------------------+              |  Cache Invalidated     |
                                  +<-----------------------+
```

## Overview

On-demand revalidation is essential for:
- CMS content updates
- E-commerce inventory changes
- User-generated content
- Real-time dashboards
- Multi-step workflows

## Implementation

### Basic Revalidation

```typescript
// app/actions/posts.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  const post = await prisma.post.create({
    data: { title, content },
  });
  
  // Revalidate the posts listing page
  revalidatePath("/blog");
  
  // Revalidate by tag for all components using "posts" tag
  revalidateTag("posts");
  
  return { success: true, post };
}

export async function updatePost(postId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  const post = await prisma.post.update({
    where: { id: postId },
    data: { title, content },
  });
  
  // Revalidate the specific post page
  revalidatePath(`/blog/${post.slug}`);
  
  // Revalidate the listing
  revalidatePath("/blog");
  
  // Revalidate all related tags
  revalidateTag("posts");
  revalidateTag(`post-${postId}`);
  
  return { success: true, post };
}

export async function deletePost(postId: string) {
  const post = await prisma.post.delete({
    where: { id: postId },
  });
  
  // Revalidate after deletion
  revalidatePath("/blog");
  revalidateTag("posts");
  
  return { success: true };
}
```

### Webhook-Triggered Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("x-webhook-signature") || "";
  
  // Verify the webhook is from a trusted source
  const isValid = verifySignature(
    payload,
    signature,
    process.env.WEBHOOK_SECRET!
  );
  
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  const data = JSON.parse(payload);
  
  // Handle different webhook events
  switch (data.event) {
    case "content.published":
      await handleContentPublished(data);
      break;
    case "content.updated":
      await handleContentUpdated(data);
      break;
    case "content.deleted":
      await handleContentDeleted(data);
      break;
    default:
      console.log("Unknown event:", data.event);
  }
  
  return NextResponse.json({ revalidated: true });
}

async function handleContentPublished(data: { type: string; slug: string }) {
  const { type, slug } = data;
  
  if (type === "post") {
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/blog");
    revalidateTag("posts");
  } else if (type === "page") {
    revalidatePath(`/${slug}`);
    revalidateTag("pages");
  }
}

async function handleContentUpdated(data: { type: string; slug: string; id: string }) {
  const { type, slug, id } = data;
  
  if (type === "post") {
    revalidatePath(`/blog/${slug}`);
    revalidateTag(`post-${id}`);
    revalidateTag("posts");
  }
}

async function handleContentDeleted(data: { type: string; id: string }) {
  const { type } = data;
  
  if (type === "post") {
    revalidatePath("/blog");
    revalidateTag("posts");
  }
}
```

### CMS Integration (Sanity Example)

```typescript
// app/api/revalidate/sanity/route.ts
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(request: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{
      _type: string;
      _id: string;
      slug?: { current: string };
    }>(request, process.env.SANITY_WEBHOOK_SECRET!);
    
    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    if (!body?._type) {
      return NextResponse.json({ error: "Missing body type" }, { status: 400 });
    }
    
    // Revalidate based on document type
    switch (body._type) {
      case "post":
        if (body.slug?.current) {
          revalidatePath(`/blog/${body.slug.current}`);
        }
        revalidatePath("/blog");
        revalidateTag("posts");
        break;
        
      case "author":
        revalidateTag("authors");
        revalidatePath("/about");
        break;
        
      case "settings":
        // Settings affect all pages
        revalidatePath("/", "layout");
        revalidateTag("settings");
        break;
        
      default:
        // Unknown type - revalidate everything to be safe
        revalidateTag("all");
    }
    
    return NextResponse.json({
      revalidated: true,
      type: body._type,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
```

### Tag-Based Cache Architecture

```typescript
// lib/data/products.ts
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

// Define a consistent tagging strategy
const CACHE_TAGS = {
  allProducts: "products",
  product: (id: string) => `product-${id}`,
  category: (slug: string) => `category-${slug}`,
  featured: "featured-products",
} as const;

export const getProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  },
  ["products-list"],
  {
    tags: [CACHE_TAGS.allProducts],
    revalidate: 3600, // Fallback: 1 hour
  }
);

export const getProduct = unstable_cache(
  async (productId: string) => {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: true,
      },
    });
  },
  ["product"],
  {
    tags: [CACHE_TAGS.allProducts], // Always include global tag
    revalidate: 3600,
  }
);

export const getProductsByCategory = unstable_cache(
  async (categorySlug: string) => {
    return prisma.product.findMany({
      where: {
        category: { slug: categorySlug },
        published: true,
      },
    });
  },
  ["products-by-category"],
  {
    tags: [CACHE_TAGS.allProducts],
    revalidate: 3600,
  }
);

// Dynamic tag assignment
export const getProductCached = (productId: string) =>
  unstable_cache(
    async () => {
      return prisma.product.findUnique({
        where: { id: productId },
      });
    },
    [`product-${productId}`],
    {
      tags: [CACHE_TAGS.allProducts, CACHE_TAGS.product(productId)],
      revalidate: 3600,
    }
  )();
```

### Revalidation Service

```typescript
// lib/services/revalidation.ts
import { revalidatePath, revalidateTag } from "next/cache";

type EntityType = "product" | "post" | "user" | "order";
type ActionType = "create" | "update" | "delete";

interface RevalidationRule {
  paths: string[];
  tags: string[];
}

const REVALIDATION_RULES: Record<EntityType, Record<ActionType, RevalidationRule>> = {
  product: {
    create: {
      paths: ["/products", "/"],
      tags: ["products", "featured-products"],
    },
    update: {
      paths: ["/products"],
      tags: ["products"],
    },
    delete: {
      paths: ["/products"],
      tags: ["products", "featured-products"],
    },
  },
  post: {
    create: {
      paths: ["/blog"],
      tags: ["posts"],
    },
    update: {
      paths: ["/blog"],
      tags: ["posts"],
    },
    delete: {
      paths: ["/blog"],
      tags: ["posts"],
    },
  },
  user: {
    create: { paths: [], tags: ["users"] },
    update: { paths: [], tags: ["users"] },
    delete: { paths: [], tags: ["users"] },
  },
  order: {
    create: { paths: ["/admin/orders"], tags: ["orders"] },
    update: { paths: ["/admin/orders"], tags: ["orders"] },
    delete: { paths: ["/admin/orders"], tags: ["orders"] },
  },
};

export async function triggerRevalidation(
  entityType: EntityType,
  action: ActionType,
  additionalPaths: string[] = [],
  additionalTags: string[] = []
) {
  const rules = REVALIDATION_RULES[entityType][action];
  
  // Combine default and additional paths/tags
  const allPaths = [...rules.paths, ...additionalPaths];
  const allTags = [...rules.tags, ...additionalTags];
  
  // Execute revalidations
  const results = {
    paths: [] as string[],
    tags: [] as string[],
    timestamp: Date.now(),
  };
  
  for (const path of allPaths) {
    try {
      revalidatePath(path);
      results.paths.push(path);
    } catch (error) {
      console.error(`Failed to revalidate path: ${path}`, error);
    }
  }
  
  for (const tag of allTags) {
    try {
      revalidateTag(tag);
      results.tags.push(tag);
    } catch (error) {
      console.error(`Failed to revalidate tag: ${tag}`, error);
    }
  }
  
  console.log("Revalidation complete:", results);
  return results;
}

// Usage in server action
export async function updateProduct(productId: string, data: ProductData) {
  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });
  
  await triggerRevalidation(
    "product",
    "update",
    [`/products/${product.slug}`],
    [`product-${productId}`]
  );
  
  return product;
}
```

## Variants

### Batch Revalidation

```typescript
// lib/revalidate-batch.ts
import { revalidatePath, revalidateTag } from "next/cache";

interface BatchRevalidation {
  paths?: Array<{ path: string; type?: "page" | "layout" }>;
  tags?: string[];
}

export async function revalidateBatch(batch: BatchRevalidation) {
  const results = {
    paths: { success: [] as string[], failed: [] as string[] },
    tags: { success: [] as string[], failed: [] as string[] },
  };
  
  // Process paths
  if (batch.paths) {
    await Promise.all(
      batch.paths.map(async ({ path, type = "page" }) => {
        try {
          revalidatePath(path, type);
          results.paths.success.push(path);
        } catch {
          results.paths.failed.push(path);
        }
      })
    );
  }
  
  // Process tags
  if (batch.tags) {
    await Promise.all(
      batch.tags.map(async (tag) => {
        try {
          revalidateTag(tag);
          results.tags.success.push(tag);
        } catch {
          results.tags.failed.push(tag);
        }
      })
    );
  }
  
  return results;
}

// Usage
await revalidateBatch({
  paths: [
    { path: "/products", type: "page" },
    { path: "/", type: "layout" },
  ],
  tags: ["products", "featured", "homepage"],
});
```

### Conditional Revalidation

```typescript
// app/actions/inventory.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function updateInventory(productId: string, newQuantity: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  
  if (!product) throw new Error("Product not found");
  
  const wasOutOfStock = product.quantity === 0;
  const isNowOutOfStock = newQuantity === 0;
  
  await prisma.product.update({
    where: { id: productId },
    data: { quantity: newQuantity },
  });
  
  // Always revalidate product page
  revalidatePath(`/products/${product.slug}`);
  revalidateTag(`product-${productId}`);
  
  // Only revalidate listings if stock status changed
  if (wasOutOfStock !== isNowOutOfStock) {
    revalidatePath("/products");
    revalidateTag("products");
    
    // If product is now in stock, might be featured
    if (!isNowOutOfStock) {
      revalidateTag("featured-products");
    }
  }
}
```

## Anti-patterns

### Revalidating Too Broadly

```typescript
// BAD: Nuking all caches
export async function updateUserProfile(userId: string, data: any) {
  await prisma.user.update({ where: { id: userId }, data });
  
  // This clears EVERYTHING - terrible for performance
  revalidatePath("/", "layout");
}

// GOOD: Targeted revalidation
export async function updateUserProfile(userId: string, data: any) {
  await prisma.user.update({ where: { id: userId }, data });
  
  revalidatePath(`/profile/${userId}`);
  revalidateTag(`user-${userId}`);
}
```

### Not Handling Errors

```typescript
// BAD: Revalidation errors can crash your action
export async function updatePost(id: string, data: any) {
  await prisma.post.update({ where: { id }, data });
  revalidatePath(`/posts/${id}`); // Might throw!
}

// GOOD: Handle revalidation errors gracefully
export async function updatePost(id: string, data: any) {
  await prisma.post.update({ where: { id }, data });
  
  try {
    revalidatePath(`/posts/${id}`);
    revalidateTag("posts");
  } catch (error) {
    // Log but don't fail the action
    console.error("Revalidation failed:", error);
  }
}
```

### Missing Webhook Verification

```typescript
// BAD: No verification - anyone can trigger revalidation
export async function POST(request: NextRequest) {
  const data = await request.json();
  revalidateTag(data.tag); // Dangerous!
}

// GOOD: Always verify webhooks
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature");
  if (!verifySignature(signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Now safe to revalidate
}
```

## Related Skills

- `data-cache` - Server-side caching with unstable_cache
- `router-cache` - Client-side navigation cache
- `tag-based-revalidation` - Tag-based cache invalidation patterns
- `webhooks` - Webhook handling patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with webhook and server action patterns
