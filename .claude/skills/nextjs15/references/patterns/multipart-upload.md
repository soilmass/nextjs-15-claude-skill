---
id: pt-multipart-upload
name: Multipart Upload
version: 2.0.0
layer: L5
category: data
description: Chunked file uploads with progress tracking, pause/resume, and parallel uploads
tags: [upload, multipart, chunked, progress, resume, parallel, large-files]
composes: []
formula: "MultipartUpload = ChunkSplitting + ParallelUpload + ProgressTracking + PauseResume + ChunkReassembly"
dependencies:
  - react
  - next
  - uuid
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Multipart Upload

## When to Use

- Uploading large files (videos, high-res images, archives) over 10MB
- Handling unreliable network connections that may drop mid-upload
- Providing pause/resume functionality for long uploads
- Showing detailed progress information to users
- Uploading to S3 or cloud storage with multipart APIs
- Building video upload features for user-generated content

## Composition Diagram

```
[Large File]
      |
      v
[Chunk Splitter] ---> [5MB chunks with index + hash]
      |
      v
[Upload Queue]
      |
      +---> [Parallel Upload Pool (3 concurrent)]
      |         |
      |         +---> [Chunk 0] --POST--> [/api/upload/chunk]
      |         +---> [Chunk 1] --POST--> [/api/upload/chunk]
      |         +---> [Chunk 2] --POST--> [/api/upload/chunk]
      |
      +---> [Progress Tracking] ---> [Update UI]
      |
      +---> [Retry Logic] ---> [Exponential Backoff]
      |
      v
[All Chunks Uploaded?]
      |
     [Yes]
      |
      v
[Complete Request] --POST--> [/api/upload/complete]
      |
      v
[Server Reassembles] ---> [Final File]
```

## Overview

Multipart upload breaks large files into smaller chunks for reliable uploads with progress tracking, pause/resume capability, and parallel chunk uploads. Essential for handling large files and unreliable network conditions.

## Implementation

### Upload Types and Configuration

```tsx
// lib/upload/types.ts
export interface ChunkMetadata {
  index: number;
  start: number;
  end: number;
  size: number;
  hash?: string;
}

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  chunks: ChunkMetadata[];
  uploadedChunks: Set<number>;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  progress: number;
  error?: string;
  url?: string;
}

export interface UploadConfig {
  chunkSize: number; // bytes
  maxParallelUploads: number;
  maxRetries: number;
  retryDelay: number; // ms
  endpoint: string;
}

export const DEFAULT_CONFIG: UploadConfig = {
  chunkSize: 5 * 1024 * 1024, // 5MB
  maxParallelUploads: 3,
  maxRetries: 3,
  retryDelay: 1000,
  endpoint: '/api/upload',
};
```

### Chunk Utilities

```tsx
// lib/upload/chunks.ts
import { ChunkMetadata } from './types';

export function createChunks(file: File, chunkSize: number): ChunkMetadata[] {
  const chunks: ChunkMetadata[] = [];
  let start = 0;
  let index = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push({
      index,
      start,
      end,
      size: end - start,
    });
    start = end;
    index++;
  }

  return chunks;
}

export async function hashChunk(chunk: Blob): Promise<string> {
  const buffer = await chunk.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getChunkBlob(file: File, chunk: ChunkMetadata): Blob {
  return file.slice(chunk.start, chunk.end);
}
```

### Upload Manager Hook

```tsx
// hooks/use-multipart-upload.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadFile,
  UploadConfig,
  DEFAULT_CONFIG,
  ChunkMetadata,
} from '@/lib/upload/types';
import { createChunks, getChunkBlob, hashChunk } from '@/lib/upload/chunks';

interface UseMultipartUploadOptions {
  config?: Partial<UploadConfig>;
  onProgress?: (fileId: string, progress: number) => void;
  onComplete?: (fileId: string, url: string) => void;
  onError?: (fileId: string, error: string) => void;
}

export function useMultipartUpload(options: UseMultipartUploadOptions = {}) {
  const config = { ...DEFAULT_CONFIG, ...options.config };
  const [files, setFiles] = useState<Map<string, UploadFile>>(new Map());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const updateFile = useCallback(
    (id: string, updates: Partial<UploadFile>) => {
      setFiles((prev) => {
        const next = new Map(prev);
        const file = next.get(id);
        if (file) {
          next.set(id, { ...file, ...updates });
        }
        return next;
      });
    },
    []
  );

  const uploadChunk = useCallback(
    async (
      uploadFile: UploadFile,
      chunk: ChunkMetadata,
      signal: AbortSignal
    ): Promise<boolean> => {
      const chunkBlob = getChunkBlob(uploadFile.file, chunk);
      const hash = await hashChunk(chunkBlob);

      const formData = new FormData();
      formData.append('file', chunkBlob);
      formData.append('uploadId', uploadFile.id);
      formData.append('chunkIndex', chunk.index.toString());
      formData.append('totalChunks', uploadFile.chunks.length.toString());
      formData.append('fileName', uploadFile.name);
      formData.append('fileSize', uploadFile.size.toString());
      formData.append('chunkHash', hash);

      let retries = 0;
      while (retries <= config.maxRetries) {
        try {
          const response = await fetch(`${config.endpoint}/chunk`, {
            method: 'POST',
            body: formData,
            signal,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          return true;
        } catch (error) {
          if (signal.aborted) {
            return false;
          }
          retries++;
          if (retries > config.maxRetries) {
            throw error;
          }
          await new Promise((r) => setTimeout(r, config.retryDelay * retries));
        }
      }

      return false;
    },
    [config]
  );

  const startUpload = useCallback(
    async (fileId: string) => {
      const uploadFile = files.get(fileId);
      if (!uploadFile || uploadFile.status === 'uploading') return;

      const controller = new AbortController();
      abortControllers.current.set(fileId, controller);

      updateFile(fileId, { status: 'uploading', error: undefined });

      const pendingChunks = uploadFile.chunks.filter(
        (c) => !uploadFile.uploadedChunks.has(c.index)
      );

      try {
        // Upload chunks in parallel batches
        for (let i = 0; i < pendingChunks.length; i += config.maxParallelUploads) {
          if (controller.signal.aborted) break;

          const batch = pendingChunks.slice(i, i + config.maxParallelUploads);
          const results = await Promise.all(
            batch.map((chunk) =>
              uploadChunk(uploadFile, chunk, controller.signal)
            )
          );

          if (results.every(Boolean)) {
            const newUploadedChunks = new Set(uploadFile.uploadedChunks);
            batch.forEach((c) => newUploadedChunks.add(c.index));

            const progress = Math.round(
              (newUploadedChunks.size / uploadFile.chunks.length) * 100
            );

            updateFile(fileId, {
              uploadedChunks: newUploadedChunks,
              progress,
            });

            options.onProgress?.(fileId, progress);
          }
        }

        // Complete the upload
        if (!controller.signal.aborted) {
          const completeResponse = await fetch(`${config.endpoint}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploadId: fileId,
              fileName: uploadFile.name,
              totalChunks: uploadFile.chunks.length,
            }),
          });

          if (completeResponse.ok) {
            const { url } = await completeResponse.json();
            updateFile(fileId, { status: 'completed', url, progress: 100 });
            options.onComplete?.(fileId, url);
          } else {
            throw new Error('Failed to complete upload');
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          const message =
            error instanceof Error ? error.message : 'Upload failed';
          updateFile(fileId, { status: 'error', error: message });
          options.onError?.(fileId, message);
        }
      } finally {
        abortControllers.current.delete(fileId);
      }
    },
    [files, config, updateFile, uploadChunk, options]
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const uploadFiles = newFiles.map((file) => {
        const id = uuidv4();
        const chunks = createChunks(file, config.chunkSize);

        return {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          chunks,
          uploadedChunks: new Set<number>(),
          status: 'pending' as const,
          progress: 0,
        };
      });

      setFiles((prev) => {
        const next = new Map(prev);
        uploadFiles.forEach((f) => next.set(f.id, f));
        return next;
      });

      return uploadFiles.map((f) => f.id);
    },
    [config.chunkSize]
  );

  const pauseUpload = useCallback((fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(fileId);
    }
    updateFile(fileId, { status: 'paused' });
  }, [updateFile]);

  const resumeUpload = useCallback(
    (fileId: string) => {
      startUpload(fileId);
    },
    [startUpload]
  );

  const cancelUpload = useCallback(
    async (fileId: string) => {
      const controller = abortControllers.current.get(fileId);
      if (controller) {
        controller.abort();
        abortControllers.current.delete(fileId);
      }

      // Notify server to clean up
      await fetch(`${config.endpoint}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: fileId }),
      }).catch(() => {});

      setFiles((prev) => {
        const next = new Map(prev);
        next.delete(fileId);
        return next;
      });
    },
    [config.endpoint]
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const next = new Map(prev);
      next.delete(fileId);
      return next;
    });
  }, []);

  return {
    files: Array.from(files.values()),
    addFiles,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    removeFile,
  };
}
```

### Upload Dropzone Component

```tsx
// components/upload-dropzone.tsx
'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Pause, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useMultipartUpload } from '@/hooks/use-multipart-upload';
import { UploadFile } from '@/lib/upload/types';

interface UploadDropzoneProps {
  accept?: string[];
  maxSize?: number; // bytes
  maxFiles?: number;
  onUploadComplete?: (files: { id: string; url: string }[]) => void;
}

export function UploadDropzone({
  accept = ['*/*'],
  maxSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10,
  onUploadComplete,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const {
    files,
    addFiles,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
  } = useMultipartUpload({
    onComplete: (fileId, url) => {
      console.log(`Upload complete: ${fileId} -> ${url}`);
    },
  });

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `File too large. Max size: ${formatBytes(maxSize)}`;
      }

      if (accept[0] !== '*/*') {
        const validType = accept.some((type) => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', ''));
          }
          return file.type === type;
        });

        if (!validType) {
          return `Invalid file type. Accepted: ${accept.join(', ')}`;
        }
      }

      return null;
    },
    [accept, maxSize]
  );

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles).slice(0, maxFiles - files.length);
      const validFiles: File[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          console.error(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        const ids = addFiles(validFiles);
        ids.forEach((id) => startUpload(id));
      }
    },
    [files.length, maxFiles, validateFile, addFiles, startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={accept.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Max {formatBytes(maxSize)} per file, up to {maxFiles} files
          </p>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onPause={() => pauseUpload(file.id)}
              onResume={() => resumeUpload(file.id)}
              onCancel={() => cancelUpload(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileItemProps {
  file: UploadFile;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

function FileItem({ file, onPause, onResume, onCancel }: FileItemProps) {
  const statusIcon = {
    pending: <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />,
    uploading: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
    paused: <Pause className="w-5 h-5 text-yellow-500" />,
    completed: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {statusIcon[file.status]}
          <div>
            <p className="font-medium truncate max-w-xs">{file.name}</p>
            <p className="text-sm text-gray-500">
              {formatBytes(file.size)} • {file.chunks.length} chunks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {file.status === 'uploading' && (
            <button
              onClick={onPause}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          {file.status === 'paused' && (
            <button
              onClick={onResume}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Resume"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          {file.status !== 'completed' && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full text-red-500"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            file.status === 'error'
              ? 'bg-red-500'
              : file.status === 'completed'
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${file.progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-sm text-gray-500">
          {file.uploadedChunks.size}/{file.chunks.length} chunks
        </span>
        <span className="text-sm font-medium">{file.progress}%</span>
      </div>

      {file.error && (
        <p className="text-sm text-red-500 mt-2">{file.error}</p>
      )}

      {file.url && (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline mt-2 block"
        >
          View uploaded file
        </a>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

### Server-Side API Routes

```tsx
// app/api/upload/chunk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'chunks');

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const file = formData.get('file') as Blob;
  const uploadId = formData.get('uploadId') as string;
  const chunkIndex = formData.get('chunkIndex') as string;
  const chunkHash = formData.get('chunkHash') as string;

  if (!file || !uploadId || !chunkIndex) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const uploadDir = path.join(UPLOAD_DIR, uploadId);
  
  // Create upload directory if it doesn't exist
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const chunkPath = path.join(uploadDir, `chunk-${chunkIndex}`);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(chunkPath, buffer);

  // Store chunk metadata
  const metaPath = path.join(uploadDir, 'metadata.json');
  let metadata: Record<string, unknown> = {};
  
  if (existsSync(metaPath)) {
    const { readFile } = await import('fs/promises');
    metadata = JSON.parse(await readFile(metaPath, 'utf-8'));
  }

  metadata[`chunk-${chunkIndex}`] = {
    index: parseInt(chunkIndex),
    hash: chunkHash,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
  };

  await writeFile(metaPath, JSON.stringify(metadata, null, 2));

  return NextResponse.json({ success: true, chunkIndex });
}
```

```tsx
// app/api/upload/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, writeFile, rm } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'chunks');
const FILES_DIR = path.join(process.cwd(), 'uploads', 'files');

export async function POST(request: NextRequest) {
  const { uploadId, fileName, totalChunks } = await request.json();

  const uploadDir = path.join(UPLOAD_DIR, uploadId);

  try {
    // Read all chunks in order
    const chunks: Buffer[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(uploadDir, `chunk-${i}`);
      const chunk = await readFile(chunkPath);
      chunks.push(chunk);
    }

    // Combine chunks
    const completeFile = Buffer.concat(chunks);

    // Save complete file
    const ext = path.extname(fileName);
    const finalFileName = `${uploadId}${ext}`;
    const finalPath = path.join(FILES_DIR, finalFileName);

    await writeFile(finalPath, completeFile);

    // Clean up chunks
    await rm(uploadDir, { recursive: true });

    const url = `/uploads/files/${finalFileName}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}
```

```tsx
// app/api/upload/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'chunks');

export async function POST(request: NextRequest) {
  const { uploadId } = await request.json();

  const uploadDir = path.join(UPLOAD_DIR, uploadId);

  if (existsSync(uploadDir)) {
    await rm(uploadDir, { recursive: true });
  }

  return NextResponse.json({ success: true });
}
```

## Variants

### S3 Multipart Upload

```tsx
// lib/upload/s3-multipart.ts
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function initiateS3MultipartUpload(
  bucket: string,
  key: string
) {
  const command = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);
  return response.UploadId;
}

export async function uploadS3Part(
  bucket: string,
  key: string,
  uploadId: string,
  partNumber: number,
  body: Buffer
) {
  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
    Body: body,
  });

  const response = await s3.send(command);
  return { ETag: response.ETag, PartNumber: partNumber };
}

export async function completeS3MultipartUpload(
  bucket: string,
  key: string,
  uploadId: string,
  parts: { ETag: string | undefined; PartNumber: number }[]
) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });

  const response = await s3.send(command);
  return response.Location;
}
```

### Web Worker Upload

```tsx
// workers/upload-worker.ts
const ctx: Worker = self as unknown as Worker;

ctx.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === 'UPLOAD_CHUNK') {
    const { chunk, endpoint, uploadId, chunkIndex, totalChunks, fileName } = payload;

    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', fileName);

    try {
      const response = await fetch(`${endpoint}/chunk`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        ctx.postMessage({ type: 'CHUNK_COMPLETE', chunkIndex });
      } else {
        ctx.postMessage({ type: 'CHUNK_ERROR', chunkIndex, error: 'Upload failed' });
      }
    } catch (error) {
      ctx.postMessage({ type: 'CHUNK_ERROR', chunkIndex, error: String(error) });
    }
  }
};
```

## Usage

```tsx
// app/upload/page.tsx
import { UploadDropzone } from '@/components/upload-dropzone';

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Upload Files</h1>
      
      <UploadDropzone
        accept={['image/*', 'video/*', 'application/pdf']}
        maxSize={500 * 1024 * 1024} // 500MB
        maxFiles={5}
        onUploadComplete={(files) => {
          console.log('All uploads complete:', files);
        }}
      />
    </div>
  );
}
```

## Related Skills

- [[image-processing]] - Image optimization after upload
- [[download-files]] - File download handling
- [[progress]] - Progress indicators
- [[drag-drop]] - Drag and drop interactions

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Chunked upload with progress tracking
- Pause/resume functionality
- Parallel chunk uploads
- S3 multipart upload variant
