---
id: m-phone-input
name: Phone Input
version: 2.0.0
layer: L2
category: forms
description: International phone number input with country code selector and formatting
tags: [phone, input, international, country-code, form, validation]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "PhoneInput = Input(a-input-text) + Select(a-input-select)"
composes:
  - ../atoms/input-text.md
  - ../atoms/input-select.md
dependencies:
  react: "^19.0.0"
  react-phone-number-input: "^3.4.0"
  libphonenumber-js: "^1.11.0"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Phone Input

## Overview

An international phone number input with country selector, automatic formatting, and validation. Supports all countries with proper dial codes and phone number formats.

## Composition Diagram

```
+--------------------------------------------------------+
|                      PhoneInput                         |
|  +-------------+  +----------------------------------+  |
|  |   Select    |  |             Input                |  |
|  | +--------+  |  |                                  |  |
|  | | [Flag] |  |  |  [(555) 123-4567              ]  |  |
|  | |  +1    |  |  |                                  |  |
|  | +--------+  |  +----------------------------------+  |
|  +-------------+                                        |
|        |                                                |
|        v                                                |
|  +-------------+                                        |
|  | Country List|                                        |
|  | +---------+ |                                        |
|  | | US  +1  | |                                        |
|  | | CA  +1  | |                                        |
|  | | GB +44  | |                                        |
|  | +---------+ |                                        |
|  +-------------+                                        |
+--------------------------------------------------------+
```

## Implementation

```tsx
// components/ui/phone-input.tsx
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> & {
  value?: RPNInput.Value;
  onChange?: (value: RPNInput.Value) => void;
  defaultCountry?: RPNInput.Country;
  countries?: RPNInput.Country[];
  international?: boolean;
  countryCallingCodeEditable?: boolean;
  error?: boolean;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      value,
      onChange,
      defaultCountry = 'US',
      countries,
      international = true,
      countryCallingCodeEditable = false,
      error,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <RPNInput.default
        ref={ref}
        className={cn('flex', className)}
        international={international}
        defaultCountry={defaultCountry}
        countries={countries}
        countryCallingCodeEditable={countryCallingCodeEditable}
        value={value}
        onChange={onChange}
        inputComponent={PhoneInputField}
        countrySelectComponent={CountrySelect}
        disabled={disabled}
        flagComponent={FlagComponent}
        // Pass error state to input
        // @ts-ignore
        error={error}
        {...props}
      />
    );
  }
);
PhoneInput.displayName = 'PhoneInput';

// Custom input field component
const PhoneInputField = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      'rounded-l-none',
      error && 'border-destructive focus-visible:ring-destructive',
      className
    )}
    {...props}
  />
));
PhoneInputField.displayName = 'PhoneInputField';

// Custom country select component
interface CountrySelectProps {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: { value: RPNInput.Country; label: string }[];
}

function CountrySelect({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'flex gap-1 rounded-r-none border-r-0 px-3 focus:z-10',
            disabled && 'pointer-events-none opacity-50'
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn(
              '-mr-2 h-4 w-4 opacity-50',
              disabled && 'hidden'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-72">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <FlagComponent
                      country={option.value}
                      countryName={option.label}
                    />
                    <span className="ml-2 flex-1 text-sm">{option.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {`+${RPNInput.getCountryCallingCode(option.value)}`}
                    </span>
                    <Check
                      className={cn(
                        'ml-2 h-4 w-4',
                        option.value === value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Flag component
function FlagComponent({
  country,
  countryName,
}: {
  country: RPNInput.Country;
  countryName: string;
}) {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-muted">
      {Flag && <Flag title={countryName} />}
    </span>
  );
}

export { PhoneInput };
export type { PhoneInputProps };
```

## Validation Utilities

```tsx
// lib/utils/phone.ts
import {
  isValidPhoneNumber,
  parsePhoneNumber,
  formatPhoneNumber,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js';

export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  return isValidPhoneNumber(phone);
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed?.formatInternational() || phone;
  } catch {
    return phone;
  }
}

export function getPhoneCountry(phone: string): CountryCode | undefined {
  if (!phone) return undefined;
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed?.country;
  } catch {
    return undefined;
  }
}

export function getE164(phone: string): string {
  if (!phone) return '';
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed?.format('E.164') || phone;
  } catch {
    return phone;
  }
}

export { getCountryCallingCode };
export type { CountryCode };
```

## Usage

```tsx
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

function ContactForm() {
  const [phone, setPhone] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (value: string) => {
    setPhone(value || '');
    if (value && !isValidPhoneNumber(value)) {
      setError('Please enter a valid phone number');
    } else {
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Phone Number</label>
      <PhoneInput
        value={phone}
        onChange={handleChange}
        defaultCountry="US"
        error={!!error}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
```

## With React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const schema = z.object({
  phone: z.string().refine(isValidPhoneNumber, {
    message: 'Invalid phone number',
  }),
});

function PhoneForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { phone: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
      <Controller
        name="phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <PhoneInput
              {...field}
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

## Restrict Countries

```tsx
// Only show US and Canada
<PhoneInput
  value={phone}
  onChange={setPhone}
  countries={['US', 'CA']}
  defaultCountry="US"
/>

// European countries
<PhoneInput
  value={phone}
  onChange={setPhone}
  countries={['GB', 'DE', 'FR', 'ES', 'IT', 'NL']}
  defaultCountry="GB"
/>
```

## Dependencies

```bash
npm install react-phone-number-input libphonenumber-js
```

## Styles

```css
/* Add to globals.css */
.PhoneInputCountryIcon {
  width: 1.5rem;
  height: 1rem;
}

.PhoneInputCountryIcon--border {
  background-color: transparent;
  box-shadow: none;
}
```

## Related Skills

- [address-input](./address-input.md) - Address autocomplete
- [form-field](./form-field.md) - Form field wrapper
- [input-text](../atoms/input-text.md) - Base text input

---

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation
- Country selector with search
- International formatting
- Validation utilities
