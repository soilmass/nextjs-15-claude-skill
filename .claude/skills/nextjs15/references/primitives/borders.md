---
id: p-borders
name: Borders
version: 2.0.0
layer: L0
category: visual
composes: []
description: Border radius and width scales
tags: [design-tokens, borders, radius, styling]
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

# Borders

## Overview

The border system defines consistent radius and width values across all components. A well-defined border system creates visual cohesion and ensures components feel like they belong together.

Key principles:
- Consistent radius scale for all rounded elements
- CSS variable for easy global customization
- Progressive scale from sharp to fully rounded

## When to Use

Use this skill when:
- Setting up component corner radii
- Creating consistent border treatments
- Implementing design system customization

## Implementation

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      borderRadius: {
        none: "0",
        sm: "calc(var(--radius) - 4px)",
        DEFAULT: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
        full: "9999px",
      },
      borderWidth: {
        DEFAULT: "1px",
        "0": "0",
        "2": "2px",
        "4": "4px",
        "8": "8px",
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
    /* Base radius - adjust this to change all radii */
    --radius: 0.625rem; /* 10px */
    
    /* Border colors */
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
  }
  
  .dark {
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
}
```

## Variants

### Radius Presets

| Name | Value | Use Case |
|------|-------|----------|
| none | 0 | Sharp corners |
| sm | 4px | Buttons, inputs |
| DEFAULT | 6px | Cards, containers |
| md | 8px | Larger cards |
| lg | 10px | Modals, dialogs |
| xl | 14px | Large panels |
| 2xl | 18px | Hero sections |
| 3xl | 22px | Decorative |
| full | 9999px | Pills, avatars |

### Border Styles

```css
/* Border utilities */
.border-subtle {
  border-color: hsl(var(--border) / 0.5);
}

.border-strong {
  border-color: hsl(var(--foreground) / 0.2);
}

/* Dashed borders */
.border-dashed-subtle {
  border-style: dashed;
  border-color: hsl(var(--border));
}

/* Gradient borders */
.border-gradient {
  border: 2px solid transparent;
  background: 
    linear-gradient(var(--background), var(--background)) padding-box,
    linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent))) border-box;
}
```

## Component Radius Guidelines

| Component | Radius | Notes |
|-----------|--------|-------|
| Button | sm-md | Matches input fields |
| Input | sm-md | Consistent with buttons |
| Card | lg | Slightly softer |
| Modal | lg-xl | Prominent corners |
| Avatar | full | Always circular |
| Badge | full | Pill shape |
| Tooltip | md | Subtle rounding |
| Dropdown | md | Matches trigger |

## Accessibility

- Borders must have sufficient contrast (3:1 minimum for UI components)
- Focus rings should be distinct from borders
- Don't rely solely on borders for state indication

```css
/* Accessible focus ring */
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--background)), 
              0 0 0 4px hsl(var(--ring));
}
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

### Basic Border Usage

```tsx
<div className="border rounded-lg p-4">
  Default border with rounded corners
</div>

<div className="border-2 border-primary rounded-xl p-4">
  Thicker border with primary color
</div>
```

### Input with Border

```tsx
<input 
  className="w-full border border-input rounded-md px-3 py-2 
             focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  placeholder="Enter text..."
/>
```

### Card with Border

```tsx
<div className="border rounded-lg bg-card p-6">
  <h3>Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Pill/Badge

```tsx
<span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">
  Badge
</span>
```

## Anti-patterns

### Inconsistent Radius

```tsx
// Bad - arbitrary radius values
<div className="rounded-[7px]">...</div>
<button className="rounded-[11px]">...</button>

// Good - using the scale
<div className="rounded-lg">...</div>
<button className="rounded-md">...</button>
```

### Missing Border Color

```tsx
// Bad - no explicit border color
<div className="border rounded-lg">...</div>

// The system handles this via globals.css:
// * { @apply border-border; }
// So the above is actually fine with our setup
```

## Related Skills

### Composes Into
- [input-button](../atoms/input-button.md) - Button borders
- [input-text](../atoms/input-text.md) - Input borders
- [card](../molecules/card.md) - Card borders

### Related
- [colors](./colors.md) - Border colors
- [accessibility](./accessibility.md) - Focus rings

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
