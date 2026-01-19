---
id: a-display-avatar
name: Avatar
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Avatar with fallback, sizes, and shapes
tags: [display, avatar, user, image]
dependencies:
  - "@radix-ui/react-avatar@1.1.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Avatar

## Overview

The Avatar atom displays user profile images with intelligent fallback handling. Built on Radix UI's Avatar primitive, it gracefully degrades to initials or a placeholder when images fail to load.

## When to Use

Use this skill when:
- Displaying user profile pictures
- Showing author/creator information
- Building user lists or comment sections
- Creating avatar groups

## Implementation

```typescript
// components/ui/avatar.tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
```

### Avatar with User Data

```typescript
// components/ui/user-avatar.tsx
import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

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

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  name?: string;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({
  src,
  alt,
  name,
  size,
  shape,
  className,
}: UserAvatarProps) {
  const initials = name ? getInitials(name) : "?";
  const fallbackColor = name ? getColorFromName(name) : "bg-muted";

  return (
    <Avatar className={cn(avatarVariants({ size, shape }), className)}>
      <AvatarImage src={src || undefined} alt={alt || name || "User"} />
      <AvatarFallback className={cn(fallbackColor, "text-white font-medium")}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
```

### Avatar with Status

```typescript
// components/ui/avatar-status.tsx
import * as React from "react";
import { UserAvatar } from "./user-avatar";
import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "away" | "busy";

interface AvatarStatusProps extends React.ComponentProps<typeof UserAvatar> {
  status?: Status;
}

const statusColors: Record<Status, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-amber-500",
  busy: "bg-red-500",
};

export function AvatarStatus({ status, className, ...props }: AvatarStatusProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <UserAvatar {...props} />
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background",
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
```

## Variants

### Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| xs | 24px | Inline mentions |
| sm | 32px | Comments, compact lists |
| md | 40px | Default, lists |
| lg | 48px | Cards, headers |
| xl | 64px | Profile pages |
| 2xl | 96px | Profile hero |

### Shapes

| Shape | Class | Use Case |
|-------|-------|----------|
| circle | rounded-full | User avatars (default) |
| square | rounded-lg | Company logos, apps |

## Accessibility

### Alt Text

- Always provide meaningful alt text
- Use user's name or "User avatar"
- For decorative avatars, use `alt=""`

### Screen Reader

- Fallback initials should have name announced
- Status indicators need aria-label

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-avatar": "1.1.0",
    "class-variance-authority": "0.7.1"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="John Doe" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### With UserAvatar

```tsx
import { UserAvatar } from "@/components/ui/user-avatar";

// With image
<UserAvatar
  src="/avatars/john.jpg"
  name="John Doe"
/>

// Without image (shows initials)
<UserAvatar
  name="Jane Smith"
/>

// Different sizes
<UserAvatar name="User" size="xs" />
<UserAvatar name="User" size="sm" />
<UserAvatar name="User" size="md" />
<UserAvatar name="User" size="lg" />
<UserAvatar name="User" size="xl" />
```

### With Status

```tsx
import { AvatarStatus } from "@/components/ui/avatar-status";

<AvatarStatus
  src="/avatars/john.jpg"
  name="John Doe"
  status="online"
/>

<AvatarStatus
  name="Jane Smith"
  status="away"
/>
```

### Square Avatar

```tsx
<UserAvatar
  src="/company-logo.png"
  name="Acme Inc"
  shape="square"
/>
```

### User Card

```tsx
<div className="flex items-center gap-3">
  <UserAvatar
    src={user.avatar}
    name={user.name}
    size="lg"
  />
  <div>
    <p className="font-medium">{user.name}</p>
    <p className="text-sm text-muted-foreground">{user.email}</p>
  </div>
</div>
```

### Comment Avatar

```tsx
<div className="flex gap-3">
  <UserAvatar
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

### Missing Fallback

```tsx
// Bad - no fallback
<Avatar>
  <AvatarImage src={maybeNull} />
</Avatar>

// Good - with fallback
<Avatar>
  <AvatarImage src={maybeNull} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Empty Alt Text Without Decorative Intent

```tsx
// Bad - empty alt on meaningful avatar
<AvatarImage src={user.avatar} alt="" />

// Good - descriptive alt
<AvatarImage src={user.avatar} alt={user.name} />
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Fallback colors
- [borders](../primitives/borders.md) - Border radius

### Composes Into
- [avatar-group](../molecules/avatar-group.md) - Multiple avatars
- [header](../organisms/header.md) - User menu
- [testimonials](../organisms/testimonials.md) - Author avatars

### Related
- [display-image](./display-image.md) - General images

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix Avatar
- Size and shape variants
- Intelligent fallback handling
