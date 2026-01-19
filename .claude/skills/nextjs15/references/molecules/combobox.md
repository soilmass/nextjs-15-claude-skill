---
id: m-combobox
name: Combobox
version: 2.0.0
layer: L2
category: forms
description: Searchable select with cmdk integration and typeahead
tags: [combobox, autocomplete, search, select, cmdk]
formula: "Combobox = InputText(a-input-text) + InputButton(a-input-button) + DisplayIcon(a-display-icon)"
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
dependencies:
  cmdk: "^1.0.0"
  "@radix-ui/react-popover": "^1.1.2"
performance:
  impact: medium
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Combobox

## Overview

The Combobox molecule combines a searchable input with a dropdown list for selecting from many options. Built with cmdk for fast filtering and keyboard navigation. Supports single and multi-select modes.

## When to Use

Use this skill when:
- Selecting from large lists (countries, users, tags)
- Need search/filter functionality in a select
- Building autocomplete inputs
- Creating tag/multi-select inputs

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Combobox                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────── Trigger ─────────────────────────┐  │
│  │  ┌───────────────────────────────────────┐  ┌───────────┐ │  │
│  │  │         Selected Value                │  │  Chevron  │ │  │
│  │  │        (a-display-text)               │  │(a-display │ │  │
│  │  │                                       │  │  -icon)   │ │  │
│  │  │     "Select framework..."             │  │    ▼      │ │  │
│  │  └───────────────────────────────────────┘  └───────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────── Popover ─────────────────────────┐  │
│  │  ┌───────────────────────────────────────────────────────┐│  │
│  │  │  🔍  Search... (a-input-text)                         ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  │  ┌───────────────────────────────────────────────────────┐│  │
│  │  │  ✓  React                                             ││  │
│  │  │     Vue                                               ││  │
│  │  │     Angular                                           ││  │
│  │  │     Svelte                                            ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Multi-Select Variant:
┌─────────────────────────────────────────────────────────────────┐
│  [React ✕] [Vue ✕] [+2 more]                              ▼    │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [input-text](../atoms/input-text.md) - Search input
- [input-button](../atoms/input-button.md) - Trigger button
- [display-icon](../atoms/display-icon.md) - Check and chevron icons

## Implementation

```typescript
// components/ui/combobox.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";

interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface ComboboxProps {
  /** Available options */
  options: ComboboxOption[];
  /** Selected value(s) */
  value?: string | string[];
  /** Change handler */
  onChange?: (value: string | string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Empty state text */
  emptyText?: string;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Allow clearing */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom filter function */
  filter?: (value: string, search: string) => number;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  multiple = false,
  clearable = true,
  disabled = false,
  filter,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Normalize value to array for consistent handling
  const selectedValues = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value)
  );

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : "");
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange?.(selectedValues.filter((v) => v !== optionValue));
    }
  };

  // Group options
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, ComboboxOption[]> = {};
    options.forEach((option) => {
      const group = option.group || "";
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
    });
    return groups;
  }, [options]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedValues.length && "text-muted-foreground",
            className
          )}
        >
          <span className="flex flex-wrap gap-1 truncate">
            {multiple && selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(option.value, e)}
                    className="ml-1 rounded-full hover:bg-muted"
                    aria-label={`Remove ${option.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : selectedOptions.length === 1 ? (
              selectedOptions[0].label
            ) : (
              placeholder
            )}
          </span>
          <div className="flex items-center gap-1">
            {clearable && selectedValues.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-popover w-[var(--radix-popover-trigger-width)] rounded-md border bg-popover p-0 shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          sideOffset={4}
          align="start"
        >
          <Command filter={filter}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
              className="border-b"
            />
            <CommandList className="max-h-60 overflow-auto">
              <CommandEmpty>{emptyText}</CommandEmpty>
              {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <CommandGroup key={group} heading={group || undefined}>
                  {groupOptions.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

```typescript
// components/ui/async-combobox.tsx
"use client";

import * as React from "react";
import { Combobox } from "./combobox";
import { useDebounce } from "@/hooks/use-debounce";

interface AsyncComboboxProps {
  /** Async function to fetch options */
  loadOptions: (search: string) => Promise<Array<{ value: string; label: string }>>;
  /** Minimum characters before searching */
  minChars?: number;
  /** Debounce delay */
  debounce?: number;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

export function AsyncCombobox({
  loadOptions,
  minChars = 2,
  debounce = 300,
  ...props
}: AsyncComboboxProps) {
  const [options, setOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  
  const debouncedSearch = useDebounce(search, debounce);

  React.useEffect(() => {
    if (debouncedSearch.length < minChars) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      setLoading(true);
      try {
        const results = await loadOptions(debouncedSearch);
        setOptions(results);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [debouncedSearch, loadOptions, minChars]);

  return (
    <Combobox
      options={options}
      emptyText={
        loading
          ? "Loading..."
          : search.length < minChars
          ? `Type ${minChars} characters to search...`
          : "No results found."
      }
      {...props}
    />
  );
}
```

### Key Implementation Notes

1. **cmdk Integration**: Uses cmdk for fast, accessible command palette style filtering
2. **Grouped Options**: Supports grouping options by category

## Variants

### Single Select

```tsx
<Combobox
  options={[
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
  ]}
  value={country}
  onChange={setCountry}
  placeholder="Select country..."
/>
```

### Multi Select

```tsx
<Combobox
  options={tags}
  value={selectedTags}
  onChange={setSelectedTags}
  multiple
  placeholder="Select tags..."
/>
```

### Grouped Options

```tsx
<Combobox
  options={[
    { value: "react", label: "React", group: "Frontend" },
    { value: "vue", label: "Vue", group: "Frontend" },
    { value: "node", label: "Node.js", group: "Backend" },
    { value: "python", label: "Python", group: "Backend" },
  ]}
  value={framework}
  onChange={setFramework}
/>
```

### Async Loading

```tsx
<AsyncCombobox
  loadOptions={async (search) => {
    const response = await fetch(`/api/users?q=${search}`);
    return response.json();
  }}
  minChars={2}
  placeholder="Search users..."
/>
```

## States

| State | Trigger | Dropdown | Loading |
|-------|---------|----------|---------|
| Closed | shows value/placeholder | hidden | - |
| Open | focused | visible | - |
| Searching | focused | visible + filtered | spinner |
| Empty | focused | visible + empty state | - |
| Selected | shows value | hidden | - |
| Disabled | muted | hidden | - |

## Accessibility

### Required ARIA Attributes

- `role="combobox"` on trigger
- `aria-expanded` on trigger
- `aria-haspopup="listbox"` on trigger
- `aria-selected` on options

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter/Space` | Open dropdown |
| `Arrow Down/Up` | Navigate options |
| `Enter` | Select option |
| `Escape` | Close dropdown |
| `Type` | Filter options |
| `Backspace` | Remove last (multi) |

### Screen Reader Announcements

- "Combobox, [placeholder/value]"
- "[n] results available"
- Option labels when navigating
- "Selected/Deselected" on toggle

## Dependencies

```json
{
  "dependencies": {
    "cmdk": "^1.0.0",
    "@radix-ui/react-popover": "^1.1.2",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install cmdk @radix-ui/react-popover lucide-react
```

## Examples

### Country Selector

```tsx
import { Combobox } from "@/components/ui/combobox";
import { countries } from "@/lib/countries";

export function CountrySelector({ value, onChange }) {
  return (
    <Combobox
      options={countries.map((c) => ({
        value: c.code,
        label: c.name,
      }))}
      value={value}
      onChange={onChange}
      placeholder="Select country..."
      searchPlaceholder="Search countries..."
    />
  );
}
```

### Tag Input

```tsx
import { Combobox } from "@/components/ui/combobox";

export function TagInput({ value, onChange, availableTags }) {
  return (
    <Combobox
      options={availableTags.map((tag) => ({
        value: tag.id,
        label: tag.name,
      }))}
      value={value}
      onChange={onChange}
      multiple
      placeholder="Add tags..."
      searchPlaceholder="Search tags..."
    />
  );
}
```

### User Search

```tsx
import { AsyncCombobox } from "@/components/ui/async-combobox";
import { searchUsers } from "@/lib/api";

export function UserSelector({ value, onChange }) {
  const loadOptions = async (search: string) => {
    const users = await searchUsers(search);
    return users.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    }));
  };

  return (
    <AsyncCombobox
      loadOptions={loadOptions}
      value={value}
      onChange={onChange}
      placeholder="Search users..."
      minChars={2}
    />
  );
}
```

### Form Integration

```tsx
import { useForm, Controller } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";

export function AssigneeField({ control }) {
  return (
    <Controller
      name="assignee"
      control={control}
      render={({ field }) => (
        <Combobox
          options={teamMembers}
          value={field.value}
          onChange={field.onChange}
          placeholder="Assign to..."
        />
      )}
    />
  );
}
```

## Anti-patterns

### Loading All Options Upfront

```tsx
// Bad - loading thousands of options
const [allUsers] = await getAllUsers(); // 10,000 users
<Combobox options={allUsers} />

// Good - async loading with search
<AsyncCombobox loadOptions={searchUsers} minChars={2} />
```

### No Empty State

```tsx
// Bad - confusing when no matches
<Combobox options={options} emptyText="" />

// Good - helpful empty state
<Combobox
  options={options}
  emptyText="No matching options. Try a different search."
/>
```

### Missing Accessibility Labels

```tsx
// Bad - no context
<Combobox options={options} />

// Good - with proper labeling
<div className="space-y-2">
  <label id="category-label">Category</label>
  <Combobox
    options={options}
    aria-labelledby="category-label"
  />
</div>
```

## Related Skills

### Composes From
- [atoms/input-text](../atoms/input-text.md) - Search input
- [atoms/state-select](../atoms/state-select.md) - Select states

### Composes Into
- [molecules/form-field](./form-field.md) - Form integration
- [organisms/data-table](../organisms/data-table.md) - Column filters

### Alternatives
- [atoms/input-select](../atoms/input-select.md) - For small option lists
- [molecules/search-input](./search-input.md) - For text search only

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with cmdk
- Single and multi-select modes
- Grouped options support
- AsyncCombobox for remote data
