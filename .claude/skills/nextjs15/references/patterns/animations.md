---
id: pt-animations
name: Animation Patterns
version: 2.0.0
layer: L5
category: animation
description: Animation patterns using Framer Motion and CSS for smooth, performant UI animations
tags: [animations, framer-motion, css, motion, performance]
composes:
  - ../organisms/dialog.md
  - ../molecules/accordion-item.md
dependencies:
  framer-motion: "^11.15.0"
formula: Framer Motion + Variants + AnimatePresence + Layout = Complex Animations
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

- Creating page transitions with fade, slide, and scale effects
- Building animated modals and dialogs with backdrop blur
- Implementing staggered list animations for data loading
- Adding accordion animations with height transitions
- Creating animated counters that count up on scroll

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ANIMATION PATTERNS                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Framer Motion Primitives                 │      │
│  │  ┌───────────────┐  ┌───────────────────────────┐   │      │
│  │  │ motion.div    │  │  AnimatePresence           │   │      │
│  │  │ initial/      │  │  (mount/unmount anims)     │   │      │
│  │  │ animate/exit  │  │                            │   │      │
│  │  └───────────────┘  └───────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Variants                            │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  hidden: { opacity: 0, y: 20 }                  │ │      │
│  │  │  visible: { opacity: 1, y: 0, transition: {     │ │      │
│  │  │    staggerChildren: 0.1                         │ │      │
│  │  │  }}                                             │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Animation Components                     │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │  FadeIn     │  │  SlideUp    │  │  ScaleIn    │  │      │
│  │  │  SlideDown  │  │  PageTrans  │  │  Staggered  │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │  Dialog     │  │  Accordion  │  │  Counter    │  │      │
│  │  │  (modal)    │  │  (expand)   │  │  (animate)  │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Animation Patterns

## Overview

Animations enhance user experience by providing visual feedback and guiding attention. This pattern covers Framer Motion for complex animations and CSS for simple, performant effects.

## Implementation

### Basic Framer Motion Setup

```typescript
// components/motion/animated-container.tsx
"use client";

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// Fade in animation
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; duration?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide up animation
export function SlideUp({
  children,
  className,
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale animation
export function ScaleIn({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### Staggered List Animations

```typescript
// components/motion/staggered-list.tsx
"use client";

import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

interface StaggeredListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
}

export function StaggeredList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
}: StaggeredListProps<T>) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {items.map((item, index) => (
        <motion.li key={keyExtractor(item, index)} variants={itemVariants}>
          {renderItem(item, index)}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// Usage
<StaggeredList
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <UserCard user={user} />}
/>
```

### Page Transitions

```typescript
// components/motion/page-transition.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// app/layout.tsx usage
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
```

### Animated Modal/Dialog

```typescript
// components/motion/animated-dialog.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const dialogVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

interface AnimatedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedDialog({
  isOpen,
  onClose,
  title,
  children,
  className,
}: AnimatedDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-full max-w-lg rounded-lg bg-background p-6 shadow-xl",
              className
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Animated Accordion

```typescript
// components/motion/animated-accordion.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AnimatedAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function AnimatedAccordion({
  items,
  allowMultiple = false,
}: AnimatedAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);

        return (
          <div key={item.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
            >
              <span className="font-medium">{item.title}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="p-4 pt-0 text-muted-foreground">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
```

### CSS Animation Utilities

```typescript
// lib/animations.ts
// CSS keyframe animation classes for Tailwind

export const animations = {
  // Fade animations
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-300",
  
  // Slide animations
  slideInFromTop: "animate-in slide-in-from-top duration-300",
  slideInFromBottom: "animate-in slide-in-from-bottom duration-300",
  slideInFromLeft: "animate-in slide-in-from-left duration-300",
  slideInFromRight: "animate-in slide-in-from-right duration-300",
  
  // Zoom animations
  zoomIn: "animate-in zoom-in-95 duration-300",
  zoomOut: "animate-out zoom-out-95 duration-300",
  
  // Spin
  spin: "animate-spin",
  
  // Pulse
  pulse: "animate-pulse",
  
  // Bounce
  bounce: "animate-bounce",
};

// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      keyframes: {
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
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        "ping": {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "shake": "shake 0.3s ease-in-out",
        "ping": "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
};
```

### Animated Counter

```typescript
// components/motion/animated-counter.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  formatValue = (v) => Math.round(v).toString(),
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const spring = useSpring(0, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => formatValue(current));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, value, isInView]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

// Usage
<AnimatedCounter value={1234567} formatValue={(v) => v.toLocaleString()} />
```

## Variants

### Reduced Motion Support

```typescript
// hooks/use-reduced-motion.ts
"use client";

import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Usage with Framer Motion
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={{ opacity: 1, y: 0 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
/>
```

### Layout Animations

```typescript
// Animate layout changes automatically
<motion.div layout layoutId="unique-id">
  {/* Content that changes position/size */}
</motion.div>

// Shared layout animations between components
<motion.div layoutId="card-1">
  {/* This will animate when another element with same layoutId mounts */}
</motion.div>
```

## Anti-patterns

1. **Animating expensive properties**: width, height instead of transform
2. **No reduced motion support**: Ignoring accessibility preferences
3. **Too many animations**: Visual overload
4. **Layout thrashing**: Animating layout-triggering properties
5. **Missing exit animations**: Abrupt element removal

## Related Skills

- `L5/patterns/transitions` - CSS transitions
- `L5/patterns/micro-interactions` - Interactive feedback
- `L5/patterns/scroll-effects` - Scroll-based animations
- `L5/patterns/performance` - Animation performance

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Framer Motion
