---
id: a-feedback-progress
name: Progress Bar
version: 2.0.0
layer: L1
category: feedback
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Determinate and indeterminate progress indicators with Radix UI
tags: [progress, loading, bar, determinate, indeterminate]
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

The Progress atom provides visual feedback for ongoing operations with known or unknown completion status. Built on Radix UI Progress for accessibility, supports determinate (percentage-based) and indeterminate (continuous animation) modes.

## When to Use

Use this skill when:
- Showing file upload progress
- Displaying form completion or step progress
- Indicating background processing with known percentage
- Building loading bars for page transitions

## Implementation

```typescript
// components/ui/progress.tsx
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
        xl: "h-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        error: "bg-destructive",
        gradient: "bg-gradient-to-r from-primary to-primary/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  /** Current progress value (0-100) */
  value?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Show indeterminate animation */
  indeterminate?: boolean;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label format */
  formatLabel?: (value: number, max: number) => string;
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      size,
      variant,
      indeterminate = false,
      showLabel = false,
      formatLabel = (v, m) => `${Math.round((v / m) * 100)}%`,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">
              {formatLabel(value, max)}
            </span>
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          value={value}
          max={max}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              indicatorVariants({ variant }),
              indeterminate && "animate-progress-indeterminate"
            )}
            style={{
              transform: indeterminate
                ? undefined
                : `translateX(-${100 - percentage}%)`,
            }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);
Progress.displayName = "Progress";
```

```css
/* Add to globals.css for indeterminate animation */
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}
```

```typescript
// components/ui/circular-progress.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  /** Current value (0-100) */
  value?: number;
  /** Size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Color variant */
  variant?: "default" | "success" | "warning" | "error";
  /** Show percentage in center */
  showLabel?: boolean;
  /** Indeterminate animation */
  indeterminate?: boolean;
  className?: string;
}

export function CircularProgress({
  value = 0,
  size = 48,
  strokeWidth = 4,
  variant = "default",
  showLabel = false,
  indeterminate = false,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const variantColors = {
    default: "stroke-primary",
    success: "stroke-green-500",
    warning: "stroke-yellow-500",
    error: "stroke-destructive",
  };

  return (
    <div
      className={cn("relative inline-flex", className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        className={cn(indeterminate && "animate-spin")}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-secondary"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            variantColors[variant],
            "transition-[stroke-dashoffset] duration-300 ease-out"
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: indeterminate ? circumference * 0.75 : offset,
          }}
        />
      </svg>
      {showLabel && !indeterminate && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
```

```typescript
// components/ui/progress-steps.tsx
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStep,
  orientation = "horizontal",
  className,
}: ProgressStepsProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "vertical" && "flex-col",
        className
      )}
      role="list"
      aria-label="Progress steps"
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3",
              orientation === "horizontal" && "flex-1",
              orientation === "vertical" && "relative"
            )}
            role="listitem"
            aria-current={isCurrent ? "step" : undefined}
          >
            {/* Step indicator */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                isCompleted && "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary text-primary",
                !isCompleted && !isCurrent && "border-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Step content */}
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-sm font-medium",
                  (isCompleted || isCurrent) && "text-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="text-xs text-muted-foreground">
                  {step.description}
                </span>
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && orientation === "horizontal" && (
              <div
                className={cn(
                  "h-0.5 flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Key Implementation Notes

1. **Radix UI Base**: Uses Radix Progress for built-in accessibility (aria-valuenow, aria-valuemin, aria-valuemax)
2. **Transform Animation**: Uses `translateX` for GPU-accelerated progress bar animation

## Variants

### Size Variants

```tsx
<Progress size="xs" value={50} />
<Progress size="sm" value={50} />
<Progress size="md" value={50} /> {/* default */}
<Progress size="lg" value={50} />
<Progress size="xl" value={50} />
```

### Color Variants

```tsx
<Progress variant="default" value={75} />
<Progress variant="success" value={100} />
<Progress variant="warning" value={50} />
<Progress variant="error" value={25} />
<Progress variant="gradient" value={60} />
```

### With Label

```tsx
<Progress value={65} showLabel />
<Progress 
  value={650} 
  max={1000} 
  showLabel 
  formatLabel={(v, m) => `${v}/${m} MB`} 
/>
```

### Indeterminate

```tsx
<Progress indeterminate />
```

### Circular

```tsx
<CircularProgress value={75} showLabel />
<CircularProgress indeterminate size={32} />
```

## States

| State | Fill Width | Color | Animation | Transition |
|-------|------------|-------|-----------|------------|
| Empty | 0% | primary | none | 300ms ease-out |
| Partial | 1-99% | primary | none | 300ms ease-out |
| Complete | 100% | success | pulse once | 300ms + 200ms pulse |
| Indeterminate | varies | primary | slide loop | 1.5s infinite |
| Error | current | destructive | none | 150ms |

## Accessibility

### Required ARIA Attributes

- `role="progressbar"`: Automatically applied by Radix
- `aria-valuenow`: Current progress value
- `aria-valuemin`: Minimum value (0)
- `aria-valuemax`: Maximum value (100)
- `aria-label`: Description of what's progressing

### Keyboard Navigation

| Key | Action |
|-----|--------|
| N/A | Progress bar is non-interactive |

### Screen Reader Announcements

- Announces current percentage when value changes significantly
- "Loading" for indeterminate progress
- Consider periodic announcements for long operations

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-progress": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install @radix-ui/react-progress class-variance-authority lucide-react
```

## Examples

### Basic Usage

```tsx
import { Progress } from "@/components/ui/progress";

export function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-md">
      <Progress value={progress} showLabel />
    </div>
  );
}
```

### File Upload

```tsx
import { Progress } from "@/components/ui/progress";

export function FileUpload({ 
  fileName, 
  progress, 
  status 
}: { 
  fileName: string; 
  progress: number;
  status: "uploading" | "complete" | "error";
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="truncate">{fileName}</span>
        <span>{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        variant={status === "error" ? "error" : status === "complete" ? "success" : "default"}
      />
    </div>
  );
}
```

### Multi-step Form

```tsx
import { ProgressSteps } from "@/components/ui/progress-steps";

const steps = [
  { label: "Account", description: "Create your account" },
  { label: "Profile", description: "Add your details" },
  { label: "Settings", description: "Configure preferences" },
  { label: "Complete", description: "Review and submit" },
];

export function FormWizard({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <ProgressSteps steps={steps} currentStep={currentStep} />
    </div>
  );
}
```

### Loading State with Circular Progress

```tsx
import { CircularProgress } from "@/components/ui/circular-progress";

export function LoadingButton({ loading }: { loading: boolean }) {
  return (
    <button disabled={loading} className="relative px-4 py-2">
      {loading && (
        <CircularProgress 
          indeterminate 
          size={20} 
          strokeWidth={2}
          className="absolute left-3"
        />
      )}
      <span className={loading ? "ml-6" : ""}>
        {loading ? "Loading..." : "Submit"}
      </span>
    </button>
  );
}
```

## Anti-patterns

### Not Providing Max Value

```tsx
// Bad - assumes max is 100, but value is in KB
<Progress value={512} />

// Good - specify max for non-percentage values
<Progress value={512} max={1024} formatLabel={(v, m) => `${v}/${m} KB`} />
```

### Overusing Indeterminate

```tsx
// Bad - using indeterminate when progress is known
const [progress, setProgress] = useState(0);
<Progress indeterminate /> // Ignoring actual progress

// Good - show actual progress when available
<Progress value={progress} />
```

### Missing Context

```tsx
// Bad - progress with no explanation
<Progress value={45} />

// Good - provide context
<div className="space-y-1">
  <span className="text-sm text-muted-foreground">Uploading document.pdf</span>
  <Progress value={45} showLabel />
</div>
```

## Related Skills

### Composes From
- [primitives/motion](../primitives/motion.md) - Animation timing
- [primitives/colors](../primitives/colors.md) - Status colors

### Composes Into
- [molecules/stepper](../molecules/stepper.md) - Multi-step progress
- [organisms/file-uploader](../organisms/file-uploader.md) - Upload progress
- [organisms/multi-step-form](../organisms/multi-step-form.md) - Form wizard

### Alternatives
- [feedback-spinner](./feedback-spinner.md) - When progress is unknown
- [display-skeleton](./display-skeleton.md) - When loading content

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix UI Progress
- Added size and color variants
- CircularProgress and ProgressSteps components
- Indeterminate animation support
