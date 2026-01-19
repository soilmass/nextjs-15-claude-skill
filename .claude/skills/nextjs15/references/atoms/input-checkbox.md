---
id: a-input-checkbox
name: Checkbox
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Checkbox with indeterminate and error states
tags: [input, checkbox, form, boolean]
dependencies:
  - "@radix-ui/react-checkbox@1.1.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Checkbox

## Overview

The Checkbox atom is built on Radix UI's Checkbox primitive, providing accessible boolean input with support for indeterminate state (for "select all" patterns) and error states.

## When to Use

Use this skill when:
- Creating boolean form fields (agree to terms, opt-in)
- Building multi-select lists with checkboxes
- Implementing "select all" with indeterminate state

## Implementation

```typescript
// components/ui/checkbox.tsx
"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    error?: boolean;
  }
>(({ className, error, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      `peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
       disabled:cursor-not-allowed disabled:opacity-50
       data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
       data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground`,
      error
        ? "border-destructive focus-visible:ring-destructive"
        : "border-primary",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      {props.checked === "indeterminate" ? (
        <Minus className="h-3 w-3" />
      ) : (
        <Check className="h-3 w-3" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
```

### Checkbox with Label

```typescript
// components/ui/checkbox-field.tsx
import * as React from "react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface CheckboxFieldProps {
  id: string;
  label: React.ReactNode;
  description?: string;
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  error,
  errorMessage,
  disabled,
  className,
}: CheckboxFieldProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        error={error}
        aria-describedby={
          description || errorMessage
            ? `${id}-description`
            : undefined
        }
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={id}
          className={cn(
            "cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label}
        </Label>
        {description && (
          <p
            id={`${id}-description`}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
```

## Variants

### Sizes (via className)

```tsx
// Small
<Checkbox className="h-3 w-3" />

// Default
<Checkbox className="h-4 w-4" />

// Large
<Checkbox className="h-5 w-5" />
```

## States

| State | Border | Background | Icon | Animation |
|-------|--------|------------|------|-----------|
| Unchecked | primary | transparent | none | - |
| Hover | primary (darker) | transparent | none | - |
| Focus | primary + ring | transparent | none | ring fade-in |
| Checked | primary | primary | Check | scale-in |
| Indeterminate | primary | primary | Minus | scale-in |
| Disabled | muted | transparent/primary | none/check | - |
| Error | destructive | transparent | none | - |

## Accessibility

### Required ARIA Attributes

- `aria-checked`: "true", "false", or "mixed" (handled by Radix)
- `aria-describedby`: Link to description/error
- `aria-required`: When field is required

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus the checkbox |
| `Space` | Toggle checked state |

### Screen Reader Announcements

- State changes are announced automatically
- Indeterminate is announced as "mixed"

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-checkbox": "1.1.0",
    "lucide-react": "0.460.0"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<Checkbox id="terms" />
```

### With Label

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

### With Description

```tsx
import { CheckboxField } from "@/components/ui/checkbox-field";

<CheckboxField
  id="marketing"
  label="Marketing emails"
  description="Receive emails about new products, features, and more."
/>
```

### Controlled

```tsx
const [checked, setChecked] = useState(false);

<Checkbox
  id="newsletter"
  checked={checked}
  onCheckedChange={setChecked}
/>
```

### Indeterminate (Select All)

```tsx
const [items, setItems] = useState([
  { id: 1, label: "Item 1", checked: false },
  { id: 2, label: "Item 2", checked: true },
  { id: 3, label: "Item 3", checked: false },
]);

const allChecked = items.every(item => item.checked);
const someChecked = items.some(item => item.checked);

<div className="space-y-3">
  <div className="flex items-center space-x-2">
    <Checkbox
      id="select-all"
      checked={allChecked ? true : someChecked ? "indeterminate" : false}
      onCheckedChange={(checked) => {
        setItems(items.map(item => ({ ...item, checked: !!checked })));
      }}
    />
    <Label htmlFor="select-all">Select all</Label>
  </div>
  
  <div className="ml-6 space-y-2">
    {items.map(item => (
      <div key={item.id} className="flex items-center space-x-2">
        <Checkbox
          id={`item-${item.id}`}
          checked={item.checked}
          onCheckedChange={(checked) => {
            setItems(items.map(i => 
              i.id === item.id ? { ...i, checked: !!checked } : i
            ));
          }}
        />
        <Label htmlFor={`item-${item.id}`}>{item.label}</Label>
      </div>
    ))}
  </div>
</div>
```

### With Error

```tsx
<CheckboxField
  id="terms"
  label="I agree to the terms of service"
  error={true}
  errorMessage="You must agree to continue"
/>
```

### In Form with react-hook-form

```tsx
import { useForm, Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

function TermsForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="terms"
        control={control}
        rules={{ required: "You must accept the terms" }}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={field.value}
              onCheckedChange={field.onChange}
              error={!!errors.terms}
            />
            <Label htmlFor="terms">Accept terms</Label>
          </div>
        )}
      />
      {errors.terms && (
        <p className="text-sm text-destructive mt-1">
          {errors.terms.message}
        </p>
      )}
    </form>
  );
}
```

## Anti-patterns

### Checkbox Without Label

```tsx
// Bad - no accessible label
<Checkbox />

// Good - with label
<div className="flex items-center gap-2">
  <Checkbox id="agree" />
  <Label htmlFor="agree">I agree</Label>
</div>

// Or with aria-label
<Checkbox aria-label="Select row" />
```

### Using for Exclusive Options

```tsx
// Bad - checkboxes for exclusive options
<Checkbox id="option-a" /> Option A
<Checkbox id="option-b" /> Option B

// Good - use radio group for exclusive options
<RadioGroup>
  <RadioGroupItem value="a" id="option-a" />
  <RadioGroupItem value="b" id="option-b" />
</RadioGroup>
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Checkbox colors
- [accessibility](../primitives/accessibility.md) - Focus states

### Composes Into
- [form-field](../molecules/form-field.md) - Form integration
- [data-table](../organisms/data-table.md) - Row selection

### Related
- [input-radio](./input-radio.md) - For exclusive selection
- [input-switch](./input-switch.md) - For on/off toggles

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix Checkbox
- Indeterminate and error states
