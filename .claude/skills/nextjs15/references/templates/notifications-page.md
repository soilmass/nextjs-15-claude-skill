---
id: t-notifications-page
name: Notifications Page
version: 2.0.0
layer: L4
category: pages
description: Full notifications list page with filtering, bulk actions, and settings
tags: [notifications, inbox, alerts, activity, messages]
performance:
  impact: medium
  lcp: medium
  cls: low
composes:
  - ../organisms/notification-center.md
  - ../molecules/tabs.md
  - ../molecules/empty-state.md
dependencies:
  - react
  - "@tanstack/react-query"
  - date-fns
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
formula: "NotificationsPage = NotificationCenter(o-notification-center) + Tabs(m-tabs) + EmptyState(m-empty-state)"
---

# Notifications Page

## Overview

A full-page notifications view with filtering, bulk actions (mark all read, delete), notification preferences, and infinite scroll loading.

## Composition Diagram

```
+------------------------------------------------------------------+
|                     NOTIFICATIONS PAGE                            |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |                       Header                               |  |
|  |  Notifications                              [Settings]     |  |
|  |  3 unread notifications                                    |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    Actions Bar                             |  |
|  |  [x] Select all                    [Mark all read] [Filter]|  |
|  |                                                            |  |
|  |  When selected:  [Check] Mark read  [Trash] Delete         |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |           Filter Dropdown (m-tabs)                         |  |
|  |  +------------------------------------------------------+  |  |
|  |  | All notifications                              [v]   |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | o All notifications                                  |  |  |
|  |  | o Unread only                                        |  |  |
|  |  | o Comments                                           |  |  |
|  |  | o Likes                                              |  |  |
|  |  | o Follows                                            |  |  |
|  |  | o System                                             |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |        Notification List (o-notification-center)          |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [x] +--------+ John liked your post          [*] 2m  |  |  |
|  |  |     | [Heart]| "Great article on React..."           |  |  |
|  |  |     +--------+ [Mark read] [Delete]                  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [ ] +--------+ New follower: Jane Doe             5h  |  |  |
|  |  |     |[User+] | Started following you                 |  |  |
|  |  |     +--------+ [Mark read] [Delete]                  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [ ] +--------+ System update                      1d  |  |  |
|  |  |     | [Info] | New features available...             |  |  |
|  |  |     +--------+ [Mark read] [Delete]                  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [ ] +--------+ Comment on your post              2d  |  |  |
|  |  |     |[Message]| Alex commented: "This is..."        |  |  |
|  |  |     +--------+ [Mark read] [Delete]                  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |                                                            |  |
|  |                    [Load more]                             |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              Empty State (m-empty-state)                   |  |
|  |  (When no notifications)                                   |  |
|  |                                                            |  |
|  |                    [Bell Icon]                             |  |
|  |                 No notifications                           |  |
|  |    When you get notifications, they will appear here.      |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## When to Use

Use this skill when:
- Building full-page notification centers
- Implementing notification management systems
- Creating inbox-style notification views
- Building activity feed pages with bulk actions

## Implementation

```tsx
// app/notifications/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  MessageSquare,
  Heart,
  UserPlus,
  AlertCircle,
  Info,
  Star,
  Loader2,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Notification {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'mention' | 'system' | 'alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actor?: {
    name: string;
    avatar?: string;
  };
}

interface NotificationsPageProps {
  initialData?: Notification[];
}

// Notification type config
const notificationTypes = {
  comment: { icon: MessageSquare, color: 'text-blue-500 bg-blue-100' },
  like: { icon: Heart, color: 'text-pink-500 bg-pink-100' },
  follow: { icon: UserPlus, color: 'text-green-500 bg-green-100' },
  mention: { icon: Star, color: 'text-purple-500 bg-purple-100' },
  system: { icon: Info, color: 'text-gray-500 bg-gray-100' },
  alert: { icon: AlertCircle, color: 'text-red-500 bg-red-100' },
};

// API functions
async function fetchNotifications(page: number): Promise<{
  notifications: Notification[];
  nextPage?: number;
  total: number;
  unreadCount: number;
}> {
  const res = await fetch(`/api/notifications?page=${page}&limit=20`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function markAsRead(ids: string[]): Promise<void> {
  await fetch('/api/notifications/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

async function markAllRead(): Promise<void> {
  await fetch('/api/notifications/read-all', { method: 'POST' });
}

async function deleteNotifications(ids: string[]): Promise<void> {
  await fetch('/api/notifications', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

// Filter Options
type FilterType = 'all' | 'unread' | 'comment' | 'like' | 'follow' | 'system';

// Filter Dropdown
function FilterDropdown({
  value,
  onChange,
}: {
  value: FilterType;
  onChange: (filter: FilterType) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All notifications' },
    { value: 'unread', label: 'Unread only' },
    { value: 'comment', label: 'Comments' },
    { value: 'like', label: 'Likes' },
    { value: 'follow', label: 'Follows' },
    { value: 'system', label: 'System' },
  ];

  const current = filters.find((f) => f.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border hover:bg-accent"
      >
        <Filter className="h-4 w-4" />
        {current?.label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border bg-popover py-1 shadow-lg">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  onChange(filter.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center px-3 py-2 text-sm hover:bg-accent',
                  value === filter.value && 'bg-accent'
                )}
              >
                {filter.label}
                {value === filter.value && <Check className="ml-auto h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Notification Item
function NotificationItem({
  notification,
  selected,
  onSelect,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const config = notificationTypes[notification.type];
  const Icon = config.icon;

  const content = (
    <div
      className={cn(
        'group flex items-start gap-4 p-4 border-b transition-colors',
        !notification.read && 'bg-accent/20',
        'hover:bg-accent/50'
      )}
    >
      {/* Checkbox */}
      <div className="pt-1">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
          config.color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn('text-sm', !notification.read && 'font-semibold')}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          </div>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkRead();
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Mark read
              </button>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="text-xs text-destructive hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

// Empty State
function EmptyState({ filter }: { filter: FilterType }) {
  return (
    <div className="py-16 text-center">
      <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
      <h3 className="font-medium">No notifications</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {filter === 'unread'
          ? "You're all caught up!"
          : 'When you get notifications, they will appear here.'}
      </p>
    </div>
  );
}

// Main Notifications Page
export default function NotificationsPage({ initialData }: NotificationsPageProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Fetch notifications
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['notifications', filter],
      queryFn: ({ pageParam = 1 }) => fetchNotifications(pageParam),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    });

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSelectedIds(new Set());
    },
  });

  // Combine all pages
  const allNotifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    return allNotifications.filter((n) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.read;
      return n.type === filter;
    });
  }, [allNotifications, filter]);

  // Selection helpers
  const allSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((n) => selectedIds.has(n.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const toggleSelect = (id: string, selected: boolean) => {
    const newSet = new Set(selectedIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 && 's'}
            </p>
          )}
        </div>
        <Link
          href="/settings/notifications"
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border hover:bg-accent"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded"
            />
            Select all
          </label>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => markReadMutation.mutate(Array.from(selectedIds))}
                disabled={markReadMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg hover:bg-accent"
              >
                <Check className="h-4 w-4" />
                Mark read
              </button>
              <button
                onClick={() => deleteMutation.mutate(Array.from(selectedIds))}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-destructive rounded-lg hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg hover:bg-accent"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
          <FilterDropdown value={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Notification List */}
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                selected={selectedIds.has(notification.id)}
                onSelect={(selected) => toggleSelect(notification.id, selected)}
                onMarkRead={() => markReadMutation.mutate([notification.id])}
                onDelete={() => deleteMutation.mutate([notification.id])}
              />
            ))}

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-4 text-sm text-primary hover:bg-accent"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Load more'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
// app/notifications/page.tsx
import NotificationsPage from '@/components/templates/notifications-page';

export default function Page() {
  return <NotificationsPage />;
}

export const metadata = {
  title: 'Notifications',
};
```

### With Initial Data (SSR)

```tsx
import NotificationsPage from '@/components/templates/notifications-page';
import { getNotifications } from '@/lib/api';

export default async function Page() {
  const { notifications } = await getNotifications(1);
  
  return <NotificationsPage initialData={notifications} />;
}
```

## Error States

### Notification Fetch Error

```tsx
// components/notifications/notification-error.tsx
'use client';

import { AlertTriangle, RefreshCw, Bell } from 'lucide-react';

interface NotificationErrorProps {
  error: Error;
  onRetry: () => void;
}

export function NotificationError({ error, onRetry }: NotificationErrorProps) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Failed to load notifications
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {error.message || 'Something went wrong while fetching your notifications.'}
      </p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
```

### Page-Level Error Boundary

```tsx
// app/notifications/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Notifications error:', error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Unable to load notifications
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          We encountered an error while loading your notifications. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Mutation Error Toast

```tsx
// components/notifications/notification-actions.tsx
import { toast } from 'sonner';

export function handleNotificationError(action: string, error: Error) {
  toast.error(`Failed to ${action}`, {
    description: error.message || 'Please try again.',
    action: {
      label: 'Retry',
      onClick: () => {
        // Trigger retry logic
      },
    },
  });
}

// Usage in mutation
const markReadMutation = useMutation({
  mutationFn: markAsRead,
  onError: (error) => {
    handleNotificationError('mark notification as read', error);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('Notification marked as read');
  },
});
```

## Loading States

### Notifications Page Loading

```tsx
// app/notifications/loading.tsx
export default function NotificationsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 mt-2 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Actions Bar Skeleton */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Notification List Skeleton */}
      <div className="border rounded-lg overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <NotificationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-b-0">
      <div className="h-4 w-4 mt-1 animate-pulse rounded bg-muted" />
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-muted" />
    </div>
  );
}
```

### Inline Loading States

```tsx
// components/notifications/notification-item-loading.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemWithLoadingProps {
  notification: Notification;
  isMarkingRead?: boolean;
  isDeleting?: boolean;
}

export function NotificationItemWithLoading({
  notification,
  isMarkingRead,
  isDeleting,
}: NotificationItemWithLoadingProps) {
  return (
    <div
      className={cn(
        'group flex items-start gap-4 p-4 border-b transition-all',
        !notification.read && 'bg-accent/20',
        (isMarkingRead || isDeleting) && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Content */}
      <div className="flex-1">
        {/* ... notification content ... */}
      </div>

      {/* Loading Indicator */}
      {(isMarkingRead || isDeleting) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{isDeleting ? 'Deleting...' : 'Updating...'}</span>
        </div>
      )}
    </div>
  );
}
```

### Suspense with Skeleton

```tsx
// app/notifications/page.tsx with Suspense
import { Suspense } from 'react';

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <NotificationsHeader />

      <Suspense fallback={<NotificationListSkeleton count={10} />}>
        <NotificationList />
      </Suspense>
    </div>
  );
}

function NotificationListSkeleton({ count }: { count: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 border-b last:border-b-0 animate-pulse">
          <div className="h-4 w-4 mt-1 rounded bg-muted" />
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Notifications Page

```tsx
// components/notifications/notifications-page-responsive.tsx
'use client';

import * as React from 'react';
import { Bell, Settings, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotificationsPageResponsive() {
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - Fixed */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Notifications</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="rounded-lg p-2 hover:bg-accent"
              aria-label="Filter"
            >
              <Filter className="h-5 w-5" />
            </button>
            <a href="/settings/notifications" className="rounded-lg p-2 hover:bg-accent">
              <Settings className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-sm text-muted-foreground">3 unread notifications</p>
            </div>
            <a
              href="/settings/notifications"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-background p-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filter</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-lg p-2 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Filter Options */}
            <div className="space-y-4">
              <FilterOption label="All notifications" active />
              <FilterOption label="Unread only" />
              <FilterOption label="Comments" />
              <FilterOption label="Likes" />
              <FilterOption label="Follows" />
              <FilterOption label="System" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pb-20 lg:pb-8">
        {/* Mobile Quick Actions */}
        <div className="flex items-center justify-between py-3 border-b lg:hidden">
          <button className="text-sm text-primary font-medium">
            Mark all read
          </button>
          <span className="text-xs text-muted-foreground">3 unread</span>
        </div>

        {/* Notification List */}
        <div className="divide-y">
          {/* Notification items */}
        </div>
      </main>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 lg:hidden">
        <button className="w-full py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground">
          Load more notifications
        </button>
      </div>
    </div>
  );
}

function FilterOption({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={cn(
        'w-full text-left px-4 py-3 rounded-lg transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
      )}
    >
      {label}
    </button>
  );
}
```

### Mobile Notification Item

```tsx
// components/notifications/notification-item-mobile.tsx
'use client';

import { useState } from 'react';
import { MoreHorizontal, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemMobileProps {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}

export function NotificationItemMobile({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemMobileProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4',
        !notification.read && 'bg-accent/10'
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted flex items-center justify-center">
        {/* Icon based on type */}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !notification.read && 'font-medium')}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <span className="text-xs text-muted-foreground mt-1 block">
          2 hours ago
        </span>
      </div>

      {/* Actions Button */}
      <button
        onClick={() => setShowActions(!showActions)}
        className="rounded-lg p-2 hover:bg-accent -mr-2"
      >
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Action Menu */}
      {showActions && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowActions(false)}
          />
          <div className="absolute right-4 top-12 z-50 w-40 rounded-lg border bg-popover shadow-lg">
            {!notification.read && (
              <button
                onClick={() => {
                  onMarkRead();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
              >
                <Check className="h-4 w-4" />
                Mark as read
              </button>
            )}
            <button
              onClick={() => {
                onDelete();
                setShowActions(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Responsive Breakpoints

```tsx
// Notification page responsive patterns:
//
// Mobile (< 640px):
// - Full-width notification items
// - Bottom sheet for filters
// - Fixed bottom action bar
// - Swipe actions (if implemented)
// - Compact header with icon buttons
//
// Tablet (640px - 1024px):
// - Centered content with max-width
// - Inline filter dropdown
// - Standard pagination
//
// Desktop (> 1024px):
// - max-w-3xl container
// - Full header with text labels
// - Hover actions on items
// - Inline bulk actions
```

## Related Skills

- `organisms/notification-center` - Notification dropdown
- `patterns/infinite-scroll` - Infinite scroll
- `templates/settings-page` - Notification settings

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation
- Filter by type/read status
- Bulk selection and actions
- Infinite scroll loading
- Mark all read
