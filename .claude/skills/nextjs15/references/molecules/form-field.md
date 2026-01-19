---
id: m-form-field
name: Form Field
version: 2.0.0
layer: L2
category: forms
description: Complete form field with label, input, description, and error handling
tags: [form, field, label, input, validation, error]
formula: "FormField = Label(a-display-text) + Input(a-input-text) + Error(a-feedback-alert)"
composes:
  - ../atoms/display-text.md
  - ../atoms/input-text.md
  - ../atoms/feedback-alert.md
dependencies:
  react: "^19.0.0"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Form Field

## Overview

The Form Field molecule combines a label, input, description text, and error message into a cohesive form control. Handles proper ARIA associations between elements and provides consistent error state styling.

## When to Use

Use this skill when:
- Building forms with labeled inputs
- Need consistent error and description handling
- Want proper accessibility associations
- Creating reusable form patterns

## Composition Diagram

```
┌─────────────────────────────────────────────────┐
│                  FormField                       │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │  Label (a-display-text)                   │  │
│  │  "Email" *                                │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Description (a-display-text)             │  │
│  │  "We'll never share your email"           │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Input (a-input-text)                     │  │
│  │  [________________________]               │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Error (a-feedback-alert)                 │  │
│  │  ⚠ Invalid email address                  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Atoms Used

- [display-text](../atoms/display-text.md) - Label and description
- [input-text](../atoms/input-text.md) - Text input (or other input types)
- [feedback-alert](../atoms/feedback-alert.md) - Error message styling

## Implementation

```typescript
// components/ui/form-field.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps {
  /** Field label */
  label: string;
  /** Help text shown below label */
  description?: string;
  /** Error message */
  error?: string;
  /** Mark as required */
  required?: boolean;
  /** Input element to wrap */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Horizontal layout */
  horizontal?: boolean;
}

export function FormField({
  label,
  description,
  error,
  required,
  children,
  className,
  horizontal = false,
}: FormFieldProps) {
  const id = React.useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  // Clone child to add accessibility props
  const enhancedChild = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement, {
        id,
        "aria-describedby": cn(
          description && descriptionId,
          error && errorId
        ) || undefined,
        "aria-invalid": !!error,
        "aria-required": required,
      })
    : children;

  return (
    <div
      className={cn(
        horizontal ? "grid grid-cols-[200px_1fr] gap-4 items-start" : "space-y-2",
        className
      )}
    >
      <div className={cn(horizontal && "pt-2")}>
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            error && "text-destructive"
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-hidden="true">*</span>
          )}
        </Label>
        {description && !horizontal && (
          <p
            id={descriptionId}
            className="text-sm text-muted-foreground mt-1"
          >
            {description}
          </p>
        )}
      </div>

      <div className="space-y-1">
        {enhancedChild}
        
        {description && horizontal && (
          <p
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
```

```typescript
// components/ui/label.tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
```

```typescript
// components/ui/form-field-group.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldGroupProps {
  /** Group legend/title */
  legend: string;
  /** Help text for the group */
  description?: string;
  /** Child form fields */
  children: React.ReactNode;
  className?: string;
}

export function FormFieldGroup({
  legend,
  description,
  children,
  className,
}: FormFieldGroupProps) {
  return (
    <fieldset className={cn("space-y-4", className)}>
      <legend className="text-base font-semibold text-foreground">
        {legend}
      </legend>
      {description && (
        <p className="text-sm text-muted-foreground -mt-2">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
```

### Key Implementation Notes

1. **ID Generation**: Uses `React.useId()` for unique IDs without hydration mismatch
2. **ARIA Association**: Properly links label, description, and error via `aria-describedby`

## Variants

### Vertical Layout (Default)

```tsx
<FormField
  label="Email"
  description="We'll never share your email"
  error={errors.email}
  required
>
  <Input type="email" placeholder="you@example.com" />
</FormField>
```

### Horizontal Layout

```tsx
<FormField
  label="Username"
  description="Choose a unique username"
  horizontal
  required
>
  <Input placeholder="johndoe" />
</FormField>
```

### With Different Input Types

```tsx
// Textarea
<FormField label="Bio" description="Tell us about yourself">
  <Textarea rows={4} />
</FormField>

// Select
<FormField label="Country" required>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Select a country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="us">United States</SelectItem>
      <SelectItem value="uk">United Kingdom</SelectItem>
    </SelectContent>
  </Select>
</FormField>

// Checkbox
<FormField label="Terms">
  <Checkbox id="terms" />
  <Label htmlFor="terms" className="ml-2">
    I accept the terms and conditions
  </Label>
</FormField>
```

## States

| State | Label Color | Border | Error | Description |
|-------|-------------|--------|-------|-------------|
| Default | foreground | input | hidden | visible |
| Focus | foreground | primary + ring | hidden | visible |
| Error | destructive | destructive | visible | visible |
| Disabled | muted | muted | hidden | visible (muted) |

## Accessibility

### Required ARIA Attributes

- `id` on input - linked to label via `htmlFor`
- `aria-describedby` - links to description and error IDs
- `aria-invalid` - set to `true` when error present
- `aria-required` - set when field is required

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to input |
| `Shift+Tab` | Move to previous field |
| Label click | Focus input |

### Screen Reader Announcements

- Label read when input focused
- Description read after label
- Error announced with `role="alert"` when it appears

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-label": "^2.1.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install @radix-ui/react-label lucide-react
```

## Examples

### Basic Form

```tsx
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form className="space-y-4">
      <FormField
        label="Name"
        required
        error={errors.name}
      >
        <Input placeholder="Your name" />
      </FormField>

      <FormField
        label="Email"
        description="We'll use this to respond to you"
        required
        error={errors.email}
      >
        <Input type="email" placeholder="you@example.com" />
      </FormField>

      <FormField
        label="Message"
        error={errors.message}
      >
        <Textarea placeholder="Your message" rows={4} />
      </FormField>

      <Button type="submit">Send Message</Button>
    </form>
  );
}
```

### With React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/ui/form-field";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        error={errors.email?.message}
        required
      >
        <Input {...register("email")} type="email" />
      </FormField>

      <FormField
        label="Password"
        error={errors.password?.message}
        required
      >
        <Input {...register("password")} type="password" />
      </FormField>

      <Button type="submit">Sign In</Button>
    </form>
  );
}
```

### Grouped Fields

```tsx
import { FormFieldGroup, FormField } from "@/components/ui/form-field";

export function AddressForm() {
  return (
    <FormFieldGroup
      legend="Shipping Address"
      description="Enter your shipping details"
    >
      <FormField label="Street Address" required>
        <Input placeholder="123 Main St" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="City" required>
          <Input placeholder="New York" />
        </FormField>
        <FormField label="ZIP Code" required>
          <Input placeholder="10001" />
        </FormField>
      </div>
    </FormFieldGroup>
  );
}
```

## Anti-patterns

### Missing Label Association

```tsx
// Bad - label not associated with input
<div>
  <label>Email</label>
  <input type="email" />
</div>

// Good - use FormField or htmlFor
<FormField label="Email">
  <Input type="email" />
</FormField>
```

### Error Without ARIA

```tsx
// Bad - error not announced to screen readers
<div>
  <Input />
  <span className="text-red-500">{error}</span>
</div>

// Good - error linked via aria-describedby with role="alert"
<FormField label="Email" error={error}>
  <Input />
</FormField>
```

### Inconsistent Required Indicators

```tsx
// Bad - inconsistent required marking
<label>Name *</label>
<label>Email (required)</label>
<label>Phone</label> {/* required but not marked */}

// Good - consistent with FormField
<FormField label="Name" required>...</FormField>
<FormField label="Email" required>...</FormField>
<FormField label="Phone" required>...</FormField>
```

## Related Skills

### Composes From
- [atoms/input-text](../atoms/input-text.md) - Text input
- [atoms/display-text](../atoms/display-text.md) - Label and description
- [atoms/state-input](../atoms/state-input.md) - Input states

### Composes Into
- [organisms/auth-form](../organisms/auth-form.md) - Login/signup forms
- [organisms/contact-form](../organisms/contact-form.md) - Contact forms
- [organisms/settings-form](../organisms/settings-form.md) - Settings pages

### Alternatives
- Raw input elements - When labels not needed (rare)
- Custom field patterns - For complex multi-input fields

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Vertical and horizontal layouts
- FormFieldGroup for fieldsets
- React Hook Form integration example
