---
id: pt-context
name: React Context
version: 2.0.0
layer: L5
category: state
description: Share state across components using React Context with Next.js patterns
tags: [state, context, react, providers, next15, react19]
composes: []  # Pattern provides architectural guidance; UI components listed in diagram are examples
dependencies: []
formula: React Context + Provider Pattern + Custom Hooks = Scoped State Sharing
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# React Context

## When to Use

- **Theme/appearance settings**: Light/dark mode, color schemes across the app
- **User authentication state**: Sharing current user info without prop drilling
- **Localization**: i18n context for translations throughout the component tree
- **Feature flags**: App-wide feature toggles
- **Compound components**: Headless UI patterns (Tabs, Accordions, Modals)

**Avoid when**: State changes frequently (causes re-renders), state is only needed in a few nearby components, or you need fine-grained subscriptions.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ RootLayout (Server Component)                               │
│  └─ AppProviders (Client)                                   │
│      ├─ QueryClientProvider ─────────────────────┐          │
│      │   └─ UserProvider ◄── getSession()        │          │
│      │       └─ ThemeProvider                    │          │
│      │           └─ TooltipProvider              │          │
│      │               ├─ {children}               │          │
│      │               └─ Toaster                  │          │
│      └───────────────────────────────────────────┘          │
│                                                             │
│  Components using context:                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ ThemeToggle │  │ UserAvatar  │  │ DeleteDialog        │  │
│  │ useTheme()  │  │ useUser()   │  │ ModalProvider scope │  │
│  │ [Button x3] │  │             │  │ [AlertDialog]       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Overview

React Context provides a way to share state across components without prop drilling. In Next.js 15, Context must be used carefully with Server and Client Components. Context providers must be Client Components, but the context value can come from Server Components.

## Basic Context Setup

```typescript
// contexts/theme-context.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Update localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update document class
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  }, []);

  const resolvedTheme = theme === 'system'
    ? (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')
    : theme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Usage
// components/theme-toggle.tsx
'use client';

import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-1">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('light')}
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('dark')}
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('system')}
      >
        <Laptop className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

## Server-Initialized Context

```typescript
// contexts/user-context.tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface UserContextValue {
  user: User | null;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: ReactNode;
  user: User | null;
}

// Provider receives data from Server Component
export function UserProvider({ children, user }: UserProviderProps) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function useRequiredUser() {
  const { user } = useUser();
  if (!user) {
    throw new Error('User is required but not found');
  }
  return user;
}

// app/layout.tsx (Server Component)
import { UserProvider } from '@/contexts/user-context';
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
        <UserProvider user={session?.user ?? null}>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
```

## Compound Providers

```typescript
// providers/app-providers.tsx
'use client';

import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/theme-context';
import { UserProvider } from '@/contexts/user-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

interface AppProvidersProps {
  children: ReactNode;
  user: User | null;
}

export function AppProviders({ children, user }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider user={user}>
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

// app/layout.tsx
import { AppProviders } from '@/providers/app-providers';
import { getSession } from '@/lib/auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders user={session?.user ?? null}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

## Context with Reducer

```typescript
// contexts/cart-context.tsx
'use client';

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        };
        return { ...state, items: newItems };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  dispatch: Dispatch<CartAction>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const initialState: CartState = {
  items: [],
  isOpen: false,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Helper hooks for common actions
export function useCartActions() {
  const { dispatch } = useCart();

  return {
    addItem: (item: Omit<CartItem, 'quantity'>) =>
      dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (id: string) =>
      dispatch({ type: 'REMOVE_ITEM', payload: id }),
    updateQuantity: (id: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
  };
}
```

## Scoped Context

```typescript
// contexts/modal-context.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface ModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function ModalProvider({
  children,
  defaultOpen = false,
}: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <ModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// Usage - Scoped to specific feature
// components/delete-dialog.tsx
'use client';

import { ModalProvider, useModal } from '@/contexts/modal-context';
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
import { Button } from '@/components/ui/button';

function DeleteDialogContent({
  onConfirm,
  title,
}: {
  onConfirm: () => void;
  title: string;
}) {
  const { isOpen, close } = useModal();

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {title}?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => {
            onConfirm();
            close();
          }}
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function DeleteDialog({
  trigger,
  title,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  onConfirm: () => void;
}) {
  return (
    <ModalProvider>
      <AlertDialog>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        <DeleteDialogContent onConfirm={onConfirm} title={title} />
      </AlertDialog>
    </ModalProvider>
  );
}
```

## Context with External Sync

```typescript
// contexts/sidebar-context.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const SIDEBAR_COOKIE_KEY = 'sidebar:collapsed';

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [isCollapsed, setIsCollapsedState] = useState(defaultCollapsed);

  // Sync with cookie
  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    document.cookie = `${SIDEBAR_COOKIE_KEY}=${collapsed}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, []);

  const toggle = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
```

## Anti-patterns

### Don't Use Context for Frequently Changing Data

```typescript
// BAD - Mouse position changes rapidly, causes many re-renders
const MouseContext = createContext({ x: 0, y: 0 });

// GOOD - Use refs or dedicated state management
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // Throttle updates...
}
```

### Don't Forget Memoization

```typescript
// BAD - New object created on every render
function Provider({ children }) {
  const [value, setValue] = useState(0);
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

// GOOD - Memoize the context value
function Provider({ children }) {
  const [value, setValue] = useState(0);
  const contextValue = useMemo(() => ({ value, setValue }), [value]);
  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
}
```

## Related Skills

- [zustand](./zustand.md)
- [jotai](./jotai.md)
- [server-state](./server-state.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Basic context setup
- Server-initialized context
- Compound providers
- Context with reducer
- Scoped context
