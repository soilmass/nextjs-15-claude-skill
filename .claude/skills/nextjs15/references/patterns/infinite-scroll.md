---
id: pt-infinite-scroll
name: Infinite Scroll
version: 2.1.0
layer: L5
category: data
description: Implement infinite scrolling with React Query, SWR, or native solutions
tags: [data, infinite-scroll, pagination, virtualization, next15, react19]
composes:
  - ../atoms/display-skeleton.md
  - ../atoms/feedback-spinner.md
  - ../atoms/input-button.md
  - ../molecules/card.md
dependencies: []
formula: "InfiniteScroll = IntersectionObserver + useInfiniteQuery + Skeleton(a-display-skeleton) + Spinner(a-feedback-spinner)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Infinite Scroll

## Overview

Infinite scroll provides a seamless browsing experience by loading more content as users scroll. This pattern covers implementation with React Query's useInfiniteQuery, SWR's useSWRInfinite, and native intersection observer approaches with proper loading states and error handling.

## When to Use

- Social media feeds (posts, comments)
- Image galleries
- News/article feeds
- Chat message history
- Any content where continuous browsing is preferred over pagination

## Composition Diagram

```
+------------------------------------------+
|           Infinite Scroll List           |
|  +------------------------------------+  |
|  |  Item 1                           |  |
|  |  Item 2                           |  |
|  |  Item 3                           |  |
|  |  ...                              |  |
|  |  Item N                           |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |  [Intersection Observer Trigger]  |  |
|  |        [Spinner Loading...]       |  |
|  +------------------------------------+  |
+------------------------------------------+
           |
           v fetchNextPage()
```

## React Query Implementation

```typescript
// hooks/use-infinite-posts.ts
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
}

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

async function fetchPosts(cursor?: string): Promise<PostsResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '10');
  
  const res = await fetch(`/api/posts?${params}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 60 * 1000,
  });
}

// components/infinite-posts-list.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useInfinitePosts } from '@/hooks/use-infinite-posts';
import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export function InfinitePostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfinitePosts();
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for automatic loading
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="space-y-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}
        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-muted-foreground">No more posts</p>
        )}
      </div>
    </div>
  );
}
```

## SWR Implementation

```typescript
// hooks/use-swr-infinite-posts.ts
'use client';

import useSWRInfinite from 'swr/infinite';

interface Post {
  id: string;
  title: string;
}

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSWRInfinitePosts() {
  const getKey = (
    pageIndex: number,
    previousPageData: PostsResponse | null
  ): string | null => {
    // Reached the end
    if (previousPageData && !previousPageData.nextCursor) return null;
    
    // First page
    if (pageIndex === 0) return '/api/posts?limit=10';
    
    // Add cursor for subsequent pages
    return `/api/posts?limit=10&cursor=${previousPageData!.nextCursor}`;
  };

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<PostsResponse>(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
  });

  const posts = data?.flatMap((page) => page.posts) ?? [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.posts.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.nextCursor);

  return {
    posts,
    error,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    isValidating,
    loadMore: () => setSize(size + 1),
    refresh: () => mutate(),
  };
}

// components/swr-infinite-list.tsx
'use client';

import { useSWRInfinitePosts } from '@/hooks/use-swr-infinite-posts';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function SWRInfiniteList() {
  const {
    posts,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    loadMore,
    error,
  } = useSWRInfinitePosts();

  if (error) return <p>Error loading posts</p>;
  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id} className="p-4 border-b">
          <h2>{post.title}</h2>
        </article>
      ))}

      <div className="py-4 text-center">
        {!isReachingEnd && (
          <Button onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Native Implementation with Server Actions

```typescript
// app/actions/posts.ts
'use server';

import { prisma } from '@/lib/db';

interface LoadMoreResult {
  posts: Post[];
  nextCursor: string | null;
}

export async function loadMorePosts(cursor?: string): Promise<LoadMoreResult> {
  const limit = 10;
  
  const posts = await prisma.post.findMany({
    take: limit + 1, // Fetch one extra to check if there's more
    ...(cursor && {
      skip: 1, // Skip the cursor
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: 'desc' },
  });
  
  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, -1) : posts;
  
  return {
    posts: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

// components/server-action-infinite.tsx
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { loadMorePosts } from '@/app/actions/posts';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
}

interface InfiniteListProps {
  initialPosts: Post[];
  initialCursor: string | null;
}

export function ServerActionInfiniteList({
  initialPosts,
  initialCursor,
}: InfiniteListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = () => {
    if (!cursor || isPending) return;
    
    startTransition(async () => {
      const result = await loadMorePosts(cursor);
      setPosts((prev) => [...prev, ...result.posts]);
      setCursor(result.nextCursor);
    });
  };

  // Auto-load on scroll
  useEffect(() => {
    if (!loadMoreRef.current || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [cursor]);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="p-4 border rounded-lg">
          <h2 className="font-semibold">{post.title}</h2>
        </article>
      ))}

      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isPending && <Loader2 className="h-6 w-6 animate-spin" />}
        {!cursor && posts.length > 0 && (
          <p className="text-muted-foreground">You've reached the end</p>
        )}
      </div>
    </div>
  );
}
```

## With Virtualization

```typescript
// components/virtualized-infinite-list.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface Post {
  id: string;
  title: string;
  excerpt: string;
}

export function VirtualizedInfiniteList() {
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', 'virtualized'],
    queryFn: ({ pageParam = 0 }) =>
      fetch(`/api/posts?offset=${pageParam}&limit=50`).then((r) => r.json()),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 50 ? allPages.length * 50 : undefined,
  });

  const allPosts = data?.pages.flat() ?? [];

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allPosts.length + 1 : allPosts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Fetch more when reaching the end
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= allPosts.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualItems, allPosts.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index > allPosts.length - 1;
          const post = allPosts[virtualRow.index];

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="p-4"
            >
              {isLoaderRow ? (
                hasNextPage ? (
                  <Skeleton className="h-full" />
                ) : (
                  <p className="text-center text-muted-foreground">
                    Nothing more to load
                  </p>
                )
              ) : (
                <article className="h-full border rounded-lg p-4">
                  <h2 className="font-semibold">{post.title}</h2>
                  <p className="text-muted-foreground text-sm">
                    {post.excerpt}
                  </p>
                </article>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Bidirectional Infinite Scroll

```typescript
// hooks/use-bidirectional-scroll.ts
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

interface Message {
  id: string;
  content: string;
  createdAt: string;
}

interface MessagesResponse {
  messages: Message[];
  hasOlder: boolean;
  hasNewer: boolean;
  oldestId: string | null;
  newestId: string | null;
}

export function useBidirectionalMessages(channelId: string) {
  return useInfiniteQuery({
    queryKey: ['messages', channelId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ channelId });
      if (pageParam?.before) params.set('before', pageParam.before);
      if (pageParam?.after) params.set('after', pageParam.after);
      
      const res = await fetch(`/api/messages?${params}`);
      return res.json() as Promise<MessagesResponse>;
    },
    initialPageParam: { before: undefined, after: undefined },
    getNextPageParam: (lastPage) =>
      lastPage.hasOlder ? { before: lastPage.oldestId } : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.hasNewer ? { after: firstPage.newestId } : undefined,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });
}
```

## Anti-patterns

### Don't Forget to Prevent Duplicate Requests

```typescript
// BAD - Multiple requests when scrolling fast
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchNextPage(); // Can fire multiple times
    }
  });
  // ...
});

// GOOD - Check loading state
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  });
  // ...
});
```

### Don't Load Too Much Data

```typescript
// BAD - Large page sizes
const { data } = useInfiniteQuery({
  queryFn: ({ pageParam }) => fetch(`/api/posts?limit=100`), // Too many!
});

// GOOD - Reasonable page sizes
const { data } = useInfiniteQuery({
  queryFn: ({ pageParam }) => fetch(`/api/posts?limit=20`), // Better
});
```

## Related Skills

- [react-query](./react-query.md)
- [swr](./swr.md)
- [pagination](./pagination.md)
- [virtualization](./virtualization.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- React Query useInfiniteQuery
- SWR useSWRInfinite
- Server Actions approach
- Virtualization integration
- Bidirectional scroll
