---
id: o-drawer
name: Drawer
version: 2.0.0
layer: L3
category: overlays
description: Bottom sheet drawer for mobile-first modal interactions
tags: [drawer, bottom-sheet, mobile, modal, sheet, touch]
formula: "Drawer = Button(a-button) + Separator(a-separator) + DrawerContent + DrawerOverlay"
composes: []
dependencies: [vaul, lucide-react]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Drawer

## Overview

The Drawer organism provides mobile-friendly bottom sheet modals with drag-to-dismiss, snap points, and nested drawer support. Built on Vaul for smooth touch interactions and accessibility.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Drawer (o-drawer)                                      │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │  DrawerOverlay                                    │  │
│  │  (bg-black/80, fixed inset-0)                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  DrawerContent                                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Handle (drag indicator)                    │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  DrawerHeader                               │  │  │
│  │  │  ├── DrawerTitle                            │  │  │
│  │  │  └── DrawerDescription                      │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Content Area                               │  │  │
│  │  │  └── Separator (a-separator)                │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  DrawerFooter                               │  │  │
│  │  │  ├── Button (a-button) [primary]            │  │  │
│  │  │  └── Button (a-button) [cancel]             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## When to Use

Use this skill when:
- Building mobile-first modals
- Creating action menus on mobile
- Displaying contextual content
- Building touch-friendly interfaces

## Molecules Used

- [button](../atoms/button.md) - Action buttons
- [separator](../atoms/separator.md) - Content dividers

## Implementation

```typescript
// components/organisms/drawer.tsx
"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    showHandle?: boolean;
  }
>(({ className, children, showHandle = true, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      {showHandle && (
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      )}
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

// Action Sheet Component
interface ActionSheetAction {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface ActionSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
  trigger?: React.ReactNode;
}

function ActionSheet({
  open,
  onOpenChange,
  title,
  description,
  actions,
  cancelLabel = "Cancel",
  trigger,
}: ActionSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        {(title || description) && (
          <DrawerHeader>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <div className="px-4 pb-4 space-y-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onOpenChange?.(false);
              }}
              disabled={action.disabled}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                "hover:bg-muted focus:bg-muted focus:outline-none",
                action.destructive && "text-destructive hover:bg-destructive/10",
                action.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {action.icon && (
                <span className="flex-shrink-0">{action.icon}</span>
              )}
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <button className="w-full rounded-lg bg-muted px-4 py-3 font-medium hover:bg-muted/80 transition-colors">
              {cancelLabel}
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Select Drawer Component
interface SelectDrawerOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  options: SelectDrawerOption[];
  value?: string;
  onSelect: (value: string) => void;
  trigger?: React.ReactNode;
}

function SelectDrawer({
  open,
  onOpenChange,
  title,
  description,
  options,
  value,
  onSelect,
  trigger,
}: SelectDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-4 pb-4 max-h-[60vh] overflow-auto">
          <div className="space-y-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange?.(false);
                }}
                disabled={option.disabled}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                  "hover:bg-muted focus:bg-muted focus:outline-none",
                  value === option.value && "bg-primary/10",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {option.icon && (
                  <span className="flex-shrink-0">{option.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{option.label}</p>
                  {option.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {option.description}
                    </p>
                  )}
                </div>
                {value === option.value && (
                  <span className="flex-shrink-0 text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Confirm Drawer Component
interface ConfirmDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  trigger?: React.ReactNode;
}

function ConfirmDrawer({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
  isLoading = false,
  trigger,
}: ConfirmDrawerProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "w-full rounded-lg px-4 py-3 font-medium transition-colors",
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? "Loading..." : confirmLabel}
          </button>
          <DrawerClose asChild>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full rounded-lg bg-muted px-4 py-3 font-medium hover:bg-muted/80 transition-colors"
            >
              {cancelLabel}
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Nested Drawer Component
interface NestedDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  children: React.ReactNode;
}

function NestedDrawer({
  open,
  onOpenChange,
  trigger,
  children,
}: NestedDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} nested>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
}

// Snap Points Drawer
interface SnapDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  snapPoints?: (string | number)[];
  activeSnapPoint?: string | number | null;
  setActiveSnapPoint?: (point: string | number | null) => void;
  trigger?: React.ReactNode;
  children: React.ReactNode;
}

function SnapDrawer({
  open,
  onOpenChange,
  snapPoints = ["148px", "355px", 1],
  activeSnapPoint,
  setActiveSnapPoint,
  trigger,
  children,
}: SnapDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
    >
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="h-full max-h-[96%]">
        {children}
      </DrawerContent>
    </Drawer>
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  ActionSheet,
  SelectDrawer,
  ConfirmDrawer,
  NestedDrawer,
  SnapDrawer,
};
```

### Key Implementation Notes

1. **Vaul Base**: Built on Vaul for native touch feel
2. **Snap Points**: Multiple height positions
3. **Nested Support**: Drawers within drawers
4. **Background Scale**: iOS-like background effect

## Variants

### Basic Drawer

```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerTrigger asChild>
    <Button>Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Drawer description</DrawerDescription>
    </DrawerHeader>
    <div className="p-4">
      {/* Content */}
    </div>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

### Action Sheet

```tsx
<ActionSheet
  title="Post Options"
  description="What would you like to do?"
  actions={[
    { label: "Edit Post", onClick: handleEdit, icon: <Edit className="h-5 w-5" /> },
    { label: "Share", onClick: handleShare, icon: <Share className="h-5 w-5" /> },
    { label: "Delete", onClick: handleDelete, destructive: true, icon: <Trash className="h-5 w-5" /> },
  ]}
  trigger={<Button variant="ghost" size="icon"><MoreVertical /></Button>}
/>
```

### Select Drawer

```tsx
<SelectDrawer
  title="Select Theme"
  options={[
    { value: "light", label: "Light", description: "Light mode" },
    { value: "dark", label: "Dark", description: "Dark mode" },
    { value: "system", label: "System", description: "Follow system" },
  ]}
  value={theme}
  onSelect={setTheme}
  trigger={<Button variant="outline">{theme}</Button>}
/>
```

### Confirm Drawer

```tsx
<ConfirmDrawer
  title="Delete Post?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  destructive
  onConfirm={handleDelete}
  trigger={<Button variant="destructive">Delete</Button>}
/>
```

### Snap Points

```tsx
function MapDrawer() {
  const [snap, setSnap] = React.useState<string | number | null>("148px");

  return (
    <SnapDrawer
      snapPoints={["148px", "355px", 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerHeader>
        <DrawerTitle>Nearby Places</DrawerTitle>
      </DrawerHeader>
      <div className="p-4 overflow-auto">
        {/* List of places */}
      </div>
    </SnapDrawer>
  );
}
```

### Nested Drawer

```tsx
<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Main Drawer</DrawerTitle>
    </DrawerHeader>
    <NestedDrawer trigger={<Button>Open Nested</Button>}>
      <DrawerHeader>
        <DrawerTitle>Nested Drawer</DrawerTitle>
      </DrawerHeader>
      {/* Nested content */}
    </NestedDrawer>
  </DrawerContent>
</Drawer>
```

## Performance

### Touch Handling

- Native-like velocity tracking
- Smooth spring animations
- 60fps drag interactions

### Rendering

- Portal rendering for z-index
- Lazy content mounting
- GPU-accelerated transforms

## Accessibility

### Required Attributes

- Drawer has role="dialog"
- Title linked via aria-labelledby
- Description via aria-describedby

### Screen Reader

- Announces when opened/closed
- Content is focusable
- Actions are labeled

### Keyboard Navigation

- Escape closes drawer
- Tab cycles through content
- Focus trapped within drawer

### Touch Gestures

- Drag handle for dismissal
- Snap points for partial open
- Overscroll handling

## Dependencies

```json
{
  "dependencies": {
    "vaul": "^0.9.0",
    "lucide-react": "^0.460.0"
  }
}
```

## Props API

### Drawer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Open state change handler |
| `shouldScaleBackground` | `boolean` | `true` | Scale background on open (iOS style) |
| `nested` | `boolean` | `false` | Enable nested drawer support |
| `snapPoints` | `(string \| number)[]` | `undefined` | Snap point heights |
| `activeSnapPoint` | `string \| number \| null` | `undefined` | Current snap point |
| `setActiveSnapPoint` | `(point) => void` | `undefined` | Snap point change handler |

### DrawerContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showHandle` | `boolean` | `true` | Show drag handle indicator |
| `className` | `string` | `undefined` | Additional CSS classes |

### ActionSheet

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Open change handler |
| `title` | `string` | `undefined` | Sheet title |
| `description` | `string` | `undefined` | Sheet description |
| `actions` | `ActionSheetAction[]` | Required | Action items |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |
| `trigger` | `ReactNode` | `undefined` | Trigger element |

### SelectDrawer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Open change handler |
| `title` | `string` | Required | Drawer title |
| `description` | `string` | `undefined` | Drawer description |
| `options` | `SelectDrawerOption[]` | Required | Selectable options |
| `value` | `string` | `undefined` | Current selected value |
| `onSelect` | `(value: string) => void` | Required | Selection handler |
| `trigger` | `ReactNode` | `undefined` | Trigger element |

### ConfirmDrawer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Open change handler |
| `title` | `string` | Required | Confirmation title |
| `description` | `string` | Required | Confirmation description |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |
| `destructive` | `boolean` | `false` | Use destructive styling |
| `onConfirm` | `() => void` | Required | Confirm handler |
| `onCancel` | `() => void` | `undefined` | Cancel handler |
| `isLoading` | `boolean` | `false` | Loading state |
| `trigger` | `ReactNode` | `undefined` | Trigger element |

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Drawer not visible | Content below viewport |
| Opening | Animation in | Slides up from bottom |
| Open | Fully visible | Content visible, overlay shown |
| Dragging | User dragging | Content follows finger/cursor |
| Snap Point | At snap position | Content at defined height |
| Closing | Animation out | Slides down, fades out |
| Nested Open | Nested drawer visible | Parent drawer scales down |
| Loading | Confirm in progress | Spinner on confirm button |
| Destructive | Delete action | Red confirm button |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Cycle through focusable elements |
| `Shift + Tab` | Cycle backwards |
| `Escape` | Close drawer |
| `Enter` | Activate focused button/option |
| `Space` | Activate focused button/option |
| `Arrow Down` | Navigate to next option (in SelectDrawer) |
| `Arrow Up` | Navigate to previous option (in SelectDrawer) |

## Screen Reader Announcements

- Drawer announced with `role="dialog"`
- Title linked via `aria-labelledby` to DrawerTitle
- Description linked via `aria-describedby` to DrawerDescription
- Drag handle not announced (decorative)
- Action items in ActionSheet announced as buttons
- SelectDrawer options announced with selected state
- Current selection indicated with checkmark announced
- Close/Cancel buttons clearly labeled
- Destructive actions announced with their styling context
- Loading states announced via button text

## Anti-patterns

### 1. No Close Method on Mobile
```tsx
// Bad - no way to close without gesture
<Drawer open={open}>
  <DrawerContent showHandle={false}>
    <p>Trapped content</p>
  </DrawerContent>
</Drawer>

// Good - always provide close button or handle
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Content</DrawerTitle>
    </DrawerHeader>
    <DrawerFooter>
      <DrawerClose asChild>
        <Button variant="outline">Close</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

### 2. Too Many Actions in ActionSheet
```tsx
// Bad - overwhelming number of options
<ActionSheet
  actions={[
    /* 10+ actions */
  ]}
/>

// Good - limit actions, use nested navigation for more
<ActionSheet
  actions={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Share', onClick: handleShare },
    { label: 'More...', onClick: openMoreOptions },
  ]}
/>
```

### 3. Critical Actions Without Confirmation
```tsx
// Bad - destructive action without confirmation
<ActionSheet
  actions={[
    { label: 'Delete', onClick: deleteItem, destructive: true }
  ]}
/>

// Good - use ConfirmDrawer for destructive actions
<ConfirmDrawer
  title="Delete Item?"
  description="This action cannot be undone."
  destructive
  onConfirm={deleteItem}
  trigger={<Button variant="destructive">Delete</Button>}
/>
```

### 4. Missing Snap Points for Long Content
```tsx
// Bad - long content without partial reveal
<Drawer>
  <DrawerContent>
    {/* Very long scrollable content */}
  </DrawerContent>
</Drawer>

// Good - use snap points for progressive disclosure
<SnapDrawer
  snapPoints={['200px', '400px', 1]}
  activeSnapPoint={snap}
  setActiveSnapPoint={setSnap}
>
  <DrawerContent className="h-full max-h-[96%]">
    {/* Content */}
  </DrawerContent>
</SnapDrawer>
```

## Related Skills

### Composes Into
- [templates/mobile-layout](../templates/mobile-layout.md)
- [organisms/cart](./cart.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Action sheet, select, and confirm variants
- Snap points support
- Nested drawer support
