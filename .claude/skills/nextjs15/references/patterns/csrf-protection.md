---
id: pt-csrf-protection
name: CSRF Protection
version: 2.0.0
layer: L5
category: security
description: Cross-Site Request Forgery protection for forms and API routes
tags: [security, csrf, forms, tokens, protection]
composes: []
dependencies: []
formula: Server Actions (auto) + Token Validation + SameSite Cookies = CSRF Protection
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

- Protecting form submissions from cross-site attacks
- Securing API routes that perform state changes
- Implementing double-submit cookie patterns
- Validating request origin headers
- Creating CSRF tokens for traditional forms

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ CSRF Protection Strategies                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Strategy 1: Server Actions (Built-in)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Next.js automatically validates:                    │   │
│  │ - Origin header matches application                 │   │
│  │ - Request method is POST                            │   │
│  │ - Content-Type is valid                             │   │
│  │                                                     │   │
│  │ "use server"                                        │   │
│  │ export async function updateProfile(formData) {...} │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Strategy 2: Double Submit Cookie                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Set CSRF token in cookie (httpOnly: false)       │   │
│  │ 2. Client sends token in header: X-CSRF-Token       │   │
│  │ 3. Server compares cookie token with header token   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Strategy 3: SameSite Cookie (Simplest)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Set-Cookie: session=xxx; SameSite=Strict; HttpOnly  │   │
│  │ // Cookie not sent on cross-site requests           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# CSRF Protection

Protect your Next.js application from Cross-Site Request Forgery attacks using tokens and same-site cookie policies.

## Overview

CSRF protection ensures that:
- Form submissions originate from your application
- State-changing requests are intentional
- Attackers can't trick users into malicious actions

## Implementation

### Server Actions CSRF (Built-in)

```typescript
// Server Actions have built-in CSRF protection via origin checking
// app/actions/users.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// This action is automatically protected by Next.js
// Origin header is validated against allowed origins
export async function updateProfile(formData: FormData) {
  // Server Actions verify:
  // 1. Origin header matches the application
  // 2. Request method is POST
  // 3. Content-Type is valid
  
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  
  await prisma.user.update({
    where: { id: getCurrentUserId() },
    data: { name, bio },
  });
  
  revalidatePath("/profile");
}

// Usage in form - no manual CSRF token needed
// app/profile/page.tsx
import { updateProfile } from "@/app/actions/users";

export default function ProfilePage() {
  return (
    <form action={updateProfile}>
      <input name="name" placeholder="Name" />
      <textarea name="bio" placeholder="Bio" />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Manual CSRF Tokens for API Routes

```typescript
// lib/csrf.ts
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";

const CSRF_TOKEN_COOKIE = "csrf_token";
const CSRF_SECRET = process.env.CSRF_SECRET!;

// Generate CSRF token
export function generateCsrfToken(): string {
  const token = randomBytes(32).toString("hex");
  return token;
}

// Create signed token
export function signToken(token: string): string {
  const signature = createHash("sha256")
    .update(`${token}${CSRF_SECRET}`)
    .digest("hex");
  return `${token}.${signature}`;
}

// Verify signed token
export function verifyToken(signedToken: string): boolean {
  const [token, signature] = signedToken.split(".");
  if (!token || !signature) return false;
  
  const expectedSignature = createHash("sha256")
    .update(`${token}${CSRF_SECRET}`)
    .digest("hex");
  
  return signature === expectedSignature;
}

// Set CSRF cookie
export async function setCsrfCookie(): Promise<string> {
  const cookieStore = await cookies();
  const token = generateCsrfToken();
  const signedToken = signToken(token);
  
  cookieStore.set(CSRF_TOKEN_COOKIE, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  
  return token;
}

// Get and verify CSRF token
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const signedToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  
  if (!signedToken || !verifyToken(signedToken)) {
    return null;
  }
  
  return signedToken.split(".")[0];
}
```

### API Route with CSRF Validation

```typescript
// app/api/account/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCsrfToken, setCsrfCookie } from "@/lib/csrf";

// GET: Provide CSRF token
export async function GET() {
  const token = await setCsrfCookie();
  
  return NextResponse.json({ csrfToken: token });
}

// POST: Validate CSRF token
export async function POST(request: NextRequest) {
  const body = await request.json();
  const providedToken = body._csrf || request.headers.get("X-CSRF-Token");
  const storedToken = await getCsrfToken();
  
  if (!storedToken || providedToken !== storedToken) {
    return NextResponse.json(
      { error: "Invalid CSRF token" },
      { status: 403 }
    );
  }
  
  // Process the request
  // ...
  
  return NextResponse.json({ success: true });
}
```

### React Hook for CSRF Tokens

```typescript
// hooks/use-csrf.ts
"use client";

import { useEffect, useState } from "react";

export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/csrf");
        const data = await res.json();
        setToken(data.csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchToken();
  }, []);
  
  return { token, loading };
}

// Usage in component
// components/account-form.tsx
"use client";

import { useCsrfToken } from "@/hooks/use-csrf";

export function AccountForm() {
  const { token, loading } = useCsrfToken();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await fetch("/api/account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token || "",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        _csrf: token,
      }),
    });
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={token || ""} />
      <input name="name" placeholder="Name" />
      <button type="submit">Update</button>
    </form>
  );
}
```

### Double Submit Cookie Pattern

```typescript
// lib/csrf/double-submit.ts
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const CSRF_COOKIE = "csrf_double";

// Generate and set double-submit cookie
export async function setDoubleCsrfCookie(): Promise<string> {
  const cookieStore = await cookies();
  const token = randomBytes(32).toString("hex");
  
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false, // Must be readable by JS
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  
  return token;
}

// Validate double submit
export async function validateDoubleSubmit(headerToken: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  
  if (!cookieToken || !headerToken) return false;
  
  // Constant-time comparison
  if (cookieToken.length !== headerToken.length) return false;
  
  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  
  return result === 0;
}

// Client-side helper
// lib/csrf/client.ts
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  
  const match = document.cookie.match(/csrf_double=([^;]+)/);
  return match ? match[1] : null;
}
```

### Middleware CSRF Validation

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const CSRF_HEADER = "X-CSRF-Token";
const CSRF_COOKIE = "csrf_token";

export async function middleware(request: NextRequest) {
  const { method, nextUrl } = request;
  
  // Skip CSRF for API routes that handle their own validation
  if (nextUrl.pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }
  
  // Validate CSRF for state-changing methods
  if (PROTECTED_METHODS.includes(method)) {
    const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
    const headerToken = request.headers.get(CSRF_HEADER);
    
    // For Server Actions, Next.js handles validation
    const isServerAction = request.headers.get("Next-Action") !== null;
    
    if (!isServerAction && nextUrl.pathname.startsWith("/api/")) {
      if (!cookieToken || cookieToken !== headerToken) {
        return NextResponse.json(
          { error: "CSRF validation failed" },
          { status: 403 }
        );
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
```

## Variants

### SameSite Cookie Strategy (Simpler)

```typescript
// next.config.ts - Configure strict cookies
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Set-Cookie",
            // Enforce SameSite=Strict for all cookies
            value: "Path=/; HttpOnly; Secure; SameSite=Strict",
          },
        ],
      },
    ];
  },
};

// lib/auth.ts - Session cookies with SameSite
export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Prevents CSRF by not sending cookie cross-site
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}
```

### Origin Validation

```typescript
// lib/csrf/origin.ts
import { headers } from "next/headers";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  "https://yourdomain.com",
];

export async function validateOrigin(): Promise<boolean> {
  const headersList = await headers();
  const origin = headersList.get("origin");
  const referer = headersList.get("referer");
  
  // Must have origin or referer
  if (!origin && !referer) return false;
  
  const sourceOrigin = origin || new URL(referer!).origin;
  
  return ALLOWED_ORIGINS.some(allowed => 
    sourceOrigin === allowed || 
    sourceOrigin.endsWith(`.${new URL(allowed!).hostname}`)
  );
}

// Usage in API route
export async function POST(request: NextRequest) {
  if (!await validateOrigin()) {
    return NextResponse.json(
      { error: "Invalid origin" },
      { status: 403 }
    );
  }
  
  // Process request...
}
```

## Anti-patterns

### Disabling CSRF for Convenience

```typescript
// BAD: Skipping CSRF validation
export async function POST(request: NextRequest) {
  // Don't do this!
  // const token = request.headers.get("X-CSRF-Token");
  // if (!token) { /* skip validation */ }
  
  const data = await request.json();
  await processData(data);
}

// GOOD: Always validate CSRF for state-changing operations
export async function POST(request: NextRequest) {
  const token = request.headers.get("X-CSRF-Token");
  const cookieToken = request.cookies.get("csrf")?.value;
  
  if (!token || token !== cookieToken) {
    return NextResponse.json({ error: "Invalid CSRF" }, { status: 403 });
  }
  
  const data = await request.json();
  await processData(data);
}
```

### Predictable Tokens

```typescript
// BAD: Predictable token generation
export function generateToken() {
  return Date.now().toString(); // Easily guessable!
}

// GOOD: Cryptographically random tokens
import { randomBytes } from "crypto";

export function generateToken() {
  return randomBytes(32).toString("hex");
}
```

### Token in URL

```typescript
// BAD: CSRF token in URL (can leak via referer)
<a href={`/api/action?csrf=${token}`}>Do Action</a>

// GOOD: Token in header or body
fetch("/api/action", {
  method: "POST",
  headers: { "X-CSRF-Token": token },
});
```

## Related Skills

- `server-actions` - Built-in CSRF protection
- `security-headers` - HTTP security headers
- `session-management` - Secure session handling
- `rate-limiting` - Prevent token brute-forcing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with multiple CSRF strategies
