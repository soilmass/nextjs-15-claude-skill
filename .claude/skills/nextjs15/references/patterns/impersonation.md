---
id: pt-impersonation
name: Impersonation
version: 2.0.0
layer: L5
category: auth
description: Implement secure user impersonation for admin support in Next.js 15
tags: [auth, impersonation]
composes: []
dependencies: []
formula: "Impersonation = AdminCheck + ImpersonationToken + Banner (timer + end) + AuditLog"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# User Impersonation Pattern

## When to Use

- For customer support to debug user-specific issues
- When admins need to see the app from a user's perspective
- For testing user-specific features without sharing credentials
- When troubleshooting permission or data issues
- For onboarding support and guided setup

## Composition Diagram

```
Impersonation System
====================

Admin Panel:
+------------------------------------------+
|  Impersonate User                        |
|  +------------------------------------+  |
|  | Search: [user@example.com      ]  |  |
|  +------------------------------------+  |
|  | Reason: [Support ticket #1234  ]  |  |
|  +------------------------------------+  |
|  [ Start Impersonation ]                 |
+------------------------------------------+

Active Impersonation Banner:
+------------------------------------------+
| [!] Impersonating: user@example.com      |
|     (as admin@company.com)               |
|     Reason: Support ticket #1234         |
|     Expires in: 45:30  [End Session]     |
+------------------------------------------+
```

## Overview

User impersonation allows admins to view the application as another user for support and debugging. This pattern covers implementing secure impersonation with proper audit logging and safeguards.

## Implementation

### Impersonation Service

```typescript
// lib/auth/impersonation.ts
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const IMPERSONATION_SECRET = new TextEncoder().encode(
  process.env.IMPERSONATION_SECRET!
);
const IMPERSONATION_COOKIE = 'impersonation_token';

interface ImpersonationToken {
  originalUserId: string;
  targetUserId: string;
  reason: string;
  expiresAt: number;
}

export class ImpersonationService {
  // Start impersonation
  async startImpersonation(
    adminUserId: string,
    targetUserId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    // Verify admin privileges
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { id: true, role: true, email: true },
    });

    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Don't allow impersonating other admins
    if (targetUser.role === 'admin' && targetUser.id !== adminUserId) {
      return { success: false, error: 'Cannot impersonate other admins' };
    }

    // Create impersonation token
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    const token = await new SignJWT({
      originalUserId: adminUserId,
      targetUserId,
      reason,
      expiresAt,
    } satisfies ImpersonationToken)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(IMPERSONATION_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    // Log the impersonation
    await this.logImpersonation(adminUserId, targetUserId, reason, 'start');

    return { success: true };
  }

  // End impersonation
  async endImpersonation(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get(IMPERSONATION_COOKIE)?.value;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, IMPERSONATION_SECRET);
        const data = payload as unknown as ImpersonationToken;

        // Log end of impersonation
        await this.logImpersonation(
          data.originalUserId,
          data.targetUserId,
          data.reason,
          'end'
        );
      } catch {
        // Token invalid or expired
      }
    }

    // Remove cookie
    cookieStore.delete(IMPERSONATION_COOKIE);
  }

  // Get current impersonation state
  async getImpersonationState(): Promise<{
    isImpersonating: boolean;
    originalUser?: { id: string; email: string };
    targetUser?: { id: string; email: string };
    reason?: string;
    expiresAt?: number;
  }> {
    const cookieStore = await cookies();
    const token = cookieStore.get(IMPERSONATION_COOKIE)?.value;

    if (!token) {
      return { isImpersonating: false };
    }

    try {
      const { payload } = await jwtVerify(token, IMPERSONATION_SECRET);
      const data = payload as unknown as ImpersonationToken;

      // Get user details
      const [originalUser, targetUser] = await Promise.all([
        prisma.user.findUnique({
          where: { id: data.originalUserId },
          select: { id: true, email: true },
        }),
        prisma.user.findUnique({
          where: { id: data.targetUserId },
          select: { id: true, email: true },
        }),
      ]);

      return {
        isImpersonating: true,
        originalUser: originalUser || undefined,
        targetUser: targetUser || undefined,
        reason: data.reason,
        expiresAt: data.expiresAt,
      };
    } catch {
      // Invalid or expired token
      return { isImpersonating: false };
    }
  }

  // Get effective user (impersonated or actual)
  async getEffectiveUser(actualUserId: string): Promise<string> {
    const state = await this.getImpersonationState();
    
    if (state.isImpersonating && state.targetUser) {
      return state.targetUser.id;
    }
    
    return actualUserId;
  }

  // Log impersonation events
  private async logImpersonation(
    adminId: string,
    targetId: string,
    reason: string,
    action: 'start' | 'end'
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: `impersonation_${action}`,
        resourceType: 'user',
        resourceId: targetId,
        metadata: {
          reason,
          targetUserId: targetId,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }
}

export const impersonationService = new ImpersonationService();
```

### Server Actions

```typescript
// app/actions/impersonation.ts
'use server';

import { auth } from '@/lib/auth';
import { impersonationService } from '@/lib/auth/impersonation';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function startImpersonation(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  const targetUserId = formData.get('userId') as string;
  const reason = formData.get('reason') as string;

  if (!targetUserId || !reason) {
    return { error: 'User ID and reason are required' };
  }

  const result = await impersonationService.startImpersonation(
    session.user.id,
    targetUserId,
    reason
  );

  if (result.success) {
    revalidatePath('/');
    redirect('/dashboard');
  }

  return { error: result.error };
}

export async function endImpersonation() {
  await impersonationService.endImpersonation();
  revalidatePath('/');
  redirect('/admin/users');
}
```

### Impersonation Banner

```tsx
// components/impersonation-banner.tsx
'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { endImpersonation } from '@/app/actions/impersonation';

interface ImpersonationState {
  isImpersonating: boolean;
  originalUser?: { id: string; email: string };
  targetUser?: { id: string; email: string };
  reason?: string;
  expiresAt?: number;
}

export function ImpersonationBanner({
  initialState,
}: {
  initialState: ImpersonationState;
}) {
  const [state, setState] = useState(initialState);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!state.isImpersonating || !state.expiresAt) return;

    const updateTimeLeft = () => {
      const remaining = state.expiresAt! - Date.now();
      if (remaining <= 0) {
        setState({ isImpersonating: false });
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [state.expiresAt, state.isImpersonating]);

  if (!state.isImpersonating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">
            Impersonating: {state.targetUser?.email}
          </span>
          <span className="text-sm opacity-75">
            (as {state.originalUser?.email})
          </span>
          <span className="text-sm bg-yellow-600 px-2 py-0.5 rounded">
            {state.reason}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">Expires in: {timeLeft}</span>
          <form action={endImpersonation}>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
              End Impersonation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### Admin User Management Page

```tsx
// app/admin/users/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { startImpersonation } from '@/app/actions/impersonation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="font-medium">{user.name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Role</dt>
            <dd className="font-medium">{user.role}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Posts</dt>
            <dd className="font-medium">{user._count.posts}</dd>
          </div>
        </dl>

        {/* Impersonation Form */}
        {user.role !== 'admin' && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-3">Support Actions</h3>
            <form action={startImpersonation} className="space-y-3">
              <input type="hidden" name="userId" value={user.id} />
              <div>
                <label className="block text-sm mb-1">
                  Reason for impersonation
                </label>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="e.g., Investigating reported bug #1234"
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
              >
                Impersonate User
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Layout with Impersonation Banner

```tsx
// app/layout.tsx
import { impersonationService } from '@/lib/auth/impersonation';
import { ImpersonationBanner } from '@/components/impersonation-banner';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const impersonationState = await impersonationService.getImpersonationState();

  return (
    <html lang="en">
      <body>
        <ImpersonationBanner initialState={impersonationState} />
        <div className={impersonationState.isImpersonating ? 'pt-12' : ''}>
          {children}
        </div>
      </body>
    </html>
  );
}
```

### Modified Auth to Support Impersonation

```typescript
// lib/auth/auth.ts
import { auth as nextAuth } from '@/auth';
import { impersonationService } from './impersonation';

export async function auth() {
  const session = await nextAuth();
  
  if (!session?.user) return null;

  const state = await impersonationService.getImpersonationState();
  
  if (state.isImpersonating && state.targetUser) {
    // Return session with impersonated user but preserve original admin ID
    return {
      ...session,
      user: {
        ...session.user,
        id: state.targetUser.id,
        email: state.targetUser.email,
        // Keep track of real admin
        originalUserId: state.originalUser?.id,
        isImpersonating: true,
      },
    };
  }

  return session;
}
```

## Variants

### Restricted Impersonation

```typescript
// Block certain actions while impersonating
export async function dangerousAction() {
  const session = await auth();
  
  if (session?.user?.isImpersonating) {
    return { error: 'This action cannot be performed while impersonating' };
  }
  
  // Proceed with action
}
```

## Anti-Patterns

```typescript
// Bad: No audit logging
await setImpersonationCookie(targetUserId);
// No record of who impersonated whom!

// Good: Always log impersonation events
await logImpersonation(adminId, targetId, reason, 'start');

// Bad: Allowing impersonation of admins
if (targetUser) {
  startImpersonation(targetUser.id); // Admin can impersonate other admins!
}

// Good: Prevent admin impersonation
if (targetUser.role === 'admin') {
  return { error: 'Cannot impersonate other admins' };
}
```

## Related Skills

- `session-management` - Session handling
- `rbac` - Role-based access control
- `jwt-tokens` - Token management
- `logging` - Audit logging

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial user impersonation pattern
