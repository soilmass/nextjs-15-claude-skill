---
id: pt-inference
name: Type Inference Patterns
version: 2.0.0
layer: L5
category: typescript
description: Leveraging TypeScript's type inference for cleaner code with automatic type derivation
tags: [typescript, inference, typeof, infer, conditional-types, derivation]
composes: []
dependencies: []
formula: "type T = z.infer<typeof schema> | ReturnType<typeof fn> | typeof value[key]"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Type Inference Patterns

## Overview

Type inference allows TypeScript to automatically determine types based on context, reducing boilerplate while maintaining full type safety. This pattern covers deriving types from schemas, database models, and runtime values.

## When to Use

Use type inference when:
- Deriving types from Zod schemas to avoid duplication
- Extracting types from Prisma queries and models
- Creating types from constant arrays or objects
- Inferring function parameter and return types
- Building derived types from existing type definitions

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   Source of      |     |   Inference      |     |   Derived        |
|   Truth          |     |   Mechanism      |     |   Type           |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         v                        v                        v
+--------+---------+     +--------+---------+     +--------+---------+
| Zod Schema       |---->| z.infer<typeof>  |---->| type User =      |
| userSchema       |     |                  |     | { id, email }    |
+------------------+     +------------------+     +------------------+

+------------------+     +------------------+     +------------------+
| Prisma Model     |---->| Prisma.XGetPayload|---->| type UserWith    |
| User + Posts     |     | <{include:...}> |     | Posts = ...      |
+------------------+     +------------------+     +------------------+

+------------------+     +------------------+     +------------------+
| Const Array      |---->| typeof arr[number]|---->| type Role =      |
| ['a','b'] as const|     |                  |     | 'a' | 'b'        |
+------------------+     +------------------+     +------------------+

+------------------+     +------------------+     +------------------+
| Function         |---->| ReturnType<typeof>|---->| type Result =    |
| async fn()       |     | Awaited<...>     |     | { data }         |
+------------------+     +------------------+     +------------------+
```

## Implementation

### Inferring from Zod Schemas

```typescript
// schemas/user.ts
import { z } from "zod";

// Define schema once
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(["user", "admin", "moderator"]),
  avatar: z.string().url().nullable(),
  settings: z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    notifications: z.boolean().default(true),
    language: z.string().default("en"),
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Infer types from schema - no duplication!
export type User = z.infer<typeof userSchema>;

// Infer input type (before transforms/defaults)
export type UserInput = z.input<typeof userSchema>;

// Infer output type (after transforms/defaults)
export type UserOutput = z.output<typeof userSchema>;

// Partial schemas
export const userUpdateSchema = userSchema.partial().omit({ id: true, createdAt: true });
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Pick specific fields
export const userPreviewSchema = userSchema.pick({ id: true, name: true, avatar: true });
export type UserPreview = z.infer<typeof userPreviewSchema>;
```

### Inferring from Prisma

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// types/prisma.ts
import type { Prisma } from "@prisma/client";

// Infer model types
export type User = Prisma.UserGetPayload<{}>;
export type Post = Prisma.PostGetPayload<{}>;

// Infer with relations
export type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true };
}>;

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: true };
}>;

// Infer with specific select
export type UserPreview = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    avatar: true;
  };
}>;

// Create input types
export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;

// Where input types
export type UserWhereInput = Prisma.UserWhereInput;
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;

// Custom query result types
const getUserWithStats = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true, comments: true },
      },
    },
  });
};

// Infer return type from function
export type UserWithStats = NonNullable<Awaited<ReturnType<typeof getUserWithStats>>>;
```

### Inferring from Constants

```typescript
// lib/constants.ts

// Array const assertion
export const ROLES = ["user", "admin", "moderator"] as const;
export type Role = (typeof ROLES)[number]; // "user" | "admin" | "moderator"

// Object const assertion
export const STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];
// "pending" | "active" | "suspended" | "deleted"

// Complex object inference
export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}` as const,
    edit: (id: string) => `/users/${id}/edit` as const,
  },
  posts: {
    list: "/posts",
    detail: (slug: string) => `/posts/${slug}` as const,
  },
} as const;

// Infer route types
type Routes = typeof ROUTES;
type UserRoutes = Routes["users"];

// Navigation config with inference
export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Users", href: "/users", icon: "users" },
  { label: "Settings", href: "/settings", icon: "settings" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
export type NavHref = NavItem["href"];
```

### Conditional Type Inference

```typescript
// types/utils.ts

// Extract array element type
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

const users = [{ id: "1", name: "John" }, { id: "2", name: "Jane" }];
type User = ArrayElement<typeof users>; // { id: string; name: string }

// Extract promise value
type Awaited<T> = T extends Promise<infer U> ? U : T;

async function fetchUser() {
  return { id: "1", name: "John" };
}
type FetchedUser = Awaited<ReturnType<typeof fetchUser>>;

// Extract function parameters
type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;

function createUser(name: string, email: string, role: "user" | "admin") {
  // ...
}
type CreateUserParams = Parameters<typeof createUser>;
// [name: string, email: string, role: "user" | "admin"]

// Extract return type
type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;

// Infer object value types
type ValueOf<T> = T[keyof T];

const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
} as const;

type ConfigValue = ValueOf<typeof config>;
// "https://api.example.com" | 5000 | 3

// Infer deeply nested types
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;
```

### Component Prop Inference

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Infer variant props from cva
type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  asChild?: boolean;
}

// Component inference for polymorphic components
type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

type PolymorphicProps<C extends React.ElementType, Props = {}> = Props &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props> & {
    as?: C;
    ref?: PolymorphicRef<C>;
  };

// Infer props from existing component
type InferProps<T> = T extends React.ComponentType<infer P> ? P : never;

import { Button } from "./button";
type ButtonPropsInferred = InferProps<typeof Button>;
```

### Server Action Inference

```typescript
// lib/action-utils.ts
import { z } from "zod";

// Infer action result type
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Create typed action with schema inference
function createAction<TSchema extends z.ZodType, TResult>(
  schema: TSchema,
  handler: (data: z.infer<TSchema>) => Promise<TResult>
) {
  return async (input: z.infer<TSchema>): Promise<ActionResult<TResult>> => {
    const parsed = schema.safeParse(input);
    
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Validation failed",
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

// Usage - types are fully inferred!
const createUserAction = createAction(
  z.object({
    email: z.string().email(),
    name: z.string().min(2),
  }),
  async (data) => {
    // data is typed as { email: string; name: string }
    const user = await prisma.user.create({ data });
    return user; // Return type is inferred
  }
);

// Infer the input and output types
type CreateUserInput = Parameters<typeof createUserAction>[0];
type CreateUserResult = Awaited<ReturnType<typeof createUserAction>>;
```

### Hook Return Type Inference

```typescript
// hooks/use-async.ts
"use client";

import { useState, useCallback } from "react";

function useAsync<T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: Args) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction]
  );

  return { data, error, isLoading, execute };
}

// Usage - all types inferred!
async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json() as Promise<{ id: string; name: string }>;
}

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, execute } = useAsync(fetchUser);
  // data: { id: string; name: string } | null
  // execute: (id: string) => Promise<{ id: string; name: string }>
  
  return (
    <button onClick={() => execute(userId)}>
      {isLoading ? "Loading..." : data?.name}
    </button>
  );
}
```

## Variants

### Mapped Type Inference

```typescript
// Create readonly version of object type
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Create mutable version
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Create nullable version
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// Key remapping
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
```

### Template Literal Type Inference

```typescript
// Infer parts from string literal types
type ExtractRouteParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : T extends `${infer _Start}:${infer Param}`
    ? Param
    : never;

type Params = ExtractRouteParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"

// Build typed route params
type RouteParams<T extends string> = {
  [K in ExtractRouteParams<T>]: string;
};

type UserPostParams = RouteParams<"/users/:userId/posts/:postId">;
// { userId: string; postId: string }
```

## Anti-patterns

1. **Explicit types everywhere**: Adding types that TypeScript can infer
2. **Type assertions over inference**: Using `as` instead of letting TS infer
3. **Not using const assertions**: Missing `as const` for literal types
4. **Ignoring utility types**: Reimplementing built-in type utilities
5. **Over-complex conditionals**: Unreadable nested conditional types

## Related Skills

- `L5/patterns/type-safety` - Type safety fundamentals
- `L5/patterns/generics` - Generic type patterns
- `L5/patterns/utility-types` - Built-in utility types
- `L5/patterns/zod-schemas` - Schema-based type inference

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Prisma, Zod, and React patterns
