---
id: a-input-switch
name: Switch
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Toggle switch with on/off states
tags: [input, switch, toggle, boolean]
dependencies:
  - "@radix-ui/react-switch@1.1.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Switch

## Overview

The Switch atom provides a toggle control for binary states, ideal for settings that take effect immediately. Built on Radix UI's Switch primitive for full accessibility.

Use Switch for settings that apply immediately. Use Checkbox for form fields that require explicit submission.

## When to Use

Use this skill when:
- Creating on/off settings (dark mode, notifications)
- Building immediate-effect toggles
- Implementing enable/disable controls

## Implementation

```typescript
// components/ui/switch.tsx
"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      `peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
       border-2 border-transparent
       transition-colors
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
       disabled:cursor-not-allowed disabled:opacity-50
       data-[state=checked]:bg-primary data-[state=unchecked]:bg-input`,
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        `pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0
         transition-transform
         data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0`
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
```

### Switch with Label

```typescript
// components/ui/switch-field.tsx
import * as React from "react";
import { Switch } from "./switch";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface SwitchFieldProps {
  id: string;
  label: React.ReactNode;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  labelPosition?: "left" | "right";
}

export function SwitchField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
  labelPosition = "right",
}: SwitchFieldProps) {
  const switchElement = (
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-describedby={description ? `${id}-description` : undefined}
    />
  );

  const labelElement = (
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
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        labelPosition === "left" && "flex-row-reverse justify-end",
        className
      )}
    >
      {switchElement}
      {labelElement}
    </div>
  );
}
```

## Variants

### Sizes

```tsx
// Small
<Switch className="h-5 w-9 [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4" />

// Default
<Switch className="h-6 w-11 [&>span]:h-5 [&>span]:w-5 [&>span]:data-[state=checked]:translate-x-5" />

// Large
<Switch className="h-7 w-14 [&>span]:h-6 [&>span]:w-6 [&>span]:data-[state=checked]:translate-x-7" />
```

### With Icons

```typescript
// components/ui/switch-with-icons.tsx
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const SwitchWithIcons = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      `peer relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full
       border-2 border-transparent transition-colors
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
       disabled:cursor-not-allowed disabled:opacity-50
       data-[state=checked]:bg-primary data-[state=unchecked]:bg-input`,
      className
    )}
    {...props}
    ref={ref}
  >
    {/* Icons */}
    <Sun className="absolute left-1.5 h-4 w-4 text-muted-foreground" />
    <Moon className="absolute right-1.5 h-4 w-4 text-primary-foreground" />
    
    <SwitchPrimitives.Thumb
      className={cn(
        `pointer-events-none block h-6 w-6 rounded-full bg-background shadow-lg ring-0
         transition-transform z-10
         data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0`
      )}
    />
  </SwitchPrimitives.Root>
));
```

## States

| State | Track | Thumb | Animation |
|-------|-------|-------|-----------|
| Off | input (gray) | left position | slide |
| Hover | input (darker) | left position | - |
| Focus | input + ring | left position | ring fade-in |
| On | primary | right position | slide |
| Disabled | muted | current position | - |

### State Transitions

```css
/* Thumb transition */
.switch-thumb {
  transition: transform 200ms ease;
}

/* Track transition */
.switch-track {
  transition: background-color 200ms ease;
}
```

## Accessibility

### Required ARIA Attributes

- `role="switch"`: Applied automatically by Radix
- `aria-checked`: "true" or "false" (managed by Radix)
- `aria-describedby`: Link to description text

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus the switch |
| `Space` | Toggle the switch |
| `Enter` | Toggle the switch |

### Screen Reader Announcements

- "Switch, on/off" when focused
- State change is announced

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-switch": "1.1.0"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Switch } from "@/components/ui/switch";

<Switch />
```

### With Label

```tsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>
```

### With SwitchField

```tsx
import { SwitchField } from "@/components/ui/switch-field";

<SwitchField
  id="notifications"
  label="Push Notifications"
  description="Receive push notifications on your device"
  checked={notifications}
  onCheckedChange={setNotifications}
/>
```

### Label on Left

```tsx
<SwitchField
  id="dark-mode"
  label="Dark Mode"
  labelPosition="left"
  checked={darkMode}
  onCheckedChange={setDarkMode}
/>
```

### Controlled

```tsx
const [isEnabled, setIsEnabled] = useState(false);

<Switch
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>

<p>Switch is {isEnabled ? "on" : "off"}</p>
```

### Settings List

```tsx
const settings = [
  { id: "email", label: "Email notifications", enabled: true },
  { id: "push", label: "Push notifications", enabled: false },
  { id: "sms", label: "SMS notifications", enabled: false },
];

<div className="space-y-4">
  {settings.map(setting => (
    <div
      key={setting.id}
      className="flex items-center justify-between py-3 border-b"
    >
      <Label htmlFor={setting.id}>{setting.label}</Label>
      <Switch
        id={setting.id}
        defaultChecked={setting.enabled}
        onCheckedChange={(checked) => updateSetting(setting.id, checked)}
      />
    </div>
  ))}
</div>
```

### With Loading State

```tsx
const [loading, setLoading] = useState(false);
const [enabled, setEnabled] = useState(false);

async function handleChange(checked: boolean) {
  setLoading(true);
  await saveSetting(checked);
  setEnabled(checked);
  setLoading(false);
}

<div className="flex items-center gap-2">
  <Switch
    checked={enabled}
    onCheckedChange={handleChange}
    disabled={loading}
  />
  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
</div>
```

## Anti-patterns

### Switch for Form Submission

```tsx
// Bad - switch for form that needs submit
<form>
  <Switch id="terms" />
  <Button type="submit">Submit</Button>
</form>

// Good - use checkbox for forms
<form>
  <Checkbox id="terms" />
  <Button type="submit">Submit</Button>
</form>
```

### Switch Without Immediate Effect

```tsx
// Bad - switch that doesn't apply immediately
<Switch id="save-later" />
<Button>Save Changes</Button>

// Good - switch for immediate effects
<Switch id="dark-mode" onCheckedChange={toggleDarkMode} />
```

## Related Skills

### Composes From
- [colors](../primitives/colors.md) - Switch colors
- [motion](../primitives/motion.md) - Transition timing

### Composes Into
- [settings-form](../organisms/settings-form.md) - Settings toggles
- [header](../organisms/header.md) - Theme toggle

### Related
- [input-checkbox](./input-checkbox.md) - For form submission

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix Switch
- Size variants and icon patterns
