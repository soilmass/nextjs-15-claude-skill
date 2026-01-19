---
id: pt-conditional-fields
name: Conditional Fields
version: 2.0.0
layer: L5
category: forms
description: Implement dynamic conditional form fields in Next.js 15
tags: [forms, conditional, dynamic, react-hook-form, validation]
composes:
  - ../molecules/form-field.md
  - ../atoms/input-text.md
  - ../atoms/input-select.md
  - ../atoms/input-checkbox.md
  - ../atoms/input-number.md
  - ../atoms/input-button.md
dependencies: []
formula: "ConditionalFields = useWatch + discriminatedUnion(Zod) + FormField(m-form-field) + Select(a-input-select) + conditional rendering"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Conditional Fields Pattern

## Overview

Conditional fields show or hide form inputs based on other field values. This pattern covers implementing conditional logic with react-hook-form, dynamic validation with Zod, and accessible field transitions.

## When to Use

- Forms where different field sets appear based on user selection (e.g., employment type, payment method)
- Multi-step forms where the next step depends on previous answers
- Survey or questionnaire forms with branching logic
- Registration forms with different fields for user types (individual vs business)
- Checkout forms with conditional shipping/billing address fields

## Composition Diagram

```
+---------------------------------------------------------------+
|                    Conditional Fields                          |
+---------------------------------------------------------------+
|                                                               |
|  +------------------------+                                   |
|  | Select (a-input-select)|  <-- Trigger field               |
|  | (e.g., employmentType) |                                   |
|  +------------------------+                                   |
|              |                                                |
|              | useWatch monitors value                        |
|              v                                                |
|  +------------------------+                                   |
|  | Discriminated Union    |                                   |
|  | (Zod schema per type)  |                                   |
|  +------------------------+                                   |
|              |                                                |
|              | Conditional render based on type               |
|              v                                                |
|  +-----------------------------------------------------------+|
|  |          ConditionalFieldGroup (animated wrapper)         ||
|  |  +-------------------------------------------------------+||
|  |  | Type A Fields       | Type B Fields    | Type C...    |||
|  |  | +---------------+   | +---------------+ |             |||
|  |  | | FormField     |   | | FormField     | |             |||
|  |  | | (m-form-field)|   | | (m-form-field)| |             |||
|  |  | +---------------+   | +---------------+ |             |||
|  |  | | Input         |   | | Input         | |             |||
|  |  | | (a-input-text)|   | | (a-input-num) | |             |||
|  |  | +---------------+   | +---------------+ |             |||
|  |  +-------------------------------------------------------+||
|  +-----------------------------------------------------------+|
|              |                                                |
|              v                                                |
|  +-----------------------------------------------------------+|
|  |            Button (a-input-button)                        ||
|  |   disabled={!form.formState.isValid}                      ||
|  +-----------------------------------------------------------+|
|                                                               |
+---------------------------------------------------------------+
```

## Implementation

### Basic Conditional Fields

```tsx
// components/forms/conditional-form.tsx
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Dynamic schema based on employment type
const baseSchema = z.object({
  employmentType: z.enum(['employed', 'self-employed', 'unemployed', 'student']),
});

const employedSchema = baseSchema.extend({
  employmentType: z.literal('employed'),
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  salary: z.number().min(0),
});

const selfEmployedSchema = baseSchema.extend({
  employmentType: z.literal('self-employed'),
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.enum(['sole-proprietor', 'llc', 'corporation']),
  annualRevenue: z.number().min(0),
});

const studentSchema = baseSchema.extend({
  employmentType: z.literal('student'),
  schoolName: z.string().min(1, 'School name is required'),
  graduationYear: z.number().min(2020).max(2030),
});

const unemployedSchema = baseSchema.extend({
  employmentType: z.literal('unemployed'),
  seekingWork: z.boolean(),
  lastEmployer: z.string().optional(),
});

// Union schema
const formSchema = z.discriminatedUnion('employmentType', [
  employedSchema,
  selfEmployedSchema,
  studentSchema,
  unemployedSchema,
]);

type FormData = z.infer<typeof formSchema>;

export function ConditionalEmploymentForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employmentType: 'employed',
    },
    mode: 'onChange',
  });

  const employmentType = useWatch({
    control: form.control,
    name: 'employmentType',
  });

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Employment Type Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Employment Status
        </label>
        <select
          {...form.register('employmentType')}
          className="w-full p-2 border rounded"
        >
          <option value="employed">Employed</option>
          <option value="self-employed">Self-Employed</option>
          <option value="student">Student</option>
          <option value="unemployed">Unemployed</option>
        </select>
      </div>

      {/* Conditional Fields */}
      <ConditionalFieldGroup type={employmentType}>
        {employmentType === 'employed' && (
          <EmployedFields form={form} />
        )}
        {employmentType === 'self-employed' && (
          <SelfEmployedFields form={form} />
        )}
        {employmentType === 'student' && (
          <StudentFields form={form} />
        )}
        {employmentType === 'unemployed' && (
          <UnemployedFields form={form} />
        )}
      </ConditionalFieldGroup>

      <button
        type="submit"
        disabled={!form.formState.isValid}
        className="w-full py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Submit
      </button>
    </form>
  );
}

// Animated wrapper for conditional fields
function ConditionalFieldGroup({
  type,
  children,
}: {
  type: string;
  children: React.ReactNode;
}) {
  return (
    <div
      key={type}
      className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      {children}
    </div>
  );
}

function EmployedFields({ form }: { form: any }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <input
          {...form.register('companyName')}
          className="w-full p-2 border rounded"
          placeholder="Enter company name"
        />
        {form.formState.errors.companyName && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.companyName.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Job Title</label>
        <input
          {...form.register('jobTitle')}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Annual Salary</label>
        <input
          type="number"
          {...form.register('salary', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
      </div>
    </>
  );
}

function SelfEmployedFields({ form }: { form: any }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Business Name</label>
        <input
          {...form.register('businessName')}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Business Type</label>
        <select
          {...form.register('businessType')}
          className="w-full p-2 border rounded"
        >
          <option value="sole-proprietor">Sole Proprietor</option>
          <option value="llc">LLC</option>
          <option value="corporation">Corporation</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Annual Revenue</label>
        <input
          type="number"
          {...form.register('annualRevenue', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
      </div>
    </>
  );
}

function StudentFields({ form }: { form: any }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">School Name</label>
        <input
          {...form.register('schoolName')}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Graduation Year</label>
        <input
          type="number"
          {...form.register('graduationYear', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
          min={2020}
          max={2030}
        />
      </div>
    </>
  );
}

function UnemployedFields({ form }: { form: any }) {
  const seekingWork = useWatch({
    control: form.control,
    name: 'seekingWork',
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...form.register('seekingWork')}
          id="seekingWork"
          className="rounded"
        />
        <label htmlFor="seekingWork" className="text-sm">
          Currently seeking employment
        </label>
      </div>
      {seekingWork && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-sm font-medium mb-1">
            Last Employer (optional)
          </label>
          <input
            {...form.register('lastEmployer')}
            className="w-full p-2 border rounded"
          />
        </div>
      )}
    </>
  );
}
```

### Reusable Conditional Field Hook

```typescript
// hooks/use-conditional-field.ts
'use client';

import { useEffect } from 'react';
import { useWatch, useFormContext, FieldPath, FieldValues } from 'react-hook-form';

interface UseConditionalFieldOptions<T extends FieldValues> {
  watchField: FieldPath<T>;
  condition: (value: any) => boolean;
  fieldsToReset?: FieldPath<T>[];
  resetValue?: any;
}

export function useConditionalField<T extends FieldValues>({
  watchField,
  condition,
  fieldsToReset = [],
  resetValue = undefined,
}: UseConditionalFieldOptions<T>) {
  const { control, resetField } = useFormContext<T>();
  
  const watchedValue = useWatch({
    control,
    name: watchField,
  });

  const isVisible = condition(watchedValue);

  // Reset fields when they become hidden
  useEffect(() => {
    if (!isVisible && fieldsToReset.length > 0) {
      fieldsToReset.forEach((field) => {
        resetField(field, { defaultValue: resetValue });
      });
    }
  }, [isVisible, fieldsToReset, resetField, resetValue]);

  return {
    isVisible,
    watchedValue,
  };
}

// Usage in component
function AddressFields() {
  const { isVisible } = useConditionalField({
    watchField: 'hasAlternateAddress',
    condition: (value) => value === true,
    fieldsToReset: ['alternateAddress.street', 'alternateAddress.city'],
  });

  if (!isVisible) return null;

  return (
    <div>
      {/* Alternate address fields */}
    </div>
  );
}
```

### Complex Dependent Fields

```tsx
// components/forms/dependent-fields.tsx
'use client';

import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { useState, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
}

interface State {
  code: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

// Simulated API calls
async function fetchCountries(): Promise<Country[]> {
  return [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'UK', name: 'United Kingdom' },
  ];
}

async function fetchStates(countryCode: string): Promise<State[]> {
  const statesByCountry: Record<string, State[]> = {
    US: [
      { code: 'CA', name: 'California' },
      { code: 'NY', name: 'New York' },
      { code: 'TX', name: 'Texas' },
    ],
    CA: [
      { code: 'ON', name: 'Ontario' },
      { code: 'BC', name: 'British Columbia' },
    ],
    UK: [], // UK doesn't have states
  };
  return statesByCountry[countryCode] || [];
}

async function fetchCities(countryCode: string, stateCode?: string): Promise<City[]> {
  // Simulated city data
  return [
    { id: '1', name: 'City 1' },
    { id: '2', name: 'City 2' },
  ];
}

export function LocationSelector() {
  const form = useForm({
    defaultValues: {
      country: '',
      state: '',
      city: '',
    },
  });

  const country = useWatch({ control: form.control, name: 'country' });
  const state = useWatch({ control: form.control, name: 'state' });

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Load countries on mount
  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!country) {
      setStates([]);
      setCities([]);
      form.setValue('state', '');
      form.setValue('city', '');
      return;
    }

    setIsLoadingStates(true);
    form.setValue('state', '');
    form.setValue('city', '');

    fetchStates(country)
      .then(setStates)
      .finally(() => setIsLoadingStates(false));
  }, [country, form]);

  // Load cities when state changes
  useEffect(() => {
    if (!country) {
      setCities([]);
      return;
    }

    setIsLoadingCities(true);
    form.setValue('city', '');

    fetchCities(country, state || undefined)
      .then(setCities)
      .finally(() => setIsLoadingCities(false));
  }, [country, state, form]);

  return (
    <FormProvider {...form}>
      <form className="space-y-4">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <select
            {...form.register('country')}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* State - only show if country has states */}
        {country && states.length > 0 && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-sm font-medium mb-1">
              State/Province
            </label>
            <select
              {...form.register('state')}
              className="w-full p-2 border rounded"
              disabled={isLoadingStates}
            >
              <option value="">
                {isLoadingStates ? 'Loading...' : 'Select a state'}
              </option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* City */}
        {country && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-sm font-medium mb-1">City</label>
            <select
              {...form.register('city')}
              className="w-full p-2 border rounded"
              disabled={isLoadingCities}
            >
              <option value="">
                {isLoadingCities ? 'Loading...' : 'Select a city'}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
```

### Conditional Validation

```typescript
// lib/schemas/conditional-validation.ts
import { z } from 'zod';

// Schema with conditional validation using refine
export const paymentSchema = z.object({
  paymentMethod: z.enum(['card', 'bank', 'crypto']),
  
  // Card fields
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  
  // Bank fields
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  
  // Crypto fields
  walletAddress: z.string().optional(),
  network: z.enum(['ethereum', 'bitcoin', 'solana']).optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'card') {
    if (!data.cardNumber || data.cardNumber.length < 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid card number is required',
        path: ['cardNumber'],
      });
    }
    if (!data.cardExpiry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expiry date is required',
        path: ['cardExpiry'],
      });
    }
    if (!data.cardCvv || data.cardCvv.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CVV is required',
        path: ['cardCvv'],
      });
    }
  }
  
  if (data.paymentMethod === 'bank') {
    if (!data.bankName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bank name is required',
        path: ['bankName'],
      });
    }
    if (!data.accountNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Account number is required',
        path: ['accountNumber'],
      });
    }
  }
  
  if (data.paymentMethod === 'crypto') {
    if (!data.walletAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wallet address is required',
        path: ['walletAddress'],
      });
    }
    if (!data.network) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Network is required',
        path: ['network'],
      });
    }
  }
});
```

## Variants

### Accessible Conditional Fields

```tsx
// Ensure conditional fields are accessible
function AccessibleConditionalField({
  isVisible,
  label,
  children,
}: {
  isVisible: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      aria-expanded={isVisible}
      aria-hidden={!isVisible}
      className={isVisible ? 'block' : 'hidden'}
    >
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      {children}
    </div>
  );
}
```

## Anti-Patterns

```tsx
// Bad: Not clearing hidden field values
useEffect(() => {
  if (showField) {
    // Field visible, do nothing
  }
  // Hidden field keeps old value!
}, [showField]);

// Good: Clear values when hiding
useEffect(() => {
  if (!showField) {
    form.setValue('conditionalField', '');
  }
}, [showField, form]);

// Bad: Validation on hidden fields
<input {...register('hiddenField', { required: true })} hidden />

// Good: Conditional validation
const schema = z.object({
  showField: z.boolean(),
  field: z.string().optional(),
}).refine(
  (data) => !data.showField || data.field?.length > 0,
  { message: 'Required when visible', path: ['field'] }
);
```

## Related Skills

- `form-validation` - Form validation patterns
- `form-state` - Form state management
- `multi-step-forms` - Multi-step form wizards
- `zod-schemas` - Schema definitions

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial conditional fields pattern
