---
id: p-motion
name: Motion
version: 2.0.0
layer: L0
category: motion
composes: []
description: Duration, easing, and animation definitions
tags: [design-tokens, motion, animation, easing, transitions]
dependencies:
  - framer-motion@11.0.0
performance:
  impact: medium
  lcp: neutral
  cls: medium
accessibility:
  wcag: AAA
  keyboard: false
  screen-reader: false
---

# Motion

## Overview

The motion system defines timing, easing curves, and animation patterns. Consistent motion creates a cohesive feel and improves perceived performance. The system respects user preferences for reduced motion.

Key principles:
- Purposeful animation (not decorative)
- Respect `prefers-reduced-motion`
- Use spring physics for natural feel
- Keep durations under 500ms for UI interactions

## When to Use

Use this skill when:
- Adding transitions to interactive elements
- Creating page/component animations
- Implementing loading states
- Building micro-interactions

## Implementation

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      transitionDuration: {
        "0": "0ms",
        "75": "75ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)", // ease-in-out
        linear: "linear",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        pulse: {
          "50%": { opacity: "0.5" },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "none",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        spin: "spin 1s linear infinite",
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### globals.css

```css
@layer base {
  :root {
    /* Duration tokens */
    --duration-instant: 50ms;
    --duration-fast: 100ms;
    --duration-normal: 200ms;
    --duration-slow: 300ms;
    --duration-slower: 500ms;
    --duration-slowest: 800ms;
    
    /* Easing tokens */
    --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

### lib/motion.ts (Framer Motion)

```typescript
import { Variants } from "framer-motion";

// Fade variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Slide up variants
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } 
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    transition: { duration: 0.2 } 
  },
};

// Scale variants
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: 0.15 } 
  },
};

// Stagger children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Spring presets
export const springs = {
  snappy: { stiffness: 400, damping: 30 },
  gentle: { stiffness: 200, damping: 20 },
  bouncy: { stiffness: 300, damping: 10 },
  slow: { stiffness: 100, damping: 20 },
};
```

## Duration Guidelines

| Duration | Use Case |
|----------|----------|
| 0-100ms | Instant feedback (button press) |
| 100-200ms | Micro-interactions (hover, focus) |
| 200-300ms | Component transitions |
| 300-500ms | Page transitions, modals |
| 500ms+ | Decorative/storytelling only |

## Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "4.0.0",
    "tailwindcss-animate": "1.0.7",
    "framer-motion": "11.0.0"
  }
}
```

## Examples

### Button Hover Transition

```tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors duration-150 hover:bg-primary/90">
  Click me
</button>
```

### Animated Component (Framer Motion)

```tsx
"use client";

import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/motion";

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideUp}
      className="bg-card rounded-lg p-6"
    >
      {children}
    </motion.div>
  );
}
```

### Staggered List

```tsx
"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function AnimatedList({ items }: { items: string[] }) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-2"
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={staggerItem} className="p-4 bg-muted rounded">
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Loading Spinner

```tsx
<div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
```

## Anti-patterns

### Ignoring Reduced Motion

```tsx
// Bad - no reduced motion support
<div className="animate-bounce">...</div>

// Good - motion.css handles this, or:
<div className="animate-bounce motion-reduce:animate-none">...</div>
```

### Too Long Durations

```tsx
// Bad - UI feels sluggish
<div className="transition-all duration-1000">...</div>

// Good - snappy interactions
<div className="transition-all duration-200">...</div>
```

## Related Skills

### Composes Into
- [interaction-timing](./interaction-timing.md) - When animations happen
- [scroll-animations](../organisms/scroll-animations.md) - Scroll-triggered motion

### Related
- [shadows](./shadows.md) - Shadow transitions
- [design-animation](../patterns/design/animation.md) - Animation patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
