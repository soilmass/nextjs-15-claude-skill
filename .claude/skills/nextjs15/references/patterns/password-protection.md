---
id: pt-password-protection
name: Password Protected Pages
version: 1.1.0
layer: L5
category: auth
description: Implement password-protected pages without full authentication
tags: [auth, password, protection, middleware, next15, react19]
composes:
  - ../atoms/input-button.md
dependencies: []
formula: "PasswordProtection = Middleware + Cookie + PasswordForm + Server Action"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Password Protected Pages

## Overview

Password protection provides a lightweight access control mechanism for restricting content without implementing full user authentication. This pattern is ideal for scenarios where you need to share private content with a specific group of people who all share the same password, such as staging environments, client previews, or exclusive content areas.

The implementation uses Next.js 15 middleware for edge-level protection, ensuring unauthorized requests never reach your protected pages. Passwords are hashed using SHA-256 before comparison, and successful authentication is stored in an HTTP-only cookie with configurable expiration. This provides security without the complexity of managing user accounts.

Unlike full authentication systems, password protection is stateless and does not require a database for user management. The password is configured via environment variables, making it easy to rotate and different across environments. Multiple protection tiers can be implemented for different access levels within the same application.

## When to Use

- Staging or preview environments that should not be publicly accessible
- Client preview pages for reviewing work before launch
- Exclusive content areas for subscribers or members
- Event registration pages with limited access
- Private documentation or internal resources
- Coming soon pages with early access for selected users

## When NOT to Use

- When you need individual user accounts with different permissions
- For applications requiring audit trails of who accessed what
- When passwords need to be rotated per-user
- For highly sensitive data requiring stronger authentication (use proper auth)

## Composition Diagram

```
Password Protection Architecture
================================

+------------------------------------------------------------------+
|                         Request Flow                              |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                      Middleware Layer                             |
|  +------------------------------------------------------------+  |
|  |  1. Check if path is protected                              |  |
|  |  2. Verify password cookie exists                           |  |
|  |  3. Validate cookie hash matches env hash                   |  |
|  |  4. Redirect to /password if invalid                        |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
          +-------------------+-------------------+
          |                                       |
          v                                       v
+------------------------+           +------------------------+
|  Cookie Invalid        |           |  Cookie Valid          |
|  +------------------+  |           |  +------------------+  |
|  | Redirect to      |  |           |  | Allow request    |  |
|  | /password page   |  |           |  | to proceed       |  |
|  | with ?redirect   |  |           |  +------------------+  |
|  +------------------+  |           +------------------------+
+------------------------+
          |
          v
+------------------------------------------------------------------+
|                     Password Page                                 |
|  +------------------------------------------------------------+  |
|  |  PasswordForm Component (Client)                            |  |
|  |  - Password input field                                     |  |
|  |  - Submit button                                            |  |
|  |  - Error display                                            |  |
|  |  - Loading state                                            |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
          |
          v
+------------------------------------------------------------------+
|                    Server Action                                  |
|  +------------------------------------------------------------+  |
|  |  verifyPassword()                                           |  |
|  |  - Hash input password                                      |  |
|  |  - Compare with env hash                                    |  |
|  |  - Set HTTP-only cookie on success                          |  |
|  |  - Return result                                            |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Implementation

### Middleware-Based Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/preview', '/staging', '/private'];
const PASSWORD_COOKIE = 'site-password';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path requires protection
  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for valid password cookie
  const passwordCookie = request.cookies.get(PASSWORD_COOKIE);

  if (passwordCookie?.value === process.env.SITE_PASSWORD_HASH) {
    return NextResponse.next();
  }

  // Redirect to password page
  const url = request.nextUrl.clone();
  url.pathname = '/password';
  url.searchParams.set('redirect', pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/preview/:path*', '/staging/:path*', '/private/:path*'],
};
```

### Password Entry Page

```typescript
// app/password/page.tsx
import { PasswordForm } from '@/components/password-form';
import { Lock } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function PasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Password Required</h1>
          <p className="text-muted-foreground mt-2">
            This page is password protected. Please enter the password to continue.
          </p>
        </div>

        <PasswordForm redirectTo={redirectTo} />

        <p className="text-center text-sm text-muted-foreground">
          Need access? Contact the site administrator.
        </p>
      </div>
    </div>
  );
}
```

### Password Form Component

```typescript
// components/password-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyPassword } from '@/app/password/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordFormProps {
  redirectTo: string;
}

export function PasswordForm({ redirectTo }: PasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await verifyPassword(password, redirectTo);

      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(result.error || 'Invalid password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="pl-10 pr-10"
            required
            autoFocus
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </form>
  );
}
```

### Server Action for Verification

```typescript
// app/password/actions.ts
'use server';

import { cookies } from 'next/headers';
import { createHash } from 'crypto';

const PASSWORD_COOKIE = 'site-password';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function verifyPassword(
  password: string,
  _redirectTo: string
): Promise<{ success: boolean; error?: string }> {
  const expectedHash = process.env.SITE_PASSWORD_HASH;
  const inputHash = hashPassword(password);

  if (inputHash !== expectedHash) {
    return { success: false, error: 'Invalid password' };
  }

  // Set cookie on successful verification
  const cookieStore = await cookies();
  cookieStore.set(PASSWORD_COOKIE, inputHash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return { success: true };
}

export async function clearPasswordCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PASSWORD_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const passwordCookie = cookieStore.get(PASSWORD_COOKIE);
  return passwordCookie?.value === process.env.SITE_PASSWORD_HASH;
}
```

### Page-Level Protection

```typescript
// lib/password-protection.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const PASSWORD_COOKIE = 'site-password';

export async function requirePassword(currentPath: string): Promise<void> {
  const cookieStore = await cookies();
  const passwordCookie = cookieStore.get(PASSWORD_COOKIE);

  if (passwordCookie?.value !== process.env.SITE_PASSWORD_HASH) {
    redirect(`/password?redirect=${encodeURIComponent(currentPath)}`);
  }
}

// Usage in a page
// app/private/dashboard/page.tsx
import { requirePassword } from '@/lib/password-protection';

export default async function PrivateDashboard() {
  await requirePassword('/private/dashboard');

  return (
    <div>
      <h1>Private Dashboard</h1>
      {/* Protected content */}
    </div>
  );
}
```

### Multiple Password Tiers

```typescript
// lib/tiered-protection.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash } from 'crypto';

type ProtectionTier = 'preview' | 'staging' | 'admin';

const TIER_PASSWORDS: Record<ProtectionTier, string> = {
  preview: process.env.PREVIEW_PASSWORD_HASH!,
  staging: process.env.STAGING_PASSWORD_HASH!,
  admin: process.env.ADMIN_PASSWORD_HASH!,
};

const TIER_HIERARCHY: Record<ProtectionTier, ProtectionTier[]> = {
  admin: ['admin', 'staging', 'preview'],
  staging: ['staging', 'preview'],
  preview: ['preview'],
};

export async function requireTierAccess(
  tier: ProtectionTier,
  currentPath: string
): Promise<void> {
  const cookieStore = await cookies();

  // Check if user has access to any tier that includes the required tier
  for (const [checkTier, allowedTiers] of Object.entries(TIER_HIERARCHY)) {
    if (allowedTiers.includes(tier)) {
      const cookie = cookieStore.get(`${checkTier}-password`);
      if (cookie?.value === TIER_PASSWORDS[checkTier as ProtectionTier]) {
        return; // Access granted
      }
    }
  }

  redirect(`/password/${tier}?redirect=${encodeURIComponent(currentPath)}`);
}

export async function verifyTierPassword(
  tier: ProtectionTier,
  password: string
): Promise<boolean> {
  const hash = createHash('sha256').update(password).digest('hex');
  return hash === TIER_PASSWORDS[tier];
}

export async function setTierCookie(tier: ProtectionTier, hash: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`${tier}-password`, hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}
```

### Rate Limiting for Password Attempts

```typescript
// lib/password-rate-limit.ts
import { redis } from '@/lib/redis';
import { headers } from 'next/headers';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60; // 15 minutes

export async function checkRateLimit(): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt?: Date;
}> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const key = `password-attempts:${ip}`;

  const attempts = await redis.get(key);
  const currentAttempts = attempts ? parseInt(attempts, 10) : 0;

  if (currentAttempts >= MAX_ATTEMPTS) {
    const ttl = await redis.ttl(key);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + ttl * 1000),
    };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - currentAttempts,
  };
}

export async function recordAttempt(success: boolean): Promise<void> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const key = `password-attempts:${ip}`;

  if (success) {
    await redis.del(key);
  } else {
    await redis.incr(key);
    await redis.expire(key, LOCKOUT_DURATION);
  }
}
```

## Examples

### Example 1: Staging Environment Protection

```typescript
// app/staging/layout.tsx
import { requirePassword } from '@/lib/password-protection';

export default async function StagingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePassword('/staging');

  return (
    <div className="min-h-screen">
      <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium">
        Staging Environment - Not for production use
      </div>
      {children}
    </div>
  );
}
```

### Example 2: Client Preview with Expiring Access

```typescript
// lib/client-preview.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function requirePreviewAccess(
  projectId: string,
  currentPath: string
): Promise<void> {
  const cookieStore = await cookies();
  const previewToken = cookieStore.get(`preview-${projectId}`);

  if (!previewToken) {
    redirect(`/preview/login?project=${projectId}&redirect=${encodeURIComponent(currentPath)}`);
  }

  // Verify token is valid and not expired
  const preview = await prisma.previewAccess.findFirst({
    where: {
      projectId,
      token: previewToken.value,
      expiresAt: { gt: new Date() },
    },
  });

  if (!preview) {
    cookieStore.delete(`preview-${projectId}`);
    redirect(`/preview/login?project=${projectId}&redirect=${encodeURIComponent(currentPath)}`);
  }
}
```

### Example 3: Protected API Routes

```typescript
// app/api/private/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PASSWORD_COOKIE = 'site-password';

export async function GET() {
  const cookieStore = await cookies();
  const passwordCookie = cookieStore.get(PASSWORD_COOKIE);

  if (passwordCookie?.value !== process.env.SITE_PASSWORD_HASH) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({ data: 'Protected data' });
}
```

### Example 4: Logout Functionality

```typescript
// components/password-logout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { clearPasswordCookie } from '@/app/password/actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function PasswordLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await clearPasswordCookie();
    router.push('/');
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Exit Protected Area
    </Button>
  );
}
```

## Anti-patterns

### Anti-pattern 1: Storing Plain Passwords

```typescript
// BAD - Plain text comparison
if (password === process.env.SITE_PASSWORD) {
  // Vulnerable to timing attacks and env exposure!
}

// GOOD - Hash comparison with constant-time check
import { timingSafeEqual } from 'crypto';

const hash = createHash('sha256').update(password).digest('hex');
const expected = process.env.SITE_PASSWORD_HASH!;
const isValid = timingSafeEqual(
  Buffer.from(hash),
  Buffer.from(expected)
);
```

### Anti-pattern 2: Client-Side Only Protection

```typescript
// BAD - Only protecting in the component
export default function ProtectedPage() {
  const [hasAccess, setHasAccess] = useState(false);

  if (!hasAccess) {
    return <PasswordPrompt onSuccess={() => setHasAccess(true)} />;
  }

  return <SensitiveContent />; // Still rendered server-side!
}

// GOOD - Server-side protection via middleware or page
export default async function ProtectedPage() {
  await requirePassword('/protected');

  return <SensitiveContent />;
}
```

### Anti-pattern 3: Non-HTTP-Only Cookies

```typescript
// BAD - Cookie accessible to JavaScript
cookieStore.set(PASSWORD_COOKIE, hash, {
  httpOnly: false, // XSS vulnerable!
  secure: false,   // Sent over HTTP!
});

// GOOD - Secure cookie settings
cookieStore.set(PASSWORD_COOKIE, hash, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: COOKIE_MAX_AGE,
  path: '/',
});
```

### Anti-pattern 4: No Rate Limiting

```typescript
// BAD - Unlimited password attempts
export async function verifyPassword(password: string) {
  const hash = hashPassword(password);
  return hash === process.env.SITE_PASSWORD_HASH;
}

// GOOD - Rate limited attempts
export async function verifyPassword(password: string) {
  const rateLimit = await checkRateLimit();

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many attempts. Try again at ${rateLimit.resetAt}`
    };
  }

  const hash = hashPassword(password);
  const isValid = hash === process.env.SITE_PASSWORD_HASH;

  await recordAttempt(isValid);

  return { success: isValid };
}
```

## Testing

### Unit Test: Password Verification

```typescript
// __tests__/lib/password-protection.test.ts
import { verifyPassword } from '@/app/password/actions';
import { cookies } from 'next/headers';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('Password Verification', () => {
  const mockCookieStore = {
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    process.env.SITE_PASSWORD_HASH =
      '5e884898da28047d1650fdc7e0a5bd2e0f7f8e16c8d8c4e3a6e0d3a7c9b8f1e2';
  });

  it('should return success for correct password', async () => {
    const result = await verifyPassword('password123', '/dashboard');

    expect(result.success).toBe(true);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'site-password',
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    );
  });

  it('should return error for incorrect password', async () => {
    const result = await verifyPassword('wrongpassword', '/dashboard');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid password');
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });
});
```

### Integration Test: Middleware Protection

```typescript
// __tests__/middleware.test.ts
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Password Protection Middleware', () => {
  const createRequest = (path: string, cookie?: string) => {
    const url = new URL(path, 'http://localhost:3000');
    const request = new NextRequest(url);

    if (cookie) {
      request.cookies.set('site-password', cookie);
    }

    return request;
  };

  beforeEach(() => {
    process.env.SITE_PASSWORD_HASH = 'valid-hash';
  });

  it('should allow access to non-protected paths', () => {
    const request = createRequest('/public-page');
    const response = middleware(request);

    expect(response.status).not.toBe(307);
  });

  it('should redirect to password page for protected paths without cookie', () => {
    const request = createRequest('/preview/page');
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/password');
  });

  it('should allow access with valid cookie', () => {
    const request = createRequest('/preview/page', 'valid-hash');
    const response = middleware(request);

    expect(response.status).not.toBe(307);
  });
});
```

### E2E Test: Password Flow

```typescript
// e2e/password-protection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Password Protection', () => {
  test('should redirect to password page for protected routes', async ({ page }) => {
    await page.goto('/preview');

    await expect(page).toHaveURL(/\/password/);
    await expect(page.locator('h1')).toContainText('Password Required');
  });

  test('should show error for incorrect password', async ({ page }) => {
    await page.goto('/preview');

    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toContainText('Invalid password');
  });

  test('should grant access with correct password', async ({ page }) => {
    await page.goto('/preview');

    await page.fill('input[type="password"]', 'correctpassword');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/preview');
    await expect(page.locator('h1')).not.toContainText('Password Required');
  });
});
```

## Related Skills

- [auth-middleware](./auth-middleware.md) - Full authentication middleware
- [session-management](./session-management.md) - User session handling
- [rate-limiting](./rate-limiting.md) - API rate limiting patterns
- [cookies](./cookies.md) - Cookie management patterns

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive overview section
- Added When NOT to Use section
- Enhanced composition diagram with full architecture
- Added rate limiting implementation
- Added multiple password tiers with hierarchy
- Added 4 real-world usage examples
- Added 4 anti-patterns with code examples
- Added unit, integration, and E2E test examples
- Added show/hide password toggle
- Added logout functionality
- Improved documentation structure

### 1.0.0 (2025-01-15)
- Initial implementation
- Middleware-based protection
- Server action verification
- Multiple tier support
