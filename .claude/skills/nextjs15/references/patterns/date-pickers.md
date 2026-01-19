---
id: pt-date-pickers
name: Date Pickers
version: 2.0.0
layer: L5
category: forms
description: Implement accessible date and time pickers in Next.js 15
tags: [forms, date-picker, calendar, time-picker, accessibility]
composes:
  - ../molecules/date-picker.md
  - ../molecules/form-field.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
  - ../atoms/interactive-popover.md
dependencies: []
formula: "DatePickers = react-day-picker + Popover(a-interactive-popover) + Button(a-input-button) + Icon(a-display-icon) + Controller(react-hook-form)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Date Pickers Pattern

## Overview

Date pickers provide user-friendly interfaces for selecting dates and times. This pattern covers implementing accessible date pickers using react-day-picker with proper form integration and timezone handling.

## When to Use

- Booking systems requiring check-in/check-out date selection
- Scheduling applications (appointments, meetings, events)
- Filtering data by date ranges (reports, analytics)
- Birthday or date of birth fields in registration forms
- Deadline or due date selection in task management
- Flight/hotel search forms with departure/return dates

## Composition Diagram

```
+------------------------------------------------------------------+
|                       Date Picker Pattern                         |
+------------------------------------------------------------------+
|                                                                  |
|  +-------------------------------------------------------------+ |
|  |              DatePicker Component                            | |
|  |  +-------------------------------------------------------+  | |
|  |  |  Popover.Trigger (Button)                             |  | |
|  |  |  +----------+  +----------------------------+         |  | |
|  |  |  | Calendar |  | Formatted Date or          |         |  | |
|  |  |  | Icon     |  | Placeholder Text           |         |  | |
|  |  |  | (a-disp- |  +----------------------------+         |  | |
|  |  |  | icon)    |                                         |  | |
|  |  |  +----------+                                         |  | |
|  |  +-------------------------------------------------------+  | |
|  +-------------------------------------------------------------+ |
|                                |                                 |
|                        click opens                               |
|                                v                                 |
|  +-------------------------------------------------------------+ |
|  |              Popover.Content (a-interactive-popover)         | |
|  |  +-------------------------------------------------------+  | |
|  |  |              DayPicker (react-day-picker)              |  | |
|  |  |  +----------------+  +-----------------------------+   |  | |
|  |  |  | Navigation     |  | Month/Year display          |   |  | |
|  |  |  | (< Prev | Next>)|  +-----------------------------+   |  | |
|  |  |  +----------------+                                    |  | |
|  |  |  +----------------------------------------------------+|  | |
|  |  |  |  Sun | Mon | Tue | Wed | Thu | Fri | Sat           ||  | |
|  |  |  |-----------------------------------------------------|  | |
|  |  |  |  Day cells with selection states                   ||  | |
|  |  |  |  - Selected (highlighted)                          ||  | |
|  |  |  |  - Today (bold)                                    ||  | |
|  |  |  |  - Disabled (grayed)                               ||  | |
|  |  |  |  - Range (for date range picker)                   ||  | |
|  |  |  +----------------------------------------------------+|  | |
|  |  +-------------------------------------------------------+  | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  For DateRangePicker: Two DayPicker calendars side by side      |
|  For TimePicker: Scrollable list of time options                 |
|  For DateTimePicker: DatePicker + TimePicker combined            |
|                                                                  |
+------------------------------------------------------------------+
```

## Implementation

### Basic Date Picker

```tsx
// components/forms/date-picker.tsx
'use client';

import { useState, forwardRef } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      onChange,
      placeholder = 'Select date',
      disabled = false,
      minDate,
      maxDate,
      disabledDates = [],
      className = '',
    },
    ref
  ) {
    const [open, setOpen] = useState(false);

    const handleSelect = (date: Date | undefined) => {
      onChange?.(date);
      if (date) {
        setOpen(false);
      }
    };

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-2 border rounded-lg
              text-left w-full
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
              ${!value ? 'text-gray-400' : 'text-gray-900'}
              ${className}
            `}
          >
            <Calendar className="w-4 h-4" />
            <span className="flex-1">
              {value ? format(value, 'PPP') : placeholder}
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white rounded-lg shadow-xl border p-3 z-50"
            sideOffset={4}
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={handleSelect}
              disabled={[
                { before: minDate },
                { after: maxDate },
                ...disabledDates,
              ].filter(Boolean)}
              showOutsideDays
              components={{
                IconLeft: () => <ChevronLeft className="w-4 h-4" />,
                IconRight: () => <ChevronRight className="w-4 h-4" />,
              }}
              classNames={{
                months: 'flex flex-col sm:flex-row gap-4',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell: 'text-gray-500 rounded-md w-9 font-normal text-xs',
                row: 'flex w-full mt-2',
                cell: 'text-center text-sm p-0 relative',
                day: 'h-9 w-9 p-0 font-normal rounded-lg hover:bg-gray-100',
                day_selected: 'bg-blue-500 text-white hover:bg-blue-600',
                day_today: 'bg-gray-100 font-semibold',
                day_outside: 'text-gray-300',
                day_disabled: 'text-gray-300 cursor-not-allowed',
              }}
            />
            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
);
```

### Date Range Picker

```tsx
// components/forms/date-range-picker.tsx
'use client';

import { useState, forwardRef } from 'react';
import { format, differenceInDays } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import { Calendar } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  maxRange?: number; // Max days in range
  className?: string;
}

export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      onChange,
      placeholder = 'Select date range',
      disabled = false,
      minDate,
      maxDate,
      maxRange,
      className = '',
    },
    ref
  ) {
    const [open, setOpen] = useState(false);

    const handleSelect = (range: DateRange | undefined) => {
      // Validate max range
      if (range?.from && range?.to && maxRange) {
        const days = differenceInDays(range.to, range.from);
        if (days > maxRange) {
          return;
        }
      }
      
      onChange?.(range);
      
      // Close when both dates selected
      if (range?.from && range?.to) {
        setOpen(false);
      }
    };

    const formatRange = () => {
      if (!value?.from) return placeholder;
      if (!value.to) return format(value.from, 'PP');
      return `${format(value.from, 'PP')} - ${format(value.to, 'PP')}`;
    };

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-2 border rounded-lg
              text-left w-full
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
              ${!value?.from ? 'text-gray-400' : 'text-gray-900'}
              ${className}
            `}
          >
            <Calendar className="w-4 h-4" />
            <span className="flex-1">{formatRange()}</span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white rounded-lg shadow-xl border p-3 z-50"
            sideOffset={4}
          >
            <DayPicker
              mode="range"
              selected={value}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={[
                { before: minDate },
                { after: maxDate },
              ].filter(Boolean)}
              showOutsideDays
              classNames={{
                months: 'flex flex-col sm:flex-row gap-4',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell: 'text-gray-500 rounded-md w-9 font-normal text-xs',
                row: 'flex w-full mt-2',
                cell: 'text-center text-sm p-0 relative',
                day: 'h-9 w-9 p-0 font-normal rounded-lg hover:bg-gray-100',
                day_selected: 'bg-blue-500 text-white',
                day_range_start: 'rounded-l-lg',
                day_range_end: 'rounded-r-lg',
                day_range_middle: 'bg-blue-100 rounded-none',
                day_today: 'font-semibold',
                day_outside: 'text-gray-300',
                day_disabled: 'text-gray-300 cursor-not-allowed',
              }}
            />
            
            {/* Quick select presets */}
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <PresetButton
                onClick={() => {
                  const today = new Date();
                  handleSelect({ from: today, to: today });
                }}
              >
                Today
              </PresetButton>
              <PresetButton
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today);
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  handleSelect({ from: weekAgo, to: today });
                }}
              >
                Last 7 days
              </PresetButton>
              <PresetButton
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(today);
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  handleSelect({ from: monthAgo, to: today });
                }}
              >
                Last 30 days
              </PresetButton>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
);

function PresetButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
    >
      {children}
    </button>
  );
}
```

### Time Picker

```tsx
// components/forms/time-picker.tsx
'use client';

import { useState, forwardRef, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface TimePickerProps {
  value?: string; // HH:mm format
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
  step?: number; // Minutes
  className?: string;
}

export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(
  function TimePicker(
    {
      value,
      onChange,
      placeholder = 'Select time',
      disabled = false,
      minTime = '00:00',
      maxTime = '23:59',
      step = 30,
      className = '',
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    // Generate time options
    const timeOptions = generateTimeOptions(minTime, maxTime, step);

    // Scroll to selected time when opening
    useEffect(() => {
      if (open && value && listRef.current) {
        const selectedElement = listRef.current.querySelector(
          `[data-value="${value}"]`
        );
        selectedElement?.scrollIntoView({ block: 'center' });
      }
    }, [open, value]);

    const handleSelect = (time: string) => {
      onChange?.(time);
      setOpen(false);
    };

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-2 border rounded-lg
              text-left w-full
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
              ${!value ? 'text-gray-400' : 'text-gray-900'}
              ${className}
            `}
          >
            <Clock className="w-4 h-4" />
            <span className="flex-1">
              {value ? formatTime(value) : placeholder}
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white rounded-lg shadow-xl border z-50 w-48"
            sideOffset={4}
          >
            <div
              ref={listRef}
              className="max-h-60 overflow-y-auto py-1"
            >
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  data-value={time}
                  onClick={() => handleSelect(time)}
                  className={`
                    w-full px-3 py-2 text-left text-sm hover:bg-gray-100
                    ${value === time ? 'bg-blue-50 text-blue-600' : ''}
                  `}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
);

function generateTimeOptions(min: string, max: string, step: number): string[] {
  const options: string[] = [];
  const [minHour, minMinute] = min.split(':').map(Number);
  const [maxHour, maxMinute] = max.split(':').map(Number);

  let current = minHour * 60 + minMinute;
  const end = maxHour * 60 + maxMinute;

  while (current <= end) {
    const hours = Math.floor(current / 60);
    const minutes = current % 60;
    options.push(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    );
    current += step;
  }

  return options;
}
```

### DateTime Picker

```tsx
// components/forms/datetime-picker.tsx
'use client';

import { useState, forwardRef } from 'react';
import { format, setHours, setMinutes, parseISO } from 'date-fns';
import { DatePicker } from './date-picker';
import { TimePicker } from './time-picker';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

export const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(
  function DateTimePicker(
    { value, onChange, minDate, maxDate, disabled = false, className = '' },
    ref
  ) {
    const handleDateChange = (date: Date | undefined) => {
      if (!date) {
        onChange?.(undefined);
        return;
      }

      // Preserve time if we have a current value
      if (value) {
        date = setHours(date, value.getHours());
        date = setMinutes(date, value.getMinutes());
      }

      onChange?.(date);
    };

    const handleTimeChange = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      let newDate = value || new Date();
      newDate = setHours(newDate, hours);
      newDate = setMinutes(newDate, minutes);
      onChange?.(newDate);
    };

    const currentTime = value
      ? `${value.getHours().toString().padStart(2, '0')}:${value
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      : undefined;

    return (
      <div ref={ref} className={`flex gap-2 ${className}`}>
        <div className="flex-1">
          <DatePicker
            value={value}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            placeholder="Select date"
          />
        </div>
        <div className="w-32">
          <TimePicker
            value={currentTime}
            onChange={handleTimeChange}
            disabled={disabled || !value}
            placeholder="Time"
          />
        </div>
      </div>
    );
  }
);
```

### Form Integration

```tsx
// components/forms/booking-form.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DatePicker } from './date-picker';
import { DateRangePicker } from './date-range-picker';
import { TimePicker } from './time-picker';
import { addDays, isBefore, isAfter } from 'date-fns';

const bookingSchema = z.object({
  checkIn: z.date({ required_error: 'Check-in date is required' }),
  checkOut: z.date({ required_error: 'Check-out date is required' }),
  preferredTime: z.string().optional(),
}).refine(
  (data) => isBefore(data.checkIn, data.checkOut),
  {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  }
);

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookingForm() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const checkIn = watch('checkIn');

  const onSubmit = (data: BookingFormData) => {
    console.log('Booking:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Check-in Date</label>
        <Controller
          name="checkIn"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              minDate={new Date()}
              placeholder="Select check-in date"
            />
          )}
        />
        {errors.checkIn && (
          <p className="text-red-500 text-sm mt-1">{errors.checkIn.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Check-out Date</label>
        <Controller
          name="checkOut"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              minDate={checkIn ? addDays(checkIn, 1) : new Date()}
              placeholder="Select check-out date"
              disabled={!checkIn}
            />
          )}
        />
        {errors.checkOut && (
          <p className="text-red-500 text-sm mt-1">{errors.checkOut.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Preferred Check-in Time (optional)
        </label>
        <Controller
          name="preferredTime"
          control={control}
          render={({ field }) => (
            <TimePicker
              value={field.value}
              onChange={field.onChange}
              minTime="14:00"
              maxTime="22:00"
              step={30}
              placeholder="Select preferred time"
            />
          )}
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Book Now
      </button>
    </form>
  );
}
```

## Variants

### Localized Date Picker

```tsx
// With date-fns locale support
import { es, fr, de } from 'date-fns/locale';

<DayPicker
  locale={es} // Spanish locale
  weekStartsOn={1} // Monday
/>
```

## Anti-Patterns

```tsx
// Bad: Using native date input (inconsistent across browsers)
<input type="date" /> 

// Good: Use a proper date picker component
<DatePicker value={date} onChange={setDate} />

// Bad: Not validating date ranges
const checkOut = new Date('2024-01-01');
const checkIn = new Date('2024-01-10'); // Check-out before check-in!

// Good: Validate with schema
.refine((data) => isBefore(data.checkIn, data.checkOut))
```

## Related Skills

- `form-validation` - Form validation
- `date-formatting` - Date formatting
- `i18n-routing` - Internationalization
- `number-formatting` - Number formatting

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial date picker patterns
