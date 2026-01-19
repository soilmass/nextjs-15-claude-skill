---
id: m-tag-input
name: Tag Input
version: 2.0.0
layer: L2
category: forms
description: Multi-tag input with chips, autocomplete, and keyboard navigation
tags: [tag, input, chips, multi-select, autocomplete, form]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "TagInput = Input(a-input-text) + Badge(a-display-badge) + Button(a-input-button)"
composes:
  - ../atoms/input-text.md
  - ../atoms/display-badge.md
  - ../atoms/input-button.md
dependencies:
  react: "^19.0.0"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Tag Input

## Overview

A tag input component that allows users to enter multiple values as chips/tags. Supports autocomplete suggestions, keyboard navigation, and customizable tag rendering.

## Composition Diagram

```
+----------------------------------------------------------+
|                       TagInput                            |
|  +----------------------------------------------------+  |
|  | +-------+ +-------+ +-------+ +------------------+ |  |
|  | | Badge | | Badge | | Badge | |      Input       | |  |
|  | | react | | next  | | ts    | | [Add tag...    ] | |  |
|  | |   [x] | |   [x] | |   [x] | +------------------+ |  |
|  | +-------+ +-------+ +-------+                      |  |
|  +----------------------------------------------------+  |
|                           |                              |
|                           v                              |
|  +----------------------------------------------------+  |
|  |              Suggestions Dropdown                   |  |
|  |  +----------------------------------------------+  |  |
|  |  | typescript                                   |  |  |
|  |  +----------------------------------------------+  |  |
|  |  | tailwindcss                                  |  |  |
|  |  +----------------------------------------------+  |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

## Implementation

```tsx
// components/ui/tag-input.tsx
'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface TagInputProps {
  /** Current tags */
  value?: string[];
  /** Change handler */
  onChange?: (tags: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum number of tags */
  maxTags?: number;
  /** Autocomplete suggestions */
  suggestions?: string[];
  /** Allow custom tags (not in suggestions) */
  allowCustom?: boolean;
  /** Validate tag before adding */
  validateTag?: (tag: string) => boolean | string;
  /** Transform tag before adding */
  transformTag?: (tag: string) => string;
  /** Delimiter characters that trigger tag creation */
  delimiters?: string[];
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class */
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags,
  suggestions = [],
  allowCustom = true,
  validateTag,
  transformTag = (tag) => tag.trim().toLowerCase(),
  delimiters = [',', 'Enter', 'Tab'],
  disabled = false,
  error = false,
  size = 'md',
  className,
}: TagInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(-1);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Filter suggestions based on input
  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue.trim()) return [];
    
    const search = inputValue.toLowerCase();
    return suggestions.filter(
      (s) =>
        s.toLowerCase().includes(search) &&
        !value.includes(transformTag(s))
    );
  }, [inputValue, suggestions, value, transformTag]);

  const addTag = (tag: string) => {
    const transformed = transformTag(tag);
    
    if (!transformed) return false;
    if (value.includes(transformed)) return false;
    if (maxTags && value.length >= maxTags) return false;
    if (!allowCustom && !suggestions.some(s => transformTag(s) === transformed)) {
      return false;
    }

    // Validate
    if (validateTag) {
      const result = validateTag(transformed);
      if (result !== true) {
        setValidationError(typeof result === 'string' ? result : 'Invalid tag');
        return false;
      }
    }

    setValidationError(null);
    onChange?.([...value, transformed]);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    return true;
  };

  const removeTag = (tagToRemove: string) => {
    onChange?.(value.filter((tag) => tag !== tagToRemove));
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.trim().length > 0);
    setSelectedSuggestionIndex(-1);
    setValidationError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle delimiters
    if (delimiters.includes(e.key)) {
      if (e.key !== 'Tab' || inputValue.trim()) {
        e.preventDefault();
      }
      
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        addTag(filteredSuggestions[selectedSuggestionIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
      return;
    }

    // Handle backspace to remove last tag
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
      return;
    }

    // Handle arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        Math.min(prev + 1, filteredSuggestions.length - 1)
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => Math.max(prev - 1, -1));
      return;
    }

    // Handle escape
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      return;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: 'min-h-8 text-sm gap-1 px-2 py-1',
    md: 'min-h-10 gap-1.5 px-3 py-2',
    lg: 'min-h-12 text-lg gap-2 px-4 py-2.5',
  };

  const tagSizeClasses = {
    sm: 'text-xs px-1.5 py-0',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-2.5 py-1',
  };

  const canAddMore = !maxTags || value.length < maxTags;

  return (
    <div className={cn('relative', className)}>
      <div
        onClick={handleContainerClick}
        className={cn(
          'flex flex-wrap items-center rounded-md border bg-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          sizeClasses[size],
          error && 'border-destructive focus-within:ring-destructive',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Tags */}
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={cn('flex items-center gap-1', tagSizeClasses[size])}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="rounded-full hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            )}
          </Badge>
        ))}

        {/* Input */}
        {canAddMore && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            className={cn(
              'flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground',
              disabled && 'cursor-not-allowed'
            )}
            aria-describedby={validationError ? 'tag-error' : undefined}
          />
        )}
      </div>

      {/* Validation error */}
      {validationError && (
        <p id="tag-error" className="mt-1 text-sm text-destructive">
          {validationError}
        </p>
      )}

      {/* Max tags indicator */}
      {maxTags && (
        <p className="mt-1 text-xs text-muted-foreground">
          {value.length}/{maxTags} tags
        </p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full rounded-sm px-2 py-1.5 text-left text-sm',
                'hover:bg-accent hover:text-accent-foreground',
                index === selectedSuggestionIndex && 'bg-accent text-accent-foreground'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Usage

```tsx
import { TagInput } from '@/components/ui/tag-input';

// Basic usage
function BasicExample() {
  const [tags, setTags] = React.useState<string[]>([]);
  
  return (
    <TagInput
      value={tags}
      onChange={setTags}
      placeholder="Add tags..."
    />
  );
}

// With suggestions
function WithSuggestions() {
  const [tags, setTags] = React.useState<string[]>(['react']);
  
  const suggestions = [
    'react', 'nextjs', 'typescript', 'javascript',
    'tailwindcss', 'prisma', 'postgresql', 'mongodb'
  ];
  
  return (
    <TagInput
      value={tags}
      onChange={setTags}
      suggestions={suggestions}
      placeholder="Add technologies..."
    />
  );
}

// With validation
function WithValidation() {
  const [tags, setTags] = React.useState<string[]>([]);
  
  return (
    <TagInput
      value={tags}
      onChange={setTags}
      validateTag={(tag) => {
        if (tag.length < 2) return 'Tag must be at least 2 characters';
        if (tag.length > 20) return 'Tag must be less than 20 characters';
        if (!/^[a-z0-9-]+$/.test(tag)) return 'Only lowercase letters, numbers, and hyphens';
        return true;
      }}
      placeholder="Add tags..."
    />
  );
}

// With max tags
function WithMaxTags() {
  const [tags, setTags] = React.useState<string[]>(['featured']);
  
  return (
    <TagInput
      value={tags}
      onChange={setTags}
      maxTags={5}
      placeholder="Add up to 5 tags..."
    />
  );
}

// Restrict to suggestions only
function RestrictedToSuggestions() {
  const [tags, setTags] = React.useState<string[]>([]);
  
  const categories = ['Technology', 'Business', 'Design', 'Marketing'];
  
  return (
    <TagInput
      value={tags}
      onChange={setTags}
      suggestions={categories}
      allowCustom={false}
      placeholder="Select categories..."
    />
  );
}
```

## With React Hook Form

```tsx
import { Controller, useForm } from 'react-hook-form';
import { TagInput } from '@/components/ui/tag-input';

function TagForm() {
  const form = useForm({
    defaultValues: {
      tags: [] as string[],
    },
  });

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
      <Controller
        name="tags"
        control={form.control}
        rules={{
          validate: (value) =>
            value.length >= 1 || 'At least one tag is required',
        }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagInput
              value={field.value}
              onChange={field.onChange}
              error={!!fieldState.error}
            />
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      <Button type="submit" className="mt-4">Submit</Button>
    </form>
  );
}
```

## Accessibility

- Keyboard navigation for suggestions (Arrow keys)
- Enter/Tab/Comma to add tags
- Backspace to remove last tag when input is empty
- Screen reader announcements for tag additions/removals
- Focus management

## Related Skills

- [combobox](./combobox.md) - Single-select with search
- [form-field](./form-field.md) - Form field wrapper
- [display-badge](../atoms/display-badge.md) - Badge component

---

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation
- Autocomplete suggestions
- Validation support
- Keyboard navigation
