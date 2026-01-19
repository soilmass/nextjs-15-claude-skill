---
id: pt-recoil
name: Recoil
version: 2.0.0
layer: L5
category: state
description: Implement Recoil for atomic state management in Next.js 15
tags: [state, recoil]
composes: []
dependencies:
  recoil: "^0.7.7"
formula: Recoil Atoms + Selectors + atomFamily + Effects = Atomic State with Async
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Recoil Pattern

## When to Use

- **Complex derived state graphs**: Multiple selectors depending on each other
- **Async state with Suspense**: Built-in async selector support
- **Facebook-scale apps**: Designed for large React applications
- **atomFamily for dynamic state**: State indexed by IDs
- **State synchronization**: URL sync, localStorage sync via effects

**Avoid when**: Simpler solutions suffice (Zustand/Jotai), you need smaller bundle size, or the project is new (consider Jotai instead).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Recoil State Graph                                          │
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │ cartItemIdsAtom │◄───────►│ cartItemAtom    │           │
│  │ string[]        │         │ atomFamily(id)  │           │
│  └────────┬────────┘         └────────┬────────┘           │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       ▼                                     │
│           ┌───────────────────────┐                        │
│           │ cartItemsSelector     │                        │
│           │ combines all items    │                        │
│           └───────────┬───────────┘                        │
│                       │                                     │
│           ┌───────────┴───────────┐                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │ cartTotalsSelector│   │ CartSummary     │               │
│  │ subtotal, tax    │   │ [skeleton]      │               │
│  └─────────────────┘    └─────────────────┘               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Async Selectors with Suspense                         │  │
│  │  productsSelector ──► ProductGrid ──► [Skeleton]      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Effects: persistAtom, syncToServerEffect, urlSyncEffect    │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Recoil provides atomic state management with fine-grained subscriptions, derived state, and async queries. This pattern covers setting up Recoil in Next.js 15 with atoms, selectors, async selectors, and state persistence.

## Implementation

### Provider Setup

```tsx
// components/providers/recoil-provider.tsx
'use client';

import { RecoilRoot, MutableSnapshot } from 'recoil';
import { ReactNode } from 'react';

interface RecoilProviderProps {
  children: ReactNode;
  initializeState?: (mutableSnapshot: MutableSnapshot) => void;
}

export function RecoilProvider({ children, initializeState }: RecoilProviderProps) {
  return (
    <RecoilRoot initializeState={initializeState}>
      {children}
    </RecoilRoot>
  );
}

// For server-side initialization
export function createInitializer(initialState: Record<string, any>) {
  return ({ set }: MutableSnapshot) => {
    Object.entries(initialState).forEach(([key, value]) => {
      // You'd need to import the actual atoms here
      // This is a simplified example
    });
  };
}
```

### Basic Atoms

```typescript
// lib/recoil/atoms/user.ts
import { atom, selector } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist({
  key: 'recoil-persist',
  storage: typeof window !== 'undefined' ? localStorage : undefined,
});

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

export const userAtom = atom<User | null>({
  key: 'user',
  default: null,
  effects: [persistAtom],
});

export const userPreferencesAtom = atom<User['preferences']>({
  key: 'userPreferences',
  default: {
    theme: 'system',
    notifications: true,
  },
  effects: [persistAtom],
});

// Derived selectors
export const isAuthenticatedSelector = selector<boolean>({
  key: 'isAuthenticated',
  get: ({ get }) => get(userAtom) !== null,
});

export const userDisplayNameSelector = selector<string>({
  key: 'userDisplayName',
  get: ({ get }) => {
    const user = get(userAtom);
    return user?.name || 'Guest';
  },
});
```

### Shopping Cart Atoms

```typescript
// lib/recoil/atoms/cart.ts
import { atom, selector, atomFamily, selectorFamily } from 'recoil';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

// List of cart item IDs
export const cartItemIdsAtom = atom<string[]>({
  key: 'cartItemIds',
  default: [],
});

// Individual cart items using atomFamily
export const cartItemAtom = atomFamily<CartItem | null, string>({
  key: 'cartItem',
  default: null,
});

// Selector to get all cart items
export const cartItemsSelector = selector<CartItem[]>({
  key: 'cartItems',
  get: ({ get }) => {
    const ids = get(cartItemIdsAtom);
    return ids
      .map((id) => get(cartItemAtom(id)))
      .filter((item): item is CartItem => item !== null);
  },
});

// Cart totals
export const cartTotalsSelector = selector({
  key: 'cartTotals',
  get: ({ get }) => {
    const items = get(cartItemsSelector);
    
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total, itemCount };
  },
});

// Individual item total
export const cartItemTotalSelector = selectorFamily<number, string>({
  key: 'cartItemTotal',
  get: (itemId) => ({ get }) => {
    const item = get(cartItemAtom(itemId));
    return item ? item.price * item.quantity : 0;
  },
});
```

### Async Selectors

```typescript
// lib/recoil/selectors/products.ts
import { atom, selector, selectorFamily } from 'recoil';

// Search/filter state
export const productSearchAtom = atom({
  key: 'productSearch',
  default: '',
});

export const productCategoryAtom = atom<string | null>({
  key: 'productCategory',
  default: null,
});

export const productPageAtom = atom({
  key: 'productPage',
  default: 1,
});

// Async selector for products
export const productsSelector = selector({
  key: 'products',
  get: async ({ get }) => {
    const search = get(productSearchAtom);
    const category = get(productCategoryAtom);
    const page = get(productPageAtom);
    
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    
    const response = await fetch(`/api/products?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return response.json();
  },
});

// Single product selector with caching
export const productSelector = selectorFamily({
  key: 'product',
  get: (productId: string) => async () => {
    const response = await fetch(`/api/products/${productId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product ${productId}`);
    }
    
    return response.json();
  },
});

// Product availability check
export const productAvailabilitySelector = selectorFamily({
  key: 'productAvailability',
  get: (productId: string) => async ({ get }) => {
    // This will automatically refresh when the product changes
    const product = get(productSelector(productId));
    
    const response = await fetch(`/api/inventory/${productId}`);
    const inventory = await response.json();
    
    return {
      inStock: inventory.quantity > 0,
      quantity: inventory.quantity,
      estimatedRestock: inventory.estimatedRestock,
    };
  },
});
```

### Custom Hooks

```typescript
// lib/recoil/hooks/useCart.ts
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useCallback } from 'react';
import {
  cartItemIdsAtom,
  cartItemAtom,
  cartItemsSelector,
  cartTotalsSelector,
  type CartItem,
} from '../atoms/cart';

export function useCart() {
  const items = useRecoilValue(cartItemsSelector);
  const totals = useRecoilValue(cartTotalsSelector);
  const [itemIds, setItemIds] = useRecoilState(cartItemIdsAtom);
  
  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      const itemId = `${item.productId}-${item.variant || 'default'}`;
      
      // This is tricky with Recoil - we need to update both the atom and the IDs
      // In practice, you might want to use a transaction or a custom effect
      setItemIds((ids) => {
        if (!ids.includes(itemId)) {
          return [...ids, itemId];
        }
        return ids;
      });
      
      // Note: This requires using useSetRecoilState for the atomFamily
      // which is complex. Consider using a callback ref pattern
    },
    [setItemIds]
  );
  
  const removeItem = useCallback(
    (itemId: string) => {
      setItemIds((ids) => ids.filter((id) => id !== itemId));
    },
    [setItemIds]
  );
  
  const clearCart = useCallback(() => {
    setItemIds([]);
  }, [setItemIds]);
  
  return {
    items,
    totals,
    addItem,
    removeItem,
    clearCart,
  };
}

// Hook for individual cart item with updates
export function useCartItem(itemId: string) {
  const [item, setItem] = useRecoilState(cartItemAtom(itemId));
  
  const updateQuantity = useCallback(
    (quantity: number) => {
      setItem((current) => 
        current ? { ...current, quantity: Math.max(0, quantity) } : null
      );
    },
    [setItem]
  );
  
  return { item, updateQuantity };
}
```

### Components with Recoil

```tsx
// components/cart/cart-summary.tsx
'use client';

import { useRecoilValue } from 'recoil';
import { cartTotalsSelector, cartItemsSelector } from '@/lib/recoil/atoms/cart';

export function CartSummary() {
  const { subtotal, tax, total, itemCount } = useRecoilValue(cartTotalsSelector);
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-bold mb-4">Order Summary</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Items ({itemCount})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// components/cart/cart-item.tsx
'use client';

import { useCartItem } from '@/lib/recoil/hooks/useCart';

interface CartItemRowProps {
  itemId: string;
  onRemove: (id: string) => void;
}

export function CartItemRow({ itemId, onRemove }: CartItemRowProps) {
  const { item, updateQuantity } = useCartItem(itemId);
  
  if (!item) return null;
  
  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <div className="flex-1">
        <h4 className="font-medium">{item.name}</h4>
        {item.variant && (
          <p className="text-sm text-gray-500">{item.variant}</p>
        )}
        <p className="text-sm">${item.price.toFixed(2)}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.quantity - 1)}
          className="w-8 h-8 rounded border"
        >
          -
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.quantity + 1)}
          className="w-8 h-8 rounded border"
        >
          +
        </button>
      </div>
      
      <button
        onClick={() => onRemove(itemId)}
        className="text-red-500 hover:text-red-600"
      >
        Remove
      </button>
    </div>
  );
}
```

### Async Data with Suspense

```tsx
// components/products/product-list.tsx
'use client';

import { Suspense } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import {
  productsSelector,
  productSearchAtom,
  productPageAtom,
} from '@/lib/recoil/selectors/products';

function ProductGrid() {
  const products = useRecoilValue(productsSelector);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.items.map((product: any) => (
        <div key={product.id} className="border p-4 rounded">
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}

export function ProductList() {
  const [search, setSearch] = useRecoilState(productSearchAtom);
  const [page, setPage] = useRecoilState(productPageAtom);
  
  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="border p-2 rounded w-full"
        />
      </div>
      
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border p-4 rounded animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
```

### State Effects for Side Effects

```typescript
// lib/recoil/effects/syncToServer.ts
import { AtomEffect } from 'recoil';

export const syncToServerEffect = <T>(
  endpoint: string
): AtomEffect<T> => ({ onSet, setSelf, trigger }) => {
  // Load initial value from server
  if (trigger === 'get') {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setSelf(data))
      .catch(console.error);
  }
  
  // Sync changes to server
  onSet((newValue, _, isReset) => {
    if (isReset) {
      fetch(endpoint, { method: 'DELETE' });
    } else {
      fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newValue),
      });
    }
  });
};

// Usage
export const userSettingsAtom = atom({
  key: 'userSettings',
  default: { theme: 'light', language: 'en' },
  effects: [
    syncToServerEffect('/api/user/settings'),
  ],
});
```

### URL Sync Effect

```typescript
// lib/recoil/effects/urlSync.ts
import { AtomEffect } from 'recoil';

export const urlSyncEffect = <T extends string | number | boolean>(
  paramName: string
): AtomEffect<T> => ({ setSelf, onSet, trigger }) => {
  if (typeof window === 'undefined') return;
  
  // Initialize from URL
  if (trigger === 'get') {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    if (value !== null) {
      setSelf(value as T);
    }
  }
  
  // Sync to URL
  onSet((newValue) => {
    const url = new URL(window.location.href);
    if (newValue === '' || newValue === null) {
      url.searchParams.delete(paramName);
    } else {
      url.searchParams.set(paramName, String(newValue));
    }
    window.history.replaceState({}, '', url);
  });
};

// Usage
export const searchQueryAtom = atom({
  key: 'searchQuery',
  default: '',
  effects: [urlSyncEffect('q')],
});
```

## Variants

### Recoil with React Query

```typescript
// Combining Recoil atoms with React Query for server state
import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';

export function useProducts() {
  const search = useRecoilValue(productSearchAtom);
  const category = useRecoilValue(productCategoryAtom);
  
  return useQuery({
    queryKey: ['products', { search, category }],
    queryFn: () => fetchProducts({ search, category }),
  });
}
```

## Anti-Patterns

```typescript
// Bad: Large atoms with everything
const appStateAtom = atom({
  key: 'appState',
  default: {
    user: null,
    cart: [],
    products: [],
    ui: {},
  },
});

// Good: Atomic state
const userAtom = atom({ key: 'user', default: null });
const cartAtom = atom({ key: 'cart', default: [] });

// Bad: Modifying state outside Recoil
let globalState = null;
const badAtom = atom({
  key: 'bad',
  default: globalState, // External dependency!
});

// Good: Keep state in Recoil
const goodAtom = atom({
  key: 'good',
  default: null,
  effects: [loadFromStorageEffect],
});
```

## Related Skills

- `zustand` - Simpler alternative
- `jotai` - Similar atomic approach
- `context` - Built-in React state
- `local-storage` - State persistence

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial Recoil pattern with atoms and selectors
