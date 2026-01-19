---
id: pt-route-handlers
name: Route Handlers
version: 2.0.0
layer: L5
category: data
description: Build REST APIs with Next.js Route Handlers in the App Router
tags: [api, route-handlers, rest, next15]
composes: []
dependencies: []
formula: "RouteHandler = HTTPMethod + RequestValidation + ResponseFormatting + ErrorHandling"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Route Handlers

## When to Use

- Building REST APIs in Next.js App Router
- Handling form submissions that return JSON responses
- Creating webhook endpoints for third-party services
- Implementing file upload/download endpoints
- Building authentication endpoints (login, logout, token refresh)
- Creating proxy endpoints for external APIs

## Composition Diagram

```
[Client Request] --HTTP--> [Route Handler]
                                 |
                    +------------+------------+
                    |            |            |
              [Validation]  [Auth Check]  [Rate Limit]
                    |            |            |
                    +------------+------------+
                                 |
                          [Business Logic]
                                 |
                    +------------+------------+
                    |            |            |
              [Database]   [External API]  [Cache]
                    |            |            |
                    +------------+------------+
                                 |
                          [Response Formatting]
                                 |
                          [HTTP Response]
```

## Overview

Route Handlers in Next.js 15 replace API routes from the pages directory. They use Web Request and Response APIs, support streaming, and can be co-located with pages. Route handlers are server-only and support all HTTP methods.

## Basic Route Handler

```typescript
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello, World!' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

## Dynamic Route Handlers

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// GET /api/users/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

// PATCH /api/users/:id
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: parsed,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(user);
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

// DELETE /api/users/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.user.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
```

## Query Parameters

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Parse query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category');
  const sortBy = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  // Build filter
  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(category && { categoryId: category }),
  };

  // Execute query
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: order },
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

## Request Validation

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  published: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  // Auth check
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const data = createPostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        ...data,
        slug: generateSlug(data.title),
        authorId: session.user.id,
        tags: {
          connectOrCreate: data.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag, slug: generateSlug(tag) },
          })),
        },
      },
      include: { author: true, tags: true },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Headers and Cookies

```typescript
// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { verifyToken, createToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const payload = await verifyToken(token);
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate credentials and get user
  const user = await validateCredentials(body.email, body.password);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // Create token
  const token = await createToken({ userId: user.id, email: user.email });

  // Set cookie
  const response = NextResponse.json({ success: true, user });
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}
```

## Streaming Response

```typescript
// app/api/stream/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Simulate streaming data
      for (let i = 0; i < 10; i++) {
        const data = { chunk: i, timestamp: Date.now() };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// Streaming JSON array
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('['));

      const items = await fetchLargeDataset();
      for (let i = 0; i < items.length; i++) {
        const prefix = i === 0 ? '' : ',';
        controller.enqueue(
          encoder.encode(prefix + JSON.stringify(items[i]))
        );
      }

      controller.enqueue(encoder.encode(']'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

## File Upload

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

## CORS Configuration

```typescript
// app/api/public/route.ts
import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://example.com',
  'https://app.example.com',
];

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
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
  const data = { message: 'Public API' };

  return NextResponse.json(data, {
    headers: getCorsHeaders(origin),
  });
}
```

## Route Configuration

```typescript
// app/api/static/route.ts
import { NextResponse } from 'next/server';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const data = await fetchStaticData();
  return NextResponse.json(data);
}

// app/api/dynamic/route.ts
// Force dynamic (no caching)
export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchDynamicData();
  return NextResponse.json(data);
}

// app/api/edge/route.ts
// Run on the edge
export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ edge: true });
}
```

## Anti-patterns

### Don't Forget Error Handling

```typescript
// BAD - Unhandled errors crash the route
export async function GET() {
  const data = await riskyOperation();
  return NextResponse.json(data);
}

// GOOD - Proper error handling
export async function GET() {
  try {
    const data = await riskyOperation();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

### Don't Expose Internal Errors

```typescript
// BAD - Leaks implementation details
catch (error) {
  return NextResponse.json({ error: error.message });
}

// GOOD - Generic message, log details
catch (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { error: 'Failed to fetch data' },
    { status: 500 }
  );
}
```

## Related Skills

- [server-actions](./server-actions.md)
- [webhooks](./webhooks.md)
- [rate-limiting](./rate-limiting.md)
- [auth-middleware](./auth-middleware.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Dynamic routes
- Query parameters
- Request validation
- Streaming responses
- File upload
- CORS configuration
