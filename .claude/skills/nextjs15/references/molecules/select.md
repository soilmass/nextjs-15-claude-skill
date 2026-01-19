---
id: m-select
name: Select
version: 2.0.0
layer: L2
category: forms
description: Dropdown select input component with search, groups, and multi-select
tags: [select, dropdown, input, form, options, picker]
formula: "Select = Trigger(a-input-select) + Content(a-interactive-popover) + Options(a-display-text)"
composes:
  - ../atoms/input-select.md
  - ../atoms/interactive-popover.md
  - ../atoms/display-text.md
  - ../atoms/display-icon.md
dependencies:
  "@radix-ui/react-select": "^2.1.2"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Select

## Overview

The Select molecule provides a dropdown input for selecting from a list of options. Supports single and multi-select modes, searchable options, grouped items, and customizable rendering.

## When to Use

Use this skill when:
- User needs to choose from a predefined list
- Too many options for radio buttons
- Need searchable option lists
- Building form inputs with dropdown selection

## Composition Diagram

```
+-----------------------------------------------+
|                    Select                      |
+-----------------------------------------------+
|                                               |
| +-------------------------------------------+ |
| |  Trigger Button (a-input-select)          | |
| |  [ Selected Value          v ]            | |
| +-------------------------------------------+ |
|                                               |
| +-------------------------------------------+ |
| |  Dropdown Content (a-interactive-popover)  | |
| | +---------------------------------------+ | |
| | |  Search Input (optional)              | | |
| | |  [Search options...]                  | | |
| | +---------------------------------------+ | |
| | +---------------------------------------+ | |
| | |  Option Group (optional)              | | |
| | |  "Fruits"                             | | |
| | +---------------------------------------+ | |
| | |  Option 1 - "Apple"        [check]    | | |
| | |  Option 2 - "Banana"                  | | |
| | |  Option 3 - "Cherry"                  | | |
| | +---------------------------------------+ | |
| +-------------------------------------------+ |
+-----------------------------------------------+
```

## Atoms Used

- [input-select](../atoms/input-select.md) - Select trigger
- [interactive-popover](../atoms/interactive-popover.md) - Dropdown container
- [display-text](../atoms/display-text.md) - Option labels
- [display-icon](../atoms/display-icon.md) - Check marks, chevrons

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
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
      "placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-destructive focus:ring-destructive",
      "[&>span]:line-clamp-1",
      className
    )}
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
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
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

### Basic Select

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="cherry">Cherry</SelectItem>
  </SelectContent>
</Select>
```

### With Groups

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a food" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Vegetables</SelectLabel>
      <SelectItem value="carrot">Carrot</SelectItem>
      <SelectItem value="broccoli">Broccoli</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

### With Error State

```tsx
<Select>
  <SelectTrigger error>
    <SelectValue placeholder="Required field" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Disabled Options

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="available">Available</SelectItem>
    <SelectItem value="unavailable" disabled>
      Unavailable
    </SelectItem>
  </SelectContent>
</Select>
```

## States

| State | Trigger | Content | Options |
|-------|---------|---------|---------|
| Default | border-input | hidden | - |
| Open | ring-2 | visible | normal |
| Focused | ring-2 | - | highlighted |
| Disabled | opacity-50 | - | - |
| Error | border-destructive | - | - |
| Selected | shows value | - | checkmark |

## Accessibility

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Space/Enter` | Open dropdown |
| `Arrow Down` | Move to next option |
| `Arrow Up` | Move to previous option |
| `Home` | Move to first option |
| `End` | Move to last option |
| `Escape` | Close dropdown |
| `Type letter` | Jump to matching option |

### Screen Reader Announcements

- Selected value announced
- Options count and position
- Group labels announced

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-select": "^2.1.2",
    "lucide-react": "^0.460.0"
  }
}
```

## Examples

### Country Selector

```tsx
function CountrySelect({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
          <SelectItem value="mx">Mexico</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="de">Germany</SelectItem>
          <SelectItem value="fr">France</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
```

### Form Integration

```tsx
function FormSelect({ field, error }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Category</label>
      <Select value={field.value} onValueChange={field.onChange}>
        <SelectTrigger error={!!error}>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}
```

## Anti-patterns

### Too Many Options Without Search

```tsx
// Bad - hard to navigate
<SelectContent>
  {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
</SelectContent>

// Good - use Combobox for searchable lists
<Combobox options={countries} searchable />
```

### Missing Placeholder

```tsx
// Bad - no initial context
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
- [atoms/input-select](../atoms/input-select.md) - Base select

### Composes Into
- [molecules/form-field](./form-field.md) - Form integration
- [organisms/filter-bar](../organisms/filter-bar.md) - Filtering

### Alternatives
- [molecules/combobox](./combobox.md) - For searchable/creatable lists

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Radix UI Select integration
- Groups and separators
- Error state support
