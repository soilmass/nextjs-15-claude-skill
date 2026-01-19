---
id: pt-geocoding
name: Geocoding
version: 1.0.0
layer: L5
category: location
description: Convert addresses to coordinates and vice versa using geocoding APIs
tags: [geocoding, maps, location, address, coordinates, next15, react19]
composes: []
dependencies: []
formula: "Geocoding = AddressInput + GeocodingAPI + CoordinateStore + ReverseGeocoding"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Geocoding

## When to Use

- When building location-based services
- For address validation and standardization
- When implementing store locators
- For delivery address verification
- When building maps with address search

## Overview

This pattern implements geocoding using Google Maps and Mapbox APIs for converting addresses to coordinates (geocoding) and coordinates to addresses (reverse geocoding).

## Geocoding Service

```typescript
// lib/geocoding/index.ts

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  components: {
    streetNumber?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  placeId?: string;
}

export interface ReverseGeocodingResult {
  formattedAddress: string;
  components: GeocodingResult["components"];
}
```

## Google Maps Geocoding

```typescript
// lib/geocoding/google.ts
import { GeocodingResult, ReverseGeocodingResult } from "./index";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    address,
    key: GOOGLE_API_KEY!,
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`);
  const data = await response.json();

  if (data.status !== "OK" || !data.results[0]) {
    return null;
  }

  const result = data.results[0];
  const components = parseAddressComponents(result.address_components);

  return {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    components,
    placeId: result.place_id,
  };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodingResult | null> {
  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: GOOGLE_API_KEY!,
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`);
  const data = await response.json();

  if (data.status !== "OK" || !data.results[0]) {
    return null;
  }

  const result = data.results[0];

  return {
    formattedAddress: result.formatted_address,
    components: parseAddressComponents(result.address_components),
  };
}

function parseAddressComponents(components: any[]): GeocodingResult["components"] {
  const result: GeocodingResult["components"] = {};

  for (const component of components) {
    const types = component.types;

    if (types.includes("street_number")) {
      result.streetNumber = component.long_name;
    } else if (types.includes("route")) {
      result.street = component.long_name;
    } else if (types.includes("locality")) {
      result.city = component.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      result.state = component.short_name;
    } else if (types.includes("country")) {
      result.country = component.long_name;
    } else if (types.includes("postal_code")) {
      result.postalCode = component.long_name;
    }
  }

  return result;
}
```

## Mapbox Geocoding

```typescript
// lib/geocoding/mapbox.ts
import { GeocodingResult, ReverseGeocodingResult } from "./index";

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export async function geocodeAddressMapbox(address: string): Promise<GeocodingResult | null> {
  const encodedAddress = encodeURIComponent(address);
  const url = `${GEOCODING_URL}/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&types=address`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.features?.[0]) {
    return null;
  }

  const feature = data.features[0];
  const [longitude, latitude] = feature.center;

  return {
    latitude,
    longitude,
    formattedAddress: feature.place_name,
    components: parseMapboxContext(feature.context || []),
    placeId: feature.id,
  };
}

export async function reverseGeocodeMapbox(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodingResult | null> {
  const url = `${GEOCODING_URL}/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.features?.[0]) {
    return null;
  }

  const feature = data.features[0];

  return {
    formattedAddress: feature.place_name,
    components: parseMapboxContext(feature.context || []),
  };
}

function parseMapboxContext(context: any[]): GeocodingResult["components"] {
  const result: GeocodingResult["components"] = {};

  for (const item of context) {
    const id = item.id;

    if (id.startsWith("place")) {
      result.city = item.text;
    } else if (id.startsWith("region")) {
      result.state = item.short_code?.replace("US-", "") || item.text;
    } else if (id.startsWith("country")) {
      result.country = item.text;
    } else if (id.startsWith("postcode")) {
      result.postalCode = item.text;
    }
  }

  return result;
}
```

## Geocoding API Route

```typescript
// app/api/geocode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress, reverseGeocode } from "@/lib/geocoding/google";
import { z } from "zod";

const geocodeSchema = z.object({
  address: z.string().min(1).max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine(
  (data) => data.address || (data.latitude !== undefined && data.longitude !== undefined),
  { message: "Either address or coordinates required" }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = geocodeSchema.parse(body);

    if (data.address) {
      const result = await geocodeAddress(data.address);
      if (!result) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    }

    const result = await reverseGeocode(data.latitude!, data.longitude!);
    if (!result) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 500 }
    );
  }
}
```

## Address Autocomplete Component

```typescript
// components/location/address-autocomplete.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Loader2 } from "lucide-react";

interface AddressAutocompleteProps {
  value?: string;
  onSelect: (result: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
}

interface Suggestion {
  placeId: string;
  description: string;
}

export function AddressAutocomplete({
  value,
  onSelect,
  placeholder = "Enter an address...",
}: AddressAutocompleteProps) {
  const [input, setInput] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedInput = useDebounce(input, 300);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (window.google) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const div = document.createElement("div");
      placesService.current = new google.maps.places.PlacesService(div);
    }
  }, []);

  useEffect(() => {
    if (!debouncedInput || debouncedInput.length < 3 || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    autocompleteService.current.getPlacePredictions(
      { input: debouncedInput, types: ["address"] },
      (predictions, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(
            predictions.map((p) => ({
              placeId: p.place_id,
              description: p.description,
            }))
          );
          setOpen(true);
        }
      }
    );
  }, [debouncedInput]);

  const handleSelect = (suggestion: Suggestion) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      { placeId: suggestion.placeId, fields: ["geometry", "formatted_address"] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          onSelect({
            address: place.formatted_address || suggestion.description,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          });
          setInput(place.formatted_address || suggestion.description);
          setOpen(false);
        }
      }
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No addresses found</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion.placeId}
                  value={suggestion.description}
                  onSelect={() => handleSelect(suggestion)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {suggestion.description}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

## Location Picker with Map

```typescript
// components/location/location-picker.tsx
"use client";

import { useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { AddressAutocomplete } from "./address-autocomplete";
import { reverseGeocode } from "@/lib/geocoding/google";

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationChange: (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export function LocationPicker({
  initialLocation,
  onLocationChange,
}: LocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const [marker, setMarker] = useState(initialLocation);

  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });

      const result = await reverseGeocode(lat, lng);
      if (result) {
        onLocationChange({
          address: result.formattedAddress,
          latitude: lat,
          longitude: lng,
        });
      }
    },
    [onLocationChange]
  );

  const handleAddressSelect = useCallback(
    (result: { address: string; latitude: number; longitude: number }) => {
      setMarker({ lat: result.latitude, lng: result.longitude });
      onLocationChange(result);
    },
    [onLocationChange]
  );

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="space-y-4">
      <AddressAutocomplete onSelect={handleAddressSelect} />

      <div className="h-[400px] rounded-lg overflow-hidden">
        <GoogleMap
          center={marker || { lat: 40.7128, lng: -74.006 }}
          zoom={marker ? 15 : 10}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </div>
    </div>
  );
}
```

## Caching Geocoding Results

```typescript
// lib/geocoding/cache.ts
import { prisma } from "@/lib/db";
import { geocodeAddress } from "./google";
import type { GeocodingResult } from "./index";

export async function getCachedOrGeocode(address: string): Promise<GeocodingResult | null> {
  // Check cache first
  const cached = await prisma.geocodeCache.findFirst({
    where: { address: address.toLowerCase() },
  });

  if (cached) {
    return {
      latitude: cached.latitude,
      longitude: cached.longitude,
      formattedAddress: cached.formattedAddress,
      components: cached.components as GeocodingResult["components"],
      placeId: cached.placeId || undefined,
    };
  }

  // Geocode and cache
  const result = await geocodeAddress(address);

  if (result) {
    await prisma.geocodeCache.create({
      data: {
        address: address.toLowerCase(),
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: result.formattedAddress,
        components: result.components,
        placeId: result.placeId,
      },
    });
  }

  return result;
}
```

## Anti-patterns

### Don't Call Geocoding API on Every Keystroke

```typescript
// BAD - API call per character
<Input onChange={(e) => geocodeAddress(e.target.value)} />

// GOOD - Debounce input
const debouncedQuery = useDebounce(query, 300);
useEffect(() => {
  if (debouncedQuery.length >= 3) geocodeAddress(debouncedQuery);
}, [debouncedQuery]);
```

## Related Patterns

- [search](./search.md)
- [caching](./cache-aside.md)
- [form-validation](./form-validation.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Google Maps and Mapbox support
- Address autocomplete
- Location picker
- Geocoding cache
