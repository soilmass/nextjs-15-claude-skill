---
id: pt-real-time-updates
name: Real-Time Updates
version: 1.0.0
layer: L5
category: realtime
description: Implement real-time data updates with WebSockets, SSE, and polling
tags: [realtime, websocket, sse, polling, next15, react19]
composes:
  - ../atoms/feedback-spinner.md
  - ../atoms/display-badge.md
dependencies:
  socket.io: "^4.8.0"
formula: "RealTimeUpdates = WebSocket | SSE | Polling + StateSync + OptimisticUI"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Real-Time Updates

## Overview

Real-time updates keep UI synchronized with server data without manual refresh. This pattern covers WebSockets, Server-Sent Events (SSE), and polling strategies.

## When to Use

- Live dashboards and analytics
- Chat applications
- Collaborative editing
- Stock tickers and live feeds
- Notification systems

## Server-Sent Events (SSE)

```typescript
// app/api/events/route.ts
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Send initial connection event
      sendEvent({ type: 'connected', timestamp: Date.now() });

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        sendEvent({ type: 'heartbeat', timestamp: Date.now() });
      }, 30000);

      // Example: Listen to database changes (pseudo-code)
      const subscription = subscribeToChanges((change) => {
        sendEvent({ type: 'update', data: change });
      });

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        subscription.unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

## SSE Client Hook

```typescript
// hooks/use-event-source.ts
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseEventSourceOptions<T> {
  url: string;
  onMessage?: (data: T) => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
}

export function useEventSource<T>({
  url,
  onMessage,
  onError,
  reconnectInterval = 3000,
}: UseEventSourceOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<T | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        setLastEvent(data);
        onMessage?.(data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      setIsConnected(false);
      onError?.(error);

      // Auto-reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, reconnectInterval);
    };
  }, [url, onMessage, onError, reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    setIsConnected(false);
  }, []);

  return { isConnected, lastEvent, disconnect, reconnect: connect };
}
```

## WebSocket Implementation

```typescript
// lib/websocket/client.ts
'use client';

type MessageHandler = (data: unknown) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          const handlers = this.handlers.get(type);
          handlers?.forEach((handler) => handler(data));
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      this.ws.onclose = () => {
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        reject(error);
      };
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  subscribe(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  send(type: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export const wsClient = new WebSocketClient(
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
);
```

## Polling Hook

```typescript
// hooks/use-polling.ts
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UsePollingOptions<T> {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  interval: number;
  enabled?: boolean;
  onUpdate?: (data: T) => void;
}

export function usePolling<T>({
  queryKey,
  queryFn,
  interval,
  enabled = true,
  onUpdate,
}: UsePollingOptions<T>) {
  const queryClient = useQueryClient();
  const previousDataRef = useRef<T>();

  const query = useQuery({
    queryKey,
    queryFn,
    refetchInterval: enabled ? interval : false,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (query.data && query.data !== previousDataRef.current) {
      previousDataRef.current = query.data;
      onUpdate?.(query.data);
    }
  }, [query.data, onUpdate]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    ...query,
    refetch,
  };
}

// Usage
function LiveStats() {
  const { data, isLoading } = usePolling({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then((r) => r.json()),
    interval: 5000,
    onUpdate: (data) => {
      console.log('Stats updated:', data);
    },
  });

  // ...
}
```

## Live Data Component

```typescript
// components/live-data.tsx
'use client';

import { useState, useEffect } from 'react';
import { useEventSource } from '@/hooks/use-event-source';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LiveDataProps<T> {
  url: string;
  render: (data: T | null) => React.ReactNode;
}

export function LiveData<T>({ url, render }: LiveDataProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  const { isConnected, lastEvent } = useEventSource<{ type: string; data: T }>({
    url,
    onMessage: (event) => {
      if (event.type === 'update') {
        setData(event.data);
        setHasUpdate(true);
        setTimeout(() => setHasUpdate(false), 1000);
      }
    },
  });

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Live' : 'Disconnected'}
        </span>
      </div>

      <div
        className={cn(
          'transition-colors duration-300',
          hasUpdate && 'bg-yellow-50 dark:bg-yellow-900/20'
        )}
      >
        {render(data)}
      </div>
    </div>
  );
}
```

## Optimistic Updates with Real-Time Sync

```typescript
// hooks/use-realtime-mutation.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket/client';

interface UseRealtimeMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: unknown[];
  channel: string;
}

export function useRealtimeMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  channel,
}: UseRealtimeMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = wsClient.subscribe(channel, () => {
      queryClient.invalidateQueries({ queryKey });
    });

    return unsubscribe;
  }, [channel, queryClient, queryKey]);

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
```

## Anti-patterns

### Don't Poll Too Frequently

```typescript
// BAD - 100ms polling
const { data } = useQuery({
  queryKey: ['data'],
  refetchInterval: 100, // Too frequent!
});

// GOOD - Reasonable interval or use SSE/WebSocket
const { data } = useQuery({
  queryKey: ['data'],
  refetchInterval: 5000, // 5 seconds
});
```

## Related Skills

- [presence-indicators](./presence-indicators.md)
- [optimistic-updates](./optimistic-updates.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- SSE and WebSocket support
- Polling hooks
- Optimistic updates
