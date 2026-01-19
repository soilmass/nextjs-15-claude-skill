---
id: pt-transitions
name: Transition Patterns
version: 2.0.0
layer: L5
category: animation
description: CSS transition patterns for smooth state changes and hover effects
tags: [transitions, css, hover, state-changes, performance]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-text.md
  - ../molecules/card.md
dependencies:
  framer-motion: "^11.15.0"
formula: CSS Transitions + Tailwind Utilities + GPU Properties = Smooth State Changes
performance:
  impact: medium
  lcp: neutral
  cls: low
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Adding smooth hover effects to buttons, cards, and interactive elements
- Creating visual feedback for focus states on form inputs
- Animating icon rotations and transforms on user interaction
- Building dropdown menus with fade and scale transitions
- Implementing theme toggles with smooth icon swaps

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     TRANSITION PATTERNS                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │               Transition Properties                   │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │      │
│  │  │   colors     │  │  transform   │  │  opacity   │ │      │
│  │  │  (bg, text)  │  │ (scale, rot) │  │            │ │      │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │      │
│  │  │   shadow     │  │   border     │  │    all     │ │      │
│  │  │  (box-shd)   │  │  (color)     │  │ (avoid!)   │ │      │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Timing                              │      │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────────────┐ │      │
│  │  │ 150-200ms │  │  ease-out │  │  spring (cubic)  │ │      │
│  │  │  (fast)   │  │  (smooth) │  │   (bouncy)       │ │      │
│  │  └───────────┘  └───────────┘  └──────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Component Applications                   │      │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │      │
│  │  │ Button  │  │  Input  │  │  Card   │  │ NavLink │ │      │
│  │  │ hover   │  │ focus   │  │ hover   │  │ active  │ │      │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Transition Patterns

## Overview

CSS transitions provide smooth state changes without JavaScript. This pattern covers optimized transition configurations, common use cases, and performance considerations.

## Implementation

### Tailwind Transition Utilities

```typescript
// lib/transitions.ts
// Reusable transition class combinations

export const transitions = {
  // All properties
  all: "transition-all duration-200 ease-out",
  allSlow: "transition-all duration-500 ease-out",
  allFast: "transition-all duration-150 ease-out",

  // Specific properties (better performance)
  colors: "transition-colors duration-200 ease-out",
  opacity: "transition-opacity duration-200 ease-out",
  transform: "transition-transform duration-200 ease-out",
  shadow: "transition-shadow duration-200 ease-out",
  
  // Combined optimized
  interactive: "transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out",
  
  // Timing functions
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy effect
};

// Usage
<button className={cn(transitions.interactive, "hover:bg-primary")}>
  Click me
</button>
```

### Button Transitions

```typescript
// components/ui/button.tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base styles with transitions
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md",
    "text-sm font-medium ring-offset-background",
    // Transitions
    "transition-[color,background-color,border-color,box-shadow,transform]",
    "duration-200 ease-out",
    // Focus states
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Disabled state
    "disabled:pointer-events-none disabled:opacity-50",
    // Active state transform
    "active:scale-[0.98]"
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "hover:shadow-md"
        ),
        destructive: cn(
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90"
        ),
        outline: cn(
          "border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground",
          "hover:border-accent"
        ),
        secondary: cn(
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80"
        ),
        ghost: cn(
          "hover:bg-accent hover:text-accent-foreground"
        ),
        link: cn(
          "text-primary underline-offset-4",
          "hover:underline"
        ),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Input Transitions

```typescript
// components/ui/input.tsx
const inputStyles = cn(
  // Base
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
  // Placeholder
  "placeholder:text-muted-foreground",
  // Transitions
  "transition-[border-color,box-shadow] duration-200 ease-out",
  // Default state
  "border-input",
  // Focus state
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  "focus:border-primary",
  // Hover state (when not focused)
  "hover:border-primary/50",
  // Disabled
  "disabled:cursor-not-allowed disabled:opacity-50"
);

// Error state transition
const inputErrorStyles = cn(
  inputStyles,
  "border-destructive",
  "focus:ring-destructive/50",
  "hover:border-destructive/80"
);
```

### Card Hover Transitions

```typescript
// components/ui/card.tsx
const cardVariants = cva(
  cn(
    "rounded-lg border bg-card text-card-foreground shadow-sm",
    "transition-[transform,box-shadow,border-color] duration-300 ease-out"
  ),
  {
    variants: {
      interactive: {
        true: cn(
          "cursor-pointer",
          "hover:shadow-lg hover:shadow-primary/10",
          "hover:border-primary/50",
          "hover:-translate-y-1",
          "active:translate-y-0 active:shadow-md"
        ),
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
    },
  }
);

// Usage
<Card interactive>
  <CardHeader>
    <CardTitle>Interactive Card</CardTitle>
  </CardHeader>
</Card>
```

### Navigation Link Transitions

```typescript
// components/nav-link.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        // Base styles
        "relative px-3 py-2 text-sm font-medium rounded-md",
        // Transition
        "transition-colors duration-200 ease-out",
        // States
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
        // Underline indicator
        "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full",
        "after:origin-left after:scale-x-0 after:bg-primary",
        "after:transition-transform after:duration-300 after:ease-out",
        isActive && "after:scale-x-100"
      )}
    >
      {children}
    </Link>
  );
}
```

### Icon Transitions

```typescript
// components/ui/icon-button.tsx
import { cn } from "@/lib/utils";

export function IconButton({ 
  icon: Icon, 
  label,
  ...props 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "p-2 rounded-lg",
        "transition-[background-color,transform] duration-200 ease-out",
        "hover:bg-accent",
        "active:scale-95",
        // Icon transition
        "[&>svg]:transition-transform [&>svg]:duration-200",
        "[&>svg]:hover:scale-110"
      )}
      {...props}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

// Rotating icon on hover
export function RefreshButton() {
  return (
    <button
      className={cn(
        "p-2 rounded-lg hover:bg-accent",
        "[&>svg]:transition-transform [&>svg]:duration-500",
        "[&>svg]:hover:rotate-180"
      )}
    >
      <RefreshCw className="h-5 w-5" />
    </button>
  );
}
```

### Dropdown/Menu Transitions

```typescript
// components/ui/dropdown.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function Dropdown({ 
  trigger, 
  children 
}: { 
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1"
      >
        {trigger}
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      <div
        className={cn(
          // Position
          "absolute top-full left-0 mt-2 min-w-[200px]",
          // Base styles
          "rounded-md border bg-popover p-1 shadow-md",
          // Transition
          "transition-[opacity,transform] duration-200 ease-out",
          "origin-top-left",
          // States
          isOpen 
            ? "opacity-100 scale-100" 
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {children}
      </div>
    </div>
  );
}
```

### Theme Toggle Transition

```typescript
// components/theme-toggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative h-10 w-10 rounded-full",
        "bg-secondary",
        "transition-colors duration-300"
      )}
    >
      {/* Sun icon */}
      <Sun
        className={cn(
          "absolute inset-0 m-auto h-5 w-5",
          "transition-[opacity,transform] duration-300",
          isDark
            ? "opacity-0 rotate-90 scale-50"
            : "opacity-100 rotate-0 scale-100"
        )}
      />
      
      {/* Moon icon */}
      <Moon
        className={cn(
          "absolute inset-0 m-auto h-5 w-5",
          "transition-[opacity,transform] duration-300",
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
        )}
      />
    </button>
  );
}
```

### Skeleton Loading Transition

```typescript
// components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

// Content with fade-in when loaded
export function ContentWithLoader({ 
  isLoading, 
  children 
}: { 
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Skeleton */}
      <div
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-100" : "opacity-0 absolute inset-0"
        )}
      >
        <Skeleton className="h-full w-full" />
      </div>
      
      {/* Content */}
      <div
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      >
        {children}
      </div>
    </div>
  );
}
```

## Variants

### Performance-Optimized Transitions

```typescript
// Only animate transform and opacity (GPU-accelerated)
const performantTransition = cn(
  "transition-[transform,opacity] duration-200",
  "will-change-transform" // Hint to browser
);

// Avoid transitioning:
// - width, height (causes layout)
// - top, left, right, bottom (causes layout)
// - margin, padding (causes layout)
// - font-size (causes layout)

// Instead use:
// - transform: translate(), scale()
// - opacity
```

### Custom Easing Functions

```css
/* tailwind.config.ts */
theme: {
  extend: {
    transitionTimingFunction: {
      'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'snap': 'cubic-bezier(0, 0.55, 0.45, 1)',
    },
  },
}
```

## Anti-patterns

1. **Transitioning all**: `transition-all` is inefficient
2. **Layout-triggering properties**: Animating width/height
3. **Too slow transitions**: > 500ms feels sluggish
4. **Inconsistent durations**: Different timings feel chaotic
5. **No reduced-motion support**: Ignoring `prefers-reduced-motion`

## Related Skills

- `L5/patterns/animations` - Complex animations
- `L5/patterns/micro-interactions` - Interactive feedback
- `L5/patterns/performance` - Performance optimization
- `L0/primitives/motion` - Animation tokens

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Tailwind utilities
