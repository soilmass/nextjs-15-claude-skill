---
id: pt-file-upload
name: File Upload Patterns
version: 2.0.0
layer: L5
category: files
description: File upload patterns with drag-drop, progress tracking, validation, and cloud storage integration
tags: [forms, file-upload, drag-drop, s3, cloudinary, validation]
composes:
  - ../atoms/input-button.md
  - ../molecules/progress-bar.md
dependencies:
  uploadthing: "^7.4.0"
formula: Drag-Drop UI + Validation + Presigned URLs + Progress = Robust Uploads
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

- Building drag-and-drop file upload interfaces
- Validating file types and sizes client-side
- Uploading directly to S3 with presigned URLs
- Tracking upload progress for user feedback
- Processing uploaded images (resize, optimize)

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ File Upload Flow                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Client: FileInput Component                         │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Drag & Drop Zone                                │ │   │
│  │ │ ┌─────────────────────────────────────────────┐ │ │   │
│  │ │ │ onDrop → validate → preview → upload        │ │ │   │
│  │ │ └─────────────────────────────────────────────┘ │ │   │
│  │ │ Progress: [████████░░░░░░░░] 65%                │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Server: Get Presigned URL                           │   │
│  │ POST /api/upload/presign → { url, key }            │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Direct Upload to S3 (bypasses server)               │   │
│  │ PUT presignedUrl with file body                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# File Upload Patterns

## Overview

File uploads require handling client-side selection, validation, progress tracking, and server-side processing. This pattern covers drag-and-drop, multi-file uploads, and integration with cloud storage.

## Implementation

### Basic File Input Component

```typescript
// components/ui/file-input.tsx
"use client";

import { forwardRef, useRef, useState } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FileInputProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      accept,
      multiple = false,
      maxSize = 5 * 1024 * 1024, // 5MB
      maxFiles = 10,
      onFilesChange,
      disabled,
      className,
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const validateFiles = (newFiles: FileList | null): File[] => {
      if (!newFiles) return [];

      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(newFiles).forEach((file) => {
        if (file.size > maxSize) {
          errors.push(`${file.name} exceeds ${formatBytes(maxSize)}`);
          return;
        }

        if (accept) {
          const acceptedTypes = accept.split(",").map((t) => t.trim());
          const isValidType = acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
              return file.name.toLowerCase().endsWith(type);
            }
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", "/"));
            }
            return file.type === type;
          });

          if (!isValidType) {
            errors.push(`${file.name} is not an accepted file type`);
            return;
          }
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        setError(errors.join(", "));
      } else {
        setError(null);
      }

      return validFiles;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const validFiles = validateFiles(e.target.files);
      const newFiles = multiple
        ? [...files, ...validFiles].slice(0, maxFiles)
        : validFiles.slice(0, 1);

      setFiles(newFiles);
      onFilesChange?.(newFiles);
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    };

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
      <div className={cn("space-y-4", className)}>
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            "hover:border-primary hover:bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {accept || "All files"} up to {formatBytes(maxSize)}
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 p-2 bg-muted rounded-lg"
              >
                <FileIcon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";
```

### Drag and Drop with react-dropzone

```typescript
// components/ui/dropzone.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, FileIcon, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

interface DropzoneProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  className?: string;
}

export function Dropzone({
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  },
  maxSize = 5 * 1024 * 1024,
  maxFiles = 5,
  onUpload,
  className,
}: DropzoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((rejection) => ({
          file: rejection.file,
          preview: undefined,
          progress: 0,
          status: "error" as const,
          error: rejection.errors[0]?.message || "Upload failed",
        }));
        setFiles((prev) => [...prev, ...errors]);
      }

      // Add accepted files
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        progress: 0,
        status: "pending",
      }));

      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));

      // Start upload
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        try {
          // Simulate progress
          for (let i = 0; i <= 100; i += 10) {
            await new Promise((r) => setTimeout(r, 100));
            setFiles((prev) =>
              prev.map((f) =>
                acceptedFiles.includes(f.file)
                  ? { ...f, progress: i, status: "uploading" }
                  : f
              )
            );
          }

          await onUpload(acceptedFiles);

          setFiles((prev) =>
            prev.map((f) =>
              acceptedFiles.includes(f.file)
                ? { ...f, progress: 100, status: "complete" }
                : f
            )
          );
        } catch (error) {
          setFiles((prev) =>
            prev.map((f) =>
              acceptedFiles.includes(f.file)
                ? {
                    ...f,
                    status: "error",
                    error: error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          );
        } finally {
          setIsUploading(false);
        }
      }
    },
    [maxFiles, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: isUploading || files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "hover:border-primary/50",
          (isUploading || files.length >= maxFiles) &&
            "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            "mx-auto h-12 w-12",
            isDragActive ? "text-primary" : "text-muted-foreground"
          )}
        />
        <p className="mt-2 text-sm font-medium">
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop files here, or click to select"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Up to {maxFiles} files, max {formatBytes(maxSize)} each
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.file.name}-${index}`}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                file.status === "error" && "border-destructive bg-destructive/5"
              )}
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <FileIcon className="h-10 w-10 text-muted-foreground" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.file.size)}
                </p>
                {file.status === "uploading" && (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
                {file.status === "error" && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {file.error}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => removeFile(index)}
                disabled={file.status === "uploading"}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Server Action for File Upload

```typescript
// app/actions/upload.ts
"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuid } from "uuid";
import { z } from "zod";

const uploadSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  size: z.number().max(10 * 1024 * 1024, "File too large"),
});

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const validation = uploadSchema.safeParse({
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message ?? "Invalid file",
    };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${uuid()}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return {
      success: true,
      data: {
        url: `/uploads/${filename}`,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload file" };
  }
}

// Multiple files upload
export async function uploadFiles(formData: FormData) {
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return { success: false, error: "No files provided" };
  }

  const results = await Promise.all(
    files.map(async (file) => {
      const singleFormData = new FormData();
      singleFormData.set("file", file);
      return uploadFile(singleFormData);
    })
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  return {
    success: failed.length === 0,
    data: {
      uploaded: successful.map((r) => r.data),
      failed: failed.map((r, i) => ({
        filename: files[i]?.name,
        error: r.error,
      })),
    },
  };
}
```

### S3 Upload with Presigned URLs

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

// app/api/upload/presigned/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/s3";
import { v4 as uuid } from "uuid";
import { z } from "zod";

const requestSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = requestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const { filename, contentType } = result.data;
  const ext = filename.split(".").pop();
  const key = `uploads/${uuid()}.${ext}`;

  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  return NextResponse.json({
    uploadUrl,
    key,
    publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  });
}

// Client-side upload to S3
// hooks/use-s3-upload.ts
"use client";

import { useState } from "react";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useS3Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const upload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Get presigned URL
      const response = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      const { uploadUrl, publicUrl } = await response.json();

      // Upload directly to S3
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            setProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      return publicUrl;
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  return { upload, isUploading, progress };
}
```

## Variants

### Image Upload with Preview and Crop

```typescript
// components/image-upload.tsx
"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageUploadProps {
  onUpload: (blob: Blob) => Promise<void>;
  aspectRatio?: number;
}

export function ImageUpload({ onUpload, aspectRatio = 1 }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_: unknown, pixels: unknown) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCrop = async () => {
    if (!image || !croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    await onUpload(croppedImage);
    setImage(null);
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setImage(URL.createObjectURL(file));
          }
        }}
      />
      
      <Dialog open={!!image} onOpenChange={() => setImage(null)}>
        <DialogContent className="max-w-lg">
          <div className="relative h-96">
            <Cropper
              image={image!}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <button onClick={handleCrop}>Crop & Upload</button>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Anti-patterns

1. **No file size limits**: Allowing arbitrarily large uploads
2. **Client-side only validation**: Not validating on server
3. **No progress feedback**: Users don't know upload status
4. **Missing error handling**: Silent failures
5. **Storing in public folder**: Security risk for sensitive files

## Related Skills

- `L5/patterns/form-validation` - File validation
- `L5/patterns/server-actions` - Server-side processing
- `L5/patterns/s3` - Cloud storage integration
- `L5/patterns/image-optimization` - Image processing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with S3 and drag-drop
