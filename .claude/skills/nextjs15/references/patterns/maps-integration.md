---
id: pt-maps-integration
name: Maps Integration
version: 2.0.0
layer: L5
category: data
description: Google Maps and Mapbox integration with markers, clustering, and geocoding
tags: [maps, google-maps, mapbox, geolocation, markers, clustering, geocoding]
composes: []
formula: "MapsIntegration = MapProvider + MarkerClustering + Geocoding + AddressAutocomplete + InfoWindows"
dependencies:
  - react
  - next
  - "@react-google-maps/api"
  - mapbox-gl
  - react-map-gl
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Maps Integration

## When to Use

- Displaying location-based data (store locators, property listings)
- Building delivery tracking interfaces with route visualization
- Creating address autocomplete inputs for checkout forms
- Showing event locations or points of interest
- Implementing geofencing or location-aware features
- Visualizing geographic data with custom markers and clusters

## Composition Diagram

```
[Map Provider Setup]
      |
      +---> [Google Maps API] or [Mapbox GL]
      |
      v
[Map Component]
      |
      +---> [Map Instance]
      |         |
      |         +---> [Viewport State (center, zoom)]
      |         +---> [Map Controls (nav, geolocate)]
      |         +---> [Map Events (click, bounds change)]
      |
      +---> [Markers Layer]
      |         |
      |         +---> [Individual Markers]
      |         +---> [MarkerClusterer (for many points)]
      |         +---> [InfoWindow/Popup on click]
      |
      +---> [Geocoding Service]
      |         |
      |         +---> [Address -> Coordinates]
      |         +---> [Coordinates -> Address]
      |
      +---> [Places Autocomplete]
               |
               +---> [Address Input -> Predictions -> Selection]
```

## Overview

Comprehensive maps integration supporting both Google Maps and Mapbox. Includes markers, clustering, directions, geocoding, and interactive features.

## Implementation

### Map Types

```tsx
// lib/maps/types.ts
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  title?: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeocodingResult {
  address: string;
  position: Coordinates;
  placeId?: string;
  types?: string[];
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  steps: DirectionStep[];
  polyline: string;
}

export interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
}
```

### Google Maps Provider

```tsx
// components/maps/google-maps-provider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useJsApiLoader, Libraries } from '@react-google-maps/api';

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: undefined,
});

const libraries: Libraries = ['places', 'geometry', 'drawing'];

interface GoogleMapsProviderProps {
  children: ReactNode;
  apiKey: string;
}

export function GoogleMapsProvider({ children, apiKey }: GoogleMapsProviderProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}
```

### Google Map Component

```tsx
// components/maps/google-map.tsx
'use client';

import { useCallback, useState, useRef, memo } from 'react';
import {
  GoogleMap as GoogleMapComponent,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from '@react-google-maps/api';
import { useGoogleMaps } from './google-maps-provider';
import { Coordinates, MapMarker, MapBounds } from '@/lib/maps/types';

interface GoogleMapProps {
  center?: Coordinates;
  zoom?: number;
  markers?: MapMarker[];
  enableClustering?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (position: Coordinates) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const defaultCenter: Coordinates = { lat: 40.7128, lng: -74.006 }; // NYC

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

export const GoogleMap = memo(function GoogleMap({
  center = defaultCenter,
  zoom = 12,
  markers = [],
  enableClustering = false,
  onMarkerClick,
  onMapClick,
  onBoundsChange,
  className,
  style,
  children,
}: GoogleMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onMapClick?.({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      }
      setSelectedMarker(null);
    },
    [onMapClick]
  );

  const handleBoundsChanged = useCallback(() => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        onBoundsChange?.({
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng(),
        });
      }
    }
  }, [onBoundsChange]);

  const handleMarkerClick = useCallback(
    (marker: MapMarker) => {
      setSelectedMarker(marker);
      onMarkerClick?.(marker);
    },
    [onMarkerClick]
  );

  if (loadError) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="p-4 bg-gray-100 animate-pulse rounded-lg" style={mapContainerStyle} />;
  }

  const renderMarkers = () => {
    if (enableClustering && markers.length > 0) {
      return (
        <MarkerClusterer>
          {(clusterer) =>
            markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                title={marker.title}
                clusterer={clusterer}
                onClick={() => handleMarkerClick(marker)}
              />
            ))
          }
        </MarkerClusterer>
      );
    }

    return markers.map((marker) => (
      <Marker
        key={marker.id}
        position={marker.position}
        title={marker.title}
        onClick={() => handleMarkerClick(marker)}
      />
    ));
  };

  return (
    <GoogleMapComponent
      mapContainerStyle={{ ...mapContainerStyle, ...style }}
      mapContainerClassName={className}
      center={center}
      zoom={zoom}
      options={mapOptions}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      onBoundsChanged={handleBoundsChanged}
    >
      {renderMarkers()}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2">
            <h3 className="font-medium">{selectedMarker.title}</h3>
            {selectedMarker.data?.description && (
              <p className="text-sm text-gray-600">
                {selectedMarker.data.description as string}
              </p>
            )}
          </div>
        </InfoWindow>
      )}

      {children}
    </GoogleMapComponent>
  );
});
```

### Mapbox Map Component

```tsx
// components/maps/mapbox-map.tsx
'use client';

import { useCallback, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { Coordinates, MapMarker } from '@/lib/maps/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  center?: Coordinates;
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (position: Coordinates) => void;
  mapStyle?: string;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapboxMap({
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 12,
  markers = [],
  onMarkerClick,
  onMapClick,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  className,
}: MapboxMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom,
  });

  const handleMapClick = useCallback(
    (e: mapboxgl.MapLayerMouseEvent) => {
      onMapClick?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      setSelectedMarker(null);
    },
    [onMapClick]
  );

  const handleMarkerClick = useCallback(
    (marker: MapMarker) => {
      setSelectedMarker(marker);
      onMarkerClick?.(marker);
    },
    [onMarkerClick]
  );

  if (!MAPBOX_TOKEN) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Mapbox token not configured</div>;
  }

  return (
    <Map
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      onClick={handleMapClick}
      mapStyle={mapStyle}
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '400px' }}
      className={className}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl position="top-right" />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          longitude={marker.position.lng}
          latitude={marker.position.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleMarkerClick(marker);
          }}
        >
          <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
        </Marker>
      ))}

      {selectedMarker && (
        <Popup
          longitude={selectedMarker.position.lng}
          latitude={selectedMarker.position.lat}
          anchor="bottom"
          onClose={() => setSelectedMarker(null)}
        >
          <div className="p-2">
            <h3 className="font-medium">{selectedMarker.title}</h3>
            {selectedMarker.data?.description && (
              <p className="text-sm text-gray-600">
                {selectedMarker.data.description as string}
              </p>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
}
```

### Geocoding Hook

```tsx
// hooks/use-geocoding.ts
'use client';

import { useState, useCallback } from 'react';
import { Coordinates, GeocodingResult } from '@/lib/maps/types';

interface UseGeocodingOptions {
  provider?: 'google' | 'mapbox';
}

export function useGeocoding({ provider = 'google' }: UseGeocodingOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(
    async (address: string): Promise<GeocodingResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/geocode?address=${encodeURIComponent(address)}&provider=${provider}`
        );

        if (!response.ok) {
          throw new Error('Geocoding failed');
        }

        const result = await response.json();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Geocoding failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [provider]
  );

  const reverseGeocode = useCallback(
    async (position: Coordinates): Promise<GeocodingResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/geocode?lat=${position.lat}&lng=${position.lng}&provider=${provider}`
        );

        if (!response.ok) {
          throw new Error('Reverse geocoding failed');
        }

        const result = await response.json();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reverse geocoding failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [provider]
  );

  return { geocode, reverseGeocode, isLoading, error };
}
```

### Address Autocomplete

```tsx
// components/maps/address-autocomplete.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useGoogleMaps } from './google-maps-provider';
import { MapPin, Loader2 } from 'lucide-react';
import { Coordinates } from '@/lib/maps/types';

interface AddressAutocompleteProps {
  value?: string;
  onChange: (address: string, position?: Coordinates) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value = '',
  onChange,
  placeholder = 'Enter an address...',
  className,
}: AddressAutocompleteProps) {
  const { isLoaded } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      // PlacesService needs a map or element
      const div = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(div);
    }
  }, [isLoaded]);

  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!autocompleteService.current || input.length < 3) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await new Promise<google.maps.places.AutocompletePrediction[]>(
          (resolve, reject) => {
            autocompleteService.current!.getPlacePredictions(
              { input, types: ['address'] },
              (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                  resolve(predictions);
                } else {
                  resolve([]);
                }
              }
            );
          }
        );

        setPredictions(response);
        setIsOpen(response.length > 0);
      } catch {
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSelect = useCallback(
    async (prediction: google.maps.places.AutocompletePrediction) => {
      setInputValue(prediction.description);
      setIsOpen(false);
      setPredictions([]);

      if (placesService.current) {
        placesService.current.getDetails(
          { placeId: prediction.place_id, fields: ['geometry'] },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
              onChange(prediction.description, {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            } else {
              onChange(prediction.description);
            }
          }
        );
      }
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    fetchPredictions(newValue);
  };

  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <input
          type="text"
          disabled
          placeholder="Loading..."
          className="w-full px-4 py-2 border rounded-md bg-gray-100"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              onClick={() => handleSelect(prediction)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              <span className="font-medium">
                {prediction.structured_formatting.main_text}
              </span>
              <span className="text-gray-500 ml-1">
                {prediction.structured_formatting.secondary_text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Geocoding API Route

```tsx
// app/api/geocode/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const provider = searchParams.get('provider') || 'google';

  try {
    if (provider === 'google') {
      return await geocodeGoogle(address, lat, lng);
    } else {
      return await geocodeMapbox(address, lat, lng);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Geocoding failed' },
      { status: 500 }
    );
  }
}

async function geocodeGoogle(
  address: string | null,
  lat: string | null,
  lng: string | null
) {
  let url: string;

  if (address) {
    url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  } else if (lat && lng) {
    url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
  } else {
    return NextResponse.json({ error: 'Address or coordinates required' }, { status: 400 });
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results[0]) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  const result = data.results[0];
  return NextResponse.json({
    address: result.formatted_address,
    position: {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    },
    placeId: result.place_id,
    types: result.types,
  });
}

async function geocodeMapbox(
  address: string | null,
  lat: string | null,
  lng: string | null
) {
  let url: string;

  if (address) {
    url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`;
  } else if (lat && lng) {
    url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;
  } else {
    return NextResponse.json({ error: 'Address or coordinates required' }, { status: 400 });
  }

  const response = await fetch(url);
  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  const result = data.features[0];
  return NextResponse.json({
    address: result.place_name,
    position: {
      lat: result.center[1],
      lng: result.center[0],
    },
    placeId: result.id,
    types: result.place_type,
  });
}
```

## Usage

```tsx
// app/map/page.tsx
'use client';

import { useState } from 'react';
import { GoogleMapsProvider } from '@/components/maps/google-maps-provider';
import { GoogleMap } from '@/components/maps/google-map';
import { MapboxMap } from '@/components/maps/mapbox-map';
import { AddressAutocomplete } from '@/components/maps/address-autocomplete';
import { MapMarker, Coordinates } from '@/lib/maps/types';

const markers: MapMarker[] = [
  { id: '1', position: { lat: 40.7128, lng: -74.006 }, title: 'New York City' },
  { id: '2', position: { lat: 40.7580, lng: -73.9855 }, title: 'Times Square' },
  { id: '3', position: { lat: 40.6892, lng: -74.0445 }, title: 'Statue of Liberty' },
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [mapType, setMapType] = useState<'google' | 'mapbox'>('google');

  const handleAddressSelect = (address: string, position?: Coordinates) => {
    console.log('Selected:', address, position);
    if (position) setSelectedLocation(position);
  };

  return (
    <GoogleMapsProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">Maps Integration</h1>

        <div className="flex gap-4">
          <button
            onClick={() => setMapType('google')}
            className={`px-4 py-2 rounded-md ${
              mapType === 'google' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Google Maps
          </button>
          <button
            onClick={() => setMapType('mapbox')}
            className={`px-4 py-2 rounded-md ${
              mapType === 'mapbox' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Mapbox
          </button>
        </div>

        <AddressAutocomplete
          onChange={handleAddressSelect}
          placeholder="Search for an address..."
        />

        <div className="rounded-lg overflow-hidden border">
          {mapType === 'google' ? (
            <GoogleMap
              markers={markers}
              enableClustering
              center={selectedLocation || undefined}
              onMarkerClick={(m) => console.log('Clicked:', m)}
              onMapClick={(pos) => console.log('Map clicked:', pos)}
            />
          ) : (
            <MapboxMap
              markers={markers}
              center={selectedLocation || undefined}
              onMarkerClick={(m) => console.log('Clicked:', m)}
            />
          )}
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
```

## Related Skills

- [[geolocation]] - Browser geolocation
- [[address-autocomplete]] - Address input
- [[directions]] - Route planning
- [[clustering]] - Marker clustering

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Google Maps and Mapbox support
- Marker clustering
- Geocoding and reverse geocoding
- Address autocomplete
