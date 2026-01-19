---
id: o-activity-feed
name: Activity Feed
version: 2.0.0
layer: L3
category: user
formula: "ActivityFeed = TimelineItem(m-timeline-item)[] + Avatar(m-avatar) + Button(a-button) + Badge(a-badge) + FilterControls + InfiniteScroll"
composes:
  - ../molecules/timeline-item.md
  - ../molecules/avatar.md
description: Timeline of user activities with filtering, grouping, and real-time updates
tags: [activity, feed, timeline, events, history]
performance:
  impact: medium
  lcp: low
  cls: low
dependencies:
  - react
  - "@tanstack/react-query"
  - date-fns
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Activity Feed

## Overview

An activity feed organism displaying a chronological timeline of events with grouping by date, activity type filtering, real-time updates, and customizable activity renderers.

## When to Use

Use this skill when:
- Building notification history pages
- Displaying user or system activity logs
- Creating audit trails
- Showing real-time event streams

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ActivityFeed (L3)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Filter Controls                          │  │
│  │  [All] [Comments] [Files] [Users] [Settings]              │  │
│  │        Button(a-button) + Badge(a-badge)                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Date Group: "Today"                                       │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ TimelineItem (m-timeline-item)                      │  │  │
│  │  │  ┌────────┐                                         │  │  │
│  │  │  │ Avatar │  John commented on Document             │  │  │
│  │  │  │(m-avtr)│  "2 hours ago"                          │  │  │
│  │  │  └────────┘                                         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ TimelineItem (m-timeline-item)                      │  │  │
│  │  │  ┌────────┐                                         │  │  │
│  │  │  │ Avatar │  Jane uploaded File.pdf                 │  │  │
│  │  │  │(m-avtr)│  "5 hours ago"                          │  │  │
│  │  │  └────────┘                                         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Date Group: "Yesterday"                                   │  │
│  │  ... more TimelineItems ...                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Load More] Button(a-button)                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/activity-feed.tsx
'use client';

import * as React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isSameDay,
} from 'date-fns';
import {
  MessageSquare,
  FileText,
  UserPlus,
  Settings,
  Star,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Activity {
  id: string;
  type: string;
  action: string;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  target?: {
    type: string;
    id: string;
    name: string;
    url?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface ActivityGroup {
  date: Date;
  label: string;
  activities: Activity[];
}

interface ActivityFeedProps {
  entityType?: string;
  entityId?: string;
  userId?: string;
  types?: string[];
  onActivityClick?: (activity: Activity) => void;
  emptyMessage?: string;
  showFilters?: boolean;
  groupByDate?: boolean;
  pageSize?: number;
}

// Activity type configurations
const activityConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  comment: { icon: MessageSquare, color: 'text-blue-500 bg-blue-100', label: 'Comments' },
  document: { icon: FileText, color: 'text-purple-500 bg-purple-100', label: 'Documents' },
  member: { icon: UserPlus, color: 'text-green-500 bg-green-100', label: 'Members' },
  settings: { icon: Settings, color: 'text-gray-500 bg-gray-100', label: 'Settings' },
  review: { icon: Star, color: 'text-yellow-500 bg-yellow-100', label: 'Reviews' },
  commit: { icon: GitBranch, color: 'text-orange-500 bg-orange-100', label: 'Commits' },
  task: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-100', label: 'Tasks' },
  alert: { icon: AlertCircle, color: 'text-red-500 bg-red-100', label: 'Alerts' },
  default: { icon: Clock, color: 'text-muted-foreground bg-muted', label: 'Other' },
};

// API function
async function fetchActivities(
  params: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    types?: string[];
    page: number;
    pageSize: number;
  }
): Promise<{ activities: Activity[]; nextPage?: number; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.entityType) searchParams.set('entityType', params.entityType);
  if (params.entityId) searchParams.set('entityId', params.entityId);
  if (params.userId) searchParams.set('userId', params.userId);
  if (params.types?.length) searchParams.set('types', params.types.join(','));
  searchParams.set('page', params.page.toString());
  searchParams.set('limit', params.pageSize.toString());

  const res = await fetch(`/api/activities?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}

// Format date for grouping
function formatDateLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

// Group activities by date
function groupActivitiesByDate(activities: Activity[]): ActivityGroup[] {
  const groups: ActivityGroup[] = [];
  let currentGroup: ActivityGroup | null = null;

  activities.forEach((activity) => {
    const activityDate = new Date(activity.createdAt);

    if (!currentGroup || !isSameDay(currentGroup.date, activityDate)) {
      currentGroup = {
        date: activityDate,
        label: formatDateLabel(activityDate),
        activities: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.activities.push(activity);
  });

  return groups;
}

// Avatar Component
function Avatar({
  src,
  name,
  size = 'md',
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md';
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-muted font-medium',
        sizeClasses[size]
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}

// Single Activity Item
function ActivityItem({
  activity,
  onClick,
  showConnector = true,
}: {
  activity: Activity;
  onClick?: () => void;
  showConnector?: boolean;
}) {
  const config = activityConfig[activity.type] || activityConfig.default;
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Connector line */}
      {showConnector && (
        <div className="absolute left-4 top-10 -bottom-2 w-px bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          config.color
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-medium">{activity.actor.name}</span>{' '}
              <span className="text-muted-foreground">{activity.action}</span>
              {activity.target && (
                <>
                  {' '}
                  {activity.target.url ? (
                    <a
                      href={activity.target.url}
                      className="font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {activity.target.name}
                    </a>
                  ) : (
                    <span className="font-medium">{activity.target.name}</span>
                  )}
                </>
              )}
            </p>

            {/* Metadata preview */}
            {activity.metadata?.preview && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {String(activity.metadata.preview)}
              </p>
            )}
          </div>

          <span className="flex-shrink-0 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Actor avatar for certain types */}
        {activity.metadata?.showActor && (
          <div className="mt-2 flex items-center gap-2">
            <Avatar src={activity.actor.avatar} name={activity.actor.name} size="sm" />
            <span className="text-xs text-muted-foreground">{activity.actor.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Filter Dropdown
function ActivityFilters({
  selectedTypes,
  onTypesChange,
  availableTypes,
}: {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  availableTypes: string[];
}) {
  const [open, setOpen] = React.useState(false);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm',
          'hover:bg-accent transition-colors',
          selectedTypes.length > 0 && 'border-primary text-primary'
        )}
      >
        <Filter className="h-4 w-4" />
        Filter
        {selectedTypes.length > 0 && (
          <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
            {selectedTypes.length}
          </span>
        )}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border bg-popover p-2 shadow-lg">
            <div className="space-y-1">
              {availableTypes.map((type) => {
                const config = activityConfig[type] || activityConfig.default;
                const isSelected = selectedTypes.includes(type);

                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                      'hover:bg-accent transition-colors',
                      isSelected && 'bg-accent'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full',
                        config.color
                      )}
                    >
                      <config.icon className="h-3 w-3" />
                    </div>
                    <span className="flex-1 text-left">{config.label}</span>
                    {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>

            {selectedTypes.length > 0 && (
              <button
                onClick={() => onTypesChange([])}
                className="mt-2 w-full rounded-md border py-1.5 text-sm hover:bg-accent"
              >
                Clear filters
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Date Group Header
function DateGroupHeader({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-2 backdrop-blur">
      <h3 className="text-sm font-semibold text-muted-foreground">{label}</h3>
    </div>
  );
}

// Main Activity Feed
export function ActivityFeed({
  entityType,
  entityId,
  userId,
  types: initialTypes,
  onActivityClick,
  emptyMessage = 'No activity yet',
  showFilters = true,
  groupByDate = true,
  pageSize = 20,
}: ActivityFeedProps) {
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(
    initialTypes || []
  );

  const availableTypes = Object.keys(activityConfig).filter(
    (t) => t !== 'default'
  );

  // Fetch activities
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['activities', entityType, entityId, userId, selectedTypes],
      queryFn: ({ pageParam = 1 }) =>
        fetchActivities({
          entityType,
          entityId,
          userId,
          types: selectedTypes.length > 0 ? selectedTypes : undefined,
          page: pageParam,
          pageSize,
        }),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    });

  const allActivities = data?.pages.flatMap((page) => page.activities) ?? [];
  const groups = groupByDate ? groupActivitiesByDate(allActivities) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      {showFilters && (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Activity</h2>
          <ActivityFilters
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
            availableTypes={availableTypes}
          />
        </div>
      )}

      {/* Activity List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : allActivities.length === 0 ? (
        <div className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : groupByDate && groups ? (
        <div className="space-y-6">
          {groups.map((group, groupIndex) => (
            <div key={group.label}>
              <DateGroupHeader label={group.label} />
              <div className="mt-4">
                {group.activities.map((activity, activityIndex) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick?.(activity)}
                    showConnector={
                      activityIndex < group.activities.length - 1 ||
                      groupIndex < groups.length - 1
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {allActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick?.(activity)}
              showConnector={index < allActivities.length - 1}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="flex w-full items-center justify-center gap-2 py-3 text-sm text-primary hover:underline"
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Load more activity'
          )}
        </button>
      )}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { ActivityFeed } from '@/components/organisms/activity-feed';

export function ProjectActivity({ projectId }) {
  return (
    <ActivityFeed
      entityType="project"
      entityId={projectId}
      onActivityClick={(activity) => {
        if (activity.target?.url) {
          router.push(activity.target.url);
        }
      }}
    />
  );
}
```

### User Activity

```tsx
<ActivityFeed
  userId={user.id}
  showFilters={false}
  emptyMessage="This user hasn't done anything yet"
/>
```

### Filtered by Type

```tsx
<ActivityFeed
  entityType="workspace"
  entityId={workspaceId}
  types={['comment', 'task']}
/>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entityType` | `string` | `undefined` | Type of entity to fetch activities for |
| `entityId` | `string` | `undefined` | ID of entity to fetch activities for |
| `userId` | `string` | `undefined` | Filter activities by user ID |
| `types` | `string[]` | `undefined` | Array of activity types to filter |
| `onActivityClick` | `(activity: Activity) => void` | `undefined` | Handler when activity item is clicked |
| `emptyMessage` | `string` | `'No activity yet'` | Message shown when no activities exist |
| `showFilters` | `boolean` | `true` | Whether to show filter controls |
| `groupByDate` | `boolean` | `true` | Whether to group activities by date |
| `pageSize` | `number` | `20` | Number of activities per page |

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Loading | Initial data fetch | Centered spinner animation |
| Empty | No activities found | Empty state with clock icon and message |
| Loaded | Activities displayed | Timeline items grouped by date |
| Filtering | Filter applied | Updated list, filter badge shows count |
| Load More | Fetching next page | Loading spinner on load more button |
| Error | API fetch failed | Error message display |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus between filter button, filter options, activity links, load more |
| `Enter` | Open filter dropdown, select filter option, navigate to activity target |
| `Space` | Toggle filter option selection |
| `Escape` | Close filter dropdown |
| `Arrow Down/Up` | Navigate within filter dropdown options |

## Screen Reader Announcements

- Activity feed section announced with "Activity" heading
- Each activity item announces: actor name, action, target, and time
- Filter button announces current filter count (e.g., "Filter, 2 selected")
- Date group headers announced as section headings
- Load more button announces loading state
- Empty state message announced when no activities
- Link targets announced with their names

## Anti-patterns

### 1. Missing Empty State Handling
```tsx
// Bad - no indication when empty
<ActivityFeed entityType="project" entityId={id} />

// Good - custom empty message
<ActivityFeed
  entityType="project"
  entityId={id}
  emptyMessage="No activity in this project yet. Actions will appear here."
/>
```

### 2. Not Providing Click Handlers for Navigation
```tsx
// Bad - activities not clickable, no navigation
<ActivityFeed userId={user.id} />

// Good - activities link to relevant content
<ActivityFeed
  userId={user.id}
  onActivityClick={(activity) => {
    if (activity.target?.url) {
      router.push(activity.target.url);
    }
  }}
/>
```

### 3. Loading Too Many Items at Once
```tsx
// Bad - loading 100 items impacts performance
<ActivityFeed
  entityType="workspace"
  entityId={wsId}
  pageSize={100}
/>

// Good - reasonable page size with infinite scroll
<ActivityFeed
  entityType="workspace"
  entityId={wsId}
  pageSize={20}
/>
```

### 4. Hiding Filters When Useful
```tsx
// Bad - hiding filters on a feed with many activity types
<ActivityFeed
  entityType="project"
  entityId={id}
  showFilters={false}
/>

// Good - filters enabled for mixed activity feeds
<ActivityFeed
  entityType="project"
  entityId={id}
  showFilters={true}
/>
```

## Related Skills

- `molecules/timeline-item` - Timeline item base
- `organisms/notification-center` - Notifications
- `patterns/infinite-scroll` - Pagination

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Date grouping with sticky headers
- Activity type filtering
- Infinite scroll pagination
- Real-time updates support
