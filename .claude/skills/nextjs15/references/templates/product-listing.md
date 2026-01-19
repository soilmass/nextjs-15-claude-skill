---
id: t-product-listing
name: Product Listing
version: 2.0.0
layer: L4
category: pages
description: E-commerce product listing with filters, sorting, and grid/list views
tags: [page, products, catalog, ecommerce, shop, listing]
formula: "ProductListing = ProductCard(o-product-card) + Sidebar(o-sidebar) + Pagination(m-pagination) + Tabs(m-tabs)"
composes:
  - ../organisms/product-card.md
  - ../molecules/pagination.md
  - ../molecules/tabs.md
  - ../organisms/sidebar.md
dependencies: [nuqs]
performance:
  impact: high
  lcp: high
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Product Listing

## Overview

The Product Listing template provides a complete product catalog page. Features faceted filtering, sorting, view modes (grid/list), and pagination. Designed for e-commerce with URL-synced state for shareability and SEO.

## When to Use

Use this skill when:
- Building product catalog pages
- Creating category pages
- Building search results pages
- Creating filtered listings

## Composition Diagram

```
+------------------------------------------------------------------------+
|                         ProductListing                                  |
+------------------------------------------------------------------------+
|  [Page Title: Products]                                                 |
|  [X products found]                                                     |
|                                                                         |
|  +----------------+  +------------------------------------------------+ |
|  | Sidebar        |  |                  Products Area                 | |
|  | (o-sidebar)    |  |  +--------------------------------------------+| |
|  |                |  |  |  Toolbar                                   || |
|  | [Filters]      |  |  |  [Mobile Filter] [Active Filters]          || |
|  | [Clear all]    |  |  |                    [Sort v] [Grid/List]    || |
|  |                |  |  +--------------------------------------------+| |
|  | > Category     |  |                                                | |
|  |   [ ] Cat 1    |  |  +--------------------------------------------+| |
|  |   [ ] Cat 2    |  |  |  ProductGrid (o-product-card)              || |
|  |                |  |  |  +--------+ +--------+ +--------+ +--------+| |
|  | > Brand        |  |  |  | Card   | | Card   | | Card   | | Card   || |
|  |   [ ] Brand 1  |  |  |  +--------+ +--------+ +--------+ +--------+| |
|  |   [ ] Brand 2  |  |  |  +--------+ +--------+ +--------+ +--------+| |
|  |                |  |  |  | Card   | | Card   | | Card   | | Card   || |
|  | > Price        |  |  |  +--------+ +--------+ +--------+ +--------+| |
|  |   [----o----]  |  |  +--------------------------------------------+| |
|  |   $0 - $1000+  |  |                                                | |
|  +----------------+  |  +--------------------------------------------+| |
|                      |  |  Pagination (m-pagination)                 || |
|                      |  |  [<] [1] [2] [3] ... [10] [>]              || |
|                      |  +--------------------------------------------+| |
|                      +------------------------------------------------+ |
+------------------------------------------------------------------------+
```

## Organisms Used

- [product-card](../organisms/product-card.md) - Product display
- [sheet](../organisms/sheet.md) - Mobile filters
- [data-table](../organisms/data-table.md) - Pagination

## Implementation

```typescript
// app/(shop)/products/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { getProducts, getCategories, getBrands } from "@/lib/products";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductFilters } from "@/components/shop/product-filters";
import { ProductSort } from "@/components/shop/product-sort";
import { ProductViewToggle } from "@/components/shop/product-view-toggle";
import { ActiveFilters } from "@/components/shop/active-filters";
import { ProductPagination } from "@/components/shop/product-pagination";
import { FilterSheet } from "@/components/organisms/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our collection of products",
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    view?: string;
    category?: string | string[];
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    q?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  const page = parseInt(params.page || "1");
  const sort = params.sort || "featured";
  const view = params.view || "grid";
  
  // Parse array filters
  const categories = Array.isArray(params.category)
    ? params.category
    : params.category
    ? [params.category]
    : [];
  const brands = Array.isArray(params.brand)
    ? params.brand
    : params.brand
    ? [params.brand]
    : [];
  
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const search = params.q;

  // Fetch data
  const [productsData, allCategories, allBrands] = await Promise.all([
    getProducts({
      page,
      limit: 24,
      sort,
      categories,
      brands,
      minPrice,
      maxPrice,
      search,
    }),
    getCategories(),
    getBrands(),
  ]);

  const { products, totalProducts, totalPages } = productsData;

  const hasActiveFilters =
    categories.length > 0 ||
    brands.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Products</h1>
        <p className="text-muted-foreground">
          {totalProducts} products found
          {search && ` for "${search}"`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            categories={allCategories}
            brands={allBrands}
            selectedCategories={categories}
            selectedBrands={brands}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </aside>

        {/* Products Area */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <FilterSheet
                title="Filters"
                filters={[
                  {
                    id: "category",
                    label: "Category",
                    type: "checkbox",
                    options: allCategories.map((c) => ({
                      value: c.slug,
                      label: c.name,
                    })),
                  },
                  {
                    id: "brand",
                    label: "Brand",
                    type: "checkbox",
                    options: allBrands.map((b) => ({
                      value: b.slug,
                      label: b.name,
                    })),
                  },
                  {
                    id: "price",
                    label: "Price Range",
                    type: "range",
                    min: 0,
                    max: 1000,
                  },
                ]}
                values={{
                  category: categories,
                  brand: brands,
                  price: maxPrice,
                }}
                onChange={() => {}}
                trigger={
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 text-xs">
                        {categories.length + brands.length + (minPrice || maxPrice ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                }
              />
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <ActiveFilters
                categories={categories.map(
                  (c) => allCategories.find((cat) => cat.slug === c)?.name || c
                )}
                brands={brands.map(
                  (b) => allBrands.find((br) => br.slug === b)?.name || b
                )}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            )}

            <div className="flex items-center gap-4 ml-auto">
              {/* Sort */}
              <ProductSort currentSort={sort} />

              {/* View Toggle */}
              <ProductViewToggle currentView={view} />
            </div>
          </div>

          {/* Products Grid/List */}
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            }
          >
            <ProductGrid products={products} view={view} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <ProductPagination
              currentPage={page}
              totalPages={totalPages}
              className="mt-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

### Product Filters Component

```typescript
// components/shop/product-filters.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Category {
  slug: string;
  name: string;
  count: number;
}

interface Brand {
  slug: string;
  name: string;
  count: number;
}

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  selectedCategories: string[];
  selectedBrands: string[];
  minPrice?: number;
  maxPrice?: number;
}

export function ProductFilters({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  minPrice,
  maxPrice,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);
        if (value === null) return;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      params.delete("page");

      return params.toString();
    },
    [searchParams]
  );

  const toggleFilter = (key: string, value: string, current: string[]) => {
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    router.push(
      pathname + "?" + createQueryString({ [key]: newValues.length > 0 ? newValues : null }),
      { scroll: false }
    );
  };

  const updatePriceRange = (min: number, max: number) => {
    router.push(
      pathname +
        "?" +
        createQueryString({
          minPrice: min > 0 ? min.toString() : null,
          maxPrice: max < 1000 ? max.toString() : null,
        }),
      { scroll: false }
    );
  };

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["category", "brand", "price"]}>
        {/* Categories */}
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.slug} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category.slug}`}
                    checked={selectedCategories.includes(category.slug)}
                    onCheckedChange={() =>
                      toggleFilter("category", category.slug, selectedCategories)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.slug}`}
                    className="flex-1 cursor-pointer"
                  >
                    {category.name}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    ({category.count})
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {brands.map((brand) => (
                <div key={brand.slug} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${brand.slug}`}
                    checked={selectedBrands.includes(brand.slug)}
                    onCheckedChange={() =>
                      toggleFilter("brand", brand.slug, selectedBrands)
                    }
                  />
                  <Label
                    htmlFor={`brand-${brand.slug}`}
                    className="flex-1 cursor-pointer"
                  >
                    {brand.name}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    ({brand.count})
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[minPrice ?? 0, maxPrice ?? 1000]}
                onValueChange={([min, max]) => updatePriceRange(min, max)}
              />
              <div className="flex items-center justify-between text-sm">
                <span>${minPrice ?? 0}</span>
                <span>${maxPrice ?? 1000}+</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

## Key Implementation Notes

1. **URL State**: Filters synced to URL for SEO/sharing
2. **Faceted Filtering**: Multiple filter types
3. **Mobile Filters**: Sheet-based on mobile
4. **View Modes**: Grid and list options
5. **Pagination**: URL-based pagination

## Variants

### Category Page

```tsx
// app/(shop)/category/[slug]/page.tsx
export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  return (
    <>
      <CategoryHeader category={category} />
      <ProductListing
        defaultFilters={{ category: [slug] }}
        hideCategory
      />
    </>
  );
}
```

### Search Results

```tsx
// app/(shop)/search/page.tsx
export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams;
  
  return (
    <>
      <h1>Search results for "{q}"</h1>
      <ProductListing
        defaultFilters={{ search: q }}
        showRelevanceSort
      />
    </>
  );
}
```

## Performance

### Data Fetching

- Dynamic rendering for filters
- Consider edge caching
- Paginated queries

### Image Optimization

- Lazy load product images
- Responsive image sizes
- Blur placeholders

## Accessibility

### Required Features

- Filter checkboxes labeled
- Price slider accessible
- Results count announced
- Pagination navigable

### Screen Reader

- Filter changes announced
- Product count updated
- View mode communicated

## Error States

### Product Listing Error Boundary

```tsx
// app/products/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Products page error:', error);
  }, [error]);

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Unable to load products</h1>
        <p className="mt-2 text-muted-foreground">
          We encountered an error while loading the product catalog. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Empty State

```tsx
// components/shop/empty-products.tsx
import { Package, Search, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyProductsProps {
  hasFilters?: boolean;
  searchQuery?: string;
  onClearFilters?: () => void;
}

export function EmptyProducts({ hasFilters, searchQuery, onClearFilters }: EmptyProductsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {searchQuery ? (
          <Search className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Package className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <h3 className="text-lg font-semibold">No products found</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {searchQuery
          ? `No products match "${searchQuery}". Try a different search term.`
          : hasFilters
          ? 'No products match your current filters. Try adjusting or clearing them.'
          : 'No products are currently available in this category.'}
      </p>

      <div className="mt-6 flex gap-3">
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        )}
        <Button asChild>
          <Link href="/products">View all products</Link>
        </Button>
      </div>
    </div>
  );
}
```

### Filter Error State

```tsx
// components/shop/filter-error.tsx
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FilterErrorProps {
  onRetry: () => void;
}

export function FilterError({ onRetry }: FilterErrorProps) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Failed to load filters</span>
      </div>
      <button
        onClick={onRetry}
        className="mt-2 flex items-center gap-1 text-xs text-destructive hover:underline"
      >
        <RefreshCw className="h-3 w-3" />
        Try again
      </button>
    </div>
  );
}
```

## Loading States

### Product Listing Loading

```tsx
// app/products/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-32 mt-2" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar Skeleton - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          {[1, 2, 3].map((section) => (
            <div key={section} className="space-y-3">
              <Skeleton className="h-6 w-24" />
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ))}
        </aside>

        {/* Products Area */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Skeleton className="h-9 w-24 lg:hidden" />
            <div className="flex items-center gap-4 ml-auto">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            <Skeleton className="h-10 w-10" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-10" />
            ))}
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}
```

### Inline Filter Loading

```tsx
// components/shop/product-grid-loading.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridLoadingProps {
  count?: number;
  showSpinner?: boolean;
}

export function ProductGridLoading({ count = 8, showSpinner = false }: ProductGridLoadingProps) {
  if (showSpinner) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 animate-pulse">
          <div className="aspect-square rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-5 w-16 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Suspense Boundaries

```tsx
// app/products/page.tsx with granular Suspense
import { Suspense } from 'react';

export default async function ProductsPage({ searchParams }) {
  return (
    <div className="container py-8">
      <ProductsHeader />

      <div className="flex gap-8">
        {/* Filters with Suspense */}
        <aside className="hidden lg:block w-64">
          <Suspense fallback={<FiltersSkeleton />}>
            <ProductFilters />
          </Suspense>
        </aside>

        <div className="flex-1">
          <ProductToolbar />

          {/* Grid with Suspense */}
          <Suspense
            key={JSON.stringify(searchParams)}
            fallback={<ProductGridLoading count={12} />}
          >
            <ProductGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Product Grid

```tsx
// components/shop/product-grid-responsive.tsx
'use client';

import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';

interface ProductGridResponsiveProps {
  products: Product[];
  view: 'grid' | 'list';
}

export function ProductGridResponsive({ products, view }: ProductGridResponsiveProps) {
  return (
    <div
      className={cn(
        view === 'grid'
          ? 'grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4'
          : 'flex flex-col gap-4'
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={view === 'list' ? 'horizontal' : 'vertical'}
        />
      ))}
    </div>
  );
}
```

### Mobile Filter Sheet

```tsx
// components/shop/mobile-filter-sheet.tsx
'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileFilterSheetProps {
  filters: FilterConfig[];
  activeFilters: Record<string, string[]>;
  onApply: (filters: Record<string, string[]>) => void;
  onClear: () => void;
}

export function MobileFilterSheet({ filters, activeFilters, onApply, onClear }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(activeFilters);

  const activeCount = Object.values(activeFilters).flat().length;

  const handleApply = () => {
    onApply(tempFilters);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Filter sections */}
          {filters.map((filter) => (
            <div key={filter.id} className="border-b py-4">
              <h3 className="font-medium mb-3">{filter.label}</h3>
              <div className="space-y-2">
                {filter.options.map((option) => {
                  const isSelected = tempFilters[filter.id]?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTempFilters((prev) => ({
                          ...prev,
                          [filter.id]: isSelected
                            ? prev[filter.id]?.filter((v) => v !== option.value) || []
                            : [...(prev[filter.id] || []), option.value],
                        }));
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors',
                        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <Button onClick={handleApply} className="w-full" size="lg">
            Show results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### Mobile Breakpoints Reference

```tsx
// Product listing responsive patterns:
//
// Mobile (< 1024px):
// - 2-column product grid (grid-cols-2)
// - Bottom sheet for filters (SheetContent side="bottom")
// - Sticky toolbar with filter/sort
// - Horizontal scroll for active filter chips
// - Simplified pagination (prev/next only)
//
// Tablet (768px - 1024px):
// - 3-column product grid (md:grid-cols-3)
// - Larger product cards
// - More visible filter options
//
// Desktop (>= 1024px):
// - 4-column product grid (lg:grid-cols-4)
// - Sidebar filters visible (hidden lg:block)
// - Full pagination with page numbers
// - View toggle (grid/list)
//
// Key responsive classes:
// - hidden lg:block - Desktop sidebar
// - lg:hidden - Mobile filter button
// - grid-cols-2 md:grid-cols-3 lg:grid-cols-4 - Responsive grid
// - gap-4 sm:gap-6 - Responsive spacing
```

## Related Skills

### Uses Layout
- Shop layout

### Related Pages
- [product-detail](./product-detail.md)
- [cart-page](./cart-page.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Faceted filtering
- URL state sync
- View mode toggle
