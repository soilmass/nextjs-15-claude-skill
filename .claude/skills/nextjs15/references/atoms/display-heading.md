---
id: a-display-heading
name: Heading
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Heading component H1-H6 with scroll margin and balance
tags: [display, typography, heading, semantic]
dependencies: []
performance:
  impact: low
  lcp: positive
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Heading

## Overview

The Heading atom provides semantic heading elements (H1-H6) with consistent styling, proper scroll margins for anchor links, and text-wrap balance for better visual appearance. It enforces proper heading hierarchy for accessibility.

## When to Use

Use this skill when:
- Creating page or section titles
- Building document outlines
- Implementing heading hierarchy
- Adding anchor-linked headings

## Implementation

```typescript
// components/ui/heading.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva(
  "font-bold tracking-tight text-balance scroll-mt-20",
  {
    variants: {
      level: {
        1: "text-4xl lg:text-5xl",
        2: "text-3xl lg:text-4xl",
        3: "text-2xl lg:text-3xl",
        4: "text-xl lg:text-2xl",
        5: "text-lg lg:text-xl",
        6: "text-base lg:text-lg",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
        extrabold: "font-extrabold",
      },
    },
    defaultVariants: {
      level: 2,
      weight: "bold",
    },
  }
);

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    Omit<VariantProps<typeof headingVariants>, "level"> {
  level?: HeadingLevel;
  as?: HeadingLevel;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, as, weight, children, ...props }, ref) => {
    // Visual level (what size it looks like)
    const visualLevel = level;
    // Semantic level (what element to use)
    const semanticLevel = as || level;
    
    const Tag = `h${semanticLevel}` as const;

    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ level: visualLevel, weight }), className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Heading.displayName = "Heading";

export { Heading, headingVariants };
```

### Heading with Anchor

```typescript
// components/ui/heading-anchor.tsx
import * as React from "react";
import { Link2 } from "lucide-react";
import { Heading, HeadingProps } from "./heading";
import { cn } from "@/lib/utils";

interface HeadingAnchorProps extends HeadingProps {
  anchor?: string;
}

export function HeadingAnchor({
  anchor,
  children,
  className,
  ...props
}: HeadingAnchorProps) {
  const id = anchor || slugify(children?.toString() || "");

  return (
    <Heading
      id={id}
      className={cn("group relative", className)}
      {...props}
    >
      <a
        href={`#${id}`}
        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Link to ${children}`}
      >
        <Link2 className="h-4 w-4 text-muted-foreground" />
      </a>
      {children}
    </Heading>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
```

## Variants

### Levels

| Level | Size (mobile) | Size (desktop) | Typical Use |
|-------|---------------|----------------|-------------|
| 1 | text-4xl (36px) | text-5xl (48px) | Page title |
| 2 | text-3xl (30px) | text-4xl (36px) | Section title |
| 3 | text-2xl (24px) | text-3xl (30px) | Subsection |
| 4 | text-xl (20px) | text-2xl (24px) | Card title |
| 5 | text-lg (18px) | text-xl (20px) | Small heading |
| 6 | text-base (16px) | text-lg (18px) | Minor heading |

### Visual vs Semantic Level

```tsx
// Visual H2 size, but H3 semantically (for proper hierarchy)
<Heading level={2} as={3}>
  Section Title
</Heading>
```

## Accessibility

### Heading Hierarchy

- Only one `<h1>` per page
- Don't skip heading levels (h1 → h3)
- Use headings to create document outline
- Screen readers use headings for navigation

### Screen Reader Navigation

- Users navigate by headings (H key in screen readers)
- Heading text should be descriptive
- Avoid empty or icon-only headings

### Scroll Margin

- `scroll-mt-20` ensures heading isn't hidden under sticky header
- Adjust based on your header height

## Dependencies

```json
{
  "dependencies": {
    "class-variance-authority": "0.7.1",
    "lucide-react": "0.460.0"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Heading } from "@/components/ui/heading";

<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section Title</Heading>
<Heading level={3}>Subsection Title</Heading>
```

### With Different Weights

```tsx
<Heading level={1} weight="extrabold">
  Bold Hero Title
</Heading>

<Heading level={2} weight="semibold">
  Lighter Section Title
</Heading>
```

### Page Header

```tsx
<header className="space-y-4">
  <Heading level={1}>
    Getting Started
  </Heading>
  <Text size="lg" color="muted">
    Learn how to set up your project in minutes.
  </Text>
</header>
```

### With Anchor Links

```tsx
import { HeadingAnchor } from "@/components/ui/heading-anchor";

<HeadingAnchor level={2}>
  Installation
</HeadingAnchor>

// Generates: <h2 id="installation">Installation</h2>
// With hover link to #installation
```

### Card Heading

```tsx
<Card>
  <CardHeader>
    <Heading level={3} as={4} weight="semibold">
      Card Title
    </Heading>
    <Text color="muted">Card description</Text>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Section with Multiple Headings

```tsx
<section>
  <Heading level={2}>Features</Heading>
  
  <div className="grid gap-8 mt-8">
    <div>
      <Heading level={3}>Fast Performance</Heading>
      <Text color="muted">Optimized for speed.</Text>
    </div>
    
    <div>
      <Heading level={3}>Easy Integration</Heading>
      <Text color="muted">Works with your stack.</Text>
    </div>
  </div>
</section>
```

### Hero Title

```tsx
<Heading 
  level={1} 
  weight="extrabold"
  className="text-5xl sm:text-6xl lg:text-7xl"
>
  Build faster with{" "}
  <span className="text-primary">Next.js</span>
</Heading>
```

## Anti-patterns

### Skipping Heading Levels

```tsx
// Bad - skips h2
<Heading level={1}>Page Title</Heading>
<Heading level={3}>Subsection</Heading>

// Good - proper hierarchy
<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section</Heading>
<Heading level={3}>Subsection</Heading>
```

### Multiple H1s

```tsx
// Bad - multiple h1s
<Heading level={1}>Title One</Heading>
<Heading level={1}>Title Two</Heading>

// Good - one h1, rest are h2+
<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section One</Heading>
<Heading level={2}>Section Two</Heading>
```

### Using Heading for Styling Only

```tsx
// Bad - using heading just for size
<Heading level={3}>This is not a heading, just bold text</Heading>

// Good - use Text with styling
<Text size="xl" weight="bold">This is not a heading, just bold text</Text>
```

## Related Skills

### Composes From
- [typography](../primitives/typography.md) - Font scale
- [visual-hierarchy](../primitives/visual-hierarchy.md) - Size hierarchy

### Composes Into
- [hero](../organisms/hero.md) - Hero titles
- [card](../molecules/card.md) - Card headers
- [blog-post](../organisms/blog-post.md) - Article headings

### Related
- [display-text](./display-text.md) - For body text

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with CVA
- H1-H6 levels with size variants
- Scroll margin and anchor support
