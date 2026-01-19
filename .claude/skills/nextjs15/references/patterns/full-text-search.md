---
id: pt-full-text-search
name: Full-Text Search
version: 2.0.0
layer: L5
category: database
description: PostgreSQL full-text search with tsvector, ranking, and faceted search
tags: [search, postgresql, full-text, tsvector, ranking, facets]
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
dependencies:
  prisma: "^6.0.0"
formula: tsvector + GIN Index + ts_rank + Facets = Fast Full-Text Search
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Building search functionality without external search services like Algolia or Elasticsearch
- Implementing ranked search results with relevance scoring
- Creating faceted search with category/brand/price filters
- Adding autocomplete suggestions based on existing content
- Highlighting matched terms in search results

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FULL-TEXT SEARCH                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Database Setup                           │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  ALTER TABLE posts ADD COLUMN search_vector     │ │      │
│  │  │  CREATE INDEX ... USING GIN(search_vector)      │ │      │
│  │  │  CREATE TRIGGER ... posts_search_vector_update  │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Search Vector Weights                    │      │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │      │
│  │  │   A     │  │    B    │  │    C    │  │    D    │ │      │
│  │  │ (title) │  │(excerpt)│  │(content)│  │ (tags)  │ │      │
│  │  │ Highest │  │  High   │  │ Normal  │  │   Low   │ │      │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 Query Processing                      │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  User Query → parseSearchQuery → tsquery        │ │      │
│  │  │  "next react" → "next:* & react:*"              │ │      │
│  │  │  '"exact phrase"' → "exact <-> phrase"          │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 Search Results                        │      │
│  │  ┌───────────┐  ┌────────────┐  ┌─────────────────┐ │      │
│  │  │  ts_rank  │  │ ts_headline│  │     Facets      │ │      │
│  │  │ (scoring) │  │ (highlight)│  │ (aggregations)  │ │      │
│  │  └───────────┘  └────────────┘  └─────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Full-Text Search

Implement full-text search using PostgreSQL's built-in capabilities.

## Overview

This pattern covers:
- PostgreSQL tsvector and tsquery
- Search configuration and indexing
- Ranking and relevance scoring
- Faceted search with aggregations
- Highlighting and snippets
- Auto-complete suggestions
- Search analytics

## Implementation

### Database Schema

```sql
-- migrations/add_search_indexes.sql

-- Add tsvector column for full-text search
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector
CREATE TRIGGER posts_search_vector_trigger
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();

-- Create GIN index for fast full-text search
CREATE INDEX posts_search_idx ON posts USING GIN(search_vector);

-- Populate existing rows
UPDATE posts SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'C');

-- Products table search
ALTER TABLE products ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_vector_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

CREATE INDEX products_search_idx ON products USING GIN(search_vector);
```

### Prisma Schema Extension

```prisma
// prisma/schema.prisma
model Post {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  excerpt      String?
  content      String
  published    Boolean  @default(false)
  publishedAt  DateTime?
  
  // Search vector (managed by PostgreSQL)
  // searchVector Unsupported("tsvector")?
  
  authorId     String
  author       User     @relation(fields: [authorId], references: [id])
  categories   Category[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([published, publishedAt(sort: Desc)])
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Float
  brand       String?
  category    String
  tags        String[]
  inStock     Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([brand])
  @@index([inStock])
}
```

### Search Service

```typescript
// lib/search/service.ts
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
  sort?: 'relevance' | 'date' | 'title';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: Record<string, FacetValue[]>;
  query: string;
  took: number;
}

export interface FacetValue {
  value: string;
  count: number;
}

/**
 * Parse search query into tsquery format
 */
function parseSearchQuery(query: string): string {
  // Handle quoted phrases
  const phrases = query.match(/"[^"]+"/g) || [];
  let remaining = query;
  
  phrases.forEach((phrase) => {
    remaining = remaining.replace(phrase, '');
  });

  // Split remaining into words
  const words = remaining
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.replace(/[^\w]/g, ''));

  // Build tsquery
  const parts: string[] = [];
  
  // Add phrases with <-> (phrase search)
  phrases.forEach((phrase) => {
    const phraseWords = phrase
      .replace(/"/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 0);
    if (phraseWords.length > 0) {
      parts.push(phraseWords.join(' <-> '));
    }
  });

  // Add individual words with :* (prefix match)
  words.forEach((word) => {
    if (word.length > 0) {
      parts.push(`${word}:*`);
    }
  });

  return parts.join(' & ');
}

/**
 * Search posts with full-text search
 */
export async function searchPosts(options: SearchOptions): Promise<SearchResult<{
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  rank: number;
  headline: string;
}>> {
  const { query, limit = 10, offset = 0, filters = {}, sort = 'relevance' } = options;
  const startTime = Date.now();

  const tsquery = parseSearchQuery(query);

  // Build WHERE clause
  const conditions: string[] = ['published = true'];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (tsquery) {
    conditions.push(`search_vector @@ to_tsquery('english', $${paramIndex})`);
    params.push(tsquery);
    paramIndex++;
  }

  if (filters.categoryId) {
    conditions.push(`$${paramIndex} = ANY(SELECT category_id FROM post_categories WHERE post_id = posts.id)`);
    params.push(filters.categoryId);
    paramIndex++;
  }

  if (filters.authorId) {
    conditions.push(`author_id = $${paramIndex}`);
    params.push(filters.authorId);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Build ORDER BY
  let orderBy: string;
  switch (sort) {
    case 'date':
      orderBy = 'published_at DESC NULLS LAST';
      break;
    case 'title':
      orderBy = 'title ASC';
      break;
    case 'relevance':
    default:
      orderBy = tsquery
        ? `ts_rank(search_vector, to_tsquery('english', $1)) DESC`
        : 'published_at DESC NULLS LAST';
  }

  // Search query
  const searchQuery = `
    SELECT 
      id,
      title,
      slug,
      excerpt,
      published_at,
      ${tsquery ? `ts_rank(search_vector, to_tsquery('english', $1)) as rank` : '0 as rank'},
      ${tsquery
        ? `ts_headline('english', COALESCE(title, '') || ' ' || COALESCE(excerpt, ''), to_tsquery('english', $1), 'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20') as headline`
        : `LEFT(COALESCE(excerpt, ''), 200) as headline`
      }
    FROM posts
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM posts
    WHERE ${whereClause}
  `;

  // Execute queries
  const [items, countResult] = await Promise.all([
    prisma.$queryRawUnsafe(searchQuery, ...params),
    prisma.$queryRawUnsafe(countQuery, ...params.slice(0, -2)),
  ]);

  const total = Number((countResult as any[])[0]?.total || 0);

  return {
    items: (items as any[]).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      publishedAt: item.published_at,
      rank: Number(item.rank),
      headline: item.headline,
    })),
    total,
    query,
    took: Date.now() - startTime,
  };
}

/**
 * Search products with faceted search
 */
export async function searchProducts(options: SearchOptions): Promise<SearchResult<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  brand: string | null;
  category: string;
  rank: number;
}>> {
  const { query, limit = 20, offset = 0, filters = {}, sort = 'relevance' } = options;
  const startTime = Date.now();

  const tsquery = parseSearchQuery(query);

  // Build WHERE clause
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (tsquery) {
    conditions.push(`search_vector @@ to_tsquery('english', $${paramIndex})`);
    params.push(tsquery);
    paramIndex++;
  }

  if (filters.category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.brand) {
    if (Array.isArray(filters.brand)) {
      conditions.push(`brand = ANY($${paramIndex})`);
      params.push(filters.brand);
    } else {
      conditions.push(`brand = $${paramIndex}`);
      params.push(filters.brand);
    }
    paramIndex++;
  }

  if (filters.minPrice !== undefined) {
    conditions.push(`price >= $${paramIndex}`);
    params.push(filters.minPrice);
    paramIndex++;
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(`price <= $${paramIndex}`);
    params.push(filters.maxPrice);
    paramIndex++;
  }

  if (filters.inStock !== undefined) {
    conditions.push(`in_stock = $${paramIndex}`);
    params.push(filters.inStock);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? conditions.join(' AND ') : 'TRUE';

  // Build ORDER BY
  let orderBy: string;
  switch (sort) {
    case 'date':
      orderBy = 'created_at DESC';
      break;
    case 'title':
      orderBy = 'name ASC';
      break;
    case 'relevance':
    default:
      orderBy = tsquery
        ? `ts_rank(search_vector, to_tsquery('english', $1)) DESC`
        : 'created_at DESC';
  }

  // Search query
  const searchParams = [...params, limit, offset];
  const searchQuery = `
    SELECT 
      id,
      name,
      slug,
      description,
      price,
      brand,
      category,
      ${tsquery ? `ts_rank(search_vector, to_tsquery('english', $1)) as rank` : '0 as rank'}
    FROM products
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products
    WHERE ${whereClause}
  `;

  // Facets query
  const facetsQuery = `
    SELECT 
      'category' as facet_type,
      category as value,
      COUNT(*) as count
    FROM products
    WHERE ${whereClause}
    GROUP BY category
    UNION ALL
    SELECT 
      'brand' as facet_type,
      brand as value,
      COUNT(*) as count
    FROM products
    WHERE ${whereClause} AND brand IS NOT NULL
    GROUP BY brand
    ORDER BY facet_type, count DESC
  `;

  // Execute queries
  const [items, countResult, facetsResult] = await Promise.all([
    prisma.$queryRawUnsafe(searchQuery, ...searchParams),
    prisma.$queryRawUnsafe(countQuery, ...params),
    prisma.$queryRawUnsafe(facetsQuery, ...params),
  ]);

  const total = Number((countResult as any[])[0]?.total || 0);

  // Process facets
  const facets: Record<string, FacetValue[]> = {};
  for (const row of facetsResult as any[]) {
    if (!facets[row.facet_type]) {
      facets[row.facet_type] = [];
    }
    facets[row.facet_type].push({
      value: row.value,
      count: Number(row.count),
    });
  }

  return {
    items: (items as any[]).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: Number(item.price),
      brand: item.brand,
      category: item.category,
      rank: Number(item.rank),
    })),
    total,
    facets,
    query,
    took: Date.now() - startTime,
  };
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<string[]> {
  if (query.length < 2) return [];

  const results = await prisma.$queryRaw<{ suggestion: string }[]>`
    SELECT DISTINCT title as suggestion
    FROM posts
    WHERE published = true
      AND title ILIKE ${`%${query}%`}
    ORDER BY title
    LIMIT ${limit}
    
    UNION
    
    SELECT DISTINCT name as suggestion
    FROM products
    WHERE name ILIKE ${`%${query}%`}
    ORDER BY suggestion
    LIMIT ${limit}
  `;

  return results.map((r) => r.suggestion).slice(0, limit);
}
```

### Search API Route

```typescript
// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { searchPosts, searchProducts } from '@/lib/search/service';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1),
  type: z.enum(['posts', 'products']).optional().default('posts'),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
  sort: z.enum(['relevance', 'date', 'title']).optional().default('relevance'),
  // Product filters
  category: z.string().optional(),
  brand: z.union([z.string(), z.array(z.string())]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const params = Object.fromEntries(searchParams.entries());
  
  // Handle array params
  if (searchParams.getAll('brand').length > 1) {
    params.brand = searchParams.getAll('brand');
  }

  const validation = searchSchema.safeParse(params);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { q, type, limit, offset, sort, ...filters } = validation.data;

  try {
    const results = type === 'products'
      ? await searchProducts({ query: q, limit, offset, sort, filters })
      : await searchPosts({ query: q, limit, offset, sort, filters });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// app/api/search/suggestions/route.ts
import { NextResponse } from 'next/server';
import { getSearchSuggestions } from '@/lib/search/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const suggestions = await getSearchSuggestions(query);
  return NextResponse.json(suggestions);
}
```

### Search Component

```typescript
// components/search/search-box.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBoxProps {
  placeholder?: string;
  searchPath?: string;
}

export function SearchBox({ 
  placeholder = 'Search...', 
  searchPath = '/search' 
}: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then(setSuggestions)
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`${searchPath}?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`${searchPath}?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
          {isLoading ? (
            <div className="p-3 text-center">
              <Loader2 className="h-4 w-4 animate-spin inline" />
            </div>
          ) : (
            <ul>
              {suggestions.map((suggestion, i) => (
                <li key={i}>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-muted"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

### Search Results Page

```typescript
// app/search/page.tsx
import { Suspense } from 'react';
import { searchProducts } from '@/lib/search/service';
import { SearchBox } from '@/components/search/search-box';
import { ProductCard } from '@/components/products/product-card';
import { SearchFilters } from '@/components/search/search-filters';
import { Pagination } from '@/components/ui/pagination';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const page = Number(params.page) || 1;
  const limit = 20;

  const results = query
    ? await searchProducts({
        query,
        limit,
        offset: (page - 1) * limit,
        filters: {
          category: params.category,
          brand: params.brand,
          minPrice: params.minPrice ? Number(params.minPrice) : undefined,
          maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        },
      })
    : null;

  return (
    <div className="container py-8">
      <div className="max-w-xl mx-auto mb-8">
        <SearchBox searchPath="/search" />
      </div>

      {results && (
        <>
          <div className="text-sm text-muted-foreground mb-4">
            {results.total} results for "{query}" ({results.took}ms)
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <aside>
              <SearchFilters facets={results.facets} />
            </aside>

            {/* Results */}
            <main className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {results.total > limit && (
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(results.total / limit)}
                  className="mt-8"
                />
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
```

## Anti-patterns

1. **No indexing** - Always create GIN indexes on search vectors
2. **Rebuilding vectors on query** - Pre-compute search vectors with triggers
3. **No weighting** - Use setweight for relevance ranking
4. **Ignoring stemming** - Use language-specific configurations
5. **No highlighting** - Show users why results matched

## Related Skills

- [[algolia]] - Third-party search service
- [[search]] - Basic search patterns
- [[filtering]] - Filter implementation
- [[pagination]] - Result pagination

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial PostgreSQL full-text search pattern with facets
