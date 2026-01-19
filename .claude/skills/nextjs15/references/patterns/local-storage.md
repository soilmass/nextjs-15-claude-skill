---
id: pt-local-storage
name: Local Storage Patterns
version: 2.0.0
layer: L5
category: state
description: Persist client state to localStorage with SSR-safe patterns
tags: [state, local-storage, persistence, ssr, next15, react19]
composes:
  - ../atoms/input-switch.md
  - ../atoms/input-button.md
  - ../atoms/input-text.md
  - ../atoms/input-textarea.md
dependencies:
  openai: "^4.77.0"
formula: localStorage + SSR-Safe Hooks + Cross-Tab Sync = Persistent Client State
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Local Storage Patterns

## When to Use

- **User preferences**: Theme, language, display settings
- **Form drafts**: Auto-save form progress for later completion
- **Recently viewed items**: Track user browsing history
- **Cart persistence**: Keep cart items across sessions
- **Feature acknowledgments**: "Don't show again" preferences

**Avoid when**: Data is sensitive (use encrypted storage), data is large (use IndexedDB), or data needs server sync (use proper backend).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Local Storage Patterns                                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ useLocalStorage<T>(key, initialValue)                 │  │
│  │  ├─ SSR-safe: initializes with default                │  │
│  │  ├─ Hydrates from localStorage in useEffect           │  │
│  │  └─ Returns [value, setValue, removeValue]            │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                                                   │
│         ├──────────────────────────────────────────────────┐│
│         ▼                                                  ▼│
│  ┌────────────────────┐     ┌────────────────────────────┐ │
│  │ NotificationPrefs  │     │ useLocalStorageSync        │ │
│  │ [Switch] [Label]   │     │ Cross-tab synchronization  │ │
│  │ emailNotifications │     │ StorageEvent listener      │ │
│  └────────────────────┘     └────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ useRecentItems<T>(key, { maxItems: 10 })              │  │
│  │  ├─ addItem() ──► moves to front, trims to max        │  │
│  │  └─ clearItems(), removeItem()                        │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ RecentlyViewed                                         │ │
│  │ [ProductCard x6] ──► useTrackView() on product pages   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ useDraft(key, initialValue, { debounceMs: 1000 })     │  │
│  │  ├─ Auto-saves on change (debounced)                  │  │
│  │  └─ hasDraft, clearDraft for UI feedback              │  │
│  │       [Input] [Textarea] [Button] "Draft restored"    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Overview

localStorage allows persisting state across browser sessions. In Next.js, special care is needed since localStorage is only available in the browser. This pattern covers SSR-safe hooks, typed storage, and synchronization across tabs.

## Basic SSR-Safe Hook

```typescript
// hooks/use-local-storage.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize with initial value (SSR-safe)
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Usage
// components/preferences.tsx
'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function NotificationPreferences() {
  const [emailNotifications, setEmailNotifications] = useLocalStorage(
    'notifications.email',
    true
  );
  const [pushNotifications, setPushNotifications] = useLocalStorage(
    'notifications.push',
    false
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="email">Email notifications</Label>
        <Switch
          id="email"
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="push">Push notifications</Label>
        <Switch
          id="push"
          checked={pushNotifications}
          onCheckedChange={setPushNotifications}
        />
      </div>
    </div>
  );
}
```

## Typed Storage Utility

```typescript
// lib/storage.ts
'use client';

type StorageKey =
  | 'user-preferences'
  | 'cart-items'
  | 'recent-searches'
  | 'sidebar-state';

interface StorageSchema {
  'user-preferences': {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    locale: string;
  };
  'cart-items': Array<{
    id: string;
    quantity: number;
  }>;
  'recent-searches': string[];
  'sidebar-state': {
    collapsed: boolean;
    width: number;
  };
}

export const storage = {
  get<K extends StorageKey>(key: K): StorageSchema[K] | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<K extends StorageKey>(key: K, value: StorageSchema[K]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error);
    }
  },

  remove(key: StorageKey): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${key}`, error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage', error);
    }
  },
};

// Usage
storage.set('user-preferences', {
  theme: 'dark',
  compactMode: true,
  locale: 'en',
});

const prefs = storage.get('user-preferences');
// Type: { theme: 'light' | 'dark' | 'system'; compactMode: boolean; locale: string } | null
```

## Hook with Cross-Tab Sync

```typescript
// hooks/use-local-storage-sync.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorageSync<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Initial load
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // Invalid JSON, ignore
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch event for same-tab listeners (storage event only fires for other tabs)
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
          })
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// Usage: Cart that syncs across tabs
// components/cart-badge.tsx
'use client';

import { useLocalStorageSync } from '@/hooks/use-local-storage-sync';

interface CartItem {
  id: string;
  quantity: number;
}

export function CartBadge() {
  const [cartItems] = useLocalStorageSync<CartItem[]>('cart-items', []);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
      {itemCount}
    </span>
  );
}
```

## Recent Items Hook

```typescript
// hooks/use-recent-items.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseRecentItemsOptions {
  maxItems?: number;
}

export function useRecentItems<T extends { id: string }>(
  key: string,
  options: UseRecentItemsOptions = {}
): {
  items: T[];
  addItem: (item: T) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
} {
  const { maxItems = 10 } = options;
  const [items, setItems] = useState<T[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
  }, [key]);

  // Save to localStorage when items change
  const saveItems = useCallback(
    (newItems: T[]) => {
      setItems(newItems);
      try {
        localStorage.setItem(key, JSON.stringify(newItems));
      } catch {
        // Ignore errors
      }
    },
    [key]
  );

  const addItem = useCallback(
    (item: T) => {
      const filtered = items.filter((i) => i.id !== item.id);
      const newItems = [item, ...filtered].slice(0, maxItems);
      saveItems(newItems);
    },
    [items, maxItems, saveItems]
  );

  const removeItem = useCallback(
    (id: string) => {
      const newItems = items.filter((item) => item.id !== id);
      saveItems(newItems);
    },
    [items, saveItems]
  );

  const clearItems = useCallback(() => {
    saveItems([]);
  }, [saveItems]);

  return { items, addItem, removeItem, clearItems };
}

// Usage: Recently viewed products
// components/recently-viewed.tsx
'use client';

import { useRecentItems } from '@/hooks/use-recent-items';
import { ProductCard } from '@/components/product-card';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export function RecentlyViewed() {
  const { items, clearItems } = useRecentItems<Product>('recently-viewed', {
    maxItems: 6,
  });

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recently Viewed</h2>
        <button
          onClick={clearItems}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// Hook to track views
// hooks/use-track-view.ts
'use client';

import { useEffect } from 'react';
import { useRecentItems } from './use-recent-items';

export function useTrackView<T extends { id: string }>(item: T) {
  const { addItem } = useRecentItems<T>('recently-viewed');

  useEffect(() => {
    addItem(item);
  }, [item.id]); // Only track when ID changes
}
```

## Draft Persistence

```typescript
// hooks/use-draft.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UseDraftOptions {
  debounceMs?: number;
}

export function useDraft<T>(
  key: string,
  initialValue: T,
  options: UseDraftOptions = {}
): {
  draft: T;
  setDraft: (value: T) => void;
  clearDraft: () => void;
  hasDraft: boolean;
} {
  const { debounceMs = 1000 } = options;
  const [draft, setDraftState] = useState<T>(initialValue);
  const [hasDraft, setHasDraft] = useState(false);
  const initialValueRef = useRef(initialValue);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`draft:${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDraftState(parsed);
        setHasDraft(true);
      }
    } catch {
      // Ignore errors
    }
  }, [key]);

  // Debounced save to localStorage
  const saveDraft = useDebouncedCallback((value: T) => {
    try {
      localStorage.setItem(`draft:${key}`, JSON.stringify(value));
      setHasDraft(true);
    } catch {
      // Ignore errors
    }
  }, debounceMs);

  const setDraft = useCallback(
    (value: T) => {
      setDraftState(value);
      saveDraft(value);
    },
    [saveDraft]
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`draft:${key}`);
      setDraftState(initialValueRef.current);
      setHasDraft(false);
    } catch {
      // Ignore errors
    }
  }, [key]);

  return { draft, setDraft, clearDraft, hasDraft };
}

// Usage: Form with draft persistence
// components/post-editor.tsx
'use client';

import { useDraft } from '@/hooks/use-draft';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PostDraft {
  title: string;
  content: string;
}

export function PostEditor() {
  const { draft, setDraft, clearDraft, hasDraft } = useDraft<PostDraft>(
    'new-post',
    { title: '', content: '' },
    { debounceMs: 500 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic...
    clearDraft();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasDraft && (
        <div className="flex items-center justify-between p-2 bg-muted rounded">
          <span className="text-sm">Draft restored</span>
          <Button variant="ghost" size="sm" onClick={clearDraft}>
            Discard
          </Button>
        </div>
      )}

      <Input
        placeholder="Post title"
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      />
      <Textarea
        placeholder="Write your content..."
        value={draft.content}
        onChange={(e) => setDraft({ ...draft, content: e.target.value })}
        rows={10}
      />
      <Button type="submit">Publish</Button>
    </form>
  );
}
```

## Anti-patterns

### Don't Access localStorage During SSR

```typescript
// BAD - Will crash during SSR
const value = localStorage.getItem('key'); // ReferenceError!

// GOOD - Check for window
const value = typeof window !== 'undefined' 
  ? localStorage.getItem('key') 
  : null;

// BETTER - Use effect
useEffect(() => {
  const value = localStorage.getItem('key');
  // ...
}, []);
```

### Don't Store Large Objects

```typescript
// BAD - Storing too much data
localStorage.setItem('cache', JSON.stringify(hugeDataset)); // Can fail!

// GOOD - Store only necessary data
localStorage.setItem('user-id', userId);
// Fetch full data from server when needed
```

## Related Skills

- [zustand](./zustand.md)
- [context](./context.md)
- [url-state](./url-state.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- SSR-safe hook
- Typed storage utility
- Cross-tab sync
- Recent items hook
- Draft persistence
