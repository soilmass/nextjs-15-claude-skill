---
id: pt-request-memoization
name: Request Memoization
version: 2.0.0
layer: L5
category: cache
description: Automatic request deduplication within a single render pass using React's cache function
tags: [cache, memoization, deduplication, performance, react-cache]
composes: []
dependencies: []
formula: "React cache() + Module-level definition + Primitive args = Zero-cost request deduplication"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Request Memoization

Automatically deduplicate identical data requests within a single render pass using React's cache function and Next.js 15's built-in memoization.

## When to Use

- **Shared data across components**: User data needed in Header, Sidebar, Content
- **Parent-child data sharing**: Avoiding prop drilling with direct fetches
- **Parallel component rendering**: Multiple Server Components needing same data
- **Preload patterns**: Start fetching before component renders
- **Layout/Page data sharing**: Layout and page both need user context
- **Expensive computations**: Deduplicate heavy calculations

**Avoid when:**
- Data needs to persist across requests (use data cache)
- Client-side caching required (use React Query/SWR)
- Cross-user data sharing (memoization is per-request)
- Arguments include non-serializable objects

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   Server Render  |     |   React cache()  |     |   Database       |
|   (Single Pass)  |     |   (Memoization)  |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
  Layout renders                  |                        |
         |  getCurrentUser()      |                        |
         +----------------------->|                        |
         |                        |  Cache MISS            |
         |                        +----------------------->|
         |                        |<-----------------------+
         |<-----------------------+  User data             |
         |                        |                        |
  Header renders                  |                        |
         |  getCurrentUser()      |                        |
         +----------------------->|                        |
         |                        |  Cache HIT             |
         |<-----------------------+  Same user data        |
         |                        |                        |
  Sidebar renders                 |                        |
         |  getCurrentUser()      |                        |
         +----------------------->|                        |
         |                        |  Cache HIT             |
         |<-----------------------+  Same user data        |
         |                        |                        |
         |  1 DB query for 3 calls|                        |
         +------------------------+------------------------+
```

## Overview

Request memoization prevents redundant database queries and API calls when the same data is needed by multiple components during a single server render. Unlike data caching, memoization only lasts for the duration of a request.

## Implementation

### Basic React Cache Usage

```typescript
// lib/data/users.ts
import { cache } from "react";
import { prisma } from "@/lib/db";

// Memoized within a single request
export const getUser = cache(async (userId: string) => {
  console.log(`Fetching user ${userId}`); // Only logs once per request
  
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      settings: true,
    },
  });
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;
  
  return getUser(session.userId);
});
```

### Using in Multiple Components

```typescript
// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/data/users";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage() {
  // All three components can call getCurrentUser()
  // but only ONE database query is made
  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* Calls getCurrentUser() */}
      <div className="flex-1">
        <Header /> {/* Calls getCurrentUser() */}
        <DashboardContent /> {/* Calls getCurrentUser() */}
      </div>
    </div>
  );
}

// components/sidebar.tsx
import { getCurrentUser } from "@/lib/data/users";

export async function Sidebar() {
  const user = await getCurrentUser(); // Uses memoized result
  
  return (
    <aside className="w-64 border-r">
      <div className="p-4">
        <p className="font-medium">{user?.name}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>
    </aside>
  );
}

// components/header.tsx
import { getCurrentUser } from "@/lib/data/users";

export async function Header() {
  const user = await getCurrentUser(); // Uses memoized result
  
  return (
    <header className="h-16 border-b flex items-center px-6">
      <span>Welcome, {user?.name}</span>
    </header>
  );
}
```

### Memoization with Arguments

```typescript
// lib/data/products.ts
import { cache } from "react";
import { prisma } from "@/lib/db";

// Arguments are serialized for cache key comparison
export const getProduct = cache(async (productId: string) => {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      variants: true,
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });
});

export const getProductsByCategory = cache(async (
  categoryId: string,
  options: { limit?: number; offset?: number } = {}
) => {
  const { limit = 20, offset = 0 } = options;
  
  return prisma.product.findMany({
    where: { categoryId },
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
});

// Fetch requests are automatically memoized in Next.js 15
export const getExternalProduct = cache(async (sku: string) => {
  const response = await fetch(`https://api.store.com/products/${sku}`, {
    // Note: fetch is NOT cached by default in Next.js 15
    // but IS memoized within the same request
  });
  
  return response.json();
});
```

### Preloading Pattern

```typescript
// lib/data/posts.ts
import { cache } from "react";
import { prisma } from "@/lib/db";

export const getPost = cache(async (slug: string) => {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      comments: {
        take: 20,
        orderBy: { createdAt: "desc" },
      },
    },
  });
});

// Preload function to start fetching early
export const preloadPost = (slug: string) => {
  void getPost(slug);
};

// app/blog/[slug]/page.tsx
import { getPost, preloadPost } from "@/lib/data/posts";
import { PostContent } from "@/components/post-content";
import { RelatedPosts } from "@/components/related-posts";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Start fetching immediately
  preloadPost(slug);
  
  // By the time we need the data, it's likely already cached
  const post = await getPost(slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <article>
      <PostContent post={post} />
      <RelatedPosts categoryId={post.categoryId} currentPostId={post.id} />
    </article>
  );
}
```

### Advanced: Memoization with Context

```typescript
// lib/data/organization.ts
import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

// Get organization from subdomain or header
export const getCurrentOrganization = cache(async () => {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const subdomain = host.split(".")[0];
  
  // Check for org header first (for API routes)
  const orgId = headersList.get("x-organization-id");
  if (orgId) {
    return prisma.organization.findUnique({
      where: { id: orgId },
    });
  }
  
  // Fall back to subdomain
  return prisma.organization.findUnique({
    where: { subdomain },
  });
});

// Memoized org-scoped data fetching
export const getOrgUsers = cache(async () => {
  const org = await getCurrentOrganization();
  if (!org) throw new Error("Organization not found");
  
  return prisma.user.findMany({
    where: { organizationId: org.id },
  });
});

export const getOrgSettings = cache(async () => {
  const org = await getCurrentOrganization();
  if (!org) throw new Error("Organization not found");
  
  return prisma.organizationSettings.findUnique({
    where: { organizationId: org.id },
  });
});
```

### Combining with Data Cache

```typescript
// lib/data/analytics.ts
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

// Request memoization + persistent data cache
const getAnalyticsDataCached = unstable_cache(
  async (userId: string, dateRange: string) => {
    return prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      where: {
        userId,
        createdAt: {
          gte: getDateFromRange(dateRange),
        },
      },
      _count: true,
    });
  },
  ["analytics-data"],
  {
    revalidate: 300, // 5 minutes
    tags: ["analytics"],
  }
);

// Wrap with React cache for request deduplication
export const getAnalyticsData = cache(
  async (userId: string, dateRange: string) => {
    return getAnalyticsDataCached(userId, dateRange);
  }
);
```

## Variants

### Conditional Memoization

```typescript
// lib/data/feature-flags.ts
import { cache } from "react";
import { getCurrentUser } from "./users";

export const getFeatureFlags = cache(async () => {
  const user = await getCurrentUser();
  
  // Different cache behavior based on user
  if (user?.role === "admin") {
    // Admins get real-time flags
    return fetchFlags({ cache: "no-store" });
  }
  
  // Regular users get cached flags
  return fetchFlags({ cache: "force-cache" });
});
```

### Memoization with Error Handling

```typescript
// lib/data/safe-fetch.ts
import { cache } from "react";

interface CacheResult<T> {
  data: T | null;
  error: Error | null;
}

export const createSafeCachedFetch = <T, Args extends unknown[]>(
  fetcher: (...args: Args) => Promise<T>
) => {
  return cache(async (...args: Args): Promise<CacheResult<T>> => {
    try {
      const data = await fetcher(...args);
      return { data, error: null };
    } catch (error) {
      console.error("Cached fetch error:", error);
      return { data: null, error: error as Error };
    }
  });
};

// Usage
const getProductSafe = createSafeCachedFetch(async (id: string) => {
  return prisma.product.findUniqueOrThrow({ where: { id } });
});
```

## Anti-patterns

### Creating New Function References

```typescript
// BAD: New function created each render
export default async function Page() {
  const getUser = cache(async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  });
  
  // This defeats memoization!
  const user = await getUser("123");
}

// GOOD: Define outside component
const getUser = cache(async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
});

export default async function Page() {
  const user = await getUser("123"); // Properly memoized
}
```

### Non-serializable Arguments

```typescript
// BAD: Objects create new cache keys even with same values
const getData = cache(async (options: { page: number }) => {
  // Each call creates new object reference = no memoization
});

// GOOD: Use primitive arguments
const getData = cache(async (page: number) => {
  // Primitives are properly compared
});

// Also GOOD: Serialize to string
const getDataWithOptions = cache(async (optionsJson: string) => {
  const options = JSON.parse(optionsJson);
  // ...
});
```

### Memoization in Client Components

```typescript
// BAD: React cache only works on server
"use client";
import { cache } from "react";

// This won't work as expected!
const getData = cache(async () => { /* ... */ });

// GOOD: Use useMemo or React Query on client
"use client";
import { useQuery } from "@tanstack/react-query";

function Component() {
  const { data } = useQuery({
    queryKey: ["data"],
    queryFn: () => fetch("/api/data").then(r => r.json()),
  });
}
```

## Related Skills

- `data-cache` - Persistent caching with unstable_cache
- `revalidation` - Cache invalidation strategies
- `server-components-data` - Data fetching in Server Components
- `prefetching` - Preloading data patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with React cache and Next.js 15 patterns
