---
id: pt-image-processing
name: Image Processing
version: 2.0.0
layer: L5
category: files
description: Server-side image manipulation with Sharp for resizing, optimization, and format conversion
tags: [images, sharp, resize, optimization, thumbnails, processing]
composes: []
dependencies:
  sharp: "^0.33.0"
formula: Sharp + S3 Storage + Background Jobs = Scalable Image Processing
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Resizing and cropping uploaded images
- Converting images to WebP/AVIF for optimization
- Generating thumbnails and responsive variants
- Adding watermarks to images
- Extracting and managing image metadata

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Image Processing Pipeline                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Upload                                                     │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Validation                                          │   │
│  │ - File type check (MIME)                            │   │
│  │ - Size validation                                   │   │
│  │ - Dimension limits                                  │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Sharp Processing                                    │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ - Resize to target dimensions                   │ │   │
│  │ │ - Convert to WebP/AVIF                          │ │   │
│  │ │ - Generate thumbnails                           │ │   │
│  │ │ - Apply watermark                               │ │   │
│  │ │ - Extract/strip metadata                        │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Storage (S3/R2/Cloudinary)                          │   │
│  │ original/ | thumbnails/ | optimized/                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Image Processing

Server-side image processing with Sharp for optimization and manipulation.

## Overview

This pattern covers:
- Image resizing and cropping
- Format conversion (WebP, AVIF)
- Optimization and compression
- Thumbnail generation
- Watermarking
- Metadata extraction
- Background processing

## Implementation

### Installation

```bash
npm install sharp
```

### Image Processing Service

```typescript
// lib/images/processor.ts
import sharp from 'sharp';
import { uploadFile, getSignedDownloadUrl } from '@/lib/storage/service';
import { s3Client, STORAGE_CONFIG } from '@/lib/storage/config';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export interface ProcessingOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  blur?: number;
  grayscale?: boolean;
  watermark?: {
    text?: string;
    image?: Buffer;
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity?: number;
  };
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  space: string;
  channels: number;
  hasAlpha: boolean;
  orientation?: number;
  exif?: Record<string, unknown>;
}

/**
 * Process an image buffer with options
 */
export async function processImage(
  input: Buffer,
  options: ProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    width,
    height,
    fit = 'cover',
    quality = 80,
    format = 'webp',
    blur,
    grayscale,
    watermark,
  } = options;

  let pipeline = sharp(input);

  // Resize
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit,
      withoutEnlargement: true,
    });
  }

  // Apply effects
  if (blur) {
    pipeline = pipeline.blur(blur);
  }

  if (grayscale) {
    pipeline = pipeline.grayscale();
  }

  // Add watermark
  if (watermark) {
    pipeline = await addWatermark(pipeline, watermark);
  }

  // Convert format
  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    format: info.format,
    size: info.size,
  };
}

/**
 * Add watermark to image
 */
async function addWatermark(
  pipeline: sharp.Sharp,
  watermark: ProcessingOptions['watermark']
): Promise<sharp.Sharp> {
  if (!watermark) return pipeline;

  const metadata = await pipeline.metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 600;

  let overlay: Buffer;

  if (watermark.text) {
    // Create text watermark
    const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .watermark { 
            fill: rgba(255,255,255,${watermark.opacity || 0.5}); 
            font-size: 24px; 
            font-family: Arial, sans-serif; 
          }
        </style>
        <text x="50%" y="50%" class="watermark" text-anchor="middle" dominant-baseline="middle">
          ${watermark.text}
        </text>
      </svg>
    `;
    overlay = Buffer.from(svgText);
  } else if (watermark.image) {
    overlay = watermark.image;
  } else {
    return pipeline;
  }

  // Calculate position
  const positions: Record<string, { left: number; top: number }> = {
    center: { left: Math.floor(width / 2), top: Math.floor(height / 2) },
    'top-left': { left: 20, top: 20 },
    'top-right': { left: width - 120, top: 20 },
    'bottom-left': { left: 20, top: height - 50 },
    'bottom-right': { left: width - 120, top: height - 50 },
  };

  const pos = positions[watermark.position || 'bottom-right'];

  return pipeline.composite([
    {
      input: overlay,
      gravity: watermark.position === 'center' ? 'center' : undefined,
      left: watermark.position !== 'center' ? pos.left : undefined,
      top: watermark.position !== 'center' ? pos.top : undefined,
    },
  ]);
}

/**
 * Get image metadata
 */
export async function getImageMetadata(input: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(input).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    space: metadata.space || 'unknown',
    channels: metadata.channels || 0,
    hasAlpha: metadata.hasAlpha || false,
    orientation: metadata.orientation,
    exif: metadata.exif ? parseExif(metadata.exif) : undefined,
  };
}

function parseExif(exifBuffer: Buffer): Record<string, unknown> {
  // Simplified EXIF parsing - use exif-parser for full support
  return {};
}

/**
 * Generate multiple sizes for responsive images
 */
export async function generateResponsiveSizes(
  input: Buffer,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): Promise<Map<number, ProcessedImage>> {
  const results = new Map<number, ProcessedImage>();
  const metadata = await sharp(input).metadata();
  const originalWidth = metadata.width || 1920;

  for (const size of sizes) {
    // Skip sizes larger than original
    if (size > originalWidth) continue;

    const processed = await processImage(input, {
      width: size,
      format: 'webp',
      quality: 80,
    });

    results.set(size, processed);
  }

  return results;
}

/**
 * Create blur placeholder (LQIP)
 */
export async function createBlurPlaceholder(input: Buffer): Promise<string> {
  const { data } = await sharp(input)
    .resize(10, 10, { fit: 'inside' })
    .blur()
    .webp({ quality: 20 })
    .toBuffer({ resolveWithObject: true });

  return `data:image/webp;base64,${data.toString('base64')}`;
}

/**
 * Validate image
 */
export async function validateImage(
  input: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    maxSize?: number;
    allowedFormats?: string[];
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxWidth = 4096,
    maxHeight = 4096,
    maxSize = 10 * 1024 * 1024,
    allowedFormats = ['jpeg', 'png', 'webp', 'gif'],
  } = options;

  try {
    const metadata = await sharp(input).metadata();

    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      return { valid: false, error: `Format ${metadata.format} not allowed` };
    }

    if (metadata.width && metadata.width > maxWidth) {
      return { valid: false, error: `Width exceeds ${maxWidth}px limit` };
    }

    if (metadata.height && metadata.height > maxHeight) {
      return { valid: false, error: `Height exceeds ${maxHeight}px limit` };
    }

    if (input.length > maxSize) {
      return { valid: false, error: `Size exceeds ${maxSize / 1024 / 1024}MB limit` };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid image file' };
  }
}
```

### Image Upload with Processing

```typescript
// lib/images/upload.ts
import { processImage, generateResponsiveSizes, createBlurPlaceholder, validateImage } from './processor';
import { uploadFile } from '@/lib/storage/service';
import { prisma } from '@/lib/prisma';

export interface ImageUploadResult {
  id: string;
  original: string;
  sizes: Record<number, string>;
  blurDataURL: string;
  width: number;
  height: number;
}

/**
 * Upload and process an image
 */
export async function uploadAndProcessImage(
  file: File | Buffer,
  userId: string,
  options: {
    generateSizes?: boolean;
    optimize?: boolean;
  } = {}
): Promise<ImageUploadResult> {
  const { generateSizes = true, optimize = true } = options;

  // Get buffer
  const buffer = file instanceof File 
    ? Buffer.from(await file.arrayBuffer())
    : file;

  // Validate
  const validation = await validateImage(buffer);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const filename = file instanceof File ? file.name : 'image.jpg';
  const baseName = filename.replace(/\.[^/.]+$/, '');

  // Process original (optimize if enabled)
  const original = optimize
    ? await processImage(buffer, { format: 'webp', quality: 85 })
    : { buffer, width: 0, height: 0, format: 'original', size: buffer.length };

  // Upload original
  const originalUpload = await uploadFile({
    userId,
    file: original.buffer,
    filename: `${baseName}.webp`,
    contentType: 'image/webp',
  });

  // Generate responsive sizes
  const sizesMap = generateSizes
    ? await generateResponsiveSizes(buffer)
    : new Map();

  const sizes: Record<number, string> = {};
  
  for (const [width, processed] of sizesMap) {
    const sizeUpload = await uploadFile({
      userId,
      file: processed.buffer,
      filename: `${baseName}-${width}w.webp`,
      contentType: 'image/webp',
    });
    sizes[width] = sizeUpload.url;
  }

  // Generate blur placeholder
  const blurDataURL = await createBlurPlaceholder(buffer);

  // Store in database
  const image = await prisma.image.create({
    data: {
      userId,
      originalKey: originalUpload.key,
      originalUrl: originalUpload.url,
      width: original.width,
      height: original.height,
      blurDataURL,
      sizes: sizes,
    },
  });

  return {
    id: image.id,
    original: originalUpload.url,
    sizes,
    blurDataURL,
    width: original.width,
    height: original.height,
  };
}
```

### Image Transformation API

```typescript
// app/api/images/[id]/route.ts
import { NextResponse } from 'next/server';
import { processImage } from '@/lib/images/processor';
import { s3Client, STORAGE_CONFIG } from '@/lib/storage/config';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  // Parse transformation params
  const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
  const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined;
  const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : 80;
  const format = (searchParams.get('f') as 'webp' | 'jpeg' | 'png' | 'avif') || 'webp';
  const fit = (searchParams.get('fit') as 'cover' | 'contain') || 'cover';

  // Get image from database
  const image = await prisma.image.findUnique({
    where: { id },
  });

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  // Check cache header
  const cacheKey = `${id}-${width}-${height}-${quality}-${format}-${fit}`;
  const etag = `"${Buffer.from(cacheKey).toString('base64')}"`;
  
  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304 });
  }

  // Fetch original from S3
  const s3Response = await s3Client.send(
    new GetObjectCommand({
      Bucket: STORAGE_CONFIG.bucket,
      Key: image.originalKey,
    })
  );

  const originalBuffer = Buffer.from(
    await s3Response.Body!.transformToByteArray()
  );

  // Process image
  const processed = await processImage(originalBuffer, {
    width,
    height,
    fit,
    quality,
    format,
  });

  // Return with cache headers
  return new NextResponse(processed.buffer, {
    headers: {
      'Content-Type': `image/${format}`,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': etag,
    },
  });
}
```

### Database Schema

```prisma
// prisma/schema.prisma
model Image {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  originalKey String
  originalUrl String
  width       Int
  height      Int
  blurDataURL String   @db.Text
  sizes       Json     // { 320: "url", 640: "url", ... }
  
  alt         String?
  caption     String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

### Optimized Image Component

```typescript
// components/images/optimized-image.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  id: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  blurDataURL?: string;
}

export function OptimizedImage({
  id,
  alt,
  width,
  height,
  sizes = '100vw',
  priority = false,
  className,
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Build srcSet for responsive images
  const srcSet = [320, 640, 768, 1024, 1280, 1920]
    .map((w) => `/api/images/${id}?w=${w}&f=webp ${w}w`)
    .join(', ');

  return (
    <div className={cn('overflow-hidden', className)}>
      <Image
        src={`/api/images/${id}?w=${width || 1920}&f=webp`}
        alt={alt}
        width={width || 1920}
        height={height || 1080}
        sizes={sizes}
        priority={priority}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
```

### Background Processing Job

```typescript
// lib/images/jobs.ts
import { Queue, Worker } from 'bullmq';
import { processImage, generateResponsiveSizes } from './processor';
import { uploadFile } from '@/lib/storage/service';
import { prisma } from '@/lib/prisma';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

interface ImageJobData {
  imageId: string;
  buffer: string; // Base64 encoded
  userId: string;
}

export const imageQueue = new Queue<ImageJobData>('image-processing', { connection });

export const imageWorker = new Worker<ImageJobData>(
  'image-processing',
  async (job) => {
    const { imageId, buffer, userId } = job.data;
    const imageBuffer = Buffer.from(buffer, 'base64');

    // Generate responsive sizes
    const sizes = await generateResponsiveSizes(imageBuffer);
    const sizeUrls: Record<number, string> = {};

    for (const [width, processed] of sizes) {
      const upload = await uploadFile({
        userId,
        file: processed.buffer,
        filename: `${imageId}-${width}w.webp`,
        contentType: 'image/webp',
      });
      sizeUrls[width] = upload.url;
    }

    // Update database
    await prisma.image.update({
      where: { id: imageId },
      data: { sizes: sizeUrls },
    });

    return { success: true };
  },
  { connection, concurrency: 3 }
);
```

## Anti-patterns

1. **Processing in request** - Use background jobs for heavy processing
2. **No caching** - Cache processed images with proper headers
3. **No size limits** - Validate dimensions before processing
4. **Synchronous processing** - Use streams for large images
5. **No format detection** - Validate image format server-side

## Related Skills

- [[file-storage]] - File storage patterns
- [[file-upload]] - Upload UI patterns
- [[background-jobs]] - Background processing
- [[image-optimization]] - Next.js image optimization

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial image processing pattern with Sharp
