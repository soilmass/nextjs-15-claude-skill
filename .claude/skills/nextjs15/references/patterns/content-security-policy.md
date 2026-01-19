---
id: pt-content-security-policy
name: Content Security Policy
version: 2.0.0
layer: L5
category: security
description: Configure Content Security Policy headers for XSS and injection protection
tags: [security, csp, headers, xss, protection]
composes: []
dependencies: []
formula: Nonces + Directives + Third-Party Config + Reporting = Robust CSP
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

- Preventing XSS attacks via script injection
- Controlling which sources can load resources
- Restricting frame embedding (clickjacking protection)
- Setting up violation reporting for monitoring
- Integrating third-party scripts securely

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Content Security Policy Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Middleware: Generate Nonce                          │   │
│  │ const nonce = crypto.randomUUID().toString('base64')│   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CSP Header Construction                             │   │
│  │                                                     │   │
│  │ default-src 'self';                                 │   │
│  │ script-src 'self' 'nonce-xxx' 'strict-dynamic';    │   │
│  │ style-src 'self' 'nonce-xxx';                      │   │
│  │ img-src 'self' blob: data: https:;                 │   │
│  │ connect-src 'self' https://api.example.com;        │   │
│  │ frame-ancestors 'none';                             │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│         ┌──────────────┼──────────────┐                    │
│         ▼              ▼              ▼                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ Layout     │ │ Third-Party│ │ Reporting  │             │
│  │ Use nonce  │ │ Scripts    │ │ Violations │             │
│  │ in <script>│ │ GA, Stripe │ │ /api/csp   │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Content Security Policy

Implement Content Security Policy (CSP) headers to prevent XSS, clickjacking, and other injection attacks.

## Overview

CSP provides:
- Script execution control
- Style injection prevention
- Frame embedding restrictions
- Resource loading policies
- Violation reporting

## Implementation

### Basic CSP Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

// Generate nonce for inline scripts (used with middleware)
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
        },
      ],
    },
  ],
};

export default nextConfig;
```

### Strict CSP with Nonces

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  
  // Strict CSP with nonce
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data: https:;
    font-src 'self';
    connect-src 'self' https://api.example.com wss://ws.example.com;
    frame-src 'self' https://www.youtube.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `;
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  response.headers.set(
    "Content-Security-Policy",
    cspHeader.replace(/\s{2,}/g, " ").trim()
  );
  
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
```

### Using Nonce in Components

```typescript
// app/layout.tsx
import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";
  
  return (
    <html lang="en">
      <head>
        {/* Inline styles with nonce */}
        <style nonce={nonce}>{`
          body { margin: 0; padding: 0; }
        `}</style>
      </head>
      <body>
        {children}
        
        {/* Inline scripts with nonce */}
        <script nonce={nonce}>
          {`console.log('Inline script with nonce');`}
        </script>
      </body>
    </html>
  );
}

// components/analytics.tsx
import { headers } from "next/headers";

export async function Analytics() {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";
  
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Analytics initialization
            window.analytics = { track: function() {} };
          })();
        `,
      }}
    />
  );
}
```

### CSP with Third-Party Scripts

```typescript
// lib/csp/config.ts

interface CSPDirectives {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  connectSrc: string[];
  frameSrc: string[];
  objectSrc: string[];
  baseUri: string[];
  formAction: string[];
  frameAncestors: string[];
  upgradeInsecureRequests?: boolean;
  reportUri?: string;
}

const baseDirectives: CSPDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'", "data:", "blob:"],
  fontSrc: ["'self'"],
  connectSrc: ["'self'"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: true,
};

// Third-party service configurations
const thirdPartyConfigs = {
  googleAnalytics: {
    scriptSrc: ["https://www.googletagmanager.com", "https://www.google-analytics.com"],
    imgSrc: ["https://www.google-analytics.com"],
    connectSrc: ["https://www.google-analytics.com"],
  },
  stripe: {
    scriptSrc: ["https://js.stripe.com"],
    frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
    connectSrc: ["https://api.stripe.com"],
  },
  youtube: {
    frameSrc: ["https://www.youtube.com", "https://www.youtube-nocookie.com"],
  },
  cloudflare: {
    scriptSrc: ["https://challenges.cloudflare.com"],
    frameSrc: ["https://challenges.cloudflare.com"],
  },
  vercel: {
    scriptSrc: ["https://va.vercel-scripts.com"],
    connectSrc: ["https://vitals.vercel-insights.com"],
  },
};

type ThirdPartyService = keyof typeof thirdPartyConfigs;

export function buildCSP(
  nonce: string,
  services: ThirdPartyService[] = []
): string {
  const directives = { ...baseDirectives };
  
  // Add nonce to script and style
  directives.scriptSrc = [`'nonce-${nonce}'`, "'strict-dynamic'", ...directives.scriptSrc];
  directives.styleSrc = [`'nonce-${nonce}'`, ...directives.styleSrc];
  
  // Merge third-party configurations
  for (const service of services) {
    const config = thirdPartyConfigs[service];
    for (const [key, values] of Object.entries(config)) {
      const directive = key as keyof CSPDirectives;
      if (Array.isArray(directives[directive])) {
        directives[directive] = [
          ...(directives[directive] as string[]),
          ...values,
        ];
      }
    }
  }
  
  // Build CSP string
  const parts: string[] = [];
  
  for (const [key, value] of Object.entries(directives)) {
    if (value === true) {
      parts.push(key.replace(/([A-Z])/g, "-$1").toLowerCase());
    } else if (Array.isArray(value) && value.length > 0) {
      const directive = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      parts.push(`${directive} ${[...new Set(value)].join(" ")}`);
    }
  }
  
  return parts.join("; ");
}

// Usage in middleware
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  
  const csp = buildCSP(nonce, [
    "googleAnalytics",
    "stripe",
    "vercel",
  ]);
  
  // ... set headers
}
```

### CSP Violation Reporting

```typescript
// app/api/csp-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface CSPViolation {
  "csp-report": {
    "document-uri": string;
    referrer: string;
    "violated-directive": string;
    "effective-directive": string;
    "original-policy": string;
    disposition: string;
    "blocked-uri": string;
    "status-code": number;
    "script-sample"?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const report = (await request.json()) as CSPViolation;
    const violation = report["csp-report"];
    
    // Log to database
    await prisma.cspViolation.create({
      data: {
        documentUri: violation["document-uri"],
        violatedDirective: violation["violated-directive"],
        blockedUri: violation["blocked-uri"],
        disposition: violation.disposition,
        userAgent: request.headers.get("user-agent") || "",
        timestamp: new Date(),
      },
    });
    
    // Also log for monitoring
    console.warn("CSP Violation:", {
      documentUri: violation["document-uri"],
      directive: violation["violated-directive"],
      blocked: violation["blocked-uri"],
    });
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("CSP report error:", error);
    return new Response(null, { status: 400 });
  }
}

// Add report-uri to CSP
const cspWithReporting = `
  ${csp};
  report-uri /api/csp-report;
  report-to csp-endpoint;
`;

// Report-To header for modern browsers
const reportToHeader = JSON.stringify({
  group: "csp-endpoint",
  max_age: 10886400,
  endpoints: [{ url: "/api/csp-report" }],
});
```

### Development vs Production CSP

```typescript
// lib/csp/index.ts

const isDev = process.env.NODE_ENV === "development";

export function getCSPHeader(nonce: string): string {
  if (isDev) {
    // Relaxed CSP for development (hot reload, etc.)
    return `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      connect-src 'self' ws: wss: http: https:;
      frame-ancestors 'self';
    `.replace(/\s{2,}/g, " ").trim();
  }
  
  // Strict CSP for production
  return buildCSP(nonce, ["googleAnalytics", "stripe", "vercel"]);
}

// middleware.ts
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = getCSPHeader(nonce);
  
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  
  return response;
}
```

## Variants

### Report-Only Mode for Testing

```typescript
// Start with report-only to test without breaking
const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          // Use report-only first to identify issues
          key: "Content-Security-Policy-Report-Only",
          value: strictCSP,
        },
        // Optional: less strict active CSP
        {
          key: "Content-Security-Policy",
          value: relaxedCSP,
        },
      ],
    },
  ],
};
```

### Hash-Based CSP for Static Scripts

```typescript
// For static inline scripts, use hashes instead of nonces
import crypto from "crypto";

function generateScriptHash(script: string): string {
  const hash = crypto.createHash("sha256").update(script).digest("base64");
  return `'sha256-${hash}'`;
}

const inlineScript = `console.log('Hello');`;
const scriptHash = generateScriptHash(inlineScript);

// CSP with hash
const csp = `script-src 'self' ${scriptHash};`;

// In component
<script dangerouslySetInnerHTML={{ __html: inlineScript }} />
```

## Anti-patterns

### Using unsafe-inline and unsafe-eval

```typescript
// BAD: Defeats the purpose of CSP
const csp = `script-src 'self' 'unsafe-inline' 'unsafe-eval';`;

// GOOD: Use nonces or hashes
const csp = `script-src 'self' 'nonce-${nonce}' 'strict-dynamic';`;
```

### Overly Permissive CSP

```typescript
// BAD: Allows loading from anywhere
const csp = `
  default-src *;
  script-src * 'unsafe-inline';
`;

// GOOD: Whitelist specific sources
const csp = `
  default-src 'self';
  script-src 'self' https://trusted-cdn.com;
`;
```

### Forgetting frame-ancestors

```typescript
// BAD: Missing clickjacking protection
const csp = `default-src 'self'; script-src 'self';`;

// GOOD: Include frame-ancestors
const csp = `
  default-src 'self';
  script-src 'self';
  frame-ancestors 'none';
`;
```

## Related Skills

- `security-headers` - Other HTTP security headers
- `xss-prevention` - XSS protection techniques
- `middleware` - Implementing CSP in middleware
- `next-config` - Configuration in next.config.ts

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with nonce and reporting support
