---
id: pt-search
name: Search Patterns
version: 2.1.0
layer: L5
category: data
description: Implement search functionality with debouncing, URL state, and instant results
tags: [data, search, debounce, url-state, next15, react19]
composes:
  - ../atoms/input-text.md
  - ../atoms/display-icon.md
  - ../atoms/feedback-spinner.md
  - ../molecules/search-input.md
  - ../organisms/command-palette.md
  - ../organisms/search-modal.md
dependencies:
  prisma: "^6.0.0"
formula: "Search = useDebouncedValue + URLSearchParams + SearchInput(m-search-input) + CommandPalette(o-command-palette)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Search Patterns

## Overview

Search is a critical UX feature requiring careful attention to performance, user feedback, and accessibility. This pattern covers debounced search, URL-synced queries, instant results, and advanced search with filters.

## When to Use

- Site-wide search functionality
- Command palette (Cmd+K)
- Autocomplete inputs
- Filter-as-you-type experiences
- Full-text search with highlighting

## Composition Diagram

```
+------------------------------------------+
|              Search Flow                 |
|  +------------------------------------+  |
|  |  SearchInput (debounced 300ms)    |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  URL Update (?q=query)            |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  Server Query (Prisma contains)   |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  SearchResults (with highlights)  |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Basic Search with URL State

```typescript
// app/search/page.tsx
import { prisma } from '@/lib/db';
import { SearchInput } from '@/components/search-input';
import { SearchResults } from '@/components/search-results';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || '';

  const results = query
    ? await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="space-y-6">
      <SearchInput initialQuery={query} />
      
      {query && (
        <p className="text-muted-foreground">
          {results.length} results for "{query}"
        </p>
      )}
      
      <SearchResults results={results} query={query} />
    </div>
  );
}

// components/search-input.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchInputProps {
  initialQuery?: string;
}

export function SearchInput({ initialQuery = '' }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const updateSearch = useDebouncedCallback((value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      router.push(`/search?${params.toString()}`);
    });
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    updateSearch('');
  };

  return (
    <div className="relative max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Search posts..."
        className="pl-9 pr-9"
        aria-label="Search"
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      ) : query ? (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      ) : null}
    </div>
  );
}
```

## Instant Search with Command Menu

```typescript
// components/search-command.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/components/ui/command';
import { FileText, User, Tag, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'post' | 'user' | 'tag';
  url: string;
}

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);

  // Open on Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      return res.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const handleSelect = useCallback(
    (url: string) => {
      setOpen(false);
      setQuery('');
      router.push(url);
    },
    [router]
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'tag':
        return <Tag className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Group results by type
  const groupedResults = results?.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-lg hover:bg-accent"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search posts, users, tags..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && <CommandLoading>Searching...</CommandLoading>}
          
          {!isLoading && debouncedQuery.length >= 2 && !results?.length && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {groupedResults &&
            Object.entries(groupedResults).map(([type, items]) => (
              <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + 's'}>
                {items.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result.url)}
                    className="flex items-center gap-2"
                  >
                    {getIcon(result.type)}
                    <span className="flex-1">{result.title}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

          {query && (
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() => handleSelect(`/search?q=${encodeURIComponent(query)}`)}
              >
                <Search className="h-4 w-4 mr-2" />
                Search for "{query}"
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

## Full-Text Search API

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q');
  const type = searchParams.get('type'); // 'post' | 'user' | 'tag' | undefined
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const results = [];

  // Search posts
  if (!type || type === 'post') {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
        published: true,
      },
      select: { id: true, title: true, slug: true },
      take: limit,
    });

    results.push(
      ...posts.map((post) => ({
        id: post.id,
        title: post.title,
        type: 'post' as const,
        url: `/posts/${post.slug}`,
      }))
    );
  }

  // Search users
  if (!type || type === 'user') {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true },
      take: limit,
    });

    results.push(
      ...users.map((user) => ({
        id: user.id,
        title: user.name || 'Unknown',
        type: 'user' as const,
        url: `/users/${user.id}`,
      }))
    );
  }

  // Search tags
  if (!type || type === 'tag') {
    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      select: { id: true, name: true, slug: true },
      take: limit,
    });

    results.push(
      ...tags.map((tag) => ({
        id: tag.id,
        title: tag.name,
        type: 'tag' as const,
        url: `/tags/${tag.slug}`,
      }))
    );
  }

  return NextResponse.json(results);
}
```

## Search with Highlighting

```typescript
// components/search-results.tsx
'use client';

import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  url: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No results found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {results.map((result) => (
        <li key={result.id}>
          <Link
            href={result.url}
            className="block p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h2 className="font-semibold text-lg">
              {highlightMatch(result.title, query)}
            </h2>
            <p className="text-muted-foreground mt-1 line-clamp-2">
              {highlightMatch(result.excerpt, query)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

## Advanced Search with Filters

```typescript
// components/advanced-search.tsx
'use client';

import { useQueryStates, parseAsString, parseAsArrayOf } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = ['Technology', 'Design', 'Business', 'Lifestyle'];
const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
];

export function AdvancedSearch() {
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(''),
    category: parseAsArrayOf(parseAsString).withDefault([]),
    author: parseAsString.withDefault(''),
    dateFrom: parseAsString.withDefault(''),
    dateTo: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('relevance'),
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters({
      category: checked
        ? [...filters.category, category]
        : filters.category.filter((c) => c !== category),
    });
  };

  const handleReset = () => {
    setFilters({
      q: '',
      category: [],
      author: '',
      dateFrom: '',
      dateTo: '',
      sort: 'relevance',
    });
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-card">
      <div className="space-y-2">
        <Label htmlFor="search-query">Search Query</Label>
        <Input
          id="search-query"
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          placeholder="Enter keywords..."
        />
      </div>

      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2">
              <Checkbox
                checked={filters.category.includes(category)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category, !!checked)
                }
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={filters.author}
          onChange={(e) => setFilters({ author: e.target.value })}
          placeholder="Filter by author..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date-from">From Date</Label>
          <Input
            id="date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ dateFrom: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-to">To Date</Label>
          <Input
            id="date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ dateTo: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort">Sort By</Label>
        <Select value={filters.sort} onValueChange={(v) => setFilters({ sort: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Search on Every Keystroke

```typescript
// BAD - Fires request on every character
const handleChange = (e) => {
  setQuery(e.target.value);
  fetch(`/api/search?q=${e.target.value}`); // Too many requests!
};

// GOOD - Debounce the search
const debouncedSearch = useDebouncedCallback((value: string) => {
  fetch(`/api/search?q=${value}`);
}, 300);

const handleChange = (e) => {
  setQuery(e.target.value);
  debouncedSearch(e.target.value);
};
```

### Don't Forget Empty States

```typescript
// BAD - No feedback for empty results
return (
  <ul>
    {results.map(result => <li>{result.title}</li>)}
  </ul>
);

// GOOD - Handle empty state
return results.length > 0 ? (
  <ul>{results.map(result => <li>{result.title}</li>)}</ul>
) : (
  <EmptyState message="No results found" />
);
```

## Related Skills

- [url-state](./url-state.md)
- [client-fetch](./client-fetch.md)
- [filtering](./filtering.md)
- [pagination](./pagination.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- URL-synced search
- Command palette search
- Full-text search API
- Result highlighting
- Advanced search filters
