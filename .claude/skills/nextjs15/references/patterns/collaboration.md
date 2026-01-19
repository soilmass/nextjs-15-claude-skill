---
id: pt-collaboration
name: Collaboration Patterns
version: 2.1.0
layer: L5
category: realtime
description: Implement real-time collaborative features like cursors, selections, and editing
tags: [real-time, collaboration, cursors, multiplayer, crdt]
composes: []
dependencies: []
formula: "Collaboration = Liveblocks/Yjs + Presence + CRDT/OT + Live Cursors + Conflict Resolution"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Collaboration Patterns

## When to Use

- **Collaborative documents**: Google Docs-style editing
- **Design tools**: Figma-style multi-user canvas
- **Whiteboarding**: Real-time drawing and annotations
- **Spreadsheets**: Multi-user data entry
- **Code editors**: Pair programming features

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Collaboration Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  RoomProvider                         │   │
│  │  (Liveblocks / Y.js + WebSocket)                     │   │
│  └──────────────────────┬────────────────────────────────┘   │
│                         │                                    │
│           ┌─────────────┼─────────────┐                     │
│           │             │             │                     │
│           ▼             ▼             ▼                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Presence   │ │   Storage   │ │   History   │           │
│  │             │ │   (CRDT)    │ │             │           │
│  │ usePresence │ │ useStorage  │ │ useUndo     │           │
│  │ useOthers   │ │ useMutation │ │ useRedo     │           │
│  └──────┬──────┘ └──────┬──────┘ └─────────────┘           │
│         │               │                                   │
│         ▼               ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  UI Components                        │   │
│  │                                                     │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐ │   │
│  │  │  Live Cursors   │  │  Collaborative Editor    │ │   │
│  │  │  ┌───────────┐  │  │  ┌────────────────────┐  │ │   │
│  │  │  │ Cursor 1  │  │  │  │ Shared Document    │  │ │   │
│  │  │  │ (User A)  │  │  │  │ with CRDT Sync     │  │ │   │
│  │  │  └───────────┘  │  │  │                    │  │ │   │
│  │  │  ┌───────────┐  │  │  │ [Selection Boxes]  │  │ │   │
│  │  │  │ Cursor 2  │  │  │  └────────────────────┘  │ │   │
│  │  │  │ (User B)  │  │  │                          │ │   │
│  │  │  └───────────┘  │  │                          │ │   │
│  │  └─────────────────┘  └──────────────────────────┘ │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │           Selection Highlights               │   │   │
│  │  │  User A selecting: [████████]               │   │   │
│  │  │  User B selecting:         [████████]       │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Conflict Resolution: Last-Write-Wins / CRDT / OT          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Build real-time collaborative features including live cursors, simultaneous editing, and conflict resolution.

## Overview

Collaboration features include:
- Live cursors and selections
- Simultaneous editing
- Conflict resolution
- Undo/redo with sync
- Awareness (who's viewing/editing)

## Implementation

### Collaboration Provider with Liveblocks

```typescript
// lib/collaboration/liveblocks.tsx
"use client";

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { ReactNode } from "react";

// Configure Liveblocks client
// liveblocks.config.ts
import { createClient } from "@liveblocks/client";
import { createRoomContext, createLiveblocksContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

// Types for your collaborative data
type Presence = {
  cursor: { x: number; y: number } | null;
  selection: string[];
  name: string;
  color: string;
};

type Storage = {
  // Your collaborative state
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
  };
};

export const {
  RoomProvider: TypedRoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthersMapped,
  useOthers,
  useSelf,
  useStorage,
  useMutation,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
} = createRoomContext<Presence, Storage, UserMeta>(client);

// Collaboration room wrapper
interface CollaborationRoomProps {
  roomId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function CollaborationRoom({
  roomId,
  children,
  fallback = <div>Loading...</div>,
}: CollaborationRoomProps) {
  return (
    <TypedRoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selection: [],
        name: "",
        color: "",
      }}
    >
      <ClientSideSuspense fallback={fallback}>
        {() => children}
      </ClientSideSuspense>
    </TypedRoomProvider>
  );
}
```

### Live Cursors

```typescript
// components/collaboration/live-cursors.tsx
"use client";

import { useOthersMapped, useUpdateMyPresence } from "@/lib/collaboration/liveblocks";
import { useEffect, useCallback, memo } from "react";

// Track cursor position
export function useCursor() {
  const updateMyPresence = useUpdateMyPresence();
  
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      updateMyPresence({
        cursor: { x: e.clientX, y: e.clientY },
      });
    },
    [updateMyPresence]
  );
  
  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);
  
  useEffect(() => {
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);
    
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [handlePointerMove, handlePointerLeave]);
}

// Display other users' cursors
export function LiveCursors() {
  const others = useOthersMapped((other) => ({
    cursor: other.presence.cursor,
    info: other.info,
  }));
  
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {others.map(([connectionId, { cursor, info }]) => {
        if (!cursor) return null;
        
        return (
          <Cursor
            key={connectionId}
            x={cursor.x}
            y={cursor.y}
            name={info?.name || "Anonymous"}
            color={info?.color || "#000"}
          />
        );
      })}
    </div>
  );
}

// Individual cursor component
const Cursor = memo(function Cursor({
  x,
  y,
  name,
  color,
}: {
  x: number;
  y: number;
  name: string;
  color: string;
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.4563L8.84556 5.75L12.0374 12.4563L9.84556 10.8375L5.65376 12.4563Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      <div
        className="absolute left-4 top-4 rounded px-2 py-1 text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
});
```

### Collaborative Selection

```typescript
// components/collaboration/collaborative-selection.tsx
"use client";

import { useUpdateMyPresence, useOthersMapped } from "@/lib/collaboration/liveblocks";
import { useCallback } from "react";

export function useCollaborativeSelection() {
  const updateMyPresence = useUpdateMyPresence();
  
  const setSelection = useCallback(
    (selection: string[]) => {
      updateMyPresence({ selection });
    },
    [updateMyPresence]
  );
  
  return { setSelection };
}

// Get selections from other users
export function useOthersSelections() {
  return useOthersMapped((other) => ({
    selection: other.presence.selection,
    info: other.info,
  }));
}

// Highlight component for selected elements
interface SelectionHighlightProps {
  elementId: string;
  children: React.ReactNode;
}

export function SelectionHighlight({ elementId, children }: SelectionHighlightProps) {
  const othersSelections = useOthersSelections();
  
  // Find users selecting this element
  const selectingUsers = othersSelections.filter(
    ([_, { selection }]) => selection.includes(elementId)
  );
  
  if (selectingUsers.length === 0) {
    return <>{children}</>;
  }
  
  const firstUser = selectingUsers[0][1].info;
  
  return (
    <div
      className="relative"
      style={{
        outline: `2px solid ${firstUser?.color || "#3b82f6"}`,
        outlineOffset: "2px",
      }}
    >
      {children}
      <div
        className="absolute -top-6 left-0 text-xs px-1.5 py-0.5 rounded text-white whitespace-nowrap"
        style={{ backgroundColor: firstUser?.color || "#3b82f6" }}
      >
        {firstUser?.name || "Someone"}
      </div>
    </div>
  );
}
```

### Collaborative Text Editor

```typescript
// components/collaboration/collaborative-editor.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@/lib/collaboration/liveblocks";

interface CollaborativeEditorProps {
  initialContent?: string;
}

export function CollaborativeEditor({ initialContent }: CollaborativeEditorProps) {
  const room = useRoom();
  const self = useSelf();
  
  // Create Yjs document and provider
  const { doc, provider } = useMemo(() => {
    const doc = new Y.Doc();
    const provider = new LiveblocksYjsProvider(room, doc);
    return { doc, provider };
  }, [room]);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Collaboration handles history
      }),
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: self?.info?.name || "Anonymous",
          color: self?.info?.color || "#3b82f6",
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
  });
  
  // Cleanup
  useEffect(() => {
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [provider, doc]);
  
  return (
    <div className="border rounded-lg bg-background">
      <EditorContent editor={editor} />
    </div>
  );
}
```

### Collaborative Canvas

```typescript
// components/collaboration/collaborative-canvas.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import {
  useStorage,
  useMutation,
  useOthersMapped,
  useSelf,
} from "@/lib/collaboration/liveblocks";
import { LiveObject, LiveList, LiveMap } from "@liveblocks/client";

interface Shape {
  id: string;
  type: "rectangle" | "circle" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  createdBy: string;
}

export function CollaborativeCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Get shapes from storage
  const shapes = useStorage((root) => root.shapes);
  const self = useSelf();
  
  // Get other users' cursors
  const others = useOthersMapped((other) => ({
    cursor: other.presence.cursor,
    info: other.info,
  }));
  
  // Add shape mutation
  const addShape = useMutation(
    ({ storage, self }, type: Shape["type"], x: number, y: number) => {
      const shapes = storage.get("shapes") as LiveMap<string, LiveObject<Shape>>;
      
      const id = `shape-${Date.now()}`;
      const shape = new LiveObject<Shape>({
        id,
        type,
        x,
        y,
        width: 100,
        height: 100,
        color: self.info?.color || "#3b82f6",
        createdBy: self.id,
      });
      
      shapes.set(id, shape);
      return id;
    },
    []
  );
  
  // Move shape mutation
  const moveShape = useMutation(
    ({ storage }, id: string, x: number, y: number) => {
      const shapes = storage.get("shapes") as LiveMap<string, LiveObject<Shape>>;
      const shape = shapes.get(id);
      
      if (shape) {
        shape.update({ x, y });
      }
    },
    []
  );
  
  // Delete shape mutation
  const deleteShape = useMutation(
    ({ storage }, id: string) => {
      const shapes = storage.get("shapes") as LiveMap<string, LiveObject<Shape>>;
      shapes.delete(id);
    },
    []
  );
  
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        addShape("rectangle", x, y);
      }
    },
    [addShape]
  );
  
  return (
    <div
      ref={canvasRef}
      className="relative w-full h-[600px] bg-muted/50 rounded-lg overflow-hidden"
      onClick={handleCanvasClick}
    >
      {/* Render shapes */}
      {shapes &&
        Array.from(shapes.entries()).map(([id, shape]) => (
          <ShapeComponent
            key={id}
            shape={shape.toObject()}
            isSelected={selectedId === id}
            onSelect={() => setSelectedId(id)}
            onMove={(x, y) => moveShape(id, x, y)}
            onDelete={() => deleteShape(id)}
          />
        ))}
      
      {/* Render other users' cursors */}
      {others.map(([connectionId, { cursor, info }]) =>
        cursor ? (
          <div
            key={connectionId}
            className="absolute pointer-events-none z-50"
            style={{
              transform: `translate(${cursor.x}px, ${cursor.y}px)`,
            }}
          >
            <CursorIcon color={info?.color || "#000"} />
            <span
              className="ml-4 text-xs px-1 py-0.5 rounded"
              style={{ backgroundColor: info?.color, color: "white" }}
            >
              {info?.name}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}

// Shape component with drag support
function ShapeComponent({
  shape,
  isSelected,
  onSelect,
  onMove,
  onDelete,
}: {
  shape: Shape;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDelete: () => void;
}) {
  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      const parent = e.currentTarget.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left - shape.width / 2;
      const y = e.clientY - rect.top - shape.height / 2;
      
      onMove(Math.max(0, x), Math.max(0, y));
    },
    [onMove, shape.width, shape.height]
  );
  
  return (
    <div
      className="absolute cursor-move"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        backgroundColor: shape.color,
        borderRadius: shape.type === "circle" ? "50%" : "4px",
        border: isSelected ? "2px solid black" : "none",
      }}
      draggable
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDrag={handleDrag}
      onKeyDown={(e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          onDelete();
        }
      }}
      tabIndex={0}
    />
  );
}
```

### Conflict Resolution

```typescript
// lib/collaboration/conflict-resolution.ts

// Last-Write-Wins strategy
export function lastWriteWins<T>(local: T, remote: T, localTimestamp: number, remoteTimestamp: number): T {
  return localTimestamp > remoteTimestamp ? local : remote;
}

// Operational Transform for text
export interface TextOperation {
  type: "insert" | "delete";
  position: number;
  text?: string;
  length?: number;
  timestamp: number;
  userId: string;
}

export function transformOperation(
  op1: TextOperation,
  op2: TextOperation
): TextOperation {
  if (op1.timestamp > op2.timestamp) return op1;
  
  if (op2.type === "insert" && op2.position <= op1.position) {
    return {
      ...op1,
      position: op1.position + (op2.text?.length || 0),
    };
  }
  
  if (op2.type === "delete" && op2.position < op1.position) {
    return {
      ...op1,
      position: op1.position - (op2.length || 0),
    };
  }
  
  return op1;
}

// CRDT-based counter
export class CRDTCounter {
  private increments: Map<string, number> = new Map();
  private decrements: Map<string, number> = new Map();
  
  increment(userId: string, amount: number = 1) {
    const current = this.increments.get(userId) || 0;
    this.increments.set(userId, current + amount);
  }
  
  decrement(userId: string, amount: number = 1) {
    const current = this.decrements.get(userId) || 0;
    this.decrements.set(userId, current + amount);
  }
  
  getValue(): number {
    let total = 0;
    this.increments.forEach((v) => (total += v));
    this.decrements.forEach((v) => (total -= v));
    return total;
  }
  
  merge(other: CRDTCounter) {
    other.increments.forEach((value, key) => {
      const current = this.increments.get(key) || 0;
      this.increments.set(key, Math.max(current, value));
    });
    other.decrements.forEach((value, key) => {
      const current = this.decrements.get(key) || 0;
      this.decrements.set(key, Math.max(current, value));
    });
  }
}
```

## Variants

### Using Yjs Directly

```typescript
// lib/collaboration/yjs-provider.tsx
"use client";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface YjsContextValue {
  doc: Y.Doc;
  provider: WebsocketProvider;
  isConnected: boolean;
}

const YjsContext = createContext<YjsContextValue | null>(null);

export function YjsProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const [value, setValue] = useState<YjsContextValue | null>(null);
  
  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_YJS_SERVER!,
      roomId,
      doc
    );
    
    setValue({
      doc,
      provider,
      isConnected: false,
    });
    
    provider.on("status", ({ status }: { status: string }) => {
      setValue((prev) =>
        prev ? { ...prev, isConnected: status === "connected" } : null
      );
    });
    
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [roomId]);
  
  if (!value) return null;
  
  return <YjsContext.Provider value={value}>{children}</YjsContext.Provider>;
}

export function useYjs() {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error("useYjs must be used within YjsProvider");
  }
  return context;
}
```

## Anti-patterns

### Not Handling Offline State

```typescript
// BAD: Operations fail when offline
const addItem = useMutation(({ storage }, item) => {
  storage.get("items").push(item); // Fails offline
});

// GOOD: Queue operations for sync
const addItem = useMutation(({ storage, self }, item) => {
  const items = storage.get("items");
  items.push({
    ...item,
    _pending: true,
    _createdBy: self.connectionId,
  });
});
```

## Related Skills

- `websockets` - WebSocket connections
- `presence` - User presence
- `live-updates` - Real-time updates
- `optimistic-updates` - Optimistic UI

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Liveblocks
