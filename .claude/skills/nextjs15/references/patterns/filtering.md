---
id: pt-filtering
name: Data Filtering
version: 2.1.0
layer: L5
category: data
description: Implement URL-synced filters with faceted search and dynamic options
tags: [data, filtering, url-state, faceted-search, next15, react19]
composes:
  - ../atoms/input-checkbox.md
  - ../atoms/input-slider.md
  - ../atoms/display-badge.md
  - ../molecules/accordion-item.md
  - ../molecules/range-slider.md
  - ../organisms/sidebar.md
dependencies: []
formula: "Filtering = URLSearchParams + Checkbox(a-input-checkbox) + Slider(m-range-slider) + Badge(a-display-badge) + Accordion"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Data Filtering

## Overview

Filtering allows users to narrow down results based on specific criteria. This pattern covers URL-synced filters, faceted search with counts, dynamic filter options, and filter persistence across sessions.

## When to Use

- E-commerce product filtering (price, category, brand)
- Search results refinement
- Data tables with column filters
- Content libraries with faceted navigation
- Any list that benefits from user-controlled narrowing

## Composition Diagram

```
+------------------------------------------+
|              Filters Panel               |
|  +------------------------------------+  |
|  |           Accordion               |  |
|  | +--------+  +--------+  +-------+ |  |
|  | |Category|  | Brand  |  | Price | |  |
|  | |Checkbox|  |Checkbox|  |Slider | |  |
|  | +--------+  +--------+  +-------+ |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |          Active Filters           |  |
|  | [Badge X] [Badge X] [Clear All]   |  |
|  +------------------------------------+  |
+------------------------------------------+
           |
           v URL State (searchParams)
           |
+------------------------------------------+
|            Server Component              |
|  Prisma Query with WHERE conditions     |
+------------------------------------------+
```

## Server Component Filters

```typescript
// app/products/page.tsx
import { prisma } from '@/lib/db';
import { ProductsGrid } from '@/components/products-grid';
import { FiltersPanel } from '@/components/filters-panel';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    rating?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Normalize array parameters
  const brands = Array.isArray(params.brand)
    ? params.brand
    : params.brand
    ? [params.brand]
    : [];

  // Build filter conditions
  const where = {
    ...(params.category && { categoryId: params.category }),
    ...(brands.length > 0 && { brandId: { in: brands } }),
    ...(params.minPrice || params.maxPrice
      ? {
          price: {
            ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
            ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
          },
        }
      : {}),
    ...(params.inStock === 'true' && { stock: { gt: 0 } }),
    ...(params.rating && { rating: { gte: parseFloat(params.rating) } }),
  };

  // Get products and filter options in parallel
  const [products, filterOptions] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: getSortOrder(params.sort),
      take: 50,
      include: { category: true, brand: true },
    }),
    getFilterOptions(params.category),
  ]);

  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0">
        <FiltersPanel
          options={filterOptions}
          currentFilters={params}
        />
      </aside>
      <main className="flex-1">
        <ProductsGrid products={products} />
      </main>
    </div>
  );
}

// Get dynamic filter options with counts
async function getFilterOptions(categoryId?: string) {
  const [categories, brands, priceRange, ratings] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.brand.findMany({
      where: categoryId ? { products: { some: { categoryId } } } : {},
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: categoryId ? { where: { categoryId } } : true,
          },
        },
      },
    }),
    prisma.product.aggregate({
      where: categoryId ? { categoryId } : {},
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.$queryRaw`
      SELECT FLOOR(rating) as rating, COUNT(*) as count
      FROM products
      ${categoryId ? Prisma.sql`WHERE category_id = ${categoryId}` : Prisma.empty}
      GROUP BY FLOOR(rating)
      ORDER BY rating DESC
    `,
  ]);

  return { categories, brands, priceRange, ratings };
}

function getSortOrder(sort?: string) {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' as const };
    case 'price-desc':
      return { price: 'desc' as const };
    case 'rating':
      return { rating: 'desc' as const };
    case 'newest':
      return { createdAt: 'desc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
}
```

## Filters Panel Component

```typescript
// components/filters-panel.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2 } from 'lucide-react';

interface FilterOptions {
  categories: { id: string; name: string; _count: { products: number } }[];
  brands: { id: string; name: string; _count: { products: number } }[];
  priceRange: { _min: { price: number }; _max: { price: number } };
  ratings: { rating: number; count: number }[];
}

interface FiltersPanelProps {
  options: FilterOptions;
  currentFilters: Record<string, string | string[] | undefined>;
}

export function FiltersPanel({ options, currentFilters }: FiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      // Reset page when filters change
      params.delete('page');
      
      return params.toString();
    },
    [searchParams]
  );

  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(updates)}`);
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    updateFilters({
      category: currentFilters.category === categoryId ? null : categoryId,
    });
  };

  const handleBrandToggle = (brandId: string, checked: boolean) => {
    const currentBrands = Array.isArray(currentFilters.brand)
      ? currentFilters.brand
      : currentFilters.brand
      ? [currentFilters.brand]
      : [];

    const newBrands = checked
      ? [...currentBrands, brandId]
      : currentBrands.filter((b) => b !== brandId);

    updateFilters({ brand: newBrands });
  };

  const handlePriceChange = (range: [number, number]) => {
    updateFilters({
      minPrice: String(range[0]),
      maxPrice: String(range[1]),
    });
  };

  const handleRatingChange = (rating: number) => {
    updateFilters({
      rating: currentFilters.rating === String(rating) ? null : String(rating),
    });
  };

  const handleInStockChange = (checked: boolean) => {
    updateFilters({ inStock: checked ? 'true' : null });
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  const activeFilterCount = Object.values(currentFilters).filter(
    (v) => v !== undefined && v !== ''
  ).length;

  const currentBrands = Array.isArray(currentFilters.brand)
    ? currentFilters.brand
    : currentFilters.brand
    ? [currentFilters.brand]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          Filters
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={['category', 'brand', 'price']}>
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {options.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex w-full items-center justify-between px-2 py-1 rounded hover:bg-accent ${
                    currentFilters.category === cat.id ? 'bg-accent' : ''
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {cat._count.products}
                  </span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {options.brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={currentBrands.includes(brand.id)}
                    onCheckedChange={(checked) =>
                      handleBrandToggle(brand.id, !!checked)
                    }
                  />
                  <span className="flex-1">{brand.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {brand._count.products}
                  </span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-2">
              <Slider
                defaultValue={[
                  Number(currentFilters.minPrice) || options.priceRange._min.price,
                  Number(currentFilters.maxPrice) || options.priceRange._max.price,
                ]}
                min={options.priceRange._min.price}
                max={options.priceRange._max.price}
                step={10}
                onValueCommit={handlePriceChange}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${currentFilters.minPrice || options.priceRange._min.price}</span>
                <span>${currentFilters.maxPrice || options.priceRange._max.price}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter */}
        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`flex w-full items-center gap-2 px-2 py-1 rounded hover:bg-accent ${
                    currentFilters.rating === String(rating) ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">& up</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* In Stock Filter */}
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={currentFilters.inStock === 'true'}
                onCheckedChange={handleInStockChange}
              />
              <span>In Stock Only</span>
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

## Active Filters Display

```typescript
// components/active-filters.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ActiveFilter {
  key: string;
  value: string;
  label: string;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
}

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (filters.length === 0) return null;

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    // Handle array params (like brand)
    const values = params.getAll(key);
    if (values.length > 1) {
      params.delete(key);
      values.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {filters.map((filter) => (
        <Badge
          key={`${filter.key}-${filter.value}`}
          variant="secondary"
          className="gap-1"
        >
          {filter.label}
          <button
            onClick={() => removeFilter(filter.key, filter.value)}
            className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <button
        onClick={clearAll}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  );
}
```

## nuqs Integration

```typescript
// hooks/use-product-filters.ts
'use client';

import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsBoolean,
  useQueryStates,
} from 'nuqs';

export function useProductFilters() {
  return useQueryStates({
    category: parseAsString,
    brand: parseAsArrayOf(parseAsString).withDefault([]),
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
    inStock: parseAsBoolean.withDefault(false),
    rating: parseAsInteger,
    sort: parseAsString.withDefault('newest'),
    page: parseAsInteger.withDefault(1),
  });
}

// Usage in component
// components/filter-controls.tsx
'use client';

import { useProductFilters } from '@/hooks/use-product-filters';

export function FilterControls() {
  const [filters, setFilters] = useProductFilters();

  return (
    <div>
      <button onClick={() => setFilters({ category: 'electronics', page: 1 })}>
        Electronics
      </button>
      <button onClick={() => setFilters({ 
        brand: [...filters.brand, 'apple'],
        page: 1 
      })}>
        Add Apple
      </button>
      <button onClick={() => setFilters({ minPrice: 100, maxPrice: 500 })}>
        $100 - $500
      </button>
    </div>
  );
}
```

## Anti-patterns

### Don't Reset Unrelated Filters

```typescript
// BAD - Resets all filters when changing one
const handleCategoryChange = (category: string) => {
  router.push(`/products?category=${category}`); // Loses other filters!
};

// GOOD - Preserve existing filters
const handleCategoryChange = (category: string) => {
  const params = new URLSearchParams(searchParams);
  params.set('category', category);
  params.delete('page'); // Only reset pagination
  router.push(`/products?${params.toString()}`);
};
```

### Don't Forget URL Encoding

```typescript
// BAD - Breaks with special characters
const params = new URLSearchParams();
params.set('q', 'shoes & boots'); // May cause issues

// GOOD - URLSearchParams handles encoding
const params = new URLSearchParams();
params.set('q', 'shoes & boots'); // Properly encoded
```

## Related Skills

- [url-state](./url-state.md)
- [search](./search.md)
- [pagination](./pagination.md)
- [sorting](./sorting.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Faceted search with counts
- Multi-select filters
- Range filters
- Active filters display
- nuqs integration
