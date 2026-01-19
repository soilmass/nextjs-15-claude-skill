---
id: pt-image-optimization
name: Image Optimization
version: 2.0.0
layer: L5
category: performance
description: Next.js Image component best practices for performance and Core Web Vitals
tags: [performance, images, optimization, lcp, next-image, next15]
composes: []
dependencies: []
formula: "image_optimization = next_image + responsive_sizes + priority_loading + blur_placeholder + format_optimization"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Image Optimization

## Overview

The Next.js Image component (`next/image`) provides automatic optimization, lazy loading, and proper sizing for optimal Core Web Vitals, especially LCP (Largest Contentful Paint). This pattern covers configuration, usage patterns, and common scenarios.

## When to Use

- **Hero images**: LCP optimization with priority loading
- **Product galleries**: Responsive images with proper sizes
- **Avatars**: Small images with specific dimensions
- **Background images**: Cover images with fill mode
- **Image-heavy pages**: Lazy loading for below-fold content
- **Remote images**: CDN-hosted images with optimization

## Composition Diagram

```
+------------------+
|   next/image     |
+------------------+
          |
    +-----+-----+-----+
    |     |     |     |
    v     v     v     v
+------+ +-----+ +------+ +--------+
|Width/ | |Fill | |Sizes | |Priority|
|Height | |Mode | |Prop  | |Flag    |
+------+ +-----+ +------+ +--------+
          |
          v
+------------------+
|  Next.js Loader  |
+------------------+
          |
    +-----+-----+
    |           |
    v           v
+------+  +----------+
|Resize|  |Format    |
|srcset|  |AVIF/WebP |
+------+  +----------+
          |
          v
+------------------+
|   CDN Delivery   |
+------------------+
```

## Basic Usage

```typescript
// components/product-image.tsx
import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function ProductImage({ src, alt, priority = false }: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={800}
      priority={priority}
      className="rounded-lg object-cover"
    />
  );
}
```

## Fill Mode for Responsive Containers

```typescript
// components/hero-image.tsx
import Image from "next/image";

export function HeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        priority // Above-fold hero images should be priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

// Card with cover image
export function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform hover:scale-105"
      />
    </div>
  );
}
```

## LCP Optimization

```typescript
// app/page.tsx
import Image from "next/image";

export default function HomePage() {
  return (
    <main>
      {/* Hero image - ALWAYS priority for LCP */}
      <section className="relative h-screen">
        <Image
          src="/hero.jpg"
          alt="Hero background"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-5xl font-bold text-white">Welcome</h1>
        </div>
      </section>

      {/* Below fold images - lazy loaded by default */}
      <section className="py-20">
        <div className="grid grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="33vw"
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
```

## Remote Image Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.acme.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
    ],
    // Device sizes for srcset generation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for smaller images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Output format
    formats: ["image/avif", "image/webp"],
    // Minimum cache time
    minimumCacheTTL: 60,
    // Disable static image optimization during dev
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default config;
```

## Responsive Images with Sizes

```typescript
// components/responsive-image.tsx
import Image from "next/image";

// Responsive grid item
export function GridImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      // 1 column on mobile, 2 on tablet, 3 on desktop
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover"
    />
  );
}

// Full-width banner
export function BannerImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      priority
      className="object-cover"
    />
  );
}

// Sidebar image
export function SidebarImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 100vw, 300px"
      className="object-cover"
    />
  );
}
```

## Placeholder and Loading States

```typescript
// components/image-with-placeholder.tsx
import Image from "next/image";

// Blur placeholder (for static images with blur data)
export function ImageWithBlur({ src, alt, blurDataURL }: {
  src: string;
  alt: string;
  blurDataURL: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      placeholder="blur"
      blurDataURL={blurDataURL}
      className="object-cover"
    />
  );
}

// Color placeholder
export function ImageWithColorPlaceholder({ src, alt, color }: {
  src: string;
  alt: string;
  color: string;
}) {
  return (
    <div 
      className="relative aspect-square overflow-hidden rounded-lg"
      style={{ backgroundColor: color }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
      />
    </div>
  );
}

// Skeleton placeholder
export function ImageWithSkeleton({ src, alt }: {
  src: string;
  alt: string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg">
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        onLoad={() => setIsLoading(false)}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
```

## Generate Blur Placeholder

```typescript
// lib/image-utils.ts
import { getPlaiceholder } from "plaiceholder";
import fs from "fs/promises";
import path from "path";

export async function getBlurDataURL(imagePath: string): Promise<string> {
  try {
    // For local images
    if (imagePath.startsWith("/")) {
      const buffer = await fs.readFile(
        path.join(process.cwd(), "public", imagePath)
      );
      const { base64 } = await getPlaiceholder(buffer);
      return base64;
    }

    // For remote images
    const response = await fetch(imagePath);
    const buffer = Buffer.from(await response.arrayBuffer());
    const { base64 } = await getPlaiceholder(buffer);
    return base64;
  } catch {
    // Fallback gradient
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48cmVjdCBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+";
  }
}

// Usage in Server Component
// app/products/[id]/page.tsx
import { getBlurDataURL } from "@/lib/image-utils";

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  const blurDataURL = await getBlurDataURL(product.image);

  return (
    <ImageWithBlur
      src={product.image}
      alt={product.name}
      blurDataURL={blurDataURL}
    />
  );
}
```

## Image Gallery

```typescript
// components/image-gallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GalleryImage {
  src: string;
  alt: string;
}

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 600px"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2",
              selectedIndex === index
                ? "border-primary"
                : "border-transparent"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Avatar Image

```typescript
// components/avatar.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

const sizes = {
  sm: { px: 32, class: "h-8 w-8" },
  md: { px: 40, class: "h-10 w-10" },
  lg: { px: 64, class: "h-16 w-16" },
  xl: { px: 96, class: "h-24 w-24" },
};

export function Avatar({ src, alt, size = "md", fallback }: AvatarProps) {
  const { px, class: sizeClass } = sizes[size];

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
          sizeClass
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-full overflow-hidden", sizeClass)}>
      <Image
        src={src}
        alt={alt}
        width={px}
        height={px}
        className="object-cover"
      />
    </div>
  );
}
```

## Background Image Pattern

```typescript
// components/section-with-background.tsx
import Image from "next/image";

export function SectionWithBackground({
  imageSrc,
  children,
}: {
  imageSrc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-[400px]">
      {/* Background image */}
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="100vw"
        quality={75}
        className="object-cover"
        aria-hidden="true"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 container py-20">
        {children}
      </div>
    </section>
  );
}
```

## Art Direction with Picture Element

```typescript
// For different images at different breakpoints, use native picture
// components/art-directed-image.tsx

export function ArtDirectedImage() {
  return (
    <picture>
      {/* Mobile image */}
      <source
        media="(max-width: 768px)"
        srcSet="/hero-mobile.jpg"
        type="image/jpeg"
      />
      {/* Desktop image */}
      <source
        media="(min-width: 769px)"
        srcSet="/hero-desktop.jpg"
        type="image/jpeg"
      />
      {/* Fallback */}
      <img
        src="/hero-desktop.jpg"
        alt="Hero image"
        className="w-full h-auto"
      />
    </picture>
  );
}
```

## Anti-patterns

### Don't Skip Alt Text

```typescript
// BAD
<Image src={product.image} alt="" />

// GOOD
<Image src={product.image} alt={product.name} />
```

### Don't Forget Sizes Prop with Fill

```typescript
// BAD - No sizes with fill causes oversized images
<Image src={src} alt={alt} fill />

// GOOD - Proper sizes for responsive behavior
<Image
  src={src}
  alt={alt}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Don't Use Priority Everywhere

```typescript
// BAD - All images priority (defeats the purpose)
{images.map((img) => (
  <Image src={img} priority />
))}

// GOOD - Only above-fold images
{images.map((img, i) => (
  <Image src={img} priority={i === 0} />
))}
```

## Related Skills

- [fonts](./fonts.md)
- [code-splitting](./code-splitting.md)
- [core-web-vitals](./core-web-vitals.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Fill mode patterns
- Blur placeholders
- Gallery component
