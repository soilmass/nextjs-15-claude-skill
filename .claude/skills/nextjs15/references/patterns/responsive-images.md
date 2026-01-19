---
id: pt-responsive-images
name: Responsive Images
version: 2.0.0
layer: L5
category: data
description: Art direction, srcset, and responsive image optimization
tags: [images, responsive, srcset, art-direction, optimization]
composes: []
formula: "ResponsiveImage = NextImage + SrcsetSizes + BlurPlaceholder + ArtDirection + LazyLoading"
dependencies:
  - react
  - next
  - next/image
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: medium
  lcp: medium
  cls: low
---

# Responsive Images

## When to Use

- Displaying images that need to look good across all screen sizes
- Hero banners requiring different crops for mobile vs desktop (art direction)
- Image galleries and product catalogs with many images
- Pages where Core Web Vitals (LCP) optimization is critical
- Background images with text overlays
- User-uploaded content with varying aspect ratios

## Composition Diagram

```
[Image Source]
      |
      v
[Next.js Image Component]
      |
      +---> [srcset Generation] ---> [Device Sizes: 640, 750, 1080...]
      |
      +---> [Art Direction] ---> [<picture> + <source media="...">]
      |
      +---> [Blur Placeholder] ---> [LQIP / blurDataURL]
      |
      +---> [Lazy Loading] ---> [Intersection Observer]
      |
      v
[Optimized Output]
      |
      +---> [WebP/AVIF Format]
      +---> [Responsive srcset]
      +---> [Proper sizes attribute]
```

## Overview

Responsive image patterns using Next.js Image component with art direction, srcset optimization, blur placeholders, and lazy loading for optimal performance across devices.

## Implementation

### Optimized Image Component

```tsx
// components/images/optimized-image.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallback?: string;
  aspectRatio?: string;
  showLoadingState?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  aspectRatio,
  showLoadingState = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        className
      )}
      style={{ aspectRatio }}
    >
      <Image
        src={error ? fallback : src}
        alt={alt}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading && showLoadingState ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        {...props}
      />
      
      {isLoading && showLoadingState && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
    </div>
  );
}
```

### Art Direction Component

```tsx
// components/images/art-direction-image.tsx
import Image from 'next/image';

interface ImageSource {
  src: string;
  media: string;
  width: number;
  height: number;
}

interface ArtDirectionImageProps {
  sources: ImageSource[];
  defaultSrc: string;
  defaultWidth: number;
  defaultHeight: number;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function ArtDirectionImage({
  sources,
  defaultSrc,
  defaultWidth,
  defaultHeight,
  alt,
  priority = false,
  className,
}: ArtDirectionImageProps) {
  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.src}
          media={source.media}
          width={source.width}
          height={source.height}
        />
      ))}
      <Image
        src={defaultSrc}
        alt={alt}
        width={defaultWidth}
        height={defaultHeight}
        priority={priority}
        className="h-auto w-full"
      />
    </picture>
  );
}

// Usage example:
// <ArtDirectionImage
//   sources={[
//     { src: '/hero-mobile.jpg', media: '(max-width: 640px)', width: 640, height: 800 },
//     { src: '/hero-tablet.jpg', media: '(max-width: 1024px)', width: 1024, height: 600 },
//   ]}
//   defaultSrc="/hero-desktop.jpg"
//   defaultWidth={1920}
//   defaultHeight={800}
//   alt="Hero image"
// />
```

### Responsive Image with Sizes

```tsx
// components/images/responsive-image.tsx
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
}

// Common size presets
const sizePresets = {
  fullWidth: '100vw',
  halfWidth: '50vw',
  thirdWidth: '33vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  hero: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
  thumbnail: '(max-width: 640px) 50vw, 200px',
};

export function ResponsiveImage({
  src,
  alt,
  sizes = sizePresets.card,
  priority = false,
  fill = true,
  width,
  height,
  className,
  quality = 85,
}: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      priority={priority}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      quality={quality}
      className={className}
    />
  );
}

export { sizePresets };
```

### Blur Placeholder Component

```tsx
// components/images/blur-image.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BlurImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  blurDataURL?: string;
}

// Generate tiny blur placeholder from image
export async function generateBlurPlaceholder(imagePath: string): Promise<string> {
  // In production, this would be done at build time
  // Using a service like Plaiceholder or Sharp
  const response = await fetch(`/api/blur-placeholder?src=${encodeURIComponent(imagePath)}`);
  const { blurDataURL } = await response.json();
  return blurDataURL;
}

export function BlurImage({
  src,
  alt,
  blurDataURL,
  className,
  ...props
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      className={cn(
        'transition-all duration-500',
        isLoaded ? 'blur-0 scale-100' : 'blur-sm scale-105',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}
```

### Lazy Loading with Intersection Observer

```tsx
// components/images/lazy-image.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends ImageProps {
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  src,
  alt,
  threshold = 0.1,
  rootMargin = '200px',
  ...props
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef} className="relative">
      {isVisible ? (
        <Image src={src} alt={alt} {...props} />
      ) : (
        <div
          className="animate-pulse bg-gray-200 dark:bg-gray-800"
          style={{
            width: props.width,
            height: props.height,
          }}
        />
      )}
    </div>
  );
}
```

### Background Image Component

```tsx
// components/images/background-image.tsx
import Image from 'next/image';
import { ReactNode } from 'react';

interface BackgroundImageProps {
  src: string;
  alt: string;
  children: ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
  priority?: boolean;
}

export function BackgroundImage({
  src,
  alt,
  children,
  overlay = true,
  overlayOpacity = 0.5,
  className,
  priority = false,
}: BackgroundImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="100vw"
      />
      
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

### Image Gallery with Responsive Loading

```tsx
// components/images/image-gallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  thumbnail?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: number;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const goToPrev = () => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : null
    );
  };
  
  const goToNext = () => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : null
    );
  };

  return (
    <>
      {/* Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap * 4}px`,
        }}
      >
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Image
              src={image.thumbnail || image.src}
              alt={image.alt}
              fill
              sizes={`(max-width: 640px) 100vw, ${100 / columns}vw`}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="absolute left-4 rounded-full p-2 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 rounded-full p-2 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                width={images[selectedIndex].width}
                height={images[selectedIndex].height}
                className="max-h-[90vh] w-auto object-contain"
                priority
              />
            </motion.div>

            <div className="absolute bottom-4 text-white">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Next.js Image Configuration

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remote image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
    
    // Device sizes for srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes for srcset (smaller images)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Output format
    formats: ['image/avif', 'image/webp'],
    
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

module.exports = nextConfig;
```

## Usage

```tsx
// Basic optimized image
import { OptimizedImage } from '@/components/images/optimized-image';

<OptimizedImage
  src="/hero.jpg"
  alt="Hero image"
  fill
  priority
  aspectRatio="16/9"
/>

// Art direction for different viewports
import { ArtDirectionImage } from '@/components/images/art-direction-image';

<ArtDirectionImage
  sources={[
    { src: '/hero-mobile.jpg', media: '(max-width: 640px)', width: 640, height: 800 },
    { src: '/hero-tablet.jpg', media: '(max-width: 1024px)', width: 1024, height: 600 },
  ]}
  defaultSrc="/hero-desktop.jpg"
  defaultWidth={1920}
  defaultHeight={800}
  alt="Hero"
  priority
/>

// Responsive image with proper sizes
import { ResponsiveImage, sizePresets } from '@/components/images/responsive-image';

<div className="relative aspect-video">
  <ResponsiveImage
    src="/product.jpg"
    alt="Product"
    sizes={sizePresets.card}
    className="rounded-lg object-cover"
  />
</div>

// Background image with overlay
import { BackgroundImage } from '@/components/images/background-image';

<BackgroundImage
  src="/banner.jpg"
  alt="Banner"
  className="h-[400px]"
  overlayOpacity={0.6}
  priority
>
  <div className="flex h-full items-center justify-center">
    <h1 className="text-4xl font-bold text-white">Welcome</h1>
  </div>
</BackgroundImage>
```

## Related Skills

- [L2/image](../molecules/image.md) - Image molecule
- [L5/lazy-loading](./lazy-loading.md) - Lazy loading
- [L3/media-gallery](../organisms/media-gallery.md) - Gallery component

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with Next.js Image optimization
