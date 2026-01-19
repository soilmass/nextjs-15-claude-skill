---
id: pt-service-worker
name: Service Worker
version: 2.0.0
layer: L5
category: browser
description: Workbox and offline-first patterns for Next.js 15 PWA
tags: [browser, service, worker]
composes: []
dependencies: []
formula: next-pwa + Workbox + Caching Strategies = PWA with Offline Support
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
- Implementing offline caching strategies
- Enabling background sync for queued actions
- Push notifications
- Precaching static assets

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Service Worker Architecture                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Workbox Caching Strategies                          │   │
│  │                                                     │   │
│  │ Static Assets:   CacheFirst                         │   │
│  │ API Calls:       NetworkFirst (cache fallback)      │   │
│  │ Images:          StaleWhileRevalidate               │   │
│  │ HTML Pages:      NetworkFirst                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Service Worker Lifecycle                            │   │
│  │                                                     │   │
│  │ Install → Precache assets                           │   │
│  │ Activate → Clean old caches                         │   │
│  │ Fetch → Intercept requests, apply strategies        │   │
│  │ Push → Handle push notifications                    │   │
│  │ Sync → Background sync when online                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  next-pwa configuration:                                    │
│  - dest: 'public'                                          │
│  - runtimeCaching: [...]                                   │
│  - skipWaiting: true                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Service Worker Pattern

## Overview

Workbox and offline-first patterns for Next.js 15 applications. Implements caching strategies, background sync, and progressive web app (PWA) functionality.

## Implementation

### Next.js PWA Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/cdn\.example\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
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
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### Custom Service Worker

```typescript
// public/sw.js
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache Google Fonts
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Network-first for API calls
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

// Stale-while-revalidate for pages
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);

// Background sync for failed POST requests
const bgSyncPlugin = new BackgroundSyncPlugin('formQueue', {
  maxRetentionTime: 24 * 60, // Retry for max of 24 hours
});

registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') && request.method === 'POST',
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Offline fallback
const offlineFallbackPage = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline').then((cache) => cache.add(offlineFallbackPage))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(offlineFallbackPage))
    );
  }
});
```

### PWA Manifest

```json
// public/manifest.json
{
  "name": "My App",
  "short_name": "MyApp",
  "description": "A progressive web application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0070f3",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Offline Page

```typescript
// app/offline/page.tsx
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <WifiOff className="mx-auto h-16 w-16 text-gray-400" />
        
        <h1 className="mt-4 text-2xl font-bold">You're offline</h1>
        
        <p className="mt-2 text-gray-600">
          Please check your internet connection and try again.
        </p>
        
        <Button
          onClick={() => window.location.reload()}
          className="mt-6"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
```

### Service Worker Registration Hook

```typescript
// hooks/use-service-worker.ts
'use client';

import { useEffect, useState } from 'react';

type SWState = 'idle' | 'registering' | 'registered' | 'error' | 'updating';

export function useServiceWorker() {
  const [state, setState] = useState<SWState>('idle');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    setState('registering');

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        setRegistration(reg);
        setState('registered');

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
        setState('error');
      });

    // Listen for controller change (update applied)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  const skipWaiting = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { state, updateAvailable, skipWaiting };
}
```

### Update Notification Component

```typescript
// components/pwa-update-prompt.tsx
'use client';

import { useServiceWorker } from '@/hooks/use-service-worker';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function PWAUpdatePrompt() {
  const { updateAvailable, skipWaiting } = useServiceWorker();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="rounded-lg bg-blue-600 p-4 text-white shadow-lg">
        <p className="font-medium">Update available!</p>
        <p className="mt-1 text-sm text-blue-100">
          A new version is ready. Refresh to update.
        </p>
        <Button
          onClick={skipWaiting}
          variant="secondary"
          className="mt-3"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Now
        </Button>
      </div>
    </div>
  );
}
```

### Background Sync

```typescript
// lib/background-sync.ts
'use client';

export async function queueRequest(
  url: string,
  options: RequestInit
): Promise<Response | void> {
  try {
    return await fetch(url, options);
  } catch (error) {
    // Queue for background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;

      // Store request in IndexedDB
      await storeRequest({ url, options });

      // Register sync
      await (registration as any).sync.register('sync-requests');

      console.log('Request queued for background sync');
    } else {
      throw error;
    }
  }
}

// IndexedDB storage
async function storeRequest(request: {
  url: string;
  options: RequestInit;
}): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('requests', 'readwrite');
  await tx.objectStore('requests').add({
    ...request,
    timestamp: Date.now(),
  });
}

// In service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncRequests());
  }
});

async function syncRequests(): Promise<void> {
  const db = await openDB();
  const requests = await db.getAll('requests');

  for (const request of requests) {
    try {
      await fetch(request.url, request.options);
      await db.delete('requests', request.id);
    } catch (error) {
      console.error('Sync failed for request:', request.url);
    }
  }
}
```

### Push Notifications

```typescript
// lib/push-notifications.ts
'use client';

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('PushManager' in window)) {
    console.log('Push not supported');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  // Check permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }

  // Subscribe
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  });

  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  return subscription;
}

// In service worker
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: data.url },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
  }
});
```

## Variants

### With Workbox Window

```typescript
// lib/workbox-window.ts
'use client';

import { Workbox } from 'workbox-window';

export function registerSW(): Workbox | null {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const wb = new Workbox('/sw.js');

  wb.addEventListener('installed', (event) => {
    if (event.isUpdate) {
      console.log('New content available, please refresh.');
    }
  });

  wb.addEventListener('waiting', () => {
    // Show update prompt
  });

  wb.register();

  return wb;
}
```

## Anti-patterns

```typescript
// BAD: Caching everything
registerRoute(
  () => true,
  new CacheFirst() // Stale content!
);

// GOOD: Appropriate strategies per resource type
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst()
);
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst()
);

// BAD: No cache expiration
new CacheFirst({ cacheName: 'my-cache' }); // Grows forever!

// GOOD: Set limits
new CacheFirst({
  cacheName: 'my-cache',
  plugins: [
    new ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    }),
  ],
});
```

## Related Patterns

- `caching.md` - Caching strategies
- `offline-first.md` - Offline patterns
- `pwa.md` - Progressive web apps
- `background-jobs.md` - Background processing

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 2024-01-15: Initial service worker pattern
