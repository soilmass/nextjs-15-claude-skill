---
id: m-live-cursors
name: Live Cursors
version: 2.0.0
layer: L2
category: collaboration
description: Real-time cursor positions display for collaborative applications
tags: [cursor, collaboration, realtime, presence, multiplayer]
formula: "LiveCursors = Cursor(a-display-icon) + Label(a-display-text) + Position(animation)"
composes:
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
  - ../atoms/display-avatar.md
dependencies:
  "framer-motion": "^11.0.0"
performance:
  impact: medium
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: false
---

# Live Cursors

## Overview

The Live Cursors molecule displays real-time cursor positions from other users in a collaborative environment. Each cursor shows the user's name/avatar and smoothly animates to follow their movements.

## When to Use

Use this skill when:
- Building collaborative editing tools (like Figma, Google Docs)
- Creating multiplayer drawing applications
- Showing real-time user presence on a canvas
- Building collaborative whiteboards

## Composition Diagram

```
+-----------------------------------------------+
|                  Live Cursors                  |
+-----------------------------------------------+
| (Container - position: relative, full area)   |
|                                               |
|      +-- Cursor 1 (User: Alice) ---+          |
|      |  ^                          |          |
|      | / \   [Alice]               |          |
|      |  |   (name label)           |          |
|      +-----------------------------+          |
|                                               |
|           +-- Cursor 2 (User: Bob) ---+       |
|           |  ^                        |       |
|           | / \   [Bob]               |       |
|           |  |   (name label)         |       |
|           +---------------------------+       |
|                                               |
|  +-- Cursor 3 (User: Carol) ---+              |
|  |  ^                          |              |
|  | / \   [Carol]               |              |
|  |  |   (name label)           |              |
|  +-----------------------------+              |
+-----------------------------------------------+
```

## Atoms Used

- [display-icon](../atoms/display-icon.md) - Cursor pointer icon
- [display-text](../atoms/display-text.md) - User name label
- [display-avatar](../atoms/display-avatar.md) - Optional user avatar

## Implementation

```typescript
// components/ui/live-cursors.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CursorPosition {
  x: number;
  y: number;
}

interface CursorUser {
  id: string;
  name: string;
  color: string;
  position: CursorPosition;
}

interface LiveCursorsProps {
  /** Array of users with their cursor positions */
  users: CursorUser[];
  /** Container element ref for relative positioning */
  containerRef?: React.RefObject<HTMLElement>;
  /** Show user names next to cursors */
  showNames?: boolean;
  /** Cursor size */
  size?: "sm" | "md" | "lg";
  /** Animation smoothness (lower = smoother, higher = snappier) */
  smoothing?: number;
  className?: string;
}

const CursorIcon = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.65376 12.4563L8.96671 20.5786C9.53191 21.9214 11.4636 21.7163 11.7298 20.2852L12.9367 13.6798L19.4398 12.195C20.8626 11.8669 20.9957 9.91958 19.6253 9.39799L6.40664 4.27339C5.14276 3.79192 3.93219 5.03954 4.45247 6.28746L5.65376 12.4563Z"
      fill={color}
      stroke="white"
      strokeWidth="1.5"
    />
  </svg>
);

export function LiveCursors({
  users,
  containerRef,
  showNames = true,
  size = "md",
  smoothing = 0.15,
  className,
}: LiveCursorsProps) {
  const sizeStyles = {
    sm: { cursor: "scale-75", label: "text-xs px-1.5 py-0.5" },
    md: { cursor: "scale-100", label: "text-sm px-2 py-1" },
    lg: { cursor: "scale-125", label: "text-base px-2.5 py-1.5" },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <AnimatePresence>
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: user.position.x,
              y: user.position.y,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 200,
              mass: 0.5,
            }}
            className="absolute top-0 left-0"
            style={{ zIndex: 50 }}
          >
            {/* Cursor pointer */}
            <div className={styles.cursor}>
              <CursorIcon color={user.color} />
            </div>

            {/* Name label */}
            {showNames && (
              <div
                className={cn(
                  "absolute left-4 top-4 rounded-md whitespace-nowrap",
                  "font-medium shadow-sm",
                  styles.label
                )}
                style={{
                  backgroundColor: user.color,
                  color: "white",
                }}
              >
                {user.name}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

```typescript
// hooks/use-cursor-tracking.ts
"use client";

import * as React from "react";

interface CursorPosition {
  x: number;
  y: number;
}

export function useCursorTracking(
  containerRef: React.RefObject<HTMLElement>,
  onMove?: (position: CursorPosition) => void,
  throttleMs: number = 50
) {
  const lastUpdate = React.useRef(0);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate.current < throttleMs) return;
      lastUpdate.current = now;

      const rect = container.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      onMove?.(position);
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [containerRef, onMove, throttleMs]);
}
```

```typescript
// Example integration with real-time backend
// hooks/use-live-cursors.ts
import { useEffect, useState } from "react";

interface CursorUser {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
}

export function useLiveCursors(roomId: string) {
  const [users, setUsers] = useState<CursorUser[]>([]);

  // Integration point for your real-time backend
  // (Liveblocks, Supabase Realtime, Socket.io, etc.)

  return { users, setUsers };
}
```

## Variants

### Basic Cursors

```tsx
<div className="relative h-[500px] border">
  <LiveCursors users={otherUsers} />
  {/* Your collaborative content */}
</div>
```

### Without Names

```tsx
<LiveCursors users={users} showNames={false} />
```

### Different Sizes

```tsx
<LiveCursors users={users} size="sm" />
<LiveCursors users={users} size="md" />
<LiveCursors users={users} size="lg" />
```

## States

| State | Cursor | Label | Animation |
|-------|--------|-------|-----------|
| Active | visible | visible | smooth follow |
| Entering | fade in | fade in | scale up |
| Leaving | fade out | fade out | scale down |
| Idle | visible | visible | none |

## Accessibility

### Considerations

- Cursors are purely decorative (aria-hidden)
- Do not convey essential information
- Real collaboration features should have text alternatives

### Performance

- Use throttling for cursor position updates
- Limit number of visible cursors
- Use CSS transforms for smooth animations

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## Examples

### Collaborative Canvas

```tsx
function CollaborativeCanvas() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { users, broadcastPosition } = useLiveCursors("room-1");

  useCursorTracking(containerRef, broadcastPosition);

  return (
    <div ref={containerRef} className="relative h-screen">
      <LiveCursors users={users} />
      <Canvas />
    </div>
  );
}
```

### Document Editor

```tsx
function DocumentEditor() {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [cursors, setCursors] = useState([]);

  return (
    <div ref={editorRef} className="relative min-h-screen">
      <LiveCursors
        users={cursors}
        containerRef={editorRef}
        showNames
        size="sm"
      />
      <Editor />
    </div>
  );
}
```

## Anti-patterns

### Too Many Cursors

```tsx
// Bad - performance issues with many cursors
<LiveCursors users={allUsers} /> // 100+ users

// Good - limit visible cursors
<LiveCursors users={allUsers.slice(0, 10)} />
```

### No Throttling

```tsx
// Bad - updates on every pixel
onMouseMove={(e) => broadcast(e)}

// Good - throttle updates
useCursorTracking(ref, broadcast, 50) // 50ms throttle
```

## Related Skills

### Composes From
- [atoms/display-icon](../atoms/display-icon.md) - Cursor icon

### Composes Into
- [organisms/collaborative-canvas](../organisms/collaborative-canvas.md)
- [organisms/whiteboard](../organisms/whiteboard.md)

### Related
- [molecules/presence-avatars](./presence-avatars.md) - Online users

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Framer Motion animations
- Cursor tracking hook
- Size variants
