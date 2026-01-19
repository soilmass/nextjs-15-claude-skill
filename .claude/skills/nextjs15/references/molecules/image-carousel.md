---
id: m-image-carousel
name: Image Carousel
version: 2.0.0
layer: L2
category: content
description: Image carousel/slider with navigation controls and indicators
tags: [carousel, slider, gallery, images, navigation, swipe]
formula: "ImageCarousel = Image(a-display-image) + Navigation(a-input-button) + Dots(a-display-badge)"
composes:
  - ../atoms/display-image.md
  - ../atoms/input-button.md
  - ../atoms/display-badge.md
dependencies:
  "embla-carousel-react": "^8.0.0"
performance:
  impact: medium
  lcp: high
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Image Carousel

## Overview

The Image Carousel molecule displays a collection of images in a slidable/swipeable container with navigation arrows and dot indicators. Built on Embla Carousel for smooth touch-friendly interactions.

## When to Use

Use this skill when:
- Displaying product images in e-commerce
- Creating image galleries or portfolios
- Building hero sliders or banners
- Showing testimonials with images

## Composition Diagram

```
+-----------------------------------------------+
|                Image Carousel                  |
+-----------------------------------------------+
|  +------------------------------------------+ |
|  |              Slide Container              | |
|  |  +------------------------------------+  | |
|  |  |         Image (a-display-image)    |  | |
|  |  |           [Product Photo]          |  | |
|  |  +------------------------------------+  | |
|  +------------------------------------------+ |
|                                               |
|  +------------------------------------------+ |
|  |  Navigation Controls                      | |
|  |  [<]                              [>]    | |
|  |  (a-input-button)     (a-input-button)   | |
|  +------------------------------------------+ |
|                                               |
|  +------------------------------------------+ |
|  |  Dot Indicators                          | |
|  |       o   o   *   o   o                  | |
|  |          (a-display-badge)               | |
|  +------------------------------------------+ |
+-----------------------------------------------+
```

## Atoms Used

- [display-image](../atoms/display-image.md) - Carousel images
- [input-button](../atoms/input-button.md) - Navigation arrows
- [display-badge](../atoms/display-badge.md) - Dot indicators

## Implementation

```typescript
// components/ui/image-carousel.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Auto-play interval in ms (0 to disable) */
  autoPlay?: number;
  /** Enable infinite loop */
  loop?: boolean;
  /** Aspect ratio of images */
  aspectRatio?: "video" | "square" | "portrait" | "wide";
  /** Show thumbnails below */
  showThumbnails?: boolean;
  className?: string;
}

export function ImageCarousel({
  images,
  showArrows = true,
  showDots = true,
  autoPlay = 0,
  loop = true,
  aspectRatio = "video",
  showThumbnails = false,
  className,
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const aspectStyles = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
  };

  const scrollPrev = React.useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play
  React.useEffect(() => {
    if (!autoPlay || !emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlay);
    return () => clearInterval(interval);
  }, [emblaApi, autoPlay]);

  return (
    <div className={cn("relative group", className)}>
      {/* Main carousel */}
      <div ref={emblaRef} className="overflow-hidden rounded-lg">
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={index}
              className={cn("relative flex-[0_0_100%]", aspectStyles[aspectRatio])}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 80vw"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!loop && !canScrollPrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-opacity",
              "hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
              "opacity-0 group-hover:opacity-100 focus:opacity-100"
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!loop && !canScrollNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-opacity",
              "hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
              "opacity-0 group-hover:opacity-100 focus:opacity-100"
            )}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                index === selectedIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === selectedIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "relative h-16 w-24 flex-shrink-0 rounded overflow-hidden",
                index === selectedIndex && "ring-2 ring-primary"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Variants

### Basic Carousel

```tsx
<ImageCarousel
  images={[
    { src: "/img1.jpg", alt: "Image 1" },
    { src: "/img2.jpg", alt: "Image 2" },
    { src: "/img3.jpg", alt: "Image 3" },
  ]}
/>
```

### With Thumbnails

```tsx
<ImageCarousel
  images={productImages}
  showThumbnails
  aspectRatio="square"
/>
```

### Auto-Playing

```tsx
<ImageCarousel
  images={heroImages}
  autoPlay={5000}
  aspectRatio="wide"
/>
```

### With Captions

```tsx
<ImageCarousel
  images={[
    { src: "/img1.jpg", alt: "Beach", caption: "Summer vacation 2024" },
    { src: "/img2.jpg", alt: "Mountains", caption: "Hiking trip" },
  ]}
/>
```

## States

| State | Arrows | Dots | Transition |
|-------|--------|------|------------|
| Default | visible on hover | visible | none |
| Dragging | hidden | visible | smooth |
| Auto-play | visible on hover | animated | timed |
| Single image | hidden | hidden | none |

## Accessibility

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus navigation buttons |
| `Enter/Space` | Activate button |
| `Left Arrow` | Previous slide (when focused) |
| `Right Arrow` | Next slide (when focused) |

### Screen Reader Announcements

- Current slide position announced
- Navigation buttons have aria-labels
- Dots indicate current selection

## Dependencies

```json
{
  "dependencies": {
    "embla-carousel-react": "^8.0.0",
    "lucide-react": "^0.460.0",
    "next": "^15.0.0"
  }
}
```

## Examples

### Product Gallery

```tsx
<ImageCarousel
  images={product.images.map((img) => ({
    src: img.url,
    alt: `${product.name} - ${img.variant}`,
  }))}
  showThumbnails
  aspectRatio="square"
/>
```

### Hero Banner

```tsx
<ImageCarousel
  images={banners}
  autoPlay={6000}
  aspectRatio="wide"
  showArrows
  showDots
/>
```

## Anti-patterns

### Missing Alt Text

```tsx
// Bad - no alt text
images={[{ src: "/img.jpg" }]}

// Good - descriptive alt
images={[{ src: "/img.jpg", alt: "Red sneakers side view" }]}
```

### Too Fast Auto-play

```tsx
// Bad - too fast, hard to read
<ImageCarousel autoPlay={1000} />

// Good - comfortable reading time
<ImageCarousel autoPlay={5000} />
```

## Related Skills

### Composes From
- [atoms/display-image](../atoms/display-image.md) - Images

### Composes Into
- [organisms/product-gallery](../organisms/product-gallery.md) - E-commerce

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Embla Carousel integration
- Navigation arrows and dots
- Thumbnail support
- Auto-play functionality
