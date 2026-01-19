---
id: o-media-gallery
name: Media Gallery
version: 2.0.0
layer: L3
category: data
composes:
  - ../molecules/card.md
description: Image/video gallery with grid layout, lightbox viewer, and zoom controls
tags: [gallery, images, lightbox, media, photos, zoom]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "MediaGallery = Dialog(m-dialog) + Card(m-card) + Button(a-button) + Image(a-image)"
dependencies:
  - react
  - "@radix-ui/react-dialog"
  - framer-motion
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Media Gallery

## Overview

A comprehensive media gallery organism with responsive grid layout, lightbox viewer with zoom/pan controls, keyboard navigation, and support for images and videos.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MediaGallery                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Grid Layout:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │   │
│  │ │ Thumbnail │ │ Thumbnail │ │ Thumbnail │ │ Thumbnail │            │   │
│  │ │┌─────────┐│ │┌─────────┐│ │┌─────────┐│ │┌─────────┐│            │   │
│  │ ││ Image   ││ ││ Image   ││ ││ Image   ││ ││ Video   ││            │   │
│  │ ││(a-image)││ ││(a-image)││ ││(a-image)││ ││  ▶      ││            │   │
│  │ │└─────────┘│ │└─────────┘│ │└─────────┘│ │└─────────┘│            │   │
│  │ └───────────┘ └───────────┘ └───────────┘ └───────────┘            │   │
│  │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │   │
│  │ │ Thumbnail │ │ Thumbnail │ │ Thumbnail │ │ Thumbnail │            │   │
│  │ └───────────┘ └───────────┘ └───────────┘ └───────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Lightbox (Dialog m-dialog):                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │ │ Header                                                          │ │   │
│  │ │  1 / 8  Photo Title                                             │ │   │
│  │ │                     ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌─────┐ │ │   │
│  │ │                     │Button│ │Button│ │Button│ │Button│ │ [X] │ │ │   │
│  │ │                     │ [-]  │ │100%  │ │ [+]  │ │ ↓    │ │     │ │ │   │
│  │ │                     │ Zoom │ │      │ │ Zoom │ │ DL   │ │     │ │ │   │
│  │ │                     └──────┘ └──────┘ └──────┘ └──────┘ └─────┘ │ │   │
│  │ └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │    ┌──────┐  ┌─────────────────────────────────────┐  ┌──────┐     │   │
│  │    │Button│  │                                     │  │Button│     │   │
│  │    │  ◀   │  │          Main Image/Video           │  │  ▶   │     │   │
│  │    │ Prev │  │           (a-image)                 │  │ Next │     │   │
│  │    └──────┘  │                                     │  └──────┘     │   │
│  │              │                                     │               │   │
│  │              └─────────────────────────────────────┘               │   │
│  │                                                                     │   │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │ │ Thumbnail Strip                                                 │ │   │
│  │ │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │ │   │
│  │ │  │ 1  │ │ 2  │ │ 3  │ │ 4● │ │ 5  │ │ 6  │ │ 7  │ │ 8  │      │ │   │
│  │ │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘      │ │   │
│  │ └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/media-gallery.tsx
'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Play,
  Pause,
  Maximize2,
  Grid,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

interface MediaGalleryProps {
  items: MediaItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'square' | 'video' | 'auto';
  showCaptions?: boolean;
  enableLightbox?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  onItemClick?: (item: MediaItem, index: number) => void;
}

interface LightboxProps {
  items: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enableDownload?: boolean;
  enableShare?: boolean;
}

// Gallery Grid Styles
const gridCols = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
};

const gapSizes = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-4',
};

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: '',
};

// Gallery Thumbnail
function GalleryThumbnail({
  item,
  index,
  aspectRatio,
  showCaption,
  onClick,
}: {
  item: MediaItem;
  index: number;
  aspectRatio: MediaGalleryProps['aspectRatio'];
  showCaption: boolean;
  onClick: () => void;
}) {
  const thumbnailSrc = item.thumbnail || item.src;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <button
        onClick={onClick}
        className={cn(
          'relative w-full overflow-hidden rounded-lg bg-muted',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          aspectRatios[aspectRatio || 'square']
        )}
        aria-label={item.alt || `View ${item.type} ${index + 1}`}
      >
        {item.type === 'image' ? (
          <img
            src={thumbnailSrc}
            alt={item.alt || ''}
            className={cn(
              'h-full w-full object-cover transition-transform duration-300',
              'group-hover:scale-105'
            )}
            loading="lazy"
          />
        ) : (
          <>
            <img
              src={thumbnailSrc}
              alt={item.alt || ''}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                <Play className="h-6 w-6 text-foreground ml-1" />
              </div>
            </div>
          </>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/0 transition-colors',
            'group-hover:bg-black/20'
          )}
        />
      </button>

      {/* Caption */}
      {showCaption && item.title && (
        <div className="mt-2">
          <p className="font-medium text-sm truncate">{item.title}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground truncate">
              {item.description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Lightbox Component
function Lightbox({
  items,
  currentIndex,
  onIndexChange,
  open,
  onOpenChange,
  enableDownload,
  enableShare,
}: LightboxProps) {
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const currentItem = items[currentIndex];

  // Reset zoom on item change
  React.useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setIsVideoPlaying(false);
  }, [currentIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          onIndexChange(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
          break;
        case 'ArrowRight':
          onIndexChange(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
          break;
        case 'Escape':
          onOpenChange(false);
          break;
        case '+':
        case '=':
          setZoom((z) => Math.min(z + 0.5, 4));
          break;
        case '-':
          setZoom((z) => Math.max(z - 0.5, 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, items.length, onIndexChange, onOpenChange]);

  // Pan functionality
  const handleMouseDown = () => {
    if (zoom > 1) setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPosition((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Download
  const handleDownload = async () => {
    const response = await fetch(currentItem.src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentItem.title || `media-${currentIndex + 1}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: currentItem.title,
        url: currentItem.src,
      });
    } else {
      await navigator.clipboard.writeText(currentItem.src);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/95" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="text-white">
              <span className="font-medium">
                {currentIndex + 1} / {items.length}
              </span>
              {currentItem.title && (
                <span className="ml-4 text-white/70">{currentItem.title}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              {currentItem.type === 'image' && (
                <>
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
                    disabled={zoom <= 1}
                    className="rounded-full p-2 text-white hover:bg-white/10 disabled:opacity-50"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-white min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
                    disabled={zoom >= 4}
                    className="rounded-full p-2 text-white hover:bg-white/10 disabled:opacity-50"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                </>
              )}

              {enableDownload && (
                <button
                  onClick={handleDownload}
                  className="rounded-full p-2 text-white hover:bg-white/10"
                  aria-label="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}

              {enableShare && (
                <button
                  onClick={handleShare}
                  className="rounded-full p-2 text-white hover:bg-white/10"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              )}

              <Dialog.Close asChild>
                <button
                  className="rounded-full p-2 text-white hover:bg-white/10"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Main content */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-full max-w-full"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                }}
              >
                {currentItem.type === 'image' ? (
                  <img
                    src={currentItem.src}
                    alt={currentItem.alt || ''}
                    className="max-h-[80vh] max-w-[90vw] object-contain"
                    draggable={false}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={currentItem.src}
                    controls
                    className="max-h-[80vh] max-w-[90vw]"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {items.length > 1 && (
              <>
                <button
                  onClick={() =>
                    onIndexChange(
                      currentIndex > 0 ? currentIndex - 1 : items.length - 1
                    )
                  }
                  className="absolute left-4 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    onIndexChange(
                      currentIndex < items.length - 1 ? currentIndex + 1 : 0
                    )
                  }
                  className="absolute right-4 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {items.length > 1 && (
            <div className="flex justify-center gap-2 p-4 overflow-x-auto">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onIndexChange(index)}
                  className={cn(
                    'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg',
                    'ring-2 ring-offset-2 ring-offset-black transition-all',
                    index === currentIndex
                      ? 'ring-white'
                      : 'ring-transparent opacity-50 hover:opacity-75'
                  )}
                >
                  <img
                    src={item.thumbnail || item.src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Main Gallery Component
export function MediaGallery({
  items,
  columns = 4,
  gap = 'md',
  aspectRatio = 'square',
  showCaptions = false,
  enableLightbox = true,
  enableDownload = true,
  enableShare = true,
  onItemClick,
}: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleItemClick = (item: MediaItem, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
    if (enableLightbox) {
      setCurrentIndex(index);
      setLightboxOpen(true);
    }
  };

  return (
    <>
      <div
        className={cn('grid', gridCols[columns], gapSizes[gap])}
        role="list"
        aria-label="Media gallery"
      >
        {items.map((item, index) => (
          <GalleryThumbnail
            key={item.id}
            item={item}
            index={index}
            aspectRatio={aspectRatio}
            showCaption={showCaptions}
            onClick={() => handleItemClick(item, index)}
          />
        ))}
      </div>

      {enableLightbox && (
        <Lightbox
          items={items}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          enableDownload={enableDownload}
          enableShare={enableShare}
        />
      )}
    </>
  );
}
```

## Usage

### Basic Gallery

```tsx
import { MediaGallery } from '@/components/organisms/media-gallery';

const images = [
  { id: '1', type: 'image', src: '/photos/1.jpg', alt: 'Photo 1' },
  { id: '2', type: 'image', src: '/photos/2.jpg', alt: 'Photo 2' },
  { id: '3', type: 'video', src: '/videos/1.mp4', thumbnail: '/videos/1-thumb.jpg' },
];

export function PhotoGallery() {
  return (
    <MediaGallery
      items={images}
      columns={4}
      gap="md"
      aspectRatio="square"
    />
  );
}
```

### With Captions

```tsx
<MediaGallery
  items={[
    {
      id: '1',
      type: 'image',
      src: '/photos/sunset.jpg',
      title: 'Sunset at the beach',
      description: 'Beautiful sunset captured in Malibu',
    },
    // ...
  ]}
  showCaptions
  columns={3}
/>
```

### Portfolio Style

```tsx
<MediaGallery
  items={portfolioItems}
  columns={3}
  aspectRatio="video"
  gap="lg"
  enableDownload={false}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Grid View | Default gallery grid layout | Thumbnails displayed in responsive columns |
| Lightbox Open | Full-screen viewer active | Dark overlay, large image/video, navigation controls |
| Hover (Thumbnail) | Mouse over gallery item | Scale up effect (1.05x), dark overlay appears |
| Zoomed | Image zoomed in lightbox | Scale increases (up to 4x), cursor changes to grab |
| Panning | Dragging zoomed image | Cursor shows grabbing, image follows mouse movement |
| Video Playing | Video playback active | Video controls visible, play state tracked |
| Loading | Images loading lazily | Muted background placeholder until image loads |

## Anti-patterns

### Not resetting zoom/pan on image change

```tsx
// Bad: Zoom persists when navigating to next image
function Lightbox({ currentIndex }) {
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  // Zoom and position carry over to next image
  return <img style={{ transform: `scale(${zoom})` }} />;
}

// Good: Reset zoom and position when image changes
React.useEffect(() => {
  setZoom(1);
  setPosition({ x: 0, y: 0 });
  setIsVideoPlaying(false);
}, [currentIndex]);
```

### Missing keyboard navigation in lightbox

```tsx
// Bad: Only mouse navigation supported
function Lightbox({ items, currentIndex, onIndexChange }) {
  return (
    <div>
      <button onClick={() => onIndexChange(currentIndex - 1)}>Prev</button>
      <img src={items[currentIndex].src} />
      <button onClick={() => onIndexChange(currentIndex + 1)}>Next</button>
    </div>
  );
}

// Good: Full keyboard navigation support
React.useEffect(() => {
  if (!open) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        onIndexChange(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
        break;
      case 'ArrowRight':
        onIndexChange(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
        break;
      case 'Escape':
        onOpenChange(false);
        break;
      case '+':
      case '=':
        setZoom((z) => Math.min(z + 0.5, 4));
        break;
      case '-':
        setZoom((z) => Math.max(z - 0.5, 1));
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [open, currentIndex, items.length]);
```

### Not using lazy loading for thumbnails

```tsx
// Bad: All images load immediately
<img src={item.thumbnail || item.src} alt={item.alt} />

// Good: Lazy load thumbnails for better performance
<img
  src={item.thumbnail || item.src}
  alt={item.alt}
  loading="lazy"
  className="h-full w-full object-cover"
/>
```

### Video thumbnail without play indicator

```tsx
// Bad: Video thumbnail looks identical to image
{item.type === 'video' && (
  <img src={item.thumbnail} alt={item.alt} />
)}

// Good: Clear visual indicator for video content
{item.type === 'video' && (
  <>
    <img src={item.thumbnail} alt={item.alt} />
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
        <Play className="h-6 w-6 text-foreground ml-1" />
      </div>
    </div>
  </>
)}
```

## Related Skills

- `molecules/sortable-item` - For reorderable galleries
- `patterns/responsive-images` - Image optimization
- `templates/gallery-page` - Full gallery page

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation with grid layout
- Lightbox with zoom/pan
- Video support
- Keyboard navigation
- Download and share support
