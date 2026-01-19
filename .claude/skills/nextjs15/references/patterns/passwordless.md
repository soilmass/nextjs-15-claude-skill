---
id: pt-passwordless
name: Passwordless Authentication
version: 2.0.0
layer: L5
category: auth
description: Implement passwordless authentication with magic links and WebAuthn in Next.js 15
tags: [auth, passwordless, magic-link, webauthn, passkeys]
composes: []
dependencies: []
formula: "Passwordless = (MagicLink | OTP | WebAuthn/Passkeys) + EmailVerification + DeviceRegistration"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Passwordless Authentication Pattern

## When to Use

- To eliminate password-related security risks
- For improved user experience (no password to remember)
- When targeting mobile users (biometric authentication)
- For applications requiring modern security standards
- When implementing passkey/WebAuthn support

## Composition Diagram

```
Passwordless Methods
====================

1. Magic Link:
[Email Input] -> [Send Link] -> [Click Link] -> [Authenticated]

2. One-Time Password (OTP):
[Email/Phone] -> [Send OTP] -> [Enter 6-digit] -> [Authenticated]
                              +---------------+
                              | [ ] [ ] [ ] [ ] [ ] [ ] |
                              +---------------+

3. WebAuthn/Passkeys:
+----------------------------------+
|  [Fingerprint Icon]              |
|  "Use your passkey to sign in"   |
|  +----------------------------+  |
|  | Touch ID / Face ID / Key   |  |
|  +----------------------------+  |
|  [Use a different method]        |
+----------------------------------+
```

## Overview

Passwordless authentication eliminates passwords using magic links, one-time codes, or WebAuthn (passkeys). This pattern covers implementing multiple passwordless methods in Next.js 15.

## Implementation

### Magic Link Authentication

```typescript
// lib/auth/magic-link.ts
import { prisma } from '@/lib/prisma';
import { SignJWT, jwtVerify } from 'jose';
import { sendEmail } from '@/lib/email';

const MAGIC_LINK_SECRET = new TextEncoder().encode(
  process.env.MAGIC_LINK_SECRET!
);

export async function createMagicLink(email: string): Promise<string> {
  // Check if user exists or create
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: { email },
    });
  }

  // Create token
  const token = await new SignJWT({ userId: user.id, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(MAGIC_LINK_SECRET);

  // Store token hash for single use
  const tokenHash = await hashToken(token);
  await prisma.magicLink.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  // Send email
  await sendEmail({
    to: email,
    subject: 'Sign in to Your App',
    html: `
      <h1>Sign in to Your App</h1>
      <p>Click the button below to sign in. This link expires in 15 minutes.</p>
      <a href="${magicLink}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #3b82f6;
        color: white;
        text-decoration: none;
        border-radius: 8px;
      ">
        Sign In
      </a>
      <p style="color: #666; font-size: 12px; margin-top: 24px;">
        If you didn't request this email, you can safely ignore it.
      </p>
    `,
  });

  return magicLink;
}

export async function verifyMagicLink(token: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    // Verify JWT
    const { payload } = await jwtVerify(token, MAGIC_LINK_SECRET);
    const { userId } = payload as { userId: string };

    // Check if token was used
    const tokenHash = await hashToken(token);
    const magicLink = await prisma.magicLink.findFirst({
      where: {
        userId,
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!magicLink) {
      return { valid: false, error: 'Invalid or expired link' };
    }

    // Mark as used
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    return { valid: true, userId };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('hex');
}
```

### One-Time Code Authentication

```typescript
// lib/auth/otp.ts
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

function generateOTP(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export async function sendOTP(
  identifier: string,
  type: 'email' | 'sms'
): Promise<{ success: boolean; error?: string }> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Find or create user
  let user = await prisma.user.findFirst({
    where: type === 'email' ? { email: identifier } : { phone: identifier },
  });

  if (!user) {
    user = await prisma.user.create({
      data: type === 'email' ? { email: identifier } : { phone: identifier },
    });
  }

  // Invalidate previous OTPs
  await prisma.otp.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Store OTP hash
  const otpHash = await hashOTP(otp);
  await prisma.otp.create({
    data: {
      userId: user.id,
      hash: otpHash,
      expiresAt,
      type,
    },
  });

  // Send OTP
  if (type === 'email') {
    await sendEmail({
      to: identifier,
      subject: 'Your verification code',
      html: `
        <h1>Your verification code</h1>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${otp}
        </p>
        <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
      `,
    });
  } else {
    await sendSMS({
      to: identifier,
      message: `Your verification code is: ${otp}. Expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });
  }

  return { success: true };
}

export async function verifyOTP(
  identifier: string,
  code: string,
  type: 'email' | 'sms'
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const user = await prisma.user.findFirst({
    where: type === 'email' ? { email: identifier } : { phone: identifier },
  });

  if (!user) {
    return { valid: false, error: 'User not found' };
  }

  const otpHash = await hashOTP(code);
  const otp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      hash: otpHash,
      type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) {
    // Rate limit check
    const attempts = await prisma.otp.count({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (attempts > 5) {
      return { valid: false, error: 'Too many attempts. Try again later.' };
    }

    return { valid: false, error: 'Invalid or expired code' };
  }

  // Mark as used
  await prisma.otp.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  return { valid: true, userId: user.id };
}

async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('hex');
}
```

### WebAuthn / Passkeys

```typescript
// lib/auth/webauthn.ts
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';
import { prisma } from '@/lib/prisma';

const rpName = 'Your App';
const rpID = process.env.WEBAUTHN_RP_ID!; // e.g., 'example.com'
const origin = process.env.NEXT_PUBLIC_APP_URL!;

export async function getRegistrationOptions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { authenticators: true },
  });

  if (!user) throw new Error('User not found');

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.email!,
    userDisplayName: user.name || user.email!,
    attestationType: 'none',
    excludeCredentials: user.authenticators.map((auth) => ({
      id: Buffer.from(auth.credentialID, 'base64url'),
      type: 'public-key',
      transports: auth.transports as AuthenticatorTransport[],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  });

  // Store challenge
  await prisma.user.update({
    where: { id: userId },
    data: { currentChallenge: options.challenge },
  });

  return options;
}

export async function verifyRegistration(
  userId: string,
  response: RegistrationResponseJSON,
  deviceName?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.currentChallenge) throw new Error('No challenge found');

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: user.currentChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Verification failed');
  }

  const { credentialPublicKey, credentialID, counter } =
    verification.registrationInfo;

  // Store authenticator
  await prisma.authenticator.create({
    data: {
      userId,
      credentialID: Buffer.from(credentialID).toString('base64url'),
      credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      transports: response.response.transports || [],
      deviceName: deviceName || 'Passkey',
    },
  });

  // Clear challenge
  await prisma.user.update({
    where: { id: userId },
    data: { currentChallenge: null },
  });

  return { verified: true };
}

export async function getAuthenticationOptions(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { authenticators: true },
  });

  if (!user) throw new Error('User not found');

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: user.authenticators.map((auth) => ({
      id: Buffer.from(auth.credentialID, 'base64url'),
      type: 'public-key',
      transports: auth.transports as AuthenticatorTransport[],
    })),
    userVerification: 'preferred',
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { currentChallenge: options.challenge },
  });

  return { options, userId: user.id };
}

export async function verifyAuthentication(
  userId: string,
  response: AuthenticationResponseJSON
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { authenticators: true },
  });

  if (!user?.currentChallenge) throw new Error('No challenge found');

  const authenticator = user.authenticators.find(
    (auth) => auth.credentialID === response.id
  );

  if (!authenticator) throw new Error('Authenticator not found');

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: user.currentChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
      credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
      counter: authenticator.counter,
    },
  });

  if (!verification.verified) throw new Error('Verification failed');

  // Update counter
  await prisma.authenticator.update({
    where: { id: authenticator.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date(),
    },
  });

  // Clear challenge
  await prisma.user.update({
    where: { id: userId },
    data: { currentChallenge: null },
  });

  return { verified: true, userId };
}
```

### Passwordless Login Form

```tsx
// components/auth/passwordless-login.tsx
'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

type Method = 'magic-link' | 'otp' | 'passkey';

export function PasswordlessLogin() {
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<Method>('magic-link');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (method === 'magic-link') {
        await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        setMessage('Check your email for the magic link!');
      } else if (method === 'otp') {
        await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'email' }),
        });
        setStep('verify');
      } else if (method === 'passkey') {
        // Get authentication options
        const optionsRes = await fetch(`/api/auth/webauthn/authenticate?email=${encodeURIComponent(email)}`);
        const { options } = await optionsRes.json();

        // Start authentication
        const credential = await startAuthentication(options);

        // Verify
        const verifyRes = await fetch('/api/auth/webauthn/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, credential }),
        });

        if (verifyRes.ok) {
          window.location.href = '/dashboard';
        } else {
          throw new Error('Authentication failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode, type: 'email' }),
      });

      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (message) {
    return (
      <div className="text-center p-6">
        <div className="text-green-600 mb-4">✓</div>
        <p>{message}</p>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <form onSubmit={handleOTPVerify} className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter the 6-digit code sent to {email}
        </p>
        <input
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full p-3 border rounded text-center text-2xl tracking-widest"
          placeholder="000000"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || otpCode.length !== 6}
          className="w-full py-3 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
        <button
          type="button"
          onClick={() => setStep('email')}
          className="w-full text-sm text-gray-500"
        >
          Back
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="flex gap-2">
        {(['magic-link', 'otp', 'passkey'] as Method[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            className={`flex-1 py-2 text-sm rounded border ${
              method === m ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            {m === 'magic-link' && 'Magic Link'}
            {m === 'otp' && 'Email Code'}
            {m === 'passkey' && 'Passkey'}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Continue'}
      </button>
    </form>
  );
}
```

## Variants

### Conditional WebAuthn (Progressive Enhancement)

```tsx
// Check if WebAuthn is supported
const webAuthnSupported = 
  typeof window !== 'undefined' && 
  window.PublicKeyCredential !== undefined;

// Check if platform authenticator is available
const platformAuthAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
```

## Anti-Patterns

```typescript
// Bad: Long-lived magic links
const token = jwt.sign({ userId }, secret, { expiresIn: '7d' }); // Too long!

// Good: Short-lived tokens
const token = jwt.sign({ userId }, secret, { expiresIn: '15m' });

// Bad: Reusable OTPs
const otp = await prisma.otp.findFirst({ where: { code } });
// Token can be used multiple times!

// Good: Single-use tokens
const otp = await prisma.otp.findFirst({ where: { code, usedAt: null } });
await prisma.otp.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
```

## Related Skills

- `magic-links` - Magic link implementation
- `email-verification` - Email verification
- `session-management` - Session handling
- `two-factor` - 2FA as additional security

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial passwordless authentication pattern
