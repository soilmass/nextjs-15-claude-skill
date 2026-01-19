---
id: pt-mobile-first
name: Mobile-First Design
version: 1.0.0
layer: L5
category: design
description: Implement mobile-first responsive design patterns for optimal mobile experience
tags: [mobile, responsive, design, touch, gestures, viewport, next15, react19]
composes:
  - ../organisms/mobile-nav.md
dependencies: []
formula: "MobileFirst = ResponsiveBreakpoints + TouchOptimization + PerformanceOptimization + PWA"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Mobile-First Design

## When to Use

- When building applications targeting mobile users
- For progressive enhancement from mobile to desktop
- When implementing responsive layouts
- For touch-optimized interfaces
- When building PWAs

## Overview

This pattern implements mobile-first design principles including responsive breakpoints, touch optimization, mobile navigation, and performance considerations for mobile devices.

## Responsive Breakpoints

```typescript
// lib/breakpoints.ts
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook for responsive design
// hooks/use-media-query.ts
"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
}

export function useIsMobile(): boolean {
  return !useBreakpoint("md");
}
```

## Mobile Navigation

```typescript
// components/navigation/mobile-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Top bar with hamburger menu */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 md:hidden">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/" className="font-bold text-lg">
            MyApp
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg",
                      "touch-manipulation active:bg-accent",
                      pathname === item.href && "bg-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 md:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around h-full">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full",
                "touch-manipulation active:bg-accent/50 rounded-lg",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
```

## Bottom Sheet Component

```typescript
// components/ui/bottom-sheet.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  snapPoints = [0.5, 0.9],
}: BottomSheetProps) {
  const [snapIndex, setSnapIndex] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 500 || offset > 100) {
      // Dragging down fast - close or snap to lower point
      if (snapIndex === 0) {
        onOpenChange(false);
      } else {
        setSnapIndex(snapIndex - 1);
      }
    } else if (velocity < -500 || offset < -100) {
      // Dragging up fast - snap to higher point
      if (snapIndex < snapPoints.length - 1) {
        setSnapIndex(snapIndex + 1);
      }
    }
  };

  const sheetHeight = typeof window !== "undefined"
    ? window.innerHeight * snapPoints[snapIndex]
    : 400;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0, height: sheetHeight }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-background rounded-t-2xl shadow-xl",
              "touch-none"
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Content */}
            <div className="overflow-auto px-4 pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

## Touch-Optimized Components

```typescript
// components/ui/touch-button.tsx
"use client";

import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Minimum touch target size: 44x44px (Apple HIG) / 48x48dp (Material)
export const TouchButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "min-h-[44px] min-w-[44px]",
          "touch-manipulation",
          "active:scale-95 transition-transform",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
TouchButton.displayName = "TouchButton";

// components/ui/touch-list-item.tsx
interface TouchListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TouchListItem({ children, onClick, className }: TouchListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "min-h-[48px] px-4 py-3",
        "flex items-center",
        "touch-manipulation",
        "active:bg-accent/50",
        "cursor-pointer select-none",
        className
      )}
    >
      {children}
    </div>
  );
}
```

## Pull to Refresh

```typescript
// components/mobile/pull-to-refresh.tsx
"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, 80], [0, 1]);

  const handleDragEnd = async () => {
    if (y.get() >= 80 && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const canPull = () => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollTop === 0;
  };

  return (
    <div ref={containerRef} className="h-full overflow-auto">
      <motion.div
        className="relative"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDrag={(_, info) => {
          if (canPull() && info.offset.y > 0) {
            y.set(Math.min(info.offset.y, 120));
          }
        }}
        onDragEnd={handleDragEnd}
        style={{ y: refreshing ? 60 : y }}
      >
        {/* Refresh indicator */}
        <motion.div
          className="absolute top-0 left-0 right-0 flex justify-center py-4"
          style={{
            y: useTransform(y, [0, 80], [-60, 0]),
            opacity: pullProgress,
          }}
        >
          <Loader2
            className={cn(
              "h-6 w-6 text-primary",
              refreshing && "animate-spin"
            )}
          />
        </motion.div>

        {children}
      </motion.div>
    </div>
  );
}
```

## Responsive Layout

```typescript
// components/layout/responsive-layout.tsx
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({
  children,
  sidebar,
  className,
}: ResponsiveLayoutProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      {/* Mobile: Stack layout */}
      {/* Desktop: Side-by-side layout */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        {sidebar && (
          <aside className="hidden md:block w-64 shrink-0 border-r min-h-screen sticky top-0">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Account for mobile nav */}
          <div className="pt-14 pb-16 md:pt-0 md:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

## Safe Area Handling

```css
/* globals.css */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

.safe-area-inset-top {
  padding-top: var(--safe-area-inset-top);
}

.safe-area-inset-bottom {
  padding-bottom: var(--safe-area-inset-bottom);
}

.pb-safe {
  padding-bottom: max(1rem, var(--safe-area-inset-bottom));
}

/* Prevent pull-to-refresh on mobile browsers */
.no-pull-refresh {
  overscroll-behavior-y: contain;
}

/* Better touch scrolling */
.touch-scroll {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Prevent text selection on interactive elements */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
```

## Viewport Meta

```typescript
// app/layout.tsx
export const metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};
```

## Anti-patterns

### Don't Use Small Touch Targets

```typescript
// BAD - Too small for touch
<button className="w-6 h-6">X</button>

// GOOD - Minimum 44px
<button className="w-11 h-11 flex items-center justify-center">
  <X className="h-5 w-5" />
</button>
```

### Don't Rely on Hover States

```typescript
// BAD - Hover-only interaction
<div className="hover:bg-accent">{content}</div>

// GOOD - Touch and hover support
<div className="hover:bg-accent active:bg-accent">{content}</div>
```

## Related Patterns

- [pwa](./pwa.md)
- [lazy-loading](./lazy-loading.md)
- [image-optimization](./image-optimization.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Mobile navigation
- Bottom sheet
- Pull to refresh
- Touch optimization
