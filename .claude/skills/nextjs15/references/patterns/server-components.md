---
id: pt-server-components
name: React Server Components
version: 1.0.0
layer: L5
category: rendering
description: Patterns for React Server Components in Next.js 15
tags: [rendering, rsc, server-components, next15, react19]
composes:
  - ../atoms/display-skeleton.md
dependencies: []
formula: "ServerComponents = AsyncComponent + Streaming + Suspense + DataFetching"
performance:
  impact: medium
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# React Server Components

## Overview

React Server Components (RSC) run exclusively on the server, enabling direct database access, reduced client bundle size, and streaming. This pattern covers RSC best practices in Next.js 15.

## When to Use

- Data fetching without client-side JavaScript
- Accessing backend resources directly
- Keeping sensitive logic server-side
- Reducing client bundle size
- Components that don't need interactivity

## Basic Server Component

```typescript
// app/posts/page.tsx
import { prisma } from '@/lib/db';
import { PostCard } from '@/components/post-card';

// This is a Server Component by default
export default async function PostsPage() {
  // Direct database access - no API needed
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, image: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Posts</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

## Async Components with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { RecentActivity } from '@/components/recent-activity';
import { Stats } from '@/components/stats';
import { Charts } from '@/components/charts';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats load first */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Charts load independently */}
        <Suspense fallback={<ChartSkeleton />}>
          <Charts />
        </Suspense>

        {/* Activity loads independently */}
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[400px]" />;
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}
```

## Parallel Data Fetching

```typescript
// components/user-profile.tsx
import { prisma } from '@/lib/db';

interface UserProfileProps {
  userId: string;
}

export async function UserProfile({ userId }: UserProfileProps) {
  // Parallel fetching - all requests start simultaneously
  const [user, posts, followers, following] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    }),
    prisma.post.findMany({
      where: { authorId: userId, published: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar user={user} size="lg" />
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground">{user.profile?.bio}</p>
        </div>
      </div>

      <div className="flex gap-6">
        <div>
          <span className="font-bold">{posts.length}</span>
          <span className="text-muted-foreground ml-1">posts</span>
        </div>
        <div>
          <span className="font-bold">{followers}</span>
          <span className="text-muted-foreground ml-1">followers</span>
        </div>
        <div>
          <span className="font-bold">{following}</span>
          <span className="text-muted-foreground ml-1">following</span>
        </div>
      </div>
    </div>
  );
}
```

## Composing Server and Client Components

```typescript
// components/post-with-likes.tsx
import { prisma } from '@/lib/db';
import { LikeButton } from './like-button'; // Client Component

interface PostWithLikesProps {
  postId: string;
}

// Server Component - fetches data
export async function PostWithLikes({ postId }: PostWithLikesProps) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      _count: { select: { likes: true } },
    },
  });

  if (!post) return null;

  return (
    <article className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold">{post.title}</h2>
      <p className="text-muted-foreground mt-2">{post.content}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          By {post.author.name}
        </span>

        {/* Client Component for interactivity */}
        <LikeButton
          postId={post.id}
          initialLikes={post._count.likes}
        />
      </div>
    </article>
  );
}

// components/like-button.tsx
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { likePost } from '@/app/posts/actions';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    setLikes((prev) => prev + 1); // Optimistic update
    startTransition(async () => {
      await likePost(postId);
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isPending}
    >
      <Heart className="h-4 w-4 mr-1" />
      {likes}
    </Button>
  );
}
```

## Data Preloading Pattern

```typescript
// lib/preload.ts
import { cache } from 'react';
import { prisma } from '@/lib/db';

// Cache the function to dedupe requests
export const getUser = cache(async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
});

export const preloadUser = (id: string) => {
  void getUser(id);
};

// app/users/[id]/page.tsx
import { getUser, preloadUser } from '@/lib/preload';
import { UserProfile } from '@/components/user-profile';
import { UserPosts } from '@/components/user-posts';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params;

  // Start fetching immediately
  preloadUser(id);

  // Use the same cached function
  const user = await getUser(id);

  if (!user) return <div>User not found</div>;

  return (
    <div className="space-y-8">
      <UserProfile user={user} />
      <UserPosts userId={id} />
    </div>
  );
}
```

## Streaming with Loading UI

```typescript
// app/search/page.tsx
import { Suspense } from 'react';
import { SearchResults } from '@/components/search-results';
import { SearchFilters } from '@/components/search-filters';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="flex gap-8">
      {/* Filters render immediately */}
      <SearchFilters />

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">
          Search results for "{params.q}"
        </h1>

        {/* Results stream in as they load */}
        <Suspense
          key={`${params.q}-${params.category}`}
          fallback={<SearchResultsSkeleton />}
        >
          <SearchResults query={params.q} category={params.category} />
        </Suspense>
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-24 w-24" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

```typescript
// app/posts/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Post page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">
        Failed to load post. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

## Anti-patterns

### Don't Import Client Code in Server Components

```typescript
// BAD - Importing hooks in Server Component
import { useState } from 'react'; // Error!

export async function ServerComponent() {
  const [state, setState] = useState(); // Won't work
}

// GOOD - Keep interactivity in Client Components
// components/interactive-part.tsx
'use client';
import { useState } from 'react';
export function InteractivePart() {
  const [state, setState] = useState();
}
```

### Don't Pass Functions as Props to Client Components

```typescript
// BAD - Functions can't cross server/client boundary
<ClientComponent onClick={() => console.log('click')} />

// GOOD - Use Server Actions
<ClientComponent onAction={serverAction} />
```

## Related Skills

- [streaming](./streaming.md)
- [server-actions](./server-actions.md)
- [preloading](./preloading.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Async components
- Suspense patterns
- Data preloading
