---
id: a-display-badge
name: Badge
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Badge component with variants and sizes
tags: [display, badge, label, status]
dependencies:
  - "class-variance-authority@0.7.1"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Badge

## Overview

The Badge atom displays status indicators, labels, or counts. It supports multiple semantic variants and can be used as interactive elements when needed.

## When to Use

Use this skill when:
- Showing status indicators (active, pending, error)
- Displaying counts or numbers
- Adding labels or tags to content
- Highlighting new or updated content

## Implementation

```typescript
// components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: 
          "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

### Badge with Dot

```typescript
// components/ui/badge-dot.tsx
import * as React from "react";
import { Badge, BadgeProps } from "./badge";
import { cn } from "@/lib/utils";

interface BadgeDotProps extends BadgeProps {
  dotColor?: "default" | "success" | "warning" | "destructive";
}

const dotColors = {
  default: "bg-foreground",
  success: "bg-green-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
};

export function BadgeDot({ dotColor = "default", children, className, ...props }: BadgeDotProps) {
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)} {...props}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[dotColor])} />
      {children}
    </Badge>
  );
}
```

### Badge with Count

```typescript
// components/ui/badge-count.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeCountProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
  variant?: "default" | "destructive";
}

export function BadgeCount({
  count,
  max = 99,
  variant = "default",
  className,
  ...props
}: BadgeCountProps) {
  const displayCount = count > max ? `${max}+` : count;
  
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-xs font-bold min-w-[1.25rem] h-5 px-1.5",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        className
      )}
      {...props}
    >
      {displayCount}
    </span>
  );
}
```

## Variants

### Semantic Variants

| Variant | Background | Use Case |
|---------|------------|----------|
| default | primary | Default labels |
| secondary | secondary | Neutral tags |
| destructive | destructive | Errors, warnings |
| outline | transparent | Subtle indicators |
| success | green | Success status |
| warning | amber | Pending, attention |
| info | blue | Information |

### Sizes (via className)

```tsx
// Small
<Badge className="px-2 py-0.5 text-[10px]">Small</Badge>

// Default
<Badge>Default</Badge>

// Large
<Badge className="px-3 py-1 text-sm">Large</Badge>
```

## Accessibility

### Screen Reader Considerations

- Include context for screen readers when meaning isn't clear
- Use `aria-label` for icon-only badges
- Status badges should have descriptive text

### Color and Meaning

- Don't rely on color alone for status indication
- Pair colors with text labels or icons

## Dependencies

```json
{
  "dependencies": {
    "class-variance-authority": "0.7.1"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Status Indicators

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="info">Processing</Badge>
```

### With Dot

```tsx
import { BadgeDot } from "@/components/ui/badge-dot";

<BadgeDot dotColor="success">Online</BadgeDot>
<BadgeDot dotColor="warning">Away</BadgeDot>
<BadgeDot dotColor="destructive">Offline</BadgeDot>
```

### Notification Count

```tsx
import { BadgeCount } from "@/components/ui/badge-count";
import { Bell } from "lucide-react";

<button className="relative">
  <Bell className="h-5 w-5" />
  <BadgeCount 
    count={5} 
    className="absolute -top-2 -right-2"
  />
</button>
```

### As Interactive Element

```tsx
<Badge 
  variant="outline" 
  className="cursor-pointer hover:bg-accent"
  onClick={handleClick}
  role="button"
  tabIndex={0}
>
  Clickable
</Badge>
```

### In Lists

```tsx
<ul className="space-y-2">
  <li className="flex items-center justify-between">
    <span>Feature One</span>
    <Badge variant="success">Released</Badge>
  </li>
  <li className="flex items-center justify-between">
    <span>Feature Two</span>
    <Badge variant="warning">Beta</Badge>
  </li>
  <li className="flex items-center justify-between">
    <span>Feature Three</span>
    <Badge variant="outline">Planned</Badge>
  </li>
</ul>
```

### Tag Cloud

```tsx
<div className="flex flex-wrap gap-2">
  {tags.map((tag) => (
    <Badge key={tag} variant="secondary">
      {tag}
    </Badge>
  ))}
</div>
```

### With Icons

```tsx
import { Check, AlertCircle, Clock } from "lucide-react";

<Badge variant="success" className="gap-1">
  <Check className="h-3 w-3" />
  Completed
</Badge>

<Badge variant="destructive" className="gap-1">
  <AlertCircle className="h-3 w-3" />
  Error
</Badge>

<Badge variant="warning" className="gap-1">
  <Clock className="h-3 w-3" />
  Pending
</Badge>
```

## Anti-patterns

### Color-Only Status

```tsx
// Bad - color alone indicates status
<Badge variant="success" />

// Good - text indicates status
<Badge variant="success">Active</Badge>

// Or with icon
<Badge variant="success">
  <Check className="h-3 w-3 mr-1" />
  Active
</Badge>
```

### Overusing Badges

```tsx
// Bad - too many badges
<Card>
  <Badge>New</Badge>
  <Badge variant="success">Live</Badge>
  <Badge variant="info">Featured</Badge>
  <Badge variant="secondary">Popular</Badge>
</Card>

// Good - prioritize important info
<Card>
  <Badge>New</Badge>
</Card>
```

### Large Counts Without Max

```tsx
// Bad - shows huge number
<BadgeCount count={12847} />

// Good - capped with max
<BadgeCount count={12847} max={99} /> // Shows 99+
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Badge colors
- [borders](../primitives/borders.md) - Border radius

### Composes Into
- [stat-card](../molecules/stat-card.md) - Trend indicators
- [product-card](../organisms/product-card.md) - Sale badges
- [data-table](../organisms/data-table.md) - Status columns

### Related
- [display-avatar](./display-avatar.md) - User avatars with status

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with CVA
- Semantic variants
- Dot and count variants
