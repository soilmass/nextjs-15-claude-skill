---
id: p-logical-properties
name: Logical Properties
version: 2.0.0
layer: L0
category: layout
composes: []
description: CSS logical properties for internationalization and RTL/LTR support
tags: [logical-properties, rtl, ltr, internationalization, i18n, bidirectional]
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Logical Properties

## Overview

CSS logical properties enable layouts that automatically adapt to different writing directions (LTR/RTL) and writing modes (horizontal/vertical). Using logical properties instead of physical properties (left/right) ensures proper rendering for Arabic, Hebrew, and other RTL languages.

## Core Concepts

### Physical vs Logical

| Physical | Logical (Horizontal) | Description |
|----------|---------------------|-------------|
| `left` | `inline-start` | Start of text direction |
| `right` | `inline-end` | End of text direction |
| `top` | `block-start` | Start of block flow |
| `bottom` | `block-end` | End of block flow |
| `width` | `inline-size` | Size in inline direction |
| `height` | `block-size` | Size in block direction |

### Writing Modes

```css
/* Horizontal (default for most languages) */
.horizontal {
  writing-mode: horizontal-tb;
  direction: ltr; /* or rtl for Arabic/Hebrew */
}

/* Vertical (for Japanese, Chinese, etc.) */
.vertical-rl {
  writing-mode: vertical-rl; /* Right to left */
}

.vertical-lr {
  writing-mode: vertical-lr; /* Left to right */
}
```

## Design Tokens

```css
/* Logical Property Tokens */
:root {
  /* Margin tokens using logical properties */
  --margin-inline-xs: 0.25rem;
  --margin-inline-sm: 0.5rem;
  --margin-inline-md: 1rem;
  --margin-inline-lg: 1.5rem;
  --margin-inline-xl: 2rem;
  
  --margin-block-xs: 0.25rem;
  --margin-block-sm: 0.5rem;
  --margin-block-md: 1rem;
  --margin-block-lg: 1.5rem;
  --margin-block-xl: 2rem;
  
  /* Padding tokens using logical properties */
  --padding-inline-xs: 0.25rem;
  --padding-inline-sm: 0.5rem;
  --padding-inline-md: 1rem;
  --padding-inline-lg: 1.5rem;
  --padding-inline-xl: 2rem;
  
  --padding-block-xs: 0.25rem;
  --padding-block-sm: 0.5rem;
  --padding-block-md: 1rem;
  --padding-block-lg: 1.5rem;
  --padding-block-xl: 2rem;
  
  /* Border radius tokens using logical properties */
  --radius-start-start: 0.5rem;
  --radius-start-end: 0.5rem;
  --radius-end-start: 0.5rem;
  --radius-end-end: 0.5rem;
}
```

## Property Mapping

### Margin and Padding

```css
/* Physical properties (avoid) */
.physical {
  margin-left: 1rem;
  margin-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

/* Logical properties (preferred) */
.logical {
  margin-inline-start: 1rem;  /* Left in LTR, Right in RTL */
  margin-inline-end: 1rem;    /* Right in LTR, Left in RTL */
  padding-block-start: 0.5rem; /* Top */
  padding-block-end: 0.5rem;   /* Bottom */
}

/* Shorthand logical properties */
.shorthand {
  margin-inline: 1rem;         /* Both inline sides */
  margin-block: 0.5rem;        /* Both block sides */
  padding-inline: 1rem 2rem;   /* Start and end different */
  padding-block: 0.5rem 1rem;  /* Start and end different */
}
```

### Sizing

```css
/* Physical sizing (avoid for flexible layouts) */
.physical-size {
  width: 300px;
  height: 200px;
  min-width: 100px;
  max-height: 400px;
}

/* Logical sizing (preferred) */
.logical-size {
  inline-size: 300px;      /* Width in horizontal writing mode */
  block-size: 200px;       /* Height in horizontal writing mode */
  min-inline-size: 100px;
  max-block-size: 400px;
}
```

### Position and Inset

```css
/* Physical positioning (avoid) */
.physical-position {
  position: absolute;
  top: 0;
  left: 0;
  right: auto;
  bottom: auto;
}

/* Logical positioning (preferred) */
.logical-position {
  position: absolute;
  inset-block-start: 0;   /* Top */
  inset-inline-start: 0;  /* Left in LTR */
  inset-inline-end: auto; /* Right in LTR */
  inset-block-end: auto;  /* Bottom */
}

/* Inset shorthand */
.inset-shorthand {
  /* block-start block-end inline-start inline-end */
  inset: 0 auto auto 0;
  
  /* Or individual axes */
  inset-block: 0 auto;
  inset-inline: 0 auto;
}
```

### Border

```css
/* Physical borders (avoid) */
.physical-border {
  border-left: 2px solid blue;
  border-top-left-radius: 8px;
}

/* Logical borders (preferred) */
.logical-border {
  border-inline-start: 2px solid blue;
  border-start-start-radius: 8px; /* Top-left in LTR */
  border-start-end-radius: 8px;   /* Top-right in LTR */
  border-end-start-radius: 8px;   /* Bottom-left in LTR */
  border-end-end-radius: 8px;     /* Bottom-right in LTR */
}

/* Border width shorthand */
.border-logical {
  border-inline-width: 1px 2px;  /* Start and end */
  border-block-width: 1px;       /* Both block sides */
}
```

### Text Alignment

```css
/* Physical alignment (avoid) */
.physical-align {
  text-align: left;
}

/* Logical alignment (preferred) */
.logical-align {
  text-align: start; /* Left in LTR, Right in RTL */
}

.logical-align-end {
  text-align: end;   /* Right in LTR, Left in RTL */
}
```

### Float and Clear

```css
/* Physical float (avoid) */
.physical-float {
  float: left;
  clear: right;
}

/* Logical float (preferred) */
.logical-float {
  float: inline-start;
  clear: inline-end;
}
```

## React Integration

```tsx
// lib/styles/logical.ts
// Utility for converting physical to logical styles

type PhysicalToLogical = {
  marginLeft: 'marginInlineStart';
  marginRight: 'marginInlineEnd';
  marginTop: 'marginBlockStart';
  marginBottom: 'marginBlockEnd';
  paddingLeft: 'paddingInlineStart';
  paddingRight: 'paddingInlineEnd';
  paddingTop: 'paddingBlockStart';
  paddingBottom: 'paddingBlockEnd';
  left: 'insetInlineStart';
  right: 'insetInlineEnd';
  top: 'insetBlockStart';
  bottom: 'insetBlockEnd';
  width: 'inlineSize';
  height: 'blockSize';
  minWidth: 'minInlineSize';
  maxWidth: 'maxInlineSize';
  minHeight: 'minBlockSize';
  maxHeight: 'maxBlockSize';
  borderLeft: 'borderInlineStart';
  borderRight: 'borderInlineEnd';
  borderTop: 'borderBlockStart';
  borderBottom: 'borderBlockEnd';
};

// Style object with logical properties
export function logicalStyles(styles: React.CSSProperties): React.CSSProperties {
  const mapping: Record<string, string> = {
    marginLeft: 'marginInlineStart',
    marginRight: 'marginInlineEnd',
    paddingLeft: 'paddingInlineStart',
    paddingRight: 'paddingInlineEnd',
    left: 'insetInlineStart',
    right: 'insetInlineEnd',
    width: 'inlineSize',
    height: 'blockSize',
  };

  return Object.entries(styles).reduce((acc, [key, value]) => {
    const logicalKey = mapping[key] || key;
    return { ...acc, [logicalKey]: value };
  }, {});
}
```

```tsx
// components/ui/box.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Margin inline (horizontal in LTR) */
  mx?: string | number;
  /** Margin block (vertical) */
  my?: string | number;
  /** Margin inline start */
  ms?: string | number;
  /** Margin inline end */
  me?: string | number;
  /** Padding inline */
  px?: string | number;
  /** Padding block */
  py?: string | number;
  /** Padding inline start */
  ps?: string | number;
  /** Padding inline end */
  pe?: string | number;
  as?: React.ElementType;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      mx,
      my,
      ms,
      me,
      px,
      py,
      ps,
      pe,
      style,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const logicalStyles: React.CSSProperties = {
      ...(mx !== undefined && { marginInline: mx }),
      ...(my !== undefined && { marginBlock: my }),
      ...(ms !== undefined && { marginInlineStart: ms }),
      ...(me !== undefined && { marginInlineEnd: me }),
      ...(px !== undefined && { paddingInline: px }),
      ...(py !== undefined && { paddingBlock: py }),
      ...(ps !== undefined && { paddingInlineStart: ps }),
      ...(pe !== undefined && { paddingInlineEnd: pe }),
      ...style,
    };

    return <Component ref={ref} style={logicalStyles} {...props} />;
  }
);
Box.displayName = 'Box';

export { Box };
```

## RTL Support in Next.js

```tsx
// app/[locale]/layout.tsx
import { getDirection } from '@/lib/i18n';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = getDirection(locale); // 'ltr' or 'rtl'

  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```

```typescript
// lib/i18n/direction.ts
const rtlLocales = new Set(['ar', 'he', 'fa', 'ur']);

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return rtlLocales.has(locale) ? 'rtl' : 'ltr';
}

export function isRtl(locale: string): boolean {
  return rtlLocales.has(locale);
}
```

## Tailwind CSS Integration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      // Tailwind already supports logical properties via:
      // ms-* (margin-inline-start)
      // me-* (margin-inline-end)
      // ps-* (padding-inline-start)
      // pe-* (padding-inline-end)
      // start-* (inset-inline-start)
      // end-* (inset-inline-end)
    },
  },
  // Enable RTL support
  plugins: [
    require('tailwindcss-rtl'), // Optional plugin for more RTL utilities
  ],
};

export default config;
```

```tsx
// Usage with Tailwind logical utilities
function Card() {
  return (
    <div className="
      ps-4      /* padding-inline-start: 1rem */
      pe-4      /* padding-inline-end: 1rem */
      ms-auto   /* margin-inline-start: auto */
      me-0      /* margin-inline-end: 0 */
      start-0   /* inset-inline-start: 0 */
      end-auto  /* inset-inline-end: auto */
      text-start /* text-align: start */
      border-s-2 /* border-inline-start-width: 2px */
      rounded-s-lg /* border-start-start-radius + border-end-start-radius */
    ">
      Content
    </div>
  );
}
```

## Common Patterns

### Sidebar Layout

```css
/* Physical (problematic for RTL) */
.sidebar-physical {
  position: fixed;
  left: 0;
  width: 250px;
}

.content-physical {
  margin-left: 250px;
}

/* Logical (works for both LTR and RTL) */
.sidebar-logical {
  position: fixed;
  inset-inline-start: 0;
  inline-size: 250px;
}

.content-logical {
  margin-inline-start: 250px;
}
```

### Icon + Text

```css
/* Physical spacing (breaks in RTL) */
.icon-text-physical {
  display: flex;
  gap: 0.5rem;
}

.icon-text-physical svg {
  margin-right: 0.5rem;
}

/* Logical spacing (works in both directions) */
.icon-text-logical {
  display: flex;
  gap: 0.5rem;
}

.icon-text-logical svg {
  margin-inline-end: 0.5rem;
}
```

### Directional Icons

```tsx
// components/ui/directional-icon.tsx
'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DirectionalIconProps {
  direction: 'forward' | 'backward';
  className?: string;
}

export function DirectionalIcon({ direction, className }: DirectionalIconProps) {
  // Check document direction
  const isRtl = typeof document !== 'undefined' && 
    document.documentElement.dir === 'rtl';
  
  const Icon = direction === 'forward'
    ? (isRtl ? ChevronLeft : ChevronRight)
    : (isRtl ? ChevronRight : ChevronLeft);
  
  return <Icon className={className} />;
}

// CSS alternative using transform
// .icon-forward {
//   transform: scaleX(1);
// }
// 
// [dir="rtl"] .icon-forward {
//   transform: scaleX(-1);
// }
```

## Anti-patterns

### Mixing Physical and Logical

```css
/* Bad - Mixing approaches */
.mixed {
  margin-inline-start: 1rem;
  padding-right: 1rem; /* Physical! */
}

/* Good - Consistent logical properties */
.consistent {
  margin-inline-start: 1rem;
  padding-inline-end: 1rem;
}
```

### Hardcoded Transforms

```css
/* Bad - Transform doesn't respect direction */
.icon-bad {
  transform: rotate(-90deg);
}

/* Good - Use logical rotation or direction-aware component */
.icon-good {
  transform: rotate(-90deg);
}

[dir="rtl"] .icon-good {
  transform: rotate(90deg);
}
```

## Related Primitives

- [spacing](./spacing.md) - Spacing tokens
- [typography](./typography.md) - Text direction
- [breakpoints](./breakpoints.md) - Responsive layouts

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
