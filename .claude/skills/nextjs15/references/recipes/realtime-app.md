---
id: r-realtime-app
name: Real-time Application Recipe
version: 3.0.0
layer: L6
category: recipes
description: Complete recipe for building real-time collaborative applications with Next.js 15
tags: [recipe, realtime, websocket, collaboration, multiplayer, presence]
formula: "RealtimeApp = DashboardLayout(t-dashboard-layout) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + Header(o-header) + Sidebar(o-sidebar) + CollaborativeEditor(o-collaborative-editor) + Tabs(o-tabs) + Modal(o-modal) + DataTable(o-data-table) + Footer(o-footer) + NotificationCenter(o-notification-center) + Breadcrumb(m-breadcrumb) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + PresenceAvatars(m-presence-avatars) + LiveCursors(m-live-cursors) + Toast(m-toast) + Pagination(m-pagination) + SearchInput(m-search-input) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Websocket(pt-websocket) + WebsocketUpdates(pt-websocket-updates) + RealTimeUpdates(pt-real-time-updates) + Crdt(pt-crdt) + ConflictResolution(pt-conflict-resolution) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + PresenceIndicators(pt-presence-indicators) + CursorTracking(pt-cursor-tracking) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + AuditLogging(pt-audit-logging) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + GdprCompliance(pt-gdpr-compliance) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Sorting(pt-sorting) + Pagination(pt-pagination) + Search(pt-search) + WebVitals(pt-web-vitals)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/collaborative-editor.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/data-table.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/presence-avatars.md
  - ../molecules/live-cursors.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Real-time
  - ../patterns/websocket.md
  - ../patterns/websocket-updates.md
  - ../patterns/real-time-updates.md
  - ../patterns/crdt.md
  - ../patterns/conflict-resolution.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Collaboration
  - ../patterns/presence-indicators.md
  - ../patterns/cursor-tracking.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security (Additional)
  - ../patterns/audit-logging.md
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Privacy
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics (Additional)
  - ../patterns/user-analytics.md
  # L3 Organisms - Additional
  - ../organisms/footer.md
  - ../organisms/notification-center.md
  # L2 Molecules - Additional
  - ../molecules/pagination.md
  - ../molecules/search-input.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  - ../patterns/pagination.md
  - ../patterns/search.md
  # L5 Patterns - Performance
  - ../patterns/web-vitals.md
dependencies:
  - next
  - socket.io
  - "@liveblocks/client"
  - pusher
complexity: advanced
estimated_time: 10-20 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Real-time Application Recipe

## Overview

Build real-time collaborative applications with Next.js 15. Includes WebSocket connections, presence indicators, live cursors, collaborative editing, and optimistic updates. Choose between self-hosted (Socket.io) or managed (Liveblocks/Pusher) solutions.

## Architecture

```
app/
├── (app)/                       # Main application
│   ├── layout.tsx              # App layout with providers
│   ├── page.tsx                # Dashboard
│   └── [roomId]/
│       └── page.tsx            # Collaborative room
├── api/
│   ├── socket/
│   │   └── route.ts            # WebSocket endpoint
│   ├── liveblocks-auth/
│   │   └── route.ts            # Liveblocks authentication
│   └── pusher/
│       └── auth/
│           └── route.ts        # Pusher authentication
└── webhooks/
    └── liveblocks/
        └── route.ts            # Liveblocks webhooks

lib/
├── realtime/
│   ├── socket.ts               # Socket.io client
│   ├── liveblocks.ts           # Liveblocks configuration
│   └── pusher.ts               # Pusher configuration
└── store/
    └── collaboration.ts        # Collaborative state
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| collaborative-editor | L4 | Real-time editing |
| presence-avatars | L3 | User presence |
| live-cursors | L3 | Cursor tracking |
| websocket | L5 | Real-time connection |
| optimistic-updates | L5 | Instant feedback |

## Implementation Options

### Option 1: Liveblocks (Recommended for Collaboration)

```typescript
// lib/realtime/liveblocks.ts
import { createClient } from '@liveblocks/client';
import { createRoomContext, createLiveblocksContext } from '@liveblocks/react';

const client = createClient({
  authEndpoint: '/api/liveblocks-auth',
  throttle: 16, // 60fps updates
});

// Define your presence type
type Presence = {
  cursor: { x: number; y: number } | null;
  selection: string[];
  name: string;
  color: string;
};

// Define your storage type
type Storage = {
  document: any; // Y.Doc for Yjs, or custom structure
  shapes: any[]; // For drawing apps
};

// Define user meta
type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
  };
};

// Define room event types
type RoomEvent = {
  type: 'NOTIFICATION';
  message: string;
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useMutation,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useBatch,
    useStatus,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

export const {
  suspense: {
    LiveblocksProvider,
    useInboxNotifications,
    useUnreadInboxNotificationsCount,
  },
} = createLiveblocksContext(client);
```

```typescript
// app/api/liveblocks-auth/route.ts
import { Liveblocks } from '@liveblocks/node';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { room } = await request.json();

  // Verify user has access to this room
  // Add your authorization logic here

  const liveblocksSession = liveblocks.prepareSession(session.user.id, {
    userInfo: {
      name: session.user.name || 'Anonymous',
      avatar: session.user.image || '',
      color: generateUserColor(session.user.id),
    },
  });

  // Allow access to the room
  liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS);

  const { status, body } = await liveblocksSession.authorize();
  return new NextResponse(body, { status });
}

function generateUserColor(userId: string): string {
  const colors = [
    '#E57373', '#F06292', '#BA68C8', '#9575CD',
    '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1',
    '#4DB6AC', '#81C784', '#AED581', '#DCE775',
  ];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
```

### Collaborative Room Component

```tsx
// app/(app)/[roomId]/page.tsx
'use client';

import { Suspense, use } from 'react';
import { ClientSideSuspense } from '@liveblocks/react';
import { RoomProvider } from '@/lib/realtime/liveblocks';
import { CollaborativeEditor } from '@/components/realtime/collaborative-editor';
import { Presence } from '@/components/realtime/presence';
import { LiveCursors } from '@/components/realtime/live-cursors';
import { Toolbar } from '@/components/realtime/toolbar';
import { Loading } from '@/components/ui/loading';

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params);

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selection: [],
        name: '',
        color: '',
      }}
      initialStorage={{
        document: null,
        shapes: [],
      }}
    >
      <ClientSideSuspense fallback={<Loading />}>
        <div className="relative h-screen w-full overflow-hidden">
          {/* Presence indicators */}
          <div className="absolute right-4 top-4 z-50">
            <Presence />
          </div>

          {/* Toolbar */}
          <div className="absolute left-4 top-4 z-50">
            <Toolbar />
          </div>

          {/* Main collaborative area */}
          <div className="h-full w-full">
            <LiveCursors>
              <CollaborativeEditor />
            </LiveCursors>
          </div>
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
}
```

### Live Cursors Component

```tsx
// components/realtime/live-cursors.tsx
'use client';

import * as React from 'react';
import { useOthers, useUpdateMyPresence } from '@/lib/realtime/liveblocks';
import { cn } from '@/lib/utils';

interface LiveCursorsProps {
  children: React.ReactNode;
}

export function LiveCursors({ children }: LiveCursorsProps) {
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      updateMyPresence({
        cursor: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      });
    },
    [updateMyPresence]
  );

  const handlePointerLeave = React.useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  return (
    <div
      className="relative h-full w-full"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}

      {/* Render other users' cursors */}
      {others.map(({ connectionId, presence, info }) => {
        if (!presence?.cursor) return null;

        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            name={info?.name || 'Anonymous'}
            color={info?.color || '#000'}
          />
        );
      })}
    </div>
  );
}

interface CursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
}

function Cursor({ x, y, name, color }: CursorProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-50"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        style={{ transform: 'translate(-4px, -4px)' }}
      >
        <path
          d="M5.65376 12.4563L0.169067 1.82123C-0.0908539 1.24535 0.408559 0.622609 1.03569 0.775006L21.7323 5.67568C22.3626 5.82906 22.5705 6.63062 22.1058 7.09528L15.9399 13.2612C15.7403 13.4608 15.6052 13.7156 15.5527 13.9925L13.8053 23.3251C13.6837 23.9665 12.9145 24.2392 12.4423 23.7669L5.65376 16.9784C5.27749 16.6021 5.11727 16.0614 5.22611 15.5389L5.65376 12.4563Z"
          fill={color}
        />
      </svg>

      {/* Name label */}
      <div
        className="absolute left-4 top-4 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}
```

### Presence Avatars

```tsx
// components/realtime/presence.tsx
'use client';

import * as React from 'react';
import { useOthers, useSelf } from '@/lib/realtime/liveblocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const MAX_SHOWN_USERS = 5;

export function Presence() {
  const self = useSelf();
  const others = useOthers();
  
  const hasMoreUsers = others.length > MAX_SHOWN_USERS;
  const visibleOthers = others.slice(0, MAX_SHOWN_USERS);

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {/* Current user */}
        {self && (
          <Tooltip>
            <TooltipTrigger>
              <Avatar
                className="h-8 w-8 border-2"
                style={{ borderColor: self.info?.color }}
              >
                <AvatarImage src={self.info?.avatar} />
                <AvatarFallback
                  style={{ backgroundColor: self.info?.color }}
                  className="text-xs text-white"
                >
                  {self.info?.name?.[0] || 'Y'}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              {self.info?.name || 'You'} (you)
            </TooltipContent>
          </Tooltip>
        )}

        {/* Other users */}
        {visibleOthers.map(({ connectionId, info }) => (
          <Tooltip key={connectionId}>
            <TooltipTrigger>
              <Avatar
                className="h-8 w-8 border-2"
                style={{ borderColor: info?.color }}
              >
                <AvatarImage src={info?.avatar} />
                <AvatarFallback
                  style={{ backgroundColor: info?.color }}
                  className="text-xs text-white"
                >
                  {info?.name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{info?.name || 'Anonymous'}</TooltipContent>
          </Tooltip>
        ))}

        {/* More users indicator */}
        {hasMoreUsers && (
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 border-2 border-muted">
                <AvatarFallback className="bg-muted text-xs">
                  +{others.length - MAX_SHOWN_USERS}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              {others.length - MAX_SHOWN_USERS} more users
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
```

### Option 2: Socket.io (Self-Hosted)

```typescript
// lib/realtime/socket-server.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ServerToClientEvents {
  'user:joined': (data: { userId: string; name: string; color: string }) => void;
  'user:left': (data: { userId: string }) => void;
  'cursor:update': (data: { userId: string; x: number; y: number }) => void;
  'document:update': (data: { operations: any[]; userId: string }) => void;
  'presence:sync': (data: { users: any[] }) => void;
  'message': (data: { userId: string; content: string; timestamp: number }) => void;
}

interface ClientToServerEvents {
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
  'cursor:move': (data: { x: number; y: number }) => void;
  'document:change': (data: { operations: any[] }) => void;
  'message:send': (data: { content: string }) => void;
}

interface SocketData {
  userId: string;
  userName: string;
  userColor: string;
  roomId?: string;
}

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const session = await auth();
      if (!session?.user) {
        return next(new Error('Unauthorized'));
      }
      
      socket.data.userId = session.user.id;
      socket.data.userName = session.user.name || 'Anonymous';
      socket.data.userColor = generateColor(session.user.id);
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    // Join room
    socket.on('room:join', async (roomId) => {
      // Verify access
      const hasAccess = await checkRoomAccess(socket.data.userId, roomId);
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      socket.data.roomId = roomId;
      socket.join(roomId);

      // Notify others
      socket.to(roomId).emit('user:joined', {
        userId: socket.data.userId,
        name: socket.data.userName,
        color: socket.data.userColor,
      });

      // Send current presence
      const sockets = await io.in(roomId).fetchSockets();
      const users = sockets.map((s) => ({
        userId: s.data.userId,
        name: s.data.userName,
        color: s.data.userColor,
      }));
      socket.emit('presence:sync', { users });
    });

    // Leave room
    socket.on('room:leave', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user:left', { userId: socket.data.userId });
    });

    // Cursor movement
    socket.on('cursor:move', ({ x, y }) => {
      if (socket.data.roomId) {
        socket.to(socket.data.roomId).emit('cursor:update', {
          userId: socket.data.userId,
          x,
          y,
        });
      }
    });

    // Document changes
    socket.on('document:change', ({ operations }) => {
      if (socket.data.roomId) {
        socket.to(socket.data.roomId).emit('document:update', {
          operations,
          userId: socket.data.userId,
        });
      }
    });

    // Messages
    socket.on('message:send', async ({ content }) => {
      if (socket.data.roomId) {
        // Store message
        await prisma.message.create({
          data: {
            roomId: socket.data.roomId,
            userId: socket.data.userId,
            content,
          },
        });

        io.to(socket.data.roomId).emit('message', {
          userId: socket.data.userId,
          content,
          timestamp: Date.now(),
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.data.roomId) {
        socket.to(socket.data.roomId).emit('user:left', {
          userId: socket.data.userId,
        });
      }
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
}

async function checkRoomAccess(userId: string, roomId: string): Promise<boolean> {
  const membership = await prisma.roomMember.findFirst({
    where: { userId, roomId },
  });
  return !!membership;
}

function generateColor(userId: string): string {
  const colors = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
```

### Option 3: Pusher (Managed WebSockets)

```typescript
// lib/realtime/pusher.ts
import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
    authTransport: 'ajax',
    auth: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  }
);
```

```tsx
// hooks/use-pusher-presence.ts
'use client';

import * as React from 'react';
import { pusherClient } from '@/lib/realtime/pusher';
import type { Channel, PresenceChannel, Members } from 'pusher-js';

interface Member {
  id: string;
  info: {
    name: string;
    avatar?: string;
    color: string;
  };
}

export function usePusherPresence(channelName: string) {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [me, setMe] = React.useState<Member | null>(null);
  const channelRef = React.useRef<PresenceChannel | null>(null);

  React.useEffect(() => {
    const channel = pusherClient.subscribe(channelName) as PresenceChannel;
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', (members: Members) => {
      const memberList: Member[] = [];
      members.each((member: Member) => memberList.push(member));
      setMembers(memberList);
      setMe(members.me as Member);
    });

    channel.bind('pusher:member_added', (member: Member) => {
      setMembers((prev) => [...prev, member]);
    });

    channel.bind('pusher:member_removed', (member: Member) => {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName]);

  const trigger = React.useCallback((event: string, data: any) => {
    channelRef.current?.trigger(event, data);
  }, []);

  const bind = React.useCallback((event: string, callback: (data: any) => void) => {
    channelRef.current?.bind(event, callback);
    return () => channelRef.current?.unbind(event, callback);
  }, []);

  return { members, me, trigger, bind };
}
```

## Optimistic Updates Pattern

```tsx
// hooks/use-optimistic-mutation.ts
'use client';

import * as React from 'react';
import { useMutation } from '@/lib/realtime/liveblocks';

export function useOptimisticUpdate<T>(
  key: string,
  serverAction: (data: T) => Promise<void>
) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  const mutate = useMutation(
    ({ storage, self }, data: T) => {
      // Optimistic update
      const list = storage.get(key);
      const optimisticItem = {
        ...data,
        id: `temp-${Date.now()}`,
        createdBy: self.id,
        pending: true,
      };
      list.push(optimisticItem);
      
      return optimisticItem;
    },
    []
  );

  const execute = React.useCallback(
    async (data: T) => {
      setPending(true);
      setError(null);
      
      // Apply optimistic update
      const optimisticItem = mutate(data);
      
      try {
        // Sync with server
        await serverAction(data);
      } catch (err) {
        setError(err as Error);
        // Rollback would happen here
      } finally {
        setPending(false);
      }
    },
    [mutate, serverAction]
  );

  return { execute, pending, error };
}
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npm install -D msw @mswjs/data
npx playwright install
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/e2e/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({ roomId: 'test-room-123' }),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// MSW server setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mock WebSocket Server

```typescript
// tests/mocks/websocket.ts
import { vi } from 'vitest';

export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private messageQueue: any[] = [];

  constructor(public url: string, public protocols?: string | string[]) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send = vi.fn((data: string | ArrayBuffer) => {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.messageQueue.push(JSON.parse(data as string));
  });

  close = vi.fn((code?: number, reason?: string) => {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.onclose?.(new CloseEvent('close', { code: code || 1000, reason }));
    }, 0);
  });

  // Test helpers
  simulateMessage(data: any) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }

  simulateError(error: Error) {
    this.onerror?.(new ErrorEvent('error', { error }));
  }

  getLastMessage() {
    return this.messageQueue[this.messageQueue.length - 1];
  }

  getAllMessages() {
    return this.messageQueue;
  }
}

// Mock global WebSocket
export function mockWebSocket() {
  const originalWebSocket = global.WebSocket;
  let mockInstance: MockWebSocket | null = null;

  (global as any).WebSocket = class extends MockWebSocket {
    constructor(url: string, protocols?: string | string[]) {
      super(url, protocols);
      mockInstance = this;
    }
  };

  return {
    getInstance: () => mockInstance,
    restore: () => {
      global.WebSocket = originalWebSocket;
    },
  };
}
```

### Mock Liveblocks

```typescript
// tests/mocks/liveblocks.tsx
import { vi } from 'vitest';
import { ReactNode, createContext, useContext, useState, useCallback } from 'react';

interface MockPresence {
  cursor: { x: number; y: number } | null;
  selection: string[];
  name: string;
  color: string;
}

interface MockUser {
  connectionId: number;
  id: string;
  info: { name: string; avatar: string; color: string };
  presence: MockPresence;
}

interface LiveblocksContextValue {
  self: MockUser | null;
  others: MockUser[];
  presence: MockPresence;
  updatePresence: (updates: Partial<MockPresence>) => void;
  broadcastEvent: (event: any) => void;
  storage: Map<string, any>;
  addUser: (user: MockUser) => void;
  removeUser: (connectionId: number) => void;
}

const LiveblocksContext = createContext<LiveblocksContextValue | null>(null);

export function MockRoomProvider({
  children,
  initialPresence,
  initialStorage,
}: {
  children: ReactNode;
  initialPresence?: Partial<MockPresence>;
  initialStorage?: Record<string, any>;
}) {
  const [self] = useState<MockUser>({
    connectionId: 1,
    id: 'user-1',
    info: { name: 'Test User', avatar: '', color: '#E57373' },
    presence: {
      cursor: null,
      selection: [],
      name: 'Test User',
      color: '#E57373',
      ...initialPresence,
    },
  });

  const [others, setOthers] = useState<MockUser[]>([]);
  const [presence, setPresence] = useState<MockPresence>(self.presence);
  const [storage] = useState(new Map(Object.entries(initialStorage || {})));

  const updatePresence = useCallback((updates: Partial<MockPresence>) => {
    setPresence((prev) => ({ ...prev, ...updates }));
  }, []);

  const broadcastEvent = vi.fn();

  const addUser = useCallback((user: MockUser) => {
    setOthers((prev) => [...prev, user]);
  }, []);

  const removeUser = useCallback((connectionId: number) => {
    setOthers((prev) => prev.filter((u) => u.connectionId !== connectionId));
  }, []);

  return (
    <LiveblocksContext.Provider
      value={{
        self,
        others,
        presence,
        updatePresence,
        broadcastEvent,
        storage,
        addUser,
        removeUser,
      }}
    >
      {children}
    </LiveblocksContext.Provider>
  );
}

// Mock hooks
export const useRoom = vi.fn(() => ({
  id: 'test-room',
  getConnectionState: () => 'open',
}));

export const useSelf = () => {
  const context = useContext(LiveblocksContext);
  return context?.self || null;
};

export const useOthers = () => {
  const context = useContext(LiveblocksContext);
  return context?.others || [];
};

export const useMyPresence = () => {
  const context = useContext(LiveblocksContext);
  return [context?.presence, context?.updatePresence] as const;
};

export const useUpdateMyPresence = () => {
  const context = useContext(LiveblocksContext);
  return context?.updatePresence || vi.fn();
};

export const useBroadcastEvent = () => {
  const context = useContext(LiveblocksContext);
  return context?.broadcastEvent || vi.fn();
};

export const useStorage = (selector: (root: any) => any) => {
  const context = useContext(LiveblocksContext);
  return selector({ get: (key: string) => context?.storage.get(key) });
};

export const useMutation = (callback: any, deps: any[]) => {
  const context = useContext(LiveblocksContext);
  return useCallback(
    (...args: any[]) => callback({ storage: context?.storage, self: context?.self }, ...args),
    deps
  );
};

export const useStatus = () => 'connected';
export const useHistory = () => ({ undo: vi.fn(), redo: vi.fn(), pause: vi.fn(), resume: vi.fn() });
export const useUndo = () => vi.fn();
export const useRedo = () => vi.fn();
export const useCanUndo = () => true;
export const useCanRedo = () => true;

// Helper to get mock context for test assertions
export const useLiveblocksContext = () => useContext(LiveblocksContext);
```

### MSW Handlers for Real-time APIs

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  // Liveblocks auth endpoint
  http.post('/api/liveblocks-auth', async ({ request }) => {
    const { room } = await request.json() as { room: string };
    
    await delay(50);
    
    // Simulate unauthorized access
    if (room === 'private-room') {
      return HttpResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return HttpResponse.json({
      token: 'mock-liveblocks-token',
    });
  }),

  // Pusher auth endpoint
  http.post('/api/pusher/auth', async ({ request }) => {
    const formData = await request.formData();
    const channelName = formData.get('channel_name');
    const socketId = formData.get('socket_id');
    
    await delay(50);
    
    // Simulate presence channel auth
    if (channelName?.toString().startsWith('presence-')) {
      return HttpResponse.json({
        auth: `mock-pusher-auth-${socketId}`,
        channel_data: JSON.stringify({
          user_id: 'user-123',
          user_info: { name: 'Test User', color: '#E57373' },
        }),
      });
    }
    
    return HttpResponse.json({
      auth: `mock-pusher-auth-${socketId}`,
    });
  }),

  // Room management endpoints
  http.get('/api/rooms', async () => {
    await delay(100);
    return HttpResponse.json([
      { id: 'room-1', name: 'Design Session', participants: 3, createdAt: '2025-01-15T10:00:00Z' },
      { id: 'room-2', name: 'Brainstorm', participants: 5, createdAt: '2025-01-16T14:00:00Z' },
    ]);
  }),

  http.post('/api/rooms', async ({ request }) => {
    const body = await request.json() as { name: string };
    await delay(100);
    return HttpResponse.json(
      { id: 'new-room-123', name: body.name, participants: 1, createdAt: new Date().toISOString() },
      { status: 201 }
    );
  }),

  http.get('/api/rooms/:roomId', async ({ params }) => {
    const { roomId } = params;
    
    if (roomId === 'not-found') {
      return HttpResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    await delay(50);
    return HttpResponse.json({
      id: roomId,
      name: 'Test Room',
      participants: [
        { id: 'user-1', name: 'Alice', color: '#E57373' },
        { id: 'user-2', name: 'Bob', color: '#64B5F6' },
      ],
      createdAt: '2025-01-15T10:00:00Z',
    });
  }),

  http.delete('/api/rooms/:roomId', async ({ params }) => {
    const { roomId } = params;
    await delay(50);
    
    if (roomId === 'protected-room') {
      return HttpResponse.json(
        { error: 'Cannot delete protected room' },
        { status: 403 }
      );
    }
    
    return new HttpResponse(null, { status: 204 });
  }),

  // WebSocket webhook for Liveblocks
  http.post('/webhooks/liveblocks', async ({ request }) => {
    const body = await request.json() as { type: string };
    
    // Validate webhook signature (in real implementation)
    const signature = request.headers.get('webhook-signature');
    if (!signature) {
      return HttpResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }
    
    // Process webhook events
    switch (body.type) {
      case 'roomCreated':
      case 'roomDeleted':
      case 'userEntered':
      case 'userLeft':
      case 'storageUpdated':
        return HttpResponse.json({ received: true });
      default:
        return HttpResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }
  }),

  // Health check
  http.get('/api/health', async () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        websocket: 'up',
        redis: 'up',
      },
    });
  }),
];
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Unit Tests

```typescript
// tests/unit/live-cursors.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiveCursors } from '@/components/realtime/live-cursors';
import { MockRoomProvider, useLiveblocksContext } from '../mocks/liveblocks';

// Mock the liveblocks import
vi.mock('@/lib/realtime/liveblocks', () => ({
  useOthers: () => {
    const context = useLiveblocksContext();
    return context?.others || [];
  },
  useUpdateMyPresence: () => {
    const context = useLiveblocksContext();
    return context?.updatePresence || vi.fn();
  },
}));

describe('LiveCursors', () => {
  it('renders children correctly', () => {
    render(
      <MockRoomProvider>
        <LiveCursors>
          <div data-testid="content">Content</div>
        </LiveCursors>
      </MockRoomProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('updates presence on pointer move', () => {
    const updatePresence = vi.fn();
    vi.mocked(useUpdateMyPresence).mockReturnValue(updatePresence);

    render(
      <MockRoomProvider>
        <LiveCursors>
          <div>Content</div>
        </LiveCursors>
      </MockRoomProvider>
    );

    const container = screen.getByRole('generic');
    fireEvent.pointerMove(container, { clientX: 100, clientY: 200 });

    // Presence should be updated with cursor position
    expect(updatePresence).toHaveBeenCalled();
  });

  it('clears cursor on pointer leave', () => {
    const updatePresence = vi.fn();
    vi.mocked(useUpdateMyPresence).mockReturnValue(updatePresence);

    render(
      <MockRoomProvider>
        <LiveCursors>
          <div>Content</div>
        </LiveCursors>
      </MockRoomProvider>
    );

    const container = screen.getByRole('generic');
    fireEvent.pointerLeave(container);

    expect(updatePresence).toHaveBeenCalledWith({ cursor: null });
  });

  it('renders other users cursors', () => {
    render(
      <MockRoomProvider>
        <LiveCursors>
          <div>Content</div>
        </LiveCursors>
      </MockRoomProvider>
    );

    // Add another user with cursor
    const context = useLiveblocksContext();
    context?.addUser({
      connectionId: 2,
      id: 'user-2',
      info: { name: 'Alice', avatar: '', color: '#64B5F6' },
      presence: { cursor: { x: 150, y: 250 }, selection: [], name: 'Alice', color: '#64B5F6' },
    });

    // Should render Alice's cursor with her name
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('does not render cursor for users without cursor position', () => {
    render(
      <MockRoomProvider>
        <LiveCursors>
          <div>Content</div>
        </LiveCursors>
      </MockRoomProvider>
    );

    const context = useLiveblocksContext();
    context?.addUser({
      connectionId: 2,
      id: 'user-2',
      info: { name: 'Bob', avatar: '', color: '#81C784' },
      presence: { cursor: null, selection: [], name: 'Bob', color: '#81C784' },
    });

    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });
});
```

```typescript
// tests/unit/presence.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Presence } from '@/components/realtime/presence';
import { MockRoomProvider, useLiveblocksContext } from '../mocks/liveblocks';

vi.mock('@/lib/realtime/liveblocks', () => ({
  useSelf: () => {
    const context = useLiveblocksContext();
    return context?.self || null;
  },
  useOthers: () => {
    const context = useLiveblocksContext();
    return context?.others || [];
  },
}));

describe('Presence', () => {
  it('renders current user avatar', () => {
    render(
      <MockRoomProvider>
        <Presence />
      </MockRoomProvider>
    );

    // Self user should be visible
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test User"
  });

  it('renders other users avatars', () => {
    render(
      <MockRoomProvider>
        <Presence />
      </MockRoomProvider>
    );

    const context = useLiveblocksContext();
    context?.addUser({
      connectionId: 2,
      id: 'user-2',
      info: { name: 'Alice', avatar: '', color: '#64B5F6' },
      presence: { cursor: null, selection: [], name: 'Alice', color: '#64B5F6' },
    });

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows overflow indicator when many users', () => {
    render(
      <MockRoomProvider>
        <Presence />
      </MockRoomProvider>
    );

    const context = useLiveblocksContext();
    
    // Add more than MAX_SHOWN_USERS (5) users
    for (let i = 2; i <= 8; i++) {
      context?.addUser({
        connectionId: i,
        id: `user-${i}`,
        info: { name: `User ${i}`, avatar: '', color: '#E57373' },
        presence: { cursor: null, selection: [], name: `User ${i}`, color: '#E57373' },
      });
    }

    // Should show "+X more users" indicator
    expect(screen.getByText(/\+\d+/)).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(
      <MockRoomProvider>
        <Presence />
      </MockRoomProvider>
    );

    // Hover over avatar to show tooltip
    const avatar = screen.getByText('T');
    fireEvent.mouseEnter(avatar);

    // Tooltip should show "(you)"
    await waitFor(() => {
      expect(screen.getByText(/\(you\)/)).toBeInTheDocument();
    });
  });
});
```

```typescript
// tests/unit/websocket-connection.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockWebSocket, MockWebSocket } from '../mocks/websocket';

describe('WebSocket Connection', () => {
  let wsMock: ReturnType<typeof mockWebSocket>;

  beforeEach(() => {
    wsMock = mockWebSocket();
  });

  afterEach(() => {
    wsMock.restore();
  });

  it('establishes connection', async () => {
    const ws = new WebSocket('ws://localhost:3001');
    
    await vi.waitFor(() => {
      expect(ws.readyState).toBe(MockWebSocket.OPEN);
    });
  });

  it('sends messages when connected', async () => {
    const ws = new WebSocket('ws://localhost:3001');
    
    await vi.waitFor(() => {
      expect(ws.readyState).toBe(MockWebSocket.OPEN);
    });

    ws.send(JSON.stringify({ type: 'join', roomId: 'room-123' }));
    
    const instance = wsMock.getInstance();
    expect(instance?.getLastMessage()).toEqual({ type: 'join', roomId: 'room-123' });
  });

  it('throws error when sending on closed connection', () => {
    const ws = new WebSocket('ws://localhost:3001');
    
    // Connection is still CONNECTING, not OPEN
    expect(() => {
      ws.send(JSON.stringify({ type: 'ping' }));
    }).toThrow('WebSocket is not open');
  });

  it('handles incoming messages', async () => {
    const onMessage = vi.fn();
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = onMessage;
    
    await vi.waitFor(() => {
      expect(ws.readyState).toBe(MockWebSocket.OPEN);
    });

    wsMock.getInstance()?.simulateMessage({ type: 'user:joined', userId: 'user-456' });
    
    expect(onMessage).toHaveBeenCalled();
    const event = onMessage.mock.calls[0][0];
    expect(JSON.parse(event.data)).toEqual({ type: 'user:joined', userId: 'user-456' });
  });

  it('handles connection errors', async () => {
    const onError = vi.fn();
    const ws = new WebSocket('ws://localhost:3001');
    ws.onerror = onError;
    
    await vi.waitFor(() => {
      expect(ws.readyState).toBe(MockWebSocket.OPEN);
    });

    wsMock.getInstance()?.simulateError(new Error('Connection lost'));
    
    expect(onError).toHaveBeenCalled();
  });

  it('handles graceful close', async () => {
    const onClose = vi.fn();
    const ws = new WebSocket('ws://localhost:3001');
    ws.onclose = onClose;
    
    await vi.waitFor(() => {
      expect(ws.readyState).toBe(MockWebSocket.OPEN);
    });

    ws.close(1000, 'Normal closure');
    
    await vi.waitFor(() => {
      expect(ws.readyState).toBe(MockWebSocket.CLOSED);
    });
    
    expect(onClose).toHaveBeenCalled();
    expect(onClose.mock.calls[0][0].code).toBe(1000);
  });
});
```

```typescript
// tests/unit/optimistic-updates.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticUpdate } from '@/hooks/use-optimistic-mutation';
import { MockRoomProvider } from '../mocks/liveblocks';

describe('useOptimisticUpdate', () => {
  it('applies optimistic update immediately', async () => {
    const serverAction = vi.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(
      () => useOptimisticUpdate('items', serverAction),
      { wrapper: MockRoomProvider }
    );

    await act(async () => {
      result.current.execute({ name: 'New Item' });
    });

    // Should show pending state
    expect(result.current.pending).toBe(true);
  });

  it('calls server action after optimistic update', async () => {
    const serverAction = vi.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(
      () => useOptimisticUpdate('items', serverAction),
      { wrapper: MockRoomProvider }
    );

    await act(async () => {
      await result.current.execute({ name: 'New Item' });
    });

    expect(serverAction).toHaveBeenCalledWith({ name: 'New Item' });
  });

  it('handles server action failure', async () => {
    const serverAction = vi.fn().mockRejectedValue(new Error('Server error'));
    
    const { result } = renderHook(
      () => useOptimisticUpdate('items', serverAction),
      { wrapper: MockRoomProvider }
    );

    await act(async () => {
      await result.current.execute({ name: 'New Item' });
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Server error');
    expect(result.current.pending).toBe(false);
  });

  it('clears error on successful retry', async () => {
    const serverAction = vi.fn()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce(undefined);
    
    const { result } = renderHook(
      () => useOptimisticUpdate('items', serverAction),
      { wrapper: MockRoomProvider }
    );

    // First attempt fails
    await act(async () => {
      await result.current.execute({ name: 'Item' });
    });
    expect(result.current.error).toBeTruthy();

    // Retry succeeds
    await act(async () => {
      await result.current.execute({ name: 'Item' });
    });
    expect(result.current.error).toBeNull();
  });
});
```

```typescript
// tests/unit/cursor-position.test.ts
import { describe, it, expect } from 'vitest';

// Utility function for cursor position calculations
function calculateRelativePosition(
  clientX: number,
  clientY: number,
  rect: DOMRect
): { x: number; y: number } {
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function isWithinBounds(
  position: { x: number; y: number },
  width: number,
  height: number
): boolean {
  return position.x >= 0 && position.x <= width && position.y >= 0 && position.y <= height;
}

describe('Cursor Position Utilities', () => {
  const mockRect: DOMRect = {
    left: 100,
    top: 50,
    right: 500,
    bottom: 450,
    width: 400,
    height: 400,
    x: 100,
    y: 50,
    toJSON: () => ({}),
  };

  it('calculates relative position correctly', () => {
    const result = calculateRelativePosition(200, 150, mockRect);
    expect(result).toEqual({ x: 100, y: 100 });
  });

  it('handles positions at origin', () => {
    const result = calculateRelativePosition(100, 50, mockRect);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('handles positions outside container (negative)', () => {
    const result = calculateRelativePosition(50, 25, mockRect);
    expect(result).toEqual({ x: -50, y: -25 });
  });

  it('validates within bounds - inside', () => {
    expect(isWithinBounds({ x: 200, y: 200 }, 400, 400)).toBe(true);
  });

  it('validates within bounds - on edge', () => {
    expect(isWithinBounds({ x: 0, y: 0 }, 400, 400)).toBe(true);
    expect(isWithinBounds({ x: 400, y: 400 }, 400, 400)).toBe(true);
  });

  it('validates within bounds - outside', () => {
    expect(isWithinBounds({ x: -1, y: 200 }, 400, 400)).toBe(false);
    expect(isWithinBounds({ x: 401, y: 200 }, 400, 400)).toBe(false);
  });
});
```

### Integration Tests

```typescript
// tests/integration/room-collaboration.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RoomPage from '@/app/(app)/[roomId]/page';
import { MockRoomProvider, useLiveblocksContext } from '../mocks/liveblocks';

// Wrap with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MockRoomProvider>{children}</MockRoomProvider>
    </QueryClientProvider>
  );
};

describe('Room Collaboration Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads room and displays presence', async () => {
    render(<RoomPage params={Promise.resolve({ roomId: 'test-room' })} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      // Should show current user's presence
      expect(screen.getByText('T')).toBeInTheDocument(); // Test User initial
    });
  });

  it('shows other users when they join', async () => {
    render(<RoomPage params={Promise.resolve({ roomId: 'test-room' })} />, {
      wrapper: createWrapper(),
    });

    // Simulate another user joining
    const context = useLiveblocksContext();
    context?.addUser({
      connectionId: 2,
      id: 'user-2',
      info: { name: 'Alice', avatar: '', color: '#64B5F6' },
      presence: { cursor: { x: 100, y: 100 }, selection: [], name: 'Alice', color: '#64B5F6' },
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('removes user presence when they leave', async () => {
    render(<RoomPage params={Promise.resolve({ roomId: 'test-room' })} />, {
      wrapper: createWrapper(),
    });

    const context = useLiveblocksContext();
    
    // User joins
    context?.addUser({
      connectionId: 2,
      id: 'user-2',
      info: { name: 'Bob', avatar: '', color: '#81C784' },
      presence: { cursor: { x: 50, y: 50 }, selection: [], name: 'Bob', color: '#81C784' },
    });

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    // User leaves
    context?.removeUser(2);

    await waitFor(() => {
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
  });

  it('updates cursor position on mouse move', async () => {
    const updatePresence = vi.fn();
    
    render(<RoomPage params={Promise.resolve({ roomId: 'test-room' })} />, {
      wrapper: createWrapper(),
    });

    const canvas = screen.getByTestId('collaboration-canvas');
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 300 });

    // Presence should be updated with cursor position
    await waitFor(() => {
      expect(updatePresence).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
        })
      );
    });
  });

  it('broadcasts events to other users', async () => {
    const user = userEvent.setup();
    const broadcastEvent = vi.fn();
    
    render(<RoomPage params={Promise.resolve({ roomId: 'test-room' })} />, {
      wrapper: createWrapper(),
    });

    // Trigger an action that broadcasts an event
    const actionButton = screen.getByRole('button', { name: /notify/i });
    await user.click(actionButton);

    expect(broadcastEvent).toHaveBeenCalledWith({
      type: 'NOTIFICATION',
      message: expect.any(String),
    });
  });
});
```

```typescript
// tests/integration/reconnection.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockWebSocket, MockWebSocket } from '../mocks/websocket';

describe('WebSocket Reconnection', () => {
  let wsMock: ReturnType<typeof mockWebSocket>;
  let reconnectAttempts: number;
  let connectionState: 'connected' | 'disconnected' | 'reconnecting';

  function createReconnectingSocket(url: string, maxRetries = 3) {
    reconnectAttempts = 0;
    connectionState = 'disconnected';
    
    function connect() {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        connectionState = 'connected';
        reconnectAttempts = 0;
      };
      
      ws.onclose = (event) => {
        if (event.code !== 1000 && reconnectAttempts < maxRetries) {
          connectionState = 'reconnecting';
          reconnectAttempts++;
          setTimeout(connect, 1000 * Math.pow(2, reconnectAttempts - 1)); // Exponential backoff
        } else {
          connectionState = 'disconnected';
        }
      };
      
      return ws;
    }
    
    return connect();
  }

  beforeEach(() => {
    vi.useFakeTimers();
    wsMock = mockWebSocket();
  });

  afterEach(() => {
    vi.useRealTimers();
    wsMock.restore();
  });

  it('reconnects on unexpected close', async () => {
    const ws = createReconnectingSocket('ws://localhost:3001');
    
    // Wait for initial connection
    await vi.advanceTimersByTimeAsync(0);
    expect(connectionState).toBe('connected');
    
    // Simulate unexpected disconnect
    wsMock.getInstance()?.close(1006, 'Abnormal closure');
    await vi.advanceTimersByTimeAsync(0);
    
    expect(connectionState).toBe('reconnecting');
    expect(reconnectAttempts).toBe(1);
    
    // Wait for reconnect attempt
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(0);
    
    expect(connectionState).toBe('connected');
  });

  it('uses exponential backoff for retries', async () => {
    // Force reconnection to always fail by simulating immediate disconnect
    const connectSpy = vi.fn();
    
    const ws = createReconnectingSocket('ws://localhost:3001');
    await vi.advanceTimersByTimeAsync(0);
    
    // First disconnect
    wsMock.getInstance()?.close(1006, 'Abnormal closure');
    await vi.advanceTimersByTimeAsync(0);
    expect(reconnectAttempts).toBe(1);
    
    // Advance 1 second (first retry)
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(0);
    wsMock.getInstance()?.close(1006, 'Still failing');
    await vi.advanceTimersByTimeAsync(0);
    expect(reconnectAttempts).toBe(2);
    
    // Advance 2 seconds (second retry - exponential backoff)
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(0);
  });

  it('stops reconnecting after max retries', async () => {
    const ws = createReconnectingSocket('ws://localhost:3001', 2);
    await vi.advanceTimersByTimeAsync(0);
    
    // Exhaust all retries
    for (let i = 0; i < 3; i++) {
      wsMock.getInstance()?.close(1006, 'Failed');
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(5000);
    }
    
    expect(connectionState).toBe('disconnected');
    expect(reconnectAttempts).toBe(2);
  });

  it('does not reconnect on normal close', async () => {
    const ws = createReconnectingSocket('ws://localhost:3001');
    await vi.advanceTimersByTimeAsync(0);
    
    // Normal close (code 1000)
    wsMock.getInstance()?.close(1000, 'Normal closure');
    await vi.advanceTimersByTimeAsync(0);
    
    expect(connectionState).toBe('disconnected');
    expect(reconnectAttempts).toBe(0);
  });
});
```

### API Route Tests

```typescript
// tests/api/liveblocks-auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/liveblocks-auth/route';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock Liveblocks
vi.mock('@liveblocks/node', () => ({
  Liveblocks: vi.fn().mockImplementation(() => ({
    prepareSession: vi.fn().mockReturnValue({
      allow: vi.fn(),
      FULL_ACCESS: 'full_access',
      authorize: vi.fn().mockResolvedValue({
        status: 200,
        body: JSON.stringify({ token: 'mock-token' }),
      }),
    }),
  })),
}));

describe('/api/liveblocks-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/liveblocks-auth', {
      method: 'POST',
      body: JSON.stringify({ room: 'test-room' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('authorizes authenticated users', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User', image: '' },
    });

    const request = new NextRequest('http://localhost/api/liveblocks-auth', {
      method: 'POST',
      body: JSON.stringify({ room: 'test-room' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.token).toBe('mock-token');
  });

  it('generates consistent user color', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User', image: '' },
    });

    const { Liveblocks } = await import('@liveblocks/node');
    const mockPrepareSession = vi.fn().mockReturnValue({
      allow: vi.fn(),
      FULL_ACCESS: 'full_access',
      authorize: vi.fn().mockResolvedValue({ status: 200, body: '{}' }),
    });
    (Liveblocks as any).mockImplementation(() => ({
      prepareSession: mockPrepareSession,
    }));

    const request = new NextRequest('http://localhost/api/liveblocks-auth', {
      method: 'POST',
      body: JSON.stringify({ room: 'test-room' }),
    });

    await POST(request);

    // Same user ID should always get same color
    expect(mockPrepareSession).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        userInfo: expect.objectContaining({
          color: expect.stringMatching(/^#[A-F0-9]{6}$/i),
        }),
      })
    );
  });
});
```

```typescript
// tests/api/pusher-auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/pusher/auth/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/realtime/pusher', () => ({
  pusherServer: {
    authorizeChannel: vi.fn(),
  },
}));

describe('/api/pusher/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('socket_id', '123.456');
    formData.append('channel_name', 'presence-room-1');

    const request = new NextRequest('http://localhost/api/pusher/auth', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('authorizes presence channel', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });

    const { pusherServer } = await import('@/lib/realtime/pusher');
    (pusherServer.authorizeChannel as any).mockReturnValue({
      auth: 'pusher-auth-token',
      channel_data: JSON.stringify({ user_id: 'user-123' }),
    });

    const formData = new FormData();
    formData.append('socket_id', '123.456');
    formData.append('channel_name', 'presence-room-1');

    const request = new NextRequest('http://localhost/api/pusher/auth', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('rejects unauthorized channels', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });

    const formData = new FormData();
    formData.append('socket_id', '123.456');
    formData.append('channel_name', 'private-admin-channel');

    const request = new NextRequest('http://localhost/api/pusher/auth', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });
});
```

```typescript
// tests/api/rooms.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/rooms/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  prisma: {
    room: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    roomMember: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-123' } }),
}));

describe('/api/rooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns user rooms', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.room.findMany as any).mockResolvedValue([
        { id: 'room-1', name: 'Test Room', createdAt: new Date() },
      ]);

      const request = new NextRequest('http://localhost/api/rooms');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
    });

    it('filters by search query', async () => {
      const { prisma } = await import('@/lib/db');
      
      const request = new NextRequest('http://localhost/api/rooms?q=design');
      await GET(request);

      expect(prisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.objectContaining({ contains: 'design' }),
          }),
        })
      );
    });
  });

  describe('POST', () => {
    it('creates new room', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.room.create as any).mockResolvedValue({
        id: 'new-room',
        name: 'New Room',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Room' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it('validates room name', async () => {
      const request = new NextRequest('http://localhost/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('adds creator as room member', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.room.create as any).mockResolvedValue({ id: 'new-room' });

      const request = new NextRequest('http://localhost/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Room' }),
      });

      await POST(request);

      expect(prisma.roomMember.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          roomId: 'new-room',
          userId: 'user-123',
          role: 'owner',
        }),
      });
    });
  });

  describe('DELETE', () => {
    it('deletes room', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.room.findUnique as any).mockResolvedValue({
        id: 'room-1',
        members: [{ userId: 'user-123', role: 'owner' }],
      });

      const request = new NextRequest('http://localhost/api/rooms/room-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { roomId: 'room-1' } });
      expect(response.status).toBe(204);
    });

    it('prevents non-owners from deleting', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.room.findUnique as any).mockResolvedValue({
        id: 'room-1',
        members: [{ userId: 'user-123', role: 'member' }],
      });

      const request = new NextRequest('http://localhost/api/rooms/room-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { roomId: 'room-1' } });
      expect(response.status).toBe(403);
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/collaboration.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Real-time Collaboration', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to a room
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('creates and joins a room', async ({ page }) => {
    // Create new room
    await page.click('button:has-text("New Room")');
    await page.fill('[name="roomName"]', 'Test Collaboration');
    await page.click('button:has-text("Create")');

    // Should navigate to room
    await expect(page).toHaveURL(/\/room\/.+/);
    
    // Should show presence (self)
    await expect(page.locator('[data-testid="presence-avatars"]')).toBeVisible();
    await expect(page.locator('[data-testid="presence-avatars"] img')).toHaveCount(1);
  });

  test('shows live cursors from other users', async ({ browser }) => {
    // Create two browser contexts (two users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both users login and join same room
    const roomId = 'shared-room-123';
    
    await loginUser(page1, 'user1@test.com');
    await loginUser(page2, 'user2@test.com');
    
    await page1.goto(`/room/${roomId}`);
    await page2.goto(`/room/${roomId}`);

    // Wait for both to be connected
    await expect(page1.locator('[data-testid="connection-status"]')).toHaveText('Connected');
    await expect(page2.locator('[data-testid="connection-status"]')).toHaveText('Connected');

    // Move cursor on page1
    const canvas1 = page1.locator('[data-testid="collaboration-canvas"]');
    await canvas1.hover({ position: { x: 200, y: 150 } });

    // Page2 should see page1's cursor
    await expect(page2.locator('[data-testid="remote-cursor"]')).toBeVisible();
    
    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('persists changes across page refresh', async ({ page }) => {
    await page.goto('/room/test-room');
    
    // Make a change
    await page.locator('[data-testid="canvas"]').click({ position: { x: 100, y: 100 } });
    await page.keyboard.type('Hello World');
    
    // Wait for sync indicator
    await expect(page.locator('[data-testid="sync-status"]')).toHaveText('Saved');
    
    // Refresh page
    await page.reload();
    
    // Change should persist
    await expect(page.locator('text=Hello World')).toBeVisible();
  });

  test('handles connection loss gracefully', async ({ page, context }) => {
    await page.goto('/room/test-room');
    await expect(page.locator('[data-testid="connection-status"]')).toHaveText('Connected');

    // Simulate offline
    await context.setOffline(true);
    
    // Should show disconnected state
    await expect(page.locator('[data-testid="connection-status"]')).toHaveText('Disconnected');
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
    
    // User can still make local changes
    await page.locator('[data-testid="canvas"]').click({ position: { x: 50, y: 50 } });
    await page.keyboard.type('Offline change');
    
    // Reconnect
    await context.setOffline(false);
    
    // Should reconnect and sync
    await expect(page.locator('[data-testid="connection-status"]')).toHaveText('Connected');
    await expect(page.locator('[data-testid="sync-status"]')).toHaveText('Saved');
  });

  test('shows typing indicators', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await loginUser(page1, 'alice@test.com');
    await loginUser(page2, 'bob@test.com');
    
    const roomId = 'typing-test-room';
    await page1.goto(`/room/${roomId}`);
    await page2.goto(`/room/${roomId}`);

    // Alice starts typing
    await page1.locator('[data-testid="editor"]').focus();
    await page1.keyboard.type('H', { delay: 100 });

    // Bob should see typing indicator
    await expect(page2.locator('[data-testid="typing-indicator"]')).toContainText('Alice is typing');

    // Alice stops typing (wait for debounce)
    await page1.waitForTimeout(2000);
    await expect(page2.locator('[data-testid="typing-indicator"]')).not.toBeVisible();

    await context1.close();
    await context2.close();
  });

  test('broadcasts notifications to room members', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await loginUser(page1, 'sender@test.com');
    await loginUser(page2, 'receiver@test.com');
    
    const roomId = 'notification-test';
    await page1.goto(`/room/${roomId}`);
    await page2.goto(`/room/${roomId}`);

    // Sender broadcasts a notification
    await page1.click('button[aria-label="Share"]');
    await page1.click('button:has-text("Notify All")');

    // Receiver should see the notification
    await expect(page2.locator('[role="alert"]')).toBeVisible();
    await expect(page2.locator('[role="alert"]')).toContainText('shared something');

    await context1.close();
    await context2.close();
  });
});

// Helper function
async function loginUser(page: Page, email: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}
```

```typescript
// tests/e2e/presence.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Presence Features', () => {
  test('shows who is viewing the room', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    
    const users = [
      { context: context1, email: 'user1@test.com', name: 'Alice' },
      { context: context2, email: 'user2@test.com', name: 'Bob' },
      { context: context3, email: 'user3@test.com', name: 'Charlie' },
    ];

    const pages: any[] = [];
    const roomId = 'presence-test-room';

    // All users join the room
    for (const user of users) {
      const page = await user.context.newPage();
      await page.goto('/login');
      await page.fill('[name="email"]', user.email);
      await page.fill('[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.goto(`/room/${roomId}`);
      pages.push(page);
    }

    // First user should see all three users (including self)
    const presenceList = pages[0].locator('[data-testid="presence-avatars"]');
    await expect(presenceList.locator('img, [data-testid="avatar-fallback"]')).toHaveCount(3);

    // User 2 leaves
    await pages[1].close();
    await context2.close();

    // Remaining users should see only 2 avatars
    await expect(presenceList.locator('img, [data-testid="avatar-fallback"]')).toHaveCount(2);

    // Cleanup
    await context1.close();
    await context3.close();
  });

  test('shows overflow indicator for many users', async ({ browser }) => {
    const contexts: any[] = [];
    const pages: any[] = [];
    const roomId = 'overflow-test-room';

    // Create 8 users
    for (let i = 0; i < 8; i++) {
      const context = await browser.newContext();
      contexts.push(context);
      const page = await context.newPage();
      await page.goto('/login');
      await page.fill('[name="email"]', `user${i}@test.com`);
      await page.fill('[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.goto(`/room/${roomId}`);
      pages.push(page);
    }

    // First user should see overflow indicator
    const overflowIndicator = pages[0].locator('[data-testid="presence-overflow"]');
    await expect(overflowIndicator).toBeVisible();
    await expect(overflowIndicator).toContainText('+');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }
  });

  test('updates presence on focus/blur', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.goto('/room/focus-test');

    // Should show as active
    await expect(page.locator('[data-testid="self-status"]')).toHaveAttribute('data-status', 'active');

    // Blur the page (simulate switching tabs)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });

    // Should show as idle/away
    await expect(page.locator('[data-testid="self-status"]')).toHaveAttribute('data-status', 'idle');

    // Focus back
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });

    // Should be active again
    await expect(page.locator('[data-testid="self-status"]')).toHaveAttribute('data-status', 'active');
  });
});
```

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('room page has no accessibility violations', async ({ page }) => {
    await page.goto('/room/test-room');
    await page.waitForSelector('[data-testid="collaboration-canvas"]');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('presence indicators are accessible', async ({ page }) => {
    await page.goto('/room/test-room');

    // Presence avatars should have proper labels
    const avatars = page.locator('[data-testid="presence-avatars"] [role="img"]');
    const count = await avatars.count();
    
    for (let i = 0; i < count; i++) {
      const avatar = avatars.nth(i);
      await expect(avatar).toHaveAttribute('aria-label', /.+/);
    }
  });

  test('cursors are announced to screen readers', async ({ page }) => {
    await page.goto('/room/test-room');

    // Live region for cursor announcements
    const liveRegion = page.locator('[aria-live="polite"][data-testid="cursor-announcer"]');
    await expect(liveRegion).toBeAttached();
  });

  test('keyboard navigation works in room', async ({ page }) => {
    await page.goto('/room/test-room');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Should be able to access toolbar
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('role', 'button');
  });

  test('connection status is accessible', async ({ page }) => {
    await page.goto('/room/test-room');

    const status = page.locator('[data-testid="connection-status"]');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
```

```typescript
// tests/e2e/mobile.spec.ts
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Real-time Experience', () => {
  test.use({ ...devices['iPhone 12'] });

  test('touch gestures work for cursor', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.goto('/room/mobile-test');

    const canvas = page.locator('[data-testid="collaboration-canvas"]');
    
    // Touch and drag
    await canvas.tap({ position: { x: 100, y: 100 } });
    
    // Touch events should update cursor position
    await expect(page.locator('[data-testid="cursor-position"]')).toContainText(/\d+/);
  });

  test('responsive toolbar on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.goto('/room/mobile-test');

    // Toolbar should be collapsed by default
    await expect(page.locator('[data-testid="mobile-toolbar-toggle"]')).toBeVisible();
    
    // Open toolbar
    await page.click('[data-testid="mobile-toolbar-toggle"]');
    await expect(page.locator('[data-testid="toolbar-expanded"]')).toBeVisible();
  });

  test('presence fits on small screens', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.goto('/room/mobile-test');

    const presence = page.locator('[data-testid="presence-avatars"]');
    const boundingBox = await presence.boundingBox();
    
    // Should not overflow viewport
    expect(boundingBox?.width).toBeLessThan(375); // iPhone 12 width
  });
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Error Handling

### Real-time Error Boundary

```typescript
// components/realtime/realtime-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReconnect?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorType: 'connection' | 'sync' | 'unknown';
}

export class RealtimeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorType: 'unknown' };
  }

  static getDerivedStateFromError(error: Error): State {
    // Categorize the error
    let errorType: 'connection' | 'sync' | 'unknown' = 'unknown';
    
    if (error.message.includes('WebSocket') || error.message.includes('connection')) {
      errorType = 'connection';
    } else if (error.message.includes('sync') || error.message.includes('conflict')) {
      errorType = 'sync';
    }
    
    return { hasError: true, error, errorType };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      tags: { component: 'realtime' },
      extra: { 
        componentStack: errorInfo.componentStack,
        errorType: this.state.errorType,
      },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReconnect?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { errorType, error } = this.state;

      return (
        <div 
          role="alert" 
          className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200"
        >
          {errorType === 'connection' ? (
            <>
              <WifiOff className="h-12 w-12 text-orange-500 mb-4" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Connection Lost
              </h2>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                We're having trouble connecting to the collaboration server. 
                Your changes are saved locally and will sync when reconnected.
              </p>
            </>
          ) : errorType === 'sync' ? (
            <>
              <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Sync Issue
              </h2>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                There was a conflict syncing your changes. We've preserved your 
                work - please refresh to resolve.
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                {error?.message || 'An unexpected error occurred in the collaboration session.'}
              </p>
            </>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Page

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          We've been notified and are working on a fix. Your work has been 
          saved locally.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Real-time Error Classes

```typescript
// lib/errors/realtime-errors.ts
export class RealtimeError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RealtimeError';
  }
}

export class ConnectionError extends RealtimeError {
  constructor(message: string, retryAfter?: number) {
    super(message, 'CONNECTION_ERROR', true, retryAfter);
    this.name = 'ConnectionError';
  }
}

export class AuthenticationError extends RealtimeError {
  constructor(message: string = 'Authentication failed for real-time connection') {
    super(message, 'AUTH_ERROR', false);
    this.name = 'AuthenticationError';
  }
}

export class RoomAccessError extends RealtimeError {
  constructor(roomId: string) {
    super(`Access denied to room: ${roomId}`, 'ROOM_ACCESS_ERROR', false);
    this.name = 'RoomAccessError';
  }
}

export class SyncConflictError extends RealtimeError {
  constructor(
    public localVersion: number,
    public serverVersion: number,
    public conflictingData: any
  ) {
    super('Sync conflict detected', 'SYNC_CONFLICT', true);
    this.name = 'SyncConflictError';
  }
}

export class RateLimitError extends RealtimeError {
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', true, retryAfter);
    this.name = 'RateLimitError';
  }
}

export class MessageSizeError extends RealtimeError {
  constructor(size: number, maxSize: number) {
    super(
      `Message size (${size} bytes) exceeds maximum (${maxSize} bytes)`,
      'MESSAGE_SIZE_ERROR',
      false
    );
    this.name = 'MessageSizeError';
  }
}

// Error handler utility
export function handleRealtimeError(error: unknown): RealtimeError {
  if (error instanceof RealtimeError) {
    return error;
  }

  if (error instanceof Error) {
    // Map common WebSocket errors
    if (error.message.includes('WebSocket')) {
      return new ConnectionError(error.message);
    }
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return new AuthenticationError();
    }
    if (error.message.includes('429')) {
      return new RateLimitError(60);
    }
  }

  return new RealtimeError(
    error instanceof Error ? error.message : 'Unknown error',
    'UNKNOWN_ERROR',
    true
  );
}
```

### Liveblocks Error Handling

```typescript
// lib/realtime/error-handler.ts
import { useErrorListener, useStatus } from '@/lib/realtime/liveblocks';
import { useEffect } from 'react';
import { toast } from 'sonner';
import * as Sentry from '@sentry/nextjs';
import { handleRealtimeError, ConnectionError, AuthenticationError } from '@/lib/errors/realtime-errors';

export function useRealtimeErrorHandler() {
  const status = useStatus();

  // Handle Liveblocks-specific errors
  useErrorListener((error) => {
    const realtimeError = handleRealtimeError(error);
    
    Sentry.captureException(realtimeError, {
      tags: { 
        errorCode: realtimeError.code,
        recoverable: realtimeError.recoverable,
      },
    });

    if (realtimeError instanceof AuthenticationError) {
      toast.error('Session expired. Please log in again.', {
        action: {
          label: 'Log in',
          onClick: () => window.location.href = '/login',
        },
      });
    } else if (realtimeError.recoverable) {
      toast.error(realtimeError.message, {
        description: 'We\'ll try to reconnect automatically.',
      });
    } else {
      toast.error(realtimeError.message, {
        description: 'Please refresh the page to continue.',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      });
    }
  });

  // Handle connection status changes
  useEffect(() => {
    if (status === 'disconnected') {
      toast.warning('Disconnected from collaboration server', {
        id: 'connection-status',
        duration: Infinity,
      });
    } else if (status === 'connected') {
      toast.dismiss('connection-status');
      toast.success('Reconnected!', { duration: 2000 });
    }
  }, [status]);
}
```

## Accessibility

### Accessibility Standards

This recipe implements WCAG 2.1 Level AA compliance with special consideration for real-time collaborative features:

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text Content | User avatars have alt text with names |
| 1.3.1 Info and Relationships | Semantic HTML for presence lists |
| 1.4.1 Use of Color | Status indicators have icons + text |
| 1.4.3 Contrast | Cursor colors meet 4.5:1 ratio |
| 1.4.11 Non-text Contrast | Focus indicators visible at 3:1 |
| 2.1.1 Keyboard | All tools accessible via keyboard |
| 2.4.1 Bypass Blocks | Skip to canvas link provided |
| 2.4.7 Focus Visible | Clear focus indicators |
| 4.1.3 Status Messages | Live regions for status updates |

### Skip Links

```typescript
// components/realtime/skip-links.tsx
export function RealtimeSkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-[100] focus-within:p-4 focus-within:bg-white">
      <a
        href="#collaboration-canvas"
        className="block px-4 py-2 bg-blue-600 text-white rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to collaboration canvas
      </a>
      <a
        href="#toolbar"
        className="block px-4 py-2 bg-blue-600 text-white rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to toolbar
      </a>
      <a
        href="#presence-list"
        className="block px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to participant list
      </a>
    </div>
  );
}
```

### Keyboard Navigation

```typescript
// hooks/use-canvas-keyboard.ts
import { useCallback, useEffect } from 'react';
import { useUpdateMyPresence, useBroadcastEvent } from '@/lib/realtime/liveblocks';

interface UseCanvasKeyboardOptions {
  canvasRef: React.RefObject<HTMLElement>;
  onToolChange?: (tool: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useCanvasKeyboard({
  canvasRef,
  onToolChange,
  onUndo,
  onRedo,
}: UseCanvasKeyboardOptions) {
  const updatePresence = useUpdateMyPresence();
  const broadcast = useBroadcastEvent();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            onToolChange?.('select');
            break;
          case 'h':
            onToolChange?.('hand');
            break;
          case 'p':
            onToolChange?.('pen');
            break;
          case 't':
            onToolChange?.('text');
            break;
          case 'r':
            onToolChange?.('rectangle');
            break;
          case 'e':
            onToolChange?.('ellipse');
            break;
          case 'escape':
            updatePresence({ selection: [] });
            break;
        }
      }

      // Command shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              onRedo?.();
            } else {
              onUndo?.();
            }
            break;
          case 'y':
            e.preventDefault();
            onRedo?.();
            break;
        }
      }

      // Arrow keys for cursor movement (accessibility)
      const STEP = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveCursor(0, -STEP);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveCursor(0, STEP);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveCursor(-STEP, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveCursor(STEP, 0);
          break;
      }
    },
    [onToolChange, onUndo, onRedo, updatePresence]
  );

  const moveCursor = useCallback(
    (dx: number, dy: number) => {
      updatePresence((prev) => ({
        cursor: prev.cursor
          ? { x: prev.cursor.x + dx, y: prev.cursor.y + dy }
          : { x: dx, y: dy },
      }));
    },
    [updatePresence]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('keydown', handleKeyDown);
    return () => canvas.removeEventListener('keydown', handleKeyDown);
  }, [canvasRef, handleKeyDown]);
}
```

### Accessible Presence List

```typescript
// components/realtime/accessible-presence.tsx
'use client';

import { useOthers, useSelf } from '@/lib/realtime/liveblocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AccessiblePresence() {
  const self = useSelf();
  const others = useOthers();
  const totalUsers = others.length + (self ? 1 : 0);

  return (
    <section
      id="presence-list"
      aria-label="Participants"
      className="p-4"
    >
      <h2 className="sr-only">
        {totalUsers} {totalUsers === 1 ? 'participant' : 'participants'} in this room
      </h2>
      
      <ul 
        className="flex items-center -space-x-2"
        role="list"
        aria-label="Active participants"
      >
        {/* Current user */}
        {self && (
          <li>
            <div
              role="img"
              aria-label={`${self.info?.name || 'You'} (you)`}
              className="relative"
            >
              <Avatar
                className="h-8 w-8 border-2 border-white ring-2"
                style={{ ringColor: self.info?.color }}
              >
                <AvatarImage src={self.info?.avatar} alt="" />
                <AvatarFallback
                  style={{ backgroundColor: self.info?.color }}
                  className="text-xs text-white"
                  aria-hidden="true"
                >
                  {self.info?.name?.[0] || 'Y'}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">(you)</span>
            </div>
          </li>
        )}

        {/* Other users */}
        {others.map(({ connectionId, info, presence }) => (
          <li key={connectionId}>
            <div
              role="img"
              aria-label={`${info?.name || 'Anonymous'}${presence.cursor ? ' - active' : ' - idle'}`}
            >
              <Avatar
                className="h-8 w-8 border-2 border-white ring-2"
                style={{ ringColor: info?.color }}
              >
                <AvatarImage src={info?.avatar} alt="" />
                <AvatarFallback
                  style={{ backgroundColor: info?.color }}
                  className="text-xs text-white"
                  aria-hidden="true"
                >
                  {info?.name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          </li>
        ))}
      </ul>

      {/* Status for screen readers */}
      <div aria-live="polite" className="sr-only">
        {others.filter(o => o.presence.cursor).length} participants currently active
      </div>
    </section>
  );
}
```

### Cursor Announcements

```typescript
// components/realtime/cursor-announcer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useOthers } from '@/lib/realtime/liveblocks';

export function CursorAnnouncer() {
  const others = useOthers();
  const [announcement, setAnnouncement] = useState('');
  const previousUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentUsers = new Set(others.map(o => o.id));
    const previousUsers = previousUsersRef.current;

    // Find new users
    const newUsers = others.filter(o => !previousUsers.has(o.id));
    const leftUsers = [...previousUsers].filter(id => !currentUsers.has(id));

    if (newUsers.length > 0) {
      const names = newUsers.map(u => u.info?.name || 'Someone').join(', ');
      setAnnouncement(`${names} joined the room`);
    } else if (leftUsers.length > 0) {
      setAnnouncement(`${leftUsers.length} participant${leftUsers.length > 1 ? 's' : ''} left`);
    }

    previousUsersRef.current = currentUsers;
  }, [others]);

  // Clear announcement after it's been read
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="cursor-announcer"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
```

### Connection Status Indicator

```typescript
// components/realtime/connection-status.tsx
'use client';

import { useStatus } from '@/lib/realtime/liveblocks';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  connected: {
    icon: Wifi,
    label: 'Connected',
    description: 'You are connected to the collaboration server',
    className: 'text-green-600',
  },
  connecting: {
    icon: Loader2,
    label: 'Connecting',
    description: 'Connecting to the collaboration server',
    className: 'text-yellow-600 animate-spin',
  },
  disconnected: {
    icon: WifiOff,
    label: 'Disconnected',
    description: 'You are disconnected. Changes will sync when reconnected.',
    className: 'text-red-600',
  },
  reconnecting: {
    icon: Loader2,
    label: 'Reconnecting',
    description: 'Attempting to reconnect to the server',
    className: 'text-yellow-600 animate-spin',
  },
};

export function ConnectionStatus() {
  const status = useStatus();
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={config.description}
      data-testid="connection-status"
      className="flex items-center gap-2"
    >
      <Icon 
        className={cn('h-4 w-4', config.className)} 
        aria-hidden="true"
      />
      <span className="text-sm font-medium">{config.label}</span>
      <span className="sr-only">{config.description}</span>
    </div>
  );
}
```

## Security

### Room Access Validation

```typescript
// lib/validations/room.ts
import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string()
    .min(1, 'Room name is required')
    .max(100, 'Room name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Room name contains invalid characters'),
  isPrivate: z.boolean().default(false),
  maxParticipants: z.number().min(2).max(50).default(10),
  allowedDomains: z.array(z.string().email()).optional(),
});

export const joinRoomSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  password: z.string().optional(),
});

export const updatePresenceSchema = z.object({
  cursor: z.object({
    x: z.number().min(0).max(10000),
    y: z.number().min(0).max(10000),
  }).nullable(),
  selection: z.array(z.string()).max(100),
  name: z.string().max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

// Message validation to prevent injection
export const messageSchema = z.object({
  type: z.enum(['cursor:move', 'selection:change', 'document:update', 'notification']),
  payload: z.record(z.unknown()),
  timestamp: z.number(),
});
```

### Rate Limiting for Real-time Events

```typescript
// lib/realtime/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitError } from '@/lib/errors/realtime-errors';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different rate limits for different event types
export const realtimeRateLimiters = {
  // Cursor updates: 60 per second (throttled client-side to 16ms)
  cursor: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 s'),
    prefix: 'ratelimit:cursor',
  }),
  
  // Document changes: 30 per second
  document: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 s'),
    prefix: 'ratelimit:document',
  }),
  
  // Broadcast events: 10 per minute
  broadcast: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:broadcast',
  }),
  
  // Room joins: 5 per minute (prevent room hopping)
  join: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:join',
  }),
};

export async function checkRateLimit(
  type: keyof typeof realtimeRateLimiters,
  identifier: string
): Promise<void> {
  const { success, reset } = await realtimeRateLimiters[type].limit(identifier);
  
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw new RateLimitError(retryAfter);
  }
}

// Client-side throttling
export function createThrottledEmitter(
  emit: (event: string, data: any) => void,
  interval: number = 16 // ~60fps
) {
  let lastEmit = 0;
  let pendingData: any = null;
  let timeoutId: NodeJS.Timeout | null = null;

  return (event: string, data: any) => {
    const now = Date.now();
    pendingData = data;

    if (now - lastEmit >= interval) {
      emit(event, data);
      lastEmit = now;
      pendingData = null;
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        if (pendingData) {
          emit(event, pendingData);
          lastEmit = Date.now();
          pendingData = null;
        }
        timeoutId = null;
      }, interval - (now - lastEmit));
    }
  };
}
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self';
      connect-src 'self' wss://*.liveblocks.io https://*.liveblocks.io wss://*.pusher.com https://*.pusher.com;
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

### WebSocket Security

```typescript
// lib/realtime/secure-socket.ts
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createHmac, timingSafeEqual } from 'crypto';

// Validate WebSocket connection tokens
export function generateConnectionToken(userId: string, roomId: string): string {
  const payload = `${userId}:${roomId}:${Date.now()}`;
  const hmac = createHmac('sha256', process.env.WEBSOCKET_SECRET!);
  hmac.update(payload);
  return `${Buffer.from(payload).toString('base64')}.${hmac.digest('base64')}`;
}

export function validateConnectionToken(token: string): { userId: string; roomId: string } | null {
  try {
    const [payloadB64, signatureB64] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const [userId, roomId, timestamp] = payload.split(':');

    // Check token age (5 minutes max)
    if (Date.now() - parseInt(timestamp) > 5 * 60 * 1000) {
      return null;
    }

    // Verify signature
    const hmac = createHmac('sha256', process.env.WEBSOCKET_SECRET!);
    hmac.update(payload);
    const expectedSignature = hmac.digest('base64');

    if (!timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSignature))) {
      return null;
    }

    return { userId, roomId };
  } catch {
    return null;
  }
}

// Verify room access
export async function verifyRoomAccess(userId: string, roomId: string): Promise<boolean> {
  const membership = await prisma.roomMember.findFirst({
    where: {
      userId,
      roomId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  return !!membership;
}

// Sanitize user input before broadcasting
export function sanitizeMessage(message: any): any {
  if (typeof message === 'string') {
    // Remove potential XSS
    return message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  if (Array.isArray(message)) {
    return message.map(sanitizeMessage);
  }

  if (typeof message === 'object' && message !== null) {
    return Object.fromEntries(
      Object.entries(message).map(([key, value]) => [
        sanitizeMessage(key),
        sanitizeMessage(value),
      ])
    );
  }

  return message;
}
```

## Performance

### Connection Optimization

```typescript
// lib/realtime/connection-manager.ts
import { createClient } from '@liveblocks/client';

// Configure client with optimal settings
export const liveblocksClient = createClient({
  authEndpoint: '/api/liveblocks-auth',
  
  // Throttle cursor updates for performance
  throttle: 16, // ~60fps
  
  // Enable background mode for better battery life
  backgroundKeepAliveTimeout: 15000,
  
  // Lost connection settings
  lostConnectionTimeout: 5000,
});

// Optimized presence update batching
export function createBatchedPresenceUpdater(
  updatePresence: (data: any) => void,
  batchInterval: number = 50
) {
  let pendingUpdates: Record<string, any> = {};
  let timeoutId: NodeJS.Timeout | null = null;

  return (updates: Record<string, any>) => {
    pendingUpdates = { ...pendingUpdates, ...updates };

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        updatePresence(pendingUpdates);
        pendingUpdates = {};
        timeoutId = null;
      }, batchInterval);
    }
  };
}
```

### Storage Optimization

```typescript
// lib/realtime/storage-optimization.ts
import { useMutation, useStorage } from '@/lib/realtime/liveblocks';

// Use shallow comparison for better performance
export function useOptimizedStorage<T>(
  selector: (root: any) => T,
  isEqual?: (a: T, b: T) => boolean
) {
  return useStorage(
    selector,
    isEqual || ((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );
}

// Batch storage mutations
export function useBatchedMutation<T extends any[]>(
  callback: (context: any, ...args: T) => void,
  deps: any[]
) {
  return useMutation(
    ({ storage, self }, ...args: T) => {
      // Use batch for multiple updates
      storage.batch(() => {
        callback({ storage, self }, ...args);
      });
    },
    deps
  );
}

// Lazy load room data
export async function prefetchRoom(roomId: string) {
  // Prefetch room data before entering
  const response = await fetch(`/api/rooms/${roomId}/prefetch`);
  if (response.ok) {
    const data = await response.json();
    // Store in cache for instant load
    sessionStorage.setItem(`room-${roomId}`, JSON.stringify(data));
  }
}
```

### Dynamic Imports

```typescript
// components/realtime/lazy-components.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy collaboration components
export const CollaborativeEditor = dynamic(
  () => import('./collaborative-editor').then(mod => mod.CollaborativeEditor),
  {
    loading: () => <Skeleton className="h-full w-full" />,
    ssr: false,
  }
);

export const LiveCursors = dynamic(
  () => import('./live-cursors').then(mod => mod.LiveCursors),
  {
    ssr: false,
  }
);

export const DrawingCanvas = dynamic(
  () => import('./drawing-canvas').then(mod => mod.DrawingCanvas),
  {
    loading: () => <Skeleton className="h-full w-full" />,
    ssr: false,
  }
);

// Lazy load Liveblocks only when needed
export const RoomProviderWrapper = dynamic(
  () => import('./room-provider-wrapper'),
  { ssr: false }
);
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unit

  integration-tests:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration
        env:
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
        env:
          LIVEBLOCKS_SECRET_KEY: ${{ secrets.LIVEBLOCKS_SECRET_KEY_TEST }}
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-preview:
    needs: [lint, unit-tests]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: [lint, unit-tests, integration-tests, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run --config vitest.config.ts",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## Monitoring

### Sentry Setup with Real-time Context

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
    // Track WebSocket performance
    new Sentry.BrowserTracing({
      traceFetch: true,
      traceXHR: true,
    }),
  ],

  beforeSend(event, hint) {
    // Add real-time context
    if (typeof window !== 'undefined') {
      const roomId = window.location.pathname.match(/\/room\/([^/]+)/)?.[1];
      if (roomId) {
        event.tags = {
          ...event.tags,
          roomId,
          feature: 'realtime',
        };
      }
    }
    return event;
  },
});
```

### Real-time Metrics

```typescript
// lib/monitoring/realtime-metrics.ts
import * as Sentry from '@sentry/nextjs';
import { track } from '@vercel/analytics';

interface RealtimeMetrics {
  connectionLatency: number;
  messageLatency: number;
  reconnectionCount: number;
  participantCount: number;
  syncConflicts: number;
}

class RealtimeMetricsCollector {
  private metrics: Partial<RealtimeMetrics> = {};
  private startTime: number = Date.now();

  trackConnectionLatency(latencyMs: number) {
    this.metrics.connectionLatency = latencyMs;
    track('realtime_connection_latency', { latency: latencyMs });
    
    Sentry.addBreadcrumb({
      category: 'realtime',
      message: `Connection established in ${latencyMs}ms`,
      level: 'info',
    });
  }

  trackMessageLatency(latencyMs: number) {
    this.metrics.messageLatency = latencyMs;
    
    // Alert on high latency
    if (latencyMs > 500) {
      Sentry.captureMessage('High message latency detected', {
        level: 'warning',
        extra: { latencyMs },
      });
    }
  }

  trackReconnection() {
    this.metrics.reconnectionCount = (this.metrics.reconnectionCount || 0) + 1;
    track('realtime_reconnection', { count: this.metrics.reconnectionCount });
  }

  trackParticipantChange(count: number) {
    this.metrics.participantCount = count;
    track('realtime_participants', { count });
  }

  trackSyncConflict(details: any) {
    this.metrics.syncConflicts = (this.metrics.syncConflicts || 0) + 1;
    
    Sentry.captureMessage('Sync conflict detected', {
      level: 'warning',
      extra: details,
    });
  }

  getSessionMetrics() {
    return {
      ...this.metrics,
      sessionDuration: Date.now() - this.startTime,
    };
  }

  flush() {
    const metrics = this.getSessionMetrics();
    track('realtime_session_end', metrics);
    
    Sentry.setContext('realtime_session', metrics);
  }
}

export const realtimeMetrics = new RealtimeMetricsCollector();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeMetrics.flush();
  });
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/db';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function GET() {
  const checks: Record<string, 'up' | 'down' | 'degraded'> = {};
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'up';
  } catch {
    checks.database = 'down';
    overallStatus = 'unhealthy';
  }

  // Check Redis (used for rate limiting)
  try {
    await redis.ping();
    checks.redis = 'up';
  } catch {
    checks.redis = 'down';
    overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
  }

  // Check Liveblocks (if using)
  try {
    const response = await fetch('https://api.liveblocks.io/health', {
      headers: { Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}` },
    });
    checks.liveblocks = response.ok ? 'up' : 'degraded';
  } catch {
    checks.liveblocks = 'down';
    overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
  }

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return Response.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: checks,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    },
    { status: statusCode }
  );
}
```

### WebSocket Connection Monitoring

```typescript
// lib/monitoring/websocket-monitor.ts
import * as Sentry from '@sentry/nextjs';

export class WebSocketMonitor {
  private connectionStart: number = 0;
  private lastPing: number = 0;
  private latencies: number[] = [];

  onConnecting() {
    this.connectionStart = Date.now();
    Sentry.addBreadcrumb({
      category: 'websocket',
      message: 'Connecting to WebSocket',
      level: 'info',
    });
  }

  onConnected() {
    const connectionTime = Date.now() - this.connectionStart;
    Sentry.addBreadcrumb({
      category: 'websocket',
      message: `WebSocket connected in ${connectionTime}ms`,
      level: 'info',
    });
  }

  onDisconnected(reason: string, wasClean: boolean) {
    Sentry.addBreadcrumb({
      category: 'websocket',
      message: `WebSocket disconnected: ${reason}`,
      level: wasClean ? 'info' : 'warning',
    });

    if (!wasClean) {
      Sentry.captureMessage('WebSocket disconnected unexpectedly', {
        level: 'warning',
        extra: { reason },
      });
    }
  }

  onPing() {
    this.lastPing = Date.now();
  }

  onPong() {
    const latency = Date.now() - this.lastPing;
    this.latencies.push(latency);
    
    // Keep last 100 samples
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }

    // Alert on sustained high latency
    const avgLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
    if (avgLatency > 200 && this.latencies.length >= 10) {
      Sentry.captureMessage('Sustained high WebSocket latency', {
        level: 'warning',
        extra: { avgLatency, samples: this.latencies.length },
      });
    }
  }

  getStats() {
    return {
      latencies: this.latencies,
      avgLatency: this.latencies.length > 0
        ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
        : 0,
      p95Latency: this.latencies.length > 0
        ? this.latencies.sort((a, b) => a - b)[Math.floor(this.latencies.length * 0.95)]
        : 0,
    };
  }
}
```

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0

# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Liveblocks (Recommended)
LIVEBLOCKS_SECRET_KEY=
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=

# Pusher (Alternative)
PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Socket.io (Self-hosted alternative)
WEBSOCKET_SECRET=
WEBSOCKET_URL=ws://localhost:3001

# Rate Limiting
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

## Deployment Checklist

- [ ] Configure WebSocket server or managed service (Liveblocks/Pusher)
- [ ] Set up authentication for real-time connections
- [ ] Configure CORS for WebSocket connections
- [ ] Set up presence timeouts and cleanup
- [ ] Implement conflict resolution strategy
- [ ] Configure rate limiting for real-time events
- [ ] Set up monitoring for connection health
- [ ] Test reconnection logic
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security headers configured (including WSS in CSP)
- [ ] Error monitoring (Sentry) configured
- [ ] Analytics (Vercel) enabled
- [ ] Performance optimizations applied
- [ ] Accessibility audit passed
- [ ] CI/CD pipeline configured

## Related Recipes

- [ai-application](./ai-application.md) - For AI streaming features
- [saas-dashboard](./saas-dashboard.md) - For user management and dashboards
- [marketplace](./marketplace.md) - For real-time bidding features
- [helpdesk](./helpdesk.md) - For live chat integration

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to god-tier template
- Added comprehensive Testing section with WebSocket mocks, Liveblocks mocks, MSW handlers
- Added 25+ unit tests for cursors, presence, optimistic updates
- Added integration tests for multi-user collaboration
- Added E2E tests with Playwright for real-time scenarios
- Added Error Handling section with real-time specific error boundary
- Added real-time error classes (ConnectionError, SyncConflictError, etc.)
- Added Accessibility section with WCAG 2.1 AA compliance
- Added keyboard navigation for canvas
- Added cursor announcements for screen readers
- Added Security section with room access validation
- Added rate limiting for real-time events
- Added WebSocket security (token validation, message sanitization)
- Added Performance section with connection optimization
- Added CI/CD section with GitHub Actions workflow
- Added Monitoring section with WebSocket metrics
- Added health check endpoint

### 1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- Liveblocks integration
- Socket.io option
- Pusher option
- Live cursors and presence
