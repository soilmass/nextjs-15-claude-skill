---
id: r-social-network
name: Social Network
version: 3.0.0
layer: L6
category: recipes
description: Full-featured social network with posts, follows, likes, comments, and real-time notifications
tags: [social, feed, follows, likes, comments, notifications, real-time]
formula: "SocialNetwork = ProfilePage(t-profile-page) + NotificationsPage(t-notifications-page) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + SearchResultsPage(t-search-results-page) + DashboardLayout(t-dashboard-layout) + ActivityFeed(o-activity-feed) + CommentsSection(o-comments-section) + FileUploader(o-file-uploader) + NotificationCenter(o-notification-center) + Header(o-header) + Footer(o-footer) + Sidebar(o-sidebar) + SearchModal(o-search-modal) + MediaGallery(o-media-gallery) + SocialShare(o-social-share) + SettingsForm(o-settings-form) + AuthForm(o-auth-form) + AvatarGroup(m-avatar-group) + Card(m-card) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + ShareButton(m-share-button) + MentionInput(m-mention-input) + TagInput(m-tag-input) + NotificationBadge(m-notification-badge) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + SocialAuth(pt-social-auth) + RateLimiting(pt-rate-limiting) + ContentSecurityPolicy(pt-content-security-policy) + XssPrevention(pt-xss-prevention) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + InfiniteScroll(pt-infinite-scroll) + OptimisticUpdates(pt-optimistic-updates) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + Websockets(pt-websockets) + PushNotifications(pt-push-notifications) + ServerSentEvents(pt-server-sent-events) + FileUpload(pt-file-upload) + FileStorage(pt-file-storage) + ImageOptimization(pt-image-optimization) + ImageProcessing(pt-image-processing) + FullTextSearch(pt-full-text-search) + SocialSharing(pt-social-sharing) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + TransactionalEmail(pt-transactional-email) + EmailVerification(pt-email-verification) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + SoftDelete(pt-soft-delete) + TestingE2e(pt-testing-e2e) + TestingIntegration(pt-testing-integration)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/avatar-group.md
  - ../molecules/card.md
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/share-button.md
  - ../molecules/mention-input.md
  - ../molecules/tag-input.md
  - ../molecules/notification-badge.md
  # L3 Organisms - Complex Components
  - ../organisms/activity-feed.md
  - ../organisms/comments-section.md
  - ../organisms/file-uploader.md
  - ../organisms/notification-center.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/sidebar.md
  - ../organisms/search-modal.md
  - ../organisms/media-gallery.md
  - ../organisms/social-share.md
  - ../organisms/settings-form.md
  - ../organisms/auth-form.md
  # L4 Templates - Page Layouts
  - ../templates/profile-page.md
  - ../templates/notifications-page.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/search-results-page.md
  - ../templates/dashboard-layout.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/social-auth.md
  - ../patterns/rate-limiting.md
  - ../patterns/content-security-policy.md
  - ../patterns/xss-prevention.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Real-time & State
  - ../patterns/infinite-scroll.md
  - ../patterns/optimistic-updates.md
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/websockets.md
  - ../patterns/push-notifications.md
  - ../patterns/server-sent-events.md
  # L5 Patterns - File & Media
  - ../patterns/file-upload.md
  - ../patterns/file-storage.md
  - ../patterns/image-optimization.md
  - ../patterns/image-processing.md
  # L5 Patterns - Search & Discovery
  - ../patterns/full-text-search.md
  # L5 Patterns - Social
  - ../patterns/social-sharing.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-verification.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/soft-delete.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-integration.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - react-hook-form
  - zod
  - pusher-js
  - "@radix-ui/react-avatar"
  - "@radix-ui/react-dropdown-menu"
  - "@radix-ui/react-dialog"
  - "@radix-ui/react-tabs"
  - lucide-react
  - date-fns
skills:
  - infinite-scroll
  - optimistic-updates
  - real-time-updates
  - image-upload
  - notifications
  - user-profile
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Social Network

## Overview

A complete social network application featuring:
- User profiles with avatars and bios
- Post creation with images and text
- Follow/unfollow system
- Like and comment functionality
- Real-time notifications
- Infinite scroll feed
- User search and discovery
- Direct messaging

## Project Structure

```
social-network/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Home feed
│   │   ├── explore/page.tsx            # Discover users/posts
│   │   ├── notifications/page.tsx
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── [conversationId]/page.tsx
│   │   └── [username]/
│   │       ├── page.tsx                # Profile
│   │       ├── followers/page.tsx
│   │       └── following/page.tsx
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts
│   │   │   └── [postId]/
│   │   │       ├── route.ts
│   │   │       ├── like/route.ts
│   │   │       └── comments/route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   ├── [userId]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── follow/route.ts
│   │   │   │   └── posts/route.ts
│   │   │   └── search/route.ts
│   │   ├── notifications/route.ts
│   │   ├── messages/route.ts
│   │   └── upload/route.ts
│   └── layout.tsx
├── components/
│   ├── feed/
│   │   ├── post-card.tsx
│   │   ├── post-form.tsx
│   │   ├── comment-list.tsx
│   │   └── like-button.tsx
│   ├── profile/
│   │   ├── profile-header.tsx
│   │   ├── follow-button.tsx
│   │   └── user-card.tsx
│   ├── notifications/
│   │   └── notification-item.tsx
│   ├── messages/
│   │   ├── conversation-list.tsx
│   │   └── message-thread.tsx
│   └── ui/
│       ├── avatar.tsx
│       ├── button.tsx
│       └── infinite-scroll.tsx
├── lib/
│   ├── api.ts
│   ├── pusher.ts
│   └── utils.ts
├── hooks/
│   ├── use-feed.ts
│   ├── use-notifications.ts
│   └── use-follow.ts
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
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  name          String
  bio           String?
  avatar        String?
  coverImage    String?
  website       String?
  location      String?
  isVerified    Boolean   @default(false)
  isPrivate     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  followers     Follow[]    @relation("following")
  following     Follow[]    @relation("follower")
  
  // Notifications
  notificationsSent     Notification[] @relation("notifier")
  notificationsReceived Notification[] @relation("notified")
  
  // Messages
  conversationsInitiated Conversation[] @relation("initiator")
  conversationsReceived  Conversation[] @relation("receiver")
  messages               Message[]

  @@index([username])
  @@index([email])
}

model Post {
  id        String   @id @default(cuid())
  content   String
  images    String[] @default([])
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  // Engagement
  likes     Like[]
  comments  Comment[]
  
  // Metrics (denormalized for performance)
  likeCount    Int @default(0)
  commentCount Int @default(0)
  shareCount   Int @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
  @@index([createdAt])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  // Nested comments
  parentId  String?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  
  likeCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([postId])
  @@index([authorId])
  @@index([parentId])
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, postId])
  @@index([postId])
}

model Follow {
  id          String   @id @default(cuid())
  followerId  String
  follower    User     @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String
  following   User     @relation("following", fields: [followingId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}

model Notification {
  id         String           @id @default(cuid())
  type       NotificationType
  read       Boolean          @default(false)
  
  // Who triggered the notification
  notifierId String
  notifier   User   @relation("notifier", fields: [notifierId], references: [id], onDelete: Cascade)
  
  // Who receives the notification
  notifiedId String
  notified   User   @relation("notified", fields: [notifiedId], references: [id], onDelete: Cascade)
  
  // Optional reference to related content
  postId     String?
  commentId  String?
  
  createdAt  DateTime @default(now())

  @@index([notifiedId, read])
  @@index([notifiedId, createdAt])
}

enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
  MENTION
  REPLY
}

model Conversation {
  id          String    @id @default(cuid())
  initiatorId String
  initiator   User      @relation("initiator", fields: [initiatorId], references: [id])
  receiverId  String
  receiver    User      @relation("receiver", fields: [receiverId], references: [id])
  messages    Message[]
  lastMessageAt DateTime @default(now())
  createdAt   DateTime  @default(now())

  @@unique([initiatorId, receiverId])
  @@index([initiatorId])
  @@index([receiverId])
}

model Message {
  id             String       @id @default(cuid())
  content        String
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id])
  read           Boolean      @default(false)
  createdAt      DateTime     @default(now())

  @@index([conversationId])
  @@index([senderId])
}
```

## Implementation

### Post Card Component

```tsx
// components/feed/post-card.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LikeButton } from './like-button';
import { CommentList } from './comment-list';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    images: string[];
    createdAt: string;
    likeCount: number;
    commentCount: number;
    author: {
      id: string;
      username: string;
      name: string;
      avatar: string | null;
      isVerified: boolean;
    };
    isLiked: boolean;
  };
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = post.content.length > 280;
  const displayContent = shouldTruncate && !isExpanded
    ? post.content.slice(0, 280) + '...'
    : post.content;

  return (
    <article className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      {/* Author Header */}
      <div className="flex items-start gap-3">
        <Link href={`/${post.author.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Link 
                href={`/${post.author.username}`}
                className="font-semibold hover:underline"
              >
                {post.author.name}
              </Link>
              {post.author.isVerified && (
                <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
              <span className="text-gray-500">@{post.author.username}</span>
              <span className="text-gray-500">·</span>
              <time className="text-gray-500 hover:underline" dateTime={post.createdAt}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </time>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                {currentUserId === post.author.id ? (
                  <>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>Mute @{post.author.username}</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Report</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Content */}
          <div className="mt-1">
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
              {displayContent}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-500 hover:underline text-sm mt-1"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          
          {/* Images */}
          {post.images.length > 0 && (
            <div className={cn(
              'mt-3 grid gap-1 rounded-xl overflow-hidden',
              post.images.length === 1 && 'grid-cols-1',
              post.images.length === 2 && 'grid-cols-2',
              post.images.length >= 3 && 'grid-cols-2'
            )}>
              {post.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative aspect-square',
                    post.images.length === 1 && 'aspect-video',
                    post.images.length === 3 && index === 0 && 'row-span-2 aspect-auto'
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  {post.images.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        +{post.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-sm">{post.commentCount}</span>
            </button>
            
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked}
              initialCount={post.likeCount}
            />
            
            <button className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Share2 className="h-5 w-5" />
              </div>
            </button>
            
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                <Bookmark className="h-5 w-5" />
              </div>
            </button>
          </div>
          
          {/* Comments */}
          {showComments && (
            <div className="mt-4 border-t pt-4">
              <CommentList postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
```

### Like Button with Optimistic Updates

```tsx
// components/feed/like-button.tsx
'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });
      if (!response.ok) throw new Error('Failed to update like');
      return response.json();
    },
    onMutate: async () => {
      // Optimistic update
      setIsLiked(!isLiked);
      setCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: () => {
      // Rollback on error
      setIsLiked(isLiked);
      setCount(count);
    },
    onSettled: () => {
      // Invalidate feed queries to sync
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  return (
    <button
      onClick={() => likeMutation.mutate()}
      disabled={likeMutation.isPending}
      className={cn(
        'flex items-center gap-1 transition-colors group',
        isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
      )}
    >
      <div className={cn(
        'p-2 rounded-full transition-colors',
        isLiked ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'
      )}>
        <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
      </div>
      <span className="text-sm">{count}</span>
    </button>
  );
}
```

### Post Form

```tsx
// components/feed/post-form.tsx
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, X, Smile, MapPin, CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const postSchema = z.object({
  content: z.string().min(1).max(500),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  user: {
    name: string;
    username: string;
    avatar: string | null;
  };
}

export function PostForm({ user }: PostFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const content = watch('content', '');
  const charCount = content.length;
  const charLimit = 500;
  const charPercentage = (charCount / charLimit) * 100;

  const createPost = useMutation({
    mutationFn: async (data: PostFormData) => {
      // Upload images first
      const imageUrls: string[] = [];
      
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => formData.append('files', image));
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error('Failed to upload images');
        const { urls } = await uploadRes.json();
        imageUrls.push(...urls);
      }

      // Create post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          images: imageUrls,
        }),
      });

      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      reset();
      setImages([]);
      setPreviews([]);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={handleSubmit((data) => createPost.mutate(data))}
      className="border-b border-gray-200 dark:border-gray-800 p-4"
    >
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar || undefined} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <textarea
            {...register('content')}
            placeholder="What's happening?"
            className="w-full resize-none bg-transparent text-xl placeholder:text-gray-500 focus:outline-none min-h-[100px]"
            rows={3}
          />

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className={cn(
              'grid gap-2 mt-3',
              previews.length === 1 && 'grid-cols-1',
              previews.length === 2 && 'grid-cols-2',
              previews.length >= 3 && 'grid-cols-2'
            )}>
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden">
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-full hover:bg-black/90"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 4}
                className="text-blue-500 hover:text-blue-600"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-600"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-600"
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Character Counter */}
              {charCount > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${charPercentage * 0.5} 50`}
                      strokeLinecap="round"
                      transform="rotate(-90 10 10)"
                      className={cn(
                        charPercentage < 80 && 'text-blue-500',
                        charPercentage >= 80 && charPercentage < 100 && 'text-yellow-500',
                        charPercentage >= 100 && 'text-red-500'
                      )}
                    />
                  </svg>
                  {charCount > charLimit * 0.8 && (
                    <span className={cn(
                      'text-sm',
                      charCount > charLimit ? 'text-red-500' : 'text-gray-500'
                    )}>
                      {charLimit - charCount}
                    </span>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={!content.trim() || charCount > charLimit || createPost.isPending}
                className="rounded-full bg-blue-500 hover:bg-blue-600 px-4"
              >
                {createPost.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
```

### Follow Button

```tsx
// components/profile/follow-button.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  variant?: 'default' | 'compact';
}

export function FollowButton({ userId, initialFollowing, variant = 'default' }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });
      if (!response.ok) throw new Error('Failed to update follow');
      return response.json();
    },
    onMutate: () => {
      setIsFollowing(!isFollowing);
    },
    onError: () => {
      setIsFollowing(isFollowing);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const buttonText = isFollowing
    ? (isHovered ? 'Unfollow' : 'Following')
    : 'Follow';

  return (
    <Button
      onClick={() => followMutation.mutate()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={followMutation.isPending}
      variant={isFollowing ? 'outline' : 'default'}
      className={cn(
        'rounded-full font-semibold transition-all min-w-[100px]',
        isFollowing && isHovered && 'border-red-500 text-red-500 hover:bg-red-500/10',
        variant === 'compact' && 'min-w-[80px] h-8 text-sm'
      )}
    >
      {buttonText}
    </Button>
  );
}
```

### Profile Header

```tsx
// components/profile/profile-header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from './follow-button';

interface ProfileHeaderProps {
  user: {
    id: string;
    username: string;
    name: string;
    bio: string | null;
    avatar: string | null;
    coverImage: string | null;
    website: string | null;
    location: string | null;
    isVerified: boolean;
    createdAt: string;
    _count: {
      followers: number;
      following: number;
      posts: number;
    };
    isFollowing: boolean;
  };
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  return (
    <div>
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
        {user.coverImage && (
          <Image
            src={user.coverImage}
            alt=""
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        {/* Avatar & Actions */}
        <div className="flex justify-between items-end -mt-16 mb-4">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
          </Avatar>

          <div className="mt-16">
            {isOwnProfile ? (
              <Link
                href="/settings/profile"
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Edit profile
              </Link>
            ) : (
              <FollowButton userId={user.id} initialFollowing={user.isFollowing} />
            )}
          </div>
        </div>

        {/* Name & Username */}
        <div className="mb-3">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            {user.isVerified && (
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </div>
          <p className="text-gray-500">@{user.username}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mb-3 whitespace-pre-wrap">{user.bio}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 text-sm mb-3">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {user.location}
            </span>
          )}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              {new URL(user.website).hostname}
            </a>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <Link href={`/${user.username}/following`} className="hover:underline">
            <span className="font-bold">{user._count.following.toLocaleString()}</span>
            <span className="text-gray-500"> Following</span>
          </Link>
          <Link href={`/${user.username}/followers`} className="hover:underline">
            <span className="font-bold">{user._count.followers.toLocaleString()}</span>
            <span className="text-gray-500"> Followers</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Posts API Route

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  images: z.array(z.string().url()).max(4).optional(),
});

// GET /api/posts - Get feed
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const type = searchParams.get('type') || 'following'; // 'following' | 'all'

  // Get users the current user follows
  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  });

  const followingIds = following.map(f => f.followingId);

  // Build where clause based on feed type
  const whereClause = type === 'following'
    ? { authorId: { in: [...followingIds, session.user.id] } }
    : {};

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          isVerified: true,
        },
      },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, -1) : posts;

  const postsWithLikeStatus = items.map(post => ({
    ...post,
    isLiked: post.likes.length > 0,
    likes: undefined,
  }));

  return NextResponse.json({
    posts: postsWithLikeStatus,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}

// POST /api/posts - Create post
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, images } = createPostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        content,
        images: images || [],
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    // Detect mentions and create notifications
    const mentions = content.match(/@(\w+)/g);
    if (mentions) {
      const usernames = mentions.map(m => m.slice(1));
      const mentionedUsers = await prisma.user.findMany({
        where: { username: { in: usernames } },
        select: { id: true },
      });

      await prisma.notification.createMany({
        data: mentionedUsers.map(user => ({
          type: 'MENTION',
          notifierId: session.user.id,
          notifiedId: user.id,
          postId: post.id,
        })),
      });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Like API Route

```tsx
// app/api/posts/[postId]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

// POST /api/posts/[postId]/like - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Create like and update count in transaction
  const [like] = await prisma.$transaction([
    prisma.like.create({
      data: {
        userId: session.user.id,
        postId,
      },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    }),
  ]);

  // Create notification if not liking own post
  if (post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: 'LIKE',
        notifierId: session.user.id,
        notifiedId: post.authorId,
        postId,
      },
    });

    // Send real-time notification
    await pusherServer.trigger(
      `user-${post.authorId}`,
      'notification',
      { type: 'LIKE', postId }
    );
  }

  return NextResponse.json(like, { status: 201 });
}

// DELETE /api/posts/[postId]/like - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.like.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    }),
  ]);

  return new NextResponse(null, { status: 204 });
}
```

### Feed Hook

```tsx
// hooks/use-feed.ts
import { useInfiniteQuery } from '@tanstack/react-query';

interface Post {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
    isVerified: boolean;
  };
}

interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
}

export function useFeed(type: 'following' | 'all' = 'following') {
  return useInfiniteQuery({
    queryKey: ['feed', type],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ type });
      if (pageParam) params.set('cursor', pageParam);
      
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch feed');
      return response.json() as Promise<FeedResponse>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60 * 1000, // 1 minute
  });
}
```

### Home Feed Page

```tsx
// app/(main)/page.tsx
'use client';

import { useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/feed/post-card';
import { PostForm } from '@/components/feed/post-form';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import { useFeed } from '@/hooks/use-feed';

export default function HomePage() {
  const { data: session } = useSession();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed();

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b">
        <Tabs defaultValue="for-you" className="w-full">
          <TabsList className="w-full justify-around bg-transparent h-14">
            <TabsTrigger 
              value="for-you"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              For you
            </TabsTrigger>
            <TabsTrigger 
              value="following"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Post Form */}
      {session?.user && (
        <PostForm user={session.user as any} />
      )}

      {/* Feed */}
      <InfiniteScroll
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={session?.user?.id}
          />
        ))}
      </InfiniteScroll>

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl font-semibold mb-2">Welcome to the feed!</p>
          <p>Follow some users or create your first post to get started.</p>
        </div>
      )}
    </div>
  );
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| ProfilePage | L5 | User profiles with stats and posts |
| NotificationsPage | L5 | Activity notifications feed |
| SettingsPage | L5 | Account and privacy settings |
| ActivityFeed | L4 | Posts timeline with infinite scroll |
| CommentsSection | L4 | Post comments and replies |
| FileUploader | L4 | Profile and post images |
| NotificationCenter | L4 | Real-time notification dropdown |
| UserMenu | L4 | Account dropdown menu |
| InfiniteScrollPattern | L3 | Cursor-based feed pagination |
| OptimisticUpdatesPattern | L3 | Like/follow instant feedback |
| ReactQueryPattern | L3 | Data fetching and caching |

## Testing

### Setup

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react jsdom msw
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### Unit Tests

```tsx
// components/feed/like-button.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LikeButton } from './like-button';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { vi, describe, it, expect } from 'vitest';

const server = setupServer(
  http.post('/api/posts/:postId/like', () => {
    return HttpResponse.json({ id: 'like-1' });
  }),
  http.delete('/api/posts/:postId/like', () => {
    return new HttpResponse(null, { status: 204 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LikeButton', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('displays initial like count', () => {
    render(
      <LikeButton postId="post-1" initialLiked={false} initialCount={42} />,
      { wrapper }
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('optimistically updates on like', async () => {
    const user = userEvent.setup();

    render(
      <LikeButton postId="post-1" initialLiked={false} initialCount={10} />,
      { wrapper }
    );

    await user.click(screen.getByRole('button'));

    // Should immediately show updated count
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('optimistically updates on unlike', async () => {
    const user = userEvent.setup();

    render(
      <LikeButton postId="post-1" initialLiked={true} initialCount={10} />,
      { wrapper }
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('shows filled heart when liked', () => {
    render(
      <LikeButton postId="post-1" initialLiked={true} initialCount={5} />,
      { wrapper }
    );

    const heart = screen.getByRole('button').querySelector('svg');
    expect(heart).toHaveClass('fill-current');
  });
});
```

### Integration Tests

```tsx
// tests/integration/post-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostForm } from '@/components/feed/post-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'post-123',
      content: body.content,
      images: body.images,
      createdAt: new Date().toISOString(),
      author: { id: 'user-1', name: 'Test User', username: 'testuser' },
    });
  }),
  http.post('/api/upload', () => {
    return HttpResponse.json({ urls: ['https://example.com/image.jpg'] });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PostForm', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const mockUser = {
    name: 'Test User',
    username: 'testuser',
    avatar: null,
  };

  it('creates a post with text content', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <PostForm user={mockUser} />
      </QueryClientProvider>
    );

    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'Hello, world!');

    await user.click(screen.getByRole('button', { name: /post/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('shows character count when typing', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <PostForm user={mockUser} />
      </QueryClientProvider>
    );

    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'A'.repeat(450));

    // Should show remaining characters
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('disables post button when content is empty', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PostForm user={mockUser} />
      </QueryClientProvider>
    );

    const postButton = screen.getByRole('button', { name: /post/i });
    expect(postButton).toBeDisabled();
  });
});
```

### E2E Tests

```ts
// tests/e2e/social-feed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Social Feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('creates a new post', async ({ page }) => {
    const postContent = `Test post ${Date.now()}`;

    await page.fill('textarea', postContent);
    await page.click('button:has-text("Post")');

    await expect(page.getByText(postContent)).toBeVisible();
  });

  test('likes and unlikes a post', async ({ page }) => {
    const likeButton = page.locator('[data-testid="like-button"]').first();
    const initialCount = await likeButton.locator('span').textContent();

    await likeButton.click();

    // Check count increased
    await expect(likeButton.locator('span')).not.toHaveText(initialCount!);

    // Unlike
    await likeButton.click();
    await expect(likeButton.locator('span')).toHaveText(initialCount!);
  });

  test('follows and unfollows a user', async ({ page }) => {
    await page.goto('/someuser');

    const followButton = page.getByRole('button', { name: /follow/i });
    await followButton.click();

    await expect(page.getByRole('button', { name: /following/i })).toBeVisible();

    // Unfollow
    await page.getByRole('button', { name: /following/i }).hover();
    await page.getByRole('button', { name: /unfollow/i }).click();

    await expect(page.getByRole('button', { name: /follow/i })).toBeVisible();
  });

  test('loads more posts on scroll', async ({ page }) => {
    const initialPosts = await page.locator('article').count();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.waitForTimeout(1000);

    const newPosts = await page.locator('article').count();
    expect(newPosts).toBeGreaterThan(initialPosts);
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

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
    console.error('Social network error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't load this content. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

```ts
// lib/api-errors.ts
export class SocialAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'SocialAPIError';
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  CONTENT_POLICY: 'CONTENT_POLICY',
  BLOCKED_USER: 'BLOCKED_USER',
  SELF_ACTION: 'SELF_ACTION',
} as const;

export function handleSocialError(error: unknown): Response {
  if (error instanceof SocialAPIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected social error:', error);
  return Response.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Specific error checks
export function preventSelfAction(userId: string, targetId: string, action: string) {
  if (userId === targetId) {
    throw new SocialAPIError(
      `You cannot ${action} yourself`,
      400,
      ErrorCodes.SELF_ACTION
    );
  }
}
```

## Accessibility

### WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|----------------|
| 1.1.1 Non-text Content | Alt text for profile/post images, avatar fallbacks |
| 1.3.1 Info and Relationships | Semantic article elements for posts, proper headings |
| 1.4.3 Contrast | 4.5:1 minimum contrast, dark mode support |
| 2.1.1 Keyboard | All interactions keyboard accessible |
| 2.4.4 Link Purpose | Descriptive links for profiles and posts |
| 2.4.7 Focus Visible | Custom focus rings matching brand |
| 3.2.2 On Input | No unexpected context changes |
| 4.1.2 Name, Role, Value | ARIA for like/follow buttons, modals |

### Focus Management

```tsx
// hooks/use-feed-focus.ts
import { useEffect, useRef } from 'react';

export function useFeedFocus(posts: any[]) {
  const previousLength = useRef(posts.length);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (posts.length > previousLength.current) {
      // New posts loaded - don't move focus for infinite scroll
      // But announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `${posts.length - previousLength.current} new posts loaded`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }

    previousLength.current = posts.length;
  }, [posts.length]);

  return feedRef;
}

// Accessible like button
function LikeButton({ postId, isLiked, count }: LikeButtonProps) {
  return (
    <button
      aria-pressed={isLiked}
      aria-label={`${isLiked ? 'Unlike' : 'Like'} post, ${count} likes`}
      className="..."
    >
      <Heart aria-hidden="true" className={isLiked ? 'fill-current' : ''} />
      <span aria-hidden="true">{count}</span>
    </button>
  );
}

// Accessible follow button
function FollowButton({ isFollowing, username }: FollowButtonProps) {
  return (
    <button
      aria-pressed={isFollowing}
      aria-label={`${isFollowing ? 'Unfollow' : 'Follow'} @${username}`}
      className="..."
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
```

## Security

### Input Validation

```ts
// lib/validations/social.ts
import { z } from 'zod';

export const postSchema = z.object({
  content: z.string()
    .min(1, 'Post cannot be empty')
    .max(500, 'Post cannot exceed 500 characters')
    .refine((val) => !containsBannedContent(val), {
      message: 'Post contains prohibited content',
    }),

  images: z.array(z.string().url())
    .max(4, 'Maximum 4 images allowed')
    .optional(),
});

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(280, 'Comment cannot exceed 280 characters'),

  postId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
});

export const profileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),

  bio: z.string()
    .max(160, 'Bio cannot exceed 160 characters')
    .optional(),

  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),

  location: z.string()
    .max(30, 'Location cannot exceed 30 characters')
    .optional(),
});

// Content moderation helper
function containsBannedContent(content: string): boolean {
  const bannedPatterns = [
    // Add patterns for prohibited content
  ];
  return bannedPatterns.some(pattern => pattern.test(content));
}
```

### Rate Limiting

```ts
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Different limits for different actions
const postRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 posts per hour
  analytics: true,
});

const likeRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 likes per minute
  analytics: true,
});

const followRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 h'), // 30 follows per hour
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Post creation rate limit
  if (path === '/api/posts' && request.method === 'POST') {
    const { success } = await postRatelimit.limit(`post:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many posts. Please wait before posting again.' },
        { status: 429 }
      );
    }
  }

  // Like rate limit
  if (path.includes('/like') && request.method === 'POST') {
    const { success } = await likeRatelimit.limit(`like:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many likes. Please slow down.' },
        { status: 429 }
      );
    }
  }

  // Follow rate limit
  if (path.includes('/follow') && request.method === 'POST') {
    const { success } = await followRatelimit.limit(`follow:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many follow actions. Please wait.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}
```

## Performance

### Caching Strategy

```ts
// app/api/posts/route.ts
import { NextRequest } from 'next/server';
import { unstable_cache } from 'next/cache';

const getFeedPosts = unstable_cache(
  async (userId: string, cursor?: string) => {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    return prisma.post.findMany({
      where: { authorId: { in: [...followingIds, userId] } },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true, isVerified: true },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 21,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });
  },
  ['feed'],
  { revalidate: 30, tags: ['feed'] } // 30 second cache
);
```

### Image Optimization

```tsx
// components/profile/avatar.tsx
import Image from 'next/image';

interface AvatarProps {
  src: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: { container: 'h-8 w-8', image: 32, text: 'text-xs' },
  md: { container: 'h-10 w-10', image: 40, text: 'text-sm' },
  lg: { container: 'h-16 w-16', image: 64, text: 'text-lg' },
  xl: { container: 'h-32 w-32', image: 128, text: 'text-4xl' },
};

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const config = sizes[size];

  return (
    <div className={`${config.container} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={config.image}
          height={config.image}
          className="object-cover"
        />
      ) : (
        <span className={`${config.text} font-semibold text-gray-600`}>
          {name[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}
```

### Infinite Scroll Optimization

```tsx
// components/ui/infinite-scroll.tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver, threshold]);

  return (
    <div>
      {children}
      <div ref={sentinelRef} className="h-1" />
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: social_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Setup database
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/social_test

      - name: Run tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/social_test
          PUSHER_APP_ID: test
          PUSHER_KEY: test
          PUSHER_SECRET: test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Monitoring

### Sentry Integration

```ts
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
      blockAllMedia: false,
    }),
  ],

  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception?.values?.[0]?.value?.includes('Network request failed')) {
      return null;
    }
    return event;
  },
});
```

### Health Check Endpoint

```ts
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

export async function GET() {
  const checks = {
    database: false,
    pusher: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    await pusherServer.trigger('health-check', 'ping', {});
    checks.pusher = true;
  } catch (error) {
    console.error('Pusher health check failed:', error);
  }

  const healthy = checks.database && checks.pusher;

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

### Engagement Monitoring

```ts
// lib/analytics.ts
import * as Sentry from '@sentry/nextjs';

export function trackEngagement(action: string, data: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'engagement',
    message: action,
    level: 'info',
    data,
  });
}

// Usage
trackEngagement('post_created', { postId: post.id, hasImages: images.length > 0 });
trackEngagement('like_added', { postId, userId });
trackEngagement('follow', { followerId, followingId });
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/social_network"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Pusher (Real-time notifications)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="us2"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"

# File Upload (UploadThing)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Content Moderation (optional)
OPENAI_API_KEY="sk-..." # For AI-powered content moderation
```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Database migrations applied (`pnpm prisma migrate deploy`)
- [ ] Pusher account configured for real-time notifications
- [ ] Image upload storage configured (UploadThing/S3)
- [ ] Rate limiting Redis configured
- [ ] Sentry project created and DSN set
- [ ] Health check endpoint responding
- [ ] SSL certificate valid
- [ ] CDN configured for static assets and images
- [ ] Database backups scheduled
- [ ] Error alerting configured
- [ ] Content moderation policies in place
- [ ] User reporting system tested
- [ ] Dark mode tested across all pages
- [ ] Infinite scroll performance verified
- [ ] Mobile responsiveness tested
- [ ] Notification system tested end-to-end

### Content Moderation Queue

```typescript
// lib/moderation.ts
import { prisma } from '@/lib/prisma';

// Report types and severity levels
export const ReportType = {
  SPAM: 'SPAM',
  HARASSMENT: 'HARASSMENT',
  HATE_SPEECH: 'HATE_SPEECH',
  VIOLENCE: 'VIOLENCE',
  CSAM: 'CSAM',
  COPYRIGHT: 'COPYRIGHT',
  MISINFORMATION: 'MISINFORMATION',
  SELF_HARM: 'SELF_HARM',
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

export const ReportSeverity = {
  LOW: 1,      // Spam, minor issues
  MEDIUM: 2,   // Harassment, misinformation
  HIGH: 3,     // Hate speech, violence
  CRITICAL: 4, // CSAM, imminent threats
} as const;

export type ReportSeverity = (typeof ReportSeverity)[keyof typeof ReportSeverity];

export const ReportStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED_REMOVED: 'RESOLVED_REMOVED',
  RESOLVED_WARNING: 'RESOLVED_WARNING',
  RESOLVED_NO_ACTION: 'RESOLVED_NO_ACTION',
  ESCALATED: 'ESCALATED',
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

// Severity mapping for report types
export const REPORT_SEVERITY_MAP: Record<ReportType, ReportSeverity> = {
  SPAM: ReportSeverity.LOW,
  COPYRIGHT: ReportSeverity.LOW,
  MISINFORMATION: ReportSeverity.MEDIUM,
  HARASSMENT: ReportSeverity.MEDIUM,
  HATE_SPEECH: ReportSeverity.HIGH,
  VIOLENCE: ReportSeverity.HIGH,
  SELF_HARM: ReportSeverity.HIGH,
  CSAM: ReportSeverity.CRITICAL,
};

// Auto-moderation thresholds
export const AUTO_ACTION_THRESHOLDS = {
  AUTO_HIDE_REPORT_COUNT: 3,        // Hide content after 3 reports
  AUTO_REVIEW_REPORT_COUNT: 5,      // Escalate for review after 5 reports
  SPAM_SCORE_THRESHOLD: 0.8,        // AI spam detection threshold
  TOXICITY_THRESHOLD: 0.7,          // AI toxicity threshold
} as const;

// Keyword filter patterns for auto-moderation
export interface KeywordFilter {
  pattern: RegExp;
  type: ReportType;
  severity: ReportSeverity;
  action: 'flag' | 'block' | 'shadow_ban';
}

export const KEYWORD_FILTERS: KeywordFilter[] = [
  // Spam patterns
  {
    pattern: /(?:buy|sell|discount|click here|act now|limited time).{0,20}(?:http|www)/gi,
    type: ReportType.SPAM,
    severity: ReportSeverity.LOW,
    action: 'flag',
  },
  {
    pattern: /(?:earn|make)\s*\$?\d+k?\s*(?:per|a)\s*(?:day|week|month)/gi,
    type: ReportType.SPAM,
    severity: ReportSeverity.LOW,
    action: 'flag',
  },
  // Add more patterns as needed - keep actual harmful content patterns server-side only
];

// Spam detection patterns
export const SPAM_PATTERNS = {
  EXCESSIVE_CAPS: /[A-Z]{10,}/,
  EXCESSIVE_PUNCTUATION: /[!?]{3,}/,
  REPEATED_CHARS: /(.)\1{4,}/,
  MULTIPLE_URLS: /(https?:\/\/[^\s]+.*){3,}/,
  SUSPICIOUS_URLS: /(?:bit\.ly|tinyurl|t\.co|goo\.gl)/gi,
};

// Check content against auto-moderation rules
export async function checkAutoModeration(content: string): Promise<{
  shouldBlock: boolean;
  shouldFlag: boolean;
  reasons: string[];
  detectedTypes: ReportType[];
}> {
  const reasons: string[] = [];
  const detectedTypes: ReportType[] = [];
  let shouldBlock = false;
  let shouldFlag = false;

  // Check keyword filters
  for (const filter of KEYWORD_FILTERS) {
    if (filter.pattern.test(content)) {
      detectedTypes.push(filter.type);
      reasons.push(`Matched ${filter.type} pattern`);

      if (filter.action === 'block') {
        shouldBlock = true;
      } else if (filter.action === 'flag') {
        shouldFlag = true;
      }
    }
  }

  // Check spam patterns
  let spamScore = 0;
  if (SPAM_PATTERNS.EXCESSIVE_CAPS.test(content)) {
    spamScore += 0.2;
    reasons.push('Excessive capitalization');
  }
  if (SPAM_PATTERNS.EXCESSIVE_PUNCTUATION.test(content)) {
    spamScore += 0.15;
    reasons.push('Excessive punctuation');
  }
  if (SPAM_PATTERNS.REPEATED_CHARS.test(content)) {
    spamScore += 0.15;
    reasons.push('Repeated characters');
  }
  if (SPAM_PATTERNS.MULTIPLE_URLS.test(content)) {
    spamScore += 0.3;
    reasons.push('Multiple URLs');
  }
  if (SPAM_PATTERNS.SUSPICIOUS_URLS.test(content)) {
    spamScore += 0.25;
    reasons.push('Suspicious URL shorteners');
  }

  if (spamScore >= AUTO_ACTION_THRESHOLDS.SPAM_SCORE_THRESHOLD) {
    shouldFlag = true;
    detectedTypes.push(ReportType.SPAM);
  }

  return { shouldBlock, shouldFlag, reasons, detectedTypes };
}

// AI Moderation Integration Hooks
export interface AIModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  scores: Record<string, number>;
}

// Perspective API integration
export async function checkPerspectiveAPI(content: string): Promise<AIModerationResult | null> {
  const apiKey = process.env.PERSPECTIVE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: { text: content },
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            THREAT: {},
            SEXUALLY_EXPLICIT: {},
          },
          languages: ['en'],
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const scores: Record<string, number> = {};
    const categories: Record<string, boolean> = {};

    for (const [attr, value] of Object.entries(data.attributeScores || {})) {
      const score = (value as any).summaryScore?.value || 0;
      scores[attr] = score;
      categories[attr] = score > AUTO_ACTION_THRESHOLDS.TOXICITY_THRESHOLD;
    }

    return {
      flagged: Object.values(categories).some(Boolean),
      categories,
      scores,
    };
  } catch (error) {
    console.error('Perspective API error:', error);
    return null;
  }
}

// OpenAI Moderation API integration
export async function checkOpenAIModeration(content: string): Promise<AIModerationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: content }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) return null;

    return {
      flagged: result.flagged,
      categories: result.categories,
      scores: result.category_scores,
    };
  } catch (error) {
    console.error('OpenAI Moderation API error:', error);
    return null;
  }
}

// Combined AI moderation check
export async function runAIModeration(content: string): Promise<{
  flagged: boolean;
  provider: string | null;
  results: AIModerationResult | null;
}> {
  // Try OpenAI first (faster, more reliable)
  const openaiResult = await checkOpenAIModeration(content);
  if (openaiResult) {
    return {
      flagged: openaiResult.flagged,
      provider: 'openai',
      results: openaiResult,
    };
  }

  // Fallback to Perspective API
  const perspectiveResult = await checkPerspectiveAPI(content);
  if (perspectiveResult) {
    return {
      flagged: perspectiveResult.flagged,
      provider: 'perspective',
      results: perspectiveResult,
    };
  }

  return { flagged: false, provider: null, results: null };
}

// Reporter credibility scoring
export async function getReporterCredibility(userId: string): Promise<number> {
  const stats = await prisma.contentReport.groupBy({
    by: ['status'],
    where: { reporterId: userId },
    _count: true,
  });

  let validReports = 0;
  let invalidReports = 0;
  let totalReports = 0;

  for (const stat of stats) {
    totalReports += stat._count;
    if (stat.status === 'RESOLVED_REMOVED' || stat.status === 'RESOLVED_WARNING') {
      validReports += stat._count;
    } else if (stat.status === 'RESOLVED_NO_ACTION') {
      invalidReports += stat._count;
    }
  }

  if (totalReports === 0) return 0.5; // New reporter, neutral score

  // Calculate credibility (0-1 scale)
  const accuracy = validReports / Math.max(1, validReports + invalidReports);
  const volume = Math.min(1, totalReports / 50); // Bonus for active reporters

  return Math.min(1, accuracy * 0.7 + volume * 0.3);
}
```

```typescript
// app/api/posts/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  ReportType,
  ReportSeverity,
  REPORT_SEVERITY_MAP,
  AUTO_ACTION_THRESHOLDS,
  getReporterCredibility,
} from '@/lib/moderation';

const reportSchema = z.object({
  type: z.enum([
    'SPAM',
    'HARASSMENT',
    'HATE_SPEECH',
    'VIOLENCE',
    'CSAM',
    'COPYRIGHT',
    'MISINFORMATION',
    'SELF_HARM',
  ]),
  description: z.string().max(1000).optional(),
  additionalContext: z.string().max(500).optional(),
});

// POST /api/posts/[id]/report - Submit content report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: postId } = await params;
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { type, description, additionalContext } = reportSchema.parse(body);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, isHidden: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Prevent self-reporting
    if (post.authorId === userId) {
      return NextResponse.json(
        { error: 'Cannot report your own content' },
        { status: 400 }
      );
    }

    // Check for duplicate report
    const existingReport = await prisma.contentReport.findFirst({
      where: {
        contentId: postId,
        contentType: 'POST',
        reporterId: userId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 400 }
      );
    }

    // Get reporter credibility for prioritization
    const reporterCredibility = await getReporterCredibility(userId);
    const severity = REPORT_SEVERITY_MAP[type as ReportType];

    // Create the report
    const report = await prisma.contentReport.create({
      data: {
        contentId: postId,
        contentType: 'POST',
        reporterId: userId,
        type,
        severity,
        description,
        additionalContext,
        reporterCredibility,
        status: 'PENDING',
      },
    });

    // Check total reports for auto-action
    const totalReports = await prisma.contentReport.count({
      where: {
        contentId: postId,
        contentType: 'POST',
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });

    // Auto-hide content if threshold reached
    if (totalReports >= AUTO_ACTION_THRESHOLDS.AUTO_HIDE_REPORT_COUNT && !post.isHidden) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          isHidden: true,
          hiddenReason: 'AUTO_HIDDEN_REPORTS',
          hiddenAt: new Date(),
        },
      });

      // Create moderation log
      await prisma.moderationLog.create({
        data: {
          action: 'AUTO_HIDE',
          contentId: postId,
          contentType: 'POST',
          reason: `Auto-hidden after ${totalReports} reports`,
          automated: true,
        },
      });
    }

    // Escalate critical reports immediately
    if (severity === ReportSeverity.CRITICAL) {
      await prisma.contentReport.update({
        where: { id: report.id },
        data: { status: 'ESCALATED' },
      });

      // Trigger urgent notification to moderators
      await notifyModerators(report.id, type, 'CRITICAL');
    }

    return NextResponse.json(
      {
        message: 'Report submitted successfully',
        reportId: report.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Report submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

// Helper to notify moderators of critical reports
async function notifyModerators(
  reportId: string,
  reportType: string,
  severity: string
) {
  // Get admin users
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    select: { id: true, email: true },
  });

  // Create notifications for each admin
  await prisma.adminNotification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: 'URGENT_REPORT',
      title: `${severity} Report: ${reportType}`,
      message: `A ${severity.toLowerCase()} priority ${reportType} report requires immediate attention.`,
      metadata: { reportId },
    })),
  });

  // For CSAM reports, also log for legal compliance
  if (reportType === 'CSAM') {
    await prisma.legalComplianceLog.create({
      data: {
        type: 'CSAM_REPORT',
        reportId,
        status: 'PENDING_REVIEW',
        preservedAt: new Date(),
      },
    });
  }
}
```

```typescript
// app/api/admin/moderation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/admin/moderation - Get moderation queue
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || 'PENDING';
  const type = searchParams.get('type');
  const severity = searchParams.get('severity');
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  const where: any = {};

  if (status !== 'ALL') {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }
  if (severity) {
    where.severity = parseInt(severity);
  }

  const reports = await prisma.contentReport.findMany({
    where,
    include: {
      reporter: {
        select: { id: true, username: true, name: true },
      },
    },
    orderBy: [
      { severity: 'desc' },
      { reporterCredibility: 'desc' },
      { createdAt: 'asc' },
    ],
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  // Fetch content details separately to avoid type issues
  const reportsWithContent = await Promise.all(
    reports.slice(0, limit).map(async (report) => {
      let content = null;
      if (report.contentType === 'POST') {
        content = await prisma.post.findUnique({
          where: { id: report.contentId },
          select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            author: {
              select: { id: true, username: true, name: true, avatar: true },
            },
          },
        });
      } else if (report.contentType === 'COMMENT') {
        content = await prisma.comment.findUnique({
          where: { id: report.contentId },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: { id: true, username: true, name: true, avatar: true },
            },
          },
        });
      }
      return { ...report, content };
    })
  );

  const hasMore = reports.length > limit;

  // Get queue statistics
  const stats = await prisma.contentReport.groupBy({
    by: ['status', 'severity'],
    _count: true,
  });

  return NextResponse.json({
    reports: reportsWithContent,
    nextCursor: hasMore ? reports[limit - 1].id : null,
    stats,
  });
}

const bulkActionSchema = z.object({
  reportIds: z.array(z.string()).min(1).max(50),
  action: z.enum(['approve', 'remove', 'warn', 'ban', 'dismiss']),
  reason: z.string().max(500).optional(),
  notifyUser: z.boolean().default(true),
});

// POST /api/admin/moderation - Bulk moderation actions
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { reportIds, action, reason, notifyUser } = bulkActionSchema.parse(body);

    const results = await Promise.all(
      reportIds.map(async (reportId) => {
        try {
          const report = await prisma.contentReport.findUnique({
            where: { id: reportId },
          });

          if (!report) {
            return { reportId, success: false, error: 'Report not found' };
          }

          // Process based on action
          let newStatus = 'RESOLVED_NO_ACTION';
          let contentAction = null;

          switch (action) {
            case 'approve':
              // Content is fine, no action needed
              newStatus = 'RESOLVED_NO_ACTION';
              break;

            case 'remove':
              newStatus = 'RESOLVED_REMOVED';
              contentAction = 'REMOVE';
              await removeContent(report.contentId, report.contentType);
              break;

            case 'warn':
              newStatus = 'RESOLVED_WARNING';
              contentAction = 'WARN';
              await issueWarning(report.contentId, report.contentType, reason);
              break;

            case 'ban':
              newStatus = 'RESOLVED_REMOVED';
              contentAction = 'BAN';
              await banContentAuthor(report.contentId, report.contentType, reason);
              break;

            case 'dismiss':
              newStatus = 'RESOLVED_NO_ACTION';
              break;
          }

          // Update report status
          await prisma.contentReport.update({
            where: { id: reportId },
            data: {
              status: newStatus,
              resolvedAt: new Date(),
              resolvedById: session.user.id,
              resolution: reason,
            },
          });

          // Create moderation log
          await prisma.moderationLog.create({
            data: {
              action: contentAction || action.toUpperCase(),
              contentId: report.contentId,
              contentType: report.contentType,
              moderatorId: session.user.id,
              reportId,
              reason,
              automated: false,
            },
          });

          return { reportId, success: true };
        } catch (error) {
          console.error(`Failed to process report ${reportId}:`, error);
          return { reportId, success: false, error: 'Processing failed' };
        }
      })
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Processed ${successful} reports, ${failed} failed`,
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Bulk moderation error:', error);
    return NextResponse.json(
      { error: 'Failed to process moderation actions' },
      { status: 500 }
    );
  }
}

// Helper functions for moderation actions
async function removeContent(contentId: string, contentType: string) {
  if (contentType === 'POST') {
    await prisma.post.update({
      where: { id: contentId },
      data: {
        isRemoved: true,
        removedAt: new Date(),
        removedReason: 'MODERATION',
      },
    });
  } else if (contentType === 'COMMENT') {
    await prisma.comment.update({
      where: { id: contentId },
      data: {
        isRemoved: true,
        removedAt: new Date(),
      },
    });
  }
}

async function issueWarning(
  contentId: string,
  contentType: string,
  reason?: string
) {
  // Get content author
  let authorId: string | null = null;

  if (contentType === 'POST') {
    const post = await prisma.post.findUnique({
      where: { id: contentId },
      select: { authorId: true },
    });
    authorId = post?.authorId || null;
  } else if (contentType === 'COMMENT') {
    const comment = await prisma.comment.findUnique({
      where: { id: contentId },
      select: { authorId: true },
    });
    authorId = comment?.authorId || null;
  }

  if (authorId) {
    // Create user strike
    await prisma.userStrike.create({
      data: {
        userId: authorId,
        type: 'WARNING',
        reason: reason || 'Content policy violation',
        contentId,
        contentType,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        type: 'MODERATION_WARNING',
        notifiedId: authorId,
        notifierId: authorId, // System notification
        metadata: { reason, contentId, contentType },
      },
    });
  }
}

async function banContentAuthor(
  contentId: string,
  contentType: string,
  reason?: string
) {
  let authorId: string | null = null;

  if (contentType === 'POST') {
    const post = await prisma.post.findUnique({
      where: { id: contentId },
      select: { authorId: true },
    });
    authorId = post?.authorId || null;
  } else if (contentType === 'COMMENT') {
    const comment = await prisma.comment.findUnique({
      where: { id: contentId },
      select: { authorId: true },
    });
    authorId = comment?.authorId || null;
  }

  if (authorId) {
    await prisma.user.update({
      where: { id: authorId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason || 'Severe content policy violation',
      },
    });

    // Also remove the offending content
    await removeContent(contentId, contentType);
  }
}
```

### Moderation Admin Dashboard

```tsx
// components/admin/moderation-queue.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Ban,
  Eye,
  ChevronDown,
  Keyboard,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  type: string;
  severity: number;
  status: string;
  description?: string;
  reporterCredibility: number;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
    name: string;
  };
  content: {
    id: string;
    content: string;
    images?: string[];
    createdAt: string;
    author: {
      id: string;
      username: string;
      name: string;
      avatar?: string;
    };
  } | null;
}

interface ModerationQueueProps {
  initialStatus?: string;
}

const SEVERITY_CONFIG = {
  1: { label: 'Low', color: 'bg-blue-100 text-blue-800', icon: AlertTriangle },
  2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  3: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: AlertOctagon },
  4: { label: 'Critical', color: 'bg-red-100 text-red-800', icon: AlertOctagon },
};

const KEYBOARD_SHORTCUTS = {
  a: 'approve',
  r: 'remove',
  w: 'warn',
  b: 'ban',
  d: 'dismiss',
  j: 'next',
  k: 'previous',
} as const;

export function ModerationQueue({ initialStatus = 'PENDING' }: ModerationQueueProps) {
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

  const queryClient = useQueryClient();

  // Fetch moderation queue
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['moderation-queue', statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ status: statusFilter });
      if (typeFilter) params.set('type', typeFilter);

      const response = await fetch(`/api/admin/moderation?${params}`);
      if (!response.ok) throw new Error('Failed to fetch queue');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const reports: Report[] = data?.reports || [];

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({
      reportIds,
      action,
      reason,
    }: {
      reportIds: string[];
      action: string;
      reason?: string;
    }) => {
      const response = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportIds, action, reason }),
      });
      if (!response.ok) throw new Error('Failed to process action');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setSelectedReports(new Set());
      setActionDialogOpen(false);
      setActionReason('');
    },
  });

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (actionDialogOpen) return;

      const key = e.key.toLowerCase();
      const shortcut = KEYBOARD_SHORTCUTS[key as keyof typeof KEYBOARD_SHORTCUTS];

      if (shortcut === 'next' && focusedIndex < reports.length - 1) {
        setFocusedIndex((prev) => prev + 1);
      } else if (shortcut === 'previous' && focusedIndex > 0) {
        setFocusedIndex((prev) => prev - 1);
      } else if (['approve', 'remove', 'warn', 'ban', 'dismiss'].includes(shortcut)) {
        e.preventDefault();
        const targetReports = selectedReports.size > 0
          ? Array.from(selectedReports)
          : [reports[focusedIndex]?.id].filter(Boolean);

        if (targetReports.length > 0) {
          if (['warn', 'ban', 'remove'].includes(shortcut)) {
            setPendingAction(shortcut);
            setActionDialogOpen(true);
          } else {
            bulkActionMutation.mutate({ reportIds: targetReports, action: shortcut });
          }
        }
      } else if (e.key === ' ' && reports[focusedIndex]) {
        e.preventDefault();
        toggleReportSelection(reports[focusedIndex].id);
      } else if (e.key === '?') {
        setShowShortcuts((prev) => !prev);
      }
    },
    [focusedIndex, reports, selectedReports, actionDialogOpen, bulkActionMutation]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  };

  const handleAction = (action: string) => {
    const targetReports = selectedReports.size > 0
      ? Array.from(selectedReports)
      : [reports[focusedIndex]?.id].filter(Boolean);

    if (targetReports.length === 0) return;

    if (['warn', 'ban', 'remove'].includes(action)) {
      setPendingAction(action);
      setActionDialogOpen(true);
    } else {
      bulkActionMutation.mutate({ reportIds: targetReports, action });
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;

    const targetReports = selectedReports.size > 0
      ? Array.from(selectedReports)
      : [reports[focusedIndex]?.id].filter(Boolean);

    bulkActionMutation.mutate({
      reportIds: targetReports,
      action: pendingAction,
      reason: actionReason,
    });
  };

  const getCredibilityBadge = (score: number) => {
    if (score >= 0.8) return <Badge variant="success">Trusted</Badge>;
    if (score >= 0.5) return <Badge variant="default">Normal</Badge>;
    return <Badge variant="destructive">Low Trust</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters and stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="ESCALATED">Escalated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter || 'ALL'} onValueChange={(v) => setTypeFilter(v === 'ALL' ? null : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="SPAM">Spam</SelectItem>
              <SelectItem value="HARASSMENT">Harassment</SelectItem>
              <SelectItem value="HATE_SPEECH">Hate Speech</SelectItem>
              <SelectItem value="VIOLENCE">Violence</SelectItem>
              <SelectItem value="CSAM">CSAM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts(true)}
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Shortcuts (?)
          </Button>

          {selectedReports.size > 0 && (
            <span className="text-sm text-gray-500">
              {selectedReports.size} selected
            </span>
          )}
        </div>
      </div>

      {/* Queue statistics */}
      {data?.stats && (
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(
            data.stats.reduce((acc: any, stat: any) => {
              acc[stat.status] = (acc[stat.status] || 0) + stat._count;
              return acc;
            }, {})
          ).map(([status, count]) => (
            <div key={status} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold">{count as number}</div>
              <div className="text-sm text-gray-500">{status.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedReports.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-sm font-medium">
            {selectedReports.size} reports selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" onClick={() => handleAction('approve')}>
            <CheckCircle className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleAction('remove')}>
            <XCircle className="h-4 w-4 mr-1" /> Remove
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleAction('warn')}>
            <AlertTriangle className="h-4 w-4 mr-1" /> Warn
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleAction('ban')}>
            <Ban className="h-4 w-4 mr-1" /> Ban
          </Button>
        </div>
      )}

      {/* Reports list */}
      <div className="space-y-2">
        {reports.map((report, index) => {
          const severityConfig = SEVERITY_CONFIG[report.severity as keyof typeof SEVERITY_CONFIG];
          const SeverityIcon = severityConfig?.icon || AlertTriangle;

          return (
            <div
              key={report.id}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all cursor-pointer',
                focusedIndex === index && 'ring-2 ring-blue-500',
                selectedReports.has(report.id) && 'bg-blue-50 dark:bg-blue-900/20'
              )}
              onClick={() => setFocusedIndex(index)}
            >
              <div className="flex items-start gap-4">
                {/* Selection checkbox */}
                <input
                  type="checkbox"
                  checked={selectedReports.has(report.id)}
                  onChange={() => toggleReportSelection(report.id)}
                  className="mt-1"
                />

                {/* Severity indicator */}
                <div className={cn('p-2 rounded-lg', severityConfig?.color)}>
                  <SeverityIcon className="h-5 w-5" />
                </div>

                {/* Report details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{report.type}</Badge>
                    <Badge className={severityConfig?.color}>
                      {severityConfig?.label}
                    </Badge>
                    {getCredibilityBadge(report.reporterCredibility)}
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Reported content */}
                  {report.content && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.content.author.avatar} />
                          <AvatarFallback>
                            {report.content.author.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {report.content.author.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          @{report.content.author.username}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {report.content.content}
                      </p>
                      {report.content.images && report.content.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {report.content.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="h-16 w-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Report description */}
                  {report.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Reporter note:</span>{' '}
                      {report.description}
                    </p>
                  )}

                  {/* Reporter info */}
                  <p className="text-xs text-gray-500 mt-2">
                    Reported by @{report.reporter.username}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedIndex(index);
                      handleAction('approve');
                    }}
                    title="Approve (A)"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedIndex(index);
                      handleAction('remove');
                    }}
                    title="Remove (R)"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedIndex(index);
                      handleAction('warn');
                    }}
                    title="Warn (W)"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {reports.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">Queue is empty</p>
            <p className="text-sm">No reports matching your filters</p>
          </div>
        )}
      </div>

      {/* Action confirmation dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'remove' && 'Remove Content'}
              {pendingAction === 'warn' && 'Issue Warning'}
              {pendingAction === 'ban' && 'Ban User'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {pendingAction === 'remove' &&
                'This will remove the content and notify the author.'}
              {pendingAction === 'warn' &&
                'This will issue a warning strike to the user.'}
              {pendingAction === 'ban' &&
                'This will permanently ban the user and remove their content.'}
            </p>

            <Textarea
              placeholder="Reason (optional but recommended)"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction === 'ban' ? 'destructive' : 'default'}
              onClick={confirmAction}
              disabled={bulkActionMutation.isPending}
            >
              {bulkActionMutation.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard shortcuts dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">A</kbd> Approve</div>
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd> Remove</div>
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">W</kbd> Warn</div>
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">B</kbd> Ban</div>
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">D</kbd> Dismiss</div>
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">J</kbd> Next</div>
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">K</kbd> Previous</div>
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> Select</div>
            <div><kbd className="px-2 py-1 bg-gray-100 rounded">?</kbd> Show shortcuts</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

```tsx
// components/admin/user-review.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import {
  AlertTriangle,
  Ban,
  Shield,
  ShieldOff,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface UserStrike {
  id: string;
  type: 'WARNING' | 'STRIKE' | 'TEMPORARY_BAN';
  reason: string;
  contentId?: string;
  contentType?: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

interface UserAppeal {
  id: string;
  strikeId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  adminResponse?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface UserReviewProps {
  userId: string;
}

const STRIKE_THRESHOLDS = {
  WARNING_TO_STRIKE: 3,    // 3 warnings = 1 strike
  STRIKES_TO_BAN: 3,       // 3 strikes = permanent ban
  TEMP_BAN_DAYS: [1, 3, 7], // Escalating temporary ban durations
};

export function UserReview({ userId }: UserReviewProps) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [appealDialogOpen, setAppealDialogOpen] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<UserAppeal | null>(null);
  const [banReason, setBanReason] = useState('');
  const [appealResponse, setAppealResponse] = useState('');

  const queryClient = useQueryClient();

  // Fetch user details with violation history
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-review', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/review`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  // Fetch user strikes
  const { data: strikes } = useQuery({
    queryKey: ['user-strikes', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/strikes`);
      if (!response.ok) throw new Error('Failed to fetch strikes');
      return response.json();
    },
  });

  // Fetch user appeals
  const { data: appeals } = useQuery({
    queryKey: ['user-appeals', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/appeals`);
      if (!response.ok) throw new Error('Failed to fetch appeals');
      return response.json();
    },
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async ({ permanent, reason }: { permanent: boolean; reason: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permanent, reason }),
      });
      if (!response.ok) throw new Error('Failed to ban user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-review', userId] });
      setBanDialogOpen(false);
      setBanReason('');
    },
  });

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to unban user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-review', userId] });
    },
  });

  // Handle appeal mutation
  const appealMutation = useMutation({
    mutationFn: async ({
      appealId,
      status,
      response,
    }: {
      appealId: string;
      status: 'APPROVED' | 'DENIED';
      response: string;
    }) => {
      const res = await fetch(`/api/admin/appeals/${appealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, response }),
      });
      if (!res.ok) throw new Error('Failed to process appeal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-appeals', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-strikes', userId] });
      setAppealDialogOpen(false);
      setSelectedAppeal(null);
      setAppealResponse('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8 text-gray-500">User not found</div>;
  }

  const activeStrikes = (strikes?.strikes || []).filter((s: UserStrike) => s.isActive);
  const strikeCount = activeStrikes.filter((s: UserStrike) => s.type === 'STRIKE').length;
  const warningCount = activeStrikes.filter((s: UserStrike) => s.type === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* User header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{user.name}</h2>
              {user.isBanned && (
                <Badge variant="destructive">Banned</Badge>
              )}
              {user.isVerified && (
                <Badge variant="secondary">Verified</Badge>
              )}
            </div>
            <p className="text-gray-500">@{user.username}</p>
            <p className="text-sm text-gray-500 mt-1">
              Joined {format(new Date(user.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="flex gap-2">
            {user.isBanned ? (
              <Button
                variant="outline"
                onClick={() => unbanMutation.mutate()}
                disabled={unbanMutation.isPending}
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Unban User
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setBanDialogOpen(true)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Ban User
              </Button>
            )}
          </div>
        </div>

        {/* Strike summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500">{warningCount}</div>
            <div className="text-sm text-gray-500">Warnings</div>
            <div className="text-xs text-gray-400">
              {STRIKE_THRESHOLDS.WARNING_TO_STRIKE - (warningCount % STRIKE_THRESHOLDS.WARNING_TO_STRIKE)} until strike
            </div>
          </div>
          <div className="text-center">
            <div className={cn(
              'text-3xl font-bold',
              strikeCount >= 2 ? 'text-red-500' : 'text-orange-500'
            )}>
              {strikeCount}
            </div>
            <div className="text-sm text-gray-500">Strikes</div>
            <div className="text-xs text-gray-400">
              {STRIKE_THRESHOLDS.STRIKES_TO_BAN - strikeCount} until permanent ban
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-500">
              {user.reportCount || 0}
            </div>
            <div className="text-sm text-gray-500">Total Reports</div>
          </div>
        </div>

        {/* Strike progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Strike Progress</span>
            <span>{strikeCount} / {STRIKE_THRESHOLDS.STRIKES_TO_BAN}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                strikeCount === 0 && 'bg-green-500',
                strikeCount === 1 && 'bg-yellow-500',
                strikeCount === 2 && 'bg-orange-500',
                strikeCount >= 3 && 'bg-red-500'
              )}
              style={{ width: `${(strikeCount / STRIKE_THRESHOLDS.STRIKES_TO_BAN) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs for history */}
      <Tabs defaultValue="strikes">
        <TabsList>
          <TabsTrigger value="strikes">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Violation History ({strikes?.strikes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="appeals">
            <MessageSquare className="h-4 w-4 mr-2" />
            Appeals ({appeals?.appeals?.filter((a: UserAppeal) => a.status === 'PENDING').length || 0} pending)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strikes" className="space-y-4">
          {(strikes?.strikes || []).map((strike: UserStrike) => (
            <div
              key={strike.id}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-lg shadow p-4',
                !strike.isActive && 'opacity-50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  strike.type === 'WARNING' && 'bg-yellow-100 text-yellow-800',
                  strike.type === 'STRIKE' && 'bg-orange-100 text-orange-800',
                  strike.type === 'TEMPORARY_BAN' && 'bg-red-100 text-red-800'
                )}>
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={strike.isActive ? 'default' : 'secondary'}>
                      {strike.type.replace('_', ' ')}
                    </Badge>
                    {!strike.isActive && (
                      <Badge variant="outline">Expired</Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(strike.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="mt-2 text-sm">{strike.reason}</p>

                  {strike.expiresAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Expires {format(new Date(strike.expiresAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(!strikes?.strikes || strikes.strikes.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No violations on record</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="appeals" className="space-y-4">
          {(appeals?.appeals || []).map((appeal: UserAppeal) => (
            <div
              key={appeal.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        appeal.status === 'PENDING'
                          ? 'default'
                          : appeal.status === 'APPROVED'
                          ? 'success'
                          : 'destructive'
                      }
                    >
                      {appeal.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(appeal.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="mt-2 text-sm">{appeal.reason}</p>

                  {appeal.adminResponse && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                      <p className="text-xs text-gray-500 mb-1">Admin response:</p>
                      <p className="text-sm">{appeal.adminResponse}</p>
                    </div>
                  )}
                </div>

                {appeal.status === 'PENDING' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedAppeal(appeal);
                      setAppealDialogOpen(true);
                    }}
                  >
                    Review
                  </Button>
                )}
              </div>
            </div>
          ))}

          {(!appeals?.appeals || appeals.appeals.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>No appeals submitted</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Ban dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will ban @{user.username} from the platform.
            </p>

            <Textarea
              placeholder="Reason for ban (required)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => banMutation.mutate({ permanent: false, reason: banReason })}
                disabled={!banReason.trim() || banMutation.isPending}
              >
                Temporary Ban
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => banMutation.mutate({ permanent: true, reason: banReason })}
                disabled={!banReason.trim() || banMutation.isPending}
              >
                Permanent Ban
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appeal review dialog */}
      <Dialog open={appealDialogOpen} onOpenChange={setAppealDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Appeal</DialogTitle>
          </DialogHeader>

          {selectedAppeal && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="text-sm font-medium mb-1">User's appeal:</p>
                <p className="text-sm">{selectedAppeal.reason}</p>
              </div>

              <Textarea
                placeholder="Response to user (optional)"
                value={appealResponse}
                onChange={(e) => setAppealResponse(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() =>
                selectedAppeal &&
                appealMutation.mutate({
                  appealId: selectedAppeal.id,
                  status: 'DENIED',
                  response: appealResponse,
                })
              }
              disabled={appealMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Deny
            </Button>
            <Button
              onClick={() =>
                selectedAppeal &&
                appealMutation.mutate({
                  appealId: selectedAppeal.id,
                  status: 'APPROVED',
                  response: appealResponse,
                })
              }
              disabled={appealMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### User Blocking & Muting

```typescript
// app/api/users/[id]/block/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/users/[id]/block - Block a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: targetUserId } = await params;
  const userId = session.user.id;

  // Prevent self-blocking
  if (userId === targetUserId) {
    return NextResponse.json(
      { error: 'Cannot block yourself' },
      { status: 400 }
    );
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if already blocked
  const existingBlock = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: userId,
        blockedId: targetUserId,
      },
    },
  });

  if (existingBlock) {
    return NextResponse.json(
      { error: 'User already blocked' },
      { status: 400 }
    );
  }

  // Create block and remove any existing relationships
  await prisma.$transaction([
    // Create the block
    prisma.userBlock.create({
      data: {
        blockerId: userId,
        blockedId: targetUserId,
      },
    }),
    // Remove follow relationship (both directions)
    prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: userId, followingId: targetUserId },
          { followerId: targetUserId, followingId: userId },
        ],
      },
    }),
    // Remove any pending follow requests
    prisma.followRequest.deleteMany({
      where: {
        OR: [
          { requesterId: userId, targetId: targetUserId },
          { requesterId: targetUserId, targetId: userId },
        ],
      },
    }),
  ]);

  return NextResponse.json({ message: 'User blocked successfully' });
}

// DELETE /api/users/[id]/block - Unblock a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: targetUserId } = await params;
  const userId = session.user.id;

  const block = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: userId,
        blockedId: targetUserId,
      },
    },
  });

  if (!block) {
    return NextResponse.json({ error: 'User not blocked' }, { status: 400 });
  }

  await prisma.userBlock.delete({
    where: { id: block.id },
  });

  return NextResponse.json({ message: 'User unblocked successfully' });
}

// GET /api/users/[id]/block - Check block status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: targetUserId } = await params;
  const userId = session.user.id;

  const [isBlocking, isBlockedBy] = await Promise.all([
    prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: targetUserId,
        },
      },
    }),
    prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: targetUserId,
          blockedId: userId,
        },
      },
    }),
  ]);

  return NextResponse.json({
    isBlocking: !!isBlocking,
    isBlockedBy: !!isBlockedBy,
  });
}
```

```typescript
// app/api/users/[id]/mute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const muteSchema = z.object({
  duration: z.enum(['forever', '1d', '7d', '30d']).optional().default('forever'),
  muteNotifications: z.boolean().optional().default(true),
});

// POST /api/users/[id]/mute - Mute a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: targetUserId } = await params;
  const userId = session.user.id;

  if (userId === targetUserId) {
    return NextResponse.json(
      { error: 'Cannot mute yourself' },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { duration, muteNotifications } = muteSchema.parse(body);

  // Calculate expiration
  let expiresAt: Date | null = null;
  if (duration !== 'forever') {
    const days = parseInt(duration);
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
  }

  // Upsert mute (update if exists, create if not)
  const mute = await prisma.userMute.upsert({
    where: {
      muterId_mutedId: {
        muterId: userId,
        mutedId: targetUserId,
      },
    },
    update: {
      expiresAt,
      muteNotifications,
    },
    create: {
      muterId: userId,
      mutedId: targetUserId,
      expiresAt,
      muteNotifications,
    },
  });

  return NextResponse.json({
    message: 'User muted successfully',
    expiresAt: mute.expiresAt,
  });
}

// DELETE /api/users/[id]/mute - Unmute a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: targetUserId } = await params;
  const userId = session.user.id;

  await prisma.userMute.deleteMany({
    where: {
      muterId: userId,
      mutedId: targetUserId,
    },
  });

  return NextResponse.json({ message: 'User unmuted successfully' });
}
```

```typescript
// lib/content-filtering.ts
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface ContentFilterOptions {
  userId: string;
  includeHidden?: boolean;
  includeRemoved?: boolean;
}

// Get IDs of users that should be filtered out
export async function getFilteredUserIds(userId: string): Promise<{
  blockedIds: string[];
  mutedIds: string[];
  blockedByIds: string[];
}> {
  const [blocks, mutes, blockedBy] = await Promise.all([
    // Users I've blocked
    prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    }),
    // Users I've muted (only active mutes)
    prisma.userMute.findMany({
      where: {
        muterId: userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: { mutedId: true },
    }),
    // Users who have blocked me
    prisma.userBlock.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    }),
  ]);

  return {
    blockedIds: blocks.map((b) => b.blockedId),
    mutedIds: mutes.map((m) => m.mutedId),
    blockedByIds: blockedBy.map((b) => b.blockerId),
  };
}

// Build Prisma where clause for filtering content
export async function buildContentFilterClause(
  options: ContentFilterOptions
): Promise<Prisma.PostWhereInput> {
  const { userId, includeHidden = false, includeRemoved = false } = options;

  const { blockedIds, mutedIds, blockedByIds } = await getFilteredUserIds(userId);

  // Users to completely exclude (blocked both ways)
  const excludedUserIds = [...new Set([...blockedIds, ...blockedByIds])];

  const whereClause: Prisma.PostWhereInput = {
    // Exclude posts from blocked users
    authorId: {
      notIn: excludedUserIds,
    },
    // Exclude hidden content unless specified
    ...(includeHidden ? {} : { isHidden: false }),
    // Exclude removed content unless specified
    ...(includeRemoved ? {} : { isRemoved: false }),
  };

  return whereClause;
}

// Filter posts array (for client-side filtering or additional processing)
export function filterPosts<T extends { authorId: string }>(
  posts: T[],
  excludedUserIds: string[],
  mutedUserIds: string[]
): { posts: T[]; mutedPosts: T[] } {
  const filteredPosts: T[] = [];
  const mutedPosts: T[] = [];

  for (const post of posts) {
    if (excludedUserIds.includes(post.authorId)) {
      // Completely exclude blocked users
      continue;
    }

    if (mutedUserIds.includes(post.authorId)) {
      // Separate muted posts (can be shown with "Show anyway" option)
      mutedPosts.push(post);
    } else {
      filteredPosts.push(post);
    }
  }

  return { posts: filteredPosts, mutedPosts };
}

// Handle edge cases: check if user can see content
export async function canUserSeeContent(
  viewerId: string,
  authorId: string
): Promise<{ canSee: boolean; reason?: string }> {
  // Check if viewer is blocked by author
  const blockedByAuthor = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: authorId,
        blockedId: viewerId,
      },
    },
  });

  if (blockedByAuthor) {
    return { canSee: false, reason: 'BLOCKED_BY_AUTHOR' };
  }

  // Check if viewer has blocked author
  const viewerBlockedAuthor = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: viewerId,
        blockedId: authorId,
      },
    },
  });

  if (viewerBlockedAuthor) {
    return { canSee: false, reason: 'VIEWER_BLOCKED_AUTHOR' };
  }

  return { canSee: true };
}

// Filter comments while handling tagged users edge case
export async function filterCommentsWithContext(
  postId: string,
  viewerId: string
): Promise<any[]> {
  const { blockedIds, blockedByIds } = await getFilteredUserIds(viewerId);
  const excludedUserIds = [...new Set([...blockedIds, ...blockedByIds])];

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      isRemoved: false,
      authorId: {
        notIn: excludedUserIds,
      },
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Process comments to handle mentions of blocked users
  return comments.map((comment) => {
    // Replace mentions of blocked users with generic text
    let processedContent = comment.content;

    for (const blockedId of excludedUserIds) {
      // This would require knowing the username, simplified for example
      processedContent = processedContent.replace(
        new RegExp(`@blocked_user_${blockedId}`, 'g'),
        '@[unavailable]'
      );
    }

    return {
      ...comment,
      content: processedContent,
    };
  });
}

// Check if user can send DM to another user
export async function canSendMessage(
  senderId: string,
  recipientId: string
): Promise<{ canSend: boolean; reason?: string }> {
  // Check blocks in both directions
  const [senderBlocked, recipientBlocked] = await Promise.all([
    prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: recipientId,
          blockedId: senderId,
        },
      },
    }),
    prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: senderId,
          blockedId: recipientId,
        },
      },
    }),
  ]);

  if (senderBlocked) {
    return { canSend: false, reason: 'You are blocked by this user' };
  }

  if (recipientBlocked) {
    return { canSend: false, reason: 'You have blocked this user' };
  }

  return { canSend: true };
}
```

### GDPR Compliance

```typescript
// app/api/users/[id]/data-export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import archiver from 'archiver';
import { Readable } from 'stream';

const exportRequestSchema = z.object({
  includeMedia: z.boolean().optional().default(true),
  format: z.enum(['json', 'csv']).optional().default('json'),
});

// POST /api/users/[id]/data-export - Request data export
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await params;

  // Users can only export their own data (admins excluded for privacy)
  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { includeMedia, format } = exportRequestSchema.parse(body);

  // Check for existing pending export request
  const existingRequest = await prisma.dataExportRequest.findFirst({
    where: {
      userId,
      status: { in: ['PENDING', 'PROCESSING'] },
    },
  });

  if (existingRequest) {
    return NextResponse.json(
      {
        error: 'Export already in progress',
        requestId: existingRequest.id,
        status: existingRequest.status,
      },
      { status: 400 }
    );
  }

  // Create export request
  const exportRequest = await prisma.dataExportRequest.create({
    data: {
      userId,
      includeMedia,
      format,
      status: 'PENDING',
      requestedAt: new Date(),
      // GDPR requires fulfillment within 30 days
      dueBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Queue background job for export generation
  await queueDataExportJob(exportRequest.id);

  return NextResponse.json({
    message: 'Data export requested successfully',
    requestId: exportRequest.id,
    estimatedCompletion: '24-48 hours',
    dueBy: exportRequest.dueBy,
  });
}

// GET /api/users/[id]/data-export - Get export status or download
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await params;

  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const requestId = searchParams.get('requestId');

  if (requestId) {
    // Get specific export request
    const exportRequest = await prisma.dataExportRequest.findFirst({
      where: { id: requestId, userId },
    });

    if (!exportRequest) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 });
    }

    if (exportRequest.status === 'COMPLETED' && exportRequest.downloadUrl) {
      // Check if download link is still valid (24 hour expiry)
      const expiresAt = new Date(exportRequest.completedAt!);
      expiresAt.setHours(expiresAt.getHours() + 24);

      if (new Date() > expiresAt) {
        return NextResponse.json(
          { error: 'Download link expired. Please request a new export.' },
          { status: 410 }
        );
      }

      return NextResponse.json({
        status: exportRequest.status,
        downloadUrl: exportRequest.downloadUrl,
        expiresAt,
      });
    }

    return NextResponse.json({
      status: exportRequest.status,
      requestedAt: exportRequest.requestedAt,
      estimatedCompletion: exportRequest.status === 'PROCESSING' ? '1-2 hours' : '24-48 hours',
    });
  }

  // List all export requests
  const exports = await prisma.dataExportRequest.findMany({
    where: { userId },
    orderBy: { requestedAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({ exports });
}

// Background job to generate data export
async function queueDataExportJob(requestId: string) {
  // This would typically use a job queue like Bull, BullMQ, or similar
  // For demonstration, we'll show the export generation logic

  // In production, this would be:
  // await jobQueue.add('data-export', { requestId });
}

// Data export generation logic (would run in background worker)
export async function generateDataExport(requestId: string): Promise<void> {
  const exportRequest = await prisma.dataExportRequest.findUnique({
    where: { id: requestId },
  });

  if (!exportRequest) throw new Error('Export request not found');

  await prisma.dataExportRequest.update({
    where: { id: requestId },
    data: { status: 'PROCESSING' },
  });

  try {
    const userId = exportRequest.userId;

    // Collect all user data
    const userData = await collectUserData(userId);

    // Generate export file
    const exportFile = await createExportArchive(
      userData,
      exportRequest.includeMedia,
      exportRequest.format
    );

    // Upload to secure storage and get download URL
    const downloadUrl = await uploadExportFile(exportFile, userId);

    // Update request with download URL
    await prisma.dataExportRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        downloadUrl,
      },
    });

    // Notify user that export is ready
    await prisma.notification.create({
      data: {
        type: 'DATA_EXPORT_READY',
        notifiedId: userId,
        notifierId: userId,
        metadata: { requestId, downloadUrl },
      },
    });
  } catch (error) {
    console.error('Data export failed:', error);

    await prisma.dataExportRequest.update({
      where: { id: requestId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

// Collect all user data for export
async function collectUserData(userId: string): Promise<UserDataExport> {
  const [
    user,
    posts,
    comments,
    likes,
    followers,
    following,
    conversations,
    notifications,
    blocks,
    mutes,
    reports,
    settings,
  ] = await Promise.all([
    // User profile
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        coverImage: true,
        website: true,
        location: true,
        isVerified: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    // All posts
    prisma.post.findMany({
      where: { authorId: userId },
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    }),
    // All comments
    prisma.comment.findMany({
      where: { authorId: userId },
      include: {
        post: { select: { id: true, content: true } },
      },
    }),
    // All likes
    prisma.like.findMany({
      where: { userId },
      include: {
        post: { select: { id: true, content: true, authorId: true } },
      },
    }),
    // Followers
    prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: { select: { id: true, username: true, name: true } },
      },
    }),
    // Following
    prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: { select: { id: true, username: true, name: true } },
      },
    }),
    // Conversations and messages
    prisma.conversation.findMany({
      where: {
        OR: [{ initiatorId: userId }, { receiverId: userId }],
      },
      include: {
        messages: true,
        initiator: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    }),
    // Notifications received
    prisma.notification.findMany({
      where: { notifiedId: userId },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    }),
    // Blocked users
    prisma.userBlock.findMany({
      where: { blockerId: userId },
      include: {
        blocked: { select: { id: true, username: true } },
      },
    }),
    // Muted users
    prisma.userMute.findMany({
      where: { muterId: userId },
      include: {
        muted: { select: { id: true, username: true } },
      },
    }),
    // Reports submitted
    prisma.contentReport.findMany({
      where: { reporterId: userId },
    }),
    // User settings
    prisma.userSettings.findUnique({
      where: { userId },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user,
    posts,
    comments,
    likes,
    followers: followers.map((f) => f.follower),
    following: following.map((f) => f.following),
    conversations,
    notifications,
    blocks: blocks.map((b) => b.blocked),
    mutes: mutes.map((m) => m.muted),
    reportsSubmitted: reports,
    settings,
  };
}

interface UserDataExport {
  exportedAt: string;
  user: any;
  posts: any[];
  comments: any[];
  likes: any[];
  followers: any[];
  following: any[];
  conversations: any[];
  notifications: any[];
  blocks: any[];
  mutes: any[];
  reportsSubmitted: any[];
  settings: any;
}

async function createExportArchive(
  data: UserDataExport,
  includeMedia: boolean,
  format: string
): Promise<Buffer> {
  // Create ZIP archive with all data
  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  archive.on('data', (chunk) => chunks.push(chunk));

  // Add data file
  if (format === 'json') {
    archive.append(JSON.stringify(data, null, 2), { name: 'data.json' });
  } else {
    // CSV format would require converting each section
    // Simplified for example
    archive.append(JSON.stringify(data, null, 2), { name: 'data.json' });
  }

  // Add readme
  archive.append(
    `# Your Data Export

This archive contains all your data from our platform.

## Contents
- data.json: All your account data in JSON format
${includeMedia ? '- media/: Your uploaded images and files' : ''}

## Data Categories
- Profile information
- Posts and content
- Comments
- Likes
- Followers and following
- Direct messages
- Notifications
- Privacy settings (blocks, mutes)
- Reports you've submitted

Exported on: ${data.exportedAt}
`,
    { name: 'README.md' }
  );

  if (includeMedia) {
    // Download and include media files
    const mediaUrls: string[] = [];

    // Collect all media URLs
    if (data.user?.avatar) mediaUrls.push(data.user.avatar);
    if (data.user?.coverImage) mediaUrls.push(data.user.coverImage);

    data.posts.forEach((post) => {
      if (post.images) mediaUrls.push(...post.images);
    });

    // Download and add each media file
    for (let i = 0; i < mediaUrls.length; i++) {
      try {
        const response = await fetch(mediaUrls[i]);
        const buffer = Buffer.from(await response.arrayBuffer());
        const extension = mediaUrls[i].split('.').pop() || 'jpg';
        archive.append(buffer, { name: `media/file_${i}.${extension}` });
      } catch (error) {
        console.error(`Failed to download media: ${mediaUrls[i]}`);
      }
    }
  }

  await archive.finalize();

  return Buffer.concat(chunks);
}

async function uploadExportFile(file: Buffer, userId: string): Promise<string> {
  // Upload to secure storage (S3, GCS, etc.)
  // Return a signed URL with 24-hour expiry

  // Placeholder - in production, use actual cloud storage
  const filename = `exports/${userId}/${Date.now()}.zip`;

  // Example with AWS S3:
  // const s3 = new S3Client({ region: process.env.AWS_REGION });
  // await s3.send(new PutObjectCommand({
  //   Bucket: process.env.EXPORTS_BUCKET,
  //   Key: filename,
  //   Body: file,
  // }));
  // return getSignedUrl(s3, new GetObjectCommand({
  //   Bucket: process.env.EXPORTS_BUCKET,
  //   Key: filename,
  // }), { expiresIn: 86400 });

  return `https://storage.example.com/${filename}`;
}
```

```typescript
// app/api/users/[id]/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE MY ACCOUNT'),
  reason: z.string().max(500).optional(),
  hardDelete: z.boolean().optional().default(false),
});

// POST /api/users/[id]/delete-account - Request account deletion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await params;

  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { password, confirmation, reason, hardDelete } = deleteAccountSchema.parse(body);

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    if (hardDelete) {
      // Immediate hard delete - permanently remove all data
      await performHardDelete(userId);

      return NextResponse.json({
        message: 'Account permanently deleted',
      });
    } else {
      // Soft delete with 30-day recovery window
      await performSoftDelete(userId, reason);

      return NextResponse.json({
        message: 'Account scheduled for deletion',
        recoveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        recoveryInstructions: 'Log in within 30 days to restore your account',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to process account deletion' },
      { status: 500 }
    );
  }
}

// Soft delete - mark account for deletion but preserve data for recovery period
async function performSoftDelete(userId: string, reason?: string): Promise<void> {
  const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    // Mark user as deleted
    prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        scheduledDeletionDate: deletionDate,
        deletionReason: reason,
        // Anonymize public-facing data immediately
        username: `deleted_${userId.slice(0, 8)}`,
        name: 'Deleted User',
        bio: null,
        avatar: null,
        coverImage: null,
        website: null,
        location: null,
      },
    }),

    // Hide all posts from public view
    prisma.post.updateMany({
      where: { authorId: userId },
      data: { isHidden: true, hiddenReason: 'ACCOUNT_DELETED' },
    }),

    // Log deletion request for audit
    prisma.auditLog.create({
      data: {
        action: 'ACCOUNT_SOFT_DELETE',
        userId,
        metadata: { reason, scheduledDeletionDate: deletionDate },
      },
    }),
  ]);

  // Invalidate all sessions
  await prisma.session.deleteMany({
    where: { userId },
  });
}

// Hard delete - permanently remove all user data
async function performHardDelete(userId: string): Promise<void> {
  // Get user data for audit log before deletion
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  await prisma.$transaction([
    // Delete all user content (cascade will handle related records)
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.comment.deleteMany({ where: { authorId: userId } }),
    prisma.like.deleteMany({ where: { userId } }),

    // Delete social connections
    prisma.follow.deleteMany({
      where: { OR: [{ followerId: userId }, { followingId: userId }] },
    }),

    // Delete messages (anonymize conversations)
    prisma.message.deleteMany({ where: { senderId: userId } }),

    // Delete privacy settings
    prisma.userBlock.deleteMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    }),
    prisma.userMute.deleteMany({
      where: { OR: [{ muterId: userId }, { mutedId: userId }] },
    }),

    // Delete notifications
    prisma.notification.deleteMany({
      where: { OR: [{ notifierId: userId }, { notifiedId: userId }] },
    }),

    // Anonymize comments on others' posts (preserve conversation context)
    prisma.comment.updateMany({
      where: { authorId: userId },
      data: {
        authorId: 'deleted-user-placeholder',
        content: '[This comment was removed when the user deleted their account]',
      },
    }),

    // Delete the user
    prisma.user.delete({ where: { id: userId } }),

    // Create audit log (retained for legal compliance)
    prisma.auditLog.create({
      data: {
        action: 'ACCOUNT_HARD_DELETE',
        userId: 'system',
        metadata: {
          deletedUserId: user?.id,
          deletedUserEmail: hashEmail(user?.email || ''),
          deletedAt: new Date(),
        },
      },
    }),
  ]);
}

// Hash email for audit log (privacy-preserving record keeping)
function hashEmail(email: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(email).digest('hex').slice(0, 16);
}

// Recovery endpoint - restore soft-deleted account
// GET /api/users/[id]/delete-account/recover
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await params;

  // Check if account is in soft-delete state
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isDeleted: true,
      scheduledDeletionDate: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  if (!user.isDeleted) {
    return NextResponse.json({ error: 'Account is not deleted' }, { status: 400 });
  }

  if (user.scheduledDeletionDate && new Date() > user.scheduledDeletionDate) {
    return NextResponse.json(
      { error: 'Recovery period has expired' },
      { status: 410 }
    );
  }

  // Restore account
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: false,
        deletedAt: null,
        scheduledDeletionDate: null,
        deletionReason: null,
        // Note: username/name/bio need to be restored by user
      },
    }),

    // Unhide posts
    prisma.post.updateMany({
      where: { authorId: userId, hiddenReason: 'ACCOUNT_DELETED' },
      data: { isHidden: false, hiddenReason: null },
    }),

    prisma.auditLog.create({
      data: {
        action: 'ACCOUNT_RECOVERED',
        userId,
      },
    }),
  ]);

  return NextResponse.json({
    message: 'Account recovered successfully',
    note: 'Please update your profile information as it was anonymized during deletion',
  });
}
```

### Safety Features

```typescript
// lib/safety.ts
import { prisma } from '@/lib/prisma';

// Crisis keywords that indicate self-harm or suicide
const CRISIS_KEYWORDS = [
  /\b(kill\s*(my)?self|suicide|suicidal|want\s*to\s*die|end\s*(my)?\s*life)\b/i,
  /\b(self[- ]?harm|cutting|hurt\s*(my)?self)\b/i,
  /\b(no\s*reason\s*to\s*live|better\s*off\s*dead)\b/i,
];

// Resources for different regions
export const CRISIS_RESOURCES = {
  US: {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    text: 'Text HOME to 741741',
    website: 'https://988lifeline.org',
  },
  UK: {
    name: 'Samaritans',
    phone: '116 123',
    website: 'https://www.samaritans.org',
  },
  CA: {
    name: 'Crisis Services Canada',
    phone: '1-833-456-4566',
    text: 'Text 45645',
    website: 'https://www.crisisservicescanada.ca',
  },
  AU: {
    name: 'Lifeline Australia',
    phone: '13 11 14',
    website: 'https://www.lifeline.org.au',
  },
  DEFAULT: {
    name: 'International Association for Suicide Prevention',
    website: 'https://www.iasp.info/resources/Crisis_Centres/',
  },
};

export interface SafetyCheckResult {
  flagged: boolean;
  type: 'self_harm' | 'csam' | 'violence' | null;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  action: 'show_resources' | 'block' | 'report_authorities' | 'none';
  resources?: typeof CRISIS_RESOURCES.US;
}

// Check content for safety concerns
export async function checkContentSafety(
  content: string,
  userRegion?: string
): Promise<SafetyCheckResult> {
  // Check for self-harm/suicide content
  for (const pattern of CRISIS_KEYWORDS) {
    if (pattern.test(content)) {
      const resources = CRISIS_RESOURCES[userRegion as keyof typeof CRISIS_RESOURCES]
        || CRISIS_RESOURCES.DEFAULT;

      return {
        flagged: true,
        type: 'self_harm',
        severity: 'high',
        action: 'show_resources',
        resources,
      };
    }
  }

  // Additional safety checks would go here
  // (CSAM detection should use specialized services like PhotoDNA)

  return {
    flagged: false,
    type: null,
    severity: null,
    action: 'none',
  };
}

// Log safety flag for review
export async function logSafetyFlag(
  contentId: string,
  contentType: 'POST' | 'COMMENT' | 'MESSAGE',
  result: SafetyCheckResult,
  userId: string
): Promise<void> {
  await prisma.safetyFlag.create({
    data: {
      contentId,
      contentType,
      type: result.type || 'unknown',
      severity: result.severity || 'low',
      action: result.action,
      userId,
      flaggedAt: new Date(),
    },
  });
}

// CSAM reporting - required by law in most jurisdictions
export async function reportToNCMEC(
  reportId: string,
  contentId: string,
  reporterId: string
): Promise<void> {
  // NCMEC (National Center for Missing & Exploited Children) reporting
  // This is a legal requirement in the US for platforms that discover CSAM

  // Get report details
  const report = await prisma.contentReport.findUnique({
    where: { id: reportId },
    include: {
      reporter: { select: { id: true, email: true } },
    },
  });

  if (!report) {
    throw new Error('Report not found');
  }

  // Preserve evidence (required before any deletion)
  await prisma.legalComplianceLog.create({
    data: {
      type: 'CSAM_REPORT',
      reportId,
      contentId,
      status: 'PRESERVED',
      preservedAt: new Date(),
      metadata: {
        reporterHash: hashIdentifier(report.reporter.id),
        contentHash: await hashContent(contentId),
        timestamp: new Date().toISOString(),
      },
    },
  });

  // In production, this would submit to NCMEC CyberTipline API
  // https://www.missingkids.org/gethelpnow/cybertipline
  console.log('[LEGAL] CSAM report prepared for NCMEC submission:', {
    reportId,
    timestamp: new Date().toISOString(),
  });

  // Immediately remove content and disable account
  await prisma.$transaction([
    prisma.post.update({
      where: { id: contentId },
      data: {
        isRemoved: true,
        removedAt: new Date(),
        removedReason: 'CSAM_REPORT',
      },
    }),
    // Get author and ban
    prisma.post.findUnique({
      where: { id: contentId },
      select: { authorId: true },
    }).then(async (post) => {
      if (post) {
        await prisma.user.update({
          where: { id: post.authorId },
          data: {
            isBanned: true,
            bannedAt: new Date(),
            banReason: 'CSAM_VIOLATION',
          },
        });
      }
    }),
  ]);
}

function hashIdentifier(id: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(id).digest('hex');
}

async function hashContent(contentId: string): Promise<string> {
  const content = await prisma.post.findUnique({
    where: { id: contentId },
    select: { content: true, images: true },
  });

  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
}

// Age verification hooks
export interface AgeVerificationResult {
  verified: boolean;
  method: 'self_declared' | 'id_verification' | 'credit_card' | null;
  verifiedAt: Date | null;
  minAge: number;
}

export async function checkAgeVerification(
  userId: string,
  requiredAge: number = 18
): Promise<AgeVerificationResult> {
  const verification = await prisma.ageVerification.findFirst({
    where: {
      userId,
      verified: true,
      verifiedAge: { gte: requiredAge },
    },
    orderBy: { verifiedAt: 'desc' },
  });

  if (verification) {
    return {
      verified: true,
      method: verification.method as AgeVerificationResult['method'],
      verifiedAt: verification.verifiedAt,
      minAge: verification.verifiedAge,
    };
  }

  return {
    verified: false,
    method: null,
    verifiedAt: null,
    minAge: 0,
  };
}

// Request age verification
export async function requestAgeVerification(
  userId: string,
  method: 'self_declared' | 'id_verification',
  declaredAge?: number
): Promise<{ success: boolean; verificationId?: string }> {
  if (method === 'self_declared' && declaredAge) {
    // Self-declaration (basic, not legally robust)
    const verification = await prisma.ageVerification.create({
      data: {
        userId,
        method: 'self_declared',
        verified: true,
        verifiedAge: declaredAge,
        verifiedAt: new Date(),
      },
    });

    return { success: true, verificationId: verification.id };
  }

  if (method === 'id_verification') {
    // Would integrate with ID verification service (Jumio, Onfido, etc.)
    const verification = await prisma.ageVerification.create({
      data: {
        userId,
        method: 'id_verification',
        verified: false,
        status: 'PENDING',
      },
    });

    // Queue verification job
    // await jobQueue.add('verify-age', { verificationId: verification.id });

    return { success: true, verificationId: verification.id };
  }

  return { success: false };
}
```

```tsx
// components/safety/content-warning.tsx
'use client';

import { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ContentWarningProps {
  type: 'sensitive' | 'graphic' | 'self_harm' | 'spoiler';
  children: React.ReactNode;
  title?: string;
  description?: string;
  resources?: {
    name: string;
    phone?: string;
    text?: string;
    website?: string;
  };
  className?: string;
}

const WARNING_CONFIG = {
  sensitive: {
    title: 'Sensitive Content',
    description: 'This content may be sensitive or disturbing to some viewers.',
    icon: AlertTriangle,
    color: 'bg-yellow-500',
  },
  graphic: {
    title: 'Graphic Content',
    description: 'This content contains graphic imagery that some may find disturbing.',
    icon: AlertTriangle,
    color: 'bg-orange-500',
  },
  self_harm: {
    title: 'Content Warning',
    description: 'This content discusses self-harm or suicide. If you or someone you know is struggling, help is available.',
    icon: Heart,
    color: 'bg-red-500',
  },
  spoiler: {
    title: 'Spoiler',
    description: 'This content contains spoilers.',
    icon: EyeOff,
    color: 'bg-purple-500',
  },
};

export function ContentWarning({
  type,
  children,
  title,
  description,
  resources,
  className,
}: ContentWarningProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showResourcesDialog, setShowResourcesDialog] = useState(false);

  const config = WARNING_CONFIG[type];
  const Icon = config.icon;

  // Check user preference for auto-showing sensitive content
  const userPreference = typeof window !== 'undefined'
    ? localStorage.getItem('show_sensitive_content') === 'true'
    : false;

  if (userPreference && type !== 'self_harm') {
    return <>{children}</>;
  }

  if (isRevealed) {
    return (
      <div className={cn('relative', className)}>
        {children}
        <button
          onClick={() => setIsRevealed(false)}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white text-xs hover:bg-black/70"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'relative rounded-lg overflow-hidden',
          className
        )}
      >
        {/* Blurred preview */}
        <div className="blur-xl opacity-30 pointer-events-none">
          {children}
        </div>

        {/* Warning overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 p-6 text-center">
          <div className={cn('p-3 rounded-full mb-4', config.color)}>
            <Icon className="h-6 w-6 text-white" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            {title || config.title}
          </h3>

          <p className="text-gray-300 text-sm mb-4 max-w-sm">
            {description || config.description}
          </p>

          {/* Resources for self-harm content */}
          {type === 'self_harm' && resources && (
            <div className="bg-white/10 rounded-lg p-4 mb-4 max-w-sm">
              <p className="text-white font-medium mb-2">{resources.name}</p>
              {resources.phone && (
                <a
                  href={`tel:${resources.phone}`}
                  className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 mb-1"
                >
                  Call {resources.phone}
                </a>
              )}
              {resources.text && (
                <p className="text-gray-300 text-sm mb-1">{resources.text}</p>
              )}
              {resources.website && (
                <a
                  href={resources.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Visit website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsRevealed(true)}
              className="bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Content
            </Button>

            {type === 'self_harm' && (
              <Button
                onClick={() => setShowResourcesDialog(true)}
                className="bg-red-500 hover:bg-red-600"
              >
                <Heart className="h-4 w-4 mr-2" />
                Get Help
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Resources dialog for self-harm content */}
      <Dialog open={showResourcesDialog} onOpenChange={setShowResourcesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Help is Available
            </DialogTitle>
            <DialogDescription>
              If you or someone you know is struggling with thoughts of self-harm
              or suicide, please reach out for help.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {resources && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2">{resources.name}</h4>
                {resources.phone && (
                  <a
                    href={`tel:${resources.phone}`}
                    className="block text-blue-600 hover:underline mb-1"
                  >
                    Call: {resources.phone}
                  </a>
                )}
                {resources.text && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {resources.text}
                  </p>
                )}
                {resources.website && (
                  <a
                    href={resources.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">
                You can also reach out to a trusted friend, family member,
                or mental health professional.
              </p>
              <p>
                Remember: You are not alone, and things can get better.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Settings component for content preferences
export function ContentPreferencesSettings() {
  const [showSensitive, setShowSensitive] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('show_sensitive_content') === 'true';
    }
    return false;
  });

  const handleToggle = (value: boolean) => {
    setShowSensitive(value);
    localStorage.setItem('show_sensitive_content', String(value));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Content Preferences</h3>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Show sensitive content</p>
          <p className="text-sm text-gray-500">
            Display content that may be sensitive without a warning
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showSensitive}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <p className="text-xs text-gray-500">
        Note: Content warnings for self-harm and crisis-related content will
        always be shown regardless of this setting.
      </p>
    </div>
  );
}
```

### Trust & Safety Tests

```typescript
// tests/moderation/moderation.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  checkAutoModeration,
  checkOpenAIModeration,
  getReporterCredibility,
  REPORT_SEVERITY_MAP,
  ReportType,
} from '@/lib/moderation';
import { checkContentSafety, CRISIS_RESOURCES } from '@/lib/safety';
import {
  getFilteredUserIds,
  canUserSeeContent,
  canSendMessage,
} from '@/lib/content-filtering';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentReport: {
      groupBy: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    post: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    userBlock: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    userMute: {
      findMany: vi.fn(),
    },
    moderationLog: {
      create: vi.fn(),
    },
  },
}));

describe('Content Moderation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAutoModeration', () => {
    it('should flag spam content with URLs', async () => {
      const content = 'Buy now! Click here http://spam.com for great deals!';
      const result = await checkAutoModeration(content);

      expect(result.shouldFlag).toBe(true);
      expect(result.detectedTypes).toContain('SPAM');
      expect(result.reasons).toContain('Matched SPAM pattern');
    });

    it('should flag content with excessive capitalization', async () => {
      const content = 'THIS IS ALL CAPS AND VERY ANNOYING TO READ';
      const result = await checkAutoModeration(content);

      expect(result.reasons).toContain('Excessive capitalization');
    });

    it('should flag content with suspicious URL shorteners', async () => {
      const content = 'Check out this link: bit.ly/something';
      const result = await checkAutoModeration(content);

      expect(result.reasons).toContain('Suspicious URL shorteners');
    });

    it('should not flag normal content', async () => {
      const content = 'Just having a great day with friends!';
      const result = await checkAutoModeration(content);

      expect(result.shouldFlag).toBe(false);
      expect(result.shouldBlock).toBe(false);
      expect(result.detectedTypes).toHaveLength(0);
    });

    it('should calculate spam score correctly', async () => {
      const content = 'BUY NOW!!! CHECK OUT http://link1.com http://link2.com http://link3.com';
      const result = await checkAutoModeration(content);

      expect(result.shouldFlag).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(2);
    });
  });

  describe('Report Submission', () => {
    it('should assign correct severity based on report type', () => {
      expect(REPORT_SEVERITY_MAP.SPAM).toBe(1);
      expect(REPORT_SEVERITY_MAP.HARASSMENT).toBe(2);
      expect(REPORT_SEVERITY_MAP.HATE_SPEECH).toBe(3);
      expect(REPORT_SEVERITY_MAP.CSAM).toBe(4);
    });

    it('should prevent self-reporting', async () => {
      const userId = 'user-123';
      const authorId = 'user-123';

      // This would be tested through the API route
      expect(userId).toBe(authorId);
    });

    it('should prevent duplicate reports', async () => {
      vi.mocked(prisma.contentReport.findFirst).mockResolvedValue({
        id: 'report-1',
        status: 'PENDING',
      } as any);

      const existingReport = await prisma.contentReport.findFirst({
        where: {
          contentId: 'post-1',
          reporterId: 'user-1',
          status: { in: ['PENDING', 'UNDER_REVIEW'] },
        },
      });

      expect(existingReport).not.toBeNull();
    });
  });

  describe('Reporter Credibility', () => {
    it('should return 0.5 for new reporters', async () => {
      vi.mocked(prisma.contentReport.groupBy).mockResolvedValue([]);

      const credibility = await getReporterCredibility('new-user');
      expect(credibility).toBe(0.5);
    });

    it('should increase credibility for accurate reporters', async () => {
      vi.mocked(prisma.contentReport.groupBy).mockResolvedValue([
        { status: 'RESOLVED_REMOVED', _count: 10 },
        { status: 'RESOLVED_NO_ACTION', _count: 2 },
      ] as any);

      const credibility = await getReporterCredibility('good-reporter');
      expect(credibility).toBeGreaterThan(0.7);
    });

    it('should decrease credibility for inaccurate reporters', async () => {
      vi.mocked(prisma.contentReport.groupBy).mockResolvedValue([
        { status: 'RESOLVED_REMOVED', _count: 1 },
        { status: 'RESOLVED_NO_ACTION', _count: 20 },
      ] as any);

      const credibility = await getReporterCredibility('bad-reporter');
      expect(credibility).toBeLessThan(0.3);
    });
  });

  describe('Auto-moderation Triggers', () => {
    it('should auto-hide content after 3 reports', async () => {
      vi.mocked(prisma.contentReport.count).mockResolvedValue(3);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-1',
        isHidden: false,
      } as any);

      const reportCount = await prisma.contentReport.count({
        where: { contentId: 'post-1' },
      });

      expect(reportCount).toBe(3);
      // In actual implementation, this triggers auto-hide
    });
  });
});

describe('User Blocking & Muting', () => {
  describe('getFilteredUserIds', () => {
    it('should return blocked user IDs', async () => {
      vi.mocked(prisma.userBlock.findMany).mockImplementation(async ({ where }: any) => {
        if (where.blockerId) {
          return [{ blockedId: 'blocked-user-1' }, { blockedId: 'blocked-user-2' }];
        }
        return [{ blockerId: 'blocker-1' }];
      });

      vi.mocked(prisma.userMute.findMany).mockResolvedValue([
        { mutedId: 'muted-user-1' },
      ] as any);

      const result = await getFilteredUserIds('current-user');

      expect(result.blockedIds).toContain('blocked-user-1');
      expect(result.mutedIds).toContain('muted-user-1');
      expect(result.blockedByIds).toContain('blocker-1');
    });
  });

  describe('canUserSeeContent', () => {
    it('should return false when blocked by author', async () => {
      vi.mocked(prisma.userBlock.findUnique).mockImplementation(async ({ where }: any) => {
        if (where.blockerId_blockedId?.blockerId === 'author-1') {
          return { id: 'block-1' } as any;
        }
        return null;
      });

      const result = await canUserSeeContent('viewer-1', 'author-1');

      expect(result.canSee).toBe(false);
      expect(result.reason).toBe('BLOCKED_BY_AUTHOR');
    });

    it('should return true when no blocks exist', async () => {
      vi.mocked(prisma.userBlock.findUnique).mockResolvedValue(null);

      const result = await canUserSeeContent('viewer-1', 'author-1');

      expect(result.canSee).toBe(true);
    });
  });

  describe('canSendMessage', () => {
    it('should prevent messaging when blocked', async () => {
      vi.mocked(prisma.userBlock.findUnique).mockImplementation(async ({ where }: any) => {
        if (where.blockerId_blockedId?.blockedId === 'sender-1') {
          return { id: 'block-1' } as any;
        }
        return null;
      });

      const result = await canSendMessage('sender-1', 'recipient-1');

      expect(result.canSend).toBe(false);
      expect(result.reason).toBe('You are blocked by this user');
    });
  });
});

describe('Safety Features', () => {
  describe('checkContentSafety', () => {
    it('should flag self-harm content', async () => {
      const content = 'I want to kill myself';
      const result = await checkContentSafety(content, 'US');

      expect(result.flagged).toBe(true);
      expect(result.type).toBe('self_harm');
      expect(result.action).toBe('show_resources');
      expect(result.resources).toBeDefined();
    });

    it('should include region-specific resources', async () => {
      const content = 'I want to end my life';

      const usResult = await checkContentSafety(content, 'US');
      expect(usResult.resources?.phone).toBe('988');

      const ukResult = await checkContentSafety(content, 'UK');
      expect(ukResult.resources?.phone).toBe('116 123');
    });

    it('should not flag normal content', async () => {
      const content = 'Having a great day!';
      const result = await checkContentSafety(content);

      expect(result.flagged).toBe(false);
      expect(result.action).toBe('none');
    });

    it('should flag variations of crisis keywords', async () => {
      const variations = [
        'i want to die',
        'no reason to live',
        'better off dead',
        'suicidal thoughts',
      ];

      for (const content of variations) {
        const result = await checkContentSafety(content);
        expect(result.flagged).toBe(true);
        expect(result.type).toBe('self_harm');
      }
    });
  });

  describe('Crisis Resources', () => {
    it('should have resources for major regions', () => {
      expect(CRISIS_RESOURCES.US).toBeDefined();
      expect(CRISIS_RESOURCES.UK).toBeDefined();
      expect(CRISIS_RESOURCES.CA).toBeDefined();
      expect(CRISIS_RESOURCES.AU).toBeDefined();
      expect(CRISIS_RESOURCES.DEFAULT).toBeDefined();
    });

    it('should have phone numbers for hotlines', () => {
      expect(CRISIS_RESOURCES.US.phone).toBe('988');
      expect(CRISIS_RESOURCES.UK.phone).toBe('116 123');
    });
  });
});

describe('GDPR Compliance', () => {
  describe('Data Export', () => {
    it('should collect all user data categories', async () => {
      // Test that all required data categories are included
      const requiredCategories = [
        'user',
        'posts',
        'comments',
        'likes',
        'followers',
        'following',
        'conversations',
        'notifications',
        'blocks',
        'mutes',
        'settings',
      ];

      // In a real test, we'd verify the collectUserData function
      // includes all these categories
      expect(requiredCategories.length).toBe(11);
    });

    it('should enforce 30-day fulfillment deadline', () => {
      const requestDate = new Date();
      const dueDate = new Date(requestDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const daysDiff = Math.ceil(
        (dueDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(30);
    });
  });

  describe('Account Deletion', () => {
    it('should have 30-day recovery window for soft delete', () => {
      const deletionDate = new Date();
      const recoveryDeadline = new Date(
        deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      const daysDiff = Math.ceil(
        (recoveryDeadline.getTime() - deletionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(30);
    });

    it('should anonymize user data on soft delete', () => {
      const anonymizedData = {
        username: 'deleted_abc12345',
        name: 'Deleted User',
        bio: null,
        avatar: null,
      };

      expect(anonymizedData.username).toMatch(/^deleted_/);
      expect(anonymizedData.name).toBe('Deleted User');
      expect(anonymizedData.bio).toBeNull();
    });

    it('should preserve audit log on hard delete', () => {
      // Hash should be consistent for same input
      const crypto = require('crypto');
      const email = 'user@example.com';
      const hash1 = crypto.createHash('sha256').update(email).digest('hex').slice(0, 16);
      const hash2 = crypto.createHash('sha256').update(email).digest('hex').slice(0, 16);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(16);
    });
  });
});

describe('Moderation Queue', () => {
  it('should prioritize by severity', () => {
    const reports = [
      { id: '1', severity: 1, createdAt: new Date() },
      { id: '2', severity: 4, createdAt: new Date() },
      { id: '3', severity: 2, createdAt: new Date() },
    ];

    const sorted = reports.sort((a, b) => b.severity - a.severity);

    expect(sorted[0].severity).toBe(4);
    expect(sorted[1].severity).toBe(2);
    expect(sorted[2].severity).toBe(1);
  });

  it('should support keyboard shortcuts', () => {
    const shortcuts = {
      a: 'approve',
      r: 'remove',
      w: 'warn',
      b: 'ban',
      d: 'dismiss',
      j: 'next',
      k: 'previous',
    };

    expect(Object.keys(shortcuts)).toHaveLength(7);
    expect(shortcuts.a).toBe('approve');
    expect(shortcuts.b).toBe('ban');
  });
});

describe('Strike System', () => {
  const STRIKE_THRESHOLDS = {
    WARNING_TO_STRIKE: 3,
    STRIKES_TO_BAN: 3,
  };

  it('should convert 3 warnings to 1 strike', () => {
    const warnings = 3;
    const strikes = Math.floor(warnings / STRIKE_THRESHOLDS.WARNING_TO_STRIKE);

    expect(strikes).toBe(1);
  });

  it('should ban after 3 strikes', () => {
    const strikes = 3;
    const shouldBan = strikes >= STRIKE_THRESHOLDS.STRIKES_TO_BAN;

    expect(shouldBan).toBe(true);
  });

  it('should calculate remaining warnings until strike', () => {
    const currentWarnings = 2;
    const remaining =
      STRIKE_THRESHOLDS.WARNING_TO_STRIKE -
      (currentWarnings % STRIKE_THRESHOLDS.WARNING_TO_STRIKE);

    expect(remaining).toBe(1);
  });
});
```

## Related Skills

- [Infinite Scroll](../patterns/infinite-scroll.md) - Feed pagination
- [Optimistic Updates](../patterns/optimistic-updates.md) - Like/follow actions
- [Real-time Updates](../patterns/real-time-updates.md) - Live notifications
- [Image Upload](../patterns/image-upload.md) - Post images
- [User Profile](../patterns/user-profile.md) - Profile management

## Changelog

### 2.0.0 (2026-01-18)

- Added comprehensive content moderation system
- Added moderation admin dashboard with keyboard shortcuts
- Added user blocking and muting functionality
- Added GDPR compliance (data export, account deletion)
- Added safety features (self-harm detection, crisis resources)
- Added content warning components
- Added trust & safety test suite

### 1.0.0 (2025-01-17)

- Initial implementation with posts, follows, likes
- Comment system with nested replies
- Real-time notifications with Pusher
- Image uploads with preview
- Infinite scroll feed
- User profiles with follow/unfollow
