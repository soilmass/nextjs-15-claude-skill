---
id: p-spacing
name: Spacing
version: 2.0.0
layer: L0
category: spacing
composes: []
description: 4px base unit spacing scale with semantic tokens
tags: [design-tokens, spacing, layout, margins, padding]
dependencies: []
performance:
  impact: high
  lcp: neutral
  cls: positive
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: false
---

# Spacing

## Overview

The spacing system uses a 4px base unit, providing a consistent visual rhythm across all components. This creates harmony between elements and ensures predictable layouts. The scale includes both numeric utilities (space-1 through space-96) and semantic tokens for common use cases.

Key principles:
- 4px base unit for pixel-perfect alignment
- Exponential scale for natural visual hierarchy
- Semantic tokens for consistent component spacing
- Fluid spacing for responsive layouts

## When to Use

Use this skill when:
- Setting up margin and padding scales
- Creating consistent component spacing
- Implementing page layouts with proper rhythm
- Configuring responsive spacing

## Implementation

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      spacing: {
        // Base scale (Tailwind default is fine, but here's explicit)
        "0": "0",
        "px": "1px",
        "0.5": "0.125rem",  // 2px
        "1": "0.25rem",     // 4px - base unit
        "1.5": "0.375rem",  // 6px
        "2": "0.5rem",      // 8px
        "2.5": "0.625rem",  // 10px
        "3": "0.75rem",     // 12px
        "3.5": "0.875rem",  // 14px
        "4": "1rem",        // 16px
        "5": "1.25rem",     // 20px
        "6": "1.5rem",      // 24px
        "7": "1.75rem",     // 28px
        "8": "2rem",        // 32px
        "9": "2.25rem",     // 36px
        "10": "2.5rem",     // 40px
        "11": "2.75rem",    // 44px
        "12": "3rem",       // 48px
        "14": "3.5rem",     // 56px
        "16": "4rem",       // 64px
        "20": "5rem",       // 80px
        "24": "6rem",       // 96px
        "28": "7rem",       // 112px
        "32": "8rem",       // 128px
        "36": "9rem",       // 144px
        "40": "10rem",      // 160px
        "44": "11rem",      // 176px
        "48": "12rem",      // 192px
        "52": "13rem",      // 208px
        "56": "14rem",      // 224px
        "60": "15rem",      // 240px
        "64": "16rem",      // 256px
        "72": "18rem",      // 288px
        "80": "20rem",      // 320px
        "96": "24rem",      // 384px
      },
    },
  },
};

export default config;
```

### globals.css - Semantic Spacing

```css
@layer base {
  :root {
    /* Semantic spacing tokens */
    --space-page-x: clamp(1rem, 5vw, 4rem);
    --space-page-y: clamp(2rem, 5vh, 4rem);
    --space-section: clamp(4rem, 10vh, 8rem);
    --space-component: clamp(1.5rem, 3vw, 3rem);
    --space-element: clamp(0.5rem, 1vw, 1rem);
    
    /* Container max widths */
    --container-sm: 640px;
    --container-md: 768px;
    --container-lg: 1024px;
    --container-xl: 1280px;
    --container-2xl: 1400px;
  }
}

/* Container utility */
.container {
  width: 100%;
  max-width: var(--container-2xl);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-page-x);
  padding-right: var(--space-page-x);
}

/* Section spacing */
.section {
  padding-top: var(--space-section);
  padding-bottom: var(--space-section);
}

/* Stack (vertical spacing between children) */
.stack > * + * {
  margin-top: var(--space-element);
}

.stack-sm > * + * {
  margin-top: 0.5rem;
}

.stack-md > * + * {
  margin-top: 1rem;
}

.stack-lg > * + * {
  margin-top: 1.5rem;
}

.stack-xl > * + * {
  margin-top: 2rem;
}
```

### Spacing Component

```typescript
// components/ui/stack.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const stackVariants = cva("flex flex-col", {
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    gap: "md",
    align: "stretch",
  },
});

interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export function Stack({ className, gap, align, ...props }: StackProps) {
  return (
    <div className={cn(stackVariants({ gap, align, className }))} {...props} />
  );
}
```

## Variants

### Responsive Spacing

```tsx
// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</div>

// Responsive margins
<section className="my-12 md:my-16 lg:my-24">
  Section with responsive vertical margin
</section>

// Responsive gaps
<div className="flex gap-2 md:gap-4 lg:gap-6">
  Flex with responsive gap
</div>
```

### Fluid Spacing

```css
/* Custom fluid spacing utilities */
.p-fluid-sm { padding: clamp(0.5rem, 1vw, 1rem); }
.p-fluid-md { padding: clamp(1rem, 2vw, 2rem); }
.p-fluid-lg { padding: clamp(2rem, 4vw, 4rem); }

.my-fluid-section { 
  margin-top: clamp(4rem, 10vh, 8rem);
  margin-bottom: clamp(4rem, 10vh, 8rem);
}
```

## Spacing Guidelines

### Component Internal Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Button (sm) | px-3 py-1.5 | gap-1.5 |
| Button (md) | px-4 py-2 | gap-2 |
| Button (lg) | px-6 py-3 | gap-2.5 |
| Card | p-6 | - |
| Input | px-3 py-2 | - |
| Modal | p-6 | - |

### Layout Spacing

| Context | Token | Value |
|---------|-------|-------|
| Page margins | --space-page-x | clamp(1rem, 5vw, 4rem) |
| Section gaps | --space-section | clamp(4rem, 10vh, 8rem) |
| Component gaps | --space-component | clamp(1.5rem, 3vw, 3rem) |
| Element gaps | --space-element | clamp(0.5rem, 1vw, 1rem) |

## Accessibility

### Touch Targets

- Minimum touch target: 44x44px
- Space between adjacent targets: 8px minimum

```tsx
// Good - adequate touch target spacing
<div className="flex gap-2">
  <Button size="lg">Button 1</Button>
  <Button size="lg">Button 2</Button>
</div>
```

## Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0",
    "class-variance-authority": "0.7.1"
  }
}
```

## Examples

### Page Layout

```tsx
<main className="container py-12 md:py-16 lg:py-24">
  <Stack gap="xl">
    <section>
      <Stack gap="md">
        <h1>Page Title</h1>
        <p>Page description</p>
      </Stack>
    </section>
    
    <section>
      <Stack gap="lg">
        <h2>Section Title</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cards */}
        </div>
      </Stack>
    </section>
  </Stack>
</main>
```

### Card Component

```tsx
<Card className="p-6">
  <Stack gap="sm">
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </Stack>
  <CardContent className="pt-4">
    <p>Card content with proper spacing from header.</p>
  </CardContent>
  <CardFooter className="pt-4 flex gap-2">
    <Button>Primary</Button>
    <Button variant="outline">Secondary</Button>
  </CardFooter>
</Card>
```

## Anti-patterns

### Inconsistent Spacing

```tsx
// Bad - arbitrary spacing values
<div className="p-[13px] mt-[22px] gap-[7px]">...</div>

// Good - using the spacing scale
<div className="p-3 mt-6 gap-2">...</div>
```

### Missing Responsive Spacing

```tsx
// Bad - fixed spacing at all breakpoints
<section className="py-24">...</section>

// Good - responsive spacing
<section className="py-12 md:py-16 lg:py-24">...</section>
```

## Related Skills

### Composes Into
- [layout-divider](../atoms/layout-divider.md) - Visual separators
- [card](../molecules/card.md) - Card component spacing

### Related
- [breakpoints](./breakpoints.md) - Responsive breakpoints
- [fluid-design](./fluid-design.md) - Fluid spacing values

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
