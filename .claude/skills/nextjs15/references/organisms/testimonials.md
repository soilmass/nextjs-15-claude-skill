---
id: o-testimonials
name: Testimonials
version: 2.0.0
layer: L3
category: marketing
description: Customer testimonial section with quotes, avatars, and company logos
tags: [testimonials, reviews, quotes, social-proof, customers]
formula: "Testimonials = Card(m-card) + Avatar(m-avatar) + Rating(m-rating) + Button(a-button)"
composes:
  - ../molecules/card.md
  - ../molecules/avatar.md
  - ../molecules/rating.md
dependencies: [framer-motion, lucide-react]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Testimonials

## Overview

The Testimonials organism displays customer quotes and reviews in various layouts including carousel, grid, and single featured testimonial. Includes author information, company logos, and optional star ratings.

## When to Use

Use this skill when:
- Building social proof sections
- Displaying customer reviews
- Creating case study highlights
- Building trust indicators

## Composition Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ Testimonials                                                     │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Header: Title + Description                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ Card (m-card)                                           │     │
│  │ ┌─────────────────────────────────────────────────────┐ │     │
│  │ │ Rating (m-rating)  [★★★★★]                          │ │     │
│  │ └─────────────────────────────────────────────────────┘ │     │
│  │ ┌─────────────────────────────────────────────────────┐ │     │
│  │ │ Blockquote: "Customer testimonial text..."         │ │     │
│  │ └─────────────────────────────────────────────────────┘ │     │
│  │ ┌─────────────────────────────────────────────────────┐ │     │
│  │ │ Author Info                                        │ │     │
│  │ │ ┌──────────┐  Name                                 │ │     │
│  │ │ │ Avatar   │  Title at Company                     │ │     │
│  │ │ │(m-avatar)│                                       │ │     │
│  │ │ └──────────┘                                       │ │     │
│  │ └─────────────────────────────────────────────────────┘ │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Navigation: Button(a-button) [<] [●●●] [>]              │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [card](../molecules/card.md) - Testimonial cards
- [rating](../molecules/rating.md) - Star ratings

## Implementation

```typescript
// components/organisms/testimonials.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: string;
  quote: string;
  author: {
    name: string;
    title?: string;
    company?: string;
    avatar?: string;
  };
  companyLogo?: string;
  rating?: number;
}

interface TestimonialsProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Testimonials array */
  testimonials: Testimonial[];
  /** Layout variant */
  variant?: "carousel" | "grid" | "featured" | "masonry" | "wall";
  /** Number of columns (for grid) */
  columns?: 2 | 3;
  /** Auto-rotate carousel */
  autoRotate?: boolean;
  /** Auto-rotate interval in ms */
  rotateInterval?: number;
  /** Show rating stars */
  showRating?: boolean;
  /** Additional class names */
  className?: string;
}

export function Testimonials({
  title = "What our customers say",
  description,
  testimonials,
  variant = "carousel",
  columns = 3,
  autoRotate = false,
  rotateInterval = 5000,
  showRating = false,
  className,
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  // Auto-rotate carousel
  React.useEffect(() => {
    if (!autoRotate || variant !== "carousel") return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, testimonials.length, variant]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const renderTestimonialCard = (testimonial: Testimonial, index?: number) => (
    <Card className="h-full" key={testimonial.id}>
      <CardContent className="p-6 flex flex-col h-full">
        {/* Quote Icon */}
        <Quote className="h-8 w-8 text-primary/20 mb-4" />

        {/* Rating */}
        {showRating && testimonial.rating && (
          <div className="flex gap-0.5 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < testimonial.rating!
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}

        {/* Quote */}
        <blockquote className="flex-1 text-lg leading-relaxed mb-6">
          "{testimonial.quote}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-4 mt-auto">
          <Avatar>
            <AvatarImage
              src={testimonial.author.avatar}
              alt={testimonial.author.name}
            />
            <AvatarFallback>
              {testimonial.author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{testimonial.author.name}</p>
            {(testimonial.author.title || testimonial.author.company) && (
              <p className="text-sm text-muted-foreground truncate">
                {testimonial.author.title}
                {testimonial.author.title && testimonial.author.company && " at "}
                {testimonial.author.company}
              </p>
            )}
          </div>
          {testimonial.companyLogo && (
            <Image
              src={testimonial.companyLogo}
              alt={testimonial.author.company || "Company"}
              width={80}
              height={32}
              className="h-8 w-auto object-contain opacity-60"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className={cn("py-20 lg:py-32", className)}>
      <div className="container">
        {/* Header */}
        {(title || description) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Carousel Variant */}
        {variant === "carousel" && (
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -100 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTestimonialCard(testimonials[currentIndex])}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      index === currentIndex
                        ? "bg-primary"
                        : "bg-muted hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Grid Variant */}
        {variant === "grid" && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={cn(
              "grid gap-6",
              columns === 2 && "md:grid-cols-2",
              columns === 3 && "md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {renderTestimonialCard(testimonial)}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Featured Variant */}
        {variant === "featured" && testimonials.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Main testimonial */}
            <div className="lg:pr-8">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              <blockquote className="text-2xl lg:text-3xl font-medium leading-relaxed mb-8">
                "{testimonials[0].quote}"
              </blockquote>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={testimonials[0].author.avatar}
                    alt={testimonials[0].author.name}
                  />
                  <AvatarFallback>
                    {testimonials[0].author.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {testimonials[0].author.name}
                  </p>
                  <p className="text-muted-foreground">
                    {testimonials[0].author.title} at{" "}
                    {testimonials[0].author.company}
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary testimonials */}
            {testimonials.length > 1 && (
              <div className="space-y-6">
                {testimonials.slice(1, 4).map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-4">
                      <p className="text-sm mb-3 line-clamp-3">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={testimonial.author.avatar} />
                          <AvatarFallback>
                            {testimonial.author.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium">{testimonial.author.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {testimonial.author.company}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Masonry Variant */}
        {variant === "masonry" && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="break-inside-avoid">
                {renderTestimonialCard(testimonial)}
              </div>
            ))}
          </div>
        )}

        {/* Wall Variant */}
        {variant === "wall" && (
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}`}
                  className="w-[400px] shrink-0"
                >
                  {renderTestimonialCard(testimonial)}
                </div>
              ))}
            </div>
            {/* Gradient masks */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
```

### Key Implementation Notes

1. **Carousel Navigation**: Prev/next buttons and dot indicators
2. **Auto-rotate**: Optional automatic rotation with configurable interval
3. **Multiple Layouts**: Carousel, grid, featured, masonry, wall
4. **Animation**: Smooth transitions between testimonials

## Variants

### Carousel

```tsx
<Testimonials
  testimonials={testimonials}
  variant="carousel"
  autoRotate
  rotateInterval={5000}
/>
```

### Grid

```tsx
<Testimonials
  testimonials={testimonials}
  variant="grid"
  columns={3}
  showRating
/>
```

### Featured

```tsx
<Testimonials
  testimonials={testimonials}
  variant="featured"
/>
```

### Wall (Infinite Scroll)

```tsx
<Testimonials
  testimonials={testimonials}
  variant="wall"
/>
```

## Accessibility

### Required Attributes

- Carousel controls have aria-labels
- Quote elements use blockquote
- Author info is properly structured

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate to controls |
| `Enter/Space` | Activate navigation |
| `Arrow keys` | Navigate carousel |

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Testimonials displayed normally | Cards visible with quotes |
| Animating | Carousel transitioning | Slide/fade animation active |
| Paused | Auto-rotate paused on hover | Timer paused, current visible |
| Hover | Card being hovered | Subtle highlight effect |
| Active | Current carousel slide | Dot indicator filled |
| Loading | Images loading | Avatar placeholder visible |

## Anti-patterns

### 1. Not pausing auto-rotate on interaction

```tsx
// Bad: Carousel keeps rotating during user interaction
<Testimonials
  autoRotate
  rotateInterval={3000}
/>

// Good: Pause on hover/focus for better UX
const [isPaused, setIsPaused] = useState(false);

useEffect(() => {
  if (isPaused || !autoRotate) return;
  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, rotateInterval);
  return () => clearInterval(interval);
}, [isPaused, autoRotate, rotateInterval]);

<div
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
  onFocus={() => setIsPaused(true)}
  onBlur={() => setIsPaused(false)}
>
  {/* carousel content */}
</div>
```

### 2. Missing alt text for company logos

```tsx
// Bad: Empty alt on logos
<Image
  src={testimonial.companyLogo}
  alt=""
  width={80}
  height={32}
/>

// Good: Descriptive alt text
<Image
  src={testimonial.companyLogo}
  alt={`${testimonial.author.company} logo`}
  width={80}
  height={32}
/>
```

### 3. Hardcoding quote marks in content

```tsx
// Bad: Mixing quote marks in data and rendering
const testimonial = {
  quote: '"This product is amazing!"', // Quote marks in data
};
<blockquote>"{testimonial.quote}"</blockquote> // Double quotes rendered

// Good: Keep raw text, add quotes in rendering
const testimonial = {
  quote: 'This product is amazing!', // No quotes in data
};
<blockquote className="before:content-['"'] after:content-['"']">
  {testimonial.quote}
</blockquote>
```

### 4. Not handling long quotes gracefully

```tsx
// Bad: Long quotes break layout
<blockquote className="text-lg">
  {testimonial.quote}
</blockquote>

// Good: Limit lines and show full on expand
<blockquote className="text-lg line-clamp-4 group-hover:line-clamp-none">
  {testimonial.quote}
</blockquote>

// Or truncate with read more
{testimonial.quote.length > 200 ? (
  <>
    {testimonial.quote.slice(0, 200)}...
    <button onClick={() => setExpanded(true)}>Read more</button>
  </>
) : testimonial.quote}
```

## Related Skills

### Composes From
- [molecules/card](../molecules/card.md)
- [molecules/rating](../molecules/rating.md)

### Composes Into
- [templates/landing-page](../templates/landing-page.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Five layout variants
- Auto-rotate support
