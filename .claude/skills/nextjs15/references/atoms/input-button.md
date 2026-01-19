---
id: a-input-button
name: Button
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Button with 6 variants, 4 sizes, loading state
tags: [input, button, interactive, cta]
dependencies:
  - "@radix-ui/react-slot@1.1.0"
  - "class-variance-authority@0.7.1"
performance:
  impact: high
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Button

## Overview

The Button atom is the primary interactive element for user actions. It supports multiple variants (default, destructive, outline, secondary, ghost, link), four sizes, loading states, and can render as different elements using the `asChild` pattern.

Built on Radix UI's Slot primitive for polymorphic rendering and CVA for variant management.

## When to Use

Use this skill when:
- Creating any clickable action element
- Building forms with submit buttons
- Adding navigation CTAs
- Implementing icon-only actions

## Implementation

```typescript
// components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md 
   text-sm font-medium transition-colors
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Utility Function

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Variants

### Visual Variants

| Variant | Use Case | Appearance |
|---------|----------|------------|
| `default` | Primary actions | Solid primary color |
| `destructive` | Dangerous actions | Red/destructive color |
| `outline` | Secondary actions | Border with transparent bg |
| `secondary` | Alternative actions | Muted solid background |
| `ghost` | Tertiary actions | No background until hover |
| `link` | Inline links | Underlined text style |

### Size Variants

| Size | Height | Use Case |
|------|--------|----------|
| `sm` | 36px | Compact UIs, tables |
| `default` | 40px | Standard actions |
| `lg` | 44px | Hero CTAs, forms |
| `icon` | 40x40px | Icon-only buttons |

## States

| State | Background | Border | Text | Scale | Cursor | ARIA |
|-------|------------|--------|------|-------|--------|------|
| Default | primary | none | primary-foreground | 1 | pointer | - |
| Hover | primary/90 | none | primary-foreground | 1 | pointer | - |
| Focus | primary | ring | primary-foreground | 1 | pointer | - |
| Active | primary/80 | none | primary-foreground | 0.98 | pointer | - |
| Loading | primary/70 | none | primary-foreground | 1 | wait | aria-busy="true" |
| Disabled | primary/50 | none | primary-foreground/50 | 1 | not-allowed | aria-disabled="true" |

### State Transitions

```css
/* Transition timing */
.button {
  transition: 
    background-color 150ms ease,
    transform 50ms ease,
    box-shadow 150ms ease;
}

/* Active press effect */
.button:active:not(:disabled) {
  transform: scale(0.98);
}
```

## Accessibility

### Required ARIA Attributes

- `aria-disabled`: Set when disabled or loading
- `aria-busy`: Set to "true" when loading
- `aria-label`: Required for icon-only buttons

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus the button |
| `Enter` | Activate the button |
| `Space` | Activate the button |

### Screen Reader Announcements

- Button role is implicit for `<button>` elements
- Loading state should announce "Loading" or similar
- Disabled state is announced automatically

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "1.1.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.5",
    "lucide-react": "0.460.0"
  }
}
```

### Installation

```bash
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
```

## Examples

### Basic Usage

```tsx
import { Button } from "@/components/ui/button";

// Primary button
<Button>Click me</Button>

// With variant
<Button variant="outline">Secondary Action</Button>

// With size
<Button size="lg">Large Button</Button>
```

### With Icons

```tsx
import { Mail, ArrowRight } from "lucide-react";

// Icon before text
<Button>
  <Mail />
  Send Email
</Button>

// Icon after text
<Button>
  Continue
  <ArrowRight />
</Button>

// Icon only
<Button size="icon" aria-label="Send email">
  <Mail />
</Button>
```

### Loading State

```tsx
const [loading, setLoading] = useState(false);

<Button loading={loading} onClick={handleSubmit}>
  {loading ? "Saving..." : "Save Changes"}
</Button>
```

### As Link (Polymorphic)

```tsx
import Link from "next/link";

<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Button Group

```tsx
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button>Confirm</Button>
</div>
```

## Anti-patterns

### Missing aria-label on Icon Buttons

```tsx
// Bad - no accessible name
<Button size="icon">
  <X />
</Button>

// Good - has aria-label
<Button size="icon" aria-label="Close dialog">
  <X />
</Button>
```

### Using div Instead of Button

```tsx
// Bad - not keyboard accessible
<div onClick={handleClick} className="button-styles">
  Click me
</div>

// Good - proper button element
<Button onClick={handleClick}>
  Click me
</Button>
```

### Disabled Without Visual Indication

```tsx
// Bad - only programmatically disabled
<Button disabled className="opacity-100">Submit</Button>

// Good - disabled styling is automatic
<Button disabled>Submit</Button>
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Button colors
- [motion](../primitives/motion.md) - Transition timing
- [accessibility](../primitives/accessibility.md) - Focus states

### Composes Into
- [form-field](../molecules/form-field.md) - Form submissions
- [dialog](../organisms/dialog.md) - Modal actions
- [header](../organisms/header.md) - Navigation CTAs

### Related
- [interactive-link](./interactive-link.md) - For navigation without button styling
