---
id: a-input-color
name: Color Input
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Color picker input with swatch preview and hex/RGB support
tags: [input, color, picker, swatch, hex, rgb, form]
performance:
  impact: low
  lcp: neutral
  cls: neutral
dependencies:
  - react
  - react-colorful
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Color Input

## Overview

A color picker input that displays a color swatch and allows color selection via native picker or custom popover. Supports hex, RGB, and HSL formats with optional alpha channel.

## Implementation

```tsx
// components/ui/color-input.tsx
'use client';

import * as React from 'react';
import { HexColorPicker, HexAlphaColorPicker } from 'react-colorful';
import { Paintbrush } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export interface ColorInputProps {
  /** Current color value (hex format) */
  value?: string;
  /** Default color for uncontrolled mode */
  defaultValue?: string;
  /** Change handler */
  onChange?: (color: string) => void;
  /** Enable alpha channel */
  enableAlpha?: boolean;
  /** Show text input for hex value */
  showInput?: boolean;
  /** Preset colors to show */
  presets?: string[];
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
}

const defaultPresets = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

const ColorInput = React.forwardRef<HTMLButtonElement, ColorInputProps>(
  (
    {
      value: controlledValue,
      defaultValue = '#000000',
      onChange,
      enableAlpha = false,
      showInput = true,
      presets = defaultPresets,
      disabled = false,
      size = 'md',
      className,
      placeholder = 'Pick a color',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [inputValue, setInputValue] = React.useState(defaultValue);
    const [open, setOpen] = React.useState(false);

    const isControlled = controlledValue !== undefined;
    const color = isControlled ? controlledValue : internalValue;

    React.useEffect(() => {
      setInputValue(color);
    }, [color]);

    const updateColor = (newColor: string) => {
      if (!isControlled) {
        setInternalValue(newColor);
      }
      setInputValue(newColor);
      onChange?.(newColor);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      
      // Validate hex color
      if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value)) {
        updateColor(value);
      }
    };

    const handleInputBlur = () => {
      // Reset to valid color if input is invalid
      if (!/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(inputValue)) {
        setInputValue(color);
      }
    };

    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    const Picker = enableAlpha ? HexAlphaColorPicker : HexColorPicker;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-3',
              size === 'sm' && 'h-8 text-sm',
              size === 'md' && 'h-10',
              size === 'lg' && 'h-12 text-lg',
              className
            )}
          >
            <div
              className={cn(
                'rounded-sm border',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-5 w-5',
                size === 'lg' && 'h-6 w-6'
              )}
              style={{ backgroundColor: color }}
            />
            <span className="flex-1 text-left font-mono text-sm">
              {color || placeholder}
            </span>
            <Paintbrush className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            {/* Color picker */}
            <Picker
              color={color}
              onChange={updateColor}
              className="!w-full"
            />

            {/* Hex input */}
            {showInput && (
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 shrink-0 rounded-md border"
                  style={{ backgroundColor: color }}
                />
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="h-8 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            )}

            {/* Preset colors */}
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={cn(
                      'h-6 w-6 rounded-md border transition-transform hover:scale-110',
                      color === preset && 'ring-2 ring-primary ring-offset-2'
                    )}
                    style={{ backgroundColor: preset }}
                    onClick={() => updateColor(preset)}
                    title={preset}
                  />
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
ColorInput.displayName = 'ColorInput';

export { ColorInput };
```

## Variants

### Simple Swatch Input

```tsx
// Simple native color input with swatch
function ColorSwatch({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 cursor-pointer rounded-md border-0 p-0"
      />
    </div>
  );
}
```

### Color Input with Label

```tsx
function LabeledColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <ColorInput value={value} onChange={onChange} />
    </div>
  );
}
```

### RGB Input

```tsx
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex({ r, g, b }: RGBColor): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function RGBColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const rgb = hexToRgb(value);

  const handleChange = (channel: keyof RGBColor, val: number) => {
    const newRgb = { ...rgb, [channel]: val };
    onChange(rgbToHex(newRgb));
  };

  return (
    <div className="space-y-3">
      <div
        className="h-12 w-full rounded-md border"
        style={{ backgroundColor: value }}
      />
      
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">R</Label>
          <Input
            type="number"
            min={0}
            max={255}
            value={rgb.r}
            onChange={(e) => handleChange('r', parseInt(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">G</Label>
          <Input
            type="number"
            min={0}
            max={255}
            value={rgb.g}
            onChange={(e) => handleChange('g', parseInt(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">B</Label>
          <Input
            type="number"
            min={0}
            max={255}
            value={rgb.b}
            onChange={(e) => handleChange('b', parseInt(e.target.value) || 0)}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}
```

### Gradient Picker

```tsx
function GradientPicker({
  value,
  onChange,
}: {
  value: { start: string; end: string; angle: number };
  onChange: (value: { start: string; end: string; angle: number }) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        className="h-16 w-full rounded-md border"
        style={{
          background: `linear-gradient(${value.angle}deg, ${value.start}, ${value.end})`,
        }}
      />

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Color</label>
          <ColorInput
            value={value.start}
            onChange={(start) => onChange({ ...value, start })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End Color</label>
          <ColorInput
            value={value.end}
            onChange={(end) => onChange({ ...value, end })}
          />
        </div>
      </div>

      {/* Angle */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Angle: {value.angle}°</label>
        <input
          type="range"
          min={0}
          max={360}
          value={value.angle}
          onChange={(e) => onChange({ ...value, angle: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
```

## Dependencies

```bash
npm install react-colorful
```

## Usage

```tsx
import { ColorInput } from '@/components/ui/color-input';

// Basic usage
<ColorInput
  value={color}
  onChange={setColor}
/>

// With alpha channel
<ColorInput
  value={color}
  onChange={setColor}
  enableAlpha
/>

// Custom presets
<ColorInput
  value={color}
  onChange={setColor}
  presets={['#ff0000', '#00ff00', '#0000ff']}
/>

// Without input field
<ColorInput
  value={color}
  onChange={setColor}
  showInput={false}
/>

// Different sizes
<ColorInput value={color} onChange={setColor} size="sm" />
<ColorInput value={color} onChange={setColor} size="md" />
<ColorInput value={color} onChange={setColor} size="lg" />
```

## Accessibility

- Keyboard navigable popover
- Swatch has visible focus ring
- Preset buttons have title for screen readers
- Input validates hex format

## Related Skills

- [input-text](./input-text.md) - Base text input
- [color-picker](../molecules/color-picker.md) - Full color picker molecule
- [form-field](../molecules/form-field.md) - Form field wrapper

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Hex and alpha support
- Preset colors
- RGB variant
