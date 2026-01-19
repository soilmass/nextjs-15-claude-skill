---
id: p-interaction-timing
name: Interaction Timing
version: 2.0.0
layer: L0
category: motion
composes: []
description: Micro-interaction timing patterns
tags: [design-tokens, timing, interactions, ux]
dependencies: []
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: false
---

# Interaction Timing

## Overview

Interaction timing defines *when* animations happen during user interactions. This goes beyond duration—it covers delays, stagger patterns, and state transition timing that create polished micro-interactions.

Key principles:
- Immediate feedback for user actions (< 100ms)
- Progressive disclosure through staggered reveals
- Consistent timing across similar interactions
- Avoid animation blocking user flow

## When to Use

Use this skill when:
- Designing button and input feedback
- Creating tooltip/popover delays
- Implementing staggered list animations
- Building loading and success states

## Implementation

### globals.css

```css
@layer base {
  :root {
    /* Micro-interaction timings */
    --timing-instant: 50ms;    /* Button press feedback */
    --timing-fast: 100ms;      /* Tooltips, small reveals */
    --timing-normal: 200ms;    /* Standard transitions */
    --timing-slow: 300ms;      /* Page transitions */
    --timing-slower: 500ms;    /* Complex choreography */
    --timing-slowest: 800ms;   /* Dramatic reveals */
    
    /* Delay patterns */
    --delay-tooltip: 700ms;    /* Before tooltip shows */
    --delay-hover: 150ms;      /* Before hover state activates */
    --delay-focus: 0ms;        /* Immediate focus feedback */
    --delay-validation: 300ms; /* After input stops */
    
    /* Stagger patterns */
    --stagger-fast: 20ms;      /* Grid items */
    --stagger-normal: 30ms;    /* List items */
    --stagger-slow: 50ms;      /* Large elements */
    --stagger-max-total: 400ms; /* Maximum total stagger time */
    
    /* State hold times */
    --hold-success: 2000ms;    /* Success state before revert */
    --hold-error: 3000ms;      /* Error state display */
    --hold-toast: 5000ms;      /* Toast notification */
  }
}
```

### lib/timing.ts

```typescript
// Timing utilities
export const timing = {
  instant: 50,
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 500,
  slowest: 800,
} as const;

export const delays = {
  tooltip: 700,
  hover: 150,
  focus: 0,
  validation: 300,
} as const;

export const stagger = {
  fast: 20,
  normal: 30,
  slow: 50,
  maxTotal: 400,
} as const;

// Calculate stagger delay (capped)
export function getStaggerDelay(index: number, baseDelay = stagger.normal): number {
  const delay = index * baseDelay;
  return Math.min(delay, stagger.maxTotal);
}

// Debounce with validation timing
export function useValidationDebounce<T>(
  callback: (value: T) => void,
  delay = delays.validation
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((value: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(value), delay);
  }, [callback, delay]);
}
```

## Timing Patterns

### Button Feedback

| Phase | Timing | Animation |
|-------|--------|-----------|
| Press | instant (50ms) | Scale to 0.98, darker bg |
| Release | fast (100ms) | Return to normal |
| Loading | indefinite | Spinner, pulse |
| Success | hold-success | Checkmark, green flash |
| Error | 300ms | Shake animation |

### Input Validation

| Phase | Timing | Animation |
|-------|--------|-----------|
| Focus | instant | Ring appears |
| Typing | none | - |
| Pause (300ms) | delay-validation | Validate |
| Valid | fast (100ms) | Checkmark fade-in |
| Invalid | fast (100ms) | Error message slide-in |

### Tooltip

| Phase | Timing | Animation |
|-------|--------|-----------|
| Hover start | delay-tooltip (700ms) | Wait |
| After delay | fast (100ms) | Fade + scale in |
| Hover end | instant | Fade out |

### Modal

| Phase | Timing | Animation |
|-------|--------|-----------|
| Open overlay | normal (200ms) | Fade in |
| Open content | normal (200ms) | Scale + fade from 0.95 |
| Close content | fast (150ms) | Scale + fade out |
| Close overlay | fast (150ms) | Fade out |

## Variants

### Staggered Grid

```tsx
"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // 30ms stagger
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function StaggeredGrid({ items }: { items: any[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-4"
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={item}
          className="p-4 bg-card rounded-lg"
        >
          {item.title}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Button with Feedback States

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FeedbackButton({ onClick }: { onClick: () => Promise<void> }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async () => {
    setState("loading");
    try {
      await onClick();
      setState("success");
      // Revert after hold time
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={state === "loading"}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.05 }} // instant feedback
      className="relative px-4 py-2 bg-primary text-primary-foreground rounded-md"
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            Submit
          </motion.span>
        )}
        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Saving...
          </motion.span>
        )}
        {state === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            Saved!
          </motion.span>
        )}
        {state === "error" && (
          <motion.span
            key="error"
            initial={{ x: -10 }}
            animate={{ x: [0, -5, 5, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            Failed
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
```

## Accessibility

### Reduced Motion

```tsx
// Check user preference
const prefersReducedMotion = 
  typeof window !== "undefined" && 
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Skip stagger and delays
const staggerDelay = prefersReducedMotion ? 0 : 30;
const tooltipDelay = prefersReducedMotion ? 0 : 700;
```

### Immediate Focus

Focus changes should always be immediate (0ms delay) for keyboard navigation.

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "11.0.0"
  }
}
```

## Examples

### Debounced Search

```tsx
"use client";

import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

export function SearchInput() {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);

  const search = useDebouncedCallback(async (query: string) => {
    const data = await fetch(`/api/search?q=${query}`).then(r => r.json());
    setResults(data);
  }, 300); // delay-validation timing

  return (
    <div>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          search(e.target.value);
        }}
        placeholder="Search..."
        className="w-full p-2 border rounded"
      />
      {/* Results */}
    </div>
  );
}
```

## Anti-patterns

### Too Much Delay

```tsx
// Bad - user waits too long
<Tooltip delayDuration={2000}>...</Tooltip>

// Good - standard delay
<Tooltip delayDuration={700}>...</Tooltip>
```

### Blocking Animations

```tsx
// Bad - can't interact during animation
<button disabled={isAnimating}>...</button>

// Good - animation doesn't block
<button onClick={handleClick}>...</button>
```

## Related Skills

### Composes Into
- [motion](./motion.md) - Duration and easing
- [state-button](../atoms/state-button.md) - Button state timing

### Related
- [design-micro-interactions](../patterns/design/micro-interactions.md) - Micro-interaction patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
