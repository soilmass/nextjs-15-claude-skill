---
id: pt-swr
name: SWR Data Fetching
version: 2.1.0
layer: L5
category: data
description: Stale-while-revalidate data fetching with Vercel's SWR library
tags: [data, swr, caching, client-state, vercel]
composes:
  - ../atoms/display-skeleton.md
  - ../atoms/input-button.md
  - ../molecules/card.md
dependencies: []
formula: "SWR = SWRConfig + useSWR + useSWRMutation + Skeleton(a-display-skeleton) + Card(m-card)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# SWR Data Fetching

## Overview

SWR (stale-while-revalidate) is a React Hooks library for data fetching created by Vercel. It's lighter than React Query and perfect for simple to medium complexity data fetching needs with excellent cache management.

## When to Use

- Simple client-side data fetching
- Real-time data synchronization
- Vercel ecosystem projects
- Simpler alternative to React Query
- Auto-revalidation on focus/reconnect

## Composition Diagram

```
+------------------------------------------+
|              SWR Provider                |
|  +------------------------------------+  |
|  |         Client Component          |  |
|  |  +--------+  +--------+           |  |
|  |  | useSWR |  |useSWR  |           |  |
|  |  |        |  |Mutation|           |  |
|  |  +---+----+  +---+----+           |  |
|  |      |           |                |  |
|  |      v           v                |  |
|  |  +--------+  +--------+           |  |
|  |  |Skeleton|  | Toast  |           |  |
|  |  +--------+  +--------+           |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Setup

```typescript
// providers/swr-provider.tsx
'use client';

import { SWRConfig } from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}

// app/layout.tsx
import { SWRProvider } from '@/providers/swr-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}
```

## Basic Usage

```typescript
// hooks/use-user.ts
'use client';

import useSWR from 'swr';
import { User } from '@/types';

export function useUser(id: string) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? `/api/users/${id}` : null
  );

  return {
    user: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// components/user-profile.tsx
'use client';

import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

export function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading, isError } = useUser(userId);

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (isError) return <div>Failed to load user</div>;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold">{user?.name}</h2>
      <p className="text-muted-foreground">{user?.email}</p>
    </div>
  );
}
```

## With Custom Fetcher

```typescript
// lib/fetcher.ts
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const info = await res.json();
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
}

// Usage
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

function Component() {
  const { data, error } = useSWR('/api/data', fetcher);
}
```

## Conditional Fetching

```typescript
// Only fetch when user is logged in
function Dashboard() {
  const { user } = useAuth();
  
  // Pass null to skip fetching
  const { data } = useSWR(
    user ? '/api/dashboard' : null
  );

  return <div>{/* ... */}</div>;
}

// Dependent fetching
function UserProjects({ userId }: { userId: string }) {
  const { data: user } = useSWR(`/api/users/${userId}`);
  
  // Only fetch projects after user is loaded
  const { data: projects } = useSWR(
    user ? `/api/users/${userId}/projects` : null
  );

  return <div>{/* ... */}</div>;
}
```

## Mutations with useSWRMutation

```typescript
// hooks/use-create-post.ts
'use client';

import useSWRMutation from 'swr/mutation';
import { Post, CreatePostInput } from '@/types';

async function createPost(
  url: string,
  { arg }: { arg: CreatePostInput }
): Promise<Post> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

export function useCreatePost() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/posts',
    createPost
  );

  return {
    createPost: trigger,
    isCreating: isMutating,
    error,
  };
}

// Usage
function CreatePostForm() {
  const { createPost, isCreating } = useCreatePost();

  const handleSubmit = async (data: CreatePostInput) => {
    try {
      await createPost(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={...}>
      <button disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

## Optimistic Updates

```typescript
// hooks/use-toggle-like.ts
'use client';

import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { Post } from '@/types';

async function toggleLike(url: string): Promise<Post> {
  const res = await fetch(url, { method: 'POST' });
  return res.json();
}

export function useToggleLike(postId: string) {
  const { mutate } = useSWRConfig();
  const { data: post } = useSWR<Post>(`/api/posts/${postId}`);

  const { trigger } = useSWRMutation(
    `/api/posts/${postId}/like`,
    toggleLike,
    {
      // Optimistic update
      optimisticData: () => ({
        ...post!,
        liked: !post?.liked,
        likeCount: post!.liked ? post!.likeCount - 1 : post!.likeCount + 1,
      }),
      
      // Rollback on error
      rollbackOnError: true,
      
      // Revalidate after mutation
      revalidate: true,
      
      // Update local data after success
      populateCache: (result, currentData) => result,
    }
  );

  return { toggleLike: trigger };
}
```

## Infinite Loading

```typescript
// hooks/use-infinite-posts.ts
'use client';

import useSWRInfinite from 'swr/infinite';
import { Post } from '@/types';

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
}

const getKey = (
  pageIndex: number,
  previousPageData: PostsResponse | null
) => {
  // Reached the end
  if (previousPageData && !previousPageData.nextCursor) return null;
  
  // First page
  if (pageIndex === 0) return '/api/posts';
  
  // Add cursor for subsequent pages
  return `/api/posts?cursor=${previousPageData!.nextCursor}`;
};

export function useInfinitePosts() {
  const {
    data,
    size,
    setSize,
    isLoading,
    isValidating,
    error,
  } = useSWRInfinite<PostsResponse>(getKey);

  const posts = data?.flatMap((page) => page.posts) ?? [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.posts.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.nextCursor);

  return {
    posts,
    loadMore: () => setSize(size + 1),
    isLoading,
    isLoadingMore,
    isReachingEnd,
    error,
  };
}

// components/infinite-posts.tsx
'use client';

import { useInfinitePosts } from '@/hooks/use-infinite-posts';
import { Button } from '@/components/ui/button';

export function InfinitePosts() {
  const { posts, loadMore, isLoading, isLoadingMore, isReachingEnd } = useInfinitePosts();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {!isReachingEnd && (
        <Button onClick={loadMore} disabled={isLoadingMore}>
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
```

## Global Mutate

```typescript
// Mutate specific key
import { mutate } from 'swr';

// Revalidate a specific key
mutate('/api/posts');

// Update data and revalidate
mutate('/api/posts', newPosts, { revalidate: true });

// Optimistic update without revalidation
mutate('/api/user', { ...user, name: 'New Name' }, { revalidate: false });

// Mutate all keys matching a filter
mutate(
  (key) => typeof key === 'string' && key.startsWith('/api/posts'),
  undefined,
  { revalidate: true }
);
```

## Preloading Data

```typescript
// Preload on hover
import { preload } from 'swr';
import { fetcher } from '@/lib/fetcher';

function ProductCard({ product }: { product: Product }) {
  const handleMouseEnter = () => {
    preload(`/api/products/${product.id}`, fetcher);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {product.name}
    </Link>
  );
}
```

## With TypeScript

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
  };
}

// hooks/use-api.ts
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

export function useApi<T>(
  url: string | null,
  config?: SWRConfiguration<T>
): SWRResponse<T> {
  return useSWR<T>(url, {
    ...config,
  });
}

// Usage with typed response
interface ProductsResponse {
  products: Product[];
  total: number;
}

function Products() {
  const { data, error } = useApi<ProductsResponse>('/api/products');
  // data is typed as ProductsResponse | undefined
}
```

## Error Handling

```typescript
// Global error handling
<SWRConfig
  value={{
    onError: (error, key) => {
      if (error.status !== 403 && error.status !== 404) {
        // Log to error tracking service
        captureException(error);
      }
    },
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Never retry on 404
      if (error.status === 404) return;
      
      // Never retry on specific keys
      if (key === '/api/user') return;
      
      // Only retry up to 3 times
      if (retryCount >= 3) return;
      
      // Retry after 5 seconds
      setTimeout(() => revalidate({ retryCount }), 5000);
    },
  }}
>
```

## Subscription / Real-time

```typescript
// Subscribe to real-time updates
import useSWRSubscription from 'swr/subscription';

function Notifications() {
  const { data, error } = useSWRSubscription(
    'ws://localhost:3000/notifications',
    (key, { next }) => {
      const socket = new WebSocket(key);
      
      socket.onmessage = (event) => {
        next(null, JSON.parse(event.data));
      };
      
      socket.onerror = (event) => {
        next(event);
      };
      
      return () => socket.close();
    }
  );

  return <div>{data?.message}</div>;
}
```

## Anti-patterns

### Don't Duplicate Keys

```typescript
// BAD - Inconsistent keys for same resource
useSWR(`/users/${id}`);
useSWR(`/api/users/${id}`);  // Different key!

// GOOD - Consistent keys
const userKey = (id: string) => `/api/users/${id}`;
useSWR(userKey(id));
```

### Don't Forget Conditional Fetching

```typescript
// BAD - Fetches with undefined values
useSWR(`/api/users/${userId}`);  // userId might be undefined

// GOOD - Conditional key
useSWR(userId ? `/api/users/${userId}` : null);
```

## Related Skills

- [react-query](./react-query.md)
- [server-components-data](./server-components-data.md)
- [client-fetch](./client-fetch.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Mutations with useSWRMutation
- Infinite loading
- Real-time subscriptions
