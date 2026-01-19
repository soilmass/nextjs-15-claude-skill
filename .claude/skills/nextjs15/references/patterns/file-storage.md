---
id: pt-file-storage
name: File Storage
version: 2.0.0
layer: L5
category: files
description: Cloud file storage with S3-compatible providers, signed URLs, and access control
tags: [storage, s3, files, upload, download, cloud]
composes: []
dependencies:
  @vercel/blob: "^0.27.0"
formula: S3 Client + Presigned URLs + ACL + CDN = Secure Scalable Storage
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Storing user-uploaded files in S3/R2/Cloudflare
- Generating presigned URLs for direct upload/download
- Managing file access control and permissions
- Integrating CDN for optimized file delivery
- Supporting multiple storage providers

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Cloud Storage Architecture                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ S3 Client Configuration                             │   │
│  │ - AWS S3 / Cloudflare R2 / DigitalOcean Spaces     │   │
│  │ - Region, bucket, credentials                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Storage Operations                                  │   │
│  │                                                     │   │
│  │ Upload:                                             │   │
│  │ 1. Generate presigned PUT URL (with expiry)         │   │
│  │ 2. Client uploads directly to storage               │   │
│  │ 3. Store metadata in database                       │   │
│  │                                                     │   │
│  │ Download:                                           │   │
│  │ 1. Verify access permissions                        │   │
│  │ 2. Generate presigned GET URL (with expiry)         │   │
│  │ 3. Redirect or proxy to client                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CDN Layer (Optional)                                │   │
│  │ CloudFront / Cloudflare → S3 Bucket                │   │
│  │ - Cache static assets                               │   │
│  │ - Edge delivery                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# File Storage

Manage file storage with S3-compatible cloud storage providers.

## Overview

This pattern covers:
- S3 client configuration
- File upload and download
- Presigned URLs for secure access
- Access control and permissions
- File metadata management
- CDN integration
- Multi-provider support

## Implementation

### Installation

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Storage Configuration

```typescript
// lib/storage/config.ts
import { S3Client } from '@aws-sdk/client-s3';

export const STORAGE_CONFIG = {
  bucket: process.env.S3_BUCKET!,
  region: process.env.S3_REGION || 'us-east-1',
  cdnUrl: process.env.CDN_URL, // Optional CloudFront URL
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    video: ['video/mp4', 'video/webm'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  },
};

// S3 Client (works with AWS S3, Cloudflare R2, MinIO, etc.)
export const s3Client = new S3Client({
  region: STORAGE_CONFIG.region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  // For non-AWS providers
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  }),
});

// File path helpers
export function getFilePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2);
  const ext = filename.split('.').pop();
  return `uploads/${userId}/${timestamp}-${randomId}.${ext}`;
}

export function getPublicUrl(key: string): string {
  if (STORAGE_CONFIG.cdnUrl) {
    return `${STORAGE_CONFIG.cdnUrl}/${key}`;
  }
  return `https://${STORAGE_CONFIG.bucket}.s3.${STORAGE_CONFIG.region}.amazonaws.com/${key}`;
}
```

### Storage Service

```typescript
// lib/storage/service.ts
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, STORAGE_CONFIG, getFilePath, getPublicUrl } from './config';
import { prisma } from '@/lib/prisma';

export interface UploadOptions {
  userId: string;
  file: File | Buffer;
  filename: string;
  contentType: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  id: string;
  key: string;
  url: string;
  size: number;
  contentType: string;
}

/**
 * Upload a file to storage
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { userId, file, filename, contentType, isPublic = false, metadata } = options;

  // Validate file type
  const allowedTypes = Object.values(STORAGE_CONFIG.allowedTypes).flat();
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`File type ${contentType} is not allowed`);
  }

  // Get file buffer
  const buffer = file instanceof File 
    ? Buffer.from(await file.arrayBuffer())
    : file;

  // Validate file size
  if (buffer.length > STORAGE_CONFIG.maxFileSize) {
    throw new Error(`File size exceeds ${STORAGE_CONFIG.maxFileSize / 1024 / 1024}MB limit`);
  }

  // Generate file path
  const key = getFilePath(userId, filename);

  // Upload to S3
  await s3Client.send(
    new PutObjectCommand({
      Bucket: STORAGE_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: isPublic ? 'public-read' : 'private',
      Metadata: {
        userId,
        originalName: filename,
        ...metadata,
      },
    })
  );

  // Store metadata in database
  const fileRecord = await prisma.file.create({
    data: {
      key,
      filename,
      contentType,
      size: buffer.length,
      userId,
      isPublic,
      metadata: metadata || {},
    },
  });

  return {
    id: fileRecord.id,
    key,
    url: isPublic ? getPublicUrl(key) : await getSignedDownloadUrl(key),
    size: buffer.length,
    contentType,
  };
}

/**
 * Generate presigned upload URL
 */
export async function getSignedUploadUrl(options: {
  userId: string;
  filename: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ url: string; key: string; fields?: Record<string, string> }> {
  const { userId, filename, contentType, expiresIn = 3600 } = options;
  const key = getFilePath(userId, filename);

  const command = new PutObjectCommand({
    Bucket: STORAGE_CONFIG.bucket,
    Key: key,
    ContentType: contentType,
    Metadata: {
      userId,
      originalName: filename,
    },
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });

  return { url, key };
}

/**
 * Generate presigned download URL
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: STORAGE_CONFIG.bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file
 */
export async function deleteFile(key: string, userId: string): Promise<void> {
  // Verify ownership
  const file = await prisma.file.findFirst({
    where: { key, userId },
  });

  if (!file) {
    throw new Error('File not found or access denied');
  }

  // Delete from S3
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: STORAGE_CONFIG.bucket,
      Key: key,
    })
  );

  // Delete from database
  await prisma.file.delete({
    where: { id: file.id },
  });
}

/**
 * Get file metadata
 */
export async function getFileMetadata(key: string) {
  const response = await s3Client.send(
    new HeadObjectCommand({
      Bucket: STORAGE_CONFIG.bucket,
      Key: key,
    })
  );

  return {
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    lastModified: response.LastModified,
    metadata: response.Metadata,
  };
}

/**
 * Copy a file
 */
export async function copyFile(
  sourceKey: string,
  destinationKey: string
): Promise<void> {
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: STORAGE_CONFIG.bucket,
      CopySource: `${STORAGE_CONFIG.bucket}/${sourceKey}`,
      Key: destinationKey,
    })
  );
}

/**
 * List files in a directory
 */
export async function listFiles(
  prefix: string,
  maxKeys: number = 100
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: STORAGE_CONFIG.bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    })
  );

  return (response.Contents || []).map((item) => ({
    key: item.Key!,
    size: item.Size!,
    lastModified: item.LastModified!,
  }));
}

/**
 * Get user's storage usage
 */
export async function getStorageUsage(userId: string): Promise<{
  totalFiles: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
}> {
  const files = await prisma.file.findMany({
    where: { userId },
    select: { size: true, contentType: true },
  });

  const byType: Record<string, { count: number; size: number }> = {};

  for (const file of files) {
    const type = file.contentType.split('/')[0];
    if (!byType[type]) {
      byType[type] = { count: 0, size: 0 };
    }
    byType[type].count++;
    byType[type].size += file.size;
  }

  return {
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    byType,
  };
}
```

### Database Schema

```prisma
// prisma/schema.prisma
model File {
  id          String   @id @default(cuid())
  key         String   @unique
  filename    String
  contentType String
  size        Int
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isPublic    Boolean  @default(false)
  metadata    Json     @default("{}")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([contentType])
}
```

### API Routes

```typescript
// app/api/files/upload/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile } from '@/lib/storage/service';
import { STORAGE_CONFIG } from '@/lib/storage/config';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const isPublic = formData.get('public') === 'true';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const result = await uploadFile({
      userId: session.user.id,
      file,
      filename: file.name,
      contentType: file.type,
      isPublic,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// app/api/files/upload-url/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSignedUploadUrl } from '@/lib/storage/service';
import { z } from 'zod';

const schema = z.object({
  filename: z.string(),
  contentType: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { filename, contentType } = schema.parse(body);

  const result = await getSignedUploadUrl({
    userId: session.user.id,
    filename,
    contentType,
  });

  return NextResponse.json(result);
}

// app/api/files/[key]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSignedDownloadUrl, deleteFile } from '@/lib/storage/service';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);

  const file = await prisma.file.findUnique({
    where: { key: decodedKey },
  });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Check access
  if (!file.isPublic) {
    const session = await auth();
    if (session?.user?.id !== file.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  const url = await getSignedDownloadUrl(decodedKey);
  
  return NextResponse.redirect(url);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key } = await params;
  const decodedKey = decodeURIComponent(key);

  try {
    await deleteFile(decodedKey, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 400 }
    );
  }
}
```

### File Manager Component

```typescript
// components/files/file-manager.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  File, 
  Trash2, 
  Download, 
  Upload,
  Image,
  FileText,
  Film,
  Music 
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface FileItem {
  id: string;
  key: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export function FileManager() {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery<FileItem[]>({
    queryKey: ['files'],
    queryFn: () => fetch('/api/files').then(r => r.json()),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Get presigned URL
      const { url, key } = await fetch('/api/files/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      }).then(r => r.json());

      // Upload to S3
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: (e.loaded / e.total) * 100,
            }));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Notify server of upload completion
      await fetch('/api/files/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, filename: file.name, contentType: file.type }),
      });

      return key;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setUploadProgress({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) =>
      fetch(`/api/files/${encodeURIComponent(key)}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files.forEach(f => uploadMutation.mutate(f)),
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.webm'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (contentType.startsWith('video/')) return <Film className="h-8 w-8" />;
    if (contentType.startsWith('audio/')) return <Music className="h-8 w-8" />;
    if (contentType === 'application/pdf') return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Max 10MB per file
        </p>
      </div>

      {/* Upload progress */}
      {Object.entries(uploadProgress).map(([name, progress]) => (
        <div key={name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{name}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      ))}

      {/* File list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files?.map((file) => (
          <div
            key={file.id}
            className="border rounded-lg p-4 flex items-start gap-3"
          >
            <div className="text-muted-foreground">
              {getFileIcon(file.contentType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.filename}</p>
              <p className="text-sm text-muted-foreground">
                {formatBytes(file.size)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <a href={`/api/files/${encodeURIComponent(file.key)}`} download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(file.key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Variants

### Cloudflare R2 Configuration

```typescript
// lib/storage/r2-config.ts
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

## Anti-patterns

1. **No size limits** - Always enforce file size limits
2. **No type validation** - Validate content types server-side
3. **Public buckets** - Use presigned URLs instead
4. **No database tracking** - Track files in database for management
5. **Synchronous uploads** - Use presigned URLs for large files
6. **No CDN** - Use CDN for public files

## Related Skills

- [[file-upload]] - File upload UI patterns
- [[image-processing]] - Image manipulation
- [[presigned-urls]] - Secure URL generation

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial file storage pattern with S3 and presigned URLs
