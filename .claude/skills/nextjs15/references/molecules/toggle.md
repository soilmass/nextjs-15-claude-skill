---
id: m-toggle
name: Toggle
version: 2.0.0
layer: L2
category: forms
description: Toggle/switch input component for boolean on/off states
tags: [toggle, switch, checkbox, boolean, input, form]
formula: "Toggle = Switch(a-input-switch) + Label(a-display-text) + Icon(a-display-icon)"
composes:
  - ../atoms/input-switch.md
  - ../atoms/display-text.md
  - ../atoms/display-icon.md
dependencies:
  "@radix-ui/react-switch": "^1.1.1"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Toggle

## Overview

The Toggle molecule provides a switch control for binary on/off states. More intuitive than checkboxes for settings that take effect immediately. Supports labels, descriptions, and various sizes.

## When to Use

Use this skill when:
- Toggling features or settings on/off
- Enabling/disabling options with immediate effect
- Building settings panels or preferences
- Replacing checkboxes for clearer binary choices

## Composition Diagram

```
+-----------------------------------------------+
|                    Toggle                      |
+-----------------------------------------------+
|                                               |
| +-------------------------------------------+ |
| |  Toggle with Label                        | |
| |                                           | |
| |  [Label Text]                             | |
| |  [Description text]      +------+         | |
| |                          | (  o)|  ON     | |
| |                          +------+         | |
| +-------------------------------------------+ |
|                                               |
| Variants:                                     |
| +-------------------------------------------+ |
| |  [ OFF ]     [ ON  ]     [Icon]           | |
| |  +----+      +----+      +----+           | |
| |  |(o  )|     |(  o)|     |Sun |           | |
| |  +----+      +----+      +----+           | |
| +-------------------------------------------+ |
+-----------------------------------------------+
```

## Atoms Used

- [input-switch](../atoms/input-switch.md) - Base switch control
- [display-text](../atoms/display-text.md) - Label and description
- [display-icon](../atoms/display-icon.md) - Optional icons

## Implementation

```typescript
// components/ui/switch.tsx
"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
```

```typescript
// components/ui/toggle.tsx
"use client";

import * as React from "react";
import { Switch } from "./switch";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface ToggleProps {
  /** Toggle label */
  label: string;
  /** Help text below label */
  description?: string;
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Label position */
  labelPosition?: "left" | "right";
  /** Icon when checked */
  checkedIcon?: React.ReactNode;
  /** Icon when unchecked */
  uncheckedIcon?: React.ReactNode;
  className?: string;
  id?: string;
}

export function Toggle({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  size = "md",
  labelPosition = "left",
  checkedIcon,
  uncheckedIcon,
  className,
  id,
}: ToggleProps) {
  const generatedId = React.useId();
  const toggleId = id || generatedId;

  const sizeStyles = {
    sm: {
      switch: "h-5 w-9",
      thumb: "h-4 w-4 data-[state=checked]:translate-x-4",
    },
    md: {
      switch: "h-6 w-11",
      thumb: "h-5 w-5 data-[state=checked]:translate-x-5",
    },
    lg: {
      switch: "h-7 w-14",
      thumb: "h-6 w-6 data-[state=checked]:translate-x-7",
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        labelPosition === "right" && "flex-row-reverse justify-end",
        className
      )}
    >
      <div className="flex-1 space-y-0.5">
        <Label
          htmlFor={toggleId}
          className={cn(
            "text-sm font-medium leading-none cursor-pointer",
            disabled && "cursor-not-allowed opacity-70"
          )}
        >
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={toggleId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={styles.switch}
      />
    </div>
  );
}
```

```typescript
// components/ui/toggle-group.tsx
"use client";

import * as React from "react";
import { Toggle } from "./toggle";
import { cn } from "@/lib/utils";

interface ToggleGroupItem {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}

interface ToggleGroupProps {
  items: ToggleGroupItem[];
  /** Controlled values (array of checked item ids) */
  values?: string[];
  /** Change handler for all toggles */
  onValuesChange?: (values: string[]) => void;
  /** Group title */
  title?: string;
  /** Divider between items */
  divided?: boolean;
  className?: string;
}

export function ToggleGroup({
  items,
  values,
  onValuesChange,
  title,
  divided = true,
  className,
}: ToggleGroupProps) {
  const [internalValues, setInternalValues] = React.useState<string[]>(
    items.filter((i) => i.defaultChecked).map((i) => i.id)
  );

  const currentValues = values ?? internalValues;

  const handleChange = (id: string, checked: boolean) => {
    const newValues = checked
      ? [...currentValues, id]
      : currentValues.filter((v) => v !== id);

    if (onValuesChange) {
      onValuesChange(newValues);
    } else {
      setInternalValues(newValues);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-lg font-semibold">{title}</h3>
      )}
      <div className={cn(divided && "divide-y")}>
        {items.map((item) => (
          <div key={item.id} className={cn(divided && "py-4 first:pt-0 last:pb-0")}>
            <Toggle
              label={item.label}
              description={item.description}
              checked={currentValues.includes(item.id)}
              onCheckedChange={(checked) => handleChange(item.id, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Variants

### Basic Toggle

```tsx
<Toggle
  label="Enable notifications"
  onCheckedChange={(checked) => console.log(checked)}
/>
```

### With Description

```tsx
<Toggle
  label="Marketing emails"
  description="Receive emails about new products and features"
  defaultChecked
/>
```

### Size Variants

```tsx
<Toggle label="Small" size="sm" />
<Toggle label="Medium" size="md" />
<Toggle label="Large" size="lg" />
```

### Label Position

```tsx
<Toggle label="Label on left" labelPosition="left" />
<Toggle label="Label on right" labelPosition="right" />
```

### Disabled State

```tsx
<Toggle
  label="Premium feature"
  description="Upgrade to enable this feature"
  disabled
/>
```

### Toggle Group

```tsx
<ToggleGroup
  title="Notification Settings"
  items={[
    { id: "email", label: "Email notifications", defaultChecked: true },
    { id: "push", label: "Push notifications", description: "Mobile alerts" },
    { id: "sms", label: "SMS notifications" },
  ]}
  onValuesChange={(values) => console.log(values)}
/>
```

## States

| State | Background | Thumb | Label |
|-------|------------|-------|-------|
| Unchecked | input | left | normal |
| Checked | primary | right | normal |
| Focus | ring-2 | - | normal |
| Disabled | opacity-50 | - | opacity-70 |
| Hover | slight darken | - | - |

## Accessibility

### Required ARIA Attributes

- `role="switch"` - Automatically applied by Radix
- `aria-checked` - Current state
- `aria-labelledby` - References label

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus toggle |
| `Space` | Toggle state |
| `Enter` | Toggle state |

### Screen Reader Announcements

- Label announced when focused
- State change announced ("on" or "off")
- Description provided via association

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0"
  }
}
```

## Examples

### Settings Page

```tsx
function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    sms: false,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Notifications</h2>

      <Toggle
        label="Email notifications"
        description="Get notified via email"
        checked={settings.email}
        onCheckedChange={(checked) =>
          setSettings({ ...settings, email: checked })
        }
      />

      <Toggle
        label="Push notifications"
        description="Browser push notifications"
        checked={settings.push}
        onCheckedChange={(checked) =>
          setSettings({ ...settings, push: checked })
        }
      />

      <Toggle
        label="SMS notifications"
        description="Text message alerts"
        checked={settings.sms}
        onCheckedChange={(checked) =>
          setSettings({ ...settings, sms: checked })
        }
      />
    </div>
  );
}
```

### Feature Flags

```tsx
function FeatureFlags({ features }) {
  return (
    <ToggleGroup
      title="Feature Flags"
      items={features.map((f) => ({
        id: f.id,
        label: f.name,
        description: f.description,
        defaultChecked: f.enabled,
      }))}
      onValuesChange={updateFeatures}
      divided
    />
  );
}
```

### Dark Mode Toggle

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Toggle
      label="Dark mode"
      checked={theme === "dark"}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      size="sm"
    />
  );
}
```

## Anti-patterns

### Using for Multiple Choice

```tsx
// Bad - toggle for multi-select
<Toggle label="Option A" />
<Toggle label="Option B" />
<Toggle label="Option C" />

// Good - use checkbox group or select
<CheckboxGroup options={["A", "B", "C"]} />
```

### No Immediate Effect

```tsx
// Bad - toggle that requires save
<Toggle label="Enable feature" />
<Button>Save Changes</Button>

// Good - checkbox for form, toggle for immediate
<Checkbox label="Enable feature" />
<Button>Save Changes</Button>
```

### Missing Label

```tsx
// Bad - no accessible label
<Switch checked={enabled} />

// Good - proper labeling
<Toggle
  label="Enable feature"
  checked={enabled}
/>
```

## Related Skills

### Composes From
- [atoms/input-switch](../atoms/input-switch.md) - Base switch
- [atoms/state-toggle](../atoms/state-toggle.md) - Toggle states

### Composes Into
- [organisms/settings-form](../organisms/settings-form.md) - Settings UI
- [organisms/feature-flags](../organisms/feature-flags.md) - Feature management

### Alternatives
- [atoms/input-checkbox](../atoms/input-checkbox.md) - For form submissions
- [molecules/form-field](./form-field.md) - For labeled form inputs

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Radix UI Switch integration
- Size variants
- ToggleGroup component
- Label positioning options
