---
id: pt-generics
name: Generic Type Patterns
version: 2.0.0
layer: L5
category: typescript
description: Advanced generic type patterns for reusable, type-safe abstractions in Next.js applications
tags: [typescript, generics, type-inference, utility-types, advanced-types]
composes: []
dependencies: []
formula: "Generic<T extends Constraint = Default> = (input: T) => Transform<T>"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Generic Type Patterns

## Overview

Generics enable creating reusable, type-safe abstractions that work with multiple types while maintaining full type inference. This pattern covers common generic patterns for React components, hooks, and utilities.

## When to Use

Use generics when:
- Creating reusable components that work with different data types
- Building type-safe hooks that preserve input/output type relationships
- Writing utility functions that transform types while maintaining safety
- Implementing data structures like lists, maps, or trees
- Designing APIs that need to work with multiple entity types

## Composition Diagram

```
+---------------------+
|   Type Parameter    |
|   <T, U, V>         |
+----------+----------+
           |
     +-----+-----+
     |           |
     v           v
+----+----+ +----+----+
|Constraint| |Default  |
|T extends | |T = any  |
|  Base    | |         |
+---------+ +---------+
     |           |
     +-----+-----+
           |
           v
+----------+----------+
|   Generic Function  |
|   function fn<T>    |
|   (arg: T): T       |
+----------+----------+
           |
     +-----+-----+-----+
     |           |     |
     v           v     v
+----+----+ +----+----+ +-------+
|Component| | Hook    | |Utility|
|List<T>  | |useFetch | |map<T> |
|Table<T> | |<T>      | |       |
+---------+ +---------+ +-------+
```

## Implementation

### Generic React Components

```typescript
// components/ui/list.tsx
import { cn } from "@/lib/utils";

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  emptyState?: React.ReactNode;
  className?: string;
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyState,
  className,
}: ListProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage
interface User {
  id: string;
  name: string;
  email: string;
}

<List<User>
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => (
    <div>
      <span>{user.name}</span>
      <span>{user.email}</span>
    </div>
  )}
  emptyState={<p>No users found</p>}
/>
```

### Generic Data Table

```typescript
// components/ui/data-table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: keyof TData & string;
  pagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  pagination = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      {searchColumn && (
        <input
          placeholder={`Search by ${String(searchColumn)}...`}
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn(searchColumn)?.setFilterValue(e.target.value)
          }
          className="max-w-sm px-3 py-2 border rounded-md"
        />
      )}
      
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-left p-2 border-b">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 border-b">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### Generic Fetch Hook

```typescript
// hooks/use-fetch.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchOptions<T> {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetchResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const { initialData, enabled = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = (await response.json()) as T;
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    refetch: fetchData,
  };
}

// Usage
interface User {
  id: string;
  name: string;
}

const { data: users, isLoading } = useFetch<User[]>("/api/users");
```

### Generic Form Hook

```typescript
// hooks/use-form.ts
"use client";

import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import { z } from "zod";

interface UseFormOptions<T extends z.ZodObject<z.ZodRawShape>> {
  schema: T;
  initialValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void> | void;
}

interface UseFormResult<T extends z.ZodObject<z.ZodRawShape>> {
  values: z.infer<T>;
  errors: Partial<Record<keyof z.infer<T>, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setFieldValue: <K extends keyof z.infer<T>>(
    field: K,
    value: z.infer<T>[K]
  ) => void;
  setFieldError: (field: keyof z.infer<T>, error: string) => void;
  reset: () => void;
}

export function useForm<T extends z.ZodObject<z.ZodRawShape>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormOptions<T>): UseFormResult<T> {
  type FormValues = z.infer<T>;

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : value;

      setValues((prev) => ({ ...prev, [name]: newValue }));
      setIsDirty(true);

      // Clear field error on change
      if (errors[name as keyof FormValues]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const setFieldValue = useCallback(
    <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
    },
    []
  );

  const setFieldError = useCallback(
    (field: keyof FormValues, error: string) => {
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const result = schema.safeParse(values);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      for (const error of result.error.errors) {
        const field = error.path[0] as keyof FormValues;
        if (!fieldErrors[field]) {
          fieldErrors[field] = error.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [schema, values]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
        setIsDirty(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onSubmit, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
  };
}
```

### Generic API Client

```typescript
// lib/api-client.ts
import { z } from "zod";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(
    path: string,
    schema: z.Schema<T>,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      ...options,
    });

    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.status}`);
    }

    const data = await response.json();
    return schema.parse(data);
  }

  async post<TBody, TResponse>(
    path: string,
    body: TBody,
    responseSchema: z.Schema<TResponse>,
    options?: RequestInit
  ): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`POST ${path} failed: ${response.status}`);
    }

    const data = await response.json();
    return responseSchema.parse(data);
  }

  async put<TBody, TResponse>(
    path: string,
    body: TBody,
    responseSchema: z.Schema<TResponse>,
    options?: RequestInit
  ): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`PUT ${path} failed: ${response.status}`);
    }

    const data = await response.json();
    return responseSchema.parse(data);
  }

  async delete<T>(
    path: string,
    responseSchema: z.Schema<T>,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      ...options,
    });

    if (!response.ok) {
      throw new Error(`DELETE ${path} failed: ${response.status}`);
    }

    const data = await response.json();
    return responseSchema.parse(data);
  }
}

export const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

// Usage
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const usersSchema = z.array(userSchema);

// Fully type-safe API calls
const users = await api.get("/users", usersSchema);
const newUser = await api.post("/users", { name: "John", email: "john@example.com" }, userSchema);
```

## Variants

### Constrained Generics

```typescript
// Only accept objects with an id property
interface HasId {
  id: string | number;
}

function findById<T extends HasId>(items: T[], id: T["id"]): T | undefined {
  return items.find((item) => item.id === id);
}

// Only accept objects with specific methods
interface Serializable {
  toJSON(): unknown;
}

function serialize<T extends Serializable>(item: T): string {
  return JSON.stringify(item.toJSON());
}
```

### Default Generic Types

```typescript
// Generic with default type
interface ApiResponse<T = unknown, E = Error> {
  data?: T;
  error?: E;
  status: number;
}

// Can use without specifying types
const response: ApiResponse = { status: 200 };

// Or with specific types
const userResponse: ApiResponse<User> = { data: user, status: 200 };
```

### Mapped Types

```typescript
// Make all properties optional
type PartialUpdate<T> = {
  [K in keyof T]?: T[K];
};

// Make all properties required
type Required<T> = {
  [K in keyof T]-?: T[K];
};

// Pick specific keys
type UserPreview = Pick<User, "id" | "name">;

// Omit specific keys
type UserWithoutPassword = Omit<User, "password">;
```

## Anti-patterns

1. **Over-generification**: Making everything generic when not needed
2. **Missing constraints**: Not constraining generics properly
3. **Type parameter naming**: Using single letters everywhere (prefer descriptive names)
4. **Ignoring inference**: Manually specifying types that TypeScript can infer
5. **Nested generics hell**: Too many nested generic types

## Related Skills

- `L5/patterns/type-safety` - Type safety fundamentals
- `L5/patterns/utility-types` - Built-in utility types
- `L5/patterns/inference` - Type inference patterns
- `L5/patterns/component-props` - Component prop types

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with React 19 and Next.js 15 patterns
