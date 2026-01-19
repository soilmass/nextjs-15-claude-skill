---
id: pt-api-routes
name: API Route Handlers
version: 1.1.0
layer: L5
category: api
description: Next.js 15 API route handlers with proper typing, validation, and error handling
tags: [api, routes, handlers, rest, next15]
composes: []
dependencies: []
formula: "APIRoutes = RouteHandler + Validation(Zod) + ErrorHandling + TypeSafety"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Route Handlers

## Overview

API Route Handlers in Next.js 15 provide a powerful way to build backend functionality directly within your Next.js application. They replace the older `pages/api` directory pattern with the App Router's file-based routing system, offering better colocation with your frontend code and improved TypeScript support.

Route handlers support all standard HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) and integrate seamlessly with Next.js features like caching, revalidation, and middleware. They run on the server and never expose sensitive code or credentials to the client, making them ideal for database operations, third-party API integrations, and webhook handling.

The App Router's route handlers also support streaming responses, making them suitable for AI applications, real-time data feeds, and large file downloads. With proper typing and validation using libraries like Zod, you can build type-safe APIs that catch errors at compile time rather than runtime.

## When to Use

- Building REST API endpoints for your frontend application
- Handling webhooks from external services (Stripe, GitHub, etc.)
- Creating backend-for-frontend (BFF) patterns to aggregate multiple APIs
- Processing form submissions that require server-side validation
- Building public APIs for third-party integrations
- Implementing authentication endpoints (login, logout, refresh tokens)
- Creating proxy endpoints to hide third-party API keys

## When NOT to Use

- **Simple data fetching**: Use Server Components with direct database access instead
- **Form submissions with UI feedback**: Use Server Actions for better progressive enhancement
- **Real-time bidirectional communication**: Use WebSockets or Server-Sent Events libraries
- **Static data**: Use `generateStaticParams` with static rendering instead

## Composition Diagram

```
API Route Architecture in Next.js 15
=====================================

                    ┌──────────────────────────────────┐
                    │          Client Request          │
                    │   (Browser, Mobile App, etc.)    │
                    └────────────────┬─────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────────┐
                    │         Next.js Middleware       │
                    │    (Authentication, Logging)     │
                    └────────────────┬─────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Route Handler                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Request Pipeline                      │   │
│  │                                                          │   │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────────────┐    │   │
│  │  │  Parse   │ → │ Validate │ → │ Business Logic   │    │   │
│  │  │  Input   │   │  (Zod)   │   │ (DB, External)   │    │   │
│  │  └──────────┘   └──────────┘   └──────────────────┘    │   │
│  │                                         │               │   │
│  │                                         ▼               │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │              Error Handler                        │  │   │
│  │  │   (Zod Errors, DB Errors, Custom Errors)         │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────────┐
                    │         NextResponse.json()      │
                    │   (Standardized JSON Response)   │
                    └──────────────────────────────────┘

File Structure:
===============
app/api/
  ├── users/
  │   ├── route.ts          → GET, POST /api/users
  │   └── [id]/
  │       └── route.ts      → GET, PUT, DELETE /api/users/:id
  ├── posts/
  │   ├── route.ts          → GET, POST /api/posts
  │   └── [slug]/
  │       └── route.ts      → GET /api/posts/:slug
  ├── webhooks/
  │   └── stripe/
  │       └── route.ts      → POST /api/webhooks/stripe
  └── health/
      └── route.ts          → GET /api/health
```

## Implementation

### Basic Route Handler

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const user = await prisma.user.create({
      data: body,
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

### Dynamic Route Parameters

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();

  try {
    const user = await prisma.user.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
}
```

### Request Validation with Zod

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleAPIError } from '@/lib/api/errors';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
  categoryId: z.string().cuid().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  published: z.enum(['true', 'false', 'all']).default('all'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { page, limit, published, sortBy, order } = querySchema.parse(searchParams);

    const where = published === 'all'
      ? {}
      : { published: published === 'true' };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          author: { select: { name: true, image: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        ...data,
        slug: generateSlug(data.title),
        authorId: 'current-user-id', // Get from session
      },
    });

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

### Middleware Wrapper Pattern

```typescript
// lib/api/with-auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

type User = { id: string; email: string; role: string };

type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  context: { user: User; params?: T }
) => Promise<NextResponse>;

export function withAuth<T = unknown>(
  handler: AuthenticatedHandler<T>,
  options?: { roles?: string[] }
) {
  return async (request: NextRequest, routeContext?: { params?: Promise<T> }) => {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    if (options?.roles && !options.roles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    const params = routeContext?.params ? await routeContext.params : undefined;

    return handler(request, {
      user: session.user as User,
      params: params as T,
    });
  };
}

// Usage in route handler
// app/api/admin/users/route.ts
import { withAuth } from '@/lib/api/with-auth';

async function handler(request: NextRequest, { user }: { user: User }) {
  // Only admins can access this
  const users = await prisma.user.findMany();
  return NextResponse.json({ data: users });
}

export const GET = withAuth(handler, { roles: ['admin'] });
```

### Error Handling Utility

```typescript
// lib/api/errors.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }

  static badRequest(message: string, details?: unknown) {
    return new APIError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new APIError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new APIError(403, message, 'FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new APIError(404, `${resource} not found`, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new APIError(409, message, 'CONFLICT');
  }

  static internal(message = 'Internal server error') {
    return new APIError(500, message, 'INTERNAL_ERROR');
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: formattedErrors },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        const field = (error.meta?.target as string[])?.join(', ') || 'field';
        return NextResponse.json(
          { error: `A record with this ${field} already exists`, code: 'DUPLICATE' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Resource not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: 'Related resource not found', code: 'FOREIGN_KEY_ERROR' },
          { status: 400 }
        );
    }
  }

  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

### CORS Configuration

```typescript
// app/api/public/route.ts
import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://example.com',
  'https://app.example.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000',
].filter(Boolean) as string[];

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const data = { message: 'Public API', timestamp: new Date().toISOString() };

  return NextResponse.json(data, { headers: getCorsHeaders(origin) });
}
```

### Streaming Response

```typescript
// app/api/stream/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Simulate real-time updates
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const message = {
          type: 'update',
          count: i + 1,
          timestamp: new Date().toISOString(),
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
      }

      // Send completion message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// Client-side usage
// const eventSource = new EventSource('/api/stream');
// eventSource.onmessage = (event) => console.log(JSON.parse(event.data));
```

### File Upload Handler

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop();
    const filename = `${nanoid()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

## Examples

### Example 1: E-commerce Product API

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleAPIError } from '@/lib/api/errors';

const productQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.enum(['true', 'false']).optional(),
  sort: z.enum(['price-asc', 'price-desc', 'newest', 'popular']).default('newest'),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = productQuerySchema.parse(params);

    const where: any = {};

    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice * 100;
      if (query.maxPrice) where.price.lte = query.maxPrice * 100;
    }
    if (query.inStock === 'true') {
      where.inventory = { gt: 0 };
    }

    const orderBy = {
      'price-asc': { price: 'asc' as const },
      'price-desc': { price: 'desc' as const },
      'newest': { createdAt: 'desc' as const },
      'popular': { soldCount: 'desc' as const },
    }[query.sort];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          category: { select: { name: true, slug: true } },
          images: { take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        price: p.price / 100,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Example 2: Webhook Handler with Signature Verification

```typescript
// app/api/webhooks/github/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/db';

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  const hmac = createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return signature === digest;
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!signature || !verifySignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = request.headers.get('x-github-event');
  const data = JSON.parse(payload);

  try {
    switch (event) {
      case 'push':
        await handlePushEvent(data);
        break;
      case 'pull_request':
        await handlePullRequestEvent(data);
        break;
      case 'issues':
        await handleIssueEvent(data);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handlePushEvent(data: any) {
  await prisma.deployment.create({
    data: {
      repository: data.repository.full_name,
      branch: data.ref.replace('refs/heads/', ''),
      commitSha: data.after,
      commitMessage: data.head_commit?.message,
      pusher: data.pusher.name,
      status: 'PENDING',
    },
  });
}

async function handlePullRequestEvent(data: any) {
  // Handle PR events
}

async function handleIssueEvent(data: any) {
  // Handle issue events
}
```

### Example 3: Rate-Limited API with Caching

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

const searchProducts = unstable_cache(
  async (query: string) => {
    return prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        published: true,
      },
      take: 20,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: { take: 1 },
      },
    });
  },
  ['product-search'],
  { revalidate: 60, tags: ['products'] }
);

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers }
    );
  }

  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400, headers }
    );
  }

  const products = await searchProducts(query);

  return NextResponse.json({ products }, { headers });
}
```

## Anti-patterns

### 1. Missing Error Handling

```typescript
// BAD - No error handling, crashes on invalid JSON or DB errors
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await prisma.user.create({ data: body });
  return NextResponse.json(user);
}

// GOOD - Comprehensive error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);
    const user = await prisma.user.create({ data: validatedData });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### 2. Trusting Client Data

```typescript
// BAD - Using client-provided user ID
export async function DELETE(request: NextRequest) {
  const { userId, postId } = await request.json();
  await prisma.post.delete({ where: { id: postId, authorId: userId } });
  return NextResponse.json({ success: true });
}

// GOOD - Get user ID from authenticated session
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = await request.json();
  await prisma.post.delete({
    where: { id: postId, authorId: session.user.id }
  });
  return NextResponse.json({ success: true });
}
```

### 3. Exposing Sensitive Data

```typescript
// BAD - Returning entire user object including password hash
export async function GET(request: NextRequest, { params }) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  return NextResponse.json(user);
}

// GOOD - Explicitly select safe fields
export async function GET(request: NextRequest, { params }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      // Never include: password, passwordResetToken, etc.
    },
  });
  return NextResponse.json({ data: user });
}
```

### 4. No Input Validation

```typescript
// BAD - Directly using params without validation
export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page');
  const limit = request.nextUrl.searchParams.get('limit');

  // page could be "abc", limit could be "99999999"
  const users = await prisma.user.findMany({
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });
}

// GOOD - Validate and constrain all inputs
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const { page, limit } = querySchema.parse(params);

  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

## Testing

### Unit Testing Route Handlers

```typescript
// __tests__/api/users.test.ts
import { GET, POST } from '@/app/api/users/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns paginated users', async () => {
      const mockUsers = [
        { id: '1', name: 'John', email: 'john@example.com', createdAt: new Date() },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/users?page=1&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.pagination.total).toBe(1);
    });

    it('handles search parameter', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/users?search=john');
      await GET(request);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('POST', () => {
    it('creates a new user', async () => {
      const newUser = { id: '1', name: 'Jane', email: 'jane@example.com' };
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: 'Jane', email: 'jane@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.name).toBe('Jane');
    });

    it('returns 400 for invalid data', async () => {
      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: '' }), // Invalid: missing email
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
```

### Integration Testing with Supertest

```typescript
// __tests__/api/integration/users.test.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import request from 'supertest';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  await app.prepare();
  server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });
});

afterAll(() => {
  server.close();
});

describe('Users API Integration', () => {
  it('GET /api/users returns list', async () => {
    const response = await request(server)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
  });

  it('POST /api/users creates user', async () => {
    const response = await request(server)
      .post('/api/users')
      .send({ name: 'Test User', email: 'test@example.com' })
      .expect(201);

    expect(response.body.data).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
    });
  });

  it('POST /api/users validates input', async () => {
    const response = await request(server)
      .post('/api/users')
      .send({ name: '' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
```

### Testing Auth-Protected Routes

```typescript
// __tests__/api/protected.test.ts
import { GET } from '@/app/api/admin/users/route';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';

jest.mock('@/auth');

describe('Protected Routes', () => {
  it('returns 401 when not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/admin/users');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('returns 403 when user lacks permission', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'user@example.com', role: 'user' },
    });

    const request = new NextRequest('http://localhost/api/admin/users');
    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it('returns data when user is admin', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com', role: 'admin' },
    });

    const request = new NextRequest('http://localhost/api/admin/users');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});
```

## Related Skills

- [server-actions](./server-actions.md) - For form handling with progressive enhancement
- [trpc](./trpc.md) - For type-safe API communication
- [authentication](./authentication.md) - For securing API routes
- [rate-limiting](./rate-limiting.md) - For protecting APIs from abuse
- [caching](./cache-headers.md) - For optimizing API performance

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive Overview section
- Added When NOT to Use section
- Expanded Composition Diagram with visual architecture
- Added file upload handler example
- Added three real-world examples (E-commerce, Webhooks, Rate-limiting)
- Expanded anti-patterns with 4 detailed examples
- Added comprehensive testing section with unit and integration tests
- Expanded error handling utility with more error types
- Added CORS configuration with dynamic origins

### 1.0.0 (2025-01-18)
- Initial implementation
- Route handler patterns
- Validation with Zod
- Error handling utilities
