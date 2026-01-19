---
id: pt-form-validation
name: Form Validation
version: 2.0.0
layer: L5
category: forms
description: Client and server-side form validation with Zod, react-hook-form, and Server Actions
tags: [data, forms, validation, zod, react-hook-form, server-actions]
composes:
  - ../molecules/form-field.md
  - ../atoms/input-text.md
  - ../atoms/input-button.md
  - ../atoms/feedback-alert.md
  - ../atoms/feedback-spinner.md
dependencies:
  react-hook-form: "^7.54.0"
  zod: "^3.23.0"
formula: "FormValidation = Zod schema + react-hook-form + FormField(m-form-field) + Input(a-input-text) + Button(a-input-button) + Server Actions"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Form Validation

## Overview

Form validation in Next.js 15 combines client-side validation for immediate feedback with server-side validation for security. This pattern uses Zod for schema definition, react-hook-form for form state, and Server Actions for submission.

## When to Use

- Building any form that requires data validation before submission
- Creating registration, login, or contact forms with field-level error messages
- Need both client-side instant feedback and server-side security validation
- Forms with complex validation rules (password strength, email uniqueness, etc.)
- Multi-field validation where fields depend on each other (confirm password, date ranges)

## Composition Diagram

```
+-------------------------------------------------------+
|                   Form Validation                      |
+-------------------------------------------------------+
|                                                       |
|  +------------------+   +-------------------------+   |
|  |   Zod Schema     |   |    react-hook-form      |   |
|  |  (validation)    |-->|    (form state)         |   |
|  +------------------+   +-------------------------+   |
|                                |                      |
|                                v                      |
|  +----------------------------------------------------+
|  |              FormField (m-form-field)              |
|  |  +------------+  +----------+  +---------------+   |
|  |  | Label      |  | Input    |  | Error Message |   |
|  |  +------------+  | (a-input |  +---------------+   |
|  |                  | -text)   |                      |
|  |                  +----------+                      |
|  +----------------------------------------------------+
|                                |                      |
|                                v                      |
|  +----------------------------------------------------+
|  |              Button (a-input-button)               |
|  |  [Submit] with Spinner (a-feedback-spinner)        |
|  +----------------------------------------------------+
|                                |                      |
|                                v                      |
|  +----------------------------------------------------+
|  |              Server Action                         |
|  |  - Re-validate with Zod on server                  |
|  |  - Return ActionState with errors                  |
|  +----------------------------------------------------+
|                                |                      |
|                                v                      |
|  +----------------------------------------------------+
|  |              Alert (a-feedback-alert)              |
|  |  - Success/Error messages                          |
|  +----------------------------------------------------+
|                                                       |
+-------------------------------------------------------+
```

## Schema Definition

```typescript
// lib/validations/user.ts
import { z } from 'zod';

// Reusable schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

// Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Profile update schema
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  avatar: z.string().url().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
```

## React Hook Form + Zod

```typescript
// components/register-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Set field-specific errors from server
        if (error.field) {
          setError(error.field, { message: error.message });
        } else {
          setError('root', { message: error.message });
        }
        return;
      }

      // Handle success
    } catch (error) {
      setError('root', { message: 'Something went wrong' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Doe"
          aria-invalid={!!errors.name}
        />
        <FormMessage>{errors.name?.message}</FormMessage>
      </FormField>

      <FormField>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john@example.com"
          aria-invalid={!!errors.email}
        />
        <FormMessage>{errors.email?.message}</FormMessage>
      </FormField>

      <FormField>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        <FormMessage>{errors.password?.message}</FormMessage>
      </FormField>

      <FormField>
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
        />
        <FormMessage>{errors.confirmPassword?.message}</FormMessage>
      </FormField>

      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
```

## Server Action with Validation

```typescript
// app/actions/auth.ts
'use server';

import { z } from 'zod';
import { registerSchema } from '@/lib/validations/user';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function registerUser(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // Parse form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  // Validate with Zod
  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = result.data;

  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      errors: { email: ['Email already registered'] },
    };
  }

  // Create user
  try {
    const hashedPassword = await hash(password, 12);
    
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    redirect('/login?registered=true');
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create account',
    };
  }
}
```

## With useActionState

```typescript
// components/register-form-action.tsx
'use client';

import { useActionState } from 'react';
import { registerUser, type ActionState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';

export function RegisterFormAction() {
  const [state, action, isPending] = useActionState<ActionState | null, FormData>(
    registerUser,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <FormField>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          aria-invalid={!!state?.errors?.name}
        />
        <FormMessage>{state?.errors?.name?.[0]}</FormMessage>
      </FormField>

      <FormField>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          aria-invalid={!!state?.errors?.email}
        />
        <FormMessage>{state?.errors?.email?.[0]}</FormMessage>
      </FormField>

      <FormField>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input
          id="password"
          name="password"
          type="password"
          aria-invalid={!!state?.errors?.password}
        />
        <FormMessage>{state?.errors?.password?.[0]}</FormMessage>
      </FormField>

      <FormField>
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          aria-invalid={!!state?.errors?.confirmPassword}
        />
        <FormMessage>{state?.errors?.confirmPassword?.[0]}</FormMessage>
      </FormField>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
```

## Real-time Validation

```typescript
// components/email-input.tsx
'use client';

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { checkEmailAvailable } from '@/app/actions/auth';
import { Input } from '@/components/ui/input';
import { Check, X, Loader2 } from 'lucide-react';

export function EmailInput({ register, errors }) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const checkEmail = useDebouncedCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const result = await checkEmailAvailable(email);
      setAvailable(result);
    } finally {
      setChecking(false);
    }
  }, 500);

  return (
    <div className="relative">
      <Input
        {...register('email', {
          onChange: (e) => checkEmail(e.target.value),
        })}
        type="email"
        placeholder="email@example.com"
        className="pr-10"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {!checking && available === true && <Check className="h-4 w-4 text-green-500" />}
        {!checking && available === false && <X className="h-4 w-4 text-red-500" />}
      </div>
      {errors.email && (
        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
      )}
      {available === false && !errors.email && (
        <p className="text-sm text-destructive mt-1">Email already taken</p>
      )}
    </div>
  );
}
```

## Multi-step Form Validation

```typescript
// lib/validations/checkout.ts
import { z } from 'zod';

export const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
});

export const shippingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(5),
});

export const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cvc: z.string().regex(/^\d{3,4}$/),
});

// Combined for final validation
export const checkoutSchema = z.object({
  contact: contactSchema,
  shipping: shippingSchema,
  payment: paymentSchema,
});

// components/checkout-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  contactSchema, 
  shippingSchema, 
  paymentSchema,
  type ContactInput,
  type ShippingInput,
  type PaymentInput,
} from '@/lib/validations/checkout';

const steps = [
  { id: 'contact', schema: contactSchema },
  { id: 'shipping', schema: shippingSchema },
  { id: 'payment', schema: paymentSchema },
] as const;

export function CheckoutForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  const currentStep = steps[step];
  
  const form = useForm({
    resolver: zodResolver(currentStep.schema),
    defaultValues: formData[currentStep.id] || {},
  });

  const onSubmit = async (data: any) => {
    const newFormData = {
      ...formData,
      [currentStep.id]: data,
    };
    setFormData(newFormData);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Final submission
      await submitOrder(newFormData);
    }
  };

  const onBack = () => {
    setStep(step - 1);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Step-specific fields */}
      {currentStep.id === 'contact' && <ContactFields form={form} />}
      {currentStep.id === 'shipping' && <ShippingFields form={form} />}
      {currentStep.id === 'payment' && <PaymentFields form={form} />}

      <div className="flex justify-between mt-6">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="submit">
          {step === steps.length - 1 ? 'Place Order' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}
```

## Form Components with Validation

```typescript
// components/ui/form-field.tsx
import { cn } from '@/lib/utils';

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  );
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ children, required, ...props }: FormLabelProps) {
  return (
    <label className="text-sm font-medium leading-none" {...props}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

interface FormMessageProps {
  children?: React.ReactNode;
}

export function FormMessage({ children }: FormMessageProps) {
  if (!children) return null;
  
  return (
    <p className="text-sm text-destructive" role="alert">
      {children}
    </p>
  );
}

interface FormDescriptionProps {
  children: React.ReactNode;
}

export function FormDescription({ children }: FormDescriptionProps) {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  );
}
```

## Anti-patterns

### Don't Skip Server Validation

```typescript
// BAD - Only client validation (can be bypassed)
const onSubmit = async (data) => {
  await saveData(data);  // No server validation!
};

// GOOD - Always validate on server
export async function saveData(formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }
  // Safe to use result.data
}
```

## Related Skills

- [server-actions](./server-actions.md)
- [optimistic-updates](./optimistic-updates.md)
- [multi-step-form](../organisms/multi-step-form.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Zod + react-hook-form
- Server Action validation
- Multi-step forms
