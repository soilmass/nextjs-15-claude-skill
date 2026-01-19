---
id: pt-redux-toolkit
name: Redux Toolkit
version: 2.0.0
layer: L5
category: state
description: Implement Redux Toolkit for complex client-side state management
tags: [state, redux, toolkit]
composes: []
dependencies:
  @reduxjs/toolkit: "^2.4.0"
  react-redux: "^9.2.0"
formula: Redux Slices + RTK Query + Persist + Hydration = Enterprise State Management
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Redux Toolkit Pattern

## When to Use

- **Large-scale applications**: Many features with complex state interactions
- **Team familiarity with Redux**: Existing Redux knowledge on the team
- **DevTools debugging**: Need time-travel debugging, action replay
- **RTK Query integration**: Combining client state with data fetching
- **Strict state immutability**: Immer-powered updates with type safety

**Avoid when**: App is small/medium size, team prefers simpler solutions, or most state is server data (use React Query instead).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Redux Toolkit Architecture                                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ configureStore                                        │  │
│  │  ├─ api.reducer (RTK Query)                          │  │
│  │  ├─ authSlice ──────┬── login/logout thunks          │  │
│  │  ├─ cartSlice ──────┼── addItem/removeItem actions   │  │
│  │  └─ uiSlice ────────┴── theme/sidebar state          │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │ persistReducer (redux-persist)                        │  │
│  │  whitelist: [auth, cart] ─── localStorage             │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │ StoreProvider + PersistGate                           │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ ProductList│     │ CartSummary  │     │ AuthGuard   │   │
│  │ RTK Query  │     │ selectCart   │     │ selectUser  │   │
│  │ [Skeleton] │     │ [CartItem]   │     │             │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
│                                                             │
│  Server Hydration: HydrateStore component                   │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Redux Toolkit provides a standardized way to manage complex client-side state in Next.js 15. This pattern covers store setup, slices, async thunks, RTK Query integration, and server-side state hydration.

## Implementation

### Store Configuration

```typescript
// lib/store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { api } from './api';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'cart'], // Only persist these slices
  blacklist: [api.reducerPath], // Don't persist API cache
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: persistedReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(api.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
```

### Type-Safe Hooks

```typescript
// lib/store/hooks.ts
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, RootState, AppStore } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```

### Auth Slice

```typescript
// lib/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Login failed');
      }

      return response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    
    if (!state.auth.token) {
      return rejectWithValue('No token');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.auth.token}`,
      },
    });

    if (!response.ok) {
      return rejectWithValue('Token refresh failed');
    }

    return response.json();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    hydrateAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      // Refresh
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { setUser, clearError, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
```

### Cart Slice with Complex Logic

```typescript
// lib/store/slices/cartSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

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

const initialState: CartState = {
  items: [],
  couponCode: null,
  discountPercent: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'id'>>) => {
      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.variant === action.payload.variant
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          ...action.payload,
          id: crypto.randomUUID(),
        });
      }
    },
    
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        }
      }
    },
    
    applyCoupon: (
      state,
      action: PayloadAction<{ code: string; discount: number }>
    ) => {
      state.couponCode = action.payload.code;
      state.discountPercent = action.payload.discount;
    },
    
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discountPercent = 0;
    },
    
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountPercent = 0;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// Memoized Selectors
const selectCartItems = (state: { cart: CartState }) => state.cart.items;
const selectDiscount = (state: { cart: CartState }) => state.cart.discountPercent;

export const selectCartTotal = createSelector(
  [selectCartItems, selectDiscount],
  (items, discount) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = subtotal * (discount / 100);
    return {
      subtotal,
      discount: discountAmount,
      total: subtotal - discountAmount,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
);

export const selectCartItemById = (id: string) =>
  createSelector([selectCartItems], (items) =>
    items.find((item) => item.id === id)
  );
```

### RTK Query API

```typescript
// lib/store/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'User', 'Order'],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query<
      PaginatedResponse<Product>,
      { page?: number; search?: string; category?: string }
    >({
      query: ({ page = 1, search, category }) => ({
        url: 'products',
        params: { page, search, category },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    
    getProduct: builder.query<Product, string>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    
    createProduct: builder.mutation<Product, Omit<Product, 'id'>>({
      query: (body) => ({
        url: 'products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    
    updateProduct: builder.mutation<Product, Partial<Product> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
      // Optimistic update
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getProduct', id, (draft) => {
            Object.assign(draft, patch);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = api;
```

### Provider Setup

```tsx
// components/providers/store-provider.tsx
'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { makeStore, AppStore } from '@/lib/store';

export function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  const persistorRef = useRef<ReturnType<typeof persistStore>>();
  
  if (!storeRef.current) {
    storeRef.current = makeStore();
    persistorRef.current = persistStore(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current!}>
        {children}
      </PersistGate>
    </Provider>
  );
}
```

### Component Usage

```tsx
// components/product-list.tsx
'use client';

import { useGetProductsQuery } from '@/lib/store/api';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addItem, selectCartTotal } from '@/lib/store/slices/cartSlice';

interface ProductListProps {
  initialPage?: number;
  category?: string;
}

export function ProductList({ initialPage = 1, category }: ProductListProps) {
  const [page, setPage] = useState(initialPage);
  const dispatch = useAppDispatch();
  const { itemCount } = useAppSelector(selectCartTotal);
  
  const { data, isLoading, isFetching, error } = useGetProductsQuery({
    page,
    category,
  });

  const handleAddToCart = (product: Product) => {
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      })
    );
  };

  if (isLoading) {
    return <ProductListSkeleton />;
  }

  if (error) {
    return <div>Error loading products</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Products</h2>
        <span>Cart: {itemCount} items</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {data?.items.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button
              onClick={() => handleAddToCart(product)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      
      {isFetching && <div>Updating...</div>}
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.items.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Server-Side Hydration

```tsx
// app/products/page.tsx
import { makeStore } from '@/lib/store';
import { api } from '@/lib/store/api';
import { ProductList } from '@/components/product-list';
import { HydrateStore } from '@/components/hydrate-store';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const category = params.category;
  
  // Pre-fetch data on server
  const store = makeStore();
  await store.dispatch(api.endpoints.getProducts.initiate({ page, category }));
  
  // Get the preloaded state
  const preloadedState = store.getState();
  
  return (
    <HydrateStore preloadedState={preloadedState}>
      <ProductList initialPage={page} category={category} />
    </HydrateStore>
  );
}

// components/hydrate-store.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store/hooks';

export function HydrateStore({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState: any;
}) {
  const store = useAppStore();
  const hydrated = useRef(false);
  
  useEffect(() => {
    if (!hydrated.current) {
      // Hydrate RTK Query cache
      store.dispatch({ type: 'persist/REHYDRATE', payload: preloadedState });
      hydrated.current = true;
    }
  }, [store, preloadedState]);
  
  return <>{children}</>;
}
```

## Variants

### Redux with Immer Patterns

```typescript
// Complex state updates with Immer
const todoSlice = createSlice({
  name: 'todos',
  initialState: { items: [], filter: 'all' },
  reducers: {
    // Immer allows "mutating" syntax
    addTodo: (state, action) => {
      state.items.push({ id: Date.now(), text: action.payload, done: false });
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find(t => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
    // Return new state for complex replacements
    reorderTodos: (state, action) => {
      return { ...state, items: action.payload };
    },
  },
});
```

## Anti-Patterns

```typescript
// Bad: Putting everything in Redux
const store = {
  user: {...},
  todos: {...},
  formInput: '', // Don't store form input in Redux
  mousePosition: {x: 0, y: 0}, // Don't store frequently changing values
};

// Good: Use Redux for shared/persistent state only
// Use local state for component-specific data

// Bad: Mutating state directly
state.items.push(newItem); // Works in RTK due to Immer
items.push(newItem); // Breaks without Immer!

// Good: Always use reducers for state updates
dispatch(addItem(newItem));
```

## Related Skills

- `zustand` - Simpler alternative for smaller apps
- `react-query` - Server state management
- `context` - React Context for simpler cases
- `local-storage` - State persistence

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial Redux Toolkit pattern with RTK Query
