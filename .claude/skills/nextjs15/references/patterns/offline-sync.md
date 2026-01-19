---
id: pt-offline-sync
name: Offline Data Synchronization
version: 1.0.0
layer: L5
category: data
description: Implement offline-first data handling with background synchronization
tags: [offline, sync, pwa, indexeddb, service-worker, next15, react19]
composes: []
dependencies: []
formula: "OfflineSync = LocalStorage + ConflictResolution + BackgroundSync + ServiceWorker"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Offline Data Synchronization

## When to Use

- When building Progressive Web Apps (PWAs)
- For applications used in low-connectivity environments
- When implementing offline-first experiences
- For mobile apps with intermittent connections
- When data needs to persist across sessions

## Overview

This pattern implements offline data synchronization using IndexedDB for local storage, service workers for background sync, and conflict resolution strategies.

## IndexedDB Store

```typescript
// lib/offline/db.ts
import { openDB, DBSchema, IDBPDatabase } from "idb";

interface OfflineDB extends DBSchema {
  items: {
    key: string;
    value: {
      id: string;
      data: any;
      syncStatus: "synced" | "pending" | "conflict";
      localVersion: number;
      serverVersion: number;
      updatedAt: number;
    };
    indexes: { "by-sync-status": "synced" | "pending" | "conflict" };
  };
  syncQueue: {
    key: number;
    value: {
      id?: number;
      operation: "create" | "update" | "delete";
      collection: string;
      itemId: string;
      data: any;
      timestamp: number;
      retries: number;
    };
  };
  metadata: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<OfflineDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (db) return db;

  db = await openDB<OfflineDB>("offline-store", 1, {
    upgrade(db) {
      // Items store
      const itemsStore = db.createObjectStore("items", { keyPath: "id" });
      itemsStore.createIndex("by-sync-status", "syncStatus");

      // Sync queue store
      db.createObjectStore("syncQueue", {
        keyPath: "id",
        autoIncrement: true,
      });

      // Metadata store
      db.createObjectStore("metadata");
    },
  });

  return db;
}
```

## Offline Data Manager

```typescript
// lib/offline/manager.ts
import { getDB } from "./db";

export interface SyncOperation {
  operation: "create" | "update" | "delete";
  collection: string;
  itemId: string;
  data: any;
  timestamp: number;
  retries: number;
}

export async function saveLocal(
  collection: string,
  id: string,
  data: any
): Promise<void> {
  const db = await getDB();

  const existing = await db.get("items", id);
  const localVersion = (existing?.localVersion || 0) + 1;

  await db.put("items", {
    id,
    data: { ...data, _collection: collection },
    syncStatus: "pending",
    localVersion,
    serverVersion: existing?.serverVersion || 0,
    updatedAt: Date.now(),
  });

  // Add to sync queue
  await db.add("syncQueue", {
    operation: existing ? "update" : "create",
    collection,
    itemId: id,
    data,
    timestamp: Date.now(),
    retries: 0,
  });

  // Trigger background sync if available
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register("sync-data");
  }
}

export async function getLocal(id: string): Promise<any | null> {
  const db = await getDB();
  const item = await db.get("items", id);
  return item?.data || null;
}

export async function getAllLocal(collection: string): Promise<any[]> {
  const db = await getDB();
  const allItems = await db.getAll("items");
  return allItems
    .filter((item) => item.data._collection === collection)
    .map((item) => item.data);
}

export async function deleteLocal(
  collection: string,
  id: string
): Promise<void> {
  const db = await getDB();

  await db.delete("items", id);

  await db.add("syncQueue", {
    operation: "delete",
    collection,
    itemId: id,
    data: null,
    timestamp: Date.now(),
    retries: 0,
  });
}

export async function getPendingOperations(): Promise<SyncOperation[]> {
  const db = await getDB();
  return db.getAll("syncQueue");
}

export async function removeSyncOperation(id: number): Promise<void> {
  const db = await getDB();
  await db.delete("syncQueue", id);
}

export async function updateSyncRetries(
  id: number,
  retries: number
): Promise<void> {
  const db = await getDB();
  const operation = await db.get("syncQueue", id);
  if (operation) {
    await db.put("syncQueue", { ...operation, retries });
  }
}
```

## Sync Service

```typescript
// lib/offline/sync.ts
import {
  getPendingOperations,
  removeSyncOperation,
  updateSyncRetries,
  getDB,
} from "./manager";

const MAX_RETRIES = 3;

export async function syncWithServer(): Promise<{
  synced: number;
  failed: number;
}> {
  const operations = await getPendingOperations();
  let synced = 0;
  let failed = 0;

  for (const operation of operations) {
    try {
      const response = await performServerOperation(operation);

      if (response.ok) {
        await removeSyncOperation(operation.id!);
        await updateLocalSyncStatus(operation.itemId, "synced", response.data);
        synced++;
      } else if (response.conflict) {
        await handleConflict(operation, response.serverData);
        failed++;
      }
    } catch (error) {
      if (operation.retries < MAX_RETRIES) {
        await updateSyncRetries(operation.id!, operation.retries + 1);
      }
      failed++;
    }
  }

  return { synced, failed };
}

async function performServerOperation(
  operation: any
): Promise<{ ok: boolean; conflict?: boolean; data?: any; serverData?: any }> {
  const { operation: op, collection, itemId, data } = operation;

  const baseUrl = "/api";
  let url = `${baseUrl}/${collection}`;
  let method = "POST";

  if (op === "update") {
    url = `${url}/${itemId}`;
    method = "PUT";
  } else if (op === "delete") {
    url = `${url}/${itemId}`;
    method = "DELETE";
  }

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (response.status === 409) {
    const serverData = await response.json();
    return { ok: false, conflict: true, serverData };
  }

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }

  const responseData = await response.json();
  return { ok: true, data: responseData };
}

async function updateLocalSyncStatus(
  id: string,
  status: "synced" | "pending" | "conflict",
  serverData?: any
): Promise<void> {
  const db = await getDB();
  const item = await db.get("items", id);

  if (item) {
    await db.put("items", {
      ...item,
      syncStatus: status,
      serverVersion: serverData?.version || item.serverVersion,
      data: serverData || item.data,
    });
  }
}

async function handleConflict(operation: any, serverData: any): Promise<void> {
  const db = await getDB();
  const item = await db.get("items", operation.itemId);

  if (!item) return;

  // Store both versions for manual resolution
  await db.put("items", {
    ...item,
    syncStatus: "conflict",
    data: {
      ...item.data,
      _conflict: {
        local: item.data,
        server: serverData,
        timestamp: Date.now(),
      },
    },
  });

  await removeSyncOperation(operation.id!);
}
```

## Service Worker for Background Sync

```typescript
// public/sw.js
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(doSync());
  }
});

async function doSync() {
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Sync failed");
  }
}

// Handle push notifications for sync updates
self.addEventListener("push", (event) => {
  const data = event.data?.json();

  if (data?.type === "sync-update") {
    event.waitUntil(
      self.registration.showNotification("Data Updated", {
        body: "Your data has been synchronized",
        icon: "/icon.png",
      })
    );
  }
});
```

## React Hooks for Offline Data

```typescript
// hooks/use-offline-data.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  saveLocal,
  getLocal,
  getAllLocal,
  deleteLocal,
} from "@/lib/offline/manager";
import { syncWithServer } from "@/lib/offline/sync";

export function useOfflineData<T>(collection: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Load local data
  useEffect(() => {
    getAllLocal(collection).then((items) => {
      setData(items as T[]);
      setLoading(false);
    });
  }, [collection]);

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      sync();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const save = useCallback(
    async (id: string, item: T) => {
      await saveLocal(collection, id, item);
      setData((prev) => {
        const index = prev.findIndex((i: any) => i.id === id);
        if (index >= 0) {
          return [...prev.slice(0, index), item, ...prev.slice(index + 1)];
        }
        return [...prev, item];
      });
    },
    [collection]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteLocal(collection, id);
      setData((prev) => prev.filter((i: any) => i.id !== id));
    },
    [collection]
  );

  const sync = useCallback(async () => {
    if (!online) return;

    setSyncing(true);
    try {
      await syncWithServer();
      // Reload data after sync
      const items = await getAllLocal(collection);
      setData(items as T[]);
    } finally {
      setSyncing(false);
    }
  }, [collection, online]);

  return { data, loading, syncing, online, save, remove, sync };
}
```

## Offline Status Component

```typescript
// components/offline/sync-status.tsx
"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPendingOperations } from "@/lib/offline/manager";
import { syncWithServer } from "@/lib/offline/sync";

export function SyncStatus() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [conflicts, setConflicts] = useState(0);

  useEffect(() => {
    const updateStatus = async () => {
      const operations = await getPendingOperations();
      setPending(operations.length);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOnline(navigator.onLine);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncWithServer();
      const operations = await getPendingOperations();
      setPending(operations.length);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {online ? (
        <Cloud className="h-4 w-4 text-green-500" />
      ) : (
        <CloudOff className="h-4 w-4 text-yellow-500" />
      )}

      {pending > 0 && (
        <Badge variant="outline" className="text-xs">
          {pending} pending
        </Badge>
      )}

      {conflicts > 0 && (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          {conflicts} conflicts
        </Badge>
      )}

      {online && pending > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw
            className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
          />
        </Button>
      )}
    </div>
  );
}
```

## Conflict Resolution Component

```typescript
// components/offline/conflict-resolver.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDB } from "@/lib/offline/db";

interface ConflictResolverProps {
  itemId: string;
  onResolved: () => void;
}

export function ConflictResolver({ itemId, onResolved }: ConflictResolverProps) {
  const [conflict, setConflict] = useState<any>(null);

  useEffect(() => {
    getDB().then((db) =>
      db.get("items", itemId).then((item) => {
        if (item?.data?._conflict) {
          setConflict(item.data._conflict);
        }
      })
    );
  }, [itemId]);

  const resolveWithLocal = async () => {
    const db = await getDB();
    const item = await db.get("items", itemId);
    if (item) {
      const { _conflict, ...localData } = item.data._conflict.local;
      await db.put("items", {
        ...item,
        data: localData,
        syncStatus: "pending",
      });
    }
    onResolved();
  };

  const resolveWithServer = async () => {
    const db = await getDB();
    const item = await db.get("items", itemId);
    if (item) {
      await db.put("items", {
        ...item,
        data: item.data._conflict.server,
        syncStatus: "synced",
      });
    }
    onResolved();
  };

  if (!conflict) return null;

  return (
    <Card className="p-4 border-yellow-500">
      <h3 className="font-semibold mb-4">Resolve Conflict</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Your Version</h4>
          <pre className="text-xs bg-muted p-2 rounded">
            {JSON.stringify(conflict.local, null, 2)}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Server Version</h4>
          <pre className="text-xs bg-muted p-2 rounded">
            {JSON.stringify(conflict.server, null, 2)}
          </pre>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={resolveWithLocal}>Keep Mine</Button>
        <Button variant="outline" onClick={resolveWithServer}>
          Use Server
        </Button>
      </div>
    </Card>
  );
}
```

## Anti-patterns

### Don't Ignore Sync Failures

```typescript
// BAD - Silent failure
await saveLocal(id, data);
syncWithServer().catch(() => {});

// GOOD - Track and retry
await saveLocal(id, data);
try {
  await syncWithServer();
} catch {
  showSyncPendingIndicator();
}
```

## Related Patterns

- [pwa](./pwa.md)
- [optimistic-updates](./optimistic-updates.md)
- [local-storage](./local-storage.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- IndexedDB storage
- Background sync
- Conflict resolution
- Service worker integration
