---
id: pt-url-validation
name: URL Validation Utilities
version: 1.0.0
layer: L5
category: utilities
description: URL validation and sanitization utilities for Next.js applications
tags: [url, validation, sanitization, security, next15]
composes:
  - ../atoms/input-text.md
  - ../atoms/feedback-alert.md
dependencies: []
formula: Pattern Matching + URL Parser + Security Checks = Safe URL Handling
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# URL Validation Utilities

## When to Use

- **User input**: Validating URLs submitted by users
- **Redirects**: Preventing open redirect vulnerabilities
- **Link previews**: Validating URLs before fetching metadata
- **Form validation**: URL fields in forms

**Avoid when**: URLs are from trusted sources only, or validation is handled server-side.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ URL Validation Architecture                                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ URL Validator                                         │  │
│  │  ├─ Format Check: Protocol, domain, path validation  │  │
│  │  ├─ Security Check: Blocked domains, SSRF prevention │  │
│  │  └─ Sanitization: Normalize and clean URLs           │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Form       │     │ Redirect     │     │ Link        │   │
│  │ Validation │     │ Validation   │     │ Preview     │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## URL Validator Implementation

```typescript
// lib/url/validator.ts
export interface UrlValidationOptions {
  allowedProtocols?: string[];
  allowedDomains?: string[];
  blockedDomains?: string[];
  requireHttps?: boolean;
  allowLocalhost?: boolean;
  allowPrivateIp?: boolean;
  maxLength?: number;
}

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  url?: URL;
  sanitized?: string;
}

const DEFAULT_OPTIONS: UrlValidationOptions = {
  allowedProtocols: ['http:', 'https:'],
  blockedDomains: [],
  requireHttps: false,
  allowLocalhost: false,
  allowPrivateIp: false,
  maxLength: 2048,
};

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

export function validateUrl(
  input: string,
  options: UrlValidationOptions = {}
): UrlValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check length
  if (input.length > (opts.maxLength || 2048)) {
    return { valid: false, error: 'URL exceeds maximum length' };
  }

  // Trim and basic cleanup
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: 'URL is empty' };
  }

  // Try to parse the URL
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    // Try adding https:// if no protocol
    try {
      url = new URL(`https://${trimmed}`);
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  // Check protocol
  if (opts.allowedProtocols && !opts.allowedProtocols.includes(url.protocol)) {
    return { valid: false, error: `Protocol ${url.protocol} is not allowed` };
  }

  // Require HTTPS
  if (opts.requireHttps && url.protocol !== 'https:') {
    return { valid: false, error: 'URL must use HTTPS' };
  }

  // Check for localhost
  if (!opts.allowLocalhost && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    return { valid: false, error: 'Localhost URLs are not allowed' };
  }

  // Check for private IP addresses (SSRF prevention)
  if (!opts.allowPrivateIp) {
    const isPrivateIp = PRIVATE_IP_RANGES.some((range) => range.test(url.hostname));
    if (isPrivateIp) {
      return { valid: false, error: 'Private IP addresses are not allowed' };
    }
  }

  // Check blocked domains
  if (opts.blockedDomains?.length) {
    const isBlocked = opts.blockedDomains.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
    if (isBlocked) {
      return { valid: false, error: 'This domain is not allowed' };
    }
  }

  // Check allowed domains (if specified)
  if (opts.allowedDomains?.length) {
    const isAllowed = opts.allowedDomains.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
    if (!isAllowed) {
      return { valid: false, error: 'This domain is not in the allowed list' };
    }
  }

  return {
    valid: true,
    url,
    sanitized: url.href,
  };
}

// Specific validators
export function isValidHttpUrl(url: string): boolean {
  return validateUrl(url, { allowedProtocols: ['http:', 'https:'] }).valid;
}

export function isValidHttpsUrl(url: string): boolean {
  return validateUrl(url, { requireHttps: true }).valid;
}

export function isValidImageUrl(url: string): boolean {
  const result = validateUrl(url);
  if (!result.valid || !result.url) return false;

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
  return imageExtensions.some((ext) =>
    result.url!.pathname.toLowerCase().endsWith(ext)
  );
}
```

## Redirect Validator

```typescript
// lib/url/redirect-validator.ts
import { validateUrl } from './validator';

const ALLOWED_REDIRECT_DOMAINS = process.env.ALLOWED_REDIRECT_DOMAINS?.split(',') || [];

export function validateRedirectUrl(
  redirectUrl: string,
  baseUrl: string
): { valid: boolean; url: string; error?: string } {
  // Handle relative URLs
  if (redirectUrl.startsWith('/')) {
    // Ensure it doesn't start with // (protocol-relative URL)
    if (redirectUrl.startsWith('//')) {
      return { valid: false, url: '/', error: 'Invalid redirect path' };
    }
    return { valid: true, url: redirectUrl };
  }

  // Parse the base URL
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    return { valid: false, url: '/', error: 'Invalid base URL' };
  }

  // Validate the redirect URL
  const result = validateUrl(redirectUrl, {
    requireHttps: base.protocol === 'https:',
    allowedDomains: [base.hostname, ...ALLOWED_REDIRECT_DOMAINS],
    allowLocalhost: process.env.NODE_ENV === 'development',
  });

  if (!result.valid) {
    return { valid: false, url: '/', error: result.error };
  }

  return { valid: true, url: result.sanitized! };
}

// Usage in auth callback
export function getSafeRedirectUrl(
  requestedRedirect: string | null,
  baseUrl: string,
  defaultPath = '/'
): string {
  if (!requestedRedirect) return defaultPath;

  const validation = validateRedirectUrl(requestedRedirect, baseUrl);
  return validation.valid ? validation.url : defaultPath;
}
```

## Zod Schema Integration

```typescript
// lib/url/schemas.ts
import { z } from 'zod';
import { validateUrl, isValidHttpsUrl, isValidImageUrl } from './validator';

// Basic URL schema
export const urlSchema = z.string().refine(
  (val) => validateUrl(val).valid,
  { message: 'Invalid URL' }
);

// HTTPS-only URL schema
export const httpsUrlSchema = z.string().refine(
  isValidHttpsUrl,
  { message: 'URL must use HTTPS' }
);

// Image URL schema
export const imageUrlSchema = z.string().refine(
  isValidImageUrl,
  { message: 'Must be a valid image URL' }
);

// URL with specific domains
export const trustedUrlSchema = (domains: string[]) =>
  z.string().refine(
    (val) => validateUrl(val, { allowedDomains: domains }).valid,
    { message: 'URL must be from a trusted domain' }
  );

// Example form schema
export const linkFormSchema = z.object({
  title: z.string().min(1).max(200),
  url: urlSchema,
  imageUrl: imageUrlSchema.optional(),
});
```

## URL Input Component

```typescript
// components/url-input.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, Link } from 'lucide-react';
import { validateUrl, UrlValidationOptions } from '@/lib/url/validator';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  validationOptions?: UrlValidationOptions;
  placeholder?: string;
  className?: string;
}

export function UrlInput({
  value,
  onChange,
  validationOptions,
  placeholder = 'https://example.com',
  className,
}: UrlInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!value) {
      setError(null);
      setIsValid(false);
      return;
    }

    const result = validateUrl(value, validationOptions);
    setIsValid(result.valid);
    setError(result.valid ? null : result.error || 'Invalid URL');
  }, [value, validationOptions]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${className}`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Server-Side Validation

```typescript
// app/api/links/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateUrl } from '@/lib/url/validator';
import { linkFormSchema } from '@/lib/url/schemas';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Schema validation
  const parsed = linkFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }

  // Additional URL validation with security checks
  const urlValidation = validateUrl(parsed.data.url, {
    requireHttps: true,
    blockedDomains: ['malicious.com', 'phishing.net'],
    allowLocalhost: false,
    allowPrivateIp: false,
  });

  if (!urlValidation.valid) {
    return NextResponse.json(
      { error: urlValidation.error },
      { status: 400 }
    );
  }

  // Use sanitized URL
  const safeUrl = urlValidation.sanitized!;

  // Continue with link creation...
  return NextResponse.json({ url: safeUrl });
}
```

## URL Normalization

```typescript
// lib/url/normalize.ts
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Lowercase hostname
    parsed.hostname = parsed.hostname.toLowerCase();

    // Remove default ports
    if (
      (parsed.protocol === 'http:' && parsed.port === '80') ||
      (parsed.protocol === 'https:' && parsed.port === '443')
    ) {
      parsed.port = '';
    }

    // Remove trailing slash from path (unless it's just /)
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    // Sort query parameters
    const params = new URLSearchParams(parsed.search);
    const sortedParams = new URLSearchParams([...params.entries()].sort());
    parsed.search = sortedParams.toString();

    // Remove empty hash
    if (parsed.hash === '#') {
      parsed.hash = '';
    }

    return parsed.href;
  } catch {
    return url;
  }
}

export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
```

## Related Patterns

- [url-shortening](./url-shortening.md)
- [form-validation](./form-validation.md)
- [security](./security.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- URL validation with security checks
- Redirect validation
- Zod schema integration
- URL input component
