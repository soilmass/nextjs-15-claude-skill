---
id: pt-sorting
name: Data Sorting
version: 2.1.0
layer: L5
category: data
description: Implement column sorting, multi-sort, and URL-synced sort state
tags: [data, sorting, url-state, tables, next15, react19]
composes:
  - ../atoms/input-select.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
  - ../organisms/data-table.md
dependencies: []
formula: "Sorting = URLSearchParams + Select(a-input-select) + SortIcon(a-display-icon) + DataTable(o-data-table)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Data Sorting

## Overview

Sorting organizes data based on specific criteria. This pattern covers single column sorting, multi-column sorting, URL state synchronization, and server-side sorting for large datasets.

## When to Use

- Data tables with sortable columns
- Product listings (price, popularity, date)
- Admin dashboards
- Any tabular data display
- Combined with filtering and pagination

## Composition Diagram

```
+------------------------------------------+
|            Sortable Table                |
|  +------------------------------------+  |
|  |  Name [^v]  Price [^]  Date [v]  |  | <- Headers with sort icons
|  +------------------------------------+  |
|  |  Row 1...                         |  |
|  |  Row 2...                         |  |
|  |  Row 3...                         |  |
|  +------------------------------------+  |
+------------------------------------------+
           |
           v URL State (?sort=price&order=asc)
           |
+------------------------------------------+
|         Server: ORDER BY price ASC       |
+------------------------------------------+
```

## Server-Side Sorting

```typescript
// app/products/page.tsx
import { prisma } from '@/lib/db';
import { ProductsTable } from '@/components/products-table';
import { SortControls } from '@/components/sort-controls';

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    order?: 'asc' | 'desc';
  }>;
}

const validSortFields = ['name', 'price', 'createdAt', 'stock'] as const;
type SortField = typeof validSortFields[number];

function isValidSortField(field: string): field is SortField {
  return validSortFields.includes(field as SortField);
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sortField = params.sort && isValidSortField(params.sort) 
    ? params.sort 
    : 'createdAt';
  const sortOrder = params.order === 'asc' ? 'asc' : 'desc';

  const products = await prisma.product.findMany({
    orderBy: { [sortField]: sortOrder },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <SortControls
        currentSort={sortField}
        currentOrder={sortOrder}
        options={[
          { value: 'name', label: 'Name' },
          { value: 'price', label: 'Price' },
          { value: 'createdAt', label: 'Date Added' },
          { value: 'stock', label: 'Stock' },
        ]}
      />
      <ProductsTable products={products} />
    </div>
  );
}
```

## Sort Controls Component

```typescript
// components/sort-controls.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface SortControlsProps {
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  options: SortOption[];
}

export function SortControls({
  currentSort,
  currentOrder,
  options,
}: SortControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateSort = (sort: string, order?: 'asc' | 'desc') => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('sort', sort);
      if (order) {
        params.set('order', order);
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const toggleOrder = () => {
    updateSort(currentSort, currentOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select
        value={currentSort}
        onValueChange={(value) => updateSort(value, currentOrder)}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleOrder}
        disabled={isPending}
        aria-label={`Sort ${currentOrder === 'asc' ? 'descending' : 'ascending'}`}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : currentOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
```

## Sortable Table Header

```typescript
// components/sortable-table.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface SortableTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
}

export function SortableTable<T extends { id: string }>({
  data,
  columns,
  currentSort,
  currentOrder = 'desc',
}: SortableTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSort = (columnKey: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      
      if (currentSort === columnKey) {
        // Toggle order if same column
        params.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
      } else {
        // New column, default to desc
        params.set('sort', columnKey);
        params.set('order', 'desc');
      }
      
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (currentSort !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return currentOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                column.sortable && 'cursor-pointer select-none hover:bg-muted/50'
              )}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center gap-2">
                {column.label}
                {column.sortable && getSortIcon(column.key)}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className={isPending ? 'opacity-50' : ''}>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => (
              <TableCell key={column.key}>
                {column.render
                  ? column.render(row[column.key], row)
                  : String(row[column.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Usage
// components/products-table.tsx
import { SortableTable } from './sortable-table';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: Date;
}

export function ProductsTable({ 
  products, 
  currentSort, 
  currentOrder 
}: { 
  products: Product[];
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
}) {
  return (
    <SortableTable
      data={products}
      currentSort={currentSort}
      currentOrder={currentOrder}
      columns={[
        { key: 'name', label: 'Name', sortable: true },
        {
          key: 'price',
          label: 'Price',
          sortable: true,
          render: (value) => formatCurrency(value as number),
        },
        {
          key: 'stock',
          label: 'Stock',
          sortable: true,
          render: (value) => (
            <span className={value === 0 ? 'text-destructive' : ''}>
              {value as number}
            </span>
          ),
        },
        {
          key: 'createdAt',
          label: 'Added',
          sortable: true,
          render: (value) => formatDate(value as Date),
        },
      ]}
    />
  );
}
```

## Multi-Column Sorting

```typescript
// hooks/use-multi-sort.ts
'use client';

import { parseAsString, useQueryStates } from 'nuqs';

export type SortDirection = 'asc' | 'desc';
export type SortItem = { field: string; direction: SortDirection };

export function useMultiSort() {
  // Store as "field1:asc,field2:desc"
  const [{ sort }, setSort] = useQueryStates({
    sort: parseAsString.withDefault(''),
  });

  const sortItems: SortItem[] = sort
    ? sort.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return { field, direction: direction as SortDirection };
      })
    : [];

  const addSort = (field: string, direction: SortDirection = 'desc') => {
    const existing = sortItems.filter((s) => s.field !== field);
    const newItems = [...existing, { field, direction }];
    setSort({ sort: newItems.map((s) => `${s.field}:${s.direction}`).join(',') });
  };

  const removeSort = (field: string) => {
    const newItems = sortItems.filter((s) => s.field !== field);
    setSort({ sort: newItems.map((s) => `${s.field}:${s.direction}`).join(',') || null });
  };

  const toggleSort = (field: string) => {
    const existing = sortItems.find((s) => s.field === field);
    if (!existing) {
      addSort(field, 'desc');
    } else if (existing.direction === 'desc') {
      addSort(field, 'asc');
    } else {
      removeSort(field);
    }
  };

  const clearSort = () => {
    setSort({ sort: null });
  };

  return {
    sortItems,
    addSort,
    removeSort,
    toggleSort,
    clearSort,
  };
}

// Server-side multi-sort
// lib/multi-sort.ts
export function buildOrderBy(sortString: string | undefined) {
  if (!sortString) return [{ createdAt: 'desc' as const }];

  return sortString.split(',').map((item) => {
    const [field, direction] = item.split(':');
    return { [field]: direction as 'asc' | 'desc' };
  });
}

// app/products/page.tsx
import { buildOrderBy } from '@/lib/multi-sort';

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderBy = buildOrderBy(params.sort);

  const products = await prisma.product.findMany({
    orderBy, // Prisma supports array of orderBy
    take: 50,
  });

  return <ProductsTable products={products} />;
}
```

## Client-Side Sorting

```typescript
// hooks/use-client-sort.ts
'use client';

import { useState, useMemo } from 'react';

export function useClientSort<T>(
  data: T[],
  defaultSort?: { field: keyof T; direction: 'asc' | 'desc' }
) {
  const [sort, setSort] = useState(defaultSort);

  const sortedData = useMemo(() => {
    if (!sort) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];

      // Handle null/undefined
      if (aVal == null) return sort.direction === 'asc' ? -1 : 1;
      if (bVal == null) return sort.direction === 'asc' ? 1 : -1;

      // Compare based on type
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Date comparison
      if (aVal instanceof Date && bVal instanceof Date) {
        return sort.direction === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      return 0;
    });
  }, [data, sort]);

  const toggleSort = (field: keyof T) => {
    setSort((current) => {
      if (current?.field !== field) {
        return { field, direction: 'desc' };
      }
      if (current.direction === 'desc') {
        return { field, direction: 'asc' };
      }
      return undefined; // Remove sort
    });
  };

  return { sortedData, sort, setSort, toggleSort };
}

// Usage
// components/local-table.tsx
'use client';

import { useClientSort } from '@/hooks/use-client-sort';

export function LocalTable({ data }: { data: Product[] }) {
  const { sortedData, sort, toggleSort } = useClientSort(data, {
    field: 'name',
    direction: 'asc',
  });

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => toggleSort('name')}>
            Name {sort?.field === 'name' && (sort.direction === 'asc' ? '↑' : '↓')}
          </th>
          <th onClick={() => toggleSort('price')}>
            Price {sort?.field === 'price' && (sort.direction === 'asc' ? '↑' : '↓')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Anti-patterns

### Don't Sort Large Datasets Client-Side

```typescript
// BAD - Sorting thousands of items in browser
const sortedData = useMemo(() => {
  return [...hugeDataset].sort((a, b) => a.name.localeCompare(b.name));
}, [hugeDataset]); // Slow and memory-intensive

// GOOD - Server-side sorting
const products = await prisma.product.findMany({
  orderBy: { name: 'asc' },
  take: 50,
});
```

### Don't Forget Stable Sorting

```typescript
// BAD - Unstable sort can cause flickering
orderBy: { price: 'asc' } // Items with same price may swap positions

// GOOD - Add secondary sort for stability
orderBy: [
  { price: 'asc' },
  { id: 'asc' }, // Stable secondary sort
]
```

## Related Skills

- [url-state](./url-state.md)
- [pagination](./pagination.md)
- [filtering](./filtering.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Server-side sorting
- Sortable table header
- Multi-column sorting
- Client-side sorting hook
