---
id: pt-shopping-cart
name: Shopping Cart State Management
version: 1.1.0
layer: L5
category: state
description: Shopping cart state management with persistence for e-commerce applications in Next.js 15
tags: [cart, e-commerce, state, zustand, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../molecules/badge.md
dependencies:
  zustand: "^5.0.0"
  immer: "^10.0.0"
formula: Zustand Store + Persist + Server Sync = Persistent Shopping Cart
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Shopping Cart State Management

## Overview

The shopping cart is the centerpiece of any e-commerce application, serving as the bridge between product browsing and checkout. This pattern provides a production-ready cart implementation using Zustand for state management, with persistence across browser sessions and optional server synchronization for logged-in users.

Modern e-commerce carts need to handle complex scenarios including variant products (size, color), quantity limits based on inventory, promotional pricing, and seamless transitions between guest and authenticated states. The implementation presented here addresses all these requirements while maintaining excellent performance through selective re-rendering and optimized storage patterns.

The cart architecture follows a client-first approach where the primary source of truth lives in the browser, with optional server synchronization for cross-device cart persistence. This ensures the cart remains responsive even during network issues while still providing the benefits of server-side persistence when the user is logged in.

## When to Use

- **E-commerce applications**: Managing product selections, quantities, and variants across the shopping experience
- **Persistent cart requirements**: When the cart needs to survive page refreshes, tab closes, and browser restarts
- **Guest checkout flows**: Supporting cart functionality without requiring user authentication
- **Multi-device synchronization**: Optionally syncing cart to server for logged-in users to access from any device
- **Complex product variants**: Handling products with multiple options like size, color, or customizations
- **Inventory-aware carts**: Enforcing quantity limits based on real-time stock availability

## When NOT to Use

- **Single product checkout**: If your flow goes directly from product to checkout without cart aggregation
- **Server-only cart management**: When business requirements mandate all cart state lives on the server
- **Subscription-only products**: Subscription services often skip traditional cart patterns
- **Quote-based sales**: B2B scenarios where pricing requires salesperson involvement

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Shopping Cart Architecture                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Cart Store (Zustand)                          │   │
│  │                                                                  │   │
│  │  State                    Actions                   Computed     │   │
│  │  ──────                   ───────                   ────────     │   │
│  │  items: CartItem[]        addItem()                 itemCount    │   │
│  │  isOpen: boolean          removeItem()              subtotal     │   │
│  │  syncing: boolean         updateQuantity()          tax          │   │
│  │  lastSynced: Date         clearCart()               total        │   │
│  │                           toggleCart()              isEmpty      │   │
│  │                           syncToServer()                         │   │
│  │                                                                  │   │
│  │  Middleware: persist (localStorage) + immer (immutable updates) │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                │                │                          │
│            ▼                ▼                ▼                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Cart Components                               │   │
│  │                                                                  │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │   │
│  │  │ CartIcon      │  │ CartDrawer    │  │ CartPage          │    │   │
│  │  │               │  │               │  │                   │    │   │
│  │  │ - Badge count │  │ - Item list   │  │ - Full cart view  │    │   │
│  │  │ - Open/close  │  │ - Quantities  │  │ - Summary         │    │   │
│  │  └───────────────┘  │ - Remove      │  │ - Checkout link   │    │   │
│  │                     │ - Subtotal    │  └───────────────────┘    │   │
│  │                     └───────────────┘                           │   │
│  │                                                                  │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │   │
│  │  │ AddToCart     │  │ QuantityInput │  │ CartSummary       │    │   │
│  │  │ Button        │  │               │  │                   │    │   │
│  │  │               │  │ - +/- buttons │  │ - Subtotal        │    │   │
│  │  │ - Add action  │  │ - Input field │  │ - Shipping        │    │   │
│  │  │ - Loading     │  │ - Max limit   │  │ - Tax             │    │   │
│  │  │ - Success     │  │               │  │ - Total           │    │   │
│  │  └───────────────┘  └───────────────┘  └───────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                                                            │
│            ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Server Synchronization (Optional)             │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ POST /api/cart  │  │ GET /api/cart   │  │ Merge Strategy  │  │   │
│  │  │ Save cart       │  │ Load cart       │  │ on login        │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Cart Store with Zustand

```typescript
// stores/cart-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface CartItemVariant {
  id: string;
  name: string;
  options: Record<string, string>; // e.g., { size: 'M', color: 'Blue' }
}

export interface CartItem {
  id: string;           // Unique cart line ID (productId + variantId)
  productId: string;
  name: string;
  price: number;
  compareAtPrice?: number; // Original price if on sale
  quantity: number;
  image: string;
  variant?: CartItemVariant;
  maxQuantity?: number; // Inventory limit
  attributes?: Record<string, string>; // Custom attributes
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastUpdated: Date | null;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;

  // Drawer controls
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed getters
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: (rate?: number) => number;
  getTotal: (taxRate?: number, shipping?: number) => number;
  getItem: (id: string) => CartItem | undefined;
  isEmpty: () => boolean;
  getSavings: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],
      isOpen: false,
      lastUpdated: null,

      addItem: (newItem, quantity = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === newItem.id
          );

          if (existingIndex !== -1) {
            // Update existing item quantity
            const existing = state.items[existingIndex];
            const newQuantity = existing.quantity + quantity;

            // Respect max quantity limit
            existing.quantity = existing.maxQuantity
              ? Math.min(newQuantity, existing.maxQuantity)
              : newQuantity;
          } else {
            // Add new item
            const itemQuantity = newItem.maxQuantity
              ? Math.min(quantity, newItem.maxQuantity)
              : quantity;

            state.items.push({ ...newItem, quantity: itemQuantity });
          }

          state.lastUpdated = new Date();
          state.isOpen = true; // Open cart drawer when adding
        }),

      removeItem: (id) =>
        set((state) => {
          state.items = state.items.filter((item) => item.id !== id);
          state.lastUpdated = new Date();
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);

          if (item) {
            if (quantity <= 0) {
              // Remove item if quantity is 0 or less
              state.items = state.items.filter((i) => i.id !== id);
            } else {
              // Update quantity respecting max limit
              item.quantity = item.maxQuantity
                ? Math.min(quantity, item.maxQuantity)
                : quantity;
            }
            state.lastUpdated = new Date();
          }
        }),

      clearCart: () =>
        set((state) => {
          state.items = [];
          state.lastUpdated = new Date();
        }),

      setItems: (items) =>
        set((state) => {
          state.items = items;
          state.lastUpdated = new Date();
        }),

      toggleCart: () => set((state) => { state.isOpen = !state.isOpen; }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      getTax: (rate = 0.0825) => get().getSubtotal() * rate,

      getTotal: (taxRate = 0.0825, shipping = 0) => {
        const subtotal = get().getSubtotal();
        const tax = subtotal * taxRate;
        return subtotal + tax + shipping;
      },

      getItem: (id) => get().items.find((item) => item.id === id),

      isEmpty: () => get().items.length === 0,

      getSavings: () =>
        get().items.reduce((sum, item) => {
          if (item.compareAtPrice && item.compareAtPrice > item.price) {
            return sum + (item.compareAtPrice - item.price) * item.quantity;
          }
          return sum;
        }, 0),
    })),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items array, not UI state
      partialize: (state) => ({
        items: state.items,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartOpen = () => useCartStore((state) => state.isOpen);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());
```

### Cart Icon Component

```tsx
// components/cart/cart-icon.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useCartItemCount } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className }: CartIconProps) {
  const toggleCart = useCartStore((state) => state.toggleCart);
  const count = useCartItemCount();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('relative', className)}
      onClick={toggleCart}
      aria-label={`Shopping cart with ${count} items`}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          variant="destructive"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </Button>
  );
}
```

### Cart Drawer Component

```tsx
// components/cart/cart-drawer.tsx
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import Image from 'next/image';
import Link from 'next/link';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTax,
    getTotal,
    getSavings,
  } = useCartStore();

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const savings = getSavings();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-6">
              Add some items to get started
            </p>
            <Button asChild onClick={closeCart}>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 border-b last:border-0"
                  >
                    {/* Product Image */}
                    <div className="relative h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.name}
                      </h4>

                      {item.variant && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.variant.name}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-sm">
                          {formatPrice(item.price)}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span
                            className="w-10 text-center text-sm tabular-nums"
                            aria-label={`Quantity: ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={
                              item.maxQuantity
                                ? item.quantity >= item.maxQuantity
                                : false
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Max quantity warning */}
                      {item.maxQuantity && item.quantity >= item.maxQuantity && (
                        <p className="text-xs text-amber-600 mt-1">
                          Maximum quantity reached
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="flex-col gap-4 sm:flex-col">
              <Separator />

              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You save</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid gap-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout" onClick={closeCart}>
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                  onClick={closeCart}
                >
                  <Link href="/cart">View Full Cart</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

### Add to Cart Button

```tsx
// components/cart/add-to-cart-button.tsx
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCartStore, type CartItem } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  showQuantity?: boolean;
  onSuccess?: () => void;
}

export function AddToCartButton({
  product,
  quantity = 1,
  disabled = false,
  className,
  showQuantity = false,
  onSuccess,
}: AddToCartButtonProps) {
  const { addItem, getItem } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  const existingItem = getItem(product.id);
  const isMaxReached = existingItem?.maxQuantity
    ? existingItem.quantity >= existingItem.maxQuantity
    : false;

  const handleAdd = () => {
    if (disabled || isMaxReached) return;

    startTransition(() => {
      addItem(product, quantity);
      setShowSuccess(true);
      onSuccess?.();

      // Reset success state after animation
      setTimeout(() => setShowSuccess(false), 2000);
    });
  };

  const buttonText = () => {
    if (showSuccess) return 'Added!';
    if (existingItem) return showQuantity ? `Add More (${existingItem.quantity} in cart)` : 'Add More';
    return showQuantity && quantity > 1 ? `Add ${quantity} to Cart` : 'Add to Cart';
  };

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled || isPending || isMaxReached}
      className={cn('min-w-[140px]', className)}
      aria-label={`Add ${product.name} to cart`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
      ) : showSuccess ? (
        <Check className="h-4 w-4 mr-2" aria-hidden="true" />
      ) : (
        <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
      )}
      {buttonText()}
    </Button>
  );
}
```

### Server Synchronization

```typescript
// lib/cart/sync.ts
import { useCartStore, type CartItem } from '@/stores/cart-store';

export interface SyncOptions {
  strategy: 'local' | 'server' | 'merge';
}

/**
 * Sync local cart with server for authenticated users
 */
export async function syncCartToServer(userId: string): Promise<void> {
  const { items } = useCartStore.getState();

  try {
    await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, items }),
    });
  } catch (error) {
    console.error('Failed to sync cart to server:', error);
  }
}

/**
 * Load cart from server for authenticated users
 */
export async function loadCartFromServer(userId: string): Promise<CartItem[]> {
  try {
    const response = await fetch(`/api/cart?userId=${userId}`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to load cart from server:', error);
    return [];
  }
}

/**
 * Merge local and server carts on login
 */
export async function mergeCartsOnLogin(
  userId: string,
  options: SyncOptions = { strategy: 'merge' }
): Promise<void> {
  const { items: localItems, setItems } = useCartStore.getState();
  const serverItems = await loadCartFromServer(userId);

  if (options.strategy === 'local') {
    // Use local cart, sync to server
    await syncCartToServer(userId);
    return;
  }

  if (options.strategy === 'server') {
    // Use server cart, replace local
    setItems(serverItems);
    return;
  }

  // Merge strategy: combine both carts
  const mergedItems = [...serverItems];

  for (const localItem of localItems) {
    const existingIndex = mergedItems.findIndex((item) => item.id === localItem.id);

    if (existingIndex !== -1) {
      // Item exists in both - use higher quantity
      mergedItems[existingIndex].quantity = Math.max(
        mergedItems[existingIndex].quantity,
        localItem.quantity
      );
    } else {
      // Item only in local - add to merged
      mergedItems.push(localItem);
    }
  }

  setItems(mergedItems);
  await syncCartToServer(userId);
}

// API Route for cart persistence
// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: true },
  });

  return NextResponse.json({ items: cart?.items || [] });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items } = await request.json();

  await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      items: { create: items },
    },
    update: {
      items: {
        deleteMany: {},
        create: items,
      },
    },
  });

  return NextResponse.json({ success: true });
}
```

## Examples

### Example 1: Product Page with Cart Integration

```tsx
// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductVariantSelector } from '@/components/product/variant-selector';
import { QuantitySelector } from '@/components/product/quantity-selector';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      images: true,
    },
  });

  if (!product) notFound();

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <ProductGallery images={product.images} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold mt-2">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {/* Client Component for interactivity */}
          <ProductPurchaseForm product={product} />
        </div>
      </div>
    </div>
  );
}

// components/product/purchase-form.tsx
'use client';

import { useState } from 'react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { VariantSelector } from '@/components/product/variant-selector';
import type { Product, ProductVariant } from '@prisma/client';

interface ProductPurchaseFormProps {
  product: Product & { variants: ProductVariant[] };
}

export function ProductPurchaseForm({ product }: ProductPurchaseFormProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  const cartItem = {
    id: selectedVariant
      ? `${product.id}-${selectedVariant.id}`
      : product.id,
    productId: product.id,
    name: product.name,
    price: selectedVariant?.price || product.price,
    image: product.images[0]?.url || '/placeholder.jpg',
    maxQuantity: selectedVariant?.inventory || product.inventory,
    variant: selectedVariant
      ? {
          id: selectedVariant.id,
          name: selectedVariant.name,
          options: selectedVariant.options as Record<string, string>,
        }
      : undefined,
  };

  return (
    <div className="space-y-6">
      {product.variants.length > 0 && (
        <VariantSelector
          variants={product.variants}
          selected={selectedVariant}
          onChange={setSelectedVariant}
        />
      )}

      <div className="flex items-center gap-4">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={cartItem.maxQuantity}
        />

        <AddToCartButton
          product={cartItem}
          quantity={quantity}
          disabled={!cartItem.maxQuantity || cartItem.maxQuantity === 0}
          showQuantity
        />
      </div>

      {cartItem.maxQuantity === 0 && (
        <p className="text-destructive">Out of stock</p>
      )}
    </div>
  );
}
```

### Example 2: Full Cart Page

```tsx
// app/cart/page.tsx
'use client';

import { useCartStore } from '@/stores/cart-store';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, clearCart, isEmpty } = useCartStore();

  if (isEmpty()) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you havent added anything to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="outline" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}

// components/cart/cart-summary.tsx
'use client';

import { useCartStore } from '@/stores/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Link from 'next/link';

export function CartSummary() {
  const { getSubtotal, getTax, getTotal, getSavings, getItemCount } = useCartStore();
  const [promoCode, setPromoCode] = useState('');

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const savings = getSavings();
  const itemCount = getItemCount();

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Promo Code */}
        <div className="flex gap-2">
          <Input
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button variant="outline">Apply</Button>
        </div>

        <Separator />

        {/* Summary Lines */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({itemCount} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${savings.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </div>

          <div className="flex justify-between">
            <span>Estimated Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" size="lg">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Example 3: Cart Merge on Authentication

```tsx
// components/auth/login-handler.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { mergeCartsOnLogin } from '@/lib/cart/sync';
import { useCartStore } from '@/stores/cart-store';

export function CartAuthHandler() {
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    // When user logs in and has items in cart, merge carts
    if (status === 'authenticated' && session?.user?.id && items.length > 0) {
      mergeCartsOnLogin(session.user.id, { strategy: 'merge' });
    }
  }, [status, session?.user?.id, items.length]);

  return null;
}

// Add to layout
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <CartAuthHandler />
          <CartDrawer />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

## Anti-patterns

### Anti-pattern 1: Not Handling Hydration Mismatch

```tsx
// BAD - Causes hydration mismatch
function CartBadge() {
  const count = useCartStore((state) => state.getItemCount());
  // Server renders 0, client renders actual count
  return <span>{count}</span>;
}

// GOOD - Handle hydration properly
function CartBadge() {
  const count = useCartStore((state) => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing or placeholder during SSR
  if (!mounted) return <span>0</span>;

  return <span>{count}</span>;
}

// BETTER - Use suppressHydrationWarning for minor UI differences
function CartBadge() {
  const count = useCartStore((state) => state.getItemCount());

  return (
    <span suppressHydrationWarning>
      {count}
    </span>
  );
}
```

### Anti-pattern 2: Storing Too Much Data in Cart

```tsx
// BAD - Storing full product data
const addItem = (product: FullProduct) => {
  // Storing entire product including reviews, related products, etc.
  state.items.push({ ...product, quantity: 1 });
};

// GOOD - Store only essential data
const addItem = (product: FullProduct, quantity = 1) => {
  state.items.push({
    id: product.id,
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    quantity,
    maxQuantity: product.inventory,
  });
};
```

### Anti-pattern 3: Not Validating Cart on Checkout

```tsx
// BAD - Trusting cart data without validation
async function createOrder() {
  const { items } = useCartStore.getState();
  // Directly using client-side prices - security risk!
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await processPayment(total);
}

// GOOD - Validate cart server-side before checkout
async function createOrder() {
  const { items } = useCartStore.getState();

  // Send only IDs and quantities to server
  const response = await fetch('/api/checkout/validate', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map(({ productId, quantity, variant }) => ({
        productId,
        quantity,
        variantId: variant?.id,
      })),
    }),
  });

  const { validatedItems, total, errors } = await response.json();

  if (errors.length > 0) {
    // Handle inventory changes, price changes, etc.
    throw new Error('Cart validation failed');
  }

  await processPayment(total);
}
```

## Testing

### Unit Tests for Cart Store

```typescript
// __tests__/stores/cart-store.test.ts
import { useCartStore } from '@/stores/cart-store';
import { act } from '@testing-library/react';

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({ items: [], isOpen: false, lastUpdated: null });
  });

  describe('addItem', () => {
    it('adds new item to cart', () => {
      const { addItem, items } = useCartStore.getState();

      act(() => {
        addItem({
          id: 'product-1',
          productId: 'product-1',
          name: 'Test Product',
          price: 29.99,
          image: '/test.jpg',
        });
      });

      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });

    it('increases quantity for existing item', () => {
      const { addItem } = useCartStore.getState();

      act(() => {
        addItem({ id: 'product-1', productId: 'product-1', name: 'Test', price: 10, image: '/test.jpg' });
        addItem({ id: 'product-1', productId: 'product-1', name: 'Test', price: 10, image: '/test.jpg' });
      });

      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it('respects maxQuantity limit', () => {
      const { addItem } = useCartStore.getState();

      act(() => {
        addItem({ id: 'product-1', productId: 'product-1', name: 'Test', price: 10, image: '/test.jpg', maxQuantity: 3 }, 5);
      });

      expect(useCartStore.getState().items[0].quantity).toBe(3);
    });
  });

  describe('computed values', () => {
    it('calculates correct subtotal', () => {
      const { addItem, getSubtotal } = useCartStore.getState();

      act(() => {
        addItem({ id: 'p1', productId: 'p1', name: 'Product 1', price: 10, image: '/p1.jpg' }, 2);
        addItem({ id: 'p2', productId: 'p2', name: 'Product 2', price: 15, image: '/p2.jpg' }, 1);
      });

      expect(useCartStore.getState().getSubtotal()).toBe(35);
    });

    it('calculates correct item count', () => {
      const { addItem, getItemCount } = useCartStore.getState();

      act(() => {
        addItem({ id: 'p1', productId: 'p1', name: 'Product 1', price: 10, image: '/p1.jpg' }, 2);
        addItem({ id: 'p2', productId: 'p2', name: 'Product 2', price: 15, image: '/p2.jpg' }, 3);
      });

      expect(useCartStore.getState().getItemCount()).toBe(5);
    });
  });
});
```

### Component Integration Tests

```tsx
// __tests__/components/add-to-cart-button.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { useCartStore } from '@/stores/cart-store';

describe('AddToCartButton', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  const mockProduct = {
    id: 'test-product',
    productId: 'test-product',
    name: 'Test Product',
    price: 29.99,
    image: '/test.jpg',
  };

  it('adds item to cart on click', async () => {
    render(<AddToCartButton product={mockProduct} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  it('shows success state after adding', async () => {
    render(<AddToCartButton product={mockProduct} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Added!')).toBeInTheDocument();
    });
  });

  it('is disabled when product is out of stock', () => {
    render(<AddToCartButton product={{ ...mockProduct, maxQuantity: 0 }} disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Related Skills

- [Zustand](../patterns/zustand.md) - State management library
- [Local Storage](../patterns/local-storage.md) - Browser persistence
- [Stripe Payments](../patterns/stripe-payments.md) - Checkout integration
- [Inventory Management](../patterns/inventory-management.md) - Stock tracking
- [Server Actions](../patterns/server-actions.md) - Cart validation

---

## Changelog

### 1.1.0 (2026-01-18)
- Added comprehensive Overview section
- Added When NOT to Use section
- Added detailed Composition Diagram
- Added server synchronization with merge strategies
- Added 3 real-world examples including auth integration
- Added 3 anti-patterns with hydration handling
- Added unit and integration tests
- Added computed values for savings calculation
- Expanded Related Skills section

### 1.0.0 (2025-01-18)
- Initial implementation
- Zustand store with persist middleware
- Cart drawer component
- Add to cart button component
