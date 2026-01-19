---
id: p-token-system
name: Token System
version: 2.0.0
layer: L0
category: theming
composes: []
description: Primitive to semantic to component token flow
tags: [design-tokens, architecture, tokens, variables]
dependencies: []
performance:
  impact: high
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: false
---

# Token System

## Overview

The token system establishes a three-tier architecture for design tokens: Primitive (raw values), Semantic (meaning), and Component (specific use). This creates maintainable, scalable design systems where changes cascade appropriately.

Key principles:
- Single source of truth at each level
- Semantic tokens bridge primitives and components
- Mode-aware tokens (light/dark) at semantic level
- Components never reference primitive tokens directly

## When to Use

Use this skill when:
- Architecting a new design system
- Understanding token inheritance
- Creating new semantic tokens
- Debugging token relationships

## Implementation

### Token Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT TOKENS                              │
│  --button-bg, --card-padding, --input-border                    │
│  (Specific component references)                                 │
├─────────────────────────────────────────────────────────────────┤
│                    SEMANTIC TOKENS                               │
│  --color-primary, --space-component-gap, --text-muted           │
│  (Meaning-based, mode-aware)                                    │
├─────────────────────────────────────────────────────────────────┤
│                    PRIMITIVE TOKENS                              │
│  --color-blue-500, --space-4, --font-sans                       │
│  (Raw values, never used directly in components)                │
└─────────────────────────────────────────────────────────────────┘
```

### globals.css

```css
@layer base {
  :root {
    /* ═══════════════════════════════════════════════════════════
       LEVEL 1: PRIMITIVE TOKENS (Raw Values)
       These are the foundation - never use directly in components
    ═══════════════════════════════════════════════════════════ */
    
    /* Colors - Primitive */
    --color-gray-50: 0 0% 98%;
    --color-gray-100: 0 0% 96.1%;
    --color-gray-200: 0 0% 89.8%;
    --color-gray-300: 0 0% 83.1%;
    --color-gray-400: 0 0% 63.9%;
    --color-gray-500: 0 0% 45.1%;
    --color-gray-600: 0 0% 32.2%;
    --color-gray-700: 0 0% 25%;
    --color-gray-800: 0 0% 14.9%;
    --color-gray-900: 0 0% 9%;
    --color-gray-950: 0 0% 3.9%;
    
    --color-blue-500: 217.2 91.2% 59.8%;
    --color-blue-600: 221.2 83.2% 53.3%;
    --color-red-500: 0 84.2% 60.2%;
    --color-green-500: 142.1 76.2% 36.3%;
    
    /* Spacing - Primitive */
    --space-0: 0;
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.25rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-10: 2.5rem;
    --space-12: 3rem;
    --space-16: 4rem;
    
    /* Typography - Primitive */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    
    /* Radius - Primitive */
    --radius-none: 0;
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-full: 9999px;
    
    /* ═══════════════════════════════════════════════════════════
       LEVEL 2: SEMANTIC TOKENS (Meaning-Based)
       These define purpose and are mode-aware
    ═══════════════════════════════════════════════════════════ */
    
    /* Surface Colors */
    --background: var(--color-gray-50);
    --foreground: var(--color-gray-950);
    --card: 0 0% 100%;
    --card-foreground: var(--color-gray-950);
    --popover: 0 0% 100%;
    --popover-foreground: var(--color-gray-950);
    
    /* Interactive Colors */
    --primary: var(--color-gray-900);
    --primary-foreground: var(--color-gray-50);
    --secondary: var(--color-gray-100);
    --secondary-foreground: var(--color-gray-900);
    --muted: var(--color-gray-100);
    --muted-foreground: var(--color-gray-500);
    --accent: var(--color-gray-100);
    --accent-foreground: var(--color-gray-900);
    
    /* State Colors */
    --destructive: var(--color-red-500);
    --destructive-foreground: var(--color-gray-50);
    --success: var(--color-green-500);
    --success-foreground: var(--color-gray-50);
    
    /* Border & Input */
    --border: var(--color-gray-200);
    --input: var(--color-gray-200);
    --ring: var(--color-gray-400);
    
    /* Semantic Spacing */
    --space-component-gap: var(--space-4);
    --space-section-gap: var(--space-16);
    --space-page-padding: var(--space-4);
    
    /* Semantic Radius */
    --radius: var(--radius-lg);
    
    /* ═══════════════════════════════════════════════════════════
       LEVEL 3: COMPONENT TOKENS (Specific Use)
       These are scoped to specific components
    ═══════════════════════════════════════════════════════════ */
    
    /* Button Tokens */
    --button-height-sm: 2.25rem;
    --button-height-md: 2.5rem;
    --button-height-lg: 2.75rem;
    --button-padding-x: var(--space-4);
    --button-radius: calc(var(--radius) - 2px);
    --button-font-size: var(--font-size-sm);
    
    /* Input Tokens */
    --input-height: 2.5rem;
    --input-padding-x: var(--space-3);
    --input-padding-y: var(--space-2);
    --input-radius: calc(var(--radius) - 2px);
    --input-font-size: var(--font-size-sm);
    
    /* Card Tokens */
    --card-padding: var(--space-6);
    --card-radius: var(--radius);
    --card-gap: var(--space-component-gap);
    
    /* Modal Tokens */
    --modal-padding: var(--space-6);
    --modal-radius: var(--radius-xl);
    --modal-width-sm: 24rem;
    --modal-width-md: 32rem;
    --modal-width-lg: 42rem;
  }
  
  .dark {
    /* ═══════════════════════════════════════════════════════════
       DARK MODE OVERRIDES (Semantic Level Only)
       Primitives stay the same, semantics change meaning
    ═══════════════════════════════════════════════════════════ */
    
    --background: var(--color-gray-950);
    --foreground: var(--color-gray-50);
    --card: var(--color-gray-900);
    --card-foreground: var(--color-gray-50);
    --popover: var(--color-gray-900);
    --popover-foreground: var(--color-gray-50);
    
    --primary: var(--color-gray-50);
    --primary-foreground: var(--color-gray-900);
    --secondary: var(--color-gray-800);
    --secondary-foreground: var(--color-gray-50);
    --muted: var(--color-gray-800);
    --muted-foreground: var(--color-gray-400);
    --accent: var(--color-gray-800);
    --accent-foreground: var(--color-gray-50);
    
    --border: var(--color-gray-800);
    --input: var(--color-gray-800);
    --ring: var(--color-gray-300);
    
    /* Component tokens inherit semantic changes automatically */
  }
}
```

### Token Usage Pattern

```typescript
// components/ui/button.tsx
// Component uses component tokens, which reference semantic tokens

const buttonVariants = cva(
  // Base styles using component tokens
  `inline-flex items-center justify-center 
   h-[var(--button-height-md)] 
   px-[var(--button-padding-x)]
   rounded-[var(--button-radius)]
   text-[var(--button-font-size)]
   font-medium
   transition-colors
   focus-visible:outline-none 
   focus-visible:ring-2 
   focus-visible:ring-ring`,
  {
    variants: {
      variant: {
        // Uses semantic tokens
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-[var(--button-height-sm)]",
        md: "h-[var(--button-height-md)]",
        lg: "h-[var(--button-height-lg)]",
      },
    },
  }
);
```

## Token Naming Convention

```
Level 1 (Primitive):  --{category}-{name}-{scale}
                      --color-blue-500
                      --space-4
                      --radius-lg

Level 2 (Semantic):   --{purpose}[-{modifier}]
                      --background
                      --primary-foreground
                      --muted-foreground

Level 3 (Component):  --{component}-{property}[-{variant}]
                      --button-height-md
                      --card-padding
                      --input-radius
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

### Creating a New Component Token

```css
/* 1. Identify semantic tokens to use */
--badge-bg: var(--secondary);
--badge-text: var(--secondary-foreground);
--badge-padding-x: var(--space-2);
--badge-padding-y: var(--space-1);
--badge-radius: var(--radius-full);
--badge-font-size: var(--font-size-xs);

/* 2. Component uses these tokens */
.badge {
  display: inline-flex;
  align-items: center;
  background: hsl(var(--badge-bg));
  color: hsl(var(--badge-text));
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-radius);
  font-size: var(--badge-font-size);
}
```

### Overriding for a Theme

```css
/* Purple theme - only change primitives */
:root[data-theme="purple"] {
  --color-purple-500: 270 70% 55%;
  --color-purple-600: 270 70% 45%;
  
  /* Semantic tokens reference the new primitives */
  --primary: var(--color-purple-600);
  /* Component tokens stay the same */
}
```

## Anti-patterns

### Component Using Primitives Directly

```tsx
// Bad - component references primitive
<div className="bg-[var(--color-gray-100)]">...</div>

// Good - component uses semantic
<div className="bg-secondary">...</div>
```

### Skipping Semantic Layer

```css
/* Bad - component token references primitive */
--button-bg: var(--color-blue-600);

/* Good - component token references semantic */
--button-bg: var(--primary);
```

## Related Skills

### Composes Into
- [colors](./colors.md) - Color tokens
- [spacing](./spacing.md) - Spacing tokens
- [typography](./typography.md) - Typography tokens

### Related
- [dark-mode](./dark-mode.md) - Mode-aware tokens

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
