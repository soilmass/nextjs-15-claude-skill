---
id: a-layout-divider
name: Divider
version: 2.0.0
layer: L1
category: layout
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Horizontal and vertical separators using Radix UI
tags: [divider, separator, hr, line, border]
dependencies:
  "@radix-ui/react-separator": "^1.1.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Divider

## Overview

The Divider atom provides visual separation between content sections. Built on Radix UI Separator for proper semantics and accessibility. Supports horizontal and vertical orientations with optional labels.

## When to Use

Use this skill when:
- Separating distinct content sections
- Creating visual breaks in navigation menus
- Dividing form field groups
- Adding structure to dense layouts

## Implementation

```typescript
// components/ui/separator.tsx
"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Orientation of the separator */
  orientation?: "horizontal" | "vertical";
  /** Whether it's purely decorative */
  decorative?: boolean;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
```

```typescript
// components/ui/divider-with-label.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "./separator";

interface DividerWithLabelProps {
  /** Label text or element */
  label?: React.ReactNode;
  /** Label position */
  labelPosition?: "left" | "center" | "right";
  /** Visual style */
  variant?: "default" | "dashed" | "dotted";
  /** Spacing around divider */
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

export function DividerWithLabel({
  label,
  labelPosition = "center",
  variant = "default",
  spacing = "md",
  className,
}: DividerWithLabelProps) {
  const spacingStyles = {
    sm: "my-2",
    md: "my-4",
    lg: "my-8",
  };

  const variantStyles = {
    default: "bg-border",
    dashed: "bg-transparent border-t border-dashed border-border",
    dotted: "bg-transparent border-t border-dotted border-border",
  };

  if (!label) {
    return (
      <Separator
        className={cn(
          spacingStyles[spacing],
          variant !== "default" && variantStyles[variant],
          className
        )}
      />
    );
  }

  const labelPositionStyles = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div
      className={cn(
        "relative flex items-center",
        spacingStyles[spacing],
        className
      )}
      role="separator"
      aria-orientation="horizontal"
    >
      <div
        className={cn(
          "flex-grow h-[1px]",
          variant === "default" && "bg-border",
          variant === "dashed" && "border-t border-dashed border-border",
          variant === "dotted" && "border-t border-dotted border-border"
        )}
      />
      <span
        className={cn(
          "px-3 text-sm text-muted-foreground flex-shrink-0",
          labelPosition === "left" && "order-first pr-3 pl-0",
          labelPosition === "right" && "order-last pl-3 pr-0"
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "flex-grow h-[1px]",
          variant === "default" && "bg-border",
          variant === "dashed" && "border-t border-dashed border-border",
          variant === "dotted" && "border-t border-dotted border-border",
          labelPosition === "left" && "flex-grow",
          labelPosition === "right" && "flex-grow"
        )}
      />
    </div>
  );
}
```

```typescript
// components/ui/vertical-divider.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "./separator";

interface VerticalDividerProps {
  /** Height of the divider */
  height?: "full" | "auto" | number;
  /** Margin around divider */
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

export function VerticalDivider({
  height = "auto",
  spacing = "md",
  className,
}: VerticalDividerProps) {
  const spacingStyles = {
    sm: "mx-2",
    md: "mx-4",
    lg: "mx-6",
  };

  const heightStyles =
    typeof height === "number"
      ? `h-[${height}px]`
      : height === "full"
        ? "h-full"
        : "self-stretch";

  return (
    <Separator
      orientation="vertical"
      className={cn(spacingStyles[spacing], heightStyles, className)}
    />
  );
}
```

### Key Implementation Notes

1. **Radix Separator**: Uses Radix for proper `role="separator"` and `aria-orientation` attributes
2. **Decorative Default**: Most separators are decorative and don't need to be announced by screen readers

## Variants

### Orientation

```tsx
// Horizontal (default)
<Separator />

// Vertical
<Separator orientation="vertical" className="h-6" />
```

### With Label

```tsx
<DividerWithLabel label="OR" />
<DividerWithLabel label="Continue with" labelPosition="left" />
<DividerWithLabel label="Section 2" labelPosition="center" />
```

### Style Variants

```tsx
<DividerWithLabel variant="default" />
<DividerWithLabel variant="dashed" label="Dashed" />
<DividerWithLabel variant="dotted" label="Dotted" />
```

### Spacing

```tsx
<DividerWithLabel spacing="sm" label="Tight" />
<DividerWithLabel spacing="md" label="Default" />
<DividerWithLabel spacing="lg" label="Loose" />
```

## States

| State | Color | Width/Height | Opacity |
|-------|-------|--------------|---------|
| Default | border | 1px | 1 |
| Subtle | border/50 | 1px | 0.5 |
| Strong | foreground | 2px | 1 |

## Accessibility

### Required ARIA Attributes

- `role="separator"`: Automatically applied by Radix
- `aria-orientation`: "horizontal" or "vertical"
- `decorative="true"`: Marks as purely visual (skipped by screen readers)

### Keyboard Navigation

| Key | Action |
|-----|--------|
| N/A | Separator is non-interactive |

### Screen Reader Announcements

- Decorative separators are skipped
- Non-decorative separators announced as "separator"
- Label text read if present

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-separator": "^1.1.0"
  }
}
```

### Installation

```bash
npm install @radix-ui/react-separator
```

## Examples

### Basic Usage

```tsx
import { Separator } from "@/components/ui/separator";

export function ProfileSection() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">Account</h4>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Notifications</h4>
        <p className="text-sm text-muted-foreground">
          Configure your notification preferences
        </p>
      </div>
    </div>
  );
}
```

### Auth Divider

```tsx
import { DividerWithLabel } from "@/components/ui/divider-with-label";

export function AuthForm() {
  return (
    <div className="space-y-4">
      <Button className="w-full">
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      
      <DividerWithLabel label="or continue with email" />
      
      <form>
        <Input type="email" placeholder="Email" />
        {/* ... */}
      </form>
    </div>
  );
}
```

### Toolbar with Vertical Dividers

```tsx
import { VerticalDivider } from "@/components/ui/vertical-divider";

export function Toolbar() {
  return (
    <div className="flex items-center h-10 px-2 border rounded-md">
      <Button variant="ghost" size="icon">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Italic className="h-4 w-4" />
      </Button>
      
      <VerticalDivider spacing="sm" />
      
      <Button variant="ghost" size="icon">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <AlignCenter className="h-4 w-4" />
      </Button>
      
      <VerticalDivider spacing="sm" />
      
      <Button variant="ghost" size="icon">
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Navigation Menu

```tsx
import { Separator } from "@/components/ui/separator";

export function NavMenu() {
  return (
    <nav className="space-y-1">
      <NavLink href="/dashboard">Dashboard</NavLink>
      <NavLink href="/projects">Projects</NavLink>
      <NavLink href="/tasks">Tasks</NavLink>
      
      <Separator className="my-2" />
      
      <NavLink href="/settings">Settings</NavLink>
      <NavLink href="/help">Help</NavLink>
    </nav>
  );
}
```

### Form Sections

```tsx
import { DividerWithLabel } from "@/components/ui/divider-with-label";

export function CheckoutForm() {
  return (
    <form className="space-y-6">
      <DividerWithLabel label="Contact Information" labelPosition="left" />
      <Input placeholder="Email" />
      <Input placeholder="Phone" />
      
      <DividerWithLabel label="Shipping Address" labelPosition="left" />
      <Input placeholder="Street" />
      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="City" />
        <Input placeholder="ZIP" />
      </div>
      
      <DividerWithLabel label="Payment" labelPosition="left" />
      <Input placeholder="Card number" />
    </form>
  );
}
```

## Anti-patterns

### Overusing Separators

```tsx
// Bad - too many separators create visual noise
<div>
  <Item />
  <Separator />
  <Item />
  <Separator />
  <Item />
  <Separator />
  <Item />
</div>

// Good - use spacing and grouping instead
<div className="space-y-4">
  <ItemGroup items={[item1, item2]} />
  <Separator />
  <ItemGroup items={[item3, item4]} />
</div>
```

### Separator Without Semantic Purpose

```tsx
// Bad - separator just for styling
<Separator className="bg-primary h-2" />

// Good - use proper styling elements
<div className="h-2 bg-primary" />
```

### Missing Height on Vertical Separators

```tsx
// Bad - vertical separator with no height
<div className="flex">
  <div>Left</div>
  <Separator orientation="vertical" /> {/* Won't be visible */}
  <div>Right</div>
</div>

// Good - specify height or use self-stretch
<div className="flex items-stretch">
  <div>Left</div>
  <Separator orientation="vertical" className="self-stretch" />
  <div>Right</div>
</div>
```

## Related Skills

### Composes From
- [primitives/borders](../primitives/borders.md) - Border colors
- [primitives/spacing](../primitives/spacing.md) - Margin values

### Composes Into
- [molecules/nav-link](../molecules/nav-link.md) - Navigation grouping
- [organisms/sidebar](../organisms/sidebar.md) - Section separation
- [organisms/settings-form](../organisms/settings-form.md) - Form sections

### Alternatives
- CSS `border-top` - For simpler cases without label
- CSS Grid `gap` - For consistent spacing without visible lines

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation with Radix UI Separator
- Added DividerWithLabel component
- VerticalDivider component
- Style variants: default, dashed, dotted
