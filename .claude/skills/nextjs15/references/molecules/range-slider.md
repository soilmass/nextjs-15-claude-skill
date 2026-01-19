---
id: m-range-slider
name: Range Slider
version: 2.0.0
layer: L2
category: forms
description: Dual-handle range slider for selecting a value range with min/max bounds
tags: [slider, range, input, filter, price]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "RangeSlider = Slider(a-input-slider) + Text(a-display-text)"
composes:
  - ../atoms/input-slider.md
  - ../atoms/display-text.md
dependencies:
  react: "^19.0.0"
  "@radix-ui/react-slider": "^1.2.1"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Range Slider

## Overview

A dual-handle range slider molecule for selecting a range of values. Built on Radix UI Slider for accessibility, with support for custom formatting, step values, and visual feedback.

## Composition Diagram

```
+----------------------------------------------------------+
|                      RangeSlider                          |
|  +----------------------------------------------------+  |
|  |  Label                                              |  |
|  |  +------------------+        +------------------+   |  |
|  |  | Text (label)     |        | Text (values)    |   |  |
|  |  | "Price Range"    |        | "$25 - $75"      |   |  |
|  |  +------------------+        +------------------+   |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |  Min/Max Labels                                     |  |
|  |  +--------+                            +--------+   |  |
|  |  | Text   |                            | Text   |   |  |
|  |  | $0     |                            | $100   |   |  |
|  |  +--------+                            +--------+   |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |                     Slider                          |  |
|  |  +------[=====o=============o=====]------+         |  |
|  |          Min                Max                     |  |
|  |        Handle              Handle                   |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +------------------------+  +------------------------+  |
|  |  Min Input             |  |  Max Input             |  |
|  |  +------------------+  |  |  +------------------+  |  |
|  |  | Text Input       |  |  |  | Text Input       |  |  |
|  |  | [25            ] |  |  |  | [75            ] |  |  |
|  |  +------------------+  |  |  +------------------+  |  |
|  +------------------------+  +------------------------+  |
+----------------------------------------------------------+
```

## Implementation

```tsx
// components/molecules/range-slider.tsx
'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Types
interface RangeSliderProps
  extends Omit<SliderPrimitive.SliderProps, 'value' | 'defaultValue' | 'onValueChange'>,
    VariantProps<typeof sliderVariants> {
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  onValueCommit?: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  showLabels?: boolean;
  showTooltip?: boolean;
  showMinMax?: boolean;
  showInput?: boolean;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
}

// Styles
const sliderVariants = cva('relative flex w-full touch-none select-none items-center', {
  variants: {
    size: {
      sm: '[&_[data-track]]:h-1 [&_[data-thumb]]:h-4 [&_[data-thumb]]:w-4',
      md: '[&_[data-track]]:h-2 [&_[data-thumb]]:h-5 [&_[data-thumb]]:w-5',
      lg: '[&_[data-track]]:h-3 [&_[data-thumb]]:h-6 [&_[data-thumb]]:w-6',
    },
    variant: {
      default: '[&_[data-range]]:bg-primary [&_[data-thumb]]:border-primary',
      success: '[&_[data-range]]:bg-green-500 [&_[data-thumb]]:border-green-500',
      warning: '[&_[data-range]]:bg-yellow-500 [&_[data-thumb]]:border-yellow-500',
      danger: '[&_[data-range]]:bg-red-500 [&_[data-thumb]]:border-red-500',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

// Default formatter
const defaultFormat = (value: number) => value.toString();

// Tooltip component
function SliderTooltip({
  value,
  formatValue,
  visible,
}: {
  value: number;
  formatValue: (v: number) => string;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        'absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md transition-opacity',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {formatValue(value)}
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
    </div>
  );
}

export function RangeSlider({
  value,
  defaultValue = [25, 75],
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  formatValue = defaultFormat,
  showLabels = false,
  showTooltip = false,
  showMinMax = false,
  showInput = false,
  label,
  minLabel = 'Min',
  maxLabel = 'Max',
  size,
  variant,
  disabled,
  className,
  ...props
}: RangeSliderProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [isDragging, setIsDragging] = React.useState(false);
  const [activeThumb, setActiveThumb] = React.useState<number | null>(null);

  const currentValue = value ?? internalValue;

  const handleValueChange = (newValue: number[]) => {
    const rangeValue = newValue as [number, number];
    setInternalValue(rangeValue);
    onValueChange?.(rangeValue);
  };

  const handleValueCommit = (newValue: number[]) => {
    onValueCommit?.(newValue as [number, number]);
    setIsDragging(false);
    setActiveThumb(null);
  };

  const handleInputChange = (index: 0 | 1, inputValue: string) => {
    const numValue = Number(inputValue);
    if (isNaN(numValue)) return;

    const newValue = [...currentValue] as [number, number];
    newValue[index] = Math.min(max, Math.max(min, numValue));

    // Ensure min doesn't exceed max
    if (index === 0 && newValue[0] > newValue[1]) {
      newValue[0] = newValue[1];
    }
    if (index === 1 && newValue[1] < newValue[0]) {
      newValue[1] = newValue[0];
    }

    handleValueChange(newValue);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          {showLabels && (
            <span className="text-sm text-muted-foreground">
              {formatValue(currentValue[0])} - {formatValue(currentValue[1])}
            </span>
          )}
        </div>
      )}

      {/* Min/Max labels */}
      {showMinMax && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}

      {/* Slider */}
      <SliderPrimitive.Root
        className={cn(sliderVariants({ size, variant }))}
        value={currentValue}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onPointerDown={() => setIsDragging(true)}
        {...props}
      >
        <SliderPrimitive.Track
          data-track
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
        >
          <SliderPrimitive.Range
            data-range
            className="absolute h-full bg-primary"
          />
        </SliderPrimitive.Track>

        {/* Min thumb */}
        <SliderPrimitive.Thumb
          data-thumb
          className={cn(
            'relative block h-5 w-5 rounded-full border-2 bg-background shadow-md',
            'ring-offset-background transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:bg-accent cursor-grab active:cursor-grabbing'
          )}
          onFocus={() => setActiveThumb(0)}
          onBlur={() => setActiveThumb(null)}
          aria-label={`${minLabel}: ${formatValue(currentValue[0])}`}
        >
          {showTooltip && (
            <SliderTooltip
              value={currentValue[0]}
              formatValue={formatValue}
              visible={isDragging || activeThumb === 0}
            />
          )}
        </SliderPrimitive.Thumb>

        {/* Max thumb */}
        <SliderPrimitive.Thumb
          data-thumb
          className={cn(
            'relative block h-5 w-5 rounded-full border-2 bg-background shadow-md',
            'ring-offset-background transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:bg-accent cursor-grab active:cursor-grabbing'
          )}
          onFocus={() => setActiveThumb(1)}
          onBlur={() => setActiveThumb(null)}
          aria-label={`${maxLabel}: ${formatValue(currentValue[1])}`}
        >
          {showTooltip && (
            <SliderTooltip
              value={currentValue[1]}
              formatValue={formatValue}
              visible={isDragging || activeThumb === 1}
            />
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>

      {/* Input fields */}
      {showInput && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">
              {minLabel}
            </label>
            <input
              type="number"
              min={min}
              max={currentValue[1]}
              step={step}
              value={currentValue[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              disabled={disabled}
              className={cn(
                'h-9 w-full rounded-md border border-input bg-background px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>
          <div className="pt-5 text-muted-foreground">-</div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">
              {maxLabel}
            </label>
            <input
              type="number"
              min={currentValue[0]}
              max={max}
              step={step}
              value={currentValue[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              disabled={disabled}
              className={cn(
                'h-9 w-full rounded-md border border-input bg-background px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Price Range Slider - specialized for currency
interface PriceRangeSliderProps extends Omit<RangeSliderProps, 'formatValue'> {
  currency?: string;
  locale?: string;
}

export function PriceRangeSlider({
  currency = 'USD',
  locale = 'en-US',
  ...props
}: PriceRangeSliderProps) {
  const formatPrice = React.useCallback(
    (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
    [currency, locale]
  );

  return (
    <RangeSlider
      formatValue={formatPrice}
      minLabel="Min Price"
      maxLabel="Max Price"
      {...props}
    />
  );
}

// Percentage Range Slider
export function PercentageRangeSlider(props: Omit<RangeSliderProps, 'formatValue' | 'min' | 'max'>) {
  const formatPercent = (value: number) => `${value}%`;

  return (
    <RangeSlider
      min={0}
      max={100}
      formatValue={formatPercent}
      minLabel="Min %"
      maxLabel="Max %"
      {...props}
    />
  );
}

// Time Range Slider (in minutes)
interface TimeRangeSliderProps extends Omit<RangeSliderProps, 'formatValue' | 'step'> {
  stepMinutes?: number;
}

export function TimeRangeSlider({
  stepMinutes = 30,
  min = 0,
  max = 1440, // 24 hours in minutes
  ...props
}: TimeRangeSliderProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <RangeSlider
      min={min}
      max={max}
      step={stepMinutes}
      formatValue={formatTime}
      minLabel="Start"
      maxLabel="End"
      {...props}
    />
  );
}
```

## Variants

### Size Variants

```tsx
<RangeSlider size="sm" />
<RangeSlider size="md" />
<RangeSlider size="lg" />
```

### Color Variants

```tsx
<RangeSlider variant="default" />
<RangeSlider variant="success" />
<RangeSlider variant="warning" />
<RangeSlider variant="danger" />
```

### With Labels and Tooltip

```tsx
<RangeSlider
  showLabels
  showTooltip
  showMinMax
  label="Price Range"
/>
```

### With Input Fields

```tsx
<RangeSlider
  showInput
  minLabel="Minimum"
  maxLabel="Maximum"
/>
```

## Usage

### Basic Price Filter

```tsx
import { PriceRangeSlider } from '@/components/molecules/range-slider';

export function ProductFilters() {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  return (
    <div className="p-4">
      <PriceRangeSlider
        value={priceRange}
        onValueChange={setPriceRange}
        min={0}
        max={1000}
        step={10}
        showLabels
        showTooltip
        label="Price Range"
      />
    </div>
  );
}
```

### Date/Time Selection

```tsx
import { TimeRangeSlider } from '@/components/molecules/range-slider';

export function AvailabilityPicker() {
  const [timeRange, setTimeRange] = useState<[number, number]>([540, 1020]); // 9 AM - 5 PM

  return (
    <TimeRangeSlider
      value={timeRange}
      onValueChange={setTimeRange}
      stepMinutes={30}
      showLabels
      label="Available Hours"
    />
  );
}
```

### Rating Filter

```tsx
import { RangeSlider } from '@/components/molecules/range-slider';

export function RatingFilter() {
  const [rating, setRating] = useState<[number, number]>([3, 5]);

  return (
    <RangeSlider
      value={rating}
      onValueChange={setRating}
      min={1}
      max={5}
      step={0.5}
      formatValue={(v) => `${v} stars`}
      showLabels
      label="Rating"
    />
  );
}
```

### With Form Integration

```tsx
import { useForm, Controller } from 'react-hook-form';
import { PriceRangeSlider } from '@/components/molecules/range-slider';

interface FilterForm {
  priceRange: [number, number];
}

export function FilterForm() {
  const { control, handleSubmit } = useForm<FilterForm>({
    defaultValues: {
      priceRange: [0, 100],
    },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="priceRange"
        control={control}
        render={({ field }) => (
          <PriceRangeSlider
            value={field.value}
            onValueChange={field.onChange}
            onValueCommit={field.onChange}
            showInput
          />
        )}
      />
      <button type="submit">Apply Filters</button>
    </form>
  );
}
```

## Anti-patterns

```tsx
// Don't set min higher than max
<RangeSlider min={100} max={50} /> // Invalid

// Don't forget to handle the tuple value type
const [value, setValue] = useState(50); // Wrong - should be tuple
<RangeSlider value={value} /> // Type error

// Do use tuple type
const [value, setValue] = useState<[number, number]>([25, 75]);
<RangeSlider value={value} onValueChange={setValue} />

// Don't use without accessible labels
<RangeSlider /> // Missing context

// Do provide labels
<RangeSlider label="Price Range" minLabel="Min Price" maxLabel="Max Price" />
```

## Related Skills

- `atoms/input-number` - Single number input
- `molecules/form-field` - Form field wrapper
- `organisms/filter-panel` - Filter panel with multiple inputs

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with Radix UI Slider
- Added PriceRangeSlider variant
- Added PercentageRangeSlider variant
- Added TimeRangeSlider variant
- Full keyboard navigation support
- Tooltip and label options
