---
id: pt-password-reset
name: Password Reset
version: 2.0.0
layer: L5
category: auth
description: Secure password reset flow with tokenized links, rate limiting, and email verification
tags: [auth, password, reset, security, email, tokens]
composes:
  - ../molecules/form-field.md
dependencies: []
formula: "PasswordResetFlow = ForgotPasswordForm (email) -> EmailService -> ResetPasswordForm (password + strength)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Password Reset

## When to Use

- When implementing credential-based authentication
- To allow users to recover access when they forget their password
- As part of a complete authentication system
- When you need secure token-based password recovery
- For applications that require password history tracking

## Composition Diagram

```
Password Reset Flow
===================

1. Forgot Password Form
+----------------------------------+
|  [Email Input Field          ]  |
|  +----------------------------+ |
|  |        Alert Message       | |
|  +----------------------------+ |
|  [    Send Reset Link    ]      |
+----------------------------------+
           |
           v (Email with token)

2. Reset Password Form
+----------------------------------+
|  [New Password         ] [Eye]  |
|  +----------------------------+ |
|  | Password Strength Meter    | |
|  | [========----] 75% Strong  | |
|  +----------------------------+ |
|  [Confirm Password        ]     |
|  +----------------------------+ |
|  | Requirements Checklist     | |
|  | [x] 8+ chars  [x] Upper    | |
|  | [x] Lower     [x] Number   | |
|  | [ ] Special character      | |
|  +----------------------------+ |
|  [    Reset Password     ]      |
+----------------------------------+
```

Implement a secure password reset flow with email verification and token management.

## Overview

This pattern covers:
- Secure token generation and storage
- Rate limiting to prevent abuse
- Email delivery with reset links
- Token validation and expiration
- Password strength requirements
- Security best practices

## Implementation

### Database Schema

```prisma
// prisma/schema.prisma additions
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
}

model PasswordHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  hash      String
  createdAt DateTime @default(now())

  @@index([userId])
}
```

### Token Service

```typescript
// lib/auth/password-reset.ts
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from './password';
import { sendPasswordResetEmail } from '@/lib/email/password-reset';

const TOKEN_EXPIRY_HOURS = 1;
const MAX_RESET_ATTEMPTS = 3;
const RESET_COOLDOWN_MINUTES = 15;

interface RequestResetResult {
  success: boolean;
  message: string;
}

interface ResetPasswordResult {
  success: boolean;
  message: string;
}

/**
 * Generate a secure reset token
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
 * Request a password reset
 */
export async function requestPasswordReset(
  email: string
): Promise<RequestResetResult> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return {
      success: true,
      message: 'If an account exists, you will receive a reset email',
    };
  }

  // Check rate limiting
  const recentAttempts = await prisma.passwordResetToken.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: new Date(Date.now() - RESET_COOLDOWN_MINUTES * 60 * 1000),
      },
    },
  });

  if (recentAttempts >= MAX_RESET_ATTEMPTS) {
    return {
      success: false,
      message: `Too many reset attempts. Please wait ${RESET_COOLDOWN_MINUTES} minutes.`,
    };
  }

  // Invalidate any existing tokens
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(), // Mark as used
    },
  });

  // Generate new token
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Store token
  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Send email with unhashed token
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name || 'User',
    resetUrl,
    expiresIn: TOKEN_EXPIRY_HOURS,
  });

  return {
    success: true,
    message: 'If an account exists, you will receive a reset email',
  };
}

/**
 * Validate a reset token
 */
export async function validateResetToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  message?: string;
}> {
  const hashedToken = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!resetToken) {
    return { valid: false, message: 'Invalid or expired reset link' };
  }

  if (resetToken.usedAt) {
    return { valid: false, message: 'This reset link has already been used' };
  }

  if (resetToken.expiresAt < new Date()) {
    return { valid: false, message: 'This reset link has expired' };
  }

  return { valid: true, userId: resetToken.userId };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  // Validate token
  const validation = await validateResetToken(token);
  
  if (!validation.valid || !validation.userId) {
    return { success: false, message: validation.message || 'Invalid token' };
  }

  // Validate password strength
  const strengthCheck = validatePasswordStrength(newPassword);
  if (!strengthCheck.valid) {
    return { success: false, message: strengthCheck.message };
  }

  // Check password history (prevent reuse)
  const passwordHistory = await prisma.passwordHistory.findMany({
    where: { userId: validation.userId },
    orderBy: { createdAt: 'desc' },
    take: 5, // Check last 5 passwords
  });

  for (const history of passwordHistory) {
    if (await verifyPassword(newPassword, history.hash)) {
      return {
        success: false,
        message: 'Cannot reuse a recent password. Please choose a different password.',
      };
    }
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and mark token as used
  const hashedToken = hashToken(token);
  
  await prisma.$transaction([
    // Update user password
    prisma.user.update({
      where: { id: validation.userId },
      data: { password: hashedPassword },
    }),
    // Mark token as used
    prisma.passwordResetToken.update({
      where: { token: hashedToken },
      data: { usedAt: new Date() },
    }),
    // Store in password history
    prisma.passwordHistory.create({
      data: {
        userId: validation.userId,
        hash: hashedPassword,
      },
    }),
  ]);

  // Invalidate all sessions (optional but recommended)
  await prisma.session.deleteMany({
    where: { userId: validation.userId },
  });

  return { success: true, message: 'Password reset successfully' };
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message: string;
  score: number;
} {
  const requirements = [
    { test: password.length >= 8, message: 'at least 8 characters' },
    { test: password.length <= 128, message: 'at most 128 characters' },
    { test: /[a-z]/.test(password), message: 'a lowercase letter' },
    { test: /[A-Z]/.test(password), message: 'an uppercase letter' },
    { test: /[0-9]/.test(password), message: 'a number' },
    { test: /[^a-zA-Z0-9]/.test(password), message: 'a special character' },
  ];

  const failed = requirements.filter((r) => !r.test);
  const score = ((requirements.length - failed.length) / requirements.length) * 100;

  if (failed.length > 0) {
    return {
      valid: false,
      message: `Password must contain ${failed.map((f) => f.message).join(', ')}`,
      score,
    };
  }

  // Check for common passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'letmein'];
  if (commonPasswords.some((p) => password.toLowerCase().includes(p))) {
    return {
      valid: false,
      message: 'Password is too common. Please choose a stronger password.',
      score: 0,
    };
  }

  return { valid: true, message: 'Password is strong', score };
}
```

### Password Utilities

```typescript
// lib/auth/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Server Actions

```typescript
// app/actions/password-reset.ts
'use server';

import { z } from 'zod';
import {
  requestPasswordReset,
  resetPassword,
  validateResetToken,
  validatePasswordStrength,
} from '@/lib/auth/password-reset';
import { rateLimit } from '@/lib/rate-limit';

const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function requestResetAction(formData: FormData) {
  const email = formData.get('email') as string;

  // Validate input
  const result = requestSchema.safeParse({ email });
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // Rate limit by IP
  const limited = await rateLimit('password-reset', { limit: 5, window: 3600 });
  if (limited) {
    return { error: 'Too many requests. Please try again later.' };
  }

  const response = await requestPasswordReset(result.data.email);
  
  return response.success 
    ? { success: response.message }
    : { error: response.message };
}

export async function validateTokenAction(token: string) {
  const result = await validateResetToken(token);
  return result;
}

export async function resetPasswordAction(formData: FormData) {
  const data = {
    token: formData.get('token') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  // Validate input
  const result = resetSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // Rate limit
  const limited = await rateLimit('password-reset-complete', { limit: 5, window: 3600 });
  if (limited) {
    return { error: 'Too many attempts. Please try again later.' };
  }

  const response = await resetPassword(result.data.token, result.data.password);
  
  return response.success 
    ? { success: response.message }
    : { error: response.message };
}

export async function checkPasswordStrength(password: string) {
  return validatePasswordStrength(password);
}
```

### Request Reset Form

```typescript
// components/auth/forgot-password-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { requestResetAction } from '@/app/actions/password-reset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', data.email);
      
      const result = await requestResetAction(formData);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-muted-foreground">
          If an account exists for {form.getValues('email')}, you will receive
          a password reset link shortly.
        </p>
        <p className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={() => setSuccess(false)}
            className="text-primary underline"
          >
            try again
          </button>
        </p>
        <Link href="/auth/login" className="block text-primary hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">Forgot your password?</h2>
        <p className="text-muted-foreground text-sm">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...form.register('email')}
          disabled={isPending}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send reset link
      </Button>

      <p className="text-center text-sm">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
```

### Reset Password Form

```typescript
// components/auth/reset-password-form.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  validateTokenAction,
  resetPasswordAction,
  checkPasswordStrength,
} from '@/app/actions/password-reset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError('Missing reset token');
      return;
    }

    validateTokenAction(token).then((result) => {
      setTokenValid(result.valid);
      if (!result.valid) {
        setTokenError(result.message || 'Invalid token');
      }
    });
  }, [token]);

  // Check password strength on change
  const password = form.watch('password');
  useEffect(() => {
    if (password) {
      checkPasswordStrength(password).then(setPasswordStrength);
    } else {
      setPasswordStrength({ score: 0, message: '' });
    }
  }, [password]);

  const onSubmit = (data: FormData) => {
    if (!token) return;
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);

      const result = await resetPasswordAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/auth/login?reset=success');
      }
    });
  };

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-muted-foreground">Validating reset link...</p>
      </div>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold">Invalid reset link</h2>
        <p className="text-muted-foreground">{tokenError}</p>
        <Link href="/auth/forgot-password">
          <Button>Request new reset link</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Set new password</h2>
        <p className="text-muted-foreground text-sm">
          Create a strong password for your account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...form.register('password')}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Password strength indicator */}
        {password && (
          <div className="space-y-1">
            <Progress value={passwordStrength.score} className="h-1" />
            <p className={`text-xs ${
              passwordStrength.score >= 80 ? 'text-green-600' :
              passwordStrength.score >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {passwordStrength.message}
            </p>
          </div>
        )}
        
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...form.register('confirmPassword')}
          disabled={isPending}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Password requirements */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Password must contain:</p>
        <ul className="space-y-1">
          {[
            { test: password.length >= 8, text: 'At least 8 characters' },
            { test: /[a-z]/.test(password), text: 'A lowercase letter' },
            { test: /[A-Z]/.test(password), text: 'An uppercase letter' },
            { test: /[0-9]/.test(password), text: 'A number' },
            { test: /[^a-zA-Z0-9]/.test(password), text: 'A special character' },
          ].map((req) => (
            <li key={req.text} className="flex items-center gap-1">
              {req.test ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <XCircle className="h-3 w-3 text-muted-foreground" />
              )}
              {req.text}
            </li>
          ))}
        </ul>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Reset password
      </Button>
    </form>
  );
}
```

### Pages

```typescript
// app/auth/forgot-password/page.tsx
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Forgot Password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

// app/auth/reset-password/page.tsx
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Reset Password',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
```

## Anti-patterns

1. **Revealing user existence** - Always return same message for valid/invalid emails
2. **Long-lived tokens** - Tokens should expire in 1 hour or less
3. **No rate limiting** - Always limit reset attempts
4. **Reusable tokens** - Mark tokens as used immediately
5. **Weak password validation** - Enforce strong password requirements
6. **No password history** - Prevent reusing recent passwords

## Related Skills

- [[email-verification]] - Email verification flow
- [[next-auth]] - Authentication setup
- [[rate-limiting]] - Rate limiting implementation
- [[email-templates]] - Email template design

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial password reset pattern with security best practices
