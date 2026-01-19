---
id: a-input-number
name: Number Input
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Number input with increment/decrement buttons and keyboard controls
tags: [input, number, stepper, counter, quantity, form]
performance:
  impact: low
  lcp: neutral
  cls: neutral
dependencies:
  - react
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Number Input

## Overview

A numeric input field with optional increment/decrement buttons, min/max constraints, step values, and keyboard support. Commonly used for quantities, counters, and numeric settings.

## Implementation

```tsx
// components/ui/number-input.tsx
'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Current value */
  value?: number;
  /** Default value for uncontrolled */
  defaultValue?: number;
  /** Change handler */
  onChange?: (value: number) => void;
  /** Show increment/decrement buttons */
  showButtons?: boolean;
  /** Button position */
  buttonPosition?: 'sides' | 'right' | 'stacked';
  /** Format display value */
  formatValue?: (value: number) => string;
  /** Parse input value */
  parseValue?: (value: string) => number;
  /** Allow decimal values */
  allowDecimal?: boolean;
  /** Decimal places */
  decimalPlaces?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      min = -Infinity,
      max = Infinity,
      step = 1,
      value: controlledValue,
      defaultValue = 0,
      onChange,
      showButtons = true,
      buttonPosition = 'sides',
      formatValue,
      parseValue,
      allowDecimal = false,
      decimalPlaces = 2,
      size = 'md',
      error = false,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [inputValue, setInputValue] = React.useState(String(defaultValue));
    
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    // Sync input display value with actual value
    React.useEffect(() => {
      const displayValue = formatValue ? formatValue(value) : String(value);
      setInputValue(displayValue);
    }, [value, formatValue]);

    const clamp = (val: number): number => {
      return Math.min(Math.max(val, min), max);
    };

    const roundToStep = (val: number): number => {
      if (allowDecimal) {
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(val * factor) / factor;
      }
      return Math.round(val / step) * step;
    };

    const updateValue = (newValue: number) => {
      const clampedValue = clamp(roundToStep(newValue));
      
      if (!isControlled) {
        setInternalValue(clampedValue);
      }
      onChange?.(clampedValue);
    };

    const increment = () => {
      if (disabled) return;
      updateValue(value + step);
    };

    const decrement = () => {
      if (disabled) return;
      updateValue(value - step);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setInputValue(rawValue);

      // Allow empty input during typing
      if (rawValue === '' || rawValue === '-') {
        return;
      }

      const parsed = parseValue 
        ? parseValue(rawValue) 
        : allowDecimal 
          ? parseFloat(rawValue) 
          : parseInt(rawValue, 10);

      if (!isNaN(parsed)) {
        updateValue(parsed);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Ensure valid value on blur
      const displayValue = formatValue ? formatValue(value) : String(value);
      setInputValue(displayValue);
      props.onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        increment();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        decrement();
      }
      props.onKeyDown?.(e);
    };

    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-base',
      lg: 'h-12 text-lg',
    };

    const buttonSizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    const iconSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const canDecrement = value > min;
    const canIncrement = value < max;

    const DecrementButton = (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          buttonSizeClasses[size],
          'shrink-0',
          buttonPosition === 'stacked' && 'h-1/2 rounded-none first:rounded-t-md'
        )}
        disabled={disabled || !canDecrement}
        onClick={decrement}
        tabIndex={-1}
        aria-label="Decrease value"
      >
        <Minus className={iconSizes[size]} />
      </Button>
    );

    const IncrementButton = (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          buttonSizeClasses[size],
          'shrink-0',
          buttonPosition === 'stacked' && 'h-1/2 rounded-none last:rounded-b-md'
        )}
        disabled={disabled || !canIncrement}
        onClick={increment}
        tabIndex={-1}
        aria-label="Increase value"
      >
        <Plus className={iconSizes[size]} />
      </Button>
    );

    const inputElement = (
      <input
        ref={ref}
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        pattern={allowDecimal ? '[0-9]*\\.?[0-9]*' : '[0-9]*'}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-valuemin={min !== -Infinity ? min : undefined}
        aria-valuemax={max !== Infinity ? max : undefined}
        aria-valuenow={value}
        className={cn(
          'flex w-full rounded-md border border-input bg-background px-3 text-center font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          sizeClasses[size],
          error && 'border-destructive focus-visible:ring-destructive',
          buttonPosition === 'sides' && 'rounded-none border-x-0',
          buttonPosition === 'right' && 'rounded-r-none text-left',
          buttonPosition === 'stacked' && 'rounded-r-none',
          className
        )}
        {...props}
      />
    );

    if (!showButtons) {
      return (
        <input
          ref={ref}
          type="text"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          pattern={allowDecimal ? '[0-9]*\\.?[0-9]*' : '[0-9]*'}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'flex w-full rounded-md border border-input bg-background px-3',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            sizeClasses[size],
            error && 'border-destructive',
            className
          )}
          {...props}
        />
      );
    }

    if (buttonPosition === 'sides') {
      return (
        <div className="flex">
          {DecrementButton}
          {inputElement}
          {IncrementButton}
        </div>
      );
    }

    if (buttonPosition === 'right') {
      return (
        <div className="flex">
          {inputElement}
          <div className="flex">
            {DecrementButton}
            {IncrementButton}
          </div>
        </div>
      );
    }

    // Stacked position
    return (
      <div className="flex">
        {inputElement}
        <div className="flex flex-col">
          {IncrementButton}
          {DecrementButton}
        </div>
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };
```

## Variants

### Quantity Selector

```tsx
function QuantitySelector({
  value,
  onChange,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <NumberInput
      value={value}
      onChange={onChange}
      min={1}
      max={max}
      step={1}
      buttonPosition="sides"
      size="sm"
      className="w-20"
    />
  );
}
```

### Currency Input

```tsx
function CurrencyInput({
  value,
  onChange,
  currency = 'USD',
}: {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
}) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const parseCurrency = (val: string) => {
    return parseFloat(val.replace(/[^0-9.-]/g, ''));
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        $
      </span>
      <NumberInput
        value={value}
        onChange={onChange}
        min={0}
        step={0.01}
        allowDecimal
        decimalPlaces={2}
        formatValue={formatCurrency}
        parseValue={parseCurrency}
        showButtons={false}
        className="pl-7"
      />
    </div>
  );
}
```

### Percentage Input

```tsx
function PercentageInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="relative">
      <NumberInput
        value={value}
        onChange={onChange}
        min={0}
        max={100}
        step={1}
        showButtons={false}
        className="pr-8"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        %
      </span>
    </div>
  );
}
```

## Usage

```tsx
import { NumberInput } from '@/components/ui/number-input';

// Basic usage
<NumberInput
  value={quantity}
  onChange={setQuantity}
  min={0}
  max={100}
/>

// With step
<NumberInput
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  step={5}
/>

// Decimal values
<NumberInput
  value={price}
  onChange={setPrice}
  min={0}
  allowDecimal
  decimalPlaces={2}
/>

// Without buttons
<NumberInput
  value={age}
  onChange={setAge}
  min={0}
  max={150}
  showButtons={false}
/>

// Form integration
<form>
  <label>
    Quantity
    <NumberInput
      name="quantity"
      value={formData.quantity}
      onChange={(val) => setFormData({ ...formData, quantity: val })}
      min={1}
      required
    />
  </label>
</form>
```

## Accessibility

- Uses `aria-valuemin`, `aria-valuemax`, `aria-valuenow` for range communication
- Arrow keys increment/decrement value
- Buttons have proper `aria-label`
- Supports keyboard-only operation
- Input mode hints mobile keyboards

## Related Skills

- [input-text](./input-text.md) - Base text input
- [input-slider](./input-slider.md) - Slider alternative
- [form-field](../molecules/form-field.md) - Form field wrapper

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Multiple button positions
- Decimal support
- Format/parse functions
