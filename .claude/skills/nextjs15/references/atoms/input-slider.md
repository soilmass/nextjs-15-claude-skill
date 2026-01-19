---
id: a-input-slider
name: Slider
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Slider with range, steps, and marks
tags: [input, slider, range, form]
dependencies:
  - "@radix-ui/react-slider@1.2.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Slider

## Overview

The Slider atom provides a range input for selecting numeric values or ranges. Built on Radix UI's Slider primitive with full keyboard and screen reader support.

## When to Use

Use this skill when:
- Selecting a value within a numeric range
- Adjusting settings like volume, brightness
- Filtering by price range (dual thumb)

## Implementation

```typescript
// components/ui/slider.tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {props.defaultValue?.map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        className={cn(
          `block h-5 w-5 rounded-full border-2 border-primary bg-background
           ring-offset-background transition-colors
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
           disabled:pointer-events-none disabled:opacity-50`
        )}
      />
    )) || (
      <SliderPrimitive.Thumb
        className={cn(
          `block h-5 w-5 rounded-full border-2 border-primary bg-background
           ring-offset-background transition-colors
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
           disabled:pointer-events-none disabled:opacity-50`
        )}
      />
    )}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
```

### Slider with Value Display

```typescript
// components/ui/slider-with-value.tsx
"use client";

import * as React from "react";
import { Slider } from "./slider";
import { cn } from "@/lib/utils";

interface SliderWithValueProps
  extends React.ComponentPropsWithoutRef<typeof Slider> {
  formatValue?: (value: number) => string;
  showValue?: boolean;
  label?: string;
}

export function SliderWithValue({
  formatValue = (v) => String(v),
  showValue = true,
  label,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: SliderWithValueProps) {
  const [internalValue, setInternalValue] = React.useState(
    value || defaultValue || [0]
  );

  const handleValueChange = (newValue: number[]) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  const displayValue = value || internalValue;

  return (
    <div className={cn("space-y-3", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium leading-none">{label}</span>
          )}
          {showValue && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {displayValue.map(formatValue).join(" - ")}
            </span>
          )}
        </div>
      )}
      <Slider
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        {...props}
      />
    </div>
  );
}
```

### Slider with Marks

```typescript
// components/ui/slider-with-marks.tsx
"use client";

import * as React from "react";
import { Slider } from "./slider";
import { cn } from "@/lib/utils";

interface Mark {
  value: number;
  label?: string;
}

interface SliderWithMarksProps
  extends React.ComponentPropsWithoutRef<typeof Slider> {
  marks: Mark[];
}

export function SliderWithMarks({
  marks,
  min = 0,
  max = 100,
  className,
  ...props
}: SliderWithMarksProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Slider min={min} max={max} {...props} />
      <div className="relative h-6">
        {marks.map((mark) => {
          const position = ((mark.value - min) / (max - min)) * 100;
          return (
            <div
              key={mark.value}
              className="absolute flex flex-col items-center"
              style={{
                left: `${position}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="h-1.5 w-0.5 bg-muted-foreground/50" />
              {mark.label && (
                <span className="mt-1 text-xs text-muted-foreground">
                  {mark.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Variants

### Single Value

```tsx
<Slider defaultValue={[50]} max={100} step={1} />
```

### Range (Dual Thumb)

```tsx
<Slider defaultValue={[25, 75]} max={100} step={1} />
```

### With Steps

```tsx
<Slider defaultValue={[50]} max={100} step={10} />
```

### Sizes

```tsx
// Small
<Slider className="[&_[data-radix-slider-track]]:h-1 [&_[data-radix-slider-thumb]]:h-4 [&_[data-radix-slider-thumb]]:w-4" />

// Default
<Slider />

// Large
<Slider className="[&_[data-radix-slider-track]]:h-3 [&_[data-radix-slider-thumb]]:h-6 [&_[data-radix-slider-thumb]]:w-6" />
```

## States

| State | Track | Range | Thumb | Animation |
|-------|-------|-------|-------|-----------|
| Default | secondary | primary | border-primary | - |
| Hover | secondary | primary | scale 1.1 | scale |
| Focus | secondary | primary | focus ring | ring fade-in |
| Dragging | secondary | primary | scale 1.1 | - |
| Disabled | muted | muted | opacity 50% | - |

## Accessibility

### Required ARIA Attributes

- `role="slider"`: Applied automatically
- `aria-valuenow`: Current value
- `aria-valuemin`: Minimum value
- `aria-valuemax`: Maximum value
- `aria-orientation`: horizontal/vertical
- `aria-label` or `aria-labelledby`: Required

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus thumb |
| `Arrow Left/Down` | Decrease value by step |
| `Arrow Right/Up` | Increase value by step |
| `Home` | Set to minimum |
| `End` | Set to maximum |
| `Page Down` | Decrease by larger step |
| `Page Up` | Increase by larger step |

### Screen Reader Announcements

- Value is announced on change
- Minimum and maximum are announced

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-slider": "1.2.0"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Slider } from "@/components/ui/slider";

<Slider defaultValue={[50]} max={100} step={1} />
```

### With Label and Value

```tsx
import { SliderWithValue } from "@/components/ui/slider-with-value";

<SliderWithValue
  label="Volume"
  defaultValue={[50]}
  max={100}
  step={1}
  formatValue={(v) => `${v}%`}
/>
```

### Price Range Filter

```tsx
import { SliderWithValue } from "@/components/ui/slider-with-value";

<SliderWithValue
  label="Price Range"
  defaultValue={[0, 500]}
  min={0}
  max={1000}
  step={10}
  formatValue={(v) => `$${v}`}
/>
```

### With Marks

```tsx
import { SliderWithMarks } from "@/components/ui/slider-with-marks";

<SliderWithMarks
  defaultValue={[50]}
  min={0}
  max={100}
  step={25}
  marks={[
    { value: 0, label: "0%" },
    { value: 25, label: "25%" },
    { value: 50, label: "50%" },
    { value: 75, label: "75%" },
    { value: 100, label: "100%" },
  ]}
/>
```

### Controlled

```tsx
const [value, setValue] = useState([50]);

<Slider
  value={value}
  onValueChange={setValue}
  max={100}
  step={1}
  aria-label="Volume"
/>

<p>Current value: {value[0]}</p>
```

### Vertical Orientation

```tsx
<Slider
  orientation="vertical"
  defaultValue={[50]}
  max={100}
  className="h-40"
/>
```

### With Input Sync

```tsx
const [value, setValue] = useState([50]);

<div className="flex items-center gap-4">
  <Slider
    value={value}
    onValueChange={setValue}
    max={100}
    className="flex-1"
  />
  <Input
    type="number"
    value={value[0]}
    onChange={(e) => setValue([Number(e.target.value)])}
    className="w-20"
    min={0}
    max={100}
  />
</div>
```

## Anti-patterns

### Missing aria-label

```tsx
// Bad - no accessible name
<Slider defaultValue={[50]} />

// Good - with aria-label
<Slider defaultValue={[50]} aria-label="Volume" />

// Or with visible label
<SliderWithValue label="Volume" defaultValue={[50]} />
```

### Large Step with Small Range

```tsx
// Bad - step too large for range
<Slider min={0} max={10} step={5} />

// Good - appropriate step size
<Slider min={0} max={10} step={1} />
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Track and thumb colors
- [accessibility](../primitives/accessibility.md) - Focus states

### Composes Into
- [settings-form](../organisms/settings-form.md) - Setting adjustments
- [product-card](../organisms/product-card.md) - Price filtering

### Related
- [input-text](./input-text.md) - For exact numeric input

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix Slider
- Range and single value modes
- Marks support
