---
id: pt-zustand
name: Zustand State Management
version: 2.0.0
layer: L5
category: state
description: Lightweight state management with Zustand for Next.js applications
tags: [state, zustand, global-state, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../organisms/sidebar.md
dependencies:
  zustand: "^5.0.0"
formula: Zustand Store + Persist Middleware + Selectors = Lightweight Global State
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Zustand State Management

## When to Use

- **Client-side global state**: Shopping cart, UI preferences, authentication status
- **State shared across many components**: Avoids prop drilling for widely-used data
- **State that needs persistence**: localStorage/sessionStorage sync with persist middleware
- **Simple apps needing Redux-like patterns**: Without Redux boilerplate
- **State with computed values**: Using selectors for derived state

**Avoid when**: Data comes from the server (use React Query/SWR), state is component-local, or you need state machine semantics.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Zustand Store Architecture                                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ useCartStore (with persist middleware)                │  │
│  │  ├─ state: { items[], isOpen, couponCode }           │  │
│  │  ├─ actions: { addItem, removeItem, toggleCart }     │  │
│  │  └─ computed: { totalItems, totalPrice }             │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ CartButton │     │ CartDrawer   │     │ ProductCard │   │
│  │ [Button]   │     │ [CartList]   │     │ [Button]    │   │
│  │ totalItems │     │ items[]      │     │ addItem()   │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ StoreProvider (for SSR hydration)                     │  │
│  │  └─ initialState from Server Component                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Zustand is a lightweight, flexible state management library perfect for Next.js applications. It offers a simple API, TypeScript support, and works seamlessly with Server Components without hydration issues.

## Basic Store Setup

```typescript
// stores/counter-store.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// components/counter.tsx
'use client';

import { useCounterStore } from '@/stores/counter-store';
import { Button } from '@/components/ui/button';

export function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="flex items-center gap-4">
      <Button onClick={decrement}>-</Button>
      <span className="text-2xl font-bold w-12 text-center">{count}</span>
      <Button onClick={increment}>+</Button>
      <Button variant="outline" onClick={reset}>Reset</Button>
    </div>
  );
}
```

## Store with Persist Middleware

```typescript
// stores/user-preferences-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  locale: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface UserPreferencesState extends UserPreferences {
  setTheme: (theme: UserPreferences['theme']) => void;
  toggleSidebar: () => void;
  setLocale: (locale: string) => void;
  updateNotifications: (notifications: Partial<UserPreferences['notifications']>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  locale: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setLocale: (locale) => set({ locale }),
      updateNotifications: (notifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notifications },
        })),
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        locale: state.locale,
        notifications: state.notifications,
      }),
    }
  )
);
```

## Next.js Provider Pattern

```typescript
// providers/store-provider.tsx
'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { type StoreApi, useStore } from 'zustand';
import { createAppStore, type AppStore } from '@/stores/app-store';

export const AppStoreContext = createContext<StoreApi<AppStore> | null>(null);

interface StoreProviderProps {
  children: ReactNode;
  initialState?: Partial<AppStore>;
}

export function StoreProvider({ children, initialState }: StoreProviderProps) {
  const storeRef = useRef<StoreApi<AppStore>>();
  
  if (!storeRef.current) {
    storeRef.current = createAppStore(initialState);
  }

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore<T>(selector: (state: AppStore) => T): T {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error('Missing StoreProvider');
  return useStore(store, selector);
}

// stores/app-store.ts
import { createStore } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

export interface AppStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const createAppStore = (initialState?: Partial<AppStore>) =>
  createStore<AppStore>((set) => ({
    user: null,
    isAuthenticated: false,
    ...initialState,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false }),
  }));

// app/layout.tsx
import { StoreProvider } from '@/providers/store-provider';
import { getSession } from '@/lib/auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <StoreProvider
          initialState={{
            user: session?.user ?? null,
            isAuthenticated: !!session,
          }}
        >
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

## Cart Store Example

```typescript
// stores/cart-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  // Computed values
  totalItems: number;
  totalPrice: number;
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],
      isOpen: false,
      
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      get totalPrice() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            state.items.push({ ...newItem, quantity: 1 });
          }
        }),

      removeItem: (id) =>
        set((state) => {
          state.items = state.items.filter((item) => item.id !== id);
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);
          if (item) {
            if (quantity <= 0) {
              state.items = state.items.filter((i) => i.id !== id);
            } else {
              item.quantity = quantity;
            }
          }
        }),

      clearCart: () =>
        set((state) => {
          state.items = [];
        }),

      toggleCart: () =>
        set((state) => {
          state.isOpen = !state.isOpen;
        }),
    })),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

// components/cart-button.tsx
'use client';

import { useCartStore } from '@/stores/cart-store';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  const { items, toggleCart } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
```

## Slices Pattern for Large Stores

```typescript
// stores/slices/user-slice.ts
import { type StateCreator } from 'zustand';

export interface UserSlice {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

export const createUserSlice: StateCreator<
  UserSlice & CartSlice, // Combined store type
  [],
  [],
  UserSlice
> = (set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/user');
      const user = await res.json();
      set({ user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
});

// stores/slices/cart-slice.ts
export interface CartSlice {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
}

export const createCartSlice: StateCreator<
  UserSlice & CartSlice,
  [],
  [],
  CartSlice
> = (set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
});

// stores/index.ts
import { create } from 'zustand';
import { createUserSlice, type UserSlice } from './slices/user-slice';
import { createCartSlice, type CartSlice } from './slices/cart-slice';

export const useStore = create<UserSlice & CartSlice>()((...a) => ({
  ...createUserSlice(...a),
  ...createCartSlice(...a),
}));
```

## Async Actions with Loading State

```typescript
// stores/products-store.ts
import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  // Actions
  fetchProducts: () => Promise<void>;
  selectProduct: (id: string) => void;
  createProduct: (data: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  selectedProduct: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const products = await res.json();
      set({ products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  selectProduct: (id) => {
    const product = get().products.find((p) => p.id === id) || null;
    set({ selectedProduct: product });
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      const newProduct = await res.json();
      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        selectedProduct:
          state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },
}));
```

## Selective Subscription

```typescript
// components/sidebar.tsx
'use client';

import { useUserPreferencesStore } from '@/stores/user-preferences-store';
import { shallow } from 'zustand/shallow';

export function Sidebar() {
  // Only re-render when these specific values change
  const { sidebarCollapsed, toggleSidebar } = useUserPreferencesStore(
    (state) => ({
      sidebarCollapsed: state.sidebarCollapsed,
      toggleSidebar: state.toggleSidebar,
    }),
    shallow
  );

  return (
    <aside className={sidebarCollapsed ? 'w-16' : 'w-64'}>
      <button onClick={toggleSidebar}>
        {sidebarCollapsed ? 'Expand' : 'Collapse'}
      </button>
    </aside>
  );
}
```

## Anti-patterns

### Don't Use Zustand for Server State

```typescript
// BAD - Using Zustand for server data
const usePostsStore = create((set) => ({
  posts: [],
  fetchPosts: async () => {
    const posts = await fetch('/api/posts').then(r => r.json());
    set({ posts });
  },
}));

// GOOD - Use React Query for server state, Zustand for client state
import { useQuery } from '@tanstack/react-query';

function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
  });
}
```

### Don't Store Everything in One Store

```typescript
// BAD - Monolithic store
const useStore = create((set) => ({
  user: null,
  cart: [],
  preferences: {},
  ui: {},
  // ... everything in one place
}));

// GOOD - Split into focused stores
const useUserStore = create(/* ... */);
const useCartStore = create(/* ... */);
const usePreferencesStore = create(/* ... */);
```

## Related Skills

- [context](./context.md)
- [jotai](./jotai.md)
- [local-storage](./local-storage.md)
- [url-state](./url-state.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Basic store setup
- Persist middleware
- Next.js provider pattern
- Cart store example
- Slices pattern
- Async actions
