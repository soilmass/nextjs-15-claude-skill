---
id: o-calendar
name: Calendar
version: 2.0.0
layer: L3
category: data
description: Full-featured calendar with events, views, and date navigation
tags: [calendar, events, scheduling, date, agenda, schedule]
formula: "Calendar = ViewSelector(Button[]) + Navigation(Button[]) + CalendarGrid + EventPopover(m-popover) + Badge(a-badge)[] + EventCreator"
composes: []
dependencies: [date-fns, framer-motion, lucide-react]
performance:
  impact: medium
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Calendar

## Overview

The Calendar organism provides a comprehensive calendar view with month, week, and day layouts. Supports event display, creation, navigation, and date range selection. Optimized for both desktop and mobile views.

## When to Use

Use this skill when:
- Building scheduling/booking interfaces
- Creating event management systems
- Displaying time-based data
- Building availability pickers

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Calendar (L3)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Header                                                    │  │
│  │  ┌────────────────┐              ┌────────────────────┐   │  │
│  │  │ Navigation     │              │ View Selector      │   │  │
│  │  │[◀][January 25] │              │[Month][Week][Day]  │   │  │
│  │  │     [▶]        │              │  Button(a-button)  │   │  │
│  │  │ Button(a-btn)  │              │                    │   │  │
│  │  └────────────────┘              └────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Calendar Grid (Month View)                                │  │
│  │  ┌────┬────┬────┬────┬────┬────┬────┐                     │  │
│  │  │Sun │Mon │Tue │Wed │Thu │Fri │Sat │                     │  │
│  │  ├────┼────┼────┼────┼────┼────┼────┤                     │  │
│  │  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │                     │  │
│  │  │    │●●  │    │    │●   │    │    │ ●=Badge(a-badge)    │  │
│  │  ├────┼────┼────┼────┼────┼────┼────┤                     │  │
│  │  │ 8  │ 9  │ 10 │ 11 │ 12 │ 13 │ 14 │                     │  │
│  │  │●   │    │    │●●● │    │    │    │                     │  │
│  │  └────┴────┴────┴────┴────┴────┴────┘                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Event Popover (m-popover) - on click                      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ Team Meeting                                        │  │  │
│  │  │ 10:00 AM - 11:00 AM                                │  │  │
│  │  │ [Edit] [Delete]  Button(a-button)                   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [button](../atoms/button.md) - Navigation controls
- [badge](../atoms/badge.md) - Event indicators
- [popover](../molecules/popover.md) - Event details

## Implementation

```typescript
// components/organisms/calendar.tsx
"use client";

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  differenceInMinutes,
  startOfDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  location?: string;
  description?: string;
  allDay?: boolean;
}

interface CalendarProps {
  /** Events to display */
  events?: CalendarEvent[];
  /** Initial date to display */
  defaultDate?: Date;
  /** Calendar view */
  view?: "month" | "week" | "day" | "agenda";
  /** Date selected callback */
  onDateSelect?: (date: Date) => void;
  /** Event clicked callback */
  onEventClick?: (event: CalendarEvent) => void;
  /** Add event callback */
  onAddEvent?: (date: Date) => void;
  /** First day of week (0 = Sunday) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** Disable navigation */
  disableNavigation?: boolean;
  /** Min selectable date */
  minDate?: Date;
  /** Max selectable date */
  maxDate?: Date;
  /** Additional class names */
  className?: string;
}

const eventColors: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  default: "bg-primary",
};

function EventBadge({
  event,
  onClick,
  compact = false,
}: {
  event: CalendarEvent;
  onClick?: () => void;
  compact?: boolean;
}) {
  const color = eventColors[event.color ?? "default"];
  const startDate = typeof event.start === "string" ? parseISO(event.start) : event.start;

  if (compact) {
    return (
      <div
        className={cn("h-1.5 w-1.5 rounded-full", color)}
        title={event.title}
      />
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "w-full text-left text-xs px-1.5 py-0.5 rounded truncate text-white",
            color
          )}
        >
          {!event.allDay && (
            <span className="font-medium mr-1">
              {format(startDate, "HH:mm")}
            </span>
          )}
          {event.title}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold">{event.title}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(startDate, "MMM d, yyyy h:mm a")}
              {event.end && (
                <>
                  {" - "}
                  {format(
                    typeof event.end === "string" ? parseISO(event.end) : event.end,
                    "h:mm a"
                  )}
                </>
              )}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          {event.description && (
            <p className="text-sm text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MonthView({
  currentDate,
  events,
  onDateSelect,
  onEventClick,
  onAddEvent,
  weekStartsOn = 0,
  showWeekNumbers,
  minDate,
  maxDate,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showWeekNumbers?: boolean;
  minDate?: Date;
  maxDate?: Date;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const orderedWeekDays = [
    ...weekDays.slice(weekStartsOn),
    ...weekDays.slice(0, weekStartsOn),
  ];

  const getEventsForDay = (date: Date) =>
    events.filter((event) => {
      const eventDate = typeof event.start === "string" 
        ? parseISO(event.start) 
        : event.start;
      return isSameDay(eventDate, date);
    });

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className={cn(
        "grid gap-px bg-muted text-center text-xs font-medium text-muted-foreground",
        showWeekNumbers ? "grid-cols-8" : "grid-cols-7"
      )}>
        {showWeekNumbers && <div className="p-2">Wk</div>}
        {orderedWeekDays.map((day) => (
          <div key={day} className="p-2 bg-background">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-muted gap-px">
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className={cn(
              "grid gap-px",
              showWeekNumbers ? "grid-cols-8" : "grid-cols-7"
            )}
          >
            {showWeekNumbers && (
              <div className="bg-background p-2 text-xs text-muted-foreground text-center">
                {format(week[0], "w")}
              </div>
            )}
            {week.map((date) => {
              const dayEvents = getEventsForDay(date);
              const isDisabled = isDateDisabled(date);
              const isCurrentMonth = isSameMonth(date, currentDate);

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "bg-background min-h-[100px] p-1 relative group",
                    !isCurrentMonth && "bg-muted/50",
                    isDisabled && "opacity-50 pointer-events-none"
                  )}
                >
                  <button
                    onClick={() => onDateSelect?.(date)}
                    className={cn(
                      "w-7 h-7 rounded-full text-sm flex items-center justify-center transition-colors",
                      isToday(date) &&
                        "bg-primary text-primary-foreground font-bold",
                      !isToday(date) &&
                        "hover:bg-muted"
                    )}
                  >
                    {format(date, "d")}
                  </button>

                  {/* Events */}
                  <div className="space-y-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <EventBadge
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event)}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Add button */}
                  {onAddEvent && (
                    <button
                      onClick={() => onAddEvent(date)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekView({
  currentDate,
  events,
  onDateSelect,
  onEventClick,
  weekStartsOn = 0,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDay = (date: Date) =>
    events.filter((event) => {
      const eventDate = typeof event.start === "string" 
        ? parseISO(event.start) 
        : event.start;
      return isSameDay(eventDate, date);
    });

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 w-16" /> {/* Time column spacer */}
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "p-2 text-center border-l",
              isToday(day) && "bg-primary/10"
            )}
          >
            <div className="text-xs text-muted-foreground">
              {format(day, "EEE")}
            </div>
            <button
              onClick={() => onDateSelect?.(day)}
              className={cn(
                "w-8 h-8 rounded-full text-lg font-medium flex items-center justify-center mx-auto",
                isToday(day) && "bg-primary text-primary-foreground"
              )}
            >
              {format(day, "d")}
            </button>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-8 relative">
          {/* Time labels */}
          <div className="w-16">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 text-xs text-muted-foreground text-right pr-2 -mt-2"
              >
                {format(new Date().setHours(hour, 0, 0, 0), "ha")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={day.toISOString()}
                className="border-l relative"
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 border-b border-dashed"
                  />
                ))}

                {/* Events */}
                {dayEvents
                  .filter((e) => !e.allDay)
                  .map((event) => {
                    const start = typeof event.start === "string" 
                      ? parseISO(event.start) 
                      : event.start;
                    const end = typeof event.end === "string"
                      ? parseISO(event.end)
                      : event.end ?? start;
                    const dayStart = startOfDay(start);
                    const topOffset = differenceInMinutes(start, dayStart) * (48 / 60);
                    const height = Math.max(differenceInMinutes(end, start) * (48 / 60), 20);
                    const color = eventColors[event.color ?? "default"];

                    return (
                      <button
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "absolute left-0.5 right-0.5 rounded px-1 text-xs text-white overflow-hidden",
                          color
                        )}
                        style={{
                          top: `${topOffset}px`,
                          height: `${height}px`,
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="truncate opacity-80">
                          {format(start, "h:mm a")}
                        </div>
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function AgendaView({
  currentDate,
  events,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}) {
  // Get events for the next 30 days
  const endDate = addDays(currentDate, 30);
  
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = typeof event.start === "string" 
        ? parseISO(event.start) 
        : event.start;
      return eventDate >= currentDate && eventDate <= endDate;
    })
    .sort((a, b) => {
      const aDate = typeof a.start === "string" ? parseISO(a.start) : a.start;
      const bDate = typeof b.start === "string" ? parseISO(b.start) : b.start;
      return aDate.getTime() - bDate.getTime();
    });

  // Group by date
  const groupedEvents = upcomingEvents.reduce<Record<string, CalendarEvent[]>>(
    (acc, event) => {
      const eventDate = typeof event.start === "string" 
        ? parseISO(event.start) 
        : event.start;
      const key = format(eventDate, "yyyy-MM-dd");
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    },
    {}
  );

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
          <div key={dateKey}>
            <h3 className="font-semibold text-sm mb-2 sticky top-0 bg-background py-1">
              {format(parseISO(dateKey), "EEEE, MMMM d")}
              {isToday(parseISO(dateKey)) && (
                <Badge variant="secondary" className="ml-2">
                  Today
                </Badge>
              )}
            </h3>
            <div className="space-y-2">
              {dayEvents.map((event) => {
                const start = typeof event.start === "string" 
                  ? parseISO(event.start) 
                  : event.start;
                const color = eventColors[event.color ?? "default"];

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div
                      className={cn("w-1 h-full min-h-[40px] rounded-full", color)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.allDay
                          ? "All day"
                          : format(start, "h:mm a")}
                        {event.location && ` - ${event.location}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {upcomingEvents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No upcoming events
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

export function Calendar({
  events = [],
  defaultDate = new Date(),
  view = "month",
  onDateSelect,
  onEventClick,
  onAddEvent,
  weekStartsOn = 0,
  showWeekNumbers = false,
  disableNavigation = false,
  minDate,
  maxDate,
  className,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(defaultDate);
  const [currentView, setCurrentView] = React.useState(view);
  const [direction, setDirection] = React.useState(0);

  const navigatePrevious = () => {
    setDirection(-1);
    if (currentView === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const navigateNext = () => {
    setDirection(1);
    if (currentView === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (currentView === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTitle = () => {
    if (currentView === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (currentView === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn });
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  return (
    <div className={cn("bg-background rounded-lg border", className)}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {!disableNavigation && (
            <>
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={goToToday}>
            Today
          </Button>
          <h2 className="font-semibold text-lg ml-2">{getTitle()}</h2>
        </div>
        <div className="flex items-center gap-1">
          {(["month", "week", "agenda"] as const).map((v) => (
            <Button
              key={v}
              variant={currentView === v ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentView(v)}
              className="capitalize"
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${currentView}-${currentDate.toISOString()}`}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentView === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDateSelect={onDateSelect}
              onEventClick={onEventClick}
              onAddEvent={onAddEvent}
              weekStartsOn={weekStartsOn}
              showWeekNumbers={showWeekNumbers}
              minDate={minDate}
              maxDate={maxDate}
            />
          )}
          {currentView === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onDateSelect={onDateSelect}
              onEventClick={onEventClick}
              weekStartsOn={weekStartsOn}
            />
          )}
          {currentView === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventClick={onEventClick}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

### Key Implementation Notes

1. **Multiple Views**: Month, week, and agenda layouts
2. **Event Positioning**: Automatic placement based on time
3. **Navigation Animation**: Smooth transitions between periods
4. **Event Popovers**: Details shown on click

## Variants

### Month View

```tsx
<Calendar
  events={[
    {
      id: "1",
      title: "Team Meeting",
      start: new Date("2025-01-20T10:00:00"),
      end: new Date("2025-01-20T11:00:00"),
      color: "blue",
    },
  ]}
  view="month"
  onDateSelect={(date) => console.log("Selected:", date)}
/>
```

### Week View

```tsx
<Calendar
  events={events}
  view="week"
  weekStartsOn={1}
  onEventClick={(event) => openEventModal(event)}
/>
```

### With Add Event

```tsx
<Calendar
  events={events}
  onAddEvent={(date) => {
    setNewEventDate(date);
    setIsCreateModalOpen(true);
  }}
  onEventClick={handleEventClick}
/>
```

## Performance

### Large Event Sets

- Virtualize events in week view
- Paginate events in agenda view
- Use efficient date filtering

### Rendering

- Memoize event calculations
- Lazy load event details
- Debounce navigation

## Accessibility

### Required Attributes

- Calendar grid uses proper table semantics
- Date buttons have accessible labels
- View switcher uses radio group pattern

### Keyboard Navigation

- Arrow keys navigate dates
- Enter/Space select dates
- Tab moves between interactive elements

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
| Default | Calendar displays current month/week with events | Grid of dates with event badges, navigation controls visible |
| Month View | Displaying full month grid | 7-column grid showing all days of month with event indicators |
| Week View | Displaying single week with time slots | 7-column grid with 24-hour time slots, events positioned by time |
| Agenda View | Displaying list of upcoming events | Chronological list grouped by date, no grid layout |
| Today Highlighted | Current date emphasized | Today's date cell has primary background color |
| Date Selected | User clicked on a date | Selected date receives focus ring or highlight |
| Event Popover Open | User clicked an event | Popover shows event details with time, location, description |
| Navigating | Transition between months/weeks | Animated slide transition in navigation direction |
| Date Disabled | Date outside min/max range | Reduced opacity, pointer events disabled |
| No Events | Calendar has no events to display | Empty grid cells, agenda shows "No upcoming events" |
| Event Overflow | More than 3 events on a day | "+N more" indicator shown, full list in popover |

## Anti-patterns

### Bad: Not handling timezone differences

```tsx
// Bad - creating dates without timezone consideration
const events = [
  {
    id: '1',
    title: 'Meeting',
    start: new Date('2025-01-20T10:00:00'), // Local time assumed
  },
];

// Good - use ISO strings or explicit timezones
const events = [
  {
    id: '1',
    title: 'Meeting',
    start: new Date('2025-01-20T10:00:00Z'), // UTC
    // or store as ISO string and parse consistently
    start: '2025-01-20T10:00:00-05:00', // With timezone offset
  },
];
```

### Bad: Mutating event objects directly

```tsx
// Bad - mutating event state directly
const handleReschedule = (event, newDate) => {
  event.start = newDate; // Direct mutation!
  setEvents(events);
};

// Good - create new event object
const handleReschedule = (eventId, newDate) => {
  setEvents(events.map(event =>
    event.id === eventId
      ? { ...event, start: newDate }
      : event
  ));
};
```

### Bad: Not debouncing navigation

```tsx
// Bad - rapid navigation causes performance issues
<Calendar
  onNavigate={(date) => {
    fetchEventsForMonth(date); // Called on every click
  }}
/>

// Good - debounce navigation handlers
const debouncedFetch = useDebouncedCallback(
  (date) => fetchEventsForMonth(date),
  300
);

<Calendar onNavigate={debouncedFetch} />
```

### Bad: Loading all events regardless of view

```tsx
// Bad - fetching entire year of events upfront
useEffect(() => {
  fetchAllEvents(); // Potentially thousands of events
}, []);

// Good - fetch only visible range
useEffect(() => {
  const { start, end } = getVisibleDateRange(currentDate, currentView);
  fetchEventsForRange(start, end);
}, [currentDate, currentView]);
```

## Related Skills

### Composes Into
- [templates/scheduling-layout](../templates/scheduling-layout.md)
- [templates/dashboard-layout](../templates/dashboard-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Month, week, and agenda views
- Event popovers
- Navigation animations
