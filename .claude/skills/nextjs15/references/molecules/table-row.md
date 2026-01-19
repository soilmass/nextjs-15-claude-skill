---
id: m-table-row
name: Table Row
version: 2.0.0
layer: L2
category: data
description: Data table row with selection, expansion, and action support
tags: [table, row, data, selection, expandable]
formula: "TableRow = SelectCheckbox(a-input-checkbox) + CellText(a-display-text)[] + ActionButton(a-input-button)"
composes:
  - ../atoms/input-checkbox.md
  - ../atoms/display-text.md
  - ../atoms/input-button.md
dependencies:
  lucide-react: "^0.460.0"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Table Row

## Overview

The Table Row molecule provides a flexible row component for data tables with support for selection (checkbox), expansion (collapsible details), inline actions, and row-level states. Designed to work within the Data Table organism but usable standalone.

## When to Use

Use this skill when:
- Building data tables with row selection
- Implementing expandable row details
- Adding inline row actions (edit, delete)
- Creating interactive data grids

## Composition Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              TableRow                                      │
├───────────────────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────────┐ │
│ │  [✓]   │ │   Name     │ │   Email    │ │   Status   │ │   Actions     │ │
│ │Checkbox│ │Cell (text) │ │Cell (text) │ │Cell (badge)│ │ (a-input-btn) │ │
│ │(a-input│ │            │ │            │ │            │ │               │ │
│ │-chkbox)│ │ John Doe   │ │ john@...   │ │  Active    │ │  [✏️] [🗑️]   │ │
│ └────────┘ └────────────┘ └────────────┘ └────────────┘ └───────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────── Expandable Content ─────────────────────────┐│
│ │  Additional row details go here when expanded (▼)                     ││
│ └────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────────┘

States: default | hover | selected | expanded | disabled
```

## Atoms Used

- [input-checkbox](../atoms/input-checkbox.md) - Row selection
- [display-text](../atoms/display-text.md) - Cell content
- [input-button](../atoms/input-button.md) - Row actions
- [display-icon](../atoms/display-icon.md) - Expand/collapse indicators

## Implementation

```typescript
// components/ui/table-row.tsx
"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableRowAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

interface TableRowProps<T> {
  /** Row data */
  data: T;
  /** Unique row identifier */
  id: string;
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Whether row is selected */
  selected?: boolean;
  /** Callback when selection changes */
  onSelectChange?: (selected: boolean) => void;
  /** Whether selection is enabled */
  selectable?: boolean;
  /** Whether row is expandable */
  expandable?: boolean;
  /** Expanded content renderer */
  renderExpanded?: (data: T) => React.ReactNode;
  /** Row actions */
  actions?: TableRowAction[];
  /** Whether row is disabled */
  disabled?: boolean;
  /** Click handler for entire row */
  onClick?: (data: T) => void;
  /** Additional class names */
  className?: string;
}

interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  align?: "left" | "center" | "right";
}

function getAccessorValue<T>(
  data: T,
  accessor: keyof T | ((row: T) => React.ReactNode)
): React.ReactNode {
  if (typeof accessor === "function") {
    return accessor(data);
  }
  return data[accessor] as React.ReactNode;
}

export function TableRow<T>({
  data,
  id,
  columns,
  selected = false,
  onSelectChange,
  selectable = false,
  expandable = false,
  renderExpanded,
  actions,
  disabled = false,
  onClick,
  className,
}: TableRowProps<T>) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasActions = actions && actions.length > 0;

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row click if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('input[type="checkbox"]') ||
      target.closest('[role="menu"]')
    ) {
      return;
    }
    onClick?.(data);
  };

  return (
    <>
      <tr
        className={cn(
          "border-b transition-colors",
          selected && "bg-muted/50",
          !disabled && onClick && "cursor-pointer hover:bg-muted/50",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        onClick={handleRowClick}
        aria-selected={selected}
        data-state={selected ? "selected" : undefined}
      >
        {/* Selection checkbox */}
        {selectable && (
          <td className="w-12 px-4 py-3">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelectChange}
              disabled={disabled}
              aria-label={`Select row ${id}`}
            />
          </td>
        )}

        {/* Expand toggle */}
        {expandable && (
          <td className="w-12 px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse row" : "Expand row"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </td>
        )}

        {/* Data cells */}
        {columns.map((column) => (
          <td
            key={column.id}
            className={cn(
              "px-4 py-3 text-sm",
              column.align === "center" && "text-center",
              column.align === "right" && "text-right",
              column.className
            )}
          >
            {getAccessorValue(data, column.accessor)}
          </td>
        ))}

        {/* Actions */}
        {hasActions && (
          <td className="w-12 px-4 py-3 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Row actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={action.onClick}
                    className={cn(
                      action.variant === "destructive" && "text-destructive"
                    )}
                  >
                    {action.icon && (
                      <span className="mr-2">{action.icon}</span>
                    )}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        )}
      </tr>

      {/* Expanded content */}
      {expandable && isExpanded && renderExpanded && (
        <tr className="bg-muted/25">
          <td
            colSpan={
              columns.length +
              (selectable ? 1 : 0) +
              (expandable ? 1 : 0) +
              (hasActions ? 1 : 0)
            }
            className="px-4 py-4"
          >
            {renderExpanded(data)}
          </td>
        </tr>
      )}
    </>
  );
}
```

```typescript
// components/ui/table-header-row.tsx
import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

interface TableHeaderRowProps<T> {
  columns: ColumnDef<T>[];
  selectable?: boolean;
  expandable?: boolean;
  hasActions?: boolean;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnId: string) => void;
}

export function TableHeaderRow<T>({
  columns,
  selectable,
  expandable,
  hasActions,
  allSelected,
  someSelected,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSort,
}: TableHeaderRowProps<T>) {
  return (
    <tr className="border-b bg-muted/50">
      {selectable && (
        <th className="w-12 px-4 py-3">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all rows"
          />
        </th>
      )}
      
      {expandable && <th className="w-12 px-4 py-3" />}
      
      {columns.map((column) => (
        <th
          key={column.id}
          className={cn(
            "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
            column.align === "center" && "text-center",
            column.align === "right" && "text-right",
            column.className
          )}
        >
          {column.sortable ? (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 font-medium"
              onClick={() => onSort?.(column.id)}
            >
              {column.header}
              {sortColumn === column.id ? (
                sortDirection === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowDown className="ml-2 h-4 w-4" />
                )
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
              )}
            </Button>
          ) : (
            column.header
          )}
        </th>
      ))}
      
      {hasActions && <th className="w-12 px-4 py-3" />}
    </tr>
  );
}
```

### Key Implementation Notes

1. **Compound Row**: Combines checkbox, expand button, cells, and actions
2. **Click Isolation**: Prevents row click when interacting with controls
3. **Accessible States**: Uses aria-selected and aria-expanded properly
4. **Flexible Columns**: Supports accessor functions for computed values

## Variants

### Basic Row

```tsx
const columns = [
  { id: "name", header: "Name", accessor: "name" },
  { id: "email", header: "Email", accessor: "email" },
  { id: "role", header: "Role", accessor: "role" },
];

<table>
  <tbody>
    <TableRow
      data={{ name: "John Doe", email: "john@example.com", role: "Admin" }}
      id="1"
      columns={columns}
    />
  </tbody>
</table>
```

### Selectable Row

```tsx
<TableRow
  data={user}
  id={user.id}
  columns={columns}
  selectable
  selected={selectedIds.includes(user.id)}
  onSelectChange={(checked) => toggleSelection(user.id, checked)}
/>
```

### Expandable Row

```tsx
<TableRow
  data={order}
  id={order.id}
  columns={columns}
  expandable
  renderExpanded={(order) => (
    <div className="space-y-2">
      <h4 className="font-medium">Order Items</h4>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>{item.name} x {item.quantity}</li>
        ))}
      </ul>
    </div>
  )}
/>
```

### Row with Actions

```tsx
<TableRow
  data={user}
  id={user.id}
  columns={columns}
  actions={[
    { label: "Edit", onClick: () => editUser(user.id), icon: <Pencil className="h-4 w-4" /> },
    { label: "Delete", onClick: () => deleteUser(user.id), variant: "destructive", icon: <Trash className="h-4 w-4" /> },
  ]}
/>
```

### Clickable Row

```tsx
<TableRow
  data={user}
  id={user.id}
  columns={columns}
  onClick={(user) => router.push(`/users/${user.id}`)}
/>
```

## States

| State | Background | Border | Checkbox | Actions |
|-------|------------|--------|----------|---------|
| Default | transparent | bottom | unchecked | visible |
| Hover | muted/50 | bottom | unchecked | visible |
| Selected | muted/50 | bottom | checked | visible |
| Expanded | transparent | bottom | - | visible |
| Disabled | transparent (50% opacity) | bottom | disabled | disabled |

## Accessibility

### Required ARIA Attributes

- `aria-selected` on selected rows
- `aria-expanded` on expandable rows
- `aria-label` on checkboxes and action buttons
- `role="rowheader"` on first cell if applicable

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move between interactive elements |
| `Space` | Toggle checkbox |
| `Enter` | Activate row (if clickable) |
| `Arrow Down/Up` | Navigate between rows (in table context) |

### Screen Reader Announcements

- Row selection state announced
- Expanded state announced
- Action menu items announced

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0",
    "@radix-ui/react-checkbox": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0"
  }
}
```

### Installation

```bash
npm install lucide-react @radix-ui/react-checkbox @radix-ui/react-dropdown-menu
```

## Examples

### Full Data Table

```tsx
import { TableRow, TableHeaderRow } from "@/components/ui/table-row";

const columns = [
  { id: "name", header: "Name", accessor: "name", sortable: true },
  { id: "email", header: "Email", accessor: "email", sortable: true },
  { id: "status", header: "Status", accessor: (row) => (
    <Badge variant={row.status === "active" ? "default" : "secondary"}>
      {row.status}
    </Badge>
  )},
];

export function UsersTable({ users }) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sortColumn, setSortColumn] = React.useState<string>();
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? users.map((u) => u.id) : []);
  };

  return (
    <table className="w-full">
      <thead>
        <TableHeaderRow
          columns={columns}
          selectable
          hasActions
          allSelected={selectedIds.length === users.length}
          someSelected={selectedIds.length > 0}
          onSelectAll={handleSelectAll}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </thead>
      <tbody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            data={user}
            id={user.id}
            columns={columns}
            selectable
            selected={selectedIds.includes(user.id)}
            onSelectChange={(checked) => {
              setSelectedIds((ids) =>
                checked
                  ? [...ids, user.id]
                  : ids.filter((id) => id !== user.id)
              );
            }}
            actions={[
              { label: "View", onClick: () => viewUser(user.id) },
              { label: "Edit", onClick: () => editUser(user.id) },
              { label: "Delete", onClick: () => deleteUser(user.id), variant: "destructive" },
            ]}
          />
        ))}
      </tbody>
    </table>
  );
}
```

### Order History with Expansion

```tsx
export function OrderHistory({ orders }) {
  return (
    <table className="w-full">
      <thead>
        <TableHeaderRow
          columns={orderColumns}
          expandable
        />
      </thead>
      <tbody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            data={order}
            id={order.id}
            columns={orderColumns}
            expandable
            renderExpanded={(order) => (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
            )}
          />
        ))}
      </tbody>
    </table>
  );
}
```

## Anti-patterns

### Missing Row Identification

```tsx
// Bad - no unique key or id
{users.map((user, index) => (
  <TableRow data={user} id={index} columns={columns} />
))}

// Good - use unique identifier
{users.map((user) => (
  <TableRow key={user.id} data={user} id={user.id} columns={columns} />
))}
```

### Nested Interactive Elements

```tsx
// Bad - button inside clickable row without isolation
<TableRow onClick={handleRowClick}>
  <Button onClick={handleButtonClick}>Action</Button>
</TableRow>

// Good - use actions prop which handles event isolation
<TableRow
  onClick={handleRowClick}
  actions={[{ label: "Action", onClick: handleButtonClick }]}
/>
```

### Inaccessible Expansion

```tsx
// Bad - no indication of expandability
<TableRow expandable />

// Good - clear expand/collapse indication
<TableRow
  expandable
  renderExpanded={(data) => <ExpandedContent data={data} />}
/>
```

## Related Skills

### Composes From
- [atoms/input-checkbox](../atoms/input-checkbox.md) - Selection
- [atoms/display-icon](../atoms/display-icon.md) - Indicators
- [atoms/input-button](../atoms/input-button.md) - Actions

### Composes Into
- [organisms/data-table](../organisms/data-table.md) - Full data table
- [organisms/kanban-board](../organisms/kanban-board.md) - Task lists

### Alternatives
- [molecules/list-item](./list-item.md) - For non-tabular data
- [molecules/card](./card.md) - For card-based layouts

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with selection, expansion, and actions
- TableHeaderRow component for header cells
- Sortable column support
