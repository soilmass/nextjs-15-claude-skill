---
id: pt-trpc
name: tRPC Integration
version: 2.1.0
layer: L5
category: data
description: End-to-end type-safe APIs with tRPC in Next.js App Router
tags: [api, trpc, typescript, type-safety, next15, react19]
composes:
  - ../atoms/display-skeleton.md
  - ../atoms/input-button.md
  - ../atoms/feedback-toast.md
  - ../molecules/card.md
  - ../organisms/data-table.md
dependencies: []
formula: "tRPC = router + procedure + useQuery + useMutation + Skeleton(a-display-skeleton) + Toast(a-feedback-toast)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# tRPC Integration

## Overview

tRPC enables end-to-end type-safe APIs without code generation. Combined with Next.js App Router, it provides seamless server-client communication with full TypeScript inference. This pattern covers setup, routers, and React Query integration.

## When to Use

- Full-stack TypeScript applications
- Teams wanting end-to-end type safety
- Rapid prototyping with type inference
- When GraphQL feels too heavy
- Projects not needing public APIs

## Composition Diagram

```
+------------------------------------------+
|              tRPC Pattern                |
|  +------------------------------------+  |
|  |    Router (server/routers/*.ts)   |  |
|  |  publicProcedure, protectedProc.  |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |    Route Handler (/api/trpc)      |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |    tRPC Client (lib/trpc/client)  |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  trpc.*.useQuery / useMutation    |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Server Setup

```typescript
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const session = await getSession();

  return {
    session,
    prisma,
    headers: opts.req.headers,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

// Admin procedure
const enforceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user || ctx.session.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

export const adminProcedure = t.procedure.use(enforceAdmin);
```

## Router Definition

```typescript
// server/routers/user.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  // Public: Get user by ID
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: { id: true, name: true, image: true },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return user;
    }),

  // Protected: Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: { settings: true },
    });
  }),

  // Protected: Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        bio: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
      });
    }),
});

// server/routers/post.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const postRouter = router({
  // List posts with pagination
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        where: { published: true },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return { posts, nextCursor };
    }),

  // Create post
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(10),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.create({
        data: {
          ...input,
          authorId: ctx.user.id,
        },
      });
    }),

  // Infinite posts
  infinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: typeof cursor = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return { items: posts, nextCursor };
    }),
});

// server/routers/_app.ts
import { router } from '../trpc';
import { userRouter } from './user';
import { postRouter } from './post';

export const appRouter = router({
  user: userRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
```

## Route Handler

```typescript
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC error on ${path}:`, error);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
```

## Client Setup

```typescript
// lib/trpc/client.ts
'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

// lib/trpc/provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

// app/layout.tsx
import { TRPCProvider } from '@/lib/trpc/provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
```

## Usage in Components

```typescript
// components/posts-list.tsx
'use client';

import { trpc } from '@/lib/trpc/client';
import { PostCard } from './post-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function PostsList() {
  const { data, isLoading, error } = trpc.post.list.useQuery({
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  return (
    <div className="space-y-4">
      {data?.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// components/create-post-form.tsx
'use client';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function CreatePostForm() {
  const utils = trpc.useUtils();

  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      toast.success('Post created!');
      utils.post.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createPost.mutate({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      published: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="title" placeholder="Title" required />
      <Textarea name="content" placeholder="Content" rows={5} required />
      <Button type="submit" disabled={createPost.isPending}>
        {createPost.isPending ? 'Creating...' : 'Create Post'}
      </Button>
    </form>
  );
}

// components/infinite-posts.tsx
'use client';

import { trpc } from '@/lib/trpc/client';
import { useEffect, useRef } from 'react';

export function InfinitePosts() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.post.infinite.useInfiniteQuery(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id}>{post.title}</article>
      ))}
      <div ref={loadMoreRef}>
        {isFetchingNextPage && <p>Loading more...</p>}
      </div>
    </div>
  );
}
```

## Server-Side Calls

```typescript
// lib/trpc/server.ts
import 'server-only';

import { createContext } from '@/server/trpc';
import { appRouter } from '@/server/routers/_app';
import { headers } from 'next/headers';

export const createCaller = async () => {
  const context = await createContext({
    req: {
      headers: await headers(),
    } as any,
    resHeaders: new Headers(),
  });

  return appRouter.createCaller(context);
};

// app/posts/page.tsx
import { createCaller } from '@/lib/trpc/server';
import { PostsList } from '@/components/posts-list';

export default async function PostsPage() {
  const trpc = await createCaller();
  const { posts } = await trpc.post.list({ limit: 10 });

  return (
    <div>
      <h1>Posts</h1>
      {/* Pass data to client component */}
      <PostsList initialPosts={posts} />
    </div>
  );
}
```

## Anti-patterns

### Don't Call tRPC in Server Components Directly

```typescript
// BAD - Using client hook in Server Component
export default async function Page() {
  const { data } = trpc.post.list.useQuery(); // Won't work!
}

// GOOD - Use server caller
export default async function Page() {
  const trpc = await createCaller();
  const data = await trpc.post.list({ limit: 10 });
}
```

### Don't Forget Input Validation

```typescript
// BAD - No validation
export const postRouter = router({
  create: protectedProcedure
    .mutation(async ({ ctx, input }) => {
      // input is any!
    }),
});

// GOOD - Always validate with Zod
export const postRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      // input is typed!
    }),
});
```

## Related Skills

- [react-query](./react-query.md)
- [route-handlers](./route-handlers.md)
- [server-actions](./server-actions.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Server setup
- Router definition
- Client configuration
- React Query integration
- Server-side calls
- Infinite queries
