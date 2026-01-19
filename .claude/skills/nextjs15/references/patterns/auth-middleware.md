---
id: pt-auth-middleware
name: Authentication Middleware
version: 2.0.0
layer: L5
category: auth
description: Route protection and authentication handling in Next.js middleware
tags: [auth, middleware, sessions, protection, next15]
composes: []
dependencies:
  next-auth: "^5.0.0"
formula: "AuthMiddleware = RouteMatching + SessionVerification + (Redirect | Allow | Deny)"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Authentication Middleware

## When to Use

- For protecting routes at the edge before rendering
- When you need fast authentication checks
- For implementing role-based route protection
- When handling authentication redirects
- For API route protection with Bearer tokens

## Composition Diagram

```
Middleware Flow
===============

Request -> [Middleware] -> Response

+------------------------------------------+
|              middleware.ts                |
|                                          |
|  1. Route Matching                       |
|     +--------------------------------+   |
|     | Public: /, /about, /pricing    |   |
|     | Auth: /login, /register        |   |
|     | Protected: /dashboard/*        |   |
|     | Admin: /admin/*                |   |
|     +--------------------------------+   |
|                                          |
|  2. Session Verification                 |
|     +--------------------------------+   |
|     | token = cookies.get('session') |   |
|     | session = await verify(token)  |   |
|     +--------------------------------+   |
|                                          |
|  3. Access Decision                      |
|     +--------------------------------+   |
|     | Public -> Allow                |   |
|     | Protected + No Session -> /login   |
|     | Admin + No Admin Role -> /403  |   |
|     | Auth + Session -> /dashboard   |   |
|     +--------------------------------+   |
+------------------------------------------+
```

## Overview

Middleware runs before every request, making it ideal for authentication checks, redirects, and request modification. In Next.js 15, use middleware to protect routes, check sessions, and manage auth flows.

## Basic Auth Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/about', '/pricing'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if route is auth-specific (login/register)
  const isAuthRoute = authRoutes.includes(pathname);

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;
  const session = token ? await verifyToken(token) : null;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect non-public routes
  if (!isPublicRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

## With NextAuth.js v5

```typescript
// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isAuthRoute = ['/login', '/register'].includes(nextUrl.pathname);
  const isPublicRoute = ['/', '/about'].includes(nextUrl.pathname);
  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard');

  // API routes handle their own auth
  if (isApiRoute) {
    return;
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', nextUrl));
    }
    return;
  }

  // Protect dashboard routes
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## Role-Based Access Control (RBAC)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, type Session } from '@/lib/auth';

// Define route permissions
const routePermissions: Record<string, string[]> = {
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
  '/dashboard': ['user', 'admin'],
  '/dashboard/billing': ['user', 'admin'],
  '/api/admin': ['admin'],
};

function hasPermission(session: Session | null, pathname: string): boolean {
  // Find matching route permission
  const matchedRoute = Object.keys(routePermissions)
    .sort((a, b) => b.length - a.length) // Longest first
    .find((route) => pathname.startsWith(route));

  if (!matchedRoute) {
    return true; // No permission required
  }

  const requiredRoles = routePermissions[matchedRoute];
  return session?.user?.role && requiredRoles.includes(session.user.role);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('auth-token')?.value;
  const session = token ? await verifyToken(token) : null;

  // Check permissions
  if (!hasPermission(session, pathname)) {
    if (!session) {
      // Not logged in - redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Logged in but no permission - show forbidden
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  // Add user info to headers for downstream use
  const response = NextResponse.next();
  if (session) {
    response.headers.set('x-user-id', session.user.id);
    response.headers.set('x-user-role', session.user.role);
  }

  return response;
}
```

## API Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes
  if (pathname.startsWith('/api')) {
    // Skip auth endpoints
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // Public API routes
    const publicApiRoutes = ['/api/products', '/api/categories'];
    const isPublicApi = publicApiRoutes.some((route) => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (!isPublicApi) {
      // Check for API key or Bearer token
      const apiKey = request.headers.get('x-api-key');
      const authHeader = request.headers.get('authorization');

      if (apiKey) {
        const isValidKey = await validateApiKey(apiKey);
        if (!isValidKey) {
          return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
          );
        }
      } else if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const session = await verifyToken(token);
        if (!session) {
          return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}
```

## Multi-tenant Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];

  // Skip main domain
  if (subdomain === 'www' || subdomain === 'app') {
    return NextResponse.next();
  }

  // Validate tenant
  const tenant = await getTenant(subdomain);
  if (!tenant) {
    return NextResponse.redirect(new URL('https://app.example.com/404', request.url));
  }

  // Verify user belongs to tenant
  const token = request.cookies.get('auth-token')?.value;
  if (token) {
    const session = await verifyToken(token);
    if (session && session.tenantId !== tenant.id) {
      // User doesn't belong to this tenant
      return NextResponse.redirect(
        new URL(`https://${session.tenantSlug}.example.com`, request.url)
      );
    }
  }

  // Add tenant info to headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenant.id);
  response.headers.set('x-tenant-slug', tenant.slug);

  return response;
}
```

## Rate Limiting in Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Use IP for rate limiting
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());

  return response;
}
```

## Session Refresh

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.next();
  }

  const session = await verifyToken(token);
  
  if (!session) {
    // Token expired - try refresh
    const refreshToken = request.cookies.get('refresh-token')?.value;
    
    if (refreshToken) {
      try {
        const newTokens = await refreshSession(refreshToken);
        
        const response = NextResponse.next();
        response.cookies.set('auth-token', newTokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 15, // 15 minutes
        });
        response.cookies.set('refresh-token', newTokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        
        return response;
      } catch {
        // Refresh failed - clear cookies and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        response.cookies.delete('refresh-token');
        return response;
      }
    }
  }

  return NextResponse.next();
}
```

## Anti-patterns

### Don't Do Heavy Work in Middleware

```typescript
// BAD - Database queries in middleware
export async function middleware(request: NextRequest) {
  const user = await prisma.user.findUnique({  // Slow!
    where: { id: getUserId(request) },
    include: { permissions: true },
  });
}

// GOOD - Use lightweight token verification
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const payload = await verifyJWT(token);  // Fast, no DB
  // Role/permissions encoded in JWT
}
```

## Related Skills

- [session-management](./session-management.md)
- [rbac](./rbac.md)
- [api-keys](./api-keys.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- RBAC patterns
- Rate limiting
- Session refresh
