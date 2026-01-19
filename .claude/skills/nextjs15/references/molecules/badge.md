---
id: m-badge
name: Badge
version: 2.0.0
layer: L2
category: display
description: Small label/badge component for status indicators, counts, and tags
tags: [badge, label, status, tag, count, indicator]
formula: "Badge = Text(a-display-text) + Icon(a-display-icon) + Dot(a-display-badge)"
composes:
  - ../atoms/display-badge.md
  - ../atoms/display-text.md
  - ../atoms/display-icon.md
dependencies:
  "class-variance-authority": "^0.7.1"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Badge

## Overview

The Badge molecule displays small labels for status indicators, counts, or tags. Supports multiple semantic variants, sizes, and can include icons or dot indicators.

## When to Use

Use this skill when:
- Showing status indicators (active, pending, error)
- Displaying counts or numbers
- Adding labels or tags to content
- Highlighting new or updated content

## Composition Diagram

```
+-----------------------------------------------+
|                     Badge                      |
+-----------------------------------------------+
|  +------------------------------------------+ |
|  |    [Dot]   [Icon]   Text   [Close]       | |
|  |     o        *      "New"     x          | |
|  +------------------------------------------+ |
+-----------------------------------------------+

Variants:
+----------+  +-----------+  +------------+
| Default  |  | Secondary |  | Destructive|
+----------+  +-----------+  +------------+
| Success  |  | Warning   |  | Info       |
+----------+  +-----------+  +------------+
| Outline  |  | With Dot  |  | With Count |
+----------+  +-----------+  +------------+
```

## Atoms Used

- [display-badge](../atoms/display-badge.md) - Base badge styling
- [display-text](../atoms/display-text.md) - Badge text
- [display-icon](../atoms/display-icon.md) - Optional icon

## Implementation

```typescript
// components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Show a dot indicator */
  dot?: boolean;
  /** Dot color override */
  dotColor?: "default" | "success" | "warning" | "destructive";
  /** Show close/remove button */
  removable?: boolean;
  /** Callback when remove is clicked */
  onRemove?: () => void;
  /** Icon to display */
  icon?: React.ReactNode;
}

const dotColors = {
  default: "bg-current",
  success: "bg-green-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
};

function Badge({
  className,
  variant,
  size,
  dot,
  dotColor = "default",
  removable,
  onRemove,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotColors[dotColor]
          )}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };
```

```typescript
// components/ui/badge-count.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeCountProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
  variant?: "default" | "destructive";
  size?: "sm" | "md" | "lg";
}

export function BadgeCount({
  count,
  max = 99,
  variant = "default",
  size = "md",
  className,
  ...props
}: BadgeCountProps) {
  const displayCount = count > max ? `${max}+` : count;

  if (count === 0) return null;

  const sizeStyles = {
    sm: "min-w-4 h-4 text-[10px] px-1",
    md: "min-w-5 h-5 text-xs px-1.5",
    lg: "min-w-6 h-6 text-sm px-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        sizeStyles[size],
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

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
```

### Sizes

```tsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### With Dot

```tsx
<Badge dot dotColor="success">Online</Badge>
<Badge dot dotColor="warning">Away</Badge>
<Badge dot dotColor="destructive">Offline</Badge>
```

### Removable

```tsx
<Badge removable onRemove={() => console.log("removed")}>
  Tag
</Badge>
```

### With Icon

```tsx
<Badge icon={<Check className="h-3 w-3" />} variant="success">
  Completed
</Badge>
```

## States

| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | primary | transparent | white |
| Hover (removable) | primary/90 | - | white |
| Focus | primary + ring | - | white |

## Accessibility

### Screen Reader Considerations

- Include context for screen readers when meaning is not clear
- Use `aria-label` for icon-only badges
- Status badges should have descriptive text

### Color and Meaning

- Do not rely on color alone for status indication
- Pair colors with text labels or icons

## Dependencies

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.460.0"
  }
}
```

## Examples

### Status Indicators

```tsx
<div className="flex gap-2">
  <Badge variant="success">Active</Badge>
  <Badge variant="warning">Pending</Badge>
  <Badge variant="destructive">Failed</Badge>
</div>
```

### Tag List

```tsx
const [tags, setTags] = useState(["React", "TypeScript", "Tailwind"]);

<div className="flex flex-wrap gap-2">
  {tags.map((tag) => (
    <Badge
      key={tag}
      variant="secondary"
      removable
      onRemove={() => setTags(tags.filter((t) => t !== tag))}
    >
      {tag}
    </Badge>
  ))}
</div>
```

### Notification Count

```tsx
<button className="relative">
  <Bell className="h-5 w-5" />
  <BadgeCount
    count={5}
    className="absolute -top-2 -right-2"
  />
</button>
```

## Anti-patterns

### Color-Only Status

```tsx
// Bad - color alone indicates status
<Badge variant="success" />

// Good - text indicates status
<Badge variant="success">Active</Badge>
```

### Overusing Badges

```tsx
// Bad - too many badges
<Card>
  <Badge>New</Badge>
  <Badge variant="success">Live</Badge>
  <Badge variant="info">Featured</Badge>
</Card>

// Good - prioritize important info
<Card>
  <Badge>New</Badge>
</Card>
```

## Related Skills

### Composes From
- [atoms/display-badge](../atoms/display-badge.md) - Base badge

### Composes Into
- [molecules/tag-input](./tag-input.md) - Tag management
- [organisms/data-table](../organisms/data-table.md) - Status columns

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Semantic variants with sizes
- Dot and icon support
- Removable badges
- BadgeCount component
