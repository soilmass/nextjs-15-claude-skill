---
id: pt-two-factor
name: Two-Factor Authentication
version: 2.0.0
layer: L5
category: auth
description: Add TOTP-based two-factor authentication for enhanced security
tags: [auth, 2fa, totp, security, next15, react19]
composes: []
dependencies: []
formula: "TwoFactorSetup = Dialog + (QRCode | ManualCode) + OTPInput + BackupCodesDisplay"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Two-Factor Authentication

## When to Use

- When you need an extra layer of security beyond passwords
- For applications handling sensitive data (finance, healthcare, enterprise)
- When compliance requires multi-factor authentication
- To protect high-value user accounts
- As an optional security feature users can enable

## Composition Diagram

```
+------------------------------------------+
|          TwoFactorSetupDialog            |
|  +------------------------------------+  |
|  |           QR Code Display          |  |
|  |  +----------------------------+    |  |
|  |  |         QRCode             |    |  |
|  |  +----------------------------+    |  |
|  |  | Manual Code + Copy Button  |    |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |           OTP Input                |  |
|  |  [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  |      BackupCodesDisplay            |  |
|  |  +------+  +------+  +------+      |  |
|  |  |CODE1 |  |CODE2 |  |CODE3 |      |  |
|  |  +------+  +------+  +------+      |  |
|  +------------------------------------+  |
|  [ Enable 2FA Button ]                   |
+------------------------------------------+
```

## Overview

Two-factor authentication (2FA) adds an extra layer of security by requiring a time-based one-time password (TOTP) in addition to the primary authentication method. This pattern covers TOTP setup, verification, backup codes, and integration with NextAuth.js.

## Database Schema

```prisma
// prisma/schema.prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  password          String?
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?   // Encrypted TOTP secret
  backupCodes       String[]  // Hashed backup codes
  
  // ... other fields
}

model TwoFactorConfirmation {
  id        String   @id @default(cuid())
  userId    String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## TOTP Utilities

```typescript
// lib/two-factor.ts
import { authenticator } from 'otplib';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

// Configure TOTP
authenticator.options = {
  digits: 6,
  step: 30,
  window: 1, // Allow 1 step before/after for clock drift
};

// Encryption for storing secrets
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Generate TOTP secret
export function generateTwoFactorSecret(): string {
  return authenticator.generateSecret();
}

// Generate QR code URL
export function getTwoFactorQRCode(
  secret: string,
  email: string,
  issuer: string = 'MyApp'
): string {
  return authenticator.keyuri(email, issuer, secret);
}

// Verify TOTP code
export function verifyTwoFactorCode(secret: string, code: string): boolean {
  return authenticator.verify({ token: code, secret });
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

// Hash backup code for storage
function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Store 2FA setup
export async function enableTwoFactor(
  userId: string,
  secret: string
): Promise<string[]> {
  const encryptedSecret = encrypt(secret);
  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encryptedSecret,
      twoFactorEnabled: true,
      backupCodes: hashedBackupCodes,
    },
  });

  return backupCodes;
}

// Verify and use backup code
export async function verifyBackupCode(
  userId: string,
  code: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { backupCodes: true },
  });

  if (!user) return false;

  const hashedCode = hashBackupCode(code.toUpperCase().replace(/\s/g, ''));
  const codeIndex = user.backupCodes.indexOf(hashedCode);

  if (codeIndex === -1) return false;

  // Remove used backup code
  const newBackupCodes = [...user.backupCodes];
  newBackupCodes.splice(codeIndex, 1);

  await prisma.user.update({
    where: { id: userId },
    data: { backupCodes: newBackupCodes },
  });

  return true;
}

// Get decrypted secret for verification
export async function getUserTwoFactorSecret(
  userId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true },
  });

  if (!user?.twoFactorSecret) return null;

  return decrypt(user.twoFactorSecret);
}
```

## Setup Flow

```typescript
// app/actions/two-factor.ts
'use server';

import { auth } from '@/auth';
import {
  generateTwoFactorSecret,
  getTwoFactorQRCode,
  verifyTwoFactorCode,
  enableTwoFactor,
  getUserTwoFactorSecret,
} from '@/lib/two-factor';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface SetupResponse {
  secret: string;
  qrCodeUrl: string;
}

export async function initiateTwoFactorSetup(): Promise<SetupResponse> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const secret = generateTwoFactorSecret();
  const qrCodeUrl = getTwoFactorQRCode(secret, session.user.email!, 'MyApp');

  // Store temporarily (you might want to use Redis or session)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret }, // Will be encrypted on confirmation
  });

  return { secret, qrCodeUrl };
}

export async function confirmTwoFactorSetup(
  code: string
): Promise<{ backupCodes: string[] } | { error: string }> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorSecret) {
    return { error: 'Setup not initiated' };
  }

  if (user.twoFactorEnabled) {
    return { error: '2FA already enabled' };
  }

  // Verify the code before enabling
  const isValid = verifyTwoFactorCode(user.twoFactorSecret, code);

  if (!isValid) {
    return { error: 'Invalid verification code' };
  }

  // Enable 2FA and get backup codes
  const backupCodes = await enableTwoFactor(
    session.user.id,
    user.twoFactorSecret
  );

  revalidatePath('/settings/security');

  return { backupCodes };
}

export async function disableTwoFactor(
  code: string
): Promise<{ success: boolean } | { error: string }> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const secret = await getUserTwoFactorSecret(session.user.id);

  if (!secret) {
    return { error: '2FA not enabled' };
  }

  const isValid = verifyTwoFactorCode(secret, code);

  if (!isValid) {
    return { error: 'Invalid verification code' };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
    },
  });

  revalidatePath('/settings/security');

  return { success: true };
}
```

## Setup Components

```typescript
// components/two-factor/setup-dialog.tsx
'use client';

import { useState } from 'react';
import { useQRCode } from 'next-qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { initiateTwoFactorSetup, confirmTwoFactorSetup } from '@/app/actions/two-factor';
import { Copy, Shield, Check } from 'lucide-react';

export function TwoFactorSetupDialog() {
  const { Canvas } = useQRCode();
  const [step, setStep] = useState<'start' | 'scan' | 'verify' | 'backup'>('start');
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const data = await initiateTwoFactorSetup();
      setSetupData(data);
      setStep('scan');
    } catch (err) {
      setError('Failed to initiate setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError('');

    const result = await confirmTwoFactorSetup(code);

    if ('error' in result) {
      setError(result.error);
    } else {
      setBackupCodes(result.backupCodes);
      setStep('backup');
    }

    setIsLoading(false);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Shield className="mr-2 h-4 w-4" />
          Enable Two-Factor Authentication
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === 'start' && (
          <>
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Add an extra layer of security to your account using an authenticator app.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You'll need an authenticator app like Google Authenticator, Authy, or 1Password.
              </p>
              <Button onClick={handleStart} disabled={isLoading} className="w-full">
                {isLoading ? 'Setting up...' : 'Get Started'}
              </Button>
            </div>
          </>
        )}

        {step === 'scan' && setupData && (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <Canvas
                  text={setupData.qrCodeUrl}
                  options={{ width: 200, margin: 2 }}
                />
              </div>
              <div className="space-y-2">
                <Label>Or enter this code manually:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {setupData.secret}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(setupData.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => setStep('verify')} className="w-full">
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle>Verify Setup</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleVerify}
                disabled={code.length !== 6 || isLoading}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </>
        )}

        {step === 'backup' && (
          <>
            <DialogHeader>
              <DialogTitle>
                <Check className="inline mr-2 h-5 w-5 text-green-500" />
                Two-Factor Enabled!
              </DialogTitle>
              <DialogDescription>
                Save these backup codes in a secure place.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Each backup code can only be used once. Store them securely - you won't see them again.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                {backupCodes.map((code, i) => (
                  <div key={i}>{code}</div>
                ))}
              </div>
              <Button variant="outline" onClick={copyBackupCodes} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Backup Codes
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Login with 2FA

```typescript
// app/auth/two-factor/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { verifyTwoFactorLogin, verifyBackupCodeLogin } from '@/app/actions/auth';

export default function TwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const action = useBackupCode ? verifyBackupCodeLogin : verifyTwoFactorLogin;
    const result = await action(code);

    if ('error' in result) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="text-muted-foreground mt-2">
            {useBackupCode
              ? 'Enter one of your backup codes'
              : 'Enter the code from your authenticator app'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              {useBackupCode ? 'Backup Code' : 'Authentication Code'}
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
              className={useBackupCode ? '' : 'text-center text-2xl tracking-widest'}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
              setError('');
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {useBackupCode
              ? 'Use authenticator app instead'
              : 'Use a backup code instead'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Store Secrets Unencrypted

```typescript
// BAD - Plain text secret
await prisma.user.update({
  data: { twoFactorSecret: secret },
});

// GOOD - Encrypted secret
await prisma.user.update({
  data: { twoFactorSecret: encrypt(secret) },
});
```

### Don't Skip Rate Limiting

```typescript
// BAD - Unlimited attempts
async function verify(code: string) {
  return verifyTwoFactorCode(secret, code);
}

// GOOD - Rate limit verification attempts
async function verify(userId: string, code: string) {
  const { success } = await ratelimit.limit(`2fa:${userId}`);
  if (!success) throw new Error('Too many attempts');
  return verifyTwoFactorCode(secret, code);
}
```

## Related Skills

- [next-auth](./next-auth.md)
- [session-management](./session-management.md)
- [password-reset](./password-reset.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- TOTP setup and verification
- Backup codes
- Login flow integration
- Encrypted secret storage
