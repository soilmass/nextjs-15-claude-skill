---
id: pt-valtio
name: Valtio
version: 2.0.0
layer: L5
category: state
description: Implement Valtio for proxy-based state management in Next.js 15
tags: [state, valtio]
composes:
  - ../atoms/input-button.md
dependencies:
  valtio: "^2.1.0"
formula: Valtio Proxy + derive() + Subscriptions = Mutable Reactive State
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Valtio Pattern

## When to Use

- **Familiar mutable API**: Write state updates like normal JavaScript
- **Auto-tracking subscriptions**: Components only re-render when used state changes
- **Derived state**: derive() utility for computed values
- **Class-based stores**: Use getters for computed properties
- **Quick prototyping**: Minimal boilerplate to get started

**Avoid when**: You need immutable state guarantees, debugging requires action logging, or team prefers explicit state updates.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Valtio Proxy Architecture                                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ cartStore = proxy({...})                              │  │
│  │  ├─ items: CartItem[]                                 │  │
│  │  ├─ couponCode: string | null                         │  │
│  │  └─ discountPercent: number                           │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                                                   │
│         │ Direct mutations: cartStore.items.push(item)      │
│         │                                                   │
│  ┌──────┴────────────────────────────────────────────────┐  │
│  │ cartDerived = derive({...})                           │  │
│  │  ├─ subtotal: computed from items                     │  │
│  │  ├─ itemCount: sum of quantities                      │  │
│  │  └─ total: subtotal - discount                        │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ CartBadge  │     │ CartList     │     │ ProductCard │   │
│  │ useSnapshot│     │ useSnapshot  │     │ cartActions │   │
│  │ itemCount  │     │ items[]      │     │ .addItem()  │   │
│  └────────────┘     │ [Button]     │     │ [Button]    │   │
│                     └──────────────┘     └─────────────┘   │
│                                                             │
│  Subscriptions: subscribe(store, callback)                  │
│  Selective: subscribeKey(store, 'user', callback)           │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Valtio is a proxy-based state management library that allows direct mutation of state while automatically tracking changes. This pattern covers using Valtio in Next.js 15 with Server Components, derived state, and subscriptions.

## Implementation

### Basic Store Setup

```typescript
// lib/stores/user-store.ts
import { proxy, useSnapshot, subscribe } from 'valtio';
import { devtools } from 'valtio/utils';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Create the store
export const userStore = proxy<UserState>({
  user: null,
  isLoading: false,
  error: null,
});

// Enable devtools in development
if (process.env.NODE_ENV === 'development') {
  devtools(userStore, { name: 'userStore' });
}

// Actions - just mutate the proxy directly!
export const userActions = {
  setUser(user: User | null) {
    userStore.user = user;
    userStore.error = null;
  },
  
  async fetchUser(userId: string) {
    userStore.isLoading = true;
    userStore.error = null;
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      
      const user = await response.json();
      userStore.user = user;
    } catch (error) {
      userStore.error = error instanceof Error ? error.message : 'Unknown error';
      userStore.user = null;
    } finally {
      userStore.isLoading = false;
    }
  },
  
  updateProfile(updates: Partial<User>) {
    if (userStore.user) {
      // Direct mutation - Valtio tracks this automatically
      Object.assign(userStore.user, updates);
    }
  },
  
  logout() {
    userStore.user = null;
    userStore.error = null;
  },
};
```

### Cart Store with Complex State

```typescript
// lib/stores/cart-store.ts
import { proxy, useSnapshot } from 'valtio';
import { derive } from 'valtio/utils';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
}

export const cartStore = proxy<CartState>({
  items: [],
  couponCode: null,
  discountPercent: 0,
});

// Derived state using derive utility
export const cartDerived = derive({
  subtotal: (get) => {
    const items = get(cartStore).items;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  
  itemCount: (get) => {
    const items = get(cartStore).items;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  discount: (get) => {
    const subtotal = get(cartStore).items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const percent = get(cartStore).discountPercent;
    return subtotal * (percent / 100);
  },
  
  total: (get) => {
    const items = get(cartStore).items;
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const percent = get(cartStore).discountPercent;
    return subtotal * (1 - percent / 100);
  },
});

// Cart actions
export const cartActions = {
  addItem(item: Omit<CartItem, 'id'>) {
    const existingItem = cartStore.items.find(
      (i) => i.productId === item.productId && i.variant === item.variant
    );
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cartStore.items.push({
        ...item,
        id: crypto.randomUUID(),
      });
    }
  },
  
  removeItem(itemId: string) {
    const index = cartStore.items.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      cartStore.items.splice(index, 1);
    }
  },
  
  updateQuantity(itemId: string, quantity: number) {
    const item = cartStore.items.find((i) => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
      }
    }
  },
  
  applyCoupon(code: string, discount: number) {
    cartStore.couponCode = code;
    cartStore.discountPercent = discount;
  },
  
  removeCoupon() {
    cartStore.couponCode = null;
    cartStore.discountPercent = 0;
  },
  
  clear() {
    cartStore.items = [];
    cartStore.couponCode = null;
    cartStore.discountPercent = 0;
  },
};
```

### Using with Components

```tsx
// components/cart/cart-badge.tsx
'use client';

import { useSnapshot } from 'valtio';
import { cartDerived } from '@/lib/stores/cart-store';

export function CartBadge() {
  // useSnapshot creates a reactive snapshot
  const { itemCount } = useSnapshot(cartDerived);
  
  if (itemCount === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {itemCount > 99 ? '99+' : itemCount}
    </span>
  );
}

// components/cart/cart-list.tsx
'use client';

import { useSnapshot } from 'valtio';
import { cartStore, cartActions, cartDerived } from '@/lib/stores/cart-store';

export function CartList() {
  const cart = useSnapshot(cartStore);
  const derived = useSnapshot(cartDerived);
  
  if (cart.items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Your cart is empty
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {cart.items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-4 border rounded">
          <div className="flex-1">
            <h4 className="font-medium">{item.name}</h4>
            {item.variant && (
              <p className="text-sm text-gray-500">{item.variant}</p>
            )}
            <p className="text-sm">${item.price.toFixed(2)}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => cartActions.updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 rounded border hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => cartActions.updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded border hover:bg-gray-100"
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => cartActions.removeItem(item.id)}
            className="text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${derived.subtotal.toFixed(2)}</span>
        </div>
        {derived.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({cart.discountPercent}%)</span>
            <span>-${derived.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${derived.total.toFixed(2)}</span>
        </div>
      </div>
      
      <button
        onClick={() => cartActions.clear()}
        className="w-full py-2 text-red-500 hover:bg-red-50 rounded"
      >
        Clear Cart
      </button>
    </div>
  );
}
```

### Persistence with proxyWithPersist

```typescript
// lib/stores/persisted-store.ts
import { proxy, subscribe } from 'valtio';

// Custom persist utility
function proxyWithPersist<T extends object>(
  initialState: T,
  options: {
    key: string;
    storage?: Storage;
  }
): T {
  const { key, storage = typeof window !== 'undefined' ? localStorage : undefined } = options;
  
  // Load initial state from storage
  let persistedState = initialState;
  
  if (storage) {
    try {
      const saved = storage.getItem(key);
      if (saved) {
        persistedState = { ...initialState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load persisted state:', e);
    }
  }
  
  const state = proxy<T>(persistedState);
  
  // Subscribe to changes and persist
  if (storage) {
    subscribe(state, () => {
      try {
        storage.setItem(key, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to persist state:', e);
      }
    });
  }
  
  return state;
}

// Usage
interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
}

export const settingsStore = proxyWithPersist<SettingsState>(
  {
    theme: 'system',
    language: 'en',
    notifications: true,
  },
  { key: 'app-settings' }
);

export const settingsActions = {
  setTheme(theme: SettingsState['theme']) {
    settingsStore.theme = theme;
  },
  
  setLanguage(language: string) {
    settingsStore.language = language;
  },
  
  toggleNotifications() {
    settingsStore.notifications = !settingsStore.notifications;
  },
};
```

### Computed Properties with getters

```typescript
// lib/stores/todo-store.ts
import { proxy } from 'valtio';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

// Using a class for computed properties
class TodoStore {
  todos: Todo[] = [];
  filter: 'all' | 'active' | 'completed' = 'all';
  
  // Computed property using getter
  get filteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter((t) => !t.completed);
      case 'completed':
        return this.todos.filter((t) => t.completed);
      default:
        return this.todos;
    }
  }
  
  get stats() {
    const total = this.todos.length;
    const completed = this.todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }
  
  // Actions as methods
  addTodo(text: string) {
    this.todos.push({
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date(),
    });
  }
  
  toggleTodo(id: string) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }
  
  removeTodo(id: string) {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
    }
  }
  
  setFilter(filter: TodoState['filter']) {
    this.filter = filter;
  }
  
  clearCompleted() {
    this.todos = this.todos.filter((t) => !t.completed);
  }
}

export const todoStore = proxy(new TodoStore());
```

### Subscriptions for Side Effects

```typescript
// lib/stores/subscriptions.ts
import { subscribe, snapshot } from 'valtio';
import { cartStore } from './cart-store';
import { userStore } from './user-store';

// Subscribe to cart changes for analytics
export function initCartSubscriptions() {
  return subscribe(cartStore, () => {
    const snap = snapshot(cartStore);
    
    // Track cart changes
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cart_updated', {
        item_count: snap.items.length,
        total_quantity: snap.items.reduce((sum, i) => sum + i.quantity, 0),
      });
    }
  });
}

// Subscribe to specific properties
import { subscribeKey } from 'valtio/utils';

export function initUserSubscriptions() {
  // Only fires when user changes
  return subscribeKey(userStore, 'user', (user) => {
    if (user) {
      console.log('User logged in:', user.email);
      // Fetch user-specific data, etc.
    } else {
      console.log('User logged out');
      // Clear user-specific data
    }
  });
}

// Initialize in provider
// components/providers/valtio-provider.tsx
'use client';

import { useEffect } from 'react';
import { initCartSubscriptions, initUserSubscriptions } from '@/lib/stores/subscriptions';

export function ValtioProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubCart = initCartSubscriptions();
    const unsubUser = initUserSubscriptions();
    
    return () => {
      unsubCart();
      unsubUser();
    };
  }, []);
  
  return <>{children}</>;
}
```

### Async Actions with Loading State

```typescript
// lib/stores/products-store.ts
import { proxy, ref } from 'valtio';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  // Use ref() for values that shouldn't be tracked
  abortController: AbortController | null;
}

export const productsStore = proxy<ProductsState>({
  products: [],
  isLoading: false,
  error: null,
  abortController: null,
});

export const productsActions = {
  async fetchProducts(search?: string) {
    // Cancel previous request
    if (productsStore.abortController) {
      productsStore.abortController.abort();
    }
    
    // Create new abort controller - use ref() to prevent tracking
    const controller = new AbortController();
    productsStore.abortController = ref(controller);
    
    productsStore.isLoading = true;
    productsStore.error = null;
    
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/products${params}`, {
        signal: controller.signal,
      });
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      productsStore.products = data.items;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Ignore abort errors
      }
      productsStore.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      productsStore.isLoading = false;
      productsStore.abortController = null;
    }
  },
  
  cancelFetch() {
    if (productsStore.abortController) {
      productsStore.abortController.abort();
      productsStore.abortController = null;
      productsStore.isLoading = false;
    }
  },
};
```

## Variants

### Valtio with Immer

```typescript
// For complex nested updates
import { produce } from 'immer';
import { proxy } from 'valtio';

const store = proxy({
  deeply: { nested: { value: 0 } },
});

// Valtio already uses Proxy, but for very complex updates:
function complexUpdate() {
  const newState = produce(store, (draft) => {
    draft.deeply.nested.value += 1;
  });
  Object.assign(store, newState);
}
```

## Anti-Patterns

```typescript
// Bad: Creating new proxies in components
function BadComponent() {
  // This creates a new store every render!
  const store = proxy({ count: 0 });
  return <div>{store.count}</div>;
}

// Good: Create store outside component
const store = proxy({ count: 0 });
function GoodComponent() {
  const snap = useSnapshot(store);
  return <div>{snap.count}</div>;
}

// Bad: Mutating snapshot
function BadMutation() {
  const snap = useSnapshot(store);
  snap.count++; // Error! Snapshot is read-only
}

// Good: Mutate the store directly
function GoodMutation() {
  store.count++; // Mutate the proxy, not the snapshot
}

// Bad: Using snapshot values in callbacks
function BadCallback() {
  const snap = useSnapshot(store);
  return <button onClick={() => console.log(snap.count)}>Log</button>;
  // snap.count might be stale in the callback
}

// Good: Access store directly in callbacks
function GoodCallback() {
  const snap = useSnapshot(store);
  return <button onClick={() => console.log(store.count)}>Log</button>;
}
```

## Related Skills

- `zustand` - Alternative simple state library
- `jotai` - Atomic state from same author
- `context` - Built-in React state
- `local-storage` - State persistence

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial Valtio pattern with proxy state
