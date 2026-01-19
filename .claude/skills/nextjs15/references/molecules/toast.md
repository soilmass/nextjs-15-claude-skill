---
id: m-toast
name: Toast
version: 2.0.0
layer: L2
category: feedback
description: Toast notification component for temporary messages and alerts
tags: [toast, notification, alert, message, snackbar, feedback]
formula: "Toast = Container(a-feedback-toast) + Icon(a-display-icon) + Message(a-display-text) + Action(a-input-button)"
composes:
  - ../atoms/feedback-toast.md
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
  - ../atoms/input-button.md
dependencies:
  "sonner": "^1.5.0"
performance:
  impact: low
  lcp: neutral
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Toast

## Overview

The Toast molecule displays temporary notification messages that automatically dismiss after a set duration. Supports multiple variants, actions, and can be stacked for multiple notifications.

## When to Use

Use this skill when:
- Confirming successful actions (save, submit, delete)
- Showing non-critical errors or warnings
- Providing brief status updates
- Displaying messages that don't require immediate action

## Composition Diagram

```
+-----------------------------------------------+
|                     Toast                      |
+-----------------------------------------------+
| +-------------------------------------------+ |
| |  Toast Container (fixed position)         | |
| | +---------------------------------------+ | |
| | |  Toast Item                           | | |
| | | +-----------------------------------+ | | |
| | | | [Icon]  Title             [X]     | | | |
| | | |         Description               | | | |
| | | |                    [Action]       | | | |
| | | +-----------------------------------+ | | |
| | +---------------------------------------+ | |
| | +---------------------------------------+ | |
| | |  Toast Item (stacked)                 | | |
| | +---------------------------------------+ | |
| +-------------------------------------------+ |
+-----------------------------------------------+

Position Options:
+--------+--------+--------+
| top-   | top-   | top-   |
| left   | center | right  |
+--------+--------+--------+
| bottom-| bottom-| bottom-|
| left   | center | right  |
+--------+--------+--------+
```

## Atoms Used

- [feedback-toast](../atoms/feedback-toast.md) - Toast container styling
- [display-icon](../atoms/display-icon.md) - Status icons
- [display-text](../atoms/display-text.md) - Title and description
- [input-button](../atoms/input-button.md) - Action and dismiss buttons

## Implementation

```typescript
// components/ui/sonner.tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
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
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
```

```typescript
// lib/toast.ts
import { toast as sonnerToast } from "sonner";
import { CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  duration?: number;
}

export const toast = {
  success: (options: ToastOptions | string) => {
    const opts = typeof options === "string" ? { title: options } : options;
    return sonnerToast.success(opts.title, {
      description: opts.description,
      action: opts.action,
      cancel: opts.cancel,
      duration: opts.duration,
    });
  },

  error: (options: ToastOptions | string) => {
    const opts = typeof options === "string" ? { title: options } : options;
    return sonnerToast.error(opts.title, {
      description: opts.description,
      action: opts.action,
      cancel: opts.cancel,
      duration: opts.duration ?? 5000,
    });
  },

  warning: (options: ToastOptions | string) => {
    const opts = typeof options === "string" ? { title: options } : options;
    return sonnerToast.warning(opts.title, {
      description: opts.description,
      action: opts.action,
      cancel: opts.cancel,
      duration: opts.duration,
    });
  },

  info: (options: ToastOptions | string) => {
    const opts = typeof options === "string" ? { title: options } : options;
    return sonnerToast.info(opts.title, {
      description: opts.description,
      action: opts.action,
      cancel: opts.cancel,
      duration: opts.duration,
    });
  },

  loading: (title: string) => {
    return sonnerToast.loading(title);
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  custom: (component: React.ReactNode, options?: { duration?: number }) => {
    return sonnerToast.custom(() => component, options);
  },
};
```

```typescript
// components/ui/toast-custom.tsx
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomToastProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info";
  action?: React.ReactNode;
  onDismiss?: () => void;
}

const variantStyles = {
  default: "border-border",
  success: "border-green-500 bg-green-50 dark:bg-green-950",
  error: "border-destructive bg-destructive/10",
  warning: "border-amber-500 bg-amber-50 dark:bg-amber-950",
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950",
};

export function CustomToast({
  title,
  description,
  icon,
  variant = "default",
  action,
  onDismiss,
}: CustomToastProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg",
        "bg-background text-foreground",
        variantStyles[variant]
      )}
    >
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

## Variants

### Success Toast

```tsx
toast.success("Changes saved successfully");

// With description
toast.success({
  title: "File uploaded",
  description: "Your file has been uploaded successfully.",
});
```

### Error Toast

```tsx
toast.error("Failed to save changes");

// With action
toast.error({
  title: "Connection lost",
  description: "Unable to connect to the server.",
  action: {
    label: "Retry",
    onClick: () => reconnect(),
  },
});
```

### Warning Toast

```tsx
toast.warning({
  title: "Low storage",
  description: "You're running low on storage space.",
});
```

### Info Toast

```tsx
toast.info({
  title: "New feature",
  description: "Check out our new dark mode!",
});
```

### Loading Toast

```tsx
const toastId = toast.loading("Uploading file...");

// Later, update or dismiss
toast.dismiss(toastId);
toast.success("Upload complete");
```

### Promise Toast

```tsx
toast.promise(saveData(), {
  loading: "Saving...",
  success: "Data saved!",
  error: "Failed to save data",
});
```

## States

| State | Duration | Dismissible | Animation |
|-------|----------|-------------|-----------|
| Default | 4s | yes | slide in |
| Success | 4s | yes | slide in |
| Error | 5s | yes | slide in |
| Loading | infinite | no | pulse |
| With action | 10s | yes | slide in |

## Accessibility

### Required ARIA Attributes

- `role="alert"` or `role="status"` based on urgency
- `aria-live="polite"` for non-urgent toasts
- `aria-live="assertive"` for important toasts

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Escape` | Dismiss toast |
| `Tab` | Focus action button |
| `Enter/Space` | Activate action |

### Screen Reader Announcements

- Toast message announced when shown
- Actions are focusable and announced
- Dismiss action available

## Dependencies

```json
{
  "dependencies": {
    "sonner": "^1.5.0",
    "next-themes": "^0.4.3",
    "lucide-react": "^0.460.0"
  }
}
```

## Examples

### Setup in Layout

```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
```

### Form Submission

```tsx
async function handleSubmit(data) {
  toast.promise(submitForm(data), {
    loading: "Submitting form...",
    success: "Form submitted successfully!",
    error: (err) => `Error: ${err.message}`,
  });
}
```

### Undo Action

```tsx
function handleDelete(item) {
  deleteItem(item.id);

  toast.success({
    title: "Item deleted",
    description: `"${item.name}" has been deleted.`,
    action: {
      label: "Undo",
      onClick: () => restoreItem(item.id),
    },
  });
}
```

### Custom Toast

```tsx
toast.custom(
  <CustomToast
    title="New message"
    description="You have a new message from John"
    icon={<MessageIcon />}
    action={
      <Button size="sm" onClick={() => openMessage()}>
        View
      </Button>
    }
  />
);
```

## Anti-patterns

### Too Many Toasts

```tsx
// Bad - overwhelming users
items.forEach(item => toast.success(`Saved ${item.name}`));

// Good - batch notification
toast.success(`${items.length} items saved`);
```

### Critical Info in Toast

```tsx
// Bad - important info that disappears
toast.error("Your account will be deleted in 24 hours");

// Good - use dialog for critical info
<AlertDialog>
  <AlertDialogContent>
    Your account will be deleted in 24 hours
  </AlertDialogContent>
</AlertDialog>
```

### Long Descriptions

```tsx
// Bad - too much text
toast.info({
  description: "Very long description that spans multiple lines..."
});

// Good - keep it brief
toast.info({
  title: "Update available",
  description: "Click to learn more",
  action: { label: "Details", onClick: showDetails }
});
```

## Related Skills

### Composes From
- [atoms/feedback-toast](../atoms/feedback-toast.md) - Base toast

### Composes Into
- [organisms/notification-center](../organisms/notification-center.md)

### Alternatives
- [molecules/callout](./callout.md) - For persistent messages
- Dialog - For critical messages requiring action

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Sonner integration
- Multiple variants
- Promise and loading support
- Custom toast component
