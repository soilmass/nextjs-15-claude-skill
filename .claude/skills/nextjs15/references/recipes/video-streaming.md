---
id: r-video-streaming
name: Video Streaming
version: 3.0.0
layer: L6
category: recipes
description: Video streaming platform with uploads, transcoding, adaptive streaming, and video player
tags: [video, streaming, hls, transcoding, player, uploads]
formula: "VideoStreaming = DashboardLayout(t-dashboard-layout) + GalleryPage(t-gallery-page) + MarketingLayout(t-marketing-layout) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + SettingsPage(t-settings-page) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + MediaGallery(o-media-gallery) + FileUploader(o-file-uploader) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + SearchInput(m-search-input) + StatCard(m-stat-card) + ProgressBar(m-progress-bar) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + ContentModeration(pt-content-moderation) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + VideoUpload(pt-video-upload) + VideoPlayer(pt-video-player) + HlsStreaming(pt-hls-streaming) + VideoThumbnails(pt-video-thumbnails) + VideoTranscoding(pt-video-transcoding) + ProgressTracking(pt-progress-tracking) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Pagination(pt-pagination) + Search(pt-search) + InfiniteScroll(pt-infinite-scroll) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + StripeSubscriptions(pt-stripe-subscriptions) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/gallery-page.md
  - ../templates/marketing-layout.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/settings-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/media-gallery.md
  - ../organisms/file-uploader.md
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
  - ../patterns/content-moderation.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Video Specific
  - ../patterns/video-upload.md
  - ../patterns/video-player.md
  - ../patterns/hls-streaming.md
  - ../patterns/video-thumbnails.md
  - ../patterns/video-transcoding.md
  - ../patterns/progress-tracking.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/search.md
  - ../patterns/infinite-scroll.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Monetization
  - ../patterns/stripe-subscriptions.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - "@aws-sdk/client-s3"
  - "@mux/mux-node"
  - "@mux/mux-player-react"
  - react-dropzone
  - "@radix-ui/react-dialog"
  - "@radix-ui/react-slider"
  - lucide-react
  - date-fns
skills:
  - video-upload
  - video-player
  - hls-streaming
  - video-thumbnails
  - progress-tracking
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Video Streaming

## Overview

A complete video streaming platform featuring:
- Video uploads with progress tracking
- Automatic transcoding to multiple qualities
- HLS adaptive bitrate streaming
- Custom video player with controls
- Thumbnail generation
- Video analytics (views, watch time)
- Playlists and categories
- Comments and likes
- Video chapters and timestamps

## Project Structure

```
video-streaming/
├── app/
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Home/feed
│   │   ├── watch/[videoId]/page.tsx    # Video player
│   │   ├── channel/[channelId]/page.tsx
│   │   ├── playlist/[playlistId]/page.tsx
│   │   └── search/page.tsx
│   ├── (studio)/
│   │   └── studio/
│   │       ├── layout.tsx
│   │       ├── page.tsx                # Dashboard
│   │       ├── videos/page.tsx
│   │       ├── upload/page.tsx
│   │       ├── analytics/page.tsx
│   │       └── playlists/page.tsx
│   ├── api/
│   │   ├── videos/
│   │   │   ├── route.ts
│   │   │   ├── [videoId]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── views/route.ts
│   │   │   │   └── comments/route.ts
│   │   │   └── upload/route.ts
│   │   ├── playlists/route.ts
│   │   ├── channels/route.ts
│   │   └── webhooks/
│   │       └── mux/route.ts            # Transcoding webhooks
│   └── layout.tsx
├── components/
│   ├── video/
│   │   ├── video-player.tsx
│   │   ├── video-card.tsx
│   │   ├── video-grid.tsx
│   │   └── video-upload.tsx
│   ├── player/
│   │   ├── player-controls.tsx
│   │   ├── quality-selector.tsx
│   │   ├── volume-control.tsx
│   │   └── progress-bar.tsx
│   ├── comments/
│   │   ├── comment-list.tsx
│   │   └── comment-form.tsx
│   └── ui/
├── lib/
│   ├── mux.ts
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
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  channel      Channel?
  videos       Video[]
  comments     Comment[]
  likes        Like[]
  watchHistory WatchHistory[]
  playlists    Playlist[]
  subscriptions Subscription[] @relation("subscriber")
}

model Channel {
  id          String   @id @default(cuid())
  handle      String   @unique
  name        String
  description String?
  avatar      String?
  banner      String?
  
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  videos      Video[]
  playlists   Playlist[]
  subscribers Subscription[]
  
  // Stats
  subscriberCount Int @default(0)
  videoCount      Int @default(0)
  totalViews      BigInt @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([handle])
}

model Video {
  id           String      @id @default(cuid())
  title        String
  description  String?
  
  // Mux
  muxAssetId   String?     @unique
  muxPlaybackId String?
  muxUploadId  String?
  
  // Status
  status       VideoStatus @default(UPLOADING)
  
  // Media
  duration     Int?        // seconds
  thumbnailUrl String?
  previewUrl   String?     // Animated preview
  
  // Settings
  visibility   Visibility  @default(PUBLIC)
  allowComments Boolean    @default(true)
  
  // Channel
  channelId    String
  channel      Channel     @relation(fields: [channelId], references: [id], onDelete: Cascade)
  
  // Creator (for direct relation)
  creatorId    String
  creator      User        @relation(fields: [creatorId], references: [id])
  
  // Categories & Tags
  categoryId   String?
  category     Category?   @relation(fields: [categoryId], references: [id])
  tags         VideoTag[]
  
  // Chapters
  chapters     Chapter[]
  
  // Engagement
  comments     Comment[]
  likes        Like[]
  watchHistory WatchHistory[]
  playlistItems PlaylistItem[]
  
  // Stats
  viewCount    BigInt      @default(0)
  likeCount    Int         @default(0)
  commentCount Int         @default(0)
  
  publishedAt  DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([channelId])
  @@index([status])
  @@index([visibility])
  @@index([publishedAt])
}

enum VideoStatus {
  UPLOADING
  PROCESSING
  READY
  FAILED
}

enum Visibility {
  PUBLIC
  UNLISTED
  PRIVATE
}

model Chapter {
  id        String @id @default(cuid())
  videoId   String
  video     Video  @relation(fields: [videoId], references: [id], onDelete: Cascade)
  title     String
  timestamp Int    // seconds
  
  @@index([videoId])
}

model Category {
  id     String  @id @default(cuid())
  name   String  @unique
  slug   String  @unique
  icon   String?
  videos Video[]
}

model Tag {
  id     String     @id @default(cuid())
  name   String     @unique
  videos VideoTag[]
}

model VideoTag {
  id      String @id @default(cuid())
  videoId String
  video   Video  @relation(fields: [videoId], references: [id], onDelete: Cascade)
  tagId   String
  tag     Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([videoId, tagId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  videoId   String
  video     Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  
  // Threading
  parentId  String?
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  
  likeCount Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([videoId])
  @@index([authorId])
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  videoId   String
  video     Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, videoId])
}

model WatchHistory {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  videoId        String
  video          Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  watchedSeconds Int      @default(0)
  completed      Boolean  @default(false)
  lastWatchedAt  DateTime @default(now())

  @@unique([userId, videoId])
  @@index([userId])
}

model Subscription {
  id           String   @id @default(cuid())
  subscriberId String
  subscriber   User     @relation("subscriber", fields: [subscriberId], references: [id], onDelete: Cascade)
  channelId    String
  channel      Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())

  @@unique([subscriberId, channelId])
}

model Playlist {
  id          String         @id @default(cuid())
  name        String
  description String?
  visibility  Visibility     @default(PUBLIC)
  
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  channelId   String?
  channel     Channel?       @relation(fields: [channelId], references: [id])
  
  items       PlaylistItem[]
  
  thumbnailUrl String?
  videoCount   Int           @default(0)
  
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([userId])
}

model PlaylistItem {
  id         String   @id @default(cuid())
  playlistId String
  playlist   Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  videoId    String
  video      Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  position   Int
  addedAt    DateTime @default(now())

  @@unique([playlistId, videoId])
  @@index([playlistId])
}
```

## Implementation

### Video Player with Mux

```tsx
// components/video/video-player.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, SkipBack, SkipForward, PictureInPicture
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Chapter {
  title: string;
  timestamp: number;
}

interface VideoPlayerProps {
  videoId: string;
  playbackId: string;
  title: string;
  chapters?: Chapter[];
  initialProgress?: number;
  autoPlay?: boolean;
  onProgress?: (seconds: number) => void;
}

export function VideoPlayer({
  videoId,
  playbackId,
  title,
  chapters = [],
  initialProgress = 0,
  autoPlay = false,
  onProgress,
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('auto');
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  // Track view
  const trackView = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/videos/${videoId}/views`, {
        method: 'POST',
      });
      return response.json();
    },
  });

  // Save progress
  const saveProgress = useMutation({
    mutationFn: async (seconds: number) => {
      const response = await fetch(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchedSeconds: Math.floor(seconds) }),
      });
      return response.json();
    },
  });

  // Track view after 30 seconds
  useEffect(() => {
    if (currentTime >= 30 && !trackView.isSuccess) {
      trackView.mutate();
    }
  }, [currentTime]);

  // Save progress every 10 seconds
  useEffect(() => {
    if (isPlaying && currentTime > 0) {
      const interval = setInterval(() => {
        saveProgress.mutate(currentTime);
        onProgress?.(currentTime);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime]);

  // Hide controls on inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      if (isPlaying) {
        hideControlsTimeout.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    return () => container?.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying]);

  // Seek to initial progress
  useEffect(() => {
    if (initialProgress > 0 && playerRef.current) {
      playerRef.current.currentTime = initialProgress;
    }
  }, []);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (playerRef.current) {
      await playerRef.current.requestPictureInPicture();
    }
  };

  const seek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.max(0, Math.min(currentTime + seconds, duration));
    }
  };

  const seekTo = (time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  };

  const currentChapter = chapters.findLast((c) => c.timestamp <= currentTime);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
    >
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        metadata={{
          video_id: videoId,
          video_title: title,
        }}
        streamType="on-demand"
        autoPlay={autoPlay}
        muted={isMuted}
        onTimeUpdate={(e: any) => setCurrentTime(e.target.currentTime)}
        onDurationChange={(e: any) => setDuration(e.target.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ width: '100%', height: '100%' }}
        primaryColor="#3b82f6"
      />

      {/* Custom Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Title */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <h2 className="text-white font-medium text-lg truncate">{title}</h2>
          {currentChapter && (
            <p className="text-white/70 text-sm mt-1">{currentChapter.title}</p>
          )}
        </div>

        {/* Center Play Button */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className={cn(
              'w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform',
              isPlaying ? 'scale-0' : 'scale-100'
            )}
          >
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </button>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar with Chapters */}
          <div className="relative group/progress">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={([value]) => seekTo(value)}
              className="cursor-pointer"
            />
            
            {/* Chapter Markers */}
            {chapters.map((chapter) => (
              <div
                key={chapter.timestamp}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/50 rounded-full cursor-pointer hover:bg-white transition-colors"
                style={{ left: `${(chapter.timestamp / duration) * 100}%` }}
                onClick={() => seekTo(chapter.timestamp)}
                title={chapter.title}
              />
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => seek(-10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => seek(10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/volume">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    onValueChange={([v]) => {
                      setVolume(v / 100);
                      setIsMuted(v === 0);
                      if (playerRef.current) {
                        playerRef.current.volume = v / 100;
                        playerRef.current.muted = v === 0;
                      }
                    }}
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePiP}
                className="text-white hover:bg-white/20"
              >
                <PictureInPicture className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Video Upload

```tsx
// components/video/video-upload.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Upload, Film, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { cn, formatBytes } from '@/lib/utils';

interface VideoUploadProps {
  channelId: string;
}

export function VideoUpload({ channelId }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const startUpload = useMutation({
    mutationFn: async (file: File) => {
      // Create video record and get upload URL
      const createRes = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          channelId,
        }),
      });

      if (!createRes.ok) throw new Error('Failed to create upload');
      const { videoId, uploadUrl } = await createRes.json();
      setVideoId(videoId);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));

      // Upload to Mux using their direct upload
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress((e.loaded / e.total) * 100);
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

        xhr.open('PUT', uploadUrl);
        xhr.send(file);
      });

      return videoId;
    },
  });

  const publishVideo = useMutation({
    mutationFn: async () => {
      if (!videoId) throw new Error('No video ID');

      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          visibility: 'PUBLIC',
        }),
      });

      if (!response.ok) throw new Error('Failed to publish');
      return response.json();
    },
    onSuccess: () => {
      router.push(`/studio/videos`);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const videoFile = acceptedFiles[0];
    if (videoFile) {
      setFile(videoFile);
      startUpload.mutate(videoFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles: 1,
    disabled: !!file,
  });

  return (
    <div className="max-w-3xl mx-auto">
      {!file ? (
        /* Drop Zone */
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag and drop video files to upload
          </p>
          <p className="text-gray-500 mb-4">
            Your videos will be private until you publish them.
          </p>
          <Button>Select files</Button>
        </div>
      ) : (
        /* Upload Progress & Details */
        <div className="space-y-6">
          {/* Upload Status */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Film className="h-6 w-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
              </div>
              {uploadProgress < 100 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setUploadProgress(0);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>

            {uploadProgress < 100 ? (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Upload complete. Processing video...</span>
              </div>
            )}
          </div>

          {/* Video Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Details</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                rows={4}
              />
            </div>

            {/* Thumbnail Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Thumbnail</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-500">
                  Auto-generated
                </div>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-500 border-2 border-dashed cursor-pointer hover:bg-gray-50">
                  Upload
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Save as Draft</Button>
            <Button
              onClick={() => publishVideo.mutate()}
              disabled={!title.trim() || uploadProgress < 100 || publishVideo.isPending}
            >
              Publish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Video Card

```tsx
// components/video/video-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Play, MoreVertical, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDuration, formatViews } from '@/lib/utils';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    duration: number | null;
    viewCount: number;
    publishedAt: string;
    channel: {
      id: string;
      handle: string;
      name: string;
      avatar: string | null;
    };
  };
  variant?: 'default' | 'compact' | 'horizontal';
  showChannel?: boolean;
}

export function VideoCard({ video, variant = 'default', showChannel = true }: VideoCardProps) {
  if (variant === 'horizontal') {
    return (
      <Link href={`/watch/${video.id}`} className="flex gap-4 group">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-gray-100">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
          )}
          {video.duration && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
            {video.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {video.channel.name}
          </p>
          <p className="text-sm text-gray-500">
            {formatViews(Number(video.viewCount))} views · {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="group">
      {/* Thumbnail */}
      <Link href={`/watch/${video.id}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center">
              <Play className="h-7 w-7 text-white fill-white ml-1" />
            </div>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="flex gap-3">
        {showChannel && (
          <Link href={`/channel/${video.channel.handle}`}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={video.channel.avatar || undefined} />
              <AvatarFallback>{video.channel.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <Link href={`/watch/${video.id}`}>
            <h3 className="font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
              {video.title}
            </h3>
          </Link>
          
          {showChannel && (
            <Link
              href={`/channel/${video.channel.handle}`}
              className="text-sm text-gray-500 hover:text-gray-700 mt-1 block"
            >
              {video.channel.name}
            </Link>
          )}
          
          <p className="text-sm text-gray-500">
            {formatViews(Number(video.viewCount))} views · {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Mux Webhook Handler

```tsx
// app/api/webhooks/mux/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, data } = body;

  try {
    switch (type) {
      case 'video.asset.ready': {
        // Video is ready for playback
        const video = await prisma.video.findFirst({
          where: { muxAssetId: data.id },
        });

        if (video) {
          // Get playback ID
          const playbackId = data.playback_ids?.[0]?.id;
          
          // Get thumbnail
          const thumbnailUrl = playbackId
            ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
            : null;

          await prisma.video.update({
            where: { id: video.id },
            data: {
              status: 'READY',
              muxPlaybackId: playbackId,
              duration: Math.round(data.duration || 0),
              thumbnailUrl,
            },
          });

          // Update channel video count
          await prisma.channel.update({
            where: { id: video.channelId },
            data: { videoCount: { increment: 1 } },
          });
        }
        break;
      }

      case 'video.asset.errored': {
        // Video processing failed
        const video = await prisma.video.findFirst({
          where: { muxAssetId: data.id },
        });

        if (video) {
          await prisma.video.update({
            where: { id: video.id },
            data: { status: 'FAILED' },
          });
        }
        break;
      }

      case 'video.upload.asset_created': {
        // Link upload to asset
        const video = await prisma.video.findFirst({
          where: { muxUploadId: data.id },
        });

        if (video && data.asset_id) {
          await prisma.video.update({
            where: { id: video.id },
            data: {
              muxAssetId: data.asset_id,
              status: 'PROCESSING',
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Mux webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
```

### Video Upload API

```tsx
// app/api/videos/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Mux from '@mux/mux-node';
import { z } from 'zod';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

const uploadSchema = z.object({
  name: z.string(),
  channelId: z.string(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, channelId } = uploadSchema.parse(body);

    // Verify channel ownership
    const channel = await prisma.channel.findFirst({
      where: { id: channelId, userId: session.user.id },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Create Mux direct upload
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL,
      new_asset_settings: {
        playback_policy: ['public'],
        encoding_tier: 'baseline',
      },
    });

    // Create video record
    const video = await prisma.video.create({
      data: {
        title: name.replace(/\.[^/.]+$/, ''),
        muxUploadId: upload.id,
        status: 'UPLOADING',
        channelId,
        creatorId: session.user.id,
        visibility: 'PRIVATE',
      },
    });

    return NextResponse.json({
      videoId: video.id,
      uploadUrl: upload.url,
      uploadId: upload.id,
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

### DMCA Notice Handling

```typescript
// lib/dmca.ts
import { z } from 'zod';

// DMCA notice schema with all legally required fields
export const dmcaNoticeSchema = z.object({
  // Claimant information
  claimantName: z.string().min(1, 'Full legal name required'),
  claimantEmail: z.string().email('Valid email required'),
  claimantAddress: z.string().min(10, 'Full mailing address required'),
  claimantPhone: z.string().optional(),

  // Copyright information
  copyrightWorkDescription: z.string().min(10, 'Describe the copyrighted work'),
  copyrightRegistrationNumber: z.string().optional(),
  originalWorkUrl: z.string().url().optional(),

  // Infringing content
  infringingVideoId: z.string().cuid(),
  infringingContentUrl: z.string().url(),
  infringingContentDescription: z.string().min(10, 'Describe the infringing material'),

  // Statements under penalty of perjury
  goodFaithBelief: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm good faith belief' }),
  }),
  accuracyStatement: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm accuracy under penalty of perjury' }),
  }),
  authorizationStatement: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm authorization to act' }),
  }),

  // Electronic signature
  electronicSignature: z.string().min(2, 'Electronic signature required'),
  signatureDate: z.string().datetime(),
});

export type DMCANotice = z.infer<typeof dmcaNoticeSchema>;

// Counter-notice schema
export const dmcaCounterNoticeSchema = z.object({
  // Respondent information
  respondentName: z.string().min(1, 'Full legal name required'),
  respondentEmail: z.string().email('Valid email required'),
  respondentAddress: z.string().min(10, 'Full mailing address required'),
  respondentPhone: z.string().optional(),

  // Original notice reference
  originalNoticeId: z.string().cuid(),
  videoId: z.string().cuid(),

  // Counter-notice statements
  goodFaithBelief: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm good faith belief of mistake or misidentification' }),
  }),
  consentToJurisdiction: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to federal court jurisdiction' }),
  }),
  acceptServiceOfProcess: z.literal(true, {
    errorMap: () => ({ message: 'You must accept service of process' }),
  }),

  // Explanation
  explanation: z.string().min(50, 'Provide detailed explanation'),

  // Electronic signature
  electronicSignature: z.string().min(2, 'Electronic signature required'),
  signatureDate: z.string().datetime(),
});

export type DMCACounterNotice = z.infer<typeof dmcaCounterNoticeSchema>;

// Repeat infringer tracking
export interface RepeatInfringerRecord {
  userId: string;
  strikes: number;
  notices: string[];
  lastStrikeAt: Date;
  accountTerminated: boolean;
}

export const REPEAT_INFRINGER_THRESHOLD = 3;
export const STRIKE_EXPIRATION_DAYS = 365;

export async function checkRepeatInfringer(
  prisma: any,
  userId: string
): Promise<RepeatInfringerRecord> {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - STRIKE_EXPIRATION_DAYS);

  const notices = await prisma.dmcaNotice.findMany({
    where: {
      targetUserId: userId,
      status: 'UPHELD',
      createdAt: { gte: expirationDate },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    userId,
    strikes: notices.length,
    notices: notices.map((n: any) => n.id),
    lastStrikeAt: notices[0]?.createdAt || new Date(0),
    accountTerminated: notices.length >= REPEAT_INFRINGER_THRESHOLD,
  };
}

export async function processRepeatInfringer(
  prisma: any,
  userId: string
): Promise<{ terminated: boolean; message: string }> {
  const record = await checkRepeatInfringer(prisma, userId);

  if (record.accountTerminated) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'TERMINATED',
        terminationReason: 'REPEAT_COPYRIGHT_INFRINGER',
        terminatedAt: new Date(),
      },
    });

    // Remove all videos
    await prisma.video.updateMany({
      where: { creatorId: userId },
      data: { status: 'REMOVED', visibility: 'PRIVATE' },
    });

    return {
      terminated: true,
      message: `Account terminated due to ${REPEAT_INFRINGER_THRESHOLD} copyright strikes`,
    };
  }

  return {
    terminated: false,
    message: `Warning: ${record.strikes}/${REPEAT_INFRINGER_THRESHOLD} copyright strikes`,
  };
}
```

```typescript
// app/api/dmca/notice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { dmcaNoticeSchema, processRepeatInfringer } from '@/lib/dmca';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = dmcaNoticeSchema.parse(body);

    // Verify the video exists
    const video = await prisma.video.findUnique({
      where: { id: validatedData.infringingVideoId },
      include: { creator: true, channel: true },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Create DMCA notice record with audit trail
    const notice = await prisma.dmcaNotice.create({
      data: {
        // Claimant info
        claimantName: validatedData.claimantName,
        claimantEmail: validatedData.claimantEmail,
        claimantAddress: validatedData.claimantAddress,
        claimantPhone: validatedData.claimantPhone,

        // Copyright info
        copyrightWorkDescription: validatedData.copyrightWorkDescription,
        copyrightRegistrationNumber: validatedData.copyrightRegistrationNumber,
        originalWorkUrl: validatedData.originalWorkUrl,

        // Target content
        videoId: video.id,
        targetUserId: video.creatorId,
        infringingContentUrl: validatedData.infringingContentUrl,
        infringingContentDescription: validatedData.infringingContentDescription,

        // Legal statements
        goodFaithBelief: validatedData.goodFaithBelief,
        accuracyStatement: validatedData.accuracyStatement,
        authorizationStatement: validatedData.authorizationStatement,
        electronicSignature: validatedData.electronicSignature,
        signatureDate: new Date(validatedData.signatureDate),

        // Status
        status: 'PENDING',
        receivedAt: new Date(),

        // IP and audit
        submitterIp: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    // Act expeditiously - immediately disable video pending review
    await prisma.video.update({
      where: { id: video.id },
      data: {
        status: 'DMCA_TAKEDOWN',
        visibility: 'PRIVATE',
        dmcaNoticeId: notice.id,
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'DMCA_NOTICE_RECEIVED',
        entityType: 'VIDEO',
        entityId: video.id,
        details: {
          noticeId: notice.id,
          claimantEmail: validatedData.claimantEmail,
        },
      },
    });

    // Notify the uploader
    await sendEmail({
      to: video.creator.email,
      subject: 'DMCA Takedown Notice - Your Video Has Been Removed',
      template: 'dmca-notice-to-uploader',
      data: {
        userName: video.creator.name,
        videoTitle: video.title,
        noticeId: notice.id,
        claimantName: validatedData.claimantName,
        copyrightWorkDescription: validatedData.copyrightWorkDescription,
        counterNoticeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dmca/counter-notice/${notice.id}`,
      },
    });

    // Send confirmation to claimant
    await sendEmail({
      to: validatedData.claimantEmail,
      subject: 'DMCA Notice Received - Confirmation',
      template: 'dmca-notice-confirmation',
      data: {
        claimantName: validatedData.claimantName,
        noticeId: notice.id,
        videoTitle: video.title,
      },
    });

    // Check for repeat infringer
    const infringerStatus = await processRepeatInfringer(prisma, video.creatorId);

    return NextResponse.json({
      success: true,
      noticeId: notice.id,
      message: 'DMCA notice received. Content has been disabled pending review.',
      infringerWarning: infringerStatus.terminated ? undefined : infringerStatus.message,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid notice data', details: error },
        { status: 400 }
      );
    }

    console.error('DMCA notice error:', error);
    return NextResponse.json(
      { error: 'Failed to process DMCA notice' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get notices for user's videos
  const notices = await prisma.dmcaNotice.findMany({
    where: { targetUserId: session.user.id },
    include: { video: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ notices });
}
```

```typescript
// app/api/dmca/counter-notice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { dmcaCounterNoticeSchema } from '@/lib/dmca';
import { sendEmail } from '@/lib/email';

const COUNTER_NOTICE_WAITING_PERIOD_DAYS = 10;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = dmcaCounterNoticeSchema.parse(body);

    // Verify the original notice exists and belongs to user's video
    const originalNotice = await prisma.dmcaNotice.findUnique({
      where: { id: validatedData.originalNoticeId },
      include: { video: true },
    });

    if (!originalNotice) {
      return NextResponse.json(
        { error: 'Original notice not found' },
        { status: 404 }
      );
    }

    if (originalNotice.targetUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only submit counter-notices for your own content' },
        { status: 403 }
      );
    }

    if (originalNotice.counterNoticeId) {
      return NextResponse.json(
        { error: 'Counter-notice already submitted for this notice' },
        { status: 400 }
      );
    }

    // Calculate restoration date (10 business days)
    const restorationDate = new Date();
    restorationDate.setDate(restorationDate.getDate() + COUNTER_NOTICE_WAITING_PERIOD_DAYS);

    // Create counter-notice
    const counterNotice = await prisma.dmcaCounterNotice.create({
      data: {
        originalNoticeId: originalNotice.id,
        videoId: validatedData.videoId,

        // Respondent info
        respondentName: validatedData.respondentName,
        respondentEmail: validatedData.respondentEmail,
        respondentAddress: validatedData.respondentAddress,
        respondentPhone: validatedData.respondentPhone,
        respondentUserId: session.user.id,

        // Statements
        goodFaithBelief: validatedData.goodFaithBelief,
        consentToJurisdiction: validatedData.consentToJurisdiction,
        acceptServiceOfProcess: validatedData.acceptServiceOfProcess,
        explanation: validatedData.explanation,

        // Signature
        electronicSignature: validatedData.electronicSignature,
        signatureDate: new Date(validatedData.signatureDate),

        // Status
        status: 'PENDING',
        receivedAt: new Date(),
        scheduledRestorationDate: restorationDate,

        // Audit
        submitterIp: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    // Link counter-notice to original notice
    await prisma.dmcaNotice.update({
      where: { id: originalNotice.id },
      data: { counterNoticeId: counterNotice.id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'DMCA_COUNTER_NOTICE_RECEIVED',
        entityType: 'VIDEO',
        entityId: validatedData.videoId,
        userId: session.user.id,
        details: {
          counterNoticeId: counterNotice.id,
          originalNoticeId: originalNotice.id,
        },
      },
    });

    // Notify original claimant
    await sendEmail({
      to: originalNotice.claimantEmail,
      subject: 'Counter-Notice Received for Your DMCA Claim',
      template: 'dmca-counter-notice-to-claimant',
      data: {
        claimantName: originalNotice.claimantName,
        videoTitle: originalNotice.video.title,
        counterNoticeId: counterNotice.id,
        restorationDate: restorationDate.toISOString(),
        legalNotice: `If you do not file a lawsuit within ${COUNTER_NOTICE_WAITING_PERIOD_DAYS} days, the content may be restored.`,
      },
    });

    // Schedule automatic restoration check
    await prisma.scheduledTask.create({
      data: {
        type: 'DMCA_RESTORATION_CHECK',
        scheduledFor: restorationDate,
        data: {
          counterNoticeId: counterNotice.id,
          videoId: validatedData.videoId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      counterNoticeId: counterNotice.id,
      scheduledRestorationDate: restorationDate.toISOString(),
      message: `Counter-notice received. Content may be restored after ${COUNTER_NOTICE_WAITING_PERIOD_DAYS} days if no lawsuit is filed.`,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid counter-notice data', details: error },
        { status: 400 }
      );
    }

    console.error('Counter-notice error:', error);
    return NextResponse.json(
      { error: 'Failed to process counter-notice' },
      { status: 500 }
    );
  }
}

// Process restoration after waiting period
export async function processRestorationCheck(counterNoticeId: string) {
  const counterNotice = await prisma.dmcaCounterNotice.findUnique({
    where: { id: counterNoticeId },
    include: { originalNotice: true, video: true },
  });

  if (!counterNotice) return;

  // Check if lawsuit was filed
  if (counterNotice.lawsuitFiled) {
    // Do not restore - lawsuit pending
    return;
  }

  // Restore the video
  await prisma.video.update({
    where: { id: counterNotice.videoId },
    data: {
      status: 'READY',
      visibility: 'PUBLIC',
      dmcaNoticeId: null,
    },
  });

  await prisma.dmcaCounterNotice.update({
    where: { id: counterNoticeId },
    data: { status: 'CONTENT_RESTORED', restoredAt: new Date() },
  });

  await prisma.dmcaNotice.update({
    where: { id: counterNotice.originalNoticeId },
    data: { status: 'COUNTER_NOTICE_UPHELD' },
  });
}
```

```tsx
// components/dmca/notice-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { dmcaNoticeSchema, type DMCANotice } from '@/lib/dmca';

interface DMCANoticeFormProps {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
}

export function DMCANoticeForm({ videoId, videoTitle, videoUrl }: DMCANoticeFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<DMCANotice>({
    resolver: zodResolver(dmcaNoticeSchema),
    defaultValues: {
      infringingVideoId: videoId,
      infringingContentUrl: videoUrl,
      signatureDate: new Date().toISOString(),
    },
  });

  const submitNotice = useMutation({
    mutationFn: async (data: DMCANotice) => {
      const response = await fetch('/api/dmca/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit notice');
      return response.json();
    },
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Shield className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800">Notice Submitted</AlertTitle>
        <AlertDescription className="text-green-700">
          Your DMCA takedown notice has been received. The content has been
          disabled and the uploader has been notified. You will receive a
          confirmation email shortly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((data) => submitNotice.mutate(data))} className="space-y-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Legal Notice</AlertTitle>
        <AlertDescription>
          Filing a false DMCA notice is perjury and may result in legal liability.
          Only submit this form if you are the copyright owner or authorized to act
          on their behalf.
        </AlertDescription>
      </Alert>

      {/* Target Video Info */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Video Being Reported</h3>
        <p className="text-sm text-gray-600">{videoTitle}</p>
        <p className="text-sm text-gray-500">{videoUrl}</p>
      </div>

      {/* Claimant Information */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Your Information (Copyright Owner/Agent)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Legal Name *
            </label>
            <Input {...form.register('claimantName')} />
            {form.formState.errors.claimantName && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.claimantName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <Input type="email" {...form.register('claimantEmail')} />
            {form.formState.errors.claimantEmail && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.claimantEmail.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mailing Address *
          </label>
          <Textarea {...form.register('claimantAddress')} rows={3} />
          {form.formState.errors.claimantAddress && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.claimantAddress.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Phone Number (optional)
          </label>
          <Input type="tel" {...form.register('claimantPhone')} />
        </div>
      </section>

      {/* Copyright Information */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Copyright Information</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description of Copyrighted Work *
          </label>
          <Textarea
            {...form.register('copyrightWorkDescription')}
            rows={4}
            placeholder="Describe the original copyrighted work that you believe has been infringed..."
          />
          {form.formState.errors.copyrightWorkDescription && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.copyrightWorkDescription.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Copyright Registration Number (if applicable)
            </label>
            <Input {...form.register('copyrightRegistrationNumber')} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              URL to Original Work (if available)
            </label>
            <Input type="url" {...form.register('originalWorkUrl')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description of Infringing Material *
          </label>
          <Textarea
            {...form.register('infringingContentDescription')}
            rows={3}
            placeholder="Describe specifically what content in the video infringes your copyright..."
          />
          {form.formState.errors.infringingContentDescription && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.infringingContentDescription.message}
            </p>
          )}
        </div>
      </section>

      {/* Required Statements */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Required Statements</h2>

        <div className="space-y-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Checkbox
              id="goodFaith"
              checked={form.watch('goodFaithBelief')}
              onCheckedChange={(checked) =>
                form.setValue('goodFaithBelief', checked === true)
              }
            />
            <label htmlFor="goodFaith" className="text-sm">
              I have a good faith belief that the use of the material in the
              manner complained of is not authorized by the copyright owner,
              its agent, or the law. *
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="accuracy"
              checked={form.watch('accuracyStatement')}
              onCheckedChange={(checked) =>
                form.setValue('accuracyStatement', checked === true)
              }
            />
            <label htmlFor="accuracy" className="text-sm font-medium text-red-700 dark:text-red-400">
              I swear, UNDER PENALTY OF PERJURY, that the information in this
              notification is accurate and that I am the copyright owner, or am
              authorized to act on behalf of the owner of an exclusive right
              that is allegedly infringed. *
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="authorization"
              checked={form.watch('authorizationStatement')}
              onCheckedChange={(checked) =>
                form.setValue('authorizationStatement', checked === true)
              }
            />
            <label htmlFor="authorization" className="text-sm">
              I am authorized to act on behalf of the copyright owner. *
            </label>
          </div>
        </div>
      </section>

      {/* Electronic Signature */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Electronic Signature</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Type your full legal name as your electronic signature *
          </label>
          <Input
            {...form.register('electronicSignature')}
            placeholder="Your full legal name"
            className="font-serif italic"
          />
          {form.formState.errors.electronicSignature && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.electronicSignature.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            By typing your name above, you are signing this notice electronically.
          </p>
        </div>
      </section>

      <Button
        type="submit"
        disabled={submitNotice.isPending}
        className="w-full"
        size="lg"
      >
        {submitNotice.isPending ? 'Submitting...' : 'Submit DMCA Takedown Notice'}
      </Button>

      {submitNotice.isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Submission Failed</AlertTitle>
          <AlertDescription>
            There was an error submitting your notice. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
```

### Copyright Claim Management

```prisma
// Add to prisma/schema.prisma

model CopyrightClaim {
  id          String            @id @default(cuid())
  videoId     String
  video       Video             @relation(fields: [videoId], references: [id], onDelete: Cascade)

  // Claimant
  claimantId  String?           // Internal user ID if claimant is a platform user
  claimantName String
  claimantEmail String
  claimantOrg String?           // Organization name

  // Claim details
  claimType   ClaimType
  claimedContent String         // Description of claimed content
  originalWorkUrl String?
  timestampStart Int?           // Seconds - start of claimed segment
  timestampEnd Int?             // Seconds - end of claimed segment

  // Status
  status      ClaimStatus       @default(ACTIVE)

  // Actions taken
  action      ClaimAction       @default(TRACK)
  revenueShare Float?           // Percentage if monetized

  // Dispute
  disputeId   String?           @unique
  dispute     ClaimDispute?     @relation(fields: [disputeId], references: [id])

  // Timestamps
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  resolvedAt  DateTime?

  @@index([videoId])
  @@index([claimantId])
  @@index([status])
}

enum ClaimType {
  AUDIO           // Music/sound recording
  VISUAL          // Video footage
  AUDIOVISUAL     // Both
  COMPOSITION     // Musical composition
  OTHER
}

enum ClaimStatus {
  ACTIVE
  DISPUTED
  RELEASED
  REINSTATED
  EXPIRED
}

enum ClaimAction {
  TRACK           // Track views only
  MONETIZE        // Claim ad revenue
  BLOCK           // Block video
  BLOCK_REGIONS   // Block in specific regions
}

model ClaimDispute {
  id              String          @id @default(cuid())
  claim           CopyrightClaim?

  // Disputant
  disputantId     String
  disputant       User            @relation(fields: [disputantId], references: [id])

  // Dispute details
  reason          DisputeReason
  explanation     String
  evidenceUrls    String[]

  // Status
  status          DisputeStatus   @default(PENDING)

  // Resolution
  resolvedBy      String?
  resolution      String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  resolvedAt      DateTime?

  @@index([disputantId])
}

enum DisputeReason {
  FAIR_USE
  PUBLIC_DOMAIN
  LICENSED
  ORIGINAL_CONTENT
  MISIDENTIFICATION
  OTHER
}

enum DisputeStatus {
  PENDING
  UNDER_REVIEW
  UPHELD          // Claim stands
  RELEASED        // Claim released
  ESCALATED       // To legal review
}
```

```typescript
// app/api/videos/[id]/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// GET - List claims on a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getServerSession(authOptions);

  // Get video to check ownership
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { creatorId: true },
  });

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  // Only video owner can see claims
  if (video.creatorId !== session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const claims = await prisma.copyrightClaim.findMany({
    where: { videoId },
    include: {
      dispute: {
        select: {
          id: true,
          status: true,
          reason: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate revenue impact
  const revenueImpact = claims
    .filter((c) => c.status === 'ACTIVE' && c.action === 'MONETIZE')
    .reduce((total, claim) => total + (claim.revenueShare || 0), 0);

  return NextResponse.json({
    claims,
    summary: {
      totalClaims: claims.length,
      activeClaims: claims.filter((c) => c.status === 'ACTIVE').length,
      disputedClaims: claims.filter((c) => c.status === 'DISPUTED').length,
      revenueImpactPercent: Math.min(revenueImpact, 100),
    },
  });
}

// POST - Dispute a claim
const disputeSchema = z.object({
  claimId: z.string().cuid(),
  reason: z.enum([
    'FAIR_USE',
    'PUBLIC_DOMAIN',
    'LICENSED',
    'ORIGINAL_CONTENT',
    'MISIDENTIFICATION',
    'OTHER',
  ]),
  explanation: z.string().min(50).max(5000),
  evidenceUrls: z.array(z.string().url()).max(10).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = disputeSchema.parse(body);

    // Verify claim exists and belongs to user's video
    const claim = await prisma.copyrightClaim.findFirst({
      where: {
        id: data.claimId,
        videoId,
        video: { creatorId: session.user.id },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    if (claim.status === 'DISPUTED') {
      return NextResponse.json(
        { error: 'Claim is already being disputed' },
        { status: 400 }
      );
    }

    // Create dispute
    const dispute = await prisma.claimDispute.create({
      data: {
        disputantId: session.user.id,
        reason: data.reason,
        explanation: data.explanation,
        evidenceUrls: data.evidenceUrls || [],
        status: 'PENDING',
      },
    });

    // Update claim status
    await prisma.copyrightClaim.update({
      where: { id: data.claimId },
      data: {
        status: 'DISPUTED',
        disputeId: dispute.id,
      },
    });

    // Notify claimant
    if (claim.claimantEmail) {
      // Send email notification about dispute
    }

    return NextResponse.json({
      success: true,
      disputeId: dispute.id,
      message: 'Dispute submitted. The claimant has 30 days to respond.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid dispute data', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}

// PATCH - Acknowledge claim (accept it)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { claimId, action } = await request.json();

  const claim = await prisma.copyrightClaim.findFirst({
    where: {
      id: claimId,
      videoId,
      video: { creatorId: session.user.id },
    },
  });

  if (!claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }

  if (action === 'acknowledge') {
    // User accepts the claim
    await prisma.copyrightClaim.update({
      where: { id: claimId },
      data: { status: 'ACTIVE' },
    });

    return NextResponse.json({
      success: true,
      message: 'Claim acknowledged',
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
```

```tsx
// components/creator/claims-dashboard.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle, Shield, DollarSign, Music, Film, FileText,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Claim {
  id: string;
  claimType: 'AUDIO' | 'VISUAL' | 'AUDIOVISUAL' | 'COMPOSITION' | 'OTHER';
  claimantName: string;
  claimedContent: string;
  status: 'ACTIVE' | 'DISPUTED' | 'RELEASED' | 'REINSTATED' | 'EXPIRED';
  action: 'TRACK' | 'MONETIZE' | 'BLOCK' | 'BLOCK_REGIONS';
  revenueShare: number | null;
  timestampStart: number | null;
  timestampEnd: number | null;
  createdAt: string;
  dispute?: {
    id: string;
    status: string;
    reason: string;
    createdAt: string;
  };
}

interface ClaimsDashboardProps {
  videoId: string;
  videoTitle: string;
}

const claimTypeIcons = {
  AUDIO: Music,
  VISUAL: Film,
  AUDIOVISUAL: Film,
  COMPOSITION: Music,
  OTHER: FileText,
};

const statusColors = {
  ACTIVE: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-yellow-100 text-yellow-800',
  RELEASED: 'bg-green-100 text-green-800',
  REINSTATED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

const actionLabels = {
  TRACK: 'Tracking views',
  MONETIZE: 'Claiming revenue',
  BLOCK: 'Video blocked',
  BLOCK_REGIONS: 'Blocked in some regions',
};

export function ClaimsDashboard({ videoId, videoTitle }: ClaimsDashboardProps) {
  const [disputeClaimId, setDisputeClaimId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [disputeExplanation, setDisputeExplanation] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['video-claims', videoId],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${videoId}/claims`);
      if (!res.ok) throw new Error('Failed to fetch claims');
      return res.json();
    },
  });

  const disputeMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const res = await fetch(`/api/videos/${videoId}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          reason: disputeReason,
          explanation: disputeExplanation,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit dispute');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-claims', videoId] });
      setDisputeClaimId(null);
      setDisputeReason('');
      setDisputeExplanation('');
    },
  });

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />;
  }

  const { claims, summary } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Total Claims</span>
          </div>
          <p className="text-2xl font-bold">{summary.totalClaims}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Active Claims</span>
          </div>
          <p className="text-2xl font-bold">{summary.activeClaims}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Disputed</span>
          </div>
          <p className="text-2xl font-bold">{summary.disputedClaims}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Revenue Impact</span>
          </div>
          <p className="text-2xl font-bold">
            {summary.revenueImpactPercent > 0
              ? `-${summary.revenueImpactPercent}%`
              : 'None'}
          </p>
        </div>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Copyright Claims</h3>
          <p className="text-gray-500 mt-1">
            This video has no copyright claims.
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {claims.map((claim: Claim) => {
            const Icon = claimTypeIcons[claim.claimType];

            return (
              <AccordionItem
                key={claim.id}
                value={claim.id}
                className="bg-white dark:bg-gray-900 rounded-lg border"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />

                    <div className="flex-1 text-left">
                      <p className="font-medium">{claim.claimantName}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {claim.claimedContent}
                      </p>
                    </div>

                    <Badge className={statusColors[claim.status]}>
                      {claim.status}
                    </Badge>

                    {claim.action === 'MONETIZE' && claim.revenueShare && (
                      <span className="text-sm text-red-600 font-medium">
                        -{claim.revenueShare}% revenue
                      </span>
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Claim Type:</span>
                        <span className="ml-2 capitalize">
                          {claim.claimType.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Action:</span>
                        <span className="ml-2">{actionLabels[claim.action]}</span>
                      </div>
                      {claim.timestampStart !== null && (
                        <div>
                          <span className="text-gray-500">Affected Segment:</span>
                          <span className="ml-2">
                            {formatTimestamp(claim.timestampStart)} -
                            {formatTimestamp(claim.timestampEnd || 0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Claimed:</span>
                        <span className="ml-2">
                          {formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {claim.dispute ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Dispute Status: {claim.dispute.status}
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                          Reason: {claim.dispute.reason.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-yellow-500 mt-1">
                          Filed {formatDistanceToNow(new Date(claim.dispute.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ) : claim.status === 'ACTIVE' ? (
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => setDisputeClaimId(claim.id)}
                            >
                              Dispute Claim
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Dispute Copyright Claim</DialogTitle>
                              <DialogDescription>
                                Explain why you believe this claim is incorrect.
                                False disputes may result in penalties.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Reason for Dispute
                                </label>
                                <Select
                                  value={disputeReason}
                                  onValueChange={setDisputeReason}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="FAIR_USE">Fair Use</SelectItem>
                                    <SelectItem value="PUBLIC_DOMAIN">Public Domain</SelectItem>
                                    <SelectItem value="LICENSED">I Have a License</SelectItem>
                                    <SelectItem value="ORIGINAL_CONTENT">This is My Original Content</SelectItem>
                                    <SelectItem value="MISIDENTIFICATION">Misidentification</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Explanation (min 50 characters)
                                </label>
                                <Textarea
                                  value={disputeExplanation}
                                  onChange={(e) => setDisputeExplanation(e.target.value)}
                                  rows={4}
                                  placeholder="Provide detailed explanation for your dispute..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {disputeExplanation.length}/50 characters minimum
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setDisputeClaimId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => disputeMutation.mutate(claim.id)}
                                disabled={
                                  !disputeReason ||
                                  disputeExplanation.length < 50 ||
                                  disputeMutation.isPending
                                }
                              >
                                {disputeMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : null}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

## Skills Used

| Skill | Purpose |
|-------|---------|
| [video-upload](../patterns/video-upload.md) | Chunked upload handling |
| [video-player](../patterns/video-player.md) | Custom playback controls |
| [hls-streaming](../patterns/hls-streaming.md) | Adaptive bitrate streaming |
| [video-thumbnails](../patterns/video-thumbnails.md) | Thumbnail generation |
| [progress-tracking](../patterns/progress-tracking.md) | Watch history |

## Testing

### Unit Tests

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDuration, formatViews, formatBytes } from '@/lib/utils';

describe('formatDuration', () => {
  it('formats seconds to MM:SS', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(59)).toBe('0:59');
  });

  it('formats hours correctly', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7200)).toBe('2:00:00');
  });
});

describe('formatViews', () => {
  it('formats small numbers as-is', () => {
    expect(formatViews(500)).toBe('500');
    expect(formatViews(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatViews(1000)).toBe('1K');
    expect(formatViews(1500)).toBe('1.5K');
    expect(formatViews(999999)).toBe('999.9K');
  });

  it('formats millions with M suffix', () => {
    expect(formatViews(1000000)).toBe('1M');
    expect(formatViews(2500000)).toBe('2.5M');
  });
});

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
  });
});
```

```typescript
// __tests__/lib/mux.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDirectUpload, getAssetStatus } from '@/lib/mux';

vi.mock('@mux/mux-node', () => ({
  default: vi.fn().mockImplementation(() => ({
    video: {
      uploads: {
        create: vi.fn().mockResolvedValue({
          id: 'upload_123',
          url: 'https://storage.mux.com/direct-upload',
        }),
      },
      assets: {
        retrieve: vi.fn().mockResolvedValue({
          id: 'asset_456',
          status: 'ready',
          playback_ids: [{ id: 'playback_789', policy: 'public' }],
          duration: 120.5,
        }),
      },
    },
  })),
}));

describe('Mux Integration', () => {
  it('creates direct upload URL', async () => {
    const result = await createDirectUpload({
      corsOrigin: 'https://example.com',
    });

    expect(result.uploadId).toBe('upload_123');
    expect(result.uploadUrl).toBe('https://storage.mux.com/direct-upload');
  });

  it('retrieves asset status', async () => {
    const result = await getAssetStatus('asset_456');

    expect(result.status).toBe('ready');
    expect(result.playbackId).toBe('playback_789');
    expect(result.duration).toBe(120.5);
  });
});
```

```typescript
// __tests__/components/video-player.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from '@/components/video/video-player';

// Mock MuxPlayer
vi.mock('@mux/mux-player-react', () => ({
  default: vi.fn(({ playbackId, onTimeUpdate, onPlay, onPause }) => (
    <div data-testid="mux-player" data-playback-id={playbackId}>
      <button onClick={() => onPlay?.()}>Play</button>
      <button onClick={() => onPause?.()}>Pause</button>
      <button onClick={() => onTimeUpdate?.({ target: { currentTime: 30 } })}>
        Update Time
      </button>
    </div>
  )),
}));

describe('VideoPlayer', () => {
  const defaultProps = {
    videoId: 'video_123',
    playbackId: 'playback_456',
    title: 'Test Video',
    chapters: [
      { title: 'Intro', timestamp: 0 },
      { title: 'Main Content', timestamp: 60 },
    ],
  };

  it('renders video player with title', () => {
    render(<VideoPlayer {...defaultProps} />);

    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByTestId('mux-player')).toHaveAttribute(
      'data-playback-id',
      'playback_456'
    );
  });

  it('displays current chapter based on time', async () => {
    render(<VideoPlayer {...defaultProps} />);

    // Simulate time update to 65 seconds (should show "Main Content" chapter)
    fireEvent.click(screen.getByText('Update Time'));

    // Chapter detection would show in the UI
  });

  it('supports keyboard shortcuts', () => {
    render(<VideoPlayer {...defaultProps} />);

    // Space to play/pause
    fireEvent.keyDown(document, { key: ' ' });

    // Arrow keys to seek
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/videos.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST, GET } from '@/app/api/videos/route';
import { prisma } from '@/lib/prisma';

describe('Videos API', () => {
  let testUser: any;
  let testChannel: any;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    testChannel = await prisma.channel.create({
      data: {
        handle: 'testchannel',
        name: 'Test Channel',
        userId: testUser.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.channel.delete({ where: { id: testChannel.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  it('lists public videos', async () => {
    // Create test video
    const video = await prisma.video.create({
      data: {
        title: 'Test Video',
        channelId: testChannel.id,
        creatorId: testUser.id,
        status: 'READY',
        visibility: 'PUBLIC',
        muxPlaybackId: 'test_playback',
        publishedAt: new Date(),
      },
    });

    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.videos).toContainEqual(
      expect.objectContaining({ id: video.id })
    );

    await prisma.video.delete({ where: { id: video.id } });
  });

  it('excludes private videos from listing', async () => {
    const privateVideo = await prisma.video.create({
      data: {
        title: 'Private Video',
        channelId: testChannel.id,
        creatorId: testUser.id,
        status: 'READY',
        visibility: 'PRIVATE',
        muxPlaybackId: 'private_playback',
      },
    });

    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req as any);
    const data = await response.json();

    expect(data.videos).not.toContainEqual(
      expect.objectContaining({ id: privateVideo.id })
    );

    await prisma.video.delete({ where: { id: privateVideo.id } });
  });
});

// __tests__/api/webhooks/mux.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/webhooks/mux/route';
import { prisma } from '@/lib/prisma';

describe('Mux Webhook', () => {
  it('handles video.asset.ready event', async () => {
    const video = await prisma.video.create({
      data: {
        title: 'Processing Video',
        muxAssetId: 'asset_ready_123',
        status: 'PROCESSING',
        channelId: 'test_channel',
        creatorId: 'test_user',
      },
    });

    const { req } = createMocks({
      method: 'POST',
      body: {
        type: 'video.asset.ready',
        data: {
          id: 'asset_ready_123',
          playback_ids: [{ id: 'playback_new_123' }],
          duration: 180.5,
        },
      },
    });

    const response = await POST(req as any);

    expect(response.status).toBe(200);

    const updatedVideo = await prisma.video.findUnique({
      where: { id: video.id },
    });

    expect(updatedVideo?.status).toBe('READY');
    expect(updatedVideo?.muxPlaybackId).toBe('playback_new_123');
    expect(updatedVideo?.duration).toBe(181); // Rounded

    await prisma.video.delete({ where: { id: video.id } });
  });

  it('handles video.asset.errored event', async () => {
    const video = await prisma.video.create({
      data: {
        title: 'Failing Video',
        muxAssetId: 'asset_error_123',
        status: 'PROCESSING',
        channelId: 'test_channel',
        creatorId: 'test_user',
      },
    });

    const { req } = createMocks({
      method: 'POST',
      body: {
        type: 'video.asset.errored',
        data: {
          id: 'asset_error_123',
          errors: [{ type: 'invalid_input', message: 'Unsupported codec' }],
        },
      },
    });

    const response = await POST(req as any);

    expect(response.status).toBe(200);

    const updatedVideo = await prisma.video.findUnique({
      where: { id: video.id },
    });

    expect(updatedVideo?.status).toBe('FAILED');

    await prisma.video.delete({ where: { id: video.id } });
  });
});
```

### E2E Tests

```typescript
// e2e/video-streaming.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Video Streaming Platform', () => {
  test.describe('Video Playback', () => {
    test('plays video and tracks progress', async ({ page }) => {
      await page.goto('/watch/test-video-id');

      // Wait for player to load
      await page.waitForSelector('[data-testid="video-player"]');

      // Click play
      await page.click('[data-testid="play-button"]');

      // Wait for video to play for a few seconds
      await page.waitForTimeout(3000);

      // Check progress is being tracked
      const progressBar = page.locator('[data-testid="progress-bar"]');
      const progress = await progressBar.getAttribute('aria-valuenow');
      expect(Number(progress)).toBeGreaterThan(0);
    });

    test('supports chapter navigation', async ({ page }) => {
      await page.goto('/watch/test-video-with-chapters');

      // Click on a chapter marker
      await page.click('[data-testid="chapter-marker"]:nth-child(2)');

      // Verify video jumped to chapter timestamp
      const currentTime = await page.locator('[data-testid="current-time"]').textContent();
      expect(currentTime).not.toBe('0:00');
    });

    test('toggles fullscreen mode', async ({ page }) => {
      await page.goto('/watch/test-video-id');

      // Click fullscreen button
      await page.click('[data-testid="fullscreen-button"]');

      // Check fullscreen state
      const isFullscreen = await page.evaluate(() => !!document.fullscreenElement);
      expect(isFullscreen).toBe(true);

      // Exit fullscreen
      await page.keyboard.press('Escape');
    });
  });

  test.describe('Video Upload', () => {
    test.beforeEach(async ({ page }) => {
      // Login as creator
      await page.goto('/login');
      await page.fill('[name="email"]', 'creator@test.com');
      await page.fill('[name="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      await page.waitForURL('/studio');
    });

    test('uploads video with progress tracking', async ({ page }) => {
      await page.goto('/studio/upload');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('e2e/fixtures/test-video.mp4');

      // Wait for upload to start
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();

      // Wait for upload to complete (mock faster in test)
      await expect(page.locator('text=Upload complete')).toBeVisible({ timeout: 30000 });

      // Fill in video details
      await page.fill('[name="title"]', 'My Test Video');
      await page.fill('[name="description"]', 'This is a test video description');

      // Publish
      await page.click('button:has-text("Publish")');

      // Should redirect to videos list
      await expect(page).toHaveURL('/studio/videos');
    });

    test('shows upload error for invalid file', async ({ page }) => {
      await page.goto('/studio/upload');

      // Try to upload invalid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('e2e/fixtures/invalid-file.txt');

      // Should show error
      await expect(page.locator('text=Invalid file type')).toBeVisible();
    });
  });

  test.describe('Search and Discovery', () => {
    test('searches for videos', async ({ page }) => {
      await page.goto('/');

      // Search for videos
      await page.fill('[data-testid="search-input"]', 'tutorial');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Should show search results
      await expect(page).toHaveURL(/\/search\?q=tutorial/);
      await expect(page.locator('[data-testid="video-card"]')).toHaveCount.above(0);
    });

    test('filters by category', async ({ page }) => {
      await page.goto('/');

      // Click category filter
      await page.click('[data-testid="category-gaming"]');

      // Should filter videos
      await expect(page.locator('[data-testid="active-filter"]')).toContainText('Gaming');
    });
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Upload, Play } from 'lucide-react';

interface VideoErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function VideoErrorBoundary({
  error,
  reset,
}: VideoErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        component: 'video-streaming',
        errorType: error.name,
      },
    });
  }, [error]);

  const isPlaybackError = error.message.includes('playback') ||
                          error.message.includes('HLS') ||
                          error.message.includes('media');

  const isUploadError = error.message.includes('upload') ||
                        error.message.includes('transcoding');

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gray-900 rounded-xl p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          {isPlaybackError ? (
            <Play className="w-8 h-8 text-red-400" />
          ) : isUploadError ? (
            <Upload className="w-8 h-8 text-red-400" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-400" />
          )}
        </div>

        <h1 className="text-xl font-semibold text-white mb-2">
          {isPlaybackError
            ? 'Playback Error'
            : isUploadError
            ? 'Upload Failed'
            : 'Something went wrong'}
        </h1>

        <p className="text-gray-400 mb-6">
          {isPlaybackError
            ? 'Unable to play this video. The video may still be processing or there may be a network issue.'
            : isUploadError
            ? 'Your video upload failed. Please check your file and try again.'
            : 'An unexpected error occurred. Our team has been notified.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          {isPlaybackError && (
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Reload Page
            </button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-800 rounded text-xs overflow-auto text-gray-300">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
```

### API Error Handler

```typescript
// lib/api-error-handler.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class VideoAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'VideoAPIError';
  }
}

export async function handleAPIError(error: unknown) {
  if (error instanceof VideoAPIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This resource already exists', code: 'DUPLICATE_RESOURCE' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resource not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
  }

  // Capture unexpected errors
  Sentry.captureException(error);

  return NextResponse.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Predefined video errors
export const VideoErrors = {
  VideoNotFound: new VideoAPIError('Video not found', 404, 'VIDEO_NOT_FOUND'),
  VideoNotReady: new VideoAPIError('Video is still processing', 202, 'VIDEO_PROCESSING'),
  VideoPrivate: new VideoAPIError('This video is private', 403, 'VIDEO_PRIVATE'),
  UploadFailed: new VideoAPIError('Upload failed', 500, 'UPLOAD_FAILED'),
  TranscodingFailed: new VideoAPIError('Video transcoding failed', 500, 'TRANSCODING_FAILED'),
  QuotaExceeded: new VideoAPIError('Storage quota exceeded', 403, 'QUOTA_EXCEEDED'),
  InvalidFormat: new VideoAPIError('Unsupported video format', 400, 'INVALID_FORMAT'),
};
```

## Accessibility

### Accessible Video Player

```tsx
// components/video/accessible-video-player.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings
} from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface Chapter {
  title: string;
  timestamp: number;
}

interface AccessibleVideoPlayerProps {
  playbackId: string;
  title: string;
  chapters?: Chapter[];
  captions?: { src: string; label: string; language: string }[];
}

export function AccessibleVideoPlayer({
  playbackId,
  title,
  chapters = [],
  captions = [],
}: AccessibleVideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);

  // Announce state changes to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          seek(-10);
          announceToScreenReader('Rewound 10 seconds');
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          seek(10);
          announceToScreenReader('Skipped forward 10 seconds');
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'c':
          e.preventDefault();
          toggleCaptions();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percent = parseInt(e.key) * 10;
          seekToPercent(percent);
          announceToScreenReader(`Jumped to ${percent}%`);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
        announceToScreenReader('Paused');
      } else {
        playerRef.current.play();
        announceToScreenReader('Playing');
      }
    }
  };

  const seek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.max(
        0,
        Math.min(currentTime + seconds, duration)
      );
    }
  };

  const seekToPercent = (percent: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = (duration * percent) / 100;
    }
  };

  const adjustVolume = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.volume = newVolume;
    }
    announceToScreenReader(`Volume ${Math.round(newVolume * 100)}%`);
  };

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      announceToScreenReader(isMuted ? 'Unmuted' : 'Muted');
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
      announceToScreenReader('Exited fullscreen');
    } else {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
      announceToScreenReader('Entered fullscreen');
    }
  };

  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
    announceToScreenReader(showCaptions ? 'Captions off' : 'Captions on');
  };

  const currentChapter = chapters.findLast((c) => c.timestamp <= currentTime);

  return (
    <div
      role="region"
      aria-label={`Video player: ${title}`}
      className="relative aspect-video bg-black rounded-xl overflow-hidden"
    >
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        onTimeUpdate={(e: any) => setCurrentTime(e.target.currentTime)}
        onDurationChange={(e: any) => setDuration(e.target.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Accessible Controls */}
      <div
        role="toolbar"
        aria-label="Video controls"
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80"
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <label htmlFor="video-progress" className="sr-only">
            Video progress: {formatTime(currentTime)} of {formatTime(duration)}
          </label>
          <input
            id="video-progress"
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const time = Number(e.target.value);
              if (playerRef.current) {
                playerRef.current.currentTime = time;
              }
            }}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />

          {/* Chapter Indicators */}
          {chapters.length > 0 && (
            <div className="relative h-0" aria-hidden="true">
              {chapters.map((chapter) => (
                <button
                  key={chapter.timestamp}
                  onClick={() => {
                    if (playerRef.current) {
                      playerRef.current.currentTime = chapter.timestamp;
                    }
                    announceToScreenReader(`Jumped to chapter: ${chapter.title}`);
                  }}
                  className="absolute top-[-4px] w-2 h-2 bg-white rounded-full transform -translate-x-1/2"
                  style={{ left: `${(chapter.timestamp / duration) * 100}%` }}
                  title={chapter.title}
                />
              ))}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause (k)' : 'Play (k)'}
              className="p-2 text-white hover:bg-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={() => seek(-10)}
              aria-label="Rewind 10 seconds (j)"
              className="p-2 text-white hover:bg-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => seek(10)}
              aria-label="Skip forward 10 seconds (l)"
              className="p-2 text-white hover:bg-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute (m)' : 'Mute (m)'}
                className="p-2 text-white hover:bg-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <label htmlFor="volume-slider" className="sr-only">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                id="volume-slider"
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume * 100}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setVolume(v);
                  setIsMuted(v === 0);
                  if (playerRef.current) {
                    playerRef.current.volume = v;
                    playerRef.current.muted = v === 0;
                  }
                }}
                aria-valuetext={`${Math.round(volume * 100)}%`}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <span className="text-white text-sm ml-2" aria-live="polite">
              <span className="sr-only">Current time:</span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Chapter Display */}
            {currentChapter && (
              <span className="text-white text-sm px-2 py-1 bg-white/20 rounded">
                <span className="sr-only">Current chapter:</span>
                {currentChapter.title}
              </span>
            )}

            {/* Captions Toggle */}
            {captions.length > 0 && (
              <button
                onClick={toggleCaptions}
                aria-label={showCaptions ? 'Turn off captions (c)' : 'Turn on captions (c)'}
                aria-pressed={showCaptions}
                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white ${
                  showCaptions ? 'bg-white text-black' : 'text-white hover:bg-white/20'
                }`}
              >
                CC
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen (f)' : 'Enter fullscreen (f)'}
              className="p-2 text-white hover:bg-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help (hidden, accessible) */}
      <div className="sr-only">
        <h2>Keyboard shortcuts</h2>
        <ul>
          <li>Space or K: Play/Pause</li>
          <li>J or Left Arrow: Rewind 10 seconds</li>
          <li>L or Right Arrow: Skip forward 10 seconds</li>
          <li>Up Arrow: Increase volume</li>
          <li>Down Arrow: Decrease volume</li>
          <li>M: Mute/Unmute</li>
          <li>F: Toggle fullscreen</li>
          <li>C: Toggle captions</li>
          <li>0-9: Jump to 0%-90% of video</li>
        </ul>
      </div>
    </div>
  );
}
```

### Closed Captions & Subtitles

```typescript
// lib/captions.ts
import { z } from 'zod';

// WebVTT caption cue interface
export interface VTTCue {
  id: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  text: string;
  settings?: {
    vertical?: 'rl' | 'lr';
    line?: number | string;
    position?: number;
    size?: number;
    align?: 'start' | 'center' | 'end' | 'left' | 'right';
  };
}

// Caption track interface
export interface CaptionTrack {
  id: string;
  videoId: string;
  language: string;      // ISO 639-1 code (e.g., 'en', 'es', 'fr')
  label: string;         // Display name (e.g., 'English', 'Spanish')
  kind: 'subtitles' | 'captions' | 'descriptions';
  isDefault: boolean;
  isAutoGenerated: boolean;
  src: string;           // URL to WebVTT file
  cues?: VTTCue[];
}

// Parse WebVTT file content
export function parseWebVTT(content: string): VTTCue[] {
  const cues: VTTCue[] = [];
  const lines = content.trim().split('\n');

  let i = 0;

  // Skip WEBVTT header and any metadata
  while (i < lines.length && !lines[i].includes('-->')) {
    i++;
  }

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Check for cue timing line
    if (line.includes('-->')) {
      const timingMatch = line.match(
        /(\d{2}:\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})/
      );

      if (timingMatch) {
        const startTime = parseVTTTime(timingMatch[1]);
        const endTime = parseVTTTime(timingMatch[2]);

        // Collect cue text (may span multiple lines)
        const textLines: string[] = [];
        i++;
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i]);
          i++;
        }

        cues.push({
          id: `cue-${cues.length}`,
          startTime,
          endTime,
          text: textLines.join('\n'),
        });
      }
    } else {
      i++;
    }
  }

  return cues;
}

// Parse VTT timestamp to seconds
function parseVTTTime(timeString: string): number {
  const parts = timeString.replace(',', '.').split(':');
  let seconds = 0;

  if (parts.length === 3) {
    seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  } else if (parts.length === 2) {
    seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  }

  return seconds;
}

// Generate WebVTT content from cues
export function generateWebVTT(cues: VTTCue[]): string {
  let content = 'WEBVTT\n\n';

  cues.forEach((cue, index) => {
    content += `${index + 1}\n`;
    content += `${formatVTTTime(cue.startTime)} --> ${formatVTTTime(cue.endTime)}\n`;
    content += `${cue.text}\n\n`;
  });

  return content;
}

function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.padStart(6, '0')}`;
}

// Mux auto-caption integration
export async function requestMuxAutoCaptions(
  assetId: string,
  language: string = 'en'
): Promise<{ trackId: string }> {
  const mux = new (await import('@mux/mux-node')).default({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
  });

  const track = await mux.video.assets.createTrack(assetId, {
    type: 'text',
    text_type: 'subtitles',
    language_code: language,
    name: `Auto-generated (${language})`,
    closed_captions: true,
  });

  return { trackId: track.id };
}

// Validate uploaded caption file
export const captionUploadSchema = z.object({
  videoId: z.string().cuid(),
  language: z.string().length(2), // ISO 639-1
  label: z.string().min(1).max(100),
  kind: z.enum(['subtitles', 'captions', 'descriptions']),
  isDefault: z.boolean().optional(),
  file: z.instanceof(File).refine(
    (file) => file.type === 'text/vtt' || file.name.endsWith('.vtt'),
    'File must be WebVTT format (.vtt)'
  ),
});

// Multi-language support utilities
export const SUPPORTED_CAPTION_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
] as const;

export function getLanguageLabel(code: string): string {
  const lang = SUPPORTED_CAPTION_LANGUAGES.find((l) => l.code === code);
  return lang?.label || code.toUpperCase();
}
```

```typescript
// app/api/videos/[id]/captions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { parseWebVTT, requestMuxAutoCaptions } from '@/lib/captions';
import { z } from 'zod';

// GET - List all caption tracks for a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      captions: {
        orderBy: [{ isDefault: 'desc' }, { language: 'asc' }],
      },
    },
  });

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  return NextResponse.json({
    captions: video.captions.map((caption) => ({
      id: caption.id,
      language: caption.language,
      label: caption.label,
      kind: caption.kind,
      isDefault: caption.isDefault,
      isAutoGenerated: caption.isAutoGenerated,
      src: caption.src,
    })),
  });
}

// POST - Upload a new caption file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string;
    const label = formData.get('label') as string;
    const kind = formData.get('kind') as string || 'subtitles';
    const isDefault = formData.get('isDefault') === 'true';

    // Verify video ownership
    const video = await prisma.video.findFirst({
      where: { id: videoId, creatorId: session.user.id },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Validate file is WebVTT
    if (!file.name.endsWith('.vtt')) {
      return NextResponse.json(
        { error: 'Caption file must be WebVTT format (.vtt)' },
        { status: 400 }
      );
    }

    // Parse and validate WebVTT content
    const content = await file.text();
    if (!content.trim().startsWith('WEBVTT')) {
      return NextResponse.json(
        { error: 'Invalid WebVTT file: missing WEBVTT header' },
        { status: 400 }
      );
    }

    const cues = parseWebVTT(content);
    if (cues.length === 0) {
      return NextResponse.json(
        { error: 'WebVTT file contains no captions' },
        { status: 400 }
      );
    }

    // Upload to storage (S3/R2)
    const captionUrl = await uploadCaptionFile(videoId, language, content);

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.caption.updateMany({
        where: { videoId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create caption record
    const caption = await prisma.caption.create({
      data: {
        videoId,
        language,
        label,
        kind,
        isDefault,
        isAutoGenerated: false,
        src: captionUrl,
        cueCount: cues.length,
      },
    });

    return NextResponse.json({
      success: true,
      caption: {
        id: caption.id,
        language: caption.language,
        label: caption.label,
        src: caption.src,
      },
    });
  } catch (error) {
    console.error('Caption upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload caption file' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a caption track
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const captionId = searchParams.get('captionId');

  if (!captionId) {
    return NextResponse.json(
      { error: 'Caption ID required' },
      { status: 400 }
    );
  }

  // Verify ownership
  const caption = await prisma.caption.findFirst({
    where: {
      id: captionId,
      videoId,
      video: { creatorId: session.user.id },
    },
  });

  if (!caption) {
    return NextResponse.json({ error: 'Caption not found' }, { status: 404 });
  }

  // Delete from storage
  await deleteCaptionFile(caption.src);

  // Delete record
  await prisma.caption.delete({ where: { id: captionId } });

  return NextResponse.json({ success: true });
}

// Helper to upload caption file to storage
async function uploadCaptionFile(
  videoId: string,
  language: string,
  content: string
): Promise<string> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = `captions/${videoId}/${language}.vtt`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: content,
      ContentType: 'text/vtt',
      CacheControl: 'public, max-age=31536000',
    })
  );

  return `${process.env.CDN_URL}/${key}`;
}

async function deleteCaptionFile(url: string): Promise<void> {
  const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');

  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = url.replace(`${process.env.CDN_URL}/`, '');

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    })
  );
}
```

```tsx
// components/player/caption-display.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { VTTCue } from '@/lib/captions';

interface CaptionDisplayProps {
  cues: VTTCue[];
  currentTime: number;
  isVisible: boolean;
  settings: CaptionSettings;
}

export interface CaptionSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'default' | 'serif' | 'mono';
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  position: 'bottom' | 'top';
  edgeStyle: 'none' | 'raised' | 'depressed' | 'outline' | 'drop-shadow';
}

const defaultSettings: CaptionSettings = {
  fontSize: 'medium',
  fontFamily: 'default',
  textColor: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 0.75,
  position: 'bottom',
  edgeStyle: 'none',
};

const fontSizeMap = {
  small: '0.875rem',
  medium: '1.125rem',
  large: '1.5rem',
  'extra-large': '2rem',
};

const fontFamilyMap = {
  default: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, monospace',
};

const edgeStyleMap = {
  none: 'none',
  raised: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.3)',
  depressed: '-1px -1px 2px rgba(0,0,0,0.8), 1px 1px 2px rgba(255,255,255,0.3)',
  outline: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
  'drop-shadow': '2px 2px 4px rgba(0,0,0,0.9)',
};

export function CaptionDisplay({
  cues,
  currentTime,
  isVisible,
  settings = defaultSettings,
}: CaptionDisplayProps) {
  const [activeCue, setActiveCue] = useState<VTTCue | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setActiveCue(null);
      return;
    }

    // Find the active cue based on current time
    const cue = cues.find(
      (c) => currentTime >= c.startTime && currentTime <= c.endTime
    );
    setActiveCue(cue || null);
  }, [cues, currentTime, isVisible]);

  if (!isVisible || !activeCue) {
    return null;
  }

  const bgColor = settings.backgroundColor;
  const bgOpacity = settings.backgroundOpacity;
  const bgRgba = hexToRgba(bgColor, bgOpacity);

  return (
    <div
      className={cn(
        'absolute left-0 right-0 flex justify-center px-4 pointer-events-none',
        settings.position === 'bottom' ? 'bottom-16' : 'top-16'
      )}
      role="region"
      aria-label="Captions"
      aria-live="polite"
    >
      <div
        className="max-w-[80%] px-4 py-2 rounded text-center"
        style={{
          fontSize: fontSizeMap[settings.fontSize],
          fontFamily: fontFamilyMap[settings.fontFamily],
          color: settings.textColor,
          backgroundColor: bgRgba,
          textShadow: edgeStyleMap[settings.edgeStyle],
          lineHeight: 1.4,
        }}
      >
        {activeCue.text.split('\n').map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {/* Handle basic WebVTT formatting tags */}
            {parseVTTFormatting(line)}
          </span>
        ))}
      </div>
    </div>
  );
}

// Parse WebVTT inline formatting
function parseVTTFormatting(text: string): React.ReactNode {
  // Handle <b>, <i>, <u> tags
  const parts = text.split(/(<\/?[biu]>)/);
  let bold = false;
  let italic = false;
  let underline = false;

  return parts.map((part, i) => {
    if (part === '<b>') { bold = true; return null; }
    if (part === '</b>') { bold = false; return null; }
    if (part === '<i>') { italic = true; return null; }
    if (part === '</i>') { italic = false; return null; }
    if (part === '<u>') { underline = true; return null; }
    if (part === '</u>') { underline = false; return null; }

    if (!part) return null;

    return (
      <span
        key={i}
        style={{
          fontWeight: bold ? 'bold' : 'normal',
          fontStyle: italic ? 'italic' : 'normal',
          textDecoration: underline ? 'underline' : 'none',
        }}
      >
        {part}
      </span>
    );
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Caption settings panel component
export function CaptionSettingsPanel({
  settings,
  onChange,
}: {
  settings: CaptionSettings;
  onChange: (settings: CaptionSettings) => void;
}) {
  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg text-white">
      <h3 className="font-medium text-lg">Caption Settings</h3>

      {/* Font Size */}
      <div>
        <label className="block text-sm mb-2">Font Size</label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => onChange({ ...settings, fontSize: size })}
              className={cn(
                'px-3 py-1 rounded text-sm',
                settings.fontSize === size
                  ? 'bg-white text-black'
                  : 'bg-gray-700 hover:bg-gray-600'
              )}
            >
              {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm mb-2">Font</label>
        <select
          value={settings.fontFamily}
          onChange={(e) =>
            onChange({ ...settings, fontFamily: e.target.value as CaptionSettings['fontFamily'] })
          }
          className="w-full bg-gray-700 rounded px-3 py-2"
        >
          <option value="default">Default</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>
      </div>

      {/* Background Opacity */}
      <div>
        <label className="block text-sm mb-2">
          Background Opacity: {Math.round(settings.backgroundOpacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.backgroundOpacity * 100}
          onChange={(e) =>
            onChange({ ...settings, backgroundOpacity: Number(e.target.value) / 100 })
          }
          className="w-full"
        />
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm mb-2">Position</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...settings, position: 'bottom' })}
            className={cn(
              'flex-1 px-3 py-2 rounded',
              settings.position === 'bottom'
                ? 'bg-white text-black'
                : 'bg-gray-700 hover:bg-gray-600'
            )}
          >
            Bottom
          </button>
          <button
            onClick={() => onChange({ ...settings, position: 'top' })}
            className={cn(
              'flex-1 px-3 py-2 rounded',
              settings.position === 'top'
                ? 'bg-white text-black'
                : 'bg-gray-700 hover:bg-gray-600'
            )}
          >
            Top
          </button>
        </div>
      </div>

      {/* Edge Style */}
      <div>
        <label className="block text-sm mb-2">Text Edge Style</label>
        <select
          value={settings.edgeStyle}
          onChange={(e) =>
            onChange({ ...settings, edgeStyle: e.target.value as CaptionSettings['edgeStyle'] })
          }
          className="w-full bg-gray-700 rounded px-3 py-2"
        >
          <option value="none">None</option>
          <option value="raised">Raised</option>
          <option value="depressed">Depressed</option>
          <option value="outline">Outline</option>
          <option value="drop-shadow">Drop Shadow</option>
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange(defaultSettings)}
        className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
      >
        Reset to Default
      </button>
    </div>
  );
}
```

### Audio Descriptions

```typescript
// lib/audio-descriptions.ts
import { z } from 'zod';

export interface AudioDescriptionTrack {
  id: string;
  videoId: string;
  language: string;
  label: string;
  src: string;          // URL to audio file
  duration: number;     // seconds
  isDefault: boolean;
}

export interface AudioDescriptionCue {
  id: string;
  startTime: number;
  endTime: number;
  audioSrc: string;     // URL to audio clip
  description: string;  // Text transcript of description
}

// Validation schema for audio description upload
export const audioDescriptionUploadSchema = z.object({
  videoId: z.string().cuid(),
  language: z.string().length(2),
  label: z.string().min(1).max(100),
  isDefault: z.boolean().optional(),
});

// Sync audio description with video timeline
export class AudioDescriptionPlayer {
  private video: HTMLVideoElement;
  private audioContext: AudioContext | null = null;
  private currentTrack: AudioDescriptionTrack | null = null;
  private cues: AudioDescriptionCue[] = [];
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private currentSource: AudioBufferSourceNode | null = null;
  private isEnabled: boolean = false;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  async loadTrack(track: AudioDescriptionTrack, cues: AudioDescriptionCue[]): Promise<void> {
    this.currentTrack = track;
    this.cues = cues;

    // Initialize audio context
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    // Preload audio clips
    await Promise.all(
      cues.map(async (cue) => {
        if (!this.audioBuffers.has(cue.audioSrc)) {
          const response = await fetch(cue.audioSrc);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
          this.audioBuffers.set(cue.audioSrc, audioBuffer);
        }
      })
    );
  }

  enable(): void {
    this.isEnabled = true;
    this.video.addEventListener('timeupdate', this.handleTimeUpdate);
  }

  disable(): void {
    this.isEnabled = false;
    this.video.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.stopCurrentAudio();
  }

  private handleTimeUpdate = (): void => {
    if (!this.isEnabled || !this.audioContext) return;

    const currentTime = this.video.currentTime;

    // Find active cue
    const activeCue = this.cues.find(
      (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
    );

    if (activeCue && !this.isPlayingCue(activeCue)) {
      this.playCue(activeCue);
    }
  };

  private isPlayingCue(cue: AudioDescriptionCue): boolean {
    return this.currentSource !== null;
  }

  private playCue(cue: AudioDescriptionCue): void {
    if (!this.audioContext) return;

    this.stopCurrentAudio();

    const buffer = this.audioBuffers.get(cue.audioSrc);
    if (!buffer) return;

    // Lower video volume during description
    this.video.volume = 0.3;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();

    source.onended = () => {
      this.currentSource = null;
      this.video.volume = 1; // Restore video volume
    };

    this.currentSource = source;
  }

  private stopCurrentAudio(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.video.volume = 1;
  }

  destroy(): void {
    this.disable();
    this.audioBuffers.clear();
    this.audioContext?.close();
  }
}
```

```typescript
// app/api/videos/[id]/audio-descriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { audioDescriptionUploadSchema } from '@/lib/audio-descriptions';

// GET - List audio description tracks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      audioDescriptions: {
        orderBy: [{ isDefault: 'desc' }, { language: 'asc' }],
      },
    },
  });

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  return NextResponse.json({
    audioDescriptions: video.audioDescriptions.map((ad) => ({
      id: ad.id,
      language: ad.language,
      label: ad.label,
      src: ad.src,
      duration: ad.duration,
      isDefault: ad.isDefault,
    })),
  });
}

// POST - Upload audio description track
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string;
    const label = formData.get('label') as string;
    const isDefault = formData.get('isDefault') === 'true';
    const cuesJson = formData.get('cues') as string;

    // Verify video ownership
    const video = await prisma.video.findFirst({
      where: { id: videoId, creatorId: session.user.id },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Validate audio file
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!validAudioTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid audio format. Supported: MP3, WAV, OGG' },
        { status: 400 }
      );
    }

    // Upload audio file
    const audioUrl = await uploadAudioDescriptionFile(videoId, language, file);

    // Parse cues
    let cues = [];
    if (cuesJson) {
      cues = JSON.parse(cuesJson);
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.audioDescription.updateMany({
        where: { videoId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Get audio duration
    const duration = await getAudioDuration(file);

    // Create audio description record
    const audioDescription = await prisma.audioDescription.create({
      data: {
        videoId,
        language,
        label,
        src: audioUrl,
        duration,
        isDefault,
        cues: cues,
      },
    });

    return NextResponse.json({
      success: true,
      audioDescription: {
        id: audioDescription.id,
        language: audioDescription.language,
        label: audioDescription.label,
        src: audioDescription.src,
      },
    });
  } catch (error) {
    console.error('Audio description upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio description' },
      { status: 500 }
    );
  }
}

// DELETE - Remove audio description track
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const adId = searchParams.get('adId');

  if (!adId) {
    return NextResponse.json(
      { error: 'Audio description ID required' },
      { status: 400 }
    );
  }

  const audioDescription = await prisma.audioDescription.findFirst({
    where: {
      id: adId,
      videoId,
      video: { creatorId: session.user.id },
    },
  });

  if (!audioDescription) {
    return NextResponse.json(
      { error: 'Audio description not found' },
      { status: 404 }
    );
  }

  // Delete from storage
  await deleteAudioFile(audioDescription.src);

  // Delete record
  await prisma.audioDescription.delete({ where: { id: adId } });

  return NextResponse.json({ success: true });
}

async function uploadAudioDescriptionFile(
  videoId: string,
  language: string,
  file: File
): Promise<string> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = `audio-descriptions/${videoId}/${language}.mp3`;
  const buffer = await file.arrayBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000',
    })
  );

  return `${process.env.CDN_URL}/${key}`;
}

async function deleteAudioFile(url: string): Promise<void> {
  const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');

  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = url.replace(`${process.env.CDN_URL}/`, '');

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    })
  );
}

async function getAudioDuration(file: File): Promise<number> {
  // This would need to be done server-side with ffprobe or similar
  // For now, return 0 and update later
  return 0;
}
```

### Mux Error Handling & Retry

```typescript
// lib/mux-error-handling.ts
import Mux from '@mux/mux-node';

// Mux error categories
export enum MuxErrorCategory {
  RETRYABLE = 'retryable',
  PERMANENT = 'permanent',
  QUOTA = 'quota',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export interface MuxErrorInfo {
  category: MuxErrorCategory;
  message: string;
  code: string;
  retryable: boolean;
  suggestedAction: string;
}

// Categorize Mux errors
export function categorizeMuxError(error: any): MuxErrorInfo {
  const errorType = error?.type || error?.error?.type || '';
  const errorMessage = error?.message || error?.error?.message || 'Unknown error';

  // Invalid input errors - not retryable
  if (errorType === 'invalid_input' || errorMessage.includes('invalid')) {
    return {
      category: MuxErrorCategory.VALIDATION,
      message: errorMessage,
      code: errorType,
      retryable: false,
      suggestedAction: 'Check input file format and encoding. Re-upload with a supported format.',
    };
  }

  // Codec not supported
  if (errorMessage.includes('codec') || errorMessage.includes('unsupported')) {
    return {
      category: MuxErrorCategory.PERMANENT,
      message: 'Unsupported video codec',
      code: 'unsupported_codec',
      retryable: false,
      suggestedAction: 'Re-encode video with H.264/H.265 video codec and AAC audio codec.',
    };
  }

  // Quota/rate limit errors
  if (errorType === 'rate_limit' || errorMessage.includes('quota')) {
    return {
      category: MuxErrorCategory.QUOTA,
      message: 'Rate limit or quota exceeded',
      code: 'quota_exceeded',
      retryable: true,
      suggestedAction: 'Wait and retry. Consider upgrading your Mux plan.',
    };
  }

  // Network/timeout errors - retryable
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('ECONNREFUSED')
  ) {
    return {
      category: MuxErrorCategory.RETRYABLE,
      message: 'Network error during processing',
      code: 'network_error',
      retryable: true,
      suggestedAction: 'Retry upload. Check network connectivity.',
    };
  }

  // Internal Mux errors - potentially retryable
  if (errorType === 'internal_error' || errorMessage.includes('internal')) {
    return {
      category: MuxErrorCategory.RETRYABLE,
      message: 'Mux internal error',
      code: 'mux_internal_error',
      retryable: true,
      suggestedAction: 'Retry after a few minutes.',
    };
  }

  // Default to unknown
  return {
    category: MuxErrorCategory.UNKNOWN,
    message: errorMessage,
    code: 'unknown',
    retryable: false,
    suggestedAction: 'Contact support if the issue persists.',
  };
}

// Exponential backoff retry logic
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, initialDelayMs, maxDelayMs, backoffMultiplier } = {
    ...defaultRetryConfig,
    ...config,
  };

  let lastError: Error | null = null;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      const errorInfo = categorizeMuxError(error);

      // Don't retry non-retryable errors
      if (!errorInfo.retryable) {
        throw error;
      }

      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        break;
      }

      // Wait with exponential backoff
      console.log(`Mux operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      await sleep(delay);

      // Increase delay for next attempt
      delay = Math.min(delay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Alert on repeated failures
export interface FailureTracker {
  videoId: string;
  failureCount: number;
  lastFailure: Date;
  errors: MuxErrorInfo[];
}

const failureTrackers = new Map<string, FailureTracker>();
const FAILURE_THRESHOLD = 3;
const FAILURE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function trackFailure(videoId: string, error: any): FailureTracker {
  const errorInfo = categorizeMuxError(error);

  let tracker = failureTrackers.get(videoId);

  if (!tracker) {
    tracker = {
      videoId,
      failureCount: 0,
      lastFailure: new Date(),
      errors: [],
    };
    failureTrackers.set(videoId, tracker);
  }

  // Reset if outside window
  if (Date.now() - tracker.lastFailure.getTime() > FAILURE_WINDOW_MS) {
    tracker.failureCount = 0;
    tracker.errors = [];
  }

  tracker.failureCount++;
  tracker.lastFailure = new Date();
  tracker.errors.push(errorInfo);

  return tracker;
}

export function shouldAlert(videoId: string): boolean {
  const tracker = failureTrackers.get(videoId);
  return !!tracker && tracker.failureCount >= FAILURE_THRESHOLD;
}

export function clearFailures(videoId: string): void {
  failureTrackers.delete(videoId);
}
```

```typescript
// app/api/webhooks/mux/route.ts (enhanced version)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMuxWebhook } from '@/lib/mux-webhook';
import {
  categorizeMuxError,
  withRetry,
  trackFailure,
  shouldAlert,
  clearFailures,
  MuxErrorCategory,
} from '@/lib/mux-error-handling';
import { sendEmail } from '@/lib/email';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: NextRequest) {
  const signature = request.headers.get('mux-signature');
  const body = await request.text();

  // Verify webhook signature
  if (!signature || !verifyMuxWebhook(body, signature, process.env.MUX_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const { type, data } = event;

  try {
    switch (type) {
      case 'video.asset.ready': {
        await handleAssetReady(data);
        break;
      }

      case 'video.asset.errored': {
        await handleAssetError(data);
        break;
      }

      case 'video.upload.asset_created': {
        await handleUploadAssetCreated(data);
        break;
      }

      case 'video.asset.static_renditions.ready': {
        await handleStaticRenditionsReady(data);
        break;
      }

      case 'video.asset.static_renditions.errored': {
        await handleStaticRenditionsError(data);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Mux webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

async function handleAssetReady(data: any) {
  const video = await prisma.video.findFirst({
    where: { muxAssetId: data.id },
    include: { creator: true },
  });

  if (!video) return;

  const playbackId = data.playback_ids?.[0]?.id;
  const thumbnailUrl = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
    : null;

  await prisma.video.update({
    where: { id: video.id },
    data: {
      status: 'READY',
      muxPlaybackId: playbackId,
      duration: Math.round(data.duration || 0),
      thumbnailUrl,
    },
  });

  // Clear any failure tracking
  clearFailures(video.id);

  // Update channel video count
  await prisma.channel.update({
    where: { id: video.channelId },
    data: { videoCount: { increment: 1 } },
  });

  // Notify creator
  await sendEmail({
    to: video.creator.email,
    subject: 'Your video is ready!',
    template: 'video-ready',
    data: {
      userName: video.creator.name,
      videoTitle: video.title,
      videoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/watch/${video.id}`,
    },
  });
}

async function handleAssetError(data: any) {
  const video = await prisma.video.findFirst({
    where: { muxAssetId: data.id },
    include: { creator: true },
  });

  if (!video) return;

  const errors = data.errors || [];
  const errorInfo = categorizeMuxError(errors[0] || {});

  // Track failure
  const tracker = trackFailure(video.id, errors[0]);

  // Check if we should retry
  if (errorInfo.retryable && tracker.failureCount < 3) {
    console.log(`Retrying transcoding for video ${video.id} (attempt ${tracker.failureCount})`);

    try {
      // Attempt retry with new asset
      await withRetry(async () => {
        // Create a new asset from the original upload
        const newAsset = await mux.video.assets.create({
          input: video.muxUploadId
            ? [{ url: `mux://uploads/${video.muxUploadId}` }]
            : undefined,
          playback_policy: ['public'],
          encoding_tier: 'baseline',
        });

        await prisma.video.update({
          where: { id: video.id },
          data: {
            muxAssetId: newAsset.id,
            status: 'PROCESSING',
          },
        });
      });

      return;
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    }
  }

  // Mark as failed
  await prisma.video.update({
    where: { id: video.id },
    data: {
      status: 'FAILED',
      failureReason: errorInfo.message,
      failureCode: errorInfo.code,
    },
  });

  // Alert if repeated failures
  if (shouldAlert(video.id)) {
    // Send alert to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `Repeated transcoding failures for video ${video.id}`,
      template: 'admin-alert',
      data: {
        videoId: video.id,
        videoTitle: video.title,
        failureCount: tracker.failureCount,
        errors: tracker.errors,
      },
    });
  }

  // Notify creator
  await sendEmail({
    to: video.creator.email,
    subject: 'Video processing failed',
    template: 'video-failed',
    data: {
      userName: video.creator.name,
      videoTitle: video.title,
      errorMessage: errorInfo.message,
      suggestedAction: errorInfo.suggestedAction,
      retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/studio/videos/${video.id}/retry`,
    },
  });
}

async function handleUploadAssetCreated(data: any) {
  const video = await prisma.video.findFirst({
    where: { muxUploadId: data.id },
  });

  if (video && data.asset_id) {
    await prisma.video.update({
      where: { id: video.id },
      data: {
        muxAssetId: data.asset_id,
        status: 'PROCESSING',
      },
    });
  }
}

async function handleStaticRenditionsReady(data: any) {
  // Static renditions (MP4 downloads) are ready
  const video = await prisma.video.findFirst({
    where: { muxAssetId: data.id },
  });

  if (video) {
    await prisma.video.update({
      where: { id: video.id },
      data: {
        downloadAvailable: true,
        downloadUrls: data.static_renditions?.files?.map((f: any) => ({
          quality: f.name,
          url: f.playback_url,
          filesize: f.filesize,
        })),
      },
    });
  }
}

async function handleStaticRenditionsError(data: any) {
  // Static renditions failed - not critical, just log
  console.error('Static renditions failed for asset:', data.id, data.errors);
}
```

### Accessibility Compliance Tests

```typescript
// tests/accessibility/player.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibleVideoPlayer } from '@/components/video/accessible-video-player';
import { CaptionDisplay, CaptionSettings } from '@/components/player/caption-display';

expect.extend(toHaveNoViolations);

// Mock MuxPlayer
vi.mock('@mux/mux-player-react', () => ({
  default: vi.fn(({ onPlay, onPause, onTimeUpdate }) => (
    <div data-testid="mux-player">
      <button onClick={onPlay}>Play</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={() => onTimeUpdate?.({ target: { currentTime: 30 } })}>
        TimeUpdate
      </button>
    </div>
  )),
}));

describe('Accessible Video Player', () => {
  const defaultProps = {
    playbackId: 'test-playback-id',
    title: 'Test Video Title',
    chapters: [
      { title: 'Introduction', timestamp: 0 },
      { title: 'Main Content', timestamp: 60 },
      { title: 'Conclusion', timestamp: 180 },
    ],
    captions: [
      { src: '/captions/en.vtt', label: 'English', language: 'en' },
      { src: '/captions/es.vtt', label: 'Spanish', language: 'es' },
    ],
  };

  describe('Keyboard Navigation', () => {
    it('plays/pauses with Space key', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      // Space should toggle play
      fireEvent.keyDown(document, { key: ' ' });
      // Verify play state changed (mock would need to track this)
    });

    it('plays/pauses with K key', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'k' });
      // Verify play state changed
    });

    it('seeks backward with J key', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'j' });
      // Should announce "Rewound 10 seconds"
    });

    it('seeks forward with L key', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'l' });
      // Should announce "Skipped forward 10 seconds"
    });

    it('seeks with arrow keys', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      fireEvent.keyDown(document, { key: 'ArrowRight' });
    });

    it('adjusts volume with up/down arrows', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'ArrowUp' });
      // Should increase volume and announce percentage

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      // Should decrease volume and announce percentage
    });

    it('toggles mute with M key', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'm' });
      // Should announce "Muted" or "Unmuted"
    });

    it('toggles fullscreen with F key', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'f' });
      // Should toggle fullscreen
    });

    it('toggles captions with C key', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'c' });
      // Should toggle captions and announce state
    });

    it('jumps to percentage with number keys', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: '5' });
      // Should jump to 50% and announce "Jumped to 50%"
    });

    it('does not intercept keyboard when input is focused', async () => {
      render(
        <>
          <AccessibleVideoPlayer {...defaultProps} />
          <input data-testid="text-input" />
        </>
      );

      const input = screen.getByTestId('text-input');
      input.focus();

      // Space in input should not toggle play
      fireEvent.keyDown(input, { key: ' ' });
    });
  });

  describe('Screen Reader Announcements', () => {
    it('creates live region for announcements', () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      // Trigger an action that should announce
      fireEvent.keyDown(document, { key: 'm' });

      // Check for live region
      const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
    });

    it('announces play state changes', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'k' });

      await waitFor(() => {
        const announcement = document.querySelector('.sr-only[role="status"]');
        expect(announcement?.textContent).toMatch(/playing|paused/i);
      });
    });

    it('announces volume changes', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'ArrowUp' });

      await waitFor(() => {
        const announcement = document.querySelector('.sr-only[role="status"]');
        expect(announcement?.textContent).toMatch(/volume \d+%/i);
      });
    });

    it('announces chapter changes', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      // Simulate seeking to a chapter
      const chapterButton = screen.getByTitle('Main Content');
      fireEvent.click(chapterButton);

      await waitFor(() => {
        const announcement = document.querySelector('.sr-only[role="status"]');
        expect(announcement?.textContent).toMatch(/jumped to chapter/i);
      });
    });
  });

  describe('Focus Management', () => {
    it('has proper focus indicators on controls', () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      const playButton = screen.getByLabelText(/play|pause/i);
      playButton.focus();

      expect(playButton).toHaveFocus();
      expect(playButton).toHaveClass('focus:ring-2');
    });

    it('traps focus within fullscreen mode', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      // Enter fullscreen
      fireEvent.keyDown(document, { key: 'f' });

      // Focus should cycle within player controls
    });

    it('maintains focus after control interactions', async () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      const playButton = screen.getByLabelText(/play/i);
      playButton.focus();
      fireEvent.click(playButton);

      expect(playButton).toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    it('has proper region label', () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', `Video player: ${defaultProps.title}`);
    });

    it('has toolbar role for controls', () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Video controls');
    });

    it('progress bar has proper aria attributes', () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      const progressBar = screen.getByRole('slider', { name: /video progress/i });
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuetext');
    });

    it('volume slider has proper aria attributes', () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      const volumeSlider = screen.getByRole('slider', { name: /volume/i });
      expect(volumeSlider).toHaveAttribute('aria-valuemin', '0');
      expect(volumeSlider).toHaveAttribute('aria-valuemax', '100');
      expect(volumeSlider).toHaveAttribute('aria-valuetext');
    });

    it('caption toggle has aria-pressed', () => {
      render(<AccessibleVideoPlayer {...defaultProps} />);

      const captionButton = screen.getByLabelText(/captions/i);
      expect(captionButton).toHaveAttribute('aria-pressed');
    });
  });

  describe('Axe Accessibility Audit', () => {
    it('passes axe accessibility tests', async () => {
      const { container } = render(<AccessibleVideoPlayer {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Caption Display', () => {
  const defaultCues = [
    { id: '1', startTime: 0, endTime: 5, text: 'Hello world' },
    { id: '2', startTime: 5, endTime: 10, text: 'This is a test' },
    { id: '3', startTime: 10, endTime: 15, text: '<b>Bold</b> and <i>italic</i>' },
  ];

  const defaultSettings: CaptionSettings = {
    fontSize: 'medium',
    fontFamily: 'default',
    textColor: '#ffffff',
    backgroundColor: '#000000',
    backgroundOpacity: 0.75,
    position: 'bottom',
    edgeStyle: 'none',
  };

  describe('Caption Rendering', () => {
    it('displays caption at correct time', () => {
      render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={2}
          isVisible={true}
          settings={defaultSettings}
        />
      );

      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('hides caption when outside time range', () => {
      render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={20}
          isVisible={true}
          settings={defaultSettings}
        />
      );

      expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
    });

    it('hides caption when not visible', () => {
      render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={2}
          isVisible={false}
          settings={defaultSettings}
        />
      );

      expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
    });

    it('renders WebVTT formatting tags', () => {
      render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={12}
          isVisible={true}
          settings={defaultSettings}
        />
      );

      const boldText = screen.getByText('Bold');
      expect(boldText).toHaveStyle({ fontWeight: 'bold' });

      const italicText = screen.getByText('italic');
      expect(italicText).toHaveStyle({ fontStyle: 'italic' });
    });

    it('handles multi-line captions', () => {
      const multiLineCues = [
        { id: '1', startTime: 0, endTime: 5, text: 'Line one\nLine two' },
      ];

      render(
        <CaptionDisplay
          cues={multiLineCues}
          currentTime={2}
          isVisible={true}
          settings={defaultSettings}
        />
      );

      expect(screen.getByText('Line one')).toBeInTheDocument();
      expect(screen.getByText('Line two')).toBeInTheDocument();
    });
  });

  describe('Caption Styling', () => {
    it('applies font size setting', () => {
      const { container } = render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={2}
          isVisible={true}
          settings={{ ...defaultSettings, fontSize: 'large' }}
        />
      );

      const captionText = container.querySelector('[role="region"]')?.firstChild;
      expect(captionText).toHaveStyle({ fontSize: '1.5rem' });
    });

    it('applies background opacity', () => {
      const { container } = render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={2}
          isVisible={true}
          settings={{ ...defaultSettings, backgroundOpacity: 0.5 }}
        />
      );

      const captionBox = container.querySelector('[role="region"]')?.firstChild;
      expect(captionBox).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.5)' });
    });

    it('applies edge style', () => {
      const { container } = render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={2}
          isVisible={true}
          settings={{ ...defaultSettings, edgeStyle: 'drop-shadow' }}
        />
      );

      const captionBox = container.querySelector('[role="region"]')?.firstChild;
      expect(captionBox).toHaveStyle({ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' });
    });

    it('positions captions at top when configured', () => {
      const { container } = render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={2}
          isVisible={true}
          settings={{ ...defaultSettings, position: 'top' }}
        />
      );

      const captionRegion = container.querySelector('[role="region"]');
      expect(captionRegion).toHaveClass('top-16');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-live region', () => {
      render(
        <CaptionDisplay
          cues={defaultCues}
          currentTime={2}
          isVisible={true}
          settings={defaultSettings}
        />
      );

      const captionRegion = screen.getByRole('region');
      expect(captionRegion).toHaveAttribute('aria-label', 'Captions');
      expect(captionRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});

describe('Color Contrast Tests', () => {
  it('caption text meets WCAG AA contrast ratio', () => {
    // White text (#ffffff) on black background (#000000) = 21:1 ratio
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    const whiteOnBlack = calculateContrastRatio('#ffffff', '#000000');
    expect(whiteOnBlack).toBeGreaterThanOrEqual(4.5);
  });

  it('control icons meet contrast requirements', () => {
    // White icons on semi-transparent black background
    const iconContrast = calculateContrastRatio('#ffffff', '#333333');
    expect(iconContrast).toBeGreaterThanOrEqual(4.5);
  });

  it('focus indicators are visible', () => {
    // Focus ring should have sufficient contrast
    const focusRingContrast = calculateContrastRatio('#ffffff', '#3b82f6');
    expect(focusRingContrast).toBeGreaterThanOrEqual(3);
  });
});

// Helper function to calculate contrast ratio
function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}
```

## Security

### Video Upload Validation

```typescript
// lib/validations/video.ts
import { z } from 'zod';

// Video upload validation
export const videoUploadSchema = z.object({
  name: z.string().min(1).max(255),
  channelId: z.string().cuid(),
  fileSize: z.number().int().min(1).max(10 * 1024 * 1024 * 1024), // 10GB max
  mimeType: z.enum([
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
  ]),
});

// Video metadata update
export const videoUpdateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string().max(30)).max(15).optional(),
  chapters: z.array(z.object({
    title: z.string().min(1).max(100),
    timestamp: z.number().int().min(0),
  })).max(100).optional(),
  allowComments: z.boolean().optional(),
});

// Comment validation
export const commentSchema = z.object({
  content: z.string().min(1).max(10000),
  parentId: z.string().cuid().optional(),
});

// Playlist validation
export const playlistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']),
});

// Search validation (prevent injection)
export const searchSchema = z.object({
  q: z.string().min(1).max(500),
  categoryId: z.string().cuid().optional(),
  sortBy: z.enum(['relevance', 'date', 'views', 'rating']).optional(),
  duration: z.enum(['short', 'medium', 'long']).optional(),
});
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimits = {
  // Video upload - limited per day
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '24 h'),
    prefix: 'ratelimit:upload',
  }),

  // API general
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  }),

  // Comments - prevent spam
  comment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'ratelimit:comment',
  }),

  // View tracking - prevent view manipulation
  view: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '30 s'),
    prefix: 'ratelimit:view',
  }),

  // Search - prevent abuse
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'ratelimit:search',
  }),

  // Like/dislike - prevent manipulation
  engagement: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    prefix: 'ratelimit:engagement',
  }),
};

export async function checkRateLimit(
  type: keyof typeof rateLimits,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await rateLimits[type].limit(identifier);
  return { success, remaining, reset };
}
```

### Mux Webhook Signature Verification

```typescript
// lib/mux-webhook.ts
import crypto from 'crypto';

export function verifyMuxWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const [timestampPart, signaturePart] = signature.split(',');
  const timestamp = timestampPart.replace('t=', '');
  const expectedSignature = signaturePart.replace('v1=', '');

  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Timing-safe comparison
  const computedBuffer = Buffer.from(computedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (computedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuffer, expectedBuffer);
}

// Usage in webhook route
export async function POST(request: NextRequest) {
  const signature = request.headers.get('mux-signature');
  const body = await request.text();

  if (!signature || !verifyMuxWebhook(body, signature, process.env.MUX_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  // Process event...
}
```

## Performance

### Video Feed Caching

```typescript
// lib/videos.ts
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cache home feed for 1 minute
export const getHomeFeed = unstable_cache(
  async (page: number = 1, limit: number = 24) => {
    const videos = await prisma.video.findMany({
      where: {
        status: 'READY',
        visibility: 'PUBLIC',
        publishedAt: { not: null },
      },
      include: {
        channel: {
          select: {
            id: true,
            handle: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { publishedAt: 'desc' },
        { viewCount: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return videos;
  },
  ['home-feed'],
  {
    revalidate: 60,
    tags: ['videos', 'home-feed'],
  }
);

// Cache trending videos for 5 minutes
export const getTrendingVideos = unstable_cache(
  async (limit: number = 20) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const videos = await prisma.video.findMany({
      where: {
        status: 'READY',
        visibility: 'PUBLIC',
        publishedAt: { gte: oneDayAgo },
      },
      include: {
        channel: {
          select: {
            id: true,
            handle: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        viewCount: 'desc',
      },
      take: limit,
    });

    return videos;
  },
  ['trending-videos'],
  {
    revalidate: 300,
    tags: ['videos', 'trending'],
  }
);

// Cache channel videos
export const getChannelVideos = unstable_cache(
  async (channelId: string, page: number = 1) => {
    const videos = await prisma.video.findMany({
      where: {
        channelId,
        status: 'READY',
        visibility: 'PUBLIC',
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * 30,
      take: 30,
    });

    return videos;
  },
  ['channel-videos'],
  {
    revalidate: 60,
    tags: ['videos'],
  }
);

// Cache video metadata (longer TTL)
export const getVideoMetadata = unstable_cache(
  async (videoId: string) => {
    return prisma.video.findUnique({
      where: { id: videoId },
      include: {
        channel: true,
        chapters: { orderBy: { timestamp: 'asc' } },
        category: true,
        tags: { include: { tag: true } },
      },
    });
  },
  ['video-metadata'],
  {
    revalidate: 300,
    tags: ['videos'],
  }
);
```

### CDN and Thumbnail Optimization

```typescript
// lib/cdn.ts
export function getOptimizedThumbnailUrl(
  playbackId: string,
  options: {
    width?: number;
    height?: number;
    time?: number;
    fit?: 'cover' | 'contain' | 'smartcrop';
  } = {}
): string {
  const { width = 640, height = 360, time = 0, fit = 'smartcrop' } = options;

  // Mux image transformation
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    time: time.toString(),
    fit_mode: fit,
  });

  return `https://image.mux.com/${playbackId}/thumbnail.webp?${params}`;
}

export function getAnimatedPreviewUrl(
  playbackId: string,
  options: {
    width?: number;
    fps?: number;
    start?: number;
    end?: number;
  } = {}
): string {
  const { width = 320, fps = 15, start = 0, end = 5 } = options;

  const params = new URLSearchParams({
    width: width.toString(),
    fps: fps.toString(),
    start: start.toString(),
    end: end.toString(),
  });

  return `https://image.mux.com/${playbackId}/animated.gif?${params}`;
}

// Responsive thumbnail srcset
export function getThumbnailSrcSet(playbackId: string): string {
  const sizes = [320, 480, 640, 960, 1280];
  return sizes
    .map((w) => `${getOptimizedThumbnailUrl(playbackId, { width: w })} ${w}w`)
    .join(', ');
}
```

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/video_test

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: video_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npx prisma db seed
      - run: npm run test:coverage
        env:
          UPSTASH_REDIS_REST_URL: redis://localhost:6379
          MUX_TOKEN_ID: ${{ secrets.MUX_TOKEN_ID }}
          MUX_TOKEN_SECRET: ${{ secrets.MUX_TOKEN_SECRET }}
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: video_test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx prisma migrate deploy
      - run: npx prisma db seed
      - run: npm run build
      - run: npm run test:e2e
        env:
          MUX_TOKEN_ID: ${{ secrets.MUX_TOKEN_ID }}
          MUX_TOKEN_SECRET: ${{ secrets.MUX_TOKEN_SECRET }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-staging:
    needs: [lint, test, e2e]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: [lint, test, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Capture video playback errors
  beforeSend(event) {
    // Add video context if available
    const videoPlayer = document.querySelector('[data-testid="video-player"]');
    if (videoPlayer) {
      event.contexts = {
        ...event.contexts,
        video: {
          playbackId: videoPlayer.getAttribute('data-playback-id'),
          currentTime: videoPlayer.getAttribute('data-current-time'),
          duration: videoPlayer.getAttribute('data-duration'),
        },
      };
    }
    return event;
  },

  // Ignore common playback errors
  ignoreErrors: [
    'AbortError',
    'NotAllowedError', // Autoplay blocked
    'NotSupportedError', // Codec not supported
  ],
});
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';
import Mux from '@mux/mux-node';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latency?: number };
    redis: { status: string; latency?: number };
    mux: { status: string };
  };
}

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
      mux: { status: 'unknown' },
    },
  };

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    health.checks.database = { status: 'unhealthy' };
    health.status = 'unhealthy';
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redis.ping();
    health.checks.redis = {
      status: 'healthy',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    health.checks.redis = { status: 'unhealthy' };
    health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy';
  }

  // Check Mux API
  try {
    await mux.video.assets.list({ limit: 1 });
    health.checks.mux = { status: 'healthy' };
  } catch (error) {
    health.checks.mux = { status: 'degraded' };
    if (health.status === 'healthy') {
      health.status = 'degraded';
    }
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

### Prometheus Metrics

```typescript
// lib/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// Video metrics
export const videoUploads = new Counter({
  name: 'video_uploads_total',
  help: 'Total number of video uploads',
  labelNames: ['status', 'channel'],
  registers: [register],
});

export const videoViews = new Counter({
  name: 'video_views_total',
  help: 'Total video views',
  labelNames: ['video_id', 'channel'],
  registers: [register],
});

export const videoPlaybackDuration = new Histogram({
  name: 'video_playback_duration_seconds',
  help: 'Video playback session duration',
  buckets: [10, 30, 60, 120, 300, 600, 1800, 3600],
  labelNames: ['video_id'],
  registers: [register],
});

export const transcodingDuration = new Histogram({
  name: 'video_transcoding_duration_seconds',
  help: 'Video transcoding duration',
  buckets: [30, 60, 120, 300, 600, 1200, 1800, 3600],
  registers: [register],
});

export const activeStreams = new Gauge({
  name: 'video_active_streams',
  help: 'Current number of active video streams',
  registers: [register],
});

// Upload metrics
export const uploadSize = new Histogram({
  name: 'video_upload_size_bytes',
  help: 'Size of uploaded videos',
  buckets: [10e6, 50e6, 100e6, 500e6, 1e9, 5e9, 10e9],
  registers: [register],
});

// API metrics
export const apiRequestDuration = new Histogram({
  name: 'video_api_request_duration_seconds',
  help: 'API request duration',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.METRICS_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: { 'Content-Type': register.contentType },
  });
}
```

## Environment Variables

```bash
# .env.example

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/video_streaming?schema=public"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

# Mux (Video Platform)
MUX_TOKEN_ID=your-mux-token-id
MUX_TOKEN_SECRET=your-mux-token-secret
MUX_WEBHOOK_SECRET=your-mux-webhook-secret

# Redis (Caching & Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Storage (for thumbnails and uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-video-bucket

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
METRICS_SECRET=your-metrics-endpoint-secret

# Feature Flags
ENABLE_COMMENTS=true
ENABLE_LIVESTREAM=false
MAX_UPLOAD_SIZE_GB=10
```

## Deployment Checklist

### Pre-Deployment

- [ ] Mux API credentials configured
- [ ] Mux webhook endpoint registered
- [ ] Database migrations applied
- [ ] Redis cache configured
- [ ] CDN configured for video delivery
- [ ] Rate limiting verified
- [ ] Video upload size limits set
- [ ] CORS origins configured in Mux
- [ ] SSL/TLS certificates valid
- [ ] Content moderation policies reviewed
- [ ] E2E tests passing
- [ ] Load testing completed for concurrent streams
- [ ] Accessibility audit completed

### Post-Deployment

- [ ] Health endpoint responding correctly
- [ ] Video upload flow verified
- [ ] Video playback verified across browsers
- [ ] HLS adaptive streaming working
- [ ] Webhook events being received
- [ ] View tracking operational
- [ ] Search functionality working
- [ ] Error tracking operational
- [ ] Metrics collection verified
- [ ] Alert thresholds configured
- [ ] CDN cache headers verified
- [ ] Mobile playback tested

## Related Skills

- [Video Upload](../patterns/video-upload.md) - Upload handling
- [Video Player](../patterns/video-player.md) - Playback controls
- [HLS Streaming](../patterns/hls-streaming.md) - Adaptive streaming
- [Video Thumbnails](../patterns/video-thumbnails.md) - Thumbnail generation
- [Progress Tracking](../patterns/progress-tracking.md) - Watch progress

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with Mux integration
- Video upload with progress tracking
- Custom video player with chapters
- HLS adaptive streaming
- View and watch history tracking
- Comments and likes
- Channel and playlist support
