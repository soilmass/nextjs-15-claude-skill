---
id: a-input-radio
name: Radio Group
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Radio group with orientation options
tags: [input, radio, form, selection]
dependencies:
  - "@radix-ui/react-radio-group@1.2.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Radio Group

## Overview

The Radio Group atom is built on Radix UI's RadioGroup primitive, providing accessible exclusive selection from a set of options. Supports horizontal and vertical orientations.

## When to Use

Use this skill when:
- Users must select exactly one option from a set
- Options are mutually exclusive
- There are 2-5 options to choose from

## Implementation

```typescript
// components/ui/radio-group.tsx
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    error?: boolean;
  }
>(({ className, error, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        `aspect-square h-4 w-4 rounded-full border text-primary
         ring-offset-background
         focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
         disabled:cursor-not-allowed disabled:opacity-50`,
        error ? "border-destructive" : "border-primary",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
```

### Radio Group with Labels

```typescript
// components/ui/radio-group-field.tsx
import * as React from "react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupFieldProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  className?: string;
}

export function RadioGroupField({
  name,
  label,
  options,
  value,
  onValueChange,
  orientation = "vertical",
  error,
  errorMessage,
  required,
  className,
}: RadioGroupFieldProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className={error ? "text-destructive" : undefined}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <RadioGroup
        name={name}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        className={cn(
          orientation === "horizontal" 
            ? "flex flex-wrap gap-4" 
            : "grid gap-3"
        )}
        aria-required={required}
        aria-invalid={error}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-start gap-3">
            <RadioGroupItem
              value={option.value}
              id={`${name}-${option.value}`}
              disabled={option.disabled}
              error={error}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={`${name}-${option.value}`}
                className={cn(
                  "cursor-pointer",
                  option.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
```

## Variants

### Orientations

```tsx
// Vertical (default)
<RadioGroup orientation="vertical">
  <RadioGroupItem value="1" />
  <RadioGroupItem value="2" />
</RadioGroup>

// Horizontal
<RadioGroup orientation="horizontal" className="flex gap-4">
  <RadioGroupItem value="1" />
  <RadioGroupItem value="2" />
</RadioGroup>
```

### Sizes (via className)

```tsx
// Small
<RadioGroupItem className="h-3 w-3" />

// Default
<RadioGroupItem className="h-4 w-4" />

// Large
<RadioGroupItem className="h-5 w-5" />
```

## States

| State | Border | Background | Indicator | Animation |
|-------|--------|------------|-----------|-----------|
| Unchecked | primary | transparent | none | - |
| Hover | primary (darker) | transparent | none | - |
| Focus | primary + ring | transparent | none | ring fade-in |
| Checked | primary | transparent | filled circle | scale-in |
| Disabled | muted | transparent | none/circle | - |
| Error | destructive | transparent | none | - |

## Accessibility

### Required ARIA Attributes

- `role="radiogroup"`: Applied automatically by Radix
- `aria-checked`: Managed by Radix for each item
- `aria-required`: When selection is required
- `aria-invalid`: When there's a validation error

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus the radio group |
| `Arrow Down/Right` | Focus and select next option |
| `Arrow Up/Left` | Focus and select previous option |
| `Space` | Select focused option |

### Screen Reader Announcements

- Group label is announced
- Each option's label is announced
- Selection state is announced

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-radio-group": "1.2.0",
    "lucide-react": "0.460.0"
  }
}
```

## Examples

### Basic Usage

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

<RadioGroup defaultValue="option-1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="option-2" />
    <Label htmlFor="option-2">Option 2</Label>
  </div>
</RadioGroup>
```

### With RadioGroupField

```tsx
import { RadioGroupField } from "@/components/ui/radio-group-field";

<RadioGroupField
  name="plan"
  label="Select a plan"
  options={[
    { value: "free", label: "Free", description: "Up to 10 projects" },
    { value: "pro", label: "Pro", description: "Unlimited projects" },
    { value: "team", label: "Team", description: "Collaboration features" },
  ]}
  value={selectedPlan}
  onValueChange={setSelectedPlan}
/>
```

### Horizontal Layout

```tsx
<RadioGroupField
  name="size"
  label="Size"
  orientation="horizontal"
  options={[
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ]}
/>
```

### Controlled

```tsx
const [value, setValue] = useState("option-1");

<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>
```

### With react-hook-form

```tsx
import { useForm, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function PlanForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: { plan: "free" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="plan"
        control={control}
        rules={{ required: "Please select a plan" }}
        render={({ field, fieldState }) => (
          <RadioGroupField
            name="plan"
            label="Choose a plan"
            options={plans}
            value={field.value}
            onValueChange={field.onChange}
            error={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </form>
  );
}
```

## Anti-patterns

### Radio Without Group

```tsx
// Bad - standalone radio
<RadioGroupItem value="option" />

// Good - always in RadioGroup
<RadioGroup>
  <RadioGroupItem value="option" />
</RadioGroup>
```

### Too Many Options

```tsx
// Bad - too many options for radio
<RadioGroup>
  {/* 10+ options */}
</RadioGroup>

// Good - use Select for many options
<Select>
  <SelectTrigger />
  <SelectContent>
    {/* Many options */}
  </SelectContent>
</Select>
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Radio colors
- [accessibility](../primitives/accessibility.md) - Keyboard navigation

### Composes Into
- [form-field](../molecules/form-field.md) - Form integration
- [settings-form](../organisms/settings-form.md) - Settings options

### Related
- [input-checkbox](./input-checkbox.md) - For multiple selection
- [input-select](./input-select.md) - For many options

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix RadioGroup
- Orientation and field variants
