---
id: pt-cursor-tracking
name: Real-time Cursor Tracking
version: 1.0.0
layer: L5
category: realtime
description: Real-time cursor position tracking for collaborative applications
tags: [realtime, cursor, collaboration, websocket, presence, next15]
composes: []
dependencies: []
formula: "CursorTracking = MouseEvents + WebSocketBroadcast + ThrottledUpdates + CursorRendering"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Real-time Cursor Tracking

## When to Use

- Collaborative document editing
- Shared whiteboards
- Multiplayer design tools
- Real-time collaboration apps
- Interactive presentations

## Composition Diagram

```
Cursor Tracking Flow
====================

+------------------------------------------+
|  Mouse Move Event                        |
|  - Capture x, y coordinates              |
|  - Throttle updates (60fps)              |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  WebSocket Broadcast                     |
|  - Send position to server               |
|  - Receive positions from others         |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Cursor Rendering                        |
|  - Smooth animation                      |
|  - User identification                   |
|  - Cursor labels                         |
+------------------------------------------+
```

## Cursor Tracking Hook

```typescript
// hooks/use-cursor-tracking.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { throttle } from 'lodash-es';

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
}

interface UseCursorTrackingOptions {
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
  throttleMs?: number;
  onCursorsUpdate?: (cursors: Map<string, CursorPosition>) => void;
}

export function useCursorTracking(options: UseCursorTrackingOptions) {
  const {
    roomId,
    userId,
    userName,
    userColor,
    throttleMs = 50,
    onCursorsUpdate,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Connect to WebSocket
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/cursors/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Send join message
      ws.send(JSON.stringify({
        type: 'join',
        userId,
        userName,
        userColor,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'cursor') {
        setCursors((prev) => {
          const next = new Map(prev);
          if (data.userId !== userId) {
            next.set(data.userId, {
              x: data.x,
              y: data.y,
              userId: data.userId,
              userName: data.userName,
              userColor: data.userColor,
            });
          }
          return next;
        });
      }

      if (data.type === 'leave') {
        setCursors((prev) => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
      }
    };

    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, [roomId, userId, userName, userColor]);

  // Notify parent of cursor updates
  useEffect(() => {
    onCursorsUpdate?.(cursors);
  }, [cursors, onCursorsUpdate]);

  // Throttled cursor broadcast
  const broadcastPosition = useCallback(
    throttle((x: number, y: number) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'cursor',
          userId,
          userName,
          userColor,
          x,
          y,
        }));
      }
    }, throttleMs),
    [userId, userName, userColor, throttleMs]
  );

  // Track mouse movement
  const handleMouseMove = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      broadcastPosition(event.clientX, event.clientY);
    },
    [broadcastPosition]
  );

  return {
    cursors,
    isConnected,
    handleMouseMove,
  };
}
```

## Cursor Renderer Component

```typescript
// components/collaboration/cursor-overlay.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
}

interface CursorOverlayProps {
  cursors: Map<string, CursorPosition>;
}

export function CursorOverlay({ cursors }: CursorOverlayProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {Array.from(cursors.values()).map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 500 }}
            style={{
              position: 'absolute',
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <Cursor
              color={cursor.userColor}
              name={cursor.userName}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Cursor({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex flex-col items-start">
      {/* Cursor pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="drop-shadow-md"
      >
        <path
          d="M5.65376 12.4561L2.41688 3.01499C2.15419 2.26047 2.86674 1.54792 3.62126 1.81061L13.0624 5.04749C13.7953 5.30181 13.9229 6.28158 13.2903 6.71445L9.08684 9.59789C8.85009 9.75945 8.67066 9.99255 8.5755 10.2625L6.72122 15.5274C6.44714 16.3068 5.38825 16.3454 5.0596 15.5926L3.64645 12.35C3.58322 12.2037 3.60254 12.0363 3.6973 11.907L5.65376 12.4561Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Name label */}
      <div
        className="px-2 py-0.5 rounded text-xs text-white font-medium whitespace-nowrap mt-1"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}
```

## Collaborative Canvas Component

```typescript
// components/collaboration/collaborative-canvas.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useCursorTracking } from '@/hooks/use-cursor-tracking';
import { CursorOverlay } from './cursor-overlay';

interface CollaborativeCanvasProps {
  roomId: string;
  user: {
    id: string;
    name: string;
    color: string;
  };
  children: React.ReactNode;
}

export function CollaborativeCanvas({ roomId, user, children }: CollaborativeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { cursors, isConnected, handleMouseMove } = useCursorTracking({
    roomId,
    userId: user.id,
    userName: user.name,
    userColor: user.color,
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full"
    >
      {/* Connection indicator */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-muted-foreground">
          {cursors.size} others
        </span>
      </div>

      {children}

      <CursorOverlay cursors={cursors} />
    </div>
  );
}
```

## WebSocket Server Handler

```typescript
// server/cursor-server.ts
import { WebSocketServer, WebSocket } from 'ws';

interface Room {
  clients: Map<string, { ws: WebSocket; user: any }>;
}

const rooms = new Map<string, Room>();

const wss = new WebSocketServer({ port: 3001, path: '/cursors' });

wss.on('connection', (ws, req) => {
  const roomId = req.url?.split('/')[2] || 'default';

  if (!rooms.has(roomId)) {
    rooms.set(roomId, { clients: new Map() });
  }

  const room = rooms.get(roomId)!;
  let userId: string | null = null;

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'join') {
      userId = message.userId;
      room.clients.set(userId, { ws, user: message });

      // Notify others
      broadcast(room, userId, {
        type: 'join',
        userId: message.userId,
        userName: message.userName,
        userColor: message.userColor,
      });
    }

    if (message.type === 'cursor' && userId) {
      // Broadcast cursor position to all other clients
      broadcast(room, userId, message);
    }
  });

  ws.on('close', () => {
    if (userId) {
      room.clients.delete(userId);
      broadcast(room, userId, { type: 'leave', userId });

      if (room.clients.size === 0) {
        rooms.delete(roomId);
      }
    }
  });
});

function broadcast(room: Room, senderId: string, message: any) {
  room.clients.forEach(({ ws }, id) => {
    if (id !== senderId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}
```

## Relative Position Tracking

```typescript
// hooks/use-relative-cursor.ts
'use client';

import { useCallback, RefObject } from 'react';

export function useRelativeCursor(containerRef: RefObject<HTMLElement>) {
  const toRelative = useCallback(
    (x: number, y: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };

      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (x - rect.left) / rect.width,
        y: (y - rect.top) / rect.height,
      };
    },
    [containerRef]
  );

  const toAbsolute = useCallback(
    (x: number, y: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };

      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: x * rect.width + rect.left,
        y: y * rect.height + rect.top,
      };
    },
    [containerRef]
  );

  return { toRelative, toAbsolute };
}
```

## Anti-patterns

### Don't Send Every Mouse Event

```typescript
// BAD - Floods WebSocket
document.onmousemove = (e) => {
  ws.send(JSON.stringify({ x: e.clientX, y: e.clientY }));
};

// GOOD - Throttle updates
const throttledSend = throttle((x, y) => {
  ws.send(JSON.stringify({ x, y }));
}, 50);

document.onmousemove = (e) => {
  throttledSend(e.clientX, e.clientY);
};
```

## Related Skills

- [crdt](./crdt.md)
- [websocket](./websocket.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Throttled broadcasting
- Smooth cursor animation
- Room-based tracking
