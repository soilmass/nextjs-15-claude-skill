---
id: pt-rate-limiting
name: Rate Limiting
version: 2.0.0
layer: L5
category: security
description: Protect APIs and routes from abuse with rate limiting
tags: [security, rate-limiting, api, middleware, next15]
composes: []
dependencies: []
formula: Upstash/Redis + Sliding Window + Headers = API Protection
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Protecting API routes from abuse and brute force attacks
- Implementing per-user or per-IP request limits
- Creating tiered rate limits based on subscription plans
- Rate limiting server actions for form submissions
- Preventing denial of service attacks

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Rate Limiting Architecture                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Request                                                    │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Identify Client                                      │   │
│  │ - IP Address (x-forwarded-for)                       │   │
│  │ - User ID (from session)                             │   │
│  │ - API Key (from header)                              │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Check Rate Limit (Upstash/Redis)                    │   │
│  │                                                     │   │
│  │ Sliding Window: 100 requests / 1 minute             │   │
│  │ Token Bucket:   10 tokens / 10s, max 100            │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│         ┌──────────────┴──────────────┐                    │
│         ▼                             ▼                    │
│  ┌────────────┐               ┌─────────────────┐         │
│  │ Allowed    │               │ Blocked (429)   │         │
│  │            │               │                 │         │
│  │ Continue   │               │ X-RateLimit-*   │         │
│  │ + Headers  │               │ Retry-After     │         │
│  └────────────┘               └─────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Rate Limiting

## Overview

Rate limiting protects your application from abuse, brute force attacks, and excessive API usage. This pattern covers middleware-based limiting, per-route limits, and distributed rate limiting with Redis.

## Upstash Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client
const redis = Redis.fromEnv();

// Different rate limiters for different use cases
export const rateLimiters = {
  // General API rate limit
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Strict limit for auth endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // Generous limit for static content
  static: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'),
    analytics: true,
    prefix: 'ratelimit:static',
  }),

  // Per-user limit
  user: new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(10, '10 s', 100), // 10 tokens per 10s, max 100
    analytics: true,
    prefix: 'ratelimit:user',
  }),
};

export type RateLimiterType = keyof typeof rateLimiters;

// Helper to get client identifier
export function getClientId(request: Request): string {
  // Try to get real IP from headers (behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback (won't work in production behind proxy)
  return 'anonymous';
}

// Check rate limit
export async function checkRateLimit(
  identifier: string,
  type: RateLimiterType = 'api'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = rateLimiters[type];
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
```

## Middleware Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip rate limiting for certain paths
  const skipPaths = ['/api/health', '/api/webhooks'];
  if (skipPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get identifier (IP or user ID)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const identifier = `${ip}:${request.nextUrl.pathname}`;

  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  // Set rate limit headers
  const response = success
    ? NextResponse.next()
    : NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );

  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  if (!success) {
    response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString());
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

## Per-Route Rate Limiting

```typescript
// lib/with-rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientId, RateLimiterType } from './rate-limit';

interface RateLimitOptions {
  type?: RateLimiterType;
  identifier?: (request: NextRequest) => string;
}

export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest, context?: any) => {
    const { type = 'api', identifier } = options;

    const id = identifier ? identifier(request) : getClientId(request);
    const { success, limit, remaining, reset } = await checkRateLimit(id, type);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
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

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
  };
}

// Usage in route handler
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/with-rate-limit';
import { prisma } from '@/lib/db';

async function handler(request: NextRequest) {
  const posts = await prisma.post.findMany({ take: 10 });
  return NextResponse.json(posts);
}

export const GET = withRateLimit(handler);

// With custom identifier (per-user limiting)
// app/api/user/posts/route.ts
import { auth } from '@/auth';

async function userPostsHandler(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... handler logic
}

export const GET = withRateLimit(userPostsHandler, {
  type: 'user',
  identifier: async (request) => {
    const session = await auth();
    return session?.user?.id || getClientId(request);
  },
});
```

## Server Action Rate Limiting

```typescript
// lib/rate-limited-action.ts
'use server';

import { headers } from 'next/headers';
import { checkRateLimit, RateLimiterType } from './rate-limit';

interface ActionResult<T> {
  data?: T;
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
}

export function rateLimitedAction<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  options: {
    type?: RateLimiterType;
    getIdentifier?: (...args: T) => Promise<string>;
  } = {}
) {
  return async (...args: T): Promise<ActionResult<R>> => {
    const { type = 'api', getIdentifier } = options;

    // Get identifier
    let identifier: string;
    if (getIdentifier) {
      identifier = await getIdentifier(...args);
    } else {
      const headersList = await headers();
      identifier =
        headersList.get('x-forwarded-for')?.split(',')[0] ||
        headersList.get('x-real-ip') ||
        'anonymous';
    }

    // Check rate limit
    const { success, reset } = await checkRateLimit(identifier, type);

    if (!success) {
      return {
        error: 'Too many requests',
        rateLimited: true,
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      };
    }

    try {
      const data = await action(...args);
      return { data };
    } catch (error) {
      return { error: 'Action failed' };
    }
  };
}

// Usage
// app/actions/posts.ts
'use server';

import { rateLimitedAction } from '@/lib/rate-limited-action';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const createPostAction = async (title: string, content: string) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  return prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
    },
  });
};

export const createPost = rateLimitedAction(createPostAction, {
  type: 'user',
  getIdentifier: async () => {
    const session = await auth();
    return session?.user?.id || 'anonymous';
  },
});

// In component
'use client';

import { createPost } from '@/app/actions/posts';
import { toast } from 'sonner';

async function handleSubmit(formData: FormData) {
  const result = await createPost(
    formData.get('title') as string,
    formData.get('content') as string
  );

  if (result.rateLimited) {
    toast.error(`Too many requests. Try again in ${result.retryAfter} seconds.`);
    return;
  }

  if (result.error) {
    toast.error(result.error);
    return;
  }

  toast.success('Post created!');
}
```

## In-Memory Rate Limiting (Development)

```typescript
// lib/rate-limit-memory.ts
// For development/testing without Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function memoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of store.entries()) {
      if (value.resetAt < now) store.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    // Create new entry
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count, reset: entry.resetAt };
}
```

## Different Limits by Plan

```typescript
// lib/plan-rate-limits.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/db';

const redis = Redis.fromEnv();

const planLimits = {
  free: { requests: 100, window: '1 d' as const },
  pro: { requests: 1000, window: '1 d' as const },
  enterprise: { requests: 10000, window: '1 d' as const },
};

export async function checkPlanRateLimit(userId: string) {
  // Get user's plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const plan = (user?.plan as keyof typeof planLimits) || 'free';
  const { requests, window } = planLimits[plan];

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:plan:${plan}`,
  });

  return limiter.limit(userId);
}
```

## Anti-patterns

### Don't Rate Limit by IP Alone

```typescript
// BAD - Shared IPs (corporate, mobile carriers) get blocked
const identifier = request.ip;

// GOOD - Combine with user ID when available
const userId = session?.user?.id;
const ip = request.ip;
const identifier = userId || ip;
```

### Don't Forget to Set Headers

```typescript
// BAD - No feedback to client
if (!success) {
  return new Response('Too many requests', { status: 429 });
}

// GOOD - Include rate limit headers
return new Response('Too many requests', {
  status: 429,
  headers: {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': '0',
    'Retry-After': retryAfter.toString(),
  },
});
```

## Related Skills

- [auth-middleware](./auth-middleware.md)
- [route-handlers](./route-handlers.md)
- [security](./security.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Upstash integration
- Middleware rate limiting
- Per-route limiting
- Server Action limiting
- Plan-based limits
