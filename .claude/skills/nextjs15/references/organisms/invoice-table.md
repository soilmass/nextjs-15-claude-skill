---
id: o-invoice-table
name: Invoice Table
version: 2.0.0
layer: L3
category: data
composes: []
description: Billing history table with status badges, download, and filtering
tags: [invoice, billing, table, payments, history]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "InvoiceTable = Table(m-table) + DropdownMenu(m-dropdown-menu) + Button(a-button) + Badge(a-badge) + Input(a-input)"
dependencies:
  - react
  - "@tanstack/react-table"
  - date-fns
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Invoice Table

## Overview

A billing/invoice history table organism with sortable columns, status badges, date filtering, download functionality, and responsive design.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ InvoiceTable                                                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Filter Bar                                                   │    │
│  │  ┌──────────────────────┐  ┌──────────────────────┐         │    │
│  │  │ Input (a-input)      │  │ Status Select        │         │    │
│  │  │ [Search invoices...] │  │ [All statuses ▼]     │         │    │
│  │  └──────────────────────┘  └──────────────────────┘         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Table (m-table)                                              │    │
│  │  ┌─────────┬──────────┬─────────┬──────────┬─────────────┐  │    │
│  │  │ Invoice │ Date     │ Amount  │ Status   │ Actions     │  │    │
│  │  ├─────────┼──────────┼─────────┼──────────┼─────────────┤  │    │
│  │  │ #001    │ Jan 15   │ $250    │┌────────┐│┌───────────┐│  │    │
│  │  │         │          │         ││ Badge  │││ Dropdown  ││  │    │
│  │  │         │          │         ││ (Paid) │││ Menu      ││  │    │
│  │  │         │          │         │└────────┘│└───────────┘│  │    │
│  │  └─────────┴──────────┴─────────┴──────────┴─────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Pagination                                                   │    │
│  │  Showing 1-10 of 50    ┌────────┐  ┌────────┐               │    │
│  │                        │ Button │  │ Button │               │    │
│  │                        │ [Prev] │  │ [Next] │               │    │
│  │                        └────────┘  └────────┘               │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/invoice-table.tsx
'use client';

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  Download,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Send,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Invoice {
  id: string;
  number: string;
  date: Date;
  dueDate: Date;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled';
  customer?: {
    name: string;
    email: string;
  };
  description?: string;
  pdfUrl?: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  onView?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
  showCustomer?: boolean;
  pageSize?: number;
  loading?: boolean;
}

// Status badge configuration
const statusConfig: Record<
  Invoice['status'],
  { label: string; className: string }
> = {
  paid: {
    label: 'Paid',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

// Format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Status Badge Component
function StatusBadge({ status }: { status: Invoice['status'] }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

// Action Menu Component
function ActionMenu({
  invoice,
  onView,
  onDownload,
  onSendReminder,
}: {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:bg-accent"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border bg-popover py-1 shadow-lg">
            {onView && (
              <button
                onClick={() => {
                  onView(invoice);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Eye className="h-4 w-4" />
                View details
              </button>
            )}
            {onDownload && invoice.pdfUrl && (
              <button
                onClick={() => {
                  onDownload(invoice);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            )}
            {onSendReminder &&
              (invoice.status === 'pending' || invoice.status === 'overdue') && (
                <button
                  onClick={() => {
                    onSendReminder(invoice);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                >
                  <Send className="h-4 w-4" />
                  Send reminder
                </button>
              )}
          </div>
        </>
      )}
    </div>
  );
}

// Sort Header Component
function SortHeader({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();

  return (
    <button
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      {sorted === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : sorted === 'desc' ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
}

// Main Invoice Table Component
export function InvoiceTable({
  invoices,
  onView,
  onDownload,
  onSendReminder,
  showCustomer = false,
  pageSize = 10,
  loading = false,
}: InvoiceTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Define columns
  const columns = React.useMemo<ColumnDef<Invoice>[]>(() => {
    const cols: ColumnDef<Invoice>[] = [
      {
        accessorKey: 'number',
        header: ({ column }) => <SortHeader column={column}>Invoice</SortHeader>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.original.number}</span>
          </div>
        ),
      },
      {
        accessorKey: 'date',
        header: ({ column }) => <SortHeader column={column}>Date</SortHeader>,
        cell: ({ row }) => format(new Date(row.original.date), 'MMM d, yyyy'),
      },
    ];

    if (showCustomer) {
      cols.push({
        accessorKey: 'customer.name',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.customer?.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.customer?.email}
            </p>
          </div>
        ),
      });
    }

    cols.push(
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <SortHeader column={column}>
            <span className="text-right">Amount</span>
          </SortHeader>
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        filterFn: (row, id, value) => {
          if (value === 'all') return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => format(new Date(row.original.dueDate), 'MMM d, yyyy'),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <ActionMenu
            invoice={row.original}
            onView={onView}
            onDownload={onDownload}
            onSendReminder={onSendReminder}
          />
        ),
      }
    );

    return cols;
  }, [showCustomer, onView, onDownload, onSendReminder]);

  // Initialize table
  const table = useReactTable({
    data: invoices,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Apply status filter
  React.useEffect(() => {
    table.getColumn('status')?.setFilterValue(statusFilter);
  }, [statusFilter, table]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={cn(
              'w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center"
                >
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-muted-foreground"
                >
                  No invoices found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} invoices
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border',
              'hover:bg-accent disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border',
              'hover:bg-accent disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { InvoiceTable } from '@/components/organisms/invoice-table';

export function BillingPage({ invoices }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Billing History</h1>
      <InvoiceTable
        invoices={invoices}
        onView={(invoice) => router.push(`/invoices/${invoice.id}`)}
        onDownload={(invoice) => downloadPdf(invoice.pdfUrl)}
      />
    </div>
  );
}
```

### With Customer Column

```tsx
<InvoiceTable
  invoices={invoices}
  showCustomer
  onSendReminder={(invoice) => sendReminder(invoice.id)}
/>
```

### Loading State

```tsx
<InvoiceTable
  invoices={[]}
  loading={isLoading}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Loading | Fetching invoice data | Centered spinner, table body shows loading indicator |
| Empty | No invoices match filters | Empty state message in table body |
| Loaded | Invoices displayed normally | Table populated with invoice rows |
| Filtered | Search or status filter active | Filtered results shown, pagination updated |
| Sorting | Column sort applied | Sort icon changes to chevron up/down on sorted column |
| Hover | Mouse over table row | Row background highlight (muted/50) |
| Action Menu Open | Row action menu expanded | Dropdown menu visible with view/download/reminder options |

## Anti-patterns

### Not handling empty filter results

```tsx
// Bad: No feedback when filters return no results
{table.getRowModel().rows.map((row) => (
  <tr key={row.id}>...</tr>
))}

// Good: Show meaningful empty state for filtered results
{table.getRowModel().rows.length === 0 ? (
  <tr>
    <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
      {globalFilter || statusFilter !== 'all'
        ? `No invoices found matching "${globalFilter}"`
        : 'No invoices yet'}
    </td>
  </tr>
) : (
  table.getRowModel().rows.map((row) => (
    <tr key={row.id}>...</tr>
  ))
)}
```

### Incorrect currency formatting

```tsx
// Bad: Simple number display without proper currency formatting
<span>{invoice.amount}</span>

// Good: Use Intl.NumberFormat for locale-aware currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

<span>{formatCurrency(invoice.amount, invoice.currency)}</span>
```

### Action menu not closing on outside click

```tsx
// Bad: Menu stays open when clicking elsewhere
function ActionMenu({ invoice }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button onClick={() => setOpen(!open)}>...</button>
      {open && <div className="menu">...</div>}
    </div>
  );
}

// Good: Close menu on outside click
function ActionMenu({ invoice }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>...</button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 menu">...</div>
        </>
      )}
    </div>
  );
}
```

### Pagination showing incorrect range

```tsx
// Bad: Not accounting for filtered results in pagination text
<p>
  Showing {pageIndex * pageSize + 1} to {(pageIndex + 1) * pageSize} of {invoices.length}
</p>

// Good: Use filtered row count for accurate pagination
<p>
  Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
  {Math.min(
    (table.getState().pagination.pageIndex + 1) * pageSize,
    table.getFilteredRowModel().rows.length
  )}{' '}
  of {table.getFilteredRowModel().rows.length} invoices
</p>
```

## Related Skills

- `molecules/table-row` - Table row component
- `organisms/data-table` - Generic data table
- `templates/invoice-page` - Invoice detail page

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Sorting and filtering
- Status badges
- Download and action menu
- Pagination
- Responsive design
