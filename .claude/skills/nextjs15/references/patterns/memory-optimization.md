---
id: pt-memory-optimization
name: Memory Optimization
version: 2.0.0
layer: L5
category: performance
description: Optimize memory usage in Next.js 15 applications
tags: [performance, memory, optimization]
composes: []
dependencies: []
formula: "memory_optimization = LRU_cache + WeakMap + virtualization + abort_controller + cleanup_hooks"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Memory Optimization Pattern

## Overview

Memory optimization is critical for long-running Next.js applications, especially SPAs. This pattern covers techniques to prevent memory leaks, optimize data structures, manage caches, and profile memory usage to ensure smooth performance.

## When to Use

- **Long-running SPAs**: Applications users keep open for hours
- **Large data lists**: Tables with thousands of rows
- **Real-time updates**: WebSocket connections, polling
- **Image-heavy pages**: Galleries, e-commerce catalogs
- **Complex state**: Deep state trees, large caches
- **Route transitions**: Cleanup between page navigations

## Composition Diagram

```
+------------------+
|  React Component |
+------------------+
          |
    +-----+-----+-----+
    |     |     |     |
    v     v     v     v
+------+ +-----+ +------+ +--------+
|WeakMap| |LRU  | |Object| |Abort   |
|Cache  | |Cache| |Pool  | |Control |
+------+ +-----+ +------+ +--------+
          |
          v
+------------------+     +------------------+
| Virtualized List | --> | Only Visible DOM |
+------------------+     +------------------+
          |
          v
+------------------+     +------------------+
| Memory Monitor   | --> | GC Trigger       |
| (performance API)|     | (on tab hidden)  |
+------------------+     +------------------+
```

## Implementation

### Memory-Efficient Data Structures

```typescript
// lib/memory/efficient-structures.ts

// Use WeakMap for object-keyed caches (auto GC when key is gone)
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>();
  
  get(key: K): V | undefined {
    return this.cache.get(key);
  }
  
  set(key: K, value: V): void {
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
}

// LRU Cache with size limits
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Delete oldest (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  get size(): number {
    return this.cache.size;
  }
}

// Sliding window buffer for streaming data
export class SlidingWindowBuffer<T> {
  private buffer: T[] = [];
  private maxSize: number;
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }
  
  push(item: T): void {
    this.buffer.push(item);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }
  
  pushMany(items: T[]): void {
    this.buffer.push(...items);
    if (this.buffer.length > this.maxSize) {
      this.buffer = this.buffer.slice(-this.maxSize);
    }
  }
  
  getAll(): T[] {
    return [...this.buffer];
  }
  
  clear(): void {
    this.buffer = [];
  }
}

// Object pool for frequent allocations
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;
  
  constructor(
    factory: () => T,
    reset: (obj: T) => void = () => {},
    maxSize = 50
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }
  
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }
  
  prewarm(count: number): void {
    for (let i = 0; i < Math.min(count, this.maxSize); i++) {
      this.pool.push(this.factory());
    }
  }
}
```

### Memory Leak Prevention Hooks

```typescript
// hooks/use-safe-effect.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';

// Prevent setState on unmounted component
export function useSafeState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (isMountedRef.current) {
      setState(value);
    }
  }, []);
  
  return [state, setSafeState] as const;
}

// Auto-cleanup effect for subscriptions
export function useSubscription<T>(
  subscribe: (callback: (value: T) => void) => () => void,
  callback: (value: T) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  useEffect(() => {
    const unsubscribe = subscribe((value) => {
      callbackRef.current(value);
    });
    
    return unsubscribe;
  }, [subscribe]);
}

// Cleanup timers automatically
export function useTimeout(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setTimeout(() => callbackRef.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

export function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Cleanup event listeners
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = typeof window !== 'undefined' ? window : null
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  
  useEffect(() => {
    if (!element) return;
    
    const eventListener = (event: WindowEventMap[K]) => handlerRef.current(event);
    element.addEventListener(eventName, eventListener as EventListener);
    
    return () => {
      element.removeEventListener(eventName, eventListener as EventListener);
    };
  }, [eventName, element]);
}
```

### Abort Controller Pattern

```typescript
// hooks/use-abortable-fetch.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useAbortableFetch<T>(url: string | null) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!url) return;
    
    // Abort previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, don't update state
        return;
      }
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Unknown error'),
        isLoading: false,
      }));
    }
  }, [url]);
  
  useEffect(() => {
    fetchData();
    
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);
  
  return { ...state, refetch: fetchData };
}

// Multiple concurrent requests with cleanup
export function useAbortableRequests() {
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  
  const createRequest = useCallback((id: string, url: string, options?: RequestInit) => {
    // Abort existing request with same ID
    controllersRef.current.get(id)?.abort();
    
    const controller = new AbortController();
    controllersRef.current.set(id, controller);
    
    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => {
      controllersRef.current.delete(id);
    });
  }, []);
  
  const abortRequest = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
  }, []);
  
  const abortAll = useCallback(() => {
    controllersRef.current.forEach(controller => controller.abort());
    controllersRef.current.clear();
  }, []);
  
  useEffect(() => {
    return () => {
      // Cleanup all on unmount
      controllersRef.current.forEach(controller => controller.abort());
      controllersRef.current.clear();
    };
  }, []);
  
  return { createRequest, abortRequest, abortAll };
}
```

### Virtualized Lists for Large Data

```tsx
// components/virtualized-list.tsx
'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  const { visibleItems, startIndex, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);
  
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Usage example
function LargeList() {
  const items = useMemo(
    () => Array.from({ length: 100000 }, (_, i) => ({ id: i, name: `Item ${i}` })),
    []
  );
  
  return (
    <VirtualizedList
      items={items}
      itemHeight={50}
      containerHeight={500}
      renderItem={(item) => (
        <div className="p-2 border-b">{item.name}</div>
      )}
    />
  );
}
```

### Memory-Conscious State Management

```typescript
// stores/memory-safe-store.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  size: number;
}

interface MemorySafeState {
  cache: Map<string, CacheItem<unknown>>;
  maxCacheSize: number;
  currentSize: number;
  
  // Actions
  set: <T>(key: string, data: T) => void;
  get: <T>(key: string) => T | undefined;
  evict: (key: string) => void;
  clear: () => void;
  prune: (maxAge: number) => void;
}

// Rough size estimation
function estimateSize(obj: unknown): number {
  const str = JSON.stringify(obj);
  return str ? str.length * 2 : 0; // Rough byte estimate
}

export const useMemorySafeStore = create<MemorySafeState>()(
  subscribeWithSelector((set, get) => ({
    cache: new Map(),
    maxCacheSize: 50 * 1024 * 1024, // 50MB limit
    currentSize: 0,
    
    set: <T>(key: string, data: T) => {
      const size = estimateSize(data);
      const state = get();
      
      // Evict old items if over limit
      let newSize = state.currentSize + size;
      const cache = new Map(state.cache);
      
      if (cache.has(key)) {
        const existing = cache.get(key)!;
        newSize -= existing.size;
      }
      
      // LRU eviction if needed
      while (newSize > state.maxCacheSize && cache.size > 0) {
        let oldest: [string, CacheItem<unknown>] | null = null;
        
        for (const entry of cache.entries()) {
          if (!oldest || entry[1].timestamp < oldest[1].timestamp) {
            oldest = entry;
          }
        }
        
        if (oldest) {
          newSize -= oldest[1].size;
          cache.delete(oldest[0]);
        }
      }
      
      cache.set(key, {
        data,
        timestamp: Date.now(),
        size,
      });
      
      set({ cache, currentSize: newSize });
    },
    
    get: <T>(key: string): T | undefined => {
      const item = get().cache.get(key);
      if (item) {
        // Update timestamp on access
        set((state) => {
          const cache = new Map(state.cache);
          cache.set(key, { ...item, timestamp: Date.now() });
          return { cache };
        });
        return item.data as T;
      }
      return undefined;
    },
    
    evict: (key: string) => {
      set((state) => {
        const cache = new Map(state.cache);
        const item = cache.get(key);
        if (item) {
          cache.delete(key);
          return {
            cache,
            currentSize: state.currentSize - item.size,
          };
        }
        return state;
      });
    },
    
    clear: () => {
      set({ cache: new Map(), currentSize: 0 });
    },
    
    prune: (maxAge: number) => {
      const now = Date.now();
      set((state) => {
        const cache = new Map<string, CacheItem<unknown>>();
        let newSize = 0;
        
        for (const [key, item] of state.cache) {
          if (now - item.timestamp < maxAge) {
            cache.set(key, item);
            newSize += item.size;
          }
        }
        
        return { cache, currentSize: newSize };
      });
    },
  }))
);

// Auto-prune on visibility change
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Prune items older than 5 minutes when tab is hidden
      useMemorySafeStore.getState().prune(5 * 60 * 1000);
    }
  });
}
```

### Memory Monitoring Hook

```typescript
// hooks/use-memory-monitor.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

interface MemoryStats {
  current: MemoryInfo | null;
  peak: MemoryInfo | null;
  samples: MemoryInfo[];
  isSupported: boolean;
}

export function useMemoryMonitor(
  options: {
    sampleInterval?: number;
    maxSamples?: number;
    onHighUsage?: (info: MemoryInfo) => void;
    highUsageThreshold?: number;
  } = {}
) {
  const {
    sampleInterval = 5000,
    maxSamples = 60,
    onHighUsage,
    highUsageThreshold = 0.8,
  } = options;
  
  const [stats, setStats] = useState<MemoryStats>({
    current: null,
    peak: null,
    samples: [],
    isSupported: false,
  });
  
  const getMemoryInfo = useCallback((): MemoryInfo | null => {
    if (
      typeof performance !== 'undefined' &&
      'memory' in performance
    ) {
      const memory = (performance as Performance & {
        memory: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }).memory;
      
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, []);
  
  useEffect(() => {
    const info = getMemoryInfo();
    const isSupported = info !== null;
    
    if (!isSupported) {
      setStats(prev => ({ ...prev, isSupported: false }));
      return;
    }
    
    const sample = () => {
      const current = getMemoryInfo();
      if (!current) return;
      
      setStats(prev => {
        const samples = [...prev.samples, current].slice(-maxSamples);
        const peak = !prev.peak || current.usedJSHeapSize > prev.peak.usedJSHeapSize
          ? current
          : prev.peak;
        
        return { current, peak, samples, isSupported: true };
      });
      
      if (current.usagePercentage > highUsageThreshold) {
        onHighUsage?.(current);
      }
    };
    
    sample(); // Initial sample
    const id = setInterval(sample, sampleInterval);
    
    return () => clearInterval(id);
  }, [getMemoryInfo, sampleInterval, maxSamples, onHighUsage, highUsageThreshold]);
  
  const forceGC = useCallback(() => {
    // Only works with --expose-gc flag in Node.js
    if (typeof global !== 'undefined' && 'gc' in global) {
      (global as unknown as { gc: () => void }).gc();
    }
  }, []);
  
  const formatBytes = useCallback((bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let value = bytes;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }, []);
  
  return { ...stats, forceGC, formatBytes };
}
```

### Memory-Efficient Image Loading

```tsx
// components/memory-efficient-image.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface MemoryEfficientImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function MemoryEfficientImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: MemoryEfficientImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (priority) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load 200px before visible
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  // Unload image when far from viewport to free memory
  useEffect(() => {
    if (!isLoaded) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Image is far from viewport, could potentially unload
          // For aggressive memory saving:
          // setIsVisible(false);
          // setIsLoaded(false);
        }
      },
      {
        rootMargin: '-500px', // Consider "far" when 500px away
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [isLoaded]);
  
  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        backgroundColor: '#f0f0f0',
        position: 'relative',
      }}
    >
      {isVisible && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      )}
    </div>
  );
}
```

### Cleanup on Route Change

```typescript
// hooks/use-route-cleanup.ts
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type CleanupFn = () => void;

const cleanupRegistry = new Set<CleanupFn>();

export function registerCleanup(fn: CleanupFn): () => void {
  cleanupRegistry.add(fn);
  return () => cleanupRegistry.delete(fn);
}

export function useRouteCleanup() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Run all cleanup functions on route change
    return () => {
      cleanupRegistry.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
    };
  }, [pathname]);
}

// Usage in a component
function DataHeavyComponent() {
  useEffect(() => {
    const unregister = registerCleanup(() => {
      // Clear cached data
      // Cancel pending requests
      // Reset state
    });
    
    return unregister;
  }, []);
  
  return <div>Heavy data component</div>;
}

// Add to layout
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  useRouteCleanup();
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## Variants

### React Query with Memory Limits

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Garbage collect after 5 minutes of being unused
      gcTime: 5 * 60 * 1000,
      // Keep stale data for 1 minute
      staleTime: 60 * 1000,
      // Limit retries
      retry: 2,
    },
  },
});

// Periodically clear old cache
setInterval(() => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  // Remove queries that haven't been used in 10 minutes
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  
  queries.forEach(query => {
    if (query.state.dataUpdatedAt < tenMinutesAgo) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    }
  });
}, 60 * 1000); // Check every minute
```

## Anti-Patterns

```typescript
// Bad: Event listener leak
function BadComponent() {
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Missing cleanup!
  }, []);
}

// Good: Proper cleanup
function GoodComponent() {
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Bad: Growing array without limit
const allData: Data[] = [];
function addData(item: Data) {
  allData.push(item); // Grows forever!
}

// Good: Bounded buffer
const buffer = new SlidingWindowBuffer<Data>(1000);
function addData(item: Data) {
  buffer.push(item); // Stays at max 1000 items
}

// Bad: Closure capturing stale state
function BadTimer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setInterval(() => {
      console.log(count); // Always logs initial value!
    }, 1000);
  }, []); // Empty deps = stale closure
}

// Good: Use ref for current value
function GoodTimer() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count;
  
  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current); // Always current
    }, 1000);
    return () => clearInterval(id);
  }, []);
}
```

## Related Skills

- `lazy-loading` - Load components on demand
- `virtualized-lists` - Render only visible items
- `web-workers` - Offload memory-heavy processing
- `react-query` - Automatic cache management

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial memory optimization patterns
