---
id: o-scroll-animations
name: Scroll Animations
version: 2.0.0
layer: L3
category: utility
composes: []
description: Scroll-triggered animations and effects for engaging page experiences
tags: [scroll, animation, reveal, parallax, motion, effects]
formula: "ScrollAnimations = (standalone utilities)"
dependencies: [framer-motion]
performance:
  impact: medium
  lcp: low
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Scroll Animations

## Overview

The Scroll Animations organism provides a comprehensive set of scroll-triggered animation components. Includes reveal animations, parallax effects, scroll progress indicators, and sticky transformations. Built on Framer Motion for smooth, performant animations.

## When to Use

Use this skill when:
- Building engaging landing pages
- Creating reveal-on-scroll effects
- Adding parallax backgrounds
- Showing scroll progress

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ ScrollAnimations (Standalone Utilities)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ FadeIn                              ┌─────────────────┐ │    │
│  │  direction: up | down | left | right│  Stagger        │ │    │
│  │  ┌─────────┐                        │   ┌───┐         │ │    │
│  │  │    ↑    │  fade + translate      │   │ 1 │ delay:0 │ │    │
│  │  │ content │                        │   ├───┤         │ │    │
│  │  └─────────┘                        │   │ 2 │ delay:.1│ │    │
│  │                                     │   ├───┤         │ │    │
│  └─────────────────────────────────────│   │ 3 │ delay:.2│ │    │
│                                        │   └───┘         │ │    │
│                                        └─────────────────┘ │    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Parallax                                                 │    │
│  │  ╔═════════════════════════════════════════════════════╗│    │
│  │  ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║│    │
│  │  ║  ░░░░░ Background moves slower ░░░░░░░░░░░░░░░░░░░ ║│    │
│  │  ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║│    │
│  │  ║     ┌───────────────────────────────────┐          ║│    │
│  │  ║     │   Content moves at normal speed   │          ║│    │
│  │  ║     └───────────────────────────────────┘          ║│    │
│  │  ╚═════════════════════════════════════════════════════╝│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────┐  ┌─────────────────────────────┐    │
│  │ ScrollProgress         │  │ TextReveal                  │    │
│  │ ████████░░░░░░░ 60%   │  │ The text reveals word by   │    │
│  │ (fixed progress bar)  │  │ word as you ████ ████ ████ │    │
│  └────────────────────────┘  └─────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────┐  ┌─────────────────────────────┐    │
│  │ Counter                │  │ Marquee                     │    │
│  │    1,547               │  │ ← SALE • 50% OFF • LIMITED →│    │
│  │  (animates on scroll)  │  │   (infinite scroll text)    │    │
│  └────────────────────────┘  └─────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ HorizontalScroll                                         │    │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                │    │
│  │  │Panel 1│ │Panel 2│ │Panel 3│ │Panel 4│  →→→           │    │
│  │  └───────┘ └───────┘ └───────┘ └───────┘                │    │
│  │  (scroll Y controls horizontal movement)                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- None (standalone animation utilities)

## Implementation

```typescript
// components/organisms/scroll-animations.tsx
"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
  MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Fade In on Scroll
interface FadeInProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 24,
  once = true,
  className,
}: FadeInProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });

  const directionOffset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...directionOffset[direction] }
      }
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger Children on Scroll
interface StaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  once?: boolean;
  className?: string;
}

export function Stagger({
  children,
  staggerDelay = 0.1,
  once = true,
  className,
}: StaggerProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Parallax Container
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "vertical" | "horizontal";
  className?: string;
}

export function Parallax({
  children,
  speed = 0.5,
  direction = "vertical",
  className,
}: ParallaxProps) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  const x = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        style={direction === "vertical" ? { y } : { x }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Parallax Background
interface ParallaxBackgroundProps {
  src: string;
  alt?: string;
  speed?: number;
  overlay?: boolean;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

export function ParallaxBackground({
  src,
  alt = "Background",
  speed = 0.3,
  overlay = true,
  overlayOpacity = 0.5,
  children,
  className,
}: ParallaxBackgroundProps) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ y }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </motion.div>
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Scroll Progress Bar
interface ScrollProgressProps {
  color?: string;
  height?: number;
  position?: "top" | "bottom";
  className?: string;
}

export function ScrollProgress({
  color = "hsl(var(--primary))",
  height = 4,
  position = "top",
  className,
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={cn(
        "fixed left-0 right-0 z-50 origin-left",
        position === "top" ? "top-0" : "bottom-0",
        className
      )}
      style={{
        scaleX,
        height,
        backgroundColor: color,
      }}
    />
  );
}

// Scroll Percentage Indicator
interface ScrollPercentageProps {
  className?: string;
}

export function ScrollPercentage({ className }: ScrollPercentageProps) {
  const { scrollYProgress } = useScroll();
  const [percentage, setPercentage] = React.useState(0);

  React.useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setPercentage(Math.round(v * 100));
    });
  }, [scrollYProgress]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 h-12 w-12 rounded-full bg-background border flex items-center justify-center text-sm font-medium shadow-lg",
        className
      )}
    >
      {percentage}%
    </div>
  );
}

// Scale on Scroll
interface ScaleOnScrollProps {
  children: React.ReactNode;
  scaleRange?: [number, number];
  opacityRange?: [number, number];
  className?: string;
}

export function ScaleOnScroll({
  children,
  scaleRange = [0.8, 1],
  opacityRange = [0.6, 1],
  className,
}: ScaleOnScrollProps) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], scaleRange);
  const opacity = useTransform(scrollYProgress, [0, 0.5], opacityRange);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Rotate on Scroll
interface RotateOnScrollProps {
  children: React.ReactNode;
  rotateRange?: [number, number];
  className?: string;
}

export function RotateOnScroll({
  children,
  rotateRange = [0, 360],
  className,
}: RotateOnScrollProps) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);

  return (
    <motion.div
      ref={ref}
      style={{ rotate }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Horizontal Scroll Section
interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({
  children,
  className,
}: HorizontalScrollProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div
          style={{ x }}
          className={cn("flex gap-8", className)}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

// Text Reveal on Scroll
interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className }: TextRevealProps) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} range={[start, end]} progress={scrollYProgress}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  range,
  progress,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span className="relative mr-2 mt-2">
      <span className="absolute opacity-20">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

// Sticky Reveal
interface StickyRevealProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
}

export function StickyReveal({
  children,
  height = "300vh",
  className,
}: StickyRevealProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} style={{ height }} className="relative">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale, opacity }}
          className={className}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

// Marquee (Infinite Scroll Text)
interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  speed = 50,
  direction = "left",
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const baseVelocity = direction === "left" ? -speed : speed;
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const [isPaused, setIsPaused] = React.useState(false);

  const x = useTransform(baseX, (v) => `${v}%`);

  const directionFactor = React.useRef<number>(1);

  useAnimationFrame((t, delta) => {
    if (isPaused) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Reverse direction when scroll velocity is high
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);

    // Reset when out of bounds
    if (baseX.get() < -100) {
      baseX.set(0);
    } else if (baseX.get() > 0) {
      baseX.set(-100);
    }
  });

  return (
    <div
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div className="flex gap-8" style={{ x }}>
        <div className="flex gap-8 flex-shrink-0">{children}</div>
        <div className="flex gap-8 flex-shrink-0" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// Counter Animation on Scroll
interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function Counter({
  from = 0,
  to,
  duration = 2,
  suffix = "",
  prefix = "",
  className,
}: CounterProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.round(from + (to - from) * easeOutQuart);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Blur In on Scroll
interface BlurInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}

export function BlurIn({
  children,
  delay = 0,
  duration = 0.5,
  once = true,
  className,
}: BlurInProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={
        isInView
          ? { opacity: 1, filter: "blur(0px)" }
          : { opacity: 0, filter: "blur(10px)" }
      }
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### Key Implementation Notes

1. **Intersection Observer**: Uses `useInView` for efficient scroll detection
2. **Smooth Values**: Spring physics for natural motion
3. **Performance**: GPU-accelerated transforms
4. **Reduced Motion**: Should respect `prefers-reduced-motion`

## Variants

### Fade In Elements

```tsx
<FadeIn direction="up" delay={0.2}>
  <h1>Welcome</h1>
</FadeIn>

<FadeIn direction="left" duration={0.8}>
  <p>This fades in from the left</p>
</FadeIn>
```

### Staggered List

```tsx
<Stagger staggerDelay={0.15}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Stagger>
```

### Parallax Background

```tsx
<ParallaxBackground
  src="/images/hero-bg.jpg"
  speed={0.3}
  overlay
  overlayOpacity={0.6}
  className="h-[600px]"
>
  <div className="h-full flex items-center justify-center">
    <h1 className="text-white text-5xl">Parallax Hero</h1>
  </div>
</ParallaxBackground>
```

### Scroll Progress

```tsx
// At the top of the page
<ScrollProgress color="hsl(var(--primary))" height={3} />

// Or percentage indicator
<ScrollPercentage />
```

### Text Reveal

```tsx
<TextReveal
  text="This text reveals word by word as you scroll down the page"
  className="text-4xl font-bold"
/>
```

### Horizontal Scroll Section

```tsx
<HorizontalScroll>
  <div className="w-[400px] h-[300px] bg-card flex-shrink-0">Panel 1</div>
  <div className="w-[400px] h-[300px] bg-card flex-shrink-0">Panel 2</div>
  <div className="w-[400px] h-[300px] bg-card flex-shrink-0">Panel 3</div>
  <div className="w-[400px] h-[300px] bg-card flex-shrink-0">Panel 4</div>
</HorizontalScroll>
```

### Animated Counter

```tsx
<div className="grid grid-cols-3 gap-8">
  <div className="text-center">
    <Counter to={1500} suffix="+" className="text-4xl font-bold" />
    <p>Customers</p>
  </div>
  <div className="text-center">
    <Counter to={99} suffix="%" className="text-4xl font-bold" />
    <p>Satisfaction</p>
  </div>
  <div className="text-center">
    <Counter to={50} prefix="$" suffix="M" className="text-4xl font-bold" />
    <p>Revenue</p>
  </div>
</div>
```

### Marquee

```tsx
<Marquee speed={30} pauseOnHover>
  <span className="text-2xl font-bold">SALE</span>
  <span className="text-2xl">-</span>
  <span className="text-2xl font-bold">50% OFF</span>
  <span className="text-2xl">-</span>
  <span className="text-2xl font-bold">LIMITED TIME</span>
  <span className="text-2xl">-</span>
</Marquee>
```

## Performance

### Optimization Tips

- Use `will-change-transform` sparingly
- Prefer transforms over layout properties
- Use `once: true` when animation shouldn't repeat
- Debounce scroll handlers
- Use Intersection Observer thresholds

### Reduced Motion

Add reduced motion support:

```tsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

<FadeIn direction={prefersReducedMotion ? "none" : "up"}>
  {content}
</FadeIn>
```

## Accessibility

### Required Considerations

- Respect `prefers-reduced-motion`
- Don't hide content behind animations
- Ensure content is accessible without JS
- Avoid seizure-inducing animations

### Screen Reader

- Content should be readable without animation
- Don't rely solely on animation for meaning
- Animated counters should have final value

### Motion Sensitivity

```tsx
// Hook for reduced motion preference
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}
```

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Hidden | Element is below viewport, not yet triggered | Invisible or at initial position (e.g., opacity: 0, translated) |
| Animating | Element is entering viewport and animation is playing | Transitioning to final position with easing |
| Visible | Animation complete, element fully in view | Fully visible at final position |
| Paused | Animation paused due to user preference or hover | Animation frozen at current frame |
| Reduced Motion | User prefers reduced motion | Minimal or no animation, instant state changes |
| Looping | For continuous animations like marquee | Continuously cycling through animation |

## Anti-patterns

### 1. Not Respecting Reduced Motion Preferences

```tsx
// Bad: Ignoring user preferences
function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

// Good: Respecting prefers-reduced-motion
function FadeIn({ children, direction = "up" }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

### 2. Using Layout-Triggering Properties Instead of Transforms

```tsx
// Bad: Animating layout properties causes repaints
<motion.div
  animate={{
    left: isVisible ? 0 : -100,
    top: isVisible ? 0 : -50,
    width: isVisible ? "100%" : "0%",
  }}
>

// Good: Using transforms for GPU acceleration
<motion.div
  animate={{
    x: isVisible ? 0 : -100,
    y: isVisible ? 0 : -50,
    scale: isVisible ? 1 : 0,
  }}
  className="will-change-transform"
>
```

### 3. Not Using once Option for Scroll Animations

```tsx
// Bad: Animation replays every time element enters/exits viewport
function RevealSection({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref); // No once option

  return (
    <motion.div
      ref={ref}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}

// Good: Animation plays once and stays visible
function RevealSection({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
    >
      {children}
    </motion.div>
  );
}
```

### 4. Excessive Stagger Delays Causing Poor UX

```tsx
// Bad: Too many items with long delays
<Stagger staggerDelay={0.5}>
  {items.map((item) => ( // 20 items = 10 seconds total!
    <Card key={item.id}>{item.title}</Card>
  ))}
</Stagger>

// Good: Limit visible items and use reasonable delays
<Stagger staggerDelay={0.1} maxItems={6}>
  {items.slice(0, 6).map((item) => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</Stagger>
```

## Related Skills

### Composes Into
- [templates/landing-page](../templates/landing-page.md)
- [templates/marketing-layout](../templates/marketing-layout.md)
- [organisms/hero](./hero.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Fade, stagger, parallax animations
- Scroll progress indicators
- Text reveal and counters
- Marquee animation
- Horizontal scroll section
