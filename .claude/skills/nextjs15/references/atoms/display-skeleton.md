---
id: a-display-skeleton
name: Skeleton Loader
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Animated placeholder for loading states with customizable shapes
tags: [skeleton, loading, placeholder, shimmer, pulse]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Skeleton Loader

## Overview

The Skeleton atom provides animated loading placeholders that mimic the shape of content being loaded. Uses a subtle pulse animation to indicate loading state without overwhelming the user. Prevents cumulative layout shift by reserving space for content.

## When to Use

Use this skill when:
- Content is loading asynchronously and you want to show placeholder UI
- Preventing layout shift during data fetching
- Building loading states for cards, lists, or complex layouts
- Need to indicate content shape before it's available

## Implementation

```typescript
// components/ui/skeleton.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: "text" | "circular" | "rectangular" | "rounded";
  /** Width - number (px) or string (e.g., "100%") */
  width?: number | string;
  /** Height - number (px) or string */
  height?: number | string;
  /** Animation style */
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-muted",
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      role="status"
      aria-label="Loading"
      aria-busy="true"
      {...props}
    />
  );
}
```

```css
/* Add to globals.css for wave animation */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
```

```typescript
// components/ui/skeleton-text.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface SkeletonTextProps {
  /** Number of lines to show */
  lines?: number;
  /** Width of last line (percentage or "full") */
  lastLineWidth?: "25%" | "50%" | "75%" | "full";
  /** Gap between lines */
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = "75%",
  gap = "md",
  className,
}: SkeletonTextProps) {
  const gapStyles = {
    sm: "space-y-1",
    md: "space-y-2",
    lg: "space-y-3",
  };

  return (
    <div className={cn(gapStyles[gap], className)} role="status" aria-label="Loading text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 && lastLineWidth !== "full" ? lastLineWidth : "100%"}
        />
      ))}
    </div>
  );
}
```

```typescript
// components/ui/skeleton-card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface SkeletonCardProps {
  /** Show image placeholder */
  showImage?: boolean;
  /** Image aspect ratio */
  imageAspect?: "video" | "square" | "portrait";
  /** Number of text lines */
  lines?: number;
  /** Show avatar */
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonCard({
  showImage = true,
  imageAspect = "video",
  lines = 2,
  showAvatar = false,
  className,
}: SkeletonCardProps) {
  const aspectStyles = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  };

  return (
    <div
      className={cn("rounded-lg border bg-card p-4 space-y-4", className)}
      role="status"
      aria-label="Loading card"
    >
      {showImage && (
        <Skeleton
          variant="rounded"
          className={cn("w-full", aspectStyles[imageAspect])}
        />
      )}
      
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height={12} />
          </div>
        </div>
      )}
      
      {lines > 0 && (
        <div className="space-y-2">
          <Skeleton variant="text" width="80%" height={20} />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <Skeleton key={i} variant="text" />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Key Implementation Notes

1. **ARIA Attributes**: Always include `role="status"` and `aria-label` for screen reader accessibility
2. **Animation Performance**: Use CSS animations with `transform` and `opacity` for GPU acceleration

## Variants

### Basic Shapes

```tsx
// Text line
<Skeleton variant="text" />

// Circle (avatar)
<Skeleton variant="circular" width={48} height={48} />

// Rectangle (image)
<Skeleton variant="rectangular" width="100%" height={200} />

// Rounded rectangle
<Skeleton variant="rounded" width={200} height={100} />
```

### Animation Styles

```tsx
// Default pulse
<Skeleton animation="pulse" />

// Wave/shimmer effect
<Skeleton animation="wave" />

// No animation (static)
<Skeleton animation="none" />
```

### Composite Skeletons

```tsx
// Multi-line text
<SkeletonText lines={3} lastLineWidth="50%" />

// Card with image
<SkeletonCard showImage imageAspect="video" lines={2} />

// Card with avatar
<SkeletonCard showAvatar lines={3} />
```

## States

| State | Background | Animation | Opacity | Transition |
|-------|------------|-----------|---------|------------|
| Loading | muted | pulse/wave | 1 | - |
| Loaded | transparent | none | 0 | 200ms fade-out |
| Error | destructive/10 | none | 1 | 200ms |

## Accessibility

### Required ARIA Attributes

- `role="status"`: Indicates dynamic content that will update
- `aria-label="Loading"`: Describes the loading state
- `aria-busy="true"`: Indicates content is loading

### Keyboard Navigation

| Key | Action |
|-----|--------|
| N/A | Skeleton is non-interactive |

### Screen Reader Announcements

- "Loading" when skeleton is displayed
- Content is announced when actual content replaces skeleton
- Consider using `aria-live="polite"` on parent container for updates

## Dependencies

```json
{
  "dependencies": {}
}
```

### Installation

No additional dependencies required - uses Tailwind's built-in `animate-pulse`.

For wave animation, add the custom CSS to your globals.css.

## Examples

### Basic Usage

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingProfile() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="space-y-2">
        <Skeleton variant="text" width={200} />
        <Skeleton variant="text" width={150} />
      </div>
    </div>
  );
}
```

### Loading Card Grid

```tsx
import { SkeletonCard } from "@/components/ui/skeleton-card";

export function LoadingProductGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard
          key={i}
          showImage
          imageAspect="square"
          lines={2}
        />
      ))}
    </div>
  );
}
```

### Inline Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton";

interface UserDataProps {
  user?: { name: string; email: string };
  isLoading: boolean;
}

export function UserData({ user, isLoading }: UserDataProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton variant="text" width={120} height={24} />
        <Skeleton variant="text" width={200} />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium">{user?.name}</h3>
      <p className="text-muted-foreground">{user?.email}</p>
    </div>
  );
}
```

### Table Row Skeleton

```tsx
export function TableRowSkeleton() {
  return (
    <tr>
      <td className="p-4">
        <Skeleton variant="circular" width={32} height={32} />
      </td>
      <td className="p-4">
        <Skeleton variant="text" width="80%" />
      </td>
      <td className="p-4">
        <Skeleton variant="text" width="60%" />
      </td>
      <td className="p-4">
        <Skeleton variant="rounded" width={80} height={24} />
      </td>
    </tr>
  );
}
```

## Anti-patterns

### Missing ARIA Attributes

```tsx
// Bad - no accessibility information
<div className="bg-muted animate-pulse h-4 rounded" />

// Good - proper accessibility
<Skeleton variant="text" />
// Includes role="status", aria-label, and aria-busy
```

### Mismatched Skeleton Dimensions

```tsx
// Bad - skeleton doesn't match final content size, causing CLS
<Skeleton height={100} /> // But actual content is 200px tall

// Good - match skeleton to expected content dimensions
<Skeleton height={200} className="aspect-video" />
```

### Too Many Animations

```tsx
// Bad - multiple different animations on page
<div>
  <Skeleton animation="pulse" />
  <Skeleton animation="wave" />
  <div className="animate-bounce">...</div>
</div>

// Good - consistent animation style
<div>
  <Skeleton animation="pulse" />
  <Skeleton animation="pulse" />
  <Skeleton animation="pulse" />
</div>
```

## Related Skills

### Composes From
- [primitives/motion](../primitives/motion.md) - Animation timing and easing

### Composes Into
- [molecules/card](../molecules/card.md) - Card loading states
- [organisms/data-table](../organisms/data-table.md) - Table row placeholders
- [templates/loading](../templates/loading.md) - Full page loading states

### Alternatives
- [feedback-spinner](./feedback-spinner.md) - When shape preview not needed
- [feedback-progress](./feedback-progress.md) - When progress is determinate

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with pulse and wave animations
- Added variant shapes: text, circular, rectangular, rounded
- Composite components: SkeletonText, SkeletonCard
