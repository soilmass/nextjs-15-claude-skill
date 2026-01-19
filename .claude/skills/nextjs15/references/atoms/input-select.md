---
id: a-input-select
name: Select
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Select with groups, search, and portal
tags: [input, select, dropdown, form]
dependencies:
  - "@radix-ui/react-select@2.1.0"
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Select

## Overview

The Select atom is built on Radix UI's Select primitive, providing an accessible dropdown selection with support for option groups, scrolling, and portal rendering to escape container overflow.

## When to Use

Use this skill when:
- Users need to select one option from 5+ choices
- Options need grouping
- Native select styling doesn't meet design requirements

## Implementation

```typescript
// components/ui/select.tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    error?: boolean;
  }
>(({ className, children, error, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      `flex h-10 w-full items-center justify-between rounded-md border bg-background
       px-3 py-2 text-sm ring-offset-background
       placeholder:text-muted-foreground
       focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
       disabled:cursor-not-allowed disabled:opacity-50
       [&>span]:line-clamp-1`,
      error ? "border-destructive" : "border-input",
      className
    )}
    aria-invalid={error || undefined}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        `relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border
         bg-popover text-popover-foreground shadow-md
         data-[state=open]:animate-in data-[state=closed]:animate-out
         data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
         data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
         data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
         data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      `relative flex w-full cursor-default select-none items-center rounded-sm
       py-1.5 pl-8 pr-2 text-sm outline-none
       focus:bg-accent focus:text-accent-foreground
       data-[disabled]:pointer-events-none data-[disabled]:opacity-50`,
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
```

## Variants

### Sizes (via className)

```tsx
// Small
<SelectTrigger className="h-9 text-xs" />

// Default
<SelectTrigger className="h-10" />

// Large
<SelectTrigger className="h-11 text-base" />
```

## States

| State | Border | Background | Icon | Animation |
|-------|--------|------------|------|-----------|
| Default | input | background | chevron-down | - |
| Hover | input (darker) | background | chevron-down | - |
| Focus | ring | background | chevron-down | ring fade-in |
| Open | ring | background | chevron-down | content zoom-in |
| Disabled | muted | muted | chevron-down | - |
| Error | destructive | background | chevron-down | - |

## Accessibility

### Required ARIA Attributes

- `role="combobox"`: Applied automatically
- `aria-expanded`: Managed by Radix
- `aria-haspopup="listbox"`: Applied automatically
- `aria-activedescendant`: Tracks focused option

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus trigger |
| `Space/Enter` | Open/close dropdown |
| `Arrow Down/Up` | Navigate options |
| `Home/End` | First/last option |
| `Type characters` | Jump to matching option |
| `Escape` | Close dropdown |

### Screen Reader Announcements

- Selected value is announced
- Options are announced when focused
- State changes (open/closed) are announced

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-select": "2.1.0",
    "lucide-react": "0.460.0"
  }
}
```

## Examples

### Basic Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

### With Groups

```tsx
<Select>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Select timezone" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>North America</SelectLabel>
      <SelectItem value="est">Eastern (EST)</SelectItem>
      <SelectItem value="cst">Central (CST)</SelectItem>
      <SelectItem value="pst">Pacific (PST)</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Europe</SelectLabel>
      <SelectItem value="gmt">GMT</SelectItem>
      <SelectItem value="cet">Central European (CET)</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

### With Label

```tsx
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="country">Country</Label>
  <Select>
    <SelectTrigger id="country">
      <SelectValue placeholder="Select country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="us">United States</SelectItem>
      <SelectItem value="uk">United Kingdom</SelectItem>
      <SelectItem value="ca">Canada</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Controlled

```tsx
const [value, setValue] = useState("");

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### With Error

```tsx
<div className="space-y-2">
  <Label htmlFor="category">Category</Label>
  <Select>
    <SelectTrigger id="category" error={!!errors.category}>
      <SelectValue placeholder="Select category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="tech">Technology</SelectItem>
      <SelectItem value="design">Design</SelectItem>
    </SelectContent>
  </Select>
  {errors.category && (
    <p className="text-sm text-destructive">{errors.category.message}</p>
  )}
</div>
```

### With react-hook-form

```tsx
import { Controller, useForm } from "react-hook-form";

function CategoryForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="category"
        control={control}
        rules={{ required: "Please select a category" }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger error={!!fieldState.error}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </form>
  );
}
```

## Anti-patterns

### Too Few Options

```tsx
// Bad - use radio for 2-3 options
<Select>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="yes">Yes</SelectItem>
    <SelectItem value="no">No</SelectItem>
  </SelectContent>
</Select>

// Good - use radio group
<RadioGroup>
  <RadioGroupItem value="yes" />
  <RadioGroupItem value="no" />
</RadioGroup>
```

### Missing Placeholder

```tsx
// Bad - no indication of what to select
<SelectTrigger>
  <SelectValue />
</SelectTrigger>

// Good - clear placeholder
<SelectTrigger>
  <SelectValue placeholder="Select an option" />
</SelectTrigger>
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Select colors
- [z-index](../primitives/z-index.md) - Dropdown layering

### Composes Into
- [form-field](../molecules/form-field.md) - Form integration
- [combobox](../molecules/combobox.md) - Searchable select

### Related
- [input-radio](./input-radio.md) - For fewer options
- [combobox](../molecules/combobox.md) - For searchable selection

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix Select
- Groups, search, and portal support
