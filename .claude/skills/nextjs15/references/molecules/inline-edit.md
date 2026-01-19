---
id: m-inline-edit
name: Inline Edit
version: 2.0.0
layer: L2
category: interactive
description: Click-to-edit inline text with save/cancel controls and validation
tags: [edit, inline, input, text, editable]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "InlineEdit = DisplayText(a-display-text) + InputText(a-input-text) + SaveButton(a-input-button) + CancelButton(a-input-button)"
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
  - ../atoms/display-text.md
dependencies:
  react: "^19.0.0"
  lucide-react: "^0.460.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Inline Edit

## Overview

An inline edit molecule that transforms static text into an editable input on click. Includes save/cancel controls, keyboard shortcuts, validation support, and loading states.

## Composition Diagram

```
Display Mode (default):
┌─────────────────────────────────────────────────────────────────┐
│                        InlineEdit                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Display Text (a-display-text)                │  │
│  │                                                           │  │
│  │         "Project Title" ✏️ (click to edit)                │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Edit Mode (on click):
┌─────────────────────────────────────────────────────────────────┐
│                        InlineEdit                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐  ┌──────┐  ┌──────┐   │
│  │         Input (a-input-text)        │  │ Save │  │Cancel│   │
│  │                                     │  │(a-   │  │(a-   │   │
│  │  [Project Title________________]    │  │input │  │input │   │
│  │                                     │  │-btn) │  │-btn) │   │
│  │                                     │  │  ✓   │  │  ✕   │   │
│  └─────────────────────────────────────┘  └──────┘  └──────┘   │
└─────────────────────────────────────────────────────────────────┘

Keyboard: Enter = Save, Escape = Cancel
```

## Implementation

```tsx
// components/molecules/inline-edit.tsx
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, X, Pencil, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface InlineEditProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'>,
    VariantProps<typeof displayVariants> {
  value: string;
  defaultValue?: string;
  onSave?: (value: string) => void | Promise<void>;
  onCancel?: () => void;
  onChange?: (value: string) => void;
  validate?: (value: string) => string | undefined;
  placeholder?: string;
  editOnClick?: boolean;
  showButtons?: boolean;
  showEditIcon?: boolean;
  emptyText?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  'aria-label'?: string;
}

interface InlineEditTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange'>,
    VariantProps<typeof displayVariants> {
  value: string;
  defaultValue?: string;
  onSave?: (value: string) => void | Promise<void>;
  onCancel?: () => void;
  onChange?: (value: string) => void;
  validate?: (value: string) => string | undefined;
  placeholder?: string;
  editOnClick?: boolean;
  showButtons?: boolean;
  showEditIcon?: boolean;
  emptyText?: string;
  rows?: number;
  'aria-label'?: string;
}

// Styles
const displayVariants = cva(
  'group relative inline-flex items-center gap-2 rounded transition-colors',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent/50 px-1 -mx-1',
        ghost: 'hover:bg-transparent',
        underline: 'border-b border-dashed border-muted-foreground/50 hover:border-foreground',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const inputVariants = cva(
  'w-full rounded border bg-background px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
  {
    variants: {
      size: {
        sm: 'text-sm h-7',
        md: 'text-base h-9',
        lg: 'text-lg h-10',
        xl: 'text-xl h-12 font-semibold',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Base Inline Edit Hook
function useInlineEdit({
  value,
  onSave,
  onCancel,
  onChange,
  validate,
}: {
  value: string;
  onSave?: (value: string) => void | Promise<void>;
  onCancel?: () => void;
  onChange?: (value: string) => void;
  validate?: (value: string) => string | undefined;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const [error, setError] = React.useState<string>();
  const [isSaving, setIsSaving] = React.useState(false);

  // Sync with external value changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const startEditing = React.useCallback(() => {
    setEditValue(value);
    setError(undefined);
    setIsEditing(true);
  }, [value]);

  const handleCancel = React.useCallback(() => {
    setEditValue(value);
    setError(undefined);
    setIsEditing(false);
    onCancel?.();
  }, [value, onCancel]);

  const handleSave = React.useCallback(async () => {
    // Validate
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Don't save if unchanged
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave?.(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, validate, onSave]);

  const handleChange = React.useCallback(
    (newValue: string) => {
      setEditValue(newValue);
      setError(undefined);
      onChange?.(newValue);
    },
    [onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  return {
    isEditing,
    editValue,
    error,
    isSaving,
    startEditing,
    handleCancel,
    handleSave,
    handleChange,
    handleKeyDown,
  };
}

// Main Inline Edit Component
export function InlineEdit({
  value,
  defaultValue,
  onSave,
  onCancel,
  onChange,
  validate,
  placeholder,
  editOnClick = true,
  showButtons = true,
  showEditIcon = true,
  emptyText = 'Click to edit',
  maxLength,
  variant,
  size,
  disabled,
  className,
  'aria-label': ariaLabel,
  ...props
}: InlineEditProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const {
    isEditing,
    editValue,
    error,
    isSaving,
    startEditing,
    handleCancel,
    handleSave,
    handleChange,
    handleKeyDown,
  } = useInlineEdit({ value, onSave, onCancel, onChange, validate });

  // Focus input when editing starts
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className={cn('inline-flex flex-col gap-1', className)}>
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!showButtons) {
                handleSave();
              }
            }}
            maxLength={maxLength}
            disabled={isSaving}
            className={cn(
              inputVariants({ size }),
              error && 'border-destructive focus:ring-destructive'
            )}
            aria-label={ariaLabel}
            aria-invalid={!!error}
            {...props}
          />
          
          {showButtons && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  'rounded p-1.5 text-green-600 hover:bg-green-100',
                  'focus:outline-none focus:ring-2 focus:ring-green-500',
                  'disabled:opacity-50'
                )}
                aria-label="Save"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className={cn(
                  'rounded p-1.5 text-destructive hover:bg-destructive/10',
                  'focus:outline-none focus:ring-2 focus:ring-destructive'
                )}
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        
        {maxLength && (
          <p className="text-xs text-muted-foreground text-right">
            {editValue.length}/{maxLength}
          </p>
        )}
      </div>
    );
  }

  const displayValue = value || emptyText;
  const isEmpty = !value;

  return (
    <span
      className={cn(
        displayVariants({ variant, size }),
        editOnClick && !disabled && 'cursor-pointer',
        isEmpty && 'text-muted-foreground italic',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => {
        if (editOnClick && !disabled) {
          startEditing();
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && editOnClick && !disabled) {
          e.preventDefault();
          startEditing();
        }
      }}
      role={editOnClick ? 'button' : undefined}
      tabIndex={editOnClick && !disabled ? 0 : undefined}
      aria-label={ariaLabel ? `${ariaLabel}: ${displayValue}. Click to edit.` : undefined}
    >
      <span className="truncate">{displayValue}</span>
      
      {showEditIcon && !disabled && (
        <Pencil
          className={cn(
            'h-3 w-3 text-muted-foreground opacity-0 transition-opacity',
            'group-hover:opacity-100 group-focus:opacity-100'
          )}
        />
      )}
    </span>
  );
}

// Inline Edit Textarea for multiline content
export function InlineEditTextarea({
  value,
  defaultValue,
  onSave,
  onCancel,
  onChange,
  validate,
  placeholder,
  editOnClick = true,
  showButtons = true,
  showEditIcon = true,
  emptyText = 'Click to edit',
  rows = 3,
  variant,
  size,
  disabled,
  className,
  'aria-label': ariaLabel,
  ...props
}: InlineEditTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const {
    isEditing,
    editValue,
    error,
    isSaving,
    startEditing,
    handleCancel,
    handleSave,
    handleChange,
    handleKeyDown,
  } = useInlineEdit({ value, onSave, onCancel, onChange, validate });

  // Focus textarea when editing starts
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            // Only save on Ctrl/Cmd + Enter for textarea
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSave();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              handleCancel();
            }
          }}
          rows={rows}
          disabled={isSaving}
          className={cn(
            'w-full rounded border bg-background px-2 py-1.5 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring resize-none',
            size === 'sm' && 'text-sm',
            size === 'lg' && 'text-lg',
            error && 'border-destructive focus:ring-destructive'
          )}
          aria-label={ariaLabel}
          aria-invalid={!!error}
          {...props}
        />
        
        {showButtons && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded bg-muted px-1">Ctrl+Enter</kbd> to save
            </p>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  'rounded p-1.5 text-green-600 hover:bg-green-100',
                  'focus:outline-none focus:ring-2 focus:ring-green-500',
                  'disabled:opacity-50'
                )}
                aria-label="Save"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className={cn(
                  'rounded p-1.5 text-destructive hover:bg-destructive/10',
                  'focus:outline-none focus:ring-2 focus:ring-destructive'
                )}
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }

  const displayValue = value || emptyText;
  const isEmpty = !value;

  return (
    <div
      className={cn(
        displayVariants({ variant, size }),
        'block whitespace-pre-wrap',
        editOnClick && !disabled && 'cursor-pointer',
        isEmpty && 'text-muted-foreground italic',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => {
        if (editOnClick && !disabled) {
          startEditing();
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && editOnClick && !disabled) {
          e.preventDefault();
          startEditing();
        }
      }}
      role={editOnClick ? 'button' : undefined}
      tabIndex={editOnClick && !disabled ? 0 : undefined}
      aria-label={ariaLabel}
    >
      {displayValue}
      
      {showEditIcon && !disabled && (
        <Pencil
          className={cn(
            'inline-block ml-2 h-3 w-3 text-muted-foreground opacity-0 transition-opacity',
            'group-hover:opacity-100'
          )}
        />
      )}
    </div>
  );
}

// Inline Edit Select (for dropdown options)
interface InlineEditSelectProps extends VariantProps<typeof displayVariants> {
  value: string;
  options: Array<{ value: string; label: string }>;
  onSave?: (value: string) => void | Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function InlineEditSelect({
  value,
  options,
  onSave,
  onCancel,
  variant,
  size,
  disabled,
  className,
  'aria-label': ariaLabel,
}: InlineEditSelectProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const selectRef = React.useRef<HTMLSelectElement>(null);

  const currentOption = options.find((opt) => opt.value === value);

  const handleChange = async (newValue: string) => {
    if (newValue === value) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave?.(newValue);
      setIsEditing(false);
    } catch {
      // Error handling
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        disabled={isSaving}
        className={cn(
          inputVariants({ size }),
          'cursor-pointer',
          className
        )}
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      className={cn(
        displayVariants({ variant, size }),
        !disabled && 'cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => !disabled && setIsEditing(true)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      role="button"
      tabIndex={disabled ? undefined : 0}
      aria-label={ariaLabel}
    >
      {currentOption?.label || value}
      <Pencil
        className={cn(
          'h-3 w-3 text-muted-foreground opacity-0 transition-opacity',
          'group-hover:opacity-100'
        )}
      />
    </span>
  );
}
```

## Variants

### Display Variants

```tsx
<InlineEdit variant="default" />  // Hover background
<InlineEdit variant="ghost" />    // No hover effect
<InlineEdit variant="underline" /> // Dashed underline
```

### Size Variants

```tsx
<InlineEdit size="sm" />
<InlineEdit size="md" />
<InlineEdit size="lg" />
<InlineEdit size="xl" />
```

### Without Buttons (Auto-save on blur)

```tsx
<InlineEdit showButtons={false} />
```

## Usage

### Basic Inline Edit

```tsx
import { InlineEdit } from '@/components/molecules/inline-edit';

export function ProfileName() {
  const [name, setName] = useState('John Doe');

  return (
    <InlineEdit
      value={name}
      onSave={async (newName) => {
        await updateProfile({ name: newName });
        setName(newName);
      }}
      aria-label="Full name"
    />
  );
}
```

### With Validation

```tsx
import { InlineEdit } from '@/components/molecules/inline-edit';

export function EmailEdit() {
  const [email, setEmail] = useState('user@example.com');

  return (
    <InlineEdit
      value={email}
      onSave={setEmail}
      validate={(value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email format';
        }
        return undefined;
      }}
      aria-label="Email address"
    />
  );
}
```

### Multiline Description

```tsx
import { InlineEditTextarea } from '@/components/molecules/inline-edit';

export function TaskDescription({ task }) {
  return (
    <InlineEditTextarea
      value={task.description}
      onSave={async (description) => {
        await updateTask(task.id, { description });
      }}
      emptyText="Add a description..."
      rows={4}
      aria-label="Task description"
    />
  );
}
```

### Select Dropdown

```tsx
import { InlineEditSelect } from '@/components/molecules/inline-edit';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskStatus({ task }) {
  return (
    <InlineEditSelect
      value={task.status}
      options={STATUS_OPTIONS}
      onSave={async (status) => {
        await updateTask(task.id, { status });
      }}
      aria-label="Task status"
    />
  );
}
```

### Page Title

```tsx
import { InlineEdit } from '@/components/molecules/inline-edit';

export function PageHeader({ page }) {
  return (
    <h1>
      <InlineEdit
        value={page.title}
        onSave={(title) => updatePage(page.id, { title })}
        size="xl"
        variant="ghost"
        showEditIcon={false}
        aria-label="Page title"
      />
    </h1>
  );
}
```

## Anti-patterns

```tsx
// Don't forget to handle async errors
<InlineEdit
  onSave={async (value) => {
    await api.update(value); // Errors not handled
  }}
/>

// Do handle errors properly
<InlineEdit
  onSave={async (value) => {
    try {
      await api.update(value);
    } catch (error) {
      toast.error('Failed to save');
      throw error; // Re-throw to show error state
    }
  }}
/>

// Don't use without accessible labels
<InlineEdit value={name} /> // Missing aria-label

// Do provide context
<InlineEdit value={name} aria-label="User name" />
```

## Related Skills

- `atoms/input` - Base input component
- `atoms/textarea` - Base textarea component
- `molecules/form-field` - Form field wrapper

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with text input
- Added textarea variant for multiline
- Added select variant for dropdowns
- Validation and error handling
- Loading states during save
- Full keyboard navigation
