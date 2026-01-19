---
id: pt-email-verification
name: Email Verification
version: 2.0.0
layer: L5
category: auth
description: Email verification flow for new user registration with secure tokens and resend functionality
tags: [auth, email, verification, signup, registration, tokens]
composes: []
dependencies: []
formula: "EmailVerification = Registration -> VerificationPending (resend + countdown) -> VerifyToken -> Success"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Email Verification

## When to Use

- After user registration to confirm email ownership
- When changing email addresses on existing accounts
- For applications requiring verified email communication
- To prevent spam accounts and ensure user authenticity
- When compliance requires email verification

## Composition Diagram

```
Email Verification Flow
======================

1. Registration Complete
+----------------------------------+
|  [Check Icon]                    |
|  "Check your email"              |
|  Sent to: user@example.com       |
|  +----------------------------+  |
|  | Resend in 00:30            |  |
|  +----------------------------+  |
|  [Resend Verification Email]     |
+----------------------------------+
         |
         v (User clicks email link)

2. Verification Success
+----------------------------------+
|  [Success Icon]                  |
|  "Email Verified!"               |
|  Your account is now active      |
|  [Continue to Dashboard]         |
+----------------------------------+
```

Implement secure email verification for new user registrations.

## Overview

This pattern covers:
- Verification token generation and storage
- Email delivery with verification links
- Token validation and expiration
- Resend functionality with rate limiting
- Account status management
- Security best practices

## Implementation

### Database Schema

```prisma
// prisma/schema.prisma additions
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  // ... other fields
  
  verificationTokens EmailVerificationToken[]
}

model EmailVerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  email     String   // Store email in case user changes it
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
}
```

### Verification Service

```typescript
// lib/auth/email-verification.ts
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email/verification';

const TOKEN_EXPIRY_HOURS = 24;
const MAX_RESEND_ATTEMPTS = 5;
const RESEND_COOLDOWN_MINUTES = 2;

/**
 * Generate a secure verification token
 */
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash token for secure storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Create and send verification email
 */
export async function sendVerification(
  userId: string,
  email: string,
  name?: string
): Promise<{ success: boolean; message: string }> {
  // Check rate limiting
  const recentAttempts = await prisma.emailVerificationToken.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - RESEND_COOLDOWN_MINUTES * 60 * 1000),
      },
    },
  });

  if (recentAttempts > 0) {
    return {
      success: false,
      message: `Please wait ${RESEND_COOLDOWN_MINUTES} minutes before requesting another verification email`,
    };
  }

  // Check total attempts
  const totalAttempts = await prisma.emailVerificationToken.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  if (totalAttempts >= MAX_RESEND_ATTEMPTS) {
    return {
      success: false,
      message: 'Too many verification attempts. Please contact support.',
    };
  }

  // Invalidate existing tokens
  await prisma.emailVerificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  // Generate new token
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Store token
  await prisma.emailVerificationToken.create({
    data: {
      token: hashedToken,
      userId,
      email,
      expiresAt,
    },
  });

  // Send email with unhashed token
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  await sendVerificationEmail({
    to: email,
    name: name || 'User',
    verificationUrl,
    expiresIn: TOKEN_EXPIRY_HOURS,
  });

  return {
    success: true,
    message: 'Verification email sent',
  };
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{
  success: boolean;
  message: string;
  userId?: string;
}> {
  const hashedToken = hashToken(token);

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!verificationToken) {
    return { success: false, message: 'Invalid verification link' };
  }

  if (verificationToken.usedAt) {
    return { success: false, message: 'This verification link has already been used' };
  }

  if (verificationToken.expiresAt < new Date()) {
    return { success: false, message: 'This verification link has expired' };
  }

  // Check if email was changed
  if (verificationToken.email !== verificationToken.user.email) {
    return {
      success: false,
      message: 'Email address has changed. Please request a new verification email.',
    };
  }

  // Mark user as verified
  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { token: hashedToken },
      data: { usedAt: new Date() },
    }),
  ]);

  return {
    success: true,
    message: 'Email verified successfully',
    userId: verificationToken.userId,
  };
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  return !!user?.emailVerified;
}

/**
 * Get verification status
 */
export async function getVerificationStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return null;
  }

  const pendingToken = await prisma.emailVerificationToken.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    email: user.email,
    isVerified: !!user.emailVerified,
    verifiedAt: user.emailVerified,
    hasPendingVerification: !!pendingToken,
    pendingExpiry: pendingToken?.expiresAt,
  };
}
```

### Server Actions

```typescript
// app/actions/email-verification.ts
'use server';

import { auth } from '@/lib/auth';
import {
  sendVerification,
  verifyEmail,
  getVerificationStatus,
} from '@/lib/auth/email-verification';
import { rateLimit } from '@/lib/rate-limit';

export async function resendVerificationAction() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  // Rate limit
  const limited = await rateLimit(`verify-resend:${session.user.id}`, {
    limit: 3,
    window: 300, // 5 minutes
  });

  if (limited) {
    return { error: 'Please wait before requesting another verification email' };
  }

  const result = await sendVerification(
    session.user.id,
    session.user.email!,
    session.user.name || undefined
  );

  return result.success ? { success: result.message } : { error: result.message };
}

export async function verifyEmailAction(token: string) {
  // Rate limit by IP
  const limited = await rateLimit('verify-email', {
    limit: 10,
    window: 3600,
  });

  if (limited) {
    return { error: 'Too many attempts. Please try again later.' };
  }

  const result = await verifyEmail(token);

  return result.success
    ? { success: result.message }
    : { error: result.message };
}

export async function getVerificationStatusAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  return getVerificationStatus(session.user.id);
}
```

### Verification Banner Component

```typescript
// components/auth/verification-banner.tsx
'use client';

import { useState, useTransition } from 'react';
import { resendVerificationAction } from '@/app/actions/email-verification';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, X } from 'lucide-react';

interface VerificationBannerProps {
  email: string;
  dismissible?: boolean;
}

export function VerificationBanner({ email, dismissible = true }: VerificationBannerProps) {
  const [isPending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResend = () => {
    setMessage(null);
    
    startTransition(async () => {
      const result = await resendVerificationAction();
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: result.success || 'Verification email sent!' });
      }
    });
  };

  if (dismissed) return null;

  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <span>
            Please verify your email address ({email}).{' '}
            {message ? (
              <span className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>
                {message.text}
              </span>
            ) : (
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleResend}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>
            )}
          </span>
        </div>
        
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-2"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

### Verify Email Page

```typescript
// app/auth/verify-email/page.tsx
import { Suspense } from 'react';
import { VerifyEmailContent } from './verify-email-content';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Verify Email',
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Verifying your email...</p>
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}

// app/auth/verify-email/verify-email-content.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmailAction } from '@/app/actions/email-verification';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token');
      return;
    }

    verifyEmailAction(token).then((result) => {
      if (result.error) {
        setStatus('error');
        setMessage(result.error);
      } else {
        setStatus('success');
        setMessage(result.success || 'Email verified successfully');
        
        // Redirect after success
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    });
  }, [token, router]);

  if (status === 'loading') {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold">Verification Failed</h2>
        <p className="text-muted-foreground">{message}</p>
        <div className="pt-4 space-y-2">
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            You can request a new verification email from your account settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-semibold">Email Verified!</h2>
      <p className="text-muted-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">
        Redirecting to dashboard...
      </p>
      <Link href="/dashboard">
        <Button>Continue to Dashboard</Button>
      </Link>
    </div>
  );
}
```

### Middleware for Protected Routes

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const VERIFICATION_REQUIRED_ROUTES = [
  '/dashboard/settings',
  '/dashboard/billing',
  '/api/sensitive',
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Check if route requires verification
  const requiresVerification = VERIFICATION_REQUIRED_ROUTES.some(
    (route) => path.startsWith(route)
  );

  if (requiresVerification && token && !token.emailVerified) {
    // Redirect to verification required page
    return NextResponse.redirect(
      new URL('/auth/verification-required', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### Verification Required Page

```typescript
// app/auth/verification-required/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { VerificationBanner } from '@/components/auth/verification-banner';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default async function VerificationRequiredPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.emailVerified) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8" />
        </div>
        
        <div>
          <h1 className="text-2xl font-semibold">Verify your email</h1>
          <p className="text-muted-foreground mt-2">
            To access this feature, please verify your email address.
          </p>
        </div>

        <VerificationBanner email={session.user.email!} dismissible={false} />

        <div className="pt-4">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Registration Flow Integration

```typescript
// lib/auth/register.ts
import { prisma } from '@/lib/prisma';
import { hashPassword } from './password';
import { sendVerification } from './email-verification';

export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const { email, password, name } = data;

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw new Error('An account with this email already exists');
  }

  // Create user
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    },
  });

  // Send verification email
  await sendVerification(user.id, user.email, user.name || undefined);

  return user;
}
```

## Anti-patterns

1. **Auto-verifying on registration** - Always require explicit verification
2. **No expiration** - Tokens should expire within 24 hours
3. **Allowing unverified access** - Restrict sensitive features until verified
4. **No resend limits** - Rate limit verification email requests
5. **Plain text tokens** - Always hash tokens before storing
6. **Ignoring email changes** - Invalidate tokens if email changes

## Related Skills

- [[password-reset]] - Password reset flow
- [[next-auth]] - Authentication setup
- [[email-templates]] - Email template design
- [[rate-limiting]] - Rate limiting implementation

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial email verification pattern with security best practices
