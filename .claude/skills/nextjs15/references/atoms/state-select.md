---
id: a-state-select
name: Select State Matrix
version: 2.0.0
layer: L1
category: state
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Complete select/dropdown state definitions for trigger and options
tags: [select, dropdown, states, open, focus, disabled]
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

# Select State Matrix

## Overview

This state matrix defines the visual and behavioral states for select/dropdown components including both the trigger button and the dropdown options. Use this reference for consistent, accessible select implementations.

## Trigger State Definitions

### Core Trigger States

| State | Border | Background | Text | Chevron | Ring | Cursor |
|-------|--------|------------|------|---------|------|--------|
| **Default** | input | background | foreground | muted | none | pointer |
| **Placeholder** | input | background | muted-foreground | muted | none | pointer |
| **Hover** | input (darker) | accent/10 | foreground | foreground | none | pointer |
| **Focus** | primary | background | foreground | foreground | ring-2 ring-ring | pointer |
| **Open** | primary | background | foreground | foreground (rotated) | ring-2 ring-ring | pointer |
| **Disabled** | muted | muted | muted-foreground | muted | none | not-allowed |
| **Error** | destructive | background | foreground | muted | ring-destructive/25 | pointer |

### Chevron Animation

```css
/* Chevron rotation on open */
.select-chevron {
  transition: transform 200ms ease-out;
}

.select[data-state="open"] .select-chevron {
  transform: rotate(180deg);
}
```

## Option State Definitions

### Core Option States

| State | Background | Text | Icon | Cursor |
|-------|------------|------|------|--------|
| **Default** | transparent | foreground | hidden | pointer |
| **Hover** | accent | accent-foreground | hidden | pointer |
| **Focus** | accent | accent-foreground | hidden | pointer |
| **Selected** | transparent | foreground | checkmark | pointer |
| **Selected:Hover** | accent | accent-foreground | checkmark | pointer |
| **Disabled** | transparent | muted-foreground | hidden | not-allowed |

## Dropdown Content States

| State | Background | Border | Shadow | Animation |
|-------|------------|--------|--------|-----------|
| **Opening** | popover | border | lg | fade-in + zoom-in |
| **Open** | popover | border | lg | none |
| **Closing** | popover | border | lg | fade-out + zoom-out |

## Transition Specifications

```css
/* Trigger transitions */
.select-trigger {
  transition-property: border-color, background-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

/* Content enter animation */
.select-content[data-state="open"] {
  animation: selectOpen 200ms ease-out;
}

.select-content[data-state="closed"] {
  animation: selectClose 150ms ease-in;
}

@keyframes selectOpen {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes selectClose {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
}

/* Option highlight */
.select-option {
  transition: background-color 100ms ease-out;
}
```

## Implementation

```typescript
// Select trigger variants
const selectTriggerVariants = cva(
  [
    "flex h-10 w-full items-center justify-between gap-2",
    "rounded-md border px-3 py-2",
    "text-sm",
    "bg-background ring-offset-background",
    "transition-colors duration-150",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      state: {
        default: "border-input hover:bg-accent/10",
        open: "border-primary ring-2 ring-ring",
        error: "border-destructive focus:ring-destructive/25",
      },
      hasValue: {
        true: "text-foreground",
        false: "text-muted-foreground",
      },
    },
    defaultVariants: {
      state: "default",
      hasValue: false,
    },
  }
);

// Option variants
const selectOptionVariants = cva(
  [
    "relative flex w-full cursor-pointer select-none items-center",
    "rounded-sm py-1.5 pl-8 pr-2 text-sm",
    "outline-none",
    "transition-colors duration-100",
  ],
  {
    variants: {
      highlighted: {
        true: "bg-accent text-accent-foreground",
        false: "bg-transparent",
      },
      selected: {
        true: "",
        false: "",
      },
      disabled: {
        true: "pointer-events-none opacity-50",
        false: "",
      },
    },
  }
);
```

## Group and Separator Patterns

```typescript
// Option group styling
const SelectGroup = styled.div`
  padding: 4px 0;
`;

const SelectGroupLabel = styled.div`
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted-foreground);
`;

const SelectSeparator = styled.div`
  height: 1px;
  margin: 4px -4px;
  background-color: var(--border);
`;
```

## Multi-Select States

### Chip/Tag States

| State | Background | Text | Remove Button | Border |
|-------|------------|------|---------------|--------|
| **Default** | secondary | secondary-foreground | visible | none |
| **Hover** | secondary/80 | secondary-foreground | visible | none |
| **Focus** | secondary | secondary-foreground | focus ring | ring-2 |
| **Removing** | destructive/10 | destructive | x visible | none |

### Multi-Select Trigger States

| State | Chips | Input | Clear All |
|-------|-------|-------|-----------|
| **Empty** | hidden | visible (placeholder) | hidden |
| **Has Selection** | visible | visible (smaller) | visible on hover |
| **Max Reached** | visible | hidden or disabled | visible |
| **Search Active** | visible | visible + focused | visible |

## Search/Combobox States

```typescript
// Searchable select states
type ComboboxState =
  | "idle"
  | "focused"
  | "searching"
  | "loading"
  | "results"
  | "empty"
  | "error";

const comboboxStateStyles = {
  idle: {
    input: "default",
    dropdown: "closed",
    icon: "chevron",
  },
  focused: {
    input: "focused",
    dropdown: "open",
    icon: "chevron-up",
  },
  searching: {
    input: "focused",
    dropdown: "open",
    icon: "chevron-up",
  },
  loading: {
    input: "focused",
    dropdown: "open",
    icon: "spinner",
  },
  results: {
    input: "focused",
    dropdown: "open with results",
    icon: "chevron-up",
  },
  empty: {
    input: "focused",
    dropdown: "open with empty state",
    icon: "chevron-up",
  },
  error: {
    input: "error",
    dropdown: "closed",
    icon: "alert",
  },
};
```

## Touch Optimizations

```css
/* Touch device adjustments */
@media (pointer: coarse) {
  .select-trigger {
    min-height: 44px;
    padding: 12px 16px;
    font-size: 16px; /* Prevent iOS zoom */
  }
  
  .select-option {
    min-height: 44px;
    padding: 12px 16px;
  }
  
  /* Larger touch targets for clear buttons */
  .select-clear {
    min-width: 44px;
    min-height: 44px;
  }
}
```

## Accessibility Requirements

### Trigger ARIA

| Attribute | Value |
|-----------|-------|
| `role` | combobox |
| `aria-haspopup` | listbox |
| `aria-expanded` | true/false |
| `aria-controls` | listbox ID |
| `aria-activedescendant` | focused option ID |
| `aria-label` or `aria-labelledby` | required |
| `aria-invalid` | true (on error) |
| `aria-describedby` | error message ID |

### Listbox ARIA

| Attribute | Value |
|-----------|-------|
| `role` | listbox |
| `aria-label` | optional description |
| `aria-multiselectable` | true (if multi-select) |

### Option ARIA

| Attribute | Value |
|-----------|-------|
| `role` | option |
| `aria-selected` | true/false |
| `aria-disabled` | true (if disabled) |
| `id` | unique ID |

### Keyboard Interactions

| Key | Action |
|-----|--------|
| `Space` | Open dropdown / Select highlighted |
| `Enter` | Select highlighted / Open dropdown |
| `Arrow Down` | Open dropdown / Move to next option |
| `Arrow Up` | Move to previous option |
| `Home` | Move to first option |
| `End` | Move to last option |
| `Escape` | Close dropdown |
| `Tab` | Close dropdown, move focus |
| `Type characters` | Jump to matching option |

## Dark Mode Adjustments

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Trigger Border | slate-200 | slate-700 |
| Dropdown BG | white | slate-900 |
| Option Hover | slate-100 | slate-800 |
| Option Selected | transparent | transparent |
| Separator | slate-200 | slate-700 |

## Animation Tokens

```typescript
const selectAnimations = {
  // Trigger state
  triggerTransition: {
    duration: 150,
    easing: "ease-out",
  },
  
  // Dropdown open
  dropdownOpen: {
    duration: 200,
    easing: "ease-out",
    initialScale: 0.95,
    initialY: -8,
  },
  
  // Dropdown close
  dropdownClose: {
    duration: 150,
    easing: "ease-in",
  },
  
  // Chevron rotation
  chevronRotate: {
    duration: 200,
    easing: "ease-out",
    rotation: 180,
  },
  
  // Option highlight
  optionHighlight: {
    duration: 100,
    easing: "ease-out",
  },
};
```

## Position and Collision

```typescript
// Dropdown positioning config
const selectPositionConfig = {
  // Default position
  side: "bottom",
  align: "start",
  sideOffset: 4,
  
  // Collision handling
  collisionPadding: 8,
  avoidCollisions: true,
  
  // Max height with scroll
  maxHeight: 300,
  
  // Match trigger width
  matchTriggerWidth: true,
};
```

## Related Skills

### Composes From
- [primitives/colors](../primitives/colors.md) - State colors
- [primitives/z-index](../primitives/z-index.md) - Dropdown layering
- [primitives/motion](../primitives/motion.md) - Animations

### Composes Into
- [input-select](./input-select.md) - Select component
- [molecules/combobox](../molecules/combobox.md) - Searchable select
- [organisms/data-table](../organisms/data-table.md) - Filter dropdowns

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- Trigger and option states
- Multi-select and combobox patterns
- Keyboard and accessibility requirements
