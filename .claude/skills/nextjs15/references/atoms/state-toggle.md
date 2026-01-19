---
id: a-state-toggle
name: Toggle/Switch State Matrix
version: 2.0.0
layer: L1
category: state
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Complete toggle switch state definitions for on/off interactions
tags: [toggle, switch, states, on, off, focus, disabled]
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

# Toggle/Switch State Matrix

## Overview

This state matrix defines the visual and behavioral states for toggle/switch components. Use this reference when implementing toggle switches to ensure consistent, accessible on/off state interactions.

## State Definitions

### Core Toggle States

| State | Track BG | Thumb BG | Thumb Position | Ring | Cursor |
|-------|----------|----------|----------------|------|--------|
| **Off** | muted | background | left (2px) | none | pointer |
| **Off:Hover** | muted (darker) | background | left | none | pointer |
| **Off:Focus** | muted | background | left | ring-2 ring-ring | pointer |
| **Off:Active** | muted | background | left | none | pointer |
| **On** | primary | background | right (calc) | none | pointer |
| **On:Hover** | primary/90 | background | right | none | pointer |
| **On:Focus** | primary | background | right | ring-2 ring-ring | pointer |
| **On:Active** | primary | background | right | none | pointer |
| **Disabled:Off** | muted/50 | muted | left | none | not-allowed |
| **Disabled:On** | primary/30 | muted | right | none | not-allowed |

## Size Specifications

| Size | Track Width | Track Height | Thumb Size | Thumb Offset |
|------|-------------|--------------|------------|--------------|
| **sm** | 32px | 18px | 14px | 2px |
| **md** | 44px | 24px | 20px | 2px |
| **lg** | 56px | 30px | 26px | 2px |

## Thumb Position Calculation

```css
/* Thumb position calculation */
.toggle-thumb {
  --thumb-size: 20px;
  --track-padding: 2px;
  --track-width: 44px;
  
  width: var(--thumb-size);
  height: var(--thumb-size);
  
  /* Off position */
  transform: translateX(var(--track-padding));
}

.toggle[data-state="checked"] .toggle-thumb {
  /* On position */
  transform: translateX(
    calc(var(--track-width) - var(--thumb-size) - var(--track-padding))
  );
}
```

## Transition Specifications

```css
/* Toggle transitions */
.toggle {
  transition-property: background-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Thumb slide animation */
.toggle-thumb {
  transition-property: transform, background-color;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); /* bouncy */
}

/* Reduce motion preference */
@media (prefers-reduced-motion: reduce) {
  .toggle-thumb {
    transition-duration: 0ms;
  }
}
```

## Implementation

```typescript
// Toggle switch with all states
const toggleVariants = cva(
  [
    "peer inline-flex shrink-0 cursor-pointer items-center rounded-full",
    "border-2 border-transparent",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-[18px] w-[32px]",
        md: "h-6 w-11",
        lg: "h-[30px] w-14",
      },
      checked: {
        true: "bg-primary",
        false: "bg-input",
      },
    },
    compoundVariants: [
      {
        checked: false,
        className: "hover:bg-input/80",
      },
      {
        checked: true,
        className: "hover:bg-primary/90",
      },
    ],
    defaultVariants: {
      size: "md",
      checked: false,
    },
  }
);

const thumbVariants = cva(
  [
    "pointer-events-none block rounded-full bg-background shadow-lg ring-0",
    "transition-transform duration-200",
  ],
  {
    variants: {
      size: {
        sm: "h-3.5 w-3.5",
        md: "h-5 w-5",
        lg: "h-[26px] w-[26px]",
      },
      checked: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        size: "sm",
        checked: false,
        className: "translate-x-0.5",
      },
      {
        size: "sm",
        checked: true,
        className: "translate-x-[14px]",
      },
      {
        size: "md",
        checked: false,
        className: "translate-x-0.5",
      },
      {
        size: "md",
        checked: true,
        className: "translate-x-[22px]",
      },
      {
        size: "lg",
        checked: false,
        className: "translate-x-0.5",
      },
      {
        size: "lg",
        checked: true,
        className: "translate-x-[26px]",
      },
    ],
    defaultVariants: {
      size: "md",
      checked: false,
    },
  }
);
```

## With Icons Pattern

```typescript
interface IconToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  offIcon: React.ReactNode;
  onIcon: React.ReactNode;
}

function IconToggle({ checked, onCheckedChange, offIcon, onIcon }: IconToggleProps) {
  return (
    <Switch checked={checked} onCheckedChange={onCheckedChange}>
      <span className="sr-only">{checked ? "On" : "Off"}</span>
      <div className="relative">
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity",
            checked ? "opacity-0" : "opacity-100"
          )}
        >
          {offIcon}
        </span>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity",
            checked ? "opacity-100" : "opacity-0"
          )}
        >
          {onIcon}
        </span>
      </div>
    </Switch>
  );
}

// Theme toggle example
<IconToggle
  checked={theme === "dark"}
  onCheckedChange={(dark) => setTheme(dark ? "dark" : "light")}
  offIcon={<Sun className="h-4 w-4" />}
  onIcon={<Moon className="h-4 w-4" />}
/>
```

## With Label Pattern

```typescript
interface LabeledToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  labelPosition?: "left" | "right";
}

function LabeledToggle({
  checked,
  onCheckedChange,
  label,
  description,
  labelPosition = "right",
}: LabeledToggleProps) {
  const id = useId();
  
  return (
    <div className={cn(
      "flex items-center gap-3",
      labelPosition === "left" && "flex-row-reverse justify-end"
    )}>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <div>
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
```

## Touch Optimizations

```css
/* Touch device adjustments */
@media (pointer: coarse) {
  .toggle {
    /* Expand touch target */
    position: relative;
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Larger track for touch */
  .toggle-track {
    min-width: 52px;
    min-height: 32px;
  }
  
  /* Larger thumb for touch */
  .toggle-thumb {
    min-width: 28px;
    min-height: 28px;
  }
}
```

## Accessibility Requirements

### ARIA Attributes

| State | role | aria-checked | aria-disabled | aria-label |
|-------|------|--------------|---------------|------------|
| Off | switch | false | - | required if no label |
| On | switch | true | - | required if no label |
| Disabled | switch | (current) | true | required if no label |

### Screen Reader Announcements

```typescript
// Proper labeling for screen readers
<Switch
  role="switch"
  aria-checked={checked}
  aria-label="Enable notifications"
  // OR use aria-labelledby with visible label
  aria-labelledby={labelId}
/>
```

### Keyboard Interactions

| Key | Action |
|-----|--------|
| `Space` | Toggle switch |
| `Enter` | Toggle switch (optional but recommended) |
| `Tab` | Move focus to next element |
| `Shift+Tab` | Move focus to previous element |

## State Change Feedback

```typescript
// Optional haptic feedback on toggle
function ToggleWithFeedback({ checked, onCheckedChange }: Props) {
  const handleChange = (newChecked: boolean) => {
    // Haptic feedback (if available)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    onCheckedChange(newChecked);
  };
  
  return <Switch checked={checked} onCheckedChange={handleChange} />;
}
```

## Dark Mode Adjustments

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Track Off | slate-200 | slate-700 |
| Track On | primary | primary |
| Thumb | white | white |
| Track Disabled | slate-100 | slate-800 |
| Thumb Disabled | slate-300 | slate-600 |

## Animation Tokens

```typescript
const toggleAnimations = {
  // Track color transition
  trackTransition: {
    duration: 150,
    easing: "ease-out",
  },
  
  // Thumb slide
  thumbSlide: {
    duration: 200,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", // bouncy
  },
  
  // Icon crossfade
  iconCrossfade: {
    duration: 150,
    easing: "ease-in-out",
  },
  
  // Focus ring
  focusRing: {
    duration: 100,
    easing: "ease-out",
  },
};
```

## Loading State

```typescript
// Toggle with loading state
interface LoadingToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => Promise<void>;
}

function LoadingToggle({ checked, onCheckedChange }: LoadingToggleProps) {
  const [loading, setLoading] = useState(false);
  const [optimisticChecked, setOptimisticChecked] = useState(checked);
  
  const handleChange = async (newChecked: boolean) => {
    setLoading(true);
    setOptimisticChecked(newChecked); // Optimistic update
    
    try {
      await onCheckedChange(newChecked);
    } catch {
      setOptimisticChecked(checked); // Revert on error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative">
      <Switch
        checked={optimisticChecked}
        onCheckedChange={handleChange}
        disabled={loading}
      />
      {loading && (
        <Spinner className="absolute inset-0 m-auto h-4 w-4" />
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
- [input-switch](./input-switch.md) - Switch component
- [molecules/form-field](../molecules/form-field.md) - Form integration
- [organisms/settings-form](../organisms/settings-form.md) - Settings toggles

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- Size variants and thumb calculations
- Icon and label patterns
- Touch and accessibility requirements
