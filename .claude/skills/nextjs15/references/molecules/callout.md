---
id: m-callout
name: Callout
version: 2.0.0
layer: L2
category: content
description: Highlighted content block with icon and semantic variants
tags: [callout, note, tip, warning, info, blockquote]
formula: "Callout = DisplayIcon(a-display-icon) + DisplayText(a-display-text)"
composes:
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
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

# Callout

## Overview

The Callout molecule provides highlighted content blocks for tips, warnings, notes, and important information. Features semantic color variants, icons, and optional titles for drawing attention to specific content.

## When to Use

Use this skill when:
- Highlighting important information in documentation
- Showing tips, warnings, or notes in content
- Drawing attention to key points
- Creating blockquote-style content

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Callout                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │   Icon   │  │              Content                        │  │
│  │(a-display│  │         (a-display-text)                    │  │
│  │  -icon)  │  │                                             │  │
│  │          │  │  ┌─────────────────────────────────────┐    │  │
│  │    ℹ️    │  │  │  Title: "Important Note"            │    │  │
│  │          │  │  └─────────────────────────────────────┘    │  │
│  │          │  │  ┌─────────────────────────────────────┐    │  │
│  │          │  │  │  This is a callout message.        │    │  │
│  │          │  │  │  Use it to highlight key info.     │    │  │
│  │          │  │  └─────────────────────────────────────┘    │  │
│  └──────────┘  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Variants:
┌──────────────────────────────────────────────────────────────────┐
│  ℹ️  Info: Neutral information message                          │
├──────────────────────────────────────────────────────────────────┤
│  ⚠️  Warning: Something needs attention                          │
├──────────────────────────────────────────────────────────────────┤
│  ❌  Error: Something went wrong                                 │
├──────────────────────────────────────────────────────────────────┤
│  ✅  Success: Operation completed                                │
├──────────────────────────────────────────────────────────────────┤
│  💡  Tip: Helpful suggestion                                     │
└──────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [display-icon](../atoms/display-icon.md) - Callout icons
- [display-text](../atoms/display-text.md) - Title and content

## Implementation

```typescript
// components/ui/callout.tsx
import * as React from "react";
import {
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Flame,
  X,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const calloutVariants = cva(
  "relative rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-muted/50 border-muted-foreground/20 text-foreground",
        info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-100",
        success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/50 dark:border-green-800 dark:text-green-100",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-100",
        danger: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/50 dark:border-red-800 dark:text-red-100",
        tip: "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-100",
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
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  tip: Lightbulb,
};

const iconColorMap = {
  default: "text-muted-foreground",
  info: "text-blue-600 dark:text-blue-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  tip: "text-purple-600 dark:text-purple-400",
};

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  /** Callout title */
  title?: string;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Hide the icon */
  hideIcon?: boolean;
  /** Dismissible */
  dismissible?: boolean;
  /** Dismiss callback */
  onDismiss?: () => void;
}

export function Callout({
  className,
  variant = "default",
  title,
  icon,
  hideIcon = false,
  dismissible = false,
  onDismiss,
  children,
  ...props
}: CalloutProps) {
  const IconComponent = iconMap[variant ?? "default"];
  const iconColor = iconColorMap[variant ?? "default"];

  return (
    <div
      className={cn(calloutVariants({ variant }), className)}
      role="note"
      {...props}
    >
      {!hideIcon && (
        icon || <IconComponent className={cn("h-5 w-5", iconColor)} />
      )}
      
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "absolute right-2 top-2 rounded-md p-1 opacity-70",
            "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {title && (
        <h5 className="mb-1 font-medium leading-none tracking-tight">
          {title}
        </h5>
      )}
      <div className="text-sm [&_p]:leading-relaxed">{children}</div>
    </div>
  );
}
```

```typescript
// components/ui/callout-block.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Callout, type CalloutProps } from "./callout";

interface CalloutBlockProps extends CalloutProps {
  /** Accent border position */
  accent?: "left" | "top" | "none";
}

export function CalloutBlock({
  accent = "left",
  className,
  variant,
  ...props
}: CalloutBlockProps) {
  const accentColorMap = {
    default: "border-l-muted-foreground",
    info: "border-l-blue-500",
    success: "border-l-green-500",
    warning: "border-l-yellow-500",
    danger: "border-l-red-500",
    tip: "border-l-purple-500",
  };

  const accentTopColorMap = {
    default: "border-t-muted-foreground",
    info: "border-t-blue-500",
    success: "border-t-green-500",
    warning: "border-t-yellow-500",
    danger: "border-t-red-500",
    tip: "border-t-purple-500",
  };

  return (
    <Callout
      variant={variant}
      className={cn(
        accent === "left" && `border-l-4 ${accentColorMap[variant ?? "default"]}`,
        accent === "top" && `border-t-4 ${accentTopColorMap[variant ?? "default"]}`,
        className
      )}
      {...props}
    />
  );
}
```

```typescript
// MDX component integration
// components/mdx/callout.tsx
import { Callout, type CalloutProps } from "@/components/ui/callout";

// For use in MDX files
export const Note = (props: Omit<CalloutProps, "variant">) => (
  <Callout variant="info" title="Note" {...props} />
);

export const Tip = (props: Omit<CalloutProps, "variant">) => (
  <Callout variant="tip" title="Tip" {...props} />
);

export const Warning = (props: Omit<CalloutProps, "variant">) => (
  <Callout variant="warning" title="Warning" {...props} />
);

export const Danger = (props: Omit<CalloutProps, "variant">) => (
  <Callout variant="danger" title="Danger" {...props} />
);

export const Success = (props: Omit<CalloutProps, "variant">) => (
  <Callout variant="success" title="Success" {...props} />
);
```

### Key Implementation Notes

1. **Semantic Variants**: Each variant uses appropriate colors and icons for its purpose
2. **MDX Integration**: Provides pre-configured components for documentation

## Variants

### Default

```tsx
<Callout>
  This is a default callout with neutral styling.
</Callout>
```

### Info

```tsx
<Callout variant="info" title="Note">
  This provides additional information that might be helpful.
</Callout>
```

### Success

```tsx
<Callout variant="success" title="Success">
  Your changes have been saved successfully.
</Callout>
```

### Warning

```tsx
<Callout variant="warning" title="Warning">
  This action may have unintended consequences.
</Callout>
```

### Danger

```tsx
<Callout variant="danger" title="Danger">
  This action is irreversible and will delete all data.
</Callout>
```

### Tip

```tsx
<Callout variant="tip" title="Pro Tip">
  You can use keyboard shortcuts to navigate faster.
</Callout>
```

### With Accent Border

```tsx
<CalloutBlock variant="info" accent="left" title="Note">
  This has a colored accent border on the left.
</CalloutBlock>
```

### Dismissible

```tsx
const [visible, setVisible] = useState(true);

{visible && (
  <Callout
    variant="info"
    dismissible
    onDismiss={() => setVisible(false)}
    title="New Feature"
  >
    Check out our new dashboard features!
  </Callout>
)}
```

## States

| Variant | Background | Border | Icon Color | Text Color |
|---------|------------|--------|------------|------------|
| Default | muted/50 | muted | muted-foreground | foreground |
| Info | blue-50 | blue-200 | blue-600 | blue-900 |
| Success | green-50 | green-200 | green-600 | green-900 |
| Warning | yellow-50 | yellow-200 | yellow-600 | yellow-900 |
| Danger | red-50 | red-200 | red-600 | red-900 |
| Tip | purple-50 | purple-200 | purple-600 | purple-900 |

## Accessibility

### Required ARIA Attributes

- `role="note"` - Indicates supplementary content
- Dismissible button has `aria-label="Dismiss"`

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus dismiss button (if present) |
| `Enter/Space` | Dismiss callout |

### Screen Reader Announcements

- Content announced as "note" region
- Title read as heading
- Dismiss button announced

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

### Documentation Page

```tsx
import { Callout } from "@/components/ui/callout";

export function APIDocumentation() {
  return (
    <article className="prose dark:prose-invert">
      <h1>API Reference</h1>
      
      <Callout variant="warning" title="Breaking Change">
        Version 2.0 includes breaking changes to the authentication API.
        Please review the migration guide before upgrading.
      </Callout>

      <h2>Authentication</h2>
      <p>All API requests require authentication...</p>

      <Callout variant="tip" title="Quick Tip">
        Use environment variables to store your API keys securely.
      </Callout>

      <Callout variant="danger" title="Security Warning">
        Never expose your API keys in client-side code.
      </Callout>
    </article>
  );
}
```

### MDX Usage

```mdx
// content/docs/getting-started.mdx
import { Note, Warning, Tip } from "@/components/mdx/callout";

# Getting Started

<Note>
  Make sure you have Node.js 18+ installed before continuing.
</Note>

## Installation

Run the following command:

```bash
npm install my-package
```

<Warning>
  If you're upgrading from v1, please check the migration guide first.
</Warning>

<Tip>
  Use `npx` to run without installing globally.
</Tip>
```

### Feature Announcement

```tsx
import { Callout } from "@/components/ui/callout";
import { useState, useEffect } from "react";

export function FeatureAnnouncement() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("feature-v2-dismissed");
    if (isDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("feature-v2-dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <Callout
      variant="info"
      title="New: Dark Mode"
      dismissible
      onDismiss={handleDismiss}
      icon={<Flame className="h-5 w-5 text-orange-500" />}
    >
      We've added dark mode support! Toggle it in settings.
    </Callout>
  );
}
```

### Form Validation Summary

```tsx
import { Callout } from "@/components/ui/callout";

export function FormWithErrors({ errors }) {
  if (Object.keys(errors).length === 0) return null;

  return (
    <Callout variant="danger" title="Please fix the following errors:">
      <ul className="list-disc pl-4 mt-2 space-y-1">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </Callout>
  );
}
```

## Anti-patterns

### Overusing Callouts

```tsx
// Bad - too many callouts dilute importance
<Callout variant="info">Info 1</Callout>
<Callout variant="warning">Warning 1</Callout>
<Callout variant="tip">Tip 1</Callout>
<Callout variant="info">Info 2</Callout>

// Good - use sparingly for important content
<p>Regular content here...</p>
<Callout variant="warning">
  The one important warning for this section.
</Callout>
```

### Wrong Variant for Context

```tsx
// Bad - using success for a warning
<Callout variant="success">
  This action will delete all your data.
</Callout>

// Good - match variant to content
<Callout variant="danger">
  This action will delete all your data.
</Callout>
```

### Missing Title for Complex Content

```tsx
// Bad - no title for multi-paragraph callout
<Callout variant="info">
  Lorem ipsum dolor sit amet...
  
  More content here...
</Callout>

// Good - include title for clarity
<Callout variant="info" title="Important Information">
  Lorem ipsum dolor sit amet...
  
  More content here...
</Callout>
```

## Related Skills

### Composes From
- [atoms/display-icon](../atoms/display-icon.md) - Callout icons
- [atoms/display-text](../atoms/display-text.md) - Content text
- [atoms/feedback-alert](../atoms/feedback-alert.md) - Similar styling

### Composes Into
- [templates/documentation](../templates/documentation.md) - Doc pages
- [organisms/hero](../organisms/hero.md) - Announcement banners

### Alternatives
- [atoms/feedback-alert](../atoms/feedback-alert.md) - For dismissible alerts
- [atoms/feedback-toast](../atoms/feedback-toast.md) - For transient messages

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with semantic variants
- CalloutBlock with accent borders
- MDX component helpers
- Dismissible support
