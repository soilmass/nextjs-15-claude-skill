---
id: pt-edge-middleware
name: Edge Middleware
version: 2.0.0
layer: L5
category: edge
description: Run code at the edge before requests reach your application
tags: [edge, middleware, routing, headers, cookies]
composes: []
dependencies: []
formula: middleware.ts + Request Interception + Headers/Cookies = Pre-Request Processing
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

- Implementing authentication checks before page load
- URL rewriting for multi-tenant applications
- Bot detection and blocking
- A/B testing with cookie-based variant assignment
- Request logging and tracing

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Edge Middleware Request Flow                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Incoming Request                                           │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ middleware.ts (Always runs at edge)                 │   │
│  │                                                     │   │
│  │ 1. Read request info                                │   │
│  │    - pathname, headers, cookies, geo                │   │
│  │                                                     │   │
│  │ 2. Process request                                  │   │
│  │    - Auth check (JWT verification)                  │   │
│  │    - Role-based access control                      │   │
│  │    - Bot detection                                  │   │
│  │    - Rate limiting                                  │   │
│  │                                                     │   │
│  │ 3. Return response type                             │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│         ┌──────────────┼──────────────┐                    │
│         ▼              ▼              ▼                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ redirect() │ │ rewrite()  │ │ next()     │             │
│  │            │ │            │ │            │             │
│  │ Send to    │ │ Internal   │ │ Continue   │             │
│  │ new URL    │ │ URL change │ │ to app     │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                             │
│  Config matcher: ["/((?!_next|api|static).*)"]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Edge Middleware

Run code at the edge before requests reach your application for authentication, routing, and request modification.

## Overview

Edge middleware enables:
- Authentication checks
- Request/response modification
- URL rewrites and redirects
- A/B testing
- Bot detection
- Header manipulation

## Implementation

### Basic Middleware Structure

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get request info
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  
  // Modify request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", crypto.randomUUID());
  requestHeaders.set("x-pathname", pathname);
  
  // Create response with modified request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Modify response headers
  response.headers.set("x-middleware-cache", "no-cache");
  
  return response;
}

// Configure which paths middleware runs on
export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
```

### Authentication Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth"];
const AUTH_PATHS = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if path is auth-only (login/register)
  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Get token from cookie
  const token = request.cookies.get("auth_token")?.value;
  
  // Verify token
  let isAuthenticated = false;
  let userId: string | null = null;
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      isAuthenticated = true;
      userId = payload.sub as string;
    } catch {
      // Invalid token
    }
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Redirect unauthenticated users to login
  if (!isPublicPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Add user info to headers for downstream use
  const response = NextResponse.next();
  
  if (userId) {
    response.headers.set("x-user-id", userId);
  }
  
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
```

### Role-Based Access Control

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RouteConfig {
  path: string;
  roles: string[];
}

const PROTECTED_ROUTES: RouteConfig[] = [
  { path: "/admin", roles: ["admin"] },
  { path: "/dashboard", roles: ["user", "admin"] },
  { path: "/billing", roles: ["admin", "billing"] },
  { path: "/settings/team", roles: ["admin", "manager"] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route needs protection
  const routeConfig = PROTECTED_ROUTES.find(
    (route) => pathname.startsWith(route.path)
  );
  
  if (!routeConfig) {
    return NextResponse.next();
  }
  
  // Get user role from token or session
  const userRole = await getUserRole(request);
  
  if (!userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Check if user has required role
  if (!routeConfig.roles.includes(userRole)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  return NextResponse.next();
}

async function getUserRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.role as string;
  } catch {
    return null;
  }
}
```

### URL Rewriting

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  
  // Multi-tenant: Rewrite subdomain to path
  // shop.example.com -> example.com/shops/shop
  if (hostname.includes(".") && !hostname.startsWith("www.")) {
    const subdomain = hostname.split(".")[0];
    
    // Skip for main domain
    if (subdomain !== "example" && subdomain !== "app") {
      const url = request.nextUrl.clone();
      url.pathname = `/shops/${subdomain}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }
  
  // Vanity URLs
  // /p/my-product -> /products/123
  if (pathname.startsWith("/p/")) {
    const slug = pathname.replace("/p/", "");
    const productId = await getProductIdFromSlug(slug);
    
    if (productId) {
      const url = request.nextUrl.clone();
      url.pathname = `/products/${productId}`;
      return NextResponse.rewrite(url);
    }
  }
  
  // A/B testing rewrite
  if (pathname === "/pricing") {
    const variant = request.cookies.get("pricing_variant")?.value;
    
    if (variant === "b") {
      const url = request.nextUrl.clone();
      url.pathname = "/pricing-v2";
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}

async function getProductIdFromSlug(slug: string): Promise<string | null> {
  // In real app, fetch from KV or API
  const slugMap: Record<string, string> = {
    "my-product": "123",
    "another-product": "456",
  };
  return slugMap[slug] || null;
}
```

### Bot Detection

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BOT_USER_AGENTS = [
  "Googlebot",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
];

const BLOCKED_BOTS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  
  // Check for blocked bots
  const isBlockedBot = BLOCKED_BOTS.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  if (isBlockedBot) {
    return new NextResponse(null, { status: 403 });
  }
  
  // Detect search engine bots
  const isSearchBot = BOT_USER_AGENTS.some((bot) =>
    userAgent.includes(bot)
  );
  
  const response = NextResponse.next();
  
  if (isSearchBot) {
    // Skip certain features for bots
    response.headers.set("x-is-bot", "true");
    
    // Serve pre-rendered content
    // Could rewrite to a cached/static version
  }
  
  return response;
}
```

### Request Logging

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  
  // Log to external service (fire and forget)
  const logData = {
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    query: request.nextUrl.search,
    userAgent: request.headers.get("user-agent"),
    ip: request.ip,
    geo: request.geo,
    timestamp: new Date().toISOString(),
  };
  
  // Send to logging service (don't await)
  fetch(process.env.LOG_ENDPOINT!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(logData),
  }).catch(() => {});
  
  // Add timing header
  response.headers.set("x-response-time", `${Date.now() - start}ms`);
  response.headers.set("x-request-id", requestId);
  
  return response;
}
```

### Composing Multiple Middleware

```typescript
// lib/middleware/compose.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type MiddlewareFunction = (
  request: NextRequest,
  response: NextResponse
) => Promise<NextResponse | null> | NextResponse | null;

export function composeMiddleware(...middlewares: MiddlewareFunction[]) {
  return async (request: NextRequest) => {
    let response = NextResponse.next();
    
    for (const middleware of middlewares) {
      const result = await middleware(request, response);
      
      if (result) {
        // If middleware returns a response (redirect, rewrite, etc.)
        // stop the chain
        if (result.status !== 200 || result.headers.get("x-middleware-rewrite")) {
          return result;
        }
        response = result;
      }
    }
    
    return response;
  };
}

// Individual middleware functions
// lib/middleware/auth.ts
export async function authMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse | null> {
  // Auth logic
  return response;
}

// lib/middleware/logging.ts
export function loggingMiddleware(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  response.headers.set("x-request-id", crypto.randomUUID());
  return response;
}

// lib/middleware/geo.ts
export function geoMiddleware(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  response.headers.set("x-geo-country", request.geo?.country || "US");
  return response;
}

// middleware.ts
import { composeMiddleware } from "./lib/middleware/compose";
import { authMiddleware } from "./lib/middleware/auth";
import { loggingMiddleware } from "./lib/middleware/logging";
import { geoMiddleware } from "./lib/middleware/geo";

export const middleware = composeMiddleware(
  loggingMiddleware,
  geoMiddleware,
  authMiddleware
);
```

## Variants

### Conditional Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Different logic for different paths
  if (pathname.startsWith("/api")) {
    return apiMiddleware(request);
  }
  
  if (pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }
  
  if (pathname.startsWith("/app")) {
    return appMiddleware(request);
  }
  
  return NextResponse.next();
}

// Use matcher for performance
export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/app/:path*"],
};
```

### Middleware with KV Cache

```typescript
// middleware.ts
import { kv } from "@vercel/kv";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path is blocked
  const isBlocked = await kv.sismember("blocked_paths", pathname);
  
  if (isBlocked) {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }
  
  // Check rate limit
  const ip = request.ip || "unknown";
  const rateKey = `rate:${ip}`;
  const count = await kv.incr(rateKey);
  
  if (count === 1) {
    await kv.expire(rateKey, 60); // 1 minute window
  }
  
  if (count > 100) {
    return new NextResponse("Rate limited", { status: 429 });
  }
  
  return NextResponse.next();
}
```

## Anti-patterns

### Heavy Computation in Middleware

```typescript
// BAD: CPU-intensive operations
export async function middleware(request: NextRequest) {
  const data = await heavyComputation(); // Slow!
  return NextResponse.next();
}

// GOOD: Keep middleware lightweight
export async function middleware(request: NextRequest) {
  // Only do quick checks
  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
```

### Not Using Matcher

```typescript
// BAD: Checking paths manually
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  // Process...
}

// GOOD: Use matcher config
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## Related Skills

- `auth-middleware` - Authentication in middleware
- `geolocation` - Geo-based routing
- `edge-functions` - Edge function patterns
- `rate-limiting` - Rate limiting patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with common middleware patterns
