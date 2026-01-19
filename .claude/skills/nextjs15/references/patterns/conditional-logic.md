---
id: pt-conditional-logic
name: Form Conditional Logic
version: 1.0.0
layer: L5
category: forms
description: Dynamic form fields with conditional visibility and validation
tags: [forms, conditional, dynamic, validation, next15]
composes:
  - ../molecules/form-field.md
dependencies: []
formula: "ConditionalLogic = FieldDependencies + WatchedValues + DynamicValidation + ConditionalRendering"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Form Conditional Logic

## When to Use

- Forms with dependent field visibility
- Dynamic validation based on selections
- Multi-path form flows
- Complex business rule forms
- Survey branching logic

## Composition Diagram

```
Conditional Form Flow
=====================

+------------------------------------------+
|  Field A: Select Type                    |
|  [Personal v]                            |
+------------------------------------------+
              |
    +---------+---------+
    |                   |
    v                   v
[Personal]          [Business]
    |                   |
    v                   v
+----------------+  +----------------+
| Date of Birth  |  | Company Name   |
| SSN (optional) |  | Tax ID         |
+----------------+  +----------------+
```

## React Hook Form with Conditional Fields

```typescript
// components/forms/conditional-form.tsx
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';

// Dynamic schema based on type
const createSchema = (type: string) => {
  const baseSchema = {
    type: z.enum(['personal', 'business']),
    email: z.string().email(),
  };

  if (type === 'personal') {
    return z.object({
      ...baseSchema,
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      dateOfBirth: z.string().min(1, 'Date of birth is required'),
      ssn: z.string().optional(),
    });
  }

  return z.object({
    ...baseSchema,
    companyName: z.string().min(1, 'Company name is required'),
    taxId: z.string().min(1, 'Tax ID is required'),
    contactName: z.string().min(1, 'Contact name is required'),
  });
};

export function ConditionalForm() {
  const form = useForm({
    defaultValues: {
      type: 'personal',
      email: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      ssn: '',
      companyName: '',
      taxId: '',
      contactName: '',
    },
  });

  // Watch the type field
  const accountType = useWatch({
    control: form.control,
    name: 'type',
  });

  // Update validation when type changes
  const schema = createSchema(accountType);

  const onSubmit = async (data: any) => {
    // Validate with dynamic schema
    const result = schema.safeParse(data);
    if (!result.success) {
      // Set errors
      result.error.errors.forEach((err) => {
        form.setError(err.path[0] as any, { message: err.message });
      });
      return;
    }

    console.log('Submitted:', result.data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <FormLabel>Account Type</FormLabel>
        <Select
          value={accountType}
          onValueChange={(value) => form.setValue('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField>
        <FormLabel>Email</FormLabel>
        <Input {...form.register('email')} type="email" />
        <FormMessage>{form.formState.errors.email?.message}</FormMessage>
      </FormField>

      {/* Personal Fields */}
      {accountType === 'personal' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <FormLabel>First Name</FormLabel>
              <Input {...form.register('firstName')} />
              <FormMessage>{form.formState.errors.firstName?.message}</FormMessage>
            </FormField>
            <FormField>
              <FormLabel>Last Name</FormLabel>
              <Input {...form.register('lastName')} />
              <FormMessage>{form.formState.errors.lastName?.message}</FormMessage>
            </FormField>
          </div>
          <FormField>
            <FormLabel>Date of Birth</FormLabel>
            <Input {...form.register('dateOfBirth')} type="date" />
            <FormMessage>{form.formState.errors.dateOfBirth?.message}</FormMessage>
          </FormField>
          <FormField>
            <FormLabel>SSN (Optional)</FormLabel>
            <Input {...form.register('ssn')} placeholder="XXX-XX-XXXX" />
          </FormField>
        </>
      )}

      {/* Business Fields */}
      {accountType === 'business' && (
        <>
          <FormField>
            <FormLabel>Company Name</FormLabel>
            <Input {...form.register('companyName')} />
            <FormMessage>{form.formState.errors.companyName?.message}</FormMessage>
          </FormField>
          <FormField>
            <FormLabel>Tax ID</FormLabel>
            <Input {...form.register('taxId')} />
            <FormMessage>{form.formState.errors.taxId?.message}</FormMessage>
          </FormField>
          <FormField>
            <FormLabel>Contact Name</FormLabel>
            <Input {...form.register('contactName')} />
            <FormMessage>{form.formState.errors.contactName?.message}</FormMessage>
          </FormField>
        </>
      )}

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Conditional Field Hook

```typescript
// hooks/use-conditional-field.ts
'use client';

import { useWatch, Control } from 'react-hook-form';

type Condition = {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  value: any;
};

type ConditionalRule = {
  conditions: Condition[];
  logic: 'and' | 'or';
};

export function useConditionalField(
  control: Control<any>,
  rule: ConditionalRule
): boolean {
  const watchedFields = rule.conditions.map((c) => c.field);
  const values = useWatch({ control, name: watchedFields });

  const evaluateCondition = (condition: Condition, value: any): boolean => {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'notEquals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      case 'greaterThan':
        return Number(value) > Number(condition.value);
      case 'lessThan':
        return Number(value) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      default:
        return false;
    }
  };

  const results = rule.conditions.map((condition, index) =>
    evaluateCondition(condition, values[index])
  );

  return rule.logic === 'and'
    ? results.every(Boolean)
    : results.some(Boolean);
}

// Usage
function MyForm() {
  const form = useForm();

  const showAdvancedOptions = useConditionalField(form.control, {
    conditions: [
      { field: 'planType', operator: 'equals', value: 'enterprise' },
    ],
    logic: 'and',
  });

  return (
    <form>
      <Select {...form.register('planType')}>...</Select>
      {showAdvancedOptions && (
        <div>Advanced options...</div>
      )}
    </form>
  );
}
```

## Conditional Field Component

```typescript
// components/forms/conditional-field.tsx
'use client';

import { ReactNode } from 'react';
import { useWatch, Control } from 'react-hook-form';

interface ConditionalFieldProps {
  control: Control<any>;
  watchField: string;
  condition: (value: any) => boolean;
  children: ReactNode;
}

export function ConditionalField({
  control,
  watchField,
  condition,
  children,
}: ConditionalFieldProps) {
  const value = useWatch({ control, name: watchField });

  if (!condition(value)) return null;

  return <>{children}</>;
}

// Usage
<ConditionalField
  control={form.control}
  watchField="country"
  condition={(value) => value === 'US'}
>
  <FormField>
    <FormLabel>State</FormLabel>
    <Select {...form.register('state')}>...</Select>
  </FormField>
</ConditionalField>
```

## Multi-Level Conditions

```typescript
// components/forms/nested-conditional-form.tsx
'use client';

import { useForm, useWatch } from 'react-hook-form';

export function NestedConditionalForm() {
  const form = useForm({
    defaultValues: {
      hasVehicle: false,
      vehicleType: '',
      vehicleMake: '',
      truckBedSize: '',
    },
  });

  const hasVehicle = useWatch({ control: form.control, name: 'hasVehicle' });
  const vehicleType = useWatch({ control: form.control, name: 'vehicleType' });

  return (
    <form className="space-y-4">
      <label className="flex items-center gap-2">
        <input type="checkbox" {...form.register('hasVehicle')} />
        I have a vehicle
      </label>

      {hasVehicle && (
        <>
          <FormField>
            <FormLabel>Vehicle Type</FormLabel>
            <Select {...form.register('vehicleType')}>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
            </Select>
          </FormField>

          <FormField>
            <FormLabel>Make</FormLabel>
            <Input {...form.register('vehicleMake')} />
          </FormField>

          {/* Second level conditional */}
          {vehicleType === 'truck' && (
            <FormField>
              <FormLabel>Bed Size</FormLabel>
              <Select {...form.register('truckBedSize')}>
                <SelectItem value="short">Short (5.5 ft)</SelectItem>
                <SelectItem value="standard">Standard (6.5 ft)</SelectItem>
                <SelectItem value="long">Long (8 ft)</SelectItem>
              </Select>
            </FormField>
          )}
        </>
      )}
    </form>
  );
}
```

## Dynamic Validation Schema

```typescript
// lib/validations/dynamic-schema.ts
import { z } from 'zod';

type FieldConfig = {
  name: string;
  type: 'text' | 'email' | 'number' | 'select';
  required: boolean;
  showWhen?: {
    field: string;
    value: any;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
};

export function buildDynamicSchema(
  fields: FieldConfig[],
  formValues: Record<string, any>
) {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    // Skip if condition not met
    if (field.showWhen && formValues[field.showWhen.field] !== field.showWhen.value) {
      continue;
    }

    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'email':
        fieldSchema = z.string().email();
        break;
      case 'number':
        fieldSchema = z.number();
        if (field.validation?.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min);
        }
        if (field.validation?.max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(field.validation.max);
        }
        break;
      default:
        fieldSchema = z.string();
        if (field.validation?.pattern) {
          fieldSchema = (fieldSchema as z.ZodString).regex(new RegExp(field.validation.pattern));
        }
    }

    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }

    schemaObject[field.name] = fieldSchema;
  }

  return z.object(schemaObject);
}
```

## Anti-patterns

### Don't Forget to Clear Hidden Fields

```typescript
// BAD - Hidden fields retain old values
{showField && <Input {...register('conditionalField')} />}

// GOOD - Reset when hiding
useEffect(() => {
  if (!showField) {
    setValue('conditionalField', '');
  }
}, [showField, setValue]);
```

## Related Skills

- [form-validation](./form-validation.md)
- [multi-step-forms](./multi-step-forms.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- useWatch integration
- Dynamic validation
- Nested conditions
