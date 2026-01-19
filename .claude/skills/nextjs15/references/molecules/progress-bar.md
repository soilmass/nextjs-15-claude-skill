---
id: m-progress-bar
name: Progress Bar
version: 2.0.0
layer: L2
category: feedback
description: Progress indicator bar with percentage, labels, and multiple variants
tags: [progress, loading, bar, percentage, indicator, status]
formula: "ProgressBar = Bar(a-feedback-progress) + Label(a-display-text) + Percentage(a-display-percentage)"
composes:
  - ../atoms/feedback-progress.md
  - ../atoms/display-text.md
  - ../atoms/display-percentage.md
dependencies:
  "@radix-ui/react-progress": "^1.1.0"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Progress Bar

## Overview

The Progress Bar molecule displays task completion status with a visual bar, optional labels, and percentage. Supports determinate progress (known percentage) and indeterminate states (unknown duration).

## When to Use

Use this skill when:
- Showing file upload progress
- Displaying form completion status
- Indicating background processing
- Building step-based wizards

## Composition Diagram

```
+-----------------------------------------------+
|                  Progress Bar                  |
+-----------------------------------------------+
| +-------------------------------------------+ |
| |  Label Area                               | |
| |  "Uploading files..."           "75%"    | |
| |  (a-display-text)        (a-display-%)   | |
| +-------------------------------------------+ |
|                                               |
| +-------------------------------------------+ |
| |  Track (background)                       | |
| |  +-----------------------------+          | |
| |  |  Indicator (filled)  75%   |          | |
| |  |  (a-feedback-progress)     |          | |
| |  +-----------------------------+          | |
| +-------------------------------------------+ |
|                                               |
| +-------------------------------------------+ |
| |  Description (optional)                   | |
| |  "3 of 4 files uploaded"                  | |
| +-------------------------------------------+ |
+-----------------------------------------------+
```

## Atoms Used

- [feedback-progress](../atoms/feedback-progress.md) - Base progress primitive
- [display-text](../atoms/display-text.md) - Labels and description
- [display-percentage](../atoms/display-percentage.md) - Percentage display

## Implementation

```typescript
// components/ui/progress-bar.tsx
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
        xl: "h-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 rounded-full transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-amber-500",
        error: "bg-destructive",
        gradient: "bg-gradient-to-r from-primary via-primary/80 to-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ProgressBarProps
  extends VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  /** Current progress value (0-100) */
  value?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Show indeterminate animation */
  indeterminate?: boolean;
  /** Label text */
  label?: string;
  /** Show percentage */
  showPercentage?: boolean;
  /** Description text below bar */
  description?: string;
  /** Custom percentage formatter */
  formatPercentage?: (value: number) => string;
  /** Show striped animation */
  striped?: boolean;
  /** Animate stripes */
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value = 0,
  max = 100,
  size,
  variant,
  indeterminate = false,
  label,
  showPercentage = false,
  description,
  formatPercentage = (v) => `${Math.round(v)}%`,
  striped = false,
  animated = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {/* Header with label and percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-foreground">{label}</span>
          )}
          {showPercentage && !indeterminate && (
            <span className="text-muted-foreground tabular-nums">
              {formatPercentage(percentage)}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <ProgressPrimitive.Root
        className={cn(progressVariants({ size }))}
        value={value}
        max={max}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            indicatorVariants({ variant }),
            indeterminate && "animate-progress-indeterminate",
            striped && [
              "bg-[length:1rem_1rem]",
              "bg-[linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent_75%,transparent)]",
            ],
            animated && striped && "animate-progress-stripes"
          )}
          style={{
            transform: indeterminate
              ? undefined
              : `translateX(-${100 - percentage}%)`,
          }}
        />
      </ProgressPrimitive.Root>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
```

```css
/* Add to globals.css */
@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

@keyframes progress-stripes {
  0% { background-position: 1rem 0; }
  100% { background-position: 0 0; }
}

.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

.animate-progress-stripes {
  animation: progress-stripes 1s linear infinite;
}
```

```typescript
// components/ui/progress-bar-stacked.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface StackedSegment {
  value: number;
  color: string;
  label?: string;
}

interface ProgressBarStackedProps {
  segments: StackedSegment[];
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showLegend?: boolean;
  className?: string;
}

export function ProgressBarStacked({
  segments,
  max = 100,
  size = "md",
  showLegend = false,
  className,
}: ProgressBarStackedProps) {
  const sizeStyles = {
    xs: "h-1",
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div
        className={cn(
          "flex w-full overflow-hidden rounded-full bg-secondary",
          sizeStyles[size]
        )}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            className="h-full transition-all duration-300"
            style={{
              width: `${(segment.value / max) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-4 text-xs">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-muted-foreground">
                {segment.label || `Segment ${index + 1}`}: {segment.value}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Variants

### Basic Progress

```tsx
<ProgressBar value={75} />
```

### With Label and Percentage

```tsx
<ProgressBar
  value={65}
  label="Uploading files..."
  showPercentage
/>
```

### Size Variants

```tsx
<ProgressBar value={50} size="xs" />
<ProgressBar value={50} size="sm" />
<ProgressBar value={50} size="md" />
<ProgressBar value={50} size="lg" />
<ProgressBar value={50} size="xl" />
```

### Color Variants

```tsx
<ProgressBar value={100} variant="success" />
<ProgressBar value={50} variant="warning" />
<ProgressBar value={25} variant="error" />
<ProgressBar value={75} variant="gradient" />
```

### Indeterminate

```tsx
<ProgressBar indeterminate label="Loading..." />
```

### Striped and Animated

```tsx
<ProgressBar value={60} striped animated />
```

### Stacked Progress

```tsx
<ProgressBarStacked
  segments={[
    { value: 30, color: "#22c55e", label: "Complete" },
    { value: 20, color: "#eab308", label: "In Progress" },
    { value: 50, color: "#e5e7eb", label: "Remaining" },
  ]}
  showLegend
/>
```

## States

| State | Indicator | Animation | Percentage |
|-------|-----------|-----------|------------|
| Empty | 0% width | none | 0% |
| Partial | value% width | none | value% |
| Complete | 100% width | pulse | 100% |
| Indeterminate | sliding | infinite | hidden |
| Error | value% width | none | value% |

## Accessibility

### Required ARIA Attributes

- `role="progressbar"` - Automatically applied by Radix
- `aria-valuenow` - Current value
- `aria-valuemin` - Minimum value (0)
- `aria-valuemax` - Maximum value

### Screen Reader Announcements

- Progress value announced when changed significantly
- Label provides context for the progress

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-progress": "^1.1.0",
    "class-variance-authority": "^0.7.1"
  }
}
```

## Examples

### File Upload

```tsx
function FileUpload({ file, progress, status }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="truncate text-sm">{file.name}</span>
        <span className="text-xs text-muted-foreground">{file.size}</span>
      </div>
      <ProgressBar
        value={progress}
        variant={status === "error" ? "error" : status === "complete" ? "success" : "default"}
        showPercentage
      />
    </div>
  );
}
```

### Form Completion

```tsx
function FormProgress({ completedFields, totalFields }) {
  const percentage = (completedFields / totalFields) * 100;
  return (
    <ProgressBar
      value={percentage}
      label="Form completion"
      description={`${completedFields} of ${totalFields} fields completed`}
      showPercentage
      variant={percentage === 100 ? "success" : "default"}
    />
  );
}
```

### Storage Usage

```tsx
function StorageUsage({ used, total }) {
  return (
    <ProgressBarStacked
      segments={[
        { value: (used.photos / total) * 100, color: "#3b82f6", label: "Photos" },
        { value: (used.documents / total) * 100, color: "#22c55e", label: "Documents" },
        { value: (used.other / total) * 100, color: "#a855f7", label: "Other" },
      ]}
      showLegend
    />
  );
}
```

## Anti-patterns

### Missing Context

```tsx
// Bad - no indication of what's loading
<ProgressBar value={45} />

// Good - provide context
<ProgressBar
  value={45}
  label="Uploading document.pdf"
  showPercentage
/>
```

### Indeterminate When Known

```tsx
// Bad - hiding actual progress
<ProgressBar indeterminate />

// Good - show actual progress when available
<ProgressBar value={progress} showPercentage />
```

## Related Skills

### Composes From
- [atoms/feedback-progress](../atoms/feedback-progress.md) - Base progress

### Composes Into
- [organisms/file-uploader](../organisms/file-uploader.md) - Upload UI
- [organisms/multi-step-form](../organisms/multi-step-form.md) - Form wizard

---

## Changelog

### 2.0.0 (2025-01-18)
- Initial L2 molecule implementation
- Size and color variants
- Label and percentage support
- Striped and animated options
- Stacked progress bars
