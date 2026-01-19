---
id: pt-notifications
name: Notifications
version: 2.1.0
layer: L5
category: realtime
description: Implement in-app notifications with real-time delivery and persistence
tags: [real-time, notifications, alerts, toast, push]
composes: []
dependencies: []
formula: "Notifications = Service + Redis Pub/Sub + SSE Stream + useNotifications Hook + Toast + Preferences"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Notifications

## When to Use

- **User engagement**: Keep users informed of activity
- **System alerts**: Critical updates and warnings
- **Social features**: Likes, comments, mentions
- **Transactional**: Order status, payment confirmations
- **Collaboration**: Team activity, assignments

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 Notification Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Notification Creation                    │   │
│  │                                                     │   │
│  │  Server Action ──► createNotification()            │   │
│  │       │                   │                         │   │
│  │       │                   ├──► Prisma (persist)    │   │
│  │       │                   │                         │   │
│  │       │                   └──► Redis Pub/Sub       │   │
│  │       │                        (real-time)          │   │
│  └───────┼─────────────────────────────────────────────┘   │
│          │                                                  │
│          ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Real-Time Delivery                       │   │
│  │                                                     │   │
│  │  Redis Channel ──► SSE Stream ──► Client           │   │
│  │  notifications:userId   │                           │   │
│  │                         │                           │   │
│  │                         ▼                           │   │
│  │              ┌─────────────────────┐               │   │
│  │              │  useNotifications() │               │   │
│  │              │  - Query cache      │               │   │
│  │              │  - SSE listener     │               │   │
│  │              │  - Toast trigger    │               │   │
│  │              └─────────────────────┘               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              UI Components                            │   │
│  │                                                     │   │
│  │  NotificationBell          Toast                    │   │
│  │  ┌────────────────┐        ┌───────────────────┐   │   │
│  │  │    🔔 (5)      │        │ ┌───┐ New comment │   │   │
│  │  └────────┬───────┘        │ │ 👤│ John said..│   │   │
│  │           │                │ └───┘   [View]   │   │   │
│  │           ▼                └───────────────────┘   │   │
│  │  ┌────────────────────┐                            │   │
│  │  │ Notification List  │                            │   │
│  │  │ ┌────────────────┐ │                            │   │
│  │  │ │ ● New message  │ │ ◄── Unread indicator      │   │
│  │  │ │   from John    │ │                            │   │
│  │  │ ├────────────────┤ │                            │   │
│  │  │ │   Comment on   │ │                            │   │
│  │  │ │   your post    │ │                            │   │
│  │  │ └────────────────┘ │                            │   │
│  │  └────────────────────┘                            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Build a comprehensive notification system with in-app alerts, persistence, and real-time delivery.

## Overview

Notification system features:
- In-app notifications
- Toast/alert messages
- Notification persistence
- Real-time delivery
- Read/unread tracking
- Notification preferences

## Implementation

### Notification Data Model

```typescript
// lib/notifications/types.ts

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "mention"
  | "comment"
  | "follow"
  | "like"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  link?: string;
  metadata?: Record<string, unknown>;
  actor?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: Record<NotificationType, boolean>;
}
```

### Notification Service

```typescript
// lib/notifications/service.ts
import { prisma } from "@/lib/db";
import { Redis } from "@upstash/redis";
import type { Notification, NotificationType } from "./types";

const redis = Redis.fromEnv();
const NOTIFICATION_CHANNEL = "notifications:";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
  actorId?: string;
}

export async function createNotification(
  params: CreateNotificationParams
): Promise<Notification> {
  const { userId, type, title, message, link, metadata, actorId } = params;
  
  // Check user preferences
  const preferences = await getUserNotificationPreferences(userId);
  if (!preferences.inApp || !preferences.types[type]) {
    return null as any; // User has disabled this notification type
  }
  
  // Get actor data if provided
  let actor = null;
  if (actorId) {
    actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, name: true, avatar: true },
    });
  }
  
  // Create notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      metadata: metadata || {},
      actorId,
    },
    include: {
      actor: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });
  
  // Publish to Redis for real-time delivery
  await redis.publish(
    `${NOTIFICATION_CHANNEL}${userId}`,
    JSON.stringify(notification)
  );
  
  // Update unread count cache
  await redis.incr(`notifications:unread:${userId}`);
  
  return notification;
}

export async function getNotifications(
  userId: string,
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
): Promise<{ notifications: Notification[]; total: number; unread: number }> {
  const { limit = 20, offset = 0, unreadOnly = false } = options;
  
  const where = {
    userId,
    ...(unreadOnly ? { read: false } : {}),
  };
  
  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);
  
  return { notifications, total, unread };
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  const notification = await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { read: true, readAt: new Date() },
  });
  
  if (notification) {
    await redis.decr(`notifications:unread:${userId}`);
  }
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
  
  await redis.set(`notifications:unread:${userId}`, 0);
}

export async function getUnreadCount(userId: string): Promise<number> {
  // Try cache first
  const cached = await redis.get<number>(`notifications:unread:${userId}`);
  if (cached !== null) return cached;
  
  // Fallback to database
  const count = await prisma.notification.count({
    where: { userId, read: false },
  });
  
  await redis.set(`notifications:unread:${userId}`, count);
  return count;
}

async function getUserNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const prefs = await prisma.notificationPreferences.findUnique({
    where: { userId },
  });
  
  return prefs || {
    email: true,
    push: true,
    inApp: true,
    types: {
      info: true,
      success: true,
      warning: true,
      error: true,
      mention: true,
      comment: true,
      follow: true,
      like: true,
      system: true,
    },
  };
}
```

### Notification API Routes

```typescript
// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNotifications, markAllAsRead } from "@/lib/notifications/service";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  
  const result = await getNotifications(session.userId, {
    limit,
    offset,
    unreadOnly,
  });
  
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { action } = await request.json();
  
  if (action === "markAllRead") {
    await markAllAsRead(session.userId);
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// app/api/notifications/[id]/route.ts
import { markAsRead } from "@/lib/notifications/service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id } = await params;
  const { read } = await request.json();
  
  if (read) {
    await markAsRead(id, session.userId);
  }
  
  return NextResponse.json({ success: true });
}
```

### Notification Hooks

```typescript
// hooks/use-notifications.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Notification } from "@/lib/notifications/types";

interface UseNotificationsOptions {
  limit?: number;
  realtime?: boolean;
  showToast?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { limit = 20, realtime = true, showToast = true } = options;
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?limit=${limit}`);
      return res.json();
    },
    refetchInterval: realtime ? 30000 : false,
  });
  
  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    },
    onMutate: async (notificationId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      
      queryClient.setQueryData(["notifications"], (old: any) => ({
        ...old,
        notifications: old.notifications.map((n: Notification) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unread: Math.max(0, old.unread - 1),
      }));
    },
  });
  
  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  
  // Real-time updates via SSE
  useEffect(() => {
    if (!realtime) return;
    
    const eventSource = new EventSource("/api/notifications/stream");
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data) as Notification;
      
      // Update query cache
      queryClient.setQueryData(["notifications"], (old: any) => ({
        ...old,
        notifications: [notification, ...(old?.notifications || [])],
        unread: (old?.unread || 0) + 1,
        total: (old?.total || 0) + 1,
      }));
      
      // Show toast
      if (showToast) {
        toast(notification.title, {
          description: notification.message,
          action: notification.link
            ? {
                label: "View",
                onClick: () => {
                  window.location.href = notification.link!;
                  markReadMutation.mutate(notification.id);
                },
              }
            : undefined,
        });
      }
    };
    
    return () => eventSource.close();
  }, [realtime, showToast, queryClient, markReadMutation]);
  
  return {
    notifications: data?.notifications || [],
    total: data?.total || 0,
    unread: data?.unread || 0,
    isLoading,
    isFetching,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
  };
}

// Unread count hook for badges
export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=0");
      return res.json();
    },
    refetchInterval: 30000,
  });
  
  return data?.unread || 0;
}
```

### Notification Components

```typescript
// components/notifications/notification-bell.tsx
"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationList } from "./notification-list";

export function NotificationBell() {
  const { unread, notifications, markAllAsRead, isLoading } = useNotifications();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
        />
      </PopoverContent>
    </Popover>
  );
}

// components/notifications/notification-list.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
}

export function NotificationList({ notifications, isLoading }: NotificationListProps) {
  const { markAsRead } = useNotifications();
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No notifications yet
      </div>
    );
  }
  
  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={() => markAsRead(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const content = (
    <div
      className={cn(
        "p-4 hover:bg-muted cursor-pointer transition-colors",
        !notification.read && "bg-muted/50"
      )}
      onClick={onRead}
    >
      <div className="flex gap-3">
        {notification.actor && (
          <img
            src={notification.actor.avatar || "/default-avatar.png"}
            alt={notification.actor.name}
            className="h-10 w-10 rounded-full"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm", !notification.read && "font-medium")}>
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        {!notification.read && (
          <span className="h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
    </div>
  );
  
  if (notification.link) {
    return (
      <Link href={notification.link} onClick={onRead}>
        {content}
      </Link>
    );
  }
  
  return content;
}
```

### Server-Sent Events for Real-time

```typescript
// app/api/notifications/stream/route.ts
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Subscribe to user's notification channel
      const subscriber = redis.duplicate();
      await subscriber.subscribe(
        `notifications:${session.userId}`,
        (message) => {
          const data = `data: ${message}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      );
      
      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 30000);
      
      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        subscriber.unsubscribe(`notifications:${session.userId}`);
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## Variants

### Toast Notifications

```typescript
// components/notifications/toast-provider.tsx
"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group toast",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
        },
      }}
    />
  );
}

// Usage with server action
"use server";
import { createNotification } from "@/lib/notifications/service";

export async function commentOnPost(postId: string, content: string) {
  const comment = await prisma.comment.create({ /* ... */ });
  
  // Notify post author
  await createNotification({
    userId: post.authorId,
    type: "comment",
    title: "New comment",
    message: `${commenter.name} commented on your post`,
    link: `/posts/${postId}#comment-${comment.id}`,
    actorId: commenterId,
  });
  
  return comment;
}
```

## Anti-patterns

### Not Deduplicating Notifications

```typescript
// BAD: Can create duplicate notifications
await createNotification({ userId, type: "like", postId });
await createNotification({ userId, type: "like", postId }); // Duplicate!

// GOOD: Check for existing before creating
const existing = await prisma.notification.findFirst({
  where: {
    userId,
    type: "like",
    metadata: { path: ["postId"], equals: postId },
    createdAt: { gte: subHours(new Date(), 1) },
  },
});

if (!existing) {
  await createNotification({ userId, type: "like", postId });
}
```

## Related Skills

- `server-sent-events` - SSE implementation
- `websockets` - WebSocket connections
- `polling` - Polling strategies
- `toast` - Toast notifications

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with real-time delivery
