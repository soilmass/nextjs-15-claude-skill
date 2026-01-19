---
id: pt-persistence
name: State Persistence
version: 2.0.0
layer: L5
category: state
description: Persist client-side state across sessions in Next.js 15
tags: [persistence, localStorage, sessionStorage, indexeddb, offline]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-switch.md
  - ../molecules/badge.md
dependencies: []
formula: Zustand Persist + IndexedDB + Cross-Tab Sync = Multi-Layer Persistence
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# State Persistence Pattern

## When to Use

- **User preferences**: Theme, language, UI settings across sessions
- **Shopping cart**: Preserve cart between visits
- **Form drafts**: Resume incomplete forms later
- **Offline data**: Cache data for offline access
- **Cross-tab sync**: Keep state consistent across browser tabs

**Avoid when**: Data is sensitive (use secure server storage), data needs server sync (use proper backend), or data expires quickly.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Persistence Strategy Layers                                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 1: Memory (fastest, no persistence)             │  │
│  │  └─ React state, Zustand without persist              │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 2: sessionStorage (tab lifetime)                │  │
│  │  └─ usePersistedState({ storage: 'session' })         │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 3: localStorage (browser lifetime)              │  │
│  │  ├─ Zustand persist middleware                        │  │
│  │  ├─ Version migration support                         │  │
│  │  └─ Cross-tab sync with BroadcastChannel              │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Layer 4: IndexedDB (large data, offline)              │  │
│  │  ├─ userData store (structured data)                  │  │
│  │  ├─ apiCache store (response caching)                 │  │
│  │  └─ offlineQueue store (pending mutations)            │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Cross-Tab Sync                                        │  │
│  │  ├─ BroadcastChannel API                              │  │
│  │  ├─ StorageEvent listener                             │  │
│  │  └─ useCrossTabSync(key, initialValue)                │  │
│  │       └─ Example: AuthSync (logout all tabs)          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Components: [Switch] [Button] [Badge] for UI feedback      │
└─────────────────────────────────────────────────────────────┘
```

## Overview

State persistence ensures user data and application state survive page refreshes and browser sessions. This pattern covers localStorage, sessionStorage, IndexedDB, and cross-tab synchronization strategies for Next.js 15.

## Implementation

### Generic Persistence Hook

```typescript
// hooks/use-persisted-state.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface PersistenceOptions<T> {
  key: string;
  storage?: 'local' | 'session';
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  version?: number;
  migrate?: (oldValue: any, oldVersion: number) => T;
}

interface StoredValue<T> {
  value: T;
  version: number;
  timestamp: number;
}

export function usePersistedState<T>(
  initialValue: T,
  options: PersistenceOptions<T>
) {
  const {
    key,
    storage = 'local',
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    version = 1,
    migrate,
  } = options;

  const getStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return storage === 'local' ? localStorage : sessionStorage;
  }, [storage]);

  // Initialize state
  const [state, setState] = useState<T>(() => {
    const storageInstance = getStorage();
    if (!storageInstance) return initialValue;

    try {
      const stored = storageInstance.getItem(key);
      if (!stored) return initialValue;

      const parsed: StoredValue<T> = deserialize(stored);

      // Check version and migrate if needed
      if (parsed.version !== version && migrate) {
        const migrated = migrate(parsed.value, parsed.version);
        return migrated;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Failed to load persisted state for ${key}:`, error);
      return initialValue;
    }
  });

  // Persist on change
  useEffect(() => {
    const storageInstance = getStorage();
    if (!storageInstance) return;

    try {
      const toStore: StoredValue<T> = {
        value: state,
        version,
        timestamp: Date.now(),
      };
      storageInstance.setItem(key, serialize(toStore));
    } catch (error) {
      console.error(`Failed to persist state for ${key}:`, error);
    }
  }, [state, key, version, serialize, getStorage]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    if (storage !== 'local') return; // sessionStorage doesn't sync across tabs

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;

      try {
        const parsed: StoredValue<T> = deserialize(event.newValue);
        setState(parsed.value);
      } catch (error) {
        console.error(`Failed to sync state for ${key}:`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, storage, deserialize]);

  const reset = useCallback(() => {
    setState(initialValue);
    const storageInstance = getStorage();
    if (storageInstance) {
      storageInstance.removeItem(key);
    }
  }, [initialValue, key, getStorage]);

  return [state, setState, reset] as const;
}
```

### Zustand Persistence Middleware

```typescript
// lib/stores/persisted-store.ts
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  sidebar: 'expanded' | 'collapsed';
}

interface PreferencesState extends UserPreferences {
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: string) => void;
  toggleNotifications: () => void;
  toggleSidebar: () => void;
  reset: () => void;
}

const initialState: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: true,
  sidebar: 'expanded',
};

// Persistence configuration
const persistConfig: PersistOptions<PreferencesState, UserPreferences> = {
  name: 'user-preferences',
  storage: createJSONStorage(() => localStorage),
  version: 2,
  
  // Migration for version updates
  migrate: (persistedState, version) => {
    if (version === 1) {
      // Migrate from v1 to v2
      return {
        ...persistedState,
        sidebar: 'expanded', // New field in v2
      } as PreferencesState;
    }
    return persistedState as PreferencesState;
  },
  
  // Only persist certain fields
  partialize: (state) => ({
    theme: state.theme,
    language: state.language,
    notifications: state.notifications,
    sidebar: state.sidebar,
  }),
  
  // Merge function for hydration
  merge: (persistedState, currentState) => ({
    ...currentState,
    ...(persistedState as object),
  }),
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleNotifications: () =>
        set((state) => ({ notifications: !state.notifications })),
      toggleSidebar: () =>
        set((state) => ({
          sidebar: state.sidebar === 'expanded' ? 'collapsed' : 'expanded',
        })),
      reset: () => set(initialState),
    }),
    persistConfig
  )
);
```

### IndexedDB Persistence

```typescript
// lib/persistence/indexed-db.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AppDB extends DBSchema {
  'user-data': {
    key: string;
    value: {
      id: string;
      data: any;
      updatedAt: number;
    };
  };
  'cached-responses': {
    key: string;
    value: {
      url: string;
      data: any;
      cachedAt: number;
      expiresAt: number;
    };
    indexes: { 'by-expiry': number };
  };
  'offline-queue': {
    key: number;
    value: {
      id: number;
      action: string;
      payload: any;
      createdAt: number;
    };
  };
}

let dbInstance: IDBPDatabase<AppDB> | null = null;

async function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<AppDB>('app-database', 1, {
    upgrade(db) {
      // User data store
      if (!db.objectStoreNames.contains('user-data')) {
        db.createObjectStore('user-data', { keyPath: 'id' });
      }

      // Cached responses store
      if (!db.objectStoreNames.contains('cached-responses')) {
        const store = db.createObjectStore('cached-responses', { keyPath: 'url' });
        store.createIndex('by-expiry', 'expiresAt');
      }

      // Offline queue store
      if (!db.objectStoreNames.contains('offline-queue')) {
        db.createObjectStore('offline-queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });

  return dbInstance;
}

// User data operations
export const userData = {
  async get<T>(key: string): Promise<T | undefined> {
    const db = await getDB();
    const record = await db.get('user-data', key);
    return record?.data;
  },

  async set<T>(key: string, data: T): Promise<void> {
    const db = await getDB();
    await db.put('user-data', {
      id: key,
      data,
      updatedAt: Date.now(),
    });
  },

  async delete(key: string): Promise<void> {
    const db = await getDB();
    await db.delete('user-data', key);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('user-data');
  },
};

// Cache operations
export const cache = {
  async get<T>(url: string): Promise<T | undefined> {
    const db = await getDB();
    const record = await db.get('cached-responses', url);

    if (!record) return undefined;

    // Check if expired
    if (record.expiresAt < Date.now()) {
      await db.delete('cached-responses', url);
      return undefined;
    }

    return record.data;
  },

  async set<T>(url: string, data: T, ttlMs = 3600000): Promise<void> {
    const db = await getDB();
    await db.put('cached-responses', {
      url,
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
  },

  async invalidate(url: string): Promise<void> {
    const db = await getDB();
    await db.delete('cached-responses', url);
  },

  async invalidatePattern(pattern: RegExp): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('cached-responses', 'readwrite');
    const store = tx.objectStore('cached-responses');

    let cursor = await store.openCursor();
    while (cursor) {
      if (pattern.test(cursor.key)) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }

    await tx.done;
  },

  async cleanup(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('cached-responses', 'readwrite');
    const store = tx.objectStore('cached-responses');
    const index = store.index('by-expiry');

    let cursor = await index.openCursor(IDBKeyRange.upperBound(Date.now()));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  },
};

// Offline queue operations
export const offlineQueue = {
  async add(action: string, payload: any): Promise<number> {
    const db = await getDB();
    const id = await db.add('offline-queue', {
      id: Date.now(),
      action,
      payload,
      createdAt: Date.now(),
    });
    return id as number;
  },

  async getAll(): Promise<Array<{ id: number; action: string; payload: any }>> {
    const db = await getDB();
    return db.getAll('offline-queue');
  },

  async remove(id: number): Promise<void> {
    const db = await getDB();
    await db.delete('offline-queue', id);
  },

  async process(
    handler: (action: string, payload: any) => Promise<void>
  ): Promise<void> {
    const items = await this.getAll();

    for (const item of items) {
      try {
        await handler(item.action, item.payload);
        await this.remove(item.id);
      } catch (error) {
        console.error(`Failed to process offline action ${item.id}:`, error);
        // Keep in queue for retry
      }
    }
  },
};
```

### React Hook for IndexedDB

```tsx
// hooks/use-indexed-db.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { userData } from '@/lib/persistence/indexed-db';

interface UseIndexedDBOptions<T> {
  key: string;
  defaultValue: T;
}

export function useIndexedDB<T>({ key, defaultValue }: UseIndexedDBOptions<T>) {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data on mount
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const stored = await userData.get<T>(key);
        if (mounted) {
          setData(stored ?? defaultValue);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load'));
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [key, defaultValue]);

  // Save data
  const save = useCallback(
    async (newData: T | ((prev: T) => T)) => {
      try {
        const valueToSave =
          typeof newData === 'function'
            ? (newData as (prev: T) => T)(data)
            : newData;

        await userData.set(key, valueToSave);
        setData(valueToSave);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save'));
        throw err;
      }
    },
    [key, data]
  );

  // Delete data
  const remove = useCallback(async () => {
    try {
      await userData.delete(key);
      setData(defaultValue);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete'));
      throw err;
    }
  }, [key, defaultValue]);

  return { data, save, remove, isLoading, error };
}
```

### Cross-Tab State Sync

```typescript
// lib/persistence/cross-tab-sync.ts
'use client';

type Listener<T> = (value: T) => void;

export class CrossTabSync<T> {
  private key: string;
  private listeners: Set<Listener<T>> = new Set();
  private channel: BroadcastChannel | null = null;

  constructor(key: string) {
    this.key = key;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(`sync-${key}`);
      this.channel.onmessage = (event) => {
        this.notifyListeners(event.data);
      };
    }
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  broadcast(value: T): void {
    // Notify other tabs
    this.channel?.postMessage(value);

    // Also store in localStorage for tabs that open later
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  }

  private notifyListeners(value: T): void {
    this.listeners.forEach((listener) => listener(value));
  }

  destroy(): void {
    this.channel?.close();
    this.listeners.clear();
  }
}

// Hook for cross-tab sync
import { useState, useEffect, useCallback } from 'react';

export function useCrossTabSync<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [sync] = useState(() => new CrossTabSync<T>(key));

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }

    // Subscribe to changes from other tabs
    const unsubscribe = sync.subscribe(setValue);

    return () => {
      unsubscribe();
      sync.destroy();
    };
  }, [key, sync]);

  const updateValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prev)
            : newValue;
        sync.broadcast(next);
        return next;
      });
    },
    [sync]
  );

  return [value, updateValue] as const;
}

// Usage
function AuthSync() {
  const [isLoggedIn, setIsLoggedIn] = useCrossTabSync('auth-status', false);

  // When user logs out in one tab, all tabs update
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div>
      {isLoggedIn ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <span>Not logged in</span>
      )}
    </div>
  );
}
```

### Offline-First Pattern

```tsx
// hooks/use-offline-first.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { cache, offlineQueue } from '@/lib/persistence/indexed-db';

interface UseOfflineFirstOptions<T> {
  url: string;
  cacheTtl?: number;
  onError?: (error: Error) => void;
}

export function useOfflineFirst<T>({
  url,
  cacheTtl = 3600000,
  onError,
}: UseOfflineFirstOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data with cache-first strategy
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    // Try cache first
    const cached = await cache.get<T>(url);
    if (cached) {
      setData(cached);
      setIsStale(true);
      setIsLoading(false);
    }

    // Try network if online
    if (isOnline) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response not ok');

        const freshData = await response.json();
        await cache.set(url, freshData, cacheTtl);

        setData(freshData);
        setIsStale(false);
      } catch (error) {
        if (!cached) {
          onError?.(error instanceof Error ? error : new Error('Fetch failed'));
        }
      }
    }

    setIsLoading(false);
  }, [url, isOnline, cacheTtl, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when coming back online
  useEffect(() => {
    if (isOnline && isStale) {
      fetchData();
    }
  }, [isOnline, isStale, fetchData]);

  return {
    data,
    isLoading,
    isStale,
    isOnline,
    refetch: fetchData,
  };
}
```

## Variants

### Encrypted Storage

```typescript
// lib/persistence/encrypted-storage.ts
const ENCRYPTION_KEY = 'your-encryption-key';

async function encrypt(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    'AES-GCM',
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  return JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  });
}

async function decrypt(encryptedData: string): Promise<string> {
  const { iv, data } = JSON.parse(encryptedData);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    'AES-GCM',
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(data)
  );

  return decoder.decode(decrypted);
}
```

## Anti-Patterns

```typescript
// Bad: Storing sensitive data in plain text
localStorage.setItem('user-token', token); // Security risk!

// Good: Use secure, encrypted storage or httpOnly cookies

// Bad: Not handling storage quota
localStorage.setItem('huge-data', JSON.stringify(hugeArray)); // May fail!

// Good: Check quota and handle errors
try {
  localStorage.setItem('data', JSON.stringify(data));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Handle quota exceeded
  }
}

// Bad: Synchronous operations blocking UI
const data = JSON.parse(localStorage.getItem('large-data')!); // Blocks!

// Good: Use IndexedDB for large data (async)
const data = await userData.get('large-data');
```

## Related Skills

- `local-storage` - Basic localStorage usage
- `indexed-db` - IndexedDB patterns
- `zustand` - Zustand with persistence
- `service-worker` - Offline capabilities

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial state persistence pattern
