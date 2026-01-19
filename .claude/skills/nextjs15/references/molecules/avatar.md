---
id: m-avatar
name: Avatar
version: 2.0.0
layer: L2
category: display
description: User avatar component with image support and fallback to initials
tags: [avatar, user, profile, image, fallback, initials]
formula: "Avatar = Image(a-display-image) + Fallback(a-display-text) + Status(a-display-badge)"
composes:
  - ../atoms/display-avatar.md
  - ../atoms/display-image.md
  - ../atoms/display-text.md
  - ../atoms/display-badge.md
dependencies:
  "@radix-ui/react-avatar": "^1.1.0"
performance:
  impact: low
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Avatar

## Overview

The Avatar molecule displays user profile images with intelligent fallback to initials when images fail to load or are unavailable. Supports multiple sizes, shapes, status indicators, and can be composed into avatar groups.

## When to Use

Use this skill when:
- Displaying user profile pictures
- Showing author/creator information
- Building user lists or comment sections
- Creating profile headers or cards

## Composition Diagram

```
+-----------------------------------------------+
|                    Avatar                      |
+-----------------------------------------------+
|  +------------------------------------------+ |
|  |              Image Container              | |
|  |  +------------------------------------+  | |
|  |  |     AvatarImage (a-display-image)  |  | |
|  |  |            [User Photo]            |  | |
|  |  +------------------------------------+  | |
|  |  +------------------------------------+  | |
|  |  |   AvatarFallback (a-display-text)  |  | |
|  |  |              "JD"                  |  | |
|  |  +------------------------------------+  | |
|  +------------------------------------------+ |
|  +------------------------------------------+ |
|  |       Status Indicator (optional)        | |
|  |   (a-display-badge) - online/offline     | |
|  +------------------------------------------+ |
+-----------------------------------------------+
```

## Atoms Used

- [display-avatar](../atoms/display-avatar.md) - Base avatar primitive
- [display-image](../atoms/display-image.md) - User image
- [display-text](../atoms/display-text.md) - Fallback initials
- [display-badge](../atoms/display-badge.md) - Status indicator

## Implementation

```typescript
// components/ui/avatar.tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-24 w-24 text-2xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  }
);

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  name?: string;
  status?: "online" | "offline" | "away" | "busy";
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
    "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
    "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
    "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-amber-500",
  busy: "bg-red-500",
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, src, alt, name, size, shape, status, ...props }, ref) => {
  const initials = name ? getInitials(name) : "?";
  const fallbackColor = name ? getColorFromName(name) : "bg-muted";

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src || undefined}
          alt={alt || name || "User avatar"}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn(
            "flex h-full w-full items-center justify-center font-medium text-white",
            fallbackColor
          )}
          delayMs={600}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            statusColors[status],
            size === "xs" && "h-1.5 w-1.5",
            size === "sm" && "h-2 w-2",
            size === "md" && "h-2.5 w-2.5",
            size === "lg" && "h-3 w-3",
            size === "xl" && "h-4 w-4",
            size === "2xl" && "h-5 w-5"
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

export { Avatar, avatarVariants };
```

## Variants

### Sizes

```tsx
<Avatar name="John Doe" size="xs" />
<Avatar name="John Doe" size="sm" />
<Avatar name="John Doe" size="md" />
<Avatar name="John Doe" size="lg" />
<Avatar name="John Doe" size="xl" />
<Avatar name="John Doe" size="2xl" />
```

### With Image

```tsx
<Avatar
  src="/avatars/john.jpg"
  alt="John Doe"
  name="John Doe"
  size="lg"
/>
```

### With Status

```tsx
<Avatar name="John Doe" status="online" />
<Avatar name="Jane Smith" status="away" />
<Avatar name="Bob Wilson" status="busy" />
<Avatar name="Alice Brown" status="offline" />
```

### Square Shape

```tsx
<Avatar
  name="Acme Inc"
  shape="square"
  size="lg"
/>
```

## States

| State | Image | Fallback | Status |
|-------|-------|----------|--------|
| Loading | hidden | visible | visible |
| Loaded | visible | hidden | visible |
| Error | hidden | visible | visible |
| No src | hidden | visible | visible |

## Accessibility

### Required ARIA Attributes

- `alt` on image for screen readers
- `aria-label` on status indicator

### Screen Reader Announcements

- User name announced via alt text
- Status announced via aria-label

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.0",
    "class-variance-authority": "^0.7.1"
  }
}
```

## Examples

### User Profile Card

```tsx
<div className="flex items-center gap-3">
  <Avatar
    src={user.avatar}
    name={user.name}
    status={user.isOnline ? "online" : "offline"}
    size="lg"
  />
  <div>
    <p className="font-medium">{user.name}</p>
    <p className="text-sm text-muted-foreground">{user.email}</p>
  </div>
</div>
```

### Comment Author

```tsx
<div className="flex gap-3">
  <Avatar
    src={comment.author.avatar}
    name={comment.author.name}
    size="sm"
  />
  <div className="flex-1">
    <p className="text-sm font-medium">{comment.author.name}</p>
    <p className="text-sm text-muted-foreground">{comment.text}</p>
  </div>
</div>
```

## Anti-patterns

### Missing Name for Fallback

```tsx
// Bad - no fallback content
<Avatar src={maybeNull} />

// Good - provide name for fallback
<Avatar src={maybeNull} name="John Doe" />
```

## Related Skills

### Composes From
- [atoms/display-avatar](../atoms/display-avatar.md) - Base primitive

### Composes Into
- [molecules/avatar-group](./avatar-group.md) - Multiple avatars
- [molecules/presence-avatars](./presence-avatars.md) - Online users

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Size and shape variants
- Status indicator support
- Intelligent fallback with initials
