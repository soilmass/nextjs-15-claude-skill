---
id: a-layout-stack
name: Layout Stack
version: 2.0.0
layer: L1
category: layout
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Vertical and horizontal stack layout component with consistent spacing
tags: [layout, stack, flex, spacing, vstack, hstack, gap]
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

# Layout Stack

## Overview

A layout primitive for stacking elements vertically or horizontally with consistent spacing. Simplifies common flex layouts with semantic API and responsive gap support.

## Implementation

```tsx
// components/ui/stack.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const stackVariants = cva('flex', {
  variants: {
    direction: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
      '3xl': 'gap-16',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
      reverse: 'flex-wrap-reverse',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    align: 'stretch',
    justify: 'start',
    gap: 'md',
    wrap: false,
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  /** Element to render as */
  as?: React.ElementType;
  /** Reverse order of children */
  reverse?: boolean;
  /** Make children inline */
  inline?: boolean;
  /** Divider between items */
  divider?: React.ReactNode;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction,
      align,
      justify,
      gap,
      wrap,
      reverse = false,
      inline = false,
      divider,
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Handle dividers between children
    const childrenWithDividers = React.useMemo(() => {
      if (!divider) return children;

      const childArray = React.Children.toArray(children).filter(Boolean);
      
      return childArray.reduce<React.ReactNode[]>((acc, child, index) => {
        if (index === 0) {
          return [child];
        }
        return [...acc, React.cloneElement(divider as React.ReactElement, { key: `divider-${index}` }), child];
      }, []);
    }, [children, divider]);

    return (
      <Component
        ref={ref}
        className={cn(
          stackVariants({ direction, align, justify, gap, wrap }),
          reverse && (direction === 'vertical' ? 'flex-col-reverse' : 'flex-row-reverse'),
          inline && 'inline-flex',
          className
        )}
        {...props}
      >
        {childrenWithDividers}
      </Component>
    );
  }
);
Stack.displayName = 'Stack';

// Convenience components
const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="vertical" {...props} />
);
VStack.displayName = 'VStack';

const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="horizontal" align="center" {...props} />
);
HStack.displayName = 'HStack';

// Center component (both axes)
const Center = React.forwardRef<HTMLDivElement, Omit<StackProps, 'align' | 'justify'>>(
  ({ className, ...props }, ref) => (
    <Stack
      ref={ref}
      align="center"
      justify="center"
      className={className}
      {...props}
    />
  )
);
Center.displayName = 'Center';

export { Stack, VStack, HStack, Center, stackVariants };
```

## Variants

### Vertical Stack

```tsx
import { VStack } from '@/components/ui/stack';

function FormFields() {
  return (
    <VStack gap="md">
      <Input label="Name" />
      <Input label="Email" />
      <Input label="Message" />
      <Button>Submit</Button>
    </VStack>
  );
}
```

### Horizontal Stack

```tsx
import { HStack } from '@/components/ui/stack';

function ButtonGroup() {
  return (
    <HStack gap="sm">
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </HStack>
  );
}
```

### With Alignment

```tsx
// Horizontal, items centered vertically
<HStack align="center" gap="md">
  <Avatar />
  <VStack gap="xs">
    <Text weight="bold">John Doe</Text>
    <Text size="sm" color="muted">Developer</Text>
  </VStack>
</HStack>

// Vertical, items centered horizontally
<VStack align="center" gap="lg">
  <Logo />
  <Heading>Welcome</Heading>
  <Text>Get started with your account</Text>
</VStack>
```

### With Justification

```tsx
// Space between
<HStack justify="between" className="w-full">
  <Logo />
  <Navigation />
</HStack>

// Center content
<VStack justify="center" className="min-h-screen">
  <LoginForm />
</VStack>

// Space evenly
<HStack justify="evenly" className="w-full">
  <Stat />
  <Stat />
  <Stat />
</HStack>
```

### With Dividers

```tsx
import { Divider } from '@/components/ui/divider';

// Vertical stack with horizontal dividers
<VStack gap="md" divider={<Divider />}>
  <MenuItem>Profile</MenuItem>
  <MenuItem>Settings</MenuItem>
  <MenuItem>Logout</MenuItem>
</VStack>

// Horizontal stack with vertical dividers
<HStack gap="md" divider={<Divider orientation="vertical" className="h-4" />}>
  <Link>Home</Link>
  <Link>About</Link>
  <Link>Contact</Link>
</HStack>
```

### Wrapping

```tsx
// Tags that wrap to next line
<HStack gap="sm" wrap>
  {tags.map(tag => (
    <Badge key={tag}>{tag}</Badge>
  ))}
</HStack>
```

### Responsive Stack

```tsx
// Stack vertically on mobile, horizontally on desktop
<Stack
  direction={{ default: 'vertical', md: 'horizontal' }}
  gap="lg"
>
  <Sidebar />
  <Content />
</Stack>

// Or use CSS
<Stack
  className="flex-col md:flex-row"
  gap="lg"
>
  <Sidebar />
  <Content />
</Stack>
```

### Nested Stacks

```tsx
function Card() {
  return (
    <VStack gap="md" className="p-4 border rounded-lg">
      <HStack justify="between" className="w-full">
        <HStack gap="sm">
          <Avatar />
          <VStack gap="xs">
            <Text weight="bold">Jane Smith</Text>
            <Text size="sm" color="muted">2 hours ago</Text>
          </VStack>
        </HStack>
        <IconButton icon={MoreHorizontal} />
      </HStack>
      
      <Text>This is the card content...</Text>
      
      <HStack gap="sm">
        <Button variant="ghost" size="sm">Like</Button>
        <Button variant="ghost" size="sm">Comment</Button>
        <Button variant="ghost" size="sm">Share</Button>
      </HStack>
    </VStack>
  );
}
```

### Center Component

```tsx
import { Center } from '@/components/ui/stack';

// Center content in viewport
<Center className="min-h-screen">
  <Spinner />
</Center>

// Center content in container
<Center className="h-64 border rounded-lg">
  <EmptyState />
</Center>
```

### As Different Elements

```tsx
// As a list
<VStack as="ul" gap="sm">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</VStack>

// As a nav
<HStack as="nav" gap="lg">
  <Link>Home</Link>
  <Link>About</Link>
  <Link>Contact</Link>
</HStack>

// As a form
<VStack as="form" gap="md" onSubmit={handleSubmit}>
  <Input name="email" />
  <Input name="password" type="password" />
  <Button type="submit">Login</Button>
</VStack>
```

## Usage

```tsx
import { Stack, VStack, HStack, Center } from '@/components/ui/stack';

// Basic vertical stack
<VStack gap="md">
  <Child />
  <Child />
</VStack>

// Horizontal with centering
<HStack gap="sm" align="center">
  <Icon />
  <Text>Label</Text>
</HStack>

// Complex layout
<VStack gap="lg" className="p-4">
  <HStack justify="between">
    <Title />
    <Actions />
  </HStack>
  <Content />
</VStack>
```

## Comparison with Flexbox

```tsx
// Without Stack
<div className="flex flex-col gap-4 items-center justify-center">
  {children}
</div>

// With Stack
<VStack gap="md" align="center" justify="center">
  {children}
</VStack>
```

## Related Skills

- [layout-spacer](./layout-spacer.md) - Spacer component
- [layout-divider](./layout-divider.md) - Visual divider
- [grid-systems](../primitives/grid-systems.md) - Grid layouts

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- VStack, HStack, Center variants
- Divider support
- Polymorphic `as` prop
