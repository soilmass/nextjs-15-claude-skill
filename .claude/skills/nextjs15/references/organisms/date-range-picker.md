---
id: o-date-range-picker
name: Date Range Picker
version: 1.0.0
layer: L3
category: input
description: Date range selection component with calendar view and preset ranges
tags: [date, range, picker, calendar, input]
formula: "DateRangePicker = DatePicker(m-date-picker)[] + Button(a-button) + Popover(a-popover) + Calendar"
composes:
  - ../molecules/date-picker.md
  - ../atoms/input-button.md
  - ../atoms/interactive-popover.md
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

# Date Range Picker

## Overview

A comprehensive date range picker organism with dual calendar view, preset range options, and custom range selection. Supports min/max date constraints and various display formats.

## When to Use

Use this skill when:
- Building reporting/analytics dashboards
- Creating booking and reservation systems
- Filtering data by date range
- Scheduling features with date spans

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DateRangePicker (L3)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Trigger Button                                               │  │
│  │  ┌────────┐                                                   │  │
│  │  │Calendar│  Jan 15, 2025 - Jan 22, 2025          [▼]        │  │
│  │  │ Icon   │  Button(a-button)                                 │  │
│  │  └────────┘                                                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Popover Content (when open)                                  │  │
│  │  ┌─────────────────────┬─────────────────────────────────────┐│  │
│  │  │  Presets Sidebar    │  Calendar View                      ││  │
│  │  │  ┌───────────────┐  │  ┌─────────────┬─────────────────┐  ││  │
│  │  │  │ Today         │  │  │  January    │  February       │  ││  │
│  │  │  │ Yesterday     │  │  │  2025       │  2025           │  ││  │
│  │  │  │ Last 7 days   │  │  │  < >        │  < >            │  ││  │
│  │  │  │ Last 30 days  │  │  │             │                 │  ││  │
│  │  │  │ This month    │  │  │  [Calendar] │  [Calendar]     │  ││  │
│  │  │  │ Last month    │  │  │  Days grid  │  Days grid      │  ││  │
│  │  │  │ This year     │  │  │  with range │  with range     │  ││  │
│  │  │  │ Custom        │  │  │  highlight  │  highlight      │  ││  │
│  │  │  └───────────────┘  │  └─────────────┴─────────────────┘  ││  │
│  │  └─────────────────────┴─────────────────────────────────────┘│  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Footer: [Cancel] [Apply]  Button(a-button)[]           │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/date-range-picker.tsx
'use client';

import * as React from 'react';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
  addMonths,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
  eachDayOfInterval,
  getDay,
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface DateRange {
  from: Date;
  to: Date;
}

interface PresetRange {
  label: string;
  getValue: () => DateRange;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  showPresets?: boolean;
  presets?: PresetRange[];
  numberOfMonths?: 1 | 2;
  className?: string;
}

// Default presets
const defaultPresets: PresetRange[] = [
  {
    label: 'Today',
    getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: 'Yesterday',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: 'Last 7 days',
    getValue: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }),
  },
  {
    label: 'This month',
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: 'Last month',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: 'This year',
    getValue: () => ({ from: startOfYear(new Date()), to: endOfDay(new Date()) }),
  },
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function CalendarMonth({
  month,
  selectedRange,
  hoverDate,
  onDateClick,
  onDateHover,
  onMonthChange,
  minDate,
  maxDate,
}: {
  month: Date;
  selectedRange?: DateRange;
  hoverDate?: Date;
  onDateClick: (date: Date) => void;
  onDateHover: (date: Date | undefined) => void;
  onMonthChange: (delta: number) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const firstDayOfMonth = startOfMonth(month);
  const lastDayOfMonth = endOfMonth(month);
  const startDate = startOfWeek(firstDayOfMonth);
  const endDate = endOfWeek(lastDayOfMonth);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    if (maxDate && isAfter(date, endOfDay(maxDate))) return true;
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange) return false;
    return isWithinInterval(date, { start: selectedRange.from, end: selectedRange.to });
  };

  const isDateInHoverRange = (date: Date) => {
    if (!selectedRange?.from || selectedRange?.to || !hoverDate) return false;
    const start = isBefore(hoverDate, selectedRange.from) ? hoverDate : selectedRange.from;
    const end = isBefore(hoverDate, selectedRange.from) ? selectedRange.from : hoverDate;
    return isWithinInterval(date, { start, end });
  };

  return (
    <div className="p-3">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-1 rounded hover:bg-accent"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-medium text-sm">{format(month, 'MMMM yyyy')}</h3>
        <button
          onClick={() => onMonthChange(1)}
          className="p-1 rounded hover:bg-accent"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month.getMonth();
          const isSelected = selectedRange && (isSameDay(date, selectedRange.from) || isSameDay(date, selectedRange.to));
          const isRangeStart = selectedRange && isSameDay(date, selectedRange.from);
          const isRangeEnd = selectedRange && isSameDay(date, selectedRange.to);
          const inRange = isDateInRange(date);
          const inHoverRange = isDateInHoverRange(date);
          const disabled = isDateDisabled(date);

          return (
            <button
              key={index}
              onClick={() => !disabled && onDateClick(date)}
              onMouseEnter={() => onDateHover(date)}
              onMouseLeave={() => onDateHover(undefined)}
              disabled={disabled}
              className={cn(
                'h-9 w-9 text-sm rounded-full flex items-center justify-center transition-colors',
                !isCurrentMonth && 'text-muted-foreground/50',
                disabled && 'opacity-50 cursor-not-allowed',
                !disabled && !isSelected && 'hover:bg-accent',
                (inRange || inHoverRange) && !isSelected && 'bg-primary/10',
                isSelected && 'bg-primary text-primary-foreground',
                isRangeStart && 'rounded-r-none',
                isRangeEnd && 'rounded-l-none',
                inRange && !isSelected && !isRangeStart && !isRangeEnd && 'rounded-none'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date range',
  disabled = false,
  showPresets = true,
  presets = defaultPresets,
  numberOfMonths = 2,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value?.from || new Date());
  const [localRange, setLocalRange] = React.useState<Partial<DateRange> | undefined>(value);
  const [hoverDate, setHoverDate] = React.useState<Date | undefined>();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync with external value
  React.useEffect(() => {
    setLocalRange(value);
    if (value?.from) setCurrentMonth(value.from);
  }, [value]);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (date: Date) => {
    if (!localRange?.from || (localRange.from && localRange.to)) {
      // Start new selection
      setLocalRange({ from: startOfDay(date) });
    } else {
      // Complete selection
      const from = localRange.from;
      const to = date;
      const newRange = isBefore(to, from)
        ? { from: startOfDay(to), to: endOfDay(from) }
        : { from: startOfDay(from), to: endOfDay(to) };
      setLocalRange(newRange);
    }
  };

  const handlePresetClick = (preset: PresetRange) => {
    const range = preset.getValue();
    setLocalRange(range);
    setCurrentMonth(range.from);
  };

  const handleApply = () => {
    if (localRange?.from && localRange?.to) {
      onChange?.({ from: localRange.from, to: localRange.to });
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalRange(value);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange?.(undefined);
    setLocalRange(undefined);
    setIsOpen(false);
  };

  const displayValue = value
    ? `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`
    : placeholder;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm w-full',
          'hover:bg-accent transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-ring'
        )}
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className={cn('flex-1 text-left', !value && 'text-muted-foreground')}>
          {displayValue}
        </span>
        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="p-0.5 rounded hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-2 rounded-lg border bg-popover shadow-lg">
          <div className="flex">
            {/* Presets Sidebar */}
            {showPresets && (
              <div className="w-40 border-r p-2 space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-accent transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {/* Calendars */}
            <div className="flex">
              <CalendarMonth
                month={currentMonth}
                selectedRange={localRange?.from && localRange?.to ? localRange as DateRange : undefined}
                hoverDate={hoverDate}
                onDateClick={handleDateClick}
                onDateHover={setHoverDate}
                onMonthChange={(delta) => setCurrentMonth(addMonths(currentMonth, delta))}
                minDate={minDate}
                maxDate={maxDate}
              />
              {numberOfMonths === 2 && (
                <CalendarMonth
                  month={addMonths(currentMonth, 1)}
                  selectedRange={localRange?.from && localRange?.to ? localRange as DateRange : undefined}
                  hoverDate={hoverDate}
                  onDateClick={handleDateClick}
                  onDateHover={setHoverDate}
                  onMonthChange={(delta) => setCurrentMonth(addMonths(currentMonth, delta))}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t p-3">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!localRange?.from || !localRange?.to}
              className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { DateRangePicker } from '@/components/organisms/date-range-picker';

const [dateRange, setDateRange] = useState<DateRange | undefined>();

<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
/>
```

### With Min/Max Dates

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  minDate={new Date('2024-01-01')}
  maxDate={new Date()}
/>
```

### Single Month View

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  numberOfMonths={1}
  showPresets={false}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Picker closed with no selection | Trigger button shows placeholder text |
| Has Value | Date range selected | Trigger button shows "Jan 1, 2025 - Jan 15, 2025" format |
| Open | Calendar popover visible | Popover displayed below trigger with focus ring on trigger |
| Selecting Start | User clicked first date | Single date highlighted, awaiting end date selection |
| Selecting End | User hovering to select end | Hover preview shows range between start and hovered date |
| Range Selected | Both dates chosen | Range highlighted with rounded ends on start/end dates |
| Preset Hover | Mouse over preset option | Preset button shows hover background |
| Preset Active | Preset selected | Corresponding dates highlighted in calendar |
| Day Hover | Mouse over calendar day | Day shows hover background |
| Day Disabled | Date outside min/max range | Day appears faded with no hover effect |
| Day Outside Month | Day from adjacent month | Day text is more faded than current month days |
| Month Navigating | User clicked prev/next month | Calendar transitions to show different month |
| Cleared | User clicked clear button | Value removed, shows placeholder again |
| Disabled | Picker not interactive | Trigger appears faded, click has no effect |

## Anti-patterns

### 1. Min Date After Max Date

```tsx
// Bad: Conflicting date constraints
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  minDate={new Date('2025-12-31')}
  maxDate={new Date('2025-01-01')}  // Before min!
/>

// Good: Min date before max date
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  minDate={new Date('2025-01-01')}
  maxDate={new Date('2025-12-31')}
/>
```

### 2. Single Month View Without Presets

```tsx
// Bad: Hard to select long ranges with single month
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  numberOfMonths={1}
  showPresets={false}  // No quick selection options
/>

// Good: Provide presets when using single month
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  numberOfMonths={1}
  showPresets={true}  // Users can quickly select common ranges
/>
```

### 3. Not Handling Undefined Value

```tsx
// Bad: Assuming value is always defined
const [dateRange] = useState<DateRange>({
  from: new Date(),
  to: new Date()
});

// User can never clear the selection

// Good: Allow undefined for clearable selection
const [dateRange, setDateRange] = useState<DateRange | undefined>();

<DateRangePicker
  value={dateRange}
  onChange={setDateRange}  // Can receive undefined from clear
/>
```

### 4. Custom Presets Without Complete Date Objects

```tsx
// Bad: Presets returning incomplete or invalid dates
const badPresets = [
  {
    label: "Last Week",
    getValue: () => ({ from: "2025-01-01" })  // String, not Date! Missing 'to'
  }
];

// Good: Return complete DateRange with Date objects
const presets = [
  {
    label: "Last Week",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date())
    })
  }
];
```

## Related Skills

- `molecules/date-picker` - Single date picker
- `atoms/interactive-popover` - Popover component
- `patterns/form-controls` - Form input patterns

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- Dual calendar view
- Preset date ranges
- Min/max date constraints
- Range highlighting
