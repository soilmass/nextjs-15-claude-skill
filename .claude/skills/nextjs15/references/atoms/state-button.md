---
id: a-state-button
name: Button State Matrix
version: 2.0.0
layer: L1
category: state
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Complete button state definitions for all variants and interactions
tags: [button, states, hover, focus, disabled, loading]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Button State Matrix

## Overview

This state matrix defines the visual and behavioral states for button components. Use this reference when implementing or customizing button styles to ensure consistent, accessible, and performant state transitions.

## State Definitions

### Primary Button States

| State | Background | Text | Border | Shadow | Transform | Cursor |
|-------|------------|------|--------|--------|-----------|--------|
| **Default** | primary | primary-foreground | none | sm | none | pointer |
| **Hover** | primary/90 | primary-foreground | none | md | none | pointer |
| **Focus** | primary | primary-foreground | ring-2 ring-ring | sm | none | pointer |
| **Active** | primary/80 | primary-foreground | none | none | scale(0.98) | pointer |
| **Disabled** | primary/50 | primary-foreground/50 | none | none | none | not-allowed |
| **Loading** | primary | primary-foreground | none | sm | none | wait |

### Secondary Button States

| State | Background | Text | Border | Shadow | Transform | Cursor |
|-------|------------|------|--------|--------|-----------|--------|
| **Default** | secondary | secondary-foreground | none | sm | none | pointer |
| **Hover** | secondary/80 | secondary-foreground | none | md | none | pointer |
| **Focus** | secondary | secondary-foreground | ring-2 ring-ring | sm | none | pointer |
| **Active** | secondary/70 | secondary-foreground | none | none | scale(0.98) | pointer |
| **Disabled** | secondary/50 | secondary-foreground/50 | none | none | none | not-allowed |
| **Loading** | secondary | secondary-foreground | none | sm | none | wait |

### Outline Button States

| State | Background | Text | Border | Shadow | Transform | Cursor |
|-------|------------|------|--------|--------|-----------|--------|
| **Default** | transparent | foreground | border | none | none | pointer |
| **Hover** | accent | accent-foreground | border | none | none | pointer |
| **Focus** | transparent | foreground | ring-2 ring-ring | none | none | pointer |
| **Active** | accent/80 | accent-foreground | border | none | scale(0.98) | pointer |
| **Disabled** | transparent | muted-foreground | border/50 | none | none | not-allowed |
| **Loading** | transparent | foreground | border | none | none | wait |

### Ghost Button States

| State | Background | Text | Border | Shadow | Transform | Cursor |
|-------|------------|------|--------|--------|-----------|--------|
| **Default** | transparent | foreground | none | none | none | pointer |
| **Hover** | accent | accent-foreground | none | none | none | pointer |
| **Focus** | transparent | foreground | ring-2 ring-ring | none | none | pointer |
| **Active** | accent/80 | accent-foreground | none | none | scale(0.98) | pointer |
| **Disabled** | transparent | muted-foreground | none | none | none | not-allowed |
| **Loading** | transparent | foreground | none | none | none | wait |

### Destructive Button States

| State | Background | Text | Border | Shadow | Transform | Cursor |
|-------|------------|------|--------|--------|-----------|--------|
| **Default** | destructive | destructive-foreground | none | sm | none | pointer |
| **Hover** | destructive/90 | destructive-foreground | none | md | none | pointer |
| **Focus** | destructive | destructive-foreground | ring-2 ring-destructive | sm | none | pointer |
| **Active** | destructive/80 | destructive-foreground | none | none | scale(0.98) | pointer |
| **Disabled** | destructive/50 | destructive-foreground/50 | none | none | none | not-allowed |
| **Loading** | destructive | destructive-foreground | none | sm | none | wait |

## Transition Specifications

```css
/* Standard button transitions */
.button {
  transition-property: background-color, border-color, color, box-shadow, transform;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active state - faster for responsive feel */
.button:active {
  transition-duration: 50ms;
}

/* Loading state - disable transitions */
.button[data-loading="true"] {
  transition: none;
}
```

## Implementation

```typescript
// State-aware button implementation
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-md text-sm font-medium",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground shadow-sm",
          "hover:bg-primary/90 hover:shadow-md",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground shadow-sm",
          "hover:bg-secondary/80 hover:shadow-md",
        ],
        outline: [
          "border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground",
        ],
        ghost: [
          "bg-transparent",
          "hover:bg-accent hover:text-accent-foreground",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground shadow-sm",
          "hover:bg-destructive/90 hover:shadow-md",
          "focus-visible:ring-destructive",
        ],
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ],
      },
    },
  }
);
```

## Loading State Implementation

```typescript
interface ButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

function Button({ loading, loadingText, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      data-loading={loading}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {loading ? (loadingText ?? children) : children}
    </button>
  );
}
```

## Size State Variations

| Size | Padding X | Padding Y | Height | Font Size | Icon Size |
|------|-----------|-----------|--------|-----------|-----------|
| **xs** | 8px | 4px | 24px | 12px | 12px |
| **sm** | 12px | 6px | 32px | 14px | 14px |
| **md** | 16px | 8px | 40px | 14px | 16px |
| **lg** | 24px | 10px | 44px | 16px | 18px |
| **xl** | 32px | 12px | 52px | 18px | 20px |
| **icon** | 0 | 0 | 40px | - | 16px |

## Focus Ring Specifications

```css
/* Default focus ring */
.button:focus-visible {
  outline: none;
  ring-width: 2px;
  ring-color: var(--ring);
  ring-offset-width: 2px;
  ring-offset-color: var(--background);
}

/* Destructive variant focus */
.button-destructive:focus-visible {
  ring-color: var(--destructive);
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .button:focus-visible {
    ring-width: 3px;
    ring-offset-width: 3px;
  }
}
```

## Touch State Specifications

```css
/* Touch device optimizations */
@media (pointer: coarse) {
  .button {
    min-height: 44px;  /* WCAG touch target */
    min-width: 44px;
  }
  
  /* Remove hover effects on touch */
  .button:hover {
    background-color: inherit;
  }
  
  /* Active state more prominent */
  .button:active {
    transform: scale(0.95);
  }
}
```

## Accessibility Requirements

### ARIA Attributes by State

| State | aria-disabled | aria-busy | aria-pressed | tabindex |
|-------|---------------|-----------|--------------|----------|
| Default | - | - | (toggle only) | 0 |
| Disabled | true | - | - | -1 |
| Loading | - | true | - | 0 |
| Pressed | - | - | true | 0 |

### Keyboard Interactions

| Key | Action |
|-----|--------|
| `Enter` | Activate button |
| `Space` | Activate button |
| `Tab` | Move focus to next element |
| `Shift+Tab` | Move focus to previous element |

## Dark Mode Adjustments

| Variant | Light Opacity Change | Dark Opacity Change |
|---------|---------------------|---------------------|
| Primary | hover: -10% | hover: -15% |
| Secondary | hover: -20% | hover: -15% |
| Destructive | hover: -10% | hover: -15% |
| Ghost | hover: bg-accent | hover: bg-accent/20 |

## Animation Tokens

```typescript
const buttonAnimations = {
  // State transitions
  stateTransition: {
    duration: 150,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  // Active press
  activePress: {
    duration: 50,
    scale: 0.98,
  },
  
  // Loading spinner
  loadingSpinner: {
    duration: 750,
    easing: "linear",
    iterations: Infinity,
  },
  
  // Focus ring
  focusRing: {
    duration: 100,
    easing: "ease-out",
  },
};
```

## Related Skills

### Composes From
- [primitives/colors](../primitives/colors.md) - Color values
- [primitives/motion](../primitives/motion.md) - Transition timing
- [primitives/accessibility](../primitives/accessibility.md) - Touch targets

### Composes Into
- [input-button](./input-button.md) - Button component implementation
- [feedback-spinner](./feedback-spinner.md) - Loading indicator

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- All variant states documented
- Transition and animation specifications
- Touch and accessibility requirements
