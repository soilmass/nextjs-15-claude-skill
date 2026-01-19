---
id: pt-revalidation
name: Cache Revalidation
version: 2.1.0
layer: L5
category: data
description: Strategies for revalidating cached data in Next.js 15 with the new caching defaults
tags: [data, cache, revalidation, next15, isr, on-demand]
composes:
  - ../atoms/feedback-toast.md
dependencies: []
formula: "Revalidation = revalidatePath + revalidateTag + cacheTag + cacheLife + Toast(a-feedback-toast)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Cache Revalidation

## Overview

Next.js 15 changed caching defaults - fetch is no longer cached by default. This pattern covers all revalidation strategies: time-based, on-demand, tag-based, and path-based, using both the new `'use cache'` directive and traditional methods.

## When to Use

- CMS content updates via webhooks
- E-commerce inventory/price changes
- User-generated content updates
- Scheduled content refresh
- Manual cache invalidation

## Composition Diagram

```
+------------------------------------------+
|           Revalidation Flow              |
|  +------------------------------------+  |
|  |     Data Update (Server Action)   |  |
|  +------------------------------------+  |
|           |                             |
|     +-----+-----+-----+                 |
|     |           |     |                 |
|     v           v     v                 |
| revalidate  revalidate  webhook         |
|   Path()      Tag()    trigger          |
|     |           |     |                 |
|     +-----+-----+-----+                 |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |    Cache Invalidated -> Rebuild   |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Time-Based Revalidation

```typescript
// Option 1: Fetch with next.revalidate
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  return res.json();
}

// Option 2: Route segment config
// app/posts/page.tsx
export const revalidate = 3600; // Revalidate this page every hour

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}

// Option 3: 'use cache' with cacheLife (Next.js 15)
// lib/data.ts
import { cacheLife, cacheTag } from 'next/cache';

export async function getPosts() {
  'use cache';
  cacheLife('hours'); // Predefined: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max'
  cacheTag('posts');
  
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

// Custom cache life
export async function getProducts() {
  'use cache';
  cacheLife({
    stale: 300,    // Serve stale for 5 minutes
    revalidate: 3600, // Revalidate every hour
    expire: 86400, // Expire after 1 day
  });
  cacheTag('products');
  
  return prisma.product.findMany();
}
```

## On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');
  
  // Validate secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  const body = await request.json();
  
  try {
    // Revalidate by path
    if (body.path) {
      revalidatePath(body.path);
    }
    
    // Revalidate by tag
    if (body.tag) {
      revalidateTag(body.tag);
    }
    
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}

// Webhook handler example
// app/api/webhooks/cms/route.ts
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const headersList = await headers();
  const signature = headersList.get('x-webhook-signature');
  
  // Verify webhook signature
  if (!verifySignature(signature, await request.text())) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const payload = await request.json();
  
  // Revalidate based on content type
  switch (payload.type) {
    case 'post.created':
    case 'post.updated':
    case 'post.deleted':
      revalidateTag('posts');
      revalidateTag(`post-${payload.data.id}`);
      break;
    case 'product.updated':
      revalidateTag('products');
      revalidateTag(`product-${payload.data.id}`);
      break;
  }
  
  return new Response('OK');
}
```

## Tag-Based Revalidation

```typescript
// lib/data.ts
import { cacheTag } from 'next/cache';
import { prisma } from '@/lib/db';

export async function getPost(slug: string) {
  'use cache';
  cacheTag('posts', `post-${slug}`); // Multiple tags
  
  return prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });
}

export async function getPostsByCategory(categoryId: string) {
  'use cache';
  cacheTag('posts', `category-${categoryId}`);
  
  return prisma.post.findMany({
    where: { categoryId },
  });
}

// app/actions/posts.ts
'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';

export async function updatePost(id: string, data: PostUpdateData) {
  const post = await prisma.post.update({
    where: { id },
    data,
  });
  
  // Revalidate specific post and list
  revalidateTag(`post-${post.slug}`);
  revalidateTag('posts');
  
  // If category changed, revalidate both categories
  if (data.categoryId) {
    revalidateTag(`category-${data.categoryId}`);
  }
  
  return post;
}
```

## Path-Based Revalidation

```typescript
// app/actions/products.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';

export async function createProduct(data: ProductData) {
  const product = await prisma.product.create({ data });
  
  // Revalidate specific paths
  revalidatePath('/products'); // Product listing
  revalidatePath(`/products/${product.slug}`); // Product page
  revalidatePath('/'); // Homepage with featured products
  
  return product;
}

export async function updateProduct(id: string, data: ProductData) {
  const product = await prisma.product.update({
    where: { id },
    data,
  });
  
  // Revalidate with different scopes
  revalidatePath(`/products/${product.slug}`, 'page'); // Just the page
  revalidatePath('/products', 'layout'); // Layout and all child pages
  
  return product;
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({ where: { id } });
  
  // Revalidate all product pages
  revalidatePath('/products', 'layout');
  
  return product;
}
```

## Combining Strategies

```typescript
// lib/data.ts
import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/db';

// Different cache strategies for different data types
export async function getHomepageData() {
  'use cache';
  cacheLife('hours'); // Revalidate hourly
  cacheTag('homepage');
  
  const [featuredProducts, latestPosts, testimonials] = await Promise.all([
    prisma.product.findMany({ where: { featured: true }, take: 4 }),
    prisma.post.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.testimonial.findMany({ take: 6 }),
  ]);
  
  return { featuredProducts, latestPosts, testimonials };
}

export async function getUserDashboard(userId: string) {
  'use cache';
  cacheLife('minutes'); // More frequent updates for user data
  cacheTag(`user-${userId}`, 'dashboard');
  
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: { take: 5, orderBy: { createdAt: 'desc' } },
      notifications: { where: { read: false }, take: 10 },
    },
  });
}

// Real-time data - no caching
export async function getCartItems(cartId: string) {
  // No 'use cache' - always fresh
  return prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
  });
}
```

## Revalidation in Server Actions

```typescript
// app/actions/comments.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';

export async function addComment(postId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: session.user.id,
    },
  });
  
  // Multiple revalidation strategies
  revalidateTag(`post-${postId}-comments`);
  revalidatePath(`/posts/${postId}`);
  
  return comment;
}

export async function likePost(postId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  await prisma.like.create({
    data: {
      postId,
      userId: session.user.id,
    },
  });
  
  // Only revalidate the specific post data
  revalidateTag(`post-${postId}-likes`);
  
  // Don't revalidate the full page - use optimistic updates instead
}
```

## Conditional Revalidation

```typescript
// lib/revalidation.ts
import { revalidatePath, revalidateTag } from 'next/cache';

interface RevalidationRule {
  condition: (data: any) => boolean;
  paths?: string[];
  tags?: string[];
}

export function conditionalRevalidate(data: any, rules: RevalidationRule[]) {
  rules.forEach((rule) => {
    if (rule.condition(data)) {
      rule.paths?.forEach((path) => revalidatePath(path));
      rule.tags?.forEach((tag) => revalidateTag(tag));
    }
  });
}

// Usage in server action
export async function updateProduct(id: string, data: ProductData) {
  const oldProduct = await prisma.product.findUnique({ where: { id } });
  const product = await prisma.product.update({ where: { id }, data });
  
  conditionalRevalidate(
    { old: oldProduct, new: product },
    [
      {
        // Always revalidate product page
        condition: () => true,
        paths: [`/products/${product.slug}`],
      },
      {
        // Revalidate homepage if featured status changed
        condition: ({ old, new: updated }) => old.featured !== updated.featured,
        paths: ['/'],
        tags: ['featured-products'],
      },
      {
        // Revalidate category if it changed
        condition: ({ old, new: updated }) => old.categoryId !== updated.categoryId,
        tags: [`category-${oldProduct?.categoryId}`, `category-${product.categoryId}`],
      },
      {
        // Revalidate search if title changed
        condition: ({ old, new: updated }) => old.title !== updated.title,
        tags: ['search-index'],
      },
    ]
  );
  
  return product;
}
```

## Anti-patterns

### Don't Over-Revalidate

```typescript
// BAD - Revalidates everything on every change
export async function updateProduct(id: string, data: ProductData) {
  await prisma.product.update({ where: { id }, data });
  
  revalidatePath('/'); // Homepage
  revalidatePath('/products'); // All products
  revalidatePath('/categories'); // All categories
  revalidatePath('/search'); // Search
  // ... more paths
}

// GOOD - Surgical revalidation
export async function updateProduct(id: string, data: ProductData) {
  const product = await prisma.product.update({ where: { id }, data });
  
  // Only revalidate affected pages
  revalidateTag(`product-${id}`);
  if (data.featured !== undefined) {
    revalidateTag('featured-products');
  }
}
```

### Don't Forget Error Handling

```typescript
// BAD - Revalidates even on failure
export async function updatePost(id: string, data: PostData) {
  await prisma.post.update({ where: { id }, data });
  revalidateTag('posts'); // Runs even if update fails
}

// GOOD - Only revalidate on success
export async function updatePost(id: string, data: PostData) {
  try {
    const post = await prisma.post.update({ where: { id }, data });
    revalidateTag(`post-${post.slug}`);
    return { success: true, post };
  } catch (error) {
    return { success: false, error: 'Update failed' };
  }
}
```

## Related Skills

- [data-cache](./data-cache.md)
- [server-actions](./server-actions.md)
- [server-components-data](./server-components-data.md)
- [mutations](./mutations.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Time-based revalidation
- On-demand revalidation
- Tag-based revalidation
- Path-based revalidation
- Conditional revalidation patterns
