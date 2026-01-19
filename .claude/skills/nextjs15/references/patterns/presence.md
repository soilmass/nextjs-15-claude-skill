---
id: pt-presence
name: Presence Detection
version: 2.1.0
layer: L5
category: realtime
description: Track and display user online status and activity indicators
tags: [real-time, presence, online, status, collaboration]
composes: []
dependencies: []
formula: "Presence = Redis TTL Keys + Heartbeat API + usePresence Hook + Status Indicators + Room Membership"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Presence Detection

## When to Use

- **Chat applications**: Show who's online
- **Collaborative tools**: Display active users
- **Typing indicators**: Show when others are typing
- **Document editing**: Show who's viewing/editing
- **Meeting rooms**: Display participants

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Presence Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Client                             │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │ usePresence()                                  │   │   │
│  │  │  - Sends heartbeat every 30s                  │   │   │
│  │  │  - Tracks user activity (mouse, keyboard)     │   │   │
│  │  │  - Handles visibility change                  │   │   │
│  │  └────────────────────┬──────────────────────────┘   │   │
│  └───────────────────────┼───────────────────────────────┘   │
│                          │                                   │
│                          ▼ POST /api/presence               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Server                             │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │ Redis with TTL                                 │   │   │
│  │  │                                               │   │   │
│  │  │  presence:user123 ────► TTL 60s              │   │   │
│  │  │    { status, lastSeen, metadata }            │   │   │
│  │  │                                               │   │   │
│  │  │  room:project-1 ────► Set of user IDs        │   │   │
│  │  │    ["user123", "user456", ...]               │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  UI Components:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  AvatarWithPresence         RoomPresence            │   │
│  │  ┌──────┐                   ┌──────────────────┐   │   │
│  │  │ ●    │ ◄── Online        │ ○ ○ ○ ○ +3      │   │   │
│  │  │ User │     indicator     │ 7 people here    │   │   │
│  │  └──────┘                   └──────────────────┘   │   │
│  │                                                     │   │
│  │  TypingIndicator                                    │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  John is typing...  ● ● ●                    │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Implement real-time user presence tracking to show online status, typing indicators, and active user counts.

## Overview

Presence features include:
- Online/offline status
- Last active timestamps
- Typing indicators
- Viewing indicators
- Active user lists

## Implementation

### Presence System with Upstash Redis

```typescript
// lib/presence/redis.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const PRESENCE_TTL = 60; // 60 seconds
const PRESENCE_KEY_PREFIX = "presence:";
const ROOM_KEY_PREFIX = "room:";

interface PresenceData {
  odId: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy";
  lastSeen: number;
  metadata?: Record<string, unknown>;
}

// Update user presence
export async function updatePresence(
  userId: string,
  data: Partial<PresenceData>
): Promise<void> {
  const key = `${PRESENCE_KEY_PREFIX}${userId}`;
  
  const presence: PresenceData = {
    odId: odId,
    name: data.name || "Unknown",
    avatar: data.avatar,
    status: data.status || "online",
    lastSeen: Date.now(),
    metadata: data.metadata,
  };
  
  await redis.setex(key, PRESENCE_TTL, JSON.stringify(presence));
}

// Get user presence
export async function getPresence(userId: string): Promise<PresenceData | null> {
  const key = `${PRESENCE_KEY_PREFIX}${userId}`;
  const data = await redis.get<string>(key);
  
  if (!data) return null;
  
  return JSON.parse(data);
}

// Check if user is online
export async function isOnline(userId: string): Promise<boolean> {
  const key = `${PRESENCE_KEY_PREFIX}${userId}`;
  return (await redis.exists(key)) === 1;
}

// Room presence
export async function joinRoom(roomId: string, userId: string): Promise<void> {
  const key = `${ROOM_KEY_PREFIX}${roomId}`;
  await redis.sadd(key, userId);
  await redis.expire(key, PRESENCE_TTL * 10); // Room expires after inactivity
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const key = `${ROOM_KEY_PREFIX}${roomId}`;
  await redis.srem(key, userId);
}

export async function getRoomMembers(roomId: string): Promise<string[]> {
  const key = `${ROOM_KEY_PREFIX}${roomId}`;
  return redis.smembers(key);
}

// Get presence for multiple users
export async function getMultiplePresence(
  userIds: string[]
): Promise<Map<string, PresenceData | null>> {
  const pipeline = redis.pipeline();
  
  userIds.forEach((userId) => {
    pipeline.get(`${PRESENCE_KEY_PREFIX}${userId}`);
  });
  
  const results = await pipeline.exec();
  const presenceMap = new Map<string, PresenceData | null>();
  
  userIds.forEach((userId, index) => {
    const data = results[index] as string | null;
    presenceMap.set(userId, data ? JSON.parse(data) : null);
  });
  
  return presenceMap;
}
```

### Presence API Routes

```typescript
// app/api/presence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updatePresence, getMultiplePresence } from "@/lib/presence/redis";

// Heartbeat endpoint
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const body = await request.json();
  
  await updatePresence(session.userId, {
    userId: session.userId,
    name: session.user.name,
    avatar: session.user.avatar,
    status: body.status || "online",
    metadata: body.metadata,
  });
  
  return NextResponse.json({ success: true });
}

// Get presence for users
export async function GET(request: NextRequest) {
  const userIds = request.nextUrl.searchParams.get("userIds")?.split(",") || [];
  
  if (userIds.length === 0) {
    return NextResponse.json({ error: "No user IDs provided" }, { status: 400 });
  }
  
  if (userIds.length > 100) {
    return NextResponse.json({ error: "Too many user IDs" }, { status: 400 });
  }
  
  const presence = await getMultiplePresence(userIds);
  
  return NextResponse.json({
    presence: Object.fromEntries(presence),
  });
}

// app/api/presence/room/[roomId]/route.ts
import { joinRoom, leaveRoom, getRoomMembers } from "@/lib/presence/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const members = await getRoomMembers(roomId);
  const presence = await getMultiplePresence(members);
  
  return NextResponse.json({
    members: Array.from(presence.entries())
      .filter(([_, p]) => p !== null)
      .map(([id, p]) => ({ id, ...p })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { roomId } = await params;
  const { action } = await request.json();
  
  if (action === "join") {
    await joinRoom(roomId, session.userId);
  } else if (action === "leave") {
    await leaveRoom(roomId, session.userId);
  }
  
  return NextResponse.json({ success: true });
}
```

### React Presence Hook

```typescript
// hooks/use-presence.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PresenceOptions {
  heartbeatInterval?: number;
  onStatusChange?: (status: "online" | "away" | "offline") => void;
}

export function usePresence(options: PresenceOptions = {}) {
  const { heartbeatInterval = 30000, onStatusChange } = options;
  const queryClient = useQueryClient();
  const lastActivityRef = useRef(Date.now());
  const statusRef = useRef<"online" | "away" | "offline">("online");
  
  // Send heartbeat
  const sendHeartbeat = useCallback(async (status: "online" | "away") => {
    try {
      await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error("Heartbeat failed:", error);
    }
  }, []);
  
  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      
      if (statusRef.current !== "online") {
        statusRef.current = "online";
        onStatusChange?.("online");
        sendHeartbeat("online");
      }
    };
    
    const events = ["mousedown", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });
    
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [onStatusChange, sendHeartbeat]);
  
  // Heartbeat interval
  useEffect(() => {
    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      const isAway = idleTime > 5 * 60 * 1000; // 5 minutes
      
      const newStatus = isAway ? "away" : "online";
      
      if (statusRef.current !== newStatus) {
        statusRef.current = newStatus;
        onStatusChange?.(newStatus);
      }
      
      sendHeartbeat(newStatus);
    }, heartbeatInterval);
    
    // Initial heartbeat
    sendHeartbeat("online");
    
    return () => clearInterval(interval);
  }, [heartbeatInterval, onStatusChange, sendHeartbeat]);
  
  // Handle visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        // Send offline signal
        navigator.sendBeacon("/api/presence", JSON.stringify({ status: "away" }));
      } else {
        sendHeartbeat("online");
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [sendHeartbeat]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      navigator.sendBeacon("/api/presence", JSON.stringify({ status: "offline" }));
    };
  }, []);
  
  return {
    currentStatus: statusRef.current,
  };
}

// Hook to get presence of other users
export function useUserPresence(userIds: string[]) {
  return useQuery({
    queryKey: ["presence", userIds.join(",")],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      
      const res = await fetch(`/api/presence?userIds=${userIds.join(",")}`);
      const data = await res.json();
      return data.presence;
    },
    refetchInterval: 30000,
    enabled: userIds.length > 0,
  });
}
```

### Presence Indicator Component

```typescript
// components/presence-indicator.tsx
"use client";

import { useUserPresence } from "@/hooks/use-presence";
import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  userId: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PresenceIndicator({
  userId,
  showLabel = false,
  size = "md",
}: PresenceIndicatorProps) {
  const { data: presence, isLoading } = useUserPresence([userId]);
  
  const userPresence = presence?.[userId];
  const isOnline = userPresence?.status === "online";
  const isAway = userPresence?.status === "away";
  
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };
  
  if (isLoading) {
    return (
      <span
        className={cn(
          "rounded-full bg-muted animate-pulse",
          sizeClasses[size]
        )}
      />
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "rounded-full",
          sizeClasses[size],
          isOnline && "bg-green-500",
          isAway && "bg-yellow-500",
          !isOnline && !isAway && "bg-gray-400"
        )}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {isOnline ? "Online" : isAway ? "Away" : "Offline"}
        </span>
      )}
    </span>
  );
}

// Avatar with presence
interface AvatarWithPresenceProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  size?: "sm" | "md" | "lg";
}

export function AvatarWithPresence({ user, size = "md" }: AvatarWithPresenceProps) {
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  
  const indicatorPositions = {
    sm: "bottom-0 right-0",
    md: "bottom-0 right-0",
    lg: "bottom-0.5 right-0.5",
  };
  
  return (
    <div className="relative inline-block">
      <img
        src={user.avatar || `/api/avatar/${user.id}`}
        alt={user.name}
        className={cn(
          "rounded-full object-cover",
          avatarSizes[size]
        )}
      />
      <span className={cn("absolute", indicatorPositions[size])}>
        <PresenceIndicator userId={user.id} size="sm" />
      </span>
    </div>
  );
}
```

### Room Presence Component

```typescript
// components/room-presence.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AvatarWithPresence } from "./presence-indicator";

interface RoomPresenceProps {
  roomId: string;
  maxVisible?: number;
}

export function RoomPresence({ roomId, maxVisible = 5 }: RoomPresenceProps) {
  const queryClient = useQueryClient();
  
  // Fetch room members
  const { data: room, isLoading } = useQuery({
    queryKey: ["room-presence", roomId],
    queryFn: async () => {
      const res = await fetch(`/api/presence/room/${roomId}`);
      return res.json();
    },
    refetchInterval: 10000,
  });
  
  // Join/leave mutations
  const joinMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/presence/room/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-presence", roomId] });
    },
  });
  
  const leaveMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/presence/room/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave" }),
      }),
  });
  
  // Auto join/leave
  useEffect(() => {
    joinMutation.mutate();
    
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        `/api/presence/room/${roomId}`,
        JSON.stringify({ action: "leave" })
      );
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      leaveMutation.mutate();
    };
  }, [roomId]);
  
  if (isLoading) {
    return <div className="h-10 w-32 bg-muted animate-pulse rounded" />;
  }
  
  const members = room?.members || [];
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;
  
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleMembers.map((member: any) => (
          <AvatarWithPresence
            key={member.id}
            user={member}
            size="sm"
          />
        ))}
        {remainingCount > 0 && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            +{remainingCount}
          </div>
        )}
      </div>
      <span className="ml-2 text-sm text-muted-foreground">
        {members.length} {members.length === 1 ? "person" : "people"} here
      </span>
    </div>
  );
}
```

## Variants

### Typing Indicators

```typescript
// hooks/use-typing.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useTypingIndicator(
  channelId: string,
  onTypingChange?: (users: string[]) => void
) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const startTyping = useCallback(async () => {
    await fetch(`/api/channels/${channelId}/typing`, {
      method: "POST",
      body: JSON.stringify({ typing: true }),
    });
    
    // Auto stop after 3 seconds
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetch(`/api/channels/${channelId}/typing`, {
        method: "POST",
        body: JSON.stringify({ typing: false }),
      });
    }, 3000);
  }, [channelId]);
  
  const stopTyping = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await fetch(`/api/channels/${channelId}/typing`, {
      method: "POST",
      body: JSON.stringify({ typing: false }),
    });
  }, [channelId]);
  
  // Poll for typing users
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/channels/${channelId}/typing`);
      const data = await res.json();
      setTypingUsers(data.typingUsers);
      onTypingChange?.(data.typingUsers);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [channelId, onTypingChange]);
  
  return { typingUsers, startTyping, stopTyping };
}

// Typing indicator component
export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;
  
  const text =
    users.length === 1
      ? `${users[0]} is typing...`
      : users.length === 2
      ? `${users[0]} and ${users[1]} are typing...`
      : `${users[0]} and ${users.length - 1} others are typing...`;
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex gap-1">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce delay-100">.</span>
        <span className="animate-bounce delay-200">.</span>
      </span>
      {text}
    </div>
  );
}
```

## Anti-patterns

### No Cleanup on Unmount

```typescript
// BAD: Presence not cleared on unmount
function Component() {
  useEffect(() => {
    sendPresence("online");
    // User appears online forever!
  }, []);
}

// GOOD: Clear presence on unmount
function Component() {
  useEffect(() => {
    sendPresence("online");
    
    return () => {
      navigator.sendBeacon("/api/presence", JSON.stringify({ status: "offline" }));
    };
  }, []);
}
```

### Polling Too Frequently

```typescript
// BAD: Too frequent presence checks
refetchInterval: 1000, // Every second is too much

// GOOD: Reasonable interval
refetchInterval: 30000, // Every 30 seconds
```

## Related Skills

- `websockets` - WebSocket presence
- `polling` - Polling strategies
- `redis` - Redis caching
- `collaboration` - Collaborative features

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Redis-based presence
