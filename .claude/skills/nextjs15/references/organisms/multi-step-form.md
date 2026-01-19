---
id: o-multi-step-form
name: Multi-step Form
version: 2.1.0
layer: L3
category: forms
description: Multi-step wizard form with progress indicator, validation, and navigation
tags: [form, wizard, stepper, multi-step, progress]
formula: "MultiStepForm = Stepper + FormField[] + Button[back,next,submit] + Progress + AnimatedStepContainer"
composes:
  - ../molecules/stepper.md
  - ../molecules/form-field.md
dependencies: [react-hook-form, zod, lucide-react, framer-motion]
performance:
  impact: medium
  lcp: medium
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Multi-step Form

## Overview

The Multi-step Form organism provides a wizard-style form with step navigation, progress indication, per-step validation, and smooth transitions. Supports linear and non-linear navigation, optional steps, draft saving, step summaries, and optional review step before submission.

## Composition Diagram

```
+------------------------------------------------------------------+
|                        MultiStepForm                              |
|  +------------------------------------------------------------+  |
|  |                      Stepper (Progress)                     |  |
|  |  [1]----[2]----[3]----[4]                                  |  |
|  |  Account  Profile  Preferences  Review                      |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    AnimatePresence                          |  |
|  |  +--------------------------------------------------------+|  |
|  |  |                   StepContent                          ||  |
|  |  |  +--------------------------------------------------+  ||  |
|  |  |  |                 FormField                        |  ||  |
|  |  |  |  [Label]                                        |  ||  |
|  |  |  |  [Input/Select/Textarea]                        |  ||  |
|  |  |  |  [Error Message]                                |  ||  |
|  |  |  +--------------------------------------------------+  ||  |
|  |  |  +--------------------------------------------------+  ||  |
|  |  |  |                 FormField                        |  ||  |
|  |  |  |  [Label]                                        |  ||  |
|  |  |  |  [Input/Select/Textarea]                        |  ||  |
|  |  |  |  [Error Message]                                |  ||  |
|  |  |  +--------------------------------------------------+  ||  |
|  |  +--------------------------------------------------------+|  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                   StepErrorSummary                          |  |
|  |  [Error icon] Please fix the following errors:              |  |
|  |  - Field 1 error                                            |  |
|  |  - Field 2 error                                            |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    Navigation                               |  |
|  |  [Back Button]    [Save Draft]    [Next/Submit Button]     |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## When to Use

Use this skill when:
- Building onboarding flows
- Creating checkout processes
- Implementing registration wizards
- Breaking complex forms into manageable steps
- Forms with conditional/optional sections
- Long forms that benefit from progress indication

## Composes

- [stepper](../molecules/stepper.md) - Progress indicator
- [form-field](../molecules/form-field.md) - Form inputs
- [button](../atoms/button.md) - Navigation buttons
- [progress](../atoms/progress.md) - Progress bar alternative

## Implementation

```typescript
// components/organisms/multi-step-form/types.ts
import { z, ZodObject, ZodRawShape } from "zod";
import { ReactNode } from "react";

export interface StepConfig<T extends ZodRawShape = ZodRawShape> {
  /** Unique step identifier */
  id: string;
  /** Step title displayed in stepper */
  title: string;
  /** Optional step description */
  description?: string;
  /** Zod schema for this step's fields */
  schema: ZodObject<T>;
  /** Whether this step can be skipped */
  optional?: boolean;
  /** Custom icon for the step */
  icon?: ReactNode;
  /** Fields included in this step (for partial validation) */
  fields: string[];
}

export interface MultiStepFormProps<TFormData extends Record<string, unknown>> {
  /** Step configurations */
  steps: StepConfig[];
  /** Complete form schema */
  schema: ZodObject<ZodRawShape>;
  /** Default form values */
  defaultValues?: Partial<TFormData>;
  /** Submit handler */
  onSubmit: (data: TFormData) => Promise<void> | void;
  /** Called when step changes */
  onStepChange?: (step: number, direction: "forward" | "backward") => void;
  /** Called when draft is saved */
  onSaveDraft?: (data: Partial<TFormData>, currentStep: number) => void;
  /** Enable draft saving */
  enableDraftSave?: boolean;
  /** Auto-save interval in ms (0 to disable) */
  autoSaveInterval?: number;
  /** Storage key for draft persistence */
  draftStorageKey?: string;
  /** Show review step before submission */
  showReview?: boolean;
  /** Custom review component */
  reviewComponent?: React.ComponentType<{ data: Partial<TFormData> }>;
  /** Allow navigation to completed steps */
  allowStepNavigation?: boolean;
  /** Stepper orientation */
  stepperOrientation?: "horizontal" | "vertical";
  /** Animation direction */
  animationDirection?: "horizontal" | "vertical";
  /** Children render prop for step content */
  children: (props: MultiStepFormRenderProps<TFormData>) => ReactNode;
  /** Additional class names */
  className?: string;
}

export interface MultiStepFormRenderProps<TFormData> {
  /** Current step index (0-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Current step config */
  stepConfig: StepConfig;
  /** Whether current step is first */
  isFirstStep: boolean;
  /** Whether current step is last */
  isLastStep: boolean;
  /** Form control methods */
  form: UseFormReturn<TFormData>;
  /** Current step's field errors */
  stepErrors: Record<string, string>;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether step is validating */
  isValidating: boolean;
  /** Direction of last navigation */
  direction: "forward" | "backward";
}

export interface StepState {
  visited: boolean;
  completed: boolean;
  hasErrors: boolean;
}

export type FormDirection = "forward" | "backward";
```

```typescript
// components/organisms/multi-step-form/use-multi-step-form.ts
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodObject, ZodRawShape } from "zod";
import { StepConfig, StepState, FormDirection } from "./types";

interface UseMultiStepFormOptions<T extends FieldValues> {
  steps: StepConfig[];
  schema: ZodObject<ZodRawShape>;
  defaultValues?: Partial<T>;
  onStepChange?: (step: number, direction: FormDirection) => void;
  onSaveDraft?: (data: Partial<T>, currentStep: number) => void;
  enableDraftSave?: boolean;
  autoSaveInterval?: number;
  draftStorageKey?: string;
}

export function useMultiStepForm<T extends FieldValues>({
  steps,
  schema,
  defaultValues,
  onStepChange,
  onSaveDraft,
  enableDraftSave = false,
  autoSaveInterval = 0,
  draftStorageKey,
}: UseMultiStepFormOptions<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<FormDirection>("forward");
  const [stepStates, setStepStates] = useState<StepState[]>(
    steps.map(() => ({ visited: false, completed: false, hasErrors: false }))
  );
  const [isValidating, setIsValidating] = useState(false);

  // Load draft from storage on mount
  const loadedDraft = useMemo(() => {
    if (typeof window === "undefined" || !draftStorageKey) return null;
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { data: parsed.data, step: parsed.step };
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }, [draftStorageKey]);

  // Initialize form with react-hook-form
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      ...loadedDraft?.data,
    } as T,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Set initial step from draft
  useEffect(() => {
    if (loadedDraft?.step !== undefined && loadedDraft.step < steps.length) {
      setCurrentStep(loadedDraft.step);
      // Mark previous steps as visited
      setStepStates((prev) =>
        prev.map((state, i) => ({
          ...state,
          visited: i <= loadedDraft.step,
        }))
      );
    }
  }, [loadedDraft, steps.length]);

  // Auto-save draft periodically
  useEffect(() => {
    if (!enableDraftSave || !autoSaveInterval || !draftStorageKey) return;

    const interval = setInterval(() => {
      const data = form.getValues();
      if (draftStorageKey) {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({ data, step: currentStep })
        );
      }
      onSaveDraft?.(data as Partial<T>, currentStep);
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [
    enableDraftSave,
    autoSaveInterval,
    draftStorageKey,
    currentStep,
    form,
    onSaveDraft,
  ]);

  // Mark current step as visited
  useEffect(() => {
    setStepStates((prev) =>
      prev.map((state, i) =>
        i === currentStep ? { ...state, visited: true } : state
      )
    );
  }, [currentStep]);

  // Validate current step fields
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const currentStepConfig = steps[currentStep];
    const fields = currentStepConfig.fields as Path<T>[];

    setIsValidating(true);

    // Trigger validation for current step's fields
    const results = await Promise.all(
      fields.map((field) => form.trigger(field))
    );

    setIsValidating(false);

    const isValid = results.every(Boolean);

    // Update step state
    setStepStates((prev) =>
      prev.map((state, i) =>
        i === currentStep
          ? { ...state, completed: isValid, hasErrors: !isValid }
          : state
      )
    );

    return isValid;
  }, [currentStep, steps, form]);

  // Navigate to next step
  const goToNextStep = useCallback(async (): Promise<boolean> => {
    const currentStepConfig = steps[currentStep];

    // Skip validation for optional steps if no data entered
    if (currentStepConfig.optional) {
      const fields = currentStepConfig.fields as Path<T>[];
      const hasData = fields.some((field) => {
        const value = form.getValues(field);
        return value !== undefined && value !== "" && value !== null;
      });

      if (!hasData) {
        // Skip to next without validation
        if (currentStep < steps.length - 1) {
          setDirection("forward");
          setCurrentStep((prev) => prev + 1);
          onStepChange?.(currentStep + 1, "forward");
          return true;
        }
        return true;
      }
    }

    const isValid = await validateCurrentStep();

    if (isValid && currentStep < steps.length - 1) {
      setDirection("forward");
      setCurrentStep((prev) => prev + 1);
      onStepChange?.(currentStep + 1, "forward");
      return true;
    }

    return isValid;
  }, [currentStep, steps, validateCurrentStep, onStepChange, form]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep - 1, "backward");
    }
  }, [currentStep, onStepChange]);

  // Navigate to specific step (for stepper clicks)
  const goToStep = useCallback(
    async (stepIndex: number): Promise<boolean> => {
      if (stepIndex < 0 || stepIndex >= steps.length) return false;

      // Can always go backward
      if (stepIndex < currentStep) {
        setDirection("backward");
        setCurrentStep(stepIndex);
        onStepChange?.(stepIndex, "backward");
        return true;
      }

      // Going forward requires all intermediate steps to be valid
      if (stepIndex > currentStep) {
        for (let i = currentStep; i < stepIndex; i++) {
          const stepConfig = steps[i];
          const fields = stepConfig.fields as Path<T>[];

          const results = await Promise.all(
            fields.map((field) => form.trigger(field))
          );

          if (!results.every(Boolean) && !stepConfig.optional) {
            setCurrentStep(i);
            return false;
          }
        }

        setDirection("forward");
        setCurrentStep(stepIndex);
        onStepChange?.(stepIndex, "forward");
        return true;
      }

      return true;
    },
    [currentStep, steps, form, onStepChange]
  );

  // Save draft manually
  const saveDraft = useCallback(() => {
    const data = form.getValues();
    if (draftStorageKey) {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ data, step: currentStep })
      );
    }
    onSaveDraft?.(data as Partial<T>, currentStep);
  }, [form, draftStorageKey, currentStep, onSaveDraft]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (draftStorageKey) {
      localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  // Get errors for current step
  const getStepErrors = useCallback((): Record<string, string> => {
    const currentStepConfig = steps[currentStep];
    const errors: Record<string, string> = {};

    currentStepConfig.fields.forEach((field) => {
      const error = form.formState.errors[field];
      if (error?.message) {
        errors[field] = error.message as string;
      }
    });

    return errors;
  }, [currentStep, steps, form.formState.errors]);

  return {
    // State
    currentStep,
    direction,
    stepStates,
    isValidating,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    currentStepConfig: steps[currentStep],
    stepErrors: getStepErrors(),

    // Form
    form,

    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validateCurrentStep,

    // Draft
    saveDraft,
    clearDraft,
    hasDraft: !!loadedDraft,
  };
}
```

```typescript
// components/organisms/multi-step-form/multi-step-form.tsx
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Save, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMultiStepForm } from "./use-multi-step-form";
import { MultiStepFormProps, StepConfig } from "./types";

// Animation variants for step transitions
const slideVariants = {
  enter: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? -300 : 300,
    opacity: 0,
  }),
};

const verticalSlideVariants = {
  enter: (direction: "forward" | "backward") => ({
    y: direction === "forward" ? 50 : -50,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "backward") => ({
    y: direction === "forward" ? -50 : 50,
    opacity: 0,
  }),
};

interface StepErrorSummaryProps {
  errors: Record<string, string>;
  stepTitle: string;
}

function StepErrorSummary({ errors, stepTitle }: StepErrorSummaryProps) {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) return null;

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Please fix the following errors in {stepTitle}</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc list-inside space-y-1">
          {errorEntries.map(([field, message]) => (
            <li key={field} className="text-sm">
              {message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

interface DefaultReviewProps<T> {
  data: Partial<T>;
  steps: StepConfig[];
}

function DefaultReview<T extends Record<string, unknown>>({
  data,
  steps,
}: DefaultReviewProps<T>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Information</h3>
      {steps.map((step) => (
        <div key={step.id} className="border rounded-lg p-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            {step.title}
          </h4>
          <dl className="grid grid-cols-2 gap-2">
            {step.fields.map((field) => {
              const value = data[field];
              if (value === undefined || value === "") return null;
              return (
                <div key={field} className="col-span-1">
                  <dt className="text-xs text-muted-foreground capitalize">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </dt>
                  <dd className="text-sm font-medium">
                    {typeof value === "boolean"
                      ? value
                        ? "Yes"
                        : "No"
                      : String(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}

export function MultiStepForm<TFormData extends FieldValues>({
  steps,
  schema,
  defaultValues,
  onSubmit,
  onStepChange,
  onSaveDraft,
  enableDraftSave = false,
  autoSaveInterval = 0,
  draftStorageKey,
  showReview = false,
  reviewComponent: ReviewComponent,
  allowStepNavigation = true,
  stepperOrientation = "horizontal",
  animationDirection = "horizontal",
  children,
  className,
}: MultiStepFormProps<TFormData>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const {
    currentStep,
    direction,
    stepStates,
    isValidating,
    totalSteps,
    isFirstStep,
    isLastStep,
    currentStepConfig,
    stepErrors,
    form,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    saveDraft,
    clearDraft,
  } = useMultiStepForm<TFormData>({
    steps,
    schema,
    defaultValues,
    onStepChange,
    onSaveDraft,
    enableDraftSave,
    autoSaveInterval,
    draftStorageKey,
  });

  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data as TFormData);
      clearDraft();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  // Handle next button click
  const handleNext = async () => {
    const success = await goToNextStep();
    if (success && isLastStep && !showReview) {
      // Submit form on last step
      handleSubmit();
    }
  };

  // Handle stepper step click
  const handleStepClick = (stepIndex: number) => {
    if (allowStepNavigation) {
      goToStep(stepIndex);
    }
  };

  // Get error steps for stepper
  const errorSteps = stepStates
    .map((state, index) => (state.hasErrors ? index : -1))
    .filter((index) => index !== -1);

  // Determine variants based on animation direction
  const variants =
    animationDirection === "horizontal" ? slideVariants : verticalSlideVariants;

  // Stepper steps configuration
  const stepperSteps = steps.map((step) => ({
    id: step.id,
    label: step.title,
    description: step.description,
    optional: step.optional,
    icon: step.icon,
  }));

  // Check if showing review step
  const isReviewStep = showReview && isLastStep;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn("space-y-8", className)}
      noValidate
    >
      {/* Progress Stepper */}
      <Stepper
        steps={stepperSteps}
        currentStep={currentStep}
        errorSteps={errorSteps}
        onStepClick={allowStepNavigation ? handleStepClick : undefined}
        allowClickBack={allowStepNavigation}
        allowClickForward={false}
        orientation={stepperOrientation}
        aria-label="Form progress"
      />

      {/* Step Content with Animation */}
      <div
        className="relative overflow-hidden min-h-[300px]"
        role="region"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              y: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {/* Announce step change to screen readers */}
            <div className="sr-only" aria-live="assertive">
              Step {currentStep + 1} of {totalSteps}: {currentStepConfig.title}
            </div>

            {/* Review Step or Regular Step Content */}
            {isReviewStep ? (
              ReviewComponent ? (
                <ReviewComponent data={form.getValues() as Partial<TFormData>} />
              ) : (
                <DefaultReview
                  data={form.getValues() as Partial<TFormData>}
                  steps={steps}
                />
              )
            ) : (
              children({
                currentStep,
                totalSteps,
                stepConfig: currentStepConfig,
                isFirstStep,
                isLastStep: showReview ? false : isLastStep,
                form,
                stepErrors,
                isSubmitting,
                isValidating,
                direction,
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step Error Summary */}
      {Object.keys(stepErrors).length > 0 && (
        <StepErrorSummary
          errors={stepErrors}
          stepTitle={currentStepConfig.title}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        {/* Back Button */}
        <Button
          type="button"
          variant="outline"
          onClick={goToPreviousStep}
          disabled={isFirstStep || isSubmitting}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Center Actions */}
        <div className="flex items-center gap-2">
          {enableDraftSave && (
            <Button
              type="button"
              variant="ghost"
              onClick={saveDraft}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          )}

          {/* Step indicator for mobile */}
          <span className="text-sm text-muted-foreground sm:hidden">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>

        {/* Next/Submit Button */}
        {isReviewStep ? (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isValidating || isSubmitting}
            className="gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : isLastStep && !showReview ? (
              isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
```

```typescript
// components/organisms/multi-step-form/step-content.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StepContentProps {
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Whether this step is optional */
  optional?: boolean;
  /** Form fields for this step */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function StepContent({
  title,
  description,
  optional,
  children,
  className,
}: StepContentProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {title}
          {optional && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (Optional)
            </span>
          )}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
```

```typescript
// components/organisms/multi-step-form/index.ts
export { MultiStepForm } from "./multi-step-form";
export { StepContent } from "./step-content";
export { useMultiStepForm } from "./use-multi-step-form";
export type {
  StepConfig,
  MultiStepFormProps,
  MultiStepFormRenderProps,
  StepState,
  FormDirection,
} from "./types";
```

### Key Implementation Notes

1. **Per-Step Validation**: Each step has its own Zod schema and fields list for targeted validation
2. **Draft Persistence**: Auto-saves to localStorage with configurable interval and manual save
3. **Smooth Animations**: Framer Motion for slide transitions with direction-aware animations
4. **Optional Steps**: Steps can be marked optional and skipped without validation
5. **Step Navigation**: Click on completed steps to go back, with validation for forward navigation
6. **Error Summary**: Aggregated error display per step with accessibility announcements
7. **Screen Reader Support**: Live regions announce step changes and validation errors

## Variants

### Basic Multi-step Form

```tsx
import { z } from "zod";
import { MultiStepForm, StepContent } from "@/components/organisms/multi-step-form";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

const accountSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const profileSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
});

const fullSchema = accountSchema.merge(profileSchema);

const steps = [
  {
    id: "account",
    title: "Account",
    description: "Create your account credentials",
    schema: accountSchema,
    fields: ["email", "password"],
  },
  {
    id: "profile",
    title: "Profile",
    description: "Tell us about yourself",
    schema: profileSchema,
    fields: ["firstName", "lastName"],
  },
];

<MultiStepForm
  steps={steps}
  schema={fullSchema}
  onSubmit={async (data) => {
    await createUser(data);
  }}
>
  {({ currentStep, form, stepErrors }) => (
    <>
      {currentStep === 0 && (
        <StepContent title="Account" description="Create your account">
          <FormField label="Email" error={stepErrors.email} required>
            <Input {...form.register("email")} type="email" />
          </FormField>
          <FormField label="Password" error={stepErrors.password} required>
            <Input {...form.register("password")} type="password" />
          </FormField>
        </StepContent>
      )}
      {currentStep === 1 && (
        <StepContent title="Profile" description="Your details">
          <FormField label="First Name" error={stepErrors.firstName} required>
            <Input {...form.register("firstName")} />
          </FormField>
          <FormField label="Last Name" error={stepErrors.lastName} required>
            <Input {...form.register("lastName")} />
          </FormField>
        </StepContent>
      )}
    </>
  )}
</MultiStepForm>
```

### With Review Step

```tsx
function CustomReview({ data }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Confirm Your Details</h3>
      <div className="grid gap-2">
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
      </div>
    </div>
  );
}

<MultiStepForm
  steps={steps}
  schema={fullSchema}
  onSubmit={handleSubmit}
  showReview
  reviewComponent={CustomReview}
>
  {/* Step content */}
</MultiStepForm>
```

### With Optional Steps

```tsx
const steps = [
  {
    id: "required",
    title: "Basic Info",
    schema: basicSchema,
    fields: ["name", "email"],
  },
  {
    id: "optional",
    title: "Preferences",
    description: "You can skip this step",
    schema: preferencesSchema,
    fields: ["theme", "notifications"],
    optional: true,
  },
  {
    id: "confirm",
    title: "Confirm",
    schema: z.object({}),
    fields: [],
  },
];

<MultiStepForm
  steps={steps}
  schema={fullSchema}
  onSubmit={handleSubmit}
>
  {/* Optional step can be skipped */}
</MultiStepForm>
```

### With Draft Saving

```tsx
<MultiStepForm
  steps={steps}
  schema={fullSchema}
  onSubmit={handleSubmit}
  enableDraftSave
  autoSaveInterval={30000} // Auto-save every 30 seconds
  draftStorageKey="onboarding-draft"
  onSaveDraft={(data, step) => {
    console.log("Draft saved at step", step);
  }}
>
  {/* Form content */}
</MultiStepForm>
```

### Vertical Stepper Layout

```tsx
<MultiStepForm
  steps={steps}
  schema={fullSchema}
  onSubmit={handleSubmit}
  stepperOrientation="vertical"
  className="flex gap-8"
>
  {/* Content appears beside vertical stepper */}
</MultiStepForm>
```

## States

| State | Stepper | Content | Navigation |
|-------|---------|---------|------------|
| Initial | Step 1 current | Step 1 content | Back disabled |
| In Progress | Current highlighted | Animated transition | Both enabled |
| Validating | Current step | Loading indicator | Next disabled |
| Error | Error indicator | Error summary | Next enabled |
| Submitting | Final step | Loading state | All disabled |
| Complete | All completed | Success message | Hidden |

## Accessibility

### Required Attributes

- `aria-label` on progress navigation
- `aria-live="polite"` on content region
- `aria-atomic="true"` for complete announcements
- `role="alert"` on error messages
- `aria-current="step"` on current step
- `aria-invalid` on fields with errors

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields and buttons |
| `Enter` | Activate button / Submit current step |
| `Escape` | Cancel current action |
| `Shift+Tab` | Navigate backwards |

### Screen Reader Announcements

- "Step X of Y: Step Title" on step change
- Field errors announced when validation fails
- Form submission status announced
- Optional step status communicated

### Focus Management

- Focus moves to first field on step change
- Focus moves to error summary when validation fails
- Focus returns to trigger after modal/dialog close

## Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install react-hook-form @hookform/resolvers zod framer-motion lucide-react
```

## Examples

### Onboarding Wizard

```tsx
import { z } from "zod";
import { MultiStepForm, StepContent } from "@/components/organisms/multi-step-form";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { User, Building, Settings, Check } from "lucide-react";

const personalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
});

const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Please select your role"),
  teamSize: z.string().min(1, "Please select team size"),
});

const preferencesSchema = z.object({
  notifications: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

const onboardingSchema = personalSchema.merge(companySchema).merge(preferencesSchema);

type OnboardingData = z.infer<typeof onboardingSchema>;

const steps = [
  {
    id: "personal",
    title: "Personal Info",
    description: "Tell us about yourself",
    icon: <User className="h-4 w-4" />,
    schema: personalSchema,
    fields: ["firstName", "lastName", "email"],
  },
  {
    id: "company",
    title: "Company",
    description: "Your organization details",
    icon: <Building className="h-4 w-4" />,
    schema: companySchema,
    fields: ["companyName", "role", "teamSize"],
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Customize your experience",
    icon: <Settings className="h-4 w-4" />,
    schema: preferencesSchema,
    fields: ["notifications", "newsletter", "theme"],
    optional: true,
  },
];

export function OnboardingWizard() {
  const handleSubmit = async (data: OnboardingData) => {
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome! Let's get started</h1>

      <MultiStepForm
        steps={steps}
        schema={onboardingSchema}
        onSubmit={handleSubmit}
        enableDraftSave
        draftStorageKey="onboarding-draft"
        showReview
      >
        {({ currentStep, form, stepErrors }) => (
          <>
            {currentStep === 0 && (
              <StepContent
                title="Personal Information"
                description="We need some basic information to set up your account"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    error={stepErrors.firstName}
                    required
                  >
                    <Input
                      {...form.register("firstName")}
                      placeholder="John"
                    />
                  </FormField>
                  <FormField
                    label="Last Name"
                    error={stepErrors.lastName}
                    required
                  >
                    <Input
                      {...form.register("lastName")}
                      placeholder="Doe"
                    />
                  </FormField>
                </div>
                <FormField
                  label="Email Address"
                  error={stepErrors.email}
                  description="We'll send your login details here"
                  required
                >
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="john@company.com"
                  />
                </FormField>
              </StepContent>
            )}

            {currentStep === 1 && (
              <StepContent
                title="Company Details"
                description="Help us understand your organization"
              >
                <FormField
                  label="Company Name"
                  error={stepErrors.companyName}
                  required
                >
                  <Input
                    {...form.register("companyName")}
                    placeholder="Acme Inc."
                  />
                </FormField>
                <FormField
                  label="Your Role"
                  error={stepErrors.role}
                  required
                >
                  <Select
                    onValueChange={(value) => form.setValue("role", value)}
                    defaultValue={form.getValues("role")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField
                  label="Team Size"
                  error={stepErrors.teamSize}
                  required
                >
                  <Select
                    onValueChange={(value) => form.setValue("teamSize", value)}
                    defaultValue={form.getValues("teamSize")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 people</SelectItem>
                      <SelectItem value="11-50">11-50 people</SelectItem>
                      <SelectItem value="51-200">51-200 people</SelectItem>
                      <SelectItem value="200+">200+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </StepContent>
            )}

            {currentStep === 2 && (
              <StepContent
                title="Preferences"
                description="Customize how you want to use the platform"
                optional
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifications"
                      {...form.register("notifications")}
                    />
                    <Label htmlFor="notifications">
                      Enable push notifications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      {...form.register("newsletter")}
                    />
                    <Label htmlFor="newsletter">
                      Subscribe to our newsletter
                    </Label>
                  </div>
                </div>
                <FormField label="Theme Preference">
                  <Select
                    onValueChange={(value) => form.setValue("theme", value as "light" | "dark" | "system")}
                    defaultValue={form.getValues("theme") || "system"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </StepContent>
            )}
          </>
        )}
      </MultiStepForm>
    </div>
  );
}
```

### Checkout Flow

```tsx
import { z } from "zod";
import { MultiStepForm, StepContent } from "@/components/organisms/multi-step-form";
import { ShoppingCart, Truck, CreditCard, Check } from "lucide-react";

const shippingSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(5, "Valid postal code required"),
  country: z.string().min(1, "Country is required"),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Valid card number required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Use MM/YY format"),
  cvv: z.string().min(3, "CVV required"),
  cardholderName: z.string().min(1, "Cardholder name required"),
});

const checkoutSchema = shippingSchema.merge(paymentSchema);

const checkoutSteps = [
  {
    id: "shipping",
    title: "Shipping",
    description: "Delivery address",
    icon: <Truck className="h-4 w-4" />,
    schema: shippingSchema,
    fields: ["fullName", "address", "city", "postalCode", "country"],
  },
  {
    id: "payment",
    title: "Payment",
    description: "Payment details",
    icon: <CreditCard className="h-4 w-4" />,
    schema: paymentSchema,
    fields: ["cardNumber", "expiryDate", "cvv", "cardholderName"],
  },
];

export function CheckoutForm({ cartItems, onComplete }) {
  return (
    <MultiStepForm
      steps={checkoutSteps}
      schema={checkoutSchema}
      onSubmit={async (data) => {
        await processOrder(data, cartItems);
        onComplete();
      }}
      showReview
      onStepChange={(step) => {
        trackCheckoutStep(step);
      }}
    >
      {({ currentStep, form, stepErrors }) => (
        <>
          {currentStep === 0 && (
            <StepContent title="Shipping Address">
              {/* Shipping fields */}
            </StepContent>
          )}
          {currentStep === 1 && (
            <StepContent title="Payment Information">
              {/* Payment fields */}
            </StepContent>
          )}
        </>
      )}
    </MultiStepForm>
  );
}
```

## Anti-patterns

### Too Many Steps

```tsx
// Bad - overwhelming users
const steps = [
  { id: "1", title: "Name", fields: ["name"] },
  { id: "2", title: "Email", fields: ["email"] },
  { id: "3", title: "Phone", fields: ["phone"] },
  { id: "4", title: "Address Line 1", fields: ["address1"] },
  { id: "5", title: "Address Line 2", fields: ["address2"] },
  // ... 10 more steps
];

// Good - group related fields (3-5 steps max)
const steps = [
  {
    id: "contact",
    title: "Contact Info",
    fields: ["name", "email", "phone"],
  },
  {
    id: "address",
    title: "Address",
    fields: ["address1", "address2", "city", "zip"],
  },
  {
    id: "confirm",
    title: "Confirm",
    fields: [],
  },
];
```

### Validation Only on Submit

```tsx
// Bad - users discover errors at the end
<MultiStepForm
  onSubmit={(data) => {
    const errors = validateAll(data); // Too late!
    if (errors) showErrors(errors);
  }}
>
  {/* Steps without per-step validation */}
</MultiStepForm>

// Good - validate each step
const steps = [
  {
    id: "account",
    schema: accountSchema, // Validated before advancing
    fields: ["email", "password"],
  },
];
```

### No Draft Saving for Long Forms

```tsx
// Bad - users lose progress on page refresh
<MultiStepForm steps={longSteps} onSubmit={handleSubmit}>
  {/* No draft saving */}
</MultiStepForm>

// Good - persist progress
<MultiStepForm
  steps={longSteps}
  onSubmit={handleSubmit}
  enableDraftSave
  autoSaveInterval={30000}
  draftStorageKey="application-form"
>
  {/* Progress saved automatically */}
</MultiStepForm>
```

### Hidden Required Fields

```tsx
// Bad - required fields in collapsed/hidden sections
<StepContent title="Optional Info" optional>
  <FormField label="Actually Required" required>
    {/* Hidden but required - confusing! */}
  </FormField>
</StepContent>

// Good - only optional fields in optional steps
<StepContent title="Preferences" optional>
  <FormField label="Theme">
    {/* Truly optional */}
  </FormField>
</StepContent>
```

### No Error Summary

```tsx
// Bad - only inline errors, easy to miss
{stepErrors.field1 && <span>{stepErrors.field1}</span>}

// Good - aggregated error summary + inline
<StepErrorSummary errors={stepErrors} stepTitle={currentStep.title} />
{/* Plus inline errors on each field */}
```

## Related Skills

### Composes From
- [molecules/stepper](../molecules/stepper.md) - Progress indicator
- [molecules/form-field](../molecules/form-field.md) - Form inputs
- [atoms/button](../atoms/button.md) - Navigation buttons

### Composes Into
- [organisms/checkout-form](./checkout-form.md) - E-commerce checkout
- [templates/onboarding](../templates/onboarding.md) - User onboarding flow
- [organisms/registration-form](./registration-form.md) - User registration

### Alternatives
- [molecules/tabs](../molecules/tabs.md) - For non-sequential sections
- [organisms/accordion-form](./accordion-form.md) - All sections visible, collapsible
- Single-page form - For simpler, shorter forms

---

## Changelog

### 2.1.0 (2025-01-18)
- Added complete TypeScript implementation
- Added formula and composition diagram
- Added comprehensive examples and anti-patterns
- Added draft saving with localStorage persistence
- Added optional step support
- Added review step functionality
- Added Framer Motion animations
- Added step-level error summary
- Enhanced accessibility with ARIA live regions

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Three stepper variants
- Review step support
