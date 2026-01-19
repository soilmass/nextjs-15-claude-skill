# Full-Stack Code Recipes for Next.js 15

> Copy-paste ready patterns for production Next.js 15 applications

---

## Quick Reference: File Structure

```
your-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   └── pricing/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts
│   │   └── webhooks/stripe/route.ts
│   ├── layout.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/              # shadcn components
│   ├── forms/           # Form components
│   └── ...
├── lib/
│   ├── db.ts            # Database client
│   ├── auth.ts          # Auth utilities
│   ├── validations/     # Zod schemas
│   └── utils.ts
├── server/
│   ├── trpc.ts          # tRPC setup
│   └── routers/         # tRPC routers
├── hooks/               # Custom hooks
├── types/               # Type definitions
├── env.ts               # Environment validation
└── middleware.ts        # Edge middleware
```

---

## Recipe 1: Complete Authentication Flow

### 1.1 Session Management

```typescript
// lib/session.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { cache } from 'react';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

interface SessionPayload {
  userId: string;
  expiresAt: Date;
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const token = await new SignJWT({ userId, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Cached user fetcher - deduplicates across components
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
    },
  });

  return user;
});
```

### 1.2 Auth Actions

```typescript
// app/actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { db } from '@/lib/db';

export type AuthState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
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

  const user = await db.user.findUnique({
    where: { email: result.data.email },
  });

  if (!user || !(await verifyPassword(result.data.password, user.password))) {
    return {
      success: false,
      errors: { email: ['Invalid email or password'] },
    };
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function register(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const result = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const existingUser = await db.user.findUnique({
    where: { email: result.data.email },
  });

  if (existingUser) {
    return {
      success: false,
      errors: { email: ['Email already in use'] },
    };
  }

  const hashedPassword = await hashPassword(result.data.password);

  const user = await db.user.create({
    data: {
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
    },
  });

  await createSession(user.id);
  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
```

### 1.3 Login Form Component

```typescript
// components/forms/login-form.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login, type AuthState } from '@/app/actions/auth';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    login,
    { success: false }
  );

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Sync server errors to form
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, errors]) => {
        if (errors?.[0]) {
          form.setError(field as keyof LoginInput, {
            type: 'server',
            message: errors[0],
          });
        }
      });
    }
    if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  disabled={isPending}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  disabled={isPending}
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </Form>
  );
}
```

### 1.4 Protected Route Wrapper

```typescript
// lib/auth.ts
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth();
  
  if (!roles.includes(user.role)) {
    redirect('/unauthorized');
  }
  
  return user;
}

// Usage in page.tsx
export default async function DashboardPage() {
  const user = await requireAuth();
  
  return <Dashboard user={user} />;
}

// Admin-only page
export default async function AdminPage() {
  const user = await requireRole(['admin']);
  
  return <AdminDashboard user={user} />;
}
```

---

## Recipe 2: CRUD with Server Actions

### 2.1 Complete CRUD Actions

```typescript
// app/actions/posts.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

// Schemas
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  published: z.boolean().default(false),
});

const updatePostSchema = createPostSchema.partial();

// Types
export type ActionState<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

// CREATE
export async function createPost(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = createPostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    published: formData.get('published') === 'true',
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const post = await db.post.create({
      data: {
        ...result.data,
        authorId: user.id,
      },
    });

    revalidateTag('posts');
    revalidatePath('/posts');

    return { success: true, data: { id: post.id } };
  } catch (error) {
    return { success: false, error: 'Failed to create post' };
  }
}

// READ (cached with tag)
export async function getPosts(options?: {
  page?: number;
  limit?: number;
  authorId?: string;
}) {
  const { page = 1, limit = 10, authorId } = options ?? {};

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: authorId ? { authorId } : { published: true },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.post.count({
      where: authorId ? { authorId } : { published: true },
    }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPost(id: string) {
  return db.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}

// UPDATE
export async function updatePost(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Check ownership
  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.authorId !== user.id) {
    return { success: false, error: 'Not found or unauthorized' };
  }

  const result = updatePostSchema.safeParse({
    title: formData.get('title') || undefined,
    content: formData.get('content') || undefined,
    published: formData.has('published') 
      ? formData.get('published') === 'true' 
      : undefined,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await db.post.update({
      where: { id },
      data: result.data,
    });

    revalidateTag('posts');
    revalidatePath(`/posts/${id}`);
    revalidatePath('/posts');

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update post' };
  }
}

// DELETE
export async function deletePost(id: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.authorId !== user.id) {
    return { success: false, error: 'Not found or unauthorized' };
  }

  try {
    await db.post.delete({ where: { id } });

    revalidateTag('posts');
    revalidatePath('/posts');

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete post' };
  }
}

// Bind action with ID for forms
export const updatePostWithId = (id: string) =>
  updatePost.bind(null, id);
```

### 2.2 Post Form Component

```typescript
// components/forms/post-form.tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPost, updatePostWithId, type ActionState } from '@/app/actions/posts';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10),
  published: z.boolean(),
});

type PostInput = z.infer<typeof postSchema>;

interface PostFormProps {
  post?: {
    id: string;
    title: string;
    content: string;
    published: boolean;
  };
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  const action = post ? updatePostWithId(post.id) : createPost;
  const [state, formAction, isPending] = useActionState<ActionState<{ id: string }>, FormData>(
    action,
    { success: false }
  );

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title ?? '',
      content: post?.content ?? '',
      published: post?.published ?? false,
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(post ? 'Post updated!' : 'Post created!');
      if (!post && state.data?.id) {
        router.push(`/posts/${state.data.id}`);
      }
    }
    if (state.error) {
      toast.error(state.error);
    }
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, errors]) => {
        if (errors?.[0]) {
          form.setError(field as keyof PostInput, { message: errors[0] });
        }
      });
    }
  }, [state, post, router, form]);

  return (
    <Form {...form}>
      <form ref={formRef} action={formAction} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={10}
                  disabled={isPending}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                {field.value.length} characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Published</FormLabel>
                <FormDescription>
                  Make this post visible to everyone
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              {/* Hidden input for form submission */}
              <input type="hidden" name="published" value={String(field.value)} />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {post ? 'Update Post' : 'Create Post'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## Recipe 3: Data Table with URL State

### 3.1 Searchable, Sortable, Paginated Table

```typescript
// app/posts/page.tsx
import { Suspense } from 'react';
import { PostsTable } from './posts-table';
import { PostsTableSkeleton } from './posts-table-skeleton';

interface SearchParams {
  page?: string;
  search?: string;
  sort?: string;
  order?: string;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      <Suspense
        key={JSON.stringify(params)} // Re-suspend on param change
        fallback={<PostsTableSkeleton />}
      >
        <PostsTableWrapper params={params} />
      </Suspense>
    </div>
  );
}

async function PostsTableWrapper({ params }: { params: SearchParams }) {
  const page = parseInt(params.page ?? '1');
  const search = params.search ?? '';
  const sort = params.sort ?? 'createdAt';
  const order = (params.order ?? 'desc') as 'asc' | 'desc';

  const { posts, pagination } = await getPosts({
    page,
    limit: 10,
    search,
    sort,
    order,
  });

  return (
    <PostsTable
      posts={posts}
      pagination={pagination}
      currentSort={sort}
      currentOrder={order}
    />
  );
}
```

```typescript
// app/posts/posts-table.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface Post {
  id: string;
  title: string;
  author: { name: string };
  published: boolean;
  createdAt: Date;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PostsTableProps {
  posts: Post[];
  pagination: Pagination;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
}

export function PostsTable({
  posts,
  pagination,
  currentSort,
  currentOrder,
}: PostsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      
      return params.toString();
    },
    [searchParams]
  );

  const updateParams = (updates: Record<string, string | null>) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(updates)}`, { scroll: false });
    });
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    updateParams({
      search: term || null,
      page: '1', // Reset to page 1 on search
    });
  }, 300);

  const handleSort = (column: string) => {
    const newOrder =
      currentSort === column && currentOrder === 'asc' ? 'desc' : 'asc';
    updateParams({
      sort: column,
      order: newOrder,
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const SortHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(column)}
      className="-ml-4"
    >
      {children}
      {currentSort === column ? (
        currentOrder === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search posts..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortHeader column="title">Title</SortHeader>
              </TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <SortHeader column="createdAt">Created</SortHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.author.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      post.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(post.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} results
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isPending}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isPending}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Recipe 4: Optimistic Updates

### 4.1 Like Button with useOptimistic

```typescript
// components/like-button.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleLike } from '@/app/actions/posts';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  
  const [optimistic, addOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, optimisticValue: boolean) => ({
      liked: optimisticValue,
      count: optimisticValue ? state.count + 1 : state.count - 1,
    })
  );

  const handleClick = () => {
    startTransition(async () => {
      // Optimistic update
      addOptimistic(!optimistic.liked);
      
      // Server action
      const result = await toggleLike(postId);
      
      if (!result.success) {
        // The page will revalidate and show correct state
        // Optionally show error toast
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-2"
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          optimistic.liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        )}
      />
      <span>{optimistic.count}</span>
    </Button>
  );
}
```

### 4.2 Add to Cart with Optimistic Update

```typescript
// components/add-to-cart-button.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { addToCart } from '@/app/actions/cart';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  inStock: boolean;
}

export function AddToCartButton({ productId, variantId, inStock }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticAdded, setOptimisticAdded] = useOptimistic(false);

  const handleClick = () => {
    if (!inStock) return;

    startTransition(async () => {
      setOptimisticAdded(true);
      
      const result = await addToCart({ productId, variantId, quantity: 1 });
      
      if (result.success) {
        toast.success('Added to cart!');
      } else {
        toast.error(result.error || 'Failed to add to cart');
      }
      
      // Reset after delay
      setTimeout(() => setOptimisticAdded(false), 2000);
    });
  };

  if (!inStock) {
    return (
      <Button disabled className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className="w-full"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : optimisticAdded ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      {optimisticAdded ? 'Added!' : 'Add to Cart'}
    </Button>
  );
}
```

---

## Recipe 5: Real-time Features

### 5.1 Server-Sent Events for Notifications

```typescript
// app/api/notifications/stream/route.ts
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Subscribe to notifications (using your preferred pub/sub)
      const unsubscribe = await subscribeToNotifications(user.id, (notification) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)
        );
      });

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // Cleanup on close
      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

```typescript
// hooks/use-notifications.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        return;
      }

      setNotifications((prev) => [data, ...prev]);
    };

    eventSource.onerror = () => {
      setConnected(false);
      // EventSource will automatically reconnect
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
  };
}
```

---

## Recipe 6: Error Handling

### 6.1 Error Boundary with Recovery

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log to error tracking service
    console.error('Error:', error);
    
    // In production, send to Sentry
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. Our team has been notified.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <pre className="text-left text-sm bg-muted p-4 rounded-lg mb-6 overflow-auto max-h-32">
            {error.message}
          </pre>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
```

### 6.2 Not Found Page

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
          <FileQuestion className="w-12 h-12 text-muted-foreground" />
        </div>

        <h1 className="text-6xl font-bold mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Recipe 7: Loading States

### 7.1 Skeleton Components

```typescript
// components/ui/skeleton.tsx
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

// Usage examples
export function PostCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      <div className="border rounded-lg">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
            <Skeleton className="h-4 w-[30%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[10%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
        <div className="border rounded-lg p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
```

### 7.2 Loading.tsx Files

```typescript
// app/dashboard/loading.tsx
import { DashboardSkeleton } from '@/components/skeletons';

export default function Loading() {
  return <DashboardSkeleton />;
}

// app/posts/loading.tsx
import { TableSkeleton } from '@/components/skeletons';

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <TableSkeleton rows={10} />
    </div>
  );
}
```

---

## Recipe 8: Middleware Patterns

### 8.1 Auth + Rate Limiting Middleware

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
  analytics: true,
});

// Routes configuration
const publicRoutes = ['/', '/login', '/register', '/pricing', '/about'];
const authRoutes = ['/login', '/register'];
const apiRoutes = ['/api'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  // Auth check
  const session = await verifySession();
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect authenticated users away from auth pages
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/webhooks).*)',
  ],
};
```

---

## Quick Reference: Common Patterns

### Import Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/hooks/*": ["hooks/*"],
      "@/types/*": ["types/*"]
    }
  }
}
```

### Environment Variables

```typescript
// env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

### Utility Functions

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatPrice(price: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

