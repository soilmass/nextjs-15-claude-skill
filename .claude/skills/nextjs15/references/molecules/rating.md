---
id: m-rating
name: Rating
version: 2.0.0
layer: L2
category: forms
description: Star rating input component with half-star support and hover preview
tags: [rating, stars, review, feedback, input]
formula: "Rating = StarIcon(a-display-icon)[] + ClickArea(a-input-button)[]"
composes:
  - ../atoms/display-icon.md
  - ../atoms/input-button.md
dependencies:
  lucide-react: "^0.460.0"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Rating

## Overview

The Rating molecule provides an interactive star rating input with support for half-star precision, hover preview, read-only display, and customizable icons. Built with keyboard accessibility and ARIA support for screen readers.

## When to Use

Use this skill when:
- Collecting user ratings for products/services
- Displaying average ratings from reviews
- Implementing feedback systems
- Building review forms

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Rating                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │   ★     │  │   ★     │  │   ★     │  │   ☆     │  │   ☆     ││
│  │(a-disp- │  │(a-disp- │  │(a-disp- │  │(a-disp- │  │(a-disp- ││
│  │lay-icon)│  │lay-icon)│  │lay-icon)│  │lay-icon)│  │lay-icon)││
│  │ filled  │  │ filled  │  │ filled  │  │  empty  │  │  empty  ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘│
│  └────────────────── Click Areas (a-input-button) ─────────────┘│
└─────────────────────────────────────────────────────────────────┘

Half-Star Support:
┌─────────────────────────────────────────────────────────────────┐
│    ★         ★         ★         ◐         ☆                    │
│  [1.0]     [2.0]     [3.0]     [3.5]     [4.0]                  │
└─────────────────────────────────────────────────────────────────┘

States: Empty (☆) | Half (◐) | Filled (★) | Hover Preview
```

## Atoms Used

- [display-icon](../atoms/display-icon.md) - Star icons
- [input-button](../atoms/input-button.md) - Clickable star areas

## Implementation

```typescript
// components/ui/rating.tsx
"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  /** Current rating value */
  value: number;
  /** Callback when rating changes */
  onChange?: (value: number) => void;
  /** Maximum number of stars */
  max?: number;
  /** Enable half-star precision */
  precision?: 0.5 | 1;
  /** Size of stars */
  size?: "sm" | "md" | "lg";
  /** Read-only display mode */
  readonly?: boolean;
  /** Show numeric value beside stars */
  showValue?: boolean;
  /** Accessible label */
  label?: string;
  /** Additional class names */
  className?: string;
}

const sizeStyles = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const gapStyles = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
};

export function Rating({
  value,
  onChange,
  max = 5,
  precision = 1,
  size = "md",
  readonly = false,
  showValue = false,
  label = "Rating",
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  
  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (readonly || !onChange) return;
    const newValue = isHalf && precision === 0.5 
      ? starIndex + 0.5 
      : starIndex + 1;
    onChange(newValue);
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    if (readonly) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const isHalf = (event.clientX - rect.left) < rect.width / 2;
    setHoverValue(isHalf && precision === 0.5 ? starIndex + 0.5 : starIndex + 1);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (readonly || !onChange) return;
    
    const step = precision === 0.5 ? 0.5 : 1;
    
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        onChange(Math.min(max, value + step));
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        onChange(Math.max(0, value - step));
        break;
      case "Home":
        event.preventDefault();
        onChange(0);
        break;
      case "End":
        event.preventDefault();
        onChange(max);
        break;
    }
  };

  const renderStar = (index: number) => {
    const fillPercentage = Math.min(100, Math.max(0, (displayValue - index) * 100));
    const isFilled = fillPercentage >= 100;
    const isHalfFilled = fillPercentage > 0 && fillPercentage < 100;

    return (
      <button
        key={index}
        type="button"
        disabled={readonly}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const isHalf = (e.clientX - rect.left) < rect.width / 2;
          handleClick(index, isHalf);
        }}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative focus:outline-none",
          !readonly && "cursor-pointer hover:scale-110 transition-transform",
          readonly && "cursor-default"
        )}
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* Background star (empty) */}
        <Star
          className={cn(
            sizeStyles[size],
            "text-muted-foreground/30",
            "transition-colors"
          )}
        />
        
        {/* Foreground star (filled) - clipped for partial fill */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star
            className={cn(
              sizeStyles[size],
              "fill-amber-400 text-amber-400",
              "transition-colors"
            )}
          />
        </div>
      </button>
    );
  };

  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} out of ${max} stars`}
      tabIndex={readonly ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center",
        gapStyles[size],
        !readonly && "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
        className
      )}
    >
      {Array.from({ length: max }, (_, i) => renderStar(i))}
      
      {showValue && (
        <span className={cn(
          "ml-2 text-muted-foreground tabular-nums",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}>
          {value.toFixed(precision === 0.5 ? 1 : 0)}
        </span>
      )}
    </div>
  );
}
```

```typescript
// components/ui/rating-display.tsx
import * as React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  /** Rating value to display */
  value: number;
  /** Maximum rating */
  max?: number;
  /** Size variant */
  size?: "xs" | "sm" | "md";
  /** Show count of reviews */
  count?: number;
  /** Additional class names */
  className?: string;
}

const sizeStyles = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
};

export function RatingDisplay({
  value,
  max = 5,
  size = "sm",
  count,
  className,
}: RatingDisplayProps) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div 
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value} out of ${max} stars${count ? `, ${count} reviews` : ""}`}
    >
      {/* Full stars */}
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(sizeStyles[size], "fill-amber-400 text-amber-400")}
          aria-hidden="true"
        />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative" aria-hidden="true">
          <Star className={cn(sizeStyles[size], "text-muted-foreground/30")} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={cn(sizeStyles[size], "fill-amber-400 text-amber-400")} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(sizeStyles[size], "text-muted-foreground/30")}
          aria-hidden="true"
        />
      ))}
      
      {/* Review count */}
      {count !== undefined && (
        <span className={cn(
          "ml-1.5 text-muted-foreground",
          size === "xs" && "text-xs",
          size === "sm" && "text-sm",
          size === "md" && "text-base"
        )}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
```

### Key Implementation Notes

1. **Half-star Precision**: Mouse position detection for half-star input
2. **Keyboard Support**: Arrow keys, Home/End for full accessibility
3. **ARIA Slider**: Uses slider role for screen reader compatibility
4. **Visual Clipping**: CSS overflow for smooth partial star fills

## Variants

### Interactive Rating

```tsx
const [rating, setRating] = React.useState(0);

<Rating
  value={rating}
  onChange={setRating}
  label="Rate this product"
/>
```

### Half-star Precision

```tsx
<Rating
  value={3.5}
  onChange={setRating}
  precision={0.5}
/>
```

### Read-only Display

```tsx
<Rating
  value={4.2}
  readonly
  showValue
/>
```

### Compact Display

```tsx
<RatingDisplay
  value={4.5}
  count={1234}
  size="xs"
/>
```

### Different Sizes

```tsx
<Rating value={4} size="sm" readonly />
<Rating value={4} size="md" readonly />
<Rating value={4} size="lg" readonly />
```

## States

| State | Stars | Value | Cursor | Feedback |
|-------|-------|-------|--------|----------|
| Empty | outline | 0 | pointer | - |
| Hover | filled preview | - | pointer | scale 110% |
| Partial | clipped fill | 0.5-4.5 | pointer | - |
| Full | all filled | 5 | pointer | - |
| Readonly | based on value | - | default | none |
| Focused | ring visible | - | - | ring |
| Disabled | muted | - | not-allowed | - |

## Accessibility

### Required ARIA Attributes

- `role="slider"` for the container
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- `aria-valuetext` for human-readable value
- `aria-label` for the rating purpose

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Arrow Right/Up` | Increase rating |
| `Arrow Left/Down` | Decrease rating |
| `Home` | Set to minimum (0) |
| `End` | Set to maximum |
| `Tab` | Move focus to/from component |

### Screen Reader Announcements

- Announces current value as "X out of Y stars"
- Announces changes on arrow key navigation
- Review count announced when provided

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install lucide-react
```

## Examples

### Product Rating Form

```tsx
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReview({ productId, rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Your Rating</label>
        <Rating
          value={rating}
          onChange={setRating}
          precision={0.5}
          size="lg"
          className="mt-2"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Your Review</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="mt-2"
        />
      </div>
      
      <Button type="submit" disabled={rating === 0}>
        Submit Review
      </Button>
    </form>
  );
}
```

### Product Card with Rating

```tsx
import { RatingDisplay } from "@/components/ui/rating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <RatingDisplay
          value={product.averageRating}
          count={product.reviewCount}
          size="sm"
        />
      </CardHeader>
      <CardContent>
        <p className="text-lg font-bold">${product.price}</p>
      </CardContent>
    </Card>
  );
}
```

### Rating with Categories

```tsx
const categories = [
  { label: "Quality", key: "quality" },
  { label: "Value", key: "value" },
  { label: "Service", key: "service" },
];

export function DetailedRating() {
  const [ratings, setRatings] = React.useState({
    quality: 0,
    value: 0,
    service: 0,
  });

  return (
    <div className="space-y-4">
      {categories.map(({ label, key }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <Rating
            value={ratings[key]}
            onChange={(value) => setRatings((prev) => ({ ...prev, [key]: value }))}
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}
```

## Anti-patterns

### Missing Label

```tsx
// Bad - no accessible label
<Rating value={rating} onChange={setRating} />

// Good - descriptive label
<Rating
  value={rating}
  onChange={setRating}
  label="Rate your experience"
/>
```

### Unclear Rating Purpose

```tsx
// Bad - no context
<div>
  <Rating value={rating} onChange={setRating} />
</div>

// Good - clear context
<div>
  <label className="text-sm font-medium mb-2 block">
    How would you rate this product?
  </label>
  <Rating value={rating} onChange={setRating} />
</div>
```

### Read-only Without Value

```tsx
// Bad - shows stars but no numeric value
<RatingDisplay value={4.3} />

// Good - includes numeric context
<RatingDisplay value={4.3} showValue />
// Or with count
<RatingDisplay value={4.3} count={156} />
```

## Related Skills

### Composes From
- [atoms/display-icon](../atoms/display-icon.md) - Star icons
- [atoms/input-button](../atoms/input-button.md) - Clickable regions

### Composes Into
- [organisms/product-card](../organisms/product-card.md) - Product ratings
- [organisms/testimonials](../organisms/testimonials.md) - Review displays

### Alternatives
- [molecules/slider](./slider.md) - For continuous numeric input
- Emoji reactions - For simpler feedback systems

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with half-star precision
- Keyboard navigation support
- RatingDisplay component for read-only use
