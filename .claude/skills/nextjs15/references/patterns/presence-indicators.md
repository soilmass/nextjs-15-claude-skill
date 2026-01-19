---
id: pt-presence-indicators
name: Presence Indicators
version: 1.0.0
layer: L5
category: realtime
description: Show online/offline status and user presence in real-time
tags: [realtime, presence, websocket, collaboration, next15, react19]
composes:
  - ../atoms/display-avatar.md
  - ../atoms/display-badge.md
dependencies: []
formula: "Presence = WebSocket/SSE + HeartBeat + PresenceStore + AvatarBadge"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Presence Indicators

## Overview

Presence indicators show real-time user status (online, offline, away, busy) for collaborative applications. This pattern covers WebSocket-based presence, heartbeat mechanisms, and UI components.

## When to Use

- Chat applications
- Collaborative editing tools
- Team dashboards
- Live support systems
- Multiplayer applications

## Presence Context Setup

```typescript
// lib/presence/context.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

interface UserPresence {
  id: string;
  status: PresenceStatus;
  lastSeen: Date;
  metadata?: Record<string, unknown>;
}

interface PresenceContextValue {
  presence: Map<string, UserPresence>;
  myStatus: PresenceStatus;
  setMyStatus: (status: PresenceStatus) => void;
  isUserOnline: (userId: string) => boolean;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) throw new Error('usePresence must be used within PresenceProvider');
  return context;
}

interface PresenceProviderProps {
  userId: string;
  children: React.ReactNode;
}

export function PresenceProvider({ userId, children }: PresenceProviderProps) {
  const [presence, setPresence] = useState<Map<string, UserPresence>>(new Map());
  const [myStatus, setMyStatus] = useState<PresenceStatus>('online');
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/presence?userId=${userId}`
    );

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', status: myStatus }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'presence_update':
          setPresence((prev) => {
            const next = new Map(prev);
            next.set(data.userId, {
              id: data.userId,
              status: data.status,
              lastSeen: new Date(data.timestamp),
            });
            return next;
          });
          break;
        case 'user_left':
          setPresence((prev) => {
            const next = new Map(prev);
            const user = next.get(data.userId);
            if (user) {
              next.set(data.userId, { ...user, status: 'offline' });
            }
            return next;
          });
          break;
        case 'sync':
          const syncedPresence = new Map<string, UserPresence>();
          data.users.forEach((user: UserPresence) => {
            syncedPresence.set(user.id, {
              ...user,
              lastSeen: new Date(user.lastSeen),
            });
          });
          setPresence(syncedPresence);
          break;
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [userId, myStatus]);

  // Heartbeat
  useEffect(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const interval = setInterval(() => {
      ws.send(JSON.stringify({ type: 'heartbeat', status: myStatus }));
    }, 30000);

    return () => clearInterval(interval);
  }, [ws, myStatus]);

  // Idle detection
  useEffect(() => {
    let idleTimeout: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      if (myStatus === 'away') setMyStatus('online');

      idleTimeout = setTimeout(() => {
        setMyStatus('away');
      }, 5 * 60 * 1000); // 5 minutes
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, [myStatus]);

  const handleSetMyStatus = useCallback((status: PresenceStatus) => {
    setMyStatus(status);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'status_change', status }));
    }
  }, [ws]);

  const isUserOnline = useCallback(
    (id: string) => presence.get(id)?.status === 'online',
    [presence]
  );

  return (
    <PresenceContext.Provider
      value={{
        presence,
        myStatus,
        setMyStatus: handleSetMyStatus,
        isUserOnline,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
}
```

## Presence Badge Component

```typescript
// components/presence-badge.tsx
'use client';

import { usePresence } from '@/lib/presence/context';
import { cn } from '@/lib/utils';

type Status = 'online' | 'offline' | 'away' | 'busy';

interface PresenceBadgeProps {
  userId: string;
  className?: string;
  showLabel?: boolean;
}

const statusColors: Record<Status, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const statusLabels: Record<Status, string> = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Do not disturb',
};

export function PresenceBadge({ userId, className, showLabel }: PresenceBadgeProps) {
  const { presence } = usePresence();
  const userPresence = presence.get(userId);
  const status = userPresence?.status || 'offline';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full ring-2 ring-background',
          statusColors[status]
        )}
        aria-label={statusLabels[status]}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {statusLabels[status]}
        </span>
      )}
    </div>
  );
}
```

## Avatar with Presence

```typescript
// components/avatar-with-presence.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PresenceBadge } from '@/components/presence-badge';
import { cn } from '@/lib/utils';

interface AvatarWithPresenceProps {
  userId: string;
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const badgePositions = {
  sm: '-bottom-0.5 -right-0.5',
  md: '-bottom-0.5 -right-0.5',
  lg: 'bottom-0 right-0',
};

export function AvatarWithPresence({
  userId,
  name,
  image,
  size = 'md',
  className,
}: AvatarWithPresenceProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className={cn('absolute', badgePositions[size])}>
        <PresenceBadge userId={userId} />
      </div>
    </div>
  );
}
```

## Server-Side Presence API

```typescript
// app/api/presence/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const PRESENCE_TTL = 60; // seconds

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
  }

  const presence = await redis.hgetall(`presence:${roomId}`);

  const users = Object.entries(presence || {}).map(([id, data]) => ({
    id,
    ...JSON.parse(data as string),
  }));

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const { userId, roomId, status } = await request.json();

  const data = JSON.stringify({
    status,
    lastSeen: new Date().toISOString(),
  });

  await redis.hset(`presence:${roomId}`, userId, data);
  await redis.expire(`presence:${roomId}`, PRESENCE_TTL);

  return NextResponse.json({ success: true });
}
```

## Online Users List

```typescript
// components/online-users.tsx
'use client';

import { usePresence } from '@/lib/presence/context';
import { AvatarWithPresence } from '@/components/avatar-with-presence';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: string;
  name: string;
  image?: string;
}

interface OnlineUsersProps {
  users: User[];
}

export function OnlineUsers({ users }: OnlineUsersProps) {
  const { presence, isUserOnline } = usePresence();

  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = isUserOnline(a.id);
    const bOnline = isUserOnline(b.id);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return 0;
  });

  const onlineCount = users.filter((u) => isUserOnline(u.id)).length;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">
        Team Members ({onlineCount} online)
      </h3>

      <ScrollArea className="h-64">
        <div className="space-y-3">
          {sortedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <AvatarWithPresence
                userId={user.id}
                name={user.name}
                image={user.image}
                size="sm"
              />
              <span className="text-sm">{user.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

## Anti-patterns

### Don't Poll Too Frequently

```typescript
// BAD - Polling every second
setInterval(() => fetchPresence(), 1000);

// GOOD - Use WebSocket or longer polling interval
const ws = new WebSocket('/presence');
// Or poll every 30 seconds with heartbeat
setInterval(() => sendHeartbeat(), 30000);
```

## Related Skills

- [real-time-updates](./real-time-updates.md)
- [websocket](./websocket.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- WebSocket presence
- Idle detection
- Presence badges
