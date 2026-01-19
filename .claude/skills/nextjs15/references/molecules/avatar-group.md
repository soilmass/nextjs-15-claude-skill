---
id: m-avatar-group
name: Avatar Group
version: 2.0.0
layer: L2
category: data
description: Stacked avatar display with overflow count and tooltip
tags: [avatar, group, stack, users, team]
formula: "AvatarGroup = DisplayAvatar(a-display-avatar) + DisplayText(a-display-text) + InteractiveTooltip(a-interactive-tooltip)"
composes:
  - ../atoms/display-avatar.md
  - ../atoms/display-text.md
  - ../atoms/interactive-tooltip.md
dependencies:
  "@radix-ui/react-tooltip": "^1.1.4"
performance:
  impact: low
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Avatar Group

## Overview

The Avatar Group molecule displays multiple avatars in a compact, stacked layout with overflow handling. Shows a count indicator when there are more users than can be displayed, with optional tooltip showing additional names.

## When to Use

Use this skill when:
- Showing team members or collaborators
- Displaying participants in a conversation
- Listing assignees on a task
- Showing people who liked or reacted

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        AvatarGroup                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────── Stacked Avatars ─────────────────────┐    │
│  │                                                         │    │
│  │   ┌───┐                                                 │    │
│  │   │ 👤│ ← Avatar 1 (a-display-avatar)                   │    │
│  │   └─┬─┘                                                 │    │
│  │     │ ┌───┐                                             │    │
│  │     └─│ 👤│ ← Avatar 2 (overlapped)                     │    │
│  │       └─┬─┘                                             │    │
│  │         │ ┌───┐                                         │    │
│  │         └─│ 👤│ ← Avatar 3 (overlapped)                 │    │
│  │           └─┬─┘                                         │    │
│  │             │ ┌───┐                                     │    │
│  │             └─│+5 │ ← Overflow count (a-display-text)   │    │
│  │               └───┘                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────── Tooltip (on hover) ──────────────────┐    │
│  │   (a-interactive-tooltip)                               │    │
│  │   "John, Jane, Mike, +5 more"                           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Visual Representation:
┌─────────────────────────────────────────────────────────────────┐
│   [👤][👤][👤][+5]                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [display-avatar](../atoms/display-avatar.md) - Individual avatars
- [display-text](../atoms/display-text.md) - Overflow count
- [interactive-tooltip](../atoms/interactive-tooltip.md) - Names on hover

## Implementation

```typescript
// components/ui/avatar-group.tsx
"use client";

import * as React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

interface AvatarGroupItem {
  id: string;
  name: string;
  image?: string;
}

interface AvatarGroupProps {
  /** Array of users/items to display */
  items: AvatarGroupItem[];
  /** Maximum avatars to show before overflow */
  max?: number;
  /** Size of avatars */
  size?: "xs" | "sm" | "md" | "lg";
  /** Stacking direction */
  direction?: "left" | "right";
  /** Show tooltip with names on hover */
  showTooltip?: boolean;
  /** Click handler for overflow indicator */
  onOverflowClick?: () => void;
  className?: string;
}

export function AvatarGroup({
  items,
  max = 4,
  size = "md",
  direction = "left",
  showTooltip = true,
  onOverflowClick,
  className,
}: AvatarGroupProps) {
  const visibleItems = items.slice(0, max);
  const overflowCount = Math.max(0, items.length - max);
  const overflowItems = items.slice(max);

  const sizeStyles = {
    xs: { avatar: "h-6 w-6 text-xs", overlap: "-ml-2", ring: "ring-1" },
    sm: { avatar: "h-8 w-8 text-xs", overlap: "-ml-2.5", ring: "ring-2" },
    md: { avatar: "h-10 w-10 text-sm", overlap: "-ml-3", ring: "ring-2" },
    lg: { avatar: "h-12 w-12 text-base", overlap: "-ml-4", ring: "ring-2" },
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

  const AvatarWithTooltip = ({
    item,
    index,
  }: {
    item: AvatarGroupItem;
    index: number;
  }) => {
    const avatar = (
      <Avatar
        className={cn(
          styles.avatar,
          styles.ring,
          "ring-background",
          index > 0 && styles.overlap,
          direction === "right" && index > 0 && "ml-0 -mr-3"
        )}
      >
        <AvatarImage src={item.image} alt={item.name} />
        <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
      </Avatar>
    );

    if (!showTooltip) return avatar;

    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{avatar}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-tooltip rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md border"
            sideOffset={4}
          >
            {item.name}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  };

  const OverflowIndicator = () => {
    const indicator = (
      <button
        type="button"
        onClick={onOverflowClick}
        className={cn(
          styles.avatar,
          styles.ring,
          "ring-background",
          styles.overlap,
          direction === "right" && "ml-0 -mr-3",
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
          onOverflowClick && "cursor-pointer hover:bg-muted/80"
        )}
        aria-label={`${overflowCount} more users`}
      >
        +{overflowCount}
      </button>
    );

    if (!showTooltip || overflowItems.length === 0) return indicator;

    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{indicator}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-tooltip rounded-md bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md border"
            sideOffset={4}
          >
            <ul className="space-y-1">
              {overflowItems.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  };

  return (
    <Tooltip.Provider>
      <div
        className={cn(
          "flex items-center",
          direction === "right" && "flex-row-reverse",
          className
        )}
        role="group"
        aria-label={`${items.length} users`}
      >
        {visibleItems.map((item, index) => (
          <AvatarWithTooltip key={item.id} item={item} index={index} />
        ))}
        {overflowCount > 0 && <OverflowIndicator />}
      </div>
    </Tooltip.Provider>
  );
}
```

```typescript
// components/ui/avatar-group-expandable.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AvatarGroup } from "./avatar-group";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

interface AvatarGroupExpandableProps {
  items: Array<{
    id: string;
    name: string;
    image?: string;
    subtitle?: string;
  }>;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  title?: string;
}

export function AvatarGroupExpandable({
  items,
  max = 4,
  size = "md",
  title = "All users",
}: AvatarGroupExpandableProps) {
  const [open, setOpen] = React.useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <AvatarGroup
            items={items}
            max={max}
            size={size}
            onOverflowClick={() => setOpen(true)}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.image} alt={item.name} />
                  <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Key Implementation Notes

1. **Stacking Order**: Uses negative margins to create overlap, with ring for separation
2. **Overflow Tooltip**: Shows remaining names on hover of the +N indicator

## Variants

### Basic

```tsx
<AvatarGroup
  items={[
    { id: "1", name: "John Doe", image: "/avatars/john.jpg" },
    { id: "2", name: "Jane Smith", image: "/avatars/jane.jpg" },
    { id: "3", name: "Bob Wilson" },
  ]}
/>
```

### With Overflow

```tsx
<AvatarGroup
  items={users}
  max={3}
/>
// Shows 3 avatars + "+5" indicator if 8 users
```

### Size Variants

```tsx
<AvatarGroup items={users} size="xs" />
<AvatarGroup items={users} size="sm" />
<AvatarGroup items={users} size="md" />
<AvatarGroup items={users} size="lg" />
```

### Direction

```tsx
// Stack from left (default)
<AvatarGroup items={users} direction="left" />

// Stack from right
<AvatarGroup items={users} direction="right" />
```

### Expandable with Dialog

```tsx
<AvatarGroupExpandable
  items={teamMembers}
  max={3}
  title="Team Members"
/>
```

### Without Tooltip

```tsx
<AvatarGroup
  items={users}
  showTooltip={false}
/>
```

## States

| State | Display | Tooltip | Overflow |
|-------|---------|---------|----------|
| Few items | all avatars | names | hidden |
| Many items | max avatars | names | +N visible |
| Hover (avatar) | highlight | name shown | - |
| Hover (overflow) | highlight | remaining names | - |
| Focus | ring | - | - |

## Accessibility

### Required ARIA Attributes

- `role="group"` on container
- `aria-label` with total count
- Individual avatar alt text
- Overflow button aria-label

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus overflow indicator |
| `Enter/Space` | Open expanded view (if expandable) |
| `Escape` | Close dialog |

### Screen Reader Announcements

- Total number of users announced
- Individual names on focus
- "+N more users" for overflow

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-tooltip": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.2"
  }
}
```

### Installation

```bash
npm install @radix-ui/react-tooltip @radix-ui/react-dialog
```

## Examples

### Task Assignees

```tsx
import { AvatarGroup } from "@/components/ui/avatar-group";

export function TaskCard({ task }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{task.title}</h3>
          <p className="text-sm text-muted-foreground">{task.status}</p>
        </div>
        <AvatarGroup
          items={task.assignees}
          max={3}
          size="sm"
        />
      </CardContent>
    </Card>
  );
}
```

### Comment Thread

```tsx
import { AvatarGroup } from "@/components/ui/avatar-group";

export function CommentThread({ comments }) {
  const participants = [...new Map(
    comments.map(c => [c.author.id, c.author])
  ).values()];

  return (
    <div className="flex items-center gap-2">
      <AvatarGroup items={participants} max={5} size="xs" />
      <span className="text-xs text-muted-foreground">
        {comments.length} comments
      </span>
    </div>
  );
}
```

### Team Widget

```tsx
import { AvatarGroupExpandable } from "@/components/ui/avatar-group-expandable";

export function TeamWidget({ team }) {
  const members = team.members.map(m => ({
    id: m.id,
    name: m.name,
    image: m.avatar,
    subtitle: m.role,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
      </CardHeader>
      <CardContent>
        <AvatarGroupExpandable
          items={members}
          max={4}
          title={`${team.name} Members`}
        />
      </CardContent>
    </Card>
  );
}
```

### Reactions Display

```tsx
import { AvatarGroup } from "@/components/ui/avatar-group";

export function ReactionUsers({ reaction, users }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted">
      <span className="text-lg">{reaction}</span>
      <AvatarGroup
        items={users}
        max={3}
        size="xs"
        showTooltip
      />
      {users.length > 1 && (
        <span className="text-xs text-muted-foreground">
          {users.length}
        </span>
      )}
    </div>
  );
}
```

## Anti-patterns

### Too Many Visible Avatars

```tsx
// Bad - cluttered display
<AvatarGroup items={users} max={10} />

// Good - keep it compact
<AvatarGroup items={users} max={4} />
```

### Missing Alt Text

```tsx
// Bad - no accessibility
items={[{ id: "1", image: "/avatar.jpg" }]}

// Good - include name for alt text
items={[{ id: "1", name: "John Doe", image: "/avatar.jpg" }]}
```

### No Fallback for Missing Images

```tsx
// Bad - broken images with no fallback
<Avatar>
  <AvatarImage src={user.avatar} />
</Avatar>

// Good - include fallback
<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.initials}</AvatarFallback>
</Avatar>
```

## Related Skills

### Composes From
- [atoms/display-avatar](../atoms/display-avatar.md) - Individual avatars
- [atoms/interactive-tooltip](../atoms/interactive-tooltip.md) - Name tooltips

### Composes Into
- [molecules/card](./card.md) - Team cards
- [organisms/data-table](../organisms/data-table.md) - Assignee columns

### Alternatives
- Single [display-avatar](../atoms/display-avatar.md) - For one user
- List of names - For detailed display

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with overflow handling
- Size and direction variants
- AvatarGroupExpandable with dialog
- Tooltip integration
