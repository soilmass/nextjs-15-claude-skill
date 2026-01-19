---
id: pt-recently-viewed
name: Recently Viewed
version: 1.1.0
layer: L5
category: data
description: Track and display recently viewed products with localStorage persistence, server-side sync for logged-in users, and cross-device continuity
tags: [recently-viewed, history, personalization, ecommerce, next15, zustand, localStorage]
composes:
  - ../molecules/card.md
dependencies:
  zustand: "^5.0.0"
  prisma: "^6.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Recently Viewed

## Overview

The Recently Viewed pattern enables e-commerce and content-heavy applications to track items users have browsed and display them for easy re-discovery. This pattern significantly improves user experience by reducing the friction of finding previously viewed items, increasing engagement metrics, and driving conversions through personalized browsing history.

The implementation uses a hybrid storage approach: localStorage provides immediate, offline-capable persistence for all users (including guests), while server-side synchronization ensures logged-in users can access their browsing history across devices. The Zustand state management library handles client-side state with built-in persistence middleware, providing a clean API for adding, removing, and querying viewed items.

This pattern is particularly valuable for e-commerce sites where users often compare multiple products before purchasing, content platforms where users want to return to partially-read articles, and any application where browsing history enhances the user experience. The implementation handles edge cases like duplicate entries, stale data cleanup, and graceful degradation when localStorage is unavailable.

## When to Use

- **E-commerce product browsing**: Show users products they've previously viewed on homepage, product detail pages, or dedicated history sections to facilitate comparison shopping
- **Content platforms**: Help users return to articles, videos, or courses they started but didn't finish
- **Real estate and job boards**: Enable users to quickly revisit listings they've shown interest in
- **Personalized recommendations**: Use viewing history as input for recommendation engines to suggest related items
- **Cross-session continuity**: Maintain browsing context across multiple visits to reduce friction for returning users
- **Wishlist alternatives**: Provide a lightweight, automatic alternative to explicit wishlist features for users who don't create accounts

## When NOT to Use

- **Privacy-sensitive applications**: Avoid tracking viewing history in healthcare, financial, or other sensitive domains where browsing patterns could reveal private information
- **Single-page applications**: If users typically view one item per session and never return, the feature adds unnecessary complexity
- **High-churn content**: For content that changes rapidly (news feeds, social posts), recently viewed may show stale or removed items
- **Anonymous-only platforms**: If your platform discourages accounts and server sync adds no value, consider simpler localStorage-only solutions

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Recently Viewed Architecture                                                      │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Client Layer                                                                 │ │
│  │                                                                              │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │ │
│  │  │ Zustand Store (useRecentlyViewedStore)                              │    │ │
│  │  │                                                                     │    │ │
│  │  │  State:                    Actions:                                 │    │ │
│  │  │  - items: ViewedProduct[]  - addItem(product)                       │    │ │
│  │  │  - maxItems: number        - removeItem(id)                         │    │ │
│  │  │                            - clearHistory()                         │    │ │
│  │  │                            - getItems(limit)                        │    │ │
│  │  │                            - mergeServerData(items)                 │    │ │
│  │  └──────────────────────────────────┬──────────────────────────────────┘    │ │
│  │                                     │                                        │ │
│  │                                     ▼                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │ │
│  │  │ Zustand Persist Middleware                                          │    │ │
│  │  │  - Storage: localStorage                                            │    │ │
│  │  │  - Key: 'recently-viewed'                                           │    │ │
│  │  │  - Partialize: Only persist 'items' field                           │    │ │
│  │  │  - Version: For migration support                                   │    │ │
│  │  └─────────────────────────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                        │
│                                          │ Fire-and-forget sync                   │
│                                          ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Server Layer                                                                 │ │
│  │                                                                              │ │
│  │  ┌────────────────────┐    ┌────────────────────┐    ┌──────────────────┐   │ │
│  │  │ POST /api/views    │    │ GET /api/views     │    │ DELETE /api/views│   │ │
│  │  │                    │    │                    │    │                  │   │ │
│  │  │ Record new view    │    │ Fetch user's       │    │ Clear history    │   │ │
│  │  │ (userId/sessionId) │    │ viewing history    │    │ (GDPR support)   │   │ │
│  │  └─────────┬──────────┘    └─────────┬──────────┘    └────────┬─────────┘   │ │
│  │            │                         │                        │              │ │
│  │            ▼                         ▼                        ▼              │ │
│  │  ┌───────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Database (Prisma)                                                     │  │ │
│  │  │                                                                       │  │ │
│  │  │  ProductView:                     Product:                            │  │ │
│  │  │  - id: String                     - id: String                        │  │ │
│  │  │  - productId: String              - name: String                      │  │ │
│  │  │  - userId: String?                - slug: String                      │  │ │
│  │  │  - sessionId: String              - price: Int                        │  │ │
│  │  │  - viewedAt: DateTime             - images: String[]                  │  │ │
│  │  └───────────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Presentation Components                                                      │ │
│  │                                                                              │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │ │
│  │  │ RecentlyViewed   │  │ RecentlyViewed   │  │ ProductTracker           │   │ │
│  │  │ Carousel         │  │ Grid             │  │ (Invisible component)    │   │ │
│  │  │                  │  │                  │  │                          │   │ │
│  │  │ Horizontal       │  │ Responsive grid  │  │ Tracks page views        │   │ │
│  │  │ scrollable list  │  │ with pagination  │  │ on product pages         │   │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Zustand Store with Persistence

```typescript
// lib/store/recently-viewed.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category?: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: ViewedProduct[];
  isHydrated: boolean;
}

interface RecentlyViewedActions {
  addItem: (product: Omit<ViewedProduct, 'viewedAt'>) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  getItems: (limit?: number) => ViewedProduct[];
  getItemsExcluding: (excludeId: string, limit?: number) => ViewedProduct[];
  mergeServerData: (serverItems: ViewedProduct[]) => void;
  setHydrated: (hydrated: boolean) => void;
}

type RecentlyViewedStore = RecentlyViewedState & RecentlyViewedActions;

const MAX_ITEMS = 30;
const STALE_THRESHOLD = 30 * 24 * 60 * 60 * 1000; // 30 days

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addItem: (product) => {
        set((state) => {
          // Remove if already exists (will be re-added at top)
          const filtered = state.items.filter((item) => item.id !== product.id);

          // Remove stale items (older than 30 days)
          const now = Date.now();
          const fresh = filtered.filter(
            (item) => now - item.viewedAt < STALE_THRESHOLD
          );

          // Add to beginning with timestamp
          const newItems = [
            { ...product, viewedAt: now },
            ...fresh,
          ].slice(0, MAX_ITEMS);

          return { items: newItems };
        });

        // Fire-and-forget server sync
        syncToServer(product.id).catch(() => {
          // Silent fail - localStorage is primary
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ items: [] });
        // Also clear server-side
        clearServerHistory().catch(() => {});
      },

      getItems: (limit = 10) => {
        return get().items.slice(0, limit);
      },

      getItemsExcluding: (excludeId, limit = 10) => {
        return get()
          .items.filter((item) => item.id !== excludeId)
          .slice(0, limit);
      },

      mergeServerData: (serverItems) => {
        set((state) => {
          // Create map of existing items by ID
          const localMap = new Map(state.items.map((item) => [item.id, item]));

          // Merge: prefer more recent viewedAt timestamp
          serverItems.forEach((serverItem) => {
            const localItem = localMap.get(serverItem.id);
            if (!localItem || serverItem.viewedAt > localItem.viewedAt) {
              localMap.set(serverItem.id, serverItem);
            }
          });

          // Sort by viewedAt descending and limit
          const merged = Array.from(localMap.values())
            .sort((a, b) => b.viewedAt - a.viewedAt)
            .slice(0, MAX_ITEMS);

          return { items: merged };
        });
      },

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'recently-viewed',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0: add category field
          return {
            ...persistedState,
            items: persistedState.items.map((item: any) => ({
              ...item,
              category: item.category ?? null,
            })),
          };
        }
        return persistedState as RecentlyViewedState;
      },
    }
  )
);

// Server sync helpers
async function syncToServer(productId: string): Promise<void> {
  await fetch('/api/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
    // Don't wait for response
    keepalive: true,
  });
}

async function clearServerHistory(): Promise<void> {
  await fetch('/api/views', {
    method: 'DELETE',
    keepalive: true,
  });
}

// Hook for SSR-safe access
export function useRecentlyViewed(limit?: number) {
  const store = useRecentlyViewedStore();

  // Return empty array until hydrated to prevent hydration mismatch
  if (!store.isHydrated) {
    return {
      items: [],
      isLoading: true,
      addItem: store.addItem,
      removeItem: store.removeItem,
      clearHistory: store.clearHistory,
    };
  }

  return {
    items: store.getItems(limit),
    isLoading: false,
    addItem: store.addItem,
    removeItem: store.removeItem,
    clearHistory: store.clearHistory,
  };
}
```

### Server API Routes

```typescript
// app/api/views/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const postSchema = z.object({
  productId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = postSchema.parse(body);

    const session = await auth();
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session-id')?.value;

    // Generate session ID if not exists
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set('session-id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    // Upsert to handle duplicate views
    await prisma.productView.upsert({
      where: {
        productId_userId_sessionId: {
          productId,
          userId: session?.user?.id ?? '',
          sessionId: session?.user?.id ? '' : sessionId,
        },
      },
      create: {
        productId,
        userId: session?.user?.id,
        sessionId: session?.user?.id ? undefined : sessionId,
        viewedAt: new Date(),
      },
      update: {
        viewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to record view:', error);
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session-id')?.value;

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    // Query based on user or session
    const whereClause = session?.user?.id
      ? { userId: session.user.id }
      : sessionId
      ? { sessionId, userId: null }
      : null;

    if (!whereClause) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const [views, total] = await Promise.all([
      prisma.productView.findMany({
        where: whereClause,
        orderBy: { viewedAt: 'desc' },
        distinct: ['productId'],
        skip: offset,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              compareAtPrice: true,
              images: true,
              category: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.productView.groupBy({
        by: ['productId'],
        where: whereClause,
        _count: true,
      }),
    ]);

    const items = views
      .filter((v) => v.product) // Filter out deleted products
      .map((v) => ({
        id: v.product.id,
        name: v.product.name,
        slug: v.product.slug,
        price: v.product.price,
        compareAtPrice: v.product.compareAtPrice,
        image: v.product.images[0] || '',
        category: v.product.category?.name,
        viewedAt: v.viewedAt.getTime(),
      }));

    return NextResponse.json({
      items,
      total: total.length,
      hasMore: offset + limit < total.length,
    });
  } catch (error) {
    console.error('Failed to fetch views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch views' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session-id')?.value;

    const whereClause = session?.user?.id
      ? { userId: session.user.id }
      : sessionId
      ? { sessionId }
      : null;

    if (whereClause) {
      await prisma.productView.deleteMany({ where: whereClause });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear history:', error);
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
```

### Track View Hook

```typescript
// hooks/use-track-view.ts
'use client';

import { useEffect, useRef } from 'react';
import { useRecentlyViewedStore, ViewedProduct } from '@/lib/store/recently-viewed';

interface TrackableProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: { name: string } | null;
}

interface UseTrackViewOptions {
  /** Minimum time on page before tracking (ms) */
  minViewDuration?: number;
  /** Whether to track this view */
  enabled?: boolean;
}

export function useTrackView(
  product: TrackableProduct | null | undefined,
  options: UseTrackViewOptions = {}
) {
  const { minViewDuration = 0, enabled = true } = options;
  const addItem = useRecentlyViewedStore((state) => state.addItem);
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product || !enabled) return;
    if (trackedRef.current === product.id) return; // Already tracked this product

    const track = () => {
      trackedRef.current = product.id;
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.images[0] || '',
        category: product.category?.name,
      });
    };

    if (minViewDuration > 0) {
      const timer = setTimeout(track, minViewDuration);
      return () => clearTimeout(timer);
    } else {
      track();
    }
  }, [product?.id, enabled, minViewDuration, addItem]);
}

// Alternative: Invisible tracker component
export function ProductTracker({
  product,
  minViewDuration = 0,
}: {
  product: TrackableProduct;
  minViewDuration?: number;
}) {
  useTrackView(product, { minViewDuration });
  return null;
}
```

### Sync Hook for Logged-in Users

```typescript
// hooks/use-sync-recently-viewed.ts
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRecentlyViewedStore } from '@/lib/store/recently-viewed';

export function useSyncRecentlyViewed() {
  const { data: session, status } = useSession();
  const { isHydrated, mergeServerData } = useRecentlyViewedStore();

  useEffect(() => {
    // Only sync when authenticated and store is hydrated
    if (status !== 'authenticated' || !isHydrated) return;

    async function syncFromServer() {
      try {
        const res = await fetch('/api/views?limit=50');
        if (!res.ok) return;

        const data = await res.json();
        if (data.items?.length > 0) {
          mergeServerData(data.items);
        }
      } catch (error) {
        console.error('Failed to sync viewing history:', error);
      }
    }

    syncFromServer();
  }, [status, isHydrated, mergeServerData]);
}

// Provider component
export function RecentlyViewedSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSyncRecentlyViewed();
  return <>{children}</>;
}
```

### Recently Viewed Components

```typescript
// components/recently-viewed.tsx
'use client';

import { useRecentlyViewed } from '@/lib/store/recently-viewed';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { X, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentlyViewedProps {
  limit?: number;
  excludeId?: string;
  title?: string;
  showTimestamps?: boolean;
  showClearButton?: boolean;
  layout?: 'carousel' | 'grid';
}

export function RecentlyViewed({
  limit = 8,
  excludeId,
  title = 'Recently Viewed',
  showTimestamps = false,
  showClearButton = false,
  layout = 'carousel',
}: RecentlyViewedProps) {
  const { items, isLoading, removeItem, clearHistory } = useRecentlyViewed();

  // Filter and limit items
  const displayItems = excludeId
    ? items.filter((item) => item.id !== excludeId).slice(0, limit)
    : items.slice(0, limit);

  // Don't render during SSR or while loading
  if (isLoading || displayItems.length === 0) {
    return null;
  }

  return (
    <section className="py-8" aria-labelledby="recently-viewed-title">
      <div className="flex items-center justify-between mb-4">
        <h2 id="recently-viewed-title" className="text-xl font-semibold">
          {title}
        </h2>
        {showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      {layout === 'carousel' ? (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {displayItems.map((item) => (
              <RecentlyViewedItem
                key={item.id}
                item={item}
                showTimestamp={showTimestamps}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayItems.map((item) => (
            <RecentlyViewedItem
              key={item.id}
              item={item}
              showTimestamp={showTimestamps}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RecentlyViewedItem({
  item,
  showTimestamp,
  onRemove,
}: {
  item: ViewedProduct;
  showTimestamp: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="relative group flex-shrink-0 w-40 md:w-48">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Remove ${item.name} from recently viewed`}
      >
        <X className="h-3 w-3" />
      </button>

      <ProductCard
        product={item}
        href={`/products/${item.slug}`}
        imageAspectRatio="square"
      />

      {showTimestamp && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(item.viewedAt), { addSuffix: true })}
          </span>
        </div>
      )}
    </div>
  );
}
```

### Dedicated History Page

```typescript
// app/account/history/page.tsx
import { Metadata } from 'next';
import { RecentlyViewedHistory } from '@/components/recently-viewed-history';

export const metadata: Metadata = {
  title: 'Browsing History',
  description: 'View your recently browsed products',
};

export default function HistoryPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Browsing History</h1>
      <RecentlyViewedHistory />
    </div>
  );
}

// components/recently-viewed-history.tsx
'use client';

import { useState } from 'react';
import { useRecentlyViewed } from '@/lib/store/recently-viewed';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Search } from 'lucide-react';

export function RecentlyViewedHistory() {
  const { items, isLoading, clearHistory, removeItem } = useRecentlyViewed(50);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'price'>('recent');

  if (isLoading) {
    return <HistorySkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No browsing history yet</p>
        <Button asChild className="mt-4">
          <a href="/products">Start browsing</a>
        </Button>
      </div>
    );
  }

  // Filter and sort
  const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        default:
          return b.viewedAt - a.viewedAt;
      }
    });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear browsing history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your browsing history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => removeItem(item.id)}
              className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove ${item.name}`}
            >
              <X className="h-3 w-3" />
            </button>
            <ProductCard
              product={item}
              href={`/products/${item.slug}`}
            />
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && search && (
        <p className="text-center text-muted-foreground py-8">
          No items match your search
        </p>
      )}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Examples

### Example 1: Product Page with Tracking

```typescript
// app/products/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getRelatedProducts } from '@/lib/products';
import { ProductDetails } from '@/components/product-details';
import { ProductTracker } from '@/hooks/use-track-view';
import { RecentlyViewed } from '@/components/recently-viewed';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, 4);

  return (
    <div className="container py-8">
      {/* Invisible tracker component */}
      <ProductTracker product={product} minViewDuration={1000} />

      <ProductDetails product={product} />

      {/* Related Products */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Recently Viewed - exclude current product */}
      <RecentlyViewed
        excludeId={product.id}
        limit={6}
        title="Continue Browsing"
        layout="carousel"
      />
    </div>
  );
}
```

### Example 2: Homepage with Recently Viewed Section

```typescript
// app/page.tsx
import { RecentlyViewed } from '@/components/recently-viewed';
import { FeaturedProducts } from '@/components/featured-products';
import { HeroBanner } from '@/components/hero-banner';

export default function HomePage() {
  return (
    <main>
      <HeroBanner />

      {/* Recently Viewed - only shows if user has history */}
      <div className="container">
        <RecentlyViewed
          limit={8}
          title="Pick Up Where You Left Off"
          showTimestamps
          layout="carousel"
        />
      </div>

      <FeaturedProducts />
    </main>
  );
}
```

### Example 3: Mini Recently Viewed Widget

```typescript
// components/recently-viewed-mini.tsx
'use client';

import { useRecentlyViewed } from '@/lib/store/recently-viewed';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export function RecentlyViewedMini() {
  const { items, isLoading } = useRecentlyViewed(4);

  if (isLoading || items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recently Viewed</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/account/history">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="block flex-shrink-0"
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Anti-patterns

### Anti-pattern 1: No Item Limit

```typescript
// BAD: No limit on stored items
addItem: (product) => {
  set((state) => ({
    items: [{ ...product, viewedAt: Date.now() }, ...state.items],
  }));
}

// GOOD: Enforce maximum items and remove stale data
const MAX_ITEMS = 30;
const STALE_THRESHOLD = 30 * 24 * 60 * 60 * 1000; // 30 days

addItem: (product) => {
  set((state) => {
    const now = Date.now();

    // Remove duplicates and stale items
    const filtered = state.items
      .filter((item) => item.id !== product.id)
      .filter((item) => now - item.viewedAt < STALE_THRESHOLD);

    // Add new item at start, enforce limit
    return {
      items: [{ ...product, viewedAt: now }, ...filtered].slice(0, MAX_ITEMS),
    };
  });
}
```

### Anti-pattern 2: Blocking Server Sync

```typescript
// BAD: Waiting for server response blocks UI
addItem: async (product) => {
  set((state) => ({
    items: [{ ...product, viewedAt: Date.now() }, ...state.items],
  }));

  // This blocks - user waits for server
  await fetch('/api/views', {
    method: 'POST',
    body: JSON.stringify({ productId: product.id }),
  });
}

// GOOD: Fire-and-forget server sync
addItem: (product) => {
  // Update local state immediately
  set((state) => ({
    items: [{ ...product, viewedAt: Date.now() }, ...state.items],
  }));

  // Async server sync without await
  fetch('/api/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: product.id }),
    keepalive: true, // Ensures request completes even if page navigates
  }).catch(() => {
    // Silent fail - localStorage is source of truth
  });
}
```

### Anti-pattern 3: Showing Current Product in Recently Viewed

```typescript
// BAD: Shows the product user is currently viewing
<ProductPage>
  <ProductDetails product={product} />
  <RecentlyViewed limit={6} />  {/* May include current product! */}
</ProductPage>

// GOOD: Exclude current product from display
<ProductPage>
  <ProductDetails product={product} />
  <RecentlyViewed
    limit={6}
    excludeId={product.id}  {/* Filter out current product */}
    title="Continue Browsing"
  />
</ProductPage>
```

### Anti-pattern 4: Hydration Mismatch

```typescript
// BAD: Different content on server vs client causes hydration errors
export function RecentlyViewed() {
  const items = useRecentlyViewedStore((state) => state.items);

  return (
    <div>
      {items.map((item) => (  // Empty on server, populated on client!
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
  );
}

// GOOD: Handle hydration state properly
export function RecentlyViewed() {
  const { items, isHydrated } = useRecentlyViewedStore();

  // Return null during SSR and until hydrated
  if (!isHydrated) return null;

  // Only render client-side after hydration
  return (
    <div>
      {items.map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
  );
}
```

## Testing

### Unit Tests for Store

```typescript
// __tests__/lib/store/recently-viewed.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRecentlyViewedStore } from '@/lib/store/recently-viewed';

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({ ok: true });

describe('useRecentlyViewedStore', () => {
  beforeEach(() => {
    // Clear store between tests
    const { result } = renderHook(() => useRecentlyViewedStore());
    act(() => {
      result.current.clearHistory();
    });
    vi.clearAllMocks();
  });

  it('adds items to the store', () => {
    const { result } = renderHook(() => useRecentlyViewedStore());

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        price: 1999,
        image: '/test.jpg',
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Test Product');
  });

  it('moves existing items to the top', () => {
    const { result } = renderHook(() => useRecentlyViewedStore());

    act(() => {
      result.current.addItem({ id: '1', name: 'First', slug: 'first', price: 100, image: '' });
      result.current.addItem({ id: '2', name: 'Second', slug: 'second', price: 200, image: '' });
      result.current.addItem({ id: '1', name: 'First', slug: 'first', price: 100, image: '' });
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe('1');
    expect(result.current.items[1].id).toBe('2');
  });

  it('enforces maximum items limit', () => {
    const { result } = renderHook(() => useRecentlyViewedStore());

    act(() => {
      // Add 35 items (more than MAX_ITEMS)
      for (let i = 0; i < 35; i++) {
        result.current.addItem({
          id: `${i}`,
          name: `Product ${i}`,
          slug: `product-${i}`,
          price: 100 * i,
          image: '',
        });
      }
    });

    expect(result.current.items.length).toBeLessThanOrEqual(30);
    expect(result.current.items[0].id).toBe('34'); // Most recent
  });

  it('removes items correctly', () => {
    const { result } = renderHook(() => useRecentlyViewedStore());

    act(() => {
      result.current.addItem({ id: '1', name: 'First', slug: 'first', price: 100, image: '' });
      result.current.addItem({ id: '2', name: 'Second', slug: 'second', price: 200, image: '' });
      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('2');
  });

  it('clears all history', () => {
    const { result } = renderHook(() => useRecentlyViewedStore());

    act(() => {
      result.current.addItem({ id: '1', name: 'First', slug: 'first', price: 100, image: '' });
      result.current.addItem({ id: '2', name: 'Second', slug: 'second', price: 200, image: '' });
      result.current.clearHistory();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('getItemsExcluding filters correctly', () => {
    const { result } = renderHook(() => useRecentlyViewedStore());

    act(() => {
      result.current.addItem({ id: '1', name: 'First', slug: 'first', price: 100, image: '' });
      result.current.addItem({ id: '2', name: 'Second', slug: 'second', price: 200, image: '' });
      result.current.addItem({ id: '3', name: 'Third', slug: 'third', price: 300, image: '' });
    });

    const filtered = result.current.getItemsExcluding('2', 10);

    expect(filtered).toHaveLength(2);
    expect(filtered.find(item => item.id === '2')).toBeUndefined();
  });

  it('merges server data correctly', () => {
    const { result } = renderHook(() => useRecentlyViewedStore());

    const now = Date.now();
    const older = now - 10000;

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Local Item',
        slug: 'local',
        price: 100,
        image: '',
      });
    });

    act(() => {
      result.current.mergeServerData([
        { id: '1', name: 'Server Item', slug: 'server', price: 150, image: '', viewedAt: now + 1000 },
        { id: '2', name: 'Server Only', slug: 'server-only', price: 200, image: '', viewedAt: older },
      ]);
    });

    expect(result.current.items).toHaveLength(2);
    // Server version is newer, should take precedence
    expect(result.current.items[0].name).toBe('Server Item');
  });
});
```

### Component Integration Tests

```typescript
// __tests__/components/recently-viewed.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentlyViewed } from '@/components/recently-viewed';
import { useRecentlyViewedStore } from '@/lib/store/recently-viewed';

// Mock the store
vi.mock('@/lib/store/recently-viewed', () => ({
  useRecentlyViewed: vi.fn(),
}));

describe('RecentlyViewed', () => {
  const mockItems = [
    { id: '1', name: 'Product 1', slug: 'product-1', price: 1999, image: '/1.jpg', viewedAt: Date.now() },
    { id: '2', name: 'Product 2', slug: 'product-2', price: 2999, image: '/2.jpg', viewedAt: Date.now() - 1000 },
  ];

  beforeEach(() => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: mockItems,
      isLoading: false,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      clearHistory: vi.fn(),
    });
  });

  it('renders nothing when loading', () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [],
      isLoading: true,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      clearHistory: vi.fn(),
    });

    const { container } = render(<RecentlyViewed />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when no items', () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [],
      isLoading: false,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      clearHistory: vi.fn(),
    });

    const { container } = render(<RecentlyViewed />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders items when available', () => {
    render(<RecentlyViewed />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('excludes specified product', () => {
    render(<RecentlyViewed excludeId="1" />);

    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('calls removeItem when remove button clicked', async () => {
    const removeItem = vi.fn();
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: mockItems,
      isLoading: false,
      addItem: vi.fn(),
      removeItem,
      clearHistory: vi.fn(),
    });

    const user = userEvent.setup();
    render(<RecentlyViewed />);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(removeItem).toHaveBeenCalledWith('1');
  });

  it('shows clear button when enabled', () => {
    render(<RecentlyViewed showClearButton />);

    expect(screen.getByRole('button', { name: /clear history/i })).toBeInTheDocument();
  });
});
```

## Related Skills

- [Zustand State Management](../patterns/zustand.md) - Client-side state management
- [Product Card](../molecules/product-card.md) - Product display component
- [Carousel Component](../organisms/carousel.md) - Horizontal scrolling container
- [Product Recommendations](../patterns/product-recommendations.md) - AI-powered suggestions
- [Session Management](../patterns/session.md) - User session handling
- [LocalStorage Utilities](../patterns/local-storage.md) - Browser storage helpers

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive server sync with user authentication
- Added merge logic for combining local and server data
- Added dedicated history page with search and sort
- Added mini widget variant
- Added stale data cleanup (30-day threshold)
- Added hydration-safe hook wrapper
- Expanded anti-patterns with code examples
- Added unit tests for store
- Added component integration tests
- Added migration support for schema changes
- Improved accessibility with ARIA labels
- Added timestamp display option

### 1.0.0 (2025-01-15)
- Initial implementation
- Zustand store with localStorage persistence
- Basic server sync
- Recently viewed component
