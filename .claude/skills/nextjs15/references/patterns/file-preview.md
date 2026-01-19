---
id: pt-file-preview
name: File Preview
version: 1.0.0
layer: L5
category: media
description: Generate and display file previews for images, PDFs, videos, and documents
tags: [file, preview, thumbnail, pdf, image, video, next15, react19]
composes: []
dependencies: []
formula: "FilePreview = TypeDetection + PreviewGenerator + Viewer + ThumbnailCache"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# File Preview

## When to Use

- When building file managers or document systems
- For upload previews before submission
- When displaying file attachments
- For media gallery applications
- When implementing document viewers

## Overview

This pattern implements file preview generation for various file types including images, PDFs, videos, and office documents. It covers thumbnail generation, preview rendering, and lazy loading.

## File Type Detection

```typescript
// lib/files/types.ts
export const FILE_TYPES = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"],
  video: ["mp4", "webm", "mov", "avi", "mkv"],
  audio: ["mp3", "wav", "ogg", "m4a", "flac"],
  pdf: ["pdf"],
  document: ["doc", "docx", "txt", "rtf", "odt"],
  spreadsheet: ["xls", "xlsx", "csv", "ods"],
  presentation: ["ppt", "pptx", "odp"],
  archive: ["zip", "rar", "7z", "tar", "gz"],
  code: ["js", "ts", "jsx", "tsx", "py", "rb", "go", "java", "cpp", "c", "html", "css", "json"],
} as const;

export type FileCategory = keyof typeof FILE_TYPES;

export function getFileCategory(filename: string): FileCategory | "unknown" {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  for (const [category, extensions] of Object.entries(FILE_TYPES)) {
    if ((extensions as readonly string[]).includes(ext)) {
      return category as FileCategory;
    }
  }

  return "unknown";
}

export function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    pdf: "application/pdf",
    // Add more as needed
  };

  return mimeTypes[ext] || "application/octet-stream";
}
```

## Thumbnail Generation API

```typescript
// app/api/thumbnail/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getFileFromStorage } from "@/lib/storage";
import { getFileCategory } from "@/lib/files/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const width = parseInt(searchParams.get("w") || "200");
  const height = parseInt(searchParams.get("h") || "200");

  try {
    const file = await getFileFromStorage(fileId);
    const category = getFileCategory(file.name);

    if (category === "image") {
      const thumbnail = await sharp(file.buffer)
        .resize(width, height, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();

      return new NextResponse(thumbnail, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    // Return placeholder for other types
    const placeholder = await generatePlaceholder(category, width, height);
    return new NextResponse(placeholder, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

async function generatePlaceholder(
  category: string,
  width: number,
  height: number
): Promise<string> {
  const icons: Record<string, string> = {
    pdf: "📄",
    video: "🎬",
    audio: "🎵",
    document: "📝",
    spreadsheet: "📊",
    archive: "📦",
    code: "💻",
    unknown: "📎",
  };

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="middle">
        ${icons[category] || icons.unknown}
      </text>
    </svg>
  `;
}
```

## Preview Components

```typescript
// components/files/file-preview.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { getFileCategory } from "@/lib/files/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    url: string;
    size: number;
  };
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const category = getFileCategory(file.name);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium truncate">{file.name}</h3>
          <div className="flex gap-2">
            {category === "image" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" asChild>
              <a href={file.url} download={file.name}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto p-4 flex items-center justify-center min-h-[400px]">
          <PreviewContent file={file} category={category} zoom={zoom} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewContent({
  file,
  category,
  zoom,
}: {
  file: FilePreviewProps["file"];
  category: string;
  zoom: number;
}) {
  switch (category) {
    case "image":
      return (
        <div style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }}>
          <Image
            src={file.url}
            alt={file.name}
            width={800}
            height={600}
            className="max-w-full h-auto"
            style={{ objectFit: "contain" }}
          />
        </div>
      );

    case "video":
      return (
        <video controls className="max-w-full max-h-[60vh]">
          <source src={file.url} />
        </video>
      );

    case "audio":
      return (
        <audio controls className="w-full">
          <source src={file.url} />
        </audio>
      );

    case "pdf":
      return (
        <iframe
          src={`${file.url}#toolbar=0`}
          className="w-full h-[70vh]"
          title={file.name}
        />
      );

    case "code":
      return <CodePreview url={file.url} />;

    default:
      return (
        <div className="text-center text-muted-foreground">
          <p>Preview not available for this file type</p>
          <Button className="mt-4" asChild>
            <a href={file.url} download={file.name}>
              Download File
            </a>
          </Button>
        </div>
      );
  }
}
```

## Thumbnail Grid Component

```typescript
// components/files/thumbnail-grid.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { getFileCategory } from "@/lib/files/types";
import { FilePreview } from "./file-preview";
import { cn } from "@/lib/utils";

interface File {
  id: string;
  name: string;
  url: string;
  size: number;
}

export function ThumbnailGrid({ files }: { files: File[] }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file) => (
          <ThumbnailCard
            key={file.id}
            file={file}
            onClick={() => setSelectedFile(file)}
          />
        ))}
      </div>

      {selectedFile && (
        <FilePreview
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </>
  );
}

function ThumbnailCard({
  file,
  onClick,
}: {
  file: File;
  onClick: () => void;
}) {
  const category = getFileCategory(file.name);
  const isImage = category === "image";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden",
        "border hover:border-primary transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary"
      )}
    >
      {isImage ? (
        <Image
          src={`/api/thumbnail/${file.id}?w=200&h=200`}
          alt={file.name}
          fill
          className="object-cover"
          sizes="200px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <FileIcon category={category} />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-xs text-white truncate">{file.name}</p>
      </div>
    </button>
  );
}
```

## Upload Preview

```typescript
// components/files/upload-preview.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadPreviewProps {
  file: File;
  onRemove: () => void;
}

export function UploadPreview({ file, onRemove }: UploadPreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [file]);

  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📄</span>
          </div>
        )}
      </div>

      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>

      <p className="text-xs truncate mt-1">{file.name}</p>
    </div>
  );
}
```

## Anti-patterns

### Don't Generate Thumbnails Synchronously

```typescript
// BAD - Blocks upload response
const thumbnail = await sharp(file).resize(200).toBuffer();
await saveFile(file);
await saveThumbnail(thumbnail);

// GOOD - Generate on demand or in background
await saveFile(file);
await thumbnailQueue.add({ fileId });
// Thumbnail generated lazily via /api/thumbnail/:id
```

## Related Patterns

- [image-optimization](./image-optimization.md)
- [lazy-loading](./lazy-loading.md)
- [streaming](./streaming.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multi-format preview
- Thumbnail generation
- Preview modal
