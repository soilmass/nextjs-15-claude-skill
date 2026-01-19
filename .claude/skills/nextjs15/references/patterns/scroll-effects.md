---
id: pt-scroll-effects
name: Scroll Effect Patterns
version: 2.0.0
layer: L5
category: animation
description: Scroll-based animations and effects including parallax, reveal, and progress indicators
tags: [scroll, parallax, animations, intersection-observer, framer-motion]
composes:
  - ../molecules/progress-bar.md
dependencies:
  framer-motion: "^11.15.0"
formula: useScroll + useTransform + useInView = Scroll-Linked Animations
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Creating scroll-triggered reveal animations for sections and cards
- Building parallax image effects for hero sections
- Implementing sticky headers that hide on scroll down
- Adding scroll progress indicators for articles
- Creating scroll-linked opacity and scale effects

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SCROLL EFFECTS                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Framer Motion Hooks                      │      │
│  │  ┌───────────────┐  ┌───────────────────────────┐   │      │
│  │  │  useScroll    │  │  useTransform              │   │      │
│  │  │  (progress)   │  │  (map scroll to values)    │   │      │
│  │  └───────────────┘  └───────────────────────────┘   │      │
│  │  ┌───────────────┐  ┌───────────────────────────┐   │      │
│  │  │  useInView    │  │  useMotionValueEvent       │   │      │
│  │  │  (visibility) │  │  (scroll direction)        │   │      │
│  │  └───────────────┘  └───────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Effect Types                             │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ ScrollReveal│  │  Parallax   │  │  Progress   │  │      │
│  │  │ (on enter)  │  │  (speed)    │  │  (bar)      │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ StickyHeader│  │  FadeHero   │  │  Counter    │  │      │
│  │  │ (hide/show) │  │  (opacity)  │  │  (number)   │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Scroll Position Mapping                  │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  scrollYProgress: 0 ──────────────────────► 1   │ │      │
│  │  │  useTransform: [0, 1] → [opacity: 0, 1]         │ │      │
│  │  │  useTransform: [0, 1] → [y: 100, -100]          │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Scroll Effect Patterns

## Overview

Scroll effects create engaging experiences by animating elements based on scroll position. This pattern covers scroll-triggered animations, parallax effects, and progress indicators.

## Implementation

### Scroll-Triggered Fade In

```typescript
// components/motion/scroll-reveal.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

const directionVariants = {
  up: { y: 40, opacity: 0 },
  down: { y: -40, opacity: 0 },
  left: { x: 40, opacity: 0 },
  right: { x: -40, opacity: 0 },
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    margin: "-100px 0px -100px 0px",
  });

  return (
    <motion.div
      ref={ref}
      initial={directionVariants[direction]}
      animate={isInView ? { x: 0, y: 0, opacity: 1 } : directionVariants[direction]}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// Usage
<ScrollReveal direction="up" delay={0.2}>
  <Card>Content appears on scroll</Card>
</ScrollReveal>
```

### Staggered Scroll Reveal

```typescript
// components/motion/staggered-reveal.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface StaggeredRevealProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
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

export function StaggeredReveal({
  children,
  staggerDelay = 0.1,
  className,
}: StaggeredRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: { staggerChildren: staggerDelay },
        },
      }}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Parallax Effect

```typescript
// components/motion/parallax.tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // -1 to 1, negative = opposite direction
  className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// Parallax image background
export function ParallaxImage({
  src,
  alt,
  speed = 0.3,
  className,
}: {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 30}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
```

### Scroll Progress Indicator

```typescript
// components/motion/scroll-progress.tsx
"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
    />
  );
}

// Section-based progress
export function SectionProgress({ sections }: { sections: string[] }) {
  const { scrollYProgress } = useScroll();

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
      {sections.map((section, index) => {
        const sectionStart = index / sections.length;
        const sectionEnd = (index + 1) / sections.length;

        return (
          <motion.a
            key={section}
            href={`#${section}`}
            className="flex items-center gap-2 group"
          >
            <motion.div
              style={{
                backgroundColor: useTransform(
                  scrollYProgress,
                  [sectionStart, sectionEnd],
                  ["rgb(156, 163, 175)", "rgb(59, 130, 246)"]
                ),
              }}
              className="h-2 w-2 rounded-full"
            />
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {section}
            </span>
          </motion.a>
        );
      })}
    </div>
  );
}
```

### Sticky Header with Scroll Effect

```typescript
// components/motion/scroll-header.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    // Hide on scroll down, show on scroll up
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    
    // Add background after scrolling
    setScrolled(latest > 50);
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-[background-color,backdrop-filter] duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b"
          : "bg-transparent"
      )}
    >
      {children}
    </motion.header>
  );
}
```

### Scroll-Linked Number Counter

```typescript
// components/motion/scroll-counter.tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

interface ScrollCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function ScrollCounter({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
}: ScrollCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });

  const count = useTransform(scrollYProgress, [0, 1], [0, end]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <motion.span>
        {isInView ? (
          <motion.span>{Math.round(count.get())}</motion.span>
        ) : (
          0
        )}
      </motion.span>
      {suffix}
    </span>
  );
}
```

### Scroll-Linked Opacity/Scale

```typescript
// components/motion/scroll-fade.tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollFadeOut({ children, className }: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <motion.div ref={ref} style={{ opacity, scale }} className={className}>
      {children}
    </motion.div>
  );
}

// Hero that fades as you scroll
export function ScrollHero({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.95]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="relative h-screen flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}
```

### Infinite Scroll Load Animation

```typescript
// components/motion/infinite-scroll.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  keyExtractor,
  onLoadMore,
  hasMore,
  isLoading,
}: InfiniteScrollProps<T>) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load more trigger */}
      <div ref={loaderRef} className="py-8 flex justify-center">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

## Variants

### CSS-Only Scroll Animations

```css
/* Using CSS scroll-driven animations (modern browsers) */
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-reveal {
  animation: reveal linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
```

### Intersection Observer Hook

```typescript
// hooks/use-intersection.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useIntersection(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry?.isIntersecting ?? false);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, isIntersecting };
}
```

## Anti-patterns

1. **Too many parallax elements**: Performance degradation
2. **Ignoring mobile**: Heavy scroll effects on mobile
3. **No fallback**: Breaking on older browsers
4. **Scroll jacking**: Taking over scroll behavior
5. **Not using will-change**: Missing optimization hints

## Related Skills

- `L5/patterns/animations` - General animations
- `L5/patterns/performance` - Performance optimization
- `L5/patterns/infinite-scroll` - Data loading patterns
- `L3/organisms/hero` - Hero sections

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Framer Motion
