---
id: a-feedback-alert
name: Alert
version: 2.0.0
layer: L1
category: feedback
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Inline alert messages with variants and optional dismissibility
tags: [alert, message, notification, banner, inline]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Alert

## Overview

The Alert atom provides inline, contextual feedback messages that persist in the UI. Unlike toasts, alerts are meant to stay visible until dismissed or resolved. Supports semantic variants, icons, and optional dismiss functionality.

## When to Use

Use this skill when:
- Showing form validation summaries
- Displaying important persistent warnings
- Providing contextual information within a section
- Showing success confirmations that should remain visible

## Implementation

```typescript
// components/ui/alert.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100 [&>svg]:text-blue-600",
        success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100 [&>svg]:text-green-600",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100 [&>svg]:text-yellow-600",
        destructive: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100 [&>svg]:text-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Show default icon for variant */
  showIcon?: boolean;
  /** Custom icon to display */
  icon?: React.ReactNode;
  /** Allow dismissing the alert */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "default",
      showIcon = true,
      icon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = iconMap[variant ?? "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {showIcon && (icon || <IconComponent className="h-4 w-4" />)}
        {children}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
```

```typescript
// components/ui/alert-dialog-inline.tsx
"use client";

import * as React from "react";
import { Alert, AlertTitle, AlertDescription } from "./alert";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface AlertWithActionsProps {
  variant?: "default" | "info" | "success" | "warning" | "destructive";
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function AlertWithActions({
  variant = "default",
  title,
  description,
  primaryAction,
  secondaryAction,
  dismissible,
  onDismiss,
  className,
}: AlertWithActionsProps) {
  return (
    <Alert
      variant={variant}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={cn("pr-12", className)}
    >
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {(primaryAction || secondaryAction) && (
        <div className="mt-3 flex gap-2">
          {primaryAction && (
            <Button size="sm" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </Alert>
  );
}
```

```typescript
// components/ui/form-error-summary.tsx
import * as React from "react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

interface FormErrorSummaryProps {
  errors: Record<string, string[] | undefined>;
  className?: string;
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(
    ([_, messages]) => messages && messages.length > 0
  );

  if (errorEntries.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>
        {errorEntries.length === 1
          ? "There was an error with your submission"
          : `There were ${errorEntries.length} errors with your submission`}
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          {errorEntries.map(([field, messages]) =>
            messages?.map((message, index) => (
              <li key={`${field}-${index}`}>{message}</li>
            ))
          )}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
```

### Key Implementation Notes

1. **Icon Positioning**: Icons are absolutely positioned with CSS to align with the content
2. **Role Alert**: Native `role="alert"` ensures screen readers announce the content immediately

## Variants

### Semantic Variants

```tsx
<Alert variant="default">
  <AlertTitle>Note</AlertTitle>
  <AlertDescription>This is a default alert.</AlertDescription>
</Alert>

<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>Here's some helpful information.</AlertDescription>
</Alert>

<Alert variant="success">
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>

<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>This action cannot be undone.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

### Without Icon

```tsx
<Alert showIcon={false}>
  <AlertTitle>Plain Alert</AlertTitle>
  <AlertDescription>No icon displayed.</AlertDescription>
</Alert>
```

### Custom Icon

```tsx
import { Rocket } from "lucide-react";

<Alert icon={<Rocket className="h-4 w-4" />}>
  <AlertTitle>New Feature!</AlertTitle>
  <AlertDescription>Check out what's new.</AlertDescription>
</Alert>
```

### Dismissible

```tsx
const [visible, setVisible] = useState(true);

{visible && (
  <Alert
    variant="info"
    dismissible
    onDismiss={() => setVisible(false)}
  >
    <AlertTitle>Tip</AlertTitle>
    <AlertDescription>Press Cmd+K for quick actions.</AlertDescription>
  </Alert>
)}
```

## States

| State | Border | Background | Icon | Dismiss Button |
|-------|--------|------------|------|----------------|
| Default | border | background | foreground | hidden/visible |
| Info | blue-200 | blue-50 | blue-600 | hidden/visible |
| Success | green-200 | green-50 | green-600 | hidden/visible |
| Warning | yellow-200 | yellow-50 | yellow-600 | hidden/visible |
| Destructive | red-200 | red-50 | red-600 | hidden/visible |
| Hover (dismiss) | - | - | - | opacity-100 |
| Focus (dismiss) | - | - | - | ring-2 ring-ring |

## Accessibility

### Required ARIA Attributes

- `role="alert"`: Announces content immediately to screen readers
- `aria-label="Dismiss alert"`: On dismiss button

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus dismiss button (if present) |
| `Enter` | Dismiss alert |
| `Space` | Dismiss alert |

### Screen Reader Announcements

- Alert content announced immediately on render
- Title and description read in sequence
- Dismiss button announces "Dismiss alert"

## Dependencies

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install class-variance-authority lucide-react
```

## Examples

### Basic Usage

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function SuccessAlert() {
  return (
    <Alert variant="success">
      <AlertTitle>Account created</AlertTitle>
      <AlertDescription>
        Your account has been created successfully. Check your email to verify.
      </AlertDescription>
    </Alert>
  );
}
```

### Form Error Summary

```tsx
import { FormErrorSummary } from "@/components/ui/form-error-summary";

export function ContactForm({ errors }: { errors: Record<string, string[]> }) {
  return (
    <form>
      <FormErrorSummary errors={errors} className="mb-6" />
      {/* Form fields */}
    </form>
  );
}
```

### With Actions

```tsx
import { AlertWithActions } from "@/components/ui/alert-dialog-inline";

export function UpgradePrompt() {
  return (
    <AlertWithActions
      variant="info"
      title="Upgrade available"
      description="A new version is available with bug fixes and improvements."
      primaryAction={{
        label: "Update now",
        onClick: () => handleUpdate(),
      }}
      secondaryAction={{
        label: "Later",
        onClick: () => dismissPrompt(),
      }}
      dismissible
      onDismiss={() => dismissPrompt()}
    />
  );
}
```

### Dismissible Tip

```tsx
"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DismissibleTip({ tipId }: { tipId: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(`tip-${tipId}-dismissed`);
    if (dismissed) setVisible(false);
  }, [tipId]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(`tip-${tipId}-dismissed`, "true");
  };

  if (!visible) return null;

  return (
    <Alert variant="info" dismissible onDismiss={handleDismiss}>
      <AlertDescription>
        Pro tip: Use keyboard shortcuts for faster navigation.
      </AlertDescription>
    </Alert>
  );
}
```

### Error with Retry

```tsx
"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Failed to load data</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Please check your connection and try again.</span>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

## Anti-patterns

### Using Alert for Transient Messages

```tsx
// Bad - alerts should persist, use toast for transient messages
<Alert variant="success">
  <AlertTitle>Saved!</AlertTitle>
</Alert>
// Alert disappears after 3 seconds...

// Good - use toast for transient feedback
toast.success("Saved!");
```

### Multiple Alerts at Once

```tsx
// Bad - overwhelming the user
<Alert variant="success">Account created</Alert>
<Alert variant="info">Verify your email</Alert>
<Alert variant="warning">Complete your profile</Alert>

// Good - consolidate or prioritize
<Alert variant="success">
  <AlertTitle>Account created!</AlertTitle>
  <AlertDescription>
    Please verify your email and complete your profile to get started.
  </AlertDescription>
</Alert>
```

### Alert Without Context

```tsx
// Bad - unclear what the error is about
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
</Alert>

// Good - provide actionable information
<Alert variant="destructive">
  <AlertTitle>Email address is invalid</AlertTitle>
  <AlertDescription>
    Please enter a valid email address (e.g., user@example.com).
  </AlertDescription>
</Alert>
```

## Related Skills

### Composes From
- [display-icon](./display-icon.md) - Alert icons
- [primitives/colors](../primitives/colors.md) - Semantic colors

### Composes Into
- [molecules/form-field](../molecules/form-field.md) - Field-level errors
- [organisms/auth-form](../organisms/auth-form.md) - Auth error display
- [templates/error](../templates/error.md) - Error pages

### Alternatives
- [feedback-toast](./feedback-toast.md) - For transient notifications
- [organisms/dialog](../organisms/dialog.md) - For blocking messages

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with CVA variants
- Added semantic variants: info, success, warning, destructive
- Dismissible alert with callback
- FormErrorSummary and AlertWithActions components
