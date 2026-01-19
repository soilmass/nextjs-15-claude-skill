---
id: p-aspect-ratios
name: Aspect Ratios
version: 2.0.0
layer: L0
category: layout
composes: []
description: Common aspect ratios for responsive media and containers
tags: [aspect-ratio, media, responsive, video, image, containers]
performance:
  impact: low
  lcp: positive
  cls: positive
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Aspect Ratios

## Overview

Aspect ratios define the proportional relationship between width and height. Using consistent aspect ratios ensures visual harmony and prevents layout shifts when loading media. CSS `aspect-ratio` property enables intrinsic sizing without padding hacks.

## Design Tokens

```css
/* Aspect Ratio Tokens */
:root {
  /* Common ratios */
  --aspect-square: 1 / 1;           /* 1:1 */
  --aspect-portrait: 3 / 4;         /* 3:4 - Portrait photos */
  --aspect-landscape: 4 / 3;        /* 4:3 - Classic photos */
  --aspect-wide: 16 / 9;            /* 16:9 - Video standard */
  --aspect-ultrawide: 21 / 9;       /* 21:9 - Cinematic */
  --aspect-golden: 1.618 / 1;       /* Golden ratio */
  
  /* Social media formats */
  --aspect-instagram-square: 1 / 1;
  --aspect-instagram-portrait: 4 / 5;
  --aspect-instagram-landscape: 1.91 / 1;
  --aspect-instagram-story: 9 / 16;
  --aspect-twitter-card: 2 / 1;
  --aspect-facebook-post: 1.91 / 1;
  --aspect-linkedin-post: 1.91 / 1;
  --aspect-og-image: 1200 / 630;    /* ~1.91:1 */
  
  /* Device screens */
  --aspect-phone: 9 / 16;           /* Modern phones */
  --aspect-phone-classic: 9 / 19.5; /* Tall phones */
  --aspect-tablet: 3 / 4;           /* iPad */
  --aspect-laptop: 16 / 10;         /* MacBook */
  --aspect-desktop: 16 / 9;         /* Monitor */
  
  /* Special formats */
  --aspect-card: 5 / 7;             /* Playing card */
  --aspect-a4: 1 / 1.414;           /* A4 paper */
  --aspect-letter: 8.5 / 11;        /* US Letter */
  --aspect-banner: 4 / 1;           /* Wide banner */
  --aspect-thumbnail: 16 / 9;       /* Video thumbnail */
}
```

## Aspect Ratio Reference

| Name | Ratio | Decimal | Use Case |
|------|-------|---------|----------|
| Square | 1:1 | 1.0 | Avatars, icons, Instagram |
| Portrait | 3:4 | 0.75 | Portrait photos, cards |
| Classic | 4:3 | 1.33 | Photos, presentations |
| Wide | 16:9 | 1.78 | Videos, hero images |
| Ultrawide | 21:9 | 2.33 | Cinematic, banners |
| Golden | 1.618:1 | 1.618 | Aesthetically pleasing |
| OG Image | 1200:630 | 1.91 | Social sharing |
| Story | 9:16 | 0.56 | Mobile stories |

## CSS Patterns

### Basic Aspect Ratio

```css
/* Modern aspect-ratio property */
.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

/* With object-fit for media */
.responsive-image {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
  object-position: center;
}

/* With max dimensions */
.constrained-video {
  aspect-ratio: 16 / 9;
  width: 100%;
  max-width: 800px;
  max-height: 450px;
}
```

### Responsive Aspect Ratios

```css
/* Change aspect ratio by viewport */
.hero-image {
  aspect-ratio: 1 / 1; /* Square on mobile */
  width: 100%;
  object-fit: cover;
}

@media (min-width: 640px) {
  .hero-image {
    aspect-ratio: 4 / 3; /* Landscape on tablet */
  }
}

@media (min-width: 1024px) {
  .hero-image {
    aspect-ratio: 16 / 9; /* Wide on desktop */
  }
}
```

### Aspect Ratio with Fallback

```css
/* Fallback for older browsers */
.video-wrapper {
  position: relative;
  width: 100%;
}

/* Padding-bottom hack fallback */
@supports not (aspect-ratio: 16 / 9) {
  .video-wrapper::before {
    content: '';
    display: block;
    padding-bottom: 56.25%; /* 9/16 = 0.5625 */
  }
  
  .video-wrapper > * {
    position: absolute;
    inset: 0;
  }
}

/* Modern browsers */
@supports (aspect-ratio: 16 / 9) {
  .video-wrapper {
    aspect-ratio: 16 / 9;
  }
}
```

## React Components

```tsx
// components/ui/aspect-ratio.tsx
'use client';

import * as React from 'react';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';
import { cn } from '@/lib/utils';

type AspectRatioValue =
  | 'square'
  | 'portrait'
  | 'landscape'
  | 'wide'
  | 'ultrawide'
  | 'golden'
  | 'story'
  | 'og'
  | number;

const ratioMap: Record<string, number> = {
  square: 1,
  portrait: 3 / 4,
  landscape: 4 / 3,
  wide: 16 / 9,
  ultrawide: 21 / 9,
  golden: 1.618,
  story: 9 / 16,
  og: 1200 / 630,
};

interface AspectRatioProps
  extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  ratio?: AspectRatioValue;
}

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ ratio = 'wide', className, ...props }, ref) => {
  const numericRatio = typeof ratio === 'number' ? ratio : ratioMap[ratio];

  return (
    <AspectRatioPrimitive.Root
      ref={ref}
      ratio={numericRatio}
      className={cn('overflow-hidden', className)}
      {...props}
    />
  );
});
AspectRatio.displayName = 'AspectRatio';

export { AspectRatio };
```

```tsx
// Usage examples
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';

// Video container
function VideoPlayer({ src }: { src: string }) {
  return (
    <AspectRatio ratio="wide">
      <video
        src={src}
        className="h-full w-full object-cover"
        controls
      />
    </AspectRatio>
  );
}

// Responsive image
function ResponsiveImage({ src, alt }: { src: string; alt: string }) {
  return (
    <AspectRatio ratio={16 / 9}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </AspectRatio>
  );
}

// Avatar
function Avatar({ src, name }: { src: string; name: string }) {
  return (
    <AspectRatio ratio="square" className="w-12 rounded-full">
      <Image
        src={src}
        alt={name}
        fill
        className="rounded-full object-cover"
      />
    </AspectRatio>
  );
}

// Card image
function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <AspectRatio ratio="landscape" className="rounded-t-lg">
      <Image
        src={src}
        alt={alt}
        fill
        className="rounded-t-lg object-cover"
      />
    </AspectRatio>
  );
}
```

## Media Query Integration

```tsx
// components/responsive-media.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ResponsiveMediaProps {
  src: string;
  alt: string;
  /** Aspect ratio for mobile */
  mobileRatio?: number;
  /** Aspect ratio for tablet */
  tabletRatio?: number;
  /** Aspect ratio for desktop */
  desktopRatio?: number;
  className?: string;
}

export function ResponsiveMedia({
  src,
  alt,
  mobileRatio = 1,
  tabletRatio = 4 / 3,
  desktopRatio = 16 / 9,
  className,
}: ResponsiveMediaProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        className
      )}
      style={{
        // CSS custom properties for responsive aspect ratio
        '--mobile-ratio': mobileRatio,
        '--tablet-ratio': tabletRatio,
        '--desktop-ratio': desktopRatio,
      } as React.CSSProperties}
    >
      <div
        className="relative w-full"
        style={{
          aspectRatio: 'var(--mobile-ratio)',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      
      <style jsx>{`
        @media (min-width: 640px) {
          div > div {
            aspect-ratio: var(--tablet-ratio);
          }
        }
        @media (min-width: 1024px) {
          div > div {
            aspect-ratio: var(--desktop-ratio);
          }
        }
      `}</style>
    </div>
  );
}
```

## Tailwind Integration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      aspectRatio: {
        // Standard ratios
        'square': '1 / 1',
        'portrait': '3 / 4',
        'landscape': '4 / 3',
        'wide': '16 / 9',
        'ultrawide': '21 / 9',
        'golden': '1.618 / 1',
        
        // Social media
        'instagram-portrait': '4 / 5',
        'instagram-story': '9 / 16',
        'twitter-card': '2 / 1',
        'og': '1200 / 630',
        
        // Custom
        'banner': '4 / 1',
        'card': '5 / 7',
      },
    },
  },
};

export default config;

// Usage with Tailwind
// <div className="aspect-wide">...</div>
// <div className="aspect-og">...</div>
// <div className="aspect-instagram-story">...</div>
```

## Common Patterns

### Video Embed

```tsx
function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <AspectRatio ratio="wide" className="rounded-lg bg-muted">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full rounded-lg"
      />
    </AspectRatio>
  );
}
```

### Image Gallery

```tsx
function ImageGallery({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* First image is featured (larger) */}
      <div className="col-span-2 row-span-2">
        <AspectRatio ratio="square">
          <Image src={images[0]} alt="" fill className="object-cover rounded-lg" />
        </AspectRatio>
      </div>
      
      {/* Remaining images */}
      {images.slice(1).map((src, i) => (
        <AspectRatio key={i} ratio="square">
          <Image src={src} alt="" fill className="object-cover rounded-lg" />
        </AspectRatio>
      ))}
    </div>
  );
}
```

### Social Share Preview

```tsx
function OGPreviewCard({ title, description, image }: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="max-w-lg rounded-lg border overflow-hidden">
      <AspectRatio ratio={1200 / 630}>
        <Image src={image} alt="" fill className="object-cover" />
      </AspectRatio>
      <div className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Stretching Content

```tsx
// Bad - Forces content to stretch
<div style={{ width: 300, height: 200 }}>
  <img src="..." style={{ width: '100%', height: '100%' }} />
</div>

// Good - Preserves aspect ratio
<AspectRatio ratio={3 / 2} className="w-[300px]">
  <img src="..." className="object-cover w-full h-full" />
</AspectRatio>
```

### Missing Object-fit

```tsx
// Bad - Image may be distorted
<AspectRatio ratio="wide">
  <img src="..." className="w-full h-full" />
</AspectRatio>

// Good - Image is cropped to fit
<AspectRatio ratio="wide">
  <img src="..." className="w-full h-full object-cover" />
</AspectRatio>
```

## Related Primitives

- [breakpoints](./breakpoints.md) - Responsive breakpoints
- [grid-systems](./grid-systems.md) - Layout grids
- [fluid-design](./fluid-design.md) - Fluid scaling

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
