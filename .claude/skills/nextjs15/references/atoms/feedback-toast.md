---
id: a-feedback-toast
name: Toast Notification
version: 2.0.0
layer: L1
category: feedback
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Toast notifications using Sonner with variants and actions
tags: [toast, notification, sonner, alert, snackbar]
dependencies:
  sonner: "^1.7.0"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Toast Notification

## Overview

The Toast atom provides non-blocking notifications for user feedback using Sonner. Supports multiple variants, action buttons, custom durations, and automatic stacking. Renders via portal for proper z-index layering.

## When to Use

Use this skill when:
- Confirming successful actions (save, submit, delete)
- Showing error messages that don't require immediate attention
- Displaying informational messages or updates
- Providing undo functionality for reversible actions

## Implementation

```typescript
// components/ui/sonner.tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 dark:group-[.toaster]:bg-green-950 dark:group-[.toaster]:text-green-100 dark:group-[.toaster]:border-green-800",
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 dark:group-[.toaster]:bg-red-950 dark:group-[.toaster]:text-red-100 dark:group-[.toaster]:border-red-800",
          warning:
            "group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200 dark:group-[.toaster]:bg-yellow-950 dark:group-[.toaster]:text-yellow-100 dark:group-[.toaster]:border-yellow-800",
          info:
            "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-950 dark:group-[.toaster]:text-blue-100 dark:group-[.toaster]:border-blue-800",
        },
      }}
      {...props}
    />
  );
}
```

```typescript
// lib/toast.ts
import { toast as sonnerToast, ExternalToast } from "sonner";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface ToastOptions extends ExternalToast {
  variant?: ToastVariant;
}

export function toast(message: string, options?: ToastOptions) {
  const { variant = "default", ...rest } = options ?? {};

  switch (variant) {
    case "success":
      return sonnerToast.success(message, rest);
    case "error":
      return sonnerToast.error(message, rest);
    case "warning":
      return sonnerToast.warning(message, rest);
    case "info":
      return sonnerToast.info(message, rest);
    default:
      return sonnerToast(message, rest);
  }
}

// Convenience methods
toast.success = (message: string, options?: ExternalToast) =>
  sonnerToast.success(message, options);

toast.error = (message: string, options?: ExternalToast) =>
  sonnerToast.error(message, options);

toast.warning = (message: string, options?: ExternalToast) =>
  sonnerToast.warning(message, options);

toast.info = (message: string, options?: ExternalToast) =>
  sonnerToast.info(message, options);

toast.loading = (message: string, options?: ExternalToast) =>
  sonnerToast.loading(message, options);

toast.promise = sonnerToast.promise;

toast.dismiss = sonnerToast.dismiss;

toast.custom = sonnerToast.custom;

export { toast };
```

```typescript
// Usage in app/layout.tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
```

```typescript
// components/ui/toast-action.tsx
"use client";

import { toast } from "@/lib/toast";

interface ToastWithActionOptions {
  message: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  duration?: number;
}

export function toastWithAction({
  message,
  description,
  actionLabel,
  onAction,
  cancelLabel = "Dismiss",
  onCancel,
  duration = 5000,
}: ToastWithActionOptions) {
  return toast(message, {
    description,
    duration,
    action: {
      label: actionLabel,
      onClick: onAction,
    },
    cancel: onCancel
      ? {
          label: cancelLabel,
          onClick: onCancel,
        }
      : undefined,
  });
}

// Undo pattern
export function toastWithUndo({
  message,
  onUndo,
  duration = 5000,
}: {
  message: string;
  onUndo: () => void;
  duration?: number;
}) {
  return toast.success(message, {
    duration,
    action: {
      label: "Undo",
      onClick: onUndo,
    },
  });
}
```

### Key Implementation Notes

1. **Theme Integration**: Uses `next-themes` to automatically switch between light and dark toast styles
2. **Rich Colors**: Enable `richColors` prop for semantic colored backgrounds on success/error/warning

## Variants

### Basic Variants

```tsx
toast("Default notification");
toast.success("Changes saved successfully!");
toast.error("Failed to save changes");
toast.warning("Your session will expire soon");
toast.info("New updates available");
```

### With Description

```tsx
toast.success("File uploaded", {
  description: "document.pdf has been uploaded successfully",
});
```

### With Action Button

```tsx
toast("Item deleted", {
  action: {
    label: "Undo",
    onClick: () => restoreItem(),
  },
});
```

### Loading + Promise

```tsx
toast.promise(saveData(), {
  loading: "Saving...",
  success: "Data saved successfully!",
  error: "Failed to save data",
});
```

### Custom Duration

```tsx
toast.info("Quick message", { duration: 2000 }); // 2 seconds
toast.error("Important error", { duration: Infinity }); // Won't auto-dismiss
```

## States

| State | Animation | Background | Duration | Dismissible |
|-------|-----------|------------|----------|-------------|
| Entering | slide-in + fade | variant bg | - | no |
| Visible | none | variant bg | 4000ms default | yes |
| Hovering | none | variant bg | paused | yes |
| Exiting | slide-out + fade | variant bg | 200ms | no |

## Accessibility

### Required ARIA Attributes

- `role="status"`: For informational toasts
- `role="alert"`: For error toasts (automatically applied by Sonner)
- `aria-live="polite"`: Non-urgent notifications
- `aria-live="assertive"`: Error notifications

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus action button |
| `Enter` | Activate action |
| `Escape` | Dismiss toast (if enabled) |

### Screen Reader Announcements

- Toast message read automatically via live region
- Action button labels announced when focused
- "Dismissed" announced when closed

## Dependencies

```json
{
  "dependencies": {
    "sonner": "^1.7.0",
    "next-themes": "^0.4.3"
  }
}
```

### Installation

```bash
npm install sonner next-themes
```

## Examples

### Basic Usage

```tsx
"use client";

import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export function SaveButton() {
  const handleSave = async () => {
    try {
      await saveData();
      toast.success("Changes saved!");
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

### With Promise

```tsx
"use client";

import { toast } from "@/lib/toast";

export function UploadButton() {
  const handleUpload = (file: File) => {
    toast.promise(uploadFile(file), {
      loading: `Uploading ${file.name}...`,
      success: (data) => `${file.name} uploaded successfully!`,
      error: (err) => `Failed to upload: ${err.message}`,
    });
  };

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
    />
  );
}
```

### Undo Pattern

```tsx
"use client";

import { toast } from "@/lib/toast";

export function DeleteButton({ itemId }: { itemId: string }) {
  const handleDelete = async () => {
    const item = await deleteItem(itemId);
    
    toast.success("Item deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          await restoreItem(item);
          toast.success("Item restored");
        },
      },
    });
  };

  return <Button variant="destructive" onClick={handleDelete}>Delete</Button>;
}
```

### Custom Toast

```tsx
"use client";

import { toast } from "sonner";

export function CustomNotification() {
  return toast.custom((t) => (
    <div className="flex items-center gap-3 bg-background border rounded-lg p-4 shadow-lg">
      <Avatar>
        <AvatarImage src="/avatar.jpg" />
      </Avatar>
      <div>
        <p className="font-medium">New message from John</p>
        <p className="text-sm text-muted-foreground">Hey, are you there?</p>
      </div>
      <Button size="sm" onClick={() => toast.dismiss(t)}>
        Reply
      </Button>
    </div>
  ));
}
```

### Form Validation Errors

```tsx
"use client";

import { toast } from "@/lib/toast";

export function handleFormErrors(errors: Record<string, string[]>) {
  const errorMessages = Object.values(errors).flat();
  
  if (errorMessages.length === 1) {
    toast.error(errorMessages[0]);
  } else {
    toast.error("Please fix the following errors:", {
      description: errorMessages.join("\n"),
      duration: 6000,
    });
  }
}
```

## Anti-patterns

### Too Many Toasts

```tsx
// Bad - overwhelming users
items.forEach(item => {
  toast.success(`${item.name} saved!`);
});

// Good - batch notifications
toast.success(`${items.length} items saved!`);
```

### Using Toasts for Critical Information

```tsx
// Bad - important info that can be missed
toast.error("Your account will be deleted in 24 hours");

// Good - use modal or inline alert for critical information
<Alert variant="destructive">
  Your account will be deleted in 24 hours
</Alert>
```

### Blocking User Actions

```tsx
// Bad - requiring action before user can continue
toast.error("Fix errors", { duration: Infinity });

// Good - non-blocking with clear next steps
toast.error("Please fix the errors above", { duration: 5000 });
```

## Related Skills

### Composes From
- [primitives/colors](../primitives/colors.md) - Status colors
- [primitives/motion](../primitives/motion.md) - Entry/exit animations

### Composes Into
- [organisms/auth-form](../organisms/auth-form.md) - Auth feedback
- [organisms/settings-form](../organisms/settings-form.md) - Save confirmation
- [patterns/optimistic-updates](../patterns/optimistic-updates.md) - Undo actions

### Alternatives
- [feedback-alert](./feedback-alert.md) - Inline, non-dismissing messages
- [organisms/dialog](../organisms/dialog.md) - When user action required

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Sonner
- Added theme integration with next-themes
- Toast utility with convenience methods
- Action and undo patterns
