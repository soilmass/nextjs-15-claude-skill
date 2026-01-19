---
id: pt-websocket
name: WebSocket Connection Management
version: 1.0.0
layer: L5
category: realtime
description: WebSocket connection management for Next.js applications
tags: [websocket, realtime, connection, socket, next15, react19]
composes:
  - ../molecules/toast.md
  - ../molecules/badge.md
dependencies:
  socket.io: "^4.8.0"
formula: Socket Client + Reconnection + Event Handlers = Reliable WebSocket Connection
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# WebSocket Connection Management

## When to Use

- **Real-time data**: Live updates, notifications, chat messages
- **Collaborative features**: Multi-user editing, presence indicators
- **Live dashboards**: Real-time metrics and monitoring
- **Gaming**: Multiplayer game state synchronization

**Avoid when**: Polling or SSE suffice, or updates are infrequent.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ WebSocket Architecture                                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ WebSocket Manager                                     │  │
│  │  ├─ Connection: Auto-connect, reconnect on failure   │  │
│  │  ├─ Events: Subscribe/unsubscribe to channels        │  │
│  │  └─ State: Online/offline status tracking            │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ useSocket  │     │ Connection   │     │ Event       │   │
│  │ Hook       │     │ Provider     │     │ Handlers    │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## WebSocket Client

```typescript
// lib/websocket/client.ts
type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

export interface WebSocketClientOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  authToken?: string;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnect: boolean;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private heartbeatInterval: number;
  private authToken?: string;

  private reconnectAttempts = 0;
  private heartbeatTimer?: NodeJS.Timer;
  private reconnectTimer?: NodeJS.Timer;

  private messageHandlers = new Map<string, Set<MessageHandler>>();
  private onConnectHandlers = new Set<ConnectionHandler>();
  private onDisconnectHandlers = new Set<ConnectionHandler>();
  private onErrorHandlers = new Set<(error: Event) => void>();

  private isConnecting = false;
  private isConnected = false;

  constructor(options: WebSocketClientOptions) {
    this.url = options.url;
    this.reconnect = options.reconnect ?? true;
    this.reconnectInterval = options.reconnectInterval ?? 1000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.heartbeatInterval = options.heartbeatInterval ?? 30000;
    this.authToken = options.authToken;
  }

  connect(): void {
    if (this.isConnecting || this.isConnected) return;

    this.isConnecting = true;

    const url = this.authToken
      ? `${this.url}?token=${this.authToken}`
      : this.url;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.onConnectHandlers.forEach((handler) => handler());
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        if (type === 'pong') return; // Heartbeat response

        const handlers = this.messageHandlers.get(type);
        handlers?.forEach((handler) => handler(payload));

        // Also trigger wildcard handlers
        const wildcardHandlers = this.messageHandlers.get('*');
        wildcardHandlers?.forEach((handler) => handler(message));
      } catch {
        console.error('Failed to parse WebSocket message');
      }
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.isConnected = false;
      this.stopHeartbeat();
      this.onDisconnectHandlers.forEach((handler) => handler());

      if (this.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.onErrorHandlers.forEach((handler) => handler(error));
    };
  }

  disconnect(): void {
    this.reconnect = false;
    this.stopHeartbeat();
    clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }

  send(type: string, payload?: any): void {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected');
      return;
    }

    this.ws.send(JSON.stringify({ type, payload }));
  }

  subscribe(channel: string): void {
    this.send('subscribe', { channel });
  }

  unsubscribe(channel: string): void {
    this.send('unsubscribe', { channel });
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.add(handler);
    return () => this.onConnectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.add(handler);
    return () => this.onDisconnectHandlers.delete(handler);
  }

  onError(handler: (error: Event) => void): () => void {
    this.onErrorHandlers.add(handler);
    return () => this.onErrorHandlers.delete(handler);
  }

  getStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.isConnected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send('ping');
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
}
```

## WebSocket Context and Provider

```typescript
// providers/websocket-provider.tsx
'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { WebSocketClient, WebSocketClientOptions } from '@/lib/websocket/client';

interface WebSocketContextValue {
  client: WebSocketClient | null;
  status: 'connected' | 'connecting' | 'disconnected';
  send: (type: string, payload?: any) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  options: WebSocketClientOptions;
}

export function WebSocketProvider({ children, options }: WebSocketProviderProps) {
  const clientRef = useRef<WebSocketClient | null>(null);
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  useEffect(() => {
    const client = new WebSocketClient(options);
    clientRef.current = client;

    client.onConnect(() => setStatus('connected'));
    client.onDisconnect(() => setStatus('disconnected'));

    setStatus('connecting');
    client.connect();

    return () => {
      client.disconnect();
    };
  }, [options.url, options.authToken]);

  const value: WebSocketContextValue = {
    client: clientRef.current,
    status,
    send: (type, payload) => clientRef.current?.send(type, payload),
    subscribe: (channel) => clientRef.current?.subscribe(channel),
    unsubscribe: (channel) => clientRef.current?.unsubscribe(channel),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
```

## useSocket Hook

```typescript
// hooks/use-socket.ts
import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/providers/websocket-provider';

interface UseSocketOptions<T> {
  event: string;
  onMessage?: (data: T) => void;
  channel?: string;
}

export function useSocket<T = any>({ event, onMessage, channel }: UseSocketOptions<T>) {
  const { client, status, send } = useWebSocket();
  const callbackRef = useRef(onMessage);

  // Update callback ref when onMessage changes
  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  // Subscribe to event
  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.on(event, (data: T) => {
      callbackRef.current?.(data);
    });

    return unsubscribe;
  }, [client, event]);

  // Subscribe to channel
  useEffect(() => {
    if (!client || !channel || status !== 'connected') return;

    client.subscribe(channel);

    return () => {
      client.unsubscribe(channel);
    };
  }, [client, channel, status]);

  const emit = useCallback(
    (payload?: any) => {
      send(event, payload);
    },
    [send, event]
  );

  return { status, emit };
}
```

## Connection Status Component

```typescript
// components/connection-status.tsx
'use client';

import { useWebSocket } from '@/providers/websocket-provider';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function ConnectionStatus() {
  const { status } = useWebSocket();

  const config = {
    connected: {
      icon: Wifi,
      label: 'Connected',
      variant: 'default' as const,
      className: 'bg-green-500',
    },
    connecting: {
      icon: Loader2,
      label: 'Connecting',
      variant: 'secondary' as const,
      className: '',
    },
    disconnected: {
      icon: WifiOff,
      label: 'Disconnected',
      variant: 'destructive' as const,
      className: '',
    },
  };

  const { icon: Icon, label, variant, className } = config[status];

  return (
    <Badge variant={variant} className={className}>
      <Icon className={`h-3 w-3 mr-1 ${status === 'connecting' ? 'animate-spin' : ''}`} />
      {label}
    </Badge>
  );
}
```

## Usage Example

```typescript
// app/layout.tsx
import { WebSocketProvider } from '@/providers/websocket-provider';
import { auth } from '@/lib/auth';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <WebSocketProvider
          options={{
            url: process.env.NEXT_PUBLIC_WS_URL!,
            authToken: session?.accessToken,
            reconnect: true,
          }}
        >
          {children}
        </WebSocketProvider>
      </body>
    </html>
  );
}

// components/notifications.tsx
'use client';

import { useSocket } from '@/hooks/use-socket';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function NotificationListener() {
  const { status } = useSocket({
    event: 'notification',
    onMessage: (data: { title: string; message: string }) => {
      toast(data.title, { description: data.message });
    },
    channel: 'user:notifications',
  });

  useEffect(() => {
    if (status === 'connected') {
      console.log('Listening for notifications');
    }
  }, [status]);

  return null;
}
```

## Server Implementation (Node.js)

```typescript
// server/websocket.ts
import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from './auth';

interface Client {
  ws: WebSocket;
  userId: string;
  channels: Set<string>;
}

const clients = new Map<string, Client>();
const channels = new Map<string, Set<string>>();

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const user = await verifyToken(token);
    if (!user) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const clientId = `${user.id}-${Date.now()}`;
    clients.set(clientId, { ws, userId: user.id, channels: new Set() });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(clientId, message);
      } catch {
        // Ignore invalid messages
      }
    });

    ws.on('close', () => {
      const client = clients.get(clientId);
      if (client) {
        client.channels.forEach((channel) => {
          channels.get(channel)?.delete(clientId);
        });
        clients.delete(clientId);
      }
    });

    ws.on('ping', () => ws.pong());
  });
}

function handleMessage(clientId: string, message: { type: string; payload?: any }) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'ping':
      client.ws.send(JSON.stringify({ type: 'pong' }));
      break;

    case 'subscribe':
      const channelToJoin = message.payload?.channel;
      if (channelToJoin) {
        if (!channels.has(channelToJoin)) {
          channels.set(channelToJoin, new Set());
        }
        channels.get(channelToJoin)!.add(clientId);
        client.channels.add(channelToJoin);
      }
      break;

    case 'unsubscribe':
      const channelToLeave = message.payload?.channel;
      if (channelToLeave) {
        channels.get(channelToLeave)?.delete(clientId);
        client.channels.delete(channelToLeave);
      }
      break;
  }
}

export function broadcast(channel: string, type: string, payload: any) {
  const subscribers = channels.get(channel);
  if (!subscribers) return;

  const message = JSON.stringify({ type, payload });
  subscribers.forEach((clientId) => {
    const client = clients.get(clientId);
    if (client?.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

export function sendToUser(userId: string, type: string, payload: any) {
  const message = JSON.stringify({ type, payload });
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}
```

## Related Patterns

- [websocket-updates](./websocket-updates.md)
- [optimistic-updates](./optimistic-updates.md)
- [streaming](./streaming.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Auto-reconnection
- Heartbeat
- Channel subscriptions
- React hooks and provider
