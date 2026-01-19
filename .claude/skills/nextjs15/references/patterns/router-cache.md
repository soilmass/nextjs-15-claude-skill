---
id: pt-router-cache
name: Router Cache
version: 2.0.0
layer: L5
category: cache
description: Client-side cache for Server Component payloads during navigation
tags: [cache, router, navigation, prefetch, client-cache]
composes: []
dependencies: []
formula: "Link prefetch + staleTimes config + router.refresh() + revalidatePath() = Instant client navigation"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Router Cache

The Router Cache stores React Server Component payloads on the client during navigation, enabling instant back/forward navigation and reduced server load.

## When to Use

- **Multi-page navigation**: Sites with frequent page transitions
- **Back/forward navigation**: Instant history navigation
- **Prefetching**: Hover-based prefetch for anticipated routes
- **Tab-based interfaces**: Multi-tab layouts with cached content
- **Wizard flows**: Multi-step forms with preserved state
- **Optimistic navigation**: Instant feedback during transitions

**Avoid when:**
- Real-time data requiring fresh renders on each navigation
- Security-sensitive routes needing auth checks on every visit
- Pages with highly personalized content
- Routes with side effects that must execute each time

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   Browser        |     |   Router Cache   |     |   Next.js Server |
|   (Client)       |     |   (Client-side)  |     |   (RSC Payload)  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  <Link prefetch={true}>|                        |
         +----------------------->|  prefetch RSC payload  |
         |                        +----------------------->|
         |                        |<-----------------------+
         |                        |  Store in cache        |
         |                        |                        |
         |  Click navigation      |                        |
         +----------------------->|                        |
         |                        |                        |
         |  Instant from cache    |                        |
         |<-----------------------+                        |
         |                        |                        |
         |  Server Action         |                        |
         +----------------------->|  revalidatePath()      |
         |                        +----------------------->|
         |                        |                        |
         |                        |  Cache invalidated     |
         |                        +<-----------------------+
         |                        |                        |
         |  router.refresh()      |                        |
         +----------------------->|  Fetch fresh RSC       |
         |                        +----------------------->|
```

## Overview

Next.js 15 significantly changed router cache behavior:
- **Static routes**: Cached for 5 minutes by default (was 30 seconds)
- **Dynamic routes**: Not cached by default (was 30 seconds)
- New `staleTimes` configuration for fine-grained control

## Implementation

### Understanding Router Cache Behavior

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Configure router cache stale times (Next.js 15+)
    staleTimes: {
      // How long dynamic routes are cached (default: 0)
      dynamic: 30, // 30 seconds
      // How long static routes are cached (default: 300)
      static: 180, // 3 minutes
    },
  },
};

export default nextConfig;
```

### Static vs Dynamic Routes

```typescript
// app/products/page.tsx - STATIC (cached for 5 min by default)
// No dynamic functions = static route
export default async function ProductsPage() {
  const products = await getProducts(); // Cached fetch
  
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// app/dashboard/page.tsx - DYNAMIC (not cached by default)
import { cookies } from "next/headers";

export default async function DashboardPage() {
  // Using cookies() makes this dynamic
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  
  const data = await getDashboardData();
  
  return <Dashboard data={data} theme={theme} />;
}

// Force static behavior on dynamic route
export const dynamic = "force-static";

// Force dynamic behavior on static route
export const dynamic = "force-dynamic";
```

### Controlling Prefetch Behavior

```typescript
// components/navigation/nav-link.tsx
import Link from "next/link";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean | null;
}

export function NavLink({ href, children, prefetch }: NavLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      // prefetch={true}  - Full route prefetch (static only)
      // prefetch={false} - No prefetch
      // prefetch={null}  - Default: prefetch on hover (default)
    >
      {children}
    </Link>
  );
}

// Usage examples
function Navigation() {
  return (
    <nav>
      {/* Full prefetch for critical navigation */}
      <NavLink href="/products" prefetch={true}>
        Products
      </NavLink>
      
      {/* No prefetch for less important links */}
      <NavLink href="/about" prefetch={false}>
        About
      </NavLink>
      
      {/* Default hover prefetch */}
      <NavLink href="/blog">
        Blog
      </NavLink>
    </nav>
  );
}
```

### Programmatic Prefetching

```typescript
// components/product-card.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  
  // Prefetch on mouse enter for faster perceived navigation
  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/products/${product.slug}`);
  }, [router, product.slug]);
  
  return (
    <article
      onMouseEnter={handleMouseEnter}
      onClick={() => router.push(`/products/${product.slug}`)}
      className="cursor-pointer group"
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
    </article>
  );
}
```

### Invalidating Router Cache

```typescript
// app/actions/products.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function updateProduct(productId: string, data: ProductData) {
  await prisma.product.update({
    where: { id: productId },
    data,
  });
  
  // Invalidate specific path - clears router cache for this route
  revalidatePath(`/products/${productId}`);
  
  // Invalidate all products pages
  revalidatePath("/products", "layout");
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({
    where: { id: productId },
  });
  
  // Revalidate by tag - all routes fetching products will refresh
  revalidateTag("products");
  
  // Also clear the specific product page
  revalidatePath(`/products/${productId}`);
}
```

### Using router.refresh()

```typescript
// components/refresh-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleRefresh = () => {
    startTransition(() => {
      // Clears router cache for current route and refetches
      router.refresh();
    });
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}
```

### Optimistic Navigation with Cache

```typescript
// components/optimistic-nav.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition, useOptimistic } from "react";

interface Tab {
  id: string;
  label: string;
  href: string;
}

export function OptimisticTabs({ tabs }: { tabs: Tab[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [optimisticPath, setOptimisticPath] = useOptimistic(pathname);
  
  const handleTabChange = (href: string) => {
    startTransition(() => {
      // Update optimistic state immediately
      setOptimisticPath(href);
      // Navigate (may use cached RSC payload)
      router.push(href);
    });
  };
  
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.href)}
          className={`px-4 py-2 rounded-md transition-colors ${
            optimisticPath === tab.href
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

## Variants

### Per-Route Cache Configuration

```typescript
// app/products/[slug]/page.tsx
// Configure cache behavior per route

// Opt out of router cache entirely
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Or opt into aggressive caching
export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour
```

### Time-Based Cache Invalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { path, secret } = await request.json();
  
  // Verify revalidation secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  
  try {
    // This clears both data cache AND router cache
    revalidatePath(path);
    
    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
```

### Selective Cache Clearing

```typescript
// lib/cache.ts
import { revalidatePath, revalidateTag } from "next/cache";

type CacheScope = "page" | "layout" | "all";

export function invalidateCache(options: {
  paths?: Array<{ path: string; scope?: CacheScope }>;
  tags?: string[];
}) {
  const { paths = [], tags = [] } = options;
  
  // Clear specific paths
  for (const { path, scope = "page" } of paths) {
    revalidatePath(path, scope);
  }
  
  // Clear by tags
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

// Usage in server action
export async function updateSettings(formData: FormData) {
  await saveSettings(formData);
  
  invalidateCache({
    paths: [
      { path: "/settings", scope: "page" },
      { path: "/dashboard", scope: "layout" },
    ],
    tags: ["user-settings"],
  });
}
```

## Anti-patterns

### Over-Relying on Router Cache

```typescript
// BAD: Assuming data is always fresh
export default async function Page() {
  // This might show stale data due to router cache
  const notifications = await getUnreadNotifications();
  return <NotificationList notifications={notifications} />;
}

// GOOD: Force fresh data for time-sensitive content
export const dynamic = "force-dynamic";

export default async function Page() {
  const notifications = await getUnreadNotifications();
  return <NotificationList notifications={notifications} />;
}

// Also GOOD: Use client-side polling for real-time data
"use client";
export function NotificationList() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000, // Poll every 30s
  });
}
```

### Unnecessary Cache Invalidation

```typescript
// BAD: Invalidating too broadly
export async function updateUserAvatar(userId: string, avatarUrl: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });
  
  // This invalidates ALL pages - overkill!
  revalidatePath("/", "layout");
}

// GOOD: Targeted invalidation
export async function updateUserAvatar(userId: string, avatarUrl: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });
  
  // Only invalidate user-specific routes
  revalidatePath(`/profile/${userId}`);
  revalidateTag(`user-${userId}`);
}
```

### Ignoring Cache During Development

```typescript
// BAD: Different behavior in dev vs prod
// Router cache behaves differently in development!

// GOOD: Test with production build
// npm run build && npm start

// Or configure consistent behavior
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: process.env.NODE_ENV === "development" ? 0 : 30,
      static: process.env.NODE_ENV === "development" ? 0 : 180,
    },
  },
};
```

## Related Skills

- `prefetching` - Preloading routes for instant navigation
- `revalidation` - Cache invalidation strategies
- `data-cache` - Server-side data caching
- `app-router` - App Router fundamentals

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation for Next.js 15 router cache changes
