---
id: p-z-index
name: Z-Index
version: 2.0.0
layer: L0
category: layout
composes: []
description: Z-index layering scale
tags: [design-tokens, z-index, layers, stacking]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: false
---

# Z-Index

## Overview

The z-index system provides a predictable layering scale for stacking contexts. A well-defined scale prevents z-index wars and ensures consistent layering across all components.

Key principles:
- Semantic naming over arbitrary numbers
- Large gaps between levels for future additions
- Consistent use across all components

## When to Use

Use this skill when:
- Creating overlays, modals, or dropdowns
- Managing stacking contexts
- Ensuring proper layering of fixed elements
- Debugging z-index issues

## Implementation

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      zIndex: {
        base: "0",
        docked: "10",
        dropdown: "1000",
        sticky: "1100",
        banner: "1200",
        overlay: "1300",
        modal: "1400",
        popover: "1500",
        tooltip: "1600",
      },
    },
  },
};

export default config;
```

### globals.css

```css
@layer base {
  :root {
    /* Z-index scale as CSS variables */
    --z-base: 0;
    --z-docked: 10;
    --z-dropdown: 1000;
    --z-sticky: 1100;
    --z-banner: 1200;
    --z-overlay: 1300;
    --z-modal: 1400;
    --z-popover: 1500;
    --z-tooltip: 1600;
    --z-max: 9999;
  }
}
```

## Z-Index Reference

| Name | Value | Use Case |
|------|-------|----------|
| base | 0 | Default layer |
| docked | 10 | Docked sidebars, fab buttons |
| dropdown | 1000 | Dropdown menus, select |
| sticky | 1100 | Sticky headers, footers |
| banner | 1200 | Notification banners |
| overlay | 1300 | Background overlays |
| modal | 1400 | Modal dialogs |
| popover | 1500 | Popovers, tooltips in modals |
| tooltip | 1600 | Tooltips (always on top) |

## Variants

### Extended Scale

```typescript
// For complex UIs with more layers
zIndex: {
  hide: "-1",
  base: "0",
  raised: "1",
  docked: "10",
  dropdown: "1000",
  sticky: "1100",
  banner: "1200",
  overlay: "1300",
  modal: "1400",
  popover: "1500",
  skipLink: "1550", // Accessibility skip links
  tooltip: "1600",
  toast: "1700",
  max: "9999",
}
```

## Component Mapping

| Component | Z-Index | Notes |
|-----------|---------|-------|
| FAB | docked | Floats above content |
| Dropdown | dropdown | Above content, below modals |
| Header | sticky | Sticky navigation |
| Toast | tooltip | Always visible |
| Dialog | modal | Modal windows |
| Sheet | modal | Side sheets |
| Tooltip | tooltip | Information popups |
| Command Palette | modal | Global search |

## Stacking Context Rules

1. **New stacking context is created by:**
   - `position: fixed` or `position: sticky`
   - `position: absolute/relative` with `z-index`
   - `opacity` less than 1
   - `transform`, `filter`, `perspective`
   - `isolation: isolate`

2. **Best practices:**
   - Use `isolation: isolate` on containers
   - Keep z-index values low within components
   - Use semantic classes, not arbitrary values

```tsx
// Create isolated stacking context
<div className="relative isolate">
  <div className="absolute z-10">Layer 1</div>
  <div className="absolute z-20">Layer 2</div>
</div>
```

## Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0"
  }
}
```

## Examples

### Sticky Header

```tsx
<header className="sticky top-0 z-sticky bg-background/80 backdrop-blur-sm border-b">
  <nav className="container flex items-center h-16">
    {/* Navigation content */}
  </nav>
</header>
```

### Modal with Overlay

```tsx
<div className="fixed inset-0 z-overlay bg-black/50" aria-hidden="true" />
<div 
  className="fixed inset-0 z-modal flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
>
  <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
    {/* Modal content */}
  </div>
</div>
```

### Dropdown Menu

```tsx
<div className="relative">
  <button>Open Menu</button>
  <div className="absolute top-full left-0 z-dropdown mt-2 bg-popover rounded-md shadow-md">
    {/* Menu items */}
  </div>
</div>
```

### Tooltip

```tsx
<div className="relative group">
  <button>Hover me</button>
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-tooltip opacity-0 group-hover:opacity-100 transition-opacity">
    <div className="bg-popover text-popover-foreground px-3 py-1.5 rounded text-sm shadow-md">
      Tooltip content
    </div>
  </div>
</div>
```

## Anti-patterns

### Arbitrary Z-Index Values

```tsx
// Bad - arbitrary values cause conflicts
<div className="z-[999]">...</div>
<div className="z-[9999]">...</div>

// Good - use semantic scale
<div className="z-modal">...</div>
<div className="z-tooltip">...</div>
```

### Z-Index Without Position

```tsx
// Bad - z-index has no effect
<div className="z-50">...</div>

// Good - needs positioning
<div className="relative z-50">...</div>
// or
<div className="fixed z-50">...</div>
```

### Nested Z-Index Conflicts

```tsx
// Bad - child can't escape parent stacking context
<div className="relative z-10">
  <div className="relative z-[9999]">Won't be on top</div>
</div>

// Good - use isolation or restructure
<div className="relative isolate z-10">
  <div className="relative z-10">Within context</div>
</div>
<div className="relative z-20">Above the container</div>
```

## Related Skills

### Composes Into
- [header](../organisms/header.md) - Sticky header
- [dialog](../organisms/dialog.md) - Modal stacking
- [interactive-tooltip](../atoms/interactive-tooltip.md) - Tooltip layer

### Related
- [motion](./motion.md) - Animation during layer changes

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
