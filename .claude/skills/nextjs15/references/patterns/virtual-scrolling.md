---
id: pt-virtual-scrolling
name: Virtual/Infinite Scrolling
version: 1.0.0
layer: L5
category: performance
description: Virtual scrolling and infinite scroll for large lists in Next.js
tags: [virtual-scroll, infinite-scroll, performance, lists, next15, react19]
composes:
  - ../molecules/card.md
  - ../atoms/input-button.md
dependencies:
  @tanstack/react-virtual: "^3.10.0"
formula: Window Virtualization + Intersection Observer + Data Fetching = Efficient Large Lists
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Virtual/Infinite Scrolling

## When to Use

- **Large datasets**: Thousands of items that would cause performance issues
- **Feed-style content**: Social feeds, news feeds, search results
- **Data tables**: Large tables with many rows
- **Galleries**: Image or video galleries with many items

**Avoid when**: List is small (under 100 items), or pagination is preferred UX.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Virtual Scrolling Architecture                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Virtualization                                        │  │
│  │  ├─ Window: Calculate visible range                  │  │
│  │  ├─ Render: Only visible items + buffer              │  │
│  │  └─ Scroll: Translate positions dynamically          │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Fixed Size │     │ Variable     │     │ Infinite    │   │
│  │ List       │     │ Size List    │     │ Loader      │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Virtual List Hook

```typescript
// hooks/use-virtual-list.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseVirtualListOptions<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
}

interface VirtualItem<T> {
  index: number;
  item: T;
  style: React.CSSProperties;
}

export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualListOptions<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getItemHeight = useCallback(
    (index: number) =>
      typeof itemHeight === 'function' ? itemHeight(index) : itemHeight,
    [itemHeight]
  );

  const { totalHeight, itemPositions } = useMemo(() => {
    const positions: number[] = [];
    let total = 0;

    for (let i = 0; i < items.length; i++) {
      positions.push(total);
      total += getItemHeight(i);
    }

    return { totalHeight: total, itemPositions: positions };
  }, [items.length, getItemHeight]);

  const visibleRange = useMemo(() => {
    let startIndex = 0;
    let endIndex = 0;

    // Find start index
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i] + getItemHeight(i) > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
    }

    // Find end index
    const bottomEdge = scrollTop + containerHeight;
    for (let i = startIndex; i < itemPositions.length; i++) {
      if (itemPositions[i] > bottomEdge) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
      endIndex = i;
    }

    endIndex = Math.min(items.length - 1, endIndex + overscan);

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemPositions, items.length, overscan, getItemHeight]);

  const virtualItems: VirtualItem<T>[] = useMemo(() => {
    const result: VirtualItem<T>[] = [];

    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      result.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: getItemHeight(i),
          transform: `translateY(${itemPositions[i]}px)`,
        },
      });
    }

    return result;
  }, [visibleRange, items, getItemHeight, itemPositions]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      if (!containerRef.current || index < 0 || index >= items.length) return;

      let targetScroll = itemPositions[index];

      if (align === 'center') {
        targetScroll -= (containerHeight - getItemHeight(index)) / 2;
      } else if (align === 'end') {
        targetScroll -= containerHeight - getItemHeight(index);
      }

      containerRef.current.scrollTop = Math.max(0, targetScroll);
    },
    [containerHeight, getItemHeight, itemPositions, items.length]
  );

  return {
    containerRef,
    virtualItems,
    totalHeight,
    handleScroll,
    scrollToIndex,
    visibleRange,
  };
}
```

## Virtual List Component

```typescript
// components/virtual-list.tsx
'use client';

import { useVirtualList } from '@/hooks/use-virtual-list';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 3,
}: VirtualListProps<T>) {
  const { containerRef, virtualItems, totalHeight, handleScroll } = useVirtualList({
    items,
    itemHeight,
    containerHeight,
    overscan,
  });

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto relative', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, item, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Infinite Scroll Hook

```typescript
// hooks/use-infinite-scroll.ts
import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.5,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setError(null);
      await onLoadMore();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more'));
    }
  }, [isLoading, hasMore, onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, threshold, rootMargin]);

  return { sentinelRef, error, retry: loadMore };
}
```

## Infinite Scroll Component

```typescript
// components/infinite-scroll.tsx
'use client';

import { ReactNode } from 'react';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfiniteScrollProps {
  children: ReactNode;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  loader,
  endMessage,
}: InfiniteScrollProps) {
  const { sentinelRef, error, retry } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
  });

  return (
    <div>
      {children}

      <div ref={sentinelRef} className="py-4 flex justify-center">
        {isLoading && (loader || <Loader2 className="h-6 w-6 animate-spin" />)}
        {error && (
          <div className="text-center">
            <p className="text-destructive mb-2">{error.message}</p>
            <Button variant="outline" size="sm" onClick={retry}>
              Retry
            </Button>
          </div>
        )}
        {!hasMore && !isLoading && endMessage}
      </div>
    </div>
  );
}
```

## Virtualized Infinite List

```typescript
// components/virtualized-infinite-list.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { useVirtualList } from '@/hooks/use-virtual-list';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualizedInfiniteListProps<T> {
  initialItems: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: (cursor?: string) => Promise<{ items: T[]; nextCursor?: string }>;
  getItemKey: (item: T) => string;
}

export function VirtualizedInfiniteList<T>({
  initialItems,
  itemHeight,
  containerHeight,
  renderItem,
  loadMore,
  getItemKey,
}: VirtualizedInfiniteListProps<T>) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  const { containerRef, virtualItems, totalHeight, handleScroll, visibleRange } =
    useVirtualList({
      items,
      itemHeight,
      containerHeight,
      overscan: 5,
    });

  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const result = await loadMore(cursor);
      setItems((prev) => [...prev, ...result.items]);
      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [cursor, hasMore, loadMore]);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      handleScroll(e);

      // Check if near bottom
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < containerHeight) {
        handleLoadMore();
      }
    },
    [handleScroll, handleLoadMore, containerHeight]
  );

  return (
    <div
      ref={containerRef}
      className="overflow-auto relative"
      style={{ height: containerHeight }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight + (hasMore ? itemHeight : 0), position: 'relative' }}>
        {virtualItems.map(({ index, item, style }) => (
          <div key={getItemKey(item)} style={style}>
            {renderItem(item, index)}
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: totalHeight,
              left: 0,
              right: 0,
              height: itemHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
```

## Usage Example

```typescript
// app/feed/page.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { InfiniteScroll } from '@/components/infinite-scroll';
import { Card, CardContent } from '@/components/ui/card';

interface Post {
  id: string;
  title: string;
  content: string;
}

async function fetchPosts(cursor?: string) {
  const res = await fetch(`/api/posts?cursor=${cursor || ''}`);
  return res.json();
}

export default function FeedPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <InfiniteScroll
      onLoadMore={() => fetchNextPage()}
      hasMore={!!hasNextPage}
      isLoading={isFetchingNextPage}
      endMessage={<p className="text-muted-foreground">No more posts</p>}
    >
      <div className="space-y-4">
        {posts.map((post: Post) => (
          <Card key={post.id}>
            <CardContent className="pt-4">
              <h3 className="font-medium">{post.title}</h3>
              <p className="text-muted-foreground">{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </InfiniteScroll>
  );
}
```

## Related Patterns

- [pagination](./pagination.md)
- [react-query](./react-query.md)
- [lazy-loading](./lazy-loading.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Virtual list hook
- Infinite scroll hook
- Combined virtualized infinite list
