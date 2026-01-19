---
id: m-notification-badge
name: Notification Badge
version: 2.0.0
layer: L2
category: data
description: Badge overlay for avatars, icons, or any element showing count or status
tags: [badge, notification, count, status, indicator]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "NotificationBadge = Badge(a-display-badge) + Count(a-display-text) + ChildElement"
composes:
  - ../atoms/display-badge.md
  - ../atoms/display-text.md
dependencies:
  react: "^19.0.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Notification Badge

## Overview

A notification badge molecule that overlays a count or status indicator on any element like avatars, icons, or buttons. Supports numeric counts with max limits, dot indicators, and various positioning options.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     NotificationBadge                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│      ┌───────────────────────────────────┐  ┌──────────┐        │
│      │                                   │  │  Badge   │        │
│      │         Child Element             │  │ (a-disp- │        │
│      │        (Avatar, Icon, etc)        │  │lay-badge)│        │
│      │                                   │  │          │        │
│      │              👤                   │──│   [5]    │        │
│      │                                   │  │          │        │
│      └───────────────────────────────────┘  └──────────┘        │
│                                                ↑ positioned     │
│                                                  top-right      │
└─────────────────────────────────────────────────────────────────┘

Variants:
┌──────────────────────────────────────────────────────────────────┐
│   👤[3]        👤[99+]       👤[•]         👤[●]                │
│   Count       Max limit    Dot variant   Pulse animation        │
└──────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/molecules/notification-badge.tsx
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Types
interface NotificationBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  dot?: boolean;
  pulse?: boolean;
  invisible?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
}

interface BadgeContentProps extends VariantProps<typeof badgeVariants> {
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  dot?: boolean;
  pulse?: boolean;
}

// Styles
const badgeVariants = cva(
  'absolute flex items-center justify-center font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-destructive text-destructive-foreground',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
      },
      size: {
        sm: 'min-w-[16px] h-4 text-[10px] px-1',
        md: 'min-w-[20px] h-5 text-xs px-1.5',
        lg: 'min-w-[24px] h-6 text-sm px-2',
      },
      position: {
        'top-right': '-top-1 -right-1',
        'top-left': '-top-1 -left-1',
        'bottom-right': '-bottom-1 -right-1',
        'bottom-left': '-bottom-1 -left-1',
        'top-right-inside': 'top-0 right-0',
        'top-left-inside': 'top-0 left-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      position: 'top-right',
    },
  }
);

const dotVariants = cva(
  'absolute rounded-full transition-all',
  {
    variants: {
      variant: {
        default: 'bg-destructive',
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
      },
      size: {
        sm: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
      },
      position: {
        'top-right': '-top-0.5 -right-0.5',
        'top-left': '-top-0.5 -left-0.5',
        'bottom-right': '-bottom-0.5 -right-0.5',
        'bottom-left': '-bottom-0.5 -left-0.5',
        'top-right-inside': 'top-0 right-0',
        'top-left-inside': 'top-0 left-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      position: 'top-right',
    },
  }
);

// Format count with max limit
function formatCount(count: number, maxCount: number): string {
  if (count > maxCount) {
    return `${maxCount}+`;
  }
  return count.toString();
}

// Badge Content Component
function BadgeContent({
  count,
  maxCount = 99,
  showZero = false,
  dot = false,
  pulse = false,
  variant,
  size,
  position,
}: BadgeContentProps) {
  // Dot indicator
  if (dot) {
    return (
      <span
        className={cn(
          dotVariants({ variant, size, position }),
          pulse && 'animate-pulse'
        )}
      />
    );
  }

  // Don't show if count is 0 and showZero is false
  if (count === undefined || (count === 0 && !showZero)) {
    return null;
  }

  const displayCount = formatCount(count, maxCount);

  return (
    <span
      className={cn(
        badgeVariants({ variant, size, position }),
        'rounded-full',
        pulse && 'animate-pulse'
      )}
    >
      {displayCount}
    </span>
  );
}

// Main Notification Badge Component
export function NotificationBadge({
  count,
  maxCount = 99,
  showZero = false,
  dot = false,
  pulse = false,
  invisible = false,
  variant,
  size,
  position,
  children,
  className,
  'aria-label': ariaLabel,
  ...props
}: NotificationBadgeProps) {
  // Determine if badge should be visible
  const shouldShow = !invisible && (dot || (count !== undefined && (count > 0 || showZero)));

  // Screen reader text
  const srText = React.useMemo(() => {
    if (ariaLabel) return ariaLabel;
    if (dot) return 'Has notifications';
    if (count === undefined) return '';
    if (count === 0) return 'No notifications';
    if (count === 1) return '1 notification';
    return `${count > maxCount ? `${maxCount}+` : count} notifications`;
  }, [ariaLabel, dot, count, maxCount]);

  return (
    <div className={cn('relative inline-flex', className)} {...props}>
      {children}
      
      {shouldShow && (
        <>
          <BadgeContent
            count={count}
            maxCount={maxCount}
            showZero={showZero}
            dot={dot}
            pulse={pulse}
            variant={variant}
            size={size}
            position={position}
          />
          <span className="sr-only">{srText}</span>
        </>
      )}
    </div>
  );
}

// Icon with Badge (common use case)
interface IconBadgeProps extends Omit<NotificationBadgeProps, 'children'> {
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  buttonClassName?: string;
}

export function IconBadge({
  icon,
  onClick,
  href,
  buttonClassName,
  ...badgeProps
}: IconBadgeProps) {
  const content = (
    <NotificationBadge {...badgeProps}>
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
          'hover:bg-accent',
          buttonClassName
        )}
      >
        {icon}
      </span>
    </NotificationBadge>
  );

  if (href) {
    return (
      <a href={href} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
      >
        {content}
      </button>
    );
  }

  return content;
}

// Avatar with Status Badge
interface AvatarBadgeProps {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  showBadge?: boolean;
  badgeCount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  none: '',
};

export function AvatarBadge({
  src,
  alt = '',
  fallback,
  status = 'none',
  showBadge = false,
  badgeCount,
  size = 'md',
  className,
}: AvatarBadgeProps) {
  const initials = React.useMemo(() => {
    if (fallback) return fallback;
    return alt
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [alt, fallback]);

  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Avatar */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full bg-muted overflow-hidden',
          avatarSizes[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-medium text-muted-foreground">
            {initials}
          </span>
        )}
      </div>

      {/* Status indicator */}
      {status !== 'none' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            statusColors[status],
            size === 'sm' && 'h-2.5 w-2.5',
            size === 'md' && 'h-3 w-3',
            size === 'lg' && 'h-3.5 w-3.5',
            size === 'xl' && 'h-4 w-4'
          )}
          aria-label={`Status: ${status}`}
        />
      )}

      {/* Notification badge */}
      {showBadge && (badgeCount || badgeCount === 0) && (
        <span
          className={cn(
            'absolute -top-1 -right-1 flex items-center justify-center rounded-full',
            'bg-destructive text-destructive-foreground font-medium',
            size === 'sm' && 'min-w-[14px] h-3.5 text-[9px] px-0.5',
            size === 'md' && 'min-w-[16px] h-4 text-[10px] px-1',
            size === 'lg' && 'min-w-[18px] h-4.5 text-xs px-1',
            size === 'xl' && 'min-w-[20px] h-5 text-xs px-1.5'
          )}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </div>
  );
}

// Standalone Badge (for use outside of overlays)
export function Badge({
  count,
  maxCount = 99,
  dot = false,
  variant = 'default',
  size = 'md',
  pulse = false,
  className,
}: Omit<NotificationBadgeProps, 'children' | 'position' | 'invisible'>) {
  if (dot) {
    return (
      <span
        className={cn(
          'inline-block rounded-full',
          variant === 'default' && 'bg-destructive',
          variant === 'primary' && 'bg-primary',
          variant === 'secondary' && 'bg-secondary',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'info' && 'bg-blue-500',
          size === 'sm' && 'h-2 w-2',
          size === 'md' && 'h-2.5 w-2.5',
          size === 'lg' && 'h-3 w-3',
          pulse && 'animate-pulse',
          className
        )}
      />
    );
  }

  if (count === undefined || count === 0) {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        variant === 'default' && 'bg-destructive text-destructive-foreground',
        variant === 'primary' && 'bg-primary text-primary-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'success' && 'bg-green-500 text-white',
        variant === 'warning' && 'bg-yellow-500 text-white',
        variant === 'info' && 'bg-blue-500 text-white',
        size === 'sm' && 'min-w-[16px] h-4 text-[10px] px-1',
        size === 'md' && 'min-w-[20px] h-5 text-xs px-1.5',
        size === 'lg' && 'min-w-[24px] h-6 text-sm px-2',
        pulse && 'animate-pulse',
        className
      )}
    >
      {formatCount(count, maxCount)}
    </span>
  );
}
```

## Variants

### Color Variants

```tsx
<NotificationBadge variant="default" count={5} />  // Red
<NotificationBadge variant="primary" count={5} />  // Primary color
<NotificationBadge variant="success" count={5} />  // Green
<NotificationBadge variant="warning" count={5} />  // Yellow
<NotificationBadge variant="info" count={5} />     // Blue
```

### Size Variants

```tsx
<NotificationBadge size="sm" count={5} />
<NotificationBadge size="md" count={5} />
<NotificationBadge size="lg" count={5} />
```

### Position Variants

```tsx
<NotificationBadge position="top-right" count={5} />
<NotificationBadge position="top-left" count={5} />
<NotificationBadge position="bottom-right" count={5} />
<NotificationBadge position="bottom-left" count={5} />
```

### Dot vs Count

```tsx
<NotificationBadge count={42}>...</NotificationBadge>
<NotificationBadge dot>...</NotificationBadge>
<NotificationBadge dot pulse>...</NotificationBadge>
```

## Usage

### Basic Notification Badge

```tsx
import { NotificationBadge } from '@/components/molecules/notification-badge';
import { Bell } from 'lucide-react';

export function NotificationIcon({ count }) {
  return (
    <NotificationBadge count={count}>
      <button className="p-2 rounded-full hover:bg-accent">
        <Bell className="h-5 w-5" />
      </button>
    </NotificationBadge>
  );
}
```

### Icon with Badge

```tsx
import { IconBadge } from '@/components/molecules/notification-badge';
import { Bell, Mail, ShoppingCart } from 'lucide-react';

export function HeaderIcons({ notifications, messages, cartItems }) {
  return (
    <div className="flex items-center gap-2">
      <IconBadge
        icon={<Bell className="h-5 w-5" />}
        count={notifications}
        onClick={() => openNotifications()}
      />
      <IconBadge
        icon={<Mail className="h-5 w-5" />}
        count={messages}
        variant="primary"
        href="/messages"
      />
      <IconBadge
        icon={<ShoppingCart className="h-5 w-5" />}
        count={cartItems}
        variant="success"
        href="/cart"
      />
    </div>
  );
}
```

### Avatar with Status

```tsx
import { AvatarBadge } from '@/components/molecules/notification-badge';

export function UserList({ users }) {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <AvatarBadge
            src={user.avatar}
            alt={user.name}
            status={user.isOnline ? 'online' : 'offline'}
            size="md"
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Dot Indicator (No Count)

```tsx
import { NotificationBadge } from '@/components/molecules/notification-badge';

export function UnreadIndicator({ hasUnread }) {
  return (
    <NotificationBadge dot={hasUnread} pulse={hasUnread} variant="info">
      <span>Messages</span>
    </NotificationBadge>
  );
}
```

### With Max Count

```tsx
import { NotificationBadge } from '@/components/molecules/notification-badge';

// Shows "99+" when count exceeds maxCount
<NotificationBadge count={150} maxCount={99}>
  <InboxIcon />
</NotificationBadge>

// Shows "9+" for smaller badges
<NotificationBadge count={25} maxCount={9} size="sm">
  <SmallIcon />
</NotificationBadge>
```

### Standalone Badge

```tsx
import { Badge } from '@/components/molecules/notification-badge';

export function TabWithBadge({ label, count }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2">
      <span>{label}</span>
      <Badge count={count} size="sm" />
    </button>
  );
}
```

## Anti-patterns

```tsx
// Don't forget screen reader support
<NotificationBadge count={5}>
  <Icon /> // Badge is purely visual
</NotificationBadge>

// Component includes sr-only text automatically, but custom labels help
<NotificationBadge count={5} aria-label="5 unread messages">
  <Icon />
</NotificationBadge>

// Don't use large numbers without maxCount
<NotificationBadge count={99999}>...</NotificationBadge> // Overflows

// Do use maxCount
<NotificationBadge count={99999} maxCount={99}>...</NotificationBadge> // Shows 99+

// Don't animate constantly - use pulse sparingly
<NotificationBadge pulse count={0}>...</NotificationBadge> // Distracting

// Do animate only for important notifications
<NotificationBadge pulse={hasUrgentNotification} count={count}>...</NotificationBadge>
```

## Related Skills

- `atoms/avatar` - Base avatar component
- `atoms/feedback-badge-notification` - Simple badge atom
- `organisms/notification-center` - Full notification center

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with count and dot variants
- Multiple color and size variants
- Position options (corners and inside)
- IconBadge for common icon+badge pattern
- AvatarBadge with status indicators
- Standalone Badge component
- Screen reader support
- Pulse animation option
