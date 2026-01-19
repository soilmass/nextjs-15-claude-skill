---
id: pt-cache-headers
name: Cache Headers
version: 2.0.0
layer: L5
category: cache
description: HTTP cache control headers for CDN and browser caching
tags: [cache, headers, cdn, http, cache-control]
composes: []
dependencies: []
formula: "Cache-Control + s-maxage + stale-while-revalidate + Vary + ETag = Multi-layer HTTP caching"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Cache Headers

## When to Use

- **Static assets**: Images, fonts, JS/CSS with immutable caching
- **API responses**: Public REST endpoints with appropriate TTLs
- **Marketing pages**: Landing pages cached at CDN edge
- **Product listings**: Category pages with short browser cache, longer CDN cache
- **User-specific content**: Private cache headers for authenticated data
- **SEO pages**: Blog posts, documentation with long edge cache

**Avoid when:**
- Real-time data requiring instant updates
- Sensitive user data (use `private, no-store`)
- Checkout/payment flows
- Admin panels with frequent changes

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|    Browser       |     |    CDN Edge      |     |   Origin Server  |
|    (Client)      |     |    (Vercel)      |     |   (Next.js)      |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  GET /products         |                        |
         +----------------------->|                        |
         |                        |  Cache MISS            |
         |                        +----------------------->|
         |                        |                        |
         |                        |  Response + Headers    |
         |                        |  s-maxage=3600         |
         |                        |  stale-while-revalidate|
         |                        |<-----------------------+
         |                        |                        |
         |  max-age=300           |  Cached at Edge        |
         |<-----------------------+                        |
         |                        |                        |
         |  Cached in Browser     |                        |
         |  (5 min fresh)         |  (1 hour fresh + SWR)  |
         +------------------------+------------------------+
```

## Overview

HTTP cache headers control:
- Browser cache behavior
- CDN/edge cache behavior
- Cache freshness and validation
- Private vs public caching

## Implementation

### Route Handler Cache Headers

```typescript
// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { published: true },
  });
  
  return NextResponse.json(products, {
    headers: {
      // Cache for 1 hour at CDN, 5 minutes in browser
      "Cache-Control": "public, s-maxage=3600, max-age=300",
      // Allow stale content while revalidating
      "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

// Dynamic route with shorter cache
// app/api/products/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });
  
  if (!product) {
    return NextResponse.json(
      { error: "Not found" },
      { 
        status: 404,
        headers: {
          // Don't cache errors for long
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  }
  
  return NextResponse.json(product, {
    headers: {
      // Shorter cache for individual items
      "Cache-Control": "public, s-maxage=300, max-age=60, stale-while-revalidate=3600",
      // ETag for validation
      "ETag": `"${product.id}-${product.updatedAt.getTime()}"`,
    },
  });
}
```

### Page-Level Cache Headers

```typescript
// app/products/page.tsx
import { headers } from "next/headers";

export async function generateMetadata() {
  return {
    title: "Products",
  };
}

// Configure page caching
export const revalidate = 3600; // Revalidate every hour

// Or for dynamic control
export async function generateStaticParams() {
  return [];
}

// Custom headers via next.config.ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/products",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      ],
    },
    {
      source: "/products/:slug",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=300, stale-while-revalidate=3600",
        },
      ],
    },
  ],
};

export default nextConfig;
```

### Middleware Cache Headers

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  // Static assets - long cache
  if (pathname.startsWith("/images/") || pathname.startsWith("/fonts/")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }
  
  // API routes - short cache with SWR
  if (pathname.startsWith("/api/")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
  }
  
  // Marketing pages - medium cache
  if (pathname === "/" || pathname.startsWith("/about") || pathname.startsWith("/pricing")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  }
  
  // Dashboard - no cache
  if (pathname.startsWith("/dashboard")) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
  }
  
  return response;
}
```

### Cache Header Utilities

```typescript
// lib/cache/headers.ts

export type CacheProfile = 
  | "immutable"
  | "static"
  | "dynamic"
  | "private"
  | "no-store";

interface CacheOptions {
  maxAge?: number; // Browser cache in seconds
  sMaxAge?: number; // CDN cache in seconds
  staleWhileRevalidate?: number;
  staleIfError?: number;
  private?: boolean;
  mustRevalidate?: boolean;
  immutable?: boolean;
}

export function createCacheHeaders(options: CacheOptions): Headers {
  const headers = new Headers();
  const directives: string[] = [];
  
  if (options.private) {
    directives.push("private");
  } else {
    directives.push("public");
  }
  
  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`);
  }
  
  if (options.sMaxAge !== undefined) {
    directives.push(`s-maxage=${options.sMaxAge}`);
  }
  
  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }
  
  if (options.staleIfError !== undefined) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }
  
  if (options.mustRevalidate) {
    directives.push("must-revalidate");
  }
  
  if (options.immutable) {
    directives.push("immutable");
  }
  
  headers.set("Cache-Control", directives.join(", "));
  
  return headers;
}

// Preset cache profiles
export const CacheProfiles: Record<CacheProfile, CacheOptions> = {
  immutable: {
    maxAge: 31536000, // 1 year
    immutable: true,
  },
  static: {
    maxAge: 300, // 5 min browser
    sMaxAge: 3600, // 1 hour CDN
    staleWhileRevalidate: 86400, // 1 day SWR
  },
  dynamic: {
    maxAge: 0,
    sMaxAge: 60, // 1 min CDN
    staleWhileRevalidate: 300, // 5 min SWR
    mustRevalidate: true,
  },
  private: {
    private: true,
    maxAge: 0,
    mustRevalidate: true,
  },
  "no-store": {
    private: true,
    maxAge: 0,
  },
};

export function getCacheHeaders(profile: CacheProfile): Headers {
  const headers = createCacheHeaders(CacheProfiles[profile]);
  
  // Add no-store for no-store profile
  if (profile === "no-store") {
    headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }
  
  return headers;
}

// Usage in route handler
import { getCacheHeaders } from "@/lib/cache/headers";

export async function GET() {
  const data = await fetchData();
  
  const headers = getCacheHeaders("static");
  headers.set("Content-Type", "application/json");
  
  return new Response(JSON.stringify(data), { headers });
}
```

### ETag and Conditional Requests

```typescript
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

function generateETag(data: unknown): string {
  const hash = createHash("md5")
    .update(JSON.stringify(data))
    .digest("hex");
  return `"${hash}"`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });
  
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  const etag = generateETag(product);
  const ifNoneMatch = request.headers.get("If-None-Match");
  
  // Check if client has current version
  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  }
  
  return NextResponse.json(product, {
    headers: {
      ETag: etag,
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Last-Modified": product.updatedAt.toUTCString(),
    },
  });
}
```

### Vary Header for Content Negotiation

```typescript
// app/api/content/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const acceptLanguage = request.headers.get("Accept-Language") || "en";
  const userAgent = request.headers.get("User-Agent") || "";
  
  // Determine content based on headers
  const isMobile = /mobile/i.test(userAgent);
  const language = acceptLanguage.split(",")[0].split("-")[0];
  
  const content = await getLocalizedContent(language, isMobile);
  
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "public, s-maxage=3600",
      // Tell CDN to cache different versions based on these headers
      Vary: "Accept-Language, User-Agent",
    },
  });
}
```

### CDN-Specific Headers (Vercel)

```typescript
// app/api/feed/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const feed = await generateFeed();
  
  return NextResponse.json(feed, {
    headers: {
      // Standard Cache-Control
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      
      // Vercel-specific: override s-maxage at edge
      "Vercel-CDN-Cache-Control": "public, s-maxage=7200",
      
      // Vercel-specific: cache tag for purging
      "Cache-Tag": "feed, content",
      
      // Surrogate keys for CDN purging (Fastly, etc.)
      "Surrogate-Key": "feed content homepage",
    },
  });
}

// Purge cache via API
// app/api/purge/route.ts
export async function POST(request: Request) {
  const { tags } = await request.json();
  
  // Vercel API to purge by tag
  await fetch("https://api.vercel.com/v1/cache/purge", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
    },
    body: JSON.stringify({
      projectId: process.env.VERCEL_PROJECT_ID,
      tags,
    }),
  });
  
  return NextResponse.json({ purged: tags });
}
```

## Variants

### Conditional Caching Based on Auth

```typescript
// app/api/data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const data = await getData(session?.userId);
  
  if (session) {
    // Authenticated: private cache
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, max-age=60",
        Vary: "Cookie, Authorization",
      },
    });
  }
  
  // Public: shared cache
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
```

### Cache Headers with Compression

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // For API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Vary by Accept-Encoding so CDN caches compressed versions
    response.headers.append("Vary", "Accept-Encoding");
    
    // Indicate compression is available
    response.headers.set("Content-Encoding", "gzip");
  }
  
  return response;
}
```

## Anti-patterns

### Caching Authenticated Content Publicly

```typescript
// BAD: User-specific data cached publicly
export async function GET() {
  const session = await getSession();
  const userData = await getUserData(session.userId);
  
  return NextResponse.json(userData, {
    headers: {
      // This is user-specific data!
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}

// GOOD: Private cache for user data
export async function GET() {
  const session = await getSession();
  const userData = await getUserData(session.userId);
  
  return NextResponse.json(userData, {
    headers: {
      "Cache-Control": "private, max-age=60",
      Vary: "Cookie",
    },
  });
}
```

### Forgetting Vary Headers

```typescript
// BAD: Different content but same cache key
export async function GET(request: NextRequest) {
  const isMobile = request.headers.get("User-Agent")?.includes("Mobile");
  const content = isMobile ? getMobileContent() : getDesktopContent();
  
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "public, s-maxage=3600",
      // Missing Vary header! Mobile/desktop users will get wrong content
    },
  });
}

// GOOD: Vary header for content negotiation
export async function GET(request: NextRequest) {
  const isMobile = request.headers.get("User-Agent")?.includes("Mobile");
  const content = isMobile ? getMobileContent() : getDesktopContent();
  
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "public, s-maxage=3600",
      Vary: "User-Agent", // Cache different versions
    },
  });
}
```

### Overly Aggressive Caching

```typescript
// BAD: Caching real-time data
export async function GET() {
  const stockPrices = await getStockPrices();
  
  return NextResponse.json(stockPrices, {
    headers: {
      // Stock prices change frequently!
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}

// GOOD: Short cache for real-time data
export async function GET() {
  const stockPrices = await getStockPrices();
  
  return NextResponse.json(stockPrices, {
    headers: {
      "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
    },
  });
}
```

## Related Skills

- `route-handlers` - API route implementation
- `edge-rendering` - Edge runtime caching
- `static-rendering` - Static generation caching
- `revalidation` - Cache invalidation

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with HTTP cache header patterns
