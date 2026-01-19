---
id: pt-websockets
name: WebSocket Integration
version: 2.1.0
layer: L5
category: realtime
description: Real-time bidirectional communication with WebSockets
tags: [real-time, websockets, socket.io, pusher, next15, react19]
composes: []
dependencies:
  socket.io: "^4.8.0"
formula: "WebSocket = External Service (Pusher/Ably) + Auth Endpoint + useChannel Hook + Event Handlers"
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# WebSocket Integration

## When to Use

- **Bidirectional communication**: Chat, real-time collaboration
- **Low latency required**: Gaming, live trading, instant updates
- **High frequency updates**: Live dashboards, sports scores
- **Presence tracking**: Who's online, typing indicators
- **Server-initiated events**: Push notifications, alerts

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  WebSocket Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Next.js App                       │   │
│  │                                                     │   │
│  │  ┌───────────────┐     ┌───────────────────────┐   │   │
│  │  │  Client       │     │  Server Actions       │   │   │
│  │  │  Components   │     │  API Routes           │   │   │
│  │  │               │     │                       │   │   │
│  │  │ useChannel()  │     │  pusher.trigger()    │   │   │
│  │  │ useEvent()    │     │  /api/pusher/auth    │   │   │
│  │  │ usePresence() │     │                       │   │   │
│  │  └───────┬───────┘     └───────────┬───────────┘   │   │
│  │          │                         │               │   │
│  └──────────┼─────────────────────────┼───────────────┘   │
│             │                         │                    │
│             │  subscribe/bind         │  trigger/auth      │
│             ▼                         ▼                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            External WebSocket Service                │   │
│  │           (Pusher / Ably / Custom WS)               │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ public-*    │  │ private-*   │  │ presence-* │  │   │
│  │  │ channels    │  │ channels    │  │ channels   │  │   │
│  │  │             │  │ (auth req)  │  │ (auth+meta)│  │   │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Channel Types:                                             │
│  ├── public-*    → No auth, broadcast updates              │
│  ├── private-*   → Requires auth, user-specific            │
│  └── presence-*  → Auth + member tracking (who's online)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Overview

WebSockets enable real-time bidirectional communication between client and server. Since Next.js Route Handlers don't natively support WebSockets, this pattern covers integration with external services (Pusher, Ably) and custom WebSocket servers.

## Pusher Integration

```typescript
// lib/pusher/server.ts
import PusherServer from 'pusher';

export const pusher = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// lib/pusher/client.ts
'use client';

import PusherClient from 'pusher-js';

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
    });
  }
  return pusherClient;
}

// hooks/use-channel.ts
'use client';

import { useEffect, useState } from 'react';
import { Channel } from 'pusher-js';
import { getPusherClient } from '@/lib/pusher/client';

export function useChannel(channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(channelName);
    setChannel(channel);

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [channelName]);

  return channel;
}

export function useEvent<T>(
  channel: Channel | null,
  eventName: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    if (!channel) return;

    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
    };
  }, [channel, eventName, callback]);
}
```

## Pusher Auth Endpoint

```typescript
// app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { pusher } from '@/lib/pusher/server';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const socketId = formData.get('socket_id') as string;
  const channelName = formData.get('channel_name') as string;

  // Validate channel access
  if (channelName.startsWith('private-user-')) {
    const userId = channelName.replace('private-user-', '');
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // For presence channels
  if (channelName.startsWith('presence-')) {
    const presenceData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    };

    const authResponse = pusher.authorizeChannel(
      socketId,
      channelName,
      presenceData
    );
    return NextResponse.json(authResponse);
  }

  // For private channels
  const authResponse = pusher.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
```

## Real-Time Chat Example

```typescript
// app/actions/chat.ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { pusher } from '@/lib/pusher/server';
import { revalidatePath } from 'next/cache';

interface SendMessageInput {
  conversationId: string;
  content: string;
}

export async function sendMessage({ conversationId, content }: SendMessageInput) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const message = await prisma.message.create({
    data: {
      content,
      conversationId,
      senderId: session.user.id,
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  // Broadcast to channel
  await pusher.trigger(`private-conversation-${conversationId}`, 'new-message', {
    message,
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
}

// components/chat/chat-room.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChannel, useEvent } from '@/hooks/use-channel';
import { sendMessage } from '@/app/actions/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ChatRoomProps {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}

export function ChatRoom({
  conversationId,
  initialMessages,
  currentUserId,
}: ChatRoomProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channel = useChannel(`private-conversation-${conversationId}`);

  const handleNewMessage = useCallback((data: { message: Message }) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === data.message.id)) return prev;
      return [...prev, data.message];
    });
  }, []);

  useEvent(channel, 'new-message', handleNewMessage);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const content = input;
    setInput('');

    try {
      await sendMessage({ conversationId, content });
    } catch (error) {
      console.error('Failed to send message:', error);
      setInput(content); // Restore input on error
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender.id === currentUserId ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.sender.image || undefined} />
              <AvatarFallback>
                {message.sender.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender.id === currentUserId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p>{message.content}</p>
              <time className="text-xs opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </time>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={isSending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
```

## Presence Channel (Online Users)

```typescript
// hooks/use-presence.ts
'use client';

import { useState, useEffect } from 'react';
import { getPusherClient } from '@/lib/pusher/client';
import type { PresenceChannel, Members } from 'pusher-js';

interface PresenceMember {
  id: string;
  info: {
    name: string;
    email: string;
    image: string | null;
  };
}

export function usePresence(channelName: string) {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(channelName) as PresenceChannel;

    channel.bind('pusher:subscription_succeeded', (data: Members) => {
      setMyId(data.myID);
      const memberList: PresenceMember[] = [];
      data.each((member: PresenceMember) => memberList.push(member));
      setMembers(memberList);
    });

    channel.bind('pusher:member_added', (member: PresenceMember) => {
      setMembers((prev) => [...prev, member]);
    });

    channel.bind('pusher:member_removed', (member: PresenceMember) => {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [channelName]);

  return { members, myId, count: members.length };
}

// components/online-users.tsx
'use client';

import { usePresence } from '@/hooks/use-presence';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface OnlineUsersProps {
  roomId: string;
}

export function OnlineUsers({ roomId }: OnlineUsersProps) {
  const { members, count } = usePresence(`presence-room-${roomId}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Online</span>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.info.image || undefined} />
                <AvatarFallback>{member.info.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <span className="text-sm">{member.info.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Ably Integration (Alternative)

```typescript
// lib/ably/client.ts
'use client';

import Ably from 'ably';

let ablyClient: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: '/api/ably/token',
    });
  }
  return ablyClient;
}

// app/api/ably/token/route.ts
import { NextResponse } from 'next/server';
import Ably from 'ably';
import { auth } from '@/auth';

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: session.user.id,
    capability: {
      [`private:${session.user.id}:*`]: ['subscribe', 'publish'],
      'public:*': ['subscribe'],
    },
  });

  return NextResponse.json(tokenRequest);
}

// hooks/use-ably-channel.ts
'use client';

import { useEffect, useState } from 'react';
import type { RealtimeChannel } from 'ably';
import { getAblyClient } from '@/lib/ably/client';

export function useAblyChannel(channelName: string) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const ably = getAblyClient();
    const channel = ably.channels.get(channelName);
    setChannel(channel);

    return () => {
      channel.detach();
    };
  }, [channelName]);

  return channel;
}
```

## Custom WebSocket Server (Separate Process)

```typescript
// websocket-server.ts (run separately from Next.js)
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';

const server = createServer();
const wss = new WebSocketServer({ server });

interface Client {
  ws: WebSocket;
  userId: string;
  rooms: Set<string>;
}

const clients = new Map<string, Client>();
const rooms = new Map<string, Set<string>>();

wss.on('connection', async (ws, request) => {
  const url = new URL(request.url!, `http://${request.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close(1008, 'Missing token');
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const clientId = crypto.randomUUID();

    clients.set(clientId, {
      ws,
      userId: payload.userId,
      rooms: new Set(),
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      handleMessage(clientId, message);
    });

    ws.on('close', () => {
      const client = clients.get(clientId);
      if (client) {
        client.rooms.forEach((room) => leaveRoom(clientId, room));
        clients.delete(clientId);
      }
    });

    ws.send(JSON.stringify({ type: 'connected', clientId }));
  } catch {
    ws.close(1008, 'Invalid token');
  }
});

function handleMessage(clientId: string, message: any) {
  switch (message.type) {
    case 'join':
      joinRoom(clientId, message.room);
      break;
    case 'leave':
      leaveRoom(clientId, message.room);
      break;
    case 'message':
      broadcastToRoom(message.room, message.data, clientId);
      break;
  }
}

function joinRoom(clientId: string, roomName: string) {
  const client = clients.get(clientId);
  if (!client) return;

  client.rooms.add(roomName);

  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName)!.add(clientId);
}

function leaveRoom(clientId: string, roomName: string) {
  const client = clients.get(clientId);
  if (client) {
    client.rooms.delete(roomName);
  }

  const room = rooms.get(roomName);
  if (room) {
    room.delete(clientId);
    if (room.size === 0) {
      rooms.delete(roomName);
    }
  }
}

function broadcastToRoom(roomName: string, data: any, excludeClientId?: string) {
  const room = rooms.get(roomName);
  if (!room) return;

  room.forEach((clientId) => {
    if (clientId === excludeClientId) return;
    const client = clients.get(clientId);
    if (client?.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  });
}

server.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
});
```

## Anti-patterns

### Don't Store State in Route Handlers

```typescript
// BAD - State lost on each request
let connections: WebSocket[] = [];

export async function GET(request: Request) {
  // This won't work - serverless functions are stateless
}

// GOOD - Use external service (Pusher, Redis pub/sub)
await pusher.trigger('channel', 'event', data);
```

### Don't Skip Authentication

```typescript
// BAD - No auth check
channel.bind('message', (data) => {
  // Anyone can receive messages
});

// GOOD - Use private channels with auth
const channel = pusher.subscribe('private-user-123');
// Auth endpoint validates access
```

## Related Skills

- [server-sent-events](./server-sent-events.md)
- [polling](./polling.md)
- [presence](./presence.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Pusher integration
- Ably integration
- Presence channels
- Chat example
- Custom WebSocket server
