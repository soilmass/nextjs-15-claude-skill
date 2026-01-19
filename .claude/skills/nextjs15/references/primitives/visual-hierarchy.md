---
id: p-visual-hierarchy
name: Visual Hierarchy
version: 2.0.0
layer: L0
category: visual
composes: []
description: Contrast levels, size scales, whitespace rhythm
tags: [design-tokens, hierarchy, contrast, typography, layout]
dependencies: []
performance:
  impact: high
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AAA
  keyboard: false
  screen-reader: true
---

# Visual Hierarchy

## Overview

Visual hierarchy guides users through content by establishing clear relationships between elements. This system defines text contrast levels, size relationships using a musical scale, and whitespace rhythm patterns.

Key principles:
- Three levels of text emphasis (primary, secondary, tertiary)
- 1.25 (Major Third) type scale for harmonious sizing
- Consistent whitespace rhythm for vertical flow
- Clear content boundaries

## When to Use

Use this skill when:
- Designing page layouts with clear content priority
- Setting up text contrast for readability
- Creating consistent spacing rhythm
- Establishing visual patterns across components

## Implementation

### globals.css

```css
@layer base {
  :root {
    /* Text Contrast Levels */
    --text-contrast-primary: 90%;    /* Headlines, body text */
    --text-contrast-secondary: 70%;  /* Descriptions, labels */
    --text-contrast-tertiary: 50%;   /* Captions, hints */
    --text-contrast-disabled: 35%;   /* Disabled states */
    
    /* Size Scale (Major Third - 1.25 ratio) */
    --size-base: 16px;
    --size-ratio: 1.25;
    
    --size-xs: calc(var(--size-base) / var(--size-ratio) / var(--size-ratio)); /* ~10px */
    --size-sm: calc(var(--size-base) / var(--size-ratio)); /* ~13px */
    --size-md: var(--size-base); /* 16px */
    --size-lg: calc(var(--size-base) * var(--size-ratio)); /* 20px */
    --size-xl: calc(var(--size-base) * var(--size-ratio) * var(--size-ratio)); /* 25px */
    --size-2xl: calc(var(--size-xl) * var(--size-ratio)); /* ~31px */
    --size-3xl: calc(var(--size-2xl) * var(--size-ratio)); /* ~39px */
    --size-4xl: calc(var(--size-3xl) * var(--size-ratio)); /* ~49px */
    --size-5xl: calc(var(--size-4xl) * var(--size-ratio)); /* ~61px */
    
    /* Whitespace Rhythm Multipliers */
    --rhythm-tight: 0.5;     /* Compact UI */
    --rhythm-normal: 1;      /* Standard */
    --rhythm-relaxed: 1.5;   /* Breathing room */
    --rhythm-loose: 2;       /* Luxurious spacing */
    
    /* Base spacing unit for rhythm */
    --rhythm-unit: 1.5rem;   /* 24px base */
    
    /* Reading Width */
    --measure-min: 45ch;
    --measure-optimal: 65ch;
    --measure-max: 85ch;
    
    /* Content Width Hierarchy */
    --width-narrow: 640px;   /* Single column content */
    --width-default: 960px;  /* Standard content */
    --width-wide: 1280px;    /* Full width content */
    --width-full: 100%;      /* Edge to edge */
  }
}

/* Text hierarchy utilities */
.text-primary {
  color: hsl(var(--foreground) / var(--text-contrast-primary));
}

.text-secondary {
  color: hsl(var(--foreground) / var(--text-contrast-secondary));
}

.text-tertiary {
  color: hsl(var(--foreground) / var(--text-contrast-tertiary));
}

/* Rhythm utilities */
.stack-tight > * + * {
  margin-top: calc(var(--rhythm-unit) * var(--rhythm-tight));
}

.stack-normal > * + * {
  margin-top: calc(var(--rhythm-unit) * var(--rhythm-normal));
}

.stack-relaxed > * + * {
  margin-top: calc(var(--rhythm-unit) * var(--rhythm-relaxed));
}

.stack-loose > * + * {
  margin-top: calc(var(--rhythm-unit) * var(--rhythm-loose));
}
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      maxWidth: {
        prose: "65ch",
        narrow: "640px",
        default: "960px",
        wide: "1280px",
      },
    },
  },
};

export default config;
```

## Hierarchy Patterns

### Text Levels

| Level | Use | Tailwind | Opacity |
|-------|-----|----------|---------|
| Primary | Headlines, body | `text-foreground` | 90% |
| Secondary | Descriptions, labels | `text-muted-foreground` | 70% |
| Tertiary | Captions, timestamps | Custom | 50% |
| Disabled | Inactive elements | Custom | 35% |

### Size Relationships

| Element | Scale Step | ~Size |
|---------|------------|-------|
| Caption | xs | 10px |
| Small text | sm | 13px |
| Body | md (base) | 16px |
| Large text | lg | 20px |
| H4 | xl | 25px |
| H3 | 2xl | 31px |
| H2 | 3xl | 39px |
| H1 | 4xl | 49px |
| Display | 5xl | 61px |

## Variants

### Compact Hierarchy

```css
/* For dense UIs like dashboards */
.compact {
  --rhythm-unit: 1rem;
  --size-base: 14px;
}
```

### Relaxed Hierarchy

```css
/* For marketing/editorial content */
.editorial {
  --rhythm-unit: 2rem;
  --text-contrast-secondary: 75%;
}
```

## Accessibility

### Contrast Requirements

- Primary text: 7:1 ratio (WCAG AAA)
- Secondary text: 4.5:1 ratio (WCAG AA)
- Large text (18px+): 3:1 minimum

### Reading Considerations

- Line length: 45-85 characters
- Line height: 1.5 for body text
- Paragraph spacing: 1em between paragraphs

## Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0"
  }
}
```

## Examples

### Page Header

```tsx
<header className="space-y-4">
  <p className="text-sm font-medium text-primary uppercase tracking-wider">
    Category
  </p>
  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
    Page Title
  </h1>
  <p className="text-lg text-muted-foreground max-w-prose">
    A longer description that provides context about the page content.
    This uses secondary contrast and optimal reading width.
  </p>
</header>
```

### Card Hierarchy

```tsx
<article className="p-6 space-y-3">
  {/* Tertiary - metadata */}
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <time>Jan 15, 2026</time>
    <span>5 min read</span>
  </div>
  
  {/* Primary - title */}
  <h3 className="text-xl font-semibold">
    Article Title
  </h3>
  
  {/* Secondary - description */}
  <p className="text-muted-foreground">
    Brief description of the article content that gives readers
    an idea of what to expect.
  </p>
  
  {/* Action */}
  <a href="#" className="text-primary hover:underline">
    Read more →
  </a>
</article>
```

### Rhythmic Section

```tsx
<section className="py-16 md:py-24">
  <div className="container max-w-default space-y-12">
    {/* Section header */}
    <div className="space-y-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">Section Title</h2>
      <p className="text-lg text-muted-foreground max-w-prose mx-auto">
        Section description text
      </p>
    </div>
    
    {/* Content with rhythm */}
    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
      {/* Cards */}
    </div>
  </div>
</section>
```

## Anti-patterns

### Flat Hierarchy

```tsx
// Bad - everything same weight
<div className="text-base">
  <p>Title</p>
  <p>Description</p>
  <p>Action</p>
</div>

// Good - clear hierarchy
<div>
  <h3 className="text-lg font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
  <a className="text-primary">Action</a>
</div>
```

### Too Many Levels

```tsx
// Bad - too many subtle differences
<div>
  <p className="text-[#333]">Level 1</p>
  <p className="text-[#444]">Level 2</p>
  <p className="text-[#555]">Level 3</p>
  <p className="text-[#666]">Level 4</p>
  <p className="text-[#777]">Level 5</p>
</div>

// Good - three clear levels
<div>
  <p className="text-foreground">Primary</p>
  <p className="text-muted-foreground">Secondary</p>
  <p className="text-muted-foreground/70">Tertiary</p>
</div>
```

## Related Skills

### Composes Into
- [typography](./typography.md) - Font sizing
- [spacing](./spacing.md) - Whitespace rhythm
- [colors](./colors.md) - Contrast colors

### Related
- [display-text](../atoms/display-text.md) - Text component
- [display-heading](../atoms/display-heading.md) - Heading component

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
