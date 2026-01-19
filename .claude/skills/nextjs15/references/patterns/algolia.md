---
id: pt-algolia
name: Algolia Search
version: 2.0.0
layer: L5
category: data
description: Algolia instant search integration with React InstantSearch and server-side rendering
tags: [algolia, search, instant-search, facets, autocomplete, analytics]
composes: []
dependencies:
  algoliasearch: "^5.14.0"
  react-instantsearch: "^7.13.0"
formula: "AlgoliaSearch = ClientSetup + IndexConfig + InstantSearchComponents + DataSync + Autocomplete"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Algolia Search

Integrate Algolia for lightning-fast, typo-tolerant search with faceted filtering.

## Overview

This pattern covers:
- Algolia client setup
- Index configuration
- React InstantSearch components
- Server-side rendering
- Data synchronization
- Search analytics
- Autocomplete and suggestions

## When to Use

- Need for sub-50ms search response times at scale
- Building e-commerce with faceted filtering and sorting
- Typo-tolerant search with highlighting is required
- Real-time search-as-you-type autocomplete
- Analytics on search queries and conversions

## Composition Diagram

```
[Prisma Database] --> [Sync Middleware] --> [Algolia Index]
                                                   |
                                        +----------+----------+
                                        |                     |
                                  [Search Client]      [Admin Client]
                                        |                     |
                                  [Frontend Search]    [Index Management]
                                        |
                        +---------------+---------------+
                        |               |               |
                  [SearchBox]    [RefinementList]   [Pagination]
                        |               |               |
                  [Autocomplete]  [Facet Filters]  [Sorting]
                        |               |               |
                        +---------------+---------------+
                                        |
                                  [Search Results]
```

## Implementation

### Installation

```bash
npm install algoliasearch react-instantsearch
```

### Algolia Client Configuration

```typescript
// lib/algolia/client.ts
import algoliasearch from 'algoliasearch';

export const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

// Admin client for indexing (server-side only)
export const algoliaAdminClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
);

export const INDICES = {
  products: 'products',
  posts: 'posts',
  users: 'users',
};
```

### Index Configuration

```typescript
// lib/algolia/setup.ts
import { algoliaAdminClient, INDICES } from './client';

export async function configureAlgoliaIndices() {
  // Products index
  const productsIndex = algoliaAdminClient.initIndex(INDICES.products);
  
  await productsIndex.setSettings({
    // Searchable attributes (in order of importance)
    searchableAttributes: [
      'name',
      'brand',
      'description',
      'category',
      'tags',
    ],
    // Attributes for faceting
    attributesForFaceting: [
      'filterOnly(inStock)',
      'searchable(category)',
      'searchable(brand)',
      'price',
      'rating',
      'tags',
    ],
    // Custom ranking
    customRanking: [
      'desc(popularity)',
      'desc(rating)',
    ],
    // Highlighting
    attributesToHighlight: ['name', 'description'],
    // Snippets
    attributesToSnippet: ['description:50'],
    // Typo tolerance
    typoTolerance: true,
    minWordSizefor1Typo: 3,
    minWordSizefor2Typos: 7,
    // Other settings
    hitsPerPage: 20,
    paginationLimitedTo: 1000,
    // Query rules
    enableRules: true,
    // Personalization
    enablePersonalization: true,
  });

  // Replicas for sorting
  await productsIndex.setSettings({
    replicas: [
      `${INDICES.products}_price_asc`,
      `${INDICES.products}_price_desc`,
      `${INDICES.products}_rating_desc`,
      `${INDICES.products}_newest`,
    ],
  });

  // Configure replicas
  const priceAscIndex = algoliaAdminClient.initIndex(`${INDICES.products}_price_asc`);
  await priceAscIndex.setSettings({
    ranking: ['asc(price)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
  });

  // Posts index
  const postsIndex = algoliaAdminClient.initIndex(INDICES.posts);
  
  await postsIndex.setSettings({
    searchableAttributes: [
      'title',
      'excerpt',
      'content',
      'author.name',
      'categories',
      'tags',
    ],
    attributesForFaceting: [
      'searchable(categories)',
      'searchable(tags)',
      'author.name',
      'filterOnly(published)',
    ],
    customRanking: ['desc(publishedAt)'],
    attributesToHighlight: ['title', 'excerpt'],
    attributesToSnippet: ['content:100'],
  });

  console.log('Algolia indices configured');
}
```

### Data Synchronization

```typescript
// lib/algolia/sync.ts
import { algoliaAdminClient, INDICES } from './client';
import { prisma } from '@/lib/prisma';

interface ProductRecord {
  objectID: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  brand: string | null;
  category: string;
  tags: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  image: string | null;
  popularity: number;
  createdAt: number;
}

interface PostRecord {
  objectID: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  categories: string[];
  tags: string[];
  published: boolean;
  publishedAt: number | null;
  image: string | null;
}

/**
 * Sync a single product to Algolia
 */
export async function syncProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      reviews: {
        select: { rating: true },
      },
    },
  });

  if (!product) return;

  const index = algoliaAdminClient.initIndex(INDICES.products);

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const record: ProductRecord = {
    objectID: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: product.price,
    brand: product.brand,
    category: product.category,
    tags: product.tags,
    inStock: product.inStock,
    rating: avgRating,
    reviewCount: product.reviews.length,
    image: product.image,
    popularity: product.views || 0,
    createdAt: product.createdAt.getTime(),
  };

  await index.saveObject(record);
}

/**
 * Delete a product from Algolia
 */
export async function deleteProductFromIndex(productId: string) {
  const index = algoliaAdminClient.initIndex(INDICES.products);
  await index.deleteObject(productId);
}

/**
 * Full reindex of all products
 */
export async function reindexAllProducts() {
  const products = await prisma.product.findMany({
    include: {
      reviews: {
        select: { rating: true },
      },
    },
  });

  const records: ProductRecord[] = products.map((product) => {
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    return {
      objectID: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      brand: product.brand,
      category: product.category,
      tags: product.tags,
      inStock: product.inStock,
      rating: avgRating,
      reviewCount: product.reviews.length,
      image: product.image,
      popularity: product.views || 0,
      createdAt: product.createdAt.getTime(),
    };
  });

  const index = algoliaAdminClient.initIndex(INDICES.products);
  
  // Replace all objects atomically
  await index.replaceAllObjects(records);
  
  console.log(`Indexed ${records.length} products`);
}

/**
 * Sync a single post to Algolia
 */
export async function syncPost(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      categories: {
        select: { name: true },
      },
    },
  });

  if (!post || !post.published) {
    // Remove from index if unpublished
    const index = algoliaAdminClient.initIndex(INDICES.posts);
    await index.deleteObject(postId).catch(() => {});
    return;
  }

  const index = algoliaAdminClient.initIndex(INDICES.posts);

  const record: PostRecord = {
    objectID: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content.slice(0, 5000), // Limit content length
    author: {
      id: post.author.id,
      name: post.author.name || '',
      image: post.author.image,
    },
    categories: post.categories.map((c) => c.name),
    tags: post.tags || [],
    published: post.published,
    publishedAt: post.publishedAt?.getTime() || null,
    image: post.image,
  };

  await index.saveObject(record);
}
```

### Prisma Middleware for Auto-Sync

```typescript
// lib/prisma/middleware.ts
import { Prisma } from '@prisma/client';
import { syncProduct, deleteProductFromIndex, syncPost } from '@/lib/algolia/sync';

export const algoliaMiddleware: Prisma.Middleware = async (params, next) => {
  const result = await next(params);

  // Product sync
  if (params.model === 'Product') {
    if (['create', 'update'].includes(params.action)) {
      const id = result?.id || params.args?.where?.id;
      if (id) {
        syncProduct(id).catch(console.error);
      }
    } else if (params.action === 'delete') {
      const id = params.args?.where?.id;
      if (id) {
        deleteProductFromIndex(id).catch(console.error);
      }
    }
  }

  // Post sync
  if (params.model === 'Post') {
    if (['create', 'update'].includes(params.action)) {
      const id = result?.id || params.args?.where?.id;
      if (id) {
        syncPost(id).catch(console.error);
      }
    }
  }

  return result;
};
```

### React InstantSearch Components

```typescript
// components/search/algolia-search.tsx
'use client';

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  Stats,
  Configure,
  Highlight,
  Snippet,
  RangeInput,
  ClearRefinements,
  CurrentRefinements,
  SortBy,
} from 'react-instantsearch';
import { INDICES } from '@/lib/algolia/client';
import Image from 'next/image';
import Link from 'next/link';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

interface ProductHit {
  objectID: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  image: string | null;
  rating: number;
}

function ProductHitComponent({ hit }: { hit: ProductHit }) {
  return (
    <Link
      href={`/products/${hit.slug}`}
      className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      {hit.image && (
        <div className="aspect-square relative mb-3">
          <Image
            src={hit.image}
            alt={hit.name}
            fill
            className="object-cover rounded"
          />
        </div>
      )}
      <h3 className="font-medium">
        <Highlight attribute="name" hit={hit} />
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
        <Snippet attribute="description" hit={hit} />
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-bold">${hit.price.toFixed(2)}</span>
        {hit.rating > 0 && (
          <span className="text-sm text-yellow-600">★ {hit.rating.toFixed(1)}</span>
        )}
      </div>
    </Link>
  );
}

export function AlgoliaProductSearch() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={INDICES.products}
      routing
      insights
    >
      <Configure hitsPerPage={20} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Search</h3>
            <SearchBox
              placeholder="Search products..."
              classNames={{
                input: 'w-full px-4 py-2 border rounded-lg',
                submit: 'hidden',
                reset: 'hidden',
              }}
            />
          </div>

          <CurrentRefinements
            classNames={{
              item: 'inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm mr-2 mb-2',
              delete: 'cursor-pointer hover:text-destructive',
            }}
          />

          <ClearRefinements
            translations={{ resetButtonText: 'Clear all filters' }}
            classNames={{
              button: 'text-sm text-primary hover:underline',
            }}
          />

          <div>
            <h3 className="font-medium mb-3">Category</h3>
            <RefinementList
              attribute="category"
              showMore
              showMoreLimit={20}
              classNames={{
                list: 'space-y-2',
                item: 'flex items-center gap-2',
                checkbox: 'rounded',
                label: 'flex items-center gap-2 cursor-pointer',
                count: 'text-xs text-muted-foreground',
              }}
            />
          </div>

          <div>
            <h3 className="font-medium mb-3">Brand</h3>
            <RefinementList
              attribute="brand"
              searchable
              searchablePlaceholder="Search brands..."
              showMore
              classNames={{
                list: 'space-y-2',
                item: 'flex items-center gap-2',
                searchBox: 'mb-2',
              }}
            />
          </div>

          <div>
            <h3 className="font-medium mb-3">Price</h3>
            <RangeInput
              attribute="price"
              classNames={{
                input: 'w-20 px-2 py-1 border rounded',
                separator: 'mx-2',
              }}
            />
          </div>
        </aside>

        {/* Results */}
        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <Stats
              translations={{
                rootElementText({ nbHits, processingTimeMS }) {
                  return `${nbHits.toLocaleString()} results (${processingTimeMS}ms)`;
                },
              }}
              classNames={{ root: 'text-sm text-muted-foreground' }}
            />

            <SortBy
              items={[
                { label: 'Relevance', value: INDICES.products },
                { label: 'Price: Low to High', value: `${INDICES.products}_price_asc` },
                { label: 'Price: High to Low', value: `${INDICES.products}_price_desc` },
                { label: 'Highest Rated', value: `${INDICES.products}_rating_desc` },
                { label: 'Newest', value: `${INDICES.products}_newest` },
              ]}
              classNames={{
                select: 'px-3 py-2 border rounded-lg',
              }}
            />
          </div>

          <Hits
            hitComponent={ProductHitComponent}
            classNames={{
              list: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
            }}
          />

          <Pagination
            padding={2}
            showFirst={false}
            showLast={false}
            classNames={{
              root: 'mt-8 flex justify-center',
              list: 'flex gap-1',
              item: 'px-3 py-2 border rounded hover:bg-muted',
              selectedItem: 'bg-primary text-primary-foreground',
              disabledItem: 'opacity-50 pointer-events-none',
            }}
          />
        </main>
      </div>
    </InstantSearch>
  );
}
```

### Server-Side Search

```typescript
// app/search/page.tsx
import { algoliaClient, INDICES } from '@/lib/algolia/client';
import { AlgoliaProductSearch } from '@/components/search/algolia-search';
import type { Metadata } from 'next';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q;

  if (!query) {
    return { title: 'Search Products' };
  }

  return {
    title: `Search results for "${query}"`,
    robots: { index: false }, // Don't index search pages
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q;

  // Optional: Pre-fetch initial results for SSR
  let initialResults = null;
  if (query) {
    const index = algoliaClient.initIndex(INDICES.products);
    initialResults = await index.search(query, {
      hitsPerPage: 20,
    });
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">
        {query ? `Results for "${query}"` : 'Search Products'}
      </h1>
      
      <AlgoliaProductSearch />
    </div>
  );
}
```

### Autocomplete Component

```typescript
// components/search/algolia-autocomplete.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { useRouter } from 'next/navigation';
import { INDICES } from '@/lib/algolia/client';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

interface Suggestion {
  objectID: string;
  name: string;
  slug: string;
  category: string;
  price: number;
}

export function AlgoliaAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      const index = searchClient.initIndex(INDICES.products);
      const { hits } = await index.search<Suggestion>(query, {
        hitsPerPage: 5,
        attributesToRetrieve: ['name', 'slug', 'category', 'price'],
      });
      
      setSuggestions(hits);
      setIsLoading(false);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className="pl-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion.objectID}
              href={`/products/${suggestion.slug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted"
            >
              <div>
                <p className="font-medium">{suggestion.name}</p>
                <p className="text-sm text-muted-foreground">{suggestion.category}</p>
              </div>
              <span className="font-bold">${suggestion.price.toFixed(2)}</span>
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="block px-4 py-2 text-sm text-center text-primary hover:bg-muted border-t"
          >
            View all results
          </Link>
        </div>
      )}
    </div>
  );
}
```

## Anti-patterns

1. **Exposing admin key** - Only use search key on client
2. **No index configuration** - Configure searchable attributes and facets
3. **Large records** - Keep records under 10KB, don't index full content
4. **No replicas** - Use replicas for different sort orders
5. **Sync in request** - Use background jobs for indexing
6. **No fallback** - Handle Algolia outages gracefully

## Related Skills

- [[full-text-search]] - PostgreSQL alternative
- [[search]] - Basic search patterns
- [[filtering]] - Filter implementation

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial Algolia search pattern with React InstantSearch
