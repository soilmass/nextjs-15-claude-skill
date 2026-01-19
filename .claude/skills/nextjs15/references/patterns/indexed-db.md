---
id: pt-indexed-db
name: IndexedDB Storage
version: 2.0.0
layer: L5
category: state
description: Client-side database with IndexedDB for offline-first apps, large data storage, and persistent caching
tags: [indexeddb, idb, offline, storage, persistence, pwa]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-text.md
  - ../atoms/input-textarea.md
  - ../molecules/badge.md
dependencies: []
formula: IndexedDB + idb Library + Sync Queue + React Hooks = Offline-First Storage
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# IndexedDB Storage

Robust client-side storage for offline-first Next.js applications using IndexedDB.

## When to Use

- **Large data storage**: Files, blobs, extensive cached data
- **Offline-first apps**: Data needs to persist and sync when online
- **Complex queries**: Need indexes for efficient lookups
- **Structured data**: Multiple object stores with relationships
- **Background sync**: Queue mutations for later processing

**Avoid when**: Data is small (use localStorage), no offline requirement, or data is sensitive (IndexedDB isn't encrypted by default).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ IndexedDB Architecture                                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Database Schema (DBSchema)                            │  │
│  │  ├─ users: { key: id, indexes: [by-email] }          │  │
│  │  ├─ apiCache: { key: url, indexes: [by-timestamp] }  │  │
│  │  ├─ syncQueue: { autoIncrement, indexes: [by-ts] }   │  │
│  │  ├─ drafts: { key: id, indexes: [by-type, by-date] } │  │
│  │  └─ files: { key: id, value: { blob, metadata } }    │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ DBOperations<T> class                                 │  │
│  │  ├─ get(key), getAll(), getAllByIndex()              │  │
│  │  ├─ put(value), add(value), delete(key)              │  │
│  │  └─ transaction(mode, callback)                       │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ API Cache  │     │ Sync Queue   │     │ Draft Hook  │   │
│  │ cachedFetch│     │ queueSync()  │     │ useDraft()  │   │
│  │ stale-while│     │ processQueue │     │ [Form]      │   │
│  │ -revalidate│     │ when online  │     │ [Badge]     │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ OfflineForm Component                                 │  │
│  │  ├─ useOnlineStatus() ──► Cloud/CloudOff icons        │  │
│  │  ├─ useDraft() ──► "Draft saved" [Badge]              │  │
│  │  └─ queueSync() when offline ──► [Button]             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Overview

This pattern covers:
- IndexedDB wrapper with idb library
- Type-safe database schemas
- CRUD operations
- Offline data synchronization
- React hooks for IndexedDB
- Migration strategies

## Implementation

### Installation

```bash
npm install idb
```

### Database Schema and Setup

```typescript
// lib/db/schema.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define your database schema
interface AppDB extends DBSchema {
  // User data store
  users: {
    key: string;
    value: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      updatedAt: number;
    };
    indexes: { 'by-email': string };
  };

  // Cached API responses
  apiCache: {
    key: string;
    value: {
      url: string;
      data: unknown;
      timestamp: number;
      ttl: number; // Time to live in ms
    };
    indexes: { 'by-timestamp': number };
  };

  // Offline queue for pending mutations
  syncQueue: {
    key: number;
    value: {
      id: number;
      action: 'create' | 'update' | 'delete';
      endpoint: string;
      method: string;
      body: unknown;
      timestamp: number;
      retries: number;
    };
    indexes: { 'by-timestamp': number };
  };

  // Draft content (forms, documents)
  drafts: {
    key: string;
    value: {
      id: string;
      type: string;
      data: unknown;
      updatedAt: number;
    };
    indexes: { 'by-type': string; 'by-updated': number };
  };

  // Files and blobs
  files: {
    key: string;
    value: {
      id: string;
      name: string;
      type: string;
      size: number;
      blob: Blob;
      uploadedAt: number;
    };
  };
}

const DB_NAME = 'app-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only available in the browser');
  }

  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Migration from version 0 (fresh install)
        if (oldVersion < 1) {
          // Users store
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('by-email', 'email', { unique: true });

          // API cache store
          const cacheStore = db.createObjectStore('apiCache', { keyPath: 'url' });
          cacheStore.createIndex('by-timestamp', 'timestamp');

          // Sync queue store
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('by-timestamp', 'timestamp');

          // Drafts store
          const draftStore = db.createObjectStore('drafts', { keyPath: 'id' });
          draftStore.createIndex('by-type', 'type');
          draftStore.createIndex('by-updated', 'updatedAt');

          // Files store
          db.createObjectStore('files', { keyPath: 'id' });
        }

        // Add future migrations here
        // if (oldVersion < 2) { ... }
      },
      blocked() {
        console.warn('Database upgrade blocked. Close other tabs.');
      },
      blocking() {
        // Another tab wants to upgrade
        db?.close();
        dbPromise = null;
      },
    });
  }

  return dbPromise;
}

// Export type for use in other modules
export type { AppDB };
```

### Generic Database Operations

```typescript
// lib/db/operations.ts
import { getDB, type AppDB } from './schema';
import type { StoreNames, StoreValue, StoreKey, IndexNames, IndexKey } from 'idb';

type StoreName = StoreNames<AppDB>;

export class DBOperations<T extends StoreName> {
  constructor(private storeName: T) {}

  async get(key: StoreKey<AppDB, T>): Promise<StoreValue<AppDB, T> | undefined> {
    const db = await getDB();
    return db.get(this.storeName, key);
  }

  async getAll(): Promise<StoreValue<AppDB, T>[]> {
    const db = await getDB();
    return db.getAll(this.storeName);
  }

  async getAllByIndex<I extends IndexNames<AppDB, T>>(
    indexName: I,
    query: IndexKey<AppDB, T, I>
  ): Promise<StoreValue<AppDB, T>[]> {
    const db = await getDB();
    return db.getAllFromIndex(this.storeName, indexName, query);
  }

  async put(value: StoreValue<AppDB, T>): Promise<StoreKey<AppDB, T>> {
    const db = await getDB();
    return db.put(this.storeName, value);
  }

  async add(value: StoreValue<AppDB, T>): Promise<StoreKey<AppDB, T>> {
    const db = await getDB();
    return db.add(this.storeName, value);
  }

  async delete(key: StoreKey<AppDB, T>): Promise<void> {
    const db = await getDB();
    return db.delete(this.storeName, key);
  }

  async clear(): Promise<void> {
    const db = await getDB();
    return db.clear(this.storeName);
  }

  async count(): Promise<number> {
    const db = await getDB();
    return db.count(this.storeName);
  }

  async transaction<R>(
    mode: IDBTransactionMode,
    callback: (store: ReturnType<IDBPDatabase<AppDB>['transaction']>) => Promise<R>
  ): Promise<R> {
    const db = await getDB();
    const tx = db.transaction(this.storeName, mode);
    const result = await callback(tx);
    await tx.done;
    return result;
  }
}

// Pre-configured store instances
export const usersDB = new DBOperations('users');
export const apiCacheDB = new DBOperations('apiCache');
export const syncQueueDB = new DBOperations('syncQueue');
export const draftsDB = new DBOperations('drafts');
export const filesDB = new DBOperations('files');
```

### API Cache Layer

```typescript
// lib/db/api-cache.ts
import { apiCacheDB } from './operations';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedData<T>(
  url: string,
  options: CacheOptions = {}
): Promise<T | null> {
  const { ttl = DEFAULT_TTL } = options;

  try {
    const cached = await apiCacheDB.get(url);
    
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > (cached.ttl || ttl);
    
    if (isExpired && !options.staleWhileRevalidate) {
      await apiCacheDB.delete(url);
      return null;
    }

    return cached.data as T;
  } catch {
    return null;
  }
}

export async function setCachedData<T>(
  url: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = DEFAULT_TTL } = options;

  await apiCacheDB.put({
    url,
    data,
    timestamp: Date.now(),
    ttl,
  });
}

export async function invalidateCache(pattern?: string | RegExp): Promise<void> {
  if (!pattern) {
    await apiCacheDB.clear();
    return;
  }

  const all = await apiCacheDB.getAll();
  const db = await import('./schema').then((m) => m.getDB());
  const tx = db.transaction('apiCache', 'readwrite');

  for (const item of all) {
    const matches =
      typeof pattern === 'string'
        ? item.url.includes(pattern)
        : pattern.test(item.url);

    if (matches) {
      await tx.store.delete(item.url);
    }
  }

  await tx.done;
}

export async function cleanupExpiredCache(): Promise<number> {
  const all = await apiCacheDB.getAll();
  const now = Date.now();
  let cleaned = 0;

  const db = await import('./schema').then((m) => m.getDB());
  const tx = db.transaction('apiCache', 'readwrite');

  for (const item of all) {
    if (now - item.timestamp > item.ttl) {
      await tx.store.delete(item.url);
      cleaned++;
    }
  }

  await tx.done;
  return cleaned;
}

// Wrapper for fetch with caching
export async function cachedFetch<T>(
  url: string,
  options: RequestInit & CacheOptions = {}
): Promise<T> {
  const { ttl, staleWhileRevalidate, ...fetchOptions } = options;

  // Try cache first
  const cached = await getCachedData<T>(url, { ttl, staleWhileRevalidate });

  if (cached && !staleWhileRevalidate) {
    return cached;
  }

  // Fetch fresh data
  const fetchPromise = fetch(url, fetchOptions)
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      await setCachedData(url, data, { ttl });
      return data as T;
    });

  // Return stale data immediately, revalidate in background
  if (cached && staleWhileRevalidate) {
    fetchPromise.catch(console.error); // Silent background update
    return cached;
  }

  return fetchPromise;
}
```

### Offline Sync Queue

```typescript
// lib/db/sync-queue.ts
import { syncQueueDB } from './operations';
import { getDB } from './schema';

interface SyncAction {
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  method: string;
  body: unknown;
}

export async function queueSync(action: SyncAction): Promise<number> {
  const db = await getDB();
  
  return db.add('syncQueue', {
    ...action,
    id: 0, // Auto-incremented
    timestamp: Date.now(),
    retries: 0,
  });
}

export async function processQueue(): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  const items = await syncQueueDB.getAll();
  let processed = 0;
  let failed = 0;

  // Sort by timestamp
  items.sort((a, b) => a.timestamp - b.timestamp);

  for (const item of items) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      if (response.ok) {
        await syncQueueDB.delete(item.id);
        processed++;
      } else if (response.status >= 400 && response.status < 500) {
        // Client error - don't retry
        await syncQueueDB.delete(item.id);
        failed++;
      } else {
        // Server error - retry later
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      // Network error or server error - update retry count
      const maxRetries = 5;
      
      if (item.retries >= maxRetries) {
        await syncQueueDB.delete(item.id);
        failed++;
      } else {
        await syncQueueDB.put({
          ...item,
          retries: item.retries + 1,
        });
      }
    }
  }

  const remaining = await syncQueueDB.count();

  return { processed, failed, remaining };
}

// Process queue when online
export function setupOnlineSync() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', async () => {
    console.log('Back online, processing sync queue...');
    const result = await processQueue();
    console.log('Sync result:', result);
  });

  // Also process on page load if online
  if (navigator.onLine) {
    processQueue();
  }
}
```

### React Hooks for IndexedDB

```typescript
// hooks/use-indexed-db.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DBOperations } from '@/lib/db/operations';
import type { AppDB } from '@/lib/db/schema';
import type { StoreNames, StoreValue, StoreKey } from 'idb';

type StoreName = StoreNames<AppDB>;

interface UseIndexedDBOptions<T extends StoreName> {
  key?: StoreKey<AppDB, T>;
  initialValue?: StoreValue<AppDB, T>;
}

export function useIndexedDB<T extends StoreName>(
  storeName: T,
  options: UseIndexedDBOptions<T> = {}
) {
  const [data, setData] = useState<StoreValue<AppDB, T> | undefined>(
    options.initialValue
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const db = new DBOperations(storeName);

  // Load data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        if (options.key !== undefined) {
          const value = await db.get(options.key);
          setData(value);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [storeName, options.key]);

  // Save data
  const save = useCallback(
    async (value: StoreValue<AppDB, T>) => {
      try {
        setError(null);
        await db.put(value);
        setData(value);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save data'));
        throw err;
      }
    },
    [storeName]
  );

  // Delete data
  const remove = useCallback(
    async (key: StoreKey<AppDB, T>) => {
      try {
        setError(null);
        await db.delete(key);
        setData(undefined);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete data'));
        throw err;
      }
    },
    [storeName]
  );

  return { data, loading, error, save, remove };
}

// Hook for lists
export function useIndexedDBList<T extends StoreName>(storeName: T) {
  const [items, setItems] = useState<StoreValue<AppDB, T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const db = new DBOperations(storeName);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const all = await db.getAll();
      setItems(all);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (value: StoreValue<AppDB, T>) => {
      await db.put(value);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (key: StoreKey<AppDB, T>) => {
      await db.delete(key);
      await refresh();
    },
    [refresh]
  );

  const clear = useCallback(async () => {
    await db.clear();
    setItems([]);
  }, []);

  return { items, loading, error, refresh, add, remove, clear };
}
```

### Draft Auto-Save Hook

```typescript
// hooks/use-draft.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { draftsDB } from '@/lib/db/operations';
import { useDebouncedCallback } from 'use-debounce';

interface UseDraftOptions<T> {
  draftId: string;
  draftType: string;
  debounceMs?: number;
  onRestore?: (data: T) => void;
}

export function useDraft<T extends Record<string, unknown>>({
  draftId,
  draftType,
  debounceMs = 1000,
  onRestore,
}: UseDraftOptions<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const initialLoadRef = useRef(false);

  // Load existing draft on mount
  useEffect(() => {
    async function loadDraft() {
      const draft = await draftsDB.get(draftId);
      if (draft && !initialLoadRef.current) {
        initialLoadRef.current = true;
        setHasDraft(true);
        setLastSaved(new Date(draft.updatedAt));
        if (onRestore) {
          onRestore(draft.data as T);
        }
      }
    }
    loadDraft();
  }, [draftId, onRestore]);

  // Debounced save
  const debouncedSave = useDebouncedCallback(async (data: T) => {
    setIsSaving(true);
    try {
      await draftsDB.put({
        id: draftId,
        type: draftType,
        data,
        updatedAt: Date.now(),
      });
      setHasDraft(true);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, debounceMs);

  // Save draft
  const saveDraft = useCallback(
    (data: T) => {
      debouncedSave(data);
    },
    [debouncedSave]
  );

  // Clear draft
  const clearDraft = useCallback(async () => {
    await draftsDB.delete(draftId);
    setHasDraft(false);
    setLastSaved(null);
  }, [draftId]);

  // Restore draft
  const restoreDraft = useCallback(async (): Promise<T | null> => {
    const draft = await draftsDB.get(draftId);
    return draft ? (draft.data as T) : null;
  }, [draftId]);

  return {
    hasDraft,
    lastSaved,
    isSaving,
    saveDraft,
    clearDraft,
    restoreDraft,
  };
}
```

### Usage Example Component

```typescript
// components/offline-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useDraft } from '@/hooks/use-draft';
import { queueSync } from '@/lib/db/sync-queue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, Save } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

interface FormData {
  title: string;
  content: string;
}

export function OfflineForm({ postId }: { postId?: string }) {
  const isOnline = useOnlineStatus();
  const draftId = postId || 'new-post';

  const { register, handleSubmit, watch, reset } = useForm<FormData>();

  const { hasDraft, lastSaved, isSaving, saveDraft, clearDraft } = useDraft<FormData>({
    draftId,
    draftType: 'post',
    onRestore: (data) => reset(data),
  });

  // Auto-save on form changes
  const formValues = watch();
  useEffect(() => {
    if (formValues.title || formValues.content) {
      saveDraft(formValues);
    }
  }, [formValues, saveDraft]);

  const onSubmit = async (data: FormData) => {
    if (isOnline) {
      // Submit directly
      await fetch('/api/posts', {
        method: postId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: postId }),
      });
    } else {
      // Queue for later
      await queueSync({
        action: postId ? 'update' : 'create',
        endpoint: '/api/posts',
        method: postId ? 'PUT' : 'POST',
        body: { ...data, id: postId },
      });
    }

    await clearDraft();
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Cloud className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Online</span>
            </>
          ) : (
            <>
              <CloudOff className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Offline - changes will sync later</span>
            </>
          )}
        </div>
        
        {hasDraft && (
          <div className="flex items-center gap-2">
            {isSaving ? (
              <Badge variant="secondary">
                <Save className="h-3 w-3 mr-1 animate-pulse" />
                Saving...
              </Badge>
            ) : (
              <Badge variant="outline">
                Draft saved {lastSaved?.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        )}
      </div>

      <Input
        {...register('title')}
        placeholder="Post title"
      />

      <Textarea
        {...register('content')}
        placeholder="Write your content..."
        rows={10}
      />

      <div className="flex gap-2">
        <Button type="submit">
          {isOnline ? 'Publish' : 'Save for later'}
        </Button>
        {hasDraft && (
          <Button type="button" variant="outline" onClick={clearDraft}>
            Discard draft
          </Button>
        )}
      </div>
    </form>
  );
}

// Online status hook
import { useState, useEffect } from 'react';
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

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

  return isOnline;
}
```

## Variants

### Zustand Persist with IndexedDB

```typescript
// lib/stores/offline-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

const indexedDBStorage = {
  getItem: async (name: string) => {
    const value = await get(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string) => {
    await set(name, value);
  },
  removeItem: async (name: string) => {
    await del(name);
  },
};

interface OfflineState {
  items: Record<string, unknown>[];
  addItem: (item: Record<string, unknown>) => void;
  removeItem: (id: string) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
    }),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);
```

## Anti-patterns

1. **Not handling SSR** - Always check for browser environment
2. **Blocking UI** - Use async operations, show loading states
3. **No migration strategy** - Plan schema versions from the start
4. **Storing sensitive data** - IndexedDB is not encrypted
5. **Ignoring quota limits** - Handle quota exceeded errors

## Related Skills

- [[local-storage]] - Simpler key-value storage
- [[service-workers]] - Background sync and caching
- [[zustand]] - State management with persistence

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial IndexedDB pattern with caching, sync queue, and React hooks
