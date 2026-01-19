---
id: p-breakpoints
name: Breakpoints
version: 2.0.0
layer: L0
category: layout
composes: []
description: Responsive breakpoints and container sizes
tags: [design-tokens, responsive, breakpoints, mobile-first]
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

# Breakpoints

## Overview

The breakpoint system defines screen size thresholds for responsive design. Following a mobile-first approach, styles are applied at the minimum width and up. This aligns with Tailwind's default breakpoints.

Key principles:
- Mobile-first (min-width)
- Five breakpoints covering all device sizes
- Container max-widths for readable content

## When to Use

Use this skill when:
- Implementing responsive layouts
- Setting up container widths
- Creating adaptive components
- Defining mobile vs desktop behaviors

## Implementation

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    screens: {
      sm: "640px",   // Phones landscape
      md: "768px",   // Tablets
      lg: "1024px",  // Laptops
      xl: "1280px",  // Desktops
      "2xl": "1536px", // Large displays
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px", // Slightly narrower for readability
      },
    },
  },
};

export default config;
```

### globals.css - CSS Variables

```css
@layer base {
  :root {
    /* Breakpoint values as CSS variables */
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;
    
    /* Container widths */
    --container-sm: 640px;
    --container-md: 768px;
    --container-lg: 1024px;
    --container-xl: 1280px;
    --container-2xl: 1400px;
  }
}

/* Custom container utility */
.container-narrow {
  width: 100%;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

.container-wide {
  width: 100%;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
```

## Breakpoint Reference

| Name | Width | Target Devices |
|------|-------|----------------|
| Default | < 640px | Mobile phones (portrait) |
| sm | >= 640px | Mobile phones (landscape) |
| md | >= 768px | Tablets |
| lg | >= 1024px | Laptops, small desktops |
| xl | >= 1280px | Desktops |
| 2xl | >= 1536px | Large displays |

## Variants

### Custom Breakpoints

```typescript
// For specific design requirements
const config: Config = {
  theme: {
    screens: {
      xs: "475px",   // Large phones
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px", // Full HD
    },
  },
};
```

### Max-Width Breakpoints

```css
/* Using Tailwind's max-* variant */
/* Apply styles below a breakpoint */
@media (max-width: 767px) {
  .mobile-only {
    display: block;
  }
}

/* In Tailwind (add to config or use arbitrary values) */
/* max-md:block - visible below md */
```

## Common Patterns

### Responsive Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</div>
```

### Responsive Layout

```tsx
<div className="flex flex-col md:flex-row gap-8">
  <aside className="w-full md:w-64 shrink-0">
    Sidebar
  </aside>
  <main className="flex-1">
    Main content
  </main>
</div>
```

### Hide/Show at Breakpoints

```tsx
{/* Mobile only */}
<MobileNav className="md:hidden" />

{/* Desktop only */}
<DesktopNav className="hidden md:flex" />
```

### Responsive Typography

```tsx
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
  Responsive Heading
</h1>
```

## Accessibility

- Ensure touch targets are 44px minimum on mobile
- Maintain readable line lengths (45-85ch)
- Test with zoom up to 200%
- Consider reduced motion at all breakpoints

## Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0"
  }
}
```

## Examples

### Full Page Layout

```tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header className="sticky top-0 z-50" />
      
      <div className="container py-8 md:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar - hidden on mobile, fixed width on desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Sidebar />
          </aside>
          
          {/* Main content - full width on mobile, flexible on desktop */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
          
          {/* Right sidebar - hidden until xl */}
          <aside className="hidden xl:block w-80 shrink-0">
            <TableOfContents />
          </aside>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
```

### Responsive Card Grid

```tsx
<section className="py-12 md:py-16 lg:py-24">
  <div className="container">
    <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">
      Features
    </h2>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      {features.map(feature => (
        <Card key={feature.id} className="p-4 md:p-6">
          <Icon className="h-8 w-8 md:h-10 md:w-10 mb-4" />
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            {feature.title}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            {feature.description}
          </p>
        </Card>
      ))}
    </div>
  </div>
</section>
```

## Anti-patterns

### Desktop-First Approach

```tsx
// Bad - desktop-first requires more overrides
<div className="flex-row max-md:flex-col">...</div>

// Good - mobile-first
<div className="flex-col md:flex-row">...</div>
```

### Too Many Breakpoints

```tsx
// Bad - too granular, hard to maintain
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">

// Good - meaningful jumps only
<h1 className="text-2xl md:text-4xl lg:text-5xl">
```

## Related Skills

### Composes Into
- [layout-root](../templates/layout-root.md) - Root layout
- [header](../organisms/header.md) - Responsive header

### Related
- [spacing](./spacing.md) - Responsive spacing
- [fluid-design](./fluid-design.md) - Fluid alternatives

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
