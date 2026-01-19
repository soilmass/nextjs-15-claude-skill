---
id: p-typography
name: Typography
version: 2.0.0
layer: L0
category: typography
composes: []
description: Typography scale with fluid sizing and font system
tags: [design-tokens, typography, fonts, fluid, responsive]
dependencies: []
performance:
  impact: critical
  lcp: positive
  cls: positive
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Typography

## Overview

The typography system defines font families, sizes, weights, line heights, and letter spacing. It uses a modular scale (1.25 Major Third) for harmonious size relationships and fluid typography for responsive scaling without breakpoint jumps.

Key features:
- Next.js font optimization with `next/font`
- Fluid typography using CSS `clamp()`
- Proper line heights for readability
- Optimized font loading to prevent layout shift

## When to Use

Use this skill when:
- Setting up typography for a new project
- Configuring Next.js font loading
- Implementing responsive text sizing
- Ensuring consistent text styling across the app

## Implementation

### lib/fonts.ts

```typescript
import { Inter, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

### app/layout.tsx

```typescript
import { fontSans, fontMono } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        // Base scale (rem)
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
    },
  },
};

export default config;
```

### globals.css - Fluid Typography

```css
@layer base {
  :root {
    /* Fluid typography scale */
    --text-fluid-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    --text-fluid-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
    --text-fluid-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
    --text-fluid-lg: clamp(1.125rem, 1rem + 0.5vw, 1.5rem);
    --text-fluid-xl: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
    --text-fluid-2xl: clamp(2rem, 1.5rem + 2vw, 3.5rem);
    --text-fluid-3xl: clamp(2.5rem, 2rem + 3vw, 5rem);
    
    /* Reading width */
    --measure-min: 45ch;
    --measure-optimal: 65ch;
    --measure-max: 85ch;
  }
  
  /* Prose defaults */
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight;
    text-wrap: balance;
  }
  
  h1 { @apply text-4xl lg:text-5xl; }
  h2 { @apply text-3xl lg:text-4xl; }
  h3 { @apply text-2xl lg:text-3xl; }
  h4 { @apply text-xl lg:text-2xl; }
  h5 { @apply text-lg lg:text-xl; }
  h6 { @apply text-base lg:text-lg; }
  
  p {
    @apply leading-relaxed;
    max-width: var(--measure-optimal);
  }
}
```

## Variants

### Display Typography

```css
/* For hero sections and large headings */
.text-display {
  font-size: var(--text-fluid-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-wrap: balance;
}

.text-headline {
  font-size: var(--text-fluid-2xl);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-wrap: balance;
}
```

### Body Typography

```css
/* Prose content styling */
.prose {
  --prose-body: var(--foreground);
  --prose-headings: var(--foreground);
  --prose-links: var(--primary);
  --prose-code: var(--foreground);
  
  max-width: var(--measure-optimal);
}

.prose p {
  margin-bottom: 1.25em;
}

.prose h2 {
  margin-top: 2em;
  margin-bottom: 0.75em;
  scroll-margin-top: 5rem;
}

.prose h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  scroll-margin-top: 5rem;
}
```

## Accessibility

### Font Size Requirements

- Body text: Minimum 16px (1rem)
- Small text: Minimum 12px, use sparingly
- User should be able to zoom to 200%

### Line Height

- Body text: 1.5 minimum for readability
- Headings: 1.1-1.3 for compact appearance
- Small text: 1.5-1.75 for legibility

### Text Spacing (WCAG 1.4.12)

Users must be able to:
- Line height: 1.5x font size
- Paragraph spacing: 2x font size
- Letter spacing: 0.12x font size
- Word spacing: 0.16x font size

## Dependencies

```json
{
  "dependencies": {
    "next": "15.0.0",
    "tailwindcss": "4.0.0"
  }
}
```

## Examples

### Heading with Fluid Typography

```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
  Build faster with Next.js
</h1>

// Or using custom fluid class
<h1 style={{ fontSize: "var(--text-fluid-3xl)" }} className="font-bold tracking-tight">
  Build faster with Next.js
</h1>
```

### Prose Content

```tsx
<article className="prose dark:prose-invert max-w-none">
  <h1>Article Title</h1>
  <p className="text-lg text-muted-foreground">
    Lead paragraph with larger text and muted color.
  </p>
  <p>
    Body paragraph with optimal reading width and proper line height 
    for comfortable reading experience.
  </p>
</article>
```

### Code Typography

```tsx
<code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
  npm install next
</code>

<pre className="font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
  {codeBlock}
</pre>
```

## Anti-patterns

### Using px Instead of rem

```tsx
// Bad - Ignores user font preferences
<p style={{ fontSize: "14px" }}>Text</p>

// Good - Respects user preferences
<p className="text-sm">Text</p>
```

### Missing Line Height on Headings

```tsx
// Bad - Line height issues with wrapped text
<h1 className="text-5xl">Long heading that wraps</h1>

// Good - Proper line height
<h1 className="text-5xl leading-tight">Long heading that wraps</h1>
```

### Ignoring Text Wrap

```tsx
// Bad - May create orphans
<h1>This is a heading that might wrap awkwardly</h1>

// Good - Uses text-wrap: balance
<h1 className="text-balance">This is a heading that wraps nicely</h1>
```

## Related Skills

### Composes Into
- [display-text](../atoms/display-text.md) - Text component
- [display-heading](../atoms/display-heading.md) - Heading component

### Related
- [spacing](./spacing.md) - Vertical rhythm
- [fluid-design](./fluid-design.md) - Fluid scaling system

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
