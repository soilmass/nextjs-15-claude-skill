---
id: t-gallery-page
name: Gallery Page
version: 2.0.0
layer: L4
category: pages
description: Portfolio gallery page with lightbox and filtering
tags: [gallery, portfolio, images, lightbox, masonry]
performance:
  impact: medium
  lcp: medium
  cls: low
composes:
  - ../organisms/media-gallery.md
  - ../molecules/tabs.md
  - ../atoms/display-image.md
dependencies:
  - react
  - next
  - lucide-react
  - framer-motion
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
formula: "GalleryPage = MediaGallery(o-media-gallery) + Tabs(m-tabs) + DisplayImage(a-display-image)"
---

# Gallery Page

## Overview

A portfolio gallery page with masonry layout, category filtering, and lightbox viewing. Supports images, videos, and mixed media with lazy loading and animations.

## Composition Diagram

```
+------------------------------------------------------------------+
|                        GALLERY PAGE                               |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |                    Gallery Header                          |  |
|  |  [Icon] Title + Description                                |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    Gallery Filters                         |  |
|  |  [Tabs: m-tabs]                                            |  |
|  |  +----------+ +----------+ +----------+ +----------+       |  |
|  |  | All Work | | Photo    | | Design   | | Video    |  ...  |  |
|  |  +----------+ +----------+ +----------+ +----------+       |  |
|  |                                            [Sort Dropdown] |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              Media Gallery (o-media-gallery)               |  |
|  |  +-------------+ +-------------+ +-------------+           |  |
|  |  | DisplayImage| | DisplayImage| | DisplayImage|           |  |
|  |  | (a-display- | | (a-display- | | (a-display- |           |  |
|  |  |    image)   | |    image)   | |    image)   |           |  |
|  |  +-------------+ +-------------+ +-------------+           |  |
|  |  +-------------+ +-------------+ +-------------+           |  |
|  |  | DisplayImage| | DisplayImage| | DisplayImage|           |  |
|  |  +-------------+ +-------------+ +-------------+           |  |
|  |                    (Masonry Grid)                          |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                   Lightbox Overlay                         |  |
|  |  [<] +----------------------------------+ [>]              |  |
|  |      |         DisplayImage             |                  |  |
|  |      |       (Full Resolution)          |                  |  |
|  |      +----------------------------------+                  |  |
|  |      [Zoom] [Like] [Share] [Download]                      |  |
|  |      [Thumbnail Strip]                                     |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## When to Use

Use this skill when:
- Building portfolio galleries with filtering
- Creating image/video showcase pages
- Implementing lightbox viewing experiences
- Building masonry-style media layouts

## Implementation

### Gallery Page

```tsx
// app/gallery/page.tsx
import { Suspense } from 'react';
import { GalleryHeader } from '@/components/gallery/gallery-header';
import { GalleryFilters } from '@/components/gallery/gallery-filters';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { GallerySkeleton } from '@/components/gallery/gallery-skeleton';

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
  }>;
}

export const metadata = {
  title: 'Gallery | Portfolio',
  description: 'Explore our portfolio of work and creative projects',
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const category = params.category || 'all';
  const sort = params.sort || 'newest';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <GalleryHeader />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <GalleryFilters activeCategory={category} activeSort={sort} />
        
        <div className="mt-8">
          <Suspense fallback={<GallerySkeleton />}>
            <GalleryGrid category={category} sort={sort} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
```

### Gallery Header

```tsx
// components/gallery/gallery-header.tsx
import { Camera } from 'lucide-react';

export function GalleryHeader() {
  return (
    <header className="relative overflow-hidden bg-black px-4 py-20 text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-black to-blue-900/50" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex rounded-full bg-white/10 p-4 backdrop-blur-sm">
          <Camera className="h-10 w-10" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Our Gallery
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-300">
          A curated collection of our finest work, showcasing creativity and craftsmanship
          across various projects and collaborations.
        </p>
      </div>
    </header>
  );
}
```

### Gallery Filters

```tsx
// components/gallery/gallery-filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Work' },
  { id: 'photography', name: 'Photography' },
  { id: 'design', name: 'Design' },
  { id: 'illustration', name: 'Illustration' },
  { id: 'branding', name: 'Branding' },
  { id: 'video', name: 'Video' },
];

const sortOptions = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'popular', name: 'Most Popular' },
];

interface GalleryFiltersProps {
  activeCategory: string;
  activeSort: string;
}

export function GalleryFilters({ activeCategory, activeSort }: GalleryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || value === 'newest') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/gallery?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateFilter('category', cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800 dark:hover:bg-gray-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-gray-500" />
        <select
          value={activeSort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

### Gallery Grid

```tsx
// components/gallery/gallery-grid.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Expand, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { GalleryLightbox } from './gallery-lightbox';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  width: number;
  height: number;
  likes: number;
  views: number;
}

interface GalleryGridProps {
  category: string;
  sort: string;
}

async function getGalleryItems(category: string, sort: string): Promise<GalleryItem[]> {
  const params = new URLSearchParams();
  if (category !== 'all') params.set('category', category);
  if (sort !== 'newest') params.set('sort', sort);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/gallery?${params.toString()}`,
    { cache: 'no-store' }
  );

  if (!res.ok) throw new Error('Failed to fetch gallery');
  return res.json();
}

export function GalleryGrid({ category, sort }: GalleryGridProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getGalleryItems(category, sort)
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, [category, sort]);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          No items found in this category.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-4 break-inside-avoid"
          >
            <GalleryCard
              item={item}
              onClick={() => setLightboxIndex(index)}
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={items}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

function GalleryCard({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
      style={{
        aspectRatio: `${item.width} / ${item.height}`,
      }}
    >
      <Image
        src={item.thumbnail}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />

      {/* Video indicator */}
      {item.type === 'video' && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Play className="h-3 w-3" />
          Video
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/0 to-black/0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Expand icon */}
        <div className="flex justify-end">
          <span className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
            <Expand className="h-4 w-4 text-white" />
          </span>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-semibold text-white">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-300">{item.category}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {item.likes}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {item.views}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function GallerySkeleton() {
  const heights = [300, 400, 250, 350, 280, 320, 380, 260];

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {heights.map((height, i) => (
        <div
          key={i}
          className="mb-4 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
          style={{ height }}
        />
      ))}
    </div>
  );
}
```

### Gallery Lightbox

```tsx
// components/gallery/gallery-lightbox.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Heart,
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  width: number;
  height: number;
  likes: number;
  views: number;
}

interface GalleryLightboxProps {
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

export function GalleryLightbox({
  items,
  initialIndex,
  onClose,
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const currentItem = items[currentIndex];

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    setZoom(1);
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    setZoom(1);
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          setZoom((z) => Math.min(z + 0.25, 3));
          break;
        case '-':
          setZoom((z) => Math.max(z - 0.25, 0.5));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goToPrevious, goToNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Image Container */}
      <div
        className="relative flex h-full w-full items-center justify-center p-16"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-full max-w-full"
            style={{ transform: `scale(${zoom})` }}
          >
            {currentItem.type === 'video' ? (
              <video
                src={currentItem.src}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-lg"
              />
            ) : (
              <Image
                src={currentItem.src}
                alt={currentItem.title}
                width={currentItem.width}
                height={currentItem.height}
                className="max-h-[80vh] w-auto rounded-lg object-contain"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
        {/* Info */}
        <div className="text-white">
          <h3 className="text-lg font-semibold">{currentItem.title}</h3>
          <p className="text-sm text-gray-300">{currentItem.category}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="rounded-lg bg-white/10 p-2.5 text-white backdrop-blur-sm hover:bg-white/20"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="min-w-[3rem] text-center text-sm text-white">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            className="rounded-lg bg-white/10 p-2.5 text-white backdrop-blur-sm hover:bg-white/20"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <div className="mx-2 h-6 w-px bg-white/20" />
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`rounded-lg p-2.5 backdrop-blur-sm ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            className="rounded-lg bg-white/10 p-2.5 text-white backdrop-blur-sm hover:bg-white/20"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            className="rounded-lg bg-white/10 p-2.5 text-white backdrop-blur-sm hover:bg-white/20"
            aria-label="Download"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

        {/* Counter */}
        <div className="text-sm text-gray-400">
          {currentIndex + 1} / {items.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 gap-2">
        {items.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((item, i) => {
          const actualIndex = Math.max(0, currentIndex - 3) + i;
          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(actualIndex);
                setZoom(1);
              }}
              className={`relative h-12 w-12 overflow-hidden rounded-lg transition-all ${
                actualIndex === currentIndex
                  ? 'ring-2 ring-white'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              <Image
                src={item.thumbnail}
                alt=""
                fill
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
```

## Variants

### Grid Layout (Uniform)

```tsx
// components/gallery/gallery-grid-uniform.tsx
export function GalleryGridUniform({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative aspect-square overflow-hidden rounded-xl"
        >
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
```

### Infinite Scroll

```tsx
// components/gallery/gallery-infinite.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export function GalleryInfinite({ category }: { category: string }) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['gallery', category],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`/api/gallery?category=${category}&page=${pageParam}`).then(r => r.json()),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {data?.pages.flatMap((page) =>
          page.items.map((item: any) => (
            <GalleryCard key={item.id} item={item} />
          ))
        )}
      </div>
      
      <div ref={ref} className="mt-8 text-center">
        {isFetchingNextPage && <span>Loading more...</span>}
      </div>
    </div>
  );
}
```

## Usage

```tsx
// Basic gallery page
// Navigate to /gallery

// Filter by category
// Navigate to /gallery?category=photography

// Sort by popularity
// Navigate to /gallery?sort=popular
```

## Error States

### Gallery Fetch Error

```tsx
// components/gallery/gallery-error.tsx
'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GalleryError({ error }: { error?: Error }) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-800 dark:bg-red-900/20">
      <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
      <h3 className="mt-4 text-lg font-semibold text-red-800 dark:text-red-200">
        Failed to load gallery
      </h3>
      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
        {error?.message || 'Unable to fetch gallery items. Please try again.'}
      </p>
      <button
        onClick={() => router.refresh()}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
```

### Image Load Error

```tsx
// components/gallery/gallery-card-error.tsx
'use client';

import { useState } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export function GalleryCard({ item }: { item: GalleryItem }) {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
      >
        <ImageOff className="h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Failed to load</p>
        {retryCount < 3 && (
          <button
            onClick={() => {
              setError(false);
              setRetryCount((c) => c + 1);
            }}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <Image
      src={item.thumbnail}
      alt={item.title}
      fill
      className="object-cover"
      onError={() => setError(true)}
    />
  );
}
```

### Empty State

```tsx
// components/gallery/gallery-empty.tsx
import { ImageIcon } from 'lucide-react';
import Link from 'next/link';

export function GalleryEmpty({ category }: { category?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold">No items found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {category && category !== 'all'
          ? `No items found in the "${category}" category.`
          : 'No gallery items have been added yet.'}
      </p>
      {category && category !== 'all' && (
        <Link
          href="/gallery"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          View all items
        </Link>
      )}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Gallery Grid

```tsx
// components/gallery/responsive-gallery.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ResponsiveGallery({ items }: { items: GalleryItem[] }) {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(1);
      else if (window.innerWidth < 1024) setColumns(2);
      else if (window.innerWidth < 1280) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return (
    <div
      className={cn(
        'columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4',
        'sm:gap-4'
      )}
    >
      {items.map((item, index) => (
        <GalleryCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
```

### Mobile Filter Sheet

```tsx
// components/gallery/mobile-filters.tsx
'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { GalleryFilters } from './gallery-filters';

export function MobileGalleryFilters({
  activeCategory,
  activeSort,
}: {
  activeCategory: string;
  activeSort: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium sm:hidden"
      >
        <Filter className="h-4 w-4" />
        Filters
      </button>

      {/* Mobile sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-6 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <GalleryFilters
              activeCategory={activeCategory}
              activeSort={activeSort}
              onFilterChange={() => setIsOpen(false)}
              layout="vertical"
            />
          </div>
        </div>
      )}

      {/* Desktop filters */}
      <div className="hidden sm:block">
        <GalleryFilters activeCategory={activeCategory} activeSort={activeSort} />
      </div>
    </>
  );
}
```

### Mobile Lightbox

```tsx
// components/gallery/mobile-lightbox.tsx
'use client';

export function MobileLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: MobileLightboxProps) {
  // Touch gestures for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) onNavigate('next');
    if (isRightSwipe) onNavigate('prev');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button - larger touch target on mobile */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 sm:p-2"
      >
        <X className="h-6 w-6 sm:h-5 sm:w-5 text-white" />
      </button>

      {/* Navigation dots on mobile */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 sm:hidden">
        {items.slice(0, 10).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
            )}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/50 sm:hidden">
        Swipe to navigate
      </p>
    </div>
  );
}
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Grid columns | 1 | 2 | 3-4 |
| Gap | 12px | 16px | 16px |
| Filters | Bottom sheet | Inline | Inline |
| Lightbox nav | Swipe | Buttons | Buttons |
| Card padding | 12px | 16px | 16px |

## SEO Considerations

### Metadata Configuration

```tsx
// app/gallery/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Portfolio',
  description: 'Explore our portfolio of work and creative projects',
  openGraph: {
    title: 'Our Gallery',
    description: 'A curated collection of our finest work',
    images: ['/og-gallery.jpg'],
  },
};
```

### Dynamic Metadata for Items

```tsx
// app/gallery/[id]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getGalleryItem(id);

  return {
    title: `${item.title} | Gallery`,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      images: [item.src],
      type: 'article',
    },
  };
}
```

### Structured Data

```tsx
// components/gallery/gallery-structured-data.tsx
export function GalleryStructuredData({ items }: { items: GalleryItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Portfolio Gallery',
    description: 'A curated collection of creative work',
    image: items.map((item) => ({
      '@type': 'ImageObject',
      name: item.title,
      contentUrl: item.src,
      thumbnailUrl: item.thumbnail,
      description: item.category,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## Testing Strategies

### Component Testing

```tsx
// __tests__/gallery-page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import GalleryPage from '@/app/gallery/page';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { GalleryLightbox } from '@/components/gallery/gallery-lightbox';

const mockItems = [
  {
    id: '1',
    title: 'Test Image',
    category: 'photography',
    type: 'image' as const,
    src: '/test.jpg',
    thumbnail: '/test-thumb.jpg',
    width: 800,
    height: 600,
    likes: 10,
    views: 100,
  },
];

describe('GalleryPage', () => {
  it('renders gallery header', async () => {
    render(await GalleryPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('Our Gallery')).toBeInTheDocument();
  });

  it('displays filter buttons', async () => {
    render(await GalleryPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('All Work')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();
  });
});

describe('GalleryGrid', () => {
  it('renders gallery items', () => {
    render(<GalleryGrid items={mockItems} />);
    expect(screen.getByText('Test Image')).toBeInTheDocument();
  });

  it('opens lightbox on click', () => {
    const onOpen = vi.fn();
    render(<GalleryGrid items={mockItems} onItemClick={onOpen} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledWith(0);
  });
});

describe('GalleryLightbox', () => {
  it('navigates with keyboard', () => {
    const onClose = vi.fn();
    render(
      <GalleryLightbox items={mockItems} initialIndex={0} onClose={onClose} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows zoom controls', () => {
    render(
      <GalleryLightbox items={mockItems} initialIndex={0} onClose={() => {}} />
    );

    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
  });
});
```

### E2E Testing

```tsx
// e2e/gallery.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Gallery Page', () => {
  test('displays gallery with filters', async ({ page }) => {
    await page.goto('/gallery');

    await expect(page.getByText('Our Gallery')).toBeVisible();
    await expect(page.locator('[data-testid="gallery-item"]').first()).toBeVisible();
  });

  test('filters by category', async ({ page }) => {
    await page.goto('/gallery');

    await page.click('text=Photography');
    await expect(page).toHaveURL(/category=photography/);
  });

  test('opens lightbox', async ({ page }) => {
    await page.goto('/gallery');

    await page.click('[data-testid="gallery-item"]');
    await expect(page.locator('[data-testid="lightbox"]')).toBeVisible();
  });

  test('lightbox navigation works', async ({ page }) => {
    await page.goto('/gallery');
    await page.click('[data-testid="gallery-item"]');

    // Navigate with arrows
    await page.click('[aria-label="Next image"]');
    await page.click('[aria-label="Previous image"]');

    // Close with escape
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="lightbox"]')).not.toBeVisible();
  });

  test('mobile filters open in sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/gallery');

    await page.click('text=Filters');
    await expect(page.locator('[data-testid="filter-sheet"]')).toBeVisible();
  });
});
```

### Accessibility Testing

```tsx
// __tests__/gallery-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import GalleryPage from '@/app/gallery/page';
import { GalleryLightbox } from '@/components/gallery/gallery-lightbox';

expect.extend(toHaveNoViolations);

describe('Gallery Accessibility', () => {
  it('gallery page has no violations', async () => {
    const { container } = render(await GalleryPage({ searchParams: Promise.resolve({}) }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('images have alt text', async () => {
    const { container } = render(await GalleryPage({ searchParams: Promise.resolve({}) }));
    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('lightbox has focus trap', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        initialIndex={0}
        onClose={() => {}}
      />
    );

    // First focusable element should be close button
    expect(document.activeElement).toBe(
      screen.getByLabelText('Close lightbox')
    );
  });
});
```

## Related Skills

- [L3/media-gallery](../organisms/media-gallery.md) - Media gallery organism
- [L2/image](../molecules/image.md) - Image component
- [L5/lazy-loading](../patterns/lazy-loading.md) - Lazy loading pattern

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with masonry grid and lightbox
