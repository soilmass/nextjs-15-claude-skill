---
id: pt-date-formatting
name: Date Formatting Patterns
version: 2.0.0
layer: L5
category: i18n
description: Locale-aware date and time formatting with relative times and timezone handling
tags: [i18n, dates, formatting, localization, intl]
composes:
  - ../organisms/calendar.md
dependencies:
  date-fns: "^4.1.0"
formula: Intl.DateTimeFormat + Locale + Timezone + Relative Time = Locale-Aware Dates
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## When to Use

- Displaying dates in user's preferred format (MM/DD/YYYY vs DD/MM/YYYY)
- Showing relative times that auto-update ("2 hours ago", "in 3 days")
- Formatting date ranges for events or time periods
- Handling timezone conversions for global applications
- Building calendar components with locale-aware weekday names

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATE FORMATTING                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Input Date                          │      │
│  │     2024-12-25T10:30:00Z (ISO 8601)                   │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                Format Styles                          │      │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │      │
│  │  │  full    │  │   long    │  │     medium       │  │      │
│  │  │  short   │  │  relative │  │    dateTime      │  │      │
│  │  └──────────┘  └───────────┘  └──────────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Locale-Specific Output                     │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │  en-US: December 25, 2024                     │   │      │
│  │  │  de-DE: 25. Dezember 2024                     │   │      │
│  │  │  ja-JP: 2024年12月25日                         │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │  Relative: 2 hours ago | in 3 days | yesterday│   │      │
│  │  │  Range: January 15 – 20, 2024                 │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                Timezone Handling                      │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │ User's TZ   │  │  Multi-TZ   │  │  Calendar   │  │      │
│  │  │ Detection   │  │  Display    │  │  Weekdays   │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Date Formatting Patterns

## Overview

Locale-aware date formatting ensures dates are displayed according to user preferences and cultural norms. This pattern covers absolute dates, relative times, and timezone handling.

## Implementation

### Basic Date Formatting with next-intl

```typescript
// components/formatted-date.tsx
"use client";

import { useFormatter, useNow } from "next-intl";

interface FormattedDateProps {
  date: Date | string | number;
  style?: "full" | "long" | "medium" | "short";
  showTime?: boolean;
}

export function FormattedDate({
  date,
  style = "medium",
  showTime = false,
}: FormattedDateProps) {
  const format = useFormatter();
  const dateObj = new Date(date);

  if (showTime) {
    return (
      <time dateTime={dateObj.toISOString()}>
        {format.dateTime(dateObj, {
          dateStyle: style,
          timeStyle: "short",
        })}
      </time>
    );
  }

  return (
    <time dateTime={dateObj.toISOString()}>
      {format.dateTime(dateObj, { dateStyle: style })}
    </time>
  );
}

// Usage
<FormattedDate date="2024-12-25" style="long" />
// English: December 25, 2024
// German: 25. Dezember 2024
// Japanese: 2024年12月25日
```

### Relative Time Formatting

```typescript
// components/relative-time.tsx
"use client";

import { useFormatter, useNow } from "next-intl";
import { useEffect, useState } from "react";

interface RelativeTimeProps {
  date: Date | string | number;
  updateInterval?: number; // milliseconds
}

export function RelativeTime({
  date,
  updateInterval = 60000, // 1 minute
}: RelativeTimeProps) {
  const format = useFormatter();
  const now = useNow({ updateInterval });
  const dateObj = new Date(date);

  return (
    <time dateTime={dateObj.toISOString()} title={format.dateTime(dateObj)}>
      {format.relativeTime(dateObj, now)}
    </time>
  );
}

// Usage
<RelativeTime date={post.publishedAt} />
// "2 hours ago", "in 3 days", "yesterday"
```

### Custom Relative Time with Thresholds

```typescript
// lib/date-utils.ts
import { useFormatter, useNow, useTranslations } from "next-intl";

interface RelativeTimeOptions {
  addSuffix?: boolean;
  thresholds?: {
    seconds?: number;
    minutes?: number;
    hours?: number;
    days?: number;
  };
}

export function useRelativeTime() {
  const format = useFormatter();
  const now = useNow({ updateInterval: 60000 });
  const t = useTranslations("Dates");

  return (date: Date | string | number, options: RelativeTimeOptions = {}) => {
    const dateObj = new Date(date);
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSeconds = Math.abs(Math.floor(diffMs / 1000));
    const diffMinutes = Math.abs(Math.floor(diffMs / (1000 * 60)));
    const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    const thresholds = {
      seconds: 60,
      minutes: 60,
      hours: 24,
      days: 7,
      ...options.thresholds,
    };

    // Just now
    if (diffSeconds < thresholds.seconds) {
      return t("justNow");
    }

    // Minutes ago
    if (diffMinutes < thresholds.minutes) {
      return t("minutesAgo", { minutes: diffMinutes });
    }

    // Hours ago
    if (diffHours < thresholds.hours) {
      return t("hoursAgo", { hours: diffHours });
    }

    // Days ago (up to threshold)
    if (diffDays < thresholds.days) {
      if (diffDays === 1) {
        return diffMs < 0 ? t("yesterday") : t("tomorrow");
      }
      return t("daysAgo", { days: diffDays });
    }

    // Fall back to absolute date
    return format.dateTime(dateObj, { dateStyle: "medium" });
  };
}

// Usage in component
function PostMeta({ publishedAt }: { publishedAt: Date }) {
  const formatRelative = useRelativeTime();

  return <span>{formatRelative(publishedAt)}</span>;
}
```

### Date Range Formatting

```typescript
// components/date-range.tsx
"use client";

import { useFormatter } from "next-intl";

interface DateRangeProps {
  start: Date | string;
  end: Date | string;
  style?: "full" | "long" | "medium" | "short";
}

export function DateRange({ start, end, style = "medium" }: DateRangeProps) {
  const format = useFormatter();
  const startDate = new Date(start);
  const endDate = new Date(end);

  return (
    <span>
      {format.dateTimeRange(startDate, endDate, {
        dateStyle: style,
      })}
    </span>
  );
}

// Usage
<DateRange start="2024-01-15" end="2024-01-20" style="long" />
// English: January 15 – 20, 2024
// German: 15.–20. Januar 2024
```

### Server-Side Date Formatting

```typescript
// app/[locale]/blog/[slug]/page.tsx
import { getFormatter, getTranslations } from "next-intl/server";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const format = await getFormatter({ locale });
  const t = await getTranslations({ locale, namespace: "Blog" });

  const post = await getPost(slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p className="text-muted-foreground">
        {t("publishedOn", {
          date: format.dateTime(post.publishedAt, { dateStyle: "long" }),
        })}
      </p>
      <p>
        {t("readingTime", {
          minutes: post.readingTime,
        })}
      </p>
      {/* ... */}
    </article>
  );
}
```

### Timezone-Aware Formatting

```typescript
// components/timezone-date.tsx
"use client";

import { useFormatter, useTimeZone } from "next-intl";
import { useState } from "react";

interface TimezoneDateProps {
  date: Date | string;
  showTimezone?: boolean;
}

export function TimezoneDate({ date, showTimezone = false }: TimezoneDateProps) {
  const format = useFormatter();
  const userTimeZone = useTimeZone();
  const dateObj = new Date(date);

  const formatted = format.dateTime(dateObj, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: userTimeZone,
  });

  if (showTimezone) {
    const timezoneName = format.dateTime(dateObj, {
      timeZoneName: "short",
      timeZone: userTimeZone,
    });

    return (
      <time dateTime={dateObj.toISOString()}>
        {formatted} ({timezoneName.split(" ").pop()})
      </time>
    );
  }

  return <time dateTime={dateObj.toISOString()}>{formatted}</time>;
}

// Multi-timezone display
export function MultiTimezoneDate({ date }: { date: Date | string }) {
  const format = useFormatter();
  const dateObj = new Date(date);

  const timezones = [
    { zone: "America/New_York", label: "NYC" },
    { zone: "Europe/London", label: "London" },
    { zone: "Asia/Tokyo", label: "Tokyo" },
  ];

  return (
    <div className="space-y-1">
      {timezones.map(({ zone, label }) => (
        <div key={zone} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span>
            {format.dateTime(dateObj, {
              timeStyle: "short",
              timeZone: zone,
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Date Formatting Hooks

```typescript
// hooks/use-date-format.ts
"use client";

import { useFormatter, useLocale, useNow } from "next-intl";

export function useDateFormat() {
  const format = useFormatter();
  const locale = useLocale();
  const now = useNow({ updateInterval: 60000 });

  return {
    // Full date with weekday
    full: (date: Date | string) =>
      format.dateTime(new Date(date), {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),

    // Long date
    long: (date: Date | string) =>
      format.dateTime(new Date(date), { dateStyle: "long" }),

    // Medium date (default)
    medium: (date: Date | string) =>
      format.dateTime(new Date(date), { dateStyle: "medium" }),

    // Short date
    short: (date: Date | string) =>
      format.dateTime(new Date(date), { dateStyle: "short" }),

    // Time only
    time: (date: Date | string) =>
      format.dateTime(new Date(date), { timeStyle: "short" }),

    // Date and time
    dateTime: (date: Date | string) =>
      format.dateTime(new Date(date), {
        dateStyle: "medium",
        timeStyle: "short",
      }),

    // Relative
    relative: (date: Date | string) =>
      format.relativeTime(new Date(date), now),

    // Month and year
    monthYear: (date: Date | string) =>
      format.dateTime(new Date(date), {
        month: "long",
        year: "numeric",
      }),

    // ISO string (for APIs)
    iso: (date: Date | string) => new Date(date).toISOString(),

    // Check if same day
    isSameDay: (date1: Date | string, date2: Date | string) => {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    },

    // Check if today
    isToday: (date: Date | string) => {
      const d = new Date(date);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    },
  };
}

// Usage
function EventDate({ event }: { event: Event }) {
  const dateFormat = useDateFormat();

  return (
    <div>
      <p>{dateFormat.full(event.startDate)}</p>
      {dateFormat.isToday(event.startDate) && (
        <span className="badge">Today</span>
      )}
      <p className="text-sm text-muted-foreground">
        {dateFormat.relative(event.startDate)}
      </p>
    </div>
  );
}
```

### Calendar Date Formatting

```typescript
// components/calendar-header.tsx
"use client";

import { useFormatter, useLocale } from "next-intl";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  const format = useFormatter();
  const locale = useLocale();

  // Get weekday names in current locale
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, i + 1); // Jan 1, 2024 is Monday
    return format.dateTime(date, { weekday: "short" });
  });

  // Adjust for locale's first day of week
  const firstDayOfWeek = locale === "en" ? 0 : 1; // Sunday vs Monday start
  const sortedWeekdays = [
    ...weekdays.slice(firstDayOfWeek),
    ...weekdays.slice(0, firstDayOfWeek),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevMonth}>←</button>
        <h2 className="text-lg font-semibold">
          {format.dateTime(currentDate, { month: "long", year: "numeric" })}
        </h2>
        <button onClick={onNextMonth}>→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted-foreground">
        {sortedWeekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
    </div>
  );
}
```

## Variants

### Using date-fns with Locale

```typescript
// lib/date-fns-locale.ts
import { format, formatDistance, formatRelative } from "date-fns";
import { enUS, es, fr, de, ja, zhCN } from "date-fns/locale";

const locales = { en: enUS, es, fr, de, ja, zh: zhCN };

export function formatDateFns(
  date: Date,
  formatStr: string,
  locale: keyof typeof locales = "en"
) {
  return format(date, formatStr, { locale: locales[locale] });
}

export function formatDistanceFns(
  date: Date,
  baseDate: Date,
  locale: keyof typeof locales = "en"
) {
  return formatDistance(date, baseDate, {
    addSuffix: true,
    locale: locales[locale],
  });
}
```

## Anti-patterns

1. **Hardcoded formats**: Using fixed date strings like "MM/DD/YYYY"
2. **Ignoring timezones**: Not handling timezone conversions
3. **No locale awareness**: Same format for all locales
4. **Missing time element**: Not using `<time>` for accessibility
5. **Stale relative times**: Not updating "5 minutes ago"

## Related Skills

- `L5/patterns/i18n-routing` - Locale-based routing
- `L5/patterns/translations` - Translation management
- `L5/patterns/number-formatting` - Number formatting
- `L5/patterns/locale-detection` - Detecting user locale

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with next-intl
