---
id: r-file-sharing
name: File Sharing
version: 3.0.0
layer: L6
category: recipes
description: File storage and sharing platform with folders, uploads, downloads, sharing links, and collaboration
tags: [files, storage, sharing, upload, download, collaboration, folders]
formula: "FileSharing = DashboardLayout(t-dashboard-layout) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + MarketingLayout(t-marketing-layout) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + FileUploader(o-file-uploader) + MediaGallery(o-media-gallery) + Tabs(o-tabs) + Modal(o-modal) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + SearchInput(m-search-input) + StatCard(m-stat-card) + ProgressBar(m-progress-bar) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + FileUpload(pt-file-upload) + MultipartUpload(pt-multipart-upload) + DownloadFiles(pt-download-files) + DragAndDrop(pt-drag-and-drop) + SharingLinks(pt-sharing-links) + PasswordProtection(pt-password-protection) + LinkExpiration(pt-link-expiration) + FilePreview(pt-file-preview) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Pagination(pt-pagination) + Search(pt-search) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + StripeSubscriptions(pt-stripe-subscriptions) + StorageQuotas(pt-storage-quotas) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + UserAnalytics(pt-user-analytics)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/marketing-layout.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/file-uploader.md
  - ../organisms/media-gallery.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/search-input.md
  - ../molecules/stat-card.md
  - ../molecules/progress-bar.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - File Management
  - ../patterns/file-upload.md
  - ../patterns/multipart-upload.md
  - ../patterns/download-files.md
  - ../patterns/drag-and-drop.md
  - ../patterns/sharing-links.md
  - ../patterns/password-protection.md
  - ../patterns/link-expiration.md
  - ../patterns/file-preview.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/search.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Monetization
  - ../patterns/stripe-subscriptions.md
  - ../patterns/storage-quotas.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Security (Additional)
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Analytics (Additional)
  - ../patterns/user-analytics.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - "@aws-sdk/client-s3"
  - "@aws-sdk/s3-request-presigner"
  - react-dropzone
  - "@radix-ui/react-context-menu"
  - "@radix-ui/react-dialog"
  - lucide-react
  - date-fns
skills:
  - file-upload
  - multipart-upload
  - download-files
  - drag-and-drop
  - sharing-links
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# File Sharing

## Overview

A complete file storage and sharing platform featuring:
- File and folder management
- Drag-and-drop uploads with progress
- Resumable multipart uploads for large files
- Shareable links with expiration and passwords
- File preview (images, PDFs, videos)
- Collaborative folders with permissions
- Storage quota management
- File versioning
- Search and filtering

## Project Structure

```
file-sharing/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # My Files
│   │   ├── folder/[folderId]/page.tsx
│   │   ├── shared/page.tsx             # Shared with me
│   │   ├── starred/page.tsx
│   │   ├── trash/page.tsx
│   │   └── settings/page.tsx
│   ├── (public)/
│   │   └── share/[shareId]/page.tsx    # Public share page
│   ├── api/
│   │   ├── files/
│   │   │   ├── route.ts
│   │   │   ├── [fileId]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── download/route.ts
│   │   │   │   ├── share/route.ts
│   │   │   │   └── versions/route.ts
│   │   │   └── upload/route.ts
│   │   ├── folders/
│   │   │   ├── route.ts
│   │   │   └── [folderId]/route.ts
│   │   ├── shares/
│   │   │   ├── route.ts
│   │   │   └── [shareId]/route.ts
│   │   └── search/route.ts
│   └── layout.tsx
├── components/
│   ├── files/
│   │   ├── file-browser.tsx
│   │   ├── file-card.tsx
│   │   ├── file-list.tsx
│   │   ├── file-preview.tsx
│   │   └── upload-zone.tsx
│   ├── folders/
│   │   ├── folder-tree.tsx
│   │   └── breadcrumb.tsx
│   ├── sharing/
│   │   ├── share-dialog.tsx
│   │   └── permission-selector.tsx
│   └── ui/
├── lib/
│   ├── s3.ts
│   ├── storage.ts
│   └── utils.ts
└── prisma/
    └── schema.prisma
```

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  avatar        String?
  
  // Storage
  storageUsed   BigInt   @default(0)
  storageLimit  BigInt   @default(5368709120) // 5GB default
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  files         File[]
  folders       Folder[]
  shares        Share[]  @relation("owner")
  sharedWithMe  ShareAccess[]
}

model Folder {
  id          String   @id @default(cuid())
  name        String
  
  // Hierarchy
  parentId    String?
  parent      Folder?  @relation("FolderChildren", fields: [parentId], references: [id])
  children    Folder[] @relation("FolderChildren")
  
  // Owner
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  // Files
  files       File[]
  
  // Sharing
  shares      Share[]
  
  // Metadata
  color       String?
  isStarred   Boolean  @default(false)
  isTrashed   Boolean  @default(false)
  trashedAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
  @@index([parentId])
}

model File {
  id          String   @id @default(cuid())
  name        String
  
  // Storage
  key         String   // S3 key
  size        BigInt
  mimeType    String
  
  // Folder
  folderId    String?
  folder      Folder?  @relation(fields: [folderId], references: [id])
  
  // Owner
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  // Versions
  versions    FileVersion[]
  currentVersionId String?
  
  // Sharing
  shares      Share[]
  
  // Preview
  thumbnailUrl String?
  previewUrl   String?
  
  // Metadata
  isStarred   Boolean  @default(false)
  isTrashed   Boolean  @default(false)
  trashedAt   DateTime?
  
  // Stats
  downloads   Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
  @@index([folderId])
  @@index([mimeType])
}

model FileVersion {
  id          String   @id @default(cuid())
  fileId      String
  file        File     @relation(fields: [fileId], references: [id], onDelete: Cascade)
  
  versionNumber Int
  key         String   // S3 key
  size        BigInt
  
  createdAt   DateTime @default(now())

  @@index([fileId])
}

model Share {
  id          String      @id @default(cuid())
  
  // What's being shared
  fileId      String?
  file        File?       @relation(fields: [fileId], references: [id], onDelete: Cascade)
  folderId    String?
  folder      Folder?     @relation(fields: [folderId], references: [id], onDelete: Cascade)
  
  // Owner
  ownerId     String
  owner       User        @relation("owner", fields: [ownerId], references: [id])
  
  // Share type
  type        ShareType   @default(LINK)
  
  // Link settings
  linkId      String?     @unique
  password    String?
  expiresAt   DateTime?
  maxDownloads Int?
  downloadCount Int       @default(0)
  
  // Permissions for shared users
  accesses    ShareAccess[]
  
  // Settings
  allowDownload Boolean   @default(true)
  allowEdit     Boolean   @default(false)
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([fileId])
  @@index([folderId])
  @@index([linkId])
}

enum ShareType {
  LINK
  USER
}

model ShareAccess {
  id          String     @id @default(cuid())
  shareId     String
  share       Share      @relation(fields: [shareId], references: [id], onDelete: Cascade)
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission  Permission @default(VIEW)
  
  createdAt   DateTime   @default(now())

  @@unique([shareId, userId])
}

enum Permission {
  VIEW
  EDIT
  ADMIN
}
```

## Implementation

### File Browser

```tsx
// components/files/file-browser.tsx
'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Grid, List, Upload, FolderPlus, Search,
  MoreHorizontal, Download, Trash2, Share2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { FileCard } from './file-card';
import { FileList } from './file-list';
import { UploadZone } from './upload-zone';
import { Breadcrumb } from '@/components/folders/breadcrumb';
import { ShareDialog } from '@/components/sharing/share-dialog';
import { cn, formatBytes } from '@/lib/utils';

interface FileBrowserProps {
  folderId?: string;
}

export function FileBrowser({ folderId }: FileBrowserProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [shareItem, setShareItem] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch files and folders
  const { data, isLoading } = useQuery({
    queryKey: ['files', folderId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (folderId) params.set('folderId', folderId);
      if (search) params.set('search', search);
      
      const response = await fetch(`/api/files?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  // Upload files
  const uploadFiles = useMutation({
    mutationFn: async (files: File[]) => {
      setIsUploading(true);
      const results = [];
      
      for (const file of files) {
        // Get presigned URL
        const presignRes = await fetch('/api/files/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            mimeType: file.type,
            folderId,
          }),
        });
        
        if (!presignRes.ok) throw new Error('Failed to get upload URL');
        const { uploadUrl, fileId } = await presignRes.json();

        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        // Confirm upload
        await fetch(`/api/files/${fileId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        });

        results.push(fileId);
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage'] });
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  // Create folder
  const createFolder = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: folderId }),
      });
      if (!response.ok) throw new Error('Failed to create folder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  // Delete items
  const deleteItems = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/files/${id}`, { method: 'DELETE' })
        )
      );
    },
    onSuccess: () => {
      setSelectedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    uploadFiles.mutate(acceptedFiles);
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    const allIds = [
      ...(data?.folders || []).map((f: any) => f.id),
      ...(data?.files || []).map((f: any) => f.id),
    ];
    setSelectedItems(new Set(allIds));
  };

  return (
    <div {...getRootProps()} className="h-full flex flex-col">
      <input {...getInputProps()} />

      {/* Drag Overlay */}
      {isDragActive && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl z-50 flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <p className="text-lg font-medium">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Breadcrumb folderId={folderId} />
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(viewMode === 'grid' && 'bg-gray-100')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && 'bg-gray-100')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b">
        <UploadZone folderId={folderId} onUpload={(files) => uploadFiles.mutate(files)} />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const name = prompt('Folder name:');
            if (name) createFolder.mutate(name);
          }}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>

        {selectedItems.size > 0 && (
          <>
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <span className="text-sm text-gray-500">
              {selectedItems.size} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteItems.mutate(Array.from(selectedItems))}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {/* Folders */}
            {data?.folders?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Folders</h3>
                <div className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                    : 'space-y-1'
                )}>
                  {data.folders.map((folder: any) => (
                    <ContextMenu key={folder.id}>
                      <ContextMenuTrigger>
                        <FileCard
                          item={folder}
                          type="folder"
                          viewMode={viewMode}
                          isSelected={selectedItems.has(folder.id)}
                          onSelect={() => toggleSelect(folder.id)}
                        />
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => setShareItem(folder)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Star
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-red-600"
                          onClick={() => deleteItems.mutate([folder.id])}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {data?.files?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Files</h3>
                <div className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                    : 'space-y-1'
                )}>
                  {data.files.map((file: any) => (
                    <ContextMenu key={file.id}>
                      <ContextMenuTrigger>
                        <FileCard
                          item={file}
                          type="file"
                          viewMode={viewMode}
                          isSelected={selectedItems.has(file.id)}
                          onSelect={() => toggleSelect(file.id)}
                        />
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem asChild>
                          <a href={`/api/files/${file.id}/download`}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => setShareItem(file)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Star
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-red-600"
                          onClick={() => deleteItems.mutate([file.id])}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {data?.folders?.length === 0 && data?.files?.length === 0 && (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No files yet</p>
                <p className="text-gray-500 mb-4">
                  Drag and drop files here, or click to upload
                </p>
                <UploadZone
                  folderId={folderId}
                  onUpload={(files) => uploadFiles.mutate(files)}
                  asButton
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Dialog */}
      {shareItem && (
        <ShareDialog
          item={shareItem}
          onClose={() => setShareItem(null)}
        />
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 rounded-xl border shadow-lg p-4 w-80">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            <div>
              <p className="font-medium">Uploading...</p>
              <p className="text-sm text-gray-500">Please wait</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### File Card

```tsx
// components/files/file-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Folder, File, FileText, FileImage, FileVideo,
  FileAudio, FileArchive, Star, MoreHorizontal
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn, formatBytes } from '@/lib/utils';

interface FileCardProps {
  item: {
    id: string;
    name: string;
    size?: number;
    mimeType?: string;
    thumbnailUrl?: string;
    isStarred?: boolean;
    updatedAt: string;
  };
  type: 'file' | 'folder';
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
}

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return FileArchive;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
  return File;
};

const getFileColor = (mimeType?: string) => {
  if (!mimeType) return 'text-gray-500';
  if (mimeType.startsWith('image/')) return 'text-green-500';
  if (mimeType.startsWith('video/')) return 'text-purple-500';
  if (mimeType.startsWith('audio/')) return 'text-pink-500';
  if (mimeType.includes('pdf')) return 'text-red-500';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'text-blue-500';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'text-green-600';
  return 'text-gray-500';
};

export function FileCard({ item, type, viewMode, isSelected, onSelect }: FileCardProps) {
  const Icon = type === 'folder' ? Folder : getFileIcon(item.mimeType);
  const iconColor = type === 'folder' ? 'text-yellow-500' : getFileColor(item.mimeType);
  const href = type === 'folder' ? `/folder/${item.id}` : `/preview/${item.id}`;

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          isSelected && 'bg-blue-50 dark:bg-blue-900/20'
        )}
      >
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        
        <Link href={href} className="flex items-center gap-3 flex-1">
          <Icon className={cn('h-6 w-6', iconColor)} />
          <span className="flex-1 truncate">{item.name}</span>
        </Link>
        
        {item.size && (
          <span className="text-sm text-gray-500">{formatBytes(item.size)}</span>
        )}
        
        <span className="text-sm text-gray-500">
          {format(new Date(item.updatedAt), 'MMM d, yyyy')}
        </span>
        
        {item.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer',
        isSelected && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      )}
    >
      {/* Select Checkbox */}
      <div className={cn(
        'absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity',
        isSelected && 'opacity-100'
      )}>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </div>

      {/* Star */}
      {item.isStarred && (
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      <Link href={href}>
        {/* Thumbnail/Icon */}
        <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 overflow-hidden">
          {type === 'file' && item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              width={200}
              height={200}
              className="object-cover w-full h-full"
            />
          ) : (
            <Icon className={cn('h-12 w-12', iconColor)} />
          )}
        </div>

        {/* Info */}
        <div>
          <p className="font-medium text-sm truncate" title={item.name}>
            {item.name}
          </p>
          {item.size && (
            <p className="text-xs text-gray-500 mt-1">
              {formatBytes(item.size)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
```

### Share Dialog

```tsx
// components/sharing/share-dialog.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Check, Link, Users, Globe, Lock, Calendar, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ShareDialogProps {
  item: {
    id: string;
    name: string;
    type: 'file' | 'folder';
    shares?: any[];
  };
  onClose: () => void;
}

export function ShareDialog({ item, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [linkSettings, setLinkSettings] = useState({
    password: '',
    expiresIn: 'never',
    maxDownloads: '',
    allowDownload: true,
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState('VIEW');
  const queryClient = useQueryClient();

  const createShareLink = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/files/${item.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'LINK',
          password: linkSettings.password || undefined,
          expiresIn: linkSettings.expiresIn !== 'never' ? linkSettings.expiresIn : undefined,
          maxDownloads: linkSettings.maxDownloads ? parseInt(linkSettings.maxDownloads) : undefined,
          allowDownload: linkSettings.allowDownload,
        }),
      });
      if (!response.ok) throw new Error('Failed to create share link');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares', item.id] });
    },
  });

  const inviteUser = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/files/${item.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'USER',
          email: inviteEmail,
          permission: invitePermission,
        }),
      });
      if (!response.ok) throw new Error('Failed to invite user');
      return response.json();
    },
    onSuccess: () => {
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['shares', item.id] });
    },
  });

  const shareLink = item.shares?.find((s: any) => s.type === 'LINK');
  const shareUrl = shareLink
    ? `${window.location.origin}/share/${shareLink.linkId}`
    : null;

  const copyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{item.name}"</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link">
          <TabsList className="w-full">
            <TabsTrigger value="link" className="flex-1">
              <Link className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
            <TabsTrigger value="people" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              People
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            {/* Share Link */}
            {shareUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input value={shareUrl} readOnly className="bg-gray-50" />
                  <Button onClick={copyLink} variant="outline">
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Link Info */}
                <div className="text-sm text-gray-500 space-y-1">
                  {shareLink.password && (
                    <p className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password protected
                    </p>
                  )}
                  {shareLink.expiresAt && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Expires: {new Date(shareLink.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                  {shareLink.maxDownloads && (
                    <p className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      {shareLink.downloadCount}/{shareLink.maxDownloads} downloads
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Password */}
                <div>
                  <label className="text-sm font-medium">Password (optional)</label>
                  <Input
                    type="password"
                    value={linkSettings.password}
                    onChange={(e) => setLinkSettings({ ...linkSettings, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>

                {/* Expiration */}
                <div>
                  <label className="text-sm font-medium">Link expires</label>
                  <Select
                    value={linkSettings.expiresIn}
                    onValueChange={(value) => setLinkSettings({ ...linkSettings, expiresIn: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Downloads */}
                <div>
                  <label className="text-sm font-medium">Max downloads (optional)</label>
                  <Input
                    type="number"
                    value={linkSettings.maxDownloads}
                    onChange={(e) => setLinkSettings({ ...linkSettings, maxDownloads: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>

                {/* Allow Download */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Allow download</label>
                  <Switch
                    checked={linkSettings.allowDownload}
                    onCheckedChange={(checked) =>
                      setLinkSettings({ ...linkSettings, allowDownload: checked })
                    }
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => createShareLink.mutate()}
                  disabled={createShareLink.isPending}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Create Share Link
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="people" className="space-y-4 mt-4">
            {/* Invite */}
            <div className="flex gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1"
              />
              <Select value={invitePermission} onValueChange={setInvitePermission}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEW">View</SelectItem>
                  <SelectItem value="EDIT">Edit</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => inviteUser.mutate()}
                disabled={!inviteEmail || inviteUser.isPending}
              >
                Invite
              </Button>
            </div>

            {/* Shared with */}
            <div>
              <h4 className="text-sm font-medium mb-2">Shared with</h4>
              <div className="space-y-2">
                {item.shares
                  ?.filter((s: any) => s.type === 'USER')
                  .map((share: any) =>
                    share.accesses?.map((access: any) => (
                      <div key={access.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {access.user.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{access.user.name}</p>
                            <p className="text-xs text-gray-500">{access.user.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">
                          {access.permission.toLowerCase()}
                        </span>
                      </div>
                    ))
                  )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

### Upload API with S3

```tsx
// app/api/files/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const uploadSchema = z.object({
  name: z.string(),
  size: z.number(),
  mimeType: z.string(),
  folderId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, size, mimeType, folderId } = uploadSchema.parse(body);

    // Check storage quota
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { storageUsed: true, storageLimit: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newStorageUsed = Number(user.storageUsed) + size;
    if (newStorageUsed > Number(user.storageLimit)) {
      return NextResponse.json({ error: 'Storage limit exceeded' }, { status: 400 });
    }

    // Generate S3 key
    const key = `${session.user.id}/${nanoid()}/${name}`;

    // Create file record
    const file = await prisma.file.create({
      data: {
        name,
        key,
        size: BigInt(size),
        mimeType,
        folderId,
        ownerId: session.user.id,
      },
    });

    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      fileId: file.id,
      uploadUrl,
      key,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Download API

```tsx
// app/api/files/[fileId]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const session = await getServerSession(authOptions);

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      shares: {
        where: {
          OR: [
            { type: 'LINK', allowDownload: true },
            {
              type: 'USER',
              accesses: {
                some: { userId: session?.user?.id },
              },
            },
          ],
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Check access
  const isOwner = file.ownerId === session?.user?.id;
  const hasAccess = file.shares.length > 0;

  if (!isOwner && !hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Generate presigned download URL
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: file.key,
    ResponseContentDisposition: `attachment; filename="${file.name}"`,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  // Increment download count
  await prisma.file.update({
    where: { id: fileId },
    data: { downloads: { increment: 1 } },
  });

  return NextResponse.redirect(downloadUrl);
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| dashboard-layout | L5 | Main app shell with sidebar navigation |
| settings-page | L5 | User preferences and storage management |
| file-upload | L4 | Single file upload with presigned URLs |
| multipart-upload | L4 | Chunked uploads for large files |
| download-files | L4 | Secure file download with presigned URLs |
| drag-and-drop | L4 | Drag-and-drop file browser interface |
| sharing-links | L4 | Public share links with password protection |

## Testing

### Test Setup

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```ts
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock S3 client
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://mock-presigned-url.com'),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/files',
  useSearchParams: () => new URLSearchParams(),
}));
```

### Unit Tests

```tsx
// components/files/__tests__/file-card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileCard } from '../file-card';
import { describe, it, expect, vi } from 'vitest';

describe('FileCard', () => {
  const mockFile = {
    id: '1',
    name: 'document.pdf',
    size: 1024000,
    mimeType: 'application/pdf',
    updatedAt: '2024-01-15T10:00:00Z',
    isStarred: false,
  };

  it('renders file name and size', () => {
    render(
      <FileCard
        item={mockFile}
        type="file"
        viewMode="grid"
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });

  it('shows correct icon for file type', () => {
    render(
      <FileCard
        item={mockFile}
        type="file"
        viewMode="grid"
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    // PDF files should show FileText icon (red color)
    const icon = screen.getByTestId('file-icon');
    expect(icon).toHaveClass('text-red-500');
  });

  it('handles selection toggle', async () => {
    const onSelect = vi.fn();
    render(
      <FileCard
        item={mockFile}
        type="file"
        viewMode="list"
        isSelected={false}
        onSelect={onSelect}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(onSelect).toHaveBeenCalled();
  });

  it('shows star indicator when starred', () => {
    render(
      <FileCard
        item={{ ...mockFile, isStarred: true }}
        type="file"
        viewMode="grid"
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
  });
});
```

```tsx
// components/sharing/__tests__/share-dialog.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShareDialog } from '../share-dialog';
import { describe, it, expect, vi } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('ShareDialog', () => {
  const mockItem = {
    id: '1',
    name: 'project-files',
    type: 'folder' as const,
    shares: [],
  };

  it('renders share tabs', () => {
    render(<ShareDialog item={mockItem} onClose={vi.fn()} />, { wrapper });

    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
  });

  it('creates share link with options', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ linkId: 'abc123' }),
    } as Response);

    render(<ShareDialog item={mockItem} onClose={vi.fn()} />, { wrapper });

    // Set expiration
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('7 days'));

    // Create link
    await userEvent.click(screen.getByText('Create Share Link'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/files/1/share',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    mockFetch.mockRestore();
  });
});
```

### Integration Tests

```tsx
// tests/integration/file-upload.test.ts
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('File Upload Integration', () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'filetest@example.com',
        name: 'File Test User',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.file.deleteMany({ where: { ownerId: testUserId } });
    await prisma.folder.deleteMany({ where: { ownerId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it('creates file record and returns presigned URL', async () => {
    const file = await prisma.file.create({
      data: {
        name: 'test-document.pdf',
        key: `${testUserId}/abc123/test-document.pdf`,
        size: BigInt(1024000),
        mimeType: 'application/pdf',
        ownerId: testUserId,
      },
    });

    expect(file.id).toBeDefined();
    expect(file.name).toBe('test-document.pdf');
  });

  it('updates storage quota after upload', async () => {
    const fileSize = BigInt(5000000);

    await prisma.file.create({
      data: {
        name: 'large-file.zip',
        key: `${testUserId}/def456/large-file.zip`,
        size: fileSize,
        mimeType: 'application/zip',
        ownerId: testUserId,
      },
    });

    await prisma.user.update({
      where: { id: testUserId },
      data: { storageUsed: { increment: fileSize } },
    });

    const user = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(Number(user?.storageUsed)).toBeGreaterThanOrEqual(5000000);
  });

  it('creates folder hierarchy correctly', async () => {
    const parentFolder = await prisma.folder.create({
      data: {
        name: 'Projects',
        ownerId: testUserId,
      },
    });

    const childFolder = await prisma.folder.create({
      data: {
        name: 'Website',
        parentId: parentFolder.id,
        ownerId: testUserId,
      },
    });

    const result = await prisma.folder.findUnique({
      where: { id: childFolder.id },
      include: { parent: true },
    });

    expect(result?.parent?.name).toBe('Projects');
  });
});
```

### E2E Tests

```ts
// tests/e2e/file-sharing.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('File Sharing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('uploads file via drag and drop', async ({ page }) => {
    // Create a test file
    const filePath = path.join(__dirname, '../fixtures/test-document.pdf');

    // Trigger drag and drop
    const dropzone = page.locator('[data-testid="file-browser"]');

    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await page.dispatchEvent('[data-testid="file-browser"]', 'drop', {
      dataTransfer,
    });

    // Use file chooser for fallback
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Upload');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    await expect(page.locator('text=test-document.pdf')).toBeVisible();
  });

  test('creates and shares folder with link', async ({ page }) => {
    // Create folder
    await page.click('text=New Folder');
    await page.fill('[placeholder="Folder name"]', 'Shared Documents');
    await page.click('text=Create');

    await expect(page.locator('text=Shared Documents')).toBeVisible();

    // Open context menu
    await page.click('text=Shared Documents', { button: 'right' });
    await page.click('text=Share');

    // Create share link
    await page.click('text=Create Share Link');

    await expect(page.locator('[data-testid="share-url"]')).toBeVisible();

    // Copy link
    await page.click('[data-testid="copy-link-button"]');
  });

  test('downloads file successfully', async ({ page }) => {
    // Upload a file first
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Upload');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('./tests/fixtures/test-document.pdf');

    await page.waitForSelector('text=test-document.pdf');

    // Download via context menu
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=test-document.pdf', { button: 'right' });
    await page.click('text=Download');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test-document.pdf');
  });

  test('accesses shared link with password', async ({ page, context }) => {
    // Create a password-protected share
    await page.click('text=test-file.pdf', { button: 'right' });
    await page.click('text=Share');
    await page.fill('[placeholder="Enter password"]', 'secret123');
    await page.click('text=Create Share Link');

    const shareUrl = await page.locator('[data-testid="share-url"]').inputValue();

    // Open in new page (simulating public access)
    const publicPage = await context.newPage();
    await publicPage.goto(shareUrl);

    // Enter password
    await publicPage.fill('[name="password"]', 'secret123');
    await publicPage.click('text=Access File');

    await expect(publicPage.locator('text=test-file.pdf')).toBeVisible();
  });

  test('respects storage quota limits', async ({ page }) => {
    // Try to upload a file that exceeds quota
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Upload');
    const fileChooser = await fileChooserPromise;

    // This should fail if file exceeds user's remaining quota
    await fileChooser.setFiles('./tests/fixtures/large-file.zip');

    // Check for quota exceeded message
    await expect(page.locator('text=Storage limit exceeded')).toBeVisible({
      timeout: 10000,
    });
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FolderX } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('File Sharing Error:', error, errorInfo);

    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <FolderX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to load files</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An error occurred while loading your files'}
            </p>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```tsx
// lib/api-error.ts
import { z } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class StorageQuotaError extends APIError {
  constructor(used: bigint, limit: bigint) {
    super(
      `Storage limit exceeded. Using ${formatBytes(Number(used))} of ${formatBytes(Number(limit))}`,
      400,
      'STORAGE_QUOTA_EXCEEDED'
    );
  }
}

export class FileNotFoundError extends APIError {
  constructor(fileId: string) {
    super(`File not found: ${fileId}`, 404, 'FILE_NOT_FOUND');
  }
}

export class ShareExpiredError extends APIError {
  constructor() {
    super('This share link has expired', 410, 'SHARE_EXPIRED');
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Form Validation Errors

```tsx
// components/ui/upload-error.tsx
import { AlertCircle, RefreshCw } from 'lucide-react';

interface UploadErrorProps {
  fileName: string;
  error: string;
  onRetry?: () => void;
}

export function UploadError({ fileName, error, onRetry }: UploadErrorProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{fileName}</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-red-600" />
        </button>
      )}
    </div>
  );
}

// Common upload error messages
export const uploadErrors = {
  fileTooLarge: (max: string) => `File exceeds maximum size of ${max}`,
  invalidType: (types: string[]) => `Only ${types.join(', ')} files are allowed`,
  quotaExceeded: 'Storage quota exceeded',
  networkError: 'Upload failed. Please check your connection',
  serverError: 'Server error. Please try again later',
};
```

## Accessibility

| WCAG Criterion | Level | Implementation |
|----------------|-------|----------------|
| 1.1.1 Non-text Content | A | Alt text for file thumbnails, icons have aria-labels |
| 1.3.1 Info and Relationships | A | File list uses proper table/grid semantics |
| 1.4.3 Contrast | AA | 4.5:1 contrast for file names and metadata |
| 2.1.1 Keyboard | A | All file actions accessible via keyboard |
| 2.1.2 No Keyboard Trap | A | Focus can move freely in modals and dropdowns |
| 2.4.1 Bypass Blocks | A | Skip links to main content and file list |
| 2.4.3 Focus Order | A | Logical tab order through file browser |
| 2.4.7 Focus Visible | AA | Clear focus indicators on files and buttons |
| 3.3.1 Error Identification | A | Upload errors clearly identified |
| 4.1.2 Name, Role, Value | A | ARIA for custom context menus and dialogs |

### Focus Management for Mobile

```tsx
// hooks/use-file-focus.ts
import { useEffect, useRef, useCallback } from 'react';

export function useFileGridNavigation() {
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const grid = gridRef.current;
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('[data-file-item]'));
    const currentIndex = items.findIndex(
      (item) => item === document.activeElement
    );

    let nextIndex = currentIndex;
    const cols = Math.floor(grid.clientWidth / 200); // Approximate columns

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + cols, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - cols, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    (items[nextIndex] as HTMLElement)?.focus();
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.addEventListener('keydown', handleKeyDown);
    return () => grid.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return gridRef;
}
```

### Accessible Forms

```tsx
// components/files/accessible-upload-zone.tsx
<div
  role="region"
  aria-label="File upload area"
  {...getRootProps()}
  className={cn(
    'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
    isDragActive && 'border-blue-500 bg-blue-50'
  )}
>
  <input
    {...getInputProps()}
    aria-label="File input"
    aria-describedby="upload-instructions"
  />

  <p id="upload-instructions" className="sr-only">
    Drag and drop files here, or press Enter to open file browser.
    Supported formats: all file types. Maximum size: 5GB per file.
  </p>

  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />

  <p className="text-lg font-medium" aria-live="polite">
    {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
  </p>

  <p className="text-sm text-gray-500 mt-2">
    or <span className="text-blue-600">browse files</span>
  </p>
</div>
```

## Security

### Input Validation with Zod

```tsx
// lib/validations/file.ts
import { z } from 'zod';

export const uploadSchema = z.object({
  name: z
    .string()
    .min(1, 'File name required')
    .max(255, 'File name too long')
    .regex(/^[^<>:"/\\|?*\x00-\x1F]+$/, 'Invalid file name characters'),
  size: z
    .number()
    .positive('File size must be positive')
    .max(5 * 1024 * 1024 * 1024, 'File exceeds 5GB limit'),
  mimeType: z.string().min(1, 'MIME type required'),
  folderId: z.string().cuid().optional(),
});

export const shareSchema = z.object({
  type: z.enum(['LINK', 'USER']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  expiresIn: z.enum(['1h', '24h', '7d', '30d', 'never']).optional(),
  maxDownloads: z.number().int().positive().max(1000).optional(),
  allowDownload: z.boolean().default(true),
  email: z.string().email().optional(),
  permission: z.enum(['VIEW', 'EDIT', 'ADMIN']).optional(),
});

export const folderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name required')
    .max(100, 'Folder name too long')
    .regex(/^[^<>:"/\\|?*\x00-\x1F]+$/, 'Invalid folder name'),
  parentId: z.string().cuid().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// Validate file type against allowed types
export function validateFileType(mimeType: string, allowed?: string[]): boolean {
  if (!allowed || allowed.length === 0) return true;

  return allowed.some((type) => {
    if (type.endsWith('/*')) {
      return mimeType.startsWith(type.slice(0, -1));
    }
    return mimeType === type;
  });
}
```

### Rate Limiting Configuration

```tsx
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimits = {
  // File listing
  list: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:list',
  }),

  // File uploads (per user)
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    prefix: 'ratelimit:upload',
  }),

  // Download requests
  download: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:download',
  }),

  // Share link creation
  share: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'ratelimit:share',
  }),

  // Public share access (by IP)
  publicAccess: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'ratelimit:public',
  }),
};
```

### Auth Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Public share pages don't require auth
  if (pathname.startsWith('/share/')) {
    return NextResponse.next();
  }

  // Auth pages
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.amazonaws.com;"
  );

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## Performance

### Caching Strategies

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';

// Cache folder structure (changes less frequently)
export const getCachedFolderTree = unstable_cache(
  async (userId: string) => {
    return prisma.folder.findMany({
      where: { ownerId: userId, isTrashed: false },
      select: { id: true, name: true, parentId: true, color: true },
      orderBy: { name: 'asc' },
    });
  },
  ['folder-tree'],
  { revalidate: 60, tags: ['folders'] }
);

// Cache storage usage
export const getCachedStorageUsage = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageLimit: true },
    });
    return {
      used: Number(user?.storageUsed || 0),
      limit: Number(user?.storageLimit || 0),
      percentage: user
        ? (Number(user.storageUsed) / Number(user.storageLimit)) * 100
        : 0,
    };
  },
  ['storage-usage'],
  { revalidate: 30, tags: ['storage'] }
);

// React Query configuration
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
};
```

### Image Optimization

```tsx
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default config;
```

### Bundle Optimization

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

// Lazy load file preview (only needed when viewing files)
export const FilePreview = dynamic(
  () => import('@/components/files/file-preview'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false,
  }
);

// Lazy load PDF viewer
export const PDFViewer = dynamic(
  () => import('@/components/preview/pdf-viewer'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false,
  }
);

// Lazy load video player
export const VideoPlayer = dynamic(
  () => import('@/components/preview/video-player'),
  {
    loading: () => <div className="aspect-video bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false,
  }
);
```

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  AWS_REGION: ${{ secrets.AWS_REGION }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: filesharing_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/filesharing_test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, typecheck, test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Setup

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    // Remove file paths and names from errors
    if (event.extra?.fileName) {
      event.extra.fileName = '[REDACTED]';
    }
    return event;
  },
});
```

### Health Check Endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function GET() {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {} as Record<string, { status: string; latency?: number }>,
  };

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    healthcheck.status = 'degraded';
    healthcheck.checks.database = { status: 'error' };
  }

  // S3 check
  const s3Start = Date.now();
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET }));
    healthcheck.checks.storage = {
      status: 'ok',
      latency: Date.now() - s3Start,
    };
  } catch (error) {
    healthcheck.status = 'degraded';
    healthcheck.checks.storage = { status: 'error' };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  healthcheck.checks.memory = {
    status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'ok' : 'warning',
  };

  const statusCode = healthcheck.status === 'ok' ? 200 : 503;
  return NextResponse.json(healthcheck, { status: statusCode });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/filesharing"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-file-bucket"

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Sentry (Error Monitoring)
SENTRY_DSN="https://your-dsn@sentry.io/project"
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project"

# File Limits
MAX_FILE_SIZE="5368709120" # 5GB in bytes
DEFAULT_STORAGE_LIMIT="5368709120" # 5GB

# Share Links
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment Checklist

- [ ] All environment variables configured in production
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] S3 bucket created with proper permissions
- [ ] S3 CORS configuration set for browser uploads
- [ ] S3 lifecycle rules configured for versioning/cleanup
- [ ] Redis instance provisioned for rate limiting
- [ ] Sentry project configured and DSN added
- [ ] SSL certificate configured
- [ ] Rate limiting tested
- [ ] File upload size limits configured in Vercel/hosting
- [ ] Presigned URL expiration times verified
- [ ] Share link encryption key configured
- [ ] Database connection pooling enabled
- [ ] CDN configured for static assets
- [ ] Health check endpoint accessible
- [ ] Backup strategy for database implemented
- [ ] S3 versioning enabled for file recovery
- [ ] WCAG accessibility audit passed
- [ ] Load testing for concurrent uploads completed
- [ ] Security headers configured
- [ ] Content Security Policy allows S3 connections

## Related Skills

- [File Upload](../patterns/file-upload.md) - Upload handling
- [Multipart Upload](../patterns/multipart-upload.md) - Large file uploads
- [Download Files](../patterns/download-files.md) - File downloads
- [Drag and Drop](../patterns/drag-and-drop.md) - DnD uploads
- [Sharing Links](../patterns/sharing-links.md) - Public shares

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with file browser
- S3 integration for storage
- Folder hierarchy
- Share links with expiration and passwords
- File preview for common types
- Storage quota management
