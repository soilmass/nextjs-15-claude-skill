---
id: t-search-results-page
name: Search Results Page
version: 2.0.0
layer: L4
category: pages
description: Search results page with filters, sorting, and pagination
tags: [search, results, filters, pagination, sorting]
performance:
  impact: medium
  lcp: medium
  cls: low
formula: "SearchResultsPage = Sidebar(o-sidebar) + SearchInput(m-search-input) + Pagination(m-pagination) + EmptyState(m-empty-state)"
composes:
  - ../molecules/search-input.md
  - ../molecules/pagination.md
  - ../organisms/sidebar.md
  - ../molecules/empty-state.md
dependencies:
  - react
  - next
  - lucide-react
  - nuqs
  - "@tanstack/react-query"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Search Results Page

## Overview

A comprehensive search results page with advanced filtering, sorting options, and pagination. Supports URL-based state management for shareable searches.

## Composition Diagram

```
+------------------------------------------------------------------------+
|                       SearchResultsPage                                 |
+------------------------------------------------------------------------+
|  +--------------------------------------------------------------------+ |
|  |                    SearchHeader (sticky)                           | |
|  |  +----------------------------------------------------------------+| |
|  |  | SearchInput (m-search-input)                     [Filters btn] || |
|  |  | [Search icon] [Search products, brands...______] [X]           || |
|  |  +----------------------------------------------------------------+| |
|  |  Showing results for "query"                                       | |
|  +--------------------------------------------------------------------+ |
|                                                                         |
|  +----------------+  +------------------------------------------------+ |
|  | Sidebar        |  |                SearchResults                   | |
|  | (o-sidebar)    |  |  +--------------------------------------------+| |
|  |                |  |  |  Results Header                            || |
|  | SearchFilters  |  |  |  [X results]              [Sort dropdown]  || |
|  | [Filters]      |  |  +--------------------------------------------+| |
|  | [Clear all]    |  |                                                | |
|  |                |  |  +--------------------------------------------+| |
|  | o Category     |  |  |  Results Grid                              || |
|  |   ( ) All      |  |  |  +--------+ +--------+ +--------+          || |
|  |   ( ) Elec     |  |  |  |Product | |Product | |Product |          || |
|  |   ( ) Cloth    |  |  |  | Card   | | Card   | | Card   |          || |
|  |                |  |  |  +--------+ +--------+ +--------+          || |
|  | o Price Range  |  |  |  +--------+ +--------+ +--------+          || |
|  |   ( ) <$25     |  |  |  |Product | |Product | |Product |          || |
|  |   ( ) $25-50   |  |  |  | Card   | | Card   | | Card   |          || |
|  |   ( ) $50-100  |  |  |  +--------+ +--------+ +--------+          || |
|  |                |  |  +--------------------------------------------+| |
|  | o Rating       |  |                                                | |
|  |   ( ) 4+ stars |  |  OR EmptyState (m-empty-state)                | |
|  |   ( ) 3+ stars |  |  +--------------------------------------------+| |
|  +----------------+  |  |  [Search icon] No results found            || |
|                      |  |  Try adjusting your search or filters      || |
|                      |  +--------------------------------------------+| |
|                      |                                                | |
|                      |  +--------------------------------------------+| |
|                      |  |  Pagination (m-pagination)                 || |
|                      |  |  [Prev] [1] [2] ... [10] [Next]            || |
|                      |  +--------------------------------------------+| |
|                      +------------------------------------------------+ |
+------------------------------------------------------------------------+
```

## Implementation

### Search Results Page

```tsx
// app/search/page.tsx
import { Suspense } from 'react';
import { SearchResults } from '@/components/search/search-results';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchHeader } from '@/components/search/search-header';
import { SearchResultsSkeleton } from '@/components/search/search-results-skeleton';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    min_price?: string;
    max_price?: string;
    rating?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || 'all';
  const sort = params.sort || 'relevance';
  const page = parseInt(params.page || '1', 10);
  const minPrice = params.min_price ? parseFloat(params.min_price) : undefined;
  const maxPrice = params.max_price ? parseFloat(params.max_price) : undefined;
  const rating = params.rating ? parseInt(params.rating, 10) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SearchHeader query={query} />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block">
            <SearchFilters
              category={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              rating={rating}
            />
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <Suspense fallback={<SearchResultsSkeleton />}>
              <SearchResults
                query={query}
                category={category}
                sort={sort}
                page={page}
                minPrice={minPrice}
                maxPrice={maxPrice}
                rating={rating}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Search Header

```tsx
// components/search/search-header.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchHeaderProps {
  query: string;
}

export function SearchHeader({ query }: SearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(query);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
      params.delete('page'); // Reset to first page on new search
    } else {
      params.delete('q');
    }
    router.push(`/search?${params.toString()}`);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    updateSearch(value);
  };

  const clearSearch = () => {
    setInputValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Search products, brands, categories..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              aria-label="Search"
            />
            {inputValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50 lg:hidden dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Active Filters Summary */}
        {query && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing results for "<span className="font-medium text-gray-900 dark:text-white">{query}</span>"
          </p>
        )}
      </div>
    </header>
  );
}
```

### Search Filters

```tsx
// components/search/search-filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';

interface SearchFiltersProps {
  category: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'home', name: 'Home & Garden' },
  { id: 'sports', name: 'Sports & Outdoors' },
  { id: 'books', name: 'Books' },
];

const priceRanges = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: undefined },
];

export function SearchFilters({
  category,
  minPrice,
  maxPrice,
  rating,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset pagination when filters change
    router.push(`/search?${params.toString()}`);
  };

  const updatePriceRange = (min?: number, max?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min !== undefined) {
      params.set('min_price', min.toString());
    } else {
      params.delete('min_price');
    }
    if (max !== undefined) {
      params.set('max_price', max.toString());
    } else {
      params.delete('max_price');
    }
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = category !== 'all' || minPrice || maxPrice || rating;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
          Category
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center">
              <input
                type="radio"
                name="category"
                checked={category === cat.id}
                onChange={() => updateFilter('category', cat.id === 'all' ? undefined : cat.id)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
          Price Range
        </h3>
        <div className="space-y-2">
          {priceRanges.map((range, index) => {
            const isActive = minPrice === range.min && maxPrice === range.max;
            return (
              <label key={index} className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="price"
                  checked={isActive}
                  onChange={() => updatePriceRange(range.min, range.max)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {range.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
          Minimum Rating
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((stars) => (
            <label key={stars} className="flex cursor-pointer items-center">
              <input
                type="radio"
                name="rating"
                checked={rating === stars}
                onChange={() => updateFilter('rating', stars.toString())}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < stars
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="ml-1">& up</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Search Results

```tsx
// components/search/search-results.tsx
import { Star, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchSorting } from './search-sorting';
import { SearchPagination } from './search-pagination';

interface SearchResultsProps {
  query: string;
  category: string;
  sort: string;
  page: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  inStock: boolean;
}

async function searchProducts(params: SearchResultsProps): Promise<{
  products: Product[];
  total: number;
  totalPages: number;
}> {
  // In production, this would be an API call
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/search?${new URLSearchParams({
      q: params.query,
      category: params.category,
      sort: params.sort,
      page: params.page.toString(),
      ...(params.minPrice && { min_price: params.minPrice.toString() }),
      ...(params.maxPrice && { max_price: params.maxPrice.toString() }),
      ...(params.rating && { rating: params.rating.toString() }),
    })}`,
    { next: { revalidate: 60 } }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch search results');
  }
  
  return res.json();
}

export async function SearchResults(props: SearchResultsProps) {
  const { products, total, totalPages } = await searchProducts(props);

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No results found
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium text-gray-900 dark:text-white">{total}</span> results
        </p>
        <SearchSorting currentSort={props.sort} />
      </div>

      {/* Results Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <SearchPagination
            currentPage={props.page}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-950">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Badges */}
      <div className="absolute left-3 top-3 flex flex-col gap-2">
        {discount && (
          <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <span className="rounded-full bg-gray-900 px-2 py-1 text-xs font-medium text-white">
            Out of Stock
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-600 opacity-0 transition-all hover:bg-white hover:text-red-500 group-hover:opacity-100 dark:bg-gray-900/90 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-red-400"
        aria-label="Add to wishlist"
      >
        <Heart className="h-5 w-5" />
      </button>

      {/* Content */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through dark:text-gray-500">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          disabled={!product.inStock}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  );
}
```

### Search Sorting

```tsx
// components/search/search-sorting.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface SearchSortingProps {
  currentSort: string;
}

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export function SearchSorting({ currentSort }: SearchSortingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;
    if (value === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    router.push(`/search?${params.toString()}`);
  };

  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Most Relevant';

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        aria-label="Sort results"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
```

### Search Pagination

```tsx
// components/search/search-pagination.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function SearchPagination({ currentPage, totalPages }: SearchPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    router.push(`/search?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('ellipsis');
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push('ellipsis');
    
    pages.push(totalPages);

    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
```

### Search Results Skeleton

```tsx
// components/search/search-results-skeleton.tsx
export function SearchResultsSkeleton() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-800" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Variants

### List View

```tsx
// components/search/search-results-list.tsx
'use client';

import { useState } from 'react';
import { Grid, List } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}) {
  return (
    <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
      <button
        onClick={() => onChange('grid')}
        className={`p-2 ${
          view === 'grid'
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
        }`}
        aria-label="Grid view"
      >
        <Grid className="h-5 w-5" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-2 ${
          view === 'list'
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
        }`}
        aria-label="List view"
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );
}
```

### Instant Search

```tsx
// components/search/instant-search.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export function InstantSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['instant-search', debouncedQuery],
    queryFn: () => fetch(`/api/search/instant?q=${debouncedQuery}`).then(r => r.json()),
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2"
      />
      
      {debouncedQuery.length >= 2 && (
        <div className="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : data?.results?.length > 0 ? (
            <ul className="divide-y">
              {data.results.map((result: any) => (
                <li key={result.id} className="p-3 hover:bg-gray-50">
                  {result.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Usage

```tsx
// Basic search page usage
// Navigate to /search?q=shoes&category=clothing&sort=price_asc

// Programmatic navigation
import { useRouter } from 'next/navigation';

function SearchTrigger() {
  const router = useRouter();
  
  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSearch(formData.get('q') as string);
    }}>
      <input name="q" placeholder="Search..." />
      <button type="submit">Search</button>
    </form>
  );
}
```

## Error States

### Search Error Boundary

```tsx
// app/search/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Search error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search unavailable
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We're having trouble loading search results. Please try again.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Empty State Component

```tsx
// components/search/search-empty-state.tsx
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchEmptyStateProps {
  query: string;
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function SearchEmptyState({
  query,
  hasFilters,
  onClearFilters,
}: SearchEmptyStateProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        No results found
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        {query
          ? `No products match "${query}"`
          : 'No products match your current filters'}
      </p>

      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Clear all filters
        </button>
      )}

      <div className="mt-6">
        <p className="text-sm text-gray-500 dark:text-gray-500">Suggestions:</p>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <li>Check your spelling</li>
          <li>Try more general terms</li>
          <li>Use fewer filters</li>
        </ul>
      </div>
    </div>
  );
}
```

### Search API Error Handling

```tsx
// components/search/search-results-with-error.tsx
import { SearchEmptyState } from './search-empty-state';

async function searchProducts(params: SearchResultsProps) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/search?${new URLSearchParams({
        q: params.query,
        // ... other params
      })}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('rate_limit');
      }
      throw new Error('search_failed');
    }

    return res.json();
  } catch (error) {
    throw error;
  }
}

export async function SearchResults(props: SearchResultsProps) {
  let results;
  let searchError: string | null = null;

  try {
    results = await searchProducts(props);
  } catch (error) {
    if (error instanceof Error) {
      searchError = error.message;
    }
  }

  if (searchError === 'rate_limit') {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
        <p className="text-yellow-800 dark:text-yellow-200">
          Too many searches. Please wait a moment and try again.
        </p>
      </div>
    );
  }

  if (searchError) {
    throw new Error(searchError);
  }

  if (results.products.length === 0) {
    return <SearchEmptyState query={props.query} hasFilters={hasActiveFilters(props)} />;
  }

  return (
    // ... render results
  );
}
```

## Loading States

### Search Page Loading

```tsx
// app/search/loading.tsx
export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="mt-3 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Skeleton */}
          <aside className="hidden lg:block">
            <div className="space-y-6">
              <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* Results Skeleton */}
          <div className="lg:col-span-3">
            <SearchResultsSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Inline Search Loading

```tsx
// components/search/search-loading-overlay.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export function SearchLoadingOverlay({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Show loading when search params change
    setIsSearching(true);
    const timeout = setTimeout(() => setIsSearching(false), 500);
    return () => clearTimeout(timeout);
  }, [searchParams]);

  return (
    <div className="relative">
      {(isPending || isSearching) && (
        <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-20 dark:bg-gray-900/60">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg dark:bg-gray-800">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Searching...
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
```

### Suspense Boundaries for Search

```tsx
// app/search/page.tsx with granular Suspense
import { Suspense } from 'react';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header renders immediately */}
      <SearchHeader query={params.q || ''} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters with separate Suspense */}
          <aside className="hidden lg:block">
            <Suspense fallback={<FiltersSkeleton />}>
              <SearchFilters />
            </Suspense>
          </aside>

          {/* Results with separate Suspense */}
          <div className="lg:col-span-3">
            <Suspense
              key={JSON.stringify(params)}
              fallback={<SearchResultsSkeleton />}
            >
              <SearchResults {...params} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Search Layout

```tsx
// app/search/page.tsx - responsive version
export default async function SearchPageResponsive({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SearchHeader query={params.q || ''} />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Mobile: Single column, Desktop: Grid */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters - Hidden on mobile, shown in sidebar on desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <SearchFilters {...params} />
            </div>
          </aside>

          {/* Results - Full width on mobile */}
          <div className="lg:col-span-3">
            <Suspense fallback={<SearchResultsSkeleton />}>
              <SearchResults {...params} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Mobile Filter Sheet

```tsx
// components/search/mobile-filters.tsx
'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface MobileFiltersProps {
  category: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  activeFilterCount: number;
}

export function MobileFilters({
  category,
  minPrice,
  maxPrice,
  rating,
  activeFilterCount,
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Filter Button - Fixed at bottom on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-4 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
        >
          <SlidersHorizontal className="h-5 w-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom Sheet */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-2xl bg-white dark:bg-gray-950 lg:hidden">
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Content - Scrollable */}
            <div className="overflow-y-auto p-4 pb-24">
              <MobileFilterAccordion title="Category">
                {/* Category options */}
              </MobileFilterAccordion>

              <MobileFilterAccordion title="Price Range">
                {/* Price options */}
              </MobileFilterAccordion>

              <MobileFilterAccordion title="Rating">
                {/* Rating options */}
              </MobileFilterAccordion>
            </div>

            {/* Footer - Apply & Clear */}
            <div className="absolute bottom-0 left-0 right-0 flex gap-3 border-t bg-white p-4 pb-safe dark:bg-gray-950">
              <button
                onClick={() => {/* Clear filters */}}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium dark:border-gray-700"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white"
              >
                Show results
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function MobileFilterAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-b border-gray-200 py-4 dark:border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-2"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}
```

### Responsive Search Results Grid

```tsx
// components/search/responsive-results-grid.tsx
export function ResponsiveResultsGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Responsive Product Card
function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Image - Aspect ratio maintained */}
      <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      {/* Content - Compact on mobile */}
      <div className="p-3 sm:p-4">
        {/* Title - Truncate to 2 lines */}
        <h3 className="text-sm sm:text-base font-medium line-clamp-2">
          {product.name}
        </h3>

        {/* Rating - Smaller on mobile */}
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                i < Math.floor(product.rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 sm:text-sm">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart - Full width, touch-friendly */}
        <button
          disabled={!product.inStock}
          className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 min-h-[44px]"
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  );
}
```

### Mobile Search Header

```tsx
// components/search/mobile-search-header.tsx
export function MobileSearchHeader({ query }: { query: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        {/* Compact search on mobile */}
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          {/* Search input - grows to fill space */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              defaultValue={query}
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-10 text-sm sm:py-3 sm:text-base"
            />
          </div>
        </div>

        {/* Results summary - Hidden on very small screens */}
        {query && (
          <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Results for "<span className="font-medium text-gray-900 dark:text-white">{query}</span>"
          </p>
        )}
      </div>
    </header>
  );
}
```

## Related Skills

- [L3/search-modal](../organisms/search-modal.md) - Command palette search
- [L2/pagination](../molecules/pagination.md) - Pagination component
- [L5/infinite-scroll](../patterns/infinite-scroll.md) - Infinite scroll pattern

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with filters, sorting, and pagination
