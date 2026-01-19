---
id: pt-push-notifications
name: Push Notifications
version: 2.0.0
layer: L5
category: data
description: Web Push API implementation with subscription management
tags: [push, notifications, web-push, service-worker, messaging]
composes: []
formula: "PushNotification = VAPIDKeys + ServiceWorker + SubscriptionManagement + PayloadDelivery + ClickHandling"
dependencies:
  - react
  - next
  - web-push
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Push Notifications

## When to Use

- Re-engaging users with important updates when they're not on your site
- Real-time alerts for messages, mentions, or activity notifications
- Order status updates for e-commerce applications
- Breaking news or time-sensitive content delivery
- Reminder notifications for appointments or scheduled events
- Social interactions (likes, comments, follows)

## Composition Diagram

```
[User Permission Request]
         |
         v
[Service Worker Registration]
         |
         v
[Push Subscription] ---> [VAPID Public Key]
         |
         v
[Store Subscription] ---> [Database: endpoint + keys]
         |
         v
[Server Event Trigger]
         |
         v
[web-push Library] ---> [Send to Push Service]
         |
         v
[Service Worker] ---> [push event handler]
         |
         v
[showNotification] ---> [title, body, icon, actions]
         |
         v
[notificationclick] ---> [Open URL / Focus Window]
```

## Overview

A complete Web Push notification implementation with subscription management, server-side sending, and notification preferences.

## Implementation

### Push Notification Provider

```tsx
// lib/push/push-provider.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface PushContextValue {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
}

const PushContext = createContext<PushContextValue | null>(null);

export function usePush() {
  const context = useContext(PushContext);
  if (!context) {
    throw new Error('usePush must be used within PushProvider');
  }
  return context;
}

export function PushProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check support
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (!supported) return;

    // Get current permission
    setPermission(Notification.permission);

    // Get service worker registration
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      
      // Check existing subscription
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribe = useCallback(async () => {
    if (!registration) return false;

    try {
      // Request permission if needed
      if (permission === 'default') {
        const result = await requestPermission();
        if (result !== 'granted') return false;
      }

      if (permission === 'denied') return false;

      // Get VAPID public key from server
      const response = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await response.json();

      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  }, [registration, permission, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return false;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return true;

      // Unsubscribe locally
      await subscription.unsubscribe();

      // Remove from server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }, [registration]);

  return (
    <PushContext.Provider
      value={{
        isSupported,
        permission,
        isSubscribed,
        subscribe,
        unsubscribe,
        requestPermission,
      }}
    >
      {children}
    </PushContext.Provider>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### Service Worker Push Handler

```js
// public/sw.js (Service Worker)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    image: data.image,
    vibrate: data.vibrate || [100, 50, 100],
    data: {
      url: data.url || '/',
      ...data.data,
    },
    actions: data.actions || [],
    tag: data.tag,
    renotify: data.renotify || false,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  // Handle action buttons
  if (event.action) {
    const action = event.notification.data?.actions?.find(
      (a) => a.action === event.action
    );
    if (action?.url) {
      event.waitUntil(clients.openWindow(action.url));
      return;
    }
  }

  // Default: open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if already open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  // Track notification dismissal
  fetch('/api/push/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'dismissed',
      tag: event.notification.tag,
    }),
  }).catch(() => {});
});
```

### Server-Side Push API

```tsx
// app/api/push/vapid-public-key/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
}
```

```tsx
// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    // Store subscription
    await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        keys: subscription.keys,
        userId: session.user.id,
      },
      create: {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save subscription:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
```

```tsx
// app/api/push/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    await prisma.pushSubscription.delete({
      where: { endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
```

```tsx
// lib/push/send-notification.ts
import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

webpush.setVapidDetails(
  'mailto:support@yourapp.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string; icon?: string; url?: string }[];
  data?: Record<string, any>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          JSON.stringify(payload)
        );
        return { success: true, endpoint: sub.endpoint };
      } catch (error: any) {
        // Remove invalid subscriptions
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { endpoint: sub.endpoint },
          });
        }
        return { success: false, endpoint: sub.endpoint, error };
      }
    })
  );

  return results;
}

export async function sendBroadcastNotification(
  payload: NotificationPayload,
  filters?: { userIds?: string[]; topics?: string[] }
) {
  let where: any = {};

  if (filters?.userIds) {
    where.userId = { in: filters.userIds };
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where });

  // Send in batches
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < subscriptions.length; i += batchSize) {
    const batch = subscriptions.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          JSON.stringify(payload)
        )
      )
    );
    results.push(...batchResults);
  }

  return results;
}
```

### Notification Settings Component

```tsx
// components/push/notification-settings.tsx
'use client';

import { useState } from 'react';
import { Bell, BellOff, Check, Loader2 } from 'lucide-react';
import { usePush } from '@/lib/push/push-provider';

export function NotificationSettings() {
  const { isSupported, permission, isSubscribed, subscribe, unsubscribe } = usePush();
  const [isLoading, setIsLoading] = useState(false);

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Push notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-green-500" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-500">
              {isSubscribed
                ? 'You will receive push notifications'
                : 'Enable to receive updates'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading || permission === 'denied'}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isSubscribed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
          } ${isLoading ? 'opacity-50' : ''} ${
            permission === 'denied' ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform ${
              isSubscribed ? 'translate-x-5' : ''
            }`}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
          </span>
        </button>
      </div>

      {permission === 'denied' && (
        <p className="mt-3 text-sm text-red-500">
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      )}
    </div>
  );
}
```

### Enable Notifications Prompt

```tsx
// components/push/enable-notifications-prompt.tsx
'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePush } from '@/lib/push/push-provider';

export function EnableNotificationsPrompt() {
  const { isSupported, permission, isSubscribed, subscribe } = usePush();
  const [showPrompt, setShowPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Don't show if not supported, already subscribed, or denied
  if (!isSupported || isSubscribed || permission === 'denied' || !showPrompt) {
    return null;
  }

  const handleEnable = async () => {
    setIsLoading(true);
    await subscribe();
    setIsLoading(false);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal
    localStorage.setItem('notifications-prompt-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50 w-80"
      >
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Stay updated
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get notified about important updates and new features.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Not now
              </button>
              <button
                onClick={handleEnable}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Enabling...' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Send Notification API

```tsx
// app/api/push/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification, sendBroadcastNotification } from '@/lib/push/send-notification';

export async function POST(request: NextRequest) {
  try {
    const { userId, userIds, payload } = await request.json();

    if (userId) {
      // Send to single user
      const results = await sendPushNotification(userId, payload);
      return NextResponse.json({ results });
    }

    if (userIds) {
      // Send to multiple users
      const results = await sendBroadcastNotification(payload, { userIds });
      return NextResponse.json({ results });
    }

    // Broadcast to all
    const results = await sendBroadcastNotification(payload);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
```

## Usage

```tsx
// Layout setup
import { PushProvider } from '@/lib/push/push-provider';

export default function RootLayout({ children }) {
  return (
    <PushProvider>
      {children}
    </PushProvider>
  );
}

// Settings page
import { NotificationSettings } from '@/components/push/notification-settings';

function SettingsPage() {
  return (
    <div>
      <h2>Notifications</h2>
      <NotificationSettings />
    </div>
  );
}

// Show prompt after onboarding
import { EnableNotificationsPrompt } from '@/components/push/enable-notifications-prompt';

function Dashboard() {
  return (
    <div>
      {/* Dashboard content */}
      <EnableNotificationsPrompt />
    </div>
  );
}

// Send notification from server
import { sendPushNotification } from '@/lib/push/send-notification';

// In a Server Action or API route
await sendPushNotification(userId, {
  title: 'New message',
  body: 'You have a new message from John',
  url: '/messages/123',
  actions: [
    { action: 'reply', title: 'Reply', url: '/messages/123?reply=true' },
    { action: 'dismiss', title: 'Dismiss' },
  ],
});
```

## Related Skills

- [L5/offline-mode](./offline-mode.md) - Offline PWA support
- [L3/notification-center](../organisms/notification-center.md) - In-app notifications
- [L5/service-workers](./service-workers.md) - Service worker patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with VAPID and web-push
