---
id: pt-type-safety
name: Type Safety Patterns
version: 2.0.0
layer: L5
category: typescript
description: End-to-end type safety patterns for Next.js 15 applications ensuring compile-time guarantees
tags: [typescript, type-safety, inference, strict-mode, type-guards]
composes: []
dependencies: []
formula: "Schema -> Validation -> Inference -> Narrowing -> Safe Operations"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Type Safety Patterns

## Overview

End-to-end type safety ensures that data flows correctly through your entire application, from database to API to UI. This pattern covers TypeScript configuration, inference strategies, and runtime validation.

## When to Use

Use type safety patterns when:
- Setting up a new Next.js project with strict TypeScript
- Building server actions with input validation
- Creating type-safe route handlers and API endpoints
- Handling async state with discriminated unions
- Validating environment variables at startup

## Composition Diagram

```
+------------------+
|   tsconfig.json  |
|   strict: true   |
+--------+---------+
         |
         v
+--------+---------+
|   Zod Schemas    |
|   (validation)   |
+--------+---------+
         |
    +----+----+----+
    |         |    |
    v         v    v
+---+---+ +---+---+ +-------+
|Server | |Route  | |Client |
|Action | |Handler| |Hooks  |
+---+---+ +---+---+ +-------+
    |         |         |
    v         v         v
+---+---+---+---+---+---+---+
|    Discriminated Unions   |
|    {success} | {error}    |
+-------------+-------------+
              |
              v
+-------------+-------------+
|     Type Guards           |
|     isSuccess(result)     |
+-------------+-------------+
              |
              v
+-------------+-------------+
|     Safe Operations       |
|     result.data.property  |
+---------------------------+
```

## Implementation

### Strict TypeScript Configuration

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Type-Safe Server Actions

```typescript
// lib/safe-action.ts
import { z } from "zod";

type ActionState<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export function createSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (validatedData: TInput) => Promise<TOutput>
) {
  return async (input: unknown): Promise<ActionState<TOutput>> => {
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    try {
      const result = await handler(parsed.data);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
}

// Usage
// app/actions/user.ts
"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { prisma } from "@/lib/db";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(["user", "admin"]).default("user"),
});

export const createUser = createSafeAction(
  createUserSchema,
  async (data) => {
    const user = await prisma.user.create({ data });
    return user;
  }
);
```

### Type-Safe Route Handlers

```typescript
// lib/api-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";

type RouteContext<TParams = Record<string, string>> = {
  params: Promise<TParams>;
};

type ApiHandler<TParams, TBody, TResponse> = (
  request: NextRequest,
  context: RouteContext<TParams>,
  body: TBody,
  session: Awaited<ReturnType<typeof getSession>>
) => Promise<TResponse>;

interface RouteConfig<TParams, TBody> {
  params?: z.Schema<TParams>;
  body?: z.Schema<TBody>;
  auth?: boolean;
}

export function createApiHandler<
  TParams = Record<string, never>,
  TBody = unknown,
  TResponse = unknown
>(
  config: RouteConfig<TParams, TBody>,
  handler: ApiHandler<TParams, TBody, TResponse>
) {
  return async (
    request: NextRequest,
    context: RouteContext<TParams>
  ): Promise<NextResponse> => {
    try {
      // Auth check
      const session = config.auth ? await getSession() : null;
      if (config.auth && !session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Params validation (Next.js 15: params is a Promise)
      const rawParams = await context.params;
      const params = config.params
        ? config.params.parse(rawParams)
        : (rawParams as TParams);

      // Body validation
      let body: TBody = undefined as TBody;
      if (config.body) {
        const rawBody = await request.json();
        body = config.body.parse(rawBody);
      }

      const result = await handler(request, context, body, session);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.flatten() },
          { status: 400 }
        );
      }
      
      console.error("API Error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

// Usage
// app/api/users/[id]/route.ts
import { createApiHandler } from "@/lib/api-handler";
import { z } from "zod";
import { prisma } from "@/lib/db";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const updateBodySchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export const GET = createApiHandler(
  { params: paramsSchema, auth: true },
  async (_request, _context, _body, _session) => {
    const params = await _context.params;
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: params.id },
    });
    return user;
  }
);

export const PATCH = createApiHandler(
  { params: paramsSchema, body: updateBodySchema, auth: true },
  async (_request, context, body) => {
    const params = await context.params;
    const user = await prisma.user.update({
      where: { id: params.id },
      data: body,
    });
    return user;
  }
);
```

### Type-Safe Page Props (Next.js 15)

```typescript
// types/next.ts
export type PageProps<
  TParams extends Record<string, string> = Record<string, never>,
  TSearchParams extends Record<string, string | string[] | undefined> = Record<string, never>
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};

export type LayoutProps<
  TParams extends Record<string, string> = Record<string, never>
> = {
  children: React.ReactNode;
  params: Promise<TParams>;
};

// Usage
// app/users/[id]/page.tsx
import type { PageProps } from "@/types/next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type UserPageParams = {
  id: string;
};

type UserPageSearchParams = {
  tab?: string;
};

export default async function UserPage({
  params,
  searchParams,
}: PageProps<UserPageParams, UserPageSearchParams>) {
  const { id } = await params;
  const { tab = "profile" } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <TabContent tab={tab} user={user} />
    </div>
  );
}
```

### Type-Safe Environment Variables

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  // Server-only
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  
  // Client-safe (prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

// Type-safe access
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
```

### Discriminated Unions for State

```typescript
// types/async-state.ts
export type AsyncState<T, E = Error> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: E };

// Type-safe state transitions
export function createAsyncState<T, E = Error>() {
  return {
    idle: (): AsyncState<T, E> => ({ status: "idle" }),
    loading: (): AsyncState<T, E> => ({ status: "loading" }),
    success: (data: T): AsyncState<T, E> => ({ status: "success", data }),
    error: (error: E): AsyncState<T, E> => ({ status: "error", error }),
  };
}

// Usage in component
// components/user-profile.tsx
"use client";

import { useState, useEffect } from "react";
import type { AsyncState } from "@/types/async-state";
import type { User } from "@prisma/client";

export function UserProfile({ userId }: { userId: string }) {
  const [state, setState] = useState<AsyncState<User>>({ status: "idle" });

  useEffect(() => {
    setState({ status: "loading" });
    
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setState({ status: "success", data }))
      .catch((error) => setState({ status: "error", error }));
  }, [userId]);

  // TypeScript narrows the type based on status
  switch (state.status) {
    case "idle":
    case "loading":
      return <Skeleton />;
    case "error":
      return <Error message={state.error.message} />;
    case "success":
      return <Profile user={state.data} />;
  }
}
```

## Variants

### Strict Null Checks Pattern

```typescript
// lib/assert.ts
export function assertDefined<T>(
  value: T | null | undefined,
  message = "Value is not defined"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

// Usage
const user = await prisma.user.findUnique({ where: { id } });
assertDefined(user, `User ${id} not found`);
// user is now User, not User | null
```

### Const Assertions for Literals

```typescript
// lib/constants.ts
export const USER_ROLES = ["user", "admin", "moderator"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;
export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

// Prevents typos at compile time
function checkRole(role: UserRole) {
  // ...
}
checkRole("admin"); // ✓
checkRole("superuser"); // ✗ Type error
```

## Anti-patterns

1. **Using `any` type**: Defeats the purpose of TypeScript
2. **Type assertions without validation**: `as User` without runtime check
3. **Ignoring null checks**: Not handling nullable values properly
4. **Not using strict mode**: Missing critical compile-time checks
5. **Manual type duplication**: Not inferring from source of truth

## Related Skills

- `L5/patterns/api-types` - API response types
- `L5/patterns/zod-schemas` - Runtime validation
- `L5/patterns/branded-types` - Nominal typing
- `L5/patterns/generics` - Generic type patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Next.js 15 async params/searchParams
