---
id: pt-product-listings
name: Product Listings
version: 1.0.0
layer: L5
category: commerce
description: Display product catalogs with filtering, sorting, and grid/list views
tags: [commerce, products, catalog, filtering, next15, react19]
composes:
  - ../atoms/display-image.md
  - ../atoms/display-badge.md
dependencies: []
formula: "ProductListings = ProductGrid + Filters + Sorting + ViewToggle + Pagination"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Product Listings

## Overview

Product listings display catalogs of items with filtering, sorting, and multiple view options. This pattern covers server-side data fetching with client-side interactivity.

## When to Use

- E-commerce product catalogs
- Service listings
- Portfolio galleries
- Any catalog-style display

## Product Grid Page

```typescript
// app/products/page.tsx
import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { ProductGrid } from '@/components/product-grid';
import { ProductFilters } from '@/components/product-filters';
import { ProductSort } from '@/components/product-sort';
import { Pagination } from '@/components/pagination';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 12;

  const where = {
    status: 'ACTIVE' as const,
    ...(params.category && { categoryId: params.category }),
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: 'insensitive' as const } },
        { description: { contains: params.q, mode: 'insensitive' as const } },
      ],
    }),
    ...((params.minPrice || params.maxPrice) && {
      price: {
        ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
        ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
      },
    }),
  };

  const orderBy = (() => {
    switch (params.sort) {
      case 'price-asc': return { price: 'asc' as const };
      case 'price-desc': return { price: 'desc' as const };
      case 'newest': return { createdAt: 'desc' as const };
      case 'popular': return { salesCount: 'desc' as const };
      default: return { createdAt: 'desc' as const };
    }
  })();

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        images: { take: 1 },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <ProductFilters
            categories={categories}
            currentFilters={params}
          />
        </aside>

        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {total} products found
            </p>
            <ProductSort currentSort={params.sort} />
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products} />
          </Suspense>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/products"
            searchParams={params}
          />
        </main>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}
```

## Product Card Component

```typescript
// components/product-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string }[];
  category: { name: string };
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <div className={cn('group relative', className)}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}

          {discount && (
            <Badge className="absolute top-2 left-2" variant="destructive">
              -{discount}%
            </Badge>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}

          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm text-muted-foreground">
            {product.category.name}
          </p>
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <Button
        className="mt-3 w-full"
        disabled={!product.inStock}
        size="sm"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  );
}
```

## Product Filters Component

```typescript
// components/product-filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Category {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  currentFilters: Record<string, string | undefined>;
}

export function ProductFilters({ categories, currentFilters }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseFloat(currentFilters.minPrice || '0'),
    parseFloat(currentFilters.maxPrice || '1000'),
  ]);

  const updateFilter = (key: string, value: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/products?${params.toString()}`);
    });
  };

  const applyPriceFilter = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('minPrice', String(priceRange[0]));
      params.set('maxPrice', String(priceRange[1]));
      params.delete('page');
      router.push(`/products?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push('/products');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['categories', 'price']}>
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={currentFilters.category === category.id}
                    onCheckedChange={(checked) =>
                      updateFilter('category', checked ? category.id : null)
                    }
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={1000}
                step={10}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-20"
                />
                <span className="self-center">-</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-20"
                />
              </div>
              <Button onClick={applyPriceFilter} size="sm" className="w-full">
                Apply
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

## Product Grid Component

```typescript
// components/product-grid.tsx
'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string }[];
  category: { name: string };
  inStock: boolean;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant={view === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setView('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setView('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={cn(
          view === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-4'
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className={view === 'list' ? 'flex gap-4' : ''}
          />
        ))}
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Fetch All Products at Once

```typescript
// BAD - Fetches all products
const products = await prisma.product.findMany();

// GOOD - Use pagination
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

## Related Skills

- [filtering](./filtering.md)
- [pagination](./pagination.md)
- [image-optimization](./image-optimization.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Product grid and cards
- Filtering and sorting
- View toggle
