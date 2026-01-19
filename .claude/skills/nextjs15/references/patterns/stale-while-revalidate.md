---
id: pt-stale-while-revalidate
name: Stale-While-Revalidate
version: 2.0.0
layer: L5
category: cache
description: Serve cached data immediately while fetching fresh data in the background
tags: [cache, swr, stale, revalidate, performance]
composes: []
dependencies: []
formula: "Cached Data + Background Revalidation + cacheLife() + React Query = Instant UX with eventual freshness"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Stale-While-Revalidate (SWR)

Serve cached (potentially stale) data immediately while revalidating in the background, providing instant response times with eventual consistency.

## When to Use

- **Content feeds**: Blog posts, news articles, social feeds
- **Product listings**: Catalog pages where slight staleness is acceptable
- **User dashboards**: Analytics, reports with periodic refresh
- **Search results**: Cached queries with background updates
- **Configuration data**: Settings that change infrequently
- **Third-party API data**: External data with rate limits

**Avoid when:**
- Real-time accuracy required (stock prices, live scores)
- Financial transactions (payments, balances)
- Security-sensitive data (permissions, auth states)
- Data where users expect immediate consistency

## Composition Diagram

```
+------------------+     +------------------+     +------------------+
|   User Request   |     |   SWR Cache      |     |   Data Source    |
|                  |     |                  |     |   (Database)     |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  Request data          |                        |
         +----------------------->|                        |
         |                        |                        |
         |  Return STALE data     |                        |
         |  (immediate response)  |                        |
         |<-----------------------+                        |
         |                        |                        |
         |                        |  Background fetch      |
         |                        +----------------------->|
         |                        |                        |
         |                        |  Fresh data            |
         |                        |<-----------------------+
         |                        |                        |
         |                        |  Update cache          |
         |                        |  (next request fresh)  |
         |                        +------------------------+
         |                        |                        |
  Next Request:                   |                        |
         +----------------------->|                        |
         |  Return FRESH data     |                        |
         |<-----------------------+                        |
```

## Overview

SWR provides:
- Instant page loads from cache
- Background data freshness updates
- Better perceived performance
- Reduced server load

## Implementation

### Server-Side SWR with Next.js

```typescript
// lib/data/products.ts
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

// SWR pattern: data cached but revalidates periodically
export const getProducts = unstable_cache(
  async () => {
    console.log("Fetching products from database");
    
    return prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });
  },
  ["products-list"],
  {
    // Serve stale data for up to 1 hour
    revalidate: 3600,
    // Tags for on-demand invalidation
    tags: ["products"],
  }
);

// Short SWR for frequently changing data
export const getInventory = unstable_cache(
  async (productId: string) => {
    return prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        quantity: true,
        reservedQuantity: true,
      },
    });
  },
  ["inventory"],
  {
    // Revalidate every 30 seconds
    revalidate: 30,
    tags: ["inventory"],
  }
);

// Long SWR for static-ish content
export const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  },
  ["categories"],
  {
    // Revalidate every 24 hours
    revalidate: 86400,
    tags: ["categories"],
  }
);
```

### Using 'use cache' with cacheLife

```typescript
// lib/data/posts.ts
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db";

// Configure SWR behavior with cacheLife
export async function getPosts() {
  "use cache";
  cacheTag("posts");
  cacheLife("hours"); // Built-in: stale after 1 hour
  
  return prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getRecentActivity() {
  "use cache";
  cacheTag("activity");
  cacheLife("minutes"); // Built-in: stale after 1 minute
  
  return prisma.activity.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
  });
}

export async function getSiteSettings() {
  "use cache";
  cacheTag("settings");
  cacheLife("days"); // Built-in: stale after 1 day
  
  return prisma.settings.findFirst();
}

// Custom cache life configuration
export async function getAnalytics(period: string) {
  "use cache";
  cacheTag("analytics", `analytics-${period}`);
  cacheLife({
    stale: 300, // Serve stale for 5 minutes
    revalidate: 60, // Start revalidating after 1 minute
    expire: 3600, // Hard expire after 1 hour
  });
  
  return computeAnalytics(period);
}
```

### Client-Side SWR with React Query

```typescript
// hooks/use-products.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  price: number;
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    // SWR configuration
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: true, // Revalidate on tab focus
    refetchOnReconnect: true, // Revalidate on reconnect
  });
}

// With background refetching
export function useProductsWithPolling() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30 * 1000, // Fresh for 30 seconds
    refetchInterval: 60 * 1000, // Poll every minute
    refetchIntervalInBackground: false, // Only when visible
  });
}

// Component usage
export function ProductList() {
  const { data, isLoading, isStale, isFetching } = useProducts();
  
  return (
    <div>
      {/* Show indicator when showing stale data while fetching */}
      {isStale && isFetching && (
        <div className="text-sm text-muted-foreground">
          Updating...
        </div>
      )}
      
      {isLoading ? (
        <ProductsSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {data?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Client-Side SWR with useSWR

```typescript
// hooks/use-swr-products.ts
"use client";

import useSWR, { SWRConfig } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProductsSWR() {
  return useSWR("/api/products", fetcher, {
    // SWR-specific options
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 0, // No polling by default
    dedupingInterval: 2000, // Dedupe requests within 2s
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });
}

// Provider with global SWR config
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateIfStale: true,
        shouldRetryOnError: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

### Hybrid Server + Client SWR

```typescript
// app/products/page.tsx
import { Suspense } from "react";
import { getProducts } from "@/lib/data/products";
import { ProductGrid } from "@/components/product-grid";
import { ProductsSkeleton } from "@/components/skeletons";

// Server component: Initial data with server SWR
export default async function ProductsPage() {
  // Server-side SWR: cached with revalidation
  const initialProducts = await getProducts();
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      <Suspense fallback={<ProductsSkeleton />}>
        {/* Pass server data to client for hydration */}
        <ProductGrid initialData={initialProducts} />
      </Suspense>
    </div>
  );
}

// components/product-grid.tsx
"use client";

import { useQuery } from "@tanstack/react-query";

interface ProductGridProps {
  initialData: Product[];
}

export function ProductGrid({ initialData }: ProductGridProps) {
  // Client-side SWR: starts with server data, then revalidates
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch("/api/products").then((r) => r.json()),
    initialData, // Use server-rendered data
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 min
  });
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### SWR with Optimistic Updates

```typescript
// hooks/use-optimistic-swr.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Partial<Product> & { id: string }) => {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify(product),
      });
      return res.json();
    },
    // Optimistic update
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["products"] });
      
      // Snapshot previous value
      const previousProducts = queryClient.getQueryData<Product[]>(["products"]);
      
      // Optimistically update
      queryClient.setQueryData<Product[]>(["products"], (old) =>
        old?.map((p) =>
          p.id === newProduct.id ? { ...p, ...newProduct } : p
        )
      );
      
      return { previousProducts };
    },
    // Revert on error
    onError: (err, newProduct, context) => {
      queryClient.setQueryData(["products"], context?.previousProducts);
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Usage
function ProductEditor({ product }: { product: Product }) {
  const updateProduct = useUpdateProduct();
  
  const handleSave = (data: Partial<Product>) => {
    updateProduct.mutate({ id: product.id, ...data });
  };
  
  return (
    <form onSubmit={/* ... */}>
      {/* Form fields */}
      <button disabled={updateProduct.isPending}>
        {updateProduct.isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

## Variants

### Conditional SWR

```typescript
// lib/data/conditional-swr.ts
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";

// Different cache times based on user type
export async function getUserData(userId: string) {
  const headersList = await headers();
  const userRole = headersList.get("x-user-role");
  
  // Premium users get fresher data
  const revalidateTime = userRole === "premium" ? 60 : 3600;
  
  return unstable_cache(
    async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });
    },
    [`user-${userId}`],
    {
      revalidate: revalidateTime,
      tags: [`user-${userId}`],
    }
  )();
}
```

### Graceful Degradation SWR

```typescript
// lib/data/fallback-swr.ts
import { unstable_cache } from "next/cache";

interface CacheResult<T> {
  data: T | null;
  fromCache: boolean;
  error?: Error;
}

export function createSWRWithFallback<T>(
  fetcher: () => Promise<T>,
  cacheKey: string[],
  options: { revalidate: number; tags?: string[] }
) {
  return async (): Promise<CacheResult<T>> => {
    const cachedFetch = unstable_cache(
      async () => {
        const data = await fetcher();
        return { data, timestamp: Date.now() };
      },
      cacheKey,
      options
    );
    
    try {
      const result = await cachedFetch();
      return {
        data: result.data,
        fromCache: Date.now() - result.timestamp > 1000, // Likely from cache
      };
    } catch (error) {
      // On error, try to return stale data
      console.error("Fetch failed, returning stale data if available");
      return {
        data: null,
        fromCache: true,
        error: error as Error,
      };
    }
  };
}
```

### Tiered Cache SWR

```typescript
// lib/cache/tiered-swr.ts

// L1: In-memory (fastest, smallest)
const memoryCache = new Map<string, { data: any; expires: number }>();

// L2: Edge cache via unstable_cache
// L3: Origin database

export async function tieredSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    memoryTTL: number; // L1 TTL in ms
    edgeTTL: number; // L2 TTL in seconds
    tags?: string[];
  }
): Promise<T> {
  // Check L1 memory cache
  const memoryHit = memoryCache.get(key);
  if (memoryHit && memoryHit.expires > Date.now()) {
    return memoryHit.data;
  }
  
  // Check L2 edge cache
  const edgeCached = unstable_cache(
    fetcher,
    [key],
    {
      revalidate: options.edgeTTL,
      tags: options.tags,
    }
  );
  
  const data = await edgeCached();
  
  // Populate L1 cache
  memoryCache.set(key, {
    data,
    expires: Date.now() + options.memoryTTL,
  });
  
  return data;
}

// Usage
const products = await tieredSWR(
  "products-list",
  () => prisma.product.findMany(),
  {
    memoryTTL: 30000, // 30 seconds in memory
    edgeTTL: 300, // 5 minutes at edge
    tags: ["products"],
  }
);
```

## Anti-patterns

### SWR Without Consideration for Data Sensitivity

```typescript
// BAD: Caching sensitive data with long SWR
export const getUserBankingInfo = unstable_cache(
  async (userId: string) => {
    return prisma.bankAccount.findMany({
      where: { userId },
    });
  },
  ["banking-info"],
  {
    revalidate: 3600, // 1 hour is too long for financial data!
  }
);

// GOOD: Short or no cache for sensitive data
export async function getUserBankingInfo(userId: string) {
  // No caching - always fresh for sensitive data
  return prisma.bankAccount.findMany({
    where: { userId },
  });
}
```

### Ignoring Cache Stampede

```typescript
// BAD: Many concurrent requests can cause stampede
// when cache expires

// GOOD: Use request coalescing
import { cache } from "react";

// React cache dedupes within a request
const getDataMemoized = cache(async () => {
  return expensiveOperation();
});

// Combined with SWR for cross-request caching
export const getData = unstable_cache(
  getDataMemoized,
  ["expensive-data"],
  { revalidate: 300 }
);
```

### Not Showing Stale State to Users

```typescript
// BAD: No indication of data freshness
function DataDisplay({ data }) {
  return <div>{data}</div>;
}

// GOOD: Show when data might be stale
function DataDisplay({ data, isStale, lastUpdated }) {
  return (
    <div>
      {isStale && (
        <span className="text-xs text-muted-foreground">
          Updating... Last updated {formatDistance(lastUpdated, new Date())} ago
        </span>
      )}
      <div>{data}</div>
    </div>
  );
}
```

## Related Skills

- `data-cache` - Core caching mechanisms
- `react-query` - Client-side data fetching
- `swr` - SWR library patterns
- `revalidation` - Cache invalidation strategies

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with server and client SWR patterns
