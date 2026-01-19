---
id: pt-polling
name: Polling Patterns
version: 2.1.0
layer: L5
category: realtime
description: Implement efficient polling strategies for near real-time updates
tags: [real-time, polling, refetch, intervals, data-sync]
composes: []
dependencies: []
formula: "Polling = useQuery + refetchInterval + Exponential Backoff + Visibility Awareness + Delta Updates"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Polling Patterns

## When to Use

- **Infrequent updates**: Data changes every few minutes/hours
- **Simple infrastructure**: No WebSocket server needed
- **Fallback strategy**: When SSE/WebSocket unavailable
- **Predictable load**: Fixed server request rate
- **Legacy API compatibility**: APIs without streaming support

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Polling Strategies                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Fixed Interval Polling                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Time: 0s    30s   60s   90s   120s  ...           │   │
│  │         │     │     │     │     │                   │   │
│  │         ▼     ▼     ▼     ▼     ▼                   │   │
│  │       fetch fetch fetch fetch fetch                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Exponential Backoff Polling (on no change)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Time: 0s    5s    7.5s  11s   17s   25s   ...     │   │
│  │         │     │      │     │     │     │            │   │
│  │         ▼     ▼      ▼     ▼     ▼     ▼            │   │
│  │       fetch fetch  fetch fetch fetch fetch          │   │
│  │  Interval: 5s → 7.5s → 11s → 17s → 25s (max 60s)   │   │
│  │                                                     │   │
│  │  On change: Reset to 5s                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Visibility-Aware Polling                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tab Active:     5s interval                        │   │
│  │  Tab Hidden:     60s interval (or paused)           │   │
│  │  Tab Refocused:  Immediate fetch + resume 5s       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Long Polling                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Client ─────► Server (waits up to 30s)            │   │
│  │                     │                               │   │
│  │                     │ Event occurs or timeout       │   │
│  │                     ▼                               │   │
│  │  Client ◄───── Response                            │   │
│  │     │                                               │   │
│  │     └────────► Immediately reconnect               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Implement efficient client-side polling for near real-time data updates when WebSockets or SSE aren't necessary or available.

## Overview

Polling is useful when:
- Data changes infrequently
- WebSocket infrastructure isn't available
- Simple implementation is preferred
- Server load needs to be predictable

## Implementation

### React Query Polling

```typescript
// hooks/use-polling.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

interface PollingOptions {
  interval: number;
  enabled?: boolean;
  pauseOnHidden?: boolean;
}

// Basic polling with React Query
export function usePolledData<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options: PollingOptions
) {
  const { interval, enabled = true, pauseOnHidden = true } = options;
  
  return useQuery({
    queryKey,
    queryFn: fetcher,
    refetchInterval: enabled ? interval : false,
    refetchIntervalInBackground: !pauseOnHidden,
    staleTime: interval / 2, // Consider stale halfway through interval
  });
}

// Notifications polling example
export function useNotifications() {
  return usePolledData(
    ["notifications"],
    async () => {
      const res = await fetch("/api/notifications");
      return res.json();
    },
    {
      interval: 30000, // 30 seconds
      pauseOnHidden: true,
    }
  );
}

// Dashboard metrics with adaptive polling
export function useDashboardMetrics() {
  const [pollInterval, setPollInterval] = useState(10000);
  
  const query = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/metrics");
      const data = await res.json();
      
      // Adaptive polling: slow down if no changes
      if (data.unchanged) {
        setPollInterval((prev) => Math.min(prev * 1.5, 60000));
      } else {
        setPollInterval(10000);
      }
      
      return data;
    },
    refetchInterval: pollInterval,
  });
  
  return { ...query, pollInterval };
}
```

### SWR Polling

```typescript
// hooks/use-swr-polling.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Basic SWR polling
export function useOrderStatus(orderId: string) {
  return useSWR(
    `/api/orders/${orderId}/status`,
    fetcher,
    {
      refreshInterval: 5000, // 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // Stop polling when order is complete
      isPaused: () => false,
    }
  );
}

// Conditional polling based on status
export function useConditionalPolling(orderId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/orders/${orderId}`,
    fetcher,
    {
      refreshInterval: (data) => {
        // Stop polling if order is in terminal state
        if (data?.status === "completed" || data?.status === "cancelled") {
          return 0;
        }
        // Poll faster when order is processing
        if (data?.status === "processing") {
          return 2000;
        }
        // Default interval
        return 10000;
      },
    }
  );
  
  return { order: data, error, isLoading };
}
```

### Smart Polling with Exponential Backoff

```typescript
// hooks/use-smart-polling.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";

interface SmartPollingOptions<T> {
  minInterval: number;
  maxInterval: number;
  backoffMultiplier?: number;
  hasChanged?: (prev: T | undefined, current: T) => boolean;
}

export function useSmartPolling<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options: SmartPollingOptions<T>
) {
  const {
    minInterval,
    maxInterval,
    backoffMultiplier = 1.5,
    hasChanged = (prev, curr) => JSON.stringify(prev) !== JSON.stringify(curr),
  } = options;
  
  const [interval, setInterval] = useState(minInterval);
  const previousDataRef = useRef<T | undefined>();
  const unchangedCountRef = useRef(0);
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await fetcher();
      
      // Check if data changed
      const changed = hasChanged(previousDataRef.current, data);
      
      if (changed) {
        // Reset to fast polling on change
        unchangedCountRef.current = 0;
        setInterval(minInterval);
      } else {
        // Back off exponentially
        unchangedCountRef.current++;
        setInterval((prev) =>
          Math.min(prev * backoffMultiplier, maxInterval)
        );
      }
      
      previousDataRef.current = data;
      return data;
    },
    refetchInterval: interval,
  });
  
  return {
    ...query,
    currentInterval: interval,
    resetPolling: () => {
      unchangedCountRef.current = 0;
      setInterval(minInterval);
    },
  };
}

// Usage
export function useActivityFeed() {
  return useSmartPolling(
    ["activity-feed"],
    () => fetch("/api/activity").then((r) => r.json()),
    {
      minInterval: 5000,   // Start at 5 seconds
      maxInterval: 60000,  // Max 1 minute
      backoffMultiplier: 1.5,
      hasChanged: (prev, curr) => prev?.lastId !== curr?.lastId,
    }
  );
}
```

### Long Polling

```typescript
// Long polling for near-instant updates
// hooks/use-long-polling.ts
"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface LongPollingOptions {
  timeout?: number;
  retryDelay?: number;
  maxRetries?: number;
}

export function useLongPolling<T>(
  url: string,
  options: LongPollingOptions = {}
) {
  const { timeout = 30000, retryDelay = 1000, maxRetries = 5 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retriesRef = useRef(0);
  const lastEventIdRef = useRef<string | null>(null);
  
  const poll = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    
    try {
      const params = new URLSearchParams();
      if (lastEventIdRef.current) {
        params.set("lastEventId", lastEventIdRef.current);
      }
      
      const response = await fetch(`${url}?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          "Accept": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      setIsConnected(true);
      setError(null);
      retriesRef.current = 0;
      
      if (result.eventId) {
        lastEventIdRef.current = result.eventId;
      }
      
      if (result.data) {
        setData(result.data);
      }
      
      // Immediately start next poll
      poll();
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return; // Intentional abort
      }
      
      setIsConnected(false);
      setError(err as Error);
      
      // Retry with backoff
      if (retriesRef.current < maxRetries) {
        retriesRef.current++;
        const delay = retryDelay * Math.pow(2, retriesRef.current - 1);
        setTimeout(poll, delay);
      }
    }
  }, [url, retryDelay, maxRetries]);
  
  useEffect(() => {
    poll();
    
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [poll]);
  
  const disconnect = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsConnected(false);
  }, []);
  
  return { data, error, isConnected, disconnect };
}

// Server-side long polling endpoint
// app/api/events/route.ts
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const lastEventId = request.nextUrl.searchParams.get("lastEventId");
  
  // Wait for new events (with timeout)
  const events = await waitForEvents(lastEventId, 25000);
  
  if (events.length === 0) {
    // No events, send heartbeat
    return Response.json({
      eventId: lastEventId,
      data: null,
    });
  }
  
  return Response.json({
    eventId: events[events.length - 1].id,
    data: events,
  });
}

async function waitForEvents(
  lastEventId: string | null,
  timeout: number
): Promise<any[]> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const events = await getNewEvents(lastEventId);
    
    if (events.length > 0) {
      return events;
    }
    
    // Wait a bit before checking again
    await new Promise((r) => setTimeout(r, 100));
  }
  
  return [];
}
```

### Visibility-Aware Polling

```typescript
// hooks/use-visibility-polling.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
}

export function useVisibilityAwarePolling<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options: {
    activeInterval: number;
    backgroundInterval?: number;
    pauseInBackground?: boolean;
  }
) {
  const isVisible = usePageVisibility();
  const { activeInterval, backgroundInterval, pauseInBackground = false } = options;
  
  let interval: number | false = activeInterval;
  
  if (!isVisible) {
    if (pauseInBackground) {
      interval = false;
    } else if (backgroundInterval) {
      interval = backgroundInterval;
    }
  }
  
  return useQuery({
    queryKey,
    queryFn: fetcher,
    refetchInterval: interval,
    refetchOnWindowFocus: true,
  });
}

// Usage
export function useChatMessages(channelId: string) {
  return useVisibilityAwarePolling(
    ["chat", channelId],
    () => fetch(`/api/channels/${channelId}/messages`).then((r) => r.json()),
    {
      activeInterval: 3000,      // Poll every 3s when active
      backgroundInterval: 30000, // Poll every 30s in background
      pauseInBackground: false,  // Keep polling in background
    }
  );
}
```

## Variants

### Debounced Polling with User Activity

```typescript
// hooks/use-activity-polling.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

export function useActivityBasedPolling<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options: {
    activeInterval: number;
    idleInterval: number;
    idleTimeout: number;
  }
) {
  const { activeInterval, idleInterval, idleTimeout } = options;
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, idleTimeout);
    };
    
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer);
    });
    
    resetIdleTimer();
    
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [idleTimeout]);
  
  return useQuery({
    queryKey,
    queryFn: fetcher,
    refetchInterval: isIdle ? idleInterval : activeInterval,
  });
}
```

### Polling with Delta Updates

```typescript
// hooks/use-delta-polling.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

interface DeltaResponse<T> {
  version: number;
  full?: T[];
  added?: T[];
  updated?: T[];
  removed?: string[];
}

export function useDeltaPolling<T extends { id: string }>(
  queryKey: string[],
  fetcher: (version: number) => Promise<DeltaResponse<T>>,
  interval: number
) {
  const versionRef = useRef(0);
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetcher(versionRef.current);
      
      // Full refresh
      if (response.full) {
        versionRef.current = response.version;
        return response.full;
      }
      
      // Apply delta updates
      const currentData = queryClient.getQueryData<T[]>(queryKey) || [];
      let newData = [...currentData];
      
      if (response.removed) {
        newData = newData.filter((item) => !response.removed!.includes(item.id));
      }
      
      if (response.updated) {
        newData = newData.map((item) => {
          const update = response.updated!.find((u) => u.id === item.id);
          return update || item;
        });
      }
      
      if (response.added) {
        newData = [...newData, ...response.added];
      }
      
      versionRef.current = response.version;
      return newData;
    },
    refetchInterval: interval,
  });
}
```

## Anti-patterns

### Polling Without Cleanup

```typescript
// BAD: Memory leak - interval not cleared
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    setInterval(async () => {
      const res = await fetch("/api/data");
      setData(await res.json());
    }, 5000);
    // Missing cleanup!
  }, []);
}

// GOOD: Proper cleanup
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/data");
      setData(await res.json());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
}
```

### Over-Polling

```typescript
// BAD: Polling too frequently
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  refetchInterval: 100, // Every 100ms - too aggressive!
});

// GOOD: Reasonable interval
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  refetchInterval: 30000, // Every 30 seconds
});
```

## Related Skills

- `websockets` - WebSocket connections
- `server-sent-events` - SSE for server push
- `react-query` - Data fetching library
- `swr` - SWR data fetching

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with multiple polling strategies
