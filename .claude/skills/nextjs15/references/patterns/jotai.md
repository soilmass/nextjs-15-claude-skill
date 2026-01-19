---
id: pt-jotai
name: Jotai State Management
version: 2.0.0
layer: L5
category: state
description: Atomic state management with Jotai for fine-grained reactivity
tags: [state, jotai, atoms, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../molecules/select.md
  - ../atoms/input-checkbox.md
dependencies:
  jotai: "^2.10.0"
formula: Jotai Atoms + Derived State + atomFamily = Fine-Grained Reactivity
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Jotai State Management

## When to Use

- **Fine-grained reactivity**: Only components using specific atoms re-render
- **Derived/computed state**: Read-only atoms that compute from other atoms
- **Atomic state structure**: State naturally splits into independent pieces
- **Async data atoms**: Built-in Suspense support for async atoms
- **List optimization**: splitAtom for efficient list rendering

**Avoid when**: You need a single source of truth store, state is deeply interconnected, or you prefer centralized state management.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Jotai Atom Dependency Graph                                 │
│                                                             │
│  ┌─────────────┐                                           │
│  │ countAtom   │◄───────────────────────────┐              │
│  │ primitive   │                             │              │
│  └──────┬──────┘                             │              │
│         │ derived                            │ write        │
│         ▼                                    │              │
│  ┌─────────────────┐    ┌───────────────────┴───────────┐  │
│  │ doubleCountAtom │    │ Counter Component              │  │
│  │ read-only       │    │ useAtom(countAtom)             │  │
│  └─────────────────┘    │ [Button] [Button] [Button]     │  │
│                         └───────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ todosAtom ──► todoAtomsAtom (splitAtom)               │  │
│  │     │             │                                    │  │
│  │     ▼             ▼                                    │  │
│  │ todoStatsAtom   TodoItem[] (each with own atom)       │  │
│  │ (derived)       [Checkbox] per item                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  JotaiProvider with createStore() for SSR                   │
└─────────────────────────────────────────────────────────────┘
```

## Overview

Jotai is a primitive and flexible state management library using atoms. It provides fine-grained reactivity, minimal re-renders, and excellent TypeScript support. Jotai works well with Next.js Server Components when used correctly.

## Basic Atoms

```typescript
// atoms/counter.ts
import { atom } from 'jotai';

// Primitive atom
export const countAtom = atom(0);

// Read-only derived atom
export const doubleCountAtom = atom((get) => get(countAtom) * 2);

// Writable derived atom
export const countWithMaxAtom = atom(
  (get) => get(countAtom),
  (get, set, newValue: number) => {
    const max = 100;
    set(countAtom, Math.min(newValue, max));
  }
);

// components/counter.tsx
'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { countAtom, doubleCountAtom } from '@/atoms/counter';
import { Button } from '@/components/ui/button';

export function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);

  return (
    <div className="space-y-4">
      <p className="text-2xl">Count: {count}</p>
      <p className="text-muted-foreground">Double: {doubleCount}</p>
      <div className="flex gap-2">
        <Button onClick={() => setCount((c) => c - 1)}>-</Button>
        <Button onClick={() => setCount((c) => c + 1)}>+</Button>
        <Button variant="outline" onClick={() => setCount(0)}>Reset</Button>
      </div>
    </div>
  );
}
```

## Next.js Provider Setup

```typescript
// providers/jotai-provider.tsx
'use client';

import { Provider, createStore } from 'jotai';
import { type ReactNode, useRef } from 'react';

interface JotaiProviderProps {
  children: ReactNode;
}

export function JotaiProvider({ children }: JotaiProviderProps) {
  const storeRef = useRef<ReturnType<typeof createStore>>();
  
  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

// app/layout.tsx
import { JotaiProvider } from '@/providers/jotai-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
```

## Async Atoms

```typescript
// atoms/user.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

interface User {
  id: string;
  name: string;
  email: string;
}

// Base atom for user ID
export const userIdAtom = atom<string | null>(null);

// Async atom that fetches user data
export const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  if (!userId) return null;

  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json() as Promise<User>;
});

// Loading state atom
export const userLoadingAtom = atom((get) => {
  const userId = get(userIdAtom);
  return userId !== null;
});

// components/user-profile.tsx
'use client';

import { Suspense } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom, userIdAtom } from '@/atoms/user';
import { Skeleton } from '@/components/ui/skeleton';

function UserData() {
  const user = useAtomValue(userAtom);

  if (!user) {
    return <p>No user selected</p>;
  }

  return (
    <div>
      <h2 className="font-semibold">{user.name}</h2>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
}

export function UserProfile() {
  return (
    <Suspense fallback={<Skeleton className="h-20" />}>
      <UserData />
    </Suspense>
  );
}
```

## Atoms with Storage

```typescript
// atoms/preferences.ts
import { atomWithStorage } from 'jotai/utils';

interface Preferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  compactMode: boolean;
}

const defaultPreferences: Preferences = {
  theme: 'system',
  sidebarCollapsed: false,
  compactMode: false,
};

// Persisted to localStorage
export const preferencesAtom = atomWithStorage<Preferences>(
  'user-preferences',
  defaultPreferences
);

// Derived atoms for individual preferences
export const themeAtom = atom(
  (get) => get(preferencesAtom).theme,
  (get, set, theme: Preferences['theme']) => {
    set(preferencesAtom, { ...get(preferencesAtom), theme });
  }
);

export const sidebarCollapsedAtom = atom(
  (get) => get(preferencesAtom).sidebarCollapsed,
  (get, set, collapsed: boolean) => {
    set(preferencesAtom, { ...get(preferencesAtom), sidebarCollapsed: collapsed });
  }
);

// components/theme-selector.tsx
'use client';

import { useAtom } from 'jotai';
import { themeAtom } from '@/atoms/preferences';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ThemeSelector() {
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

## Atom Families

```typescript
// atoms/todos.ts
import { atom } from 'jotai';
import { atomFamily, splitAtom } from 'jotai/utils';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// Base todos atom
export const todosAtom = atom<Todo[]>([]);

// Atom family for individual todos
export const todoAtomFamily = atomFamily((id: string) =>
  atom(
    (get) => get(todosAtom).find((todo) => todo.id === id),
    (get, set, update: Partial<Todo>) => {
      set(todosAtom, (todos) =>
        todos.map((todo) =>
          todo.id === id ? { ...todo, ...update } : todo
        )
      );
    }
  )
);

// Split atoms for optimized list rendering
export const todoAtomsAtom = splitAtom(todosAtom);

// Derived atoms
export const completedTodosAtom = atom((get) =>
  get(todosAtom).filter((todo) => todo.completed)
);

export const incompleteTodosAtom = atom((get) =>
  get(todosAtom).filter((todo) => !todo.completed)
);

export const todoStatsAtom = atom((get) => {
  const todos = get(todosAtom);
  const completed = todos.filter((t) => t.completed).length;
  return {
    total: todos.length,
    completed,
    incomplete: todos.length - completed,
  };
});

// components/todo-list.tsx
'use client';

import { useAtom, useAtomValue } from 'jotai';
import { todoAtomsAtom, todoStatsAtom } from '@/atoms/todos';
import { TodoItem } from './todo-item';

export function TodoList() {
  const [todoAtoms] = useAtom(todoAtomsAtom);
  const stats = useAtomValue(todoStatsAtom);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {stats.completed} of {stats.total} completed
      </p>
      <ul className="space-y-2">
        {todoAtoms.map((todoAtom) => (
          <TodoItem key={`${todoAtom}`} todoAtom={todoAtom} />
        ))}
      </ul>
    </div>
  );
}

// components/todo-item.tsx
'use client';

import { useAtom, type PrimitiveAtom } from 'jotai';
import { Checkbox } from '@/components/ui/checkbox';
import type { Todo } from '@/atoms/todos';

interface TodoItemProps {
  todoAtom: PrimitiveAtom<Todo>;
}

export function TodoItem({ todoAtom }: TodoItemProps) {
  const [todo, setTodo] = useAtom(todoAtom);

  return (
    <li className="flex items-center gap-3 p-3 border rounded-lg">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked) =>
          setTodo({ ...todo, completed: !!checked })
        }
      />
      <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
        {todo.title}
      </span>
    </li>
  );
}
```

## Write-Only Atoms for Actions

```typescript
// atoms/cart.ts
import { atom } from 'jotai';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const cartItemsAtom = atom<CartItem[]>([]);

// Write-only atom for adding items
export const addToCartAtom = atom(
  null,
  (get, set, item: Omit<CartItem, 'quantity'>) => {
    const items = get(cartItemsAtom);
    const existingIndex = items.findIndex((i) => i.id === item.id);

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + 1,
      };
      set(cartItemsAtom, newItems);
    } else {
      set(cartItemsAtom, [...items, { ...item, quantity: 1 }]);
    }
  }
);

// Write-only atom for removing items
export const removeFromCartAtom = atom(null, (get, set, itemId: string) => {
  set(cartItemsAtom, (items) => items.filter((item) => item.id !== itemId));
});

// Write-only atom for updating quantity
export const updateQuantityAtom = atom(
  null,
  (get, set, { id, quantity }: { id: string; quantity: number }) => {
    if (quantity <= 0) {
      set(removeFromCartAtom, id);
      return;
    }

    set(cartItemsAtom, (items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }
);

// Derived atoms
export const cartTotalAtom = atom((get) =>
  get(cartItemsAtom).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
);

export const cartItemCountAtom = atom((get) =>
  get(cartItemsAtom).reduce((sum, item) => sum + item.quantity, 0)
);

// Usage
// components/add-to-cart-button.tsx
'use client';

import { useSetAtom } from 'jotai';
import { addToCartAtom } from '@/atoms/cart';
import { Button } from '@/components/ui/button';

interface AddToCartButtonProps {
  product: { id: string; name: string; price: number };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addToCart = useSetAtom(addToCartAtom);

  return (
    <Button onClick={() => addToCart(product)}>
      Add to Cart
    </Button>
  );
}
```

## Server Hydration

```typescript
// atoms/server-data.ts
import { atom } from 'jotai';

interface ServerData {
  user: User | null;
  settings: Settings;
}

export const serverDataAtom = atom<ServerData>({
  user: null,
  settings: defaultSettings,
});

// providers/hydrate-atoms.tsx
'use client';

import { useHydrateAtoms } from 'jotai/utils';
import { serverDataAtom } from '@/atoms/server-data';
import type { ServerData } from '@/atoms/server-data';

interface HydrateAtomsProps {
  serverData: ServerData;
  children: React.ReactNode;
}

export function HydrateAtoms({ serverData, children }: HydrateAtomsProps) {
  useHydrateAtoms([[serverDataAtom, serverData]]);
  return <>{children}</>;
}

// app/layout.tsx
import { HydrateAtoms } from '@/providers/hydrate-atoms';
import { getSession, getSettings } from '@/lib/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings] = await Promise.all([
    getSession(),
    getSettings(),
  ]);

  return (
    <html lang="en">
      <body>
        <JotaiProvider>
          <HydrateAtoms
            serverData={{
              user: session?.user ?? null,
              settings,
            }}
          >
            {children}
          </HydrateAtoms>
        </JotaiProvider>
      </body>
    </html>
  );
}
```

## Anti-patterns

### Don't Create Atoms in Components

```typescript
// BAD - Creates new atom on every render
function Counter() {
  const countAtom = atom(0); // Wrong!
  const [count, setCount] = useAtom(countAtom);
  // ...
}

// GOOD - Define atoms outside components
const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  // ...
}
```

### Don't Overuse Atom Families

```typescript
// BAD - Atom family for simple derived state
const userNameAtomFamily = atomFamily((userId: string) =>
  atom((get) => get(usersAtom).find((u) => u.id === userId)?.name)
);

// GOOD - Use selector or derived atom
const usersMapAtom = atom((get) =>
  new Map(get(usersAtom).map((u) => [u.id, u]))
);
```

## Related Skills

- [zustand](./zustand.md)
- [context](./context.md)
- [local-storage](./local-storage.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Basic atoms
- Next.js provider setup
- Async atoms
- Atoms with storage
- Atom families
- Server hydration
