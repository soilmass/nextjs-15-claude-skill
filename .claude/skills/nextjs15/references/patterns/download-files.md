---
id: pt-download-files
name: Download Files
version: 2.0.0
layer: L5
category: files
description: File download handling with progress tracking, streaming, and multiple formats
tags: [download, files, streaming, progress, blob, fetch]
composes:
  - ../atoms/input-button.md
  - ../molecules/progress-bar.md
dependencies: []
formula: Signed URLs + Streaming Response + Progress Tracking = Reliable Downloads
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

- Implementing file download with progress tracking
- Streaming large files to avoid memory issues
- Batch downloading multiple files as ZIP
- Resumable downloads for large files
- Protected file access with signed URLs

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ File Download Flow                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Download Request                                           │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Authorization Check                                 │   │
│  │ - Verify user permissions                           │   │
│  │ - Generate signed URL (if needed)                   │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│         ┌──────────────┴──────────────┐                    │
│         ▼                             ▼                    │
│  Direct Redirect             Streaming Response            │
│  (Signed URL)                (Server proxy)                │
│         │                             │                    │
│         ▼                             ▼                    │
│  ┌────────────┐               ┌─────────────────┐         │
│  │ CDN/S3     │               │ Stream chunks   │         │
│  │ Direct     │               │ Content-Length  │         │
│  │ Download   │               │ Progress events │         │
│  └────────────┘               └─────────────────┘         │
│                                                             │
│  Client-side:                                               │
│  - Progress bar (loaded/total)                             │
│  - Cancel capability                                       │
│  - Retry on failure                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Download Files

## Overview

Comprehensive file download handling with progress tracking, streaming downloads, batch downloads, and support for various file types. Includes both client-side and server-side approaches.

## Implementation

### Download Hook

```tsx
// hooks/use-download.ts
'use client';

import { useState, useCallback, useRef } from 'react';

interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface DownloadOptions {
  filename?: string;
  onProgress?: (progress: DownloadProgress) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface DownloadState {
  isDownloading: boolean;
  progress: DownloadProgress | null;
  error: string | null;
}

export function useDownload() {
  const [state, setState] = useState<DownloadState>({
    isDownloading: false,
    progress: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const download = useCallback(
    async (url: string, options: DownloadOptions = {}) => {
      const { filename, onProgress, onComplete, onError } = options;

      // Abort any existing download
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState({
        isDownloading: true,
        progress: { loaded: 0, total: 0, percentage: 0 },
        error: null,
      });

      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;

        // Get filename from Content-Disposition header if not provided
        const contentDisposition = response.headers.get('content-disposition');
        let downloadFilename = filename;

        if (!downloadFilename && contentDisposition) {
          const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
          if (match) {
            downloadFilename = match[1];
          }
        }

        if (!downloadFilename) {
          downloadFilename = url.split('/').pop() || 'download';
        }

        // Stream the response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream not supported');
        }

        const chunks: Uint8Array[] = [];
        let loaded = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunks.push(value);
          loaded += value.length;

          const progress = {
            loaded,
            total,
            percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
          };

          setState((prev) => ({ ...prev, progress }));
          onProgress?.(progress);
        }

        // Combine chunks and create blob
        const blob = new Blob(chunks);

        // Trigger download
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        setState({
          isDownloading: false,
          progress: { loaded, total, percentage: 100 },
          error: null,
        });

        onComplete?.();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setState({
            isDownloading: false,
            progress: null,
            error: 'Download cancelled',
          });
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Download failed';

        setState({
          isDownloading: false,
          progress: null,
          error: errorMessage,
        });

        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },
    []
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    ...state,
    download,
    cancel,
  };
}
```

### Download Button Component

```tsx
// components/download-button.tsx
'use client';

import { Download, Loader2, X } from 'lucide-react';
import { useDownload } from '@/hooks/use-download';

interface DownloadButtonProps {
  url: string;
  filename?: string;
  children?: React.ReactNode;
  className?: string;
  showProgress?: boolean;
}

export function DownloadButton({
  url,
  filename,
  children,
  className = '',
  showProgress = true,
}: DownloadButtonProps) {
  const { isDownloading, progress, error, download, cancel } = useDownload();

  const handleClick = () => {
    if (isDownloading) {
      cancel();
    } else {
      download(url, { filename });
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md
          transition-colors
          ${isDownloading
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
          ${className}
        `}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {showProgress && progress ? `${progress.percentage}%` : 'Downloading...'}
            <X className="w-4 h-4" />
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            {children || 'Download'}
          </>
        )}
      </button>

      {showProgress && isDownloading && progress && (
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### Batch Download Hook

```tsx
// hooks/use-batch-download.ts
'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';

interface FileToDownload {
  url: string;
  filename: string;
}

interface BatchDownloadState {
  isDownloading: boolean;
  currentFile: number;
  totalFiles: number;
  error: string | null;
}

export function useBatchDownload() {
  const [state, setState] = useState<BatchDownloadState>({
    isDownloading: false,
    currentFile: 0,
    totalFiles: 0,
    error: null,
  });

  const downloadAsZip = useCallback(
    async (files: FileToDownload[], zipFilename: string = 'download.zip') => {
      setState({
        isDownloading: true,
        currentFile: 0,
        totalFiles: files.length,
        error: null,
      });

      const zip = new JSZip();

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setState((prev) => ({ ...prev, currentFile: i + 1 }));

          const response = await fetch(file.url);
          if (!response.ok) {
            throw new Error(`Failed to download ${file.filename}`);
          }

          const blob = await response.blob();
          zip.file(file.filename, blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = zipFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setState({
          isDownloading: false,
          currentFile: files.length,
          totalFiles: files.length,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isDownloading: false,
          error: error instanceof Error ? error.message : 'Download failed',
        }));
      }
    },
    []
  );

  const downloadSequentially = useCallback(async (files: FileToDownload[]) => {
    setState({
      isDownloading: true,
      currentFile: 0,
      totalFiles: files.length,
      error: null,
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setState((prev) => ({ ...prev, currentFile: i + 1 }));

      const response = await fetch(file.url);
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Small delay between downloads
      await new Promise((r) => setTimeout(r, 500));
    }

    setState({
      isDownloading: false,
      currentFile: files.length,
      totalFiles: files.length,
      error: null,
    });
  }, []);

  return {
    ...state,
    downloadAsZip,
    downloadSequentially,
  };
}
```

### Server-Side Download Route

```tsx
// app/api/download/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const FILES_DIR = path.join(process.cwd(), 'uploads', 'files');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;
  const filePath = path.join(FILES_DIR, ...pathParts);

  // Security: Ensure path doesn't escape uploads directory
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(FILES_DIR))) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const stats = await stat(filePath);
  const fileBuffer = await readFile(filePath);
  const filename = path.basename(filePath);

  // Determine content type
  const contentType = getContentType(filename);

  // Support range requests for large files
  const range = request.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    const chunkSize = end - start + 1;
    const chunk = fileBuffer.slice(start, end + 1);

    return new NextResponse(chunk, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Accept-Ranges': 'bytes',
    },
  });
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.zip': 'application/zip',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
  };

  return contentTypes[ext] || 'application/octet-stream';
}
```

### Generate Download Route

```tsx
// app/api/generate-download/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { type, data, filename } = await request.json();

  let content: string;
  let contentType: string;

  switch (type) {
    case 'json':
      content = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      break;

    case 'csv':
      content = convertToCSV(data);
      contentType = 'text/csv';
      break;

    case 'txt':
      content = typeof data === 'string' ? data : JSON.stringify(data);
      contentType = 'text/plain';
      break;

    default:
      return NextResponse.json({ error: 'Unsupported type' }, { status: 400 });
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const value = row[h];
      const stringValue = String(value ?? '');
      // Escape quotes and wrap in quotes if contains comma
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
```

### Download List Component

```tsx
// components/download-list.tsx
'use client';

import { Download, FileText, Image, Video, Music, Archive, File } from 'lucide-react';
import { DownloadButton } from './download-button';

interface DownloadItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

interface DownloadListProps {
  items: DownloadItem[];
  onDownloadAll?: () => void;
}

export function DownloadList({ items, onDownloadAll }: DownloadListProps) {
  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('pdf') || type.includes('document')) {
      return <FileText className="w-5 h-5" />;
    }
    if (type.includes('zip') || type.includes('archive')) {
      return <Archive className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="border rounded-lg divide-y">
      {items.length > 1 && onDownloadAll && (
        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {items.length} files
          </span>
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Download All
          </button>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-400">{getIcon(item.type)}</div>
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{formatSize(item.size)}</p>
            </div>
          </div>

          <DownloadButton
            url={item.url}
            filename={item.name}
            showProgress={false}
            className="px-3 py-1.5 text-sm"
          />
        </div>
      ))}
    </div>
  );
}
```

### Client-Side File Generation

```tsx
// lib/download-utils.ts
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
}

export function downloadJSON(data: unknown, filename: string) {
  const content = JSON.stringify(data, null, 2);
  downloadText(content, filename, 'application/json');
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const value = row[h];
      const str = String(value ?? '');
      return str.includes(',') || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  downloadText(csv, filename, 'text/csv');
}

export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  type: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.92
) {
  return new Promise<void>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          downloadBlob(blob, filename);
        }
        resolve();
      },
      type,
      quality
    );
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

## Variants

### Streaming Large File Download

```tsx
// Stream download for very large files
async function streamDownload(url: string, filename: string) {
  const response = await fetch(url);
  const reader = response.body?.getReader();
  if (!reader) return;

  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  const newResponse = new Response(stream);
  const blob = await newResponse.blob();
  
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}
```

## Usage

```tsx
// app/downloads/page.tsx
'use client';

import { DownloadButton } from '@/components/download-button';
import { DownloadList } from '@/components/download-list';
import { useBatchDownload } from '@/hooks/use-batch-download';
import { downloadJSON, downloadCSV } from '@/lib/download-utils';

const files = [
  { id: '1', name: 'report.pdf', url: '/api/download/report.pdf', size: 1024000, type: 'application/pdf' },
  { id: '2', name: 'data.csv', url: '/api/download/data.csv', size: 52000, type: 'text/csv' },
  { id: '3', name: 'image.png', url: '/api/download/image.png', size: 256000, type: 'image/png' },
];

export default function DownloadsPage() {
  const { downloadAsZip, isDownloading, currentFile, totalFiles } = useBatchDownload();

  const handleDownloadAll = () => {
    downloadAsZip(
      files.map((f) => ({ url: f.url, filename: f.name })),
      'all-files.zip'
    );
  };

  const handleExportData = () => {
    const data = [
      { name: 'John', email: 'john@example.com', age: 30 },
      { name: 'Jane', email: 'jane@example.com', age: 25 },
    ];
    downloadCSV(data, 'users.csv');
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Downloads</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Single File</h2>
        <DownloadButton url="/api/download/sample.pdf" filename="sample.pdf">
          Download PDF
        </DownloadButton>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">File List</h2>
        <DownloadList items={files} onDownloadAll={handleDownloadAll} />
        {isDownloading && (
          <p className="mt-2 text-sm text-gray-600">
            Downloading {currentFile}/{totalFiles}...
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Export as CSV
        </button>
      </section>
    </div>
  );
}
```

## Related Skills

- [[multipart-upload]] - Chunked file uploads
- [[export-data]] - Data export patterns
- [[progress]] - Progress indicators
- [[streaming]] - Streaming responses

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Download with progress tracking
- Batch download with ZIP
- Server-side streaming support
- Client-side file generation utilities
