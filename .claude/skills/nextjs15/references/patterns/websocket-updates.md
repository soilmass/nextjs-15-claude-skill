---
id: pt-websocket-updates
name: Real-time WebSocket Updates
version: 1.0.0
layer: L5
category: realtime
description: Real-time data updates via WebSocket for Next.js applications
tags: [websocket, realtime, updates, sync, next15, react19]
composes:
  - ../molecules/card.md
  - ../molecules/badge.md
  - ../molecules/toast.md
dependencies:
  socket.io: "^4.8.0"
formula: WebSocket Events + State Sync + Optimistic Updates = Real-time UI
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Real-time WebSocket Updates

## When to Use

- **Live data feeds**: Stock prices, sports scores, metrics
- **Collaborative editing**: Document changes, cursor positions
- **Notifications**: Real-time alerts and messages
- **Presence**: Online status, typing indicators

**Avoid when**: Data changes infrequently, or eventual consistency is acceptable.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Real-time Updates Architecture                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Update Manager                                        │  │
│  │  ├─ Event Handlers: Process incoming updates         │  │
│  │  ├─ State Sync: Merge updates with local state       │  │
│  │  └─ Conflict Resolution: Handle concurrent edits     │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ List       │     │ Detail       │     │ Presence    │   │
│  │ Updates    │     │ Updates      │     │ Indicators  │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## useRealtimeQuery Hook

```typescript
// hooks/use-realtime-query.ts
import { useEffect, useCallback } from 'react';
import { useQueryClient, useQuery, QueryKey } from '@tanstack/react-query';
import { useSocket } from '@/hooks/use-socket';

interface UseRealtimeQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  wsEvent: string;
  wsChannel?: string;
  onUpdate?: (data: any, queryData: T | undefined) => T;
}

export function useRealtimeQuery<T>({
  queryKey,
  queryFn,
  wsEvent,
  wsChannel,
  onUpdate,
}: UseRealtimeQueryOptions<T>) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
  });

  const handleUpdate = useCallback(
    (data: any) => {
      queryClient.setQueryData(queryKey, (oldData: T | undefined) => {
        if (onUpdate) {
          return onUpdate(data, oldData);
        }
        // Default: replace with new data
        return data;
      });
    },
    [queryClient, queryKey, onUpdate]
  );

  useSocket({
    event: wsEvent,
    channel: wsChannel,
    onMessage: handleUpdate,
  });

  return query;
}
```

## useRealtimeList Hook

```typescript
// hooks/use-realtime-list.ts
import { useCallback } from 'react';
import { useQueryClient, useQuery, QueryKey } from '@tanstack/react-query';
import { useSocket } from '@/hooks/use-socket';

interface ListItem {
  id: string;
  [key: string]: any;
}

interface ListUpdateEvent {
  action: 'create' | 'update' | 'delete';
  item: ListItem;
}

interface UseRealtimeListOptions<T extends ListItem> {
  queryKey: QueryKey;
  queryFn: () => Promise<T[]>;
  wsChannel: string;
  sortFn?: (a: T, b: T) => number;
}

export function useRealtimeList<T extends ListItem>({
  queryKey,
  queryFn,
  wsChannel,
  sortFn,
}: UseRealtimeListOptions<T>) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
  });

  const handleUpdate = useCallback(
    (event: ListUpdateEvent) => {
      queryClient.setQueryData<T[]>(queryKey, (oldData) => {
        if (!oldData) return oldData;

        let newData: T[];

        switch (event.action) {
          case 'create':
            newData = [...oldData, event.item as T];
            break;
          case 'update':
            newData = oldData.map((item) =>
              item.id === event.item.id ? { ...item, ...event.item } : item
            );
            break;
          case 'delete':
            newData = oldData.filter((item) => item.id !== event.item.id);
            break;
          default:
            return oldData;
        }

        return sortFn ? newData.sort(sortFn) : newData;
      });
    },
    [queryClient, queryKey, sortFn]
  );

  useSocket({
    event: 'list:update',
    channel: wsChannel,
    onMessage: handleUpdate,
  });

  return query;
}
```

## Presence Hook

```typescript
// hooks/use-presence.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useWebSocket } from '@/providers/websocket-provider';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface PresenceState {
  [userId: string]: {
    user: User;
    status: 'online' | 'away' | 'busy';
    lastSeen: Date;
    metadata?: Record<string, any>;
  };
}

interface UsePresenceOptions {
  channel: string;
  user: User;
  initialStatus?: 'online' | 'away' | 'busy';
}

export function usePresence({ channel, user, initialStatus = 'online' }: UsePresenceOptions) {
  const { send, status: connectionStatus } = useWebSocket();
  const [presence, setPresence] = useState<PresenceState>({});
  const [myStatus, setMyStatus] = useState(initialStatus);
  const heartbeatRef = useRef<NodeJS.Timer>();

  // Announce presence
  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    const announce = () => {
      send('presence:announce', {
        channel,
        user,
        status: myStatus,
      });
    };

    announce();

    // Send heartbeat
    heartbeatRef.current = setInterval(announce, 30000);

    return () => {
      clearInterval(heartbeatRef.current);
      send('presence:leave', { channel, userId: user.id });
    };
  }, [connectionStatus, channel, user.id, myStatus, send]);

  // Listen for presence updates
  useSocket({
    event: 'presence:update',
    channel,
    onMessage: (data: { userId: string; user: User; status: string; metadata?: any }) => {
      setPresence((prev) => ({
        ...prev,
        [data.userId]: {
          user: data.user,
          status: data.status as any,
          lastSeen: new Date(),
          metadata: data.metadata,
        },
      }));
    },
  });

  // Listen for leave events
  useSocket({
    event: 'presence:leave',
    channel,
    onMessage: (data: { userId: string }) => {
      setPresence((prev) => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
    },
  });

  const updateStatus = useCallback(
    (status: 'online' | 'away' | 'busy') => {
      setMyStatus(status);
      send('presence:announce', { channel, user, status });
    },
    [channel, user, send]
  );

  const updateMetadata = useCallback(
    (metadata: Record<string, any>) => {
      send('presence:announce', { channel, user, status: myStatus, metadata });
    },
    [channel, user, myStatus, send]
  );

  const onlineUsers = Object.values(presence).filter((p) => p.status === 'online');

  return {
    presence,
    onlineUsers,
    myStatus,
    updateStatus,
    updateMetadata,
  };
}
```

## Typing Indicator Hook

```typescript
// hooks/use-typing-indicator.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useWebSocket } from '@/providers/websocket-provider';

interface TypingUser {
  id: string;
  name: string;
}

interface UseTypingIndicatorOptions {
  channel: string;
  userId: string;
  userName: string;
  timeout?: number;
}

export function useTypingIndicator({
  channel,
  userId,
  userName,
  timeout = 3000,
}: UseTypingIndicatorOptions) {
  const { send } = useWebSocket();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isTypingRef = useRef(false);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout>();

  // Listen for typing events
  useSocket({
    event: 'typing:start',
    channel,
    onMessage: (data: TypingUser) => {
      if (data.id === userId) return;

      setTypingUsers((prev) => {
        if (prev.some((u) => u.id === data.id)) return prev;
        return [...prev, data];
      });

      // Clear existing timeout
      const existingTimeout = typingTimeoutsRef.current.get(data.id);
      if (existingTimeout) clearTimeout(existingTimeout);

      // Set new timeout
      const newTimeout = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.id !== data.id));
        typingTimeoutsRef.current.delete(data.id);
      }, timeout);

      typingTimeoutsRef.current.set(data.id, newTimeout);
    },
  });

  useSocket({
    event: 'typing:stop',
    channel,
    onMessage: (data: { id: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== data.id));
      const existingTimeout = typingTimeoutsRef.current.get(data.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingTimeoutsRef.current.delete(data.id);
      }
    },
  });

  const startTyping = useCallback(() => {
    if (isTypingRef.current) return;

    isTypingRef.current = true;
    send('typing:start', { channel, id: userId, name: userName });

    // Auto-stop after timeout
    clearTimeout(stopTypingTimeoutRef.current);
    stopTypingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      send('typing:stop', { channel, id: userId });
    }, timeout);
  }, [channel, userId, userName, timeout, send]);

  const stopTyping = useCallback(() => {
    if (!isTypingRef.current) return;

    isTypingRef.current = false;
    clearTimeout(stopTypingTimeoutRef.current);
    send('typing:stop', { channel, id: userId });
  }, [channel, userId, send]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(stopTypingTimeoutRef.current);
      typingTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return { typingUsers, startTyping, stopTyping };
}
```

## Live Data Component

```typescript
// components/realtime/live-data.tsx
'use client';

import { useRealtimeQuery } from '@/hooks/use-realtime-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

interface LiveStockPriceProps {
  symbol: string;
}

export function LiveStockPrice({ symbol }: LiveStockPriceProps) {
  const { data, isLoading } = useRealtimeQuery<StockData>({
    queryKey: ['stock', symbol],
    queryFn: () => fetch(`/api/stocks/${symbol}`).then((r) => r.json()),
    wsEvent: 'stock:update',
    wsChannel: `stocks:${symbol}`,
  });

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  const isPositive = data.change >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{data.symbol}</CardTitle>
          <Badge variant={isPositive ? 'default' : 'destructive'}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {data.changePercent.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">${data.price.toFixed(2)}</div>
        <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{data.change.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date(data.updatedAt).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
```

## Typing Indicator Component

```typescript
// components/realtime/typing-indicator.tsx
'use client';

import { useTypingIndicator } from '@/hooks/use-typing-indicator';

interface TypingIndicatorProps {
  channel: string;
  userId: string;
  userName: string;
}

export function TypingIndicator({ channel, userId, userName }: TypingIndicatorProps) {
  const { typingUsers } = useTypingIndicator({
    channel,
    userId,
    userName,
  });

  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0].name} is typing...`
      : typingUsers.length === 2
      ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`
      : `${typingUsers.length} people are typing...`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}</span>
    </div>
  );
}
```

## Online Users Component

```typescript
// components/realtime/online-users.tsx
'use client';

import { usePresence } from '@/hooks/use-presence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OnlineUsersProps {
  channel: string;
  currentUser: { id: string; name: string; avatar?: string };
}

export function OnlineUsers({ channel, currentUser }: OnlineUsersProps) {
  const { onlineUsers } = usePresence({
    channel,
    user: currentUser,
  });

  return (
    <div className="flex items-center -space-x-2">
      <TooltipProvider>
        {onlineUsers.slice(0, 5).map((presence) => (
          <Tooltip key={presence.user.id}>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={presence.user.avatar} />
                <AvatarFallback>
                  {presence.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{presence.user.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {onlineUsers.length > 5 && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
            +{onlineUsers.length - 5}
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}
```

## Related Patterns

- [websocket](./websocket.md)
- [optimistic-updates](./optimistic-updates.md)
- [react-query](./react-query.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Real-time query hook
- Presence system
- Typing indicators
- Live data components
