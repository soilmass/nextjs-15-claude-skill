---
id: pt-api-key-management
name: API Key Management
version: 1.0.0
layer: L5
category: auth
description: API key generation, rotation, scopes, and lifecycle management
tags: [auth, api-keys, security, rotation, scopes, next15]
composes: []
dependencies: []
formula: "APIKeyManagement = KeyGeneration + ScopePermissions + Rotation + Revocation + AuditLog"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Key Management

## When to Use

- Building APIs that need programmatic access
- Managing third-party integrations
- Implementing key rotation policies
- Tracking API usage per key
- Providing tiered access with scopes

## Composition Diagram

```
API Key Lifecycle
=================

+------------------------------------------+
|  Key Generation                          |
|  - Random secure key                     |
|  - Hash for storage                      |
|  - Prefix for identification             |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Scope Assignment                        |
|  - read:resource, write:resource         |
|  - Granular permissions                  |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Active Key Usage                        |
|  - Validation on each request            |
|  - Rate limiting per key                 |
|  - Usage tracking                        |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Rotation / Revocation                   |
|  - Scheduled rotation                    |
|  - Immediate revocation                  |
|  - Grace period for old keys             |
+------------------------------------------+
```

## Database Schema

```prisma
// prisma/schema.prisma
model ApiKey {
  id            String    @id @default(cuid())
  name          String
  keyHash       String    @unique
  keyPrefix     String
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  scopes        String[]
  environment   String    @default("production") // production, staging, test
  expiresAt     DateTime?
  lastUsedAt    DateTime?
  lastRotatedAt DateTime?
  revokedAt     DateTime?
  createdAt     DateTime  @default(now())
  rotationSchedule Int?   // Days between rotations

  @@index([keyPrefix])
  @@index([userId])
}
```

## Key Generation Service

```typescript
// lib/api-keys/generator.ts
import crypto from 'crypto';

const KEY_PREFIX_MAP = {
  production: 'sk_live_',
  staging: 'sk_staging_',
  test: 'sk_test_',
} as const;

export function generateApiKey(environment: keyof typeof KEY_PREFIX_MAP = 'production') {
  const prefix = KEY_PREFIX_MAP[environment];
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `${prefix}${randomBytes}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const keyPrefix = key.slice(0, 12);

  return { key, keyHash, keyPrefix };
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function validateKeyFormat(key: string): boolean {
  return /^sk_(live|staging|test)_[a-f0-9]{64}$/.test(key);
}
```

## Scope Management

```typescript
// lib/api-keys/scopes.ts
export const AVAILABLE_SCOPES = {
  'read:users': 'Read user data',
  'write:users': 'Create and update users',
  'delete:users': 'Delete users',
  'read:posts': 'Read posts',
  'write:posts': 'Create and update posts',
  'delete:posts': 'Delete posts',
  'read:analytics': 'View analytics data',
  'admin:*': 'Full administrative access',
} as const;

export type Scope = keyof typeof AVAILABLE_SCOPES;

export function hasRequiredScopes(keyScopes: string[], required: string[]): boolean {
  return required.every((scope) => {
    if (keyScopes.includes('admin:*')) return true;
    if (keyScopes.includes(scope)) return true;

    const [resource, action] = scope.split(':');
    return keyScopes.includes(`${resource}:*`) || keyScopes.includes(`*:${action}`);
  });
}

export function getScopeGroups(scopes: Scope[]): Record<string, Scope[]> {
  return scopes.reduce((groups, scope) => {
    const [resource] = scope.split(':');
    if (!groups[resource]) groups[resource] = [];
    groups[resource].push(scope);
    return groups;
  }, {} as Record<string, Scope[]>);
}
```

## Key Rotation Service

```typescript
// lib/api-keys/rotation.ts
import { prisma } from '@/lib/db';
import { generateApiKey } from './generator';

export async function rotateApiKey(keyId: string, userId: string): Promise<{
  newKey: string;
  oldKeyValidUntil: Date;
} | null> {
  const existingKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId, revokedAt: null },
  });

  if (!existingKey) return null;

  const { key: newKey, keyHash, keyPrefix } = generateApiKey(
    existingKey.environment as 'production' | 'staging' | 'test'
  );

  // Grace period: old key valid for 24 hours
  const gracePeriod = 24 * 60 * 60 * 1000;
  const oldKeyValidUntil = new Date(Date.now() + gracePeriod);

  await prisma.$transaction([
    // Update existing key with expiration
    prisma.apiKey.update({
      where: { id: keyId },
      data: { expiresAt: oldKeyValidUntil },
    }),
    // Create new key
    prisma.apiKey.create({
      data: {
        name: `${existingKey.name} (rotated)`,
        keyHash,
        keyPrefix,
        userId,
        scopes: existingKey.scopes,
        environment: existingKey.environment,
        expiresAt: existingKey.expiresAt,
        rotationSchedule: existingKey.rotationSchedule,
        lastRotatedAt: new Date(),
      },
    }),
  ]);

  return { newKey, oldKeyValidUntil };
}

// Scheduled rotation check
export async function checkScheduledRotations() {
  const keysNeedingRotation = await prisma.apiKey.findMany({
    where: {
      revokedAt: null,
      rotationSchedule: { not: null },
      OR: [
        { lastRotatedAt: null },
        {
          lastRotatedAt: {
            lt: new Date(Date.now() - 1000 * 60 * 60 * 24), // At least 1 day old
          },
        },
      ],
    },
  });

  for (const key of keysNeedingRotation) {
    const daysSinceRotation = key.lastRotatedAt
      ? Math.floor((Date.now() - key.lastRotatedAt.getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    if (daysSinceRotation >= (key.rotationSchedule || 90)) {
      // Notify user about pending rotation
      await notifyRotationNeeded(key);
    }
  }
}
```

## API Key Management Endpoints

```typescript
// app/api/keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { generateApiKey } from '@/lib/api-keys/generator';
import { z } from 'zod';

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1),
  environment: z.enum(['production', 'staging', 'test']).default('production'),
  expiresInDays: z.number().min(1).max(365).optional(),
  rotationSchedule: z.number().min(7).max(365).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const data = createKeySchema.parse(body);

  const { key, keyHash, keyPrefix } = generateApiKey(data.environment);

  const apiKey = await prisma.apiKey.create({
    data: {
      name: data.name,
      keyHash,
      keyPrefix,
      userId: session.user.id,
      scopes: data.scopes,
      environment: data.environment,
      expiresAt: data.expiresInDays
        ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
        : null,
      rotationSchedule: data.rotationSchedule,
    },
  });

  return NextResponse.json({
    key, // Only returned once
    id: apiKey.id,
    prefix: keyPrefix,
    message: 'Store this key securely. It cannot be retrieved again.',
  }, { status: 201 });
}

// app/api/keys/[id]/rotate/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const result = await rotateApiKey(id, session.user.id);

  if (!result) {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 });
  }

  return NextResponse.json({
    newKey: result.newKey,
    oldKeyValidUntil: result.oldKeyValidUntil,
    message: 'Key rotated. Old key valid until the specified time.',
  });
}
```

## Key Management UI

```typescript
// components/api-keys/key-management.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCw, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function ApiKeyCard({ apiKey }: { apiKey: ApiKey }) {
  const queryClient = useQueryClient();
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  const rotateMutation = useMutation({
    mutationFn: () => fetch(`/api/keys/${apiKey.id}/rotate`, { method: 'POST' }).then(r => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Key rotated', {
        description: `Old key valid until ${new Date(data.oldKeyValidUntil).toLocaleString()}`,
      });
    },
  });

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{apiKey.name}</h3>
          <code className="text-sm text-muted-foreground">{apiKey.keyPrefix}...</code>
        </div>
        <Badge variant={apiKey.environment === 'production' ? 'default' : 'secondary'}>
          {apiKey.environment}
        </Badge>
      </div>

      <div className="flex gap-1 mt-2">
        {apiKey.scopes.map((scope) => (
          <Badge key={scope} variant="outline" className="text-xs">
            {scope}
          </Badge>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button size="sm" variant="outline" onClick={() => rotateMutation.mutate()}>
          <RotateCw className="h-4 w-4 mr-1" />
          Rotate
        </Button>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Store Plain Text Keys

```typescript
// BAD
await prisma.apiKey.create({
  data: { key: rawKey }, // Vulnerable!
});

// GOOD
const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
await prisma.apiKey.create({
  data: { keyHash },
});
```

## Related Skills

- [api-keys](./api-keys.md)
- [rate-limiting](./rate-limiting.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Key generation and hashing
- Scope management
- Rotation with grace period
