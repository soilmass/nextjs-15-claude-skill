---
id: a-feedback-spinner
name: Spinner
version: 2.0.0
layer: L1
category: feedback
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Animated loading spinner with size and color variants
tags: [spinner, loading, indicator, animation, circular]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Spinner

## Overview

The Spinner atom provides an animated loading indicator for asynchronous operations. Supports multiple sizes and inherits color from parent context. Uses CSS animations for performant, GPU-accelerated rendering.

## When to Use

Use this skill when:
- Indicating loading state during data fetching
- Showing processing state on buttons or forms
- Displaying inline loading within content areas
- Building loading overlays or screens

## Implementation

```typescript
// components/ui/spinner.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-current border-t-transparent",
  {
    variants: {
      size: {
        xs: "h-3 w-3 border",
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-[3px]",
        xl: "h-12 w-12 border-4",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        white: "text-white",
        inherit: "text-current",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Accessible label for screen readers */
  label?: string;
}

export function Spinner({
  className,
  size,
  variant,
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
```

```typescript
// components/ui/loading-overlay.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  loading?: boolean;
  /** Text to display below spinner */
  text?: string;
  /** Overlay background style */
  backdrop?: "solid" | "blur" | "transparent";
  /** Full screen or contained */
  fullScreen?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({
  loading = true,
  text,
  backdrop = "blur",
  fullScreen = false,
  className,
  children,
}: LoadingOverlayProps) {
  if (!loading) return <>{children}</>;

  const backdropStyles = {
    solid: "bg-background",
    blur: "bg-background/80 backdrop-blur-sm",
    transparent: "bg-transparent",
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-3 z-50",
          backdropStyles[backdrop],
          fullScreen && "fixed"
        )}
        role="alert"
        aria-busy="true"
      >
        <Spinner size="lg" />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
}
```

```typescript
// components/ui/button-spinner.tsx
import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonSpinnerProps {
  className?: string;
}

export function ButtonSpinner({ className }: ButtonSpinnerProps) {
  return (
    <Loader2
      className={cn("h-4 w-4 animate-spin", className)}
      aria-hidden="true"
    />
  );
}
```

### Key Implementation Notes

1. **Color Inheritance**: Use `text-current` and `border-current` to inherit color from parent context
2. **Performance**: CSS `transform: rotate()` uses GPU acceleration for smooth 60fps animations

## Variants

### Size Variants

```tsx
<Spinner size="xs" /> {/* 12px */}
<Spinner size="sm" /> {/* 16px */}
<Spinner size="md" /> {/* 24px - default */}
<Spinner size="lg" /> {/* 32px */}
<Spinner size="xl" /> {/* 48px */}
```

### Color Variants

```tsx
<Spinner variant="default" />  {/* Primary color */}
<Spinner variant="muted" />    {/* Muted foreground */}
<Spinner variant="white" />    {/* White (for dark backgrounds) */}
<Spinner variant="inherit" />  {/* Inherits from parent */}
```

### In Button

```tsx
<Button disabled>
  <ButtonSpinner className="mr-2" />
  Loading...
</Button>
```

### With Overlay

```tsx
<LoadingOverlay loading backdrop="blur" text="Loading data...">
  <div className="p-8">Content that is loading</div>
</LoadingOverlay>
```

## States

| State | Animation | Opacity | Duration | Easing |
|-------|-----------|---------|----------|--------|
| Loading | rotate 360deg | 1 | 750ms | linear |
| Fading In | rotate + opacity | 0→1 | 150ms | ease-out |
| Fading Out | rotate + opacity | 1→0 | 150ms | ease-in |
| Hidden | none | 0 | - | - |

## Accessibility

### Required ARIA Attributes

- `role="status"`: Indicates a live region for loading state
- `aria-label`: Describes what is loading (e.g., "Loading search results")

### Keyboard Navigation

| Key | Action |
|-----|--------|
| N/A | Spinner is non-interactive |

### Screen Reader Announcements

- Announces label text when spinner appears (with live region)
- "Loading" (or custom label) read immediately
- Consider `aria-live="polite"` for non-urgent loading states

## Dependencies

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install class-variance-authority lucide-react
```

## Examples

### Basic Usage

```tsx
import { Spinner } from "@/components/ui/spinner";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner size="lg" label="Loading content" />
    </div>
  );
}
```

### Loading Button

```tsx
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";

export function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <Button disabled={loading}>
      {loading && <ButtonSpinner className="mr-2" />}
      {loading ? "Submitting..." : "Submit"}
    </Button>
  );
}
```

### Inline Loading

```tsx
import { Spinner } from "@/components/ui/spinner";

export function DataFetching({ loading, data }: { loading: boolean; data?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span>Status:</span>
      {loading ? (
        <Spinner size="sm" variant="muted" label="Checking status" />
      ) : (
        <span>{data}</span>
      )}
    </div>
  );
}
```

### Full Page Loading

```tsx
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export function PageWithLoading({ loading }: { loading: boolean }) {
  return (
    <LoadingOverlay
      loading={loading}
      fullScreen
      backdrop="blur"
      text="Loading your dashboard..."
    >
      <main className="container py-8">
        {/* Page content */}
      </main>
    </LoadingOverlay>
  );
}
```

### Colored Spinner (Dark Background)

```tsx
<div className="bg-primary p-4 rounded-lg">
  <Spinner variant="white" size="lg" label="Processing" />
</div>
```

## Anti-patterns

### Missing Accessibility Label

```tsx
// Bad - no screen reader context
<div className="animate-spin h-6 w-6 border-2 rounded-full" />

// Good - proper accessibility
<Spinner label="Loading search results" />
```

### Overusing Spinners

```tsx
// Bad - spinner for every small update
{items.map(item => (
  <div key={item.id}>
    {item.loading && <Spinner />}
    {item.content}
  </div>
))}

// Good - use skeleton for content loading, spinner for actions
{isSubmitting && <Spinner />}
```

### Spinner Without Loading Context

```tsx
// Bad - spinner appears without explanation
<Spinner />

// Good - provide context
<div className="flex items-center gap-2">
  <Spinner size="sm" />
  <span className="text-sm text-muted-foreground">Saving changes...</span>
</div>
```

## Related Skills

### Composes From
- [primitives/motion](../primitives/motion.md) - Animation duration and easing

### Composes Into
- [input-button](./input-button.md) - Loading state indicator
- [molecules/form-field](../molecules/form-field.md) - Validation loading
- [organisms/data-table](../organisms/data-table.md) - Row loading states

### Alternatives
- [display-skeleton](./display-skeleton.md) - When content shape is known
- [feedback-progress](./feedback-progress.md) - When progress is determinate

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation with CVA variants
- Added size and color variants
- LoadingOverlay and ButtonSpinner components
