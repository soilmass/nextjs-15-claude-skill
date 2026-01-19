# L0: Primitives

> Design tokens and foundational values. The building blocks of the entire design system.

## Overview

Primitives are the lowest layer in the atomic design hierarchy. They contain **no React components** - only design tokens, CSS custom properties, and Tailwind configuration values.

**Key principle**: Primitives compose nothing and are composed by everything above them.

## Composition Rules

```
L0 Primitives
├── composes: nothing
└── composed by: L1, L2, L3, L4, L5, L6
```

## Categories

| Category | Description | Files |
|----------|-------------|-------|
| `colors` | Color tokens, palettes, semantic colors | p-colors |
| `typography` | Font families, sizes, weights, line heights | p-typography |
| `spacing` | Spacing scale, padding, margins | p-spacing |
| `motion` | Animation durations, easings, transitions | p-motion, p-interaction-timing |
| `layout` | Breakpoints, grids, containers | p-breakpoints, p-grid-systems, p-container-queries, p-fluid-design, p-aspect-ratios, p-logical-properties |
| `accessibility` | Focus states, touch targets, reduced motion | p-accessibility |
| `theming` | Dark mode, brand expression, token system | p-dark-mode, p-brand-expression, p-token-system |
| `visual` | Shadows, borders, z-index, visual hierarchy, iconography | p-shadows, p-borders, p-z-index, p-visual-hierarchy, p-iconography |

## Files (20 total)

| ID | Name | Category |
|----|------|----------|
| `p-colors` | Colors | colors |
| `p-typography` | Typography | typography |
| `p-spacing` | Spacing | spacing |
| `p-shadows` | Shadows | visual |
| `p-borders` | Borders | visual |
| `p-breakpoints` | Breakpoints | layout |
| `p-z-index` | Z-Index | layout |
| `p-motion` | Motion | motion |
| `p-interaction-timing` | Interaction Timing | motion |
| `p-visual-hierarchy` | Visual Hierarchy | visual |
| `p-accessibility` | Accessibility | accessibility |
| `p-dark-mode` | Dark Mode | theming |
| `p-fluid-design` | Fluid Design | layout |
| `p-brand-expression` | Brand Expression | theming |
| `p-token-system` | Token System | theming |
| `p-grid-systems` | Grid Systems | layout |
| `p-container-queries` | Container Queries | layout |
| `p-iconography` | Iconography | visual |
| `p-aspect-ratios` | Aspect Ratios | layout |
| `p-logical-properties` | Logical Properties | layout |

## Usage

Primitives are consumed via:
1. **Tailwind config** - Extended theme values
2. **CSS custom properties** - Runtime theming
3. **Design tokens** - Build-time configuration

```tsx
// Atoms, molecules, organisms reference primitives via Tailwind classes
<button className="bg-primary text-primary-foreground rounded-md px-4 py-2">
  Click me
</button>
```

## ID Convention

All primitives use the `p-` prefix: `p-{name}`
