# Next.js 15 Full-Stack Integration Skills

> **Expert Review by**: Simulated collective expertise of Kent C. Dodds, Theo Browne, Josh Comeau, Dan Abramov, Tanner Linsley, Ryan Florence, Lee Robinson, Guillermo Rauch, Wes Bos, and Matt Pocock
> 
> **Analysis of**: Current 158 skills across 7 layers + 7 showcase projects

---

## Executive Summary

Your current repository has **strong foundational coverage** but lacks critical **full-stack integration patterns** that separate production-ready apps from demos. This document adds **87 new skills** organized into 10 integration categories.

### Critical Gaps Identified

| Category | Current Coverage | Gap Severity | New Skills |
|----------|------------------|--------------|------------|
| Type Safety E2E | Partial | **CRITICAL** | 12 |
| Data Fetching Patterns | Good | Medium | 8 |
| Form Handling | Basic | **HIGH** | 10 |
| State Synchronization | Missing | **CRITICAL** | 9 |
| Error Handling | Basic | **HIGH** | 8 |
| Performance Patterns | Good | Medium | 7 |
| Testing Integration | Minimal | **HIGH** | 11 |
| Developer Experience | Missing | Medium | 6 |
| Deployment Patterns | Basic | **HIGH** | 8 |
| Monitoring & Analytics | Missing | Medium | 8 |

---

## 1. TYPE SAFETY END-TO-END (12 Skills)

### 1.1 Shared Type Definitions

**Skill ID**: `integration/type-safety/shared-definitions`

**Problem**: Types defined separately in frontend and backend drift over time.

**Solution Pattern**:

```typescript
// packages/shared-types/src/index.ts
// Single source of truth for all domain types

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: Pagination;
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };

// Pagination
export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

// Re-export for consuming packages
export * from './user';
export * from './product';
export * from './order';
```

```typescript
// Usage in Next.js app
// app/actions/users.ts
'use server'

import type { User, ApiResult } from '@acme/shared-types';

export async function getUser(id: string): Promise<ApiResult<User>> {
  try {
    const user = await db.users.findUnique({ where: { id } });
    if (!user) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };
    }
    return { success: true, data: user };
  } catch (e) {
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to fetch user' } };
  }
}
```

**File Structure**:
```
monorepo/
  packages/
    shared-types/
      src/
        index.ts
        user.ts
        product.ts
        api.ts
      package.json
      tsconfig.json
  apps/
    web/                  # Next.js app
    api/                  # Optional separate API
```

---

### 1.2 API Contract Enforcement with tRPC

**Skill ID**: `integration/type-safety/trpc-setup`

**Why tRPC**: End-to-end type safety without code generation, runtime validation, works seamlessly with Next.js 15.

```typescript
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import { getSession } from '@/lib/session';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getSession();
  return {
    session,
    db: prisma,
    headers: opts.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError 
          ? error.cause.flatten() 
          : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
```

```typescript
// server/routers/user.ts
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
  }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),

  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      
      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where: search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          } : undefined,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.user.count({
          where: search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          } : undefined,
        }),
      ]);

      return {
        users,
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          totalItems: total,
        },
      };
    }),
});
```

```typescript
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };
```

```typescript
// lib/trpc/client.ts - React Query integration
'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
```

```typescript
// Usage in components
'use client';

import { trpc } from '@/lib/trpc/client';

export function UserList() {
  const { data, isLoading, error } = trpc.user.list.useQuery({
    page: 1,
    pageSize: 20,
  });

  // Full type inference - data is typed!
  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {data.users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

### 1.3 Database Schema to TypeScript (Prisma + Drizzle)

**Skill ID**: `integration/type-safety/db-schema-types`

**Pattern A: Prisma (Recommended for most cases)**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

generator zod {
  provider = "zod-prisma-types"
  output   = "../src/generated/zod"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id          String   @id @default(cuid())
  title       String
  content     String?
  published   Boolean  @default(false)
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
  EDITOR
}
```

```typescript
// Generated: src/generated/zod/index.ts
// Auto-generated Zod schemas matching Prisma models

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.enum(['USER', 'ADMIN', 'EDITOR']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'EDITOR']).optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
```

**Pattern B: Drizzle (Better performance, SQL-first)**

```typescript
// db/schema.ts
import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const roleEnum = pgEnum('role', ['user', 'admin', 'editor']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  authorId: text('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Auto-generated Zod schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(2).optional(),
});

export const selectUserSchema = createSelectSchema(users);

// Inferred types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

---

### 1.4 Form Validation Schema Sharing

**Skill ID**: `integration/type-safety/shared-validation`

**The Problem**: Validation logic duplicated between client forms and server actions.

**Solution**: Single Zod schema used everywhere.

```typescript
// lib/validations/user.ts
import { z } from 'zod';

// Base schema - single source of truth
export const userSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Derived schemas for different contexts
export const loginSchema = userSchema.pick({
  email: true,
  password: true,
});

export const registerSchema = userSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const updateProfileSchema = userSchema.pick({
  name: true,
  email: true,
}).partial();

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

```typescript
// app/actions/auth.ts
'use server';

import { loginSchema, registerSchema } from '@/lib/validations/user';
import { createSession } from '@/lib/session';

export async function login(formData: FormData) {
  // Server-side validation with same schema
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const user = await verifyCredentials(result.data);
  if (!user) {
    return {
      success: false,
      errors: { email: ['Invalid email or password'] },
    };
  }

  await createSession(user.id);
  redirect('/dashboard');
}
```

```typescript
// components/forms/login-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/user';
import { login } from '@/app/actions/auth';

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema), // Same schema!
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginInput) {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    
    const result = await login(formData);
    
    if (!result.success) {
      // Map server errors to form
      Object.entries(result.errors).forEach(([field, errors]) => {
        form.setError(field as keyof LoginInput, {
          message: errors?.[0],
        });
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... */}
      </form>
    </Form>
  );
}
```

---

### 1.5 Runtime Type Checking (Zod Guard Pattern)

**Skill ID**: `integration/type-safety/runtime-validation`

```typescript
// lib/api-guard.ts
import { z, ZodSchema } from 'zod';

// Generic API response validator
export function createApiGuard<T extends ZodSchema>(schema: T) {
  return {
    parse: (data: unknown): z.infer<T> => {
      return schema.parse(data);
    },
    safeParse: (data: unknown) => {
      return schema.safeParse(data);
    },
    // For fetch responses
    async parseResponse(response: Response): Promise<z.infer<T>> {
      const data = await response.json();
      return schema.parse(data);
    },
  };
}

// Usage
const userResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
});

const userGuard = createApiGuard(userResponseSchema);

// In your data fetching
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  // Runtime validation - throws if schema doesn't match
  const data = await userGuard.parseResponse(response);
  
  // data is now fully typed
  return data.user;
}
```

```typescript
// Environment variable validation
// env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  // Public vars (available on client)
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
});

// Validate at build/start time
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

// Type-safe env access
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
```

---

### 1.6-1.12 Additional Type Safety Skills

| Skill ID | Name | Description |
|----------|------|-------------|
| `integration/type-safety/infer-types` | TypeScript Inference Patterns | Leveraging `typeof`, `ReturnType`, `Awaited` for derived types |
| `integration/type-safety/branded-types` | Branded/Nominal Types | `UserId`, `ProductId` to prevent mixing IDs |
| `integration/type-safety/discriminated-unions` | Discriminated Unions for State | Type-safe state machines |
| `integration/type-safety/generic-components` | Generic Component Patterns | Type-safe DataTable<T>, List<T> |
| `integration/type-safety/strict-config` | Strict TypeScript Config | `strict: true`, `noUncheckedIndexedAccess` |
| `integration/type-safety/type-predicates` | Type Guards & Predicates | `isUser(data)`, `hasPermission(user)` |
| `integration/type-safety/api-types-openapi` | OpenAPI Type Generation | Generate types from OpenAPI spec |

---

## 2. DATA FETCHING PATTERNS (8 Skills)

### 2.1 React Query vs SWR vs Native - Decision Matrix

**Skill ID**: `integration/data-fetching/library-selection`

| Factor | React Query | SWR | Native fetch | Server Components |
|--------|-------------|-----|--------------|-------------------|
| **Bundle Size** | ~13KB | ~4KB | 0KB | 0KB |
| **Best For** | Complex apps | Simple apps | SSR/static | RSC-first apps |
| **Mutations** | Excellent | Good | Manual | Server Actions |
| **Caching** | Advanced | Good | Manual | Built-in |
| **Devtools** | Yes | Yes | No | No |
| **Offline** | Yes | Limited | No | No |
| **Next.js 15** | Client only | Client only | Both | Server only |

**Recommendation Matrix**:

```typescript
// When to use what:

// 1. Server Components (DEFAULT in Next.js 15)
// Use for: Initial page data, SEO content, static data
async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.products.findUnique({ where: { id } });
  return <ProductDetails product={product} />;
}

// 2. React Query (Complex client-side state)
// Use for: Dashboards, real-time data, complex cache invalidation
'use client';
function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => fetchDashboardData(userId),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // 30 seconds
  });
}

// 3. SWR (Simple client-side with good DX)
// Use for: User-specific data, simple polling
'use client';
function UserProfile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher, {
    revalidateOnFocus: true,
  });
}

// 4. Native fetch + use() hook (RSC patterns)
// Use for: Streaming data to client components
function Parent() {
  const dataPromise = fetchData(); // Don't await!
  return (
    <Suspense fallback={<Loading />}>
      <Child dataPromise={dataPromise} />
    </Suspense>
  );
}

'use client';
function Child({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise); // Suspends until resolved
  return <div>{data.title}</div>;
}
```

---

### 2.2 Optimistic Updates Pattern

**Skill ID**: `integration/data-fetching/optimistic-updates`

```typescript
// Pattern 1: React Query Optimistic Updates
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike } from '@/app/actions/posts';

function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleLike(postId),
    
    // Optimistic update
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts', postId] });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(['posts', postId]);

      // Optimistically update
      queryClient.setQueryData(['posts', postId], (old: Post) => ({
        ...old,
        liked: !old.liked,
        likeCount: old.liked ? old.likeCount - 1 : old.likeCount + 1,
      }));

      return { previousPost };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['posts', postId], context?.previousPost);
      toast.error('Failed to update like');
    },

    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
  });

  return (
    <button 
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Updating...' : liked ? 'Unlike' : 'Like'}
      ({likeCount})
    </button>
  );
}
```

```typescript
// Pattern 2: React 19 useOptimistic + Server Actions
'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleLike } from '@/app/actions/posts';

function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, addOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: newLiked ? state.count + 1 : state.count - 1,
    })
  );

  async function handleLike() {
    startTransition(async () => {
      // Immediate UI update
      addOptimistic(!optimisticState.liked);
      
      // Server mutation
      const result = await toggleLike(postId);
      
      if (!result.success) {
        // Revalidation will fix the state
        toast.error('Failed to update');
      }
    });
  }

  return (
    <button onClick={handleLike} disabled={isPending}>
      {optimisticState.liked ? 'Unlike' : 'Like'}
      ({optimisticState.count})
    </button>
  );
}
```

---

### 2.3 Infinite Scroll Implementation

**Skill ID**: `integration/data-fetching/infinite-scroll`

```typescript
// Server Action for paginated data
'use server';

export async function getProducts(cursor?: string, limit = 20) {
  const products = await db.products.findMany({
    take: limit + 1, // Fetch one extra to check if more exist
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = products.length > limit;
  const items = hasMore ? products.slice(0, -1) : products;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}
```

```typescript
// Infinite scroll hook with Intersection Observer
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { getProducts } from '@/app/actions/products';

function ProductGrid() {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Trigger 100px before reaching bottom
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => getProducts(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Auto-fetch when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <ProductGridSkeleton />;
  if (error) return <Error message={error.message} />;

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Sentinel element */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && <Spinner />}
        {!hasNextPage && products.length > 0 && (
          <p className="text-muted-foreground">No more products</p>
        )}
      </div>
    </>
  );
}
```

---

### 2.4 Prefetching Strategies

**Skill ID**: `integration/data-fetching/prefetching`

```typescript
// Pattern 1: Link prefetch (automatic in Next.js)
import Link from 'next/link';

// Prefetches on hover/viewport by default
<Link href="/products/123">View Product</Link>

// Control prefetching
<Link href="/products/123" prefetch={false}>View Product</Link> // Disable
<Link href="/products/123" prefetch={true}>View Product</Link>  // Full prefetch

// Pattern 2: Router prefetch (programmatic)
'use client';

import { useRouter } from 'next/navigation';

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();

  return (
    <div
      onMouseEnter={() => router.prefetch(`/products/${product.id}`)}
      onClick={() => router.push(`/products/${product.id}`)}
    >
      {product.name}
    </div>
  );
}

// Pattern 3: React Query prefetch
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

// Server Component - prefetch on server
async function ProductsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductList />
    </HydrationBoundary>
  );
}

// Pattern 4: Parallel data prefetching
async function DashboardPage() {
  // Start all fetches in parallel
  const [userPromise, statsPromise, notificationsPromise] = [
    getUser(),
    getStats(),
    getNotifications(),
  ];

  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserHeader userPromise={userPromise} />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsGrid statsPromise={statsPromise} />
      </Suspense>
      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsList notificationsPromise={notificationsPromise} />
      </Suspense>
    </div>
  );
}
```

---

### 2.5-2.8 Additional Data Fetching Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/data-fetching/error-boundaries` | Data Error Boundaries | `error.tsx` + React error boundary hierarchy |
| `integration/data-fetching/loading-states` | Loading State Management | Skeleton vs Spinner decision tree |
| `integration/data-fetching/cache-invalidation` | Cache Invalidation Patterns | `revalidatePath`, `revalidateTag`, query invalidation |
| `integration/data-fetching/polling-realtime` | Polling & Real-time Updates | SSE, WebSockets, polling intervals |

---

## 3. FORM HANDLING (10 Skills)

### 3.1 Server Actions with react-hook-form

**Skill ID**: `integration/forms/rhf-server-actions`

```typescript
// lib/validations/contact.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.enum(['general', 'support', 'sales', 'partnership']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

```typescript
// app/actions/contact.ts
'use server';

import { contactSchema, type ContactInput } from '@/lib/validations/contact';
import { resend } from '@/lib/resend';

export type ContactState = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof ContactInput, string[]>>;
};

export async function submitContact(
  prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  const result = contactSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await resend.emails.send({
      from: 'Contact Form <noreply@example.com>',
      to: 'support@example.com',
      subject: `Contact: ${result.data.subject}`,
      html: `
        <p><strong>From:</strong> ${result.data.name} (${result.data.email})</p>
        <p><strong>Message:</strong></p>
        <p>${result.data.message}</p>
      `,
    });

    return {
      success: true,
      message: 'Thank you! We will get back to you soon.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to send message. Please try again.',
    };
  }
}
```

```typescript
// components/forms/contact-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState, useEffect, useRef } from 'react';
import { contactSchema, type ContactInput } from '@/lib/validations/contact';
import { submitContact, type ContactState } from '@/app/actions/contact';
import { toast } from 'sonner';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(
    submitContact,
    { success: false }
  );

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: 'general',
      message: '',
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Sync server errors to form
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, errors]) => {
        if (errors?.[0]) {
          form.setError(field as keyof ContactInput, {
            type: 'server',
            message: errors[0],
          });
        }
      });
    }
    if (state.success) {
      toast.success(state.message);
      form.reset();
    }
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={form.handleSubmit(() => {
          // Client validation passed, submit to server
          formRef.current?.requestSubmit();
        })}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={5}
                  disabled={isPending}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                {field.value.length}/1000 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </form>
    </Form>
  );
}
```

---

### 3.2 Progressive Enhancement Pattern

**Skill ID**: `integration/forms/progressive-enhancement`

```typescript
// Forms that work without JavaScript

// app/actions/newsletter.ts
'use server';

import { redirect } from 'next/navigation';

export async function subscribeNewsletter(formData: FormData) {
  const email = formData.get('email') as string;
  
  if (!email || !email.includes('@')) {
    // Redirect with error (works without JS)
    redirect('/newsletter?error=invalid-email');
  }

  try {
    await addSubscriber(email);
    redirect('/newsletter?success=true');
  } catch {
    redirect('/newsletter?error=failed');
  }
}
```

```typescript
// components/newsletter-form.tsx
// Works WITHOUT JavaScript, enhanced WITH JavaScript

import { subscribeNewsletter } from '@/app/actions/newsletter';

export function NewsletterForm({ 
  searchParams 
}: { 
  searchParams: { error?: string; success?: string } 
}) {
  const error = searchParams.error;
  const success = searchParams.success;

  return (
    <div>
      {success && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Successfully subscribed!</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error === 'invalid-email' 
              ? 'Please enter a valid email' 
              : 'Failed to subscribe. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <form action={subscribeNewsletter} className="flex gap-2">
        <Input
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          className="flex-1"
        />
        <Button type="submit">Subscribe</Button>
      </form>
    </div>
  );
}

// Enhanced version with JS
'use client';

export function EnhancedNewsletterForm() {
  const [state, formAction, isPending] = useActionState(
    subscribeNewsletter,
    null
  );

  return (
    <form action={formAction} className="flex gap-2">
      <Input
        name="email"
        type="email"
        placeholder="Enter your email"
        required
        disabled={isPending}
        className="flex-1"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : 'Subscribe'}
      </Button>
    </form>
  );
}
```

---

### 3.3 Multi-step Form State Persistence

**Skill ID**: `integration/forms/multi-step-persistence`

```typescript
// hooks/use-multi-step-form.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface UseMultiStepFormOptions<T> {
  steps: string[];
  initialData: T;
  storageKey?: string;
  syncToUrl?: boolean;
}

export function useMultiStepForm<T extends Record<string, unknown>>({
  steps,
  initialData,
  storageKey = 'multi-step-form',
  syncToUrl = true,
}: UseMultiStepFormOptions<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get initial step from URL or default to 0
  const urlStep = searchParams.get('step');
  const initialStep = urlStep ? steps.indexOf(urlStep) : 0;
  
  const [currentStep, setCurrentStep] = useState(
    initialStep >= 0 ? initialStep : 0
  );
  
  // Load persisted data from sessionStorage
  const [formData, setFormData] = useState<T>(() => {
    if (typeof window === 'undefined') return initialData;
    
    const saved = sessionStorage.getItem(storageKey);
    return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
  });

  // Persist to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey]);

  // Sync step to URL
  useEffect(() => {
    if (!syncToUrl) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('step', steps[currentStep]);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentStep, steps, router, pathname, searchParams, syncToUrl]);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setCurrentStep(0);
    sessionStorage.removeItem(storageKey);
  }, [initialData, storageKey]);

  return {
    currentStep,
    currentStepName: steps[currentStep],
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    progress: ((currentStep + 1) / steps.length) * 100,
    formData,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    reset,
  };
}
```

```typescript
// components/checkout-wizard.tsx
'use client';

import { useMultiStepForm } from '@/hooks/use-multi-step-form';

const STEPS = ['information', 'shipping', 'payment', 'review'];

interface CheckoutData {
  // Information
  email: string;
  firstName: string;
  lastName: string;
  // Shipping
  address: string;
  city: string;
  state: string;
  zip: string;
  // Payment
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const initialData: CheckoutData = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

export function CheckoutWizard() {
  const {
    currentStep,
    currentStepName,
    isFirstStep,
    isLastStep,
    progress,
    formData,
    updateFormData,
    nextStep,
    prevStep,
  } = useMultiStepForm({
    steps: STEPS,
    initialData,
    storageKey: 'checkout-form',
  });

  const handleSubmit = async () => {
    if (isLastStep) {
      // Submit to server
      await submitCheckout(formData);
    } else {
      nextStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {STEPS.map((step, index) => (
            <span
              key={step}
              className={cn(
                'text-sm capitalize',
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStepName === 'information' && (
            <InformationStep
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStepName === 'shipping' && (
            <ShippingStep
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStepName === 'payment' && (
            <PaymentStep
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStepName === 'review' && (
            <ReviewStep data={formData} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmit}>
          {isLastStep ? 'Place Order' : 'Continue'}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
```

---

### 3.4 File Upload with Progress

**Skill ID**: `integration/forms/file-upload-progress`

```typescript
// components/file-uploader.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  url?: string;
  error?: string;
}

interface FileUploaderProps {
  maxFiles?: number;
  maxSize?: number; // bytes
  accept?: Record<string, string[]>;
  onUploadComplete?: (urls: string[]) => void;
}

export function FileUploader({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  onUploadComplete,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const uploadFile = useCallback(async (uploadFile: UploadFile) => {
    const controller = new AbortController();
    abortControllers.current.set(uploadFile.id, controller);

    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
      )
    );

    try {
      // Get presigned URL from your API
      const { uploadUrl, publicUrl } = await fetch('/api/upload/presign', {
        method: 'POST',
        body: JSON.stringify({
          filename: uploadFile.file.name,
          contentType: uploadFile.file.type,
        }),
      }).then((r) => r.json());

      // Upload with progress tracking using XMLHttpRequest
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress } : f
              )
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        // Connect abort controller
        controller.signal.addEventListener('abort', () => xhr.abort());

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', uploadFile.file.type);
        xhr.send(uploadFile.file);
      });

      // Mark as complete
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'complete', progress: 100, url: publicUrl }
            : f
        )
      );

      return publicUrl;
    } catch (error) {
      if ((error as Error).message === 'Upload cancelled') {
        // Remove cancelled file
        setFiles((prev) => prev.filter((f) => f.id !== uploadFile.id));
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
          )
        );
      }
      return null;
    } finally {
      abortControllers.current.delete(uploadFile.id);
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending',
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Upload all files
      const results = await Promise.all(newFiles.map(uploadFile));
      const urls = results.filter((url): url is string => url !== null);
      
      if (onUploadComplete && urls.length > 0) {
        onUploadComplete(urls);
      }
    },
    [uploadFile, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    maxSize,
    accept,
    disabled: files.length >= maxFiles,
  });

  const cancelUpload = (id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxFiles} files, up to {formatBytes(maxSize)} each
            </p>
          </div>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-3 border rounded-lg"
            >
              {/* Preview */}
              {file.file.type.startsWith('image/') && (
                <img
                  src={URL.createObjectURL(file.file)}
                  alt={file.file.name}
                  className="h-10 w-10 object-cover rounded"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.file.size)}
                </p>
              </div>

              {/* Progress / Status */}
              {file.status === 'uploading' && (
                <div className="w-24">
                  <Progress value={file.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {file.progress}%
                  </p>
                </div>
              )}

              {file.status === 'complete' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}

              {file.status === 'error' && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}

              {/* Actions */}
              {file.status === 'uploading' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => cancelUpload(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 3.5-3.10 Additional Form Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/forms/url-state-sync` | Form State URL Persistence | Search/filter forms persisted in URL |
| `integration/forms/autosave` | Autosave Pattern | Debounced save with conflict detection |
| `integration/forms/dependent-fields` | Dependent/Cascading Fields | Country > State > City selectors |
| `integration/forms/array-fields` | Dynamic Array Fields | Add/remove items (tags, phone numbers) |
| `integration/forms/rich-text` | Rich Text Editor Integration | Tiptap/Lexical with server validation |
| `integration/forms/accessible-forms` | Accessible Form Patterns | ARIA, focus management, error announcements |

---

## 4. STATE SYNCHRONIZATION (9 Skills)

### 4.1 URL ↔ State Sync with nuqs

**Skill ID**: `integration/state-sync/url-state`

```typescript
// Using nuqs for type-safe URL state
// https://nuqs.47ng.com/

// lib/search-params.ts
import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs/server';

export const searchParamsCache = createSearchParamsCache({
  // Primitives
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
  sort: parseAsString.withDefault('createdAt'),
  order: parseAsString.withDefault('desc'),
  
  // Arrays
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  
  // Custom parsers
  priceRange: parseAsString.withDefault('').withOptions({
    parse: (value) => {
      const [min, max] = value.split('-').map(Number);
      return { min: min || 0, max: max || Infinity };
    },
    serialize: ({ min, max }) => `${min}-${max === Infinity ? '' : max}`,
  }),
});

export type SearchParams = ReturnType<typeof searchParamsCache.parse>;
```

```typescript
// app/products/page.tsx (Server Component)
import { searchParamsCache } from '@/lib/search-params';
import { ProductFilters } from './product-filters';
import { ProductGrid } from './product-grid';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParamsCache.parse(await searchParams);
  
  const products = await db.products.findMany({
    where: {
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.categories.length > 0 && {
        category: { in: params.categories },
      }),
    },
    orderBy: { [params.sort]: params.order },
    skip: (params.page - 1) * 20,
    take: 20,
  });

  return (
    <div className="grid grid-cols-4 gap-8">
      <aside>
        <ProductFilters />
      </aside>
      <main className="col-span-3">
        <ProductGrid products={products} />
      </main>
    </div>
  );
}
```

```typescript
// components/product-filters.tsx (Client Component)
'use client';

import { useQueryState, parseAsString, parseAsArrayOf } from 'nuqs';
import { useTransition } from 'react';

export function ProductFilters() {
  const [isPending, startTransition] = useTransition();
  
  const [search, setSearch] = useQueryState('search', {
    ...parseAsString.withDefault(''),
    shallow: false, // Trigger server re-render
    startTransition, // Integrate with React transitions
  });
  
  const [categories, setCategories] = useQueryState('categories', {
    ...parseAsArrayOf(parseAsString).withDefault([]),
    shallow: false,
    startTransition,
  });

  const [page, setPage] = useQueryState('page', {
    ...parseAsInteger.withDefault(1),
    shallow: false,
    startTransition,
  });

  return (
    <div className={cn('space-y-6', isPending && 'opacity-50')}>
      {/* Search */}
      <div>
        <Label>Search</Label>
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to page 1 on search
          }}
          placeholder="Search products..."
        />
      </div>

      {/* Categories */}
      <div>
        <Label>Categories</Label>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2">
              <Checkbox
                checked={categories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCategories([...categories, category]);
                  } else {
                    setCategories(categories.filter((c) => c !== category));
                  }
                  setPage(1);
                }}
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      <Button
        variant="outline"
        onClick={() => {
          setSearch('');
          setCategories([]);
          setPage(1);
        }}
      >
        Clear Filters
      </Button>
    </div>
  );
}
```

---

### 4.2 Server ↔ Client State Handoff

**Skill ID**: `integration/state-sync/server-client-handoff`

```typescript
// Pattern: Server fetches, client enhances

// app/dashboard/page.tsx
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  // Server-side initial data fetch
  const initialData = await db.dashboard.getData();
  const initialNotifications = await db.notifications.getUnread();

  return (
    <DashboardClient
      initialData={initialData}
      initialNotifications={initialNotifications}
    />
  );
}
```

```typescript
// app/dashboard/dashboard-client.tsx
'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardClientProps {
  initialData: DashboardData;
  initialNotifications: Notification[];
}

export function DashboardClient({
  initialData,
  initialNotifications,
}: DashboardClientProps) {
  // Use server data as initial, then keep fresh with polling
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then((r) => r.json()),
    initialData, // Server-rendered data
    refetchInterval: 30000, // Poll every 30s
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then((r) => r.json()),
    initialData: initialNotifications,
    refetchInterval: 10000, // More frequent for notifications
  });

  return (
    <div>
      <DashboardStats data={dashboardData} />
      <NotificationBell notifications={notifications} />
    </div>
  );
}
```

---

### 4.3 Cross-Tab State Sync

**Skill ID**: `integration/state-sync/cross-tab`

```typescript
// hooks/use-cross-tab-state.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCrossTabState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setState(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = typeof value === 'function' 
          ? (value as (prev: T) => T)(prev) 
          : value;
        localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
    },
    [key]
  );

  return [state, setValue];
}

// Usage: Cart that syncs across tabs
function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useCrossTabState<CartItem[]>('shopping-cart', []);

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}
```

---

### 4.4 Offline-First Pattern

**Skill ID**: `integration/state-sync/offline-first`

```typescript
// Using TanStack Query with persistence

// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      networkMode: 'offlineFirst', // Use cache while offline
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 3,
    },
  },
});

// Persist to localStorage
if (typeof window !== 'undefined') {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'app-query-cache',
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  });
}
```

```typescript
// hooks/use-online-status.ts
'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Assume online during SSR
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Offline indicator component
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { isPaused } = useIsMutating();

  if (isOnline && !isPaused) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-500 text-black px-4 py-2 rounded-full flex items-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>
        {isPaused ? 'Syncing changes...' : "You're offline"}
      </span>
    </div>
  );
}
```

---

### 4.5-4.9 Additional State Sync Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/state-sync/conflict-resolution` | Conflict Resolution UI | Last-write-wins vs merge strategies |
| `integration/state-sync/optimistic-queue` | Optimistic Mutation Queue | Queue mutations when offline |
| `integration/state-sync/real-time-presence` | Real-time Presence | Liveblocks/PartyKit for cursors |
| `integration/state-sync/broadcast-channel` | Broadcast Channel API | Direct tab-to-tab messaging |
| `integration/state-sync/service-worker` | Service Worker Sync | Background sync when online |

---

## 5. ERROR HANDLING (8 Skills)

### 5.1 Error Boundary Hierarchy

**Skill ID**: `integration/errors/boundary-hierarchy`

```
app/
  layout.tsx           # Root layout - catches app-level errors
  error.tsx            # Root error boundary
  global-error.tsx     # Catches root layout errors
  dashboard/
    layout.tsx
    error.tsx          # Dashboard-level errors
    page.tsx
    settings/
      error.tsx        # Settings-specific errors
      page.tsx
```

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { captureException } from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking service
    captureException(error, {
      extra: {
        digest: error.digest,
        componentStack: (error as any).componentStack,
      },
    });
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We've been notified and are working on a fix.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-8 text-left text-sm bg-destructive/10 p-4 rounded overflow-auto max-w-xl">
            {error.message}
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}
```

```typescript
// app/global-error.tsx - Catches root layout errors
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Critical Error
            </h2>
            <p className="mb-6">
              The application encountered a critical error.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

### 5.2 Toast vs Inline Error Decision Pattern

**Skill ID**: `integration/errors/toast-vs-inline`

```typescript
// Error type determines display method

type ErrorDisplayStrategy = 'toast' | 'inline' | 'page' | 'silent';

function determineErrorDisplay(error: AppError): ErrorDisplayStrategy {
  // Form validation errors -> inline
  if (error.type === 'validation') {
    return 'inline';
  }

  // Transient errors (network, timeout) -> toast with retry
  if (error.type === 'network' || error.type === 'timeout') {
    return 'toast';
  }

  // Auth errors -> page redirect
  if (error.type === 'unauthorized' || error.type === 'forbidden') {
    return 'page';
  }

  // Server errors -> toast or page based on severity
  if (error.type === 'server') {
    return error.recoverable ? 'toast' : 'page';
  }

  // Analytics/tracking errors -> silent
  if (error.type === 'analytics') {
    return 'silent';
  }

  return 'toast'; // Default
}

// Implementation
function handleError(error: AppError) {
  const strategy = determineErrorDisplay(error);

  switch (strategy) {
    case 'toast':
      toast.error(error.message, {
        action: error.recoverable
          ? { label: 'Retry', onClick: () => error.retry?.() }
          : undefined,
      });
      break;

    case 'inline':
      // Return error for form to display
      return { fieldErrors: error.details };

    case 'page':
      if (error.type === 'unauthorized') {
        redirect('/login');
      } else {
        throw error; // Let error boundary catch
      }
      break;

    case 'silent':
      console.error('Silent error:', error);
      captureException(error);
      break;
  }
}
```

---

### 5.3 Retry UX Pattern

**Skill ID**: `integration/errors/retry-ux`

```typescript
// hooks/use-retry.ts
'use client';

import { useState, useCallback, useRef } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export function useRetry<T>(
  fn: () => Promise<T>,
  options: UseRetryOptions = {}
) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
  } = options;

  const [state, setState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: Error | null;
    retryCount: number;
    nextRetryIn: number | null;
  }>({
    status: 'idle',
    data: null,
    error: null,
    retryCount: 0,
    nextRetryIn: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const data = await fn();
      setState({
        status: 'success',
        data,
        error: null,
        retryCount: 0,
        nextRetryIn: null,
      });
      return data;
    } catch (error) {
      const newRetryCount = state.retryCount + 1;

      if (newRetryCount < maxRetries) {
        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, newRetryCount - 1),
          maxDelay
        );

        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error as Error,
          retryCount: newRetryCount,
          nextRetryIn: delay / 1000,
        }));

        // Countdown timer
        let remaining = delay / 1000;
        countdownRef.current = setInterval(() => {
          remaining -= 1;
          setState((prev) => ({ ...prev, nextRetryIn: remaining }));
        }, 1000);

        // Auto-retry after delay
        timeoutRef.current = setTimeout(() => {
          clearInterval(countdownRef.current);
          execute();
        }, delay);
      } else {
        setState({
          status: 'error',
          data: null,
          error: error as Error,
          retryCount: newRetryCount,
          nextRetryIn: null,
        });
      }

      throw error;
    }
  }, [fn, state.retryCount, maxRetries, baseDelay, maxDelay, backoffFactor]);

  const retry = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearInterval(countdownRef.current);
    execute();
  }, [execute]);

  const cancel = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearInterval(countdownRef.current);
    setState((prev) => ({ ...prev, nextRetryIn: null }));
  }, []);

  return {
    ...state,
    execute,
    retry,
    cancel,
    canRetry: state.retryCount < maxRetries,
  };
}

// Usage
function DataFetcher() {
  const {
    status,
    data,
    error,
    retryCount,
    nextRetryIn,
    execute,
    retry,
    cancel,
    canRetry,
  } = useRetry(() => fetchData());

  useEffect(() => {
    execute();
  }, [execute]);

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load data</AlertTitle>
        <AlertDescription>
          {error?.message}
          {canRetry && (
            <div className="mt-2">
              {nextRetryIn ? (
                <p>Retrying in {nextRetryIn}s...</p>
              ) : (
                <p>Retry {retryCount}/{maxRetries} exhausted</p>
              )}
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={retry}>
                  Retry now
                </Button>
                {nextRetryIn && (
                  <Button size="sm" variant="outline" onClick={cancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // ... rest of component
}
```

---

### 5.4-5.8 Additional Error Handling Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/errors/graceful-degradation` | Graceful Degradation | Fallback UI when features fail |
| `integration/errors/recovery-flows` | Error Recovery Flows | Wizard to recover from errors |
| `integration/errors/server-action-errors` | Server Action Error Handling | Return typed errors from actions |
| `integration/errors/api-error-handling` | API Route Error Responses | Consistent error response format |
| `integration/errors/client-error-tracking` | Client Error Tracking | Sentry/LogRocket integration |

---

## 6. PERFORMANCE PATTERNS (7 Skills)

### 6.1 Streaming SSR with Suspense Hierarchies

**Skill ID**: `integration/performance/streaming-ssr`

```typescript
// Optimal streaming hierarchy

// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Critical: Header streams first */}
      <header className="col-span-12">
        <Suspense fallback={<HeaderSkeleton />}>
          <DashboardHeader />
        </Suspense>
      </header>

      {/* High priority: Main metrics */}
      <main className="col-span-8">
        <Suspense fallback={<MetricsSkeleton />}>
          <KeyMetrics />
        </Suspense>
      </main>

      {/* Medium priority: Side content */}
      <aside className="col-span-4">
        <Suspense fallback={<SidebarSkeleton />}>
          <ActivityFeed />
        </Suspense>
      </aside>

      {/* Lower priority: Charts can load later */}
      <section className="col-span-12">
        <Suspense fallback={<ChartsSkeleton />}>
          <AnalyticsCharts />
        </Suspense>
      </section>

      {/* Lowest priority: Recommendations */}
      <section className="col-span-12">
        <Suspense fallback={<RecommendationsSkeleton />}>
          <Recommendations />
        </Suspense>
      </section>
    </div>
  );
}

// Each async component fetches its own data
async function KeyMetrics() {
  const metrics = await getMetrics(); // This can be slow
  return <MetricsGrid data={metrics} />;
}

async function AnalyticsCharts() {
  // Start both fetches in parallel
  const [revenue, users] = await Promise.all([
    getRevenueData(),
    getUserGrowthData(),
  ]);
  
  return (
    <div className="grid grid-cols-2 gap-6">
      <RevenueChart data={revenue} />
      <UserGrowthChart data={users} />
    </div>
  );
}
```

---

### 6.2 Selective Hydration Pattern

**Skill ID**: `integration/performance/selective-hydration`

```typescript
// Components that don't need client JS stay on server
// Only add 'use client' when necessary

// GOOD: Server Component (default)
async function ProductInfo({ productId }: { productId: string }) {
  const product = await getProduct(productId);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <Price amount={product.price} /> {/* Also a Server Component */}
    </div>
  );
}

// GOOD: Client Component only where needed
// Wrap the smallest possible area
async function ProductPage({ productId }: { productId: string }) {
  const product = await getProduct(productId);
  
  return (
    <div>
      {/* Static content - no JS */}
      <ProductInfo product={product} />
      
      {/* Interactive - needs JS, wrap only this */}
      <AddToCartButton productId={productId} />
      
      {/* Static again */}
      <ProductReviews productId={productId} />
    </div>
  );
}

// AddToCartButton.tsx
'use client';

export function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  
  return (
    <button
      onClick={() => startTransition(() => addToCart(productId))}
      disabled={isPending}
    >
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

---

### 6.3 Virtual Scrolling for Large Lists

**Skill ID**: `integration/performance/virtual-scrolling`

```typescript
// Using @tanstack/react-virtual

'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
  overscan = 5,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Usage with infinite scroll
function InfiniteVirtualList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['items'],
      queryFn: ({ pageParam }) => fetchItems(pageParam),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: 0,
    });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  // Fetch more when scrolling near the end
  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= allItems.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allItems.length,
    isFetchingNextPage,
    virtualizer.getVirtualItems(),
  ]);

  // ... render
}
```

---

### 6.4-6.7 Additional Performance Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/performance/bundle-optimization` | Bundle Optimization | `optimizePackageImports`, dynamic imports |
| `integration/performance/image-optimization` | Advanced Image Patterns | Blur placeholders, priority loading |
| `integration/performance/font-optimization` | Font Loading Strategy | Variable fonts, `font-display: swap` |
| `integration/performance/core-web-vitals` | Core Web Vitals Monitoring | LCP, INP, CLS optimization |

---

## 7. TESTING INTEGRATION (11 Skills)

### 7.1 Component + API Integration Tests

**Skill ID**: `integration/testing/component-api`

```typescript
// tests/integration/checkout.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { CheckoutPage } from '@/app/checkout/page';

// Mock API server
const server = setupServer(
  http.post('/api/checkout', async ({ request }) => {
    const body = await request.json();
    
    // Validate request
    if (!body.email || !body.cardNumber) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      orderId: 'order_123',
      status: 'success',
    });
  }),
  
  http.get('/api/cart', () => {
    return HttpResponse.json({
      items: [
        { id: '1', name: 'Product 1', price: 99.99, quantity: 1 },
      ],
      total: 99.99,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Checkout Flow', () => {
  it('completes checkout successfully', async () => {
    const user = userEvent.setup();
    
    render(<CheckoutPage />);
    
    // Wait for cart to load
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    // Fill form
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Card Number'), '4242424242424242');
    await user.type(screen.getByLabelText('Expiry'), '12/25');
    await user.type(screen.getByLabelText('CVC'), '123');
    
    // Submit
    await user.click(screen.getByRole('button', { name: 'Place Order' }));
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Override handler for this test
    server.use(
      http.post('/api/checkout', () => {
        return HttpResponse.json(
          { error: 'Payment failed' },
          { status: 402 }
        );
      })
    );
    
    const user = userEvent.setup();
    render(<CheckoutPage />);
    
    // ... fill form and submit
    
    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });
    
    // Verify retry button appears
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });
});
```

---

### 7.2 E2E with Database Seeding

**Skill ID**: `integration/testing/e2e-db-seeding`

```typescript
// e2e/fixtures/database.ts
import { test as base } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Extend base test with database utilities
export const test = base.extend<{
  db: PrismaClient;
  seedUser: (data?: Partial<User>) => Promise<User>;
  seedProduct: (data?: Partial<Product>) => Promise<Product>;
  cleanDatabase: () => Promise<void>;
}>({
  db: async ({}, use) => {
    const db = new PrismaClient();
    await use(db);
    await db.$disconnect();
  },

  seedUser: async ({ db }, use) => {
    const users: User[] = [];
    
    const seedUser = async (data: Partial<User> = {}) => {
      const user = await db.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          name: 'Test User',
          password: await hashPassword('password123'),
          ...data,
        },
      });
      users.push(user);
      return user;
    };
    
    await use(seedUser);
    
    // Cleanup after test
    await db.user.deleteMany({
      where: { id: { in: users.map((u) => u.id) } },
    });
  },

  seedProduct: async ({ db }, use) => {
    const products: Product[] = [];
    
    const seedProduct = async (data: Partial<Product> = {}) => {
      const product = await db.product.create({
        data: {
          name: 'Test Product',
          price: 99.99,
          stock: 100,
          ...data,
        },
      });
      products.push(product);
      return product;
    };
    
    await use(seedProduct);
    
    await db.product.deleteMany({
      where: { id: { in: products.map((p) => p.id) } },
    });
  },

  cleanDatabase: async ({ db }, use) => {
    const cleanDatabase = async () => {
      // Delete in order respecting foreign keys
      await db.$transaction([
        db.orderItem.deleteMany(),
        db.order.deleteMany(),
        db.cartItem.deleteMany(),
        db.cart.deleteMany(),
        db.product.deleteMany(),
        db.user.deleteMany(),
      ]);
    };
    
    await use(cleanDatabase);
  },
});

export { expect } from '@playwright/test';
```

```typescript
// e2e/checkout.spec.ts
import { test, expect } from './fixtures/database';

test.describe('Checkout', () => {
  test('user can complete purchase', async ({ 
    page, 
    seedUser, 
    seedProduct 
  }) => {
    // Seed data
    const user = await seedUser({ email: 'buyer@example.com' });
    const product = await seedProduct({ 
      name: 'Test Widget', 
      price: 49.99,
      stock: 10,
    });
    
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Add to cart
    await page.goto(`/products/${product.id}`);
    await page.click('button:has-text("Add to Cart")');
    
    // Verify cart
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    
    // Go to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('button:has-text("Checkout")');
    
    // Fill payment (test mode)
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');
    
    // Submit order
    await page.click('button:has-text("Place Order")');
    
    // Verify success
    await expect(page).toHaveURL(/\/orders\/.+/);
    await expect(page.locator('h1')).toHaveText('Order Confirmed');
    await expect(page.locator('[data-testid="order-total"]')).toHaveText('$49.99');
  });
});
```

---

### 7.3 Visual Regression Testing

**Skill ID**: `integration/testing/visual-regression`

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ... other config
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
  projects: [
    {
      name: 'visual-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'visual-mobile',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],
});
```

```typescript
// e2e/visual/components.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });
  });

  test('homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
    });
  });

  test('product card variants', async ({ page }) => {
    await page.goto('/storybook/product-card');
    
    // Default state
    await expect(page.locator('[data-testid="product-card"]')).toHaveScreenshot(
      'product-card-default.png'
    );
    
    // Hover state
    await page.locator('[data-testid="product-card"]').hover();
    await expect(page.locator('[data-testid="product-card"]')).toHaveScreenshot(
      'product-card-hover.png'
    );
    
    // Out of stock state
    await page.goto('/storybook/product-card?variant=out-of-stock');
    await expect(page.locator('[data-testid="product-card"]')).toHaveScreenshot(
      'product-card-out-of-stock.png'
    );
  });

  test('dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Light mode
    await expect(page).toHaveScreenshot('homepage-light.png');
    
    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await expect(page).toHaveScreenshot('homepage-dark.png');
  });

  test('responsive breakpoints', async ({ page }) => {
    await page.goto('/pricing');
    
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page).toHaveScreenshot('pricing-desktop.png');
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('pricing-tablet.png');
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('pricing-mobile.png');
  });
});
```

---

### 7.4-7.11 Additional Testing Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/testing/performance` | Performance Testing | Lighthouse CI, Web Vitals in tests |
| `integration/testing/accessibility` | Accessibility Testing | axe-core, keyboard navigation tests |
| `integration/testing/server-components` | Testing Server Components | Async component testing patterns |
| `integration/testing/server-actions` | Testing Server Actions | Action unit and integration tests |
| `integration/testing/mocking-patterns` | Mocking Patterns | MSW, Prisma mocks, module mocks |
| `integration/testing/test-data-factories` | Test Data Factories | Faker.js, factory patterns |
| `integration/testing/snapshot-testing` | Snapshot Testing | When and how to use snapshots |
| `integration/testing/coverage-strategies` | Coverage Strategies | What to test and at what level |

---

## 8. DEVELOPER EXPERIENCE (6 Skills)

### 8.1 Environment Variable Management

**Skill ID**: `integration/dx/env-management`

```typescript
// env.ts - Type-safe environment variables
import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
});

// Validate server-side
const serverEnv = serverSchema.safeParse(process.env);
if (!serverEnv.success) {
  console.error('Missing server environment variables:');
  console.error(serverEnv.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

// Validate client-side (only NEXT_PUBLIC_ vars)
const clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
});

export const env = {
  ...serverEnv.data,
  ...clientEnv.data,
} as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;

// Type declarations
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof serverSchema>, z.infer<typeof clientSchema> {}
  }
}
```

```bash
# .env.example - Template for developers
# Copy to .env.local and fill in values

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp?schema=public"

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (test keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# AI
OPENAI_API_KEY="sk-..."

# Public
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

### 8.2-8.6 Additional DX Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/dx/hot-reload` | Hot Reload Optimization | Fast Refresh edge cases, HMR boundaries |
| `integration/dx/type-checking` | Type Checking Speed | `skipLibCheck`, incremental builds |
| `integration/dx/build-optimization` | Build Optimization | Turbopack, parallel builds |
| `integration/dx/local-prod-parity` | Dev/Prod Parity | Docker, seed data, feature flags |
| `integration/dx/debugging` | Debugging Patterns | Source maps, server component debugging |

---

## 9. DEPLOYMENT PATTERNS (8 Skills)

### 9.1 Preview Deployments with Database Branching

**Skill ID**: `integration/deployment/preview-db`

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Create Neon database branch for this PR
      - name: Create database branch
        id: create-branch
        uses: neondatabase/create-branch-action@v4
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          branch_name: preview-pr-${{ github.event.pull_request.number }}
          api_key: ${{ secrets.NEON_API_KEY }}

      # Run migrations on the branch
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ steps.create-branch.outputs.db_url }}

      # Seed with test data
      - name: Seed database
        run: npx prisma db seed
        env:
          DATABASE_URL: ${{ steps.create-branch.outputs.db_url }}

      # Deploy to Vercel preview
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
        env:
          DATABASE_URL: ${{ steps.create-branch.outputs.db_url_with_pooler }}

      # Comment with preview URL
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Preview Deployment
              
              **URL:** ${{ steps.deploy.outputs.preview-url }}
              **Database:** Branch \`preview-pr-${{ github.event.pull_request.number }}\`
              
              The preview has its own isolated database with seeded test data.`
            })
```

---

### 9.2 Feature Flags Integration

**Skill ID**: `integration/deployment/feature-flags`

```typescript
// lib/feature-flags.ts
import { unstable_flag as flag } from '@vercel/flags/next';

// Define flags with type safety
export const showNewCheckout = flag({
  key: 'new-checkout',
  decide: async () => {
    // Can check user, percentage rollout, etc.
    return false; // Default off
  },
});

export const showAIFeatures = flag({
  key: 'ai-features',
  decide: async ({ headers, cookies }) => {
    // Beta users only
    const session = await getSession(cookies);
    return session?.user?.isBetaUser ?? false;
  },
});

// Usage in Server Component
async function CheckoutPage() {
  const useNewCheckout = await showNewCheckout();
  
  if (useNewCheckout) {
    return <NewCheckout />;
  }
  
  return <LegacyCheckout />;
}

// Usage in Client Component with React context
'use client';

import { useFlag } from '@vercel/flags/react';

function AIAssistant() {
  const showAI = useFlag('ai-features');
  
  if (!showAI) return null;
  
  return <AIChat />;
}
```

---

### 9.3-9.8 Additional Deployment Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/deployment/canary` | Canary Releases | Gradual rollout with monitoring |
| `integration/deployment/rollback` | Rollback Strategies | Instant rollback, database rollback |
| `integration/deployment/db-migrations` | Database Migrations in CI | Safe migration patterns, zero-downtime |
| `integration/deployment/edge-functions` | Edge Function Deployment | Edge runtime considerations |
| `integration/deployment/cron-jobs` | Cron Job Setup | Vercel cron, background jobs |
| `integration/deployment/multi-region` | Multi-Region Deployment | Global distribution patterns |

---

## 10. MONITORING & ANALYTICS (8 Skills)

### 10.1 Core Web Vitals Tracking

**Skill ID**: `integration/monitoring/web-vitals`

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

```typescript
// Custom Web Vitals reporting
// lib/vitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

type Metric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
};

function sendToAnalytics(metric: Metric) {
  // Send to your analytics service
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      path: window.location.pathname,
      timestamp: Date.now(),
    }),
    keepalive: true, // Send even if page is closing
  });
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// components/web-vitals.tsx
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return null;
}
```

---

### 10.2 Error Tracking with Sentry

**Skill ID**: `integration/monitoring/error-tracking`

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Filter out known errors
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Ignore canceled requests
    if (error?.name === 'AbortError') {
      return null;
    }
    
    // Ignore network errors in development
    if (process.env.NODE_ENV === 'development' && error?.message?.includes('fetch')) {
      return null;
    }
    
    return event;
  },
});
```

```typescript
// instrumentation.ts (Next.js 15 instrumentation)
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
```

```typescript
// Usage in error boundaries
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

### 10.3-10.8 Additional Monitoring Skills

| Skill ID | Name | Key Pattern |
|----------|------|-------------|
| `integration/monitoring/user-analytics` | User Analytics | PostHog/Mixpanel integration |
| `integration/monitoring/performance-budgets` | Performance Budgets | Lighthouse CI, bundle size limits |
| `integration/monitoring/custom-events` | Custom Event Tracking | User actions, conversion tracking |
| `integration/monitoring/uptime` | Uptime Monitoring | Health checks, status pages |
| `integration/monitoring/logging` | Structured Logging | Pino, log aggregation |
| `integration/monitoring/alerts` | Alerting Setup | PagerDuty, Slack notifications |

---

## Summary: Updated Skill Count

| Category | Existing | New | Total |
|----------|----------|-----|-------|
| Atoms | 24 | 0 | 24 |
| Molecules | 35 | 0 | 35 |
| Organisms | 32 | 0 | 32 |
| Templates | 15 | 0 | 15 |
| Pages | 28 | 0 | 28 |
| Utilities | 16 | 0 | 16 |
| Patterns | 8 | 0 | 8 |
| **Integration (NEW)** | 0 | **87** | **87** |
| **Total** | **158** | **87** | **245** |

---

## Implementation Priority

### Phase 1: Critical (Week 1-2)
1. Type Safety E2E (Skills 1.1-1.5)
2. Server Actions + Forms (Skills 3.1-3.2)
3. Error Boundary Hierarchy (Skill 5.1)

### Phase 2: High Priority (Week 3-4)
1. URL State Sync (Skill 4.1)
2. Optimistic Updates (Skill 2.2)
3. Testing Integration (Skills 7.1-7.3)

### Phase 3: Medium Priority (Week 5-6)
1. Streaming SSR (Skill 6.1)
2. Feature Flags (Skill 9.2)
3. Monitoring Setup (Skills 10.1-10.2)

### Phase 4: Enhancement (Week 7-8)
1. Remaining data fetching patterns
2. Advanced form patterns
3. DX improvements

---

## Showcase Project Integration

Each of your 7 showcase projects should demonstrate specific integration patterns:

| Project | Primary Integration Skills |
|---------|---------------------------|
| Marketing Site | Type safety (1.1-1.3), Streaming SSR (6.1), Analytics (10.1) |
| E-commerce | Forms (3.1-3.4), Optimistic (2.2), Checkout testing (7.1-7.2) |
| SaaS Dashboard | URL state (4.1), Error handling (5.1-5.3), Feature flags (9.2) |
| Docs Site | Type safety (1.4), Performance (6.2-6.3), Visual testing (7.3) |
| Blog Platform | Server actions (3.1), Offline-first (4.4), Monitoring (10.2) |
| AI Application | Streaming (6.1), Error retry (5.3), Performance (6.4) |
| Collaborative App | Cross-tab sync (4.3), Conflict resolution (4.5), Real-time (4.8) |

