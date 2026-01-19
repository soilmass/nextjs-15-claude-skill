---
id: pt-mocking
name: Mocking Patterns
version: 2.0.0
layer: L5
category: testing
description: Comprehensive mocking strategies for Next.js testing with Vitest
tags: [testing, mocking, vitest, msw, spy, stub]
composes: []
dependencies:
  msw: "^2.6.0"
formula: "vi.mock + MSW + factories = isolated unit testing"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Mocking Patterns

## Overview

Effective mocking isolates units under test, speeds up tests, and ensures deterministic results. This pattern covers mocking modules, functions, network requests, and Next.js-specific features.

## When to Use

- **Database isolation**: Mock Prisma client for unit tests without database
- **External APIs**: Use MSW to mock third-party API responses
- **Authentication**: Mock auth providers for testing protected routes
- **Next.js features**: Mock navigation, headers, cookies, and cache
- **Timers and dates**: Control time-dependent behavior with fake timers
- **Environment variables**: Override config for test scenarios
- **File system**: Mock file operations for upload/download tests

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Module Mocking   | --> | vi.mock()         | --> | Isolated         |
| (Prisma, Auth)   |     | vi.fn()           |     | Unit Tests       |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| MSW Handlers     |     | Timer Mocking     |     | Test Fixtures    |
| (network)        |     | (vi.useFakeTimers)|     | (factories)      |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Next.js Mocks    |     | Hook Testing      |
| (router, etc.)   |     | (renderHook)      |
+------------------+     +-------------------+
```

## Implementation

### Module Mocking

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

// __mocks__/lib/db.ts
// Create manual mock
import { vi } from "vitest";

export const prisma = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  post: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(prisma)),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

// In test file
// services/user.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Inline mock
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Or use the manual mock from __mocks__
vi.mock("@/lib/db");

import { prisma } from "@/lib/db";
import { getUserById, createUser } from "./user-service";

describe("User Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets user by id", async () => {
    const mockUser = { id: "1", email: "test@test.com", name: "Test" };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const user = await getUserById("1");

    expect(user).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });
});
```

### Function Mocking

```typescript
// Spy on existing function
import { describe, it, expect, vi } from "vitest";
import * as utils from "@/lib/utils";

describe("Function spying", () => {
  it("spies on formatDate", () => {
    const spy = vi.spyOn(utils, "formatDate");
    
    utils.formatDate(new Date("2024-01-01"));
    
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(expect.any(Date));
    
    spy.mockRestore();
  });

  it("mocks implementation", () => {
    const spy = vi.spyOn(utils, "formatDate").mockReturnValue("mocked-date");
    
    const result = utils.formatDate(new Date());
    
    expect(result).toBe("mocked-date");
    
    spy.mockRestore();
  });
});

// Mock implementations
describe("Mock implementations", () => {
  it("mockReturnValue - returns same value every call", () => {
    const mock = vi.fn().mockReturnValue(42);
    
    expect(mock()).toBe(42);
    expect(mock()).toBe(42);
  });

  it("mockReturnValueOnce - returns value once", () => {
    const mock = vi.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValue(0);
    
    expect(mock()).toBe(1);
    expect(mock()).toBe(2);
    expect(mock()).toBe(0);
    expect(mock()).toBe(0);
  });

  it("mockResolvedValue - for async functions", async () => {
    const mock = vi.fn().mockResolvedValue({ data: "test" });
    
    const result = await mock();
    
    expect(result).toEqual({ data: "test" });
  });

  it("mockRejectedValue - for async errors", async () => {
    const mock = vi.fn().mockRejectedValue(new Error("Failed"));
    
    await expect(mock()).rejects.toThrow("Failed");
  });

  it("mockImplementation - custom logic", () => {
    const mock = vi.fn().mockImplementation((a: number, b: number) => a + b);
    
    expect(mock(2, 3)).toBe(5);
  });
});
```

### Next.js Specific Mocking

```typescript
// Mocking next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/current-path"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Usage in test
import { useRouter, redirect } from "next/navigation";

describe("Navigation", () => {
  it("navigates on action", () => {
    const router = useRouter();
    
    // Trigger navigation
    performAction();
    
    expect(router.push).toHaveBeenCalledWith("/dashboard");
  });
});

// Mocking next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(),
    has: vi.fn(),
    entries: vi.fn(),
  })),
}));

// Mocking next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

// Mocking next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));
```

### Environment Variable Mocking

```typescript
// vitest.setup.ts
import { vi } from "vitest";

// Set default env vars for tests
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
process.env.NEXTAUTH_SECRET = "test-secret-at-least-32-characters-long";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// In test file
describe("Environment dependent code", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses production config in production", () => {
    process.env.NODE_ENV = "production";
    
    // Re-import to get fresh module with new env
    const { config } = require("./config");
    
    expect(config.isProduction).toBe(true);
  });
});
```

### Timer Mocking

```typescript
// Mocking timers
describe("Timer functions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces function calls", () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 1000);

    debounced();
    debounced();
    debounced();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("handles setTimeout", () => {
    const callback = vi.fn();
    
    setTimeout(callback, 5000);
    
    expect(callback).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(5000);
    
    expect(callback).toHaveBeenCalled();
  });

  it("handles setInterval", () => {
    const callback = vi.fn();
    
    setInterval(callback, 1000);
    
    vi.advanceTimersByTime(3500);
    
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("runs all timers", () => {
    const callback = vi.fn();
    
    setTimeout(callback, 10000);
    
    vi.runAllTimers();
    
    expect(callback).toHaveBeenCalled();
  });
});
```

### Network Request Mocking with MSW

```typescript
// mocks/handlers.ts
import { http, HttpResponse, delay } from "msw";

export const handlers = [
  // GET with query params
  http.get("/api/users", ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    
    return HttpResponse.json({
      data: [{ id: 1, name: "User 1" }],
      page: parseInt(page),
    });
  }),

  // POST with body
  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    
    return HttpResponse.json(
      { id: "new-id", ...body },
      { status: 201 }
    );
  }),

  // Simulating delay
  http.get("/api/slow", async () => {
    await delay(2000);
    return HttpResponse.json({ data: "slow response" });
  }),

  // Error responses
  http.get("/api/error", () => {
    return HttpResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }),

  // Network error
  http.get("/api/network-error", () => {
    return HttpResponse.error();
  }),
];

// Override in specific test
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";

describe("Error handling", () => {
  it("handles server error", async () => {
    server.use(
      http.get("/api/users", () => {
        return HttpResponse.json(
          { error: "Server error" },
          { status: 500 }
        );
      })
    );

    await expect(fetchUsers()).rejects.toThrow();
  });
});
```

### Mock Factory Pattern

```typescript
// test/factories.ts
import { vi } from "vitest";

// User factory
export function createMockUser(overrides = {}) {
  return {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

// Post factory
export function createMockPost(overrides = {}) {
  return {
    id: "post-1",
    title: "Test Post",
    content: "Test content",
    authorId: "user-1",
    published: true,
    createdAt: new Date("2024-01-01"),
    ...overrides,
  };
}

// Router mock factory
export function createMockRouter(overrides = {}) {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    ...overrides,
  };
}

// Session mock factory
export function createMockSession(overrides = {}) {
  return {
    user: createMockUser(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

// Usage
describe("User tests", () => {
  it("uses factory", async () => {
    const user = createMockUser({ role: "admin" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
    
    // Test with admin user
  });
});
```

### Partial Mocking

```typescript
// Mock only specific exports
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  
  return {
    ...actual, // Keep all original exports
    formatDate: vi.fn(), // Mock only this one
  };
});

// Or use spyOn for single functions
import * as utils from "@/lib/utils";

const spy = vi.spyOn(utils, "formatDate").mockReturnValue("mocked");
```

## Variants

### Class Mocking

```typescript
// Mocking class instances
vi.mock("./EmailService", () => {
  return {
    EmailService: vi.fn().mockImplementation(() => ({
      send: vi.fn().mockResolvedValue({ success: true }),
      validate: vi.fn().mockReturnValue(true),
    })),
  };
});
```

### Global Mocking

```typescript
// Mock global objects
vi.stubGlobal("fetch", vi.fn());
vi.stubGlobal("localStorage", {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
});

// Clean up
afterEach(() => {
  vi.unstubAllGlobals();
});
```

## Anti-patterns

1. **Over-mocking**: Mocking too much, missing real bugs
2. **Leaking mocks**: Not cleaning up between tests
3. **Testing mocks**: Asserting on mock behavior, not code
4. **Brittle mocks**: Mocks tightly coupled to implementation
5. **Missing types**: Untyped mocks causing runtime errors

## Related Skills

- `L5/patterns/testing-unit` - Unit testing
- `L5/patterns/testing-hooks` - Hook testing
- `L5/patterns/testing-api` - API testing
- `L5/patterns/testing-integration` - Integration testing

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Vitest and MSW
