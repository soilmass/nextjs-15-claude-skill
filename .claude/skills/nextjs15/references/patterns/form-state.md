---
id: pt-form-state
name: Form State
version: 2.0.0
layer: L5
category: forms
description: Manage form state in Next.js 15 with useActionState, react-hook-form, and Server Actions
tags: [form-state, forms, useActionState, react-hook-form, validation]
composes:
  - ../molecules/form-field.md
  - ../atoms/input-text.md
  - ../atoms/input-textarea.md
  - ../atoms/input-checkbox.md
  - ../atoms/input-radio.md
  - ../atoms/input-button.md
  - ../atoms/input-switch.md
  - ../atoms/feedback-alert.md
  - ../atoms/feedback-spinner.md
dependencies: []
formula: "FormState = useActionState + useFormStatus + react-hook-form + Zod + FormField(m-form-field) + Input atoms + Server Actions"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Form State Pattern

## When to Use

- **Server-validated forms**: Contact forms, simple submissions with Server Actions
- **Complex client forms**: Multi-step, conditional fields, real-time validation
- **Form with file uploads**: Handling FormData with files
- **Optimistic form updates**: Immediate UI feedback before server confirms
- **Form draft persistence**: Auto-saving form progress

**Avoid when**: No form validation needed (simple inputs), or form is part of a state machine flow (use XState).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Form State Patterns                                         │
│                                                             │
│  Pattern 1: Server Actions with useActionState              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Server Action (app/actions/contact.ts)                │  │
│  │  └─ Zod validation ──► return { success, errors }     │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ContactForm                                           │  │
│  │  ├─ useActionState(submitContactForm, initialState)   │  │
│  │  ├─ <form action={formAction}>                        │  │
│  │  ├─ [Input] [Textarea] with error display             │  │
│  │  └─ SubmitButton with useFormStatus() pending         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Pattern 2: react-hook-form with Zod                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ RegistrationForm                                      │  │
│  │  ├─ useForm({ resolver: zodResolver(schema) })        │  │
│  │  ├─ register(), handleSubmit(), formState             │  │
│  │  ├─ [Input] [Checkbox] [Radio] with errors            │  │
│  │  └─ PasswordStrength indicator component              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Pattern 3: Form Persistence                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ useFormPersistence(form, 'draft-key')                 │  │
│  │  ├─ Debounced save to localStorage                    │  │
│  │  ├─ Restore on mount                                  │  │
│  │  └─ clearSavedData() on submit                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Pattern 4: Optimistic Updates                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ useOptimisticForm({ onSubmit, optimisticUpdate })     │  │
│  │  ├─ Immediate UI update                               │  │
│  │  ├─ Rollback on error                                 │  │
│  │  └─ form.reset(defaultValues) on failure              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Form state management in Next.js 15 combines the new `useActionState` hook for Server Actions with libraries like react-hook-form for complex client-side forms. This pattern covers both approaches and hybrid solutions.

## Implementation

### Basic Form with useActionState

```tsx
// app/actions/contact.ts
'use server';

import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export interface ContactFormState {
  success: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
    _form?: string[];
  };
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const result = contactSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Send email, save to database, etc.
    await sendContactEmail(result.data);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: {
        _form: ['Failed to send message. Please try again.'],
      },
    };
  }
}
```

### Contact Form Component

```tsx
// components/contact-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContactForm, type ContactFormState } from '@/app/actions/contact';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          Sending...
        </span>
      ) : (
        'Send Message'
      )}
    </button>
  );
}

function FormField({
  name,
  label,
  type = 'text',
  errors,
  ...props
}: {
  name: string;
  label: string;
  type?: string;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) {
  const Component = type === 'textarea' ? 'textarea' : 'input';
  
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Component
        id={name}
        name={name}
        type={type !== 'textarea' ? type : undefined}
        className={`mt-1 block w-full rounded-md border p-2 ${
          errors ? 'border-red-500' : 'border-gray-300'
        }`}
        aria-invalid={errors ? 'true' : 'false'}
        aria-describedby={errors ? `${name}-error` : undefined}
        {...props}
      />
      {errors && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {errors[0]}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const initialState: ContactFormState = { success: false };
  const [state, formAction] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <div className="p-6 bg-green-50 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-green-800">
          Message Sent!
        </h3>
        <p className="text-green-600">
          We'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.errors?._form && (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          {state.errors._form[0]}
        </div>
      )}

      <FormField
        name="name"
        label="Name"
        required
        errors={state.errors?.name}
      />

      <FormField
        name="email"
        label="Email"
        type="email"
        required
        errors={state.errors?.email}
      />

      <FormField
        name="message"
        label="Message"
        type="textarea"
        rows={4}
        required
        errors={state.errors?.message}
      />

      <SubmitButton />
    </form>
  );
}
```

### Complex Form with react-hook-form

```tsx
// components/registration-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition, useState } from 'react';
import { registerUser } from '@/app/actions/auth';

const registrationSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    notifications: z.enum(['all', 'important', 'none']).default('important'),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      preferences: {
        newsletter: false,
        notifications: 'important',
      },
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegistrationFormData) => {
    setServerError(null);
    
    startTransition(async () => {
      const result = await registerUser(data);
      
      if (result.error) {
        setServerError(result.error);
      } else {
        reset();
        // Handle success (redirect, show message, etc.)
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            {...register('firstName')}
            className={`mt-1 block w-full rounded border p-2 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            {...register('lastName')}
            className={`mt-1 block w-full rounded border p-2 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          {...register('email')}
          className={`mt-1 block w-full rounded border p-2 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          {...register('password')}
          className={`mt-1 block w-full rounded border p-2 ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        
        {/* Password strength indicator */}
        {password && (
          <div className="mt-2">
            <PasswordStrength password={password} />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Confirm Password</label>
        <input
          type="password"
          {...register('confirmPassword')}
          className={`mt-1 block w-full rounded border p-2 ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <fieldset className="border rounded p-4">
        <legend className="text-sm font-medium px-2">Preferences</legend>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('preferences.newsletter')}
              className="rounded"
            />
            <span>Subscribe to newsletter</span>
          </label>

          <div>
            <span className="text-sm font-medium">Notification frequency</span>
            <div className="mt-1 space-y-1">
              {['all', 'important', 'none'].map((value) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={value}
                    {...register('preferences.notifications')}
                  />
                  <span className="capitalize">{value}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          {...register('acceptTerms')}
          className="mt-1 rounded"
        />
        <span className="text-sm">
          I accept the{' '}
          <a href="/terms" className="text-blue-500 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || !isDirty || isPending}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase', valid: /[A-Z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
    { label: 'Special char', valid: /[!@#$%^&*]/.test(password) },
  ];
  
  const strength = checks.filter(c => c.valid).length;
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded ${
              level <= strength
                ? strength <= 2
                  ? 'bg-red-500'
                  : strength === 3
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {checks.map((check) => (
          <span
            key={check.label}
            className={check.valid ? 'text-green-600' : 'text-gray-400'}
          >
            {check.valid ? '✓' : '○'} {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}
```

### Form State Persistence

```tsx
// hooks/use-form-persistence.ts
'use client';

import { useEffect, useCallback } from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

export function useFormPersistence<T extends FieldValues>(
  form: UseFormReturn<T>,
  key: string,
  options: {
    debounceMs?: number;
    exclude?: Path<T>[];
  } = {}
) {
  const { debounceMs = 1000, exclude = [] } = options;
  
  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Reset form with saved values
        form.reset(data, { keepDefaultValues: true });
      } catch (e) {
        console.error('Failed to restore form data:', e);
      }
    }
  }, [key, form]);
  
  // Save on change with debounce
  useEffect(() => {
    const subscription = form.watch((data) => {
      const timeoutId = setTimeout(() => {
        // Remove excluded fields
        const toSave = { ...data };
        exclude.forEach((field) => {
          delete toSave[field];
        });
        
        localStorage.setItem(key, JSON.stringify(toSave));
      }, debounceMs);
      
      return () => clearTimeout(timeoutId);
    });
    
    return () => subscription.unsubscribe();
  }, [form, key, debounceMs, exclude]);
  
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);
  
  return { clearSavedData };
}

// Usage
function MyForm() {
  const form = useForm<FormData>();
  
  const { clearSavedData } = useFormPersistence(form, 'my-form-draft', {
    exclude: ['password', 'confirmPassword'],
  });
  
  const onSubmit = async (data: FormData) => {
    await submitForm(data);
    clearSavedData(); // Clear draft after successful submission
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### Optimistic Form Updates

```tsx
// hooks/use-optimistic-form.ts
'use client';

import { useOptimistic, useTransition } from 'react';
import { useForm } from 'react-hook-form';

interface UseOptimisticFormOptions<T, R> {
  defaultValues: T;
  onSubmit: (data: T) => Promise<R>;
  optimisticUpdate: (current: T, update: Partial<T>) => T;
}

export function useOptimisticForm<T extends object, R>({
  defaultValues,
  onSubmit,
  optimisticUpdate,
}: UseOptimisticFormOptions<T, R>) {
  const [isPending, startTransition] = useTransition();
  const [optimisticData, addOptimisticUpdate] = useOptimistic(
    defaultValues,
    optimisticUpdate
  );
  
  const form = useForm<T>({
    defaultValues: defaultValues as any,
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      // Apply optimistic update
      addOptimisticUpdate(data);
      
      try {
        await onSubmit(data);
      } catch (error) {
        // Revert form to original values on error
        form.reset(defaultValues as any);
        throw error;
      }
    });
  });
  
  return {
    form,
    handleSubmit,
    isPending,
    optimisticData,
  };
}

// Usage
function ProfileForm({ user }: { user: User }) {
  const { form, handleSubmit, isPending, optimisticData } = useOptimisticForm({
    defaultValues: user,
    onSubmit: updateProfile,
    optimisticUpdate: (current, update) => ({ ...current, ...update }),
  });
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Shows optimistic name immediately */}
      <p>Current name: {optimisticData.name}</p>
      <input {...form.register('name')} />
      <button disabled={isPending}>Save</button>
    </form>
  );
}
```

## Variants

### Form with File Upload

```tsx
// components/upload-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface UploadFormData {
  title: string;
  file: FileList;
}

export function UploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const { register, handleSubmit, watch } = useForm<UploadFormData>();
  
  const file = watch('file');
  
  useEffect(() => {
    if (file?.[0]) {
      const url = URL.createObjectURL(file[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);
  
  const onSubmit = async (data: UploadFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('file', data.file[0]);
    
    await fetch('/api/upload', { method: 'POST', body: formData });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      <input type="file" {...register('file')} accept="image/*" />
      {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover" />}
      <button type="submit">Upload</button>
    </form>
  );
}
```

## Anti-Patterns

```tsx
// Bad: Using useState for form state
function BadForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  // Many useState calls, complex validation logic
}

// Good: Use react-hook-form or useActionState
function GoodForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  // Clean, declarative, built-in validation
}

// Bad: Not handling pending state
<form action={serverAction}>
  <button>Submit</button> {/* No feedback during submission */}
</form>

// Good: Show loading state
function GoodForm() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Loading...' : 'Submit'}</button>;
}
```

## Related Skills

- `form-validation` - Validation strategies
- `server-actions` - Server-side form handling
- `zod-schemas` - Type-safe validation
- `autosave` - Auto-saving forms

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial form state pattern with useActionState and react-hook-form
