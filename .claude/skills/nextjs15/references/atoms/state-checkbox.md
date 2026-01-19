---
id: a-state-checkbox
name: Checkbox State Matrix
version: 2.0.0
layer: L1
category: state
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Complete checkbox state definitions including indeterminate and group states
tags: [checkbox, states, checked, indeterminate, focus, disabled]
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

# Checkbox State Matrix

## Overview

This state matrix defines the visual and behavioral states for checkbox components including the indeterminate state for parent checkboxes in hierarchies. Use this reference for consistent checkbox implementations.

## State Definitions

### Core Checkbox States

| State | Background | Border | Check | Ring | Cursor |
|-------|------------|--------|-------|------|--------|
| **Unchecked** | transparent | input | hidden | none | pointer |
| **Unchecked:Hover** | accent/10 | input (darker) | hidden | none | pointer |
| **Unchecked:Focus** | transparent | primary | hidden | ring-2 ring-ring | pointer |
| **Unchecked:Active** | accent/20 | input | hidden | none | pointer |
| **Checked** | primary | primary | visible (white) | none | pointer |
| **Checked:Hover** | primary/90 | primary/90 | visible (white) | none | pointer |
| **Checked:Focus** | primary | primary | visible (white) | ring-2 ring-ring | pointer |
| **Indeterminate** | primary | primary | dash (white) | none | pointer |
| **Disabled:Unchecked** | muted | muted-foreground/30 | hidden | none | not-allowed |
| **Disabled:Checked** | muted-foreground/50 | muted-foreground/50 | visible (muted) | none | not-allowed |
| **Error** | transparent | destructive | (based on checked) | none | pointer |

## Check Icon Animation

```css
/* Check mark animation */
@keyframes checkmark {
  0% {
    stroke-dashoffset: 16;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.checkbox-indicator {
  stroke-dasharray: 16;
  stroke-dashoffset: 16;
}

.checkbox[data-state="checked"] .checkbox-indicator {
  animation: checkmark 200ms ease-out forwards;
}

/* Indeterminate dash */
.checkbox[data-state="indeterminate"] .checkbox-indicator {
  stroke-dasharray: none;
  animation: fadeIn 150ms ease-out;
}
```

## Transition Specifications

```css
/* Checkbox transitions */
.checkbox {
  transition-property: background-color, border-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scale on press */
.checkbox:active:not(:disabled) {
  transform: scale(0.95);
  transition-duration: 50ms;
}

/* Focus ring */
.checkbox:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring);
}
```

## Implementation

```typescript
// Checkbox with all states
const checkboxVariants = cva(
  [
    "peer h-4 w-4 shrink-0 rounded-sm border",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "active:scale-95",
  ],
  {
    variants: {
      checked: {
        false: "border-input bg-transparent hover:bg-accent/10",
        true: "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        indeterminate: "border-primary bg-primary text-primary-foreground",
      },
      error: {
        true: "border-destructive focus-visible:ring-destructive",
        false: "",
      },
    },
    defaultVariants: {
      checked: false,
      error: false,
    },
  }
);
```

## Indeterminate State Logic

```typescript
// Parent checkbox with children
interface ParentCheckboxProps {
  children: boolean[];
  onChange: (checked: boolean) => void;
}

function useIndeterminateState(children: boolean[]) {
  const allChecked = children.every(Boolean);
  const someChecked = children.some(Boolean);
  
  return {
    checked: allChecked,
    indeterminate: !allChecked && someChecked,
  };
}

// Usage
function ParentCheckbox({ children, onChange }: ParentCheckboxProps) {
  const { checked, indeterminate } = useIndeterminateState(children);
  
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(checked) => {
        // When parent clicked: check all if indeterminate/unchecked, uncheck all if checked
        onChange(checked === true || indeterminate);
      }}
    />
  );
}
```

## Group Selection Patterns

### Select All Pattern

```typescript
interface CheckboxGroupProps {
  items: { id: string; label: string }[];
  selected: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
}

function CheckboxGroup({ items, selected, onSelectionChange }: CheckboxGroupProps) {
  const allSelected = items.length === selected.size;
  const someSelected = selected.size > 0 && !allSelected;
  
  const handleSelectAll = () => {
    if (allSelected || someSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(i => i.id)));
    }
  };
  
  return (
    <div>
      <Checkbox
        checked={allSelected}
        indeterminate={someSelected}
        onCheckedChange={handleSelectAll}
        aria-label="Select all"
      />
      {items.map(item => (
        <Checkbox
          key={item.id}
          checked={selected.has(item.id)}
          onCheckedChange={(checked) => {
            const next = new Set(selected);
            if (checked) next.add(item.id);
            else next.delete(item.id);
            onSelectionChange(next);
          }}
        >
          {item.label}
        </Checkbox>
      ))}
    </div>
  );
}
```

## Size Variants

| Size | Box Size | Border Radius | Check Size | Touch Target |
|------|----------|---------------|------------|--------------|
| **sm** | 14px | 2px | 10px | 32px |
| **md** | 16px | 3px | 12px | 40px |
| **lg** | 20px | 4px | 14px | 44px |

## Label States

| Checkbox State | Label Color | Label Opacity | Decoration |
|----------------|-------------|---------------|------------|
| Unchecked | foreground | 100% | none |
| Checked | foreground | 100% | none |
| Disabled | muted-foreground | 50% | none |
| Error | foreground | 100% | none |

## Touch Optimizations

```css
/* Touch device adjustments */
@media (pointer: coarse) {
  .checkbox-wrapper {
    /* Expand touch target */
    position: relative;
    padding: 12px;
    margin: -12px;
  }
  
  .checkbox {
    min-width: 20px;
    min-height: 20px;
  }
  
  /* Visible hover replacement on touch */
  .checkbox:active {
    background-color: var(--accent);
  }
}
```

## Accessibility Requirements

### ARIA Attributes

| State | aria-checked | aria-disabled | aria-invalid |
|-------|--------------|---------------|--------------|
| Unchecked | false | - | - |
| Checked | true | - | - |
| Indeterminate | mixed | - | - |
| Disabled | (current) | true | - |
| Error | (current) | - | true |

### Required ARIA

```typescript
// Checkbox accessibility
<button
  role="checkbox"
  aria-checked={indeterminate ? "mixed" : checked}
  aria-disabled={disabled}
  aria-invalid={error}
  aria-describedby={error ? errorId : undefined}
>
  <CheckIcon aria-hidden="true" />
</button>
```

### Keyboard Interactions

| Key | Action |
|-----|--------|
| `Space` | Toggle checkbox |
| `Tab` | Move focus to next element |
| `Shift+Tab` | Move focus to previous element |

### Group Keyboard Navigation

| Key | Action |
|-----|--------|
| `Arrow Down` | Focus next checkbox in group |
| `Arrow Up` | Focus previous checkbox in group |
| `Home` | Focus first checkbox in group |
| `End` | Focus last checkbox in group |

## Dark Mode Adjustments

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Unchecked Border | slate-200 | slate-700 |
| Checked Background | primary | primary |
| Hover Background | slate-100/10 | slate-800/30 |
| Disabled Background | slate-100 | slate-800 |
| Check Color | white | white |

## Animation Tokens

```typescript
const checkboxAnimations = {
  // State transition
  stateTransition: {
    duration: 150,
    easing: "ease-out",
  },
  
  // Check mark draw
  checkDraw: {
    duration: 200,
    easing: "ease-out",
  },
  
  // Scale on press
  pressScale: {
    duration: 50,
    scale: 0.95,
  },
  
  // Focus ring
  focusRing: {
    duration: 100,
    easing: "ease-out",
  },
  
  // Indeterminate fade
  indeterminateFade: {
    duration: 150,
    easing: "ease-in",
  },
};
```

## Error State Handling

```typescript
// Checkbox with error state
interface CheckboxWithErrorProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  required?: boolean;
}

function CheckboxWithError({ checked, onChange, error, required }: CheckboxWithErrorProps) {
  const id = useId();
  const errorId = `${id}-error`;
  
  return (
    <div>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        className={error ? "border-destructive" : undefined}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

## Related Skills

### Composes From
- [primitives/colors](../primitives/colors.md) - State colors
- [primitives/motion](../primitives/motion.md) - Animation timing

### Composes Into
- [input-checkbox](./input-checkbox.md) - Checkbox component
- [molecules/form-field](../molecules/form-field.md) - Form integration
- [organisms/data-table](../organisms/data-table.md) - Row selection

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- Indeterminate state specifications
- Group selection patterns
- Animation and accessibility requirements
