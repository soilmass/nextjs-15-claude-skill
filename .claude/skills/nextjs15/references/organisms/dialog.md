---
id: o-dialog
name: Dialog
version: 2.0.0
layer: L3
category: overlays
description: Modal dialog for alerts, confirmations, and complex interactions
tags: [dialog, modal, popup, alert, confirm, overlay]
formula: "Dialog = Card(m-card) + Button(a-button) + Input(a-input)"
composes:
  - ../molecules/card.md
dependencies: ["@radix-ui/react-dialog", framer-motion, lucide-react]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Dialog

## Overview

The Dialog organism provides accessible modal dialogs for alerts, confirmations, and complex form interactions. Built on Radix UI Dialog with custom animations, focus management, and escape handling.

## When to Use

Use this skill when:
- Displaying confirmation prompts
- Showing important alerts
- Building modal forms
- Creating image/content galleries

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Dialog (L3)                                │
├─────────────────────────────────────────────────────────────────────┤
│  DialogOverlay (backdrop)                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    DialogContent                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  DialogHeader                                           │  │  │
│  │  │  DialogTitle + DialogDescription          [X] Close     │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  {children} - Content Area                              │  │  │
│  │  │  Card(m-card) structure for forms                       │  │  │
│  │  │  Input(a-input)[] for form fields                       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  DialogFooter                                           │  │  │
│  │  │  Button(a-button)[Cancel] + Button(a-button)[Confirm]   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

AlertDialog Variant:
┌─────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    DialogContent (sm)                         │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  [Icon: Info/Warning/Error/Success]                     │  │  │
│  │  │  DialogTitle (centered)                                 │  │  │
│  │  │  DialogDescription (centered)                           │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  DialogFooter (centered)                                │  │  │
│  │  │  Button(a-button)[Cancel] + Button(a-button)[Confirm]   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [button](../atoms/button.md) - Action buttons
- [input](../atoms/input.md) - Form inputs
- [card](../molecules/card.md) - Content structure

## Implementation

```typescript
// components/organisms/dialog.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Base Dialog Components
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showClose?: boolean;
    size?: "sm" | "md" | "lg" | "xl" | "full";
  }
>(({ className, children, showClose = true, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] h-[95vh]",
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          sizeClasses[size],
          size === "full" && "overflow-auto",
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Alert Dialog Component
interface AlertDialogProps {
  /** Dialog open state */
  open?: boolean;
  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
  /** Alert type */
  type?: "info" | "warning" | "error" | "success";
  /** Alert title */
  title: string;
  /** Alert description */
  description: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Confirm handler */
  onConfirm?: () => void;
  /** Cancel handler */
  onCancel?: () => void;
  /** Is loading */
  isLoading?: boolean;
  /** Destructive action */
  destructive?: boolean;
  /** Trigger element */
  trigger?: React.ReactNode;
}

const alertIcons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

const alertColors = {
  info: "text-blue-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  success: "text-green-500",
};

function AlertDialog({
  open,
  onOpenChange,
  type = "info",
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  destructive = false,
  trigger,
}: AlertDialogProps) {
  const Icon = alertIcons[type];

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent showClose={false} size="sm">
        <DialogHeader className="sm:text-center">
          <div className="mx-auto mb-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                type === "info" && "bg-blue-100 dark:bg-blue-900",
                type === "warning" && "bg-yellow-100 dark:bg-yellow-900",
                type === "error" && "bg-red-100 dark:bg-red-900",
                type === "success" && "bg-green-100 dark:bg-green-900"
              )}
            >
              <Icon className={cn("h-6 w-6", alertColors[type])} />
            </div>
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Confirm Dialog Hook
interface UseConfirmDialogOptions {
  title: string;
  description: string;
  type?: "info" | "warning" | "error" | "success";
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

function useConfirmDialog() {
  const [state, setState] = React.useState<{
    isOpen: boolean;
    options: UseConfirmDialogOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = React.useCallback(
    (options: UseConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          isOpen: true,
          options,
          resolve,
        });
      });
    },
    []
  );

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state.resolve]);

  const handleCancel = React.useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state.resolve]);

  const ConfirmDialog = React.useCallback(
    () =>
      state.options ? (
        <AlertDialog
          open={state.isOpen}
          onOpenChange={(open) => {
            if (!open) handleCancel();
          }}
          {...state.options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ) : null,
    [state.isOpen, state.options, handleConfirm, handleCancel]
  );

  return { confirm, ConfirmDialog };
}

// Form Dialog Component
interface FormDialogProps<T> {
  /** Dialog open state */
  open?: boolean;
  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description?: string;
  /** Form content */
  children: React.ReactNode;
  /** Submit handler */
  onSubmit: (data: T) => Promise<void>;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Is submitting */
  isSubmitting?: boolean;
  /** Dialog size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Trigger element */
  trigger?: React.ReactNode;
}

function FormDialog<T>({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting = false,
  size = "md",
  trigger,
}: FormDialogProps<T>) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as T;
    await onSubmit(data);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent size={size}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4">{children}</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
              )}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Image/Gallery Dialog
interface ImageDialogProps {
  /** Dialog open state */
  open?: boolean;
  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
  /** Image source */
  src: string;
  /** Image alt text */
  alt: string;
  /** Image title */
  title?: string;
  /** Image description */
  description?: string;
  /** Trigger element */
  trigger?: React.ReactNode;
}

function ImageDialog({
  open,
  onOpenChange,
  src,
  alt,
  title,
  description,
  trigger,
}: ImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent size="xl" className="p-0 overflow-hidden">
        <div className="relative aspect-video">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain bg-black"
          />
        </div>
        {(title || description) && (
          <div className="p-4">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  FormDialog,
  ImageDialog,
  useConfirmDialog,
};
```

### Key Implementation Notes

1. **Radix UI Base**: Built on accessible Radix Dialog
2. **Multiple Variants**: Alert, form, and image dialogs
3. **Confirm Hook**: Promise-based confirmation pattern
4. **Focus Management**: Automatic focus trap and restore

## Variants

### Basic Dialog

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a description of the dialog content.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Alert Dialog

```tsx
<AlertDialog
  open={showAlert}
  onOpenChange={setShowAlert}
  type="warning"
  title="Delete Item?"
  description="This action cannot be undone. This will permanently delete the item."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  destructive
  onConfirm={() => deleteItem()}
/>
```

### Confirm Hook

```tsx
function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete User?",
      description: "This will remove all user data.",
      type: "error",
      destructive: true,
    });

    if (confirmed) {
      await deleteUser();
    }
  };

  return (
    <>
      <Button onClick={handleDelete}>Delete</Button>
      <ConfirmDialog />
    </>
  );
}
```

### Form Dialog

```tsx
<FormDialog
  open={showForm}
  onOpenChange={setShowForm}
  title="Create Project"
  description="Add a new project to your workspace"
  onSubmit={async (data) => {
    await createProject(data);
  }}
  submitLabel="Create"
>
  <div className="space-y-4">
    <Input name="name" placeholder="Project name" required />
    <Textarea name="description" placeholder="Description" />
  </div>
</FormDialog>
```

### Image Dialog

```tsx
<ImageDialog
  src="/images/large-photo.jpg"
  alt="Photo description"
  title="Photo Title"
  description="Taken on January 15, 2025"
  trigger={
    <img
      src="/images/thumbnail.jpg"
      alt="Thumbnail"
      className="cursor-pointer hover:opacity-80"
    />
  }
/>
```

## Performance

### Lazy Loading

- Dialog content mounts on open
- Images load when dialog opens
- Forms initialize on demand

### Animation

- CSS animations for performance
- Optional Framer Motion integration
- Reduce motion support

## Accessibility

### Required Attributes

- Dialog has proper ARIA attributes
- Title and description linked
- Close button labeled

### Screen Reader

- Focus moves to dialog on open
- Content announced
- Dismissal announced

### Keyboard Navigation

- Tab cycles through content
- Escape closes dialog
- Focus trapped within dialog
- Focus returns on close

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## Props API

### Dialog (Primitive)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Open state change handler |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `modal` | `boolean` | `true` | Whether to render as modal |

### DialogContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showClose` | `boolean` | `true` | Show close button |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Dialog size |
| `className` | `string` | `undefined` | Additional CSS classes |

### AlertDialog

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Open change handler |
| `type` | `'info' \| 'warning' \| 'error' \| 'success'` | `'info'` | Alert type |
| `title` | `string` | Required | Alert title |
| `description` | `string` | Required | Alert description |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |
| `onConfirm` | `() => void` | `undefined` | Confirm handler |
| `onCancel` | `() => void` | `undefined` | Cancel handler |
| `isLoading` | `boolean` | `false` | Loading state |
| `destructive` | `boolean` | `false` | Use destructive styling |
| `trigger` | `ReactNode` | `undefined` | Trigger element |

### FormDialog

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Open change handler |
| `title` | `string` | Required | Dialog title |
| `description` | `string` | `undefined` | Dialog description |
| `children` | `ReactNode` | Required | Form content |
| `onSubmit` | `(data: T) => Promise<void>` | Required | Form submit handler |
| `submitLabel` | `string` | `'Save'` | Submit button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |
| `isSubmitting` | `boolean` | `false` | Submitting state |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Dialog size |
| `trigger` | `ReactNode` | `undefined` | Trigger element |

### ImageDialog

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Open change handler |
| `src` | `string` | Required | Image source URL |
| `alt` | `string` | Required | Image alt text |
| `title` | `string` | `undefined` | Image title |
| `description` | `string` | `undefined` | Image description |
| `trigger` | `ReactNode` | `undefined` | Trigger element |

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Dialog not visible | No overlay or content |
| Opening | Animation in | Fade in + zoom in from 95% |
| Open | Fully visible | Overlay visible, content centered |
| Closing | Animation out | Fade out + zoom out to 95% |
| Loading | Form submitting | Spinner on submit button, buttons disabled |
| Alert Info | Info type alert | Blue icon background |
| Alert Warning | Warning type alert | Yellow icon background |
| Alert Error | Error type alert | Red icon background |
| Alert Success | Success type alert | Green icon background |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Cycle through focusable elements within dialog |
| `Shift + Tab` | Cycle backwards through focusable elements |
| `Escape` | Close dialog |
| `Enter` | Submit form (in FormDialog), activate focused button |
| `Space` | Activate focused button |

## Screen Reader Announcements

- Dialog announced with `role="dialog"` and `aria-modal="true"`
- Title linked via `aria-labelledby` to DialogTitle
- Description linked via `aria-describedby` to DialogDescription
- Close button has `aria-label="Close"` with sr-only text
- Focus automatically moves to dialog content on open
- Focus returns to trigger element on close
- Alert icons have descriptive alt text based on type
- Form validation errors announced
- Loading state announced via button text change

## Anti-patterns

### 1. Missing Title for Accessibility
```tsx
// Bad - no title, screen readers can't identify dialog
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <p>Are you sure?</p>
  </DialogContent>
</Dialog>

// Good - proper title for accessibility
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>Are you sure you want to proceed?</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### 2. Destructive Action Without Confirmation
```tsx
// Bad - immediate destructive action
<Button onClick={deleteAllData}>Delete Everything</Button>

// Good - use AlertDialog for confirmation
<AlertDialog
  type="error"
  title="Delete All Data?"
  description="This will permanently delete all your data. This action cannot be undone."
  destructive
  onConfirm={deleteAllData}
  trigger={<Button variant="destructive">Delete Everything</Button>}
/>
```

### 3. Nested Dialogs
```tsx
// Bad - dialog inside dialog causes focus issues
<Dialog>
  <DialogContent>
    <Dialog> {/* Nested dialog */}
      <DialogContent>...</DialogContent>
    </Dialog>
  </DialogContent>
</Dialog>

// Good - use sequential dialogs or sheets
const [step, setStep] = useState(1);
<Dialog open={step === 1}>...</Dialog>
<Dialog open={step === 2}>...</Dialog>
```

### 4. Long Forms Without Scroll
```tsx
// Bad - form overflows viewport
<FormDialog size="sm" title="Settings">
  {/* 20+ form fields */}
</FormDialog>

// Good - use larger size or scrollable content
<FormDialog size="lg" title="Settings">
  <div className="max-h-[60vh] overflow-auto">
    {/* Form fields */}
  </div>
</FormDialog>
```

## Related Skills

### Composes Into
- [organisms/command-palette](./command-palette.md)
- [templates/admin-layout](../templates/admin-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Alert, form, and image variants
- useConfirmDialog hook
- Size options
