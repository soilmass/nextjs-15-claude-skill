---
id: a-layout-center
name: Layout Center
version: 2.0.0
layer: L1
category: layout
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Centering utility component for horizontal, vertical, or both axis centering
tags: [layout, center, centering, flex, grid, utility, alignment]
performance:
  impact: low
  lcp: neutral
  cls: neutral
dependencies:
  - react
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Layout Center

## Overview

A layout utility component for centering content horizontally, vertically, or both. Provides semantic API for common centering patterns without remembering flexbox or grid centering properties.

## Implementation

```tsx
// components/ui/center.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const centerVariants = cva('', {
  variants: {
    axis: {
      both: 'flex items-center justify-center',
      horizontal: 'flex justify-center',
      vertical: 'flex items-center',
    },
    method: {
      flex: '', // Default, classes are in axis variant
      grid: '',
      absolute: 'absolute',
    },
    inline: {
      true: 'inline-flex',
      false: '',
    },
  },
  compoundVariants: [
    // Grid centering
    {
      axis: 'both',
      method: 'grid',
      className: 'grid place-items-center',
    },
    {
      axis: 'horizontal',
      method: 'grid',
      className: 'grid justify-items-center',
    },
    {
      axis: 'vertical',
      method: 'grid',
      className: 'grid items-center',
    },
    // Absolute centering
    {
      axis: 'both',
      method: 'absolute',
      className: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    },
    {
      axis: 'horizontal',
      method: 'absolute',
      className: 'absolute left-1/2 -translate-x-1/2',
    },
    {
      axis: 'vertical',
      method: 'absolute',
      className: 'absolute top-1/2 -translate-y-1/2',
    },
  ],
  defaultVariants: {
    axis: 'both',
    method: 'flex',
    inline: false,
  },
});

export interface CenterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof centerVariants> {
  /** Element to render as */
  as?: React.ElementType;
  /** Full width */
  fullWidth?: boolean;
  /** Full height */
  fullHeight?: boolean;
  /** Full viewport height */
  fullScreen?: boolean;
  /** Gap between children (when multiple) */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const Center = React.forwardRef<HTMLDivElement, CenterProps>(
  (
    {
      axis,
      method,
      inline,
      fullWidth = false,
      fullHeight = false,
      fullScreen = false,
      gap,
      as: Component = 'div',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          centerVariants({ axis, method, inline }),
          fullWidth && 'w-full',
          fullHeight && 'h-full',
          fullScreen && 'min-h-screen',
          gap && gapClasses[gap],
          className
        )}
        {...props}
      />
    );
  }
);
Center.displayName = 'Center';

// Convenience components
const CenterX = React.forwardRef<HTMLDivElement, Omit<CenterProps, 'axis'>>(
  (props, ref) => <Center ref={ref} axis="horizontal" {...props} />
);
CenterX.displayName = 'CenterX';

const CenterY = React.forwardRef<HTMLDivElement, Omit<CenterProps, 'axis'>>(
  (props, ref) => <Center ref={ref} axis="vertical" {...props} />
);
CenterY.displayName = 'CenterY';

const AbsoluteCenter = React.forwardRef<HTMLDivElement, Omit<CenterProps, 'method'>>(
  (props, ref) => <Center ref={ref} method="absolute" {...props} />
);
AbsoluteCenter.displayName = 'AbsoluteCenter';

export { Center, CenterX, CenterY, AbsoluteCenter, centerVariants };
```

## Variants

### Center Both Axes (Default)

```tsx
import { Center } from '@/components/ui/center';

// Center content in a container
<Center className="h-64 border rounded-lg">
  <p>Perfectly centered content</p>
</Center>

// Full screen centering
<Center fullScreen>
  <LoginForm />
</Center>
```

### Horizontal Centering Only

```tsx
import { CenterX } from '@/components/ui/center';

// Center a heading
<CenterX className="py-8">
  <h1 className="text-3xl font-bold">Welcome</h1>
</CenterX>

// Center a button
<CenterX>
  <Button>Click Me</Button>
</CenterX>
```

### Vertical Centering Only

```tsx
import { CenterY } from '@/components/ui/center';

// Vertically center in sidebar
<CenterY className="h-full">
  <Navigation />
</CenterY>

// Vertically center icon with text
<CenterY className="h-10">
  <span className="flex items-center gap-2">
    <Icon />
    <span>Label</span>
  </span>
</CenterY>
```

### Absolute Centering

```tsx
import { AbsoluteCenter } from '@/components/ui/center';

// Center overlay content
<div className="relative h-64">
  <Image src="..." fill />
  <AbsoluteCenter>
    <PlayButton />
  </AbsoluteCenter>
</div>

// Loading overlay
<div className="relative min-h-[200px]">
  <Content />
  {isLoading && (
    <div className="absolute inset-0 bg-background/80">
      <AbsoluteCenter>
        <Spinner />
      </AbsoluteCenter>
    </div>
  )}
</div>
```

### With Grid Method

```tsx
// Using CSS Grid for centering
<Center method="grid" className="h-64">
  <Card />
</Center>
```

### With Gap

```tsx
// Center multiple items with gap
<Center gap="md" fullScreen>
  <Logo />
  <Heading>Welcome</Heading>
  <Button>Get Started</Button>
</Center>
```

### Inline Centering

```tsx
// Inline flex centering
<p>
  Click the{' '}
  <Center inline axis="both" className="mx-1">
    <Badge>button</Badge>
  </Center>
  {' '}to continue.
</p>
```

### Common Use Cases

```tsx
// Empty state
function EmptyState() {
  return (
    <Center fullHeight className="text-center">
      <div className="space-y-4">
        <InboxIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No messages</h3>
        <p className="text-muted-foreground">
          You don't have any messages yet.
        </p>
        <Button>Compose</Button>
      </div>
    </Center>
  );
}

// Loading state
function LoadingState() {
  return (
    <Center fullScreen>
      <div className="text-center">
        <Spinner className="mx-auto h-8 w-8" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </Center>
  );
}

// Error page
function ErrorPage({ error }: { error: Error }) {
  return (
    <Center fullScreen className="text-center">
      <div className="space-y-4">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    </Center>
  );
}

// Hero section
function Hero() {
  return (
    <Center fullScreen className="bg-gradient-to-b from-background to-muted">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-5xl font-bold">
          Build something amazing
        </h1>
        <p className="text-xl text-muted-foreground">
          The modern platform for teams who want to ship faster.
        </p>
        <Center inline gap="sm">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">Learn More</Button>
        </Center>
      </div>
    </Center>
  );
}

// Modal content
function ModalContent() {
  return (
    <div className="fixed inset-0 bg-black/50">
      <Center fullHeight>
        <Card className="w-full max-w-md">
          <CardContent>
            Modal content here
          </CardContent>
        </Card>
      </Center>
    </div>
  );
}
```

### Responsive Centering

```tsx
// Center on mobile, left-align on desktop
<Center
  axis="horizontal"
  className="md:justify-start"
>
  <Content />
</Center>
```

## Usage

```tsx
import { Center, CenterX, CenterY, AbsoluteCenter } from '@/components/ui/center';

// Basic centering
<Center className="h-64">
  <Child />
</Center>

// Full screen
<Center fullScreen>
  <Child />
</Center>

// Horizontal only
<CenterX>
  <Child />
</CenterX>

// Absolute centering
<div className="relative">
  <AbsoluteCenter>
    <Child />
  </AbsoluteCenter>
</div>
```

## Related Skills

- [layout-stack](./layout-stack.md) - Stack layout
- [layout-spacer](./layout-spacer.md) - Spacer component
- [empty-state](../molecules/empty-state.md) - Empty state pattern

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Flex, grid, and absolute methods
- CenterX, CenterY, AbsoluteCenter variants
