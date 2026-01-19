---
id: m-state-form-field
name: State Form Field
version: 2.0.0
layer: L2
category: state
description: Complete state matrix for form field interactions, validation, and visual feedback
tags: [state, form, field, validation, matrix]
formula: "StateFormField = FormField(m-form-field) + ValidationState(empty|focus|valid|invalid) + Icons(a-display-icon) + ErrorAnimation"
composes: []
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# State Form Field

## Overview

The State Form Field defines the complete visual and behavioral state matrix for form field molecules. It covers all input states, validation feedback, label behavior, and error messaging with proper transitions and accessibility announcements.

## When to Use

Use this skill when:
- Implementing form field components
- Designing validation feedback patterns
- Ensuring consistent form behavior
- Debugging form interaction issues

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     StateFormField (L2)                          │
├─────────────────────────────────────────────────────────────────┤
│                    State Machine Controller                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │   empty ──► hover ──► focus ──► filled ──► validating     │  │
│  │                                     │                     │  │
│  │                                     ▼                     │  │
│  │   disabled ◄── readonly        valid / invalid            │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  FormField (m-form-field)                  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Label (a-display-text)     * (required indicator)  │  │  │
│  │  │  color: state-dependent                             │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Input (a-input-text)                    ┌───────┐  │  │  │
│  │  │  border: state-color                     │ Icon  │  │  │  │
│  │  │  ring: focus/error ring                  │ ✓|✗|🔄│  │  │  │
│  │  │  background: state-dependent             └───────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Description / Error (a-display-text)               │  │  │
│  │  │  ⚠️ Error message with slide-in animation           │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## State Matrix

### Input States

| State | Border | Background | Label | Ring | Icon |
|-------|--------|------------|-------|------|------|
| **Empty** | input | background | muted (above) | none | none |
| **Hover** | input-darker | subtle | muted | none | none |
| **Focus** | primary | background | primary | primary/25 | none |
| **Filled** | input | background | muted | none | none |
| **Validating** | input | background | muted | none | spinner |
| **Valid** | success (flash) | background | muted | success/25 | checkmark |
| **Invalid** | destructive | destructive/5 | destructive | destructive/25 | warning |
| **Disabled** | dashed | muted | muted | none | lock |
| **ReadOnly** | none | subtle | muted | none | none |

### Label Behavior

| State | Position | Color | Size | Weight |
|-------|----------|-------|------|--------|
| Empty | Above input | muted-foreground | sm | medium |
| Focus | Above input | primary | sm | medium |
| Filled | Above input | muted-foreground | sm | medium |
| Error | Above input | destructive | sm | medium |
| Floating (optional) | Inside → Above | varies | xs → sm | normal → medium |

### Error Message States

| State | Visibility | Icon | Animation |
|-------|------------|------|-----------|
| Hidden | none | none | none |
| Appearing | visible | warning | slide-down 200ms |
| Visible | visible | warning | none |
| Disappearing | fading | none | fade-out 150ms |

### Transition Timings

| Property | Duration | Easing | Trigger |
|----------|----------|--------|---------|
| Border color | 150ms | ease | state change |
| Background | 150ms | ease-out | state change |
| Label color | 150ms | ease | focus/blur |
| Label position | 200ms | ease-out | focus/fill |
| Ring | 100ms | ease-out | focus |
| Error message | 200ms | ease-out | validation |
| Validation icon | 150ms | ease | validation |

## Implementation

```typescript
// components/ui/stateful-form-field.tsx
"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type FieldState = 
  | "empty"
  | "hover"
  | "focus"
  | "filled"
  | "validating"
  | "valid"
  | "invalid"
  | "disabled"
  | "readonly";

interface StatefulFormFieldProps {
  /** Field label */
  label: string;
  /** Field name */
  name: string;
  /** Field type */
  type?: string;
  /** Current value */
  value?: string;
  /** Value change handler */
  onChange?: (value: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  description?: string;
  /** Error message */
  error?: string;
  /** Is field required */
  required?: boolean;
  /** Is field disabled */
  disabled?: boolean;
  /** Is field read-only */
  readOnly?: boolean;
  /** Is currently validating */
  validating?: boolean;
  /** Is valid (after validation) */
  valid?: boolean;
  /** Enable floating label */
  floatingLabel?: boolean;
  /** Additional class names */
  className?: string;
}

const stateStyles: Record<FieldState, {
  border: string;
  background: string;
  ring: string;
  label: string;
}> = {
  empty: {
    border: "border-input",
    background: "bg-background",
    ring: "",
    label: "text-muted-foreground",
  },
  hover: {
    border: "border-input/80",
    background: "bg-muted/30",
    ring: "",
    label: "text-muted-foreground",
  },
  focus: {
    border: "border-primary",
    background: "bg-background",
    ring: "ring-2 ring-primary/25",
    label: "text-primary",
  },
  filled: {
    border: "border-input",
    background: "bg-background",
    ring: "",
    label: "text-muted-foreground",
  },
  validating: {
    border: "border-input",
    background: "bg-background",
    ring: "",
    label: "text-muted-foreground",
  },
  valid: {
    border: "border-green-500",
    background: "bg-background",
    ring: "ring-2 ring-green-500/25",
    label: "text-muted-foreground",
  },
  invalid: {
    border: "border-destructive",
    background: "bg-destructive/5",
    ring: "ring-2 ring-destructive/25",
    label: "text-destructive",
  },
  disabled: {
    border: "border-dashed border-input/50",
    background: "bg-muted",
    ring: "",
    label: "text-muted-foreground/50",
  },
  readonly: {
    border: "border-transparent",
    background: "bg-muted/50",
    ring: "",
    label: "text-muted-foreground",
  },
};

export function StatefulFormField({
  label,
  name,
  type = "text",
  value = "",
  onChange,
  onBlur,
  placeholder,
  description,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  validating = false,
  valid = false,
  floatingLabel = false,
  className,
}: StatefulFormFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showValidIcon, setShowValidIcon] = React.useState(false);
  
  const inputId = React.useId();
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  // Determine current state
  const currentState = React.useMemo((): FieldState => {
    if (disabled) return "disabled";
    if (readOnly) return "readonly";
    if (error) return "invalid";
    if (validating) return "validating";
    if (valid) return "valid";
    if (isFocused) return "focus";
    if (isHovered) return "hover";
    if (value) return "filled";
    return "empty";
  }, [disabled, readOnly, error, validating, valid, isFocused, isHovered, value]);

  const styles = stateStyles[currentState];

  // Flash valid icon briefly
  React.useEffect(() => {
    if (valid && !validating) {
      setShowValidIcon(true);
      const timer = setTimeout(() => setShowValidIcon(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [valid, validating]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const renderIcon = () => {
    if (validating) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (showValidIcon) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (disabled) {
      return <Lock className="h-4 w-4 text-muted-foreground/50" />;
    }
    return null;
  };

  const icon = renderIcon();

  return (
    <div
      className={cn("space-y-2", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label */}
      <Label
        htmlFor={inputId}
        className={cn(
          "transition-colors duration-150",
          styles.label,
          floatingLabel && "sr-only"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Input wrapper */}
      <div className="relative">
        {/* Floating label */}
        {floatingLabel && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none",
              styles.label,
              (isFocused || value) 
                ? "-top-2.5 text-xs bg-background px-1" 
                : "top-2.5 text-sm"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}

        {/* Input */}
        <Input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={floatingLabel ? undefined : placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={!!error}
          aria-describedby={cn(
            description && descriptionId,
            error && errorId
          ) || undefined}
          className={cn(
            "transition-all duration-150",
            styles.border,
            styles.background,
            styles.ring,
            icon && "pr-10",
            floatingLabel && "pt-4"
          )}
        />

        {/* Status icon */}
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>

      {/* Description */}
      {description && !error && (
        <p
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            "text-sm text-destructive flex items-center gap-1.5",
            "animate-in slide-in-from-top-1 duration-200"
          )}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
```

```typescript
// hooks/use-field-validation.ts
import * as React from "react";

interface ValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
  debounce?: number;
}

interface ValidationState {
  validating: boolean;
  valid: boolean;
  error: string | undefined;
}

export function useFieldValidation(
  value: string,
  config: ValidationConfig
): ValidationState {
  const [state, setState] = React.useState<ValidationState>({
    validating: false,
    valid: false,
    error: undefined,
  });

  React.useEffect(() => {
    const validate = async () => {
      setState((s) => ({ ...s, validating: true }));
      
      let error: string | undefined;

      if (config.required && !value) {
        error = "This field is required";
      } else if (config.minLength && value.length < config.minLength) {
        error = `Minimum ${config.minLength} characters required`;
      } else if (config.maxLength && value.length > config.maxLength) {
        error = `Maximum ${config.maxLength} characters allowed`;
      } else if (config.pattern && !config.pattern.test(value)) {
        error = "Invalid format";
      } else if (config.custom) {
        error = config.custom(value);
      }

      setState({
        validating: false,
        valid: !error && value.length > 0,
        error,
      });
    };

    const timer = setTimeout(validate, config.debounce ?? 300);
    return () => clearTimeout(timer);
  }, [value, config]);

  return state;
}
```

### Key Implementation Notes

1. **State Priority**: disabled > readonly > error > validating > valid > focus > hover > filled/empty
2. **Floating Labels**: Optional pattern with smooth position animation
3. **Validation Icons**: Contextual icons for each validation state
4. **Error Animation**: Slides in from top for attention

## Interaction Flows

### Focus Flow

```
empty → focus (click/tab)
focus → filled (type)
filled → focus (continue editing)
focus → validating (blur)
validating → valid/invalid
```

### Validation Flow

```
filled → (blur) → validating
validating → valid (success)
validating → invalid (error)
invalid → focus → validating (on blur)
```

### Error Recovery Flow

```
invalid → focus (user corrects)
focus → (blur) → validating
validating → valid (error cleared)
```

## Accessibility Patterns

### ARIA Mapping

| State | ARIA Attribute | Value |
|-------|----------------|-------|
| Required | `aria-required` | "true" |
| Invalid | `aria-invalid` | "true" |
| Disabled | `aria-disabled` | "true" |
| Described | `aria-describedby` | "[error-id] [description-id]" |

### Live Region Announcements

```typescript
// Error messages use role="alert" for immediate announcement
<p role="alert" className="text-destructive">
  {error}
</p>

// Valid state can use aria-live for non-intrusive feedback
<span aria-live="polite" className="sr-only">
  {valid && "Input is valid"}
</span>
```

### Focus Management

```typescript
// On error, keep focus on input or move to first error
// Don't move focus unexpectedly during typing
// Allow Tab navigation even with errors
```

## Examples

### Email Validation

```tsx
const [email, setEmail] = React.useState("");
const validation = useFieldValidation(email, {
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  debounce: 500,
});

<StatefulFormField
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={setEmail}
  error={validation.error}
  validating={validation.validating}
  valid={validation.valid}
  required
/>
```

### Password with Requirements

```tsx
const [password, setPassword] = React.useState("");
const validation = useFieldValidation(password, {
  required: true,
  minLength: 8,
  custom: (value) => {
    if (!/[A-Z]/.test(value)) return "Must contain uppercase letter";
    if (!/[0-9]/.test(value)) return "Must contain number";
    return undefined;
  },
});

<StatefulFormField
  label="Password"
  name="password"
  type="password"
  value={password}
  onChange={setPassword}
  error={validation.error}
  validating={validation.validating}
  valid={validation.valid}
  description="8+ characters, uppercase, and number"
  required
/>
```

### Floating Label

```tsx
<StatefulFormField
  label="Username"
  name="username"
  value={username}
  onChange={setUsername}
  floatingLabel
  required
/>
```

### Async Validation

```tsx
const [username, setUsername] = React.useState("");
const [isChecking, setIsChecking] = React.useState(false);
const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null);

const checkAvailability = async (value: string) => {
  setIsChecking(true);
  const available = await checkUsernameAPI(value);
  setIsAvailable(available);
  setIsChecking(false);
};

<StatefulFormField
  label="Username"
  name="username"
  value={username}
  onChange={setUsername}
  onBlur={() => checkAvailability(username)}
  validating={isChecking}
  valid={isAvailable === true}
  error={isAvailable === false ? "Username is taken" : undefined}
/>
```

## Anti-patterns

### Validating on Every Keystroke

```tsx
// Bad - validates immediately, disruptive
<Input onChange={(e) => {
  setValue(e.target.value);
  validateImmediately(e.target.value); // Shows error while typing
}} />

// Good - debounced validation
const validation = useFieldValidation(value, {
  debounce: 500, // Wait for user to pause
});
```

### Clearing Errors Too Early

```tsx
// Bad - error disappears as soon as user types
<Input
  error={value ? undefined : error} // Clears immediately
/>

// Good - revalidate on blur or after debounce
<StatefulFormField
  error={error}
  validating={isValidating}
  onBlur={revalidate}
/>
```

### Missing Error Message

```tsx
// Bad - only red border, no explanation
<Input className={error ? "border-red-500" : ""} />

// Good - clear error message
<StatefulFormField
  error="Email address is invalid"
/>
```

## Related Skills

### Implements States For
- [molecules/form-field](./form-field.md) - Base form field

### Pattern Used By
- [organisms/auth-form](../organisms/auth-form.md) - Login/signup
- [organisms/contact-form](../organisms/contact-form.md) - Contact forms
- [organisms/settings-form](../organisms/settings-form.md) - Settings

### Related State Matrices
- [atoms/state-input](../atoms/state-input.md) - Input states
- [molecules/state-card](./state-card.md) - Card states

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- Floating label support
- Validation hook utility
- Async validation example
