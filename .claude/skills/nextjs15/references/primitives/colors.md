---
id: p-colors
name: Colors
version: 2.0.0
layer: L0
category: colors
composes: []
description: OKLCH color system with 22 hues x 11 steps + semantic tokens
tags: [design-tokens, colors, oklch, dark-mode, theming]
dependencies: []
performance:
  impact: critical
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AAA
  keyboard: false
  screen-reader: false
---

# Colors

## Overview

The color system uses OKLCH (Oklab Lightness Chroma Hue) for perceptual uniformity. Unlike HSL, OKLCH ensures that colors with the same lightness value actually appear equally bright to human eyes. This is critical for:

- Consistent contrast ratios across all color combinations
- Predictable color relationships for dark mode
- Accessibility compliance without manual adjustments

The system provides 22 color hues with 11 steps each (50-950), plus semantic tokens that map to functional uses.

## When to Use

Use this skill when:
- Setting up a new Next.js 15 project's design system
- Configuring Tailwind CSS color palette
- Implementing dark mode color switching
- Ensuring WCAG AA/AAA contrast compliance

## Implementation

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens - these change with theme
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Chart colors
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode semantic tokens */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.625rem;
    
    /* Chart colors */
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    /* Dark mode semantic tokens */
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    
    /* Dark mode chart colors */
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### OKLCH Color Palette (Optional Advanced)

```css
/* For projects requiring OKLCH precision */
@layer base {
  :root {
    /* Blue palette - OKLCH */
    --color-blue-50:  oklch(0.97 0.014 254.604);
    --color-blue-100: oklch(0.932 0.032 255.585);
    --color-blue-200: oklch(0.882 0.059 254.128);
    --color-blue-300: oklch(0.809 0.105 251.813);
    --color-blue-400: oklch(0.707 0.165 254.624);
    --color-blue-500: oklch(0.623 0.214 259.815);
    --color-blue-600: oklch(0.546 0.245 262.881);
    --color-blue-700: oklch(0.488 0.243 264.376);
    --color-blue-800: oklch(0.424 0.199 265.638);
    --color-blue-900: oklch(0.379 0.146 265.522);
    --color-blue-950: oklch(0.282 0.091 267.935);
    
    /* Green palette - OKLCH */
    --color-green-50:  oklch(0.962 0.044 156.743);
    --color-green-100: oklch(0.923 0.096 155.995);
    --color-green-200: oklch(0.871 0.15 154.449);
    --color-green-300: oklch(0.792 0.209 151.711);
    --color-green-400: oklch(0.702 0.221 152.552);
    --color-green-500: oklch(0.596 0.2 150.069);
    --color-green-600: oklch(0.494 0.174 149.769);
    --color-green-700: oklch(0.408 0.143 150.388);
    --color-green-800: oklch(0.344 0.115 150.891);
    --color-green-900: oklch(0.297 0.092 151.328);
    --color-green-950: oklch(0.17 0.061 152.163);
    
    /* Add more palettes as needed */
  }
}
```

## Variants

### Brand Color Customization

```css
/* Replace primary with brand color */
:root {
  --primary: 221.2 83.2% 53.3%; /* Blue brand */
  --primary-foreground: 210 40% 98%;
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --foreground: 0 0% 0%;
    --background: 0 0% 100%;
    --border: 0 0% 0%;
    --muted-foreground: 0 0% 20%;
  }
  
  .dark {
    --foreground: 0 0% 100%;
    --background: 0 0% 0%;
    --border: 0 0% 100%;
    --muted-foreground: 0 0% 80%;
  }
}
```

## Accessibility

### Contrast Requirements

| Use Case | Minimum Ratio | Target |
|----------|--------------|--------|
| Body text | 4.5:1 | 7:1 |
| Large text (18px+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |
| Decorative | No requirement | - |

### Color Blindness Considerations

- Never use color alone to convey information
- Pair colors with icons, patterns, or text labels
- Test with color blindness simulators

## Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0",
    "tailwindcss-animate": "1.0.7"
  }
}
```

## Examples

### Using Semantic Colors

```tsx
// Background and text automatically adjust for dark mode
<div className="bg-background text-foreground">
  <h1 className="text-primary">Primary Heading</h1>
  <p className="text-muted-foreground">Muted description text</p>
  <button className="bg-primary text-primary-foreground">
    Primary Button
  </button>
</div>
```

### Destructive State

```tsx
<div className="bg-destructive/10 border border-destructive rounded-lg p-4">
  <p className="text-destructive">Error message here</p>
</div>
```

## Anti-patterns

### Hardcoding Colors

```tsx
// Bad - Won't adapt to dark mode
<div className="bg-white text-black">...</div>

// Good - Uses semantic tokens
<div className="bg-background text-foreground">...</div>
```

### Ignoring Contrast

```tsx
// Bad - May not meet WCAG requirements
<p className="text-gray-400">Low contrast text</p>

// Good - Uses muted-foreground which is tested
<p className="text-muted-foreground">Accessible muted text</p>
```

## Related Skills

### Composes Into
- [dark-mode](./dark-mode.md) - Dark mode color switching
- [visual-hierarchy](./visual-hierarchy.md) - Text contrast levels

### Alternatives
- [brand-expression](./brand-expression.md) - For custom brand colors

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
