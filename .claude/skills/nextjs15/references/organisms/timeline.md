---
id: o-timeline
name: Timeline
version: 2.0.0
layer: L3
category: data
description: Chronological timeline display for events, history, and activity feeds
tags: [timeline, history, events, activity, changelog, feed]
formula: "Timeline = Avatar(m-avatar) + Card(m-card) + Badge(a-badge)"
composes:
  - ../molecules/avatar.md
  - ../molecules/card.md
dependencies: [framer-motion, lucide-react, date-fns]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Timeline

## Overview

The Timeline organism displays chronological sequences of events with various layout options. Supports vertical and horizontal orientations, grouped entries, icons, and animated reveals. Ideal for activity feeds, changelogs, and historical displays.

## When to Use

Use this skill when:
- Building activity feeds and logs
- Displaying changelog or version history
- Creating about/history pages
- Showing order/process status

## Composition Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ Timeline                                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VERTICAL LAYOUT:                                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Date Group Header (optional)                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────┐ ┌──────────────────────────────────────────────────┐     │
│  │ ●──┼─┤ TimelineItem                                     │     │
│  │ │  │ │ ┌──────────┐  Title + Badge (a-badge)            │     │
│  │ │  │ │ │ Avatar   │  ┌─────────────────────────────┐    │     │
│  │ │  │ │ │(m-avatar)│  │ Date/Time                   │    │     │
│  │ │  │ │ └──────────┘  └─────────────────────────────┘    │     │
│  │ │  │ │ Description                                      │     │
│  │ │  │ │ ┌─────────────────────────────────────────────┐  │     │
│  │ │  │ │ │ Card (m-card) - optional content            │  │     │
│  │ │  │ │ └─────────────────────────────────────────────┘  │     │
│  │ │  │ └──────────────────────────────────────────────────┘     │
│  │ │  │                                                          │
│  │ ●──┼─┤ TimelineItem                                     │     │
│  │ │  │ │ ...                                              │     │
│  │ │  │ └──────────────────────────────────────────────────┘     │
│  │ │  │                                                          │
│  │ ●──┼─┤ TimelineItem                                     │     │
│  └─│──┘ └──────────────────────────────────────────────────┘     │
│    │                                                             │
│  (connector line)                                                │
│                                                                  │
│  HORIZONTAL LAYOUT:                                              │
│  ──●────────●────────●────────●──                                │
│    │        │        │        │                                  │
│  Event1  Event2   Event3   Event4                                │
└──────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [avatar](../molecules/avatar.md) - User avatars for activity
- [badge](../atoms/badge.md) - Status/type indicators
- [card](../molecules/card.md) - Event content cards

## Implementation

```typescript
// components/organisms/timeline.tsx
"use client";

import * as React from "react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { motion, useInView } from "framer-motion";
import {
  Check,
  Circle,
  Clock,
  AlertCircle,
  Info,
  Star,
  Zap,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type TimelineEventType = "default" | "success" | "warning" | "error" | "info";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  type?: TimelineEventType;
  icon?: LucideIcon;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, string | number>;
  content?: React.ReactNode;
}

interface TimelineProps {
  /** Timeline events */
  events: TimelineEvent[];
  /** Layout orientation */
  orientation?: "vertical" | "horizontal";
  /** Alternate sides (vertical only) */
  alternate?: boolean;
  /** Show connector line */
  showConnector?: boolean;
  /** Group events by date */
  groupByDate?: boolean;
  /** Show relative dates */
  relativeTime?: boolean;
  /** Animate on scroll */
  animate?: boolean;
  /** Show line on left or right */
  linePosition?: "left" | "right" | "center";
  /** Compact mode */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

const typeStyles: Record<TimelineEventType, { bg: string; icon: LucideIcon }> = {
  default: { bg: "bg-muted", icon: Circle },
  success: { bg: "bg-green-500", icon: Check },
  warning: { bg: "bg-yellow-500", icon: AlertCircle },
  error: { bg: "bg-red-500", icon: AlertCircle },
  info: { bg: "bg-blue-500", icon: Info },
};

function formatEventDate(date: Date | string, relative: boolean): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (relative) {
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return formatDistanceToNow(d, { addSuffix: true });
  }
  
  return format(d, "MMM d, yyyy");
}

function formatEventTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "h:mm a");
}

function getDateGroup(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

function TimelineItem({
  event,
  position = "left",
  showConnector = true,
  relativeTime = false,
  animate = true,
  compact = false,
  isFirst = false,
  isLast = false,
}: {
  event: TimelineEvent;
  position?: "left" | "right";
  showConnector?: boolean;
  relativeTime?: boolean;
  animate?: boolean;
  compact?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const type = event.type ?? "default";
  const { bg, icon: DefaultIcon } = typeStyles[type];
  const Icon = event.icon ?? DefaultIcon;

  const content = (
    <div
      className={cn(
        "flex gap-4",
        position === "right" && "flex-row-reverse text-right"
      )}
    >
      {/* Icon/Avatar */}
      <div className="relative flex flex-col items-center">
        {/* Connector line top */}
        {showConnector && !isFirst && (
          <div className="absolute bottom-1/2 w-0.5 h-8 bg-border -translate-y-1" />
        )}
        
        {/* Icon */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full",
            compact ? "h-8 w-8" : "h-10 w-10",
            event.user ? "bg-background border-2" : bg
          )}
        >
          {event.user ? (
            <Avatar className={cn(compact ? "h-7 w-7" : "h-9 w-9")}>
              <AvatarImage src={event.user.avatar} alt={event.user.name} />
              <AvatarFallback className="text-xs">
                {event.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Icon className={cn("text-white", compact ? "h-4 w-4" : "h-5 w-5")} />
          )}
        </div>

        {/* Connector line bottom */}
        {showConnector && !isLast && (
          <div className="w-0.5 flex-1 bg-border min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn("font-medium", compact && "text-sm")}>
            {event.title}
          </h4>
          {event.type && event.type !== "default" && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs capitalize",
                type === "success" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                type === "warning" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                type === "error" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                type === "info" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              )}
            >
              {type}
            </Badge>
          )}
        </div>

        {event.user && (
          <p className="text-sm text-muted-foreground mb-1">
            {event.user.name}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Clock className="h-3 w-3" />
          <time dateTime={new Date(event.date).toISOString()}>
            {formatEventDate(event.date, relativeTime)} at {formatEventTime(event.date)}
          </time>
        </div>

        {event.description && !compact && (
          <p className="text-sm text-muted-foreground mb-2">
            {event.description}
          </p>
        )}

        {event.content && (
          <Card className="mt-2">
            <CardContent className="p-3">{event.content}</CardContent>
          </Card>
        )}

        {event.metadata && !compact && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(event.metadata).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {value}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (!animate) {
    return <div ref={ref}>{content}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: position === "right" ? 20 : -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: position === "right" ? 20 : -20 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {content}
    </motion.div>
  );
}

function AlternatingTimeline({
  events,
  showConnector,
  relativeTime,
  animate,
  compact,
}: {
  events: TimelineEvent[];
  showConnector: boolean;
  relativeTime: boolean;
  animate: boolean;
  compact: boolean;
}) {
  return (
    <div className="relative">
      {/* Center line */}
      {showConnector && (
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
      )}

      <div className="space-y-8">
        {events.map((event, index) => {
          const position = index % 2 === 0 ? "left" : "right";
          const ref = React.useRef(null);
          
          return (
            <div
              key={event.id}
              className={cn(
                "relative grid grid-cols-[1fr_auto_1fr] gap-4",
                position === "left" ? "text-right" : "text-left"
              )}
            >
              {/* Left content */}
              <div className={position === "left" ? "" : "order-3"}>
                {position === "left" && (
                  <TimelineItemContent
                    event={event}
                    position="left"
                    relativeTime={relativeTime}
                    compact={compact}
                  />
                )}
              </div>

              {/* Center icon */}
              <div className="flex flex-col items-center">
                <TimelineIcon event={event} compact={compact} />
              </div>

              {/* Right content */}
              <div className={position === "right" ? "" : "order-1"}>
                {position === "right" && (
                  <TimelineItemContent
                    event={event}
                    position="right"
                    relativeTime={relativeTime}
                    compact={compact}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineIcon({
  event,
  compact,
}: {
  event: TimelineEvent;
  compact: boolean;
}) {
  const type = event.type ?? "default";
  const { bg, icon: DefaultIcon } = typeStyles[type];
  const Icon = event.icon ?? DefaultIcon;

  return (
    <div
      className={cn(
        "relative z-10 flex items-center justify-center rounded-full",
        compact ? "h-8 w-8" : "h-10 w-10",
        event.user ? "bg-background border-2" : bg
      )}
    >
      {event.user ? (
        <Avatar className={cn(compact ? "h-7 w-7" : "h-9 w-9")}>
          <AvatarImage src={event.user.avatar} alt={event.user.name} />
          <AvatarFallback className="text-xs">
            {event.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <Icon className={cn("text-white", compact ? "h-4 w-4" : "h-5 w-5")} />
      )}
    </div>
  );
}

function TimelineItemContent({
  event,
  position,
  relativeTime,
  compact,
}: {
  event: TimelineEvent;
  position: "left" | "right";
  relativeTime: boolean;
  compact: boolean;
}) {
  const type = event.type ?? "default";

  return (
    <div className={position === "left" ? "pr-4" : "pl-4"}>
      <div className={cn("flex items-center gap-2 mb-1", position === "left" && "justify-end")}>
        <h4 className={cn("font-medium", compact && "text-sm")}>
          {event.title}
        </h4>
        {event.type && event.type !== "default" && (
          <Badge variant="secondary" className="text-xs capitalize">
            {type}
          </Badge>
        )}
      </div>

      <div className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        position === "left" && "justify-end"
      )}>
        <time dateTime={new Date(event.date).toISOString()}>
          {formatEventDate(event.date, relativeTime)}
        </time>
      </div>

      {event.description && !compact && (
        <p className="text-sm text-muted-foreground mt-2">
          {event.description}
        </p>
      )}
    </div>
  );
}

function HorizontalTimeline({
  events,
  relativeTime,
  compact,
}: {
  events: TimelineEvent[];
  relativeTime: boolean;
  compact: boolean;
}) {
  return (
    <div className="relative overflow-x-auto pb-4">
      {/* Horizontal line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />

      <div className="flex gap-8 min-w-max px-4">
        {events.map((event) => {
          const type = event.type ?? "default";
          const { bg, icon: DefaultIcon } = typeStyles[type];
          const Icon = event.icon ?? DefaultIcon;

          return (
            <div key={event.id} className="flex flex-col items-center w-48">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full mb-4",
                  compact ? "h-8 w-8" : "h-10 w-10",
                  bg
                )}
              >
                <Icon className={cn("text-white", compact ? "h-4 w-4" : "h-5 w-5")} />
              </div>

              {/* Content */}
              <div className="text-center">
                <h4 className={cn("font-medium mb-1", compact && "text-sm")}>
                  {event.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatEventDate(event.date, relativeTime)}
                </p>
                {event.description && !compact && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Timeline({
  events,
  orientation = "vertical",
  alternate = false,
  showConnector = true,
  groupByDate = false,
  relativeTime = false,
  animate = true,
  linePosition = "left",
  compact = false,
  className,
}: TimelineProps) {
  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = typeof a.date === "string" ? new Date(a.date) : a.date;
    const dateB = typeof b.date === "string" ? new Date(b.date) : b.date;
    return dateB.getTime() - dateA.getTime();
  });

  // Group events by date if needed
  const groupedEvents = groupByDate
    ? sortedEvents.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
        const group = getDateGroup(event.date);
        if (!acc[group]) acc[group] = [];
        acc[group].push(event);
        return acc;
      }, {})
    : null;

  if (orientation === "horizontal") {
    return (
      <div className={className}>
        <HorizontalTimeline
          events={sortedEvents}
          relativeTime={relativeTime}
          compact={compact}
        />
      </div>
    );
  }

  if (alternate && linePosition === "center") {
    return (
      <div className={className}>
        <AlternatingTimeline
          events={sortedEvents}
          showConnector={showConnector}
          relativeTime={relativeTime}
          animate={animate}
          compact={compact}
        />
      </div>
    );
  }

  // Standard vertical timeline
  return (
    <div className={cn("relative", className)}>
      {groupedEvents ? (
        Object.entries(groupedEvents).map(([group, groupEvents]) => (
          <div key={group} className="mb-8">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 sticky top-0 bg-background py-2">
              {group}
            </h3>
            <div className={cn(linePosition === "right" && "flex flex-col items-end")}>
              {groupEvents.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  position={linePosition === "right" ? "right" : "left"}
                  showConnector={showConnector}
                  relativeTime={relativeTime}
                  animate={animate}
                  compact={compact}
                  isFirst={index === 0}
                  isLast={index === groupEvents.length - 1}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className={cn(linePosition === "right" && "flex flex-col items-end")}>
          {sortedEvents.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              position={linePosition === "right" ? "right" : "left"}
              showConnector={showConnector}
              relativeTime={relativeTime}
              animate={animate}
              compact={compact}
              isFirst={index === 0}
              isLast={index === sortedEvents.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Key Implementation Notes

1. **Multiple Layouts**: Vertical, horizontal, and alternating
2. **Date Grouping**: Optional grouping by day
3. **Scroll Animation**: Events animate when scrolled into view
4. **Type Indicators**: Color-coded event types

## Variants

### Activity Feed

```tsx
<Timeline
  events={[
    {
      id: "1",
      title: "Created pull request",
      description: "feat: Add new dashboard component",
      date: new Date(),
      type: "info",
      user: { name: "John Doe", avatar: "/avatars/john.jpg" },
    },
    {
      id: "2",
      title: "Merged to main",
      date: new Date(Date.now() - 3600000),
      type: "success",
      user: { name: "Jane Smith" },
    },
  ]}
  relativeTime
  groupByDate
/>
```

### Process Steps

```tsx
<Timeline
  events={[
    { id: "1", title: "Order Placed", date: orderDate, type: "success" },
    { id: "2", title: "Processing", date: processDate, type: "info" },
    { id: "3", title: "Shipped", date: shipDate, type: "success" },
    { id: "4", title: "Delivered", date: deliverDate, type: "default" },
  ]}
  showConnector
  compact
/>
```

### Changelog

```tsx
<Timeline
  events={releases.map((release) => ({
    id: release.version,
    title: `Version ${release.version}`,
    description: release.summary,
    date: release.date,
    type: release.breaking ? "warning" : "default",
    content: (
      <ul className="text-sm space-y-1">
        {release.changes.map((change, i) => (
          <li key={i}>{change}</li>
        ))}
      </ul>
    ),
  }))}
  alternate
  linePosition="center"
/>
```

### Horizontal

```tsx
<Timeline
  events={milestones}
  orientation="horizontal"
  compact
/>
```

## Performance

### Long Lists

- Virtualize for 100+ events
- Paginate or load more
- Lazy load content cards

### Animations

- Use `useInView` with `once: true`
- Disable animations if `prefers-reduced-motion`
- Limit animated items in viewport

## Accessibility

### Required Attributes

- Time elements have datetime attribute
- Events are in semantic list structure
- Icons have aria-hidden

### Screen Reader

- Events read in chronological order
- User names and dates announced
- Status types are described

### Keyboard Navigation

- Interactive elements are focusable
- Content cards are navigable
- Links within events work

## Dependencies

```json
{
  "dependencies": {
    "date-fns": "^3.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Timeline displayed normally | All events visible |
| Loading | Events being fetched | Skeleton items shown |
| Empty | No events to display | Empty state message |
| Animating | Events appearing on scroll | Fade/slide animation |
| Grouped | Events grouped by date | Date headers visible |
| Expanded | Event content expanded | Full details shown |
| Collapsed | Event content collapsed | Truncated description |

## Anti-patterns

### 1. Not parsing date strings consistently

```tsx
// Bad: Mixed date formats cause issues
const events = [
  { date: '2025-01-15' },       // String
  { date: new Date() },         // Date object
  { date: '15 Jan 2025' },      // Different format
];

// Good: Normalize dates on input
const events = rawEvents.map((event) => ({
  ...event,
  date: typeof event.date === 'string'
    ? new Date(event.date)
    : event.date,
}));
```

### 2. Missing datetime attribute on time elements

```tsx
// Bad: No machine-readable date
<span>{format(event.date, 'MMM d, yyyy')}</span>

// Good: Use time element with datetime
<time dateTime={event.date.toISOString()}>
  {format(event.date, 'MMM d, yyyy')}
</time>
```

### 3. Animating too many items at once

```tsx
// Bad: All items animate simultaneously
{events.map((event) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <TimelineItem event={event} />
  </motion.div>
))}

// Good: Use viewport detection for scroll-based animation
function TimelineItem({ event }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
    >
      {/* content */}
    </motion.div>
  );
}
```

### 4. Not respecting reduced motion preference

```tsx
// Bad: Always animate regardless of preference
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>

// Good: Check reduced motion preference
const prefersReducedMotion = usePrefersReducedMotion();

<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
>

// Or disable animations entirely
<Timeline
  events={events}
  animate={!prefersReducedMotion}
/>
```

## Related Skills

### Composes Into
- [templates/activity-feed](../templates/activity-feed.md)
- [templates/changelog-page](../templates/changelog-page.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Vertical, horizontal, and alternating layouts
- Date grouping
- Scroll animations
