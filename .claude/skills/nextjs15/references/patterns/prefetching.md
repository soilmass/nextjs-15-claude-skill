---
id: pt-prefetching
name: Data Prefetching
version: 2.0.0
layer: L5
category: performance
description: Prefetch data before navigation for instant page transitions
tags: [data, prefetch, performance, react-query, next15]
composes: []
dependencies: []
formula: "prefetching = link_prefetch + hover_prefetch + intersection_observer + react_query_hydration"
performance:
  impact: medium
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Data Prefetching

## Overview

Prefetching loads data before the user navigates to a page, enabling instant transitions. Next.js 15 prefetches routes automatically, but you can also prefetch data to the React Query or SWR cache for seamless experiences.

## When to Use

- **Navigation links**: Prefetch on viewport enter or hover
- **Pagination**: Prefetch next page while viewing current
- **Product cards**: Prefetch detail page on hover
- **Search results**: Prefetch top results
- **Related content**: Prefetch likely follow-up pages
- **Infinite scroll**: Prefetch next batch before reaching end

## Composition Diagram

```
+------------------+
|  User Interaction|
|  (hover/focus)   |
+------------------+
          |
          v
+------------------+     +------------------+
| Prefetch Trigger | --> | Route Prefetch   |
|                  |     | (next/link auto) |
+------------------+     +------------------+
          |
          v
+------------------+
| Data Prefetch    |
| (React Query/SWR)|
+------------------+
          |
    +-----+-----+
    |           |
    v           v
+--------+  +--------+
|Query   |  |SWR     |
|Cache   |  |Cache   |
|Warming |  |Preload |
+--------+  +--------+
          |
          v
+------------------+
| Instant Navigation|
| (cache hit)       |
+------------------+
```

## Link Prefetching (Built-in)

```typescript
// Next.js automatically prefetches linked pages in viewport
// app/navigation.tsx
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      {/* Prefetched by default when in viewport */}
      <Link href="/dashboard">Dashboard</Link>
      
      {/* Disable prefetching */}
      <Link href="/heavy-page" prefetch={false}>Heavy Page</Link>
      
      {/* Force prefetch even if outside viewport */}
      <Link href="/important" prefetch={true}>Important</Link>
    </nav>
  );
}
```

## React Query Prefetching

```typescript
// lib/prefetch.ts
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { prisma } from '@/lib/db';

export async function prefetchPosts(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const posts = await prisma.post.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      return posts;
    },
    staleTime: 60 * 1000, // Consider fresh for 1 minute
  });
}

export async function prefetchPost(queryClient: QueryClient, slug: string) {
  await queryClient.prefetchQuery({
    queryKey: ['posts', slug],
    queryFn: async () => {
      const post = await prisma.post.findUnique({
        where: { slug },
        include: { author: true },
      });
      return post;
    },
  });
}

// app/posts/page.tsx
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { prefetchPosts } from '@/lib/prefetch';
import { PostsList } from '@/components/posts-list';

export default async function PostsPage() {
  const queryClient = new QueryClient();
  await prefetchPosts(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsList />
    </HydrationBoundary>
  );
}
```

## Hover Prefetching

```typescript
// components/prefetch-link.tsx
'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

interface PrefetchLinkProps {
  href: string;
  prefetchFn: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PrefetchLink({
  href,
  prefetchFn,
  children,
  className,
}: PrefetchLinkProps) {
  const prefetchedRef = useRef(false);
  
  const handleMouseEnter = useCallback(async () => {
    if (!prefetchedRef.current) {
      prefetchedRef.current = true;
      await prefetchFn();
    }
  }, [prefetchFn]);

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      className={className}
    >
      {children}
    </Link>
  );
}

// Usage
// components/post-card.tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { PrefetchLink } from '@/components/prefetch-link';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
}

export function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const prefetchPost = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['posts', post.slug],
      queryFn: () => fetch(`/api/posts/${post.slug}`).then((r) => r.json()),
      staleTime: 60 * 1000,
    });
  };

  return (
    <PrefetchLink
      href={`/posts/${post.slug}`}
      prefetchFn={prefetchPost}
      className="block p-4 border rounded-lg hover:bg-accent"
    >
      <h2 className="font-semibold">{post.title}</h2>
      <p className="text-muted-foreground">{post.excerpt}</p>
    </PrefetchLink>
  );
}
```

## Route Segment Prefetching

```typescript
// app/products/[id]/prefetch.ts
import { QueryClient } from '@tanstack/react-query';
import { prisma } from '@/lib/db';

export async function prefetchProductPage(
  queryClient: QueryClient,
  productId: string
) {
  // Prefetch multiple related queries in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['products', productId],
      queryFn: () =>
        prisma.product.findUnique({
          where: { id: productId },
          include: { category: true, images: true },
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', productId, 'reviews'],
      queryFn: () =>
        prisma.review.findMany({
          where: { productId },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', productId, 'related'],
      queryFn: async () => {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { categoryId: true },
        });
        return prisma.product.findMany({
          where: {
            categoryId: product?.categoryId,
            id: { not: productId },
          },
          take: 4,
        });
      },
    }),
  ]);
}

// app/products/[id]/page.tsx
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { prefetchProductPage } from './prefetch';
import { ProductDetail } from '@/components/product-detail';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = new QueryClient();
  await prefetchProductPage(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetail productId={id} />
    </HydrationBoundary>
  );
}
```

## SWR Prefetching

```typescript
// lib/swr-prefetch.ts
import { preload } from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function prefetchUser(userId: string) {
  preload(`/api/users/${userId}`, fetcher);
}

export function prefetchPosts() {
  preload('/api/posts', fetcher);
}

// components/user-link.tsx
'use client';

import Link from 'next/link';
import { prefetchUser } from '@/lib/swr-prefetch';

export function UserLink({ userId, children }: { userId: string; children: React.ReactNode }) {
  return (
    <Link
      href={`/users/${userId}`}
      onMouseEnter={() => prefetchUser(userId)}
    >
      {children}
    </Link>
  );
}

// Fallback data pattern with SWR
// app/users/[id]/page.tsx
import { prisma } from '@/lib/db';
import { UserProfile } from '@/components/user-profile';

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch on server for initial render
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return <UserProfile userId={id} fallbackData={user} />;
}

// components/user-profile.tsx
'use client';

import useSWR from 'swr';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserProfile({
  userId,
  fallbackData,
}: {
  userId: string;
  fallbackData: User | null;
}) {
  const { data: user } = useSWR<User>(
    `/api/users/${userId}`,
    fetcher,
    {
      fallbackData: fallbackData || undefined,
      revalidateOnMount: !fallbackData, // Skip initial fetch if we have data
    }
  );

  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## Intersection Observer Prefetching

```typescript
// hooks/use-prefetch-on-visible.ts
'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PrefetchOptions {
  queryKey: unknown[];
  queryFn: () => Promise<unknown>;
  staleTime?: number;
}

export function usePrefetchOnVisible(options: PrefetchOptions) {
  const queryClient = useQueryClient();
  const ref = useRef<HTMLElement>(null);
  const prefetchedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !prefetchedRef.current) {
            prefetchedRef.current = true;
            queryClient.prefetchQuery({
              queryKey: options.queryKey,
              queryFn: options.queryFn,
              staleTime: options.staleTime ?? 60 * 1000,
            });
          }
        });
      },
      { rootMargin: '100px' } // Start prefetching 100px before visible
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [queryClient, options]);

  return ref;
}

// Usage
// components/post-preview.tsx
'use client';

import { usePrefetchOnVisible } from '@/hooks/use-prefetch-on-visible';
import Link from 'next/link';

export function PostPreview({ post }: { post: Post }) {
  const ref = usePrefetchOnVisible({
    queryKey: ['posts', post.slug],
    queryFn: () => fetch(`/api/posts/${post.slug}`).then((r) => r.json()),
  });

  return (
    <article ref={ref as React.RefObject<HTMLElement>}>
      <Link href={`/posts/${post.slug}`}>
        <h2>{post.title}</h2>
      </Link>
    </article>
  );
}
```

## Predictive Prefetching

```typescript
// lib/predictive-prefetch.ts
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

// Define common navigation patterns
const navigationPatterns: Record<string, string[]> = {
  '/': ['/dashboard', '/pricing', '/about'],
  '/dashboard': ['/dashboard/settings', '/dashboard/analytics'],
  '/products': ['/products/featured', '/cart'],
  '/blog': ['/blog/latest'],
};

export function usePredictivePrefetch() {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  useEffect(() => {
    const predictedRoutes = navigationPatterns[pathname] || [];
    
    predictedRoutes.forEach((route) => {
      // Prefetch route data based on patterns
      if (route.startsWith('/dashboard')) {
        queryClient.prefetchQuery({
          queryKey: ['dashboard-data', route],
          queryFn: () => fetch(`/api${route}/data`).then((r) => r.json()),
          staleTime: 30 * 1000,
        });
      }
    });
  }, [pathname, queryClient]);
}

// components/predictive-provider.tsx
'use client';

import { usePredictivePrefetch } from '@/lib/predictive-prefetch';

export function PredictiveProvider({ children }: { children: React.ReactNode }) {
  usePredictivePrefetch();
  return <>{children}</>;
}
```

## Anti-patterns

### Don't Prefetch Everything

```typescript
// BAD - Prefetching too much data
useEffect(() => {
  // Wastes bandwidth on data user may never need
  queryClient.prefetchQuery(['all-products']);
  queryClient.prefetchQuery(['all-users']);
  queryClient.prefetchQuery(['all-orders']);
}, []);

// GOOD - Prefetch strategically
useEffect(() => {
  // Only prefetch likely next pages
  if (pathname === '/products') {
    queryClient.prefetchQuery({
      queryKey: ['cart'],
      staleTime: 5 * 60 * 1000,
    });
  }
}, [pathname]);
```

### Don't Forget Stale Times

```typescript
// BAD - No stale time, refetches immediately
queryClient.prefetchQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

// GOOD - Set appropriate stale time
queryClient.prefetchQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 60 * 1000, // Won't refetch for 1 minute
});
```

## Related Skills

- [react-query](./react-query.md)
- [swr](./swr.md)
- [server-components-data](./server-components-data.md)
- [streaming](./streaming.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Link prefetching
- React Query integration
- Hover prefetching
- Intersection observer pattern
- Predictive prefetching
