---
id: pt-virtual-scroll
name: Virtual Scroll
version: 2.1.0
layer: L5
category: data
description: Virtualized lists for rendering large datasets efficiently
tags: [virtualization, scroll, performance, lists, large-data]
composes:
  - ../atoms/display-skeleton.md
  - ../atoms/feedback-spinner.md
  - ../molecules/list-item.md
  - ../organisms/data-table.md
formula: "VirtualScroll = useVirtualizer + ListItem(m-list-item) + Skeleton(a-display-skeleton) + DataTable(o-data-table)"
dependencies:
  - react
  - next
  - "@tanstack/react-virtual"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Virtual Scroll

## Overview

Virtualized scrolling patterns using @tanstack/react-virtual for efficiently rendering large lists and grids with thousands of items.

## Implementation

### Virtual List

```tsx
// components/virtual/virtual-list.tsx
'use client';

import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  estimateSize: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  overscan = 5,
  className,
  onEndReached,
  endReachedThreshold = 5,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Check if near end
  const lastItem = virtualItems[virtualItems.length - 1];
  if (lastItem && lastItem.index >= items.length - endReachedThreshold) {
    onEndReached?.();
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Virtual Grid

```tsx
// components/virtual/virtual-grid.tsx
'use client';

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualGridProps<T> {
  items: T[];
  columns: number;
  rowHeight: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  columns,
  rowHeight,
  gap = 0,
  renderItem,
  overscan = 2,
  className,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + gap,
    overscan,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                paddingBottom: `${gap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => (
                <div key={startIndex + colIndex}>
                  {renderItem(item, startIndex + colIndex)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Dynamic Height Virtual List

```tsx
// components/virtual/dynamic-virtual-list.tsx
'use client';

import { useRef, useCallback } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface DynamicVirtualListProps<T> {
  items: T[];
  renderItem: (
    item: T,
    index: number,
    measureRef: (node: HTMLElement | null) => void
  ) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
}

export function DynamicVirtualList<T>({
  items,
  renderItem,
  estimateSize = 100,
  overscan = 5,
  className,
}: DynamicVirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(
              items[virtualItem.index],
              virtualItem.index,
              virtualizer.measureElement
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Virtual Table

```tsx
// components/virtual/virtual-table.tsx
'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  headerHeight?: number;
  overscan?: number;
  className?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 48,
  headerHeight = 48,
  overscan = 10,
  className,
  onSort,
  sortKey,
  sortDirection,
  onRowClick,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div className={`flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div
        className="flex border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        style={{ height: headerHeight }}
      >
        {columns.map((column) => (
          <div
            key={column.key as string}
            className={`flex items-center px-4 text-sm font-semibold text-gray-900 dark:text-white ${
              column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
            }`}
            style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
            onClick={() => {
              if (column.sortable && onSort) {
                const newDirection =
                  sortKey === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
                onSort(column.key as string, newDirection);
              }
            }}
          >
            {column.header}
            {column.sortable && sortKey === column.key && (
              <span className="ml-1">
                {sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualRows.map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className={`absolute left-0 top-0 flex w-full items-center border-b border-gray-100 dark:border-gray-800 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    : ''
                } ${virtualRow.index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'}`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(item, virtualRow.index)}
              >
                {columns.map((column) => (
                  <div
                    key={column.key as string}
                    className="px-4 text-sm text-gray-700 dark:text-gray-300"
                    style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
                  >
                    {column.render
                      ? column.render(item, virtualRow.index)
                      : item[column.key as keyof T]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### Infinite Virtual List

```tsx
// components/virtual/infinite-virtual-list.tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface InfiniteVirtualListProps<T> {
  queryKey: string[];
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<{
    items: T[];
    nextPage: number | null;
  }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize: number;
  overscan?: number;
  className?: string;
}

export function InfiniteVirtualList<T>({
  queryKey,
  queryFn,
  renderItem,
  estimateSize,
  overscan = 5,
  className,
}: InfiniteVirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Fetch more when reaching the end
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= allItems.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualItems, allItems.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        Error loading data
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index > allItems.length - 1;

          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                renderItem(allItems[virtualItem.index], virtualItem.index)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Usage

```tsx
// Simple virtual list
import { VirtualList } from '@/components/virtual/virtual-list';

function UserList() {
  const users = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
  }));

  return (
    <VirtualList
      items={users}
      estimateSize={60}
      className="h-[600px]"
      renderItem={(user) => (
        <div className="border-b p-4">{user.name}</div>
      )}
    />
  );
}

// Virtual grid
import { VirtualGrid } from '@/components/virtual/virtual-grid';

function ImageGallery() {
  const images = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    src: `https://picsum.photos/200?random=${i}`,
  }));

  return (
    <VirtualGrid
      items={images}
      columns={4}
      rowHeight={200}
      gap={8}
      className="h-[600px]"
      renderItem={(image) => (
        <img src={image.src} className="rounded-lg" />
      )}
    />
  );
}

// Virtual table with sorting
import { VirtualTable } from '@/components/virtual/virtual-table';

function DataTable() {
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  return (
    <VirtualTable
      data={data}
      columns={[
        { key: 'name', header: 'Name', sortable: true },
        { key: 'email', header: 'Email', width: 250 },
        { key: 'role', header: 'Role', width: 100 },
      ]}
      className="h-[500px]"
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSort={(key, direction) => {
        setSortKey(key);
        setSortDirection(direction);
      }}
    />
  );
}

// Infinite loading virtual list
import { InfiniteVirtualList } from '@/components/virtual/infinite-virtual-list';

function InfiniteList() {
  return (
    <InfiniteVirtualList
      queryKey={['items']}
      queryFn={async ({ pageParam }) => {
        const res = await fetch(`/api/items?page=${pageParam}`);
        return res.json();
      }}
      estimateSize={72}
      className="h-[600px]"
      renderItem={(item) => <ItemCard item={item} />}
    />
  );
}
```

## Related Skills

- [L5/infinite-scroll](./infinite-scroll.md) - Infinite scroll pattern
- [L5/pagination](./pagination.md) - Pagination patterns
- [L3/data-table](../organisms/data-table.md) - Data table organism

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with @tanstack/react-virtual
