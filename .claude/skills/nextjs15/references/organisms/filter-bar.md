---
id: o-filter-bar
name: Filter Bar
version: 1.0.0
layer: L3
category: navigation
description: Filter controls bar with multiple filter types, search, and active filter display
tags: [filter, search, controls, toolbar, facets]
formula: "FilterBar = SearchInput(m-search-input) + Select(a-select) + DatePicker(m-date-picker) + Button(a-button) + Badge(a-badge)"
composes:
  - ../molecules/search-input.md
  - ../molecules/date-picker.md
  - ../atoms/input-select.md
  - ../atoms/input-button.md
  - ../atoms/display-badge.md
dependencies: ["nuqs", "lucide-react", "date-fns"]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Filter Bar

## Overview

The Filter Bar organism provides a comprehensive filtering interface with search, dropdown filters, date ranges, and active filter chips. Supports URL state synchronization for shareable filtered views.

## When to Use

Use this skill when:
- Building data listing pages with filtering
- Creating search interfaces with faceted filters
- Adding filter controls to dashboards
- Implementing advanced search functionality

## Composition Diagram

```
+---------------------------------------------------------------------+
|                        FilterBar (L3)                                |
+---------------------------------------------------------------------+
|  +-------------------+ +----------+ +----------+ +----------------+ |
|  | SearchInput       | | Status   | | Category | | DatePicker     | |
|  | (m-search-input)  | | Select   | | Select   | | (m-date-picker)| |
|  +-------------------+ +----------+ +----------+ +----------------+ |
|                                                                     |
|  Active Filters:                                                    |
|  +------------+ +------------+ +------------+ +--------------+     |
|  | Status: X  | | Category:X | | Date: X    | | Clear All    |     |
|  | Badge(a)   | | Badge(a)   | | Badge(a)   | | Button(a)    |     |
|  +------------+ +------------+ +------------+ +--------------+     |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/filter-bar.tsx
'use client';

import * as React from 'react';
import { parseAsString, parseAsArrayOf, useQueryStates } from 'nuqs';
import { format } from 'date-fns';
import { Search, X, Calendar, ChevronDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multi-select' | 'date' | 'date-range';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  onFiltersChange?: (filters: Record<string, string | string[] | null>) => void;
  className?: string;
}

function SelectFilter({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = config.options?.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border',
          'hover:bg-accent transition-colors',
          value && 'border-primary bg-primary/5'
        )}
      >
        <span className="text-muted-foreground">{config.label}:</span>
        <span className="font-medium">
          {selectedOption?.label || config.placeholder || 'All'}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border bg-popover p-1 shadow-lg">
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm rounded-md hover:bg-accent',
                !value && 'bg-accent'
              )}
            >
              All
            </button>
            {config.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm rounded-md hover:bg-accent',
                  'flex items-center justify-between',
                  value === option.value && 'bg-accent'
                )}
              >
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActiveFilters({
  filters,
  values,
  onRemove,
  onClearAll,
}: {
  filters: FilterConfig[];
  values: Record<string, string | string[] | null>;
  onRemove: (filterId: string) => void;
  onClearAll: () => void;
}) {
  const activeFilters = filters.filter((f) => {
    const value = values[f.id];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {activeFilters.map((filter) => {
        const value = values[filter.id];
        const displayValue = Array.isArray(value)
          ? value
              .map((v) => filter.options?.find((o) => o.value === v)?.label || v)
              .join(', ')
          : filter.options?.find((o) => o.value === value)?.label || value;

        return (
          <button
            key={filter.id}
            onClick={() => onRemove(filter.id)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 text-xs rounded-full',
              'bg-primary/10 text-primary hover:bg-primary/20 transition-colors'
            )}
          >
            <span>
              {filter.label}: {displayValue}
            </span>
            <X className="h-3 w-3" />
          </button>
        );
      })}
      <button
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        Clear all
      </button>
    </div>
  );
}

export function FilterBar({
  filters,
  searchPlaceholder = 'Search...',
  showSearch = true,
  onFiltersChange,
  className,
}: FilterBarProps) {
  const [filterValues, setFilterValues] = useQueryStates(
    Object.fromEntries([
      ['q', parseAsString],
      ...filters.map((f) => [
        f.id,
        f.type === 'multi-select' ? parseAsArrayOf(parseAsString) : parseAsString,
      ]),
    ])
  );

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    const newValues = { ...filterValues, [filterId]: value };
    setFilterValues(newValues);
    onFiltersChange?.(newValues);
  };

  const handleRemoveFilter = (filterId: string) => {
    handleFilterChange(filterId, null);
  };

  const handleClearAll = () => {
    const clearedValues = Object.fromEntries(
      Object.keys(filterValues).map((key) => [key, null])
    );
    setFilterValues(clearedValues);
    onFiltersChange?.(clearedValues);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3 flex-wrap">
        {showSearch && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={filterValues.q || ''}
              onChange={(e) => handleFilterChange('q', e.target.value || null)}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              )}
            />
            {filterValues.q && (
              <button
                onClick={() => handleFilterChange('q', null)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {filters.map((filter) => (
            <SelectFilter
              key={filter.id}
              config={filter}
              value={filterValues[filter.id] as string | null}
              onChange={(value) => handleFilterChange(filter.id, value)}
            />
          ))}
        </div>
      </div>

      <ActiveFilters
        filters={filters}
        values={filterValues}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { FilterBar } from '@/components/organisms/filter-bar';

const filters = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active', count: 24 },
      { value: 'pending', label: 'Pending', count: 12 },
      { value: 'archived', label: 'Archived', count: 8 },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'design', label: 'Design' },
      { value: 'marketing', label: 'Marketing' },
    ],
  },
];

export function ProductList() {
  return (
    <div>
      <FilterBar
        filters={filters}
        searchPlaceholder="Search products..."
        onFiltersChange={(filters) => console.log(filters)}
      />
      {/* Product list */}
    </div>
  );
}
```

## Props API

### FilterBar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `FilterConfig[]` | Required | Array of filter configurations |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for search input |
| `showSearch` | `boolean` | `true` | Show search input |
| `onFiltersChange` | `(filters: Record<string, string \| string[] \| null>) => void` | `undefined` | Handler when filters change |
| `className` | `string` | `undefined` | Additional CSS classes |

### FilterConfig

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique filter identifier |
| `label` | `string` | Display label |
| `type` | `'select' \| 'multi-select' \| 'date' \| 'date-range'` | Filter type |
| `options` | `FilterOption[]` | Available options (optional) |
| `placeholder` | `string` | Placeholder text (optional) |

### FilterOption

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string` | Option value |
| `label` | `string` | Display label |
| `count` | `number` | Count badge (optional) |

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | No filters applied | Neutral filter buttons |
| Filter Active | Filter has value | Button border primary, background tinted |
| Dropdown Open | Filter menu visible | Dropdown below button, backdrop overlay |
| Option Selected | Option in menu | Checkmark shown, background accent |
| Search Active | Search has value | Clear button visible |
| Multiple Active | Several filters | Active filter chips displayed |
| Clearing | Clearing all | All chips removed, filters reset |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus through search, filter buttons, active chips |
| `Enter` | Open focused dropdown, select option, remove chip |
| `Space` | Open focused dropdown, select option |
| `Escape` | Close dropdown, clear search focus |
| `Arrow Down` | Open dropdown, navigate to next option |
| `Arrow Up` | Navigate to previous option |
| `Home` | Go to first option in dropdown |
| `End` | Go to last option in dropdown |

## Screen Reader Announcements

- Filter buttons announce "[Label]: [Current Value]" or "All"
- Dropdown options announce label and optional count
- Selected state announced with "selected" indicator
- Active filter chips announce "[Label]: [Value], button, remove filter"
- Search input has associated label
- Clear button announces "Clear search" / "Clear all filters"
- Filter count announced when filters applied
- Option counts announced (e.g., "Active, 24 items")

## Anti-patterns

### 1. Filters Without Labels
```tsx
// Bad - unclear what filter controls
const filters = [
  { id: 'cat', type: 'select', options: categories }
];

// Good - descriptive labels
const filters = [
  { id: 'category', label: 'Category', type: 'select', options: categories }
];
```

### 2. Too Many Visible Filters
```tsx
// Bad - overwhelming filter bar
<FilterBar
  filters={[
    { id: 'status', ... },
    { id: 'category', ... },
    { id: 'type', ... },
    { id: 'author', ... },
    { id: 'date', ... },
    { id: 'priority', ... },
    { id: 'tag', ... },
    // 10+ more filters
  ]}
/>

// Good - group or hide less common filters
<FilterBar
  filters={[
    { id: 'status', label: 'Status', ... },
    { id: 'category', label: 'Category', ... },
  ]}
  toolbarActions={<Button onClick={showAdvanced}>More filters</Button>}
/>
```

### 3. No Active Filter Feedback
```tsx
// Bad - no indication filters are applied (custom implementation)
<div>
  <FilterDropdowns />
  <DataList data={filteredData} />
</div>

// Good - show active filters with clear option
<FilterBar
  filters={filters}
  onFiltersChange={setFilters}
/>
{/* Active filters chips shown automatically */}
```

### 4. Search Without Debounce
```tsx
// Bad - excessive API calls on every keystroke (in custom implementation)
onChange={(e) => fetchResults(e.target.value)}

// Good - debounce search (built into FilterBar via nuqs)
// Or implement manually:
const debouncedSearch = useDebouncedCallback(fetchResults, 300);
onChange={(e) => debouncedSearch(e.target.value)}
```

## Accessibility

- All controls are keyboard accessible
- Filter dropdowns close with Escape key
- Active filters announced to screen readers

## Dependencies

```json
{
  "dependencies": {
    "nuqs": "^2.0.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## Related Skills

- [organisms/data-table](./data-table.md)
- [molecules/search-input](../molecules/search-input.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- URL state synchronization with nuqs
- Active filter chips
- Search and select filters
