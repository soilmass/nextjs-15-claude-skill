---
id: a-display-image
name: Image
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Optimized image with loading states and aspect ratios
tags: [display, image, media, optimization]
dependencies: []
performance:
  impact: high
  lcp: positive
  cls: positive
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Image

## Overview

The Image atom wraps Next.js's optimized Image component with consistent styling, loading states, and aspect ratio handling. It ensures images are optimized, lazy-loaded appropriately, and don't cause layout shift.

## When to Use

Use this skill when:
- Displaying any images (photos, illustrations, screenshots)
- Building image galleries or grids
- Creating responsive hero images
- Showing user-uploaded content

## Implementation

```typescript
// components/ui/image.tsx
"use client";

import * as React from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface ImageProps extends Omit<NextImageProps, "alt"> {
  alt: string; // Make alt required
  aspectRatio?: "square" | "video" | "portrait" | "wide" | "ultrawide" | number;
  fallback?: string;
  className?: string;
  containerClassName?: string;
}

const aspectRatios = {
  square: "1/1",
  video: "16/9",
  portrait: "3/4",
  wide: "21/9",
  ultrawide: "32/9",
};

export function Image({
  src,
  alt,
  aspectRatio,
  fallback = "/placeholder.svg",
  className,
  containerClassName,
  fill,
  ...props
}: ImageProps) {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const aspect = aspectRatio
    ? typeof aspectRatio === "number"
      ? `${aspectRatio}`
      : aspectRatios[aspectRatio]
    : undefined;

  const imageSrc = error ? fallback : src;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        containerClassName
      )}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      <NextImage
        src={imageSrc}
        alt={alt}
        fill={fill ?? !!aspect}
        className={cn(
          "object-cover transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        {...props}
      />
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
    </div>
  );
}
```

### Blur Placeholder Image

```typescript
// components/ui/image-blur.tsx
"use client";

import * as React from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface BlurImageProps extends NextImageProps {
  alt: string;
}

export function BlurImage({
  src,
  alt,
  className,
  ...props
}: BlurImageProps) {
  const [loading, setLoading] = React.useState(true);

  return (
    <NextImage
      src={src}
      alt={alt}
      className={cn(
        "transition-all duration-500",
        loading ? "scale-105 blur-lg" : "scale-100 blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      placeholder="blur"
      {...props}
    />
  );
}
```

### Avatar/Thumbnail Image

```typescript
// components/ui/thumbnail.tsx
import * as React from "react";
import { Image } from "./image";
import { cn } from "@/lib/utils";

interface ThumbnailProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const sizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-32 w-32",
  xl: "h-48 w-48",
};

const roundedness = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Thumbnail({
  src,
  alt,
  size = "md",
  rounded = "md",
  className,
}: ThumbnailProps) {
  return (
    <div className={cn(sizes[size], roundedness[rounded], "relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${parseInt(sizes[size].split("-")[1]) * 4}px`}
      />
    </div>
  );
}
```

## Variants

### Aspect Ratios

| Ratio | Value | Use Case |
|-------|-------|----------|
| square | 1:1 | Avatars, thumbnails |
| video | 16:9 | Videos, hero images |
| portrait | 3:4 | Portrait photos |
| wide | 21:9 | Cinematic banners |
| ultrawide | 32:9 | Panoramic images |

### Fill vs Fixed

```tsx
// Fill mode (requires parent positioning)
<div className="relative h-64">
  <Image src="/hero.jpg" alt="Hero" fill />
</div>

// Fixed dimensions
<Image src="/thumb.jpg" alt="Thumb" width={200} height={150} />
```

## Performance

### LCP Optimization

- Use `priority` for above-fold images
- Provide `sizes` attribute for responsive images
- Use appropriate `quality` setting (default: 75)

### CLS Prevention

- Always specify dimensions or aspect ratio
- Use placeholder while loading
- Container has defined size

## Accessibility

### Alt Text Requirements

- All images MUST have descriptive alt text
- Decorative images use `alt=""`
- Complex images need detailed descriptions

### Guidelines

```tsx
// Good - descriptive alt
<Image src="/team.jpg" alt="Team meeting in conference room" />

// Good - decorative image
<Image src="/pattern.svg" alt="" aria-hidden="true" />

// Bad - generic alt
<Image src="/chart.png" alt="Image" />
```

## Dependencies

```json
{
  "dependencies": {
    "next": "15.0.0"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Image } from "@/components/ui/image";

<Image
  src="/hero.jpg"
  alt="Mountain landscape at sunset"
  aspectRatio="video"
  priority
/>
```

### Responsive Image

```tsx
<Image
  src="/feature.jpg"
  alt="Feature illustration"
  aspectRatio="video"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Image Grid

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {images.map((image) => (
    <Image
      key={image.id}
      src={image.src}
      alt={image.alt}
      aspectRatio="square"
      className="rounded-lg"
    />
  ))}
</div>
```

### Hero Image

```tsx
<div className="relative h-[60vh] w-full">
  <Image
    src="/hero-bg.jpg"
    alt=""
    fill
    priority
    quality={90}
    className="object-cover"
  />
  <div className="absolute inset-0 bg-black/40" />
  <div className="absolute inset-0 flex items-center justify-center">
    <h1 className="text-white text-5xl font-bold">Hero Title</h1>
  </div>
</div>
```

### Product Image

```tsx
<div className="group relative">
  <Image
    src={product.image}
    alt={product.name}
    aspectRatio="portrait"
    className="rounded-lg transition-transform group-hover:scale-105"
  />
  {product.sale && (
    <Badge className="absolute top-2 right-2">Sale</Badge>
  )}
</div>
```

### With Fallback

```tsx
<Image
  src={user.avatarUrl}
  alt={user.name}
  fallback="/default-avatar.png"
  aspectRatio="square"
  className="rounded-full"
/>
```

### Blur Placeholder

```tsx
import { BlurImage } from "@/components/ui/image-blur";

<BlurImage
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

## Anti-patterns

### Missing Dimensions

```tsx
// Bad - can cause layout shift
<Image src="/photo.jpg" alt="Photo" />

// Good - with dimensions
<Image src="/photo.jpg" alt="Photo" width={800} height={600} />

// Or with aspect ratio
<Image src="/photo.jpg" alt="Photo" aspectRatio="video" />
```

### Missing Alt Text

```tsx
// Bad - no alt
<Image src="/team.jpg" />

// Good - descriptive alt
<Image src="/team.jpg" alt="Team members at company retreat" />
```

### Incorrect Priority

```tsx
// Bad - priority on below-fold image
<Image src="/footer-bg.jpg" alt="..." priority />

// Good - priority only for above-fold
<Image src="/hero.jpg" alt="..." priority />
```

## Related Skills

### Composes From
- [dark-mode](../primitives/dark-mode.md) - Image brightness adjustment
- [motion](../primitives/motion.md) - Loading transitions

### Composes Into
- [hero](../organisms/hero.md) - Hero background images
- [product-card](../organisms/product-card.md) - Product images
- [testimonials](../organisms/testimonials.md) - Author photos

### Related
- [display-avatar](./display-avatar.md) - User avatars
- [display-skeleton](./display-skeleton.md) - Loading placeholder

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Next.js Image
- Added aspect ratio handling
- Fallback and loading states
