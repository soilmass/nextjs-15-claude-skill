---
id: pt-server-state
name: Server State
version: 2.0.0
layer: L5
category: state
description: Manage server state in Next.js 15 with Server Components
tags: [state, server, server-components]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-text.md
dependencies: []
formula: Server Components + unstable_cache + Server Actions = Zero-Client State
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Server State Pattern

## When to Use

- **Data from database/API**: User profiles, product lists, content
- **SEO-critical content**: Blog posts, product pages that need SSR
- **Shared across users**: Public data that benefits from caching
- **Real-time freshness not required**: Data that can be cached/revalidated
- **Reducing client JavaScript**: Moving data fetching to the server

**Avoid when**: Data is user-specific and changes frequently, real-time updates needed, or offline-first requirements.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Server State Architecture                                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Data Access Layer (lib/data/*.ts)                     │  │
│  │  ├─ cache() ──── request-level deduplication          │  │
│  │  └─ unstable_cache() ──── cross-request caching       │  │
│  │       ├─ tags: ['users'] for invalidation             │  │
│  │       └─ revalidate: 60 seconds                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Server Component (app/users/page.tsx)                 │  │
│  │  ├─ await getUsers(page, search)                      │  │
│  │  └─ <Suspense fallback={<Skeleton/>}>                 │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌────────────┐     ┌────────────────────────────────────┐  │
│  │ UserStats  │     │ UserList (Server)                  │  │
│  │ [Skeleton] │     │ [Skeleton]                         │  │
│  └────────────┘     └────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Server Actions (app/actions/users.ts)                 │  │
│  │  ├─ updateUser() ──► revalidateTag('users')           │  │
│  │  └─ deleteUser() ──► revalidatePath('/users')         │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ UserProfileForm (Client Component)                    │  │
│  │  ├─ useActionState(updateUser)                        │  │
│  │  ├─ [Input] [Button] with useFormStatus               │  │
│  │  └─ Optimistic updates via useOptimistic              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Server state in Next.js 15 refers to data that lives on the server and is fetched/mutated through Server Components and Server Actions. This pattern covers managing server state efficiently with proper caching, revalidation, and optimistic updates.

## Implementation

### Server State with Server Components

```typescript
// lib/server-state/types.ts
export interface ServerStateConfig<T> {
  fetcher: () => Promise<T>;
  cacheKey: string[];
  revalidate?: number | false;
  tags?: string[];
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ServerQueryResult<T> {
  data: T;
  timestamp: number;
}
```

### Data Access Layer

```typescript
// lib/data/users.ts
import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { User } from '@prisma/client';
import type { PaginatedData } from '@/lib/server-state/types';

// Request-level deduplication with React cache
export const getCurrentUser = cache(async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
});

// Cross-request caching with unstable_cache
export const getUser = unstable_cache(
  async (userId: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
      },
    });
  },
  ['user'],
  {
    tags: ['users'],
    revalidate: 60, // 1 minute
  }
);

// List with pagination
export const getUsers = unstable_cache(
  async (
    page = 1,
    pageSize = 10,
    search?: string
  ): Promise<PaginatedData<User>> => {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  },
  ['users-list'],
  {
    tags: ['users'],
    revalidate: 30,
  }
);

// Aggregations
export const getUserStats = unstable_cache(
  async () => {
    const [total, activeToday, newThisWeek] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return { total, activeToday, newThisWeek };
  },
  ['user-stats'],
  {
    tags: ['users', 'stats'],
    revalidate: 300, // 5 minutes
  }
);
```

### Server Actions for Mutations

```typescript
// app/actions/users.ts
'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
});

export async function updateUser(
  userId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  
  if (!session?.user || session.user.id !== userId) {
    return { success: false, error: 'Unauthorized' };
  }
  
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    bio: formData.get('bio'),
  };
  
  const result = updateUserSchema.safeParse(rawData);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }
  
  try {
    await prisma.user.update({
      where: { id: userId },
      data: result.data,
    });
    
    // Revalidate cached data
    revalidateTag('users');
    revalidatePath(`/users/${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Update user failed:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    return { success: false, error: 'Unauthorized' };
  }
  
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    
    revalidateTag('users');
    
    return { success: true };
  } catch (error) {
    console.error('Delete user failed:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
```

### Server Component with Data

```tsx
// app/users/page.tsx
import { Suspense } from 'react';
import { getUsers, getUserStats } from '@/lib/data/users';
import { UserList } from '@/components/user-list';
import { UserStats } from '@/components/user-stats';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search;
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Users</h1>
      
      {/* Stats load independently */}
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <UserStatsSection />
      </Suspense>
      
      {/* User list with pagination */}
      <Suspense fallback={<UserListSkeleton />}>
        <UserListSection page={page} search={search} />
      </Suspense>
    </div>
  );
}

async function UserStatsSection() {
  const stats = await getUserStats();
  
  return <UserStats stats={stats} />;
}

async function UserListSection({ page, search }: { page: number; search?: string }) {
  const data = await getUsers(page, 10, search);
  
  return <UserList data={data} />;
}

function UserListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
```

### Client Component with Server State

```tsx
// components/user-profile-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUser } from '@/app/actions/users';
import type { User } from '@prisma/client';

interface UserProfileFormProps {
  user: User;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const updateUserWithId = updateUser.bind(null, user.id);
  
  const [state, formAction] = useActionState(
    async (prevState: { success: boolean; error?: string } | null, formData: FormData) => {
      return updateUserWithId(formData);
    },
    null
  );
  
  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="p-4 bg-green-50 text-green-600 rounded">
          Profile updated successfully!
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={user.name || ''}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={user.email}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={user.bio || ''}
          className="mt-1 block w-full rounded border p-2"
          rows={4}
        />
      </div>
      
      <SubmitButton />
    </form>
  );
}
```

### Hybrid State with React Query

```tsx
// hooks/use-server-state.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch server state with React Query (for client components)
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    staleTime: 60 * 1000, // Consider data stale after 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['user', userId] });
      const previousData = queryClient.getQueryData(['user', userId]);
      
      queryClient.setQueryData(['user', userId], (old: any) => ({
        ...old,
        ...newData,
      }));
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', userId], context?.previousData);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}
```

### Server State with 'use cache'

```typescript
// lib/data/posts.ts (Next.js 15 experimental)
import { prisma } from '@/lib/prisma';
import { cacheLife, cacheTag } from 'next/cache';

export async function getPosts(page = 1, limit = 10) {
  'use cache';
  cacheLife('minutes');
  cacheTag('posts');
  
  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });
  
  return posts;
}

export async function getPost(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`post-${slug}`, 'posts');
  
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      comments: {
        orderBy: { createdAt: 'desc' },
        include: { author: true },
      },
    },
  });
  
  return post;
}
```

## Variants

### Server State with Preloading

```tsx
// lib/data/preload.ts
import { getUser, getUserStats } from './users';

// Preload functions for parallel fetching
export function preloadUser(userId: string) {
  void getUser(userId);
}

export function preloadUserStats() {
  void getUserStats();
}

// Usage in layout
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (session?.user) {
    preloadUser(session.user.id);
    preloadUserStats();
  }
  
  return <>{children}</>;
}
```

### Real-time Server State

```tsx
// hooks/use-realtime-server-state.ts
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/use-websocket';

export function useRealtimeUser(userId: string) {
  const queryClient = useQueryClient();
  const { subscribe, unsubscribe } = useWebSocket();
  
  useEffect(() => {
    const channel = `user:${userId}`;
    
    subscribe(channel, (event) => {
      if (event.type === 'user:updated') {
        queryClient.setQueryData(['user', userId], event.data);
      }
    });
    
    return () => unsubscribe(channel);
  }, [userId, subscribe, unsubscribe, queryClient]);
  
  return useUser(userId);
}
```

## Anti-Patterns

```typescript
// Bad: Fetching in client components without caching
function UserComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser);
  }, [userId]); // No caching, refetches on every mount
}

// Good: Use server components or React Query
async function UserComponent({ userId }: { userId: string }) {
  const user = await getUser(userId); // Cached
  return <div>{user.name}</div>;
}

// Bad: Not invalidating cache after mutations
async function updateUser(data: any) {
  await prisma.user.update({ where: { id: data.id }, data });
  // Missing revalidation!
}

// Good: Invalidate related caches
async function updateUser(data: any) {
  await prisma.user.update({ where: { id: data.id }, data });
  revalidateTag('users');
  revalidatePath(`/users/${data.id}`);
}
```

## Related Skills

- `server-components-data` - Server component data fetching
- `server-actions` - Server mutations
- `react-query` - Client-side data management
- `revalidation` - Cache invalidation strategies

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial server state management pattern
