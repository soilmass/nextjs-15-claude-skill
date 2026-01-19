---
id: m-search-input
name: Search Input
version: 2.0.0
layer: L2
category: forms
description: Search input with icon, clear button, and keyboard shortcut support
tags: [search, input, filter, query, cmd-k]
formula: "SearchInput = Input(a-input-text) + SearchIcon(a-display-icon) + ClearButton(a-input-button) + Spinner(a-feedback-spinner)"
composes:
  - ../atoms/input-text.md
  - ../atoms/display-icon.md
  - ../atoms/input-button.md
  - ../atoms/feedback-spinner.md
dependencies:
  next: "^15.0.0"
  nuqs: "^2.2.0"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Search Input

## Overview

The Search Input molecule combines a text input with search icon, clear button, and optional keyboard shortcut hint. Supports debounced search, URL sync, and command palette trigger (Cmd+K).

## When to Use

Use this skill when:
- Building search interfaces for lists or content
- Adding filter functionality to data tables
- Creating command palette triggers
- Implementing site-wide search

## Composition Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      SearchInput                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌─────────────────────────┐  ┌─────┐  ┌───┐ │
│  │Search│  │         Input           │  │Clear│  │⌘K │ │
│  │ Icon │  │     (a-input-text)      │  │ Btn │  │   │ │
│  │(a-   │  │                         │  │(a-  │  │kbd│ │
│  │disp- │  │   "Search..."           │  │input│  │   │ │
│  │lay-  │  │                         │  │-btn)│  │   │ │
│  │icon) │  │                         │  │  ✕  │  │   │ │
│  │  🔍  │  │                         │  │     │  │   │ │
│  └──────┘  └─────────────────────────┘  └─────┘  └───┘ │
└─────────────────────────────────────────────────────────┘

Loading State:
┌─────────────────────────────────────────────────────────┐
│  🔍  │  "searching..."              │  ⟳ (spinner)     │
└─────────────────────────────────────────────────────────┘
```

## Atoms Used

- [input-text](../atoms/input-text.md) - Base input
- [display-icon](../atoms/display-icon.md) - Search and clear icons
- [input-button](../atoms/input-button.md) - Clear button
- [feedback-spinner](../atoms/feedback-spinner.md) - Loading state

## Implementation

```typescript
// components/ui/search-input.tsx
"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled */
  defaultValue?: string;
  /** Change handler (debounced) */
  onSearch?: (value: string) => void;
  /** Change handler (immediate) */
  onChange?: (value: string) => void;
  /** Debounce delay in ms */
  debounce?: number;
  /** Show loading spinner */
  loading?: boolean;
  /** Show keyboard shortcut hint */
  showShortcut?: boolean;
  /** Shortcut key to display */
  shortcutKey?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export function SearchInput({
  value: controlledValue,
  defaultValue = "",
  onSearch,
  onChange,
  debounce = 300,
  loading = false,
  showShortcut = false,
  shortcutKey = "K",
  size = "md",
  className,
  placeholder = "Search...",
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search callback
  const debouncedValue = useDebounce(value, debounce);
  
  React.useEffect(() => {
    if (onSearch && debouncedValue !== undefined) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  // Keyboard shortcut handler
  React.useEffect(() => {
    if (!showShortcut) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showShortcut, shortcutKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setInternalValue("");
    onChange?.("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const sizeStyles = {
    sm: "h-8 text-sm pl-8 pr-8",
    md: "h-10 text-sm pl-10 pr-10",
    lg: "h-12 text-base pl-12 pr-12",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon */}
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          iconSizes[size]
        )}
        aria-hidden="true"
      />

      {/* Input */}
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-input bg-background ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeStyles[size]
        )}
        {...props}
      />

      {/* Right side icons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {loading && (
          <Loader2
            className={cn("animate-spin text-muted-foreground", iconSizes[size])}
            aria-label="Searching"
          />
        )}
        
        {!loading && value && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "rounded-sm p-0.5 text-muted-foreground hover:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            aria-label="Clear search"
          >
            <X className={iconSizes[size]} />
          </button>
        )}

        {showShortcut && !value && !loading && (
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
            <span className="text-xs">⌘</span>{shortcutKey}
          </kbd>
        )}
      </div>
    </div>
  );
}
```

```typescript
// hooks/use-debounce.ts
import * as React from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// components/ui/search-input-url.tsx
"use client";

import { useQueryState } from "nuqs";
import { SearchInput } from "./search-input";

interface SearchInputUrlProps {
  /** URL parameter name */
  paramName?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when search changes */
  onSearch?: (value: string) => void;
}

export function SearchInputUrl({
  paramName = "q",
  placeholder = "Search...",
  onSearch,
}: SearchInputUrlProps) {
  const [query, setQuery] = useQueryState(paramName, {
    defaultValue: "",
    throttleMs: 300,
  });

  const handleSearch = (value: string) => {
    setQuery(value || null);
    onSearch?.(value);
  };

  return (
    <SearchInput
      value={query}
      onSearch={handleSearch}
      placeholder={placeholder}
      showShortcut
    />
  );
}
```

### Key Implementation Notes

1. **Debouncing**: Prevents excessive API calls during typing
2. **URL Sync**: Use `nuqs` for shareable search URLs

## Variants

### Basic Search

```tsx
<SearchInput
  placeholder="Search items..."
  onSearch={(query) => handleSearch(query)}
/>
```

### With Loading State

```tsx
<SearchInput
  value={query}
  onChange={setQuery}
  loading={isSearching}
  placeholder="Search..."
/>
```

### With Keyboard Shortcut

```tsx
<SearchInput
  showShortcut
  shortcutKey="K"
  placeholder="Search or press ⌘K..."
/>
```

### URL Synced

```tsx
<SearchInputUrl
  paramName="search"
  placeholder="Search products..."
/>
```

### Size Variants

```tsx
<SearchInput size="sm" placeholder="Small search..." />
<SearchInput size="md" placeholder="Medium search..." />
<SearchInput size="lg" placeholder="Large search..." />
```

## States

| State | Icon | Border | Clear Button | Shortcut |
|-------|------|--------|--------------|----------|
| Empty | search (muted) | input | hidden | visible |
| Typing | search (muted) | input | hidden | hidden |
| Has Value | search (muted) | input | visible | hidden |
| Loading | search (muted) | input | hidden (spinner) | hidden |
| Focus | search | ring | visible/hidden | hidden |
| Disabled | search (muted) | muted | hidden | hidden |

## Accessibility

### Required ARIA Attributes

- `type="search"` - Semantic search input
- `aria-label` on clear button
- Keyboard shortcut documented in UI

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Focus search (when showShortcut) |
| `Escape` | Clear and blur (native) |
| `Enter` | Submit search |

### Screen Reader Announcements

- "Search" input role announced
- "Clear search" button announced
- Loading state announced via spinner label

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0",
    "nuqs": "^2.2.0"
  }
}
```

### Installation

```bash
npm install lucide-react nuqs
```

## Examples

### Table Filter

```tsx
import { SearchInput } from "@/components/ui/search-input";
import { DataTable } from "@/components/ui/data-table";

export function FilterableTable({ data }) {
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredData(data);
      return;
    }
    
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div className="space-y-4">
      <SearchInput
        placeholder="Filter by name..."
        onSearch={handleSearch}
        debounce={200}
      />
      <DataTable data={filteredData} />
    </div>
  );
}
```

### Command Palette Trigger

```tsx
import { SearchInput } from "@/components/ui/search-input";
import { useCommandPalette } from "@/hooks/use-command-palette";

export function SearchTrigger() {
  const { open } = useCommandPalette();

  return (
    <SearchInput
      showShortcut
      shortcutKey="K"
      placeholder="Search..."
      onFocus={open}
      readOnly
      className="cursor-pointer"
    />
  );
}
```

### With Async Search

```tsx
import { SearchInput } from "@/components/ui/search-input";
import { searchProducts } from "@/lib/api";

export function ProductSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchProducts(query);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <SearchInput
        onSearch={handleSearch}
        loading={loading}
        placeholder="Search products..."
        debounce={300}
      />
      
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-md border bg-popover shadow-lg">
          {results.map((result) => (
            <SearchResult key={result.id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### URL Synced with Server Components

```tsx
// app/products/page.tsx
import { SearchInputUrl } from "@/components/ui/search-input-url";
import { ProductList } from "@/components/product-list";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const products = await getProducts({ search: searchParams.q });

  return (
    <div className="space-y-6">
      <SearchInputUrl
        paramName="q"
        placeholder="Search products..."
      />
      <ProductList products={products} />
    </div>
  );
}
```

## Anti-patterns

### Missing Debounce for API Calls

```tsx
// Bad - fires API on every keystroke
<input
  type="search"
  onChange={(e) => searchAPI(e.target.value)}
/>

// Good - debounced search
<SearchInput
  onSearch={(query) => searchAPI(query)}
  debounce={300}
/>
```

### No Loading Indicator

```tsx
// Bad - no feedback during search
<SearchInput onSearch={asyncSearch} />

// Good - show loading state
<SearchInput
  onSearch={asyncSearch}
  loading={isSearching}
/>
```

### Non-Clearable Search

```tsx
// Bad - user can't easily clear
<input type="text" value={query} />

// Good - clear button included
<SearchInput value={query} onChange={setQuery} />
```

## Related Skills

### Composes From
- [atoms/input-text](../atoms/input-text.md) - Base input
- [atoms/display-icon](../atoms/display-icon.md) - Icons
- [atoms/feedback-spinner](../atoms/feedback-spinner.md) - Loading

### Composes Into
- [organisms/header](../organisms/header.md) - Header search
- [organisms/command-palette](../organisms/command-palette.md) - Cmd+K trigger
- [organisms/data-table](../organisms/data-table.md) - Table filtering

### Alternatives
- [molecules/combobox](./combobox.md) - For autocomplete with dropdown
- Native `<input type="search">` - For simple cases

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with debouncing
- Keyboard shortcut support (Cmd+K)
- URL sync with nuqs integration
- Loading and clear states
