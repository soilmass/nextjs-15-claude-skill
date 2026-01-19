---
id: pt-edge-cache
name: Edge Cache Pattern
version: 2.0.0
layer: L5
category: edge
description: Edge caching strategies for Next.js 15 applications leveraging CDN caching and cache-control headers
tags: [cache, edge, cdn, vercel, performance]
composes: []
dependencies: []
formula: Cache-Control Headers + CDN + Edge KV + Tag Invalidation = Global Edge Caching
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

- Caching API responses at the edge for global low-latency
- Implementing stale-while-revalidate for seamless updates
- Setting up geographic-based cache segmentation
- Configuring surrogate keys for targeted cache invalidation
- Building ISR pages with edge caching

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Edge Cache Architecture                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Request                                               │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CDN Edge Location (closest to user)                 │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Cache Lookup                                    │ │   │
│  │ │ - Check Cache-Control headers                   │ │   │
│  │ │ - Check Vary header for segmentation            │ │   │
│  │ │ - Check surrogate keys/cache tags               │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                    │                                 │   │
│  │         ┌──────────┴──────────┐                     │   │
│  │         ▼                     ▼                     │   │
│  │  ┌────────────┐      ┌─────────────────┐           │   │
│  │  │ Cache HIT  │      │ Cache MISS      │           │   │
│  │  │ Return     │      │ ┌─────────────┐ │           │   │
│  │  │ Instantly  │      │ │ Origin/Edge │ │           │   │
│  │  └────────────┘      │ │ Function    │ │           │   │
│  │                      │ └──────┬──────┘ │           │   │
│  │                      │        ▼        │           │   │
│  │                      │ Store in Cache  │           │   │
│  │                      └─────────────────┘           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Edge Cache Pattern

## Overview

Edge caching strategies for Next.js 15 applications leveraging CDN caching, Vercel Edge Network, and cache-control headers for optimal global performance.

## Implementation

### Cache-Control Headers in Route Handlers

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const products = await prisma.product.findMany({
    where: { published: true },
    take: 50,
  });

  return NextResponse.json(products, {
    headers: {
      // Cache at edge for 1 hour, allow stale for 24 hours while revalidating
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      // Vary by authorization to prevent leaking user-specific data
      'Vary': 'Authorization',
      // CDN cache tags for invalidation
      'Cache-Tag': 'products',
    },
  });
}
```

### Edge Runtime with Caching

```typescript
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Fetch from origin or upstream cache
  const response = await fetch(`${process.env.API_URL}/products/${id}`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
    next: {
      revalidate: 3600, // Cache in Next.js data cache
      tags: [`product-${id}`],
    },
  });

  const product = await response.json();

  return NextResponse.json(product, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=3600',
      'Vercel-CDN-Cache-Control': 'public, max-age=3600',
    },
  });
}
```

### Conditional Caching Based on User State

```typescript
// app/api/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (session) {
    // Personalized content - don't cache at edge
    const personalizedFeed = await getPersonalizedFeed(session.userId);
    
    return NextResponse.json(personalizedFeed, {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
  }

  // Anonymous content - cache aggressively at edge
  const publicFeed = await getPublicFeed();
  
  return NextResponse.json(publicFeed, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

### Edge Middleware for Cache Headers

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Static assets - long cache
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    return response;
  }

  // API routes - moderate cache with revalidation
  if (request.nextUrl.pathname.startsWith('/api/public')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );
    return response;
  }

  // HTML pages - short cache for dynamic content
  if (request.headers.get('accept')?.includes('text/html')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Vercel Edge Config for Dynamic Configuration

```typescript
// lib/edge-config.ts
import { get } from '@vercel/edge-config';

export async function getFeatureFlags() {
  const flags = await get<Record<string, boolean>>('featureFlags');
  return flags ?? {};
}

export async function getMaintenanceMode() {
  const maintenance = await get<{
    enabled: boolean;
    message: string;
    allowedIps: string[];
  }>('maintenance');
  
  return maintenance ?? { enabled: false, message: '', allowedIps: [] };
}

// Usage in middleware
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceMode } from '@/lib/edge-config';

export async function middleware(request: NextRequest) {
  const maintenance = await getMaintenanceMode();
  
  if (maintenance.enabled) {
    const clientIp = request.ip ?? request.headers.get('x-forwarded-for');
    
    if (!maintenance.allowedIps.includes(clientIp ?? '')) {
      return NextResponse.rewrite(new URL('/maintenance', request.url));
    }
  }

  return NextResponse.next();
}
```

### Surrogate Keys for CDN Invalidation

```typescript
// lib/cache/surrogate-keys.ts
import { headers } from 'next/headers';

export function setSurrogateKeys(keys: string[]): void {
  const headersList = headers();
  // Fastly-style surrogate keys
  headersList.set('Surrogate-Key', keys.join(' '));
  // Cloudflare cache tags
  headersList.set('Cache-Tag', keys.join(','));
}

export async function invalidateSurrogateKey(key: string): Promise<void> {
  // Fastly
  if (process.env.FASTLY_API_TOKEN) {
    await fetch(
      `https://api.fastly.com/service/${process.env.FASTLY_SERVICE_ID}/purge/${key}`,
      {
        method: 'POST',
        headers: {
          'Fastly-Key': process.env.FASTLY_API_TOKEN,
        },
      }
    );
  }

  // Cloudflare
  if (process.env.CLOUDFLARE_API_TOKEN) {
    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: [key] }),
      }
    );
  }
}
```

### Page-Level Edge Caching

```typescript
// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';
export const revalidate = 3600; // ISR - revalidate every hour

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
    where: { published: true },
    take: 100,
  });

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}

// Generate metadata with caching hints
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  return {
    title: product?.name,
    description: product?.description,
    other: {
      'Cache-Control': 'public, s-maxage=3600',
    },
  };
}
```

### Edge KV Store for Caching

```typescript
// lib/edge-kv.ts
import { kv } from '@vercel/kv';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

export async function edgeCacheGet<T>(key: string): Promise<T | null> {
  const entry = await kv.get<CacheEntry<T>>(key);
  
  if (!entry) return null;
  
  const age = Date.now() - entry.timestamp;
  if (age > entry.ttl * 1000) {
    // Expired - delete and return null
    await kv.del(key);
    return null;
  }

  return entry.data;
}

export async function edgeCacheSet<T>(
  key: string,
  data: T,
  ttl: number = 3600
): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl,
  };

  await kv.set(key, entry, { ex: ttl });
}

// Usage in edge function
export async function GET(request: NextRequest) {
  const cacheKey = `products:featured`;
  
  // Try edge KV first
  const cached = await edgeCacheGet<Product[]>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  // Fetch from origin
  const products = await fetchFeaturedProducts();
  
  // Store in edge KV
  await edgeCacheSet(cacheKey, products, 300);

  return NextResponse.json(products, {
    headers: { 'X-Cache': 'MISS' },
  });
}
```

### Geographic-Based Caching

```typescript
// app/api/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { geolocation } from '@vercel/functions';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const geo = geolocation(request);
  const country = geo.country ?? 'US';
  const region = geo.region ?? 'default';

  // Cache key includes geo for localized content
  const cacheKey = `content:${country}:${region}`;
  
  const content = await getLocalizedContent(country, region);

  return NextResponse.json(content, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600',
      // Vary by country for proper cache segmentation
      'Vary': 'X-Vercel-IP-Country',
      'X-Cache-Key': cacheKey,
    },
  });
}
```

## Variants

### With Cloudflare Workers KV

```typescript
// For Cloudflare deployment
export async function GET(request: Request) {
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);
  
  // Check cache
  let response = await cache.match(cacheKey);
  
  if (response) {
    return response;
  }

  // Fetch and cache
  const data = await fetchData();
  response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600',
    },
  });

  // Store in cache (non-blocking)
  request.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}
```

### With Cache Tags (Vercel)

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

const getCachedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany();
  },
  ['products'],
  {
    tags: ['products'],
    revalidate: 3600,
  }
);

export async function GET() {
  const products = await getCachedProducts();
  
  return NextResponse.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

## Anti-patterns

```typescript
// BAD: Caching personalized content at edge
return NextResponse.json(userSpecificData, {
  headers: { 'Cache-Control': 'public, s-maxage=3600' },
});

// GOOD: Private cache for user data
return NextResponse.json(userSpecificData, {
  headers: { 'Cache-Control': 'private, no-store' },
});

// BAD: No Vary header with conditional content
if (request.headers.get('Authorization')) {
  return NextResponse.json(privateData);
}
return NextResponse.json(publicData);

// GOOD: Vary header for cache segmentation
return NextResponse.json(data, {
  headers: {
    'Vary': 'Authorization',
    'Cache-Control': session ? 'private, no-store' : 'public, s-maxage=3600',
  },
});

// BAD: Extremely long cache without invalidation strategy
'Cache-Control': 'public, max-age=31536000' // 1 year with no way to invalidate

// GOOD: Moderate cache with stale-while-revalidate
'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
```

## Related Patterns

- `cache-headers.md` - HTTP cache header strategies
- `redis-cache.md` - Server-side caching
- `cdn.md` - CDN configuration
- `geolocation.md` - Geographic-based routing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2024-01-15)
- Initial edge cache pattern with Vercel Edge Network
