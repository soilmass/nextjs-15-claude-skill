---
id: m-stepper
name: Stepper
version: 2.0.0
layer: L2
category: navigation
description: Multi-step progress indicator with validation and navigation
tags: [stepper, wizard, steps, progress, multi-step]
formula: "Stepper = StepIcon(a-display-icon) + StepLabel(a-display-text) + StepButton(a-input-button)"
composes:
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
  - ../atoms/input-button.md
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

# Stepper

## Overview

The Stepper molecule provides visual progress indication for multi-step processes like wizards and onboarding flows. Supports linear and non-linear navigation, step validation, and responsive layouts.

## When to Use

Use this skill when:
- Building multi-step forms or wizards
- Creating onboarding flows
- Showing checkout progress
- Guiding users through complex processes

## Composition Diagram

```
Horizontal Layout:
┌─────────────────────────────────────────────────────────────────────────┐
│                              Stepper                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐             │
│  │   Step 1    │──────│   Step 2    │──────│   Step 3    │             │
│  │ (completed) │      │  (current)  │      │ (upcoming)  │             │
│  ├─────────────┤      ├─────────────┤      ├─────────────┤             │
│  │  ┌───────┐  │      │  ┌───────┐  │      │  ┌───────┐  │             │
│  │  │   ✓   │  │      │  │   2   │  │      │  │   3   │  │             │
│  │  │ (icon)│  │      │  │ (num) │  │      │  │ (num) │  │             │
│  │  └───────┘  │      │  └───────┘  │      │  └───────┘  │             │
│  │   Account   │      │   Profile   │      │   Confirm   │             │
│  │   (label)   │      │   (label)   │      │   (label)   │             │
│  └─────────────┘      └─────────────┘      └─────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘

Vertical Layout:
┌────────────────────────────────────┐
│  ●────  Account (completed)        │
│  │      Create your account        │
│  │                                 │
│  ◉────  Profile (current)          │
│  │      Add your details           │
│  │                                 │
│  ○      Confirm (upcoming)         │
│         Review and submit          │
└────────────────────────────────────┘
```

## Atoms Used

- [display-icon](../atoms/display-icon.md) - Step icons and check marks
- [display-text](../atoms/display-text.md) - Step labels
- [input-button](../atoms/input-button.md) - Clickable steps

## Implementation

```typescript
// components/ui/stepper.tsx
"use client";

import * as React from "react";
import { Check, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "upcoming" | "current" | "completed" | "error";

interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
}

interface StepperProps {
  /** Step definitions */
  steps: Step[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Steps with errors */
  errorSteps?: number[];
  /** Callback when step clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Allow clicking completed steps */
  allowClickBack?: boolean;
  /** Allow clicking future steps */
  allowClickForward?: boolean;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  errorSteps = [],
  onStepClick,
  allowClickBack = true,
  allowClickForward = false,
  orientation = "horizontal",
  size = "md",
  className,
}: StepperProps) {
  const getStepStatus = (index: number): StepStatus => {
    if (errorSteps.includes(index)) return "error";
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "upcoming";
  };

  const isClickable = (index: number) => {
    if (!onStepClick) return false;
    const status = getStepStatus(index);
    if (status === "completed" && allowClickBack) return true;
    if (status === "upcoming" && allowClickForward) return true;
    return false;
  };

  const sizeStyles = {
    sm: {
      indicator: "h-6 w-6 text-xs",
      label: "text-xs",
      description: "text-xs",
      connector: orientation === "horizontal" ? "h-0.5" : "w-0.5",
    },
    md: {
      indicator: "h-8 w-8 text-sm",
      label: "text-sm",
      description: "text-xs",
      connector: orientation === "horizontal" ? "h-0.5" : "w-0.5",
    },
    lg: {
      indicator: "h-10 w-10 text-base",
      label: "text-base",
      description: "text-sm",
      connector: orientation === "horizontal" ? "h-1" : "w-1",
    },
  };

  const styles = sizeStyles[size];

  return (
    <nav aria-label="Progress" className={className}>
      <ol
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "items-center"
            : "flex-col"
        )}
        role="list"
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const clickable = isClickable(index);
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn(
                "relative",
                orientation === "horizontal" && !isLast && "flex-1",
                orientation === "vertical" && !isLast && "pb-8"
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  orientation === "vertical" && "gap-4"
                )}
              >
                {/* Step Indicator */}
                <button
                  type="button"
                  onClick={() => clickable && onStepClick?.(index)}
                  disabled={!clickable}
                  className={cn(
                    "relative z-10 flex items-center justify-center rounded-full border-2 transition-colors",
                    styles.indicator,
                    clickable && "cursor-pointer",
                    !clickable && "cursor-default",
                    status === "completed" && "border-primary bg-primary text-primary-foreground",
                    status === "current" && "border-primary bg-background text-primary",
                    status === "upcoming" && "border-muted bg-background text-muted-foreground",
                    status === "error" && "border-destructive bg-destructive text-destructive-foreground",
                    clickable && "hover:border-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  )}
                  aria-current={status === "current" ? "step" : undefined}
                >
                  {status === "completed" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : status === "error" ? (
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                {/* Labels (horizontal) */}
                {orientation === "horizontal" && (
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={cn(
                        styles.label,
                        "font-medium",
                        status === "current" && "text-primary",
                        status === "upcoming" && "text-muted-foreground",
                        status === "error" && "text-destructive"
                      )}
                    >
                      {step.label}
                      {step.optional && (
                        <span className="text-muted-foreground font-normal ml-1">
                          (Optional)
                        </span>
                      )}
                    </p>
                    {step.description && (
                      <p className={cn(styles.description, "text-muted-foreground")}>
                        {step.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Labels (vertical) */}
                {orientation === "vertical" && (
                  <div>
                    <p
                      className={cn(
                        styles.label,
                        "font-medium",
                        status === "current" && "text-primary",
                        status === "upcoming" && "text-muted-foreground",
                        status === "error" && "text-destructive"
                      )}
                    >
                      {step.label}
                      {step.optional && (
                        <span className="text-muted-foreground font-normal ml-1">
                          (Optional)
                        </span>
                      )}
                    </p>
                    {step.description && (
                      <p className={cn(styles.description, "text-muted-foreground mt-0.5")}>
                        {step.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Connector (horizontal) */}
                {orientation === "horizontal" && !isLast && (
                  <div
                    className={cn(
                      "flex-1 mx-4",
                      styles.connector,
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Connector (vertical) */}
              {orientation === "vertical" && !isLast && (
                <div
                  className={cn(
                    "absolute left-4 top-8 -ml-px h-full -translate-x-1/2",
                    styles.connector,
                    index < currentStep ? "bg-primary" : "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

```typescript
// components/ui/stepper-content.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Stepper } from "./stepper";

interface Step {
  id: string;
  label: string;
  description?: string;
  content: React.ReactNode;
  optional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

interface StepperContentProps {
  steps: Step[];
  onComplete?: () => void;
  className?: string;
}

export function StepperContent({
  steps,
  onComplete,
  className,
}: StepperContentProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [errorSteps, setErrorSteps] = React.useState<number[]>([]);
  const [isValidating, setIsValidating] = React.useState(false);

  const goToNext = async () => {
    const step = steps[currentStep];
    
    if (step.validate) {
      setIsValidating(true);
      const isValid = await step.validate();
      setIsValidating(false);
      
      if (!isValid) {
        setErrorSteps([...errorSteps, currentStep]);
        return;
      }
    }

    setErrorSteps(errorSteps.filter((i) => i !== currentStep));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={cn("space-y-8", className)}>
      <Stepper
        steps={steps.map(({ id, label, description, optional }) => ({
          id,
          label,
          description,
          optional,
        }))}
        currentStep={currentStep}
        errorSteps={errorSteps}
        onStepClick={setCurrentStep}
        allowClickBack
      />

      <div className="min-h-[200px]">
        {steps[currentStep].content}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button onClick={goToNext} disabled={isValidating}>
          {isValidating ? "Validating..." : isLastStep ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
}
```

### Key Implementation Notes

1. **Non-Linear Navigation**: `allowClickBack` and `allowClickForward` control step accessibility
2. **Validation**: Optional `validate` function for step completion rules

## Variants

### Horizontal (Default)

```tsx
<Stepper
  steps={[
    { id: "account", label: "Account" },
    { id: "profile", label: "Profile" },
    { id: "confirm", label: "Confirm" },
  ]}
  currentStep={1}
/>
```

### Vertical

```tsx
<Stepper
  steps={steps}
  currentStep={1}
  orientation="vertical"
/>
```

### With Descriptions

```tsx
<Stepper
  steps={[
    { id: "account", label: "Account", description: "Create your account" },
    { id: "profile", label: "Profile", description: "Add your details" },
    { id: "confirm", label: "Confirm", description: "Review and submit" },
  ]}
  currentStep={1}
/>
```

### With Custom Icons

```tsx
import { User, Settings, Check } from "lucide-react";

<Stepper
  steps={[
    { id: "account", label: "Account", icon: <User className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    { id: "done", label: "Done", icon: <Check className="h-4 w-4" /> },
  ]}
  currentStep={1}
/>
```

### With Content and Navigation

```tsx
<StepperContent
  steps={[
    {
      id: "account",
      label: "Account",
      content: <AccountForm />,
      validate: () => validateAccount(),
    },
    {
      id: "profile",
      label: "Profile",
      content: <ProfileForm />,
      optional: true,
    },
    {
      id: "confirm",
      label: "Confirm",
      content: <ConfirmationPage />,
    },
  ]}
  onComplete={() => handleSubmit()}
/>
```

## States

| State | Indicator BG | Indicator Border | Text | Connector |
|-------|--------------|------------------|------|-----------|
| Upcoming | background | muted | muted-foreground | muted |
| Current | background | primary | primary | muted |
| Completed | primary | primary | foreground | primary |
| Error | destructive | destructive | destructive | - |

## Accessibility

### Required ARIA Attributes

- `nav` with `aria-label="Progress"`
- `ol` with `role="list"`
- `aria-current="step"` on current step

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between clickable steps |
| `Enter/Space` | Activate step |

### Screen Reader Announcements

- "Progress navigation" landmark
- Step number and label announced
- "Current step" for active step
- "Completed" for finished steps

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install lucide-react
```

## Examples

### Checkout Flow

```tsx
import { StepperContent } from "@/components/ui/stepper-content";

export function CheckoutWizard() {
  return (
    <StepperContent
      steps={[
        {
          id: "cart",
          label: "Cart",
          description: "Review your items",
          content: <CartReview />,
        },
        {
          id: "shipping",
          label: "Shipping",
          description: "Enter address",
          content: <ShippingForm />,
          validate: validateShipping,
        },
        {
          id: "payment",
          label: "Payment",
          description: "Payment details",
          content: <PaymentForm />,
          validate: validatePayment,
        },
        {
          id: "confirm",
          label: "Confirm",
          description: "Place order",
          content: <OrderConfirmation />,
        },
      ]}
      onComplete={handlePlaceOrder}
    />
  );
}
```

### Onboarding Flow

```tsx
import { Stepper } from "@/components/ui/stepper";
import { useState } from "react";

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: "welcome", label: "Welcome" },
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "complete", label: "Complete" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        orientation="horizontal"
        size="lg"
      />
      
      <div className="mt-8">
        {currentStep === 0 && <WelcomeStep />}
        {currentStep === 1 && <ProfileStep />}
        {currentStep === 2 && <PreferencesStep />}
        {currentStep === 3 && <CompleteStep />}
      </div>
      
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Too Many Steps

```tsx
// Bad - cognitive overload
<Stepper steps={[...Array(10)].map((_, i) => ({ id: `step${i}`, label: `Step ${i}` }))} />

// Good - consolidate into logical groups (3-5 steps)
<Stepper steps={[
  { id: "info", label: "Information" },
  { id: "review", label: "Review" },
  { id: "confirm", label: "Confirm" },
]} />
```

### No Progress Persistence

```tsx
// Bad - progress lost on page reload
const [step, setStep] = useState(0);

// Good - persist to URL or storage
const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(0));
```

### Non-Linear Without Validation

```tsx
// Bad - can skip required steps
<Stepper allowClickForward steps={steps} />

// Good - validate before allowing forward navigation
<Stepper
  allowClickForward={false}
  allowClickBack={true}
  steps={steps}
/>
```

## Related Skills

### Composes From
- [atoms/display-icon](../atoms/display-icon.md) - Step icons
- [atoms/input-button](../atoms/input-button.md) - Step buttons
- [atoms/feedback-progress](../atoms/feedback-progress.md) - Progress concept

### Composes Into
- [organisms/multi-step-form](../organisms/multi-step-form.md) - Form wizard
- [organisms/checkout-form](../organisms/checkout-form.md) - Checkout flow

### Alternatives
- [molecules/tabs](./tabs.md) - For non-sequential content
- [atoms/feedback-progress](../atoms/feedback-progress.md) - For simple progress

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Horizontal and vertical orientations
- StepperContent with validation
- Size variants
