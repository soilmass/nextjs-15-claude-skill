---
id: pt-crdt
name: CRDT for Collaborative Editing
version: 1.0.0
layer: L5
category: realtime
description: Conflict-free Replicated Data Types for real-time collaborative editing
tags: [crdt, collaboration, realtime, yjs, sync, next15]
composes:
  - ../organisms/collaborative-editor.md
dependencies: []
formula: "CRDT = Yjs + WebSocketProvider + AwarenessProtocol + PersistenceLayer"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# CRDT for Collaborative Editing

## When to Use

- Real-time collaborative document editing
- Shared whiteboards and drawing tools
- Multiplayer applications
- Offline-first collaborative apps
- Conflict-free data synchronization

## Composition Diagram

```
CRDT Architecture
=================

+------------------------------------------+
|  Client A              Client B          |
|  +--------+            +--------+        |
|  | Y.Doc  |<---------->| Y.Doc  |        |
|  +--------+            +--------+        |
+------------------------------------------+
              |        |
              v        v
+------------------------------------------+
|  WebSocket Server (y-websocket)          |
|  - Broadcasts updates                    |
|  - Manages connections                   |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Persistence Layer                       |
|  - Database storage                      |
|  - Version history                       |
+------------------------------------------+
```

## Installation

```bash
npm install yjs y-websocket y-protocols
npm install @tiptap/core @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor
```

## Yjs Document Setup

```typescript
// lib/collaboration/yjs-doc.ts
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function createCollaborativeDoc(
  roomId: string,
  options: {
    serverUrl?: string;
    onSync?: () => void;
    onStatusChange?: (status: string) => void;
  } = {}
) {
  const doc = new Y.Doc();

  const provider = new WebsocketProvider(
    options.serverUrl || process.env.NEXT_PUBLIC_YJS_WS_URL || 'ws://localhost:1234',
    roomId,
    doc,
    { connect: true }
  );

  provider.on('status', (event: { status: string }) => {
    options.onStatusChange?.(event.status);
  });

  provider.on('sync', (isSynced: boolean) => {
    if (isSynced) {
      options.onSync?.();
    }
  });

  return { doc, provider };
}

// Types for awareness (user presence)
export interface AwarenessUser {
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

export function setAwareness(provider: WebsocketProvider, user: AwarenessUser) {
  provider.awareness.setLocalStateField('user', user);
}

export function getAwarenessStates(provider: WebsocketProvider): Map<number, { user: AwarenessUser }> {
  return provider.awareness.getStates() as Map<number, { user: AwarenessUser }>;
}
```

## Collaborative Text Editor

```typescript
// components/collaboration/collaborative-editor.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { createCollaborativeDoc, setAwareness } from '@/lib/collaboration/yjs-doc';

interface CollaborativeEditorProps {
  roomId: string;
  userName: string;
  userColor: string;
}

export function CollaborativeEditor({ roomId, userName, userColor }: CollaborativeEditorProps) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const { doc, provider } = useMemo(
    () =>
      createCollaborativeDoc(roomId, {
        onStatusChange: (s) => setStatus(s as any),
      }),
    [roomId]
  );

  useEffect(() => {
    setAwareness(provider, { name: userName, color: userColor });

    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [provider, doc, userName, userColor]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable default history, Yjs handles this
      }),
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCursor.configure({
        provider,
        user: { name: userName, color: userColor },
      }),
    ],
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-muted border-b">
        <span className="text-sm font-medium">Document</span>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-muted-foreground capitalize">{status}</span>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}
```

## Presence Indicators

```typescript
// components/collaboration/presence-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';
import { getAwarenessStates, type AwarenessUser } from '@/lib/collaboration/yjs-doc';

interface PresenceListProps {
  provider: WebsocketProvider;
}

export function PresenceList({ provider }: PresenceListProps) {
  const [users, setUsers] = useState<AwarenessUser[]>([]);

  useEffect(() => {
    const updateUsers = () => {
      const states = getAwarenessStates(provider);
      const activeUsers: AwarenessUser[] = [];

      states.forEach((state, clientId) => {
        if (state.user && clientId !== provider.awareness.clientID) {
          activeUsers.push(state.user);
        }
      });

      setUsers(activeUsers);
    };

    provider.awareness.on('change', updateUsers);
    updateUsers();

    return () => {
      provider.awareness.off('change', updateUsers);
    };
  }, [provider]);

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Online:</span>
      <div className="flex -space-x-2">
        {users.map((user, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name[0].toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Y.js WebSocket Server

```typescript
// server/yjs-server.ts
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';

const wss = new WebSocketServer({ port: 1234 });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req, {
    docName: req.url?.slice(1) || 'default',
    gc: true,
  });
});

console.log('Y.js WebSocket server running on port 1234');
```

## Persistence with Database

```typescript
// lib/collaboration/persistence.ts
import * as Y from 'yjs';
import { prisma } from '@/lib/db';

export async function loadDocument(roomId: string): Promise<Uint8Array | null> {
  const doc = await prisma.collaborativeDocument.findUnique({
    where: { roomId },
  });

  return doc?.content ? Buffer.from(doc.content, 'base64') : null;
}

export async function saveDocument(roomId: string, doc: Y.Doc): Promise<void> {
  const content = Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64');

  await prisma.collaborativeDocument.upsert({
    where: { roomId },
    update: { content, updatedAt: new Date() },
    create: { roomId, content },
  });
}

// Periodic save
export function startAutosave(roomId: string, doc: Y.Doc, intervalMs = 5000) {
  const interval = setInterval(() => {
    saveDocument(roomId, doc);
  }, intervalMs);

  return () => clearInterval(interval);
}
```

## Shared Types (Arrays, Maps)

```typescript
// lib/collaboration/shared-types.ts
import * as Y from 'yjs';

// Shared array for lists
export function createSharedList<T>(doc: Y.Doc, name: string) {
  const yArray = doc.getArray<T>(name);

  return {
    push: (item: T) => yArray.push([item]),
    insert: (index: number, item: T) => yArray.insert(index, [item]),
    delete: (index: number) => yArray.delete(index, 1),
    get: (index: number) => yArray.get(index),
    toArray: () => yArray.toArray(),
    length: () => yArray.length,
    observe: (callback: () => void) => {
      yArray.observe(callback);
      return () => yArray.unobserve(callback);
    },
  };
}

// Shared map for key-value data
export function createSharedMap<T>(doc: Y.Doc, name: string) {
  const yMap = doc.getMap<T>(name);

  return {
    set: (key: string, value: T) => yMap.set(key, value),
    get: (key: string) => yMap.get(key),
    delete: (key: string) => yMap.delete(key),
    has: (key: string) => yMap.has(key),
    toJSON: () => yMap.toJSON(),
    observe: (callback: () => void) => {
      yMap.observe(callback);
      return () => yMap.unobserve(callback);
    },
  };
}

// Usage example
function useSharedTodos(doc: Y.Doc) {
  const todos = createSharedList<{ id: string; text: string; done: boolean }>(doc, 'todos');

  const addTodo = (text: string) => {
    todos.push({ id: crypto.randomUUID(), text, done: false });
  };

  const toggleTodo = (index: number) => {
    const todo = todos.get(index);
    if (todo) {
      todos.delete(index);
      todos.insert(index, { ...todo, done: !todo.done });
    }
  };

  return { todos, addTodo, toggleTodo };
}
```

## Undo/Redo Support

```typescript
// hooks/use-undo-manager.ts
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { UndoManager } from 'yjs';

export function useUndoManager(doc: Y.Doc, trackedOrigins?: Set<any>) {
  const [undoManager, setUndoManager] = useState<UndoManager | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const um = new UndoManager(doc.getXmlFragment('content'), {
      trackedOrigins,
    });

    const updateState = () => {
      setCanUndo(um.canUndo());
      setCanRedo(um.canRedo());
    };

    um.on('stack-item-added', updateState);
    um.on('stack-item-popped', updateState);

    setUndoManager(um);

    return () => um.destroy();
  }, [doc, trackedOrigins]);

  return {
    undo: () => undoManager?.undo(),
    redo: () => undoManager?.redo(),
    canUndo,
    canRedo,
  };
}
```

## Anti-patterns

### Don't Modify Y.Doc Outside Transactions

```typescript
// BAD - Direct modification
yArray.push([item]);
yMap.set('key', value);

// GOOD - Use transactions for batched updates
doc.transact(() => {
  yArray.push([item]);
  yMap.set('key', value);
});
```

## Related Skills

- [cursor-tracking](./cursor-tracking.md)
- [conflict-resolution](./conflict-resolution.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Yjs integration
- WebSocket provider
- Presence awareness
