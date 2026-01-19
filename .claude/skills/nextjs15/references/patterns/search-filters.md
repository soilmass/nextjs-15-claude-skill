---
id: pt-search-filters
name: Advanced Search Filters
version: 1.0.0
layer: L5
category: data
description: Implement complex search with faceted filters and URL state
tags: [data, search, filters, facets, url-state, next15, react19]
composes:
  - ../atoms/input-checkbox.md
dependencies: []
formula: "SearchFilters = URLState + FacetedFilters + FilterSidebar + ActiveFilters"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Advanced Search Filters

## Overview

Advanced search filters provide faceted navigation for complex search interfaces. This pattern covers URL-synced filters, facet counts, and mobile-friendly filter UIs.

## When to Use

- E-commerce product filtering
- Job board search
- Real estate listings
- Document search with metadata
- Any multi-criteria search

## Filter Types

```typescript
// lib/filters/types.ts
export type FilterType =
  | 'checkbox'
  | 'radio'
  | 'range'
  | 'date-range'
  | 'search'
  | 'toggle';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterDefinition {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ActiveFilter {
  id: string;
  value: string | string[] | [number, number];
  label: string;
}

export interface FilterState {
  [key: string]: string | string[] | [number, number] | boolean;
}
```

## URL Filter Hook

```typescript
// hooks/use-url-filters.ts
'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import type { FilterState } from '@/lib/filters/types';

export function useUrlFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo<FilterState>(() => {
    const state: FilterState = {};

    searchParams.forEach((value, key) => {
      if (key === 'page') return;

      // Handle array values (e.g., category[]=a&category[]=b)
      if (key.endsWith('[]')) {
        const baseKey = key.slice(0, -2);
        const existing = state[baseKey];
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          state[baseKey] = [value];
        }
      }
      // Handle range values (e.g., price=100-500)
      else if (value.includes('-') && /^\d+-\d+$/.test(value)) {
        const [min, max] = value.split('-').map(Number);
        state[key] = [min, max];
      }
      // Handle boolean values
      else if (value === 'true' || value === 'false') {
        state[key] = value === 'true';
      }
      // Handle regular values
      else {
        state[key] = value;
      }
    });

    return state;
  }, [searchParams]);

  const setFilter = useCallback(
    (key: string, value: string | string[] | [number, number] | boolean | null) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);

        // Remove existing values for this key
        params.delete(key);
        params.delete(`${key}[]`);

        if (value === null || value === undefined) {
          // Remove filter
        } else if (Array.isArray(value) && typeof value[0] === 'string') {
          // Array of strings
          (value as string[]).forEach((v) => params.append(`${key}[]`, v));
        } else if (Array.isArray(value) && typeof value[0] === 'number') {
          // Range
          params.set(key, `${value[0]}-${value[1]}`);
        } else if (typeof value === 'boolean') {
          params.set(key, String(value));
        } else {
          params.set(key, String(value));
        }

        // Reset to page 1 when filters change
        params.delete('page');

        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const toggleFilter = useCallback(
    (key: string, value: string) => {
      const current = filters[key];
      if (Array.isArray(current)) {
        if (current.includes(value)) {
          setFilter(key, current.filter((v) => v !== value));
        } else {
          setFilter(key, [...current, value]);
        }
      } else {
        setFilter(key, [value]);
      }
    },
    [filters, setFilter]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      const params = new URLSearchParams();
      const q = searchParams.get('q');
      if (q) params.set('q', q);
      router.push(`?${params.toString()}`);
    });
  }, [router, searchParams]);

  const clearFilter = useCallback(
    (key: string) => {
      setFilter(key, null);
    },
    [setFilter]
  );

  return {
    filters,
    setFilter,
    toggleFilter,
    clearFilter,
    clearFilters,
    isPending,
  };
}
```

## Filter Sidebar Component

```typescript
// components/filters/filter-sidebar.tsx
'use client';

import { useState } from 'react';
import { useUrlFilters } from '@/hooks/use-url-filters';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import type { FilterDefinition } from '@/lib/filters/types';

interface FilterSidebarProps {
  definitions: FilterDefinition[];
}

export function FilterSidebar({ definitions }: FilterSidebarProps) {
  const { filters, toggleFilter, setFilter, clearFilters, isPending } = useUrlFilters();

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={definitions.map((d) => d.id)}>
        {definitions.map((definition) => (
          <AccordionItem key={definition.id} value={definition.id}>
            <AccordionTrigger>{definition.label}</AccordionTrigger>
            <AccordionContent>
              {definition.type === 'checkbox' && definition.options && (
                <div className="space-y-3">
                  {definition.options.map((option) => {
                    const currentValues = filters[definition.id];
                    const isChecked = Array.isArray(currentValues)
                      ? currentValues.includes(option.value)
                      : currentValues === option.value;

                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() =>
                            toggleFilter(definition.id, option.value)
                          }
                          disabled={option.disabled}
                        />
                        <span className="text-sm flex-1">{option.label}</span>
                        {option.count !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            ({option.count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {definition.type === 'range' && (
                <RangeFilter
                  definition={definition}
                  value={filters[definition.id] as [number, number] | undefined}
                  onChange={(value) => setFilter(definition.id, value)}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <FilterContent />
      </aside>

      {/* Mobile sheet */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function RangeFilter({
  definition,
  value,
  onChange,
}: {
  definition: FilterDefinition;
  value?: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const min = definition.min || 0;
  const max = definition.max || 100;
  const [localValue, setLocalValue] = useState<[number, number]>(
    value || [min, max]
  );

  return (
    <div className="space-y-4">
      <Slider
        value={localValue}
        onValueChange={(v) => setLocalValue(v as [number, number])}
        onValueCommit={(v) => onChange(v as [number, number])}
        min={min}
        max={max}
        step={definition.step || 1}
      />
      <div className="flex justify-between text-sm">
        <span>${localValue[0]}</span>
        <span>${localValue[1]}</span>
      </div>
    </div>
  );
}
```

## Active Filters Display

```typescript
// components/filters/active-filters.tsx
'use client';

import { useUrlFilters } from '@/hooks/use-url-filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { FilterDefinition } from '@/lib/filters/types';

interface ActiveFiltersProps {
  definitions: FilterDefinition[];
}

export function ActiveFilters({ definitions }: ActiveFiltersProps) {
  const { filters, toggleFilter, clearFilter, clearFilters } = useUrlFilters();

  const activeFilters: Array<{ key: string; value: string; label: string }> = [];

  Object.entries(filters).forEach(([key, value]) => {
    const definition = definitions.find((d) => d.id === key);
    if (!definition) return;

    if (Array.isArray(value) && typeof value[0] === 'string') {
      (value as string[]).forEach((v) => {
        const option = definition.options?.find((o) => o.value === v);
        activeFilters.push({
          key,
          value: v,
          label: `${definition.label}: ${option?.label || v}`,
        });
      });
    } else if (Array.isArray(value) && typeof value[0] === 'number') {
      activeFilters.push({
        key,
        value: `${value[0]}-${value[1]}`,
        label: `${definition.label}: $${value[0]} - $${value[1]}`,
      });
    } else if (typeof value === 'string') {
      const option = definition.options?.find((o) => o.value === value);
      activeFilters.push({
        key,
        value,
        label: `${definition.label}: ${option?.label || value}`,
      });
    }
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {activeFilters.map((filter) => (
        <Badge key={`${filter.key}-${filter.value}`} variant="secondary">
          {filter.label}
          <button
            onClick={() => toggleFilter(filter.key, filter.value)}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Button variant="ghost" size="sm" onClick={clearFilters}>
        Clear all
      </Button>
    </div>
  );
}
```

## Server-Side Filter Application

```typescript
// lib/filters/apply-filters.ts
import { prisma } from '@/lib/db';
import type { FilterState } from './types';

export async function getFilteredProducts(filters: FilterState, page = 1, limit = 20) {
  const where: any = { status: 'ACTIVE' };

  // Category filter
  if (filters.category) {
    where.categoryId = Array.isArray(filters.category)
      ? { in: filters.category }
      : filters.category;
  }

  // Price range filter
  if (filters.price && Array.isArray(filters.price)) {
    where.price = {
      gte: filters.price[0],
      lte: filters.price[1],
    };
  }

  // Brand filter
  if (filters.brand) {
    where.brand = Array.isArray(filters.brand)
      ? { in: filters.brand }
      : filters.brand;
  }

  // In stock filter
  if (filters.inStock === true) {
    where.stock = { gt: 0 };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
}
```

## Anti-patterns

### Don't Store Filters Only in State

```typescript
// BAD - Filters lost on refresh
const [filters, setFilters] = useState({});

// GOOD - Sync with URL
const { filters, setFilter } = useUrlFilters();
```

## Related Skills

- [filtering](./filtering.md)
- [url-state](./url-state.md)
- [pagination](./pagination.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- URL-synced filters
- Filter sidebar
- Active filter badges
