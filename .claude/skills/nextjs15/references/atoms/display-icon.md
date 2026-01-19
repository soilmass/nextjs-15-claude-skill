---
id: a-display-icon
name: Icon
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Icon wrapper with sizes and accessibility
tags: [display, icon, lucide, svg]
dependencies:
  - "lucide-react@0.460.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Icon

## Overview

The Icon atom provides a consistent wrapper for Lucide icons with standardized sizes, colors, and accessibility handling. It ensures icons are properly hidden from or announced to screen readers.

## When to Use

Use this skill when:
- Adding icons to buttons, links, or UI elements
- Creating icon-only interactive elements
- Building feature lists with icons
- Displaying status or action indicators

## Implementation

```typescript
// components/ui/icon.tsx
import * as React from "react";
import { LucideIcon, LucideProps } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
      "2xl": "h-10 w-10",
    },
    color: {
      default: "text-current",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      success: "text-green-600 dark:text-green-500",
      warning: "text-amber-600 dark:text-amber-500",
    },
  },
  defaultVariants: {
    size: "md",
    color: "default",
  },
});

export interface IconProps
  extends Omit<LucideProps, "size" | "color">,
    VariantProps<typeof iconVariants> {
  icon: LucideIcon;
  label?: string;
}

export function Icon({
  icon: IconComponent,
  size,
  color,
  label,
  className,
  ...props
}: IconProps) {
  return (
    <IconComponent
      className={cn(iconVariants({ size, color }), className)}
      strokeWidth={1.5}
      aria-hidden={!label}
      aria-label={label}
      role={label ? "img" : undefined}
      {...props}
    />
  );
}
```

### Icon Button

```typescript
// components/ui/icon-button.tsx
import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button, ButtonProps } from "./button";
import { Icon, IconProps } from "./icon";
import { cn } from "@/lib/utils";

interface IconButtonProps extends Omit<ButtonProps, "children"> {
  icon: LucideIcon;
  label: string;
  iconSize?: IconProps["size"];
}

export function IconButton({
  icon,
  label,
  iconSize = "md",
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      size="icon"
      aria-label={label}
      className={className}
      {...props}
    >
      <Icon icon={icon} size={iconSize} />
    </Button>
  );
}
```

### Feature Icon

```typescript
// components/ui/feature-icon.tsx
import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Icon } from "./icon";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const featureIconVariants = cva(
  "inline-flex items-center justify-center rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        muted: "bg-muted text-muted-foreground",
        success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        destructive: "bg-destructive/10 text-destructive",
      },
      size: {
        sm: "p-2",
        md: "p-3",
        lg: "p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface FeatureIconProps extends VariantProps<typeof featureIconVariants> {
  icon: LucideIcon;
  className?: string;
}

export function FeatureIcon({
  icon,
  variant,
  size,
  className,
}: FeatureIconProps) {
  const iconSize = size === "sm" ? "md" : size === "md" ? "lg" : "xl";
  
  return (
    <div className={cn(featureIconVariants({ variant, size }), className)}>
      <Icon icon={icon} size={iconSize} />
    </div>
  );
}
```

## Variants

### Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| xs | 12px | Inline with small text |
| sm | 16px | Inline with body text, buttons |
| md | 20px | Default, standalone |
| lg | 24px | Headers, navigation |
| xl | 32px | Feature highlights |
| 2xl | 40px | Hero sections |

### Colors

| Color | Use Case |
|-------|----------|
| default | Inherits from parent |
| muted | Secondary icons |
| primary | Brand accent |
| destructive | Errors, delete actions |
| success | Success states |
| warning | Warnings, attention |

## Accessibility

### Decorative Icons

Icons that don't add meaning should be hidden:

```tsx
<Icon icon={Star} /> {/* aria-hidden="true" by default */}
```

### Meaningful Icons

Icons that convey meaning need labels:

```tsx
<Icon icon={CheckCircle} label="Success" />
```

### Icon-Only Buttons

Always provide accessible label:

```tsx
<IconButton icon={X} label="Close dialog" />
```

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "0.460.0",
    "class-variance-authority": "0.7.1"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Icon } from "@/components/ui/icon";
import { Home, Settings, User } from "lucide-react";

<Icon icon={Home} />
<Icon icon={Settings} size="lg" />
<Icon icon={User} color="primary" />
```

### In Buttons

```tsx
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Mail, ArrowRight } from "lucide-react";

<Button>
  <Icon icon={Mail} size="sm" />
  Send Email
</Button>

<Button>
  Continue
  <Icon icon={ArrowRight} size="sm" />
</Button>
```

### Icon Button

```tsx
import { IconButton } from "@/components/ui/icon-button";
import { X, Menu, Search } from "lucide-react";

<IconButton icon={X} label="Close" />
<IconButton icon={Menu} label="Open menu" variant="ghost" />
<IconButton icon={Search} label="Search" variant="outline" />
```

### Feature Icons

```tsx
import { FeatureIcon } from "@/components/ui/feature-icon";
import { Zap, Shield, Clock } from "lucide-react";

<div className="grid grid-cols-3 gap-6">
  <div className="flex flex-col items-center gap-3">
    <FeatureIcon icon={Zap} variant="default" />
    <span>Fast</span>
  </div>
  <div className="flex flex-col items-center gap-3">
    <FeatureIcon icon={Shield} variant="success" />
    <span>Secure</span>
  </div>
  <div className="flex flex-col items-center gap-3">
    <FeatureIcon icon={Clock} variant="warning" />
    <span>24/7</span>
  </div>
</div>
```

### Status Icons

```tsx
import { Icon } from "@/components/ui/icon";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

<Icon icon={CheckCircle} color="success" label="Success" />
<Icon icon={XCircle} color="destructive" label="Error" />
<Icon icon={AlertCircle} color="warning" label="Warning" />
<Icon icon={Info} color="primary" label="Info" />
```

### Navigation

```tsx
import { Icon } from "@/components/ui/icon";
import { Home, Users, Settings, HelpCircle } from "lucide-react";

<nav className="flex flex-col gap-2">
  {[
    { icon: Home, label: "Home" },
    { icon: Users, label: "Users" },
    { icon: Settings, label: "Settings" },
    { icon: HelpCircle, label: "Help" },
  ].map(({ icon, label }) => (
    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
      <Icon icon={icon} color="muted" />
      <span>{label}</span>
    </a>
  ))}
</nav>
```

## Anti-patterns

### Icon Without Context

```tsx
// Bad - icon meaning unclear
<button>
  <Icon icon={X} />
</button>

// Good - with aria-label
<button aria-label="Close">
  <Icon icon={X} />
</button>

// Or with visible text
<button>
  <Icon icon={X} size="sm" />
  Close
</button>
```

### Inconsistent Sizes

```tsx
// Bad - arbitrary sizes
<Icon icon={Home} className="h-[18px] w-[18px]" />
<Icon icon={Settings} className="h-[22px] w-[22px]" />

// Good - use size variants
<Icon icon={Home} size="md" />
<Icon icon={Settings} size="md" />
```

## Related Skills

### Composes From
- [brand-expression](../primitives/brand-expression.md) - Icon system
- [colors](../primitives/colors.md) - Icon colors

### Composes Into
- [input-button](./input-button.md) - Button icons
- [nav-link](../molecules/nav-link.md) - Navigation icons
- [features](../organisms/features.md) - Feature icons

### Related
- [display-image](./display-image.md) - For raster images

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Lucide
- Size and color variants
- Accessibility handling
