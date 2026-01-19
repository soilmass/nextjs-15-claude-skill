---
id: o-activity-timeline
name: Activity Timeline
version: 1.0.0
layer: L3
category: data
description: Vertical timeline displaying chronological activity/events history with timestamps and icons
tags: [timeline, activity, events, history, chronological]
formula: "ActivityTimeline = TimelineItem(m-timeline-item)[] + Avatar(a-avatar) + Badge(a-badge) + Icon(a-icon) + Button(a-button)"
composes:
  - ../molecules/timeline-item.md
  - ../atoms/display-avatar.md
  - ../atoms/display-badge.md
  - ../atoms/display-icon.md
  - ../atoms/input-button.md
dependencies:
  - react
  - date-fns
  - lucide-react
performance:
  impact: medium
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Activity Timeline

## Overview

A vertical timeline organism for displaying chronological sequences of activities or events. Supports different event types, timestamps, user avatars, and expandable details.

## When to Use

Use this skill when:
- Displaying user activity history
- Building audit logs or event streams
- Showing order/shipment tracking
- Creating project milestone views

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ActivityTimeline (L3)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Header (optional)                                        │  │
│  │  "Activity History" + Badge(a-badge) count                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TimelineItem (m-timeline-item)                           │  │
│  │  ┌────┐ ┌─────────────────────────────────────────────┐   │  │
│  │  │Icon│ │ Title + Timestamp                           │   │  │
│  │  │(a) │ │ Description text                            │   │  │
│  │  │ │  │ │ Avatar(a-avatar) + Actor name               │   │  │
│  │  │ │  │ └─────────────────────────────────────────────┘   │  │
│  │  │ │  │                                                    │  │
│  │  └─┼──┘                                                    │  │
│  │    │   (connector line)                                    │  │
│  └────┼───────────────────────────────────────────────────────┘  │
│       │                                                          │
│  ┌────┼───────────────────────────────────────────────────────┐  │
│  │  TimelineItem (m-timeline-item)                           │  │
│  │  ┌─┴──┐                                                    │  │
│  │  │Icon│ ... more items                                     │  │
│  │  └────┘                                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Button(a-button): "Load older activity"                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/activity-timeline.tsx
'use client';

import * as React from 'react';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import {
  Check,
  Clock,
  Edit,
  FileText,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Upload,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  actor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  showHeader?: boolean;
  emptyMessage?: string;
  className?: string;
}

// Event type configurations
const eventConfig: Record<string, { icon: React.ElementType; color: string }> = {
  created: { icon: Plus, color: 'bg-green-100 text-green-600' },
  updated: { icon: Edit, color: 'bg-blue-100 text-blue-600' },
  deleted: { icon: Trash2, color: 'bg-red-100 text-red-600' },
  completed: { icon: Check, color: 'bg-emerald-100 text-emerald-600' },
  comment: { icon: MessageSquare, color: 'bg-purple-100 text-purple-600' },
  upload: { icon: Upload, color: 'bg-orange-100 text-orange-600' },
  settings: { icon: Settings, color: 'bg-gray-100 text-gray-600' },
  user: { icon: User, color: 'bg-indigo-100 text-indigo-600' },
  document: { icon: FileText, color: 'bg-yellow-100 text-yellow-600' },
  alert: { icon: AlertCircle, color: 'bg-red-100 text-red-600' },
  default: { icon: Clock, color: 'bg-muted text-muted-foreground' },
};

function formatTimestamp(date: Date): string {
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, yyyy h:mm a');
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}

function TimelineItem({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  const config = eventConfig[event.type] || eventConfig.default;
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4 pb-8">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-4 top-8 -bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div className={cn('relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', config.color)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{event.title}</p>
            {event.description && (
              <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>
          <span className="flex-shrink-0 text-xs text-muted-foreground">
            {formatTimestamp(new Date(event.timestamp))}
          </span>
        </div>

        {event.actor && (
          <div className="mt-2 flex items-center gap-2">
            <Avatar src={event.actor.avatar} name={event.actor.name} />
            <span className="text-xs text-muted-foreground">{event.actor.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityTimeline({
  events,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  showHeader = true,
  emptyMessage = 'No activity yet',
  className,
}: ActivityTimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Activity History</h2>
          {events.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {events.length}
            </span>
          )}
        </div>
      )}

      {isLoading && events.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div>
          {events.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={index === events.length - 1 && !hasMore}
            />
          ))}

          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 py-3 text-sm text-primary hover:underline disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Load older activity'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { ActivityTimeline } from '@/components/organisms/activity-timeline';

const events = [
  {
    id: '1',
    type: 'created',
    title: 'Project created',
    description: 'New project initialized',
    actor: { id: '1', name: 'John Doe' },
    timestamp: new Date(),
  },
];

<ActivityTimeline events={events} />
```

### With Pagination

```tsx
<ActivityTimeline
  events={events}
  hasMore={hasMore}
  isLoading={isLoading}
  onLoadMore={() => fetchNextPage()}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Timeline displays events with normal styling | Events shown in chronological order with icons and timestamps |
| Loading | Initial data fetch in progress | Centered spinner replaces event list |
| Loading More | Fetching additional older events | "Load older activity" button shows spinner, existing events remain visible |
| Empty | No events to display | Empty state with clock icon and customizable message |
| Error | Failed to load events | Error message with retry option (implement via wrapper) |
| Refreshing | Pulling new events while showing existing | Subtle loading indicator at top, events remain interactive |

## Anti-patterns

### Bad: Rendering all events without virtualization

```tsx
// Bad - renders all items even if thousands exist
<ActivityTimeline events={allEvents} /> // 10,000+ events

// Good - paginate or virtualize large lists
<ActivityTimeline
  events={visibleEvents}
  hasMore={hasMore}
  onLoadMore={fetchNextPage}
/>
```

### Bad: Not providing unique event IDs

```tsx
// Bad - using array index as key
const events = activities.map((activity, index) => ({
  id: index, // Array index changes on reorder
  title: activity.title,
  timestamp: activity.date,
}));

// Good - use stable unique identifiers
const events = activities.map((activity) => ({
  id: activity.uuid, // Stable unique ID from data source
  title: activity.title,
  timestamp: activity.date,
}));
```

### Bad: Mutating timestamps instead of Date objects

```tsx
// Bad - passing string timestamps without conversion
<ActivityTimeline
  events={[{
    id: '1',
    title: 'Created',
    timestamp: '2025-01-18', // String, not Date
  }]}
/>

// Good - ensure proper Date objects
<ActivityTimeline
  events={[{
    id: '1',
    title: 'Created',
    timestamp: new Date('2025-01-18T10:00:00Z'),
  }]}
/>
```

### Bad: Missing actor information for collaborative timelines

```tsx
// Bad - no attribution for multi-user contexts
<ActivityTimeline
  events={[{
    id: '1',
    title: 'Document updated',
    timestamp: new Date(),
    // Missing actor - who did this?
  }]}
/>

// Good - include actor for auditability
<ActivityTimeline
  events={[{
    id: '1',
    title: 'Document updated',
    timestamp: new Date(),
    actor: { id: 'user-123', name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
  }]}
/>
```

## Related Skills

- `molecules/timeline-item` - Individual timeline item
- `organisms/activity-feed` - Activity feed with filtering
- `patterns/infinite-scroll` - Pagination pattern

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- Configurable event types with icons
- Actor display with avatars
- Load more pagination
