---
id: a-display-time
name: Time Display
version: 2.0.0
layer: L1
category: display
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Relative and absolute time display with auto-updating
tags: [display, time, date, relative, timestamp, moment, ago]
performance:
  impact: low
  lcp: neutral
  cls: neutral
dependencies:
  - react
  - date-fns
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Time Display

## Overview

A time display component that shows dates and times in human-readable formats. Supports relative time ("2 hours ago"), absolute time, and auto-updating for real-time displays.

## Implementation

```tsx
// components/ui/time-display.tsx
'use client';

import * as React from 'react';
import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
  differenceInMinutes,
} from 'date-fns';
import { cn } from '@/lib/utils';

export interface TimeDisplayProps extends React.HTMLAttributes<HTMLTimeElement> {
  /** The date to display */
  date: Date | string | number;
  /** Display format */
  variant?: 'relative' | 'absolute' | 'smart' | 'datetime';
  /** Custom format string (for absolute variant) */
  formatString?: string;
  /** Auto-update interval in seconds (0 to disable) */
  updateInterval?: number;
  /** Add "ago" suffix for relative times */
  addSuffix?: boolean;
  /** Use strict relative time (e.g., "2 hours" vs "about 2 hours") */
  strict?: boolean;
  /** Locale for formatting */
  locale?: Locale;
  /** Show tooltip with full date */
  showTooltip?: boolean;
}

function parseDate(date: Date | string | number): Date {
  if (date instanceof Date) return date;
  if (typeof date === 'number') return new Date(date);
  return new Date(date);
}

function formatSmartDate(date: Date): string {
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);

  // Less than 1 minute ago
  if (diffMinutes < 1) {
    return 'Just now';
  }

  // Less than 1 hour ago
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  // Less than 24 hours ago
  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ago`;
  }

  // Today
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  // Yesterday
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }

  // This week
  if (isThisWeek(date)) {
    return format(date, 'EEEE'); // Day name
  }

  // This year
  if (isThisYear(date)) {
    return format(date, 'MMM d'); // Jan 15
  }

  // Older
  return format(date, 'MMM d, yyyy'); // Jan 15, 2024
}

const TimeDisplay = React.forwardRef<HTMLTimeElement, TimeDisplayProps>(
  (
    {
      date,
      variant = 'relative',
      formatString = 'PPP',
      updateInterval = 60,
      addSuffix = true,
      strict = false,
      locale,
      showTooltip = true,
      className,
      ...props
    },
    ref
  ) => {
    const parsedDate = React.useMemo(() => parseDate(date), [date]);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    // Auto-update for relative times
    React.useEffect(() => {
      if (variant === 'absolute' || updateInterval === 0) return;

      const interval = setInterval(forceUpdate, updateInterval * 1000);
      return () => clearInterval(interval);
    }, [variant, updateInterval]);

    const displayText = React.useMemo(() => {
      switch (variant) {
        case 'relative':
          return strict
            ? formatDistanceToNowStrict(parsedDate, { addSuffix, locale })
            : formatDistanceToNow(parsedDate, { addSuffix, locale });

        case 'absolute':
          return format(parsedDate, formatString, { locale });

        case 'smart':
          return formatSmartDate(parsedDate);

        case 'datetime':
          return format(parsedDate, "PPP 'at' p", { locale });

        default:
          return formatDistanceToNow(parsedDate, { addSuffix, locale });
      }
    }, [parsedDate, variant, formatString, addSuffix, strict, locale]);

    const isoString = parsedDate.toISOString();
    const fullDate = format(parsedDate, 'PPPP p');

    const timeElement = (
      <time
        ref={ref}
        dateTime={isoString}
        title={showTooltip ? fullDate : undefined}
        className={cn('text-muted-foreground', className)}
        {...props}
      >
        {displayText}
      </time>
    );

    return timeElement;
  }
);
TimeDisplay.displayName = 'TimeDisplay';

export { TimeDisplay };
```

## Variants

### Relative Time

```tsx
function RelativeTime({ date }: { date: Date }) {
  return (
    <TimeDisplay
      date={date}
      variant="relative"
      addSuffix
    />
  );
}

// Output examples:
// "less than a minute ago"
// "about 2 hours ago"
// "3 days ago"
```

### Smart Time

```tsx
function SmartTime({ date }: { date: Date }) {
  return (
    <TimeDisplay
      date={date}
      variant="smart"
    />
  );
}

// Output examples:
// "Just now"
// "5m ago"
// "2h ago"
// "Today at 3:45 PM"
// "Yesterday at 10:30 AM"
// "Monday"
// "Jan 15"
// "Jan 15, 2024"
```

### Absolute Time

```tsx
function AbsoluteTime({ date }: { date: Date }) {
  return (
    <TimeDisplay
      date={date}
      variant="absolute"
      formatString="MMM d, yyyy"
    />
  );
}

// Output: "Jan 15, 2025"
```

### Timestamp

```tsx
function Timestamp({ date }: { date: Date }) {
  return (
    <TimeDisplay
      date={date}
      variant="datetime"
    />
  );
}

// Output: "January 15th, 2025 at 3:45 PM"
```

### Live Updating

```tsx
function LiveTime({ date }: { date: Date }) {
  return (
    <TimeDisplay
      date={date}
      variant="relative"
      updateInterval={30} // Update every 30 seconds
    />
  );
}
```

### Compact Time Badge

```tsx
function TimeBadge({ date }: { date: Date }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
      <TimeDisplay
        date={date}
        variant="smart"
        className="text-muted-foreground"
      />
    </span>
  );
}
```

### Post Timestamp

```tsx
function PostTimestamp({ 
  createdAt, 
  updatedAt 
}: { 
  createdAt: Date; 
  updatedAt?: Date;
}) {
  const wasEdited = updatedAt && updatedAt > createdAt;

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <TimeDisplay date={createdAt} variant="smart" showTooltip />
      {wasEdited && (
        <>
          <span>·</span>
          <span className="italic">
            edited <TimeDisplay date={updatedAt} variant="relative" />
          </span>
        </>
      )}
    </div>
  );
}
```

### Duration Display

```tsx
function DurationDisplay({ 
  startDate, 
  endDate 
}: { 
  startDate: Date; 
  endDate: Date;
}) {
  const durationMs = endDate.getTime() - startDate.getTime();
  
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <span className="text-muted-foreground">
      {formatDuration(durationMs)}
    </span>
  );
}
```

### Countdown Timer

```tsx
'use client';

import * as React from 'react';
import { differenceInSeconds } from 'date-fns';

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [remaining, setRemaining] = React.useState(() => 
    Math.max(0, differenceInSeconds(targetDate, new Date()))
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      const diff = differenceInSeconds(targetDate, new Date());
      setRemaining(Math.max(0, diff));
      
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (remaining === 0) {
    return <span className="text-green-500">Now!</span>;
  }

  return (
    <div className="flex gap-2 font-mono">
      {days > 0 && (
        <span>{days}d</span>
      )}
      <span>{String(hours).padStart(2, '0')}h</span>
      <span>{String(minutes).padStart(2, '0')}m</span>
      <span>{String(seconds).padStart(2, '0')}s</span>
    </div>
  );
}
```

## Server Component Version

```tsx
// For server components (no auto-update)
import { format, formatDistanceToNow } from 'date-fns';

interface ServerTimeDisplayProps {
  date: Date | string | number;
  variant?: 'relative' | 'absolute';
  formatString?: string;
  className?: string;
}

export function ServerTimeDisplay({
  date,
  variant = 'relative',
  formatString = 'PPP',
  className,
}: ServerTimeDisplayProps) {
  const parsedDate = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  const displayText = variant === 'relative'
    ? formatDistanceToNow(parsedDate, { addSuffix: true })
    : format(parsedDate, formatString);

  return (
    <time
      dateTime={parsedDate.toISOString()}
      className={className}
    >
      {displayText}
    </time>
  );
}
```

## Dependencies

```bash
npm install date-fns
```

## Accessibility

- Uses semantic `<time>` element with `dateTime` attribute
- Tooltip shows full date/time on hover
- Screen readers can parse the ISO datetime

## Related Skills

- [date-formatting](../patterns/date-formatting.md) - Date formatting patterns
- [timeline-item](../molecules/timeline-item.md) - Timeline with timestamps
- [blog-post](../organisms/blog-post.md) - Post timestamps

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Relative, absolute, smart variants
- Auto-updating support
- Countdown timer
