---
id: pt-api-keys
name: API Key Authentication
version: 2.0.0
layer: L5
category: auth
description: Secure API endpoints with API key authentication
tags: [auth, api-keys, security, next15]
composes: []
dependencies: []
formula: "APIKeys = KeyGeneration (hashed) + ScopePermissions + RateLimiting + ManagementUI (create + revoke)"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Key Authentication

## When to Use

- For machine-to-machine API authentication
- When building public APIs for developers
- For webhook integrations requiring authentication
- When you need programmatic access without user sessions
- For third-party service integrations

## Composition Diagram

```
API Key Management
==================

Create Key Dialog:
+------------------------------------------+
|  Create API Key                          |
|  +------------------------------------+  |
|  | Name: [Production Integration   ] |  |
|  +------------------------------------+  |
|  | Scopes:                           |  |
|  |   [x] read:posts  [ ] write:posts |  |
|  |   [x] read:users  [ ] write:users |  |
|  +------------------------------------+  |
|  | Expires: [30 days v]              |  |
|  +------------------------------------+  |
|  [ Cancel ]  [ Create Key ]              |
+------------------------------------------+

New Key Display (one-time):
+------------------------------------------+
|  [!] Store this key securely             |
|  +------------------------------------+  |
|  | sk_live_a1b2c3d4e5f6g7h8i9... [Copy]| |
|  +------------------------------------+  |
|  This key will not be shown again.       |
+------------------------------------------+

Keys List:
+------------------------------------------+
|  API Keys                                |
|  +------------------------------------+  |
|  | Production     sk_live_...        |  |
|  | [read:posts] [read:users]         |  |
|  | Last used: 2 hours ago      [x]   |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Overview

API keys provide a simple way to authenticate machine-to-machine requests. This pattern covers generating secure API keys, storing them safely, implementing key validation, rate limiting per key, and managing key lifecycle.

## Database Schema

```prisma
// prisma/schema.prisma
model ApiKey {
  id          String    @id @default(cuid())
  name        String    // Description for the key
  key         String    @unique // Hashed key (prefix stored separately)
  prefix      String    // First 8 chars for identification
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  scopes      String[]  // Allowed operations: ['read:posts', 'write:posts']
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([prefix])
  @@index([userId])
}

model ApiKeyUsage {
  id        String   @id @default(cuid())
  keyId     String
  key       ApiKey   @relation(fields: [keyId], references: [id], onDelete: Cascade)
  endpoint  String
  method    String
  status    Int
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([keyId])
  @@index([createdAt])
}
```

## API Key Generation

```typescript
// lib/api-keys.ts
import crypto from 'crypto';
import { prisma } from '@/lib/db';

const API_KEY_PREFIX = 'sk_live_'; // or 'sk_test_' for test keys
const KEY_LENGTH = 32;

// Generate a new API key
export async function generateApiKey(
  userId: string,
  name: string,
  scopes: string[] = ['read'],
  expiresInDays?: number
): Promise<{ key: string; apiKey: any }> {
  // Generate random key
  const rawKey = crypto.randomBytes(KEY_LENGTH).toString('hex');
  const fullKey = `${API_KEY_PREFIX}${rawKey}`;
  
  // Hash for storage
  const hashedKey = crypto.createHash('sha256').update(fullKey).digest('hex');
  
  // Extract prefix for identification
  const prefix = fullKey.slice(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key: hashedKey,
      prefix,
      userId,
      scopes,
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    },
  });

  // Return the raw key only once - it cannot be retrieved later
  return { key: fullKey, apiKey };
}

// Validate an API key
export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  apiKey?: any;
  error?: string;
}> {
  if (!key.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: 'Invalid key format' };
  }

  const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!apiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (apiKey.revokedAt) {
    return { valid: false, error: 'API key has been revoked' };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { valid: true, apiKey };
}

// Check if key has required scopes
export function hasScope(apiKey: { scopes: string[] }, requiredScopes: string[]): boolean {
  return requiredScopes.every((scope) => {
    // Check exact match or wildcard
    return (
      apiKey.scopes.includes(scope) ||
      apiKey.scopes.includes('*') ||
      apiKey.scopes.some((s) => {
        const [resource, action] = scope.split(':');
        return s === `${resource}:*` || s === `*:${action}`;
      })
    );
  });
}

// Revoke an API key
export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!apiKey) return false;

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });

  return true;
}
```

## API Key Middleware

```typescript
// lib/with-api-key.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, hasScope } from './api-keys';
import { prisma } from '@/lib/db';

interface ApiKeyContext {
  apiKey: any;
  userId: string;
}

type ApiKeyHandler = (
  request: NextRequest,
  context: ApiKeyContext & { params?: any }
) => Promise<NextResponse>;

export function withApiKey(
  handler: ApiKeyHandler,
  options: { scopes?: string[] } = {}
) {
  return async (request: NextRequest, routeContext?: { params?: any }) => {
    // Extract API key from header
    const authHeader = request.headers.get('authorization');
    const apiKeyHeader = request.headers.get('x-api-key');

    let key: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      key = authHeader.slice(7);
    } else if (apiKeyHeader) {
      key = apiKeyHeader;
    }

    if (!key) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      );
    }

    // Validate key
    const { valid, apiKey, error } = await validateApiKey(key);

    if (!valid || !apiKey) {
      return NextResponse.json(
        { error: error || 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check scopes
    if (options.scopes && !hasScope(apiKey, options.scopes)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Log usage
    await prisma.apiKeyUsage.create({
      data: {
        keyId: apiKey.id,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        status: 200, // Will be updated if error
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    // Call handler with context
    return handler(request, {
      apiKey,
      userId: apiKey.userId,
      params: routeContext?.params,
    });
  };
}

// Usage in route handler
// app/api/v1/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withApiKey } from '@/lib/with-api-key';
import { prisma } from '@/lib/db';

async function handler(
  request: NextRequest,
  context: { apiKey: any; userId: string }
) {
  const posts = await prisma.post.findMany({
    where: { authorId: context.userId },
  });

  return NextResponse.json({ data: posts });
}

export const GET = withApiKey(handler, { scopes: ['read:posts'] });

async function createHandler(
  request: NextRequest,
  context: { apiKey: any; userId: string }
) {
  const body = await request.json();

  const post = await prisma.post.create({
    data: {
      ...body,
      authorId: context.userId,
    },
  });

  return NextResponse.json({ data: post }, { status: 201 });
}

export const POST = withApiKey(createHandler, { scopes: ['write:posts'] });
```

## API Key Management Endpoints

```typescript
// app/api/keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateApiKey } from '@/lib/api-keys';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1),
  expiresInDays: z.number().min(1).max(365).optional(),
});

// List user's API keys
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: keys });
}

// Create new API key
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, scopes, expiresInDays } = createKeySchema.parse(body);

    // Limit number of keys per user
    const existingCount = await prisma.apiKey.count({
      where: { userId: session.user.id, revokedAt: null },
    });

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum number of API keys reached' },
        { status: 400 }
      );
    }

    const { key, apiKey } = await generateApiKey(
      session.user.id,
      name,
      scopes,
      expiresInDays
    );

    return NextResponse.json(
      {
        data: {
          id: apiKey.id,
          key, // Only returned once!
          name: apiKey.name,
          prefix: apiKey.prefix,
          scopes: apiKey.scopes,
          expiresAt: apiKey.expiresAt,
        },
        message: 'Store this key securely. It will not be shown again.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}

// app/api/keys/[id]/route.ts
// Revoke API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const success = await revokeApiKey(id, session.user.id);

  if (!success) {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'API key revoked' });
}
```

## Rate Limiting Per API Key

```typescript
// lib/api-key-rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Different limits for different tiers
const rateLimiters: Record<string, Ratelimit> = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    prefix: 'ratelimit:apikey:free',
  }),
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'),
    prefix: 'ratelimit:apikey:pro',
  }),
  enterprise: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10000, '1 h'),
    prefix: 'ratelimit:apikey:enterprise',
  }),
};

export async function checkApiKeyRateLimit(
  keyId: string,
  tier: string = 'free'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = rateLimiters[tier] || rateLimiters.free;
  return limiter.limit(keyId);
}

// Updated middleware with rate limiting
export function withApiKey(handler: ApiKeyHandler, options = {}) {
  return async (request: NextRequest, routeContext?: any) => {
    // ... validation code ...

    // Check rate limit
    const { success, limit, remaining, reset } = await checkApiKeyRateLimit(
      apiKey.id,
      apiKey.user.tier || 'free'
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = await handler(request, context);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
  };
}
```

## API Key Dashboard Component

```typescript
// components/api-keys/api-keys-list.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function ApiKeysList() {
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => fetch('/api/keys').then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; scopes: string[] }) =>
      fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      setNewKey(data.data.key);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key created');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/keys/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revoked');
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {newKey && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-medium text-green-800">Your new API key:</p>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 p-2 bg-white rounded border font-mono text-sm">
              {newKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(newKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Store this key securely. It won't be shown again.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {keys?.data?.map((key: any) => (
          <div
            key={key.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">{key.name}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {key.prefix}...
              </p>
              <div className="flex gap-1 mt-2">
                {key.scopes.map((scope: string) => (
                  <Badge key={scope} variant="secondary">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {key.lastUsedAt && (
                <span className="text-sm text-muted-foreground">
                  Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                </span>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => revokeMutation.mutate(key.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Store Raw Keys

```typescript
// BAD - Storing unhashed key
await prisma.apiKey.create({
  data: { key: rawKey }, // Vulnerable if database is compromised
});

// GOOD - Hash before storing
const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
await prisma.apiKey.create({
  data: { key: hashedKey },
});
```

### Don't Return Keys After Creation

```typescript
// BAD - Allowing key retrieval
export async function GET(request: NextRequest) {
  const key = await prisma.apiKey.findUnique({ ... });
  return NextResponse.json({ key: key.key }); // Never do this!
}

// GOOD - Only show prefix
export async function GET(request: NextRequest) {
  const key = await prisma.apiKey.findUnique({ ... });
  return NextResponse.json({ prefix: key.prefix });
}
```

## Related Skills

- [route-handlers](./route-handlers.md)
- [rate-limiting](./rate-limiting.md)
- [auth-middleware](./auth-middleware.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Key generation and validation
- Scope-based permissions
- Rate limiting per key
- Key management endpoints
- Dashboard component
