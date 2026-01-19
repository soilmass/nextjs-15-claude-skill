---
id: p-grid-systems
name: Grid Systems
version: 2.0.0
layer: L0
category: layout
composes: []
description: CSS Grid patterns, column systems, and responsive layout foundations
tags: [grid, layout, columns, responsive, css-grid, auto-fit, auto-fill]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Grid Systems

## Overview

Grid systems provide the structural foundation for page layouts. Modern CSS Grid enables powerful, flexible layouts without the constraints of traditional 12-column systems. This primitive defines grid patterns, column configurations, and responsive behaviors.

## Design Tokens

```css
/* Grid System Tokens */
:root {
  /* Column configurations */
  --grid-columns-1: 1;
  --grid-columns-2: 2;
  --grid-columns-3: 3;
  --grid-columns-4: 4;
  --grid-columns-6: 6;
  --grid-columns-12: 12;
  
  /* Gap scale (uses spacing tokens) */
  --grid-gap-none: 0;
  --grid-gap-xs: var(--spacing-1);    /* 4px */
  --grid-gap-sm: var(--spacing-2);    /* 8px */
  --grid-gap-md: var(--spacing-4);    /* 16px */
  --grid-gap-lg: var(--spacing-6);    /* 24px */
  --grid-gap-xl: var(--spacing-8);    /* 32px */
  --grid-gap-2xl: var(--spacing-12);  /* 48px */
  
  /* Container widths */
  --container-xs: 20rem;    /* 320px */
  --container-sm: 24rem;    /* 384px */
  --container-md: 28rem;    /* 448px */
  --container-lg: 32rem;    /* 512px */
  --container-xl: 36rem;    /* 576px */
  --container-2xl: 42rem;   /* 672px */
  --container-3xl: 48rem;   /* 768px */
  --container-4xl: 56rem;   /* 896px */
  --container-5xl: 64rem;   /* 1024px */
  --container-6xl: 72rem;   /* 1152px */
  --container-7xl: 80rem;   /* 1280px */
  --container-full: 100%;
  
  /* Content widths for readability */
  --content-width-prose: 65ch;
  --content-width-narrow: 45ch;
  --content-width-wide: 80ch;
  
  /* Minimum column widths for auto-fit/fill */
  --grid-min-xs: 8rem;      /* 128px */
  --grid-min-sm: 12rem;     /* 192px */
  --grid-min-md: 16rem;     /* 256px */
  --grid-min-lg: 20rem;     /* 320px */
  --grid-min-xl: 24rem;     /* 384px */
}
```

## Core Grid Patterns

### Fixed Column Grid

```css
/* Fixed column layouts */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* Usage */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--grid-gap-lg);
}
```

### Auto-Fit Grid (Responsive)

```css
/* Auto-fit: Columns stretch to fill space */
.grid-auto-fit-xs {
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-xs), 1fr));
}
.grid-auto-fit-sm {
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-sm), 1fr));
}
.grid-auto-fit-md {
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-md), 1fr));
}
.grid-auto-fit-lg {
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-lg), 1fr));
}

/* Cards that automatically wrap */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--grid-gap-lg);
}
```

### Auto-Fill Grid (Preserves Empty Columns)

```css
/* Auto-fill: Preserves empty column tracks */
.grid-auto-fill-xs {
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-xs), 1fr));
}
.grid-auto-fill-sm {
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-sm), 1fr));
}
.grid-auto-fill-md {
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-md), 1fr));
}

/* Gallery with consistent column sizes */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--grid-gap-sm);
}
```

### Subgrid Pattern

```css
/* Parent grid */
.page-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gap-lg);
}

/* Child inherits parent's grid */
.page-grid > .full-width {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
}

/* Nested alignment with parent */
.card-with-subgrid {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 4;
}
```

## Layout Patterns

### Holy Grail Layout

```css
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: var(--grid-gap-md);
}

.holy-grail > header { grid-area: header; }
.holy-grail > nav    { grid-area: nav; }
.holy-grail > main   { grid-area: main; }
.holy-grail > aside  { grid-area: aside; }
.holy-grail > footer { grid-area: footer; }

/* Responsive collapse */
@media (max-width: 768px) {
  .holy-grail {
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### Dashboard Layout

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 16rem 
    [sidebar-end content-start] 1fr 
    [content-end];
  grid-template-rows: 
    [header-start] auto 
    [header-end main-start] 1fr 
    [main-end];
  min-height: 100vh;
}

.dashboard-sidebar {
  grid-column: sidebar-start / sidebar-end;
  grid-row: 1 / -1;
}

.dashboard-header {
  grid-column: content-start / content-end;
  grid-row: header-start / header-end;
}

.dashboard-main {
  grid-column: content-start / content-end;
  grid-row: main-start / main-end;
  overflow-y: auto;
}

/* Collapsible sidebar */
.dashboard-grid.collapsed {
  grid-template-columns: 4rem 1fr;
}
```

### Magazine Layout

```css
.magazine-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: var(--grid-gap-md);
}

/* Featured article spans multiple cells */
.article-featured {
  grid-column: 1 / 5;
  grid-row: 1 / 3;
}

/* Sidebar articles */
.article-sidebar {
  grid-column: 5 / 7;
}

/* Full-width section */
.article-full {
  grid-column: 1 / -1;
}
```

### Masonry-like Layout

```css
/* CSS Grid masonry (with grid-template-rows: masonry - experimental) */
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-template-rows: masonry; /* Experimental */
  gap: var(--grid-gap-md);
}

/* Fallback using column-count */
@supports not (grid-template-rows: masonry) {
  .masonry-grid {
    display: block;
    column-count: 3;
    column-gap: var(--grid-gap-md);
  }
  
  .masonry-grid > * {
    break-inside: avoid;
    margin-bottom: var(--grid-gap-md);
  }
}
```

## Tailwind CSS Integration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      // Custom container sizes
      maxWidth: {
        'prose': '65ch',
        'narrow': '45ch',
        'wide': '80ch',
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      // Grid column configurations
      gridTemplateColumns: {
        // Auto-fit patterns
        'auto-fit-xs': 'repeat(auto-fit, minmax(8rem, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(12rem, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(16rem, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(20rem, 1fr))',
        'auto-fit-xl': 'repeat(auto-fit, minmax(24rem, 1fr))',
        
        // Auto-fill patterns
        'auto-fill-xs': 'repeat(auto-fill, minmax(8rem, 1fr))',
        'auto-fill-sm': 'repeat(auto-fill, minmax(12rem, 1fr))',
        'auto-fill-md': 'repeat(auto-fill, minmax(16rem, 1fr))',
        'auto-fill-lg': 'repeat(auto-fill, minmax(20rem, 1fr))',
        
        // Named grid areas
        'sidebar': '16rem 1fr',
        'sidebar-collapsed': '4rem 1fr',
        'sidebar-right': '1fr 20rem',
      },
      
      // Grid row configurations
      gridTemplateRows: {
        'layout': 'auto 1fr auto',
        'dashboard': 'auto 1fr',
      },
    },
  },
};

export default config;
```

## React Components

```tsx
// components/ui/grid.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
      'auto-fit-sm': 'grid-cols-auto-fit-sm',
      'auto-fit-md': 'grid-cols-auto-fit-md',
      'auto-fit-lg': 'grid-cols-auto-fit-lg',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 'md',
    align: 'stretch',
    justify: 'stretch',
  },
});

interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  as?: React.ElementType;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, align, justify, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(gridVariants({ cols, gap, align, justify }), className)}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

// Grid Item for spanning
interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12 | 'full';
  rowSpan?: 1 | 2 | 3 | 4 | 6;
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto';
  as?: React.ElementType;
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, colStart, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          colSpan === 'full' && 'col-span-full',
          colSpan && colSpan !== 'full' && `col-span-${colSpan}`,
          rowSpan && `row-span-${rowSpan}`,
          colStart && colStart !== 'auto' && `col-start-${colStart}`,
          className
        )}
        {...props}
      />
    );
  }
);
GridItem.displayName = 'GridItem';

export { Grid, GridItem, gridVariants };
```

## Responsive Patterns

```css
/* Mobile-first responsive grid */
.responsive-grid {
  display: grid;
  gap: var(--grid-gap-md);
  
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  /* Tablet: 2 columns */
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  /* Desktop: 3 columns */
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  /* Large desktop: 4 columns */
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Anti-patterns

### Avoid Fixed Pixel Widths

```css
/* Bad - Fixed widths break responsiveness */
.grid-bad {
  grid-template-columns: 300px 300px 300px;
}

/* Good - Flexible with minimum */
.grid-good {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

### Avoid Excessive Nesting

```css
/* Bad - Deep grid nesting */
.outer-grid > .inner-grid > .deeper-grid { ... }

/* Good - Use subgrid or flatten structure */
.page-grid {
  display: grid;
  grid-template-columns: subgrid;
}
```

## Related Primitives

- [spacing](./spacing.md) - Gap and padding values
- [breakpoints](./breakpoints.md) - Responsive breakpoints
- [container-queries](./container-queries.md) - Component-level responsiveness

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
