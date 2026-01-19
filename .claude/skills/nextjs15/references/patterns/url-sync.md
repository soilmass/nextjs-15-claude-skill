---
id: pt-url-sync
name: URL State Sync
version: 2.0.0
layer: L5
category: state
description: Bidirectional sync between React state and URL query parameters using nuqs
tags: [url, query-params, state, nuqs, search-params, deep-linking]
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
  - ../atoms/input-checkbox.md
  - ../molecules/badge.md
dependencies: []
formula: nuqs Parsers + URL State + React Query = Shareable Filterable UI
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# URL State Sync

Keep React state and URL query parameters in sync for shareable, bookmarkable UI state.

## When to Use

- **Filter/search pages**: Product listings, search results, data tables
- **Pagination**: Page number in URL for direct linking
- **Tab/view state**: Active tab shareable via URL
- **Sort order**: Sorting preferences bookmarkable
- **Date ranges**: Filter ranges preserved in URL

**Avoid when**: State is transient (hover, focus), state is sensitive (passwords), or URL would become too long/complex.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ URL State Sync Architecture                                 │
│                                                             │
│  URL: /products?q=laptop&category=electronics&page=2        │
│                     │            │             │            │
│  ┌──────────────────┴────────────┴─────────────┴──────────┐ │
│  │ nuqs parsers (type-safe)                               │ │
│  │  parseAsString ─── parseAsString ─── parseAsInteger    │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                │
│                            ▼                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ useProductFilters() hook                               │ │
│  │  ├─ q, category, brand[], minPrice, maxPrice, page    │ │
│  │  ├─ setFilters() ─── updates URL + state              │ │
│  │  └─ clearFilters(), toggleBrand(), setSort()          │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ SearchBar  │     │ FilterPanel  │     │ ProductGrid │   │
│  │ [Input]    │     │ [Checkbox]   │     │ Server RSC  │   │
│  │            │     │ [Slider]     │     │ re-fetches  │   │
│  │            │     │ [Badge]      │     │ on change   │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
│                                                    │        │
│                                          ┌─────────┴──────┐ │
│                                          │ URLPagination  │ │
│                                          │ [Pagination]   │ │
│                                          └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Overview

This pattern covers:
- nuqs library for type-safe URL state
- Parser definitions for complex types
- Multi-parameter coordination
- Shallow routing optimization
- Server component integration
- History management

## Implementation

### Installation

```bash
npm install nuqs
```

### Basic URL State

```typescript
// hooks/use-search-params.ts
'use client';

import {
  useQueryState,
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
  parseAsArrayOf,
  parseAsStringEnum,
  parseAsJson,
  parseAsIsoDateTime,
} from 'nuqs';

// Single parameter
export function useSearchQuery() {
  return useQueryState('q', parseAsString.withDefault(''));
}

// Single parameter with options
export function usePage() {
  return useQueryState('page', 
    parseAsInteger
      .withDefault(1)
      .withOptions({ 
        shallow: false, // Trigger server component refetch
        history: 'push', // or 'replace'
      })
  );
}

// Multiple parameters
export function useFilters() {
  return useQueryStates({
    search: parseAsString.withDefault(''),
    category: parseAsString,
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
    inStock: parseAsBoolean.withDefault(false),
    tags: parseAsArrayOf(parseAsString).withDefault([]),
  });
}
```

### Custom Parsers

```typescript
// lib/url-parsers.ts
import { createParser } from 'nuqs';

// Date range parser
export const parseAsDateRange = createParser({
  parse: (value) => {
    if (!value) return null;
    const [start, end] = value.split('_');
    return {
      start: start ? new Date(start) : null,
      end: end ? new Date(end) : null,
    };
  },
  serialize: (value) => {
    if (!value) return '';
    const start = value.start?.toISOString().split('T')[0] || '';
    const end = value.end?.toISOString().split('T')[0] || '';
    return `${start}_${end}`;
  },
});

// Sort parser
export type SortDirection = 'asc' | 'desc';
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export const parseAsSort = createParser<SortConfig>({
  parse: (value) => {
    if (!value) return null;
    const [field, direction = 'asc'] = value.split(':');
    return { 
      field, 
      direction: direction as SortDirection 
    };
  },
  serialize: (value) => {
    if (!value) return '';
    return `${value.field}:${value.direction}`;
  },
});

// Pagination parser
export interface PaginationConfig {
  page: number;
  limit: number;
}

export const parseAsPagination = createParser<PaginationConfig>({
  parse: (value) => {
    if (!value) return null;
    const [page, limit] = value.split(':').map(Number);
    return { page: page || 1, limit: limit || 10 };
  },
  serialize: (value) => {
    if (!value) return '';
    return `${value.page}:${value.limit}`;
  },
});

// JSON with validation
import { z } from 'zod';

export function createJsonParser<T>(schema: z.ZodType<T>) {
  return createParser<T>({
    parse: (value) => {
      if (!value) return null;
      try {
        const parsed = JSON.parse(value);
        return schema.parse(parsed);
      } catch {
        return null;
      }
    },
    serialize: (value) => {
      return value ? JSON.stringify(value) : '';
    },
  });
}

// Usage
const filterSchema = z.object({
  categories: z.array(z.string()),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }),
});

export const parseAsFilters = createJsonParser(filterSchema);
```

### Advanced Filter Hook

```typescript
// hooks/use-product-filters.ts
'use client';

import { useQueryStates, parseAsString, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { parseAsSort, parseAsDateRange } from '@/lib/url-parsers';
import { useCallback, useMemo } from 'react';

const sortOptions = ['price', 'name', 'date', 'rating'] as const;
type SortField = typeof sortOptions[number];

export function useProductFilters() {
  const [params, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      category: parseAsString,
      brand: parseAsArrayOf(parseAsString).withDefault([]),
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      rating: parseAsInteger,
      sort: parseAsSort.withDefault({ field: 'date', direction: 'desc' }),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(20),
      dateRange: parseAsDateRange,
    },
    {
      shallow: true,
      history: 'push',
    }
  );

  // Reset pagination when filters change
  const setFilters = useCallback(
    (updates: Partial<typeof params>) => {
      const shouldResetPage = 
        'q' in updates || 
        'category' in updates || 
        'brand' in updates ||
        'minPrice' in updates ||
        'maxPrice' in updates;

      setParams({
        ...updates,
        ...(shouldResetPage ? { page: 1 } : {}),
      });
    },
    [setParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setParams({
      q: '',
      category: null,
      brand: [],
      minPrice: null,
      maxPrice: null,
      rating: null,
      sort: { field: 'date', direction: 'desc' },
      page: 1,
      dateRange: null,
    });
  }, [setParams]);

  // Toggle brand in array
  const toggleBrand = useCallback(
    (brand: string) => {
      const current = params.brand;
      const updated = current.includes(brand)
        ? current.filter((b) => b !== brand)
        : [...current, brand];
      setFilters({ brand: updated });
    },
    [params.brand, setFilters]
  );

  // Set sort
  const setSort = useCallback(
    (field: SortField, direction?: 'asc' | 'desc') => {
      const currentDirection = 
        params.sort.field === field 
          ? params.sort.direction === 'asc' ? 'desc' : 'asc'
          : 'asc';
      setParams({ sort: { field, direction: direction ?? currentDirection } });
    },
    [params.sort, setParams]
  );

  // Computed: has active filters
  const hasActiveFilters = useMemo(() => {
    return !!(
      params.q ||
      params.category ||
      params.brand.length > 0 ||
      params.minPrice !== null ||
      params.maxPrice !== null ||
      params.rating !== null ||
      params.dateRange !== null
    );
  }, [params]);

  // Computed: active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (params.q) count++;
    if (params.category) count++;
    if (params.brand.length > 0) count += params.brand.length;
    if (params.minPrice !== null || params.maxPrice !== null) count++;
    if (params.rating !== null) count++;
    if (params.dateRange !== null) count++;
    return count;
  }, [params]);

  return {
    ...params,
    setFilters,
    clearFilters,
    toggleBrand,
    setSort,
    setPage: (page: number) => setParams({ page }),
    hasActiveFilters,
    activeFilterCount,
  };
}
```

### Server Component Integration

```typescript
// app/products/page.tsx
import { Suspense } from 'react';
import { parseAsString, parseAsInteger, parseAsArrayOf } from 'nuqs/server';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { getProducts } from '@/lib/api/products';

// Define parsers for server
const searchParamsCache = {
  q: parseAsString.withDefault(''),
  category: parseAsString,
  brand: parseAsArrayOf(parseAsString).withDefault([]),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Parse search params on server
  const filters = {
    q: searchParamsCache.q.parseServerSide(params.q as string),
    category: searchParamsCache.category.parseServerSide(params.category as string),
    brand: searchParamsCache.brand.parseServerSide(params.brand as string),
    minPrice: searchParamsCache.minPrice.parseServerSide(params.minPrice as string),
    maxPrice: searchParamsCache.maxPrice.parseServerSide(params.maxPrice as string),
    page: searchParamsCache.page.parseServerSide(params.page as string),
    limit: searchParamsCache.limit.parseServerSide(params.limit as string),
  };

  // Fetch data with filters
  const { products, total } = await getProducts({
    search: filters.q,
    category: filters.category ?? undefined,
    brands: filters.brand,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar - Client Component */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<FiltersSkeleton />}>
            <ProductFilters />
          </Suspense>
        </aside>

        {/* Products grid */}
        <main className="lg:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            {total} products found
          </div>

          <ProductGrid products={products} />

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return <div className="h-96 bg-muted animate-pulse rounded-lg" />;
}
```

### Filter Component with URL Sync

```typescript
// components/products/product-filters.tsx
'use client';

import { useProductFilters } from '@/hooks/use-product-filters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const BRANDS = ['Apple', 'Samsung', 'Sony', 'LG', 'Dell'];
const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Sports'];

export function ProductFilters() {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    setFilters,
    clearFilters,
    toggleBrand,
    hasActiveFilters,
    activeFilterCount,
  } = useProductFilters();

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search products..."
          value={q}
          onChange={(e) => setFilters({ q: e.target.value })}
        />
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {q && (
            <Badge variant="secondary" className="gap-1">
              Search: {q}
              <button onClick={() => setFilters({ q: '' })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="gap-1">
              {category}
              <button onClick={() => setFilters({ category: null })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {brand.map((b) => (
            <Badge key={b} variant="secondary" className="gap-1">
              {b}
              <button onClick={() => toggleBrand(b)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all ({activeFilterCount})
          </Button>
        </div>
      )}

      <Accordion type="multiple" defaultValue={['category', 'brand', 'price']}>
        {/* Category */}
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat}
                    onChange={() => setFilters({ category: cat })}
                    className="rounded"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand */}
        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {BRANDS.map((b) => (
                <label
                  key={b}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={brand.includes(b)}
                    onCheckedChange={() => toggleBrand(b)}
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[minPrice ?? 0, maxPrice ?? 1000]}
                onValueChange={([min, max]) =>
                  setFilters({ minPrice: min, maxPrice: max })
                }
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice ?? ''}
                  onChange={(e) =>
                    setFilters({ minPrice: e.target.value ? Number(e.target.value) : null })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice ?? ''}
                  onChange={(e) =>
                    setFilters({ maxPrice: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

### Pagination with URL Sync

```typescript
// components/ui/url-pagination.tsx
'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface URLPaginationProps {
  totalPages: number;
  shallow?: boolean;
}

export function URLPagination({ totalPages, shallow = true }: URLPaginationProps) {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow, history: 'push' })
  );

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    
    if (page > 3) pages.push('ellipsis');
    
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    
    if (page < totalPages - 2) pages.push('ellipsis');
    
    pages.push(totalPages);
    
    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage(Math.max(1, page - 1))}
            className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {getPageNumbers().map((pageNum, i) =>
          pageNum === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNum}>
              <PaginationLink
                onClick={() => setPage(pageNum)}
                isActive={page === pageNum}
                className="cursor-pointer"
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

## Variants

### With React Query

```typescript
// hooks/use-products-with-url.ts
import { useQueryStates } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { searchParamsCache } from '@/lib/url-parsers';

export function useProducts() {
  const [params] = useQueryStates(searchParamsCache);

  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetch(`/api/products?${new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    )}`).then(r => r.json()),
  });
}
```

## Anti-patterns

1. **Too many URL params** - Keep URLs readable, use JSON for complex state
2. **Not encoding values** - Use parsers that handle encoding
3. **Ignoring history** - Consider when to push vs replace
4. **Server/client mismatch** - Use same parsers on both sides
5. **No defaults** - Always provide sensible defaults

## Related Skills

- [[url-state]] - Basic URL state management
- [[search]] - Search implementation
- [[filtering]] - Filter patterns
- [[pagination]] - Pagination patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial URL state sync pattern with nuqs and custom parsers
