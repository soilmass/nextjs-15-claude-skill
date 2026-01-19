---
id: m-timeline-item
name: Timeline Item
version: 2.0.0
layer: L2
category: data
description: Timeline entry component with connector lines, icons, and content
tags: [timeline, history, activity, feed, log]
formula: "TimelineItem = EventIcon(a-display-icon) + ConnectorLine + Title(a-display-text) + Description(a-display-text) + Timestamp(a-display-text)"
composes:
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
dependencies:
  lucide-react: "^0.460.0"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Timeline Item

## Overview

The Timeline Item molecule displays a single entry in a vertical timeline with customizable icons, connector lines, timestamps, and content. Supports various visual variants for different event types (success, error, pending) and works within a Timeline container component.

## When to Use

Use this skill when:
- Displaying activity/event history
- Building order tracking interfaces
- Creating changelog displays
- Showing process/workflow steps

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       TimelineItem                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────────────────────────────────────┐ │
│  │   Icon     │  │              Content                       │ │
│  │  (a-disp-  │  │  ┌──────────────────────────────────────┐  │ │
│  │   icon)    │  │  │  Title (a-display-text)              │  │ │
│  │            │  │  │  "Order shipped"                     │  │ │
│  │     ✓      │  │  └──────────────────────────────────────┘  │ │
│  │            │  │  ┌──────────────────────────────────────┐  │ │
│  │            │  │  │  Description (a-display-text)        │  │ │
│  └────────────┘  │  │  "Your package is on its way"        │  │ │
│        │         │  └──────────────────────────────────────┘  │ │
│        │         │  ┌──────────────────────────────────────┐  │ │
│  Connector Line  │  │  Timestamp (a-display-text)          │  │ │
│        │         │  │  "Jan 18, 2025 at 10:30 AM"          │  │ │
│        ▼         │  └──────────────────────────────────────┘  │ │
│  [next item]     └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Variants:
  ✓ Success (green)   ⚠️ Warning (yellow)   ❌ Error (red)   ⏳ Pending (gray)
```

## Atoms Used

- [display-icon](../atoms/display-icon.md) - Event type indicators
- [display-text](../atoms/display-text.md) - Title and description
- [display-badge](../atoms/display-badge.md) - Status indicators

## Implementation

```typescript
// components/ui/timeline-item.tsx
import * as React from "react";
import { Check, Circle, AlertCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TimelineVariant = "default" | "success" | "error" | "warning" | "pending";

interface TimelineItemProps {
  /** Title of the timeline event */
  title: string;
  /** Description or additional content */
  description?: React.ReactNode;
  /** Timestamp of the event */
  timestamp?: string | Date;
  /** Format for timestamp display */
  timestampFormat?: "relative" | "absolute" | "datetime";
  /** Visual variant */
  variant?: TimelineVariant;
  /** Custom icon (overrides variant icon) */
  icon?: React.ReactNode;
  /** Whether this is the last item (hides connector) */
  isLast?: boolean;
  /** Whether this is the current/active item */
  isActive?: boolean;
  /** Additional content below description */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

const variantConfig: Record<TimelineVariant, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  lineColor: string;
}> = {
  default: {
    icon: <Circle className="h-3 w-3" />,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    lineColor: "bg-border",
  },
  success: {
    icon: <Check className="h-3 w-3" />,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    lineColor: "bg-green-200 dark:bg-green-900/50",
  },
  error: {
    icon: <X className="h-3 w-3" />,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    lineColor: "bg-red-200 dark:bg-red-900/50",
  },
  warning: {
    icon: <AlertCircle className="h-3 w-3" />,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    lineColor: "bg-amber-200 dark:bg-amber-900/50",
  },
  pending: {
    icon: <Clock className="h-3 w-3" />,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    lineColor: "bg-border border-dashed",
  },
};

function formatTimestamp(
  timestamp: string | Date,
  format: "relative" | "absolute" | "datetime"
): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  
  if (format === "relative") {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return rtf.format(-days, "day");
    if (hours > 0) return rtf.format(-hours, "hour");
    if (minutes > 0) return rtf.format(-minutes, "minute");
    return rtf.format(-seconds, "second");
  }
  
  if (format === "datetime") {
    return date.toLocaleString("en", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  
  return date.toLocaleDateString("en", { dateStyle: "medium" });
}

export function TimelineItem({
  title,
  description,
  timestamp,
  timestampFormat = "relative",
  variant = "default",
  icon,
  isLast = false,
  isActive = false,
  children,
  className,
}: TimelineItemProps) {
  const config = variantConfig[variant];
  const displayIcon = icon ?? config.icon;

  return (
    <div
      className={cn(
        "relative flex gap-4 pb-8 last:pb-0",
        isLast && "pb-0",
        className
      )}
    >
      {/* Connector line */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-[15px] top-8 h-[calc(100%-24px)] w-0.5",
            config.lineColor,
            variant === "pending" && "border-l-2 border-dashed bg-transparent"
          )}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.iconBg,
          config.iconColor,
          isActive && "ring-2 ring-primary ring-offset-2"
        )}
        aria-hidden="true"
      >
        {displayIcon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3
            className={cn(
              "text-sm font-medium",
              isActive && "text-primary"
            )}
          >
            {title}
          </h3>
          {timestamp && (
            <time
              className="text-xs text-muted-foreground shrink-0"
              dateTime={
                typeof timestamp === "string"
                  ? timestamp
                  : timestamp.toISOString()
              }
            >
              {formatTimestamp(timestamp, timestampFormat)}
            </time>
          )}
        </div>
        
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
        
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
```

```typescript
// components/ui/timeline.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps {
  /** Timeline items */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  const items = React.Children.toArray(children);
  
  return (
    <div
      className={cn("relative", className)}
      role="list"
      aria-label="Timeline"
    >
      {React.Children.map(items, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isLast: index === items.length - 1,
          });
        }
        return child;
      })}
    </div>
  );
}
```

```typescript
// components/ui/activity-timeline.tsx
import * as React from "react";
import { Timeline } from "./timeline";
import { TimelineItem } from "./timeline-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Activity {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  user?: {
    name: string;
    avatar?: string;
  };
  variant?: "default" | "success" | "error" | "warning" | "pending";
}

interface ActivityTimelineProps {
  activities: Activity[];
  className?: string;
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  return (
    <Timeline className={className}>
      {activities.map((activity) => (
        <TimelineItem
          key={activity.id}
          title={activity.title}
          description={activity.description}
          timestamp={activity.timestamp}
          variant={activity.variant}
          icon={
            activity.user && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback className="text-xs">
                  {activity.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )
          }
        />
      ))}
    </Timeline>
  );
}
```

### Key Implementation Notes

1. **Connector Lines**: Positioned absolutely, hidden for last item
2. **Variant System**: Pre-configured colors and icons per event type
3. **Relative Time**: Uses Intl.RelativeTimeFormat for localization
4. **Avatar Support**: Custom icon slot allows user avatars

## Variants

### Default Timeline Item

```tsx
<TimelineItem
  title="Order placed"
  description="Your order has been received"
  timestamp={new Date()}
/>
```

### Success Variant

```tsx
<TimelineItem
  title="Payment confirmed"
  description="Payment of $299.00 was successful"
  timestamp="2025-01-15T10:30:00"
  variant="success"
/>
```

### Error Variant

```tsx
<TimelineItem
  title="Delivery failed"
  description="Unable to deliver. Address not found."
  timestamp="2025-01-14T15:45:00"
  variant="error"
/>
```

### Pending Variant

```tsx
<TimelineItem
  title="Awaiting pickup"
  description="Package is ready for courier pickup"
  timestamp="2025-01-16T09:00:00"
  variant="pending"
  isActive
/>
```

### With Custom Icon

```tsx
<TimelineItem
  title="John commented"
  description="Looking great!"
  timestamp="2025-01-15T14:30:00"
  icon={
    <Avatar className="h-8 w-8">
      <AvatarImage src="/avatars/john.jpg" alt="John" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  }
/>
```

### With Additional Content

```tsx
<TimelineItem
  title="Invoice generated"
  description="Invoice #INV-2025-001 has been created"
  timestamp="2025-01-15"
  variant="success"
>
  <Button variant="outline" size="sm">
    Download Invoice
  </Button>
</TimelineItem>
```

## States

| State | Icon | Line | Ring | Title |
|-------|------|------|------|-------|
| Default | muted circle | solid | none | normal |
| Active | variant icon | solid | primary | primary color |
| Success | check | green | none | normal |
| Error | x mark | red | none | normal |
| Warning | alert | amber | none | normal |
| Pending | clock | dashed | none | normal |
| Last | variant icon | hidden | none | normal |

## Accessibility

### Required ARIA Attributes

- `role="list"` on Timeline container
- `aria-label` for timeline purpose
- `<time>` element with `dateTime` attribute

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate to interactive elements within items |

### Screen Reader Announcements

- Timeline announced as a list
- Each item title and timestamp read
- Variant status should be in title/description

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install lucide-react
```

## Examples

### Order Tracking

```tsx
import { Timeline, TimelineItem } from "@/components/ui/timeline";

export function OrderTracking({ order }) {
  const steps = [
    { title: "Order placed", timestamp: order.placedAt, variant: "success" },
    { title: "Payment confirmed", timestamp: order.paidAt, variant: "success" },
    { title: "Processing", timestamp: order.processingAt, variant: "success" },
    { 
      title: "Shipped", 
      timestamp: order.shippedAt, 
      variant: order.shippedAt ? "success" : "pending",
      isActive: !order.deliveredAt,
    },
    { 
      title: "Delivered", 
      timestamp: order.deliveredAt, 
      variant: order.deliveredAt ? "success" : "pending",
      isActive: Boolean(order.deliveredAt),
    },
  ];

  return (
    <Timeline>
      {steps.map((step, index) => (
        <TimelineItem
          key={step.title}
          title={step.title}
          timestamp={step.timestamp}
          variant={step.variant as any}
          isActive={step.isActive}
          timestampFormat="datetime"
        />
      ))}
    </Timeline>
  );
}
```

### Activity Feed

```tsx
import { ActivityTimeline } from "@/components/ui/activity-timeline";

const activities = [
  {
    id: "1",
    title: "Sarah updated the design",
    description: "Changed the hero section layout",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    user: { name: "Sarah", avatar: "/avatars/sarah.jpg" },
  },
  {
    id: "2",
    title: "Build succeeded",
    description: "Production deployment completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    variant: "success",
  },
  {
    id: "3",
    title: "Test failed",
    description: "3 unit tests failed in checkout module",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    variant: "error",
  },
];

export function ActivityFeed() {
  return <ActivityTimeline activities={activities} />;
}
```

### Changelog

```tsx
const releases = [
  {
    version: "2.1.0",
    date: "2025-01-15",
    changes: ["Added dark mode", "Fixed login bug", "Improved performance"],
  },
  {
    version: "2.0.0",
    date: "2025-01-01",
    changes: ["Complete redesign", "New API", "Breaking changes"],
  },
];

export function Changelog() {
  return (
    <Timeline>
      {releases.map((release) => (
        <TimelineItem
          key={release.version}
          title={`Version ${release.version}`}
          timestamp={release.date}
          timestampFormat="absolute"
          variant="success"
        >
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {release.changes.map((change, i) => (
              <li key={i}>{change}</li>
            ))}
          </ul>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
```

### Process Steps

```tsx
export function ProcessSteps({ currentStep }) {
  const steps = [
    { id: 1, title: "Account creation", description: "Set up your account" },
    { id: 2, title: "Verification", description: "Verify your identity" },
    { id: 3, title: "Configuration", description: "Configure settings" },
    { id: 4, title: "Complete", description: "Start using the app" },
  ];

  return (
    <Timeline>
      {steps.map((step) => (
        <TimelineItem
          key={step.id}
          title={step.title}
          description={step.description}
          variant={
            step.id < currentStep
              ? "success"
              : step.id === currentStep
              ? "pending"
              : "default"
          }
          isActive={step.id === currentStep}
        />
      ))}
    </Timeline>
  );
}
```

## Anti-patterns

### Missing Timestamps

```tsx
// Bad - no temporal context
<TimelineItem title="Order shipped" />

// Good - includes timestamp
<TimelineItem
  title="Order shipped"
  timestamp="2025-01-15T10:00:00"
  timestampFormat="relative"
/>
```

### Inconsistent Variants

```tsx
// Bad - mixing success for different meanings
<TimelineItem title="Started" variant="success" />
<TimelineItem title="In progress" variant="success" />

// Good - semantic variants
<TimelineItem title="Started" variant="success" />
<TimelineItem title="In progress" variant="pending" isActive />
```

### No Visual Hierarchy

```tsx
// Bad - all items look the same
{items.map(item => <TimelineItem title={item.title} />)}

// Good - active state highlighted
{items.map((item, i) => (
  <TimelineItem
    title={item.title}
    isActive={i === currentIndex}
    variant={i < currentIndex ? "success" : "pending"}
  />
))}
```

## Related Skills

### Composes From
- [atoms/display-icon](../atoms/display-icon.md) - Event type indicators
- [atoms/display-text](../atoms/display-text.md) - Content
- [atoms/display-avatar](../atoms/display-avatar.md) - User avatars

### Composes Into
- [organisms/activity-feed](../organisms/activity-feed.md) - Activity lists
- [organisms/order-tracking](../organisms/order-tracking.md) - Order status

### Alternatives
- [molecules/list-item](./list-item.md) - For non-temporal lists
- [molecules/stepper](./stepper.md) - For interactive step navigation

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with variants
- Timeline container component
- ActivityTimeline for user activities
