---
id: pt-api-types
name: API Type Patterns
version: 2.0.0
layer: L5
category: typescript
description: Type-safe API contracts with request/response typing, error handling, and OpenAPI integration
tags: [typescript, api, rest, openapi, type-safety, contracts]
composes: []
dependencies: []
formula: "ApiResponse<T> = SuccessResponse<T> | ErrorResponse where validation = Zod.parse(input)"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Type Patterns

## Overview

API type patterns ensure type safety across client-server boundaries. This covers defining API contracts, generating types from OpenAPI specs, and maintaining consistency between frontend and backend.

## When to Use

Use API type patterns when:
- Building REST or GraphQL API endpoints
- Creating type-safe client libraries for API consumption
- Generating TypeScript types from OpenAPI/Swagger specs
- Validating request bodies and query parameters
- Ensuring consistent response shapes across endpoints

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   Zod Schemas    |---->|   API Types      |---->|   Route Handlers |
| userSchema       |     | ApiResponse<T>   |     | GET /api/users   |
| createUserSchema |     | PaginatedResponse|     | POST /api/users  |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
|  Type Inference  |     | Discriminated    |     | Type Guards      |
| z.infer<typeof>  |     | Unions           |     | isSuccess()      |
| z.input<typeof>  |     | success | error  |     | isError()        |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                                  v
                         +--------+---------+
                         |  Type-Safe API   |
                         |  Client          |
                         |  api.get<Route>  |
                         +------------------+
```

## Implementation

### Shared API Types

```typescript
// types/api.ts
import { z } from "zod";

// Base response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Type helpers
export type InferApiData<T> = T extends ApiSuccessResponse<infer D> ? D : never;
```

### Resource Schema Definitions

```typescript
// schemas/user.ts
import { z } from "zod";

// Base schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(["user", "admin", "moderator"]),
  avatar: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const userCreateSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const userUpdateSchema = userCreateSchema.partial();

// Derived types
export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Response schemas
export const userResponseSchema = z.object({
  success: z.literal(true),
  data: userSchema,
});

export const usersResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(userSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
```

### API Route Type Definitions

```typescript
// types/routes.ts
import type { User, UserCreate, UserUpdate } from "@/schemas/user";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

// Define all API routes with their types
export interface ApiRoutes {
  // Users
  "GET /api/users": {
    query: PaginationParams & { search?: string; role?: string };
    response: PaginatedResponse<User>;
  };
  "GET /api/users/:id": {
    params: { id: string };
    response: ApiResponse<User>;
  };
  "POST /api/users": {
    body: UserCreate;
    response: ApiResponse<User>;
  };
  "PATCH /api/users/:id": {
    params: { id: string };
    body: UserUpdate;
    response: ApiResponse<User>;
  };
  "DELETE /api/users/:id": {
    params: { id: string };
    response: ApiResponse<{ deleted: boolean }>;
  };

  // Auth
  "POST /api/auth/login": {
    body: { email: string; password: string };
    response: ApiResponse<{ user: User; token: string }>;
  };
  "POST /api/auth/logout": {
    response: ApiResponse<{ success: boolean }>;
  };
}

// Helper types
export type ApiRoute = keyof ApiRoutes;
export type RouteConfig<T extends ApiRoute> = ApiRoutes[T];
```

### Type-Safe API Client

```typescript
// lib/api-client.ts
import type { ApiRoutes, ApiRoute, RouteConfig } from "@/types/routes";
import type { ApiResponse } from "@/types/api";

type ExtractMethod<T extends string> = T extends `${infer M} ${string}` ? M : never;
type ExtractPath<T extends string> = T extends `${string} ${infer P}` ? P : never;

type RouteParams<T extends ApiRoute> = RouteConfig<T> extends { params: infer P }
  ? P
  : Record<string, never>;

type RouteQuery<T extends ApiRoute> = RouteConfig<T> extends { query: infer Q }
  ? Q
  : Record<string, never>;

type RouteBody<T extends ApiRoute> = RouteConfig<T> extends { body: infer B }
  ? B
  : never;

type RouteResponse<T extends ApiRoute> = RouteConfig<T>["response"];

class TypedApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string>,
    query?: Record<string, unknown>
  ): string {
    let url = this.baseUrl + path;

    // Replace path params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url = url.replace(`:${key}`, encodeURIComponent(value));
      }
    }

    // Add query params
    if (query) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  async request<T extends ApiRoute>(
    route: T,
    options: {
      params?: RouteParams<T>;
      query?: RouteQuery<T>;
      body?: RouteBody<T>;
    } = {}
  ): Promise<RouteResponse<T>> {
    const [method, path] = route.split(" ") as [string, string];
    const url = this.buildUrl(path, options.params as Record<string, string>, options.query);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: "include",
    });

    const data = await response.json();
    return data as RouteResponse<T>;
  }

  // Convenience methods
  async get<T extends `GET ${string}` & ApiRoute>(
    route: T,
    options?: {
      params?: RouteParams<T>;
      query?: RouteQuery<T>;
    }
  ): Promise<RouteResponse<T>> {
    return this.request(route, options);
  }

  async post<T extends `POST ${string}` & ApiRoute>(
    route: T,
    body: RouteBody<T>,
    options?: {
      params?: RouteParams<T>;
    }
  ): Promise<RouteResponse<T>> {
    return this.request(route, { ...options, body });
  }

  async patch<T extends `PATCH ${string}` & ApiRoute>(
    route: T,
    body: RouteBody<T>,
    options?: {
      params?: RouteParams<T>;
    }
  ): Promise<RouteResponse<T>> {
    return this.request(route, { ...options, body });
  }

  async delete<T extends `DELETE ${string}` & ApiRoute>(
    route: T,
    options?: {
      params?: RouteParams<T>;
    }
  ): Promise<RouteResponse<T>> {
    return this.request(route, options);
  }
}

export const api = new TypedApiClient();

// Usage - fully type-safe!
const users = await api.get("GET /api/users", {
  query: { page: 1, limit: 10, role: "admin" },
});

const user = await api.get("GET /api/users/:id", {
  params: { id: "123" },
});

const newUser = await api.post("POST /api/users", {
  email: "john@example.com",
  name: "John Doe",
  role: "user",
  avatar: null,
});
```

### OpenAPI Type Generation

```typescript
// scripts/generate-api-types.ts
// First, install: npm install openapi-typescript

// Generate types from OpenAPI spec
// npx openapi-typescript ./openapi.yaml -o ./types/api-generated.ts

// types/api-generated.ts (auto-generated)
export interface paths {
  "/api/users": {
    get: operations["getUsers"];
    post: operations["createUser"];
  };
  "/api/users/{id}": {
    get: operations["getUser"];
    patch: operations["updateUser"];
    delete: operations["deleteUser"];
  };
}

export interface operations {
  getUsers: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
        search?: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": {
            success: true;
            data: components["schemas"]["User"][];
            meta: components["schemas"]["PaginationMeta"];
          };
        };
      };
    };
  };
  // ... more operations
}

export interface components {
  schemas: {
    User: {
      id: string;
      email: string;
      name: string;
      role: "user" | "admin" | "moderator";
      avatar: string | null;
      createdAt: string;
      updatedAt: string;
    };
    PaginationMeta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// lib/openapi-client.ts
import createClient from "openapi-fetch";
import type { paths } from "@/types/api-generated";

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

// Usage - types inferred from OpenAPI spec
const { data, error } = await apiClient.GET("/api/users", {
  params: {
    query: { page: 1, limit: 10 },
  },
});
```

### Server-Side Type Validation

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userCreateSchema, usersResponseSchema } from "@/schemas/user";
import { prisma } from "@/lib/db";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(["user", "admin", "moderator"]).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = querySchema.parse(searchParams);

  const where = {
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" as const } },
        { email: { contains: query.search, mode: "insensitive" as const } },
      ],
    }),
    ...(query.role && { role: query.role }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  // Response validated against schema
  const response = usersResponseSchema.parse({
    success: true,
    data: users,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = userCreateSchema.parse(body);

  const user = await prisma.user.create({ data });

  return NextResponse.json({
    success: true,
    data: user,
  });
}
```

## Variants

### Discriminated Union Responses

```typescript
// types/api-responses.ts
type UserListResponse = 
  | { type: "success"; users: User[]; meta: PaginationMeta }
  | { type: "error"; code: "UNAUTHORIZED"; message: string }
  | { type: "error"; code: "INVALID_PARAMS"; message: string; details: Record<string, string[]> };

function handleResponse(response: UserListResponse) {
  switch (response.type) {
    case "success":
      return response.users; // TypeScript knows users exists
    case "error":
      if (response.code === "INVALID_PARAMS") {
        return response.details; // TypeScript knows details exists
      }
      throw new Error(response.message);
  }
}
```

### Versioned API Types

```typescript
// types/api/v1/user.ts
export namespace V1 {
  export interface User {
    id: string;
    email: string;
    name: string;
  }
}

// types/api/v2/user.ts
export namespace V2 {
  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  }
}
```

## Anti-patterns

1. **Loose typing**: Using `any` or `unknown` for API responses
2. **Manual type duplication**: Defining same types in frontend and backend
3. **Missing error types**: Not typing error responses
4. **Ignoring null/undefined**: Not handling nullable fields from API
5. **No runtime validation**: Trusting API responses without validation

## Related Skills

- `L5/patterns/type-safety` - Type safety fundamentals
- `L5/patterns/zod-schemas` - Zod validation schemas
- `L5/patterns/trpc` - End-to-end type-safe APIs
- `L5/patterns/route-handlers` - Next.js route handlers

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with OpenAPI integration
