---
id: a-feedback-badge-notification
name: Notification Badge
version: 2.0.0
layer: L1
category: feedback
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Badge with notification dot or count indicator
tags: [badge, notification, dot, count, indicator, alert, unread]
performance:
  impact: low
  lcp: neutral
  cls: neutral
dependencies:
  - react
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Notification Badge

## Overview

A badge component that displays notification indicators as dots or counts. Used to show unread messages, alerts, or item counts on icons, avatars, or buttons.

## Implementation

```tsx
// components/ui/notification-badge.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const notificationBadgeVariants = cva(
  'absolute flex items-center justify-center font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        secondary: 'bg-secondary text-secondary-foreground',
      },
      size: {
        dot: 'h-2 w-2 rounded-full',
        sm: 'h-4 min-w-4 rounded-full text-[10px] px-1',
        md: 'h-5 min-w-5 rounded-full text-xs px-1.5',
        lg: 'h-6 min-w-6 rounded-full text-sm px-2',
      },
      position: {
        'top-right': '-top-1 -right-1',
        'top-left': '-top-1 -left-1',
        'bottom-right': '-bottom-1 -right-1',
        'bottom-left': '-bottom-1 -left-1',
      },
    },
    defaultVariants: {
      variant: 'destructive',
      size: 'sm',
      position: 'top-right',
    },
  }
);

export interface NotificationBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof notificationBadgeVariants> {
  /** Number to display (ignored for dot size) */
  count?: number;
  /** Maximum count to display (shows "99+" if exceeded) */
  max?: number;
  /** Show badge even when count is 0 */
  showZero?: boolean;
  /** Pulse animation for attention */
  pulse?: boolean;
  /** Hide the badge */
  hidden?: boolean;
}

const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  (
    {
      count,
      max = 99,
      showZero = false,
      pulse = false,
      hidden = false,
      variant,
      size,
      position,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if badge should be visible
    const isVisible = !hidden && (showZero || (count !== undefined && count > 0) || size === 'dot');

    if (!isVisible) {
      return <>{children}</>;
    }

    // Format count display
    const displayCount = React.useMemo(() => {
      if (size === 'dot' || count === undefined) return null;
      if (count > max) return `${max}+`;
      return count.toString();
    }, [count, max, size]);

    const badge = (
      <span
        ref={ref}
        className={cn(
          notificationBadgeVariants({ variant, size, position }),
          pulse && 'animate-pulse',
          className
        )}
        role="status"
        aria-label={count !== undefined ? `${count} notifications` : 'New notification'}
        {...props}
      >
        {displayCount}
      </span>
    );

    if (children) {
      return (
        <span className="relative inline-flex">
          {children}
          {badge}
        </span>
      );
    }

    return badge;
  }
);
NotificationBadge.displayName = 'NotificationBadge';

// Convenience wrapper component
interface BadgeWrapperProps {
  children: React.ReactNode;
  count?: number;
  showDot?: boolean;
  variant?: VariantProps<typeof notificationBadgeVariants>['variant'];
  pulse?: boolean;
  max?: number;
}

function BadgeWrapper({
  children,
  count,
  showDot = false,
  variant = 'destructive',
  pulse = false,
  max = 99,
}: BadgeWrapperProps) {
  return (
    <NotificationBadge
      count={count}
      size={showDot ? 'dot' : 'sm'}
      variant={variant}
      pulse={pulse}
      max={max}
    >
      {children}
    </NotificationBadge>
  );
}

export { NotificationBadge, BadgeWrapper, notificationBadgeVariants };
```

## Variants

### Dot Indicator

```tsx
import { Bell } from 'lucide-react';
import { NotificationBadge } from '@/components/ui/notification-badge';

function NotificationIcon() {
  return (
    <NotificationBadge size="dot" variant="destructive">
      <Bell className="h-6 w-6" />
    </NotificationBadge>
  );
}
```

### Count Badge

```tsx
import { Mail } from 'lucide-react';

function MailIcon({ unreadCount }: { unreadCount: number }) {
  return (
    <NotificationBadge count={unreadCount}>
      <Mail className="h-6 w-6" />
    </NotificationBadge>
  );
}
```

### Large Count with Max

```tsx
function CartIcon({ itemCount }: { itemCount: number }) {
  return (
    <NotificationBadge count={itemCount} max={99} size="md">
      <ShoppingCart className="h-6 w-6" />
    </NotificationBadge>
  );
}

// 5 → "5"
// 99 → "99"
// 150 → "99+"
```

### With Avatar

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

function OnlineAvatar({ 
  src, 
  name, 
  isOnline 
}: { 
  src: string; 
  name: string; 
  isOnline: boolean;
}) {
  return (
    <NotificationBadge
      size="dot"
      variant={isOnline ? 'success' : 'secondary'}
      position="bottom-right"
    >
      <Avatar>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
    </NotificationBadge>
  );
}
```

### Pulsing Alert

```tsx
function UrgentNotification() {
  return (
    <NotificationBadge size="dot" variant="destructive" pulse>
      <AlertCircle className="h-6 w-6" />
    </NotificationBadge>
  );
}
```

### Button with Badge

```tsx
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';

function InboxButton({ unreadCount }: { unreadCount: number }) {
  return (
    <Button variant="ghost" size="icon" className="relative">
      <NotificationBadge count={unreadCount}>
        <Inbox className="h-5 w-5" />
      </NotificationBadge>
    </Button>
  );
}
```

### Navigation Item

```tsx
function NavItem({
  icon: Icon,
  label,
  href,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted"
    >
      <NotificationBadge count={badge} size="sm">
        <Icon className="h-5 w-5" />
      </NotificationBadge>
      <span>{label}</span>
    </Link>
  );
}
```

### Status Badges

```tsx
type Status = 'online' | 'away' | 'busy' | 'offline';

function StatusIndicator({ status }: { status: Status }) {
  const variants: Record<Status, 'success' | 'warning' | 'destructive' | 'secondary'> = {
    online: 'success',
    away: 'warning',
    busy: 'destructive',
    offline: 'secondary',
  };

  return (
    <NotificationBadge
      size="dot"
      variant={variants[status]}
      position="bottom-right"
    />
  );
}
```

### Tab Badge

```tsx
function TabWithBadge({
  label,
  count,
  active,
}: {
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        'relative px-4 py-2',
        active && 'border-b-2 border-primary'
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <NotificationBadge
          count={count}
          size="sm"
          variant="secondary"
          position="top-right"
          className="static ml-2 inline-flex translate-x-0 translate-y-0"
        />
      )}
    </button>
  );
}
```

## Usage

```tsx
import { NotificationBadge } from '@/components/ui/notification-badge';

// Dot notification
<NotificationBadge size="dot">
  <Icon />
</NotificationBadge>

// Count badge
<NotificationBadge count={5}>
  <Icon />
</NotificationBadge>

// Large count with max
<NotificationBadge count={150} max={99} size="md">
  <Icon />
</NotificationBadge>

// Different positions
<NotificationBadge position="bottom-right" size="dot" variant="success">
  <Avatar />
</NotificationBadge>

// With pulse animation
<NotificationBadge pulse variant="destructive">
  <AlertIcon />
</NotificationBadge>
```

## Accessibility

- Uses `role="status"` for screen reader announcements
- Provides `aria-label` with count information
- Pulse animation can be disabled for reduced motion preferences

## Related Skills

- [display-badge](./display-badge.md) - Basic badge component
- [display-avatar](./display-avatar.md) - Avatar component
- [notification-center](../organisms/notification-center.md) - Full notification system

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Dot and count variants
- Position options
- Pulse animation
