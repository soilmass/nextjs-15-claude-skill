---
id: pt-testing-integration
name: Integration Testing
version: 2.0.0
layer: L5
category: testing
description: Test API routes, database operations, and component integration
tags: [testing, integration, vitest, api, database, next15, react19]
composes: []
dependencies:
  vitest: "^2.1.0"
formula: "Real database + API routes + MSW = full stack validation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Integration Testing

## Overview

Integration tests verify that multiple parts of your application work together correctly. This pattern covers testing API routes, database operations, Server Actions, and component integration with real or mocked dependencies.

## When to Use

- **API + Database**: Test CRUD operations with real database connections
- **Server Actions**: Validate form submissions and mutations end-to-end
- **Component integration**: Test components with their data providers
- **Authentication flows**: Test login/logout with real sessions
- **Multi-service**: Validate interactions between microservices
- **Data consistency**: Ensure foreign key relationships and transactions work

## Composition Diagram

```
+------------------+     +-------------------+     +------------------+
| Test Database    | --> | API Route Handler | --> | Response         |
| (Prisma/SQLite)  |     | (real execution)  |     | Validation       |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
| Test Fixtures    |     | Server Actions    |     | MSW Handlers     |
| (seeded data)    |     | (form mutations)  |     | (external APIs)  |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
| Unit Tests       |     | API Testing       |
| (mocked)         |     | (validation)      |
+------------------+     +-------------------+
```

## Test Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.integration.test.{ts,tsx}'],
    globals: true,
    testTimeout: 30000,
    poolOptions: {
      threads: {
        singleThread: true, // Important for database tests
      },
    },
  },
});

// tests/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '@/lib/db';

// Clean database before all tests
beforeAll(async () => {
  // Use test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
});

// Clean up after each test
afterEach(async () => {
  // Delete test data in correct order (respecting foreign keys)
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
```

## API Route Testing

```typescript
// tests/api/users.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { prisma } from '@/lib/db';
import { createTestUser, createAuthHeaders } from '../helpers';

describe('Users API', () => {
  let testUser: any;
  let authHeaders: Headers;

  beforeEach(async () => {
    testUser = await createTestUser();
    authHeaders = await createAuthHeaders(testUser);
  });

  describe('GET /api/users', () => {
    it('returns list of users for authenticated requests', async () => {
      // Create additional users
      await createTestUser({ email: 'user2@test.com' });
      await createTestUser({ email: 'user3@test.com' });

      const request = new NextRequest('http://localhost/api/users', {
        headers: authHeaders,
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('email');
      expect(data[0]).not.toHaveProperty('password');
    });

    it('returns 401 for unauthenticated requests', async () => {
      const request = new NextRequest('http://localhost/api/users');

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('supports pagination', async () => {
      // Create 15 users
      for (let i = 0; i < 15; i++) {
        await createTestUser({ email: `user${i}@test.com` });
      }

      const request = new NextRequest(
        'http://localhost/api/users?page=1&limit=10',
        { headers: authHeaders }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(10);
      expect(data.pagination.total).toBe(16); // 15 + testUser
      expect(data.pagination.totalPages).toBe(2);
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user with valid data', async () => {
      const userData = {
        email: 'newuser@test.com',
        name: 'New User',
        password: 'securepassword123',
      };

      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: {
          ...Object.fromEntries(authHeaders),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.email).toBe(userData.email);
      expect(data.name).toBe(userData.name);
      expect(data).not.toHaveProperty('password');

      // Verify in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(dbUser).not.toBeNull();
    });

    it('returns 400 for invalid data', async () => {
      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: {
          ...Object.fromEntries(authHeaders),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'invalid' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('returns 409 for duplicate email', async () => {
      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: {
          ...Object.fromEntries(authHeaders),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          name: 'Duplicate',
          password: 'password123',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(409);
    });
  });
});
```

## Database Integration Tests

```typescript
// tests/db/posts.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import {
  createPost,
  updatePost,
  deletePost,
  getPostsByAuthor,
} from '@/lib/posts';
import { createTestUser } from '../helpers';

describe('Posts Database Operations', () => {
  let author: any;

  beforeEach(async () => {
    author = await createTestUser();
  });

  describe('createPost', () => {
    it('creates a post with all fields', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test content',
        published: true,
        authorId: author.id,
      };

      const post = await createPost(postData);

      expect(post.id).toBeDefined();
      expect(post.title).toBe(postData.title);
      expect(post.content).toBe(postData.content);
      expect(post.published).toBe(true);
      expect(post.authorId).toBe(author.id);
      expect(post.createdAt).toBeInstanceOf(Date);
    });

    it('generates slug from title', async () => {
      const post = await createPost({
        title: 'My Amazing Post Title',
        content: 'Content',
        authorId: author.id,
      });

      expect(post.slug).toBe('my-amazing-post-title');
    });

    it('handles duplicate slugs', async () => {
      await createPost({
        title: 'Same Title',
        content: 'Content 1',
        authorId: author.id,
      });

      const post2 = await createPost({
        title: 'Same Title',
        content: 'Content 2',
        authorId: author.id,
      });

      expect(post2.slug).toMatch(/same-title-\d+/);
    });
  });

  describe('updatePost', () => {
    it('updates post fields', async () => {
      const post = await createPost({
        title: 'Original',
        content: 'Original content',
        authorId: author.id,
      });

      const updated = await updatePost(post.id, {
        title: 'Updated Title',
        published: true,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.published).toBe(true);
      expect(updated.content).toBe('Original content');
    });

    it('updates slug when title changes', async () => {
      const post = await createPost({
        title: 'Original Title',
        content: 'Content',
        authorId: author.id,
      });

      const updated = await updatePost(post.id, {
        title: 'New Title',
      });

      expect(updated.slug).toBe('new-title');
    });
  });

  describe('deletePost', () => {
    it('deletes post and related data', async () => {
      const post = await createPost({
        title: 'To Delete',
        content: 'Content',
        authorId: author.id,
      });

      // Add related data
      await prisma.comment.create({
        data: {
          content: 'Comment',
          postId: post.id,
          authorId: author.id,
        },
      });

      await deletePost(post.id);

      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      const comments = await prisma.comment.findMany({
        where: { postId: post.id },
      });

      expect(deletedPost).toBeNull();
      expect(comments).toHaveLength(0);
    });
  });

  describe('getPostsByAuthor', () => {
    it('returns only author posts', async () => {
      const otherUser = await createTestUser({ email: 'other@test.com' });

      await createPost({ title: 'Post 1', content: 'C', authorId: author.id });
      await createPost({ title: 'Post 2', content: 'C', authorId: author.id });
      await createPost({ title: 'Other', content: 'C', authorId: otherUser.id });

      const posts = await getPostsByAuthor(author.id);

      expect(posts).toHaveLength(2);
      expect(posts.every((p) => p.authorId === author.id)).toBe(true);
    });

    it('returns posts in descending order by date', async () => {
      await createPost({ title: 'First', content: 'C', authorId: author.id });
      await new Promise((r) => setTimeout(r, 10)); // Ensure different timestamps
      await createPost({ title: 'Second', content: 'C', authorId: author.id });

      const posts = await getPostsByAuthor(author.id);

      expect(posts[0].title).toBe('Second');
      expect(posts[1].title).toBe('First');
    });
  });
});
```

## Server Action Testing

```typescript
// tests/actions/posts.integration.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPost, updatePost, deletePost } from '@/app/actions/posts';
import { prisma } from '@/lib/db';
import { createTestUser } from '../helpers';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';

describe('Post Server Actions', () => {
  let testUser: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    vi.mocked(auth).mockResolvedValue({
      user: { id: testUser.id, email: testUser.email },
    } as any);
  });

  describe('createPost', () => {
    it('creates post for authenticated user', async () => {
      const formData = new FormData();
      formData.set('title', 'New Post');
      formData.set('content', 'Post content here');

      const result = await createPost(null, formData);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('New Post');

      const dbPost = await prisma.post.findFirst({
        where: { title: 'New Post' },
      });
      expect(dbPost).not.toBeNull();
      expect(dbPost?.authorId).toBe(testUser.id);
    });

    it('returns errors for invalid data', async () => {
      const formData = new FormData();
      formData.set('title', ''); // Invalid: empty title
      formData.set('content', 'Content');

      const result = await createPost(null, formData);

      expect(result.success).toBe(false);
      expect(result.errors?.title).toBeDefined();
    });

    it('requires authentication', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const formData = new FormData();
      formData.set('title', 'Post');
      formData.set('content', 'Content');

      await expect(createPost(null, formData)).rejects.toThrow('Unauthorized');
    });
  });

  describe('deletePost', () => {
    it('deletes own post', async () => {
      const post = await prisma.post.create({
        data: {
          title: 'To Delete',
          content: 'Content',
          authorId: testUser.id,
        },
      });

      const result = await deletePost(post.id);

      expect(result.success).toBe(true);

      const dbPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(dbPost).toBeNull();
    });

    it('prevents deleting other user posts', async () => {
      const otherUser = await createTestUser({ email: 'other@test.com' });
      const post = await prisma.post.create({
        data: {
          title: 'Other Post',
          content: 'Content',
          authorId: otherUser.id,
        },
      });

      await expect(deletePost(post.id)).rejects.toThrow('Forbidden');
    });
  });
});
```

## Component Integration Testing

```typescript
// tests/components/post-list.integration.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostsList } from '@/components/posts-list';
import { prisma } from '@/lib/db';
import { createTestUser } from '../helpers';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/posts', async () => {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: { select: { name: true } } },
    });
    return HttpResponse.json(posts);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('PostsList Integration', () => {
  let author: any;

  beforeEach(async () => {
    author = await createTestUser({ name: 'Test Author' });
  });

  it('displays posts from database', async () => {
    await prisma.post.createMany({
      data: [
        { title: 'Post 1', content: 'Content 1', published: true, authorId: author.id },
        { title: 'Post 2', content: 'Content 2', published: true, authorId: author.id },
      ],
    });

    renderWithProviders(<PostsList />);

    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
      expect(screen.getByText('Post 2')).toBeInTheDocument();
    });
  });

  it('does not display unpublished posts', async () => {
    await prisma.post.createMany({
      data: [
        { title: 'Published', content: 'C', published: true, authorId: author.id },
        { title: 'Draft', content: 'C', published: false, authorId: author.id },
      ],
    });

    renderWithProviders(<PostsList />);

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
  });

  it('shows empty state when no posts', async () => {
    renderWithProviders(<PostsList />);

    await waitFor(() => {
      expect(screen.getByText(/no posts/i)).toBeInTheDocument();
    });
  });
});
```

## Test Helpers

```typescript
// tests/helpers/index.ts
import { prisma } from '@/lib/db';
import { hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export async function createTestUser(overrides: Partial<any> = {}) {
  const password = await hash('testpassword', 10);

  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@test.com`,
      name: 'Test User',
      password,
      ...overrides,
    },
  });
}

export async function createAuthHeaders(user: any): Promise<Headers> {
  const token = sign(
    { userId: user.id, email: user.email },
    process.env.AUTH_SECRET!,
    { expiresIn: '1h' }
  );

  const headers = new Headers();
  headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export async function seedDatabase() {
  const user = await createTestUser();

  await prisma.post.createMany({
    data: [
      { title: 'Post 1', content: 'Content', published: true, authorId: user.id },
      { title: 'Post 2', content: 'Content', published: true, authorId: user.id },
    ],
  });

  return { user };
}
```

## Anti-patterns

### Don't Share State Between Tests

```typescript
// BAD - Tests affect each other
let sharedUser: any;

beforeAll(async () => {
  sharedUser = await createUser(); // Modified by tests
});

// GOOD - Create fresh data per test
let user: any;

beforeEach(async () => {
  user = await createTestUser(); // Fresh for each test
});

afterEach(async () => {
  await cleanupDatabase();
});
```

### Don't Skip Database Cleanup

```typescript
// BAD - Data accumulates
it('creates user', async () => {
  await prisma.user.create({ data: { email: 'test@test.com' } });
  // No cleanup
});

// GOOD - Clean up after each test
afterEach(async () => {
  await prisma.user.deleteMany();
});
```

## Related Skills

- [testing-unit](./testing-unit.md)
- [testing-e2e](./testing-e2e.md)
- [testing-components](./testing-components.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- API route testing
- Database testing
- Server Action testing
- Component integration
- Test helpers
