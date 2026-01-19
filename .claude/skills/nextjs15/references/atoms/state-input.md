---
id: a-state-input
name: Input State Matrix
version: 2.0.0
layer: L1
category: state
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Complete input field state definitions for all interactions and validations
tags: [input, states, focus, error, validation, disabled]
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

# Input State Matrix

## Overview

This state matrix defines the visual and behavioral states for text input components. Use this reference when implementing or customizing input styles to ensure consistent, accessible, and user-friendly form interactions.

## State Definitions

### Core Input States

| State | Border | Background | Label | Ring | Placeholder | Cursor |
|-------|--------|------------|-------|------|-------------|--------|
| **Empty** | input | background | muted-foreground | none | visible | text |
| **Hover** | input (darker) | subtle | muted-foreground | none | visible | text |
| **Focus** | primary | background | primary | ring-2 primary/25 | hidden | text |
| **Filled** | input | background | muted-foreground | none | hidden | text |
| **Disabled** | dashed muted | muted | muted-foreground | none | visible | not-allowed |
| **ReadOnly** | none | subtle | muted-foreground | none | hidden | default |

### Validation States

| State | Border | Background | Label | Icon | Ring | Message |
|-------|--------|------------|-------|------|------|---------|
| **Validating** | input | background | muted-foreground | spinner | none | none |
| **Valid** | success (flash) | background | muted-foreground | checkmark | none | none |
| **Invalid** | destructive | destructive/5 | destructive | warning | destructive/25 | error message |
| **Warning** | warning | warning/5 | foreground | alert | warning/25 | warning message |

## Transition Specifications

```css
/* Standard input transitions */
.input {
  transition-property: border-color, background-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Label float animation */
.input-label {
  transition-property: transform, font-size, color;
  transition-duration: 200ms;
  transition-timing-function: ease-out;
}

/* Error message slide-in */
.input-error {
  animation: slideDown 200ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Validation icon fade */
.input-icon {
  transition: opacity 150ms ease-in;
}
```

## Visual Specifications

### Border Widths

| State | Border Width |
|-------|--------------|
| Default | 1px |
| Focus | 2px |
| Error | 2px |
| Disabled | 1px dashed |

### Ring (Focus Glow)

| Variant | Ring Width | Ring Color | Ring Opacity |
|---------|------------|------------|--------------|
| Default Focus | 2px | ring | 100% |
| Error Focus | 2px | destructive | 25% |
| Success Focus | 2px | success | 25% |
| Warning Focus | 2px | warning | 25% |

### Background Colors

| State | Light Mode | Dark Mode |
|-------|------------|-----------|
| Default | background | background |
| Hover | slate-50 | slate-900 |
| Disabled | muted | muted |
| Error | red-50/5 | red-950/10 |
| ReadOnly | slate-100 | slate-800 |

## Implementation

```typescript
// Input with state classes
const inputVariants = cva(
  [
    "flex h-10 w-full rounded-md border px-3 py-2",
    "text-base md:text-sm",
    "bg-background ring-offset-background",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "placeholder:text-muted-foreground",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:border-dashed",
  ],
  {
    variants: {
      state: {
        default: "border-input",
        error: "border-destructive focus-visible:ring-destructive/25 bg-destructive/5",
        success: "border-green-500 focus-visible:ring-green-500/25",
        warning: "border-yellow-500 focus-visible:ring-yellow-500/25 bg-yellow-500/5",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);
```

## Floating Label Implementation

```typescript
interface FloatingLabelInputProps {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

function FloatingLabelInput({ label, error, value, onChange }: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = focused || hasValue;

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          inputVariants({ state: error ? "error" : "default" }),
          "peer pt-4"
        )}
        placeholder=" "
      />
      <label
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none",
          isFloating
            ? "top-1 text-xs"
            : "top-1/2 -translate-y-1/2 text-base",
          focused ? "text-primary" : "text-muted-foreground",
          error && "text-destructive"
        )}
      >
        {label}
      </label>
    </div>
  );
}
```

## Validation State Flow

```
Empty → Focus → Typing → Blur → Validating → Valid/Invalid
                  ↓
              onChange
                  ↓
         (debounced validation)
```

### State Machine

```typescript
type InputState =
  | "idle"
  | "focused"
  | "typing"
  | "validating"
  | "valid"
  | "invalid"
  | "disabled";

type InputEvent =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "TYPE"; value: string }
  | { type: "VALIDATE_START" }
  | { type: "VALIDATE_SUCCESS" }
  | { type: "VALIDATE_ERROR"; error: string }
  | { type: "DISABLE" }
  | { type: "ENABLE" };

const inputStateMachine = {
  idle: {
    FOCUS: "focused",
    DISABLE: "disabled",
  },
  focused: {
    BLUR: "idle",
    TYPE: "typing",
  },
  typing: {
    BLUR: "validating",
    TYPE: "typing",
    VALIDATE_START: "validating",
  },
  validating: {
    VALIDATE_SUCCESS: "valid",
    VALIDATE_ERROR: "invalid",
    TYPE: "typing",
  },
  valid: {
    FOCUS: "focused",
    TYPE: "typing",
  },
  invalid: {
    FOCUS: "focused",
    TYPE: "typing",
  },
  disabled: {
    ENABLE: "idle",
  },
};
```

## Icon States

| State | Icon | Color | Animation |
|-------|------|-------|-----------|
| Empty | none | - | - |
| Validating | Loader | muted | spin 750ms |
| Valid | Check | green-500 | fade-in 150ms |
| Invalid | AlertCircle | destructive | fade-in 150ms |
| Clear (has value) | X | muted-foreground | none |
| Password Toggle | Eye/EyeOff | muted-foreground | none |

## Prefix/Suffix States

```typescript
interface InputWithAddonsProps {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

// Styles for addons
const addonStyles = {
  wrapper: "flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring",
  prefix: "px-3 bg-muted text-muted-foreground text-sm border-r",
  suffix: "px-3 bg-muted text-muted-foreground text-sm border-l",
  input: "border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
};
```

## Touch Optimizations

```css
/* Touch device adjustments */
@media (pointer: coarse) {
  .input {
    min-height: 44px;
    font-size: 16px; /* Prevents iOS zoom */
    padding: 12px 16px;
  }
  
  .input-icon {
    width: 24px;
    height: 24px;
    padding: 8px;
  }
  
  .input-clear-button {
    min-width: 44px;
    min-height: 44px;
  }
}
```

## Accessibility Requirements

### ARIA Attributes by State

| State | aria-invalid | aria-describedby | aria-disabled | aria-readonly |
|-------|--------------|------------------|---------------|---------------|
| Default | - | hint ID (if exists) | - | - |
| Error | true | error ID + hint ID | - | - |
| Valid | false | hint ID | - | - |
| Disabled | - | - | true | - |
| ReadOnly | - | hint ID | - | true |

### Error Message Pattern

```typescript
function InputWithError({ error, hint, id }: Props) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  
  return (
    <div>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={cn(
          hint && hintId,
          error && errorId
        )}
      />
      {hint && <p id={hintId} className="text-muted-foreground text-sm">{hint}</p>}
      {error && <p id={errorId} className="text-destructive text-sm" role="alert">{error}</p>}
    </div>
  );
}
```

## Dark Mode Adjustments

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Border Default | slate-200 | slate-700 |
| Border Focus | primary | primary |
| Background | white | slate-950 |
| Background Hover | slate-50 | slate-900 |
| Placeholder | slate-400 | slate-500 |
| Error Background | red-50/5 | red-950/10 |

## Animation Tokens

```typescript
const inputAnimations = {
  // Border color transition
  borderTransition: {
    duration: 150,
    easing: "ease-out",
  },
  
  // Label float
  labelFloat: {
    duration: 200,
    easing: "ease-out",
  },
  
  // Error message
  errorSlide: {
    duration: 200,
    easing: "ease-out",
    distance: 4,
  },
  
  // Validation icon
  iconFade: {
    duration: 150,
    easing: "ease-in",
  },
  
  // Success flash
  successFlash: {
    duration: 300,
    color: "green-500",
  },
};
```

## Related Skills

### Composes From
- [primitives/colors](../primitives/colors.md) - State colors
- [primitives/borders](../primitives/borders.md) - Border styles
- [primitives/motion](../primitives/motion.md) - Transitions

### Composes Into
- [input-text](./input-text.md) - Text input component
- [input-textarea](./input-textarea.md) - Textarea component
- [molecules/form-field](../molecules/form-field.md) - Complete form field

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- Validation states and transitions
- Floating label specifications
- Touch and accessibility requirements
