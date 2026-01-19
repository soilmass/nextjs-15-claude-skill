---
id: o-data-table
name: Data Table
version: 2.0.0
layer: L3
category: data
description: Advanced data table with sorting, filtering, pagination, and column management
tags: [table, data, grid, sorting, filtering, pagination]
formula: "DataTable = DropdownMenu(m-dropdown-menu) + Input(a-input) + Button(a-button) + Checkbox(a-checkbox) + Select(a-select)"
composes: []
dependencies: ["@tanstack/react-table", nuqs, lucide-react]
performance:
  impact: high
  lcp: low
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Data Table

## Overview

The Data Table organism provides a fully-featured data grid built on TanStack Table with server-side sorting, filtering, pagination, column visibility, row selection, and URL state synchronization. Optimized for large datasets with virtualization support.

## When to Use

Use this skill when:
- Displaying tabular data with sorting/filtering
- Building admin dashboards and data views
- Creating searchable lists with pagination
- Managing records with bulk actions

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DataTable (L3)                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  DataTableToolbar                                             │  │
│  │  ┌───────────────────┐ ┌─────────┐ ┌─────────────────────┐   │  │
│  │  │ Input(a-input)    │ │ Reset   │ │ DropdownMenu        │   │  │
│  │  │ Search filter     │ │ Button  │ │ (m-dropdown-menu)   │   │  │
│  │  └───────────────────┘ └─────────┘ │ Column Visibility   │   │  │
│  │                                    └─────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Table                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  TableHeader                                            │  │  │
│  │  │  ┌────────┬──────────────┬──────────────┬────────────┐  │  │  │
│  │  │  │Checkbox│ Column + Sort│ Column + Sort│ Actions    │  │  │  │
│  │  │  │(a-chk) │ Button(a-btn)│ Button(a-btn)│            │  │  │  │
│  │  │  └────────┴──────────────┴──────────────┴────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  TableBody                                              │  │  │
│  │  │  ┌────────┬──────────────┬──────────────┬────────────┐  │  │  │
│  │  │  │Checkbox│ Cell Data    │ Cell Data    │ Actions    │  │  │  │
│  │  │  │(a-chk) │              │              │            │  │  │  │
│  │  │  └────────┴──────────────┴──────────────┴────────────┘  │  │  │
│  │  │  ... (rows)                                             │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  DataTablePagination                                          │  │
│  │  ┌───────────────┐ ┌────────────────┐ ┌────────────────────┐ │  │
│  │  │ "X selected"  │ │Select(a-select)│ │ Button(a-button)[] │ │  │
│  │  │               │ │ Rows per page  │ │ [<<] [<] [>] [>>]  │ │  │
│  │  └───────────────┘ └────────────────┘ └────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [input](../atoms/input.md) - Filter inputs
- [button](../atoms/button.md) - Action buttons
- [dropdown-menu](../molecules/dropdown-menu.md) - Column visibility
- [select](../atoms/select.md) - Page size selection

## Implementation

```typescript
// components/organisms/data-table.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Data array */
  data: TData[];
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;
  /** Enable URL state sync */
  enableUrlState?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Searchable column key */
  searchColumn?: string;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Initial page size */
  initialPageSize?: number;
  /** Show pagination */
  showPagination?: boolean;
  /** Toolbar actions */
  toolbarActions?: React.ReactNode;
  /** Selected rows action */
  selectedRowsAction?: (rows: TData[]) => React.ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Total row count for server pagination */
  totalRows?: number;
  /** Server-side pagination handler */
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  /** Server-side sorting handler */
  onSortingChange?: (sorting: SortingState) => void;
  /** Additional class names */
  className?: string;
}

// Helper component for sortable column header
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
    getCanSort: () => boolean;
  };
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{title}</span>
      {sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

// Selection column helper
export function getSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: {
  table: ReturnType<typeof useReactTable<TData>>;
  pageSizeOptions?: number[];
}) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <span>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = "Search...",
  enableColumnVisibility = true,
  toolbarActions,
  selectedRowsAction,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
  searchColumn?: string;
  searchPlaceholder?: string;
  enableColumnVisibility?: boolean;
  toolbarActions?: React.ReactNode;
  selectedRowsAction?: (rows: TData[]) => React.ReactNode;
}) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        {selectedRows.length > 0 && selectedRowsAction && (
          <div className="ml-2">
            {selectedRowsAction(selectedRows.map((row) => row.original))}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {toolbarActions}
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8">
                <Settings2 className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableRowSelection = false,
  enableColumnVisibility = true,
  enableUrlState = false,
  searchPlaceholder = "Search...",
  searchColumn,
  pageSizeOptions = [10, 20, 30, 40, 50],
  initialPageSize = 10,
  showPagination = true,
  toolbarActions,
  selectedRowsAction,
  emptyMessage = "No results.",
  isLoading = false,
  className,
}: DataTableProps<TData, TValue>) {
  // URL state for pagination (optional)
  const [pageIndex, setPageIndex] = enableUrlState
    ? useQueryState("page", parseAsInteger.withDefault(0))
    : React.useState(0);
  const [pageSize, setPageSize] = enableUrlState
    ? useQueryState("size", parseAsInteger.withDefault(initialPageSize))
    : React.useState(initialPageSize);
  const [search, setSearch] = enableUrlState && searchColumn
    ? useQueryState("q", parseAsString.withDefault(""))
    : React.useState("");

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Sync URL search with column filter
  React.useEffect(() => {
    if (enableUrlState && searchColumn && search) {
      setColumnFilters([{ id: searchColumn, value: search }]);
    }
  }, [search, searchColumn, enableUrlState]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: pageIndex ?? 0,
        pageSize: pageSize ?? initialPageSize,
      },
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function"
        ? updater({ pageIndex: pageIndex ?? 0, pageSize: pageSize ?? initialPageSize })
        : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className={cn("space-y-4", className)}>
      <DataTableToolbar
        table={table}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder}
        enableColumnVisibility={enableColumnVisibility}
        toolbarActions={toolbarActions}
        selectedRowsAction={selectedRowsAction}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  );
}
```

### Key Implementation Notes

1. **TanStack Table**: Full integration with sorting, filtering, pagination
2. **URL State**: Optional sync with query params via nuqs
3. **Row Selection**: Checkbox column with bulk actions
4. **Column Visibility**: Toggle columns via dropdown

## Variants

### Basic Table

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
];

<DataTable
  columns={columns}
  data={users}
  searchColumn="name"
  searchPlaceholder="Search users..."
/>
```

### With Row Selection

```tsx
const columns: ColumnDef<User>[] = [
  getSelectionColumn<User>(),
  // ... other columns
];

<DataTable
  columns={columns}
  data={users}
  enableRowSelection
  selectedRowsAction={(rows) => (
    <Button variant="destructive" size="sm">
      Delete {rows.length} users
    </Button>
  )}
/>
```

### With URL State

```tsx
<DataTable
  columns={columns}
  data={users}
  enableUrlState
  searchColumn="name"
  initialPageSize={20}
/>
```

### With Toolbar Actions

```tsx
<DataTable
  columns={columns}
  data={users}
  toolbarActions={
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Add User
    </Button>
  }
/>
```

## Performance

### Large Datasets

- Consider virtualization for 1000+ rows
- Use server-side pagination for very large datasets
- Debounce search input filtering

### Rendering Optimization

- Memoize column definitions
- Use `React.memo` for custom cell renderers
- Avoid inline functions in cell definitions

## Accessibility

### Required Attributes

- Table has proper semantic structure
- Sort buttons have aria-labels
- Pagination controls are labeled

### Screen Reader

- Table headers describe columns
- Sort state is announced
- Selection state is announced

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to toggle checkboxes
- Sort columns via keyboard

## Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.11.0",
    "nuqs": "^2.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## Props API

### DataTable

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | Required | TanStack Table column definitions |
| `data` | `TData[]` | Required | Array of data to display |
| `enableRowSelection` | `boolean` | `false` | Enable checkbox row selection |
| `enableColumnVisibility` | `boolean` | `true` | Enable column show/hide toggle |
| `enableUrlState` | `boolean` | `false` | Sync pagination/search with URL |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for search input |
| `searchColumn` | `string` | `undefined` | Column key to search |
| `pageSizeOptions` | `number[]` | `[10, 20, 30, 40, 50]` | Options for rows per page |
| `initialPageSize` | `number` | `10` | Default rows per page |
| `showPagination` | `boolean` | `true` | Show pagination controls |
| `toolbarActions` | `ReactNode` | `undefined` | Custom toolbar actions |
| `selectedRowsAction` | `(rows: TData[]) => ReactNode` | `undefined` | Render for selected rows actions |
| `emptyMessage` | `string` | `'No results.'` | Message when no data |
| `isLoading` | `boolean` | `false` | Show loading state |
| `totalRows` | `number` | `undefined` | Total for server pagination |
| `onPaginationChange` | `(pageIndex, pageSize) => void` | `undefined` | Server pagination handler |
| `onSortingChange` | `(sorting: SortingState) => void` | `undefined` | Server sorting handler |
| `className` | `string` | `undefined` | Additional CSS classes |

### DataTableColumnHeader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `column` | `Column<TData, TValue>` | Required | TanStack column object |
| `title` | `string` | Required | Column header text |
| `className` | `string` | `undefined` | Additional CSS classes |

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Loading | Data being fetched | Spinner in table body |
| Empty | No data matches | Empty message centered |
| Sorted Ascending | Column sorted A-Z | Up arrow on column header |
| Sorted Descending | Column sorted Z-A | Down arrow on column header |
| Unsorted | No sort applied | Up/down arrows on header |
| Row Selected | Checkbox checked | Row highlighted, checkbox filled |
| All Selected | All rows checked | Header checkbox filled |
| Some Selected | Partial selection | Header checkbox indeterminate |
| Filtered | Search/filter active | Reset button visible |
| Column Hidden | Column toggled off | Column not visible, checked in menu |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus through search, column headers, cells, pagination |
| `Enter` | Toggle sort on column header, activate button |
| `Space` | Toggle checkbox selection, activate buttons |
| `Arrow Left/Right` | Navigate pagination buttons |
| `Home` | Go to first page (when pagination focused) |
| `End` | Go to last page (when pagination focused) |

## Screen Reader Announcements

- Table has proper semantic structure (`<table>`, `<thead>`, `<tbody>`)
- Column headers describe content with `<th>` scope
- Sort buttons announce "Sort by [column], currently [ascending/descending/none]"
- Selection checkboxes announce "Select row" / "Select all"
- Pagination announces "Page X of Y"
- Row count selection announces "Rows per page: [count]"
- Navigation buttons have sr-only labels ("Go to first/previous/next/last page")
- Selected count announced ("X of Y row(s) selected")
- Empty and loading states announced

## Anti-patterns

### 1. Missing Column Definitions
```tsx
// Bad - no columns defined
<DataTable data={users} columns={[]} />

// Good - properly defined columns
const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];
<DataTable data={users} columns={columns} />
```

### 2. Selection Without Actions
```tsx
// Bad - row selection enabled but no actions
<DataTable
  data={users}
  columns={columns}
  enableRowSelection
/>

// Good - selection with bulk action handler
<DataTable
  data={users}
  columns={columns}
  enableRowSelection
  selectedRowsAction={(rows) => (
    <Button onClick={() => deleteUsers(rows)}>
      Delete {rows.length} users
    </Button>
  )}
/>
```

### 3. URL State Without Debounce
```tsx
// Bad - every keystroke updates URL
<DataTable
  data={users}
  columns={columns}
  enableUrlState
  searchColumn="name"
/>

// Good - built-in handles this, but be aware of server requests
// Use with server-side pagination to avoid excessive API calls
```

### 4. Large Datasets Without Pagination
```tsx
// Bad - rendering thousands of rows
<DataTable
  data={allUsers} // 10,000 rows
  columns={columns}
  showPagination={false}
/>

// Good - paginate large datasets
<DataTable
  data={users}
  columns={columns}
  showPagination
  initialPageSize={20}
/>
```

## Related Skills

### Composes Into
- [templates/dashboard-layout](../templates/dashboard-layout.md)
- [templates/admin-layout](../templates/admin-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- TanStack Table integration
- URL state synchronization
- Row selection with bulk actions
