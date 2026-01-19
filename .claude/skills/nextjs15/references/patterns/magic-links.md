---
id: pt-magic-links
name: Magic Link Authentication
version: 2.0.0
layer: L5
category: auth
description: Passwordless authentication with email magic links
tags: [auth, magic-link, passwordless, email, next15, react19]
composes:
  - ../molecules/form-field.md
dependencies: []
formula: "MagicLinkAuth = EmailForm -> EmailService -> VerifyRequest -> Dashboard"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Magic Link Authentication

## When to Use

- For passwordless authentication that reduces user friction
- When security is important but you want to avoid password management
- For applications where users authenticate infrequently
- When targeting mobile-first users who prefer email-based login
- As an alternative or complement to OAuth social login

## Composition Diagram

```
Magic Link Flow
===============

1. Email Input Form
+----------------------------------+
|  [Email Input              ]     |
|  [    Send Magic Link    ]       |
+----------------------------------+
           |
           v (Email sent)

2. Check Email Confirmation
+----------------------------------+
|        [Mail Icon]               |
|   Check your email               |
|   "We sent a link to user@..."   |
|   [Use different email]          |
+----------------------------------+
           |
           v (User clicks link)

3. Verify & Redirect
+----------------------------------+
|   [Spinner] Signing you in...    |
+----------------------------------+
           |
           v
     Dashboard/Home
```

## Overview

Magic links provide passwordless authentication by sending a unique link to the user's email. Clicking the link authenticates them without needing a password. This pattern covers implementation with NextAuth.js and custom solutions.

## NextAuth.js Email Provider

```typescript
// auth.ts
import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: 'noreply@example.com',
      // Custom email template
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { Resend } = await import('resend');
        const resend = new Resend(provider.apiKey);

        await resend.emails.send({
          from: provider.from,
          to: identifier,
          subject: 'Sign in to Your Account',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; font-size: 24px;">Sign in to Your Account</h1>
              <p style="color: #666; font-size: 16px;">
                Click the button below to sign in. This link will expire in 24 hours.
              </p>
              <a href="${url}" style="
                display: inline-block;
                background: #0070f3;
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                margin: 20px 0;
              ">
                Sign in
              </a>
              <p style="color: #999; font-size: 14px;">
                If you didn't request this email, you can safely ignore it.
              </p>
              <p style="color: #999; font-size: 12px;">
                Or copy and paste this URL: ${url}
              </p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
});
```

## Magic Link Form

```typescript
// components/auth/magic-link-form.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';

export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn('resend', {
        email,
        redirect: false,
        callbackUrl: '/dashboard',
      });
      setSent(true);
    } catch (error) {
      console.error('Error sending magic link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-muted-foreground">
          We sent a magic link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Click the link in the email to sign in. The link expires in 24 hours.
        </p>
        <Button
          variant="ghost"
          onClick={() => setSent(false)}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send Magic Link
          </>
        )}
      </Button>
    </form>
  );
}

// Server Action version
// components/auth/magic-link-server.tsx
import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MagicLinkServerForm() {
  return (
    <form
      action={async (formData) => {
        'use server';
        await signIn('resend', {
          email: formData.get('email') as string,
          redirectTo: '/dashboard',
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Send Magic Link
      </Button>
    </form>
  );
}
```

## Verify Request Page

```typescript
// app/auth/verify-request/page.tsx
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            A sign in link has been sent to your email address.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            Click the link in the email to sign in to your account.
            The link will expire in 24 hours.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive an email?
          </p>
          <Button variant="outline" asChild>
            <Link href="/login">Try again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Custom Magic Link Implementation

```typescript
// lib/magic-link.ts
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createMagicLink(email: string): Promise<string> {
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Store in database with expiry
  await prisma.magicLink.create({
    data: {
      email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // Create URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
}

export async function sendMagicLink(email: string): Promise<void> {
  const magicLink = await createMagicLink(email);

  await resend.emails.send({
    from: 'noreply@example.com',
    to: email,
    subject: 'Your Sign In Link',
    html: `
      <p>Click the link below to sign in:</p>
      <a href="${magicLink}">Sign In</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function verifyMagicLink(
  email: string,
  token: string
): Promise<boolean> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const magicLink = await prisma.magicLink.findFirst({
    where: {
      email,
      token: hashedToken,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
  });

  if (!magicLink) return false;

  // Mark as used
  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  });

  return true;
}

// app/actions/auth.ts
'use server';

import { sendMagicLink, verifyMagicLink } from '@/lib/magic-link';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function requestMagicLink(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  try {
    await sendMagicLink(email);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to send magic link' };
  }
}

export async function verifyAndSignIn(email: string, token: string) {
  const isValid = await verifyMagicLink(email, token);

  if (!isValid) {
    return { error: 'Invalid or expired link' };
  }

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: { email, emailVerified: new Date() },
    });
  } else if (!user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  }

  // Create session
  const session = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set('session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: session.expiresAt,
  });

  return { success: true };
}

// app/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAndSignIn } from '@/app/actions/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    return NextResponse.redirect(new URL('/auth/error?error=InvalidLink', request.url));
  }

  const result = await verifyAndSignIn(email, token);

  if (result.error) {
    return NextResponse.redirect(
      new URL(`/auth/error?error=${result.error}`, request.url)
    );
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

## Rate Limiting Magic Links

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 requests per hour
  analytics: true,
});

// app/actions/auth.ts
export async function requestMagicLink(formData: FormData) {
  const email = formData.get('email') as string;

  // Rate limit by email
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `magic-link:${email}`
  );

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000 / 60);
    return {
      error: `Too many requests. Try again in ${retryAfter} minutes.`,
    };
  }

  try {
    await sendMagicLink(email);
    return { success: true, remaining };
  } catch (error) {
    return { error: 'Failed to send magic link' };
  }
}
```

## Anti-patterns

### Don't Use Predictable Tokens

```typescript
// BAD - Sequential or predictable tokens
const token = `magic-${Date.now()}`;

// GOOD - Cryptographically secure random tokens
const token = crypto.randomBytes(32).toString('hex');
```

### Don't Allow Token Reuse

```typescript
// BAD - Token can be reused
async function verify(token: string) {
  const link = await prisma.magicLink.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
  });
  return !!link;
}

// GOOD - Mark token as used
async function verify(token: string) {
  const link = await prisma.magicLink.findFirst({
    where: { token, expiresAt: { gt: new Date() }, usedAt: null },
  });
  if (!link) return false;
  await prisma.magicLink.update({
    where: { id: link.id },
    data: { usedAt: new Date() },
  });
  return true;
}
```

## Related Skills

- [next-auth](./next-auth.md)
- [oauth-providers](./oauth-providers.md)
- [email-verification](./email-verification.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- NextAuth.js integration
- Custom implementation
- Rate limiting
- Email templates
