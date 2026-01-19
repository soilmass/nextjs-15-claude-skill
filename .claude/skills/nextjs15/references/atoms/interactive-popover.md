---
id: a-interactive-popover
name: Interactive Popover
version: 2.0.0
layer: L1
category: interactive
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Basic popover trigger component for floating content
tags: [popover, dropdown, floating, overlay, trigger, radix]
performance:
  impact: low
  lcp: neutral
  cls: neutral
dependencies:
  - react
  - "@radix-ui/react-popover"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Interactive Popover

## Overview

A basic popover component that displays floating content relative to a trigger element. Built on Radix UI for accessibility and positioning. Used as a building block for dropdowns, tooltips, and floating panels.

## Implementation

```tsx
// components/ui/popover.tsx
'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverClose = PopoverPrimitive.Close;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// Arrow component
const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn('fill-popover', className)}
    {...props}
  />
));
PopoverArrow.displayName = 'PopoverArrow';

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  PopoverArrow,
};
```

## Variants

### Basic Popover

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

function BasicPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>This is the popover content.</p>
      </PopoverContent>
    </Popover>
  );
}
```

### With Arrow

```tsx
function PopoverWithArrow() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">With Arrow</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <p>Content with an arrow pointer.</p>
      </PopoverContent>
    </Popover>
  );
}
```

### Controlled Popover

```tsx
'use client';

import * as React from 'react';

function ControlledPopover() {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {open ? 'Close' : 'Open'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>Controlled popover content</p>
        <Button
          size="sm"
          className="mt-2"
          onClick={() => setOpen(false)}
        >
          Close
        </Button>
      </PopoverContent>
    </Popover>
  );
}
```

### Different Alignments

```tsx
function AlignmentExample() {
  return (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Start</Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <p>Aligned to start</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Center</Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <p>Aligned to center</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align End</Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <p>Aligned to end</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### Different Sides

```tsx
function SideExample() {
  return (
    <div className="flex gap-4 p-20">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <p>Opens on top</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Right</Button>
        </PopoverTrigger>
        <PopoverContent side="right">
          <p>Opens on right</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <p>Opens on bottom</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Left</Button>
        </PopoverTrigger>
        <PopoverContent side="left">
          <p>Opens on left</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### Form in Popover

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function FormPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### User Menu Popover

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Settings, User, LogOut } from 'lucide-react';

function UserMenuPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar.jpg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="flex items-center gap-2 pb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatar.jpg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">john@example.com</p>
          </div>
        </div>
        <div className="border-t pt-2">
          <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
            <User className="h-4 w-4" />
            Profile
          </button>
          <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <div className="border-t my-1" />
          <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### With Close Button

```tsx
import { X } from 'lucide-react';

function PopoverWithClose() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent className="relative">
        <PopoverClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </PopoverClose>
        <div className="pr-6">
          <h4 className="font-medium">Popover Title</h4>
          <p className="text-sm text-muted-foreground mt-2">
            This popover has a close button in the corner.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Custom Width

```tsx
function WidePopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Wide Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <p>This popover is wider than the default.</p>
      </PopoverContent>
    </Popover>
  );
}
```

## Dependencies

```bash
npm install @radix-ui/react-popover
```

## Accessibility

- Keyboard navigation (Escape to close)
- Focus management (traps focus when open)
- Screen reader announcements
- Proper ARIA attributes
- Click outside to close

## Related Skills

- [interactive-tooltip](./interactive-tooltip.md) - Simpler hover-based popover
- [interactive-dropdown-trigger](./interactive-dropdown-trigger.md) - Menu dropdown
- [dialog](../organisms/dialog.md) - Modal dialog
- [sheet](../organisms/sheet.md) - Slide-in panel

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation with Radix UI
- Alignment and side options
- Animation support
- Arrow component
