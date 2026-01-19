---
id: m-address-input
name: Address Input
version: 2.0.0
layer: L2
category: forms
description: Address autocomplete input with Google Places or similar integration
tags: [address, autocomplete, places, google-maps, form, location]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "AddressInput = Input(a-input-text) + Icon(a-display-icon)"
composes:
  - ../atoms/input-text.md
  - ../atoms/display-icon.md
dependencies:
  react: "^19.0.0"
  "@googlemaps/js-api-loader": "^1.16.0"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Address Input

## Overview

An address input component with autocomplete functionality using Google Places API or similar services. Provides structured address data including street, city, state, postal code, and coordinates.

## Composition Diagram

```
+--------------------------------------------------+
|                  AddressInput                     |
|  +--------------------------------------------+  |
|  |  +--------+  +-------------------------+   |  |
|  |  |  Icon  |  |         Input           |   |  |
|  |  | (Map)  |  | [Enter an address...  ] |   |  |
|  |  +--------+  +-------------------------+   |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  |         Autocomplete Suggestions            |  |
|  |  +--------------------------------------+  |  |
|  |  | 123 Main St, City, State             |  |  |
|  |  +--------------------------------------+  |  |
|  |  | 456 Oak Ave, Town, State             |  |  |
|  |  +--------------------------------------+  |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

## Implementation

```tsx
// components/ui/address-input.tsx
'use client';

import * as React from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface AddressComponents {
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  formattedAddress: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

export interface AddressInputProps {
  /** Current value */
  value?: AddressComponents | null;
  /** Change handler */
  onChange?: (address: AddressComponents | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Restrict to specific countries (ISO 3166-1 alpha-2) */
  countries?: string[];
  /** Bias results to location */
  biasLocation?: { lat: number; lng: number };
  /** Bias radius in meters */
  biasRadius?: number;
  /** Types of places to return */
  types?: ('address' | 'geocode' | 'establishment' | 'regions')[];
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show clear button */
  showClear?: boolean;
  /** Custom class */
  className?: string;
}

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['places'],
});

export function AddressInput({
  value,
  onChange,
  placeholder = 'Enter an address',
  countries,
  biasLocation,
  biasRadius = 50000,
  types = ['address'],
  disabled = false,
  error = false,
  size = 'md',
  showClear = true,
  className,
}: AddressInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = React.useState(value?.formattedAddress || '');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync input value with external value
  React.useEffect(() => {
    if (value?.formattedAddress) {
      setInputValue(value.formattedAddress);
    } else if (value === null) {
      setInputValue('');
    }
  }, [value]);

  // Initialize Google Places Autocomplete
  React.useEffect(() => {
    let mounted = true;

    async function initAutocomplete() {
      if (!inputRef.current) return;

      try {
        await loader.load();
        
        if (!mounted || !inputRef.current) return;

        const options: google.maps.places.AutocompleteOptions = {
          types,
          fields: [
            'address_components',
            'formatted_address',
            'geometry',
            'place_id',
          ],
        };

        if (countries?.length) {
          options.componentRestrictions = { country: countries };
        }

        const autocomplete = new google.maps.places.Autocomplete(
          inputRef.current,
          options
        );

        // Bias to location if provided
        if (biasLocation) {
          const circle = new google.maps.Circle({
            center: biasLocation,
            radius: biasRadius,
          });
          autocomplete.setBounds(circle.getBounds()!);
        }

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.address_components) return;

          const components = parseAddressComponents(
            place.address_components,
            place.formatted_address || '',
            place.geometry?.location,
            place.place_id
          );

          setInputValue(components.formattedAddress);
          onChange?.(components);
        });

        autocompleteRef.current = autocomplete;
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load Google Places:', error);
        setIsLoading(false);
      }
    }

    initAutocomplete();

    return () => {
      mounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [countries, biasLocation, biasRadius, types, onChange]);

  const handleClear = () => {
    setInputValue('');
    onChange?.(null);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Don't call onChange here - wait for autocomplete selection
  };

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg',
  };

  return (
    <div className={cn('relative', className)}>
      <MapPin
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
          size === 'sm' && 'h-3.5 w-3.5',
          size === 'md' && 'h-4 w-4',
          size === 'lg' && 'h-5 w-5'
        )}
      />
      
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className={cn(
          'pl-10 pr-10',
          sizeClasses[size],
          error && 'border-destructive focus-visible:ring-destructive'
        )}
        autoComplete="off"
      />

      {isLoading && (
        <Loader2
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground',
            size === 'sm' && 'h-3.5 w-3.5',
            size === 'md' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )}
        />
      )}

      {!isLoading && showClear && inputValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'absolute right-1 top-1/2 -translate-y-1/2',
            size === 'sm' && 'h-6 w-6',
            size === 'md' && 'h-8 w-8',
            size === 'lg' && 'h-10 w-10'
          )}
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear</span>
        </Button>
      )}
    </div>
  );
}

// Helper to parse Google Places address components
function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[],
  formattedAddress: string,
  location?: google.maps.LatLng,
  placeId?: string
): AddressComponents {
  const result: AddressComponents = { formattedAddress };

  components.forEach((component) => {
    const types = component.types;

    if (types.includes('street_number')) {
      result.streetNumber = component.long_name;
    }
    if (types.includes('route')) {
      result.street = component.long_name;
    }
    if (types.includes('locality')) {
      result.city = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      result.state = component.long_name;
      result.stateCode = component.short_name;
    }
    if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    }
    if (types.includes('country')) {
      result.country = component.long_name;
      result.countryCode = component.short_name;
    }
  });

  if (location) {
    result.lat = location.lat();
    result.lng = location.lng();
  }

  if (placeId) {
    result.placeId = placeId;
  }

  return result;
}
```

## Usage

```tsx
import { AddressInput, AddressComponents } from '@/components/ui/address-input';

function ShippingForm() {
  const [address, setAddress] = React.useState<AddressComponents | null>(null);

  return (
    <div className="space-y-4">
      <AddressInput
        value={address}
        onChange={setAddress}
        placeholder="Enter shipping address"
        countries={['us', 'ca']}
      />
      
      {address && (
        <div className="text-sm text-muted-foreground">
          <p>Street: {address.street}</p>
          <p>City: {address.city}</p>
          <p>State: {address.stateCode}</p>
          <p>Postal: {address.postalCode}</p>
        </div>
      )}
    </div>
  );
}
```

## With Manual Entry Fallback

```tsx
function AddressFormWithFallback() {
  const [useManual, setUseManual] = React.useState(false);
  const [address, setAddress] = React.useState<AddressComponents | null>(null);

  if (useManual) {
    return <ManualAddressForm />;
  }

  return (
    <div className="space-y-2">
      <AddressInput
        value={address}
        onChange={setAddress}
      />
      <button
        type="button"
        onClick={() => setUseManual(true)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Enter address manually
      </button>
    </div>
  );
}
```

## Environment Variables

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Dependencies

```bash
npm install @googlemaps/js-api-loader
npm install -D @types/google.maps
```

## Related Skills

- [phone-input](./phone-input.md) - Phone number input
- [form-field](./form-field.md) - Form field wrapper
- [checkout-form](../organisms/checkout-form.md) - Checkout with address

---

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation
- Google Places integration
- Country restrictions
- Location biasing
