---
id: a-input-textarea
name: Textarea
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Textarea with auto-grow and character count
tags: [input, textarea, form, multiline]
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

# Textarea

## Overview

The Textarea atom handles multi-line text input with optional auto-grow functionality and character counting. It shares styling conventions with the Input atom for visual consistency.

## When to Use

Use this skill when:
- Collecting multi-line text (comments, descriptions, messages)
- Building forms with long-form content fields
- Implementing character-limited inputs

## Implementation

```typescript
// components/ui/textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          `flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2
           text-base ring-offset-background
           placeholder:text-muted-foreground
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
           disabled:cursor-not-allowed disabled:opacity-50
           md:text-sm`,
          "border-input",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        aria-invalid={error || undefined}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
```

### Auto-Growing Textarea

```typescript
// components/ui/textarea-autosize.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TextareaProps } from "./textarea";

const TextareaAutosize = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    
    const setRefs = React.useCallback(
      (element: HTMLTextAreaElement | null) => {
        textareaRef.current = element;
        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref]
    );

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight, props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    return (
      <textarea
        className={cn(
          `flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2
           text-base ring-offset-background resize-none overflow-hidden
           placeholder:text-muted-foreground
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
           disabled:cursor-not-allowed disabled:opacity-50
           md:text-sm`,
          "border-input",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={setRefs}
        onChange={handleChange}
        aria-invalid={error || undefined}
        {...props}
      />
    );
  }
);
TextareaAutosize.displayName = "TextareaAutosize";

export { TextareaAutosize };
```

### Textarea with Character Count

```typescript
// components/ui/textarea-with-count.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea, TextareaProps } from "./textarea";

interface TextareaWithCountProps extends TextareaProps {
  maxLength: number;
  showCount?: boolean;
}

const TextareaWithCount = React.forwardRef<HTMLTextAreaElement, TextareaWithCountProps>(
  ({ maxLength, showCount = true, className, value, onChange, ...props }, ref) => {
    const [count, setCount] = React.useState(
      typeof value === "string" ? value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      onChange?.(e);
    };

    const isNearLimit = count >= maxLength * 0.9;
    const isAtLimit = count >= maxLength;

    return (
      <div className="relative">
        <Textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(showCount && "pb-6", className)}
          {...props}
        />
        {showCount && (
          <div
            className={cn(
              "absolute bottom-2 right-3 text-xs",
              isAtLimit
                ? "text-destructive"
                : isNearLimit
                ? "text-amber-500"
                : "text-muted-foreground"
            )}
            aria-live="polite"
          >
            {count}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);
TextareaWithCount.displayName = "TextareaWithCount";

export { TextareaWithCount };
```

## Variants

### Resize Options

```tsx
// No resize (default for autosize)
<Textarea className="resize-none" />

// Vertical only
<Textarea className="resize-y" />

// Both directions
<Textarea className="resize" />
```

### Heights

```tsx
// Small
<Textarea className="min-h-[60px]" />

// Default
<Textarea className="min-h-[80px]" />

// Large
<Textarea className="min-h-[120px]" />

// Fixed height
<Textarea className="h-[200px] resize-none" />
```

## States

Same as Input - see [input-text.md](./input-text.md#states) for the complete state matrix.

## Accessibility

### Required ARIA Attributes

- `aria-invalid`: Set when there's a validation error
- `aria-describedby`: Link to error/description/count
- `aria-required`: When field is required

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus/unfocus |
| `Enter` | New line (not submit) |
| `Ctrl+Enter` | Submit (when implemented) |

### Screen Reader Considerations

- Character count should use `aria-live="polite"` for updates
- Announce when approaching/at limit

## Dependencies

```json
{
  "dependencies": {
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.5"
  }
}
```

## Examples

### Basic Usage

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="Enter your message..." />
```

### With Label

```tsx
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea
    id="message"
    placeholder="Type your message here..."
    rows={4}
  />
</div>
```

### Auto-Growing

```tsx
import { TextareaAutosize } from "@/components/ui/textarea-autosize";

<TextareaAutosize
  placeholder="This will grow as you type..."
  className="min-h-[80px] max-h-[300px]"
/>
```

### With Character Limit

```tsx
import { TextareaWithCount } from "@/components/ui/textarea-with-count";

<TextareaWithCount
  maxLength={280}
  placeholder="What's happening?"
/>
```

### In a Form

```tsx
import { useForm } from "react-hook-form";

function FeedbackForm() {
  const { register, handleSubmit, watch } = useForm();
  const feedback = watch("feedback", "");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <div className="relative">
          <Textarea
            id="feedback"
            {...register("feedback", { maxLength: 500 })}
            placeholder="Share your thoughts..."
            className="pb-6"
          />
          <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
            {feedback.length}/500
          </span>
        </div>
      </div>
      <Button type="submit" className="mt-4">Submit</Button>
    </form>
  );
}
```

## Anti-patterns

### Single Line for Long Content

```tsx
// Bad - input for multi-line content
<Input placeholder="Enter your bio (up to 500 characters)" />

// Good - textarea for multi-line
<Textarea placeholder="Enter your bio..." maxLength={500} />
```

### No Maximum Height on Autosize

```tsx
// Bad - can grow infinitely
<TextareaAutosize />

// Good - has maximum height
<TextareaAutosize className="max-h-[300px] overflow-y-auto" />
```

## Related Skills

### Composes From
- [input-text](./input-text.md) - Styling conventions
- [colors](../primitives/colors.md) - Color tokens

### Composes Into
- [form-field](../molecules/form-field.md) - Complete form field
- [contact-form](../organisms/contact-form.md) - Message field

### Related
- [input-text](./input-text.md) - Single-line input

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Auto-grow and character count variants
