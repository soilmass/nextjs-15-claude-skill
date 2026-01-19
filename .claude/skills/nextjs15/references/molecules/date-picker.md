---
id: m-date-picker
name: Date Picker
version: 2.0.0
layer: L2
category: forms
description: Calendar-based date selection with react-day-picker
tags: [date, calendar, picker, input, form]
formula: "DatePicker = InputText(a-input-text) + InputButton(a-input-button) + DisplayIcon(a-display-icon)"
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
dependencies:
  react-day-picker: "^9.4.0"
  date-fns: "^4.1.0"
  "@radix-ui/react-popover": "^1.1.2"
performance:
  impact: medium
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Date Picker

## Overview

The Date Picker molecule provides calendar-based date selection with keyboard navigation and localization support. Built with react-day-picker for robust date handling and Radix Popover for the dropdown.

## When to Use

Use this skill when:
- Selecting dates in forms (birthdays, appointments)
- Filtering by date ranges
- Scheduling events or deadlines
- Building booking interfaces

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DatePicker                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────── Trigger ─────────────────────────────┐  │
│  │  ┌───────────────────────────────────────┐  ┌───────────┐ │  │
│  │  │           Date Display                │  │ Calendar  │ │  │
│  │  │         (a-input-text)                │  │   Icon    │ │  │
│  │  │                                       │  │(a-display │ │  │
│  │  │        "January 18, 2025"             │  │  -icon)   │ │  │
│  │  │                                       │  │    📅     │ │  │
│  │  └───────────────────────────────────────┘  └───────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────── Popover ─────────────────────────────┐  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  < January 2025 >    (Month/Year Navigation)        │  │  │
│  │  ├─────────────────────────────────────────────────────┤  │  │
│  │  │  Su   Mo   Tu   We   Th   Fr   Sa                   │  │  │
│  │  │        1    2    3    4    5    6                   │  │  │
│  │  │   7    8    9   10   11   12   13                   │  │  │
│  │  │  14   15   16   17  [18]  19   20                   │  │  │
│  │  │  21   22   23   24   25   26   27                   │  │  │
│  │  │  28   29   30   31                                  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Range Picker Variant:
┌─────────────────────────────────────────────────────────────────┐
│  📅  Jan 15, 2025 - Jan 20, 2025                          ▼    │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [input-text](../atoms/input-text.md) - Date display input
- [input-button](../atoms/input-button.md) - Calendar trigger
- [display-icon](../atoms/display-icon.md) - Calendar icon

## Implementation

```typescript
// components/ui/date-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DatePickerProps {
  /** Selected date */
  value?: Date;
  /** Change handler */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Date format string */
  dateFormat?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disabled dates */
  disabled?: Date[] | ((date: Date) => boolean);
  /** Disabled state */
  isDisabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  minDate,
  maxDate,
  disabled,
  isDisabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    if (date) setOpen(false);
  };

  const disabledMatcher = React.useMemo(() => {
    const matchers: any[] = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    if (disabled) {
      if (Array.isArray(disabled)) {
        matchers.push(...disabled);
      } else {
        matchers.push(disabled);
      }
    }
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate, disabled]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          disabled={isDisabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : placeholder}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-popover w-auto p-0 rounded-md border bg-popover shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          align="start"
          sideOffset={4}
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabledMatcher}
            defaultMonth={value}
            className="p-3"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                "inline-flex items-center justify-center rounded-md",
                "hover:bg-accent hover:text-accent-foreground"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative",
              day: cn(
                "h-9 w-9 p-0 font-normal",
                "inline-flex items-center justify-center rounded-md",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              ),
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
              day_hidden: "invisible",
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

```typescript
// components/ui/date-range-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DateRangePickerProps {
  /** Selected date range */
  value?: DateRange;
  /** Change handler */
  onChange?: (range: DateRange | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Number of months to show */
  numberOfMonths?: number;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  numberOfMonths = 2,
  minDate,
  maxDate,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const disabledMatcher = React.useMemo(() => {
    const matchers: any[] = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "LLL dd, y")} -{" "}
                {format(value.to, "LLL dd, y")}
              </>
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            placeholder
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-popover w-auto p-0 rounded-md border bg-popover shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out"
          )}
          align="start"
          sideOffset={4}
        >
          <DayPicker
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={numberOfMonths}
            disabled={disabledMatcher}
            defaultMonth={value?.from}
            className="p-3"
            classNames={{
              // Same classNames as DatePicker
              day_range_start: "day-range-start rounded-l-md",
              day_range_end: "day-range-end rounded-r-md",
              day_range_middle: "bg-accent rounded-none",
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

### Key Implementation Notes

1. **react-day-picker**: v9 provides excellent accessibility and keyboard navigation
2. **date-fns**: Used for date formatting with locale support

## Variants

### Single Date

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Select date"
/>
```

### Date Range

```tsx
<DateRangePicker
  value={range}
  onChange={setRange}
  numberOfMonths={2}
/>
```

### With Constraints

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date()}
  maxDate={addMonths(new Date(), 3)}
/>
```

### Disabled Dates

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  disabled={[
    new Date(2024, 0, 1),
    { dayOfWeek: [0, 6] }, // Weekends
  ]}
/>
```

### Custom Format

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  dateFormat="MM/dd/yyyy"
/>
```

## States

| State | Trigger | Calendar | Selection |
|-------|---------|----------|-----------|
| Empty | placeholder | closed | none |
| Selected | formatted date | closed | highlighted |
| Open | formatted date | visible | highlighted |
| Disabled | muted | closed | - |
| Invalid | error border | closed | - |

## Accessibility

### Required ARIA Attributes

- Calendar has proper `role` and `aria-label`
- Days are focusable with `tabindex`
- Selected date announced

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter/Space` | Open calendar / Select date |
| `Arrow Keys` | Navigate days |
| `Page Up/Down` | Navigate months |
| `Escape` | Close calendar |
| `Tab` | Move between focusable elements |

### Screen Reader Announcements

- "Choose [selected date or placeholder]"
- Calendar navigation announced
- Date selection announced

## Dependencies

```json
{
  "dependencies": {
    "react-day-picker": "^9.4.0",
    "date-fns": "^4.1.0",
    "@radix-ui/react-popover": "^1.1.2",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install react-day-picker date-fns @radix-ui/react-popover lucide-react
```

## Examples

### Form Integration

```tsx
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";

export function EventForm() {
  const [date, setDate] = useState<Date>();

  return (
    <FormField label="Event Date" required>
      <DatePicker
        value={date}
        onChange={setDate}
        minDate={new Date()}
        placeholder="Select event date"
      />
    </FormField>
  );
}
```

### Booking System

```tsx
import { DateRangePicker } from "@/components/ui/date-range-picker";

export function BookingForm({ unavailableDates }) {
  const [range, setRange] = useState<DateRange>();

  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      disabled={unavailableDates}
      minDate={new Date()}
      placeholder="Select check-in and check-out"
    />
  );
}
```

### With React Hook Form

```tsx
import { Controller } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";

export function ControlledDatePicker({ control, name }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DatePicker
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
}
```

## Anti-patterns

### No Date Constraints

```tsx
// Bad - allows selecting past dates for future events
<DatePicker value={date} onChange={setDate} />

// Good - prevent past dates
<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date()}
/>
```

### Wrong Format for Locale

```tsx
// Bad - US format for European users
<DatePicker dateFormat="MM/dd/yyyy" />

// Good - use locale-aware format
<DatePicker dateFormat="PPP" /> // Uses date-fns locale
```

## Related Skills

### Composes From
- [atoms/input-text](../atoms/input-text.md) - Date input display
- [atoms/input-button](../atoms/input-button.md) - Trigger button

### Composes Into
- [molecules/form-field](./form-field.md) - Form integration
- [organisms/booking-form](../organisms/booking-form.md) - Booking flows

### Alternatives
- Native `<input type="date">` - For simple cases
- Time picker - For time selection

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with react-day-picker v9
- Single date and range picker variants
- Disabled dates and constraints support
