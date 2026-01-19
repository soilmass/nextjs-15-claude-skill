---
id: o-onboarding-flow
name: Onboarding Flow
version: 2.0.0
layer: L3
category: user
composes:
  - ../molecules/stepper.md
  - ../molecules/form-field.md
description: Multi-step user onboarding wizard with progress tracking and persistence
tags: [onboarding, wizard, steps, flow, welcome]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "OnboardingFlow = Stepper(m-stepper) + FormField(m-form-field) + Button(a-button) + Input(a-input) + Icon(a-icon)"
dependencies:
  - react
  - framer-motion
  - react-hook-form
  - zod
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Onboarding Flow

## Overview

A multi-step onboarding wizard organism with progress tracking, form validation per step, persistence across sessions, and smooth animations. Supports skippable and required steps.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OnboardingFlow                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ProgressIndicator (Stepper m-stepper)                               │   │
│  │                                                                     │   │
│  │     ┌───┐         ┌───┐         ┌───┐                               │   │
│  │     │ ✓ │─────────│ 2 │─────────│ 3 │                               │   │
│  │     └───┘         └───┘         └───┘                               │   │
│  │    Profile        Team         Goals                                │   │
│  │   (completed)   (current)     (pending)                             │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ StepHeader                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    ┌──────────┐                                │ │   │
│  │  │                    │   Icon   │                                │ │   │
│  │  │                    │(a-icon)  │                                │ │   │
│  │  │                    │   🏢     │                                │ │   │
│  │  │                    └──────────┘                                │ │   │
│  │  │              About your team                                   │ │   │
│  │  │      We'll tailor features for your team size                  │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ StepContent (FormField m-form-field)                                │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Company Name                                                   │ │   │
│  │  │ ┌──────────────────────────────────────────────────────────┐   │ │   │
│  │  │ │ Input (a-input)                                          │   │ │   │
│  │  │ │ Acme Inc.                                                 │   │ │   │
│  │  │ └──────────────────────────────────────────────────────────┘   │ │   │
│  │  │                                                                │ │   │
│  │  │ Team Size                                                      │ │   │
│  │  │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │ │   │
│  │  │ │   1-5     │ │   6-20    │ │  21-100   │ │   100+    │       │ │   │
│  │  │ │    ○      │ │    ●      │ │    ○      │ │    ○      │       │ │   │
│  │  │ └───────────┘ └───────────┘ └───────────┘ └───────────┘       │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ StepNavigation                                                      │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  ┌──────────┐                         [Skip]  ┌────────────────┐   │   │
│  │  │  Button  │                                 │     Button     │   │   │
│  │  │  ← Back  │                                 │  Continue →    │   │   │
│  │  └──────────┘                                 └────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/onboarding-flow.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  User,
  Building2,
  Target,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  component: React.ComponentType<StepComponentProps>;
  schema?: z.ZodType<any>;
  skippable?: boolean;
  onComplete?: (data: any) => Promise<void>;
}

interface StepComponentProps {
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  data: Record<string, any>;
  setData: (data: Record<string, any>) => void;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: (data: Record<string, any>) => Promise<void>;
  onSkip?: () => void;
  initialData?: Record<string, any>;
  persistKey?: string;
}

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// Progress Indicator
function ProgressIndicator({
  steps,
  currentStep,
  completedSteps,
}: {
  steps: OnboardingStep[];
  currentStep: number;
  completedSteps: Set<string>;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = index === currentStep;
        const isPast = index < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                isCompleted && 'bg-primary border-primary text-primary-foreground',
                isCurrent && !isCompleted && 'border-primary text-primary',
                !isCurrent && !isCompleted && 'border-muted text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 transition-colors',
                  isPast || isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Step Header
function StepHeader({ step }: { step: OnboardingStep }) {
  return (
    <div className="text-center mb-8">
      {step.icon && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {step.icon}
        </div>
      )}
      <h2 className="text-2xl font-bold">{step.title}</h2>
      {step.description && (
        <p className="mt-2 text-muted-foreground">{step.description}</p>
      )}
    </div>
  );
}

// Navigation Buttons
function StepNavigation({
  onBack,
  onNext,
  onSkip,
  isFirstStep,
  isLastStep,
  isLoading,
  canSkip,
}: {
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  canSkip: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm rounded-lg',
              'hover:bg-accent transition-colors',
              'disabled:opacity-50'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {canSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLastStep ? (
            <>
              Complete
              <Sparkles className="h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Main Onboarding Flow Component
export function OnboardingFlow({
  steps,
  onComplete,
  onSkip,
  initialData = {},
  persistKey,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(
    new Set()
  );
  const [data, setData] = React.useState<Record<string, any>>(initialData);
  const [isLoading, setIsLoading] = React.useState(false);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Load persisted data
  React.useEffect(() => {
    if (persistKey) {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          const { step, data: savedData, completed } = JSON.parse(saved);
          setCurrentStep(step);
          setData(savedData);
          setCompletedSteps(new Set(completed));
        }
      } catch {
        // Invalid data, ignore
      }
    }
  }, [persistKey]);

  // Persist progress
  React.useEffect(() => {
    if (persistKey) {
      localStorage.setItem(
        persistKey,
        JSON.stringify({
          step: currentStep,
          data,
          completed: Array.from(completedSteps),
        })
      );
    }
  }, [persistKey, currentStep, data, completedSteps]);

  // Form setup
  const methods = useForm({
    resolver: step.schema ? zodResolver(step.schema) : undefined,
    defaultValues: data,
    mode: 'onChange',
  });

  // Reset form when step changes
  React.useEffect(() => {
    methods.reset(data);
  }, [currentStep, data, methods]);

  const handleNext = async (formData?: any) => {
    setIsLoading(true);

    try {
      // Merge form data
      const newData = { ...data, ...formData };
      setData(newData);

      // Run step completion handler
      if (step.onComplete) {
        await step.onComplete(newData);
      }

      // Mark step as completed
      setCompletedSteps((prev) => new Set([...prev, step.id]));

      if (isLastStep) {
        // Complete onboarding
        await onComplete(newData);
        if (persistKey) {
          localStorage.removeItem(persistKey);
        }
      } else {
        // Go to next step
        setDirection(1);
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Step error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (step.skippable) {
      if (isLastStep) {
        onComplete(data);
        if (persistKey) {
          localStorage.removeItem(persistKey);
        }
      } else {
        setDirection(1);
        setCurrentStep((prev) => prev + 1);
      }
    } else if (onSkip) {
      onSkip();
    }
  };

  const StepComponent = step.component;

  return (
    <div className="max-w-xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-8">
        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Step Content */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleNext)}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <StepHeader step={step} />
              
              <StepComponent
                onNext={() => methods.handleSubmit(handleNext)()}
                onBack={handleBack}
                onSkip={step.skippable ? handleSkip : undefined}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                data={data}
                setData={setData}
              />
            </motion.div>
          </AnimatePresence>

          <StepNavigation
            onBack={handleBack}
            onNext={() => {}}
            onSkip={handleSkip}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isLoading={isLoading}
            canSkip={step.skippable ?? false}
          />
        </form>
      </FormProvider>
    </div>
  );
}

// Pre-built Step Components

// Profile Step
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(1, 'Please select a role'),
});

export function ProfileStep({ data }: StepComponentProps) {
  const { register, formState: { errors } } = useForm();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">Full Name</label>
        <input
          {...register('name')}
          defaultValue={data.name}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            errors.name && 'border-destructive'
          )}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-destructive">
            {errors.name.message as string}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Your Role</label>
        <select
          {...register('role')}
          defaultValue={data.role}
          className="w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">Select a role...</option>
          <option value="developer">Developer</option>
          <option value="designer">Designer</option>
          <option value="manager">Manager</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
}

// Team/Company Step
export function TeamStep({ data }: StepComponentProps) {
  const { register } = useForm();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">Company Name</label>
        <input
          {...register('company')}
          defaultValue={data.company}
          className="w-full rounded-lg border bg-background px-3 py-2"
          placeholder="Acme Inc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Team Size</label>
        <div className="grid grid-cols-2 gap-2">
          {['1-5', '6-20', '21-100', '100+'].map((size) => (
            <label
              key={size}
              className={cn(
                'flex items-center justify-center rounded-lg border p-3 cursor-pointer',
                'hover:bg-accent transition-colors',
                data.teamSize === size && 'border-primary bg-primary/5'
              )}
            >
              <input
                type="radio"
                {...register('teamSize')}
                value={size}
                defaultChecked={data.teamSize === size}
                className="sr-only"
              />
              <span className="text-sm">{size}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Goals Step
export function GoalsStep({ data, setData }: StepComponentProps) {
  const goals = [
    { id: 'productivity', label: 'Increase productivity' },
    { id: 'collaboration', label: 'Improve collaboration' },
    { id: 'automation', label: 'Automate workflows' },
    { id: 'tracking', label: 'Better project tracking' },
  ];

  const selectedGoals = data.goals || [];

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter((g: string) => g !== goalId)
      : [...selectedGoals, goalId];
    setData({ ...data, goals: newGoals });
  };

  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <button
          key={goal.id}
          type="button"
          onClick={() => toggleGoal(goal.id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors',
            'hover:bg-accent',
            selectedGoals.includes(goal.id) && 'border-primary bg-primary/5'
          )}
        >
          <div
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border',
              selectedGoals.includes(goal.id)
                ? 'bg-primary border-primary'
                : 'border-muted-foreground'
            )}
          >
            {selectedGoals.includes(goal.id) && (
              <Check className="h-3 w-3 text-primary-foreground" />
            )}
          </div>
          <span className="font-medium">{goal.label}</span>
        </button>
      ))}
    </div>
  );
}

// Example usage configuration
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Tell us about yourself',
    description: 'Help us personalize your experience',
    icon: <User className="h-8 w-8" />,
    component: ProfileStep,
    schema: profileSchema,
  },
  {
    id: 'team',
    title: 'About your team',
    description: 'We\'ll tailor features for your team size',
    icon: <Building2 className="h-8 w-8" />,
    component: TeamStep,
    skippable: true,
  },
  {
    id: 'goals',
    title: 'What are your goals?',
    description: 'Select all that apply',
    icon: <Target className="h-8 w-8" />,
    component: GoalsStep,
    skippable: true,
  },
];
```

## Usage

### Basic Usage

```tsx
import { OnboardingFlow, defaultOnboardingSteps } from '@/components/organisms/onboarding-flow';

export function OnboardingPage() {
  const handleComplete = async (data) => {
    await saveUserPreferences(data);
    router.push('/dashboard');
  };

  return (
    <OnboardingFlow
      steps={defaultOnboardingSteps}
      onComplete={handleComplete}
      persistKey="onboarding-progress"
    />
  );
}
```

### Custom Steps

```tsx
const customSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to our app!',
    component: WelcomeStep,
  },
  {
    id: 'preferences',
    title: 'Set your preferences',
    component: PreferencesStep,
    schema: preferencesSchema,
    skippable: true,
  },
];

<OnboardingFlow steps={customSteps} onComplete={handleComplete} />
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Step Pending | Step has not been started | Step circle shows number, muted border and text |
| Step Current | User is currently on this step | Step circle has primary border, step number highlighted |
| Step Completed | Step has been successfully completed | Step circle filled with primary color, checkmark icon |
| Navigating Forward | User clicked Continue/Next | Slide animation right-to-left, direction=1 |
| Navigating Back | User clicked Back button | Slide animation left-to-right, direction=-1 |
| Form Validating | Step form is being validated | No visual change, errors appear if validation fails |
| Form Invalid | Validation failed on current step | Error messages below invalid fields, destructive border |
| Submitting | Processing step completion | Continue button shows spinner, "Loading..." text |
| Skipping | User skipping optional step | Advances to next step without completing current |
| Final Step | User on last step of flow | Continue button shows "Complete" with sparkles icon |
| Flow Complete | All steps finished | Persistence cleared, onComplete callback fired |

## Anti-patterns

### Bad: Not persisting progress across sessions

```tsx
// Bad - Progress lost on page refresh
function OnboardingFlow({ steps }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  // User refreshes, loses all progress!
}

// Good - Persist progress to localStorage
useEffect(() => {
  if (persistKey) {
    localStorage.setItem(
      persistKey,
      JSON.stringify({
        step: currentStep,
        data,
        completed: Array.from(completedSteps),
      })
    );
  }
}, [persistKey, currentStep, data, completedSteps]);

// Restore on mount
useEffect(() => {
  if (persistKey) {
    const saved = localStorage.getItem(persistKey);
    if (saved) {
      const { step, data, completed } = JSON.parse(saved);
      setCurrentStep(step);
      setData(data);
      setCompletedSteps(new Set(completed));
    }
  }
}, [persistKey]);
```

### Bad: Not validating each step before proceeding

```tsx
// Bad - Allow proceeding without validation
const handleNext = () => {
  setCurrentStep(prev => prev + 1);
};

// Good - Validate current step with schema
const handleNext = async (formData: any) => {
  try {
    if (step.schema) {
      step.schema.parse(formData);
    }
    const newData = { ...data, ...formData };
    setData(newData);

    if (step.onComplete) {
      await step.onComplete(newData);
    }

    setCompletedSteps(prev => new Set([...prev, step.id]));
    setCurrentStep(prev => prev + 1);
  } catch (error) {
    // Validation failed, errors shown via react-hook-form
  }
};
```

### Bad: Losing form state when navigating between steps

```tsx
// Bad - Form resets when going back
const handleBack = () => {
  setCurrentStep(prev => prev - 1);
  // Previous data is lost!
};

// Good - Preserve data across step navigation
const handleBack = () => {
  if (!isFirstStep) {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
    // data state is preserved, form reinitializes with it
  }
};

useEffect(() => {
  methods.reset(data); // Restore form values when step changes
}, [currentStep, data]);
```

### Bad: Not cleaning up persisted data on completion

```tsx
// Bad - Stale data remains after completion
const handleComplete = async () => {
  await onComplete(data);
  // localStorage still has old onboarding data!
};

// Good - Clean up persistence on successful completion
if (isLastStep) {
  await onComplete(newData);
  if (persistKey) {
    localStorage.removeItem(persistKey); // Clean up!
  }
}
```

## Related Skills

- `molecules/stepper` - Step indicator
- `patterns/form-validation` - Form validation
- `templates/onboarding-layout` - Onboarding layout

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Multi-step wizard with animations
- Form validation per step
- Progress persistence
- Skippable steps support
