---
id: p-fluid-design
name: Fluid Design
version: 2.0.0
layer: L0
category: layout
composes: []
description: Fluid typography, spacing, and container queries
tags: [design-tokens, fluid, responsive, clamp, container-queries]
dependencies: []
performance:
  impact: medium
  lcp: neutral
  cls: positive
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: false
---

# Fluid Design

## Overview

Fluid design eliminates jarring breakpoint jumps by using CSS `clamp()` for smooth scaling between viewport sizes. This creates more natural, proportional layouts that feel cohesive across all device sizes.

Key principles:
- Use `clamp(min, preferred, max)` for smooth scaling
- Set sensible min/max bounds
- Prefer fluid over static breakpoints where appropriate
- Container queries for component-level responsiveness

## When to Use

Use this skill when:
- Typography should scale smoothly
- Spacing should adapt proportionally
- Components need to respond to container size
- Reducing breakpoint-specific overrides

## Implementation

### globals.css

```css
@layer base {
  :root {
    /* Fluid Typography Scale */
    /* clamp(min, preferred, max) */
    /* preferred uses vw for viewport-based scaling */
    
    --text-fluid-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    --text-fluid-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
    --text-fluid-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
    --text-fluid-lg: clamp(1.125rem, 1rem + 0.625vw, 1.5rem);
    --text-fluid-xl: clamp(1.25rem, 1rem + 1.25vw, 2rem);
    --text-fluid-2xl: clamp(1.5rem, 1rem + 2.5vw, 3rem);
    --text-fluid-3xl: clamp(2rem, 1.25rem + 3.75vw, 4rem);
    --text-fluid-4xl: clamp(2.5rem, 1.5rem + 5vw, 5rem);
    --text-fluid-5xl: clamp(3rem, 1.5rem + 7.5vw, 6rem);
    
    /* Fluid Spacing Scale */
    --space-fluid-3xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem);
    --space-fluid-2xs: clamp(0.375rem, 0.3rem + 0.375vw, 0.5rem);
    --space-fluid-xs: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
    --space-fluid-sm: clamp(0.75rem, 0.6rem + 0.75vw, 1rem);
    --space-fluid-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
    --space-fluid-lg: clamp(1.5rem, 1rem + 2.5vw, 2.5rem);
    --space-fluid-xl: clamp(2rem, 1.25rem + 3.75vw, 4rem);
    --space-fluid-2xl: clamp(3rem, 2rem + 5vw, 6rem);
    --space-fluid-3xl: clamp(4rem, 2.5rem + 7.5vw, 8rem);
    
    /* Fluid Container Padding */
    --container-fluid-padding: clamp(1rem, 5vw, 4rem);
    
    /* Fluid Section Spacing */
    --section-fluid-spacing: clamp(4rem, 10vh, 8rem);
    
    /* Aspect Ratios */
    --ratio-square: 1 / 1;
    --ratio-landscape: 16 / 9;
    --ratio-portrait: 3 / 4;
    --ratio-wide: 21 / 9;
    --ratio-ultrawide: 32 / 9;
    --ratio-card: 4 / 3;
    --ratio-hero: 2 / 1;
  }
}

/* Fluid typography utilities */
.text-fluid-xs { font-size: var(--text-fluid-xs); }
.text-fluid-sm { font-size: var(--text-fluid-sm); }
.text-fluid-base { font-size: var(--text-fluid-base); }
.text-fluid-lg { font-size: var(--text-fluid-lg); }
.text-fluid-xl { font-size: var(--text-fluid-xl); }
.text-fluid-2xl { font-size: var(--text-fluid-2xl); }
.text-fluid-3xl { font-size: var(--text-fluid-3xl); }
.text-fluid-4xl { font-size: var(--text-fluid-4xl); }
.text-fluid-5xl { font-size: var(--text-fluid-5xl); }

/* Fluid spacing utilities */
.p-fluid-sm { padding: var(--space-fluid-sm); }
.p-fluid-md { padding: var(--space-fluid-md); }
.p-fluid-lg { padding: var(--space-fluid-lg); }
.p-fluid-xl { padding: var(--space-fluid-xl); }

.py-fluid-section { 
  padding-top: var(--section-fluid-spacing); 
  padding-bottom: var(--section-fluid-spacing);
}

.gap-fluid-sm { gap: var(--space-fluid-sm); }
.gap-fluid-md { gap: var(--space-fluid-md); }
.gap-fluid-lg { gap: var(--space-fluid-lg); }
```

### Container Queries

```css
/* Enable container queries */
.container-query {
  container-type: inline-size;
}

/* Container-based responsive styles */
@container (min-width: 400px) {
  .container-query .card-title {
    font-size: 1.25rem;
  }
}

@container (min-width: 600px) {
  .container-query .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 800px) {
  .container-query .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Tailwind Extension

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontSize: {
        "fluid-xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
        "fluid-sm": "clamp(0.875rem, 0.8rem + 0.375vw, 1rem)",
        "fluid-base": "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)",
        "fluid-lg": "clamp(1.125rem, 1rem + 0.625vw, 1.5rem)",
        "fluid-xl": "clamp(1.25rem, 1rem + 1.25vw, 2rem)",
        "fluid-2xl": "clamp(1.5rem, 1rem + 2.5vw, 3rem)",
        "fluid-3xl": "clamp(2rem, 1.25rem + 3.75vw, 4rem)",
      },
      spacing: {
        "fluid-xs": "clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)",
        "fluid-sm": "clamp(0.75rem, 0.6rem + 0.75vw, 1rem)",
        "fluid-md": "clamp(1rem, 0.8rem + 1vw, 1.5rem)",
        "fluid-lg": "clamp(1.5rem, 1rem + 2.5vw, 2.5rem)",
        "fluid-xl": "clamp(2rem, 1.25rem + 3.75vw, 4rem)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/container-queries"),
  ],
};

export default config;
```

## Fluid Calculation

```
clamp(min, preferred, max)

preferred = base + (vw * multiplier)

Example: clamp(1rem, 0.8rem + 1vw, 1.5rem)
- At 320px viewport: ~0.8rem + 3.2px = ~0.9rem (clamped to 1rem min)
- At 768px viewport: ~0.8rem + 7.68px = ~1.28rem
- At 1440px viewport: ~0.8rem + 14.4px = ~1.7rem (clamped to 1.5rem max)
```

## Variants

### Fluid Hero Text

```tsx
<h1 
  className="font-bold tracking-tight"
  style={{ fontSize: "clamp(2.5rem, 1.5rem + 5vw, 5rem)" }}
>
  Hero Headline
</h1>
```

### Fluid Section

```tsx
<section className="py-fluid-section">
  <div className="container px-fluid-md">
    <h2 className="text-fluid-3xl font-bold">Section Title</h2>
    <p className="text-fluid-lg text-muted-foreground">
      Description text that scales smoothly.
    </p>
  </div>
</section>
```

### Container Query Card

```tsx
<div className="@container">
  <div className="flex flex-col @md:flex-row gap-4">
    <img className="w-full @md:w-1/3 aspect-video object-cover" />
    <div className="flex-1">
      <h3 className="text-lg @lg:text-xl font-semibold">Card Title</h3>
      <p className="text-muted-foreground">Description</p>
    </div>
  </div>
</div>
```

## Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0",
    "@tailwindcss/container-queries": "0.1.1"
  }
}
```

## Examples

### Full Fluid Page

```tsx
<main>
  {/* Hero with fluid text */}
  <section className="py-fluid-section">
    <div className="container max-w-4xl text-center">
      <h1 className="text-fluid-4xl font-bold tracking-tight mb-fluid-md">
        Build faster with fluid design
      </h1>
      <p className="text-fluid-lg text-muted-foreground mb-fluid-lg max-w-2xl mx-auto">
        Smooth scaling that adapts to any viewport without jarring breakpoints.
      </p>
      <div className="flex flex-wrap gap-fluid-sm justify-center">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </div>
    </div>
  </section>

  {/* Features with fluid grid */}
  <section className="py-fluid-section bg-muted/50">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-lg">
        {features.map(feature => (
          <Card key={feature.id} className="p-fluid-md">
            <Icon className="h-8 w-8 mb-fluid-sm" />
            <h3 className="text-fluid-lg font-semibold mb-fluid-xs">
              {feature.title}
            </h3>
            <p className="text-muted-foreground">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  </section>
</main>
```

### Responsive Card Grid with Container Queries

```tsx
<div className="@container">
  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4 gap-4">
    {items.map(item => (
      <Card key={item.id}>
        <CardContent>
          <h3 className="font-semibold @md:text-lg">{item.title}</h3>
          <p className="text-sm text-muted-foreground @lg:text-base">
            {item.description}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

## Anti-patterns

### Unbounded Fluid Values

```css
/* Bad - no maximum, gets too large */
.title {
  font-size: calc(1rem + 5vw);
}

/* Good - bounded with clamp */
.title {
  font-size: clamp(1rem, 1rem + 5vw, 4rem);
}
```

### Too Aggressive Scaling

```css
/* Bad - changes too dramatically */
font-size: clamp(1rem, 0.5rem + 5vw, 6rem);

/* Good - moderate scaling */
font-size: clamp(1rem, 0.8rem + 1vw, 1.5rem);
```

## Related Skills

### Composes Into
- [typography](./typography.md) - Fluid typography
- [spacing](./spacing.md) - Fluid spacing
- [breakpoints](./breakpoints.md) - Breakpoint alternatives

### Related
- [hero](../organisms/hero.md) - Fluid hero sections

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
