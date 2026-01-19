---
id: o-notification-center
name: Notification Center
version: 2.0.0
layer: L3
category: user
composes:
  - ../molecules/notification-badge.md
description: Full notification inbox with filtering, mark as read, and real-time updates
tags: [notifications, inbox, alerts, realtime, dropdown]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "NotificationCenter = Popover(m-popover) + NotificationBadge(m-notification-badge) + Button(a-button) + Avatar(a-avatar) + Badge(a-badge)"
dependencies:
  - react
  - "@radix-ui/react-popover"
  - "@tanstack/react-query"
  - lucide-react
  - date-fns
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Notification Center

## Overview

A comprehensive notification center organism with inbox-style UI, filtering, bulk actions, real-time updates, and persistent state. Supports multiple notification types with custom rendering.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NotificationCenter                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Trigger:                                                                   │
│  ┌─────────────────────┐                                                    │
│  │  ┌───────────────┐  │                                                    │
│  │  │ Button        │  │                                                    │
│  │  │  (a-button)   │  │                                                    │
│  │  │    🔔         │  │                                                    │
│  │  │  ┌─────┐      │  │                                                    │
│  │  │  │Badge│ (5)  │  │ ← NotificationBadge (m-notification-badge)         │
│  │  │  └─────┘      │  │                                                    │
│  │  └───────────────┘  │                                                    │
│  └─────────────────────┘                                                    │
│            ↓                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Popover (m-popover)                                                 │   │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │ │ Header                                                          │ │   │
│  │ │  Notifications           ┌────────┐ ┌────────┐                  │ │   │
│  │ │                          │ Button │ │ Button │                  │ │   │
│  │ │                          │ ✓✓ All │ │  ⚙️    │                  │ │   │
│  │ │                          └────────┘ └────────┘                  │ │   │
│  │ └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │ │ Filter Tabs                                                     │ │   │
│  │ │  [ All ]  [ Unread (5) ]  [ Read ]                              │ │   │
│  │ │     ▔▔▔                                                         │ │   │
│  │ └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │ │ Notification List (scrollable)                                  │ │   │
│  │ │ ┌─────────────────────────────────────────────────────────────┐ │ │   │
│  │ │ │ ● ┌────────┐  New message received         ┌─────┐ ┌─────┐ │ │ │   │
│  │ │ │   │ Avatar │  You have a new message...    │  ✓  │ │  🗑  │ │ │ │   │
│  │ │ │   │(a-avtr)│  2 min ago                    │     │ │     │ │ │ │   │
│  │ │ │   └────────┘                               └─────┘ └─────┘ │ │ │   │
│  │ │ ├─────────────────────────────────────────────────────────────┤ │ │   │
│  │ │ │   ┌────────┐  Task completed               ┌─────┐ ┌─────┐ │ │ │   │
│  │ │ │   │  Icon  │  Your task was finished       │     │ │  🗑  │ │ │ │   │
│  │ │ │   │  ✓ ●   │  1 hour ago                   │     │ │     │ │ │ │   │
│  │ │ │   └────────┘                               └─────┘ └─────┘ │ │ │   │
│  │ │ └─────────────────────────────────────────────────────────────┘ │ │   │
│  │ └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │ │ Footer                                                          │ │   │
│  │ │          [ View all notifications ]                             │ │   │
│  │ └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/notification-center.tsx
'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  X,
  Mail,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Types
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'system';
  title: string;
  description?: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
  avatar?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
  maxHeight?: number;
  pollInterval?: number;
}

// Notification type icons and colors
const notificationConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  message: {
    icon: MessageSquare,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  system: {
    icon: Bell,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
};

// API functions (implement these based on your backend)
async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch('/api/notifications');
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

async function markAsRead(ids: string[]): Promise<void> {
  await fetch('/api/notifications/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

async function markAllAsRead(): Promise<void> {
  await fetch('/api/notifications/read-all', { method: 'POST' });
}

async function deleteNotifications(ids: string[]): Promise<void> {
  await fetch('/api/notifications', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

// Single Notification Item
function NotificationItem({
  notification,
  onClick,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onClick?: () => void;
  onMarkRead?: () => void;
  onDelete?: () => void;
}) {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'group relative flex gap-3 p-4 transition-colors',
        'hover:bg-accent/50 cursor-pointer',
        !notification.read && 'bg-accent/20'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}

      {/* Icon or Avatar */}
      <div
        className={cn(
          'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
          config.bgColor
        )}
      >
        {notification.avatar ? (
          <img
            src={notification.avatar}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <Icon className={cn('h-5 w-5', config.iconColor)} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm',
            !notification.read ? 'font-semibold' : 'font-medium'
          )}
        >
          {notification.title}
        </p>
        {notification.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {notification.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
          {notification.actionLabel && (
            <span className="text-xs text-primary font-medium">
              {notification.actionLabel}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center gap-1',
          'opacity-0 group-hover:opacity-100 transition-opacity'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.read && (
          <button
            onClick={onMarkRead}
            className="p-1.5 rounded hover:bg-accent"
            aria-label="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Filter Tabs
type FilterType = 'all' | 'unread' | 'read';

function FilterTabs({
  value,
  onChange,
  unreadCount,
}: {
  value: FilterType;
  onChange: (value: FilterType) => void;
  unreadCount: number;
}) {
  return (
    <div className="flex border-b">
      {(['all', 'unread', 'read'] as const).map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            'border-b-2 -mb-px',
            value === filter
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
          {filter === 'unread' && unreadCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Empty State
function EmptyState({ filter }: { filter: FilterType }) {
  const messages = {
    all: "You're all caught up!",
    unread: 'No unread notifications',
    read: 'No read notifications',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{messages[filter]}</p>
    </div>
  );
}

// Main Notification Center
export function NotificationCenter({
  onNotificationClick,
  onSettingsClick,
  maxHeight = 480,
  pollInterval = 30000,
}: NotificationCenterProps) {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<FilterType>('all');
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: pollInterval,
  });

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Computed values
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const filteredNotifications = React.useMemo(() => {
    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'read':
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  // Handlers
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markReadMutation.mutate([notification.id]);
    }
    onNotificationClick?.(notification);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-full',
            'hover:bg-accent transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          )}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[400px] rounded-lg border bg-popover shadow-lg"
          sideOffset={8}
          align="end"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Notifications</h2>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="p-1.5 rounded hover:bg-accent text-sm flex items-center gap-1"
                  disabled={markAllReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Mark all read</span>
                </button>
              )}
              {onSettingsClick && (
                <button
                  onClick={onSettingsClick}
                  className="p-1.5 rounded hover:bg-accent"
                  aria-label="Notification settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <FilterTabs
            value={filter}
            onChange={setFilter}
            unreadCount={unreadCount}
          />

          {/* Notification List */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkRead={() => markReadMutation.mutate([notification.id])}
                    onDelete={() => deleteMutation.mutate([notification.id])}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="border-t p-2">
              <a
                href="/notifications"
                className="block w-full rounded-md py-2 text-center text-sm font-medium text-primary hover:bg-accent"
              >
                View all notifications
              </a>
            </div>
          )}

          <Popover.Arrow className="fill-popover" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Hook for managing notifications programmatically
export function useNotifications() {
  const queryClient = useQueryClient();

  const addNotification = React.useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => [
        {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          read: false,
        },
        ...old,
      ]);
    },
    [queryClient]
  );

  const markAsRead = React.useCallback(
    (ids: string[]) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
    },
    [queryClient]
  );

  const clearAll = React.useCallback(() => {
    queryClient.setQueryData(['notifications'], []);
  }, [queryClient]);

  return { addNotification, markAsRead, clearAll };
}
```

## Usage

### Basic Usage

```tsx
import { NotificationCenter } from '@/components/organisms/notification-center';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Header() {
  return (
    <QueryClientProvider client={queryClient}>
      <header className="flex items-center justify-between p-4">
        <Logo />
        <NotificationCenter
          onNotificationClick={(notification) => {
            console.log('Clicked:', notification);
          }}
          onSettingsClick={() => {
            router.push('/settings/notifications');
          }}
        />
      </header>
    </QueryClientProvider>
  );
}
```

### With Real-time Updates (WebSocket)

```tsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationProvider({ children }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/notifications');
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      queryClient.setQueryData(['notifications'], (old = []) => [
        notification,
        ...old,
      ]);
    };

    return () => ws.close();
  }, [queryClient]);

  return children;
}
```

### Programmatic Notifications

```tsx
import { useNotifications } from '@/components/organisms/notification-center';

export function PaymentForm() {
  const { addNotification } = useNotifications();

  const handlePayment = async () => {
    try {
      await processPayment();
      addNotification({
        type: 'success',
        title: 'Payment successful',
        description: 'Your payment has been processed.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Payment failed',
        description: error.message,
      });
    }
  };

  return <button onClick={handlePayment}>Pay</button>;
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Popover is hidden | Only bell icon button visible with optional badge |
| Open | Popover is visible | Dropdown panel showing notifications list |
| Loading | Fetching notifications | Spinner centered in notification list area |
| Empty (All) | No notifications exist | Bell icon with "You're all caught up!" message |
| Empty (Unread) | No unread notifications | "No unread notifications" message |
| Empty (Read) | No read notifications | "No read notifications" message |
| Has Unread | Unread notifications present | Red badge on trigger button shows count (max "99+") |
| Notification Unread | Individual notification not read | Blue dot indicator, accent background tint, bold title |
| Notification Read | Individual notification marked read | Normal background, regular font weight, no dot |
| Notification Hover | Mouse over notification item | Accent/50 background, action buttons visible |
| Filter: All | Showing all notifications | "All" tab active with primary underline |
| Filter: Unread | Showing only unread | "Unread" tab active with count badge |
| Filter: Read | Showing only read | "Read" tab active |

## Anti-patterns

### Bad: Polling too frequently

```tsx
// Bad - Polling every second wastes resources
const { data } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 1000, // Too frequent!
});

// Good - Use reasonable polling interval or WebSockets
const { data } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 30000, // 30 seconds is reasonable
});

// Better - Use WebSocket for real-time updates
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/notifications');
  ws.onmessage = (event) => {
    queryClient.setQueryData(['notifications'], (old = []) => [
      JSON.parse(event.data),
      ...old,
    ]);
  };
  return () => ws.close();
}, []);
```

### Bad: Not using optimistic updates for mark as read

```tsx
// Bad - Waiting for server response
async function handleMarkRead(id: string) {
  await api.markAsRead(id);
  refetch(); // Slow, causes flicker
}

// Good - Optimistic update with React Query
const markReadMutation = useMutation({
  mutationFn: markAsRead,
  onMutate: async (ids) => {
    await queryClient.cancelQueries({ queryKey: ['notifications'] });
    const previous = queryClient.getQueryData(['notifications']);
    queryClient.setQueryData(['notifications'], (old) =>
      old.map((n) => ids.includes(n.id) ? { ...n, read: true } : n)
    );
    return { previous };
  },
  onError: (err, ids, context) => {
    queryClient.setQueryData(['notifications'], context.previous);
  },
});
```

### Bad: Not handling notification click navigation

```tsx
// Bad - Clicking does nothing useful
<div onClick={() => console.log('clicked')}>
  {notification.title}
</div>

// Good - Mark as read and navigate to action URL
const handleNotificationClick = (notification: Notification) => {
  if (!notification.read) {
    markReadMutation.mutate([notification.id]);
  }
  onNotificationClick?.(notification);
  if (notification.actionUrl) {
    window.location.href = notification.actionUrl;
  }
};
```

### Bad: Missing keyboard accessibility

```tsx
// Bad - Only clickable, no keyboard support
<div onClick={handleClick}>{notification.title}</div>

// Good - Full keyboard accessibility
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  {notification.title}
</div>
```

## Related Skills

- `molecules/notification-badge` - Badge indicator
- `patterns/websockets` - Real-time updates
- `templates/notifications-page` - Full notifications page

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation with React Query
- Filter tabs (all/unread/read)
- Mark as read/delete actions
- Real-time polling support
- useNotifications hook
