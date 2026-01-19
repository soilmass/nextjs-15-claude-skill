---
id: m-presence-avatars
name: Presence Avatars
version: 2.0.0
layer: L2
category: collaboration
description: Avatar stack showing online users with real-time presence indicators
tags: [presence, avatars, online, users, collaboration, realtime]
formula: "PresenceAvatars = Avatar(m-avatar) + StatusDot(a-display-badge) + Overflow(a-display-text)"
composes:
  - ../atoms/display-avatar.md
  - ../atoms/display-badge.md
  - ../atoms/display-text.md
  - ../atoms/interactive-tooltip.md
dependencies:
  "@radix-ui/react-tooltip": "^1.1.4"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Presence Avatars

## Overview

The Presence Avatars molecule displays a stack of avatars representing online users in a collaborative space. Shows real-time presence status with animated transitions for users joining and leaving.

## When to Use

Use this skill when:
- Showing who is currently viewing a document
- Displaying active participants in a meeting room
- Indicating online team members in a workspace
- Building collaborative editing indicators

## Composition Diagram

```
+-----------------------------------------------+
|               Presence Avatars                 |
+-----------------------------------------------+
| +-------------------------------------------+ |
| |              Stacked Avatars               | |
| |                                           | |
| |   +---+                                   | |
| |   |   | <- Avatar 1 (online, ring)        | |
| |   | o | <- Green status dot               | |
| |   +---+                                   | |
| |     +---+                                 | |
| |     |   | <- Avatar 2 (overlapped)        | |
| |     | o |                                 | |
| |     +---+                                 | |
| |       +---+                               | |
| |       |   | <- Avatar 3                   | |
| |       | o |                               | |
| |       +---+                               | |
| |         +---+                             | |
| |         |+5 | <- Overflow count           | |
| |         +---+                             | |
| +-------------------------------------------+ |
|                                               |
| Hover State:                                  |
| +-------------------------------------------+ |
| |  Tooltip: "Alice, Bob, Carol + 5 others"  | |
| +-------------------------------------------+ |
+-----------------------------------------------+
```

## Atoms Used

- [display-avatar](../atoms/display-avatar.md) - User avatars
- [display-badge](../atoms/display-badge.md) - Online status indicator
- [display-text](../atoms/display-text.md) - Overflow count
- [interactive-tooltip](../atoms/interactive-tooltip.md) - User names on hover

## Implementation

```typescript
// components/ui/presence-avatars.tsx
"use client";

import * as React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

interface PresenceUser {
  id: string;
  name: string;
  image?: string;
  status?: "online" | "away" | "busy";
}

interface PresenceAvatarsProps {
  /** Array of online users */
  users: PresenceUser[];
  /** Maximum avatars to show before overflow */
  max?: number;
  /** Size of avatars */
  size?: "xs" | "sm" | "md" | "lg";
  /** Show animated presence pulse */
  showPulse?: boolean;
  /** Animate user join/leave */
  animate?: boolean;
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

export function PresenceAvatars({
  users,
  max = 4,
  size = "md",
  showPulse = true,
  animate = true,
  onClick,
  className,
}: PresenceAvatarsProps) {
  const visibleUsers = users.slice(0, max);
  const overflowCount = Math.max(0, users.length - max);
  const overflowUsers = users.slice(max);

  const sizeStyles = {
    xs: { avatar: "h-6 w-6 text-[10px]", overlap: "-ml-2", dot: "h-1.5 w-1.5" },
    sm: { avatar: "h-8 w-8 text-xs", overlap: "-ml-2.5", dot: "h-2 w-2" },
    md: { avatar: "h-10 w-10 text-sm", overlap: "-ml-3", dot: "h-2.5 w-2.5" },
    lg: { avatar: "h-12 w-12 text-base", overlap: "-ml-4", dot: "h-3 w-3" },
  };

  const styles = sizeStyles[size];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-amber-500",
    busy: "bg-red-500",
  };

  const AvatarItem = ({
    user,
    index,
  }: {
    user: PresenceUser;
    index: number;
  }) => {
    const content = (
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.5, x: -20 } : false}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={animate ? { opacity: 0, scale: 0.5, x: -20 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "relative",
          index > 0 && styles.overlap
        )}
      >
        <Avatar
          className={cn(
            styles.avatar,
            "ring-2 ring-background"
          )}
        >
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        {/* Status dot */}
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
            styles.dot,
            statusColors[user.status || "online"]
          )}
        >
          {showPulse && user.status === "online" && (
            <span
              className={cn(
                "absolute inset-0 rounded-full animate-ping",
                statusColors.online,
                "opacity-75"
              )}
            />
          )}
        </span>
      </motion.div>
    );

    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md border"
            sideOffset={4}
          >
            {user.name}
            <span className="ml-2 text-muted-foreground capitalize">
              ({user.status || "online"})
            </span>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  };

  const OverflowIndicator = () => {
    const content = (
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.5 } : false}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          styles.avatar,
          styles.overlap,
          "flex items-center justify-center rounded-full",
          "bg-muted text-muted-foreground ring-2 ring-background",
          "font-medium"
        )}
      >
        +{overflowCount}
      </motion.div>
    );

    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 rounded-md bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md border"
            sideOffset={4}
          >
            <ul className="space-y-1">
              {overflowUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      statusColors[user.status || "online"]
                    )}
                  />
                  {user.name}
                </li>
              ))}
            </ul>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <div
        className={cn(
          "flex items-center",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
        role="group"
        aria-label={`${users.length} users online`}
      >
        <AnimatePresence mode="popLayout">
          {visibleUsers.map((user, index) => (
            <AvatarItem key={user.id} user={user} index={index} />
          ))}
        </AnimatePresence>
        {overflowCount > 0 && <OverflowIndicator />}
      </div>
    </Tooltip.Provider>
  );
}
```

## Variants

### Basic Usage

```tsx
<PresenceAvatars
  users={[
    { id: "1", name: "Alice", status: "online" },
    { id: "2", name: "Bob", status: "online" },
    { id: "3", name: "Carol", status: "away" },
  ]}
/>
```

### With Images

```tsx
<PresenceAvatars
  users={[
    { id: "1", name: "Alice", image: "/avatars/alice.jpg", status: "online" },
    { id: "2", name: "Bob", image: "/avatars/bob.jpg", status: "busy" },
  ]}
  max={5}
/>
```

### Different Sizes

```tsx
<PresenceAvatars users={users} size="xs" />
<PresenceAvatars users={users} size="sm" />
<PresenceAvatars users={users} size="md" />
<PresenceAvatars users={users} size="lg" />
```

### Without Animation

```tsx
<PresenceAvatars
  users={users}
  animate={false}
  showPulse={false}
/>
```

## States

| State | Avatar | Status Dot | Animation |
|-------|--------|------------|-----------|
| Online | visible | green + pulse | join anim |
| Away | visible | amber | join anim |
| Busy | visible | red | join anim |
| Leaving | fading | fading | exit anim |
| Overflow | "+N" | none | none |

## Accessibility

### Required ARIA Attributes

- `role="group"` on container
- `aria-label` with user count
- Tooltip accessible via keyboard

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus avatars |
| `Enter/Space` | Open tooltip |

### Screen Reader Announcements

- Total number of online users
- Individual names via tooltip

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-tooltip": "^1.1.4",
    "framer-motion": "^11.0.0"
  }
}
```

## Examples

### Document Viewers

```tsx
function DocumentHeader({ viewers }) {
  return (
    <div className="flex items-center justify-between">
      <h1>Project Document</h1>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Viewing:</span>
        <PresenceAvatars users={viewers} max={4} size="sm" />
      </div>
    </div>
  );
}
```

### Meeting Room

```tsx
function MeetingRoom({ participants }) {
  return (
    <div className="flex items-center gap-4">
      <PresenceAvatars
        users={participants}
        max={6}
        size="md"
        onClick={() => openParticipantsPanel()}
      />
      <span className="text-sm">
        {participants.length} in meeting
      </span>
    </div>
  );
}
```

## Anti-patterns

### Too Many Visible

```tsx
// Bad - cluttered display
<PresenceAvatars users={users} max={20} />

// Good - reasonable max
<PresenceAvatars users={users} max={5} />
```

### Missing Status

```tsx
// Bad - no status context
users={[{ id: "1", name: "Alice" }]}

// Good - include status
users={[{ id: "1", name: "Alice", status: "online" }]}
```

## Related Skills

### Composes From
- [atoms/display-avatar](../atoms/display-avatar.md) - Base avatar
- [molecules/avatar-group](./avatar-group.md) - Stacked avatars

### Composes Into
- [organisms/document-header](../organisms/document-header.md)
- [organisms/meeting-room](../organisms/meeting-room.md)

### Related
- [molecules/live-cursors](./live-cursors.md) - Cursor presence

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Animated join/leave transitions
- Status indicators with pulse
- Tooltip integration
