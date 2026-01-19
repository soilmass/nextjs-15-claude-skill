---
id: m-card
name: Card
version: 2.0.0
layer: L2
category: content
description: Flexible card component with header, content, footer, and interactive states
tags: [card, container, panel, surface, interactive]
formula: "Card = Title(a-display-heading) + Description(a-display-text) + Image(a-display-image) + Action(a-input-button)"
composes:
  - ../atoms/display-heading.md
  - ../atoms/display-text.md
  - ../atoms/display-image.md
  - ../atoms/input-button.md
dependencies: []
performance:
  impact: low
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Card

## Overview

The Card molecule provides a flexible container for grouping related content. Supports header, content, and footer sections with optional interactive states for clickable cards. Uses compound component pattern for composition.

## When to Use

Use this skill when:
- Displaying grouped content (products, posts, profiles)
- Creating dashboard widgets
- Building feature showcases
- Presenting call-to-action blocks

## Composition Diagram

```
┌─────────────────────────────────────────────────┐
│                     Card                         │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │           Image (a-display-image)         │  │
│  │                   🖼️                       │  │
│  │               [Product Image]             │  │
│  └───────────────────────────────────────────┘  │
│  ┌─────────────── CardHeader ────────────────┐  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │     Title (a-display-heading)       │  │  │
│  │  │        "Product Name"               │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │   Description (a-display-text)      │  │  │
│  │  │    "Short product description"      │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│  ┌─────────────── CardContent ───────────────┐  │
│  │              Main content area            │  │
│  └───────────────────────────────────────────┘  │
│  ┌─────────────── CardFooter ────────────────┐  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │     Action (a-input-button)         │  │  │
│  │  │         [ Add to Cart ]             │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Atoms Used

- [display-heading](../atoms/display-heading.md) - Card titles
- [display-text](../atoms/display-text.md) - Descriptions
- [display-image](../atoms/display-image.md) - Card images
- [input-button](../atoms/input-button.md) - Card actions

## Implementation

```typescript
// components/ui/card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover effects for clickable cards */
  interactive?: boolean;
  /** Visual style variant */
  variant?: "default" | "ghost" | "outline";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border bg-card shadow-sm",
      ghost: "bg-transparent",
      outline: "border-2 bg-transparent",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg text-card-foreground",
          variantStyles[variant],
          interactive && [
            "cursor-pointer transition-all duration-200",
            "hover:shadow-md hover:border-primary/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          ],
          className
        )}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" }
>(({ className, as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

```typescript
// components/ui/link-card.tsx
import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  href: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  external?: boolean;
}

export function LinkCard({
  href,
  title,
  description,
  children,
  className,
  external,
}: LinkCardProps) {
  const CardWrapper = external ? "a" : Link;
  
  return (
    <CardWrapper
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "block no-underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "rounded-lg",
        className
      )}
    >
      <Card interactive className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
      </Card>
    </CardWrapper>
  );
}
```

```typescript
// components/ui/media-card.tsx
import * as React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  image: {
    src: string;
    alt: string;
    aspectRatio?: "video" | "square" | "portrait";
  };
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function MediaCard({
  image,
  title,
  description,
  children,
  footer,
  className,
}: MediaCardProps) {
  const aspectStyles = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className={cn("relative w-full", aspectStyles[image.aspectRatio ?? "video"])}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
```

### Key Implementation Notes

1. **Compound Components**: Uses compound pattern for flexible composition
2. **Interactive Mode**: Adds focus and hover states for clickable cards

## Variants

### Default Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content of the card</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Interactive Card

```tsx
<Card interactive onClick={() => navigate("/details")}>
  <CardHeader>
    <CardTitle>Click Me</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This entire card is clickable</p>
  </CardContent>
</Card>
```

### Link Card

```tsx
<LinkCard
  href="/products/1"
  title="Product Name"
  description="Short product description"
>
  <span className="text-lg font-bold">$99.00</span>
</LinkCard>
```

### Media Card

```tsx
<MediaCard
  image={{
    src: "/product.jpg",
    alt: "Product image",
    aspectRatio: "square",
  }}
  title="Product Name"
  description="Product description"
  footer={<Button className="w-full">Add to Cart</Button>}
/>
```

### Ghost Variant

```tsx
<Card variant="ghost">
  <CardContent>
    <p>No background or border</p>
  </CardContent>
</Card>
```

## States

| State | Border | Shadow | Background | Cursor |
|-------|--------|--------|------------|--------|
| Default | border | sm | card | default |
| Hover (interactive) | primary/50 | md | card | pointer |
| Focus (interactive) | - | - | card | - |
| Disabled | border | none | muted | not-allowed |

## Accessibility

### Required ARIA Attributes

- `tabIndex={0}` on interactive cards for keyboard focus
- `role="article"` or `role="region"` when card is a landmark
- Heading hierarchy preserved within cards

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus interactive card |
| `Enter` | Activate interactive card |
| `Space` | Activate interactive card |

### Screen Reader Announcements

- Card title announced as heading
- Description announced after title
- Interactive cards announced as clickable

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0"
  }
}
```

### Installation

```bash
# No additional dependencies - uses Tailwind CSS
```

## Examples

### Basic Card Grid

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function FeatureCards() {
  const features = [
    { title: "Fast", description: "Built for speed" },
    { title: "Secure", description: "Enterprise-grade security" },
    { title: "Scalable", description: "Grows with you" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {features.map((feature) => (
        <Card key={feature.title}>
          <CardHeader>
            <CardTitle>{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
```

### Product Card

```tsx
import { MediaCard } from "@/components/ui/media-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }) {
  return (
    <MediaCard
      image={{
        src: product.image,
        alt: product.name,
        aspectRatio: "square",
      }}
      title={product.name}
      description={product.category}
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-lg font-bold">${product.price}</span>
          <Button size="sm">Add to Cart</Button>
        </div>
      }
    >
      {product.sale && <Badge variant="destructive">Sale</Badge>}
    </MediaCard>
  );
}
```

### Dashboard Widget Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function StatCard({ title, value, change, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendingUp className={cn(
          "h-4 w-4",
          trend === "up" ? "text-green-500" : "text-red-500"
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}
```

### Card with Loading State

```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[200px]" />
      </CardContent>
    </Card>
  );
}
```

## Anti-patterns

### Missing Heading Hierarchy

```tsx
// Bad - all same level
<Card>
  <h3>Main Title</h3>
  <h3>Subtitle</h3> {/* Should be h4 */}
</Card>

// Good - proper hierarchy
<Card>
  <CardHeader>
    <CardTitle>Main Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
</Card>
```

### Clickable Card with Clickable Children

```tsx
// Bad - nested interactive elements
<Card interactive onClick={handleCardClick}>
  <CardContent>
    <Button onClick={handleButtonClick}>Click</Button>
  </CardContent>
</Card>

// Good - separate click targets
<Card>
  <CardContent>
    <p>Content</p>
  </CardContent>
  <CardFooter>
    <Button onClick={handleButtonClick}>Click</Button>
  </CardFooter>
</Card>
```

### Inconsistent Card Heights in Grid

```tsx
// Bad - cards have varying heights
<div className="grid grid-cols-3 gap-4">
  {cards.map(card => <Card key={card.id}>...</Card>)}
</div>

// Good - equal heights
<div className="grid grid-cols-3 gap-4">
  {cards.map(card => <Card key={card.id} className="h-full">...</Card>)}
</div>
```

## Related Skills

### Composes From
- [atoms/display-heading](../atoms/display-heading.md) - Card titles
- [atoms/display-text](../atoms/display-text.md) - Descriptions
- [atoms/display-image](../atoms/display-image.md) - Card images

### Composes Into
- [organisms/pricing](../organisms/pricing.md) - Pricing cards
- [organisms/testimonials](../organisms/testimonials.md) - Testimonial cards
- [organisms/product-card](../organisms/product-card.md) - E-commerce cards

### Alternatives
- [molecules/callout](./callout.md) - For alert-style content
- Raw `<div>` - For simple containers without styling

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with compound components
- LinkCard and MediaCard variants
- Interactive state support
