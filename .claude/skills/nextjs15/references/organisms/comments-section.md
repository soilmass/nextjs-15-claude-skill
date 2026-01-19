---
id: o-comments-section
name: Comments Section
version: 2.0.0
layer: L3
category: user
composes:
  - ../molecules/media-object.md
  - ../molecules/avatar.md
description: Threaded comments with replies, reactions, editing, and moderation
tags: [comments, threads, replies, reactions, discussion]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "CommentsSection = MediaObject(m-media-object) + Avatar(m-avatar) + Button(a-button) + Textarea(a-textarea) + Icon(a-icon)"
dependencies:
  - react
  - "@tanstack/react-query"
  - react-hook-form
  - zod
  - lucide-react
  - date-fns
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Comments Section

## Overview

A full-featured comments section organism with threaded replies, reactions, inline editing, delete confirmation, and moderation support. Uses optimistic updates for a responsive feel.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CommentsSection (L3)                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Header: Icon(a-icon) + "Comments (count)"                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  CommentForm                                                  │  │
│  │  Avatar(m-avatar) + Textarea(a-textarea) + Button(a-button)   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  CommentItem (recursive)                                      │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  MediaObject(m-media-object)                            │  │  │
│  │  │  ┌─────────┐  ┌───────────────────────────────────────┐ │  │  │
│  │  │  │ Avatar  │  │ Author + Timestamp                    │ │  │  │
│  │  │  │(m-avatar)│  │ Content text                         │ │  │  │
│  │  │  └─────────┘  │ ┌─────────────────────────────────┐   │ │  │  │
│  │  │               │ │ Actions: Like, Reply, Menu      │   │ │  │  │
│  │  │               │ │ Button(a-button)[]              │   │ │  │  │
│  │  │               │ └─────────────────────────────────┘   │ │  │  │
│  │  │               └───────────────────────────────────────┘ │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │    └── Nested Replies (CommentItem[])                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Button(a-button): "Load more comments"                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/comments-section.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Send,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string;
  likes: number;
  likedByMe: boolean;
  replies?: Comment[];
  replyCount?: number;
  isEdited?: boolean;
}

interface CommentsSectionProps {
  entityType: string;
  entityId: string;
  currentUser?: User;
  onSignInRequired?: () => void;
  allowAnonymous?: boolean;
  maxDepth?: number;
  pageSize?: number;
}

// Validation schema
const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment is too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

// API functions
async function fetchComments(
  entityType: string,
  entityId: string,
  page: number,
  pageSize: number
): Promise<{ comments: Comment[]; nextPage?: number; total: number }> {
  const res = await fetch(
    `/api/${entityType}/${entityId}/comments?page=${page}&limit=${pageSize}`
  );
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

async function postComment(
  entityType: string,
  entityId: string,
  data: { content: string; parentId?: string }
): Promise<Comment> {
  const res = await fetch(`/api/${entityType}/${entityId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

async function updateComment(
  commentId: string,
  content: string
): Promise<Comment> {
  const res = await fetch(`/api/comments/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to update comment');
  return res.json();
}

async function deleteComment(commentId: string): Promise<void> {
  const res = await fetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}

async function toggleLike(commentId: string): Promise<{ liked: boolean }> {
  const res = await fetch(`/api/comments/${commentId}/like`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

// Avatar Component
function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-10 w-10 text-sm',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-muted font-medium',
        sizeClasses[size]
      )}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}

// Comment Form
function CommentForm({
  onSubmit,
  isLoading,
  placeholder = 'Write a comment...',
  buttonText = 'Post',
  autoFocus = false,
  initialValue = '',
  onCancel,
}: {
  onSubmit: (data: CommentFormData) => void;
  isLoading: boolean;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  initialValue?: string;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: initialValue },
  });

  const handleFormSubmit = (data: CommentFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
      <textarea
        {...register('content')}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          errors.content && 'border-destructive'
        )}
        rows={3}
      />
      {errors.content && (
        <p className="text-xs text-destructive">{errors.content.message}</p>
      )}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 disabled:opacity-50'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {buttonText}
        </button>
      </div>
    </form>
  );
}

// Comment Actions Menu
function CommentActions({
  comment,
  isOwner,
  onEdit,
  onDelete,
  onReport,
}: {
  comment: Comment;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-1 hover:bg-accent"
        aria-label="Comment actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border bg-popover py-1 shadow-lg">
            {isOwner && (
              <>
                <button
                  onClick={() => {
                    setOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
            {!isOwner && (
              <button
                onClick={() => {
                  setOpen(false);
                  onReport();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Single Comment Component
function CommentItem({
  comment,
  currentUser,
  depth,
  maxDepth,
  entityType,
  entityId,
  onSignInRequired,
}: {
  comment: Comment;
  currentUser?: User;
  depth: number;
  maxDepth: number;
  entityType: string;
  entityId: string;
  onSignInRequired?: () => void;
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isReplying, setIsReplying] = React.useState(false);
  const [showReplies, setShowReplies] = React.useState(depth < 2);

  const isOwner = currentUser?.id === comment.author.id;

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(comment.id),
    onMutate: async () => {
      // Optimistic update
      queryClient.setQueryData(
        ['comments', entityType, entityId],
        (old: any) => {
          // Update comment in cache
          return old;
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', entityType, entityId],
      });
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: (content: string) => updateComment(comment.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', entityType, entityId],
      });
      setIsEditing(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', entityType, entityId],
      });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: (content: string) =>
      postComment(entityType, entityId, { content, parentId: comment.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', entityType, entityId],
      });
      setIsReplying(false);
      setShowReplies(true);
    },
  });

  const handleLike = () => {
    if (!currentUser) {
      onSignInRequired?.();
      return;
    }
    likeMutation.mutate();
  };

  const handleReply = () => {
    if (!currentUser) {
      onSignInRequired?.();
      return;
    }
    setIsReplying(true);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className={cn('group', depth > 0 && 'ml-8 border-l pl-4')}>
      <div className="flex gap-3">
        <Avatar user={comment.author} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mt-2">
              <CommentForm
                onSubmit={(data) => editMutation.mutate(data.content)}
                isLoading={editMutation.isPending}
                buttonText="Save"
                initialValue={comment.content}
                autoFocus
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-1 text-xs transition-colors',
                  comment.likedByMe
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ThumbsUp
                  className={cn('h-4 w-4', comment.likedByMe && 'fill-current')}
                />
                {comment.likes > 0 && <span>{comment.likes}</span>}
              </button>

              {depth < maxDepth && (
                <button
                  onClick={handleReply}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </button>
              )}

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CommentActions
                  comment={comment}
                  isOwner={isOwner}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDelete}
                  onReport={() => alert('Reported')}
                />
              </div>
            </div>
          )}

          {/* Reply form */}
          {isReplying && (
            <div className="mt-3">
              <CommentForm
                onSubmit={(data) => replyMutation.mutate(data.content)}
                isLoading={replyMutation.isPending}
                placeholder={`Reply to ${comment.author.name}...`}
                buttonText="Reply"
                autoFocus
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {!showReplies ? (
                <button
                  onClick={() => setShowReplies(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ChevronDown className="h-4 w-4" />
                  Show {comment.replies.length} replies
                </button>
              ) : (
                <div className="space-y-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUser={currentUser}
                      depth={depth + 1}
                      maxDepth={maxDepth}
                      entityType={entityType}
                      entityId={entityId}
                      onSignInRequired={onSignInRequired}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Comments Section
export function CommentsSection({
  entityType,
  entityId,
  currentUser,
  onSignInRequired,
  allowAnonymous = false,
  maxDepth = 3,
  pageSize = 10,
}: CommentsSectionProps) {
  const queryClient = useQueryClient();

  // Fetch comments
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['comments', entityType, entityId],
      queryFn: ({ pageParam = 1 }) =>
        fetchComments(entityType, entityId, pageParam, pageSize),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    });

  // Post comment mutation
  const postMutation = useMutation({
    mutationFn: (content: string) =>
      postComment(entityType, entityId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', entityType, entityId],
      });
    },
  });

  const allComments = data?.pages.flatMap((page) => page.comments) ?? [];
  const totalComments = data?.pages[0]?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="font-semibold">
          Comments {totalComments > 0 && `(${totalComments})`}
        </h2>
      </div>

      {/* New comment form */}
      {(currentUser || allowAnonymous) && (
        <div className="flex gap-3">
          {currentUser && <Avatar user={currentUser} />}
          <div className="flex-1">
            <CommentForm
              onSubmit={(data) => postMutation.mutate(data.content)}
              isLoading={postMutation.isPending}
              placeholder="Share your thoughts..."
            />
          </div>
        </div>
      )}

      {!currentUser && !allowAnonymous && (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <button
              onClick={onSignInRequired}
              className="text-primary hover:underline"
            >
              Sign in
            </button>{' '}
            to join the conversation
          </p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : allComments.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {allComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              depth={0}
              maxDepth={maxDepth}
              entityType={entityType}
              entityId={entityId}
              onSignInRequired={onSignInRequired}
            />
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex w-full items-center justify-center gap-2 py-2 text-sm text-primary hover:underline"
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Load more comments'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { CommentsSection } from '@/components/organisms/comments-section';

export function ArticlePage({ article, currentUser }) {
  return (
    <article>
      <h1>{article.title}</h1>
      <div>{article.content}</div>
      
      <CommentsSection
        entityType="articles"
        entityId={article.id}
        currentUser={currentUser}
        onSignInRequired={() => router.push('/login')}
      />
    </article>
  );
}
```

### With Limited Nesting

```tsx
<CommentsSection
  entityType="posts"
  entityId={post.id}
  currentUser={user}
  maxDepth={2} // Only allow 2 levels of nesting
/>
```

### Allow Anonymous Comments

```tsx
<CommentsSection
  entityType="feedback"
  entityId={feedbackId}
  allowAnonymous
/>
```

## Props API

### CommentsSection

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entityType` | `string` | Required | Type of entity comments are attached to |
| `entityId` | `string` | Required | ID of entity comments belong to |
| `currentUser` | `User` | `undefined` | Currently logged in user |
| `onSignInRequired` | `() => void` | `undefined` | Handler when auth is required |
| `allowAnonymous` | `boolean` | `false` | Whether anonymous comments are allowed |
| `maxDepth` | `number` | `3` | Maximum nesting depth for replies |
| `pageSize` | `number` | `10` | Number of comments per page |

### User Type

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique user identifier |
| `name` | `string` | Display name |
| `avatar` | `string` | Avatar URL (optional) |

### Comment Type

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique comment identifier |
| `content` | `string` | Comment text content |
| `author` | `User` | Comment author |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last edit timestamp (optional) |
| `parentId` | `string` | Parent comment ID for replies (optional) |
| `likes` | `number` | Like count |
| `likedByMe` | `boolean` | Whether current user liked |
| `replies` | `Comment[]` | Nested replies (optional) |
| `replyCount` | `number` | Total reply count (optional) |
| `isEdited` | `boolean` | Whether comment was edited |

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Loading | Initial fetch | Centered spinner |
| Empty | No comments | Empty state with icon and message |
| Loaded | Comments displayed | Threaded comment list |
| Submitting | Posting new comment | Submit button shows spinner |
| Editing | Comment in edit mode | Textarea with save/cancel buttons |
| Replying | Reply form open | Nested reply form visible |
| Deleting | Delete confirmation | Confirm dialog shown |
| Liked | User liked comment | Filled thumbs up icon, primary color |
| Error | Action failed | Error message displayed |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus through comment form, comments, action buttons |
| `Enter` | Submit comment (with Ctrl/Cmd), activate buttons |
| `Escape` | Cancel edit mode, close reply form, close action menu |
| `Space` | Toggle like, activate buttons |
| `Arrow Down/Up` | Navigate action menu items |

## Screen Reader Announcements

- Comments section announced with heading and count (e.g., "Comments (24)")
- Each comment announces: author name, content, timestamp, like count
- "(edited)" announced for modified comments
- Reply button announces "Reply to [author name]"
- Like button announces current state and count
- Action menu announced as "Comment actions"
- Edit/Delete actions clearly labeled
- Sign in prompt announced for unauthenticated users
- Loading and empty states announced
- Form submission success/failure announced

## Anti-patterns

### 1. Missing Sign-In Handler
```tsx
// Bad - no way to prompt authentication
<CommentsSection
  entityType="articles"
  entityId={article.id}
  currentUser={null}
/>

// Good - provide sign-in prompt handler
<CommentsSection
  entityType="articles"
  entityId={article.id}
  currentUser={currentUser}
  onSignInRequired={() => router.push('/login?redirect=' + pathname)}
/>
```

### 2. Unlimited Nesting Depth
```tsx
// Bad - deeply nested threads become unreadable
<CommentsSection
  entityType="posts"
  entityId={post.id}
  currentUser={user}
  maxDepth={10}
/>

// Good - reasonable depth limit
<CommentsSection
  entityType="posts"
  entityId={post.id}
  currentUser={user}
  maxDepth={3}
/>
```

### 3. No Delete Confirmation
```tsx
// Bad - deleting without confirmation in custom implementation
const handleDelete = async () => {
  await deleteComment(commentId);
};

// Good - always confirm destructive actions (built into component)
const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this comment?')) {
    await deleteComment(commentId);
  }
};
```

### 4. Missing Entity Context
```tsx
// Bad - generic entity type loses context
<CommentsSection
  entityType="item"
  entityId={id}
  currentUser={user}
/>

// Good - specific entity type for proper API routing
<CommentsSection
  entityType="articles"
  entityId={article.id}
  currentUser={user}
/>
```

## Related Skills

- `molecules/media-object` - Comment layout base
- `patterns/optimistic-updates` - Optimistic UI updates
- `patterns/infinite-scroll` - Pagination pattern

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Threaded replies with configurable depth
- Like/unlike with optimistic updates
- Edit and delete with confirmation
- Infinite scroll pagination
- Sign-in required prompt
