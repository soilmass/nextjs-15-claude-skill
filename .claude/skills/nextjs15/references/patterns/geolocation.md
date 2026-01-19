---
id: pt-geolocation
name: Geolocation
version: 2.0.0
layer: L5
category: edge
description: Implement geographic-aware features using edge geolocation data
tags: [edge, geolocation, geo, routing, personalization]
composes: []
dependencies: []
formula: request.geo + Regional Config + Middleware = Location-Aware Experience
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Implementing regional redirects and domain routing
- Personalizing content based on user location
- Applying regional pricing with PPP adjustments
- Showing GDPR consent banners for EU users
- Finding nearest physical locations

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Geolocation Flow                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Request                                               │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Edge (Vercel provides geo data automatically)       │   │
│  │                                                     │   │
│  │ request.geo = {                                     │   │
│  │   country: "DE",                                    │   │
│  │   city: "Berlin",                                   │   │
│  │   region: "BE",                                     │   │
│  │   latitude: "52.52",                                │   │
│  │   longitude: "13.405"                               │   │
│  │ }                                                   │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│         ┌──────────────┼──────────────┬─────────────┐      │
│         ▼              ▼              ▼             ▼      │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Regional   │ │ Content    │ │ Regional │ │ GDPR     │  │
│  │ Redirect   │ │ Personal-  │ │ Pricing  │ │ Banner   │  │
│  │            │ │ ization    │ │          │ │          │  │
│  │ de.site.co │ │ Language   │ │ EUR      │ │ EU only  │  │
│  │ /de/...    │ │ Currency   │ │ +19% VAT │ │          │  │
│  └────────────┘ └────────────┘ └──────────┘ └──────────┘  │
│                                                             │
│  User Preferences:                                          │
│  - Respect cookie "preferred_region" if set                │
│  - Allow manual region selection                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Geolocation

Use geographic data at the edge to personalize content, route requests, and implement regional features.

## Overview

Geolocation enables:
- Content localization
- Regional pricing
- Compliance (GDPR, etc.)
- Performance optimization
- Fraud detection

## Implementation

### Accessing Geo Data in Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Geo data provided by Vercel
  const country = request.geo?.country || "US";
  const city = request.geo?.city || "Unknown";
  const region = request.geo?.region || "Unknown";
  const latitude = request.geo?.latitude;
  const longitude = request.geo?.longitude;
  
  // Add geo headers for downstream use
  const response = NextResponse.next();
  response.headers.set("x-geo-country", country);
  response.headers.set("x-geo-city", city);
  response.headers.set("x-geo-region", region);
  
  if (latitude && longitude) {
    response.headers.set("x-geo-latitude", latitude);
    response.headers.set("x-geo-longitude", longitude);
  }
  
  return response;
}
```

### Regional Redirects

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REGIONAL_DOMAINS = {
  US: "us.example.com",
  GB: "uk.example.com",
  DE: "de.example.com",
  FR: "fr.example.com",
  JP: "jp.example.com",
};

const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
];

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";
  const { pathname, search } = request.nextUrl;
  
  // Skip for API routes and static assets
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  
  // Check if user has already chosen a region
  const preferredRegion = request.cookies.get("preferred_region")?.value;
  if (preferredRegion) {
    return NextResponse.next();
  }
  
  // Redirect to regional domain
  const regionalDomain = REGIONAL_DOMAINS[country as keyof typeof REGIONAL_DOMAINS];
  if (regionalDomain && request.headers.get("host") !== regionalDomain) {
    const url = new URL(pathname + search, `https://${regionalDomain}`);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// API to set region preference
// app/api/region/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { region } = await request.json();
  
  const response = NextResponse.json({ success: true });
  response.cookies.set("preferred_region", region, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  
  return response;
}
```

### Geo-Based Content Personalization

```typescript
// lib/geo/content.ts
import { headers } from "next/headers";

interface GeoData {
  country: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
}

export async function getGeoData(): Promise<GeoData> {
  const headersList = await headers();
  
  return {
    country: headersList.get("x-geo-country") || "US",
    city: headersList.get("x-geo-city") || "Unknown",
    region: headersList.get("x-geo-region") || "Unknown",
    latitude: headersList.get("x-geo-latitude")
      ? parseFloat(headersList.get("x-geo-latitude")!)
      : undefined,
    longitude: headersList.get("x-geo-longitude")
      ? parseFloat(headersList.get("x-geo-longitude")!)
      : undefined,
  };
}

// Country-specific content
const COUNTRY_CONTENT: Record<string, {
  currency: string;
  currencySymbol: string;
  language: string;
  supportPhone: string;
}> = {
  US: {
    currency: "USD",
    currencySymbol: "$",
    language: "en-US",
    supportPhone: "+1-800-123-4567",
  },
  GB: {
    currency: "GBP",
    currencySymbol: "£",
    language: "en-GB",
    supportPhone: "+44-800-123-4567",
  },
  DE: {
    currency: "EUR",
    currencySymbol: "€",
    language: "de-DE",
    supportPhone: "+49-800-123-4567",
  },
  JP: {
    currency: "JPY",
    currencySymbol: "¥",
    language: "ja-JP",
    supportPhone: "+81-800-123-4567",
  },
};

export function getCountryConfig(country: string) {
  return COUNTRY_CONTENT[country] || COUNTRY_CONTENT.US;
}

// Usage in Server Component
// app/page.tsx
import { getGeoData, getCountryConfig } from "@/lib/geo/content";

export default async function HomePage() {
  const geo = await getGeoData();
  const config = getCountryConfig(geo.country);
  
  return (
    <div>
      <p>Welcome from {geo.city}, {geo.country}!</p>
      <p>Currency: {config.currencySymbol}</p>
      <p>Support: {config.supportPhone}</p>
    </div>
  );
}
```

### Regional Pricing

```typescript
// lib/pricing/geo-pricing.ts
interface PricingTier {
  basePrice: number;
  currency: string;
  taxRate: number;
}

const REGIONAL_PRICING: Record<string, PricingTier> = {
  US: { basePrice: 99, currency: "USD", taxRate: 0 },
  GB: { basePrice: 79, currency: "GBP", taxRate: 0.20 },
  DE: { basePrice: 89, currency: "EUR", taxRate: 0.19 },
  FR: { basePrice: 89, currency: "EUR", taxRate: 0.20 },
  JP: { basePrice: 10000, currency: "JPY", taxRate: 0.10 },
  IN: { basePrice: 4999, currency: "INR", taxRate: 0.18 },
  BR: { basePrice: 299, currency: "BRL", taxRate: 0 },
};

// Purchasing Power Parity adjustments
const PPP_MULTIPLIERS: Record<string, number> = {
  IN: 0.25,
  BR: 0.5,
  MX: 0.5,
  PL: 0.6,
  // Add more as needed
};

export function getRegionalPrice(
  baseUsdPrice: number,
  country: string,
  applyPPP: boolean = false
): {
  price: number;
  currency: string;
  taxRate: number;
  totalWithTax: number;
  formattedPrice: string;
} {
  const pricing = REGIONAL_PRICING[country] || REGIONAL_PRICING.US;
  
  let price = pricing.basePrice;
  
  // Apply PPP discount if enabled
  if (applyPPP && PPP_MULTIPLIERS[country]) {
    price = Math.round(price * PPP_MULTIPLIERS[country]);
  }
  
  const totalWithTax = price * (1 + pricing.taxRate);
  
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: pricing.currency,
  });
  
  return {
    price,
    currency: pricing.currency,
    taxRate: pricing.taxRate,
    totalWithTax,
    formattedPrice: formatter.format(totalWithTax),
  };
}

// API endpoint
// app/api/pricing/route.ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const country = request.geo?.country || "US";
  const productId = request.nextUrl.searchParams.get("product");
  
  const product = await getProduct(productId);
  const pricing = getRegionalPrice(product.basePrice, country, true);
  
  return NextResponse.json({
    product: product.name,
    country,
    ...pricing,
  });
}
```

### GDPR Compliance Banner

```typescript
// middleware.ts - Detect EU users
export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";
  const isEU = EU_COUNTRIES.includes(country);
  
  const response = NextResponse.next();
  response.headers.set("x-is-eu", isEU ? "true" : "false");
  
  return response;
}

// components/gdpr-banner.tsx
import { headers } from "next/headers";
import { GDPRBannerClient } from "./gdpr-banner-client";

export async function GDPRBanner() {
  const headersList = await headers();
  const isEU = headersList.get("x-is-eu") === "true";
  
  if (!isEU) return null;
  
  return <GDPRBannerClient />;
}

// components/gdpr-banner-client.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function GDPRBannerClient() {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem("gdpr_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem("gdpr_consent", "accepted");
    setShowBanner(false);
    // Enable analytics, etc.
  };
  
  const handleReject = () => {
    localStorage.setItem("gdpr_consent", "rejected");
    setShowBanner(false);
    // Disable non-essential cookies
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-sm">
          We use cookies to improve your experience. By continuing, you agree
          to our use of cookies.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReject}>
            Reject
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Distance-Based Features

```typescript
// lib/geo/distance.ts

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Find nearest locations
export function findNearestLocations(
  userLat: number,
  userLon: number,
  locations: Array<{ id: string; lat: number; lon: number; name: string }>,
  limit: number = 5
) {
  return locations
    .map((location) => ({
      ...location,
      distance: calculateDistance(userLat, userLon, location.lat, location.lon),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// API endpoint for nearest stores
// app/api/stores/nearest/route.ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const lat = request.geo?.latitude;
  const lon = request.geo?.longitude;
  
  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Location not available" },
      { status: 400 }
    );
  }
  
  const stores = await getStores();
  const nearest = findNearestLocations(
    parseFloat(lat),
    parseFloat(lon),
    stores,
    5
  );
  
  return NextResponse.json({ stores: nearest });
}
```

## Variants

### IP-Based Fallback

```typescript
// When edge geo is not available
// lib/geo/ip-lookup.ts

export async function getGeoFromIP(ip: string): Promise<GeoData | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    return {
      country: data.country_code,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

// Usage in middleware
export async function middleware(request: NextRequest) {
  let geo = request.geo;
  
  // Fallback to IP lookup if geo not available
  if (!geo?.country) {
    const ip = request.ip || request.headers.get("x-forwarded-for")?.split(",")[0];
    if (ip) {
      geo = await getGeoFromIP(ip);
    }
  }
  
  // Continue with geo data...
}
```

## Anti-patterns

### Over-Relying on Geo Data

```typescript
// BAD: Blocking content based on geo
if (country !== "US") {
  return NextResponse.redirect("/not-available");
}

// GOOD: Provide alternatives
if (country !== "US") {
  return NextResponse.redirect("/international");
}
```

### Not Respecting User Preferences

```typescript
// BAD: Always redirecting based on geo
export function middleware(request: NextRequest) {
  const country = request.geo?.country;
  // Always redirect - ignores user choice!
  return NextResponse.redirect(`/${country.toLowerCase()}`);
}

// GOOD: Check for user preference first
export function middleware(request: NextRequest) {
  const preferredRegion = request.cookies.get("region")?.value;
  
  if (preferredRegion) {
    // User has chosen a region, respect it
    return NextResponse.next();
  }
  
  // Suggest region based on geo
}
```

## Related Skills

- `edge-functions` - Edge function patterns
- `middleware` - Middleware patterns
- `i18n` - Internationalization
- `compliance` - Regulatory compliance

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Vercel geo data
