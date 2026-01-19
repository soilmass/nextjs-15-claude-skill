---
id: m-media-object
name: Media Object
version: 2.0.0
layer: L2
category: content
description: Classic media object pattern - image/icon alongside content with flexible layout
tags: [layout, media, content, card, list-item]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "MediaObject = Image(a-display-image) + Icon(a-display-icon) + Text(a-display-text)"
composes:
  - ../atoms/display-image.md
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
dependencies:
  react: "^19.0.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Media Object

## Overview

The media object is a classic layout pattern that places an image or icon alongside textual content. Extremely versatile for comments, notifications, list items, cards, and any UI where visual media accompanies text.

## Composition Diagram

```
+----------------------------------------------------------+
|                      MediaObject                          |
|                                                          |
|  Media Position: LEFT (default)                          |
|  +--------+  +---------------------------------------+   |
|  |  Image |  |  Content                              |   |
|  |   or   |  |  +-------------------------------+    |   |
|  |  Icon  |  |  | Text (title)                  |    |   |
|  |        |  |  | "John Doe"                    |    |   |
|  |  [img] |  |  +-------------------------------+    |   |
|  |        |  |  | Text (description)            |    |   |
|  |        |  |  | "This is a comment..."        |    |   |
|  |        |  |  +-------------------------------+    |   |
|  +--------+  +---------------------------------------+   |
|                                                          |
|  Media Position: RIGHT                                   |
|  +---------------------------------------+  +--------+   |
|  |  Content                              |  |  Image |   |
|  |  +-------------------------------+    |  |   or   |   |
|  |  | Text (title/description)      |    |  |  Icon  |   |
|  |  +-------------------------------+    |  +--------+   |
|  +---------------------------------------+               |
|                                                          |
|  Media Position: TOP                                     |
|  +----------------------------------------------------+  |
|  |                   Image                             |  |
|  +----------------------------------------------------+  |
|  |  +----------------------------------------------+  |  |
|  |  | Text (title)                                 |  |  |
|  |  +----------------------------------------------+  |  |
|  |  | Text (description)                           |  |  |
|  |  +----------------------------------------------+  |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

## Implementation

```tsx
// components/molecules/media-object.tsx
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Types
interface MediaObjectProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mediaObjectVariants> {
  media: React.ReactNode;
  mediaPosition?: 'left' | 'right' | 'top';
  children: React.ReactNode;
  actions?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface MediaObjectMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface MediaObjectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface MediaObjectTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
}

interface MediaObjectDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  lines?: 1 | 2 | 3 | 'none';
}

// Styles
const mediaObjectVariants = cva('flex', {
  variants: {
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
    padding: {
      none: 'p-0',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    align: 'start',
    gap: 'md',
    padding: 'none',
  },
});

const lineClampVariants = cva('', {
  variants: {
    lines: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
      none: '',
    },
  },
  defaultVariants: {
    lines: 'none',
  },
});

// Context for compound components
const MediaObjectContext = React.createContext<{
  size?: 'sm' | 'md' | 'lg';
}>({});

// Main Media Object component
export function MediaObject({
  media,
  mediaPosition = 'left',
  children,
  actions,
  href,
  onClick,
  align,
  gap,
  padding,
  className,
  ...props
}: MediaObjectProps) {
  const isInteractive = href || onClick;

  const content = (
    <>
      {mediaPosition === 'left' && <MediaObjectMedia>{media}</MediaObjectMedia>}
      {mediaPosition === 'top' && <MediaObjectMedia>{media}</MediaObjectMedia>}
      
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
      
      {mediaPosition === 'right' && <MediaObjectMedia>{media}</MediaObjectMedia>}
      
      {actions && (
        <div className="flex-shrink-0 ml-auto">{actions}</div>
      )}
    </>
  );

  const baseClassName = cn(
    mediaObjectVariants({ align, gap, padding }),
    mediaPosition === 'top' && 'flex-col',
    isInteractive && 'cursor-pointer hover:bg-accent/50 rounded-lg transition-colors',
    className
  );

  if (href) {
    return (
      <a href={href} className={baseClassName} {...props}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={baseClassName}
        {...props}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={baseClassName} {...props}>
      {content}
    </div>
  );
}

// Media section
export function MediaObjectMedia({ children, className, ...props }: MediaObjectMediaProps) {
  return (
    <div className={cn('flex-shrink-0', className)} {...props}>
      {children}
    </div>
  );
}

// Content section
export function MediaObjectContent({ children, className, ...props }: MediaObjectContentProps) {
  return (
    <div className={cn('min-w-0 flex-1', className)} {...props}>
      {children}
    </div>
  );
}

// Title
export function MediaObjectTitle({
  children,
  as: Component = 'h3',
  className,
  ...props
}: MediaObjectTitleProps) {
  return (
    <Component
      className={cn('font-medium text-foreground truncate', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Description
export function MediaObjectDescription({
  children,
  lines = 2,
  className,
  ...props
}: MediaObjectDescriptionProps) {
  return (
    <p
      className={cn(
        'text-sm text-muted-foreground',
        lineClampVariants({ lines }),
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Meta info (timestamps, badges, etc.)
export function MediaObjectMeta({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Pre-built variants

// Comment style
interface CommentMediaObjectProps {
  avatar: React.ReactNode;
  author: string;
  timestamp: string;
  content: string;
  actions?: React.ReactNode;
}

export function CommentMediaObject({
  avatar,
  author,
  timestamp,
  content,
  actions,
}: CommentMediaObjectProps) {
  return (
    <MediaObject media={avatar} gap="md" align="start">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MediaObjectTitle as="span" className="text-sm">
            {author}
          </MediaObjectTitle>
          <MediaObjectMeta>{timestamp}</MediaObjectMeta>
        </div>
        <MediaObjectDescription lines="none">{content}</MediaObjectDescription>
        {actions && <div className="mt-2">{actions}</div>}
      </div>
    </MediaObject>
  );
}

// Notification style
interface NotificationMediaObjectProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
  isRead?: boolean;
  onClick?: () => void;
}

export function NotificationMediaObject({
  icon,
  title,
  description,
  timestamp,
  isRead = false,
  onClick,
}: NotificationMediaObjectProps) {
  return (
    <MediaObject
      media={icon}
      gap="md"
      align="start"
      padding="md"
      onClick={onClick}
      className={cn(!isRead && 'bg-accent/20')}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <MediaObjectTitle as="span" className={cn('text-sm', !isRead && 'font-semibold')}>
            {title}
          </MediaObjectTitle>
          <MediaObjectMeta>{timestamp}</MediaObjectMeta>
        </div>
        <MediaObjectDescription lines={2}>{description}</MediaObjectDescription>
      </div>
    </MediaObject>
  );
}

// Product/Item style
interface ProductMediaObjectProps {
  image: React.ReactNode;
  title: string;
  subtitle?: string;
  price?: string;
  badge?: React.ReactNode;
  href?: string;
}

export function ProductMediaObject({
  image,
  title,
  subtitle,
  price,
  badge,
  href,
}: ProductMediaObjectProps) {
  return (
    <MediaObject media={image} gap="md" align="center" href={href}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MediaObjectTitle className="text-base">{title}</MediaObjectTitle>
          {badge}
        </div>
        {subtitle && <MediaObjectDescription>{subtitle}</MediaObjectDescription>}
      </div>
      {price && (
        <div className="ml-auto text-right">
          <span className="font-semibold">{price}</span>
        </div>
      )}
    </MediaObject>
  );
}

// User/Profile style
interface UserMediaObjectProps {
  avatar: React.ReactNode;
  name: string;
  subtitle?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  actions?: React.ReactNode;
  onClick?: () => void;
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export function UserMediaObject({
  avatar,
  name,
  subtitle,
  status,
  actions,
  onClick,
}: UserMediaObjectProps) {
  return (
    <MediaObject
      media={
        <div className="relative">
          {avatar}
          {status && (
            <span
              className={cn(
                'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                statusColors[status]
              )}
            />
          )}
        </div>
      }
      gap="md"
      align="center"
      onClick={onClick}
      actions={actions}
    >
      <div>
        <MediaObjectTitle className="text-sm">{name}</MediaObjectTitle>
        {subtitle && (
          <MediaObjectDescription lines={1}>{subtitle}</MediaObjectDescription>
        )}
      </div>
    </MediaObject>
  );
}

// File/Document style
interface FileMediaObjectProps {
  icon: React.ReactNode;
  name: string;
  size: string;
  modified?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export function FileMediaObject({
  icon,
  name,
  size,
  modified,
  actions,
  onClick,
}: FileMediaObjectProps) {
  return (
    <MediaObject
      media={icon}
      gap="md"
      align="center"
      onClick={onClick}
      actions={actions}
    >
      <div>
        <MediaObjectTitle className="text-sm">{name}</MediaObjectTitle>
        <MediaObjectMeta>
          <span>{size}</span>
          {modified && (
            <>
              <span className="text-border">|</span>
              <span>{modified}</span>
            </>
          )}
        </MediaObjectMeta>
      </div>
    </MediaObject>
  );
}
```

## Variants

### Alignment

```tsx
<MediaObject align="start" />  // Default - top aligned
<MediaObject align="center" /> // Vertically centered
<MediaObject align="end" />    // Bottom aligned
<MediaObject align="stretch" /> // Full height
```

### Gap Sizes

```tsx
<MediaObject gap="none" />
<MediaObject gap="sm" />
<MediaObject gap="md" /> // Default
<MediaObject gap="lg" />
```

### Media Position

```tsx
<MediaObject media={<Avatar />} mediaPosition="left" />
<MediaObject media={<Avatar />} mediaPosition="right" />
<MediaObject media={<Image />} mediaPosition="top" />
```

## Usage

### Basic Comment

```tsx
import {
  MediaObject,
  MediaObjectTitle,
  MediaObjectDescription,
  MediaObjectMeta,
} from '@/components/molecules/media-object';
import { Avatar } from '@/components/atoms/avatar';

export function Comment({ comment }) {
  return (
    <MediaObject
      media={<Avatar src={comment.author.avatar} alt={comment.author.name} />}
      gap="md"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MediaObjectTitle as="span" className="text-sm">
            {comment.author.name}
          </MediaObjectTitle>
          <MediaObjectMeta>2 hours ago</MediaObjectMeta>
        </div>
        <MediaObjectDescription lines="none">
          {comment.content}
        </MediaObjectDescription>
      </div>
    </MediaObject>
  );
}
```

### Notification List

```tsx
import { NotificationMediaObject } from '@/components/molecules/media-object';
import { Bell, MessageSquare, Heart } from 'lucide-react';

const notifications = [
  {
    id: 1,
    icon: <Bell className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full" />,
    title: 'New comment on your post',
    description: 'John replied to your comment about React hooks...',
    timestamp: '5m ago',
    isRead: false,
  },
  // ...
];

export function NotificationList() {
  return (
    <div className="divide-y">
      {notifications.map((n) => (
        <NotificationMediaObject
          key={n.id}
          {...n}
          onClick={() => handleNotificationClick(n.id)}
        />
      ))}
    </div>
  );
}
```

### Product List Item

```tsx
import { ProductMediaObject } from '@/components/molecules/media-object';
import { Badge } from '@/components/atoms/badge';
import Image from 'next/image';

export function ProductListItem({ product }) {
  return (
    <ProductMediaObject
      image={
        <Image
          src={product.image}
          alt={product.name}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />
      }
      title={product.name}
      subtitle={product.category}
      price={`$${product.price}`}
      badge={product.isNew && <Badge variant="success">New</Badge>}
      href={`/products/${product.id}`}
    />
  );
}
```

### User List with Status

```tsx
import { UserMediaObject } from '@/components/molecules/media-object';
import { Avatar } from '@/components/atoms/avatar';
import { Button } from '@/components/atoms/button';

export function TeamMemberList({ members }) {
  return (
    <div className="space-y-2">
      {members.map((member) => (
        <UserMediaObject
          key={member.id}
          avatar={<Avatar src={member.avatar} alt={member.name} />}
          name={member.name}
          subtitle={member.role}
          status={member.status}
          actions={
            <Button variant="ghost" size="sm">
              Message
            </Button>
          }
          onClick={() => openProfile(member.id)}
        />
      ))}
    </div>
  );
}
```

### File List

```tsx
import { FileMediaObject } from '@/components/molecules/media-object';
import { FileText, Image, Video, Music } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { MoreHorizontal } from 'lucide-react';

const fileIcons = {
  document: FileText,
  image: Image,
  video: Video,
  audio: Music,
};

export function FileList({ files }) {
  return (
    <div className="divide-y">
      {files.map((file) => {
        const Icon = fileIcons[file.type] || FileText;
        return (
          <FileMediaObject
            key={file.id}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            }
            name={file.name}
            size={file.size}
            modified={file.modified}
            actions={
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
            onClick={() => openFile(file.id)}
          />
        );
      })}
    </div>
  );
}
```

## Anti-patterns

```tsx
// Don't nest interactive elements
<MediaObject onClick={handleClick}>
  <button>Nested button</button> // Bad - nested interactive
</MediaObject>

// Do use actions prop for interactive elements
<MediaObject actions={<button>Action</button>}>
  Content
</MediaObject>

// Don't forget min-w-0 for truncation
<div className="flex">
  <div className="flex-1"> // Text won't truncate
    <p className="truncate">Long text...</p>
  </div>
</div>

// Do include min-w-0
<div className="flex">
  <div className="min-w-0 flex-1">
    <p className="truncate">Long text...</p>
  </div>
</div>
```

## Related Skills

- `atoms/avatar` - User avatars
- `molecules/list-item` - Simple list items
- `molecules/card` - Card component

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with compound components
- Added pre-built variants (Comment, Notification, Product, User, File)
- Support for interactive states
- Flexible alignment and gap options
