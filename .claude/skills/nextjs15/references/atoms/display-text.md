---
id: a-display-text
name: Text
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Text component with sizes, weights, colors, truncation
tags: [display, typography, text]
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

# Text

## Overview

The Text atom provides consistent typography styling with support for different sizes, weights, colors, and text treatments like truncation. It's the foundation for all text content in the UI.

## When to Use

Use this skill when:
- Displaying body text, labels, descriptions
- Applying consistent text styling
- Implementing truncation or clamping
- Using semantic text colors

## Implementation

```typescript
// components/ui/text.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      success: "text-green-600 dark:text-green-500",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    leading: {
      none: "leading-none",
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
    },
    truncate: {
      none: "",
      single: "truncate",
      "2-lines": "line-clamp-2",
      "3-lines": "line-clamp-3",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    color: "default",
    leading: "normal",
    truncate: "none",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label";
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    { className, size, weight, color, align, leading, truncate, as = "p", ...props },
    ref
  ) => {
    const Comp = as;
    return (
      <Comp
        ref={ref as any}
        className={cn(
          textVariants({ size, weight, color, align, leading, truncate }),
          className
        )}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Text, textVariants };
```

## Variants

### Sizes

| Size | Class | Typical Use |
|------|-------|-------------|
| xs | text-xs (12px) | Captions, timestamps |
| sm | text-sm (14px) | Labels, secondary text |
| base | text-base (16px) | Body text |
| lg | text-lg (18px) | Lead paragraphs |
| xl | text-xl (20px) | Subheadings |
| 2xl | text-2xl (24px) | Small headings |

### Weights

| Weight | Class | Use |
|--------|-------|-----|
| normal | font-normal (400) | Body text |
| medium | font-medium (500) | Labels, emphasis |
| semibold | font-semibold (600) | Subheadings |
| bold | font-bold (700) | Strong emphasis |

### Colors

| Color | Class | Use |
|-------|-------|-----|
| default | text-foreground | Primary content |
| muted | text-muted-foreground | Secondary content |
| primary | text-primary | Brand/accent |
| destructive | text-destructive | Errors |
| success | text-green-* | Success messages |

### Truncation

| Mode | Behavior |
|------|----------|
| none | No truncation |
| single | Single line with ellipsis |
| 2-lines | Two lines then ellipsis |
| 3-lines | Three lines then ellipsis |

## Accessibility

### Screen Reader Considerations

- Use semantic elements (`<p>`, `<span>`) appropriately
- Don't use color alone to convey meaning
- Ensure sufficient color contrast

### Truncation

- Truncated text should be accessible via tooltip or expansion
- Use `title` attribute for simple cases
- Consider "Read more" pattern for important content

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
import { Text } from "@/components/ui/text";

<Text>Default paragraph text</Text>
```

### With Variants

```tsx
<Text size="sm" color="muted">
  Secondary text with smaller size
</Text>

<Text size="lg" weight="semibold">
  Emphasized larger text
</Text>

<Text color="destructive">
  Error message text
</Text>
```

### Truncated Text

```tsx
// Single line truncation
<Text truncate="single" className="max-w-xs">
  This is a very long text that will be truncated with an ellipsis
</Text>

// Multi-line clamping
<Text truncate="2-lines">
  This is a longer piece of content that will be clamped to two lines
  before showing an ellipsis at the end of the second line.
</Text>
```

### As Different Elements

```tsx
// As span (inline)
<Text as="span" weight="medium">Inline text</Text>

// As label
<Text as="label" size="sm" weight="medium">
  Form label
</Text>

// As div (block without margin)
<Text as="div">Block text</Text>
```

### Composition

```tsx
<article>
  <Text size="xs" color="muted" weight="medium" className="uppercase tracking-wide">
    Category
  </Text>
  <Text size="2xl" weight="bold" className="mt-1">
    Article Title
  </Text>
  <Text color="muted" className="mt-2">
    Article description goes here with some more detail about the content.
  </Text>
</article>
```

### With Custom Styles

```tsx
<Text 
  size="base" 
  className="max-w-prose"
  leading="relaxed"
>
  A longer paragraph with relaxed line height for better readability.
  The max-w-prose class ensures optimal reading width.
</Text>
```

## Anti-patterns

### Using for Headings

```tsx
// Bad - use Heading component for headings
<Text size="2xl" weight="bold">Page Title</Text>

// Good - use semantic heading
<Heading level={1}>Page Title</Heading>
```

### Ignoring Semantic Elements

```tsx
// Bad - div for paragraph content
<div className="text-base">Paragraph text</div>

// Good - use Text with semantic element
<Text>Paragraph text</Text>
```

### Color Without Context

```tsx
// Bad - color alone indicates status
<Text color="destructive">Status</Text>

// Good - icon or prefix indicates status
<Text color="destructive">
  <AlertCircle className="inline mr-1 h-4 w-4" />
  Error: Something went wrong
</Text>
```

## Related Skills

### Composes From
- [typography](../primitives/typography.md) - Font scale and styles
- [colors](../primitives/colors.md) - Text colors
- [visual-hierarchy](../primitives/visual-hierarchy.md) - Contrast levels

### Composes Into
- [card](../molecules/card.md) - Card descriptions
- [form-field](../molecules/form-field.md) - Error messages
- [empty-state](../molecules/empty-state.md) - Empty state text

### Related
- [display-heading](./display-heading.md) - For headings
- [display-code](./display-code.md) - For code text
