---
id: m-breadcrumb
name: Breadcrumb
version: 2.0.0
layer: L2
category: navigation
description: Hierarchical navigation breadcrumbs with auto-collapse and separators
tags: [breadcrumb, navigation, hierarchy, trail, path]
formula: "Breadcrumb = Link(a-interactive-link) + Separator(a-display-icon) + CurrentPage(a-display-text)"
composes:
  - ../atoms/interactive-link.md
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
dependencies:
  next: "^15.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Breadcrumb

## Overview

The Breadcrumb molecule provides hierarchical navigation showing the user's location within the site structure. Supports auto-collapse for long paths, custom separators, and proper ARIA navigation landmark semantics.

## When to Use

Use this skill when:
- Showing page hierarchy in multi-level navigation
- Helping users understand their location
- Providing quick navigation to parent pages
- Building e-commerce category navigation

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Breadcrumb                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌───┐   ┌──────────┐   ┌───┐   ┌─────────────┐ │
│  │   Link   │   │Sep│   │   Link   │   │Sep│   │ CurrentPage │ │
│  │(a-inter- │   │(a-│   │(a-inter- │   │(a-│   │(a-display-  │ │
│  │ active-  │   │dis│   │ active-  │   │dis│   │   text)     │ │
│  │  link)   │   │pla│   │  link)   │   │pla│   │             │ │
│  │          │   │y- │   │          │   │y- │   │  "Laptops"  │ │
│  │  "Home"  │   │ico│   │"Products"│   │ico│   │  [current]  │ │
│  │    🏠    │   │n) │   │          │   │n) │   │             │ │
│  │          │   │ > │   │          │   │ > │   │             │ │
│  └──────────┘   └───┘   └──────────┘   └───┘   └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Collapsed State (long paths):
┌─────────────────────────────────────────────────────────────────┐
│  🏠  >  [...]  >  Gaming  >  ASUS ROG Zephyrus                  │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [interactive-link](../atoms/interactive-link.md) - Breadcrumb links
- [display-icon](../atoms/display-icon.md) - Separators and icons
- [display-text](../atoms/display-text.md) - Current page label

## Implementation

```typescript
// components/ui/breadcrumb.tsx
import * as React from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Separator between items */
  separator?: React.ReactNode;
  /** Max items before collapsing */
  maxItems?: number;
  /** Show home icon for first item */
  showHomeIcon?: boolean;
  className?: string;
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems = 4,
  showHomeIcon = false,
  className,
}: BreadcrumbProps) {
  const [expanded, setExpanded] = React.useState(false);
  
  // Determine if we need to collapse
  const shouldCollapse = items.length > maxItems && !expanded;
  
  let displayItems = items;
  if (shouldCollapse) {
    // Show first, ellipsis, and last (maxItems - 2) items
    const visibleEnd = maxItems - 1;
    displayItems = [
      items[0],
      { label: "...", href: undefined }, // Ellipsis placeholder
      ...items.slice(-(visibleEnd - 1)),
    ];
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {displayItems.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === "...";
          
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {/* Separator */}
              {!isFirst && (
                <span aria-hidden="true" className="text-muted-foreground/50">
                  {separator}
                </span>
              )}
              
              {/* Ellipsis button */}
              {isEllipsis ? (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md",
                    "hover:bg-accent hover:text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                  aria-label="Show all breadcrumbs"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              ) : isLast ? (
                /* Current page */
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                /* Link */
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-1 transition-colors",
                    "hover:text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:rounded-sm"
                  )}
                >
                  {isFirst && showHomeIcon ? (
                    <Home className="h-4 w-4" aria-label={item.label} />
                  ) : (
                    <>
                      {item.icon}
                      {item.label}
                    </>
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

```typescript
// components/ui/breadcrumb-json-ld.tsx
import { BreadcrumbList, WithContext } from "schema-dts";

interface BreadcrumbJsonLdProps {
  items: Array<{ label: string; href: string }>;
  baseUrl: string;
}

export function BreadcrumbJsonLd({ items, baseUrl }: BreadcrumbJsonLdProps) {
  const jsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

```typescript
// components/ui/auto-breadcrumb.tsx
"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "./breadcrumb";

interface AutoBreadcrumbProps {
  /** Map of path segments to labels */
  labels?: Record<string, string>;
  /** Home label */
  homeLabel?: string;
  className?: string;
}

export function AutoBreadcrumb({
  labels = {},
  homeLabel = "Home",
  className,
}: AutoBreadcrumbProps) {
  const pathname = usePathname();
  
  // Split path into segments
  const segments = pathname.split("/").filter(Boolean);
  
  // Build breadcrumb items
  const items = [
    { label: homeLabel, href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = labels[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      
      return { label, href };
    }),
  ];

  // Don't render if only home
  if (items.length <= 1) return null;

  return <Breadcrumb items={items} showHomeIcon className={className} />;
}
```

### Key Implementation Notes

1. **Auto-Collapse**: Prevents breadcrumb overflow on deep paths
2. **SEO**: Include JSON-LD structured data for search engines

## Variants

### Basic Breadcrumb

```tsx
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
    { label: "Laptops" },
  ]}
/>
```

### With Home Icon

```tsx
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings" },
  ]}
  showHomeIcon
/>
```

### Custom Separator

```tsx
<Breadcrumb
  items={items}
  separator={<span className="mx-1">/</span>}
/>
```

### Auto-Collapsing

```tsx
<Breadcrumb
  items={longPath}
  maxItems={3}
/>
// Shows: Home > ... > Current Page
```

### Auto-Generated from URL

```tsx
<AutoBreadcrumb
  labels={{
    "products": "Products",
    "electronics": "Electronics",
  }}
/>
```

## States

| State | Text Color | Decoration | Separator |
|-------|------------|------------|-----------|
| Link | muted-foreground | none | visible |
| Link:Hover | foreground | none | visible |
| Link:Focus | foreground | ring-2 | visible |
| Current | foreground | none | visible |
| Ellipsis | muted-foreground | button | visible |

## Accessibility

### Required ARIA Attributes

- `nav` with `aria-label="Breadcrumb"`
- `aria-current="page"` on current page
- `ol` list structure for screen readers

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between links |
| `Enter` | Activate link |
| `Space` | Expand collapsed items |

### Screen Reader Announcements

- "Breadcrumb navigation" landmark
- Each link read with position
- "Current page" announced for last item

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "lucide-react": "^0.460.0",
    "schema-dts": "^1.1.2"
  }
}
```

### Installation

```bash
npm install lucide-react schema-dts
```

## Examples

### E-commerce Category Path

```tsx
import { Breadcrumb, BreadcrumbJsonLd } from "@/components/ui/breadcrumb";

export function ProductPage({ product }) {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: product.category, href: `/category/${product.categorySlug}` },
    { label: product.subcategory, href: `/category/${product.categorySlug}/${product.subcategorySlug}` },
    { label: product.name },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} baseUrl="https://example.com" />
      <Breadcrumb items={breadcrumbs} />
      {/* Product content */}
    </>
  );
}
```

### With Icons

```tsx
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Home, FolderOpen, FileText } from "lucide-react";

export function DocumentBreadcrumb() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
        { label: "Documents", href: "/docs", icon: <FolderOpen className="h-4 w-4" /> },
        { label: "Getting Started", icon: <FileText className="h-4 w-4" /> },
      ]}
    />
  );
}
```

### Dynamic from Router

```tsx
// app/[...slug]/page.tsx
import { AutoBreadcrumb } from "@/components/ui/auto-breadcrumb";

export default function DynamicPage() {
  return (
    <div>
      <AutoBreadcrumb
        labels={{
          "docs": "Documentation",
          "guides": "Guides",
          "api": "API Reference",
        }}
      />
      {/* Page content */}
    </div>
  );
}
```

### Long Path with Collapse

```tsx
import { Breadcrumb } from "@/components/ui/breadcrumb";

export function DeepNavigation() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
    { label: "Computers", href: "/products/electronics/computers" },
    { label: "Laptops", href: "/products/electronics/computers/laptops" },
    { label: "Gaming", href: "/products/electronics/computers/laptops/gaming" },
    { label: "ASUS ROG Zephyrus" },
  ];

  return (
    <Breadcrumb
      items={items}
      maxItems={4}
      showHomeIcon
    />
  );
  // Renders: 🏠 > ... > Gaming > ASUS ROG Zephyrus
}
```

## Anti-patterns

### Missing Navigation Landmark

```tsx
// Bad - no semantic navigation
<div className="breadcrumbs">
  <a href="/">Home</a> / <a href="/products">Products</a>
</div>

// Good - proper landmark and list structure
<Breadcrumb items={items} />
// Renders with <nav aria-label="Breadcrumb"><ol>...</ol></nav>
```

### Current Page as Link

```tsx
// Bad - current page shouldn't be a link
{ label: "Current Page", href: "/current" } // Last item with href

// Good - last item without href
{ label: "Current Page" } // No href, renders as text
```

### No Current Page Indicator

```tsx
// Bad - no distinction for current page
items.map(item => <a href={item.href}>{item.label}</a>)

// Good - aria-current and visual distinction
// Breadcrumb component handles this automatically
```

## Related Skills

### Composes From
- [atoms/interactive-link](../atoms/interactive-link.md) - Breadcrumb links
- [atoms/display-icon](../atoms/display-icon.md) - Icons and separators

### Composes Into
- [organisms/header](../organisms/header.md) - Header breadcrumb
- [templates/documentation](../templates/documentation.md) - Doc breadcrumb

### Alternatives
- [molecules/nav-link](./nav-link.md) - For primary navigation
- [molecules/tabs](./tabs.md) - For content switching

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with auto-collapse
- JSON-LD structured data support
- AutoBreadcrumb from pathname
- Home icon option
