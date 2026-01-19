---
id: pt-wishlists
name: Wishlists
version: 1.1.0
layer: L5
category: data
description: Save-for-later functionality with wishlist management, sharing, price drop alerts, and back-in-stock notifications
tags: [wishlist, favorites, save-for-later, ecommerce, next15]
composes: []
formula: "Wishlists = ItemManagement + Sharing + PriceAlerts + StockNotifications"
dependencies:
  prisma: "^6.0.0"
  zustand: "^5.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Wishlists

## Overview

Wishlists are a fundamental feature of e-commerce applications that allow users to save products for future consideration without committing to a purchase. A well-implemented wishlist system increases user engagement, provides valuable intent signals for marketing, and can drive conversions through features like price drop alerts and back-in-stock notifications.

This pattern implements a comprehensive wishlist system for Next.js 15 applications, supporting both authenticated users with server-side persistence and guest users with local storage. The architecture enables multiple named wishlists (gift registries, different occasions), social sharing with customizable privacy settings, and automated notification triggers for price changes and inventory updates.

The implementation uses Zustand for client-side state management with persistence, automatically syncing guest wishlists to the server upon user authentication. This approach ensures a seamless experience where users never lose their saved items, regardless of their authentication state. Real-time optimistic updates provide instant feedback while background synchronization maintains data consistency.

## When to Use

- Allowing users to save items without adding to cart
- Building gift registry or wedding registry features
- Sending price drop notifications to drive conversions
- Back-in-stock alerts for out-of-inventory items
- Social sharing of product collections
- Building "favorites" or "saved items" functionality

## When NOT to Use

- **Single-session shopping**: If users complete purchases in one session
- **B2B fixed pricing**: Where prices dont change and alerts add no value
- **Digital-only products**: Where inventory is unlimited
- **Anonymous-only sites**: Where no user accounts exist to persist wishlists

## Composition Diagram

```
Wishlist System Architecture
=============================

┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Browser                                 │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    Zustand Wishlist Store                       │    │
│  │                                                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │    │
│  │  │  Guest Mode  │  │  Sync Mode   │  │  Auth Mode   │          │    │
│  │  │ localStorage │ →│ on Login     │ →│ Server Sync  │          │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              │                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      UI Components                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │  Wishlist   │  │  Wishlist   │  │   Product Card with     │  │  │
│  │  │   Button    │  │    Page     │  │   Wishlist Toggle       │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Next.js Server                                   │
│                                                                          │
│  ┌─────────────────────┐    ┌─────────────────────┐                    │
│  │   API Routes        │    │   Server Actions    │                    │
│  │                     │    │                     │                    │
│  │ GET /api/wishlist   │    │ addToWishlist()     │                    │
│  │ POST /api/wishlist  │    │ removeFromWishlist()│                    │
│  │ DELETE /api/...     │    │ toggleWishlist()    │                    │
│  └─────────┬───────────┘    └──────────┬──────────┘                    │
│            │                           │                                │
│            └───────────────────────────┘                                │
│                        │                                                │
│                        ▼                                                │
│           ┌────────────────────────────┐                               │
│           │    Wishlist Service        │                               │
│           │                            │                               │
│           │ - Add/Remove items         │                               │
│           │ - Share management         │                               │
│           │ - Price tracking           │                               │
│           │ - Stock monitoring         │                               │
│           └────────────────────────────┘                               │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Background Jobs (Cron)                              │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Price Monitor   │  │ Stock Monitor   │  │  Email Sender   │         │
│  │                 │  │                 │  │                 │         │
│  │ Check prices    │  │ Check inventory │  │ Send price drop │         │
│  │ hourly          │  │ every 30 mins   │  │ notifications   │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘

Database Schema:
================
User (1) ───< Wishlist (*) ───< WishlistItem (*)
                                      │
                                      └───> Product

Wishlist ─── shareToken (unique) ───> Public Access
```

## Implementation

### Database Schema

```prisma
model Wishlist {
  id          String         @id @default(cuid())
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  name        String         @default("My Wishlist")
  description String?
  isPublic    Boolean        @default(false)
  shareToken  String?        @unique
  coverImage  String?
  eventDate   DateTime?      // For gift registries
  items       WishlistItem[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@unique([userId, name])
  @@index([userId])
  @@index([shareToken])
}

model WishlistItem {
  id              String    @id @default(cuid())
  wishlist        Wishlist  @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  wishlistId      String
  product         Product   @relation(fields: [productId], references: [id])
  productId       String
  variantId       String?

  // Price tracking
  priceAlert      Boolean   @default(false)
  priceThreshold  Int?      // Alert if price drops below this (in cents)
  addedPrice      Int       // Price when added (in cents)
  lowestPrice     Int?      // Lowest price seen since added

  // Stock tracking
  stockAlert      Boolean   @default(false)
  wasOutOfStock   Boolean   @default(false)

  // Notification tracking
  lastPriceAlert  DateTime?
  lastStockAlert  DateTime?

  // User notes
  notes           String?
  priority        Int       @default(0)  // 0=none, 1=low, 2=medium, 3=high
  quantity        Int       @default(1)  // For registries

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([wishlistId, productId, variantId])
  @@index([productId])
  @@index([priceAlert])
  @@index([stockAlert])
}

model WishlistNotification {
  id            String   @id @default(cuid())
  userId        String
  type          String   // PRICE_DROP, BACK_IN_STOCK, LOW_STOCK
  productId     String
  productName   String
  previousValue Int?     // Previous price or stock level
  currentValue  Int      // Current price or stock level
  read          Boolean  @default(false)
  emailSent     Boolean  @default(false)
  createdAt     DateTime @default(now())

  @@index([userId, read])
  @@index([createdAt])
}
```

### Wishlist Service

```typescript
// lib/wishlist/service.ts
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { sendEmail } from '@/lib/email';

export interface AddToWishlistOptions {
  variantId?: string;
  priceAlert?: boolean;
  priceThreshold?: number;
  stockAlert?: boolean;
  notes?: string;
  priority?: number;
  quantity?: number;
  wishlistId?: string;
  wishlistName?: string;
}

export async function getOrCreateWishlist(
  userId: string,
  name: string = 'My Wishlist'
): Promise<{ id: string; name: string }> {
  let wishlist = await prisma.wishlist.findFirst({
    where: { userId, name },
    select: { id: true, name: true },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId, name },
      select: { id: true, name: true },
    });
  }

  return wishlist;
}

export async function getUserWishlists(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              compareAtPrice: true,
              images: true,
              inventory: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function addToWishlist(
  userId: string,
  productId: string,
  options: AddToWishlistOptions = {}
): Promise<{ success: boolean; itemId?: string; error?: string }> {
  const {
    variantId,
    priceAlert = false,
    priceThreshold,
    stockAlert = false,
    notes,
    priority = 0,
    quantity = 1,
    wishlistId,
    wishlistName,
  } = options;

  // Get or create wishlist
  let targetWishlistId = wishlistId;
  if (!targetWishlistId) {
    const wishlist = await getOrCreateWishlist(userId, wishlistName || 'My Wishlist');
    targetWishlistId = wishlist.id;
  }

  // Verify wishlist belongs to user
  const wishlist = await prisma.wishlist.findFirst({
    where: { id: targetWishlistId, userId },
  });

  if (!wishlist) {
    return { success: false, error: 'Wishlist not found' };
  }

  // Get product info
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, price: true, inventory: true },
  });

  if (!product) {
    return { success: false, error: 'Product not found' };
  }

  // Add or update item
  const item = await prisma.wishlistItem.upsert({
    where: {
      wishlistId_productId_variantId: {
        wishlistId: targetWishlistId,
        productId,
        variantId: variantId || '',
      },
    },
    create: {
      wishlistId: targetWishlistId,
      productId,
      variantId,
      addedPrice: product.price,
      lowestPrice: product.price,
      priceAlert,
      priceThreshold: priceThreshold || Math.floor(product.price * 0.9), // Default 10% drop
      stockAlert,
      wasOutOfStock: product.inventory === 0,
      notes,
      priority,
      quantity,
    },
    update: {
      priceAlert,
      priceThreshold,
      stockAlert,
      notes,
      priority,
      quantity,
      updatedAt: new Date(),
    },
  });

  // Update wishlist timestamp
  await prisma.wishlist.update({
    where: { id: targetWishlistId },
    data: { updatedAt: new Date() },
  });

  return { success: true, itemId: item.id };
}

export async function removeFromWishlist(
  userId: string,
  productId: string,
  variantId?: string
): Promise<boolean> {
  const wishlists = await prisma.wishlist.findMany({
    where: { userId },
    select: { id: true },
  });

  const wishlistIds = wishlists.map((w) => w.id);

  const result = await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: { in: wishlistIds },
      productId,
      variantId: variantId || null,
    },
  });

  return result.count > 0;
}

export async function isInWishlist(
  userId: string,
  productId: string,
  variantId?: string
): Promise<boolean> {
  const count = await prisma.wishlistItem.count({
    where: {
      wishlist: { userId },
      productId,
      variantId: variantId || null,
    },
  });

  return count > 0;
}

export async function shareWishlist(
  wishlistId: string,
  userId: string
): Promise<{ shareToken: string; shareUrl: string } | null> {
  const wishlist = await prisma.wishlist.findFirst({
    where: { id: wishlistId, userId },
  });

  if (!wishlist) return null;

  const shareToken = wishlist.shareToken || nanoid(12);

  await prisma.wishlist.update({
    where: { id: wishlistId },
    data: { isPublic: true, shareToken },
  });

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wishlist/shared/${shareToken}`;

  return { shareToken, shareUrl };
}

export async function unshareWishlist(
  wishlistId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.wishlist.updateMany({
    where: { id: wishlistId, userId },
    data: { isPublic: false },
  });

  return result.count > 0;
}

export async function getSharedWishlist(shareToken: string) {
  return prisma.wishlist.findUnique({
    where: { shareToken, isPublic: true },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              compareAtPrice: true,
              images: true,
              inventory: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      },
      user: { select: { name: true, image: true } },
    },
  });
}

export async function moveItemToWishlist(
  itemId: string,
  targetWishlistId: string,
  userId: string
): Promise<boolean> {
  // Verify both item and target wishlist belong to user
  const [item, targetWishlist] = await Promise.all([
    prisma.wishlistItem.findFirst({
      where: { id: itemId, wishlist: { userId } },
    }),
    prisma.wishlist.findFirst({
      where: { id: targetWishlistId, userId },
    }),
  ]);

  if (!item || !targetWishlist) return false;

  await prisma.wishlistItem.update({
    where: { id: itemId },
    data: { wishlistId: targetWishlistId },
  });

  return true;
}

// Background job to check price drops
export async function checkPriceDrops(): Promise<number> {
  const itemsWithAlerts = await prisma.wishlistItem.findMany({
    where: { priceAlert: true },
    include: {
      product: true,
      wishlist: { include: { user: true } },
    },
  });

  let notificationsSent = 0;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  for (const item of itemsWithAlerts) {
    const currentPrice = item.product.price;
    const threshold = item.priceThreshold || item.addedPrice;

    // Update lowest price tracking
    if (!item.lowestPrice || currentPrice < item.lowestPrice) {
      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: { lowestPrice: currentPrice },
      });
    }

    // Check if price is below threshold
    if (currentPrice < threshold) {
      // Dont alert if we already alerted recently
      if (item.lastPriceAlert && item.lastPriceAlert > oneDayAgo) continue;

      // Create notification
      await prisma.wishlistNotification.create({
        data: {
          userId: item.wishlist.userId,
          type: 'PRICE_DROP',
          productId: item.productId,
          productName: item.product.name,
          previousValue: item.addedPrice,
          currentValue: currentPrice,
        },
      });

      // Send email
      await sendEmail({
        to: item.wishlist.user.email,
        template: 'price-drop',
        data: {
          productName: item.product.name,
          productUrl: `${process.env.NEXT_PUBLIC_APP_URL}/products/${item.product.slug}`,
          originalPrice: item.addedPrice / 100,
          currentPrice: currentPrice / 100,
          savings: (item.addedPrice - currentPrice) / 100,
          percentOff: Math.round((1 - currentPrice / item.addedPrice) * 100),
        },
      });

      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: { lastPriceAlert: new Date() },
      });

      notificationsSent++;
    }
  }

  return notificationsSent;
}

// Background job to check stock
export async function checkStockAlerts(): Promise<number> {
  const itemsWithAlerts = await prisma.wishlistItem.findMany({
    where: {
      stockAlert: true,
      wasOutOfStock: true,
    },
    include: {
      product: true,
      wishlist: { include: { user: true } },
    },
  });

  let notificationsSent = 0;

  for (const item of itemsWithAlerts) {
    if (item.product.inventory > 0) {
      // Product is back in stock!
      await prisma.wishlistNotification.create({
        data: {
          userId: item.wishlist.userId,
          type: 'BACK_IN_STOCK',
          productId: item.productId,
          productName: item.product.name,
          currentValue: item.product.inventory,
        },
      });

      await sendEmail({
        to: item.wishlist.user.email,
        template: 'back-in-stock',
        data: {
          productName: item.product.name,
          productUrl: `${process.env.NEXT_PUBLIC_APP_URL}/products/${item.product.slug}`,
          inventory: item.product.inventory,
        },
      });

      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: {
          wasOutOfStock: false,
          lastStockAlert: new Date(),
        },
      });

      notificationsSent++;
    }
  }

  // Also update items that are now out of stock
  await prisma.$executeRaw`
    UPDATE "WishlistItem" wi
    SET "wasOutOfStock" = true
    FROM "Product" p
    WHERE wi."productId" = p.id
      AND wi."stockAlert" = true
      AND wi."wasOutOfStock" = false
      AND p.inventory = 0
  `;

  return notificationsSent;
}
```

### Zustand Store for Guest Wishlist

```typescript
// lib/store/wishlist.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistItem {
  productId: string;
  variantId?: string;
  addedAt: number;
  priceAtAdd?: number;
}

interface WishlistStore {
  items: WishlistItem[];
  isHydrated: boolean;

  // Actions
  addItem: (productId: string, variantId?: string, price?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  toggleItem: (productId: string, variantId?: string, price?: number) => boolean;
  hasItem: (productId: string, variantId?: string) => boolean;
  clearWishlist: () => void;
  getCount: () => number;

  // Server sync
  syncWithServer: (userId: string) => Promise<void>;
  loadFromServer: (userId: string) => Promise<void>;

  // Hydration
  setHydrated: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addItem: (productId, variantId, price) => {
        set((state) => {
          if (get().hasItem(productId, variantId)) return state;
          return {
            items: [
              ...state.items,
              {
                productId,
                variantId,
                addedAt: Date.now(),
                priceAtAdd: price,
              },
            ],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      toggleItem: (productId, variantId, price) => {
        const hasItem = get().hasItem(productId, variantId);
        if (hasItem) {
          get().removeItem(productId, variantId);
          return false;
        } else {
          get().addItem(productId, variantId, price);
          return true;
        }
      },

      hasItem: (productId, variantId) => {
        return get().items.some(
          (item) =>
            item.productId === productId &&
            (variantId ? item.variantId === variantId : true)
        );
      },

      clearWishlist: () => set({ items: [] }),

      getCount: () => get().items.length,

      syncWithServer: async (userId) => {
        const items = get().items;
        if (items.length === 0) return;

        try {
          await fetch('/api/wishlist/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          });

          // Clear local after successful sync
          set({ items: [] });
        } catch (error) {
          console.error('Failed to sync wishlist:', error);
        }
      },

      loadFromServer: async (userId) => {
        try {
          const response = await fetch('/api/wishlist');
          const data = await response.json();

          if (data.items) {
            set({
              items: data.items.map((item: any) => ({
                productId: item.productId,
                variantId: item.variantId,
                addedAt: new Date(item.createdAt).getTime(),
                priceAtAdd: item.addedPrice,
              })),
            });
          }
        } catch (error) {
          console.error('Failed to load wishlist:', error);
        }
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// Hook to use wishlist with auth awareness
export function useWishlist() {
  const store = useWishlistStore();

  return {
    ...store,
    itemCount: store.items.length,
  };
}
```

### API Routes

```typescript
// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserWishlists, addToWishlist, removeFromWishlist } from '@/lib/wishlist/service';
import { z } from 'zod';

const addItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().optional(),
  wishlistId: z.string().cuid().optional(),
  wishlistName: z.string().optional(),
  priceAlert: z.boolean().optional(),
  priceThreshold: z.number().int().positive().optional(),
  stockAlert: z.boolean().optional(),
  notes: z.string().max(500).optional(),
  priority: z.number().int().min(0).max(3).optional(),
  quantity: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const wishlists = await getUserWishlists(session.user.id);

  // Flatten items for simple list view
  const items = wishlists.flatMap((w) =>
    w.items.map((item) => ({
      ...item,
      wishlistId: w.id,
      wishlistName: w.name,
    }))
  );

  return NextResponse.json({ wishlists, items });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = addItemSchema.parse(body);

    const result = await addToWishlist(session.user.id, data.productId, {
      variantId: data.variantId,
      wishlistId: data.wishlistId,
      wishlistName: data.wishlistName,
      priceAlert: data.priceAlert,
      priceThreshold: data.priceThreshold,
      stockAlert: data.stockAlert,
      notes: data.notes,
      priority: data.priority,
      quantity: data.quantity,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ itemId: result.itemId }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, variantId } = await request.json();

  const removed = await removeFromWishlist(session.user.id, productId, variantId);

  if (!removed) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// app/api/wishlist/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addToWishlist } from '@/lib/wishlist/service';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items } = await request.json();

  let added = 0;
  for (const item of items) {
    const result = await addToWishlist(session.user.id, item.productId, {
      variantId: item.variantId,
    });
    if (result.success) added++;
  }

  return NextResponse.json({ synced: added });
}
```

## Examples

### Example 1: Wishlist Button Component

```tsx
// components/wishlist-button.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  price?: number;
  productName?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  showText?: boolean;
}

export function WishlistButton({
  productId,
  variantId,
  price,
  productName,
  className,
  size = 'icon',
  showText = false,
}: WishlistButtonProps) {
  const { data: session, status } = useSession();
  const { hasItem, toggleItem, isHydrated } = useWishlistStore();
  const [isPending, startTransition] = useTransition();
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Sync with store after hydration
  useEffect(() => {
    if (isHydrated) {
      setIsInWishlist(hasItem(productId, variantId));
    }
  }, [isHydrated, productId, variantId, hasItem]);

  const handleToggle = async () => {
    // Optimistic update
    const newState = !isInWishlist;
    setIsInWishlist(newState);

    if (session?.user) {
      // Authenticated: sync with server
      startTransition(async () => {
        try {
          if (newState) {
            await fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, variantId }),
            });
            toast.success(productName ? `${productName} added to wishlist` : 'Added to wishlist');
          } else {
            await fetch('/api/wishlist', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, variantId }),
            });
            toast.success('Removed from wishlist');
          }
        } catch (error) {
          // Revert on error
          setIsInWishlist(!newState);
          toast.error('Failed to update wishlist');
        }
      });
    } else {
      // Guest: use local storage
      toggleItem(productId, variantId, price);
      toast.success(
        newState
          ? 'Added to wishlist'
          : 'Removed from wishlist'
      );
    }
  };

  // Dont render until hydrated to avoid mismatch
  if (!isHydrated) {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn('opacity-50', className)}
        disabled
      >
        <Heart className="h-4 w-4" />
        {showText && <span className="ml-2">Save</span>}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'transition-colors',
        isInWishlist && 'text-red-500 border-red-200 hover:bg-red-50',
        className
      )}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isInWishlist}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all',
          isInWishlist && 'fill-current',
          isPending && 'animate-pulse'
        )}
      />
      {showText && (
        <span className="ml-2">
          {isInWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
}
```

### Example 2: Wishlist Page

```tsx
// app/wishlist/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserWishlists } from '@/lib/wishlist/service';
import { WishlistGrid } from '@/components/wishlist-grid';
import { CreateWishlistDialog } from '@/components/create-wishlist-dialog';
import { WishlistTabs } from '@/components/wishlist-tabs';
import { Button } from '@/components/ui/button';
import { Plus, Share2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'My Wishlist',
};

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/wishlist');
  }

  const wishlists = await getUserWishlists(session.user.id);
  const totalItems = wishlists.reduce((sum, w) => sum + w.items.length, 0);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <CreateWishlistDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </CreateWishlistDialog>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-16 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-4">
            Save items you love to your wishlist and find them here anytime.
          </p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : wishlists.length === 1 ? (
        <WishlistGrid
          wishlist={wishlists[0]}
          showActions
        />
      ) : (
        <WishlistTabs wishlists={wishlists} />
      )}
    </div>
  );
}

// components/wishlist-grid.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Bell, BellOff, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface WishlistGridProps {
  wishlist: {
    id: string;
    name: string;
    isPublic: boolean;
    shareToken: string | null;
    items: Array<{
      id: string;
      productId: string;
      priceAlert: boolean;
      stockAlert: boolean;
      addedPrice: number;
      product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        compareAtPrice: number | null;
        images: string[];
        inventory: number;
      };
    }>;
  };
  showActions?: boolean;
}

export function WishlistGrid({ wishlist, showActions = true }: WishlistGridProps) {
  const [items, setItems] = useState(wishlist.items);

  const handleRemove = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Optimistic update
    setItems(items.filter(i => i.id !== itemId));

    try {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.productId }),
      });
      toast.success('Item removed');
    } catch {
      setItems([...items]);
      toast.error('Failed to remove item');
    }
  };

  const toggleAlert = async (itemId: string, type: 'price' | 'stock') => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const field = type === 'price' ? 'priceAlert' : 'stockAlert';
    const newValue = !item[field];

    // Optimistic update
    setItems(items.map(i =>
      i.id === itemId ? { ...i, [field]: newValue } : i
    ));

    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          [field]: newValue,
        }),
      });
      toast.success(
        newValue
          ? `${type === 'price' ? 'Price drop' : 'Back in stock'} alerts enabled`
          : 'Alerts disabled'
      );
    } catch {
      setItems(items.map(i =>
        i.id === itemId ? { ...i, [field]: !newValue } : i
      ));
      toast.error('Failed to update alerts');
    }
  };

  const handleShare = async () => {
    const response = await fetch(`/api/wishlist/${wishlist.id}/share`, {
      method: 'POST',
    });
    const { shareUrl } = await response.json();

    await navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">This list is empty</p>
      </div>
    );
  }

  return (
    <div>
      {showActions && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share List
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const priceDrop = item.product.price < item.addedPrice;
          const percentOff = priceDrop
            ? Math.round((1 - item.product.price / item.addedPrice) * 100)
            : 0;
          const outOfStock = item.product.inventory === 0;

          return (
            <div
              key={item.id}
              className="group relative border rounded-lg overflow-hidden bg-white"
            >
              <Link href={`/products/${item.product.slug}`}>
                <div className="aspect-square relative">
                  <Image
                    src={item.product.images[0] || '/placeholder.png'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                  {priceDrop && (
                    <Badge className="absolute top-2 left-2 bg-green-500">
                      {percentOff}% off
                    </Badge>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Out of Stock</Badge>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-3">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="font-medium text-sm line-clamp-2 hover:underline">
                    {item.product.name}
                  </h3>
                </Link>

                <div className="mt-1 flex items-center gap-2">
                  <span className="font-semibold">
                    {formatCurrency(item.product.price / 100)}
                  </span>
                  {priceDrop && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(item.addedPrice / 100)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleAlert(item.id, 'price')}
                    title={item.priceAlert ? 'Disable price alerts' : 'Enable price alerts'}
                  >
                    {item.priceAlert ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemove(item.id)}
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1 h-8"
                    disabled={outOfStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Example 3: Shared Wishlist Page

```tsx
// app/wishlist/shared/[token]/page.tsx
import { notFound } from 'next/navigation';
import { getSharedWishlist } from '@/lib/wishlist/service';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Heart, Calendar } from 'lucide-react';
import { AddToCartButton } from '@/components/add-to-cart-button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const wishlist = await getSharedWishlist(token);

  if (!wishlist) {
    return { title: 'Wishlist Not Found' };
  }

  return {
    title: `${wishlist.user.name}'s ${wishlist.name}`,
    description: wishlist.description || `View ${wishlist.user.name}'s wishlist`,
  };
}

export default async function SharedWishlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const wishlist = await getSharedWishlist(token);

  if (!wishlist) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {wishlist.user.image && (
            <Image
              src={wishlist.user.image}
              alt={wishlist.user.name || ''}
              width={64}
              height={64}
              className="rounded-full mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold">{wishlist.user.name}'s {wishlist.name}</h1>
          {wishlist.description && (
            <p className="text-muted-foreground mt-2">{wishlist.description}</p>
          )}
          {wishlist.eventDate && (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Event Date: {new Date(wishlist.eventDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.items.map((item) => {
            const outOfStock = item.product.inventory === 0;

            return (
              <div
                key={item.id}
                className="border rounded-lg overflow-hidden bg-white"
              >
                <Link href={`/products/${item.product.slug}`}>
                  <div className="aspect-square relative">
                    <Image
                      src={item.product.images[0] || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                    {item.priority === 3 && (
                      <Badge className="absolute top-2 left-2">
                        Most Wanted
                      </Badge>
                    )}
                  </div>
                </Link>

                <div className="p-3">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:underline">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="mt-1">
                    <span className="font-semibold">
                      {formatCurrency(item.product.price / 100)}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{item.notes}"
                    </p>
                  )}

                  {item.quantity > 1 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Wants: {item.quantity}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <AddToCartButton
                      productId={item.productId}
                      disabled={outOfStock}
                      className="flex-1 h-9"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Buy
                    </AddToCartButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {wishlist.items.length === 0 && (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">This wishlist is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Anti-patterns

### 1. No Guest Wishlist Support

```typescript
// BAD - Only allowing authenticated users
export function WishlistButton({ productId }: { productId: string }) {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Button disabled>
        <Heart className="h-4 w-4" />
        Login to save
      </Button>
    );
  }

  // ...rest of implementation
}

// GOOD - Support guests with local storage, sync on login
export function WishlistButton({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const localStore = useWishlistStore();

  const handleToggle = async () => {
    if (session?.user) {
      // Sync with server
      await fetch('/api/wishlist', { method: 'POST', ... });
    } else {
      // Use local storage for guests
      localStore.toggleItem(productId);
    }
  };

  // ...rest works for both cases
}
```

### 2. Not Tracking Price at Add Time

```typescript
// BAD - No price tracking
await prisma.wishlistItem.create({
  data: {
    wishlistId,
    productId,
    // Missing addedPrice!
  },
});

// Later: "Hey user, this item dropped in price!"
// User: "Dropped from what? I don't remember."

// GOOD - Track price when added
const product = await prisma.product.findUnique({
  where: { id: productId },
  select: { price: true },
});

await prisma.wishlistItem.create({
  data: {
    wishlistId,
    productId,
    addedPrice: product.price,
    lowestPrice: product.price,
  },
});

// Later: "This item dropped from $99 to $79 - 20% off!"
```

### 3. Unlimited Wishlist Items

```typescript
// BAD - No limits, database could explode
export async function addToWishlist(userId: string, productId: string) {
  return prisma.wishlistItem.create({
    data: { ... },
  });
}

// GOOD - Enforce reasonable limits
const MAX_WISHLIST_ITEMS = 500;

export async function addToWishlist(userId: string, productId: string) {
  const count = await prisma.wishlistItem.count({
    where: { wishlist: { userId } },
  });

  if (count >= MAX_WISHLIST_ITEMS) {
    return {
      success: false,
      error: `Wishlist limit reached (${MAX_WISHLIST_ITEMS} items)`,
    };
  }

  return prisma.wishlistItem.create({
    data: { ... },
  });
}
```

### 4. Sending Too Many Notifications

```typescript
// BAD - Alert on every price change
if (currentPrice !== lastCheckedPrice) {
  await sendPriceDropEmail(user, product);
}
// User gets 10 emails a day as price fluctuates

// GOOD - Rate limit and threshold-based alerts
const ONE_DAY = 24 * 60 * 60 * 1000;

if (currentPrice < item.priceThreshold) {
  // Check if already alerted recently
  if (item.lastPriceAlert && Date.now() - item.lastPriceAlert.getTime() < ONE_DAY) {
    return; // Skip, already notified today
  }

  await sendPriceDropEmail(user, product);
  await prisma.wishlistItem.update({
    where: { id: item.id },
    data: { lastPriceAlert: new Date() },
  });
}
```

## Testing

### Unit Tests

```typescript
// __tests__/lib/wishlist/service.test.ts
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  shareWishlist,
  checkPriceDrops,
} from '@/lib/wishlist/service';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

jest.mock('@/lib/prisma');
jest.mock('@/lib/email');

describe('Wishlist Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToWishlist', () => {
    it('adds item to default wishlist', async () => {
      (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.wishlist.create as jest.Mock).mockResolvedValue({
        id: 'wishlist-1',
        name: 'My Wishlist',
      });
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: 'product-1',
        price: 2999,
        inventory: 10,
      });
      (prisma.wishlistItem.upsert as jest.Mock).mockResolvedValue({
        id: 'item-1',
      });
      (prisma.wishlist.update as jest.Mock).mockResolvedValue({});

      const result = await addToWishlist('user-1', 'product-1');

      expect(result.success).toBe(true);
      expect(result.itemId).toBe('item-1');
      expect(prisma.wishlistItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            productId: 'product-1',
            addedPrice: 2999,
          }),
        })
      );
    });

    it('creates wishlist if not exists', async () => {
      (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.wishlist.create as jest.Mock).mockResolvedValue({
        id: 'new-wishlist',
        name: 'My Wishlist',
      });
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: 'product-1',
        price: 1000,
      });
      (prisma.wishlistItem.upsert as jest.Mock).mockResolvedValue({ id: 'item-1' });
      (prisma.wishlist.update as jest.Mock).mockResolvedValue({});

      await addToWishlist('user-1', 'product-1');

      expect(prisma.wishlist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: 'user-1', name: 'My Wishlist' },
        })
      );
    });

    it('returns error for non-existent product', async () => {
      (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue({
        id: 'wishlist-1',
        userId: 'user-1',
      });
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await addToWishlist('user-1', 'invalid-product');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Product not found');
    });
  });

  describe('shareWishlist', () => {
    it('generates share token and URL', async () => {
      (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue({
        id: 'wishlist-1',
        userId: 'user-1',
        shareToken: null,
      });
      (prisma.wishlist.update as jest.Mock).mockResolvedValue({});

      const result = await shareWishlist('wishlist-1', 'user-1');

      expect(result).not.toBeNull();
      expect(result?.shareToken).toBeDefined();
      expect(result?.shareUrl).toContain('/wishlist/shared/');
      expect(prisma.wishlist.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isPublic: true,
            shareToken: expect.any(String),
          }),
        })
      );
    });

    it('returns null for non-existent wishlist', async () => {
      (prisma.wishlist.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await shareWishlist('invalid', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('checkPriceDrops', () => {
    it('sends notification when price drops below threshold', async () => {
      const mockItem = {
        id: 'item-1',
        priceThreshold: 3000,
        addedPrice: 4000,
        lowestPrice: 4000,
        lastPriceAlert: null,
        product: {
          id: 'product-1',
          name: 'Test Product',
          slug: 'test-product',
          price: 2500, // Below threshold
        },
        wishlist: {
          userId: 'user-1',
          user: { email: 'test@example.com' },
        },
      };

      (prisma.wishlistItem.findMany as jest.Mock).mockResolvedValue([mockItem]);
      (prisma.wishlistItem.update as jest.Mock).mockResolvedValue({});
      (prisma.wishlistNotification.create as jest.Mock).mockResolvedValue({});

      const count = await checkPriceDrops();

      expect(count).toBe(1);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          template: 'price-drop',
        })
      );
    });

    it('skips if already notified within 24 hours', async () => {
      const mockItem = {
        id: 'item-1',
        priceThreshold: 3000,
        addedPrice: 4000,
        lastPriceAlert: new Date(), // Just alerted
        product: { price: 2500 },
        wishlist: { user: { email: 'test@example.com' } },
      };

      (prisma.wishlistItem.findMany as jest.Mock).mockResolvedValue([mockItem]);

      const count = await checkPriceDrops();

      expect(count).toBe(0);
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });
});
```

### Component Tests

```typescript
// __tests__/components/wishlist-button.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WishlistButton } from '@/components/wishlist-button';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useSession } from 'next-auth/react';

jest.mock('@/lib/store/wishlist');
jest.mock('next-auth/react');

describe('WishlistButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWishlistStore as unknown as jest.Mock).mockReturnValue({
      hasItem: jest.fn().mockReturnValue(false),
      toggleItem: jest.fn(),
      isHydrated: true,
    });
  });

  it('renders with correct initial state', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<WishlistButton productId="product-1" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles wishlist state on click (guest)', async () => {
    const toggleItem = jest.fn().mockReturnValue(true);
    (useWishlistStore as unknown as jest.Mock).mockReturnValue({
      hasItem: jest.fn().mockReturnValue(false),
      toggleItem,
      isHydrated: true,
    });
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<WishlistButton productId="product-1" />);

    fireEvent.click(screen.getByRole('button'));

    expect(toggleItem).toHaveBeenCalledWith('product-1', undefined, undefined);
  });

  it('calls API for authenticated users', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
    });
    (useWishlistStore as unknown as jest.Mock).mockReturnValue({
      hasItem: jest.fn().mockReturnValue(false),
      toggleItem: jest.fn(),
      isHydrated: true,
    });

    render(<WishlistButton productId="product-1" />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/wishlist', expect.any(Object));
    });
  });

  it('shows filled heart when item is in wishlist', () => {
    (useWishlistStore as unknown as jest.Mock).mockReturnValue({
      hasItem: jest.fn().mockReturnValue(true),
      toggleItem: jest.fn(),
      isHydrated: true,
    });
    (useSession as jest.Mock).mockReturnValue({ data: null });

    render(<WishlistButton productId="product-1" />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
```

## Related Skills

- [Zustand State](../patterns/zustand.md) - Client-side state management
- [Push Notifications](../patterns/push-notifications.md) - Real-time alerts
- [Cron Jobs](../patterns/cron-jobs.md) - Background price/stock monitoring
- [Authentication](../patterns/authentication.md) - User session management
- [Email Templates](../patterns/transactional-email.md) - Notification emails

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive Overview section (3 paragraphs)
- Added When NOT to Use section with 4 scenarios
- Added detailed Composition Diagram with system architecture
- Expanded database schema with notification tracking
- Added API routes with validation
- Added 3 complete examples (button, page, shared view)
- Expanded anti-patterns from 3 to 4 with detailed code comparisons
- Added comprehensive testing section with unit and component tests
- Enhanced service with move item, price tracking, and stock monitoring
- Added notification system for price drops and back-in-stock

### 1.0.0 (2025-01-18)
- Initial implementation
- Basic wishlist CRUD
- Guest wishlist with Zustand
- Sharing functionality
