---
id: p-dark-mode
name: Dark Mode
version: 2.0.0
layer: L0
category: theming
composes: []
description: Dark mode color system and adaptations
tags: [design-tokens, dark-mode, theming, colors]
dependencies:
  - next-themes@0.3.0
performance:
  impact: medium
  lcp: neutral
  cls: positive
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: false
---

# Dark Mode

## Overview

Dark mode requires more than inverted colors. This skill provides a complete dark mode system with proper contrast, reduced brightness, and adapted visual elements like shadows-to-borders conversions.

Key principles:
- Not pure black (#0a0a0a for reduced halation)
- Reduced saturation for comfort
- Shadows become borders/glows
- Respect system preference with manual override

## When to Use

Use this skill when:
- Implementing theme switching
- Adapting components for dark mode
- Handling images and media in dark mode
- Setting up next-themes integration

## Implementation

### globals.css

```css
@layer base {
  :root {
    /* Light mode - defined in colors.md */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    /* ... other light tokens */
  }
  
  .dark {
    /* Dark mode background layers (not pure black) */
    --background: 0 0% 3.9%;        /* #0a0a0a */
    --foreground: 0 0% 98%;          /* #fafafa */
    
    /* Surface elevation */
    --card: 0 0% 7%;                 /* #121212 */
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 9%;              /* #171717 */
    --popover-foreground: 0 0% 98%;
    
    /* Semantic colors */
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    
    /* Borders (more visible in dark) */
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    
    /* Destructive (darker in dark mode) */
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    
    /* Chart colors (adjusted for dark bg) */
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

/* Dark mode adaptations */
@layer utilities {
  /* Shadows become borders in dark mode */
  .dark .shadow-sm {
    box-shadow: none;
    border: 1px solid hsl(var(--border));
  }
  
  .dark .shadow-md,
  .dark .shadow-lg {
    box-shadow: none;
    border: 1px solid hsl(var(--border));
  }
  
  /* Or use subtle glow effect */
  .dark .shadow-glow {
    box-shadow: 0 0 20px -5px hsl(var(--primary) / 0.1);
  }
  
  /* Image brightness reduction */
  .dark img:not([data-no-dark-adjust]) {
    filter: brightness(0.9);
  }
  
  /* SVG color inversion */
  .dark .invert-dark {
    filter: invert(1);
  }
}
```

### components/providers/theme-provider.tsx

```typescript
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

### app/layout.tsx

```typescript
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### components/theme-toggle.tsx

```typescript
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Dark Mode Elevation

| Level | Light Mode | Dark Mode |
|-------|------------|-----------|
| Base | bg-background | bg-background |
| Raised | shadow-sm | bg-card + border |
| Elevated | shadow-md | bg-popover + border |
| Floating | shadow-lg | bg-popover + border + glow |

## Variants

### Manual Toggle Only

```tsx
// Disable system preference, manual only
<ThemeProvider defaultTheme="light" enableSystem={false}>
  {children}
</ThemeProvider>
```

### Scoped Dark Mode

```tsx
// Dark section within light page
<section className="dark bg-background text-foreground p-8 rounded-lg">
  <h2>Dark Section</h2>
  <p className="text-muted-foreground">Content with dark theme</p>
</section>
```

## Dependencies

```json
{
  "dependencies": {
    "next-themes": "0.3.0"
  }
}
```

## Examples

### Card with Dark Mode

```tsx
<div className="bg-card rounded-lg p-6 shadow-sm dark:shadow-none dark:border">
  <h3 className="font-semibold">Card Title</h3>
  <p className="text-muted-foreground">
    Card adapts to dark mode with border instead of shadow.
  </p>
</div>
```

### Image with Dark Mode Adjustment

```tsx
// Automatically darkened in dark mode
<img src="/hero.jpg" alt="Hero" />

// Opt out of darkening
<img src="/logo.svg" alt="Logo" data-no-dark-adjust />

// Manual inversion for dark icons
<img src="/icon.svg" alt="" className="dark:invert" />
```

### Themed Illustrations

```tsx
// Different images per theme
import { useTheme } from "next-themes";
import Image from "next/image";

export function ThemedIllustration() {
  const { resolvedTheme } = useTheme();
  
  return (
    <Image
      src={resolvedTheme === "dark" ? "/hero-dark.svg" : "/hero-light.svg"}
      alt="Hero illustration"
      width={600}
      height={400}
    />
  );
}
```

### Conditional Styling

```tsx
// Class-based (preferred)
<div className="bg-white dark:bg-gray-900">...</div>

// Style-based with CSS variables
<div style={{ backgroundColor: "hsl(var(--background))" }}>...</div>
```

## Anti-patterns

### Pure Black Background

```css
/* Bad - causes halation/strain */
.dark {
  --background: 0 0% 0%;
}

/* Good - off-black */
.dark {
  --background: 0 0% 3.9%;
}
```

### Same Shadows in Dark

```tsx
// Bad - shadows invisible in dark mode
<div className="shadow-lg">...</div>

// Good - shadows become borders
<div className="shadow-lg dark:shadow-none dark:border">...</div>
```

### Flash of Wrong Theme

```tsx
// Bad - no suppressHydrationWarning
<html lang="en">

// Good - prevents flash
<html lang="en" suppressHydrationWarning>
```

## Related Skills

### Composes Into
- [colors](./colors.md) - Color tokens
- [shadows](./shadows.md) - Shadow adaptations

### Related
- [ThemeToggle](../organisms/header.md) - Theme switching UI

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
