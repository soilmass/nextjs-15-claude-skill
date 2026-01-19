---
id: a-input-text
name: Input
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Text input with error state and prefix/suffix support
tags: [input, text, form, interactive]
dependencies: []
performance:
  impact: medium
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Input

## Overview

The Input atom is the foundation for all text-based form inputs. It supports error states, prefix/suffix elements, and integrates seamlessly with form libraries like react-hook-form.

Built to be composable with the FormField molecule for labels, descriptions, and error messages.

## When to Use

Use this skill when:
- Creating text input fields
- Building email, password, or search inputs
- Implementing form fields with validation
- Adding inputs with icons or buttons

## Implementation

```typescript
// components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          `flex h-10 w-full rounded-md border bg-background px-3 py-2
           text-base ring-offset-background
           file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
           placeholder:text-muted-foreground
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
           disabled:cursor-not-allowed disabled:opacity-50
           md:text-sm`,
          // Default border
          "border-input",
          // Error state
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        aria-invalid={error || undefined}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

### Input with Prefix/Suffix

```typescript
// components/ui/input-with-addons.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, InputProps } from "./input";

interface InputWithAddonsProps extends InputProps {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const InputWithAddons = React.forwardRef<HTMLInputElement, InputWithAddonsProps>(
  ({ prefix, suffix, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
            {prefix}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            prefix && "pl-10",
            suffix && "pr-10",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 flex items-center">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);
InputWithAddons.displayName = "InputWithAddons";

export { InputWithAddons };
```

## Variants

### Input Types

```tsx
// Text (default)
<Input type="text" placeholder="Enter text" />

// Email
<Input type="email" placeholder="email@example.com" />

// Password
<Input type="password" placeholder="Enter password" />

// Number
<Input type="number" min={0} max={100} />

// Search
<Input type="search" placeholder="Search..." />

// URL
<Input type="url" placeholder="https://" />

// Tel
<Input type="tel" placeholder="+1 (555) 000-0000" />
```

### Sizes (via className)

```tsx
// Small
<Input className="h-9 text-sm" />

// Default
<Input className="h-10" />

// Large
<Input className="h-11 text-base" />
```

## States

| State | Border | Background | Label | Ring | Placeholder |
|-------|--------|------------|-------|------|-------------|
| Empty | input | background | muted | none | visible |
| Hover | input (darker) | background | muted | none | visible |
| Focus | primary | background | primary | ring | faded |
| Filled | input | background | muted | none | hidden |
| Error | destructive | destructive/5 | destructive | destructive | visible |
| Disabled | dashed | muted | muted | none | visible |
| ReadOnly | none | muted | muted | none | hidden |

### State Transitions

```css
.input {
  transition: 
    border-color 150ms ease,
    box-shadow 150ms ease,
    background-color 150ms ease;
}
```

## Accessibility

### Required ARIA Attributes

- `aria-invalid`: Set to "true" when input has error
- `aria-describedby`: Link to error/description text
- `aria-required`: Set when field is required
- `id`: Required for label association

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus/unfocus the input |
| `Escape` | Clear input (in some contexts) |

### Screen Reader Considerations

- Always pair with a visible or visually-hidden label
- Error messages should be announced via aria-describedby
- Required state should be indicated

## Dependencies

```json
{
  "dependencies": {
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.5"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Input } from "@/components/ui/input";

<Input type="email" placeholder="Enter your email" />
```

### With Label (using FormField)

```tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>
```

### With Error State

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    error={!!errors.email}
    aria-describedby="email-error"
  />
  {errors.email && (
    <p id="email-error" className="text-sm text-destructive">
      {errors.email.message}
    </p>
  )}
</div>
```

### With Prefix Icon

```tsx
import { Mail } from "lucide-react";
import { InputWithAddons } from "@/components/ui/input-with-addons";

<InputWithAddons
  type="email"
  placeholder="Email address"
  prefix={<Mail className="h-4 w-4" />}
/>
```

### With Suffix Button

```tsx
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const [showPassword, setShowPassword] = useState(false);

<InputWithAddons
  type={showPassword ? "text" : "password"}
  placeholder="Password"
  suffix={
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  }
/>
```

### With react-hook-form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

function EmailForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register("email")}
        type="email"
        error={!!errors.email}
        aria-describedby={errors.email ? "email-error" : undefined}
      />
      {errors.email && (
        <p id="email-error" className="text-sm text-destructive mt-1">
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
```

## Anti-patterns

### Missing Label

```tsx
// Bad - no label association
<Input placeholder="Email" />

// Good - with label
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="email@example.com" />
</div>

// Or with aria-label for icon inputs
<Input aria-label="Search" placeholder="Search..." />
```

### Placeholder as Label

```tsx
// Bad - placeholder disappears on focus
<Input placeholder="Enter your email address" />

// Good - visible label with helpful placeholder
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="you@example.com" />
</div>
```

### Not Indicating Required Fields

```tsx
// Bad - no indication of required
<Input id="email" />

// Good - required is indicated
<div>
  <Label htmlFor="email">
    Email <span className="text-destructive">*</span>
  </Label>
  <Input id="email" required aria-required="true" />
</div>
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Border and focus colors
- [borders](../primitives/borders.md) - Border radius
- [accessibility](../primitives/accessibility.md) - Focus states

### Composes Into
- [form-field](../molecules/form-field.md) - Complete form field
- [search-input](../molecules/search-input.md) - Search with icon
- [password-input](../molecules/password-input.md) - Password with toggle

### Related
- [input-textarea](./input-textarea.md) - Multi-line text
- [input-select](./input-select.md) - Selection input

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial input component with error state
- Prefix/suffix support
- react-hook-form integration examples
