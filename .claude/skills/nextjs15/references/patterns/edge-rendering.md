---
id: pt-edge-rendering
name: Edge Rendering
version: 2.0.0
layer: L5
category: edge
description: Run code at the edge for low-latency personalization
tags: [render, edge, performance, geo, next15]
composes: []
dependencies: []
formula: Edge Runtime + Personalization + Caching = Low-Latency Dynamic Content
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Personalizing content based on geolocation
- Implementing A/B testing at the edge
- Rate limiting API requests globally
- Authentication verification at edge locations
- Caching dynamic content in Edge KV

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Edge Rendering Architecture                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Request (from any global location)                    │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Nearest Edge Location                               │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Edge Middleware                             │   │   │
│  │  │ - Geolocation detection                     │   │   │
│  │  │ - A/B variant assignment                    │   │   │
│  │  │ - Auth token verification                   │   │   │
│  │  │ - Rate limit check                          │   │   │
│  │  └──────────────────┬──────────────────────────┘   │   │
│  │                     │                               │   │
│  │                     ▼                               │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Edge Route Handler (runtime = 'edge')       │   │   │
│  │  │                                             │   │   │
│  │  │ ┌───────────────┐  ┌──────────────────┐    │   │   │
│  │  │ │ Edge KV       │  │ Edge Config      │    │   │   │
│  │  │ │ - Cache       │  │ - Feature flags  │    │   │   │
│  │  │ │ - Sessions    │  │ - Maintenance    │    │   │   │
│  │  │ └───────────────┘  └──────────────────┘    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Limitations (Edge Runtime):                               │
│  - No Node.js APIs (fs, path)                              │
│  - No native bindings                                       │
│  - 128MB memory limit                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Edge Rendering

## Overview

Edge rendering executes code at CDN edge locations, providing ultra-low latency by running close to users. Next.js supports Edge Runtime for both middleware and route handlers, enabling fast personalization, A/B testing, and geolocation features.

## Edge Route Handler

```typescript
// app/api/geo/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Run on the edge
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Access Vercel's geolocation headers
  const geo = {
    country: request.headers.get('x-vercel-ip-country') || 'Unknown',
    region: request.headers.get('x-vercel-ip-country-region') || 'Unknown',
    city: request.headers.get('x-vercel-ip-city') || 'Unknown',
    latitude: request.headers.get('x-vercel-ip-latitude'),
    longitude: request.headers.get('x-vercel-ip-longitude'),
  };

  return NextResponse.json(geo);
}

// app/api/localized-content/route.ts
export const runtime = 'edge';

const contentByCountry: Record<string, any> = {
  US: { currency: 'USD', language: 'en', offers: ['Free shipping over $50'] },
  GB: { currency: 'GBP', language: 'en', offers: ['Free shipping over £40'] },
  DE: { currency: 'EUR', language: 'de', offers: ['Kostenloser Versand ab 45€'] },
  FR: { currency: 'EUR', language: 'fr', offers: ['Livraison gratuite dès 45€'] },
};

export async function GET(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const content = contentByCountry[country] || contentByCountry['US'];

  return NextResponse.json(content);
}
```

## Edge Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware always runs on the edge
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add geolocation to headers for use in pages
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const city = request.headers.get('x-vercel-ip-city') || '';
  response.headers.set('x-user-country', country);
  response.headers.set('x-user-city', city);

  // Country-based redirects
  if (country === 'CN' && !request.nextUrl.pathname.startsWith('/cn')) {
    return NextResponse.redirect(new URL('/cn' + request.nextUrl.pathname, request.url));
  }

  // Bot detection
  const userAgent = request.headers.get('user-agent') || '';
  if (isBot(userAgent)) {
    response.headers.set('x-is-bot', 'true');
  }

  return response;
}

function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /slurp/i,
    /googlebot/i, /bingbot/i, /yandex/i,
  ];
  return botPatterns.some((pattern) => pattern.test(userAgent));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## A/B Testing at the Edge

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EXPERIMENT_COOKIE = 'ab_experiment';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check for existing experiment assignment
  let variant = request.cookies.get(EXPERIMENT_COOKIE)?.value;

  if (!variant) {
    // Assign variant based on random number
    variant = Math.random() < 0.5 ? 'control' : 'treatment';

    // Set cookie for consistency
    response.cookies.set(EXPERIMENT_COOKIE, variant, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
    });
  }

  // Add variant to headers for SSR
  response.headers.set('x-ab-variant', variant);

  // Or rewrite to different page versions
  if (request.nextUrl.pathname === '/' && variant === 'treatment') {
    return NextResponse.rewrite(new URL('/home-v2', request.url));
  }

  return response;
}

// app/page.tsx
import { headers } from 'next/headers';

export default async function HomePage() {
  const headersList = await headers();
  const variant = headersList.get('x-ab-variant') || 'control';

  return (
    <>
      {variant === 'control' ? <HomeControl /> : <HomeTreatment />}
    </>
  );
}
```

## Edge Config (Vercel)

```typescript
// lib/edge-config.ts
import { get, getAll } from '@vercel/edge-config';

// Feature flags from Edge Config
export async function getFeatureFlags() {
  const flags = await getAll();
  return flags as Record<string, boolean>;
}

export async function isFeatureEnabled(feature: string): Promise<boolean> {
  const value = await get<boolean>(feature);
  return value ?? false;
}

// app/api/features/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags, isFeatureEnabled } from '@/lib/edge-config';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const flags = await getFeatureFlags();
  return NextResponse.json(flags);
}

// middleware.ts
import { get } from '@vercel/edge-config';

export async function middleware(request: NextRequest) {
  // Check maintenance mode
  const isMaintenanceMode = await get<boolean>('maintenance_mode');

  if (isMaintenanceMode && !request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // Check feature flags for routes
  const newCheckoutEnabled = await get<boolean>('new_checkout');

  if (
    request.nextUrl.pathname.startsWith('/checkout') &&
    newCheckoutEnabled
  ) {
    return NextResponse.rewrite(new URL('/checkout-v2' + request.nextUrl.pathname.slice(9), request.url));
  }

  return NextResponse.next();
}
```

## Rate Limiting at the Edge

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiter
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

## Authentication at the Edge

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  // Public routes
  const publicPaths = ['/', '/login', '/register', '/api/auth'];
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Clear invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  // Add user info to headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.sub as string);
  response.headers.set('x-user-role', payload.role as string);

  // Check admin routes
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    payload.role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}
```

## Edge Caching with KV

```typescript
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try cache first
  const cacheKey = `product:${id}`;
  const cached = await kv.get(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  // Fetch from origin
  const product = await fetchProductFromOrigin(id);

  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Cache for 5 minutes
  await kv.set(cacheKey, product, { ex: 300 });

  return NextResponse.json(product, {
    headers: { 'X-Cache': 'MISS' },
  });
}

async function fetchProductFromOrigin(id: string) {
  // Fetch from database/API
  const response = await fetch(`${process.env.ORIGIN_URL}/products/${id}`);
  if (!response.ok) return null;
  return response.json();
}
```

## Edge Runtime Limitations

```typescript
// Things NOT available in Edge Runtime:

// 1. Node.js APIs
// import fs from 'fs';        // ❌ Not available
// import path from 'path';    // ❌ Not available

// 2. Node.js specific packages
// import bcrypt from 'bcrypt'; // ❌ Native bindings

// 3. Large npm packages
// Heavy packages increase cold start time

// Alternatives for Edge:

// Use crypto instead of bcrypt
import { subtle } from 'crypto';

// Use fetch instead of axios
const response = await fetch(url);

// Use lightweight libraries
// @vercel/kv instead of ioredis
// jose instead of jsonwebtoken
```

## Anti-patterns

### Don't Do Heavy Computation

```typescript
// BAD - Heavy processing at the edge
export const runtime = 'edge';

export async function GET() {
  const result = heavyComputation(); // Slow!
  return NextResponse.json(result);
}

// GOOD - Offload to serverless or background job
export const runtime = 'edge';

export async function GET() {
  // Quick edge logic
  const cached = await kv.get('result');
  if (cached) return NextResponse.json(cached);

  // Trigger background computation
  await fetch('/api/compute', { method: 'POST' });
  return NextResponse.json({ status: 'processing' });
}
```

### Don't Access Incompatible APIs

```typescript
// BAD - Using Node.js APIs
export const runtime = 'edge';

import { readFileSync } from 'fs'; // ❌ Will fail

// GOOD - Use Edge-compatible alternatives
export const runtime = 'edge';

// Fetch from KV or external storage
const data = await kv.get('config');
```

## Related Skills

- [middleware](./middleware.md)
- [rate-limiting](./rate-limiting.md)
- [dynamic-rendering](./dynamic-rendering.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Edge route handlers
- A/B testing
- Edge Config
- Rate limiting
- Authentication
- KV caching
