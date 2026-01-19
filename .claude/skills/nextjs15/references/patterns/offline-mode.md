---
id: pt-offline-mode
name: Offline Mode
version: 2.0.0
layer: L5
category: browser
description: Offline-first PWA with service workers and data sync
tags: [offline, pwa, service-worker, cache, sync]
composes:
  - ../atoms/feedback-alert.md
dependencies: []
formula: Service Worker + IndexedDB + Background Sync = Offline-First PWA
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Building Progressive Web Apps (PWAs)
- Implementing offline data access
- Caching assets and API responses
- Syncing data when connection restored
- Handling network failures gracefully

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Offline-First Architecture                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Service Worker                                      │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Cache Strategies:                               │ │   │
│  │ │ - Static: Cache First                           │ │   │
│  │ │ - API: Network First with Cache Fallback        │ │   │
│  │ │ - Images: Stale While Revalidate                │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ IndexedDB (Local Storage)                           │   │
│  │ - Offline data persistence                          │   │
│  │ - Pending actions queue                             │   │
│  │ - Sync on reconnect                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Online Status Detection:                                   │
│  - navigator.onLine                                        │
│  - Online/Offline events                                   │
│  - Network Information API                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Offline Mode

## Overview

An offline-first Progressive Web App (PWA) pattern with service workers, intelligent caching, background sync, and offline data persistence.

## Implementation

### Next.js PWA Configuration

```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\..*\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### Web App Manifest

```json
// public/manifest.json
{
  "name": "My Application",
  "short_name": "MyApp",
  "description": "A progressive web application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

### Offline Status Provider

```tsx
// lib/offline/offline-provider.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface OfflineContextValue {
  isOnline: boolean;
  isOfflineReady: boolean;
  pendingSyncCount: number;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when back online
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsOfflineReady(true);
      });
    }

    // Load pending sync count
    loadPendingSyncCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingSyncCount = async () => {
    try {
      const db = await openDatabase();
      const tx = db.transaction('pending-sync', 'readonly');
      const store = tx.objectStore('pending-sync');
      const count = await store.count();
      setPendingSyncCount(count);
    } catch {
      setPendingSyncCount(0);
    }
  };

  const syncPendingChanges = useCallback(async () => {
    if (!isOnline) return;

    try {
      const db = await openDatabase();
      const tx = db.transaction('pending-sync', 'readwrite');
      const store = tx.objectStore('pending-sync');
      const pendingItems = await store.getAll();

      for (const item of pendingItems) {
        try {
          await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body,
          });
          await store.delete(item.id);
        } catch {
          // Will retry on next sync
        }
      }

      await loadPendingSyncCount();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [isOnline]);

  const syncNow = useCallback(async () => {
    await syncPendingChanges();
  }, [syncPendingChanges]);

  return (
    <OfflineContext.Provider
      value={{ isOnline, isOfflineReady, pendingSyncCount, syncNow }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

// IndexedDB helper
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('pending-sync')) {
        db.createObjectStore('pending-sync', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('cached-data')) {
        const store = db.createObjectStore('cached-data', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}
```

### Offline Indicator

```tsx
// components/offline/offline-indicator.tsx
'use client';

import { WifiOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOffline } from '@/lib/offline/offline-provider';

export function OfflineIndicator() {
  const { isOnline, pendingSyncCount, syncNow } = useOffline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed left-0 right-0 top-0 z-50 bg-amber-500 px-4 py-2 text-center text-white"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              You're offline. Changes will sync when you're back online.
            </span>
            {pendingSyncCount > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {pendingSyncCount} pending
              </span>
            )}
          </div>
        </motion.div>
      )}

      {isOnline && pendingSyncCount > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed left-0 right-0 top-0 z-50 bg-blue-500 px-4 py-2 text-center text-white"
        >
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              Syncing {pendingSyncCount} changes...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Offline Data Hook

```tsx
// lib/offline/use-offline-data.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOffline } from './offline-provider';

interface UseOfflineDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  revalidateOnReconnect?: boolean;
  staleTime?: number; // ms
}

interface OfflineDataResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isStale: boolean;
  error: Error | undefined;
  refetch: () => Promise<void>;
}

export function useOfflineData<T>({
  key,
  fetcher,
  revalidateOnReconnect = true,
  staleTime = 1000 * 60 * 5, // 5 minutes
}: UseOfflineDataOptions<T>): OfflineDataResult<T> {
  const { isOnline } = useOffline();
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error>();

  const loadFromCache = useCallback(async () => {
    try {
      const cached = await getCachedData<T>(key);
      if (cached) {
        setData(cached.data);
        setIsStale(Date.now() - cached.timestamp > staleTime);
      }
    } catch {
      // No cached data
    }
  }, [key, staleTime]);

  const fetchData = useCallback(async () => {
    if (!isOnline) {
      await loadFromCache();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await fetcher();
      setData(result);
      setIsStale(false);
      await setCachedData(key, result);
    } catch (err) {
      setError(err as Error);
      // Fall back to cached data
      await loadFromCache();
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, fetcher, key, loadFromCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Revalidate when coming back online
  useEffect(() => {
    if (isOnline && revalidateOnReconnect && isStale) {
      fetchData();
    }
  }, [isOnline, revalidateOnReconnect, isStale, fetchData]);

  return { data, isLoading, isStale, error, refetch: fetchData };
}

// IndexedDB helpers
async function getCachedData<T>(key: string): Promise<{ data: T; timestamp: number } | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-db', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('cached-data', 'readonly');
      const store = tx.objectStore('cached-data');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function setCachedData<T>(key: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-db', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('cached-data', 'readwrite');
      const store = tx.objectStore('cached-data');
      
      store.put({ key, data, timestamp: Date.now() });
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}
```

### Offline Mutation Hook

```tsx
// lib/offline/use-offline-mutation.ts
'use client';

import { useState, useCallback } from 'react';
import { useOffline } from './offline-provider';

interface MutationOptions {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

interface OfflineMutationResult<T, V> {
  mutate: (variables: V) => Promise<T | undefined>;
  isLoading: boolean;
  error: Error | undefined;
  isPending: boolean;
}

export function useOfflineMutation<T, V = unknown>({
  url,
  method,
}: MutationOptions): OfflineMutationResult<T, V> {
  const { isOnline } = useOffline();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (variables: V): Promise<T | undefined> => {
      setIsLoading(true);
      setError(undefined);

      const requestBody = JSON.stringify(variables);

      if (!isOnline) {
        // Queue for later sync
        await queueForSync({
          url,
          method,
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });
        setIsPending(true);
        setIsLoading(false);
        return undefined;
      }

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setIsLoading(false);
        return result as T;
      } catch (err) {
        // Queue for retry if network error
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          await queueForSync({
            url,
            method,
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
          });
          setIsPending(true);
        } else {
          setError(err as Error);
        }
        setIsLoading(false);
        return undefined;
      }
    },
    [isOnline, url, method]
  );

  return { mutate, isLoading, error, isPending };
}

interface SyncItem {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

async function queueForSync(item: SyncItem): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-db', 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('pending-sync', 'readwrite');
      const store = tx.objectStore('pending-sync');

      store.add({ ...item, timestamp: Date.now() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}
```

### Install PWA Prompt

```tsx
// components/offline/install-prompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after delay
      setTimeout(() => setShowPrompt(true), 30000); // 30 seconds
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('install-prompt-dismissed', 'true');
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                  <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Install App
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Add to your home screen for faster access and offline support.
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleInstall}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Install
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Usage

```tsx
// Layout setup
import { OfflineProvider } from '@/lib/offline/offline-provider';
import { OfflineIndicator } from '@/components/offline/offline-indicator';
import { InstallPrompt } from '@/components/offline/install-prompt';

export default function RootLayout({ children }) {
  return (
    <OfflineProvider>
      <OfflineIndicator />
      {children}
      <InstallPrompt />
    </OfflineProvider>
  );
}

// Fetch data with offline support
import { useOfflineData } from '@/lib/offline/use-offline-data';

function ProductList() {
  const { data, isLoading, isStale, refetch } = useOfflineData({
    key: 'products',
    fetcher: () => fetch('/api/products').then(r => r.json()),
  });

  return (
    <div>
      {isStale && <span>Data may be outdated</span>}
      {/* Render products */}
    </div>
  );
}

// Mutations with offline queue
import { useOfflineMutation } from '@/lib/offline/use-offline-mutation';

function CreatePost() {
  const { mutate, isLoading, isPending } = useOfflineMutation({
    url: '/api/posts',
    method: 'POST',
  });

  const handleSubmit = async (data) => {
    await mutate(data);
    if (isPending) {
      toast('Saved offline. Will sync when online.');
    }
  };
}
```

## Related Skills

- [L5/push-notifications](./push-notifications.md) - Push notifications
- [L5/service-workers](./service-workers.md) - Service worker patterns
- [L5/background-sync](./background-sync.md) - Background sync

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with IndexedDB and service workers
