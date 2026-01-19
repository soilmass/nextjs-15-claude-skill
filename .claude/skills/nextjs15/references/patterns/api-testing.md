---
id: pt-api-testing
name: API Testing
version: 2.0.0
layer: L5
category: testing
description: Test Next.js 15 API routes with comprehensive unit and integration tests
tags: [api, testing, jest, vitest, supertest, msw]
composes: []
dependencies: []
formula: "Route Handlers + MSW + Vitest = API validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Testing Pattern

## Overview

API testing ensures your endpoints work correctly, handle errors gracefully, and maintain contracts with clients. This pattern covers testing Route Handlers in Next.js 15 with various approaches.

## When to Use

- **New API routes**: Validate request/response contracts before deployment
- **Authentication endpoints**: Test auth flows, token validation, and session management
- **CRUD operations**: Verify database operations through API layer
- **Error handling**: Ensure proper HTTP status codes and error messages
- **Pagination and filtering**: Test query parameter handling
- **Rate limiting**: Validate throttling behavior
- **External API integrations**: Mock third-party services for isolated testing

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Route Handler    | --> | Mock Request      | --> | Response         |
| (app/api/...)    |     | (NextRequest)     |     | Validation       |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Mocking Pattern  |     | Test Fixtures     |     | Contract Tests   |
| (Prisma, Auth)   |     | (factories)       |     | (schema check)   |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Error Handling   |     | Integration Tests |
| (edge cases)     |     | (database)        |
+------------------+     +-------------------+
```

## Implementation

### Test Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/api/**/*.ts', 'lib/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
```

### Test Setup File

```typescript
// tests/setup.ts
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret';

// Reset database before tests
beforeAll(async () => {
  // Could use Prisma's $transaction for cleanup
  // Or use a test database setup script
});

// Clean up after each test
afterEach(async () => {
  vi.clearAllMocks();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Route Handler Test Utilities

```typescript
// tests/utils/api-test-utils.ts
import { NextRequest } from 'next/server';

export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {}, searchParams = {} } = options;

  const urlObj = new URL(url, 'http://localhost:3000');
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const requestInit: RequestInit = {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
  };

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(urlObj, requestInit);
}

export async function parseResponse<T>(response: Response): Promise<{
  status: number;
  data: T;
  headers: Headers;
}> {
  const data = await response.json();
  return {
    status: response.status,
    data,
    headers: response.headers,
  };
}

// Create authenticated request
export function createAuthenticatedRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
    userId?: string;
    role?: 'user' | 'admin';
  } = {}
): NextRequest {
  const { userId = 'test-user-id', role = 'user', ...rest } = options;
  
  // Create a mock JWT token (in real tests, generate actual token)
  const token = `mock-token-${userId}-${role}`;
  
  return createMockRequest(url, {
    ...rest,
    headers: {
      ...rest.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// Test data factories
export const factories = {
  user: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
  
  post: (overrides = {}) => ({
    id: 'post-123',
    title: 'Test Post',
    content: 'Test content',
    published: true,
    authorId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};
```

### Basic Route Handler Tests

```typescript
// app/api/users/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { createMockRequest, createAuthenticatedRequest, parseResponse, factories } from '@/tests/utils/api-test-utils';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/lib/auth';

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = createMockRequest('/api/users');
    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 403 if not admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', isAdmin: false },
    });

    const request = createMockRequest('/api/users');
    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(403);
    expect(data.error.code).toBe('FORBIDDEN');
  });

  it('returns paginated users for admin', async () => {
    const mockUsers = [factories.user(), factories.user({ id: 'user-456' })];
    
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', isAdmin: true },
    });
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);
    vi.mocked(prisma.user.count).mockResolvedValue(2);

    const request = createMockRequest('/api/users', {
      searchParams: { page: '1', pageSize: '10' },
    });
    const response = await GET(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.meta).toEqual({
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it('applies search filter', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', isAdmin: true },
    });
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.count).mockResolvedValue(0);

    const request = createMockRequest('/api/users', {
      searchParams: { search: 'john' },
    });
    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        },
      })
    );
  });
});

describe('POST /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new user', async () => {
    const newUser = {
      email: 'new@example.com',
      name: 'New User',
      password: 'password123',
    };
    const createdUser = factories.user({ ...newUser, id: 'new-user-id' });

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', isAdmin: true },
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(createdUser);

    const request = createMockRequest('/api/users', {
      method: 'POST',
      body: newUser,
    });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe(newUser.email);
  });

  it('returns 409 if email already exists', async () => {
    const existingUser = factories.user();

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', isAdmin: true },
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

    const request = createMockRequest('/api/users', {
      method: 'POST',
      body: {
        email: existingUser.email,
        name: 'New User',
        password: 'password123',
      },
    });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(409);
    expect(data.error.code).toBe('CONFLICT');
  });

  it('returns 422 for invalid input', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', isAdmin: true },
    });

    const request = createMockRequest('/api/users', {
      method: 'POST',
      body: {
        email: 'invalid-email', // Invalid email
        name: '', // Too short
        password: '123', // Too short
      },
    });
    const response = await POST(request);
    const { status, data } = await parseResponse(response);

    expect(status).toBe(422);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toBeDefined();
  });
});
```

### Integration Tests with Test Database

```typescript
// tests/integration/api/users.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/users/route';
import { createMockRequest, parseResponse } from '@/tests/utils/api-test-utils';
import { prisma } from '@/lib/prisma';

// Use a test database
// beforeAll(() => execSync('npx prisma migrate reset --force'));

describe('Users API Integration Tests', () => {
  let adminUser: any;
  let testUser: any;

  beforeAll(async () => {
    // Create test users in database
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        password: 'hashed_password',
      },
    });

    testUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        name: 'Test User',
        role: 'user',
        password: 'hashed_password',
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: {
        email: { in: ['admin@test.com', 'user@test.com', 'new@test.com'] },
      },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/users', () => {
    it('returns real users from database', async () => {
      // Mock auth to return admin
      vi.mocked(auth).mockResolvedValue({
        user: { id: adminUser.id, isAdmin: true },
      });

      const request = createMockRequest('/api/users');
      const response = await GET(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(200);
      expect(data.data.length).toBeGreaterThanOrEqual(2);
      expect(data.data.some((u: any) => u.email === 'admin@test.com')).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('creates user in database', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: adminUser.id, isAdmin: true },
      });

      const request = createMockRequest('/api/users', {
        method: 'POST',
        body: {
          email: 'new@test.com',
          name: 'New User',
          password: 'securepassword123',
        },
      });
      const response = await POST(request);
      const { status, data } = await parseResponse(response);

      expect(status).toBe(201);

      // Verify in database
      const dbUser = await prisma.user.findUnique({
        where: { email: 'new@test.com' },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.name).toBe('New User');
    });
  });
});
```

### MSW for External API Mocking

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock external payment API
  http.post('https://api.stripe.com/v1/charges', () => {
    return HttpResponse.json({
      id: 'ch_test_123',
      status: 'succeeded',
      amount: 2000,
    });
  }),

  // Mock external email service
  http.post('https://api.sendgrid.com/v3/mail/send', () => {
    return new HttpResponse(null, { status: 202 });
  }),

  // Mock geolocation API
  http.get('https://ipapi.co/:ip/json/', ({ params }) => {
    return HttpResponse.json({
      ip: params.ip,
      country: 'US',
      city: 'San Francisco',
    });
  }),
];

// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// tests/setup.ts
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Contract Testing

```typescript
// tests/contracts/users-api.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/users/route';
import { createAuthenticatedRequest, parseResponse } from '@/tests/utils/api-test-utils';
import { z } from 'zod';

// Define contract schemas
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  profile: z.object({
    name: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
});

const PaginatedUsersSchema = z.object({
  success: z.literal(true),
  data: z.array(UserSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

describe('Users API Contract Tests', () => {
  it('GET /api/users response matches schema', async () => {
    // Setup mock to return data
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', isAdmin: true } });
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    vi.mocked(prisma.user.count).mockResolvedValue(1);

    const request = createAuthenticatedRequest('/api/users', { role: 'admin' });
    const response = await GET(request);
    const { data } = await parseResponse(response);

    // Validate against schema
    const result = PaginatedUsersSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('error responses match schema', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = createMockRequest('/api/users');
    const response = await GET(request);
    const { data } = await parseResponse(response);

    const result = ErrorSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
```

### Performance Testing

```typescript
// tests/performance/api.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/users/route';
import { createAuthenticatedRequest } from '@/tests/utils/api-test-utils';

describe('API Performance Tests', () => {
  it('GET /api/users responds within 100ms', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', isAdmin: true } });
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.count).mockResolvedValue(0);

    const request = createAuthenticatedRequest('/api/users', { role: 'admin' });
    
    const start = performance.now();
    await GET(request);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('handles concurrent requests', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', isAdmin: true } });
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.count).mockResolvedValue(0);

    const requests = Array.from({ length: 10 }, () =>
      GET(createAuthenticatedRequest('/api/users', { role: 'admin' }))
    );

    const start = performance.now();
    const responses = await Promise.all(requests);
    const duration = performance.now() - start;

    expect(responses.every((r) => r.status === 200)).toBe(true);
    expect(duration).toBeLessThan(500); // 10 requests in under 500ms
  });
});
```

## Variants

### Supertest Style Testing

```typescript
// Using a test helper for supertest-like API
class ApiTestClient {
  async get(url: string, options?: RequestOptions) {
    const request = createMockRequest(url, { ...options, method: 'GET' });
    const handler = await import(`@/app/api${url}/route`).then(m => m.GET);
    return handler(request);
  }

  async post(url: string, body: unknown, options?: RequestOptions) {
    const request = createMockRequest(url, { ...options, method: 'POST', body });
    const handler = await import(`@/app/api${url}/route`).then(m => m.POST);
    return handler(request);
  }
}

const api = new ApiTestClient();

// Usage
const response = await api.get('/users');
expect(response.status).toBe(200);
```

## Anti-Patterns

```typescript
// Bad: Testing implementation details
expect(prisma.user.findMany).toHaveBeenCalledWith({
  // Exact query structure - brittle!
});

// Good: Test behavior
expect(data.data).toHaveLength(2);
expect(data.data[0].email).toBe('test@example.com');

// Bad: No error case testing
// Only testing happy path

// Good: Test error scenarios
it('handles database errors gracefully', async () => {
  vi.mocked(prisma.user.findMany).mockRejectedValue(new Error('DB error'));
  const response = await GET(request);
  expect(response.status).toBe(500);
});
```

## Related Skills

- `testing-integration` - Integration testing
- `testing-unit` - Unit testing patterns
- `mocking` - Mocking strategies
- `rest-api-design` - API design

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial API testing pattern
