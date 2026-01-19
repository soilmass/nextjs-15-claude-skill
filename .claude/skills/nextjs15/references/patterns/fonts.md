---
id: pt-fonts
name: Font Optimization
version: 2.0.0
layer: L5
category: performance
description: Next.js font optimization with next/font for zero layout shift
tags: [performance, fonts, typography, cls, next-font, next15]
composes: []
dependencies: []
formula: "font_optimization = next_font + display_swap + preload + fallback_adjustment + variable_fonts"
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Font Optimization

## Overview

`next/font` automatically optimizes fonts and removes external network requests for improved privacy and performance. It includes built-in automatic self-hosting for any font file, with zero layout shift (CLS) using the CSS `size-adjust` property.

## When to Use

- **Google Fonts**: Use next/font/google for automatic optimization
- **Local fonts**: Use next/font/local for custom fonts
- **Variable fonts**: Reduce file count with weight ranges
- **CLS prevention**: Zero layout shift with size-adjust
- **Privacy**: Self-host fonts without external requests
- **Multiple families**: Sans + Serif + Mono for different contexts

## Composition Diagram

```
+------------------+
|    next/font     |
+------------------+
          |
    +-----+-----+
    |           |
    v           v
+--------+  +--------+
| Google |  | Local  |
| Fonts  |  | Fonts  |
+--------+  +--------+
          |
          v
+------------------+
| Self-Hosted      |
| (no external req)|
+------------------+
          |
    +-----+-----+
    |           |
    v           v
+--------+  +--------+
|Preload |  |CSS Var |
|Critical|  |Integration|
+--------+  +--------+
          |
          v
+------------------+
| Zero CLS         |
| (size-adjust)    |
+------------------+
```

## Google Fonts

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

// Sans-serif primary font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Monospace for code
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Serif for headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        inter.variable,
        robotoMono.variable,
        playfair.variable
      )}
    >
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

## Tailwind CSS Integration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
};

export default config;
```

## Local Fonts

```typescript
// app/layout.tsx
import localFont from "next/font/local";

const geistSans = localFont({
  src: [
    {
      path: "../fonts/GeistVF.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

## Variable Fonts with Weights

```typescript
// Using variable fonts with specific weights
import { Inter } from "next/font/google";

// Variable font - specify weight range
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  // Variable fonts support weight ranges
  weight: "variable", // or specific: ['400', '500', '600', '700']
});

// Non-variable font - must specify weights
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"], // Required for non-variable fonts
});
```

## Font with Specific Styles

```typescript
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-merriweather",
});
```

## Preloading Critical Fonts

```typescript
// Fonts are automatically preloaded, but you can control it
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true, // Default is true
  fallback: ["system-ui", "arial"], // Fallback fonts
  adjustFontFallback: true, // Auto-adjust fallback metrics
});
```

## Icon Fonts Alternative

```typescript
// DON'T use icon fonts - use Lucide React instead
// Bad: Font Awesome, Material Icons (font versions)

// Good: Lucide React (SVG icons)
import { Menu, X, ChevronDown } from "lucide-react";

export function Navigation() {
  return (
    <nav>
      <button>
        <Menu className="h-6 w-6" />
      </button>
    </nav>
  );
}
```

## Multiple Font Families Component

```typescript
// components/ui/text.tsx
import { cn } from "@/lib/utils";

interface TextProps {
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: "body" | "heading" | "code" | "display";
  className?: string;
  children: React.ReactNode;
}

const variantClasses = {
  body: "font-sans",
  heading: "font-serif font-bold",
  code: "font-mono bg-muted px-1 py-0.5 rounded text-sm",
  display: "font-serif font-bold tracking-tight",
};

export function Text({
  as: Component = "p",
  variant = "body",
  className,
  children,
}: TextProps) {
  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}

// Usage
<Text variant="heading" as="h1" className="text-4xl">
  Welcome
</Text>
<Text variant="code">npm install next</Text>
```

## Font Loading Strategies

```typescript
// display options:
// - 'auto': Browser default (usually 'block')
// - 'block': Brief invisible text, then custom font
// - 'swap': Fallback immediately, swap when loaded (recommended)
// - 'fallback': Brief invisible, fallback if not loaded quickly
// - 'optional': Only use if cached (best for non-critical fonts)

import { Inter, Merriweather } from "next/font/google";

// Primary font - swap for best CLS
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Decorative font - optional, only if cached
const decorative = Merriweather({
  subsets: ["latin"],
  weight: ["700"],
  display: "optional",
});
```

## Subset Optimization

```typescript
import { Noto_Sans_JP } from "next/font/google";

// For large character sets (CJK), specify subsets
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"], // Only Latin by default
  weight: ["400", "700"],
  display: "swap",
  preload: false, // Don't preload large fonts
});

// Preconnect for faster loading
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Typography Scale with Fonts

```typescript
// lib/typography.ts
export const typography = {
  display: {
    large: "font-serif text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter",
    medium: "font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
    small: "font-serif text-3xl md:text-4xl font-bold tracking-tight",
  },
  heading: {
    h1: "font-sans text-3xl md:text-4xl font-bold tracking-tight",
    h2: "font-sans text-2xl md:text-3xl font-semibold tracking-tight",
    h3: "font-sans text-xl md:text-2xl font-semibold",
    h4: "font-sans text-lg md:text-xl font-medium",
  },
  body: {
    large: "font-sans text-lg leading-relaxed",
    base: "font-sans text-base leading-normal",
    small: "font-sans text-sm leading-normal",
  },
  ui: {
    label: "font-sans text-sm font-medium",
    helper: "font-sans text-sm text-muted-foreground",
    button: "font-sans text-sm font-medium",
  },
  code: {
    inline: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
    block: "font-mono text-sm",
  },
};

// Usage
<h1 className={typography.display.large}>Hero Title</h1>
<p className={typography.body.large}>Body text</p>
<code className={typography.code.inline}>inline code</code>
```

## Font Feature Settings

```typescript
// Enable OpenType features in Tailwind
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".font-feature-default": {
          fontFeatureSettings: '"kern" 1, "liga" 1',
        },
        ".font-feature-tabular": {
          fontFeatureSettings: '"tnum" 1',
        },
        ".font-feature-oldstyle": {
          fontFeatureSettings: '"onum" 1',
        },
        ".font-feature-stylistic": {
          fontFeatureSettings: '"ss01" 1',
        },
      });
    },
  ],
};

// Usage
<span className="font-feature-tabular">1,234,567</span>
```

## Anti-patterns

### Don't Load Too Many Fonts

```typescript
// BAD - Multiple font families
const font1 = Inter({ subsets: ["latin"] });
const font2 = Roboto({ subsets: ["latin"], weight: ["400", "700"] });
const font3 = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const font4 = OpenSans({ subsets: ["latin"], weight: ["400", "600"] });

// GOOD - 2-3 fonts max (sans, serif, mono)
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

### Don't Skip display: "swap"

```typescript
// BAD - Invisible text during load
const inter = Inter({ subsets: ["latin"] });

// GOOD - Fallback font shown immediately
const inter = Inter({ subsets: ["latin"], display: "swap" });
```

### Don't Use Inline Font Loading

```typescript
// BAD - Inline @font-face or external links
<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet" />

// GOOD - Use next/font
import { Inter } from "next/font/google";
```

## Related Skills

- [image-optimization](./image-optimization.md)
- [core-web-vitals](./core-web-vitals.md)
- [code-splitting](./code-splitting.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Google and local fonts
- Tailwind integration
- Typography scale
