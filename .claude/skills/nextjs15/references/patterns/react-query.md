---
id: pt-react-query
name: TanStack Query (React Query)
version: 2.1.0
layer: L5
category: data
description: Client-side data fetching, caching, and state management with TanStack Query v5
tags: [data, react-query, tanstack, caching, mutations, client-state]
composes:
  - ../atoms/display-skeleton.md
  - ../molecules/card.md
  - ../organisms/data-table.md
dependencies: []
formula: "ReactQuery = QueryClientProvider + useQuery + useMutation + Skeleton(a-display-skeleton) + Card(m-card)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# TanStack Query (React Query)

## Overview

TanStack Query v5 provides powerful data fetching, caching, and state synchronization for client components. Use it when you need client-side data fetching with automatic background updates, optimistic updates, or complex caching strategies.

## When to Use

- Client-side data fetching with automatic caching
- Real-time data synchronization across components
- Optimistic updates with automatic rollback
- Infinite scroll / pagination
- Prefetching data on hover or navigation
- Polling for live updates
- Offline support with cache persistence

## Composition Diagram

```
+------------------------------------------+
|            QueryClientProvider           |
|  +------------------------------------+  |
|  |         Client Component          |  |
|  |  +--------+  +--------+  +-----+  |  |
|  |  |useQuery|  |useMute.|  |Data |  |  |
|  |  +---+----+  +---+----+  |Table|  |  |
|  |      |           |       +-----+  |  |
|  |      v           v                |  |
|  |  +--------+  +--------+           |  |
|  |  |Skeleton|  | Toast  |           |  |
|  |  +--------+  +--------+           |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Setup

```typescript
// providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, disable retries on initial render
            staleTime: 60 * 1000,  // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// app/layout.tsx
import { QueryProvider } from '@/providers/query-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

## Basic Query

```typescript
// hooks/use-products.ts
'use client';

import { useQuery } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  price: number;
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}

// components/product-list.tsx
'use client';

import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductList() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>;
  }

  return (
    <div className="grid gap-4">
      {products?.map((product) => (
        <div key={product.id} className="p-4 border rounded">
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## Query with Parameters

```typescript
// hooks/use-product.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types';

async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,  // Don't fetch if no ID
  });
}

// With search/filter parameters
export function useProductSearch(params: {
  query?: string;
  category?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ['products', 'search', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set('q', params.query);
      if (params.category) searchParams.set('category', params.category);
      if (params.page) searchParams.set('page', String(params.page));
      
      const res = await fetch(`/api/products/search?${searchParams}`);
      return res.json();
    },
    placeholderData: (prev) => prev,  // Keep previous data while fetching
  });
}
```

## Mutations

```typescript
// hooks/use-create-product.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Product, CreateProductInput } from '@/types';

async function createProduct(data: CreateProductInput): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create product');
  }
  
  return res.json();
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Usage in component
function CreateProductForm() {
  const createProduct = useCreateProduct();

  const handleSubmit = (data: CreateProductInput) => {
    createProduct.mutate(data);
  };

  return (
    <form onSubmit={...}>
      {/* Form fields */}
      <button disabled={createProduct.isPending}>
        {createProduct.isPending ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

## Optimistic Updates with Mutations

```typescript
// hooks/use-toggle-favorite.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types';

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/products/${productId}/favorite`, {
        method: 'POST',
      });
      return res.json();
    },
    
    // Optimistic update
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot previous value
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);

      // Optimistically update
      queryClient.setQueryData<Product[]>(['products'], (old) =>
        old?.map((product) =>
          product.id === productId
            ? { ...product, isFavorite: !product.isFavorite }
            : product
        )
      );

      return { previousProducts };
    },
    
    // Rollback on error
    onError: (err, productId, context) => {
      queryClient.setQueryData(['products'], context?.previousProducts);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

## Infinite Queries

```typescript
// hooks/use-infinite-posts.ts
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
}

async function fetchPosts(cursor?: string): Promise<PostsResponse> {
  const url = cursor
    ? `/api/posts?cursor=${cursor}`
    : '/api/posts';
  const res = await fetch(url);
  return res.json();
}

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

// components/infinite-posts.tsx
'use client';

import { useInfinitePosts } from '@/hooks/use-infinite-posts';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export function InfinitePosts() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfinitePosts();

  const { ref, inView } = useInView();

  // Auto-fetch when bottom is visible
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {data?.pages.flatMap((page) =>
        page.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
      
      {/* Intersection observer trigger */}
      <div ref={ref} className="h-10">
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
}
```

## Prefetching

```typescript
// Prefetch on hover
// components/product-card.tsx
'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

export function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();

  const prefetchProduct = () => {
    queryClient.prefetchQuery({
      queryKey: ['products', product.id],
      queryFn: () => fetchProduct(product.id),
      staleTime: 60 * 1000,  // Only prefetch if data is older than 1 minute
    });
  };

  return (
    <Link
      href={`/products/${product.id}`}
      onMouseEnter={prefetchProduct}
      className="block p-4 border rounded hover:shadow-md transition-shadow"
    >
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </Link>
  );
}
```

## Hydration from Server Components

```typescript
// app/products/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getProducts } from '@/lib/products';
import { ProductList } from '@/components/product-list';

export default async function ProductsPage() {
  const queryClient = new QueryClient();

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductList />
    </HydrationBoundary>
  );
}
```

## Query Factory Pattern

```typescript
// lib/queries/products.ts
import { queryOptions } from '@tanstack/react-query';

export const productQueries = {
  all: () =>
    queryOptions({
      queryKey: ['products'],
      queryFn: () => fetch('/api/products').then((r) => r.json()),
    }),
    
  detail: (id: string) =>
    queryOptions({
      queryKey: ['products', id],
      queryFn: () => fetch(`/api/products/${id}`).then((r) => r.json()),
    }),
    
  search: (params: SearchParams) =>
    queryOptions({
      queryKey: ['products', 'search', params],
      queryFn: () =>
        fetch(`/api/products/search?${new URLSearchParams(params)}`).then((r) =>
          r.json()
        ),
    }),
};

// Usage
import { useQuery } from '@tanstack/react-query';
import { productQueries } from '@/lib/queries/products';

function ProductDetail({ id }: { id: string }) {
  const { data } = useQuery(productQueries.detail(id));
  return <div>{data?.name}</div>;
}

// Prefetching with factory
queryClient.prefetchQuery(productQueries.detail(productId));
```

## Dependent Queries

```typescript
// Fetch user, then fetch their posts
function UserPosts({ userId }: { userId: string }) {
  const userQuery = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  });

  const postsQuery = useQuery({
    queryKey: ['users', userId, 'posts'],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!userQuery.data,  // Only run when user is loaded
  });

  if (userQuery.isLoading) return <div>Loading user...</div>;
  if (postsQuery.isLoading) return <div>Loading posts...</div>;

  return (
    <div>
      <h1>{userQuery.data.name}'s Posts</h1>
      {postsQuery.data?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

## Anti-patterns

### Don't Fetch on Server When Client-Only Data

```typescript
// BAD - Fetching user-specific data on server
// app/dashboard/page.tsx
export default async function Dashboard() {
  const prefs = await getUserPreferences();  // Cookie-dependent
  return <PreferencesForm prefs={prefs} />;
}

// GOOD - Use React Query for user-specific data
'use client';
function Dashboard() {
  const { data: prefs } = useQuery({
    queryKey: ['user', 'preferences'],
    queryFn: fetchUserPreferences,
  });
  return <PreferencesForm prefs={prefs} />;
}
```

### Don't Forget to Handle All States

```typescript
// BAD - Only handling success case
const { data } = useQuery({ queryKey: ['products'], queryFn });
return <div>{data.map(/* crashes if undefined */)}</div>;

// GOOD - Handle all states
const { data, isLoading, error } = useQuery({ queryKey: ['products'], queryFn });

if (isLoading) return <Skeleton />;
if (error) return <Error error={error} />;
return <div>{data?.map(/* safe */)}</div>;
```

## Related Skills

- [swr](./swr.md)
- [server-components-data](./server-components-data.md)
- [optimistic-updates](./optimistic-updates.md)
- [client-fetch](./client-fetch.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- TanStack Query v5 patterns
- Hydration from server
- Query factory pattern
