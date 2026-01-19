---
id: a-interactive-tooltip
name: Tooltip
version: 2.0.0
layer: L1
category: interactive
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Accessible tooltips with Radix UI and customizable positioning
tags: [tooltip, hint, popover, hover, radix]
dependencies:
  "@radix-ui/react-tooltip": "^1.1.4"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Tooltip

## Overview

The Tooltip atom provides contextual information on hover or focus. Built on Radix UI Tooltip for accessibility, supports keyboard navigation, customizable positioning, and animations. Renders via portal for proper layering.

## When to Use

Use this skill when:
- Explaining icon-only buttons
- Providing additional context for truncated text
- Showing keyboard shortcuts
- Adding helpful hints without cluttering UI

## Implementation

```typescript
// components/ui/tooltip.tsx
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-tooltip overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```

```typescript
// components/ui/simple-tooltip.tsx
"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface SimpleTooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Trigger element */
  children: React.ReactNode;
  /** Tooltip position */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment along the side */
  align?: "start" | "center" | "end";
  /** Delay before showing (ms) */
  delayDuration?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
}

export function SimpleTooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 400,
  disabled = false,
}: SimpleTooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

```typescript
// components/ui/tooltip-with-shortcut.tsx
"use client";

import * as React from "react";
import { SimpleTooltip } from "./simple-tooltip";
import { cn } from "@/lib/utils";

interface TooltipWithShortcutProps {
  /** Main tooltip text */
  label: string;
  /** Keyboard shortcut keys */
  shortcut?: string[];
  /** Trigger element */
  children: React.ReactNode;
  /** Tooltip position */
  side?: "top" | "right" | "bottom" | "left";
}

export function TooltipWithShortcut({
  label,
  shortcut,
  children,
  side = "bottom",
}: TooltipWithShortcutProps) {
  return (
    <SimpleTooltip
      side={side}
      content={
        <span className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut && shortcut.length > 0 && (
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              {shortcut.map((key, index) => (
                <React.Fragment key={key}>
                  {index > 0 && <span className="text-muted-foreground/50">+</span>}
                  <span>{key}</span>
                </React.Fragment>
              ))}
            </kbd>
          )}
        </span>
      }
    >
      {children}
    </SimpleTooltip>
  );
}
```

```typescript
// components/ui/info-tooltip.tsx
"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { SimpleTooltip } from "./simple-tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Icon size */
  size?: "sm" | "md" | "lg";
  /** Icon color */
  variant?: "default" | "muted" | "warning";
  className?: string;
}

export function InfoTooltip({
  content,
  size = "sm",
  variant = "muted",
  className,
}: InfoTooltipProps) {
  const sizeStyles = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const variantStyles = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    warning: "text-yellow-500",
  };

  return (
    <SimpleTooltip content={content}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-full hover:bg-muted/50 p-0.5 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        aria-label="More information"
      >
        <Info className={cn(sizeStyles[size], variantStyles[variant])} />
      </button>
    </SimpleTooltip>
  );
}
```

### Key Implementation Notes

1. **TooltipProvider**: Wrap your app in `TooltipProvider` to share delay duration across all tooltips
2. **Portal Rendering**: Content renders in a portal for proper z-index layering above modals

## Variants

### Position Variants

```tsx
<SimpleTooltip content="Top" side="top">
  <Button>Hover me</Button>
</SimpleTooltip>

<SimpleTooltip content="Right" side="right">
  <Button>Hover me</Button>
</SimpleTooltip>

<SimpleTooltip content="Bottom" side="bottom">
  <Button>Hover me</Button>
</SimpleTooltip>

<SimpleTooltip content="Left" side="left">
  <Button>Hover me</Button>
</SimpleTooltip>
```

### Alignment Variants

```tsx
<SimpleTooltip content="Start aligned" side="bottom" align="start">
  <Button>Hover me</Button>
</SimpleTooltip>

<SimpleTooltip content="Center aligned" side="bottom" align="center">
  <Button>Hover me</Button>
</SimpleTooltip>

<SimpleTooltip content="End aligned" side="bottom" align="end">
  <Button>Hover me</Button>
</SimpleTooltip>
```

### With Keyboard Shortcut

```tsx
<TooltipWithShortcut label="Save" shortcut={["⌘", "S"]}>
  <Button>Save</Button>
</TooltipWithShortcut>
```

### Info Icon Tooltip

```tsx
<div className="flex items-center gap-1">
  <Label>Password</Label>
  <InfoTooltip content="Must be at least 8 characters with one number" />
</div>
```

## States

| State | Visibility | Animation | Delay |
|-------|------------|-----------|-------|
| Hidden | opacity-0 | - | - |
| Entering | opacity-1 | fade-in + zoom-in | 400ms (configurable) |
| Visible | opacity-1 | none | - |
| Exiting | opacity-0 | fade-out + zoom-out | 0ms |

## Accessibility

### Required ARIA Attributes

- Automatically handled by Radix UI
- `role="tooltip"` on content
- `aria-describedby` links trigger to content

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus trigger element |
| `Escape` | Close tooltip |
| Focus | Show tooltip (after delay) |
| Blur | Hide tooltip |

### Screen Reader Announcements

- Tooltip content announced when focused
- Trigger element maintains its semantic role
- Content read as description of trigger

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-tooltip": "^1.1.4",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install @radix-ui/react-tooltip lucide-react
```

## Examples

### Basic Usage

```tsx
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { Button } from "@/components/ui/button";

export function IconButton() {
  return (
    <SimpleTooltip content="Delete item">
      <Button variant="ghost" size="icon">
        <Trash className="h-4 w-4" />
      </Button>
    </SimpleTooltip>
  );
}
```

### Toolbar with Tooltips

```tsx
import { TooltipWithShortcut } from "@/components/ui/tooltip-with-shortcut";
import { TooltipProvider } from "@/components/ui/tooltip";

export function EditorToolbar() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-1">
        <TooltipWithShortcut label="Bold" shortcut={["⌘", "B"]}>
          <Button variant="ghost" size="icon">
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipWithShortcut>
        
        <TooltipWithShortcut label="Italic" shortcut={["⌘", "I"]}>
          <Button variant="ghost" size="icon">
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipWithShortcut>
        
        <TooltipWithShortcut label="Underline" shortcut={["⌘", "U"]}>
          <Button variant="ghost" size="icon">
            <Underline className="h-4 w-4" />
          </Button>
        </TooltipWithShortcut>
      </div>
    </TooltipProvider>
  );
}
```

### Form Field with Info

```tsx
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function PasswordField() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="password">Password</Label>
        <InfoTooltip
          content={
            <ul className="text-xs space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          }
        />
      </div>
      <Input id="password" type="password" />
    </div>
  );
}
```

### Truncated Text with Tooltip

```tsx
import { SimpleTooltip } from "@/components/ui/simple-tooltip";

interface TruncatedTextProps {
  text: string;
  maxWidth?: string;
}

export function TruncatedText({ text, maxWidth = "200px" }: TruncatedTextProps) {
  return (
    <SimpleTooltip content={text} delayDuration={500}>
      <span
        className="block truncate"
        style={{ maxWidth }}
      >
        {text}
      </span>
    </SimpleTooltip>
  );
}
```

### Disabled State Explanation

```tsx
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { Button } from "@/components/ui/button";

export function DisabledButton({ canSubmit }: { canSubmit: boolean }) {
  const button = (
    <Button disabled={!canSubmit}>
      Submit
    </Button>
  );

  if (!canSubmit) {
    return (
      <SimpleTooltip content="Please fill in all required fields">
        <span tabIndex={0}>{button}</span>
      </SimpleTooltip>
    );
  }

  return button;
}
```

## Anti-patterns

### Tooltip for Essential Information

```tsx
// Bad - critical info hidden in tooltip
<SimpleTooltip content="Required field">
  <Input placeholder="Email" />
</SimpleTooltip>

// Good - show required indicator inline
<div>
  <Label>Email <span className="text-destructive">*</span></Label>
  <Input placeholder="Email" />
</div>
```

### Tooltip on Touch-Only Elements

```tsx
// Bad - tooltips don't work well on touch devices
<SimpleTooltip content="Delete">
  <button className="touch-only-button">
    <Trash />
  </button>
</SimpleTooltip>

// Good - use visible labels on touch devices
<button className="flex items-center gap-2">
  <Trash className="h-4 w-4" />
  <span className="sm:hidden">Delete</span> {/* Show on mobile */}
</button>
```

### Interactive Content in Tooltip

```tsx
// Bad - buttons inside tooltip aren't accessible
<SimpleTooltip content={<Button onClick={handleClick}>Click me</Button>}>
  <span>Hover</span>
</SimpleTooltip>

// Good - use popover for interactive content
<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>
    <Button onClick={handleClick}>Click me</Button>
  </PopoverContent>
</Popover>
```

### Very Long Tooltip Content

```tsx
// Bad - too much content for a tooltip
<SimpleTooltip content="This is a very long explanation that goes on and on...">
  <span>?</span>
</SimpleTooltip>

// Good - use popover or dialog for long content
<InfoPopover title="Help">
  <p>This is a detailed explanation...</p>
</InfoPopover>
```

## Related Skills

### Composes From
- [primitives/z-index](../primitives/z-index.md) - Layering
- [primitives/motion](../primitives/motion.md) - Animation timing

### Composes Into
- [input-button](./input-button.md) - Icon button descriptions
- [molecules/nav-link](../molecules/nav-link.md) - Navigation hints
- [organisms/data-table](../organisms/data-table.md) - Column explanations

### Alternatives
- [organisms/popover](../organisms/popover.md) - For interactive content
- [feedback-toast](./feedback-toast.md) - For temporary messages

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation with Radix UI Tooltip
- SimpleTooltip wrapper component
- TooltipWithShortcut for keyboard shortcuts
- InfoTooltip for form field hints
