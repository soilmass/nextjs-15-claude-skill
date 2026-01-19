---
id: p-shadows
name: Shadows
version: 2.0.0
layer: L0
category: visual
composes: []
description: Elevation shadow system with dark mode variants
tags: [design-tokens, shadows, elevation, dark-mode]
dependencies: []
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: false
---

# Shadows

## Overview

Shadows create visual hierarchy through elevation. This system provides a consistent shadow scale from subtle (2xs) to dramatic (2xl), with proper dark mode handling where shadows become borders or glows instead of traditional shadows.

Key principles:
- Progressive elevation scale
- Multiple shadow layers for realism
- Dark mode adaptation
- Performance-conscious (avoid blur on mobile)

## When to Use

Use this skill when:
- Creating elevation hierarchy (cards, modals, dropdowns)
- Implementing hover states with lift effects
- Adding depth to interactive elements
- Handling shadows in dark mode

## Implementation

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      boxShadow: {
        // Elevation scale
        "2xs": "0 1px rgb(0 0 0 / 0.05)",
        "xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "sm": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        "none": "0 0 #0000",
      },
    },
  },
};

export default config;
```

### globals.css - Shadow Variables

```css
@layer base {
  :root {
    /* Light mode shadows */
    --shadow-color: 220 3% 15%;
    --shadow-strength: 1%;
    
    --shadow-2xs: 0 1px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 5));
    --shadow-xs: 0 1px 2px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 5));
    --shadow-sm: 
      0 1px 3px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 10)),
      0 1px 2px -1px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 10));
    --shadow-md: 
      0 4px 6px -1px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 10)),
      0 2px 4px -2px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 10));
    --shadow-lg: 
      0 10px 15px -3px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 10)),
      0 4px 6px -4px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 10));
    --shadow-xl: 
      0 20px 25px -5px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 10)),
      0 8px 10px -6px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 10));
    --shadow-2xl: 0 25px 50px -12px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 25));
    
    /* Inset shadows */
    --shadow-inner-2xs: inset 0 1px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 5));
    --shadow-inner-xs: inset 0 1px 1px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 5));
    --shadow-inner-sm: inset 0 2px 4px hsl(var(--shadow-color) / calc(var(--shadow-strength) * 5));
  }

  .dark {
    /* Dark mode - reduced shadows, use borders instead */
    --shadow-color: 0 0% 0%;
    --shadow-strength: 0.5%;
    
    /* Or use glow effects */
    --shadow-glow-sm: 0 0 10px hsl(var(--primary) / 0.3);
    --shadow-glow-md: 0 0 20px hsl(var(--primary) / 0.4);
    --shadow-glow-lg: 0 0 30px hsl(var(--primary) / 0.5);
  }
}
```

## Variants

### Colored Shadows

```css
/* Colored shadow utilities */
.shadow-primary {
  box-shadow: 0 4px 14px 0 hsl(var(--primary) / 0.25);
}

.shadow-destructive {
  box-shadow: 0 4px 14px 0 hsl(var(--destructive) / 0.25);
}

/* Hover effect with colored shadow */
.shadow-primary-hover:hover {
  box-shadow: 0 8px 20px 0 hsl(var(--primary) / 0.35);
}
```

### Interactive States

```css
/* Card with hover elevation */
.card-elevated {
  box-shadow: var(--shadow-sm);
  transition: box-shadow 200ms ease, transform 200ms ease;
}

.card-elevated:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Button with active shadow */
.button-shadow {
  box-shadow: var(--shadow-sm);
}

.button-shadow:active {
  box-shadow: var(--shadow-inner-sm);
}
```

### Dark Mode Borders

```css
/* Replace shadows with borders in dark mode */
.dark .card {
  box-shadow: none;
  border: 1px solid hsl(var(--border));
}

/* Or use subtle glow */
.dark .card-glow {
  box-shadow: 0 0 0 1px hsl(var(--border)), 
              0 0 20px -5px hsl(var(--primary) / 0.1);
}
```

## Elevation Mapping

| Level | Shadow | Use Case |
|-------|--------|----------|
| 0 | none | Flat elements, backgrounds |
| 1 | 2xs | Subtle separation |
| 2 | xs | Inputs, buttons |
| 3 | sm | Cards, panels |
| 4 | md | Dropdowns, popovers |
| 5 | lg | Modals, dialogs |
| 6 | xl | Floating elements |
| 7 | 2xl | High emphasis overlays |

## Accessibility

- Shadows are decorative and don't convey meaning alone
- Ensure sufficient contrast without shadows
- Test in Windows High Contrast Mode

## Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0"
  }
}
```

## Examples

### Card with Shadow

```tsx
<div className="bg-card rounded-lg shadow-sm p-6">
  <h3>Card Title</h3>
  <p>Card content with subtle shadow.</p>
</div>
```

### Interactive Card

```tsx
<div className="bg-card rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer">
  <h3>Hover for elevation</h3>
  <p>Card lifts on hover.</p>
</div>
```

### Modal Shadow

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className="bg-background rounded-lg shadow-2xl p-6 max-w-md w-full">
    <h2>Modal Title</h2>
    <p>Modal with dramatic shadow for emphasis.</p>
  </div>
</div>
```

### Dark Mode Card

```tsx
<div className="bg-card rounded-lg shadow-sm dark:shadow-none dark:border dark:border-border p-6">
  <h3>Adaptive Card</h3>
  <p>Shadow in light mode, border in dark mode.</p>
</div>
```

## Anti-patterns

### Heavy Shadows on Mobile

```tsx
// Bad - heavy blur is expensive
<div className="shadow-2xl">...</div>

// Better - lighter shadows on mobile
<div className="shadow-md md:shadow-xl">...</div>
```

### Shadows in Dark Mode

```tsx
// Bad - shadows are barely visible
<div className="dark:shadow-lg">...</div>

// Good - use borders instead
<div className="shadow-lg dark:shadow-none dark:border">...</div>
```

## Related Skills

### Composes Into
- [card](../molecules/card.md) - Card component
- [dialog](../organisms/dialog.md) - Modal dialog

### Related
- [dark-mode](./dark-mode.md) - Dark mode handling
- [motion](./motion.md) - Transition timing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
