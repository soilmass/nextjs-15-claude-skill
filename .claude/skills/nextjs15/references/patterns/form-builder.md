---
id: pt-form-builder
name: Form Builder
version: 2.0.0
layer: L5
category: forms
description: Dynamic form builder component for creating configurable forms from JSON schema
tags: [forms, dynamic, schema, builder, json-schema, configuration]
composes:
  - ../molecules/form-field.md
  - ../atoms/input-text.md
  - ../atoms/input-textarea.md
  - ../atoms/input-select.md
  - ../atoms/input-checkbox.md
  - ../atoms/input-radio.md
  - ../atoms/input-switch.md
  - ../atoms/input-number.md
  - ../atoms/input-file.md
  - ../atoms/input-button.md
  - ../atoms/display-text.md
dependencies: []
formula: "FormBuilder = JSON Schema + schemaToZod + FormProvider + dynamic field rendering + Input atoms + Zod validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Form Builder

## Overview

A dynamic form builder that generates forms from JSON schema definitions. Supports all standard input types, validation, conditional fields, and custom components. Ideal for admin panels, CMS systems, and configurable user interfaces.

## When to Use

Use this skill when:
- Building admin panels with dynamic forms
- Creating CMS or form management systems
- Need to generate forms from database schemas
- Building survey or questionnaire systems
- Forms need to be configurable without code changes

## Composition Diagram

```
+------------------------------------------------------------------------+
|                          Form Builder Pattern                           |
+------------------------------------------------------------------------+
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |              FormSchema (JSON)                                    |  |
|  |  { id, title, description, sections: [...], columns, submit }     |  |
|  +------------------------------------------------------------------+  |
|                                |                                       |
|                                v                                       |
|  +------------------------------------------------------------------+  |
|  |              formSchemaToZod()                                    |  |
|  |  Converts FormSchema -> z.object({...})                           |  |
|  +------------------------------------------------------------------+  |
|                                |                                       |
|                                v                                       |
|  +------------------------------------------------------------------+  |
|  |              FormBuilder Component                                |  |
|  |  +------------------------------------------------------------+  |  |
|  |  | FormProvider (react-hook-form context)                      |  |  |
|  |  |                                                             |  |  |
|  |  |  +--------------------------------------------------------+ |  |  |
|  |  |  | FormSection (collapsible)                               | |  |  |
|  |  |  |  +----------------------------------------------------+ | |  |  |
|  |  |  |  | Grid Layout (columns: 1-4)                         | | |  |  |
|  |  |  |  |  +----------+ +----------+ +----------+ +--------+ | | |  |  |
|  |  |  |  |  |FormField | |FormField | |FormField | |FormFld | | | |  |  |
|  |  |  |  |  |m-form-fld| |m-form-fld| |m-form-fld| |m-form  | | | |  |  |
|  |  |  |  |  +----------+ +----------+ +----------+ +--------+ | | |  |  |
|  |  |  |  +----------------------------------------------------+ | |  |  |
|  |  |  +--------------------------------------------------------+ |  |  |
|  |  +------------------------------------------------------------+  |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  Field Type -> Atom Mapping:                                           |
|  +------------------------------------------------------------------+  |
|  | text/email/password -> Input (a-input-text)                       |  |
|  | number              -> Input (a-input-number)                     |  |
|  | textarea            -> Textarea (a-input-textarea)                |  |
|  | select              -> Select (a-input-select)                    |  |
|  | checkbox            -> Checkbox (a-input-checkbox)                |  |
|  | radio               -> RadioGroup (a-input-radio)                 |  |
|  | switch              -> Switch (a-input-switch)                    |  |
|  | file                -> Input[type=file] (a-input-file)            |  |
|  | custom              -> CustomComponent (user-provided)            |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  Conditional Logic:                                                    |
|  +------------------------------------------------------------------+  |
|  | shouldShowField()  - evaluates show/hide conditions               |  |
|  | isFieldRequired()  - evaluates conditional requirements           |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
+------------------------------------------------------------------------+
```

## Implementation

```typescript
// lib/form-builder/types.ts
import { z } from 'zod';

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'file'
  | 'rich-text'
  | 'custom';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface FieldCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: unknown;
}

export interface FormFieldSchema {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  
  // Validation
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
    custom?: (value: unknown, formValues: Record<string, unknown>) => string | undefined;
  };
  
  // Options for select, radio, checkbox groups
  options?: FieldOption[];
  
  // Conditional rendering
  conditions?: {
    show?: FieldCondition[];
    hide?: FieldCondition[];
    require?: FieldCondition[];
  };
  
  // Layout
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  className?: string;
  
  // Custom component
  component?: React.ComponentType<CustomFieldProps>;
}

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormFieldSchema[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FormSchema {
  id: string;
  title?: string;
  description?: string;
  sections: FormSection[];
  submitLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
  columns?: 1 | 2 | 3 | 4;
}

export interface CustomFieldProps {
  field: FormFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}
```

```typescript
// lib/form-builder/schema-to-zod.ts
import { z, ZodTypeAny } from 'zod';
import type { FormFieldSchema, FormSchema } from './types';

export function fieldToZod(field: FormFieldSchema): ZodTypeAny {
  let schema: ZodTypeAny;
  
  switch (field.type) {
    case 'text':
    case 'password':
    case 'textarea':
    case 'rich-text':
      schema = z.string();
      if (field.validation?.minLength) {
        schema = (schema as z.ZodString).min(
          field.validation.minLength,
          `Minimum ${field.validation.minLength} characters`
        );
      }
      if (field.validation?.maxLength) {
        schema = (schema as z.ZodString).max(
          field.validation.maxLength,
          `Maximum ${field.validation.maxLength} characters`
        );
      }
      if (field.validation?.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(field.validation.pattern),
          field.validation.patternMessage || 'Invalid format'
        );
      }
      break;
      
    case 'email':
      schema = z.string().email('Invalid email address');
      break;
      
    case 'number':
      schema = z.coerce.number();
      if (field.validation?.min !== undefined) {
        schema = (schema as z.ZodNumber).min(
          field.validation.min,
          `Minimum value is ${field.validation.min}`
        );
      }
      if (field.validation?.max !== undefined) {
        schema = (schema as z.ZodNumber).max(
          field.validation.max,
          `Maximum value is ${field.validation.max}`
        );
      }
      break;
      
    case 'select':
    case 'radio':
      if (field.options?.length) {
        const values = field.options.map(o => o.value) as [string, ...string[]];
        schema = z.enum(values as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;
      
    case 'multiselect':
      schema = z.array(z.string());
      if (field.validation?.min) {
        schema = (schema as z.ZodArray<z.ZodString>).min(
          field.validation.min,
          `Select at least ${field.validation.min} options`
        );
      }
      if (field.validation?.max) {
        schema = (schema as z.ZodArray<z.ZodString>).max(
          field.validation.max,
          `Select at most ${field.validation.max} options`
        );
      }
      break;
      
    case 'checkbox':
    case 'switch':
      schema = z.boolean();
      break;
      
    case 'date':
    case 'datetime':
      schema = z.coerce.date();
      break;
      
    case 'file':
      schema = z.instanceof(File).or(z.instanceof(FileList)).or(z.null());
      break;
      
    default:
      schema = z.unknown();
  }
  
  // Make optional if not required
  if (!field.required) {
    schema = schema.optional();
  }
  
  return schema;
}

export function formSchemaToZod(formSchema: FormSchema): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  
  for (const section of formSchema.sections) {
    for (const field of section.fields) {
      shape[field.name] = fieldToZod(field);
    }
  }
  
  return z.object(shape);
}
```

```tsx
// components/form-builder/form-builder.tsx
'use client';

import * as React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { FormSchema, FormFieldSchema, FormSection, FieldCondition } from '@/lib/form-builder/types';
import { formSchemaToZod } from '@/lib/form-builder/schema-to-zod';
import { cn } from '@/lib/utils';

// Field Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FormBuilderProps {
  schema: FormSchema;
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
  customComponents?: Record<string, React.ComponentType<CustomFieldProps>>;
}

interface CustomFieldProps {
  field: FormFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

function evaluateCondition(
  condition: FieldCondition,
  formValues: Record<string, unknown>
): boolean {
  const fieldValue = formValues[condition.field];
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'notEquals':
      return fieldValue !== condition.value;
    case 'contains':
      return String(fieldValue).includes(String(condition.value));
    case 'greaterThan':
      return Number(fieldValue) > Number(condition.value);
    case 'lessThan':
      return Number(fieldValue) < Number(condition.value);
    case 'isEmpty':
      return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
    case 'isNotEmpty':
      return !!fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
    default:
      return true;
  }
}

function shouldShowField(
  field: FormFieldSchema,
  formValues: Record<string, unknown>
): boolean {
  if (!field.conditions) return !field.hidden;
  
  if (field.conditions.hide?.length) {
    const shouldHide = field.conditions.hide.every(c => evaluateCondition(c, formValues));
    if (shouldHide) return false;
  }
  
  if (field.conditions.show?.length) {
    return field.conditions.show.every(c => evaluateCondition(c, formValues));
  }
  
  return !field.hidden;
}

function isFieldRequired(
  field: FormFieldSchema,
  formValues: Record<string, unknown>
): boolean {
  if (field.conditions?.require?.length) {
    return field.conditions.require.every(c => evaluateCondition(c, formValues));
  }
  return field.required ?? false;
}

function FormField({
  field,
  customComponents,
  disabled,
}: {
  field: FormFieldSchema;
  customComponents?: Record<string, React.ComponentType<CustomFieldProps>>;
  disabled?: boolean;
}) {
  const { control, watch, formState: { errors } } = useFormContext();
  const formValues = watch();
  const error = errors[field.name]?.message as string | undefined;
  
  if (!shouldShowField(field, formValues)) {
    return null;
  }
  
  const isRequired = isFieldRequired(field, formValues);
  const isDisabled = disabled || field.disabled;
  
  // Custom component
  if (field.type === 'custom' && field.component) {
    const CustomComponent = field.component;
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <div className={cn('space-y-2', field.className)}>
            <Label>
              {field.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <CustomComponent
              field={field}
              value={value}
              onChange={onChange}
              error={error}
              disabled={isDisabled}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      />
    );
  }
  
  // Check for registered custom components
  if (customComponents?.[field.type]) {
    const CustomComponent = customComponents[field.type];
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <div className={cn('space-y-2', field.className)}>
            <Label>
              {field.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <CustomComponent
              field={field}
              value={value}
              onChange={onChange}
              error={error}
              disabled={isDisabled}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      />
    );
  }
  
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: controllerField }) => (
        <div className={cn('space-y-2', field.className)}>
          {field.type !== 'checkbox' && field.type !== 'switch' && (
            <Label htmlFor={field.name}>
              {field.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          
          {renderFieldInput(field, controllerField, isDisabled)}
          
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    />
  );
}

function renderFieldInput(
  field: FormFieldSchema,
  controllerField: any,
  disabled?: boolean
) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
      return (
        <Input
          id={field.name}
          type={field.type}
          placeholder={field.placeholder}
          disabled={disabled}
          {...controllerField}
        />
      );
      
    case 'number':
      return (
        <Input
          id={field.name}
          type="number"
          placeholder={field.placeholder}
          disabled={disabled}
          min={field.validation?.min}
          max={field.validation?.max}
          {...controllerField}
          onChange={(e) => controllerField.onChange(e.target.valueAsNumber || '')}
        />
      );
      
    case 'textarea':
      return (
        <Textarea
          id={field.name}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={4}
          {...controllerField}
        />
      );
      
    case 'select':
      return (
        <Select
          value={controllerField.value}
          onValueChange={controllerField.onChange}
          disabled={disabled}
        >
          <SelectTrigger id={field.name}>
            <SelectValue placeholder={field.placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case 'radio':
      return (
        <RadioGroup
          value={controllerField.value}
          onValueChange={controllerField.onChange}
          disabled={disabled}
        >
          {field.options?.map((option) => (
            <div key={String(option.value)} className="flex items-center space-x-2">
              <RadioGroupItem
                value={String(option.value)}
                id={`${field.name}-${option.value}`}
                disabled={option.disabled}
              />
              <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
      
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={controllerField.value}
            onCheckedChange={controllerField.onChange}
            disabled={disabled}
          />
          <Label htmlFor={field.name}>{field.label}</Label>
        </div>
      );
      
    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={field.name}
            checked={controllerField.value}
            onCheckedChange={controllerField.onChange}
            disabled={disabled}
          />
          <Label htmlFor={field.name}>{field.label}</Label>
        </div>
      );
      
    case 'date':
      return (
        <Input
          id={field.name}
          type="date"
          disabled={disabled}
          {...controllerField}
          value={controllerField.value instanceof Date 
            ? controllerField.value.toISOString().split('T')[0]
            : controllerField.value || ''
          }
        />
      );
      
    case 'datetime':
      return (
        <Input
          id={field.name}
          type="datetime-local"
          disabled={disabled}
          {...controllerField}
          value={controllerField.value instanceof Date
            ? controllerField.value.toISOString().slice(0, 16)
            : controllerField.value || ''
          }
        />
      );
      
    case 'file':
      return (
        <Input
          id={field.name}
          type="file"
          disabled={disabled}
          onChange={(e) => controllerField.onChange(e.target.files?.[0] || null)}
        />
      );
      
    default:
      return (
        <Input
          id={field.name}
          placeholder={field.placeholder}
          disabled={disabled}
          {...controllerField}
        />
      );
  }
}

function useFormContext() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
}

const FormContext = React.createContext<ReturnType<typeof useForm> | null>(null);

function FormSectionComponent({
  section,
  customComponents,
  disabled,
  columns,
}: {
  section: FormSection;
  customComponents?: Record<string, React.ComponentType<CustomFieldProps>>;
  disabled?: boolean;
  columns: number;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(section.defaultCollapsed ?? false);
  
  return (
    <div className="space-y-4">
      {section.title && (
        <div
          className={cn(
            'flex items-center gap-2',
            section.collapsible && 'cursor-pointer select-none'
          )}
          onClick={() => section.collapsible && setIsCollapsed(!isCollapsed)}
        >
          {section.collapsible && (
            isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
          <h3 className="text-lg font-semibold">{section.title}</h3>
        </div>
      )}
      
      {section.description && !isCollapsed && (
        <p className="text-sm text-muted-foreground">{section.description}</p>
      )}
      
      {!isCollapsed && (
        <div
          className={cn(
            'grid gap-4',
            columns === 1 && 'grid-cols-1',
            columns === 2 && 'grid-cols-1 md:grid-cols-2',
            columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {section.fields.map((field) => (
            <div
              key={field.name}
              className={cn(
                field.colSpan === 2 && 'md:col-span-2',
                field.colSpan === 3 && 'md:col-span-2 lg:col-span-3',
                field.colSpan === 4 && 'md:col-span-2 lg:col-span-4',
                field.colSpan === 6 && 'col-span-full lg:col-span-6',
                field.colSpan === 12 && 'col-span-full'
              )}
            >
              <FormField
                field={field}
                customComponents={customComponents}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FormBuilder({
  schema,
  defaultValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
  customComponents,
}: FormBuilderProps) {
  const zodSchema = React.useMemo(() => formSchemaToZod(schema), [schema]);
  
  // Build default values from schema
  const schemaDefaults = React.useMemo(() => {
    const defaults: Record<string, unknown> = {};
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        }
      }
    }
    return { ...defaults, ...defaultValues };
  }, [schema, defaultValues]);
  
  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: schemaDefaults,
    mode: 'onBlur',
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });
  
  return (
    <FormContext.Provider value={form}>
      <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
        {schema.title && (
          <div>
            <h2 className="text-xl font-bold">{schema.title}</h2>
            {schema.description && (
              <p className="text-muted-foreground">{schema.description}</p>
            )}
          </div>
        )}
        
        {schema.sections.map((section) => (
          <FormSectionComponent
            key={section.id}
            section={section}
            customComponents={customComponents}
            disabled={isSubmitting}
            columns={schema.columns ?? 1}
          />
        ))}
        
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : (schema.submitLabel ?? 'Submit')}
          </Button>
          
          {schema.showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              {schema.resetLabel ?? 'Reset'}
            </Button>
          )}
          
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </FormContext.Provider>
  );
}
```

### Key Implementation Notes

1. **Schema-Driven**: Forms are entirely defined by JSON schema, making them database-storable and API-configurable
2. **Zod Integration**: Automatic Zod schema generation ensures type-safe validation matching the form definition

## Variants

### Server Action Integration

```tsx
// app/forms/[formId]/page.tsx
import { FormBuilder } from '@/components/form-builder';
import { getFormSchema, submitFormData } from './actions';

export default async function DynamicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const schema = await getFormSchema(formId);
  
  async function handleSubmit(data: Record<string, unknown>) {
    'use server';
    await submitFormData(formId, data);
  }
  
  return (
    <FormBuilder
      schema={schema}
      onSubmit={handleSubmit}
    />
  );
}
```

### With Custom Field Components

```tsx
'use client';

import { FormBuilder, CustomFieldProps } from '@/components/form-builder';
import { RichTextEditor } from '@/components/rich-text-editor';
import { ColorPicker } from '@/components/color-picker';

function RichTextField({ field, value, onChange, error, disabled }: CustomFieldProps) {
  return (
    <RichTextEditor
      content={value as string}
      onChange={onChange}
      placeholder={field.placeholder}
      disabled={disabled}
    />
  );
}

function ColorField({ field, value, onChange, disabled }: CustomFieldProps) {
  return (
    <ColorPicker
      color={value as string}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

const customComponents = {
  'rich-text': RichTextField,
  'color': ColorField,
};

export function ContentForm({ schema }: { schema: FormSchema }) {
  return (
    <FormBuilder
      schema={schema}
      customComponents={customComponents}
      onSubmit={async (data) => {
        console.log('Form data:', data);
      }}
    />
  );
}
```

## Examples

### Basic Contact Form Schema

```tsx
const contactFormSchema: FormSchema = {
  id: 'contact-form',
  title: 'Contact Us',
  description: 'We\'ll get back to you within 24 hours',
  columns: 2,
  sections: [
    {
      id: 'personal',
      title: 'Personal Information',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: 'First Name',
          required: true,
          validation: { minLength: 2 },
        },
        {
          name: 'lastName',
          type: 'text',
          label: 'Last Name',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          colSpan: 2,
        },
      ],
    },
    {
      id: 'message',
      title: 'Your Message',
      fields: [
        {
          name: 'subject',
          type: 'select',
          label: 'Subject',
          required: true,
          options: [
            { label: 'General Inquiry', value: 'general' },
            { label: 'Technical Support', value: 'support' },
            { label: 'Sales', value: 'sales' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'otherSubject',
          type: 'text',
          label: 'Please Specify',
          conditions: {
            show: [{ field: 'subject', operator: 'equals', value: 'other' }],
            require: [{ field: 'subject', operator: 'equals', value: 'other' }],
          },
        },
        {
          name: 'message',
          type: 'textarea',
          label: 'Message',
          required: true,
          validation: { minLength: 20, maxLength: 1000 },
          colSpan: 2,
        },
        {
          name: 'subscribe',
          type: 'checkbox',
          label: 'Subscribe to newsletter',
          defaultValue: false,
          colSpan: 2,
        },
      ],
    },
  ],
  submitLabel: 'Send Message',
  showReset: true,
};
```

## Anti-patterns

### Hardcoding Form Logic

```tsx
// Bad - Logic mixed with schema
const schema = {
  fields: [
    {
      name: 'email',
      // Validation logic embedded
      validate: (value) => {
        if (!value.includes('@')) return 'Invalid';
      },
    },
  ],
};

// Good - Declarative validation
const schema = {
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      // Zod handles email validation automatically
    },
  ],
};
```

### Not Handling Dynamic Requirements

```tsx
// Bad - Static required fields
const schema = {
  fields: [
    { name: 'phone', required: true }, // Always required
  ],
};

// Good - Conditional requirements
const schema = {
  fields: [
    {
      name: 'phone',
      conditions: {
        require: [{ field: 'contactMethod', operator: 'equals', value: 'phone' }],
      },
    },
  ],
};
```

## Related Skills

### Composes From
- [react-hook-form](../patterns/react-hook-form.md) - Form state management
- [zod-validation](../patterns/zod-validation.md) - Schema validation

### Composes Into
- [multi-step-form](../organisms/multi-step-form.md) - Wizard forms
- [settings-form](../organisms/settings-form.md) - Configuration forms

### Alternatives
- [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) - JSON Schema based alternative
- [formik](https://formik.org) - Alternative form library

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with conditional fields
- Zod schema generation
- Custom component support
