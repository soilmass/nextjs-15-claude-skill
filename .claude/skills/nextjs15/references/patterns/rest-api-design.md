---
id: pt-rest-api-design
name: Rest Api Design
version: 2.0.0
layer: L5
category: data
description: Design and implement RESTful APIs in Next.js 15 Route Handlers
tags: [data, rest, api, design]
composes: []
dependencies: []
formula: "REST API = ResourceRoutes + HTTPMethods + ValidationMiddleware + PaginatedResponses + ErrorHandling"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# REST API Design Pattern

## Overview

REST API design in Next.js 15 leverages Route Handlers to create scalable, well-structured APIs. This pattern covers resource modeling, HTTP method semantics, error handling, pagination, filtering, and documentation.

## When to Use

- Building public or internal APIs for your Next.js application
- Creating CRUD operations for database resources
- Designing APIs that will be consumed by mobile apps or third parties
- Need for standard HTTP semantics and predictable URL patterns
- Implementing paginated, filterable list endpoints

## Composition Diagram

```
[Client Request] --> [Route Handler]
                          |
                    [Auth Middleware]
                          |
                    [Validation (Zod)]
                          |
            +-------------+-------------+
            |             |             |
          [GET]        [POST]        [PATCH/DELETE]
            |             |             |
      [Pagination]  [Create Resource] [Update/Remove]
            |             |             |
      [Filter/Sort]  [Return 201]   [Return 200]
            |
      [Return List with Meta]
```

## Implementation

### Resource-Based Route Structure

```
app/
├── api/
│   ├── users/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/
│   │       └── route.ts          # GET, PATCH, DELETE
│   ├── posts/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── comments/
│   │           └── route.ts      # Nested resource
│   └── auth/
│       ├── login/
│       │   └── route.ts
│       └── logout/
│           └── route.ts
```

### Base API Utilities

```typescript
// lib/api/utils.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, z } from 'zod';

// Standard API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

// Success response helper
export function apiSuccess<T>(
  data: T,
  meta?: ApiResponse['meta'],
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data, meta },
    { status }
  );
}

// Error response helper
export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

// Common errors
export const errors = {
  badRequest: (message = 'Bad request', details?: unknown) =>
    apiError('BAD_REQUEST', message, 400, details),
  unauthorized: (message = 'Unauthorized') =>
    apiError('UNAUTHORIZED', message, 401),
  forbidden: (message = 'Forbidden') =>
    apiError('FORBIDDEN', message, 403),
  notFound: (resource = 'Resource') =>
    apiError('NOT_FOUND', `${resource} not found`, 404),
  conflict: (message = 'Conflict') =>
    apiError('CONFLICT', message, 409),
  validationError: (details: unknown) =>
    apiError('VALIDATION_ERROR', 'Validation failed', 422, details),
  internal: (message = 'Internal server error') =>
    apiError('INTERNAL_ERROR', message, 500),
};

// Request body parser with validation
export async function parseBody<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        data: null,
        error: errors.validationError(result.error.flatten()),
      };
    }

    return { data: result.data, error: null };
  } catch {
    return {
      data: null,
      error: errors.badRequest('Invalid JSON body'),
    };
  }
}

// Query params parser
export function parseQuery<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): { data: z.infer<T>; error: null } | { data: null; error: NextResponse } {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      data: null,
      error: errors.validationError(result.error.flatten()),
    };
  }

  return { data: result.data, error: null };
}

// Pagination helper
export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function getPagination(
  request: NextRequest,
  defaults = { page: 1, pageSize: 10, maxPageSize: 100 }
): PaginationParams {
  const params = request.nextUrl.searchParams;
  
  const page = Math.max(1, parseInt(params.get('page') || String(defaults.page), 10));
  const pageSize = Math.min(
    defaults.maxPageSize,
    Math.max(1, parseInt(params.get('pageSize') || String(defaults.pageSize), 10))
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  pagination: PaginationParams
) {
  return apiSuccess(items, {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
    totalPages: Math.ceil(total / pagination.pageSize),
  });
}
```

### Users Resource

```typescript
// app/api/users/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  apiSuccess,
  errors,
  parseBody,
  parseQuery,
  getPagination,
  paginatedResponse,
} from '@/lib/api/utils';

// Query schema
const listQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  sort: z.enum(['createdAt', 'name', 'email']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Create schema
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).optional().default('user'),
});

// GET /api/users - List users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return errors.forbidden('Admin access required');
    }

    const { data: query, error: queryError } = parseQuery(request, listQuerySchema);
    if (queryError) return queryError;

    const pagination = getPagination(request);

    const where = {
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.role && { role: query.role }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { [query.sort]: query.order },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(users, total, pagination);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return errors.internal();
  }
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return errors.forbidden('Admin access required');
    }

    const { data, error } = await parseBody(request, createUserSchema);
    if (error) return error;

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return errors.conflict('Email already registered');
    }

    // Hash password
    const { hash } = await import('bcryptjs');
    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return apiSuccess(user, undefined, 201);
  } catch (error) {
    console.error('POST /api/users error:', error);
    return errors.internal();
  }
}
```

### Single User Resource

```typescript
// app/api/users/[id]/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { apiSuccess, errors, parseBody } from '@/lib/api/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

// GET /api/users/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    // Users can view themselves, admins can view anyone
    if (!session?.user) {
      return errors.unauthorized();
    }

    if (session.user.id !== id && !session.user.isAdmin) {
      return errors.forbidden();
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!user) {
      return errors.notFound('User');
    }

    return apiSuccess(user);
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return errors.internal();
  }
}

// PATCH /api/users/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return errors.unauthorized();
    }

    // Users can update themselves, admins can update anyone
    const canUpdateRole = session.user.isAdmin;
    if (session.user.id !== id && !session.user.isAdmin) {
      return errors.forbidden();
    }

    const { data, error } = await parseBody(request, updateUserSchema);
    if (error) return error;

    // Non-admins cannot change role
    if (data.role && !canUpdateRole) {
      return errors.forbidden('Cannot change role');
    }

    // Check email uniqueness if changing email
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existingUser) {
        return errors.conflict('Email already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error);
    return errors.internal();
  }
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return errors.forbidden('Admin access required');
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      return errors.badRequest('Cannot delete yourself');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errors.notFound('User');
    }

    await prisma.user.delete({ where: { id } });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return errors.internal();
  }
}
```

### Nested Resource (User Posts)

```typescript
// app/api/users/[id]/posts/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  apiSuccess,
  errors,
  parseBody,
  getPagination,
  paginatedResponse,
} from '@/lib/api/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().optional().default(false),
});

// GET /api/users/[id]/posts
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    const pagination = getPagination(request);

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errors.notFound('User');
    }

    // Non-authors only see published posts
    const isAuthor = session?.user?.id === id;
    const where = {
      authorId: id,
      ...(!isAuthor && { published: true }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.post.count({ where }),
    ]);

    return paginatedResponse(posts, total, pagination);
  } catch (error) {
    console.error('GET /api/users/[id]/posts error:', error);
    return errors.internal();
  }
}

// POST /api/users/[id]/posts
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.id !== id) {
      return errors.forbidden('Can only create posts for yourself');
    }

    const { data, error } = await parseBody(request, createPostSchema);
    if (error) return error;

    const post = await prisma.post.create({
      data: {
        ...data,
        authorId: id,
      },
    });

    return apiSuccess(post, undefined, 201);
  } catch (error) {
    console.error('POST /api/users/[id]/posts error:', error);
    return errors.internal();
  }
}
```

### Middleware for API Routes

```typescript
// lib/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { errors } from './utils';

type Handler = (request: NextRequest, context: any) => Promise<NextResponse>;

// Authentication middleware
export function withAuth(handler: Handler, options?: { adminOnly?: boolean }): Handler {
  return async (request, context) => {
    const session = await auth();

    if (!session?.user) {
      return errors.unauthorized();
    }

    if (options?.adminOnly && !session.user.isAdmin) {
      return errors.forbidden('Admin access required');
    }

    return handler(request, context);
  };
}

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function withRateLimit(
  handler: Handler,
  options = { limit: 100, windowMs: 60000 }
): Handler {
  return async (request, context) => {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    
    const record = rateLimitMap.get(ip);
    
    if (!record || record.resetAt < now) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + options.windowMs });
    } else if (record.count >= options.limit) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)),
          },
        }
      );
    } else {
      record.count++;
    }

    return handler(request, context);
  };
}

// Combine middlewares
export function withMiddleware(handler: Handler, ...middlewares: ((h: Handler) => Handler)[]) {
  return middlewares.reduceRight((h, middleware) => middleware(h), handler);
}

// Usage
// export const GET = withMiddleware(getHandler, withAuth, withRateLimit);
```

## Variants

### HATEOAS Links

```typescript
// Add hypermedia links to responses
function addLinks(resource: any, baseUrl: string, type: string) {
  return {
    ...resource,
    _links: {
      self: { href: `${baseUrl}/${type}s/${resource.id}` },
      collection: { href: `${baseUrl}/${type}s` },
      ...(type === 'post' && {
        author: { href: `${baseUrl}/users/${resource.authorId}` },
        comments: { href: `${baseUrl}/posts/${resource.id}/comments` },
      }),
    },
  };
}
```

## Anti-Patterns

```typescript
// Bad: Using GET for mutations
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');
  if (action === 'delete') {
    await deleteResource(); // Wrong! Use DELETE method
  }
}

// Good: Use appropriate HTTP methods
export async function DELETE(request: NextRequest) {
  await deleteResource();
}

// Bad: Exposing internal errors
return NextResponse.json({ error: dbError.message }); // Security risk!

// Good: Generic error messages
return errors.internal(); // "Internal server error"
```

## Related Skills

- `route-handlers` - Route Handler basics
- `api-types` - Type safety
- `api-versioning` - Version management
- `graphql` - Alternative API style

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial REST API design pattern
