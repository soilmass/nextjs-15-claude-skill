---
id: pt-csp
name: Content Security Policy
version: 1.0.0
layer: L5
category: security
description: Content Security Policy headers configuration for XSS protection
tags: [security, csp, headers, xss, next15]
composes: []
dependencies: []
formula: "CSP = PolicyDirectives + NonceGeneration + ReportingEndpoint + DevelopmentMode"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Content Security Policy

## When to Use

- Preventing XSS attacks
- Restricting resource loading
- Controlling inline scripts
- Third-party script management
- Security compliance requirements

## Composition Diagram

```
CSP Implementation
==================

+------------------------------------------+
|  Middleware (nonce generation)           |
|  - Generate unique nonce per request     |
|  - Set CSP headers                       |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  CSP Directives                          |
|  - script-src                            |
|  - style-src                             |
|  - connect-src                           |
|  - img-src                               |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Nonce Injection                         |
|  - Add nonce to inline scripts           |
|  - next/script integration               |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Violation Reporting                     |
|  - Report-To endpoint                    |
|  - Logging and monitoring                |
+------------------------------------------+
```

## CSP Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // Build CSP directives
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ''} https://www.googletagmanager.com`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`, // unsafe-inline for CSS-in-JS
    `img-src 'self' data: blob: https:`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://api.example.com wss://ws.example.com ${isDev ? 'ws://localhost:*' : ''}`,
    `frame-src 'self' https://www.youtube.com`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
    `report-uri /api/csp-report`,
  ];

  const cspHeader = cspDirectives.join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
```

## Nonce Provider

```typescript
// lib/csp/nonce-provider.tsx
import { headers } from 'next/headers';
import { cache } from 'react';

export const getNonce = cache(async () => {
  const headersList = await headers();
  return headersList.get('x-nonce') || '';
});

// Usage in layout
// app/layout.tsx
import { getNonce } from '@/lib/csp/nonce-provider';
import Script from 'next/script';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = await getNonce();

  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
          strategy="afterInteractive"
          nonce={nonce}
        />
        <Script id="gtag-init" strategy="afterInteractive" nonce={nonce}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## CSP Report Endpoint

```typescript
// app/api/csp-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface CSPReport {
  'csp-report': {
    'document-uri': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'blocked-uri': string;
    'status-code': number;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const report: CSPReport = await request.json();
    const cspReport = report['csp-report'];

    // Log to database
    await prisma.cspViolation.create({
      data: {
        documentUri: cspReport['document-uri'],
        violatedDirective: cspReport['violated-directive'],
        effectiveDirective: cspReport['effective-directive'],
        blockedUri: cspReport['blocked-uri'],
        sourceFile: cspReport['source-file'] || null,
        lineNumber: cspReport['line-number'] || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    // Alert on high-severity violations
    if (isHighSeverity(cspReport)) {
      await sendAlert(cspReport);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('CSP report error:', error);
    return new NextResponse(null, { status: 400 });
  }
}

function isHighSeverity(report: CSPReport['csp-report']): boolean {
  const highSeverityDirectives = ['script-src', 'object-src', 'base-uri'];
  return highSeverityDirectives.some((d) =>
    report['effective-directive'].startsWith(d)
  );
}

async function sendAlert(report: CSPReport['csp-report']) {
  // Send to monitoring service
  console.warn('High severity CSP violation:', report);
}
```

## CSP Configuration Helper

```typescript
// lib/csp/config.ts
type CSPDirective =
  | 'default-src'
  | 'script-src'
  | 'style-src'
  | 'img-src'
  | 'font-src'
  | 'connect-src'
  | 'frame-src'
  | 'object-src'
  | 'base-uri'
  | 'form-action'
  | 'frame-ancestors';

type CSPValue = string | string[];

interface CSPConfig {
  directives: Partial<Record<CSPDirective, CSPValue>>;
  reportUri?: string;
  reportOnly?: boolean;
}

export function buildCSP(config: CSPConfig, nonce?: string): string {
  const directives: string[] = [];

  for (const [directive, value] of Object.entries(config.directives)) {
    let values = Array.isArray(value) ? value : [value];

    // Add nonce to script-src and style-src
    if (nonce && (directive === 'script-src' || directive === 'style-src')) {
      values = [`'nonce-${nonce}'`, ...values];
    }

    directives.push(`${directive} ${values.join(' ')}`);
  }

  if (config.reportUri) {
    directives.push(`report-uri ${config.reportUri}`);
  }

  return directives.join('; ');
}

// Preset configurations
export const CSP_PRESETS = {
  strict: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
    },
  },
  relaxed: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ['*', 'data:', 'blob:'],
      'font-src': ['*'],
      'connect-src': ['*'],
      'frame-src': ['*'],
      'object-src': ["'none'"],
    },
  },
};
```

## Development Mode Helper

```typescript
// lib/csp/dev-mode.ts
export function getDevCSP(nonce: string): string {
  // Relaxed CSP for development
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`, // eval for HMR
    `style-src 'self' 'unsafe-inline'`,
    `img-src * data: blob:`,
    `font-src *`,
    `connect-src * ws: wss:`, // WebSocket for HMR
    `frame-src *`,
  ].join('; ');
}

export function getProdCSP(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src 'self' https://api.example.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}
```

## Inline Script Component

```typescript
// components/inline-script.tsx
import { getNonce } from '@/lib/csp/nonce-provider';

interface InlineScriptProps {
  children: string;
  id?: string;
}

export async function InlineScript({ children, id }: InlineScriptProps) {
  const nonce = await getNonce();

  return (
    <script
      id={id}
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: children }}
    />
  );
}

// Usage
<InlineScript id="analytics">
  {`console.log('Analytics loaded');`}
</InlineScript>
```

## Next.js Config Headers

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

## Anti-patterns

### Don't Use unsafe-inline in Production

```typescript
// BAD - Allows XSS
"script-src 'self' 'unsafe-inline'"

// GOOD - Use nonces
"script-src 'self' 'nonce-${nonce}'"
```

## Related Skills

- [security-headers](./security-headers.md)
- [auth-middleware](./auth-middleware.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Nonce generation
- Report endpoint
- Development mode
