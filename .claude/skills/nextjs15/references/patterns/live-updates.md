---
id: pt-live-updates
name: Live Updates
version: 2.1.0
layer: L5
category: realtime
description: Implement real-time data synchronization for live dashboards and feeds
tags: [real-time, live, sync, streaming, updates]
composes: []
dependencies: []
formula: "Live Updates = LiveProvider + useLiveData Hook + WebSocket/SSE Transport + Optimistic Updates + Reconnection"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Live Updates

## When to Use

- **Live dashboards**: Metrics that update in real-time
- **Activity feeds**: Social feeds, notification streams
- **Collaborative apps**: Multi-user real-time features
- **Stock tickers**: Financial data that changes frequently
- **Live scores**: Sports or gaming leaderboards

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Live Updates Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    LiveProvider                       │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │ Connection State: connected | connecting | error│   │   │
│  │  │ WebSocket/SSE Reference                         │   │   │
│  │  │ Channel Subscriptions Map                       │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  └───────────────────────┬───────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   useLiveData()                       │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ Initial     │  │ Subscribe   │  │ Merge      │  │   │
│  │  │ Query Fetch │  │ to Channel  │  │ Updates    │  │   │
│  │  │ (React      │  │             │  │            │  │   │
│  │  │  Query)     │  │             │  │            │  │   │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  │         │                │                │        │   │
│  │         ▼                ▼                ▼        │   │
│  │  ┌────────────────────────────────────────────┐   │   │
│  │  │       React Query Cache (Optimistic)       │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    UI Components                      │   │
│  │                                                     │   │
│  │  ┌────────────────┐  ┌───────────────────────────┐ │   │
│  │  │ LiveIndicator  │  │  Data Display Component   │ │   │
│  │  │ (connection    │  │  (auto-updates from       │ │   │
│  │  │  status)       │  │   cache changes)          │ │   │
│  │  └────────────────┘  └───────────────────────────┘ │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Data Flow:                                                 │
│  Server → WebSocket/SSE → LiveProvider → Cache → UI        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Build real-time data synchronization for live dashboards, activity feeds, and collaborative applications.

## Overview

Live updates provide:
- Real-time data streaming
- Optimistic UI updates
- Conflict resolution
- Efficient delta updates
- Connection state management

## Implementation

### Live Data Provider

```typescript
// lib/live/provider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

interface LiveConnection {
  status: "connecting" | "connected" | "disconnected" | "error";
  reconnectAttempt: number;
}

interface LiveContextValue {
  connection: LiveConnection;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
  publish: (channel: string, data: any) => void;
}

const LiveContext = createContext<LiveContextValue | null>(null);

export function LiveProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<LiveConnection>({
    status: "connecting",
    reconnectAttempt: 0,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const queryClient = useQueryClient();
  
  const connect = useCallback(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    
    ws.onopen = () => {
      setConnection({ status: "connected", reconnectAttempt: 0 });
      
      // Resubscribe to channels
      subscribersRef.current.forEach((_, channel) => {
        ws.send(JSON.stringify({ type: "subscribe", channel }));
      });
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "data") {
        const subscribers = subscribersRef.current.get(message.channel);
        subscribers?.forEach((callback) => callback(message.data));
        
        // Auto-update React Query cache
        if (message.queryKey) {
          queryClient.setQueryData(message.queryKey, message.data);
        }
      }
    };
    
    ws.onclose = () => {
      setConnection((prev) => ({
        status: "disconnected",
        reconnectAttempt: prev.reconnectAttempt + 1,
      }));
      
      // Reconnect with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, connection.reconnectAttempt), 30000);
      setTimeout(connect, delay);
    };
    
    ws.onerror = () => {
      setConnection((prev) => ({ ...prev, status: "error" }));
    };
    
    wsRef.current = ws;
  }, [connection.reconnectAttempt, queryClient]);
  
  useEffect(() => {
    connect();
    
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);
  
  const subscribe = useCallback(
    (channel: string, callback: (data: any) => void) => {
      if (!subscribersRef.current.has(channel)) {
        subscribersRef.current.set(channel, new Set());
        
        // Subscribe via WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "subscribe", channel }));
        }
      }
      
      subscribersRef.current.get(channel)!.add(callback);
      
      // Cleanup
      return () => {
        const subscribers = subscribersRef.current.get(channel);
        subscribers?.delete(callback);
        
        if (subscribers?.size === 0) {
          subscribersRef.current.delete(channel);
          wsRef.current?.send(JSON.stringify({ type: "unsubscribe", channel }));
        }
      };
    },
    []
  );
  
  const publish = useCallback((channel: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "publish", channel, data }));
    }
  }, []);
  
  return (
    <LiveContext.Provider value={{ connection, subscribe, publish }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  const context = useContext(LiveContext);
  if (!context) {
    throw new Error("useLive must be used within a LiveProvider");
  }
  return context;
}
```

### Live Data Hook

```typescript
// hooks/use-live-data.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLive } from "@/lib/live/provider";

interface UseLiveDataOptions<T> {
  channel: string;
  queryKey: string[];
  fetcher: () => Promise<T>;
  merge?: (current: T, update: Partial<T>) => T;
}

export function useLiveData<T>({
  channel,
  queryKey,
  fetcher,
  merge = (current, update) => ({ ...current, ...update }),
}: UseLiveDataOptions<T>) {
  const { subscribe, connection } = useLive();
  const queryClient = useQueryClient();
  
  // Initial data fetch
  const query = useQuery({
    queryKey,
    queryFn: fetcher,
    staleTime: Infinity, // Don't refetch - we get live updates
  });
  
  // Subscribe to live updates
  useEffect(() => {
    const unsubscribe = subscribe(channel, (update) => {
      queryClient.setQueryData<T>(queryKey, (current) => {
        if (!current) return update;
        return merge(current, update);
      });
    });
    
    return unsubscribe;
  }, [channel, queryKey, subscribe, queryClient, merge]);
  
  // Refetch on reconnect
  useEffect(() => {
    if (connection.status === "connected" && connection.reconnectAttempt > 0) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [connection, queryKey, queryClient]);
  
  return {
    ...query,
    isLive: connection.status === "connected",
  };
}

// Usage example: Live dashboard metrics
export function useLiveMetrics() {
  return useLiveData({
    channel: "metrics:dashboard",
    queryKey: ["metrics"],
    fetcher: () => fetch("/api/metrics").then((r) => r.json()),
    merge: (current, update) => ({
      ...current,
      ...update,
      updatedAt: Date.now(),
    }),
  });
}
```

### Live List with Optimistic Updates

```typescript
// hooks/use-live-list.ts
"use client";

import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLive } from "@/lib/live/provider";

interface Item {
  id: string;
  [key: string]: any;
}

interface LiveListUpdate<T extends Item> {
  type: "add" | "update" | "remove";
  item?: T;
  id?: string;
}

export function useLiveList<T extends Item>(
  channel: string,
  queryKey: string[],
  fetcher: () => Promise<T[]>
) {
  const { subscribe, publish } = useLive();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey,
    queryFn: fetcher,
    staleTime: Infinity,
  });
  
  // Subscribe to list updates
  useEffect(() => {
    const unsubscribe = subscribe(channel, (update: LiveListUpdate<T>) => {
      queryClient.setQueryData<T[]>(queryKey, (current = []) => {
        switch (update.type) {
          case "add":
            // Avoid duplicates
            if (current.some((item) => item.id === update.item!.id)) {
              return current;
            }
            return [update.item!, ...current];
          
          case "update":
            return current.map((item) =>
              item.id === update.item!.id ? { ...item, ...update.item } : item
            );
          
          case "remove":
            return current.filter((item) => item.id !== update.id);
          
          default:
            return current;
        }
      });
    });
    
    return unsubscribe;
  }, [channel, queryKey, subscribe, queryClient]);
  
  // Optimistic add mutation
  const addMutation = useMutation({
    mutationFn: async (newItem: Omit<T, "id">) => {
      const res = await fetch(`/api/${channel}`, {
        method: "POST",
        body: JSON.stringify(newItem),
      });
      return res.json();
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey });
      
      const optimisticItem = {
        ...newItem,
        id: `temp-${Date.now()}`,
        _optimistic: true,
      } as T;
      
      queryClient.setQueryData<T[]>(queryKey, (old = []) => [
        optimisticItem,
        ...old,
      ]);
      
      return { optimisticItem };
    },
    onSuccess: (realItem, _, context) => {
      // Replace optimistic item with real one
      queryClient.setQueryData<T[]>(queryKey, (old = []) =>
        old.map((item) =>
          item.id === context?.optimisticItem.id ? realItem : item
        )
      );
    },
    onError: (_, __, context) => {
      // Remove optimistic item on error
      queryClient.setQueryData<T[]>(queryKey, (old = []) =>
        old.filter((item) => item.id !== context?.optimisticItem.id)
      );
    },
  });
  
  // Optimistic update mutation
  const updateMutation = useMutation({
    mutationFn: async (item: Partial<T> & { id: string }) => {
      const res = await fetch(`/api/${channel}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(item),
      });
      return res.json();
    },
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey });
      
      const previousItems = queryClient.getQueryData<T[]>(queryKey);
      
      queryClient.setQueryData<T[]>(queryKey, (old = []) =>
        old.map((item) =>
          item.id === updatedItem.id
            ? { ...item, ...updatedItem, _optimistic: true }
            : item
        )
      );
      
      return { previousItems };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousItems);
    },
  });
  
  // Optimistic remove mutation
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/${channel}/${id}`, { method: "DELETE" });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      
      const previousItems = queryClient.getQueryData<T[]>(queryKey);
      
      queryClient.setQueryData<T[]>(queryKey, (old = []) =>
        old.filter((item) => item.id !== id)
      );
      
      return { previousItems };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousItems);
    },
  });
  
  return {
    items: query.data || [],
    isLoading: query.isLoading,
    add: addMutation.mutate,
    update: updateMutation.mutate,
    remove: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
```

### Live Activity Feed

```typescript
// components/live-activity-feed.tsx
"use client";

import { useLiveList } from "@/hooks/use-live-list";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  message: string;
  actor: { name: string; avatar: string };
  timestamp: string;
  _optimistic?: boolean;
}

export function LiveActivityFeed() {
  const { items: activities, isLoading } = useLiveList<Activity>(
    "activity",
    ["activity-feed"],
    () => fetch("/api/activity").then((r) => r.json())
  );
  
  if (isLoading) {
    return <ActivityFeedSkeleton />;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Activity</h2>
        <LiveIndicator />
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg bg-muted/50",
        activity._optimistic && "opacity-50"
      )}
    >
      <img
        src={activity.actor.avatar}
        alt={activity.actor.name}
        className="h-8 w-8 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.actor.name}</span>{" "}
          {activity.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.timestamp), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}

function LiveIndicator() {
  const { connection } = useLive();
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connection.status === "connected" && "bg-green-500",
          connection.status === "connecting" && "bg-yellow-500 animate-pulse",
          connection.status === "disconnected" && "bg-red-500"
        )}
      />
      {connection.status === "connected" ? "Live" : "Reconnecting..."}
    </div>
  );
}
```

### Server-Side Live Updates API

```typescript
// app/api/live/[channel]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Server-Sent Events for live updates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
) {
  const { channel } = await params;
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const subscriber = redis.duplicate();
      
      await subscriber.subscribe(channel, (message) => {
        const data = `data: ${message}\n\n`;
        controller.enqueue(encoder.encode(data));
      });
      
      // Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 15000);
      
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        subscriber.unsubscribe(channel);
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

// Publish update to channel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
) {
  const { channel } = await params;
  const data = await request.json();
  
  await redis.publish(channel, JSON.stringify(data));
  
  return NextResponse.json({ success: true });
}
```

## Variants

### Delta Sync for Large Datasets

```typescript
// hooks/use-delta-sync.ts
"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DeltaUpdate<T> {
  version: number;
  changes: Array<{
    op: "add" | "update" | "remove";
    path: string;
    value?: T;
  }>;
}

export function useDeltaSync<T>(
  queryKey: string[],
  channel: string,
  initialFetcher: () => Promise<{ data: T; version: number }>
) {
  const versionRef = useRef(0);
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await initialFetcher();
      versionRef.current = result.version;
      return result.data;
    },
  });
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/live/${channel}?version=${versionRef.current}`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data) as DeltaUpdate<T>;
      
      if (update.version !== versionRef.current + 1) {
        // Version mismatch - refetch full data
        queryClient.invalidateQueries({ queryKey });
        return;
      }
      
      versionRef.current = update.version;
      
      // Apply delta changes
      queryClient.setQueryData<T>(queryKey, (current) => {
        let newData = { ...current } as any;
        
        for (const change of update.changes) {
          const pathParts = change.path.split(".");
          let target = newData;
          
          for (let i = 0; i < pathParts.length - 1; i++) {
            target = target[pathParts[i]];
          }
          
          const lastKey = pathParts[pathParts.length - 1];
          
          switch (change.op) {
            case "add":
            case "update":
              target[lastKey] = change.value;
              break;
            case "remove":
              delete target[lastKey];
              break;
          }
        }
        
        return newData;
      });
    };
    
    return () => eventSource.close();
  }, [channel, queryKey, queryClient]);
  
  return query;
}
```

## Anti-patterns

### Not Handling Reconnection

```typescript
// BAD: No reconnection logic
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onclose = () => console.log("Disconnected"); // Just logs!
}, []);

// GOOD: Auto-reconnect with backoff
useEffect(() => {
  let reconnectAttempt = 0;
  
  function connect() {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      reconnectAttempt = 0;
    };
    
    ws.onclose = () => {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
      reconnectAttempt++;
      setTimeout(connect, delay);
    };
  }
  
  connect();
}, []);
```

## Related Skills

- `websockets` - WebSocket connections
- `server-sent-events` - SSE implementation
- `optimistic-updates` - Optimistic UI patterns
- `polling` - Fallback polling

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with delta sync
