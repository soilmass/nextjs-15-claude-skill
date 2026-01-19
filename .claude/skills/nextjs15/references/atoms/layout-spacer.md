---
id: a-layout-spacer
name: Layout Spacer
version: 2.0.0
layer: L1
category: layout
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Flexible spacer component for creating gaps in flex and grid layouts
tags: [layout, spacer, gap, flex, spacing, utility]
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

# Layout Spacer

## Overview

A flexible spacer component that creates space in flex containers. Can be fixed-size or expand to fill available space, useful for pushing elements apart or creating consistent spacing.

## Implementation

```tsx
// components/ui/spacer.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed size using spacing scale */
  size?: SpacerSize;
  /** Custom size in pixels or CSS units */
  customSize?: string | number;
  /** Direction (for fixed-size spacers) */
  direction?: 'horizontal' | 'vertical';
  /** Expand to fill available space */
  flex?: boolean;
  /** Flex grow value (when flex is true) */
  grow?: number;
  /** Hide at certain breakpoints */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show only at certain breakpoints */
  showBelow?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap: Record<SpacerSize, string> = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

const breakpointClasses = {
  hideBelow: {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block',
  },
  showBelow: {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden',
    xl: 'block xl:hidden',
  },
};

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  (
    {
      size,
      customSize,
      direction = 'horizontal',
      flex = false,
      grow = 1,
      hideBelow,
      showBelow,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Determine the spacing value
    const spacing = customSize ?? (size ? sizeMap[size] : undefined);

    // Build style object
    const spacerStyle: React.CSSProperties = {
      ...style,
    };

    if (flex) {
      spacerStyle.flex = `${grow} 1 0%`;
    } else if (spacing) {
      if (direction === 'horizontal') {
        spacerStyle.width = typeof spacing === 'number' ? `${spacing}px` : spacing;
        spacerStyle.flexShrink = 0;
      } else {
        spacerStyle.height = typeof spacing === 'number' ? `${spacing}px` : spacing;
        spacerStyle.flexShrink = 0;
      }
    }

    // Build class names
    const classNames = cn(
      hideBelow && breakpointClasses.hideBelow[hideBelow],
      showBelow && breakpointClasses.showBelow[showBelow],
      className
    );

    return (
      <div
        ref={ref}
        className={classNames}
        style={spacerStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }
);
Spacer.displayName = 'Spacer';

// Convenience components
const FlexSpacer = React.forwardRef<HTMLDivElement, Omit<SpacerProps, 'flex'>>(
  (props, ref) => <Spacer ref={ref} flex {...props} />
);
FlexSpacer.displayName = 'FlexSpacer';

const VerticalSpacer = React.forwardRef<HTMLDivElement, Omit<SpacerProps, 'direction'>>(
  (props, ref) => <Spacer ref={ref} direction="vertical" {...props} />
);
VerticalSpacer.displayName = 'VerticalSpacer';

const HorizontalSpacer = React.forwardRef<HTMLDivElement, Omit<SpacerProps, 'direction'>>(
  (props, ref) => <Spacer ref={ref} direction="horizontal" {...props} />
);
HorizontalSpacer.displayName = 'HorizontalSpacer';

export { Spacer, FlexSpacer, VerticalSpacer, HorizontalSpacer };
```

## Variants

### Flex Spacer (Push Apart)

```tsx
// Push items to opposite ends
function Header() {
  return (
    <header className="flex items-center px-4 py-2">
      <Logo />
      <FlexSpacer />
      <Navigation />
    </header>
  );
}
```

### Fixed Size Spacer

```tsx
// Add consistent spacing between elements
function ButtonGroup() {
  return (
    <div className="flex">
      <Button>Cancel</Button>
      <Spacer size="md" />
      <Button variant="primary">Save</Button>
    </div>
  );
}
```

### Vertical Spacer

```tsx
// Add vertical space between sections
function PageContent() {
  return (
    <main>
      <HeroSection />
      <VerticalSpacer size="2xl" />
      <FeaturesSection />
      <VerticalSpacer size="2xl" />
      <PricingSection />
    </main>
  );
}
```

### Responsive Spacer

```tsx
// Hide spacer on mobile
function ResponsiveLayout() {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <Spacer size="lg" direction="horizontal" hideBelow="md" />
      <VerticalSpacer size="lg" showBelow="md" />
      <MainContent />
    </div>
  );
}
```

### Custom Size

```tsx
// Use exact pixel value
<Spacer customSize={48} />

// Use CSS units
<Spacer customSize="2.5rem" />

// Use CSS calc
<Spacer customSize="calc(100% - 200px)" />
```

### Multiple Spacers for Layout

```tsx
function ComplexHeader() {
  return (
    <header className="flex items-center">
      <Logo />
      <Spacer size="xl" />
      <Navigation />
      <FlexSpacer />
      <SearchButton />
      <Spacer size="sm" />
      <NotificationButton />
      <Spacer size="sm" />
      <UserMenu />
    </header>
  );
}
```

### In Grid Layout

```tsx
// Spacer as a placeholder in grid
function DashboardGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatsCard />
      <StatsCard />
      <StatsCard />
      <ChartCard className="col-span-2" />
      <Spacer className="hidden lg:block" /> {/* Placeholder */}
      <TableCard className="col-span-3" />
    </div>
  );
}
```

## Usage Examples

```tsx
import { Spacer, FlexSpacer, VerticalSpacer } from '@/components/ui/spacer';

// Flex spacer to push elements apart
<div className="flex">
  <Button>Back</Button>
  <FlexSpacer />
  <Button>Next</Button>
</div>

// Fixed horizontal spacing
<div className="flex items-center">
  <Icon />
  <Spacer size="sm" />
  <span>Label</span>
</div>

// Fixed vertical spacing
<div className="flex flex-col">
  <Title />
  <VerticalSpacer size="md" />
  <Description />
</div>

// Responsive spacing
<Spacer
  size="lg"
  direction="horizontal"
  hideBelow="md"
/>
```

## Comparison with CSS Gap

```tsx
// When to use Spacer vs gap:

// Use gap when all items need equal spacing
<div className="flex gap-4">
  <Item /><Item /><Item />
</div>

// Use Spacer when you need variable spacing or push-apart
<div className="flex">
  <Logo />
  <Spacer size="xl" />
  <Nav />
  <FlexSpacer /> {/* Push remaining items right */}
  <User />
</div>
```

## Related Skills

- [layout-stack](./layout-stack.md) - Stack layout component
- [layout-divider](./layout-divider.md) - Visual divider
- [spacing](../primitives/spacing.md) - Spacing tokens

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Fixed and flex variants
- Responsive visibility
- Direction support
