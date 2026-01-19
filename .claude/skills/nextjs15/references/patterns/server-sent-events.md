---
id: pt-server-sent-events
name: Server-Sent Events
version: 2.1.0
layer: L5
category: realtime
description: One-way real-time updates from server to client using SSE
tags: [real-time, sse, streaming, next15, react19]
composes: []
dependencies: []
formula: "SSE = ReadableStream + text/event-stream + useEventSource Hook + Heartbeat + Reconnection"
performance:
  impact: medium
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Server-Sent Events

## When to Use

- **One-way updates**: Server pushes to client (no client-to-server needed)
- **Notifications**: Real-time alerts and notifications
- **Progress tracking**: Long-running task updates
- **Live dashboards**: Metrics and data streaming
- **Simple infrastructure**: No WebSocket server needed

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SSE Architecture                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                ┌─────────────────┐    │
│  │  Client Browser │                │   Next.js API   │    │
│  │                 │                │                 │    │
│  │ ┌─────────────┐ │    HTTP GET    │ ┌─────────────┐ │    │
│  │ │ EventSource │ │ ─────────────► │ │ Route       │ │    │
│  │ │             │ │                │ │ Handler     │ │    │
│  │ │ useEvent    │ │ ◄───────────── │ │             │ │    │
│  │ │ Source()    │ │  SSE Stream    │ │ Readable    │ │    │
│  │ └─────────────┘ │                │ │ Stream      │ │    │
│  │       │         │                │ └──────┬──────┘ │    │
│  │       ▼         │                │        │        │    │
│  │ ┌─────────────┐ │                │        ▼        │    │
│  │ │  Callbacks  │ │                │ ┌─────────────┐ │    │
│  │ │  onmessage  │ │                │ │ Redis       │ │    │
│  │ │  onerror    │ │                │ │ Pub/Sub     │ │    │
│  │ │  onopen     │ │                │ └─────────────┘ │    │
│  │ └─────────────┘ │                │                 │    │
│  └─────────────────┘                └─────────────────┘    │
│                                                             │
│  SSE Message Format:                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ event: notification                                  │   │
│  │ data: {"id": "123", "title": "New message"}         │   │
│  │                                                      │   │
│  │ : heartbeat (comment - keeps connection alive)      │   │
│  │                                                      │   │
│  │ data: {"progress": 50, "message": "Processing..."}  │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Server-Sent Events (SSE) provide a simple, efficient way to push updates from server to client over HTTP. Unlike WebSockets, SSE is unidirectional (server to client only) but simpler to implement and works through firewalls and proxies without issues.

## Basic SSE Endpoint

```typescript
// app/api/events/route.ts
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Set up interval for heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
```

## SSE with Real-Time Updates

```typescript
// app/api/notifications/stream/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let isConnected = true;

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE message
      const sendEvent = (event: string, data: any) => {
        if (!isConnected) return;
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial data
      const unreadCount = await prisma.notification.count({
        where: { userId: session.user.id, read: false },
      });
      sendEvent('initial', { unreadCount });

      // Poll for new notifications (in production, use Redis pub/sub)
      let lastCheck = new Date();
      const pollInterval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(pollInterval);
          return;
        }

        try {
          const newNotifications = await prisma.notification.findMany({
            where: {
              userId: session.user.id,
              createdAt: { gt: lastCheck },
            },
            orderBy: { createdAt: 'desc' },
          });

          if (newNotifications.length > 0) {
            for (const notification of newNotifications) {
              sendEvent('notification', notification);
            }
            lastCheck = new Date();
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000);

      // Heartbeat
      const heartbeat = setInterval(() => {
        if (!isConnected) {
          clearInterval(heartbeat);
          return;
        }
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // Cleanup
      request.signal.addEventListener('abort', () => {
        isConnected = false;
        clearInterval(pollInterval);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
```

## Client-Side Hook

```typescript
// hooks/use-event-source.ts
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseEventSourceOptions {
  onOpen?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  events?: Record<string, (data: any) => void>;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useEventSource(url: string, options: UseEventSourceOptions = {}) {
  const {
    onOpen,
    onError,
    onMessage,
    events = {},
    reconnect = true,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
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
      setError(null);
      onOpen?.();
    };

    eventSource.onerror = (e) => {
      setIsConnected(false);
      setError(e);
      onError?.(e);

      if (reconnect) {
        eventSource.close();
        reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
      }
    };

    eventSource.onmessage = (e) => {
      onMessage?.(e);
    };

    // Register custom event handlers
    Object.entries(events).forEach(([event, handler]) => {
      eventSource.addEventListener(event, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          handler(data);
        } catch {
          handler(e.data);
        }
      });
    });
  }, [url, onOpen, onError, onMessage, events, reconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { isConnected, error, disconnect, reconnect: connect };
}

// Usage
// components/notifications-listener.tsx
'use client';

import { useEventSource } from '@/hooks/use-event-source';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationsListener() {
  const queryClient = useQueryClient();

  useEventSource('/api/notifications/stream', {
    events: {
      notification: (data) => {
        toast(data.title, { description: data.message });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
      initial: (data) => {
        console.log('Initial unread count:', data.unreadCount);
      },
    },
    onOpen: () => console.log('SSE connected'),
    onError: () => console.log('SSE disconnected, reconnecting...'),
  });

  return null; // This component just listens
}
```

## SSE with Redis Pub/Sub

```typescript
// lib/redis-pubsub.ts
import { Redis } from 'ioredis';

const publisher = new Redis(process.env.REDIS_URL!);
const subscriber = new Redis(process.env.REDIS_URL!);

export async function publish(channel: string, data: any) {
  await publisher.publish(channel, JSON.stringify(data));
}

export function subscribe(
  channel: string,
  callback: (message: string) => void
) {
  subscriber.subscribe(channel);
  subscriber.on('message', (ch, message) => {
    if (ch === channel) callback(message);
  });

  return () => {
    subscriber.unsubscribe(channel);
  };
}

// app/api/events/[userId]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { subscribe } from '@/lib/redis-pubsub';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await auth();

  if (!session?.user || session.user.id !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Subscribe to user's channel
      const unsubscribe = subscribe(`user:${userId}`, (message) => {
        try {
          const data = JSON.parse(message);
          sendEvent(data.type || 'message', data);
        } catch {
          sendEvent('message', { raw: message });
        }
      });

      // Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // Cleanup
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

// Publishing from Server Actions
// app/actions/notifications.ts
'use server';

import { publish } from '@/lib/redis-pubsub';
import { prisma } from '@/lib/db';

export async function sendNotification(userId: string, notification: {
  title: string;
  message: string;
}) {
  // Save to database
  const saved = await prisma.notification.create({
    data: {
      userId,
      title: notification.title,
      message: notification.message,
    },
  });

  // Publish to SSE
  await publish(`user:${userId}`, {
    type: 'notification',
    ...saved,
  });

  return saved;
}
```

## Live Updates Component

```typescript
// components/live-data.tsx
'use client';

import { useState, useCallback } from 'react';
import { useEventSource } from '@/hooks/use-event-source';
import { Badge } from '@/components/ui/badge';

interface LiveDataProps {
  endpoint: string;
  initialData: any;
}

export function LiveData<T>({ endpoint, initialData }: LiveDataProps) {
  const [data, setData] = useState<T>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleUpdate = useCallback((newData: T) => {
    setData(newData);
    setLastUpdate(new Date());
  }, []);

  const { isConnected } = useEventSource(endpoint, {
    events: {
      update: handleUpdate,
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={isConnected ? 'default' : 'secondary'}>
          {isConnected ? 'Live' : 'Connecting...'}
        </Badge>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
      <pre className="p-4 bg-muted rounded-lg overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
```

## Progress Streaming

```typescript
// app/api/process/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (progress: number, message: string) => {
        const data = JSON.stringify({ progress, message });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        // Simulate long-running task
        sendProgress(0, 'Starting...');

        for (let i = 1; i <= 10; i++) {
          await new Promise((r) => setTimeout(r, 500));
          sendProgress(i * 10, `Processing step ${i} of 10...`);
        }

        sendProgress(100, 'Complete!');
        controller.enqueue(
          encoder.encode(`event: complete\ndata: {"success": true}\n\n`)
        );
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ error: 'Processing failed' })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

// components/progress-tracker.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function ProgressTracker() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startProcess = async () => {
    setIsProcessing(true);
    setProgress(0);
    setMessage('');

    const response = await fetch('/api/process', { method: 'POST' });
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          setProgress(data.progress);
          setMessage(data.message);
        }
        if (line.startsWith('event: complete')) {
          setIsProcessing(false);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <Progress value={progress} />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button onClick={startProcess} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Start Process'}
      </Button>
    </div>
  );
}
```

## Anti-patterns

### Don't Forget Cleanup

```typescript
// BAD - No cleanup on disconnect
const stream = new ReadableStream({
  start(controller) {
    setInterval(() => {
      controller.enqueue(data); // Keeps running after disconnect!
    }, 1000);
  },
});

// GOOD - Clean up on abort
const stream = new ReadableStream({
  start(controller) {
    const interval = setInterval(() => {
      controller.enqueue(data);
    }, 1000);

    request.signal.addEventListener('abort', () => {
      clearInterval(interval);
      controller.close();
    });
  },
});
```

### Don't Skip Heartbeats

```typescript
// BAD - Connection drops without heartbeat
// Proxies and load balancers may close idle connections

// GOOD - Send periodic heartbeats
setInterval(() => {
  controller.enqueue(encoder.encode(': heartbeat\n\n'));
}, 30000);
```

## Related Skills

- [websockets](./websockets.md)
- [polling](./polling.md)
- [streaming](./streaming.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Basic SSE endpoint
- Client-side hook
- Redis pub/sub integration
- Progress streaming
