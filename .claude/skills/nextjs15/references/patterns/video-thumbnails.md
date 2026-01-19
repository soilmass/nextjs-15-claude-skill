---
id: pt-video-thumbnails
name: Video Thumbnail Generation
version: 1.0.0
layer: L5
category: media
description: Video thumbnail generation and extraction for Next.js applications
tags: [video, thumbnails, ffmpeg, media, next15]
composes:
  - ../molecules/card.md
dependencies:
  sharp: "^0.33.0"
formula: FFmpeg + Frame Extraction + CDN Storage = Video Thumbnails
performance:
  impact: high
  lcp: high
  cls: medium
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Video Thumbnail Generation

## When to Use

- **Video galleries**: Displaying preview thumbnails for videos
- **Upload previews**: Showing thumbnail while video processes
- **Timeline scrubbing**: Multiple thumbnails for video seek preview
- **Social sharing**: Open Graph thumbnails for video content

**Avoid when**: Videos have pre-defined thumbnails, or using video platform embeds.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Video Thumbnail Architecture                                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Thumbnail Service                                     │  │
│  │  ├─ Frame Extraction: FFmpeg video processing        │  │
│  │  ├─ Sprite Generation: Timeline thumbnail strips     │  │
│  │  └─ CDN Upload: S3/R2 thumbnail storage              │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Single     │     │ Sprite       │     │ Animated    │   │
│  │ Thumbnail  │     │ Sheet        │     │ Preview     │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Thumbnail Service

```typescript
// lib/video/thumbnail-service.ts
import { spawn } from 'child_process';
import { writeFile, unlink, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { uploadToStorage, getStorageUrl } from '@/lib/storage';

export interface ThumbnailOptions {
  timestamp?: number; // seconds
  width?: number;
  height?: number;
  quality?: number;
}

export interface SpriteOptions {
  interval?: number; // seconds between frames
  columns?: number;
  width?: number;
  height?: number;
}

export interface ThumbnailResult {
  url: string;
  width: number;
  height: number;
}

export interface SpriteResult {
  url: string;
  vttUrl: string;
  frameCount: number;
  columns: number;
  width: number;
  height: number;
}

const TEMP_DIR = '/tmp/thumbnails';

export class ThumbnailService {
  async ensureTempDir(): Promise<void> {
    try {
      await mkdir(TEMP_DIR, { recursive: true });
    } catch {}
  }

  async extractThumbnail(
    videoUrl: string,
    options: ThumbnailOptions = {}
  ): Promise<ThumbnailResult> {
    const { timestamp = 1, width = 640, height = 360, quality = 85 } = options;

    await this.ensureTempDir();
    const outputPath = join(TEMP_DIR, `thumb-${nanoid()}.jpg`);

    await this.runFFmpeg([
      '-ss', timestamp.toString(),
      '-i', videoUrl,
      '-vframes', '1',
      '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
      '-q:v', Math.round((100 - quality) / 3).toString(),
      '-y',
      outputPath,
    ]);

    const buffer = await readFile(outputPath);
    const url = await uploadToStorage(buffer, `thumbnails/${nanoid()}.jpg`, 'image/jpeg');

    await unlink(outputPath).catch(() => {});

    return { url, width, height };
  }

  async extractMultipleThumbnails(
    videoUrl: string,
    timestamps: number[],
    options: Omit<ThumbnailOptions, 'timestamp'> = {}
  ): Promise<ThumbnailResult[]> {
    return Promise.all(
      timestamps.map((timestamp) =>
        this.extractThumbnail(videoUrl, { ...options, timestamp })
      )
    );
  }

  async generateSprite(
    videoUrl: string,
    duration: number,
    options: SpriteOptions = {}
  ): Promise<SpriteResult> {
    const { interval = 5, columns = 10, width = 160, height = 90 } = options;

    await this.ensureTempDir();
    const frameCount = Math.ceil(duration / interval);
    const rows = Math.ceil(frameCount / columns);
    const spriteId = nanoid();
    const framesDir = join(TEMP_DIR, `frames-${spriteId}`);
    const spritePath = join(TEMP_DIR, `sprite-${spriteId}.jpg`);

    await mkdir(framesDir, { recursive: true });

    // Extract frames
    await this.runFFmpeg([
      '-i', videoUrl,
      '-vf', `fps=1/${interval},scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
      '-q:v', '5',
      '-y',
      join(framesDir, 'frame-%04d.jpg'),
    ]);

    // Create sprite sheet
    await this.runFFmpeg([
      '-i', join(framesDir, 'frame-%04d.jpg'),
      '-vf', `tile=${columns}x${rows}`,
      '-q:v', '5',
      '-y',
      spritePath,
    ]);

    const spriteBuffer = await readFile(spritePath);
    const spriteUrl = await uploadToStorage(
      spriteBuffer,
      `sprites/${spriteId}.jpg`,
      'image/jpeg'
    );

    // Generate VTT file for video players
    const vttContent = this.generateVTT(frameCount, interval, columns, width, height);
    const vttUrl = await uploadToStorage(
      Buffer.from(vttContent),
      `sprites/${spriteId}.vtt`,
      'text/vtt'
    );

    // Cleanup
    await unlink(spritePath).catch(() => {});
    // Clean up frames directory
    const { readdir } = await import('fs/promises');
    const frames = await readdir(framesDir);
    await Promise.all(frames.map((f) => unlink(join(framesDir, f)).catch(() => {})));

    return {
      url: spriteUrl,
      vttUrl,
      frameCount,
      columns,
      width,
      height,
    };
  }

  private generateVTT(
    frameCount: number,
    interval: number,
    columns: number,
    width: number,
    height: number
  ): string {
    let vtt = 'WEBVTT\n\n';

    for (let i = 0; i < frameCount; i++) {
      const startTime = i * interval;
      const endTime = (i + 1) * interval;
      const x = (i % columns) * width;
      const y = Math.floor(i / columns) * height;

      vtt += `${this.formatVTTTime(startTime)} --> ${this.formatVTTTime(endTime)}\n`;
      vtt += `#xywh=${x},${y},${width},${height}\n\n`;
    }

    return vtt;
  }

  private formatVTTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  async generateAnimatedPreview(
    videoUrl: string,
    options: { startTime?: number; duration?: number; width?: number; fps?: number } = {}
  ): Promise<string> {
    const { startTime = 0, duration = 3, width = 320, fps = 10 } = options;

    await this.ensureTempDir();
    const outputPath = join(TEMP_DIR, `preview-${nanoid()}.gif`);

    await this.runFFmpeg([
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', videoUrl,
      '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      '-loop', '0',
      '-y',
      outputPath,
    ]);

    const buffer = await readFile(outputPath);
    const url = await uploadToStorage(buffer, `previews/${nanoid()}.gif`, 'image/gif');

    await unlink(outputPath).catch(() => {});

    return url;
  }

  private runFFmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);
      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed: ${stderr}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  async getVideoDuration(videoUrl: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        videoUrl,
      ]);

      let stdout = '';

      ffprobe.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          resolve(parseFloat(stdout.trim()));
        } else {
          reject(new Error('Failed to get video duration'));
        }
      });

      ffprobe.on('error', reject);
    });
  }
}

export const thumbnailService = new ThumbnailService();
```

## API Routes

```typescript
// app/api/videos/[id]/thumbnail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { thumbnailService } from '@/lib/video/thumbnail-service';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const video = await db.video.findUnique({
    where: { id: params.id },
  });

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  const { timestamp } = await request.json();

  const thumbnail = await thumbnailService.extractThumbnail(video.url, {
    timestamp: timestamp || video.duration / 2,
  });

  await db.video.update({
    where: { id: params.id },
    data: { thumbnailUrl: thumbnail.url },
  });

  return NextResponse.json(thumbnail);
}

// app/api/videos/[id]/sprite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { thumbnailService } from '@/lib/video/thumbnail-service';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const video = await db.video.findUnique({
    where: { id: params.id },
  });

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  const sprite = await thumbnailService.generateSprite(video.url, video.duration);

  await db.video.update({
    where: { id: params.id },
    data: {
      spriteUrl: sprite.url,
      spriteVttUrl: sprite.vttUrl,
    },
  });

  return NextResponse.json(sprite);
}
```

## Video Thumbnail Component

```typescript
// components/video/video-thumbnail.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoThumbnailProps {
  thumbnailUrl?: string;
  animatedPreviewUrl?: string;
  title: string;
  duration?: number;
  onClick?: () => void;
}

export function VideoThumbnail({
  thumbnailUrl,
  animatedPreviewUrl,
  title,
  duration,
  onClick,
}: VideoThumbnailProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSrc = isHovering && animatedPreviewUrl ? animatedPreviewUrl : thumbnailUrl;

  return (
    <Card
      className="relative overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      <div className="aspect-video relative bg-muted">
        {!imageLoaded && <Skeleton className="absolute inset-0" />}

        {currentSrc && (
          <Image
            src={currentSrc}
            alt={title}
            fill
            className={`object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            unoptimized={currentSrc.endsWith('.gif')}
          />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="h-6 w-6 text-black ml-1" />
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(duration)}
          </div>
        )}
      </div>
    </Card>
  );
}
```

## Thumbnail Selection Component

```typescript
// components/video/thumbnail-selector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Check, RefreshCw } from 'lucide-react';

interface ThumbnailSelectorProps {
  videoId: string;
  videoUrl: string;
  duration: number;
  currentThumbnail?: string;
  onSelect: (url: string) => void;
}

export function ThumbnailSelector({
  videoId,
  videoUrl,
  duration,
  currentThumbnail,
  onSelect,
}: ThumbnailSelectorProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(currentThumbnail || null);
  const [loading, setLoading] = useState(false);

  const generateThumbnails = async () => {
    setLoading(true);
    const timestamps = [
      duration * 0.1,
      duration * 0.25,
      duration * 0.5,
      duration * 0.75,
      duration * 0.9,
    ];

    try {
      const res = await fetch(`/api/videos/${videoId}/thumbnails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamps }),
      });

      const data = await res.json();
      setThumbnails(data.thumbnails.map((t: { url: string }) => t.url));
    } catch (error) {
      console.error('Failed to generate thumbnails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateThumbnails();
  }, [videoId]);

  const handleSelect = (url: string) => {
    setSelected(url);
    onSelect(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Select Thumbnail</h3>
        <Button variant="outline" size="sm" onClick={generateThumbnails} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {thumbnails.map((url, index) => (
          <Card
            key={index}
            className={`relative cursor-pointer overflow-hidden ${
              selected === url ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelect(url)}
          >
            <div className="aspect-video relative">
              <Image src={url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
              {selected === url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Related Patterns

- [video-upload](./video-upload.md)
- [video-player](./video-player.md)
- [image-optimization](./image-optimization.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- FFmpeg frame extraction
- Sprite sheet generation
- Animated preview GIFs
- VTT file generation
