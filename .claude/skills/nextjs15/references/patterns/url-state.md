---
id: pt-url-state
name: URL State Management
version: 2.1.0
layer: L5
category: data
description: Type-safe URL search params state management with nuqs
tags: [data, state, url, search-params, nuqs, next15]
composes:
  - ../atoms/input-text.md
  - ../atoms/input-checkbox.md
  - ../atoms/input-slider.md
  - ../atoms/input-select.md
  - ../molecules/tabs.md
  - ../organisms/data-table.md
  - ../organisms/sidebar.md
dependencies: []
formula: "URLState = nuqs + useQueryState + Input(a-input-text) + Select(a-input-select) + Tabs(m-tabs)"
breaking_changes: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# URL State Management

## Overview

URL state management stores application state in the URL search params, enabling shareable links, browser history support, and server-side rendering. In Next.js 15, `searchParams` is now a Promise that must be awaited.

## When to Use

- Filter/sort state that should be shareable
- Tab/modal state that needs back button support
- Search queries
- Pagination state
- Any state users might want to bookmark

## Composition Diagram

```
+------------------------------------------+
|            URL State Pattern             |
|  +------------------------------------+  |
|  |  useQueryState('filter', parser)  |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  URL Update (?filter=value)       |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  Server Component (searchParams)  |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  Data Fetching with params        |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Next.js 15 Breaking Change

```typescript
// BEFORE (Next.js 14) - DEPRECATED
export default function Page({ searchParams }) {
  const query = searchParams.q;  // Direct access
}

// AFTER (Next.js 15) - REQUIRED
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;  // Must await
}
```

## Setup with nuqs

```typescript
// app/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

## Basic Usage

```typescript
// hooks/use-search-params.ts
'use client';

import { parseAsString, parseAsInteger, useQueryState } from 'nuqs';

// Single param
export function useSearchQuery() {
  return useQueryState('q', parseAsString.withDefault(''));
}

// Multiple params
export function useSearchFilters() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('newest'));
  
  return {
    query,
    setQuery,
    page,
    setPage,
    sort,
    setSort,
    reset: () => {
      setQuery(null);
      setPage(null);
      setSort(null);
    },
  };
}

// components/search-input.tsx
'use client';

import { useSearchQuery } from '@/hooks/use-search-params';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

export function SearchInput() {
  const [query, setQuery] = useSearchQuery();

  const handleSearch = useDebouncedCallback((value: string) => {
    setQuery(value || null);  // null removes from URL
  }, 300);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        defaultValue={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
```

## useQueryStates for Multiple Params

```typescript
// hooks/use-table-params.ts
'use client';

import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';

const sortOptions = ['newest', 'oldest', 'price-asc', 'price-desc'] as const;

export function useTableParams() {
  return useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
    sort: parseAsStringEnum(sortOptions).withDefault('newest'),
    search: parseAsString.withDefault(''),
    category: parseAsString,
    status: parseAsString,
  });
}

// components/products-table.tsx
'use client';

import { useTableParams } from '@/hooks/use-table-params';
import { DataTable } from '@/components/organisms/data-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProductsTable({ products }: { products: Product[] }) {
  const [params, setParams] = useTableParams();

  const handleSearch = (value: string) => {
    setParams({ search: value, page: 1 });  // Reset to page 1 on search
  };

  const handleSort = (sort: string) => {
    setParams({ sort: sort as any });
  };

  const handlePageChange = (page: number) => {
    setParams({ page });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={params.search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select value={params.sort} onValueChange={handleSort}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={products}
        pagination={{
          page: params.page,
          limit: params.limit,
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
}
```

## Custom Parsers

```typescript
// lib/parsers.ts
import { createParser } from 'nuqs';

// Date parser
export const parseAsDate = createParser({
  parse: (value) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },
  serialize: (value) => value.toISOString().split('T')[0],
});

// Array parser (comma-separated)
export const parseAsArray = createParser({
  parse: (value) => value.split(',').filter(Boolean),
  serialize: (value) => value.join(','),
});

// JSON parser
export function parseAsJson<T>() {
  return createParser({
    parse: (value) => {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
  });
}

// Usage
import { parseAsDate, parseAsArray } from '@/lib/parsers';

function DateFilter() {
  const [startDate, setStartDate] = useQueryState('start', parseAsDate);
  const [categories, setCategories] = useQueryState('categories', parseAsArray);
  
  return (
    <div>
      <DatePicker
        value={startDate}
        onChange={setStartDate}
      />
      <MultiSelect
        value={categories || []}
        onChange={(values) => setCategories(values.length ? values : null)}
      />
    </div>
  );
}
```

## Server-Side Access

```typescript
// app/products/page.tsx
import { searchParamsCache } from '@/lib/search-params';
import { ProductGrid } from '@/components/product-grid';
import { getProducts } from '@/lib/products';

// Define the search params schema
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sort: parseAsString.withDefault('newest'),
  search: parseAsString,
  category: parseAsString,
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Parse and validate search params
  const { page, limit, sort, search, category } = searchParamsCache.parse(
    await searchParams
  );

  // Fetch products with parsed params
  const products = await getProducts({
    page,
    limit,
    sort,
    search: search || undefined,
    category: category || undefined,
  });

  return <ProductGrid products={products} />;
}
```

## Filter UI Pattern

```typescript
// components/filters.tsx
'use client';

import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

const categories = ['electronics', 'clothing', 'home', 'sports'];
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

export function ProductFilters() {
  const [filters, setFilters] = useQueryStates({
    categories: parseAsArrayOf(parseAsString).withDefault([]),
    sizes: parseAsArrayOf(parseAsString).withDefault([]),
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
    inStock: parseAsString,
  });

  const toggleCategory = (category: string) => {
    const current = filters.categories;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    setFilters({ categories: updated.length ? updated : null });
  };

  const clearFilters = () => {
    setFilters({
      categories: null,
      sizes: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
    });
  };

  const hasFilters =
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <aside className="w-64 space-y-6">
      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          Clear all filters
        </Button>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2">
              <Checkbox
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <span className="capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={[filters.minPrice || 0, filters.maxPrice || 1000]}
          onValueChange={([min, max]) => {
            setFilters({
              minPrice: min > 0 ? min : null,
              maxPrice: max < 1000 ? max : null,
            });
          }}
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>${filters.minPrice || 0}</span>
          <span>${filters.maxPrice || 1000}</span>
        </div>
      </div>
    </aside>
  );
}
```

## Tab State in URL

```typescript
// components/tabs-with-url.tsx
'use client';

import { useQueryState, parseAsStringEnum } from 'nuqs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = ['overview', 'analytics', 'reports', 'settings'] as const;

export function DashboardTabs() {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum(tabs).withDefault('overview')
  );

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tabs[number])}>
      <TabsList>
        {tabs.map((t) => (
          <TabsTrigger key={t} value={t} className="capitalize">
            {t}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>
      <TabsContent value="analytics">
        <AnalyticsTab />
      </TabsContent>
      {/* ... */}
    </Tabs>
  );
}
```

## Modal State in URL

```typescript
// components/product-modal.tsx
'use client';

import { useQueryState, parseAsString } from 'nuqs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ProductDetail } from '@/components/product-detail';

export function ProductModal() {
  const [productId, setProductId] = useQueryState('product', parseAsString);

  const isOpen = !!productId;

  const handleClose = () => {
    setProductId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl">
        {productId && <ProductDetail id={productId} />}
      </DialogContent>
    </Dialog>
  );
}

// Trigger from anywhere
function ProductCard({ product }) {
  const [, setProductId] = useQueryState('product', parseAsString);

  return (
    <button onClick={() => setProductId(product.id)}>
      View Details
    </button>
  );
}
```

## History Options

```typescript
// Push (default) - adds to history stack
const [query, setQuery] = useQueryState('q');
setQuery('search'); // Creates new history entry

// Replace - replaces current history entry
setQuery('search', { history: 'replace' });

// Shallow - no history entry, but updates URL
setQuery('search', { shallow: true });

// Scroll - control scroll behavior
setQuery('search', { scroll: false });
```

## Anti-patterns

### Don't Store Sensitive Data

```typescript
// BAD - Sensitive data in URL
?userId=123&token=abc123

// GOOD - Use cookies/session for sensitive data
```

### Don't Over-Store State

```typescript
// BAD - Every UI state in URL
?isDropdownOpen=true&scrollPosition=500

// GOOD - Only shareable/bookmarkable state
?category=electronics&page=2
```

## Related Skills

- [server-components-data](./server-components-data.md)
- [react-query](./react-query.md)
- [dynamic-routes](./dynamic-routes.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- nuqs integration
- Custom parsers
- Server-side access
