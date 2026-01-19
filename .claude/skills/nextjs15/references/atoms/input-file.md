---
id: a-input-file
name: File Input
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: File input with dropzone and preview
tags: [input, file, upload, form]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# File Input

## Overview

The File Input atom provides a styled file upload input with optional drag-and-drop dropzone functionality. It supports file type restrictions, size limits, and preview states.

## When to Use

Use this skill when:
- Uploading single files (avatars, documents)
- Building file drop zones
- Creating image upload with preview

## Implementation

```typescript
// components/ui/file-input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        type="file"
        className={cn(
          `flex h-10 w-full rounded-md border bg-background px-3 py-2
           text-sm ring-offset-background
           file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
           file:mr-4 file:py-0 file:px-0
           placeholder:text-muted-foreground
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
           disabled:cursor-not-allowed disabled:opacity-50`,
          error ? "border-destructive" : "border-input",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FileInput.displayName = "FileInput";

export { FileInput };
```

### File Dropzone

```typescript
// components/ui/file-dropzone.tsx
"use client";

import * as React from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
}

export function FileDropzone({
  onFilesSelected,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  disabled,
  error,
  errorMessage,
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatBytes(maxSize)}`;
    }
    if (accept) {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", "/"));
        }
        return file.type === type;
      });
      if (!isAccepted) {
        return "File type not accepted";
      }
    }
    return null;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles = Array.from(fileList).slice(0, maxFiles - files.length);
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      const error = validateFile(file);
      if (!error) {
        validFiles.push(file);
      }
    }
    
    const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          `relative flex flex-col items-center justify-center gap-2
           rounded-lg border-2 border-dashed p-6 transition-colors`,
          isDragging && "border-primary bg-primary/5",
          error ? "border-destructive" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer hover:border-primary/50"
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
        />
        
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept ? `Accepts: ${accept}` : "Any file type"}
            {maxSize && ` (max ${formatBytes(maxSize)})`}
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-md border p-2"
            >
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
```

## Variants

### Basic File Input

```tsx
<FileInput accept="image/*" />
```

### Dropzone

```tsx
<FileDropzone
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  onFilesSelected={handleFiles}
/>
```

### Multiple Files

```tsx
<FileDropzone
  accept=".pdf,.doc,.docx"
  maxFiles={5}
  onFilesSelected={handleFiles}
/>
```

## States

| State | Border | Background | Text | Icon |
|-------|--------|------------|------|------|
| Default | dashed muted | transparent | muted | muted |
| Hover | dashed primary/50 | transparent | muted | muted |
| Dragging | dashed primary | primary/5 | foreground | primary |
| Has files | solid border | transparent | - | - |
| Disabled | dashed muted | muted | muted | muted |
| Error | dashed destructive | transparent | destructive | - |

## Accessibility

### Required ARIA Attributes

- Hidden file input for screen readers
- Visible dropzone with role="button"
- `aria-disabled` when disabled
- `aria-invalid` when error

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus dropzone |
| `Enter/Space` | Open file picker |
| `Delete` | Remove focused file (if applicable) |

### Screen Reader Announcements

- Announce accepted file types
- Announce size limits
- Announce when files are added/removed

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "0.460.0"
  }
}
```

## Examples

### Basic Usage

```tsx
import { FileInput } from "@/components/ui/file-input";

<FileInput
  accept="image/*"
  onChange={(e) => console.log(e.target.files)}
/>
```

### With Label

```tsx
import { Label } from "@/components/ui/label";
import { FileInput } from "@/components/ui/file-input";

<div className="space-y-2">
  <Label htmlFor="resume">Resume</Label>
  <FileInput
    id="resume"
    accept=".pdf,.doc,.docx"
  />
</div>
```

### Dropzone

```tsx
import { FileDropzone } from "@/components/ui/file-dropzone";

const [files, setFiles] = useState<File[]>([]);

<FileDropzone
  accept="image/png,image/jpeg"
  maxSize={5 * 1024 * 1024}
  maxFiles={3}
  onFilesSelected={setFiles}
/>
```

### Image Upload with Preview

```tsx
const [preview, setPreview] = useState<string | null>(null);

function handleFileSelect(files: File[]) {
  if (files[0]) {
    const url = URL.createObjectURL(files[0]);
    setPreview(url);
  }
}

<div className="space-y-4">
  {preview && (
    <img
      src={preview}
      alt="Preview"
      className="w-32 h-32 object-cover rounded-lg"
    />
  )}
  <FileDropzone
    accept="image/*"
    maxFiles={1}
    onFilesSelected={handleFileSelect}
  />
</div>
```

### With Form Validation

```tsx
import { useForm, Controller } from "react-hook-form";

function UploadForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="document"
        control={control}
        rules={{ required: "Please upload a document" }}
        render={({ field }) => (
          <FileDropzone
            accept=".pdf"
            maxSize={10 * 1024 * 1024}
            onFilesSelected={(files) => field.onChange(files[0])}
            error={!!errors.document}
            errorMessage={errors.document?.message}
          />
        )}
      />
    </form>
  );
}
```

## Anti-patterns

### No File Type Indication

```tsx
// Bad - user doesn't know what to upload
<FileDropzone onFilesSelected={handleFiles} />

// Good - clear file type indication
<FileDropzone
  accept="image/png,image/jpeg"
  onFilesSelected={handleFiles}
/>
```

### No Size Limit

```tsx
// Bad - could upload massive files
<FileDropzone accept="video/*" onFilesSelected={handleFiles} />

// Good - reasonable size limit
<FileDropzone
  accept="video/*"
  maxSize={100 * 1024 * 1024}
  onFilesSelected={handleFiles}
/>
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Border and icon colors
- [input-button](./input-button.md) - Remove button

### Composes Into
- [file-uploader](../organisms/file-uploader.md) - With progress
- [settings-form](../organisms/settings-form.md) - Avatar upload

### Related
- [feedback-progress](./feedback-progress.md) - Upload progress

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Dropzone with drag-and-drop
- File preview and validation
