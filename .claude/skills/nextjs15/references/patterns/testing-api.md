---
id: pt-testing-api
name: API Testing Patterns
version: 2.0.0
layer: L5
category: testing
description: Testing Next.js API routes and Server Actions with Vitest and MSW
tags: [testing, api, vitest, msw, server-actions, route-handlers]
composes: []
dependencies:
  vitest: "^2.1.0"
  msw: "^2.6.0"
formula: "Server Actions + Route Handlers + MSW = backend validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Testing Patterns

## Overview

Testing API routes and Server Actions ensures your backend logic works correctly. This pattern covers testing Next.js route handlers, Server Actions, and mocking external services.

## When to Use

- **Server Actions**: Test form submissions and data mutations
- **Route Handlers**: Validate HTTP methods and response codes
- **Middleware testing**: Test authentication and authorization logic
- **External services**: Mock payment providers, email services, etc.
- **Database operations**: Test CRUD through API layer
- **Error scenarios**: Validate error handling and edge cases

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Route Handlers   | --> | Server Actions    | --> | Response         |
| (GET, POST, etc) |     | (form handling)   |     | Validation       |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Mocking Pattern  |     | Test Fixtures     |     | Error Handling   |
| (MSW, vi.mock)   |     | (factories)       |     | (status codes)   |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Unit Testing     |     | Integration Tests |
| (isolated)       |     | (with database)   |
+------------------+     +-------------------+
```

## Implementation

### Testing Route Handlers

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.user.count();

  return NextResponse.json({
    success: true,
    data: users,
    meta: { page, limit, total },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = createUserSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: result.data,
  });

  return NextResponse.json(
    { success: true, data: user },
    { status: 201 }
  );
}

// app/api/users/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";

describe("GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated users", async () => {
    const mockUsers = [
      { id: "1", email: "user1@test.com", name: "User 1" },
      { id: "2", email: "user2@test.com", name: "User 2" },
    ];

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);
    vi.mocked(prisma.user.count).mockResolvedValue(100);

    const request = new NextRequest("http://localhost/api/users?page=1&limit=10");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockUsers);
    expect(data.meta).toEqual({ page: 1, limit: 10, total: 100 });
  });

  it("uses default pagination", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.count).mockResolvedValue(0);

    const request = new NextRequest("http://localhost/api/users");
    const response = await GET(request);
    const data = await response.json();

    expect(data.meta.page).toBe(1);
    expect(data.meta.limit).toBe(10);
  });
});

describe("POST /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates user with valid data", async () => {
    const newUser = { id: "1", email: "new@test.com", name: "New User" };
    vi.mocked(prisma.user.create).mockResolvedValue(newUser);

    const request = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "new@test.com", name: "New User" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(newUser);
  });

  it("returns 400 for invalid email", async () => {
    const request = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email", name: "Test" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.fieldErrors.email).toBeDefined();
  });

  it("returns 400 for missing name", async () => {
    const request = new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
```

### Testing Server Actions

```typescript
// app/actions/user.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name too short"),
});

export async function createUser(formData: FormData) {
  const session = await getSession();
  
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    email: formData.get("email"),
    name: formData.get("name"),
  };

  const result = createUserSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await prisma.user.create({
      data: result.data,
    });

    revalidatePath("/users");
    
    return { success: true, data: { id: user.id } };
  } catch (error) {
    return { success: false, error: "Failed to create user" };
  }
}

// app/actions/user.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUser } from "./user";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

describe("createUser action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("name", "Test User");

    const result = await createUser(formData);

    expect(result).toEqual({
      success: false,
      error: "Unauthorized",
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("creates user when authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "1" });
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-id",
      email: "test@test.com",
      name: "Test User",
    });

    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("name", "Test User");

    const result = await createUser(formData);

    expect(result).toEqual({
      success: true,
      data: { id: "new-id" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/users");
  });

  it("returns validation errors for invalid data", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "1" });

    const formData = new FormData();
    formData.set("email", "invalid-email");
    formData.set("name", "A"); // Too short

    const result = await createUser(formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
    expect(result.fieldErrors?.name).toBeDefined();
  });

  it("handles database errors", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "1" });
    vi.mocked(prisma.user.create).mockRejectedValue(new Error("DB error"));

    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("name", "Test User");

    const result = await createUser(formData);

    expect(result).toEqual({
      success: false,
      error: "Failed to create user",
    });
  });
});
```

### Testing with MSW (Mock Service Worker)

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock external API
  http.get("https://api.example.com/users", () => {
    return HttpResponse.json([
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ]);
  }),

  http.post("https://api.example.com/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 3, ...body },
      { status: 201 }
    );
  }),

  http.get("https://api.example.com/users/:id", ({ params }) => {
    const { id } = params;
    
    if (id === "999") {
      return HttpResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({ id, name: `User ${id}` });
  }),
];

// mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

// vitest.setup.ts
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// services/external-api.test.ts
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { fetchExternalUsers, createExternalUser } from "./external-api";

describe("External API Service", () => {
  it("fetches users from external API", async () => {
    const users = await fetchExternalUsers();
    
    expect(users).toHaveLength(2);
    expect(users[0].name).toBe("John");
  });

  it("creates user via external API", async () => {
    const newUser = await createExternalUser({ name: "Alice" });
    
    expect(newUser.id).toBe(3);
    expect(newUser.name).toBe("Alice");
  });

  it("handles API errors", async () => {
    // Override handler for this test
    server.use(
      http.get("https://api.example.com/users", () => {
        return HttpResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      })
    );

    await expect(fetchExternalUsers()).rejects.toThrow();
  });
});
```

### Testing Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Public routes
  if (request.nextUrl.pathname.startsWith("/public")) {
    return NextResponse.next();
  }

  // Auth required
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifyToken(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Add user info to headers
  const response = NextResponse.next();
  response.headers.set("x-user-id", session.userId);
  
  return response;
}

// middleware.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
}));

import { verifyToken } from "@/lib/auth";

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public routes without token", async () => {
    const request = new NextRequest("http://localhost/public/page");
    const response = await middleware(request);

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects to login without token", async () => {
    const request = new NextRequest("http://localhost/dashboard");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("redirects on invalid token", async () => {
    vi.mocked(verifyToken).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/dashboard", {
      headers: {
        cookie: "token=invalid-token",
      },
    });
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows request with valid token", async () => {
    vi.mocked(verifyToken).mockResolvedValue({ userId: "123" });

    const request = new NextRequest("http://localhost/dashboard", {
      headers: {
        cookie: "token=valid-token",
      },
    });
    const response = await middleware(request);

    expect(response.headers.get("x-user-id")).toBe("123");
  });
});
```

## Variants

### Testing with Supertest (Alternative)

```typescript
// Alternative approach using supertest-like testing
import { createMocks } from "node-mocks-http";
import { GET, POST } from "./route";

describe("API Route", () => {
  it("handles GET request", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { page: "1" },
    });

    // Note: This approach works better with Pages Router
    // For App Router, use NextRequest directly as shown above
  });
});
```

## Anti-patterns

1. **Testing implementation**: Testing internal logic instead of behavior
2. **Not mocking external services**: Flaky tests from network calls
3. **Missing error cases**: Only testing happy paths
4. **Shared mutable state**: Tests affecting each other
5. **Over-mocking**: Missing real integration issues

## Related Skills

- `L5/patterns/testing-unit` - Unit testing
- `L5/patterns/testing-integration` - Integration testing
- `L5/patterns/mocking` - Mocking strategies
- `L5/patterns/route-handlers` - Route handler patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with MSW and Server Actions
