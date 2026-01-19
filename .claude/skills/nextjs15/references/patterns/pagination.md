---
id: pt-pagination
name: Pagination
version: 2.1.0
layer: L5
category: data
description: Implement offset, cursor, and page-based pagination with URL state
tags: [data, pagination, url-state, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../atoms/display-skeleton.md
  - ../molecules/pagination.md
  - ../organisms/data-table.md
dependencies: []
formula: "Pagination = URLSearchParams + PaginationNav(m-pagination) + Button(a-input-button) + DataTable(o-data-table)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Pagination

## Overview

Pagination divides large datasets into manageable chunks. This pattern covers offset-based, cursor-based, and page-based pagination with URL state synchronization for shareable links and browser navigation.

## When to Use

- Large datasets that cannot be loaded at once
- Search results with many matches
- Admin dashboards with data tables
- Blog posts, product lists, user lists
- Any list where users need to navigate through pages

## Composition Diagram

```
+------------------------------------------+
|            Paginated View                |
|  +------------------------------------+  |
|  |           Data Table              |  |
|  |  [rows...]                        |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |          Pagination Nav           |  |
|  | [<] [1] [2] [...] [10] [>]       |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | Page X of Y | Items per page [v] |  |
|  +------------------------------------+  |
+------------------------------------------+
           |
           v URL State (?page=2&limit=10)
```

## Server Component Pagination

```typescript
// app/posts/page.tsx
import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { PostsList } from '@/components/posts-list';
import { Pagination } from '@/components/pagination';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1'));
  const limit = Math.min(50, parseInt(params.limit || '10'));
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    }),
    prisma.post.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Posts</h1>
      
      <Suspense fallback={<Skeleton className="h-96" />}>
        <PostsList posts={posts} />
      </Suspense>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/posts"
      />
    </div>
  );
}
```

## Pagination Component

```typescript
// components/pagination.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate page numbers to show
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="icon"
        asChild={currentPage > 1}
        disabled={currentPage <= 1}
      >
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {getPageNumbers().map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="icon"
            asChild={page !== currentPage}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page === currentPage ? (
              <span>{page}</span>
            ) : (
              <Link href={createPageUrl(page)}>{page}</Link>
            )}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        asChild={currentPage < totalPages}
        disabled={currentPage >= totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
```

## Cursor-Based Pagination

```typescript
// lib/cursor-pagination.ts
import { prisma } from '@/lib/db';

interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
}

export async function getPaginatedPosts({
  cursor,
  limit = 10,
  direction = 'forward',
}: CursorPaginationParams): Promise<CursorPaginationResult<Post>> {
  const posts = await prisma.post.findMany({
    take: (direction === 'forward' ? 1 : -1) * (limit + 1),
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;

  // Reverse if going backward
  if (direction === 'backward') {
    items.reverse();
  }

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    prevCursor: items.length > 0 ? items[0].id : null,
    hasMore,
  };
}

// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedPosts } from '@/lib/cursor-pagination';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get('cursor') || undefined;
  const limit = parseInt(searchParams.get('limit') || '10');
  const direction = searchParams.get('direction') as 'forward' | 'backward' || 'forward';

  const result = await getPaginatedPosts({ cursor, limit, direction });
  
  return NextResponse.json(result);
}
```

## Client-Side Pagination with URL State

```typescript
// hooks/use-pagination.ts
'use client';

import { useQueryStates, parseAsInteger } from 'nuqs';

export function usePagination(defaults?: { page?: number; limit?: number }) {
  return useQueryStates({
    page: parseAsInteger.withDefault(defaults?.page ?? 1),
    limit: parseAsInteger.withDefault(defaults?.limit ?? 10),
  });
}

// components/paginated-table.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { usePagination } from '@/hooks/use-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/pagination';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export function PaginatedUsersTable() {
  const [{ page, limit }, setPagination] = usePagination();

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ['users', { page, limit }],
    queryFn: () =>
      fetch(`/api/users?page=${page}&limit=${limit}`).then((r) => r.json()),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-10 w-64 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to{' '}
          {Math.min(page * limit, data?.total || 0)} of {data?.total} results
        </p>

        <div className="flex items-center gap-4">
          <select
            value={limit}
            onChange={(e) => setPagination({ limit: parseInt(e.target.value), page: 1 })}
            className="border rounded px-2 py-1"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPagination({ page: newPage })}
          />
        </div>
      </div>
    </div>
  );
}
```

## Keyset Pagination

```typescript
// lib/keyset-pagination.ts
import { prisma } from '@/lib/db';

interface KeysetParams {
  after?: { createdAt: Date; id: string };
  before?: { createdAt: Date; id: string };
  limit: number;
}

export async function getPostsKeyset({ after, before, limit }: KeysetParams) {
  // Keyset pagination is more efficient for large datasets
  // Uses composite cursor of (createdAt, id) for stable ordering

  const where = after
    ? {
        OR: [
          { createdAt: { lt: after.createdAt } },
          {
            AND: [
              { createdAt: after.createdAt },
              { id: { lt: after.id } },
            ],
          },
        ],
      }
    : before
    ? {
        OR: [
          { createdAt: { gt: before.createdAt } },
          {
            AND: [
              { createdAt: before.createdAt },
              { id: { gt: before.id } },
            ],
          },
        ],
      }
    : {};

  const posts = await prisma.post.findMany({
    where,
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;

  return {
    items,
    pageInfo: {
      hasNextPage: hasMore,
      hasPreviousPage: !!after,
      startCursor: items[0]
        ? { createdAt: items[0].createdAt, id: items[0].id }
        : null,
      endCursor: items.length > 0
        ? {
            createdAt: items[items.length - 1].createdAt,
            id: items[items.length - 1].id,
          }
        : null,
    },
  };
}
```

## Pagination with Filters

```typescript
// app/products/page.tsx
import { prisma } from '@/lib/db';
import { ProductsGrid } from '@/components/products-grid';
import { Pagination } from '@/components/pagination';
import { Filters } from '@/components/filters';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 12;

  // Build filter conditions
  const where = {
    ...(params.category && { categoryId: params.category }),
    ...(params.minPrice || params.maxPrice
      ? {
          price: {
            ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
            ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
          },
        }
      : {}),
  };

  // Build sort order
  const orderBy = (() => {
    switch (params.sort) {
      case 'price-asc':
        return { price: 'asc' as const };
      case 'price-desc':
        return { price: 'desc' as const };
      case 'newest':
        return { createdAt: 'desc' as const };
      default:
        return { createdAt: 'desc' as const };
    }
  })();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Preserve filters in pagination URLs
  const filterParams = {
    ...(params.category && { category: params.category }),
    ...(params.minPrice && { minPrice: params.minPrice }),
    ...(params.maxPrice && { maxPrice: params.maxPrice }),
    ...(params.sort && { sort: params.sort }),
  };

  return (
    <div className="flex gap-8">
      <aside className="w-64">
        <Filters currentFilters={params} />
      </aside>

      <main className="flex-1 space-y-6">
        <p className="text-muted-foreground">
          {total} products found
        </p>

        <ProductsGrid products={products} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/products"
          searchParams={filterParams}
        />
      </main>
    </div>
  );
}
```

## Anti-patterns

### Don't Use Offset for Large Datasets

```typescript
// BAD - Offset pagination gets slower with larger offsets
const posts = await prisma.post.findMany({
  skip: 100000, // Very slow!
  take: 10,
});

// GOOD - Use cursor pagination for large datasets
const posts = await prisma.post.findMany({
  cursor: { id: lastId },
  take: 10,
});
```

### Don't Forget Total Count Caching

```typescript
// BAD - Counts on every request
const [posts, total] = await Promise.all([
  getPosts(page, limit),
  prisma.post.count(), // Expensive for large tables
]);

// GOOD - Cache count or estimate
const [posts, total] = await Promise.all([
  getPosts(page, limit),
  getCachedCount('posts'), // Cache for 5 minutes
]);
```

## Related Skills

- [url-state](./url-state.md)
- [infinite-scroll](./infinite-scroll.md)
- [filtering](./filtering.md)
- [sorting](./sorting.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Offset pagination
- Cursor pagination
- Keyset pagination
- URL state integration
- Filter preservation
