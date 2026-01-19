---
id: m-pagination
name: Pagination
version: 2.0.0
layer: L2
category: navigation
description: Page navigation with URL sync, edge detection, and responsive design
tags: [pagination, paging, navigation, pages, url-sync]
formula: "Pagination = PageButton(a-input-button) + Arrow(a-display-icon) + PageNumber(a-display-text)"
composes:
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
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

# Pagination

## Overview

The Pagination molecule provides navigation between pages of content with URL synchronization, smart page range display, and edge detection. Supports both controlled and URL-synced modes.

## When to Use

Use this skill when:
- Navigating through large datasets
- Paginating search results
- Building data tables with paging
- Creating blog post archives

## Composition Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                            Pagination                                  │
├───────────────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌──────┐    │
│  │ Prev │  │  1  │  │ ... │  │  4  │  │ [5] │  │  6  │  │ Next │    │
│  │Arrow │  │Page │  │ellip│  │Page │  │Page │  │Page │  │Arrow │    │
│  │(a-   │  │(a-  │  │sis  │  │(a-  │  │(a-  │  │(a-  │  │(a-   │    │
│  │disp- │  │input│  │     │  │input│  │input│  │input│  │disp- │    │
│  │lay-  │  │-btn)│  │     │  │-btn)│  │-btn)│  │-btn)│  │lay-  │    │
│  │icon) │  │     │  │     │  │     │  │activ│  │     │  │icon) │    │
│  │  <   │  │     │  │ ••• │  │     │  │     │  │     │  │  >   │    │
│  └──────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └──────┘    │
└───────────────────────────────────────────────────────────────────────┘

With Info Text:
┌───────────────────────────────────────────────────────────────────────┐
│  Showing 41 to 50 of 195 results          < [1] ... [4] [5] [6] ... > │
└───────────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [input-button](../atoms/input-button.md) - Page buttons
- [display-icon](../atoms/display-icon.md) - Arrow icons
- [display-text](../atoms/display-text.md) - Page numbers

## Implementation

```typescript
// components/ui/pagination.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./button";

interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** URL pattern for links (use [page] placeholder) */
  href?: string;
  /** Number of page buttons to show */
  siblingCount?: number;
  /** Show first/last page buttons */
  showEdges?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
}

function generatePagination(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | "ellipsis")[] {
  const totalNumbers = siblingCount * 2 + 3; // siblings + current + 2 edges
  const totalBlocks = totalNumbers + 2; // + 2 ellipsis

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1);
    return [...leftRange, "ellipsis", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => totalPages - (3 + siblingCount * 2) + i + 1
    );
    return [1, "ellipsis", ...rightRange];
  }

  const middleRange = Array.from(
    { length: siblingCount * 2 + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, "ellipsis", ...middleRange, "ellipsis", totalPages];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  href,
  siblingCount = 1,
  showEdges = true,
  size = "md",
  className,
}: PaginationProps) {
  const pages = generatePagination(currentPage, totalPages, siblingCount);

  const getPageHref = (page: number) => {
    if (!href) return undefined;
    return href.replace("[page]", String(page));
  };

  const handlePageClick = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    onPageChange?.(page);
  };

  const sizeStyles = {
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const PageButton = ({
    page,
    children,
    disabled,
    active,
  }: {
    page: number;
    children: React.ReactNode;
    disabled?: boolean;
    active?: boolean;
  }) => {
    const className = cn(
      buttonVariants({ variant: active ? "default" : "outline", size: "icon" }),
      sizeStyles[size],
      disabled && "pointer-events-none opacity-50"
    );

    if (href && !disabled) {
      return (
        <Link
          href={getPageHref(page)!}
          className={className}
          aria-current={active ? "page" : undefined}
        >
          {children}
        </Link>
      );
    }

    return (
      <Button
        variant={active ? "default" : "outline"}
        size="icon"
        className={sizeStyles[size]}
        onClick={() => handlePageClick(page)}
        disabled={disabled}
        aria-current={active ? "page" : undefined}
      >
        {children}
      </Button>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center gap-1", className)}
    >
      {/* Previous button */}
      <PageButton page={currentPage - 1} disabled={currentPage <= 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </PageButton>

      {/* Page numbers */}
      {pages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn(
                "flex items-center justify-center",
                sizeStyles[size]
              )}
              aria-hidden="true"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        return (
          <PageButton
            key={page}
            page={page}
            active={page === currentPage}
          >
            {page}
          </PageButton>
        );
      })}

      {/* Next button */}
      <PageButton page={currentPage + 1} disabled={currentPage >= totalPages}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </PageButton>
    </nav>
  );
}
```

```typescript
// components/ui/pagination-url.tsx
"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { Pagination } from "./pagination";

interface PaginationUrlProps {
  /** Total number of pages */
  totalPages: number;
  /** URL parameter name */
  paramName?: string;
  /** Items per page */
  pageSize?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  className?: string;
}

export function PaginationUrl({
  totalPages,
  paramName = "page",
  pageSize,
  onPageChange,
  className,
}: PaginationUrlProps) {
  const [page, setPage] = useQueryState(
    paramName,
    parseAsInteger.withDefault(1)
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      className={className}
    />
  );
}
```

```typescript
// components/ui/pagination-info.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  className,
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      Showing <span className="font-medium">{startItem}</span> to{" "}
      <span className="font-medium">{endItem}</span> of{" "}
      <span className="font-medium">{totalItems}</span> results
    </p>
  );
}
```

### Key Implementation Notes

1. **Smart Range**: Shows ellipsis for large page counts while keeping edges visible
2. **URL Sync**: Use `nuqs` for shareable paginated URLs

## Variants

### Basic Pagination

```tsx
<Pagination
  currentPage={5}
  totalPages={20}
  onPageChange={(page) => setPage(page)}
/>
```

### URL Synced

```tsx
<PaginationUrl totalPages={20} paramName="page" />
```

### With Info Text

```tsx
<div className="flex items-center justify-between">
  <PaginationInfo
    currentPage={5}
    pageSize={10}
    totalItems={195}
  />
  <Pagination
    currentPage={5}
    totalPages={20}
    onPageChange={handlePageChange}
  />
</div>
```

### Size Variants

```tsx
<Pagination currentPage={1} totalPages={10} size="sm" />
<Pagination currentPage={1} totalPages={10} size="md" />
<Pagination currentPage={1} totalPages={10} size="lg" />
```

### With Link Navigation

```tsx
<Pagination
  currentPage={5}
  totalPages={20}
  href="/products?page=[page]"
/>
```

## States

| State | Background | Border | Text | Cursor |
|-------|------------|--------|------|--------|
| Default | transparent | border | foreground | pointer |
| Hover | accent | border | foreground | pointer |
| Active | primary | primary | primary-foreground | default |
| Disabled | transparent | muted | muted | not-allowed |
| Focus | transparent | ring-2 | foreground | pointer |

## Accessibility

### Required ARIA Attributes

- `nav` with `role="navigation"` and `aria-label="Pagination"`
- `aria-current="page"` on active page button
- Screen reader text for prev/next buttons

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between buttons |
| `Enter/Space` | Activate button |
| `Arrow Left/Right` | Navigate (if implemented) |

### Screen Reader Announcements

- "Pagination navigation" landmark
- Page number announced for each button
- "Current page" for active page
- "Previous/Next page" for arrows

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "nuqs": "^2.2.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install nuqs lucide-react
```

## Examples

### Data Table Pagination

```tsx
import { Pagination, PaginationInfo } from "@/components/ui/pagination";

export function DataTableFooter({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <PaginationInfo
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
```

### Server Component with URL

```tsx
// app/products/page.tsx
import { PaginationUrl } from "@/components/ui/pagination-url";
import { getProducts } from "@/lib/api";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { products, totalPages } = await getProducts({ page, pageSize: 12 });

  return (
    <div>
      <ProductGrid products={products} />
      <PaginationUrl totalPages={totalPages} />
    </div>
  );
}
```

### Infinite Scroll Alternative

```tsx
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

export function PaginatedList({ items, totalPages, currentPage }) {
  const [page, setPage] = useState(currentPage);
  const [allItems, setAllItems] = useState(items);

  const loadMore = async () => {
    const nextPage = page + 1;
    const newItems = await fetchItems(nextPage);
    setAllItems([...allItems, ...newItems]);
    setPage(nextPage);
  };

  return (
    <div>
      <ItemList items={allItems} />
      
      {page < totalPages ? (
        <Button onClick={loadMore} className="w-full">
          Load More
        </Button>
      ) : (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

## Anti-patterns

### Missing Page Count Info

```tsx
// Bad - no context for user
<Pagination currentPage={5} totalPages={100} />

// Good - show where user is
<div>
  <PaginationInfo currentPage={5} pageSize={10} totalItems={1000} />
  <Pagination currentPage={5} totalPages={100} />
</div>
```

### No URL Sync

```tsx
// Bad - state lost on refresh
const [page, setPage] = useState(1);
<Pagination currentPage={page} onPageChange={setPage} />

// Good - URL synced
<PaginationUrl totalPages={100} />
```

### Showing All Pages

```tsx
// Bad - too many buttons
{Array.from({ length: 100 }).map((_, i) => (
  <button key={i}>{i + 1}</button>
))}

// Good - smart range with ellipsis
<Pagination currentPage={50} totalPages={100} siblingCount={1} />
```

## Related Skills

### Composes From
- [atoms/input-button](../atoms/input-button.md) - Page buttons
- [atoms/display-icon](../atoms/display-icon.md) - Arrow icons

### Composes Into
- [organisms/data-table](../organisms/data-table.md) - Table pagination
- [templates/search-results](../templates/search-results.md) - Search pagination

### Alternatives
- Infinite scroll - For feeds and timelines
- Load more button - For progressive loading

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with smart page range
- URL sync with nuqs
- PaginationInfo component
- Size variants
