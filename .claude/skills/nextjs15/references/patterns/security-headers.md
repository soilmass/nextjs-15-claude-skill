---
id: pt-security-headers
name: Security Headers
version: 2.0.0
layer: L5
category: security
description: Configure HTTP security headers for comprehensive application protection
tags: [security, headers, http, protection, hardening]
composes: []
dependencies: []
formula: next.config.ts Headers + Middleware + CSP = Comprehensive Protection
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

- Implementing XSS protection with X-XSS-Protection
- Preventing clickjacking with X-Frame-Options
- Enforcing HTTPS with Strict-Transport-Security
- Configuring CORS for API routes
- Setting up Permissions-Policy for feature control

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Security Headers Configuration                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ next.config.ts (Static Headers)                     │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ X-Frame-Options: DENY                           │ │   │
│  │ │ X-Content-Type-Options: nosniff                 │ │   │
│  │ │ Referrer-Policy: strict-origin-when-cross-origin│ │   │
│  │ │ Strict-Transport-Security: max-age=31536000     │ │   │
│  │ │ Permissions-Policy: camera=(), microphone=()    │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ middleware.ts (Dynamic Headers)                     │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Content-Security-Policy: (with nonce)           │ │   │
│  │ │ Cross-Origin-* headers                          │ │   │
│  │ │ Dynamic CORS based on origin                    │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Route-Specific Overrides:                                  │
│  - /api/*     : CORS headers, relaxed frame options        │
│  - /admin/*   : Extra strict, noindex                      │
│  - /embed/*   : Allow framing from trusted domains         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Security Headers

Implement comprehensive HTTP security headers to protect your Next.js application from common web vulnerabilities.

## Overview

Security headers provide:
- XSS protection
- Clickjacking prevention
- MIME type sniffing prevention
- HTTPS enforcement
- Referrer policy control
- Permissions policy

## Implementation

### Complete Security Headers Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent XSS attacks
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Control referrer information
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Control browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Enforce HTTPS
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Prevent DNS prefetching
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // Download options for IE
  {
    key: "X-Download-Options",
    value: "noopen",
  },
  // Prevent Adobe cross-domain requests
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
];

const nextConfig: NextConfig = {
  headers: async () => [
    {
      // Apply to all routes
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;
```

### Middleware-Based Security Headers

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers configuration
const securityHeaders: Record<string, string> = {
  // XSS Protection
  "X-XSS-Protection": "1; mode=block",
  
  // Clickjacking Protection
  "X-Frame-Options": "DENY",
  
  // MIME Sniffing Protection
  "X-Content-Type-Options": "nosniff",
  
  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  
  // Permissions Policy
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
    "payment=(self)",
    "usb=()",
    "bluetooth=()",
  ].join(", "),
  
  // HSTS
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  
  // DNS Prefetch Control
  "X-DNS-Prefetch-Control": "on",
  
  // Cross-Origin Policies
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Resource-Policy": "same-origin",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Apply security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  
  // Add CSP (can be dynamic with nonce)
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  response.headers.set("x-nonce", nonce);
  response.headers.set(
    "Content-Security-Policy",
    buildCSP(nonce)
  );
  
  return response;
}

function buildCSP(nonce: string): string {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data: https:;
    font-src 'self';
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### Route-Specific Headers

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    // Global headers
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
      ],
    },
    
    // API routes - more permissive CORS
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: process.env.ALLOWED_ORIGIN || "*" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      ],
    },
    
    // Static assets - long cache, immutable
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    
    // Images - allow embedding
    {
      source: "/images/:path*",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
      ],
    },
    
    // Admin routes - extra strict
    {
      source: "/admin/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; frame-ancestors 'none';",
        },
      ],
    },
    
    // Embed-friendly pages
    {
      source: "/embed/:path*",
      headers: [
        { key: "X-Frame-Options", value: "ALLOWALL" },
        {
          key: "Content-Security-Policy",
          value: "frame-ancestors https://trusted-site.com https://another-trusted.com;",
        },
      ],
    },
  ],
};

export default nextConfig;
```

### Security Headers Utility

```typescript
// lib/security/headers.ts

export interface SecurityHeadersConfig {
  // Enable/disable specific features
  hsts?: boolean | { maxAge?: number; includeSubDomains?: boolean; preload?: boolean };
  frameOptions?: "DENY" | "SAMEORIGIN" | false;
  contentTypeOptions?: boolean;
  xssProtection?: boolean;
  referrerPolicy?: 
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  permissionsPolicy?: Record<string, string[]>;
  crossOriginOpenerPolicy?: "same-origin" | "same-origin-allow-popups" | "unsafe-none";
  crossOriginEmbedderPolicy?: "require-corp" | "credentialless" | "unsafe-none";
  crossOriginResourcePolicy?: "same-origin" | "same-site" | "cross-origin";
}

const defaultConfig: SecurityHeadersConfig = {
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameOptions: "DENY",
  contentTypeOptions: true,
  xssProtection: true,
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    "interest-cohort": [],
  },
  crossOriginOpenerPolicy: "same-origin",
  crossOriginEmbedderPolicy: "require-corp",
  crossOriginResourcePolicy: "same-origin",
};

export function buildSecurityHeaders(
  config: SecurityHeadersConfig = {}
): Record<string, string> {
  const mergedConfig = { ...defaultConfig, ...config };
  const headers: Record<string, string> = {};
  
  // HSTS
  if (mergedConfig.hsts) {
    const hsts = typeof mergedConfig.hsts === "object" 
      ? mergedConfig.hsts 
      : { maxAge: 31536000 };
    
    let value = `max-age=${hsts.maxAge || 31536000}`;
    if (hsts.includeSubDomains) value += "; includeSubDomains";
    if (hsts.preload) value += "; preload";
    
    headers["Strict-Transport-Security"] = value;
  }
  
  // X-Frame-Options
  if (mergedConfig.frameOptions) {
    headers["X-Frame-Options"] = mergedConfig.frameOptions;
  }
  
  // X-Content-Type-Options
  if (mergedConfig.contentTypeOptions) {
    headers["X-Content-Type-Options"] = "nosniff";
  }
  
  // X-XSS-Protection
  if (mergedConfig.xssProtection) {
    headers["X-XSS-Protection"] = "1; mode=block";
  }
  
  // Referrer-Policy
  if (mergedConfig.referrerPolicy) {
    headers["Referrer-Policy"] = mergedConfig.referrerPolicy;
  }
  
  // Permissions-Policy
  if (mergedConfig.permissionsPolicy) {
    const directives = Object.entries(mergedConfig.permissionsPolicy)
      .map(([feature, allowlist]) => {
        if (allowlist.length === 0) {
          return `${feature}=()`;
        }
        return `${feature}=(${allowlist.join(" ")})`;
      });
    
    headers["Permissions-Policy"] = directives.join(", ");
  }
  
  // Cross-Origin headers
  if (mergedConfig.crossOriginOpenerPolicy) {
    headers["Cross-Origin-Opener-Policy"] = mergedConfig.crossOriginOpenerPolicy;
  }
  
  if (mergedConfig.crossOriginEmbedderPolicy) {
    headers["Cross-Origin-Embedder-Policy"] = mergedConfig.crossOriginEmbedderPolicy;
  }
  
  if (mergedConfig.crossOriginResourcePolicy) {
    headers["Cross-Origin-Resource-Policy"] = mergedConfig.crossOriginResourcePolicy;
  }
  
  return headers;
}

// Apply headers to response
export function applySecurityHeaders(
  response: Response,
  config?: SecurityHeadersConfig
): void {
  const headers = buildSecurityHeaders(config);
  
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
}
```

### CORS Configuration

```typescript
// lib/security/cors.ts
import { NextRequest, NextResponse } from "next/server";

interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultCORSConfig: CORSConfig = {
  allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function handleCORS(
  request: NextRequest,
  config: Partial<CORSConfig> = {}
): NextResponse | null {
  const mergedConfig = { ...defaultCORSConfig, ...config };
  const origin = request.headers.get("origin");
  
  // Check if origin is allowed
  const isAllowed = origin && (
    mergedConfig.allowedOrigins.includes("*") ||
    mergedConfig.allowedOrigins.includes(origin) ||
    mergedConfig.allowedOrigins.some(allowed => 
      allowed.endsWith("*") && origin.startsWith(allowed.slice(0, -1))
    )
  );
  
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    
    if (isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
    }
    
    response.headers.set(
      "Access-Control-Allow-Methods",
      mergedConfig.allowedMethods.join(", ")
    );
    
    response.headers.set(
      "Access-Control-Allow-Headers",
      mergedConfig.allowedHeaders.join(", ")
    );
    
    if (mergedConfig.credentials) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    
    if (mergedConfig.maxAge) {
      response.headers.set("Access-Control-Max-Age", mergedConfig.maxAge.toString());
    }
    
    return response;
  }
  
  // Return null to continue with the request
  // Headers will be added in the route handler
  return null;
}

// Add CORS headers to response
export function addCORSHeaders(
  response: NextResponse,
  request: NextRequest,
  config: Partial<CORSConfig> = {}
): NextResponse {
  const mergedConfig = { ...defaultCORSConfig, ...config };
  const origin = request.headers.get("origin");
  
  const isAllowed = origin && (
    mergedConfig.allowedOrigins.includes("*") ||
    mergedConfig.allowedOrigins.includes(origin)
  );
  
  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
  }
  
  if (mergedConfig.credentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  
  if (mergedConfig.exposedHeaders?.length) {
    response.headers.set(
      "Access-Control-Expose-Headers",
      mergedConfig.exposedHeaders.join(", ")
    );
  }
  
  return response;
}
```

## Variants

### Development vs Production Headers

```typescript
// lib/security/env-headers.ts

const isDev = process.env.NODE_ENV === "development";

export function getSecurityHeaders(): Record<string, string> {
  if (isDev) {
    // Relaxed headers for development
    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN", // Allow frames in dev tools
    };
  }
  
  // Strict headers for production
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}
```

### Headers for Embedding Content

```typescript
// When you need to allow your content to be embedded

// next.config.ts
const nextConfig: NextConfig = {
  headers: async () => [
    {
      // Widget that can be embedded
      source: "/widget/:path*",
      headers: [
        // Allow specific sites to embed
        {
          key: "Content-Security-Policy",
          value: "frame-ancestors https://trusted-partner.com https://another-partner.com;",
        },
        // Remove X-Frame-Options (CSP frame-ancestors takes precedence)
        {
          key: "X-Frame-Options",
          value: "", // Empty to remove default
        },
        // Allow cross-origin access
        {
          key: "Cross-Origin-Resource-Policy",
          value: "cross-origin",
        },
      ],
    },
  ],
};
```

## Anti-patterns

### Missing HTTPS Enforcement

```typescript
// BAD: No HSTS header
const headers = {
  "X-Frame-Options": "DENY",
  // Missing Strict-Transport-Security
};

// GOOD: Always include HSTS in production
const headers = {
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};
```

### Overly Permissive CORS

```typescript
// BAD: Allow all origins with credentials
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true", // Doesn't work with *
};

// GOOD: Specific origins or no credentials
const headers = {
  "Access-Control-Allow-Origin": "https://specific-origin.com",
  "Access-Control-Allow-Credentials": "true",
};
```

### Inconsistent Frame Protection

```typescript
// BAD: X-Frame-Options and CSP conflict
const headers = {
  "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "frame-ancestors 'none';", // Conflicts!
};

// GOOD: Consistent policy (CSP takes precedence)
const headers = {
  "Content-Security-Policy": "frame-ancestors 'self';",
  // X-Frame-Options for legacy browsers
  "X-Frame-Options": "SAMEORIGIN",
};
```

## Related Skills

- `content-security-policy` - CSP configuration
- `csrf-protection` - CSRF token handling
- `middleware` - Middleware patterns
- `rate-limiting` - Request rate limiting

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with comprehensive security headers
