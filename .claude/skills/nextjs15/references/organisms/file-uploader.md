---
id: o-file-uploader
name: File Uploader
version: 2.1.0
layer: L3
category: forms
description: Drag-and-drop file uploader with preview, progress, and validation
tags: [upload, file, dropzone, drag-drop, progress, preview]
formula: FileUploader = DropZone + FileList(FilePreviewItem(Progress + Button + Badge))
composes:
  - ../molecules/form-field.md
dependencies: [react-dropzone, lucide-react]
performance:
  impact: medium
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# File Uploader

## Overview

The File Uploader organism provides a complete file upload solution with drag-and-drop support, file previews, upload progress tracking, validation, and error handling. Supports single and multiple file uploads with configurable constraints, retry functionality for failed uploads, and visual feedback throughout the upload lifecycle.

## When to Use

Use this skill when:
- Building file upload interfaces with drag-and-drop
- Creating image/document upload forms
- Implementing avatar/profile picture upload
- Building media management interfaces
- Need upload progress tracking and status display
- Require file type and size validation

## Composition Diagram

```
+------------------------------------------------------------------+
|                        FileUploader                               |
|  +------------------------------------------------------------+  |
|  |                      DropZone                               |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  [Upload Icon]                                        |  |  |
|  |  |  "Drag & drop files here, or click to select"        |  |  |
|  |  |  "PNG, JPG, PDF up to 10MB"                          |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                      FileList                               |  |
|  |  +------------------------------------------------------+  |  |
|  |  | FilePreviewItem                                       |  |  |
|  |  | +--------------------------------------------------+ |  |  |
|  |  | | [Preview] | filename.png | 2.4 MB | [Badge:Done] | |  |  |
|  |  | |           | [========Progress========]  [X]      | |  |  |
|  |  | +--------------------------------------------------+ |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | FilePreviewItem                                       |  |  |
|  |  | +--------------------------------------------------+ |  |  |
|  |  | | [Preview] | document.pdf | 1.1 MB | [Badge:Error]| |  |  |
|  |  | |           | Upload failed        [Retry] [X]     | |  |  |
|  |  | +--------------------------------------------------+ |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Composes

- [form-field](../molecules/form-field.md) - Wrapper with label and validation
- [button](../atoms/button.md) - Remove and retry buttons
- [progress](../atoms/progress.md) - Upload progress indicator
- [badge](../atoms/badge.md) - Status badges

## Implementation

```typescript
// components/organisms/file-uploader.tsx
"use client";

import * as React from "react";
import { useDropzone, Accept, FileRejection } from "react-dropzone";
import {
  Upload,
  X,
  File,
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// File status types
type FileStatus = "pending" | "uploading" | "complete" | "error";

// Extended file type with upload state
interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  status: FileStatus;
  progress: number;
  error?: string;
}

interface FileUploaderProps {
  /** Accepted file types */
  accept?: Accept;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Disable the uploader */
  disabled?: boolean;
  /** Upload handler - receives files and returns URLs */
  onUpload?: (files: File[]) => Promise<string[]>;
  /** Called when files change */
  onFilesChange?: (files: UploadFile[]) => void;
  /** Called when all uploads complete */
  onUploadComplete?: (urls: string[]) => void;
  /** Called when upload errors occur */
  onUploadError?: (error: Error, file: File) => void;
  /** Variant style */
  variant?: "default" | "compact" | "avatar";
  /** Custom dropzone label */
  label?: string;
  /** Custom description */
  description?: string;
  /** Show file list */
  showFileList?: boolean;
  /** Additional class names */
  className?: string;
}

// Generate unique ID for files
function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get file icon based on MIME type
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText;
  return File;
}

// Format file size for display
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Get accept description for display
function getAcceptDescription(accept?: Accept): string {
  if (!accept) return "All file types";
  const types = Object.keys(accept)
    .map((key) => {
      if (key.includes("image")) return "Images";
      if (key.includes("pdf")) return "PDF";
      if (key.includes("video")) return "Video";
      if (key.includes("audio")) return "Audio";
      return key;
    })
    .filter((v, i, a) => a.indexOf(v) === i);
  return types.join(", ");
}

// File preview item component
function FilePreviewItem({
  uploadFile,
  onRemove,
  onRetry,
}: {
  uploadFile: UploadFile;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { file, preview, status, progress, error } = uploadFile;
  const FileIcon = getFileIcon(file.type);
  const isImage = file.type.startsWith("image/");

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border p-3 transition-colors",
        status === "error" && "border-destructive bg-destructive/5",
        status === "complete" && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
      )}
    >
      {/* Preview thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
        {isImage && preview ? (
          <img
            src={preview}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        {/* Status overlay for uploading */}
        {status === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </p>
          {/* Status badge */}
          {status === "complete" && (
            <Badge variant="outline" className="border-green-500 text-green-600 shrink-0">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Done
            </Badge>
          )}
          {status === "error" && (
            <Badge variant="destructive" className="shrink-0">
              <AlertCircle className="mr-1 h-3 w-3" />
              Error
            </Badge>
          )}
          {status === "pending" && (
            <Badge variant="secondary" className="shrink-0">
              Pending
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>

        {/* Progress bar for uploading state */}
        {status === "uploading" && (
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground w-10 text-right">
              {progress}%
            </span>
          </div>
        )}

        {/* Error message */}
        {status === "error" && error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Retry button for failed uploads */}
        {status === "error" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRetry}
            aria-label={`Retry upload for ${file.name}`}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        {/* Remove button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function FileUploader({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  multiple = true,
  disabled = false,
  onUpload,
  onFilesChange,
  onUploadComplete,
  onUploadError,
  variant = "default",
  label,
  description,
  showFileList = true,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [isDragActive, setIsDragActive] = React.useState(false);

  // Update parent when files change
  React.useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  // Clean up preview URLs on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  // Simulate upload progress (replace with real upload logic)
  const simulateUpload = React.useCallback(
    async (uploadFile: UploadFile): Promise<string> => {
      return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            // Simulate occasional failures for demo
            if (Math.random() > 0.9) {
              reject(new Error("Upload failed. Please try again."));
            } else {
              resolve(`https://example.com/uploads/${uploadFile.file.name}`);
            }
          }
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, progress: Math.min(100, Math.round(progress)) }
                : f
            )
          );
        }, 200);
      });
    },
    []
  );

  // Upload a single file
  const uploadFile = React.useCallback(
    async (uploadFile: UploadFile) => {
      // Set uploading status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
        )
      );

      try {
        let url: string;
        if (onUpload) {
          // Use provided upload handler
          const urls = await onUpload([uploadFile.file]);
          url = urls[0];
        } else {
          // Use simulated upload
          url = await simulateUpload(uploadFile);
        }

        // Mark as complete
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "complete", progress: 100 }
              : f
          )
        );
        return url;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: errorMessage }
              : f
          )
        );
        onUploadError?.(error as Error, uploadFile.file);
        throw error;
      }
    },
    [onUpload, simulateUpload, onUploadError]
  );

  // Handle file drop
  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      rejectedFiles.forEach((rejection) => {
        const errorMessages = rejection.errors.map((e) => e.message).join(", ");
        console.warn(`File rejected: ${rejection.file.name} - ${errorMessages}`);
      });

      // Check max files limit
      const remainingSlots = maxFiles - files.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      if (filesToAdd.length === 0) return;

      // Create upload file objects
      const newFiles: UploadFile[] = filesToAdd.map((file) => ({
        id: generateFileId(),
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        status: "pending" as FileStatus,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Start uploading files
      const uploadPromises = newFiles.map((uf) => uploadFile(uf));

      try {
        const urls = await Promise.allSettled(uploadPromises);
        const successfulUrls = urls
          .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
          .map((r) => r.value);

        if (successfulUrls.length > 0) {
          onUploadComplete?.(successfulUrls);
        }
      } catch (error) {
        // Individual errors handled in uploadFile
      }
    },
    [files.length, maxFiles, uploadFile, onUploadComplete]
  );

  // Remove file from list
  const removeFile = React.useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  // Retry failed upload
  const retryUpload = React.useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) {
        uploadFile(file);
      }
    },
    [files, uploadFile]
  );

  // Configure dropzone
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
    multiple,
    disabled: disabled || files.length >= maxFiles,
    noClick: variant === "avatar",
    noKeyboard: false,
  });

  // Default label and description
  const defaultLabel = multiple
    ? "Drag & drop files here, or click to select"
    : "Drag & drop a file here, or click to select";
  const defaultDescription = `${getAcceptDescription(accept)} up to ${formatFileSize(maxSize)}`;

  // Render based on variant
  if (variant === "avatar") {
    return (
      <div className={cn("space-y-2", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "relative h-24 w-24 cursor-pointer rounded-full border-2 border-dashed transition-colors",
            isDragActive && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          {files.length > 0 && files[0].preview ? (
            <img
              src={files[0].preview}
              alt="Avatar preview"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {files.length > 0 && files[0].status === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={open}
          disabled={disabled}
        >
          Choose Image
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 transition-colors",
            isDragActive && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{label || "Upload files"}</p>
            <p className="text-xs text-muted-foreground">
              {description || defaultDescription}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={disabled}>
            Browse
          </Button>
        </div>
        {showFileList && files.length > 0 && (
          <div className="space-y-2">
            {files.map((uploadFile) => (
              <FilePreviewItem
                key={uploadFile.id}
                uploadFile={uploadFile}
                onRemove={() => removeFile(uploadFile.id)}
                onRetry={() => retryUpload(uploadFile.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
          files.length >= maxFiles && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
              isDragActive ? "bg-primary/10" : "bg-muted"
            )}
          >
            <Upload
              className={cn(
                "h-7 w-7 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {label || defaultLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              {description || defaultDescription}
            </p>
          </div>
        </div>
      </div>

      {/* File count indicator */}
      {maxFiles > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          {files.length} of {maxFiles} files
        </p>
      )}

      {/* File list */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Uploaded files">
          {files.map((uploadFile) => (
            <FilePreviewItem
              key={uploadFile.id}
              uploadFile={uploadFile}
              onRemove={() => removeFile(uploadFile.id)}
              onRetry={() => retryUpload(uploadFile.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Key Implementation Notes

1. **File State Management**: Tracks each file with unique ID, status, progress, and optional preview URL
2. **Drag-and-Drop**: Uses react-dropzone for robust drag-drop handling with visual feedback
3. **Progress Tracking**: Real-time progress updates during upload with Progress component
4. **Error Handling**: Failed uploads show error state with retry option
5. **Preview Generation**: Creates blob URLs for image previews, cleaned up on unmount
6. **Accessibility**: ARIA labels on all interactive elements, keyboard navigable

## Variants

### Default Uploader

```tsx
<FileUploader
  accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif"] }}
  maxSize={5 * 1024 * 1024}
  onUpload={async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const { urls } = await response.json();
    return urls;
  }}
  onUploadComplete={(urls) => console.log("Uploaded:", urls)}
/>
```

### Compact Uploader

```tsx
<FileUploader
  variant="compact"
  accept={{ "application/pdf": [".pdf"] }}
  maxSize={10 * 1024 * 1024}
  maxFiles={5}
  label="Upload documents"
  description="PDF files only, up to 10MB each"
  onUpload={uploadDocuments}
/>
```

### Avatar Uploader

```tsx
<FileUploader
  variant="avatar"
  accept={{ "image/*": [] }}
  maxFiles={1}
  multiple={false}
  maxSize={2 * 1024 * 1024}
  onUpload={uploadAvatar}
/>
```

### With Form Field Wrapper

```tsx
import { FormField } from "@/components/ui/form-field";

<FormField
  label="Attachments"
  description="Upload supporting documents"
  error={errors.attachments}
>
  <FileUploader
    accept={{
      "image/*": [],
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
    }}
    maxFiles={5}
    onUpload={handleUpload}
  />
</FormField>
```

## Props API

### FileUploader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `Accept` | `undefined` | Accepted MIME types and extensions |
| `maxSize` | `number` | `10485760` (10MB) | Maximum file size in bytes |
| `maxFiles` | `number` | `10` | Maximum number of files |
| `multiple` | `boolean` | `true` | Allow multiple file selection |
| `disabled` | `boolean` | `false` | Disable the uploader |
| `onUpload` | `(files: File[]) => Promise<string[]>` | `undefined` | Upload handler returning URLs |
| `onFilesChange` | `(files: UploadFile[]) => void` | `undefined` | Called when files change |
| `onUploadComplete` | `(urls: string[]) => void` | `undefined` | Called when all uploads complete |
| `onUploadError` | `(error: Error, file: File) => void` | `undefined` | Called when upload fails |
| `variant` | `'default' \| 'compact' \| 'avatar'` | `'default'` | Visual style variant |
| `label` | `string` | Auto-generated | Custom dropzone label |
| `description` | `string` | Auto-generated | Custom description text |
| `showFileList` | `boolean` | `true` | Show uploaded files list |
| `className` | `string` | `undefined` | Additional CSS classes |

### UploadFile Type

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique file identifier |
| `file` | `File` | Native File object |
| `preview` | `string` | Preview URL for images (optional) |
| `status` | `FileStatus` | Current upload status |
| `progress` | `number` | Upload progress (0-100) |
| `error` | `string` | Error message (optional) |

### FileStatus Type

| Value | Description |
|-------|-------------|
| `'pending'` | File added, upload not started |
| `'uploading'` | Upload in progress |
| `'complete'` | Upload finished successfully |
| `'error'` | Upload failed |

## States

| State | Border | Background | Icon | Description |
|-------|--------|------------|------|-------------|
| Default | dashed muted | transparent | muted | Ready for drop |
| Hover | dashed primary/50 | muted/50 | muted | Mouse over zone |
| Drag Active | dashed primary | primary/5 | primary | Files being dragged |
| Disabled | dashed muted | transparent | muted | Uploads disabled |
| Max Reached | dashed muted | transparent | muted | Max files uploaded |

### File Item States

| Status | Border | Badge | Actions |
|--------|--------|-------|---------|
| Pending | default | "Pending" secondary | Remove |
| Uploading | default | Progress bar | Remove |
| Complete | green-500/50 | "Done" green | Remove |
| Error | destructive | "Error" destructive | Retry, Remove |

## Accessibility

### Required ARIA Attributes

- `aria-label` on dropzone input
- `aria-label` on remove and retry buttons
- `role="list"` on file list container
- `aria-describedby` linking to description text

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus dropzone/buttons |
| `Enter/Space` | Open file dialog |
| `Escape` | Close file dialog |

### Screen Reader Announcements

- Dropzone instructions read on focus
- File count announced
- Upload progress updates
- Status changes announced (complete, error)
- Action buttons properly labeled

## Dependencies

```json
{
  "dependencies": {
    "react-dropzone": "^14.2.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install react-dropzone lucide-react
```

## Examples

### Profile Settings Upload

```tsx
import { FileUploader } from "@/components/organisms/file-uploader";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";

export function ProfilePhotoUpload() {
  const [avatarUrl, setAvatarUrl] = React.useState<string>();

  return (
    <div className="space-y-4">
      <Label>Profile Photo</Label>
      <FileUploader
        variant="avatar"
        accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
        maxSize={2 * 1024 * 1024}
        maxFiles={1}
        multiple={false}
        onUpload={async (files) => {
          const formData = new FormData();
          formData.append("avatar", files[0]);
          const response = await fetch("/api/upload-avatar", {
            method: "POST",
            body: formData,
          });
          const { url } = await response.json();
          return [url];
        }}
        onUploadComplete={(urls) => setAvatarUrl(urls[0])}
      />
    </div>
  );
}
```

### Document Upload Form

```tsx
import { FileUploader } from "@/components/organisms/file-uploader";
import { Button } from "@/components/ui/button";

export function DocumentUploadForm() {
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitDocuments(uploadedUrls);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FileUploader
        accept={{
          "application/pdf": [".pdf"],
          "application/msword": [".doc"],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        }}
        maxSize={25 * 1024 * 1024}
        maxFiles={10}
        label="Upload your documents"
        description="PDF, DOC, DOCX up to 25MB each"
        onUpload={uploadToServer}
        onUploadComplete={setUploadedUrls}
      />
      <Button type="submit" disabled={uploadedUrls.length === 0}>
        Submit Documents
      </Button>
    </form>
  );
}
```

### Media Gallery Upload

```tsx
import { FileUploader } from "@/components/organisms/file-uploader";

export function MediaGalleryUpload() {
  return (
    <FileUploader
      accept={{
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        "video/*": [".mp4", ".webm", ".mov"],
      }}
      maxSize={100 * 1024 * 1024}
      maxFiles={20}
      label="Add photos and videos"
      description="Images and videos up to 100MB"
      onUpload={async (files) => {
        // Upload with progress tracking
        const urls = await Promise.all(
          files.map((file) => uploadWithProgress(file))
        );
        return urls;
      }}
      onUploadError={(error, file) => {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }}
    />
  );
}
```

## Anti-patterns

### Missing File Type Validation

```tsx
// Bad - accepts all files without validation
<FileUploader onUpload={handleUpload} />

// Good - specify accepted file types
<FileUploader
  accept={{ "image/*": [".png", ".jpg"], "application/pdf": [".pdf"] }}
  maxSize={5 * 1024 * 1024}
  onUpload={handleUpload}
/>
```

### No Error Handling

```tsx
// Bad - no error handling
<FileUploader
  onUpload={async (files) => {
    const response = await fetch("/upload", { body: files[0] });
    return [response.url];
  }}
/>

// Good - proper error handling
<FileUploader
  onUpload={async (files) => {
    try {
      const response = await fetch("/upload", { body: files[0] });
      if (!response.ok) throw new Error("Upload failed");
      return [response.url];
    } catch (error) {
      throw error; // Let FileUploader handle the error state
    }
  }}
  onUploadError={(error, file) => {
    toast.error(`Failed to upload ${file.name}`);
  }}
/>
```

### Blocking UI During Upload

```tsx
// Bad - blocking entire form during upload
<form>
  {isUploading && <LoadingOverlay />}
  <FileUploader onUpload={handleUpload} />
</form>

// Good - non-blocking with inline progress
<form>
  <FileUploader
    onUpload={handleUpload}
    showFileList // Shows inline progress
  />
</form>
```

### Missing Accessibility Labels

```tsx
// Bad - unlabeled buttons
<button onClick={onRemove}>
  <X />
</button>

// Good - proper aria-label
<Button
  onClick={onRemove}
  aria-label={`Remove ${file.name}`}
>
  <X />
</Button>
```

## Related Skills

### Composes From
- [molecules/form-field](../molecules/form-field.md) - Field wrapper
- [atoms/button](../atoms/button.md) - Action buttons
- [atoms/progress](../atoms/progress.md) - Upload progress
- [atoms/badge](../atoms/badge.md) - Status indicators

### Composes Into
- [organisms/settings-form](./settings-form.md) - User profile settings
- [organisms/contact-form](./contact-form.md) - Support tickets with attachments
- [organisms/review-form](./review-form.md) - Product reviews with images

### Alternatives
- Native `<input type="file">` - For simple, single file uploads
- Third-party services (Uploadcare, Cloudinary widgets) - For managed upload infrastructure

---

## Changelog

### 2.1.0 (2025-01-18)
- Added complete implementation with full TypeScript code
- Added formula field and composition diagram
- Added States section with file item states
- Added comprehensive Examples section
- Added Anti-patterns section
- Improved accessibility documentation

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Three variants (default, compact, avatar)
- Progress tracking
