---
id: pt-multi-step-forms
name: Multi-Step Form Patterns
version: 2.0.0
layer: L5
category: forms
description: Wizard-style multi-step forms with validation, persistence, and navigation
tags: [forms, multi-step, wizard, validation, react-hook-form, zod]
composes:
  - ../molecules/form-field.md
  - ../molecules/stepper.md
  - ../atoms/input-text.md
  - ../atoms/input-select.md
  - ../atoms/input-checkbox.md
  - ../atoms/input-radio.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
dependencies:
  react-hook-form: "^7.54.0"
formula: "MultiStepForms = Zustand(persist) + StepIndicator(m-stepper) + FormField(m-form-field) + Zod schemas per step + Button(a-input-button)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Multi-Step Form Patterns

## Overview

Multi-step forms (wizards) break complex forms into manageable steps, improving UX by reducing cognitive load. This pattern covers step navigation, per-step validation, data persistence, and progress tracking.

## When to Use

- Complex registration or onboarding flows with many fields
- Checkout processes (contact info -> shipping -> payment -> review)
- Job application forms with multiple sections
- Account setup wizards with progressive disclosure
- Surveys or questionnaires with logical groupings
- Configuration wizards for complex settings

## Composition Diagram

```
+----------------------------------------------------------------------+
|                     Multi-Step Form Pattern                           |
+----------------------------------------------------------------------+
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |              StepIndicator (m-stepper)                          |  |
|  |  +--------+     +--------+     +--------+     +--------+        |  |
|  |  |  (1)   |-----|  (2)   |-----|  (3)   |-----|  (4)   |        |  |
|  |  | Step 1 |     | Step 2 |     | Step 3 |     | Review |        |  |
|  |  | [done] |     |[current|     |[pending|     |[pending|        |  |
|  |  +--------+     +--------+     +--------+     +--------+        |  |
|  +----------------------------------------------------------------+  |
|                                |                                     |
|                                v                                     |
|  +----------------------------------------------------------------+  |
|  |              Step Content (renders based on currentStep)        |  |
|  |  +----------------------------------------------------------+   |  |
|  |  |  Step N Form                                              |   |  |
|  |  |  +----------------------------------------------------+   |   |  |
|  |  |  | useForm with zodResolver(stepNSchema)              |   |   |  |
|  |  |  +----------------------------------------------------+   |   |  |
|  |  |                                                           |   |  |
|  |  |  +---------------+  +---------------+  +---------------+  |   |  |
|  |  |  | FormField     |  | FormField     |  | FormField     |  |   |  |
|  |  |  | (m-form-field)|  | (m-form-field)|  | (m-form-field)|  |   |  |
|  |  |  | + Input       |  | + Select      |  | + Checkbox    |  |   |  |
|  |  |  | (a-input-text)|  | (a-input-sel) |  | (a-input-chk) |  |   |  |
|  |  |  +---------------+  +---------------+  +---------------+  |   |  |
|  |  +----------------------------------------------------------+   |  |
|  +----------------------------------------------------------------+  |
|                                |                                     |
|                                v                                     |
|  +----------------------------------------------------------------+  |
|  |              Navigation Buttons                                 |  |
|  |  +----------------+                    +-------------------+    |  |
|  |  | Back (variant= |                    | Continue/Submit   |    |  |
|  |  | outline)       |                    | (a-input-button)  |    |  |
|  |  | (a-input-btn)  |                    +-------------------+    |  |
|  |  +----------------+                                             |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |              Zustand Store (with persist middleware)            |  |
|  |  - currentStep, totalSteps, data, completedSteps               |  |
|  |  - setStep(), nextStep(), prevStep(), updateData()             |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
+----------------------------------------------------------------------+
```

## Implementation

### Form Store with Zustand

```typescript
// stores/form-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Step 2: Address
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Step 3: Preferences
  notifications: boolean;
  newsletter: boolean;
  theme: "light" | "dark" | "system";
}

interface FormStore {
  currentStep: number;
  totalSteps: number;
  data: Partial<FormData>;
  completedSteps: number[];
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<FormData>) => void;
  markStepComplete: (step: number) => void;
  reset: () => void;
  canProceed: (step: number) => boolean;
}

const initialData: Partial<FormData> = {};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      totalSteps: 3,
      data: initialData,
      completedSteps: [],
      
      setStep: (step) => {
        const { totalSteps, completedSteps } = get();
        // Can only go to completed steps or next incomplete step
        const maxStep = Math.max(...completedSteps, 0) + 1;
        if (step >= 1 && step <= totalSteps && step <= maxStep) {
          set({ currentStep: step });
        }
      },
      
      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },
      
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      updateData: (newData) => {
        set((state) => ({
          data: { ...state.data, ...newData },
        }));
      },
      
      markStepComplete: (step) => {
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
        }));
      },
      
      reset: () => {
        set({
          currentStep: 1,
          data: initialData,
          completedSteps: [],
        });
      },
      
      canProceed: (step) => {
        const { completedSteps } = get();
        return completedSteps.includes(step);
      },
    }),
    {
      name: "multi-step-form",
      partialize: (state) => ({
        data: state.data,
        completedSteps: state.completedSteps,
        currentStep: state.currentStep,
      }),
    }
  )
);
```

### Step Schemas

```typescript
// schemas/registration.ts
import { z } from "zod";

// Step 1: Personal Info
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;

// Step 2: Address
export const addressSchema = z.object({
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid postal code"),
  country: z.string().length(2, "Select a country"),
});

export type Address = z.infer<typeof addressSchema>;

// Step 3: Preferences
export const preferencesSchema = z.object({
  notifications: z.boolean().default(true),
  newsletter: z.boolean().default(false),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});

export type Preferences = z.infer<typeof preferencesSchema>;

// Combined schema for final submission
export const registrationSchema = personalInfoSchema
  .merge(addressSchema)
  .merge(preferencesSchema);

export type Registration = z.infer<typeof registrationSchema>;

// Step configuration
export const STEPS = [
  { id: 1, title: "Personal Info", schema: personalInfoSchema },
  { id: 2, title: "Address", schema: addressSchema },
  { id: 3, title: "Preferences", schema: preferencesSchema },
] as const;
```

### Multi-Step Form Container

```typescript
// components/multi-step-form/form-container.tsx
"use client";

import { useFormStore } from "@/stores/form-store";
import { StepIndicator } from "./step-indicator";
import { PersonalInfoStep } from "./steps/personal-info";
import { AddressStep } from "./steps/address";
import { PreferencesStep } from "./steps/preferences";
import { ReviewStep } from "./steps/review";
import { cn } from "@/lib/utils";

export function MultiStepForm() {
  const { currentStep, totalSteps } = useFormStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <AddressStep />;
      case 3:
        return <PreferencesStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      
      <div className="mt-8">
        {renderStep()}
      </div>
    </div>
  );
}
```

### Step Indicator Component

```typescript
// components/multi-step-form/step-indicator.tsx
"use client";

import { Check } from "lucide-react";
import { useFormStore } from "@/stores/form-store";
import { STEPS } from "@/schemas/registration";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { completedSteps, setStep } = useFormStore();

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isClickable = isCompleted || step.id <= Math.max(...completedSteps, 0) + 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <button
              onClick={() => isClickable && setStep(step.id)}
              disabled={!isClickable}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && !isCompleted && "bg-primary/20 text-primary border-2 border-primary",
                !isCurrent && !isCompleted && "bg-muted text-muted-foreground",
                isClickable && "cursor-pointer hover:opacity-80",
                !isClickable && "cursor-not-allowed opacity-50"
              )}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                step.id
              )}
            </button>
            
            {/* Step label */}
            <span
              className={cn(
                "ml-2 text-sm font-medium hidden sm:block",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
            
            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-4",
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

### Individual Step Components

```typescript
// components/multi-step-form/steps/personal-info.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/form-store";
import { personalInfoSchema, type PersonalInfo } from "@/schemas/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function PersonalInfoStep() {
  const { data, updateData, nextStep, markStepComplete } = useFormStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
    },
  });

  const onSubmit = (values: PersonalInfo) => {
    updateData(values);
    markStepComplete(1);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <p className="text-muted-foreground">
          Please provide your basic information.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name" error={errors.firstName?.message} required>
          <Input {...register("firstName")} placeholder="John" />
        </FormField>

        <FormField label="Last Name" error={errors.lastName?.message} required>
          <Input {...register("lastName")} placeholder="Doe" />
        </FormField>
      </div>

      <FormField label="Email" error={errors.email?.message} required>
        <Input {...register("email")} type="email" placeholder="john@example.com" />
      </FormField>

      <FormField label="Phone" error={errors.phone?.message}>
        <Input {...register("phone")} type="tel" placeholder="+1 (555) 000-0000" />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}

// components/multi-step-form/steps/address.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/form-store";
import { addressSchema, type Address } from "@/schemas/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { COUNTRIES } from "@/lib/constants";

export function AddressStep() {
  const { data, updateData, nextStep, prevStep, markStepComplete } = useFormStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: data.street ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      postalCode: data.postalCode ?? "",
      country: data.country ?? "US",
    },
  });

  const onSubmit = (values: Address) => {
    updateData(values);
    markStepComplete(2);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Address</h2>
        <p className="text-muted-foreground">
          Where should we send your items?
        </p>
      </div>

      <FormField label="Street Address" error={errors.street?.message} required>
        <Input {...register("street")} placeholder="123 Main St" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="City" error={errors.city?.message} required>
          <Input {...register("city")} placeholder="New York" />
        </FormField>

        <FormField label="State" error={errors.state?.message} required>
          <Input {...register("state")} placeholder="NY" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Postal Code" error={errors.postalCode?.message} required>
          <Input {...register("postalCode")} placeholder="10001" />
        </FormField>

        <FormField label="Country" error={errors.country?.message} required>
          <Select {...register("country")}>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}

// components/multi-step-form/steps/preferences.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/form-store";
import { preferencesSchema, type Preferences } from "@/schemas/registration";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField } from "@/components/ui/form-field";

export function PreferencesStep() {
  const { data, updateData, nextStep, prevStep, markStepComplete } = useFormStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Preferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      notifications: data.notifications ?? true,
      newsletter: data.newsletter ?? false,
      theme: data.theme ?? "system",
    },
  });

  const onSubmit = (values: Preferences) => {
    updateData(values);
    markStepComplete(3);
    nextStep();
  };

  const theme = watch("theme");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Preferences</h2>
        <p className="text-muted-foreground">
          Customize your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifications"
            {...register("notifications")}
            defaultChecked={data.notifications}
          />
          <label htmlFor="notifications" className="text-sm font-medium">
            Enable push notifications
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="newsletter"
            {...register("newsletter")}
            defaultChecked={data.newsletter}
          />
          <label htmlFor="newsletter" className="text-sm font-medium">
            Subscribe to newsletter
          </label>
        </div>
      </div>

      <FormField label="Theme Preference">
        <RadioGroup
          value={theme}
          onValueChange={(value) => setValue("theme", value as Preferences["theme"])}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <label htmlFor="light">Light</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <label htmlFor="dark">Dark</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" />
            <label htmlFor="system">System</label>
          </div>
        </RadioGroup>
      </FormField>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Review
        </Button>
      </div>
    </form>
  );
}
```

### Review and Submit Step

```typescript
// components/multi-step-form/steps/review.tsx
"use client";

import { useState } from "react";
import { useFormStore } from "@/stores/form-store";
import { registrationSchema } from "@/schemas/registration";
import { Button } from "@/components/ui/button";
import { submitRegistration } from "@/app/actions/registration";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReviewStep() {
  const router = useRouter();
  const { data, prevStep, reset, setStep } = useFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Final validation
    const result = registrationSchema.safeParse(data);
    if (!result.success) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitRegistration(result.data);
      
      if (response.success) {
        toast.success("Registration successful!");
        reset();
        router.push("/dashboard");
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Review Your Information</h2>
        <p className="text-muted-foreground">
          Please review your information before submitting.
        </p>
      </div>

      {/* Personal Info Section */}
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Personal Information</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{data.firstName} {data.lastName}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{data.email}</dd>
          {data.phone && (
            <>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{data.phone}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Address Section */}
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Address</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
            Edit
          </Button>
        </div>
        <address className="text-sm not-italic">
          {data.street}<br />
          {data.city}, {data.state} {data.postalCode}<br />
          {data.country}
        </address>
      </div>

      {/* Preferences Section */}
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Preferences</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Notifications</dt>
          <dd>{data.notifications ? "Enabled" : "Disabled"}</dd>
          <dt className="text-muted-foreground">Newsletter</dt>
          <dd>{data.newsletter ? "Subscribed" : "Not subscribed"}</dd>
          <dt className="text-muted-foreground">Theme</dt>
          <dd className="capitalize">{data.theme}</dd>
        </dl>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </Button>
      </div>
    </div>
  );
}
```

## Variants

### URL-Based Steps

```typescript
// Use URL params for step navigation (supports back button)
// app/register/[step]/page.tsx
import { redirect } from "next/navigation";

export default async function RegisterStep({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const stepNumber = parseInt(step, 10);

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 4) {
    redirect("/register/1");
  }

  return <StepContent step={stepNumber} />;
}
```

### Server-Side Step Validation

```typescript
// Validate steps server-side before allowing navigation
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith("/register/")) {
    const step = parseInt(path.split("/").pop() || "1", 10);
    const completedSteps = JSON.parse(
      request.cookies.get("completed-steps")?.value || "[]"
    );
    
    // Can only access step if previous steps are completed
    if (step > 1 && !completedSteps.includes(step - 1)) {
      return NextResponse.redirect(new URL("/register/1", request.url));
    }
  }
  
  return NextResponse.next();
}
```

## Anti-patterns

1. **No data persistence**: Losing form data on refresh
2. **All-or-nothing validation**: Validating entire form instead of per-step
3. **No back navigation**: Users can't return to previous steps
4. **Missing progress indication**: Users don't know where they are
5. **Blocking forward navigation**: Making users complete optional fields

## Related Skills

- `L5/patterns/form-validation` - Form validation with Zod
- `L5/patterns/zustand` - State management
- `L5/patterns/local-storage` - Data persistence
- `L5/patterns/server-actions` - Form submission

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Zustand persistence
