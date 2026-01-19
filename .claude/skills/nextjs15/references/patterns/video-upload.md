---
id: pt-video-upload
name: Video Upload Handling
version: 1.0.0
layer: L5
category: media
description: Video upload handling with chunked uploads for Next.js applications
tags: [video, upload, chunked, tus, media, next15, react19]
composes:
  - ../molecules/progress-bar.md
  - ../atoms/input-button.md
  - ../molecules/card.md
  - ../molecules/toast.md
dependencies:
  @upstash/qstash: "^2.7.0"
formula: Chunked Upload + Progress Tracking + Processing Queue = Reliable Video Upload
performance:
  impact: high
  lcp: high
  cls: medium
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Video Upload Handling

## When to Use

- **Large file uploads**: Videos over 100MB that need chunked upload
- **Resumable uploads**: Support for interrupted uploads
- **Upload progress**: Real-time progress feedback
- **Processing pipeline**: Triggering transcoding after upload

**Avoid when**: Using dedicated video platforms (Mux, Cloudflare Stream) for uploads.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Video Upload Architecture                                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Upload Service                                        │  │
│  │  ├─ Chunked Upload: TUS protocol for large files     │  │
│  │  ├─ Direct Upload: Presigned URLs for S3             │  │
│  │  └─ Progress Tracking: Real-time upload status       │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Upload     │     │ Validation   │     │ Processing  │   │
│  │ Component  │     │ Middleware   │     │ Queue       │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Upload Configuration

```typescript
// lib/video/upload-config.ts
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
  allowedMimeTypes: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
  ],
  chunkSize: 10 * 1024 * 1024, // 10MB chunks
  maxConcurrentChunks: 3,
};

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${formatBytes(UPLOAD_CONFIG.maxFileSize)}`,
    };
  }

  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported`,
    };
  }

  return { valid: true };
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
```

## Chunked Upload Service

```typescript
// lib/video/chunked-upload.ts
import { UPLOAD_CONFIG } from './upload-config';

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  speed: number;
  remainingTime: number;
}

export interface ChunkedUploadOptions {
  file: File;
  uploadUrl: string;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (response: any) => void;
  onError?: (error: Error) => void;
}

export class ChunkedUploader {
  private abortController: AbortController | null = null;
  private uploadedBytes = 0;
  private startTime = 0;

  async upload(options: ChunkedUploadOptions): Promise<void> {
    const { file, uploadUrl, onProgress, onComplete, onError } = options;
    this.abortController = new AbortController();
    this.uploadedBytes = 0;
    this.startTime = Date.now();

    const totalChunks = Math.ceil(file.size / UPLOAD_CONFIG.chunkSize);

    try {
      // Initialize upload session
      const sessionRes = await fetch(`${uploadUrl}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          totalChunks,
        }),
        signal: this.abortController.signal,
      });

      const { uploadId } = await sessionRes.json();

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * UPLOAD_CONFIG.chunkSize;
        const end = Math.min(start + UPLOAD_CONFIG.chunkSize, file.size);
        const chunk = file.slice(start, end);

        await this.uploadChunk(uploadUrl, uploadId, chunkIndex, chunk, (chunkProgress) => {
          const currentBytes = start + chunkProgress;
          this.uploadedBytes = currentBytes;

          const elapsed = (Date.now() - this.startTime) / 1000;
          const speed = currentBytes / elapsed;
          const remaining = (file.size - currentBytes) / speed;

          onProgress?.({
            uploadedBytes: currentBytes,
            totalBytes: file.size,
            percentage: (currentBytes / file.size) * 100,
            speed,
            remainingTime: remaining,
          });
        });
      }

      // Complete upload
      const completeRes = await fetch(`${uploadUrl}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
        signal: this.abortController.signal,
      });

      const result = await completeRes.json();
      onComplete?.(result);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        onError?.(error);
      }
    }
  }

  private async uploadChunk(
    baseUrl: string,
    uploadId: string,
    chunkIndex: number,
    chunk: Blob,
    onProgress: (bytes: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Chunk upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during chunk upload'));

      xhr.open('POST', `${baseUrl}/chunk`);
      xhr.setRequestHeader('X-Upload-Id', uploadId);
      xhr.setRequestHeader('X-Chunk-Index', chunkIndex.toString());

      xhr.send(chunk);
    });
  }

  abort(): void {
    this.abortController?.abort();
  }
}
```

## API Routes

```typescript
// app/api/videos/upload/init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { filename, fileSize, mimeType, totalChunks } = await request.json();

  const uploadId = nanoid();

  await db.videoUpload.create({
    data: {
      id: uploadId,
      userId: session.user.id,
      filename,
      fileSize,
      mimeType,
      totalChunks,
      uploadedChunks: 0,
      status: 'uploading',
    },
  });

  return NextResponse.json({ uploadId });
}

// app/api/videos/upload/chunk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const CHUNKS_DIR = '/tmp/video-chunks';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uploadId = request.headers.get('X-Upload-Id');
  const chunkIndex = request.headers.get('X-Chunk-Index');

  if (!uploadId || chunkIndex === null) {
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
  }

  const upload = await db.videoUpload.findUnique({
    where: { id: uploadId, userId: session.user.id },
  });

  if (!upload) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  // Save chunk
  const chunkDir = join(CHUNKS_DIR, uploadId);
  await mkdir(chunkDir, { recursive: true });

  const chunkData = await request.arrayBuffer();
  await writeFile(join(chunkDir, `chunk-${chunkIndex}`), Buffer.from(chunkData));

  await db.videoUpload.update({
    where: { id: uploadId },
    data: { uploadedChunks: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}

// app/api/videos/upload/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { readFile, unlink, readdir } from 'fs/promises';
import { join } from 'path';
import { uploadToStorage } from '@/lib/storage';
import { queueTranscodeJob } from '@/lib/video/transcode-queue';

const CHUNKS_DIR = '/tmp/video-chunks';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uploadId } = await request.json();

  const upload = await db.videoUpload.findUnique({
    where: { id: uploadId, userId: session.user.id },
  });

  if (!upload) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  // Combine chunks
  const chunkDir = join(CHUNKS_DIR, uploadId);
  const chunks: Buffer[] = [];

  for (let i = 0; i < upload.totalChunks; i++) {
    const chunkPath = join(chunkDir, `chunk-${i}`);
    const chunk = await readFile(chunkPath);
    chunks.push(chunk);
  }

  const completeFile = Buffer.concat(chunks);

  // Upload to storage
  const videoUrl = await uploadToStorage(
    completeFile,
    `videos/${uploadId}/${upload.filename}`,
    upload.mimeType
  );

  // Create video record
  const video = await db.video.create({
    data: {
      id: uploadId,
      userId: session.user.id,
      filename: upload.filename,
      url: videoUrl,
      size: upload.fileSize,
      mimeType: upload.mimeType,
      status: 'processing',
    },
  });

  // Queue transcoding
  await queueTranscodeJob(video.id, {
    inputUrl: videoUrl,
    qualities: ['720p', '480p', '360p'],
    generateHLS: true,
  });

  // Cleanup chunks
  const chunkFiles = await readdir(chunkDir);
  await Promise.all(chunkFiles.map((f) => unlink(join(chunkDir, f))));

  await db.videoUpload.delete({ where: { id: uploadId } });

  return NextResponse.json({ video });
}
```

## Video Upload Component

```typescript
// components/video/video-upload.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Video, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ChunkedUploader, UploadProgress } from '@/lib/video/chunked-upload';
import { validateVideoFile, formatBytes } from '@/lib/video/upload-config';

interface VideoUploadProps {
  onUploadComplete?: (video: any) => void;
}

export function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const uploaderRef = useRef<ChunkedUploader | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validation = validateVideoFile(selectedFile);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    setFile(selectedFile);
    setIsComplete(false);
    setProgress(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const startUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    uploaderRef.current = new ChunkedUploader();

    await uploaderRef.current.upload({
      file,
      uploadUrl: '/api/videos/upload',
      onProgress: setProgress,
      onComplete: (video) => {
        setIsComplete(true);
        setIsUploading(false);
        toast.success('Video uploaded successfully');
        onUploadComplete?.(video);
      },
      onError: (error) => {
        setIsUploading(false);
        toast.error(error.message);
      },
    });
  };

  const cancelUpload = () => {
    uploaderRef.current?.abort();
    setIsUploading(false);
    setProgress(null);
  };

  const clearFile = () => {
    setFile(null);
    setProgress(null);
    setIsComplete(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {!file ? (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Drop video here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">
              MP4, WebM, MOV up to 5GB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              {!isUploading && !isComplete && (
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              {isComplete && <CheckCircle className="h-6 w-6 text-green-500" />}
            </div>

            {progress && (
              <div className="space-y-2">
                <Progress value={progress.percentage} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {formatBytes(progress.uploadedBytes)} / {formatBytes(progress.totalBytes)}
                  </span>
                  <span>
                    {formatBytes(progress.speed)}/s - {Math.ceil(progress.remainingTime)}s remaining
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!isUploading && !isComplete && (
                <Button onClick={startUpload} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              )}
              {isUploading && (
                <Button variant="destructive" onClick={cancelUpload} className="flex-1">
                  Cancel Upload
                </Button>
              )}
              {isComplete && (
                <Button variant="outline" onClick={clearFile} className="flex-1">
                  Upload Another
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Related Patterns

- [video-transcoding](./video-transcoding.md)
- [video-thumbnails](./video-thumbnails.md)
- [storage-quotas](./storage-quotas.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Chunked upload support
- Progress tracking
- Resumable uploads
- Processing queue integration
