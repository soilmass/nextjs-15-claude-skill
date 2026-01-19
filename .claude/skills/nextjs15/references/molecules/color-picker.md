---
id: m-color-picker
name: Color Picker
version: 2.0.0
layer: L2
category: forms
description: Full-featured color picker with hex, RGB, HSL inputs and visual selection
tags: [color, picker, input, design, theming]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "ColorPicker = Input(a-input-text) + Button(a-input-button)"
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
dependencies:
  react: "^19.0.0"
  "@radix-ui/react-popover": "^1.1.2"
  lucide-react: "^0.460.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Color Picker

## Overview

A comprehensive color picker molecule that provides multiple ways to select colors including a visual gradient picker, hex input, RGB sliders, and preset swatches. Built with Radix Popover for accessibility.

## Composition Diagram

```
+----------------------------------------------------------+
|                      ColorPicker                          |
|  +----------------------------------------------------+  |
|  |  Trigger Button                                     |  |
|  |  +--------+ +----------------------------------+    |  |
|  |  | Color  | |  Input (hex display)             |    |  |
|  |  | Swatch | |  #3B82F6                         |    |  |
|  |  +--------+ +----------------------------------+    |  |
|  +----------------------------------------------------+  |
|                           |                              |
|                           v (popover)                    |
|  +----------------------------------------------------+  |
|  |  +----------------------------------------------+  |  |
|  |  |        Saturation/Brightness Picker          |  |  |
|  |  |                    [o]                        |  |  |
|  |  +----------------------------------------------+  |  |
|  |  +----------------------------------------------+  |  |
|  |  |              Hue Slider                       |  |  |
|  |  +----------------------------------------------+  |  |
|  |  +--------------+ +-----------------------------+  |  |
|  |  | Input (hex)  | | Button (eyedropper)         |  |  |
|  |  | [#3B82F6   ] | | [Pick]                      |  |  |
|  |  +--------------+ +-----------------------------+  |  |
|  |  +----------------------------------------------+  |  |
|  |  |           Preset Color Swatches              |  |  |
|  |  | [R][O][Y][G][B][I][V][P][K][W]              |  |  |
|  |  +----------------------------------------------+  |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

## Implementation

```tsx
// components/molecules/color-picker.tsx
'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';
import { Pipette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorPickerProps extends VariantProps<typeof triggerVariants> {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  presets?: string[];
  showInput?: boolean;
  showPresets?: boolean;
  showEyeDropper?: boolean;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  'aria-label'?: string;
}

// Styles
const triggerVariants = cva(
  'inline-flex items-center gap-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Default preset colors
const DEFAULT_PRESETS = [
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#78716C',
];

// Color conversion utilities
function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

// Saturation/Brightness Picker Component
function SaturationPicker({
  hue,
  saturation,
  brightness,
  onChange,
}: {
  hue: number;
  saturation: number;
  brightness: number;
  onChange: (s: number, b: number) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleMove = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
      
      const s = (x / rect.width) * 100;
      const b = 100 - (y / rect.height) * 100;
      
      onChange(s, b);
    },
    [onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className="relative h-40 w-full cursor-crosshair rounded-lg"
      style={{
        background: `
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, transparent),
          hsl(${hue}, 100%, 50%)
        `,
      }}
      onMouseDown={handleMouseDown}
      role="slider"
      aria-label="Color saturation and brightness"
      aria-valuetext={`Saturation ${Math.round(saturation)}%, Brightness ${Math.round(brightness)}%`}
      tabIndex={0}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 10 : 1;
        switch (e.key) {
          case 'ArrowLeft':
            onChange(Math.max(0, saturation - step), brightness);
            break;
          case 'ArrowRight':
            onChange(Math.min(100, saturation + step), brightness);
            break;
          case 'ArrowUp':
            onChange(saturation, Math.min(100, brightness + step));
            break;
          case 'ArrowDown':
            onChange(saturation, Math.max(0, brightness - step));
            break;
        }
      }}
    >
      <div
        className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
        style={{
          left: `${saturation}%`,
          top: `${100 - brightness}%`,
          backgroundColor: `hsl(${hue}, ${saturation}%, ${brightness / 2}%)`,
        }}
      />
    </div>
  );
}

// Hue Slider Component
function HueSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (hue: number) => void;
}) {
  return (
    <div className="relative">
      <input
        type="range"
        min={0}
        max={360}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, 
            hsl(0, 100%, 50%), 
            hsl(60, 100%, 50%), 
            hsl(120, 100%, 50%), 
            hsl(180, 100%, 50%), 
            hsl(240, 100%, 50%), 
            hsl(300, 100%, 50%), 
            hsl(360, 100%, 50%)
          )`,
        }}
        aria-label="Hue"
      />
    </div>
  );
}

// Alpha Slider Component (optional)
function AlphaSlider({
  color,
  value,
  onChange,
}: {
  color: string;
  value: number;
  onChange: (alpha: number) => void;
}) {
  return (
    <div className="relative">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, transparent, ${color}), 
            repeating-conic-gradient(#808080 0% 25%, white 0% 50%) 50% / 8px 8px`,
        }}
        aria-label="Opacity"
      />
    </div>
  );
}

// Main Color Picker Component
export function ColorPicker({
  value,
  defaultValue = '#3B82F6',
  onChange,
  presets = DEFAULT_PRESETS,
  showInput = true,
  showPresets = true,
  showEyeDropper = true,
  disabled = false,
  placeholder = 'Select color',
  size,
  name,
  'aria-label': ariaLabel,
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [hexInput, setHexInput] = React.useState(defaultValue);
  
  const currentValue = value ?? internalValue;
  
  // Parse current color
  const rgb = hexToRgb(currentValue) ?? { r: 59, g: 130, b: 246 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const [hue, setHue] = React.useState(hsl.h);
  const [saturation, setSaturation] = React.useState(hsl.s);
  const [brightness, setBrightness] = React.useState(hsl.l * 2); // Approximate brightness

  // Update color from HSB
  const updateFromHsb = React.useCallback(
    (h: number, s: number, b: number) => {
      const newRgb = hslToRgb(h, s, b / 2);
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      setHexInput(hex);
      setInternalValue(hex);
      onChange?.(hex);
    },
    [onChange]
  );

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value;
    if (!hex.startsWith('#')) hex = '#' + hex;
    setHexInput(hex);
    
    if (isValidHex(hex)) {
      const newRgb = hexToRgb(hex);
      if (newRgb) {
        const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
        setHue(newHsl.h);
        setSaturation(newHsl.s);
        setBrightness(newHsl.l * 2);
        setInternalValue(hex);
        onChange?.(hex);
      }
    }
  };

  // Handle preset click
  const handlePresetClick = (color: string) => {
    const newRgb = hexToRgb(color);
    if (newRgb) {
      const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
      setHue(newHsl.h);
      setSaturation(newHsl.s);
      setBrightness(newHsl.l * 2);
      setHexInput(color);
      setInternalValue(color);
      onChange?.(color);
    }
  };

  // Eye Dropper API
  const handleEyeDropper = async () => {
    if (!('EyeDropper' in window)) return;
    
    try {
      // @ts-expect-error EyeDropper API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      handlePresetClick(result.sRGBHex);
    } catch {
      // User cancelled or error
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            triggerVariants({ size }),
            'border-input bg-background hover:bg-accent'
          )}
          disabled={disabled}
          aria-label={ariaLabel ?? placeholder}
        >
          <span
            className="h-5 w-5 rounded border border-border"
            style={{ backgroundColor: currentValue }}
          />
          <span className="font-mono text-xs uppercase">{currentValue}</span>
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-lg border bg-popover p-4 shadow-lg"
          sideOffset={4}
          align="start"
        >
          <div className="space-y-4">
            {/* Saturation/Brightness picker */}
            <SaturationPicker
              hue={hue}
              saturation={saturation}
              brightness={brightness}
              onChange={(s, b) => {
                setSaturation(s);
                setBrightness(b);
                updateFromHsb(hue, s, b);
              }}
            />
            
            {/* Hue slider */}
            <HueSlider
              value={hue}
              onChange={(h) => {
                setHue(h);
                updateFromHsb(h, saturation, brightness);
              }}
            />
            
            {/* Hex input and eye dropper */}
            {showInput && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexChange}
                    className={cn(
                      'h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm uppercase',
                      'focus:outline-none focus:ring-2 focus:ring-ring'
                    )}
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
                
                {showEyeDropper && 'EyeDropper' in window && (
                  <button
                    type="button"
                    onClick={handleEyeDropper}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-md border border-input',
                      'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring'
                    )}
                    aria-label="Pick color from screen"
                  >
                    <Pipette className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            
            {/* RGB inputs */}
            <div className="grid grid-cols-3 gap-2">
              {['R', 'G', 'B'].map((channel, i) => {
                const values = [rgb.r, rgb.g, rgb.b];
                return (
                  <div key={channel}>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      {channel}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={values[i]}
                      onChange={(e) => {
                        const newValues = [...values];
                        newValues[i] = Math.min(255, Math.max(0, Number(e.target.value)));
                        const hex = rgbToHex(newValues[0], newValues[1], newValues[2]);
                        handlePresetClick(hex);
                      }}
                      className={cn(
                        'h-8 w-full rounded-md border border-input bg-background px-2 text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-ring'
                      )}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Preset colors */}
            {showPresets && presets.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Presets</p>
                <div className="grid grid-cols-8 gap-1">
                  {presets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handlePresetClick(color)}
                      className={cn(
                        'h-6 w-6 rounded border border-border transition-transform hover:scale-110',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color}`}
                    >
                      {currentValue.toLowerCase() === color.toLowerCase() && (
                        <Check
                          className={cn(
                            'h-4 w-4 mx-auto',
                            parseInt(color.slice(1), 16) > 0x888888
                              ? 'text-black'
                              : 'text-white'
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Hidden input for form submission */}
          {name && <input type="hidden" name={name} value={currentValue} />}
          
          <Popover.Arrow className="fill-popover" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Controlled wrapper for react-hook-form
export function ColorPickerField({
  value,
  onChange,
  ...props
}: Omit<ColorPickerProps, 'value' | 'onChange'> & {
  value?: string;
  onChange?: (value: string) => void;
}) {
  return <ColorPicker value={value} onChange={onChange} {...props} />;
}
```

## Variants

### Size Variants

```tsx
<ColorPicker size="sm" />
<ColorPicker size="md" />
<ColorPicker size="lg" />
```

### Without Presets

```tsx
<ColorPicker showPresets={false} />
```

### Custom Presets

```tsx
<ColorPicker
  presets={['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']}
/>
```

### Simple Mode (No Input)

```tsx
<ColorPicker showInput={false} />
```

## Usage

### Basic Usage

```tsx
import { ColorPicker } from '@/components/molecules/color-picker';

export function ThemeSettings() {
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');

  return (
    <div>
      <label className="text-sm font-medium">Primary Color</label>
      <ColorPicker
        value={primaryColor}
        onChange={setPrimaryColor}
      />
    </div>
  );
}
```

### With React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';
import { ColorPickerField } from '@/components/molecules/color-picker';

interface FormData {
  brandColor: string;
  accentColor: string;
}

export function BrandSettingsForm() {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      brandColor: '#3B82F6',
      accentColor: '#10B981',
    },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="brandColor"
        control={control}
        render={({ field }) => (
          <ColorPickerField
            value={field.value}
            onChange={field.onChange}
            aria-label="Brand color"
          />
        )}
      />
    </form>
  );
}
```

### Brand Color Picker

```tsx
const BRAND_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#84CC16', // Lime
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
];

<ColorPicker
  presets={BRAND_COLORS}
  showEyeDropper={true}
/>
```

## Anti-patterns

```tsx
// Don't use without accessible labels
<ColorPicker /> // Missing aria-label

// Do provide accessible label
<ColorPicker aria-label="Background color" />

// Don't ignore form integration when in forms
<form>
  <ColorPicker value={color} /> // Missing name for form submission
</form>

// Do include name for form submission
<form>
  <ColorPicker value={color} name="backgroundColor" />
</form>
```

## Related Skills

- `atoms/input-color` - Simple native color input
- `molecules/form-field` - Form field wrapper
- `patterns/theming` - Theme customization

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with visual picker
- Added hex, RGB input support
- EyeDropper API integration
- Preset color swatches
- Full keyboard navigation
